import { Injectable } from "@angular/core";
import { environment } from "@env/environment";
import * as mapboxgl from "mapbox-gl";

@Injectable({
  providedIn: "root"
})
export class MapService {
  mapbox = mapboxgl as typeof mapboxgl;
  map: mapboxgl.Map;
  constructor() {
    this.mapbox.accessToken = environment.mapBoxToken;
  }
  buildMap() {
    this.map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      zoom: 10,
      center: [-0.134167, 51.510239]
    });
    this.map.on('load', function () {
      debugger;
      this.addSource("bikes", {
        type: "geojson",
        data: "assets/bikes.geojson",
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
      });

      this.addLayer({
        id: "clusters",
        type: "circle",
        source: "bikes",
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

      this.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "bikes",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12
        }
      });

      this.addLayer({
        id: "unclustered-point",
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

      // inspect a cluster on click
      this.on('click', 'clusters', function (e) {
        var features = this.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        var clusterId = features[0].properties.cluster_id;
        this.getSource('bikes').getClusterExpansionZoom(clusterId, function (err, zoom) {
          if (err)
            return;

          this.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom
          });
        }.bind(this) );
      });

      this.on('mouseenter', 'clusters', function () {
        this.getCanvas().style.cursor = 'pointer';
      });
      this.on('mouseleave', 'clusters', function () {
        this.getCanvas().style.cursor = '';
      });
    });
    this.map.addControl(new mapboxgl.NavigationControl());
  }
}
