<template>
  <div class="ma-2">
    <v-card flat>
      <v-card-title>Panel Page</v-card-title>
      <v-card-subtitle>未完待续</v-card-subtitle>
      <v-btn @click="test">cert</v-btn>
    </v-card>
  </div>
</template>

<script>
export default {
  data: () => ({}),

  methods: {
    test() {
      window.api
        .invoke("get-cert", this.$store.state.k2ray.core.v2rayPath)
        .then((result) => {
          var string = new TextDecoder().decode(result);
          console.log(string);
        });
    },
  },
};
</script>
