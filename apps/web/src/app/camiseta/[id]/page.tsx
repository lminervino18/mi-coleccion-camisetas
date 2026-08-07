import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { shirtTitle } from '@camisetas/contracts';
import { DomainError, getShirt } from '@camisetas/core';
import { getCurrentUser } from '@/server/auth';
import { db } from '@/server/db';
import { toShirt } from '@/server/serializers';
import { COLOR_LABELS, COLOR_SWATCHES, KIND_LABELS, KIT_LABELS } from '@/lib/labels';
import { ShirtActions } from './shirt-actions';

type Params = { params: Promise<{ id: string }> };

const loadShirt = async (id: string) => {
  const user = await getCurrentUser();
  if (user === null) redirect('/');

  try {
    return toShirt(await getShirt(db, user.id, id));
  } catch (error) {
    if (error instanceof DomainError && error.code === 'not_found') notFound();
    throw error;
  }
};

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
  const shirt = await loadShirt((await params).id);
  return { title: shirtTitle(shirt), robots: { index: false } };
};

const DetailRow = ({ label, value }: { label: string; value: string | number | null }) =>
  value === null || value === '' ? null : (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/8 py-2 last:border-0">
      <dt className="text-ink-300 text-sm">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );

const ShirtDetailPage = async ({ params }: Params) => {
  const shirt = await loadShirt((await params).id);

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-5 sm:py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/coleccion"
          className="text-ink-100 inline-flex min-h-11 items-center rounded-[6px] border border-white/12 bg-white/10 px-4 text-sm transition-colors hover:bg-white/16"
        >
          ← Volver
        </Link>
        <ShirtActions shirtId={shirt.id} isFavorite={shirt.isFavorite} />
      </div>

      <h1 className="font-display panel mb-4 px-4 py-3 text-center text-xl font-bold text-balance sm:text-2xl">
        {shirtTitle(shirt)}
      </h1>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="panel overflow-hidden p-2">
          <Image
            src={shirt.image.fullUrl}
            alt={shirtTitle(shirt)}
            width={shirt.image.width}
            height={shirt.image.height}
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="h-auto w-full rounded-[8px] object-contain"
          />
        </div>

        <div className="flex flex-col gap-4">
          <dl className="panel px-4 py-3">
            <DetailRow label="Tipo" value={KIND_LABELS[shirt.kind]} />
            <DetailRow label="País" value={shirt.country} />
            <DetailRow label="Club" value={shirt.club} />
            <DetailRow label="Liga" value={shirt.league} />
            <DetailRow label="Temporada" value={shirt.season} />
            <DetailRow label="Equipación" value={KIT_LABELS[shirt.kit]} />
            <DetailRow label="Talle" value={shirt.size} />
            <DetailRow label="Nombre" value={shirt.playerName} />
            <DetailRow label="Dorsal" value={shirt.squadNumber} />
          </dl>

          <section className="panel px-4 py-3" aria-labelledby="colores">
            <h2 id="colores" className="text-ink-300 mb-2 text-sm">
              Colores
            </h2>
            <ul className="flex flex-wrap gap-2">
              {shirt.colors.map((color) => (
                <li
                  key={color}
                  className="flex items-center gap-2 rounded-full border border-white/12 bg-white/8 py-1 pr-3 pl-1.5 text-sm"
                >
                  <span
                    aria-hidden
                    className="size-4 rounded-full border border-white/25"
                    style={{ backgroundColor: COLOR_SWATCHES[color] }}
                  />
                  {COLOR_LABELS[color]}
                </li>
              ))}
            </ul>
          </section>

          {shirt.notes === null ? null : (
            <section className="panel px-4 py-3" aria-labelledby="comentarios">
              <h2 id="comentarios" className="text-ink-300 mb-1 text-sm">
                Comentarios
              </h2>
              <p className="break-words whitespace-pre-wrap">{shirt.notes}</p>
            </section>
          )}
        </div>
      </div>
    </main>
  );
};

export default ShirtDetailPage;
