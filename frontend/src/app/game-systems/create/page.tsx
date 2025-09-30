'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateGameSystemForm } from '@/components/game-systems/create-form';
import { CreateGameSystemRequest } from '@/types/game-system.types';
import { gameSystemService } from '@/services/game-system.service';

export default function CreateGameSystemPage(): JSX.Element {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (data: CreateGameSystemRequest): Promise<void> => {
    try {
      setCreating(true);
      const newSystem = await gameSystemService.createGameSystem(data);
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
    router.push('/game-systems');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <CreateGameSystemForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={creating}
      />
    </div>
  );
}