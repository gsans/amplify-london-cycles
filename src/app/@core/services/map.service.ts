import { Injectable } from "@angular/core";
import { environment } from "@env/environment";
import * as mapboxgl from "mapbox-gl";
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
//import data from "../../../assets/data.js";
import * as moment from 'moment';
import { APIService } from '../../API.service';
import { MapboxGLButtonControl } from './mapbox-control';

@Injectable({
  providedIn: "root"
})
export class MapService {
  mapbox = mapboxgl as typeof mapboxgl;
  map: mapboxgl.Map;
  geolocate;
  initialZoom = 14;
  initialLocation: mapboxgl.LngLatLike = [-0.134167, 51.510239];
  userLocation: mapboxgl.LngLatLike;
  dataSearchRadius: any = this.createGeoJSONCircle([-0.134167, 51.510239], 0.5, 64);
  loading: boolean = true;
  searchResults;
  persons = 1;
  searching = false;

  popupHtml = `<strong>Loading</strong>`;

  constructor(private api: APIService) {
    this.mapbox.accessToken = environment.mapBoxToken;
  }

  renderPopup(bike) {
    if (!bike) {
      return `<strong>Loading</strong>`;
    }
    this.popupHtml = `
      <strong>${bike.name}</strong>
      <div class="bike-point">
        <span title="${bike.NbBikes}">${bike.NbBikes}</span> bikes available.
      </div>
    `;
  }
  //https://api.tfl.gov.uk/BikePoint?app_id=2222&app_key=abcd 10”

  getBikePoint(bikePoint, coordinates) {
    this.map.flyTo({
      center: coordinates,
      speed: 0.25
    });
    this.api.GetBikePoint(bikePoint.id).then(
      data => {
        bikePoint.NbBikes = data.bikes || "0";
        this.renderPopup(bikePoint);
        new mapboxgl.Popup({ offset: [0, -18] })
          .setLngLat(coordinates)
          .setHTML(this.popupHtml)
          .addTo(this.map);
      })
      .catch(
        err => console.error(err)
      );
  }

  flyToStart() {
    this.map.flyTo({
      center: this.initialLocation,
      zoom: this.initialZoom,
      speed: 0.5
    });
    //setTimeout(()=>this.map.setCenter(this.initialLocation), 1500);
  }

