<script setup lang='ts'>
import router from './router/index'
import { NButton, NConfigProvider, NDialogProvider, NDivider, NGradientText, NGrid, NGi, NH1, NImage, NLayout, NLayoutHeader, NLayoutSider, NLayoutContent, NMessageProvider, NText } from 'naive-ui'
</script>

<script lang='ts'>
export default {
  data: () => ({
    pages: [
      { title: '仪表盘', path: '/dashboard' },
      { title: '控制台', path: '/console' },
      { title: '服务器', path: '/server' },
      { title: '日志', path: '/log' },
      // { title: 'DNS', path: '/dns' },
      { title: '路由', path: '/route' },
      { title: '入站', path: '/inbound' },
      // { title: '出站', path: '/outbound' },
      // { title: '服务', path: '/service' },
      { title: '关于', path: '/about' },
    ]
  })
}

const themeOverrides = {
  'common': {
    'primaryColor': '#6DA9CEFF',
    'primaryColorHover': '#7DB9DEFF',
    'primaryColorPressed': '#5D99BEFF',
    'primaryColorSuppl': '#7DB9DEFF'
  },
  'Card': {
    'actionColor': '#FFFFFFFF'
  }
}
</script>

<template>
  <!-- wrapper of main window, providing global config sucn as naive-ui style -->
  <n-config-provider :theme-overrides="themeOverrides" style="height: 100%;">
    <n-message-provider>
      <n-dialog-provider>

        <!-- main window -->
        <n-layout has-sider position="absolute">

          <!-- side bar -->
          <n-layout-sider bordered width=160>

            <!-- header of side bar -->
            <n-layout-header style="padding-top: 10px; padding-bottom: 10px;">
              <n-grid cols=4>
                <n-gi span=1>
                  <n-image width=30 src="logo.png" style="padding: 9px;" />
                </n-gi>
                <n-gi span=3>
                  <n-h1 style="margin: 0px;">
                    <n-gradient-text :gradient='{
                      deg: 90,
                      from: "rgb(125,185,222)",
                      to: "rgb(160,230,255)"
                    }'>
                      K2Ray
                    </n-gradient-text>
                  </n-h1>
                </n-gi>
              </n-grid>
            </n-layout-header>

            <n-divider dashed style="margin-top: 0; margin-bottom: 10px;" />

            <!-- body of side bar -->
            <n-layout-content v-for="page in pages">
              <n-button quaternary size="large" @click="router.push(page.path)">
                <n-text strong>{{ page.title }}</n-text>
              </n-button>
            </n-layout-content>

          </n-layout-sider>

          <!-- body of main window -->
          <n-layout-content :native-scrollbar="false">
            <router-view />
          </n-layout-content>

        </n-layout>

      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped>
.n-button {
  width: 100%;
}
</style>
