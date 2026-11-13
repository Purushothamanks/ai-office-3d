/**
 * Real AI Systems Active on this Machine
 * 1. Google Gemini 3.8 / Antigravity Omni (Autonomous CLI & Code Executor)
 * 2. Anthropic Claude 3.7 Sonnet (Architecture & Deep Reasoning)
 * 3. DeepSeek-R1 (High-Compute Chain-of-Thought & Math Prover)
 * 4. Ollama Local LLM Fleet (On-Device GPU/CPU Neural Inference)
 * 5. Computer Vision Agent (Autonomous Visual Perception & Screen OCR)
 * 6. Pollinations / Generative Diffusion (3D Shaders & Generative Art)
 * 7. Sentinel Cyber-Defense Guard (E2EE Vault, TLS & Cluster Security)
 */

export const INITIAL_AGENTS = [
  {
    id: 'gemini',
    name: 'Gemini 3.8 Omni',
    handle: '@gemini.omni',
    title: 'Autonomous Multimodal Orchestrator',
    systemName: 'Google Gemini / Antigravity CLI',
    department: 'Autonomous Systems Bay',
    color: '#06b6d4', // Electric Cyan
    hairColor: '#0f172a',
    clothesColor: '#0891b2',
    deskPos: [-5.0, 0, -3.8],
    meetingPos: [-1.4, 0, -0.9],
    currentStatus: 'Executing multi-step tool workflows & code AST verification',
    activityType: 'coding',
    progress: 72,
    stats: { toolsExecuted: '2.4k', contextWindow: '2.0M tok', reasoningScore: '98.9%' },
    currentFile: 'antigravity/orchestrator.ts',
    thoughts: [
      'Deconstructing user goals into axiomatic subtasks with defensive retry bounds.',
      'Executing sandbox commands; zero-delay verification active.',
      'Synthesizing codebase diffs with zero layout shift.',
      'Evaluating multimodal visual input from browser canvas stream.'
    ],
    codeSnippets: [
      `// Gemini Antigravity Agentic Execution Loop\nexport async function runAutonomousStep(intent: AgentGoal) {\n  const plan = await planner.synthesize(intent);\n  for (const step of plan.steps) {\n    const proof = await toolRunner.executeSandboxed(step);\n    if (!proof.verified) throw new InvariantError(step);\n  }\n  return { status: 'SUCCESS', verified: true };\n}`,
      `const multimodalEmbeddings = await gemini.embed({\n  modalities: ['text', 'code', 'image_ast'],\n  dimensions: 1536,\n  precision: 'fp16'\n});`
    ]
  },
  {
    id: 'claude',
    name: 'Claude 3.7 Sonnet',
    handle: '@claude.arch',
    title: 'Principal Software Architect',
    systemName: 'Anthropic Claude Engine',
    department: 'Core Architecture',
    color: '#f97316', // Terra-cotta Amber
    hairColor: '#1e293b',
    clothesColor: '#c2410c',
    deskPos: [-5.0, 0, 1.2],
    meetingPos: [-1.4, 0, 0.9],
    currentStatus: 'Refactoring modular microservices & eliminating technical debt',
    activityType: 'coding',
    progress: 88,
    stats: { classesRefactored: 890, cyclomaticComplexity: '1.2 (Low)', defensiveScore: '100%' },
    currentFile: 'architecture/stateMachine.ts',
    thoughts: [
      'Enforcing strict single-responsibility boundaries across all modules.',
      'Wrapping external asynchronous promises in defensive try/catch blocks.',
      'Eliminating memory leaks by ensuring all event listeners bind to AbortController signals.',
      'Writing mathematical invariant proofs for state transitions.'
    ],
    codeSnippets: [
      `// High-resilience defensive state machine\nexport class ResilientStateMachine<TState, TEvent> {\n  private state: Readonly<TState>;\n  constructor(initial: TState) {\n    this.state = Object.freeze({ ...initial });\n  }\n  public transition(event: TEvent): Readonly<TState> {\n    const next = this.reducer(this.state, event);\n    return (this.state = Object.freeze(next));\n  }\n}`
    ]
  },
  {
    id: 'deepseek',
    name: 'DeepSeek-R1',
    handle: '@deepseek.r1',
    title: 'Chain-of-Thought & Math Prover',
    systemName: 'DeepSeek-R1 Distilled Model',
    department: 'Cognitive Reasoning Lab',
    color: '#2563eb', // Royal Blue
    hairColor: '#0284c7',
    clothesColor: '#1d4ed8',
    deskPos: [-5.0, 0, 5.8],
    meetingPos: [-0.7, 0, 1.4],
    currentStatus: 'Evaluating first-principles algorithmic theorems & proof trees',
    activityType: 'researching',
    progress: 54,
    stats: { proofsVerified: '14.2k', mathAIME: '93.8%', tokenThroughput: '185 tok/s' },
    currentFile: 'reasoning/formal_proofs.lean',
    thoughts: [
      'Thinking Process: Decompose lemma 4 into recursive induction steps.',
      'Checking edge-case boundary conditions when n approaches infinity.',
      'Falsifying hypothesis 2: counter-example discovered at modulo 7.',
      'Synthesizing final verified proof with zero logical fallacies.'
    ],
    codeSnippets: [
      `<think>\n1. Problem requires proving that for all prime p > 3, p^2 = 1 (mod 24).\n2. Write p = 6k +- 1.\n3. p^2 = 36k^2 +- 12k + 1 = 12k(3k +- 1) + 1.\n4. Notice k(3k +- 1) is always even, thus 24 divides 12 * 2 = 24. Proved.\n</think>\nTheorem verified with 100% formal confidence.`,
      `// Symbolic Graph Simplifier\nfunction reduceExpression(node: ASTNode): ASTNode {\n  if (node.isIdentity()) return node.operand;\n  return foldConstants(node);\n}`
    ]
  },
  {
    id: 'ollama',
    name: 'Ollama Fleet Core',
    handle: '@ollama.local',
    title: 'On-Device Neural Engine',
    systemName: 'Ollama Engine (Local GPU/CPU)',
    department: 'Private Neural Cluster',
    color: '#e2e8f0', // Ice Platinum
    hairColor: '#334155',
    clothesColor: '#475569',
    deskPos: [5.0, 0, -3.8],
    meetingPos: [1.4, 0, -0.9],
    currentStatus: 'Quantizing INT4 tensors & accelerating local GPU KV-cache',
    activityType: 'coding',
    progress: 63,
    stats: { localModels: '12 Loaded', vramUsage: '14.2 GB', latencyLocal: '4.2 ms' },
    currentFile: 'models/llama3_q4_k_m.gguf',
    thoughts: [
      'Binding model weights directly to unified GPU shared memory.',
      'Zero external network dependencies: running 100% private and air-gapped.',
      'Profiling flash attention kernel performance on local compute cores.',
      'Serving OpenAI-compatible endpoints on http://localhost:11434 with zero lag.'
    ],
    codeSnippets: [
      `// Local Ollama Inference Request (Air-Gapped)\nconst response = await fetch('http://localhost:11434/api/generate', {\n  method: 'POST',\n  body: JSON.stringify({\n    model: 'deepseek-r1:latest',\n    prompt: 'Synthesize optimal cache layout',\n    stream: true,\n    options: { num_gpu: 33, temperature: 0.1 }\n  })\n});`,
      `# Local Model Quantization Manifest\nFROM ./q4_k_m.gguf\nPARAMETER temperature 0.2\nPARAMETER top_k 40\nSYSTEM "You are a local autonomous high-speed engineer."`
    ]
  },
  {
    id: 'vision',
    name: 'Vision Sentinel',
    handle: '@vision.ai',
    title: 'Autonomous Visual Perception',
    systemName: 'Vision Assistant (~/vision)',
    department: 'Computer Vision Lab',
    color: '#10b981', // Emerald Mint
    hairColor: '#065f46',
    clothesColor: '#047857',
    deskPos: [5.0, 0, 1.2],
    meetingPos: [1.4, 0, 0.9],
    currentStatus: 'Processing 4K visual frames & OCR bounding box extraction',
    activityType: 'researching',
    progress: 81,
    stats: { fpsDetection: '120 FPS', ocrAccuracy: '99.9%', latency: '8.4 ms' },
    currentFile: 'vision/vision_assistant.py',
    thoughts: [
      'Segmenting UI components in browser DOM viewport screenshot.',
      'Extracting text characters with spatial bounding box coordinates.',
      'Detecting color palette compliance: 60-30-10 ratio matched perfectly.',
      'Flagging zero visual clipping on mobile 320px viewport emulation.'
    ],
    codeSnippets: [
      `# Autonomous Vision Assistant Feature Pipeline\nimport cv2\nimport numpy as np\n\ndef extract_ui_elements(frame):\n    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)\n    edges = cv2.Canny(gray, threshold1=50, threshold2=150)\n    contours, _ = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)\n    return [cv2.boundingRect(c) for c in contours if cv2.contourArea(c) > 100]`,
      `ocr_results = vision_model.detect_text(image_tensor, confidence_threshold=0.95)`
    ]
  },
  {
    id: 'diffusion',
    name: 'Canvas Diffusion AI',
    handle: '@canvas.art',
    title: 'Generative 3D & UI Stylist',
    systemName: 'Pollinations / WebGL Shader Studio',
    department: 'Generative Studio',
    color: '#ec4899', // Radiant Pink / Magenta
    hairColor: '#db2777',
    clothesColor: '#be185d',
    deskPos: [5.0, 0, 5.8],
    meetingPos: [0.7, 0, 1.4],
    currentStatus: 'Generating PBR frosted glass shaders & generative UI textures',
    activityType: 'designing',
    progress: 92,
    stats: { shadersCompiled: 412, contrastRatio: '7.8:1 AAA', visualFidelity: '4K Ultra' },
    currentFile: 'shaders/proceduralHolo.frag',
    thoughts: [
      'Applying Fresnel transmission equations to central boardroom table.',
      'Generating high-definition procedural icons with zero layout shift.',
      'Harmonizing ambient light color temperatures for Day/Night cyber transition.',
      'Rendering smooth bloom glow on 3D agent status gems.'
    ],
    codeSnippets: [
      `// High-Performance PBR Glass Fragment Shader\nprecision highp float;\nuniform vec3 uBaseColor;\nuniform float uRoughness;\nvarying vec3 vNormal;\n\nvoid main() {\n  float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.5);\n  vec3 color = mix(uBaseColor, vec3(1.0), fresnel * 0.6);\n  gl_FragColor = vec4(color, 0.75);\n}`,
      `/* Generative SVG Aesthetic Palette */\n--ds-glow: 0 0 24px rgba(236, 72, 153, 0.55);\n--ds-border-active: 1px solid rgba(236, 72, 153, 0.8);`
    ]
  },
  {
    id: 'sentinel',
    name: 'Sentinel Fleet Ops',
    handle: '@sentinel.ops',
    title: 'Cyber-Defense & Fleet Guard',
    systemName: 'Firebase Fleet Cloud Guard & E2EE Vault',
    department: 'Command Center & Security',
    color: '#eab308', // Golden Amber
    hairColor: '#854d0e',
    clothesColor: '#a16207',
    deskPos: [0, 0, -6.5],
    meetingPos: [0, 0, -1.5],
    currentStatus: 'Guarding cloud fleet endpoints & rotating TLS cryptographic keys',
    activityType: 'monitoring',
    progress: 96,
    stats: { fleetSites: '8 Live Apps', threatsNeutralized: 2419, uptime: '100.0%' },
    currentFile: 'security/fleet_guard.js',
    thoughts: [
      'Zero-delay MutationObserver guarding client-side DOM integrity.',
      'Checking health of all 8 live Firebase fleet websites (all 200 OK).',
      'Rotating ephemeral E2EE symmetric keys using AES-GCM 256-bit.',
      'Auto-healing any tampered nodes within 12 milliseconds.'
    ],
    codeSnippets: [
      `// Firebase Fleet Cloud Guard Realtime Sentinel\n(function initSentinelGuard() {\n  const observer = new MutationObserver((mutations) => {\n    for (const m of mutations) {\n      if (isUnauthorizedTamper(m)) {\n        revertDOMStateInstantaneously(m);\n        dispatchSecurityTelemetry('TAMPER_NEUTRALIZED');\n      }\n    }\n  });\n  observer.observe(document.body, { childList: true, subtree: true });\n})();`,
      `# TLS 1.3 Strict Security Transport Protocol\nStrict-Transport-Security: max-age=31536000; includeSubDomains; preload\nX-Frame-Options: SAMEORIGIN\nX-Content-Type-Options: nosniff`
    ]
  }
];

