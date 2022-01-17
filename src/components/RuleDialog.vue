<template>
  <v-dialog persistent v-model="control.show" width="400px">
    <v-card>
      <v-card-title>{{ control.title }}</v-card-title>
      <v-card-text>
        <v-form ref="form">
          <v-select dense filled :items="items" label="类型" :rules="[required]"
                    v-model="control.type"></v-select>
          <v-text-field dense filled label="值" :rules="[required]"
                        v-model="control.value"></v-text-field>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="cancel" color="secondary" text>取消</v-btn>
        <v-btn @click="validate() && ok()" color="primary" text>确定</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
export default {
  name: 'RuleDialog',

  props: {
    control: Object,
    cancel: Function,
    ok: Function,
  },

  data: (): unknown => ({
    items: ['domains', 'ip'],
  }),

  methods: {
    validate(): boolean {
      return this.$refs.form.validate();
    },

    // form validator
    required(value: string): boolean | string {
      return value !== '' || '这是必填项。';
    },
  },
};
</script>
