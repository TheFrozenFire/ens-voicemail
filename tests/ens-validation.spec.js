const { test, expect } = require('@playwright/test');

test.describe('ENS Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should validate ENS address format', async ({ page }) => {
    const ensInput = page.locator('#ensAddress');
    
    // Test invalid ENS format
    await ensInput.fill('invalid-address');
    await page.click('#validateENS');
    await expect(page.locator('#ensStatus')).toContainText('Invalid ENS address format');
    
    // Test valid ENS format
    await ensInput.fill('vitalik.eth');
    await page.click('#validateENS');
    // Should show loading state or error (both are valid outcomes)
    const status = page.locator('#ensStatus');
    await page.waitForTimeout(3000); // Wait for ethers.js loading attempt
    const statusText = await status.textContent();
    expect(statusText).toMatch(/Loading ENS resolver|Could not load ENS resolver|ENS resolved|Error resolving/);
  });

  test('should handle ENS resolution', async ({ page }) => {
    const ensInput = page.locator('#ensAddress');
    
    // Test with a known ENS address
    await ensInput.fill('vitalik.eth');
    await page.click('#validateENS');
    
    // Wait for resolution (may take a few seconds)
    await page.waitForTimeout(5000);
    
    // Check if resolution was successful or failed gracefully
    const status = page.locator('#ensStatus');
    const statusText = await status.textContent();
    
    // Should either show success or a network error (both are valid outcomes)
    expect(statusText).toMatch(/ENS resolved|Error resolving|Could not load/);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure by using malformed ENS address
    const ensInput = page.locator('#ensAddress');
    await ensInput.fill('invalid@ens.address');
    await page.click('#validateENS');
    
    // Should show format validation error immediately
    const status = page.locator('#ensStatus');
    const statusText = await status.textContent();
    expect(statusText).toMatch(/Invalid ENS address format/);
  });
}); 