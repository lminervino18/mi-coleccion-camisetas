'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '@camisetas/contracts';
import { Button } from '@/components/ui/button';

type ImagePickerProps = {
  label: string;
  currentImageUrl?: string | null;
  onFileSelected: (file: File | null) => void;
  error?: string | undefined;
};

const ACCEPT = ACCEPTED_IMAGE_TYPES.join(',');

/**
 * Preview object URLs are revoked when they are replaced or the component unmounts; the legacy
 * cropper leaked one per selection.
 */
export const ImagePicker = ({
  label,
  currentImageUrl = null,
  onFileSelected,
  error,
}: ImagePickerProps) => {
  const input = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (previewUrl !== null) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const select = (file: File | null) => {
    setLocalError(null);

    if (file === null) {
      setPreviewUrl((current) => {
        if (current !== null) URL.revokeObjectURL(current);
        return null;
      });
      onFileSelected(null);
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.some((type) => type === file.type)) {
      setLocalError('Elegí una imagen JPG, PNG o WebP.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setLocalError('La imagen supera los 10 MB.');
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl((current) => {
      if (current !== null) URL.revokeObjectURL(current);
      return url;
    });
    onFileSelected(file);
  };

  const shownImage = previewUrl ?? currentImageUrl;
  const message = localError ?? error;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-ink-300 text-sm">{label}</span>

      <div className="flex items-start gap-3">
        <div className="relative size-28 shrink-0 overflow-hidden rounded-[8px] border border-white/12 bg-black/40 sm:size-36">
          {shownImage === null ? (
            <span className="text-ink-500 absolute inset-0 grid place-items-center text-xs">
              Sin imagen
            </span>
          ) : (
            <Image
              src={shownImage}
              alt=""
              fill
              sizes="144px"
              unoptimized={previewUrl !== null}
              className="object-cover"
            />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={input}
            type="file"
            accept={ACCEPT}
            capture="environment"
            className="sr-only"
            onChange={(event) => select(event.target.files?.[0] ?? null)}
          />
          <Button type="button" variant="secondary" onClick={() => input.current?.click()}>
            {shownImage === null ? 'Elegir imagen' : 'Cambiar imagen'}
          </Button>
          {shownImage !== null && previewUrl !== null ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                select(null);
                if (input.current !== null) input.current.value = '';
              }}
            >
              Quitar
            </Button>
          ) : null}
          <p className="text-ink-500 text-xs">JPG, PNG o WebP. Hasta 10 MB.</p>
        </div>
      </div>

      {message === undefined || message === null ? null : (
        <p role="alert" className="text-danger-400 text-sm">
          {message}
        </p>
      )}
    </div>
  );
};