  search() {
    if(this.searching) return;
    this.searching = true;
    //clear current search if any
    if (this.map.getLayer('search-results')) {
      this.map.removeLayer('search-results');
    }
    if (this.map.getLayer('search-labels')) {
      this.map.removeLayer('search-labels');
    }
    if (this.map.getSource('search')) {
      this.map.removeSource('search');
    }

    const center = this.map.getCenter();
    const location = { lon: center.lng, lat: center.lat };
    const coor = [location.lon, location.lat];

    //zoom and center
    this.map.flyTo({
      center: center,
      zoom: this.initialZoom
    });

    //draw search radius
    this.drawSearchRadius(coor);

    //search
    this.api.NearbyBikeStations(location).then(event => {
      this.loading = false;
      const bikepoints: any = {
        "type": "FeatureCollection",
        "features": []
      }
      event.items.forEach((p) => {
        bikepoints.features.push({
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [p.location.lon, p.location.lat]
          },
          "properties": {
            "id": p.id,
            "name": p.name,
            "bikes": p.bikes || Math.floor(Math.random() * 16)
          }
        })
      });
      this.map.addSource("search", {
        type: "geojson",
        data: bikepoints,
      });
      this.map.addLayer({
        'id': 'search-results',
        'type': 'circle',
        'source': "search",
        'paint': {
          'circle-radius': {
            stops: [[8, 1], [11, 4], [14, 15]]
          },
          'circle-color': [
            "step", ["get", "bikes"],
            "#f55d5d", this.persons, "#ffb501"
          ]
        }
      });
      this.map.addLayer({
        "id": "search-labels",
        "type": "symbol",
        "source": "search",
        "layout": {
          "text-field": "{bikes}",
          "text-font": [
            "DIN Offc Pro Medium",
            "Arial Unicode MS Bold"
          ],
          "text-size": {
            stops: [[8, 1], [11, 6], [14, 12]]
          }
        }
      });
      this.addMouseEventsToLayer('search-results');
      if (this.map.getLayer('polygon')) {
        this.map.removeLayer('polygon');
      }
      if (this.map.getSource('polygon')) {
        this.map.removeSource('polygon');
      }
      if (this.map.getLayer('searching-text')) {
        this.map.removeLayer('searching-text');
      }
      if (this.map.getSource('searching')) {
        this.map.removeSource('searching');
      }
      this.searching = false;
    });
  }

  drawSearchRadius(location) {
    this.dataSearchRadius = this.createGeoJSONCircle(location, 0.5, 64);
    this.map.jumpTo({ 'center': {lon: location[0],lat: location[1] }, 'zoom': 14 });
    if (this.map.getLayer('polygon')) {
      this.map.removeLayer('polygon');
    }
    if (this.map.getSource('polygon')) {
      this.map.removeSource('polygon');
    }

      this.map.addSource("polygon", {
        type: 'geojson',
        data: this.dataSearchRadius
      });
      this.map.addLayer({
        "id": "polygon",
        "type": "fill",
        "source": "polygon",
        "layout": {},
        "paint": {
          "fill-color": "#3f51b5",
          "fill-opacity": 0.2
        }
      });

      if (this.map.getLayer('searching-text')) {
        this.map.removeLayer('searching-text');
      }
      if (this.map.getSource('searching')) {
        this.map.removeSource('searching');
      }
      this.map.addSource("searching", {
        type: 'geojson',
        data: ({
          "type": "FeatureCollection",
          "features": [{
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": location
            }
          }]
        }) as any
      });
      this.map.addLayer({
        id: "searching-text",
        type: "symbol",
        source: "searching",
        layout: {
          "text-field": "Searching...",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 18
        }
      });
  }

  toggleSources(active) {
    if (!active) {
      this.map.setLayoutProperty("point", 'visibility', 'visible');
      this.map.setLayoutProperty("clusters", 'visibility', 'none');
      this.map.setLayoutProperty("cluster-count", 'visibility', 'none');
      this.map.setLayoutProperty("unclustered-point", 'visibility', 'none');
    } else {
      this.map.setLayoutProperty("point", 'visibility', 'none');
      this.map.setLayoutProperty("clusters", 'visibility', 'visible');
      this.map.setLayoutProperty("cluster-count", 'visibility', 'visible');
      this.map.setLayoutProperty("unclustered-point", 'visibility', 'visible');
    }
  }

  setPersons(number) {
    this.persons = number;
  }

  createGeoJSONCircle(center, km, points = 64): any {
    var coords = {
      latitude: center[1],
      longitude: center[0]
    };

    var ret = [];
    var distanceX = km / (111.320 * Math.cos(coords.latitude * Math.PI / 180));
    var distanceY = km / 110.574;

    var theta, x, y;
    for (var i = 0; i < points; i++) {
      theta = (i / points) * (2 * Math.PI);
      x = distanceX * Math.cos(theta);
      y = distanceY * Math.sin(theta);

      ret.push([coords.longitude + x, coords.latitude + y]);
    }
    ret.push(ret[0]);

    return {
      "type": "FeatureCollection",
      "features": [{
        "type": "Feature",
        "geometry": {
          "type": "Polygon",
          "coordinates": [ret]
        }
      }]
    };
  };

  toggleBikes() {
    if (this.map.getLayer('point')) {
      this.map.removeLayer('point');
    } else {
      this.map.addLayer({
        id: "point",
        type: "circle",
        source: "bikes",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "rgba(190, 190, 190, 0.62)",
          "circle-radius": {
            stops: [[8, 1], [11, 4], [14, 15]]
          },
          "circle-stroke-width": 1,
          "circle-stroke-color": "transparent"
        }
      });
      this.addMouseEventsToLayer('point');
    }
  }

  buildMap() {
    this.map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/light-v10",
      zoom: this.initialZoom,
      center: this.initialLocation
    });

    this.map.on('load', () => {
      const ctrlReset = new MapboxGLButtonControl({
        className: "reset",
        title: "Reset Location",
        eventHandler: this.flyToStart.bind(this)
      });
      this.map.addControl(ctrlReset, "top-left");

      const ctrlToggleBikes = new MapboxGLButtonControl({
        className: "bikes",
        title: "Toggle bikes",
        eventHandler: this.toggleBikes.bind(this)
      });
      this.map.addControl(ctrlToggleBikes, "top-left");

      const ctrlSearch = new MapboxGLButtonControl({
        className: "search",
        title: "Find bikes here",
        eventHandler: this.search.bind(this),
        caption: "Find bikes here"
      });
      this.map.addControl(ctrlSearch, "top-right");

      this.map.addControl(new mapboxgl.ScaleControl());
      this.geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      });
      this.map.addControl(this.geolocate, "top-left");

      this.map.addSource("bikes", {
        type: "geojson",
        data: "assets/bikes.geojson"
        //data: "assets/bikes.geojson"
      }); 

      // Clustered sourcee/views
