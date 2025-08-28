"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [passphrase, setPassphrase] = useState("")
  const [biometricEnabled, setBiometricEnabled] = useState(false)

  const generatePassphrase = () => {
    const words = [
      "secure",
      "mountain",
      "forest",
      "ocean",
      "bridge",
      "garden",
      "sunset",
      "river",
      "castle",
      "phoenix",
      "diamond",
      "thunder",
    ]
    const generated = Array.from({ length: 12 }, () => words[Math.floor(Math.random() * words.length)]).join(" ")
    setPassphrase(generated)
  }

  const handleCompleteSetup = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Wallet Setup</h2>

        {step === 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Generate Recovery Passphrase</h3>
            <div className="bg-gray-100 p-4 rounded-lg mb-4 min-h-[80px] flex items-center">
              {passphrase || "Click generate to create your secure passphrase"}
            </div>
            <button
              onClick={generatePassphrase}
              className="w-full bg-blue-600 text-white py-2 rounded-lg mb-4 hover:bg-blue-700 transition-colors"
            >
              Generate Passphrase
            </button>
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-600 inline mr-2" />
              <span className="text-sm text-yellow-800">
                Write this down and store it safely. You'll need it to recover your wallet.
              </span>
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!passphrase}
              className="w-full bg-gray-800 text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-900 transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Biometric Security</h3>
            <p className="text-gray-600 mb-4">Enable biometric authentication for quick and secure access.</p>
            <div className="flex items-center justify-between mb-6">
              <span>Enable Biometric Unlock</span>
              <button
                onClick={() => setBiometricEnabled(!biometricEnabled)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  biometricEnabled ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    biometricEnabled ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            <button
              onClick={handleCompleteSetup}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Complete Setup
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
