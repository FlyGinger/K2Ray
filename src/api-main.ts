import {
  BrowserWindow, clipboard, dialog, ipcMain, shell,
} from 'electron';
import Store from 'electron-store';

import { registerLogOnBW } from '@/api/log';
import { checkSystemProxy, setSystemProxy, unsetSystemProxy } from '@/api/proxy';
import {
  v2rayClose, v2rayIsOn, v2rayLaunch, v2rayRelaunch,
} from '@/api/v2ray';

function registerClipboard(): void {
  // write string to clipboard
  ipcMain.on('write-clipboard', (event, data) => clipboard.writeText(data));
}

function registerPath(): void {
  ipcMain.handle('get-path',
    () => dialog.showOpenDialog({
      title: '选择 V2Ray 核心目录',
      properties: ['openDirectory', 'createDirectory'],
    }));
}

function registerOpenFile(): void {
  ipcMain.on('open-file', (event, filePath) => {
    shell.openPath(filePath);
  });
}

function registerSystemProxy(): void {
  ipcMain.on('set-proxy', (event, port) => {
    setSystemProxy(port);
  });

  ipcMain.on('unset-proxy', () => {
    unsetSystemProxy();
  });
}

function registerPersistentConfig(): void {
  const store = new Store({ name: 'k2ray' });
  // load config from persistent storage and return a promise
  ipcMain.handle('load-config',
    () => ({
      groups: store.get('groups'),
      routing: store.get('routing'),
      k2ray: store.get('k2ray'),
    }));

  // save config to persistent storage
  ipcMain.on('save-config', (event, config) => {
    store.set('groups', config.groups);
    store.set('routing', config.routing);
    store.set('k2ray', config.k2ray);
  });
}

function registerV2RayOnBW(win: BrowserWindow): void {
  ipcMain.on('v2ray-close', () => {
    v2rayClose();
    win.webContents.send('v2ray-state', false);
  });
  ipcMain.on('v2ray-launch', (event, state) => {
    win.webContents.send('v2ray-state', v2rayLaunch(state));
  });
  ipcMain.on('v2ray-relaunch', (event, state) => {
    win.webContents.send('v2ray-state', v2rayRelaunch(state));
  });

  win.on('close', () => {
    ipcMain.removeAllListeners('v2ray-close');
    ipcMain.removeAllListeners('v2ray-launch');
    ipcMain.removeAllListeners('v2ray-relaunch');
    ipcMain.removeHandler('v2ray-on');
    ipcMain.removeHandler('proxy-on');
  });
}

function registerHeartBeatOnBW(win: BrowserWindow): void {
  ipcMain.handle('v2ray-on', () => v2rayIsOn());
  ipcMain.handle('proxy-on', (event, port) => checkSystemProxy(port));

  win.on('close', () => {
    ipcMain.removeHandler('v2ray-on');
    ipcMain.removeHandler('proxy-on');
  });
}

function register(): void {
  registerClipboard();
  registerPath();
  registerOpenFile();
  registerSystemProxy();
  registerPersistentConfig();
}

function registerOnBW(win: BrowserWindow): void {
  registerLogOnBW(win);
  registerV2RayOnBW(win);
  registerHeartBeatOnBW(win);
}

ipcMain.on('main-debug', () => {
  // do nothing
});

export { register, registerOnBW };
