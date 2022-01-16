import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Panel from '../views/Panel.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Panel',
    component: Panel,
  },
  {
    path: '/groupList',
    name: 'GroupList',
    component: () => import('../views/GroupList.vue'),
  },
  {
    path: '/routing',
    name: 'Routing',
    component: () => import('../views/Routing.vue'),
  },
  {
    path: '/preference',
    name: 'Preference',
    component: () => import('../views/Preference.vue'),
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
