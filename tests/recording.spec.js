const { test, expect } = require('@playwright/test');

test.describe('Recording Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should handle recording controls', async ({ page }) => {
    // Check initial state
    await expect(page.locator('#startRecording')).toBeEnabled();
    await expect(page.locator('#stopRecording')).toBeDisabled();
    await expect(page.locator('#playRecording')).toBeDisabled();
    
    // Note: Actual recording requires microphone permissions
    // This test just verifies the UI state
  });

  test('should handle file upload for decoding', async ({ page }) => {
    const fileInput = page.locator('#audioFile');
    
    // Check file input is present
    await expect(fileInput).toBeVisible();
    
    // Test decode button without file
    await page.click('#decodeTones');
    await expect(page.locator('#ensStatus')).toContainText('Please select an audio file');
  });
}); 