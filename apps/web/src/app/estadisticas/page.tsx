import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { calculateCollectionStatistics } from '@camisetas/core';
import { getCurrentUser } from '@/server/auth';
import { db } from '@/server/db';
import { BarList } from '@/components/charts/bar-list';
import { ProportionBar } from '@/components/charts/proportion-bar';
import { StatTile } from '@/components/charts/stat-tile';
import { COLOR_LABELS, COLOR_SWATCHES, KIND_LABELS, KIT_LABELS } from '@/lib/labels';

export const metadata: Metadata = {
  title: 'Estadísticas',
  robots: { index: false },
};

const StatisticsPage = async () => {
  const user = await getCurrentUser();
  if (user === null) redirect('/');

  const stats = await calculateCollectionStatistics(db, user.id);

  if (stats.totalShirts === 0) {
    return (
      <main id="main" className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-5 sm:py-6">
        <BackLink />
        <div className="panel px-6 py-14 text-center">
          <h1 className="font-display mb-2 text-xl font-bold">Todavía no hay estadísticas</h1>
          <p className="text-ink-300 text-sm text-balance">
            Cargá tu primera camiseta y acá vas a ver cómo se compone tu colección.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-5 sm:py-6">
      <BackLink />

      <h1 className="font-display panel mb-4 px-4 py-3 text-center text-xl font-bold sm:text-2xl">
        Estadísticas de tu colección
      </h1>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Camisetas" value={stats.totalShirts} />
        <StatTile label="Países" value={stats.distinctCountries} />
        <StatTile label="Clubes" value={stats.distinctClubs} />
        <StatTile label="Ligas" value={stats.distinctLeagues} />
      </div>

      <div className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ProportionBar
          title="Clubes y selecciones"
          segments={stats.byKind.map((entry, index) => ({
            label: KIND_LABELS[entry.label],
            count: entry.count,
            color: index === 0 ? 'var(--color-chart-1)' : 'var(--color-chart-2)',
          }))}
        />

        <BarList
          title="Equipaciones"
          entries={stats.byKit.map((entry) => ({
            label: KIT_LABELS[entry.label],
            count: entry.count,
          }))}
        />

        <BarList
          title="Talles"
          entries={stats.bySize.map((entry) => ({ label: entry.label, count: entry.count }))}
        />

        <BarList
          title="Colores"
          entries={stats.byColor.map((entry) => ({
            label: COLOR_LABELS[entry.label],
            count: entry.count,
            swatch: COLOR_SWATCHES[entry.label],
          }))}
        />

        <BarList title="Clubes" entries={stats.topClubs} />
        <BarList title="Países" entries={stats.topCountries} />
        <BarList title="Ligas" entries={stats.topLeagues} />
        <BarList
          title="Jugadores"
          entries={stats.topPlayers}
          emptyMessage="Ninguna camiseta tiene nombre todavía"
        />
        <BarList title="Décadas" entries={stats.byDecade} />
      </div>
    </main>
  );
};

const BackLink = () => (
  <Link
    href="/coleccion"
    className="text-ink-100 mb-4 inline-flex min-h-11 items-center rounded-[6px] border border-white/12 bg-white/10 px-4 text-sm transition-colors hover:bg-white/16"
  >
    ← Volver
  </Link>
);

export default StatisticsPage;
