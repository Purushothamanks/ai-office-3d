import React, { useState } from 'react';
import { Activity, ChevronDown, ChevronUp, Terminal, Shield, Sparkles } from 'lucide-react';

export default function RealtimeActivityFeed({ activities, onSelectAgentById }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`activity-feed-widget ${collapsed ? 'collapsed' : ''}`}>
      <div className="activity-feed-header" onClick={() => setCollapsed(!collapsed)}>
        <div className="activity-feed-title">
          <Activity style={{ width: '15px', height: '15px', color: '#10b981' }} />
          <span>Realtime Office Feed</span>
          <span className="live-feed-indicator" />
        </div>
        <button className="feed-toggle-btn" title={collapsed ? 'Expand feed' : 'Collapse feed'}>
          {collapsed ? <ChevronUp style={{ width: '16px', height: '16px' }} /> : <ChevronDown style={{ width: '16px', height: '16px' }} />}
        </button>
      </div>

      {!collapsed && (
        <div className="activity-feed-list">
          {activities.map((item) => (
            <div
              key={item.id}
              className="activity-feed-item"
              onClick={() => onSelectAgentById(item.agentId)}
              title="Click to focus workstation"
            >
              <div className="activity-feed-bullet" style={{ backgroundColor: item.color }} />
              <div className="activity-feed-content">
                <div className="activity-feed-top">
                  <span className="activity-agent-name" style={{ color: item.color }}>{item.agentName}</span>
                  <span className="activity-time">{item.timestamp}</span>
                </div>
                <div className="activity-text">{item.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
