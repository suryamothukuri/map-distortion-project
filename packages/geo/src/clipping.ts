import { PointLonLat } from './projection.js';
import { MERCATOR_CLIP_LATITUDE_DEG } from './constants.js';

/**
 * Checks whether any coordinate in a MultiPolygon exceeds the clipping threshold.
 */
export function isExceedingClipBounds(
  multiPolygon: PointLonLat[][][],
  clipLat: number = MERCATOR_CLIP_LATITUDE_DEG
): boolean {
  for (const polygon of multiPolygon) {
    for (const ring of polygon) {
      for (const pt of ring) {
        if (Math.abs(pt[1]) > clipLat) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Computes the maximum absolute latitude present in a MultiPolygon.
 */
export function getMaxAbsLatitude(multiPolygon: PointLonLat[][][]): number {
  let maxLat = 0;
  for (const polygon of multiPolygon) {
    for (const ring of polygon) {
      for (const pt of ring) {
        const absLat = Math.abs(pt[1]);
        if (absLat > maxLat) maxLat = absLat;
      }
    }
  }
  return maxLat;
}
