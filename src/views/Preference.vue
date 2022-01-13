<template>
  <div>
    <v-container class="ma-2">
      <v-row>
        <v-col class="pa-1">
          <v-card class="mr-4" flat outlined>
            <v-card-title>核心设置</v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col class="pa-1">
                    <v-checkbox
                      label="开机自动启动"
                      v-model="autoStart"
                      @click="updateAutoStart"
                      dense
                    ></v-checkbox>
                  </v-col>
                </v-row>
                <v-row align="center">
                  <v-col cols="auto">V2Ray 核心所在目录</v-col>
                  <v-col class="pa-1">
                    <v-text-field
                      v-model="v2rayPath"
                      dense
                      readonly
                      outlined
                      hide-details
                    >
                    </v-text-field>
                  </v-col>
                  <v-col class="shrink mx-2">
                    <v-btn @click="updateV2RayPath" small>修改</v-btn>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="pa-1">
          <v-card class="mr-4" flat outlined>
            <v-card-title>入站设置</v-card-title>
            <v-card-text>
              <v-container>
                <v-row align="center">
                  <v-col class="pa-1" cols="2">SOCKS</v-col>
                  <v-col class="pa-1">
                    <v-text-field
                      v-model="socksPort"
                      dense
                      outlined
                      hide-details
                      readonly
                    >
                    </v-text-field>
                  </v-col>
                  <v-col class="shrink mx-2">
                    <v-btn @click="updateSocksPort" small>修改</v-btn>
                  </v-col>
                </v-row>
                <v-row align="center">
                  <v-col class="pa-1" cols="2">HTTP</v-col>
                  <v-col class="pa-1">
                    <v-text-field
                      v-model="httpPort"
                      dense
                      outlined
                      hide-details
                      readonly
                    >
                    </v-text-field>
                  </v-col>
                  <v-col class="shrink mx-2">
                    <v-btn @click="updateHTTPPort" small>修改</v-btn>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <v-dialog v-model="dialog">
      <v-card>
        <v-card-title>修改端口</v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field
              label="端口"
              :rules="[isNumber]"
              v-model="dialogPort"
              outlined
              dense
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn class="mb-2" @click="dialogUpdate">修改</v-btn>
          <v-btn class="mb-2" @click="dialogCancel">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.autoStart = this.$store.state.k2ray.autoStart;
    this.v2rayPath = this.$store.state.k2ray.v2rayPath;
    this.socksPort = this.$store.state.k2ray.socks;
    this.httpPort = this.$store.state.k2ray.http;
  },

  data: () => ({
    // data
    autoStart: false,
    v2rayPath: "",
    socksPort: 0,
    httpPort: 0,

    // data in dialog
    dialog: false,
    dialogReason: "",
    dialogPort: "",
  }),

  methods: {
    updateAutoStart() {
      this.$store.commit("setAutoStart", this.autoStart);
      window.api.send("set-login-item", this.autoStart);
    },

    updateV2RayPath() {
      window.api.invoke("get-path").then((result) => {
        if (result.cancel || result.filePaths.length === 0) {
          return;
        }
        this.v2rayPath = result.filePaths[0];
        this.$store.commit("setV2RayPath", this.v2rayPath);
      });
    },

    updateSocksPort() {
      this.dialogPort = this.socksPort;
      this.dialogReason = "socks";
      this.dialog = true;
    },

    updateHTTPPort() {
      this.dialogPort = this.httpPort;
      this.dialogReason = "http";
      this.dialog = true;
    },

    dialogUpdate() {
      if (!this.$refs.form.validate()) {
        return;
      }
      this.dialogPort = parseInt(this.dialogPort);
      if (this.dialogReason === "socks") {
        this.socksPort = this.dialogPort;
        this.$store.commit("setSocksPort", this.socksPort);
      } else {
        this.httpPort = this.dialogPort;
        this.$store.commit("setHTTPPort", this.httpPort);
      }
      this.dialog = false;
    },

    dialogCancel() {
      this.dialog = false;
    },

    isNumber(value) {
      return (
        (/^\d+$/.test(value) && parseInt(value) <= 65535) ||
        "必须是不超过 65535 的非负整数。"
      );
    },
  },
};
</script>
