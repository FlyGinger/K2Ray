<template>
  <v-dialog persistent v-model="control.show" width="400px">
    <v-card flat>
      <v-card-title class="text-body-1">{{ control.text }}</v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="cancel" color="secondary" text>取消</v-btn>
        <v-btn @click="ok" color="primary" text>确定</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
export default {
  name: 'ConfirmDialog',

  props: {
    control: Object,
    cancel: Function,
    ok: Function,
  },
};
</script>
