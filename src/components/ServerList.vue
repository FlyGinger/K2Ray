<template>
  <div>
    <v-list dense>
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
                  <v-list-item-title>{{ action.name }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-list-item-action>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </div>
</template>

<script lang="ts">
import { writeClipboard } from '@/api/render';

export default {
  name: 'ServerList',

  props: {
    groupIndex: Number,
  },

  data: (): unknown => ({
    actions: [
      {
        name: '使用此服务器',
        action: (that: any, si: number) => {
          console.log(si, '使用此服务器');
        },
      },
      {
        name: '复制 JSON',
        action: (that: any, si: number) => {
          writeClipboard(JSON.stringify(that.group.servers[si]));
        },
      },
    ],
  }),

  computed: {
    group(): unknown {
      return this.$store.state.groups[this.groupIndex];
    },
  },

  methods: {
    serverMenu(si: number, ai: number): void {
      this.actions[ai].action(this, si);
    },
  },
};
</script>
