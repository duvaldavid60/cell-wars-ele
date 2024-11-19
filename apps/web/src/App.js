import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Board from './components/Board';
import { useTeam } from './context/TeamContext';
import TeamSelector from './components/TeamSelector';

const fetchGameInfo = async (teamId) => {
  console.log(teamId);

  const { data } = await axios.get(`http://localhost:3001/gameinfos/${teamId}`);
  return data;
};

const Home = () => {
  const { team } = useTeam();
  const { data, isLoading, error } = useQuery({
    queryKey: ['gameInfo'], // Utilisation de la clé de la requête sous forme de tableau
    queryFn: () => fetchGameInfo(team), // Fonction de récupération des données
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading game info</p>;

  return (
    <div className='app'>
      <TeamSelector /> {/* Sélecteur d'équipe */}
      <Board
        board={data.gameSession.board}
        actionsLeft={data.remainingActions}
        gameTurn={data.gameSession.gameTurn}
      />
    </div>
  );
};

export default Home;
