"""
Generates compact GeoJSON features for world countries and map outlines.
"""
import os
import json

RELEASE_ID = "rel-2026-v1"
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
WEB_PUBLIC_DATA_DIR = os.path.join(BASE_DIR, "apps", "web", "public", "data", RELEASE_ID)

# Simplified representative real boundary coordinates for key entities
# Structured as GeoJSON FeatureCollection
def get_country_polygons():
    features = [
        {
            "type": "Feature",
            "id": "GRL",
            "properties": {"name": "Greenland", "iso3": "GRL", "region": "north_america"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-42.5, 59.8], [-44.0, 60.5], [-50.0, 64.0], [-53.5, 68.5],
                    [-58.0, 71.5], [-55.0, 76.0], [-68.0, 77.5], [-65.0, 81.0],
                    [-45.0, 83.5], [-25.0, 83.0], [-18.0, 81.5], [-20.0, 76.5],
                    [-22.0, 70.5], [-35.0, 65.5], [-42.5, 59.8]
                ]]
            }
        },
        {
            "type": "Feature",
            "id": "COD",
            "properties": {"name": "Dem. Rep. Congo", "iso3": "COD", "region": "africa"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [12.2, -5.8], [17.5, -4.5], [18.0, 3.5], [23.5, 4.0],
                    [28.0, 4.5], [30.5, 3.5], [29.5, -1.0], [29.0, -5.0],
                    [29.5, -8.0], [28.5, -12.5], [24.0, -11.0], [22.0, -7.5],
                    [16.5, -6.0], [12.2, -5.8]
                ]]
            }
        },
        {
            "type": "Feature",
            "id": "CAN",
            "properties": {"name": "Canada", "iso3": "CAN", "region": "north_america"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-141.0, 69.5], [-130.0, 70.0], [-115.0, 69.0], [-95.0, 69.0],
                    [-85.0, 65.0], [-78.0, 62.5], [-65.0, 59.0], [-55.5, 51.5],
                    [-64.0, 45.0], [-67.0, 45.0], [-74.0, 45.0], [-82.0, 42.0],
                    [-95.0, 49.0], [-123.0, 49.0], [-130.0, 55.0], [-141.0, 60.0],
                    [-141.0, 69.5]
                ]]
            }
        },
        {
            "type": "Feature",
            "id": "USA",
            "properties": {"name": "United States", "iso3": "USA", "region": "north_america"},
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    # Lower 48
                    [[
                        [-124.5, 48.5], [-123.0, 49.0], [-95.0, 49.0], [-82.0, 42.0],
                        [-74.0, 45.0], [-67.0, 45.0], [-71.0, 42.0], [-75.0, 35.0],
                        [-80.0, 25.0], [-87.5, 30.5], [-97.0, 26.0], [-106.5, 31.8],
                        [-114.5, 32.5], [-117.0, 32.5], [-124.5, 48.5]
                    ]],
                    # Alaska
                    [[
                        [-168.0, 65.5], [-155.0, 71.0], [-141.0, 69.5], [-141.0, 60.0],
                        [-135.0, 57.0], [-152.0, 58.0], [-165.0, 54.5], [-168.0, 65.5]
                    ]]
                ]
            }
        },
        {
            "type": "Feature",
            "id": "BRA",
            "properties": {"name": "Brazil", "iso3": "BRA", "region": "latin_america"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-51.0, 4.0], [-35.0, -5.0], [-35.0, -8.0], [-40.0, -18.0],
                    [-48.0, -28.0], [-53.5, -33.5], [-57.5, -30.0], [-58.0, -22.0],
                    [-65.0, -10.0], [-73.5, -7.0], [-70.0, 1.5], [-60.0, 5.0],
                    [-51.0, 4.0]
                ]]
            }
        },
        {
            "type": "Feature",
            "id": "RUS",
            "properties": {"name": "Russia", "iso3": "RUS", "region": "europe"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [30.0, 60.0], [40.0, 68.0], [60.0, 70.0], [80.0, 73.0],
                    [105.0, 77.5], [140.0, 73.0], [170.0, 69.0], [179.9, 66.0],
                    [170.0, 60.0], [140.0, 50.0], [130.0, 43.0], [115.0, 50.0],
                    [85.0, 51.0], [55.0, 51.0], [38.0, 48.0], [30.0, 60.0]
                ]]
            }
        },
        {
            "type": "Feature",
            "id": "CHN",
            "properties": {"name": "China", "iso3": "CHN", "region": "asia"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [75.0, 38.0], [80.0, 45.0], [90.0, 47.0], [115.0, 50.0],
                    [125.0, 53.0], [131.0, 45.0], [122.0, 40.0], [120.0, 32.0],
                    [118.0, 24.0], [110.0, 20.0], [105.0, 22.0], [100.0, 22.0],
                    [90.0, 28.0], [80.0, 32.0], [75.0, 38.0]
                ]]
            }
        },
        {
            "type": "Feature",
            "id": "IND",
            "properties": {"name": "India", "iso3": "IND", "region": "asia"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [74.0, 35.5], [78.0, 32.0], [88.0, 27.5], [96.0, 28.0],
                    [92.0, 22.0], [87.0, 21.5], [80.0, 13.0], [77.5, 8.0],
                    [73.5, 15.0], [69.0, 23.0], [71.0, 28.0], [74.0, 35.5]
                ]]
            }
        },
        {
            "type": "Feature",
            "id": "AUS",
            "properties": {"name": "Australia", "iso3": "AUS", "region": "oceania"},
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    # Mainland
                    [[
                        [114.0, -22.0], [122.0, -16.5], [136.0, -12.0], [142.5, -11.0],
                        [150.0, -22.0], [153.5, -28.0], [150.0, -37.5], [141.0, -38.5],
                        [130.0, -31.5], [115.0, -34.0], [113.0, -26.0], [114.0, -22.0]
                    ]],
                    # Tasmania
                    [[
                        [145.0, -41.0], [148.0, -41.0], [147.5, -43.5], [145.0, -43.0], [145.0, -41.0]
                    ]]
                ]
            }
        },
        {
            "type": "Feature",
            "id": "NOR",
            "properties": {"name": "Norway", "iso3": "NOR", "region": "europe"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [5.0, 62.0], [10.0, 64.0], [15.0, 68.5], [25.0, 71.0],
                    [31.0, 70.5], [28.0, 69.0], [20.0, 68.0], [12.0, 63.0],
                    [11.0, 59.0], [8.0, 58.0], [5.0, 62.0]
                ]]
            }
        },
        {
            "type": "Feature",
            "id": "SWE",
            "properties": {"name": "Sweden", "iso3": "SWE", "region": "europe"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [12.0, 56.0], [16.0, 56.0], [19.0, 60.0], [24.0, 65.5],
                    [20.0, 68.5], [14.0, 64.0], [12.0, 60.0], [12.0, 56.0]
                ]]
            }
        },
        {
            "type": "Feature",
            "id": "ISL",
            "properties": {"name": "Iceland", "iso3": "ISL", "region": "europe"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-24.0, 65.5], [-22.0, 66.5], [-16.0, 66.5], [-13.5, 65.0],
                    [-15.0, 64.0], [-19.0, 63.5], [-22.5, 64.0], [-24.0, 65.5]
                ]]
            }
        },
        {
            "type": "Feature",
            "id": "GBR",
            "properties": {"name": "United Kingdom", "iso3": "GBR", "region": "europe"},
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    # Great Britain
                    [[
                        [-5.5, 50.0], [0.5, 51.0], [1.5, 52.5], [0.0, 54.0],
                        [-2.0, 57.0], [-4.0, 58.5], [-5.5, 56.5], [-3.0, 53.5],
                        [-5.0, 51.5], [-5.5, 50.0]
                    ]],
                    # Northern Ireland
                    [[
                        [-8.0, 54.5], [-6.0, 55.0], [-5.5, 54.5], [-6.5, 54.0], [-8.0, 54.5]
                    ]]
                ]
            }
        },
        {
            "type": "Feature",
            "id": "FRA",
            "properties": {"name": "France", "iso3": "FRA", "region": "europe"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-4.5, 48.5], [1.0, 50.0], [2.5, 51.0], [7.5, 49.0],
                    [7.0, 46.0], [6.5, 43.5], [3.0, 43.0], [-1.5, 43.5],
                    [-1.0, 46.0], [-4.5, 48.5]
                ]]
            }
        },
        {
            "type": "Feature",
            "id": "DEU",
            "properties": {"name": "Germany", "iso3": "DEU", "region": "europe"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [6.0, 50.5], [8.5, 54.0], [9.5, 55.0], [14.0, 54.0],
                    [14.5, 51.0], [13.0, 48.5], [10.0, 47.5], [7.5, 48.0],
                    [6.0, 50.5]
                ]]
            }
        },
        {
            "type": "Feature",
            "id": "NGA",
            "properties": {"name": "Nigeria", "iso3": "NGA", "region": "africa"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [3.0, 6.5], [4.5, 13.5], [13.5, 13.5], [14.5, 11.5],
                    [9.5, 4.5], [5.0, 5.0], [3.0, 6.5]
                ]]
            }
        },
        {
            "type": "Feature",
            "id": "EGY",
            "properties": {"name": "Egypt", "iso3": "EGY", "region": "africa"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [25.0, 31.5], [31.5, 31.5], [34.0, 31.0], [35.5, 28.0],
                    [36.5, 22.0], [25.0, 22.0], [25.0, 31.5]
                ]]
            }
        },
        {
            "type": "Feature",
            "id": "ZAF",
            "properties": {"name": "South Africa", "iso3": "ZAF", "region": "africa"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [17.0, -29.0], [20.0, -27.0], [27.0, -22.0], [31.5, -22.0],
                    [32.5, -28.0], [28.0, -32.5], [20.0, -34.8], [18.0, -34.0],
                    [17.0, -29.0]
                ]]
            }
        },
        {
            "type": "Feature",
            "id": "IDN",
            "properties": {"name": "Indonesia", "iso3": "IDN", "region": "asia"},
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    # Sumatra
                    [[[95.5, 5.5], [100.0, 2.0], [106.0, -6.0], [102.0, -4.0], [95.5, 5.5]]],
                    # Java
                    [[[105.5, -6.0], [114.5, -7.5], [114.0, -8.5], [106.0, -7.5], [105.5, -6.0]]],
                    # Borneo / Kalimantan
                    [[[109.0, 1.0], [117.0, 3.5], [117.5, -4.0], [111.0, -3.5], [109.0, 1.0]]],
                    # Papua
                    [[[131.0, -1.0], [141.0, -2.5], [141.0, -9.0], [135.0, -5.0], [131.0, -1.0]]]
                ]
            }
        },
        {
            "type": "Feature",
            "id": "JPN",
            "properties": {"name": "Japan", "iso3": "JPN", "region": "asia"},
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    # Honshu
                    [[[131.0, 34.0], [136.0, 35.5], [141.0, 38.0], [141.0, 41.5], [139.0, 35.0], [131.0, 34.0]]],
                    # Hokkaido
                    [[[140.0, 42.0], [145.5, 44.0], [144.0, 43.0], [140.5, 41.5], [140.0, 42.0]]]
                ]
            }
        },
        {
            "type": "Feature",
            "id": "NZL",
            "properties": {"name": "New Zealand", "iso3": "NZL", "region": "oceania"},
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    # North Island
                    [[[173.0, -35.0], [178.0, -37.5], [176.0, -41.5], [174.5, -39.0], [173.0, -35.0]]],
                    # South Island
                    [[[174.0, -41.0], [174.0, -43.0], [170.0, -46.5], [166.5, -46.0], [171.0, -42.0], [174.0, -41.0]]]
                ]
            }
        },
        {
            "type": "Feature",
            "id": "ARG",
            "properties": {"name": "Argentina", "iso3": "ARG", "region": "latin_america"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-66.0, -22.0], [-58.0, -22.0], [-54.0, -26.0], [-58.0, -34.0],
                    [-63.0, -40.0], [-66.0, -47.0], [-68.0, -54.5], [-72.0, -50.0],
                    [-70.0, -35.0], [-69.0, -25.0], [-66.0, -22.0]
                ]]
            }
        },
        {
            "type": "Feature",
            "id": "CHL",
            "properties": {"name": "Chile", "iso3": "CHL", "region": "latin_america"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-70.0, -18.0], [-67.0, -23.0], [-69.0, -35.0], [-72.0, -45.0],
                    [-74.0, -54.0], [-68.0, -55.0], [-71.0, -45.0], [-70.0, -30.0],
                    [-70.0, -18.0]
                ]]
            }
        },
        {
            "type": "Feature",
            "id": "FJI",
            "properties": {"name": "Fiji", "iso3": "FJI", "region": "oceania"},
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    # Viti Levu & Vanua Levu (spanning antimeridian)
                    [[[177.0, -18.0], [178.5, -17.5], [178.5, -18.5], [177.0, -18.0]]],
                    [[[179.0, -16.5], [-179.5, -16.5], [-179.5, -17.0], [179.0, -17.0], [179.0, -16.5]]]
                ]
            }
        }
    ]
    return {"type": "FeatureCollection", "features": features}

geo_collection = get_country_polygons()

geo_path = os.path.join(WEB_PUBLIC_DATA_DIR, "world_geo.json")
with open(geo_path, "w", encoding="utf-8") as f:
    json.dump(geo_collection, f, indent=2)

print(f"Generated world_geo.json with {len(geo_collection['features'])} vector features.")
