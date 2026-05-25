import {
  app,
  BrowserWindow,
  ipcMain,
  desktopCapturer,
  globalShortcut
} from "electron";

import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 850,
    frame: false,
    backgroundColor: "#cfd5d9",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false
    }
  });

  win.loadURL("http://localhost:5173");

  win.webContents.openDevTools();
}

ipcMain.handle("desktop-capturer:get-sources", async () => {
  return desktopCapturer.getSources({
    types: ["screen", "window"],
    thumbnailSize: {
      width: 300,
      height: 200
    }
  });
});

ipcMain.on("window:minimize", () => {
  win?.minimize();
});

ipcMain.on("window:close", () => {
  win?.close();
});

app.whenReady().then(() => {
  createWindow();

  // F5
  globalShortcut.register("F5", () => {
    win?.reload();
  });

  // CTRL + R
  globalShortcut.register("CommandOrControl+R", () => {
    win?.reload();
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});