<script setup lang='ts'>
import { ref } from 'vue';
import { useStore } from '../store'
import { NCard, NForm, NFormItem, NInputNumber, NLayout, NLayoutContent, NLog, NSelect } from 'naive-ui'

const logLevelOptions = [
  'Debug',
  'Info',
  'Warning',
  'Error',
  'None'
].map((v) => ({ label: v, value: v }))

const store = useStore()

const currentPage = ref('access')

const logType = [{ label: '访问日志', value: 'access' }, { label: '错误日志', value: 'error' }]

function updateLogLevel(value: string) {
  store.update({ v2rayLogLevel: value }, true)
}

function updateLogSize(value: number | null) {
  if (value) {
    store.update({ v2rayLogSize: value }, false)
  }
}
</script>

<template>
  <n-layout>
    <n-layout-content content-style="margin: 10px;">

      <!-- preference -->
      <n-card title="设置">
        <n-form label-placement="left" label-align="right" label-width="auto">
          <n-form-item label="日志等级" path="loglLevel">
            <n-select placeholder="日志等级" v-model:value="store.v2rayLogLevel" :options="logLevelOptions"
              @update:value="updateLogLevel" />
          </n-form-item>
          <n-form-item label="显示条数" path="displayNumberLine">
            <n-input-number v-model:value="store.v2rayLogSize" :step="100" @update:value="updateLogSize" />
          </n-form-item>
        </n-form>
      </n-card>

      <!-- log -->
      <Transition>
        <n-card title="日志" style="margin-top: 10px">
          <template #header-extra>
            <n-select v-model:value="currentPage" :options="logType" :consistent-menu-width="false"></n-select>
          </template>
          <n-log v-if="currentPage === 'access'" :lines="store.v2rayAccessLog" :rows=12 style="background-color: #f6f6f6; padding: 10px;" />
          <n-log v-else :lines="store.v2rayErrorLog" :rows=12 style="background-color: #f6f6f6; padding: 10px;" />    
        </n-card>
      </Transition>

    </n-layout-content>
  </n-layout>
</template>