export const OFFICE_AREAS = [
  { id: 'overview', name: '🏢 Entire Studio (Isometric)', camPos: [13, 11, 13], target: [0, 0, 0] },
  { id: 'gemini-bay', name: '⚡ Gemini 3.8 Omni', camPos: [-5.0, 3.2, -1.2], target: [-5.0, 1, -3.8] },
  { id: 'claude-bay', name: '🏛️ Claude Architecture', camPos: [-5.0, 3.2, 3.8], target: [-5.0, 1, 1.2] },
  { id: 'deepseek-lab', name: '🧠 DeepSeek-R1 Lab', camPos: [-5.0, 3.2, 8.4], target: [-5.0, 1, 5.8] },
  { id: 'ollama-cluster', name: '🖥️ Ollama Local GPU', camPos: [5.0, 3.2, -1.2], target: [5.0, 1, -3.8] },
  { id: 'vision-lab', name: '👁️ Vision Sentinel', camPos: [5.0, 3.2, 3.8], target: [5.0, 1, 1.2] },
  { id: 'diffusion-studio', name: '🎨 Canvas Diffusion', camPos: [5.0, 3.2, 8.4], target: [5.0, 1, 5.8] },
  { id: 'sentinel-ops', name: '🛡️ Sentinel Cyber Ops', camPos: [0, 3.4, -3.5], target: [0, 1, -6.5] },
  { id: 'boardroom', name: '🤝 Central Boardroom', camPos: [0, 5.2, 5.2], target: [0, 0.8, 0] }
];
