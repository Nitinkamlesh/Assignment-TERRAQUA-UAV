import rasterio
import numpy as np
import cv2
import os
from processing.geojson_utils import create_geojson


# =========================
# ✅ CLEAN MASK
# =========================
def clean_mask(mask):
    kernel = np.ones((3, 3), np.uint8)
    mask = mask.astype(np.uint8) * 255
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    return mask > 0


def process_image(file_path):
    print("Opening image...")

    with rasterio.open(file_path) as dataset:

        # =========================
        # ✅ READ WINDOW (FAST)
        # =========================
        window_size = min(1500, dataset.height, dataset.width)

        image = dataset.read(
            [1, 2, 3],
            window=((0, window_size), (0, window_size))
        )

        rgb = np.moveaxis(image, 0, -1)

        # =========================
        # 🔥 NORMALIZE
        # =========================
        rgb = cv2.normalize(rgb, None, 0, 255, cv2.NORM_MINMAX)
        rgb = rgb.astype(np.uint8)

        rgb = cv2.resize(rgb, (512, 512))

        print("Processing...")

        # =========================
        # ✅ BAND SPLIT
        # =========================
        band1 = rgb[:, :, 0]
        band2 = rgb[:, :, 1]
        band3 = rgb[:, :, 2]

        means = [np.mean(band1), np.mean(band2), np.mean(band3)]
        print("Band means:", means)

        # =========================
        # 🔥 AUTO BAND SORT
        # =========================
        bands = [band1, band2, band3]
        sorted_idx = np.argsort(means)

        dark = bands[sorted_idx[0]]
        mid = bands[sorted_idx[1]]
        bright = bands[sorted_idx[2]]

        # =========================
        # 🌳 VEGETATION (STRICT)
        # =========================
        veg_threshold = np.percentile(mid, 92)

        vegetation_mask = (
            (mid > veg_threshold) &
            (mid > bright * 0.7)
        )

        # =========================
        # 🌊 WATER (STRICT)
        # =========================
        water_mask = (
            (dark < np.percentile(dark, 10)) &
            (mid < np.percentile(mid, 30)) &
            (bright < np.percentile(bright, 40))
        )

        # =========================
        # 🛣 ROAD DETECTION (FINAL BALANCED)
        # =========================
        gray = cv2.cvtColor(rgb, cv2.COLOR_BGR2GRAY)

        blur = cv2.GaussianBlur(gray, (5, 5), 0)

        edges = cv2.Canny(blur, 70, 160)

        kernel = np.ones((2, 2), np.uint8)

        road_mask = cv2.dilate(edges, kernel, iterations=1)
        road_mask = cv2.morphologyEx(road_mask, cv2.MORPH_OPEN, kernel)

        density = cv2.blur(road_mask.astype(np.float32), (10, 10))
        road_mask = road_mask & (density < 80)

        # =========================
        # ✅ REMOVE OVERLAP
        # =========================
        road_mask = (road_mask > 0) & (~vegetation_mask) & (~water_mask)
        road_mask = (road_mask > 0) & (~vegetation_mask) & (~water_mask)

        vegetation_mask = vegetation_mask & (~water_mask)

        # =========================
        # ✅ CLEAN FINAL MASKS
        # =========================
        vegetation_mask = clean_mask(vegetation_mask)
        water_mask = clean_mask(water_mask)

        print("Detection done")

        print("Water pixels:", np.sum(water_mask))
        print("Vegetation pixels:", np.sum(vegetation_mask))
        print("Road pixels:", np.sum(road_mask))

        # =========================
        # 🎨 CREATE OVERLAY IMAGE (ADDED)
        # =========================
        overlay = rgb.copy()

        overlay[water_mask] = [255, 0, 0]       # 🔵 Water
        overlay[vegetation_mask] = [0, 255, 0]  # 🟢 Vegetation
        overlay[road_mask] = [128, 128, 128]    # ⚫ Road

        # =========================
        # 💾 SAVE OVERLAY IMAGE (ADDED)
        # =========================
        os.makedirs("outputs", exist_ok=True)

        filename = os.path.basename(file_path).replace(".tif", ".png")
        output_path = f"outputs/overlay_{filename}"

        cv2.imwrite(output_path, overlay)

        print("Overlay saved at:", output_path)

        # =========================
        # ✅ CREATE GEOJSON
        # =========================
        geojson_data = create_geojson(
            dataset,
            water_mask,
            vegetation_mask,
            road_mask
        )

        print("GeoJSON created")

        return {
            "geojson": geojson_data,
            "image_url": f"http://127.0.0.1:8000/{output_path}"
        }