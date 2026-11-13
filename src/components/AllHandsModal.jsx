import React from 'react';
import { Sparkles, Users, MessageSquareQuote, CheckCircle } from 'lucide-react';

export default function AllHandsModal({ isAllHands, onClose }) {
  if (!isAllHands) return null;

  return (
    <div className="all-hands-banner">
      <div className="all-hands-badge">
        <Users style={{ width: '16px', height: '16px' }} />
        <span>ALL-HANDS SPRINT IN SESSION</span>
      </div>
      <p className="all-hands-subtitle">
        All 5 autonomous AI agents have gathered at the Central Boardroom table to synthesize findings and build consensus.
      </p>
      <div className="all-hands-quote-ticker">
        <MessageSquareQuote style={{ width: '18px', height: '18px', color: '#38bdf8' }} />
        <span className="ticker-text">
          Aria: "Nova, confirm sub-10ms token streaming latency." — Nova: "Validated on SIMD kernels." — Pixel: "Glass shaders optimized."
        </span>
      </div>
      <button onClick={onClose} className="btn-dismiss-boardroom">
        Return Agents to Workstations
      </button>
    </div>
  );
}
