import React, { useState, useEffect } from 'react';
import {
  AGENT_LIST,
  AGENTS,
  ROLE_ORDER,
  ABILITY_TYPES,
  TEAM_LABELS,
  agentIconPath,
  abilityFootprint,
  abilityIconPath,
} from '../../data/agents';
import './AbilitySelector.css';

const AbilitySelector = ({
  isVisible,
  selectedAbility,
  onAbilityChange,
  teamSide,
  spawnedAgents,
  defaultAgentId,
}) => {
  const [agentId, setAgentId] = useState(defaultAgentId || AGENT_LIST[0].id);

  // Follow the ability selection (e.g. restored from a loaded strategy).
  useEffect(() => {
    if (selectedAbility && AGENTS[selectedAbility.agentId]) {
      setAgentId(selectedAbility.agentId);
    }
  }, [selectedAbility]);

  if (!isVisible) return null;

  const agent = AGENTS[agentId] || AGENT_LIST[0];
  const roster = (spawnedAgents && spawnedAgents[teamSide]) || [];

  // Spawned agents on the current side first, then the rest grouped by role.
  const rosterAgents = AGENT_LIST.filter((a) => roster.includes(a.id));
  const otherAgents = ROLE_ORDER.flatMap((role) =>
    AGENT_LIST.filter((a) => a.role === role && !roster.includes(a.id))
  );

  return (
    <div className="ability-selector">
      <div className="ability-selector-header">
        <h4>Place Ability</h4>
        <div className="team-side-indicator">
          <span className={`side-badge ${teamSide}`}>
            {teamSide === 'blue' ? '🔵' : '🔴'} {TEAM_LABELS[teamSide]}
          </span>
        </div>
      </div>

      <div className="ability-selector-content">
        <label className="ability-agent-label" htmlFor="ability-agent-select">
          Agent
        </label>
        <select
          id="ability-agent-select"
          className="ability-agent-select"
          value={agent.id}
          onChange={(e) => setAgentId(e.target.value)}
        >
          {rosterAgents.length > 0 && (
            <optgroup label="On this team">
              {rosterAgents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.role})
                </option>
              ))}
            </optgroup>
          )}
          <optgroup label={rosterAgents.length > 0 ? 'All agents' : 'Agents'}>
            {otherAgents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.role})
              </option>
            ))}
          </optgroup>
        </select>

        <div className="ability-agent-preview">
          <img
            className="ability-agent-portrait"
            src={agentIconPath(agent.id)}
            alt={agent.name}
          />
          <span className="ability-agent-name" style={{ color: agent.color }}>
            {agent.name}
          </span>
        </div>

        <div className="ability-list">
          {agent.abilities.map((ability) => {
            const typeStyle = ABILITY_TYPES[ability.type] || ABILITY_TYPES.other;
            const fp = abilityFootprint(ability);
            const isSelected =
              selectedAbility &&
              selectedAbility.agentId === agent.id &&
              selectedAbility.key === ability.key;
            return (
              <button
                key={ability.key}
                className={`ability-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => onAbilityChange({ agentId: agent.id, key: ability.key })}
                style={{ '--ability-color': typeStyle.color || agent.color }}
                title={`${ability.name} (${typeStyle.label})`}
              >
                <span className="ability-key">{ability.key}</span>
                <img
                  className="ability-icon"
                  src={abilityIconPath(agent.id, ability.key)}
                  alt=""
                  onError={(e) => {
                    e.currentTarget.style.visibility = 'hidden';
                  }}
                />
                <span className="ability-info">
                  <span className="ability-name">{ability.name}</span>
                  <span className="ability-type">{typeStyle.label}</span>
                </span>
                {fp.placement === 'line' && (
                  <span className="ability-draw-tag">drag</span>
                )}
              </button>
            );
          })}
        </div>

        <p className="ability-hint">
          Click the map to drop point abilities. Walls, Cypher tripwires and Breach
          Fault Line are drag-to-place — click an origin and drag to aim.
        </p>
      </div>
    </div>
  );
};

export default AbilitySelector;
