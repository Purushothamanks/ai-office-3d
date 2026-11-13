import React, { useRef, useEffect, useState } from 'react';
import { OFFICE_ZONES, AGENT_DESKS } from '../data/office2dLayout';
import { officeAudio } from '../utils/officeAudio';
import folkSpriteSheetUrl from '../assets/32x32folk.png';

/**
 * Cartoon Character Spritesheet Definition (384 x 256 Atlas from ai-town)
 * 8 distinct folk characters (f1-f8) in 32x32 pixel art.
 * Each character has 4 directional rows (down, left, right, up)
 * and 3 walk frames (walk1, stand, walk2).
 */
const AGENT_SPRITES = {
  gemini: { index: 0, name: 'Gemini 3.8', icon: '⚡', role: 'Multimodal Orchestrator' },
  claude: { index: 1, name: 'Claude 3.7', icon: '🏛️', role: 'Principal Architect' },
  deepseek: { index: 2, name: 'DeepSeek-R1', icon: '🧠', role: 'CoT Reasoning Engine' },
  ollama: { index: 3, name: 'Ollama Fleet', icon: '🖥️', role: 'On-Device GPU Core' },
  vision: { index: 4, name: 'Vision Sentinel', icon: '👁️', role: 'Visual Perception' },
  diffusion: { index: 5, name: 'Canvas Diffusion', icon: '🎨', role: 'Shader & Generative Art' },
  sentinel: { index: 6, name: 'Sentinel Ops', icon: '🛡️', role: 'Cyber-Defense Guard' }
};

const DIR_ROW_OFFSETS = {
  down: 0,
  left: 32,
  right: 64,
  up: 96
};

