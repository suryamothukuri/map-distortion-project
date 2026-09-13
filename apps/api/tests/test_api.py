import pytest
from fastapi.testclient import TestClient
from apps.api.app.main import app

client = TestClient(app)

def test_healthz():
    res = client.get("/healthz")
    assert res.status_code == 200
    assert res.json() == {"status": "healthy"}

def test_readyz():
    res = client.get("/readyz")
    assert res.status_code == 200
    assert res.json()["status"] == "ready"

def test_meta():
    res = client.get("/api/v1/meta")
    assert res.status_code == 200
    data = res.json()["data"]
    assert "headline_ratios" in data
    assert data["headline_ratios"]["africa_greenland_true_ratio"] > 13.0

def test_projections():
    res = client.get("/api/v1/projections")
    assert res.status_code == 200
    data = res.json()["data"]
    proj_ids = [p["id"] for p in data]
    assert "mercator" in proj_ids
    assert "equal_earth" in proj_ids

def test_countries():
    res = client.get("/api/v1/countries")
    assert res.status_code == 200
    countries = res.json()["data"]
    assert len(countries) >= 20
    grl = next(c for c in countries if c["entity_id"] == "GRL")
    assert grl["display_name"] == "Greenland"
    assert grl["mercator_inflation"] > 8.0

def test_country_detail():
    res = client.get("/api/v1/countries/GRL")
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["entity_id"] == "GRL"
    assert "latest_observations" in data

def test_distortion_ranking():
    res = client.get("/api/v1/distortion?order=desc")
    assert res.status_code == 200
    data = res.json()["data"]
    # Greenland or high-latitude country should be near top
    assert data[0]["mercator_inflation"] >= data[-1]["mercator_inflation"]

def test_compare():
    res = client.get("/api/v1/compare?a=GRL&b=COD")
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["entity_a"]["entity_id"] == "GRL"
    assert data["entity_b"]["entity_id"] == "COD"
    assert "true_area_ratio" in data
    assert "apparent_ratio" in data

def test_move_experiment():
    payload = {
        "entity_id": "GRL",
        "destination_lon": 20.0,
        "destination_lat": 0.0,
        "projection": "mercator"
    }
    res = client.post("/api/v1/experiments/move", json=payload)
    assert res.status_code == 200
    data = res.json()["data"]
    # At equator (0° lat), Mercator AF should shrink drastically compared to original Greenland (72° lat)
    assert data["moved_af"] < data["original_af"]
