<script setup lang='ts'>
import { FormInst, NButton, NCard, NForm, NFormItem, NInput, NLayout, NLayoutContent, NSelect, NSpace, useMessage } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { useStore } from '../store/index'
import router from '../router/index'

const store = useStore()
const message = useMessage()

const formRef = ref<FormInst | null>(null)
const rule = ref({
  tag: '',
  domain: ''
})

const ruleTagOptions = [
  { label: '代理', value: 'proxy' },
  { label: '直连', value: 'direct' },
  { label: '阻止', value: 'block' }
]

const modifyMode = router.currentRoute.value.query && router.currentRoute.value.query.modifyMode
// @ts-ignore
const modifyIndex = (!modifyMode) ? -1 : Number.parseInt(router.currentRoute.value.query.modifyIndex, 10)

onMounted(() => {
  if (modifyMode) {
    rule.value.tag = store.rules[modifyIndex].tag
    rule.value.domain = store.rules[modifyIndex].domain
  }
})

function validator() {
  return rule.value.tag.length > 0 && rule.value.domain.length > 0
}

function addRouteRule() {
  if (!validator()) {
    message.error('请填写规则配置信息。')
    return
  }
  store.addRouteRule(rule.value)
  router.push('/route')
}

function updateRouteRule() {
  if (!validator()) {
    message.error('请填写规则配置信息。')
    return
  }
  store.updateRouteRule(modifyIndex, rule.value)
  router.push('/route')
}

function cancel() {
  router.push('/route')
}
</script>

<template>
  <n-layout>
    <n-layout-content content-style="margin: 10px;">

      <!-- single router rule -->
      <n-card :title="modifyMode ? '修改规则' : '添加规则'">
        <n-form ref="fromRef" :model="rule" label-placement="left" label-width="auto">
          <n-form-item label="出站" path="tag">
            <n-select v-model:value="rule.tag" :options="ruleTagOptions">
            </n-select>
          </n-form-item>
          <n-form-item label="域名" path="domain">
            <n-input v-model:value="rule.domain" placeholder="域名" />
          </n-form-item>
        </n-form>
        <template #action>
          <n-space>
            <n-button v-if="modifyMode" tertiary @click="updateRouteRule">修改</n-button>
            <n-button v-else tertiary @click="addRouteRule">添加</n-button>
            <n-button tertiary @click="cancel">取消</n-button>
          </n-space>
        </template>
      </n-card>

    </n-layout-content>
  </n-layout>
</template>
