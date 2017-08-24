<template>
  <div id="routingApp">
    <RoutingForm v-on:location_set="publishLocation"/>
    <MapArea/>
  </div>
</template>

<script>
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
      publishLocation: function(location) {
        console.log(location)
      }
    }
  }

</script>

<style>
</style>
