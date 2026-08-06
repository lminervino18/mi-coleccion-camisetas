import { z } from 'zod';
import { shirtColorSchema, shirtKindSchema, shirtKitSchema, shirtSizeSchema } from './shirt.js';

export const SHIRT_SORT_FIELDS = [
  'createdAt',
  'season',
  'club',
  'country',
  'league',
  'size',
] as const;
export const shirtSortFieldSchema = z.enum(SHIRT_SORT_FIELDS);
export type ShirtSortField = z.infer<typeof shirtSortFieldSchema>;

export const sortDirectionSchema = z.enum(['asc', 'desc']);
export type SortDirection = z.infer<typeof sortDirectionSchema>;

const csv = <T extends z.ZodTypeAny>(item: T) =>
  z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) => {
      if (value === undefined) return [];
      return (Array.isArray(value) ? value : value.split(',')).filter((part) => part.length > 0);
    })
    .pipe(z.array(item));

export const shirtFiltersSchema = z.object({
  search: z.string().trim().max(100).optional(),
  kind: csv(shirtKindSchema),
  size: csv(shirtSizeSchema),
  kit: csv(shirtKitSchema),
  color: csv(shirtColorSchema),
  league: csv(z.string().max(100)),
  country: csv(z.string().max(100)),
  favoritesOnly: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
  sort: shirtSortFieldSchema.default('createdAt'),
  direction: sortDirectionSchema.default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(60).default(24),
});
export type ShirtFilters = z.infer<typeof shirtFiltersSchema>;

export const collectionStatisticsSchema = z.object({
  totalShirts: z.number().int().nonnegative(),
  distinctCountries: z.number().int().nonnegative(),
  distinctClubs: z.number().int().nonnegative(),
  distinctLeagues: z.number().int().nonnegative(),
  byKind: z.array(z.object({ label: shirtKindSchema, count: z.number().int().nonnegative() })),
  byKit: z.array(z.object({ label: shirtKitSchema, count: z.number().int().nonnegative() })),
  bySize: z.array(z.object({ label: shirtSizeSchema, count: z.number().int().nonnegative() })),
  byColor: z.array(z.object({ label: shirtColorSchema, count: z.number().int().nonnegative() })),
  topClubs: z.array(z.object({ label: z.string(), count: z.number().int().nonnegative() })),
  topCountries: z.array(z.object({ label: z.string(), count: z.number().int().nonnegative() })),
  topLeagues: z.array(z.object({ label: z.string(), count: z.number().int().nonnegative() })),
  topPlayers: z.array(z.object({ label: z.string(), count: z.number().int().nonnegative() })),
  byDecade: z.array(z.object({ label: z.string(), count: z.number().int().nonnegative() })),
});
export type CollectionStatistics = z.infer<typeof collectionStatisticsSchema>;
