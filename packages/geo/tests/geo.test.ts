import { describe, it, expect } from 'vitest';
import {
  mercatorLinearScale,
  mercatorAreaMultiplier,
  projectMercator,
  invertMercator,
  projectEqualEarth,
  calculateAreaInflationFactor,
  calculateDistortionIndex,
  calculateRepresentationIndex,
  calculatePairComparison,
  shortestArcQuaternion,
  rotateLonLat,
  rotateMultiPolygonOnSphere,
  calculateSphericalAreaKm2,
  calculatePlanarAreaKm2,
  PointLonLat,
  EARTH_RADIUS_KM
} from '../src/index.js';

describe('Local Mercator scale and area multiplier', () => {
  it('matches exact reference values at standard latitudes', () => {
    // 0° -> k=1, J=1
    expect(mercatorLinearScale(0)).toBeCloseTo(1.0, 6);
    expect(mercatorAreaMultiplier(0)).toBeCloseTo(1.0, 6);

    // ±30° -> k=2/√3 ≈ 1.1547, J=4/3 ≈ 1.333333
    expect(mercatorLinearScale(30)).toBeCloseTo(1.1547005, 5);
    expect(mercatorLinearScale(-30)).toBeCloseTo(1.1547005, 5);
    expect(mercatorAreaMultiplier(30)).toBeCloseTo(4.0 / 3.0, 5);
    expect(mercatorAreaMultiplier(-30)).toBeCloseTo(4.0 / 3.0, 5);

    // ±45° -> k=√2 ≈ 1.414213, J=2
    expect(mercatorLinearScale(45)).toBeCloseTo(Math.SQRT2, 5);
    expect(mercatorAreaMultiplier(45)).toBeCloseTo(2.0, 5);
    expect(mercatorAreaMultiplier(-45)).toBeCloseTo(2.0, 5);

    // ±60° -> k=2, J=4
    expect(mercatorLinearScale(60)).toBeCloseTo(2.0, 5);
    expect(mercatorAreaMultiplier(60)).toBeCloseTo(4.0, 5);
    expect(mercatorAreaMultiplier(-60)).toBeCloseTo(4.0, 5);

    // ±80° -> k = 1/cos(80°) ≈ 5.75877, J ≈ 33.163
    expect(mercatorLinearScale(80)).toBeCloseTo(5.75877, 4);
    expect(mercatorAreaMultiplier(80)).toBeCloseTo(33.16345, 3);
  });
});

describe('Forward and inverse projections', () => {
  it('invertMercator accurately inverts projectMercator', () => {
    const testPoints: PointLonLat[] = [
      [0, 0],
      [45, 30],
      [-120, 60],
      [150, -45],
      [-73.98, 40.75]
    ];

    for (const pt of testPoints) {
      const xy = projectMercator(pt);
      const inverted = invertMercator(xy);
      expect(inverted[0]).toBeCloseTo(pt[0], 5);
      expect(inverted[1]).toBeCloseTo(pt[1], 5);
    }
  });

  it('projectEqualEarth maps the equator to symmetrical coordinates', () => {
    const p1 = projectEqualEarth([0, 0]);
    expect(p1[0]).toBeCloseTo(0, 5);
    expect(p1[1]).toBeCloseTo(0, 5);

    const pWest = projectEqualEarth([-90, 0]);
    const pEast = projectEqualEarth([90, 0]);
    expect(pWest[0]).toBeCloseTo(-pEast[0], 5);
    expect(pWest[1]).toBeCloseTo(pEast[1], 5);
  });
});

describe('Spherical rotation and quaternion kinematics', () => {
  it('shortestArcQuaternion returns identity for identical vectors', () => {
    const q = shortestArcQuaternion([1, 0, 0], [1, 0, 0]);
    expect(q[0]).toBeCloseTo(1, 6);
    expect(q[1]).toBeCloseTo(0, 6);
    expect(q[2]).toBeCloseTo(0, 6);
    expect(q[3]).toBeCloseTo(0, 6);
  });

  it('rotates anchor point exactly to destination anchor', () => {
    const sourceAnchor: PointLonLat = [-40, 72]; // Greenland approx
    const destAnchor: PointLonLat = [20, 0];    // Equator approx
    
    const poly: PointLonLat[][][] = [[[
      [-42, 70], [-38, 70], [-38, 74], [-42, 74], [-42, 70]
    ]]];

    const result = rotateMultiPolygonOnSphere(poly, sourceAnchor, destAnchor);
    const movedAnchor = rotateLonLat(sourceAnchor, result.quaternion);

    expect(movedAnchor[0]).toBeCloseTo(destAnchor[0], 4);
    expect(movedAnchor[1]).toBeCloseTo(destAnchor[1], 4);
  });

  it('preserves spherical area under rigid 3D rotation within 0.1%', () => {
    const poly: PointLonLat[][][] = [[[
      [0, 10], [10, 10], [10, 20], [0, 20], [0, 10]
    ]]];
    
    const initialArea = calculateSphericalAreaKm2(poly);
    
    // Rotate from (5, 15) to (100, -45)
    const result = rotateMultiPolygonOnSphere(poly, [5, 15], [100, -45]);
    const rotatedArea = calculateSphericalAreaKm2(result.rotatedCoordinates);

    const relativeDiff = Math.abs(rotatedArea - initialArea) / initialArea;
    expect(relativeDiff).toBeLessThan(0.001); // within 0.1%
  });
});

describe('Metrics and comparison calculations', () => {
  it('computes correct AF and DI', () => {
    const af = calculateAreaInflationFactor(400, 100);
    expect(af).toBe(4.0);
    expect(calculateDistortionIndex(af)).toBe(300.0);
  });

  it('calculates Visual Power Gap and PRI correctly', () => {
    const res = calculateRepresentationIndex(10, 100, 25, 100);
    expect(res.landShare).toBeCloseTo(0.1, 5);
    expect(res.mapShare).toBeCloseTo(0.25, 5);
    expect(res.pri).toBeCloseTo(2.5, 5);
    expect(res.visualPowerGapPp).toBeCloseTo(15.0, 5); // +15 percentage points
  });

  it('calculates pair ratios with reciprocity', () => {
    const compAB = calculatePairComparison(100, 50, 400, 100);
    expect(compAB.trueAreaRatio).toBe(2.0);
    expect(compAB.apparentRatio).toBe(4.0);
    expect(compAB.ratioBias).toBe(2.0);

    const compBA = calculatePairComparison(50, 100, 100, 400);
    expect(compBA.trueAreaRatio).toBe(0.5);
    expect(compBA.apparentRatio).toBe(0.25);
    expect(compBA.ratioBias).toBe(0.5);
  });
});
