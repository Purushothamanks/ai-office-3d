/**
 * 2D Architectural Office Layout & Autonomous Waypoint Destinations
 * Coordinates normalized to a 1000 x 650 canvas grid
 */

export const OFFICE_ZONES = {
  floor: { width: 1000, height: 650 },

  // Rooms & Partitions
  boardroom: { x: 320, y: 210, w: 380, h: 230, name: 'Executive Glass Boardroom' },
  breakroom: { x: 25, y: 25, w: 255, h: 185, name: 'Espresso Bistro & Lounge' },
  serverRoom: { x: 735, y: 435, w: 245, h: 195, name: 'GPU Server Cluster' },
  whiteboardArea: { x: 320, y: 25, w: 380, h: 145, name: 'Architecture Whiteboard' },

  // Special Destination Waypoints
  waypoints: {
    coffeeMachine: { x: 90, y: 75, name: 'Brewing Espresso' },
    waterCooler: { x: 170, y: 75, name: 'Pouring Water' },
    loungeCouch: { x: 135, y: 155, name: 'Lounge Couch Break' },
    whiteboardLeft: { x: 410, y: 95, name: 'Sketching System Architecture' },
    whiteboardRight: { x: 570, y: 95, name: 'Writing Invariant Proofs' },
    serverRackA: { x: 805, y: 515, name: 'Checking GPU Telemetry' },
    serverRackB: { x: 895, y: 515, name: 'Inspecting TLS Certificates' },
    boardroomSeats: [
      { x: 395, y: 285, name: 'Boardroom Seat 1' },
      { x: 460, y: 265, name: 'Boardroom Seat 2' },
      { x: 540, y: 265, name: 'Boardroom Seat 3' },
      { x: 605, y: 285, name: 'Boardroom Seat 4' },
      { x: 430, y: 385, name: 'Boardroom Seat 5' },
      { x: 510, y: 395, name: 'Boardroom Seat 6' },
      { x: 580, y: 385, name: 'Boardroom Seat 7' }
    ]
  }
};

// Fixed Workstation Desks for each of the 7 AI Agents
export const AGENT_DESKS = {
  gemini: { x: 130, y: 290, faceAngle: 0, label: 'Gemini Bay' },
  claude: { x: 130, y: 420, faceAngle: 0, label: 'Claude Studio' },
  deepseek: { x: 130, y: 550, faceAngle: 0, label: 'DeepSeek Lab' },
  ollama: { x: 870, y: 110, faceAngle: Math.PI, label: 'Ollama Station' },
  vision: { x: 870, y: 230, faceAngle: Math.PI, label: 'Vision Suite' },
  diffusion: { x: 870, y: 350, faceAngle: Math.PI, label: 'Diffusion Desk' },
  sentinel: { x: 510, y: 550, faceAngle: -Math.PI / 2, label: 'Sentinel Command' }
};
