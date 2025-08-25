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
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
