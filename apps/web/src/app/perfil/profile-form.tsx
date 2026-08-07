'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { UserProfile } from '@camisetas/contracts';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { ApiRequestError, apiRequest } from '@/lib/api-client';
import { textField } from '@/lib/form';

export const ProfileForm = ({ profile }: { profile: UserProfile }) => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<ApiRequestError | null>(null);

  const save = async (form: FormData) => {
    setIsSaving(true);
    setError(null);
    try {
      await apiRequest('/api/profile', {
        method: 'PUT',
        json: {
          username: textField(form, 'username'),
          email: textField(form, 'email'),
          displayName: textField(form, 'displayName'),
          bio: textField(form, 'bio'),
          favoriteClub: textField(form, 'favoriteClub'),
          country: textField(form, 'country'),
          collectingSince: textField(form, 'collectingSince'),
        },
      });
      setSavedAt(Date.now());
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiRequestError
          ? caught
          : new ApiRequestError({ code: 'internal_error', message: 'No pudimos guardar.' }),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!isSaving) void save(new FormData(event.currentTarget));
      }}
      noValidate
      className="flex flex-col gap-4"
    >
      {error !== null && error.error.fieldErrors === undefined ? (
        <p
          role="alert"
          className="border-danger-400/40 bg-danger-600/20 text-danger-400 rounded-[6px] border px-3.5 py-2.5 text-sm"
        >
          {error.message}
        </p>
      ) : null}

      {savedAt === null ? null : (
        <p
          role="status"
          className="border-celeste-400/40 bg-celeste-400/10 text-celeste-400 rounded-[6px] border px-3.5 py-2.5 text-sm"
        >
          Perfil guardado.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Nombre de usuario"
          name="username"
          defaultValue={profile.username}
          autoComplete="username"
          autoCapitalize="none"
          required
          errors={error?.fieldErrors('username')}
        />
        <Field
          label="Correo electrónico"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          defaultValue={profile.email}
          required
          errors={error?.fieldErrors('email')}
        />
        <Field
          label="Nombre para mostrar"
          name="displayName"
          defaultValue={profile.displayName ?? ''}
          hint="Es el nombre que ven quienes abren tu colección compartida."
          errors={error?.fieldErrors('displayName')}
        />
        <Field
          label="Club del que sos hincha"
          name="favoriteClub"
          defaultValue={profile.favoriteClub ?? ''}
          errors={error?.fieldErrors('favoriteClub')}
        />
        <Field
          label="País"
          name="country"
          defaultValue={profile.country ?? ''}
          errors={error?.fieldErrors('country')}
        />
        <Field
          label="Coleccionando desde"
          name="collectingSince"
          type="number"
          inputMode="numeric"
          min={1950}
          max={new Date().getFullYear()}
          defaultValue={profile.collectingSince ?? ''}
          errors={error?.fieldErrors('collectingSince')}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="bio" className="text-ink-300 text-sm">
          Sobre tu colección
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          maxLength={280}
          defaultValue={profile.bio ?? ''}
          className="text-ink-100 focus:border-celeste-400 rounded-[6px] border border-white/12 bg-black/45 px-3.5 py-2.5 text-base"
        />
        <p className="text-ink-500 text-xs">Hasta 280 caracteres. Aparece en tu vista pública.</p>
      </div>

      <div>
        <Button type="submit" isLoading={isSaving}>
          Guardar cambios
        </Button>
      </div>
    </form>
  );
};
