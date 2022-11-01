<script setup lang='ts'>
import { invoke, os } from '@tauri-apps/api'
import { Command } from '@tauri-apps/api/shell';
import { useStore } from '../store/index'
import {
  NBadge,
  NButton,
  NCard,
  NLayout,
  NLayoutContent,
  NSpace
} from 'naive-ui'

const store = useStore()

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

// -------- v2ray state --------

async function runV2Ray() {
  await invoke('run_v2ray')
}

async function stopAndRunV2Ray() {
  await stopV2Ray()
  await runV2Ray()
}

async function stopV2Ray() {
  await invoke('stop_v2ray')
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
        <p>正在使用：{{ store.currentServer.name }}</p>
        <p>HTTP 端口：{{ store.httpPort }}</p>
        <p>SOCKS 端口：{{ store.socksPort }}</p>
        <template #action>
          <n-space>
            <n-button tertiary @click="runV2Ray">开启</n-button>
            <n-button tertiary @click="stopAndRunV2Ray">重启</n-button>
            <n-button tertiary @click="stopV2Ray">关闭</n-button>
          </n-space>
        </template>
      </n-card>

    </n-layout-content>
  </n-layout>
</template>
