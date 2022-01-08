<template>
  <v-form class="ma-2" ref="form">
    <v-container>
      <v-row align="center">
        <v-col class="pa-1" cols="auto">
          <v-btn small @click="create">创建</v-btn>
        </v-col>
        <v-col class="pa-1" cols="auto">
          <v-btn small @click="cancel">取消</v-btn>
        </v-col>
        <v-col>
          <v-spacer></v-spacer>
        </v-col>
        <v-col class="pa-1" cols="auto">
          <v-chip
            v-if="!isSubcribe"
            small
            @click="isSubcribe = !isSubcribe"
            color="primary"
          >
            设置为订阅分组
          </v-chip>
          <v-chip
            v-else
            small
            @click="isSubcribe = !isSubcribe"
            color="primary"
          >
            取消设置为订阅分组
          </v-chip>
        </v-col>
      </v-row>
      <v-row class="mt-10">
        <v-text-field
          label="分组名称"
          :rules="[required]"
          v-model="name"
          outlined
          clearable
          dense
        ></v-text-field>
      </v-row>
      <v-row v-if="isSubcribe">
        <v-text-field
          label="订阅地址"
          :rules="[required, url]"
          v-model="subcribeURL"
          outlined
          clearable
          dense
        ></v-text-field>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
export default {
  data: () => ({
    type: "",
    name: "",
    isSubcribe: false,
    subcribeURL: "",
  }),

  created() {
    this.type = this.$route.params.type;
  },

  methods: {
    // button @click
    create() {
      // check form rules
      if (!this.$refs.form.validate()) {
        return;
      }

      // function to read, copy from Internet, do not edit, XD
      let text = "";
      const relay = (res) => {
        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        const push = ({ value, done }) => {
          if (done) return text;
          text += decoder.decode(value, { stream: true });
          return reader.read().then(push);
        };
        return reader.read().then(push);
      };

      // execute
      fetch(this.subcribeURL)
        .then(relay)
        .then((res) => {
          let raw = Buffer.from(res, "base64").toString().split(/\s/);
          let result = [];
          for (let i = 0; i < raw.length; i++) {
            if (raw[i].length === 0) {
              continue;
            }
            if (raw[i].startsWith("trojan://")) {
              result.push(this.parseTrojan(raw[i]));
            } else {
              window.api.send("msgbox", "不支持的协议" + raw[i]);
            }
          }
          console.log(result);
        })
        .catch((reason) =>
          window.api.send(
            "msgbox",
            "无法获取订阅数据，请重试。\n错误信息：" + reason
          )
        );
    },
    cancel() {
      this.$router.push("/groups");
    },

    // form rules
    required(value) {
      return !!value || "这是必填项。";
    },
    url(value) {
      return (
        !this.isSubcribe ||
        /https?:\/\/.+/.test(value) ||
        "必须是 http:// 或者 https:// 开头的 URL 。"
      );
    },

    // parse URL
    parseTrojan(raw) {
      let at = raw.indexOf("@");
      let well = raw.indexOf("#");
      if (at < 0 || well < 0) {
        throw "不支持的协议" + raw;
      }
      let colon = raw.indexOf(":", at);
      if (colon < 0) {
        throw "不支持的协议" + raw;
      }

      return {
        name: raw.substring(well + 1),
        address: raw.substring(at + 1, colon),
        port: parseInt(raw.substring(colon + 1, well)),
        password: raw.substring(9, at),
      };
    },
  },
};
</script>
