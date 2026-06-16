/** Shared Leaflet map options — attribution hidden in UI (see globals.css). */
export const MAP_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export const MAP_INIT_OPTIONS = {
  attributionControl: false,
} as const;

export const MAP_TILE_OPTIONS = {
  attribution: "",
  maxZoom: 19,
} as const;
