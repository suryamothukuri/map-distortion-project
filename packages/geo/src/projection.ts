import {
  EARTH_RADIUS_KM,
  EQUAL_EARTH_COEFFICIENTS,
} from './constants.js';

export type PointLonLat = [longitude: number, latitude: number];
export type PointXY = [x: number, y: number];

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180.0;
}

export function radToDeg(rad: number): number {
  return (rad * 180.0) / Math.PI;
}

export function mercatorLinearScale(latDeg: number): number {
  const latRad = degToRad(latDeg);
  if (Math.abs(latRad) >= Math.PI / 2) {
    return Infinity;
  }
  return 1.0 / Math.cos(latRad);
}

export function mercatorAreaMultiplier(latDeg: number): number {
  const k = mercatorLinearScale(latDeg);
  return k * k;
}

export function projectMercator([lonDeg, latDeg]: PointLonLat, radiusKm: number = EARTH_RADIUS_KM): PointXY {
  const lonRad = degToRad(lonDeg);
  const clampedLatDeg = Math.max(-85.0, Math.min(85.0, latDeg));
  const latRad = degToRad(clampedLatDeg);
  
  const x = radiusKm * lonRad;
  const y = radiusKm * Math.log(Math.tan(Math.PI / 4.0 + latRad / 2.0));
  return [x, y];
}

export function invertMercator([x, y]: PointXY, radiusKm: number = EARTH_RADIUS_KM): PointLonLat {
  const lonRad = x / radiusKm;
  const latRad = 2.0 * Math.atan(Math.exp(y / radiusKm)) - Math.PI / 2.0;
  return [radToDeg(lonRad), radToDeg(latRad)];
}

export function projectEqualEarth([lonDeg, latDeg]: PointLonLat, radiusKm: number = EARTH_RADIUS_KM): PointXY {
  const lonRad = degToRad(lonDeg);
  const latRad = degToRad(latDeg);
  
  const { A1, A2, A3, A4, M } = EQUAL_EARTH_COEFFICIENTS;
  const sinTheta = M * Math.sin(latRad);
  const theta = Math.asin(Math.max(-1.0, Math.min(1.0, sinTheta)));
  const theta2 = theta * theta;
  const theta6 = theta2 * theta2 * theta2;
  
  const num = 2.0 * Math.sqrt(3.0) * lonRad * Math.cos(theta);
  const den = 3.0 * (A1 + 3.0 * A2 * theta2 + theta6 * (7.0 * A3 + 9.0 * A4 * theta2));
  
  const x = radiusKm * (num / den);
  const y = radiusKm * theta * (A1 + A2 * theta2 + theta6 * (A3 + A4 * theta2));
  
  return [x, y];
}
