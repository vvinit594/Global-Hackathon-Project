import { sanitizeData } from '../utils/sanitize';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  module?: string;
  requestId?: string;
  userId?: string;
  [key: string]: unknown;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getActiveLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel | undefined;
  if (envLevel && envLevel in LOG_LEVEL_PRIORITY) {
    return envLevel;
  }
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

export class Logger {
  private readonly defaultContext: LogContext;

  constructor(defaultContext: LogContext = {}) {
    this.defaultContext = defaultContext;
  }

  public withContext(context: LogContext): Logger {
    return new Logger({ ...this.defaultContext, ...context });
  }

  private shouldLog(level: LogLevel): boolean {
    const activeLevel = getActiveLogLevel();
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[activeLevel];
  }

  private output(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;

    const mergedContext = { ...this.defaultContext, ...(metadata ? sanitizeData(metadata) : {}) };
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]${
      mergedContext.module ? ` [${mergedContext.module}]` : ''
    }`;

    const hasMeta = Object.keys(mergedContext).filter((k) => k !== 'module').length > 0;

    switch (level) {
      case 'debug':
        if (hasMeta) console.debug(`${prefix} ${message}`, mergedContext);
        else console.debug(`${prefix} ${message}`);
        break;
      case 'info':
        if (hasMeta) console.info(`${prefix} ${message}`, mergedContext);
        else console.info(`${prefix} ${message}`);
        break;
      case 'warn':
        if (hasMeta) console.warn(`${prefix} ${message}`, mergedContext);
        else console.warn(`${prefix} ${message}`);
        break;
      case 'error':
        if (hasMeta) console.error(`${prefix} ${message}`, mergedContext);
        else console.error(`${prefix} ${message}`);
        break;
    }
  }

  public debug(message: string, metadata?: Record<string, unknown>): void {
    this.output('debug', message, metadata);
  }

  public info(message: string, metadata?: Record<string, unknown>): void {
    this.output('info', message, metadata);
  }

  public warn(message: string, metadata?: Record<string, unknown>): void {
    this.output('warn', message, metadata);
  }

  public error(message: string, metadata?: Record<string, unknown>): void {
    this.output('error', message, metadata);
  }
}

export const logger = new Logger();

