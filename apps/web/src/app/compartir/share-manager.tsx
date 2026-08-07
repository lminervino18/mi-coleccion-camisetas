'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ShareLink } from '@camisetas/contracts';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { CopyButton } from '@/components/ui/copy-button';
import { ApiRequestError, apiRequest } from '@/lib/api-client';

type ActiveLink = { id: string; createdAt: string; expiresAt: string | null };

type ShareManagerProps = { links: ActiveLink[] };

const EXPIRY_CHOICES = [
  { value: '30', label: '30 días' },
  { value: '90', label: '90 días' },
  { value: '365', label: 'Un año' },
  { value: 'never', label: 'Sin vencimiento' },
];

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(new Date(iso));

export const ShareManager = ({ links }: ShareManagerProps) => {
  const router = useRouter();
  const [expiry, setExpiry] = useState('30');
  const [issued, setIssued] = useState<ShareLink | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    setIsBusy(true);
    setError(null);
    try {
      const link = await apiRequest<ShareLink>('/api/share-links', {
        method: 'POST',
        json: { expiresInDays: expiry === 'never' ? null : Number(expiry) },
      });
      setIssued(link);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : 'No pudimos crear el enlace.');
    } finally {
      setIsBusy(false);
    }
  };

  const revoke = async (id: string) => {
    setIsBusy(true);
    try {
      await apiRequest(`/api/share-links/${id}`, { method: 'DELETE' });
      if (issued?.id === id) setIssued(null);
      setRevoking(null);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiRequestError ? caught.message : 'No pudimos revocar el enlace.',
      );
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {error === null ? null : (
        <p
          role="alert"
          className="border-danger-400/40 bg-danger-600/20 text-danger-400 rounded-[6px] border px-3.5 py-2.5 text-sm"
        >
          {error}
        </p>
      )}

      <section className="panel px-4 py-4">
        <h2 className="font-display mb-1 text-lg font-bold">Crear un enlace</h2>
        <p className="text-ink-300 mb-4 text-sm">
          Quien tenga el enlace puede ver tu colección sin necesidad de una cuenta. No se muestra tu
          correo ni ningún dato privado.
        </p>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="expiry" className="text-ink-300 text-sm">
              Vencimiento
            </label>
            <select
              id="expiry"
              value={expiry}
              onChange={(event) => setExpiry(event.target.value)}
              className="text-ink-100 min-h-11 rounded-[6px] border border-white/12 bg-black/45 px-3 text-base"
            >
              {EXPIRY_CHOICES.map((choice) => (
                <option key={choice.value} value={choice.value} className="bg-ink-800">
                  {choice.label}
                </option>
              ))}
            </select>
          </div>

          <Button onClick={() => void create()} isLoading={isBusy}>
            Generar enlace
          </Button>
        </div>

        {issued === null ? null : (
          <div className="border-celeste-400/40 bg-celeste-400/10 mt-4 rounded-[8px] border p-3">
            <p className="mb-2 text-sm font-medium">
              Copiá el enlace ahora: por seguridad no vamos a poder volver a mostrarlo.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                readOnly
                value={issued.url}
                aria-label="Enlace para compartir"
                onFocus={(event) => event.currentTarget.select()}
                className="text-ink-100 min-h-11 min-w-0 flex-1 rounded-[6px] border border-white/12 bg-black/50 px-3 text-sm"
              />
              <CopyButton value={issued.url} />
            </div>
          </div>
        )}
      </section>

      <section className="panel px-4 py-4">
        <h2 className="font-display mb-3 text-lg font-bold">Enlaces activos</h2>

        {links.length === 0 ? (
          <p className="text-ink-500 py-4 text-center text-sm">Todavía no generaste ninguno.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-white/8">
            {links.map((link) => (
              <li key={link.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="text-sm">
                  <p>Creado el {formatDate(link.createdAt)}</p>
                  <p className="text-ink-300">
                    {link.expiresAt === null
                      ? 'Sin vencimiento'
                      : `Vence el ${formatDate(link.expiresAt)}`}
                  </p>
                </div>
                <Button variant="danger" onClick={() => setRevoking(link.id)} disabled={isBusy}>
                  Revocar
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        isOpen={revoking !== null}
        title="Revocar enlace"
        description="El enlace deja de funcionar de inmediato para todos los que lo tengan."
        confirmLabel="Revocar"
        isBusy={isBusy}
        onConfirm={() => {
          if (revoking !== null) void revoke(revoking);
        }}
        onCancel={() => setRevoking(null)}
      />
    </div>
  );
};
