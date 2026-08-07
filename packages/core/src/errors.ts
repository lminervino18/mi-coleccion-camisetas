import type { ApiErrorCode } from '@camisetas/contracts';

export class DomainError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    message: string,
    readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export const unauthenticated = (message = 'Necesitás iniciar sesión.') =>
  new DomainError('unauthenticated', message);

export const forbidden = (message = 'No tenés permiso para hacer esto.') =>
  new DomainError('forbidden', message);

export const notFound = (message = 'No encontramos lo que buscabas.') =>
  new DomainError('not_found', message);

export const conflict = (message: string, fieldErrors?: Record<string, string[]>) =>
  new DomainError('conflict', message, fieldErrors);

export const rateLimited = (message = 'Demasiados intentos. Probá de nuevo en unos minutos.') =>
  new DomainError('rate_limited', message);

export const validationFailed = (message: string, fieldErrors?: Record<string, string[]>) =>
  new DomainError('validation_failed', message, fieldErrors);
