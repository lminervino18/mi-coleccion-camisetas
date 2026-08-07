import { headers } from 'next/headers';

type Level = 'info' | 'warn' | 'error';

type LogFields = Record<string, string | number | boolean | null>;

const REDACTED = new Set(['password', 'token', 'cookie', 'authorization', 'secret']);

/**
 * Drops anything whose name suggests a credential. Values are never logged verbatim from
 * request bodies; this is the last line of defence against a careless call site.
 */
const sanitise = (fields: LogFields): LogFields => {
  const safe: LogFields = {};
  for (const [key, value] of Object.entries(fields)) {
    safe[key] = REDACTED.has(key.toLowerCase()) ? '[redacted]' : value;
  }
  return safe;
};

const emit = (level: Level, message: string, fields: LogFields) => {
  const line = JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    ...sanitise(fields),
  });

  if (level === 'error') console.error(line);
  else console.warn(line);
};

/**
 * Vercel sets x-vercel-id per request; falling back to the platform-agnostic header keeps the
 * correlation id useful anywhere else.
 */
export const requestId = async (): Promise<string> => {
  const store = await headers();
  return store.get('x-vercel-id') ?? store.get('x-request-id') ?? 'local';
};

export const logger = {
  info: (message: string, fields: LogFields = {}) => emit('info', message, fields),
  warn: (message: string, fields: LogFields = {}) => emit('warn', message, fields),
  error: (message: string, fields: LogFields = {}) => emit('error', message, fields),
};
