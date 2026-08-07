'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { apiRequest } from '@/lib/api-client';

type ShirtActionsProps = {
  shirtId: string;
  isFavorite: boolean;
};

export const ShirtActions = ({ shirtId, isFavorite }: ShirtActionsProps) => {
  const router = useRouter();
  const [favorite, setFavorite] = useState(isFavorite);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const toggleFavorite = async () => {
    setIsBusy(true);
    const previous = favorite;
    setFavorite(!previous);
    try {
      await apiRequest(`/api/shirts/${shirtId}/favorite`, { method: 'POST' });
      router.refresh();
    } catch {
      setFavorite(previous);
    } finally {
      setIsBusy(false);
    }
  };

  const remove = async () => {
    setIsBusy(true);
    try {
      await apiRequest(`/api/shirts/${shirtId}`, { method: 'DELETE' });
      router.replace('/coleccion');
      router.refresh();
    } catch {
      setIsBusy(false);
      setIsConfirmingDelete(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="secondary"
        onClick={() => void toggleFavorite()}
        disabled={isBusy}
        aria-pressed={favorite}
      >
        <span aria-hidden>{favorite ? '★' : '☆'}</span>
        {favorite ? 'Quitar de favoritas' : 'Marcar favorita'}
      </Button>

      <Link
        href={`/camiseta/${shirtId}/editar`}
        className="text-ink-100 inline-flex min-h-11 items-center rounded-[6px] border border-white/12 bg-white/10 px-4 text-sm transition-colors hover:bg-white/16"
      >
        Editar
      </Link>

      <Button variant="danger" onClick={() => setIsConfirmingDelete(true)} disabled={isBusy}>
        Eliminar
      </Button>

      <ConfirmDialog
        isOpen={isConfirmingDelete}
        title="Eliminar camiseta"
        description="Se va a borrar la camiseta y su imagen. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        isBusy={isBusy}
        onConfirm={() => void remove()}
        onCancel={() => setIsConfirmingDelete(false)}
      />
    </div>
  );
};
