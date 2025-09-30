import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameSystem } from '@/types/game-system.types';
import { Clock, Lock, Users, FileText, Settings, Trash2 } from 'lucide-react';

interface GameSystemCardProps {
  gameSystem: GameSystem;
  onEdit?: (gameSystem: GameSystem) => void;
  onDelete?: (gameSystem: GameSystem) => void;
  onDerive?: (gameSystem: GameSystem) => void;
  onSelect?: (gameSystem: GameSystem) => void;
  isSelected?: boolean;
  currentUserId?: string;
}

export function GameSystemCard({
  gameSystem,
  onEdit,
  onDelete,
  onDerive,
  onSelect,
  isSelected = false,
  currentUserId,
}: GameSystemCardProps): JSX.Element {
  const isLocked = gameSystem.editLockUserId && 
    gameSystem.editLockExpiresAt && 
    new Date(gameSystem.editLockExpiresAt) > new Date();

  const isLockedByCurrentUser = isLocked && gameSystem.editLockUserId === currentUserId;

  const handleCardClick = (): void => {
    if (onSelect) {
      onSelect(gameSystem);
    }
  };

  const handleEdit = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(gameSystem);
    }
  };

  const handleDelete = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(gameSystem);
    }
  };

  const handleDerive = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (onDerive) {
      onDerive(gameSystem);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{gameSystem.name}</CardTitle>
            {gameSystem.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {gameSystem.description}
              </CardDescription>
            )}
          </div>
          {gameSystem.imageUrl && (
            <img
              src={gameSystem.imageUrl}
              alt={gameSystem.name}
              className="ml-3 h-12 w-12 rounded-md object-cover"
            />
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {gameSystem.parentSystemId && (
            <Badge variant="secondary">
              Derived System
            </Badge>
          )}
          
          {gameSystem.validationSchema && (
            <Badge variant="outline">
              <FileText className="w-3 h-3 mr-1" />
              Schema
            </Badge>
          )}

          {isLocked && (
            <Badge variant={isLockedByCurrentUser ? 'default' : 'destructive'}>
              <Lock className="w-3 h-3 mr-1" />
              {isLockedByCurrentUser ? 'Locked by you' : 'Locked'}
            </Badge>
          )}

          {gameSystem.isPublic && (
            <Badge variant="outline">
              <Users className="w-3 h-3 mr-1" />
              Collaborative
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="w-4 h-4 mr-1" />
          Updated {formatTimeAgo(gameSystem.updatedAt)}
        </div>

        {gameSystem.documents && gameSystem.documents.length > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            {gameSystem.documents.length} document{gameSystem.documents.length > 1 ? 's' : ''}
          </div>
        )}

        {gameSystem.derivedSystems && gameSystem.derivedSystems.length > 0 && (
          <div className="mt-1 text-sm text-muted-foreground">
            {gameSystem.derivedSystems.length} derived system{gameSystem.derivedSystems.length > 1 ? 's' : ''}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex gap-2 w-full">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              disabled={isLocked && !isLockedByCurrentUser}
            >
              <Settings className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}

          {onDerive && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDerive}
            >
              Derive
            </Button>
          )}

          <div className="flex-1" />

          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isLocked && !isLockedByCurrentUser}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}