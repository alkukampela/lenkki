# L.E.N.K.K.I server

Backend for roundtrip planner

## Build Setup

```bash
# install dependencies
npm install

# serve with hot reload at localhost:16044
gulp

```

## Config

Add configuration.js file to src/ directory.

File structure:

```javascript

class Configuration {
  constructor() {
    this.mapApiKey = 'xxx'
    this.roadsApiKey = 'xxx'
    this.directionsApiKey = 'xxx'
  }
}
module.exports = Configuration

```

## Api

### GET /locate?address={address}

Returns location of given address centered to nearest road

### GET /maps-api

Wrapper for Google Maps JS-library.

### POST /

Plans a route
