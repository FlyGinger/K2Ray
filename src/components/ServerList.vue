<template>
  <div>
    <v-list dense two-line>
      <v-list-item-group>
        <v-list-item v-for="(server, si) in group.servers" :key="si" dense>
          <v-list-item-content>
            <v-list-item-title v-text="server.name"></v-list-item-title>
            <v-list-item-subtitle
              v-text="server.address"
            ></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ServerList',

  props: {
    groupIndex: Number,
  },

  computed: {
    group(): unknown {
      return this.$store.state.groups[this.groupIndex];
    },
  },
};
</script>
