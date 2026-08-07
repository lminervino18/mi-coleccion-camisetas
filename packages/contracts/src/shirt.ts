import { z } from 'zod';

export const SHIRT_KINDS = ['club', 'national'] as const;
export const shirtKindSchema = z.enum(SHIRT_KINDS);
export type ShirtKind = z.infer<typeof shirtKindSchema>;

export const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
export const shirtSizeSchema = z.enum(SHIRT_SIZES);
export type ShirtSize = z.infer<typeof shirtSizeSchema>;

export const SHIRT_KITS = ['home', 'away', 'third', 'goalkeeper', 'special'] as const;
export const shirtKitSchema = z.enum(SHIRT_KITS);
export type ShirtKit = z.infer<typeof shirtKitSchema>;

export const SHIRT_COLORS = [
  'white',
  'black',
  'red',
  'blue',
  'lightBlue',
  'navy',
  'green',
  'yellow',
  'orange',
  'purple',
  'pink',
  'brown',
  'grey',
  'gold',
  'silver',
] as const;
export const shirtColorSchema = z.enum(SHIRT_COLORS);
export type ShirtColor = z.infer<typeof shirtColorSchema>;

/**
 * A season is either a single year ("2023") or a split year pair ("2016/2017").
 * Split pairs must be consecutive.
 */
export const seasonSchema = z
  .string()
  .trim()
  .regex(/^\d{4}(\/\d{4})?$/, 'Formato de temporada inválido. Usá 2023 o 2016/2017.')
  .refine((season) => {
    const [start, end] = season.split('/');
    if (end === undefined) return true;
    return Number(end) === Number(start) + 1;
  }, 'Los años de la temporada deben ser consecutivos.')
  .refine((season) => {
    const start = Number(season.slice(0, 4));
    return start >= 1900 && start <= new Date().getFullYear() + 1;
  }, 'El año de la temporada está fuera de rango.');

const optionalTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value.length === 0 ? null : value))
    .nullable();

const shirtFields = {
  kind: shirtKindSchema,
  club: optionalTrimmed(100),
  league: optionalTrimmed(100),
  country: z.string().trim().min(1, 'El país es obligatorio.').max(100),
  season: seasonSchema,
  kit: shirtKitSchema,
  size: shirtSizeSchema,
  playerName: optionalTrimmed(100),
  squadNumber: z.number().int().min(0).max(99).nullable(),
  colors: z.array(shirtColorSchema).min(1, 'Elegí al menos un color.').max(5),
  notes: optionalTrimmed(1000),
  isFavorite: z.boolean(),
};

/**
 * Club shirts require a club name; national team shirts are identified by country alone.
 */
const requireClubForClubKind = <T extends { kind: ShirtKind; club: string | null }>(
  shirt: T,
  ctx: z.RefinementCtx,
): void => {
  if (shirt.kind === 'club' && shirt.club === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['club'],
      message: 'Las camisetas de club necesitan un club.',
    });
  }
};

export const createShirtSchema = z
  .object({ ...shirtFields, imageUploadId: z.string().uuid() })
  .superRefine(requireClubForClubKind);
export type CreateShirtInput = z.infer<typeof createShirtSchema>;

export const updateShirtSchema = z
  .object({ ...shirtFields, imageUploadId: z.string().uuid().nullable() })
  .superRefine(requireClubForClubKind);
export type UpdateShirtInput = z.infer<typeof updateShirtSchema>;

export const shirtImageSchema = z.object({
  thumbnailUrl: z.string().url(),
  fullUrl: z.string().url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});
export type ShirtImage = z.infer<typeof shirtImageSchema>;

export const shirtSchema = z.object({
  id: z.string().uuid(),
  ...shirtFields,
  image: shirtImageSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Shirt = z.infer<typeof shirtSchema>;

/** Display title used in cards, page titles and social previews. */
export const shirtTitle = (shirt: Pick<Shirt, 'kind' | 'club' | 'country' | 'season'>): string =>
  `${shirt.kind === 'club' ? (shirt.club ?? shirt.country) : shirt.country} ${shirt.season}`;
