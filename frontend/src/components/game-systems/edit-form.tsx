import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UpdateGameSystemRequest, GameSystem } from '@/types/game-system.types';
import { Loader2, Save, ArrowLeft } from 'lucide-react';

interface EditGameSystemFormProps {
  gameSystem: GameSystem;
  onSubmit: (data: UpdateGameSystemRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface FormData {
  name: string;
  description: string;
  imageUrl: string;
  syncWithParent: boolean;
  validationSchema: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  imageUrl?: string;
  validationSchema?: string;
}

export function EditGameSystemForm({
  gameSystem,
  onSubmit,
  onCancel,
  loading = false,
}: EditGameSystemFormProps): React.JSX.Element {
  const [formData, setFormData] = useState<FormData>({
    name: gameSystem.name,
    description: gameSystem.description ?? '',
    imageUrl: gameSystem.imageUrl ?? '',
    syncWithParent: gameSystem.syncWithParent,
    validationSchema: gameSystem.validationSchema
      ? JSON.stringify(gameSystem.validationSchema, null, 2)
      : '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const originalData = {
      name: gameSystem.name,
      description: gameSystem.description ?? '',
      imageUrl: gameSystem.imageUrl ?? '',
      syncWithParent: gameSystem.syncWithParent,
      validationSchema: gameSystem.validationSchema
        ? JSON.stringify(gameSystem.validationSchema, null, 2)
        : '',
    };

    const changed = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(changed);
  }, [formData, gameSystem]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be 100 characters or less';
    }

    if (formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }

    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'Please enter a valid URL';
    }

    if (formData.validationSchema) {
      try {
        JSON.parse(formData.validationSchema);
      } catch {
        newErrors.validationSchema = 'Invalid JSON format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm() || !hasChanges) {
      return;
    }

    const submitData: UpdateGameSystemRequest = {};

    if (formData.name !== gameSystem.name) {
      submitData.name = formData.name.trim();
    }

    if (formData.description !== (gameSystem.description ?? '')) {
      submitData.description = formData.description.trim() || undefined;
    }

    if (formData.imageUrl !== (gameSystem.imageUrl ?? '')) {
      submitData.imageUrl = formData.imageUrl.trim() || undefined;
    }

    if (formData.syncWithParent !== gameSystem.syncWithParent) {
      submitData.syncWithParent = formData.syncWithParent;
    }

    const currentSchema = gameSystem.validationSchema
      ? JSON.stringify(gameSystem.validationSchema, null, 2)
      : '';
    if (formData.validationSchema !== currentSchema) {
      submitData.validationSchema = formData.validationSchema
        ? JSON.parse(formData.validationSchema)
        : undefined;
    }

    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error('Failed to update game system:', error);
    }
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className='max-w-2xl mx-auto space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='sm' onClick={onCancel}>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Back
        </Button>
        <div>
          <h1 className='text-2xl font-bold'>Edit Game System</h1>
          <p className='text-muted-foreground'>
            Modify the settings and configuration for {gameSystem.name}
          </p>
        </div>
      </div>

      {gameSystem.parentSystemId && gameSystem.parentSystem && (
        <Card className='border-primary/20 bg-primary/5'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base'>Derived System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-3'>
              {gameSystem.parentSystem.imageUrl && (
                <Image
                  src={gameSystem.parentSystem.imageUrl}
                  alt={gameSystem.parentSystem.name}
                  width={40}
                  height={40}
                  className='h-10 w-10 rounded-md object-cover'
                />
              )}
              <div>
                <p className='text-sm text-muted-foreground'>Derived from</p>
                <p className='font-medium'>{gameSystem.parentSystem.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>System Details</CardTitle>
            <CardDescription>
              Update the configuration for your game system
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-4'>
            {/* Name */}
            <div>
              <label
                htmlFor='name'
                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                Name *
              </label>
              <input
                id='name'
                type='text'
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder='e.g., D&D 5E Homebrew'
                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2'
              />
              {errors.name && (
                <p className='text-sm text-destructive mt-1'>{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor='description'
                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                Description
              </label>
              <textarea
                id='description'
                value={formData.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                placeholder='Brief description of your game system...'
                rows={3}
                className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2'
              />
              {errors.description && (
                <p className='text-sm text-destructive mt-1'>
                  {errors.description}
                </p>
              )}
            </div>

            {/* Image URL */}
            <div>
              <label
                htmlFor='imageUrl'
                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                Image URL
              </label>
              <input
                id='imageUrl'
                type='url'
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                placeholder='https://example.com/image.jpg'
                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2'
              />
              {errors.imageUrl && (
                <p className='text-sm text-destructive mt-1'>
                  {errors.imageUrl}
                </p>
              )}
            </div>

            {/* Sync with Parent (only for derived systems) */}
            {gameSystem.parentSystemId && (
              <div className='flex items-center space-x-2'>
                <input
                  id='syncWithParent'
                  type='checkbox'
                  checked={formData.syncWithParent}
                  onChange={(e) =>
                    handleInputChange('syncWithParent', e.target.checked)
                  }
                  className='peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground'
                />
                <label
                  htmlFor='syncWithParent'
                  className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                >
                  Sync with parent system updates
                </label>
              </div>
            )}

            {/* Validation Schema */}
            <div>
              <label
                htmlFor='validationSchema'
                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                JSON Validation Schema (Optional)
              </label>
              <textarea
                id='validationSchema'
                value={formData.validationSchema}
                onChange={(e) =>
                  handleInputChange('validationSchema', e.target.value)
                }
                placeholder='{"type": "object", "properties": {...}}'
                rows={8}
                className='flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2 font-mono'
              />
              {errors.validationSchema && (
                <p className='text-sm text-destructive mt-1'>
                  {errors.validationSchema}
                </p>
              )}
              <p className='text-xs text-muted-foreground mt-1'>
                Define a JSON Schema to validate uploaded JSON documents
              </p>
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
            <Button type='submit' disabled={loading || !hasChanges}>
              {loading && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
              <Save className='h-4 w-4 mr-2' />
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
