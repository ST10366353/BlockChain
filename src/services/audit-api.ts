import { apiClient, handleAPIResponse, createQueryParams, type APIResponse } from './api-client';
import { API_ENDPOINTS } from './api-config';

// Audit log entry
export interface AuditLogEntry {
  actor: string; // DID of the actor performing the action
  action: string; // Action performed (e.g., 'vc.issue', 'did.resolve')
  target: string; // Target resource (e.g., DID, credential ID)
  success: boolean; // Whether the action was successful
  timestamp: string; // ISO 8601 timestamp
  metadata?: {
    credentialId?: string;
    type?: string;
    issuanceTime?: number;
    verificationTime?: number;
    issuer?: string;
    subject?: string;
    duration?: number;
    userAgent?: string;
    ipAddress?: string;
    errorMessage?: string;
    [key: string]: any;
  };
}

// Audit log query parameters
export interface AuditLogQueryParams {
  actor?: string;
  action?: string;
  target?: string;
  success?: boolean;
  startDate?: string; // ISO 8601 date
  endDate?: string; // ISO 8601 date
  limit?: number;
  offset?: number;
}

// Audit statistics
export interface AuditStats {
  stats: Array<{
    key: string;
    count: number;
  }>;
  total: number;
  totalLogs: number;
  logsByAction: Record<string, number>;
  logsByTimeframe: Array<{
    date: string;
    count: number;
  }>;
}

// System metrics
export interface SystemMetrics {
  uptime: number; // seconds
  memory: {
    used: number; // bytes
    total: number; // bytes
    percentage: number;
  };
  database: {
    connected: boolean;
    collections: number;
  };
  requests: {
    total: number;
    success: number;
    error: number;
    averageResponseTime: number;
  };
  [key: string]: any;
}

// Audit export parameters
export interface AuditExportParams {
  startDate?: string;
  endDate?: string;
  format?: 'json' | 'csv';
}

// Audit API Client
export class AuditAPI {
  // Query audit logs
  async getAuditLogs(params: AuditLogQueryParams = {}): Promise<AuditLogEntry[]> {
    const queryParams = createQueryParams({
      ...params,
      success: params.success?.toString(),
    });

    const response = await apiClient.get<AuditLogEntry[]>(
      API_ENDPOINTS.audit.logs,
      queryParams
    );
    return handleAPIResponse(response);
  }

