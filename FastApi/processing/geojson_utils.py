import geojson
from shapely.geometry import shape, mapping
from shapely.ops import transform as shapely_transform
import rasterio.features
from pyproj import Transformer


# =========================
# ✅ MASK → POLYGON
# =========================
def mask_to_polygons(mask, transform, min_area=200, max_polygons=100):
    mask = (mask > 0).astype("uint8")

    shapes = rasterio.features.shapes(mask, mask=mask, transform=transform)

    polygons = []
    count = 0

    for geom, value in shapes:
        if value != 1:
            continue

        poly = shape(geom)

        if not poly.is_valid:
            poly = poly.buffer(0)

        if poly.area < min_area:
            continue

        if poly.area > 1e10:
            continue

        poly = poly.simplify(0.5, preserve_topology=True)

        polygons.append(poly)
        count += 1

        if count >= max_polygons:
            break

    return polygons


# =========================
# ✅ CRS TRANSFORM (UPDATED)
# =========================
def get_transformers(dataset):
    if dataset.crs is None:
        raise ValueError("Dataset CRS not found")

    # For GeoJSON display (lat/lon)
    to_wgs84 = Transformer.from_crs(dataset.crs, "EPSG:4326", always_xy=True)

    # For area calculation (meters)
    to_meters = Transformer.from_crs(dataset.crs, "EPSG:3857", always_xy=True)

    return to_wgs84, to_meters


def transform_geometry(geom, transformer):
    return shapely_transform(transformer.transform, geom)


# =========================
# ✅ CREATE FEATURES (UPDATED)
# =========================
def create_feature(polygons, feature_type, to_wgs84, to_meters):
    features = []

    for poly in polygons:
        if poly.is_empty:
            continue

        try:
            # 🔥 Convert for area (meters)
            poly_m = transform_geometry(poly, to_meters)

            if not poly_m.is_valid:
                poly_m = poly_m.buffer(0)

            area = round(poly_m.area, 2)

            # 🌍 Convert for GeoJSON
            poly_wgs84 = transform_geometry(poly, to_wgs84)

            if not poly_wgs84.is_valid:
                poly_wgs84 = poly_wgs84.buffer(0)

            if poly_wgs84.is_empty:
                continue

            feature = geojson.Feature(
                geometry=mapping(poly_wgs84),
                properties={
                    "feature_type": feature_type,
                    "status": "Detected",
                    "area_sq_m": area
                }
            )

            features.append(feature)

        except Exception as e:
            print("Geometry error:", e)

    return features


# =========================
# ✅ MAIN FUNCTION (UPDATED)
# =========================
def create_geojson(dataset, water_mask, vegetation_mask, road_mask):

    transform = dataset.transform
    to_wgs84, to_meters = get_transformers(dataset)

    water_polygons = mask_to_polygons(water_mask, transform)
    veg_polygons = mask_to_polygons(vegetation_mask, transform)
    road_polygons = mask_to_polygons(road_mask, transform)

    features = []

    features.extend(create_feature(water_polygons, "Water", to_wgs84, to_meters))
    features.extend(create_feature(veg_polygons, "Vegetation", to_wgs84, to_meters))
    features.extend(create_feature(road_polygons, "Road", to_wgs84, to_meters))

    return geojson.FeatureCollection(features)