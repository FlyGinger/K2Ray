<script setup lang='ts'>
import { FormInst, FormItemRule, NButton, NCard, NForm, NFormItem, NInput, NLayout, NLayoutContent, NSpace, NSwitch, useMessage } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { useStore, Server } from '../store/index'
import router from '../router/index'
import { fetchServers } from '../utils/subscribe'

const store = useStore()
const message = useMessage()

const formRef = ref<FormInst | null>(null)
const serverGroup = ref({
  name: '',
  isSubscribe: false,
  subscribeURL: ''
})
const loading = ref(false)

const modifyMode = router.currentRoute.value.query && router.currentRoute.value.query.modifyMode

onMounted(() => {
  if (modifyMode) {
    serverGroup.value.name = store.serverGroups[store.currentServerGroupIndex].name
    serverGroup.value.isSubscribe = store.serverGroups[store.currentServerGroupIndex].isSubscribe
    serverGroup.value.subscribeURL = store.serverGroups[store.currentServerGroupIndex].subscribeURL
  }
})

async function addServerGroup() {
  if (serverGroup.value.name.length === 0) {
    message.error('服务器组名称不可为空。')
    return
  }

  const index = store.serverGroups.findIndex((v) => v.name === serverGroup.value.name)
  if (index >= 0) {
    message.error('服务器组名称已经存在。')
    return
  }

  const sg = {
    name: serverGroup.value.name,
    isSubscribe: serverGroup.value.isSubscribe,
    subscribeURL: serverGroup.value.subscribeURL,
    servers: [] as Server[]
  }

  if (serverGroup.value.isSubscribe) {
    loading.value = true
    fetchServers(serverGroup.value.subscribeURL).then((servers) => {
      loading.value = false
      sg.servers.push(...servers)
      store.currentServerGroupIndex = store.serverGroups.length
      store.addServerGroup(sg)
      router.push('/server')
    }).catch((err) => {
      loading.value = false
      message.error(err)
    })
  } else {
    store.currentServerGroupIndex = store.serverGroups.length
    store.addServerGroup(sg)
    router.push('/server')
  }
}

function updateServerGroup() {
  if (serverGroup.value.name.length === 0) {
    message.error('服务器组名称不可为空。')
    return
  }

  const index = store.serverGroups.findIndex((v) => v.name === serverGroup.value.name)
  if (index >= 0) {
    message.error('服务器组名称已经存在。')
    return
  }

  const sg = {
    name: serverGroup.value.name,
    isSubscribe: serverGroup.value.isSubscribe,
    subscribeURL: serverGroup.value.subscribeURL,
    servers: [] as Server[]
  }

  if (serverGroup.value.isSubscribe) {
    loading.value = true
    fetchServers(serverGroup.value.subscribeURL).then((servers) => {
      loading.value = false
      sg.servers.push(...servers)
      store.updateServerGroup(sg)
      router.push('/server')
    }).catch((err) => {
      loading.value = false
      message.error(err)
    })
  } else {
    store.updateServerGroup(sg)
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
            <n-button v-if="modifyMode" tertiary @click="updateServerGroup" :loading="loading">修改</n-button>
            <n-button v-else tertiary @click="addServerGroup" :loading="loading">添加</n-button>
            <n-button tertiary @click="cancel" :disabled="loading">取消</n-button>
          </n-space>
        </template>
      </n-card>

    </n-layout-content>
  </n-layout>
</template>
