/*
MAIN ONLY: Functions in this file can be only executed in main process.
This file provides a function which can print information to console in renderer process.
 */

import { BrowserWindow } from 'electron';

let logHandler: (info: unknown) => void;

// Print info to console in renderer process.
function log(info: unknown): void {
  logHandler(info);
}

function registerLog(win: BrowserWindow): void {
  logHandler = (info: unknown): void => {
    win.webContents.send('console-log', info);
  };
}

export { log, registerLog };
