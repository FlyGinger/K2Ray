<template>
  <v-snackbar color="success" elevation="12" outlined text timeout="3000" v-model="control.show">
    {{ control.text }}
  </v-snackbar>
</template>

<script lang="ts">
export default {
  name: 'SuccessSnackbar',

  props: {
    control: {
      show: Boolean,
      text: String,
    },
  },
};
</script>
