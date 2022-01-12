import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

function save(state) {
  window.api.send("save-all", {
    groups: state.groups,
    routing: state.routing,
    k2ray: state.k2ray,
  })
}

const store = new Vuex.Store({
  state: {
  },
  mutations: {
    // group
    addGroup(state, group) {
      state.groups.push(group)
      save(state)
    },
    setGroup(state, payload) {
      state.groups[payload.index] = payload.group
      save(state)
    },
    rmGroup(state, index) {
      state.groups.splice(index, 1)
      save(state)
    },

    // server
    addServer(state, payload) {
      state.groups[payload.groupIndex].servers.push(payload.server)
      save(state)
    },
    setServer(state, payload) {
      state.groups[payload.groupIndex].servers[payload.serverIndex] = payload.server
      save(state)
    },
    rmServer(state, payload) {
      state.groups[payload.groupIndex].servers.splice(payload.index, 1)
      save(state)
    },

    // rule
    addRule(state, payload) {
      state.routing[payload.outbound].push(payload.rule)
      save(state)
    },
    setRule(state, payload) {
      state.routing[payload.outbound][payload.index] = payload.rule
      save(state)
    },
    rmRule(state, payload) {
      state.routing[payload.outbound].splice(payload.index, 1)
      save(state)
    },

    // preference
    setAutoStart(state, autoStart) {
      state.k2ray.core.autoStart = autoStart
      save(state)
    },
    setV2RayPath(state, v2rayPath) {
      state.k2ray.core.v2rayPath = v2rayPath
      save(state)
    },
    setSocksPort(state, port) {
      state.k2ray.inbound.socks = port
      save(state)
    },
    setHTTPPort(state, port) {
      state.k2ray.inbound.http = port
      save(state)
    },
  },
  actions: {
  },
  modules: {
  }
})

// load config from file
// initialize if config file is empty
import defaultRoutingConfig from "../utils/defaultRoutingConfig.js"
import defaultK2RayConfig from "../utils/defaultK2RayConfig.js"
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
  store.replaceState(config)
  window.api.send("save-all", store.state)
})

export default store
