import React from 'react';
import { MAPS } from '../../data/maps';
import './MapSelector.css';

const MapSelector = ({ selectedMap, onMapChange }) => {
  return (
    <div className="map-selector">
      <label htmlFor="map-select">Select Map:</label>
      <select
        id="map-select"
        value={selectedMap}
        onChange={(e) => onMapChange(e.target.value)}
        className="map-dropdown"
      >
        {MAPS.map((map) => (
          <option key={map.id} value={map.id}>
            {map.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MapSelector;
