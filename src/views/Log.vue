<script setup lang="ts">
import { ref } from 'vue'
import {
  FormInst,
  NButton,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NInputGroup,
  NInputNumber,
  NLayout,
  NLayoutContent,
  NLog,
  NSelect,
  NSwitch
} from "naive-ui"

const logLevelOptions = [
  'Debug',
  'Info',
  'Warning',
  'Error',
  'None'
].map((v) => ({ label: v, value: v }))

const formRef = ref<FormInst | null>(null)
const logConfig = ref({
  loglLevel: null,
  saveToFile: false,
  logFilePath: null,
  displayNumberLine: 0
})
const logContent = ["111", "222", "333"]
</script>

<template>
  <n-layout>
    <n-layout-content content-style="margin: 10px;">

      <!-- 设置 -->
      <n-card title="设置">
        <n-form ref="formRef" :model="logConfig" label-placement="left" label-align="right" label-width="auto">
          <n-form-item label="日志等级" path="loglLevel">
            <n-select placeholder="日志等级" v-model:value="logConfig.loglLevel" :options="logLevelOptions" />
          </n-form-item>
          <n-form-item label="保存日志" path="saveToFile">
            <n-switch v-model:value="logConfig.saveToFile" />
          </n-form-item>
          <Transition>
            <n-form-item v-if="logConfig.saveToFile" label="保存路径" path="logFilePath">
              <n-input-group>
                <n-input v-model:value="logConfig.logFilePath" placeholder="保存路径" />
                <n-button tertiary>浏览</n-button>
              </n-input-group>
            </n-form-item>
          </Transition>
          <n-form-item label="显示条数" path="displayNumberLine">
            <n-input-number v-model:value="logConfig.displayNumberLine" step=100 />
          </n-form-item>
        </n-form>
      </n-card>

      <!-- 日志 -->
      <Transition>
        <n-card v-if="logConfig.displayNumberLine > 0" title="日志" style="margin-top: 10px;">
          <n-log :lines="logContent" :rows=20 style="background-color: #f6f6f6; padding: 10px;" />
        </n-card>
      </Transition>

    </n-layout-content>
  </n-layout>
</template>
