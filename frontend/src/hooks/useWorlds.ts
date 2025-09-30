import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WorldResponse, CreateWorldRequest, LaunchResponse } from '../types';

// API functions
const fetchWorlds = async (): Promise<WorldResponse[]> => {
  const response = await fetch('/api/worlds');
  if (!response.ok) {
    throw new Error('Failed to fetch worlds');
  }
  return response.json();
};

const createWorld = async (data: CreateWorldRequest): Promise<WorldResponse> => {
  const response = await fetch('/api/worlds', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create world');
  }
  
  return response.json();
};

const launchWorld = async (worldId: string): Promise<LaunchResponse> => {
  const response = await fetch(`/api/worlds/${worldId}/launch`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to launch world');
  }
  
  return response.json();
};

// Custom hooks
export const useWorlds = () => {
  return useQuery({
    queryKey: ['worlds'],
    queryFn: fetchWorlds,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};

export const useCreateWorld = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createWorld,
    onSuccess: (newWorld) => {
      // Update the worlds cache with the new world
      queryClient.setQueryData(['worlds'], (oldWorlds: WorldResponse[] = []) => {
        return [newWorld, ...oldWorlds];
      });
      
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['worlds'] });
    },
  });
};

export const useLaunchWorld = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: launchWorld,
    onSuccess: (launchResponse) => {
      // Update the lastAccessedAt for the launched world
      queryClient.setQueryData(['worlds'], (oldWorlds: WorldResponse[] = []) => {
        return oldWorlds.map(world => 
          world.id === launchResponse.worldId
            ? { ...world, lastAccessedAt: launchResponse.lastAccessedAt }
            : world
        );
      });
    },
  });
};