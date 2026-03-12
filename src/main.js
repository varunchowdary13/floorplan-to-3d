const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const log = require('electron-log');

log.initialize();

// User data path for storing imports
const userDataPath = app.getPath('userData');
const importsPath = path.join(userDataPath, 'imports');

if (!fs.existsSync(importsPath)) {
  fs.mkdirSync(importsPath, { recursive: true });
}
if (!fs.existsSync(path.join(importsPath, 'plans'))) {
  fs.mkdirSync(path.join(importsPath, 'plans'), { recursive: true });
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1200,
    minHeight: 800,
    backgroundColor: '#0a0a0f',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Import file
ipcMain.handle('import-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp'] },
      { name: 'PDF', extensions: ['pdf'] }
    ]
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    const imported = [];
    
    for (const filePath of result.filePaths) {
      const fileName = path.basename(filePath);
      const destPath = path.join(importsPath, 'plans', fileName);
      
      // Copy file to imports folder
      fs.copyFileSync(filePath, destPath);
      
      imported.push({
        name: fileName,
        path: destPath,
        type: path.extname(fileName).replace('.', '')
      });
    }
    
    return imported;
  }
  return null;
});

// Get imports list
ipcMain.handle('get-imports', async () => {
  const plansPath = path.join(importsPath, 'plans');
  
  if (!fs.existsSync(plansPath)) {
    return [];
  }
  
  const files = fs.readdirSync(plansPath);
  return files.map(file => ({
    name: file,
    path: path.join(plansPath, file),
    type: path.extname(file).replace('.', '')
  }));
});

// Save project
ipcMain.handle('save-project', async (event, projectData) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [{ name: 'FloorPlan Project', extensions: ['fplan'] }]
  });
  if (!result.canceled && result.filePath) {
    fs.writeFileSync(result.filePath, JSON.stringify(projectData, null, 2));
    return result.filePath;
  }
  return null;
});

// Load project
ipcMain.handle('load-project', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    filters: [{ name: 'FloorPlan Project', extensions: ['fplan'] }]
  });
  if (!result.canceled && result.filePaths.length > 0) {
    const data = fs.readFileSync(result.filePaths[0], 'utf8');
    return JSON.parse(data);
  }
  return null;
});

// Export 3D
ipcMain.handle('export-3d', async (event, modelData, format) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: `house-model.${format}`,
    filters: [
      { name: 'OBJ File', extensions: ['obj'] },
      { name: 'GLTF File', extensions: ['gltf'] }
    ]
  });
  if (!result.canceled && result.filePath) {
    fs.writeFileSync(result.filePath, modelData);
    return result.filePath;
  }
  return null;
});

// Export image
ipcMain.handle('export-image', async (event, dataUrl) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: 'floorplan.png',
    filters: [{ name: 'PNG Image', extensions: ['png'] }]
  });
  if (!result.canceled && result.filePath) {
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(result.filePath, Buffer.from(base64Data, 'base64'));
    return result.filePath;
  }
  return null;
});
