import React from 'react';

const Popup = ({ onClose, onReinforce, onMove }) => {
  return (
    <div className='popup'>
      <div className='popup-content'>
        <button onClick={onReinforce}>Reinforce</button>
        <button onClick={onMove}>Move</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Popup;
