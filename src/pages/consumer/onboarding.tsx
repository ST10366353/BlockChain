"use client";

import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Shield,
  Key,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Smartphone,
  Globe,
  Users
} from 'lucide-react';

import { useApp } from '../../shared/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/components/ui/card';
import { Button } from '../../shared/components/ui/button';
import { didAPI, profileAPI } from '../../services';
import { UserType } from '../../shared/types';

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to Your DID Wallet',
    description: 'Secure your digital identity with blockchain technology',
    icon: Shield
  },
  {
    id: 'privacy',
    title: 'Your Privacy, Your Control',
    description: 'You decide what information to share and with whom',
    icon: Eye
  },
  {
    id: 'identity',
    title: 'Create Your Digital Identity',
    description: 'Set up your decentralized identifier (DID)',
    icon: Key
  },
  {
    id: 'security',
    title: 'Security First',
    description: 'Configure your security preferences',
    icon: Lock
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Start using your DID wallet to manage credentials securely',
    icon: CheckCircle
  }
];

export default function ConsumerOnboarding() {
  const router = useRouter();
  const { setLoading } = useApp();

  const [currentStep, setCurrentStep] = useState(0);
  const [userDID, setUserDID] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [privacyLevel, setPrivacyLevel] = useState<'selective' | 'minimal' | 'full'>('selective');
  const [recoveryPhrase, setRecoveryPhrase] = useState<string[]>([]);
  const [showRecoveryPhrase, setShowRecoveryPhrase] = useState(false);

  const generateRecoveryPhrase = () => {
    const words = [
      "secure", "mountain", "forest", "ocean", "bridge", "garden", "sunset",
      "river", "castle", "phoenix", "diamond", "thunder", "lightning", "shadow",
      "whisper", "echo", "crystal", "horizon", "serenity", "vortex"
    ];

    // Use cryptographically secure random generation for wallet security
    const phrase = Array.from({ length: 12 }, () => {
      if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return words[array[0] % words.length];
      } else {
        // Fallback for environments without crypto API
        return words[Math.floor(Math.random() * words.length)];
      }
    });

    setRecoveryPhrase(phrase);
  };

  const handleCompleteSetup = async () => {
    setLoading({ isLoading: true, message: 'Setting up your wallet...' });

    try {
      // Create DID
      const didResult = await didAPI.registerDID({
        method: 'key',
        controller: userDID || undefined,
        description: `DID for ${userName}`,
        document: {
          '@context': ['https://www.w3.org/ns/did/v1'],
          verificationMethod: [{
            id: '#key-1',
            type: 'Ed25519VerificationKey2020',
            controller: userDID || '',
            publicKeyMultibase: 'z6Mk' + Math.random().toString(36).substring(2, 10)
          }]
        }
      });

      // Create profile by updating an empty profile
      const initialProfile = await profileAPI.getProfile();
      await profileAPI.updateProfile({
        name: userName,
        did: didResult.did,
        preferences: {
          privacy: {
            profileVisibility: 'private',
            credentialSharing: privacyLevel,
            dataRetention: 365,
            analyticsOptOut: false,
            anonymousIdentity: false
          },
          security: {
            autoLock: true,
            biometricEnabled,
            twoFactorEnabled: false,
            sessionTimeout: 15,
            loginAlerts: true
          },
          notifications: {
            email: true,
            push: true,
            sms: false,
            marketing: false,
            security: true,
            credentialUpdates: true,
            handshakeRequests: true
          },
          display: {
            dateFormat: 'MM/dd/yyyy',
            timeFormat: '12h',
            currency: 'USD',
            itemsPerPage: 20
          }
        },
        recoveryPhrase: recoveryPhrase.join(' ')
      });

      setLoading({ isLoading: false });
      router.push('/consumer/dashboard');
    } catch (error) {
      console.error('Failed to complete setup:', error);
      setLoading({ isLoading: false });
      // Handle error - show error message
    }
  };

  const nextStep = () => {
    // Validate current step before proceeding
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const validateCurrentStep = (): boolean => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'profile':
        if (!userName || userName.trim().length < 2) {
          alert('Please enter a valid name (at least 2 characters)');
          return false;
        }
        if (userDID && !userDID.startsWith('did:')) {
          alert('DID must start with "did:"');
          return false;
        }
        break;
      case 'recovery':
        if (recoveryPhrase.length === 0) {
          alert('Please generate your recovery phrase');
          return false;
        }
        break;
    }

    return true;
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to Your DID Wallet
              </h2>
              <p className="text-gray-600 mb-6">
                Take control of your digital identity with our secure, privacy-first platform.
                Your credentials, your rules.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-left">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600 mb-2" />
                  <h3 className="font-semibold mb-1">Secure by Design</h3>
                  <p className="text-sm text-gray-600">
                    Blockchain-backed security with zero-knowledge proofs
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <Eye className="w-6 h-6 text-green-600 mb-2" />
                  <h3 className="font-semibold mb-1">Privacy First</h3>
                  <p className="text-sm text-gray-600">
                    You control what information is shared and with whom
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <Globe className="w-6 h-6 text-purple-600 mb-2" />
                  <h3 className="font-semibold mb-1">Interoperable</h3>
                  <p className="text-sm text-gray-600">
                    Works seamlessly with organizations and services worldwide
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your Privacy, Your Control
              </h2>
              <p className="text-gray-600">
                Choose how much information you want to share by default
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Card
                className={`cursor-pointer transition-all ${
                  privacyLevel === 'minimal' ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setPrivacyLevel('minimal')}
              >
                <CardHeader>
                  <CardTitle className="text-center">Minimal Sharing</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Only share what's absolutely necessary
                  </p>
                  <div className="text-xs text-gray-500">
                    ✅ Basic verification<br />
                    ❌ Personal details<br />
                    ❌ Contact information
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  privacyLevel === 'selective' ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setPrivacyLevel('selective')}
              >
                <CardHeader>
                  <CardTitle className="text-center">Selective Sharing</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Review and approve each request
                  </p>
                  <div className="text-xs text-gray-500">
                    ✅ Case-by-case approval<br />
                    ✅ Granular control<br />
                    ✅ Maximum privacy
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  privacyLevel === 'full' ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setPrivacyLevel('full')}
              >
                <CardHeader>
                  <CardTitle className="text-center">Full Disclosure</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Share comprehensive information
                  </p>
                  <div className="text-xs text-gray-500">
                    ✅ Complete profile<br />
                    ✅ All credentials<br />
                    ✅ Contact details
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'identity':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create Your Digital Identity
              </h2>
              <p className="text-gray-600">
                Set up your decentralized identifier (DID) and profile
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    userName.trim().length < 2 && userName.length > 0
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                  required
                  minLength={2}
                  maxLength={50}
                />
                {userName.length > 0 && userName.trim().length < 2 && (
                  <p className="text-red-500 text-xs mt-1">
                    Name must be at least 2 characters
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DID (Optional - will be auto-generated)
                </label>
                <input
                  type="text"
                  value={userDID}
                  onChange={(e) => setUserDID(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    userDID && !userDID.startsWith('did:')
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="did:key:..."
                  pattern="^did:[a-z0-9]+:.+"
                />
                {userDID && !userDID.startsWith('did:') && (
                  <p className="text-red-500 text-xs mt-1">
                    DID must start with "did:"
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Security First
              </h2>
              <p className="text-gray-600">
                Configure your security preferences and recovery options
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-6">
              {/* Biometric Authentication */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium">Biometric Authentication</p>
                        <p className="text-sm text-gray-600">Use fingerprint or face recognition</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setBiometricEnabled(!biometricEnabled)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        biometricEnabled ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        biometricEnabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Recovery Phrase */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium mb-2">Recovery Phrase</p>
                      <p className="text-sm text-gray-600 mb-4">
                        Generate a secure 12-word recovery phrase to backup your wallet
                      </p>
                    </div>

                    {!recoveryPhrase.length ? (
                      <Button onClick={generateRecoveryPhrase} className="w-full">
                        Generate Recovery Phrase
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Your Recovery Phrase:</p>
                          <button
                            onClick={() => setShowRecoveryPhrase(!showRecoveryPhrase)}
                            className="text-sm text-blue-600 flex items-center"
                          >
                            {showRecoveryPhrase ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-1" />
                                Hide
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-1" />
                                Show
                              </>
                            )}
                          </button>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                          {showRecoveryPhrase ? (
                            <div className="grid grid-cols-3 gap-2 text-sm font-mono">
                              {recoveryPhrase.map((word, index) => (
                                <div key={index} className="text-center p-2 bg-white rounded">
                                  {index + 1}. {word}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-gray-500">
                              • • • • • • • • • • • •
                            </div>
                          )}
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-sm text-yellow-800">
                            ⚠️ Store this phrase securely. It's the only way to recover your wallet if you lose access.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                You're All Set!
              </h2>
              <p className="text-gray-600 mb-6">
                Your DID wallet is ready to use. Start managing your digital credentials securely.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-left max-w-md mx-auto">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600 mb-2" />
                  <h3 className="font-semibold mb-1">Secure Storage</h3>
                  <p className="text-sm text-gray-600">
                    Your credentials are encrypted and stored securely
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <Eye className="w-6 h-6 text-green-600 mb-2" />
                  <h3 className="font-semibold mb-1">Privacy Control</h3>
                  <p className="text-sm text-gray-600">
                    You control what information is shared
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <Globe className="w-6 h-6 text-purple-600 mb-2" />
                  <h3 className="font-semibold mb-1">Global Access</h3>
                  <p className="text-sm text-gray-600">
                    Access your wallet from anywhere
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <Users className="w-6 h-6 text-orange-600 mb-2" />
                  <h3 className="font-semibold mb-1">Easy Sharing</h3>
                  <p className="text-sm text-gray-600">
                    Share credentials with a simple tap
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">DID Wallet Setup</span>
            </div>
            <div className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card className="min-h-[500px]">
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={currentStep === steps.length - 1 ? handleCompleteSetup : nextStep}
            disabled={
              (currentStep === 2 && !userName.trim()) ||
              (currentStep === 3 && recoveryPhrase.length === 0)
            }
            className="flex items-center"
          >
            {currentStep === steps.length - 1 ? (
              'Complete Setup'
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
