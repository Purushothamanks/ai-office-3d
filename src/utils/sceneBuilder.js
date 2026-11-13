import * as THREE from 'three';

/**
 * Creates dynamic canvas textures for computer screens and whiteboards
 */
export function createDynamicScreenTexture(text, accentColor = '#3b82f6', type = 'code') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 288;
  const ctx = canvas.getContext('2d');

  function redraw(offset = 0) {
    // Screen background
    ctx.fillStyle = '#0a0e17';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Terminal top bar
    ctx.fillStyle = '#161e2e';
    ctx.fillRect(0, 0, canvas.width, 32);

    // Window control dots
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(20, 16, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath(); ctx.arc(36, 16, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#10b981';
    ctx.beginPath(); ctx.arc(52, 16, 5, 0, Math.PI * 2); ctx.fill();

    // Title
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText(`LAF_AI_CORE :: ${type.toUpperCase()}`, 70, 20);

    // Content based on type
    if (type === 'code') {
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      ctx.fillText('> export async function executeWorkflow() {', 20, 60);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillText('  const state = await aiEngine.step();', 30, 85);
      ctx.fillText(`  optimizer.computeGradients({ loss: ${(0.012 + Math.sin(offset) * 0.004).toFixed(4)} });`, 30, 110);
      ctx.fillText('  if (state.converged) return state.result;', 30, 135);

      ctx.fillStyle = '#a855f7';
      ctx.fillText('  // Realtime Neural Attention Flow', 30, 165);

      // Mini visualization bars
      for (let i = 0; i < 18; i++) {
        const h = Math.abs(Math.sin(offset + i * 0.6)) * 40 + 10;
        ctx.fillStyle = i % 2 === 0 ? accentColor : '#06b6d4';
        ctx.fillRect(30 + i * 24, 250 - h, 14, h);
      }
    } else if (type === 'radar') {
      // DevOps Security Radar
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(256, 160, 90, 0, Math.PI * 2);
      ctx.arc(256, 160, 50, 0, Math.PI * 2);
      ctx.stroke();

      // Sweep line
      const sweep = offset * 2;
      ctx.beginPath();
      ctx.moveTo(256, 160);
      ctx.lineTo(256 + Math.cos(sweep) * 90, 160 + Math.sin(sweep) * 90);
      ctx.strokeStyle = '#22c55e';
      ctx.stroke();

      ctx.fillStyle = '#22c55e';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillText('SENTINEL-OPS: 0 THREATS DETECTED', 40, 275);
    } else {
      // Research / Design
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('LATENT COGNITION MATRIX', 20, 65);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`Reasoning Consensus: ${Math.min(99.9, 97.4 + Math.sin(offset)).toFixed(1)}%`, 20, 95);
      ctx.fillText(`Active Neural Tokens: ${(142000 + Math.sin(offset) * 4000).toFixed(0)} tok/s`, 20, 120);

      // Wireframe geometry on screen
      ctx.strokeStyle = accentColor;
      ctx.strokeRect(40, 145, 120, 80);
      ctx.strokeRect(180, 145, 120, 80);
      ctx.strokeRect(320, 145, 120, 80);
    }
  }

  redraw(0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return { texture, redraw };
}

/**
 * Procedural Stylized Character Builder
 */
export function createStylizedAvatar(agent) {
  const group = new THREE.Group();
  group.name = `avatar_${agent.id}`;

  const skinMat = new THREE.MeshStandardMaterial({
    color: '#fed7aa', // Warm peach tone
    roughness: 0.6
  });

  const clothesMat = new THREE.MeshStandardMaterial({
    color: agent.clothesColor,
    roughness: 0.5,
    metalness: 0.1
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: agent.hairColor,
    roughness: 0.8
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: agent.color,
    emissive: agent.color,
    emissiveIntensity: 0.35,
    roughness: 0.3
  });

  // 1. Torso / Body (Jacket / Hoodie)
  const bodyGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.56, 12);
  const bodyMesh = new THREE.Mesh(bodyGeo, clothesMat);
  bodyMesh.position.y = 0.65;
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // 2. Head
  const headGeo = new THREE.SphereGeometry(0.22, 16, 16);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.position.y = 1.08;
  headMesh.castShadow = true;
  group.add(headMesh);

  // 3. Hair
  const hairGeo = new THREE.ConeGeometry(0.26, 0.22, 14);
  const hairMesh = new THREE.Mesh(hairGeo, hairMat);
  hairMesh.position.set(0, 1.22, -0.04);
  hairMesh.rotation.x = -0.15;
  group.add(hairMesh);

  // 4. Tech Headphones or Glasses
  const bandGeo = new THREE.TorusGeometry(0.22, 0.035, 8, 16, Math.PI);
  const bandMesh = new THREE.Mesh(bandGeo, accentMat);
  bandMesh.rotation.x = -Math.PI / 2;
  bandMesh.position.set(0, 1.15, 0);
  group.add(bandMesh);

  const earpadGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.05, 10);
  const earpadL = new THREE.Mesh(earpadGeo, accentMat);
  earpadL.rotation.z = Math.PI / 2;
  earpadL.position.set(-0.22, 1.08, 0);
  group.add(earpadL);

  const earpadR = new THREE.Mesh(earpadGeo, accentMat);
  earpadR.rotation.z = Math.PI / 2;
  earpadR.position.set(0.22, 1.08, 0);
  group.add(earpadR);

  // 5. Arms & Hands (Animated typing pivots)
  const armGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.36, 8);

  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.3, 0.82, 0);
  const leftArm = new THREE.Mesh(armGeo, clothesMat);
  leftArm.position.set(0, -0.16, 0.12);
  leftArm.rotation.x = Math.PI / 3;
  leftArmGroup.add(leftArm);
  group.add(leftArmGroup);

  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.3, 0.82, 0);
  const rightArm = new THREE.Mesh(armGeo, clothesMat);
  rightArm.position.set(0, -0.16, 0.12);
  rightArm.rotation.x = Math.PI / 3;
  rightArmGroup.add(rightArm);
  group.add(rightArmGroup);

  // 6. Floating Holographic Status Gem (Bobs and rotates over agent's head)
  const gemGeo = new THREE.OctahedronGeometry(0.12, 0);
  const gemMesh = new THREE.Mesh(gemGeo, new THREE.MeshStandardMaterial({
    color: agent.color,
    emissive: agent.color,
    emissiveIntensity: 0.9,
    metalness: 0.8,
    roughness: 0.2
  }));
  gemMesh.position.y = 1.65;
  group.add(gemMesh);

  // Group references for animation
  return {
    group,
    gemMesh,
    leftArmGroup,
    rightArmGroup,
    headMesh
  };
}

