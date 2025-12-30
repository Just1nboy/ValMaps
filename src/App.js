import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';
import StrategyCanvas from './components/Canvas/StrategyCanvas';
import Toolbar from './components/Toolbar/Toolbar';
import MapSelector from './components/MapSelector/MapSelector';

// Notification component
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification notification-${type}`}>
      <span>{message}</span>
      <button onClick={onClose} className="notification-close">&times;</button>
    </div>
  );
};

function App() {
  const [selectedMap, setSelectedMap] = useState('ascent');
  const [selectedTool, setSelectedTool] = useState('select');
  const [selectedAgent, setSelectedAgent] = useState('jett');
  const [teamSide, setTeamSide] = useState('blue');
  const [strategies, setStrategies] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const canvasRef = useRef(null);

  // Track spawned agents per side
  const [spawnedAgents, setSpawnedAgents] = useState({
    blue: [],
    red: []
  });

  // Load strategies from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('valmaps_strategies');
    if (saved) {
      try {
        setStrategies(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load strategies:', e);
      }
    }
  }, []);

  // Add notification
  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  }, []);

  // Remove notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleSaveStrategy = () => {
    if (!canvasRef.current) {
      addNotification('Canvas not ready', 'error');
      return;
    }

    const canvasData = canvasRef.current.getCanvasJSON();
    const newStrategy = {
      id: Date.now(),
      name: `Strategy ${strategies.length + 1}`,
      map: selectedMap,
      teamSide: teamSide,
      data: canvasData,
      spawnedAgents: spawnedAgents,
      createdAt: new Date().toISOString()
    };

    const updatedStrategies = [...strategies, newStrategy];
    setStrategies(updatedStrategies);
    localStorage.setItem('valmaps_strategies', JSON.stringify(updatedStrategies));
    addNotification('Strategy saved successfully!', 'success');
  };

  const handleLoadStrategy = () => {
    if (strategies.length === 0) {
      addNotification('No saved strategies found', 'warning');
      return;
    }

    // Load the most recent strategy
    const lastStrategy = strategies[strategies.length - 1];

    if (canvasRef.current && lastStrategy.data) {
      canvasRef.current.loadCanvasJSON(lastStrategy.data);
      setSelectedMap(lastStrategy.map);
      setTeamSide(lastStrategy.teamSide);
      setSpawnedAgents(lastStrategy.spawnedAgents || { blue: [], red: [] });
      addNotification(`Loaded: ${lastStrategy.name}`, 'success');
    } else {
      addNotification('Failed to load strategy', 'error');
    }
  };

  const handleShareStrategy = () => {
    if (!canvasRef.current) {
      addNotification('Canvas not ready', 'error');
      return;
    }

    // Export as image and trigger download
    const dataUrl = canvasRef.current.exportAsImage();
    if (dataUrl) {
      const link = document.createElement('a');
      link.download = `valmaps-strategy-${selectedMap}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      addNotification('Strategy exported as image!', 'success');
    } else {
      addNotification('Failed to export strategy', 'error');
    }
  };

  const handleToolChange = (tool) => {
    setSelectedTool(tool);
    
    // If switching away from agent tool, don't change selected agent
    // This allows users to keep their agent selection when switching back
  };

  const handleAgentChange = (agentId) => {
    setSelectedAgent(agentId);
  };

  const handleTeamSideChange = (side) => {
    setTeamSide(side);
  };

  // Function to add a spawned agent to the tracking
  const handleAgentSpawned = (agentId, side = teamSide) => {
    setSpawnedAgents(prev => ({
      ...prev,
      [side]: [...prev[side], agentId]
    }));
  };

  // Function to remove a spawned agent from tracking (when deleted)
  const handleAgentRemoved = (agentId, side = teamSide) => {
    setSpawnedAgents(prev => ({
      ...prev,
      [side]: prev[side].filter(id => id !== agentId)
    }));
  };

  // Function to clear all spawned agents (reset)
  const handleClearSpawnedAgents = () => {
    setSpawnedAgents({
      blue: [],
      red: []
    });
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
    addNotification('Canvas cleared', 'info');
  };

  return (
    <div className="App">
      {/* Notifications */}
      <div className="notifications-container">
        {notifications.map(n => (
          <Notification
            key={n.id}
            message={n.message}
            type={n.type}
            onClose={() => removeNotification(n.id)}
          />
        ))}
      </div>

      <header className="app-header">
        <h1>ValMaps - Strategy Planner</h1>
        <MapSelector
          selectedMap={selectedMap}
          onMapChange={setSelectedMap}
        />
      </header>

      <div className="app-content">
        <Toolbar
          selectedTool={selectedTool}
          onToolChange={handleToolChange}
          onSaveStrategy={handleSaveStrategy}
          onLoadStrategy={handleLoadStrategy}
          onShareStrategy={handleShareStrategy}
          selectedAgent={selectedAgent}
          onAgentChange={handleAgentChange}
          teamSide={teamSide}
          onTeamSideChange={handleTeamSideChange}
          spawnedAgents={spawnedAgents}
          onClearSpawnedAgents={handleClearSpawnedAgents}
          hasStrategies={strategies.length > 0}
        />

        <div className="canvas-container">
          <StrategyCanvas
            ref={canvasRef}
            mapName={selectedMap}
            selectedTool={selectedTool}
            selectedAgent={selectedAgent}
            teamSide={teamSide}
            spawnedAgents={spawnedAgents}
            onAgentSpawned={handleAgentSpawned}
            onAgentRemoved={handleAgentRemoved}
            onNotification={addNotification}
          />
        </div>
      </div>
    </div>
  );
}

export default App;