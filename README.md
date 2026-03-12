# FloorPlan 3D Pro

**Blender-like design tool for civil engineers and architects**

## Features

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
| Component | Description |
|-----------|-------------|
| Bed Single | Single bed |
| Bed Double | Double bed |
| Sofa | Standard sofa |
| Sofa L | L-shaped sofa |
| Table Dining | Dining table |
| Coffee Table | Coffee table |
| Chair | Chair |
| Wardrobe | Wardrobe |

### 🚿 Sanitary
| Component | Description |
|-----------|-------------|
| Toilet | Toilet |
| Basin | Sink/basin |
| Bathtub | Bathtub |
| Shower | Shower unit |

### 🍳 Kitchen
| Component | Description |
|-----------|-------------|
| Counter | Kitchen counter |
| Cabinet | Storage cabinet |
| Stove | Cooking stove |
| Fridge | Refrigerator |

## Usage

### Adding Elements
1. Click any component in the sidebar
2. Element appears on canvas
3. Click to select, drag to move

### Editing
- Select element → properties panel shows
- Adjust position, size (in meters)
- Change height for 3D
- Pick custom colors

### 2D/3D Views
- Click "2D" or "3D" to toggle
- 3D auto-generates from your plan

### Export
- Save project (.fplan)
- Export as PNG image
- Export as OBJ 3D model

## Install

```bash
npm install
npm start
```

## Build for Windows

```bash
npm run build
```

---

Built for civil engineers 🏗️
