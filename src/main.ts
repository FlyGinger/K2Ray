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
window.api.receive('v2ray-state', (v2rayOn) => {
  store.commit('setV2RayState', v2rayOn);
});

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
