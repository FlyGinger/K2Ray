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
  [proxy: string]: Rule[],

  [direct: string]: Rule[],

  [block: string]: Rule[]
}

interface K2Ray {
  autoStart: boolean,
  v2rayPath: string,
  inbound: { socks: number, http: number },
  server: Server | null,
}

interface State {
  groups: Group[],
  routing: Routing,
  k2ray: K2Ray,
  v2rayOn: boolean,
  proxyOn: boolean,
}
