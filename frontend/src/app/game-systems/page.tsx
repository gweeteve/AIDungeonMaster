'use client';

import React, { useState, useEffect } from 'react';
import { GameSystemList } from '@/components/game-systems/game-system-list';
import { CreateGameSystemForm } from '@/components/game-systems/create-form';
import { GameSystem, CreateGameSystemRequest } from '@/types/game-system.types';
import { gameSystemService } from '@/services/game-system.service';
import { useRouter } from 'next/navigation';

type ViewMode = 'list' | 'create' | 'derive';

interface PageState {
  mode: ViewMode;
  parentSystem?: GameSystem;
}

export default function GameSystemsPage(): React.JSX.Element {
  const router = useRouter();
  const [gameSystems, setGameSystems] = useState<GameSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageState, setPageState] = useState<PageState>({ mode: 'list' });
  const [creating, setCreating] = useState(false);

  const currentUserId = 'mock-user-id'; // TODO: Get from auth context

  useEffect(() => {
    loadGameSystems();
  }, []);

  const loadGameSystems = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await gameSystemService.getGameSystems({ limit: 100 });
      setGameSystems(response.data);
    } catch (error) {
      console.error('Failed to load game systems:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = (): void => {
    setPageState({ mode: 'create' });
  };

  const handleDerive = (parentSystem: GameSystem): void => {
    setPageState({ mode: 'derive', parentSystem });
  };

  const handleGameSystemSelect = (gameSystem: GameSystem): void => {
    router.push(`/game-systems/${gameSystem.id}`);
  };

  const handleEdit = (gameSystem: GameSystem): void => {
    router.push(`/game-systems/${gameSystem.id}/edit`);
  };

  const handleDelete = async (gameSystem: GameSystem): Promise<void> => {
    if (!confirm(`Are you sure you want to delete "${gameSystem.name}"?`)) {
      return;
    }

    try {
      await gameSystemService.deleteGameSystem(gameSystem.id);
      await loadGameSystems(); // Refresh the list
      // TODO: Show success toast
    } catch (error) {
      console.error('Failed to delete game system:', error);
      // TODO: Show error toast
    }
  };

  const handleCreateSubmit = async (
    data: CreateGameSystemRequest
  ): Promise<void> => {
    try {
      setCreating(true);
      const newSystem = await gameSystemService.createGameSystem(data);
      await loadGameSystems(); // Refresh the list
      setPageState({ mode: 'list' });
      // TODO: Show success toast
      router.push(`/game-systems/${newSystem.id}`);
    } catch (error) {
      console.error('Failed to create game system:', error);
      // TODO: Show error toast
      throw error; // Let the form handle the error display
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = (): void => {
    setPageState({ mode: 'list' });
  };

  if (pageState.mode === 'create') {
    return (
      <div className='container mx-auto px-4 py-8'>
        <CreateGameSystemForm
          onSubmit={handleCreateSubmit}
          onCancel={handleCancel}
          loading={creating}
        />
      </div>
    );
  }

  if (pageState.mode === 'derive' && pageState.parentSystem) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <CreateGameSystemForm
          onSubmit={handleCreateSubmit}
          onCancel={handleCancel}
          parentSystem={pageState.parentSystem}
          loading={creating}
        />
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <GameSystemList
        gameSystems={gameSystems}
        loading={loading}
        onGameSystemSelect={handleGameSystemSelect}
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDerive={handleDerive}
        currentUserId={currentUserId}
      />
    </div>
  );
}
