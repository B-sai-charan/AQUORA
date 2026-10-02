"""
Triage, Ecological Sensitivity, and SAMUDRA 2.0 Advisory Engine
Specialized for the MSC ELSA 3 Marine Debris Incident (Kochi, Kerala).

Implements:
1. Operational Priority Score Formula:
   P(x,y) = C(x,y) * ESI(x,y) * (1 - U(x,y))
   - C(x,y): Sub-pixel concentration (0 - 1)
   - ESI(x,y): Ecological Sensitivity Index (Scale 1 - 10)
   - U(x,y): Epistemic uncertainty (0 - 1) via Monte Carlo Dropout simulation
2. Spatial ESI Resolver for Kerala/Tamil Nadu coastline & Gulf of Mannar Marine Biosphere.
3. SAMUDRA 2.0 Multilingual Advisory Generation for Coast Guard and Coastal Fishing Fleets.
"""

import numpy as np
from datetime import datetime
from typing import Dict, List, Any, Tuple


# Ecological Sensitivity Index (ESI) Geo-Zones (South-West Coast of India)
ESI_REGIONS = [
    {
        "name": "Gulf of Mannar Marine National Park & Biosphere Reserve",
        "lat_range": (8.5, 9.4),
        "lon_range": (78.0, 79.5),
        "esi_score": 10.0,
        "description": "Coral reefs, endangered Dugong habitats, and critical seagrass meadows."
    },
    {
        "name": "Vembanad & Ashtamudi Ramsar Wetland Systems",
        "lat_range": (9.3, 10.1),
        "lon_range": (76.2, 76.5),
        "esi_score": 9.5,
        "description": "Critical nursery grounds for estuarine fisheries and migratory waterfowl."
    },
    {
        "name": "Kochi Coastal Shelf & Harbour Approach (MSC ELSA 3 Zone)",
        "lat_range": (9.75, 10.15),
        "lon_range": (76.05, 76.35),
        "esi_score": 8.8,
        "description": "Artisanal coastal fisheries, Cochin estuary mouth, and port approach channel."
    },
    {
        "name": "Kovalam & Vizhinjam Marine Reef Zone",
        "lat_range": (8.3, 8.5),
        "lon_range": (76.9, 77.1),
        "esi_score": 8.5,
        "description": "High-density artisanal fishing grounds and protected coastal reef biodiversity."
    },
    {
        "name": "Alappuzha & Kollam Coastal Fishing Shelf",
        "lat_range": (8.8, 9.4),
        "lon_range": (76.3, 76.6),
        "esi_score": 7.8,
        "description": "Active traditional mud bank (Chakara) fishery zone and sandy nesting beaches."
    },
    {
        "name": "Offshore Arabian Sea (Deep Water)",
        "lat_range": (8.0, 11.0),
        "lon_range": (74.0, 76.0),
        "esi_score": 3.5,
        "description": "Pelagic open waters with high dispersion capacity."
    }
]



def resolve_esi_score(lon: float, lat: float) -> Tuple[float, str]:
    """
    Resolves the Ecological Sensitivity Index (1-10) and habitat description
    based on geographic coordinates.
    """
    for region in ESI_REGIONS:
        lat_min, lat_max = region["lat_range"]
        lon_min, lon_max = region["lon_range"]
        if lat_min <= lat <= lat_max and lon_min <= lon <= lon_max:
            return region["esi_score"], region["name"]
    
    # Distance to coastline estimation if outside predefined bounding boxes
    if lon > 76.5:
        return 7.5, "Inshore Coastal Zone"
    elif lon > 76.0:
        return 5.5, "Nearshore Coastal Waters"
    else:
        return 3.0, "Offshore Pelagic Zone"


