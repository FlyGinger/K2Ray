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
    groups: [] as Group[],
    routing: {
      proxy: [] as Rule[],
      direct: [] as Rule[],
      block: [] as Rule[],
    },
    k2ray: {
      autoStart: false,
      v2rayPath: '',
      inbound: { socks: 0, http: 0 },
      server: null as Server | null,
    },
  },

  mutations: {
    init(state, config) {
      // config is undefined when the first start
      if (config) {
        store.replaceState(config);
      } else {
        saveConfig(state);
      }
    },

    setServerToUse(state, server) {
      state.k2ray.server = server;
      saveConfig(state);
    },

    addGroup(state, group) {
      state.groups.push(group);
      saveConfig(state);
    },

    setGroup(state, payload) {
      state.groups[payload.index] = payload.group;
      saveConfig(state);
    },

    rmGroup(state, index) {
      state.groups.splice(index, 1);
      saveConfig(state);
    },

    addServer(state, payload) {
      state.groups[payload.index].servers.push(payload.server);
      saveConfig(state);
    },

    setServer(state, payload) {
      state.groups[payload.groupIndex].servers[payload.serverIndex] = payload.server;
      saveConfig(state);
    },

    rmServer(state, payload) {
      state.groups[payload.groupIndex].servers.splice(payload.serverIndex, 1);
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
