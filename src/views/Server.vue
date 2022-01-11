<template>
  <v-container class="ma-2">
    <v-row>
      <v-col class="pa-1" cols="auto">
        <v-btn v-if="serverIndex === -1" small @click="create">创建</v-btn>
        <v-btn v-else small @click="update">修改</v-btn>
      </v-col>
      <v-col class="pa-1" cols="auto">
        <v-btn small @click="cancel">取消</v-btn>
      </v-col>
      <v-col>
        <v-spacer></v-spacer>
      </v-col>
    </v-row>

    <v-form ref="form">
      <v-row class="mt-8">
        <v-col class="pa-1">
          <v-text-field
            label="服务器名称"
            class="mr-4"
            :rules="[required]"
            v-model="name"
            outlined
            clearable
            dense
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="pa-1">
          <v-text-field
            label="服务器地址"
            class="mr-4"
            :rules="[required]"
            v-model="address"
            outlined
            clearable
            dense
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="pa-1">
          <v-text-field
            label="服务器端口"
            class="mr-4"
            :rules="[required, isNumber]"
            v-model="port"
            outlined
            clearable
            dense
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="pa-1">
          <v-text-field
            label="密码"
            class="mr-4"
            :rules="[required]"
            type="password"
            v-model="password"
            outlined
            clearable
            dense
          ></v-text-field>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    // serverIndex -1 for create new server
    groupIndex: 0,
    serverIndex: 0,

    // server data
    name: "",
    address: "",
    port: "",
    password: "",
  }),

  // prepare for later operation
  created() {
    this.groupIndex = parseInt(this.$route.params.groupIndex);
    this.serverIndex = parseInt(this.$route.params.serverIndex);
    if (this.serverIndex >= 0) {
      let server =
        this.$store.state.groups[this.groupIndex].servers[this.serverIndex];
      this.name = server.name;
      this.address = server.address;
      this.port = server.port;
      this.password = server.password;
    }
  },

  methods: {
    // @click for create button
    create() {
      if (!this.$refs.form.validate()) {
        return;
      }
      this.$store.commit("addServer", {
        groupIndex: this.groupIndex,
        server: this.newServer(),
      });
      this.$router.push("/groups");
    },

    // @click for update button
    update() {
      if (!this.$refs.form.validate()) {
        return;
      }
      this.$store.commit("setServer", {
        groupIndex: this.groupIndex,
        serverIndex: this.serverIndex,
        server: this.newServer(),
      });
      this.$router.push("/groups");
    },

    // @click for cancel button
    cancel() {
      this.$router.push("/groups");
    },

    // form validator
    required(value) {
      return !!value || "这是必填项。";
    },

    // form validator
    isNumber(value) {
      return /^\d*$/.test(value) || "必须是非负整数。";
    },

    // construct a new server
    newServer() {
      return {
        name: this.name,
        address: this.address,
        port: this.port,
        password: this.password,
      };
    },
  },
};
</script>
