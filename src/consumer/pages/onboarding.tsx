"use client";

import React from 'react';
;;
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
  Users,
  Zap
} from 'lucide-react';
 
import { useApp } from '../../shared/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/components/ui/card';
import { Button } from '../../shared/components/ui/button';
import { didAPI, profileAPI } from '../../services';
import { UserType } from '../../shared/types';
import { useAnalytics } from '../../contexts/AnalyticsContext';


// A/B Test variants for onboarding flow
const onboardingVariants = {
  original: [
    {
      id: 'welcome',
      title: 'Welcome to Your DID Wallet',
      description: 'Secure your digital identity with blockchain technology',
      icon: Shield,
      subtitle: 'Get started with your decentralized identity'
    },
    {
      id: 'privacy',
      title: 'Your Privacy, Your Control',
      description: 'You decide what information to share and with whom',
      icon: Eye,
      subtitle: 'Understand your data rights and privacy'
    },
    {
      id: 'identity',
      title: 'Create Your Digital Identity',
      description: 'Set up your decentralized identifier (DID)',
      icon: Key,
      subtitle: 'Generate your unique digital identifier'
    },
    {
      id: 'security',
      title: 'Security First',
      description: 'Configure your security preferences',
      icon: Lock,
      subtitle: 'Set up your authentication methods'
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Start using your DID wallet to manage credentials securely',
      icon: CheckCircle,
      subtitle: 'Your digital identity is ready to use'
    }
  ],
  simplified: [
    {
      id: 'welcome',
      title: 'Welcome to Your DID Wallet',
      description: 'Take control of your digital identity with our secure, blockchain-powered platform',
      icon: Shield,
      subtitle: 'Quick setup in just 2 minutes'
    },
    {
      id: 'quick-setup',
      title: 'Quick Setup',
      description: 'We\'ll set up everything automatically with smart defaults',
      icon: Zap,
      subtitle: 'Automatic configuration for you'
    },
    {
      id: 'complete',
      title: 'Ready to Go!',
      description: 'Your DID wallet is configured and ready to use',
      icon: CheckCircle,
      subtitle: 'Start exploring your digital identity'
    }
  ],
  guided: [
    {
      id: 'welcome',
      title: 'Your Digital Identity Journey Begins',
      description: 'Discover how blockchain technology can secure your digital life',
      icon: Shield,
      subtitle: 'Learn as you set up'
    },
    {
      id: 'learn-privacy',
      title: 'Privacy by Design',
      description: 'See how our platform protects your data and gives you control',
      icon: Eye,
      subtitle: 'Interactive privacy education'
    },
    {
      id: 'create-identity',
      title: 'Craft Your Digital Self',
      description: 'Create your unique digital identifier with guided assistance',
      icon: Key,
      subtitle: 'Step-by-step identity creation'
    },
    {
      id: 'security-workshop',
      title: 'Security Workshop',
      description: 'Learn best practices while configuring your security settings',
      icon: Lock,
      subtitle: 'Educational security setup'
    },
    {
      id: 'explore-features',
      title: 'Explore Your New Capabilities',
      description: 'Discover what you can do with your new digital identity',
      icon: CheckCircle,
      subtitle: 'Feature showcase and next steps'
    }
  ]
};

const steps = onboardingVariants.original; // Default fallback

