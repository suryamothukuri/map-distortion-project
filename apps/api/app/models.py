from typing import Optional, Any
from pydantic import BaseModel, Field

class ResponseEnvelope(BaseModel):
    data: Any
    meta: dict[str, Any]

class CountryModel(BaseModel):
    entity_id: str
    display_name: str
    iso3: Optional[str] = None
    region_id: str
    region_name: str
    sovereign_id: Optional[str] = None
    entity_type: str
    centroid_lon: float
    centroid_lat: float
    sphere_area_full_km2: float
    sphere_area_visible_km2: float
    mercator_area_km2: float
    equal_earth_area_km2: float
    mercator_inflation: float
    distortion_index_pct: float
    visible_fraction: float
    numerical_error_pct: float
    land_share: float
    mercator_map_share: float
    pri: Optional[float] = None
    visual_power_gap_pp: float

class ObservationModel(BaseModel):
    entity_id: str
    metric_id: str
    year: int
    value: Optional[float] = None
    unit: str
    quality_flag: Optional[str] = None

class MoveExperimentRequest(BaseModel):
    entity_id: str
    destination_lon: float = Field(..., ge=-180.0, le=180.0)
    destination_lat: float = Field(..., ge=-85.0, le=85.0)
    projection: str = Field(default="mercator")

class MoveExperimentResponse(BaseModel):
    entity_id: str
    original_centroid: list[float]
    destination_anchor: list[float]
    spherical_area_km2: float
    original_planar_area_km2: float
    moved_planar_area_km2: float
    original_af: float
    moved_af: float
    exceeds_clip_bounds: bool
    max_abs_latitude: float
