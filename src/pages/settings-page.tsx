"use client"

import { useState } from "react"
import Header from "@/src/components/layout/header"
import {
  Shield,
  Key,
  Fingerprint,
  Eye,
  EyeOff,
  Download,
  Code,
  Globe,
  AlertTriangle,
  CheckCircle,
  SettingsIcon,
  RefreshCw,
  Database,
  BarChart3,
  Sun,
} from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("security")
  const [autoLockTime, setAutoLockTime] = useState(15)
  const [biometricEnabled, setBiometricEnabled] = useState(true)
  const [keyRotationDays, setKeyRotationDays] = useState(90)
  const [analyticsOptOut, setAnalyticsOptOut] = useState(false)
  const [defaultSharing, setDefaultSharing] = useState("selective")
  const [dataRetention, setDataRetention] = useState(365)
  const [debugMode, setDebugMode] = useState(false)
  const [networkMode, setNetworkMode] = useState("mainnet")
  const [darkMode, setDarkMode] = useState(false)
  const [showBackupModal, setShowBackupModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  const user = {
    name: "Alice Johnson",
    primaryDID: "did:web:alice.com",
    anonymousDID: "did:key:z6Mk...",
  }

  const tabs = [
    { id: "security", label: "Security", icon: Shield },
    { id: "privacy", label: "Privacy", icon: Eye },
    { id: "developer", label: "Developer", icon: Code },
    { id: "general", label: "General", icon: SettingsIcon },
  ]

  const handleBackupWallet = () => {
    const phrase = "secure mountain forest ocean bridge garden sunset river castle phoenix diamond thunder"
    navigator.clipboard.writeText(phrase)
    setShowBackupModal(false)
  }

  const handleExportData = () => {
    const data = {
      identities: [
        { did: user.primaryDID, type: "primary" },
        { did: user.anonymousDID, type: "anonymous" },
      ],
      connectionsCount: 0,
      credentialsCount: 0,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "wallet-export.json"
    a.click()
    URL.revokeObjectURL(url)
    setShowExportModal(false)
  }

  const handleKeyRotation = () => {
    console.log("[v0] Initiating key rotation")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} notifications={3} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 flex items-center">
          <span className="mr-3">⚙️</span>
          Settings
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-100 text-blue-600 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "security" && (
              <div className="space-y-6">
                {/* Backup & Recovery */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Shield className="w-6 h-6 mr-2 text-blue-600" />
                    Backup & Recovery
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <h3 className="font-medium">Recovery Passphrase</h3>
                        <p className="text-sm text-gray-600">Secure backup of your wallet keys</p>
                      </div>
                      <button
                        onClick={() => setShowBackupModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Backup
                      </button>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <h3 className="font-medium">Last Backup</h3>
                        <p className="text-sm text-gray-600">January 15, 2024</p>
                      </div>
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm">Verified</span>
                      </div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-800">Backup Reminder</h4>
                          <p className="text-sm text-yellow-700">
                            Regularly verify your backup passphrase to ensure wallet recovery capability.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Management */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Key className="w-6 h-6 mr-2 text-blue-600" />
                    Key Management
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <h3 className="font-medium">Key Rotation Schedule</h3>
                        <p className="text-sm text-gray-600">Automatically rotate keys for enhanced security</p>
                      </div>
                      <select
                        value={keyRotationDays}
                        onChange={(e) => setKeyRotationDays(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={30}>Every 30 days</option>
                        <option value={90}>Every 90 days</option>
                        <option value={180}>Every 180 days</option>
                        <option value={365}>Every year</option>
                        <option value={0}>Manual only</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <h3 className="font-medium">Next Rotation</h3>
                        <p className="text-sm text-gray-600">March 15, 2024</p>
                      </div>
                      <button
                        onClick={handleKeyRotation}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Rotate Now
                      </button>
                    </div>
                  </div>
                </div>

                {/* Authentication */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Fingerprint className="w-6 h-6 mr-2 text-blue-600" />
                    Authentication
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <h3 className="font-medium">Biometric Unlock</h3>
                        <p className="text-sm text-gray-600">Use fingerprint or face recognition</p>
                      </div>
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
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <h3 className="font-medium">Auto-lock Timer</h3>
                        <p className="text-sm text-gray-600">Lock wallet after inactivity</p>
                      </div>
                      <select
                        value={autoLockTime}
                        onChange={(e) => setAutoLockTime(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={5}>5 minutes</option>
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={0}>Never</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-6">
                {/* Sharing Preferences */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Eye className="w-6 h-6 mr-2 text-blue-600" />
                    Sharing Preferences
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <h3 className="font-medium">Default Sharing Mode</h3>
                        <p className="text-sm text-gray-600">How credentials are shared by default</p>
                      </div>
                      <select
                        value={defaultSharing}
                        onChange={(e) => setDefaultSharing(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="selective">Selective Disclosure</option>
                        <option value="minimal">Minimal Information</option>
                        <option value="full">Full Credential</option>
                        <option value="ask">Always Ask</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <h3 className="font-medium">Anonymous Identity Default</h3>
                        <p className="text-sm text-gray-600">Use anonymous DID for new connections</p>
                      </div>
                      <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                        <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 translate-x-6" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Data & Analytics */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
                    Data & Analytics
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <h3 className="font-medium">Usage Analytics</h3>
                        <p className="text-sm text-gray-600">Help improve the app with anonymous usage data</p>
                      </div>
                      <button
                        onClick={() => setAnalyticsOptOut(!analyticsOptOut)}
                        className={`w-12 h-6 rounded-full relative transition-colors ${
                          !analyticsOptOut ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                            !analyticsOptOut ? "translate-x-6" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <h3 className="font-medium">Data Retention</h3>
                        <p className="text-sm text-gray-600">How long to keep activity logs</p>
                      </div>
                      <select
                        value={dataRetention}
                        onChange={(e) => setDataRetention(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={30}>30 days</option>
                        <option value={90}>90 days</option>
                        <option value={365}>1 year</option>
                        <option value={0}>Keep forever</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Privacy Tools */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <EyeOff className="w-6 h-6 mr-2 text-blue-600" />
                    Privacy Tools
                  </h2>
                  <div className="space-y-4">
                    <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="text-left">
                        <h3 className="font-medium">Clear Activity History</h3>
                        <p className="text-sm text-gray-600">Remove all stored activity logs</p>
                      </div>
                      <Database className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="text-left">
                        <h3 className="font-medium">Generate New Anonymous Identity</h3>
                        <p className="text-sm text-gray-600">Create fresh did:key for privacy</p>
                      </div>
                      <Key className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "developer" && (
              <div className="space-y-6">
                {/* Development Mode */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Code className="w-6 h-6 mr-2 text-blue-600" />
                    Development Mode
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <h3 className="font-medium">Debug Mode</h3>
                        <p className="text-sm text-gray-600">Enable detailed logging and debugging features</p>
                      </div>
                      <button
                        onClick={() => setDebugMode(!debugMode)}
                        className={`w-12 h-6 rounded-full relative transition-colors ${
                          debugMode ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                            debugMode ? "translate-x-6" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <h3 className="font-medium">Network Mode</h3>
                        <p className="text-sm text-gray-600">Choose between mainnet and testnet</p>
                      </div>
                      <select
                        value={networkMode}
                        onChange={(e) => setNetworkMode(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="mainnet">Mainnet</option>
                        <option value="testnet">Testnet</option>
                        <option value="local">Local Development</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* API Configuration */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Globe className="w-6 h-6 mr-2 text-blue-600" />
                    API Configuration
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">DID Resolver Endpoint</label>
                      <input
                        type="url"
                        defaultValue="https://resolver.identity.foundation"
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Credential Registry</label>
                      <input
                        type="url"
                        defaultValue="https://registry.credentials.org"
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Verification Service</label>
                      <input
                        type="url"
                        defaultValue="https://verify.identity.foundation"
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Data Export */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Download className="w-6 h-6 mr-2 text-blue-600" />
                    Data Export
                  </h2>
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowExportModal(true)}
                      className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-left">
                        <h3 className="font-medium">Export Wallet Data</h3>
                        <p className="text-sm text-gray-600">Download all credentials and connections as JSON</p>
                      </div>
                      <Download className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="text-left">
                        <h3 className="font-medium">Export DID Documents</h3>
                        <p className="text-sm text-gray-600">Download DID documents in standard format</p>
                      </div>
                      <Download className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "general" && (
              <div className="space-y-6">
                {/* Appearance */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Sun className="w-6 h-6 mr-2 text-blue-600" />
                    Appearance
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <h3 className="font-medium">Dark Mode</h3>
                        <p className="text-sm text-gray-600">Use dark theme for better visibility</p>
                      </div>
                      <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`w-12 h-6 rounded-full relative transition-colors ${
                          darkMode ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                            darkMode ? "translate-x-6" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* About */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">About</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Version</span>
                      <span className="font-medium">1.0.0</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Build</span>
                      <span className="font-medium">2024.01.25</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">DID Methods Supported</span>
                      <span className="font-medium">web, key, ion</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Backup Modal */}
        {showBackupModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">Recovery Passphrase</h3>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
                <AlertTriangle className="w-5 h-5 text-yellow-600 inline mr-2" />
                <span className="text-sm text-yellow-800">Keep this passphrase secure and private</span>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg mb-4 font-mono text-sm">
                secure mountain forest ocean bridge garden sunset river castle phoenix diamond thunder
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowBackupModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleBackupWallet}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Copy to Clipboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold mb-4">Export Wallet Data</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                    <span>Credentials</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                    <span>Connections</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                    <span>Identity Information</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span>Private Keys (Encrypted)</span>
                  </label>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExportData}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
