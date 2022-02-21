/*
-> RENDERER
Although it's called main.
 */

import { proxyOn, v2rayOn } from '@/api-renderer';

import Vue from 'vue';
import App from './App.vue';
import router from './router';
import { loadConfig, store } from './store';
import vuetify from './plugins/vuetify';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import '@mdi/font/css/materialdesignicons.css';

Vue.config.productionTip = false;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.api.receive('main-is-ready', () => {
  loadConfig();
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.api.receive('console-log', (info) => {
  // eslint-disable-next-line no-console
  console.log(info);
});

setInterval((): void => {
  v2rayOn();
  proxyOn(store.state.k2ray.inbound);
}, 200);

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
