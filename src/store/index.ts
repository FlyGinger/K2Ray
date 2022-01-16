import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    groups: [],
    routing: {
      proxy: [],
      direct: [],
      block: [],
    },
    k2ray: {
      autoStart: false,
      v2rayPath: '',
      inbound: { socks: 0, http: 0 },
      server: {},
    },
  },

  mutations: {
    set(state, config) {
      state.groups = config.groups;
      state.routing = config.routing;
      state.k2ray = config.k2ray;
    },
  },

  actions: {},
  modules: {},
});