/**
 * Builds Workstation Desk Setup with curved dual monitors, keyboard, chair, and mug
 */
export function createWorkstation(agent, screenData) {
  const group = new THREE.Group();
  group.position.set(...agent.deskPos);

  // 1. Desk Surface
  const deskTopMat = new THREE.MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.3,
    metalness: 0.2
  });
  const deskTopGeo = new THREE.BoxGeometry(1.8, 0.08, 1.0);
  const deskTop = new THREE.Mesh(deskTopGeo, deskTopMat);
  deskTop.position.y = 0.72;
  deskTop.castShadow = true;
  deskTop.receiveShadow = true;
  group.add(deskTop);

  // Desk Metal Legs
  const legMat = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.8, roughness: 0.3 });
  const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.72, 8);

  const legPositions = [
    [-0.8, 0.36, -0.4],
    [0.8, 0.36, -0.4],
    [-0.8, 0.36, 0.4],
    [0.8, 0.36, 0.4]
  ];
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(...pos);
    leg.castShadow = true;
    group.add(leg);
  });

  // 2. Ultrawide Curved Monitor
  const monitorStandGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.3, 8);
  const monitorStand = new THREE.Mesh(monitorStandGeo, legMat);
  monitorStand.position.set(0, 0.9, -0.28);
  group.add(monitorStand);

  const screenGeo = new THREE.BoxGeometry(1.1, 0.52, 0.04);
  const screenMat = new THREE.MeshBasicMaterial({
    map: screenData.texture
  });
  const monitorMesh = new THREE.Mesh(screenGeo, screenMat);
  monitorMesh.position.set(0, 1.14, -0.26);
  monitorMesh.rotation.y = 0;
  group.add(monitorMesh);

  // Glowing Monitor Back Aura
  const auraGeo = new THREE.PlaneGeometry(1.15, 0.56);
  const auraMat = new THREE.MeshBasicMaterial({
    color: agent.color,
    transparent: true,
    opacity: 0.35,
    side: THREE.BackSide
  });
  const auraMesh = new THREE.Mesh(auraGeo, auraMat);
  auraMesh.position.set(0, 1.14, -0.29);
  group.add(auraMesh);

  // 3. Ergonomic Keyboard & Mouse
  const kbGeo = new THREE.BoxGeometry(0.48, 0.02, 0.16);
  const kbMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.5 });
  const kb = new THREE.Mesh(kbGeo, kbMat);
  kb.position.set(0, 0.77, 0.08);
  group.add(kb);

  const mouseGeo = new THREE.BoxGeometry(0.06, 0.02, 0.1);
  const mouse = new THREE.Mesh(mouseGeo, kbMat);
  mouse.position.set(0.32, 0.77, 0.08);
  group.add(mouse);

  // 4. Coffee Mug with Accent Color
  const mugGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.09, 10);
  const mugMat = new THREE.MeshStandardMaterial({ color: agent.color, roughness: 0.2 });
  const mug = new THREE.Mesh(mugGeo, mugMat);
  mug.position.set(-0.62, 0.8, 0.12);
  group.add(mug);

  // 5. Office Mesh Chair
  const chairMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.7 });
  const chairSeatGeo = new THREE.BoxGeometry(0.5, 0.08, 0.5);
  const chairSeat = new THREE.Mesh(chairSeatGeo, chairMat);
  chairSeat.position.set(0, 0.44, 0.45);
  group.add(chairSeat);

  const chairBackGeo = new THREE.BoxGeometry(0.48, 0.52, 0.06);
  const chairBack = new THREE.Mesh(chairBackGeo, chairMat);
  chairBack.position.set(0, 0.72, 0.68);
  group.add(chairBack);

  const chairBaseGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8);
  const chairBase = new THREE.Mesh(chairBaseGeo, legMat);
  chairBase.position.set(0, 0.2, 0.45);
  group.add(chairBase);

  return group;
}

