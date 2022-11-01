<script setup lang='ts'>
import { NButton, NCard, NDropdown, NLayout, NLayoutContent, NList, NListItem, NTabs, NTabPane, NText, NThing, useDialog, useMessage } from 'naive-ui'
import { useStore } from '../store/index'
import router from '../router/index'
import { fetchServers } from '../utils/subscribe'
import { onMounted, ref } from 'vue'

const store = useStore()
const dialog = useDialog()
const message = useMessage()

const loading = ref(false)
const currentServerGroupName = ref('')

const dropdownNormalOptions = [
  { label: '修改', key: 'update' },
  { label: '删除', key: 'delete' },
  { label: '新建服务器', key: 'add_server' },
]
const dropdownSubscribeOptions = [
  { label: '修改', key: 'update' },
  { label: '删除', key: 'delete' },
  { label: '新建服务器', key: 'add_server' },
  { label: '更新订阅', key: 'update_subsrcibe' },
]
const dropdownServerOptions = [
  { label: '使用此服务器', key: 'use' },
  { label: '修改', key: 'updae' },
  { label: '删除', key: 'delete' },
]

onMounted(() => {
  if (store.currentServerGroupIndex < store.serverGroups.length) {
    currentServerGroupName.value = store.serverGroups[store.currentServerGroupIndex].name
  }
})

function handleServerGroupSelect(key: string) {
  if (key === 'update') {
    router.push({ path: '/server_group', query: { modifyMode: 'true' } })
  } else if (key === 'delete') {
    dialog.warning({
      title: '警告',
      content: '该操作无法撤销，所有服务器信息将无法找回。',
      positiveText: '确认删除',
      negativeText: '取消',
      onPositiveClick: () => {
        store.removeServerGroup()
      },
      onNegativeClick: () => { }
    })
  } else if (key === 'add_server') {
    if (store.serverGroups[store.currentServerGroupIndex].isSubscribe) {
      dialog.warning({
        title: '警告',
        content: '这个服务器组是一个订阅分组，在此处新建的服务器会在更新订阅后消失且无法找回。',
        positiveText: '确认新建',
        negativeText: '取消',
        onPositiveClick: () => {
          router.push('/single_server')
        },
        onNegativeClick: () => { }
      })
    } else {
      router.push('/single_server')
    }
  } else if (key === 'update_subsrcibe') {
    loading.value = true
    fetchServers(store.serverGroups[store.currentServerGroupIndex].subscribeURL).then((servers) => {
      loading.value = false
      store.updateSubscribe(servers)
    }).catch((err) => {
      loading.value = false
      message.error(err)
    })
  }
}

function addServerGroup() {
  router.push('/server_group')
}

function updateSelected(value: string) {
  currentServerGroupName.value = value
  store.currentServerGroupIndex = store.serverGroups.findIndex((v) => v.name === currentServerGroupName.value)
}

async function useServer(index: number) {
  store.useSingleServer(index)
}

function updateServer(index: number) {
  router.push({ path: '/single_server', query: { modifyMode: 'true', modifyIndex: index } })
}

function removeServer(index: number) {
  dialog.warning({
    title: '警告',
    content: '该操作无法撤销，服务器信息将无法找回。',
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: () => {
      store.removeSingleServer(index)
    },
    onNegativeClick: () => { }
  })
}
</script>

<template>
  <n-layout>
    <n-layout-content content-style="margin: 10px;">

      <!-- servers -->
      <n-card v-if="store.serverGroups.length === 0" title="请添加服务器组和服务器">
        <template #action>
          <n-button tertiary @click="addServerGroup">添加服务器组</n-button>
        </template>
      </n-card>

      <n-tabs v-else type="card" addable @add="addServerGroup" animated v-model:value="currentServerGroupName"
        @update:value="updateSelected" size="large">
        <n-tab-pane v-for="group in store.serverGroups" :name="group.name" :tab="group.name">
          <n-text v-if="group.servers.length === 0" style="padding: 10px;">当前服务器组里没有服务器。</n-text>
          <n-list v-else hoverable>
            <n-list-item v-for="(server, index) in group.servers">
              <n-thing>
                <template #header>
                  {{ server.name }}
                </template>
                <template #description>
                  {{ server.address }}
                </template>
                <template #action>
                  <v-space>
                    <n-button quaternary @click="useServer(index)">使用</n-button>
                    <n-button quaternary @click="updateServer(index)">修改</n-button>
                    <n-button quaternary @click="removeServer(index)">删除</n-button>
                  </v-space>
                </template>
              </n-thing>
            </n-list-item>
          </n-list>
        </n-tab-pane>
        <template #suffix>
          <n-dropdown v-if="store.serverGroups[store.currentServerGroupIndex].isSubscribe" trigger="click"
            :options="dropdownSubscribeOptions" @select="handleServerGroupSelect">
            <n-button quaternary :loading="loading">选项</n-button>
          </n-dropdown>
          <n-dropdown v-else trigger="click" :options="dropdownNormalOptions" @select="handleServerGroupSelect">
            <n-button quaternary>选项</n-button>
          </n-dropdown>
        </template>
      </n-tabs>

    </n-layout-content>
  </n-layout>
</template>
