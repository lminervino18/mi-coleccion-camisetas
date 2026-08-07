'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Field } from '@/components/ui/field';
import { ApiRequestError, apiRequest } from '@/lib/api-client';
import { textField } from '@/lib/form';

export const SecurityPanel = () => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [changed, setChanged] = useState(false);
  const [error, setError] = useState<ApiRequestError | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const changePassword = async (form: FormData, reset: () => void) => {
    setIsSaving(true);
    setError(null);
    setChanged(false);
    try {
      await apiRequest('/api/account/password', {
        method: 'POST',
        json: {
          currentPassword: textField(form, 'currentPassword'),
          newPassword: textField(form, 'newPassword'),
        },
      });
      setChanged(true);
      reset();
    } catch (caught) {
      setError(
        caught instanceof ApiRequestError
          ? caught
          : new ApiRequestError({ code: 'internal_error', message: 'No pudimos cambiarla.' }),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const removeAccount = async () => {
    setIsSaving(true);
    setDeleteError(null);
    try {
      await apiRequest('/api/account', { method: 'DELETE', json: { password: deletePassword } });
      router.replace('/');
      router.refresh();
    } catch (caught) {
      setDeleteError(
        caught instanceof ApiRequestError ? caught.message : 'No pudimos borrar la cuenta.',
      );
      setIsSaving(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;
    const form = event.currentTarget;
    void changePassword(new FormData(form), () => form.reset());
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="panel px-4 py-4">
        <h2 className="font-display mb-1 text-lg font-bold">Cambiar contraseña</h2>
        <p className="text-ink-300 mb-4 text-sm">
          Al cambiarla se cierran las sesiones abiertas en otros dispositivos.
        </p>

        <form onSubmit={handleSubmit} noValidate className="flex max-w-md flex-col gap-4">
          {error !== null && error.error.fieldErrors === undefined ? (
            <p
              role="alert"
              className="border-danger-400/40 bg-danger-600/20 text-danger-400 rounded-[6px] border px-3.5 py-2.5 text-sm"
            >
              {error.message}
            </p>
          ) : null}

          {changed ? (
            <p
              role="status"
              className="border-celeste-400/40 bg-celeste-400/10 text-celeste-400 rounded-[6px] border px-3.5 py-2.5 text-sm"
            >
              Contraseña actualizada.
            </p>
          ) : null}

          <Field
            label="Contraseña actual"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            errors={error?.fieldErrors('currentPassword')}
          />
          <Field
            label="Nueva contraseña"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            hint="Al menos 10 caracteres."
            errors={error?.fieldErrors('newPassword')}
          />

          <div>
            <Button type="submit" isLoading={isSaving}>
              Cambiar contraseña
            </Button>
          </div>
        </form>
      </section>

      <section className="border-danger-600/40 rounded-[10px] border bg-black/70 px-4 py-4 backdrop-blur-[6px]">
        <h2 className="font-display text-danger-400 mb-1 text-lg font-bold">Borrar mi cuenta</h2>
        <p className="text-ink-300 mb-4 text-sm">
          Se eliminan tu perfil, tus camisetas, sus imágenes y los enlaces compartidos. No se puede
          deshacer.
        </p>
        <Button variant="danger" onClick={() => setIsConfirmingDelete(true)}>
          Borrar mi cuenta
        </Button>
      </section>

      <ConfirmDialog
        isOpen={isConfirmingDelete}
        title="Borrar la cuenta"
        description="Ingresá tu contraseña para confirmar. Se borra todo y no se puede recuperar."
        confirmLabel="Borrar definitivamente"
        isBusy={isSaving}
        onConfirm={() => void removeAccount()}
        onCancel={() => {
          setIsConfirmingDelete(false);
          setDeleteError(null);
          setDeletePassword('');
        }}
      >
        <Field
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          value={deletePassword}
          onChange={(event) => setDeletePassword(event.target.value)}
          errors={deleteError === null ? undefined : [deleteError]}
        />
      </ConfirmDialog>
    </div>
  );
};
