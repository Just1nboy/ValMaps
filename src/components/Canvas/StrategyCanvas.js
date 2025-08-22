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
  
  console.log('Loading map background for:', mapName); // Debug log
  
  canvas.clear();
  
  // Create dark background first
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

  // Try to load the actual map image
  const imagePath = mapImages[mapName];
  console.log('Loading image from:', imagePath); // Debug log
  
  if (imagePath) {
    // CRITICAL FIX: Add empty options object {}
    FabricImage.fromURL(imagePath, {})
      .then((img) => {
        console.log('Image loaded successfully:', img); // Debug log
        
        // Scale image to fit canvas while maintaining aspect ratio
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
        canvas.sendObjectToBack(img);
        canvas.renderAll();
      })
      .catch((error) => {
        console.error('Failed to load map image:', imagePath, error); // Debug log
        
        // Add fallback text if image fails to load
        const mapLabel = new Text(`${mapName.toUpperCase()} MAP - FAILED TO LOAD`, {
          left: 50,
          top: 50,
          fontSize: 24,
          fill: '#ff0000', // Red text to indicate error
          selectable: false
        });
        canvas.add(mapLabel);
        canvas.renderAll();
      });
  } else {
    console.warn('No image path found for map:', mapName); // Debug log
    
    // Fallback when no image path is defined
    const mapLabel = new Text(`${mapName.toUpperCase()} MAP - NO PATH`, {
      left: 50,
      top: 50,
      fontSize: 24,
      fill: '#ffffff',
      selectable: false
    });
    canvas.add(mapLabel);
    canvas.renderAll();
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

  const handleCanvasClick = (e) => {
    if (!canvas) return;

    const pointer = canvas.getPointer(e.e);
    
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
    const agent = new Circle({
      left: pointer.x - 15,
      top: pointer.y - 15,
      radius: 15,
      fill: '#00ff88',
      stroke: '#ffffff',
      strokeWidth: 2
    });

    const agentNumber = new Text('A', {
      left: pointer.x - 5,
      top: pointer.y - 8,
      fontSize: 14,
      fill: '#000000',
      selectable: false
    });

    canvas.add(agent);
    canvas.add(agentNumber);
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