/*       this.map.addSource("bikes-cluster", {
        type: "geojson",
        data: data,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
      });

      this.map.addLayer({
        id: "clusters",
        type: "circle",
        source: "bikes-cluster",
        filter: ["has", "point_count"],
        paint: {
          // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
          // with three steps to implement three types of circles:
          //   * Blue, 20px circles when point count is less than 100
          //   * Yellow, 30px circles when point count is between 100 and 750
          //   * Pink, 40px circles when point count is greater than or equal to 750
          "circle-color": [
            "step", ["get", "point_count"],
            "#51bbd6", 100, "#f1f075", 750, "#f28cb1"
          ],
          "circle-radius": [
            "step", ["get", "point_count"],
            20, 100, 30, 750, 40
          ]
        }
      });

      this.map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "bikes-cluster",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12
        }
      }); 

      this.map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "bikes-cluster",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#11b4da",
          "circle-radius": 4,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff"
        }
      });
      */

      this.map.addSource("polygon", {
        type: 'geojson',
        data: this.dataSearchRadius
      });

      /*       data.features.forEach((marker) => {
              // create a HTML element for each feature
              var el = document.createElement('div');
              el.className = 'marker';
            
              // make a marker for each feature and add to the map
              new mapboxgl.Marker(el)
                .setLngLat(marker.geometry.coordinates)
                .addTo(this.map);
            }); */

      // inspect a cluster on click
/*       this.map.on('click', 'clusters', function (e) {
        var features = this.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        var clusterId = features[0].properties.cluster_id;
        this.getSource('bikes-cluster').getClusterExpansionZoom(clusterId, function (err, zoom) {
          if (err)
            return;

          this.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom
          });
        }.bind(this));
      }); */

/*       this.map.on('mouseenter', 'clusters', () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });
      this.map.on('mouseleave', 'clusters', () => {
        this.map.getCanvas().style.cursor = '';
      });
      this.map.setLayoutProperty("clusters", 'visibility', 'none');
      this.map.setLayoutProperty("cluster-count", 'visibility', 'none');
      this.map.setLayoutProperty("unclustered-point", 'visibility', 'none'); */
      //this.map.toggleSources(false);

      // update user location
      this.geolocate.on('geolocate', (e) => {
        this.userLocation = [e.coords.longitude, e.coords.latitude];
      });
    });
    this.map.addControl(new mapboxgl.NavigationControl(), "top-left");

/*     var customData = data;

    function forwardGeocoder(query) {
      var matchingFeatures = [];
      for (var i = 0; i < customData.features.length; i++) {
        var feature = customData.features[i];
        if (feature.properties.name.toLowerCase().search(query.toLowerCase()) !== -1) {
          feature['place_name'] = '🚲 ' + feature.properties.name;
          feature['center'] = feature.geometry.coordinates;
          matchingFeatures.push(feature);
        }
      }
      return matchingFeatures;
    } */

    this.map.addControl(new MapboxGeocoder({
      accessToken: this.mapbox.accessToken,
      //localGeocoder: forwardGeocoder,
      zoom: 14,
      placeholder: "Enter search",
      mapboxgl: this.mapbox
    }));
  }

  addMouseEventsToLayer(layer) {
    if(this.map.getLayer(layer)){
      this.map.on('click', layer, (e) => {
        const g: any = e.features[0].geometry;
        var coordinates = g.coordinates.slice();
        var description = e.features[0].properties.description;
  
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        this.getBikePoint(e.features[0].properties, coordinates);
      });
  
      this.map.on('mouseenter', layer, () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });
  
      this.map.on('mouseleave', layer, () => {
        this.map.getCanvas().style.cursor = '';
      });
    }
  }
}
