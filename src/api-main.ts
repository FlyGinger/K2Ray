import { ChildProcessWithoutNullStreams, execSync, spawn } from 'child_process';
import path from 'path';

import {
  BrowserWindow, clipboard, dialog, ipcMain, shell,
} from 'electron';
import Store from 'electron-store';

import { log, registerLog } from '@/api/log';
import { checkSystemProxy, setSystemProxy, unsetSystemProxy } from '@/api/proxy';

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

function getAllNetworkServices(): string[] {
  const raw = execSync('networksetup -listnetworkserviceorder', {});
  const str = new TextDecoder().decode(raw);
  const regexp = /\(\d+\)\s+.*/g;
  const services = [...str.matchAll(regexp)];
  const result = [] as string[];
  services.forEach((service) => {
    const j = service[0].indexOf(')');
    result.push(service[0].substring(j + 1)
      .trim());
  });
  return result;
}

// function setSystemProxy(port: { socks: number, http: number }): void {
//   if (process.platform === 'win32') {
//     try {
// eslint-disable-next-line max-len
//       execSync('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 1 /f', {});
// eslint-disable-next-line max-len
//       execSync(`reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer /d "127.0.0.1:${port.http.toString()}" /f`, {});
//     } catch (e) {
//       // do nothing
//     }
//   } else {
//     const services = getAllNetworkServices();
//     services.forEach((service) => {
//       try {
//         execSync(`networksetup -setwebproxy "${service}" 127.0.0.1 ${port.http.toString()}`, {});
// eslint-disable-next-line max-len
//         execSync(`networksetup -setsecurewebproxy "${service}" 127.0.0.1 ${port.http.toString()}`, {});
// eslint-disable-next-line max-len
//         execSync(`networksetup -setsocksfirewallproxy "${service}" 127.0.0.1 ${port.socks.toString()}`, {});
//       } catch (e) {
//         // do nothing
//       }
//     });
//   }
// }
//
// function unsetSystemProxy(): void {
//   if (process.platform === 'win32') {
//     try {
// eslint-disable-next-line max-len
//       execSync('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /f', {});
//     } catch (e) {
//       // do nothing
//     }
//   } else {
//     const services = getAllNetworkServices();
//     services.forEach((service) => {
//       try {
//         execSync(`networksetup -setwebproxystate "${service}" off`, {});
//         execSync(`networksetup -setsecurewebproxystate "${service}" off`, {});
//         execSync(`networksetup -setsocksfirewallproxystate "${service}" off`, {});
//       } catch (e) {
//         // do nothing
//       }
//     });
//   }
// }

function registerSystemProxyAPI(): void {
  ipcMain.on('set-proxy', (event, port) => {
    setSystemProxy(port);
  });

  ipcMain.on('unset-proxy', (event) => {
    unsetSystemProxy();
  });
}

function registerOpenFileAPI(): void {
  ipcMain.on('open-file', (event, filePath) => {
    shell.openPath(filePath);
  });
}

function register(): void {
  registerClipboardAPI();
  registerPathAPI();
  registerPersistentConfigAPI();
  registerSystemProxyAPI();
  registerOpenFileAPI();
}

