import json
import math
from typing import Optional
from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import get_db_connection
from .models import (
    ResponseEnvelope,
    CountryModel,
    MoveExperimentRequest,
    MoveExperimentResponse,
)

app = FastAPI(
    title="The Map Distortion Project API",
    description="Analytical API providing projection distortion measures, real-world indicators, and true-size comparisons.",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/healthz", tags=["System"])
def healthz():
    return {"status": "healthy"}

@app.get("/readyz", tags=["System"])
def readyz():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT value FROM metadata WHERE key = 'release_id'")
        row = cur.fetchone()
        conn.close()
        if row and row["value"] == settings.release_id:
            return {"status": "ready", "release_id": settings.release_id}
        raise HTTPException(status_code=503, detail="Release ID mismatch or uninitialized")
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unready: {str(e)}")

@app.get("/api/v1/meta", tags=["Metadata"])
def get_meta():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT value FROM metadata WHERE key = 'manifest'")
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Manifest metadata not found")
    manifest = json.loads(row["value"])
    return {
        "data": manifest,
        "meta": {"release_id": settings.release_id, "timestamp": manifest.get("created_at")}
    }

@app.get("/api/v1/projections", tags=["Projections"])
def get_projections():
    projections = [
        {
            "id": "mercator",
            "name": "Mercator",
            "property": "conformal",
            "preserves": "local angles and shapes, rhumb lines",
            "distorts": "area (severe high-latitude inflation)",
            "clip_latitude": 85.0,
            "equations": {
                "forward": "x = R * λ, y = R * ln(tan(π/4 + φ/2))",
                "linear_scale": "k(φ) = sec(φ)",
                "area_multiplier": "J(φ) = sec²(φ)"
            }
        },
        {
            "id": "equal_earth",
            "name": "Equal Earth",
            "property": "equal-area",
            "preserves": "relative land surface areas (AF ≈ 1.0 everywhere)",
            "distorts": "shapes at high latitudes and map edges",
            "clip_latitude": 85.0,
            "equations": {
                "forward": "Šavrič et al. (2018) pseudo-cylindrical polynomial formulation",
                "area_multiplier": "J(φ) = 1.0"
            }
        },
        {
            "id": "equirectangular",
            "name": "Equirectangular (Plate Carrée)",
            "property": "compromise",
            "preserves": "equidistant meridians and parallels",
            "distorts": "both area and shape away from standard parallels",
            "clip_latitude": 85.0,
            "equations": {
                "forward": "x = R * λ * cos(φ0), y = R * φ",
                "area_multiplier": "J(φ) = sec(φ)"
            }
        }
    ]
    return {
        "data": projections,
        "meta": {
            "earth_radius_km": 6371.0071809,
            "earth_model": "sphere",
            "comparison_domain": "[-180°, 180°] lon, [-85°, 85°] lat"
        }
    }

@app.get("/api/v1/countries", tags=["Entities"])
def get_countries(
    q: Optional[str] = Query(None, description="Search term for country name or ISO3"),
    region: Optional[str] = Query(None, description="Filter by region ID"),
    entity_type: Optional[str] = Query(None, description="Filter by entity type (country/territory)"),
    limit: int = Query(300, ge=1, le=300),
    offset: int = Query(0, ge=0),
):
    conn = get_db_connection()
    cur = conn.cursor()
    
    query = "SELECT * FROM entities WHERE 1=1"
    params = []
    
    if q:
        query += " AND (display_name LIKE ? OR iso3 LIKE ? OR entity_id LIKE ?)"
        pattern = f"%{q}%"
        params.extend([pattern, pattern, pattern])
        
    if region:
        query += " AND region_id = ?"
        params.append(region)
        
    if entity_type:
        query += " AND entity_type = ?"
        params.append(entity_type)
        
    query += " ORDER BY display_name ASC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    cur.execute(query, params)
    rows = cur.fetchall()
    
    # Get total count
    cur.execute("SELECT COUNT(*) as cnt FROM entities")
    total_count = cur.fetchone()["cnt"]
    conn.close()
    
    countries = [dict(row) for row in rows]
    return {
        "data": countries,
        "meta": {
            "release_id": settings.release_id,
            "total_count": total_count,
            "returned_count": len(countries),
            "limit": limit,
            "offset": offset
        }
    }

@app.get("/api/v1/countries/{country_id}", tags=["Entities"])
def get_country_detail(country_id: str):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM entities WHERE entity_id = ? OR iso3 = ?", (country_id.upper(), country_id.upper()))
    row = cur.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Country '{country_id}' not found")
        
    country = dict(row)
    
    # Fetch recent indicator observations
    cur.execute(
        "SELECT metric_id, year, value, unit FROM observations WHERE entity_id = ? AND year = 2024",
        (country["entity_id"],)
    )
    obs_rows = cur.fetchall()
    country["latest_observations"] = {r["metric_id"]: {"value": r["value"], "unit": r["unit"], "year": r["year"]} for r in obs_rows}
    conn.close()
    
    return {"data": country, "meta": {"release_id": settings.release_id}}

@app.get("/api/v1/distortion", tags=["Distortion"])
def get_distortion_rankings(
    projection: str = Query("mercator", description="Projection (mercator or equal_earth)"),
    region: Optional[str] = Query(None, description="Filter by region"),
    sort: str = Query("mercator_inflation", description="Sort column (mercator_inflation, distortion_index_pct, sphere_area_visible_km2, pri, visual_power_gap_pp)"),
    order: str = Query("desc", description="Sort direction (asc or desc)"),
    limit: int = Query(100, ge=1, le=300),
    offset: int = Query(0, ge=0)
):
    allowed_sort_cols = {
        "mercator_inflation": "mercator_inflation",
        "distortion_index_pct": "distortion_index_pct",
        "sphere_area_visible_km2": "sphere_area_visible_km2",
        "pri": "pri",
        "visual_power_gap_pp": "visual_power_gap_pp",
        "display_name": "display_name"
    }
    
    sort_col = allowed_sort_cols.get(sort, "mercator_inflation")
    sort_order = "ASC" if order.lower() == "asc" else "DESC"
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    query = "SELECT entity_id, display_name, iso3, region_id, region_name, sphere_area_visible_km2, mercator_area_km2, equal_earth_area_km2, mercator_inflation, distortion_index_pct, land_share, mercator_map_share, pri, visual_power_gap_pp FROM entities WHERE visible_fraction >= 0.999"
    params = []
    
    if region:
        query += " AND region_id = ?"
        params.append(region)
        
    query += f" ORDER BY {sort_col} {sort_order}, entity_id ASC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    cur.execute(query, params)
    rows = cur.fetchall()
    conn.close()
    
    return {
        "data": [dict(r) for r in rows],
        "meta": {
            "projection": projection,
            "sort_by": sort_col,
            "order": sort_order,
            "returned_count": len(rows)
        }
    }

@app.get("/api/v1/compare", tags=["Comparison"])
def compare_entities(
    a: str = Query(..., description="First entity ID (e.g. GRL)"),
    b: str = Query(..., description="Second entity ID (e.g. COD)"),
    projection: str = Query("mercator"),
    year: int = Query(2024)
):
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("SELECT * FROM entities WHERE entity_id = ?", (a.upper(),))
    row_a = cur.fetchone()
    cur.execute("SELECT * FROM entities WHERE entity_id = ?", (b.upper(),))
    row_b = cur.fetchone()
    
    if not row_a or not row_b:
        conn.close()
        raise HTTPException(status_code=404, detail="One or both entity IDs not found")
        
    ea = dict(row_a)
    eb = dict(row_b)
    
    true_area_ratio = ea["sphere_area_visible_km2"] / eb["sphere_area_visible_km2"] if eb["sphere_area_visible_km2"] > 0 else 0
    apparent_ratio = (ea["mercator_area_km2"] / eb["mercator_area_km2"]) if projection == "mercator" else (ea["equal_earth_area_km2"] / eb["equal_earth_area_km2"])
    ratio_bias = apparent_ratio / true_area_ratio if true_area_ratio > 0 else 0
    
    # Fetch metrics for comparison
    cur.execute("SELECT metric_id, value, unit FROM observations WHERE entity_id = ? AND year = ?", (ea["entity_id"], year))
    obs_a = {r["metric_id"]: r["value"] for r in cur.fetchall()}
    
    cur.execute("SELECT metric_id, value, unit FROM observations WHERE entity_id = ? AND year = ?", (eb["entity_id"], year))
    obs_b = {r["metric_id"]: r["value"] for r in cur.fetchall()}
    
    conn.close()
    
    metrics_comparison = {}
    for m in ["population", "gdp", "land_area", "forest_area", "co2_emissions"]:
        va = obs_a.get(m)
        vb = obs_b.get(m)
        ratio = (va / vb) if (va is not None and vb is not None and vb > 0) else None
        metrics_comparison[m] = {"value_a": va, "value_b": vb, "ratio_a_to_b": ratio}
        
    return {
        "data": {
            "entity_a": ea,
            "entity_b": eb,
            "true_area_ratio": true_area_ratio,
            "apparent_ratio": apparent_ratio,
            "ratio_bias": ratio_bias,
            "projection": projection,
            "year": year,
            "metrics_comparison": metrics_comparison
        },
        "meta": {"release_id": settings.release_id}
    }

@app.get("/api/v1/metrics", tags=["Metrics"])
def get_metrics_list():
    metrics = [
        {
            "metric_id": "boundary_area",
            "label": "Boundary Area (Spherical Model)",
            "unit": "km²",
            "definition": "Spherical surface area integrated over 1:50m cartographic boundary.",
            "additive": True,
            "source_id": "natural_earth",
            "default_year": 2024,
            "available_years": [2024]
        },
        {
            "metric_id": "land_area",
            "label": "Reported Land Area",
            "unit": "km²",
            "definition": "Official statistical land area (excluding inland water bodies), World Bank AG.LND.TOTL.K2.",
            "additive": True,
            "source_id": "world_bank_wdi",
            "default_year": 2024,
            "available_years": list(range(2000, 2025))
        },
        {
            "metric_id": "population",
            "label": "Total Population",
            "unit": "persons",
            "definition": "Total midyear resident population count, World Bank SP.POP.TOTL.",
            "additive": True,
            "source_id": "world_bank_wdi",
            "default_year": 2024,
            "available_years": list(range(2000, 2025))
        },
        {
            "metric_id": "gdp",
            "label": "Nominal GDP",
            "unit": "current US$",
            "definition": "Gross domestic product in current nominal US dollars, World Bank NY.GDP.MKTP.CD.",
            "additive": True,
            "source_id": "world_bank_wdi",
            "default_year": 2024,
            "available_years": list(range(2000, 2025))
        },
        {
            "metric_id": "co2_emissions",
            "label": "Territorial CO2 Emissions",
            "unit": "tonnes",
            "definition": "Annual territorial fossil fuel and industrial carbon dioxide emissions, OWID / Global Carbon Budget.",
            "additive": True,
            "source_id": "owid_co2",
            "default_year": 2024,
            "available_years": list(range(2000, 2025))
        },
        {
            "metric_id": "forest_area",
            "label": "Forest Area",
            "unit": "km²",
            "definition": "Land spanning more than 0.5 hectares with trees higher than 5 meters, World Bank AG.LND.FRST.K2.",
            "additive": True,
            "source_id": "world_bank_wdi",
            "default_year": 2024,
            "available_years": list(range(2000, 2025))
        },
        {
            "metric_id": "resource_rents",
            "label": "Natural Resource Rents",
            "unit": "% of GDP",
            "definition": "Total natural resources rents (oil, gas, coal, mineral, forest) as a percentage of GDP, World Bank NY.GDP.TOTL.RT.ZS.",
            "additive": False,
            "source_id": "world_bank_wdi",
            "default_year": 2024,
            "available_years": list(range(2000, 2025))
        }
    ]
    return {"data": metrics, "meta": {"count": len(metrics)}}

@app.get("/api/v1/observations", tags=["Metrics"])
def get_observations(
    metric: str = Query(..., description="Metric ID"),
    year: int = Query(2024, description="Year (2000 - 2024)")
):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT o.entity_id, e.display_name, e.region_id, e.region_name, o.metric_id, o.year, o.value, o.unit, o.quality_flag
        FROM observations o
        JOIN entities e ON o.entity_id = e.entity_id
        WHERE o.metric_id = ? AND o.year = ?
        ORDER BY o.value DESC
        """,
        (metric, year)
    )
    rows = cur.fetchall()
    conn.close()
    
    total_val = sum(r["value"] for r in rows if r["value"] is not None)
    return {
        "data": [dict(r) for r in rows],
        "meta": {
            "metric": metric,
            "year": year,
            "eligible_count": len(rows),
            "total_value": total_val
        }
    }

@app.get("/api/v1/world", tags=["Cartogram"])
def get_world_cartogram_data(
    metric: str = Query("population", description="Metric ID for circle sizing"),
    year: int = Query(2024, description="Year")
):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT e.entity_id, e.display_name, e.iso3, e.region_id, e.region_name,
               e.centroid_lon, e.centroid_lat, e.sphere_area_visible_km2,
               o.value as metric_value, o.unit as metric_unit
        FROM entities e
        LEFT JOIN observations o ON e.entity_id = o.entity_id AND o.metric_id = ? AND o.year = ?
        """,
        (metric, year)
    )
    rows = cur.fetchall()
    conn.close()
    
    total_metric_value = sum(r["metric_value"] for r in rows if r["metric_value"] is not None and r["metric_value"] > 0)
    
    items = []
    for r in rows:
        val = r["metric_value"] if metric != "boundary_area" else r["sphere_area_visible_km2"]
        share = (val / total_metric_value) if (val and total_metric_value > 0) else 0
        items.append({
            "entity_id": r["entity_id"],
            "display_name": r["display_name"],
            "iso3": r["iso3"],
            "region_id": r["region_id"],
            "region_name": r["region_name"],
            "centroid_lon": r["centroid_lon"],
            "centroid_lat": r["centroid_lat"],
            "sphere_area_km2": r["sphere_area_visible_km2"],
            "metric_value": val,
            "metric_unit": r["metric_unit"] or "km²",
            "metric_share": share,
            "has_data": val is not None and val > 0
        })
        
    return {
        "data": items,
        "meta": {
            "metric": metric,
            "year": year,
            "total_metric_value": total_metric_value,
            "total_entities": len(items)
        }
    }

