const axios = require('axios')
const gsonEncoder = require('./gson-encoder.js')

const DIRECTIONS_API_URL = 'https://maps.googleapis.com/maps/api/directions/json?'

const convertToQueryParam = (points) => points.map(x => x.lat + ',' + x.lng).join('|')

const calculateRouteLenght = (legs) => {
  const lenghtInMeters = legs.reduce((acc, cur) => acc + cur.distance.value, 0)
  return Math.round((lenghtInMeters/1000) * 10) / 10
}

class GoogleRouter {
  constructor(configuration) {
    this.directionsApiKey = configuration.directionsApiKey
  }

  async getRoute(startPoint, waypoints) {
    const locationParam = startPoint.lat+','+startPoint.lng
    const waypointsParam = convertToQueryParam(waypoints)
    const apiUri = `${DIRECTIONS_API_URL}origin=${locationParam}&destination=${locationParam}&waypoints=${waypointsParam}&avoid=highways&mode=bicycling&key=${this.directionsApiKey}`

    const response = await axios.get(apiUri)

    if (response.data.routes.length == 0) {
      throw('Could not generate a route')
    }

    const route = response.data.routes[0]
    const routeLength = calculateRouteLenght(route.legs)

    const polylines = []
    polylines.push(route.overview_polyline.points)

    const routePoints =
      gsonEncoder(polylines, waypoints, true)

    return {
      routePoints,
      routeLength
    }
  }

}
module.exports = GoogleRouter
