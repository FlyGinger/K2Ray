import { clipboard, ipcMain } from 'electron';
import Store from 'electron-store';

function registerClipboardAPI(): void {
  // write string to clipboard
  ipcMain.on('write-clipboard', (event, data) => clipboard.writeText(data));
}

function registerPersistentConfigAPI(): void {
  const store = new Store({ name: 'k2ray' });
  // load config from persistent storage and return a promise
  ipcMain.handle('load-config', () => {
    const config = {
      // store.get() returns the whole object but is complained by eslint.
      groups: store.get('groups'),
      routing: store.get('routing'),
      k2ray: store.get('k2ray'),
    };
    return new Promise((resolve, reject) => resolve(config));
  });

  // save config to persistent storage
  ipcMain.on('save-config', (event, config) => {
    store.set(config);
  });
}

function register(): void {
  registerClipboardAPI();
  registerPersistentConfigAPI();
}

export default register;