function v2rayConfigGenerate(state: State): unknown {
  const certRaw = execSync(`"${path.join(state.k2ray.v2rayPath, 'v2ctl')}" cert`, {});
  const certStr = new TextDecoder().decode(certRaw);
  const cert = JSON.parse(certStr);

  const { server } = state.k2ray;
  if (server !== null) {
    const config = {
      log: {
        access: path.join(state.k2ray.v2rayPath, 'access.log'),
        error: path.join(state.k2ray.v2rayPath, 'error.log'),
        logLevel: 'warning',
      },
      inbounds: [
        {
          port: state.k2ray.inbound.socks,
          listen: '127.0.0.1',
          protocol: 'socks',
          settings: {
            udp: true,
            auth: 'noauth',
          },
        },
        {
          port: state.k2ray.inbound.http,
          listen: '127.0.0.1',
          protocol: 'http',
        },
      ],
      outbounds: [
        {
          tag: 'proxy',
          protocol: server.protocol,
          streamSettings: {
            network: 'tcp',
            security: 'tls',
            tlsSettings: {
              certificates: [cert],
            },
          },
          settings: {
            servers: [{
              password: server.password,
              port: server.port,
              email: '',
              level: 0,
              address: server.address,
            }],
          },
        },
        {
          tag: 'direct',
          protocol: 'freedom',
          settings: {
            domainStrategy: 'UseIP',
            userLevel: 0,
          },
        },
        {
          tag: 'block',
          protocol: 'blackhole',
          settings: {
            response: {
              type: 'none',
            },
          },
        },
      ],
      routing: {
        domainStrategy: 'IPIfNonMatch',
        domainMatcher: 'mph',
        rules: [] as unknown[],
      },
    };

    Object.keys(state.routing)
      .forEach((key) => {
        const rules = state.routing[key];
        const domains = [] as string[];
        const ip = [] as string[];
        rules.forEach((rule) => {
          if (rule.type === 'domains') {
            domains.push(rule.value);
          } else {
            ip.push(rule.value);
          }
        });
        if (domains.length > 0) {
          config.routing.rules.push({
            type: 'field',
            domains,
            outboundTag: key,
          });
        }
        if (ip.length > 0) {
          config.routing.rules.push({
            type: 'field',
            ip,
            outboundTag: key,
          });
        }
      });
    return config;
  }
  // unless user updated the config file and relaunch
  return null;
}

let v2rayProcess: ChildProcessWithoutNullStreams;
let channel: NodeJS.Timer;

function v2rayLaunch(state: State): boolean {
  const config = v2rayConfigGenerate(state);
  if (config === null) {
    return false;
  }
  const storeV2ray = new Store({ name: 'v2ray' });
  // eslint-disable-next-line @typescript-eslint/ban-types
  storeV2ray.set(config as object);
  v2rayProcess = spawn(path.join(state.k2ray.v2rayPath, 'v2ray'), ['-config', storeV2ray.path]);
  return true;
}

function v2rayClose(): void {
  if (v2rayProcess) {
    while (!v2rayProcess.kill()) {
      if (v2rayProcess.exitCode !== null) {
        break;
      }
    }
  }
}

function v2rayState(): boolean {
  return v2rayProcess && v2rayProcess.exitCode === null;
}

function registerV2RayAPI(win: BrowserWindow): void {
  ipcMain.on('v2ray-close', (event) => {
    v2rayClose();
    win.webContents.send('v2ray-state', false);
  });
  ipcMain.on('v2ray-launch', (event, state) => {
    if (v2rayLaunch(state)) {
      win.webContents.send('v2ray-state', true);
    }
  });
  ipcMain.on('v2ray-relaunch', (event, state) => {
    v2rayClose();
    if (v2rayLaunch(state)) {
      win.webContents.send('v2ray-state', true);
    }
  });

  channel = setInterval(() => {
    win.webContents.send('v2ray-state', v2rayState());
  }, 1000);

  win.on('close', () => {
    ipcMain.removeAllListeners('v2ray-close');
    ipcMain.removeAllListeners('v2ray-launch');
    ipcMain.removeAllListeners('v2ray-relaunch');
    clearInterval(channel);
  });
}

function registerOnWin(win: BrowserWindow): void {
  registerV2RayAPI(win);
  registerLog(win);
}

function clearBeforeQuit(): void {
  unsetSystemProxy();
  v2rayClose();
}

ipcMain.on('main-debug', (event) => {
  log('haha');
  log(checkSystemProxy({
    http: 8889,
    socks: 8888,
  }));
});

export { clearBeforeQuit, register, registerOnWin };
