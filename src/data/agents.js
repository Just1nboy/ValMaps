// Central agent roster for ValMaps.
// Ability slots follow the in-game keybinds: C (Grenade), Q (Ability1), E (Ability2), X (Ultimate).
// Each ability has a `type` that controls how its marker is drawn on the canvas.

export const ROLE_ORDER = ['Duelist', 'Initiator', 'Controller', 'Sentinel'];

// Visual style for each ability type. `color: null` means "use the agent's color".
export const ABILITY_TYPES = {
  smoke: { label: 'Smoke', color: null, radius: 30 },
  wall: { label: 'Wall', color: null, width: 110, height: 10 },
  molly: { label: 'Molly', color: '#ff6b35', radius: 22 },
  flash: { label: 'Flash', color: '#ffe25c', radius: 12 },
  stun: { label: 'Stun/Slow', color: '#8f6fff', radius: 24 },
  recon: { label: 'Recon', color: '#35c4ff', radius: 16 },
  trap: { label: 'Trap', color: '#ffb02e', radius: 11 },
  heal: { label: 'Heal', color: '#4cd964', radius: 13 },
  move: { label: 'Movement', color: '#c9d1d9', radius: 12 },
  ult: { label: 'Ultimate', color: '#ffd700', radius: 22 },
  other: { label: 'Utility', color: '#b0bec5', radius: 14 },
};

// How each ability type is placed and drawn so its map footprint matches the
// real thing in Valorant (à la Valoplant).
//   placement 'point' -> single click drops the footprint at that spot.
//   placement 'line'  -> click-drag from an origin to an endpoint (walls,
//                        Cypher tripwires, Breach Fault Line).
// All sizes are in METERS and get scaled to the current map (see maps.js
// `pxPerMeter`) at draw time, so footprints are drawn at true in-game size.
//   m           -> radius in meters (point footprints)
//   detectM     -> detection radius in meters (traps)
//   lenM        -> default length in meters (walls/beams/tripwires; the drag
//                  overrides it — this is only used for a no-drag tap)
//   thicknessM  -> thickness in meters (walls/beams)
export const ABILITY_FOOTPRINTS = {
  smoke: { placement: 'point', render: 'smoke', m: 4.0 },
  wall: { placement: 'line', render: 'wall', lenM: 10, thicknessM: 0.6 },
  molly: { placement: 'point', render: 'molly', m: 2.7 },
  flash: { placement: 'point', render: 'flash', m: 1.8 },
  stun: { placement: 'point', render: 'stun', m: 3.5 },
  recon: { placement: 'point', render: 'recon', m: 9 },
  trap: { placement: 'point', render: 'trap', detectM: 6 },
  heal: { placement: 'point', render: 'heal', m: 3.5 },
  move: { placement: 'point', render: 'move', m: 1.3 },
  ult: { placement: 'point', render: 'ult', m: 5 },
  other: { placement: 'point', render: 'other', m: 2.0 },
};

// Merge the type default with any per-ability overrides so a single ability can
// opt into a different footprint/size (e.g. Viper's Pit is a huge smoke, Cypher's
// Trapwire is a drawn line) without changing its gameplay `type`.
export const abilityFootprint = (ability) => {
  const base = ABILITY_FOOTPRINTS[ability.type] || ABILITY_FOOTPRINTS.other;
  const merged = { ...base };
  ['placement', 'render', 'm', 'detectM', 'lenM', 'thicknessM'].forEach((k) => {
    if (ability[k] != null) merged[k] = ability[k];
  });
  return merged;
};

export const abilityIconPath = (agentId, key) =>
  `${process.env.PUBLIC_URL || ''}/assets/abilities/${agentId}_${key}.png`;

