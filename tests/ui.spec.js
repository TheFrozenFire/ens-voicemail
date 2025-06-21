const { test, expect } = require('@playwright/test');

test.describe('UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the main page with all sections', async ({ page }) => {
    // Check main sections are present
    await expect(page.locator('h1')).toContainText('ENS Voicemail System');
    await expect(page.locator('.input-section')).toBeVisible();
    await expect(page.locator('.recording-section')).toBeVisible();
    await expect(page.locator('.preview-section')).toBeVisible();
    await expect(page.locator('.decode-section')).toBeVisible();
    await expect(page.locator('.debug-section')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
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

  test('should handle debug logging', async ({ page }) => {
    // Check debug section is present
    await expect(page.locator('#debugLogs')).toBeVisible();
    
    // Test clear logs button
    await page.click('#clearLogs');
    
    // Test copy logs button
    await page.click('#copyLogs');
  });
}); 