<template>
  <section id="form">

    <div>
      <button v-on:click="locatePosition">Show my location</button>
      <input v-model="address" placeholder="address">
      <button v-on:click="locateAddress()">Use address</button>
    </div>

    <div>
      <input v-validate="'required|decimal|min_value:0.1'" :class="{
        'input': true, 'is-danger': errors.has('length')
        }" name="length" type="number" placeholder="Length"> km

      <div v-show="errors.has('length')" class="help is-danger">{{ errors.first('length') }}</div>
    </div>

    <div>lat: {{ latitude }}</div>
    <div>lon: {{ longitude }}</div>

    <div id="out"></div>

    <h1>{{ error }}</h1>

  </section>
</template>

<script>
  import { EventBus } from '../event-bus.js'

  export default {
    data() {
      return {
        address: null,
        latitude: null,
        longitude: null,
        length: 0,
        error: null
      }
    },
    methods: {
      locatePosition: function() {
        const output = document.getElementById('out')

        if (!navigator.geolocation) {
          this.error = 'Geolocation is not supported by your browser'
          return
        }

        output.innerHTML = '<p>Locating…</p>'

        navigator.geolocation.getCurrentPosition(position => {
          output.innerHTML = ''
          this.error = null
          this.latitude = position.coords.latitude
          this.longitude = position.coords.longitude
          this.publishLocation(this.latitude, this.longitude)
        }, () => {
          this.error = 'Unable to retrieve your location'
        })
      },
      locateAddress: async function() {
        const getLocation =
          async() => await (
            await fetch(`http://localhost:16044/locate?address=${this.address}`)
          ).json()

        if (this.address != null) {
          const loc = await getLocation(this.address)
          this.longitude = loc.lng
          this.latitude = loc.lat
          this.publishLocation(this.latitude, this.longitude)
        }
      },
      publishLocation: function(latitude, longitude) {
        if (latitude === undefined || longitude === undefined) {
          return
        }
        EventBus.$emit('location_set', {
          latitude,
          longitude
        })
      }
    }
  }
</script>
