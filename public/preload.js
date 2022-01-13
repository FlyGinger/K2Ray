const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
    send: (channel, data) => {
        // whitelist channels
        let validChannels = [
            "save-all", // persistent config
            "write-clipboard", // clipboard
            "launch", "close", "relaunch", // v2ray
            "set-proxy", "unset-proxy", // system proxy
            "open-access", "open-error", // v2ray log
            "set-login-item", // start at login
        ];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    invoke: (channel, func) => {
        let validChannels = [
            "load-all", // persistent config
            "get-path", // get V2Ray path
        ];
        if (validChannels.includes(channel)) {
            return ipcRenderer.invoke(channel, func);
        }
    },
    receive: (channel, func) => {
        let validChannels = ["v2rayState"];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    }
});
