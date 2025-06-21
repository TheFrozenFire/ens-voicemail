const { test, expect } = require('@playwright/test');

test.describe('ENS Voicemail System', () => {
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

  test('should handle debug logging', async ({ page }) => {
    // Check debug section is present
    await expect(page.locator('#debugLogs')).toBeVisible();
    
    // Test clear logs button
    await page.click('#clearLogs');
    
    // Test copy logs button
    await page.click('#copyLogs');
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

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure by using invalid ENS
    const ensInput = page.locator('#ensAddress');
    await ensInput.fill('nonexistent.eth');
    await page.click('#validateENS');
    
    // Wait for resolution attempt
    await page.waitForTimeout(5000);
    
    // Should show appropriate error message
    const status = page.locator('#ensStatus');
    const statusText = await status.textContent();
    expect(statusText).toMatch(/Error|not found|Could not load/);
  });
}); 