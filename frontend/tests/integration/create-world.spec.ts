import { test, expect } from '@playwright/test';

test.describe('Create New World Integration', () => {
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
      isActive: true
    }
  ];

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Mock existing worlds
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

  test('should open create world dialog when clicking Create New World', async ({ page }) => {
    // Given: User is on the homepage
    await expect(page.locator('text=No worlds yet')).toBeVisible();

    // When: User clicks "Create New World"
    await page.click('button:has-text("Create New World")');

    // Then: Dialog opens with form fields
    await expect(page.locator('role=dialog')).toBeVisible();
    await expect(page.locator('text=Create New World')).toBeVisible(); // Dialog title
    
    // Form fields are present
    await expect(page.locator('input[placeholder*="world name" i]')).toBeVisible();
    await expect(page.locator('input[placeholder*="image url" i]')).toBeVisible();
    await expect(page.locator('select, [role="combobox"]')).toBeVisible(); // Game system selector
    await expect(page.locator('button:has-text("Create World")')).toBeVisible();
  });

  test('should complete full world creation flow', async ({ page }) => {
    // Mock world creation endpoint
    await page.route('/api/worlds', async (route) => {
      if (route.request().method() === 'POST') {
        const requestBody = route.request().postDataJSON();
        
        const newWorld = {
          id: 'new-world-id',
          name: requestBody.name,
          imageUrl: requestBody.imageUrl,
          gameSystem: {
            id: requestBody.gameSystemId,
            name: 'D&D 5e',
            defaultImageUrl: 'https://example.com/dnd5e.jpg'
          },
          lastAccessedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(newWorld)
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      }
    });

    // Mock launch endpoint for immediate launch
    await page.route('/api/worlds/new-world-id/launch', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          worldId: 'new-world-id',
          launchUrl: '/game/new-world-id',
          lastAccessedAt: new Date().toISOString()
        })
      });
    });

    // Given: User wants to create a new world
    await page.click('button:has-text("Create New World")');
    await expect(page.locator('role=dialog')).toBeVisible();

    // When: User fills in the needed info
    await page.fill('input[placeholder*="world name" i]', 'Test Adventure');
    await page.fill('input[placeholder*="image url" i]', 'https://example.com/adventure.jpg');
    
    // Select game system
    await page.click('[role="combobox"], select');
    await page.click('text=D&D 5e');

    // And clicks "Create World" button
    await page.click('button:has-text("Create World")');

    // Then: World is created and immediately launches
    await expect(page).toHaveURL('/game/new-world-id');
  });

  test('should validate required fields', async ({ page }) => {
    // Given: User opens create world dialog
    await page.click('button:has-text("Create New World")');
    await expect(page.locator('role=dialog')).toBeVisible();

    // When: User tries to submit without required fields
    await page.click('button:has-text("Create World")');

    // Then: Validation errors are shown
    await expect(page.locator('text=World name is required')).toBeVisible();
    await expect(page.locator('text=Game system is required')).toBeVisible();

    // Dialog should remain open
    await expect(page.locator('role=dialog')).toBeVisible();
  });

  test('should validate world name length constraints', async ({ page }) => {
    // Given: User opens create world dialog
    await page.click('button:has-text("Create New World")');

    // When: User enters name that's too long (>255 characters)
    const longName = 'a'.repeat(256);
    await page.fill('input[placeholder*="world name" i]', longName);
    await page.click('button:has-text("Create World")');

    // Then: Validation error is shown
    await expect(page.locator('text=World name must be 255 characters or less')).toBeVisible();
  });

  test('should support UTF-8 characters in world names', async ({ page }) => {
    // Mock world creation
    await page.route('/api/worlds', async (route) => {
      if (route.request().method() === 'POST') {
        const requestBody = route.request().postDataJSON();
        
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'utf8-world',
            name: requestBody.name,
            gameSystem: {
              id: 'system-1',
              name: 'D&D 5e',
              defaultImageUrl: 'https://example.com/dnd5e.jpg'
            },
            lastAccessedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          })
        });
      } else {
        await route.fulfill({ status: 200, body: '[]' });
      }
    });

    await page.route('/api/worlds/utf8-world/launch', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          worldId: 'utf8-world',
          launchUrl: '/game/utf8-world',
          lastAccessedAt: new Date().toISOString()
        })
      });
    });

    // Given: User wants to create world with UTF-8 name
    await page.click('button:has-text("Create New World")');

    // When: User enters UTF-8 characters
    const utf8Name = 'Мой мир приключений 🎲🗡️';
    await page.fill('input[placeholder*="world name" i]', utf8Name);
    
    await page.click('[role="combobox"], select');
    await page.click('text=D&D 5e');
    
    await page.click('button:has-text("Create World")');

    // Then: World is created successfully with UTF-8 name
    await expect(page).toHaveURL('/game/utf8-world');
  });

  test('should validate image URL format', async ({ page }) => {
    // Given: User opens create world dialog
    await page.click('button:has-text("Create New World")');

    // When: User enters invalid image URL
    await page.fill('input[placeholder*="world name" i]', 'Valid Name');
    await page.fill('input[placeholder*="image url" i]', 'not-a-valid-url');
    
    await page.click('[role="combobox"], select');
    await page.click('text=D&D 5e');
    
    await page.click('button:has-text("Create World")');

    // Then: Validation error is shown
    await expect(page.locator('text=Please enter a valid URL')).toBeVisible();
  });

  test('should allow optional image URL', async ({ page }) => {
    // Mock world creation without image
    await page.route('/api/worlds', async (route) => {
      if (route.request().method() === 'POST') {
        const requestBody = route.request().postDataJSON();
        
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'no-image-world',
            name: requestBody.name,
            // No imageUrl provided
            gameSystem: {
              id: 'system-1',
              name: 'D&D 5e',
              defaultImageUrl: 'https://example.com/dnd5e.jpg'
            },
            lastAccessedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          })
        });
      } else {
        await route.fulfill({ status: 200, body: '[]' });
      }
    });

    await page.route('/api/worlds/no-image-world/launch', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          worldId: 'no-image-world',
          launchUrl: '/game/no-image-world',
          lastAccessedAt: new Date().toISOString()
        })
      });
    });

    // Given: User creates world without custom image
    await page.click('button:has-text("Create New World")');
    
    // When: User fills only required fields
    await page.fill('input[placeholder*="world name" i]', 'Simple World');
    // Leave image URL empty
    
    await page.click('[role="combobox"], select');
    await page.click('text=D&D 5e');
    
    await page.click('button:has-text("Create World")');

    // Then: World is created successfully without image
    await expect(page).toHaveURL('/game/no-image-world');
  });

  test('should show loading state during creation', async ({ page }) => {
    // Mock slow world creation
    await page.route('/api/worlds', async (route) => {
      if (route.request().method() === 'POST') {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
        
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'slow-world',
            name: 'Slow World',
            gameSystem: {
              id: 'system-1',
              name: 'D&D 5e',
              defaultImageUrl: 'https://example.com/dnd5e.jpg'
            },
            lastAccessedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          })
        });
      } else {
        await route.fulfill({ status: 200, body: '[]' });
      }
    });

    // Given: User fills out form
    await page.click('button:has-text("Create New World")');
    await page.fill('input[placeholder*="world name" i]', 'Loading Test');
    
    await page.click('[role="combobox"], select');
    await page.click('text=D&D 5e');

    // When: User submits form
    await page.click('button:has-text("Create World")');

    // Then: Loading state is shown
    await expect(page.locator('button:has-text("Creating...")')).toBeVisible();
    await expect(page.locator('button:has-text("Creating...")')).toBeDisabled();
    
    // Loading spinner should be visible
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
  });

  test('should handle creation errors', async ({ page }) => {
    // Mock creation failure
    await page.route('/api/worlds', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'World name already exists',
            statusCode: 400
          })
        });
      } else {
        await route.fulfill({ status: 200, body: '[]' });
      }
    });

    // Given: User submits valid form
    await page.click('button:has-text("Create New World")');
    await page.fill('input[placeholder*="world name" i]', 'Duplicate Name');
    
    await page.click('[role="combobox"], select');
    await page.click('text=D&D 5e');
    
    await page.click('button:has-text("Create World")');

    // When: Creation fails
    // Then: Error message is displayed
    await expect(page.locator('text=World name already exists')).toBeVisible();
    
    // Dialog remains open for correction
    await expect(page.locator('role=dialog')).toBeVisible();
    await expect(page.locator('button:has-text("Create World")')).toBeEnabled();
  });

  test('should close dialog on cancel', async ({ page }) => {
    // Given: User opens create dialog
    await page.click('button:has-text("Create New World")');
    await expect(page.locator('role=dialog')).toBeVisible();

    // When: User clicks cancel
    await page.click('button:has-text("Cancel")');

    // Then: Dialog closes
    await expect(page.locator('role=dialog')).not.toBeVisible();
  });

  test('should close dialog on escape key', async ({ page }) => {
    // Given: User opens create dialog
    await page.click('button:has-text("Create New World")');
    await expect(page.locator('role=dialog')).toBeVisible();

    // When: User presses Escape
    await page.keyboard.press('Escape');

    // Then: Dialog closes
    await expect(page.locator('role=dialog')).not.toBeVisible();
  });

  test('should reset form after successful creation', async ({ page }) => {
    // Mock successful creation
    await page.route('/api/worlds', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'reset-test-world',
            name: 'Reset Test',
            gameSystem: {
              id: 'system-1',
              name: 'D&D 5e',
              defaultImageUrl: 'https://example.com/dnd5e.jpg'
            },
            lastAccessedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          })
        });
      } else {
        await route.fulfill({ status: 200, body: '[]' });
      }
    });

    await page.route('/api/worlds/reset-test-world/launch', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          worldId: 'reset-test-world',
          launchUrl: '/game/reset-test-world',
          lastAccessedAt: new Date().toISOString()
        })
      });
    });

    // Given: User creates a world
    await page.click('button:has-text("Create New World")');
    await page.fill('input[placeholder*="world name" i]', 'Reset Test');
    await page.fill('input[placeholder*="image url" i]', 'https://example.com/test.jpg');
    
    await page.click('[role="combobox"], select');
    await page.click('text=D&D 5e');
    
    await page.click('button:has-text("Create World")');

    // World creation succeeds and launches
    await expect(page).toHaveURL('/game/reset-test-world');

    // When: User returns to homepage and opens dialog again
    await page.goto('/');
    await page.click('button:has-text("Create New World")');

    // Then: Form should be reset
    await expect(page.locator('input[placeholder*="world name" i]')).toHaveValue('');
    await expect(page.locator('input[placeholder*="image url" i]')).toHaveValue('');
  });

  test('should handle no available game systems', async ({ page }) => {
    // Mock empty game systems
    await page.route('/api/game-systems', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Given: No game systems available
    await page.click('button:has-text("Create New World")');

    // When: Dialog opens
    // Then: User is informed and creation is disabled
    await expect(page.locator('text=No game systems available')).toBeVisible();
    await expect(page.locator('button:has-text("Create World")')).toBeDisabled();
  });

  test('should be keyboard accessible', async ({ page }) => {
    // Given: User navigates with keyboard
    await page.keyboard.press('Tab'); // Focus first element
    await page.keyboard.press('Tab'); // Focus create button
    
    await page.keyboard.press('Enter'); // Open dialog
    await expect(page.locator('role=dialog')).toBeVisible();

    // Form should be keyboard navigable
    await page.keyboard.press('Tab'); // Name field
    await page.keyboard.type('Keyboard Test');
    
    await page.keyboard.press('Tab'); // Image URL field
    await page.keyboard.type('https://example.com/test.jpg');
    
    await page.keyboard.press('Tab'); // Game system selector
    await page.keyboard.press('Enter'); // Open dropdown
    await page.keyboard.press('ArrowDown'); // Select first option
    await page.keyboard.press('Enter'); // Confirm selection
    
    await page.keyboard.press('Tab'); // Create button
    await page.keyboard.press('Tab'); // Cancel button
    await page.keyboard.press('Tab'); // Should wrap to Create button
    
    // Should be able to submit with Enter
    expect(await page.locator('button:has-text("Create World")').isEnabled()).toBe(true);
  });
});