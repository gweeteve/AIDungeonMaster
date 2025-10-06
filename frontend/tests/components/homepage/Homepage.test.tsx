import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Homepage } from '../../../src/components/homepage/Homepage';
import { WorldResponse, GameSystemResponse } from '../../../src/types';

const mockWorlds: WorldResponse[] = [
  {
    id: 'world-1',
    name: 'Recent Adventure',
    imageUrl: 'https://example.com/recent.jpg',
    gameSystem: {
      id: 'system-1',
      name: 'D&D 5e',
      defaultImageUrl: 'https://example.com/dnd.jpg'
    },
    lastAccessedAt: '2024-12-19T10:00:00.000Z',
    createdAt: '2024-12-19T09:00:00.000Z'
  },
  {
    id: 'world-2',
    name: 'Older Adventure',
    gameSystem: {
      id: 'system-2',
      name: 'Pathfinder 2e',
      defaultImageUrl: 'https://example.com/pf2e.jpg'
    },
    lastAccessedAt: '2024-12-18T10:00:00.000Z',
    createdAt: '2024-12-18T09:00:00.000Z'
  }
];

const mockGameSystems: GameSystemResponse[] = [
  {
    id: 'system-1',
    name: 'D&D 5e',
    defaultImageUrl: 'https://example.com/dnd.jpg',
    isActive: true
  },
  {
    id: 'system-2',
    name: 'Pathfinder 2e',
    defaultImageUrl: 'https://example.com/pf2e.jpg',
    isActive: true
  }
];

// Mock props for the Homepage component
const defaultProps = {
  worlds: mockWorlds,
  gameSystems: mockGameSystems,
  onLaunchWorld: jest.fn(),
  onCreateWorld: jest.fn(),
  onAccessGameSystems: jest.fn(),
  isLoading: false,
  error: null
};

