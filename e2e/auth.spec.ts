/**
 * Authentication E2E Tests
 * Tests user authentication workflows
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear local storage and cookies before each test
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should load the home page', async ({ page }) => {
    await page.goto('/');

    // Check if the main elements are present
    await expect(page).toHaveTitle(/IdentityVault/);
    await expect(page.locator('text=Welcome to IdentityVault')).toBeVisible();
    await expect(page.locator('text=Access your decentralized identity')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');

    // Click on login or get started button
    const loginButton = page.locator('text=Login').or(page.locator('text=Get Started')).first();
    await loginButton.click();

    // Should navigate to login page
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('text=Sign In')).toBeVisible();
  });

  test('should show login form with multiple authentication methods', async ({ page }) => {
    await page.goto('/login');

    // Check for authentication method tabs
    await expect(page.locator('text=Passphrase')).toBeVisible();
    await expect(page.locator('text=DID')).toBeVisible();
    await expect(page.locator('text=Biometric')).toBeVisible();
  });

  test('should handle passphrase login form validation', async ({ page }) => {
    await page.goto('/login');

    // Ensure passphrase tab is active
    await page.locator('text=Passphrase').click();

    // Try to submit empty form
    const submitButton = page.locator('button', { hasText: 'Access Wallet' });
    await submitButton.click();

    // Should show validation errors or prevent submission
    await expect(page.locator('text=Recovery Passphrase')).toBeVisible();

    // Fill in passphrase
    const passphraseInput = page.locator('input[placeholder*="12-word recovery phrase"]');
    await passphraseInput.fill('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');

    // Submit form
    await submitButton.click();

    // Should either succeed or show appropriate error
    // In a real test, this would depend on backend implementation
    await expect(page.locator('text=Welcome back').or(page.locator('text=Invalid passphrase'))).toBeVisible();
  });

  test('should handle DID login form', async ({ page }) => {
    await page.goto('/login');

    // Switch to DID tab
    await page.locator('text=DID').click();

    // Check DID form elements
    await expect(page.locator('text=Decentralized Identifier')).toBeVisible();
    await expect(page.locator('input[placeholder*="did:example"]')).toBeVisible();

    // Fill DID
    const didInput = page.locator('input[placeholder*="did:example"]');
    await didInput.fill('did:example:123456789abcdef');

    // Submit form
    const submitButton = page.locator('button', { hasText: 'Authenticate with DID' });
    await submitButton.click();

    // Should show loading or result
    await expect(page.locator('text=Authenticating').or(page.locator('text=Welcome back'))).toBeVisible();
  });

  test('should handle biometric login', async ({ page }) => {
    await page.goto('/login');

    // Switch to biometric tab
    await page.locator('text=Biometric').click();

    // Check biometric elements
    await expect(page.locator('text=Biometric Authentication')).toBeVisible();
    await expect(page.locator('text=Use your fingerprint, Face ID')).toBeVisible();

    // Click authenticate button
    const authButton = page.locator('button', { hasText: 'Authenticate' });
    await authButton.click();

    // Should show loading or result
    await expect(page.locator('text=Authenticating').or(page.locator('text=Biometric authentication'))).toBeVisible();
  });

  test('should navigate to onboarding from login page', async ({ page }) => {
    await page.goto('/login');

    // Click on create wallet link
    const createLink = page.locator('text=Create one now');
    await createLink.click();

    // Should navigate to onboarding
    await expect(page).toHaveURL(/\/onboarding/);
    await expect(page.locator('text=Welcome to IdentityVault')).toBeVisible();
  });

  test('should handle back navigation', async ({ page }) => {
    await page.goto('/login');

    // Click back button
    const backButton = page.locator('text=Back to Home');
    await backButton.click();

    // Should navigate back to home
    await expect(page).toHaveURL('/');
  });

  test('should persist authentication state', async ({ page }) => {
    // This test would require setting up mock authentication
    // In a real scenario, you'd mock the auth API and test persistence

    await page.goto('/login');

    // Simulate successful login by setting localStorage
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock_token');
      localStorage.setItem('user', JSON.stringify({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });

    // Navigate to dashboard
    await page.goto('/dashboard');

    // Should show authenticated state
    await expect(page.locator('text=Welcome back, Test User')).toBeVisible();
  });

  test('should handle logout', async ({ page }) => {
    // Set up authenticated state
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock_token');
      localStorage.setItem('user', JSON.stringify({
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com'
      }));
    });

    await page.goto('/dashboard');

    // Click user menu
    const userMenu = page.locator('[data-testid="user-menu"]').or(page.locator('text=Test User')).first();
    await userMenu.click();

    // Click logout
    const logoutButton = page.locator('text=Log out');
    await logoutButton.click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);

    // Should clear authentication state
    const authToken = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(authToken).toBeNull();
  });

  test('should handle network errors during authentication', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/auth/**', route => route.abort());

    await page.goto('/login');

    // Try to login
    const passphraseInput = page.locator('input[placeholder*="12-word recovery phrase"]');
    await passphraseInput.fill('test passphrase');

    const submitButton = page.locator('button', { hasText: 'Access Wallet' });
    await submitButton.click();

    // Should show error message
    await expect(page.locator('text=Network error').or(page.locator('text=Failed to authenticate'))).toBeVisible();
  });
});
