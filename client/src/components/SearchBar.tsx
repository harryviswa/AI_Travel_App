import { useState } from 'react';
import { api } from '../services/api';
import { useItineraryStore } from '../store/itineraryStore';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { addPlace, places } = useItineraryStore();

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await api.searchPlaces(query);
      setResults(data.results || []);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlace = (place: any) => {
    // Check if place already exists
    if (!places.find((p) => p.placeId === place.placeId)) {
      addPlace(place);
    }
    setShowResults(false);
    setQuery('');
    setResults([]);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for a place..."
          className="flex-1 px-5 py-3 border-2 border-primary-200 bg-white/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 text-base shadow-sm placeholder:text-primary-300 transition"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-semibold shadow hover:from-primary-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 border border-primary-100 rounded-xl shadow-2xl z-[100] max-h-96 overflow-y-auto backdrop-blur-md">
          {results.map((place) => (
            <div
              key={place.placeId}
              className="p-4 hover:bg-primary-50 cursor-pointer border-b last:border-b-0 transition"
              onClick={() => handleAddPlace(place)}
            >
              <div className="font-semibold text-primary-700">{place.name}</div>
              <div className="text-sm text-primary-400">{place.address}</div>
              {place.rating && (
                <div className="text-sm text-yellow-600 mt-1">
                  ⭐ {place.rating}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