/**
 * Builds Central Boardroom with Oval Glass Table & Whiteboard
 */
export function createBoardroom() {
  const group = new THREE.Group();

  // 1. Frosted Glass Oval Conference Table
  const tableTopGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.08, 32);
  tableTopGeo.scale(1.4, 1, 0.9); // Oval
  const tableGlassMat = new THREE.MeshPhysicalMaterial({
    color: '#38bdf8',
    transparent: true,
    opacity: 0.65,
    roughness: 0.15,
    transmission: 0.8,
    thickness: 0.5,
    metalness: 0.1
  });
  const tableMesh = new THREE.Mesh(tableTopGeo, tableGlassMat);
  tableMesh.position.set(0, 0.72, 0);
  tableMesh.castShadow = true;
  group.add(tableMesh);

  // Pedestal base
  const pedestalGeo = new THREE.CylinderGeometry(0.4, 0.6, 0.68, 24);
  const pedestalMat = new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.7, roughness: 0.3 });
  const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
  pedestal.position.set(0, 0.34, 0);
  group.add(pedestal);

  // Center Holographic Rotating Projector
  const holoGeo = new THREE.IcosahedronGeometry(0.28, 1);
  const holoMat = new THREE.MeshBasicMaterial({
    color: '#06b6d4',
    wireframe: true,
    transparent: true,
    opacity: 0.85
  });
  const holoCore = new THREE.Mesh(holoGeo, holoMat);
  holoCore.position.set(0, 1.15, 0);
  holoCore.name = 'holoCore';
  group.add(holoCore);

  // 2. Large Interactive Whiteboard
  const boardGeo = new THREE.BoxGeometry(3.6, 1.8, 0.08);
  const boardMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.2 });
  const whiteboard = new THREE.Mesh(boardGeo, boardMat);
  whiteboard.position.set(0, 2.1, -6.8);
  group.add(whiteboard);

  // Board Stand & Frame
  const frameGeo = new THREE.BoxGeometry(3.7, 1.9, 0.06);
  const frameMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.5 });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.set(0, 2.1, -6.83);
  group.add(frame);

  return { group, holoCore };
}

