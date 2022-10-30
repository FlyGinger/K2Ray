<script setup lang="ts">
import { NButton, NConfigProvider, NGrid, NGi, NH1, NImage, NLayout, NLayoutHeader, NLayoutSider, NLayoutContent, NText } from "naive-ui";
import router from './router/index'
</script>

<script lang="ts">
export default {
  data: () => ({
    kPages: [
      { title: '仪表盘', path: '/k-dashboard-page' },
      { title: '控制台', path: '/k-console-page' },
      { title: '关于', path: '/k-about-page' },
    ],
    vPages: [
      { title: '日志', path: '/v-log-page' },
      { title: 'DNS', path: '/v-dns-page' },
      { title: '路由', path: '/v-route-page' },
      { title: '入站', path: '/v-inbound-page' },
      { title: '出站', path: '/v-outbound-page' },
      { title: '服务', path: '/v-service-page' },
      { title: '关于', path: '/v-about-page' },
    ]
  })
};
</script>

<template>
  <!-- 主窗口的 wrapper，提供 naive-ui 的样式等全局配置 -->
  <n-config-provider style="height: 100%;">

    <!-- 主窗口 -->
    <n-layout has-sider position="absolute">

      <!-- 侧边栏 -->
      <n-layout-sider bordered native-scrollbar width=160>

        <!-- 侧边栏页首 -->
        <n-layout-header style="padding-top: 10px; padding-bottom: 20px;">
          <n-grid cols=4>
            <n-gi span=1>
              <n-image width=30 src="logo.png" style="padding: 9px;" />
            </n-gi>
            <n-gi span=3>
              <n-h1 style="margin: 0;">K2Ray</n-h1>
            </n-gi>
          </n-grid>
        </n-layout-header>

        <!-- 侧边栏主体：K2Ray 部分 -->
        <n-layout-content>
          <n-text depth=3 style="padding: 10px;">K2Ray 设置</n-text>
        </n-layout-content>
        <n-layout-content v-for="page in kPages">
          <n-button quaternary size="large" @click="router.push(page.path)">
            <n-text strong>{{ page.title }}</n-text>
          </n-button>
        </n-layout-content>

        <!-- 侧边栏主体：V2Ray 部分 -->
        <n-layout-content style="padding-top: 10px;">
          <n-text depth=3 style="padding: 10px;">V2Ray 设置</n-text>
        </n-layout-content>
        <n-layout-content v-for="page in vPages">
          <n-button quaternary size="large" @click="router.push(page.path)">
            <n-text strong>{{ page.title }}</n-text>
          </n-button>
        </n-layout-content>

      </n-layout-sider>

      <!-- 主窗口主体部分，利用 vue route 实现切换页面 -->
      <n-layout-content>
        <router-view />
      </n-layout-content>

    </n-layout>

  </n-config-provider>
</template>

<style scoped>
.n-button {
  width: 100%;
}
</style>
