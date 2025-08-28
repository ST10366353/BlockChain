"use client"

import Link from "next/link"
import Header from "@/src/components/layout/header"
import { Globe, Key, CheckCircle, Lock, Award, Users, Bell } from "lucide-react"

export default function Dashboard() {
  const user = {
    name: "Alice Johnson",
    primaryDID: "did:web:alice.com",
    anonymousDID: "did:key:z6Mk...",
  }

  const recentActivity = [
    { action: "University issued Degree Certificate", time: "2 hours ago" },
    { action: "Logged into JobPortal.com", time: "1 day ago" },
    { action: "Created new did:key identity", time: "3 days ago" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} notifications={3} />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center">
              <span className="mr-2">👤</span>
              Your Identity
            </h2>
            <Bell className="w-6 h-6 text-gray-600" />
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-2">
                <Globe className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium">did:web:alice.com</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Primary Identity</p>
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                Verified
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-2">
                <Key className="w-5 h-5 text-gray-600 mr-2" />
                <span className="font-medium">did:key:z6Mk...</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Anonymous Identity</p>
              <div className="flex items-center text-sm text-blue-600">
                <Lock className="w-4 h-4 mr-1" />
                Private
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <span className="mr-2">📄</span>
              Recent Activity
            </h3>
            <div className="space-y-2 text-sm">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                >
                  <span>{activity.action}</span>
                  <span className="text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/credentials"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Award className="w-6 h-6 text-blue-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Credentials</p>
                  <p className="text-sm text-gray-600">5 total</p>
                </div>
              </div>
            </Link>

            <Link
              href="/connections"
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Users className="w-6 h-6 text-blue-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Connections</p>
                  <p className="text-sm text-gray-600">12 total</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
