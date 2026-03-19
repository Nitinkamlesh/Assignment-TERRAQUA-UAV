from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles   # ✅ ADDED
import shutil
import os
import uuid
import asyncio
from processing.detect import process_image

app = FastAPI(title="Geospatial Feature Extraction API")

# ✅ CORS (for React later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"   # ✅ ADDED

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)   # ✅ ADDED

# ✅ Serve output images (VERY IMPORTANT 🔥)
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")   # ✅ ADDED


# ✅ Root endpoint (health check)
@app.get("/")
def home():
    return {"message": "Backend is running 🚀"}


# ✅ Async processing API
@app.post("/process-image")
async def process_image_api(file: UploadFile = File(...)):

    # ✅ Validate file type
    if not file.filename.endswith((".tif", ".tiff")):
        raise HTTPException(status_code=400, detail="Only TIFF files supported")

    # ✅ Unique filename (avoid overwrite)
    unique_name = f"{uuid.uuid4()}.tif"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    try:
        # ✅ Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print(f"File saved: {file_path}")

        # ✅ Run processing in background thread
        result = await asyncio.to_thread(process_image, file_path)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # ✅ Cleanup uploaded file
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"Deleted: {file_path}")


# ✅ Run server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        workers=1
    )