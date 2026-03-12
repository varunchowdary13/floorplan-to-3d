# FloorPlan 3D Pro

**Blender-like design tool for civil engineers and architects**

## Phase 1: Manual Builder ✅

### 📁 File Manager
- Import floor plan images (JPG, PNG, PDF)
- All imports stored in sidebar under "Imports > Plans"

### 🧱 Structural Components
| Component | Description |
|-----------|-------------|
| Wall | Load-bearing walls |
| Floor | Room slabs |
| Roof Flat | Flat roofing |
| Roof Pitched | Triangular roof |
| Pillar | Columns |
| Beam | Lintels |

### 🚪 Openings
| Component | Description |
|-----------|-------------|
| Door Single | Single door |
| Door Double | Double doors |
| Door Sliding | Sliding door |
| Window | Standard window |
| Bay Window | Bay window |

### 🛋️ Furniture
Bed Single, Bed Double, Sofa, Sofa L, Dining Table, Coffee Table, Chair, Wardrobe

### 🚿 Sanitary
Toilet, Basin, Bathtub, Shower

### 🍳 Kitchen
Counter, Cabinet, Stove, Fridge

---

## Phase 2: AI Conversion 🤖

### AI-Powered Sketch to 3D

The app now includes AI that can:
1. **Detect walls** from uploaded floor plan images
2. **Identify doors and windows**
3. **Count rooms**
4. **Auto-generate** editable 3D elements

### How to Use AI

1. Import a floor plan image (PNG/JPG)
2. Click **🤖 AI Convert** button in header
3. AI analyzes the sketch and creates elements
4. Edit/ customize the detected elements

### AI Features

- **OpenCV-based detection** — Uses computer vision to detect lines
- **Wall detection** — Identifies wall segments
- **Opening detection** — Finds doors and windows
- **Room counting** — Estimates number of rooms
- **Editable results** — All AI-detected elements can be modified

---

## Installation

### Frontend
```bash
npm install
npm start
```

### AI Server (Optional - for better detection)
```bash
cd server
pip install -r requirements.txt
python -m uvicorn main:app --port 8000
```

### Build for Windows
```bash
npm run build
```

---

## Usage

### Adding Elements Manually
1. Click any component in the sidebar
2. Element appears on canvas
3. Click to select, drag to move
4. Use properties panel to adjust

### Using AI
1. Import a floor plan image
2. Click "🤖 AI Convert"
3. AI detects and creates elements
4. Edit as needed

### 2D/3D Views
- Click "2D" or "3D" to toggle
- 3D auto-generates from your plan

### Export
- Save project (.fplan)
- Export as PNG image
- Export as OBJ 3D model

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Desktop | Electron |
| 3D Engine | Three.js |
| AI/ML | OpenCV, Python |
| Backend | FastAPI |

---

## Future (Phase 3)

- [ ] Advanced AI models (ControlNet, TripoSR)
- [ ] Automatic room detection
- [ ] Smart door/window placement
- [ ] Material/texture library
- [ ] Undo/Redo system

---

Built for civil engineers 🏗️
