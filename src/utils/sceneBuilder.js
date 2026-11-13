import * as THREE from 'three';

/**
 * Creates dynamic canvas textures for computer screens and whiteboards
 */
export function createDynamicScreenTexture(agentName, accentColor = '#3b82f6', type = 'code') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 288;
  const ctx = canvas.getContext('2d');

  function redraw(offset = 0) {
    ctx.fillStyle = '#080d1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, 32);

    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(20, 16, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath(); ctx.arc(36, 16, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#10b981';
    ctx.beginPath(); ctx.arc(52, 16, 5, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText(`${agentName.toUpperCase()} :: ${type.toUpperCase()}`, 70, 20);

    if (type === 'radar') {
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(256, 160, 90, 0, Math.PI * 2);
      ctx.arc(256, 160, 50, 0, Math.PI * 2);
      ctx.stroke();

      const sweep = offset * 2.5;
      ctx.beginPath();
      ctx.moveTo(256, 160);
      ctx.lineTo(256 + Math.cos(sweep) * 90, 160 + Math.sin(sweep) * 90);
      ctx.strokeStyle = '#22c55e';
      ctx.stroke();

      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.fillText('SENTINEL FLEET: 8/8 APPS SECURE [100%]', 40, 275);
    } else if (type === 'vision') {
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      ctx.fillText('> [VISION ASSISTANT] STREAMING 4K FRAMES', 20, 60);

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      const x1 = 40 + Math.sin(offset) * 20;
      const y1 = 80 + Math.cos(offset) * 10;
      ctx.strokeRect(x1, y1, 140, 80);
      ctx.fillStyle = '#10b981';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('DETECT: UI_BUTTON (99.8%)', x1 + 4, y1 - 4);

      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(220, 100, 180, 110);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('DETECT: CODE_BLOCK (99.4%)', 224, 96);
    } else if (type === 'math') {
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      ctx.fillText('> <think> DEEPSEEK REASONING TRACE </think>', 20, 60);

      ctx.fillStyle = '#93c5fd';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillText('Lemma 3: Verify bounded recurrence relation', 25, 90);
      ctx.fillText(`Compute Gradient: ${(0.0034 + Math.sin(offset) * 0.001).toFixed(6)}`, 25, 115);
      ctx.fillText('Proof Status: Q.E.D. [Formally Validated]', 25, 140);

      for (let i = 0; i < 16; i++) {
        const h = Math.abs(Math.sin(offset + i * 0.5)) * 45 + 10;
        ctx.fillStyle = i % 2 === 0 ? accentColor : '#60a5fa';
        ctx.fillRect(30 + i * 28, 255 - h, 16, h);
      }
    } else if (type === 'design') {
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('PBR SHADER COMPILATION & TEXTURES', 20, 60);

      ctx.fillStyle = '#f472b6';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillText('Render: Frosted Glass Dispersion', 25, 90);
      ctx.fillText(`Aesthetic Harmony: ${Math.min(100, 98.6 + Math.sin(offset)).toFixed(1)}% AAA`, 25, 115);

      const colors = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];
      colors.forEach((col, idx) => {
        ctx.fillStyle = col;
        ctx.fillRect(30 + idx * 70, 145, 55, 55);
      });
    } else {
      ctx.fillStyle = accentColor;
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      ctx.fillText('> export async function autonomousExecute() {', 20, 60);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillText('  const ast = await parser.parseSource(file);', 30, 85);
      ctx.fillText(`  const throughput = ${(1420 + Math.sin(offset) * 120).toFixed(0)} tok/sec;`, 30, 110);
      ctx.fillText('  await compiler.verifyInvariants({ strict: true });', 30, 135);

      ctx.fillStyle = '#10b981';
      ctx.fillText('  return { cleanArch: true, zeroErrors: 100% };', 30, 165);

      for (let i = 0; i < 18; i++) {
        const h = Math.abs(Math.sin(offset + i * 0.4)) * 40 + 8;
        ctx.fillStyle = i % 2 === 0 ? accentColor : '#38bdf8';
        ctx.fillRect(25 + i * 25, 255 - h, 14, h);
      }
    }
  }

  redraw(0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return { texture, redraw };
}

/**
 * Creates dynamic in-world 3D Speech/Thought Billboard Badge
 */
export function createThoughtBillboard(text, accentColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');

  function updateText(newText) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Pill background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.beginPath();
    ctx.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 24);
    ctx.fill();

    // Border glow
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Accent indicator dot
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(36, 48, 8, 0, Math.PI * 2);
    ctx.fill();

    // Status text
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    const truncated = newText.length > 28 ? newText.substring(0, 26) + '...' : newText;
    ctx.fillText(truncated, 56, 55);

    texture.needsUpdate = true;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  updateText(text);

  const planeGeo = new THREE.PlaneGeometry(1.6, 0.4);
  const planeMat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(planeGeo, planeMat);
  mesh.position.y = 2.15;
  return { mesh, updateText };
}

/**
 * Procedural Stylized Character Builder
 */
export function createStylizedAvatar(agent) {
  const group = new THREE.Group();
  group.name = `avatar_${agent.id}`;

  const skinMat = new THREE.MeshStandardMaterial({ color: '#fed7aa', roughness: 0.6 });
  const clothesMat = new THREE.MeshStandardMaterial({ color: agent.clothesColor, roughness: 0.5, metalness: 0.1 });
  const hairMat = new THREE.MeshStandardMaterial({ color: agent.hairColor, roughness: 0.8 });
  const accentMat = new THREE.MeshStandardMaterial({ color: agent.color, emissive: agent.color, emissiveIntensity: 0.4, roughness: 0.3 });

  // Torso
  const bodyGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.56, 12);
  const bodyMesh = new THREE.Mesh(bodyGeo, clothesMat);
  bodyMesh.position.y = 0.65;
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Head
  const headGeo = new THREE.SphereGeometry(0.22, 16, 16);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.position.y = 1.08;
  headMesh.castShadow = true;
  group.add(headMesh);

  // Hair
  const hairGeo = new THREE.ConeGeometry(0.26, 0.22, 14);
  const hairMesh = new THREE.Mesh(hairGeo, hairMat);
  hairMesh.position.set(0, 1.22, -0.04);
  hairMesh.rotation.x = -0.15;
  group.add(hairMesh);

  // Headphones
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

  // Arms
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

  // Floating Status Gem
  const gemGeo = new THREE.OctahedronGeometry(0.12, 0);
  const gemMesh = new THREE.Mesh(gemGeo, new THREE.MeshStandardMaterial({
    color: agent.color,
    emissive: agent.color,
    emissiveIntensity: 0.95,
    metalness: 0.8,
    roughness: 0.2
  }));
  gemMesh.position.y = 1.65;
  group.add(gemMesh);

  // In-World 3D Thought Billboard
  const thoughtBillboard = createThoughtBillboard(agent.currentStatus, agent.color);
  group.add(thoughtBillboard.mesh);

  return {
    group,
    gemMesh,
    leftArmGroup,
    rightArmGroup,
    headMesh,
    thoughtBillboard
  };
}

