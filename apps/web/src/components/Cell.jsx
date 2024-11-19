import React from 'react';

const Cell = ({ cell, isHighlight, onClick }) => {
  const getCellColor = (teamId) => {
    switch (teamId) {
      case 1:
        return 'gray';
      case 2:
        return 'red';
      case 3:
        return 'green';
      case 4:
        return 'blue';
      case 5:
        return 'yellow';
      default:
        return 'white'; // Default color if no team
    }
  };

  return (
    <div
      onClick={onClick}
      className='cell'
      style={{
        backgroundColor: getCellColor(cell.team_id),
        color: 'black',
        width: '30px',
        height: '30px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        fontSize: '12px',
        margin: '5px',
        border: isHighlight ? '2px solid yellow' : 'none', // Surbrillance des cellules valides
      }}
    >
      {cell.units}
    </div>
  );
};

export default Cell;
