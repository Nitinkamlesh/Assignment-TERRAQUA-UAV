# 🌍 Geospatial Feature Extraction Platform

A full-stack web application that processes satellite imagery to automatically detect and classify geospatial features such as **Water Bodies, Vegetation, and Roads**, and converts them into **GeoJSON** for interactive visualization.

---

## 🚀 Project Overview

This project was developed as part of an internship assignment for **TERRAQUA UAV**.

The goal is to:
- Upload satellite images (GeoTIFF)
- Detect key geographical features
- Convert them into structured GeoJSON data
- Visualize results on an interactive map and image overlay

---

## 🧠 Features

✅ Detect Water Bodies (Lakes, Rivers, Ponds)  
✅ Detect Vegetation / Forest Areas  
✅ Detect Roads & Infrastructure  
✅ Generate GeoJSON with real-world coordinates  
✅ Display results on interactive map (Leaflet)  
✅ Display processed image with highlighted features  
✅ Download GeoJSON output  

---

## 🏗️ Tech Stack

### 🔹 Backend (Python - FastAPI)
- FastAPI
- OpenCV
- Rasterio
- NumPy
- Shapely
- PyProj

### 🔹 Frontend (React)
- React.js
- Leaflet (Map Visualization)
- Axios

### 🔹 Optional
- Java Backend (API Gateway / Integration)

---

## ⚙️ How It Works

1. User uploads satellite image (.tif)
2. Backend processes image:
   - Band analysis
   - Thresholding
   - Edge detection
3. Features detected:
   - Water
   - Vegetation
   - Roads
4. Masks converted to polygons
5. Output generated as GeoJSON
6. Results displayed:
   - 🗺 Map View
   - 🖼 Image Overlay

---

## 📸 Output

### 🗺 Map View
- Interactive visualization using GeoJSON
- Feature-based styling (Water, Vegetation, Roads)

### 🖼 Image View
- Processed satellite image
- Highlighted detected features

---

## 📂 Project Structure
