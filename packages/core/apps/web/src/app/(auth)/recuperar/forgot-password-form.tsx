'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { ApiRequestError, apiRequest } from '@/lib/api-client';
import { textField } from '@/lib/form';

export const ForgotPasswordForm = () => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<ApiRequestError | null>(null);

  const submit = async (form: FormData) => {
    setStatus('sending');
    setError(null);
    try {
      await apiRequest('/api/auth/password-reset', {
        method: 'POST',
        json: { email: textField(form, 'email') },
      });
      setStatus('sent');
    } catch (caught) {
      setError(
        caught instanceof ApiRequestError
          ? caught
          : new ApiRequestError({
              code: 'internal_error',
              message: 'No pudimos enviar el correo.',
            }),
      );
      setStatus('idle');
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;
    void submit(new FormData(event.currentTarget));
  };

  if (status === 'sent') {
    return (
      <p
        role="status"
        className="border-celeste-400/40 bg-celeste-400/10 rounded-[6px] border px-3.5 py-3 text-sm"
      >
        Si ese correo tiene una cuenta, ya le mandamos un enlace. Revisá tu bandeja y el correo no
        deseado. El enlace vence en una hora.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {error !== null && error.error.fieldErrors === undefined ? (
        <p
          role="alert"
          className="border-danger-400/40 bg-danger-600/20 text-danger-400 rounded-[6px] border px-3.5 py-2.5 text-sm"
        >
          {error.message}
        </p>
      ) : null}

      <Field
        label="Correo electrónico"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        errors={error?.fieldErrors('email')}
      />

      <Button type="submit" isLoading={status === 'sending'} className="w-full">
        Enviarme el enlace
      </Button>
    </form>
  );
};
