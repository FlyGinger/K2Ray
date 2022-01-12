<template>
  <div>
    <v-container class="ma-2">
      <v-row>
        <v-col class="pa-1" cols="auto">
          <v-btn small @click="create">创建分组</v-btn>
        </v-col>
        <v-col class="pa-1" cols="auto">
          <v-btn small @click="update">修改分组</v-btn>
        </v-col>
        <v-col class="pa-1" cols="auto">
          <v-btn small @click="remove">删除分组</v-btn>
        </v-col>
        <v-col class="pa-1" cols="auto">
          <v-divider vertical></v-divider>
        </v-col>
        <v-col v-if="isSubcribe()" class="pa-1" cols="auto">
          <v-btn
            small
            @click="updateSubcribe"
            :loading="loading"
            :disabled="loading"
            >更新订阅</v-btn
          >
        </v-col>
        <v-col
          v-if="!isSubcribe() && groups.length > 0"
          class="pa-1"
          cols="auto"
        >
          <v-btn small @click="addServer">添加服务器</v-btn>
        </v-col>
        <v-col><v-spacer></v-spacer></v-col>
      </v-row>

      <v-row>
        <v-col class="pa-1">
          <v-card v-if="groups.length > 0" class="mr-4 mt-2" flat outlined>
            <v-tabs v-model="tab" show-arrows outlined>
              <v-tab v-for="(group, gi) in groups" :key="gi">
                {{ group.name }}
              </v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab">
              <v-tab-item v-for="(group, gi) in groups" :key="gi">
                <Servers :groupIndex="gi"></Servers>
              </v-tab-item>
            </v-tabs-items>
          </v-card>

          <v-card v-else class="mr-4 mt-2" flat outlined>
            <v-card-text>一个分组都没有。</v-card-text>
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
          <v-col>{{ failSnackbarText }}</v-col>
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
import Servers from "@/components/Servers.vue";
import getSubcribeData from "../utils/getSubcribeData.js";

export default {
  components: {
    Servers,
  },

  data: () => {
    return {
      tab: 0,
      loading: false,

      // snackbar configuration
      successSnackbar: false,
      successSnackbarText: "更新成功！",
      failSnackbar: false,
      failSnackbarText: "",
    };
  },

  computed: {
    groups() {
      return this.$store.state.groups;
    },
  },

  methods: {
    // @click for create button
    create() {
      this.$router.push("/group/-1");
    },

    // @click for update button
    update() {
      this.$router.push("/group/" + this.tab.toString());
    },

    // @click for delete button
    remove() {
      this.$store.commit("rmGroup", this.tab);
    },

    // @click for subcribe update button
    updateSubcribe() {
      this.loading = true;
      getSubcribeData(this.groups[this.tab].subcribeURL)
        .then((servers) => {
          let group = this.groups[this.tab];
          group.servers = servers;
          this.$store.commit("setGroup", { index: this.index, group: group });
          this.loading = false;
          this.successSnackbar = true;
        })
        .catch((reason) => {
          this.loading = false;
          this.failSnackbarText =
            "无法获取订阅数据，请重试。\n" + reason.message;
          this.failSnackbar = true;
        });
    },

    // @click for adding new server button
    addServer() {
      this.$router.push("/server/" + this.tab.toString() + "/-1");
    },

    // return if current group is a subcribe
    isSubcribe() {
      if (this.tab >= this.groups.length) {
        return false;
      }
      return this.groups[this.tab].isSubcribe;
    },
  },
};
</script>
