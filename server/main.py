# FloorPlan 3D Pro - AI Server
# Handles sketch to 3D conversion using computer vision

import os
import json
import base64
import cv2
import numpy as np
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SketchRequest(BaseModel):
    image_path: str

class Element(BaseModel):
    type: str
    x: float
    y: float
    width: float
    height: float
    height3d: float
    color: str
    confidence: float = 1.0

class SketchResponse(BaseModel):
    success: bool
    elements: List[Element]
    message: str
    detected_rooms: int = 0

def detect_walls_and_openings(image_path: str) -> List[dict]:
    """
    Detect walls, doors, windows from floor plan sketch using OpenCV
    """
    # Read image
    img = cv2.imread(image_path)
    if img is None:
        return []
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply threshold to get binary image
    _, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY_INV)
    
    # Morphological operations to detect walls
    kernel = np.ones((3, 3), np.uint8)
    dilated = cv2.dilate(binary, kernel, iterations=2)
    
    # Find contours (walls)
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    elements = []
    img_height, img_width = img.shape[:2]
    
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < 500:  # Filter small contours
            continue
        
        x, y, w, h = cv2.boundingRect(cnt)
        
        # Determine if it's a wall, door, or window based on aspect ratio
        aspect_ratio = w / h if h > 0 else 1
        
        # Wall detection
        if w > 10 and h > 10:
            # Check for door-like shapes (thin rectangles)
            if aspect_ratio > 3 or aspect_ratio < 0.33:
                # Could be a door or window
                if area > 1000:
                    # Door
                    elements.append({
                        'type': 'door-single',
                        'x': x / img_width * 10,  # Scale to meters
                        'y': y / img_height * 10,
                        'width': w / img_width * 10,
                        'height': 0.15,
                        'height3d': 2.4,
                        'color': '#92400e',
                        'confidence': 0.7
                    })
                else:
                    # Window
                    elements.append({
                        'type': 'window-std',
                        'x': x / img_width * 10,
                        'y': y / img_height * 10,
                        'width': w / img_width * 10,
                        'height': 0.15,
                        'height3d': 1.5,
                        'color': '#60a5fa',
                        'confidence': 0.6
                    })
            else:
                # Wall
                elements.append({
                    'type': 'wall',
                    'x': x / img_width * 10,
                    'y': y / img_height * 10,
                    'width': w / img_width * 10,
                    'height': h / img_height * 10,
                    'height3d': 3.0,
                    'color': '#d4d4d4',
                    'confidence': 0.8
                })
    
    # Line detection for walls using HoughLinesP
    edges = cv2.Canny(gray, 50, 150)
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=80, minLineLength=30, maxLineGap=5)
    
    if lines is not None:
        for line in lines:
            x1, y1, x2, y2 = line[0]
            length = np.sqrt((x2-x1)**2 + (y2-y1)**2)
            
            if length > 50:  # Only significant lines
                # Determine orientation
                angle = np.abs(np.arctan2(y2-y1, x2-x1) * 180 / np.pi)
                
                # Horizontal or vertical walls
                if angle < 20 or angle > 160:  # Horizontal
                    elements.append({
                        'type': 'wall',
                        'x': min(x1, x2) / img_width * 10,
                        'y': y1 / img_height * 10,
                        'width': length / img_width * 10,
                        'height': 0.2,
                        'height3d': 3.0,
                        'color': '#d4d4d4',
                        'confidence': 0.5
                    })
                elif 70 < angle < 110:  # Vertical
                    elements.append({
                        'type': 'wall',
                        'x': x1 / img_width * 10,
                        'y': min(y1, y2) / img_height * 10,
                        'width': 0.2,
                        'height': length / img_height * 10,
                        'height3d': 3.0,
                        'color': '#d4d4d4',
                        'confidence': 0.5
                    })
    
    return elements

def detect_rooms(image_path: str) -> int:
    """Count rooms using contour detection"""
    img = cv2.imread(image_path)
    if img is None:
        return 0
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY_INV)
    
    # Find inner contours (rooms)
    contours, _ = cv2.findContours(binary, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    
    # Count significant contours
    rooms = sum(1 for cnt in contours if cv2.contourArea(cnt) > 2000)
    
    return max(rooms, 1)

@app.get("/")
async def root():
    return {"status": "ready", "service": "FloorPlan AI Converter"}

@app.post("/convert-sketch", response_model=SketchResponse)
async def convert_sketch(request: SketchRequest):
    """
    Convert floor plan sketch to 3D elements
    """
    image_path = request.image_path
    
    if not os.path.exists(image_path):
        return SketchResponse(
            success=False,
            elements=[],
            message="Image file not found"
        )
    
    try:
        # Detect elements
        elements = detect_walls_and_openings(image_path)
        rooms = detect_rooms(image_path)
        
        # Add floor for each detected room
        floors_added = set()
        for el in elements:
            if el['type'] == 'wall':
                # Try to add floor near wall
                floor_key = f"{int(el['x'])}-{int(el['y'])}"
                if floor_key not in floors_added:
                    elements.append({
                        'type': 'floor',
                        'x': el['x'],
                        'y': el['y'],
                        'width': el.get('width', 4),
                        'height': el.get('height', 4),
                        'height3d': 0.15,
                        'color': '#737373',
                        'confidence': 0.7
                    })
                    floors_added.add(floor_key)
        
        return SketchResponse(
            success=True,
            elements=[Element(**el) for el in elements[:50]],  # Limit to 50 elements
            message=f"Detected {len(elements)} elements from {rooms} rooms",
            detected_rooms=rooms
        )
        
    except Exception as e:
        return SketchResponse(
            success=False,
            elements=[],
            message=f"Error processing image: {str(e)}"
        )

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
