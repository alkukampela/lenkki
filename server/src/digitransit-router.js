const axios = require('axios')
const gsonEncoder = require('./gson-encoder.js')

const URI = 'https://api.digitransit.fi/routing/v1/routers/finland/index/graphql'
const QUERY = `
  query RouteQuery($fromPoint:  InputCoordinates!,
                    $toPoint:  InputCoordinates!,
                    $waypoints: [InputCoordinates]) {
    plan(
      from: $fromPoint,
      to: $toPoint,
      intermediatePlaces: $waypoints,
      modes: "BICYCLE",
      walkReluctance: 3.1,
      walkBoardCost: 600,
      minTransferTime: 180,
      walkSpeed: 0.2,
      maxWalkDistance: 10000
    ) {
      itineraries{
        walkDistance,
        legs {
          mode
          from {
            lat
            lon
          },
          to {
            lat
            lon
          },
          legGeometry {
            length
            points
          }
        }
      }
    }
  }
`
const ENDPOINT_ADJUSTER = 0.0002

class DigitransitRouter {
  async getRoute(startPoint, waypoints) {

    const variables = {
      fromPoint: {lat: startPoint.lat, lon: startPoint.lng},
      // Digitransit planner doesn't work if startpoint and endpoint are same
      toPoint: {lat: startPoint.lat, lon: startPoint.lng + ENDPOINT_ADJUSTER},
      waypoints: waypoints.map(x => { return {lat: x.lat, lon: x.lng}})
    }

    const requestPayload = JSON.stringify({
      query: QUERY,
      variables
    })

    const requestStart = Date.now()
    const result = await axios.post(URI, requestPayload,
      {
        headers: { 'Content-Type': 'application/json' }
      })

    if (result.status !== 200 ||
        result.data.errors ||
        result.data.data.plan.itineraries.length == 0) {
      throw('Could not generate a route')
    }

    console.log('Routing request took: '+ (Date.now() - requestStart) + ' ms')

    const polylines = []

    const firstItinerary = result.data.data.plan.itineraries[0]
    const routeLength = firstItinerary.walkDistance / 1000

    firstItinerary.legs.forEach(leg => polylines.push(leg.legGeometry.points))

    const routePoints = gsonEncoder(polylines, waypoints, true)

    console.log(routeLength)

    return {
      routePoints,
      routeLength
    }
  }
}
module.exports = DigitransitRouter
