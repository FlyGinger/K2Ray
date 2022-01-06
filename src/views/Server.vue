<template>
  <div class="ma-2">
    <div class="mt-4">
      <v-btn class="ml-2" @click="create">创建分组</v-btn>
      <v-btn class="ml-2" @click="create">修改分组</v-btn>
      <v-btn class="ml-2">删除分组</v-btn>
    </div>
    <v-card class="my-2" outlined elevation="0">
      <v-tabs v-model="tab" show-arrows>
        <v-tab v-for="item in items" :key="item.tab"> {{ item.tab }} </v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab">
        <v-tab-item v-for="item in items" :key="item.tab">
          <v-card flat>
            <v-card-text>{{ item.content }}</v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </div>
</template>

<script>
export default {
  data: () => {
    return {
      tab: null,
      win: null,
      items: [
        { tab: "One", content: "Tab 1 Content" },
        { tab: "Two", content: "Tab 2 Content" },
        { tab: "Three", content: "Tab 3 Content" },
        { tab: "Four", content: "Tab 4 Content" },
        { tab: "Five", content: "Tab 5 Content" },
        { tab: "Six", content: "Tab 6 Content" },
        { tab: "Seven", content: "Tab 7 Content" },
        { tab: "Eight", content: "Tab 8 Content" },
        { tab: "Nine", content: "Tab 9 Content" },
        { tab: "Ten", content: "Tab 10 Content" },
      ],
    };
  },

  methods: {
    create() {
      this.$router.push("/create");
    },
  },
};
</script>