/**
 * Builds Workstation Desk Setup with curved dual monitors, keyboard, chair, and mug with steam
 */
export function createWorkstation(agent, screenData) {
  const group = new THREE.Group();
  group.position.set(...agent.deskPos);

  const deskTopMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.3, metalness: 0.2 });
  const deskTopGeo = new THREE.BoxGeometry(1.8, 0.08, 1.0);
  const deskTop = new THREE.Mesh(deskTopGeo, deskTopMat);
  deskTop.position.y = 0.72;
  deskTop.castShadow = true;
  deskTop.receiveShadow = true;
  group.add(deskTop);

  const legMat = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.8, roughness: 0.3 });
  const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.72, 8);
  const legPositions = [[-0.8, 0.36, -0.4], [0.8, 0.36, -0.4], [-0.8, 0.36, 0.4], [0.8, 0.36, 0.4]];
  legPositions.forEach(pos => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(...pos);
    leg.castShadow = true;
    group.add(leg);
  });

  const monitorStandGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.3, 8);
  const monitorStand = new THREE.Mesh(monitorStandGeo, legMat);
  monitorStand.position.set(0, 0.9, -0.28);
  group.add(monitorStand);

  const screenGeo = new THREE.BoxGeometry(1.15, 0.54, 0.04);
  const screenMat = new THREE.MeshBasicMaterial({ map: screenData.texture });
  const monitorMesh = new THREE.Mesh(screenGeo, screenMat);
  monitorMesh.position.set(0, 1.15, -0.26);
  group.add(monitorMesh);

  const auraGeo = new THREE.PlaneGeometry(1.2, 0.58);
  const auraMat = new THREE.MeshBasicMaterial({ color: agent.color, transparent: true, opacity: 0.35, side: THREE.BackSide });
  const auraMesh = new THREE.Mesh(auraGeo, auraMat);
  auraMesh.position.set(0, 1.15, -0.29);
  group.add(auraMesh);

  const kbGeo = new THREE.BoxGeometry(0.48, 0.02, 0.16);
  const kbMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.5 });
  const kb = new THREE.Mesh(kbGeo, kbMat);
  kb.position.set(0, 0.77, 0.08);
  group.add(kb);

  const mouseGeo = new THREE.BoxGeometry(0.06, 0.02, 0.1);
  const mouse = new THREE.Mesh(mouseGeo, kbMat);
  mouse.position.set(0.32, 0.77, 0.08);
  group.add(mouse);

  const mugGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.09, 10);
  const mugMat = new THREE.MeshStandardMaterial({ color: agent.color, roughness: 0.2 });
  const mug = new THREE.Mesh(mugGeo, mugMat);
  mug.position.set(-0.62, 0.8, 0.12);
  group.add(mug);

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
 * Builds Central Boardroom with Oval Glass Table, Holographic Core & Sticky Whiteboard
 */
