import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  Canvas,
  Circle,
  Rect,
  Text,
  IText,
  Group,
  FabricImage,
  Line,
  Triangle,
  Polygon,
  util,
} from 'fabric';
import {
  AGENTS,
  ABILITY_TYPES,
  TEAM_COLORS,
  agentIconPath,
  abilityFootprint,
  abilityIconPath,
} from '../../data/agents';
import { mapImagePath, mapPxPerMeter } from '../../data/maps';
import './StrategyCanvas.css';

export const CANVAS_SIZE = 720;
const FONT = "'Segoe UI', Tahoma, sans-serif";

// Custom props that must survive canvas JSON serialization (save/load).
const CUSTOM_PROPS = [
  'agentMarker',
  'agentType',
  'agentName',
  'agentRole',
  'abilityMarker',
  'abilityKey',
  'abilityName',
  'abilityType',
  'drawingMarker',
  'annotation',
  'teamSide',
  'isMapBackground',
];

const hexToRgba = (hex, alpha) => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

const starPoints = (outerR, innerR, points = 5) => {
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    pts.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) });
  }
  return pts;
};

const teamLabelBg = (side) =>
  side === 'blue' ? 'rgba(74, 141, 255, 0.85)' : 'rgba(255, 70, 85, 0.85)';

// ---------- marker builders (pure, no component state) ----------

const makeAgentMarkerGroup = async (agent, teamSide, pointer) => {
  const ringColor = TEAM_COLORS[teamSide];

  const bgCircle = new Circle({
    radius: 20,
    fill: '#0f1923',
    stroke: ringColor,
    strokeWidth: 3,
    originX: 'center',
    originY: 'center',
  });

  let icon;
  try {
    const img = await FabricImage.fromURL(agentIconPath(agent.id));
    img.scaleToWidth(34);
    img.set({ originX: 'center', originY: 'center' });
    img.clipPath = new Circle({
      radius: Math.min(img.width, img.height) / 2,
      originX: 'center',
      originY: 'center',
    });
    icon = img;
  } catch (e) {
    icon = new Text(agent.name.charAt(0).toUpperCase(), {
      fontSize: 18,
      fontWeight: 'bold',
      fontFamily: FONT,
      fill: agent.color,
      originX: 'center',
      originY: 'center',
    });
  }

  const label = new Text(agent.name, {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: FONT,
    fill: '#ffffff',
    backgroundColor: teamLabelBg(teamSide),
    originX: 'center',
    originY: 'center',
    top: 31,
  });

  const group = new Group([bgCircle, icon, label], {
    left: pointer.x,
    top: pointer.y,
    originX: 'center',
    originY: 'center',
    hasControls: false,
  });

  group.set({
    agentMarker: true,
    agentType: agent.id,
    agentName: agent.name,
    agentRole: agent.role,
    teamSide,
  });

  return group;
};

// The dominant color for an ability's footprint: type-colored effects (mollies,
// flashes, stuns, recon) keep their in-game color regardless of agent; the rest
// take the agent's signature color.
const abilityColor = (agent, ability) => {
  const typeStyle = ABILITY_TYPES[ability.type] || ABILITY_TYPES.other;
  return typeStyle.color || agent.color;
};

const centered = { originX: 'center', originY: 'center' };

const keyBadge = (key) =>
  new Text(key, { fontSize: 12, fontWeight: 'bold', fontFamily: FONT, fill: '#ffffff', ...centered });

const abilityLabel = (agent, ability, top) =>
  new Text(`${agent.name} ${ability.name}`, {
    fontSize: 10,
    fontFamily: FONT,
    fill: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    top,
    ...centered,
  });

const ICON_PX = 22;
const ICON_BACKING = 13;

// The real Valorant ability icon on a small dark disc (for legibility over the
// translucent footprint). Falls back to the keybind letter if the icon is missing.
const loadAbilityGlyph = async (agent, ability) => {
  const backing = new Circle({ radius: ICON_BACKING, fill: 'rgba(15, 25, 35, 0.72)', ...centered });
  try {
    const img = await FabricImage.fromURL(abilityIconPath(agent.id, ability.key));
    img.scaleToWidth(ICON_PX);
    img.set({ ...centered });
    return [backing, img];
  } catch (e) {
    return [backing, keyBadge(ability.key)];
  }
};

