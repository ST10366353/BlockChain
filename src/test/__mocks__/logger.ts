// Mock logger for Jest tests
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  error?: unknown;
}

class MockLogger {
  debug(message: string, context?: Record<string, any>): void {
    console.debug(`[DEBUG] ${message}`, context);
  }

  info(message: string, context?: Record<string, any>): void {
    console.info(`[INFO] ${message}`, context);
  }

  warn(message: string, context?: Record<string, any>, error?: unknown): void {
    console.warn(`[WARN] ${message}`, context, error);
  }

  error(message: string, error?: unknown, context?: Record<string, any>): void {
    console.error(`[ERROR] ${message}`, error, context);
  }

  setLevel(_level: LogLevel): void {
    // Mock implementation - do nothing
  }

  getRecentLogs(_count?: number): LogEntry[] {
    return [];
  }
}

// Export singleton instance
export const logger = new MockLogger();
export default logger;
