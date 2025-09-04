"use client";

import React from 'react';
;;
import {
  Download,
  FileText,
  Code,
  Settings,
  Zap,
  Shield,
  Database,
  Users,
  Key,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/page-layout';

export default function APIDocumentationPage() {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'endpoints' | 'schemas'>('overview');

  const downloadFile = (format: string, filename: string) => {
    const link = document.createElement('a');
    link.href = `/api/docs?format=${format}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const endpoints = [
    {
      category: 'DID Management',
      icon: <Key className="w-5 h-5" />,
      endpoints: [
        { method: 'GET', path: '/did/resolve', description: 'Resolve DID to DID Document' },
        { method: 'POST', path: '/did/register', description: 'Register new DID' },
        { method: 'PUT', path: '/did', description: 'Update DID Document' }
      ]
    },
    {
      category: 'Credentials',
      icon: <CheckCircle className="w-5 h-5" />,
      endpoints: [
        { method: 'GET', path: '/credentials', description: 'Query verifiable credentials' },
        { method: 'POST', path: '/credentials/issue', description: 'Issue new credential' },
        { method: 'POST', path: '/credentials/verify', description: 'Verify credential' }
      ]
    },
    {
      category: 'Trust Registry',
      icon: <Shield className="w-5 h-5" />,
      endpoints: [
        { method: 'GET', path: '/trust/issuers', description: 'Get trusted issuers' },
        { method: 'POST', path: '/trust/issuers', description: 'Register trusted issuer' },
        { method: 'GET', path: '/trust/issuers/{did}/verification', description: 'Get issuer verification status' }
      ]
    },
    {
      category: 'Presentations',
      icon: <FileText className="w-5 h-5" />,
      endpoints: [
        { method: 'POST', path: '/presentations', description: 'Create verifiable presentation' },
        { method: 'GET', path: '/presentations/{id}', description: 'Get presentation by ID' }
      ]
    },
    {
      category: 'Authentication',
      icon: <Users className="w-5 h-5" />,
      endpoints: [
        { method: 'POST', path: '/auth/login', description: 'User login' },
        { method: 'POST', path: '/auth/logout', description: 'User logout' },
        { method: 'GET', path: '/auth/me', description: 'Get current user' }
      ]
    }
  ];

  const schemas = [
    {
      name: 'VerifiableCredential',
      description: 'Standard W3C Verifiable Credential format',
      properties: ['@context', 'type', 'id', 'issuer', 'issuanceDate', 'credentialSubject', 'proof']
    },
    {
      name: 'DIDDocument',
      description: 'Decentralized Identifier Document',
      properties: ['@context', 'id', 'controller', 'verificationMethod', 'authentication', 'service']
    },
    {
      name: 'VerifiablePresentation',
      description: 'Collection of credentials for presentation',
      properties: ['@context', 'type', 'id', 'holder', 'verifiableCredential', 'proof']
    },
    {
      name: 'TrustedIssuer',
      description: 'Registry entry for trusted credential issuers',
      properties: ['id', 'did', 'name', 'status', 'trustLevel', 'compliance']
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">API Documentation</h1>
              <p className="text-gray-600">
                Complete reference for the DID Blockchain Wallet API
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => downloadFile('json', 'did-blockchain-api.json')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Code className="w-4 h-4 mr-2" />
                OpenAPI JSON
              </button>
              <button
                onClick={() => downloadFile('postman', 'did-blockchain-api.postman_collection.json')}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Postman Collection
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: <Info className="w-4 h-4" /> },
              { id: 'endpoints', label: 'Endpoints', icon: <Zap className="w-4 h-4" /> },
              { id: 'schemas', label: 'Schemas', icon: <Database className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {activeTab === 'overview' && (
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      The DID Blockchain Wallet API provides comprehensive endpoints for managing
                      Decentralized Identifiers (DIDs), Verifiable Credentials, and trust relationships.
                    </p>
                    <p>
                      All API endpoints require proper authentication and follow RESTful conventions
                      with JSON request/response formats.
                    </p>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Base URL</h3>
                    <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                      {process.env.NODE_ENV === 'development'
                        ? 'http://localhost:3001'
                        : 'https://did-blockchain-380915310329.europe-west1.run.app'
                      }
                    </code>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Authentication</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Key className="w-4 h-4 mr-2 text-green-600" />
                        <span>Bearer Token (JWT)</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Shield className="w-4 h-4 mr-2 text-blue-600" />
                        <span>DID-based Authentication</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Settings className="w-4 h-4 mr-2 text-purple-600" />
                        <span>WebAuthn Biometric</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-start p-4 bg-blue-50 rounded-lg">
                      <Key className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                      <div>
                        <h3 className="font-semibold text-blue-900">DID Management</h3>
                        <p className="text-blue-700 text-sm">
                          Create, resolve, and manage Decentralized Identifiers across multiple methods
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-1" />
                      <div>
                        <h3 className="font-semibold text-green-900">Credential Lifecycle</h3>
                        <p className="text-green-700 text-sm">
                          Issue, verify, revoke, and manage verifiable credentials with full audit trails
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start p-4 bg-purple-50 rounded-lg">
                      <Shield className="w-6 h-6 text-purple-600 mr-3 mt-1" />
                      <div>
                        <h3 className="font-semibold text-purple-900">Trust Registry</h3>
                        <p className="text-purple-700 text-sm">
                          Maintain registry of trusted issuers with compliance verification
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start p-4 bg-orange-50 rounded-lg">
                      <FileText className="w-6 h-6 text-orange-600 mr-3 mt-1" />
                      <div>
                        <h3 className="font-semibold text-orange-900">Presentations</h3>
                        <p className="text-orange-700 text-sm">
                          Create and verify verifiable presentations with selective disclosure
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'endpoints' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">API Endpoints</h2>
              <div className="space-y-8">
                {endpoints.map((category) => (
                  <div key={category.category}>
                    <div className="flex items-center mb-4">
                      <div className="text-blue-600 mr-3">
                        {category.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {category.category}
                      </h3>
                    </div>
                    <div className="space-y-3 ml-8">
                      {category.endpoints.map((endpoint, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <span className={`px-2 py-1 rounded text-xs font-bold mr-3 ${
                              endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                              endpoint.method === 'POST' ? 'bg-green-100 text-green-800' :
                              endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {endpoint.method}
                            </span>
                            <code className="text-sm font-mono text-gray-800">
                              {endpoint.path}
                            </code>
                          </div>
                          <span className="text-sm text-gray-600">
                            {endpoint.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'schemas' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Schemas</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {schemas.map((schema) => (
                  <div key={schema.name} className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {schema.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {schema.description}
                    </p>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Properties:</h4>
                      <div className="flex flex-wrap gap-2">
                        {schema.properties.map((prop) => (
                          <span key={prop} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {prop}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-yellow-900">Schema Validation</h3>
                    <p className="text-yellow-700 text-sm mt-1">
                      All API requests and responses follow these schemas. The API validates
                      data against these specifications to ensure consistency and security.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
 } from 'react';;;
import {
  Download,
  FileText,
  Code,
  Settings,
  Zap,
  Shield,
  Database,
  Users,
  Key,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/page-layout';

export default function APIDocumentationPage() {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'endpoints' | 'schemas'>('overview');

  const downloadFile = (format: string, filename: string) => {
    const link = document.createElement('a');
    link.href = `/api/docs?format=${format}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const endpoints = [
    {
      category: 'DID Management',
      icon: <Key className="w-5 h-5" />,
      endpoints: [
        { method: 'GET', path: '/did/resolve', description: 'Resolve DID to DID Document' },
        { method: 'POST', path: '/did/register', description: 'Register new DID' },
        { method: 'PUT', path: '/did', description: 'Update DID Document' }
      ]
    },
    {
      category: 'Credentials',
      icon: <CheckCircle className="w-5 h-5" />,
      endpoints: [
        { method: 'GET', path: '/credentials', description: 'Query verifiable credentials' },
        { method: 'POST', path: '/credentials/issue', description: 'Issue new credential' },
        { method: 'POST', path: '/credentials/verify', description: 'Verify credential' }
      ]
    },
    {
      category: 'Trust Registry',
      icon: <Shield className="w-5 h-5" />,
      endpoints: [
        { method: 'GET', path: '/trust/issuers', description: 'Get trusted issuers' },
        { method: 'POST', path: '/trust/issuers', description: 'Register trusted issuer' },
        { method: 'GET', path: '/trust/issuers/{did}/verification', description: 'Get issuer verification status' }
      ]
    },
    {
      category: 'Presentations',
      icon: <FileText className="w-5 h-5" />,
      endpoints: [
        { method: 'POST', path: '/presentations', description: 'Create verifiable presentation' },
        { method: 'GET', path: '/presentations/{id}', description: 'Get presentation by ID' }
      ]
    },
    {
      category: 'Authentication',
      icon: <Users className="w-5 h-5" />,
      endpoints: [
        { method: 'POST', path: '/auth/login', description: 'User login' },
        { method: 'POST', path: '/auth/logout', description: 'User logout' },
        { method: 'GET', path: '/auth/me', description: 'Get current user' }
      ]
    }
  ];

  const schemas = [
    {
      name: 'VerifiableCredential',
      description: 'Standard W3C Verifiable Credential format',
      properties: ['@context', 'type', 'id', 'issuer', 'issuanceDate', 'credentialSubject', 'proof']
    },
    {
      name: 'DIDDocument',
      description: 'Decentralized Identifier Document',
      properties: ['@context', 'id', 'controller', 'verificationMethod', 'authentication', 'service']
    },
    {
      name: 'VerifiablePresentation',
      description: 'Collection of credentials for presentation',
      properties: ['@context', 'type', 'id', 'holder', 'verifiableCredential', 'proof']
    },
    {
      name: 'TrustedIssuer',
      description: 'Registry entry for trusted credential issuers',
      properties: ['id', 'did', 'name', 'status', 'trustLevel', 'compliance']
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">API Documentation</h1>
              <p className="text-gray-600">
                Complete reference for the DID Blockchain Wallet API
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => downloadFile('json', 'did-blockchain-api.json')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Code className="w-4 h-4 mr-2" />
                OpenAPI JSON
              </button>
              <button
                onClick={() => downloadFile('postman', 'did-blockchain-api.postman_collection.json')}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Postman Collection
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: <Info className="w-4 h-4" /> },
              { id: 'endpoints', label: 'Endpoints', icon: <Zap className="w-4 h-4" /> },
              { id: 'schemas', label: 'Schemas', icon: <Database className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {activeTab === 'overview' && (
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      The DID Blockchain Wallet API provides comprehensive endpoints for managing
                      Decentralized Identifiers (DIDs), Verifiable Credentials, and trust relationships.
                    </p>
                    <p>
                      All API endpoints require proper authentication and follow RESTful conventions
                      with JSON request/response formats.
                    </p>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Base URL</h3>
                    <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                      {process.env.NODE_ENV === 'development'
                        ? 'http://localhost:3001'
                        : 'https://did-blockchain-380915310329.europe-west1.run.app'
                      }
                    </code>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Authentication</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Key className="w-4 h-4 mr-2 text-green-600" />
                        <span>Bearer Token (JWT)</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Shield className="w-4 h-4 mr-2 text-blue-600" />
                        <span>DID-based Authentication</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Settings className="w-4 h-4 mr-2 text-purple-600" />
                        <span>WebAuthn Biometric</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-start p-4 bg-blue-50 rounded-lg">
                      <Key className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                      <div>
                        <h3 className="font-semibold text-blue-900">DID Management</h3>
                        <p className="text-blue-700 text-sm">
                          Create, resolve, and manage Decentralized Identifiers across multiple methods
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-1" />
                      <div>
                        <h3 className="font-semibold text-green-900">Credential Lifecycle</h3>
                        <p className="text-green-700 text-sm">
                          Issue, verify, revoke, and manage verifiable credentials with full audit trails
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start p-4 bg-purple-50 rounded-lg">
                      <Shield className="w-6 h-6 text-purple-600 mr-3 mt-1" />
                      <div>
                        <h3 className="font-semibold text-purple-900">Trust Registry</h3>
                        <p className="text-purple-700 text-sm">
                          Maintain registry of trusted issuers with compliance verification
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start p-4 bg-orange-50 rounded-lg">
                      <FileText className="w-6 h-6 text-orange-600 mr-3 mt-1" />
                      <div>
                        <h3 className="font-semibold text-orange-900">Presentations</h3>
                        <p className="text-orange-700 text-sm">
                          Create and verify verifiable presentations with selective disclosure
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'endpoints' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">API Endpoints</h2>
              <div className="space-y-8">
                {endpoints.map((category) => (
                  <div key={category.category}>
                    <div className="flex items-center mb-4">
                      <div className="text-blue-600 mr-3">
                        {category.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {category.category}
                      </h3>
                    </div>
                    <div className="space-y-3 ml-8">
                      {category.endpoints.map((endpoint, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <span className={`px-2 py-1 rounded text-xs font-bold mr-3 ${
                              endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                              endpoint.method === 'POST' ? 'bg-green-100 text-green-800' :
                              endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {endpoint.method}
                            </span>
                            <code className="text-sm font-mono text-gray-800">
                              {endpoint.path}
                            </code>
                          </div>
                          <span className="text-sm text-gray-600">
                            {endpoint.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'schemas' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Schemas</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {schemas.map((schema) => (
                  <div key={schema.name} className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {schema.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {schema.description}
                    </p>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Properties:</h4>
                      <div className="flex flex-wrap gap-2">
                        {schema.properties.map((prop) => (
                          <span key={prop} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {prop}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-yellow-900">Schema Validation</h3>
                    <p className="text-yellow-700 text-sm mt-1">
                      All API requests and responses follow these schemas. The API validates
                      data against these specifications to ensure consistency and security.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
