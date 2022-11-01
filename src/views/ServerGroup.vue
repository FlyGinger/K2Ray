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

onMounted(() => {
  if (router.currentRoute.value.query && router.currentRoute.value.query.modifyMode) {
    let index = store.serverGroups.findIndex((v) => v.name === store.currentServerGroupTabName)
    if (index < 0) {
      return
    }
    serverGroup.value.name = store.serverGroups[index].name
    serverGroup.value.isSubscribe = store.serverGroups[index].isSubscribe
    serverGroup.value.subscribeURL = store.serverGroups[index].subscribeURL
  }
})

const loading = ref(false)

async function addServerGroup() {
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
      store.addServerGroup(sg)
      store.currentServerGroupTabName = serverGroup.value.name
      router.push('/server')
    }).catch((err) => {
      loading.value = false
      message.error(err)
    })
  } else {
    store.addServerGroup(sg)
    store.currentServerGroupTabName = serverGroup.value.name
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
            <n-button tertiary @click="addServerGroup" :loading="loading">添加</n-button>
            <n-button tertiary @click="cancel" :disabled="loading">取消</n-button>
          </n-space>
        </template>
      </n-card>

    </n-layout-content>
  </n-layout>
</template>
