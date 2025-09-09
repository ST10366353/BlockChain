/**
 * Global Setup for Playwright E2E Tests
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('Setting up global test environment...');

  // Create a browser instance for setup tasks
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the application
    await page.goto(config.webServer?.url || 'http://localhost:5173');

    // Wait for the app to load
    await page.waitForLoadState('networkidle');

    // Perform any global setup tasks here
    // For example: seed test data, configure test user, etc.

    console.log('Global setup completed successfully');
  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
