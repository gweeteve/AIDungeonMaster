import { test, expect } from '@playwright/test';

// This is a comprehensive E2E test suite covering all quickstart scenarios
test.describe('Homepage World Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses to ensure consistent test data
    await page.route('/api/worlds', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 'world-1',
              name: 'Epic Campaign',
              imageUrl: 'https://example.com/epic.jpg',
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
              name: 'Mystery Adventure',
              gameSystem: {
                id: 'system-2',
                name: 'Call of Cthulhu',
                defaultImageUrl: 'https://example.com/cthulhu.jpg'
              },
              lastAccessedAt: '2024-12-18T10:00:00.000Z',
              createdAt: '2024-12-18T09:00:00.000Z'
            }
          ])
        });
      }
    });

    await page.route('/api/game-systems', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'system-1',
            name: 'D&D 5e',
            defaultImageUrl: 'https://example.com/dnd.jpg',
            description: 'Dungeons & Dragons 5th Edition',
            isActive: true
          },
          {
            id: 'system-2',
            name: 'Call of Cthulhu',
            defaultImageUrl: 'https://example.com/cthulhu.jpg',
            isActive: true
          }
        ])
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Full user journey: View worlds, launch world, return and create new world', async ({ page }) => {
    // Step 1: Verify worlds are displayed correctly
    await expect(page.locator('[data-testid="world-card"]')).toHaveCount(2);
    await expect(page.locator('text=Epic Campaign')).toBeVisible();
    await expect(page.locator('text=Mystery Adventure')).toBeVisible();
    
    // Verify sorting (Epic Campaign should be first - more recent)
    const worldCards = page.locator('[data-testid="world-card"]');
    await expect(worldCards.first()).toContainText('Epic Campaign');

    // Step 2: Launch a world
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

    await worldCards.first().click();
    await expect(page).toHaveURL('/game/world-1');

    // Step 3: Return to homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Step 4: Create a new world
    await page.route('/api/worlds', async (route) => {
      if (route.request().method() === 'POST') {
        const requestBody = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'new-world-id',
            name: requestBody.name,
            imageUrl: requestBody.imageUrl,
            gameSystem: {
              id: requestBody.gameSystemId,
              name: 'D&D 5e',
              defaultImageUrl: 'https://example.com/dnd.jpg'
            },
            lastAccessedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          })
        });
      }
    });

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

    // Open create dialog
    await page.click('button:has-text("Create New World")');
    await expect(page.locator('role=dialog')).toBeVisible();

    // Fill form
    await page.fill('input[placeholder*="world name" i]', 'Test E2E World');
    await page.fill('input[placeholder*="image url" i]', 'https://example.com/test-e2e.jpg');
    await page.click('[role="combobox"]');
    await page.click('text=D&D 5e');

    // Submit and verify launch
    await page.click('button:has-text("Create World")');
    await expect(page).toHaveURL('/game/new-world-id');
  });

  test('Handle image loading and fallbacks', async ({ page }) => {
    // Test image fallback behavior
    const firstCard = page.locator('[data-testid="world-card"]').first();
    const images = firstCard.locator('img');
    
    // Should have at least the fallback image visible
    await expect(images.first()).toBeVisible();
    
    // Verify alt text is present
    await expect(images.first()).toHaveAttribute('alt', /Epic Campaign/);
  });

  test('Responsive design on different screen sizes', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('[data-testid="world-card"]')).toHaveCount(2);

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="world-card"]')).toHaveCount(2);

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="mobile-layout"]')).toBeVisible();
    await expect(page.locator('[data-testid="world-card"]')).toHaveCount(2);
  });

  test('Keyboard navigation and accessibility', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab'); // Focus first interactive element
    await page.keyboard.press('Tab'); // Focus create button
    await page.keyboard.press('Tab'); // Focus first world card
    
    const firstCard = page.locator('[data-testid="world-card"]').first();
    await expect(firstCard).toBeFocused();

    // Test Enter key to launch
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

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/game/world-1');
  });

  test('Error handling and recovery', async ({ page }) => {
    // Test network error handling
    await page.route('/api/worlds', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal server error' })
      });
    });

    await page.reload();
    
    // Should show error message
    await expect(page.locator('text=Failed to load worlds')).toBeVisible();
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible();

    // Test retry functionality
    await page.route('/api/worlds', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.click('button:has-text("Try Again")');
    await expect(page.locator('text=No worlds yet')).toBeVisible();
  });

  test('Empty state and first world creation', async ({ page }) => {
    // Mock empty worlds response
    await page.route('/api/worlds', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show empty state
    await expect(page.locator('text=No worlds yet')).toBeVisible();
    await expect(page.locator('text=Create your first world')).toBeVisible();
    
    // Empty state create button should work
    await expect(page.locator('button:has-text("Create Your First World")')).toBeVisible();
  });

  test('Game systems management access', async ({ page }) => {
    // Test game systems management link
    await expect(page.locator('text=Manage Game Systems')).toBeVisible();
    await expect(page.locator('text=2 game systems available')).toBeVisible();

    // Test navigation (mock the route)
    await page.click('text=Manage Game Systems');
    await expect(page).toHaveURL('/game-systems');
  });

  test('Form validation in create world dialog', async ({ page }) => {
    await page.click('button:has-text("Create New World")');
    await expect(page.locator('role=dialog')).toBeVisible();

    // Test validation errors
    await page.click('button:has-text("Create World")');
    await expect(page.locator('text=World name is required')).toBeVisible();
    await expect(page.locator('text=Game system is required')).toBeVisible();

    // Test invalid URL validation
    await page.fill('input[placeholder*="world name" i]', 'Valid Name');
    await page.fill('input[placeholder*="image url" i]', 'invalid-url');
    await page.click('button:has-text("Create World")');
    await expect(page.locator('text=Please enter a valid URL')).toBeVisible();
  });

  test('Performance with many worlds', async ({ page }) => {
    // Mock large dataset
    const manyWorlds = Array.from({ length: 50 }, (_, i) => ({
      id: `world-${i}`,
      name: `World ${i}`,
      gameSystem: {
        id: 'system-1',
        name: 'D&D 5e',
        defaultImageUrl: 'https://example.com/dnd.jpg'
      },
      lastAccessedAt: new Date(Date.now() - i * 1000).toISOString(),
      createdAt: new Date(Date.now() - i * 2000).toISOString()
    }));

    await page.route('/api/worlds', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(manyWorlds)
      });
    });

    const startTime = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Should load within reasonable time
    expect(loadTime).toBeLessThan(5000); // 5 seconds max

    // Should display all worlds
    await expect(page.locator('text=50 worlds ready for adventure')).toBeVisible();
  });
});