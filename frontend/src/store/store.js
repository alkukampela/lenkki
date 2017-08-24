import Vue from 'vue'
import Vuex from 'vuex'
import { SET_START_LOCATION, CLEAR_START_LOCATION } from './mutation-types.js'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    startLocation: undefined
  },
  mutations: {
    [SET_START_LOCATION](state, location) {
      state.startLocation = location
    },
    [CLEAR_START_LOCATION](state) {
      state.startLocation = undefined
    }
  }
})
