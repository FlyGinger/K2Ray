<template>
  <v-container class="ma-2">
    <v-row class="my-n8" align="center">
      <v-col class="px-1">
        <v-select
          label="类型"
          :rules="[required]"
          :items="items"
          :value="type"
          dense
          outlined
          hide-details
        ></v-select>
      </v-col>
      <v-col class="px-1">
        <v-text-field
          label="匹配"
          :rules="[required]"
          v-model="value"
          outlined
          dense
          hide-details
        ></v-text-field>
      </v-col>
      <v-col class="shrink px-1">
        <v-btn icon><v-icon>mdi-close</v-icon></v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import routingType from "../utils/routingType.js";

export default {
  name: "RoutingRule",
  props: {
    outbound: String,
    ruleIndex: Number,
  },

  created() {
    this.items = routingType;
    let rule = this.$store.state.routing[this.outbound][this.ruleIndex];
    this.type = rule.type;
    this.value = rule.value;
  },

  data: () => ({
    // rule type
    items: [],

    // rule data
    type: "",
    value: "",
  }),

  methods: {
    // form validator
    required(value) {
      return !!value || "这是必填项。";
    },
  },
};
</script>