def simulate_mc_dropout_uncertainty(concentration: float, n_passes: int = 20) -> Tuple[float, float]:
    """
    Simulates Epistemic Uncertainty U(x,y) via Monte Carlo Dropout variance across
    stochastic forward passes on the spectral embedding.
    Returns (epistemic_uncertainty [0-1], confidence_interval).
    """
    np.random.seed(int(concentration * 1000) % 10000)
    # Simulate dropout perturbation with 15% rate
    dropout_samples = concentration * (1.0 + np.random.normal(0, 0.12, n_passes))
    variance = float(np.var(dropout_samples))
    # Epistemic uncertainty scaled to [0.05, 0.45]
    uncertainty = float(np.clip(variance * 15.0 + 0.05, 0.05, 0.45))
    ci = 1.96 * float(np.std(dropout_samples))
    return round(uncertainty, 3), round(ci, 3)


def compute_priority_score(concentration: float, esi_score: float, uncertainty: float) -> float:
    """
    Computes Operational Priority Score:
    P(x,y) = C(x,y) * ESI(x,y) * (1 - U(x,y))
    """
    raw_p = concentration * esi_score * (1.0 - uncertainty)
    return round(float(np.clip(raw_p, 0.0, 10.0)), 2)


def get_recommended_action(priority_score: float) -> Dict[str, Any]:
    """
    Maps operational priority score to actionable Coast Guard & Disaster Response protocols.
    """
    if priority_score >= 6.5:
        return {
            "tier": "CRITICAL_TIER_1",
            "action_code": "DISPATCH_BOOMS_AND_SKIMMERS",
            "title": "Immediate Offshore Intercept & Containment",
            "color_hex": "#ef4444",
            "description": "Deploy fast-response containment boom barriers and skimming vessels to prevent shoreline stranding in high ESI Ramsar/Biosphere zones."
        }
    elif priority_score >= 4.0:
        return {
            "tier": "PRIORITY_TIER_2",
            "action_code": "SHORELINE_DEFENSE_MOBILIZATION",
            "title": "Nearshore Defense & Trajectory Monitoring",
            "color_hex": "#f97316",
            "description": "Alert coastal port authorities, stage shoreline collection units at Alappuzha/Kollam, and track drift trajectory."
        }
    elif priority_score >= 2.0:
        return {
            "tier": "MONITORING_TIER_3",
            "action_code": "SATELLITE_UAV_SURVEILLANCE",
            "title": "Continuous EO & UAV Tracking",
            "color_hex": "#eab308",
            "description": "Schedule next-pass Sentinel-2 / Landsat-9 high-resolution acquisition and UAV aerial sweep."
        }
    else:
        return {
            "tier": "ADVISORY_TIER_4",
            "action_code": "PASSIVE_SURVEILLANCE",
            "title": "Passive Hydrodynamic Monitoring",
            "color_hex": "#3b82f6",
            "description": "Low concentration pelagic drift. Continue automated tracking through INCOIS current model."
        }


