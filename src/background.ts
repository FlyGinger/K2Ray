import path from 'path';

import {
  app, BrowserWindow, Menu, protocol, Tray,
} from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';

import { clearBeforeQuit, register, registerOnWin } from '@/api/register';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

// eslint-disable-next-line no-underscore-dangle
declare let __static: string;

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    show: false,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      preload: path.join(__static, 'preload.js'),
    },
  });

  win.once('ready-to-show', () => {
    win.webContents.send('main-is-ready');
    win.show();
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    await win.loadURL('app://./index.html');
  }

  // bypass CORS
  win.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      callback({ requestHeaders: { Origin: '*', ...details.requestHeaders } });
    },
  );
  win.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: { 'Access-Control-Allow-Origin': ['*'], ...details.responseHeaders },
      });
    },
  );

  // register API
  registerOnWin(win);

  if (process.platform === 'win32') {
    win.setIcon(path.join(__static, 'appIcon/icon.iconset/icon_512x512.png'));
  }

  // focus me!
  win.moveTop();
}

if (process.platform === 'darwin') {
  app.dock.setIcon(path.join(__static, 'appIcon/icon.iconset/icon_512x512.png'));
} else {
  Menu.setApplicationMenu(null);
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform === 'darwin') {
    app.dock.hide();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
let tray: Tray;
app.on('ready', async () => {
  register();
  await createWindow();

  if (process.platform === 'darwin') {
    tray = new Tray(path.join(__static, 'trayIcon/trayTemplate.png'));
  } else {
    tray = new Tray(path.join(__static, 'trayIcon/trayWin.png'));
  }
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示',
      click() {
        if (BrowserWindow.getAllWindows().length === 0) {
          if (process.platform === 'darwin') {
            app.dock.show();
          }
          createWindow();
        }
      },
    },
    {
      label: '退出',
      click() {
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);
});

app.on('before-quit', () => {
  clearBeforeQuit();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
