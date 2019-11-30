# Elastic Search Setup
```
# Create the index if it does not exist
PUT /bikepoint
```
Result
```
{
  "acknowledged": true,
  "shards_acknowledged": true,
  "index": "bikepoint"
}
```

```
# Tell Elasticsearch that the location field is a geo_point
PUT /bikepoint/_mapping/doc
{
  "properties": {
    "location": {
      "type": "geo_point"
    }
  }
}
```
Result 
```
{
  "acknowledged": true
}
```

Create BikePoint
```
mutation addBikePoint {
  m0: createBikePoint(input: { id: "BikePoints_1" name: "River Street , Clerkenwell" location: { lat: 51.529163 lon: -0.10997 } }) { id }
}
```

Query
```
query nearByBikes {
  nearbyBikeStations(location:{
    lon: -0.134167
    lat: 51.510239
  } km: 3) {
    items {
      id name location { lon lat }
    }
  }
}
```

Searches
```
GET /bikepoint/_search
{
  "query": { "match_all": {} }
}

GET /bikepoint/doc/_search
{
  "query": { "match_all": {} }
}
```

Search Radius around location
```
GET /bikepoint/doc/_search
{
  "from" : 0, 
  "size" : 20,  
  "query": {
    "bool" : {
      "must" : {
        "match_all" : {}
      },
      "filter" : {
        "geo_distance" : {
          "distance" : "1km",
          "location" : {
            "lon": -0.134167,
            "lat": 51.510239
          }
        }
      }
    }
  }
}
```


# AmplifyLondonBikes

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.20.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
