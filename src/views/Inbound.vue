<script setup lang='ts'>
import { NCard, NForm, NFormItem, NInputNumber, NLayout, NLayoutContent } from 'naive-ui'
import { useStore } from '../store/index'

const store = useStore()

function updateHTTPPort(value: number | null) {
  if (value) {
    store.update({ httpPort: value }, true)
  }
}

function updateSocksPort(value: number | null) {
  if (value) {
    store.update({ socksPort: value }, true)
  }
}
</script>

<template>
  <n-layout>
    <n-layout-content content-style="margin: 10px;">

      <!-- inbound -->
      <n-card title="入站设置">
        <n-form label-placement="left" label-width="auto">
          <n-form-item label="HTTP(S) 端口">
            <n-input-number v-model:value="store.httpPort" placeholder="6666" :precision="0" :show-button="false"
              :min="0" :max="65535" @update:value="updateHTTPPort" />
          </n-form-item>
          <n-form-item label="Socks 端口">
            <n-input-number v-model:value="store.socksPort" placeholder="8888" :precision="0" :show-button="false"
              :min="0" :max="65535" @update:value="updateSocksPort" />
          </n-form-item>
        </n-form>
      </n-card>

    </n-layout-content>
  </n-layout>
</template>
