import { useState } from 'react';
import { useItineraryStore } from '../store/itineraryStore';
import { api } from '../services/api';

interface ItineraryPanelProps {
  onPlaceSelect: (place: any) => void;
}

export default function ItineraryPanel({ onPlaceSelect }: ItineraryPanelProps) {
  const {
    places,
    removePlace,
    itineraries,
    setItineraries,
    clearPlaces,
    setOptimizedRoute,
    selectItinerary,
    selectedItinerary
  } = useItineraryStore();
  // Helper to select an itinerary and update places
  const handleSelectItinerary = (itinerary: any) => {
    selectItinerary(itinerary);
    // Defensive: support both {places: Place[]} and {days: [{places: Place[]}]} structures
    let newPlaces = itinerary.places;
    if (!newPlaces && Array.isArray(itinerary.days) && itinerary.days.length > 0) {
      // Flatten all days' places into one array (for single-day, just use that)
      newPlaces = itinerary.days.flatMap((d: any) => d.places || []);
    }
    if (Array.isArray(newPlaces) && newPlaces.length > 0) {
      (useItineraryStore as any).setState({
        places: newPlaces,
        optimizedRoute: null,
      });
    }
  };
  const [generating, setGenerating] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [mode, setMode] = useState<'normal' | 'relaxed' | 'adventure'>('normal');

  const handleGenerateItineraries = async () => {
    if (places.length < 2) {
      alert('Please add at least 2 places to generate itineraries');
      return;
    }

    setGenerating(true);
    try {
      // Pass mode as preferences to backend
      const data = await api.generateItineraries(places, undefined, undefined, mode);
      setItineraries(data.itineraries || []);
    } catch (error) {
      console.error('Error generating itineraries:', error);
      alert('Failed to generate itineraries');
    } finally {
      setGenerating(false);
    }
  };

  const handleOptimizeRoute = async () => {
    if (places.length < 2) {
      alert('Please add at least 2 places to optimize route');
      return;
    }

    setOptimizing(true);
    try {
      const data = await api.optimizeRoute(places);
      console.log('Optimized route:', data);
      // Update places to reflect optimized order
      if (Array.isArray(data.optimizedPlaces) && data.optimizedPlaces.length > 0) {
        (useItineraryStore as any).setState({ places: data.optimizedPlaces });
      }
      setOptimizedRoute(data); // Store the route with GeoJSON
      alert(
        `Optimized! Total distance: ${(data.totalDistance / 1000).toFixed(2)} km, Duration: ${(
          data.totalDuration / 60
        ).toFixed(0)} min`
      );
    } catch (error) {
      console.error('Error optimizing route:', error);
      alert('Failed to optimize route');
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 rounded-t-2xl bg-gradient-to-r from-blue-100 via-white to-purple-100 border-b border-blue-100/40 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-primary-700 tracking-tight flex items-center gap-2">
            <span className="bg-primary-600/10 text-primary-600 rounded-full px-2 py-1 text-lg">📝</span>
            My Itinerary <span className="text-primary-400">({places.length})</span>
          </h2>
          {places.length > 0 && (
            <button
              onClick={clearPlaces}
              className="text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 rounded px-3 py-1 transition"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Mode Selector & Action Buttons */}
        {places.length >= 2 && (
          <>
            <div className="flex gap-2 mt-2 mb-2 justify-center">
              <button
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${mode === 'normal' ? 'bg-primary-500 text-white border-primary-500 shadow' : 'bg-white text-primary-500 border-primary-200 hover:bg-primary-50'}`}
                onClick={() => setMode('normal')}
              >
                Normal
              </button>
              <button
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${mode === 'relaxed' ? 'bg-purple-500 text-white border-purple-500 shadow' : 'bg-white text-purple-500 border-purple-200 hover:bg-purple-50'}`}
                onClick={() => setMode('relaxed')}
              >
                Relaxed
              </button>
              <button
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${mode === 'adventure' ? 'bg-green-500 text-white border-green-500 shadow' : 'bg-white text-green-500 border-green-200 hover:bg-green-50'}`}
                onClick={() => setMode('adventure')}
              >
                Adventure
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleOptimizeRoute}
                disabled={optimizing}
                className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold rounded-xl shadow hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition"
              >
                {optimizing ? 'Optimizing...' : '🚗 Optimize Route'}
              </button>
              <button
                onClick={handleGenerateItineraries}
                disabled={generating}
                className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-500 to-primary-600 text-white text-sm font-semibold rounded-xl shadow hover:from-primary-700 hover:to-purple-600 disabled:opacity-50 transition"
              >
                {generating ? 'Generating...' : '✨ Generate Plans'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Places List */}
      <div className="flex-1 overflow-y-auto p-5 bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-b-2xl">
        {places.length === 0 ? (
          <div className="text-center text-gray-400 mt-12">
            <p className="text-2xl mb-2">🗺️</p>
            <p className="font-medium">Start by searching and adding places to your itinerary</p>
          </div>
        ) : (
          <div className="space-y-4">
            {places.map((place, index) => (
              <div
                key={place.placeId}
                className="p-4 bg-white/90 border border-blue-100 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer flex items-start gap-4 group"
                onClick={() => onPlaceSelect(place)}
              >
                <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-primary-500 to-blue-400 text-white rounded-full flex items-center justify-center font-extrabold text-lg shadow group-hover:scale-105 transition-transform">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {place.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {place.address}
                  </p>
                  {place.rating && (
                    <div className="text-sm text-yellow-600 mt-1">
                      ⭐ {place.rating}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePlace(place.placeId);
                  }}
                  className="flex-shrink-0 text-red-500 hover:text-red-700 bg-red-50 rounded-full w-7 h-7 flex items-center justify-center font-bold text-lg transition"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generated Itineraries - Table Format */}
      {itineraries.length > 0 && (
        <div className="border-t p-5 bg-gradient-to-r from-purple-50 via-white to-blue-50 rounded-b-2xl overflow-x-auto">
          <h3 className="font-semibold text-primary-700 mb-3">
            Generated Itineraries <span className="text-primary-400">({itineraries.length})</span>
          </h3>
          {itineraries.map((itinerary, idx) => {
            const isSelected = selectedItinerary && selectedItinerary.id === itinerary.id;
            // Flatten all days' places for table display (AI/fallback may use 'days', type may not match store)
            const allPlaces = Array.isArray((itinerary as any).days)
              ? (itinerary as any).days.flatMap((d: any) => d.places || [])
              : itinerary.places || [];
            return (
              <div
                key={itinerary.id || idx}
                className={`mb-6 bg-white/90 border border-purple-100 rounded-xl shadow hover:shadow-lg transition-all ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
              >
                <div className="flex items-center justify-between px-4 pt-4">
                  <div>
                    <h4 className="font-semibold text-primary-600 text-base">
                      {itinerary.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {itinerary.description}
                    </p>
                  </div>
                  <button
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg font-semibold shadow hover:bg-primary-600 transition"
                    onClick={() => handleSelectItinerary(itinerary)}
                  >
                    Select
                  </button>
                </div>
                <div className="overflow-x-auto mt-4">
                  <table className="min-w-full text-sm text-left border-separate border-spacing-y-2">
                    <thead>
                      <tr className="bg-gradient-to-r from-primary-50 to-purple-50">
                        <th className="px-4 py-2 rounded-l-lg">Location</th>
                        <th className="px-4 py-2">Highlights</th>
                        <th className="px-4 py-2">Est. Cost/Head</th>
                        <th className="px-4 py-2">Distance</th>
                        <th className="px-4 py-2">Est. Time</th>
                        <th className="px-4 py-2 rounded-r-lg">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allPlaces.map((place: any, i: number) => (
                        <tr key={place.placeId || i} className="bg-white/80 hover:bg-primary-50 transition">
                          <td className="px-4 py-2 font-semibold text-primary-700">
                            {place.name}
                            <div className="text-xs text-gray-400 font-normal">{place.address}</div>
                          </td>
                          <td className="px-4 py-2 text-gray-700">
                            {place.highlights || (place.nearbyRecommendations && place.nearbyRecommendations.length > 0
                              ? place.nearbyRecommendations.map((r: any) => r.name).join(', ')
                              : '-')}
                          </td>
                          <td className="px-4 py-2 text-green-700">
                            {place.estimatedCost ? `₹${place.estimatedCost}` : '—'}
                          </td>
                          <td className="px-4 py-2 text-blue-700">
                            {place.distance ? place.distance : '—'}
                          </td>
                          <td className="px-4 py-2 text-purple-700">
                            {place.estimatedTime ? place.estimatedTime : place.suggestedDuration || '—'}
                          </td>
                          <td className="px-4 py-2">
                            <button
                              className="px-3 py-1 bg-gradient-to-r from-green-400 to-green-600 text-white rounded font-semibold text-xs shadow hover:from-green-500 hover:to-green-700 transition"
                              onClick={() => onPlaceSelect(place)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
