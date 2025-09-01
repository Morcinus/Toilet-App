import React, { useState, useEffect } from "react";
import {
  MapPin,
  X,
  Upload,
  Save,
  Trash2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "./ui/textarea";
import { Toilet, ToiletFormData } from "@/types/toilet";
import { geocodingService } from "@/services/geocodingService";

interface EditToiletFormProps {
  toilet: Toilet;
  onCancel: () => void;
  onSubmit: (data: ToiletFormData) => void;
  onDelete?: (toiletId: string) => void;
}

export const EditToiletForm: React.FC<EditToiletFormProps> = ({
  toilet,
  onCancel,
  onSubmit,
  onDelete,
}) => {
  const [formData, setFormData] = useState<ToiletFormData>({
    name: toilet.name,
    address: toilet.address,
    latitude: toilet.latitude,
    longitude: toilet.longitude,
    description: toilet.description || "",
    isFree: toilet.isFree,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>(
    toilet.images || []
  );
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when toilet prop changes
  useEffect(() => {
    setFormData({
      name: toilet.name,
      address: toilet.address,
      latitude: toilet.latitude,
      longitude: toilet.longitude,
      description: toilet.description || "",
      isFree: toilet.isFree,
    });
    setExistingImages(toilet.images || []);
  }, [toilet]);

  const handleInputChange = (
    field: keyof ToiletFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const refreshAddress = async () => {
    setIsLoadingAddress(true);
    setAddressError(null);

    try {
      const result = await geocodingService.reverseGeocode(
        formData.latitude,
        formData.longitude
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

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.address.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        // Include image data if available
        const formDataWithImage = {
          ...formData,
          imageData: imagePreview || undefined,
        };
        await onSubmit(formDataWithImage);
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDelete = () => {
    if (!onDelete) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete "${toilet.name}"? This action cannot be undone.`
    );
    if (confirmed) {
      onDelete(toilet.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Edit Toilet</h2>
          </div>
          <div className="flex items-center gap-2">
            {onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="h-8 px-2"
                title="Delete toilet"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
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
            <div className="flex items-center justify-between">
              <Label htmlFor="address">Address *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={refreshAddress}
                disabled={isLoadingAddress}
                className="h-7 px-2 text-xs"
              >
                {isLoadingAddress ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                Refresh
              </Button>
            </div>
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

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="space-y-2">
              <Label>Existing Images</Label>
              <div className="grid grid-cols-3 gap-2">
                {existingImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Existing image ${index + 1}`}
                      className="w-full h-24 object-cover rounded border border-gray-200"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Add New Image (Optional)</Label>
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
                      onClick={() => setImagePreview(null)}
                    >
                      Remove New Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">
                      Click to upload a new image
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
            disabled={
              !formData.name.trim() || !formData.address.trim() || isSubmitting
            }
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? "Saving Changes..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  );
};