export function createBoardroom() {
  const group = new THREE.Group();

  const tableTopGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.08, 32);
  tableTopGeo.scale(1.5, 1, 0.95);
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

  const pedestalGeo = new THREE.CylinderGeometry(0.45, 0.7, 0.68, 24);
  const pedestalMat = new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.7, roughness: 0.3 });
  const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
  pedestal.position.set(0, 0.34, 0);
  group.add(pedestal);

  const holoGeo = new THREE.IcosahedronGeometry(0.32, 1);
  const holoMat = new THREE.MeshBasicMaterial({ color: '#06b6d4', wireframe: true, transparent: true, opacity: 0.85 });
  const holoCore = new THREE.Mesh(holoGeo, holoMat);
  holoCore.position.set(0, 1.2, 0);
  holoCore.name = 'holoCore';
  group.add(holoCore);

  // Large Whiteboard with architectural sticky notes
  const boardGeo = new THREE.BoxGeometry(4.2, 2.0, 0.08);
  const boardMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.2 });
  const whiteboard = new THREE.Mesh(boardGeo, boardMat);
  whiteboard.position.set(0, 2.3, -9.2);
  group.add(whiteboard);

  // Colored Sticky Notes on Whiteboard
  const noteColors = ['#fde047', '#38bdf8', '#f472b6', '#4ade80'];
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      const noteGeo = new THREE.PlaneGeometry(0.45, 0.45);
      const noteMat = new THREE.MeshBasicMaterial({ color: noteColors[(row + col) % 4] });
      const note = new THREE.Mesh(noteGeo, noteMat);
      note.position.set(-1.4 + col * 0.9, 2.7 - row * 0.7, -9.14);
      group.add(note);
    }
  }

  const frameGeo = new THREE.BoxGeometry(4.3, 2.1, 0.06);
  const frameMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.5 });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.set(0, 2.3, -9.23);
  group.add(frame);

  return { group, holoCore };
}

/**
 * Creates Ambient Cyber Dust Particle Motes
 */
export function createAmbientMotes(count = 120) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 22;
    positions[i * 3 + 1] = Math.random() * 5 + 0.5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 22;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: '#38bdf8',
    size: 0.08,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending
  });

  return new THREE.Points(geometry, material);
}

/**
 * Creates Laser Data Conduits (connecting desks to central boardroom crystal)
 */
export function createDataBeams(agents) {
  const group = new THREE.Group();
  const lineMat = new THREE.LineBasicMaterial({
    color: '#06b6d4',
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending
  });

  agents.forEach(agent => {
    const points = [
      new THREE.Vector3(...agent.deskPos),
      new THREE.Vector3(0, 1.2, 0)
    ];
    points[0].y = 0.8; // Desk surface
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geo, lineMat);
    group.add(line);
  });

  group.visible = false;
  return group;
}

/**
 * Builds Architectural Office Floor, Lounge & Corner Amenities
 */
