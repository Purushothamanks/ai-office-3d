import React, { useState, useEffect } from 'react';
import { X, Send, Terminal, Cpu, CheckCircle2, Sparkles, Copy, Check, Activity } from 'lucide-react';
import { officeAudio } from '../utils/officeAudio';
import confetti from 'canvas-confetti';

export default function AgentCardOverlay({ agent, onClose, onUpdateAgentTask }) {
  const [promptText, setPromptText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!agent) return null;

  const handleCopyCode = () => {
    if (agent.codeSnippets?.[0]) {
      navigator.clipboard.writeText(agent.codeSnippets[0]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmitTask = (e) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    setIsSubmitting(true);
    officeAudio.playDing();

    setTimeout(() => {
      onUpdateAgentTask(agent.id, promptText.trim());
      setPromptText('');
      setIsSubmitting(false);
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { x: 0.8, y: 0.5 }
        });
      } catch (err) {}
    }, 400);
  };

  return (
    <aside className="agent-overlay-panel" aria-label={`Workstation details for ${agent.name}`}>
      {/* Header */}
      <div className="agent-overlay-header">
        <div className="agent-badge-cluster">
          <div
            className="agent-avatar-circle"
            style={{
              backgroundColor: agent.color,
              boxShadow: `0 0 16px ${agent.color}80`
            }}
          >
            {agent.name.charAt(0)}
          </div>
          <div>
            <h2 className="agent-name-title">{agent.name}</h2>
            <div className="agent-handle-row">
              <span className="agent-handle">{agent.handle}</span>
              <span className="agent-dept-tag">{agent.department}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="agent-overlay-close-btn" title="Close inspector">
          <X style={{ width: '18px', height: '18px' }} />
        </button>
      </div>

      <div className="agent-overlay-body">
        {/* Role & Status */}
        <div className="agent-status-card">
          <div className="agent-status-title-row">
            <span className="status-indicator-dot" style={{ backgroundColor: agent.color }} />
            <span className="status-label">ACTIVE MISSION</span>
          </div>
          <p className="agent-current-task">{agent.currentStatus}</p>

          {/* Progress Bar */}
          <div className="progress-container">
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${agent.progress || 60}%`,
                  backgroundColor: agent.color,
                  boxShadow: `0 0 12px ${agent.color}`
                }}
              />
            </div>
            <div className="progress-meta">
              <span>Execution State</span>
              <span>{agent.progress || 60}%</span>
            </div>
          </div>
        </div>

        {/* Live Thoughts Stream */}
        <div className="agent-section-card">
          <div className="section-title-row">
            <Activity style={{ width: '14px', height: '14px', color: agent.color }} />
            <span>Inner Cognitive Stream</span>
          </div>
          <div className="thoughts-stream-box">
            {agent.thoughts?.map((thought, idx) => (
              <div key={idx} className="thought-item">
                <span className="thought-bullet" style={{ color: agent.color }}>›</span>
                <span>{thought}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Work Output / Code Window */}
        <div className="agent-section-card">
          <div className="section-title-row">
            <Terminal style={{ width: '14px', height: '14px', color: agent.color }} />
            <span>Active Buffer: {agent.currentFile}</span>
            <button
              onClick={handleCopyCode}
              className="btn-copy-code"
              title="Copy snippet"
            >
              {copied ? <Check style={{ width: '12px' }} /> : <Copy style={{ width: '12px' }} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="code-output-block">
            <code>{agent.codeSnippets?.[0] || '// Executing autonomous routine...'}</code>
          </pre>
        </div>

        {/* Realtime KPI Stats */}
        <div className="agent-stats-grid">
          {Object.entries(agent.stats || {}).map(([key, val]) => (
            <div key={key} className="stat-pill-box">
              <span className="stat-label">{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>
              <span className="stat-value" style={{ color: agent.color }}>{val}</span>
            </div>
          ))}
        </div>

        {/* Interactive Mission Dispatch Form */}
        <form onSubmit={handleSubmitTask} className="agent-prompt-form">
          <label className="prompt-form-label">
            <Sparkles style={{ width: '14px', height: '14px', color: 'var(--accent-primary)' }} />
            <span>Dispatch New Mission to {agent.name.split(' ')[0]}</span>
          </label>
          <div className="prompt-input-row">
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g. Optimize latency, draft shader, or synthesize paper..."
              className="prompt-text-input"
            />
            <button
              type="submit"
              disabled={isSubmitting || !promptText.trim()}
              className="btn-dispatch-prompt"
              style={{ backgroundColor: agent.color }}
            >
              <Send style={{ width: '15px', height: '15px' }} />
            </button>
          </div>
        </form>
      </div>
    </aside>
  );
}