// Build the shapes (centered on 0,0) for a single-click ability footprint.
// Sizes come from the ability's real meters * the map's px-per-meter `scale`.
// Returns { parts, labelOffset }.
const buildPointFootprint = (agent, ability, fp, scale) => {
  const color = abilityColor(agent, ability);
  const r = Math.max((fp.m || 2) * scale, 7);
  const parts = [];
  let labelOffset = r + 13;

  switch (fp.render) {
    case 'smoke':
      parts.push(
        new Circle({ radius: r, fill: hexToRgba(color, 0.32), stroke: color, strokeWidth: 2, ...centered }),
        new Circle({ radius: r * 0.62, fill: hexToRgba(color, 0.22), stroke: 'transparent', ...centered })
      );
      break;
    case 'molly':
      parts.push(
        new Circle({ radius: r, fill: hexToRgba('#ff6b35', 0.4), stroke: '#ff8a3d', strokeWidth: 2, strokeDashArray: [7, 4], ...centered }),
        new Circle({ radius: r * 0.5, fill: hexToRgba('#ff3b1f', 0.55), ...centered })
      );
      break;
    case 'flash':
      parts.push(
        new Polygon(starPoints(r, r * 0.44, 10), { fill: hexToRgba('#ffe98a', 0.55), stroke: '#fff6c8', strokeWidth: 1.5, ...centered }),
        new Circle({ radius: r * 0.34, fill: '#fffbe6', ...centered })
      );
      break;
    case 'stun':
      parts.push(
        new Circle({ radius: r, fill: hexToRgba('#8f6fff', 0.3), stroke: '#a68bff', strokeWidth: 2, strokeDashArray: [5, 4], ...centered }),
        new Circle({ radius: r * 0.58, fill: 'transparent', stroke: hexToRgba('#a68bff', 0.7), strokeWidth: 1.5, ...centered })
      );
      break;
    case 'recon':
      parts.push(
        new Circle({ radius: r, fill: hexToRgba('#35c4ff', 0.12), stroke: '#35c4ff', strokeWidth: 2, strokeDashArray: [6, 5], ...centered }),
        new Line([0, 0, r, 0], { stroke: hexToRgba('#35c4ff', 0.8), strokeWidth: 2, ...centered })
      );
      break;
    case 'trap': {
      const d = Math.max((fp.detectM || 6) * scale, 16);
      labelOffset = d + 13;
      parts.push(
        new Circle({ radius: d, fill: hexToRgba(color, 0.08), stroke: color, strokeWidth: 1.5, strokeDashArray: [4, 4], ...centered })
      );
      return { parts, labelOffset };
    }
    case 'heal':
      parts.push(
        new Circle({ radius: r, fill: hexToRgba('#4cd964', 0.3), stroke: '#4cd964', strokeWidth: 2, ...centered })
      );
      break;
    case 'ult':
      parts.push(
        new Polygon(starPoints(r, r * 0.55), { fill: hexToRgba(agent.color, 0.32), stroke: '#ffd700', strokeWidth: 2, ...centered })
      );
      break;
    case 'move':
    case 'other':
    default:
      parts.push(
        new Circle({ radius: r, fill: hexToRgba(color, 0.3), stroke: color, strokeWidth: 2, ...centered })
      );
      break;
  }

  return { parts, labelOffset };
};

const makeAbilityMarkerGroup = async (agent, ability, teamSide, pointer, scale) => {
  const fp = abilityFootprint(ability);
  const { parts, labelOffset } = buildPointFootprint(agent, ability, fp, scale);
  parts.push(...(await loadAbilityGlyph(agent, ability)));
  parts.push(abilityLabel(agent, ability, labelOffset));

  const group = new Group(parts, {
    left: pointer.x,
    top: pointer.y,
    ...centered,
    hasControls: false,
  });
  group.set({
    abilityMarker: true,
    agentType: agent.id,
    abilityKey: ability.key,
    abilityName: ability.name,
    abilityType: ability.type,
    teamSide,
  });
  return group;
};

