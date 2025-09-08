import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";

const steps = [
  {
    title: "Welcome to IdentityVault",
    description: "Your decentralized identity wallet",
    icon: Sparkles,
  },
  {
    title: "Privacy Settings",
    description: "Choose your sharing preferences",
    icon: Shield,
  },
  {
    title: "Create Your Identity",
    description: "Set up your digital identity",
    icon: Lock,
  },
  {
    title: "Security Configuration",
    description: "Secure your wallet",
    icon: Shield,
  },
  {
    title: "You're All Set!",
    description: "Ready to explore your wallet",
    icon: Check,
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [privacyLevel, setPrivacyLevel] = useState("selective");
  const [userName, setUserName] = useState("");
  const [showRecoveryPhrase, setShowRecoveryPhrase] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  // Mock recovery phrase - in real app this would be generated securely
  const recoveryPhrase = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding and navigate to dashboard
      navigate("/dashboard");
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Welcome to IdentityVault</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Take control of your digital identity with our secure, decentralized identity wallet.
                Share verified information without compromising your privacy.
              </p>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Choose Your Privacy Level</h3>
              <p className="text-gray-300">Select how you'd like to share your information</p>
            </div>

            <div className="space-y-4">
              <div
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  privacyLevel === "minimal"
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-gray-600 hover:border-gray-500"
                }`}
                onClick={() => setPrivacyLevel("minimal")}
              >
                <div className="flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-indigo-400" />
                  <div>
                    <h4 className="text-white font-semibold">Minimal Sharing</h4>
                    <p className="text-gray-400 text-sm">Only share what you explicitly choose to</p>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  privacyLevel === "selective"
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-gray-600 hover:border-gray-500"
                }`}
                onClick={() => setPrivacyLevel("selective")}
              >
                <div className="flex items-center space-x-3">
                  <Eye className="w-6 h-6 text-indigo-400" />
                  <div>
                    <h4 className="text-white font-semibold">Selective Sharing</h4>
                    <p className="text-gray-400 text-sm">Share with trusted organizations and individuals</p>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  privacyLevel === "full"
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-gray-600 hover:border-gray-500"
                }`}
                onClick={() => setPrivacyLevel("full")}
              >
                <div className="flex items-center space-x-3">
                  <Lock className="w-6 h-6 text-indigo-400" />
                  <div>
                    <h4 className="text-white font-semibold">Full Control</h4>
                    <p className="text-gray-400 text-sm">Maximum privacy with granular permissions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Create Your Digital Identity</h3>
              <p className="text-gray-300">Set up your profile information</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="text-white font-semibold mb-2">Your DID will be generated</h4>
                <p className="text-gray-400 text-sm">
                  A unique decentralized identifier will be created for you automatically.
                  This will serve as your digital identity across different platforms.
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Secure Your Wallet</h3>
              <p className="text-gray-300">Set up additional security measures</p>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-white font-semibold">Biometric Authentication</h4>
                    <p className="text-gray-400 text-sm">Use fingerprint or face recognition</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => setBiometricEnabled(!biometricEnabled)}
                  >
                    {biometricEnabled ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="text-white font-semibold mb-3">Recovery Phrase</h4>
                <p className="text-gray-400 text-sm mb-3">
                  Save these 12 words securely. They can restore your wallet if needed.
                </p>
                <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
                  <div className="grid grid-cols-3 gap-2 text-gray-300">
                    {recoveryPhrase.split(" ").map((word, index) => (
                      <div key={index} className="flex items-center space-x-1">
                        <span className="text-gray-500 w-4">{index + 1}.</span>
                        <span>{word}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-400">Never share this phrase with anyone</p>
                  <button
                    onClick={() => setShowRecoveryPhrase(!showRecoveryPhrase)}
                    className="flex items-center space-x-1 text-sm text-indigo-400 hover:text-indigo-300"
                  >
                    {showRecoveryPhrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{showRecoveryPhrase ? "Hide" : "Show"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">You're All Set!</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Your IdentityVault is ready to use. You can now start adding credentials,
                managing your digital identity, and securely sharing information.
              </p>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-left">
                <h4 className="text-white font-semibold mb-2">Next Steps:</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Add your first digital credential</li>
                  <li>• Explore the dashboard features</li>
                  <li>• Set up additional security preferences</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 2:
        return userName.trim().length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((_, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  index <= currentStep
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-600 text-gray-400"
                }`}
              >
                {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-2 transition-colors ${
                    index < currentStep ? "bg-indigo-500" : "bg-gray-600"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-white flex items-center justify-center space-x-2">
              {(() => {
                const IconComponent = steps[currentStep].icon;
                return <IconComponent className="w-6 h-6" />;
              })()}
              <span>{steps[currentStep].title}</span>
            </CardTitle>
            <CardDescription className="text-gray-300">
              {steps[currentStep].description}
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[400px]">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <Button
            onClick={nextStep}
            disabled={!canProceed()}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {currentStep === steps.length - 1 ? "Get Started" : "Next"}
            {currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
