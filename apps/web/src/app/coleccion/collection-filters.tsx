'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import {
  SHIRT_KINDS,
  SHIRT_KITS,
  SHIRT_SIZES,
  SHIRT_SORT_FIELDS,
  type ShirtSortField,
} from '@camisetas/contracts';
import { Button } from '@/components/ui/button';
import { KIND_LABELS, KIT_LABELS } from '@/lib/labels';

const SORT_LABELS: Record<ShirtSortField, string> = {
  createdAt: 'Más recientes',
  season: 'Temporada',
  club: 'Club',
  country: 'País',
  league: 'Liga',
  size: 'Talle',
};

type CollectionFiltersProps = {
  leagues: string[];
  countries: string[];
};

/**
 * Filters live in the URL so the view is shareable, survives a reload and works with the back
 * button. The previous implementation kept them in localStorage, which did none of that.
 */
export const CollectionFilters = ({ leagues, countries }: CollectionFiltersProps) => {
  const router = useRouter();
  const params = useSearchParams();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const current = (key: string): string[] => {
    const raw = params.get(key);
    return raw === null || raw === '' ? [] : raw.split(',');
  };

  const apply = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === '') next.delete(key);
      else next.set(key, value);
    }
    next.delete('page');
    router.push(next.size === 0 ? '/coleccion' : `/coleccion?${next.toString()}`);
  };

  const toggleIn = (key: string, value: string) => {
    const values = current(key);
    const next = values.includes(value)
      ? values.filter((item) => item !== value)
      : [...values, value];
    apply({ [key]: next.join(',') });
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = new FormData(event.currentTarget).get('search');
    apply({ search: typeof term === 'string' ? term.trim() : null });
  };

  const activeCount =
    ['kind', 'size', 'kit', 'color', 'league', 'country'].reduce(
      (total, key) => total + current(key).length,
      0,
    ) + (params.get('favoritesOnly') === 'true' ? 1 : 0);

  const chip = (isActive: boolean) =>
    `inline-flex min-h-11 items-center rounded-full border px-3.5 text-sm transition-colors ${
      isActive ? 'border-celeste-400 bg-white/18' : 'border-white/12 bg-white/6 hover:bg-white/12'
    }`;

  return (
    <section aria-label="Filtros" className="panel mb-4 flex flex-col gap-3 px-3 py-3 sm:px-4">
      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={handleSearch} role="search" className="flex min-w-0 flex-1 gap-2">
          <label htmlFor="collection-search" className="sr-only">
            Buscar en la colección
          </label>
          <input
            id="collection-search"
            name="search"
            type="search"
            defaultValue={params.get('search') ?? ''}
            placeholder="Buscar por club, país, jugador…"
            className="text-ink-100 placeholder:text-ink-500 focus:border-celeste-400 min-h-11 min-w-0 flex-1 rounded-[6px] border border-white/12 bg-black/45 px-3.5 text-base"
          />
          <Button type="submit" variant="secondary">
            Buscar
          </Button>
        </form>

        <Button
          type="button"
          variant="secondary"
          onClick={() => setIsPanelOpen((open) => !open)}
          aria-expanded={isPanelOpen}
          aria-controls="filter-panel"
        >
          Filtros{activeCount > 0 ? ` (${String(activeCount)})` : ''}
        </Button>

        <label className="sr-only" htmlFor="collection-sort">
          Ordenar por
        </label>
        <select
          id="collection-sort"
          value={params.get('sort') ?? 'createdAt'}
          onChange={(event) => apply({ sort: event.target.value })}
          className="text-ink-100 min-h-11 rounded-[6px] border border-white/12 bg-black/45 px-3 text-sm"
        >
          {SHIRT_SORT_FIELDS.map((field) => (
            <option key={field} value={field} className="bg-ink-800">
              {SORT_LABELS[field]}
            </option>
          ))}
        </select>

        <Button
          type="button"
          variant="secondary"
          onClick={() => apply({ direction: params.get('direction') === 'asc' ? 'desc' : 'asc' })}
          aria-label={params.get('direction') === 'asc' ? 'Orden ascendente' : 'Orden descendente'}
        >
          {params.get('direction') === 'asc' ? '↑' : '↓'}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {SHIRT_KINDS.map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => toggleIn('kind', kind)}
            aria-pressed={current('kind').includes(kind)}
            className={chip(current('kind').includes(kind))}
          >
            {KIND_LABELS[kind]}
          </button>
        ))}

        <button
          type="button"
          onClick={() =>
            apply({ favoritesOnly: params.get('favoritesOnly') === 'true' ? null : 'true' })
          }
          aria-pressed={params.get('favoritesOnly') === 'true'}
          className={chip(params.get('favoritesOnly') === 'true')}
        >
          <span aria-hidden className="mr-1">
            ★
          </span>
          Favoritas
        </button>

        {activeCount > 0 || params.get('search') !== null ? (
          <button
            type="button"
            onClick={() => router.push('/coleccion')}
            className="text-celeste-400 inline-flex min-h-11 items-center px-2 text-sm hover:underline"
          >
            Limpiar todo
          </button>
        ) : null}
      </div>

      {isPanelOpen ? (
        <div id="filter-panel" className="flex flex-col gap-4 border-t border-white/10 pt-3">
          <FilterGroup
            legend="Talle"
            options={SHIRT_SIZES.map((size) => ({ value: size, label: size }))}
            selected={current('size')}
            onToggle={(value) => toggleIn('size', value)}
            chip={chip}
          />
          <FilterGroup
            legend="Equipación"
            options={SHIRT_KITS.map((kit) => ({ value: kit, label: KIT_LABELS[kit] }))}
            selected={current('kit')}
            onToggle={(value) => toggleIn('kit', value)}
            chip={chip}
          />
          {leagues.length > 0 ? (
            <FilterGroup
              legend="Liga"
              options={leagues.map((league) => ({ value: league, label: league }))}
              selected={current('league')}
              onToggle={(value) => toggleIn('league', value)}
              chip={chip}
            />
          ) : null}
          {countries.length > 0 ? (
            <FilterGroup
              legend="País"
              options={countries.map((country) => ({ value: country, label: country }))}
              selected={current('country')}
              onToggle={(value) => toggleIn('country', value)}
              chip={chip}
            />
          ) : null}
        </div>
      ) : null}
    </section>
  );
};

type FilterGroupProps = {
  legend: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  chip: (isActive: boolean) => string;
};

const FilterGroup = ({ legend, options, selected, onToggle, chip }: FilterGroupProps) => (
  <fieldset>
    <legend className="text-ink-300 mb-2 text-sm">{legend}</legend>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onToggle(option.value)}
          aria-pressed={selected.includes(option.value)}
          className={chip(selected.includes(option.value))}
        >
          {option.label}
        </button>
      ))}
    </div>
  </fieldset>
);
