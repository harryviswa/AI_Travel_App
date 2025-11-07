import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useItineraryStore } from '../store/itineraryStore';

interface RecommendationsPanelProps {
  place: any;
}

export default function RecommendationsPanel({ place }: RecommendationsPanelProps) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { addPlace, places } = useItineraryStore();

  useEffect(() => {
    if (place) {
      fetchRecommendations();
    }
  }, [place]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const data = await api.getRecommendations(place);
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecommendation = (recommendation: any) => {
    if (!places.find((p) => p.placeId === recommendation.placeId)) {
      addPlace(recommendation);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-primary-50">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Nearby Recommendations
        </h2>
        <p className="text-sm text-gray-600">Near {place.name}</p>
      </div>

      {/* Recommendations List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center text-gray-500 mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
            <p>Finding nearby attractions...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No recommendations found nearby</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div
                key={rec.placeId}
                className="p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {rec.name}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      rec.category === 'attraction'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {rec.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{rec.address}</p>
                {rec.rating && (
                  <div className="text-sm text-yellow-600 mb-2">
                    ⭐ {rec.rating}
                  </div>
                )}
                <button
                  onClick={() => handleAddRecommendation(rec)}
                  disabled={places.some((p) => p.placeId === rec.placeId)}
                  className="w-full px-3 py-1.5 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {places.some((p) => p.placeId === rec.placeId)
                    ? 'Added ✓'
                    : 'Add to Itinerary'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
