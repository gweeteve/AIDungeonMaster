import React, { useState, useCallback } from 'react';
import { WorldResponse } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface WorldCardProps {
  world: WorldResponse;
  onLaunch: (worldId: string) => void;
}

export const WorldCard: React.FC<WorldCardProps> = ({ world, onLaunch }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Determine which image to show
  const displayImage = imageError || !world.imageUrl 
    ? world.gameSystem.defaultImageUrl 
    : world.imageUrl;

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleClick = useCallback(() => {
    onLaunch(world.id);
  }, [world.id, onLaunch]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  const formatLastPlayed = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Recently';
    }
  }, []);

  return (
    <div
      data-testid="world-card"
      className="group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200 hover:border-blue-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Launch ${world.name} world`}
    >
      {/* Image Container */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {/* Background image (game system default) shown immediately */}
        <img
          src={world.gameSystem.defaultImageUrl}
          alt={`${world.name} world image`}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Custom image loaded on top if available */}
        {world.imageUrl && !imageError && (
          <img
            src={world.imageUrl}
            alt={`${world.name} world image`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        )}
        
        {/* Loading overlay */}
        {world.imageUrl && !imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 rounded-full p-3">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
            {world.name}
          </h3>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {world.gameSystem.name}
            </span>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          <span>Last played {formatLastPlayed(world.lastAccessedAt)}</span>
        </div>

        {/* Screen reader text */}
        <span className="sr-only">Click to launch this world</span>
      </div>

      {/* Focus indicator */}
      <div className="absolute inset-0 rounded-lg ring-2 ring-transparent group-focus:ring-blue-500 pointer-events-none" />
    </div>
  );
};