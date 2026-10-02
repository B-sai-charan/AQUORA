import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Compass } from 'lucide-react';

const MILESTONES = [0, 12, 24, 48, 72];

export default function TimelineScrubber({ activeHour, onChangeHour }) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        onChangeHour(prev => {
          const currentIdx = MILESTONES.indexOf(prev);
          if (currentIdx === -1 || currentIdx === MILESTONES.length - 1) {
            return MILESTONES[0];
          }
          return MILESTONES[currentIdx + 1];
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, onChangeHour]);

  return (
    <div className="bg-slate-950/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-700/80 shadow-2xl flex items-center gap-4 text-sm select-none">
      
      {/* Play / Pause / Reset Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md shadow-cyan-900/30 active:scale-95"
          title={isPlaying ? 'Pause Drift Forecast' : 'Play 72h Drift Simulation'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        <button
          onClick={() => {
            setIsPlaying(false);
            onChangeHour(0);
          }}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Reset to Initial Detection Fix (t=0h)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Milestone Scrubber Points */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 mr-1.5">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Forecast Horizon:</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          {MILESTONES.map(hour => {
            const isSelected = activeHour === hour;
            return (
              <button
                key={hour}
                onClick={() => {
                  setIsPlaying(false);
                  onChangeHour(hour);
                }}
                className={`px-3.5 py-1.5 rounded-lg font-mono text-xs md:text-sm font-bold transition-all ${
                  isSelected 
                    ? 'bg-cyan-500 text-white shadow-[0_0_14px_rgba(6,182,212,0.6)] scale-105' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {hour === 0 ? 'T-0h (Fix)' : `+${hour}h`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Forecast Status Readout */}
      <div className="pl-4 border-l border-slate-800 text-xs md:text-sm font-mono text-slate-300 hidden md:block">
        <span className="text-slate-400">Target Coastline: </span>
        <span className="font-bold text-cyan-300">
          {activeHour === 0 && 'Kochi Harbour (13 NM Deep Water)'}
          {activeHour === 12 && 'Alappuzha / Mararikulam Beach'}
          {activeHour === 24 && 'Kollam / Ashtamudi Ramsar Estuary'}
          {activeHour === 48 && 'Kovalam Reefs & Vizhinjam Port'}
          {activeHour === 72 && 'Gulf of Mannar National Marine Biosphere'}
        </span>
      </div>

    </div>
  );
}