def format_samudra_advisory(
    hotspots: List[Dict[str, Any]],
    drift_milestones: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Formats a SAMUDRA 2.0 structured multilingual notification advisory payload for
    INCOIS coastal broadcasts, Indian Coast Guard, and local fishing fleets.
    """
    now = datetime.utcnow()
    advisory_id = f"INCOIS-SAMUDRA-2026-ELSA3-{now.strftime('%Y%m%d')}-004"
    
    max_priority = max([h.get("priority_score", 0.0) for h in hotspots]) if hotspots else 0.0
    threat_level = "CRITICAL / RED ALERT" if max_priority >= 6.5 else "HIGH / ORANGE ALERT"
    
    # 24h and 48h landfall coordinates
    p24 = next((m for m in drift_milestones if m.get("time_offset_hours") == 24), None)
    p48 = next((m for m in drift_milestones if m.get("time_offset_hours") == 48), None)
    
    impact_zones = ["Alappuzha Fishing Banks", "Kollam / Ashtamudi Coast", "Kovalam / Vizhinjam Shelf", "Gulf of Mannar Marine Biosphere"]
    
    return {
        "advisory_metadata": {
            "advisory_id": advisory_id,
            "version": "SAMUDRA-2.0-GEO",
            "issued_by": "INCOIS - Marine Debris Emergency Triage Cell & Indian Coast Guard MRCC",
            "issue_time_utc": now.isoformat() + "Z",
            "incident_reference": "MSC ELSA 3 Containerized Polymer Nurdle Spill (Off Kochi)",
            "threat_classification": threat_level,
            "validity_hours": 72
        },
        "geo_spatial_summary": {
            "origin_coordinates": [76.14, 9.94],
            "spill_distance_off_kochi_nm": 13.0,
            "drift_heading": "158° SSE (South-Southeast along Kerala shelf)",
            "estimated_24h_position": p24["coordinates"] if p24 else [76.22, 9.48],
            "estimated_48h_position": p48["coordinates"] if p48 else [76.38, 8.85],
            "vulnerable_ecological_zones": impact_zones
        },
        "multilingual_advisories": {
            "en": {
                "headline": "URGENT NAVIGATIONAL & ENVIRONMENTAL WARNING: Polymer Nurdle Spill Advection",
                "body": "Floating PE/PP plastic resin nurdle slicks detected 13 NM off Kochi resulting from MSC ELSA 3 cargo loss. High risk of fishing net fouling and coastal beaching between Alappuzha and Vizhinjam. All artisanal and mechanized vessels are advised to steer clear of the designated containment corridor.",
                "action_directive": "Avoid bottom trawling and purse-seine deployment within the marked 5 NM warning envelope."
            },
            "ml": {
                "headline": "അടിയന്തിര സമുദ്ര സുരക്ഷാ മുന്നറിയിപ്പ്: കൊച്ചി തീരത്ത് പ്ലാസ്റ്റിക് പെല്ലറ്റ് ചോർച്ച",
                "body": "കൊച്ചിക്ക് 13 നോട്ടിക്കൽ മൈൽ പടിഞ്ഞാറ് MSC ELSA 3 കപ്പലിൽ നിന്നുള്ള പ്ലാസ്റ്റിക് പെല്ലറ്റുകൾ (നർഡിൽസ്) തെക്കോട്ടേക്ക് ഒഴുകുന്നതായി ഇൻകോയിസ് ഉപഗ്രഹ നിരീക്ഷണത്തിൽ കണ്ടെത്തി. ആലപ്പുഴ, കൊല്ലം, വിഴിഞ്ഞം തീരങ്ങളിലേക്ക് മാലിന്യം നീങ്ങാൻ സാധ്യതയുണ്ട്. മത്സ്യത്തൊഴിലാളികൾ വലകൾ കേടുവരാതിരിക്കാൻ ജാഗ്രത പാലിക്കുക.",
                "action_directive": "അടയാളപ്പെടുത്തിയ 5 നോട്ടിക്കൽ മൈൽ മേഖലയിൽ മത്സ്യബന്ധന വലകൾ ഇറക്കരുത്."
            },
            "ta": {
                "headline": "அவசர கடல்சார் எச்சரிக்கை: கொச்சி கடலில் பிளாஸ்டிக் துகள்கள் பரவல்",
                "body": "கொச்சி துறைமுகத்திற்கு மேற்கே MSC ELSA 3 கப்பலில் இருந்து வெளியேறிய பிளாஸ்டிக் நர்டில்ஸ் துகள்கள் தெற்கு நோக்கி கன்னியாகுமரி மற்றும் மன்னார் வளைகுடா நோக்கி நகர்கிறது. மீனவர்கள் எச்சரிக்கையுடன் இருக்குமாறு கேட்டுக்கொள்ளப்படுகிறார்கள்.",
                "action_directive": "குறிப்பிடப்பட்ட எச்சரிக்கை மண்டலத்தில் மீன்பிடி வலைகளை விரிப்பதைத் தவிர்க்கவும்."
            }
        },
        "response_dispatch_matrix": {
            "indian_coast_guard": "Task ICGS Samar & ICGS Aryaman with containment boom deployment at Lat 9.60°N, Lon 76.18°E.",
            "state_disaster_management_ksdma": "Deploy coastal beach cleaning volunteers and boom barriers at Ashtamudi estuary mouth.",
            "marine_police": "Enforce navigational exclusion zone around primary slick hotspot."
        }
    }
