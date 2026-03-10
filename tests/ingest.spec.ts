import { test, expect } from '@playwright/test';

test.describe('Ingest & Triage Engine', () => {

  test('Submitting an IP triggers Terminal Success state', async ({ page }) => {
    // Navigate to the public ingest form
    await page.goto('/report');
    
    // Fill out the form
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'IP Address' }).click();
    
    await page.getByPlaceholder('e.g., 192.168.1.100 or suspicious-domain.com').fill('192.168.1.100');
    await page.getByPlaceholder('Describe the anomalous behavior observed...').fill('Suspicious brute force attempts observed in logs.');
    
    // Submit the form
    await page.getByRole('button', { name: /INGEST INDICATOR|TRANSMITTING.../i }).click();
    
    // Wait for the scanning animation to complete (it has a timeout)
    // The success terminal window should eventually appear
    await expect(page.getByText(/\[SUCCESS\] IoC INGESTED/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/STATUS: TRIAGE_PENDING/i)).toBeVisible();
  });

});
