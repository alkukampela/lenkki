<template>
  <div id="routingApp">
    <RoutingForm v-on:doRouting="doRouting"/>
    <MapArea/>
  </div>
</template>

<script>
  import { SET_ROUTE } from '../store/mutation-types.js'
  import RoutingForm from './RoutingForm.vue'
  import MapArea from './MapArea.vue'

  export default {
    data() {
      return {}
    },
    components: {
      RoutingForm,
      MapArea
    },
    methods: {
      doRouting: async function() {
        // TODO: set global state to loading
        const req = {
          lat: this.$store.state.startLocation.lat,
          lng: this.$store.state.startLocation.lng,
          length: this.$store.state.routeLength
        }

        const response = await (await fetch('http://localhost:16044/', {
          method: 'POST',
          body: JSON.stringify(req),
          headers: new Headers({
            'Content-Type': 'application/json'
          })
        })).json()

        // TODO: store route only if routing was succesful
        this.$store.commit(SET_ROUTE, {route: response.route, bounds: response.bounds})
        // TODO: set global state to loading done
      }
    }
  }

</script>

<style>
</style>
