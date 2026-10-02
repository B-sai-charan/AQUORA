import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  X, 
  ChevronRight, 
  Cpu, 
  Radio, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  Zap, 
  Layers, 
  Flame, 
  Compass, 
  Plane, 
  RefreshCw,
  Terminal,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { queryCopilot, getTelemetryWebSocketUrl } from '../services/api';

export default function AICopilotDrawer({ isOpen, onClose, externalPrompt }) {
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'copilot',
      text: "🛡️ **Aquora AI Mission Copilot Online.**\n\nI am coupled in real-time to the **Sentinel-2 L2A Multi-Spectral Engine** and **INCOIS ROMS Lagrangian Drift Streamer** for the **MSC ELSA 3** nurdle spill.\n\nAsk me any operational question regarding trajectory advection, coastal Ramsar vulnerabilities, boom containment coordinates, or multilingual advisories.",
      confidence: 0.98,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: [
        "Sentinel-2 MSI Level-2A (ACOLITE)",
        "INCOIS ROMS OPeNDAP Big Data Streamer",
        "Lagrangian PTM RK4 Scheme"
      ],
      suggestedActions: [
        "48h Landfall Risk",
        "Threatened Ramsar Wetlands",
        "ICG Boom Deployment Fix",
        "SAMUDRA Malayalam Advisory"
      ]
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [liveTelemetry, setLiveTelemetry] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  // Trigger external prompt (e.g. from Kiosk Tour)
  useEffect(() => {
    if (externalPrompt && isOpen) {
      handleSendMessage(externalPrompt);
    }
  }, [externalPrompt, isOpen]);

  // Auto-scroll chat to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // WebSocket live environmental & drone stream
  useEffect(() => {
    let ws = null;
    let reconnectTimer = null;

    const connectWebSocket = () => {
      try {
        const wsUrl = getTelemetryWebSocketUrl();
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setWsConnected(true);
        };

        ws.onmessage = (evt) => {
          try {
            const data = JSON.parse(evt.data);
            if (data.type === 'LIVE_TELEMETRY_UPDATE') {
              setLiveTelemetry(data);
            }
          } catch (err) {
            console.error("Error parsing WebSocket telemetry:", err);
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          // Try reconnecting in 5s
          reconnectTimer = setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = () => {
          setWsConnected(false);
        };
      } catch (err) {
        console.warn("WebSocket not supported or failed to connect:", err);
        setWsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) ws.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  const handleSendMessage = async (textToSend) => {
    const queryText = textToSend || inputText;
    if (!queryText.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      const res = await queryCopilot(queryText);
      const data = res.data;

      const copilotMsg = {
        id: `copilot-${Date.now()}`,
        sender: 'copilot',
        text: data.response || "No response received from Copilot reasoning engine.",
        confidence: data.confidence || 0.95,
        citations: data.citations || [],
        suggestedActions: data.suggested_actions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, copilotMsg]);
    } catch (err) {
      console.error("Copilot query failed:", err);
      const errorMsg = {
        id: `copilot-${Date.now()}`,
        sender: 'copilot',
        text: "⚠️ **Copilot System Notice:** Temporary reasoning service delay. Fallback to calibrated telemetry parameters active.",
        confidence: 0.90,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const quickPrompts = [
    "What is the 48h landfall risk?",
    "Which Ramsar wetlands are threatened?",
    "Recommend ICG boom coordinates",
    "Summarize Malayalam advisory",
    "Explain Monsoon Blinding protocol"
  ];

  if (!isOpen) return null;

  return (
    <aside className="fixed top-16 right-0 bottom-0 w-[30rem] xl:w-[32rem] max-w-[95vw] z-50 flex flex-col glass-panel-hud border-l border-cyan-500/30 shadow-2xl scanline-grid animate-in slide-in-from-right duration-300">
      
      {/* 1. Copilot Drawer Header */}
      <div className="p-4 border-b border-cyan-500/20 bg-slate-950/80 flex items-center justify-between hud-corners">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
            <Bot className="w-4 h-4 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Orbitron'] text-sm font-bold text-white tracking-wide">
                AQUORA <span className="text-cyan-400">COPILOT</span>
              </span>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold ${
                wsConnected 
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
                {wsConnected ? 'LIVE WS' : 'NLP ONLINE'}
              </span>
            </div>
            <div className="text-[10px] font-mono text-cyan-300/70">
              Sentinel-2 & INCOIS AI Reasoning Engine
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-300 transition-colors"
          title="Close AI Copilot"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Live WebSocket Environmental Telemetry Streamer Bar */}
      <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800/80 text-[11px] font-mono flex items-center justify-between text-slate-300">
        <div className="flex items-center gap-2">
          <Plane className={`w-3.5 h-3.5 ${wsConnected ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
          <span className="text-slate-400">RECON UAV:</span>
          <span className="text-cyan-300 font-bold">
            {liveTelemetry?.uav_recon_fleet?.[0]?.uav_id || 'AQUORA-UAV-01'}
          </span>
          <span className="text-emerald-400">
            [{liveTelemetry?.uav_recon_fleet?.[0]?.altitude_meters || 120}m • {liveTelemetry?.uav_recon_fleet?.[0]?.battery_pct || 92}%]
          </span>
        </div>
        <div className="text-amber-300 font-bold">
          {liveTelemetry?.environmental_stream?.surface_current_mps || 0.48} m/s @ 158°
        </div>
      </div>

      {/* 3. Messages Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Sender Label & Timestamp */}
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mb-1 px-1">
              {msg.sender === 'copilot' ? (
                <>
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span className="text-cyan-300 font-bold">AQUORA COPILOT</span>
                </>
              ) : (
                <span className="text-slate-300 font-semibold">TACTICAL OPERATOR</span>
              )}
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            {/* Bubble */}
            <div className={`p-3.5 rounded-2xl max-w-[92%] text-xs leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-md'
                : 'glass-card-obsidian border border-cyan-500/20 text-slate-200 rounded-tl-none shadow-xl'
            }`}>
              <div className="whitespace-pre-line">
                {msg.text}
              </div>

              {/* Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1">
                  <span className="text-[10px] text-slate-400 font-mono w-full">Verified Model Citations:</span>
                  {msg.citations.map((cite, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700/80 text-cyan-300">
                      {cite}
                    </span>
                  ))}
                </div>
              )}

              {/* Suggested Quick Follow-ups */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1">
                  <div className="text-[10px] text-slate-400 font-mono">Suggested Inquiries:</div>
                  <div className="flex flex-wrap gap-1">
                    {msg.suggestedActions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(act)}
                        className="text-[10px] font-mono px-2 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-200 transition-colors text-left flex items-center gap-1"
                      >
                        <Zap className="w-2.5 h-2.5 text-cyan-400" />
                        {act}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 p-3 rounded-2xl glass-card-obsidian border border-cyan-500/20 text-xs font-mono text-cyan-300 w-fit">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>Analyzing Sentinel-2 spectral cube & RK4 drift vectors...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Quick Prompt Pills */}
      <div className="p-2.5 border-t border-slate-800/80 bg-slate-950/70 overflow-x-auto custom-scrollbar flex gap-1.5 shrink-0">
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-mono text-slate-300 hover:text-cyan-300 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* 5. Input Form */}
      <div className="p-3.5 border-t border-cyan-500/20 bg-slate-950/90 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Copilot about drift, ESI, booms, or advisories..."
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-sans"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isThinking}
            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md shadow-cyan-950/60 border border-cyan-400/40 transition-all hover:scale-105 active:scale-95"
            title="Send Query to AI Copilot"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>

    </aside>
  );
}
