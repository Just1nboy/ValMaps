import React from 'react';
import './MapSelector.css';

const MapSelector = ({ selectedMap, onMapChange }) => {
  const maps = [
    { id: 'ascent', name: 'Ascent', thumbnail: '/assets/maps/ascent_thumb.jpg' },
    { id: 'bind', name: 'Bind', thumbnail: '/assets/maps/bind_thumb.jpg' },
    { id: 'haven', name: 'Haven', thumbnail: '/assets/maps/haven_thumb.jpg' },
    { id: 'split', name: 'Split', thumbnail: '/assets/maps/split_thumb.jpg' },
    { id: 'icebox', name: 'Icebox', thumbnail: '/assets/maps/icebox_thumb.jpg' },
    { id: 'breeze', name: 'Breeze', thumbnail: '/assets/maps/breeze_thumb.jpg' }
  ];

  return (
    <div className="map-selector">
      <label htmlFor="map-select">Select Map:</label>
      <select 
        id="map-select"
        value={selectedMap} 
        onChange={(e) => onMapChange(e.target.value)}
        className="map-dropdown"
      >
        {maps.map(map => (
          <option key={map.id} value={map.id}>
            {map.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MapSelector;