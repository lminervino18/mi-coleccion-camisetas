'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import {
  SHIRT_KITS,
  SHIRT_KINDS,
  SHIRT_SIZES,
  type Shirt,
  type ShirtColor,
} from '@camisetas/contracts';
import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/color-picker';
import { Field } from '@/components/ui/field';
import { SelectField } from '@/components/ui/select';
import { ImagePicker } from '@/components/image-picker';
import { ApiRequestError, apiRequest } from '@/lib/api-client';
import { textField } from '@/lib/form';
import { uploadImage } from '@/lib/upload';
import { KIND_LABELS, KIT_LABELS } from '@/lib/labels';

type ShirtFormProps = { shirt?: Shirt };

const optionsFrom = <T extends string>(values: readonly T[], labels: Record<T, string>) =>
  values.map((value) => ({ value, label: labels[value] }));

const SIZE_OPTIONS = SHIRT_SIZES.map((size) => ({ value: size, label: size }));

export const ShirtForm = ({ shirt }: ShirtFormProps) => {
  const router = useRouter();
  const isEditing = shirt !== undefined;

  const [kind, setKind] = useState(shirt?.kind ?? 'club');
  const [colors, setColors] = useState<ShirtColor[]>(shirt?.colors ?? []);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'saving'>('idle');
  const [error, setError] = useState<ApiRequestError | null>(null);

  const isBusy = status !== 'idle';

  const save = async (form: FormData) => {
    setError(null);

    try {
      let imageUploadId: string | null = null;
      if (file !== null) {
        setStatus('uploading');
        imageUploadId = await uploadImage(file);
      }

      if (!isEditing && imageUploadId === null) {
        throw new ApiRequestError({
          code: 'validation_failed',
          message: 'Agregá una foto de la camiseta.',
          fieldErrors: { image: ['Agregá una foto de la camiseta.'] },
        });
      }

      setStatus('saving');
      const squadNumber = textField(form, 'squadNumber');

      const body = {
        kind,
        club: textField(form, 'club'),
        league: textField(form, 'league'),
        country: textField(form, 'country'),
        season: textField(form, 'season'),
        kit: textField(form, 'kit'),
        size: textField(form, 'size'),
        playerName: textField(form, 'playerName'),
        squadNumber: squadNumber === '' ? null : Number(squadNumber),
        colors,
        notes: textField(form, 'notes'),
        isFavorite: form.get('isFavorite') === 'on',
        imageUploadId,
      };

      const saved = await apiRequest<Shirt>(isEditing ? `/api/shirts/${shirt.id}` : '/api/shirts', {
        method: isEditing ? 'PUT' : 'POST',
        json: body,
      });

      router.replace(`/camiseta/${saved.id}`);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiRequestError
          ? caught
          : new ApiRequestError({
              code: 'internal_error',
              message: 'No pudimos guardar la camiseta.',
            }),
      );
      setStatus('idle');
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isBusy) return;
    void save(new FormData(event.currentTarget));
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {error !== null && error.error.fieldErrors === undefined ? (
        <p
          role="alert"
          className="border-danger-400/40 bg-danger-600/20 text-danger-400 rounded-[6px] border px-3.5 py-2.5 text-sm"
        >
          {error.message}
        </p>
      ) : null}

      <ImagePicker
        label="Foto de la camiseta"
        currentImageUrl={shirt?.image.fullUrl ?? null}
        onFileSelected={setFile}
        error={error?.fieldErrors('image')?.join(' ')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Tipo"
          name="kind"
          value={kind}
          onChange={(event) => setKind(event.target.value as typeof kind)}
          options={optionsFrom(SHIRT_KINDS, KIND_LABELS)}
        />

        <Field
          label="País"
          name="country"
          defaultValue={shirt?.country ?? ''}
          required
          errors={error?.fieldErrors('country')}
        />

        {kind === 'club' ? (
          <>
            <Field
              label="Club"
              name="club"
              defaultValue={shirt?.club ?? ''}
              required
              errors={error?.fieldErrors('club')}
            />
            <Field
              label="Liga"
              name="league"
              defaultValue={shirt?.league ?? ''}
              errors={error?.fieldErrors('league')}
            />
          </>
        ) : null}

        <Field
          label="Temporada"
          name="season"
          defaultValue={shirt?.season ?? ''}
          required
          inputMode="numeric"
          hint="Un año (2023) o una temporada partida (2016/2017)."
          errors={error?.fieldErrors('season')}
        />

        <SelectField
          label="Equipación"
          name="kit"
          defaultValue={shirt?.kit ?? 'home'}
          options={optionsFrom(SHIRT_KITS, KIT_LABELS)}
        />

        <SelectField
          label="Talle"
          name="size"
          defaultValue={shirt?.size ?? 'M'}
          options={SIZE_OPTIONS}
        />

        <Field
          label="Nombre en la camiseta"
          name="playerName"
          defaultValue={shirt?.playerName ?? ''}
          errors={error?.fieldErrors('playerName')}
        />

        <Field
          label="Dorsal"
          name="squadNumber"
          type="number"
          inputMode="numeric"
          min={0}
          max={99}
          defaultValue={shirt?.squadNumber ?? ''}
          errors={error?.fieldErrors('squadNumber')}
        />
      </div>

      <ColorPicker selected={colors} onChange={setColors} errors={error?.fieldErrors('colors')} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="text-ink-300 text-sm">
          Comentarios
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={shirt?.notes ?? ''}
          className="text-ink-100 focus:border-celeste-400 rounded-[6px] border border-white/12 bg-black/45 px-3.5 py-2.5 text-base"
        />
      </div>

      <label className="inline-flex min-h-11 items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          name="isFavorite"
          defaultChecked={shirt?.isFavorite ?? false}
          className="accent-brand-500 size-5"
        />
        Marcar como favorita
      </label>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" isLoading={isBusy}>
          {status === 'uploading'
            ? 'Subiendo imagen…'
            : status === 'saving'
              ? 'Guardando…'
              : isEditing
                ? 'Guardar cambios'
                : 'Agregar camiseta'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()} disabled={isBusy}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};
