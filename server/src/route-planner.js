const LatLon = require('geodesy').LatLonSpherical
const tspSolver = require('node-tspsolver')

const INITIAL_POINTS = 2
const INITIAL_POINTS_DISTANCE_FACTOR = .24
const ROUTE_POINT_MIN_RELATIVE_DISTANCE = .04
const ALLOWED_LENGTH_OFFSET = .03
const RAFFLE_POINT_FACTOR = 0.45

const generateAndInsertWaypoint =
async(routePlanner, waypoints, startPoint, remaining) => {
  const chosenPoint = waypoints[Math.floor(Math.random()*waypoints.length)]
  const distance = remaining * RAFFLE_POINT_FACTOR

  const bearingToStart = getBearingToStartPoint(chosenPoint, startPoint)

  const raffledPoints =
    await routePlanner.waypointGenerator.getWaypoints(chosenPoint, distance, 1,
      bearingToStart - 90, bearingToStart + 90)
  if (raffledPoints.length == 0) {
    throw('Error while generating a waypoint')
  }

  waypoints.push(raffledPoints.pop())

  return await sort(waypoints, startPoint)
}

const getBearingToStartPoint = (chosenPoint, startPoint) => {
  const chosenPointLatLon = new LatLon(chosenPoint.lat, chosenPoint.lng)
  const startPointLatLon = new LatLon(startPoint.lat, startPoint.lng)
  return chosenPointLatLon.bearingTo(startPointLatLon)
}

const sort = async(waypoints, startPoint) => {
  const costMatrix = calculateMatrix([startPoint, ...waypoints])
  const order = await tspSolver.solveTsp(costMatrix, true, {})

  // Remove startpoint from each end of the order
  order.shift()
  order.pop()
  // Adjust indexes to match waypoint array
  order.forEach((v,i) => {order[i] = v-1})

  const orderedwaypoints = []
  for (let index of order) {
    orderedwaypoints.push(waypoints[index])
  }
  return orderedwaypoints
}

const calculateMatrix = (coordinates) => {
  const costMatrix =
    Array(coordinates.length).fill().map(() => Array(coordinates.length))

  for (let i=0; i < coordinates.length; ++i) {
    const point1 = new LatLon(coordinates[i].lat, coordinates[i].lng)
    for (let j=i; j < coordinates.length; ++j) {
      if (i === j) {
        costMatrix[i][j] = 0
      }
      else {
        const point2 = new LatLon(coordinates[j].lat, coordinates[j].lng)
        const dist = point1.distanceTo(point2)
        costMatrix[i][j] = dist
        costMatrix[j][i] = dist
      }
    }
  }
  return costMatrix
}

const removeExtraWaypoints = (waypoints, routeLenght) => {
  if (waypoints.length < 2) {
    return waypoints
  }

  const trimmedWaypoints = []
  trimmedWaypoints.push(waypoints[0])
  for (let i = 1; i < waypoints.length; ++i)
  {
    const point1 = new LatLon(waypoints[i-1].lat, waypoints[i-1].lng)
    const point2 = new LatLon(waypoints[i].lat, waypoints[i].lng)
    const dist = point1.distanceTo(point2)

    if (routeLenght * ROUTE_POINT_MIN_RELATIVE_DISTANCE <= dist / 1000) {
      trimmedWaypoints.push(waypoints[i])
    }

  }
  return trimmedWaypoints
}

const checkRouteLength = (actualLength, targetLength) => {
  if (targetLength - actualLength < targetLength * ALLOWED_LENGTH_OFFSET
      ||
      actualLength >= targetLength) {
    return true
  }

  return false
}

const getBounds = (coordinates) => {
  let lats = []
  let lngs = []

  coordinates.forEach(x => {
    lats.push(x[1])
    lngs.push(x[0])
  })

  lats = lats.sort()
  lngs = lngs.sort()

  return {
    ne: {
      lat: lats[lats.length - 1],
      lng: lngs[lngs.length - 1]
    },
    sw: {
      lat: lats[0],
      lng: lngs[0]
    }
  }
}

class RoutePlanner {
  constructor(router, waypointGenerator) {
    this.router = router
    this.waypointGenerator = waypointGenerator
  }

  async planRoute(startPoint, targetRouteLenght) {
    try {
      const initialWaypointDistance =
        targetRouteLenght * INITIAL_POINTS_DISTANCE_FACTOR
      let waypoints =
        await this.waypointGenerator.getWaypoints(startPoint,
          initialWaypointDistance, INITIAL_POINTS)
      waypoints = await sort(waypoints, startPoint)

      let route =
        await this.router.getRoute(startPoint, waypoints)

      while (!checkRouteLength(route.routeLength, targetRouteLenght)) {
        waypoints =
          await generateAndInsertWaypoint(this, waypoints, startPoint,
            targetRouteLenght - route.routeLength)
        route =
          await this.router.getRoute(startPoint, waypoints)
      }

      const trimmedWaypoints =
        removeExtraWaypoints(waypoints, targetRouteLenght)

      if (waypoints.length > trimmedWaypoints.length) {
        route =
          await this.router.getRoute(startPoint, trimmedWaypoints)
      }

      return {
        route: route.routePoints,
        length: route.routeLength,
        bounds: getBounds(route.routePoints.features[0].geometry.coordinates)
      }
    } catch (error) {
      return { error }
    }
  }
}

module.exports = RoutePlanner
