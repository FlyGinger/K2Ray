<template>
  <div class="ma-2">
    <v-card flat outlined tile>
      <v-card-title>核心设置</v-card-title>
      <v-card-text>
        <v-row align="center" no-gutters>
          <v-col cols="3">V2Ray 核心目录</v-col>
          <v-col>
            <v-text-field class="mx-2" dense filled hide-details readonly
                          v-model="v2rayPath"></v-text-field>
          </v-col>
          <v-col cols="auto">
            <v-btn class="mx-2" @click="updateV2RayPath" small>修改</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="mt-2" flat outlined tile>
      <v-card-title>入站设置</v-card-title>
      <v-card-text>
        <v-row align="center" no-gutters>
          <v-col cols="3">SOCKS</v-col>
          <v-col>
            <v-text-field class="mx-2" dense filled hide-details readonly
                          v-model="socks"></v-text-field>
          </v-col>
          <v-col cols="auto">
            <v-btn class="mx-2" @click="updateSocksPort" small>修改</v-btn>
          </v-col>
        </v-row>
        <v-row align="center" class="mt-2" no-gutters>
          <v-col cols="3">HTTP</v-col>
          <v-col>
            <v-text-field class="mx-2" dense filled hide-details readonly
                          v-model="http"></v-text-field>
          </v-col>
          <v-col cols="auto">
            <v-btn class="mx-2" @click="updateHttpPort" small>修改</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-dialog persistent v-model="dialog" width="400px">
      <v-card flat>
        <v-card-title>修改端口</v-card-title>
        <v-card-text>
          <v-text-field dense filled label="端口" :rules="[isNumber]" v-model="port"></v-text-field>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="cancel" color="secondary" text>取消</v-btn>
          <v-btn @click="ok" color="primary" text>确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { getPath } from '@/api/render';

export default {
  data: (): unknown => ({
    dialog: false,
    because: '',
    port: '',
  }),

  computed: {
    v2rayPath(): string {
      return this.$store.state.k2ray.v2rayPath;
    },

    socks(): number {
      return this.$store.state.k2ray.inbound.socks;
    },

    http(): number {
      return this.$store.state.k2ray.inbound.http;
    },
  },

  methods: {
    updateV2RayPath(): void {
      getPath().then((path) => {
        if (typeof path === 'string') {
          this.$store.commit('setV2RayPath', path);
        }
      });
    },

    updateSocksPort(): void {
      this.because = 'socks';
      this.port = this.socks;
      this.dialog = true;
    },

    updateHttpPort(): void {
      this.because = 'http';
      this.port = this.http;
      this.dialog = true;
    },

    cancel(): void {
      this.dialog = false;
    },

    ok(): void {
      if (this.because === 'socks') {
        this.$store.commit('setSocksPort', parseInt(this.port, 10));
      } else {
        this.$store.commit('setHttpPort', parseInt(this.port, 10));
      }
      this.dialog = false;
    },

    // form validator
    isNumber(value: string): boolean | string {
      return (/^\d+$/.test(value) && parseInt(value, 10) <= 65535)
        || '必须是不超过 65535 的非负整数。';
    },
  },
};
</script>
