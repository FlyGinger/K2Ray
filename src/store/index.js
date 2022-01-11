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
  },
  actions: {
  },
  modules: {
  }
})

// load config from file
window.api.invoke("load-all").then((config) => {
  if (!("groups" in config)) {
    config.groups = []
  }
  store.replaceState(config)
  window.api.send("save-all", store.state)
})

export default store
