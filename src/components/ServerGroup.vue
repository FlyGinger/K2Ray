<template>
  <v-list dense subheader two-line>
    <v-list-item-group>
      <v-list-item v-for="(server, si) in group.servers" :key="si">
        <v-list-item-content>
          <v-list-item-title v-text="server.name"></v-list-item-title>
          <v-list-item-subtitle v-text="server.server"></v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on">
                <v-icon color="grey lighten-1">mdi-information</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="(action, ai) in actions"
                :key="ai"
                @click="clickServer(si, ai)"
              >
                <v-list-item-title>{{ action.name }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-list-item-action>
      </v-list-item>
    </v-list-item-group>
  </v-list>
</template>

<script>
export default {
  name: "ServerGroup",
  props: {
    groupIndex: Number,
  },

  computed: {
    group() {
      return this.$store.state.serverGroups[this.groupIndex];
    },
  },

  data: () => ({
    actions: [
      { name: "复制服务器名称" },
      { name: "复制服务器地址" },
      { name: "复制密码" },
    ],
  }),

  methods: {
    clickServer(si, ai) {
      console.log(si, this.actions[ai].name);
    },
  },
};
</script>
