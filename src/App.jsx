import React, { useState, useEffect, useCallback } from 'react';
import Office2DCanvas from './components/Office2DCanvas';
import Office3DCanvas from './components/Office3DCanvas';
import AgentCardOverlay from './components/AgentCardOverlay';
import AllHandsModal from './components/AllHandsModal';
import FloatingStudioDock from './components/FloatingStudioDock';
import WalkControlsOverlay from './components/WalkControlsOverlay';
import { INITIAL_AGENTS, OFFICE_AREAS } from './data/agentsData';
import { officeAudio } from './utils/officeAudio';

export default function App() {
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [currentArea, setCurrentArea] = useState(null);
  const [isAllHands, setIsAllHands] = useState(false);
  const [isNightMode, setIsNightMode] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  // View Mode: 3D Autonomous AI Studio by default!
  const [viewMode, setViewMode] = useState('3d');
  const [navigationMode, setNavigationMode] = useState('orbit');
  const [nearbyAgent, setNearbyAgent] = useState(null);
  const [walkDirectionInput, setWalkDirectionInput] = useState(null);

  // Live Activity Stream
  const [activities, setActivities] = useState([
    {
      id: 1,
      agentId: 'gemini',
      agentName: 'Gemini 3.8 Omni',
      color: '#06b6d4',
      message: 'Antigravity CLI: Tool call verified sandboxed with zero errors',
      timestamp: 'Just now'
    },
    {
      id: 2,
      agentId: 'claude',
      agentName: 'Claude 3.7 Sonnet',
      color: '#f97316',
      message: 'Refactored state machine: 100% defensive try/catch coverage',
      timestamp: '1m ago'
    },
    {
      id: 3,
      agentId: 'deepseek',
      agentName: 'DeepSeek-R1',
      color: '#2563eb',
      message: 'Mathematical induction lemma 3 formally verified [Q.E.D.]',
      timestamp: '1m ago'
    },
    {
      id: 4,
      agentId: 'ollama',
      agentName: 'Ollama Fleet Core',
      color: '#e2e8f0',
      message: 'Local GPU VRAM: 12 models loaded, latency 4.2ms air-gapped',
      timestamp: '2m ago'
    },
    {
      id: 5,
      agentId: 'vision',
      agentName: 'Vision Sentinel',
      color: '#10b981',
      message: 'Vision OCR assistant: 4K frame analyzed with 0 visual defects',
      timestamp: '2m ago'
    },
    {
      id: 6,
      agentId: 'diffusion',
      agentName: 'Canvas Diffusion',
      color: '#ec4899',
      message: 'PBR glassmorphic shader compiled with 60 FPS bloom lighting',
      timestamp: '3m ago'
    },
    {
      id: 7,
      agentId: 'sentinel',
      agentName: 'Sentinel Fleet Ops',
      color: '#eab308',
      message: 'Firebase fleet check: 8/8 live apps healthy, TLS 1.3 secured',
      timestamp: '3m ago'
    }
  ]);

  // Real-time Concurrent Autonomous Simulation Loop
  useEffect(() => {
    const intervalTime = Math.max(700, 2400 / simulationSpeed);

    const timer = setInterval(() => {
      const activeIdx = Math.floor(Math.random() * INITIAL_AGENTS.length);

      setAgents((prevAgents) => {
        const next = [...prevAgents];
        const target = { ...next[activeIdx] };

        let newProgress = (target.progress || 50) + Math.floor(Math.random() * 9) + 4;

        if (newProgress >= 100) {
          newProgress = 16;
          officeAudio.playDing();

          const eventMessages = {
            gemini: [
              'Antigravity CLI: Tool call verified sandboxed with zero errors',
              'Synthesized clean codebase diff with zero layout shift',
              'Evaluated multi-modal browser DOM AST trees'
            ],
            claude: [
              'Enforced defensive boundaries across async promises',
              'Clean architecture audit: zero memory leaks detected',
              'Refactored state machine with Object.freeze guarantees'
            ],
            deepseek: [
              'Mathematical induction lemma formally verified [Q.E.D.]',
              'Falsified hypothesis on recursion limit with counter-example',
              'Synthesized formal reasoning proof with 99.8% confidence'
            ],
            ollama: [
              'Local GPU VRAM: 12 models loaded, latency 4.2ms air-gapped',
              'Quantized INT4 weights mapped directly to unified memory',
              'Served local OpenAI-compatible endpoint with 0 network latency'
            ],
            vision: [
              'Vision OCR assistant: 4K frame analyzed with 0 visual defects',
              'Extracted spatial bounding boxes for UI components',
              'Checked 60-30-10 color ratio: WCAG AAA verified'
            ],
            diffusion: [
              'PBR glassmorphic shader compiled with 60 FPS bloom lighting',
              'Procedural SVG icon suite generated with crisp curves',
              'Rendered 3D Fresnel refraction on conference table'
            ],
            sentinel: [
              'Firebase fleet check: 8/8 live apps healthy, TLS 1.3 secured',
              'Client-side MutationObserver anti-tamper guard verified active',
              'Rotated ephemeral AES-GCM 256-bit encryption keys'
            ]
          };

          const pool = eventMessages[target.id] || ['Autonomous routine completed successfully'];
          const pickedMsg = pool[Math.floor(Math.random() * pool.length)];

          setActivities((prev) => [
            {
              id: Date.now(),
              agentId: target.id,
              agentName: target.name,
              color: target.color,
              message: pickedMsg,
              timestamp: 'Just now'
            },
            ...prev.slice(0, 16)
          ]);
        }

        target.progress = newProgress;
        next[activeIdx] = target;
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [simulationSpeed]);

  const handleUpdateAgentTask = useCallback((agentId, newMission) => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id === agentId) {
          return {
            ...a,
            currentStatus: newMission,
            progress: 10,
            thoughts: [
              `User dispatched directive: "${newMission}"`,
              'Decomposing mission into verifiable first-principles subroutines...',
              ...a.thoughts.slice(0, 2)
            ]
          };
        }
        return a;
      })
    );

    const hit = agents.find((a) => a.id === agentId);
    if (hit) {
      setActivities((prev) => [
        {
          id: Date.now(),
          agentId: hit.id,
          agentName: hit.name,
          color: hit.color,
          message: `Accepted user mission: "${newMission}"`,
          timestamp: 'Just now'
        },
        ...prev.slice(0, 16)
      ]);
    }
  }, [agents]);

  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent);
    setCurrentArea(null);
  };

  const handleSelectAgentById = (agentId) => {
    const hit = agents.find((a) => a.id === agentId);
    if (hit) {
      setSelectedAgent(hit);
      setCurrentArea(null);
    }
  };

  const handleSelectArea = (area) => {
    if (viewMode === '2d') setViewMode('3d');
    setNavigationMode('orbit');
    setSelectedAgent(null);
    setCurrentArea(area);
  };

  return (
    <div className={`office-app-container ${isNightMode ? 'theme-night' : 'theme-day'}`}>
      {/* 2D TOP VIEW OFFICE (DEFAULT) vs 3D STUDIO */}
      {viewMode === '2d' ? (
        <Office2DCanvas
          agents={agents}
          selectedAgent={selectedAgent}
          onSelectAgent={handleSelectAgent}
          isAllHands={isAllHands}
          simulationSpeed={simulationSpeed}
          isNightMode={isNightMode}
        />
      ) : (
        <Office3DCanvas
          agents={agents}
          selectedAgent={selectedAgent}
          onSelectAgent={handleSelectAgent}
          isAllHands={isAllHands}
          currentArea={currentArea}
          isNightMode={isNightMode}
          simulationSpeed={simulationSpeed}
          navigationMode={navigationMode}
          onNearAgent={setNearbyAgent}
          walkDirectionInput={walkDirectionInput}
        />
      )}

      {/* Slide-Over Workstation Inspector Card (Active on click) */}
      {selectedAgent && (
        <AgentCardOverlay
          agent={agents.find((a) => a.id === selectedAgent.id) || selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onUpdateAgentTask={handleUpdateAgentTask}
        />
      )}

      {/* Floating Studio Navigation Dock (Minimal, Glassmorphic, Unobtrusive) */}
      <FloatingStudioDock
        viewMode={viewMode}
        setViewMode={setViewMode}
        navigationMode={navigationMode}
        setNavigationMode={setNavigationMode}
        currentArea={currentArea}
        onSelectArea={handleSelectArea}
        isAllHands={isAllHands}
        setIsAllHands={setIsAllHands}
        isNightMode={isNightMode}
        setIsNightMode={setIsNightMode}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {/* Walking Style HUD Controls (Only active when in 3D Walk mode) */}
      {viewMode === '3d' && navigationMode === 'walk' && (
        <WalkControlsOverlay
          navigationMode={navigationMode}
          nearbyAgent={nearbyAgent}
          onInteractAgent={handleSelectAgent}
          setWalkDirectionInput={setWalkDirectionInput}
        />
      )}
    </div>
  );
}
