<script setup lang='ts'>
import router from '../router/index'
import { useStore } from '../store'
import { NBadge, NButton, NCard, NForm, NFormItem, NLayout, NLayoutContent, NList, NListItem, NSelect, NSpace, NSwitch, NThing } from 'naive-ui'

const store = useStore()

const domainStrategyOptions = [
  { label: '只使用域名', value: 'AsIs' },
  { label: '域名没有匹配时再使用 IP', value: 'IPIfNonMatch' },
  { label: '遇到基于 IP 的规则时使用 IP', value: 'IPOnDemand' },
  { label: '只使用 IP', value: 'UseIp' },
]
const outboundName = new Map()
outboundName.set('proxy', '代理')
outboundName.set('direct', '直连')
outboundName.set('block', '阻止')

function updateDomainStrategy(value: string) {
  store.update({ domainStrategy: value }, true)
}

function updateDirectChina(value: boolean) {
  store.update({ directChina: value }, true)
}

function addRule() {
  router.push('/single_route_rule')
}

function updateRule(index: number) {
  router.push({ path: '/single_route_rule', query: { modifyMode: 'true', modifyIndex: index } })
}

function removeRule(index: number) {
  store.removeRouteRule(index)
}

function clearRule() {
  store.clearRouteRule()
}
</script>

<template>
  <n-layout>
    <n-layout-content content-style="margin: 10px;">

      <!-- route -->
      <n-card title="路由">
        <n-form label-placement="left" label-width="auto">
          <n-form-item label="匹配策略">
            <n-select v-model:value="store.domainStrategy" :options="domainStrategyOptions"
              @update:value="updateDomainStrategy"></n-select>
          </n-form-item>
          <n-form-item label="大陆域名与 IP 直接连接">
            <n-switch v-model:value="store.directChina" @update:value="updateDirectChina" />
          </n-form-item>
        </n-form>
        <template #action>
          <n-space>
            <n-button tertiary @click="addRule">添加</n-button>
            <n-button tertiary @click="clearRule">清空</n-button>
          </n-space>
        </template>
      </n-card>

      <!-- rule -->
      <n-card title="规则" style="margin-top: 10px;">
        <div v-if="store.rules.length === 0">
          空
        </div>
        <div v-else>
          <n-list hoverable>
            <n-list-item v-for="(rule, index) in store.rules">
              <n-thing>
                <template #header>
                  {{ rule.domain }}
                </template>
                <template #header-extra>
                  <n-badge color="grey" :value="outboundName.get(rule.tag)" />
                </template>
                <template #action>
                  <n-space>
                    <n-button quaternary @click="updateRule(index)">修改</n-button>
                    <n-button quaternary @click="removeRule(index)">删除</n-button>
                  </n-space>
                </template>
              </n-thing>
            </n-list-item>
          </n-list>
        </div>
      </n-card>

    </n-layout-content>
  </n-layout>
</template>
