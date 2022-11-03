<script setup lang='ts'>
import { os } from '@tauri-apps/api'
import { Command } from '@tauri-apps/api/shell'
import { NBadge, NButton, NCard, NLayout, NLayoutContent, NSpace, NText, useMessage } from 'naive-ui'
import { useStore, generateV2RayConfig, startV2Ray, stopV2Ray, restartV2Ray } from '../store/index'

const store = useStore()
const message = useMessage()

// -------- system proxy --------

async function darwinGetActiveServices() {
  // find all active devices
  const deviceOutput = await new Command('darwin-ifconfig').execute()
  const deviceLines = deviceOutput.stdout.split('\n')
  const activeDevices = new Set<string>()
  let currentDeviceName = ''
  deviceLines.forEach((v) => {
    if (v.startsWith('\t')) {
      if (v.endsWith('status: active')) {
        activeDevices.add(currentDeviceName)
      }
    } else {
      const index = v.indexOf(':')
      currentDeviceName = v.substring(0, index)
    }
  })

  // find all active services
  const activeServices: string[] = []
  const serviceOutput = await new Command('darwin-networksetup', '-listnetworkserviceorder').execute()
  const serviceLines = serviceOutput.stdout.split('\n')
  serviceLines.forEach((v) => {
    if (v.startsWith('(Hardware Port: ')) {
      let start = 16
      let end = start
      while (v.charAt(end) !== ',') {
        end += 1
      }
      const serviceName = v.substring(start, end)

      start = end + 10
      end = start
      while (v.charAt(end) !== ')') {
        end += 1
      }
      const deviceName = v.substring(start, end)

      if (activeDevices.has(deviceName)) {
        activeServices.push(serviceName)
      }
    }
  })

  // return all active services on active devices
  return activeServices
}

async function setSystemProxy() {
  let platform = await os.platform()
  if (platform === 'darwin') {
    const services = await darwinGetActiveServices()
    services.forEach(async (v) => {
      await new Command('darwin-networksetup', ['-setwebproxy', v, '127.0.0.1', store.httpPort.toString()]).execute()
      await new Command('darwin-networksetup', ['-setsecurewebproxy', v, '127.0.0.1', store.httpPort.toString()]).execute()
      await new Command('darwin-networksetup', ['-setsocksfirewallproxy', v, '127.0.0.1', store.socksPort.toString()]).execute()
    })
  } else if (platform === 'win32') {
    await new Command('win32-reg', ['add', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings', '/v', 'ProxyEnable', '/t', 'REG_DWORD', '/d', '1', '/f']).execute()
    await new Command('win32-reg', ['add', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings', '/v', 'ProxyServer', '/d', `127.0.0.1:${store.httpPort}`, '/f']).execute()
  }
}

async function clearSystemProxy() {
  let platform = await os.platform()
  if (platform === 'darwin') {
    const services = await darwinGetActiveServices()
    services.forEach(async (v) => {
      await new Command('darwin-networksetup', ['-setwebproxystate', v, 'off']).execute()
      await new Command('darwin-networksetup', ['-setsecurewebproxystate', v, 'off']).execute()
      await new Command('darwin-networksetup', ['-setsocksfirewallproxystate', v, 'off']).execute()
    })
  } else if (platform === 'win32') {
    await new Command('win32-reg', ['add', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings', '/v', 'ProxyEnable', '/t', 'REG_DWORD', '/d', '0', '/f']).execute()
  }
}

async function start() {
  if (!(await startV2Ray(store.v2rayFolderPath, await generateV2RayConfig()))) {
    message.error('启动 V2Ray 时发生错误。')
  }
}

async function stop() {
  if (!(await stopV2Ray())) {
    message.error('停止 V2Ray 时发生错误。')
  }
}

async function restart() {
  if (!(await restartV2Ray(store.v2rayFolderPath, await generateV2RayConfig()))) {
    message.error('重启 V2Ray 时发生错误。')
  }
}
</script>

<template>
  <n-layout>
    <n-layout-content content-style="margin: 10px;">

      <!-- system proxy -->
      <n-card title="系统代理">
        <template #header-extra>
          <n-badge v-if="store.systemProxyOn" type="success" value="ON" />
          <n-badge v-else type="error" value="OFF" />
        </template>
        <template #action>
          <n-space>
            <n-button tertiary @click="setSystemProxy">开启</n-button>
            <n-button tertiary @click="clearSystemProxy">关闭</n-button>
          </n-space>
        </template>
      </n-card>

      <!-- v2ray state -->
      <n-card title="V2Ray 状态" style="margin-top: 10px;">
        <template #header-extra>
          <n-badge v-if="store.v2rayOn" type="success" value="ON" />
          <n-badge v-else type="error" value="OFF" />
        </template>
        <n-space vertical>
          <n-text v-if="store.currentServer.valid">正在使用：{{ store.currentServer.name }}</n-text>
          <n-text v-else>未选择服务器</n-text>
          <n-text>HTTP 端口：{{ store.httpPort }}</n-text>
          <n-text>SOCKS 端口：{{ store.socksPort }}</n-text>
        </n-space>
        <template #action>
          <n-space>
            <n-button tertiary @click="start" :disabled="!store.currentServer.valid">开启</n-button>
            <n-button tertiary @click="restart" :disabled="!store.currentServer.valid">重启</n-button>
            <n-button tertiary @click="stop">关闭</n-button>
          </n-space>
        </template>
      </n-card>

    </n-layout-content>
  </n-layout>
</template>
