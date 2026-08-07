import Image from 'next/image';
import Link from 'next/link';
import type { AuthenticatedUser } from '@camisetas/core';
import { LogoutButton } from './logout-button';

type CollectionHeaderProps = {
  user: AuthenticatedUser;
  totalItems: number;
};

export const CollectionHeader = ({ user, totalItems }: CollectionHeaderProps) => (
  <header className="panel mb-5 px-3 py-3 sm:px-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <Image src="/logo.png" alt="" width={36} height={51} className="h-9 w-auto shrink-0" />
        <div className="min-w-0">
          <h1 className="font-display truncate text-lg font-bold sm:text-xl">Mi colección</h1>
          <p className="text-ink-300 truncate text-sm">
            {user.displayName ?? user.username} · {totalItems}{' '}
            {totalItems === 1 ? 'camiseta' : 'camisetas'}
          </p>
        </div>
      </div>

      <nav aria-label="Acciones de la colección" className="flex flex-wrap items-center gap-2">
        <Link
          href="/camiseta/nueva"
          className="bg-brand-500 hover:bg-brand-600 inline-flex min-h-11 items-center rounded-[6px] px-4 text-sm font-semibold text-white transition-colors"
        >
          Agregar
        </Link>
        <Link
          href="/estadisticas"
          className="text-ink-100 inline-flex min-h-11 items-center rounded-[6px] border border-white/12 bg-white/10 px-4 text-sm transition-colors hover:bg-white/16"
        >
          Estadísticas
        </Link>
        <Link
          href="/perfil"
          className="text-ink-100 inline-flex min-h-11 items-center rounded-[6px] border border-white/12 bg-white/10 px-4 text-sm transition-colors hover:bg-white/16"
        >
          Perfil
        </Link>
        <Link
          href="/compartir"
          className="text-ink-100 inline-flex min-h-11 items-center rounded-[6px] border border-white/12 bg-white/10 px-4 text-sm transition-colors hover:bg-white/16"
        >
          Compartir
        </Link>
        <LogoutButton />
      </nav>
    </div>
  </header>
);
