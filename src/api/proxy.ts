/*
MAIN ONLY: Functions in this file can be only executed in main process.
This file provides functions to get and set system proxy.
 */

import { execSync } from 'child_process';

import { log } from './log';

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
    const raw1 = execSync('reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable');
    const raw2 = execSync('reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer');
    const str1 = new TextDecoder().decode(raw1);
    const str2 = new TextDecoder().decode(raw2);
    const enable = Number(str1.trim().split(/\s/).pop()) === 1;
    const server = str2.trim().split(/\s/).pop();
    return enable && server === `127.0.0.1:${port.http}`;
  }
  return false;
}

// eslint-disable-next-line import/prefer-default-export
export { checkSystemProxy };
