/**
 * Mathematical metrics formulas specified in Section 6.
 */

/**
 * Area Inflation Factor (AF): Planar projected area divided by Spherical reference area.
 */
export function calculateAreaInflationFactor(planarAreaKm2: number, sphericalAreaKm2: number): number {
  if (sphericalAreaKm2 <= 0) return 1.0;
  return planarAreaKm2 / sphericalAreaKm2;
}

/**
 * Distortion Index (DI): Percentage enlargement relative to spherical area.
 * DI = 100 * (AF - 1).
 */
export function calculateDistortionIndex(af: number): number {
  return 100.0 * (af - 1.0);
}

/**
 * Projection Representation Index (PRI) and Visual Power Gap.
 * Given land_share = A_i / sum(A_j) and map_share = P_i / sum(P_j):
 * PRI = map_share / land_share
 * VisualPowerGap = 100 * (map_share - land_share)
 */
export interface RepresentationIndexResult {
  landShare: number;
  mapShare: number;
  pri: number | null; // null if landShare is 0
  visualPowerGapPp: number; // percentage points
}

export function calculateRepresentationIndex(
  countrySphericalAreaKm2: number,
  totalSphericalAreaKm2: number,
  countryPlanarAreaKm2: number,
  totalPlanarAreaKm2: number
): RepresentationIndexResult {
  const landShare = totalSphericalAreaKm2 > 0 ? countrySphericalAreaKm2 / totalSphericalAreaKm2 : 0;
  const mapShare = totalPlanarAreaKm2 > 0 ? countryPlanarAreaKm2 / totalPlanarAreaKm2 : 0;
  
  const pri = landShare > 0 ? mapShare / landShare : null;
  const visualPowerGapPp = 100.0 * (mapShare - landShare);
  
  return {
    landShare,
    mapShare,
    pri,
    visualPowerGapPp,
  };
}

/**
 * Real-world metric representation ratio & gap.
 * metric_share = X_i / sum(X_j)
 * map_share = P_i / sum(P_j)
 * ratio = map_share / metric_share
 * gap = 100 * (map_share - metric_share)
 */
export interface MetricRepresentationResult {
  metricShare: number;
  mapShare: number;
  representationRatio: number | null;
  representationGapPp: number;
}

export function calculateMetricRepresentation(
  countryMetricValue: number,
  totalMetricValue: number,
  countryPlanarAreaKm2: number,
  totalPlanarAreaKm2: number
): MetricRepresentationResult {
  const metricShare = totalMetricValue > 0 ? countryMetricValue / totalMetricValue : 0;
  const mapShare = totalPlanarAreaKm2 > 0 ? countryPlanarAreaKm2 / totalPlanarAreaKm2 : 0;
  
  const representationRatio = metricShare > 0 ? mapShare / metricShare : null;
  const representationGapPp = 100.0 * (mapShare - metricShare);
  
  return {
    metricShare,
    mapShare,
    representationRatio,
    representationGapPp,
  };
}

/**
 * Country-to-country comparison ratios:
 * true_area_ratio = A_a / A_b
 * apparent_ratio = P_a / P_b
 * ratio_bias = apparent_ratio / true_area_ratio
 */
export interface PairComparisonResult {
  trueAreaRatio: number;
  apparentRatio: number;
  ratioBias: number;
}

export function calculatePairComparison(
  sphericalAreaA: number,
  sphericalAreaB: number,
  planarAreaA: number,
  planarAreaB: number
): PairComparisonResult {
  const trueAreaRatio = sphericalAreaB > 0 ? sphericalAreaA / sphericalAreaB : 0;
  const apparentRatio = planarAreaB > 0 ? planarAreaA / planarAreaB : 0;
  const ratioBias = trueAreaRatio > 0 ? apparentRatio / trueAreaRatio : 0;
  
  return {
    trueAreaRatio,
    apparentRatio,
    ratioBias,
  };
}
