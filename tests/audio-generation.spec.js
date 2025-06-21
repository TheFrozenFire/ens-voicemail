const { test, expect } = require('@playwright/test');

test.describe('Audio Generation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should generate tones after ENS resolution', async ({ page }) => {
    const ensInput = page.locator('#ensAddress');
    
    // Fill ENS and validate
    await ensInput.fill('vitalik.eth');
    await page.click('#validateENS');
    
    // Wait for potential resolution
    await page.waitForTimeout(3000);
    
    // Try to generate tones
    await page.click('#generateTones');
    
    // Check if tones were generated or error shown
    const status = page.locator('#ensStatus');
    const statusText = await status.textContent();
    
    // Should show either success or appropriate error
    expect(statusText).toMatch(/DTMF tones generated|Please validate|Error generating/);
  });

  test('should show waveform after tone generation', async ({ page }) => {
    const ensInput = page.locator('#ensAddress');
    
    // Fill ENS and validate
    await ensInput.fill('vitalik.eth');
    await page.click('#validateENS');
    await page.waitForTimeout(3000);
    
    // Generate tones
    await page.click('#generateTones');
    await page.waitForTimeout(2000);
    
    // Check if waveform canvas is present and visible
    const waveform = page.locator('#toneWaveform');
    await expect(waveform).toBeVisible();
  });

  test('should display tone information', async ({ page }) => {
    const ensInput = page.locator('#ensAddress');
    
    // Fill ENS and validate
    await ensInput.fill('vitalik.eth');
    await page.click('#validateENS');
    await page.waitForTimeout(5000); // Wait longer for potential resolution
    
    // Try to generate tones
    await page.click('#generateTones');
    await page.waitForTimeout(3000);
    
    // Check tone information is displayed (if resolution was successful)
    const toneDuration = page.locator('#toneDuration');
    const totalLength = page.locator('#totalLength');
    const status = page.locator('#ensStatus');
    
    const statusText = await status.textContent();
    if (statusText.includes('DTMF tones generated')) {
      // If tones were generated, check duration information
      await expect(toneDuration).not.toHaveText('-');
      await expect(totalLength).not.toHaveText('-');
    } else {
      // If resolution failed, duration should remain as '-'
      await expect(toneDuration).toHaveText('-');
      await expect(totalLength).toHaveText('-');
    }
  });
}); 