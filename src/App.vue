<script setup lang="ts">
import { NButton, NConfigProvider, NGrid, NGi, NH1, NImage, NLayout, NLayoutHeader, NLayoutSider, NLayoutContent, NText } from "naive-ui";
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
        <n-layout-content>
          <n-button quaternary size="large">
            <n-text strong>文字</n-text>
          </n-button>
        </n-layout-content>
        <n-layout-content>
          <n-button quaternary size="large">文字文字</n-button>
        </n-layout-content>
        <n-layout-content>
          <n-button quaternary size="large">文字文字文字</n-button>
        </n-layout-content>

        <!-- 侧边栏主体：V2Ray 部分 -->
        <n-layout-content style="padding-top: 10px;">
          <n-text depth=3 style="padding: 10px;">V2Ray 设置</n-text>
        </n-layout-content>
        <n-layout-content>
          <n-button quaternary size="large">文字</n-button>
        </n-layout-content>
        <n-layout-content>
          <n-button quaternary size="large">文字</n-button>
        </n-layout-content>
        <n-layout-content>
          <n-button quaternary size="large">文字</n-button>
        </n-layout-content>
        <n-layout-content>
          <n-button quaternary size="large">文字</n-button>
        </n-layout-content>
        <n-layout-content>
          <n-button quaternary size="large">文字</n-button>
        </n-layout-content>
        <n-layout-content>
          <n-button quaternary size="large">文字</n-button>
        </n-layout-content>
      </n-layout-sider>

      <!-- 主窗口主体部分，利用 vue route 实现切换页面 -->
      <n-layout-content>
        <div>placeholder</div>
      </n-layout-content>

    </n-layout>
  </n-config-provider>
</template>

<style scoped>
.n-button {
  width: 100%;
}
</style>
