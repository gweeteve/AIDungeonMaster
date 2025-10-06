import React, { useState } from 'react';
import { GameSystem } from '@/types/game-system.types';
import { GameSystemCard } from './game-system-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search } from 'lucide-react';

interface GameSystemListProps {
  gameSystems: GameSystem[];
  loading?: boolean;
  onGameSystemSelect?: (gameSystem: GameSystem) => void;
  onCreateNew?: () => void;
  onEdit?: (gameSystem: GameSystem) => void;
  onDelete?: (gameSystem: GameSystem) => void;
  onDerive?: (gameSystem: GameSystem) => void;
  currentUserId?: string;
  selectedSystemId?: string;
}

export function GameSystemList({
  gameSystems,
  loading = false,
  onGameSystemSelect,
  onCreateNew,
  onEdit,
  onDelete,
  onDerive,
  currentUserId,
  selectedSystemId,
}: GameSystemListProps): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'owned' | 'derived'>(
    'all'
  );

  const normalizedSearch = searchTerm.toLowerCase();

  const filteredSystems = gameSystems.filter((system) => {
    const matchesSearch =
      system.name.toLowerCase().includes(normalizedSearch) ||
      Boolean(system.description?.toLowerCase().includes(normalizedSearch));

    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'owned' && system.ownerId === currentUserId) ||
      (filterType === 'derived' && system.parentSystemId);

    return matchesSearch && matchesFilter;
  });

  const renderSkeleton = (): React.JSX.Element[] => {
    return Array.from({ length: 6 }, (_, index) => (
      <div key={index} className='space-y-3'>
        <Skeleton className='h-[200px] w-full rounded-lg' />
      </div>
    ));
  };

  const renderEmptyState = (): React.JSX.Element => {
    if (searchTerm || filterType !== 'all') {
      return (
        <div className='col-span-full flex flex-col items-center justify-center py-12 text-center'>
          <Search className='h-12 w-12 text-muted-foreground mb-4' />
          <h3 className='text-lg font-semibold text-foreground mb-2'>
            No systems found
          </h3>
          <p className='text-muted-foreground max-w-md'>
            Try adjusting your search or filter criteria to find what you’re
            looking for.
          </p>
          <Button
            variant='outline'
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
            }}
            className='mt-4'
          >
            Clear filters
          </Button>
        </div>
      );
    }

    return (
      <div className='col-span-full flex flex-col items-center justify-center py-12 text-center'>
        <div className='rounded-full bg-muted p-6 mb-4'>
          <Plus className='h-12 w-12 text-muted-foreground' />
        </div>
        <h3 className='text-lg font-semibold text-foreground mb-2'>
          No game systems yet
        </h3>
        <p className='text-muted-foreground max-w-md mb-6'>
          Get started by creating your first game system. You can build from
          scratch or derive from an existing system.
        </p>
        {onCreateNew && (
          <Button onClick={onCreateNew}>
            <Plus className='h-4 w-4 mr-2' />
            Create Game System
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center'>
        <div>
          <h1 className='text-2xl font-bold'>Game Systems</h1>
          <p className='text-muted-foreground'>
            Manage your RPG systems and rulesets
          </p>
        </div>

        {onCreateNew && (
          <Button onClick={onCreateNew}>
            <Plus className='h-4 w-4 mr-2' />
            Create System
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <input
            type='text'
            placeholder='Search game systems...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
          />
        </div>

        <div className='flex gap-2'>
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setFilterType('all')}
          >
            All
          </Button>
          <Button
            variant={filterType === 'owned' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setFilterType('owned')}
          >
            My Systems
          </Button>
          <Button
            variant={filterType === 'derived' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setFilterType('derived')}
          >
            Derived
          </Button>
        </div>
      </div>

      {/* System Count */}
      {!loading && (
        <div className='text-sm text-muted-foreground'>
          {filteredSystems.length} system
          {filteredSystems.length !== 1 ? 's' : ''} found
        </div>
      )}

      {/* Systems Grid */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {loading && renderSkeleton()}

        {!loading && filteredSystems.length === 0 && renderEmptyState()}

        {!loading &&
          filteredSystems.map((system) => (
            <GameSystemCard
              key={system.id}
              gameSystem={system}
              onSelect={onGameSystemSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onDerive={onDerive}
              currentUserId={currentUserId}
              isSelected={system.id === selectedSystemId}
            />
          ))}
      </div>
    </div>
  );
}
