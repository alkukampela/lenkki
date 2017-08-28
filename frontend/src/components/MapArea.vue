<template>
  <div id="mapArea">
  </div>
</template>

<script>
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
    computed: {
      startLocation() {
        return this.$store.state.startLocation
      },
      bounds() {
        return this.$store.state.bounds
      },
      route() {
        return this.$store.state.route
      }
    },
    watch: {
      startLocation(location) {
        if (this.homeMarker) {
          this.homeMarker.setMap(null)
          this.homeMarker = null
        }

        if (location.lat !== undefined && location.lng) {
          const startLocation = new window.google.maps.LatLng(location.lat, location.lng)
          this.homeMarker = new window.google.maps.Marker({
            position: startLocation
          })

          this.homeMarker.setMap(this.map)
          this.map.panTo(startLocation)
        }
      },
      bounds(bounds) {
        const sw = new window.google.maps.LatLng({lat: bounds.sw.lat, lng: bounds.sw.lng})
        const ne = new window.google.maps.LatLng({lat: bounds.ne.lat, lng: bounds.ne.lng})
        this.map.fitBounds(new window.google.maps.LatLngBounds(sw, ne))
      },
      route(route) {
        // Clear previous route
        this.map.data.forEach((feature) => {
          this.map.data.remove(feature)
        })

        this.map.data.addGeoJson(route)
      }
    }
  }
</script>

<style>
</style>
