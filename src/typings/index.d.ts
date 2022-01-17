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
