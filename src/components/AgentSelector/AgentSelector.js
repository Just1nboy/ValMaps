import React from 'react';
import './AgentSelector.css';

const AgentSelector = ({ selectedAgent, onAgentChange, isVisible, teamSide, spawnedAgents }) => {
  if (!isVisible) return null;

  const agents = [
    // Duelists
    { 
      id: 'jett', 
      name: 'Jett', 
      role: 'Duelist', 
      color: '#00F5FF',
      icon: '🌪️'
    },
    { 
      id: 'reyna', 
      name: 'Reyna', 
      role: 'Duelist', 
      color: '#8A2BE2',
      icon: '👁️'
    },
    { 
      id: 'phoenix', 
      name: 'Phoenix', 
      role: 'Duelist', 
      color: '#FF4500',
      icon: '🔥'
    },
    { 
      id: 'raze', 
      name: 'Raze', 
      role: 'Duelist', 
      color: '#FF6B35',
      icon: '💥'
    },
    { 
      id: 'yoru', 
      name: 'Yoru', 
      role: 'Duelist', 
      color: '#4169E1',
      icon: '👻'
    },
    { 
      id: 'neon', 
      name: 'Neon', 
      role: 'Duelist', 
      color: '#00FFFF',
      icon: '⚡'
    },

    // Controllers
    { 
      id: 'omen', 
      name: 'Omen', 
      role: 'Controller', 
      color: '#483D8B',
      icon: '👤'
    },
    { 
      id: 'brimstone', 
      name: 'Brimstone', 
      role: 'Controller', 
      color: '#8B4513',
      icon: '🚬'
    },
    { 
      id: 'viper', 
      name: 'Viper', 
      role: 'Controller', 
      color: '#32CD32',
      icon: '🐍'
    },
    { 
      id: 'astra', 
      name: 'Astra', 
      role: 'Controller', 
      color: '#9370DB',
      icon: '⭐'
    },

    // Initiators
    { 
      id: 'sova', 
      name: 'Sova', 
      role: 'Initiator', 
      color: '#4682B4',
      icon: '🏹'
    },
    { 
      id: 'breach', 
      name: 'Breach', 
      role: 'Initiator', 
      color: '#FF8C00',
      icon: '💪'
    },
    { 
      id: 'skye', 
      name: 'Skye', 
      role: 'Initiator', 
      color: '#228B22',
      icon: '🦅'
    },
    { 
      id: 'kayo', 
      name: 'KAY/O', 
      role: 'Initiator', 
      color: '#708090',
      icon: '🤖'
    },
    { 
      id: 'fade', 
      name: 'Fade', 
      role: 'Initiator', 
      color: '#2F4F4F',
      icon: '🌙'
    },

    // Sentinels
    { 
      id: 'sage', 
      name: 'Sage', 
      role: 'Sentinel', 
      color: '#00CED1',
      icon: '🧘'
    },
    { 
      id: 'cypher', 
      name: 'Cypher', 
      role: 'Sentinel', 
      color: '#FFD700',
      icon: '📷'
    },
    { 
      id: 'killjoy', 
      name: 'Killjoy', 
      role: 'Sentinel', 
      color: '#FF1493',
      icon: '⚙️'
    },
    { 
      id: 'chamber', 
      name: 'Chamber', 
      role: 'Sentinel', 
      color: '#DAA520',
      icon: '🎯'
    }
  ];

  const roleOrder = ['Duelist', 'Controller', 'Initiator', 'Sentinel'];
  const groupedAgents = roleOrder.reduce((acc, role) => {
    acc[role] = agents.filter(agent => agent.role === role);
    return acc;
  }, {});

  // Check if an agent is already spawned on the current team side
  const isAgentSpawned = (agentId) => {
    if (!spawnedAgents || !spawnedAgents[teamSide]) return false;
    return spawnedAgents[teamSide].includes(agentId);
  };

  const handleAgentClick = (agentId) => {
    if (isAgentSpawned(agentId)) {
      // Agent already spawned, don't allow selection
      return;
    }
    onAgentChange(agentId);
  };

  return (
    <div className={`agent-selector ${isVisible ? 'visible' : ''}`}>
      <div className="agent-selector-header">
        <h4>Select Agent</h4>
        <div className="team-side-indicator">
          <span className={`side-badge ${teamSide}`}>
            {teamSide === 'blue' ? '🔵 Attack' : '🔴 Defense'}
          </span>
        </div>
      </div>
      <div className="agent-selector-content">
        {roleOrder.map(role => (
          <div key={role} className="agent-role-section">
            <div className="role-header">
              <span className={`role-badge role-${role.toLowerCase()}`}>
                {role}
              </span>
            </div>
            <div className="agent-grid">
              {groupedAgents[role].map(agent => {
                const isSpawned = isAgentSpawned(agent.id);
                return (
                  <button
                    key={agent.id}
                    className={`agent-btn ${selectedAgent === agent.id ? 'selected' : ''} ${isSpawned ? 'disabled' : ''}`}
                    onClick={() => handleAgentClick(agent.id)}
                    disabled={isSpawned}
                    style={{
                      '--agent-color': agent.color
                    }}
                    title={isSpawned ? 
                      `${agent.name} (${agent.role}) - Already spawned on ${teamSide === 'blue' ? 'Attack' : 'Defense'}` :
                      `${agent.name} (${agent.role})`
                    }
                  >
                    <span className="agent-icon">{agent.icon}</span>
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