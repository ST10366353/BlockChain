import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Key, Fingerprint, ArrowLeft, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react"
import { Link } from "react-router"
import { useAuth } from "@/contexts/AuthContext"
import { passphraseLoginSchema, didLoginSchema, PassphraseLoginForm, DIDLoginForm } from "@/shared/types"
import { useToast } from "@/components/ui/toast"
import {
  FormField,
  FormValidationSummary,
  ValidatedInput,
  FieldValidationHint,
  useZodForm,
  useValidationState,
  SubmitButton
} from "@/components/forms/form-utils"

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loginBiometric, isLoading, error, clearError, isAuthenticated } = useAuth()
  const { success, error: showError } = useToast()

  const [showPassphrase, setShowPassphrase] = useState(false)
  const [activeTab, setActiveTab] = useState("passphrase")

  // Enhanced form hooks with real-time validation
  const passphraseForm = useZodForm<PassphraseLoginForm>(passphraseLoginSchema, {
    defaultValues: { passphrase: "" },
  })

  const didForm = useZodForm<DIDLoginForm>(didLoginSchema, {
    defaultValues: { did: "" },
  })

  const {
    register: registerPassphrase,
    handleSubmit: handlePassphraseSubmit,
    formState: { errors: passphraseErrors },
    watch: watchPassphrase
  } = passphraseForm

  const {
    register: registerDID,
    handleSubmit: handleDIDSubmit,
    formState: { errors: didErrors },
    watch: watchDID
  } = didForm

  // Real-time validation states
  const passphraseValidation = useValidationState(passphraseForm, "passphrase")
  const didValidation = useValidationState(didForm, "did")

  // Watch form values for dynamic feedback
  const watchedPassphrase = watchPassphrase("passphrase")
  const watchedDID = watchDID("did")

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/dashboard"
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  // Clear error when component mounts or tab changes
  useEffect(() => {
    if (error) {
      clearError()
    }
  }, [activeTab, error, clearError])

  // Handle passphrase login
  const handlePassphraseLogin = async (data: PassphraseLoginForm) => {
    try {
      const credentials = {
        did: "did:example:passphrase-auth", // Mock DID for passphrase auth
        passphrase: data.passphrase,
      }
      await login(credentials)
      // Navigation will happen via useEffect when isAuthenticated becomes true
    } catch (error) {
      // Error is handled by the auth context
      console.error("Passphrase login failed:", error)
    }
  }

  // Handle DID login
  const handleDIDLogin = async (data: DIDLoginForm) => {
    try {
      const credentials = {
        did: data.did,
        passphrase: "", // Not needed for DID auth
      }
      await login(credentials)
      // Navigation will happen via useEffect when isAuthenticated becomes true
    } catch (error) {
      // Error is handled by the auth context
      console.error("DID login failed:", error)
    }
  }

  // Handle biometric login
  const handleBiometricLogin = async () => {
    try {
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential || !window.navigator.credentials) {
        showError('Biometric authentication is not supported on this device');
        return;
      }

      // Check if biometric authentication is available
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        showError('Biometric authentication is not available on this device');
        return;
      }

      // Create authentication options
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const credentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        rpId: window.location.hostname,
        userVerification: 'required',
        timeout: 60000,
      };

      // Request authentication
      const credential = await navigator.credentials.get({
        publicKey: credentialRequestOptions
      }) as PublicKeyCredential;

      if (credential) {
        // Send credential data to authentication service
        await loginBiometric({
          id: credential.id,
          rawId: credential.rawId,
          response: {
            authenticatorData: (credential.response as any).authenticatorData,
            clientDataJSON: credential.response.clientDataJSON,
            signature: (credential.response as any).signature,
            userHandle: (credential.response as any).userHandle,
          },
          type: credential.type,
        });

        success('Biometric authentication successful!');
      }
    } catch (error) {
      console.error("Biometric login failed:", error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          showError('Biometric authentication was cancelled or denied');
        } else if (error.name === 'AbortError') {
          showError('Biometric authentication timed out');
        } else {
          showError('Biometric authentication failed. Please try again.');
        }
      } else {
        showError('An unexpected error occurred during biometric authentication');
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">IdentityVault</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-300">Access your decentralized identity wallet</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6 border-red-500/50 bg-red-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Login Card */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Sign In</CardTitle>
            <CardDescription className="text-gray-300">
              Choose your preferred authentication method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/10">
                <TabsTrigger value="passphrase" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300">
                  <Key className="w-4 h-4 mr-2" />
                  Passphrase
                </TabsTrigger>
                <TabsTrigger value="did" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300">
                  <Shield className="w-4 h-4 mr-2" />
                  DID
                </TabsTrigger>
                <TabsTrigger value="biometric" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300">
                  <Fingerprint className="w-4 h-4 mr-2" />
                  Biometric
                </TabsTrigger>
              </TabsList>

              <TabsContent value="passphrase" className="space-y-4">
                <FormValidationSummary form={passphraseForm} />

                <form onSubmit={handlePassphraseSubmit(handlePassphraseLogin)}>
                  <FormField
                    label="Recovery Passphrase"
                    error={passphraseErrors.passphrase?.message}
                    validationState={passphraseValidation.validationState}
                    required
                    validationIcon={passphraseValidation.icon}
                    description="Enter your 12-word recovery phrase to access your wallet"
                  >
                    <div className="relative">
                      <ValidatedInput
                        type={showPassphrase ? "text" : "password"}
                        placeholder="Enter your 12-word recovery phrase"
                        validationState={passphraseValidation.validationState}
                        {...registerPassphrase("passphrase")}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassphrase(!showPassphrase)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <FieldValidationHint
                      hint={
                        watchedPassphrase?.length >= 12
                          ? "✓ Valid 12-word passphrase"
                          : watchedPassphrase?.length > 0
                            ? `Enter ${12 - watchedPassphrase.length} more words`
                            : "Enter your 12-word recovery phrase"
                      }
                      validationState={
                        watchedPassphrase?.length >= 12 ? 'success' :
                        watchedPassphrase?.length > 0 ? 'warning' : 'idle'
                      }
                    />
                  </FormField>

                  <div className="mt-4">
                    <SubmitButton
                      className="w-full"
                      isLoading={isLoading}
                      disabled={!passphraseForm.formState.isValid}
                      loadingText="Accessing Wallet..."
                    >
                      Access Wallet
                    </SubmitButton>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="did" className="space-y-4">
                <FormValidationSummary form={didForm} />

                <form onSubmit={handleDIDSubmit(handleDIDLogin)}>
                  <FormField
                    label="Decentralized Identifier (DID)"
                    error={didErrors.did?.message}
                    validationState={didValidation.validationState}
                    required
                    validationIcon={didValidation.icon}
                    description="Enter your DID to authenticate via OIDC flow"
                  >
                    <ValidatedInput
                      type="text"
                      placeholder="did:example:123abc..."
                      validationState={didValidation.validationState}
                      {...registerDID("did")}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 font-mono text-sm"
                    />
                    <FieldValidationHint
                      hint={
                        watchedDID?.startsWith('did:')
                          ? "✓ Valid DID format"
                          : watchedDID?.length > 0
                            ? "DID must start with 'did:'"
                            : "Enter your decentralized identifier"
                      }
                      validationState={
                        watchedDID?.startsWith('did:') ? 'success' :
                        watchedDID?.length > 0 ? 'error' : 'idle'
                      }
                    />
                  </FormField>

                  <div className="mt-4">
                    <SubmitButton
                      className="w-full"
                      isLoading={isLoading}
                      disabled={!didForm.formState.isValid}
                      loadingText="Authenticating..."
                    >
                      Authenticate with DID
                    </SubmitButton>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="biometric" className="space-y-4">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Fingerprint className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Biometric Authentication</h3>
                  <p className="text-gray-300 text-sm mb-6">
                    Use your fingerprint, Face ID, or security key to access your wallet
                  </p>
                  <Button
                    className="w-full"
                    disabled={isLoading}
                    onClick={handleBiometricLogin}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      "Authenticate"
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Don't have a wallet?{" "}
            <Link to="/onboarding" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
