import { defineStore } from 'pinia'
import { invoke, os } from '@tauri-apps/api'
import { Command } from '@tauri-apps/api/shell'
import { listen } from '@tauri-apps/api/event'
import { Store } from 'tauri-plugin-store-api'

const persist = new Store('config.json')

export interface Server {
  name: string
  address: string
  port: number
  password: string
  protocol: string
}
export interface ServerGroup {
  name: string
  isSubscribe: boolean
  subscribeURL: string
  servers: Server[]
}

export interface RouteRule {
  tag: string
  domain: string
}

export const useStore = defineStore('main', {
  state: () => ({
    // dashboard
    systemProxyOn: false, // runtime
    v2rayOn: false, // runtime

    // console
    v2rayFolderLocation: '',

    // server
    currentServerGroupIndex: -1,
    currentServer: {
      valid: false,
      serverGroupIndex: 0,
      serverIndex: 0,
      name: '',
      address: '',
      port: 0,
      password: '',
      protocol: ''
    },
    serverGroups: [] as ServerGroup[],

    // log
    v2rayLogLevel: 'Warning',
    v2rayLogSize: 200,
    v2rayAccessLog: [] as string[], // runtime
    v2rayAccessBuffer: [] as number[], // runtime
    v2rayErrorLog: [] as string[], // runtime
    v2rayErrorBuffer: [] as number[], // runtime

    // dns
    // todo

    // route
    domainStrategy: 'AsIs',
    directChina: true,
    rules: [] as RouteRule[],

    // inbound
    socksPort: 8888,
    httpPort: 8889,

    // outbound
    // todo

    // service
    // todo
  }),

  getters: {
    serverGroupOptions: (state) => {
      const result: { index: number, name: string }[] = []
      state.serverGroups.forEach((v, i) => {
        result.push({ index: i, name: v.name })
      })
      return result
    },

    currentServerGroupIsSubscribe: (state) => {
      return state.currentServerGroupIndex >= 0 &&
        state.serverGroups[state.currentServerGroupIndex].isSubscribe
    },

    currentServerGroupNumberServer: (state) => {
      if (state.currentServerGroupIndex < 0) {
        return 0
      }
      return state.serverGroups[state.currentServerGroupIndex].servers.length
    }
  },

  actions: {
    async initialize() {
      await persist.load()
      const entries = await persist.entries()

      if (entries.length == 0) {
        // first start, create default config
        await persist.set('v2rayFolderLocation', this.v2rayFolderLocation)
        await persist.set('currentServerGroupIndex', this.currentServerGroupIndex)
        await persist.set('currentServer', this.currentServer)
        await persist.set('serverGroups', this.serverGroups)
        await persist.set('v2rayLogLevel', this.v2rayLogLevel)
        await persist.set('v2rayLogSize', this.v2rayLogSize)
        await persist.set('domainStrategy', this.domainStrategy)
        await persist.set('directChina', this.directChina)
        await persist.set('rules', this.rules)
        await persist.set('socksPort', this.socksPort)
        await persist.set('httpPort', this.httpPort)
        await persist.save()
      } else {
        entries.forEach(([k, v]) => {
          // $patch does not work, why?
          // @ts-ignore
          store[k] = v
        })
      }
    },

    async setCurrentServer(serverGroupIndex: number, serverIndex: number, server: Server) {
      this.currentServer.valid = true
      this.currentServer.serverGroupIndex = serverGroupIndex
      this.currentServer.serverIndex = serverIndex
      this.currentServer.name = server.name
      this.currentServer.address = server.address
      this.currentServer.port = server.port
      this.currentServer.password = server.password
      this.currentServer.protocol = server.protocol

      await persist.set('currentServer', this.currentServer)
      await persist.save()
    },

    async clearCurrentServer() {
      this.currentServer.valid = false
      this.currentServer.serverGroupIndex = 0
      this.currentServer.serverIndex = 0
      this.currentServer.name = ''
      this.currentServer.address = ''
      this.currentServer.port = 0
      this.currentServer.password = ''
      this.currentServer.protocol = ''

      await persist.set('currentServer', this.currentServer)
      await persist.save()
    },

    async update(obj: object, restart: boolean) {
      this.$patch(obj)
      Object.entries(obj).forEach(async ([k, v]) => {
        await persist.set(k, v)
      })
      await persist.save()

      if (restart && this.v2rayOn && this.currentServer.valid) {
        restartV2Ray(this.v2rayFolderLocation, generateV2RayConfig())
      }
    },

    async addServerGroup(obj: ServerGroup) {
      this.serverGroups.push(obj)
      await persist.set('serverGroups', this.serverGroups)
      await persist.save()

      if (this.serverGroups.length === 1) {
        this.update({ currentServerGroupIndex: 0 }, true)
      }
    },

    async removeServerGroup() {
      if (this.currentServer.serverGroupIndex === this.currentServerGroupIndex) {
        await this.clearCurrentServer()
        if (this.v2rayOn) {
          stopV2Ray()
        }
      } else if (this.currentServer.serverGroupIndex > this.currentServerGroupIndex) {
        this.currentServer.serverGroupIndex--
      }

      this.serverGroups.splice(this.currentServerGroupIndex, 1)
      if (this.currentServerGroupIndex >= this.serverGroups.length) {
        this.update({ currentServerGroupIndex: this.serverGroups.length - 1 }, false)
      }

      await persist.set('serverGroups', this.serverGroups)
      await persist.save()
    },

    async updateServerGroup(obj: ServerGroup) {
      this.serverGroups[this.currentServerGroupIndex] = obj
      await persist.set('serverGroups', this.serverGroups)
      await persist.save()

      if (this.currentServer.serverGroupIndex === this.currentServerGroupIndex) {
        const index = obj.servers.findIndex((v) => v.name === this.currentServer.name)
        if (index < 0) {
          await this.clearCurrentServer()
          if (this.v2rayOn) {
            stopV2Ray()
          }
        } else {
          this.setCurrentServer(this.currentServerGroupIndex, index, obj.servers[index])
          if (this.v2rayOn) {
            restartV2Ray(this.v2rayFolderLocation, generateV2RayConfig())
          }
        }
      }
    },

    async updateSubscribe(servers: Server[]) {
      this.serverGroups[this.currentServerGroupIndex].servers = servers
      await persist.set('serverGroups', this.serverGroups)
      await persist.save()

      if (this.currentServer.serverGroupIndex === this.currentServerGroupIndex) {
        const index = servers.findIndex((v) => v.name === this.currentServer.name)
        if (index < 0) {
          await this.clearCurrentServer()
          if (this.v2rayOn) {
            stopV2Ray()
          }
        } else {
          this.setCurrentServer(this.currentServerGroupIndex, index, servers[index])
          if (this.v2rayOn) {
            restartV2Ray(this.v2rayFolderLocation, generateV2RayConfig())
          }
        }
      }
    },

    async addSingleServer(obj: Server) {
      this.serverGroups[this.currentServerGroupIndex].servers.push(obj)
      await persist.set('serverGroups', this.serverGroups)
      await persist.save()
    },

    async removeSingleServer(index: number) {
      if (this.currentServer.serverGroupIndex === this.currentServerGroupIndex) {
        if (this.currentServer.serverIndex === index) {
          await this.clearCurrentServer()
          if (this.v2rayOn) {
            stopV2Ray()
          }
        } else if (this.currentServer.serverIndex > index) {
          this.currentServer.serverIndex--
        }
      }

      this.serverGroups[this.currentServerGroupIndex].servers.splice(index, 1)
      await persist.set('serverGroups', this.serverGroups)
      await persist.save()
    },

    async updateSingleServer(index: number, obj: Server) {
      this.serverGroups[this.currentServerGroupIndex].servers[index] = obj
      await persist.set('serverGroups', this.serverGroups)
      await persist.save()

      if (this.currentServer.serverGroupIndex === this.currentServerGroupIndex && this.currentServer.serverIndex === index) {
        await this.setCurrentServer(this.currentServerGroupIndex, index, obj)
        if (this.v2rayOn) {
          restartV2Ray(this.v2rayFolderLocation, generateV2RayConfig())
        }
      }
    },

    async useSingleServer(index: number) {
      await this.setCurrentServer(this.currentServerGroupIndex, index, this.serverGroups[this.currentServerGroupIndex].servers[index])
      if (this.v2rayOn) {
        restartV2Ray(this.v2rayFolderLocation, generateV2RayConfig())
      }
    },

    async addRouteRule(rule: RouteRule) {
      this.rules.push(rule)
      await persist.set('rules', this.rules)
      await persist.save()
      if (this.v2rayOn) {
        restartV2Ray(this.v2rayFolderLocation, generateV2RayConfig())
      }
    },

    async updateRouteRule(index: number, rule: RouteRule) {
      this.rules[index] = rule
      await persist.set('rules', this.rules)
      await persist.save()
      if (this.v2rayOn) {
        restartV2Ray(this.v2rayFolderLocation, generateV2RayConfig())
      }
    },

    async removeRouteRule(index: number) {
      this.rules.splice(index, 1)
      await persist.set('rules', this.rules)
      await persist.save()
      if (this.v2rayOn) {
        restartV2Ray(this.v2rayFolderLocation, generateV2RayConfig())
      }
    },

    async clearRouteRule() {
      this.rules = []
      await persist.set('rules', this.rules)
      await persist.save()
      if (this.v2rayOn) {
        restartV2Ray(this.v2rayFolderLocation, generateV2RayConfig())
      }
    },

    pushAccessLog(log: number[]) {
      this.v2rayAccessBuffer.push(...log)
      while (true) {
        let index = this.v2rayAccessBuffer.indexOf('\n'.charCodeAt(0))
        if (index >= 0) {
          this.v2rayAccessLog.push(String.fromCharCode(...(this.v2rayAccessBuffer.slice(0, index))))
          while (this.v2rayAccessLog.length > this.v2rayLogSize) {
            this.v2rayAccessLog.shift()
          }
          this.v2rayAccessBuffer = this.v2rayAccessBuffer.slice(index + 1)
        } else {
          break
        }
      }
    },

    pushErrorLog(log: number[]) {
      this.v2rayErrorBuffer.push(...log)
      while (true) {
        let index = this.v2rayErrorBuffer.indexOf('\n'.charCodeAt(0))
        if (index >= 0) {
          this.v2rayErrorLog.push(String.fromCharCode(...(this.v2rayErrorBuffer.slice(0, index))))
          while (this.v2rayErrorLog.length > this.v2rayLogSize) {
            this.v2rayErrorLog.shift()
          }
          this.v2rayErrorBuffer = this.v2rayErrorBuffer.slice(index + 1)
        } else {
          break
        }
      }
    }
  }
})

