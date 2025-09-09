/**
 * Global Teardown for Playwright E2E Tests
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('Tearing down global test environment...');

  // Create a browser instance for cleanup tasks
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the application
    await page.goto(config.webServer?.url || 'http://localhost:5173');

    // Perform any global cleanup tasks here
    // For example: clean up test data, reset application state, etc.

    console.log('Global teardown completed successfully');
  } catch (error) {
    console.error('Global teardown failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  } finally {
    await browser.close();
  }
}

export default globalTeardown;
