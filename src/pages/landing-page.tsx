"use client"

import Link from "next/link"
import { Shield, Globe, User } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Your Digital Identity, <span className="text-blue-600">Decentralized</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Take control of your digital credentials with our secure, privacy-first DID wallet. Store, manage, and share
            your verifiable credentials with confidence.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/onboard"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Wallet
            </Link>
            <Link
              href="/login"
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Import Wallet
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <Shield className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
            <p className="text-gray-600">
              Your credentials are encrypted and stored securely. Only you control access.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <Globe className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Interoperable</h3>
            <p className="text-gray-600">Works across different platforms and services using open standards.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <User className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">You Own It</h3>
            <p className="text-gray-600">No central authority. Your identity belongs to you completely.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
