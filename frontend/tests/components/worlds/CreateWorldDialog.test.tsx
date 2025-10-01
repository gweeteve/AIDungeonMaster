import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateWorldDialog } from '../../../src/components/worlds/CreateWorldDialog';
import { GameSystemResponse } from '../../../src/types';

const mockGameSystems: GameSystemResponse[] = [
  {
    id: 'system-1',
    name: 'D&D 5e',
    defaultImageUrl: 'https://example.com/dnd5e.jpg',
    description: 'Dungeons & Dragons 5th Edition',
    isActive: true
  },
  {
    id: 'system-2',
    name: 'Pathfinder 2e',
    defaultImageUrl: 'https://example.com/pf2e.jpg',
    isActive: true
  }
];

describe('CreateWorldDialog Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnClose.mockClear();
  });

  describe('Dialog Rendering', () => {
    it('should render when open', () => {
      render(
        <CreateWorldDialog
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          gameSystems={mockGameSystems}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Create New World')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(
        <CreateWorldDialog
          isOpen={false}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          gameSystems={mockGameSystems}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should display all form fields', () => {
      render(
        <CreateWorldDialog
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          gameSystems={mockGameSystems}
        />
      );

      expect(screen.getByLabelText(/world name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/image url/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/game system/i)).toBeInTheDocument();
      expect(screen.getByText('Create World')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should populate game system dropdown', () => {
      render(
        <CreateWorldDialog
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          gameSystems={mockGameSystems}
        />
      );

      const gameSystemSelect = screen.getByLabelText(/game system/i);
      fireEvent.click(gameSystemSelect);

      expect(screen.getByText('D&D 5e')).toBeInTheDocument();
      expect(screen.getByText('Pathfinder 2e')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should require world name', async () => {
      const user = userEvent.setup();
      
      render(
        <CreateWorldDialog
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          gameSystems={mockGameSystems}
        />
      );

      const submitButton = screen.getByText('Create World');
      await user.click(submitButton);

      expect(screen.getByText(/world name is required/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should require game system selection', async () => {
      const user = userEvent.setup();
      
      render(
        <CreateWorldDialog
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          gameSystems={mockGameSystems}
        />
      );

      const nameInput = screen.getByLabelText(/world name/i);
      await user.type(nameInput, 'Test World');

      const submitButton = screen.getByText('Create World');
      await user.click(submitButton);

      expect(screen.getByText(/game system is required/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate world name length (1-255 characters)', async () => {
      const user = userEvent.setup();
      
      render(
        <CreateWorldDialog
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          gameSystems={mockGameSystems}
        />
      );

      // Test empty name
      const nameInput = screen.getByLabelText(/world name/i);
      await user.clear(nameInput);
      
      const submitButton = screen.getByText('Create World');
      await user.click(submitButton);

      expect(screen.getByText(/world name is required/i)).toBeInTheDocument();

      // Test name too long (256 characters)
      const longName = 'a'.repeat(256);
      await user.clear(nameInput);
      await user.type(nameInput, longName);
      await user.click(submitButton);

      expect(screen.getByText(/world name must be 255 characters or less/i)).toBeInTheDocument();
    });

    it('should accept UTF-8 characters in world name', async () => {
      const user = userEvent.setup();
      
      render(
        <CreateWorldDialog
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          gameSystems={mockGameSystems}
        />
      );

      const nameInput = screen.getByLabelText(/world name/i);
      const utf8Name = 'Мой мир приключений 🎲🗡️';
      
      await user.type(nameInput, utf8Name);
      
      expect(nameInput).toHaveValue(utf8Name);
    });

    it('should validate image URL format when provided', async () => {
      const user = userEvent.setup();
      
      render(
        <CreateWorldDialog
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          gameSystems={mockGameSystems}
        />
      );

      const imageUrlInput = screen.getByLabelText(/image url/i);
      await user.type(imageUrlInput, 'invalid-url');
      
      const submitButton = screen.getByText('Create World');
      await user.click(submitButton);

      expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument();
    });

    it('should allow empty image URL (optional field)', async () => {
      const user = userEvent.setup();
      
      render(
        <CreateWorldDialog
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          gameSystems={mockGameSystems}
        />
      );

      const nameInput = screen.getByLabelText(/world name/i);
      await user.type(nameInput, 'Test World');

      const gameSystemSelect = screen.getByLabelText(/game system/i);
      await user.click(gameSystemSelect);
      await user.click(screen.getByText('D&D 5e'));

      // Leave image URL empty
      const submitButton = screen.getByText('Create World');
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Test World',
        gameSystemId: 'system-1',
        imageUrl: undefined
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit valid form data', async () => {
      const user = userEvent.setup();
      
      render(
        <CreateWorldDialog
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          gameSystems={mockGameSystems}
        />
      );

      const nameInput = screen.getByLabelText(/world name/i);
      await user.type(nameInput, 'My Adventure');

      const imageUrlInput = screen.getByLabelText(/image url/i);
      await user.type(imageUrlInput, 'https://example.com/adventure.jpg');

      const gameSystemSelect = screen.getByLabelText(/game system/i);
      await user.click(gameSystemSelect);
      await user.click(screen.getByText('Pathfinder 2e'));

      const submitButton = screen.getByText('Create World');
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'My Adventure',
        gameSystemId: 'system-2',
        imageUrl: 'https://example.com/adventure.jpg'
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      
      render(
        <CreateWorldDialog
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          gameSystems={mockGameSystems}
          isLoading={true}
        />
      );

      const submitButton = screen.getByText('Creating...');
      expect(submitButton).toBeDisabled();
    });

    it('should reset form after successful submission', async () => {
      const user = userEvent.setup();
      
      render(
        <CreateWorldDialog
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          gameSystems={mockGameSystems}
        />
      );

      const nameInput = screen.getByLabelText(/world name/i);
      await user.type(nameInput, 'Test World');

      const gameSystemSelect = screen.getByLabelText(/game system/i);
      await user.click(gameSystemSelect);
      await user.click(screen.getByText('D&D 5e'));

      const submitButton = screen.getByText('Create World');
      await user.click(submitButton);

      // After submission, form should be reset
      await waitFor(() => {
        expect(nameInput).toHaveValue('');
      });
    });
  });

  describe('Dialog Interactions', () => {
    it('should close dialog when cancel button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <CreateWorldDialog
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          gameSystems={mockGameSystems}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close dialog when clicking outside', async () => {
      const user = userEvent.setup();
      
      render(
        <CreateWorldDialog
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          gameSystems={mockGameSystems}
        />
      );

      const overlay = screen.getByTestId('dialog-overlay');
      await user.click(overlay);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should close dialog when pressing Escape key', async () => {
      const user = userEvent.setup();
      
      render(
        <CreateWorldDialog
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          gameSystems={mockGameSystems}
        />
      );

      await user.keyboard('{Escape}');

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <CreateWorldDialog
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          gameSystems={mockGameSystems}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-describedby');
    });

    it('should focus first input when opened', () => {
      render(
        <CreateWorldDialog
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          gameSystems={mockGameSystems}
        />
      );

      const nameInput = screen.getByLabelText(/world name/i);
      expect(nameInput).toHaveFocus();
    });

    it('should trap focus within dialog', async () => {
      const user = userEvent.setup();
      
      render(
        <CreateWorldDialog
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          gameSystems={mockGameSystems}
        />
      );

      // Tab through all focusable elements
      await user.tab();
      await user.tab();
      await user.tab();
      await user.tab();
      await user.tab();

      // Focus should wrap back to first element
      const nameInput = screen.getByLabelText(/world name/i);
      expect(nameInput).toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    it('should handle empty game systems list', () => {
      render(
        <CreateWorldDialog
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          gameSystems={[]}
        />
      );

      expect(screen.getByText(/no game systems available/i)).toBeInTheDocument();
      expect(screen.getByText('Create World')).toBeDisabled();
    });

    it('should display submission errors', () => {
      render(
        <CreateWorldDialog
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          gameSystems={mockGameSystems}
          error="Failed to create world"
        />
      );

      expect(screen.getByText('Failed to create world')).toBeInTheDocument();
    });
  });
});