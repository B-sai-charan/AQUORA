import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  RefreshCw, 
  Radio, 
  Compass, 
  Satellite, 
  AlertCircle,
  HelpCircle,
  Layers,
  Info,
  FileDown,
  Loader2,
  CheckCircle2,
  Activity,
  Clock,
  Zap,
  Globe2,
  Bot,
  Sparkles,
  Tv
} from 'lucide-react';

import MapEngine from './components/MapEngine';
import CommandHUD from './components/CommandHUD';
import SamudraAdvisory from './components/SamudraAdvisory';
import TimelineScrubber from './components/TimelineScrubber';
import AICopilotDrawer from './components/AICopilotDrawer';
import KioskOverlay from './components/KioskOverlay';
import { 
  fetchDetections, 
  fetchTrajectory, 
  fetchOceanVectors, 
  fetchSamudraAdvisory,
  fetchExportReport
} from './services/api';
import { downloadReportBlob } from './utils/reportGenerator';
import { KioskTourManager } from './utils/kioskController';

export default function App() {
  const [detections, setDetections] = useState(null);
  const [trajectories, setTrajectories] = useState(null);
  const [oceanVectors, setOceanVectors] = useState(null);
  const [advisory, setAdvisory] = useState(null);
  
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [activeForecastHour, setActiveForecastHour] = useState(72);
  const [isSamudraOpen, setIsSamudraOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isCloudCoverActive, setIsCloudCoverActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [layerVisibility, setLayerVisibility] = useState({
    hotspots: true,
    trajectories: true,
    currents: true
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Kiosk Presentation Mode State
  const [kioskStatus, setKioskStatus] = useState({
    isActive: false,
    isCompleted: false,
    stepIndex: 0,
    totalSteps: 6,
    step: null,
    progressPct: 0
  });
  const [externalCopilotPrompt, setExternalCopilotPrompt] = useState(null);
  const kioskManagerRef = React.useRef(null);

  // Live tactical mission clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStartKiosk = () => {
    if (kioskManagerRef.current) {
      kioskManagerRef.current.stop();
    }
    const manager = new KioskTourManager(
      {
        setIsCloudCoverActive,
        setIsSamudraOpen,
        setIsCopilotOpen,
        setActiveForecastHour,
        setSelectedHotspot,
        detections,
        handleExportReport,
        onTriggerCopilotQuery: (prompt) => {
          setExternalCopilotPrompt(prompt);
          setTimeout(() => setExternalCopilotPrompt(null), 1000);
        }
      },
      (status) => setKioskStatus(status)
    );
    kioskManagerRef.current = manager;
    manager.start();
  };

  const handleStopKiosk = () => {
    if (kioskManagerRef.current) {
      kioskManagerRef.current.stop();
    }
    setKioskStatus({
      isActive: false,
      isCompleted: false,
      stepIndex: 0,
      totalSteps: 6,
      step: null,
      progressPct: 0
    });
  };

  const handleToggleKiosk = () => {
    if (kioskStatus.isActive) {
      handleStopKiosk();
    } else {
      handleStartKiosk();
    }
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

  const handleToggleLayer = (layerName) => {
    setLayerVisibility(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [detRes, trajRes, vecRes, advRes] = await Promise.all([
        fetchDetections(0.20),
        fetchTrajectory(72),
        fetchOceanVectors(),
        fetchSamudraAdvisory()
      ]);

      setDetections(detRes.data);
      setTrajectories(trajRes.data);
      setOceanVectors(vecRes.data);
      setAdvisory(advRes.data);

      // Backend status is online if at least one returned non-fallback
      setIsBackendConnected(!detRes.isFallback);

      // Auto-select primary hotspot on first load
      if (detRes.data?.features?.length > 0) {
        const firstPolygon = detRes.data.features.find(f => f.geometry.type === 'Polygon');
        if (firstPolygon) {
          setSelectedHotspot(firstPolygon.properties);
        }
      }
    } catch (err) {
      console.error("Failed loading Web-GIS datasets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  return (
    <div className="flex flex-col w-screen h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      
      {/* Top Tactical Sci-Fi Command Header */}
      <header className="h-16 bg-slate-950/90 border-b border-cyan-500/20 px-5 flex items-center justify-between z-40 shrink-0 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-3 cursor-pointer group text-left bg-transparent border-0 p-0 focus:outline-none"
            title="Reload AQUORA.GIS Dashboard"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-105 group-hover:border-cyan-300 transition-all">
              <Shield className="w-5 h-5 drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Orbitron'] text-base font-black tracking-wider text-white group-hover:text-cyan-200 transition-colors">
                  AQUORA<span className="text-cyan-400">.GIS</span>
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold tracking-widest shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                  Marine Debris Triage
                </span>
              </div>
            </div>
          </button>

          <div className="hidden xl:flex items-center gap-2.5 pl-4 border-l border-slate-800 text-xs font-mono text-slate-300">
            <span className="text-cyan-400 font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Incident:
            </span>
            <span className="text-white font-semibold">MSC ELSA 3 (Kochi, Kerala)</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Sensor: Sentinel-2 MSI</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Currents: INCOIS PTM</span>
          </div>
        </div>

        {/* Center Mission Clock Readout */}
        <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>UTC: {currentTime.toUTCString().slice(17, 25)}</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-300">IST: {currentTime.toLocaleTimeString('en-IN', { hour12: false })}</span>
        </div>

        {/* Right Header Action Utilities */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleToggleKiosk}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all shadow-md font-mono uppercase tracking-wider ${
              kioskStatus.isActive
                ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse'
                : 'bg-slate-900/90 border-slate-700 hover:bg-slate-800 hover:border-amber-400/50 text-amber-300/90'
            }`}
            title="Start / Stop 60-Second Autonomous Kiosk Presentation Tour"
          >
            <Tv className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">
              {kioskStatus.isActive ? 'Stop Tour' : 'Kiosk Demo'}
            </span>
          </button>

          <button
            onClick={handleExportReport}
            disabled={isExporting}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all shadow-md font-mono uppercase tracking-wider ${
              exportSuccess
                ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900/90 border-slate-700 hover:bg-slate-800 hover:border-cyan-400/50 text-slate-200'
            }`}
            title="Export Official Incident Situation Report (PDF / Printable HTML)"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span className="hidden sm:inline">Compiling Report...</span>
              </>
            ) : exportSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Report Exported!</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Export Incident Report</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsCopilotOpen(prev => !prev)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all text-xs font-bold shadow-md font-mono uppercase tracking-wider ${
              isCopilotOpen
                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900/90 border-slate-700 hover:bg-slate-800 hover:border-cyan-400/50 text-cyan-300'
            }`}
            title="Open Aquora AI Mission Copilot"
          >
            <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>AI Copilot</span>
          </button>

          <button
            onClick={() => setIsSamudraOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-600/20 border border-rose-500/50 text-rose-300 hover:bg-rose-600 hover:text-white transition-all text-xs font-bold shadow-[0_0_15px_rgba(244,63,94,0.25)] font-mono uppercase tracking-wider"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse text-rose-400" />
            <span>SAMUDRA 2.0 Alerts</span>
          </button>

          <button
            onClick={() => window.location.reload()}
            className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:bg-slate-800 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center group"
            title="Refresh & Reload Dashboard"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400 group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex relative overflow-hidden">
        
        {/* Left Command HUD Sidebar */}
        <CommandHUD
          detections={detections}
          selectedHotspot={selectedHotspot}
          onSelectHotspot={setSelectedHotspot}
          onOpenSamudra={() => setIsSamudraOpen(true)}
          isBackendConnected={isBackendConnected}
          isCloudCoverActive={isCloudCoverActive}
          setIsCloudCoverActive={setIsCloudCoverActive}
        />

        {/* Center Web-GIS Map Canvas */}
        <main 
          className="flex-1 relative h-full bg-slate-950 overflow-hidden"
          style={{ width: '100%', height: '100%', position: 'relative' }}
        >
          <MapEngine
            detections={detections}
            trajectories={trajectories}
            oceanVectors={oceanVectors}
            selectedHotspot={selectedHotspot}
            onSelectHotspot={setSelectedHotspot}
            activeForecastHour={activeForecastHour}
            layerVisibility={layerVisibility}
            onToggleLayer={handleToggleLayer}
            isCloudCoverActive={isCloudCoverActive}
          />

          {/* Floating Bottom Timeline Scrubber */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
            <TimelineScrubber
              activeHour={activeForecastHour}
              onChangeHour={setActiveForecastHour}
            />
          </div>
        </main>
      </div>

      {/* SAMUDRA 2.0 Emergency Advisory Modal */}
      <SamudraAdvisory
        advisory={advisory}
        isOpen={isSamudraOpen}
        onClose={() => setIsSamudraOpen(false)}
      />

      {/* Aquora AI Mission Copilot Slide-out Drawer */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        externalPrompt={externalCopilotPrompt}
      />

      {/* Autonomous Kiosk Presentation Mode Overlay */}
      <KioskOverlay
        kioskStatus={kioskStatus}
        onStopKiosk={handleStopKiosk}
      />

    </div>
  );
}

