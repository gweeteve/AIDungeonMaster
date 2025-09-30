import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Document, SUPPORTED_FILE_TYPES } from '@/types/document.types';
import { Clock, Download, Edit, Trash2, AlertTriangle, FileText, File } from 'lucide-react';

interface DocumentCardProps {
  document: Document;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  onView?: (document: Document) => void;
  showGameSystem?: boolean;
  disabled?: boolean;
}

export function DocumentCard({
  document,
  onEdit,
  onDelete,
  onDownload,
  onView,
  showGameSystem = false,
  disabled = false,
}: DocumentCardProps): JSX.Element {
  const fileTypeInfo = SUPPORTED_FILE_TYPES[document.type];
  const hasValidationErrors = document.validationErrors.length > 0;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, unitIndex);
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
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

  const getFileIcon = (): JSX.Element => {
    const IconComponent = fileTypeInfo.icon === 'FileJson' ? FileText : File;
    return <IconComponent className={`w-6 h-6 ${fileTypeInfo.color}`} />;
  };

  const handleView = (): void => {
    if (onView && !disabled) {
      onView(document);
    }
  };

  const handleEdit = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (onEdit && !disabled) {
      onEdit(document);
    }
  };

  const handleDelete = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (onDelete && !disabled) {
      onDelete(document);
    }
  };

  const handleDownload = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (onDownload && !disabled) {
      onDownload(document);
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        disabled ? 'opacity-50' : ''
      } ${hasValidationErrors ? 'border-destructive/50' : ''}`}
      onClick={handleView}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1">
              {getFileIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate">{document.displayName}</CardTitle>
              <CardDescription className="text-sm">
                {document.filename}
              </CardDescription>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline">
            {document.type}
          </Badge>

          {document.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}

          {hasValidationErrors && (
            <Badge variant="destructive">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {document.validationErrors.length} error{document.validationErrors.length > 1 ? 's' : ''}
            </Badge>
          )}

          {document.version > 1 && (
            <Badge variant="outline">
              v{document.version}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatFileSize(document.fileSize)}</span>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {formatTimeAgo(document.updatedAt)}
            </div>
          </div>

          {showGameSystem && document.gameSystem && (
            <div className="text-sm text-muted-foreground">
              System: {document.gameSystem.name}
            </div>
          )}

          {hasValidationErrors && (
            <div className="text-sm text-destructive">
              <AlertTriangle className="w-4 h-4 mr-1 inline" />
              Document has validation errors
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex gap-2 w-full">
          {onDownload && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={disabled}
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          )}

          <div className="flex-1" />

          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              disabled={disabled}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}

          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={disabled}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}