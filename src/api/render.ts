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

function writeClipboard(data: string): void {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.api.send('write-clipboard', data);
}

// eslint-disable-next-line import/prefer-default-export
export { getPath, writeClipboard };
