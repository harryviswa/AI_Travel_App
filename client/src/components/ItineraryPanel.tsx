import { useState } from 'react';
import { useItineraryStore } from '../store/itineraryStore';
import { api } from '../services/api';

interface ItineraryPanelProps {
  onPlaceSelect: (place: any) => void;
  showOnlyItinerary?: boolean;
  showOnlyAISuggestions?: boolean;
}

export default function ItineraryPanel({ onPlaceSelect, showOnlyItinerary, showOnlyAISuggestions }: ItineraryPanelProps) {
  const {
    places,
    removePlace,
    itineraries,
    setItineraries,
    clearPlaces,
    setOptimizedRoute
  } = useItineraryStore();
  // Helper to select an itinerary and update places
    // Removed handleSelectItinerary (no longer needed)
  const [generating, setGenerating] = useState(false);
  const [optimizing, setOptimizing] = useState(false);


  const handleGenerateItineraries = async () => {
    if (places.length < 2) {
      alert('Please add at least 2 places to generate suggestions');
      return;
    }

    setGenerating(true);
    try {
      // No mode, just send places
      const data = await api.generateItineraries(places);
      // Accept either { itineraries: [...] } or just an array
      if (Array.isArray(data)) {
        setItineraries(data);
      } else if (Array.isArray(data.itineraries)) {
        setItineraries(data.itineraries);
      } else {
        setItineraries([]);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      alert('Failed to generate suggestions');
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
      {/* User Itinerary List */}
      {!showOnlyAISuggestions && (
        <>
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

            {/* Action Buttons */}
            {places.length >= 2 && !showOnlyItinerary && (
              <div className="flex gap-2 mt-2 mb-2 justify-center">
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
                  {generating ? 'Generating...' : '✨ AI Must-Visit Suggestions'}
                </button>
              </div>
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
        </>
      )}

      {/* AI Must-Visit Suggestions - Single Table Format */}
      {!showOnlyItinerary && itineraries.length > 0 && (
        <div className="border-t p-5 bg-gradient-to-r from-purple-50 via-white to-blue-50 rounded-b-2xl overflow-x-auto">
          <h3 className="font-semibold text-primary-700 mb-3">
            AI Must-Visit Suggestions
          </h3>
          <table className="min-w-full text-sm text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-gradient-to-r from-primary-50 to-purple-50">
                <th className="px-4 py-2 rounded-l-lg">Place</th>
                <th className="px-4 py-2">Highlight</th>
                <th className="px-4 py-2">Suggested Duration</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Budget/Day/Person</th>
                <th className="px-4 py-2 rounded-r-lg">Activities</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {itineraries.map((place: any, i: number) => {
                // Activities: prefer place.activities (array), fallback to highlights/highlight/type
                let activities = '-';
                if (Array.isArray(place.activities) && place.activities.length > 0) {
                  activities = place.activities.join(', ');
                } else if (Array.isArray(place.highlights) && place.highlights.length > 0) {
                  activities = place.highlights.join(', ');
                } else if (typeof place.highlight === 'string' && place.highlight) {
                  activities = place.highlight;
                } else if (typeof place.type === 'string' && place.type) {
                  activities = place.type;
                }
                return (
                  <tr key={place.placeId || place.name || i} className="bg-white/80 hover:bg-primary-50 transition">
                    <td className="px-4 py-2 font-semibold text-primary-700">{place.name}</td>
                    <td className="px-4 py-2 text-blue-700">{place.highlight || (Array.isArray(place.highlights) ? place.highlights.join(', ') : '-')}</td>
                    <td className="px-4 py-2 text-purple-700">{place.suggestedDuration || '-'}</td>
                    <td className="px-4 py-2">
                      {place.isUserPlace ? (
                        <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">Your Place</span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold">In-Between</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-green-700 font-semibold">{place.estimatedCost ? `₹${place.estimatedCost}` : '—'}</td>
                    <td className="px-4 py-2 text-gray-700">{activities}</td>
                    <td className="px-4 py-2">
                      <button
                        className="px-3 py-1 bg-gradient-to-r from-green-400 to-green-600 text-white rounded font-semibold text-xs shadow hover:from-green-500 hover:to-green-700 transition"
                        onClick={() => onPlaceSelect(place)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
