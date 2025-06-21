const { test, expect } = require('@playwright/test');

async function fillENSInput(ensInput, value, page) {
  await ensInput.fill('');
  await page.waitForTimeout(100);
  await ensInput.fill(value);
  await ensInput.blur();
  await page.waitForTimeout(500);
}

test.describe('ENS Validation Tests', () => {
  test('should validate ENS address format automatically', async ({ page }) => {
    await page.goto('/');
    const ensInput = page.locator('#ensAddress');
    // Test invalid ENS format - should trigger automatic validation
    await fillENSInput(ensInput, '!!!notanens!!!', page);
    await expect(page.locator('#ensStatus')).toContainText('Invalid ENS address format');
    // Test valid ENS format
    await fillENSInput(ensInput, 'vitalik.eth', page);
    const status = page.locator('#ensStatus');
    await expect(status).not.toContainText('Invalid ENS address format');
  });

  test('should handle ENS resolution automatically', async ({ page }) => {
    await page.goto('/');
    const ensInput = page.locator('#ensAddress');
    await fillENSInput(ensInput, 'vitalik.eth', page);
    await page.waitForTimeout(4000);
    const status = page.locator('#ensStatus');
    const statusText = await status.textContent();
    expect(statusText).toBeTruthy();
    expect(statusText.length).toBeGreaterThan(0);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await page.goto('/');
    const ensInput = page.locator('#ensAddress');
    await fillENSInput(ensInput, 'thisdoesnotexistforsure.eth', page);
    await page.waitForTimeout(3000);
    const status = page.locator('#ensStatus');
    await expect(status).not.toContainText('Invalid ENS address format');
    const statusText = await status.textContent();
    expect(
      statusText.includes('Error resolving') ||
      statusText.includes('ENS address not found or not registered')
    ).toBeTruthy();
  });

  test('should update status on input change', async ({ page }) => {
    await page.goto('/');
    const ensInput = page.locator('#ensAddress');
    await fillENSInput(ensInput, 'vitalik.eth', page);
    await fillENSInput(ensInput, '!!!notanens!!!', page);
    await expect(page.locator('#ensStatus')).toContainText('Invalid ENS address format');
  });
}); 