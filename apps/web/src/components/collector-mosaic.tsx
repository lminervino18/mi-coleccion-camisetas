import Image from 'next/image';

const TILE_COUNT = 31;
const COLUMNS = 7;

const tileSrc = (index: number) =>
  `/coleccionistas/${String((index % TILE_COUNT) + 1).padStart(2, '0')}.webp`;

/**
 * Backdrop of collector photographs, shown as small tiles rather than a full-bleed hero.
 * The source images vary from 360px squares to wide panoramas, so at hero size they were either
 * upscaled soft or cropped through people's faces; at tile size every one of them is sharp.
 *
 * Each column is duplicated once and drifts by exactly half its height, which makes the loop
 * seamless without cloning nodes at runtime.
 */
export const CollectorMosaic = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="mosaic-grid">
      {Array.from({ length: COLUMNS }, (_, column) => (
        <div key={column} className={`mosaic-column mosaic-column-${String(column % 2)}`}>
          {Array.from({ length: 18 }, (_, tile) => {
            const index = column * 9 + tile;
            return (
              <Image
                key={`${String(column)}-${String(tile)}`}
                src={tileSrc(index)}
                alt=""
                width={420}
                height={420}
                sizes="(max-width: 640px) 33vw, (max-width: 1280px) 20vw, 14vw"
                priority={tile < 2}
                className="mosaic-tile"
              />
            );
          })}
        </div>
      ))}
    </div>

    <div className="absolute inset-0 bg-black/62" />
    <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/55 to-black/92" />
  </div>
);
