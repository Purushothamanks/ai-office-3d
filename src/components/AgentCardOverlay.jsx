import React, { useState, useEffect } from 'react';
import { X, Send, Terminal, Activity, Copy, Check, Sparkles, Play, Bot, Zap } from 'lucide-react';
import { officeAudio } from '../utils/officeAudio';
import confetti from 'canvas-confetti';

export default function AgentCardOverlay({ agent, onClose, onUpdateAgentTask }) {
  const [promptText, setPromptText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [terminalStream, setTerminalStream] = useState([]);

  if (!agent) return null;

  // Preset Action Chips tailored to each specific AI Engine
  const actionPresets = {
    gemini: [
      'Execute sandboxed AST tool call',
      'Optimize multi-step execution loop',
      'Evaluate browser DOM multimodal frame'
    ],
    claude: [
      'Refactor state machine with Object.freeze',
      'Audit async promises for defensive safety',
      'Verify zero memory leak event handlers'
    ],
    deepseek: [
      'Formally prove induction lemma 3',
      'Test edge-case boundary conditions at infinity',
      'Synthesize Lean theorem proof tree'
    ],
    ollama: [
      'Benchmark INT4 kernel inference latency',
      'Load quantized weights to unified VRAM',
      'Serve air-gapped local embedding stream'
    ],
    vision: [
      'Segment 4K browser frame bounding boxes',
      'Extract OCR text with 99.9% confidence',
      'Audit 60-30-10 color palette harmony'
    ],
    diffusion: [
      'Compile PBR frosted glass shader',
      'Generate procedural SVG vector icons',
      'Render 3D Fresnel refraction on table'
    ],
    sentinel: [
      'Scan all 8 Firebase live fleet sites',
      'Rotate ephemeral AES-GCM 256-bit keys',
      'Verify MutationObserver anti-tamper guard'
    ]
  };

  const chips = actionPresets[agent.id] || [
    'Run benchmark audit',
    'Compile production bundle',
    'Verify test suites'
  ];

  const handleCopyCode = () => {
    if (agent.codeSnippets?.[0]) {
      navigator.clipboard.writeText(agent.codeSnippets[0]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Real-time character-by-character streaming execution simulator
  const executeMissionStream = (missionTitle) => {
    setIsStreaming(true);
    officeAudio.playTyping();
    setTerminalStream([`> [${agent.handle}] Initializing mission: "${missionTitle}"`]);

    const steps = [
      `[STEP 1/4] Binding neural context window to ${agent.systemName}...`,
      `[STEP 2/4] Executing active buffer: ${agent.currentFile}...`,
      `[STEP 3/4] Running AST invariant verification & performance check...`,
      `[STEP 4/4] 100% verified. Output converged with 0 errors.`
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setTerminalStream((prev) => [...prev, step]);
        officeAudio.playTyping();

        if (idx === steps.length - 1) {
          setIsStreaming(false);
          officeAudio.playDing();
          onUpdateAgentTask(agent.id, missionTitle);
          try {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { x: 0.8, y: 0.5 }
            });
          } catch (e) {}
        }
      }, (idx + 1) * 450);
    });
  };

  const handleSubmitCustomPrompt = (e) => {
    e.preventDefault();
    if (!promptText.trim() || isStreaming) return;
    executeMissionStream(promptText.trim());
    setPromptText('');
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
            {agent.systemName && (
              <div style={{ fontSize: '0.72rem', color: agent.color, fontWeight: '700', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap style={{ width: '12px', height: '12px' }} />
                <span>{agent.systemName}</span>
              </div>
            )}
          </div>
        </div>
        <button onClick={onClose} className="agent-overlay-close-btn" title="Close inspector">
          <X style={{ width: '18px', height: '18px' }} />
        </button>
      </div>

      <div className="agent-overlay-body">
        {/* Active Mission & Progress */}
        <div className="agent-status-card">
          <div className="agent-status-title-row">
            <span className="status-indicator-dot" style={{ backgroundColor: agent.color }} />
            <span className="status-label">ACTIVE MISSION</span>
          </div>
          <p className="agent-current-task">{agent.currentStatus}</p>

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

        {/* Quick Action Chips (Instant Developer Actions) */}
        <div className="agent-chips-section">
          <div className="section-title-row">
            <Sparkles style={{ width: '14px', height: '14px', color: agent.color }} />
            <span>Instant Mission Directives</span>
          </div>
          <div className="action-chips-container">
            {chips.map((chip, idx) => (
              <button
                key={idx}
                disabled={isStreaming}
                onClick={() => executeMissionStream(chip)}
                className="action-chip-btn"
                style={{ '--chip-accent': agent.color }}
              >
                <Play style={{ width: '11px', height: '11px' }} />
                <span>{chip}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Streaming Terminal Buffer */}
        {terminalStream.length > 0 && (
          <div className="agent-section-card">
            <div className="section-title-row">
              <Terminal style={{ width: '14px', height: '14px', color: '#10b981' }} />
              <span>Live Terminal Stream</span>
              {isStreaming && <span className="streaming-spinner" />}
            </div>
            <div className="terminal-stream-window">
              {terminalStream.map((log, i) => (
                <div key={i} className="terminal-line">{log}</div>
              ))}
            </div>
          </div>
        )}

        {/* Inner Cognitive Stream */}
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

        {/* Code Snippet Window */}
        <div className="agent-section-card">
          <div className="section-title-row">
            <Terminal style={{ width: '14px', height: '14px', color: agent.color }} />
            <span>Source: {agent.currentFile}</span>
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

        {/* Custom Prompt Input */}
        <form onSubmit={handleSubmitCustomPrompt} className="agent-prompt-form">
          <label className="prompt-form-label">
            <Bot style={{ width: '14px', height: '14px', color: agent.color }} />
            <span>Prompt {agent.name.split(' ')[0]} Directly</span>
          </label>
          <div className="prompt-input-row">
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              disabled={isStreaming}
              placeholder={`Instruct ${agent.name.split(' ')[0]}...`}
              className="prompt-text-input"
            />
            <button
              type="submit"
              disabled={isStreaming || !promptText.trim()}
              className="btn-dispatch-prompt"
              style={{ backgroundColor: agent.color }}
              title="Dispatch Mission"
            >
              <Send style={{ width: '15px', height: '15px' }} />
            </button>
          </div>
        </form>
      </div>
    </aside>
  );
}
