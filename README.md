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

## Deploy with the AWS Amplify Console

The AWS Amplify Console provides hosting for fullstack serverless web apps. [Learn more](https://console.amplify.aws). Deploy this app to your AWS account with a single click:

[![amplifybutton](https://oneclick.amplifyapp.com/button.svg)](https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/gsans/amplify-london-bikes)

The Amplify Console will fork this repo in your GitHub account, and then build and deploy your backend and frontend in a single workflow. Your app will be available at `https://master.APPID.amplifyapp.com`.

## Run locally with the Amplify CLI

1. Install and configure the Amplify CLI

```
  npm install -g @aws-amplify/cli
  amplify configure
```

2. Install and configure the Amplify CLI

```
  amplify init --app https://github.com/gsans/amplify-london-bikes
```
  
>The init command clones the GitHub repo, initializes the CLI, creates a ‘sampledev’ environment in CLI, detects and adds categories, provisions the backend, pushes the changes to the cloud, and starts the app.

3. Provisioning the frontend and backend

Once the process is complete, the CLI will automatically open the app in your default browser.