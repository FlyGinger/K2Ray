import Vue from 'vue';
import Vuex from 'vuex';
import Routing from '@/views/Routing.vue';

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
      direct: [
        { type: 'domains', value: 'geosite:private' },
        { type: 'domains', value: 'geosite:cn' },
        { type: 'ip', value: 'geoip:private' },
        { type: 'ip', value: 'geoip:cn' },
      ] as Rule[],
      block: [] as Rule[],
    } as Routing,
    k2ray: {
      autoStart: false,
      v2rayPath: '',
      inbound: { socks: 0, http: 0 },
      server: null as Server | null,
    } as K2Ray,
    v2rayOn: false,
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
      Vue.set(state.k2ray, 'server', server);
      saveConfig(state);
    },

    setV2RayPath(state, path) {
      Vue.set(state.k2ray, 'v2rayPath', path);
      saveConfig(state);
    },

    setSocksPort(state, port) {
      Vue.set(state.k2ray.inbound, 'socks', port);
      saveConfig(state);
    },

    setHttpPort(state, port) {
      Vue.set(state.k2ray.inbound, 'http', port);
      saveConfig(state);
    },

    setV2RayState(state, v2rayOn) {
      Vue.set(state, 'v2rayOn', v2rayOn);
    },

    addGroup(state, group) {
      state.groups.push(group);
      saveConfig(state);
    },

    setGroup(state, payload) {
      Vue.set(state.groups, payload.index, payload.group);
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
      Vue.set(state.groups[payload.groupIndex].servers, payload.serverIndex, payload.server);
      saveConfig(state);
    },

    rmServer(state, payload) {
      state.groups[payload.groupIndex].servers.splice(payload.serverIndex, 1);
      saveConfig(state);
    },

    addRule(state, payload) {
      state.routing[payload.outbound].push(payload.rule);
      saveConfig(state);
    },

    setRule(state, payload) {
      Vue.set(state.routing[payload.outbound], payload.index, payload.rule);
      saveConfig(state);
    },

    rmRule(state, payload) {
      state.routing[payload.outbound].splice(payload.index, 1);
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
