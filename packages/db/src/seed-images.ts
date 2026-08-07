import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const UPLOADS_ROOT = resolve(process.cwd(), '../../apps/web/.uploads');

export type SeedImage = { width: number; height: number; attribution: string | null };

type CommonsHit = { thumburl?: string; extmetadata?: Record<string, { value?: string }> };

const stripMarkup = (value: string) => value.replace(/<[^>]*>/g, '').trim();

/**
 * Looks for a freely licensed photograph on Wikimedia Commons. Returns null on any failure so a
 * machine without network access still gets a usable seed.
 */
const findPhotograph = async (query: string): Promise<CommonsHit | null> => {
  const url = new URL(COMMONS_API);
  url.search = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: '6',
    gsrlimit: '4',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: '1000',
    format: 'json',
    origin: '*',
  }).toString();

  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'mi-coleccion-camisetas-seed' } });
    if (!response.ok) return null;

    const payload = (await response.json()) as {
      query?: { pages?: Record<string, { imageinfo?: CommonsHit[] }> };
    };
    const pages = Object.values(payload.query?.pages ?? {});

    for (const page of pages) {
      const info = page.imageinfo?.[0];
      if (info?.thumburl !== undefined) return info;
    }
    return null;
  } catch {
    return null;
  }
};

const solidFallback = (colors: readonly string[]) => {
  const [first = '#888888', second = first] = colors;
  return Buffer.from(
    `<svg width="900" height="1100" xmlns="http://www.w3.org/2000/svg">
       <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
         <stop offset="0%" stop-color="${first}"/><stop offset="100%" stop-color="${second}"/>
       </linearGradient></defs>
       <rect width="900" height="1100" fill="url(#g)"/>
     </svg>`,
  );
};

/**
 * Writes the full and thumbnail variants the application expects, mirroring what the upload
 * route does at runtime.
 */
export const storeSeedImage = async (
  objectKey: string,
  query: string,
  fallbackColors: readonly string[],
): Promise<SeedImage> => {
  const hit = await findPhotograph(query);

  let source: Buffer;
  let attribution: string | null = null;

  if (hit?.thumburl === undefined) {
    source = solidFallback(fallbackColors);
  } else {
    try {
      const response = await fetch(hit.thumburl, {
        headers: { 'User-Agent': 'mi-coleccion-camisetas-seed' },
      });
      source = Buffer.from(await response.arrayBuffer());

      const author = stripMarkup(hit.extmetadata?.['Artist']?.value ?? '');
      const licence = stripMarkup(hit.extmetadata?.['LicenseShortName']?.value ?? '');
      attribution =
        author === '' ? null : `Foto: ${author}${licence === '' ? '' : ` (${licence})`}`;
    } catch {
      source = solidFallback(fallbackColors);
    }
  }

  let pipeline = sharp(source).rotate();
  try {
    await pipeline.metadata();
  } catch {
    // Commons occasionally returns a format sharp cannot decode; the seed must not stop there.
    pipeline = sharp(solidFallback(fallbackColors)).rotate();
    attribution = null;
  }

  const full = await pipeline
    .clone()
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });
  const thumbnail = await pipeline
    .clone()
    .resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 72 })
    .toBuffer();

  const target = resolve(UPLOADS_ROOT, objectKey);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, full.data);
  await writeFile(`${target}-thumb`, thumbnail);

  return { width: full.info.width, height: full.info.height, attribution };
};
