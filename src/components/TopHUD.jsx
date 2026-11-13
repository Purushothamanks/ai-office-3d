import React from 'react';
import { Sun, Moon, Volume2, VolumeX, Users, Zap, Shield, Sparkles } from 'lucide-react';
import { officeAudio } from '../utils/officeAudio';
import confetti from 'canvas-confetti';

export default function TopHUD({
  activeAgentsCount,
  isNightMode,
  setIsNightMode,
  isAllHands,
  setIsAllHands,
  isMuted,
  setIsMuted,
  simulationSpeed,
  setSimulationSpeed
}) {
  const handleToggleSound = () => {
    const unmuted = officeAudio.toggleMute();
    setIsMuted(!unmuted);
  };

  const handleToggleAllHands = () => {
    const nextState = !isAllHands;
    setIsAllHands(nextState);
    if (nextState) {
      officeAudio.playAllHandsChime();
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    } else {
      officeAudio.playDing();
    }
  };

  return (
    <header className="top-hud-bar">
      {/* Brand & Studio Status */}
      <div className="top-hud-brand">
        <div className="top-hud-logo-wrapper">
          <span className="top-hud-logo-icon">🏢</span>
          <span className="live-pulse-dot" />
        </div>
        <div>
          <div className="top-hud-title-row">
            <h1 className="top-hud-title">AI Studio 3D</h1>
            <span className="badge-live-agents">
              <Users style={{ width: '13px', height: '13px' }} />
              {activeAgentsCount} Agents Live
            </span>
          </div>
          <p className="top-hud-subtitle">Realtime Autonomous 3D Multi-Agent Workplace</p>
        </div>
      </div>

      {/* Action Controls Cluster */}
      <div className="top-hud-actions">
        {/* All-Hands Sprint Button */}
        <button
          onClick={handleToggleAllHands}
          className={`btn-all-hands ${isAllHands ? 'active-sprint' : ''}`}
          title={isAllHands ? 'Dismiss All-Hands & return to desks' : 'Gather all agents to Central Boardroom'}
        >
          <Sparkles style={{ width: '16px', height: '16px' }} />
          <span>{isAllHands ? 'Exit Boardroom' : 'All-Hands Meeting'}</span>
        </button>

        {/* Speed Controls */}
        <div className="speed-pill-group">
          {[1, 2, 5].map((speed) => (
            <button
              key={speed}
              onClick={() => setSimulationSpeed(speed)}
              className={`speed-pill-btn ${simulationSpeed === speed ? 'active' : ''}`}
              title={`Simulation Speed ${speed}x`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Day / Night Toggle */}
        <button
          onClick={() => setIsNightMode(!isNightMode)}
          className="hud-icon-btn"
          title={isNightMode ? 'Switch to Day Mode' : 'Switch to Cyber Neon Night Mode'}
          aria-label="Toggle theme"
        >
          {isNightMode ? <Sun style={{ width: '18px', height: '18px', color: '#f59e0b' }} /> : <Moon style={{ width: '18px', height: '18px', color: '#38bdf8' }} />}
        </button>

        {/* Sound Toggle */}
        <button
          onClick={handleToggleSound}
          className="hud-icon-btn"
          title={isMuted ? 'Unmute Office Audio' : 'Mute Office Audio'}
          aria-label="Toggle sound"
        >
          {isMuted ? <VolumeX style={{ width: '18px', height: '18px', color: 'var(--text-muted)' }} /> : <Volume2 style={{ width: '18px', height: '18px', color: '#10b981' }} />}
        </button>
      </div>
    </header>
  );
}
