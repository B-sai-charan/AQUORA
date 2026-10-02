/**
 * API Service for Aquora Marine Debris Triage Dashboard
 * Connects to FastAPI backend (default: http://localhost:8000)
 * Includes graceful offline fallback data calibrated for MSC ELSA 3.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Fallback Mock Datasets
const FALLBACK_DETECTIONS = {
  "type": "FeatureCollection",
  "metadata": {
    "incident": "MSC ELSA 3 Polymer Spill",
    "sensor": "Sentinel-2 MSI Level-2A",
    "total_hotspots": 3,
    "generated_at": new Date().toISOString()
  },
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [76.125, 9.925],
          [76.155, 9.925],
          [76.155, 9.955],
          [76.125, 9.955],
          [76.125, 9.925]
        ]]
      },
      "properties": {
        "hotspot_id": "HOTSPOT-ELSA-001",
        "feature_type": "Debris_Slick_Polygon",
        "debris_type": "PE/PP Polymer Resin Nurdles",
        "concentration": 0.84,
        "max_concentration": 0.92,
        "confidence": 0.96,
        "epistemic_uncertainty": 0.08,
        "confidence_interval_95": 0.12,
        "ESI_score": 8.8,
        "habitat_vulnerability": "Kochi Coastal Shelf & Harbour Approach (MSC ELSA 3 Zone)",
        "priority_score": 6.80,
        "fdi_max": 0.089,
        "ndvi_mean": -0.045,
        "area_sq_meters": 45000,
        "pixel_count": 450,
        "centroid": [76.14, 9.94],
        "recommended_action": {
          "tier": "CRITICAL_TIER_1",
          "action_code": "DISPATCH_BOOMS_AND_SKIMMERS",
          "title": "Immediate Offshore Intercept & Containment",
          "color_hex": "#ef4444",
          "description": "Deploy fast-response containment boom barriers and skimming vessels to prevent shoreline stranding in high ESI Ramsar/Biosphere zones."
        },
        "incident_source": "MSC ELSA 3 Spill"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [76.14, 9.94]
      },
      "properties": {
        "hotspot_id": "HOTSPOT-ELSA-001",
        "feature_type": "Hotspot_Centroid_Marker",
        "concentration": 0.84,
        "priority_score": 6.80,
        "tier": "CRITICAL_TIER_1",
        "color": "#ef4444"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [76.170, 9.895],
          [76.195, 9.895],
          [76.195, 9.925],
          [76.170, 9.925],
          [76.170, 9.895]
        ]]
      },
      "properties": {
        "hotspot_id": "HOTSPOT-ELSA-002",
        "feature_type": "Debris_Slick_Polygon",
        "debris_type": "PE/PP Polymer Resin Nurdles",
        "concentration": 0.58,
        "max_concentration": 0.68,
        "confidence": 0.88,
        "epistemic_uncertainty": 0.14,
        "confidence_interval_95": 0.18,
        "ESI_score": 7.8,
        "habitat_vulnerability": "Alappuzha & Kollam Coastal Fishing Shelf",
        "priority_score": 4.12,
        "fdi_max": 0.052,
        "ndvi_mean": -0.02,
        "area_sq_meters": 22000,
        "pixel_count": 220,
        "centroid": [76.18, 9.91],
        "recommended_action": {
          "tier": "PRIORITY_TIER_2",
          "action_code": "SHORELINE_DEFENSE_MOBILIZATION",
          "title": "Nearshore Defense & Trajectory Monitoring",
          "color_hex": "#f97316",
          "description": "Alert coastal port authorities, stage shoreline collection units at Alappuzha/Kollam, and track drift trajectory."
        },
        "incident_source": "MSC ELSA 3 Spill"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [76.18, 9.91]
      },
      "properties": {
        "hotspot_id": "HOTSPOT-ELSA-002",
        "feature_type": "Hotspot_Centroid_Marker",
        "concentration": 0.58,
        "priority_score": 4.12,
        "tier": "PRIORITY_TIER_2",
        "color": "#f97316"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [76.210, 9.965],
          [76.235, 9.965],
          [76.235, 9.995],
          [76.210, 9.995],
          [76.210, 9.965]
        ]]
      },
      "properties": {
        "hotspot_id": "HOTSPOT-ELSA-003",
        "feature_type": "Debris_Slick_Polygon",
        "debris_type": "PE/PP Polymer Resin Nurdles",
        "concentration": 0.32,
        "max_concentration": 0.42,
        "confidence": 0.79,
        "epistemic_uncertainty": 0.22,
        "confidence_interval_95": 0.24,
        "ESI_score": 8.8,
        "habitat_vulnerability": "Kochi Coastal Shelf & Harbour Approach (MSC ELSA 3 Zone)",
        "priority_score": 2.20,
        "fdi_max": 0.031,
        "ndvi_mean": 0.05,
        "area_sq_meters": 12000,
        "pixel_count": 120,
        "centroid": [76.22, 9.98],
        "recommended_action": {
          "tier": "MONITORING_TIER_3",
          "action_code": "SATELLITE_UAV_SURVEILLANCE",
          "title": "Continuous EO & UAV Tracking",
          "color_hex": "#eab308",
          "description": "Schedule next-pass Sentinel-2 / Landsat-9 high-resolution acquisition and UAV aerial sweep."
        },
        "incident_source": "MSC ELSA 3 Spill"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [76.22, 9.98]
      },
      "properties": {
        "hotspot_id": "HOTSPOT-ELSA-003",
        "feature_type": "Hotspot_Centroid_Marker",
        "concentration": 0.32,
        "priority_score": 2.20,
        "tier": "MONITORING_TIER_3",
        "color": "#eab308"
      }
    }
  ]
};

const FALLBACK_TRAJECTORY = {
  "type": "FeatureCollection",
  "metadata": {
    "forecast_horizon_hours": 72,
    "hydrodynamic_model": "INCOIS Coastal Circulation + WAVEWATCH III Surface Stokes + 2% Leeway",
    "integration_scheme": "4th-Order Runge-Kutta (RK4) with Stochastic Diffusion",
    "generated_at": new Date().toISOString()
  },
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [76.140, 9.940],
          [76.160, 9.870],
          [76.180, 9.800],
          [76.216, 9.735],
          [76.250, 9.640],
          [76.299, 9.539],
          [76.360, 9.400],
          [76.437, 9.224],
          [76.510, 9.050],
          [76.585, 8.862]
        ]
      },
      "properties": {
        "cluster_id": "HOTSPOT-ELSA-001",
        "feature_type": "Lagrangian_Drift_Track",
        "forecast_hours": 72,
        "net_displacement_km": 132.4,
        "dominant_direction": "South-Southeast (SSE 158°)",
        "target_threat": "Gulf of Mannar Biosphere & Kovalam Reefs",
        "model": "4th-Order Runge-Kutta with INCOIS/WAVEWATCH III Coupling"
      }
    },
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [76.140, 9.940] },
      "properties": {
        "cluster_id": "HOTSPOT-ELSA-001",
        "time_offset_hours": 0,
        "timestamp": new Date().toISOString(),
        "milestone_label": "Detection Initial Fix (Kochi Offshore)",
        "beaching_risk": "None - Deep Water",
        "closest_coast": "Kochi Harbour (13 NM)",
        "surface_current_mps": 0.48,
        "local_ESI_score": 8.8
      }
    },
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [76.216, 9.735] },
      "properties": {
        "cluster_id": "HOTSPOT-ELSA-001",
        "time_offset_hours": 12,
        "timestamp": new Date(Date.now() + 12*3600*1000).toISOString(),
        "milestone_label": "+12h Projection",
        "beaching_risk": "Moderate",
        "closest_coast": "Alappuzha / Mararikulam Beach",
        "surface_current_mps": 0.46,
        "local_ESI_score": 7.8
      }
    },
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [76.299, 9.539] },
      "properties": {
        "cluster_id": "HOTSPOT-ELSA-001",
        "time_offset_hours": 24,
        "timestamp": new Date(Date.now() + 24*3600*1000).toISOString(),
        "milestone_label": "+24h Projection",
        "beaching_risk": "High",
        "closest_coast": "Kollam / Ashtamudi Estuary",
        "surface_current_mps": 0.49,
        "local_ESI_score": 9.5
      }
    },
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [76.437, 9.224] },
      "properties": {
        "cluster_id": "HOTSPOT-ELSA-001",
        "time_offset_hours": 48,
        "timestamp": new Date(Date.now() + 48*3600*1000).toISOString(),
        "milestone_label": "+48h Projection",
        "beaching_risk": "Severe (Critical Eco-zone)",
        "closest_coast": "Kovalam & Vizhinjam Transshipment Port",
        "surface_current_mps": 0.47,
        "local_ESI_score": 8.5
      }
    },
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [76.585, 8.862] },
      "properties": {
        "cluster_id": "HOTSPOT-ELSA-001",
        "time_offset_hours": 72,
        "timestamp": new Date(Date.now() + 72*3600*1000).toISOString(),
        "milestone_label": "+72h Projection",
        "beaching_risk": "Critical National Ecological Threat",
        "closest_coast": "Kanyakumari / Gulf of Mannar Marine Biosphere",
        "surface_current_mps": 0.52,
        "local_ESI_score": 10.0
      }
    }
  ]
};

const FALLBACK_ADVISORY = {
  "advisory_metadata": {
    "advisory_id": "INCOIS-SAMUDRA-2026-ELSA3-004",
    "version": "SAMUDRA-2.0-GEO",
    "issued_by": "INCOIS - Marine Debris Emergency Triage Cell & Indian Coast Guard MRCC",
    "issue_time_utc": new Date().toISOString(),
    "incident_reference": "MSC ELSA 3 Containerized Polymer Nurdle Spill (Off Kochi)",
    "threat_classification": "CRITICAL / RED ALERT",
    "validity_hours": 72
  },
  "geo_spatial_summary": {
    "origin_coordinates": [76.14, 9.94],
    "spill_distance_off_kochi_nm": 13.0,
    "drift_heading": "158° SSE (South-Southeast along Kerala shelf)",
    "estimated_24h_position": [76.30, 9.54],
    "estimated_48h_position": [76.44, 9.22],
    "vulnerable_ecological_zones": [
      "Alappuzha Fishing Banks",
      "Kollam / Ashtamudi Coast",
      "Kovalam / Vizhinjam Shelf",
      "Gulf of Mannar Marine Biosphere"
    ]
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
};

export async function fetchDetections(minConcentration = 0.2) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/detections?min_concentration=${minConcentration}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data, isFallback: false };
  } catch (err) {
    console.warn("Backend unavailable, using pre-calibrated MSC ELSA 3 dataset:", err.message);
    return { data: FALLBACK_DETECTIONS, isFallback: true };
  }
}

export async function fetchTrajectory(maxHours = 72) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/trajectory?max_hours=${maxHours}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data, isFallback: false };
  } catch (err) {
    console.warn("Backend unavailable, using trajectory fallback:", err.message);
    return { data: FALLBACK_TRAJECTORY, isFallback: true };
  }
}

export async function fetchOceanVectors() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ocean-vectors`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data, isFallback: false };
  } catch (err) {
    console.warn("Backend unavailable, using vector grid fallback:", err.message);
    return { data: { vectors: [] }, isFallback: true };
  }
}

export async function fetchSamudraAdvisory() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/samudra/advisory`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data, isFallback: false };
  } catch (err) {
    console.warn("Backend unavailable, using SAMUDRA 2.0 advisory fallback:", err.message);
    return { data: FALLBACK_ADVISORY, isFallback: true };
  }
}

export async function fetchExportReport() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/export-report`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data, isFallback: false };
  } catch (err) {
    console.warn("Backend unavailable, generating client-side executive report:", err.message);
    const fallbackReport = {
      report_metadata: {
        document_id: `ICG-INCOIS-REP-2026-ELSA3-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`,
        title: "OPERATIONAL INCIDENT SITUATION & TRIAGE REPORT",
        issuing_bodies: [
          "Indian Coast Guard (ICG) Maritime Rescue Coordination Centre (MRCC Kochi)",
          "Indian National Centre for Ocean Information Services (INCOIS)",
          "Kerala State Disaster Management Authority (KSDMA)"
        ],
        incident_name: "MSC ELSA 3 Containerized Polymer Nurdle Spill",
        security_classification: "RESTRICTED // OFFICIAL OPERATIONAL DISPATCH",
        generated_at_utc: new Date().toISOString(),
        generated_at_ist: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + " (IST)",
        operational_status: "ACTIVE INTERCEPTION & TACTICAL TRIAGE",
        executive_summary: "At 08:30 IST, container vessel MSC ELSA 3 suffered deck cargo container loss containing industrial Polyethylene (PE) and Polypropylene (PP) pre-production nurdles 13 NM off Kochi, Kerala. Sentinel-2 MSI satellite spectral unmixing and INCOIS ROMS Lagrangian drift models project south-southeast advection towards Vembanad/Ashtamudi Ramsar wetlands and Alappuzha/Kollam fishing corridors."
      },
      incident_coordinates: {
        spill_origin_lat: 9.940,
        spill_origin_lon: 76.140,
        location_name: "13 NM Off Kochi Harbour Approach, Kerala Shelf",
        closest_port: "Cochin Port Trust (13.0 NM / 24.1 km)",
        primary_spill_material: "Pre-Production Polymer Resin Pellets (PE/PP Nurdles)"
      },
      telemetry_metrics: {
        total_detected_clusters: 3,
        critical_tier_1_count: 1,
        total_slick_area_sqm: 79000,
        total_slick_area_hectares: 7.9,
        average_polymer_concentration_pct: "58.0%",
        max_concentration_detected_pct: "84.0%",
        primary_sensor: "Sentinel-2 MSI Level-2A (ACOLITE Dark Spectrum Fitting)",
        detection_algorithms: "Constrained Linear Spectral Unmixing + Floating Debris Index (FDI) + NDVI Masking"
      },
      hotspot_triage_queue: [
        {
          hotspot_id: "HOTSPOT-ELSA-001",
          centroid: [76.14, 9.94],
          debris_type: "PE/PP Polymer Resin Nurdles",
          concentration: 0.84,
          concentration_pct: "84.0%",
          max_concentration: 0.92,
          area_sq_meters: 45000,
          area_hectares: 4.5,
          ESI_score: 8.8,
          habitat_vulnerability: "Kochi Coastal Shelf & Harbour Approach (MSC ELSA 3 Zone)",
          epistemic_uncertainty: 0.08,
          confidence_interval_95: 0.12,
          priority_score: 6.80,
          priority_tier: "CRITICAL_TIER_1",
          action_directive: "Immediate Offshore Intercept & Containment",
          action_protocol: "Deploy fast-response containment boom barriers and skimming vessels to prevent shoreline stranding in high ESI Ramsar/Biosphere zones.",
          color_hex: "#ef4444"
        },
        {
          hotspot_id: "HOTSPOT-ELSA-002",
          centroid: [76.18, 9.91],
          debris_type: "PE/PP Polymer Resin Nurdles",
          concentration: 0.58,
          concentration_pct: "58.0%",
          max_concentration: 0.68,
          area_sq_meters: 22000,
          area_hectares: 2.2,
          ESI_score: 7.8,
          habitat_vulnerability: "Alappuzha & Kollam Coastal Fishing Shelf",
          epistemic_uncertainty: 0.14,
          confidence_interval_95: 0.18,
          priority_score: 4.12,
          priority_tier: "PRIORITY_TIER_2",
          action_directive: "Nearshore Defense & Trajectory Monitoring",
          action_protocol: "Alert coastal port authorities, stage shoreline collection units at Alappuzha/Kollam, and track drift trajectory.",
          color_hex: "#f97316"
        },
        {
          hotspot_id: "HOTSPOT-ELSA-003",
          centroid: [76.22, 9.98],
          debris_type: "PE/PP Polymer Resin Nurdles",
          concentration: 0.32,
          concentration_pct: "32.0%",
          max_concentration: 0.42,
          area_sq_meters: 12000,
          area_hectares: 1.2,
          ESI_score: 8.8,
          habitat_vulnerability: "Kochi Coastal Shelf & Harbour Approach (MSC ELSA 3 Zone)",
          epistemic_uncertainty: 0.22,
          confidence_interval_95: 0.24,
          priority_score: 2.20,
          priority_tier: "MONITORING_TIER_3",
          action_directive: "Continuous EO & UAV Tracking",
          action_protocol: "Schedule next-pass Sentinel-2 / Landsat-9 high-resolution acquisition and UAV aerial sweep.",
          color_hex: "#eab308"
        }
      ],
      lagrangian_drift_projection: {
        forecast_model: "INCOIS ROMS + WAVEWATCH III Stokes Wave Drift + 2% Leeway",
        integration_scheme: "4th-Order Runge-Kutta (RK4) with Stochastic Diffusion",
        forecast_horizon_hours: 72,
        net_displacement_km: 132.4,
        dominant_advection_heading: "158° SSE (South-Southeast along Kerala shelf)",
        high_threat_target_ecosystems: [
          "Vembanad Lake Estuary (Ramsar Site #1212)",
          "Alappuzha Traditional Mud Bank (Chakara) Fishery Zone",
          "Ashtamudi Estuary & Mangrove Habitats (Ramsar Site #1211)",
          "Kovalam & Vizhinjam Coral Reef & Marine Biosphere"
        ],
        drift_milestones: FALLBACK_TRAJECTORY.features
          .filter(f => f.geometry.type === 'Point')
          .map(f => ({
            coordinates: f.geometry.coordinates,
            ...f.properties
          }))
      },
      samudra_advisories: FALLBACK_ADVISORY.multilingual_advisories,
      inter_agency_action_matrix: FALLBACK_ADVISORY.response_dispatch_matrix
    };
    return { data: fallbackReport, isFallback: true };
  }
}

export async function queryCopilot(prompt) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/copilot/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data, isFallback: false };
  } catch (err) {
    console.warn("Backend copilot endpoint unavailable, generating tactical fallback response:", err.message);
    const p_lower = (prompt || "").toLowerCase();
    let respText = "🛡️ **Aquora AI Mission Copilot (Calibrated Response):**\n\n• **Incident:** MSC ELSA 3 Container Loss.\n• **Location:** 13 NM Off Kochi, Kerala.\n• **Lagrangian Projection:** 158° SSE advection towards Vembanad Ramsar and Alappuzha shelf.\n• **Peak Polymer Concentration:** 96.4% [HOTSPOT-ELSA-001].";

    if (p_lower.includes("landfall") || p_lower.includes("48h") || p_lower.includes("drift") || p_lower.includes("trajectory")) {
      respText = "🛰️ **Lagrangian Drift Forecast:**\n\n• **Heading:** 158° SSE along Kerala shelf at ~0.48 m/s.\n• **+24h:** Approaching Kollam / Ashtamudi Estuary.\n• **+48h:** Threatening Kovalam & Vizhinjam Marine Reef Zone.\n• **+72h:** Gulf of Mannar Marine Biosphere corridor.";
    } else if (p_lower.includes("ramsar") || p_lower.includes("eco") || p_lower.includes("wetland")) {
      respText = "🌿 **ESI Eco-Vulnerability:**\n\n• **Gulf of Mannar:** ESI 10.0 (Dugong/Coral sanctuary)\n• **Vembanad/Ashtamudi:** ESI 9.5 (Ramsar #1211/1212 nursery grounds)\n• **Kochi Shelf:** ESI 8.8 (Artisanal fishery shelf)";
    }

    return {
      data: {
        query: prompt,
        response: respText,
        confidence: 0.95,
        threat_classification: "CRITICAL_TIER_1",
        citations: [
          "Sentinel-2 MSI Multi-Spectral Engine",
          "INCOIS ROMS Coastal Hydrodynamic Model",
          "4th-Order Runge-Kutta Lagrangian PTM Simulator"
        ],
        suggested_actions: [
          "Deploy Booms at Lat 9.60°N",
          "Stage Shoreline Units at Ashtamudi Estuary",
          "Broadcast VHF Ch-16 Warnings"
        ],
        timestamp: new Date().toISOString()
      },
      isFallback: true
    };
  }
}

export function getTelemetryWebSocketUrl() {
  const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
  const cleanBase = API_BASE_URL.replace(/^https?:\/\//, '');
  return `${wsProtocol}://${cleanBase}/ws/telemetry`;
}


