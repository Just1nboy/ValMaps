import React from 'react';
import AgentSelector from '../AgentSelector/AgentSelector';
import './Toolbar.css';

const Toolbar = ({ 
  selectedTool, 
  onToolChange, 
  onSaveStrategy, 
  selectedAgent, 
  onAgentChange,
  teamSide,
  onTeamSideChange,
  spawnedAgents,
  onClearSpawnedAgents
}) => {
  const tools = [
    { id: 'select', name: 'Select', icon: '↖' },
    { id: 'agent', name: 'Agent', icon: '👤' },
    { id: 'utility', name: 'Utility', icon: '💥' },
    { id: 'line', name: 'Line', icon: '📏' },
    { id: 'text', name: 'Text', icon: 'T' },
    { id: 'erase', name: 'Erase', icon: '🗑' }
  ];

  const getTeamSideDisplay = (side) => {
    return side === 'blue' ? '🔵 Attack' : '🔴 Defense';
  };

  const getSpawnedAgentCount = (side) => {
    return spawnedAgents[side] ? spawnedAgents[side].length : 0;
  };

  return (
    <>
      <div className="toolbar">
        <div className="tool-section">
          <h3>Tools</h3>
          <div className="tool-grid">
            {tools.map(tool => (
              <button
                key={tool.id}
                className={`tool-btn ${selectedTool === tool.id ? 'active' : ''}`}
                onClick={() => onToolChange(tool.id)}
                title={tool.name}
              >
                <span className="tool-icon">{tool.icon}</span>
                <span className="tool-name">{tool.name}</span>
              </button>
            ))}
          </div>
          
          {/* Show selected agent info when agent tool is active */}
          {selectedTool === 'agent' && selectedAgent && (
            <div className="selected-agent-info">
              <div className="selected-agent-label">Selected:</div>
              <div className="selected-agent-name">{getAgentDisplayName(selectedAgent)}</div>
            </div>
          )}
        </div>

        <div className="action-section">
          <h3>Actions</h3>
          <button className="action-btn save-btn" onClick={onSaveStrategy}>
            💾 Save Strategy
          </button>
          <button className="action-btn load-btn">
            📁 Load Strategy
          </button>
          <button className="action-btn share-btn">
            📤 Share
          </button>
          <button 
            className="action-btn clear-btn" 
            onClick={onClearSpawnedAgents}
            title="Clear all spawned agents"
          >
            🧹 Clear Agents
          </button>
        </div>

        <div className="settings-section">
          <h3>Settings</h3>
          <div className="setting-item">
            <label>Team Side:</label>
            <select 
              className="setting-select"
              value={teamSide}
              onChange={(e) => onTeamSideChange(e.target.value)}
            >
              <option value="blue">🔵 Blue (Attack)</option>
              <option value="red">🔴 Red (Defense)</option>
            </select>
          </div>
          <div className="setting-item">
            <label>Round:</label>
            <select className="setting-select">
              <option value="pistol">Pistol</option>
              <option value="eco">Eco</option>
              <option value="buy">Buy</option>
              <option value="force">Force Buy</option>
            </select>
          </div>
        </div>

        {/* Agent count display */}
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
            <strong>Current: {getTeamSideDisplay(teamSide)}</strong>
          </div>
        </div>
      </div>

      {/* Agent Selector - appears when agent tool is selected */}
      <AgentSelector 
        selectedAgent={selectedAgent}
        onAgentChange={onAgentChange}
        isVisible={selectedTool === 'agent'}
        teamSide={teamSide}
        spawnedAgents={spawnedAgents}
      />
    </>
  );
};

// Helper function to get agent display name
const getAgentDisplayName = (agentId) => {
  const agentNames = {
    jett: 'Jett',
    reyna: 'Reyna',
    phoenix: 'Phoenix',
    raze: 'Raze',
    yoru: 'Yoru',
    neon: 'Neon',
    omen: 'Omen',
    brimstone: 'Brimstone',
    viper: 'Viper',
    astra: 'Astra',
    sova: 'Sova',
    breach: 'Breach',
    skye: 'Skye',
    kayo: 'KAY/O',
    fade: 'Fade',
    sage: 'Sage',
    cypher: 'Cypher',
    killjoy: 'Killjoy',
    chamber: 'Chamber'
  };
  return agentNames[agentId] || 'Unknown Agent';
};

export default Toolbar;