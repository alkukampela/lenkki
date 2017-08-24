const strictUriEncode = require('strict-uri-encode')
const axios = require('axios')

const ROAD_POINT_API_URL = 'https://roads.googleapis.com/v1/nearestRoads'

const locationToRoad = async(location, roadsApiKey) => {
  const pointsParam = location.lat + ',' + location.lng
  const apiUri = `${ROAD_POINT_API_URL}?points=${pointsParam}&key=${roadsApiKey}`

  const response = await axios.get(apiUri)

  if (!response.data.snappedPoints || response.data.snappedPoints.length == 0) {
    throw('Address waypoint couldn\'t be centered to road')
  }

  const snappedPoint = response.data.snappedPoints[0]
  return {
    lat: snappedPoint.location.latitude,
    lng: snappedPoint.location.longitude
  }
}


module.exports = async function(address, roadsApiKey) {
  const geoCoderUrl = 'http://maps.google.com/maps/api/geocode/json?address='
  if (!address) {
    return { error: 'Please provide address'}
  }

  const encodedAddress = strictUriEncode(address)
  try {
    const response = await axios.get(geoCoderUrl.concat(encodedAddress))

    if (response.data.results.length == 0) {
      return {
        error: `We had problem locating address: "${address}". Please provide other address.`
      }
    }

    const location = response.data.results[0].geometry.location
    return await locationToRoad(location, roadsApiKey)
  } catch (error) {
    return { error }
  }
}
