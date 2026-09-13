import { z } from 'zod';

export const EntityTypeSchema = z.enum(['country', 'territory', 'dependency', 'region_group']);
export type EntityType = z.infer<typeof EntityTypeSchema>;

export const ProjectionIdSchema = z.enum(['mercator', 'equal_earth', 'equirectangular']);
export type ProjectionId = z.infer<typeof ProjectionIdSchema>;

export const MetricIdSchema = z.enum([
  'boundary_area',
  'land_area',
  'population',
  'gdp',
  'co2_emissions',
  'forest_area',
  'resource_rents'
]);
export type MetricId = z.infer<typeof MetricIdSchema>;

export const CountryRecordSchema = z.object({
  entity_id: z.string(),
  display_name: z.string(),
  iso3: z.string().nullable(),
  region_id: z.string(),
  region_name: z.string(),
  sovereign_id: z.string().nullable(),
  entity_type: EntityTypeSchema,
  centroid_lon: z.number(),
  centroid_lat: z.number(),
  sphere_area_full_km2: z.number(),
  sphere_area_visible_km2: z.number(),
  mercator_area_km2: z.number(),
  equal_earth_area_km2: z.number(),
  mercator_inflation: z.number(),
  distortion_index_pct: z.number(),
  visible_fraction: z.number(),
  numerical_error_pct: z.number(),
  land_share: z.number(),
  mercator_map_share: z.number(),
  pri: z.number().nullable(),
  visual_power_gap_pp: z.number(),
});
export type CountryRecord = z.infer<typeof CountryRecordSchema>;

export const ObservationRecordSchema = z.object({
  entity_id: z.string(),
  metric_id: MetricIdSchema,
  year: z.number(),
  value: z.number().nullable(),
  unit: z.string(),
  quality_flag: z.string().nullable(),
});
export type ObservationRecord = z.infer<typeof ObservationRecordSchema>;

export const MetricMetaSchema = z.object({
  metric_id: MetricIdSchema,
  label: z.string(),
  unit: z.string(),
  definition: z.string(),
  additive: z.boolean(),
  source_id: z.string(),
  source_title: z.string(),
  source_url: z.string(),
  license: z.string(),
  available_years: z.array(z.number()),
  default_year: z.number(),
});
export type MetricMeta = z.infer<typeof MetricMetaSchema>;

export const ReleaseMetaSchema = z.object({
  release_id: z.string(),
  created_at: z.string(),
  schema_version: z.string(),
  method_version: z.string(),
  earth_model: z.string(),
  earth_radius_km: z.number(),
  clip_latitude: z.number(),
  total_entities: z.number(),
  eligible_entities: z.number(),
  headline_ratios: z.object({
    africa_greenland_true_ratio: z.number(),
    africa_greenland_mercator_ratio: z.number(),
  }),
});
export type ReleaseMeta = z.infer<typeof ReleaseMetaSchema>;

export const MoveExperimentRequestSchema = z.object({
  entity_id: z.string(),
  destination_lon: z.number(),
  destination_lat: z.number(),
  projection: ProjectionIdSchema.default('mercator'),
});
export type MoveExperimentRequest = z.infer<typeof MoveExperimentRequestSchema>;

export const MoveExperimentResponseSchema = z.object({
  entity_id: z.string(),
  original_centroid: z.tuple([z.number(), z.number()]),
  destination_anchor: z.tuple([z.number(), z.number()]),
  spherical_area_km2: z.number(),
  original_planar_area_km2: z.number(),
  moved_planar_area_km2: z.number(),
  original_af: z.number(),
  moved_af: z.number(),
  exceeds_clip_bounds: z.boolean(),
  max_abs_latitude: z.number(),
});
export type MoveExperimentResponse = z.infer<typeof MoveExperimentResponseSchema>;
