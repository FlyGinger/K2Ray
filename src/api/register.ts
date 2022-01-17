import { clipboard, dialog, ipcMain } from 'electron';
import Store from 'electron-store';

function registerClipboardAPI(): void {
  // write string to clipboard
  ipcMain.on('write-clipboard', (event, data) => clipboard.writeText(data));
}

function registerPathAPI(): void {
  ipcMain.handle('get-path',
    () => dialog.showOpenDialog({
      title: '选择 V2Ray 核心目录',
      properties: ['openDirectory', 'createDirectory'],
    }));
}

function registerPersistentConfigAPI(): void {
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

function register(): void {
  registerClipboardAPI();
  registerPathAPI();
  registerPersistentConfigAPI();
}

export default register;
