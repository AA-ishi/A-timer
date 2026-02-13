const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mainAPI', {
  openSettings: () => ipcRenderer.send("open-settings"),

  onApplyTime: (callback) => {
    ipcRenderer.on("apply-time", (event, data) => callback(data));
  },
  
  openSettingsAt: (centerX, centerY) => {
    ipcRenderer.send("open-settings-at", { centerX, centerY });
  },

  closeApp: () => ipcRenderer.send("close-main"),

  startDrag: (startX, startY) => {
    ipcRenderer.send("drag-start", { startX, startY });
  },

  updateDrag: (currentX, currentY) => {
    ipcRenderer.send("drag-move", { currentX, currentY });
  },

  endDrag: () => {
    ipcRenderer.send("drag-end");
  },
  
  changeScale: (scale) => ipcRenderer.send("change-scale", scale),
  openSizeMenu: () => ipcRenderer.send("open-size-menu"),

});