import React from 'react';
import { 
  Play, 
  Square, 
  Tv, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  Activity, 
  Compass, 
  Layers, 
  Zap, 
  Radio 
} from 'lucide-react';

export default function KioskOverlay({ kioskStatus, onStopKiosk }) {
  if (!kioskStatus || (!kioskStatus.isActive && !kioskStatus.isCompleted)) {
    return null;
  }

  const { stepIndex, totalSteps, step, progressPct, isCompleted } = kioskStatus;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[32rem] max-w-[92vw] animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div className="glass-panel-hud-glow rounded-2xl border border-cyan-400/60 p-4 shadow-[0_0_30px_rgba(6,182,212,0.3)] bg-slate-950/90 backdrop-blur-2xl">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-cyan-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.5)] animate-pulse">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Orbitron'] text-xs font-bold text-white tracking-wide">
                  KIOSK PRESENTATION MODE
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-400/50 text-cyan-300 font-bold tracking-wider">
                  {step?.badge || `STEP ${stepIndex}/${totalSteps}`}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onStopKiosk}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-500/60 text-rose-300 hover:bg-rose-900/80 transition-colors text-[11px] font-mono font-bold shadow-sm"
            title="Stop Automated Tour"
          >
            <Square className="w-3 h-3 fill-rose-400" />
            <span>Stop Tour</span>
          </button>
        </div>

        {/* Step Title & Action Description */}
        <div className="py-3">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-200 font-mono mb-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{step?.title || 'Executing automated demonstration sequence...'}</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
            {step?.description}
          </p>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Overall Tour Progress: Step {stepIndex} of {totalSteps}</span>
            <span className="text-cyan-300 font-bold">{Math.round(progressPct)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(6,182,212,0.8)]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
