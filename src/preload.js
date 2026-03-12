const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectImage: () => ipcRenderer.invoke('select-image'),
  processFloorplan: (imagePath, options) => ipcRenderer.invoke('process-floorplan', imagePath, options),
  export3D: (modelData, format) => ipcRenderer.invoke('export-3d', modelData, format)
});
