import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import LoginPage from '../../src/pages/login-page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

// Mock the services
jest.mock('@/services', () => ({
  oidcAPI: {
    authorize: jest.fn(),
    storeSession: jest.fn(),
    clearSession: jest.fn(),
    getStoredSession: jest.fn(),
    completeLoginFlow: jest.fn(),
  },
  didAPI: {
    validateDIDFormat: jest.fn(),
    isDIDResolvable: jest.fn(),
  },
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Spy on localStorage methods
jest.spyOn(localStorageMock, 'getItem')
jest.spyOn(localStorageMock, 'setItem')
jest.spyOn(localStorageMock, 'removeItem')
jest.spyOn(localStorageMock, 'clear')

// Mock the useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toastSuccess: jest.fn(),
    toastError: jest.fn(),
  }),
}))

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
}

const mockSearchParams = {
  get: jest.fn(),
  has: jest.fn(),
}

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(require('next/navigation').useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
  })

  it('renders login form with passphrase and DID sections', () => {
    render(<LoginPage />)

    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByLabelText(/recovery passphrase/i)).toBeInTheDocument()
    expect(screen.getByText(/or authenticate with/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/decentralized identifier/i)).toBeInTheDocument()
    expect(screen.getByText('Use Biometric Authentication')).toBeInTheDocument()
  })

  it('validates passphrase length', async () => {
    render(<LoginPage />)

    const passphraseInput = screen.getByLabelText(/recovery passphrase/i)
    const unlockButton = screen.getByText('Unlock Wallet')

    // Enter short passphrase
    fireEvent.change(passphraseInput, { target: { value: 'short' } })
    fireEvent.click(unlockButton)

    await waitFor(() => {
      expect(screen.getByText(/enter a valid recovery passphrase/i)).toBeInTheDocument()
    })
  })

  it('handles valid passphrase unlock', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { oidcAPI, didAPI: _didAPI } = require('@/services')

    // Mock successful passphrase validation
    oidcAPI.completeLoginFlow.mockResolvedValue({
      tokens: {
        access_token: 'mock-access-token',
        id_token: 'mock-id-token',
      },
    })

    render(<LoginPage />)

    const passphraseInput = screen.getByLabelText(/recovery passphrase/i)
    const unlockButton = screen.getByText('Unlock Wallet')

    // Enter valid passphrase (12 words)
    const validPassphrase = 'secure mountain forest ocean bridge garden sunset river castle phoenix diamond thunder'
    fireEvent.change(passphraseInput, { target: { value: validPassphrase } })
    fireEvent.click(unlockButton)

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
    }, { timeout: 2000 })

    expect(localStorage.setItem).toHaveBeenCalledWith('auth_method', 'passphrase')
    expect(localStorage.setItem).toHaveBeenCalledWith('wallet_unlocked', 'true')
  })

  it('validates DID format', async () => {
    const { didAPI } = require('@/services')
    didAPI.validateDIDFormat.mockReturnValue(false)

    render(<LoginPage />)

    const didInput = screen.getByLabelText(/decentralized identifier/i)
    const didButton = screen.getByText('Authenticate with DID')

    fireEvent.change(didInput, { target: { value: 'invalid-did' } })
    fireEvent.click(didButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid did format/i)).toBeInTheDocument()
    })
  })

  it('handles DID authentication flow', async () => {
    const { oidcAPI, didAPI } = require('@/services')

    didAPI.validateDIDFormat.mockReturnValue(true)
    didAPI.isDIDResolvable.mockResolvedValue(true)
    oidcAPI.authorize.mockResolvedValue({
      authorizationUrl: 'https://oidc.example.com/auth',
      state: 'mock-state',
      nonce: 'mock-nonce',
    })

    // Mock window.location.href
    delete (global as any).window.location
    ;(global as any).window.location = { href: '' }

    render(<LoginPage />)

    const didInput = screen.getByLabelText(/decentralized identifier/i)
    const didButton = screen.getByText('Authenticate with DID')

    fireEvent.change(didInput, { target: { value: 'did:web:example.com' } })
    fireEvent.click(didButton)

    await waitFor(() => {
      expect(oidcAPI.authorize).toHaveBeenCalled()
      expect(oidcAPI.storeSession).toHaveBeenCalled()
    })
  })

  it('handles biometric authentication', async () => {
    // Mock WebAuthn availability
    ;(global as any).PublicKeyCredential = true

    render(<LoginPage />)

    const biometricButton = screen.getByText('Use Biometric Authentication')
    fireEvent.click(biometricButton)

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
    }, { timeout: 2000 })

    expect(localStorage.setItem).toHaveBeenCalledWith('auth_method', 'biometric')
    expect(localStorage.setItem).toHaveBeenCalledWith('wallet_unlocked', 'true')
  })

  it('handles biometric authentication when WebAuthn is not available', async () => {
    // Mock WebAuthn unavailability
    ;(global as any).PublicKeyCredential = undefined

    render(<LoginPage />)

    const biometricButton = screen.getByText('Use Biometric Authentication')
    fireEvent.click(biometricButton)

    await waitFor(() => {
      expect(screen.getByText(/biometric authentication is not supported/i)).toBeInTheDocument()
    })
  })

  it('handles OIDC callback', async () => {
    const { oidcAPI } = require('@/services')

    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'code') return 'mock-auth-code'
      if (key === 'state') return 'mock-state'
      return null
    })
    mockSearchParams.has.mockReturnValue(true)

    oidcAPI.getStoredSession.mockReturnValue({
      state: 'mock-state',
      clientId: 'mock-client-id',
      redirectUri: 'mock-redirect-uri',
    })

    oidcAPI.completeLoginFlow.mockResolvedValue({
      tokens: {
        access_token: 'mock-access-token',
        id_token: 'mock-id-token',
      },
    })

    render(<LoginPage />)

    await waitFor(() => {
      expect(oidcAPI.completeLoginFlow).toHaveBeenCalledWith(
        'mock-auth-code',
        'mock-state',
        expect.any(String),
        'signed-nonce-placeholder',
        'mock-client-id',
        'client-secret-placeholder',
        'mock-redirect-uri'
      )
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('disables buttons during loading states', async () => {
    const { didAPI } = require('@/services')

    didAPI.validateDIDFormat.mockReturnValue(true)
    didAPI.isDIDResolvable.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)))

    render(<LoginPage />)

    const passphraseInput = screen.getByLabelText(/recovery passphrase/i)
    const didInput = screen.getByLabelText(/decentralized identifier/i)
    const unlockButton = screen.getByText('Unlock Wallet')
    const didButton = screen.getByText('Authenticate with DID')
    const biometricButton = screen.getByText('Use Biometric Authentication')

    // Start DID authentication
    fireEvent.change(didInput, { target: { value: 'did:web:example.com' } })
    fireEvent.click(didButton)

    // Buttons should be disabled during loading
    expect(unlockButton).toBeDisabled()
    expect(didButton).toBeDisabled()
    expect(biometricButton).toBeDisabled()
    expect(passphraseInput).toBeDisabled()
    expect(didInput).toBeDisabled()
  })
})
