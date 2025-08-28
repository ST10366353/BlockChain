"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Unlock, Fingerprint } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [passphrase, setPassphrase] = useState("")
  const [error, setError] = useState("")

  const handleUnlock = () => {
    const words = passphrase.trim().split(/\s+/)
    if (words.length < 6) {
      setError("Enter a valid recovery passphrase")
      return
    }
    router.push("/dashboard")
  }

  const handleBiometric = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Welcome Back</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Recovery Passphrase</label>
            <textarea
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your 12-word recovery passphrase"
            />
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>

          <button
            onClick={handleUnlock}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Unlock className="w-5 h-5 mr-2" />
            Unlock Wallet
          </button>

          <div className="text-center">
            <span className="text-gray-500">or</span>
          </div>

          <button
            onClick={handleBiometric}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <Fingerprint className="w-5 h-5 mr-2" />
            Use Biometric
          </button>
        </div>
      </div>
    </div>
  )
}
