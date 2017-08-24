import Vue from 'vue'
import Router from 'vue-router'
import RoutingApp from '@/components/RoutingApp'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'RoutingApp',
      component: RoutingApp
    }
  ]
})
