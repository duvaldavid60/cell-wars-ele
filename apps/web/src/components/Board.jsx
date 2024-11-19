import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Cell from './Cell';
import Popup from './Popup';
import ReinforcePopup from './ReinforcePopup';
import { useTeam } from '../context/TeamContext';
import ErrorPopup from './ErrorPopup';

const ACTION = {
  NOTHING: 0,
  SELECTED: 1,
  REINFORCED: 2,
  MOVE: 3,
};

const fetchIsValidCells = async (cellId) => {
  const { data } = await axios.get(
    `http://localhost:3001/getValidCells/${cellId}`
  );
  return data;
};

const reinforcedCell = async ({ team, cellId, units }) => {
  const response = await axios.post(
    `http://localhost:3001/reinforcement/${team}`,
    {
      cellId,
      units,
    }
  );
  return response.data;
};

const move = async ({ team, cellFromId, cellToId }) => {
  const response = await axios.post(`http://localhost:3001/move/${team}`, {
    cellFromId,
    cellToId,
  });
  return response.data;
};

const Board = ({ board, actionsLeft, gameTurn }) => {
  const { team } = useTeam();
  const [selectedCell, setSelectedCell] = useState(null);
  const [action, setAction] = useState(ACTION.NOTHING);
  const [highlightedCells, setHighlightCells] = useState([]);
  const [error, setError] = useState(null);

  const queryCLient = useQueryClient();

  const reinforcedMutation = useMutation({
    mutationFn: reinforcedCell,
    onSuccess: () => {
      queryCLient.invalidateQueries({ queryKey: ['gameInfo'] });
      handleReset();
    },
    onError: (e) => {
      handleReset();
      console.log(e);
      if (e?.response?.data?.message) {
        setError(e?.response?.data?.message);
      } else {
        setError('Une erreur est survenue');
      }
    },
  });

  const moveMutation = useMutation({
    mutationFn: move,
    onSuccess: () => {
      queryCLient.invalidateQueries({ queryKey: ['gameInfo'] });
      handleReset();
    },
    onError: (e) => {
      handleReset();
      console.log(e);
      if (e?.response?.data?.message) {
        setError(e?.response?.data?.message);
      } else {
        setError('Une erreur est survenue');
      }
    },
  });

  // Handle cell click to show popup
  const handleCellClick = (cellId) => {
    if (action !== ACTION.MOVE) {
      setSelectedCell(cellId);
      setAction(ACTION.SELECTED);
    } else {
      moveMutation.mutate({
        team,
        cellFromId: selectedCell,
        cellToId: cellId,
      });
    }
  };

  const handleReinforceClick = () => {
    setAction(ACTION.REINFORCED);
  };

  const handleMoveClick = async () => {
    setAction(ACTION.MOVE);
    const x = await fetchIsValidCells(selectedCell);
    if (x.adjacentCellIds) {
      setHighlightCells(x.adjacentCellIds);
    }
  };

  const handleReset = () => {
    setSelectedCell(null);
    setAction(ACTION.NOTHING);
    setHighlightCells([]);
    setError(null);
  };

  const handleReinforce = (units) => {
    reinforcedMutation.mutate({
      team,
      cellId: selectedCell,
      units,
    });
  };

  return (
    <div>
      <div>
        <span>Actions Left: {actionsLeft}</span>
        <span>Game Turn: {gameTurn}</span>
      </div>
      <div className='board'>
        {board.map((cell, index) => (
          <Cell
            key={index}
            cell={cell}
            onClick={() => {
              handleCellClick(cell.id);
            }}
            isHighlight={highlightedCells.includes(cell.id)}
          />
        ))}
      </div>
      {selectedCell && action === ACTION.SELECTED && (
        <Popup
          onReinforce={handleReinforceClick}
          onMove={handleMoveClick}
          onClose={handleReset} // Close popup
        />
      )}
      {selectedCell && action === ACTION.REINFORCED && (
        <ReinforcePopup
          cellId={selectedCell}
          onClose={handleReset}
          handleReinforce={handleReinforce}
        />
      )}
      {error && <ErrorPopup onClose={handleReset} error={error} />}
    </div>
  );
};

export default Board;
