import React from 'react';

const ErrorPopup = ({ onClose, error }) => {
  return (
    <div className='popup'>
      <div className='popup-content'>
        <h2>{error}</h2>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ErrorPopup;
