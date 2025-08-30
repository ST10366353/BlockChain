import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto('/login')
  })

  test('should display login form elements', async ({ page }) => {
    // Check that main elements are visible
    await expect(page.getByText('Welcome Back')).toBeVisible()
    await expect(page.getByLabel('Recovery Passphrase')).toBeVisible()
    await expect(page.getByText('or authenticate with')).toBeVisible()
    await expect(page.getByLabel('Decentralized Identifier (DID)')).toBeVisible()
    await expect(page.getByText('Use Biometric')).toBeVisible()
  })

  test('should validate passphrase length', async ({ page }) => {
    // Enter a short passphrase
    await page.getByLabel('Recovery Passphrase').fill('short')

    // Click unlock button
    await page.getByRole('button', { name: 'Unlock Wallet' }).click()

    // Check for validation error
    await expect(page.getByText(/enter a valid recovery passphrase/i)).toBeVisible()
  })

  test('should handle valid passphrase unlock', async ({ page }) => {
    // Enter a valid 12-word passphrase
    const validPassphrase = 'secure mountain forest ocean bridge garden sunset river castle phoenix diamond thunder'
    await page.getByLabel('Recovery Passphrase').fill(validPassphrase)

    // Click unlock button
    await page.getByRole('button', { name: 'Unlock Wallet' }).click()

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
  })

  test('should validate DID format', async ({ page }) => {
    // Enter invalid DID
    await page.getByLabel('Decentralized Identifier (DID)').fill('invalid-did')

    // Click authenticate button
    await page.getByRole('button', { name: 'Authenticate with DID' }).click()

    // Check for validation error
    await expect(page.getByText(/invalid did format/i)).toBeVisible()
  })

  test('should handle DID authentication flow', async ({ page }) => {
    // Mock the DID API response
    await page.route('**/api/did/resolvable/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ resolvable: true }),
      })
    })

    // Enter valid DID
    await page.getByLabel('Decentralized Identifier (DID)').fill('did:web:example.com')

    // Click authenticate button
    await page.getByRole('button', { name: 'Authenticate with DID' }).click()

    // Should show loading state
    await expect(page.getByText('Authenticating with DID')).toBeVisible()
  })

  test('should handle biometric authentication', async ({ page }) => {
    // Mock WebAuthn support
    await page.addScriptTag({
      content: `
        navigator.credentials = {
          get: () => Promise.resolve({}),
          create: () => Promise.resolve({})
        }
      `,
    })

    // Click biometric button
    await page.getByRole('button', { name: 'Use Biometric' }).click()

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
  })

  test('should show loading state during authentication', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/auth/**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    // Enter valid passphrase
    const validPassphrase = 'secure mountain forest ocean bridge garden sunset river castle phoenix diamond thunder'
    await page.getByLabel('Recovery Passphrase').fill(validPassphrase)

    // Click unlock button
    await page.getByRole('button', { name: 'Unlock Wallet' }).click()

    // Check loading state
    await expect(page.getByText('Unlocking Wallet')).toBeVisible()

    // Buttons should be disabled during loading
    await expect(page.getByRole('button', { name: 'Unlock Wallet' })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Authenticate with DID' })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Use Biometric' })).toBeDisabled()
  })

  test('should handle authentication errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid credentials' }),
      })
    })

    // Enter passphrase
    await page.getByLabel('Recovery Passphrase').fill('invalid passphrase')

    // Click unlock button
    await page.getByRole('button', { name: 'Unlock Wallet' }).click()

    // Should show error message
    await expect(page.getByText(/failed to unlock wallet/i)).toBeVisible()
  })
})
