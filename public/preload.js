const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
    send: (channel, data) => {
        // whitelist channels
        let validChannels = [
            "save-all", // persistent config
            "write-clipboard", // clipboard
        ];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    invoke: (channel, func) => {
        let validChannels = ["load-all"]; // persistent config
        if (validChannels.includes(channel)) {
            return ipcRenderer.invoke(channel, func);
        }
    }
});
