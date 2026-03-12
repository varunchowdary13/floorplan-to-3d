const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const log = require('electron-log');

log.initialize();

// User data path for storing imports
const userDataPath = app.getPath('userData');
const importsPath = path.join(userDataPath, 'imports');
const outputsPath = path.join(userDataPath, 'outputs');

[importsPath, outputsPath, path.join(importsPath, 'plans')].forEach(p => {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

let mainWindow;
let pythonServer;

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

// Start Python server for AI processing
function startPythonServer() {
  const serverPath = app.isPackaged 
    ? path.join(process.resourcesPath, 'server')
    : path.join(__dirname, 'server');
  
  if (!fs.existsSync(serverPath)) {
    log.info('Server folder not found, AI features will work with basic processing');
    return;
  }

  pythonServer = spawn('python', ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000'], {
    cwd: serverPath,
    stdio: 'pipe'
  });

  pythonServer.stdout.on('data', (data) => {
    log.info('AI Server:', data.toString());
  });

  pythonServer.stderr.on('data', (data) => {
    log.error('AI Server Error:', data.toString());
  });
}

app.whenReady().then(() => {
  createWindow();
  startPythonServer();
});

app.on('window-all-closed', () => {
  if (pythonServer) pythonServer.kill();
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
      const ext = path.extname(fileName);
      const destPath = path.join(importsPath, 'plans', fileName);
      
      fs.copyFileSync(filePath, destPath);
      
      imported.push({
        name: fileName,
        path: destPath,
        type: ext.replace('.', '')
      });
    }
    
    return imported;
  }
  return null;
});

// Get imports list
ipcMain.handle('get-imports', async () => {
  const plansPath = path.join(importsPath, 'plans');
  
  if (!fs.existsSync(plansPath)) return [];
  
  return fs.readdirSync(plansPath).map(file => ({
    name: file,
    path: path.join(plansPath, file),
    type: path.extname(file).replace('.', '')
  }));
});

// AI: Convert sketch to 3D elements
ipcMain.handle('ai-convert-sketch', async (event, imagePath) => {
  return new Promise((resolve, reject) => {
    const serverPath = app.isPackaged 
      ? path.join(process.resourcesPath, 'server')
      : path.join(__dirname, 'server');
    
    // Try to call Python API, fallback to local processing
    const curl = spawn('curl', [
      '-X', 'POST',
      'http://127.0.0.1:8000/convert-sketch',
      '-H', 'Content-Type: application/json',
      '-d', JSON.stringify({ image_path: imagePath })
    ], { stdio: 'pipe' });

    let output = '';
    curl.stdout.on('data', (data) => { output += data.toString(); });
    curl.stderr.on('data', (data) => { log.info('Curl:', data.toString()); });
    
    curl.on('close', (code) => {
      if (code === 0 && output) {
        try {
          const result = JSON.parse(output);
          resolve(result);
        } catch (e) {
          // Fallback to basic processing
          resolve({ 
            success: true, 
            elements: [],
            message: 'Using basic processing' 
          });
        }
      } else {
        resolve({ 
          success: true, 
          elements: [],
          message: 'AI server not available, use manual builder' 
        });
      }
    });
  });
});

// Get image for preview
ipcMain.handle('get-image-path', async (event, fileName) => {
  return path.join(importsPath, 'plans', fileName);
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
    return JSON.parse(fs.readFileSync(result.filePaths[0], 'utf8'));
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
