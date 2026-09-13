import { CountryRecord, MoveExperimentRequest, MoveExperimentResponse, ReleaseMeta } from '@map-distortion/contracts';

export interface DataProvider {
  mode: 'api' | 'snapshot';
  getMeta(): Promise<ReleaseMeta>;
  getCountries(params?: { q?: string; region?: string; limit?: number }): Promise<CountryRecord[]>;
  getCountryDetail(id: string): Promise<CountryRecord | null>;
  getDistortionRankings(params?: { region?: string; sort?: string; order?: 'asc' | 'desc' }): Promise<CountryRecord[]>;
  getComparison(a: string, b: string, projection?: string, year?: number): Promise<any>;
  getWorldCartogram(metric?: string, year?: number): Promise<any>;
  moveCountry(req: MoveExperimentRequest): Promise<MoveExperimentResponse>;
  getGeoJson(): Promise<any>;
}

export class HttpDataProvider implements DataProvider {
  mode: 'api' = 'api';
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  async getMeta(): Promise<ReleaseMeta> {
    const res = await fetch(`${this.baseUrl}/api/v1/meta`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data;
  }

  async getCountries(params?: { q?: string; region?: string; limit?: number }): Promise<CountryRecord[]> {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.region) query.set('region', params.region);
    if (params?.limit) query.set('limit', params.limit.toString());
    const res = await fetch(`${this.baseUrl}/api/v1/countries?${query.toString()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data;
  }

  async getCountryDetail(id: string): Promise<CountryRecord | null> {
    const res = await fetch(`${this.baseUrl}/api/v1/countries/${id}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  }

  async getDistortionRankings(params?: { region?: string; sort?: string; order?: 'asc' | 'desc' }): Promise<CountryRecord[]> {
    const query = new URLSearchParams();
    if (params?.region) query.set('region', params.region);
    if (params?.sort) query.set('sort', params.sort);
    if (params?.order) query.set('order', params.order);
    const res = await fetch(`${this.baseUrl}/api/v1/distortion?${query.toString()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data;
  }

  async getComparison(a: string, b: string, projection: string = 'mercator', year: number = 2024): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/v1/compare?a=${a}&b=${b}&projection=${projection}&year=${year}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data;
  }

  async getWorldCartogram(metric: string = 'population', year: number = 2024): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/v1/world?metric=${metric}&year=${year}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data;
  }

  async moveCountry(req: MoveExperimentRequest): Promise<MoveExperimentResponse> {
    const res = await fetch(`${this.baseUrl}/api/v1/experiments/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data;
  }

  async getGeoJson(): Promise<any> {
    const res = await fetch('/data/rel-2026-v1/world_geo.json');
    if (!res.ok) throw new Error(`GeoJSON fetch error ${res.status}`);
    return res.json();
  }
}

export class SnapshotDataProvider implements DataProvider {
  mode: 'snapshot' = 'snapshot';
  private releaseId: string;
  private countriesCache: CountryRecord[] | null = null;
  private manifestCache: ReleaseMeta | null = null;
  private geoCache: any = null;

  constructor(releaseId: string = 'rel-2026-v1') {
    this.releaseId = releaseId;
  }

  private async fetchCountries(): Promise<CountryRecord[]> {
    if (this.countriesCache) return this.countriesCache;
    const res = await fetch(`/data/${this.releaseId}/countries.json`);
    if (!res.ok) throw new Error(`Failed to load countries snapshot ${res.status}`);
    this.countriesCache = await res.json();
    return this.countriesCache!;
  }

  async getMeta(): Promise<ReleaseMeta> {
    if (this.manifestCache) return this.manifestCache;
    const res = await fetch(`/data/${this.releaseId}/manifest.json`);
    if (!res.ok) throw new Error(`Failed to load manifest snapshot ${res.status}`);
    this.manifestCache = await res.json();
    return this.manifestCache!;
  }

  async getCountries(params?: { q?: string; region?: string; limit?: number }): Promise<CountryRecord[]> {
    let list = await this.fetchCountries();
    if (params?.region) {
      list = list.filter((c) => c.region_id === params.region);
    }
    if (params?.q) {
      const q = params.q.toLowerCase();
      list = list.filter((c) => c.display_name.toLowerCase().includes(q) || (c.iso3 && c.iso3.toLowerCase().includes(q)));
    }
    if (params?.limit) {
      list = list.slice(0, params.limit);
    }
    return list;
  }

  async getCountryDetail(id: string): Promise<CountryRecord | null> {
    const list = await this.fetchCountries();
    const upper = id.toUpperCase();
    return list.find((c) => c.entity_id === upper || c.iso3 === upper) || null;
  }

  async getDistortionRankings(params?: { region?: string; sort?: string; order?: 'asc' | 'desc' }): Promise<CountryRecord[]> {
    let list = await this.getCountries({ region: params?.region });
    const sortCol = (params?.sort as keyof CountryRecord) || 'mercator_inflation';
    const isAsc = params?.order === 'asc';
    return list.sort((a, b) => {
      const va = (a[sortCol] as number) ?? 0;
      const vb = (b[sortCol] as number) ?? 0;
      return isAsc ? va - vb : vb - va;
    });
  }

  async getComparison(a: string, b: string, projection: string = 'mercator', _year: number = 2024): Promise<any> {
    const list = await this.fetchCountries();
    const ea = list.find((c) => c.entity_id === a.toUpperCase());
    const eb = list.find((c) => c.entity_id === b.toUpperCase());
    if (!ea || !eb) throw new Error('Country not found in snapshot');

    const true_area_ratio = eb.sphere_area_visible_km2 > 0 ? ea.sphere_area_visible_km2 / eb.sphere_area_visible_km2 : 0;
    const apparent_ratio =
      projection === 'mercator'
        ? ea.mercator_area_km2 / eb.mercator_area_km2
        : ea.equal_earth_area_km2 / eb.equal_earth_area_km2;
    const ratio_bias = true_area_ratio > 0 ? apparent_ratio / true_area_ratio : 0;

    return {
      entity_a: ea,
      entity_b: eb,
      true_area_ratio,
      apparent_ratio,
      ratio_bias,
      projection,
      year: 2024,
      metrics_comparison: {
        population: {
          value_a: (ea as any).population,
          value_b: (eb as any).population,
          ratio_a_to_b: (ea as any).population && (eb as any).population ? (ea as any).population / (eb as any).population : null,
        },
        gdp: {
          value_a: (ea as any).gdp,
          value_b: (eb as any).gdp,
          ratio_a_to_b: (ea as any).gdp && (eb as any).gdp ? (ea as any).gdp / (eb as any).gdp : null,
        },
      },
    };
  }

  async getWorldCartogram(metric: string = 'population', _year: number = 2024): Promise<any> {
    const list = await this.fetchCountries();
    let totalVal = 0;
    const items = list.map((c: any) => {
      const val = metric === 'boundary_area' ? c.sphere_area_visible_km2 : c[metric] ?? 0;
      if (val > 0) totalVal += val;
      return {
        entity_id: c.entity_id,
        display_name: c.display_name,
        iso3: c.iso3,
        region_id: c.region_id,
        region_name: c.region_name,
        centroid_lon: c.centroid_lon,
        centroid_lat: c.centroid_lat,
        sphere_area_km2: Number(c.sphere_area_visible_km2 || c.sphere_area_full_km2 || c.land_area || 0),
        sphere_area_visible_km2: Number(c.sphere_area_visible_km2 || c.sphere_area_full_km2 || c.land_area || 0),
        land_area: Number(c.land_area || c.sphere_area_visible_km2 || 0),
        metric_value: val,
        metric_unit: metric === 'population' ? 'persons' : metric === 'gdp' ? 'current US$' : 'km²',
        metric_share: 0,
        has_data: val > 0,
      };
    });

    items.forEach((item) => {
      item.metric_share = totalVal > 0 ? (item.metric_value || 0) / totalVal : 0;
    });

    return items;
  }

  async moveCountry(req: MoveExperimentRequest): Promise<MoveExperimentResponse> {
    const list = await this.fetchCountries();
    const e = list.find((c) => c.entity_id === req.entity_id.toUpperCase());
    if (!e) throw new Error('Entity not found');

    const destLatRad = (req.destination_lat * Math.PI) / 180.0;
    const origLatRad = (e.centroid_lat * Math.PI) / 180.0;
    const destCos = Math.cos(destLatRad);
    const origCos = Math.cos(origLatRad);

    const destJ = 1.0 / (destCos * destCos);
    const origJ = 1.0 / (origCos * origCos);
    const moved_af = req.projection === 'mercator' ? e.mercator_inflation * (destJ / origJ) : 1.0002;
    const moved_planar = e.sphere_area_visible_km2 * moved_af;

    return {
      entity_id: e.entity_id,
      original_centroid: [e.centroid_lon, e.centroid_lat],
      destination_anchor: [req.destination_lon, req.destination_lat],
      spherical_area_km2: e.sphere_area_visible_km2,
      original_planar_area_km2: req.projection === 'mercator' ? e.mercator_area_km2 : e.equal_earth_area_km2,
      moved_planar_area_km2: moved_planar,
      original_af: e.mercator_inflation,
      moved_af,
      exceeds_clip_bounds: Math.abs(req.destination_lat) > 85.0,
      max_abs_latitude: Math.abs(req.destination_lat),
    };
  }

  async getGeoJson(): Promise<any> {
    if (this.geoCache) return this.geoCache;
    const res = await fetch(`/data/${this.releaseId}/world_geo.json`);
    if (!res.ok) throw new Error(`GeoJSON load error ${res.status}`);
    this.geoCache = await res.json();
    return this.geoCache;
  }
}

/**
 * Initializes and returns the active DataProvider.
 * Probes the backend API with a fast 1500ms timeout; falls back cleanly to snapshot mode.
 */
export async function createDataProvider(apiUrl: string = 'http://localhost:8000'): Promise<DataProvider> {
  const httpProvider = new HttpDataProvider(apiUrl);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${apiUrl}/api/v1/meta`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      return httpProvider;
    }
  } catch (_e) {
    // API unavailable or timed out; fall back seamlessly to offline SnapshotDataProvider
  }
  return new SnapshotDataProvider('rel-2026-v1');
}
