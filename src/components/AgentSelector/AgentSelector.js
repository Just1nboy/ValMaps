import React from 'react';
import {
  AGENT_LIST,
  ROLE_ORDER,
  TEAM_LABELS,
  agentIconPath,
} from '../../data/agents';
import './AgentSelector.css';

const AgentSelector = ({ selectedAgent, onAgentChange, isVisible, teamSide, spawnedAgents }) => {
  if (!isVisible) return null;

  const groupedAgents = ROLE_ORDER.reduce((acc, role) => {
    acc[role] = AGENT_LIST.filter((agent) => agent.role === role);
    return acc;
  }, {});

  // Check if an agent is already spawned on the current team side
  const isAgentSpawned = (agentId) => {
    if (!spawnedAgents || !spawnedAgents[teamSide]) return false;
    return spawnedAgents[teamSide].includes(agentId);
  };

  const handleAgentClick = (agentId) => {
    if (isAgentSpawned(agentId)) return;
    onAgentChange(agentId);
  };

  return (
    <div className="agent-selector visible">
      <div className="agent-selector-header">
        <h4>Select Agent</h4>
        <div className="team-side-indicator">
          <span className={`side-badge ${teamSide}`}>
            {teamSide === 'blue' ? '🔵' : '🔴'} {TEAM_LABELS[teamSide]}
          </span>
        </div>
      </div>
      <div className="agent-selector-content">
        {ROLE_ORDER.map((role) => (
          <div key={role} className="agent-role-section">
            <div className="role-header">
              <span className={`role-badge role-${role.toLowerCase()}`}>{role}</span>
            </div>
            <div className="agent-grid">
              {groupedAgents[role].map((agent) => {
                const isSpawned = isAgentSpawned(agent.id);
                return (
                  <button
                    key={agent.id}
                    className={`agent-btn ${selectedAgent === agent.id ? 'selected' : ''} ${
                      isSpawned ? 'disabled' : ''
                    }`}
                    onClick={() => handleAgentClick(agent.id)}
                    disabled={isSpawned}
                    style={{ '--agent-color': agent.color }}
                    title={
                      isSpawned
                        ? `${agent.name} (${agent.role}) - Already spawned on ${TEAM_LABELS[teamSide]}`
                        : `${agent.name} (${agent.role})`
                    }
                  >
                    <img
                      className="agent-portrait"
                      src={agentIconPath(agent.id)}
                      alt=""
                      draggable={false}
                    />
                    <span className="agent-name">{agent.name}</span>
                    {isSpawned && <span className="agent-status">✕</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentSelector;
