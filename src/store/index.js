import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    serverGroups: [
      {
        name: "组一",
        isSubcribe: false,
        subscribeURL: "",
        servers: [
          { name: "德国-DE1-1", server: "xxx.yyy-zzz.com:443", password: "hahahahahaha" },
          { name: "德国-DE1-1", server: "xxx.yyy-zzz.com:444", password: "hahahahahaha" },
          { name: "德国-DE1-1", server: "xxx.yyy-zzz.com:445", password: "hahahahahaha" },
          { name: "德国-DE1-1", server: "xxx.yyy-zzz.com:446", password: "hahahahahaha" },
          { name: "德国-DE1-1", server: "xxx.yyy-zzz.com:447", password: "hahahahahaha" },
        ]
      },
      {
        name: "组二X",
        isSubcribe: false,
        subscribeURL: "",
        servers: [
          { name: "德国-XY-1", server: "xxx.yyy-zzz.com:443", password: "hahahahahaha" },
          { name: "德国-XY-1", server: "xxx.yyy-zzz.com:444", password: "hahahahahaha" },
          { name: "德国-XY-1", server: "xxx.yyy-zzz.com:445", password: "hahahahahaha" },
          { name: "德国-XY-1", server: "xxx.yyy-zzz.com:446", password: "hahahahahaha" },
          { name: "德国-XY-1", server: "xxx.yyy-zzz.com:447", password: "hahahahahaha" },
        ]
      }
    ]
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})
