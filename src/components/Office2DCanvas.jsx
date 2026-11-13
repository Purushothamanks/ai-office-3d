import React, { useRef, useEffect } from 'react';
import { OFFICE_ZONES, AGENT_DESKS } from '../data/office2dLayout';
import { officeAudio } from '../utils/officeAudio';

export default function Office2DCanvas({
  agents,
  selectedAgent,
  onSelectAgent,
  isAllHands,
  simulationSpeed = 1,
  isNightMode
}) {
  const canvasRef = useRef(null);

  // Autonomous walking agents simulation state
  const simRef = useRef({
    agentsState: new Map(),
    hoveredAgentId: null,
    animId: null,
    time: 0,
    speedRef: 1,
    isAllHandsRef: false
  });

  useEffect(() => {
    simRef.current.speedRef = simulationSpeed;
  }, [simulationSpeed]);

  useEffect(() => {
    simRef.current.isAllHandsRef = isAllHands;
  }, [isAllHands]);

  // Initialize Autonomous Walking Agent Entities
  useEffect(() => {
    const s = simRef.current;
    agents.forEach((agent, index) => {
      const desk = AGENT_DESKS[agent.id] || { x: 200, y: 200, faceAngle: 0 };
      if (!s.agentsState.has(agent.id)) {
        s.agentsState.set(agent.id, {
          id: agent.id,
          agent,
          x: desk.x,
          y: desk.y,
          targetX: desk.x,
          targetY: desk.y,
          deskX: desk.x,
          deskY: desk.y,
          seatX: OFFICE_ZONES.waypoints.boardroomSeats[index % 7].x,
          seatY: OFFICE_ZONES.waypoints.boardroomSeats[index % 7].y,
          state: 'AT_DESK',
          faceAngle: desk.faceAngle,
          walkStep: 0,
          speed: 1.8,
          timer: Math.random() * 8 + 4, // time until next routine action
          currentThought: agent.currentStatus
        });
      }
    });
  }, [agents]);

  // Main 2D Canvas Render Loop & Autonomous Agent AI
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const s = simRef.current;
    let lastTime = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      s.animId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = (now - lastTime) * 0.001 * s.speedRef;
      lastTime = now;
      s.time += delta;

      const rect = canvas.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;

      // Coordinate scaling factor based on 1000 x 650 reference grid
      const scaleX = W / 1000;
      const scaleY = H / 650;

      // ==========================================
      // 1. DRAW ARCHITECTURAL OFFICE FLOORPLAN
      // ==========================================

      // Studio Main Hardwood/Dark Slate Floor
      ctx.fillStyle = isNightMode ? '#070b14' : '#0b1120';
      ctx.fillRect(0, 0, W, H);

      // Floor Grid Pattern
      ctx.strokeStyle = isNightMode ? 'rgba(56, 189, 248, 0.04)' : 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 40 * scaleX;
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // ROOM 1: Central Boardroom (Center glass conference zone)
      const b = OFFICE_ZONES.boardroom;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(b.x * scaleX, b.y * scaleY, b.w * scaleX, b.h * scaleY);

      // Frosted Glass Boardroom Boundary
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x * scaleX, b.y * scaleY, b.w * scaleX, b.h * scaleY);

      // Boardroom Door Opening
      ctx.clearRect((b.x + b.w / 2 - 30) * scaleX, (b.y + b.h - 2) * scaleY, 60 * scaleX, 4 * scaleY);

      // Boardroom Title
      ctx.fillStyle = '#38bdf8';
      ctx.font = `bold ${Math.max(10, 11 * scaleX)}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText('CENTRAL BOARDROOM', (b.x + 15) * scaleX, (b.y + 20) * scaleY);

      // Central Oval Conference Table
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.beginPath();
      ctx.ellipse((b.x + b.w / 2) * scaleX, (b.y + b.h / 2 + 5) * scaleY, 90 * scaleX, 55 * scaleY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Rotating Center Holographic Core Blip
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc((b.x + b.w / 2) * scaleX, (b.y + b.h / 2 + 5) * scaleY, 8 * scaleX + Math.sin(s.time * 4) * 2, 0, Math.PI * 2);
      ctx.fill();

      // ROOM 2: Breakroom / Espresso Lounge (Top-Left)
      const br = OFFICE_ZONES.breakroom;
      ctx.fillStyle = 'rgba(24, 34, 58, 0.6)';
      ctx.fillRect(br.x * scaleX, br.y * scaleY, br.w * scaleX, br.h * scaleY);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.strokeRect(br.x * scaleX, br.y * scaleY, br.w * scaleX, br.h * scaleY);

      ctx.fillStyle = '#f59e0b';
      ctx.fillText('☕ ESPRESSO LOUNGE', (br.x + 15) * scaleX, (br.y + 20) * scaleY);

      // Coffee Counter & Machine
      ctx.fillStyle = '#1e293b';
      ctx.fillRect((br.x + 20) * scaleX, (br.y + 35) * scaleY, 160 * scaleX, 35 * scaleY);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect((br.x + 50) * scaleX, (br.y + 40) * scaleY, 30 * scaleX, 25 * scaleY); // Espresso machine
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc((br.x + 150) * scaleX, (br.y + 50) * scaleY, 12 * scaleX, 0, Math.PI * 2); // Water cooler
      ctx.fill();

      // Lounge Sofa
      ctx.fillStyle = '#334155';
      ctx.fillRect((br.x + 40) * scaleX, (br.y + 130) * scaleY, 120 * scaleX, 35 * scaleY);

      // ROOM 3: Strategy Whiteboard Area (Top-Center)
      const wb = OFFICE_ZONES.whiteboardArea;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(wb.x * scaleX, wb.y * scaleY, wb.w * scaleX, 20 * scaleY);
      ctx.fillStyle = '#0f172a';
      ctx.font = `bold ${Math.max(9, 10 * scaleX)}px "JetBrains Mono", monospace`;
      ctx.fillText('SYSTEM ARCHITECTURE WHITEBOARD', (wb.x + 15) * scaleX, (wb.y + 14) * scaleY);

      // Sticky notes on whiteboard
      const noteCols = ['#fde047', '#38bdf8', '#f472b6', '#4ade80'];
      for (let n = 0; n < 6; n++) {
        ctx.fillStyle = noteCols[n % 4];
        ctx.fillRect((wb.x + 20 + n * 35) * scaleX, (wb.y + 24) * scaleY, 20 * scaleX, 16 * scaleY);
      }

      // ROOM 4: Server Cluster Room (Bottom-Right)
      const sr = OFFICE_ZONES.serverRoom;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(sr.x * scaleX, sr.y * scaleY, sr.w * scaleX, sr.h * scaleY);
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
      ctx.strokeRect(sr.x * scaleX, sr.y * scaleY, sr.w * scaleX, sr.h * scaleY);

      ctx.fillStyle = '#eab308';
      ctx.font = `bold ${Math.max(10, 11 * scaleX)}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText('⚡ GPU SERVER CLUSTER', (sr.x + 15) * scaleX, (sr.y + 20) * scaleY);

      // 4 Server Racks with Blinking LEDs
      for (let r = 0; r < 4; r++) {
        const rx = (sr.x + 20 + r * 45) * scaleX;
        const ry = (sr.y + 40) * scaleY;
        ctx.fillStyle = '#090d16';
        ctx.fillRect(rx, ry, 32 * scaleX, 110 * scaleY);

        // Blinking LEDs
        for (let l = 0; l < 5; l++) {
          ctx.fillStyle = (Math.sin(s.time * 6 + r + l) > 0) ? '#10b981' : '#38bdf8';
          ctx.fillRect(rx + 6 * scaleX, ry + (15 + l * 18) * scaleY, 6 * scaleX, 4 * scaleY);
          ctx.fillRect(rx + 18 * scaleX, ry + (15 + l * 18) * scaleY, 6 * scaleX, 4 * scaleY);
        }
      }

      // ==========================================
      // 2. DRAW FIXED WORKSTATIONS & DESKS
      // ==========================================
      Object.entries(AGENT_DESKS).forEach(([agentId, desk]) => {
        const agent = agents.find(a => a.id === agentId);
        const col = agent ? agent.color : '#3b82f6';

        const dx = desk.x * scaleX;
        const dy = desk.y * scaleY;
        const dw = 70 * scaleX;
        const dh = 40 * scaleY;

        // Desk Surface
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(dx - dw / 2, dy - dh / 2, dw, dh);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.strokeRect(dx - dw / 2, dy - dh / 2, dw, dh);

        // Glowing Computer Screen on Desk
        ctx.fillStyle = col;
        ctx.shadowColor = col;
        ctx.shadowBlur = 8;
        if (desk.faceAngle === 0) {
          ctx.fillRect(dx - dw / 2 + 8 * scaleX, dy - dh / 2 + 4 * scaleY, 8 * scaleX, 32 * scaleY);
        } else if (desk.faceAngle === Math.PI) {
          ctx.fillRect(dx + dw / 2 - 16 * scaleX, dy - dh / 2 + 4 * scaleY, 8 * scaleX, 32 * scaleY);
        } else {
          ctx.fillRect(dx - dw / 2 + 10 * scaleX, dy - dh / 2 + 4 * scaleY, 50 * scaleX, 8 * scaleY);
        }
        ctx.shadowBlur = 0;

        // Desk Owner Label
        ctx.fillStyle = '#94a3b8';
        ctx.font = `600 ${Math.max(9, 9 * scaleX)}px "JetBrains Mono", monospace`;
        ctx.fillText(agent ? agent.name.split(' ')[0] : '', dx - dw / 2, dy + dh / 2 + 12 * scaleY);
      });

      // ==========================================
      // 3. AUTONOMOUS WALKING AGENT SIMULATION
      // ==========================================
      s.agentsState.forEach((state) => {
        const agent = state.agent;

        // ALL-HANDS OVERRIDE: walk to boardroom table seats
        if (s.isAllHandsRef) {
          state.targetX = state.seatX;
          state.targetY = state.seatY;
          state.currentThought = 'Debating in Central Boardroom sprint';
        } else {
          // Autonomous State Machine Routine Loop
          state.timer -= delta;
          if (state.timer <= 0) {
            // Pick a destination
            if (state.state === 'AT_DESK') {
              const rand = Math.random();
              if (rand < 0.28) {
                // Go grab coffee
                state.state = 'AT_COFFEE';
                state.targetX = OFFICE_ZONES.waypoints.coffeeMachine.x + Math.random() * 30;
                state.targetY = OFFICE_ZONES.waypoints.coffeeMachine.y + Math.random() * 20;
                state.currentThought = 'Heading to Espresso Lounge for coffee';
                state.timer = 7;
              } else if (rand < 0.54) {
                // Go to whiteboard
                state.state = 'AT_WHITEBOARD';
                state.targetX = OFFICE_ZONES.waypoints.whiteboardLeft.x + Math.random() * 100;
                state.targetY = OFFICE_ZONES.waypoints.whiteboardLeft.y + 20;
                state.currentThought = 'Sketching architecture at the Whiteboard';
                state.timer = 8;
              } else if (rand < 0.76) {
                // Go to server room
                state.state = 'AT_SERVERS';
                state.targetX = OFFICE_ZONES.waypoints.serverRackA.x + Math.random() * 60;
                state.targetY = OFFICE_ZONES.waypoints.serverRackA.y + Math.random() * 40;
                state.currentThought = 'Inspecting GPU & TLS cluster racks';
                state.timer = 7;
              } else {
                // Stroll in boardroom
                state.state = 'STROLLING';
                state.targetX = 450 + Math.random() * 100;
                state.targetY = 280 + Math.random() * 80;
                state.currentThought = 'Pacing through Central Boardroom';
                state.timer = 6;
              }
            } else {
              // Return to desk
              state.state = 'AT_DESK';
              state.targetX = state.deskX;
              state.targetY = state.deskY;
              state.currentThought = agent.currentStatus;
              state.timer = 9 + Math.random() * 6;
            }
          }
        }

        // Smooth Walking Movement towards Target
        const dx = state.targetX - state.x;
        const dy = state.targetY - state.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const isWalking = dist > 4;
        if (isWalking) {
          const moveDist = state.speed * 60 * delta;
          state.x += (dx / dist) * Math.min(dist, moveDist);
          state.y += (dy / dist) * Math.min(dist, moveDist);
          state.faceAngle = Math.atan2(dy, dx);
          state.walkStep += delta * 14;

          // Footstep audio trigger
          if (Math.random() < 0.08) {
            officeAudio.playFootstep();
          }
        }

        const ax = state.x * scaleX;
        const ay = state.y * scaleY;
        const isHovered = s.hoveredAgentId === state.id;
        const isSelected = selectedAgent?.id === state.id;

        // Hover / Selection Aura Ring
        if (isHovered || isSelected) {
          ctx.strokeStyle = agent.color;
          ctx.lineWidth = isSelected ? 3 : 2;
          ctx.beginPath();
          ctx.arc(ax, ay, (20 + Math.sin(s.time * 6) * 2) * scaleX, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Animated Walking Feet (2 small dots that step while walking)
        if (isWalking) {
          const stepOffset = Math.sin(state.walkStep) * 6 * scaleX;
          const perpAngle = state.faceAngle + Math.PI / 2;
          const fx = Math.cos(perpAngle) * 7 * scaleX;
          const fy = Math.sin(perpAngle) * 7 * scaleY;

          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.arc(ax + fx + Math.cos(state.faceAngle) * stepOffset, ay + fy + Math.sin(state.faceAngle) * stepOffset, 3.5 * scaleX, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(ax - fx - Math.cos(state.faceAngle) * stepOffset, ay - fy - Math.sin(state.faceAngle) * stepOffset, 3.5 * scaleX, 0, Math.PI * 2);
          ctx.fill();
        }

        // Agent Avatar Body (Circular Token with Accent Color)
        ctx.fillStyle = agent.color;
        ctx.beginPath();
        ctx.arc(ax, ay, 14 * scaleX, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Directional Facing Pointer Nose / Arrow
        const noseX = ax + Math.cos(state.faceAngle) * 16 * scaleX;
        const noseY = ay + Math.sin(state.faceAngle) * 16 * scaleY;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(noseX, noseY, 3 * scaleX, 0, Math.PI * 2);
        ctx.fill();

        // Agent Initial on Avatar
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(10, 11 * scaleX)}px "Plus Jakarta Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(agent.name.charAt(0), ax, ay);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';

        // Floating 2D Speech / Thought Bubble
        const bubbleText = state.currentThought;
        ctx.font = `bold ${Math.max(9, 10 * scaleX)}px "Plus Jakarta Sans", sans-serif`;
        const textW = ctx.measureText(bubbleText).width;

        const bx = ax - textW / 2 - 8 * scaleX;
        const by = ay - 24 * scaleY;
        const bw = textW + 16 * scaleX;
        const bh = 18 * scaleY;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 6);
        ctx.fill();
        ctx.strokeStyle = agent.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.fillText(bubbleText, bx + 8 * scaleX, by + 13 * scaleY);
      });
    };

    animate();

    // Mouse Pointer Interaction (Hover & Click)
    const handlePointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const scaleX = rect.width / 1000;
      const scaleY = rect.height / 650;

      let found = null;
      s.agentsState.forEach((state) => {
        const ax = state.x * scaleX;
        const ay = state.y * scaleY;
        const dist = Math.sqrt((mouseX - ax) ** 2 + (mouseY - ay) ** 2);
        if (dist < 22 * scaleX) {
          found = state.id;
        }
      });

      s.hoveredAgentId = found;
      canvas.style.cursor = found ? 'pointer' : 'default';
    };

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const scaleX = rect.width / 1000;
      const scaleY = rect.height / 650;

      let clicked = null;
      s.agentsState.forEach((state) => {
        const ax = state.x * scaleX;
        const ay = state.y * scaleY;
        const dist = Math.sqrt((mouseX - ax) ** 2 + (mouseY - ay) ** 2);
        if (dist < 25 * scaleX) {
          clicked = state.agent;
        }
      });

      if (clicked) {
        onSelectAgent(clicked);
        officeAudio.playDing();
      } else if (selectedAgent) {
        // If an agent is selected, clicking the floor orders them to walk there!
        const state = s.agentsState.get(selectedAgent.id);
        if (state) {
          state.targetX = mouseX / scaleX;
          state.targetY = mouseY / scaleY;
          state.state = 'USER_DISPATCHED';
          state.currentThought = 'Walking to user-selected coordinate';
          state.timer = 10;
          officeAudio.playDing();
        }
      }
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(s.animId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [agents, isNightMode, selectedAgent]);

  return (
    <div className="office-2d-wrapper" style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
    </div>
  );
}
