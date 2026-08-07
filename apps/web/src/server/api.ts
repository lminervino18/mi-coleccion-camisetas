import { NextResponse } from 'next/server';
import { ZodError, type TypeOf, type ZodTypeAny } from 'zod';
import { API_ERROR_STATUS, type ApiError } from '@camisetas/contracts';
import { DomainError } from '@camisetas/core';
import { logger, requestId } from './logger';

export const errorResponse = (error: ApiError): NextResponse<ApiError> =>
  NextResponse.json(error, { status: API_ERROR_STATUS[error.code] });

const fieldErrorsFrom = (error: ZodError): Record<string, string[]> => {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fieldErrors;
};

/**
 * Maps every thrown value to a stable error shape. Unexpected errors are logged server-side and
 * reported generically so internal details never reach the client.
 */
export const toErrorResponse = async (error: unknown): Promise<NextResponse<ApiError>> => {
  if (error instanceof ZodError) {
    return errorResponse({
      code: 'validation_failed',
      message: 'Revisá los datos ingresados.',
      fieldErrors: fieldErrorsFrom(error),
    });
  }

  if (error instanceof DomainError) {
    return errorResponse({
      code: error.code,
      message: error.message,
      ...(error.fieldErrors !== undefined ? { fieldErrors: error.fieldErrors } : {}),
    });
  }

  logger.error('Unhandled route error', {
    requestId: await requestId(),
    detail: error instanceof Error ? error.message : String(error),
  });
  return errorResponse({ code: 'internal_error', message: 'Algo salió mal de nuestro lado.' });
};

export const parseJson = async <S extends ZodTypeAny>(
  request: Request,
  schema: S,
): Promise<TypeOf<S>> => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new DomainError('validation_failed', 'El cuerpo de la petición no es JSON válido.');
  }
  return schema.parse(body) as TypeOf<S>;
};

export const parseQuery = <S extends ZodTypeAny>(request: Request, schema: S): TypeOf<S> => {
  const params = new URL(request.url).searchParams;
  const raw: Record<string, string | string[]> = {};
  for (const key of new Set(params.keys())) {
    const values = params.getAll(key);
    raw[key] = values.length > 1 ? values : (values[0] ?? '');
  }
  return schema.parse(raw) as TypeOf<S>;
};
