import axios from 'axios';

const API_BASE_URL = '/api';

export const api = {
  // Search places
  searchPlaces: async (query: string, location?: string) => {
    const response = await axios.get(`${API_BASE_URL}/places/search`, {
      params: { query, location },
    });
    return response.data;
  },

  // Get place details
  getPlaceDetails: async (placeId: string) => {
    const response = await axios.get(`${API_BASE_URL}/places/details/${placeId}`);
    return response.data;
  },

  // Get nearby places
  getNearbyPlaces: async (location: string, radius?: number, type?: string) => {
    const response = await axios.get(`${API_BASE_URL}/places/nearby`, {
      params: { location, radius, type },
    });
    return response.data;
  },

  // Optimize route
  optimizeRoute: async (places: any[]) => {
    const response = await axios.post(`${API_BASE_URL}/itinerary/optimize-route`, {
      places,
    });
    return response.data;
  },

  // Generate itineraries
  generateItineraries: async (
    places: any[],
    startDate?: string,
    endDate?: string,
    preferences?: string
  ) => {
    const response = await axios.post(`${API_BASE_URL}/itinerary/generate`, {
      places,
      startDate,
      endDate,
      preferences,
    });
    return response.data;
  },

  // Get recommendations
  getRecommendations: async (place: any) => {
    const response = await axios.post(`${API_BASE_URL}/itinerary/recommendations`, {
      place,
    });
    return response.data;
  },
};
