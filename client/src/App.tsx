
import { useState } from 'react';
import MapView from './components/MapView';
import SearchBar from './components/SearchBar';
import ItineraryPanel from './components/ItineraryPanel';
import RecommendationsPanel from './components/RecommendationsPanel';
import AllFeaturesPanel from './components/AllFeaturesPanel';
import { useItineraryStore } from './store/itineraryStore';



function App() {
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const { places } = useItineraryStore();

  // Collapsed state for each panel
  const [collapsed, setCollapsed] = useState({
    search: false,
    itinerary: false,
    map: false,
    features: false,
  });

  const togglePanel = (panel: keyof typeof collapsed) => {
    setCollapsed((prev) => ({ ...prev, [panel]: !prev[panel] }));
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-indigo-500 text-white px-8 py-5 shadow-lg rounded-b-3xl flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <span className="bg-white/20 rounded-full px-3 py-1 text-2xl">🗺️</span>
          AI Travel Assistant
        </h1>
        <p className="text-base text-primary-100/90 font-medium mt-1">Plan your perfect road trip with AI-powered recommendations</p>
      </header>

      {/* 4-Quadrant Main Content */}
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-6 px-6 py-6 overflow-hidden min-h-0">
        {/* Top-Left: Search Panel (smallest) */}
        <div className={`relative rounded-2xl bg-white/80 shadow-xl border border-blue-100 backdrop-blur-md p-4 flex flex-col min-h-0 transition-all duration-300 ${collapsed.search ? 'w-16 min-w-0 max-w-20 p-1' : 'w-full min-w-[180px] max-w-[340px]'}`}>
          <button
            className="absolute top-2 right-2 z-10 bg-primary-100 text-primary-600 rounded-full p-1 shadow hover:bg-primary-200 transition"
            onClick={() => togglePanel('search')}
            title={collapsed.search ? 'Expand' : 'Collapse'}
          >
            {collapsed.search ? '▶' : '◀'}
          </button>
          {!collapsed.search && <SearchBar />}
        </div>

        {/* Top-Right: Map Panel */}
        <div className={`relative rounded-3xl shadow-2xl border border-blue-100 overflow-hidden transition-all duration-300 bg-white/80 flex flex-col min-h-0 ${collapsed.map ? 'w-16 min-w-0 max-w-20 p-1' : 'w-full min-w-[350px] max-w-[900px]'}`}>
          <button
            className="absolute top-2 left-2 z-10 bg-primary-100 text-primary-600 rounded-full p-1 shadow hover:bg-primary-200 transition"
            onClick={() => togglePanel('map')}
            title={collapsed.map ? 'Expand' : 'Collapse'}
          >
            {collapsed.map ? '◀' : '▶'}
          </button>
          {!collapsed.map && <MapView places={places} selectedPlace={selectedPlace} />}
        </div>

        {/* Bottom-Left: Itinerary Panel */}
        <div className={`relative rounded-2xl bg-white/90 shadow-xl border border-blue-100 backdrop-blur-md flex flex-col min-h-0 overflow-hidden transition-all duration-300 ${collapsed.itinerary ? 'w-16 min-w-0 max-w-20 p-1' : 'w-full min-w-[320px] max-w-[600px]'}`}>
          <button
            className="absolute top-2 right-2 z-10 bg-primary-100 text-primary-600 rounded-full p-1 shadow hover:bg-primary-200 transition"
            onClick={() => togglePanel('itinerary')}
            title={collapsed.itinerary ? 'Expand' : 'Collapse'}
          >
            {collapsed.itinerary ? '▶' : '◀'}
          </button>
          {!collapsed.itinerary && <ItineraryPanel onPlaceSelect={setSelectedPlace} />}
        </div>

        {/* Bottom-Right: All Features/Actions Panel */}
        <div className={`relative rounded-2xl bg-white/90 shadow-xl border border-purple-100 backdrop-blur-md flex flex-col min-h-0 overflow-hidden transition-all duration-300 ${collapsed.features ? 'w-16 min-w-0 max-w-20 p-1' : 'w-full min-w-[220px] max-w-[340px]'}`}>
          <button
            className="absolute top-2 left-2 z-10 bg-purple-100 text-purple-600 rounded-full p-1 shadow hover:bg-purple-200 transition"
            onClick={() => togglePanel('features')}
            title={collapsed.features ? 'Expand' : 'Collapse'}
          >
            {collapsed.features ? '◀' : '▶'}
          </button>
          {!collapsed.features && <AllFeaturesPanel />}
        </div>

        {/* Recommendations Panel as overlay if place selected */}
        {selectedPlace && !collapsed.map && (
          <div className="fixed right-8 top-32 w-80 max-w-[340px] z-50">
            <div className="rounded-2xl bg-white/90 shadow-2xl border border-purple-100 backdrop-blur-md flex-1 overflow-y-auto">
              <RecommendationsPanel place={selectedPlace} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
