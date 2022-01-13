<template>
  <div>
    <v-card v-if="group.servers.length === 0" flat>
      <v-card-text>一个服务器都没有。</v-card-text>
    </v-card>

    <v-list v-else dense two-line>
      <v-list-item-group>
        <v-list-item v-for="(server, si) in group.servers" :key="si" dense>
          <v-list-item-content>
            <v-list-item-title v-text="server.name"></v-list-item-title>
            <v-list-item-subtitle
              v-text="server.address"
            ></v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-menu offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on">
                  <v-icon color="secondary">mdi-information</v-icon>
                </v-btn>
              </template>
              <v-list dense>
                <v-list-item
                  v-for="(action, ai) in actions"
                  :key="ai"
                  @click="serverMenu(si, ai)"
                  dense
                >
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

<script>
export default {
  name: "Servers",
  props: {
    groupIndex: Number,
  },

  computed: {
    group() {
      return this.$store.state.groups[this.groupIndex];
    },
  },

  data: () => ({
    actions: [
      {
        name: "使用该服务器",
        action: (that, si) => {
          that.$store.commit("setServerInUse", that.group.servers[si]);
        },
      },
      {
        name: "修改",
        action: (that, si) => {
          that.$router.push(
            "/server/" + that.groupIndex.toString() + "/" + si.toString()
          );
        },
      },
      {
        name: "复制 JSON",
        action: (that, si) => {
          window.api.send(
            "write-clipboard",
            JSON.stringify(that.group.servers[si])
          );
        },
      },
    ],
  }),

  methods: {
    serverMenu(si, ai) {
      this.actions[ai].action(this, si);
    },
  },
};
</script>
