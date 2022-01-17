function writeClipboard(data: string): void {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.api.send('write-clipboard', data);
}

// eslint-disable-next-line import/prefer-default-export
export { writeClipboard };
