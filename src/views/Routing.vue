<template>
  <div>
    <v-container class="ma-2">
      <v-row>
        <v-col class="pa-1" cols="auto">
          <v-btn small @click="create">添加新规则</v-btn>
        </v-col>
        <v-col><v-spacer></v-spacer></v-col>
      </v-row>

      <v-row>
        <v-col class="pa-1">
          <v-card class="mr-4 mt-2" flat tile outlined>
            <v-tabs v-model="tab" outlined>
              <v-tab v-for="(outbound, oi) in outbounds" :key="oi">
                {{ outbound }}
              </v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab">
              <v-tab-item v-for="(outbound, oi) in outbounds" :key="oi">
                <v-card v-if="routing[outbound].length === 0" flat>
                  <v-card-text>什么规则都没有。</v-card-text>
                </v-card>

                <v-list v-else dense>
                  <v-list-item-group>
                    <v-list-item
                      v-for="(rule, ri) in routing[outbound]"
                      :key="ri"
                      dense
                    >
                      <v-list-item-content>
                        <RoutingRule
                          :outbound="outbound"
                          :ruleIndex="ri"
                        ></RoutingRule>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
              </v-tab-item>
            </v-tabs-items>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="dialog">
      <v-card>
        <v-card-title>添加新规则</v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col>
                <v-select
                  label="类型"
                  :rules="[required]"
                  :items="items"
                  :value="type"
                  dense
                  outlined
                ></v-select>
              </v-col>
              <v-col>
                <v-text-field
                  label="匹配"
                  :rules="[required]"
                  v-model="value"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn class="mb-2" @click="dialogCreate">添加</v-btn>
          <v-btn class="mb-2" @click="dialogCancel">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import RoutingRule from "@/components/RoutingRule.vue";
import routingType from "../utils/routingType.js";

export default {
  components: {
    RoutingRule,
  },

  created() {
    this.items = routingType;
  },

  data: () => {
    return {
      // data for tabs
      tab: 0,
      outbounds: ["proxy", "direct", "block"],

      // dialog
      dialog: false,
      items: [],
      type: "",
      value: "",
    };
  },

  computed: {
    routing() {
      return this.$store.state.routing;
    },
  },

  methods: {
    // @click for create button
    create() {
      this.dialog = true;
    },

    // @click for create button in dialog
    dialogCreate() {
      this.dialog = false;
    },

    // @click for cancel button in dialog
    dialogCancel() {
      this.dialog = false;
    },

    // form validator
    required(value) {
      return !!value || "这是必填项。";
    },
  },
};
</script>
