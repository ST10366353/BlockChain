import { test, expect } from '@playwright/test'

test.describe('Complete User Journey', () => {
  test('should complete full user workflow from login to presentation creation', async ({ page }) => {
    // Navigate to the application
    await page.goto('/')

    // Should redirect to login page
    await expect(page).toHaveURL('/login')

    // Complete login process
    await page.getByLabel('Recovery Passphrase').fill('secure mountain forest ocean bridge garden sunset river castle phoenix diamond thunder')
    await page.getByRole('button', { name: 'Unlock Wallet' }).click()

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')

    // Verify dashboard elements
    await expect(page.getByText('DID Wallet Dashboard')).toBeVisible()
    await expect(page.getByText('Quick Actions')).toBeVisible()

    // Navigate to credentials page
    await page.getByRole('link', { name: 'Request Credentials' }).click()
    await expect(page).toHaveURL('/credentials')

    // Mock some credentials data
    await page.route('**/api/credentials**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'cred-1',
              type: ['UniversityDegree'],
              issuerDid: 'did:web:university.edu',
              subjectDid: 'did:web:alice.com',
              status: 'verified',
              issuedAt: '2024-01-01T00:00:00Z',
              expiresAt: '2027-01-01T00:00:00Z',
            },
            {
              id: 'cred-2',
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

    // Reload credentials page to get mock data
    await page.reload()

    // Verify credentials are displayed
    await expect(page.getByText('UniversityDegree')).toBeVisible()
    await expect(page.getByText('ProfessionalCertificate')).toBeVisible()

    // Navigate to presentations page
    await page.goto('/presentations')

    // Mock credentials for presentations
    await page.route('**/api/credentials**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'cred-1',
              type: ['UniversityDegree'],
              issuerDid: 'did:web:university.edu',
              subjectDid: 'did:web:alice.com',
              status: 'verified',
              issuedAt: '2024-01-01T00:00:00Z',
              expiresAt: '2027-01-01T00:00:00Z',
            },
            {
              id: 'cred-2',
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

    // Reload presentations page
    await page.reload()

    // Verify presentations page
    await expect(page.getByText('Verifiable Presentations')).toBeVisible()
    await expect(page.getByText('Available Credentials')).toBeVisible()

    // Click create presentation button
    await page.getByRole('button', { name: 'Create Presentation' }).click()

    // Verify modal opens
    await expect(page.getByText('Create Verifiable Presentation')).toBeVisible()

    // Fill presentation form
    await page.getByLabel('Recipient/Verifier').fill('verifier.company.com')

    // Select credentials
    const checkboxes = page.locator('input[type="checkbox"]')
    await checkboxes.first().check()
    await checkboxes.nth(1).check()

    // Verify credentials are selected
    await expect(page.getByText('Selected Credentials (2)')).toBeVisible()

    // Mock presentation creation API
    await page.route('**/api/presentations', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiablePresentation'],
            holder: 'did:web:alice.com',
            verifiableCredential: [
              {
                id: 'cred-1',
                type: ['UniversityDegree'],
                issuer: 'did:web:university.edu',
                credentialSubject: {
                  id: 'did:web:alice.com',
                  degree: 'Bachelor of Science',
                },
              },
            ],
            proof: {
              type: 'Ed25519Signature2020',
              created: '2024-01-15T10:00:00Z',
              verificationMethod: 'did:web:alice.com#key-1',
              proofPurpose: 'authentication',
              challenge: 'presentation-challenge',
              domain: 'verifier.company.com',
            },
          },
        }),
      })
    })

    // Mock presentation verification
    await page.route('**/api/presentations/verify', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            verified: true,
            checks: [
              { type: 'signature', verified: true, message: 'Valid signature' },
              { type: 'holder', verified: true, message: 'Valid holder' },
            ],
          },
        }),
      })
    })

    // Submit presentation
    await page.getByRole('button', { name: 'Create Presentation' }).click()

    // Verify success message
    await expect(page.getByText(/Successfully created presentation/)).toBeVisible()

    // Verify presentation appears in list
    await expect(page.getByText(/Presentation for verifier.company.com/)).toBeVisible()

    // Navigate back to dashboard
    await page.goto('/dashboard')

    // Verify dashboard shows updated stats
    await expect(page.getByText('DID Wallet Dashboard')).toBeVisible()

    // Test navigation to other sections
    await page.getByRole('link', { name: 'Trust Registry' }).click()
    await expect(page).toHaveURL('/connections')

    await page.getByRole('link', { name: 'Manage Identities' }).click()
    await expect(page).toHaveURL('/identities')

    // Navigate to settings
    await page.goto('/settings')
    await expect(page.getByText('Settings')).toBeVisible()

    // Test settings tabs
    await page.getByRole('button', { name: 'Privacy' }).click()
    await expect(page.getByText('Sharing Preferences')).toBeVisible()

    await page.getByRole('button', { name: 'Security' }).click()
    await expect(page.getByText('Backup & Recovery')).toBeVisible()

    // Test logout functionality (if available)
    // This would depend on the actual logout implementation
    // For now, we'll just verify we can navigate through the app
  })

  test('should handle error scenarios gracefully', async ({ page }) => {
    // Navigate to login
    await page.goto('/login')

    // Test invalid passphrase
    await page.getByLabel('Recovery Passphrase').fill('invalid short')
    await page.getByRole('button', { name: 'Unlock Wallet' }).click()

    // Should show error
    await expect(page.getByText(/enter a valid recovery passphrase/i)).toBeVisible()

    // Test with valid length but invalid passphrase
    await page.getByLabel('Recovery Passphrase').fill('invalid mountain forest ocean bridge garden sunset river castle phoenix diamond thunder')

    // Mock failed authentication
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid credentials' }),
      })
    })

    await page.getByRole('button', { name: 'Unlock Wallet' }).click()

    // Should show authentication error
    await expect(page.getByText(/failed to unlock wallet/i)).toBeVisible()

    // Test DID authentication with invalid format
    await page.getByLabel('Decentralized Identifier (DID)').fill('invalid-did-format')
    await page.getByRole('button', { name: 'Authenticate with DID' }).click()

    // Should show DID format error
    await expect(page.getByText(/invalid did format/i)).toBeVisible()

    // Test with valid DID format but invalid DID
    await page.getByLabel('Decentralized Identifier (DID)').fill('did:web:nonexistent.example')

    // Mock DID resolution failure
    await page.route('**/api/did/resolvable/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ resolvable: false }),
      })
    })

    await page.getByRole('button', { name: 'Authenticate with DID' }).click()

    // Should show DID not resolvable error
    await expect(page.getByText(/did is not resolvable/i)).toBeVisible()
  })

  test('should handle network connectivity issues', async ({ page }) => {
    // Simulate offline state
    await page.context().setOffline(true)

    await page.goto('/login')

    await page.getByLabel('Recovery Passphrase').fill('secure mountain forest ocean bridge garden sunset river castle phoenix diamond thunder')
    await page.getByRole('button', { name: 'Unlock Wallet' }).click()

    // Should handle network error gracefully
    await expect(page.getByText(/network error/i)).toBeVisible()

    // Bring back online
    await page.context().setOffline(false)
  })

  test('should handle session timeout and re-authentication', async ({ page }) => {
    // This would test session management and automatic logout
    // Implementation depends on the actual session handling

    await page.goto('/dashboard')

    // Mock session expiry
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Session expired' }),
      })
    })

    // Trigger session check (this would depend on the actual implementation)
    await page.reload()

    // Should redirect to login or show session expiry message
    // This depends on the actual session handling implementation
  })

  test('should support different user roles and permissions', async ({ page }) => {
    // This would test role-based access control
    // Navigate through different sections and verify access

    await page.goto('/dashboard')

    // Test navigation to different sections
    const sections = [
      { link: 'Manage Identities', url: '/identities' },
      { link: 'Request Credentials', url: '/credentials' },
      { link: 'Trust Registry', url: '/connections' },
    ]

    for (const section of sections) {
      await page.getByRole('link', { name: section.link }).click()
      await expect(page).toHaveURL(section.url)

      // Verify section-specific content loads
      if (section.url === '/identities') {
        await expect(page.getByText('Identity Management')).toBeVisible()
      } else if (section.url === '/credentials') {
        await expect(page.getByText('Credentials')).toBeVisible()
      } else if (section.url === '/connections') {
        await expect(page.getByText('Trust Registry')).toBeVisible()
      }

      // Go back to dashboard for next test
      await page.goto('/dashboard')
    }
  })

  test('should handle mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/dashboard')

    // Verify mobile layout
    await expect(page.getByText('DID Wallet Dashboard')).toBeVisible()

    // Test mobile navigation
    await page.getByRole('link', { name: 'Request Credentials' }).click()
    await expect(page).toHaveURL('/credentials')

    // Test mobile forms and interactions
    await page.getByRole('button', { name: 'Request Credential' }).click()

    // Verify modal works on mobile
    await expect(page.getByText('Request Credential')).toBeVisible()

    // Test mobile-specific interactions
    const modal = page.locator('[role="dialog"]')
    await expect(modal).toBeVisible()

    // Close modal
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(modal).not.toBeVisible()
  })

  test('should support accessibility features', async ({ page }) => {
    await page.goto('/dashboard')

    // Test keyboard navigation
    await page.keyboard.press('Tab')
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()

    // Test ARIA labels and roles
    const mainHeading = page.locator('h1').first()
    await expect(mainHeading).toContainText('DID Wallet Dashboard')

    // Test navigation landmarks
    const navigation = page.locator('[role="navigation"]')
    await expect(navigation).toBeVisible()

    // Test form accessibility
    await page.goto('/credentials')
    const buttons = page.locator('button')
    await expect(buttons.first()).toHaveAttribute('type', 'button')

    // Test screen reader content
    const srContent = page.locator('[aria-label], [aria-describedby]')
    await expect(srContent.count()).toBeGreaterThan(0)
  })

  test('should handle browser back/forward navigation', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/dashboard')

    await page.getByRole('link', { name: 'Request Credentials' }).click()
    await expect(page).toHaveURL('/credentials')

    await page.goBack()
    await expect(page).toHaveURL('/dashboard')

    await page.goForward()
    await expect(page).toHaveURL('/credentials')
  })

  test('should handle concurrent user actions', async ({ page }) => {
    await page.goto('/credentials')

    // Mock credentials data
    await page.route('**/api/credentials**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'cred-1',
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

    await page.reload()

    // Test multiple rapid clicks (should be debounced or handled gracefully)
    const verifyButton = page.getByRole('button', { name: 'Verify' })
    await verifyButton.click()
    await verifyButton.click()
    await verifyButton.click()

    // Should handle multiple clicks without breaking
    await expect(page.getByText('UniversityDegree')).toBeVisible()
  })

  test('should maintain state across page refreshes', async ({ page }) => {
    await page.goto('/dashboard')

    // Check initial state
    await expect(page.getByText('DID Wallet Dashboard')).toBeVisible()

    // Refresh page
    await page.reload()

    // Should maintain state
    await expect(page.getByText('DID Wallet Dashboard')).toBeVisible()
  })

  test('should handle large data sets efficiently', async ({ page }) => {
    await page.goto('/credentials')

    // Mock large dataset
    const largeCredentials = Array.from({ length: 100 }, (_, i) => ({
      id: `cred-${i + 1}`,
      type: [`CredentialType${i % 5}`],
      issuerDid: `did:web:issuer${i % 10}.com`,
      subjectDid: 'did:web:alice.com',
      status: i % 3 === 0 ? 'verified' : i % 3 === 1 ? 'pending' : 'expired',
      issuedAt: `2024-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
    }))

    await page.route('**/api/credentials**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: largeCredentials,
          meta: { total: 100, limit: 50, offset: 0, hasMore: true },
        }),
      })
    })

    await page.reload()

    // Should handle large dataset without performance issues
    await expect(page.getByText('cred-1')).toBeVisible()
    await expect(page.getByText('cred-50')).toBeVisible()

    // Test pagination or infinite scroll if implemented
    // This depends on the actual implementation
  })
})
