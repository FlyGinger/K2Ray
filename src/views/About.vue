<script setup lang='ts'>
import {
  NCard,
  NButton,
  NLayout,
  NLayoutContent,
  NSpace
} from 'naive-ui'
</script>

<template>
  <n-layout>
    <n-layout-content content-style="margin: 10px;">

      <!-- about k2ray -->
      <n-card title="K2Ray">
        <p>K2Ray 为 V2Ray 提供图形界面，并附带一些小功能。</p>
        <p>当前版本：1.0.0</p>
        <template #action>
          <n-space>
            <n-button tertiary>检查更新</n-button>
          </n-space>
        </template>
      </n-card>

    </n-layout-content>
  </n-layout>
</template>
