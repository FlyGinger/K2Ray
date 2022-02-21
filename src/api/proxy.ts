/*
MAIN ONLY: Functions in this file can be only executed in main process.
This file provides functions to get and set system proxy.
 */

import { execSync } from 'child_process';

interface SystemProxy {
  HTTPEnable: boolean,
  HTTPPort: number,
  HTTPProxy: string | undefined,
  HTTPSEnable: boolean,
  HTTPSPort: number,
  HTTPSProxy: string | undefined,
  SOCKSEnable: boolean,
  SOCKSPort: number,
  SOCKSProxy: string | undefined,
}

const regName = '"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings"';

function parseScutilOutput(str: string): SystemProxy {
  const map = new Map<string, string>();
  const lines = str.split('\n');
  lines.forEach((v) => {
    const clean = v.trim();
    let pieces = clean.split(' ');
    pieces = pieces.filter((s) => s.length > 0);
    if (pieces.length === 3 && pieces[1] === ':') {
      map.set(pieces[0], pieces[2]);
    }
  });

  return {
    HTTPEnable: map.get('HTTPEnable') === '1',
    HTTPPort: Number(map.get('HTTPPort')),
    HTTPProxy: map.get('HTTPProxy'),
    HTTPSEnable: map.get('HTTPSEnable') === '1',
    HTTPSPort: Number(map.get('HTTPSPort')),
    HTTPSProxy: map.get('HTTPSProxy'),
    SOCKSEnable: map.get('SOCKSEnable') === '1',
    SOCKSPort: Number(map.get('SOCKSPort')),
    SOCKSProxy: map.get('SOCKSProxy'),
  };
}

// Return true if system proxy is set.
// Always return false on unsupported platform.
function checkSystemProxy(port: { socks: number, http: number }): boolean {
  if (process.platform === 'darwin') {
    const raw = execSync('scutil --proxy');
    const str = new TextDecoder().decode(raw);
    const config = parseScutilOutput(str);
    return config.HTTPEnable && config.HTTPPort === port.http && config.HTTPProxy === '127.0.0.1'
      && config.HTTPSEnable && config.HTTPSPort === port.http && config.HTTPSProxy === '127.0.0.1'
      && config.SOCKSEnable && config.SOCKSPort === port.socks && config.SOCKSProxy === '127.0.0.1';
  }
  if (process.platform === 'win32') {
    const raw1 = execSync(`reg query ${regName} /v ProxyEnable`);
    const raw2 = execSync(`reg query ${regName} /v ProxyServer`);
    const str1 = new TextDecoder().decode(raw1);
    const str2 = new TextDecoder().decode(raw2);
    const enable = Number(str1.trim().split(/\s/).pop()) === 1;
    const server = str2.trim().split(/\s/).pop();
    return enable && server === `127.0.0.1:${port.http}`;
  }
  return false;
}

function getActiveService(): string[] {
  // get all active device
  let raw = execSync('ifconfig');
  let str = new TextDecoder().decode(raw);
  let lines = str.split('\n');
  let name = '';
  const active = new Set<string>();
  lines.forEach((v: string) => {
    if (v.startsWith('\t')) {
      if (v.endsWith('status: active')) {
        active.add(name);
      }
    } else {
      const index = v.indexOf(':');
      name = v.substring(0, index);
    }
  });

  // find out all active service
  const result: string[] = [];
  raw = execSync('networksetup -listnetworkserviceorder');
  str = new TextDecoder().decode(raw);
  lines = str.split('\n');
  lines.forEach((v: string) => {
    if (v.startsWith('(Hardware Port: ')) {
      let start = 16;
      let end = start;
      while (v.charAt(end) !== ',') {
        end += 1;
      }
      const service = v.substring(start, end);

      start = end + 10;
      end = start + 1;
      while (v.charAt(end) !== ')') {
        end += 1;
      }
      const device = v.substring(start, end);

      if (active.has(device)) {
        result.push(service);
      }
    }
  });

  return result;
}

// Set system proxy.
// Do nothing on unsupported platform.
function setSystemProxy(port: { socks: number, http: number }): void {
  if (process.platform === 'darwin') {
    const services = getActiveService();
    services.forEach((s: string) => {
      execSync(`networksetup -setwebproxy "${s}" 127.0.0.1 ${port.http}`);
      execSync(`networksetup -setsecurewebproxy "${s}" 127.0.0.1 ${port.http}`);
      execSync(`networksetup -setsocksfirewallproxy "${s}" 127.0.0.1 ${port.socks}`);
    });
  } else if (process.platform === 'win32') {
    execSync(`reg add ${regName} /v ProxyEnable /t REG_DWORD /d 1 /f`);
    execSync(`reg add ${regName} /v ProxyServer /d "127.0.0.1:${port.http}" /f`);
  }
}

// Unset system proxy.
// Do nothing on unsupported platform.
function unsetSystemProxy(): void {
  if (process.platform === 'darwin') {
    const services = getActiveService();
    services.forEach((s: string) => {
      execSync(`networksetup -setwebproxystate "${s}" off`);
      execSync(`networksetup -setsecurewebproxystate "${s}" off`);
      execSync(`networksetup -setsocksfirewallproxystate "${s}" off`);
    });
  } else if (process.platform === 'win32') {
    execSync(`reg add ${regName} /v ProxyEnable /t REG_DWORD /d 0 /f`);
  }
}

// eslint-disable-next-line import/prefer-default-export
export { checkSystemProxy, setSystemProxy, unsetSystemProxy };
