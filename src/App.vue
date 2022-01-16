<template>
  <v-app>
    <v-navigation-drawer app permanent width="160px">
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class='text-h6'>K2Ray</v-list-item-title>
          <v-list-item-subtitle>A GUI for V2Ray.</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense nav>
        <v-list-item v-for='page in pages' :key='page.title' :to='page.path'>
          <v-list-item-content>
            <v-list-item-title>{{ page.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script lang="ts">
export default {
  name: 'App',

  data: (): unknown => ({
    pages: [
      { title: '控制台', path: '/' },
      { title: '服务器', path: '/groupList' },
      { title: '路由', path: '/routing' },
      { title: '偏好', path: '/preference' },
      { title: '关于', path: '/about' },
    ],
  }),

  mounted: (): void => {
    // Window's title is set up by `htmlWebpackPlugin.options.title`
    // in index.html, I don't know how to modify it, so do it now.
    document.title = 'K2Ray';
  },
};
</script>
