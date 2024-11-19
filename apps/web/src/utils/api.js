import axios from 'axios';

// Example API call to fetch game info
export const fetchGameInfo = async () => {
  const { data } = await axios.get('/gameinfos/teamId');
  return data;
};