/* -------- initialize -------- */

const store = useStore()
store.initialize()

/* -------- dashboard -------- */

// heartbeat:
// - is system proxy set?
// - is v2ray alive?
setInterval(async () => {
  // query system proxy state
  let platform = await os.platform()
  if (platform === 'darwin') {
    const output = await new Command('darwin-scutil', '--proxy').execute()
    const lines = output.stdout.split('\n')

    // filter http and socks related items from output
    const map = new Map<string, string>()
    lines.forEach((line) => {
      line = line.trim()
      if (line.startsWith('HTTP') || line.startsWith('SOCKS')) {
        const pieces = line.split(':')
        map.set(pieces[0].trim(), pieces[1].trim())
      }
    })

    // pick up values
    const HTTPEnable = map.get('HTTPEnable') === '1'
    const HTTPPort = Number(map.get('HTTPPort'))
    const HTTPProxy = map.get('HTTPSProxy')
    const HTTPSEnable = map.get('HTTPSEnable') === '1'
    const HTTPSPort = Number(map.get('HTTPSPort'))
    const HTTPSProxy = map.get('HTTPSProxy')
    const SOCKSEnable = map.get('SOCKSEnable') === '1'
    const SOCKSPort = Number(map.get('SOCKSPort'))
    const SOCKSProxy = map.get('SOCKSProxy')

    // compare them with values in preference
    store.systemProxyOn =
      HTTPEnable && HTTPPort === store.httpPort && HTTPProxy === '127.0.0.1' &&
      HTTPSEnable && HTTPSPort === store.httpPort && HTTPSProxy === '127.0.0.1' &&
      SOCKSEnable && SOCKSPort === store.socksPort && SOCKSProxy === '127.0.0.1'
  } else if (platform === 'win32') {
    const outputEnable = await new Command('win32-reg', ['query', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings', '/v', 'ProxyEnable']).execute()
    const outputServer = await new Command('win32-reg', ['query', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings', '/v', 'ProxyServer']).execute()

    // filter values from output
    const enable = Number(outputEnable.stdout.trim().split(/\s/).pop()) === 1
    const server = outputServer.stdout.trim().split(/\s/).pop()

    // compare them with values in preference
    // there is no socks in windows
    store.systemProxyOn = enable && server === `127.0.0.1:${store.httpPort}`
  }

  // query v2ray state
  const result = await invoke('is_v2ray_alive')
  store.v2rayOn = !!result
}, 1000)

/* -------- log -------- */

listen<string>('send_access_log', (event) => {
  // @ts-ignore: why payload is inferred to be string?
  store.pushAccessLog(event.payload)
})

listen<string>('send_error_log', (event) => {
  // @ts-ignore: why payload is inferred to be string?
  store.pushErrorLog(event.payload)
})

/* -------- generate v2ray config file -------- */

export function generateV2RayConfig(): string {
  const newConfig = {
    log: {
      access: { Type: 'Console', Level: store.v2rayLogLevel },
      error: { Type: 'Console', Level: store.v2rayLogLevel }
    },
    router: {
      domainStrategy: store.domainStrategy,
      rules: store.directChina ? [
        { tag: 'direct', geoDomain: { code: 'cn' } },
        { tag: 'direct', geoip: { code: 'cn' } }
      ] : []
    },
    inbounds: [
      {
        protocol: 'socks',
        settings: {
          udp: true,
          auth: 'noauth',
        },
        port: store.socksPort,
        listen: '127.0.0.1',
      },
      {
        protocol: 'http',
        port: store.httpPort,
        listen: '127.0.0.1',
      },
    ],
    outbounds: [
      {
        protocol: store.currentServer.protocol,
        settings: {
          address: store.currentServer.address,
          port: store.currentServer.port,
          password: store.currentServer.password
        },
        tag: 'proxy',
        streamSettings: {
          transport: 'tcp',
          security: 'tls',
        }
      },
      {
        protocol: 'freedom',
        tag: 'direct',
      },
      {
        protocol: 'blackhole',
        tag: 'block',
      }
    ]
  }
  store.rules.forEach((v) => {
    // @ts-ignore
    newConfig.router.rules.push({ tag: v.tag, domain: v.domain })
  })
  return JSON.stringify(newConfig)
}

export async function startV2Ray(location: string, config: string) {
  return await invoke('start_v2ray', { location: location, config: config })
}

export async function stopV2Ray() {
  return await invoke('stop_v2ray')
}

export async function restartV2Ray(location: string, config: string) {
  return await stopV2Ray() && await startV2Ray(location, config)
}
