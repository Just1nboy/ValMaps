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
    if (imagePath) {
      FabricImage.fromURL(imagePath, {
        crossOrigin: 'anonymous'
      }).then((img) => {
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
        canvas.sendToBack(img);
        canvas.renderAll();
      }).catch((error) => {
        console.warn(`Could not load map image: ${imagePath}`, error);
        // Add fallback text if image fails to load
        const mapLabel = new Text(`${mapName.toUpperCase()} MAP`, {
          left: 50,
          top: 50,
          fontSize: 24,
          fill: '#ffffff',
          selectable: false
        });
        canvas.add(mapLabel);
      });
    } else {
      // Fallback when no image path is defined
      const mapLabel = new Text(`${mapName.toUpperCase()} MAP`, {
        left: 50,
        top: 50,
        fontSize: 24,
        fill: '#ffffff',
        selectable: false
      });
      canvas.add(mapLabel);
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

    const group = new Group([agent, agentNumber], {
      left: pointer.x - 15,
      top: pointer.y - 15
    });

    canvas.add(group);
  };

  const addUtilityMarker = (pointer) => {
    const utility = new Rect({
      left: pointer.x - 10,
      top: pointer.y - 10,
      width: 20,
      height: 20,
      fill: '#ff6b35',
      stroke: '#ffffff',
      strokeWidth: 2
    });

    canvas.add(utility);
  };

  const addTextAnnotation = (pointer) => {
    const text = new IText('Click to edit', {
      left: pointer.x,
      top: pointer.y,
      fontSize: 16,
      fill: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.5)'
    });

    canvas.add(text);
  };

  useEffect(() => {
    if (canvas) {
      canvas.on('mouse:down', handleCanvasClick);
      
      return () => {
        canvas.off('mouse:down', handleCanvasClick);
      };
    }
  }, [canvas, selectedTool]);

  const clearCanvas = () => {
    if (canvas) {
      loadMapBackground(); // This will clear and reload the map background
    }
  };

  const exportStrategy = () => {
    if (canvas) {
      const json = canvas.toJSON();
      console.log('Strategy data:', json);
      return json;
    }
  };

  // Expose functions to parent component
  React.useImperativeHandle(canvasRef, () => ({
    clearCanvas,
    exportStrategy
  }));

  return (
    <div className="strategy-canvas-container">
      <canvas ref={canvasRef} />
      <div className="canvas-controls">
        <button onClick={clearCanvas} className="control-btn">
          Clear
        </button>
        <button onClick={exportStrategy} className="control-btn">
          Export
        </button>
      </div>
    </div>
  );
};

export default StrategyCanvas;