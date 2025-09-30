import { test, expect } from '@playwright/test';

test.describe('Launch World Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Setup test data with multiple worlds
    await page.goto('/');
    
    await page.route('/api/worlds', async (route) => {
      const worlds = [
        {
          id: 'world-1',
          name: 'First Adventure',
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
          name: 'Second Adventure',
          gameSystem: {
            id: 'system-1',
            name: 'D&D 5e',
            defaultImageUrl: 'https://example.com/dnd.jpg'
          },
          lastAccessedAt: '2024-12-18T10:00:00.000Z',
          createdAt: '2024-12-18T09:00:00.000Z'
        }
      ];
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(worlds)
      });
    });

    await page.waitForLoadState('networkidle');
  });

  test('should launch world when clicking on world image', async ({ page }) => {
    // Given: User sees worlds on the homepage
    const worldCards = page.locator('[data-testid="world-card"]');
    await expect(worldCards).toHaveCount(2);

    // Mock the launch endpoint
    await page.route('/api/worlds/world-2/launch', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          worldId: 'world-2',
          launchUrl: '/game/world-2',
          lastAccessedAt: '2024-12-19T11:00:00.000Z'
        })
      });
    });

    // When: User clicks on a world's image
    const secondWorldCard = worldCards.nth(1);
    await expect(secondWorldCard).toContainText('Second Adventure');
    
    // Click on the world card/image
    await secondWorldCard.click();

    // Then: World launches and user is navigated to the game session
    await expect(page).toHaveURL('/game/world-2');
  });

  test('should update lastAccessedAt timestamp when launching', async ({ page }) => {
    // Given: Initial world order (First Adventure is more recent)
    const initialFirstCard = page.locator('[data-testid="world-card"]').first();
    await expect(initialFirstCard).toContainText('First Adventure');

    // Mock launch endpoint with updated timestamp
    await page.route('/api/worlds/world-2/launch', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          worldId: 'world-2',
          launchUrl: '/game/world-2',
          lastAccessedAt: new Date().toISOString() // Current time
        })
      });
    });

    // Mock updated worlds list after launch
    await page.route('/api/worlds', async (route) => {
      const updatedWorlds = [
        {
          id: 'world-2',
          name: 'Second Adventure',
          gameSystem: {
            id: 'system-1',
            name: 'D&D 5e',
            defaultImageUrl: 'https://example.com/dnd.jpg'
          },
          lastAccessedAt: new Date().toISOString(), // Now most recent
          createdAt: '2024-12-18T09:00:00.000Z'
        },
        {
          id: 'world-1',
          name: 'First Adventure',
          gameSystem: {
            id: 'system-1',
            name: 'D&D 5e',
            defaultImageUrl: 'https://example.com/dnd.jpg'
          },
          lastAccessedAt: '2024-12-19T10:00:00.000Z',
          createdAt: '2024-12-19T09:00:00.000Z'
        }
      ];
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(updatedWorlds)
      });
    });

    // When: User clicks on second world (which was not first)
    const secondWorldCard = page.locator('[data-testid="world-card"]').nth(1);
    await secondWorldCard.click();

    // Navigate to game, then return to homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Then: Homepage updates world order on return
    const newFirstCard = page.locator('[data-testid="world-card"]').first();
    await expect(newFirstCard).toContainText('Second Adventure'); // Now first
  });

  test('should handle world launch errors', async ({ page }) => {
    // Given: A world that fails to launch
    await page.route('/api/worlds/world-1/launch', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'World not found',
          statusCode: 404
        })
      });
    });

    // When: User tries to launch a world that errors
    const firstWorldCard = page.locator('[data-testid="world-card"]').first();
    await firstWorldCard.click();

    // Then: Error is displayed
    await expect(page.locator('text=Failed to launch world')).toBeVisible();
    await expect(page.locator('text=World not found')).toBeVisible();
    
    // User remains on homepage
    await expect(page).toHaveURL('/');
  });

  test('should show loading state during launch', async ({ page }) => {
    // Given: Slow launch response
    await page.route('/api/worlds/world-1/launch', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          worldId: 'world-1',
          launchUrl: '/game/world-1',
          lastAccessedAt: new Date().toISOString()
        })
      });
    });

    // When: User clicks to launch world
    const firstWorldCard = page.locator('[data-testid="world-card"]').first();
    await firstWorldCard.click();

    // Then: Loading indicator is shown
    await expect(page.locator('[data-testid="launch-loading"]')).toBeVisible();
    await expect(page.locator('text=Launching world...')).toBeVisible();

    // Card should be disabled during loading
    await expect(firstWorldCard).toHaveClass(/disabled/);
  });

  test('should handle concurrent launches correctly', async ({ page }) => {
    // Given: Multiple worlds available
    await expect(page.locator('[data-testid="world-card"]')).toHaveCount(2);

    // Mock launch endpoints
    await page.route('/api/worlds/world-1/launch', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          worldId: 'world-1',
          launchUrl: '/game/world-1',
          lastAccessedAt: new Date().toISOString()
        })
      });
    });

    await page.route('/api/worlds/world-2/launch', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          worldId: 'world-2',
          launchUrl: '/game/world-2',
          lastAccessedAt: new Date().toISOString()
        })
      });
    });

    // When: User rapidly clicks multiple worlds
    const firstCard = page.locator('[data-testid="world-card"]').first();
    const secondCard = page.locator('[data-testid="world-card"]').nth(1);

    // Click first world
    await firstCard.click();
    
    // Should navigate to first world
    await expect(page).toHaveURL('/game/world-1');

    // Go back and try second world
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await secondCard.click();
    
    // Should navigate to second world
    await expect(page).toHaveURL('/game/world-2');
  });

  test('should preserve world launch analytics', async ({ page }) => {
    // Given: Analytics tracking setup
    let launchRequests: any[] = [];
    
    await page.route('/api/worlds/*/launch', async (route) => {
      const url = route.request().url();
      const worldId = url.match(/\/worlds\/([^\/]+)\/launch/)?.[1];
      
      launchRequests.push({
        worldId,
        timestamp: new Date().toISOString(),
        userAgent: route.request().headers()['user-agent']
      });

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          worldId,
          launchUrl: `/game/${worldId}`,
          lastAccessedAt: new Date().toISOString()
        })
      });
    });

    // When: User launches multiple worlds
    const firstCard = page.locator('[data-testid="world-card"]').first();
    await firstCard.click();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const secondCard = page.locator('[data-testid="world-card"]').nth(1);
    await secondCard.click();

    // Then: Launch events are properly tracked
    expect(launchRequests).toHaveLength(2);
    expect(launchRequests[0].worldId).toBe('world-1');
    expect(launchRequests[1].worldId).toBe('world-2');
  });

  test('should handle keyboard navigation for launch', async ({ page }) => {
    // Given: User using keyboard navigation
    const firstCard = page.locator('[data-testid="world-card"]').first();

    // When: User navigates with keyboard
    await page.keyboard.press('Tab'); // Focus first element
    await page.keyboard.press('Tab'); // Focus first world card
    
    await expect(firstCard).toBeFocused();

    // Mock launch endpoint
    await page.route('/api/worlds/world-1/launch', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          worldId: 'world-1',
          launchUrl: '/game/world-1',
          lastAccessedAt: new Date().toISOString()
        })
      });
    });

    // Press Enter to launch
    await page.keyboard.press('Enter');

    // Then: World launches via keyboard
    await expect(page).toHaveURL('/game/world-1');
  });

  test('should handle world launch with session data preservation', async ({ page }) => {
    // Given: World with existing session data
    const worldWithSession = {
      id: 'world-session',
      name: 'Ongoing Campaign',
      gameSystem: {
        id: 'system-1',
        name: 'D&D 5e',
        defaultImageUrl: 'https://example.com/dnd.jpg'
      },
      sessionData: {
        currentChapter: 5,
        playerLevel: 8,
        lastLocation: 'Dragon\'s Lair'
      },
      lastAccessedAt: '2024-12-19T12:00:00.000Z',
      createdAt: '2024-12-19T09:00:00.000Z'
    };

    await page.route('/api/worlds', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([worldWithSession])
      });
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Mock launch with session data
    await page.route('/api/worlds/world-session/launch', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          worldId: 'world-session',
          launchUrl: '/game/world-session?chapter=5&level=8',
          lastAccessedAt: new Date().toISOString()
        })
      });
    });

    // When: User launches world with session data
    const worldCard = page.locator('[data-testid="world-card"]').first();
    await worldCard.click();

    // Then: Session data is preserved in launch URL
    await expect(page).toHaveURL('/game/world-session?chapter=5&level=8');
  });
});