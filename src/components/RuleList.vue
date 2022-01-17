<template>
  <div>
    <v-card v-if="rules.length === 0" flat>
      <v-card-subtitle>一条规则都没有。</v-card-subtitle>
    </v-card>

    <v-list v-else dense>
      <v-list-item-group>
        <v-list-item v-for="(rule, ri) in rules" dense :key="ri">
          <v-list-item-content>
            <v-list-item-title>
              {{ rule.type }} @ {{ rule.value }}
            </v-list-item-title>
          </v-list-item-content>

          <v-list-item-action class="ma-0">
            <v-menu offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on">
                  <v-icon color="secondary" small>mdi-dots-horizontal-circle-outline</v-icon>
                </v-btn>
              </template>
              <v-list dense>
                <v-list-item v-for="(action, ai) in actions" @click="ruleMenu(ri, ai)" :key="ai">
                  <v-list-item-title>{{ action }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-list-item-action>
        </v-list-item>
      </v-list-item-group>
    </v-list>

    <RuleDialog :cancel="ruleDialogCancel" :control="ruleDialog" :ok="ruleDialogOK"></RuleDialog>
    <ConfirmDialog :cancel="removeDialogCancel" :control="removeDialog"
                   :ok="removeDialogOK"></ConfirmDialog>
  </div>
</template>

<script lang="ts">
import RuleDialog from '@/components/RuleDialog.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

export default {
  name: 'RuleList',

  props: {
    outbound: String,
    rules: Array,
  },

  components: {
    ConfirmDialog,
    RuleDialog,
  },

  data: (): unknown => ({
    selected: 0,

    actions: ['修改', '删除'],

    ruleDialog: {
      show: false,
      title: '修改规则',
      type: '',
      value: '',
    },

    removeDialog: {
      show: false,
      text: '删除后无法撤销，确定要删除吗？',
    },
  }),

  methods: {
    ruleMenu(ri: number, ai: number): void {
      [
        () => {
          this.selected = ri;
          const rule = this.rules[ri];
          this.ruleDialog.type = rule.type;
          this.ruleDialog.value = rule.value;
          this.ruleDialog.show = true;
        },
        () => {
          this.selected = ri;
          this.removeDialog.show = true;
        },
      ][ai]();
    },

    ruleDialogCancel(): void {
      this.ruleDialog.show = false;
    },

    ruleDialogOK(): void {
      this.$store.commit('setRule', {
        outbound: this.outbound,
        index: this.selected,
        rule: { type: this.ruleDialog.type, value: this.ruleDialog.value },
      });
      this.ruleDialog.show = false;
    },

    removeDialogCancel(): void {
      this.removeDialog.show = false;
    },

    removeDialogOK(): void {
      this.$store.commit('rmRule', { outbound: this.outbound, index: this.selected });
      this.removeDialog.show = false;
    },
  },
};
</script>
