import React, { useState } from 'react';
import { 
  Radio, 
  X, 
  ShieldAlert, 
  Globe, 
  Anchor, 
  Copy, 
  Check, 
  Printer, 
  AlertTriangle,
  Send,
  Navigation
} from 'lucide-react';

export default function SamudraAdvisory({ advisory, isOpen, onClose }) {
  const [selectedLang, setSelectedLang] = useState('en');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !advisory) return null;

  const meta = advisory.advisory_metadata || {};
  const geo = advisory.geo_spatial_summary || {};
  const multilingual = advisory.multilingual_advisories || {};
  const dispatch = advisory.response_dispatch_matrix || {};

  const currentAdv = multilingual[selectedLang] || multilingual.en || {};

  const handleCopy = () => {
    const textToCopy = `[${meta.advisory_id}] ${currentAdv.headline}\n\n${currentAdv.body}\n\nDIRECTIVE: ${currentAdv.action_directive}\n\nISSUED BY: ${meta.issued_by}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white font-mono tracking-tight">
                  SAMUDRA 2.0 Emergency Advisory System
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500 text-white uppercase tracking-wider font-mono">
                  {meta.threat_classification || 'RED ALERT'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {meta.advisory_id} • Validity: 72 Hours
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          
          {/* Language Selector Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Broadcast Language:
            </div>
            <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setSelectedLang('en')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  selectedLang === 'en' 
                    ? 'bg-cyan-500 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                English (MRCC)
              </button>
              <button
                onClick={() => setSelectedLang('ml')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  selectedLang === 'ml' 
                    ? 'bg-cyan-500 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                മലയാളം (Kerala)
              </button>
              <button
                onClick={() => setSelectedLang('ta')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  selectedLang === 'ta' 
                    ? 'bg-cyan-500 text-white shadow' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                தமிழ் (Tamil Nadu)
              </button>
            </div>
          </div>

          {/* Broadcast Message Box */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-2.5">
            <div className="font-bold text-sm text-cyan-300 leading-snug">
              {currentAdv.headline}
            </div>
            
            <p className="text-slate-300 text-xs leading-relaxed">
              {currentAdv.body}
            </p>

            <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-lg text-amber-200 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-300">Fleet Action Directive:</strong>
                {currentAdv.action_directive}
              </div>
            </div>
          </div>

          {/* Geospatial Drift Vector & Threatened Eco-zones */}
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="font-mono text-slate-400 uppercase text-[10px] flex items-center gap-1">
                <Navigation className="w-3 h-3 text-cyan-400" />
                Drift Forecast Vector
              </div>
              <div className="text-slate-200">
                <div><strong>Spill Origin:</strong> 13 NM Off Kochi [{geo.origin_coordinates ? `${geo.origin_coordinates[1]}°N, ${geo.origin_coordinates[0]}°E` : 'N/A'}]</div>
                <div><strong>Dominant Flow:</strong> <span className="text-cyan-400 font-mono">{geo.drift_heading}</span></div>
                <div><strong>Estimated 24h Landfall:</strong> Lat 9.54°N (Kollam Shelf)</div>
              </div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="font-mono text-slate-400 uppercase text-[10px] flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                Threatened Eco-Zones (ESI &gt; 8.0)
              </div>
              <ul className="text-slate-300 list-disc list-inside space-y-0.5 text-[10px]">
                {geo.vulnerable_ecological_zones?.map((zone, idx) => (
                  <li key={idx} className="line-clamp-1">{zone}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Coast Guard & Disaster Response Protocols */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="font-mono text-slate-400 uppercase text-[10px] flex items-center gap-1">
              <Anchor className="w-3 h-3 text-emerald-400" />
              Inter-Agency Intercept & Dispatch Matrix
            </div>
            
            <div className="space-y-1.5 text-[11px]">
              <div className="flex gap-2">
                <span className="font-semibold text-emerald-400 shrink-0 w-28">Indian Coast Guard:</span>
                <span className="text-slate-300">{dispatch.indian_coast_guard}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-amber-400 shrink-0 w-28">State DMA (KSDMA):</span>
                <span className="text-slate-300">{dispatch.state_disaster_management_ksdma}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-blue-400 shrink-0 w-28">Marine Police:</span>
                <span className="text-slate-300">{dispatch.marine_police}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[10px] font-mono text-slate-500">
            Source: INCOIS / Indian Coast Guard MRCC Kochi
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Advisory'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bulletin</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white transition-colors"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
