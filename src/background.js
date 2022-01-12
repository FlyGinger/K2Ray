'use strict'

import path from 'path'
const { execSync, spawn } = require('child_process')

import { app, protocol, BrowserWindow, ipcMain, clipboard, dialog, shell } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const Store = require('electron-store')

import v2rayConfigGenerate from "./utils/v2rayConfigGenerate.js";

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

let win
async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__static, "preload.js") // use a preload script
    }
  })

  // copy from Internet, do not edit, XD
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  // bypass CORS
  win.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      callback({ requestHeaders: { Origin: '*', ...details.requestHeaders } })
    });

  win.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: { 'Access-Control-Allow-Origin': ['*'], ...details.responseHeaders },
      })
    });
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// persistent config
const store = new Store()
ipcMain.handle("load-all", async (event) => {
  const result = await new Promise((resolve, reject) => {
    resolve(store.get())
  })
  return result
})
ipcMain.on("save-all", (event, config) => store.set(config))

// clipboard
ipcMain.on("write-clipboard", (event, value) => clipboard.writeText(value))

// V2Ray path
ipcMain.handle("get-path", async (event) => {
  return dialog.showOpenDialog({
    title: "选择 V2Ray 核心所在目录",
    properties: ["openDirectory", "createDirectory"]
  })
})

// V2Ray
let v2rayProcess
function launch(state) {
  let config = v2rayConfigGenerate(state)
  let storeV2ray = new Store({ name: "v2ray" })
  storeV2ray.set(config)
  v2rayProcess = spawn(path.join(state.k2ray.core.v2rayPath, "v2ray"), ["-config", storeV2ray.path])
  // let decoder = new TextDecoder()
  // v2rayProcess.stdout.on('data', (data) => {
  //   win.webContents.send("log", decoder.decode(data))
  // })
}
function close() {
  if (v2rayProcess) {
    while (!v2rayProcess.kill()) { }
  }
  v2rayProcess = undefined
}
ipcMain.on("launch", (event, state) => {
  launch(state)
})
ipcMain.on("close", (event) => {
  close()
})
ipcMain.on("relaunch", (event, state) => {
  close()
  launch(state)
})

// system proxy
function getAllNetworkServices(params) {
  let raw = execSync("networksetup -listnetworkserviceorder", {})
  let str = new TextDecoder().decode(raw);
  let regexp = /\(\d+\)\s+.*/g
  let services = [...str.matchAll(regexp)]
  for (let i in services) {
    let j = services[i][0].indexOf(")")
    dialog.showMessageBox({ message: services[i][0] })
    services[i] = services[i][0].substring(j + 1).trim()
  }
  return services
}
ipcMain.on("set-proxy", (event, ports) => {
  let services = getAllNetworkServices()
  services.forEach((service) => {
    try {
      execSync("networksetup -setwebproxy " + service + " 127.0.0.1 " + ports.http.toString(), {})
      execSync("networksetup -setsecurewebproxy " + service + " 127.0.0.1 " + ports.http.toString(), {})
      execSync("networksetup -setsocksfirewallproxy " + service + " 127.0.0.1 " + ports.socks.toString(), {})
    } catch (e) {
    }
  })
})
ipcMain.on("unset-proxy", (event) => {
  let services = getAllNetworkServices()
  services.forEach((service) => {
    try {
      execSync("networksetup -setwebproxystate " + service + " off", {})
      execSync("networksetup -setsecurewebproxystate " + service + " off", {})
      execSync("networksetup -setsocksfirewallproxystate " + service + " off", {})
    } catch (e) {
    }
  })
})

// v2ray log
ipcMain.on("open-access", (event, v2rayPath) => {
  let p = path.join(v2rayPath, "access.log")
  shell.openPath(p)
})
ipcMain.on("open-error", (event, v2rayPath) => {
  shell.openPath(path.join(v2rayPath, "error.log"))
})

// Exit cleanly on request from parent process in development mode.
const isDevelopment = process.env.NODE_ENV !== 'production'
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      close()
      app.quit()
    })
  }
}
