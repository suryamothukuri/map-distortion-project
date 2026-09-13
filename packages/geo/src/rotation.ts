import { PointLonLat, degToRad, radToDeg } from './projection.js';

export type Vec3 = [x: number, y: number, z: number];
export type Quaternion = [w: number, x: number, y: number, z: number];

/**
 * Convert lon/lat (degrees) to 3D Cartesian unit vector on unit sphere.
 */
export function lonLatToVec3([lonDeg, latDeg]: PointLonLat): Vec3 {
  const lon = degToRad(lonDeg);
  const lat = degToRad(latDeg);
  const cosLat = Math.cos(lat);
  return [
    cosLat * Math.cos(lon),
    cosLat * Math.sin(lon),
    Math.sin(lat),
  ];
}

/**
 * Convert 3D Cartesian vector to lon/lat (degrees).
 */
export function vec3ToLonLat([x, y, z]: Vec3): PointLonLat {
  const norm = Math.sqrt(x * x + y * y + z * z);
  const nx = x / norm;
  const ny = y / norm;
  const nz = Math.max(-1.0, Math.min(1.0, z / norm));
  
  const lonRad = Math.atan2(ny, nx);
  const latRad = Math.asin(nz);
  return [radToDeg(lonRad), radToDeg(latRad)];
}

/**
 * Dot product of two 3D vectors.
 */
export function dotVec3(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * Cross product of two 3D vectors.
 */
export function crossVec3(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

/**
 * Compute the shortest-arc unit quaternion that rotates unit vector `a` to unit vector `b`.
 */
export function shortestArcQuaternion(a: Vec3, b: Vec3): Quaternion {
  const dot = dotVec3(a, b);
  
  // Parallel vectors (identity)
  if (dot > 0.999999999) {
    return [1, 0, 0, 0];
  }
  
  // Antipodal vectors (180 degree rotation around any orthogonal axis)
  if (dot < -0.999999999) {
    let axis: Vec3 = [1, 0, 0];
    if (Math.abs(a[0]) > 0.9) {
      axis = [0, 1, 0];
    }
    const ortho = crossVec3(a, axis);
    const len = Math.sqrt(dotVec3(ortho, ortho));
    return [0, ortho[0] / len, ortho[1] / len, ortho[2] / len];
  }
  
  const cross = crossVec3(a, b);
  const w = 1.0 + dot;
  const len = Math.sqrt(w * w + dotVec3(cross, cross));
  
  return [w / len, cross[0] / len, cross[1] / len, cross[2] / len];
}

/**
 * Rotate vector `v` by unit quaternion `q`: v' = q * v * q^-1.
 */
export function rotateVec3ByQuat(v: Vec3, q: Quaternion): Vec3 {
  const [qw, qx, qy, qz] = q;
  const [vx, vy, vz] = v;
  
  // t = 2 * (q.xyz x v)
  const tx = 2 * (qy * vz - qz * vy);
  const ty = 2 * (qz * vx - qx * vz);
  const tz = 2 * (qx * vy - qy * vx);
  
  // v' = v + qw * t + (q.xyz x t)
  return [
    vx + qw * tx + (qy * tz - qz * ty),
    vy + qw * ty + (qz * tx - qx * tz),
    vz + qw * tz + (qx * ty - qy * tx),
  ];
}

/**
 * Rotate a single lon/lat point by quaternion `q`.
 */
export function rotateLonLat(point: PointLonLat, q: Quaternion): PointLonLat {
  const v = lonLatToVec3(point);
  const vRot = rotateVec3ByQuat(v, q);
  return vec3ToLonLat(vRot);
}

/**
 * Rotate a polygon (ring or list of rings) on the sphere from anchor `fromAnchor` to `toAnchor`.
 * Also checks if any vertex crosses the +/-85° comparison domain threshold.
 */
export interface RotationResult {
  rotatedCoordinates: PointLonLat[][][]; // MultiPolygon coordinates
  quaternion: Quaternion;
  exceedsClipLatitude: boolean;
  maxAbsLatitude: number;
}

export function rotateMultiPolygonOnSphere(
  multiPolygon: PointLonLat[][][],
  fromAnchor: PointLonLat,
  toAnchor: PointLonLat,
  clipLatitudeDeg: number = 85.0
): RotationResult {
  const vFrom = lonLatToVec3(fromAnchor);
  const vTo = lonLatToVec3(toAnchor);
  const q = shortestArcQuaternion(vFrom, vTo);
  
  let maxAbsLat = 0;
  
  const rotated = multiPolygon.map(polygon =>
    polygon.map(ring =>
      ring.map(pt => {
        const rotPt = rotateLonLat(pt, q);
        const absLat = Math.abs(rotPt[1]);
        if (absLat > maxAbsLat) {
          maxAbsLat = absLat;
        }
        return rotPt;
      })
    )
  );
  
  return {
    rotatedCoordinates: rotated,
    quaternion: q,
    exceedsClipLatitude: maxAbsLat > clipLatitudeDeg,
    maxAbsLatitude: maxAbsLat,
  };
}