// Two-point (drag) footprints: walls, Cypher tripwires, Breach Fault Line beams.
// `start` is the origin, `end` the aim/endpoint the user dragged to. Thickness
// comes from the ability's real meters * the map's px-per-meter `scale`.
const makeAbilityLineGroup = async (agent, ability, teamSide, start, end, fp, scale) => {
  // Directional beams (Fault Line, Rolling Thunder) read best in the agent's
  // signature color; walls/tripwires keep their type color.
  const color = fp.render === 'beam' ? agent.color : abilityColor(agent, ability);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.max(Math.hypot(dx, dy), 12);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
  const parts = [];
  let thickness;

  if (fp.render === 'trip') {
    // Thin wire between two anchor nodes (Cypher Trapwire).
    thickness = 9;
    parts.push(
      new Line([start.x, start.y, end.x, end.y], { stroke: color, strokeWidth: 2, ...centered }),
      new Rect({ left: start.x, top: start.y, width: 9, height: 9, fill: color, stroke: '#0f1923', strokeWidth: 1.5, ...centered }),
      new Rect({ left: end.x, top: end.y, width: 9, height: 9, fill: color, stroke: '#0f1923', strokeWidth: 1.5, ...centered })
    );
  } else if (fp.render === 'beam') {
    // Directional stun beam that grows out from the origin (Breach Fault Line).
    thickness = Math.max((fp.thicknessM || 3) * scale, 12);
    parts.push(
      new Rect({
        left: mid.x, top: mid.y, width: length, height: thickness, angle,
        fill: hexToRgba(color, 0.28), stroke: color, strokeWidth: 2, rx: 6, ry: 6, ...centered,
      }),
      new Triangle({
        left: end.x, top: end.y, width: thickness * 0.6, height: thickness * 0.7,
        fill: color, angle: angle + 90, ...centered,
      })
    );
  } else {
    // Solid oriented wall bar (Sage barrier, Viper screen, Cosmic Divide, …).
    thickness = Math.max((fp.thicknessM || 0.6) * scale, 5);
    parts.push(
      new Rect({
        left: mid.x, top: mid.y, width: length, height: thickness, angle,
        fill: hexToRgba(color, 0.45), stroke: color, strokeWidth: 2, rx: 5, ry: 5, ...centered,
      })
    );
  }

  // Glyph at the footprint's midpoint.
  const glyph = await loadAbilityGlyph(agent, ability);
  glyph.forEach((g) => g.set({ left: mid.x, top: mid.y }));
  parts.push(...glyph);

  // Label placed in absolute coords just beneath the footprint's vertical extent.
  const labelY = Math.max(start.y, end.y) + thickness / 2 + 16;
  const label = abilityLabel(agent, ability, labelY);
  label.set({ left: mid.x, top: labelY });
  parts.push(label);

  const group = new Group(parts, { hasControls: false });
  group.set({
    abilityMarker: true,
    agentType: agent.id,
    abilityKey: ability.key,
    abilityName: ability.name,
    abilityType: ability.type,
    teamSide,
  });
  return group;
};

