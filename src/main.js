const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const log = require('electron-log');
const fs = require('fs');

log.initialize();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#0f0f14',
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

ipcMain.handle('select-image', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp'] }]
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('process-floorplan', async (event, imagePath, options) => {
  const { spawn } = require('child_process');
  
  return new Promise((resolve, reject) => {
    const args = [
      '-c',
      `
import cv2
import numpy as np
import json

img = cv2.imread('${imagePath.replace(/\\/g, '\\\\')}', cv2.IMREAD_GRAYSCALE)
if img is None:
    print(json.dumps({'error': 'Could not load image'}))
    exit()

# Adaptive thresholding
thresh = cv2.adaptiveThreshold(img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2)

# Morphological operations to detect walls
kernel = np.ones((3,3), np.uint8)
dilated = cv2.dilate(thresh, kernel, iterations=2)

# Find contours
contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

walls = []
for cnt in contours:
    area = cv2.contourArea(cnt)
    if area > 500:  # Filter small contours
        x, y, w, h = cv2.boundingRect(cnt)
        walls.append({'x': float(x), 'y': float(y), 'w': float(w), 'h': float(h)})

# Line detection using HoughLinesP
edges = cv2.Canny(thresh, 50, 150)
lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=80, minLineLength=30, maxLineGap=5)

line_segments = []
if lines is not None:
    for line in lines:
        x1, y1, x2, y2 = line[0]
        line_segments.append({'x1': float(x1), 'y1': float(y1), 'x2': float(x2), 'y2': float(y2)})

print(json.dumps({'walls': walls, 'lines': line_segments, 'width': int(img.shape[1]), 'height': int(img.shape[0])}))
`
    ];
    
    const proc = spawn('python', args);
    let output = '';
    
    proc.stdout.on('data', (data) => { output += data.toString(); });
    proc.stderr.on('data', (data) => { 
      log.error('Python:', data.toString()); 
    });
    
    proc.on('close', (code) => {
      try {
        const result = JSON.parse(output.trim());
        resolve(result);
      } catch (e) {
        reject(new Error('Failed to parse output: ' + output));
      }
    });
  });
});

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
