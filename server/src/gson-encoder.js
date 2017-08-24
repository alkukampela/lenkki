const polylineDecoder = require('@mapbox/polyline')

const toGsonPoints = (waypoints) => {
  const gsonPoints = []
  waypoints.forEach((waypoint, index) => {
    gsonPoints.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [waypoint.lng, waypoint.lat]
      },
      properties: {
        name: index + 1
      }
    })
  })

  return gsonPoints
}

const flip = (coords) => {
  const flipped = []
  for (let coord of coords) {
    flipped.push(coord.slice().reverse())
  }
  return flipped
}

module.exports = function(polylines, waypoints, flipPolyline = false) {
  let plottedPoints = []

  polylines.forEach(polyline =>
    plottedPoints = plottedPoints.concat(polylineDecoder.decode(polyline))
  )

  if (flipPolyline) {
    plottedPoints = flip(plottedPoints)
  }

  const waypointFeatures = toGsonPoints(waypoints)

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: plottedPoints
        },
        properties: {
          name: 'Route'
        }
      },
      ...waypointFeatures
    ]
  }
}
