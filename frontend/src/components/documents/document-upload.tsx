import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CreateDocumentRequest } from '@/types/document.types';
import { Loader2, Upload, X, File, AlertCircle } from 'lucide-react';

interface DocumentUploadProps {
  onSubmit: (data: CreateDocumentRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
}

interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function DocumentUpload({
  onSubmit,
  onCancel,
  loading = false,
  acceptedFileTypes = ['.json', '.pdf', '.md', '.markdown'],
  maxFileSize = 100 * 1024 * 1024, // 100MB
}: DocumentUploadProps): React.JSX.Element {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [validation, setValidation] = useState<FileValidationResult | null>(
    null
  );
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): FileValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file size
    if (file.size > maxFileSize) {
      errors.push(
        `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxFileSize)})`
      );
    }

    // Check file type
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFileTypes.includes(extension)) {
      errors.push(
        `Unsupported file type. Supported types: ${acceptedFileTypes.join(', ')}`
      );
    }

    // Check file name length
    if (file.name.length > 255) {
      errors.push('File name is too long (maximum 255 characters)');
    }

    // Warnings for large files
    if (file.size > 10 * 1024 * 1024) {
      warnings.push('Large files may take longer to process');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB'];
    const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, unitIndex);

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const handleFileSelect = (file: File): void => {
    setSelectedFile(file);

    // Auto-populate display name if empty
    if (!displayName) {
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
      setDisplayName(nameWithoutExtension);
    }

    // Validate file
    const validationResult = validateFile(file);
    setValidation(validationResult);
  };

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const [file] = Array.from(files);
      if (file) {
        handleFileSelect(file);
      }
    }
  };

  const handleDrag = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const [file] = Array.from(files);
      if (file) {
        handleFileSelect(file);
      }
    }
  };

  const handleAddTag = (): void => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 20) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string): void => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!selectedFile || !displayName.trim() || !validation?.isValid) {
      return;
    }

    const submitData: CreateDocumentRequest = {
      file: selectedFile,
      displayName: displayName.trim(),
      tags: tags.length > 0 ? tags : undefined,
    };

    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error('Failed to upload document:', error);
    }
  };

  const canSubmit = Boolean(
    selectedFile && displayName.trim() && validation?.isValid && !loading
  );

  return (
    <div className='max-w-2xl mx-auto space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Upload Document</h1>
        <p className='text-muted-foreground'>
          Add a new document to your game system
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
            <CardDescription>
              Upload JSON, PDF, or Markdown files containing game rules and
              content
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-6'>
            {/* File Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/10'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type='file'
                accept={acceptedFileTypes.join(',')}
                onChange={handleFileInputChange}
                className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
              />

              {selectedFile ? (
                <div className='space-y-2'>
                  <File className='h-12 w-12 text-primary mx-auto' />
                  <div>
                    <p className='font-medium'>{selectedFile.name}</p>
                    <p className='text-sm text-muted-foreground'>
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      setSelectedFile(null);
                      setValidation(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    <X className='h-4 w-4 mr-2' />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className='space-y-2'>
                  <Upload className='h-12 w-12 text-muted-foreground mx-auto' />
                  <div>
                    <p className='text-lg font-medium'>
                      Choose a file or drag it here
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Supports: JSON, PDF, Markdown (max{' '}
                      {formatFileSize(maxFileSize)})
                    </p>
                  </div>
                  <Button type='button' variant='outline'>
                    Browse Files
                  </Button>
                </div>
              )}
            </div>

            {/* Validation Results */}
            {validation && (
              <div className='space-y-2'>
                {validation.errors.length > 0 && (
                  <div className='rounded-md bg-destructive/10 border border-destructive/20 p-3'>
                    <div className='flex items-center gap-2 mb-2'>
                      <AlertCircle className='h-4 w-4 text-destructive' />
                      <span className='font-medium text-destructive'>
                        Validation Errors
                      </span>
                    </div>
                    <ul className='list-disc list-inside space-y-1 text-sm text-destructive'>
                      {validation.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {validation.warnings.length > 0 && (
                  <div className='rounded-md bg-yellow-50 border border-yellow-200 p-3'>
                    <div className='flex items-center gap-2 mb-2'>
                      <AlertCircle className='h-4 w-4 text-yellow-600' />
                      <span className='font-medium text-yellow-800'>
                        Warnings
                      </span>
                    </div>
                    <ul className='list-disc list-inside space-y-1 text-sm text-yellow-700'>
                      {validation.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Display Name */}
            <div>
              <label
                htmlFor='displayName'
                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                Display Name *
              </label>
              <input
                id='displayName'
                type='text'
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder='e.g., Core Spells'
                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2'
              />
            </div>

            {/* Tags */}
            <div>
              <label
                htmlFor='tagInput'
                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                Tags (Optional)
              </label>
              <div className='mt-2'>
                <div className='flex flex-wrap gap-2 mb-2'>
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className='inline-flex items-center rounded-full bg-secondary text-secondary-foreground px-2.5 py-0.5 text-xs font-semibold'
                    >
                      {tag}
                      <button
                        type='button'
                        onClick={() => handleRemoveTag(tag)}
                        className='ml-1 h-4 w-4 rounded-full hover:bg-secondary-foreground/20'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </span>
                  ))}
                </div>
                <div className='flex gap-2'>
                  <input
                    id='tagInput'
                    type='text'
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder='Add a tag...'
                    className='flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={handleAddTag}
                    disabled={!tagInput.trim() || tags.length >= 20}
                  >
                    Add
                  </Button>
                </div>
                <p className='text-xs text-muted-foreground mt-1'>
                  Press Enter or click Add to create tags. Maximum 20 tags.
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className='flex gap-2 justify-end'>
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={!canSubmit}>
              {loading && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
              <Upload className='h-4 w-4 mr-2' />
              Upload Document
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
