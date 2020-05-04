import { Injectable } from "@angular/core";
import { environment } from "@env/environment";
import * as mapboxgl from "mapbox-gl";
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
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
  loading: boolean = true;
  searchResults;
  emptyGeoJSON: any = {
    'type': 'FeatureCollection',
    'features': []
  };
  searching = false;
  popups = [];

  constructor(private api: APIService) {
    this.mapbox.accessToken = environment.mapBoxToken;
  }

  renderPopup(bikePoint): string {
    return `<strong>${bikePoint.name}</strong>
      <div class="bike-point">
        <span title="${bikePoint.bikes}">${bikePoint.bikes || '0'}</span> bikes available.
      </div>`;
  }
  //https://api.tfl.gov.uk/BikePoint?app_id=2222&app_key=abcd

  closeAllPopups() {
    this.popups.forEach(popup => popup.remove());
  }

  getBikePoint(id, coordinates) {
    // center map using bike station coordinates
    this.map.flyTo({ center: coordinates, speed: 0.25 });

    // call GraphQL api to get live data using the HTTP resolver
    this.api.GetBikePoint(id).then(
      data => {
        const bikePoint = { ...data };
        this.addToSearchResults(bikePoint);
        this.setSourceData('search', this.searchResults);
        this.closeAllPopups();
        this.popups.push(new mapboxgl.Popup({ offset: [0, -18] })
          .setLngLat(coordinates)
          .setHTML(this.renderPopup(bikePoint))
          .addTo(this.map));
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
  }

  findBikes() {
    this.closeAllPopups();
    if (this.searching) return;
    this.searching = true;
    this.clearSourceData(['search']);

    const center = this.map.getCenter();
    const mapCenter = { lon: center.lng, lat: center.lat };

    // zoom and center
    this.map.flyTo({ center, zoom: this.initialZoom });

    // draw search radius
    this.renderSearchRange(mapCenter);

    // find nearby bike stations
    this.api.NearbyBikeStations(mapCenter).then(result => {
      this.loading = false;
      this.searchResults = {
        'type': 'FeatureCollection',
        'features': []
      };
      result.items.forEach(p => this.addToSearchResults(p));
      this.setSourceData('search', this.searchResults);
      this.addPopUpToLayer('search-results');
      this.clearSourceData(['searching-range', 'searching-label']);
      this.searching = false;
    });
  }

  renderSearchRange(location) {
    this.map.jumpTo({ 'center': location, 'zoom': 14 });
    
    // render search range
    const searchRange = this.createGeoJSONRange(location);
    this.setSourceData('searching-range', searchRange);
    
    // render searching... label
    const searchRangeLocation = {
      'type': 'FeatureCollection',
      'features': [{
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [location.lon, location.lat]
        }
      }]
    };
    this.setSourceData('searching-label', searchRangeLocation);
  }

  setSourceData(source, data){
    const s = this.map.getSource(source) as mapboxgl.GeoJSONSource;
    s && s.setData(data);
  }

  clearSourceData(sources) {
    sources.forEach(source => {
      this.setSourceData(source, {
        'type': 'FeatureCollection',
        'features': []
      });
    });
  }

  createGeoJSONRange(center, m = 500, points = 60): any {
    let polygon = [];
    const rangeX = m / (111320 * Math.cos(center.lat * Math.PI / 180));
    const rangeY = m / 110574;
    let theta, x, y;

    for (var i = 0; i < points; i++) {
      theta = (i / points) * (2 * Math.PI);
      x = rangeX * Math.cos(theta);
      y = rangeY * Math.sin(theta);
      polygon.push([center.lon + x, center.lat + y]);
    }
    polygon.push(polygon[0]);

    return {
      'type': 'FeatureCollection',
      'features': [{
        'type': 'Feature',
        'geometry': {
          'type': 'Polygon',
          'coordinates': [polygon]
        }
      }]
    };
  };

  addToSearchResults(bikePoint) {
    this.searchResults.features.push({
      'type': 'Feature',
      'geometry': {
        'type': 'Point',
        'coordinates': [bikePoint.location.lon, bikePoint.location.lat]
      },
      'properties': {
        'id': bikePoint.id,
        'name': bikePoint.name,
        'bikes': bikePoint.bikes
      }
    });
  }

  toggleBikes() {
    this.closeAllPopups();

    if (this.map.getLayer('bike-stations')) {
      this.map.removeLayer('bike-stations');
      return;
    }
    // avoid rendering over search results
    const overlay = this.map.getLayer('search-results') ? 'search-results' : undefined;
    this.map.addLayer({
      id: 'bike-stations',
      type: 'circle',
      source: 'bike-stations',
      paint: {
        'circle-color': 'rgba(190, 190, 190, 0.62)',
        'circle-radius' : [
          'interpolate', ['linear'], ['zoom'],
          8, 1, 11, 4, 14, 15
        ],
      }
    }, overlay);
    this.addPopUpToLayer('bike-stations');
  }

  buildMap() {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v10',
      zoom: this.initialZoom,
      center: this.initialLocation
    });
    this.addMapControls();

    this.map.on('load', () => {
      this.map.addSource('bike-stations', {
        type: 'geojson',
        data: 'assets/bikes.geojson'
      });

      this.map.addSource('search', {
        type: 'geojson',
        data: this.emptyGeoJSON
      });
      this.map.addLayer({
        'id': 'search-results',
        'type': 'circle',
        'source': 'search',
        'paint': {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            8, 1, 11, 4, 14, 15
          ],
          'circle-color': '#FF9900',
        }
      });
      this.map.addLayer({
        'id': 'search-labels',
        'type': 'symbol',
        'source': 'search',
        'layout': {
          'text-field': '{bikes}',
          'text-font': [
            'DIN Offc Pro Medium',
            'Arial Unicode MS Bold'
          ],
          'text-size': [
            'interpolate', ['linear'], ['zoom'],
            8, 1, 11, 6, 14, 12
          ]
        },
        paint: { 'text-color': '#333' }
      });

      this.map.addSource('searching-range', { 
        type: 'geojson',
        data: this.emptyGeoJSON
      });
      this.map.addLayer({
        'id': 'searching-range',
        'type': 'fill',
        'source': 'searching-range',
        'paint': { 'fill-color': 'rgba(202, 210, 211,0.3)' }
      });

      this.map.addSource('searching-label', { 
        type: 'geojson',
        data: this.emptyGeoJSON
      });
      this.map.addLayer({
        id: 'searching-label',
        type: 'symbol',
        source: 'searching-label',
        layout: {
          'text-field': 'Searching...',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'],
            8, 1, 12, 6, 14, 18 ]
        },
        'paint': { 'text-color': '#333' }
      });
    });
  }

  addMapControls() {
    // Navigation buttons group (label #1)
    this.map.addControl(new mapboxgl.NavigationControl(), 'top-left');

    // Reset button (label #2)
    const customReset = new MapboxGLButtonControl({
      className: 'reset',
      title: 'Reset Location',
      eventHandler: this.flyToStart.bind(this)
    });
    this.map.addControl(customReset, 'top-left');

    // Bikes toggle button (label #3)
    const customBikesToggle = new MapboxGLButtonControl({
      className: 'bikes',
      title: 'Toggle bikes',
      eventHandler: this.toggleBikes.bind(this)
    });
    this.map.addControl(customBikesToggle, 'top-left');

    // Geolocate button (label #4)
    this.geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    });
    this.map.addControl(this.geolocate, 'top-left');
    this.geolocate.on('geolocate', e => {
      this.userLocation = [e.coords.longitude, e.coords.latitude];
    });

    // Scale control (label #5)
    this.map.addControl(new mapboxgl.ScaleControl());

    // Geocoder search input (label #6)
    this.map.addControl(new MapboxGeocoder({
      accessToken: this.mapbox.accessToken,
      zoom: 14,
      placeholder: 'Enter search',
      mapboxgl: this.mapbox
    }));

    // Find bikes button (label #7)
    const customFindBikes = new MapboxGLButtonControl({
      className: 'search',
      title: 'Find bikes here',
      eventHandler: this.findBikes.bind(this),
      caption: 'Find bikes here'
    });
    this.map.addControl(customFindBikes, 'top-right');
  }

  addPopUpToLayer(layer) {
    if (!this.map.getLayer(layer)) return;
    this.map.on('click', layer, e => {
      const feature: GeoJSON.Feature = e.features[0];
      const geometry: any = feature.geometry;
      const coordinates = geometry.coordinates.slice();
      this.getBikePoint(feature.properties.id, coordinates);
    });

    this.map.on('mouseenter', layer, () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map.on('mouseleave', layer, () => {
      this.map.getCanvas().style.cursor = '';
    });
  }
}
