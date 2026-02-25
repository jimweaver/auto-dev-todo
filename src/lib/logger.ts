/**
 * Structured logger interface used across the app.
 */
export interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

/**
 * Serialize unknown errors into a safe payload for logging.
 */
export const serializeError = (error: unknown): Record<string, unknown> => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  return {
    message: String(error)
  };
};

/**
 * Safely stringify a payload for logging without throwing.
 */
const safeStringify = (
  payload: Record<string, unknown>,
  fallback: Record<string, unknown>
): string => {
  try {
    return JSON.stringify(payload);
  } catch (error) {
    return JSON.stringify({
      ...fallback,
      context: {
        error: serializeError(error)
      }
    });
  }
};

/**
 * Create a browser-friendly logger that emits JSON payloads.
 */
export const createBrowserLogger = (scope: string): Logger => {
  /**
   * Emit a structured log payload using console methods (no console.log).
   */
  const emit = (
    level: 'info' | 'warn' | 'error',
    message: string,
    context?: Record<string, unknown>
  ): void => {
    const timestamp = new Date().toISOString();
    const payload = {
      level,
      scope,
      message,
      context,
      timestamp
    };
    const serialized = safeStringify(payload, {
      level: 'error',
      scope,
      message: 'Failed to serialize log payload',
      timestamp
    });

    if (level === 'error') {
      console.error(serialized);
      return;
    }

    if (level === 'warn') {
      console.warn(serialized);
      return;
    }

    console.info(serialized);
  };

  return {
    info: (message, context) => emit('info', message, context),
    warn: (message, context) => emit('warn', message, context),
    error: (message, context) => emit('error', message, context)
  };
};

/**
 * Create a logger that performs no I/O (useful for tests).
 */
export const createNoopLogger = (): Logger => {
  /**
   * Ignore logs during tests.
   */
  const noop = (): void => undefined;

  return {
    info: noop,
    warn: noop,
    error: noop
  };
};
