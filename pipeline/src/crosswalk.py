"""
Entity crosswalk definitions and mapping rules.
"""
import os
import csv

CROSSWALK_CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "config", "entity_crosswalk.csv")

def ensure_crosswalk_exists():
    os.makedirs(os.path.dirname(CROSSWALK_CSV_PATH), exist_ok=True)
    if os.path.exists(CROSSWALK_CSV_PATH):
        return
        
    # Generate canonical crosswalk with key countries and territories
    entities = [
        # entity_id, display_name, iso3, region_id, region_name, sovereign_id, entity_type, match_status, scope_relation, notes
        ("GRL", "Greenland", "GRL", "north_america", "North America", "DNK", "territory", "matched", "exact", "Autonomous territory within the Kingdom of Denmark"),
        ("CAN", "Canada", "CAN", "north_america", "North America", None, "country", "matched", "exact", "Sovereign state"),
        ("USA", "United States", "USA", "north_america", "North America", None, "country", "matched", "exact", "Sovereign state (50 states + DC)"),
        ("MEX", "Mexico", "MEX", "latin_america", "Latin America & Caribbean", None, "country", "matched", "exact", "Sovereign state"),
        ("BRA", "Brazil", "BRA", "latin_america", "Latin America & Caribbean", None, "country", "matched", "exact", "Sovereign state"),
        ("ARG", "Argentina", "ARG", "latin_america", "Latin America & Caribbean", None, "country", "matched", "exact", "Sovereign state"),
        ("CHL", "Chile", "CHL", "latin_america", "Latin America & Caribbean", None, "country", "matched", "exact", "Sovereign state"),
        ("COL", "Colombia", "COL", "latin_america", "Latin America & Caribbean", None, "country", "matched", "exact", "Sovereign state"),
        ("PER", "Peru", "PER", "latin_america", "Latin America & Caribbean", None, "country", "matched", "exact", "Sovereign state"),
        ("VEN", "Venezuela", "VEN", "latin_america", "Latin America & Caribbean", None, "country", "matched", "exact", "Sovereign state"),
        ("RUS", "Russia", "RUS", "europe", "Europe", None, "country", "matched", "exact", "Transcontinental sovereign state (categorized under Europe per Natural Earth)"),
        ("GBR", "United Kingdom", "GBR", "europe", "Europe", None, "country", "matched", "exact", "Sovereign state"),
        ("FRA", "France", "FRA", "europe", "Europe", None, "country", "matched", "exact", "Metropolitan France"),
        ("DEU", "Germany", "DEU", "europe", "Europe", None, "country", "matched", "exact", "Sovereign state"),
        ("ITA", "Italy", "ITA", "europe", "Europe", None, "country", "matched", "exact", "Sovereign state"),
        ("ESP", "Spain", "ESP", "europe", "Europe", None, "country", "matched", "exact", "Sovereign state"),
        ("NOR", "Norway", "NOR", "europe", "Europe", None, "country", "matched", "exact", "Sovereign state"),
        ("SWE", "Sweden", "SWE", "europe", "Europe", None, "country", "matched", "exact", "Sovereign state"),
        ("FIN", "Finland", "FIN", "europe", "Europe", None, "country", "matched", "exact", "Sovereign state"),
        ("ISL", "Iceland", "ISL", "europe", "Europe", None, "country", "matched", "exact", "Sovereign state"),
        ("UKR", "Ukraine", "UKR", "europe", "Europe", None, "country", "matched", "exact", "Sovereign state"),
        ("POL", "Poland", "POL", "europe", "Europe", None, "country", "matched", "exact", "Sovereign state"),
        ("COD", "Dem. Rep. Congo", "COD", "africa", "Africa", None, "country", "matched", "exact", "Sovereign state"),
        ("NGA", "Nigeria", "NGA", "africa", "Africa", None, "country", "matched", "exact", "Sovereign state"),
        ("EGY", "Egypt", "EGY", "africa", "Africa", None, "country", "matched", "exact", "Sovereign state"),
        ("ZAF", "South Africa", "ZAF", "africa", "Africa", None, "country", "matched", "exact", "Sovereign state"),
        ("ETH", "Ethiopia", "ETH", "africa", "Africa", None, "country", "matched", "exact", "Sovereign state"),
        ("KEN", "Kenya", "KEN", "africa", "Africa", None, "country", "matched", "exact", "Sovereign state"),
        ("TZA", "Tanzania", "TZA", "africa", "Africa", None, "country", "matched", "exact", "Sovereign state"),
        ("DZA", "Algeria", "DZA", "africa", "Africa", None, "country", "matched", "exact", "Sovereign state"),
        ("SDN", "Sudan", "SDN", "africa", "Africa", None, "country", "matched", "exact", "Sovereign state"),
        ("MAR", "Morocco", "MAR", "africa", "Africa", None, "country", "matched", "exact", "Sovereign state"),
        ("GHA", "Ghana", "GHA", "africa", "Africa", None, "country", "matched", "exact", "Sovereign state"),
        ("CHN", "China", "CHN", "asia", "Asia", None, "country", "matched", "exact", "Sovereign state (Mainland)"),
        ("IND", "India", "IND", "asia", "Asia", None, "country", "matched", "exact", "Sovereign state"),
        ("IDN", "Indonesia", "IDN", "asia", "Asia", None, "country", "matched", "exact", "Archipelagic sovereign state"),
        ("JPN", "Japan", "JPN", "asia", "Asia", None, "country", "matched", "exact", "Sovereign state"),
        ("KOR", "South Korea", "KOR", "asia", "Asia", None, "country", "matched", "exact", "Sovereign state"),
        ("SAU", "Saudi Arabia", "SAU", "asia", "Asia", None, "country", "matched", "exact", "Sovereign state"),
        ("TUR", "Türkiye", "TUR", "asia", "Asia", None, "country", "matched", "exact", "Transcontinental sovereign state"),
        ("IRN", "Iran", "IRN", "asia", "Asia", None, "country", "matched", "exact", "Sovereign state"),
        ("PAK", "Pakistan", "PAK", "asia", "Asia", None, "country", "matched", "exact", "Sovereign state"),
        ("BGD", "Bangladesh", "BGD", "asia", "Asia", None, "country", "matched", "exact", "Sovereign state"),
        ("VNM", "Vietnam", "VNM", "asia", "Asia", None, "country", "matched", "exact", "Sovereign state"),
        ("THA", "Thailand", "THA", "asia", "Asia", None, "country", "matched", "exact", "Sovereign state"),
        ("MYS", "Malaysia", "MYS", "asia", "Asia", None, "country", "matched", "exact", "Sovereign state"),
        ("PHL", "Philippines", "PHL", "asia", "Asia", None, "country", "matched", "exact", "Sovereign state"),
        ("KAZ", "Kazakhstan", "KAZ", "asia", "Asia", None, "country", "matched", "exact", "Sovereign state"),
        ("AUS", "Australia", "AUS", "oceania", "Oceania", None, "country", "matched", "exact", "Sovereign continent/state"),
        ("NZL", "New Zealand", "NZL", "oceania", "Oceania", None, "country", "matched", "exact", "Sovereign state"),
        ("PNG", "Papua New Guinea", "PNG", "oceania", "Oceania", None, "country", "matched", "exact", "Sovereign state"),
        ("FJI", "Fiji", "FJI", "oceania", "Oceania", None, "country", "matched", "exact", "Sovereign island state spanning antimeridian (180°)"),
    ]
    
    with open(CROSSWALK_CSV_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["entity_id", "display_name", "iso3", "region_id", "region_name", "sovereign_id", "entity_type", "match_status", "scope_relation", "notes"])
        writer.writerows(entities)

if __name__ == "__main__":
    ensure_crosswalk_exists()
    print(f"Crosswalk written to {CROSSWALK_CSV_PATH}")
