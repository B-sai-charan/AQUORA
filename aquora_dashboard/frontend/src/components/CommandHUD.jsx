import React, { useMemo, useState } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Satellite, 
  Waves, 
  Crosshair, 
  AlertTriangle, 
  ArrowUpRight, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Radio,
  FileSpreadsheet,
  FileDown,
  FileText,
  Loader2,
  CheckCircle2,
  CloudRain,
  EyeOff,
  Navigation,
  Compass,
  Cpu,
  Layers,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Search
} from 'lucide-react';
import { fetchExportReport } from '../services/api';
import { downloadReportBlob } from '../utils/reportGenerator';

// Mini SVG Sparkline Component
function Sparkline({ data = [20, 35, 45, 60, 55, 75, 84], color = '#06b6d4', height = 24, width = 64 }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

// Mini Circular Progress Dial
function CircularGauge({ value = 75, size = 42, strokeWidth = 3.5, color = '#06b6d4' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(51, 65, 85, 0.4)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute font-mono text-[10px] font-bold text-white">
        {Math.round(value)}%
      </span>
    </div>
  );
}

export default function CommandHUD({
  detections,
  selectedHotspot,
  onSelectHotspot,
  onOpenSamudra,
  isBackendConnected,
  isCloudCoverActive,
  setIsCloudCoverActive
}) {
  const [filterTier, setFilterTier] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Accordion Section States
  const [sections, setSections] = useState({
    telemetry: true,
    triageQueue: true,
    driftModel: false,
    interAgency: false
  });

  const toggleSection = (key) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExportReport = async () => {
    try {
      setIsExporting(true);
      const res = await fetchExportReport();
      if (res && res.data) {
        downloadReportBlob(res.data);
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3500);
      }
    } catch (err) {
      console.error("Failed to export incident report:", err);
    } finally {
      setIsExporting(false);
    }
  };

  // Extract and sort polygon features by priority_score descending
  const sortedHotspots = useMemo(() => {
    if (!detections || !detections.features) return [];
    
    return detections.features
      .filter(f => f.geometry.type === 'Polygon')
      .map(f => f.properties)
      .sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));
  }, [detections]);

  // Telemetry Aggregations
  const telemetry = useMemo(() => {
    const totalCount = sortedHotspots.length;
    const criticalCount = sortedHotspots.filter(h => (h.priority_score || 0) >= 6.5).length;
    const totalAreaSqm = sortedHotspots.reduce((sum, h) => sum + (h.area_sq_meters || 0), 0);
    const avgConc = totalCount > 0 
      ? sortedHotspots.reduce((sum, h) => sum + (h.concentration || 0), 0) / totalCount 
      : 0;

    return {
      totalCount,
      criticalCount,
      totalAreaSqm,
      totalAreaHa: (totalAreaSqm / 10000).toFixed(1),
      avgConc: (avgConc * 100).toFixed(1),
      avgConcNum: avgConc * 100
    };
  }, [sortedHotspots]);

  // Filtered hotspots based on user selection
  const filteredHotspots = useMemo(() => {
    return sortedHotspots.filter(h => {
      if (filterTier !== 'ALL' && !h.recommended_action?.tier?.includes(filterTier)) {
        return false;
      }
      if (searchQuery && !h.hotspot_id?.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !h.habitat_vulnerability?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [sortedHotspots, filterTier, searchQuery]);

  return (
    <aside className="w-[31rem] xl:w-[33rem] max-w-[92vw] h-full flex flex-col glass-panel-hud border-r border-cyan-500/20 text-slate-100 z-30 shadow-2xl select-none scanline-grid">
      
      {/* 1. Mission Control Incident Header */}
      <div className="p-5 border-b border-cyan-500/20 bg-slate-950/70 hud-corners relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 shadow-[0_0_8px_#f43f5e]"></span>
            </span>
            <span className="text-xs font-mono font-black tracking-widest text-rose-400 uppercase">
              INCIDENT ACTIVE // DEFCON 1
            </span>
          </div>

          <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md border tracking-wider ${
            isBackendConnected 
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
              : 'bg-amber-950/80 border-amber-500/50 text-amber-400'
          }`}>
            {isBackendConnected ? 'STREAM: ROMS-OPENDAP' : 'CALIBRATED SIM'}
          </span>
        </div>

        <h1 className="text-lg font-black text-white tracking-tight leading-tight flex items-center gap-2 font-['Rajdhani'] uppercase">
          <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
          MSC ELSA 3 Nurdle Spill Triage
        </h1>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-300/70 mt-1">
          <span>13 NM Off Kochi, Kerala</span>
          <span>•</span>
          <span>Lat 9.94°N, Lon 76.14°E</span>
        </div>

        {/* Monsoon Cloud Cover Simulation Toggle */}
        <button
          type="button"
          onClick={() => setIsCloudCoverActive(prev => !prev)}
          className={`mt-3 w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all text-xs font-semibold ${
            isCloudCoverActive
              ? 'bg-amber-500/20 border-amber-500/70 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
              : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-700/80 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <CloudRain className={`w-4 h-4 ${isCloudCoverActive ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="font-mono uppercase tracking-wider text-xs">Simulate Monsoon Cloud Cover</span>
          </div>
          <div className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
            isCloudCoverActive ? 'bg-amber-500 justify-end' : 'bg-slate-700 justify-start'
          }`}>
            <div className="w-4 h-4 rounded-full bg-white shadow" />
          </div>
        </button>

        {/* Action Buttons: SAMUDRA Advisory & Export Incident Report */}
        <div className="grid grid-cols-2 gap-2 mt-2.5">
          <button
            onClick={onOpenSamudra}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-950/60 border border-cyan-400/40 transition-all hover:scale-[1.01] active:scale-[0.99] font-mono tracking-wider uppercase"
            title="Open SAMUDRA 2.0 Multilingual Advisory"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-200 shrink-0" />
            <span className="truncate">SAMUDRA 2.0</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-80 shrink-0" />
          </button>

          <button
            onClick={handleExportReport}
            disabled={isExporting}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all hover:scale-[1.01] active:scale-[0.99] font-mono tracking-wider uppercase ${
              exportSuccess
                ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-100 shadow-md hover:border-cyan-400/50'
            }`}
            title="Export Official Incident Situation Report (PDF / Printable HTML)"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400 shrink-0" />
                <span className="truncate">Compiling...</span>
              </>
            ) : exportSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Exported!</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">Export Report (PDF)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Scrollable Tactical Modules Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        
        {/* MODULE 1: Live Telemetry & Ingestion Dashboard */}
        <div className="glass-card-obsidian rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
          <div 
            onClick={() => toggleSection('telemetry')}
            className="p-3.5 bg-slate-900/80 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors border-b border-slate-800/60"
          >
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              <Activity className="w-4 h-4 text-cyan-400" />
              Big Data Telemetry Matrix
            </div>
            {sections.telemetry ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>

          {sections.telemetry && (
            <div className="p-3.5 space-y-3">
              {/* Telemetry Metric Cards */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                
                {/* Hotspot Count Card */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/90 relative overflow-hidden group">
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[11px] uppercase">
                    <span className="flex items-center gap-1.5">
                      <Crosshair className="w-3.5 h-3.5 text-rose-400" />
                      Detected Hotspots
                    </span>
                    <Sparkline data={[1, 2, 2, 3, 3, 3]} color="#f43f5e" height={16} width={38} />
                  </div>
                  <div className="text-2xl font-black text-white mt-1.5 font-mono flex items-baseline gap-1.5">
                    {telemetry.totalCount}
                    <span className="text-[11px] font-semibold text-rose-400 font-mono">
                      ({telemetry.criticalCount} Critical)
                    </span>
                  </div>
                </div>

                {/* Polymer Concentration Card */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/90 relative overflow-hidden flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400 font-mono uppercase flex items-center gap-1.5">
                      <Waves className="w-3.5 h-3.5 text-cyan-400" />
                      Avg Polymer Conc.
                    </div>
                    <div className="text-2xl font-black text-cyan-300 mt-1 font-mono">
                      {telemetry.avgConc}%
                    </div>
                  </div>
                  <CircularGauge value={telemetry.avgConcNum} size={38} strokeWidth={3.5} color="#06b6d4" />
                </div>
              </div>

              {/* Sensor Optical Status Bar */}
              <div className={`p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                isCloudCoverActive 
                  ? 'bg-rose-950/60 border-rose-500/70 shadow-inner' 
                  : 'bg-slate-950/70 border-slate-800/80 text-slate-300'
              }`}>
                {isCloudCoverActive ? (
                  <span className="text-rose-400 font-mono font-bold flex items-center gap-2 animate-pulse text-xs">
                    <EyeOff className="w-4 h-4 text-rose-400" />
                    SATELLITE BLINDED (Monsoon)
                  </span>
                ) : (
                  <span className="text-slate-300 flex items-center gap-1.5 text-xs">
                    <Satellite className="w-4 h-4 text-emerald-400" />
                    Sensor: <strong className="text-white font-semibold">Sentinel-2 MSI (Clear)</strong>
                  </span>
                )}
                <span className={`font-mono text-xs ${isCloudCoverActive ? 'text-rose-400 font-bold animate-pulse' : 'text-emerald-400 font-semibold'}`}>
                  {isCloudCoverActive ? 'OPTICAL OFFLINE' : '10m Res • BOA'}
                </span>
              </div>

              {/* Warning Banner when Cloud Cover Active */}
              {isCloudCoverActive && (
                <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/70 text-amber-200 text-xs leading-relaxed shadow-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <span className="font-bold text-amber-300 font-mono">WARNING: </span>
                    Optical sensors offline. Falling back to INCOIS ROMS Drift Models. Dispatching Edge-AI UAVs for localized verification.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODULE 2: Triage Priority Queue */}
        <div className="glass-card-obsidian rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
          <div 
            onClick={() => toggleSection('triageQueue')}
            className="p-3.5 bg-slate-900/80 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors border-b border-slate-800/60"
          >
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              <Crosshair className="w-4 h-4 text-amber-400" />
              Triage Priority Queue
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-400">
                P = C × ESI × (1-U)
              </span>
              {sections.triageQueue ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </div>

          {sections.triageQueue && (
            <div className="p-3.5 space-y-3">
              
              {/* Search & Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 text-xs">
                {['ALL', 'CRITICAL', 'PRIORITY', 'MONITORING'].map(tier => (
                  <button
                    key={tier}
                    onClick={() => setFilterTier(tier)}
                    className={`px-3 py-1 rounded-lg font-mono uppercase tracking-wider transition-colors text-[11px] ${
                      filterTier === tier 
                        ? 'bg-cyan-500/20 border border-cyan-500/70 text-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                        : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>

              {/* Hotspot Cards List */}
              <div className="space-y-3">
                {filteredHotspots.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs font-mono">
                    No debris hotspots matching current filter criteria.
                  </div>
                ) : (
                  filteredHotspots.map(hotspot => {
                    const isSelected = selectedHotspot?.hotspot_id === hotspot.hotspot_id;
                    const priority = hotspot.priority_score || 0;
                    const color = hotspot.recommended_action?.color_hex || '#3b82f6';

                    return (
                      <div
                        key={hotspot.hotspot_id}
                        onClick={() => onSelectHotspot(hotspot)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                          isSelected 
                            ? 'bg-slate-900/95 border-cyan-400 shadow-xl shadow-cyan-950/80 scale-[1.01]' 
                            : 'bg-slate-950/80 hover:bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        {/* Left Glow Stripe */}
                        <div 
                          className="absolute left-0 top-0 bottom-0 w-2 shadow-[0_0_8px_currentColor]"
                          style={{ backgroundColor: color, color: color }}
                        />

                        <div className="pl-2 space-y-2">
                          {/* Top Row: ID + Priority Score Pill */}
                          <div className="flex items-center justify-between">
                            <div className="font-mono text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                              {hotspot.hotspot_id}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400 font-mono uppercase">Priority (P):</span>
                              <span 
                                className="text-xs font-black px-2 py-0.5 rounded-md text-white font-mono shadow-sm"
                                style={{ backgroundColor: color }}
                              >
                                {priority.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Habitat Vulnerability & Coordinates */}
                          <div className="text-xs text-slate-300">
                            <div className="font-semibold text-slate-200 line-clamp-1">
                              {hotspot.habitat_vulnerability}
                            </div>
                            <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                              Coords: [{hotspot.centroid ? `${hotspot.centroid[1].toFixed(3)}°N, ${hotspot.centroid[0].toFixed(3)}°E` : 'N/A'}]
                            </div>
                          </div>

                          {/* 3 Metric Grid: C, ESI, Uncertainty */}
                          <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
                            <div>
                              <div className="text-[10px] text-slate-400">Conc (C)</div>
                              <div className="font-bold text-cyan-300 text-xs">{((hotspot.concentration || 0) * 100).toFixed(0)}%</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-400">ESI Score</div>
                              <div className="font-bold text-emerald-400 text-xs">{hotspot.ESI_score}/10</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-400">Uncert (U)</div>
                              <div className="font-bold text-indigo-300 text-xs">±{((hotspot.epistemic_uncertainty || 0) * 100).toFixed(0)}%</div>
                            </div>
                          </div>

                          {/* Recommended Action Directive */}
                          <div className="pt-1.5 text-xs border-t border-slate-800/80">
                            <div className="font-bold text-white text-xs">
                              {hotspot.recommended_action?.title || 'Immediate Offshore Intercept & Containment'}
                            </div>
                            <p className="text-[11px] text-slate-400 leading-snug mt-0.5 line-clamp-2">
                              {hotspot.recommended_action?.description}
                            </p>
                          </div>

                          {/* Focus Map Action */}
                          <div className="flex justify-end pt-0.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectHotspot(hotspot);
                              }}
                              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 uppercase tracking-wider font-semibold"
                            >
                              Focus Target <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}
        </div>

        {/* MODULE 3: Hydrodynamic Drift & Lagrangian Forecast */}
        <div className="glass-card-obsidian rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
          <div 
            onClick={() => toggleSection('driftModel')}
            className="p-3.5 bg-slate-900/80 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors border-b border-slate-800/60"
          >
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              <Navigation className="w-4 h-4 text-emerald-400" />
              Lagrangian Particle Drift (PTM RK4)
            </div>
            {sections.driftModel ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>

          {sections.driftModel && (
            <div className="p-3.5 space-y-2.5 text-xs text-slate-300 font-mono">
              <div className="flex justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Advection Vector:</span>
                <span className="font-bold text-cyan-300">158° SSE (South-Southeast)</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">72h Net Displacement:</span>
                <span className="font-bold text-white">132.4 km</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Coupled Hydrodynamics:</span>
                <span className="text-emerald-400">INCOIS ROMS + WAVEWATCH III</span>
              </div>
            </div>
          )}
        </div>

        {/* MODULE 4: Inter-Agency Tasking Matrix */}
        <div className="glass-card-obsidian rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
          <div 
            onClick={() => toggleSection('interAgency')}
            className="p-3.5 bg-slate-900/80 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors border-b border-slate-800/60"
          >
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Inter-Agency Tasking Matrix
            </div>
            {sections.interAgency ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>

          {sections.interAgency && (
            <div className="p-3.5 space-y-2.5 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="font-mono text-[11px] font-bold text-cyan-400 uppercase">Indian Coast Guard (MRCC)</div>
                <div className="text-[11px] text-slate-300 leading-relaxed">Task ICGS Samar & ICGS Aryaman with containment boom deployment at Lat 9.60°N, Lon 76.18°E.</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="font-mono text-[11px] font-bold text-amber-400 uppercase">Kerala SDMA (KSDMA)</div>
                <div className="text-[11px] text-slate-300 leading-relaxed">Deploy coastal beach cleaning volunteers and boom barriers at Ashtamudi estuary mouth.</div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 3. Footer Tactical Status Bar */}
      <div className="p-3 border-t border-cyan-500/20 bg-slate-950/80 text-[11px] text-slate-400 font-mono flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-cyan-400/80">
          <Cpu className="w-3.5 h-3.5" />
          INCOIS PTM RK4 Coupled
        </span>
        <span className="text-slate-400 font-semibold">72h Forecast Horizon</span>
      </div>
    </aside>
  );
}