export function createOfficeEnvironment() {
  const group = new THREE.Group();

  // Studio Floor Tiles
  const floorGeo = new THREE.PlaneGeometry(24, 24);
  const floorMat = new THREE.MeshStandardMaterial({ color: '#0a0f1d', roughness: 0.45, metalness: 0.35 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  const grid = new THREE.GridHelper(24, 24, '#2563eb', '#1e293b');
  grid.position.y = 0.005;
  group.add(grid);

  // Frosted Glass Boundaries
  const railMat = new THREE.MeshPhysicalMaterial({ color: '#60a5fa', transparent: true, opacity: 0.25, roughness: 0.2, transmission: 0.85 });
  const railGeoX = new THREE.BoxGeometry(23.8, 0.6, 0.08);
  const railNorth = new THREE.Mesh(railGeoX, railMat); railNorth.position.set(0, 0.3, -11.9); group.add(railNorth);
  const railSouth = new THREE.Mesh(railGeoX, railMat); railSouth.position.set(0, 0.3, 11.9); group.add(railSouth);
  const railGeoZ = new THREE.BoxGeometry(0.08, 0.6, 23.8);
  const railWest = new THREE.Mesh(railGeoZ, railMat); railWest.position.set(-11.9, 0.3, 0); group.add(railWest);
  const railEast = new THREE.Mesh(railGeoZ, railMat); railEast.position.set(11.9, 0.3, 0); group.add(railEast);

  // Server Racks in DevOps Corner
  const rackGeo = new THREE.BoxGeometry(0.9, 2.4, 0.7);
  const rackMat = new THREE.MeshStandardMaterial({ color: '#090d16', metalness: 0.8, roughness: 0.2 });
  const serverRack1 = new THREE.Mesh(rackGeo, rackMat); serverRack1.position.set(9.5, 1.2, 9.5); serverRack1.castShadow = true; group.add(serverRack1);
  const serverRack2 = new THREE.Mesh(rackGeo, rackMat); serverRack2.position.set(10.5, 1.2, 9.5); serverRack2.castShadow = true; group.add(serverRack2);

  const lightsGroup = new THREE.Group();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 4; col++) {
      const ledGeo = new THREE.BoxGeometry(0.05, 0.03, 0.02);
      const ledMat = new THREE.MeshBasicMaterial({ color: (row + col) % 3 === 0 ? '#10b981' : '#38bdf8' });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(9.3 + col * 0.18, 0.35 + row * 0.26, 9.16);
      lightsGroup.add(led);
    }
  }
  group.add(lightsGroup);

  // Retro Cyber Arcade Cabinet in Breakroom Corner
  const arcadeGeo = new THREE.BoxGeometry(1.0, 2.2, 0.8);
  const arcadeMat = new THREE.MeshStandardMaterial({ color: '#312e81', metalness: 0.6, roughness: 0.3 });
  const arcade = new THREE.Mesh(arcadeGeo, arcadeMat);
  arcade.position.set(-9.8, 1.1, 9.8);
  arcade.rotation.y = Math.PI / 4;
  group.add(arcade);

  const arcadeScreenGeo = new THREE.PlaneGeometry(0.65, 0.5);
  const arcadeScreenMat = new THREE.MeshBasicMaterial({ color: '#ec4899' });
  const arcadeScreen = new THREE.Mesh(arcadeScreenGeo, arcadeScreenMat);
  arcadeScreen.position.set(-9.5, 1.35, 9.5);
  arcadeScreen.rotation.y = Math.PI / 4;
  group.add(arcadeScreen);

  // Espresso Coffee Bar Counter in Lounge Corner
  const barCounterGeo = new THREE.BoxGeometry(2.4, 0.9, 0.8);
  const barCounterMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.4 });
  const barCounter = new THREE.Mesh(barCounterGeo, barCounterMat);
  barCounter.position.set(-9.8, 0.45, -9.8);
  group.add(barCounter);

  const coffeeMachineGeo = new THREE.BoxGeometry(0.6, 0.45, 0.4);
  const coffeeMachineMat = new THREE.MeshStandardMaterial({ color: '#0284c7', metalness: 0.8, roughness: 0.2 });
  const coffeeMachine = new THREE.Mesh(coffeeMachineGeo, coffeeMachineMat);
  coffeeMachine.position.set(-9.8, 1.12, -9.8);
  group.add(coffeeMachine);

  // Stylized Potted Plants
  const createPlant = (x, z) => {
    const plantGroup = new THREE.Group();
    plantGroup.position.set(x, 0, z);

    const potGeo = new THREE.CylinderGeometry(0.28, 0.22, 0.5, 12);
    const potMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.6 });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.y = 0.25;
    plantGroup.add(pot);

    const leafMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.5 });
    for (let i = 0; i < 7; i++) {
      const leafGeo = new THREE.ConeGeometry(0.2, 0.6, 6);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(Math.cos(i * 0.9) * 0.12, 0.55 + i * 0.07, Math.sin(i * 0.9) * 0.12);
      leaf.rotation.x = Math.cos(i * 0.9) * 0.35;
      leaf.rotation.z = Math.sin(i * 0.9) * 0.35;
      plantGroup.add(leaf);
    }
    return plantGroup;
  };

  group.add(createPlant(-8.0, -10.5));
  group.add(createPlant(10.5, -10.5));
  group.add(createPlant(-10.5, 7.5));

  return { group, serverLights: lightsGroup };
}
