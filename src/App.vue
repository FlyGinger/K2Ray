<template>
  <v-app>
    <v-navigation-drawer app permanent>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-h6"> K2Ray </v-list-item-title>
          <v-list-item-subtitle> A GUI for V2Ray. </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense nav>
        <v-list-item v-for="item in items" :key="item.title" :to="item.path">
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",

  data: () => ({
    items: [
      { title: "控制台", path: "/" },
      { title: "服务器", path: "/groups" },
      { title: "偏好", path: "/preference" },
      { title: "路由", path: "/routing" },
      { title: "关于", path: "/about" },
    ],
  }),

  mounted: () => {
    document.title = "K2Ray";
  },
};
</script>
