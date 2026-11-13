# 🏢 AI Office 3D & 2D — Realtime Autonomous AI Studio

> An immersive, stylized virtual workplace powered by **Three.js**, **2D Pixel-Art Spritesheets**, **React 19**, and **WebGL**, simulating a team of 7 real autonomous AI agents collaborating, writing code, proving theorems, and roaming around the office in real time.

---

## 🌟 Key Features

### 1. 🚶 Small Cartoon Walking Characters (2D Top View)
* **Inspired by `a16z-infra/ai-town` & `joonspk-research/generative_agents`:**
  * Uses the classic 32x32 pixel-art folk spritesheet (`32x32folk.png`).
  * **4-Directional Walk Cycles:** Down, Left, Right, and Up walking frame animations that automatically orient to movement vectors.
  * **Autonomous Daily Routines:** Characters autonomously get up from their desks, brew espresso in the lounge, sketch on the architecture whiteboard, inspect the GPU server cluster, and stroll through the central boardroom.
  * **Walking Dust Particles & Steam:** Puffs of dust when walking, steam curling from the espresso machine, and flickering LEDs on server racks.
  * **RTS-Style Dispatch:** Click any AI agent, then click anywhere on the floor to command them to walk there!
  * **Fail-Safe Procedural Chibi Fallback:** Instant vector chibi rendering fallback guarantees zero flicker or blank frames.

### 2. 🤖 7 Real AI Systems Active on User's Machine
1. **⚡ Google Gemini 3.8 Omni:** Autonomous CLI workflows & AST verification (`~/.gemini/antigravity-cli`).
2. **🏛️ Claude 3.7 Sonnet:** Principal software architecture & defensive invariant checks (`~/.claude`).
3. **🧠 DeepSeek-R1 CoT:** High-compute formal reasoning & math proof trees.
4. **🖥️ Ollama Fleet Core:** On-device GPU/CPU air-gapped neural inference (`/usr/local/bin/ollama`).
5. **👁️ Vision Sentinel:** Autonomous computer vision & 4K OCR detection (`~/vision`).
6. **🎨 Canvas Diffusion:** WebGL shader studio & generative UI design.
7. **🛡️ Sentinel Cloud Ops:** Firebase fleet security, TLS key rotation & DOM tamper protection.

### 3. 🏢 Architectural 3D Walk-In Office Room
* **First-Person WASD Walk Mode:** Smooth first-person navigation with mouse look, footstep audio, and panoramic city skyline.
* **Proximity Interaction `[E]`:** Walk up to any AI desk to open their streaming telemetry workstation.
* **Central Boardroom "All-Hands Sprint":** Call an office-wide conference with one click.

### 4. 🎛️ Zero-Dependency Web Audio Soundscape
* Procedurally synthesized mechanical typing clicks, footsteps, elevator dings, and conference chimes via native Web Audio API.

---

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Development Server
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 3. Production Build
```bash
npm run build
```

---

## 🛠️ Architecture & Tech Stack

* **2D Engine:** High-DPI HTML5 Canvas + 32x32 Pixel-Art Spritesheets (`a16z-infra/ai-town`).
* **3D Engine:** Three.js (Procedural geometries, PBR frosted glass shaders, dynamic canvas textures, directional shadows).
* **UI & HUD Framework:** React 19 + Lucide Icons + Canvas-Confetti.
* **Audio Synthesis:** Native Web Audio API (zero audio file assets required).
* **Styling:** Custom 60-30-10 Design System with glassmorphic backdrop filters and WCAG AAA compliance.
* **Bundler:** Vite 8.

---

## 📜 License
MIT License.
