<script setup lang="ts">
import { invoke } from '@tauri-apps/api';
import { useStore } from '../store/index';
import {
  NBadge,
  NButton,
  NCard,
  NLayout,
  NLayoutContent,
  NSpace
} from "naive-ui"

const store = useStore();

function runV2Ray() {
  invoke("run_v2ray").then((res) => console.log(res))
}

function stopV2Ray() {
  invoke("stop_v2ray").then((res) => console.log(res))
}
</script>

<template>
  <n-layout>
    <n-layout-content content-style="margin: 10px;">

      <!-- 系统代理 -->
      <n-card title="系统代理">
        <template #header-extra>
          <n-badge type="error" value="OFF" />
        </template>
        <template #action>
          <n-space>
            <n-button tertiary>开启</n-button>
            <n-button tertiary>关闭</n-button>
          </n-space>
        </template>
      </n-card>

      <!-- V2Ray 状态 -->
      <n-card title="V2Ray 状态" style="margin-top: 10px;">
        <template #header-extra>
          <n-badge type="error" value="OFF" />
        </template>
        <p>正在使用：xxx服务器</p>
        <p>HTTP 端口：8888</p>
        <p>SOCKS 端口：8889</p>
        <template #action>
          <n-space>
            <n-button tertiary @click="runV2Ray">开启</n-button>
            <n-button tertiary>重启</n-button>
            <n-button tertiary @click="stopV2Ray">关闭</n-button>
          </n-space>
        </template>
      </n-card>

      <!-- V2Ray 位置 -->
      <n-card title="V2Ray 位置" style="margin-top: 10px;">
        当前位置：xxxxxx
        <template #action>
          <n-space>
            <n-button tertiary>修改</n-button>
          </n-space>
        </template>
      </n-card>

    </n-layout-content>
  </n-layout>
</template>
