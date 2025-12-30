import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Canvas, Circle, Rect, Text, IText, Group, FabricImage, Line } from 'fabric';
import './StrategyCanvas.css';

const StrategyCanvas = forwardRef(({
  mapName,
  selectedTool,
  selectedAgent,
  teamSide,
  spawnedAgents,
  onAgentSpawned,
  onAgentRemoved,
  onNotification
}, ref) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const isDrawingLine = useRef(false);
  const lineStartPoint = useRef(null);
  const currentLine = useRef(null);

  // Agent data with colors and display info
  const agentData = {
    // Duelists
    jett: { name: 'Jett', role: 'Duelist', color: '#00F5FF', icon: '🌪️' },
    reyna: { name: 'Reyna', role: 'Duelist', color: '#8A2BE2', icon: '👁️' },
    phoenix: { name: 'Phoenix', role: 'Duelist', color: '#FF4500', icon: '🔥' },
    raze: { name: 'Raze', role: 'Duelist', color: '#FF6B35', icon: '💥' },
    yoru: { name: 'Yoru', role: 'Duelist', color: '#4169E1', icon: '👻' },
    neon: { name: 'Neon', role: 'Duelist', color: '#00FFFF', icon: '⚡' },

    // Controllers
    omen: { name: 'Omen', role: 'Controller', color: '#483D8B', icon: '👤' },
    brimstone: { name: 'Brimstone', role: 'Controller', color: '#8B4513', icon: '🚬' },
    viper: { name: 'Viper', role: 'Controller', color: '#32CD32', icon: '🐍' },
    astra: { name: 'Astra', role: 'Controller', color: '#9370DB', icon: '⭐' },

    // Initiators
    sova: { name: 'Sova', role: 'Initiator', color: '#4682B4', icon: '🏹' },
    breach: { name: 'Breach', role: 'Initiator', color: '#FF8C00', icon: '💪' },
    skye: { name: 'Skye', role: 'Initiator', color: '#228B22', icon: '🦅' },
    kayo: { name: 'KAY/O', role: 'Initiator', color: '#708090', icon: '🤖' },
    fade: { name: 'Fade', role: 'Initiator', color: '#2F4F4F', icon: '🌙' },

    // Sentinels
    sage: { name: 'Sage', role: 'Sentinel', color: '#00CED1', icon: '🧘' },
    cypher: { name: 'Cypher', role: 'Sentinel', color: '#FFD700', icon: '📷' },
    killjoy: { name: 'Killjoy', role: 'Sentinel', color: '#FF1493', icon: '⚙️' },
    chamber: { name: 'Chamber', role: 'Sentinel', color: '#DAA520', icon: '🎯' }
  };

  const loadMapBackground = useCallback(() => {
    if (!canvas || !mapName) return;

    // Clear existing objects but keep any spawned agents
    const existingObjects = canvas.getObjects();
    const agentObjects = existingObjects.filter(obj => obj.agentMarker);
    
    canvas.clear();
    
    // Re-add agent objects
    agentObjects.forEach(obj => canvas.add(obj));

    const imagePath = `/assets/maps/${mapName}.jpg`;
    
    if (imagePath) {
      FabricImage.fromURL(imagePath)
        .then((img) => {
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          
          // Scale image to fit canvas
          const scaleX = canvasWidth / img.width;
          const scaleY = canvasHeight / img.height;
          const scale = Math.min(scaleX, scaleY);
          
          img.scale(scale);
          img.set({
            left: (canvasWidth - img.width * scale) / 2,
            top: (canvasHeight - img.height * scale) / 2,
            selectable: false,
            evented: false
          });
          
          canvas.add(img);
          canvas.sendObjectToBack(img);
          
          // Add dark background AFTER and send IT to back
          const mapBg = new Rect({
            left: 0,
            top: 0,
            width: canvasWidth,
            height: canvasHeight,
            fill: '#1a1a1a',
            selectable: false,
            evented: false
          });
          canvas.add(mapBg);
          canvas.sendObjectToBack(mapBg);
          
          canvas.renderAll();
        }).catch((error) => {
          console.warn(`Could not load map image: ${imagePath}`, error);
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;

          // Add fallback background with gradient
          const mapBg = new Rect({
            left: 0,
            top: 0,
            width: canvasWidth,
            height: canvasHeight,
            fill: '#1a1a1a',
            selectable: false,
            evented: false
          });
          canvas.add(mapBg);

          // Add map name as text overlay
          const mapNameText = new Text(mapName.charAt(0).toUpperCase() + mapName.slice(1), {
            left: canvasWidth / 2,
            top: canvasHeight / 2 - 20,
            fontSize: 48,
            fill: '#3a3a3a',
            fontWeight: 'bold',
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false
          });
          canvas.add(mapNameText);

          // Add hint text
          const hintText = new Text('Map image not available', {
            left: canvasWidth / 2,
            top: canvasHeight / 2 + 30,
            fontSize: 14,
            fill: '#555555',
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false
          });
          canvas.add(hintText);

          canvas.renderAll();
        });
    }
  }, [canvas, mapName]);

  useEffect(() => {
    // Initialize Fabric.js canvas
    const fabricCanvas = new Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#2a2a2a'
    });

    setCanvas(fabricCanvas);

    // Cleanup
    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (canvas && mapName) {
      loadMapBackground();
    }
  }, [canvas, mapName, loadMapBackground]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getCanvasJSON: () => {
      if (!canvas) return null;
      return canvas.toJSON(['agentMarker', 'agentType', 'agentName', 'agentRole', 'teamSide']);
    },
    loadCanvasJSON: (json) => {
      if (!canvas || !json) return;
      canvas.loadFromJSON(json, () => {
        canvas.renderAll();
      });
    },
    exportAsImage: () => {
      if (!canvas) return null;
      return canvas.toDataURL({ format: 'png', quality: 1 });
    },
    clearCanvas: () => {
      if (!canvas) return;
      const objects = canvas.getObjects();
      const nonBackgroundObjects = objects.filter(obj => obj.selectable !== false);
      nonBackgroundObjects.forEach(obj => canvas.remove(obj));
      canvas.renderAll();
    }
  }));

  // Handle object deletion - remove from spawned agents tracking
  useEffect(() => {
    if (!canvas) return;

    const handleObjectRemoved = (e) => {
      const obj = e.target;
      if (obj.agentMarker && obj.agentType && obj.teamSide) {
        onAgentRemoved(obj.agentType, obj.teamSide);
      }
    };

    canvas.on('object:removed', handleObjectRemoved);

    return () => {
      canvas.off('object:removed', handleObjectRemoved);
    };
  }, [canvas, onAgentRemoved]);

  // Configure canvas based on selected tool
  useEffect(() => {
    if (!canvas) return;

    // Reset canvas state for tool change
    canvas.isDrawingMode = false;
    canvas.selection = selectedTool === 'select';
    canvas.defaultCursor = 'default';

    // Configure based on tool
    switch (selectedTool) {
      case 'select':
        canvas.getObjects().forEach(obj => {
          if (obj.selectable !== false) {
            obj.set({ selectable: true, evented: true });
          }
        });
        break;
      case 'erase':
        canvas.defaultCursor = 'pointer';
        canvas.getObjects().forEach(obj => {
          if (obj.selectable !== false) {
            obj.set({ selectable: false, evented: true });
          }
        });
        break;
      case 'line':
        canvas.defaultCursor = 'crosshair';
        canvas.getObjects().forEach(obj => {
          if (obj.selectable !== false) {
            obj.set({ selectable: false, evented: false });
          }
        });
        break;
      default:
        canvas.getObjects().forEach(obj => {
          if (obj.selectable !== false) {
            obj.set({ selectable: false, evented: false });
          }
        });
        break;
    }
    canvas.renderAll();
  }, [canvas, selectedTool]);

  // Handle mouse events for drawing lines
  useEffect(() => {
    if (!canvas) return;

    const handleMouseDown = (options) => {
      if (selectedTool === 'line') {
        isDrawingLine.current = true;
        const pointer = canvas.getPointer(options.e);
        lineStartPoint.current = pointer;

        currentLine.current = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: teamSide === 'blue' ? '#4488ff' : '#ff4444',
          strokeWidth: 3,
          selectable: false,
          evented: false,
          strokeLineCap: 'round'
        });
        canvas.add(currentLine.current);
      }
    };

    const handleMouseMove = (options) => {
      if (selectedTool === 'line' && isDrawingLine.current && currentLine.current) {
        const pointer = canvas.getPointer(options.e);
        currentLine.current.set({ x2: pointer.x, y2: pointer.y });
        canvas.renderAll();
      }
    };

    const handleMouseUp = (options) => {
      if (selectedTool === 'line' && isDrawingLine.current) {
        isDrawingLine.current = false;
        if (currentLine.current) {
          currentLine.current.set({ selectable: true, evented: true });
          canvas.renderAll();
        }
        currentLine.current = null;
        lineStartPoint.current = null;
      }
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
    };
  }, [canvas, selectedTool, teamSide]);

  // Handle canvas clicks for various tools
  useEffect(() => {
    if (!canvas) return;

    const handleCanvasClick = (options) => {
      const pointer = canvas.getPointer(options.e);

      switch (selectedTool) {
        case 'agent':
          addAgentMarker(pointer);
          break;
        case 'utility':
          addUtilityMarker(pointer);
          break;
        case 'text':
          addTextAnnotation(pointer);
          break;
        case 'erase':
          // Erase is handled by object click
          break;
        default:
          break;
      }
    };

    const handleObjectClick = (options) => {
      if (selectedTool === 'erase' && options.target) {
        const obj = options.target;
        // Don't delete background elements
        if (obj.selectable === false && !obj.agentMarker) return;

        canvas.remove(obj);
        canvas.renderAll();

        if (onNotification) {
          onNotification('Object deleted', 'info');
        }
      }
    };

    canvas.on('mouse:up', handleCanvasClick);
    canvas.on('mouse:down', handleObjectClick);

    return () => {
      canvas.off('mouse:up', handleCanvasClick);
      canvas.off('mouse:down', handleObjectClick);
    };
  }, [canvas, selectedTool, selectedAgent, teamSide, spawnedAgents, onNotification]);

  const addAgentMarker = (pointer) => {
    if (!selectedAgent || !agentData[selectedAgent]) {
      if (onNotification) {
        onNotification('Please select an agent first', 'warning');
      }
      return;
    }

    // Check if agent is already spawned on current team side
    if (spawnedAgents[teamSide] && spawnedAgents[teamSide].includes(selectedAgent)) {
      if (onNotification) {
        onNotification(`${agentData[selectedAgent].name} is already on ${teamSide === 'blue' ? 'Attack' : 'Defense'} team`, 'warning');
      }
      return;
    }

    // Check if team already has 5 agents
    if (spawnedAgents[teamSide] && spawnedAgents[teamSide].length >= 5) {
      if (onNotification) {
        onNotification(`${teamSide === 'blue' ? 'Attack' : 'Defense'} team already has 5 agents`, 'warning');
      }
      return;
    }

    const agent = agentData[selectedAgent];
    
    // Create the agent circle with the agent's color
    const agentCircle = new Circle({
      left: 0,
      top: 0,
      radius: 18,
      fill: agent.color,
      stroke: teamSide === 'blue' ? '#4488ff' : '#ff4444', // Team border color
      strokeWidth: 3,
      originX: 'center',
      originY: 'center'
    });

    // Create agent icon/text - use first letter if no icon
    const displayText = agent.name.charAt(0).toUpperCase();
    const agentText = new Text(displayText, {
      left: 0,
      top: 0,
      fontSize: 16,
      fill: '#000000',
      fontWeight: 'bold',
      originX: 'center',
      originY: 'center',
      selectable: false
    });

    // Create agent name label below the circle
    const agentLabel = new Text(agent.name, {
      left: 0,
      top: 25,
      fontSize: 12,
      fill: '#ffffff',
      fontWeight: 'bold',
      originX: 'center',
      originY: 'center',
      backgroundColor: teamSide === 'blue' ? 'rgba(68, 136, 255, 0.8)' : 'rgba(255, 68, 68, 0.8)',
      padding: 2
    });

    // Create team indicator
    const teamIndicator = new Text(teamSide === 'blue' ? '🔵' : '🔴', {
      left: 15,
      top: -15,
      fontSize: 10,
      originX: 'center',
      originY: 'center',
      selectable: false
    });

    const group = new Group([agentCircle, agentText, agentLabel, teamIndicator], {
      left: pointer.x,
      top: pointer.y,
      originX: 'center',
      originY: 'center'
    });

    // Store agent data with the group for identification
    group.set({
      agentMarker: true,
      agentType: selectedAgent,
      agentName: agent.name,
      agentRole: agent.role,
      teamSide: teamSide
    });

    canvas.add(group);
    canvas.renderAll();

    // Add to spawned agents tracking
    onAgentSpawned(selectedAgent, teamSide);

    if (onNotification) {
      onNotification(`${agent.name} added to ${teamSide === 'blue' ? 'Attack' : 'Defense'} team`, 'success');
    }
  };

  const addUtilityMarker = (pointer) => {
    const utility = new Circle({
      left: pointer.x - 10,
      top: pointer.y - 10,
      radius: 10,
      fill: '#ffaa00',
      stroke: '#ffffff',
      strokeWidth: 2
    });

    canvas.add(utility);
    canvas.renderAll();
  };

  const addTextAnnotation = (pointer) => {
    const text = new IText('Click to edit', {
      left: pointer.x,
      top: pointer.y,
      fontSize: 16,
      fill: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: 5
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    canvas.renderAll();
  };

  return (
    <div className="strategy-canvas">
      <canvas
        ref={canvasRef}
      />
    </div>
  );
});

export default StrategyCanvas;