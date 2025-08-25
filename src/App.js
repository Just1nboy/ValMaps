import React, { useState } from 'react';
import './App.css';
import StrategyCanvas from './components/Canvas/StrategyCanvas';
import Toolbar from './components/Toolbar/Toolbar';
import MapSelector from './components/MapSelector/MapSelector';

function App() {
  const [selectedMap, setSelectedMap] = useState('ascent');
  const [selectedTool, setSelectedTool] = useState('select');
  const [selectedAgent, setSelectedAgent] = useState('jett'); // Default to Jett
  const [strategies, setStrategies] = useState([]);

  const handleSaveStrategy = (strategyData) => {
    const newStrategy = {
      id: Date.now(),
      name: `Strategy ${strategies.length + 1}`,
      map: selectedMap,
      data: strategyData,
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
        />
        
        <div className="canvas-container">
          <StrategyCanvas 
            mapName={selectedMap}
            selectedTool={selectedTool}
            selectedAgent={selectedAgent}
          />
        </div>
      </div>
    </div>
  );
}

export default App;