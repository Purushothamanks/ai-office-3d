import React from 'react';
import {
  Box,
  LayoutGrid,
  Users,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Footprints,
  Orbit,
  Sparkles,
  Zap
} from 'lucide-react';
import { OFFICE_AREAS } from '../data/agentsData';
import { officeAudio } from '../utils/officeAudio';
import confetti from 'canvas-confetti';

export default function FloatingStudioDock({
  viewMode,
  setViewMode,
  navigationMode,
  setNavigationMode,
  currentArea,
  onSelectArea,
  isAllHands,
  setIsAllHands,
  isNightMode,
  setIsNightMode,
  isMuted,
  setIsMuted
}) {
  const handleToggleSound = () => {
    const unmuted = officeAudio.toggleMute();
    setIsMuted(!unmuted);
  };

  const handleToggleAllHands = () => {
    const next = !isAllHands;
    setIsAllHands(next);
    if (next) {
      officeAudio.playAllHandsChime();
      try {
        confetti({
          particleCount: 55,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    } else {
      officeAudio.playDing();
    }
  };

  return (
    <nav
      className="floating-studio-dock"
      aria-label="Studio Navigation Dock"
      style={{
        position: 'fixed',
        bottom: '22px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        borderRadius: '32px',
        padding: '6px 14px',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.55), 0 0 24px rgba(56, 189, 248, 0.12)',
        maxWidth: '95vw',
        overflowX: 'auto'
      }}
    >
      {/* 1. View Mode Switcher: 3D vs 2D */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '24px',
          padding: '3px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <button
          onClick={() => {
            setViewMode('3d');
            officeAudio.playDing();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: viewMode === '3d' ? 'linear-gradient(135deg, #0284c7, #2563eb)' : 'transparent',
            color: viewMode === '3d' ? '#ffffff' : '#94a3b8',
            border: 'none',
            borderRadius: '20px',
            padding: '5px 12px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: viewMode === '3d' ? '0 0 14px rgba(37, 99, 235, 0.5)' : 'none'
          }}
          title="Switch to Interactive 3D Studio"
        >
          <Box style={{ width: '14px', height: '14px' }} />
          <span>3D Studio</span>
        </button>

        <button
          onClick={() => {
            setViewMode('2d');
            officeAudio.playDing();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: viewMode === '2d' ? 'linear-gradient(135deg, #059669, #10b981)' : 'transparent',
            color: viewMode === '2d' ? '#ffffff' : '#94a3b8',
            border: 'none',
            borderRadius: '20px',
            padding: '5px 12px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: viewMode === '2d' ? '0 0 14px rgba(16, 185, 129, 0.5)' : 'none'
          }}
          title="Switch to 2D Top-Down Floorplan"
        >
          <LayoutGrid style={{ width: '14px', height: '14px' }} />
          <span>2D Floorplan</span>
        </button>
      </div>

      <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255, 255, 255, 0.15)', margin: '0 4px' }} />

      {/* 2. 3D Camera Quick-Glide Chips (Active in 3D Mode) */}
      {viewMode === '3d' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto' }}>
          {OFFICE_AREAS.slice(0, 5).map((area) => {
            const isActive = currentArea?.id === area.id;
            return (
              <button
                key={area.id}
                onClick={() => {
                  onSelectArea(area);
                  officeAudio.playDing();
                }}
                style={{
                  background: isActive ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                  color: isActive ? '#38bdf8' : '#cbd5e1',
                  border: isActive ? '1px solid rgba(56, 189, 248, 0.6)' : '1px solid transparent',
                  borderRadius: '16px',
                  padding: '4px 9px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.18s ease'
                }}
                title={`Glide camera to ${area.name}`}
              >
                {area.name.split(' ')[0]} {area.name.split(' ')[1] || ''}
              </button>
            );
          })}
        </div>
      )}

      {/* 3. 3D Navigation Mode (Orbit 360 vs Walk WASD) */}
      {viewMode === '3d' && (
        <>
          <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255, 255, 255, 0.15)', margin: '0 4px' }} />
          <button
            onClick={() => {
              setNavigationMode(navigationMode === 'orbit' ? 'walk' : 'orbit');
              officeAudio.playDing();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: navigationMode === 'walk' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.15)',
              color: navigationMode === 'walk' ? '#34d399' : '#38bdf8',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '20px',
              padding: '5px 11px',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
            title={navigationMode === 'orbit' ? 'Switch to First-Person Walking (WASD)' : 'Switch to 360 Orbit Drone Camera'}
          >
            {navigationMode === 'orbit' ? (
              <>
                <Orbit style={{ width: '13px', height: '13px' }} />
                <span>360° Orbit</span>
              </>
            ) : (
              <>
                <Footprints style={{ width: '13px', height: '13px' }} />
                <span>Walk (WASD)</span>
              </>
            )}
          </button>
        </>
      )}

      <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255, 255, 255, 0.15)', margin: '0 4px' }} />

      {/* 4. All-Hands Sprint Button */}
      <button
        onClick={handleToggleAllHands}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          background: isAllHands
            ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
            : 'rgba(255, 255, 255, 0.08)',
          color: isAllHands ? '#ffffff' : '#f8fafc',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '20px',
          padding: '5px 12px',
          fontSize: '11px',
          fontWeight: '700',
          cursor: 'pointer',
          boxShadow: isAllHands ? '0 0 16px rgba(245, 158, 11, 0.5)' : 'none',
          whiteSpace: 'nowrap'
        }}
        title="Summon all AI agents to Central Boardroom"
      >
        <Sparkles style={{ width: '13px', height: '13px', color: isAllHands ? '#ffffff' : '#f59e0b' }} />
        <span>{isAllHands ? 'End Sprint' : 'All-Hands'}</span>
      </button>

      {/* 5. Day / Night Toggle */}
      <button
        onClick={() => {
          setIsNightMode(!isNightMode);
          officeAudio.playDing();
        }}
        style={{
          background: 'none',
          border: 'none',
          color: isNightMode ? '#38bdf8' : '#f59e0b',
          cursor: 'pointer',
          padding: '5px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '50%'
        }}
        title={isNightMode ? 'Switch to Daylight Studio' : 'Switch to Cyber Night Studio'}
      >
        {isNightMode ? <Moon style={{ width: '15px', height: '15px' }} /> : <Sun style={{ width: '15px', height: '15px' }} />}
      </button>

      {/* 6. Sound Toggle */}
      <button
        onClick={handleToggleSound}
        style={{
          background: 'none',
          border: 'none',
          color: isMuted ? '#64748b' : '#10b981',
          cursor: 'pointer',
          padding: '5px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '50%'
        }}
        title={isMuted ? 'Unmute Audio Soundscape' : 'Mute Audio Soundscape'}
      >
        {isMuted ? <VolumeX style={{ width: '15px', height: '15px' }} /> : <Volume2 style={{ width: '15px', height: '15px' }} />}
      </button>
    </nav>
  );
}
