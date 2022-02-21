/*
MAIN ONLY: Functions in this file can be only executed in main process.
This file provides functions to control V2Ray process.
 */

import { ChildProcessWithoutNullStreams, execSync, spawn } from 'child_process';
import Store from 'electron-store';
import path from 'path';

import { BrowserWindow, ipcMain } from 'electron';

function v2rayConfigGenerate(state: State): unknown {
  const certRaw = execSync(`"${path.join(state.k2ray.v2rayPath, 'v2ctl')}" cert`);
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

let v2ray: ChildProcessWithoutNullStreams;

// Launch V2Ray.
function v2rayLaunch(state: State): boolean {
  const config = v2rayConfigGenerate(state);
  if (config === null) {
    return false;
  }
  const storeV2ray = new Store({ name: 'v2ray' });
  // eslint-disable-next-line @typescript-eslint/ban-types
  storeV2ray.set(config as object);
  v2ray = spawn(path.join(state.k2ray.v2rayPath, 'v2ray'), ['-config', storeV2ray.path]);
  return true;
}

// Close V2Ray.
function v2rayClose(): void {
  if (v2ray) {
    while (!v2ray.kill()) {
      if (v2ray.exitCode !== null) {
        break;
      }
    }
  }
}

// Relaunch V2Ray.
function v2rayRelaunch(state: State): boolean {
  v2rayClose();
  return v2rayLaunch(state);
}

// Return true if V2Ray is running.
function v2rayIsOn(): boolean {
  return v2ray && v2ray.exitCode === null;
}

export {
  v2rayLaunch, v2rayClose, v2rayRelaunch, v2rayIsOn,
};
