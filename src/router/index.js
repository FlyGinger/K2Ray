import Vue from 'vue'
import VueRouter from 'vue-router'

import Panel from '../views/Panel.vue'
import Server from '../views/Server.vue'
import Create from '../views/Create.vue'
import Preference from '../views/Preference.vue'
import Route from '../views/Route.vue'
import About from '../views/About.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Panel',
    component: Panel
  },
  {
    path: '/server',
    name: 'Server',
    component: Server
  },
  {
    path: '/create',
    name: 'Create',
    component: Create
  },
  {
    path: '/preference',
    name: 'Preference',
    component: Preference
  },
  {
    path: '/route',
    name: 'Route',
    component: Route
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

const router = new VueRouter({
  routes
})

export default router
