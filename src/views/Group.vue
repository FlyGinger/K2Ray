<template>
  <div>
    <v-container class="ma-2">
      <v-row>
        <v-col class="pa-1" cols="auto">
          <v-btn
            v-if="index === -1"
            small
            @click="create"
            :loading="loading"
            :disabled="loading"
          >
            创建
          </v-btn>
          <v-btn
            v-else
            small
            @click="update"
            :loading="loading"
            :disabled="loading"
          >
            修改
          </v-btn>
        </v-col>
        <v-col class="pa-1" cols="auto">
          <v-btn small @click="cancel">取消</v-btn>
        </v-col>
        <v-col>
          <v-spacer></v-spacer>
        </v-col>
      </v-row>

      <v-form ref="form">
        <v-row class="mt-8">
          <v-col class="pa-1">
            <v-text-field
              label="分组名称"
              class="mr-4"
              :rules="[required]"
              v-model="name"
              outlined
              clearable
              dense
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col class="pa-1">
            <v-card class="mr-4" flat outlined>
              <v-card-title>订阅</v-card-title>
              <v-card-text>
                <v-checkbox
                  label="这是一个订阅分组"
                  v-model="isSubcribe"
                  dense
                ></v-checkbox>
                <v-text-field
                  label="订阅地址"
                  :rules="[isURL]"
                  v-model="subcribeURL"
                  :disabled="!isSubcribe"
                  outlined
                  clearable
                  dense
                ></v-text-field>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-form>
    </v-container>
    <v-snackbar
      v-model="snackbar"
      timeout="-1"
      color="error"
      elevation="12"
      outlined
      text
    >
      <v-container>
        <v-row align="center">
          <v-col>{{ snackbarText }}</v-col>
          <v-col cols="auto">
            <v-btn @click="snackbar = false" icon>
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-snackbar>
  </div>
</template>

<script>
import getSubcribeData from "../utils/getSubcribeData.js";

export default {
  data: () => ({
    // -1 for create new group
    index: 0,
    // reason button's loading state
    // "create" in "create" mode, "update" in "update" mode
    loading: false,
    // snackbar configuration
    snackbar: false,
    snackbarText: "",

    // form data
    name: "",
    isSubcribe: false,
    subcribeURL: "",

    // used in ok()
    oldSubcribeURL: "",
  }),

  // prepare for later operation
  created() {
    this.index = parseInt(this.$route.params.index);
    if (this.index >= 0) {
      this.name = this.$store.state.groups[this.index].name;
      this.isSubcribe = this.$store.state.groups[this.index].isSubcribe;
      this.subcribeURL = this.$store.state.groups[this.index].subcribeURL;
      this.oldSubcribeURL = this.subcribeURL;
    }
  },

  methods: {
    // @click for create button
    // create new server group
    create() {
      if (!this.$refs.form.validate()) {
        return;
      }
      this.loading = true;

      // new server group
      let group = {
        name: this.name,
        isSubcribe: this.isSubcribe,
        subcribeURL: this.subcribeURL,
        servers: [],
      };

      if (!this.isSubcribe) {
        group.subcribeURL = ""; // clear subcribeURL
        this.$store.commit("addGroup", group);
        this.loading = false;
        this.$router.push("/groups");
      } else {
        getSubcribeData(this.subcribeURL)
          .then((servers) => {
            group.servers = servers;
            this.$store.commit("addGroup", group);
            this.loading = false;
            this.$router.push("/groups");
          })
          .catch((reason) => {
            this.loading = false;
            this.snackbarText = "无法获取订阅数据，请重试。\n" + reason.message;
            this.snackbar = true;
          });
      }
    },

    // @click for update button
    // update old server group
    update() {
      if (!this.$refs.form.validate()) {
        return;
      }
      this.loading = true;

      // new server group
      let group = {
        name: this.name,
        isSubcribe: this.isSubcribe,
        subcribeURL: this.subcribeURL,
        servers: this.$store.state.groups[this.index].servers,
      };

      if (!this.isSubcribe || this.oldSubcribeURL === this.subcribeURL) {
        group.subcribeURL = ""; // clear subcribeURL
        this.$store.commit("setGroup", { index: this.index, group: group });
        this.loading = false;
        this.$router.push("/groups");
      } else {
        getSubcribeData(this.subcribeURL)
          .then((servers) => {
            group.servers = servers;
            this.$store.commit("setGroup", { index: this.index, group: group });
            this.loading = false;
            this.$router.push("/groups");
          })
          .catch((reason) => {
            this.loading = false;
            this.snackbarText = "无法获取订阅数据，请重试。\n" + reason.message;
            this.snackbar = true;
          });
      }
    },

    // @click for cancel button
    cancel() {
      this.$router.push("/groups");
    },

    // form validator
    required(value) {
      return !!value || "这是必填项。";
    },

    // form validator
    isURL(value) {
      return (
        !this.isSubcribe ||
        this.required(value) ||
        /https?:\/\/.+/.test(value) ||
        "必须是 http:// 或者 https:// 开头的 URL 。"
      );
    },
  },
};
</script>
