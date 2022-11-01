<script setup lang='ts'>
import {
  NButton,
  NCard,
  NLayout,
  NLayoutContent,
  NTabs,
  NTabPane,
  NText
} from 'naive-ui'
import { useStore } from '../store/index'
import router from '../router/index'

const store = useStore()

async function addServerGroup() {
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
      <n-card v-if="store.serverGroups.size === 0" title="请添加服务器组和服务器">
        <template #action>
          <n-button tertiary @click="addServerGroup">添加服务器组</n-button>
        </template>
      </n-card>

      <n-tabs v-else type="card" addable @add="addServerGroup" animated v-model:value="store.currentServerGroupTabName"
        @update:value="updateSelected">
        <n-tab-pane v-for="group in store.serverGroups.values()" :name="group.name" :tab="group.name">
          <n-text v-if="group.servers.size === 0" style="padding: 10px;">当前服务器组里没有服务器。</n-text>
        </n-tab-pane>
        <template #suffix>
          <n-dropdown>
            <n-button tertiary>修改</n-button>
          </n-dropdown>
        </template>
      </n-tabs>

    </n-layout-content>
  </n-layout>
</template>
