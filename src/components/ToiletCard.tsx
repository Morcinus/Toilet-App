import React, { useState } from "react";
import { Toilet } from "@/types/toilet";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Star,
  Euro,
  MapPin,
  X,
  ThumbsUp,
  ThumbsDown,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ToiletCardProps {
  toilet: Toilet;
  onClose: () => void;
  onLike?: (toiletId: string) => void;
  onDislike?: (toiletId: string) => void;
}

export const ToiletCard: React.FC<ToiletCardProps> = ({
  toilet,
  onClose,
  onLike,
  onDislike,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  const handleLike = () => {
    onLike?.(toilet.id);
  };

  const handleDislike = () => {
    onDislike?.(toilet.id);
  };

  const openImagePreview = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeImagePreview = () => {
    setSelectedImageIndex(null);
  };

  const goToPreviousImage = () => {
    if (selectedImageIndex !== null && toilet.images) {
      setSelectedImageIndex(
        selectedImageIndex === 0
          ? toilet.images.length - 1
          : selectedImageIndex - 1
      );
    }
  };

  const goToNextImage = () => {
    if (selectedImageIndex !== null && toilet.images) {
      setSelectedImageIndex(
        selectedImageIndex === toilet.images.length - 1
          ? 0
          : selectedImageIndex + 1
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      closeImagePreview();
    } else if (e.key === "ArrowLeft") {
      goToPreviousImage();
    } else if (e.key === "ArrowRight") {
      goToNextImage();
    }
  };

  return (
    <>
      <Card className="w-80 shadow-xl border-0">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg leading-tight">
              {toilet.name}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 -mt-1 -mr-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{toilet.address}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Images */}
          {toilet.images && toilet.images.length > 0 ? (
            <div className="space-y-2">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {toilet.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${toilet.name} - Image ${index + 1}`}
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => openImagePreview(index)}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center text-gray-500">
                <ImageIcon className="w-8 h-8 mx-auto mb-1 text-gray-400" />
                <p className="text-xs">No images available</p>
              </div>
            </div>
          )}

          {toilet.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {toilet.description}
            </p>
          )}

          {/* Rating and Features */}
          <div className="flex items-center justify-between">
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">
                  {toilet.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({toilet.totalRatings} ratings)
              </span>
            </div>

            {/* Features */}
            {toilet.isFree ? (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                <Euro className="h-3 w-3" />
                <span>Free</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                <Euro className="h-3 w-3" />
                <span>Paid</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex gap-2 pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLike}
            className="flex-1 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            Like ({toilet.likes})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDislike}
            className="flex-1 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
            Dislike ({toilet.dislikes})
          </Button>
        </CardFooter>
      </Card>

      {/* Image Preview Modal */}
      {selectedImageIndex !== null && toilet.images && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={closeImagePreview}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative max-w-4xl max-h-full">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={closeImagePreview}
              className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70 z-10"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation arrows */}
            {toilet.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPreviousImage();
                  }}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 z-10"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNextImage();
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 z-10"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Image */}
            <img
              src={toilet.images[selectedImageIndex]}
              alt={`${toilet.name} - Image ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Image counter */}
            {toilet.images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {selectedImageIndex + 1} / {toilet.images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
