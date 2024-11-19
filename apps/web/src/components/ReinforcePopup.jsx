import React, { useRef, useState } from 'react';

const ReinforcePopup = ({ cellId, onClose, handleReinforce }) => {
  const unitRef = useRef(null);

  return (
    <div className='popup'>
      <div className='popup-content'>
        <h2>Reinforce Cell</h2>
        <input type='number' min='1' max='100' ref={unitRef} />
        <button
          onClick={() => {
            handleReinforce(unitRef.current.value);
          }}
        >
          Reinforce
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ReinforcePopup;
