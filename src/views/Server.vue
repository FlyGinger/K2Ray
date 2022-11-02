<script setup lang='ts'>
import { NBadge, NButton, NCard, NDropdown, NLayout, NLayoutContent, NList, NListItem, NSpace, NText, NThing, useDialog, useMessage } from 'naive-ui'
import { useStore } from '../store/index'
import router from '../router/index'
import { fetchServers } from '../utils/subscribe'
import { ref } from 'vue'

const store = useStore()
const dialog = useDialog()
const message = useMessage()

const loading = ref(false)

function selectServerGroup(value: number) {
  store.update({ currentServerGroupIndex: value }, false)
}

function addServerGroup() {
  router.push('/single_server_group')
}

function updateServerGroup() {
  router.push({ path: '/single_server_group', query: { modifyMode: 'true' } })
}

function removeServerGroup() {
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
}

function updateSubscribe() {
  loading.value = true
  fetchServers(store.serverGroups[store.currentServerGroupIndex].subscribeURL).then((servers) => {
    loading.value = false
    store.updateSubscribe(servers)
  }).catch((err) => {
    loading.value = false
    message.error(err)
  })
}

function usingServer(index: number) {
  return store.currentServer.valid &&
    store.currentServer.serverGroupIndex === store.currentServerGroupIndex &&
    store.currentServer.serverIndex === index
}

async function useServer(index: number) {
  store.useSingleServer(index)
}

function addServer() {
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

      <!-- server groups -->
      <n-card v-if="store.serverGroups.length === 0" title="请添加服务器组和服务器">
        <template #action>
          <n-button tertiary @click="addServerGroup">添加服务器组</n-button>
        </template>
      </n-card>

      <n-card v-else :title="store.serverGroups[store.currentServerGroupIndex].name">
        <template #header-extra>
          <n-space>
            <n-button tertiary @click="addServerGroup" style="right: true;">新建</n-button>
            <n-dropdown trigger="click" :options="store.serverGroupOptions" key-field="index" label-field="name"
              @select="selectServerGroup">
              <n-button v-if="store.currentServerGroupIndex < 0" tertiary>选择</n-button>
              <n-button v-else tertiary>更换</n-button>
            </n-dropdown>
          </n-space>
        </template>

        <n-text v-if="store.currentServerGroupIsSubscribe">
          此服务器组是一个订阅分组。
        </n-text>

        <template #action>
          <n-space>
            <n-button tertiary @click="updateServerGroup" :disabled="loading">修改</n-button>
            <n-button tertiary @click="removeServerGroup" :disabled="loading">删除</n-button>
            <n-button v-if="store.currentServerGroupIsSubscribe" tertiary @click="updateSubscribe" :loading="loading">
              更新订阅</n-button>
            <n-button tertiary @click="addServer" :disabled="loading">新建服务器</n-button>
          </n-space>
        </template>
      </n-card>

      <!-- servers -->
      <n-card v-if="store.currentServerGroupIndex >= 0" title="服务器" style="margin-top: 10px;">
        <template #header-extra>
          <n-badge type="info" :value="store.currentServerGroupNumberServer" />
        </template>

        <div v-if="store.currentServerGroupNumberServer === 0">
          <n-text>此服务器组中没有服务器。</n-text>
        </div>
        <div v-else>
          <n-list hoverable>
            <n-list-item v-for="(server, index) in store.serverGroups[store.currentServerGroupIndex].servers">
              <n-thing>
                <template #header>
                  {{ server.name }}
                </template>
                <template #description>
                  {{ server.address }}
                </template>
                <template #action>
                  <n-space>
                    <n-button v-if="usingServer(index)" quaternary disabled>使用中</n-button>
                    <n-button v-else quaternary @click="useServer(index)">使用</n-button>
                    <n-button quaternary @click="updateServer(index)">修改</n-button>
                    <n-button quaternary @click="removeServer(index)">删除</n-button>
                  </n-space>
                </template>
              </n-thing>
            </n-list-item>
          </n-list>
        </div>
      </n-card>

    </n-layout-content>
  </n-layout>
</template>