export const AGENT_LIST = [
  // ------- Duelists -------
  {
    id: 'jett', name: 'Jett', role: 'Duelist', color: '#00F5FF',
    abilities: [
      { key: 'C', name: 'Cloudburst', type: 'smoke', m: 2.6 },
      { key: 'Q', name: 'Updraft', type: 'move' },
      { key: 'E', name: 'Tailwind', type: 'move' },
      { key: 'X', name: 'Blade Storm', type: 'ult', m: 2 },
    ],
  },
  {
    id: 'reyna', name: 'Reyna', role: 'Duelist', color: '#B24BF3',
    abilities: [
      { key: 'C', name: 'Leer', type: 'flash', m: 2.2 },
      { key: 'Q', name: 'Devour', type: 'heal', m: 2 },
      { key: 'E', name: 'Dismiss', type: 'move' },
      { key: 'X', name: 'Empress', type: 'ult', m: 2 },
    ],
  },
  {
    id: 'phoenix', name: 'Phoenix', role: 'Duelist', color: '#FF4500',
    abilities: [
      { key: 'C', name: 'Blaze', type: 'wall', lenM: 9, thicknessM: 0.6 },
      { key: 'Q', name: 'Hot Hands', type: 'molly', m: 2.7 },
      { key: 'E', name: 'Curveball', type: 'flash', m: 1.8 },
      { key: 'X', name: 'Run it Back', type: 'ult', m: 2 },
    ],
  },
  {
    id: 'raze', name: 'Raze', role: 'Duelist', color: '#FF6B35',
    abilities: [
      { key: 'C', name: 'Boom Bot', type: 'recon', render: 'other', m: 1.8 },
      { key: 'Q', name: 'Blast Pack', type: 'other', m: 2 },
      { key: 'E', name: 'Paint Shells', type: 'molly', m: 3.5 },
      { key: 'X', name: 'Showstopper', type: 'ult', m: 2 },
    ],
  },
  {
    id: 'yoru', name: 'Yoru', role: 'Duelist', color: '#4169E1',
    abilities: [
      { key: 'C', name: 'Fakeout', type: 'recon', render: 'other', m: 1.8 },
      { key: 'Q', name: 'Blindside', type: 'flash', m: 1.8 },
      { key: 'E', name: 'Gatecrash', type: 'move' },
      { key: 'X', name: 'Dimensional Drift', type: 'ult', m: 2 },
    ],
  },
  {
    id: 'neon', name: 'Neon', role: 'Duelist', color: '#3DB6FF',
    abilities: [
      { key: 'C', name: 'Fast Lane', type: 'wall', lenM: 20, thicknessM: 0.6 },
      { key: 'Q', name: 'Relay Bolt', type: 'stun', m: 3.5 },
      { key: 'E', name: 'High Gear', type: 'move' },
      { key: 'X', name: 'Overdrive', type: 'ult', m: 2 },
    ],
  },
  {
    id: 'iso', name: 'Iso', role: 'Duelist', color: '#7B68EE',
    abilities: [
      { key: 'C', name: 'Contingency', type: 'wall', lenM: 8, thicknessM: 0.8 },
      { key: 'Q', name: 'Undercut', type: 'stun', m: 3 },
      { key: 'E', name: 'Double Tap', type: 'other', m: 1.5 },
      { key: 'X', name: 'Kill Contract', type: 'ult', m: 5 },
    ],
  },
  {
    id: 'waylay', name: 'Waylay', role: 'Duelist', color: '#F5B942',
    abilities: [
      { key: 'C', name: 'Saturate', type: 'stun', m: 3 },
      { key: 'Q', name: 'Lightspeed', type: 'move' },
      { key: 'E', name: 'Refract', type: 'move' },
      { key: 'X', name: 'Convergent Paths', type: 'ult', m: 3 },
    ],
  },

  // ------- Initiators -------
  {
    id: 'sova', name: 'Sova', role: 'Initiator', color: '#4682B4',
    abilities: [
      { key: 'C', name: 'Owl Drone', type: 'recon', render: 'other', m: 1.8 },
      { key: 'Q', name: 'Shock Bolt', type: 'molly', m: 2.5 },
      { key: 'E', name: 'Recon Bolt', type: 'recon', m: 11 },
      { key: 'X', name: "Hunter's Fury", type: 'ult', placement: 'line', render: 'beam', lenM: 30, thicknessM: 2.5 },
    ],
  },
  {
    id: 'breach', name: 'Breach', role: 'Initiator', color: '#FF8C00',
    abilities: [
      { key: 'C', name: 'Aftershock', type: 'molly', m: 2.5 },
      { key: 'Q', name: 'Flashpoint', type: 'flash', m: 1.8 },
      { key: 'E', name: 'Fault Line', type: 'stun', placement: 'line', render: 'beam', lenM: 21, thicknessM: 3 },
      { key: 'X', name: 'Rolling Thunder', type: 'ult', placement: 'line', render: 'beam', lenM: 28, thicknessM: 14 },
    ],
  },
  {
    id: 'skye', name: 'Skye', role: 'Initiator', color: '#6DBE45',
    abilities: [
      { key: 'C', name: 'Regrowth', type: 'heal', m: 5 },
      { key: 'Q', name: 'Trailblazer', type: 'recon', render: 'other', m: 1.8 },
      { key: 'E', name: 'Guiding Light', type: 'flash', m: 2 },
      { key: 'X', name: 'Seekers', type: 'ult', m: 2 },
    ],
  },
  {
    id: 'kayo', name: 'KAY/O', role: 'Initiator', color: '#8FA3B0',
    abilities: [
      { key: 'C', name: 'FRAG/ment', type: 'molly', m: 3 },
      { key: 'Q', name: 'FLASH/drive', type: 'flash', m: 1.8 },
      { key: 'E', name: 'ZERO/point', type: 'stun', m: 4 },
      { key: 'X', name: 'NULL/cmd', type: 'ult', m: 6 },
    ],
  },
  {
    id: 'fade', name: 'Fade', role: 'Initiator', color: '#5B6E8C',
    abilities: [
      { key: 'C', name: 'Prowler', type: 'recon', render: 'other', m: 1.8 },
      { key: 'Q', name: 'Seize', type: 'stun', m: 4 },
      { key: 'E', name: 'Haunt', type: 'recon', m: 8 },
      { key: 'X', name: 'Nightfall', type: 'ult', m: 3 },
    ],
  },
  {
    id: 'gekko', name: 'Gekko', role: 'Initiator', color: '#B6D94C',
    abilities: [
      { key: 'C', name: 'Mosh Pit', type: 'molly', m: 4 },
      { key: 'Q', name: 'Wingman', type: 'recon', render: 'other', m: 1.8 },
      { key: 'E', name: 'Dizzy', type: 'flash', m: 2.5 },
      { key: 'X', name: 'Thrash', type: 'ult', m: 2 },
    ],
  },
  {
    id: 'tejo', name: 'Tejo', role: 'Initiator', color: '#D96846',
    abilities: [
      { key: 'C', name: 'Special Delivery', type: 'stun', m: 3 },
      { key: 'Q', name: 'Guided Salvo', type: 'molly', m: 3 },
      { key: 'E', name: 'Stealth Drone', type: 'recon', render: 'other', m: 1.8 },
      { key: 'X', name: 'Armageddon', type: 'ult', placement: 'line', render: 'beam', lenM: 30, thicknessM: 8 },
    ],
  },

  // ------- Controllers -------
  {
    id: 'brimstone', name: 'Brimstone', role: 'Controller', color: '#C1713B',
    abilities: [
      { key: 'C', name: 'Stim Beacon', type: 'other', m: 4 },
      { key: 'Q', name: 'Incendiary', type: 'molly', m: 3.5 },
      { key: 'E', name: 'Sky Smoke', type: 'smoke', m: 4.15 },
      { key: 'X', name: 'Orbital Strike', type: 'ult', m: 7 },
    ],
  },
  {
    id: 'omen', name: 'Omen', role: 'Controller', color: '#6E5DC6',
    abilities: [
      { key: 'C', name: 'Shrouded Step', type: 'move' },
      { key: 'Q', name: 'Paranoia', type: 'flash', m: 2 },
      { key: 'E', name: 'Dark Cover', type: 'smoke', m: 4.15 },
      { key: 'X', name: 'From the Shadows', type: 'ult', m: 2 },
    ],
  },
  {
    id: 'viper', name: 'Viper', role: 'Controller', color: '#32CD32',
    abilities: [
      { key: 'C', name: 'Snake Bite', type: 'molly', m: 2.7 },
      { key: 'Q', name: 'Poison Cloud', type: 'smoke', m: 3.6 },
      { key: 'E', name: 'Toxic Screen', type: 'wall', lenM: 25, thicknessM: 0.6 },
      { key: 'X', name: "Viper's Pit", type: 'smoke', m: 12 },
    ],
  },
  {
    id: 'astra', name: 'Astra', role: 'Controller', color: '#9370DB',
    abilities: [
      { key: 'C', name: 'Gravity Well', type: 'stun', m: 3.5 },
      { key: 'Q', name: 'Nova Pulse', type: 'stun', m: 3.5 },
      { key: 'E', name: 'Nebula', type: 'smoke', m: 4.15 },
      { key: 'X', name: 'Cosmic Divide', type: 'wall', lenM: 30, thicknessM: 0.8 },
    ],
  },
  {
    id: 'harbor', name: 'Harbor', role: 'Controller', color: '#1BA9A6',
    abilities: [
      { key: 'C', name: 'Storm Surge', type: 'stun', m: 3.5 },
      { key: 'Q', name: 'High Tide', type: 'wall', lenM: 15, thicknessM: 0.8 },
      { key: 'E', name: 'Cove', type: 'smoke', m: 4.4 },
      { key: 'X', name: 'Reckoning', type: 'ult', m: 7 },
    ],
  },
  {
    id: 'clove', name: 'Clove', role: 'Controller', color: '#FF7AD9',
    abilities: [
      { key: 'C', name: 'Pick-me-up', type: 'other', m: 2 },
      { key: 'Q', name: 'Meddle', type: 'stun', m: 3.5 },
      { key: 'E', name: 'Ruse', type: 'smoke', m: 4 },
      { key: 'X', name: 'Not Dead Yet', type: 'ult', m: 2 },
    ],
  },
  {
    id: 'miks', name: 'Miks', role: 'Controller', color: '#E05299',
    abilities: [
      { key: 'C', name: 'M-pulse', type: 'stun', m: 3.5 },
      { key: 'Q', name: 'Harmonize', type: 'other', m: 2 },
      { key: 'E', name: 'Waveform', type: 'smoke', m: 4 },
      { key: 'X', name: 'Bassquake', type: 'ult', m: 5 },
    ],
  },

  // ------- Sentinels -------
  {
    id: 'sage', name: 'Sage', role: 'Sentinel', color: '#00CED1',
    abilities: [
      { key: 'C', name: 'Barrier Orb', type: 'wall', lenM: 9, thicknessM: 1 },
      { key: 'Q', name: 'Slow Orb', type: 'stun', m: 3.6 },
      { key: 'E', name: 'Healing Orb', type: 'heal', m: 2 },
      { key: 'X', name: 'Resurrection', type: 'ult', m: 2 },
    ],
  },
  {
    id: 'cypher', name: 'Cypher', role: 'Sentinel', color: '#E8E8E8',
    abilities: [
      { key: 'C', name: 'Trapwire', type: 'trap', placement: 'line', render: 'trip', lenM: 10 },
      { key: 'Q', name: 'Cyber Cage', type: 'smoke', m: 2.9 },
      { key: 'E', name: 'Spycam', type: 'recon', render: 'other', m: 1.8 },
      { key: 'X', name: 'Neural Theft', type: 'ult', m: 2 },
    ],
  },
  {
    id: 'killjoy', name: 'Killjoy', role: 'Sentinel', color: '#FFD700',
    abilities: [
      { key: 'C', name: 'Nanoswarm', type: 'molly', m: 3.5 },
      { key: 'Q', name: 'Alarmbot', type: 'trap', detectM: 7 },
      { key: 'E', name: 'Turret', type: 'trap', detectM: 10 },
      { key: 'X', name: 'Lockdown', type: 'ult', m: 11 },
    ],
  },
  {
    id: 'chamber', name: 'Chamber', role: 'Sentinel', color: '#DAA520',
    abilities: [
      { key: 'C', name: 'Trademark', type: 'trap', detectM: 8 },
      { key: 'Q', name: 'Headhunter', type: 'other', m: 1.5 },
      { key: 'E', name: 'Rendezvous', type: 'move', m: 1.5 },
      { key: 'X', name: 'Tour De Force', type: 'ult', m: 2 },
    ],
  },
  {
    id: 'deadlock', name: 'Deadlock', role: 'Sentinel', color: '#9DB4C0',
    abilities: [
      { key: 'C', name: 'GravNet', type: 'stun', m: 3.5 },
      { key: 'Q', name: 'Sonic Sensor', type: 'trap', detectM: 7 },
      { key: 'E', name: 'Barrier Mesh', type: 'wall', lenM: 8, thicknessM: 1 },
      { key: 'X', name: 'Annihilation', type: 'ult', m: 3 },
    ],
  },
  {
    id: 'vyse', name: 'Vyse', role: 'Sentinel', color: '#8D7CE0',
    abilities: [
      { key: 'C', name: 'Razorvine', type: 'stun', m: 3.5 },
      { key: 'Q', name: 'Shear', type: 'wall', lenM: 10, thicknessM: 0.8 },
      { key: 'E', name: 'Arc Rose', type: 'flash', m: 2 },
      { key: 'X', name: 'Steel Garden', type: 'ult', m: 6 },
    ],
  },
  {
    id: 'veto', name: 'Veto', role: 'Sentinel', color: '#4F8D7A',
    abilities: [
      { key: 'C', name: 'Crosscut', type: 'wall', lenM: 9, thicknessM: 0.8 },
      { key: 'Q', name: 'Chokehold', type: 'trap', detectM: 5 },
      { key: 'E', name: 'Interceptor', type: 'trap', detectM: 5 },
      { key: 'X', name: 'Evolution', type: 'ult', m: 3 },
    ],
  },
];

export const AGENTS = Object.fromEntries(AGENT_LIST.map((a) => [a.id, a]));

export const agentIconPath = (id) => `${process.env.PUBLIC_URL || ''}/assets/agents/${id}.png`;

export const TEAM_COLORS = {
  blue: '#4A8DFF',
  red: '#FF4655',
};

export const TEAM_LABELS = {
  blue: 'Attack',
  red: 'Defense',
};
