import Vue from 'vue'
import Vuex from 'vuex'
import {
  SET_START_LOCATION,
  CLEAR_START_LOCATION,
  SET_ROUTE_LENGTH
} from './mutation-types.js'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    startLocation: null,
    routeLength: null
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
    }
  },
  getters: {
    canSend: state => {
      return !!state.routeLength && !!state.startLocation
    }
  }
})
