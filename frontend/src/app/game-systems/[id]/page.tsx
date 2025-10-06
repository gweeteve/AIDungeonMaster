'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DocumentList } from '@/components/documents/document-list';
import { DocumentUpload } from '@/components/documents/document-upload';
import { EditGameSystemForm } from '@/components/game-systems/edit-form';
import { GameSystem, UpdateGameSystemRequest } from '@/types/game-system.types';
import { Document, CreateDocumentRequest } from '@/types/document.types';
import { gameSystemService } from '@/services/game-system.service';
import { documentService } from '@/services/document.service';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Users,
  Clock,
  FileText,
  Settings,
} from 'lucide-react';

type ViewMode = 'details' | 'edit' | 'upload';

export default function GameSystemDetailsPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const gameSystemId = params.id as string;

  const [gameSystem, setGameSystem] = useState<GameSystem | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('details');
  const [actionLoading, setActionLoading] = useState(false);

  const currentUserId = 'mock-user-id'; // TODO: Get from auth context

  const loadDocuments = useCallback(async (): Promise<Document[]> => {
    try {
      setDocumentsLoading(true);
      const documentsData =
        await documentService.getDocumentsByGameSystem(gameSystemId);
      setDocuments(documentsData);
      return documentsData;
    } catch (error) {
      console.error('Failed to load documents:', error);
      return [];
    } finally {
      setDocumentsLoading(false);
    }
  }, [gameSystemId]);

  const loadGameSystemDetails = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const [systemData] = await Promise.all([
        gameSystemService.getGameSystem(gameSystemId),
        loadDocuments(),
      ]);
      setGameSystem(systemData);
    } catch (error) {
      console.error('Failed to load game system:', error);
      // TODO: Show error toast or redirect to 404
    } finally {
      setLoading(false);
    }
  }, [gameSystemId, loadDocuments]);

  useEffect(() => {
    if (gameSystemId) {
      void loadGameSystemDetails();
    }
  }, [gameSystemId, loadGameSystemDetails]);

  const handleEdit = (): void => {
    setViewMode('edit');
  };

  const handleDelete = async (): Promise<void> => {
    if (
      !gameSystem ||
      !confirm(`Are you sure you want to delete "${gameSystem.name}"?`)
    ) {
      return;
    }

    try {
      setActionLoading(true);
      await gameSystemService.deleteGameSystem(gameSystem.id);
      // TODO: Show success toast
      router.push('/game-systems');
    } catch (error) {
      console.error('Failed to delete game system:', error);
      // TODO: Show error toast
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcquireLock = async (): Promise<void> => {
    if (!gameSystem) return;

    try {
      setActionLoading(true);
      await gameSystemService.acquireLock(gameSystem.id);
      await loadGameSystemDetails(); // Refresh to show lock status
      // TODO: Show success toast
    } catch (error) {
      console.error('Failed to acquire lock:', error);
      // TODO: Show error toast
    } finally {
      setActionLoading(false);
    }
  };

  const handleReleaseLock = async (): Promise<void> => {
    if (!gameSystem) return;

    try {
      setActionLoading(true);
      await gameSystemService.releaseLock(gameSystem.id);
      await loadGameSystemDetails(); // Refresh to show lock status
      // TODO: Show success toast
    } catch (error) {
      console.error('Failed to release lock:', error);
      // TODO: Show error toast
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateSubmit = async (
    data: UpdateGameSystemRequest
  ): Promise<void> => {
    if (!gameSystem) return;

    try {
      const updatedSystem = await gameSystemService.updateGameSystem(
        gameSystem.id,
        data
      );
      setGameSystem(updatedSystem);
      setViewMode('details');
      // TODO: Show success toast
    } catch (error) {
      console.error('Failed to update game system:', error);
      throw error; // Let the form handle the error
    }
  };

  const handleUploadDocument = (): void => {
    setViewMode('upload');
  };

  const handleDocumentUploadSubmit = async (
    data: CreateDocumentRequest
  ): Promise<void> => {
    try {
      await documentService.uploadDocument(gameSystemId, data);
      await loadDocuments(); // Refresh documents list
      setViewMode('details');
      // TODO: Show success toast
    } catch (error) {
      console.error('Failed to upload document:', error);
      throw error; // Let the form handle the error
    }
  };

  const handleDocumentDownload = async (doc: Document): Promise<void> => {
    try {
      const url = await documentService.downloadDocumentAsUrl(doc.id);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = doc.filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download document:', error);
      // TODO: Show error toast
    }
  };

  const handleDocumentDelete = async (doc: Document): Promise<void> => {
    if (!confirm(`Are you sure you want to delete "${doc.displayName}"?`)) {
      return;
    }

    try {
      await documentService.deleteDocument(doc.id);
      await loadDocuments(); // Refresh documents list
      // TODO: Show success toast
    } catch (error) {
      console.error('Failed to delete document:', error);
      // TODO: Show error toast
    }
  };

  const isLocked = Boolean(
    gameSystem?.editLockUserId &&
      gameSystem?.editLockExpiresAt &&
      new Date(gameSystem.editLockExpiresAt) > new Date()
  );

  const isLockedByCurrentUser =
    isLocked && gameSystem?.editLockUserId === currentUserId;

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
  };

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='animate-pulse space-y-6'>
          <div className='h-8 bg-muted rounded w-1/3'></div>
          <div className='h-32 bg-muted rounded'></div>
          <div className='h-64 bg-muted rounded'></div>
        </div>
      </div>
    );
  }

  if (!gameSystem) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='text-center py-12'>
          <h1 className='text-2xl font-bold mb-2'>Game System Not Found</h1>
          <p className='text-muted-foreground mb-4'>
            The game system you’re looking for doesn’t exist or has been
            deleted.
          </p>
          <Button onClick={() => router.push('/game-systems')}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Game Systems
          </Button>
        </div>
      </div>
    );
  }

  if (viewMode === 'edit') {
    return (
      <div className='container mx-auto px-4 py-8'>
        <EditGameSystemForm
          gameSystem={gameSystem}
          onSubmit={handleUpdateSubmit}
          onCancel={() => setViewMode('details')}
        />
      </div>
    );
  }

  if (viewMode === 'upload') {
    return (
      <div className='container mx-auto px-4 py-8'>
        <DocumentUpload
          onSubmit={handleDocumentUploadSubmit}
          onCancel={() => setViewMode('details')}
        />
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8 space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => router.push('/game-systems')}
        >
          <ArrowLeft className='h-4 w-4 mr-2' />
          Back
        </Button>
        <div className='flex-1'>
          <h1 className='text-2xl font-bold'>{gameSystem.name}</h1>
          {gameSystem.description && (
            <p className='text-muted-foreground'>{gameSystem.description}</p>
          )}
        </div>
      </div>

      {/* System Info Card */}
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-4'>
              {gameSystem.imageUrl && (
                <Image
                  src={gameSystem.imageUrl}
                  alt={gameSystem.name}
                  width={64}
                  height={64}
                  className='h-16 w-16 rounded-lg object-cover'
                />
              )}
              <div>
                <CardTitle>{gameSystem.name}</CardTitle>
                {gameSystem.description && (
                  <CardDescription>{gameSystem.description}</CardDescription>
                )}
              </div>
            </div>

            <div className='flex gap-2'>
              {isLocked ? (
                isLockedByCurrentUser ? (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleReleaseLock}
                    disabled={actionLoading}
                  >
                    <Unlock className='h-4 w-4 mr-2' />
                    Release Lock
                  </Button>
                ) : (
                  <Badge variant='destructive'>
                    <Lock className='w-3 h-3 mr-1' />
                    Locked
                  </Badge>
                )
              ) : (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleAcquireLock}
                  disabled={actionLoading}
                >
                  <Lock className='h-4 w-4 mr-2' />
                  Acquire Lock
                </Button>
              )}

              <Button
                variant='outline'
                size='sm'
                onClick={handleEdit}
                disabled={isLocked && !isLockedByCurrentUser}
              >
                <Edit className='h-4 w-4 mr-2' />
                Edit
              </Button>

              <Button
                variant='outline'
                size='sm'
                onClick={handleDelete}
                disabled={isLocked && !isLockedByCurrentUser}
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Clock className='h-4 w-4' />
              Created {formatTimeAgo(gameSystem.createdAt)}
            </div>

            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <FileText className='h-4 w-4' />
              {documents.length} document{documents.length !== 1 ? 's' : ''}
            </div>

            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Users className='h-4 w-4' />
              {gameSystem.isPublic ? 'Collaborative' : 'Private'}
            </div>
          </div>

          <div className='flex flex-wrap gap-2 mt-4'>
            {gameSystem.parentSystemId && (
              <Badge variant='secondary'>Derived System</Badge>
            )}

            {gameSystem.validationSchema && (
              <Badge variant='outline'>
                <Settings className='w-3 h-3 mr-1' />
                Custom Validation
              </Badge>
            )}

            {gameSystem.syncWithParent && gameSystem.parentSystemId && (
              <Badge variant='outline'>Syncs with Parent</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents Section */}
      <DocumentList
        documents={documents}
        loading={documentsLoading}
        onUploadNew={handleUploadDocument}
        onDownload={handleDocumentDownload}
        onDelete={handleDocumentDelete}
        gameSystemLocked={isLocked && !isLockedByCurrentUser}
      />
    </div>
  );
}
