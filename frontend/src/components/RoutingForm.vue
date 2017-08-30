<template>
  <fieldset id="form" v-bind:disabled="formIsDisabled">

    <div>
      <button v-on:click="locatePosition">Show my location</button>
      <input v-model="address" placeholder="address">
      <button v-on:click="locateAddress()">Use address</button>
    </div>

    <div>
      <input
        v-model="routeLength"
        type="number"
        placeholder="Length"> km
    </div>

    <div id="out"></div>

    <div>{{ error }}</div>

    <button @click="$emit('doRouting')" v-bind:disabled="sendingIsDisabled">
      Magic Button
    </button>

  </fieldset>
</template>

<script>
  import {
    SET_START_LOCATION,
    CLEAR_START_LOCATION,
    SET_ROUTE_LENGTH,
    SET_ERROR,
    CLEAR_ERROR
  } from '../store/mutation-types.js'

  export default {
    data() {
      return {
        address: null
      }
    },
    methods: {
      locatePosition: function() {
        const output = document.getElementById('out')
        this.error = null
        if (!navigator.geolocation) {
          this.error = 'Geolocation is not supported by your browser'
          return
        }
        output.innerHTML = '<p>Locating…</p>'

        navigator.geolocation.getCurrentPosition(position => {
          output.innerHTML = ''
          this.publishLocation(position.coords.latitude, position.coords.longitude)
        }, () => {
          this.error = 'Unable to retrieve your location'
        })
      },
      locateAddress: async function() {
        if (this.address != null) {
          this.$store.commit(CLEAR_ERROR)
          try {
            const response = await fetch(`http://localhost:16044/locate?address=${this.address}`)
            const respData = await response.json()
            if (response.ok) {
              this.publishLocation(respData.lat, respData.lng)
              return
            }
            this.error = respData.error
          } catch (ex) {
            this.error = ex.message
          }
        }
      },
      publishLocation: function(lat, lng) {
        if (lat === undefined || lng === undefined) {
          this.$store.commit(CLEAR_START_LOCATION)
        }
        this.$store.commit(SET_START_LOCATION, {lat, lng})
      }
    },
    computed: {
      routeLength: {
        get() {
          return this.$store.state.routeLength
        },
        set(value) {
          this.$store.commit(SET_ROUTE_LENGTH, value)
        }
      },
      sendingIsDisabled: function() {
        return !this.$store.getters.canSend
      },
      formIsDisabled: function() {
        return this.$store.state.isRouting
      },
      error: {
        get() {
          return this.$store.state.error
        },
        set(value) {
          value ? this.$store.commit(SET_ERROR, value) : this.$store.commit(CLEAR_ERROR)
        }
      }
    }
  }
</script>
