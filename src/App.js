import React, { useState } from 'react';
import './App.css';
import StrategyCanvas from './components/Canvas/StrategyCanvas';
import Toolbar from './components/Toolbar/Toolbar';
import MapSelector from './components/MapSelector/MapSelector';

function App() {
  const [selectedMap, setSelectedMap] = useState('ascent');
  const [selectedTool, setSelectedTool] = useState('move');
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
          onToolChange={setSelectedTool}
          onSaveStrategy={handleSaveStrategy}
        />
        
        <div className="canvas-container">
          <StrategyCanvas 
            mapName={selectedMap}
            selectedTool={selectedTool}
          />
        </div>
      </div>
    </div>
  );
}

export default App;