"use client"

import Header from "@/src/components/layout/header"
import { useState } from "react"

export default function ProfilePage() {
  const [name, setName] = useState("Alice Johnson")
  const [email, setEmail] = useState("alice@example.com")
  const [bio, setBio] = useState("Decentralized identity enthusiast.")

  const user = {
    name,
    primaryDID: "did:web:alice.com",
    anonymousDID: "did:key:z6Mk...",
  }

  const handleSave = () => {
    // In-memory only for now
    alert("Profile saved")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} notifications={3} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl">
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Primary DID</label>
                <input value={user.primaryDID} disabled className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Anonymous DID</label>
                <input value={user.anonymousDID} disabled className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2" />
              </div>
            </div>
            <div className="pt-2">
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


