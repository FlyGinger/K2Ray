module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: "zenk.k2ray",
        productName: "K2Ray",
        mac: {
          icon: "public/icon_512x512.icns",
          type: "distribution",
          target: [
            "dmg"
          ]
        }
      }
    }
  }
}
