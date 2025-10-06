import React, { useState } from 'react';
import { Document } from '@/types/document.types';
import { DocumentCard } from './document-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, FileText } from 'lucide-react';

interface DocumentListProps {
  documents: Document[];
  loading?: boolean;
  onUploadNew?: () => void;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  onView?: (document: Document) => void;
  showGameSystem?: boolean;
  gameSystemLocked?: boolean;
}

export function DocumentList({
  documents,
  loading = false,
  onUploadNew,
  onEdit,
  onDelete,
  onDownload,
  onView,
  showGameSystem = false,
  gameSystemLocked = false,
}: DocumentListProps): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<
    'all' | 'JSON' | 'PDF' | 'MARKDOWN'
  >('all');
  const [validationFilter, setValidationFilter] = useState<
    'all' | 'valid' | 'invalid'
  >('all');

  const filteredDocuments = documents.filter((document) => {
    const matchesSearch =
      document.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesType = typeFilter === 'all' || document.type === typeFilter;

    const matchesValidation =
      validationFilter === 'all' ||
      (validationFilter === 'valid' &&
        document.validationErrors.length === 0) ||
      (validationFilter === 'invalid' && document.validationErrors.length > 0);

    return matchesSearch && matchesType && matchesValidation;
  });

  const getDocumentStats = (): {
    total: number;
    json: number;
    pdf: number;
    markdown: number;
    valid: number;
    invalid: number;
  } => {
    const stats = {
      total: documents.length,
      json: documents.filter((d) => d.type === 'JSON').length,
      pdf: documents.filter((d) => d.type === 'PDF').length,
      markdown: documents.filter((d) => d.type === 'MARKDOWN').length,
      valid: documents.filter((d) => d.validationErrors.length === 0).length,
      invalid: documents.filter((d) => d.validationErrors.length > 0).length,
    };
    return stats;
  };

  const stats = getDocumentStats();

  const renderSkeleton = (): React.JSX.Element[] => {
    return Array.from({ length: 6 }, (_, index) => (
      <div key={index} className='space-y-3'>
        <Skeleton className='h-[180px] w-full rounded-lg' />
      </div>
    ));
  };

  const renderEmptyState = (): React.JSX.Element => {
    if (searchTerm || typeFilter !== 'all' || validationFilter !== 'all') {
      return (
        <div className='col-span-full flex flex-col items-center justify-center py-12 text-center'>
          <Search className='h-12 w-12 text-muted-foreground mb-4' />
          <h3 className='text-lg font-semibold text-foreground mb-2'>
            No documents found
          </h3>
          <p className='text-muted-foreground max-w-md'>
            Try adjusting your search or filter criteria to find what you’re
            looking for.
          </p>
          <Button
            variant='outline'
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('all');
              setValidationFilter('all');
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
          <FileText className='h-12 w-12 text-muted-foreground' />
        </div>
        <h3 className='text-lg font-semibold text-foreground mb-2'>
          No documents yet
        </h3>
        <p className='text-muted-foreground max-w-md mb-6'>
          Start building your game system by uploading JSON rules, PDF manuals,
          or Markdown documentation.
        </p>
        {onUploadNew && !gameSystemLocked && (
          <Button onClick={onUploadNew}>
            <Plus className='h-4 w-4 mr-2' />
            Upload Document
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
          <h2 className='text-xl font-bold'>Documents</h2>
          <p className='text-muted-foreground'>
            Manage rules, content, and resources
          </p>
        </div>

        {onUploadNew && !gameSystemLocked && (
          <Button onClick={onUploadNew}>
            <Plus className='h-4 w-4 mr-2' />
            Upload Document
          </Button>
        )}
      </div>

      {/* Stats */}
      {!loading && documents.length > 0 && (
        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-primary'>{stats.total}</div>
            <div className='text-xs text-muted-foreground'>Total</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-blue-600'>{stats.json}</div>
            <div className='text-xs text-muted-foreground'>JSON</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-red-600'>{stats.pdf}</div>
            <div className='text-xs text-muted-foreground'>PDF</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-green-600'>
              {stats.markdown}
            </div>
            <div className='text-xs text-muted-foreground'>Markdown</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-emerald-600'>
              {stats.valid}
            </div>
            <div className='text-xs text-muted-foreground'>Valid</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-orange-600'>
              {stats.invalid}
            </div>
            <div className='text-xs text-muted-foreground'>Errors</div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className='flex flex-col lg:flex-row gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <input
            type='text'
            placeholder='Search documents...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
          />
        </div>

        <div className='flex flex-wrap gap-2'>
          {/* Type Filter */}
          <div className='flex gap-1'>
            <Button
              variant={typeFilter === 'all' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setTypeFilter('all')}
            >
              All Types
            </Button>
            <Button
              variant={typeFilter === 'JSON' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setTypeFilter('JSON')}
            >
              JSON
            </Button>
            <Button
              variant={typeFilter === 'PDF' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setTypeFilter('PDF')}
            >
              PDF
            </Button>
            <Button
              variant={typeFilter === 'MARKDOWN' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setTypeFilter('MARKDOWN')}
            >
              Markdown
            </Button>
          </div>

          {/* Validation Filter */}
          <div className='flex gap-1'>
            <Button
              variant={validationFilter === 'all' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setValidationFilter('all')}
            >
              All
            </Button>
            <Button
              variant={validationFilter === 'valid' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setValidationFilter('valid')}
            >
              Valid
            </Button>
            <Button
              variant={validationFilter === 'invalid' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setValidationFilter('invalid')}
            >
              Errors
            </Button>
          </div>
        </div>
      </div>

      {/* Document Count */}
      {!loading && (
        <div className='text-sm text-muted-foreground'>
          {filteredDocuments.length} document
          {filteredDocuments.length !== 1 ? 's' : ''} found
        </div>
      )}

      {/* Documents Grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {loading && renderSkeleton()}

        {!loading && filteredDocuments.length === 0 && renderEmptyState()}

        {!loading &&
          filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onEdit={onEdit}
              onDelete={onDelete}
              onDownload={onDownload}
              onView={onView}
              showGameSystem={showGameSystem}
              disabled={gameSystemLocked}
            />
          ))}
      </div>
    </div>
  );
}
