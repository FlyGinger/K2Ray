import { defineStore } from 'pinia'
import { invoke, os } from '@tauri-apps/api'
import { Command } from '@tauri-apps/api/shell'
import { listen } from '@tauri-apps/api/event'
import { Store } from 'tauri-plugin-store-api'
import { stopV2Ray, restartV2Ray } from '../utils/v2ray'

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

export const useStore = defineStore('main', {
  state: () => ({
    // dashboard
    systemProxyOn: false, // runtime
    v2rayOn: false, // runtime

    // console
    v2rayFolderLocation: '',

    // server
    currentServerGroupIndex: 0, // runtime
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

    // inbound
    socksPort: 8888,
    httpPort: 8889,

    // outbound

    // route

    // service
  }),

  actions: {
    async initialize() {
      await persist.load()
      const entries = await persist.entries()

      if (entries.length == 0) {
        // first start, create default config
        await persist.set('v2rayFolderLocation', this.v2rayFolderLocation)
        await persist.set('currentServer', this.currentServer)
        await persist.set('serverGroups', this.serverGroups)
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

      if (restart && this.v2rayOn) {
        restartV2Ray(this.v2rayFolderLocation)
      }
    },

    async addServerGroup(obj: ServerGroup) {
      this.serverGroups.push(obj)
      await persist.set('serverGroups', this.serverGroups)
      await persist.save()
    },

    async removeServerGroup() {
      if (this.currentServer.serverGroupIndex === this.currentServerGroupIndex) {
        await this.clearCurrentServer()
        stopV2Ray()
      } else if (this.currentServer.serverGroupIndex > this.currentServerGroupIndex) {
        this.currentServer.serverGroupIndex--
      }

      this.serverGroups.splice(this.currentServerGroupIndex, 1)

      if (this.serverGroups.length == 0) {
        this.currentServerGroupIndex = 0
      } else if (this.currentServerGroupIndex >= this.serverGroups.length) {
        this.currentServerGroupIndex = this.serverGroups.length - 1
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
          stopV2Ray()
        } else {
          this.setCurrentServer(this.currentServerGroupIndex, index, obj.servers[index])
          restartV2Ray(this.v2rayFolderLocation)
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
          stopV2Ray()
        } else {
          this.setCurrentServer(this.currentServerGroupIndex, index, servers[index])
          restartV2Ray(this.v2rayFolderLocation)
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
          stopV2Ray()
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
        restartV2Ray(this.v2rayFolderLocation)
      }
    },

    async useSingleServer(index: number) {
      await this.setCurrentServer(this.currentServerGroupIndex, index, this.serverGroups[this.currentServerGroupIndex].servers[index])
      restartV2Ray(this.v2rayFolderLocation)
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

await listen<string>('send_access_log', (event) => {
  // @ts-ignore: why payload is inferred to be string?
  store.pushAccessLog(event.payload)
})

await listen<string>('send_error_log', (event) => {
  // @ts-ignore: why payload is inferred to be string?
  store.pushErrorLog(event.payload)
})
