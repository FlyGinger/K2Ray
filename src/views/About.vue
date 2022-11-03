<script setup lang='ts'>
import { NCard, NButton, NLayout, NLayoutContent, NSpace, NText } from 'naive-ui'
import { useMessage } from 'naive-ui';

const message = useMessage()

function checkUpdate() {
  message.info('说了还没做。')
}
</script>

<template>
  <n-layout>
    <n-layout-content content-style="margin: 10px;">

      <!-- about k2ray -->
      <n-card title="K2Ray">
        <n-space vertical>
          <n-text>K2Ray 为 V2Ray 提供图形界面，并附带一些小功能。</n-text>
          <n-text>当前版本：0.5.2</n-text>
        </n-space>
        <template #action>
          <n-space>
            <n-button tertiary @click="checkUpdate">还没做的检查更新功能</n-button>
          </n-space>
        </template>
      </n-card>

    </n-layout-content>
  </n-layout>
</template>
