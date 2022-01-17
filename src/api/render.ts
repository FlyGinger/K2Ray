function getPath(): Promise<string | null> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return window.api.invoke('get-path')
    .then((result: Electron.OpenDialogReturnValue): string | null => {
      if (result.canceled || result.filePaths.length === 0) {
        return null;
      }
      return result.filePaths[0];
    });
}

function openFile(path: string): void {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.api.send('open-file', path);
}

function setSystemProxy(port: unknown): void {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.api.send('set-proxy', port);
}

function unsetSystemProxy(): void {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.api.send('unset-proxy');
}

function writeClipboard(data: string): void {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.api.send('write-clipboard', data);
}

function v2rayClose(): void {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.api.send('v2ray-close');
}

function v2rayLaunch(state: State): void {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.api.send('v2ray-launch', state);
}

function v2rayRelaunch(state: State): void {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.api.send('v2ray-relaunch', state);
}

// eslint-disable-next-line import/prefer-default-export
export {
  getPath, openFile, setSystemProxy, unsetSystemProxy,
  v2rayClose, v2rayLaunch, v2rayRelaunch, writeClipboard,
};