export default function ConsumerOnboarding() {
  const router = useRouter();
  const { setLoading } = useApp();
  const { getABTestVariant, trackEvent } = useAnalytics();

  // Get A/B test variant for onboarding flow
  const variant = getABTestVariant('onboarding_flow');
  const currentSteps = variant?.id === 'simplified' ? onboardingVariants.simplified :
                       variant?.id === 'guided' ? onboardingVariants.guided :
                       onboardingVariants.original;

  // Track onboarding start
  React.useEffect(() => {
    trackEvent({
      eventType: 'conversion',
      page: 'onboarding',
      action: 'onboarding_started',
      data: { variant: variant?.id || 'original' }
    });
  }, [variant, trackEvent]);

  const [currentStep, setCurrentStep] = React.useState(0);
  const [userDID, setUserDID] = React.useState<string>('');
  const [userName, setUserName] = React.useState<string>('');
  const [biometricEnabled, setBiometricEnabled] = React.useState(false);
  const [privacyLevel, setPrivacyLevel] = React.useState<'selective' | 'minimal' | 'full'>('selective');
  const [recoveryPhrase, setRecoveryPhrase] = React.useState<string[]>([]);
  const [showRecoveryPhrase, setShowRecoveryPhrase] = React.useState(false);

  const generateRecoveryPhrase = () => {
    const words = [
      "secure", "mountain", "forest", "ocean", "bridge", "garden", "sunset",
      "river", "castle", "phoenix", "diamond", "thunder", "lightning", "shadow",
      "whisper", "echo", "crystal", "horizon", "serenity", "vortex"
    ];

    const phrase = Array.from({ length: 12 }, () =>
      words[Math.floor(Math.random() * words.length)]
    );

    setRecoveryPhrase(phrase);
  };

  const handleCompleteSetup = async () => {
    setLoading({ isLoading: true, message: 'Setting up your wallet...' });

    try {
      // Register DID
      const registration = await didAPI.registerDID({
        did: userDID || 'did:key:z6MkDemoUser',
        method: 'key',
        document: {
          '@context': ['https://www.w3.org/ns/did/v1'],
          id: userDID || 'did:key:z6MkDemoUser',
        },
      });

      // Update profile
      await profileAPI.updateProfile({
        name: userName,
        preferences: {
          privacy: {
            profileVisibility: 'private',
            credentialSharing: privacyLevel === 'minimal' ? 'always-ask' : privacyLevel === 'full' ? 'automatic' : 'selective',
            dataRetention: 365,
            analyticsOptOut: false,
            anonymousIdentity: false,
          },
          security: {
            autoLockTimeout: 15,
            biometricEnabled,
            twoFactorEnabled: false,
            sessionTimeout: 30,
          },
          notifications: {
            email: true,
            push: true,
            sms: false,
            inApp: true,
            types: {
              'credential.issued': true,
              'credential.verified': true,
              'credential.revoked': true,
              'credential.expired': true,
              'connection.request': true,
              'connection.accepted': true,
              'connection.rejected': false,
              'presentation.request': true,
              'presentation.verified': true,
              'security.alert': true,
              'system.update': false,
              'audit.event': false
            },
            quietHours: {
              enabled: false,
              start: '22:00',
              end: '08:00',
            },
          },
          display: {
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12h',
            itemsPerPage: 20,
          },
          theme: 'light',
          language: 'en',
          timezone: typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
        },
      });

      setLoading({ isLoading: false });

      // Track onboarding completion
      trackEvent({
        eventType: 'conversion',
        page: 'onboarding',
        action: 'onboarding_completed',
        data: { variant: variant?.id || 'original' }
      });

      router.push('/consumer/dashboard');
    } catch (error) {
      console.error('Failed to complete setup:', error);
      setLoading({ isLoading: false });
      // Handle error - show error message
    }
  };

  const nextStep = () => {
    if (currentStep < currentSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      trackEvent({
        eventType: 'conversion',
        page: 'onboarding',
        action: 'step_completed',
        data: {
          stepId: currentSteps[currentStep].id,
          stepNumber: currentStep + 1,
          variant: variant?.id || 'original'
        }
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      trackEvent({
        eventType: 'conversion',
        page: 'onboarding',
        action: 'step_back',
        data: {
          fromStep: currentSteps[currentStep].id,
          toStep: currentSteps[currentStep - 1].id,
          variant: variant?.id || 'original'
        }
      });
    }
  };

  const renderStepContent = () => {
    const step = currentSteps[currentStep];

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
                  <Users className="w-6 h-6 text-purple-600 mb-2" />
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
                    Only share what&apos;s absolutely necessary
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
                  Full Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DID (Optional - will be auto-generated)
                </label>
                <input
                  type="text"
                  value={userDID}
                  onChange={(e) => setUserDID(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="did:key:..."
                />
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
                            ⚠️ Store this phrase securely. It&apos;s the only way to recover your wallet if you lose access.
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
                You&apos;re All Set!
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
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-gray-700">
            Step {currentStep + 1} of {currentSteps.length}
          </div>
          <div className="text-sm text-gray-500">
            {Math.round(((currentStep + 1) / currentSteps.length) * 100)}% complete
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / currentSteps.length) * 100}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center">
          {currentSteps[currentStep].subtitle}
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
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            {currentStep < currentSteps.length - 2 && (
              <button
                onClick={() => {
                  trackEvent({
                    eventType: 'conversion',
                    page: 'onboarding',
                    action: 'onboarding_skipped',
                    data: { variant: variant?.id || 'original' }
                  });
                  router.push('/consumer/dashboard');
                }}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Skip onboarding
              </button>
            )}
          </div>

          <div className="flex space-x-2">
            {currentSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={currentStep === currentSteps.length - 1 ? handleCompleteSetup : nextStep}
            disabled={
              // Dynamic validation based on variant
              variant?.id === 'simplified' ?
                false : // Skip validation for simplified flow
                (currentStep === 2 && !userName.trim()) ||
                (currentStep === 3 && recoveryPhrase.length === 0)
            }
            className="flex items-center"
          >
            {currentStep === currentSteps.length - 1 ? (
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
