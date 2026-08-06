'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { ApiRequestError, apiRequest } from '@/lib/api-client';

export const RegisterForm = () => {
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
      await apiRequest('/api/auth/register', {
        method: 'POST',
        json: {
          username: String(form.get('username') ?? ''),
          email: String(form.get('email') ?? ''),
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
        hint="Entre 3 y 30 caracteres. Letras, números, guiones y guiones bajos."
        errors={error?.fieldErrors('username')}
      />

      <Field
        label="Correo electrónico"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        required
        errors={error?.fieldErrors('email')}
      />

      <Field
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint="Al menos 10 caracteres. Una frase larga es más segura que símbolos sueltos."
        errors={error?.fieldErrors('password')}
      />

      <Button type="submit" isLoading={isSubmitting} className="mt-1 w-full">
        {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
      </Button>
    </form>
  );
};
