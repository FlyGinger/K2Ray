import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        redirect: 'k-dashboard-page',
    },
    {
        path: '/k-dashboard-page',
        component: () => import('../views/KDashboardPage.vue'),
    },
    {
        path: '/k-console-page',
        component: () => import('../views/KConsolePage.vue'),
    },
    {
        path: '/k-about-page',
        component: () => import('../views/KAboutPage.vue'),
    },
    {
        path: '/v-log-page',
        component: () => import('../views/VLogPage.vue'),
    },
    {
        path: '/v-dns-page',
        component: () => import('../views/VDNSPage.vue'),
    },
    {
        path: '/v-route-page',
        component: () => import('../views/VRoutePage.vue'),
    },
    {
        path: '/v-inbound-page',
        component: () => import('../views/VInboundPage.vue'),
    },
    {
        path: '/v-outbound-page',
        component: () => import('../views/VOutboundPage.vue'),
    },
    {
        path: '/v-service-page',
        component: () => import('../views/VServicePage.vue'),
    },
    {
        path: '/v-about-page',
        component: () => import('../views/VAboutPage.vue'),
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
