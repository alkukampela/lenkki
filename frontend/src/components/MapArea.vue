<template>
  <div id="mapArea">
  </div>
</template>

<script>
  import { EventBus } from '../event-bus.js'

  export default {
    data() {
      return {
        map: null,
        homeMarker: null
      }
    },
    mounted() {
      const element = document.getElementById('mapArea')
      const options = {
        zoom: 14,
        center: new window.google.maps.LatLng(51.4826, 0.0077)
      }
      this.map = new window.google.maps.Map(element, options) // eslint-disable-line
    },
    created() {
      EventBus.$on('location_set', payload => {
        if (this.homeMarker) {
          this.homeMarker.setMap(null)
          this.homeMarker = null
        }

        const startLocation = new window.google.maps.LatLng(payload.latitude, payload.longitude)
        this.homeMarker = new window.google.maps.Marker({
          position: startLocation
        })

        this.homeMarker.setMap(this.map)
        this.map.panTo(startLocation)
      })
    }
  }
</script>

<style>
</style>
