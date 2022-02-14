<template>
  <div class="ma-2">
    <v-card flat outlined tile>
      <v-card-title>
        <v-row align="center" no-gutters>
          <v-col cols="auto">系统代理</v-col>
          <v-col cols="auto">
            <v-chip v-if="systemProxyOn" class="ml-2" color="success" small>已设置</v-chip>
            <v-chip v-else class="ml-2" color="error" small>未设置</v-chip>
          </v-col>

          <v-col>
            <v-spacer></v-spacer>
          </v-col>
        </v-row>
      </v-card-title>

      <v-card-subtitle>
        很抱歉，K2Ray 不能准确监测系统代理状态。
      </v-card-subtitle>

      <v-card-text>
        <v-row no-gutters>
          <v-col cols="auto">
            <v-btn class="ma-1" @click="setSystemProxy" small>设置</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn class="ma-1" @click="unsetSystemProxy" small>清空</v-btn>
          </v-col>

          <v-col>
            <v-spacer></v-spacer>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="mt-2" flat outlined tile>
      <v-card-title>
        <v-row align="center" no-gutters>
          <v-col cols="auto">V2Ray 核心状态</v-col>
          <v-col cols="auto">
            <v-chip v-if="v2rayOn" class="ml-2" color="success" small>工作中</v-chip>
            <v-chip v-else class="ml-2" color="error" small>休息中</v-chip>
          </v-col>

          <v-col>
            <v-spacer></v-spacer>
          </v-col>
        </v-row>
      </v-card-title>

      <v-card-text>
        <v-row no-gutters>
          <v-col cols="auto">
            <v-btn class="ma-1" @click="v2rayLaunchButton" small>启动</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn class="ma-1" @click="v2rayCloseButton" small>关闭</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn class="ma-1" @click="v2rayRelaunchButton" small>重启</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn class="ma-1" @click="openAccessLog" small>打开访问日志</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn class="ma-1" @click="openErrorLog" small>打开错误日志</v-btn>
          </v-col>

          <v-col>
            <v-spacer></v-spacer>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="mt-2" flat outlined tile>
      <v-card-title>正在使用的服务器</v-card-title>
      <v-card-subtitle>{{ serverToUse }}</v-card-subtitle>
    </v-card>

    <SuccessSnackbar :control="successSnackbar"></SuccessSnackbar>
  </div>
</template>

<script lang="ts">
import path from 'path';
import {
  openFile,
  setSystemProxy,
  unsetSystemProxy,
  v2rayClose,
  v2rayLaunch,
  v2rayRelaunch,
} from '@/api/render';
import SuccessSnackbar from '@/components/SuccessSnackbar.vue';

export default {
  components: {
    SuccessSnackbar,
  },

  data: (): unknown => ({
    successSnackbar: {
      show: false,
      text: '',
    },
  }),

  computed: {
    v2rayOn(): boolean {
      return this.$store.state.v2rayOn;
    },

    systemProxyOn(): boolean {
      return this.$store.state.systemProxyOn;
    },

    serverToUse(): string {
      if (this.$store.state.k2ray.server === null) {
        return '未选择服务器';
      }
      return this.$store.state.k2ray.server.name;
    },
  },

  methods: {
    setSystemProxy(): void {
      setSystemProxy({
        socks: this.$store.state.k2ray.inbound.socks,
        http: this.$store.state.k2ray.inbound.http,
      });
      this.$store.commit('setSystemProxyState', true);
      this.successSnackbar.text = '设置完成！';
      this.successSnackbar.show = true;
    },

    unsetSystemProxy(): void {
      unsetSystemProxy();
      this.$store.commit('setSystemProxyState', false);
      this.successSnackbar.text = '清除完成！';
      this.successSnackbar.show = true;
    },

    v2rayLaunchButton(): void {
      v2rayLaunch(this.$store.state);
      this.successSnackbar.text = '已启动！';
      this.successSnackbar.show = true;
    },

    v2rayCloseButton(): void {
      v2rayClose();
      this.successSnackbar.text = '已关闭！';
      this.successSnackbar.show = true;
    },

    v2rayRelaunchButton(): void {
      v2rayRelaunch(this.$store.state);
      this.successSnackbar.text = '已重启！';
      this.successSnackbar.show = true;
    },

    openAccessLog(): void {
      openFile(path.join(this.$store.state.k2ray.v2rayPath, 'access.log'));
    },

    openErrorLog(): void {
      openFile(path.join(this.$store.state.k2ray.v2rayPath, 'error.log'));
    },
  },
};
</script>
