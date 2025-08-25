import React, { useState } from 'react';
import './App.css';
import StrategyCanvas from './components/Canvas/StrategyCanvas';
import Toolbar from './components/Toolbar/Toolbar';
import MapSelector from './components/MapSelector/MapSelector';

function App() {
  const [selectedMap, setSelectedMap] = useState('ascent');
  const [selectedTool, setSelectedTool] = useState('select');
  const [selectedAgent, setSelectedAgent] = useState('jett'); // Default to Jett
  const [teamSide, setTeamSide] = useState('blue'); // Default to blue (attack)
  const [strategies, setStrategies] = useState([]);
  
  // Track spawned agents per side: { blue: ['jett', 'sage'], red: ['omen', 'sova'] }
  const [spawnedAgents, setSpawnedAgents] = useState({
    blue: [],
    red: []
  });

  const handleSaveStrategy = (strategyData) => {
    const newStrategy = {
      id: Date.now(),
      name: `Strategy ${strategies.length + 1}`,
      map: selectedMap,
      teamSide: teamSide,
      data: strategyData,
      spawnedAgents: spawnedAgents,
      createdAt: new Date()
    };
    setStrategies([...strategies, newStrategy]);
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
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Strategy Planner</h1>
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
          selectedAgent={selectedAgent}
          onAgentChange={handleAgentChange}
          teamSide={teamSide}
          onTeamSideChange={handleTeamSideChange}
          spawnedAgents={spawnedAgents}
          onClearSpawnedAgents={handleClearSpawnedAgents}
        />
        
        <div className="canvas-container">
          <StrategyCanvas 
            mapName={selectedMap}
            selectedTool={selectedTool}
            selectedAgent={selectedAgent}
            teamSide={teamSide}
            spawnedAgents={spawnedAgents}
            onAgentSpawned={handleAgentSpawned}
            onAgentRemoved={handleAgentRemoved}
          />
        </div>
      </div>
    </div>
  );
}

export default App;