import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Sun, Moon, Volume2, VolumeX, RotateCcw, FastForward, Maximize, Minimize } from 'lucide-react';
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

// Real contextual dialogue when 2 AI agents meet in corridors or rooms
const SOCIAL_DIALOGUES = [
  { pair: ['gemini', 'claude'], text: 'Gemini & Claude: "AST tool call verified; defensive boundaries frozen."' },
  { pair: ['gemini', 'deepseek'], text: 'Gemini & DeepSeek: "Recursive induction steps converged with zero fallacies."' },
  { pair: ['claude', 'deepseek'], text: 'Claude & DeepSeek: "Formally proving state transition invariants with Lean."' },
  { pair: ['ollama', 'sentinel'], text: 'Ollama & Sentinel: "On-device GPU air-gapped; TLS 1.3 certs rotated."' },
  { pair: ['vision', 'diffusion'], text: 'Vision & Canvas: "4K DOM bounding boxes aligned with PBR glass shaders."' },
  { pair: ['gemini', 'sentinel'], text: 'Gemini & Sentinel: "Zero-delay MutationObserver guarding runtime DOM."' },
  { pair: ['ollama', 'gemini'], text: 'Ollama & Gemini: "Serving local embeddings with 4.2ms GPU latency."' }
];

export default function Office2DCanvas({
  agents,
  selectedAgent,
  onSelectAgent,
  isAllHands,
  simulationSpeed = 1,
  isNightMode: parentIsNightMode
}) {
  const canvasRef = useRef(null);
  const spriteImgRef = useRef(null);
  const [spriteLoaded, setSpriteLoaded] = useState(false);

  // Local Controls for Minimal Floating Corner Bar
  const [isNightMode, setIsNightMode] = useState(parentIsNightMode ?? false);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(simulationSpeed);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

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

  // Camera, Navigation & Simulation State
  const simRef = useRef({
    agentsState: new Map(),
    hoveredAgentId: null,
    animId: null,
    time: 0,
    speedRef: 1,
    isAllHandsRef: false,
    dustParticles: [],
    steamParticles: [],
    targetPing: null,
    activeSocialMeeting: null,
    // 1:1 Uniform Camera System (Zoom & Pan)
    camera: {
      zoom: 1,
      panX: 0,
      panY: 0,
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      hasDragged: false
    }
  });

  useEffect(() => {
    simRef.current.speedRef = speed;
  }, [speed]);

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

    // Resize & Auto-Fit Camera to 1000 x 650 with 1:1 Aspect Ratio
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
      ctx.scale(dpr, dpr);

      // Auto-Fit Office Perfectly in Center
      const fitZoom = Math.min(rect.width / 1000, rect.height / 650) * 0.98;
      s.camera.zoom = fitZoom;
      s.camera.panX = (rect.width - 1000 * fitZoom) / 2;
      s.camera.panY = (rect.height - 650 * fitZoom) / 2;
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

      // Outer Canvas Backdrop (Deep drafting canvas)
      ctx.fillStyle = isNightMode ? '#070b14' : '#0f172a';
      ctx.fillRect(0, 0, W, H);

      // Apply 1:1 Uniform Aspect Ratio Camera Transform
      ctx.save();
      ctx.translate(s.camera.panX, s.camera.panY);
      ctx.scale(s.camera.zoom, s.camera.zoom);

      // Architectural Floor Outline Drop Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.roundRect(16, 16, 968, 618, 12);
      ctx.fill();

      // ==========================================
      // 1. ARCHITECTURAL FLOORING (WOOD, TILE, CARPET)
      // ==========================================
      drawRealOfficeFloor(ctx, isNightMode);

      // ==========================================
      // 2. WALLS, CORRIDORS & PANORAMIC WINDOWS
      // ==========================================
      drawArchitecturalWallsAndWindows(ctx, isNightMode, s.time);

      // ==========================================
      // 3. LIVING ZONES & FURNITURE
      // ==========================================
      drawEspressoBistro(ctx, isNightMode, s.time, s);
      drawWhiteboardAndLibrary(ctx, isNightMode, s.time);
      drawServerCluster(ctx, isNightMode, s.time);
      drawExecutiveBoardroom(ctx, isNightMode, s.time, s);
      drawFocusPodsAndDivider(ctx, isNightMode);
      drawBiophilicPlants(ctx, s.time);
      drawWorkstations(ctx, isNightMode, s.time, agents);

      // ==========================================
      // 4. AUTONOMOUS SIMULATION & SOCIAL INTERACTION
      // ==========================================
      updateAgentSimulation(s, delta);
      renderDustParticles(ctx, s, delta);
      renderTargetPing(ctx, s, delta);

      // ==========================================
      // 5. CARTOON CHARACTERS & OVERLAYS
      // ==========================================
      drawCartoonAgents(ctx, s, selectedAgent, spriteImgRef.current);

      // Restore Screen Transform
      ctx.restore();
    };

    animate();

    // Mouse Pointer & Zoom/Pan Interactions
    const handlePointerDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      s.camera.isDragging = true;
      s.camera.hasDragged = false;
      s.camera.dragStart = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Handle Camera Panning
      if (s.camera.isDragging) {
        const dx = e.clientX - s.camera.dragStart.x;
        const dy = e.clientY - s.camera.dragStart.y;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          s.camera.hasDragged = true;
          s.camera.panX += dx;
          s.camera.panY += dy;
          s.camera.dragStart = { x: e.clientX, y: e.clientY };
        }
        return;
      }

      // Convert Screen Coordinates to Office 1000 x 650 Space
      const officeX = (mouseX - s.camera.panX) / s.camera.zoom;
      const officeY = (mouseY - s.camera.panY) / s.camera.zoom;

      let found = null;
      s.agentsState.forEach((state) => {
        const dist = Math.sqrt((officeX - state.x) ** 2 + (officeY - state.y) ** 2);
        if (dist < 26) {
          found = state.id;
        }
      });

      s.hoveredAgentId = found;
      canvas.style.cursor = found ? 'pointer' : (s.camera.isDragging ? 'grabbing' : 'default');
    };

    const handlePointerUp = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const wasDragging = s.camera.hasDragged;
      s.camera.isDragging = false;
      s.camera.hasDragged = false;

      if (wasDragging) return; // Don't trigger clicks if user was panning

      // Convert Screen to Office coordinates
      const officeX = (mouseX - s.camera.panX) / s.camera.zoom;
      const officeY = (mouseY - s.camera.panY) / s.camera.zoom;

      let clicked = null;
      s.agentsState.forEach((state) => {
        const dist = Math.sqrt((officeX - state.x) ** 2 + (officeY - state.y) ** 2);
        if (dist < 28) {
          clicked = state.agent;
        }
      });

      if (clicked) {
        onSelectAgent(clicked);
        officeAudio.playDing();
      } else if (selectedAgent) {
        // Dispatch selected agent to coordinate with animated target ping
        const state = s.agentsState.get(selectedAgent.id);
        if (state) {
          state.targetX = officeX;
          state.targetY = officeY;
          state.state = 'USER_DISPATCHED';
          state.currentThought = 'Walking to user-selected coordinate';
          state.timer = 14;

          s.targetPing = {
            x: officeX,
            y: officeY,
            radius: 4,
            maxRadius: 24,
            alpha: 1,
            color: selectedAgent.color || '#38bdf8'
          };
          officeAudio.playDing();
        }
      }
    };

    // Smooth Mouse Wheel Zoom toward mouse pointer
    const handleWheel = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.09 : 0.92;
      const newZoom = Math.min(2.8, Math.max(0.65, s.camera.zoom * zoomFactor));

      // Zoom toward cursor position
      s.camera.panX = mouseX - (mouseX - s.camera.panX) * (newZoom / s.camera.zoom);
      s.camera.panY = mouseY - (mouseY - s.camera.panY) * (newZoom / s.camera.zoom);
      s.camera.zoom = newZoom;
    };

    // Double-click floor to reset camera view
    const handleDoubleClick = () => {
      resize();
      officeAudio.playDing();
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('dblclick', handleDoubleClick);

    return () => {
      cancelAnimationFrame(s.animId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [agents, isNightMode, selectedAgent]);

  // Reset Camera View Helper
  const handleResetCamera = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const fitZoom = Math.min(rect.width / 1000, rect.height / 650) * 0.98;
    simRef.current.camera.zoom = fitZoom;
    simRef.current.camera.panX = (rect.width - 1000 * fitZoom) / 2;
    simRef.current.camera.panY = (rect.height - 650 * fitZoom) / 2;
    officeAudio.playDing();
  }, []);

  const handleToggleSound = useCallback(() => {
    const unmuted = officeAudio.toggleMute();
    setIsMuted(!unmuted);
  }, []);

  const handleToggleSpeed = useCallback(() => {
    setSpeed((prev) => (prev === 1 ? 2 : 1));
    officeAudio.playDing();
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
    officeAudio.playDing();
  }, []);

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

      {/* Discrete, Minimal Glass Control Bar (Floating Unobtrusively in Bottom-Left Corner) */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '30px',
          padding: '6px 12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}
      >
        <button
          onClick={() => {
            setIsNightMode((prev) => !prev);
            officeAudio.playDing();
          }}
          style={{
            background: 'none',
            border: 'none',
            color: isNightMode ? '#38bdf8' : '#f59e0b',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '50%'
          }}
          title={isNightMode ? 'Switch to Natural Daylight Studio' : 'Switch to Cyber Night Mode'}
        >
          {isNightMode ? <Moon style={{ width: '16px', height: '16px' }} /> : <Sun style={{ width: '16px', height: '16px' }} />}
        </button>

        <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />

        <button
          onClick={handleToggleSound}
          style={{
            background: 'none',
            border: 'none',
            color: isMuted ? '#94a3b8' : '#10b981',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
          title={isMuted ? 'Unmute Office Audio' : 'Mute Office Audio'}
        >
          {isMuted ? <VolumeX style={{ width: '16px', height: '16px' }} /> : <Volume2 style={{ width: '16px', height: '16px' }} />}
        </button>

        <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />

        <button
          onClick={handleToggleSpeed}
          style={{
            background: 'none',
            border: 'none',
            color: speed === 2 ? '#ec4899' : '#cbd5e1',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '11px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
          }}
          title="Toggle Simulation Speed (1x / 2x)"
        >
          <FastForward style={{ width: '14px', height: '14px' }} />
          <span>{speed}x</span>
        </button>

        <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />

        <button
          onClick={handleResetCamera}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Reset Camera View to Auto-Fit"
        >
          <RotateCcw style={{ width: '14px', height: '14px' }} />
        </button>

        <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />

        <button
          onClick={handleToggleFullscreen}
          style={{
            background: 'none',
            border: 'none',
            color: isFullscreen ? '#38bdf8' : '#cbd5e1',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Native Fullscreen'}
        >
          {isFullscreen ? <Minimize style={{ width: '14px', height: '14px' }} /> : <Maximize style={{ width: '14px', height: '14px' }} />}
        </button>
      </div>
    </div>
  );
}

// =========================================================================
// SECTION 1: ARCHITECTURAL FLOORING (WOOD, PORCELAIN, CARPET, METAL)
// =========================================================================
function drawRealOfficeFloor(ctx, isNightMode) {
  ctx.save();

  // 1A. Scandinavian Bleached Oak Wood Planks in Day / Warm Smoked Walnut in Night
  const plankH = 18;
  const plankW = 75;

  const dayPlankColors = ['#f4ecdf', '#ebe0d0', '#f1e9dd', '#e6d8c4', '#ede2d3'];
  const nightPlankColors = ['#1a1511', '#221b15', '#28201a', '#1e1813', '#251e18'];
  const colors = isNightMode ? nightPlankColors : dayPlankColors;

  const startX = 20;
  const startY = 38;
  const endX = 980;
  const endY = 630;

  for (let y = startY; y < endY; y += plankH) {
    const rowIdx = ((y - startY) / plankH) | 0;
    const rowOffset = (rowIdx % 2 === 0) ? 0 : plankW / 2;

    for (let x = startX - plankW; x < endX; x += plankW) {
      const px = x + rowOffset;
      if (px + plankW < startX || px > endX) continue;

      const drawX = Math.max(startX, px);
      const drawW = Math.min(endX, px + plankW) - drawX;

      const colIdx = Math.abs(Math.sin(rowIdx * 12.9898 + (px / plankW) * 78.233) * 10000) % colors.length | 0;
      ctx.fillStyle = colors[colIdx];
      ctx.fillRect(drawX, y, drawW, plankH);

      ctx.strokeStyle = isNightMode ? 'rgba(0, 0, 0, 0.45)' : 'rgba(168, 148, 128, 0.25)';
      ctx.lineWidth = 1;
      ctx.strokeRect(drawX, y, drawW, plankH);
    }
  }

  // 1B. Espresso Bistro Ceramic Porcelain Subway Tile Floor
  const br = OFFICE_ZONES.breakroom;
  const tileCols = isNightMode ? ['#1e293b', '#243247', '#1b2536'] : ['#f8fafc', '#edf2f7', '#f1f5f9'];
  const tileSize = 20;

  ctx.fillStyle = isNightMode ? '#1e293b' : '#f8fafc';
  ctx.fillRect(br.x, br.y, br.w, br.h);

  for (let tx = br.x; tx < br.x + br.w; tx += tileSize) {
    for (let ty = br.y; ty < br.y + br.h; ty += tileSize) {
      const idx = Math.abs((Math.sin(tx * 3 + ty * 7) * 100) | 0) % tileCols.length;
      ctx.fillStyle = tileCols[idx];
      ctx.fillRect(tx, ty, tileSize, tileSize);
      ctx.strokeStyle = isNightMode ? 'rgba(15, 23, 42, 0.8)' : '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(tx, ty, tileSize, tileSize);
    }
  }
  ctx.strokeStyle = isNightMode ? '#475569' : '#94a3b8';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(br.x, br.y, br.w, br.h);

  // 1C. Executive Boardroom Acoustic Carpet Floor
  const b = OFFICE_ZONES.boardroom;
  ctx.fillStyle = isNightMode ? '#0a0f1d' : '#1e293b';
  ctx.fillRect(b.x, b.y, b.w, b.h);

  ctx.strokeStyle = isNightMode ? 'rgba(56, 189, 248, 0.05)' : 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  const carpetGrid = 12;
  for (let cx = b.x; cx < b.x + b.w; cx += carpetGrid) {
    ctx.beginPath(); ctx.moveTo(cx, b.y); ctx.lineTo(cx, b.y + b.h); ctx.stroke();
  }
  for (let cy = b.y; cy < b.y + b.h; cy += carpetGrid) {
    ctx.beginPath(); ctx.moveTo(b.x, cy); ctx.lineTo(b.x + b.w, cy); ctx.stroke();
  }

  // 1D. GPU Server Cluster Anti-Static Metal Floor
  const sr = OFFICE_ZONES.serverRoom;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(sr.x, sr.y, sr.w, sr.h);

  const metalTile = 28;
  for (let mx = sr.x; mx < sr.x + sr.w; mx += metalTile) {
    for (let my = sr.y; my < sr.y + sr.h; my += metalTile) {
      ctx.fillStyle = '#172235';
      ctx.fillRect(mx + 1, my + 1, metalTile - 2, metalTile - 2);

      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.arc(mx + metalTile / 2, my + metalTile / 2, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(mx, my, metalTile, metalTile);
    }
  }

  // Hazard Entrance Tape
  ctx.fillStyle = '#eab308';
  ctx.fillRect(sr.x, sr.y, sr.w, 8);
  ctx.fillStyle = '#0f172a';
  for (let hx = 0; hx < sr.w; hx += 16) {
    ctx.beginPath();
    ctx.moveTo(sr.x + hx, sr.y);
    ctx.lineTo(sr.x + hx + 8, sr.y);
    ctx.lineTo(sr.x + hx, sr.y + 8);
    ctx.closePath();
    ctx.fill();
  }

  // 1E. Lounge Designer Accent Rug
  const rugX = 85;
  const rugY = 135;
  const rugW = 145;
  const rugH = 65;

  ctx.fillStyle = isNightMode ? '#1e3a5f' : '#0284c7';
  ctx.beginPath();
  ctx.roundRect(rugX, rugY, rugW, rugH, 12);
  ctx.fill();

  ctx.strokeStyle = '#bae6fd';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(rugX + 5, rugY + 5, rugW - 10, rugH - 10, 8);
  ctx.stroke();

  ctx.restore();
}

// =========================================================================
// SECTION 2: ARCHITECTURAL WALLS, WINDOWS & TICKING WALL CLOCK
// =========================================================================
function drawArchitecturalWallsAndWindows(ctx, isNightMode, time) {
  ctx.save();

  // 2A. Top Panoramic Curtain Wall Windows (North Skyline)
  const windowH = 18;
  ctx.fillStyle = isNightMode ? '#040711' : '#7dd3fc';
  ctx.fillRect(20, 20, 960, windowH);

  // Distant Skyline Silhouettes
  const cityBuildingW = 35;
  for (let bx = 20; bx < 980; bx += cityBuildingW) {
    const bHeight = 8 + Math.abs(Math.sin(bx * 0.1)) * 8;
    ctx.fillStyle = isNightMode ? '#091024' : '#bae6fd';
    ctx.fillRect(bx, 20 + windowH - bHeight, cityBuildingW - 4, bHeight);

    if (isNightMode) {
      ctx.fillStyle = (Math.sin(time * 2 + bx) > 0) ? '#fef08a' : '#38bdf8';
      ctx.fillRect(bx + 4, 20 + windowH - bHeight + 2, 2, 2);
      ctx.fillRect(bx + 14, 20 + windowH - bHeight + 4, 2, 2);
    }
  }

  // Aluminum Mullions
  ctx.fillStyle = '#334155';
  for (let mx = 20; mx < 980; mx += 60) {
    ctx.fillRect(mx, 20, 4, windowH);
  }
  ctx.fillRect(20, 20 + windowH - 3, 960, 4);

  // Natural Sunlight Rays Streaming onto Floor (Day Mode)
  if (!isNightMode) {
    const sunGrad = ctx.createLinearGradient(0, 38, 300, 320);
    sunGrad.addColorStop(0, 'rgba(255, 255, 240, 0.15)');
    sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.moveTo(150, 38);
    ctx.lineTo(450, 38);
    ctx.lineTo(620, 320);
    ctx.lineTo(250, 320);
    ctx.closePath();
    ctx.fill();
  }

  // 2B. Real Working Wall Clock at Top Center (Hands tick to system time!)
  const clockX = 500;
  const clockY = 28;
  const clockR = 8;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(clockX, clockY, clockR, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 1.5; ctx.stroke();

  const now = new Date();
  const secAngle = ((now.getSeconds() + now.getMilliseconds() / 1000) / 60) * Math.PI * 2 - Math.PI / 2;
  const minAngle = ((now.getMinutes() + now.getSeconds() / 60) / 60) * Math.PI * 2 - Math.PI / 2;
  const hrAngle = (((now.getHours() % 12) + now.getMinutes() / 60) / 12) * Math.PI * 2 - Math.PI / 2;

  // Hour & Minute Hands (Black)
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(clockX, clockY); ctx.lineTo(clockX + Math.cos(hrAngle) * 4.5, clockY + Math.sin(hrAngle) * 4.5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(clockX, clockY); ctx.lineTo(clockX + Math.cos(minAngle) * 6, clockY + Math.sin(minAngle) * 6); ctx.stroke();

  // Second Hand (Red)
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(clockX, clockY); ctx.lineTo(clockX + Math.cos(secAngle) * 6.5, clockY + Math.sin(secAngle) * 6.5); ctx.stroke();

  // 2C. Outer Perimeter Walls (14px thick with baseboards & drop shadows)
  ctx.fillStyle = isNightMode ? '#1e293b' : '#e2e8f0';
  ctx.fillRect(20, 20, 10, 610); // Left
  ctx.fillRect(970, 20, 10, 610); // Right
  ctx.fillRect(20, 620, 960, 10); // Bottom

  ctx.fillStyle = isNightMode ? '#334155' : '#94a3b8';
  ctx.fillRect(28, 20, 2, 610);
  ctx.fillRect(970, 20, 2, 610);
  ctx.fillRect(20, 620, 960, 2);

  // Soft Floor Drop Shadows
  const wallShadow = ctx.createLinearGradient(30, 0, 44, 0);
  wallShadow.addColorStop(0, 'rgba(0, 0, 0, 0.28)');
  wallShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = wallShadow;
  ctx.fillRect(30, 20, 14, 610);

  ctx.restore();
}

// =========================================================================
// SECTION 3: LIVING ZONES & FURNITURE
// =========================================================================

// 3A. Kitchenette & Espresso Bistro
function drawEspressoBistro(ctx, isNightMode, time, s) {
  const br = OFFICE_ZONES.breakroom;
  const kx = br.x + 15;
  const ky = br.y + 15;
  const kw = 175;
  const kh = 45;

  ctx.save();

  // Countertop Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.fillRect(kx + 4, ky + 4, kw, kh);

  // Quartz Counter Base
  ctx.fillStyle = isNightMode ? '#1e293b' : '#f8fafc';
  ctx.fillRect(kx, ky, kw, kh);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(kx, ky, kw, kh);

  // Stainless Sink & Chrome Faucet
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(kx + 12, ky + 10, 32, 25);
  ctx.fillStyle = '#64748b';
  ctx.fillRect(kx + 14, ky + 12, 28, 21);
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath(); ctx.arc(kx + 28, ky + 8, 3.5, 0, Math.PI * 2); ctx.fill();

  // Commercial Double-Group Italian Espresso Machine
  const emX = kx + 65;
  const emY = ky + 6;
  const emW = 38;
  const emH = 32;

  ctx.fillStyle = '#0284c7';
  ctx.fillRect(emX, emY, emW, emH);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1;
  ctx.strokeRect(emX, emY, emW, emH);

  // Portafilters & Pressure Gauges
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(emX + 6, emY + emH - 8, 8, 6);
  ctx.fillRect(emX + 24, emY + emH - 8, 8, 6);
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(emX + 10, emY + 8, 3, 0, Math.PI * 2);
  ctx.arc(emX + 28, emY + 8, 3, 0, Math.PI * 2);
  ctx.fill();

  // Ceramic Cups on Warmer
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(emX + 4, emY - 3, 6, 4);
  ctx.fillRect(emX + 14, emY - 3, 6, 4);
  ctx.fillRect(emX + 24, emY - 3, 6, 4);

  // Steam Puffs rising from Espresso Machine
  if (Math.random() < 0.12) {
    s.steamParticles.push({
      x: emX + 20 + (Math.random() - 0.5) * 12,
      y: emY - 2,
      vx: (Math.random() - 0.5) * 6,
      vy: -14 - Math.random() * 8,
      size: 3.2,
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
    p.size += 0.016 * 5;
    p.alpha = Math.max(0, p.life * 0.7);

    ctx.fillStyle = `rgba(241, 245, 249, ${p.alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    if (p.life <= 0) s.steamParticles.splice(i, 1);
  }

  // Double-Door Stainless Steel Fridge
  const frX = kx + 125;
  const frY = ky + 4;
  const frW = 42;
  const frH = 36;
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(frX, frY, frW, frH);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(frX, frY, frW, frH);
  ctx.beginPath(); ctx.moveTo(frX + frW / 2, frY); ctx.lineTo(frX + frW / 2, frY + frH); ctx.stroke();

  // Water Cooler (Blue Bottle) with rising bubbles
  const wcX = kx + kw + 14;
  const wcY = ky + 12;
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(wcX - 8, wcY, 16, 26);
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath(); ctx.arc(wcX, wcY - 6, 9, 0, Math.PI * 2); ctx.fill();
  // Water bubble
  const bubY = wcY - 6 + Math.sin(time * 4) * 4;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(wcX - 2, bubY, 1.8, 0, Math.PI * 2); ctx.fill();

  // Breakfast Bar with 3 Stools
  const barX = br.x + 205;
  const barY = br.y + 70;
  ctx.fillStyle = '#c89d66';
  ctx.fillRect(barX, barY, 16, 85);
  ctx.strokeStyle = '#8a6538';
  ctx.strokeRect(barX, barY, 16, 85);

  for (let sIdx = 0; sIdx < 3; sIdx++) {
    const stY = barY + 15 + sIdx * 28;
    ctx.fillStyle = '#5c3a21';
    ctx.beginPath(); ctx.arc(barX + 8, stY, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#2d180a'; ctx.stroke();
  }

  // L-Shaped Sectional Sofa
  const sofaX = br.x + 30;
  const sofaY = br.y + 115;
  const sofaW = 105;
  const sofaH = 42;
  ctx.fillStyle = isNightMode ? '#1e293b' : '#334155';
  ctx.beginPath(); ctx.roundRect(sofaX, sofaY, sofaW, sofaH, 8); ctx.fill();
  ctx.strokeStyle = isNightMode ? '#334155' : '#475569';
  ctx.lineWidth = 2; ctx.stroke();

  // Throw Pillows
  ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.roundRect(sofaX + 8, sofaY + 6, 14, 12, 3); ctx.fill();
  ctx.fillStyle = '#06b6d4'; ctx.beginPath(); ctx.roundRect(sofaX + sofaW - 22, sofaY + 6, 14, 12, 3); ctx.fill();

  // Round Coffee Table
  const ctX = sofaX + sofaW + 20;
  const ctY = sofaY + sofaH / 2;
  ctx.fillStyle = '#d4b996';
  ctx.beginPath(); ctx.arc(ctX, ctY, 16, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#a2835e'; ctx.lineWidth = 1.5; ctx.stroke();

  // Illuminated Snack Vending Machine
  const vmX = br.x + 15;
  const vmY = br.y + 115;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(vmX, vmY, 20, 38);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(vmX + 3, vmY + 4, 14, 20); // Glowing glass
  ctx.fillStyle = '#ef4444'; ctx.fillRect(vmX + 5, vmY + 8, 4, 3);
  ctx.fillStyle = '#10b981'; ctx.fillRect(vmX + 11, vmY + 8, 4, 3);

  // Color-coded Recycling Station (Blue, Green, Black)
  const rcX = br.x + 195;
  const rcY = br.y + 160;
  ctx.fillStyle = '#2563eb'; ctx.beginPath(); ctx.arc(rcX, rcY, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#16a34a'; ctx.beginPath(); ctx.arc(rcX + 13, rcY, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(rcX + 26, rcY, 5, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
}

// 3B. Architecture Whiteboard & Tech Library with Vertical Oak Slat Feature Wall
function drawWhiteboardAndLibrary(ctx, isNightMode, time) {
  const wb = OFFICE_ZONES.whiteboardArea;
  const wbx = wb.x;
  const wby = wb.y;
  const wbw = wb.w;
  const wbh = 28;

  ctx.save();

  // Modern Vertical Oak Slat Feature Wall behind Whiteboard
  ctx.fillStyle = isNightMode ? '#1e1914' : '#2b231c';
  ctx.fillRect(wbx - 10, wby - 10, wbw + 20, wbh + 20);

  const slatW = 4;
  const slatGap = 6;
  for (let sx = wbx - 10; sx < wbx + wbw + 10; sx += slatGap) {
    ctx.fillStyle = isNightMode ? '#785633' : '#c89d66';
    ctx.fillRect(sx, wby - 10, slatW, wbh + 20);
  }

  // Whiteboard Frame & Surface
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.fillRect(wbx + 4, wby + 3, wbw - 60, wbh);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(wbx, wby, wbw - 60, wbh);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.strokeRect(wbx, wby, wbw - 60, wbh);

  // Hand-Drawn Flowchart Diagram
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(wbx + 15, wby + 5, 45, 14);
  ctx.beginPath(); ctx.moveTo(wbx + 60, wby + 12); ctx.lineTo(wbx + 75, wby + 12); ctx.stroke();
  ctx.strokeStyle = '#10b981';
  ctx.strokeRect(wbx + 75, wby + 5, 55, 14);
  ctx.beginPath(); ctx.moveTo(wbx + 130, wby + 12); ctx.lineTo(wbx + 145, wby + 12); ctx.stroke();
  ctx.strokeStyle = '#eab308';
  ctx.strokeRect(wbx + 145, wby + 5, 55, 14);

  // Sticky Notes on Board
  const notes = ['#fde047', '#f472b6', '#38bdf8', '#4ade80'];
  for (let n = 0; n < 5; n++) {
    ctx.fillStyle = notes[n % notes.length];
    ctx.fillRect(wbx + (215 + n * 18), wby + 4, 13, 11);
  }

  // Bottom Marker Shelf
  ctx.fillStyle = '#64748b';
  ctx.fillRect(wbx + 10, wby + wbh - 2, wbw - 80, 3);
  ctx.fillStyle = '#ef4444'; ctx.fillRect(wbx + 40, wby + wbh - 4, 12, 2);
  ctx.fillStyle = '#3b82f6'; ctx.fillRect(wbx + 55, wby + wbh - 4, 12, 2);
  ctx.fillStyle = '#10b981'; ctx.fillRect(wbx + 70, wby + wbh - 4, 12, 2);

  // Tall Tech Bookshelf adjacent to Whiteboard
  const bsX = wbx + wbw - 50;
  const bsY = wby;
  const bsW = 45;
  const bsH = 34;

  ctx.fillStyle = '#5c3a21';
  ctx.fillRect(bsX, bsY, bsW, bsH);
  ctx.strokeStyle = '#2e190b';
  ctx.strokeRect(bsX, bsY, bsW, bsH);

  // Books with Colorful Spines
  const bookColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
  for (let bIdx = 0; bIdx < 6; bIdx++) {
    ctx.fillStyle = bookColors[bIdx];
    ctx.fillRect(bsX + 4 + bIdx * 6, bsY + 4, 5, 12);
    ctx.fillRect(bsX + 4 + bIdx * 6, bsY + 18, 5, 12);
  }

  ctx.restore();
}

// 3C. GPU Server Cluster & Network Vault
function drawServerCluster(ctx, isNightMode, time) {
  const sr = OFFICE_ZONES.serverRoom;
  const srx = sr.x;
  const sry = sr.y;

  ctx.save();

  // 4 Heavy-Duty 42U Server Racks
  const rackW = 44;
  const rackH = 125;
  const rackGap = 10;

  for (let r = 0; r < 4; r++) {
    const rx = srx + 18 + r * (rackW + rackGap);
    const ry = sry + 35;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(rx, ry, rackW, rackH);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(rx, ry, rackW, rackH);

    // Server Blades
    for (let u = 0; u < 8; u++) {
      const uy = ry + (6 + u * 14);
      ctx.fillStyle = '#172033';
      ctx.fillRect(rx + 4, uy, rackW - 8, 11);

      ctx.fillStyle = '#22304d';
      ctx.fillRect(rx + 6, uy + 2, 14, 7);

      // Blinking Status LEDs
      const ledTick = Math.sin(time * 8 + r * 3 + u);
      ctx.fillStyle = ledTick > 0.2 ? '#10b981' : (ledTick < -0.4 ? '#eab308' : '#06b6d4');
      ctx.fillRect(rx + rackW - 14, uy + 3, 3, 3);
      ctx.fillRect(rx + rackW - 9, uy + 3, 3, 3);
    }

    // Fiber Optic Cable Trunk
    ctx.strokeStyle = r % 2 === 0 ? '#38bdf8' : '#facc15';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(rx + rackW - 4, ry);
    ctx.lineTo(rx + rackW - 4, ry + rackH);
    ctx.stroke();
  }

  // Environmental Telemetry Display
  const tdx = srx + 18;
  const tdy = sry + sr.h - 24;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(tdx, tdy, 205, 16);
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 1;
  ctx.strokeRect(tdx, tdy, 205, 16);

  ctx.fillStyle = '#eab308';
  ctx.font = '600 9px "JetBrains Mono", monospace';
  ctx.fillText('TEMP: 20.8°C | HUMID: 41% RH | CLUSTER LOAD: 74% | TLS: OK', tdx + 6, tdy + 11);

  // Red Emergency Stop & Fire Extinguisher on wall
  ctx.fillStyle = '#ef4444';
  ctx.beginPath(); ctx.arc(srx + sr.w - 12, sry + 20, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(srx + sr.w - 14, sry + 28, 4, 12);

  ctx.restore();
}

// 3D. Central Executive Glass Boardroom with Sliding Door Animation
function drawExecutiveBoardroom(ctx, isNightMode, time, s) {
  const b = OFFICE_ZONES.boardroom;
  const bx = b.x;
  const by = b.y;
  const bw = b.w;
  const bh = b.h;

  ctx.save();

  // Glass Wall Outer Frame
  ctx.strokeStyle = isNightMode ? 'rgba(56, 189, 248, 0.45)' : 'rgba(15, 23, 42, 0.4)';
  ctx.lineWidth = 3;
  ctx.strokeRect(bx, by, bw, bh);

  // Frosted Privacy Film Bands
  ctx.fillStyle = isNightMode ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.22)';
  ctx.fillRect(bx, by, bw, 8);
  ctx.fillRect(bx, by + bh - 8, bw, 8);
  ctx.fillRect(bx, by, 8, bh);
  ctx.fillRect(bx + bw - 8, by, 8, bh);

  // Animated Sliding Glass Door (opens if an agent is near the doorway!)
  const doorW = 60;
  const doorX = bx + bw / 2 - doorW / 2;

  let isAgentNearDoor = false;
  s.agentsState.forEach((st) => {
    const distToDoor = Math.sqrt((st.x - (bx + bw / 2)) ** 2 + (st.y - (by + bh)) ** 2);
    if (distToDoor < 45) isAgentNearDoor = true;
  });

  const doorSlide = isAgentNearDoor ? 22 : 0;

  // Door Opening Gap
  ctx.clearRect(doorX, by + bh - 4, doorW, 8);

  // Sliding Glass Door Panels
  ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.fillRect(doorX + 2 - doorSlide, by + bh - 4, doorW / 2 - 2, 6);
  ctx.fillRect(doorX + doorW / 2 + doorSlide, by + bh - 4, doorW / 2 - 2, 6);

  // Stainless Door Handles
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(doorX + doorW / 2 - 4 - doorSlide, by + bh - 3, 2, 4);
  ctx.fillRect(doorX + doorW / 2 + 2 + doorSlide, by + bh - 3, 2, 4);

  // Wall-Mounted 85" 4K Smart Presentation Screen
  const scW = 120;
  const scH = 18;
  const scX = bx + bw / 2 - scW / 2;
  const scY = by + 2;

  ctx.fillStyle = '#090d16';
  ctx.fillRect(scX, scY, scW, scH);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(scX, scY, scW, scH);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 8px "JetBrains Mono", monospace';
  ctx.fillText('ALL-HANDS SPRINT CONSENSUS & TELEMETRY', scX + 6, scY + 11);

  // Screen live latency waveform
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let wx = 0; wx < 30; wx += 3) {
    const wy = Math.sin(time * 5 + wx * 0.4) * 3;
    if (wx === 0) ctx.moveTo(scX + scW - 35 + wx, scY + 9 + wy);
    else ctx.lineTo(scX + scW - 35 + wx, scY + 9 + wy);
  }
  ctx.stroke();

  // Expansive Racetrack Walnut Conference Table
  const tableX = bx + bw / 2;
  const tableY = by + bh / 2 + 10;
  const tableRadiusX = 110;
  const tableRadiusY = 56;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(tableX + 4, tableY + 5, tableRadiusX, tableRadiusY, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = isNightMode ? '#2a1e15' : '#5c3a21';
  ctx.beginPath();
  ctx.ellipse(tableX, tableY, tableRadiusX, tableRadiusY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = isNightMode ? '#453223' : '#7c4f2c';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Central Recessed AV/Power Hub
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath(); ctx.ellipse(tableX, tableY, 28, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1.5; ctx.stroke();

  // 7 Executive Leather Chairs around Table
  OFFICE_ZONES.waypoints.boardroomSeats.forEach((seat) => {
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(seat.x, seat.y, 8, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.roundRect(seat.x - 7, seat.y - 7, 14, 14, 4); ctx.fill();
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5; ctx.stroke();

    // Laptops on Table
    const lapAngle = Math.atan2(tableY - seat.y, tableX - seat.x);
    const lapX = seat.x + Math.cos(lapAngle) * 16;
    const lapY = seat.y + Math.sin(lapAngle) * 12;

    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(lapX - 6, lapY - 4, 12, 8);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(lapX - 5, lapY - 3, 10, 6);
  });

  ctx.restore();
}

// Focus Pods (Privacy Phone Booths for 1-person calls)
function drawFocusPodsAndDivider(ctx, isNightMode) {
  ctx.save();
  const podSpots = [
    { x: 285, y: 240 },
    { x: 285, y: 310 }
  ];

  podSpots.forEach((pod) => {
    ctx.fillStyle = isNightMode ? '#1e293b' : '#334155';
    ctx.fillRect(pod.x, pod.y, 18, 38);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(pod.x, pod.y, 18, 38);

    // Glass door panel
    ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.fillRect(pod.x + 2, pod.y + 4, 14, 30);
    // Stool inside
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath(); ctx.arc(pod.x + 9, pod.y + 22, 4, 0, Math.PI * 2); ctx.fill();
  });

  ctx.restore();
}

// Biophilic Indoor Greenery
function drawBiophilicPlants(ctx, time) {
  ctx.save();
  const plantSpots = [
    { x: 305, y: 195, type: 'monstera' },
    { x: 715, y: 195, type: 'fig' },
    { x: 720, y: 420, type: 'snake' },
    { x: 305, y: 460, type: 'palm' },
    { x: 965, y: 65, type: 'monstera' }
  ];

  plantSpots.forEach((p) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath(); ctx.ellipse(p.x, p.y + 10, 12, 5, 0, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = p.type === 'monstera' ? '#ea580c' : '#f8fafc';
    ctx.beginPath(); ctx.roundRect(p.x - 9, p.y - 4, 18, 15, 4); ctx.fill();
    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1; ctx.stroke();

    const sway = Math.sin(time * 2 + p.x) * 1.5;
    const leafCols = ['#15803d', '#16a34a', '#22c55e', '#14532d'];

    for (let l = 0; l < 5; l++) {
      const angle = (l / 5) * Math.PI * 2 + time * 0.2;
      const lx = p.x + Math.cos(angle) * (12 + sway);
      const ly = p.y - 8 + Math.sin(angle) * 8;

      ctx.fillStyle = leafCols[l % leafCols.length];
      ctx.beginPath(); ctx.ellipse(lx, ly, 8, 5, angle, 0, Math.PI * 2); ctx.fill();
    }
  });

  ctx.restore();
}

// Developer Workstations
function drawWorkstations(ctx, isNightMode, time, agents) {
  ctx.save();

  Object.entries(AGENT_DESKS).forEach(([agentId, desk]) => {
    const agent = agents.find(a => a.id === agentId);
    const col = agent ? agent.color : '#3b82f6';

    const dx = desk.x;
    const dy = desk.y;
    const dw = 76;
    const dh = 44;

    // Floor Shadow under Desk
    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    ctx.fillRect(dx - dw / 2 + 4, dy - dh / 2 + 5, dw, dh);

    // Beveled Desk Top
    ctx.fillStyle = isNightMode ? '#1e2433' : '#faf5ee';
    ctx.beginPath(); ctx.roundRect(dx - dw / 2, dy - dh / 2, dw, dh, 5); ctx.fill();
    ctx.strokeStyle = isNightMode ? '#334155' : '#cbd5e1'; ctx.lineWidth = 1.5; ctx.stroke();

    // Felt Desk Mat
    const matW = 48;
    const matH = 26;
    ctx.fillStyle = isNightMode ? '#0f172a' : '#334155';
    ctx.fillRect(dx - matW / 2, dy - matH / 2 + 4, matW, matH);

    // Mechanical Keyboard
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(dx - 14, dy - 2, 26, 10);
    // RGB Key glow
    ctx.fillStyle = col;
    ctx.fillRect(dx - 12, dy, 22, 2);

    // Mouse
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath(); ctx.arc(dx + 18, dy + 2, 3.5, 0, Math.PI * 2); ctx.fill();

    // Coffee Mug
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(dx - dw / 2 + 10, dy + 8, 4, 0, Math.PI * 2); ctx.fill();

    // Dual Curved Displays
    const monW = 26;
    const monH = 7;

    const s1X = dx - monW - 2;
    const s1Y = dy - dh / 2 + 4;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(s1X, s1Y, monW, monH);
    ctx.fillStyle = col;
    ctx.shadowColor = col;
    ctx.shadowBlur = 8;
    ctx.fillRect(s1X + 2, s1Y + 1, monW - 4, monH - 2);

    const s2X = dx + 2;
    const s2Y = dy - dh / 2 + 4;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(s2X, s2Y, monW, monH);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(s2X + 2, s2Y + 1, monW - 4, monH - 2);
    ctx.shadowBlur = 0;

    // Swivel Chair
    const chairY = dy + dh / 2 + 10;
    ctx.fillStyle = '#090d16';
    ctx.beginPath(); ctx.arc(dx, chairY, 9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5; ctx.stroke();

    // Station Name Badge
    ctx.fillStyle = col;
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.fillText(`${agent?.name.split(' ')[0]} Hub`, dx - dw / 2, dy + dh / 2 + 24);
  });

  ctx.restore();
}

// =========================================================================
// SECTION 4: SIMULATION, CORRIDOR PATHING & SOCIAL INTERACTIONS
// =========================================================================
function updateAgentSimulation(s, delta) {
  // Check for Emergent Social Conversations between 2 nearby walking agents
  const agentList = Array.from(s.agentsState.values());
  for (let i = 0; i < agentList.length; i++) {
    for (let j = i + 1; j < agentList.length; j++) {
      const a = agentList[i];
      const b = agentList[j];
      const dist = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

      if (dist < 55 && !s.activeSocialMeeting && a.state !== 'AT_DESK' && b.state !== 'AT_DESK') {
        const dialog = SOCIAL_DIALOGUES.find(d =>
          (d.pair.includes(a.id) && d.pair.includes(b.id))
        ) || { text: `${a.agent.name.split(' ')[0]} & ${b.agent.name.split(' ')[0]}: "Reviewing sprint roadmap"` };

        s.activeSocialMeeting = {
          agentA: a.id,
          agentB: b.id,
          x: (a.x + b.x) / 2,
          y: Math.min(a.y, b.y) - 20,
          text: dialog.text,
          life: 3.5
        };
        // Face each other during chat
        a.dir = a.x < b.x ? 'right' : 'left';
        b.dir = b.x < a.x ? 'right' : 'left';
        break;
      }
    }
  }

  // Update active social meeting timer
  if (s.activeSocialMeeting) {
    s.activeSocialMeeting.life -= delta;
    if (s.activeSocialMeeting.life <= 0) s.activeSocialMeeting = null;
  }

  s.agentsState.forEach((state) => {
    const agent = state.agent;

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

      if (s.time - state.lastDustTime > 0.22) {
        state.lastDustTime = s.time;
        s.dustParticles.push({
          x: state.x,
          y: state.y + 12,
          vx: (Math.random() - 0.5) * 8,
          vy: -2 - Math.random() * 4,
          size: 2.8,
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

function renderDustParticles(ctx, s, delta) {
  for (let i = s.dustParticles.length - 1; i >= 0; i--) {
    const p = s.dustParticles[i];
    p.life -= delta;
    p.x += p.vx * delta;
    p.y += p.vy * delta;
    p.size += delta * 2;
    p.alpha = Math.max(0, p.life * 1.5);

    ctx.fillStyle = `rgba(148, 163, 184, ${p.alpha})`;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();

    if (p.life <= 0) s.dustParticles.splice(i, 1);
  }
}

// Expanding Animated Click-to-Walk Destination Ping (RTS style)
function renderTargetPing(ctx, s, delta) {
  if (!s.targetPing) return;
  const p = s.targetPing;
  p.radius += delta * 35;
  p.alpha = Math.max(0, 1 - p.radius / p.maxRadius);

  ctx.save();
  ctx.strokeStyle = p.color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = p.alpha;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
  ctx.stroke();

  // Center crosshair blip
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (p.radius >= p.maxRadius) s.targetPing = null;
}

// =========================================================================
// SECTION 5: CARTOON AGENTS & REALTIME OVERLAYS
// =========================================================================
function drawCartoonAgents(ctx, s, selectedAgent, spriteImg) {
  const sortedAgents = Array.from(s.agentsState.values()).sort((a, b) => a.y - b.y);

  sortedAgents.forEach((state) => {
    const agent = state.agent;
    const ax = state.x;
    const ay = state.y;
    const isHovered = s.hoveredAgentId === state.id;
    const isSelected = selectedAgent?.id === state.id;

    const dx = state.targetX - state.x;
    const dy = state.targetY - state.y;
    const isWalking = Math.sqrt(dx * dx + dy * dy) > 4;

    // Contact Floor Shadow
    ctx.beginPath();
    ctx.ellipse(ax, ay + 14, 14, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // Theme Halo Ring
    ctx.beginPath();
    ctx.ellipse(ax, ay + 14, 16, 7, 0, 0, Math.PI * 2);
    ctx.strokeStyle = agent.color;
    ctx.lineWidth = isSelected ? 3.5 : (isHovered ? 2.5 : 1.5);
    ctx.stroke();

    if (isSelected) {
      ctx.beginPath();
      ctx.ellipse(ax, ay + 14, 18 + Math.sin(s.time * 6) * 3, 8, 0, 0, Math.PI * 2);
      ctx.strokeStyle = agent.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    const idleBob = isWalking ? 0 : Math.sin(s.time * 4 + state.charIndex) * 1.5;

    // Draw Sprite from ai-town Atlas
    const spriteSize = 44;
    const drawX = Math.round(ax - spriteSize / 2);
    const drawY = Math.round(ay - spriteSize + 14 + idleBob);

    if (spriteImg && spriteImg.complete && spriteImg.naturalWidth > 0) {
      ctx.imageSmoothingEnabled = false;

      const charCol = state.charIndex % 4;
      const charRow = Math.floor(state.charIndex / 4);
      const colBase = charCol * 96;
      const rowBase = charRow * 128;

      const dirOffset = DIR_ROW_OFFSETS[state.dir || 'down'] ?? 0;
      const sy = rowBase + dirOffset;

      let frameCol = 1;
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
      drawProceduralChibi(ctx, ax, ay, state, agent, isWalking);
    }

    ctx.imageSmoothingEnabled = true;

    // Floating Name Pill Badge
    const spriteInfo = AGENT_SPRITES[state.id] || { icon: '🤖', name: agent.name };
    const labelText = `${spriteInfo.icon} ${agent.name.split(' ')[0]}`;
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    const labelW = ctx.measureText(labelText).width;

    const lx = ax - labelW / 2 - 6;
    const ly = drawY - 14;
    const lw = labelW + 12;
    const lh = 15;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.roundRect(lx, ly, lw, lh, 4);
    ctx.fill();
    ctx.strokeStyle = agent.color;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(labelText, lx + 6, ly + 11);

    // Floating Thought Bubble
    if (isHovered || isSelected || Math.sin(s.time * 0.8 + state.charIndex) > -0.3) {
      const bubbleText = state.currentThought;
      ctx.font = 'bold 9.5px "Plus Jakarta Sans", sans-serif';
      const textW = ctx.measureText(bubbleText).width;

      const bx = ax - textW / 2 - 8;
      const by = ly - 22;
      const bw = textW + 16;
      const bh = 18;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.beginPath();
      ctx.moveTo(ax, ly - 3);
      ctx.lineTo(ax - 5, by + bh);
      ctx.lineTo(ax + 5, by + bh);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = agent.color;
      ctx.stroke();

      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 6);
      ctx.fill();
      ctx.strokeStyle = agent.color;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.fillText(bubbleText, bx + 8, by + 13);
    }
  });

  // Render Active Social Conversation Balloon
  if (s.activeSocialMeeting) {
    const sm = s.activeSocialMeeting;
    ctx.save();
    ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
    const tw = ctx.measureText(sm.text).width;
    const sx = sm.x - tw / 2 - 10;
    const sy = sm.y - 24;
    const sw = tw + 20;
    const sh = 20;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
    ctx.beginPath();
    ctx.roundRect(sx, sy, sw, sh, 6);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.fillText(sm.text, sx + 10, sy + 14);
    ctx.restore();
  }
}

function drawProceduralChibi(ctx, ax, ay, state, agent, isWalking) {
  const dir = state.dir || 'down';
  const charSize = 28;
  const headY = ay - charSize + 4;

  ctx.fillStyle = agent.color || '#3b82f6';
  ctx.beginPath();
  ctx.roundRect(ax - 9, headY + 12, 18, 14, 4);
  ctx.fill();

  const legOffset = isWalking ? Math.sin(state.walkStep) * 5 : 0;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(ax - 6 + legOffset, ay + 6, 4, 6);
  ctx.fillRect(ax + 2 - legOffset, ay + 6, 4, 6);

  ctx.fillStyle = '#fed7aa';
  ctx.beginPath(); ctx.arc(ax, headY + 4, 10, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = agent.hairColor || '#0f172a';
  ctx.beginPath(); ctx.arc(ax, headY + 2, 10.5, Math.PI, Math.PI * 2); ctx.fill();

  let eyeOffsetX = 0;
  let eyeOffsetY = 0;
  if (dir === 'left') eyeOffsetX = -3;
  if (dir === 'right') eyeOffsetX = 3;
  if (dir === 'up') eyeOffsetY = -2;
  if (dir === 'down') eyeOffsetY = 2;

  if (dir !== 'up') {
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(ax - 4 + eyeOffsetX, headY + 4 + eyeOffsetY, 1.8, 0, Math.PI * 2);
    ctx.arc(ax + 4 + eyeOffsetX, headY + 4 + eyeOffsetY, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ax - 4.5 + eyeOffsetX, headY + 3.5 + eyeOffsetY, 0.7, 0, Math.PI * 2);
    ctx.arc(ax + 3.5 + eyeOffsetX, headY + 3.5 + eyeOffsetY, 0.7, 0, Math.PI * 2);
    ctx.fill();
  }
}
