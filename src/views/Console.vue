<script setup lang='ts'>
import { NButton, NCard, NLayout, NLayoutContent, NSpace } from 'naive-ui'
import { useStore } from '../store/index'
import { invoke } from '@tauri-apps/api'
import { open } from '@tauri-apps/api/dialog'
import { appDir } from '@tauri-apps/api/path'

const store = useStore()

async function selectV2RayFolder() {
  const selected = await open({
    directory: true,
    multiple: false,
    defaultPath: await appDir()
  })
  if (selected) {
    store.update({ 'v2rayFolderLocation': selected })
    if (store.v2rayOn) {
      await invoke('stop_v2ray')
      await invoke('run_v2ray', { 'location': store.v2rayFolderLocation })
    }
  }
}
</script>

<template>
  <n-layout>
    <n-layout-content content-style="margin: 10px;">

      <!-- v2ray location -->
      <n-card title="V2Ray 位置">
        当前位置：{{ store.v2rayFolderLocation }}
        <template #action>
          <n-space>
            <n-button tertiary @click="selectV2RayFolder">修改</n-button>
          </n-space>
        </template>
      </n-card>

    </n-layout-content>
  </n-layout>
</template>
