import { create } from 'zustand';

export interface Place {
  placeId: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  photos?: string[];
  types?: string[];
}

export interface Itinerary {
  id: string;
  title: string;
  description: string;
  places: Place[];
  totalDistance?: number;
  totalDuration?: number;
}

interface ItineraryStore {
  places: Place[];
  itineraries: Itinerary[];
  selectedItinerary: Itinerary | null;
  optimizedRoute: any | null;
  addPlace: (place: Place) => void;
  removePlace: (placeId: string) => void;
  setItineraries: (itineraries: Itinerary[]) => void;
  selectItinerary: (itinerary: Itinerary | null) => void;
  setOptimizedRoute: (route: any) => void;
  clearPlaces: () => void;
}

export const useItineraryStore = create<ItineraryStore>((set) => ({
  places: [],
  itineraries: [],
  selectedItinerary: null,
  optimizedRoute: null,
  
  addPlace: (place) =>
    set((state) => ({
      places: [...state.places, place],
    })),
  
  removePlace: (placeId) =>
    set((state) => ({
      places: state.places.filter((p) => p.placeId !== placeId),
    })),
  
  setItineraries: (itineraries) =>
    set({ itineraries }),
  
  selectItinerary: (itinerary) =>
    set({ selectedItinerary: itinerary }),
  
  setOptimizedRoute: (route) =>
    set({ optimizedRoute: route }),
  
  clearPlaces: () =>
    set({ places: [], itineraries: [], selectedItinerary: null, optimizedRoute: null }),
}));
