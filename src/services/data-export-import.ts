import React from 'react';
import { auditAPI } from './audit-api'

// Data export/import types
export interface WalletExportData {
  version: string
  exportDate: string
  identities: WalletIdentity[]
  credentials: WalletCredential[]
  connections: WalletConnection[]
  auditLogs: AuditLogSummary[]
  preferences: UserPreferences
  metadata: ExportMetadata
}

export interface WalletIdentity {
  did: string
  method: string
  status: string
  domain?: string
  createdAt: string
  lastUsed: string
  usageCount: number
}

export interface WalletCredential {
  id: string
  type: string[]
  issuerDid: string
  subjectDid: string
  status: string
  issuedAt: string
  expiresAt?: string
  revocationStatus?: string
}

export interface WalletConnection {
  did: string
  status: string
  tags: string[]
  metadata: {
    name?: string
    description?: string
    website?: string
    contact?: string
    jurisdiction?: string
  }
  createdAt: string
  verifiedAt?: string
}

export interface AuditLogSummary {
  actor: string
  action: string
  target: string
  timestamp: string
  success: boolean
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: {
    email: boolean
    push: boolean
    credentialUpdates: boolean
    connectionRequests: boolean
  }
  privacy: {
    selectiveDisclosure: boolean
    anonymousIdentity: boolean
    dataRetention: number
  }
}

export interface ExportMetadata {
  appVersion: string
  exportFormat: 'json' | 'csv'
  includesPrivateData: boolean
  totalIdentities: number
  totalCredentials: number
  totalConnections: number
}

export interface ImportResult {
  success: boolean
  imported: ImportCounts
  failed: ImportCounts
  errors: string[]
  warnings: string[]
}

export interface ImportCounts {
  identities: number
  credentials: number
  connections: number
  preferences: number
}

