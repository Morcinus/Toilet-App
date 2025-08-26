export interface Toilet {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
  isFree: boolean;
  rating: number;
  totalRatings: number;
  likes: number;
  dislikes: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ToiletFormData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  isFree: boolean;
  imageData?: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
