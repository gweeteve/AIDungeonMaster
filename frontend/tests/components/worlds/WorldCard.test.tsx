import { render, screen, fireEvent } from '@testing-library/react';
import { WorldCard } from '../../../src/components/worlds/WorldCard';
import { WorldResponse } from '../../../src/types';

const mockWorldWithImage: WorldResponse = {
  id: 'world-1',
  name: 'Adventure World',
  imageUrl: 'https://example.com/adventure.jpg',
  gameSystem: {
    id: 'system-1',
    name: 'D&D 5e',
    defaultImageUrl: 'https://example.com/dnd.jpg'
  },
  lastAccessedAt: '2024-12-19T10:00:00.000Z',
  createdAt: '2024-12-19T09:00:00.000Z'
};

const mockWorldWithoutImage: WorldResponse = {
  id: 'world-2',
  name: 'Text Adventure',
  gameSystem: {
    id: 'system-1',
    name: 'D&D 5e',
    defaultImageUrl: 'https://example.com/dnd.jpg'
  },
  lastAccessedAt: '2024-12-19T08:00:00.000Z',
  createdAt: '2024-12-19T07:00:00.000Z'
};

describe('WorldCard Component', () => {
  const mockOnLaunch = jest.fn();

  beforeEach(() => {
    mockOnLaunch.mockClear();
  });

  describe('Image Rendering', () => {
    it('should render with custom image when imageUrl is provided', () => {
      render(<WorldCard world={mockWorldWithImage} onLaunch={mockOnLaunch} />);
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', mockWorldWithImage.imageUrl);
      expect(image).toHaveAttribute('alt', `${mockWorldWithImage.name} world image`);
    });

    it('should render with game system default image when no custom image', () => {
      render(<WorldCard world={mockWorldWithoutImage} onLaunch={mockOnLaunch} />);
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', mockWorldWithoutImage.gameSystem.defaultImageUrl);
      expect(image).toHaveAttribute('alt', `${mockWorldWithoutImage.name} world image`);
    });

    it('should handle image loading errors by falling back to game system image', () => {
      render(<WorldCard world={mockWorldWithImage} onLaunch={mockOnLaunch} />);
      
      const image = screen.getByRole('img');
      
      // Simulate image load error
      fireEvent.error(image);
      
      expect(image).toHaveAttribute('src', mockWorldWithImage.gameSystem.defaultImageUrl);
    });

    it('should show loading state while image loads', () => {
      render(<WorldCard world={mockWorldWithImage} onLaunch={mockOnLaunch} />);
      
      // Initially should show game system default (background loading)
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', mockWorldWithImage.gameSystem.defaultImageUrl);
    });
  });

  describe('Content Display', () => {
    it('should display world name', () => {
      render(<WorldCard world={mockWorldWithImage} onLaunch={mockOnLaunch} />);
      
      expect(screen.getByText(mockWorldWithImage.name)).toBeInTheDocument();
    });

    it('should display game system name', () => {
      render(<WorldCard world={mockWorldWithImage} onLaunch={mockOnLaunch} />);
      
      expect(screen.getByText(mockWorldWithImage.gameSystem.name)).toBeInTheDocument();
    });

    it('should display last accessed information', () => {
      render(<WorldCard world={mockWorldWithImage} onLaunch={mockOnLaunch} />);
      
      // Should show formatted last accessed date
      expect(screen.getByText(/last played/i)).toBeInTheDocument();
    });

    it('should handle long world names gracefully', () => {
      const longNameWorld = {
        ...mockWorldWithImage,
        name: 'This is a very long world name that should be handled gracefully by the component'
      };
      
      render(<WorldCard world={longNameWorld} onLaunch={mockOnLaunch} />);
      
      expect(screen.getByText(longNameWorld.name)).toBeInTheDocument();
    });

    it('should handle UTF-8 characters in world names', () => {
      const utf8World = {
        ...mockWorldWithImage,
        name: 'Мой мир приключений 🎲🗡️'
      };
      
      render(<WorldCard world={utf8World} onLaunch={mockOnLaunch} />);
      
      expect(screen.getByText(utf8World.name)).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should call onLaunch when image is clicked', () => {
      render(<WorldCard world={mockWorldWithImage} onLaunch={mockOnLaunch} />);
      
      const image = screen.getByRole('img');
      fireEvent.click(image);
      
      expect(mockOnLaunch).toHaveBeenCalledWith(mockWorldWithImage.id);
      expect(mockOnLaunch).toHaveBeenCalledTimes(1);
    });

    it('should call onLaunch when card is clicked', () => {
      render(<WorldCard world={mockWorldWithImage} onLaunch={mockOnLaunch} />);
      
      const card = screen.getByTestId('world-card');
      fireEvent.click(card);
      
      expect(mockOnLaunch).toHaveBeenCalledWith(mockWorldWithImage.id);
    });

    it('should show hover effects on interaction', () => {
      render(<WorldCard world={mockWorldWithImage} onLaunch={mockOnLaunch} />);
      
      const card = screen.getByTestId('world-card');
      fireEvent.mouseEnter(card);
      
      expect(card).toHaveClass('hover:shadow-lg'); // or similar hover class
    });

    it('should be keyboard accessible', () => {
      render(<WorldCard world={mockWorldWithImage} onLaunch={mockOnLaunch} />);
      
      const card = screen.getByTestId('world-card');
      
      // Should be focusable
      expect(card).toHaveAttribute('tabindex', '0');
      
      // Should handle Enter key
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(mockOnLaunch).toHaveBeenCalledWith(mockWorldWithImage.id);
      
      // Should handle Space key
      fireEvent.keyDown(card, { key: ' ' });
      expect(mockOnLaunch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<WorldCard world={mockWorldWithImage} onLaunch={mockOnLaunch} />);
      
      const card = screen.getByTestId('world-card');
      expect(card).toHaveAttribute('aria-label', `Launch ${mockWorldWithImage.name} world`);
    });

    it('should have proper role attribute', () => {
      render(<WorldCard world={mockWorldWithImage} onLaunch={mockOnLaunch} />);
      
      const card = screen.getByTestId('world-card');
      expect(card).toHaveAttribute('role', 'button');
    });

    it('should support screen readers', () => {
      render(<WorldCard world={mockWorldWithImage} onLaunch={mockOnLaunch} />);
      
      // Should have descriptive text for screen readers
      expect(screen.getByText(/click to launch/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing world data gracefully', () => {
      const incompleteWorld = {
        id: 'incomplete',
        name: '',
        gameSystem: {
          id: 'system-1',
          name: 'D&D 5e',
          defaultImageUrl: 'https://example.com/dnd.jpg'
        },
        lastAccessedAt: '2024-12-19T10:00:00.000Z',
        createdAt: '2024-12-19T10:00:00.000Z'
      } as WorldResponse;
      
      render(<WorldCard world={incompleteWorld} onLaunch={mockOnLaunch} />);
      
      // Should not crash and should show fallback content
      expect(screen.getByTestId('world-card')).toBeInTheDocument();
    });

    it('should handle invalid date formats', () => {
      const invalidDateWorld = {
        ...mockWorldWithImage,
        lastAccessedAt: 'invalid-date'
      } as WorldResponse;
      
      render(<WorldCard world={invalidDateWorld} onLaunch={mockOnLaunch} />);
      
      // Should not crash
      expect(screen.getByTestId('world-card')).toBeInTheDocument();
    });
  });
});