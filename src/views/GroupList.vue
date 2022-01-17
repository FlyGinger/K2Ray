<template>
  <div class="ma-2">
    <v-container>
      <v-row no-gutters>
        <v-col cols="auto">
          <v-btn class="ma-1" small @click="createGroup">创建分组</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn class="ma-1" small @click="updateGroup">修改分组</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn class="ma-1" small @click="removeGroup">删除分组</v-btn>
        </v-col>

        <v-col>
          <v-spacer></v-spacer>
        </v-col>

        <v-col cols="auto">
          <v-btn class="ma-1" small @click="createGroup">修改分组</v-btn>
        </v-col>
      </v-row>
    </v-container>

    <v-card flat outlined tile>
      <v-tabs show-arrows v-model="tab">
        <v-tab v-for="(group, gi) in groups" :key="gi">{{ group.name }}</v-tab>
      </v-tabs>
      <v-tabs-items class="overflow-y-auto" style="height: 446px" v-model="tab">
        <v-tab-item v-for="(group, gi) in groups" :key="gi">
          <ServerList :groupIndex="gi"></ServerList>
        </v-tab-item>
      </v-tabs-items>
    </v-card>

    <v-dialog persistent v-model="groupDialog" width="400">
      <v-card>
        <v-card-title>{{ groupDialogTitle }}</v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field dense filled label="分组名称" :rules="[nameRequired]"
                          v-model="groupName"></v-text-field>
            <v-checkbox v-model="isSubscribe" dense label="这是一个订阅分组"></v-checkbox>
            <v-text-field dense :disabled="!isSubscribe" filled label="订阅地址"
                          :rules="[subscribeRequired, subscribeIsURL]"
                          v-model="subscribeURL"></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="groupDialogCancel" color="secondary" text>取消</v-btn>
          <v-btn @click="groupDialogOK" color="primary" :loading="groupDialogOKLoading" text>
            确定
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar color="error" elevation="12" outlined text timeout="-1" v-model="errorSnackbar">
      <v-container>
        <v-row align="center">
          <v-col>{{ errorSnackbarText }}</v-col>
          <v-col cols="auto">
            <v-btn @click="errorSnackbar = false" icon>
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import readSubscribe from '@/api/subscribe';
import ServerList from '@/components/ServerList.vue';

export default {
  components: {
    ServerList,
  },

  data: (): unknown => ({
    tab: 0,

    // dialog for create and update group
    groupDialog: false,
    groupDialogTitle: '',
    groupDialogOKLoading: false,
    groupName: '',
    isSubscribe: false,
    subscribeURL: '',

    // snackbar for error message
    errorSnackbar: false,
    errorSnackbarText: '',
  }),

  computed: {
    groups(): unknown {
      return this.$store.state.groups;
    },
  },

  methods: {
    createGroup(): void {
      this.groupDialogTitle = '添加分组';
      this.groupName = '';
      this.isSubscribe = false;
      this.subscribeURL = '';
      this.groupDialog = true;
    },

    updateGroup(): void {
      console.log('update');
    },

    removeGroup(): void {
      console.log('remove');
    },

    groupDialogOK(): void {
      if (!this.$refs.form.validate()) {
        return;
      }
      this.groupDialogOKLoading = true;

      if (!this.isSubscribe) {
        this.subscribeURL = '';
      }
      const group = {
        name: this.groupName,
        isSubscribe: this.isSubscribe,
        subscribeURL: this.subscribeURL,
        servers: [] as unknown[],
      };

      if (this.isSubscribe) {
        readSubscribe(this.subscribeURL)
          .then((servers) => {
            group.servers = servers;
            this.$store.commit('addGroup', group);
            this.groupDialogOKLoading = false;
            this.groupDialog = false;
          })
          .catch((reason) => {
            this.groupDialogOKLoading = false;
            this.errorSnackbarText = `无法获取订阅数据，请重试。\n${reason.message}`;
            this.errorSnackbar = true;
          });
      } else {
        this.$store.commit('addGroup', group);
        this.groupDialogOKLoading = false;
        this.groupDialog = false;
      }
    },

    groupDialogCancel(): void {
      this.groupDialog = false;
    },

    // form validator
    nameRequired(value: string): boolean | string {
      return value !== '' || '这是必填项。';
    },

    // form validator
    subscribeRequired(value: string): boolean | string {
      return !this.isSubscribe || value !== '' || '这是必填项。';
    },

    // form validator
    subscribeIsURL(value: string): boolean | string {
      return !this.isSubscribe || /^https?:\/\//.test(value) || '必须是以 http:// 或 https:// 开头。';
    },
  },
};
</script>
