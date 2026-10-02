"""
Integration and Validation Test Suite for Aquora Marine Debris Triage Backend
Verifies Big Data NetCDF ingestion, Sentinel-2 spectral analysis, Lagrangian RK4 drift forecasting,
and SAMUDRA 2.0 multilingual operational advisories.
"""

import os
import sys
import json
import xarray as xr
from starlette.testclient import TestClient

# Import FastAPI app and ingestion streamer
from main import app
from services.bigdata_ingest import streamer, LOCAL_ROMS_NC_PATH
from services.spectral_engine import LOCAL_S2_NC_PATH

client = TestClient(app)

def run_tests():
    print("=" * 80)
    print(">>> AQUORA REAL-WORLD BIG DATA & SPECTRAL TRIAGE ENGINE -- TEST SUITE")
    print("    Target Incident: MSC ELSA 3 (Kochi Shelf, Kerala)")
    print("    Data Providers: INCOIS ROMS OPeNDAP / Copernicus + Sentinel-2 L2A BOA Multi-Spectral")
    print("=" * 80)
    
    total_passed = 0
    total_tests = 8

    # 1. Test NetCDF Big Data Streamer
    print("\n[1/6] Testing NetCDF Big Data Streamer (xarray / INCOIS ROMS) ...")
    ds = streamer.open_stream()
    assert isinstance(ds, xr.Dataset), "Streamer must return an xarray.Dataset"
    assert "u" in ds and "v" in ds and "hs" in ds and "wind_u10" in ds, "NetCDF must contain u, v, hs, wind_u10 variables"
    print(f"  [PASS] xarray Dataset loaded successfully ({len(ds.data_vars)} variables, {len(ds.coords)} dimensions)")
    print(f"  [PASS] Domain Bounds: Lat [{float(ds.lat.min()):.2f}, {float(ds.lat.max()):.2f}], Lon [{float(ds.lon.min()):.2f}, {float(ds.lon.max()):.2f}]")
    print(f"  [PASS] NetCDF Cache File Size: {os.path.getsize(LOCAL_ROMS_NC_PATH)} bytes")
    total_passed += 1

    # 2. Test /health
    print("\n[2/6] Testing Health Check: GET /health ...")
    r_health = client.get("/health")
    assert r_health.status_code == 200, f"Health check failed with {r_health.status_code}"
    health_data = r_health.json()
    assert health_data["status"] == "healthy"
    assert "incois_bigdata_streamer" in health_data["subsystems"]
    print(f"  [PASS] Status: {health_data['status']}")
    print(f"  [PASS] Subsystems: {json.dumps(health_data['subsystems'])}")
    total_passed += 1

    # 3. Test /api/detections
    print("\n[3/6] Testing Sentinel-2 L2A Multi-Spectral Extraction: GET /api/detections ...")
    r_det = client.get("/api/detections?min_concentration=0.20")
    assert r_det.status_code == 200, f"Detections failed with {r_det.status_code}"
    det_data = r_det.json()
    assert det_data["type"] == "FeatureCollection", "Detections must return a GeoJSON FeatureCollection"
    assert len(det_data["features"]) > 0, "Detections should contain detected slick features"
    
    sample_poly = next((f for f in det_data["features"] if f["geometry"]["type"] == "Polygon"), None)
    assert sample_poly is not None, "Must contain Polygon feature"
    props = sample_poly["properties"]
    assert "hotspot_id" in props
    assert "concentration" in props
    assert "ESI_score" in props
    assert "priority_score" in props
    assert "fdi_max" in props
    assert "ndvi_mean" in props
    assert "recommended_action" in props
    
    print(f"  [PASS] GeoJSON FeatureCollection: {len(det_data['features'])} features (Polygons + Centroid Markers)")
    print(f"  [PASS] Primary Hotspot ID: {props['hotspot_id']}")
    print(f"  [PASS] Polymer Concentration: {props['concentration']*100:.1f}% (FDI: {props['fdi_max']}, NDVI: {props['ndvi_mean']})")
    print(f"  [PASS] ESI Score: {props['ESI_score']}/10.0 ({props['habitat_vulnerability']})")
    print(f"  [PASS] Priority Score P(x,y): {props['priority_score']}/10.0")
    print(f"  [PASS] Action Directive: {props['recommended_action']['title']} [{props['recommended_action']['tier']}]")
    total_passed += 1

    # 4. Test /api/trajectory
    print("\n[4/6] Testing Lagrangian PTM Drift Trajectory: GET /api/trajectory ...")
    r_traj = client.get("/api/trajectory?max_hours=72")
    assert r_traj.status_code == 200, f"Trajectory failed with {r_traj.status_code}"
    traj_data = r_traj.json()
    assert traj_data["type"] == "FeatureCollection", "Trajectory must return a GeoJSON FeatureCollection"
    
    line_features = [f for f in traj_data["features"] if f["geometry"]["type"] == "LineString"]
    point_features = [f for f in traj_data["features"] if f["geometry"]["type"] == "Point"]
    assert len(line_features) > 0, "Must contain LineString trajectory"
    assert len(point_features) >= 4, "Must contain +12h, +24h, +48h, +72h milestone points"
    
    print(f"  [PASS] LineString Tracks: {len(line_features)} ({len(line_features[0]['geometry']['coordinates'])} RK4 integration steps)")
    print(f"  [PASS] Drift Direction: {line_features[0]['properties']['dominant_direction']}")
    print(f"  [PASS] Forecast Model: {line_features[0]['properties']['model']}")
    print(f"  [PASS] Projected Milestones:")
    for pt in point_features:
        p_props = pt["properties"]
        print(f"    - [{p_props['time_offset_hours']}h] {pt['geometry']['coordinates']} -> Closest Coast: {p_props['closest_coast']} (Risk: {p_props['beaching_risk']})")
    total_passed += 1

    # 5. Test /api/ocean-vectors
    print("\n[5/6] Testing INCOIS ROMS Ocean Current & Wave Vectors: GET /api/ocean-vectors ...")
    r_vec = client.get("/api/ocean-vectors?lat_min=8.0&lat_max=10.5&lon_min=75.5&lon_max=77.8&spacing=0.25")
    assert r_vec.status_code == 200, f"Ocean vectors failed with {r_vec.status_code}"
    vec_data = r_vec.json()
    assert "vectors" in vec_data, "Response must include vectors array"
    assert len(vec_data["vectors"]) > 0, "Vector grid must not be empty"
    sample_v = vec_data["vectors"][0]
    assert "u_velocity" in sample_v and "v_velocity" in sample_v
    print(f"  [PASS] Gridded Vector Count: {len(vec_data['vectors'])} points across Kerala / Arabian Sea shelf")
    print(f"  [PASS] Sample Point ({sample_v['latitude']}N, {sample_v['longitude']}E): Speed = {sample_v['current_speed_knots']} kts, Heading = {sample_v['heading_degrees']} deg, Wave Height = {sample_v['wave_height_m']}m, SST = {sample_v.get('sst_celsius', 'N/A')} C")
    total_passed += 1

    # 6. Test /api/samudra/advisory
    print("\n[6/6] Testing SAMUDRA 2.0 Multilingual Advisory: GET /api/samudra/advisory ...")
    r_sam = client.get("/api/samudra/advisory")
    assert r_sam.status_code == 200, f"SAMUDRA advisory failed with {r_sam.status_code}"
    sam_data = r_sam.json()
    assert "advisory_metadata" in sam_data
    assert "multilingual_advisories" in sam_data
    assert "en" in sam_data["multilingual_advisories"]
    assert "ml" in sam_data["multilingual_advisories"]
    assert "ta" in sam_data["multilingual_advisories"]
    
    print(f"  [PASS] Advisory ID: {sam_data['advisory_metadata']['advisory_id']}")
    print(f"  [PASS] Threat Classification: {sam_data['advisory_metadata']['threat_classification']}")
    print(f"  [PASS] English Warning: {sam_data['multilingual_advisories']['en']['headline']}")
    print(f"  [PASS] Malayalam Advisory: Available (Length: {len(sam_data['multilingual_advisories']['ml']['body'])} chars)")
    print(f"  [PASS] Tamil Advisory: Available (Length: {len(sam_data['multilingual_advisories']['ta']['body'])} chars)")
    print(f"  [PASS] Response Protocol: {sam_data['response_dispatch_matrix']['indian_coast_guard']}")
    total_passed += 1

    # 7. Test /api/export-report
    print("\n[7/7] Testing Official Incident Report Export: GET /api/export-report ...")
    r_exp = client.get("/api/export-report")
    assert r_exp.status_code == 200, f"Export report failed with {r_exp.status_code}"
    exp_data = r_exp.json()
    assert "report_metadata" in exp_data
    assert "telemetry_metrics" in exp_data
    assert "hotspot_triage_queue" in exp_data
    assert "lagrangian_drift_projection" in exp_data
    assert "samudra_advisories" in exp_data
    assert "inter_agency_action_matrix" in exp_data
    assert len(exp_data["hotspot_triage_queue"]) > 0
    print(f"  [PASS] Document ID: {exp_data['report_metadata']['document_id']}")
    total_passed += 1

    # 8. Test /api/copilot/query
    print("\n[8/8] Testing AI Mission Copilot Reasoning: POST /api/copilot/query ...")
    r_copilot = client.post("/api/copilot/query", json={"prompt": "What is the 48h landfall risk?"})
    assert r_copilot.status_code == 200, f"Copilot query failed with {r_copilot.status_code}"
    copilot_data = r_copilot.json()
    assert "response" in copilot_data
    assert "confidence" in copilot_data
    assert "citations" in copilot_data
    assert "suggested_actions" in copilot_data
    print(f"  [PASS] Copilot Confidence: {copilot_data['confidence']*100:.0f}%")
    print(f"  [PASS] Threat Level: {copilot_data['threat_classification']}")
    print(f"  [PASS] Citations: {', '.join(copilot_data['citations'][:2])}")
    total_passed += 1

    print("\n" + "=" * 80)
    print(f"*** ALL REAL-WORLD BIG DATA TESTS PASSED SUCCESSFULLY ({total_passed}/{total_tests}) ***")
    print("=" * 80)


if __name__ == "__main__":
    run_tests()


