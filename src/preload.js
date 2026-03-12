const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  importFile: () => ipcRenderer.invoke('import-file'),
  getImports: () => ipcRenderer.invoke('get-imports'),
  aiConvertSketch: (imagePath) => ipcRenderer.invoke('ai-convert-sketch', imagePath),
  getImagePath: (fileName) => ipcRenderer.invoke('get-image-path', fileName),
  saveProject: (data) => ipcRenderer.invoke('save-project', data),
  loadProject: () => ipcRenderer.invoke('load-project'),
  export3D: (data, format) => ipcRenderer.invoke('export-3d', data, format),
  exportImage: (dataUrl) => ipcRenderer.invoke('export-image', dataUrl)
});
