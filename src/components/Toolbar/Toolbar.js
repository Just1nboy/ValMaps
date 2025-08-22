import React from 'react';
import './Toolbar.css';

const Toolbar = ({ selectedTool, onToolChange, onSaveStrategy }) => {
  const tools = [
    { id: 'select', name: 'Select', icon: '↖' },
    { id: 'agent', name: 'Agent', icon: '👤' },
    { id: 'utility', name: 'Utility', icon: '💥' },
    { id: 'line', name: 'Line', icon: '📏' },
    { id: 'text', name: 'Text', icon: 'T' },
    { id: 'erase', name: 'Erase', icon: '🗑' }
  ];

  return (
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
      </div>

      <div className="settings-section">
        <h3>Settings</h3>
        <div className="setting-item">
          <label>Team Color:</label>
          <select className="setting-select">
            <option value="blue">Blue (Attack)</option>
            <option value="red">Red (Defense)</option>
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
    </div>
  );
};

export default Toolbar;