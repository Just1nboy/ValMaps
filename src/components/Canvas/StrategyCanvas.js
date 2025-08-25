import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, Circle, Rect, Text, IText, Group, FabricImage } from 'fabric';
import './StrategyCanvas.css';

const StrategyCanvas = ({ mapName, selectedTool, selectedAgent }) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);

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

  // Map backgrounds - make sure these files exist in public/assets/maps/
  const mapImages = {
    ascent: '/assets/maps/ascent.jpg',
    bind: '/assets/maps/bind.jpg',
    haven: '/assets/maps/haven.jpg',
    split: '/assets/maps/split.jpg',
    icebox: '/assets/maps/icebox.jpg',
    breeze: '/assets/maps/breeze.jpg'
  };

  const loadMapBackground = useCallback(() => {
    if (!canvas) return;
    
    canvas.clear();

    // Try to load the actual map image FIRST
    const imagePath = mapImages[mapName];
    if (imagePath) {
      console.log('Loading map background for:', mapName);
      console.log('Loading image from:', imagePath);
      
      FabricImage.fromURL(imagePath)
        .then((img) => {
          console.log('Image loaded successfully:', img);
          
          const canvasWidth = 800;
          const canvasHeight = 600;
          
          const scaleX = canvasWidth / img.width;
          const scaleY = canvasHeight / img.height;
          const scale = Math.min(scaleX, scaleY);
          
          img.set({
            scaleX: scale,
            scaleY: scale,
            left: (canvasWidth - img.width * scale) / 2,
            top: (canvasHeight - img.height * scale) / 2,
            selectable: false,
            evented: false
          });
          
          canvas.add(img);
          // DON'T send to back - keep image on top
          // canvas.sendObjectToBack(img); // Comment this out
          
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
          canvas.sendObjectToBack(mapBg); // Send background to back instead
          
          canvas.renderAll();
        }).catch((error) => {
          console.warn(`Could not load map image: ${imagePath}`, error);
          // Add fallback background
          const mapBg = new Rect({
            left: 0,
            top: 0,
            width: 800,
            height: 600,
            fill: '#1a1a1a',
            selectable: false,
            evented: false
          });
          canvas.add(mapBg);
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

  // THIS IS THE FIXED PART - ADD FABRIC.JS EVENT LISTENER
  useEffect(() => {
    if (!canvas) return;

    const handleCanvasClick = (options) => {
      // Only handle clicks if we have a tool selected that needs it
      if (!['agent', 'utility', 'text'].includes(selectedTool)) {
        return;
      }

      // Get the pointer position
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
        default:
          break;
      }
    };

    // Add the event listener to the Fabric.js canvas
    canvas.on('mouse:up', handleCanvasClick);

    // Cleanup function to remove event listener
    return () => {
      canvas.off('mouse:up', handleCanvasClick);
    };
  }, [canvas, selectedTool, selectedAgent]); // Re-run when canvas, selectedTool, or selectedAgent changes

  const addAgentMarker = (pointer) => {
    if (!selectedAgent || !agentData[selectedAgent]) {
      console.warn('No agent selected or invalid agent');
      return;
    }

    const agent = agentData[selectedAgent];
    
    // Create the agent circle with the agent's color
    const agentCircle = new Circle({
      left: 0,
      top: 0,
      radius: 18,
      fill: agent.color,
      stroke: '#ffffff',
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
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: 2
    });

    const group = new Group([agentCircle, agentText, agentLabel], {
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
      agentRole: agent.role
    });

    canvas.add(group);
    canvas.renderAll();

    console.log(`Added ${agent.name} (${agent.role}) at position:`, pointer);
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
        // REMOVED: onClick={handleCanvasClick} - This was the problem!
      />
    </div>
  );
};

export default StrategyCanvas;