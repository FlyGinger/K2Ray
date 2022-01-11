import Vue from 'vue'
import VueRouter from 'vue-router'

import Panel from '../views/Panel.vue'
import Groups from '../views/Groups.vue'
import Group from '../views/Group.vue'
import Preference from '../views/Preference.vue'
import Route from '../views/Route.vue'
import About from '../views/About.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Panel
  },
  {
    path: '/groups',
    component: Groups
  },
  {
    path: '/group/:index',
    component: Group
  },
  {
    path: '/preference',
    component: Preference
  },
  {
    path: '/route',
    component: Route
  },
  {
    path: '/about',
    component: About
  }
]

const router = new VueRouter({
  routes
})

export default router
