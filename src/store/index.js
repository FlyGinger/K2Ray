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
    }
  },
  actions: {
  },
  modules: {
  }
})

// load config from file
window.api.invoke("load-all").then((config) => store.replaceState(config))

export default store
