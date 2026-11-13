import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import {
  createDynamicScreenTexture,
  createStylizedAvatar,
  createWorkstation,
  createBoardroom,
  createOfficeEnvironment
} from '../utils/sceneBuilder';
import { officeAudio } from '../utils/officeAudio';

export default function Office3DCanvas({
  agents,
  selectedAgent,
  onSelectAgent,
  isAllHands,
  currentArea,
  isNightMode,
  simulationSpeed = 1
}) {
  const mountRef = useRef(null);
  const stateRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    agentsMap: new Map(),
    screensMap: new Map(),
    holoCore: null,
    serverLights: null,
    dirLight: null,
    ambientLight: null,
    targetCamPos: new THREE.Vector3(11, 10, 11),
    targetLookAt: new THREE.Vector3(0, 0, 0),
    currentLookAt: new THREE.Vector3(0, 0, 0),
    isInteracting: false,
    prevPointer: { x: 0, y: 0 },
    spherical: { radius: 17, theta: Math.PI / 4, phi: Math.PI / 3 },
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(),
    clickableObjects: [],
    animFrameId: null,
    time: 0
  });

  // Handle pointer down for orbit
  const onPointerDown = useCallback((e) => {
    stateRef.current.isInteracting = true;
    stateRef.current.prevPointer = { x: e.clientX, y: e.clientY };
  }, []);

  // Handle pointer move for orbit drag & raycasting hover
  const onPointerMove = useCallback((e) => {
    const s = stateRef.current;
    if (s.isInteracting) {
      const deltaX = e.clientX - s.prevPointer.x;
      const deltaY = e.clientY - s.prevPointer.y;

      s.spherical.theta -= deltaX * 0.005;
      s.spherical.phi = Math.max(0.1, Math.min(Math.PI / 2.1, s.spherical.phi - deltaY * 0.005));

      s.prevPointer = { x: e.clientX, y: e.clientY };

      // Update camera position from spherical coordinates around targetLookAt
      if (s.camera) {
        const x = s.currentLookAt.x + s.spherical.radius * Math.sin(s.spherical.phi) * Math.sin(s.spherical.theta);
        const y = s.currentLookAt.y + s.spherical.radius * Math.cos(s.spherical.phi);
        const z = s.currentLookAt.z + s.spherical.radius * Math.sin(s.spherical.phi) * Math.cos(s.spherical.theta);
        s.targetCamPos.set(x, y, z);
      }
    }

    // Raycast hover check
    if (mountRef.current && s.camera) {
      const rect = mountRef.current.getBoundingClientRect();
      s.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      s.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      s.raycaster.setFromCamera(s.mouse, s.camera);
      const intersects = s.raycaster.intersectObjects(s.clickableObjects, true);
      if (mountRef.current) {
        mountRef.current.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
      }
    }
  }, []);

  const onPointerUp = useCallback(() => {
    stateRef.current.isInteracting = false;
  }, []);

  // Handle Click / Tap selection
  const onClick = useCallback((e) => {
    const s = stateRef.current;
    if (!mountRef.current || !s.camera) return;

    const rect = mountRef.current.getBoundingClientRect();
    s.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    s.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    s.raycaster.setFromCamera(s.mouse, s.camera);
    const intersects = s.raycaster.intersectObjects(s.clickableObjects, true);

    if (intersects.length > 0) {
      let current = intersects[0].object;
      while (current && current.parent) {
        if (current.userData && current.userData.agentId) {
          const hitAgent = agents.find(a => a.id === current.userData.agentId);
          if (hitAgent) {
            onSelectAgent(hitAgent);
            officeAudio.playDing();
            return;
          }
        }
        current = current.parent;
      }
    }
  }, [agents, onSelectAgent]);

  // Handle Zoom (Wheel)
  const onWheel = useCallback((e) => {
    e.preventDefault();
    const s = stateRef.current;
    s.spherical.radius = Math.max(5, Math.min(30, s.spherical.radius + e.deltaY * 0.015));
    if (s.camera) {
      const x = s.currentLookAt.x + s.spherical.radius * Math.sin(s.spherical.phi) * Math.sin(s.spherical.theta);
      const y = s.currentLookAt.y + s.spherical.radius * Math.cos(s.spherical.phi);
      const z = s.currentLookAt.z + s.spherical.radius * Math.sin(s.spherical.phi) * Math.cos(s.spherical.theta);
      s.targetCamPos.set(x, y, z);
    }
  }, []);

  // Sync Camera Presets or Selected Agent Focus
  useEffect(() => {
    const s = stateRef.current;
    if (selectedAgent) {
      // Focus on selected agent's workstation
      s.targetLookAt.set(...selectedAgent.deskPos);
      s.targetLookAt.y += 1.0;
      s.targetCamPos.set(
        selectedAgent.deskPos[0] + (selectedAgent.deskPos[0] > 0 ? -2.8 : 2.8),
        selectedAgent.deskPos[1] + 2.4,
        selectedAgent.deskPos[2] + 2.8
      );
    } else if (currentArea) {
      s.targetCamPos.set(...currentArea.camPos);
      s.targetLookAt.set(...currentArea.target);
    }
  }, [selectedAgent, currentArea]);

  // Sync Day / Night Lighting
  useEffect(() => {
    const s = stateRef.current;
    if (!s.dirLight || !s.ambientLight || !s.scene) return;

    if (isNightMode) {
      s.scene.background = new THREE.Color('#05070d');
      s.ambientLight.color.set('#312e81');
      s.ambientLight.intensity = 0.6;
      s.dirLight.color.set('#60a5fa');
      s.dirLight.intensity = 0.9;
    } else {
      s.scene.background = new THREE.Color('#090d16');
      s.ambientLight.color.set('#94a3b8');
      s.ambientLight.intensity = 1.1;
      s.dirLight.color.set('#f8fafc');
      s.dirLight.intensity = 1.8;
    }
  }, [isNightMode]);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isNightMode ? '#05070d' : '#090d16');
    scene.fog = new THREE.FogExp2('#090d16', 0.025);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(11, 10, 11);
    camera.lookAt(0, 0, 0);

    // 3. Renderer with high performance settings
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(isNightMode ? '#312e81' : '#94a3b8', isNightMode ? 0.6 : 1.1);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(isNightMode ? '#60a5fa' : '#f8fafc', isNightMode ? 0.9 : 1.8);
    dirLight.position.set(8, 14, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 40;
    dirLight.shadow.camera.left = -10;
    dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.top = 10;
    dirLight.shadow.camera.bottom = -10;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Secondary colored rim light
    const rimLight = new THREE.PointLight('#3b82f6', 1.5, 20);
    rimLight.position.set(-6, 4, -6);
    scene.add(rimLight);

    // 5. Office Environment
    const { group: officeEnv, serverLights } = createOfficeEnvironment();
    scene.add(officeEnv);

    // 6. Central Boardroom
    const { group: boardroom, holoCore } = createBoardroom();
    scene.add(boardroom);

    // 7. Workstations & Characters for each agent
    const agentsMap = new Map();
    const screensMap = new Map();
    const clickableObjects = [];

    agents.forEach((agent) => {
      // Dynamic Screen Texture
      const screenType = agent.id === 'devops' ? 'radar' : (agent.id === 'dev' ? 'code' : 'research');
      const screenData = createDynamicScreenTexture(agent.name, agent.color, screenType);
      screensMap.set(agent.id, screenData);

      // Workstation Desk & Chair
      const deskGroup = createWorkstation(agent, screenData);
      deskGroup.userData = { agentId: agent.id };
      scene.add(deskGroup);

      // Stylized Avatar Character
      const avatarData = createStylizedAvatar(agent);
      avatarData.group.position.set(...agent.deskPos);
      avatarData.group.position.z += 0.45; // Sits in chair facing desk
      avatarData.group.userData = { agentId: agent.id };
      scene.add(avatarData.group);

      agentsMap.set(agent.id, {
        ...avatarData,
        deskPos: new THREE.Vector3(agent.deskPos[0], agent.deskPos[1], agent.deskPos[2] + 0.45),
        meetingPos: new THREE.Vector3(...agent.meetingPos),
        currentPos: new THREE.Vector3(agent.deskPos[0], agent.deskPos[1], agent.deskPos[2] + 0.45),
        agent
      });

      // Register for click / raycasting
      clickableObjects.push(avatarData.group, deskGroup);
    });

    const s = stateRef.current;
    s.scene = scene;
    s.camera = camera;
    s.renderer = renderer;
    s.agentsMap = agentsMap;
    s.screensMap = screensMap;
    s.holoCore = holoCore;
    s.serverLights = serverLights;
    s.dirLight = dirLight;
    s.ambientLight = ambientLight;
    s.clickableObjects = clickableObjects;

    // 8. Animation & Render Loop
    let lastTime = performance.now();
    let typingSoundCounter = 0;

    const animate = () => {
      s.animFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = (now - lastTime) * 0.001 * simulationSpeed;
      lastTime = now;
      s.time += delta;

      // 1. Smooth Camera Damping (Cinematic Lerp)
      camera.position.lerp(s.targetCamPos, 0.05);
      s.currentLookAt.lerp(s.targetLookAt, 0.05);
      camera.lookAt(s.currentLookAt);

      // 2. Rotate Center Hologram Core
      if (holoCore) {
        holoCore.rotation.y += delta * (isAllHands ? 2.5 : 0.8);
        holoCore.rotation.x += delta * 0.4;
      }

      // 3. Blink Server Lights
      if (serverLights && Math.floor(s.time * 4) % 2 === 0) {
        serverLights.children.forEach((led, i) => {
          led.visible = (Math.sin(s.time * 6 + i) > -0.2);
        });
      }

      // 4. Update Dynamic Screens periodically
      if (Math.floor(s.time * 8) !== Math.floor((s.time - delta) * 8)) {
        screensMap.forEach((screen) => screen.redraw(s.time));
      }

      // 5. Sound trigger for typing during normal simulation
      typingSoundCounter += delta;
      if (typingSoundCounter > 0.4 && !isAllHands) {
        typingSoundCounter = 0;
        if (Math.random() > 0.4) {
          officeAudio.playTyping();
        }
      }

      // 6. Character Procedural Animations
      agentsMap.forEach((avatar) => {
        // Target destination based on whether All-Hands Meeting is active
        const dest = isAllHands ? avatar.meetingPos : avatar.deskPos;

        // Smooth walk/glide transition to target position
        avatar.currentPos.lerp(dest, 0.04);
        avatar.group.position.copy(avatar.currentPos);

        // Character breathing / idle bob
        const bob = Math.sin(s.time * 3 + avatar.agent.deskPos[0]) * 0.03;
        avatar.headMesh.position.y = 1.08 + bob * 0.5;

        // Floating Status Gem rotation & bobbing
        avatar.gemMesh.rotation.y += delta * 2;
        avatar.gemMesh.position.y = 1.65 + Math.sin(s.time * 4 + avatar.agent.deskPos[2]) * 0.06;

        if (isAllHands) {
          // Meeting gestures: look towards table center (0, 1, 0)
          avatar.group.lookAt(0, avatar.group.position.y, 0);

          // Alternating discussion gestures
          const armGesture = Math.sin(s.time * 4 + avatar.agent.deskPos[0]);
          avatar.leftArmGroup.rotation.x = Math.PI / 4 + armGesture * 0.25;
          avatar.rightArmGroup.rotation.x = Math.PI / 4 - armGesture * 0.25;
        } else {
          // At desk: face the monitor (-z direction relative to desk)
          avatar.group.rotation.y = 0;

          // Frantic typing oscillations on left & right arms
          const typeSpeed = s.time * 16 * simulationSpeed;
          avatar.leftArmGroup.rotation.x = Math.PI / 4 + Math.sin(typeSpeed) * 0.12;
          avatar.rightArmGroup.rotation.x = Math.PI / 4 + Math.cos(typeSpeed + 0.5) * 0.12;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Listener
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
      cancelAnimationFrame(s.animFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [agents, isNightMode, isAllHands, simulationSpeed]);

  return (
    <div
      ref={mountRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={onClick}
      onWheel={onWheel}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        touchAction: 'none',
        userSelect: 'none'
      }}
    />
  );
}