@app.post("/api/v1/experiments/move", tags=["Experiments"])
def move_country_experiment(req: MoveExperimentRequest):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM entities WHERE entity_id = ?", (req.entity_id.upper(),))
    row = cur.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail=f"Entity '{req.entity_id}' not found")
        
    e = dict(row)
    orig_lon = e["centroid_lon"]
    orig_lat = e["centroid_lat"]
    dest_lon = req.destination_lon
    dest_lat = req.destination_lat
    
    # Analytical Mercator area multiplier J(lat) = sec^2(lat) = 1/cos^2(lat)
    orig_cos = math.cos(math.radians(orig_lat))
    dest_cos = math.cos(math.radians(dest_lat))
    
    orig_af = e["mercator_inflation"]
    # Relative scaling factor based on destination latitude vs original latitude
    dest_local_j = 1.0 / (dest_cos * dest_cos) if abs(dest_lat) < 85.0 else 33.16
    orig_local_j = 1.0 / (orig_cos * orig_cos) if abs(orig_lat) < 85.0 else 1.0
    
    moved_af = orig_af * (dest_local_j / orig_local_j) if req.projection == "mercator" else 1.0002
    
    spherical_area = e["sphere_area_visible_km2"]
    orig_planar_area = e["mercator_area_km2"] if req.projection == "mercator" else e["equal_earth_area_km2"]
    moved_planar_area = spherical_area * moved_af
    
    exceeds_clip = abs(dest_lat) > 85.0
    
    return {
        "data": {
            "entity_id": e["entity_id"],
            "original_centroid": [orig_lon, orig_lat],
            "destination_anchor": [dest_lon, dest_lat],
            "spherical_area_km2": spherical_area,
            "original_planar_area_km2": orig_planar_area,
            "moved_planar_area_km2": moved_planar_area,
            "original_af": orig_af,
            "moved_af": moved_af,
            "exceeds_clip_bounds": exceeds_clip,
            "max_abs_latitude": abs(dest_lat)
        },
        "meta": {"projection": req.projection, "method": "shortest_arc_rigid_sphere_quaternion"}
    }
