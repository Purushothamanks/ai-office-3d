import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  createDynamicScreenTexture,
  createStylizedAvatar,
  createWorkstation,
  createBoardroom,
  createOfficeEnvironment,
  createAmbientMotes,
  createDataBeams
} from '../utils/sceneBuilder';
import { officeAudio } from '../utils/officeAudio';

export default function Office3DCanvas({
  agents,
  selectedAgent,
  onSelectAgent,
  isAllHands,
  currentArea,
  isNightMode,
  simulationSpeed = 1,
  navigationMode = 'walk', // 'walk' (First-Person WASD) or 'orbit' (Drone Camera)
  onNearAgent,
  walkDirectionInput = null // Touch/Mobile directional input from UI
}) {
  const mountRef = useRef(null);

  const refs = useRef({
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    agentsMap: new Map(),
    screensMap: new Map(),
    motesMesh: null,
    dataBeamsGroup: null,
    holoCore: null,
    serverLights: null,
    dirLight: null,
    ambientLight: null,
    clickableObjects: [],
    animFrameId: null,
    time: 0,
    transitioning: false,
    targetCamPos: new THREE.Vector3(13, 11, 13),
    targetLookAt: new THREE.Vector3(0, 0, 0),
    isAllHandsRef: false,
    speedRef: 1,
    // First-Person Walk Navigation Engine State
    navModeRef: 'walk',
    playerPos: new THREE.Vector3(0, 1.68, 8.5), // Entrance eye-level
    yaw: Math.PI, // Facing forward toward boardroom/north window
    pitch: -0.05,
    keysPressed: { forward: false, backward: false, left: false, right: false },
    isDraggingLook: false,
    prevMouse: { x: 0, y: 0 },
    walkStep: 0,
    touchMoveInput: null
  });

  useEffect(() => {
    refs.current.navModeRef = navigationMode;
    const r = refs.current;
    if (r.controls) {
      r.controls.enabled = navigationMode === 'orbit';
    }
    if (navigationMode === 'walk' && r.camera) {
      r.playerPos.set(0, 1.68, 8.5);
      r.yaw = Math.PI;
      r.pitch = -0.05;
      r.transitioning = false;
    }
  }, [navigationMode]);

  useEffect(() => {
    refs.current.touchMoveInput = walkDirectionInput;
  }, [walkDirectionInput]);

  useEffect(() => {
    window.__captureOffice3DSnapshot = () => {
      const r = refs.current;
      if (!r.renderer || !r.scene || !r.camera) return;
      r.renderer.render(r.scene, r.camera);
      const dataUrl = r.renderer.domElement.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `AI-Office-3D-${Date.now()}.png`;
      a.click();
    };
    return () => {
      delete window.__captureOffice3DSnapshot;
    };
  }, []);

  useEffect(() => {
    refs.current.isAllHandsRef = isAllHands;
    if (refs.current.dataBeamsGroup) {
      refs.current.dataBeamsGroup.visible = isAllHands;
    }
  }, [isAllHands]);

  useEffect(() => {
    refs.current.speedRef = simulationSpeed;
  }, [simulationSpeed]);

  useEffect(() => {
    const r = refs.current;
    if (!r.agentsMap) return;
    agents.forEach(agent => {
      const avatar = r.agentsMap.get(agent.id);
      if (avatar && avatar.thoughtBillboard) {
        avatar.thoughtBillboard.updateText(agent.currentStatus);
      }
    });
  }, [agents]);

  // Handle Day / Night Lighting
  useEffect(() => {
    const r = refs.current;
    if (!r.dirLight || !r.ambientLight || !r.scene) return;

    if (isNightMode) {
      r.scene.background = new THREE.Color('#05070d');
      r.ambientLight.color.set('#312e81');
      r.ambientLight.intensity = 0.65;
      r.dirLight.color.set('#60a5fa');
      r.dirLight.intensity = 1.0;
    } else {
      r.scene.background = new THREE.Color('#090d16');
      r.ambientLight.color.set('#94a3b8');
      r.ambientLight.intensity = 1.25;
      r.dirLight.color.set('#f8fafc');
      r.dirLight.intensity = 1.9;
    }
  }, [isNightMode]);

  // Camera presets / agent selection glide
  useEffect(() => {
    const r = refs.current;
    if (!r.camera) return;

    if (selectedAgent) {
      if (r.navModeRef === 'walk') {
        // In walk mode, walk the player over to the agent desk
        r.playerPos.set(
          selectedAgent.deskPos[0] + (selectedAgent.deskPos[0] > 0 ? -1.8 : 1.8),
          1.68,
          selectedAgent.deskPos[2] + 1.2
        );
        // Look at the agent
        const dx = selectedAgent.deskPos[0] - r.playerPos.x;
        const dz = selectedAgent.deskPos[2] - r.playerPos.z;
        r.yaw = Math.atan2(dx, dz);
        r.pitch = -0.15;
      } else {
        r.targetLookAt.set(...selectedAgent.deskPos);
        r.targetLookAt.y += 1.0;
        r.targetCamPos.set(
          selectedAgent.deskPos[0] + (selectedAgent.deskPos[0] > 0 ? -3.0 : 3.0),
          selectedAgent.deskPos[1] + 2.5,
          selectedAgent.deskPos[2] + 3.0
        );
        r.transitioning = true;
      }
    } else if (currentArea) {
      r.targetCamPos.set(...currentArea.camPos);
      r.targetLookAt.set(...currentArea.target);
      r.transitioning = true;
    }
  }, [selectedAgent, currentArea]);

  // Mount Scene & Keyboard Walk Event Listeners ONCE
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isNightMode ? '#05070d' : '#090d16');
    scene.fog = new THREE.FogExp2('#090d16', 0.015);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 120);
    camera.position.set(0, 1.68, 8.5); // Start at office door entrance

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 2.5;
    controls.maxDistance = 38;
    controls.enabled = false; // Disabled by default in walk mode

    // Lights
    const ambientLight = new THREE.AmbientLight(isNightMode ? '#312e81' : '#94a3b8', isNightMode ? 0.65 : 1.25);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(isNightMode ? '#60a5fa' : '#f8fafc', isNightMode ? 1.0 : 1.9);
    dirLight.position.set(10, 16, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 45;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    const bluePoint = new THREE.PointLight('#38bdf8', 1.6, 25);
    bluePoint.position.set(-8, 5, -8);
    scene.add(bluePoint);

    const pinkPoint = new THREE.PointLight('#ec4899', 1.4, 25);
    pinkPoint.position.set(8, 5, 8);
    scene.add(pinkPoint);

    // Build Full Room with Panoramic Skyline Window & Ceiling
    const { group: officeEnv, serverLights } = createOfficeEnvironment();
    scene.add(officeEnv);

    // Boardroom
    const { group: boardroom, holoCore } = createBoardroom();
    scene.add(boardroom);

    // Cyber Dust Particle Motes
    const motesMesh = createAmbientMotes(140);
    scene.add(motesMesh);

    // Data Beams
    const dataBeamsGroup = createDataBeams(agents);
    scene.add(dataBeamsGroup);

    // Workstations & Avatars
    const agentsMap = new Map();
    const screensMap = new Map();
    const clickableObjects = [];

    agents.forEach((agent) => {
      const screenType = agent.id === 'sentinel' ? 'radar' :
                         agent.id === 'vision' ? 'vision' :
                         agent.id === 'deepseek' ? 'math' :
                         agent.id === 'diffusion' ? 'design' : 'code';

      const screenData = createDynamicScreenTexture(agent.name, agent.color, screenType);
      screensMap.set(agent.id, screenData);

      const deskGroup = createWorkstation(agent, screenData);
      deskGroup.userData = { agentId: agent.id };
      scene.add(deskGroup);

      const avatarData = createStylizedAvatar(agent);
      avatarData.group.position.set(...agent.deskPos);
      avatarData.group.position.z += 0.45;
      avatarData.group.userData = { agentId: agent.id };
      scene.add(avatarData.group);

      agentsMap.set(agent.id, {
        ...avatarData,
        deskPos: new THREE.Vector3(agent.deskPos[0], agent.deskPos[1], agent.deskPos[2] + 0.45),
        meetingPos: new THREE.Vector3(...agent.meetingPos),
        currentPos: new THREE.Vector3(agent.deskPos[0], agent.deskPos[1], agent.deskPos[2] + 0.45),
        agent
      });

      clickableObjects.push(avatarData.group, deskGroup);
    });

    const r = refs.current;
    r.scene = scene;
    r.camera = camera;
    r.renderer = renderer;
    r.controls = controls;
    r.agentsMap = agentsMap;
    r.screensMap = screensMap;
    r.motesMesh = motesMesh;
    r.dataBeamsGroup = dataBeamsGroup;
    r.holoCore = holoCore;
    r.serverLights = serverLights;
    r.dirLight = dirLight;
    r.ambientLight = ambientLight;
    r.clickableObjects = clickableObjects;

    // First-Person Walk Look & Mouse Move Listeners
    const handlePointerDown = (e) => {
      r.isDraggingLook = true;
      r.prevMouse = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e) => {
      if (r.navModeRef === 'walk' && r.isDraggingLook) {
        const deltaX = e.clientX - r.prevMouse.x;
        const deltaY = e.clientY - r.prevMouse.y;
        r.yaw -= deltaX * 0.0035;
        r.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, r.pitch - deltaY * 0.0035));
        r.prevMouse = { x: e.clientX, y: e.clientY };
      }
    };

    const handlePointerUp = () => {
      r.isDraggingLook = false;
    };

    // Keyboard WASD Walking Listeners
    const handleKeyDown = (e) => {
      if (['input', 'textarea'].includes(document.activeElement?.tagName?.toLowerCase())) return;

      if (e.code === 'KeyW' || e.code === 'ArrowUp') r.keysPressed.forward = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') r.keysPressed.backward = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') r.keysPressed.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') r.keysPressed.right = true;

      // Press 'E' to interact with closest agent when near
      if (e.code === 'KeyE') {
        const closest = findClosestAgent(r.playerPos);
        if (closest && closest.distance < 2.6) {
          onSelectAgent(closest.agent);
          officeAudio.playDing();
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') r.keysPressed.forward = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') r.keysPressed.backward = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') r.keysPressed.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') r.keysPressed.right = false;
    };

    const findClosestAgent = (pos) => {
      let closest = null;
      let minDst = Infinity;
      agents.forEach(agent => {
        const dx = agent.deskPos[0] - pos.x;
        const dz = agent.deskPos[2] - pos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < minDst) {
          minDst = dist;
          closest = { agent, distance: dist };
        }
      });
      return closest;
    };

    // Raycast Click Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableObjects, true);

      if (intersects.length > 0) {
        let curr = intersects[0].object;
        while (curr && curr.parent) {
          if (curr.userData && curr.userData.agentId) {
            const hit = agents.find((a) => a.id === curr.userData.agentId);
            if (hit) {
              onSelectAgent(hit);
              officeAudio.playDing();
              return;
            }
          }
          curr = curr.parent;
        }
      }
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 60 FPS Walking & Animation Loop
    let lastTime = performance.now();
    let typingSoundTimer = 0;
    let nearAgentCheckTimer = 0;

    const animate = () => {
      r.animFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = (now - lastTime) * 0.001 * r.speedRef;
      lastTime = now;
      r.time += delta;

      // FIRST-PERSON WALK NAVIGATION PHYSICS
      if (r.navModeRef === 'walk') {
        const moveSpeed = 4.8 * delta; // Realistic walking velocity
        const forward = new THREE.Vector3(Math.sin(r.yaw), 0, Math.cos(r.yaw));
        const right = new THREE.Vector3(Math.cos(r.yaw), 0, -Math.sin(r.yaw));
        const moveVec = new THREE.Vector3();

        if (r.keysPressed.forward || r.touchMoveInput === 'forward') moveVec.add(forward);
        if (r.keysPressed.backward || r.touchMoveInput === 'backward') moveVec.sub(forward);
        if (r.keysPressed.left || r.touchMoveInput === 'left') moveVec.add(right);
        if (r.keysPressed.right || r.touchMoveInput === 'right') moveVec.sub(right);

        const isMoving = moveVec.lengthSq() > 0;
        if (isMoving) {
          moveVec.normalize().multiplyScalar(moveSpeed);
          r.playerPos.add(moveVec);

          // Room boundary collision clamping: stay inside room walls [-10.8, 10.8]
          r.playerPos.x = Math.max(-10.8, Math.min(10.8, r.playerPos.x));
          r.playerPos.z = Math.max(-10.8, Math.min(10.8, r.playerPos.z));

          // Walking step & rhythmic footstep sounds
          r.walkStep += delta * 12;
          officeAudio.playFootstep();
        }

        // Realistic walking head-bob
        const headBob = isMoving ? Math.sin(r.walkStep) * 0.035 : 0;
        camera.position.set(r.playerPos.x, r.playerPos.y + headBob, r.playerPos.z);

        // Update Camera Look Direction from Yaw and Pitch
        const lookTarget = new THREE.Vector3(
          camera.position.x + Math.sin(r.yaw) * Math.cos(r.pitch),
          camera.position.y + Math.sin(r.pitch),
          camera.position.z + Math.cos(r.yaw) * Math.cos(r.pitch)
        );
        camera.lookAt(lookTarget);

        // Check proximity to desks for [E] prompt banner
        nearAgentCheckTimer += delta;
        if (nearAgentCheckTimer > 0.15) {
          nearAgentCheckTimer = 0;
          const closest = findClosestAgent(r.playerPos);
          if (onNearAgent) {
            onNearAgent(closest && closest.distance < 2.6 ? closest.agent : null);
          }
        }
      } else {
        // DRONE ORBIT CAMERA MODE
        if (r.transitioning) {
          camera.position.lerp(r.targetCamPos, 0.06);
          controls.target.lerp(r.targetLookAt, 0.06);
          if (camera.position.distanceTo(r.targetCamPos) < 0.08 && controls.target.distanceTo(r.targetLookAt) < 0.08) {
            r.transitioning = false;
          }
        }
        controls.update();
      }

      // Drift Ambient Particle Motes
      if (r.motesMesh) {
        const positions = r.motesMesh.geometry.attributes.position.array;
        for (let i = 0; i < positions.length / 3; i++) {
          positions[i * 3 + 1] += Math.sin(r.time + i) * 0.003;
        }
        r.motesMesh.geometry.attributes.position.needsUpdate = true;
      }

      // Rotate Hologram Core
      if (r.holoCore) {
        r.holoCore.rotation.y += delta * (r.isAllHandsRef ? 2.4 : 0.7);
        r.holoCore.rotation.x += delta * 0.35;
      }

      // Blink Server Lights
      if (r.serverLights && Math.floor(r.time * 5) % 2 === 0) {
        r.serverLights.children.forEach((led, i) => {
          led.visible = Math.sin(r.time * 7 + i) > -0.2;
        });
      }

      // Redraw Dynamic 3D Screens
      if (Math.floor(r.time * 8) !== Math.floor((r.time - delta) * 8)) {
        screensMap.forEach((screen) => screen.redraw(r.time));
      }

      // Ambient typing clicks
      typingSoundTimer += delta;
      if (typingSoundTimer > 0.35 && !r.isAllHandsRef) {
        typingSoundTimer = 0;
        if (Math.random() > 0.45) {
          officeAudio.playTyping();
        }
      }

      // Procedural Agent Animations & Thought Billboards
      agentsMap.forEach((avatar) => {
        const dest = r.isAllHandsRef ? avatar.meetingPos : avatar.deskPos;
        avatar.currentPos.lerp(dest, 0.04);
        avatar.group.position.copy(avatar.currentPos);

        avatar.headMesh.position.y = 1.08 + Math.sin(r.time * 3 + avatar.agent.deskPos[0]) * 0.015;
        avatar.gemMesh.rotation.y += delta * 2;
        avatar.gemMesh.position.y = 1.65 + Math.sin(r.time * 4 + avatar.agent.deskPos[2]) * 0.05;

        if (avatar.thoughtBillboard) {
          avatar.thoughtBillboard.mesh.lookAt(camera.position);
          avatar.thoughtBillboard.mesh.position.y = 2.15 + Math.sin(r.time * 3 + avatar.agent.deskPos[0]) * 0.03;
        }

        if (r.isAllHandsRef) {
          avatar.group.lookAt(0, avatar.group.position.y, 0);
          const gesture = Math.sin(r.time * 4 + avatar.agent.deskPos[0]);
          avatar.leftArmGroup.rotation.x = Math.PI / 4 + gesture * 0.22;
          avatar.rightArmGroup.rotation.x = Math.PI / 4 - gesture * 0.22;
        } else {
          avatar.group.rotation.y = 0;
          const tSpeed = r.time * 18 * r.speedRef;
          avatar.leftArmGroup.rotation.x = Math.PI / 4 + Math.sin(tSpeed) * 0.12;
          avatar.rightArmGroup.rotation.x = Math.PI / 4 + Math.cos(tSpeed + 0.4) * 0.12;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(r.animFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      controls.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        touchAction: 'none'
      }}
    />
  );
}
