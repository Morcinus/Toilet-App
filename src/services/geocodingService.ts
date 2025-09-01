/**
 * Reverse geocoding service using Nominatim (OpenStreetMap)
 * Free service for converting coordinates to addresses
 */

interface NominatimResponse {
  display_name: string;
  address?: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  place_id: number;
  lat: string;
  lon: string;
}

interface GeocodingResult {
  address: string;
  success: boolean;
  error?: string;
}

class GeocodingService {
  private readonly baseUrl = "https://nominatim.openstreetmap.org/reverse";
  private readonly userAgent = "ToiletApp/1.0"; // Required by Nominatim
  private cache = new Map<string, GeocodingResult>();
  private readonly cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  /**
   * Reverse geocode coordinates to get an address
   * @param lat Latitude
   * @param lng Longitude
   * @returns Promise with geocoding result
   */
  async reverseGeocode(lat: number, lng: number): Promise<GeocodingResult> {
    // Round coordinates to 6 decimal places for caching (about 0.1m precision)
    const cacheKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      return cached;
    }

    try {
      // Rate limiting: Nominatim allows 1 request per second
      await this.rateLimit();

      const params = new URLSearchParams({
        format: "json",
        lat: lat.toString(),
        lon: lng.toString(),
        addressdetails: "1",
        zoom: "18", // Building level detail
        email: "your-email@example.com", // Required by Nominatim
      });

      const response = await fetch(`${this.baseUrl}?${params}`, {
        headers: {
          "User-Agent": this.userAgent,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: NominatimResponse = await response.json();

      if (!data || !data.display_name) {
        throw new Error("No address found for these coordinates");
      }

      const result: GeocodingResult = {
        address: this.formatAddress(data),
        success: true,
      };

      // Cache the result
      this.cache.set(cacheKey, {
        ...result,
        cachedAt: Date.now(),
      } as any);

      return result;
    } catch (error) {
      const result: GeocodingResult = {
        address: "",
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };

      // Cache failed results for shorter time to avoid repeated failures
      this.cache.set(cacheKey, {
        ...result,
        cachedAt: Date.now(),
      } as any);

      return result;
    }
  }

  /**
   * Format the address from Nominatim response
   * @param data Nominatim response data
   * @returns Formatted address string in "ROAD HOUSE_NUMBER, POST_CODE CITY" format
   */
  private formatAddress(data: NominatimResponse): string {
    const addr = data.address;
    if (!addr) {
      return data.display_name;
    }

    // Build address in "ROAD HOUSE_NUMBER, POST_CODE CITY" format
    const addressParts: string[] = [];

    // Road and house number
    if (addr.house_number && addr.road) {
      addressParts.push(`${addr.road} ${addr.house_number}`);
    } else if (addr.road) {
      addressParts.push(addr.road);
    }

    // Postcode and city
    const locationParts: string[] = [];
    if (addr.postcode) {
      locationParts.push(addr.postcode);
    }
    if (addr.city) {
      locationParts.push(addr.city);
    }

    // If we have location parts, add them after a comma
    if (locationParts.length > 0) {
      addressParts.push(locationParts.join(" "));
    }

    // If we have formatted parts, return them; otherwise use display_name
    return addressParts.length > 0
      ? addressParts.join(", ")
      : data.display_name;
  }

  /**
   * Simple rate limiting to respect Nominatim's 1 request/second limit
   */
  private lastRequestTime = 0;
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 1100; // 1.1 seconds to be safe

    if (timeSinceLastRequest < minInterval) {
      const waitTime = minInterval - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Check if cached result is still valid
   */
  private isCacheValid(cached: any): boolean {
    if (!cached.cachedAt) return false;
    return Date.now() - cached.cachedAt < this.cacheExpiry;
  }

  /**
   * Clear the cache (useful for testing or if you want fresh data)
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export a singleton instance
export const geocodingService = new GeocodingService();
