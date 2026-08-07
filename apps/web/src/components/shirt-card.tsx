import Image from 'next/image';
import Link from 'next/link';
import { shirtTitle, type Shirt } from '@camisetas/contracts';
import { KIT_LABELS } from '@/lib/labels';

type ShirtCardProps = {
  shirt: Shirt;
  href: string;
  priority?: boolean;
};

/**
 * Keeps the original card language: photograph filling the tile, desaturated until hovered,
 * with a dark caption bar carrying the serif title.
 */
export const ShirtCard = ({ shirt, href, priority = false }: ShirtCardProps) => (
  <Link
    href={href}
    className="group focus-visible:ring-celeste-400 relative block aspect-3/4 overflow-hidden rounded-[10px] border border-white/10 bg-black shadow-[0_4px_8px_rgb(0_0_0/0.6)] transition-transform focus-visible:ring-2 focus-visible:outline-none motion-safe:hover:scale-[1.03]"
  >
    <Image
      src={shirt.image.thumbnailUrl}
      alt={shirtTitle(shirt)}
      fill
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
      priority={priority}
      className="object-cover grayscale transition-[filter] duration-300 group-hover:grayscale-0 group-focus-visible:grayscale-0"
    />

    {shirt.isFavorite ? (
      <span
        className="absolute top-2 right-2 rounded-full bg-black/70 px-2 py-1 text-xs"
        title="Favorita"
      >
        <span aria-hidden>★</span>
        <span className="sr-only">Favorita</span>
      </span>
    ) : null}

    <div className="absolute inset-x-0 bottom-0 bg-black/75 px-3 py-2.5 text-center backdrop-blur-[2px]">
      <p className="font-display truncate text-sm font-bold sm:text-base">{shirtTitle(shirt)}</p>
      <p className="text-ink-300 truncate text-xs">{KIT_LABELS[shirt.kit]}</p>
    </div>
  </Link>
);
