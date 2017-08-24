const LatLon = require('geodesy').LatLonSpherical
const _ = require('underscore')
const axios = require('axios')
const gaussian = require('gaussian')

const ROAD_POINT_API_URL = 'https://roads.googleapis.com/v1/nearestRoads'
const VARIANCE_FACTOR = 0.35

const getRandomPoints = (lat, long, distance, minAngle, maxAngle, amount) => {
  const fromPoint = new LatLon(lat, long)

  // use Array.from?
  let points = []
  _(amount).times(() => {
    points.push(raffleOnePoint(fromPoint, distance, minAngle, maxAngle))
  })

  return points
}

const raffleOnePoint = (fromPoint, targetDistance, minAngle, maxAngle) => {
  const distribution =
    gaussian(targetDistance, targetDistance * VARIANCE_FACTOR)
  var pointDistance = distribution.ppf(Math.random()) * 1000

  const bearing = Math.random() * (maxAngle - minAngle) + minAngle
  const newPoint = fromPoint.destinationPoint(pointDistance, bearing)

  return {lat: newPoint.lat, lng: newPoint.lon}
}

const convertToQueryParam = (points) => points.map(x => x.lat + ',' + x.lng).join('|')

const centerwaypointsToRoads = async(waypoints, roadsApiKey) => {
  const pointsParam = convertToQueryParam(waypoints)
  const apiUri = `${ROAD_POINT_API_URL}?points=${pointsParam}&key=${roadsApiKey}`

  const response = await axios.get(apiUri)
  const indexes = []
  const centeredWaypoints = []

  if (!response.data.snappedPoints || response.data.snappedPoints.length == 0) {
    throw('Generated waypoints couldn\'t be centered to road')
  }

  for (let snappedPoint of response.data.snappedPoints) {
    if (!indexes.includes(snappedPoint.originalIndex)) {
      centeredWaypoints.push({
        lat: snappedPoint.location.latitude,
        lng: snappedPoint.location.longitude
      })
      indexes.push(snappedPoint.originalIndex)
    }
  }

  return centeredWaypoints
}

class WaypointGenerator {
  constructor(configuration) {
    this.roadsApiKey = configuration.roadsApiKey
  }

  async getWaypoints(fromPoint, distance, amount, minAngle = 0, maxAngle = 360) {

    // Get extra points because they might be not close enough to road.
    const pointCandidates = getRandomPoints(
      fromPoint.lat,
      fromPoint.lng,
      distance,
      minAngle,
      maxAngle,
      amount * 10)

    let centeredwaypoints = {}
    try {
      centeredwaypoints =
        await centerwaypointsToRoads(pointCandidates, this.roadsApiKey)
    } catch (error) {
      throw(error)
    }

    if (centeredwaypoints.length < amount) {
      throw('Could not find waypoints from point')
    }

    return centeredwaypoints.slice(0, amount)
  }

}
module.exports = WaypointGenerator
