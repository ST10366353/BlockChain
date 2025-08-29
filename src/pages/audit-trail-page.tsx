"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/src/components/layout/page-layout"
import {
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Eye,
  FileText,
  Loader2
} from "lucide-react"
import { auditAPI, dataExportImportAPI } from "@/src/services"
import { useToast } from "@/src/hooks/use-toast"
import type { AuditLogEntry, AuditStats } from "@/src/services"

interface AuditFilters {
  actor?: string
  action?: string
  target?: string
  success?: boolean | null
  startDate?: string
  endDate?: string
  limit?: number
}

export default function AuditTrailPage() {
  const { toastSuccess, toastError } = useToast()
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [filters, setFilters] = useState<AuditFilters>({
    limit: 100
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)

  const user = {
    name: "Alice Johnson",
    primaryDID: "did:web:alice.com",
    anonymousDID: "did:key:z6Mk...",
  }

  // Load audit data on mount and when filters change
  useEffect(() => {
    loadAuditData()
  }, [filters])

  const loadAuditData = async () => {
    setIsLoading(true)
    try {
      const [logsData, statsData] = await Promise.all([
        auditAPI.getAuditLogs({
          actor: filters.actor,
          action: filters.action,
          target: filters.target,
          success: filters.success !== null ? filters.success : undefined,
          startDate: filters.startDate,
          endDate: filters.endDate,
          limit: filters.limit
        }),
        auditAPI.getAuditStats({
          startDate: filters.startDate,
          endDate: filters.endDate
        })
      ])

      setLogs(logsData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load audit data:', error)
      toastError("Loading Failed", "Unable to load audit trail data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const exportData = await auditAPI.exportAuditLogs({
        startDate: filters.startDate,
        endDate: filters.endDate,
        format: 'json'
      })

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      toastSuccess("Export Complete", "Audit trail has been exported successfully")
    } catch (error) {
      console.error('Failed to export audit data:', error)
      toastError("Export Failed", "Unable to export audit trail")
    } finally {
      setIsExporting(false)
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes('create') || action.includes('issue')) return <CheckCircle className="w-4 h-4 text-green-600" />
    if (action.includes('delete') || action.includes('revoke')) return <XCircle className="w-4 h-4 text-red-600" />
    if (action.includes('update') || action.includes('verify')) return <RefreshCw className="w-4 h-4 text-blue-600" />
    return <Activity className="w-4 h-4 text-gray-600" />
  }

  const getActionColor = (action: string) => {
    if (action.includes('create') || action.includes('issue')) return 'bg-green-100 text-green-800'
    if (action.includes('delete') || action.includes('revoke')) return 'bg-red-100 text-red-800'
    if (action.includes('update') || action.includes('verify')) return 'bg-blue-100 text-blue-800'
    return 'bg-gray-100 text-gray-800'
  }

  const formatAction = (action: string) => {
    return action.split('.').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const getUniqueValues = (key: keyof AuditLogEntry) => {
    return [...new Set(logs.map(log => log[key]).filter(Boolean))].map(String)
  }

  return (
    <DashboardLayout
      user={user}
      notifications={3}
      title="Audit Trail"
    >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <span className="mr-3">📊</span>
              Audit Trail
            </h1>
            <p className="text-gray-600 mt-1">Track all wallet activities and system events</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
              title="Toggle filters"
            >
              <Filter className="w-5 h-5" />
            </button>
            <button
              onClick={loadAuditData}
              disabled={isLoading}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Export
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{stats.total.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Actions</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">
                    {stats.total > 0 ? Math.round((stats.stats.filter(s => s.key.includes('success')).reduce((sum, s) => sum + s.count, 0) / stats.total) * 100) : 0}%
                  </p>
                  <p className="text-sm text-gray-600">Success Rate</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <Activity className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{stats.logsByAction ? Object.keys(stats.logsByAction).length : 0}</p>
                  <p className="text-sm text-gray-600">Action Types</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{stats.logsByTimeframe?.length || 0}</p>
                  <p className="text-sm text-gray-600">Time Periods</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Actor</label>
                <select
                  value={filters.actor || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, actor: e.target.value || undefined }))}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Actors</option>
                  {getUniqueValues('actor').map(actor => (
                    <option key={actor} value={actor}>{actor}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Action</label>
                <select
                  value={filters.action || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value || undefined }))}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Actions</option>
                  {getUniqueValues('action').map(action => (
                    <option key={action} value={action}>{formatAction(action)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Success</label>
                <select
                  value={filters.success === null || filters.success === undefined ? '' : filters.success.toString()}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    success: e.target.value === '' ? null : e.target.value === 'true'
                  }))}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Results</option>
                  <option value="true">Success Only</option>
                  <option value="false">Failed Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value || undefined }))}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value || undefined }))}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Limit</label>
                <select
                  value={filters.limit || 100}
                  onChange={(e) => setFilters(prev => ({ ...prev, limit: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={50}>50 entries</option>
                  <option value={100}>100 entries</option>
                  <option value={250}>250 entries</option>
                  <option value={500}>500 entries</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Audit Log Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
              <span>Loading audit data...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No audit entries found</p>
              <p className="text-gray-400">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={`${log.timestamp}-${log.actor}-${log.action}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getActionIcon(log.action)}
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getActionColor(log.action)}`}>
                            {formatAction(log.action)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          {log.actor}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.target || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.success ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          {formatTimestamp(log.timestamp)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Log Details Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Audit Log Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Action</label>
                    <p className="text-sm text-gray-900">{formatAction(selectedLog.action)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="flex items-center mt-1">
                      {selectedLog.success ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          <span className="text-sm text-green-800">Success</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-600 mr-2" />
                          <span className="text-sm text-red-800">Failed</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Actor</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedLog.actor}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                    <p className="text-sm text-gray-900">{formatTimestamp(selectedLog.timestamp)}</p>
                  </div>
                </div>

                {selectedLog.target && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Target</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedLog.target}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Metadata</label>
                  <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </DashboardLayout>
  )
}
