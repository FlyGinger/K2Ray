<template>
  <div class="ma-2">
    <v-container>
      <v-row>
        <v-col class="pa-1" cols="auto">
          <v-btn small @click="create">创建分组</v-btn>
        </v-col>
        <v-col class="pa-1" cols="auto">
          <v-btn small>修改分组</v-btn>
        </v-col>
        <v-col class="pa-1" cols="auto">
          <v-btn small>删除分组</v-btn>
        </v-col>
        <v-col v-if="groups[tab].isSubcribe" class="pa-1" cols="auto">
          <v-divider vertical></v-divider>
        </v-col>
        <v-col v-if="groups[tab].isSubcribe" class="pa-1" cols="auto">
          <v-btn small>更新订阅</v-btn>
        </v-col>
        <v-col><v-spacer></v-spacer></v-col>
      </v-row>
    </v-container>
    <v-card class="my-2" flat tile outlined>
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
  </div>
</template>

<script>
import Servers from "@/components/Servers.vue";

export default {
  components: {
    Servers,
  },

  data: () => {
    return {
      tab: 0,
    };
  },

  computed: {
    groups() {
      return this.$store.state.groups;
    },
  },

  methods: {
    create() {
      this.$router.push({ path: "/group", params: { because: "create" } });
    },
  },
};
</script>
