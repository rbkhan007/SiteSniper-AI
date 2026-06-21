/**
 * Structured Logger
 * JSON-formatted logs for production, pretty-printed for development
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private minLevel: LogLevel;
  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(minLevel: LogLevel = "info") {
    this.minLevel = minLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.minLevel];
  }

  private format(entry: LogEntry): string {
    if (process.env.NODE_ENV === "production") {
      return JSON.stringify(entry);
    }

    const colors: Record<LogLevel, string> = {
      debug: "\x1b[36m",
      info: "\x1b[32m",
      warn: "\x1b[33m",
      error: "\x1b[31m",
    };
    const reset = "\x1b[0m";

    let msg = `${colors[entry.level]}[${entry.level.toUpperCase()}]${reset} ${entry.timestamp} ${entry.message}`;
    if (entry.context) msg += ` ${JSON.stringify(entry.context)}`;
    if (entry.error) msg += `\n  ${entry.error.stack || entry.error.message}`;
    return msg;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error: error
        ? { name: error.name, message: error.message, stack: error.stack }
        : undefined,
    };

    const formatted = this.format(entry);

    switch (level) {
      case "debug":
        console.debug(formatted);
        break;
      case "info":
        console.info(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "error":
        console.error(formatted);
        break;
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log("debug", message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    this.log("error", message, context, error);
  }

  /**
   * Create a child logger with prefix context
   */
  child(prefix: string) {
    return {
      debug: (msg: string, ctx?: Record<string, unknown>) =>
        this.debug(`[${prefix}] ${msg}`, ctx),
      info: (msg: string, ctx?: Record<string, unknown>) =>
        this.info(`[${prefix}] ${msg}`, ctx),
      warn: (msg: string, ctx?: Record<string, unknown>) =>
        this.warn(`[${prefix}] ${msg}`, ctx),
      error: (msg: string, err?: Error, ctx?: Record<string, unknown>) =>
        this.error(`[${prefix}] ${msg}`, err, ctx),
    };
  }
}

export const logger = new Logger(
  (process.env.LOG_LEVEL as LogLevel) || "info"
);

/**
 * Request logger middleware helper
 */
export function logRequest(
  method: string,
  path: string,
  statusCode: number,
  durationMs: number,
  userId?: string
) {
  const context = { method, path, statusCode, durationMs, userId };
  
  if (statusCode >= 500) {
    logger.error(`${method} ${path} ${statusCode}`, undefined, context);
  } else if (statusCode >= 400) {
    logger.warn(`${method} ${path} ${statusCode}`, context);
  } else {
    logger.info(`${method} ${path} ${statusCode}`, context);
  }
}
