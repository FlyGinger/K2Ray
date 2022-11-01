import {
  createRouter,
  createWebHistory
} from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    component: () => import('../views/Dashboard.vue'),
  },
  {
    path: '/console',
    component: () => import('../views/Console.vue'),
  },
  {
    path: '/server',
    component: () => import('../views/Server.vue'),
  },
  {
    path: '/log',
    component: () => import('../views/Log.vue'),
  },
  {
    path: '/dns',
    component: () => import('../views/DNS.vue'),
  },
  {
    path: '/route',
    component: () => import('../views/Route.vue'),
  },
  {
    path: '/inbound',
    component: () => import('../views/Inbound.vue'),
  },
  {
    path: '/outbound',
    component: () => import('../views/Outbound.vue'),
  },
  {
    path: '/service',
    component: () => import('../views/Service.vue'),
  },
  {
    path: '/about',
    component: () => import('../views/About.vue'),
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