const makeArrowGroup = (start, end, color) => {
  const angle = (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI;
  const line = new Line([start.x, start.y, end.x, end.y], {
    stroke: color,
    strokeWidth: 3,
  });
  const head = new Triangle({
    left: end.x,
    top: end.y,
    width: 13,
    height: 15,
    fill: color,
    originX: 'center',
    originY: 'center',
    angle: angle + 90,
  });
  const group = new Group([line, head], { hasControls: false });
  group.set({ drawingMarker: true });
  return group;
};

const makeMapPlaceholder = (mapName) => {
  const bg = new Rect({
    left: 0,
    top: 0,
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    fill: '#232830',
  });
  const title = new Text(mapName.toUpperCase(), {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: FONT,
    fill: '#3d4654',
    left: CANVAS_SIZE / 2,
    top: CANVAS_SIZE / 2 - 20,
    originX: 'center',
    originY: 'center',
  });
  const hint = new Text('Minimap image not found', {
    fontSize: 16,
    fontFamily: FONT,
    fill: '#3d4654',
    left: CANVAS_SIZE / 2,
    top: CANVAS_SIZE / 2 + 24,
    originX: 'center',
    originY: 'center',
  });
  const group = new Group([bg, title, hint], { left: 0, top: 0 });
  group.set({ isMapBackground: true, selectable: false, evented: false });
  return group;
};

// ---------- component ----------

const StrategyCanvas = forwardRef(
  (
    {
      mapName,
      selectedTool,
      selectedAgent,
      selectedAbility,
      teamSide,
      spawnedAgents,
      onAgentSpawned,
      onAgentRemoved,
      onReturnToSelect,
    },
    ref
  ) => {
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState(null);

    // Keep the latest "back to Select" callback in a ref so the pointer effect
    // below doesn't need to re-subscribe every time it changes.
    const returnToSelectRef = useRef(onReturnToSelect);
    useEffect(() => {
      returnToSelectRef.current = onReturnToSelect;
    }, [onReturnToSelect]);

    // Initialize the Fabric canvas once.
    useEffect(() => {
      const fabricCanvas = new Canvas(canvasRef.current, {
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
        backgroundColor: '#20242c',
        preserveObjectStacking: true,
      });
      setCanvas(fabricCanvas);
      if (process.env.NODE_ENV !== 'production') {
        window.__valmapsCanvas = fabricCanvas;
      }
      return () => {
        fabricCanvas.dispose();
      };
    }, []);

    // Load / swap the map background whenever the map changes.
    const loadMapBackground = useCallback(async () => {
      if (!canvas) return;
      canvas
        .getObjects()
        .filter((o) => o.isMapBackground)
        .forEach((o) => canvas.remove(o));

      let bgObject;
      try {
        const img = await FabricImage.fromURL(mapImagePath(mapName));
        const scale = Math.min(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height);
        img.scale(scale);
        img.set({
          left: (CANVAS_SIZE - img.width * scale) / 2,
          top: (CANVAS_SIZE - img.height * scale) / 2,
          selectable: false,
          evented: false,
          isMapBackground: true,
        });
        bgObject = img;
      } catch (e) {
        bgObject = makeMapPlaceholder(mapName);
      }

      if (canvas.disposed) return;
      canvas.add(bgObject);
      canvas.sendObjectToBack(bgObject);
      canvas.requestRenderAll();
    }, [canvas, mapName]);

    useEffect(() => {
      loadMapBackground();
    }, [loadMapBackground]);

    // Keep the App's spawned-agent tracking in sync when agent markers are removed.
    useEffect(() => {
      if (!canvas) return;
      const handleObjectRemoved = (e) => {
        const obj = e.target;
        if (obj && obj.agentMarker && obj.agentType && obj.teamSide) {
          onAgentRemoved(obj.agentType, obj.teamSide);
        }
      };
      canvas.on('object:removed', handleObjectRemoved);
      return () => {
        canvas.off('object:removed', handleObjectRemoved);
      };
    }, [canvas, onAgentRemoved]);

    // Configure interaction mode per selected tool.
    useEffect(() => {
      if (!canvas) return;
      const isSelect = selectedTool === 'select';
      const isErase = selectedTool === 'erase';
      canvas.selection = isSelect;
      canvas.defaultCursor = isSelect ? 'default' : 'crosshair';
      canvas.hoverCursor = isErase ? 'not-allowed' : 'move';
      canvas.skipTargetFind = !isSelect && !isErase;
      canvas.forEachObject((o) => {
        if (o.isMapBackground) return;
        o.selectable = isSelect;
        o.evented = isSelect || isErase;
      });
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }, [canvas, selectedTool]);

    // Delete / Backspace removes the current selection (in select mode).
    useEffect(() => {
      if (!canvas) return;
      const onKeyDown = (e) => {
        if (e.key !== 'Delete' && e.key !== 'Backspace') return;
        const tag = document.activeElement && document.activeElement.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        const active = canvas.getActiveObjects();
        if (!active.length || active.some((o) => o.isEditing)) return;
        e.preventDefault();
        active.forEach((o) => canvas.remove(o));
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      };
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }, [canvas]);

    // Main pointer interaction: placement, arrow drawing, erasing.
    useEffect(() => {
      if (!canvas) return;

      const drawing = {
        line: null,
        start: null,
        wasEditingText: false,
        abilityLine: null,
        abilityStart: null,
        abilityCtx: null,
      };

      const getPoint = (opt) => opt.scenePoint || canvas.getScenePoint(opt.e);

      // Hand control back to Select mode after a discrete placement.
      const returnToSelect = () => {
        if (returnToSelectRef.current) returnToSelectRef.current();
      };

      // Real-world scale of the current map, so footprints draw at true size.
      const scale = mapPxPerMeter(mapName);

      // Resolve the currently selected ability plus its placement footprint.
      const resolveAbility = () => {
        if (!selectedAbility) return null;
        const agent = AGENTS[selectedAbility.agentId];
        const ability =
          agent && agent.abilities.find((a) => a.key === selectedAbility.key);
        if (!ability) return null;
        return { agent, ability, fp: abilityFootprint(ability) };
      };

      const placeAgent = async (pointer) => {
        const agent = AGENTS[selectedAgent];
        if (!agent) return false;
        const roster = spawnedAgents[teamSide] || [];
        if (roster.includes(selectedAgent) || roster.length >= 5) return false;
        const group = await makeAgentMarkerGroup(agent, teamSide, pointer);
        if (canvas.disposed) return false;
        canvas.add(group);
        canvas.requestRenderAll();
        onAgentSpawned(selectedAgent, teamSide);
        return true;
      };

      const placeAbility = async (pointer) => {
        if (!selectedAbility) return false;
        const agent = AGENTS[selectedAbility.agentId];
        const ability =
          agent && agent.abilities.find((a) => a.key === selectedAbility.key);
        if (!ability) return false;
        const group = await makeAbilityMarkerGroup(agent, ability, teamSide, pointer, scale);
        if (canvas.disposed) return false;
        canvas.add(group);
        canvas.requestRenderAll();
        return true;
      };

      const placeText = (pointer) => {
        const text = new IText('Note', {
          left: pointer.x,
          top: pointer.y,
          fontSize: 16,
          fontFamily: FONT,
          fill: '#ffffff',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          originX: 'center',
          originY: 'center',
        });
        text.set({ annotation: true });
        // Once the note is done being typed, return to Select mode.
        text.on('editing:exited', () => returnToSelect());
        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();
        text.selectAll();
        canvas.requestRenderAll();
      };

      const onMouseDown = (opt) => {
        const active = canvas.getActiveObject();
        drawing.wasEditingText = !!(active && active.isEditing);

        if (selectedTool === 'erase') {
          const target = opt.target;
          if (target && !target.isMapBackground) {
            canvas.remove(target);
            canvas.requestRenderAll();
          }
          return;
        }

        if (selectedTool === 'line') {
          const p = getPoint(opt);
          drawing.start = p;
          drawing.line = new Line([p.x, p.y, p.x, p.y], {
            stroke: TEAM_COLORS[teamSide],
            strokeWidth: 3,
            selectable: false,
            evented: false,
            objectCaching: false,
          });
          canvas.add(drawing.line);
          return;
        }

        // Two-point (drag) ability placement: walls, tripwires, Fault Line beams.
        const resolved = resolveAbility();
        if (selectedTool === 'utility' && resolved && resolved.fp.placement === 'line') {
          const p = getPoint(opt);
          const color =
            resolved.fp.render === 'beam'
              ? resolved.agent.color
              : abilityColor(resolved.agent, resolved.ability);
          const sw =
            resolved.fp.render === 'trip'
              ? 3
              : Math.max(
                  (resolved.fp.thicknessM || (resolved.fp.render === 'beam' ? 3 : 0.6)) * scale,
                  resolved.fp.render === 'beam' ? 12 : 5
                );
          drawing.abilityStart = p;
          drawing.abilityCtx = resolved;
          drawing.abilityLine = new Line([p.x, p.y, p.x, p.y], {
            stroke: hexToRgba(color, 0.6),
            strokeWidth: sw,
            strokeDashArray: [8, 6],
            strokeLineCap: 'round',
            selectable: false,
            evented: false,
            objectCaching: false,
          });
          canvas.add(drawing.abilityLine);
        }
      };

      const onMouseMove = (opt) => {
        if (selectedTool === 'line' && drawing.line) {
          const p = getPoint(opt);
          drawing.line.set({ x2: p.x, y2: p.y });
          canvas.requestRenderAll();
          return;
        }
        if (drawing.abilityLine) {
          const p = getPoint(opt);
          drawing.abilityLine.set({ x2: p.x, y2: p.y });
          canvas.requestRenderAll();
        }
      };

      const onMouseUp = (opt) => {
        if (selectedTool === 'line') {
          if (!drawing.line) return;
          const p = getPoint(opt);
          const start = drawing.start;
          canvas.remove(drawing.line);
          drawing.line = null;
          drawing.start = null;
          if (Math.hypot(p.x - start.x, p.y - start.y) > 8) {
            canvas.add(makeArrowGroup(start, p, TEAM_COLORS[teamSide]));
            returnToSelect();
          }
          canvas.requestRenderAll();
          return;
        }

        // Finalize a two-point ability drag (walls / tripwires / beams).
        if (drawing.abilityLine) {
          const p = getPoint(opt);
          const start = drawing.abilityStart;
          const { agent, ability, fp } = drawing.abilityCtx;
          canvas.remove(drawing.abilityLine);
          drawing.abilityLine = null;
          drawing.abilityStart = null;
          drawing.abilityCtx = null;
          // A tap with no drag lays the footprint at its default length facing east.
          const end =
            Math.hypot(p.x - start.x, p.y - start.y) < 8
              ? { x: start.x + (fp.lenM || 10) * scale, y: start.y }
              : p;
          makeAbilityLineGroup(agent, ability, teamSide, start, end, fp, scale).then((group) => {
            if (canvas.disposed) return;
            canvas.add(group);
            canvas.requestRenderAll();
            returnToSelect();
          });
          return;
        }

        if (opt.isClick === false) return;
        const p = getPoint(opt);

        switch (selectedTool) {
          case 'agent':
            placeAgent(p).then((placed) => {
              if (placed) returnToSelect();
            });
            break;
          case 'utility':
            placeAbility(p).then((placed) => {
              if (placed) returnToSelect();
            });
            break;
          case 'text':
            // A click that ended a text-editing session shouldn't spawn a new note.
            // The note itself returns to Select once editing finishes (placeText).
            if (!drawing.wasEditingText) placeText(p);
            break;
          default:
            break;
        }
      };

      canvas.on('mouse:down', onMouseDown);
      canvas.on('mouse:move', onMouseMove);
      canvas.on('mouse:up', onMouseUp);
      return () => {
        canvas.off('mouse:down', onMouseDown);
        canvas.off('mouse:move', onMouseMove);
        canvas.off('mouse:up', onMouseUp);
      };
    }, [
      canvas,
      mapName,
      selectedTool,
      selectedAgent,
      selectedAbility,
      teamSide,
      spawnedAgents,
      onAgentSpawned,
    ]);

    // Imperative API used by the App for save / load / export / clear.
    useImperativeHandle(
      ref,
      () => ({
        getState: () => {
          if (!canvas) return null;
          const json = canvas.toObject(CUSTOM_PROPS);
          return {
            version: 1,
            objects: (json.objects || []).filter((o) => !o.isMapBackground),
          };
        },
        loadState: async (data) => {
          if (!canvas) return null;
          canvas.discardActiveObject();
          canvas
            .getObjects()
            .filter((o) => !o.isMapBackground)
            .forEach((o) => canvas.remove(o));

          const objects = await util.enlivenObjects((data && data.objects) || []);
          if (canvas.disposed) return null;

          const spawned = { blue: [], red: [] };
          const isSelect = selectedTool === 'select';
          objects.forEach((o) => {
            o.set({
              selectable: isSelect,
              evented: isSelect || selectedTool === 'erase',
            });
            if (o.agentMarker || o.drawingMarker) o.hasControls = false;
            if (o.abilityMarker && o.abilityType !== 'wall') o.hasControls = false;
            if (o.agentMarker && spawned[o.teamSide]) {
              spawned[o.teamSide].push(o.agentType);
            }
            canvas.add(o);
          });
          canvas.requestRenderAll();
          return spawned;
        },
        exportPNG: (fileName) => {
          if (!canvas) return;
          canvas.discardActiveObject();
          canvas.renderAll();
          const url = canvas.toDataURL({ format: 'png', multiplier: 2 });
          const a = document.createElement('a');
          a.href = url;
          a.download = `${fileName || 'strategy'}.png`;
          document.body.appendChild(a);
          a.click();
          a.remove();
        },
        clearAgents: () => {
          if (!canvas) return;
          canvas.discardActiveObject();
          canvas
            .getObjects()
            .filter((o) => o.agentMarker)
            .forEach((o) => canvas.remove(o));
          canvas.requestRenderAll();
        },
        clearBoard: () => {
          if (!canvas) return;
          canvas.discardActiveObject();
          canvas
            .getObjects()
            .filter((o) => !o.isMapBackground)
            .forEach((o) => canvas.remove(o));
          canvas.requestRenderAll();
        },
      }),
      [canvas, selectedTool]
    );

    return (
      <div className="strategy-canvas-container">
        <canvas ref={canvasRef} />
      </div>
    );
  }
);

StrategyCanvas.displayName = 'StrategyCanvas';

export default StrategyCanvas;