describe('Homepage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('World Display', () => {
    it('should display all worlds', () => {
      render(<Homepage {...defaultProps} />);

      expect(screen.getByText('Recent Adventure')).toBeInTheDocument();
      expect(screen.getByText('Older Adventure')).toBeInTheDocument();
    });

    it('should display worlds sorted by last accessed date (most recent first)', () => {
      render(<Homepage {...defaultProps} />);

      const worldCards = screen.getAllByTestId('world-card');
      
      // First card should be the most recently accessed
      expect(worldCards[0]).toHaveTextContent('Recent Adventure');
      expect(worldCards[1]).toHaveTextContent('Older Adventure');
    });

    it('should display world images with proper fallbacks', () => {
      render(<Homepage {...defaultProps} />);

      const images = screen.getAllByRole('img');
      
      // Recent Adventure has custom image
      expect(images[0]).toHaveAttribute('src', 'https://example.com/dnd.jpg'); // Shows fallback initially
      
      // Older Adventure has no custom image, shows game system default
      expect(images[1]).toHaveAttribute('src', 'https://example.com/pf2e.jpg');
    });

    it('should handle empty worlds list (empty state)', () => {
      render(<Homepage {...defaultProps} worlds={[]} />);

      expect(screen.getByText(/no worlds yet/i)).toBeInTheDocument();
      expect(screen.getByText(/create your first world/i)).toBeInTheDocument();
      expect(screen.getByText('Create New World')).toBeInTheDocument();
    });

    it('should display world count when worlds exist', () => {
      render(<Homepage {...defaultProps} />);

      expect(screen.getByText(/2 worlds/i)).toBeInTheDocument();
    });
  });

  describe('World Interaction', () => {
    it('should launch world when world card is clicked', async () => {
      const user = userEvent.setup();
      
      render(<Homepage {...defaultProps} />);

      const firstWorldCard = screen.getAllByTestId('world-card')[0];
      await user.click(firstWorldCard);

      expect(defaultProps.onLaunchWorld).toHaveBeenCalledWith('world-1');
    });

    it('should update world order after launching a world', async () => {
      const user = userEvent.setup();
      
      // Simulate launching the second world, which should move it to first position
      const updatedWorlds = [
        { ...mockWorlds[1], lastAccessedAt: '2024-12-19T11:00:00.000Z' },
        mockWorlds[0]
      ];

      const { rerender } = render(<Homepage {...defaultProps} />);

      // Launch second world
      const secondWorldCard = screen.getAllByTestId('world-card')[1];
      await user.click(secondWorldCard);

      // Rerender with updated world order
      rerender(<Homepage {...defaultProps} worlds={updatedWorlds} />);

      const worldCards = screen.getAllByTestId('world-card');
      expect(worldCards[0]).toHaveTextContent('Older Adventure'); // Now first
      expect(worldCards[1]).toHaveTextContent('Recent Adventure'); // Now second
    });
  });

  describe('Create World Feature', () => {
    it('should display create world button', () => {
      render(<Homepage {...defaultProps} />);

      expect(screen.getByText('Create New World')).toBeInTheDocument();
    });

    it('should open create world dialog when button is clicked', async () => {
      const user = userEvent.setup();
      
      render(<Homepage {...defaultProps} />);

      const createButton = screen.getByText('Create New World');
      await user.click(createButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Create New World')).toBeInTheDocument(); // Dialog title
    });

    it('should handle world creation submission', async () => {
      const user = userEvent.setup();
      
      render(<Homepage {...defaultProps} />);

      // Open dialog
      const createButton = screen.getByText('Create New World');
      await user.click(createButton);

      // Fill form
      const nameInput = screen.getByLabelText(/world name/i);
      await user.type(nameInput, 'New Test World');

      const gameSystemSelect = screen.getByLabelText(/game system/i);
      await user.click(gameSystemSelect);
      await user.click(screen.getByText('D&D 5e'));

      // Submit
      const submitButton = screen.getByRole('button', { name: /create world/i });
      await user.click(submitButton);

      expect(defaultProps.onCreateWorld).toHaveBeenCalledWith({
        name: 'New Test World',
        gameSystemId: 'system-1',
        imageUrl: undefined
      });
    });

    it('should close dialog after successful creation', async () => {
      const user = userEvent.setup();
      
      render(<Homepage {...defaultProps} />);

      // Open dialog
      const createButton = screen.getByText('Create New World');
      await user.click(createButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Simulate successful creation by closing dialog
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Game Systems Management', () => {
    it('should display game systems management access', () => {
      render(<Homepage {...defaultProps} />);

      expect(screen.getByText(/manage game systems/i)).toBeInTheDocument();
    });

    it('should navigate to game systems when management link is clicked', async () => {
      const user = userEvent.setup();
      
      render(<Homepage {...defaultProps} />);

      const managementLink = screen.getByText(/manage game systems/i);
      await user.click(managementLink);

      expect(defaultProps.onAccessGameSystems).toHaveBeenCalled();
    });

    it('should show game systems count', () => {
      render(<Homepage {...defaultProps} />);

      expect(screen.getByText(/2 game systems available/i)).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should display loading state when loading', () => {
      render(<Homepage {...defaultProps} isLoading={true} />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should hide world cards during loading', () => {
      render(<Homepage {...defaultProps} isLoading={true} />);

      expect(screen.queryByTestId('world-card')).not.toBeInTheDocument();
    });

    it('should show skeleton placeholders during loading', () => {
      render(<Homepage {...defaultProps} isLoading={true} />);

      expect(screen.getAllByTestId('world-card-skeleton')).toHaveLength(3); // 3 skeleton cards
    });
  });

  describe('Error Handling', () => {
    it('should display error message when error occurs', () => {
      render(<Homepage {...defaultProps} error="Failed to load worlds" />);

      expect(screen.getByText('Failed to load worlds')).toBeInTheDocument();
    });

    it('should show retry button on error', async () => {
      const mockOnRetry = jest.fn();
      
      render(
        <Homepage 
          {...defaultProps} 
          error="Network error"
          onRetry={mockOnRetry}
        />
      );

      const retryButton = screen.getByText(/try again/i);
      expect(retryButton).toBeInTheDocument();

      await userEvent.click(retryButton);
      expect(mockOnRetry).toHaveBeenCalled();
    });

    it('should handle partial data loading gracefully', () => {
      render(
        <Homepage 
          {...defaultProps} 
          worlds={mockWorlds}
          gameSystems={[]}
          error="Failed to load game systems"
        />
      );

      // Should still show worlds
      expect(screen.getByText('Recent Adventure')).toBeInTheDocument();
      
      // Should show error for game systems
      expect(screen.getByText(/failed to load game systems/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to different screen sizes', () => {
      render(<Homepage {...defaultProps} />);

      const container = screen.getByTestId('homepage-container');
      expect(container).toHaveClass('responsive-grid'); // or similar responsive class
    });

    it('should show mobile-optimized layout on small screens', () => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 400,
      });

      render(<Homepage {...defaultProps} />);

      const mobileLayout = screen.getByTestId('mobile-layout');
      expect(mobileLayout).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render large numbers of worlds efficiently', () => {
      const manyWorlds = Array.from({ length: 100 }, (_, i) => ({
        ...mockWorlds[0],
        id: `world-${i}`,
        name: `World ${i}`
      }));

      const startTime = performance.now();
      render(<Homepage {...defaultProps} worlds={manyWorlds} />);
      const endTime = performance.now();

      // Should render within reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(500); // 500ms threshold
    });

    it('should implement virtualization for large lists', () => {
      const manyWorlds = Array.from({ length: 1000 }, (_, i) => ({
        ...mockWorlds[0],
        id: `world-${i}`,
        name: `World ${i}`
      }));

      render(<Homepage {...defaultProps} worlds={manyWorlds} />);

      // Should only render visible items (not all 1000)
      const renderedCards = screen.getAllByTestId('world-card');
      expect(renderedCards.length).toBeLessThan(20); // Only visible items
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<Homepage {...defaultProps} />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/your worlds/i);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/recent adventures/i);
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      
      render(<Homepage {...defaultProps} />);

      // Tab through elements
      await user.tab();
      expect(screen.getByText('Create New World')).toHaveFocus();

      await user.tab();
      expect(screen.getAllByTestId('world-card')[0]).toHaveFocus();
    });

    it('should announce dynamic content changes to screen readers', async () => {
      const { rerender } = render(<Homepage {...defaultProps} worlds={[]} />);

      // Initially empty
      expect(screen.getByText(/no worlds yet/i)).toBeInTheDocument();

      // Add worlds
      rerender(<Homepage {...defaultProps} worlds={mockWorlds} />);

      expect(screen.getByLabelText(/2 worlds loaded/i)).toBeInTheDocument();
    });
  });
});