# FloorPlan to 3D Converter

Convert architectural floor plans (drawings) to 3D house models.

## Features

- 📐 Upload floor plan images (JPG, PNG, BMP)
- 🔍 Auto-detect walls using OpenCV
- 🎨 Adjust wall height, thickness, and colors
- 🏠 Generate 3D house model instantly
- 🔄 Interactive 3D viewer (rotate, zoom)
- 💾 Export to OBJ format

## Requirements

- Windows 10/11
- Python 3.8+ (for wall detection)
- OpenCV (`pip install opencv-python`)

## Quick Start

```bash
# Install dependencies
cd floorplan-to-3d
npm install

# Install Python OpenCV
pip install opencv-python numpy

# Run
npm start
```

## Usage

1. **Upload** - Click the drop zone or browse to select a floor plan image
2. **Adjust** - Set wall height (2-6m), thickness (0.1-0.5m), and colors
3. **Generate** - Click "Generate 3D Model"
4. **View** - Switch between 2D plan and 3D views
5. **Export** - Save as OBJ file

## How It Works

1. **Image Processing** - OpenCV detects lines/walls in the floor plan
2. **3D Generation** - Lines are extruded to walls with specified height
3. **Interactive Preview** - Three.js renders the 3D model

## Tech Stack

- **Desktop**: Electron
- **UI**: HTML/CSS/JavaScript
- **Image Processing**: Python + OpenCV
- **3D Rendering**: Three.js

## For Developers

### Build for Windows

```bash
npm run build
```

### Adding AI Detection (Phase 2)

Future versions can integrate:
- Deep learning models for room detection
- Automatic door/window recognition
- Floor plan segmentation

---

Built for civil architects 🏗️
