const { test, expect } = require('@playwright/test');

test.describe('Audio Generation Tests', () => {
  test('should generate tones after ENS resolution', async ({ page }) => {
    await page.goto('/');
    
    const ensInput = page.locator('#ensAddress');
    
    // Fill ENS and trigger automatic validation
    await ensInput.fill('vitalik.eth');
    await ensInput.blur(); // Trigger validation by losing focus
    
    // Wait for potential resolution
    await page.waitForTimeout(3000);
    
    // Generate tones
    await page.click('#generateTones');
    
    // Wait for generation to complete
    await page.waitForTimeout(2000);
    
    // Check that tone information is displayed
    await expect(page.locator('#displayAddress')).not.toHaveText('-');
    await expect(page.locator('#toneDuration')).not.toHaveText('-');
    await expect(page.locator('#totalLength')).not.toHaveText('-');
  });

  test('should show waveform after tone generation', async ({ page }) => {
    await page.goto('/');
    
    const ensInput = page.locator('#ensAddress');
    
    // Fill ENS and trigger automatic validation
    await ensInput.fill('vitalik.eth');
    await ensInput.blur(); // Trigger validation by losing focus
    await page.waitForTimeout(3000);
    
    // Generate tones
    await page.click('#generateTones');
    await page.waitForTimeout(2000);
    
    // Check waveform canvas is present and has content
    const waveform = page.locator('#toneWaveform');
    await expect(waveform).toBeVisible();
    
    // Check that audio player is shown
    const audioPlayer = page.locator('#dtmfAudioPlayer');
    await expect(audioPlayer).toBeVisible();
  });

  test('should display tone information', async ({ page }) => {
    await page.goto('/');
    
    const ensInput = page.locator('#ensAddress');
    
    // Fill ENS and trigger automatic validation
    await ensInput.fill('vitalik.eth');
    await ensInput.blur(); // Trigger validation by losing focus
    await page.waitForTimeout(5000); // Wait longer for potential resolution
    
    // Try to generate tones
    await page.click('#generateTones');
    await page.waitForTimeout(2000);
    
    // Check tone information is displayed
    const displayAddress = page.locator('#displayAddress');
    const toneDuration = page.locator('#toneDuration');
    const totalLength = page.locator('#totalLength');
    
    // At least one of these should show actual data
    const addressText = await displayAddress.textContent();
    const durationText = await toneDuration.textContent();
    const lengthText = await totalLength.textContent();
    
    // Should show some information (not all dashes)
    expect([addressText, durationText, lengthText].some(text => text !== '-')).toBeTruthy();
  });

  test('should handle invalid ENS gracefully', async ({ page }) => {
    await page.goto('/');
    
    const ensInput = page.locator('#ensAddress');
    
    // Fill with invalid ENS
    await ensInput.fill('invalid-address');
    await ensInput.blur();
    await page.waitForTimeout(1000);
    
    // Try to generate tones
    await page.click('#generateTones');
    await page.waitForTimeout(1000);
    
    // Should show error or not generate tones
    const status = page.locator('#ensStatus');
    await expect(status).toContainText('Invalid ENS address format');
  });
}); 