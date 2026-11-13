import React from 'react';
import { OFFICE_AREAS } from '../data/agentsData';
import { Video, Layers, Compass } from 'lucide-react';

export default function OfficeControls({ currentArea, onSelectArea }) {
  return (
    <nav className="office-controls-nav" aria-label="Camera Views">
      <div className="office-controls-label">
        <Compass style={{ width: '14px', height: '14px', color: 'var(--accent-primary)' }} />
        <span>Camera Presets</span>
      </div>
      <div className="office-controls-pills">
        {OFFICE_AREAS.map((area) => (
          <button
            key={area.id}
            onClick={() => onSelectArea(area)}
            className={`area-pill-btn ${currentArea?.id === area.id ? 'active' : ''}`}
          >
            {area.name}
          </button>
        ))}
      </div>
    </nav>
  );
}
