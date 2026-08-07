'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { ApiRequestError, apiRequest } from '@/lib/api-client';
import { textField } from '@/lib/form';

export const ResetPasswordForm = ({ token }: { token: string }) => {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'saving' | 'done'>('idle');
  const [error, setError] = useState<ApiRequestError | null>(null);

  const submit = async (form: FormData) => {
    setStatus('saving');
    setError(null);
    try {
      await apiRequest('/api/auth/password-reset', {
        method: 'PUT',
        json: { token, newPassword: textField(form, 'newPassword') },
      });
      setStatus('done');
    } catch (caught) {
      setError(
        caught instanceof ApiRequestError
          ? caught
          : new ApiRequestError({ code: 'internal_error', message: 'No pudimos cambiarla.' }),
      );
      setStatus('idle');
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'saving') return;
    void submit(new FormData(event.currentTarget));
  };

  if (status === 'done') {
    return (
      <div className="flex flex-col gap-4">
        <p
          role="status"
          className="border-celeste-400/40 bg-celeste-400/10 rounded-[6px] border px-3.5 py-3 text-sm"
        >
          Listo. Ya podés entrar con tu contraseña nueva.
        </p>
        <Button onClick={() => router.replace('/')} className="w-full">
          Ir a iniciar sesión
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {error !== null && error.error.fieldErrors === undefined ? (
        <div className="border-danger-400/40 bg-danger-600/20 rounded-[6px] border px-3.5 py-2.5">
          <p role="alert" className="text-danger-400 text-sm">
            {error.message}
          </p>
          <Link href="/recuperar" className="text-celeste-400 mt-1 inline-block text-sm underline">
            Pedir un enlace nuevo
          </Link>
        </div>
      ) : null}

      <Field
        label="Nueva contraseña"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        required
        hint="Al menos 10 caracteres."
        errors={error?.fieldErrors('newPassword')}
      />

      <Button type="submit" isLoading={status === 'saving'} className="w-full">
        Guardar contraseña
      </Button>
    </form>
  );
};
