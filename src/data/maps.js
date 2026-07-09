// All competitive Valorant maps. Minimap images live in public/assets/maps/<id>.png
// (downloaded from the community valorant-api.com media CDN).
//
// `pxPerMeter` is the real-world scale of the minimap on our 720px canvas, derived
// from valorant-api's map calibration: every minimap is a 1024² image, the canvas
// fits it to 720px, and Riot's `xMultiplier` converts game units (1u = 1cm) to a
// [0,1] fraction of the image — so px/meter = |xMultiplier| * 100 * 720 = |xMult|*72000.
// This lets ability footprints be drawn at their true in-game size (à la Valoplant).

export const MAPS = [
  { id: 'ascent', name: 'Ascent', pxPerMeter: 5.04 },
  { id: 'bind', name: 'Bind', pxPerMeter: 4.25 },
  { id: 'breeze', name: 'Breeze', pxPerMeter: 5.04 },
  { id: 'haven', name: 'Haven', pxPerMeter: 5.4 },
  { id: 'icebox', name: 'Icebox', pxPerMeter: 5.18 },
  { id: 'split', name: 'Split', pxPerMeter: 5.62 },
  { id: 'fracture', name: 'Fracture', pxPerMeter: 5.62 },
  { id: 'pearl', name: 'Pearl', pxPerMeter: 5.62 },
  { id: 'lotus', name: 'Lotus', pxPerMeter: 5.18 },
  { id: 'sunset', name: 'Sunset', pxPerMeter: 5.62 },
  { id: 'abyss', name: 'Abyss', pxPerMeter: 5.83 },
  { id: 'corrode', name: 'Corrode', pxPerMeter: 5.04 },
  { id: 'summit', name: 'Summit', pxPerMeter: 5.4 },
];

export const MAP_BY_ID = Object.fromEntries(MAPS.map((m) => [m.id, m]));

// Fallback scale for any map without calibration data.
export const DEFAULT_PX_PER_METER = 5.2;

export const mapPxPerMeter = (id) =>
  (MAP_BY_ID[id] && MAP_BY_ID[id].pxPerMeter) || DEFAULT_PX_PER_METER;

export const mapImagePath = (id) => `${process.env.PUBLIC_URL || ''}/assets/maps/${id}.png`;
