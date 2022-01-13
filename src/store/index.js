import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

function save(state) {
  window.api.send("save-all", {
    groups: state.groups,
    routing: state.routing,
    k2ray: state.k2ray
  })
}

const store = new Vuex.Store({
  state: {
    v2rayOn: false
  },
  mutations: {
    // reset
    reset(state, config) {
      state.groups = config.groups
      state.routing = config.routing
      state.k2ray = config.k2ray
    },

    // v2ray state
    setV2RayOn(state, v2rayOn) {
      state.v2rayOn = v2rayOn
    },

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
    setGroupServer(state, payload) {
      state.k2ray.core.groupIndex = payload.groupIndex
      state.k2ray.core.serverIndex = payload.serverIndex
      save(state)
    }
  },
  actions: {
  },
  modules: {
  }
})

window.api.receive("v2rayState", (v2rayOn) => {
  store.commit("setV2RayOn", v2rayOn)
})

export default store
