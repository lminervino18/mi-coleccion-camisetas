import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { shirtTitle } from '@camisetas/contracts';
import { DomainError, getShirt, resolveShareToken } from '@camisetas/core';
import { appUrl } from '@/server/auth';
import { db } from '@/server/db';
import { toShirt } from '@/server/serializers';
import { COLOR_LABELS, COLOR_SWATCHES, KIND_LABELS, KIT_LABELS } from '@/lib/labels';
import { ExpiredShareLink } from '../expired-share-link';

type Params = { params: Promise<{ token: string; shirtId: string }> };

const loadSharedShirt = async (token: string, shirtId: string) => {
  const owner = await resolveShareToken(db, token);
  if (owner === null) return null;

  try {
    return { owner, shirt: toShirt(await getShirt(db, owner.userId, shirtId)) };
  } catch (error) {
    if (error instanceof DomainError && error.code === 'not_found') return null;
    throw error;
  }
};

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
  const { token, shirtId } = await params;
  const shared = await loadSharedShirt(token, shirtId);

  if (shared === null) return { title: 'Enlace no disponible', robots: { index: false } };

  const title = shirtTitle(shared.shirt);
  const owner = shared.owner.displayName ?? shared.owner.username;

  return {
    title,
    description: `${title} · de la colección de ${owner}.`,
    robots: { index: false, follow: false },
    openGraph: {
      type: 'website',
      title,
      description: `De la colección de ${owner}.`,
      url: appUrl(`/c/${token}/${shirtId}`),
      images: [{ url: shared.shirt.image.fullUrl }],
    },
    twitter: { card: 'summary_large_image', title },
  };
};

const DetailRow = ({ label, value }: { label: string; value: string | number | null }) =>
  value === null || value === '' ? null : (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/8 py-2 last:border-0">
      <dt className="text-ink-300 text-sm">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );

const SharedShirtPage = async ({ params }: Params) => {
  const { token, shirtId } = await params;
  const shared = await loadSharedShirt(token, shirtId);

  if (shared === null) return <ExpiredShareLink />;

  const { shirt } = shared;

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-5 sm:py-6">
      <Link
        href={`/c/${token}`}
        className="text-ink-100 mb-4 inline-flex min-h-11 items-center rounded-[6px] border border-white/12 bg-white/10 px-4 text-sm transition-colors hover:bg-white/16"
      >
        ← Volver a la colección
      </Link>

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
            <DetailRow label="Jugador" value={shirt.playerName} />
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
        </div>
      </div>
    </main>
  );
};

export default SharedShirtPage;
