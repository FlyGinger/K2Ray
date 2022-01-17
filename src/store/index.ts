import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

function saveConfig(state: unknown): void {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.api.send('save-config', state);
}

const store = new Vuex.Store({
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
    init(state, config) {
      // config is undefined when the first start
      if (config) {
        state.groups = config.groups;
        state.routing = config.routing;
        state.k2ray = config.k2ray;
      }
      saveConfig(state);
    },

    addGroup(state, group) {
      state.groups.push(group as never);
      saveConfig(state);
    },
  },

  actions: {},
  modules: {},
});

function loadConfig(): void {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.api.invoke('load-config').then((config: State) => store.commit('init', config));
}

export { loadConfig, store };
