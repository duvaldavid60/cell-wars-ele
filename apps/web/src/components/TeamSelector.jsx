import React from 'react';
import { useTeam } from '../context/TeamContext';

const TeamSelector = () => {
  const { team, changeTeam } = useTeam();

  const handleTeamChange = (event) => {
    changeTeam(Number(event.target.value));
  };

  return (
    <div className='team-selector'>
      <h3>Current Team: {team}</h3>
      <select value={team} onChange={handleTeamChange}>
        <option value={2}>Red (Team 2)</option>
        <option value={3}>Green (Team 3)</option>
        <option value={4}>Blue (Team 4)</option>
        <option value={5}>Yellow (Team 5)</option>
      </select>
    </div>
  );
};

export default TeamSelector;
