import React, { useState, useEffect, useRef, useMemo } from 'react';
import Map, { Source, Layer, Popup, NavigationControl, FullscreenControl, ScaleControl, Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  Layers, 
  Compass, 
  Wind, 
  AlertCircle, 
  Anchor, 
  Radio, 
  ChevronRight, 
  Zap, 
  Crosshair, 
  ShieldAlert, 
  Waves, 
  Gauge, 
  Activity, 
  Globe2 
} from 'lucide-react';

// Open-Source Pristine High-Contrast Dark Canvas (100% Unwatermarked & Zero API Key Required)
const PRISTINE_DARK_STYLE = {
  version: 8,
  sources: {
    "pristine-dark": {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
      ],
      tileSize: 256,
      attribution: "&copy; Esri, OpenStreetMap contributors"
    }
  },
  layers: [
    {
      id: "pristine-dark-layer",
      type: "raster",
      source: "pristine-dark",
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

// Open-Source OSM Tactical Night Basemap (Clean OpenStreetMap with night-mode tone mapping)
const OSM_TACTICAL_DARK_STYLE = {
  version: 8,
  sources: {
    "osm-tactical": {
      type: "raster",
      tiles: [
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      ],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors"
    }
  },
  layers: [
    {
      id: "osm-tactical-layer",
      type: "raster",
      source: "osm-tactical",
      minzoom: 0,
      maxzoom: 19,
      paint: {
        "raster-brightness-min": 0.0,
        "raster-brightness-max": 0.38,
        "raster-contrast": 0.25,
        "raster-saturation": -0.85
      }
    }
  ]
};

// Open-Source ESRI World Imagery (Satellite)
const ESRI_SATELLITE_STYLE = {
  version: 8,
  sources: {
    "esri-satellite": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      ],
      tileSize: 256,
      attribution: "Tiles &copy; Esri &mdash; Source: Esri, USGS, GeoEye"
    }
  },
  layers: [
    {
      id: "esri-satellite-layer",
      type: "raster",
      source: "esri-satellite",
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

const BASEMAP_STYLES = {
  dark: PRISTINE_DARK_STYLE,
  osm_dark: OSM_TACTICAL_DARK_STYLE,
  satellite: ESRI_SATELLITE_STYLE
};

export default function MapEngine({
  detections,
  trajectories,
  oceanVectors,
  selectedHotspot,
  onSelectHotspot,
  activeForecastHour,
  layerVisibility,
  onToggleLayer,
  isCloudCoverActive
}) {
  const mapRef = useRef(null);
  const [mapStyleKey, setMapStyleKey] = useState('dark');
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  // Initial view centered on MSC ELSA 3 Spill Zone (13 NM off Kochi, Lat 9.94°N, Lon 76.14°E)
  const [viewState, setViewState] = useState({
    latitude: 9.94,
    longitude: 76.14,
    zoom: 8.8,
    pitch: 25,
    bearing: 0
  });

  // Center on hotspot when selected externally
  useEffect(() => {
    if (selectedHotspot && selectedHotspot.centroid && mapRef.current) {
      const [lon, lat] = selectedHotspot.centroid;
      mapRef.current.flyTo({
        center: [lon, lat],
        zoom: 9.8,
        pitch: 35,
        duration: 1600,
        essential: true
      });
    }
  }, [selectedHotspot]);

  // Ensure map canvas resizes correctly when DOM container layout stabilizes
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);
    const timer1 = setTimeout(handleResize, 100);
    const timer2 = setTimeout(handleResize, 500);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Filter trajectories based on active forecast hour scrubber
  const filteredTrajectories = useMemo(() => {
    if (!trajectories || !trajectories.features) return { type: 'FeatureCollection', features: [] };
    
    return {
      ...trajectories,
      features: trajectories.features.filter(f => {
        if (f.geometry.type === 'LineString') return true;
        if (f.geometry.type === 'Point') {
          const offset = f.properties?.time_offset_hours ?? 0;
          return offset <= activeForecastHour;
        }
        return true;
      })
    };
  }, [trajectories, activeForecastHour]);

  // Separate hotspot polygons and point centroids
  const hotspotPolygons = useMemo(() => {
    if (!detections || !detections.features) return { type: 'FeatureCollection', features: [] };
    return {
      type: 'FeatureCollection',
      features: detections.features.filter(f => f.geometry.type === 'Polygon')
    };
  }, [detections]);

  const hotspotPoints = useMemo(() => {
    if (!detections || !detections.features) return [];
    return detections.features
      .filter(f => f.geometry.type === 'Point' && f.properties?.hotspot_id)
      .map(f => ({
        coordinates: f.geometry.coordinates,
        properties: f.properties
      }));
  }, [detections]);

  // Mapbox Layer Styles with high-contrast neon aesthetics
  const polygonFillStyle = {
    id: 'hotspots-polygon-fill',
    type: 'fill',
    paint: {
      'fill-color': [
        'case',
        ['>=', ['get', 'priority_score'], 6.5], '#ef4444',
        ['>=', ['get', 'priority_score'], 4.0], '#f97316',
        ['>=', ['get', 'priority_score'], 2.0], '#eab308',
        '#3b82f6'
      ],
      'fill-opacity': 0.6
    }
  };

  const polygonOutlineStyle = {
    id: 'hotspots-polygon-outline',
    type: 'line',
    paint: {
      'line-color': [
        'case',
        ['>=', ['get', 'priority_score'], 6.5], '#ff4d6d',
        '#ffffff'
      ],
      'line-width': 2.5,
      'line-dasharray': [2, 1]
    }
  };

  const trajectoryLineStyle = {
    id: 'trajectory-lines',
    type: 'line',
    paint: {
      'line-color': '#06b6d4',
      'line-width': 3.5,
      'line-dasharray': [3, 2],
      'line-opacity': 0.95
    }
  };

  const milestonePointStyle = {
    id: 'trajectory-milestones',
    type: 'circle',
    filter: ['==', '$type', 'Point'],
    paint: {
      'circle-radius': 7,
      'circle-color': '#06b6d4',
      'circle-stroke-width': 2.5,
      'circle-stroke-color': '#ffffff'
    }
  };

  const handleMapClick = (e) => {
    const features = e.features;
    if (features && features.length > 0) {
      const clicked = features[0];
      if (clicked.layer.id.includes('hotspot')) {
        const hId = clicked.properties.hotspot_id;
        const matching = detections.features.find(
          f => f.properties?.hotspot_id === hId && f.geometry.type === 'Polygon'
        );
        if (matching) {
          onSelectHotspot(matching.properties);
        }
      } else if (clicked.layer.id.includes('trajectory-milestone')) {
        setSelectedMilestone(clicked.properties);
      }
    }
  };

  return (
    <div 
      className="relative w-full h-full bg-slate-950 overflow-hidden select-none"
      style={{ width: '100%', height: '100%', minHeight: '100%', position: 'relative' }}
    >
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={BASEMAP_STYLES[mapStyleKey]}
        interactiveLayerIds={isCloudCoverActive ? ['trajectory-milestones'] : ['hotspots-polygon-fill', 'trajectory-milestones']}
        onClick={handleMapClick}
        onMouseEnter={(e) => {
          if (e.features && e.features[0]) {
            setHoveredFeature(e.features[0]);
          }
        }}
        onMouseLeave={() => setHoveredFeature(null)}
        cursor={hoveredFeature ? 'pointer' : 'grab'}
        style={{ width: '100%', height: '100%' }}
        onError={(e) => {
          console.error("MapEngine: Error rendering base map tiles or vector sources:", e);
        }}
        onLoad={(e) => {
          const map = e.target;
          if (map) {
            map.on('error', (err) => {
              console.error("MapLibre GL runtime error:", err);
            });
            map.resize();
          }
        }}
      >
        <NavigationControl position="bottom-right" />
        <FullscreenControl position="bottom-right" />
        <ScaleControl position="bottom-left" unit="nautical" />

        {/* 1. Trajectory Layer */}
        {layerVisibility.trajectories && (
          <Source id="trajectories-source" type="geojson" data={filteredTrajectories}>
            <Layer {...trajectoryLineStyle} />
            <Layer {...milestonePointStyle} />
          </Source>
        )}

        {/* 2. Hotspots Layer Polygons */}
        {layerVisibility.hotspots && !isCloudCoverActive && (
          <Source id="hotspots-polygons-source" type="geojson" data={hotspotPolygons}>
            <Layer {...polygonFillStyle} />
            <Layer {...polygonOutlineStyle} />
          </Source>
        )}

        {/* 3. Pulsing Critical Hotspot HTML Markers */}
        {layerVisibility.hotspots && !isCloudCoverActive && hotspotPoints.map((pt, idx) => {
          const props = pt.properties || {};
          const isCritical = (props.priority_score || 0) >= 6.5;
          const isSelected = selectedHotspot?.hotspot_id === props.hotspot_id;

          return (
            <Marker
              key={`hotspot-marker-${props.hotspot_id || idx}`}
              longitude={pt.coordinates[0]}
              latitude={pt.coordinates[1]}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                const matching = detections.features.find(
                  f => f.properties?.hotspot_id === props.hotspot_id && f.geometry.type === 'Polygon'
                );
                onSelectHotspot(matching ? matching.properties : props);
              }}
            >
              <div className="relative flex items-center justify-center cursor-pointer group">
                {/* Critical Glowing Pulse Animation for Priority > 6.5 */}
                {isCritical && (
                  <div className="absolute w-8 h-8 pulse-critical opacity-90 shadow-[0_0_15px_#ef4444]" />
                )}
                
                {/* Center Core Marker */}
                <div 
                  className={`relative flex items-center justify-center rounded-full text-white font-mono text-[9px] font-black shadow-lg transition-transform group-hover:scale-125 ${
                    isCritical 
                      ? 'w-6 h-6 bg-red-600 ring-2 ring-white drop-shadow-[0_0_12px_rgba(239,68,68,1)]' 
                      : (props.priority_score || 0) >= 4.0
                        ? 'w-5 h-5 bg-orange-500 ring-1.5 ring-white'
                        : 'w-4 h-4 bg-amber-400 text-slate-950 ring-1 ring-white'
                  } ${isSelected ? 'scale-125 ring-4 ring-cyan-400 shadow-[0_0_15px_#22d3ee]' : ''}`}
                >
                  {isCritical ? '!' : (idx + 1)}
                </div>

                {/* Hover Tooltip Label */}
                <div className="absolute -top-7 whitespace-nowrap bg-slate-900/95 border border-cyan-500/50 text-cyan-200 text-[10px] px-2 py-0.5 rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-mono">
                  {props.hotspot_id} (P: {props.priority_score?.toFixed(1)})
                </div>
              </div>
            </Marker>
          );
        })}

        {/* 4. Ocean Vectors Directional Streamlines */}
        {layerVisibility.currents && oceanVectors?.vectors && (
          oceanVectors.vectors.map((vec, idx) => (
            <Marker
              key={`vector-${idx}`}
              longitude={vec.longitude}
              latitude={vec.latitude}
              anchor="center"
            >
              <div 
                className="group relative flex items-center justify-center p-1 rounded-full cursor-help hover:scale-125 transition-transform"
                title={`Flow: ${vec.current_speed_knots} kts @ ${vec.heading_degrees}° | Wave: ${vec.wave_height_m}m`}
              >
                <div 
                  className="w-5 h-5 flex items-center justify-center text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity"
                  style={{ transform: `rotate(${vec.heading_degrees}deg)` }}
                >
                  <svg viewBox="0 0 24 24" className="w-full h-full fill-current drop-shadow-[0_0_6px_rgba(6,182,212,0.9)]">
                    <path d="M12 2L6 14h4v8h4v-8h4L12 2z" />
                  </svg>
                </div>
              </div>
            </Marker>
          ))
        )}

        {/* Interactive Military Brief Popup for Selected Hotspot */}
        {selectedHotspot && selectedHotspot.centroid && !isCloudCoverActive && (
          <Popup
            longitude={selectedHotspot.centroid[0]}
            latitude={selectedHotspot.centroid[1]}
            anchor="bottom"
            onClose={() => onSelectHotspot(null)}
            closeOnClick={false}
            className="aquora-tactical-popup"
          >
            <div className="glass-panel-hud-glow p-4 rounded-2xl border border-cyan-400/60 shadow-2xl max-w-sm font-sans hud-corners">
              <div className="flex items-center justify-between gap-3 border-b border-cyan-500/30 pb-2 mb-2.5">
                <span className="font-mono text-sm font-bold text-cyan-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_4px_#06b6d4]" />
                  {selectedHotspot.hotspot_id}
                </span>
                <span 
                  className="text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider text-white font-mono shadow-sm"
                  style={{ backgroundColor: selectedHotspot.recommended_action?.color_hex || '#ef4444' }}
                >
                  {selectedHotspot.recommended_action?.tier?.replace('_', ' ') || 'ALERT'}
                </span>
              </div>
              
              <div className="text-xs space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">Polymer Concentration (C):</span>
                  <span className="font-bold text-white font-mono text-sm">{(selectedHotspot.concentration * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">Priority Score P(x,y):</span>
                  <span className="font-black text-rose-400 font-mono text-base">{selectedHotspot.priority_score?.toFixed(2)} / 10.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">ESI Sensitivity Score:</span>
                  <span className="font-bold text-emerald-400 font-mono text-sm">{selectedHotspot.ESI_score || selectedHotspot.esi_score} / 10.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">Epistemic Uncertainty:</span>
                  <span className="font-mono text-indigo-300 text-sm">±{(selectedHotspot.epistemic_uncertainty * 100).toFixed(1)}%</span>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-xs text-cyan-200/90 leading-relaxed">
                  <strong className="text-white block mb-0.5 text-xs uppercase tracking-wider font-mono">{selectedHotspot.recommended_action?.title}</strong>
                  {selectedHotspot.recommended_action?.description}
                </div>
              </div>
            </div>
          </Popup>
        )}

        {/* Milestone Popup */}
        {selectedMilestone && (
          <Popup
            longitude={JSON.parse(selectedMilestone.coordinates || '[0,0]')[0]}
            latitude={JSON.parse(selectedMilestone.coordinates || '[0,0]')[1]}
            anchor="top"
            onClose={() => setSelectedMilestone(null)}
            className="aquora-tactical-popup"
          >
            <div className="glass-panel-hud-glow p-4 rounded-2xl border border-cyan-400/60 shadow-xl max-w-sm font-sans text-xs">
              <div className="font-bold text-cyan-300 mb-1.5 flex items-center gap-1.5 font-mono text-sm">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                {selectedMilestone.milestone_label}
              </div>
              <div className="text-slate-300 space-y-1.5 text-xs">
                <div><strong>Coastal Target:</strong> <span className="text-white font-medium">{selectedMilestone.closest_coast}</span></div>
                <div><strong>Stranding Threat:</strong> <span className="text-rose-400 font-semibold">{selectedMilestone.beaching_risk}</span></div>
                <div><strong>Surface Drift Velocity:</strong> {selectedMilestone.surface_current_mps} m/s</div>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Floating Tactical Live HUD Telemetry Widget (Top-Left) */}
      <div className="absolute top-5 left-5 z-20 pointer-events-none">
        <div className="glass-panel-hud p-3 rounded-2xl border border-cyan-500/30 shadow-2xl flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400 animate-[spin_10s_linear_infinite]" />
            <div>
              <div className="text-[10px] text-slate-400">CAMERA FIX</div>
              <div className="font-bold text-white text-[11px]">{viewState.latitude.toFixed(2)}°N, {viewState.longitude.toFixed(2)}°E</div>
            </div>
          </div>
          <div className="h-6 w-px bg-slate-700/60" />
          <div>
            <div className="text-[10px] text-slate-400">ADVECTION</div>
            <div className="font-bold text-cyan-300 text-[11px]">158° SSE • 0.48 m/s</div>
          </div>
          <div className="h-6 w-px bg-slate-700/60" />
          <div>
            <div className="text-[10px] text-slate-400">TARGET SANCTUARY</div>
            <div className="font-bold text-emerald-400 text-[11px]">Vembanad Ramsar</div>
          </div>
        </div>
      </div>

      {/* Monsoon Blinded Notification Banner overlay */}
      {isCloudCoverActive && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 bg-rose-950/90 border border-rose-500/90 px-6 py-2 rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(244,63,94,0.4)] flex items-center gap-2.5 text-xs md:text-sm font-mono font-bold text-rose-200 animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shadow-[0_0_8px_#f43f5e]" />
          MONSOON BLINDING ACTIVE • OPTICAL HOTSPOTS HIDDEN • INCOIS HYDRODYNAMIC DRIFT ACTIVE
        </div>
      )}

      {/* Floating Tactical Layer Controls */}
      <div className="absolute top-5 right-5 z-20 flex flex-col gap-2.5">
        <div className="glass-panel-hud p-4 rounded-2xl border border-cyan-500/30 shadow-2xl text-sm space-y-3 min-w-[280px]">
          <div className="text-xs font-mono text-cyan-300 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold">
              <Layers className="w-4 h-4 text-cyan-400" />
              Tactical Layer Matrix
            </span>
            <span className="text-[10px] text-slate-400">GIS 2.0</span>
          </div>

          {/* Basemap Switcher */}
          <div className="space-y-1.5 pb-2 border-b border-slate-800/80">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Basemap Canvas</div>
            <div className="grid grid-cols-3 gap-1 text-[11px] font-mono">
              {[
                { key: 'dark', label: 'Dark Canvas' },
                { key: 'osm_dark', label: 'OSM Night' },
                { key: 'satellite', label: 'Satellite' }
              ].map(bm => (
                <button
                  key={bm.key}
                  onClick={() => setMapStyleKey(bm.key)}
                  className={`px-2 py-1 rounded text-center transition-all ${
                    mapStyleKey === bm.key
                      ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-200 font-bold shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {bm.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col gap-2.5">
            <label className={`flex items-center gap-2.5 transition-colors ${
              isCloudCoverActive ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:text-cyan-300'
            }`}>
              <input 
                type="checkbox" 
                checked={layerVisibility.hotspots && !isCloudCoverActive} 
                onChange={() => !isCloudCoverActive && onToggleLayer('hotspots')}
                disabled={isCloudCoverActive}
                className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs md:text-sm font-medium">S-2 Nurdle Hotspots {isCloudCoverActive ? '(Cloud Blinded)' : '(P > 6.5 Glow)'}</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer hover:text-cyan-300 transition-colors">
              <input 
                type="checkbox" 
                checked={layerVisibility.trajectories} 
                onChange={() => onToggleLayer('trajectories')}
                className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs md:text-sm font-medium">RK4 Drift Paths (+72h)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer hover:text-cyan-300 transition-colors">
              <input 
                type="checkbox" 
                checked={layerVisibility.currents} 
                onChange={() => onToggleLayer('currents')}
                className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs md:text-sm font-medium">INCOIS Ocean Vectors</span>
            </label>
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-6 left-5 z-20 glass-panel-hud p-4 rounded-2xl border border-cyan-500/30 shadow-2xl text-sm space-y-3 max-w-sm">
        <div className="text-xs font-mono text-slate-200 uppercase tracking-wider flex items-center justify-between">
          <span className="font-bold text-cyan-300">Priority Triage Key</span>
          <span className="text-cyan-400 font-mono font-bold">P = C × ESI × (1-U)</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-red-500 pulse-critical"></span>
            <span className="font-bold text-rose-400">Critical (&gt;6.5)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            <span className="text-slate-200">Priority (4.0-6.5)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            <span className="text-slate-200">Moderate (2.0-4.0)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span className="text-slate-200">Pelagic (&lt;2.0)</span>
          </div>
        </div>
        <div className="pt-2 border-t border-slate-800 text-xs text-slate-300 flex items-center justify-between font-mono">
          <span className="text-cyan-400 font-bold">--- RK4 Advection</span>
          <span className="text-slate-300">158° SSE</span>
        </div>
      </div>
    </div>
  );
}
