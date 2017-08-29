<template>
  <div id="routingApp">
    <RoutingForm v-on:doRouting="doRouting"/>
    <MapArea/>
  </div>
</template>

<script>
  import {
    SET_ROUTE,
    START_ROUTING,
    FINISH_ROUTING
  } from '../store/mutation-types.js'
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
        this.$store.commit(START_ROUTING)
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
        this.$store.commit(FINISH_ROUTING)
      }
    }
  }

</script>

<style>
</style>
