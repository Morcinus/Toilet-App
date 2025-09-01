import React, { useState, useEffect } from "react";
import { MapPin, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { LatLng, divIcon } from "leaflet";
// Import Leaflet CSS
import "leaflet/dist/leaflet.css";

// Fix for default markers
import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Add some basic Leaflet CSS fixes
const leafletStyles = `
  .leaflet-container {
    height: 100% !important;
    width: 100% !important;
  }
  .leaflet-div-icon {
    background: transparent;
    border: none;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = leafletStyles;
  document.head.appendChild(style);
}

interface AddToiletModeProps {
  onCancel: () => void;
  onToiletPlaced: (coordinates: { lat: number; lng: number }) => void;
}

// Map click handler component
const MapClickHandler: React.FC<{
  onMapClick: (latlng: LatLng) => void;
}> = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
};

export const AddToiletMode: React.FC<AddToiletModeProps> = ({
  onCancel,
  onToiletPlaced,
}) => {
  const [mapCenter] = useState({ lat: 50.0755, lng: 14.4378 });
  const [placementPin, setPlacementPin] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Set initial placement pin at map center
  useEffect(() => {
    setPlacementPin(mapCenter);
    console.log("AddToiletMode mounted, center:", mapCenter);

    // Force a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      console.log("Map should be visible now");
    }, 100);

    return () => clearTimeout(timer);
  }, [mapCenter]);

  const handleMapClick = (latlng: LatLng) => {
    console.log("Map clicked at:", latlng);
    setPlacementPin({ lat: latlng.lat, lng: latlng.lng });
  };

  const handleMapLoad = () => {
    console.log("Map loaded successfully");
    setMapLoaded(true);
  };

  const handlePlaceToilet = () => {
    console.log("Place Toilet button clicked!");
    if (placementPin) {
      console.log("Proceeding with placement at:", placementPin);
      onToiletPlaced(placementPin);
    } else {
      console.log("No placement pin set");
    }
  };

  // const handleMapClick = (event: any) => {
  //   // This would be connected to the actual map click event
  //   // For now, we'll simulate it
  //   const newPin = { lat: event.latlng.lat, lng: event.latlng.lng };
  //   setPlacementPin(newPin);
  // };

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-400 to-purple-500 text-white p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-white text-lg">🗺️</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Přidat Nový Záchod</h2>
              <p className="text-pink-100 text-sm">
                Klikni na mapu, kde chceš umístit svůj trůn! 👑
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-white hover:bg-white/20 rounded-xl"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Map Area */}
      <div
        className="flex-1 relative"
        style={{ height: "calc(100vh - 120px)", position: "relative" }}
      >
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={13}
          style={{
            width: "100%",
            height: "100%",
          }}
          key="add-toilet-map" // Force re-render
          whenReady={handleMapLoad}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Placement pin marker */}
          {placementPin && (
            <Marker
              position={[placementPin.lat, placementPin.lng]}
              icon={divIcon({
                className: "custom-div-icon",
                html: `<div style="background-color: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              })}
            />
          )}

          <MapClickHandler onMapClick={handleMapClick} />
        </MapContainer>

        {/* Fallback if map doesn't load */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center pointer-events-none z-10">
            <div className="text-center text-gray-500">
              <p>Načítání mapy...</p>
              <p className="text-xs mt-2">
                Pokud se mapa nezobrazí, zkontrolujte konzoli pro chyby
              </p>
            </div>
          </div>
        )}

        {/* Overlay with instructions and button */}
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-lg p-4 z-20 border-2 border-pink-200 card-soft">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Klikni kamkoliv na mapu pro umístění špendlíku 🗺️
            </p>

            <Button
              onClick={handlePlaceToilet}
              disabled={!placementPin}
              className="bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white font-medium px-6 py-2 rounded-xl hover-bounce"
              style={{
                minHeight: "44px",
                fontSize: "16px",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
            >
              <Check className="w-5 h-5 mr-2" />
              Umístit Trůn
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
