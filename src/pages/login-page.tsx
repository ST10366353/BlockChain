"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Unlock, Fingerprint, Loader2, AlertCircle } from "lucide-react"
import { oidcAPI, didAPI } from "@/services"
import type { OIDCTokenResponse, OIDCAuthorizationRequest } from "@/services"

interface AuthState {
  isLoading: boolean
  error: string | null
  step: 'login' | 'oidc-callback' | 'did-auth'
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: false,
    error: null,
    step: 'login'
  })

  // Recovery passphrase for wallet unlock
  const [passphrase, setPassphrase] = useState("")
  const [passphraseError, setPassphraseError] = useState("")

  // DID for OIDC authentication
  const [userDID, setUserDID] = useState("")
  const [didError, setDidError] = useState("")

  // OIDC configuration
  const [oidcConfig, setOidcConfig] = useState({
    clientId: "did-wallet-client",
    redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/login` : "",
    scope: "openid profile email"
  })

  // Handle OIDC callback
  useEffect(() => {
    const handleOIDCCallback = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')

      if (code && state) {
        setAuthState({ isLoading: true, error: null, step: 'oidc-callback' })

        try {
          // Get stored session data
          const sessionData = oidcAPI.getStoredSession()

          if (!sessionData || sessionData.state !== state) {
            throw new Error('Invalid OIDC session state')
          }

          // Complete OIDC flow with DID authentication
          const result = await oidcAPI.completeLoginFlow(
            code,
            state,
            userDID || sessionData.clientId, // Use DID as subject
            "signed-nonce-placeholder", // In real implementation, this would be cryptographically signed
            sessionData.clientId,
            "client-secret-placeholder", // In real implementation, this would be securely stored
            sessionData.redirectUri
          )

          // Store tokens
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', result.tokens.access_token)
            localStorage.setItem('id_token', result.tokens.id_token)
            localStorage.setItem('user_did', userDID || sessionData.clientId)
          }

          // Clear session data
          oidcAPI.clearSession()

          // Redirect to dashboard
          router.push('/dashboard')

        } catch (error) {
          console.error('OIDC callback error:', error)
          setAuthState({
            isLoading: false,
            error: error instanceof Error ? error.message : 'OIDC authentication failed',
            step: 'login'
          })
        }
      }
    }

    if (searchParams.has('code')) {
      handleOIDCCallback()
    }
  }, [searchParams, router, userDID])

  const handlePassphraseUnlock = async () => {
    const words = passphrase.trim().split(/\s+/)
    if (words.length < 6) {
      setPassphraseError("Enter a valid recovery passphrase")
      return
    }

    setAuthState({ isLoading: true, error: null, step: 'login' })
    setPassphraseError("")

    try {
      // In a real implementation, this would verify the passphrase
      // For now, we'll simulate successful authentication
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Store authentication state
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_method', 'passphrase')
        localStorage.setItem('wallet_unlocked', 'true')
      }

      router.push("/dashboard")
    } catch (error) {
      setPassphraseError("Failed to unlock wallet")
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleDIDAuthentication = async () => {
    if (!userDID.trim()) {
      setDidError("Please enter your DID")
      return
    }

    if (!didAPI.validateDIDFormat(userDID)) {
      setDidError("Invalid DID format")
      return
    }

    setAuthState({ isLoading: true, error: null, step: 'did-auth' })
    setDidError("")

    try {
      // Verify DID exists and is resolvable
      const isResolvable = await didAPI.isDIDResolvable(userDID)
      if (!isResolvable) {
        throw new Error("DID is not resolvable or does not exist")
      }

      // Start OIDC authorization flow
      const authRequest: OIDCAuthorizationRequest = {
        client_id: oidcConfig.clientId,
        redirect_uri: oidcConfig.redirectUri,
        scope: oidcConfig.scope,
      }

      const authResponse = await oidcAPI.authorize(authRequest)

      // Store session data
      oidcAPI.storeSession({
        state: authResponse.state,
        nonce: authResponse.nonce,
        clientId: oidcConfig.clientId,
        redirectUri: oidcConfig.redirectUri,
        timestamp: Date.now(),
      })

      // Redirect to OIDC provider
      window.location.href = authResponse.authorizationUrl

    } catch (error) {
      console.error('DID authentication error:', error)
      setAuthState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'DID authentication failed',
        step: 'login'
      })
    }
  }

  const handleBiometric = async () => {
    setAuthState({ isLoading: true, error: null, step: 'login' })

    try {
      // Check if WebAuthn is available
      if (!window.PublicKeyCredential) {
        throw new Error("Biometric authentication is not supported on this device")
      }

      // In a real implementation, this would use WebAuthn API
      // For now, we'll simulate biometric authentication
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Store authentication state
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_method', 'biometric')
        localStorage.setItem('wallet_unlocked', 'true')
      }

      router.push("/dashboard")
    } catch (error) {
      setAuthState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Biometric authentication failed',
        step: 'login'
      })
    }
  }

  // Show loading state
  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold mb-2">
            {authState.step === 'oidc-callback' && 'Completing Authentication'}
            {authState.step === 'did-auth' && 'Authenticating with DID'}
            {authState.step === 'login' && 'Unlocking Wallet'}
          </h2>
          <p className="text-gray-600">
            {authState.step === 'oidc-callback' && 'Processing your authentication...'}
            {authState.step === 'did-auth' && 'Verifying your DID and starting OIDC flow...'}
            {authState.step === 'login' && 'Please wait...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Welcome Back</h2>

        {authState.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-sm text-red-700">{authState.error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Recovery Passphrase Section */}
          <div>
            <label htmlFor="recovery-passphrase" className="block text-sm font-medium mb-2">Recovery Passphrase</label>
            <textarea
              id="recovery-passphrase"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your 12-word recovery passphrase (space-separated)"
              disabled={authState.isLoading}
            />
            {passphraseError && <p className="text-sm text-red-600 mt-2">{passphraseError}</p>}
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <span>💡</span>
              <span className="ml-1">Make sure words are separated by spaces</span>
            </div>
          </div>

          <button
            onClick={handlePassphraseUnlock}
            disabled={authState.isLoading || !passphrase.trim()}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Unlock className="w-5 h-5 mr-2" />
            {authState.isLoading ? 'Unlocking...' : 'Unlock Wallet'}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or authenticate with</span>
            </div>
          </div>

          {/* DID Authentication Section */}
          <div>
            <label htmlFor="user-did" className="block text-sm font-medium mb-2">Decentralized Identifier (DID)</label>
            <input
              id="user-did"
              type="text"
              value={userDID}
              onChange={(e) => setUserDID(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="did:web:example.com or did:key:z6Mk..."
              disabled={authState.isLoading}
            />
            {didError && <p className="text-sm text-red-600 mt-2">{didError}</p>}
            <div className="mt-2 text-xs text-gray-500">
              <div className="flex items-start space-x-1">
                <span>💡</span>
                <div>
                  <p className="mb-1">Examples:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>did:web:alice.com</li>
                    <li>did:key:z6Mk...</li>
                    <li>did:ethr:0x...</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleDIDAuthentication}
            disabled={authState.isLoading || !userDID.trim()}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Fingerprint className="w-5 h-5 mr-2" />
            {authState.isLoading ? 'Authenticating...' : 'Authenticate with DID'}
          </button>

          {/* Biometric Authentication */}
          <button
            onClick={handleBiometric}
            disabled={authState.isLoading}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Fingerprint className="w-5 h-5 mr-2" />
            {authState.isLoading ? 'Authenticating...' : 'Use Biometric Authentication'}
          </button>
          <div className="text-xs text-gray-500 text-center">
            <span>🔒</span>
            <span className="ml-1">Fast and secure authentication using your device's biometrics</span>
          </div>
        </div>

        {/* Help text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Need help? Check our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-800">
              authentication guide
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
