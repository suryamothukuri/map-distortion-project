/**
 * Physical and mathematical constants for The Map Distortion Project.
 * Earth is modeled as a sphere of radius R = 6,371,007.1809 meters.
 */
export const EARTH_RADIUS_METERS = 6371007.1809;
export const EARTH_RADIUS_KM = 6371.0071809;
export const EARTH_SURFACE_AREA_KM2 = 4 * Math.PI * EARTH_RADIUS_KM * EARTH_RADIUS_KM; // ~510,065,628 km²

/**
 * Standard Mercator comparison domain bounds.
 */
export const MERCATOR_CLIP_LATITUDE_DEG = 85.0;
export const MERCATOR_CLIP_LATITUDE_RAD = (85.0 * Math.PI) / 180.0;

export const DOMAIN_BOUNDS = {
  minLon: -180.0,
  maxLon: 180.0,
  minLat: -85.0,
  maxLat: 85.0,
} as const;

/**
 * Equal Earth projection polynomial coefficients (Šavrič et al., 2018).
 */
export const EQUAL_EARTH_COEFFICIENTS = {
  A1: 1.340264,
  A2: -0.081106,
  A3: 0.000893,
  A4: 0.003796,
  M: Math.sqrt(3) / 2.0, // ~0.8660254037844386
} as const;
