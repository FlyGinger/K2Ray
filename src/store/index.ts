import { defineStore } from 'pinia'
import { invoke, os } from '@tauri-apps/api'
import { Command } from '@tauri-apps/api/shell'
import { listen } from '@tauri-apps/api/event'

export const useStore = defineStore('main', {
  state: () => ({
    // dashboard
    systemProxyOn: false, // runtime
    v2rayOn: false, // runtime

    // console
    v2rayPath: '',

    // server
    currentServer: {
      name: 'hahaha'
    }, // runtime

    // log
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
    update(obj: Object) {
      this.$patch(obj)
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

const store = useStore()

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
