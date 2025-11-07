
import { useState } from 'react';
import SearchBar from './components/SearchBar';
import ItineraryPanel from './components/ItineraryPanel';
import MapView from './components/MapView';
import RecommendationsPanel from './components/RecommendationsPanel';
import AllFeaturesPanel from './components/AllFeaturesPanel';
import { useItineraryStore } from './store/itineraryStore';

function App() {
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const { places } = useItineraryStore();

  return (

    <div
      className="h-screen flex flex-col relative overflow-hidden"
      style={{
        background: `url('/travel app backgroun.png') center center / cover no-repeat fixed`,
      }}
    >
      {/* Optional: Add a soft overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/60 via-white/60 to-purple-200/60 z-0 pointer-events-none select-none" />




      {/* Hero Title & Logo Section */}
      <div className="relative flex flex-col items-center justify-center pt-10 pb-2 z-20">
        {/* Transparent SVG Logo Watermark */}
        <img
          src="/logo-watermark.svg"
          alt="Lisa.ai Logo"
          className="w-20 h-20 md:w-56 md:h-56 opacity-30 mb-[-2.5rem] pointer-events-none select-none"
          draggable="false"
        />
          <h1
            className="relative z-10 text-5xl md:text-6xl font-extrabold tracking-tight text-center mb-2 mt-2 bg-gradient-to-r from-blue-500 via-fuchsia-500 to-amber-400 bg-clip-text text-transparent drop-shadow-xl font-[cursive,sans-serif]"
            style={{ fontFamily: 'Pacifico, Lobster, cursive, sans-serif' }}
          >
            LISA.ai - Your travel buddy
          </h1>
      </div>

      {/* Main Content: Two Columns for Itinerary and AI Suggestions, Map at Bottom */}
      <div className="flex-1 flex flex-col items-center justify-start px-4 py-8 overflow-y-auto relative z-10">
        <div className="w-full max-w-6xl rounded-3xl bg-white/60 shadow-2xl border border-blue-100 backdrop-blur-xl p-6 flex flex-col gap-6 transition-all duration-300 relative mt-2">
          {/* Search Bar */}
          <div>
            <SearchBar />
          </div>

          {/* Two-column layout for itinerary and AI suggestions */}
          {places.length > 0 && (
            <div className="flex flex-col md:flex-row gap-6 w-full">
              {/* User Itinerary List */}
              <div className="flex-1 min-w-[320px]">
                <ItineraryPanel onPlaceSelect={setSelectedPlace} showOnlyItinerary />
              </div>
              {/* AI Suggestions Table */}
              <div className="flex-1 min-w-[320px]">
                <ItineraryPanel onPlaceSelect={setSelectedPlace} showOnlyAISuggestions />
              </div>
            </div>
          )}

          {/* Map at the bottom */}
          {places.length > 0 && (
            <div className="w-full h-[340px] rounded-2xl overflow-hidden border border-blue-100 shadow-xl bg-white/50 backdrop-blur-xl mt-6 relative">
              <MapView places={places} selectedPlace={selectedPlace} />
              {/* Recommendations overlay if place selected */}
              {selectedPlace && (
                <div className="absolute right-8 top-8 w-80 max-w-[340px] z-50">
                  <div className="rounded-2xl bg-white/80 shadow-2xl border border-purple-100 backdrop-blur-xl flex-1 overflow-y-auto">
                    <RecommendationsPanel place={selectedPlace} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* All Features/Actions always at the bottom */}
          <div>
            <AllFeaturesPanel />
          </div>
        </div>
      </div>

      {/* Footer - glassy, modern, for disclaimers/notes */}
  <footer className="relative z-20 w-full bg-white/40 border-t border-blue-200/30 shadow-inner py-4 px-6 flex flex-col items-center text-xs text-gray-500 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row gap-2 items-center justify-center">
          <span>© {new Date().getFullYear()} AI Travel Companion. All rights reserved.</span>
          <span className="mx-2 hidden md:inline">|</span>
          <span>For informational and planning purposes only. Map data &copy; OpenStreetMap contributors.</span>
        </div>
        <div className="mt-1 text-[11px] text-gray-400">This app does not guarantee real-time accuracy for routes, costs, or recommendations. Always verify before travel.</div>
      </footer>
    </div>
  );
}


export default App;
