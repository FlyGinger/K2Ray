/* eslint-disable */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => {
    // whitelist channels
    const validChannels = ['main-debug', 'open-file', 'save-config', 'set-proxy', 'unset-proxy',
      'v2ray-close', 'v2ray-launch', 'v2ray-relaunch', 'write-clipboard'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },

  invoke: (channel, func) => {
    const validChannels = ['get-path', 'load-config'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, func);
    }
  },

  receive: (channel, func) => {
    const validChannels = ['main-is-ready', 'v2ray-state', 'console-log'];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});
