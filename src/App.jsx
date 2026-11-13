import React, { useState, useEffect, useCallback } from 'react';
import Office2DCanvas from './components/Office2DCanvas';
import AgentCardOverlay from './components/AgentCardOverlay';
import { INITIAL_AGENTS } from './data/agentsData';
import { officeAudio } from './utils/officeAudio';

export default function App() {
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isAllHands, setIsAllHands] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  // Native Default Fullscreen Immersion on initial interaction (like LAF)
  useEffect(() => {
    const handleInitialFullscreen = () => {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    };

    window.addEventListener('click', handleInitialFullscreen, { once: true });
    window.addEventListener('keydown', handleInitialFullscreen, { once: true });

    return () => {
      window.removeEventListener('click', handleInitialFullscreen);
      window.removeEventListener('keydown', handleInitialFullscreen);
    };
  }, []);

  // Real-time Concurrent Autonomous Simulation Loop
  useEffect(() => {
    const intervalTime = Math.max(700, 2400 / simulationSpeed);

    const timer = setInterval(() => {
      const activeIdx = Math.floor(Math.random() * INITIAL_AGENTS.length);

      setAgents((prevAgents) => {
        const next = [...prevAgents];
        const target = { ...next[activeIdx] };

        let newProgress = (target.progress || 50) + Math.floor(Math.random() * 9) + 4;
        if (newProgress > 100) {
          newProgress = Math.floor(Math.random() * 20) + 10;
          const thought = target.thoughts[Math.floor(Math.random() * target.thoughts.length)];
          target.currentStatus = thought;
        }
        target.progress = newProgress;
        next[activeIdx] = target;
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [simulationSpeed]);

  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent);
  };

  const handleUpdateAgentTask = (agentId, newTask) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, currentStatus: newTask, progress: 15 } : a))
    );
  };

  return (
    <div
      className={`office-app-container ${isNightMode ? 'theme-night' : 'theme-day'}`}
      style={{
        width: '100vw',
        height: '100vh',
        height: '100dvh',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        margin: 0,
        padding: 0
      }}
    >
      {/* 2D Architectural Office (Full-Screen Pure Immersion) */}
      <Office2DCanvas
        agents={agents}
        selectedAgent={selectedAgent}
        onSelectAgent={handleSelectAgent}
        isAllHands={isAllHands}
        simulationSpeed={simulationSpeed}
        isNightMode={isNightMode}
      />

      {/* Slide-Over Workstation Inspector Card (Active on click) */}
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
