import React, { useState, useEffect } from "react";
import { MapPin, X, Upload, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "./ui/textarea";
import { ToiletFormData } from "@/types/toilet";
import { geocodingService } from "@/services/geocodingService";

interface AddToiletFormProps {
  coordinates: { lat: number; lng: number };
  onCancel: () => void;
  onSubmit: (data: ToiletFormData) => void;
}

export const AddToiletForm: React.FC<AddToiletFormProps> = ({
  coordinates,
  onCancel,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<ToiletFormData>({
    name: "",
    address: "",
    latitude: coordinates.lat,
    longitude: coordinates.lng,
    description: "",
    isFree: true,
  });
  // const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Auto-fetch address when component mounts
  useEffect(() => {
    const fetchAddress = async () => {
      setIsLoadingAddress(true);
      setAddressError(null);

      try {
        const result = await geocodingService.reverseGeocode(
          coordinates.lat,
          coordinates.lng
        );

        if (result.success) {
          setFormData((prev) => ({ ...prev, address: result.address }));
        } else {
          setAddressError(result.error || "Failed to fetch address");
        }
      } catch (error) {
        setAddressError("Network error while fetching address");
        console.error("Geocoding error:", error);
      } finally {
        setIsLoadingAddress(false);
      }
    };

    fetchAddress();
  }, [coordinates.lat, coordinates.lng]);

  const handleInputChange = (
    field: keyof ToiletFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.address.trim()) {
      // Include image data if available
      const formDataWithImage = {
        ...formData,
        imageData: imagePreview || undefined,
      };
      onSubmit(formDataWithImage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Add New Toilet</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Toilet Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Public Toilet - Old Town Square"
              required
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <div className="relative">
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder={
                  isLoadingAddress
                    ? "Loading address..."
                    : "e.g., Staroměstské náměstí, 110 00 Praha 1"
                }
                required
                disabled={isLoadingAddress}
                className={addressError ? "border-red-300" : ""}
              />
              {isLoadingAddress && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            {addressError && (
              <p className="text-sm text-red-600">
                {addressError}. Please enter the address manually.
              </p>
            )}
            {!isLoadingAddress && !addressError && formData.address && (
              <p className="text-sm text-green-600">
                ✓ Address automatically detected from coordinates
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe the toilet location, features, etc."
              rows={3}
            />
          </div>

          {/* Coordinates Display */}
          <div className="space-y-2">
            <Label>Location Coordinates</Label>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <div>Latitude: {coordinates.lat.toFixed(6)}</div>
              <div>Longitude: {coordinates.lng.toFixed(6)}</div>
            </div>
          </div>

          {/* Free/Paid Toggle */}
          <div className="space-y-2">
            <Label>Cost</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.isFree ? "default" : "outline"}
                size="sm"
                onClick={() => handleInputChange("isFree", true)}
                className="flex-1"
              >
                Free
              </Button>
              <Button
                type="button"
                variant={!formData.isFree ? "default" : "outline"}
                size="sm"
                onClick={() => handleInputChange("isFree", false)}
                className="flex-1"
              >
                Paid
              </Button>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Image (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label htmlFor="image" className="cursor-pointer">
                {imagePreview ? (
                  <div className="space-y-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded mx-auto"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">
                      Click to upload an image
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!formData.name.trim() || !formData.address.trim()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Toilet
          </Button>
        </form>
      </div>
    </div>
  );
};
