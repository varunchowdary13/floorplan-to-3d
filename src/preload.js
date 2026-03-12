const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveProject: (data) => ipcRenderer.invoke('save-project', data),
  loadProject: () => ipcRenderer.invoke('load-project'),
  export3D: (data, format) => ipcRenderer.invoke('export-3d', data, format),
  exportImage: (dataUrl) => ipcRenderer.invoke('export-image', dataUrl)
});
