import React from 'react';
import { Compass, Users } from 'lucide-react';

export default function OfficeRadar({ agents, selectedAgent, onSelectAgent }) {
  // Office is roughly -12 to +12 in X and Z
  const mapScale = (val) => {
    // Map -12..12 to 15..145px
    return 80 + (val / 12) * 65;
  };

  return (
    <div className="radar-hud-card" title="Interactive Studio Radar (Click blip to zoom)">
      <div className="radar-header">
        <Compass style={{ width: '13px', height: '13px', color: 'var(--accent-cyan)' }} />
        <span>STUDIO RADAR</span>
      </div>

      <div className="radar-circle-display">
        <div className="radar-sweep-beam" />
        <div className="radar-ring ring-1" />
        <div className="radar-ring ring-2" />
        <div className="radar-crosshair-x" />
        <div className="radar-crosshair-y" />

        {/* Central Boardroom Marker */}
        <div
          className="radar-center-blip"
          style={{ left: '80px', top: '80px' }}
          title="Boardroom Center"
        />

        {/* Agent Position Blips */}
        {agents.map((agent) => {
          const x = mapScale(agent.deskPos[0]);
          const y = mapScale(agent.deskPos[2]);
          const isSelected = selectedAgent?.id === agent.id;

          return (
            <button
              key={agent.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectAgent(agent);
              }}
              className={`radar-agent-blip ${isSelected ? 'selected' : ''}`}
              style={{
                left: `${x}px`,
                top: `${y}px`,
                backgroundColor: agent.color,
                boxShadow: isSelected ? `0 0 12px ${agent.color}` : `0 0 6px ${agent.color}`
              }}
              title={`${agent.name} (${agent.title})`}
            >
              <span className="blip-label">{agent.name.charAt(0)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
