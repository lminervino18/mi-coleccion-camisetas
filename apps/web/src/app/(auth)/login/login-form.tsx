'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { ApiRequestError, apiRequest } from '@/lib/api-client';

export const LoginForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiRequestError | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const form = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setError(null);

    try {
      await apiRequest('/api/auth/login', {
        method: 'POST',
        json: {
          username: String(form.get('username') ?? ''),
          password: String(form.get('password') ?? ''),
        },
      });
      router.replace('/coleccion');
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiRequestError
          ? caught
          : new ApiRequestError({
              code: 'internal_error',
              message: 'No pudimos conectar con el servidor.',
            }),
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {error !== null && error.error.fieldErrors === undefined ? (
        <p
          role="alert"
          className="border-danger-400/40 bg-danger-600/15 text-danger-400 rounded-[--radius-control] border px-3.5 py-2.5 text-sm"
        >
          {error.message}
        </p>
      ) : null}

      <Field
        label="Nombre de usuario"
        name="username"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        required
        errors={error?.fieldErrors('username')}
      />

      <Field
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        errors={error?.fieldErrors('password')}
      />

      <Button type="submit" isLoading={isSubmitting} className="mt-1 w-full">
        {isSubmitting ? 'Entrando…' : 'Iniciar sesión'}
      </Button>
    </form>
  );
};
