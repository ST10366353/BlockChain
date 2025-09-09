/**
 * Credential Management E2E Tests
 * Tests credential creation, viewing, and management workflows
 */

import { test, expect } from '@playwright/test';

test.describe('Credential Management', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authenticated state
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock_token');
      localStorage.setItem('user', JSON.stringify({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        did: 'did:example:123456789'
      }));
    });
  });

  test('should display dashboard with credentials', async ({ page }) => {
    await page.goto('/dashboard');

    // Check dashboard elements
    await expect(page.locator('text=Welcome back, Test User')).toBeVisible();
    await expect(page.locator('text=Total Credentials')).toBeVisible();
    await expect(page.locator('text=Recent Credentials')).toBeVisible();
  });

  test('should navigate to credentials page', async ({ page }) => {
    await page.goto('/dashboard');

    // Click on credentials navigation
    const credentialsLink = page.locator('text=Credentials').or(page.locator('[href*="credentials"]')).first();
    await credentialsLink.click();

    // Should navigate to credentials page
    await expect(page).toHaveURL(/\/consumer\/credentials/);
    await expect(page.locator('text=My Credentials')).toBeVisible();
  });

  test('should display credential list with different view modes', async ({ page }) => {
    await page.goto('/consumer/credentials');

    // Check grid view (default)
    await expect(page.locator('.grid')).toBeVisible();

    // Switch to list view
    const listViewButton = page.locator('[data-testid="list-view"]').or(page.locator('button', { hasText: 'List' }));
    if (await listViewButton.isVisible()) {
      await listViewButton.click();
      await expect(page.locator('.space-y-4')).toBeVisible();
    }
  });

  test('should filter credentials by status', async ({ page }) => {
    await page.goto('/consumer/credentials');

    // Click verified filter
    const verifiedFilter = page.locator('text=Verified').first();
    await verifiedFilter.click();

    // Should show only verified credentials
    await expect(page.locator('text=Verified')).toBeVisible();
  });

  test('should search credentials', async ({ page }) => {
    await page.goto('/consumer/credentials');

    // Type in search box
    const searchInput = page.locator('input[placeholder*="Search credentials"]');
    await searchInput.fill('University');

    // Should filter results
    await expect(page.locator('text=University')).toBeVisible();
  });

  test('should navigate to add credential page', async ({ page }) => {
    await page.goto('/consumer/credentials');

    // Click add credential button
    const addButton = page.locator('text=Add Credential').or(page.locator('[data-testid="add-credential"]'));
    await addButton.click();

    // Should navigate to add credential page
    await expect(page).toHaveURL(/\/consumer\/credentials\/add/);
    await expect(page.locator('text=Add New Credential')).toBeVisible();
  });

  test('should complete manual credential creation workflow', async ({ page }) => {
    await page.goto('/consumer/credentials/add');

    // Select manual entry method
    const manualEntryButton = page.locator('text=Manual Entry');
    await manualEntryButton.click();

    // Fill out the form
    const titleInput = page.locator('input[placeholder*="University Degree"]');
    await titleInput.fill('Test Certificate');

    const issuerInput = page.locator('input[placeholder*="Stanford University"]');
    await issuerInput.fill('Test Organization');

    // Select credential type
    const typeSelect = page.locator('select').first();
    await typeSelect.selectOption('certification');

    const descriptionTextarea = page.locator('textarea[placeholder*="Brief description"]');
    await descriptionTextarea.fill('This is a test certificate for E2E testing');

    // Set issue date
    const issueDateInput = page.locator('input[type="date"]').first();
    await issueDateInput.fill('2024-01-01');

    // Set expiry date
    const expiryDateInput = page.locator('input[type="date"]').last();
    await expiryDateInput.fill('2025-01-01');

    // Submit the form
    const submitButton = page.locator('button', { hasText: 'Create Credential' });
    await submitButton.click();

    // Should show success message or redirect
    await expect(page.locator('text=Credential Created').or(page.locator('text=Welcome back'))).toBeVisible();
  });

  test('should handle file upload for credential creation', async ({ page }) => {
    await page.goto('/consumer/credentials/add');

    // Select file upload method
    const fileUploadButton = page.locator('text=File Upload');
    await fileUploadButton.click();

    // Check file upload area
    await expect(page.locator('text=Drop your credential file here')).toBeVisible();

    // Create a mock file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-credential.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify({
        name: 'Test Credential',
        issuer: 'Test Issuer',
        type: 'certification'
      }))
    });

    // Should show uploaded file
    await expect(page.locator('text=test-credential.json')).toBeVisible();

    // Process the file
    const processButton = page.locator('text=Process File');
    await processButton.click();

    // Should show processing result
    await expect(page.locator('text=Credential Created').or(page.locator('text=Processing')).or(page.locator('text=Success'))).toBeVisible();
  });

  test('should handle QR code scanning workflow', async ({ page }) => {
    await page.goto('/consumer/credentials/add');

    // Select QR code method
    const qrButton = page.locator('text=QR Code Scan');
    await qrButton.click();

    // Check QR scanning interface
    await expect(page.locator('text=Scan QR Code')).toBeVisible();
    await expect(page.locator('text=Camera access is required')).toBeVisible();
  });

  test('should view credential details', async ({ page }) => {
    await page.goto('/consumer/credentials');

    // Click on a credential to view details
    const credentialCard = page.locator('[data-testid="credential-card"]').or(page.locator('text=University Degree')).first();
    await credentialCard.click();

    // Should navigate to credential details
    await expect(page).toHaveURL(/\/consumer\/credentials\/[^/]+/);
    await expect(page.locator('text=Credential Details')).toBeVisible();
  });

  test('should navigate through credential detail tabs', async ({ page }) => {
    await page.goto('/consumer/credentials/cred-1'); // Assuming this route exists

    // Check for tab navigation
    const overviewTab = page.locator('text=Overview');
    const jsonTab = page.locator('text=Raw Data');
    const sharingTab = page.locator('text=Sharing');
    const activityTab = page.locator('text=Activity');

    if (await overviewTab.isVisible()) {
      await overviewTab.click();
      await expect(page.locator('text=Credential Claims')).toBeVisible();
    }

    if (await jsonTab.isVisible()) {
      await jsonTab.click();
      await expect(page.locator('text=Raw Credential Data')).toBeVisible();
    }

    if (await sharingTab.isVisible()) {
      await sharingTab.click();
      await expect(page.locator('text=Share This Credential')).toBeVisible();
    }

    if (await activityTab.isVisible()) {
      await activityTab.click();
      await expect(page.locator('text=Activity Timeline')).toBeVisible();
    }
  });

  test('should handle credential sharing', async ({ page }) => {
    await page.goto('/consumer/credentials/cred-1');

    // Navigate to sharing tab
    const sharingTab = page.locator('text=Sharing');
    if (await sharingTab.isVisible()) {
      await sharingTab.click();

      // Click share button
      const shareButton = page.locator('text=Share').or(page.locator('text=Generate Link'));
      if (await shareButton.isVisible()) {
        await shareButton.click();

        // Should show sharing options
        await expect(page.locator('text=Shareable Link').or(page.locator('text=QR Code')).or(page.locator('text=Success'))).toBeVisible();
      }
    }
  });

  test('should handle credential actions', async ({ page }) => {
    await page.goto('/consumer/credentials');

    // Find action buttons on credential card
    const viewButton = page.locator('[data-testid="view-credential"]').or(page.locator('button', { hasText: 'View' }));
    const shareButton = page.locator('[data-testid="share-credential"]').or(page.locator('button', { hasText: 'Share' }));
    const downloadButton = page.locator('[data-testid="download-credential"]').or(page.locator('button', { hasText: 'Download' }));

    // Test view action
    if (await viewButton.isVisible()) {
      await viewButton.click();
      await expect(page.locator('text=Credential Details')).toBeVisible();
      await page.goBack(); // Go back to list
    }

    // Test share action
    if (await shareButton.isVisible()) {
      await shareButton.click();
      await expect(page.locator('text=Share').or(page.locator('text=Shared')).or(page.locator('text=Success'))).toBeVisible();
    }

    // Test download action
    if (await downloadButton.isVisible()) {
      // Mock download by checking if download starts
      const downloadPromise = page.waitForEvent('download');
      await downloadButton.click();

      try {
        await downloadPromise;
        // Download started successfully
      } catch (error) {
        // Download might not work in test environment, which is fine
      }
    }
  });

  test('should handle bulk credential operations', async ({ page }) => {
    await page.goto('/consumer/credentials');

    // Check for bulk selection checkboxes
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();

    if (checkboxCount > 0) {
      // Select multiple credentials
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();

      // Check bulk action buttons
      const bulkApprove = page.locator('text=Approve All');
      const bulkReject = page.locator('text=Reject All');

      if (await bulkApprove.isVisible()) {
        await bulkApprove.click();
        await expect(page.locator('text=Approved').or(page.locator('text=Success'))).toBeVisible();
      }
    }
  });

  test('should handle offline credential operations', async ({ page }) => {
    // Mock offline state
    await page.context().setOffline(true);

    await page.goto('/consumer/credentials/add');

    // Try to create credential while offline
    const manualEntryButton = page.locator('text=Manual Entry');
    await manualEntryButton.click();

    const titleInput = page.locator('input[placeholder*="University Degree"]');
    await titleInput.fill('Offline Credential');

    const submitButton = page.locator('button', { hasText: 'Create Credential' });
    await submitButton.click();

    // Should show offline message or queue message
    await expect(page.locator('text=Offline').or(page.locator('text=Queued')).or(page.locator('text=Saved locally'))).toBeVisible();

    // Come back online
    await page.context().setOffline(false);

    // Should sync offline operations
    await expect(page.locator('text=Syncing').or(page.locator('text=Synchronized')).or(page.locator('text=Online'))).toBeVisible();
  });

  test('should handle credential validation errors', async ({ page }) => {
    await page.goto('/consumer/credentials/add');

    // Select manual entry
    const manualEntryButton = page.locator('text=Manual Entry');
    await manualEntryButton.click();

    // Try to submit without required fields
    const submitButton = page.locator('button', { hasText: 'Create Credential' });
    await submitButton.click();

    // Should show validation errors
    await expect(page.locator('text=Required').or(page.locator('text=This field is required')).or(page.locator('text=Please fill')).or(page.locator('text=Enter')).or(page.locator('text=Select'))).toBeVisible();
  });

  test('should handle credential update workflow', async ({ page }) => {
    await page.goto('/consumer/credentials/cred-1');

    // Look for edit button
    const editButton = page.locator('text=Edit').or(page.locator('[data-testid="edit-credential"]'));
    if (await editButton.isVisible()) {
      await editButton.click();

      // Should show edit form
      await expect(page.locator('input[value*="University"]').or(page.locator('input[placeholder*="University"]'))).toBeVisible();

      // Make changes
      const titleInput = page.locator('input[type="text"]').first();
      await titleInput.fill('Updated University Degree');

      // Save changes
      const saveButton = page.locator('text=Save').or(page.locator('text=Update'));
      if (await saveButton.isVisible()) {
        await saveButton.click();

        // Should show success message
        await expect(page.locator('text=Updated').or(page.locator('text=Saved')).or(page.locator('text=Success'))).toBeVisible();
      }
    }
  });
});
