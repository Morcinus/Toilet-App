import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { Toilet } from "@/types/toilet";
import { ToiletCard } from "./ToiletCard";
import { Star, Euro } from "lucide-react";

interface ToiletMapProps {
  toilets: Toilet[];
  userVotes: Record<string, "like" | "dislike">;
  onToiletSelect?: (toilet: Toilet) => void;
  onLike?: (toiletId: string) => void;
  onDislike?: (toiletId: string) => void;
}

// Custom marker icon
const createCustomIcon = (color: string) =>
  new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
      <path d="M8 8h8v8H8z" fill="white"/>
      <path d="M10 10h4v4h-4z" fill="${color}"/>
    </svg>
  `)}`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });

const getToiletIcon = (toilet: Toilet) => {
  if (toilet.isFree) {
    return createCustomIcon("#10b981"); // Green for free
  } else {
    return createCustomIcon("#f59e0b"); // Orange for paid
  }
};

export const ToiletMap: React.FC<ToiletMapProps> = ({
  toilets,
  userVotes,
  onToiletSelect,
  onLike,
  onDislike,
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
            icon={getToiletIcon(toilet)}
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
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
        <h4 className="font-semibold text-sm mb-2">Legend</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Free</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Paid</span>
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
          />
        </div>
      )}
    </div>
  );
};
