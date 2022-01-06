<template>
  <div class="ma-2">
    <div class="mt-4">
      <v-btn class="ml-2" @click="create">创建分组</v-btn>
      <v-btn class="ml-2">修改分组</v-btn>
      <v-btn class="ml-2">删除分组</v-btn>
    </div>
    <v-card class="my-2" outlined elevation="0">
      <v-tabs v-model="tab" show-arrows>
        <v-tab v-for="(group, gi) in groups" :key="gi">
          {{ group.name }}
        </v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab">
        <v-tab-item v-for="(group, gi) in groups" :key="gi">
          <ServerGroup :groupIndex="gi"></ServerGroup>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </div>
</template>

<script>
import ServerGroup from "@/components/ServerGroup.vue";

export default {
  components: {
    ServerGroup,
  },

  data: () => {
    return {
      tab: null,
    };
  },

  computed: {
    groups() {
      return this.$store.state.serverGroups;
    },
  },

  methods: {
    create() {
      this.$router.push("/create");
    },
  },
};
</script>
