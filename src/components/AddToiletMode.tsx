import React, { useState, useEffect } from "react";
import { MapPin, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { LatLng, divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";

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

  // Set initial placement pin at map center
  useEffect(() => {
    setPlacementPin(mapCenter);
  }, [mapCenter]);

  const handleMapClick = (latlng: LatLng) => {
    setPlacementPin({ lat: latlng.lat, lng: latlng.lng });
  };

  const handlePlaceToilet = () => {
    if (placementPin) {
      onToiletPlaced(placementPin);
    }
  };

  // const handleMapClick = (event: any) => {
  //   // This would be connected to the actual map click event
  //   // For now, we'll simulate it
  //   const newPin = { lat: event.latlng.lat, lng: event.latlng.lng };
  //   setPlacementPin(newPin);
  // };

  return (
    <div className="absolute inset-0 bg-white z-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-semibold">Add New Toilet</h2>
              <p className="text-blue-100 text-sm">
                Click on the map to place the toilet, then click "Place Toilet"
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-white hover:bg-blue-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={13}
          className="w-full h-full"
          style={{ height: "100%" }}
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

        {/* Overlay with instructions and button */}
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Click anywhere on the map to place toilet pin
            </p>
            {placementPin && (
              <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4">
                <p className="text-green-800 font-medium">
                  Toilet will be placed at:
                </p>
                <p className="text-green-700 text-sm">
                  Lat: {placementPin.lat.toFixed(6)}, Lng:{" "}
                  {placementPin.lng.toFixed(6)}
                </p>
              </div>
            )}
            <Button
              onClick={handlePlaceToilet}
              disabled={!placementPin}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Place Toilet
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
