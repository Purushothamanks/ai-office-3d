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
  gemini: { index: 0, name: 'Gemini 3.8', icon: '⚡', role: 'Multimodal Lead' },
  claude: { index: 1, name: 'Claude 3.7', icon: '🏛️', role: 'Chief Architect' },
  deepseek: { index: 2, name: 'DeepSeek-R1', icon: '🧠', role: 'Reasoning & Proofs' },
  ollama: { index: 3, name: 'Ollama Fleet', icon: '🖥️', role: 'Local GPU Core' },
  vision: { index: 4, name: 'Vision Sentinel', icon: '👁️', role: 'Perception AI' },
  diffusion: { index: 5, name: 'Canvas Diffusion', icon: '🎨', role: 'Shader & UI Studio' },
  sentinel: { index: 6, name: 'Sentinel Ops', icon: '🛡️', role: 'Security & Cloud Guard' }
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
        let initialDir = 'down';
        if (desk.faceAngle === 0) initialDir = 'right';
        else if (desk.faceAngle === Math.PI) initialDir = 'left';
        else if (desk.faceAngle === -Math.PI / 2) initialDir = 'up';

        // Offset slightly behind the desk chair
        const chairOffsetY = desk.faceAngle === -Math.PI / 2 ? 18 : 6;
        const chairOffsetX = desk.faceAngle === 0 ? -12 : (desk.faceAngle === Math.PI ? 12 : 0);

        s.agentsState.set(agent.id, {
          id: agent.id,
          agent,
          charIndex: AGENT_SPRITES[agent.id]?.index ?? (index % 8),
          x: desk.x + chairOffsetX,
          y: desk.y + chairOffsetY,
          targetX: desk.x + chairOffsetX,
          targetY: desk.y + chairOffsetY,
          deskX: desk.x + chairOffsetX,
          deskY: desk.y + chairOffsetY,
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

  // Main Render Loop & Simulation
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
      // 1. ARCHITECTURAL FLOORING (WOOD, TILE, CARPET)
      // ==========================================
      drawRealOfficeFloor(ctx, W, H, scaleX, scaleY, isNightMode);

      // ==========================================
      // 2. WALLS, CORRIDORS & PANORAMIC WINDOWS
      // ==========================================
      drawArchitecturalWallsAndWindows(ctx, W, H, scaleX, scaleY, isNightMode, s.time);

      // ==========================================
      // 3. SPECIALIZED ZONES & FURNITURE
      // ==========================================
      // 3A. Kitchenette & Espresso Bistro
      drawEspressoBistro(ctx, scaleX, scaleY, isNightMode, s.time, s);

      // 3B. Architecture Whiteboard & Tech Library
      drawWhiteboardAndLibrary(ctx, scaleX, scaleY, isNightMode, s.time);

      // 3C. GPU Server Cluster & Network Vault
      drawServerCluster(ctx, scaleX, scaleY, isNightMode, s.time);

      // 3D. Central Executive Glass Boardroom
      drawExecutiveBoardroom(ctx, scaleX, scaleY, isNightMode, s.time);

      // 3E. Lush Indoor Plants
      drawBiophilicPlants(ctx, scaleX, scaleY, s.time);

      // 3F. Workstations & Glowing Dual Displays
      drawWorkstations(ctx, scaleX, scaleY, isNightMode, s.time, agents);

      // ==========================================
      // 4. AUTONOMOUS WALKING AGENT SIMULATION
      // ==========================================
      updateAgentSimulation(s, delta, scaleX, scaleY);

      // Render dust particles
      renderDustParticles(ctx, s, delta, scaleX, scaleY);

      // ==========================================
      // 5. DRAW CARTOON CHARACTERS & OVERLAYS
      // ==========================================
      drawCartoonAgents(ctx, s, scaleX, scaleY, selectedAgent, spriteImgRef.current);
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
        if (dist < 28 * scaleX) {
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
        if (dist < 30 * scaleX) {
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
          state.timer = 14;
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

// =========================================================================
// SECTION 1: REALISTIC FLOORING ENGINE
// =========================================================================
function drawRealOfficeFloor(ctx, W, H, scaleX, scaleY, isNightMode) {
  // Base Floor: Natural Scandinavian Bleached Oak Wood in Day / Smoked Walnut in Night
  const plankH = 18 * scaleY;
  const plankW = 75 * scaleX;

  const dayPlankColors = ['#f1e9dd', '#ebe0d0', '#f4ecdF', '#e6d8c4', '#ede2d3'];
  const nightPlankColors = ['#1a1511', '#221b15', '#28201a', '#1e1813', '#251e18'];
  const colors = isNightMode ? nightPlankColors : dayPlankColors;

  const numRows = Math.ceil(H / plankH);
  const numCols = Math.ceil(W / plankW) + 2;

  ctx.save();
  for (let r = 0; r < numRows; r++) {
    const y = r * plankH;
    // Stagger every other row
    const rowOffset = (r % 2 === 0) ? 0 : plankW / 2;

    for (let c = -1; c < numCols; c++) {
      const x = c * plankW + rowOffset;
      // Deterministic color hash
      const colorIdx = Math.abs(Math.sin(r * 12.9898 + c * 78.233) * 10000) % colors.length | 0;
      ctx.fillStyle = colors[colorIdx];
      ctx.fillRect(x, y, plankW, plankH);

      // Plank Seams
      ctx.strokeStyle = isNightMode ? 'rgba(0, 0, 0, 0.45)' : 'rgba(168, 148, 128, 0.28)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, plankW, plankH);
    }
  }
  ctx.restore();

  // 1B. Espresso Bistro Porcelain Ceramic Subway Tiles
  const br = OFFICE_ZONES.breakroom;
  ctx.save();
  const tileCols = isNightMode
    ? ['#1e293b', '#243247', '#1b2536']
    : ['#f8fafc', '#edf2f7', '#f1f5f9'];
  const tileSize = 20 * scaleX;
  const brX = br.x * scaleX;
  const brY = br.y * scaleY;
  const brW = br.w * scaleX;
  const brH = br.h * scaleY;

  ctx.fillStyle = isNightMode ? '#1e293b' : '#f8fafc';
  ctx.fillRect(brX, brY, brW, brH);

  for (let tx = brX; tx < brX + brW; tx += tileSize) {
    for (let ty = brY; ty < brY + brH; ty += tileSize) {
      const idx = (Math.sin(tx + ty) * 100 | 0) % tileCols.length;
      ctx.fillStyle = tileCols[Math.abs(idx)];
      ctx.fillRect(tx, ty, tileSize, tileSize);
      ctx.strokeStyle = isNightMode ? 'rgba(15, 23, 42, 0.8)' : '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(tx, ty, tileSize, tileSize);
    }
  }
  // Transition border threshold
  ctx.strokeStyle = isNightMode ? '#475569' : '#94a3b8';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(brX, brY, brW, brH);
  ctx.restore();

  // 1C. Central Boardroom Acoustic Loop-Pile Carpet
  const b = OFFICE_ZONES.boardroom;
  const bx = b.x * scaleX;
  const by = b.y * scaleY;
  const bw = b.w * scaleX;
  const bh = b.h * scaleY;

  ctx.save();
  ctx.fillStyle = isNightMode ? '#0a0f1d' : '#1e293b';
  ctx.fillRect(bx, by, bw, bh);

  // Woven Carpet Grid Loop Texture
  ctx.strokeStyle = isNightMode ? 'rgba(56, 189, 248, 0.05)' : 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  const carpetGrid = 12 * scaleX;
  for (let cx = bx; cx < bx + bw; cx += carpetGrid) {
    ctx.beginPath(); ctx.moveTo(cx, by); ctx.lineTo(cx, by + bh); ctx.stroke();
  }
  for (let cy = by; cy < by + bh; cy += carpetGrid) {
    ctx.beginPath(); ctx.moveTo(bx, cy); ctx.lineTo(bx + bw, cy); ctx.stroke();
  }
  ctx.restore();

  // 1D. Server Cluster Raised Anti-Static Metal Floor Tiles
  const sr = OFFICE_ZONES.serverRoom;
  const srx = sr.x * scaleX;
  const sry = sr.y * scaleY;
  const srw = sr.w * scaleX;
  const srh = sr.h * scaleY;

  ctx.save();
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(srx, sry, srw, srh);

  const metalTile = 28 * scaleX;
  for (let mx = srx; mx < srx + srw; mx += metalTile) {
    for (let my = sry; my < sry + srh; my += metalTile) {
      ctx.fillStyle = '#172235';
      ctx.fillRect(mx + 1, my + 1, metalTile - 2, metalTile - 2);

      // Center air grate circle
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.arc(mx + metalTile / 2, my + metalTile / 2, 4 * scaleX, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(mx, my, metalTile, metalTile);
    }
  }

  // Yellow & Black Diagonal Hazard Stripe Entrance Tape
  const hazardW = srw;
  const hazardH = 8 * scaleY;
  ctx.fillStyle = '#eab308';
  ctx.fillRect(srx, sry, hazardW, hazardH);
  ctx.fillStyle = '#0f172a';
  for (let hx = 0; hx < hazardW; hx += 16 * scaleX) {
    ctx.beginPath();
    ctx.moveTo(srx + hx, sry);
    ctx.lineTo(srx + hx + 8 * scaleX, sry);
    ctx.lineTo(srx + hx, sry + hazardH);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // 1E. Lounge Designer Accent Area Rug
  ctx.save();
  const rugX = 85 * scaleX;
  const rugY = 135 * scaleY;
  const rugW = 145 * scaleX;
  const rugH = 65 * scaleY;

  ctx.fillStyle = isNightMode ? '#1e3a5f' : '#0284c7';
  ctx.beginPath();
  ctx.roundRect(rugX, rugY, rugW, rugH, 12 * scaleX);
  ctx.fill();

  // Rug Geometric Border Pattern
  ctx.strokeStyle = '#bae6fd';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(rugX + 5 * scaleX, rugY + 5 * scaleY, rugW - 10 * scaleX, rugH - 10 * scaleY, 8 * scaleX);
  ctx.stroke();

  // Fringe details on sides
  ctx.strokeStyle = '#e0f2fe';
  ctx.lineWidth = 1.5;
  for (let fy = rugY + 8 * scaleY; fy < rugY + rugH - 8 * scaleY; fy += 5 * scaleY) {
    ctx.beginPath(); ctx.moveTo(rugX - 3 * scaleX, fy); ctx.lineTo(rugX, fy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(rugX + rugW, fy); ctx.lineTo(rugX + rugW + 3 * scaleX, fy); ctx.stroke();
  }
  ctx.restore();
}

// =========================================================================
// SECTION 2: ARCHITECTURAL WALLS, WINDOWS & LIGHT STREAMS
// =========================================================================
function drawArchitecturalWallsAndWindows(ctx, W, H, scaleX, scaleY, isNightMode, time) {
  ctx.save();

  // 2A. Top Panoramic Curtain Wall Windows (North Skyline)
  const windowH = 14 * scaleY;
  ctx.fillStyle = isNightMode ? '#040711' : '#7dd3fc';
  ctx.fillRect(0, 0, W, windowH);

  // Distant Skyline Silhouettes through window
  const cityBuildingW = 35 * scaleX;
  for (let bx = 0; bx < W; bx += cityBuildingW) {
    const bHeight = 6 * scaleY + Math.abs(Math.sin(bx * 0.1)) * 6 * scaleY;
    ctx.fillStyle = isNightMode ? '#091024' : '#bae6fd';
    ctx.fillRect(bx, windowH - bHeight, cityBuildingW - 4 * scaleX, bHeight);

    // City Windows Lights
    if (isNightMode) {
      ctx.fillStyle = (Math.sin(time * 2 + bx) > 0) ? '#fef08a' : '#38bdf8';
      ctx.fillRect(bx + 4 * scaleX, windowH - bHeight + 2 * scaleY, 2 * scaleX, 2 * scaleY);
      ctx.fillRect(bx + 14 * scaleX, windowH - bHeight + 4 * scaleY, 2 * scaleX, 2 * scaleY);
    }
  }

  // Window Mullions (Vertical Aluminum Frames)
  ctx.fillStyle = '#334155';
  for (let mx = 0; mx < W; mx += 60 * scaleX) {
    ctx.fillRect(mx, 0, 4 * scaleX, windowH);
  }
  ctx.fillRect(0, windowH - 3 * scaleY, W, 4 * scaleY); // Window sill

  // Natural Sunlight Rays Streaming onto Floor (Day Mode)
  if (!isNightMode) {
    const sunGrad = ctx.createLinearGradient(0, windowH, 200 * scaleX, 350 * scaleY);
    sunGrad.addColorStop(0, 'rgba(255, 255, 240, 0.12)');
    sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.moveTo(150 * scaleX, windowH);
    ctx.lineTo(450 * scaleX, windowH);
    ctx.lineTo(600 * scaleX, 300 * scaleY);
    ctx.lineTo(250 * scaleX, 300 * scaleY);
    ctx.closePath();
    ctx.fill();
  }

  // 2B. Outer Architectural Boundary Walls (14px thick with baseboards & drop shadows)
  const wallThick = 10 * scaleX;
  ctx.fillStyle = isNightMode ? '#1e293b' : '#e2e8f0';

  // Left Outer Wall
  ctx.fillRect(0, 0, wallThick, H);
  // Right Outer Wall
  ctx.fillRect(W - wallThick, 0, wallThick, H);
  // Bottom Outer Wall
  ctx.fillRect(0, H - wallThick, W, wallThick);

  // Wall Baseboard Trims
  ctx.fillStyle = isNightMode ? '#334155' : '#94a3b8';
  ctx.fillRect(wallThick - 2 * scaleX, 0, 2 * scaleX, H);
  ctx.fillRect(W - wallThick, 0, 2 * scaleX, H);
  ctx.fillRect(0, H - wallThick, W, 2 * scaleY);

  // Soft Floor Drop Shadows along perimeter walls
  const wallShadow = ctx.createLinearGradient(wallThick, 0, wallThick + 12 * scaleX, 0);
  wallShadow.addColorStop(0, 'rgba(0, 0, 0, 0.28)');
  wallShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = wallShadow;
  ctx.fillRect(wallThick, 0, 14 * scaleX, H);

  // 2C. Double-Glazed Frosted Glass Boardroom Suite
  const b = OFFICE_ZONES.boardroom;
  const bx = b.x * scaleX;
  const by = b.y * scaleY;
  const bw = b.w * scaleX;
  const bh = b.h * scaleY;

  // Glass Wall Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fillRect(bx + 4 * scaleX, by + 4 * scaleY, bw, bh);

  // Glass Frame Outer Outline
  ctx.strokeStyle = isNightMode ? 'rgba(56, 189, 248, 0.45)' : 'rgba(15, 23, 42, 0.4)';
  ctx.lineWidth = 3;
  ctx.strokeRect(bx, by, bw, bh);

  // Frosted Glass Privacy Film Band (semi-opaque horizontal center band)
  ctx.fillStyle = isNightMode ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.22)';
  ctx.fillRect(bx, by, bw, 8 * scaleY);
  ctx.fillRect(bx, by + bh - 8 * scaleY, bw, 8 * scaleY);
  ctx.fillRect(bx, by, 8 * scaleX, bh);
  ctx.fillRect(bx + bw - 8 * scaleX, by, 8 * scaleX, bh);

  // Glass Doorway Opening at Bottom Wall
  const doorW = 60 * scaleX;
  const doorX = bx + bw / 2 - doorW / 2;
  ctx.clearRect(doorX, by + bh - 4 * scaleY, doorW, 8 * scaleY);

  // Stainless Steel Door Frame Threshold
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(doorX, by + bh - 2 * scaleY, doorW, 4 * scaleY);

  // Aluminum Mullion Posts
  ctx.fillStyle = '#64748b';
  const postStep = 75 * scaleX;
  for (let px = bx; px <= bx + bw; px += postStep) {
    ctx.fillRect(px - 2 * scaleX, by - 2 * scaleY, 4 * scaleX, 6 * scaleY);
    if (px < doorX || px > doorX + doorW) {
      ctx.fillRect(px - 2 * scaleX, by + bh - 4 * scaleY, 4 * scaleX, 6 * scaleY);
    }
  }

  // Specular Sheen Diagonal Highlights on Glass
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(bx + 20 * scaleX, by);
  ctx.lineTo(bx + 60 * scaleX, by + 40 * scaleY);
  ctx.moveTo(bx + bw - 60 * scaleX, by + bh - 40 * scaleY);
  ctx.lineTo(bx + bw - 20 * scaleX, by + bh);
  ctx.stroke();

  ctx.restore();
}

// =========================================================================
// SECTION 3: DETAILED MODERN FURNITURE & LIVING ZONES
// =========================================================================

// 3A. Kitchenette & Espresso Bistro
function drawEspressoBistro(ctx, scaleX, scaleY, isNightMode, time, s) {
  const br = OFFICE_ZONES.breakroom;
  const kx = (br.x + 15) * scaleX;
  const ky = (br.y + 20) * scaleY;
  const kw = 175 * scaleX;
  const kh = 45 * scaleY;

  ctx.save();

  // Quartz Countertop Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.fillRect(kx + 4 * scaleX, ky + 4 * scaleY, kw, kh);

  // Modern L-Shaped Kitchen Counter Base
  ctx.fillStyle = isNightMode ? '#1e293b' : '#f8fafc';
  ctx.fillRect(kx, ky, kw, kh);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(kx, ky, kw, kh);

  // Chrome Kitchen Sink & Gooseneck Faucet
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(kx + 12 * scaleX, ky + 10 * scaleY, 32 * scaleX, 25 * scaleY);
  ctx.fillStyle = '#64748b';
  ctx.fillRect(kx + 14 * scaleX, ky + 12 * scaleY, 28 * scaleX, 21 * scaleY);
  // Faucet
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.arc(kx + 28 * scaleX, ky + 8 * scaleY, 3.5 * scaleX, 0, Math.PI * 2);
  ctx.fill();

  // Commercial Double-Group Italian Espresso Machine
  const emX = kx + 65 * scaleX;
  const emY = ky + 6 * scaleY;
  const emW = 38 * scaleX;
  const emH = 32 * scaleY;

  ctx.fillStyle = '#0284c7'; // Polished blue/chrome chassis
  ctx.fillRect(emX, emY, emW, emH);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1;
  ctx.strokeRect(emX, emY, emW, emH);

  // Dual Portafilters & Pressure Gauges
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(emX + 6 * scaleX, emY + emH - 8 * scaleY, 8 * scaleX, 6 * scaleY);
  ctx.fillRect(emX + 24 * scaleX, emY + emH - 8 * scaleY, 8 * scaleX, 6 * scaleY);
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(emX + 10 * scaleX, emY + 8 * scaleY, 3 * scaleX, 0, Math.PI * 2);
  ctx.arc(emX + 28 * scaleX, emY + 8 * scaleY, 3 * scaleX, 0, Math.PI * 2);
  ctx.fill();

  // Ceramic Cups warming on top of machine
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(emX + 4 * scaleX, emY - 3 * scaleY, 6 * scaleX, 4 * scaleY);
  ctx.fillRect(emX + 14 * scaleX, emY - 3 * scaleY, 6 * scaleX, 4 * scaleY);
  ctx.fillRect(emX + 24 * scaleX, emY - 3 * scaleY, 6 * scaleX, 4 * scaleY);

  // Steam Puffs rising from Espresso Machine
  if (Math.random() < 0.12) {
    s.steamParticles.push({
      x: emX + 20 * scaleX + (Math.random() - 0.5) * 12 * scaleX,
      y: emY - 2 * scaleY,
      vx: (Math.random() - 0.5) * 6,
      vy: -14 - Math.random() * 8,
      size: 3.2 * scaleX,
      alpha: 0.75,
      life: 0.95
    });
  }

  // Update & Render Steam
  for (let i = s.steamParticles.length - 1; i >= 0; i--) {
    const p = s.steamParticles[i];
    p.life -= 0.016;
    p.x += p.vx * 0.016;
    p.y += p.vy * 0.016;
    p.size += 0.016 * 5 * scaleX;
    p.alpha = Math.max(0, p.life * 0.7);

    ctx.fillStyle = `rgba(241, 245, 249, ${p.alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    if (p.life <= 0) s.steamParticles.splice(i, 1);
  }

  // Double-Door Stainless Steel Refrigerator
  const frX = kx + 125 * scaleX;
  const frY = ky + 4 * scaleY;
  const frW = 42 * scaleX;
  const frH = 36 * scaleY;

  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(frX, frY, frW, frH);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(frX, frY, frW, frH);
  // Split Doors line
  ctx.beginPath();
  ctx.moveTo(frX + frW / 2, frY);
  ctx.lineTo(frX + frW / 2, frY + frH);
  ctx.stroke();
  // Handles
  ctx.fillStyle = '#334155';
  ctx.fillRect(frX + frW / 2 - 3 * scaleX, frY + 12 * scaleY, 2 * scaleX, 12 * scaleY);
  ctx.fillRect(frX + frW / 2 + 1 * scaleX, frY + 12 * scaleY, 2 * scaleX, 12 * scaleY);

  // Water Cooler (Blue 5-Gallon Bottle)
  const wcX = kx + kw + 14 * scaleX;
  const wcY = ky + 12 * scaleY;
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(wcX - 8 * scaleX, wcY, 16 * scaleX, 26 * scaleY);
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(wcX, wcY - 6 * scaleY, 9 * scaleX, 0, Math.PI * 2);
  ctx.fill();

  // Modern L-Shaped Sectional Fabric Sofa (Teal/Charcoal)
  const sofaX = (br.x + 30) * scaleX;
  const sofaY = (br.y + 115) * scaleY;
  const sofaW = 105 * scaleX;
  const sofaH = 42 * scaleY;

  ctx.fillStyle = isNightMode ? '#1e293b' : '#334155';
  ctx.beginPath();
  ctx.roundRect(sofaX, sofaY, sofaW, sofaH, 8 * scaleX);
  ctx.fill();
  ctx.strokeStyle = isNightMode ? '#334155' : '#475569';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Cozy Throw Pillows
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath(); ctx.roundRect(sofaX + 8 * scaleX, sofaY + 6 * scaleY, 14 * scaleX, 12 * scaleY, 3); ctx.fill();
  ctx.fillStyle = '#06b6d4';
  ctx.beginPath(); ctx.roundRect(sofaX + sofaW - 22 * scaleX, sofaY + 6 * scaleY, 14 * scaleX, 12 * scaleY, 3); ctx.fill();

  // Round Scandinavian Birch Coffee Table
  const ctX = sofaX + sofaW + 20 * scaleX;
  const ctY = sofaY + sofaH / 2;
  ctx.fillStyle = '#d4b996';
  ctx.beginPath();
  ctx.arc(ctX, ctY, 16 * scaleX, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#a2835e';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Tech Magazines & Small Planter on Coffee Table
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(ctX - 8 * scaleX, ctY - 6 * scaleY, 10 * scaleX, 12 * scaleY);
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(ctX + 5 * scaleX, ctY + 2 * scaleY, 4 * scaleX, 0, Math.PI * 2);
  ctx.fill();

  // Zone Label
  ctx.fillStyle = '#f59e0b';
  ctx.font = `bold ${Math.max(10, 11 * scaleX)}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillText('☕ ESPRESSO BISTRO & LOUNGE', (br.x + 15) * scaleX, (br.y + 12) * scaleY);

  ctx.restore();
}

// 3B. Architecture Whiteboard & Tech Library
function drawWhiteboardAndLibrary(ctx, scaleX, scaleY, isNightMode, time) {
  const wb = OFFICE_ZONES.whiteboardArea;
  const wbx = wb.x * scaleX;
  const wby = wb.y * scaleY;
  const wbw = wb.w * scaleX;
  const wbh = 26 * scaleY;

  ctx.save();

  // Whiteboard Aluminum Frame & Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillRect(wbx + 4 * scaleX, wby + 3 * scaleY, wbw, wbh);

  // Magnetic Whiteboard Surface
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(wbx, wby, wbw, wbh);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.strokeRect(wbx, wby, wbw, wbh);

  // Architecture Flowchart Diagrams drawn on Whiteboard
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1.2;
  // Node 1: Request
  ctx.strokeRect(wbx + 15 * scaleX, wby + 5 * scaleY, 45 * scaleX, 14 * scaleY);
  // Arrow ->
  ctx.beginPath();
  ctx.moveTo(wbx + 60 * scaleX, wby + 12 * scaleY);
  ctx.lineTo(wbx + 75 * scaleX, wby + 12 * scaleY);
  ctx.stroke();
  // Node 2: AST Orchestrator
  ctx.strokeStyle = '#10b981';
  ctx.strokeRect(wbx + 75 * scaleX, wby + 5 * scaleY, 55 * scaleX, 14 * scaleY);
  // Arrow ->
  ctx.beginPath();
  ctx.moveTo(wbx + 130 * scaleX, wby + 12 * scaleY);
  ctx.lineTo(wbx + 145 * scaleX, wby + 12 * scaleY);
  ctx.stroke();
  // Node 3: GPU Cluster Vault
  ctx.strokeStyle = '#eab308';
  ctx.strokeRect(wbx + 145 * scaleX, wby + 5 * scaleY, 55 * scaleX, 14 * scaleY);

  // Text on Board
  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${Math.max(8, 8.5 * scaleX)}px "JetBrains Mono", monospace`;
  ctx.fillText('SYSTEM ARCHITECTURE & FORMAL INVARIANTS', wbx + 215 * scaleX, wby + 16 * scaleY);

  // Sticky Notes on Board
  const notes = ['#fde047', '#f472b6', '#38bdf8', '#4ade80'];
  for (let n = 0; n < 5; n++) {
    ctx.fillStyle = notes[n % notes.length];
    ctx.fillRect(wbx + (215 + n * 24) * scaleX, wby + 4 * scaleY, 14 * scaleX, 12 * scaleY);
  }

  // Marker Tray at bottom of board
  ctx.fillStyle = '#64748b';
  ctx.fillRect(wbx + 10 * scaleX, wby + wbh - 2 * scaleY, wbw - 20 * scaleX, 3 * scaleY);
  // Color Markers
  ctx.fillStyle = '#ef4444'; ctx.fillRect(wbx + 40 * scaleX, wby + wbh - 4 * scaleY, 12 * scaleX, 2 * scaleY);
  ctx.fillStyle = '#3b82f6'; ctx.fillRect(wbx + 55 * scaleX, wby + wbh - 4 * scaleY, 12 * scaleX, 2 * scaleY);
  ctx.fillStyle = '#10b981'; ctx.fillRect(wbx + 70 * scaleX, wby + wbh - 4 * scaleY, 12 * scaleX, 2 * scaleY);

  ctx.restore();
}

// 3C. GPU Server Cluster & Network Vault
function drawServerCluster(ctx, scaleX, scaleY, isNightMode, time) {
  const sr = OFFICE_ZONES.serverRoom;
  const srx = sr.x * scaleX;
  const sry = sr.y * scaleY;

  ctx.save();

  // Zone Title
  ctx.fillStyle = '#eab308';
  ctx.font = `bold ${Math.max(10, 11 * scaleX)}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillText('⚡ GPU SERVER CLUSTER & VAULT', srx + 15 * scaleX, sry + 18 * scaleY);

  // 4 Heavy-Duty 42U Server Racks
  const rackW = 44 * scaleX;
  const rackH = 125 * scaleY;
  const rackGap = 10 * scaleX;

  for (let r = 0; r < 4; r++) {
    const rx = srx + 18 * scaleX + r * (rackW + rackGap);
    const ry = sry + 35 * scaleY;

    // Rack Outer Chassis (Matte Black with Glass door)
    ctx.fillStyle = '#090d16';
    ctx.fillRect(rx, ry, rackW, rackH);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(rx, ry, rackW, rackH);

    // Server Blades (1U/2U horizontal units)
    for (let u = 0; u < 8; u++) {
      const uy = ry + (6 + u * 14) * scaleY;
      ctx.fillStyle = '#172033';
      ctx.fillRect(rx + 4 * scaleX, uy, rackW - 8 * scaleX, 11 * scaleY);

      // Drive Bays
      ctx.fillStyle = '#22304d';
      ctx.fillRect(rx + 6 * scaleX, uy + 2 * scaleY, 14 * scaleX, 7 * scaleY);

      // Blinking Status LEDs (Green, Blue, Amber)
      const ledTick = Math.sin(time * 8 + r * 3 + u);
      ctx.fillStyle = ledTick > 0.2 ? '#10b981' : (ledTick < -0.4 ? '#eab308' : '#06b6d4');
      ctx.fillRect(rx + rackW - 14 * scaleX, uy + 3 * scaleY, 3 * scaleX, 3 * scaleY);
      ctx.fillRect(rx + rackW - 9 * scaleX, uy + 3 * scaleY, 3 * scaleX, 3 * scaleY);
    }

    // Fiber Optic Cable Trunk down side
    ctx.strokeStyle = r % 2 === 0 ? '#38bdf8' : '#facc15';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(rx + rackW - 4 * scaleX, ry);
    ctx.lineTo(rx + rackW - 4 * scaleX, ry + rackH);
    ctx.stroke();
  }

  // Wall-mounted Digital Environmental Telemetry Display
  const tdx = srx + 18 * scaleX;
  const tdy = sry + sr.h * scaleY - 24 * scaleY;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(tdx, tdy, 205 * scaleX, 16 * scaleY);
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 1;
  ctx.strokeRect(tdx, tdy, 205 * scaleX, 16 * scaleY);

  ctx.fillStyle = '#eab308';
  ctx.font = `600 ${Math.max(8.5, 9 * scaleX)}px "JetBrains Mono", monospace`;
  ctx.fillText('TEMP: 20.8°C | HUMID: 41% RH | CLUSTER LOAD: 74% | TLS: OK', tdx + 6 * scaleX, tdy + 11 * scaleY);

  ctx.restore();
}

// 3D. Central Executive Glass Boardroom
function drawExecutiveBoardroom(ctx, scaleX, scaleY, isNightMode, time) {
  const b = OFFICE_ZONES.boardroom;
  const bx = b.x * scaleX;
  const by = b.y * scaleY;
  const bw = b.w * scaleX;
  const bh = b.h * scaleY;

  ctx.save();

  // Zone Title
  ctx.fillStyle = '#38bdf8';
  ctx.font = `bold ${Math.max(10, 11 * scaleX)}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillText('🏢 EXECUTIVE BOARDROOM SUITE', bx + 16 * scaleX, by + 18 * scaleY);

  // Wall-Mounted 85" 4K Smart Presentation Screen (North Boardroom Wall)
  const scW = 120 * scaleX;
  const scH = 18 * scaleY;
  const scX = bx + bw / 2 - scW / 2;
  const scY = by + 2 * scaleY;

  ctx.fillStyle = '#090d16';
  ctx.fillRect(scX, scY, scW, scH);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(scX, scY, scW, scH);

  // Animated Presentation Screen Graphs & Metrics
  ctx.fillStyle = '#38bdf8';
  ctx.font = `bold ${Math.max(7.5, 8 * scaleX)}px "JetBrains Mono", monospace`;
  ctx.fillText('ALL-HANDS CONSENSUS & TELEMETRY STREAM', scX + 8 * scaleX, scY + 11 * scaleY);

  // Miniature animated waveform on screen
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let wx = 0; wx < 30 * scaleX; wx += 3 * scaleX) {
    const wy = Math.sin(time * 5 + wx * 0.4) * 3 * scaleY;
    if (wx === 0) ctx.moveTo(scX + scW - 35 * scaleX + wx, scY + 9 * scaleY + wy);
    else ctx.lineTo(scX + scW - 35 * scaleX + wx, scY + 9 * scaleY + wy);
  }
  ctx.stroke();

  // Expansive Racetrack Walnut Conference Table
  const tableX = bx + bw / 2;
  const tableY = by + bh / 2 + 10 * scaleY;
  const tableRadiusX = 110 * scaleX;
  const tableRadiusY = 56 * scaleY;

  // Table Floor Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(tableX + 4 * scaleX, tableY + 5 * scaleY, tableRadiusX, tableRadiusY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Polished Walnut Wood Veneer Tabletop
  ctx.fillStyle = isNightMode ? '#2a1e15' : '#5c3a21';
  ctx.beginPath();
  ctx.ellipse(tableX, tableY, tableRadiusX, tableRadiusY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = isNightMode ? '#453223' : '#7c4f2c';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Built-in Central Brushed Aluminum AV & Power Hub
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.ellipse(tableX, tableY, 28 * scaleX, 14 * scaleY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Holographic Core Emitter Ring
  ctx.fillStyle = '#06b6d4';
  ctx.beginPath();
  ctx.arc(tableX, tableY, (6 + Math.sin(time * 4) * 2) * scaleX, 0, Math.PI * 2);
  ctx.fill();

  // 7 Executive Leather Conference Chairs tucked neatly around table
  const seatPositions = OFFICE_ZONES.waypoints.boardroomSeats;
  seatPositions.forEach((seat, idx) => {
    const sx = seat.x * scaleX;
    const sy = seat.y * scaleY;

    // Chair 5-Star Caster Base
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(sx, sy, 8 * scaleX, 0, Math.PI * 2);
    ctx.fill();

    // Contoured Leather Seat
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(sx - 7 * scaleX, sy - 7 * scaleY, 14 * scaleX, 14 * scaleY, 4 * scaleX);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Open Laptop on Table in front of chair
    const lapAngle = Math.atan2(tableY - sy, tableX - sx);
    const lapX = sx + Math.cos(lapAngle) * 16 * scaleX;
    const lapY = sy + Math.sin(lapAngle) * 12 * scaleY;

    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(lapX - 6 * scaleX, lapY - 4 * scaleY, 12 * scaleX, 8 * scaleY);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(lapX - 5 * scaleX, lapY - 3 * scaleY, 10 * scaleX, 6 * scaleY);
  });

  ctx.restore();
}

// 3E. Lush Biophilic Indoor Plants
function drawBiophilicPlants(ctx, scaleX, scaleY, time) {
  ctx.save();
  const plantSpots = [
    { x: 305, y: 195, type: 'monstera' }, // Corner by breakroom
    { x: 715, y: 195, type: 'fig' },      // Corner by boardroom
    { x: 720, y: 420, type: 'snake' },    // Divider near servers
    { x: 305, y: 450, type: 'palm' },     // Left corridor
    { x: 965, y: 60, type: 'monstera' }   // Top right corner
  ];

  plantSpots.forEach((p) => {
    const px = p.x * scaleX;
    const py = p.y * scaleY;

    // Planter Pot Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(px, py + 10 * scaleY, 12 * scaleX, 5 * scaleY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Modern Ceramic Planter Pot (Terra Cotta or White)
    ctx.fillStyle = p.type === 'monstera' ? '#ea580c' : '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(px - 9 * scaleX, py - 4 * scaleY, 18 * scaleX, 15 * scaleY, 4 * scaleX);
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Lush Green Leaves with gentle organic sway
    const sway = Math.sin(time * 2 + px) * 1.5 * scaleX;
    const leafCols = ['#15803d', '#16a34a', '#22c55e', '#14532d'];

    for (let l = 0; l < 5; l++) {
      const angle = (l / 5) * Math.PI * 2 + time * 0.2;
      const lx = px + Math.cos(angle) * (12 * scaleX + sway);
      const ly = py - 8 * scaleY + Math.sin(angle) * (8 * scaleY);

      ctx.fillStyle = leafCols[l % leafCols.length];
      ctx.beginPath();
      ctx.ellipse(lx, ly, 8 * scaleX, 5 * scaleY, angle, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  ctx.restore();
}

// 3F. Workstations & Glowing Dual Displays
function drawWorkstations(ctx, scaleX, scaleY, isNightMode, time, agents) {
  ctx.save();

  Object.entries(AGENT_DESKS).forEach(([agentId, desk]) => {
    const agent = agents.find(a => a.id === agentId);
    const col = agent ? agent.color : '#3b82f6';

    const dx = desk.x * scaleX;
    const dy = desk.y * scaleY;
    const dw = 76 * scaleX;
    const dh = 44 * scaleY;

    // Floor Shadow under Desk
    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    ctx.fillRect(dx - dw / 2 + 4 * scaleX, dy - dh / 2 + 5 * scaleY, dw, dh);

    // Natural Oak / White Desk Surface
    ctx.fillStyle = isNightMode ? '#1e2433' : '#faf5ee';
    ctx.beginPath();
    ctx.roundRect(dx - dw / 2, dy - dh / 2, dw, dh, 5 * scaleX);
    ctx.fill();
    ctx.strokeStyle = isNightMode ? '#334155' : '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Felt Desk Mat
    const matW = 48 * scaleX;
    const matH = 26 * scaleY;
    ctx.fillStyle = isNightMode ? '#0f172a' : '#334155';
    ctx.fillRect(dx - matW / 2, dy - matH / 2 + 4 * scaleY, matW, matH);

    // Mechanical Keyboard on Mat
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(dx - 14 * scaleX, dy - 2 * scaleY, 26 * scaleX, 10 * scaleY);
    // RGB Key glow
    ctx.fillStyle = col;
    ctx.fillRect(dx - 12 * scaleX, dy, 22 * scaleX, 2 * scaleY);

    // Ergonomic Mouse
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(dx + 18 * scaleX, dy + 2 * scaleY, 3.5 * scaleX, 0, Math.PI * 2);
    ctx.fill();

    // Ceramic Coffee Mug
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(dx - dw / 2 + 10 * scaleX, dy + 8 * scaleY, 4 * scaleX, 0, Math.PI * 2);
    ctx.fill();

    // Dual Curved Monitors
    const monW = 26 * scaleX;
    const monH = 7 * scaleY;

    // Screen 1 (Primary Center-Left)
    const s1X = dx - monW - 2 * scaleX;
    const s1Y = dy - dh / 2 + 4 * scaleY;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(s1X, s1Y, monW, monH);
    ctx.fillStyle = col;
    ctx.shadowColor = col;
    ctx.shadowBlur = 8;
    ctx.fillRect(s1X + 2 * scaleX, s1Y + 1 * scaleY, monW - 4 * scaleX, monH - 2 * scaleY);

    // Screen 2 (Secondary Angled Right)
    const s2X = dx + 2 * scaleX;
    const s2Y = dy - dh / 2 + 4 * scaleY;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(s2X, s2Y, monW, monH);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(s2X + 2 * scaleX, s2Y + 1 * scaleY, monW - 4 * scaleX, monH - 2 * scaleY);
    ctx.shadowBlur = 0;

    // Ergonomic Swivel Mesh Office Chair behind desk
    const chairY = dy + dh / 2 + 10 * scaleY;
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(dx, chairY, 9 * scaleX, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Workstation Label Badge
    ctx.fillStyle = col;
    ctx.font = `bold ${Math.max(8.5, 9 * scaleX)}px "JetBrains Mono", monospace`;
    ctx.fillText(`${agent?.name.split(' ')[0]} Hub`, dx - dw / 2, dy + dh / 2 + 24 * scaleY);
  });

  ctx.restore();
}

// =========================================================================
// SECTION 4: SIMULATION STATE & PARTICLES
// =========================================================================
function updateAgentSimulation(s, delta, scaleX, scaleY) {
  s.agentsState.forEach((state) => {
    const agent = state.agent;

    // ALL-HANDS OVERRIDE: walk to boardroom table seats
    if (s.isAllHandsRef) {
      state.targetX = state.seatX;
      state.targetY = state.seatY;
      state.currentThought = 'Debating in Central Boardroom sprint';
    } else {
      state.timer -= delta;
      if (state.timer <= 0) {
        if (state.state === 'AT_DESK') {
          const rand = Math.random();
          if (rand < 0.28) {
            state.state = 'AT_COFFEE';
            state.targetX = OFFICE_ZONES.waypoints.coffeeMachine.x + Math.random() * 25;
            state.targetY = OFFICE_ZONES.waypoints.coffeeMachine.y + Math.random() * 20;
            state.currentThought = 'Brewing fresh espresso at Lounge';
            state.timer = 7;
          } else if (rand < 0.54) {
            state.state = 'AT_WHITEBOARD';
            state.targetX = OFFICE_ZONES.waypoints.whiteboardLeft.x + Math.random() * 100;
            state.targetY = OFFICE_ZONES.waypoints.whiteboardLeft.y + 20;
            state.currentThought = 'Sketching architecture at Whiteboard';
            state.timer = 8;
          } else if (rand < 0.76) {
            state.state = 'AT_SERVERS';
            state.targetX = OFFICE_ZONES.waypoints.serverRackA.x + Math.random() * 60;
            state.targetY = OFFICE_ZONES.waypoints.serverRackA.y + Math.random() * 35;
            state.currentThought = 'Inspecting GPU & TLS cluster racks';
            state.timer = 7;
          } else {
            state.state = 'STROLLING';
            state.targetX = 450 + Math.random() * 100;
            state.targetY = 280 + Math.random() * 80;
            state.currentThought = 'Pacing through Central Boardroom';
            state.timer = 6;
          }
        } else {
          state.state = 'AT_DESK';
          state.targetX = state.deskX;
          state.targetY = state.deskY;
          state.currentThought = agent.currentStatus;
          state.timer = 11 + Math.random() * 6;
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
        if (Math.random() < 0.22) {
          officeAudio.playFootstep();
        }
      }
    } else {
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
}

function renderDustParticles(ctx, s, delta, scaleX, scaleY) {
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

    if (p.life <= 0) s.dustParticles.splice(i, 1);
  }
}

// =========================================================================
// SECTION 5: CARTOON AGENTS & REALTIME OVERLAYS
// =========================================================================
function drawCartoonAgents(ctx, s, scaleX, scaleY, selectedAgent, spriteImg) {
  // Sort agents by Y coordinate so foreground characters naturally overlap background
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

    // Soft Contact Drop Shadow
    ctx.beginPath();
    ctx.ellipse(ax, ay + 14 * scaleY, 14 * scaleX, 6 * scaleY, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // Agent Theme Identification Halo Ring
    ctx.beginPath();
    ctx.ellipse(ax, ay + 14 * scaleY, 16 * scaleX, 7 * scaleY, 0, 0, Math.PI * 2);
    ctx.strokeStyle = agent.color;
    ctx.lineWidth = isSelected ? 3.5 : (isHovered ? 2.5 : 1.5);
    ctx.stroke();

    if (isSelected) {
      ctx.beginPath();
      ctx.ellipse(ax, ay + 14 * scaleY, (18 + Math.sin(s.time * 6) * 3) * scaleX, 8 * scaleY, 0, 0, Math.PI * 2);
      ctx.strokeStyle = agent.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    const idleBob = isWalking ? 0 : Math.sin(s.time * 4 + state.charIndex) * 1.5;

    // Draw Folk Character Sprite from ai-town Atlas
    const spriteSize = Math.round(44 * scaleX);
    const drawX = Math.round(ax - spriteSize / 2);
    const drawY = Math.round(ay - spriteSize + 14 * scaleY + idleBob);

    if (spriteImg && spriteImg.complete && spriteImg.naturalWidth > 0) {
      ctx.imageSmoothingEnabled = false;

      const charCol = state.charIndex % 4;
      const charRow = Math.floor(state.charIndex / 4);
      const colBase = charCol * 96;
      const rowBase = charRow * 128;

      const dirOffset = DIR_ROW_OFFSETS[state.dir || 'down'] ?? 0;
      const sy = rowBase + dirOffset;

      let frameCol = 1; // standing pose
      if (isWalking) {
        const step = Math.floor(state.walkStep) % 4;
        frameCol = [0, 1, 2, 1][step];
      }
      const sx = colBase + frameCol * 32;

      ctx.drawImage(
        spriteImg,
        sx, sy, 32, 32,
        drawX, drawY,
        spriteSize, spriteSize
      );
    } else {
      drawProceduralChibi(ctx, ax, ay, state, agent, scaleX, scaleY, isWalking, s.time);
    }

    ctx.imageSmoothingEnabled = true;

    // Floating Name Pill Badge
    const spriteInfo = AGENT_SPRITES[state.id] || { icon: '🤖', name: agent.name };
    const labelText = `${spriteInfo.icon} ${agent.name.split(' ')[0]}`;
    ctx.font = `bold ${Math.max(9, 10 * scaleX)}px "JetBrains Mono", monospace`;
    const labelW = ctx.measureText(labelText).width;

    const lx = ax - labelW / 2 - 6 * scaleX;
    const ly = drawY - 14 * scaleY;
    const lw = labelW + 12 * scaleX;
    const lh = 15 * scaleY;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.roundRect(lx, ly, lw, lh, 4);
    ctx.fill();
    ctx.strokeStyle = agent.color;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(labelText, lx + 6 * scaleX, ly + 11 * scaleY);

    // Floating Cartoon Speech / Thought Bubble
    if (isHovered || isSelected || Math.sin(s.time * 0.8 + state.charIndex) > -0.3) {
      const bubbleText = state.currentThought;
      ctx.font = `bold ${Math.max(9, 9.5 * scaleX)}px "Plus Jakarta Sans", sans-serif`;
      const textW = ctx.measureText(bubbleText).width;

      const bx = ax - textW / 2 - 8 * scaleX;
      const by = ly - 22 * scaleY;
      const bw = textW + 16 * scaleX;
      const bh = 18 * scaleY;

      // Speech Bubble Pointer Triangle
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.beginPath();
      ctx.moveTo(ax, ly - 3 * scaleY);
      ctx.lineTo(ax - 5 * scaleX, by + bh);
      ctx.lineTo(ax + 5 * scaleX, by + bh);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = agent.color;
      ctx.stroke();

      // Bubble Rectangle Body
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 6);
      ctx.fill();
      ctx.strokeStyle = agent.color;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.fillText(bubbleText, bx + 8 * scaleX, by + 13 * scaleY);
    }
  });
}

function drawProceduralChibi(ctx, ax, ay, state, agent, scaleX, scaleY, isWalking, time) {
  const dir = state.dir || 'down';
  const charSize = 28 * scaleX;
  const headY = ay - charSize + 4 * scaleY;

  ctx.fillStyle = agent.color || '#3b82f6';
  ctx.beginPath();
  ctx.roundRect(ax - 9 * scaleX, headY + 12 * scaleY, 18 * scaleX, 14 * scaleY, 4);
  ctx.fill();

  const legOffset = isWalking ? Math.sin(state.walkStep) * 5 * scaleX : 0;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(ax - 6 * scaleX + legOffset, ay + 6 * scaleY, 4 * scaleX, 6 * scaleY);
  ctx.fillRect(ax + 2 * scaleX - legOffset, ay + 6 * scaleY, 4 * scaleX, 6 * scaleY);

  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(ax, headY + 4 * scaleY, 10 * scaleX, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = agent.hairColor || '#0f172a';
  ctx.beginPath();
  ctx.arc(ax, headY + 2 * scaleY, 10.5 * scaleX, Math.PI, Math.PI * 2);
  ctx.fill();

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

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ax - 4.5 * scaleX + eyeOffsetX, headY + 3.5 * scaleY + eyeOffsetY, 0.7 * scaleX, 0, Math.PI * 2);
    ctx.arc(ax + 3.5 * scaleX + eyeOffsetX, headY + 3.5 * scaleY + eyeOffsetY, 0.7 * scaleX, 0, Math.PI * 2);
    ctx.fill();
  }
}
