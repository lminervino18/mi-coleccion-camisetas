'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImagePicker } from '@/components/image-picker';
import { ApiRequestError, apiRequest } from '@/lib/api-client';
import { uploadImage } from '@/lib/upload';

type AvatarEditorProps = { avatarUrl: string | null };

export const AvatarEditor = ({ avatarUrl }: AvatarEditorProps) => {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'saving'>('idle');
  const [error, setError] = useState<string | null>(null);

  const replace = async (file: File) => {
    setStatus('saving');
    setError(null);
    try {
      const imageUploadId = await uploadImage(file);
      await apiRequest('/api/profile/avatar', { method: 'PUT', json: { imageUploadId } });
      router.refresh();
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : 'No pudimos subir la foto.');
    } finally {
      setStatus('idle');
    }
  };

  const remove = async () => {
    setStatus('saving');
    try {
      await apiRequest('/api/profile/avatar', { method: 'DELETE' });
      router.refresh();
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : 'No pudimos quitar la foto.');
    } finally {
      setStatus('idle');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <ImagePicker
        label="Foto de perfil"
        currentImageUrl={avatarUrl}
        onFileSelected={(file) => {
          if (file !== null) void replace(file);
        }}
        error={error ?? undefined}
      />

      {avatarUrl === null ? null : (
        <div>
          <Button variant="secondary" onClick={() => void remove()} isLoading={status === 'saving'}>
            Quitar foto
          </Button>
        </div>
      )}
    </div>
  );
};
