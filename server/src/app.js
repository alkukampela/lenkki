const Express = require('express')
const RoutePlanner = require('./route-planner.js')
const Configuration = require('./configuration.js')
const WaypointGenerator = require('./waypoint-generator.js')
const DigitransitRouter = require('./digitransit-router.js')
const BodyParser = require('body-parser')
const cors = require('cors')
const homeLocator = require('./home-locator.js')
var proxy = require('express-http-proxy')

const app = Express()
app.use(cors())
app.use(/\/((?!map-api).)*/, BodyParser.json())

const configuration = new Configuration()
const waypointGenerator = new WaypointGenerator(configuration)
const digitransitRouter = new DigitransitRouter()
const planner = new RoutePlanner(digitransitRouter, waypointGenerator)

app.use('/map-api', proxy('maps.googleapis.com', {
  https: true,
  filter: (req) => {
    return req.method == 'GET'
  },
  proxyReqPathResolver: () => {
    return `/maps/api/js?key=${configuration.mapApiKey}`
  }
}))

app.post('/', (req, res) => {
  console.log(req.body)
  const requestStart = Date.now()
  const startpoint = {lat: req.body.lat, lng: req.body.lng}

  if (!req.body.length || req.body.length <= 0) {
    res.status(400).json({ error: 'Route length must be positive' })
    return
  }

  planner.planRoute(startpoint, req.body.length).then(
    route => {
      if (route.error) {
        console.log(route.error)
        res.status(500).json({ error: route.error })
        return
      }

      const retVal = {
        route: route.route,
        bounds: route.bounds
      }

      console.log('Handling request took: '+ (Date.now() - requestStart) + ' ms')
      res.json(
        retVal
      )
    }
  )
})

app.get('/locate', (req, res) => {
  homeLocator(req.query.address, configuration.roadsApiKey).then(
    result => {
      if (result.error) {
        console.log(result.error)
        res.status(400).json({ error: result.error })
        return
      }

      res.json({
        lat: result.lat,
        lng: result.lng
      })
    }
  )
})

app.listen(16044, () => {
  console.log('Router app listening on port 16044!')
})
