import { test, expect } from '@playwright/test';

test.describe('Game Systems Management Integration', () => {
  const mockGameSystems = [
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
      description: 'Pathfinder Second Edition',
      isActive: true
    },
    {
      id: 'system-3',
      name: 'Call of Cthulhu',
      defaultImageUrl: 'https://example.com/cthulhu.jpg',
      isActive: false
    }
  ];

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Mock empty worlds for clean homepage
    await page.route('/api/worlds', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    // Mock game systems
    await page.route('/api/game-systems', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockGameSystems)
      });
    });

    await page.waitForLoadState('networkidle');
  });

  test('should display game systems management access on homepage', async ({ page }) => {
    // Given: User is on the homepage
    // Then: Game systems management access is visible
    await expect(page.locator('text=Manage Game Systems')).toBeVisible();
    await expect(page.locator('text=2 game systems available')).toBeVisible(); // Only active systems
  });

  test('should navigate to game systems management when clicked', async ({ page }) => {
    // Given: User sees game systems management link
    await expect(page.locator('text=Manage Game Systems')).toBeVisible();

    // When: User accesses game systems management
    await page.click('text=Manage Game Systems');

    // Then: Navigation to game systems interface occurs
    await expect(page).toHaveURL('/game-systems');
    await expect(page.locator('h1:has-text("Game Systems Management")')).toBeVisible();
  });

  test('should display all game systems in management interface', async ({ page }) => {
    // Mock game systems management page
    await page.goto('/game-systems');
    
    await page.route('/api/game-systems', async (route) => {
      // Include inactive systems in management view
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockGameSystems)
      });
    });

    await page.waitForLoadState('networkidle');

    // Given: User navigates to game systems management
    // Then: All game systems are displayed
    await expect(page.locator('text=D&D 5e')).toBeVisible();
    await expect(page.locator('text=Pathfinder 2e')).toBeVisible();
    await expect(page.locator('text=Call of Cthulhu')).toBeVisible();

    // Active/inactive status should be shown
    await expect(page.locator('[data-testid="system-status-active"]')).toHaveCount(2);
    await expect(page.locator('[data-testid="system-status-inactive"]')).toHaveCount(1);
  });

  test('should allow toggling game system active status', async ({ page }) => {
    await page.goto('/game-systems');
    
    // Mock update endpoint
    await page.route('/api/game-systems/system-3', async (route) => {
      if (route.request().method() === 'PATCH') {
        const requestBody = route.request().postDataJSON();
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...mockGameSystems[2],
            isActive: requestBody.isActive
          })
        });
      }
    });

    await page.waitForLoadState('networkidle');

    // Given: Inactive game system exists
    const cthulhuSystem = page.locator('[data-testid="game-system-system-3"]');
    await expect(cthulhuSystem).toContainText('Call of Cthulhu');
    await expect(cthulhuSystem.locator('[data-testid="system-status-inactive"]')).toBeVisible();

    // When: User toggles system to active
    await cthulhuSystem.locator('button:has-text("Activate")').click();

    // Then: System becomes active
    await expect(cthulhuSystem.locator('[data-testid="system-status-active"]')).toBeVisible();
    await expect(cthulhuSystem.locator('button:has-text("Deactivate")')).toBeVisible();
  });

  test('should allow adding new game system', async ({ page }) => {
    await page.goto('/game-systems');

    // Mock create endpoint
    await page.route('/api/game-systems', async (route) => {
      if (route.request().method() === 'POST') {
        const requestBody = route.request().postDataJSON();
        
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'new-system-id',
            ...requestBody,
            isActive: true
          })
        });
      }
    });

    await page.waitForLoadState('networkidle');

    // Given: User wants to add new game system
    await page.click('button:has-text("Add Game System")');
    
    await expect(page.locator('role=dialog')).toBeVisible();
    await expect(page.locator('text=Add New Game System')).toBeVisible();

    // When: User fills out form
    await page.fill('input[placeholder*="system name" i]', 'Vampire: The Masquerade');
    await page.fill('input[placeholder*="default image" i]', 'https://example.com/vampire.jpg');
    await page.fill('textarea[placeholder*="description" i]', 'World of Darkness vampire RPG');

    await page.click('button:has-text("Add System")');

    // Then: New system is added and visible
    await expect(page.locator('text=Vampire: The Masquerade')).toBeVisible();
  });

  test('should allow editing existing game system', async ({ page }) => {
    await page.goto('/game-systems');

    // Mock update endpoint
    await page.route('/api/game-systems/system-1', async (route) => {
      if (route.request().method() === 'PUT') {
        const requestBody = route.request().postDataJSON();
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'system-1',
            ...requestBody
          })
        });
      }
    });

    await page.waitForLoadState('networkidle');

    // Given: Existing game system
    const dndSystem = page.locator('[data-testid="game-system-system-1"]');
    await expect(dndSystem).toContainText('D&D 5e');

    // When: User edits system
    await dndSystem.locator('button[aria-label="Edit system"]').click();
    
    await expect(page.locator('role=dialog')).toBeVisible();
    await expect(page.locator('text=Edit Game System')).toBeVisible();

    // Update description
    const descriptionField = page.locator('textarea[placeholder*="description" i]');
    await descriptionField.clear();
    await descriptionField.fill('Updated: Dungeons & Dragons 5th Edition - Fantasy RPG');

    await page.click('button:has-text("Save Changes")');

    // Then: System is updated
    await expect(page.locator('text=Updated: Dungeons & Dragons 5th Edition')).toBeVisible();
  });

  test('should allow deleting game system', async ({ page }) => {
    await page.goto('/game-systems');

    // Mock delete endpoint
    await page.route('/api/game-systems/system-3', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 204,
          body: ''
        });
      }
    });

    await page.waitForLoadState('networkidle');

    // Given: Inactive game system (safe to delete)
    const cthulhuSystem = page.locator('[data-testid="game-system-system-3"]');
    await expect(cthulhuSystem).toContainText('Call of Cthulhu');

    // When: User deletes system
    await cthulhuSystem.locator('button[aria-label="Delete system"]').click();
    
    // Confirm deletion
    await expect(page.locator('text=Are you sure you want to delete')).toBeVisible();
    await page.click('button:has-text("Delete System")');

    // Then: System is removed
    await expect(page.locator('text=Call of Cthulhu')).not.toBeVisible();
  });

  test('should prevent deletion of systems with active worlds', async ({ page }) => {
    // Mock worlds using the system
    await page.route('/api/worlds', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'world-1',
            name: 'Active Campaign',
            gameSystemId: 'system-1',
            gameSystem: {
              id: 'system-1',
              name: 'D&D 5e',
              defaultImageUrl: 'https://example.com/dnd5e.jpg'
            },
            lastAccessedAt: '2024-12-19T10:00:00.000Z',
            createdAt: '2024-12-19T09:00:00.000Z'
          }
        ])
      });
    });

    await page.goto('/game-systems');
    await page.waitForLoadState('networkidle');

    // Given: Game system with active worlds
    const dndSystem = page.locator('[data-testid="game-system-system-1"]');
    
    // When: User tries to delete system with active worlds
    await dndSystem.locator('button[aria-label="Delete system"]').click();

    // Then: Deletion is prevented with explanation
    await expect(page.locator('text=Cannot delete game system')).toBeVisible();
    await expect(page.locator('text=1 world using this system')).toBeVisible();
    await expect(page.locator('button:has-text("Delete System")')).toBeDisabled();
  });

  test('should show system usage statistics', async ({ page }) => {
    // Mock worlds data for statistics
    await page.route('/api/worlds', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'world-1',
            name: 'Campaign 1',
            gameSystemId: 'system-1',
            gameSystem: { id: 'system-1', name: 'D&D 5e', defaultImageUrl: 'https://example.com/dnd5e.jpg' },
            lastAccessedAt: '2024-12-19T10:00:00.000Z',
            createdAt: '2024-12-19T09:00:00.000Z'
          },
          {
            id: 'world-2', 
            name: 'Campaign 2',
            gameSystemId: 'system-1',
            gameSystem: { id: 'system-1', name: 'D&D 5e', defaultImageUrl: 'https://example.com/dnd5e.jpg' },
            lastAccessedAt: '2024-12-18T10:00:00.000Z',
            createdAt: '2024-12-18T09:00:00.000Z'
          },
          {
            id: 'world-3',
            name: 'Horror Campaign',
            gameSystemId: 'system-3',
            gameSystem: { id: 'system-3', name: 'Call of Cthulhu', defaultImageUrl: 'https://example.com/cthulhu.jpg' },
            lastAccessedAt: '2024-12-17T10:00:00.000Z',
            createdAt: '2024-12-17T09:00:00.000Z'
          }
        ])
      });
    });

    await page.goto('/game-systems');
    await page.waitForLoadState('networkidle');

    // Given: Systems with different usage
    // Then: Usage statistics are displayed
    const dndSystem = page.locator('[data-testid="game-system-system-1"]');
    await expect(dndSystem).toContainText('2 worlds'); // 2 worlds using D&D 5e

    const pathfinderSystem = page.locator('[data-testid="game-system-system-2"]');
    await expect(pathfinderSystem).toContainText('0 worlds'); // No worlds using Pathfinder

    const cthulhuSystem = page.locator('[data-testid="game-system-system-3"]');
    await expect(cthulhuSystem).toContainText('1 world'); // 1 world using Call of Cthulhu
  });

  test('should handle import of new game system ruleset', async ({ page }) => {
    await page.goto('/game-systems');

    // Mock file upload endpoint
    await page.route('/api/game-systems/import', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'imported-system',
            name: 'Imported System',
            defaultImageUrl: 'https://example.com/imported.jpg',
            description: 'Imported from rulebook file',
            isActive: true,
            rulesetConfig: { imported: true }
          })
        });
      }
    });

    await page.waitForLoadState('networkidle');

    // Given: User wants to import ruleset
    await page.click('button:has-text("Import Ruleset")');
    
    await expect(page.locator('role=dialog')).toBeVisible();
    await expect(page.locator('text=Import Game System')).toBeVisible();

    // When: User uploads ruleset file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'custom-system.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify({
        name: 'Custom System',
        rules: { dice: 'd20' }
      }))
    });

    await page.fill('input[placeholder*="system name" i]', 'Imported Custom System');
    await page.click('button:has-text("Import System")');

    // Then: System is imported and available
    await expect(page.locator('text=Imported Custom System')).toBeVisible();
  });

  test('should filter and search game systems', async ({ page }) => {
    await page.goto('/game-systems');
    await page.waitForLoadState('networkidle');

    // Given: Multiple game systems exist
    await expect(page.locator('[data-testid^="game-system-"]')).toHaveCount(3);

    // When: User searches for specific system
    await page.fill('input[placeholder*="search systems" i]', 'D&D');

    // Then: Only matching systems are shown
    await expect(page.locator('text=D&D 5e')).toBeVisible();
    await expect(page.locator('text=Pathfinder 2e')).not.toBeVisible();
    await expect(page.locator('text=Call of Cthulhu')).not.toBeVisible();

    // When: User filters by active status
    await page.fill('input[placeholder*="search systems" i]', '');
    await page.selectOption('select[aria-label="Filter by status"]', 'active');

    // Then: Only active systems are shown
    await expect(page.locator('text=D&D 5e')).toBeVisible();
    await expect(page.locator('text=Pathfinder 2e')).toBeVisible();
    await expect(page.locator('text=Call of Cthulhu')).not.toBeVisible();
  });

  test('should be accessible via keyboard navigation from homepage', async ({ page }) => {
    // Given: User on homepage using keyboard
    await page.keyboard.press('Tab'); // Create New World button
    await page.keyboard.press('Tab'); // Manage Game Systems link
    
    const managementLink = page.locator('text=Manage Game Systems');
    await expect(managementLink).toBeFocused();

    // When: User presses Enter
    await page.keyboard.press('Enter');

    // Then: Navigates to game systems management
    await expect(page).toHaveURL('/game-systems');
  });

  test('should handle game systems loading errors', async ({ page }) => {
    // Mock error response
    await page.route('/api/game-systems', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Failed to load game systems',
          statusCode: 500
        })
      });
    });

    await page.goto('/game-systems');

    // Given: Error loading game systems
    // Then: Error state is displayed
    await expect(page.locator('text=Failed to load game systems')).toBeVisible();
    await expect(page.locator('button:has-text("Retry")')).toBeVisible();

    // User can retry loading
    await page.click('button:has-text("Retry")');
    // Should attempt to reload systems
  });

  test('should show empty state when no game systems exist', async ({ page }) => {
    // Mock empty response
    await page.route('/api/game-systems', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.goto('/game-systems');
    await page.waitForLoadState('networkidle');

    // Given: No game systems exist
    // Then: Empty state is displayed
    await expect(page.locator('text=No game systems configured')).toBeVisible();
    await expect(page.locator('text=Add your first game system')).toBeVisible();
    await expect(page.locator('button:has-text("Add Game System")')).toBeVisible();
  });
});