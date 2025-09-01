import React from "react";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onAddToilet?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAddToilet }) => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center hover-wiggle">
              <span className="text-white text-lg">🧻</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Míšy Mapa Záchodů
              </h1>
              <p className="text-sm text-gray-500">
                Protože příroda volá a my odpovídáme! 🚽
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              onClick={onAddToilet}
              size="sm"
              className="bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white hover-bounce"
            >
              <Plus className="w-4 h-4 mr-2" />
              Umístit Záchod
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
