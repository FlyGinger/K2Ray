<script setup lang='ts'>
import {
  FormInst,
  NButton,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NLayout,
  NLayoutContent,
  NSpace,
  NSwitch,
  useMessage
} from 'naive-ui'
import { ref } from 'vue'
import { useStore, Server } from '../store/index'
import router from '../router/index'
import { fetch, ResponseType } from '@tauri-apps/api/http';
import { decode } from 'js-base64'

const store = useStore()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const serverGroup = ref({
  name: '',
  isSubscribe: false,
  subscribeURL: ''
})

const loading = ref(false)
async function addServerGroup() {
  if (store.serverGroups.has(serverGroup.value.name)) {
    message.error('服务器组名称已经存在。')
    return
  }

  const sg = {
    name: serverGroup.value.name,
    isSubscribe: serverGroup.value.isSubscribe,
    subscribeURL: serverGroup.value.subscribeURL,
    servers: new Map<string, Server>()
  }

  if (serverGroup.value.isSubscribe) {
    loading.value = true
    fetch(serverGroup.value.subscribeURL, { method: 'GET', responseType: ResponseType.Text }).then((response) => {
      if (response.ok) {
        // @ts-ignore
        const text = decode(response.data)
        const lines = text.split('\n')

        // format: protocol://password@address:port#name
        lines.forEach((line) => {
          const server = {
            name: '',
            address: '',
            port: 0,
            password: '',
            protocol: ''
          }

          line = line.trim()

          // protocol
          const protocolIndex = line.indexOf('://')
          if (protocolIndex <= 0) {
            return
          }
          server.protocol = line.substring(0, protocolIndex)
          line = line.substring(protocolIndex + 3)

          // password
          const passwordIndex = line.indexOf('@')
          if (passwordIndex <= 0) {
            return
          }
          server.password = line.substring(0, passwordIndex)
          line = line.substring(passwordIndex + 1)

          // address
          const addressIndex = line.indexOf(':')
          if (addressIndex <= 0) {
            return
          }
          server.address = line.substring(0, addressIndex)
          line = line.substring(addressIndex + 1)

          // port
          const portIndex = line.indexOf('#')
          if (portIndex <= 0) {
            return
          }
          server.port = Number.parseInt(line.substring(0, portIndex), 10)
          line = line.substring(portIndex + 1)

          // name
          if (line.length == 0) {
            return
          }
          server.name = line

          // ok
          sg.servers.set(server.name, server)
        })
      }
    }).catch(() => {
      message.error('无法从订阅链接获取数据，请检查链接和网络。')
    })
    loading.value = false
  }

  store.addServerGroup(sg)

  store.currentServerGroupTabName = serverGroup.value.name
  router.push('/server')
}

function cancel() {
  router.push('/server')
}
</script>

<template>
  <n-layout>
    <n-layout-content content-style="margin: 10px;">

      <!-- server group -->
      <n-card title="添加服务器组">
        <n-form ref="fromRef" :model="serverGroup" label-placement="left" label-width="auto">
          <n-form-item label="名称" path="name">
            <n-input v-model:value="serverGroup.name" placeholder="名称" />
          </n-form-item>
          <n-form-item label="订阅" path="isSubscribe">
            <n-switch v-model:value="serverGroup.isSubscribe" />
          </n-form-item>
          <Transition>
            <n-form-item v-if="serverGroup.isSubscribe" label="链接" path="subscribeURL">
              <n-input v-model:value="serverGroup.subscribeURL" placeholder="链接" />
            </n-form-item>
          </Transition>
        </n-form>
        <template #action>
          <n-space>
            <n-button tertiary @click="addServerGroup" :loading="loading">添加</n-button>
            <n-button tertiary @click="cancel" :disabled="loading">取消</n-button>
          </n-space>
        </template>
      </n-card>

    </n-layout-content>
  </n-layout>
</template>
