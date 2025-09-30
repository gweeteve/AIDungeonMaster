import { useQuery } from '@tanstack/react-query';
import { GameSystemResponse } from '../types';

// API function
const fetchGameSystems = async (): Promise<GameSystemResponse[]> => {
  const response = await fetch('/api/game-systems');
  if (!response.ok) {
    throw new Error('Failed to fetch game systems');
  }
  return response.json();
};

// Custom hook
export const useGameSystems = () => {
  return useQuery({
    queryKey: ['game-systems'],
    queryFn: fetchGameSystems,
    staleTime: 300000, // 5 minutes (game systems change less frequently)
    refetchOnWindowFocus: false,
  });
};