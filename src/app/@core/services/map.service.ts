import { Injectable } from "@angular/core";
import { environment } from "@env/environment";
import * as mapboxgl from "mapbox-gl";
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import data from "../../../assets/data.js";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
import * as moment from 'moment';

@Injectable({
  providedIn: "root"
})
export class MapService {
  mapbox = mapboxgl as typeof mapboxgl;
  map: mapboxgl.Map;
  geolocate;
  initialZoom = 10;
  initialLocation: mapboxgl.LngLatLike = [-0.134167, 51.510239];
  userLocation: mapboxgl.LngLatLike;
  dataSearchRadius: any = this.createGeoJSONCircle([-0.134167, 51.510239], 1, 64);

  popupHtml = `<strong>Loading</strong>`;

  constructor(private http:HttpClient) {
    this.mapbox.accessToken = environment.mapBoxToken;
  }

  renderPopup(bike) {
    if (!bike) {
      return `<strong>Loading</strong>`;
    }
    this.popupHtml = `
      <strong>${bike.name}</strong>
      <div class="bike-point">
        <span title="${bike.lastUpdate}">${bike.NbBikes}</span> bikes available.
      </div>
    `;
  }
  //https://api.tfl.gov.uk/BikePoint?app_id=2222&app_key=abcd 10”

  getBikePoint(bikePoint, coordinates) {
    this.http.get<any>(`https://api.tfl.gov.uk/bikepoint/${bikePoint.id}?app_id=db79ada0&app_key=3a32a597715d22e21e5ca3d99c989e6c`).subscribe(
      data => {
        bikePoint.NbBikes = data.additionalProperties[6].value;
        bikePoint.NbEmptyDocks = data.additionalProperties[7].value;
        bikePoint.NbDocks = data.additionalProperties[8].value;
        bikePoint.lastUpdate = moment.utc(data.additionalProperties[6].modified).startOf('hour').fromNow();
        this.renderPopup(bikePoint);
        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(this.popupHtml)
          .addTo(this.map);
      },
      err => console.error(err)
    );
  }

  flyToStart() {
    this.map.flyTo({
      center: this.initialLocation,
      zoom: this.initialZoom
    });
  }

  showSearchRadius() {
    this.dataSearchRadius = this.createGeoJSONCircle(this.userLocation || this.initialLocation, 1, 64);
    this.map.jumpTo({ 'center': this.userLocation, 'zoom': 14 });
    if (this.map.getLayer('polygon')) {
      this.map.removeLayer('polygon');
    }
    if (this.map.getSource('polygon')) {
      this.map.removeSource('polygon');
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
    }
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

  buildMap() {
    this.map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      zoom: this.initialZoom,
      center: this.initialLocation
    });

    this.map.on('load', () => {
      this.geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      });
      this.map.addControl(this.geolocate);

      this.map.addSource("bikes", {
        type: "geojson",
        data: "assets/bikes.geojson"
      });

      this.map.addSource("bikes-cluster", {
        type: "geojson",
        data: "assets/bikes.geojson",
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
      this.map.addLayer({
        id: "point",
        type: "circle",
        source: "bikes",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#11b4da",
          "circle-radius": 4,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#fff"
        }
      });

      this.map.addSource("polygon", {
        type: 'geojson',
        data: this.dataSearchRadius
      });

      // inspect a cluster on click
      this.map.on('click', 'clusters', function (e) {
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
      });

      this.map.on('mouseenter', 'clusters', () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });
      this.map.on('mouseleave', 'clusters', () => {
        this.map.getCanvas().style.cursor = '';
      });
      this.map.setLayoutProperty("clusters", 'visibility', 'none');
      this.map.setLayoutProperty("cluster-count", 'visibility', 'none');
      this.map.setLayoutProperty("unclustered-point", 'visibility', 'none');
      //this.map.toggleSources(false);

      // update user location
      this.geolocate.on('geolocate', (e) => {
        this.userLocation = [e.coords.longitude, e.coords.latitude];
      });
    });
    this.map.addControl(new mapboxgl.NavigationControl());

    var customData = data;

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
    }

    this.map.addControl(new MapboxGeocoder({
      accessToken: this.mapbox.accessToken,
      localGeocoder: forwardGeocoder,
      zoom: 14,
      placeholder: "Enter search",
      mapboxgl: this.mapbox
    }));

    this.addPopupMouseEvents();
  }

  addPopupMouseEvents() {
    this.map.on('click', 'point', (e) => {
      const g: any = e.features[0].geometry;
      var coordinates = g.coordinates.slice();
      var description = e.features[0].properties.description;
       
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
      this.getBikePoint(e.features[0].properties, coordinates);
    });

    this.map.on('mouseenter', 'point', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    this.map.on('mouseleave', 'point', () => {
      this.map.getCanvas().style.cursor = '';
    });

    //unclustered-point
    this.map.on('click', 'unclustered-point', (e) => {
      const g: any = e.features[0].geometry;
      var coordinates = g.coordinates.slice();
      var description = e.features[0].properties.description;
       
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
      this.getBikePoint(e.features[0].properties, coordinates);
    });

    this.map.on('mouseenter', 'unclustered-point', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    this.map.on('mouseleave', 'unclustered-point', () => {
      this.map.getCanvas().style.cursor = '';
    });
  }
}
