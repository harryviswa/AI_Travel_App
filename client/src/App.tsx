
import { useState } from 'react';
import SearchBar from './components/SearchBar';
import ItineraryPanel from './components/ItineraryPanel';
import MapView from './components/MapView';
import RecommendationsPanel from './components/RecommendationsPanel';
import AllFeaturesPanel from './components/AllFeaturesPanel';
import { useItineraryStore } from './store/itineraryStore';

function App() {
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const { places, itineraries } = useItineraryStore();

  return (
    <div className="h-screen flex flex-col relative bg-gradient-to-br from-blue-100 via-white to-purple-200 overflow-hidden">
      {/* Decorative background: world map SVG or travel icons, absolutely positioned and faded */}
      <div className="pointer-events-none select-none absolute inset-0 z-0">
        <svg viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-10">
          <image href="https://upload.wikimedia.org/wikipedia/commons/8/83/Equirectangular_projection_SW.jpg" x="0" y="0" width="1440" height="800" preserveAspectRatio="xMidYMid slice" />
        </svg>
        {/* Optionally add more travel icons or lines here for extra flair */}
      </div>

      {/* Header - professional, glassy, with travel background */}
      <header className="relative z-10 bg-transparent text-white px-6 py-5 md:px-8 md:py-6 shadow-2xl rounded-b-3xl flex flex-col items-center gap-1 border-b border-white/30 backdrop-blur-2xl min-h-0" style={{background: 'rgba(255,255,255,0.06)'}}>
        {/* Overlay for text readability */}
        <div className="absolute inset-0 rounded-b-3xl pointer-events-none" style={{background: 'linear-gradient(180deg,rgba(0,0,0,0.32) 60%,rgba(0,0,0,0.10) 100%)'}} />
        <div className="relative flex items-center gap-3 mb-1">
          <span className="bg-white/20 rounded-full px-3 py-1 text-2xl shadow border border-white/20">🧭</span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight drop-shadow-2xl font-sans" style={{textShadow: '0 2px 16px rgba(0,0,0,0.28)'}}>AI Travel Companion</h1>
        </div>
        <p className="relative text-base md:text-lg text-primary-100/90 font-medium mt-0 drop-shadow text-center max-w-2xl" style={{textShadow: '0 1px 8px rgba(0,0,0,0.28)'}}>
          Plan, optimize, and visualize your perfect road trip with AI-powered recommendations and interactive maps.
        </p>
        <div className="relative flex gap-2 mt-2">
          <span className="bg-white/10 rounded-full px-2 py-0.5 text-xs font-semibold text-primary-50 shadow">🚗 Road Trips</span>
          <span className="bg-white/10 rounded-full px-2 py-0.5 text-xs font-semibold text-primary-50 shadow">🌍 Explore</span>
          <span className="bg-white/10 rounded-full px-2 py-0.5 text-xs font-semibold text-primary-50 shadow">🤖 AI Itineraries</span>
        </div>
      </header>

      {/* Main Content: Single Growing Panel */}
      <div className="flex-1 flex flex-col items-center justify-start px-4 py-8 overflow-y-auto relative z-10">
        <div className="w-full max-w-3xl rounded-3xl bg-white/60 shadow-2xl border border-blue-100 backdrop-blur-xl p-6 flex flex-col gap-6 transition-all duration-300 relative">
          {/* Search Bar */}
          <div>
            <SearchBar />
          </div>

          {/* Places List (Itinerary) appears as soon as places are added */}
          {places.length > 0 && (
            <div>
              <ItineraryPanel onPlaceSelect={setSelectedPlace} />
            </div>
          )}

          {/* Map appears as soon as there are places */}
          {places.length > 0 && (
            <div className="w-full h-[340px] rounded-2xl overflow-hidden border border-blue-100 shadow-xl bg-white/50 backdrop-blur-xl">
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

          {/* AI Suggestions/Itineraries panel appears below actions when generated */}
          {itineraries.length > 0 && (
            <div>
              {/* Reuse ItineraryPanel for generated itineraries display */}
              <ItineraryPanel onPlaceSelect={setSelectedPlace} />
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
