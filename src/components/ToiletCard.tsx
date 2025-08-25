import React from "react";
import { Toilet } from "@/types/toilet";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Euro, MapPin, X, ThumbsUp, ThumbsDown } from "lucide-react";

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
  const handleLike = () => {
    onLike?.(toilet.id);
  };

  const handleDislike = () => {
    onDislike?.(toilet.id);
  };

  return (
    <Card className="w-80 shadow-xl border-0">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-tight">{toilet.name}</CardTitle>
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
        {toilet.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {toilet.description}
          </p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{toilet.rating.toFixed(1)}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            ({toilet.totalRatings} ratings)
          </span>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2">
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

        {/* Coordinates */}
        <div className="text-xs text-muted-foreground">
          <span>Lat: {toilet.latitude.toFixed(6)}</span>
          <br />
          <span>Lng: {toilet.longitude.toFixed(6)}</span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-0">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLike}
          className="flex-1"
        >
          <ThumbsUp className="h-4 w-4 mr-1" />
          Like
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDislike}
          className="flex-1"
        >
          <ThumbsDown className="h-4 w-4 mr-1" />
          Dislike
        </Button>
      </CardFooter>
    </Card>
  );
};
