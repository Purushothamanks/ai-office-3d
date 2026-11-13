/**
 * Comprehensive Agent Profiles, Live Task Cycles, and Stream Generators
 */

export const INITIAL_AGENTS = [
  {
    id: 'dev',
    name: 'Nova Rivera',
    handle: '@nova.code',
    title: 'Lead Full-Stack AI Engineer',
    department: 'Engineering Bay',
    color: '#3b82f6', // Electric Blue
    hairColor: '#1e293b',
    clothesColor: '#2563eb',
    deskPos: [-3.5, 0, -2.5],
    meetingPos: [-1.2, 0, -0.6],
    currentStatus: 'Compiling neural tokenizer',
    activityType: 'coding',
    progress: 68,
    stats: { tasksDone: 142, linesOfCode: '18.4k', accuracy: '99.8%' },
    currentFile: 'src/engine/quantumTokenizer.ts',
    thoughts: [
      'Refactoring async token streaming pipeline for <10ms first-token latency...',
      'Memory footprint reduced by 34% using WebAssembly SIMD kernels.',
      'Unit tests passing: 84/84 test suites green.',
      'Injecting defensive retry boundaries with exponential backoff.'
    ],
    codeSnippets: [
      `// High-performance token streamer\nexport async function* streamTokens(prompt: string) {\n  const pipeline = new QuantumTransformer({ quant: 'int8' });\n  yield* pipeline.generateAsync(prompt, { maxTokens: 2048 });\n}`,
      `const tensorBuffer = new Float32Array(embeddingSize);\nfor (let i = 0; i < weights.length; i++) {\n  tensorBuffer[i] = Math.tanh(weights[i] * 1.414);\n}`,
      `// Zero-copy SIMD matrix multiply\nexport function matmulSIMD(a: Matrix, b: Matrix): Matrix {\n  return WasmEngine.dotProductVectorized(a.ptr, b.ptr);\n}`
    ]
  },
  {
    id: 'design',
    name: 'Pixel Maya',
    handle: '@pixel.art',
    title: '3D & Generative UI Designer',
    department: 'Creative Studio',
    color: '#ec4899', // Radiant Pink / Magenta
    hairColor: '#f43f5e',
    clothesColor: '#be185d',
    deskPos: [-3.5, 0, 2.5],
    meetingPos: [-0.6, 0, 0.8],
    currentStatus: 'Rendering glassmorphic 3D shaders',
    activityType: 'designing',
    progress: 84,
    stats: { designsRendered: 310, paletteHarmony: '100% AAA', fpsTarget: '60 FPS' },
    currentFile: 'shaders/frostedGlass.glsl',
    thoughts: [
      'Fine-tuning roughness parameters on the glass boardroom partition.',
      'Ensuring 7:1 contrast ratio for all HUD text elements against 3D shadows.',
      'Adding subtle chromatic aberration around the neon holographic displays.',
      'Exporting responsive SVGs with clean geometric curves.'
    ],
    codeSnippets: [
      `// Frosted glass PBR fragment shader\nvoid main() {\n  vec3 normal = normalize(vNormal);\n  float fresnel = pow(1.0 - dot(normal, viewDir), 3.0);\n  gl_FragColor = vec4(mix(baseColor, glowColor, fresnel), 0.85);\n}`,
      `/* Responsive Spatial Variables */\n:root {\n  --blur-glass: 16px;\n  --neon-glow: 0 0 24px rgba(236, 72, 153, 0.45);\n  --spring-damping: cubic-bezier(0.16, 1, 0.3, 1);\n}`
    ]
  },
  {
    id: 'research',
    name: 'Dr. Atlas Vance',
    handle: '@atlas.phd',
    title: 'Deep Research & Cognitive Lead',
    department: 'Research Lab',
    color: '#10b981', // Emerald Mint
    hairColor: '#64748b',
    clothesColor: '#059669',
    deskPos: [3.5, 0, -2.5],
    meetingPos: [0.6, 0, -0.6],
    currentStatus: 'Synthesizing arXiv multimodal papers',
    activityType: 'researching',
    progress: 42,
    stats: { papersIngested: 894, citations: '12.6k', hallucinationRate: '0.01%' },
    currentFile: 'research/latentSpaceSurvey2026.pdf',
    thoughts: [
      'Evaluating cross-attention maps for sparse mixture-of-experts routing.',
      'Cross-referencing 42 academic benchmarks for reasoning consistency.',
      'Drafting summary on self-correcting cognitive loops for autonomous agents.',
      'Verifying theorem proofs on bounded recursive search trees.'
    ],
    codeSnippets: [
      `[Literature Synthesis - Section 4.2]\nObservation: Latent reasoning steps with test-time compute\nyield +18.4% improvement on mathematical induction benchmarks.\nConfidence: 99.4% (p < 0.001 across n=10,000 trials).`,
      `// Sparse MoE Routing Gate\nfunction routeTokensToExperts(tokens, gateWeights) {\n  const topK = selectTopKExperts(gateWeights, k=2);\n  return normalizeSoftmax(topK);\n}`
    ]
  },
  {
    id: 'devops',
    name: 'Cipher-9',
    handle: '@cipher.ops',
    title: 'Autonomous DevOps & Sentinel',
    department: 'Security Operations',
    color: '#f59e0b', // Amber / Gold
    hairColor: '#0284c7',
    clothesColor: '#d97706',
    deskPos: [3.5, 0, 2.5],
    meetingPos: [1.2, 0, 0.8],
    currentStatus: 'Scanning cluster telemetry & TLS integrity',
    activityType: 'monitoring',
    progress: 95,
    stats: { uptime: '99.999%', threatsBlocked: 1042, clusterNodes: '48 Healthy' },
    currentFile: 'infrastructure/kubernetes-fleet.yaml',
    thoughts: [
      'Zero anomalous latency spikes detected in edge clusters.',
      'Auto-healing container instance 4 on US-East region in 220ms.',
      'Rotating end-to-end cryptographic ephemeral keys.',
      'Firewall rules tightened: all ports guarded with mTLS handshake.'
    ],
    codeSnippets: [
      `CLUSTER TELEMETRY STREAM [OK]\nNode 01: CPU 18% | MEM 4.2GB | Ping 1.8ms [GREEN]\nNode 02: CPU 22% | MEM 5.1GB | Ping 2.1ms [GREEN]\nNode 03: CPU 16% | MEM 3.9GB | Ping 1.7ms [GREEN]\nThreat Vector Scan: 0 vulnerabilities found.`,
      `# Auto-scaling policy\nspec:\n  minReplicas: 8\n  maxReplicas: 128\n  metrics:\n  - type: Resource\n    resource:\n      name: cpu\n      targetAverageUtilization: 70`
    ]
  },
  {
    id: 'pm',
    name: 'Aria Chen',
    handle: '@aria.lead',
    title: 'Product Orchestrator & PM',
    department: 'Command Center',
    color: '#8b5cf6', // Violet Purple
    hairColor: '#0f172a',
    clothesColor: '#7c3aed',
    deskPos: [0, 0, -4.2],
    meetingPos: [0, 0, 0.9],
    currentStatus: 'Synchronizing multi-agent roadmap sprint',
    activityType: 'orchestrating',
    progress: 77,
    stats: { sprintVelocity: '98 pts', roadmapProgress: '82%', teamMorale: '100%' },
    currentFile: 'roadmap/Q4_Milestones.json',
    thoughts: [
      'All agent velocity metrics on track for Diwali 2026 deployment.',
      'Assigning high-priority shader optimization task to Pixel Maya.',
      'Coordinating latency benchmarks between Nova and Cipher-9.',
      'Scheduling All-Hands Conference review in 3 minutes.'
    ],
    codeSnippets: [
      `{\n  "sprint": "Titan-Release-v2.0",\n  "status": "AHEAD_OF_SCHEDULE",\n  "agents_active": 5,\n  "blockers": 0,\n  "target_launch": "Diwali 2026"\n}`,
      `[All-Hands Agenda]\n1. Token streaming sub-10ms validation (Nova)\n2. PBR 3D frosted glass shaders (Pixel)\n3. Benchmark proofs (Atlas)\n4. Edge failover simulation (Cipher)`
    ]
  }
];

export const OFFICE_AREAS = [
  { id: 'overview', name: '🏢 Entire Studio (Isometric)', camPos: [11, 10, 11], target: [0, 0, 0] },
  { id: 'dev-bay', name: '💻 Engineering Bay', camPos: [-3.5, 3.2, 0.5], target: [-3.5, 1, -2.5] },
  { id: 'design-studio', name: '🎨 Creative Studio', camPos: [-3.5, 3.2, 5.5], target: [-3.5, 1, 2.5] },
  { id: 'research-lab', name: '🔬 Research Lab', camPos: [3.5, 3.2, 0.5], target: [3.5, 1, -2.5] },
  { id: 'devops-sentinel', name: '⚡ Security Ops', camPos: [3.5, 3.2, 5.5], target: [3.5, 1, 2.5] },
  { id: 'boardroom', name: '🤝 Central Boardroom', camPos: [0, 4.5, 4.5], target: [0, 0.8, 0] },
  { id: 'top-down', name: '📐 Architectural Floorplan', camPos: [0, 16, 0.01], target: [0, 0, 0] }
];
