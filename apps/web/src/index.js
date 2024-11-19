import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css'; // Global styles
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { TeamProvider } from './context/TeamContext';

// Create the React Query client
const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <QueryClientProvider client={queryClient}>
    <TeamProvider>
      <App />
    </TeamProvider>
  </QueryClientProvider>
);
