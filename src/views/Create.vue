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
    data: "",
  }),

  methods: {
    create() {
      if (!this.$refs.form.validate()) {
        return;
      }
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
      fetch(this.subcribeURL)
        .then(relay)
        .then((res) => window.api.send("msgbox", res))
        .catch((reason) =>
          window.api.send("msgbox", "无法获取订阅数据，请重试。")
        );

      console.log(this.data);
    },
    cancel() {
      this.$router.push("/server");
    },

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
