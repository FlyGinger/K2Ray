<template>
  <div class="ma-2">
    <v-container>
      <v-row no-gutters>
        <v-col cols="auto">
          <v-btn class="ma-1" @click="createGroup" small>创建分组</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn class="ma-1" @click="updateGroup" :disabled="!validateTab" small>修改分组</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn class="ma-1" @click="removeGroup" :disabled="!validateTab" small>删除分组</v-btn>
        </v-col>

        <v-col>
          <v-spacer></v-spacer>
        </v-col>

        <v-col v-if="validateTab && groups[tab].isSubscribe" cols="auto">
          <v-btn class="ma-1" @click="updateSubscribe" :loading="updateSubscribeLoading" small>
            更新订阅
          </v-btn>
        </v-col>
        <v-col v-if="validateTab && !groups[tab].isSubscribe" cols="auto">
          <v-btn class="ma-1" @click="createServer" small>添加服务器</v-btn>
        </v-col>
      </v-row>
    </v-container>

    <v-card flat outlined tile>
      <v-tabs show-arrows v-model="tab">
        <v-tab v-for="(group, gi) in groups" :key="gi">{{ group.name }}</v-tab>
      </v-tabs>
      <v-tabs-items class="overflow-y-auto" style="height: 444px" v-model="tab">
        <v-tab-item v-for="(group, gi) in groups" :key="gi">
          <ServerList :groupIndex="gi" :group="group"></ServerList>
        </v-tab-item>
      </v-tabs-items>
    </v-card>

    <v-dialog persistent v-model="groupDialog" width="400px">
      <v-card>
        <v-card-title>{{ groupDialogTitle }}</v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field dense filled label="分组名称" :rules="[required]"
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

    <v-dialog persistent v-model="serverDialog" width="400px">
      <v-card>
        <v-card-title>添加服务器</v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field dense filled label="服务器名称" hint="如果服务器链接中提供了名称，那么可以留空"
                          v-model="serverName"></v-text-field>
            <v-text-field dense filled label="服务器链接" :rules="[required]"
                          v-model="serverURL"></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="serverDialogCancel" color="secondary" text>取消</v-btn>
          <v-btn @click="serverDialogOK" color="primary" text>确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ConfirmDialog :cancel="removeDialogCancel" :control="removeDialog"
                   :ok="removeDialogOK"></ConfirmDialog>

    <ErrorSnackbar :control="errorSnackbar"></ErrorSnackbar>
    <SuccessSnackbar :control="successSnackbar"></SuccessSnackbar>
  </div>
</template>

<script lang="ts">
import { parseURL, readSubscribe } from '@/api/subscribe';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import ErrorSnackbar from '@/components/ErrorSnackbar.vue';
import ServerList from '@/components/ServerList.vue';
import SuccessSnackbar from '@/components/SuccessSnackbar.vue';

export default {
  components: {
    ConfirmDialog,
    ErrorSnackbar,
    ServerList,
    SuccessSnackbar,
  },

  data: (): unknown => ({
    tab: 0,

    // update subscribe button
    updateSubscribeLoading: false,

    // dialog for create and update group
    groupDialog: false,
    groupDialogTitle: '',
    groupDialogOKLoading: false,
    oldSubscribeURL: '',
    groupName: '',
    isSubscribe: false,
    subscribeURL: '',

    // dialog for confirm removing group
    removeDialog: {
      show: false,
      text: '删除后无法撤销，确定要删除吗？',
    },

    // dialog for create server
    serverDialog: false,
    serverName: '',
    serverURL: '',

    // snackbar for error message
    errorSnackbar: {
      show: false,
      text: '',
    },

    // snackbar for success message
    successSnackbar: {
      show: false,
      text: '更新成功！',
    },
  }),

  computed: {
    groups(): unknown {
      return this.$store.state.groups;
    },

    validateTab(): boolean {
      return this.tab >= 0 && this.tab < this.groups.length;
    },
  },

  methods: {
    // @click
    createGroup(): void {
      this.groupDialogTitle = '添加分组';
      this.groupName = '';
      this.isSubscribe = false;
      this.subscribeURL = '';
      this.groupDialog = true;
    },

    // @click
    updateGroup(): void {
      this.groupDialogTitle = '修改分组';
      this.oldSubscribeURL = this.groups[this.tab].subscribeURL;
      this.groupName = this.groups[this.tab].name;
      this.isSubscribe = this.groups[this.tab].isSubscribe;
      this.subscribeURL = this.groups[this.tab].subscribeURL;
      this.groupDialog = true;
    },

    // @click
    groupDialogCancel(): void {
      this.groupDialog = false;
    },

    // @click
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
      if (this.groupDialogTitle === '修改分组') {
        group.servers = this.groups[this.tab].servers;
      }

      if (this.groupDialogTitle === '添加分组') {
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
              this.errorSnackbar.text = `无法获取订阅数据，请重试。\n${reason.message}`;
              this.errorSnackbar.show = true;
            });
        } else {
          this.$store.commit('addGroup', group);
          this.groupDialogOKLoading = false;
          this.groupDialog = false;
        }
      } else if (this.isSubscribe && this.subscribeURL !== this.oldSubscribeURL) {
        readSubscribe(this.subscribeURL)
          .then((servers) => {
            group.servers = servers;
            this.$store.commit('setGroup', { index: this.tab, group });
            this.groupDialogOKLoading = false;
            this.groupDialog = false;
          })
          .catch((reason) => {
            this.errorSnackbar.text = `无法获取订阅数据，请重试。\n${reason.message}`;
            this.groupDialogOKLoading = false;
            this.errorSnackbar.show = true;
          });
      } else {
        this.$store.commit('setGroup', { index: this.tab, group });
        this.groupDialogOKLoading = false;
        this.groupDialog = false;
      }
    },

    // @click
    removeGroup(): void {
      this.removeDialog.show = true;
    },

    // callback @click
    removeDialogCancel(): void {
      this.removeDialog.show = false;
    },

    // callback @click
    removeDialogOK(): void {
      this.$store.commit('rmGroup', this.tab);
      // force refresh
      this.tab += 1;
      this.tab -= 1;
      this.removeDialog.show = false;
    },

    // @click
    updateSubscribe(): void {
      const group = this.groups[this.tab];
      this.updateSubscribeLoading = true;
      readSubscribe(this.groups[this.tab].subscribeURL)
        .then((servers) => {
          group.servers = servers;
          this.$store.commit('setGroup', { index: this.tab, group });
          this.updateSubscribeLoading = false;
          this.successSnackbar.show = true;
        })
        .catch((reason) => {
          this.errorSnackbar.text = `无法获取订阅数据，请重试。\n${reason.message}`;
          this.updateSubscribeLoading = false;
          this.errorSnackbar.show = true;
        });
    },

    // @click
    createServer(): void {
      this.serverURL = '';
      this.serverDialog = true;
    },

    // @click
    serverDialogCancel(): void {
      this.serverDialog = false;
    },

    // @click
    serverDialogOK(): void {
      try {
        const server = parseURL(this.serverURL);
        if (this.serverName !== '') {
          server.name = this.serverName;
        }
        if (server.name === '') {
          this.errorSnackbar.text = '服务器名称为空！';
          this.errorSnackbar.show = true;
        } else {
          this.$store.commit('addServer', { index: this.tab, server });
          this.serverDialog = false;
        }
      } catch (e) {
        this.errorSnackbar.text = e.toString();
        this.errorSnackbar.show = true;
      }
    },

    // form validator
    required(value: string): boolean | string {
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
