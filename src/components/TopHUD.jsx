import React, { useState, useEffect } from 'react';
import { Sun, Moon, Volume2, VolumeX, Users, Camera, Sparkles, Activity, LayoutGrid, Box, Footprints, Eye } from 'lucide-react';
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
  setSimulationSpeed,
  navigationMode,
  setNavigationMode,
  viewMode = '2d',
  setViewMode
}) {
  const [fps, setFps] = useState(60);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const checkFps = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(Math.min(60, Math.round((frameCount * 1000) / (now - lastTime))));
        frameCount = 0;
        lastTime = now;
      }
      requestAnimationFrame(checkFps);
    };

    const animId = requestAnimationFrame(checkFps);
    return () => cancelAnimationFrame(animId);
  }, []);

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
          particleCount: 65,
          spread: 75,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    } else {
      officeAudio.playDing();
    }
  };

  const handleTakeSnapshot = () => {
    if (typeof window.__captureOffice3DSnapshot === 'function') {
      window.__captureOffice3DSnapshot();
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
            <h1 className="top-hud-title">{viewMode === '2d' ? 'AI Office 2D' : 'AI Studio 3D'}</h1>
            <span className="badge-live-agents">
              <Users style={{ width: '13px', height: '13px' }} />
              {activeAgentsCount} AI Engines Live
            </span>
            <span className="badge-fps-meter">
              <Activity style={{ width: '12px', height: '12px', color: '#10b981' }} />
              {fps} FPS
            </span>
          </div>
          <p className="top-hud-subtitle">
            {viewMode === '2d'
              ? 'Realtime Autonomous 2D Floorplan & Walking Multi-Agent Studio'
              : 'Architectural Walking Studio & Realtime Multi-Agent Lab'}
          </p>
        </div>
      </div>

      {/* Action Controls Cluster */}
      <div className="top-hud-actions">
        {/* View Mode Switcher: 2D Top View vs 3D Studio */}
        <button
          onClick={() => {
            const nextMode = viewMode === '2d' ? '3d' : '2d';
            setViewMode(nextMode);
            officeAudio.playDing();
          }}
          className={`nav-mode-toggle-btn ${viewMode === '2d' ? 'mode-walk' : 'mode-orbit'}`}
          title={viewMode === '2d' ? 'Switch to 3D Walking Studio' : 'Switch to 2D Top View Office'}
        >
          {viewMode === '2d' ? (
            <>
              <LayoutGrid style={{ width: '15px', height: '15px', color: '#10b981' }} />
              <span>2D Top View</span>
            </>
          ) : (
            <>
              <Box style={{ width: '15px', height: '15px', color: '#38bdf8' }} />
              <span>3D Studio</span>
            </>
          )}
        </button>

        {/* 3D Navigation Mode Switcher (Visible when in 3D mode) */}
        {viewMode === '3d' && (
          <button
            onClick={() => {
              setNavigationMode(navigationMode === 'walk' ? 'orbit' : 'walk');
              officeAudio.playDing();
            }}
            className={`nav-mode-toggle-btn ${navigationMode === 'walk' ? 'mode-walk' : 'mode-orbit'}`}
            title={navigationMode === 'walk' ? 'Switch to Drone Orbit Camera' : 'Switch to First-Person Walk Mode (WASD)'}
          >
            {navigationMode === 'walk' ? (
              <>
                <Footprints style={{ width: '15px', height: '15px', color: '#10b981' }} />
                <span>Walk (WASD)</span>
              </>
            ) : (
              <>
                <Eye style={{ width: '15px', height: '15px', color: '#38bdf8' }} />
                <span>Orbit</span>
              </>
            )}
          </button>
        )}

        {/* Snapshot Button */}
        <button
          onClick={handleTakeSnapshot}
          className="hud-action-pill-btn"
          title="Take 4K Studio Snapshot"
        >
          <Camera style={{ width: '15px', height: '15px', color: '#38bdf8' }} />
          <span>Snapshot</span>
        </button>

        {/* All-Hands Sprint Button */}
        <button
          onClick={handleToggleAllHands}
          className={`btn-all-hands ${isAllHands ? 'active-sprint' : ''}`}
          title={isAllHands ? 'Dismiss All-Hands & return to desks' : 'Gather all agents to Central Boardroom'}
        >
          <Sparkles style={{ width: '15px', height: '15px' }} />
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
          title={isNightMode ? 'Switch to Day Studio Mode' : 'Switch to Cyber Neon Night Mode'}
          aria-label="Toggle theme"
        >
          {isNightMode ? <Sun style={{ width: '17px', height: '17px', color: '#f59e0b' }} /> : <Moon style={{ width: '17px', height: '17px', color: '#38bdf8' }} />}
        </button>

        {/* Sound Toggle */}
        <button
          onClick={handleToggleSound}
          className="hud-icon-btn"
          title={isMuted ? 'Unmute Procedural Audio' : 'Mute Procedural Audio'}
          aria-label="Toggle sound"
        >
          {isMuted ? <VolumeX style={{ width: '17px', height: '17px', color: 'var(--text-muted)' }} /> : <Volume2 style={{ width: '17px', height: '17px', color: '#10b981' }} />}
        </button>
      </div>
    </header>
  );
}
