import React, { useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ✅ AUTO FIT (unchanged)
function FitBounds({ geoData }) {
  const map = useMap();

  React.useEffect(() => {
    if (!geoData) return;

    try {
      const layer = L.geoJSON(geoData);
      const bounds = layer.getBounds();

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    } catch (e) {
      console.log("FitBounds error:", e);
    }
  }, [geoData, map]);

  return null;
}

function App() {
  const [file, setFile] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState("map");
  const [fileName, setFileName] = useState("");
  const [stats, setStats] = useState(null);

  // 🚀 Upload
  const handleUpload = async () => {
    if (!file) return alert("Select file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setError("");
      setGeoData(null);
      setImageUrl("");
      setStats(null);

      const res = await axios.post(
        "http://127.0.0.1:8000/process-image",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (!res.data.geojson?.features?.length) {
        alert("No features detected");
        return;
      }

      setGeoData(res.data.geojson);
      setImageUrl(res.data.image_url);
      
      // Calculate stats
      const featureTypes = res.data.geojson.features.reduce((acc, f) => {
        const type = f.properties.feature_type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      setStats(featureTypes);

    } catch (err) {
      console.error("ERROR:", err);
      setError("Processing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🎨 STYLE (unchanged)
  const getStyle = (feature) => {
    const type = feature.properties.feature_type;

    if (type === "Water") {
      return {
        color: "#0077ff",
        fillColor: "#3399ff",
        fillOpacity: 0.6,
        weight: 1,
      };
    }

    if (type === "Vegetation") {
      return {
        color: "#008000",
        fillColor: "#00cc44",
        fillOpacity: 0.6,
        weight: 1,
      };
    }

    if (type === "Road") {
      return {
        color: "#555555",
        weight: 2,
      };
    }

    return { color: "red" };
  };

  // 📥 Download (unchanged)
  const downloadGeoJSON = () => {
    const blob = new Blob([JSON.stringify(geoData)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.geojson";
    a.click();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile?.name || "");
  };

  const clearFile = () => {
    setFile(null);
    setFileName("");
    document.getElementById("file-input").value = "";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">GeoVision Analytics</h1>
                <p className="text-sm text-gray-500">Professional Geospatial Intelligence Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">API Connected</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">v2.0</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Data Processing</h2>
            
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  {fileName ? `Selected: ${fileName}` : "Drop your GeoTIFF file here or click to browse"}
                </p>
                <div className="mt-4 flex items-center justify-center space-x-3">
                  <input
                    id="file-input"
                    type="file"
                    accept=".tif,.tiff"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => document.getElementById("file-input").click()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Browse Files
                  </button>
                  {fileName && (
                    <button
                      onClick={clearFile}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                  !file || loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Analyze GeoTIFF"
                )}
              </button>

              {geoData && (
                <>
                  <button
                    onClick={downloadGeoJSON}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export GeoJSON
                  </button>
                </>
              )}
            </div>

            {/* Status Messages */}
            {loading && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">Processing your image. This may take a few moments...</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {geoData && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Features</p>
                    <p className="text-2xl font-semibold text-gray-900">{geoData.features.length}</p>
                  </div>
                </div>
              </div>
              
              {stats && Object.entries(stats).map(([type, count]) => (
                <div key={type} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        type === 'Water' ? 'bg-blue-100' : 
                        type === 'Vegetation' ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <span className="text-lg">
                          {type === 'Water' ? '💧' : type === 'Vegetation' ? '🌿' : '🛣️'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">{type}</p>
                      <p className="text-2xl font-semibold text-gray-900">{count}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View Toggle */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">View Mode:</span>
                  <div className="bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setView("map")}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        view === "map"
                          ? "bg-white shadow-sm text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Map View
                      </span>
                    </button>
                    <button
                      onClick={() => setView("image")}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        view === "image"
                          ? "bg-white shadow-sm text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Image View
                      </span>
                    </button>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center space-x-6">
                  <span className="text-sm font-medium text-gray-500">Legend:</span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
                      <span className="text-sm text-gray-600">Water</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
                      <span className="text-sm text-gray-600">Vegetation</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-gray-600 rounded-full mr-2"></span>
                      <span className="text-sm text-gray-600">Road</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Display */}
            {view === "map" ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="h-[600px]">
                  <MapContainer
                    center={[20, 80]}
                    zoom={5}
                    style={{ height: "100%", width: "100%" }}
                    preferCanvas={true}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />

                    <GeoJSON
                      data={geoData}
                      style={getStyle}
                      onEachFeature={(feature, layer) => {
                        layer.bindPopup(`
                          <div class="p-2">
                            <h3 class="font-semibold text-gray-900">${feature.properties.feature_type}</h3>
                            <p class="text-sm text-gray-600">Status: ${feature.properties.status}</p>
                            <p class="text-sm text-gray-600">Area: ${feature.properties.area_sq_m.toFixed(2)} m²</p>
                          </div>
                        `);
                      }}
                    />

                    <FitBounds geoData={geoData} />
                  </MapContainer>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="max-w-4xl mx-auto">
                  <img
                    src={imageUrl}
                    alt="Processed"
                    className="w-full rounded-lg shadow-lg"
                  />
                  <p className="text-sm text-gray-500 text-center mt-4">
                    Processed image with detected features highlighted
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;