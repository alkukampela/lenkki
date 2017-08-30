import Vue from 'vue'
import Vuex from 'vuex'
import {
  SET_START_LOCATION,
  CLEAR_START_LOCATION,
  SET_ROUTE_LENGTH,
  SET_ROUTE,
  START_ROUTING,
  FINISH_ROUTING,
  SET_ERROR,
  CLEAR_ERROR
} from './mutation-types.js'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    startLocation: null,
    routeLength: null,
    bounds: null,
    route: null,
    isRouting: false,
    error: null
  },
  mutations: {
    [SET_START_LOCATION](state, location) {
      state.startLocation = location
    },
    [CLEAR_START_LOCATION](state) {
      state.startLocation = null
    },
    [SET_ROUTE_LENGTH](state, length) {
      state.routeLength = parseFloat(length)
    },
    [SET_ROUTE](state, resp) {
      state.route = resp.route
      state.bounds = resp.bounds
    },
    [START_ROUTING](state) {
      state.isRouting = true
    },
    [FINISH_ROUTING](state) {
      state.isRouting = false
    },
    [SET_ERROR](state, error) {
      state.error = error
    },
    [CLEAR_ERROR](state) {
      state.error = null
    }
  },
  getters: {
    canSend: state => {
      return !!state.routeLength && !!state.startLocation
    }
  }
})
