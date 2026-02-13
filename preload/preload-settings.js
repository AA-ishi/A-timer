const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('settingsAPI', {
  setTimer: (data) => ipcRenderer.send("set-timer", data),
  close: () => ipcRenderer.send("close-settings")
});