import React from 'react';
import { MAPS } from '../../data/maps';
import './StrategyModal.css';

const ROUND_LABELS = {
  pistol: 'Pistol',
  eco: 'Eco',
  buy: 'Buy',
  force: 'Force Buy',
};

const StrategyModal = ({ strategies, onLoad, onDelete, onClose }) => {
  const mapName = (id) => {
    const map = MAPS.find((m) => m.id === id);
    return map ? map.name : id;
  };

  return (
    <div className="strategy-modal-overlay" onClick={onClose}>
      <div className="strategy-modal" onClick={(e) => e.stopPropagation()}>
        <div className="strategy-modal-header">
          <h3>Saved Strategies</h3>
          <button className="strategy-modal-close" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        {strategies.length === 0 ? (
          <div className="strategy-modal-empty">
            No saved strategies yet. Build a play and hit 💾 Save Strategy.
          </div>
        ) : (
          <ul className="strategy-list">
            {strategies.map((s) => (
              <li key={s.id} className="strategy-row">
                <div className="strategy-row-info">
                  <span className="strategy-row-name">{s.name}</span>
                  <span className="strategy-row-meta">
                    {mapName(s.map)} · {ROUND_LABELS[s.round] || s.round} ·{' '}
                    {new Date(s.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="strategy-row-actions">
                  <button className="strategy-row-btn load" onClick={() => onLoad(s)}>
                    Load
                  </button>
                  <button
                    className="strategy-row-btn delete"
                    onClick={() => onDelete(s.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StrategyModal;
