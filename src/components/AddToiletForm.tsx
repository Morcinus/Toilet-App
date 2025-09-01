import React, { useState, useEffect } from "react";
import { MapPin, X, Upload, Plus } from "lucide-react";
import { ToiletPaperSpinner } from "@/components/ui/toilet-paper-spinner";
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fetch address when component mounts
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const result = await geocodingService.reverseGeocode(
          coordinates.lat,
          coordinates.lng
        );

        if (result.success) {
          setFormData((prev) => ({ ...prev, address: result.address }));
        }
      } catch (error) {
        console.error("Geocoding error:", error);
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

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 500px width/height)
        const maxSize = 500;
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8);
        resolve(compressedDataUrl);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size first
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 10) {
        alert(
          `Obrázek je příliš velký (${fileSizeMB.toFixed(
            2
          )}MB). Prosím použij obrázek menší než 10MB.`
        );
        return;
      }

      try {
        const compressedImage = await compressImage(file);
        setImagePreview(compressedImage);
      } catch (error) {
        console.error("Error compressing image:", error);
        // Fallback to original file
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && !isSubmitting) {
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-pink-600" />
            <h2 className="text-lg font-semibold">Přidat Novou Toaletu</h2>
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
            <Label htmlFor="name">Název Toalety *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Jak bys chtěla pojmenovat tento trůn? 👑"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Popis</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Popiš, co je na tomto místě speciální... 🚽✨"
              rows={3}
            />
          </div>

          {/* Free/Paid Toggle */}
          <div className="space-y-2">
            <Label>Cena</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.isFree ? "default" : "outline"}
                size="sm"
                onClick={() => handleInputChange("isFree", true)}
                className="flex-1"
              >
                Zdarma
              </Button>
              <Button
                type="button"
                variant={!formData.isFree ? "default" : "outline"}
                size="sm"
                onClick={() => handleInputChange("isFree", false)}
                className="flex-1"
              >
                Placené
              </Button>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Obrázek (Volitelné)</Label>
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
                      Odebrat Obrázek
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">
                      Klikni pro nahrání fotky tohoto krásného místa 📸
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white rounded-xl hover-bounce"
            disabled={!formData.name.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ToiletPaperSpinner size="sm" className="mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? "Ukládám tvůj trůn..." : "Přidat Toaletu"}
          </Button>
        </form>
      </div>
    </div>
  );
};
