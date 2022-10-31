<script setup lang="ts">
import {
  NButton,
  NCard,
  NLayout,
  NLayoutContent,
  NSpace
} from "naive-ui"
</script>

<template>
  <n-layout>
    <n-layout-content content-style="margin: 10px;">

      <!-- V2Ray 位置 -->
      <n-card title="V2Ray 位置">
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
