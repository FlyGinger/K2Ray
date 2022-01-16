declare module '@vue/runtime-core' {
  import { Store } from 'vuex';

  interface Server {
    name: string,
    address: string,
    port: number,
    password: string,
    protocol: string
  }

  interface Group {
    name: string,
    isSubscribe: boolean,
    subscribeURL: string,
    servers: Server[]
  }

  interface Rule {
    type: string,
    value: string
  }

  interface Routing {
    proxy: Rule[],
    direct: Rule[],
    block: Rule[]
  }

  interface K2Ray {
    autoStart: boolean,
    v2rayPath: string,
    inbound: {
      socks: number,
      http: number
    },
    server: Server | null
  }

  interface State {
    groups: Group[],
    routing: Routing,
    k2ray: K2Ray
  }

  interface vue {
    $store: Store<State>;
  }
}