/**
 * Builds Architectural Office Floor, Low Glass Partitions & Accents
 */
export function createOfficeEnvironment() {
  const group = new THREE.Group();

  // 1. Studio Floor Tiles (Polished Dark Slate)
  const floorGeo = new THREE.PlaneGeometry(16, 16);
  const floorMat = new THREE.MeshStandardMaterial({
    color: '#0b111e',
    roughness: 0.45,
    metalness: 0.35
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  group.add(floor);

  // 2. Ambient Grid Floor Lines
  const grid = new THREE.GridHelper(16, 16, '#2563eb', '#1e293b');
  grid.position.y = 0.005;
  group.add(grid);

  // 3. Frosted Glass Boundary Railings
  const railMat = new THREE.MeshPhysicalMaterial({
    color: '#60a5fa',
    transparent: true,
    opacity: 0.25,
    roughness: 0.2,
    transmission: 0.85
  });

  const railGeoX = new THREE.BoxGeometry(15.8, 0.6, 0.08);
  const railNorth = new THREE.Mesh(railGeoX, railMat);
  railNorth.position.set(0, 0.3, -7.9);
  group.add(railNorth);

  const railSouth = new THREE.Mesh(railGeoX, railMat);
  railSouth.position.set(0, 0.3, 7.9);
  group.add(railSouth);

  const railGeoZ = new THREE.BoxGeometry(0.08, 0.6, 15.8);
  const railWest = new THREE.Mesh(railGeoZ, railMat);
  railWest.position.set(-7.9, 0.3, 0);
  group.add(railWest);

  const railEast = new THREE.Mesh(railGeoZ, railMat);
  railEast.position.set(7.9, 0.3, 0);
  group.add(railEast);

  // 4. Server Rack in DevOps Corner
  const rackGeo = new THREE.BoxGeometry(0.8, 2.2, 0.6);
  const rackMat = new THREE.MeshStandardMaterial({ color: '#090d16', metalness: 0.8, roughness: 0.2 });
  const serverRack = new THREE.Mesh(rackGeo, rackMat);
  serverRack.position.set(6.8, 1.1, 6.5);
  serverRack.castShadow = true;
  group.add(serverRack);

  // Blinking Server Lights on Rack
  const lightsGroup = new THREE.Group();
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 3; col++) {
      const ledGeo = new THREE.BoxGeometry(0.05, 0.03, 0.02);
      const ledMat = new THREE.MeshBasicMaterial({
        color: (row + col) % 3 === 0 ? '#10b981' : '#38bdf8'
      });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(6.55 + col * 0.15, 0.35 + row * 0.26, 6.2);
      lightsGroup.add(led);
    }
  }
  group.add(lightsGroup);

  // 5. Stylized Potted Plants
  const createPlant = (x, z) => {
    const plantGroup = new THREE.Group();
    plantGroup.position.set(x, 0, z);

    const potGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.44, 12);
    const potMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.6 });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.y = 0.22;
    plantGroup.add(pot);

    const leafMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.5 });
    for (let i = 0; i < 6; i++) {
      const leafGeo = new THREE.ConeGeometry(0.18, 0.5, 6);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(
        Math.cos(i * 1.05) * 0.1,
        0.5 + i * 0.06,
        Math.sin(i * 1.05) * 0.1
      );
      leaf.rotation.x = Math.cos(i * 1.05) * 0.35;
      leaf.rotation.z = Math.sin(i * 1.05) * 0.35;
      plantGroup.add(leaf);
    }
    return plantGroup;
  };

  group.add(createPlant(-6.8, -6.8));
  group.add(createPlant(6.8, -6.8));
  group.add(createPlant(-6.8, 6.8));

  return { group, serverLights: lightsGroup };
}