export default function Office2DCanvas({
  agents,
  selectedAgent,
  onSelectAgent,
  isAllHands,
  simulationSpeed = 1,
  isNightMode
}) {
  const canvasRef = useRef(null);
  const spriteImgRef = useRef(null);
  const [spriteLoaded, setSpriteLoaded] = useState(false);

  // Preload Cartoon Folk Spritesheet
  useEffect(() => {
    const img = new Image();
    img.src = folkSpriteSheetUrl || '/assets/32x32folk.png';
    img.onload = () => {
      spriteImgRef.current = img;
      setSpriteLoaded(true);
    };
    img.onerror = () => {
      // Fallback to public asset path if bundler path differs
      const fallbackImg = new Image();
      fallbackImg.src = '/assets/32x32folk.png';
      fallbackImg.onload = () => {
        spriteImgRef.current = fallbackImg;
        setSpriteLoaded(true);
      };
    };
  }, []);

  // Autonomous walking agents simulation state
  const simRef = useRef({
    agentsState: new Map(),
    hoveredAgentId: null,
    animId: null,
    time: 0,
    speedRef: 1,
    isAllHandsRef: false,
    dustParticles: [],
    steamParticles: []
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
        // Initial facing based on desk angle
        let initialDir = 'down';
        if (desk.faceAngle === 0) initialDir = 'right';
        else if (desk.faceAngle === Math.PI) initialDir = 'left';
        else if (desk.faceAngle === -Math.PI / 2) initialDir = 'up';

        s.agentsState.set(agent.id, {
          id: agent.id,
          agent,
          charIndex: AGENT_SPRITES[agent.id]?.index ?? (index % 8),
          x: desk.x,
          y: desk.y + 6,
          targetX: desk.x,
          targetY: desk.y + 6,
          deskX: desk.x,
          deskY: desk.y + 6,
          seatX: OFFICE_ZONES.waypoints.boardroomSeats[index % 7].x,
          seatY: OFFICE_ZONES.waypoints.boardroomSeats[index % 7].y,
          state: 'AT_DESK',
          dir: initialDir,
          walkStep: 0,
          speed: 1.85,
          timer: Math.random() * 8 + 4,
          currentThought: agent.currentStatus,
          lastDustTime: 0
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
      const delta = Math.min((now - lastTime) * 0.001 * s.speedRef, 0.1);
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

      // ROOM 1: Central Boardroom (Glass conference zone)
      const b = OFFICE_ZONES.boardroom;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(b.x * scaleX, b.y * scaleY, b.w * scaleX, b.h * scaleY);

      // Frosted Glass Boardroom Boundary
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x * scaleX, b.y * scaleY, b.w * scaleX, b.h * scaleY);

      // Boardroom Door Opening
      ctx.clearRect((b.x + b.w / 2 - 30) * scaleX, (b.y + b.h - 2) * scaleY, 60 * scaleX, 4 * scaleY);

      // Boardroom Title Badge
      ctx.fillStyle = '#38bdf8';
      ctx.font = `bold ${Math.max(10, 11 * scaleX)}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText('🏢 CENTRAL BOARDROOM', (b.x + 15) * scaleX, (b.y + 20) * scaleY);

      // Central Oval Conference Table
      ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
      ctx.beginPath();
      ctx.ellipse((b.x + b.w / 2) * scaleX, (b.y + b.h / 2 + 5) * scaleY, 95 * scaleX, 58 * scaleY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Rotating Center Holographic Core Blip
      const holoRadius = (8 + Math.sin(s.time * 4) * 2) * scaleX;
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc((b.x + b.w / 2) * scaleX, (b.y + b.h / 2 + 5) * scaleY, holoRadius, 0, Math.PI * 2);
      ctx.fill();

      // ROOM 2: Breakroom / Espresso Lounge (Top-Left)
      const br = OFFICE_ZONES.breakroom;
      ctx.fillStyle = 'rgba(24, 34, 58, 0.6)';
      ctx.fillRect(br.x * scaleX, br.y * scaleY, br.w * scaleX, br.h * scaleY);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.strokeRect(br.x * scaleX, br.y * scaleY, br.w * scaleX, br.h * scaleY);

      ctx.fillStyle = '#f59e0b';
      ctx.font = `bold ${Math.max(10, 11 * scaleX)}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText('☕ ESPRESSO LOUNGE', (br.x + 15) * scaleX, (br.y + 20) * scaleY);

      // Coffee Counter & Espresso Machine
      ctx.fillStyle = '#1e293b';
      ctx.fillRect((br.x + 20) * scaleX, (br.y + 35) * scaleY, 160 * scaleX, 35 * scaleY);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect((br.x + 50) * scaleX, (br.y + 38) * scaleY, 32 * scaleX, 26 * scaleY); // Espresso machine
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect((br.x + 62) * scaleX, (br.y + 54) * scaleY, 8 * scaleX, 6 * scaleY); // Dispenser cup

      // Water Cooler
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc((br.x + 150) * scaleX, (br.y + 50) * scaleY, 12 * scaleX, 0, Math.PI * 2);
      ctx.fill();

      // Lounge Sofa
      ctx.fillStyle = '#334155';
      ctx.fillRect((br.x + 40) * scaleX, (br.y + 130) * scaleY, 120 * scaleX, 35 * scaleY);

      // Spawn Steam Puffs from Coffee Machine
      if (Math.random() < 0.1) {
        s.steamParticles.push({
          x: (br.x + 66) * scaleX + (Math.random() - 0.5) * 8 * scaleX,
          y: (br.y + 40) * scaleY,
          vx: (Math.random() - 0.5) * 4,
          vy: -12 - Math.random() * 8,
          size: 3 * scaleX,
          alpha: 0.7,
          life: 0.9
        });
      }

      // Update & Render Steam Particles
      for (let i = s.steamParticles.length - 1; i >= 0; i--) {
        const p = s.steamParticles[i];
        p.life -= delta;
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.size += delta * 4 * scaleX;
        p.alpha = Math.max(0, p.life * 0.8);

        ctx.fillStyle = `rgba(226, 232, 240, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.life <= 0) {
          s.steamParticles.splice(i, 1);
        }
      }

      // ROOM 3: Strategy Whiteboard Area (Top-Center)
      const wb = OFFICE_ZONES.whiteboardArea;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(wb.x * scaleX, wb.y * scaleY, wb.w * scaleX, 24 * scaleY);
      ctx.fillStyle = '#0f172a';
      ctx.font = `bold ${Math.max(9, 10 * scaleX)}px "JetBrains Mono", monospace`;
      ctx.fillText('📐 SYSTEM ARCHITECTURE WHITEBOARD', (wb.x + 15) * scaleX, (wb.y + 16) * scaleY);

      // Sticky notes on whiteboard
      const noteCols = ['#fde047', '#38bdf8', '#f472b6', '#4ade80'];
      for (let n = 0; n < 6; n++) {
        ctx.fillStyle = noteCols[n % 4];
        ctx.fillRect((wb.x + 20 + n * 35) * scaleX, (wb.y + 28) * scaleY, 22 * scaleX, 16 * scaleY);
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
          const isLedOn = Math.sin(s.time * 6 + r + l) > 0;
          ctx.fillStyle = isLedOn ? '#10b981' : '#38bdf8';
          ctx.fillRect(rx + 6 * scaleX, ry + (15 + l * 18) * scaleY, 6 * scaleX, 4 * scaleY);
          ctx.fillRect(rx + 18 * scaleX, ry + (15 + l * 18) * scaleY, 6 * scaleX, 4 * scaleY);
        }
      }

      // ==========================================
      // 2. DRAW FIXED WORKSTATIONS & COMPUTERS
      // ==========================================
      Object.entries(AGENT_DESKS).forEach(([agentId, desk]) => {
        const agent = agents.find(a => a.id === agentId);
        const col = agent ? agent.color : '#3b82f6';

        const dx = desk.x * scaleX;
        const dy = desk.y * scaleY;
        const dw = 70 * scaleX;
        const dh = 40 * scaleY;

        // Desk Surface with Wood/Charcoal Texture
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(dx - dw / 2, dy - dh / 2, dw, dh);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.lineWidth = 1;
        ctx.strokeRect(dx - dw / 2, dy - dh / 2, dw, dh);

        // Office Chair
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(dx, dy + 16 * scaleY, 10 * scaleX, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.stroke();

        // Glowing Computer Screen on Desk
        ctx.fillStyle = col;
        ctx.shadowColor = col;
        ctx.shadowBlur = 10;
        if (desk.faceAngle === 0) {
          ctx.fillRect(dx - dw / 2 + 8 * scaleX, dy - dh / 2 + 5 * scaleY, 8 * scaleX, 30 * scaleY);
        } else if (desk.faceAngle === Math.PI) {
          ctx.fillRect(dx + dw / 2 - 16 * scaleX, dy - dh / 2 + 5 * scaleY, 8 * scaleX, 30 * scaleY);
        } else {
          ctx.fillRect(dx - dw / 2 + 10 * scaleX, dy - dh / 2 + 5 * scaleY, 50 * scaleX, 8 * scaleY);
        }
        ctx.shadowBlur = 0;

        // Desk Owner Label Badge
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
                state.currentThought = 'Brewing fresh espresso at Lounge';
                state.timer = 7;
              } else if (rand < 0.54) {
                // Go to whiteboard
                state.state = 'AT_WHITEBOARD';
                state.targetX = OFFICE_ZONES.waypoints.whiteboardLeft.x + Math.random() * 100;
                state.targetY = OFFICE_ZONES.waypoints.whiteboardLeft.y + 20;
                state.currentThought = 'Sketching architecture at Whiteboard';
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
              state.timer = 10 + Math.random() * 6;
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

          // Determine 4-directional facing from movement vector
          if (Math.abs(dx) > Math.abs(dy)) {
            state.dir = dx > 0 ? 'right' : 'left';
          } else if (Math.abs(dy) > 0.1) {
            state.dir = dy > 0 ? 'down' : 'up';
          }

          state.walkStep += delta * 9;

          // Spawn Walking Dust Puff Particles
          if (s.time - state.lastDustTime > 0.22) {
            state.lastDustTime = s.time;
            s.dustParticles.push({
              x: state.x * scaleX,
              y: state.y * scaleY + 12 * scaleY,
              vx: (Math.random() - 0.5) * 8,
              vy: -2 - Math.random() * 4,
              size: 2.8 * scaleX,
              alpha: 0.6,
              life: 0.35
            });
            // Footstep audio trigger
            if (Math.random() < 0.25) {
              officeAudio.playFootstep();
            }
          }
        } else {
          // Align with desk facing direction if seated at workstation
          if (state.state === 'AT_DESK') {
            const desk = AGENT_DESKS[state.id];
            if (desk) {
              if (desk.faceAngle === 0) state.dir = 'right';
              else if (desk.faceAngle === Math.PI) state.dir = 'left';
              else if (desk.faceAngle === -Math.PI / 2) state.dir = 'up';
            }
          }
        }
      });

      // Update & Render Dust Particles
      for (let i = s.dustParticles.length - 1; i >= 0; i--) {
        const p = s.dustParticles[i];
        p.life -= delta;
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.size += delta * 2 * scaleX;
        p.alpha = Math.max(0, p.life * 1.5);

        ctx.fillStyle = `rgba(148, 163, 184, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.life <= 0) {
          s.dustParticles.splice(i, 1);
        }
      }

      // ==========================================
      // 4. DRAW CARTOON CHARACTERS & OVERLAYS
      // ==========================================
      // Sort agents by Y coordinate so foreground characters overlap background naturally
      const sortedAgents = Array.from(s.agentsState.values()).sort((a, b) => a.y - b.y);

      sortedAgents.forEach((state) => {
        const agent = state.agent;
        const ax = state.x * scaleX;
        const ay = state.y * scaleY;
        const isHovered = s.hoveredAgentId === state.id;
        const isSelected = selectedAgent?.id === state.id;

        const dx = state.targetX - state.x;
        const dy = state.targetY - state.y;
        const isWalking = Math.sqrt(dx * dx + dy * dy) > 4;

        // Ground Drop Shadow
        ctx.beginPath();
        ctx.ellipse(ax, ay + 14 * scaleY, 14 * scaleX, 6 * scaleY, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
        ctx.fill();

        // Agent Halo / Identifier Ring
        ctx.beginPath();
        ctx.ellipse(ax, ay + 14 * scaleY, 16 * scaleX, 7 * scaleY, 0, 0, Math.PI * 2);
        ctx.strokeStyle = agent.color;
        ctx.lineWidth = isSelected ? 3 : (isHovered ? 2.5 : 1.2);
        ctx.stroke();

        if (isSelected) {
          // Animated Selection Pulse Ring
          ctx.beginPath();
          ctx.ellipse(ax, ay + 14 * scaleY, (18 + Math.sin(s.time * 6) * 3) * scaleX, 8 * scaleY, 0, 0, Math.PI * 2);
          ctx.strokeStyle = agent.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Idle Bobbing Animation when standing/seated
        const idleBob = isWalking ? 0 : Math.sin(s.time * 4 + state.charIndex) * 1.5;

        // Cartoon Folk Character Sprite Rendering (Pixel Art from ai-town 32x32 master atlas)
        const spriteSize = Math.round(44 * scaleX);
        const drawX = Math.round(ax - spriteSize / 2);
        const drawY = Math.round(ay - spriteSize + 14 * scaleY + idleBob);

        const img = spriteImgRef.current;
        if (img && img.complete && img.naturalWidth > 0) {
          // Disable smoothing for pin-sharp cartoon pixel art
          ctx.imageSmoothingEnabled = false;

          const charCol = state.charIndex % 4;
          const charRow = Math.floor(state.charIndex / 4);
          const colBase = charCol * 96;
          const rowBase = charRow * 128;

          const dirOffset = DIR_ROW_OFFSETS[state.dir || 'down'] ?? 0;
          const sy = rowBase + dirOffset;

          // 3-frame walk sequence: walk1 (0), stand (1), walk2 (2), stand (1)
          let frameCol = 1;
          if (isWalking) {
            const step = Math.floor(state.walkStep) % 4;
            frameCol = [0, 1, 2, 1][step];
          }
          const sx = colBase + frameCol * 32;

          ctx.drawImage(
            img,
            sx, sy, 32, 32,
            drawX, drawY,
            spriteSize, spriteSize
          );
        } else {
          // Fail-Safe Procedural Chibi Cartoon Fallback
          drawProceduralChibi(ctx, ax, ay, state, agent, scaleX, scaleY, isWalking, s.time);
        }

        // Re-enable smooth text & vector rendering
        ctx.imageSmoothingEnabled = true;

        // Floating Name Pill Badge (e.g. "⚡ Gemini 3.8")
        const spriteInfo = AGENT_SPRITES[state.id] || { icon: '🤖', name: agent.name };
        const labelText = `${spriteInfo.icon} ${agent.name.split(' ')[0]}`;
        ctx.font = `bold ${Math.max(9, 10 * scaleX)}px "JetBrains Mono", monospace`;
        const labelW = ctx.measureText(labelText).width;

        const lx = ax - labelW / 2 - 6 * scaleX;
        const ly = drawY - 14 * scaleY;
        const lw = labelW + 12 * scaleX;
        const lh = 15 * scaleY;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.beginPath();
        ctx.roundRect(lx, ly, lw, lh, 4);
        ctx.fill();
        ctx.strokeStyle = agent.color;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(labelText, lx + 6 * scaleX, ly + 11 * scaleY);

        // Floating Cartoon Thought Bubble (shown during activity or when hovered/selected)
        if (isHovered || isSelected || Math.sin(s.time * 0.8 + state.charIndex) > -0.3) {
          const bubbleText = state.currentThought;
          ctx.font = `bold ${Math.max(9, 9.5 * scaleX)}px "Plus Jakarta Sans", sans-serif`;
          const textW = ctx.measureText(bubbleText).width;

          const bx = ax - textW / 2 - 8 * scaleX;
          const by = ly - 22 * scaleY;
          const bw = textW + 16 * scaleX;
          const bh = 18 * scaleY;

          // Cartoon Speech Bubble Tail Triangle
          ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
          ctx.beginPath();
          ctx.moveTo(ax, ly - 3 * scaleY);
          ctx.lineTo(ax - 5 * scaleX, by + bh);
          ctx.lineTo(ax + 5 * scaleX, by + bh);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = agent.color;
          ctx.stroke();

          // Bubble Body
          ctx.beginPath();
          ctx.roundRect(bx, by, bw, bh, 6);
          ctx.fill();
          ctx.strokeStyle = agent.color;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.fillStyle = '#f8fafc';
          ctx.fillText(bubbleText, bx + 8 * scaleX, by + 13 * scaleY);
        }
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
        if (dist < 26 * scaleX) {
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
        if (dist < 28 * scaleX) {
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
          state.timer = 12;
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

/**
 * Procedural Chibi Cartoon Character Fallback
 * Guaranteed zero-defect vector rendering if spritesheet image is still loading.
 */
function drawProceduralChibi(ctx, ax, ay, state, agent, scaleX, scaleY, isWalking, time) {
  const dir = state.dir || 'down';
  const charSize = 28 * scaleX;
  const headY = ay - charSize + 4 * scaleY;

  // Chibi Body / Hoodie in agent color
  ctx.fillStyle = agent.color || '#3b82f6';
  ctx.beginPath();
  ctx.roundRect(ax - 9 * scaleX, headY + 12 * scaleY, 18 * scaleX, 14 * scaleY, 4);
  ctx.fill();

  // Animated Swinging Legs / Shoes
  const legOffset = isWalking ? Math.sin(state.walkStep) * 5 * scaleX : 0;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(ax - 6 * scaleX + legOffset, ay + 6 * scaleY, 4 * scaleX, 6 * scaleY);
  ctx.fillRect(ax + 2 * scaleX - legOffset, ay + 6 * scaleY, 4 * scaleX, 6 * scaleY);

  // Round Chibi Head
  ctx.fillStyle = '#fed7aa'; // warm skin tone
  ctx.beginPath();
  ctx.arc(ax, headY + 4 * scaleY, 10 * scaleX, 0, Math.PI * 2);
  ctx.fill();

  // Hair in agent hair color
  ctx.fillStyle = agent.hairColor || '#0f172a';
  ctx.beginPath();
  ctx.arc(ax, headY + 2 * scaleY, 10.5 * scaleX, Math.PI, Math.PI * 2);
  ctx.fill();

  // Chibi Expressive Eyes looking in direction of travel
  let eyeOffsetX = 0;
  let eyeOffsetY = 0;
  if (dir === 'left') eyeOffsetX = -3 * scaleX;
  if (dir === 'right') eyeOffsetX = 3 * scaleX;
  if (dir === 'up') eyeOffsetY = -2 * scaleY;
  if (dir === 'down') eyeOffsetY = 2 * scaleY;

  if (dir !== 'up') {
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(ax - 4 * scaleX + eyeOffsetX, headY + 4 * scaleY + eyeOffsetY, 1.8 * scaleX, 0, Math.PI * 2);
    ctx.arc(ax + 4 * scaleX + eyeOffsetX, headY + 4 * scaleY + eyeOffsetY, 1.8 * scaleX, 0, Math.PI * 2);
    ctx.fill();

    // Eye Glint
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ax - 4.5 * scaleX + eyeOffsetX, headY + 3.5 * scaleY + eyeOffsetY, 0.7 * scaleX, 0, Math.PI * 2);
    ctx.arc(ax + 3.5 * scaleX + eyeOffsetX, headY + 3.5 * scaleY + eyeOffsetY, 0.7 * scaleX, 0, Math.PI * 2);
    ctx.fill();
  }
}
