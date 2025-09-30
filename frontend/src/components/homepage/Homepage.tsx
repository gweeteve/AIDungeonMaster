import React, { useState, useCallback, useMemo } from 'react';
import { WorldCard } from '../worlds/WorldCard';
import { CreateWorldDialog } from '../worlds/CreateWorldDialog';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { WorldResponse, GameSystemResponse, CreateWorldRequest } from '../../types';

interface HomepageProps {
  worlds: WorldResponse[];
  gameSystems: GameSystemResponse[];
  onLaunchWorld: (worldId: string) => void;
  onCreateWorld: (data: CreateWorldRequest) => void;
  onAccessGameSystems: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const Homepage: React.FC<HomepageProps> = ({
  worlds,
  gameSystems,
  onLaunchWorld,
  onCreateWorld,
  onAccessGameSystems,
  isLoading = false,
  error = null,
  onRetry
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Sort worlds by last accessed date (most recent first)
  const sortedWorlds = useMemo(() => {
    return [...worlds].sort((a, b) => 
      new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()
    );
  }, [worlds]);

  const handleOpenCreateDialog = useCallback(() => {
    setCreateError(null);
    setIsCreateDialogOpen(true);
  }, []);

  const handleCloseCreateDialog = useCallback(() => {
    setIsCreateDialogOpen(false);
    setCreateError(null);
    setIsCreating(false);
  }, []);

  const handleCreateWorld = useCallback(async (data: CreateWorldRequest) => {
    try {
      setIsCreating(true);
      setCreateError(null);
      await onCreateWorld(data);
      handleCloseCreateDialog();
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Failed to create world');
    } finally {
      setIsCreating(false);
    }
  }, [onCreateWorld, handleCloseCreateDialog]);

  const handleLaunchWorld = useCallback((worldId: string) => {
    onLaunchWorld(worldId);
  }, [onLaunchWorld]);

  const activeGameSystemsCount = useMemo(() => {
    return gameSystems.filter(system => system.isActive).length;
  }, [gameSystems]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6" data-testid="homepage-container">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div 
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              data-testid="loading-spinner"
            />
            <p className="text-gray-600">Loading your worlds...</p>
          </div>
          
          {/* Skeleton cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
                data-testid="world-card-skeleton"
              >
                <div className="aspect-video bg-gray-200" />
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6" data-testid="homepage-container">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Alert variant="destructive" className="max-w-md mx-auto">
              <AlertDescription className="text-center">
                {error}
              </AlertDescription>
            </Alert>
            {onRetry && (
              <Button 
                onClick={onRetry} 
                className="mt-4"
                variant="outline"
              >
                Try Again
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="homepage-container">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Worlds</h1>
              <p className="mt-1 text-gray-600">
                {worlds.length === 0 
                  ? 'Start your adventure by creating your first world'
                  : `${worlds.length} world${worlds.length === 1 ? '' : 's'} ready for adventure`
                }
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={onAccessGameSystems}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Manage Game Systems</span>
              </Button>
              <Button 
                onClick={handleOpenCreateDialog}
                className="flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create New World</span>
              </Button>
            </div>
          </div>
          
          {/* Game Systems Info */}
          <div className="mt-4 text-sm text-gray-600">
            <span>
              {activeGameSystemsCount} game system{activeGameSystemsCount === 1 ? '' : 's'} available
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {worlds.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v1a2 2 0 002 2h4a2 2 0 012 2v1a2 2 0 01-2 2h-4a2 2 0 01-2-2V9a2 2 0 01-2-2V5" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No worlds yet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create your first world to begin your AI-powered tabletop adventure.
              Choose from our available game systems and start playing immediately.
            </p>
            <Button 
              onClick={handleOpenCreateDialog}
              size="lg"
              className="flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Your First World</span>
            </Button>
          </div>
        ) : (
          // Worlds Grid
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Adventures</h2>
              <span 
                className="text-sm text-gray-600"
                aria-label={`${worlds.length} worlds loaded`}
              >
                Sorted by recent activity
              </span>
            </div>
            
            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 responsive-grid"
              data-testid="responsive-grid"
            >
              {sortedWorlds.map((world) => (
                <WorldCard 
                  key={world.id} 
                  world={world} 
                  onLaunch={handleLaunchWorld}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create World Dialog */}
      <CreateWorldDialog
        isOpen={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        onSubmit={handleCreateWorld}
        gameSystems={gameSystems}
        isLoading={isCreating}
        error={createError}
      />

      {/* Mobile Layout Detection */}
      <div className="block md:hidden" data-testid="mobile-layout" />
    </div>
  );
};