// Logging service for IdentityVault
// In production, this would integrate with services like Sentry, LogRocket, etc.

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  error?: unknown;
}

class Logger {
  private level: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${levelName}: ${message}${contextStr}`;
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }
  }

  private output(level: LogLevel, message: string, context?: Record<string, any>, error?: unknown): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, context);

    // Add to internal log storage
    this.addLog({
      level,
      message,
      timestamp: new Date(),
      context,
      error,
    });

    // Output to console in development - handle both Vite and test environments
    const isDev = (import.meta as any)?.env?.DEV ||
                  (typeof process !== 'undefined' && process?.env?.NODE_ENV === 'development') ||
                  typeof import.meta === 'undefined'; // Fallback for test environments

    if (isDev) {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage, error);
          break;
      }
    }

    // In production, send to error reporting service
    const isProd = (import.meta as any)?.env?.PROD ||
                   (typeof process !== 'undefined' && process?.env?.NODE_ENV === 'production');

    if (isProd && level >= LogLevel.ERROR) {
      this.sendToErrorReportingService(level, message, context, error);
    }
  }

  private sendToErrorReportingService(_level: LogLevel, _message: string, _context?: Record<string, any>, _error?: unknown): void {
    // TODO: Integrate with actual error reporting service
    // Example implementations:
    // - Sentry: Sentry.captureException(error)
    // - LogRocket: LogRocket.captureException(error)
    // - Custom API endpoint for logging

    // Prepare payload for potential future logging endpoint
    // const payload = {
    //   level: LogLevel[level],
    //   message,
    //   context,
    //   error: error ? {
    //     name: error.name,
    //     message: error.message,
    //     stack: error.stack,
    //   } : undefined,
    //   timestamp: new Date().toISOString(),
    //   userAgent: navigator.userAgent,
    //   url: window.location.href,
    // };

    // Send to your logging endpoint
    // fetch('/api/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload),
    // }).catch(() => {
    //   // Silently fail if logging fails
    // });
  }

  debug(message: string, context?: Record<string, any>): void {
    this.output(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.output(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>, error?: unknown): void {
    this.output(LogLevel.WARN, message, context, error);
  }

  error(message: string, error?: unknown, context?: Record<string, any>): void {
    this.output(LogLevel.ERROR, message, context, error);
  }

  // Get recent logs (useful for debugging)
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
  }

  // Set log level
  setLevel(level: LogLevel): void {
    this.level = level;
  }
}

// Create singleton logger instance with environment detection
const isDev = (import.meta as any)?.env?.DEV ||
              (typeof process !== 'undefined' && process?.env?.NODE_ENV === 'development') ||
              typeof import.meta === 'undefined';

export const logger = new Logger(
  isDev ? LogLevel.DEBUG : LogLevel.INFO
);

// Export for convenience
export default logger;
