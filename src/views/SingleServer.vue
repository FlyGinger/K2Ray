<script setup lang='ts'>
import { FormInst, NButton, NCard, NForm, NFormItem, NInput, NInputNumber, NLayout, NLayoutContent, NSpace, NTreeSelect, useDialog, useMessage } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { useStore } from '../store/index'
import router from '../router/index'

const store = useStore()
const dialog = useDialog()
const message = useMessage()

const formRef = ref<FormInst | null>(null)
const singleServer = ref({
  name: '',
  address: '',
  port: 0,
  password: '',
  protocol: ''
})

const modifyMode = router.currentRoute.value.query && router.currentRoute.value.query.modifyMode
// @ts-ignore
const modifyIndex = (!modifyMode) ? -1 : Number.parseInt(router.currentRoute.value.query.modifyIndex, 10)
const protocolOptions = [
  { label: 'Shadowsocks', key: 'shadowsocks' },
  { label: 'Trojan', key: 'trojan' },
  { label: 'VMess', key: 'vmess' }
]

onMounted(() => {
  console.log(modifyMode)
  console.log(modifyIndex)
  if (modifyMode) {
    const server = store.serverGroups[store.currentServerGroupIndex].servers[modifyIndex]
    singleServer.value.name = server.name
    singleServer.value.address = server.address
    singleServer.value.port = server.port
    singleServer.value.password = server.password
    singleServer.value.protocol = server.protocol
  }
})

function validator() {
  return singleServer.value.name.length > 0 &&
    singleServer.value.address.length > 0 &&
    singleServer.value.password.length > 0 &&
    singleServer.value.protocol.length > 0
}

function addSingleServer() {
  if (!validator()) {
    message.error('每项均必填。')
    return
  }
  store.addSingleServer(singleServer.value)
  router.push('/server')
}

function updateSingleServer() {
  if (!validator()) {
    message.error('每项均必填。')
    return
  }
  if (store.serverGroups[store.currentServerGroupIndex].isSubscribe) {
    dialog.warning({
      title: '警告',
      content: '这个服务器组是一个订阅分组，当前的修改会在更新订阅后消失且无法找回。',
      positiveText: '确认修改',
      negativeText: '取消',
      onPositiveClick: () => {
        store.updateSingleServer(modifyIndex, singleServer.value)
        router.push('/server')
      },
      onNegativeClick: () => { }
    })
  } else {
    store.updateSingleServer(modifyIndex, singleServer.value)
    router.push('/server')
  }
}

function cancel() {
  router.push('/server')
}
</script>

<template>
  <n-layout>
    <n-layout-content content-style="margin: 10px;">

      <!-- single server -->
      <n-card title="添加服务器">
        <n-form ref="fromRef" :model="singleServer" label-placement="left" label-width="auto">
          <n-form-item label="名称" path="name">
            <n-input v-model:value="singleServer.name" placeholder="名称" />
          </n-form-item>
          <n-form-item label="地址" path="address">
            <n-input v-model:value="singleServer.address" placeholder="地址" />
          </n-form-item>
          <n-form-item label="端口" path="port">
            <n-input-number v-model:value="singleServer.port" placeholder="0" :precision="0" :show-button="false"
              :min="0" :max="65535" />
          </n-form-item>
          <n-form-item label="密码" path="password">
            <n-input v-model:value="singleServer.password" type="password" show-password-on="mousedown"
              placeholder="密码" />
          </n-form-item>
          <n-form-item label="协议" path="protocol">
            <n-tree-select v-model:value="singleServer.protocol" :options="protocolOptions"></n-tree-select>
          </n-form-item>
        </n-form>
        <template #action>
          <n-space>
            <n-button v-if="modifyMode" tertiary @click="updateSingleServer">修改</n-button>
            <n-button v-else tertiary @click="addSingleServer">添加</n-button>
            <n-button tertiary @click="cancel">取消</n-button>
          </n-space>
        </template>
      </n-card>

    </n-layout-content>
  </n-layout>
</template>
