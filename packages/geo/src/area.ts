import { PointLonLat, PointXY, degToRad } from './projection.js';
import { EARTH_RADIUS_KM } from './constants.js';

/**
 * Calculate spherical excess of a spherical triangle defined by 3 unit vectors.
 * Uses van Oosterom and Strackee (1983) formula.
 */
function sphericalTriangleArea(a: [number, number, number], b: [number, number, number], c: [number, number, number]): number {
  const det =
    a[0] * (b[1] * c[2] - b[2] * c[1]) -
    a[1] * (b[0] * c[2] - b[2] * c[0]) +
    a[2] * (b[0] * c[1] - b[1] * c[0]);

  const al = Math.hypot(a[0], a[1], a[2]);
  const bl = Math.hypot(b[0], b[1], b[2]);
  const cl = Math.hypot(c[0], c[1], c[2]);

  const dotAB = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const dotBC = b[0] * c[0] + b[1] * c[1] + b[2] * c[2];
  const dotCA = c[0] * a[0] + c[1] * a[1] + c[2] * a[2];

  const den = al * bl * cl + dotAB * cl + dotBC * al + dotCA * bl;
  return 2.0 * Math.atan2(Math.abs(det), den);
}

/**
 * Calculate the area of a spherical polygon ring in steradians.
 */
export function sphericalRingAreaSteradians(ring: PointLonLat[]): number {
  if (ring.length < 3) return 0;
  
  // Convert points to 3D unit vectors
  const vectors: [number, number, number][] = ring.map(([lonDeg, latDeg]) => {
    const lon = degToRad(lonDeg);
    const lat = degToRad(latDeg);
    const cosLat = Math.cos(lat);
    return [cosLat * Math.cos(lon), cosLat * Math.sin(lon), Math.sin(lat)];
  });

  // Triangulate polygon from first vertex
  let totalSolidAngle = 0;
  const v0 = vectors[0];
  for (let i = 1; i < vectors.length - 1; i++) {
    totalSolidAngle += sphericalTriangleArea(v0, vectors[i], vectors[i + 1]);
  }
  
  return totalSolidAngle;
}

/**
 * Calculate total spherical area of a MultiPolygon in km².
 */
export function calculateSphericalAreaKm2(
  multiPolygon: PointLonLat[][][],
  radiusKm: number = EARTH_RADIUS_KM
): number {
  let totalSteradians = 0;
  
  for (const polygon of multiPolygon) {
    if (polygon.length === 0) continue;
    
    // Outer ring adds area
    const outerArea = sphericalRingAreaSteradians(polygon[0]);
    let polySteradians = outerArea;
    
    // Inner rings (holes) subtract area
    for (let h = 1; h < polygon.length; h++) {
      polySteradians -= sphericalRingAreaSteradians(polygon[h]);
    }
    
    totalSteradians += Math.max(0, polySteradians);
  }
  
  return totalSteradians * radiusKm * radiusKm;
}

/**
 * Standard 2D planar polygon area using Shoelace formula.
 */
export function planarRingArea(ring: PointXY[]): number {
  let area = 0;
  const n = ring.length;
  if (n < 3) return 0;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += ring[i][0] * ring[j][1];
    area -= ring[j][0] * ring[i][1];
  }
  return Math.abs(area) / 2.0;
}

/**
 * Planar area of a MultiPolygon of PointXY coordinates in km².
 */
export function calculatePlanarAreaKm2(multiPolygonXY: PointXY[][][]): number {
  let totalArea = 0;
  for (const polygon of multiPolygonXY) {
    if (polygon.length === 0) continue;
    let polyArea = planarRingArea(polygon[0]);
    for (let h = 1; h < polygon.length; h++) {
      polyArea -= planarRingArea(polygon[h]);
    }
    totalArea += Math.max(0, polyArea);
  }
  return totalArea;
}
