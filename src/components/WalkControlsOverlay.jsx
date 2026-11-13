import React from 'react';
import { Footprints, MessageSquare, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { officeAudio } from '../utils/officeAudio';

export default function WalkControlsOverlay({
  navigationMode,
  nearbyAgent,
  onInteractAgent,
  setWalkDirectionInput
}) {
  if (navigationMode !== 'walk') return null;

  const handleTouchDir = (dir) => {
    setWalkDirectionInput(dir);
  };

  const handleTouchEnd = () => {
    setWalkDirectionInput(null);
  };

  return (
    <>
      {/* Desktop Walking Guide Bar */}
      <div className="walk-guide-bar">
        <div className="walk-guide-icon-pill">
          <Footprints style={{ width: '14px', height: '14px', color: '#10b981' }} />
          <span>Walk Mode</span>
        </div>
        <div className="walk-guide-keys">
          <span className="key-badge">W</span>
          <span className="key-badge">A</span>
          <span className="key-badge">S</span>
          <span className="key-badge">D</span>
          <span className="walk-guide-text">to Walk • Drag to Look</span>
        </div>
      </div>

      {/* Proximity Interaction Prompt [E] */}
      {nearbyAgent && (
        <div
          className="proximity-interaction-card"
          onClick={() => {
            onInteractAgent(nearbyAgent);
            officeAudio.playDing();
          }}
          title="Press [E] on keyboard or click to talk"
        >
          <div className="proximity-avatar-dot" style={{ backgroundColor: nearbyAgent.color }}>
            {nearbyAgent.name.charAt(0)}
          </div>
          <div className="proximity-info">
            <div className="proximity-prompt-row">
              <span className="key-badge highlight">E</span>
              <span className="proximity-agent-name">Talk to {nearbyAgent.name}</span>
            </div>
            <span className="proximity-subtext">{nearbyAgent.title}</span>
          </div>
        </div>
      )}

      {/* Mobile Touch Virtual D-Pad (Visible on small screens) */}
      <div className="mobile-dpad-container" aria-label="Mobile Walking Controls">
        <button
          className="dpad-btn dpad-up"
          onPointerDown={() => handleTouchDir('forward')}
          onPointerUp={handleTouchEnd}
          onPointerLeave={handleTouchEnd}
        >
          <ChevronUp />
        </button>
        <div className="dpad-middle-row">
          <button
            className="dpad-btn dpad-left"
            onPointerDown={() => handleTouchDir('left')}
            onPointerUp={handleTouchEnd}
            onPointerLeave={handleTouchEnd}
          >
            <ChevronLeft />
          </button>
          <div className="dpad-center" />
          <button
            className="dpad-btn dpad-right"
            onPointerDown={() => handleTouchDir('right')}
            onPointerUp={handleTouchEnd}
            onPointerLeave={handleTouchEnd}
          >
            <ChevronRight />
          </button>
        </div>
        <button
          className="dpad-btn dpad-down"
          onPointerDown={() => handleTouchDir('backward')}
          onPointerUp={handleTouchEnd}
          onPointerLeave={handleTouchEnd}
        >
          <ChevronDown />
        </button>
      </div>
    </>
  );
}
