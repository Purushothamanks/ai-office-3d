/**
 * 2D Architectural Office Layout & Autonomous Waypoint Destinations
 * Coordinates normalized to a 1000 x 650 canvas grid
 */

export const OFFICE_ZONES = {
  floor: { width: 1000, height: 650 },

  // Rooms & Partitions
  boardroom: { x: 340, y: 220, w: 320, h: 210, name: 'Central Boardroom' },
  breakroom: { x: 30, y: 30, w: 220, h: 180, name: 'Espresso Lounge' },
  serverRoom: { x: 750, y: 440, w: 220, h: 180, name: 'Server Cluster' },
  whiteboardArea: { x: 380, y: 30, w: 240, h: 100, name: 'Strategy Whiteboard' },

  // Special Destination Waypoints
  waypoints: {
    coffeeMachine: { x: 90, y: 80, name: 'Brewing Espresso' },
    waterCooler: { x: 190, y: 80, name: 'Water Cooler' },
    loungeCouch: { x: 120, y: 160, name: 'Lounge Break' },
    whiteboardLeft: { x: 420, y: 90, name: 'Sketching System Architecture' },
    whiteboardRight: { x: 540, y: 90, name: 'Writing Invariant Proofs' },
    serverRackA: { x: 810, y: 500, name: 'Checking GPU Telemetry' },
    serverRackB: { x: 890, y: 500, name: 'Inspecting TLS Certificates' },
    boardroomSeats: [
      { x: 400, y: 280, name: 'Boardroom Seat 1' },
      { x: 460, y: 260, name: 'Boardroom Seat 2' },
      { x: 540, y: 260, name: 'Boardroom Seat 3' },
      { x: 600, y: 280, name: 'Boardroom Seat 4' },
      { x: 440, y: 370, name: 'Boardroom Seat 5' },
      { x: 500, y: 370, name: 'Boardroom Seat 6' },
      { x: 560, y: 370, name: 'Boardroom Seat 7' }
    ]
  }
};

// Fixed Workstation Desks for each of the 7 AI Agents
export const AGENT_DESKS = {
  gemini: { x: 140, y: 320, faceAngle: 0, label: 'Gemini Desk' },
  claude: { x: 140, y: 460, faceAngle: 0, label: 'Claude Desk' },
  deepseek: { x: 140, y: 580, faceAngle: 0, label: 'DeepSeek Desk' },
  ollama: { x: 860, y: 120, faceAngle: Math.PI, label: 'Ollama Desk' },
  vision: { x: 860, y: 240, faceAngle: Math.PI, label: 'Vision Desk' },
  diffusion: { x: 860, y: 360, faceAngle: Math.PI, label: 'Diffusion Desk' },
  sentinel: { x: 500, y: 580, faceAngle: -Math.PI / 2, label: 'Sentinel Desk' }
};
