import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, Circle, Rect, Text, IText, Group, FabricImage } from 'fabric';
import './StrategyCanvas.css';

const StrategyCanvas = ({ mapName, selectedTool }) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);

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
        // ... rest of error handling
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

  const handleCanvasClick = (options) => {
  if (!canvas) return;

  // Fix: Use options.e instead of e.e for the native event
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

  const addAgentMarker = (pointer) => {
  // Create agent counter for numbering
  const agentCount = canvas.getObjects().filter(obj => obj.type === 'group' && obj.agentMarker).length + 1;
  
  const agent = new Circle({
    left: 0,
    top: 0,
    radius: 15,
    fill: '#00ff88',
    stroke: '#ffffff',
    strokeWidth: 2,
    originX: 'center',
    originY: 'center'
  });

  const agentNumber = new Text(`${agentCount}`, {
    left: 0,
    top: 0,
    fontSize: 14,
    fill: '#000000',
    fontWeight: 'bold',
    originX: 'center',
    originY: 'center',
    selectable: false
  });

  const group = new Group([agent, agentNumber], {
    left: pointer.x,
    top: pointer.y,
    originX: 'center',
    originY: 'center'
  });

  // Mark it as an agent marker for counting purposes
  group.set('agentMarker', true);

  canvas.add(group);
  canvas.renderAll();
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
        onClick={handleCanvasClick}
      />
    </div>
  );
};

export default StrategyCanvas;