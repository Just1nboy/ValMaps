import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';
import StrategyCanvas from './components/Canvas/StrategyCanvas';
import Toolbar from './components/Toolbar/Toolbar';
import MapSelector from './components/MapSelector/MapSelector';
import StrategyModal from './components/StrategyModal/StrategyModal';
import { AGENTS } from './data/agents';

const STORAGE_KEY = 'valmaps.strategies.v1';

const loadStoredStrategies = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

const EMPTY_TEAMS = { blue: [], red: [] };

function App() {
  const [selectedMap, setSelectedMap] = useState('ascent');
  const [selectedTool, setSelectedTool] = useState('select');
  const [selectedAgent, setSelectedAgent] = useState('jett');
  const [selectedAbility, setSelectedAbility] = useState(null);
  const [teamSide, setTeamSide] = useState('blue');
  const [round, setRound] = useState('buy');
  const [strategies, setStrategies] = useState(loadStoredStrategies);
  const [showLoadModal, setShowLoadModal] = useState(false);

  // Track spawned agents per side: { blue: ['jett', 'sage'], red: ['omen'] }
  const [spawnedAgents, setSpawnedAgents] = useState(EMPTY_TEAMS);

  const canvasApiRef = useRef(null);

  // Persist strategies across sessions.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(strategies));
    } catch (e) {
      console.warn('Could not persist strategies', e);
    }
  }, [strategies]);

  const handleToolChange = (tool) => {
    // Clicking the already-active tool toggles back to the default Select mode.
    if (tool === selectedTool && tool !== 'select') {
      setSelectedTool('select');
      return;
    }
    setSelectedTool(tool);
    // Give the ability tool something sensible to place right away.
    if (tool === 'utility' && !selectedAbility) {
      const agent = AGENTS[selectedAgent];
      if (agent) {
        setSelectedAbility({ agentId: agent.id, key: agent.abilities[0].key });
      }
    }
  };

  // After a one-shot placement (agent / ability / arrow / note) the canvas hands
  // control back to Select mode, so the next click drags instead of placing again.
  const handleReturnToSelect = useCallback(() => {
    setSelectedTool('select');
  }, []);

  // Escape always drops back to Select mode.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      setSelectedTool('select');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleAgentSpawned = useCallback((agentId, side) => {
    setSpawnedAgents((prev) => {
      const roster = prev[side] || [];
      if (roster.includes(agentId)) return prev;
      return { ...prev, [side]: [...roster, agentId] };
    });
  }, []);

  const handleAgentRemoved = useCallback((agentId, side) => {
    setSpawnedAgents((prev) => ({
      ...prev,
      [side]: (prev[side] || []).filter((id) => id !== agentId),
    }));
  }, []);

  const handleSaveStrategy = () => {
    const api = canvasApiRef.current;
    if (!api) return;
    const data = api.getState();
    if (!data) return;
    const name = window.prompt('Strategy name:', `Strategy ${strategies.length + 1}`);
    if (!name) return;
    const newStrategy = {
      id: Date.now(),
      name: name.trim(),
      map: selectedMap,
      round,
      teamSide,
      spawnedAgents,
      canvas: data,
      createdAt: new Date().toISOString(),
    };
    setStrategies((prev) => [newStrategy, ...prev]);
  };

  const handleLoadStrategy = async (strategy) => {
    const api = canvasApiRef.current;
    if (!api) return;
    setSelectedMap(strategy.map);
    setRound(strategy.round || 'buy');
    if (strategy.teamSide) setTeamSide(strategy.teamSide);
    const spawned = await api.loadState(strategy.canvas);
    setSpawnedAgents(spawned || EMPTY_TEAMS);
    setShowLoadModal(false);
  };

  const handleDeleteStrategy = (id) => {
    setStrategies((prev) => prev.filter((s) => s.id !== id));
  };

  const handleExportPNG = () => {
    canvasApiRef.current?.exportPNG(`valmaps-${selectedMap}`);
  };

  const handleClearAgents = () => {
    canvasApiRef.current?.clearAgents();
    setSpawnedAgents(EMPTY_TEAMS);
  };

  const handleClearBoard = () => {
    canvasApiRef.current?.clearBoard();
    setSpawnedAgents(EMPTY_TEAMS);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>ValMaps — Strategy Planner</h1>
        <MapSelector selectedMap={selectedMap} onMapChange={setSelectedMap} />
      </header>

      <div className="app-content">
        <Toolbar
          selectedTool={selectedTool}
          onToolChange={handleToolChange}
          onSaveStrategy={handleSaveStrategy}
          onOpenLoad={() => setShowLoadModal(true)}
          onExportPNG={handleExportPNG}
          onClearAgents={handleClearAgents}
          onClearBoard={handleClearBoard}
          selectedAgent={selectedAgent}
          onAgentChange={setSelectedAgent}
          selectedAbility={selectedAbility}
          onAbilityChange={setSelectedAbility}
          teamSide={teamSide}
          onTeamSideChange={setTeamSide}
          round={round}
          onRoundChange={setRound}
          spawnedAgents={spawnedAgents}
          strategyCount={strategies.length}
        />

        <div className="canvas-area">
          <StrategyCanvas
            ref={canvasApiRef}
            mapName={selectedMap}
            selectedTool={selectedTool}
            selectedAgent={selectedAgent}
            selectedAbility={selectedAbility}
            teamSide={teamSide}
            spawnedAgents={spawnedAgents}
            onAgentSpawned={handleAgentSpawned}
            onAgentRemoved={handleAgentRemoved}
            onReturnToSelect={handleReturnToSelect}
          />
        </div>
      </div>

      {showLoadModal && (
        <StrategyModal
          strategies={strategies}
          onLoad={handleLoadStrategy}
          onDelete={handleDeleteStrategy}
          onClose={() => setShowLoadModal(false)}
        />
      )}
    </div>
  );
}

export default App;
