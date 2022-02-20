<template>
  <div class="ma-2">
    <v-container>
      <v-row no-gutters>
        <v-col cols="auto">
          <v-btn class="ma-1" @click="createRule" small>创建规则</v-btn>
        </v-col>

        <v-col>
          <v-spacer></v-spacer>
        </v-col>
      </v-row>
    </v-container>

    <v-card flat outlined tile>
      <v-tabs show-arrows v-model="tab">
        <v-tab v-for="(rules, outbound) in routing" :key="outbound">{{ outbound }}</v-tab>
      </v-tabs>
      <v-tabs-items class="overflow-y-auto" style="height: 444px" v-model="tab">
        <v-tab-item v-for="(rules, outbound) in routing" :key="outbound">
          <RuleList :outbound="outbound" :rules="rules"></RuleList>
        </v-tab-item>
      </v-tabs-items>
    </v-card>

    <RuleDialog :cancel="ruleDialogCancel" :control="ruleDialog" :ok="ruleDialogOK"></RuleDialog>
  </div>
</template>

<script lang="ts">
import RuleDialog from '@/components/RuleDialog.vue';
import RuleList from '@/components/RuleList.vue';

export default {
  components: {
    RuleDialog,
    RuleList,
  },

  data: (): unknown => ({
    tab: 0,

    ruleDialog: {
      show: false,
      title: '创建规则',
      type: '',
      value: '',
    },
  }),

  computed: {
    routing(): unknown {
      return this.$store.state.routing;
    },
  },

  methods: {
    createRule(): void {
      this.ruleDialog.type = '';
      this.ruleDialog.value = '';
      this.ruleDialog.show = true;
    },

    ruleDialogCancel(): void {
      this.ruleDialog.show = false;
    },

    ruleDialogOK(): void {
      this.$store.commit('addRule', {
        outbound: Object.keys(this.$store.state.routing)[this.tab],
        rule: { type: this.ruleDialog.type, value: this.ruleDialog.value },
      });
      this.ruleDialog.show = false;
    },
  },
};
</script>
