import { ipcMain } from 'electron';
import Store from 'electron-store';

function registerPersistentConfigAPI() {
  const store = new Store({ name: 'k2ray' });

  // load config from persistent storage and return a promise
  ipcMain.handle('load-config', () => {
    const config = {
      groups: store.get('groups'),
      routing: store.get('routing'),
      k2ray: store.get('k2ray'),
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise((resolve, reject) => resolve(config));
  });
}

function register(): void {
  registerPersistentConfigAPI();
}

export default register;
