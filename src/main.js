import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'

Vue.config.productionTip = false

// load config from file
// initialize if config file is empty
import defaultRoutingConfig from "./utils/defaultRoutingConfig.js"
import defaultK2RayConfig from "./utils/defaultK2RayConfig.js"
window.api.invoke("load-all").then((config) => {
  if (!("groups" in config)) {
    config.groups = []
  }
  if (!("routing" in config)) {
    config.routing = defaultRoutingConfig
  }
  if (!("k2ray" in config)) {
    config.k2ray = defaultK2RayConfig
  }
  store.commit("reset", config)
  window.api.send("save-all", {
    groups: store.state.groups,
    routing: store.state.routing,
    k2ray: store.state.k2ray,
  })

  if (store.state.k2ray.serverInUse.name) {
    window.api.send("launch", store.state)
  }
}).then(() => {
  new Vue({
    router,
    store,
    vuetify,
    render: function (h) { return h(App) }
  }).$mount('#app')
})
