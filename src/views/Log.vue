<script setup lang='ts'>
import { ref, onMounted, watchEffect, nextTick } from 'vue';
import { useStore } from '../store'
import { LogInst, NCard, NForm, NFormItem, NLayout, NLayoutContent, NLog, NSelect } from 'naive-ui'

const logLevelOptions = [
  'Debug',
  'Info',
  'Warning',
  'Error',
  'None'
].map((v) => ({ label: v, value: v }))

const store = useStore()

const currentPage = ref('access')
const accessLogInstRef = ref<LogInst | null>(null)
const errorLogInstRef = ref<LogInst | null>(null)

const logType = [{ label: '访问日志', value: 'access' }, { label: '错误日志', value: 'error' }]

onMounted(() => {
  watchEffect(() => {
    if (store.v2rayAccessLog) {
      nextTick(() => {
        accessLogInstRef.value?.scrollTo({ position: 'bottom', slient: true })
      })
    }
  })
  watchEffect(() => {
    if (store.v2rayErrorLog) {
      nextTick(() => {
        errorLogInstRef.value?.scrollTo({ position: 'bottom', slient: true })
      })
    }
  })
})

function updateLogLevel(value: string) {
  store.update({ v2rayLogLevel: value }, true)
}

function selectLogPage(value: string) {
  currentPage.value = value
  if (value === 'access') {
    nextTick(() => {
      accessLogInstRef.value?.scrollTo({ position: 'bottom', slient: true })
    })
  } else {
    nextTick(() => {
      errorLogInstRef.value?.scrollTo({ position: 'bottom', slient: true })
    })
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
        </n-form>
      </n-card>

      <!-- log -->
      <Transition>
        <n-card title="日志" style="margin-top: 10px">
          <template #header-extra>
            <n-select v-model:value="currentPage" :options="logType" @update:value="selectLogPage"
              :consistent-menu-width="false"></n-select>
          </template>
          <n-log v-if="currentPage === 'access'" ref="accessLogInstRef" :log="store.v2rayAccessLog" :rows=15
            style="background-color: #f6f6f6; padding: 10px;" />
          <n-log v-else ref="errorLogInstRef" :log="store.v2rayErrorLog" :rows=15
            style="background-color: #f6f6f6; padding: 10px;" />
        </n-card>
      </Transition>

    </n-layout-content>
  </n-layout>
</template>
