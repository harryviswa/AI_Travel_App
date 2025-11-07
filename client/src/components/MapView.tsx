import { useEffect, useRef } from 'react';
import { useItineraryStore } from '../store/itineraryStore';
import maplibregl, { LngLatBoundsLike, Map as MlMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Place } from '../store/itineraryStore';

interface MapViewProps {
  places: Place[];
  selectedPlace?: Place | null;
}

const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 };
// Use Versatiles colorful style as default - free, no API key needed, looks like OSM Carto
const STYLE_URL = import.meta.env.VITE_MAP_STYLE_URL || 'https://tiles.versatiles.org/assets/styles/colorful.json';

export default function MapView({ places, selectedPlace }: MapViewProps) {
  // Get optimized route from store
  const optimizedRoute = useItineraryStore((state) => state.optimizedRoute);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MlMap | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const mapLoadedRef = useRef<boolean>(false);

  // Initialize map
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: STYLE_URL,
      center: [DEFAULT_CENTER.lng, DEFAULT_CENTER.lat],
      zoom: 10,
    });
    
    // Add navigation controls (zoom buttons)
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    
    mapRef.current = map;
    map.on('load', () => {
      mapLoadedRef.current = true;
    });
    return () => {
      map.remove();
      mapRef.current = null;
      mapLoadedRef.current = false;
    };
  }, []);

  // Update markers and fit bounds
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add markers
    places.forEach((p, i) => {
      const el = document.createElement('div');
      el.className = 'flex items-center justify-center rounded-full bg-blue-600 text-white shadow';
      el.style.width = '28px';
      el.style.height = '28px';
      el.style.fontWeight = '700';
      el.style.fontSize = '12px';
      el.textContent = String(i + 1);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([p.location.lng, p.location.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });

    // Fit bounds
    if (places.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      places.forEach((p) => bounds.extend([p.location.lng, p.location.lat] as [number, number]));
      map.fitBounds(bounds as unknown as LngLatBoundsLike, { padding: 40, animate: true });
    }
  }, [places, selectedPlace]);

  // Update polyline via GeoJSON source named 'route'
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const sourceId = 'route';
    const layerId = 'route-line';
    // Use optimized route GeoJSON if present, else connect places
    let data: GeoJSON.Feature<GeoJSON.LineString> | null = null;
    if (optimizedRoute && optimizedRoute.routeGeoJson) {
      data = optimizedRoute.routeGeoJson;
    } else if (places.length > 1) {
      const coords = places.map((p) => [p.location.lng, p.location.lat]);
      data = {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: coords },
        properties: {},
      };
    }

    const applyRoute = () => {
      // Remove old layer/source if present and no data
      if (!data) {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
        return;
      }
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, { type: 'geojson', data });
        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': '#2563eb',
            'line-width': 4,
            'line-opacity': 0.8,
          },
        });
      } else {
        const src = map.getSource(sourceId) as maplibregl.GeoJSONSource;
        src.setData(data);
      }
    };

    // Ensure style is loaded before adding/updating sources/layers
    const isLoaded = (map as any).isStyleLoaded?.()
      ? (map as any).isStyleLoaded()
      : mapLoadedRef.current;
    if (isLoaded) {
      applyRoute();
    } else {
      map.once('load', applyRoute);
    }
  }, [places, optimizedRoute]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full bg-gradient-to-br from-blue-100 via-white to-purple-100 rounded-3xl shadow-xl border border-blue-100/60 overflow-hidden"
      style={{ minHeight: 400 }}
    />
  );
}
