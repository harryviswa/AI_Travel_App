/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Minimal GeoJSON typings for the map component
declare namespace GeoJSON {
  interface Geometry {
    type: string
  }
  interface LineString extends Geometry {
    type: 'LineString'
    coordinates: number[][]
  }
  interface Feature<G extends Geometry> {
    type: 'Feature'
    geometry: G
    properties?: Record<string, any>
  }
}
