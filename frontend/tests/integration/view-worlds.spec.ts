import { test, expect } from '@playwright/test';

test.describe('View Existing Worlds Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Setup test data
    await page.goto('/');
    
    // Mock API responses
    await page.route('/api/worlds', async (route) => {
      const worlds = [
        {
          id: 'world-1',
          name: 'Epic Adventure',
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
          name: 'Mystery Quest',
          gameSystem: {
            id: 'system-2',
            name: 'Call of Cthulhu',
            defaultImageUrl: 'https://example.com/cthulhu.jpg'
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
  });

  test('should display all worlds with images and session names', async ({ page }) => {
    // Given: User has existing worlds in the system
    await page.waitForLoadState('networkidle');

    // When: User navigates to the homepage
    // (Already on homepage from beforeEach)

    // Then: All worlds are displayed as cards
    await expect(page.locator('[data-testid="world-card"]')).toHaveCount(2);
    
    // Each world shows its image (custom or game system default)
    const worldCards = page.locator('[data-testid="world-card"]');
    await expect(worldCards.first()).toContainText('Epic Adventure');
    await expect(worldCards.nth(1)).toContainText('Mystery Quest');
    
    // Images are displayed
    await expect(page.locator('img[alt*="Epic Adventure"]')).toBeVisible();
    await expect(page.locator('img[alt*="Mystery Quest"]')).toBeVisible();
    
    // Game system names are shown
    await expect(page.locator('text=D&D 5e')).toBeVisible();
    await expect(page.locator('text=Call of Cthulhu')).toBeVisible();
  });

  test('should display worlds sorted by last accessed (most recent first)', async ({ page }) => {
    // Given: Multiple worlds with different last access times
    await page.waitForLoadState('networkidle');

    // When: User views the homepage
    const worldCards = page.locator('[data-testid="world-card"]');

    // Then: Worlds are sorted by last accessed date (most recent first)
    await expect(worldCards.first()).toContainText('Epic Adventure'); // More recent
    await expect(worldCards.nth(1)).toContainText('Mystery Quest'); // Older
  });

  test('should handle image fallback behavior', async ({ page }) => {
    // Given: Worlds with different image configurations
    await page.waitForLoadState('networkidle');

    // When: Images load/fail to load
    const firstImage = page.locator('img[alt*="Epic Adventure"]');
    const secondImage = page.locator('img[alt*="Mystery Quest"]');

    // Then: Images load progressively with fallbacks
    // Epic Adventure has custom image, should eventually show custom
    await expect(firstImage).toBeVisible();
    
    // Mystery Quest has no custom image, should show game system default
    await expect(secondImage).toBeVisible();
    await expect(secondImage).toHaveAttribute('src', /cthulhu/);
  });

  test('should handle empty state when no worlds exist', async ({ page }) => {
    // Given: No worlds exist in the system
    await page.route('/api/worlds', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // When: User visits homepage
    // Then: Appropriate empty state is displayed
    await expect(page.locator('text=No worlds yet')).toBeVisible();
    await expect(page.locator('text=Create your first world')).toBeVisible();
    
    // Create world call-to-action is present
    await expect(page.locator('button:has-text("Create New World")')).toBeVisible();
  });

  test('should display world metadata correctly', async ({ page }) => {
    // Given: Worlds with various metadata
    await page.waitForLoadState('networkidle');

    // When: Viewing world cards
    const firstCard = page.locator('[data-testid="world-card"]').first();

    // Then: Each world shows proper metadata
    await expect(firstCard).toContainText('Epic Adventure');
    await expect(firstCard).toContainText('D&D 5e');
    await expect(firstCard).toContainText(/last played/i);
  });

  test('should handle slow image loading gracefully', async ({ page }) => {
    // Given: Slow network conditions
    await page.route('https://example.com/epic.jpg', async (route) => {
      // Delay image loading
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'image/jpeg',
        body: Buffer.from('fake-image-data')
      });
    });

    await page.waitForLoadState('networkidle');

    // When: Images are loading slowly
    const image = page.locator('img[alt*="Epic Adventure"]');

    // Then: Fallback image is shown immediately
    await expect(image).toBeVisible();
    // Should initially show game system default
    await expect(image).toHaveAttribute('src', /dnd/);
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Given: Different viewport sizes
    await page.waitForLoadState('networkidle');

    // Desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('[data-testid="world-card"]')).toHaveCount(2);

    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="world-card"]')).toHaveCount(2);

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="world-card"]')).toHaveCount(2);
    
    // Cards should stack vertically on mobile
    const firstCard = page.locator('[data-testid="world-card"]').first();
    const secondCard = page.locator('[data-testid="world-card"]').nth(1);
    
    const firstBox = await firstCard.boundingBox();
    const secondBox = await secondCard.boundingBox();
    
    // Second card should be below first card (stacked)
    expect(secondBox!.y).toBeGreaterThan(firstBox!.y + firstBox!.height);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Given: Network error when loading worlds
    await page.route('/api/worlds', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal server error' })
      });
    });

    await page.reload();

    // When: Page loads with error
    // Then: Error state is displayed
    await expect(page.locator('text=Failed to load worlds')).toBeVisible();
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible();

    // User can retry
    await page.click('button:has-text("Try Again")');
    // Should attempt to reload
  });
});