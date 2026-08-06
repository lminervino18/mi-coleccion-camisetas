import type { ApiError } from '@camisetas/contracts';

export class ApiRequestError extends Error {
  constructor(readonly error: ApiError) {
    super(error.message);
    this.name = 'ApiRequestError';
  }

  fieldErrors(field: string): string[] | undefined {
    return this.error.fieldErrors?.[field];
  }
}

const isApiError = (value: unknown): value is ApiError =>
  typeof value === 'object' && value !== null && 'code' in value && 'message' in value;

/**
 * Single entry point for browser requests: same-origin, JSON in and out, and every failure
 * surfaced as ApiRequestError so callers never branch on raw status codes.
 */
export const apiRequest = async <T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> => {
  const { json, ...rest } = init;

  const response = await fetch(path, {
    ...rest,
    headers: {
      ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...rest.headers,
    },
    ...(json !== undefined ? { body: JSON.stringify(json) } : {}),
  });

  if (response.status === 204) return undefined as T;

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiRequestError(
      isApiError(payload)
        ? payload
        : { code: 'internal_error', message: 'No pudimos completar la operación.' },
    );
  }

  return payload as T;
};
