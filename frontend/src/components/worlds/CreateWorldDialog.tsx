import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { CreateWorldRequest, GameSystemResponse } from '../../types';

interface CreateWorldDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWorldRequest) => void;
  gameSystems: GameSystemResponse[];
  isLoading?: boolean;
  error?: string | null;
}

export const CreateWorldDialog: React.FC<CreateWorldDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  gameSystems,
  isLoading = false,
  error = null
}) => {
  const [formData, setFormData] = useState<CreateWorldRequest>({
    name: '',
    gameSystemId: '',
    imageUrl: undefined
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        gameSystemId: '',
        imageUrl: undefined
      });
      setValidationErrors({});
    }
  }, [isOpen]);

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    // Validate world name
    if (!formData.name.trim()) {
      errors.name = 'World name is required';
    } else if (formData.name.length > 255) {
      errors.name = 'World name must be 255 characters or less';
    }

    // Validate game system
    if (!formData.gameSystemId) {
      errors.gameSystemId = 'Game system is required';
    }

    // Validate image URL if provided
    if (formData.imageUrl && formData.imageUrl.trim()) {
      try {
        new URL(formData.imageUrl);
      } catch (e) {
        errors.imageUrl = 'Please enter a valid URL';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData: CreateWorldRequest = {
      name: formData.name.trim(),
      gameSystemId: formData.gameSystemId,
      imageUrl: formData.imageUrl?.trim() || undefined
    };

    onSubmit(submitData);
  }, [formData, validateForm, onSubmit]);

  const handleInputChange = useCallback((field: keyof CreateWorldRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  const isFormValid = formData.name.trim() && formData.gameSystemId && !Object.keys(validationErrors).length;
  const hasGameSystems = gameSystems.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[500px]"
        onKeyDown={handleKeyDown}
        data-testid="dialog-overlay"
      >
        <DialogHeader>
          <DialogTitle>Create New World</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* No Game Systems Alert */}
          {!hasGameSystems && (
            <Alert>
              <AlertDescription>
                No game systems available. Please add a game system first.
              </AlertDescription>
            </Alert>
          )}

          {/* World Name */}
          <div className="space-y-2">
            <Label htmlFor="world-name">World Name *</Label>
            <Input
              id="world-name"
              type="text"
              placeholder="Enter your world name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={isLoading}
              maxLength={255}
              className={validationErrors.name ? 'border-red-500' : ''}
              autoFocus
            />
            {validationErrors.name && (
              <p className="text-sm text-red-600">{validationErrors.name}</p>
            )}
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="image-url">
              Image URL 
              <span className="text-gray-500 font-normal">(optional)</span>
            </Label>
            <Input
              id="image-url"
              type="url"
              placeholder="https://example.com/your-world-image.jpg"
              value={formData.imageUrl || ''}
              onChange={(e) => handleInputChange('imageUrl', e.target.value)}
              disabled={isLoading}
              className={validationErrors.imageUrl ? 'border-red-500' : ''}
            />
            {validationErrors.imageUrl && (
              <p className="text-sm text-red-600">{validationErrors.imageUrl}</p>
            )}
            <p className="text-xs text-gray-500">
              If not provided, your world will use the game system's default image
            </p>
          </div>

          {/* Game System */}
          <div className="space-y-2">
            <Label htmlFor="game-system">Game System *</Label>
            {hasGameSystems ? (
              <Select
                value={formData.gameSystemId}
                onValueChange={(value) => handleInputChange('gameSystemId', value)}
                disabled={isLoading}
              >
                <SelectTrigger 
                  id="game-system"
                  className={validationErrors.gameSystemId ? 'border-red-500' : ''}
                >
                  <SelectValue placeholder="Select a game system" />
                </SelectTrigger>
                <SelectContent>
                  {gameSystems.map((system) => (
                    <SelectItem key={system.id} value={system.id}>
                      <div className="flex items-center space-x-3">
                        <img 
                          src={system.defaultImageUrl} 
                          alt={system.name}
                          className="w-8 h-8 rounded object-cover"
                          loading="lazy"
                        />
                        <div>
                          <div className="font-medium">{system.name}</div>
                          {system.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {system.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                disabled
                placeholder="No game systems available"
                className="bg-gray-50"
              />
            )}
            {validationErrors.gameSystemId && (
              <p className="text-sm text-red-600">{validationErrors.gameSystemId}</p>
            )}
          </div>

          <DialogFooter className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isLoading || !hasGameSystems}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                    data-testid="loading-spinner"
                  />
                  <span>Creating...</span>
                </div>
              ) : (
                'Create World'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};