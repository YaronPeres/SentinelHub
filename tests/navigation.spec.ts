import { test, expect } from '@playwright/test';

test.describe('SOC Navigation & Route Grouping', () => {

  // Test 1: Auth Guard
  // Verify that an unauthenticated user hitting /dashboard is kicked out
  test('unauthenticated users are redirected from /dashboard to /login', async ({ page }) => {
    // Attempt to access the secured analyst portal
    await page.goto('/dashboard');

    // The middleware should intercept and redirect to the login page
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByText(/Analyst Authentication/i)).toBeVisible();
  });

  // Test 2: Internal Ingest Navigation
  // Verify that the 'Threat Ingest' sidebar link resolves to the internal route 
  // without losing the authenticated application shell (the sidebar).
  test('internal Threat Ingest retains the dashboard Sidebar layout', async ({ page }) => {
    // Perform a real login to satisfy the extensive Supabase SSR Middleware cookies
    await page.goto('/login');

    // Fill in demo credentials (assuming an account exists or the middleware will still kick us out)
    // If the DB is completely empty, this test will fail until a user is registered. 
    // We will attempt login and wait for the dashboard redirection.
    await page.getByPlaceholder('analyst@SentinelZone.com').fill('test@SentinelZone.com');
    await page.getByPlaceholder('••••••••').fill('testpassword123');
    await page.getByRole('button', { name: /AUTHORIZE/i }).click();

    // Wait until we successfully land on the dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });

    // Click on the 'Threat Ingest' link in the Sidebar
    const routePromise = page.waitForURL('/dashboard/ingest');
    await page.getByText('Threat Ingest').click();
    await routePromise;

    // We should be on the new internal ingest route
    await expect(page).toHaveURL(/.*\/dashboard\/ingest/);

    // CRITICAL: The Sidebar Navigation must still be visible on the screen
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByText('Intel Vault')).toBeVisible();

    // And the Ingest Form itself should be visible
    await expect(page.getByText('Threat Ingestion')).toBeVisible();
  });
});
