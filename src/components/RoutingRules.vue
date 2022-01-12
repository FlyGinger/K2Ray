<template>
  <div>
    <v-card v-if="rules.length === 0" flat>
      <v-card-text>什么规则都没有。</v-card-text>
    </v-card>

    <v-list v-else dense two-line>
      <v-list-item-group>
        <v-list-item v-for="(rule, i) in rules" :key="i" dense>
          <v-container>
            <v-row align="center">
              <v-col cols="auto">
                <v-chip label>{{ rule.type }}</v-chip>
              </v-col>
              <v-col>
                <v-chip label outlined>{{ rule.value }}</v-chip>
              </v-col>
              <v-col class="shrink">
                <v-btn @click="remove(i)" icon>
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </div>
</template>

<script>
export default {
  name: "RoutingRules",
  props: {
    outbound: String,
  },

  computed: {
    rules() {
      return this.$store.state.routing[this.outbound];
    },
  },

  methods: {
    remove(index) {
      this.$store.commit("rmRule", { outbound: this.outbound, index: index });
    },
  },
};
</script>
