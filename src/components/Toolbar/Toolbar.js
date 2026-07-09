import React from 'react';
import AgentSelector from '../AgentSelector/AgentSelector';
import AbilitySelector from '../AbilitySelector/AbilitySelector';
import { AGENTS, TEAM_LABELS } from '../../data/agents';
import './Toolbar.css';

const TOOLS = [
  { id: 'select', name: 'Select', icon: '↖', hint: 'Default: click to select, drag to move markers' },
  { id: 'agent', name: 'Agent', icon: '👤', hint: 'Click the map to drop the agent, then back to Select' },
  { id: 'utility', name: 'Ability', icon: '💥', hint: 'Click the map to place the ability, then back to Select' },
  { id: 'line', name: 'Arrow', icon: '➤', hint: 'Drag to draw an arrow, then back to Select' },
  { id: 'text', name: 'Text', icon: 'T', hint: 'Click to add a note, then back to Select' },
  { id: 'erase', name: 'Erase', icon: '🗑', hint: 'Click markers to delete them (stays on until you switch)' },
];

const Toolbar = ({
  selectedTool,
  onToolChange,
  onSaveStrategy,
  onOpenLoad,
  onExportPNG,
  onClearAgents,
  onClearBoard,
  selectedAgent,
  onAgentChange,
  selectedAbility,
  onAbilityChange,
  teamSide,
  onTeamSideChange,
  round,
  onRoundChange,
  spawnedAgents,
  strategyCount,
}) => {
  const getSpawnedAgentCount = (side) =>
    spawnedAgents[side] ? spawnedAgents[side].length : 0;

  const activeTool = TOOLS.find((t) => t.id === selectedTool);
  const selectedAgentData = AGENTS[selectedAgent];
  const selectedAbilityData =
    selectedAbility &&
    AGENTS[selectedAbility.agentId] &&
    AGENTS[selectedAbility.agentId].abilities.find(
      (a) => a.key === selectedAbility.key
    );

  return (
    <>
      <div className="toolbar">
        <div className="tool-section">
          <h3>Tools</h3>
          <div className="tool-grid">
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                className={`tool-btn ${selectedTool === tool.id ? 'active' : ''}`}
                onClick={() => onToolChange(tool.id)}
                title={tool.hint}
              >
                <span className="tool-icon">{tool.icon}</span>
                <span className="tool-name">{tool.name}</span>
              </button>
            ))}
          </div>

          {activeTool && <div className="tool-hint">{activeTool.hint}</div>}

          {selectedTool === 'agent' && selectedAgentData && (
            <div className="selected-agent-info">
              <div className="selected-agent-label">Selected:</div>
              <div className="selected-agent-name">{selectedAgentData.name}</div>
            </div>
          )}

          {selectedTool === 'utility' && selectedAbilityData && (
            <div className="selected-agent-info">
              <div className="selected-agent-label">Selected:</div>
              <div className="selected-agent-name">
                {AGENTS[selectedAbility.agentId].name} — {selectedAbilityData.name}
              </div>
            </div>
          )}
        </div>

        <div className="action-section">
          <h3>Actions</h3>
          <button className="action-btn save-btn" onClick={onSaveStrategy}>
            💾 Save Strategy
          </button>
          <button className="action-btn load-btn" onClick={onOpenLoad}>
            📁 Load Strategy{strategyCount > 0 ? ` (${strategyCount})` : ''}
          </button>
          <button
            className="action-btn share-btn"
            onClick={onExportPNG}
            title="Download the board as a PNG image"
          >
            📤 Export PNG
          </button>
          <button
            className="action-btn clear-btn"
            onClick={onClearAgents}
            title="Remove all placed agents"
          >
            🧹 Clear Agents
          </button>
          <button
            className="action-btn clear-btn"
            onClick={onClearBoard}
            title="Remove everything from the board"
          >
            🗑 Clear Board
          </button>
        </div>

        <div className="settings-section">
          <h3>Settings</h3>
          <div className="setting-item">
            <label htmlFor="team-side-select">Team Side:</label>
            <select
              id="team-side-select"
              className="setting-select"
              value={teamSide}
              onChange={(e) => onTeamSideChange(e.target.value)}
            >
              <option value="blue">🔵 Blue (Attack)</option>
              <option value="red">🔴 Red (Defense)</option>
            </select>
          </div>
          <div className="setting-item">
            <label htmlFor="round-select">Round:</label>
            <select
              id="round-select"
              className="setting-select"
              value={round}
              onChange={(e) => onRoundChange(e.target.value)}
            >
              <option value="pistol">Pistol</option>
              <option value="eco">Eco</option>
              <option value="buy">Buy</option>
              <option value="force">Force Buy</option>
            </select>
          </div>
        </div>

        <div className="agent-count-section">
          <h3>Spawned Agents</h3>
          <div className="agent-count-display">
            <div className="count-item">
              <span className="count-label">🔵 Attack:</span>
              <span className="count-value">{getSpawnedAgentCount('blue')}/5</span>
            </div>
            <div className="count-item">
              <span className="count-label">🔴 Defense:</span>
              <span className="count-value">{getSpawnedAgentCount('red')}/5</span>
            </div>
          </div>
          <div className="current-side-indicator">
            <strong>
              Current: {teamSide === 'blue' ? '🔵' : '🔴'} {TEAM_LABELS[teamSide]}
            </strong>
          </div>
        </div>
      </div>

      {/* Agent selector - appears when the agent tool is selected */}
      <AgentSelector
        selectedAgent={selectedAgent}
        onAgentChange={onAgentChange}
        isVisible={selectedTool === 'agent'}
        teamSide={teamSide}
        spawnedAgents={spawnedAgents}
      />

      {/* Ability selector - appears when the ability tool is selected */}
      <AbilitySelector
        isVisible={selectedTool === 'utility'}
        selectedAbility={selectedAbility}
        onAbilityChange={onAbilityChange}
        teamSide={teamSide}
        spawnedAgents={spawnedAgents}
        defaultAgentId={selectedAgent}
      />
    </>
  );
};

export default Toolbar;
