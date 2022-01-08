<template>
  <div class="ma-2">
    <v-card flat>
      <v-card-title>K2Ray</v-card-title>
      <v-card-subtitle>A GUI for V2Ray.</v-card-subtitle>
      <v-card-text>Version {{ version }}</v-card-text>
    </v-card>
  </div>
</template>

<script>
import config from "../../package.json";

export default {
  data: () => ({
    version: config.version,
  }),
};
</script>
