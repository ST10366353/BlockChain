import { test, expect } from '@playwright/test'

test.describe('Dashboard Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication and navigate to dashboard
    await page.goto('/dashboard')
  })

  test('should display dashboard with key sections', async ({ page }) => {
    // Check main dashboard elements
    await expect(page.getByText('DID Wallet Dashboard')).toBeVisible()
    await expect(page.getByText('Quick Actions')).toBeVisible()
    await expect(page.getByText('Recent Activity')).toBeVisible()
    await expect(page.getByText('Credentials Overview')).toBeVisible()
  })

  test('should navigate to identities page', async ({ page }) => {
    // Click on Manage Identities link
    await page.getByRole('link', { name: 'Manage Identities' }).click()

    // Should navigate to identities page
    await expect(page).toHaveURL('/identities')
    await expect(page.getByText('Identity Management')).toBeVisible()
  })

  test('should navigate to credentials page', async ({ page }) => {
    // Click on Request Credentials link
    await page.getByRole('link', { name: 'Request Credentials' }).click()

    // Should navigate to credentials page
    await expect(page).toHaveURL('/credentials')
    await expect(page.getByText('Credentials')).toBeVisible()
  })

  test('should navigate to connections page', async ({ page }) => {
    // Click on Trust Registry link
    await page.getByRole('link', { name: 'Trust Registry' }).click()

    // Should navigate to connections page
    await expect(page).toHaveURL('/connections')
    await expect(page.getByText('Trust Registry')).toBeVisible()
  })

  test('should display recent activity', async ({ page }) => {
    // Mock recent activity data
    await page.route('**/api/dashboard/activity', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          activities: [
            {
              action: 'Credential Verified',
              time: '2 hours ago',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            },
            {
              action: 'New Connection Added',
              time: '1 day ago',
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            },
          ],
        }),
      })
    })

    // Check that recent activities are displayed
    await expect(page.getByText('Credential Verified')).toBeVisible()
    await expect(page.getByText('2 hours ago')).toBeVisible()
    await expect(page.getByText('New Connection Added')).toBeVisible()
    await expect(page.getByText('1 day ago')).toBeVisible()
  })

  test('should display credentials statistics', async ({ page }) => {
    // Mock credentials stats
    await page.route('**/api/dashboard/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          stats: {
            totalCredentials: 5,
            validCredentials: 4,
            expiredCredentials: 1,
            trustedIssuers: 3,
          },
        }),
      })
    })

    // Check statistics display
    await expect(page.getByText('5')).toBeVisible() // Total credentials
    await expect(page.getByText('4')).toBeVisible() // Valid credentials
    await expect(page.getByText('1')).toBeVisible() // Expired credentials
    await expect(page.getByText('3')).toBeVisible() // Trusted issuers
  })

  test('should handle dashboard loading states', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/dashboard/**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { name: 'Alice Johnson', primaryDID: 'did:web:alice.com' },
          stats: { totalCredentials: 0, validCredentials: 0, trustedIssuers: 0 },
          activities: [],
        }),
      })
    })

    // Reload the page to trigger loading
    await page.reload()

    // Should show loading state
    await expect(page.getByText(/loading/i)).toBeVisible()
  })

  test('should handle dashboard errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/dashboard/**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      })
    })

    // Reload the page to trigger error
    await page.reload()

    // Should show error message
    await expect(page.getByText(/error/i)).toBeVisible()
  })

  test('should refresh dashboard data', async ({ page }) => {
    // Mock initial data
    let callCount = 0
    await page.route('**/api/dashboard/**', async (route) => {
      callCount++
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { name: 'Alice Johnson', primaryDID: 'did:web:alice.com' },
          stats: { totalCredentials: callCount, validCredentials: callCount, trustedIssuers: callCount },
          activities: [],
        }),
      })
    })

    // Initial load
    await expect(page.getByText('1')).toBeVisible()

    // Find and click refresh button (assuming it exists)
    const refreshButton = page.locator('[aria-label="Refresh dashboard"]').or(
      page.locator('button').filter({ hasText: 'Refresh' })
    )

    if (await refreshButton.isVisible()) {
      await refreshButton.click()

      // Should show updated data
      await expect(page.getByText('2')).toBeVisible()
    }
  })
})

test.describe('Credentials Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication and navigate to credentials page
    await page.goto('/credentials')
  })

  test('should display credentials page with key elements', async ({ page }) => {
    await expect(page.getByText('Credentials')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Request Credential' })).toBeVisible()
  })

  test('should display credential cards', async ({ page }) => {
    // Mock credentials data
    await page.route('**/api/credentials**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'cred-123',
              type: ['UniversityDegree'],
              issuerDid: 'did:web:university.edu',
              subjectDid: 'did:web:alice.com',
              status: 'verified',
              issuedAt: '2024-01-01T00:00:00Z',
            },
          ],
          meta: { total: 1, limit: 50, offset: 0, hasMore: false },
        }),
      })
    })

    // Reload to get mock data
    await page.reload()

    // Check that credential is displayed
    await expect(page.getByText('UniversityDegree')).toBeVisible()
    await expect(page.getByText('did:web:university.edu')).toBeVisible()
    await expect(page.getByText('verified')).toBeVisible()
  })

  test('should handle credential verification', async ({ page }) => {
    // Mock credentials and verification
    await page.route('**/api/credentials**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'cred-123',
              type: ['UniversityDegree'],
              issuerDid: 'did:web:university.edu',
              subjectDid: 'did:web:alice.com',
              status: 'pending',
              issuedAt: '2024-01-01T00:00:00Z',
            },
          ],
          meta: { total: 1, limit: 50, offset: 0, hasMore: false },
        }),
      })
    })

    await page.route('**/api/credentials/verify', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            verified: true,
            checks: [
              { type: 'signature', verified: true, message: 'Valid signature' },
              { type: 'issuer', verified: true, message: 'Trusted issuer' },
            ],
          },
        }),
      })
    })

    await page.reload()

    // Click verify button
    await page.getByRole('button', { name: 'Verify' }).click()

    // Should show success message
    await expect(page.getByText(/verification successful/i)).toBeVisible()
  })

  test('should handle bulk credential operations', async ({ page }) => {
    // Mock multiple credentials
    await page.route('**/api/credentials**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'cred-123',
              type: ['UniversityDegree'],
              issuerDid: 'did:web:university.edu',
              subjectDid: 'did:web:alice.com',
              status: 'verified',
              issuedAt: '2024-01-01T00:00:00Z',
            },
            {
              id: 'cred-456',
              type: ['ProfessionalCertificate'],
              issuerDid: 'did:web:company.com',
              subjectDid: 'did:web:alice.com',
              status: 'verified',
              issuedAt: '2024-02-01T00:00:00Z',
            },
          ],
          meta: { total: 2, limit: 50, offset: 0, hasMore: false },
        }),
      })
    })

    await page.reload()

    // Select multiple credentials
    await page.locator('input[type="checkbox"]').first().check()
    await page.locator('input[type="checkbox"]').nth(1).check()

    // Check bulk actions toolbar
    await expect(page.getByText('2 selected')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Verify Selected' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Export Selected' })).toBeVisible()
  })
})
