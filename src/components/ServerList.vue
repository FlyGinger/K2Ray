<template>
  <div>
    <v-card v-if="group.servers.length === 0" flat>
      <v-card-subtitle>一个服务器都没有。</v-card-subtitle>
    </v-card>

    <v-list v-else dense>
      <v-list-item-group>
        <v-list-item v-for="(server, si) in group.servers" dense :key="si">
          <v-list-item-content>
            <v-list-item-title>
              {{ server.name }} @ {{ server.address }}:{{ server.port }}
            </v-list-item-title>
          </v-list-item-content>

          <v-list-item-action class="ma-0">
            <v-menu offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on">
                  <v-icon color="secondary" small>mdi-dots-horizontal-circle-outline</v-icon>
                </v-btn>
              </template>
              <v-list dense>
                <v-list-item v-for="(action, ai) in actions" @click="serverMenu(si, ai)" :key="ai">
                  <v-list-item-title>{{ action }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-list-item-action>
        </v-list-item>
      </v-list-item-group>
    </v-list>

    <v-dialog persistent v-model="dialog" width="400px">
      <v-card>
        <v-card-title>修改服务器</v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field dense filled label="名称" :rules="[required]" v-model="name"></v-text-field>
            <v-text-field dense filled label="地址" :rules="[required]"
                          v-model="address"></v-text-field>
            <v-text-field dense filled label="端口" :rules="[isNumber]" v-model="port"></v-text-field>
            <v-text-field dense filled label="密码" :rules="[required]" type="password"
                          v-model="password"></v-text-field>
            <v-text-field dense filled label="协议" :rules="[required]"
                          v-model="protocol"></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="cancel" color="secondary" text>取消</v-btn>
          <v-btn @click="ok" color="primary" text>确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ConfirmDialog :cancel="removeDialogCancel" :control="removeDialog"
                   :ok="removeDialogOK"></ConfirmDialog>

    <SuccessSnackbar :control="successSnackbar"></SuccessSnackbar>
  </div>
</template>

<script lang="ts">
import { writeClipboard } from '@/api-renderer';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import SuccessSnackbar from '@/components/SuccessSnackbar.vue';

export default {
  name: 'ServerList',

  props: {
    groupIndex: Number,
    group: Object,
  },

  components: {
    ConfirmDialog,
    SuccessSnackbar,
  },

  data: (): unknown => ({
    actions: [
      '使用此服务器',
      '修改',
      '删除',
      '复制 JSON',
    ],

    // active server
    selected: 0,

    // dialog for update server
    dialog: false,
    name: '',
    address: '',
    port: '',
    password: '',
    protocol: '',

    // dialog for confirm removing group
    removeDialog: {
      show: false,
      text: '删除后无法撤销，确定要删除吗？',
    },

    // snackbar for success message
    successSnackbar: {
      show: false,
      text: '',
    },
  }),

  methods: {
    serverMenu(si: number, ai: number): void {
      [
        () => {
          this.$store.commit('setServerToUse', this.group.servers[si]);
          this.successSnackbar.text = '设置成功！';
          this.successSnackbar.show = true;
        },
        () => {
          this.selected = si;
          const server = this.group.servers[si];
          this.name = server.name;
          this.address = server.address;
          this.port = server.port.toString();
          this.password = server.password;
          this.protocol = server.protocol;
          this.dialog = true;
        },
        () => {
          this.selected = si;
          this.removeDialog.show = true;
        },
        () => {
          writeClipboard(JSON.stringify(this.group.servers[si]));
          this.successSnackbar.text = '复制成功！';
          this.successSnackbar.show = true;
        },
      ][ai]();
    },

    // dialog @click
    cancel(): void {
      this.dialog = false;
    },

    // dialog @click
    ok(): void {
      this.$store.commit('setServer', {
        groupIndex: this.groupIndex,
        serverIndex: this.selected,
        server: {
          name: this.name,
          address: this.address,
          port: parseInt(this.port, 10),
          password: this.password,
          protocol: this.protocol,
        },
      });
      this.dialog = false;
    },

    // callback @click
    removeDialogCancel(): void {
      this.removeDialog.show = false;
    },

    // callback @click
    removeDialogOK(): void {
      this.$store.commit('rmServer', { groupIndex: this.groupIndex, serverIndex: this.selected });
      this.removeDialog.show = false;
    },

    // form validator
    required(value: string): boolean | string {
      return value !== '' || '这是必填项。';
    },

    // form validator
    isNumber(value: string): boolean | string {
      return (/^\d+$/.test(value) && parseInt(value, 10) <= 65535)
        || '必须是不超过 65535 的非负整数。';
    },
  },
};
</script>
