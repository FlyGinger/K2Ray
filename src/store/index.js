import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
  },
  mutations: {
    addGroup(state, group) {
      state.groups.push(group)
      window.api.send("save-all", state)
    },
    setGroup(state, payload) {
      state.groups[payload.index] = payload.group
      window.api.send("save-all", state)
    },
    rmGroup(state, index) {
      state.groups.splice(index, 1)
      window.api.send("save-all", state)
    },

    addServer(state, payload) {
      state.groups[payload.groupIndex].servers.push(payload.server)
      window.api.send("save-all", state)
    },
    setServer(state, payload) {
      state.groups[payload.groupIndex].servers[payload.serverIndex] = payload.server
      window.api.send("save-all", state)
    },
    rmServer(state, payload) {
      state.groups[payload.groupIndex].servers.splice(payload.index, 1)
      window.api.send("save-all", state)
    },

    addRule(state, payload) {
      state.routing[payload.outbound].push(payload.rule)
      window.api.send("save-all", state)
    },
    setRule(state, payload) {
      state.routing[payload.outbound][payload.index] = payload.rule
      window.api.send("save-all", state)
    },
    rmRule(state, payload) {
      state.routing[payload.outbound].splice(payload.index, 1)
      window.api.send("save-all", state)
    }
  },
  actions: {
  },
  modules: {
  }
})

// load config from file
import defaultRoutingConfig from "../utils/defaultRoutingConfig.js"
window.api.invoke("load-all").then((config) => {
  if (!("groups" in config)) {
    config.groups = []
  }
  if (!("routing" in config)) {
    config.routing = defaultRoutingConfig
  }
  store.replaceState(config)
  window.api.send("save-all", store.state)
})

export default store
