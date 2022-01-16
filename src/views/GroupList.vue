<template>
  <div class="ma-2">
    <v-container>
      <v-row no-gutters>
        <v-col cols="auto">
          <v-btn small @click="createGroup">创建分组</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn small @click="updateGroup">修改分组</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn small @click="removeGroup">删除分组</v-btn>
        </v-col>

        <v-col>
          <v-spacer></v-spacer>
        </v-col>

        <v-col cols="auto">
          <v-btn small @click="createGroup">修改分组</v-btn>
        </v-col>
      </v-row>
    </v-container>

    <v-card>
      <v-tabs v-model="tab" show-arrows>
        <v-tab v-for="(group, gi) in groups" :key="gi">
          {{ group.name }}
        </v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab">
        <v-tab-item v-for="(group, gi) in groups" :key="gi">
          <ServerList :groupIndex="gi"></ServerList>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </div>
</template>

<script lang="ts">
import ServerList from '@/components/ServerList.vue';

export default {
  components: {
    ServerList,
  },

  data: (): unknown => ({
    tab: 0,
  }),

  computed: {
    groups(): unknown {
      return this.$store.state.groups;
    },
  },

  methods: {
    createGroup(): void {
      console.log('create');
    },
    updateGroup(): void {
      console.log('update');
    },
    removeGroup(): void {
      console.log('remove');
    },
  },
};
</script>
