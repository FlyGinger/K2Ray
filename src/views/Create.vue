<template>
  <div class="ma-2">
    <div class="mt-4">
      <v-btn class="ml-2" @click="create">创建</v-btn>
      <v-btn class="ml-2" @click="cancel">取消</v-btn>
    </div>
    <v-form class="mt-6" ref="form">
      <v-text-field
        label="分组名称"
        :rules="[required]"
        v-model="name"
        outlined
        clearable
        dense
      ></v-text-field>
      <v-switch
        label="这是一个订阅分组。"
        class="ml-4"
        v-model="isSubcribe"
      ></v-switch>
      <v-text-field
        v-if="isSubcribe"
        label="订阅地址"
        :rules="[required, url]"
        v-model="subcribeURL"
        outlined
        clearable
        dense
      ></v-text-field>
    </v-form>
  </div>
</template>

<script>
export default {
  data: () => ({
    name: "",
    isSubcribe: false,
    subcribeURL: "",
  }),

  methods: {
    // button @click
    create() {
      // check form rules
      if (!this.$refs.form.validate()) {
        return;
      }

      // function to read, copy from Internet, do not edit
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
          let raw = Buffer.from(res, "base64").toString();
          let servers = raw.split(/\s/);
          let result = [];
          for (let i = 0; i < servers.length; i++) {
            if (servers[i].length === 0) {
              continue;
            }
            if (!servers[i].startsWith("trojan://")) {
              throw "不支持的协议" + servers[i];
            }
            let at = servers[i].indexOf("@");
            let well = servers[i].indexOf("#");
            if (at < 0 || well < 0) {
              throw "不支持的协议" + servers[i];
            }
            result.push({
              name: servers[i].substring(well + 1),
              server: servers[i].substring(at + 1, well),
              password: servers[i].substring(9, at),
            });
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
      this.$router.push("/server");
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
  },
};
</script>