// Data Export/Import API Client
export class DataExportImportAPI {
  // Export complete wallet data
  async exportWalletData(
    options: {
      includePrivateData?: boolean
      format?: 'json' | 'csv'
      dateRange?: { start: string; end: string }
      compress?: boolean
    } = {}
  ): Promise<WalletExportData | string> {
    const {
      includePrivateData = false,
      format = 'json',
      dateRange,
      compress = false
    } = options

    try {
      // Gather data from all services
      const [
        identities,
        credentials,
        connections,
        auditLogs,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _systemMetrics
      ] = await Promise.allSettled([
        this.getIdentitiesForExport(),
        this.getCredentialsForExport(includePrivateData),
        this.getConnectionsForExport(),
        this.getAuditLogsForExport(dateRange),
        auditAPI.getSystemMetrics()
      ])

      // Build export data
      const exportData: WalletExportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        identities: identities.status === 'fulfilled' ? identities.value : [],
        credentials: credentials.status === 'fulfilled' ? credentials.value : [],
        connections: connections.status === 'fulfilled' ? connections.value : [],
        auditLogs: auditLogs.status === 'fulfilled' ? auditLogs.value : [],
        preferences: this.getDefaultPreferences(),
        metadata: {
          appVersion: '1.0.0',
          exportFormat: format,
          includesPrivateData: includePrivateData,
          totalIdentities: identities.status === 'fulfilled' ? identities.value.length : 0,
          totalCredentials: credentials.status === 'fulfilled' ? credentials.value.length : 0,
          totalConnections: connections.status === 'fulfilled' ? connections.value.length : 0
        }
      }

      if (format === 'csv') {
        return this.convertToCSV(exportData)
      }

      if (compress) {
        return this.compressData(exportData)
      }

      return exportData
    } catch (error) {
      console.error('Failed to export wallet data:', error)
      throw new Error('Failed to export wallet data')
    }
  }

  // Import wallet data
  async importWalletData(
    data: WalletExportData | string,
    options: {
      overwrite?: boolean
      validateData?: boolean
      skipErrors?: boolean
    } = {}
  ): Promise<ImportResult> {
    const { overwrite = false, validateData = true, skipErrors = false } = options

    const result: ImportResult = {
      success: false,
      imported: { identities: 0, credentials: 0, connections: 0, preferences: 0 },
      failed: { identities: 0, credentials: 0, connections: 0, preferences: 0 },
      errors: [],
      warnings: []
    }

    try {
      let parsedData: WalletExportData

      if (typeof data === 'string') {
        // Try to parse JSON or detect CSV
        if (data.startsWith('{')) {
          parsedData = JSON.parse(data)
        } else if (data.includes(',')) {
          // CSV format - convert to JSON structure
          parsedData = this.parseCSV(data)
        } else {
          // Try compressed data
          parsedData = await this.decompressData(data)
        }
      } else {
        parsedData = data
      }

      // Validate data structure if requested
      if (validateData) {
        const validation = this.validateImportData(parsedData)
        if (!validation.valid) {
          result.errors.push(...validation.errors)
          if (!skipErrors) {
            return result
          }
        }
        result.warnings.push(...validation.warnings)
      }

      // Import data section by section
      await Promise.allSettled([
        this.importIdentities(parsedData.identities, result, overwrite),
        this.importCredentials(parsedData.credentials, result, overwrite),
        this.importConnections(parsedData.connections, result, overwrite),
        this.importPreferences(parsedData.preferences, result, overwrite)
      ])

      result.success = result.failed.identities === 0 &&
                      result.failed.credentials === 0 &&
                      result.failed.connections === 0

      return result
    } catch (error) {
      result.errors.push(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return result
    }
  }

  // Get identities for export
  private async getIdentitiesForExport(): Promise<WalletIdentity[]> {
    // In a real implementation, this would fetch from DID API
    // For now, return mock data structure
    return [
      {
        did: 'did:web:alice.com',
        method: 'web',
        status: 'verified',
        domain: 'alice.com',
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        usageCount: 47
      }
    ]
  }

  // Get credentials for export
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async getCredentialsForExport(_includePrivateData: boolean): Promise<WalletCredential[]> {
    // In a real implementation, this would fetch from credentials API
    return [
      {
        id: 'cred-123',
        type: ['VerifiableCredential', 'UniversityDegree'],
        issuerDid: 'did:web:university.com',
        subjectDid: 'did:web:alice.com',
        status: 'valid',
        issuedAt: new Date().toISOString()
      }
    ]
  }

  // Get connections for export
  private async getConnectionsForExport(): Promise<WalletConnection[]> {
    // In a real implementation, this would fetch from trust API
    return [
      {
        did: 'did:web:trusted-issuer.com',
        status: 'trusted',
        tags: ['education', 'government'],
        metadata: {
          name: 'Trusted University',
          description: 'Official university credential issuer'
        },
        createdAt: new Date().toISOString(),
        verifiedAt: new Date().toISOString()
      }
    ]
  }

  // Get audit logs for export
  private async getAuditLogsForExport(dateRange?: { start: string; end: string }): Promise<AuditLogSummary[]> {
    try {
      const params: any = {
        limit: 1000,
        format: 'summary'
      }

      if (dateRange) {
        params.startDate = dateRange.start
        params.endDate = dateRange.end
      }

      const logs = await auditAPI.getAuditLogs(params)
      return logs.map(log => ({
        actor: log.actor,
        action: log.action,
        target: log.target,
        timestamp: log.timestamp,
        success: log.success
      }))
    } catch (error) {
      console.warn('Failed to fetch audit logs for export:', error)
      return []
    }
  }

  // Get default user preferences
  private getDefaultPreferences(): UserPreferences {
    return {
      theme: 'system',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        credentialUpdates: true,
        connectionRequests: true
      },
      privacy: {
        selectiveDisclosure: true,
        anonymousIdentity: false,
        dataRetention: 365
      }
    }
  }

  // Convert data to CSV format
  private convertToCSV(data: WalletExportData): string {
    // Convert each section to CSV and combine
    const sections = [
      this.identitiesToCSV(data.identities),
      this.credentialsToCSV(data.credentials),
      this.connectionsToCSV(data.connections),
      this.auditLogsToCSV(data.auditLogs)
    ]

    return sections.join('\n\n')
  }

  private identitiesToCSV(identities: WalletIdentity[]): string {
    const headers = ['DID', 'Method', 'Status', 'Domain', 'Created At', 'Last Used', 'Usage Count']
    const rows = identities.map(identity => [
      identity.did,
      identity.method,
      identity.status,
      identity.domain || '',
      identity.createdAt,
      identity.lastUsed,
      identity.usageCount.toString()
    ])

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  private credentialsToCSV(credentials: WalletCredential[]): string {
    const headers = ['ID', 'Type', 'Issuer DID', 'Subject DID', 'Status', 'Issued At', 'Expires At']
    const rows = credentials.map(cred => [
      cred.id,
      cred.type.join(';'),
      cred.issuerDid,
      cred.subjectDid,
      cred.status,
      cred.issuedAt,
      cred.expiresAt || ''
    ])

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  private connectionsToCSV(connections: WalletConnection[]): string {
    const headers = ['DID', 'Status', 'Tags', 'Name', 'Description', 'Website', 'Created At']
    const rows = connections.map(conn => [
      conn.did,
      conn.status,
      conn.tags.join(';'),
      conn.metadata.name || '',
      conn.metadata.description || '',
      conn.metadata.website || '',
      conn.createdAt
    ])

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  private auditLogsToCSV(logs: AuditLogSummary[]): string {
    const headers = ['Actor', 'Action', 'Target', 'Timestamp', 'Success']
    const rows = logs.map(log => [
      log.actor,
      log.action,
      log.target,
      log.timestamp,
      log.success.toString()
    ])

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  // Parse CSV data
  private parseCSV(csvData: string): WalletExportData {
    // Simple CSV parsing - in production, use a proper CSV library
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _lines = csvData.split('\n').filter(line => line.trim())

    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      identities: [],
      credentials: [],
      connections: [],
      auditLogs: [],
      preferences: this.getDefaultPreferences(),
      metadata: {
        appVersion: '1.0.0',
        exportFormat: 'csv',
        includesPrivateData: false,
        totalIdentities: 0,
        totalCredentials: 0,
        totalConnections: 0
      }
    }
  }

  // Compress data (placeholder implementation)
  private async compressData(data: WalletExportData): Promise<string> {
    // In production, use a proper compression library
    return btoa(JSON.stringify(data))
  }

  // Decompress data (placeholder implementation)
  private async decompressData(compressedData: string): Promise<WalletExportData> {
    // In production, use a proper decompression library
    return JSON.parse(atob(compressedData))
  }

  // Validate import data
  private validateImportData(data: WalletExportData): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    if (!data.version) {
      errors.push('Missing version information')
    }

    if (!data.identities || !Array.isArray(data.identities)) {
      errors.push('Invalid identities data')
    }

    if (!data.credentials || !Array.isArray(data.credentials)) {
      errors.push('Invalid credentials data')
    }

    if (!data.connections || !Array.isArray(data.connections)) {
      errors.push('Invalid connections data')
    }

    // Check for data consistency
    if (data.identities?.length === 0) {
      warnings.push('No identities found in import data')
    }

    if (data.credentials?.length === 0) {
      warnings.push('No credentials found in import data')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  // Import methods (placeholders)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async importIdentities(identities: WalletIdentity[], result: ImportResult, _overwrite: boolean) {
    // Implementation would import identities
    result.imported.identities = identities.length
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async importCredentials(credentials: WalletCredential[], result: ImportResult, _overwrite: boolean) {
    // Implementation would import credentials
    result.imported.credentials = credentials.length
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async importConnections(connections: WalletConnection[], result: ImportResult, _overwrite: boolean) {
    // Implementation would import connections
    result.imported.connections = connections.length
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async importPreferences(preferences: UserPreferences, result: ImportResult, _overwrite: boolean) {
    // Implementation would import preferences
    result.imported.preferences = 1
  }
}

// Export singleton instance
export const dataExportImportAPI = new DataExportImportAPI()