  // Get audit statistics
  async getAuditStats(params: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'action' | 'actor' | 'success';
  } = {}): Promise<AuditStats> {
    const queryParams = createQueryParams(params as Record<string, string | number | boolean | undefined>);

    const response = await apiClient.get<AuditStats>(
      API_ENDPOINTS.audit.stats,
      queryParams
    );
    return handleAPIResponse(response);
  }

  // Get system metrics
  async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await apiClient.get<SystemMetrics>(
      API_ENDPOINTS.audit.metrics
    );
    return handleAPIResponse(response);
  }

  // Export audit logs
  async exportAuditLogs(params: AuditExportParams = {}): Promise<any> {
    const queryParams = createQueryParams(params as Record<string, string | number | boolean | undefined>);

    const response = await apiClient.get(
      API_ENDPOINTS.audit.export,
      queryParams
    );

    if (params.format === 'json') {
      return handleAPIResponse(response);
    }

    // For CSV format, return raw response
    return response.data;
  }

  // Get logs for specific actor
  async getLogsForActor(actorDID: string, limit: number = 100): Promise<AuditLogEntry[]> {
    return this.getAuditLogs({ actor: actorDID, limit });
  }

  // Get logs for specific action
  async getLogsForAction(action: string, limit: number = 100): Promise<AuditLogEntry[]> {
    return this.getAuditLogs({ action, limit });
  }

  // Get recent failed operations
  async getFailedOperations(limit: number = 50): Promise<AuditLogEntry[]> {
    return this.getAuditLogs({ success: false, limit });
  }

  // Get logs within date range
  async getLogsInDateRange(
    startDate: string,
    endDate: string,
    params: Partial<AuditLogQueryParams> = {}
  ): Promise<AuditLogEntry[]> {
    return this.getAuditLogs({
      ...params,
      startDate,
      endDate,
    });
  }

  // Get activity summary for dashboard
  async getActivitySummary(): Promise<{
    totalActions: number;
    successRate: number;
    topActions: Array<{ action: string; count: number }>;
    recentActivity: AuditLogEntry[];
  }> {
    const [stats, recentLogs] = await Promise.all([
      this.getAuditStats({ groupBy: 'action' }),
      this.getAuditLogs({ limit: 10 }),
    ]);

    const totalActions = stats.total;
    const successfulActions = stats.stats
      .filter(stat => stat.key.includes('success'))
      .reduce((sum, stat) => sum + stat.count, 0);

    const successRate = totalActions > 0 ? (successfulActions / totalActions) * 100 : 0;

    const topActions = stats.stats
      .slice(0, 5)
      .map(stat => ({
        action: stat.key,
        count: stat.count,
      }));

    return {
      totalActions,
      successRate,
      topActions,
      recentActivity: recentLogs,
    };
  }

  // Monitor specific resource
  async monitorResource(target: string, limit: number = 20): Promise<AuditLogEntry[]> {
    return this.getAuditLogs({ target, limit });
  }

  // Get error logs
  async getErrorLogs(limit: number = 50): Promise<AuditLogEntry[]> {
    const allLogs = await this.getAuditLogs({ limit: limit * 2 });
    return allLogs.filter(log =>
      !log.success ||
      log.metadata?.errorMessage ||
      log.action.includes('error')
    ).slice(0, limit);
  }

  // Analyze user behavior patterns
  async analyzeUserBehavior(
    userDID: string,
    startDate: string,
    endDate: string
  ): Promise<{
    totalActions: number;
    actionsByType: Record<string, number>;
    successRate: number;
    averageResponseTime: number;
    mostActivePeriod: string;
  }> {
    const logs = await this.getLogsInDateRange(startDate, endDate, { actor: userDID });

    const totalActions = logs.length;
    const successfulActions = logs.filter(log => log.success).length;
    const successRate = totalActions > 0 ? (successfulActions / totalActions) * 100 : 0;

    const actionsByType: Record<string, number> = {};
    logs.forEach(log => {
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
    });

    const responseTimes = logs
      .map(log => log.metadata?.duration)
      .filter(time => time !== undefined) as number[];

    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    // Simple period analysis (could be enhanced)
    const mostActivePeriod = this.getMostActivePeriod(logs);

    return {
      totalActions,
      actionsByType,
      successRate,
      averageResponseTime,
      mostActivePeriod,
    };
  }

  // Get performance metrics over time
  async getPerformanceMetrics(
    startDate: string,
    endDate: string,
    interval: 'hour' | 'day' | 'week' = 'day'
  ): Promise<Array<{
    period: string;
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
  }>> {
    const logs = await this.getLogsInDateRange(startDate, endDate);

    // Group logs by time interval
    const groupedLogs: Record<string, AuditLogEntry[]> = {};

    logs.forEach(log => {
      const date = new Date(log.timestamp);
      let period: string;

      switch (interval) {
        case 'hour':
          period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:00:00`;
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          period = weekStart.toISOString().split('T')[0];
          break;
        default: // day
          period = date.toISOString().split('T')[0];
      }

      if (!groupedLogs[period]) {
        groupedLogs[period] = [];
      }
      groupedLogs[period].push(log);
    });

    // Calculate metrics for each period
    return Object.entries(groupedLogs).map(([period, periodLogs]) => {
      const totalRequests = periodLogs.length;
      const errors = periodLogs.filter(log => !log.success).length;
      const errorRate = totalRequests > 0 ? (errors / totalRequests) * 100 : 0;

      const responseTimes = periodLogs
        .map(log => log.metadata?.duration)
        .filter(time => time !== undefined) as number[];

      const averageResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 0;

      return {
        period,
        totalRequests,
        averageResponseTime,
        errorRate,
      };
    }).sort((a, b) => a.period.localeCompare(b.period));
  }

  // Helper method to find most active period
  private getMostActivePeriod(logs: AuditLogEntry[]): string {
    const hourCounts: Record<string, number> = {};

    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const mostActiveHour = Object.entries(hourCounts)
      .reduce((max, [hour, count]) =>
        count > (hourCounts[max] || 0) ? hour : max, '0'
      );

    return `${mostActiveHour}:00`;
  }

  // Format audit logs for CSV export
  formatLogsForCSV(logs: AuditLogEntry[]): string {
    const headers = [
      'Timestamp',
      'Actor',
      'Action',
      'Target',
      'Success',
      'Duration',
      'Error Message',
    ];

    const rows = logs.map(log => [
      log.timestamp,
      log.actor,
      log.action,
      log.target,
      log.success.toString(),
      log.metadata?.duration?.toString() || '',
      log.metadata?.errorMessage || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csvContent;
  }
}

// Create singleton instance
export const auditAPI = new AuditAPI();
