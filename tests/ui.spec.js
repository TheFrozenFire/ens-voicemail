const { test, expect } = require('@playwright/test');

test.describe('UI Tests', () => {
  test('should load the main page with all sections', async ({ page }) => {
    await page.goto('/');
    
    // Check main title
    await expect(page.locator('h1')).toContainText('ENS Voicemail System');
    await expect(page.locator('.input-section')).toBeVisible();
    await expect(page.locator('.preview-section')).toBeVisible();
    await expect(page.locator('.decode-section')).toBeVisible();
    await expect(page.locator('.debug-section')).toBeVisible();
  });

  test('should have all required input elements', async ({ page }) => {
    await page.goto('/');
    
    // Check input elements
    await expect(page.locator('#ensAddress')).toBeVisible();
    await expect(page.locator('#generateTones')).toBeVisible();
    await expect(page.locator('#audioFile')).toBeVisible();
    await expect(page.locator('#decodeTones')).toBeVisible();
  });

  test('should display tone information section', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('.tone-info')).toBeVisible();
    await expect(page.locator('#displayAddress')).toBeVisible();
    await expect(page.locator('#toneDuration')).toBeVisible();
    await expect(page.locator('#totalLength')).toBeVisible();
  });

  test('should have debug section', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('.debug-section')).toBeVisible();
    await expect(page.locator('#clearLogs')).toBeVisible();
    await expect(page.locator('#copyLogs')).toBeVisible();
    await expect(page.locator('#debugLogs')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check main elements are still visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#ensAddress')).toBeVisible();
    await expect(page.locator('#generateTones')).toBeVisible();
    
    // Check waveform adapts to mobile
    const waveform = page.locator('#toneWaveform');
    await expect(waveform).toBeVisible();
  });
}); 