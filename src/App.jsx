import React, { useState, useEffect, useCallback } from 'react';
import Office3DCanvas from './components/Office3DCanvas';
import TopHUD from './components/TopHUD';
import OfficeControls from './components/OfficeControls';
import AgentCardOverlay from './components/AgentCardOverlay';
import RealtimeActivityFeed from './components/RealtimeActivityFeed';
import AllHandsModal from './components/AllHandsModal';
import { INITIAL_AGENTS, OFFICE_AREAS } from './data/agentsData';
import { officeAudio } from './utils/officeAudio';
import confetti from 'canvas-confetti';

export default function App() {
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [currentArea, setCurrentArea] = useState(OFFICE_AREAS[0]); // Overview
  const [isAllHands, setIsAllHands] = useState(false);
  const [isNightMode, setIsNightMode] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  // Live Activity Stream
  const [activities, setActivities] = useState([
    {
      id: 1,
      agentId: 'dev',
      agentName: 'Nova Rivera',
      color: '#3b82f6',
      message: 'Compiled Wasm SIMD token streamer kernels (0 warnings)',
      timestamp: 'Just now'
    },
    {
      id: 2,
      agentId: 'design',
      agentName: 'Pixel Maya',
      color: '#ec4899',
      message: 'Rendered PBR glassmorphic 3D shaders at 60 FPS',
      timestamp: '1m ago'
    },
    {
      id: 3,
      agentId: 'research',
      agentName: 'Dr. Atlas Vance',
      color: '#10b981',
      message: 'Synthesized 42 arXiv multimodal reasoning papers',
      timestamp: '2m ago'
    },
    {
      id: 4,
      agentId: 'devops',
      agentName: 'Cipher-9',
      color: '#f59e0b',
      message: 'Sentinel scan complete: 48/48 Kubernetes nodes healthy',
      timestamp: '3m ago'
    }
  ]);

  // Periodic Autonomous Activity Loop (Simulating real-time AI work)
  useEffect(() => {
    const intervalTime = Math.max(800, 2800 / simulationSpeed);

    const timer = setInterval(() => {
      // Pick a random agent to advance work
      const agentIndex = Math.floor(Math.random() * INITIAL_AGENTS.length);

      setAgents((prevAgents) => {
        const next = [...prevAgents];
        const target = { ...next[agentIndex] };

        // Increment progress
        let newProgress = (target.progress || 50) + Math.floor(Math.random() * 8) + 4;
        if (newProgress >= 100) {
          newProgress = 15;
          // Completed task event
          officeAudio.playDing();

          const completedMessages = [
            `Finished milestone: ${target.currentStatus}`,
            `Compiled module: ${target.currentFile}`,
            `Validated unit test coverage (100% green)`,
            `Published verified changes to production cluster`
          ];
          const newMsg = completedMessages[Math.floor(Math.random() * completedMessages.length)];

          setActivities((prev) => [
            {
              id: Date.now(),
              agentId: target.id,
              agentName: target.name,
              color: target.color,
              message: newMsg,
              timestamp: 'Just now'
            },
            ...prev.slice(0, 14)
          ]);
        }
        target.progress = newProgress;
        next[agentIndex] = target;
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [simulationSpeed]);

  // Handle User Dispatching Custom Mission to an Agent
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
              'Decomposing requirements into automated subroutines...',
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
          message: `Accepted new mission: "${newMission}"`,
          timestamp: 'Just now'
        },
        ...prev.slice(0, 14)
      ]);
    }
  }, [agents]);

  // Handle Agent Selection via Click or Feed Item
  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent);
  };

  const handleSelectAgentById = (agentId) => {
    const hit = agents.find((a) => a.id === agentId);
    if (hit) {
      setSelectedAgent(hit);
    }
  };

  const handleSelectArea = (area) => {
    setSelectedAgent(null);
    setCurrentArea(area);
  };

  return (
    <div className={`office-app-container ${isNightMode ? 'theme-night' : 'theme-day'}`}>
      {/* 3D WebGL Canvas Viewport */}
      <Office3DCanvas
        agents={agents}
        selectedAgent={selectedAgent}
        onSelectAgent={handleSelectAgent}
        isAllHands={isAllHands}
        currentArea={currentArea}
        isNightMode={isNightMode}
        simulationSpeed={simulationSpeed}
      />

      {/* Top HUD Bar */}
      <TopHUD
        activeAgentsCount={agents.length}
        isNightMode={isNightMode}
        setIsNightMode={setIsNightMode}
        isAllHands={isAllHands}
        setIsAllHands={setIsAllHands}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        simulationSpeed={simulationSpeed}
        setSimulationSpeed={setSimulationSpeed}
      />

      {/* All-Hands Meeting Top Banner */}
      <AllHandsModal
        isAllHands={isAllHands}
        onClose={() => setIsAllHands(false)}
      />

      {/* Bottom Camera Navigation Presets */}
      <OfficeControls
        currentArea={currentArea}
        onSelectArea={handleSelectArea}
      />

      {/* Realtime Activity Feed (Bottom-Right Ticker) */}
      <RealtimeActivityFeed
        activities={activities}
        onSelectAgentById={handleSelectAgentById}
      />

      {/* Slide-Over Workstation Inspector Card */}
      {selectedAgent && (
        <AgentCardOverlay
          agent={agents.find((a) => a.id === selectedAgent.id) || selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onUpdateAgentTask={handleUpdateAgentTask}
        />
      )}
    </div>
  );
}
