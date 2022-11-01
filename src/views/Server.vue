<script setup lang='ts'>
import {
  NButton,
  NCard,
  NDropdown,
  NLayout,
  NLayoutContent,
  NList,
  NListItem,
  NTabs,
  NTabPane,
  NText,
  NThing,
  useDialog,
useMessage
} from 'naive-ui'
import { useStore } from '../store/index'
import router from '../router/index'
import { fetchServers } from '../utils/subscribe'
import { ref } from 'vue'

const store = useStore()
const dialog = useDialog()
const message = useMessage()

const loading = ref(false)

const dropdownNormalOptions = [
  { label: '修改', key: 'modify' },
  { label: '删除', key: 'delete' },
]

const dropdownSubscribeOptions = [
  { label: '修改', key: 'modify' },
  { label: '删除', key: 'delete' },
  { label: '更新订阅', key: 'update' },
]

function handleSelect(key: string) {
  if (key === 'modify') {
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
  } else if (key === 'update') {
    loading.value = true
    fetchServers(store.currentServerGroup.subscribeURL).then((servers) => {
      loading.value = false
      store.currentServerGroup.servers = servers
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
  store.currentServerGroupTabName = value
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

      <n-tabs v-else type="card" addable @add="addServerGroup" animated v-model:value="store.currentServerGroupTabName"
        @update:value="updateSelected" size="large">
        <n-tab-pane v-for="group in store.serverGroups" :name="group.name" :tab="group.name">
          <n-text v-if="group.servers.length === 0" style="padding: 10px;">当前服务器组里没有服务器。</n-text>
          <n-list v-else clickable hoverable>
            <n-list-item v-for="server in group.servers">
              <n-thing>
                <template #description>
                  {{ server.name }} @ {{ server.address }}
                </template>
              </n-thing>
            </n-list-item>
          </n-list>
        </n-tab-pane>
        <template #suffix>
          <n-dropdown v-if="store.currentServerGroupIsSubscribe" trigger="click" :options="dropdownSubscribeOptions"
            @select="handleSelect">
            <n-button tertiary :loading="loading">选项</n-button>
          </n-dropdown>
          <n-dropdown v-else trigger="click" :options="dropdownNormalOptions" @select="handleSelect">
            <n-button tertiary>选项</n-button>
          </n-dropdown>
        </template>
      </n-tabs>

    </n-layout-content>
  </n-layout>
</template>
