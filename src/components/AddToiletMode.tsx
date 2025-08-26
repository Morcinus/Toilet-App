import React, { useState, useEffect } from "react";
import { MapPin, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { Toilet } from "@/types/toilet";

interface AddToiletModeProps {
  onCancel: () => void;
  onToiletPlaced: (coordinates: { lat: number; lng: number }) => void;
}

export const AddToiletMode: React.FC<AddToiletModeProps> = ({
  onCancel,
  onToiletPlaced,
}) => {
  const [mapCenter] = useState({ lat: 50.0755, lng: 14.4378 });
  const [placementPin, setPlacementPin] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Listen for map center changes (this would need to be connected to the actual map)
  useEffect(() => {
    // For now, we'll use a default center
    // In a real implementation, this would listen to map events
    setPlacementPin(mapCenter);
  }, [mapCenter]);

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
        {/* This would be the actual map component */}
        <div
          className="w-full h-full bg-gray-100 flex items-center justify-center cursor-crosshair"
          onClick={(e) => {
            // Simple demo: place pin at click location
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Convert to approximate coordinates (demo purposes)
            const lat = 50.0755 + (y - rect.height / 2) * 0.0001;
            const lng = 14.4378 + (x - rect.width / 2) * 0.0001;

            setPlacementPin({ lat, lng });
          }}
        >
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Click anywhere on this area to place toilet pin
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
