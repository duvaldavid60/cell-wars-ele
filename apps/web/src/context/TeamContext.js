import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Crée un contexte
const TeamContext = createContext();

// Hook personnalisé pour accéder au contexte
export const useTeam = () => useContext(TeamContext);

// Provider pour gérer l'état de l'équipe
export const TeamProvider = ({ children }) => {
  const [team, setTeam] = useState(2); // Par défaut, équipe 1
  const queryCLient = useQueryClient();

  useEffect(() => {
    queryCLient.invalidateQueries({ queryKey: ['gameInfo'] });
  }, [team, queryCLient]);

  const changeTeam = (newTeam) => {
    setTeam(newTeam);
  };

  return (
    <TeamContext.Provider value={{ team, changeTeam }}>
      {children}
    </TeamContext.Provider>
  );
};
