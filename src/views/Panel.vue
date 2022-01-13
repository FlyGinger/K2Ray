<template>
  <div>
    <v-container class="ma-2">
      <v-row>
        <v-col class="pa-1">
          <v-card class="mr-4 mt-2" flat outlined>
            <v-card-title>系统代理</v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col class="pa-1" cols="auto">
                    <v-btn small @click="setSystemProxy">设置</v-btn>
                  </v-col>
                  <v-col class="pa-1" cols="auto">
                    <v-btn small @click="unsetSystemProxy">清空</v-btn>
                  </v-col>
                  <v-col><v-spacer></v-spacer></v-col>
                </v-row>
              </v-container>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col class="pa-1">
          <v-card class="mr-4 mt-2" flat outlined>
            <v-card-title>V2Ray 核心</v-card-title>
            <v-card-subtitle v-if="v2rayOn">工作中……</v-card-subtitle>
            <v-card-subtitle v-else>休息中……</v-card-subtitle>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col class="pa-1" cols="auto">
                    <v-btn small @click="launch">启动</v-btn>
                  </v-col>
                  <v-col class="pa-1" cols="auto">
                    <v-btn small @click="close">关闭</v-btn>
                  </v-col>
                  <v-col class="pa-1" cols="auto">
                    <v-btn small @click="relaunch">重启</v-btn>
                  </v-col>
                  <v-col class="pa-1" cols="auto">
                    <v-btn small @click="openAccess">打开访问记录</v-btn>
                  </v-col>
                  <v-col class="pa-1" cols="auto">
                    <v-btn small @click="openError">打开错误记录</v-btn>
                  </v-col>
                  <v-col><v-spacer></v-spacer></v-col>
                </v-row>
              </v-container>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="pa-1">
          <v-card v-if="selected" class="mr-4 mt-2" flat outlined>
            <v-card-title>正在使用</v-card-title>
            <v-card-subtitle>{{ serverName }}</v-card-subtitle>
          </v-card>
          <v-card v-else class="mr-4 mt-2" flat outlined>
            <v-card-title>没有选择服务器。</v-card-title>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-snackbar
      v-model="successSnackbar"
      timeout="2000"
      color="success"
      elevation="12"
      outlined
      text
    >
      {{ successSnackbarText }}
    </v-snackbar>

    <v-snackbar
      v-model="failSnackbar"
      timeout="-1"
      color="error"
      elevation="12"
      outlined
      text
    >
      <v-container>
        <v-row align="center">
          <v-col>还没有选择服务器。</v-col>
          <v-col cols="auto">
            <v-btn @click="failSnackbar = false" icon>
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  data: () => ({
    successSnackbar: false,
    successSnackbarText: "",
    failSnackbar: false,
  }),

  computed: {
    v2rayOn() {
      return this.$store.state.v2rayOn;
    },

    selected() {
      return !!this.$store.state.k2ray.serverInUse.name;
    },

    serverName() {
      if (this.$store.state.k2ray.serverInUse.name) {
        return this.$store.state.k2ray.serverInUse.name
      }
      return ""
    },
  },

  methods: {
    setSystemProxy() {
      window.api.send("set-proxy", {
        socks: this.$store.state.k2ray.socks,
        http: this.$store.state.k2ray.http,
      });
      this.successSnackbarText = "已设置！";
      this.successSnackbar = true;
    },

    unsetSystemProxy() {
      window.api.send("unset-proxy");
      this.successSnackbarText = "已清空！";
      this.successSnackbar = true;
    },

    launch() {
      window.api.send("launch", this.$store.state);
      this.successSnackbarText = "已启动！";
      this.successSnackbar = true;
    },

    close() {
      window.api.send("close");
      this.successSnackbarText = "已关闭！";
      this.successSnackbar = true;
    },

    relaunch() {
      window.api.send("relaunch", this.$store.state);
      this.successSnackbarText = "已重启！";
      this.successSnackbar = true;
    },

    openAccess() {
      window.api.send("open-access", this.$store.state.k2ray.v2rayPath);
    },

    openError() {
      window.api.send("open-error", this.$store.state.k2ray.v2rayPath);
    },
  },
};
</script>
