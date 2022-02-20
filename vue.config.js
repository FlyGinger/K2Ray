module.exports = {
  transpileDependencies: [
    'vuetify',
  ],
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        productName: 'K2Ray',
        mac: {
          icon: 'public/appIcon/icon_512x512.icns',
          type: 'distribution',
          target: ['dmg'],
        },
        win: {
          icon: 'public/appIcon/icon_512x512.icns',
          target: 'portable',
        },
      },
    },
  },
};
