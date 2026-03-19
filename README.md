# 🌍 Geospatial Feature Extraction Platform

A full-stack geospatial intelligence platform that processes satellite imagery to detect and classify Water Bodies, Vegetation, and Roads, and converts them into GeoJSON for interactive visualization.

---

## 🚀 Project Overview

This project was developed as part of an internship assignment for TERRAQUA UAV.

The system allows users to:
- Upload satellite imagery (GeoTIFF)
- Automatically detect key geographical features
- Convert them into structured GeoJSON
- Visualize results on an interactive map and processed image

---

## 🧠 Core Features

### 🔍 Feature Detection
- 🌊 Water Bodies (Lakes, Rivers, Ponds)
- 🌳 Vegetation / Forest Areas
- 🛣 Roads & Infrastructure

### 📊 Output
- GeoJSON with real-world coordinates
- Each feature includes:
  - feature_type
  - status
  - area_sq_m

### 🖥 Visualization
- 🗺 Interactive Map (Leaflet)
- 🖼 Processed Image Overlay
- 📥 Download GeoJSON

---

## 🏗️ Tech Stack

### 🔹 Python Backend (Core Processing Engine)
- FastAPI
- OpenCV
- Rasterio
- NumPy
- Shapely
- PyProj

### 🔹 Java Backend (Middleware / API Gateway)
- Spring Boot
- Handles request routing between frontend and Python backend

### 🔹 Frontend (User Interface)
- React.js
- Leaflet (Map Visualization)
- Axios

---

## ⚙️ System Architecture

Frontend (React)
↓
Java Backend (Spring Boot)
↓
Python Backend (FastAPI - Processing Engine)
↓
GeoJSON + Processed Image
↓
Frontend Visualization (Map + Image)

---

## ⚙️ How It Works

1. User uploads a satellite image (.tif)
2. Request is sent to Java backend
3. Java backend forwards request to FastAPI
4. Python processing pipeline performs:
   - Band normalization
   - Thresholding
   - Edge detection
   - Feature segmentation
5. Masks are converted into polygons
6. CRS transformation applied (EPSG:4326)
7. Output generated:
   - GeoJSON
   - Processed image overlay
8. Data returned to frontend
9. Displayed as:
   - Map View
   - Image View

---

## 📂 Project Structure

backend-fastapi/
  main.py
  processing/
    detect.py
    geojson_utils.py

backend-java/
  src/
  pom.xml

frontend/
  geospatial-ui/
    src/
    public/

README.md

---

## 🚀 Setup Instructions

### 🔹 Python Backend (FastAPI)

cd backend-fastapi
pip install -r requirements.txt
uvicorn main:app --reload

Backend runs at:
http://127.0.0.1:8000

---

### 🔹 Java Backend (Spring Boot)

cd backend-java
mvn clean install
mvn spring-boot:run

Runs on:
http://localhost:8080

---

### 🔹 Frontend (React)

cd frontend/geospatial-ui
npm install
npm start

Runs on:
http://localhost:3000

---

## 📡 API Flow

Frontend → Java Backend  
POST /api/upload  

Java Backend → Python Backend  
POST /process-image  

---

## 📦 API Response

{
  "geojson": {...},
  "image_url": "http://localhost:8000/outputs/overlay.png"
}

---

## 📊 GeoJSON Output Example

{
  "type": "Feature",
  "properties": {
    "feature_type": "Water",
    "status": "Detected",
    "area_sq_m": 1234.56
  }
}

---

## 📸 Output Views

### 🗺 Map View
- Displays GeoJSON features
- Color-coded:
  - Blue → Water
  - Green → Vegetation
  - Black → Roads

### 🖼 Image View
- Satellite image with highlighted detected features
- Overlay generated using OpenCV

---

## 🎯 Assignment Requirements Covered

✔ Image Upload API  
✔ Feature Detection Pipeline  
✔ GeoJSON Generation  
✔ Interactive Dashboard  
✔ Processed Image Visualization  
✔ Download GeoJSON  

---

## 🎥 Demo

(Add your demo video link here)

---

## 🚀 Future Improvements

- Deep Learning based segmentation (CNN / UNet)
- Multi-spectral band analysis
- Large image tiling support
- Cloud deployment (AWS / GCP)
- Real-time satellite processing

---

## 👨‍💻 Author

Nitin Kamlesh  
B.Tech Student  
Interested in GIS, AI & Full Stack Development  

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
