# FloorPlan 3D Builder

Professional architectural design tool for creating floor plans and converting them to 3D house models.

## Features

### 🧱 Structure Components
- **Walls** - Drag to add, adjustable thickness
- **Floors** - Room floors with grid pattern
- **Doors** - With arc swing visualization
- **Windows** - Transparent panes
- **Roofs** - Triangular roof shapes
- **Pillars** - Circular support columns

### 📐 Builder Tools
- **Drag & Drop** - Click components to add
- **Quick Rooms** - Pre-made room templates (3×3, 4×4, 5×4)
- **Move Tool** - Drag elements around
- **Delete/Duplicate** - Manage elements
- **Grid System** - 1m grid with measurements

### 📏 Properties Panel
- **Position** - X, Y coordinates in meters
- **Size** - Width, Height in meters
- **Quick Sizes** - Preset 1m-6m options
- **Height** - For 3D generation (2-6m)
- **Color** - Custom element colors

### 🏗️ 3D Features
- **2D/3D Toggle** - Switch between views
- **Auto-generate** - Convert plan to 3D
- **Interactive Viewer** - Rotate, zoom
- **Export OBJ** - Save 3D model

### 💾 Project Management
- **New** - Start fresh project
- **Save** - Save as .fplan file
- **Load** - Open saved projects
- **Export Image** - Save floor plan as PNG
- **Export 3D** - Export as OBJ file

## Installation

```bash
npm install
npm start
```

## Usage

### Adding Elements
1. Click any component in the left panel
2. Element appears on canvas
3. Click to select, drag to move
4. Use properties panel to adjust

### Quick Rooms
- Click "3×3 Room", "4×4 Room", etc.
- Instantly adds walls + floor

### 3D Generation
1. Design your floor plan in 2D
2. Click "3D View" in toolbar
3. Model auto-generates
4. Export as OBJ

## Controls

| Tool | Function |
|------|----------|
| Select | Click to select elements |
| Move | Drag elements |
| Draw | (Coming soon) |
| Measure | (Coming soon) |
| Delete | Click element to remove |

## Grid System

- Small grid: 1m
- Major grid: 5m
- All measurements in real meters

## Tech Stack

- **Desktop**: Electron
- **3D**: Three.js
- **Export**: OBJ format

---

Built for civil architects 🏗️
