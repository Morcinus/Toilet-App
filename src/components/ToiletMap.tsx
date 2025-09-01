import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";
import { Toilet } from "@/types/toilet";
import { ToiletCard } from "./ToiletCard";
import { Star, Euro } from "lucide-react";

interface ToiletMapProps {
  toilets: Toilet[];
  userVotes: Record<string, "like" | "dislike">;
  onToiletSelect?: (toilet: Toilet) => void;
  onLike?: (toiletId: string) => void;
  onDislike?: (toiletId: string) => void;
  onEdit?: (toilet: Toilet) => void;
}

// Custom marker icon with toilet emoji using divIcon
const createCustomIcon = (color: string) => {
  return divIcon({
    className: "custom-div-icon",
    html: `<div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">🚽</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const getToiletIcon = () => {
  // Use dark pink for all pins for better emoji visibility
  return createCustomIcon("#c2185b"); // Dark pink for all toilets
};

export const ToiletMap: React.FC<ToiletMapProps> = ({
  toilets,
  userVotes,
  onToiletSelect,
  onLike,
  onDislike,
  onEdit,
}) => {
  const [selectedToilet, setSelectedToilet] = useState<Toilet | null>(null);
  const [showToiletCard, setShowToiletCard] = useState(false);

  // Update selectedToilet when toilets state changes to keep it in sync
  useEffect(() => {
    if (selectedToilet && showToiletCard) {
      const updatedToilet = toilets.find((t) => t.id === selectedToilet.id);
      if (updatedToilet) {
        setSelectedToilet(updatedToilet);
      }
    }
  }, [toilets, selectedToilet?.id, showToiletCard]);

  // Prague center coordinates
  const pragueCenter = { lat: 50.0755, lng: 14.4378 };

  const handleMarkerClick = (toilet: Toilet) => {
    setSelectedToilet(toilet);
    setShowToiletCard(true);
    onToiletSelect?.(toilet);
  };

  const handleCloseCard = () => {
    setShowToiletCard(false);
    setSelectedToilet(null);
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer center={pragueCenter} zoom={13} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {toilets.map((toilet) => (
          <Marker
            key={toilet.id}
            position={[toilet.latitude, toilet.longitude]}
            icon={getToiletIcon()}
            eventHandlers={{
              click: () => handleMarkerClick(toilet),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-sm mb-2">{toilet.name}</h3>
                <p className="text-xs text-gray-600 mb-2">{toilet.address}</p>
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{toilet.rating.toFixed(1)}</span>
                  </div>
                  {toilet.isFree ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <Euro className="w-3 h-3" />
                      <span>Free</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-orange-600">
                      <Euro className="w-3 h-3" />
                      <span>Paid</span>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-pink-200 card-soft">
        <h4 className="font-semibold text-sm mb-2">Legenda</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-pink-600 flex items-center justify-center text-white text-xs">
              🚽
            </div>
            <span>Záchody</span>
          </div>
          <div className="text-xs text-gray-600 mt-2">
            <div className="flex items-center gap-1">
              <Euro className="w-3 h-3" />
              <span>Zdarma</span>
            </div>
            <div className="flex items-center gap-1">
              <Euro className="w-3 h-3" />
              <span>Placené</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toilet Card Overlay */}
      {showToiletCard && selectedToilet && (
        <div className="absolute top-4 left-4 md:left-4 left-1/2 transform -translate-x-1/2 md:transform-none z-10 max-w-sm">
          <ToiletCard
            toilet={selectedToilet}
            userVote={userVotes[selectedToilet.id]}
            onClose={handleCloseCard}
            onLike={onLike}
            onDislike={onDislike}
            onEdit={onEdit}
          />
        </div>
      )}
    </div>
  );
};
