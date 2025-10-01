import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Homepage } from '../components/homepage/Homepage';
import { useWorlds, useGameSystems, useCreateWorld, useLaunchWorld } from '../hooks';
import { CreateWorldRequest } from '../types';

// Query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

const HomepageContainer: React.FC = () => {
  const router = useRouter();
  
  // Data fetching hooks
  const { 
    data: worlds = [], 
    isLoading: isLoadingWorlds, 
    error: worldsError,
    refetch: refetchWorlds 
  } = useWorlds();
  
  const { 
    data: gameSystems = [], 
    isLoading: isLoadingGameSystems, 
    error: gameSystemsError 
  } = useGameSystems();

  // Mutation hooks
  const createWorldMutation = useCreateWorld();
  const launchWorldMutation = useLaunchWorld();

  // Event handlers
  const handleLaunchWorld = useCallback(async (worldId: string) => {
    try {
      const launchResponse = await launchWorldMutation.mutateAsync(worldId);
      
      // Navigate to the launched world
      await router.push(launchResponse.launchUrl);
    } catch (error) {
      console.error('Failed to launch world:', error);
      // Error handling could be improved with toast notifications
    }
  }, [launchWorldMutation, router]);

  const handleCreateWorld = useCallback(async (data: CreateWorldRequest) => {
    try {
      const newWorld = await createWorldMutation.mutateAsync(data);
      
      // Launch the newly created world immediately
      const launchResponse = await launchWorldMutation.mutateAsync(newWorld.id);
      
      // Navigate to the new world
      await router.push(launchResponse.launchUrl);
    } catch (error) {
      console.error('Failed to create world:', error);
      throw error; // Let the dialog handle the error display
    }
  }, [createWorldMutation, launchWorldMutation, router]);

  const handleAccessGameSystems = useCallback(() => {
    router.push('/game-systems');
  }, [router]);

  const handleRetry = useCallback(() => {
    refetchWorlds();
  }, [refetchWorlds]);

  // Loading and error states
  const isLoading = isLoadingWorlds || isLoadingGameSystems;
  const error = worldsError?.message || gameSystemsError?.message || null;

  return (
    <Homepage
      worlds={worlds}
      gameSystems={gameSystems}
      onLaunchWorld={handleLaunchWorld}
      onCreateWorld={handleCreateWorld}
      onAccessGameSystems={handleAccessGameSystems}
      isLoading={isLoading}
      error={error}
      onRetry={handleRetry}
    />
  );
};

const IndexPage: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HomepageContainer />
    </QueryClientProvider>
  );
};

export default IndexPage;