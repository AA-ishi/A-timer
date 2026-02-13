// ------------------------------------------------------------
// main.js — アプリのメインプロセス
// ------------------------------------------------------------

const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');

let mainWindow;
let settingsWindow;

let dragStartWindowX = 0;
let dragStartWindowY = 0;
let dragStartMouseX = 0;
let dragStartMouseY = 0;

// ------------------------------------------------------------
// メインウィンドウ
// ------------------------------------------------------------
function createWindow() {
  const { width, height } = require('electron').screen.getPrimaryDisplay().workAreaSize;

  const winW = 260;
  const winH = 260;

  const posX = Math.round((width - winW) / 2);
  const posY = Math.round((height - winH) / 2);

  mainWindow = new BrowserWindow({
    width: winW,
    height: winH,
    x: posX,
    y: posY,
    transparent: true,
    backgroundColor: "#00000000",
    frame: false,
    resizable: true,

    webPreferences: {
      preload: path.join(__dirname, 'preload/preload-main.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'public/index.html'));
}
let baseSize = 220;   // タイマー円の初期サイズ
let scale = 1.0;      // 現在の縮尺
// ------------------------------------------------------------
// 設定ウィンドウ
// ------------------------------------------------------------
function openSettingsWindow(centerX = null, centerY = null) {
  if (settingsWindow) return;

  const settingsW = 260;
  const settingsH = 180;

  let posX;
  let posY;

  if (centerX !== null && centerY !== null) {
    // 円の中心に合わせる
    posX = Math.round(centerX - settingsW / 2);
    posY = Math.round(centerY - settingsH / 2);
  } else {
    // フォールバック：メイン中央
    const [mainX, mainY] = mainWindow.getPosition();
    const [mainW, mainH] = mainWindow.getSize();
    posX = mainX + Math.round((mainW - settingsW) / 2);
    posY = mainY + Math.round((mainH - settingsH) / 2);
  }

  settingsWindow = new BrowserWindow({
    width: settingsW,
    height: settingsH,
    x: posX,
    y: posY,
    transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    parent: mainWindow,
    webPreferences: {
      preload: path.join(__dirname, 'preload/preload-settings.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const [mainX, mainY] = mainWindow.getPosition();
  const [settingsX, settingsY] = settingsWindow.getPosition();
  settingsOffsetX = settingsX - mainX;
  settingsOffsetY = settingsY - mainY;

  settingsWindow.loadFile(path.join(__dirname, 'public/settings.html'));

  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });
}
// ------------------------------------------------------------
// IPC
// ------------------------------------------------------------
ipcMain.on("open-settings", () => {
  openSettingsWindow();
});

ipcMain.on("open-settings-at", (event, { centerX, centerY }) => {
  openSettingsWindow(centerX, centerY);
});

ipcMain.on("set-timer", (event, data) => {
  if (mainWindow) {
    mainWindow.webContents.send("apply-time", data);
  }
});

ipcMain.on("close-settings", () => {
  if (settingsWindow) settingsWindow.close();
});

ipcMain.on("close-main", () => {
  if (mainWindow) mainWindow.close();
});

// ★ 自前ドラッグ用 IPC
ipcMain.on("drag-start", (event, { startX, startY }) => {
  if (!mainWindow) return;

  const [winX, winY] = mainWindow.getPosition();
  dragStartWindowX = winX;
  dragStartWindowY = winY;
  dragStartMouseX = startX;
  dragStartMouseY = startY;
});

ipcMain.on("drag-move", (event, { currentX, currentY }) => {
  if (!mainWindow) return;

  const deltaX = currentX - dragStartMouseX;
  const deltaY = currentY - dragStartMouseY;

  const newX = dragStartWindowX + deltaX;
  const newY = dragStartWindowY + deltaY;

  mainWindow.setPosition(newX, newY);
});

ipcMain.on("drag-end", () => {
  // 今回は特に何もしなくてOK（将来の拡張用に残しておく）
});
ipcMain.on("set-timer", (event, data) => {
  if (mainWindow) {
    mainWindow.webContents.send("apply-time", data);
  }
});

ipcMain.on("close-settings", () => {
  if (settingsWindow) settingsWindow.close();
});

ipcMain.on("close-main", () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.on("change-scale", (event, newScale) => {
  scale = Math.min(2.0, Math.max(0.4, newScale)); // 40%〜200%

  const newSize = Math.round(baseSize * scale);
  mainWindow.setSize(newSize, newSize);
});

ipcMain.on("open-size-menu", () => {
  const menu = Menu.buildFromTemplate([
    {
      label: "サイズ変更",
      submenu: [
        { label: "40%", click: () => mainWindow.setSize(baseSize * 0.4, baseSize * 0.4) },
        { label: "100%", click: () => mainWindow.setSize(baseSize * 1.0, baseSize * 1.0) },
        { label: "200%", click: () => mainWindow.setSize(baseSize * 2.0, baseSize * 2.0) },
      ]
    }
  ]);
  menu.popup();
});

// ------------------------------------------------------------
app.whenReady().then(() => {
  createWindow();
});