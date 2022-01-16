/* eslint-disable */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // send: (channel: string, data: unknown) => {
  //   // whitelist channels
  //   const validChannels = ['toMain'];
  //   if (validChannels.includes(channel)) {
  //     ipcRenderer.send(channel, data);
  //   }
  // },

  invoke: (channel, func) => {
    const validChannels = ['load-config', // persistent config
    ];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, func);
    }
  },

  receive: (channel, func) => {
    const validChannels = ['main-is-ready'];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});
