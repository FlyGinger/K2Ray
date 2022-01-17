<template>
  <v-snackbar color="error" elevation="12" outlined text timeout="-1" v-model="control.show">
    <v-container class="pa-0">
      <v-row align="center" no-gutters>
        <v-col>{{ control.text }}</v-col>
        <v-col cols="auto">
          <v-btn @click="control.show = false" icon>
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-snackbar>
</template>

<script>
export default {
  name: 'ErrorSnackbar',

  props: {
    control: {
      show: Boolean,
      text: String,
    },
  },
};
</script>
