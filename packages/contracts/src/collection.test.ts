import { describe, expect, it } from 'vitest';
import { shirtFiltersSchema } from './collection';

describe('shirtFiltersSchema', () => {
  it('applies defaults when nothing is provided', () => {
    const filters = shirtFiltersSchema.parse({});
    expect(filters).toMatchObject({
      sort: 'createdAt',
      direction: 'desc',
      page: 1,
      pageSize: 24,
      favoritesOnly: false,
    });
    expect(filters.kind).toEqual([]);
  });

  it('splits comma separated values', () => {
    expect(shirtFiltersSchema.parse({ size: 'S,M,L' }).size).toEqual(['S', 'M', 'L']);
  });

  it('accepts repeated query parameters as an array', () => {
    expect(shirtFiltersSchema.parse({ kind: ['club', 'national'] }).kind).toEqual([
      'club',
      'national',
    ]);
  });

  it('drops empty segments produced by trailing commas', () => {
    expect(shirtFiltersSchema.parse({ size: 'S,,M,' }).size).toEqual(['S', 'M']);
  });

  it('rejects values outside the allowed set', () => {
    expect(shirtFiltersSchema.safeParse({ size: 'XXXL' }).success).toBe(false);
  });

  it('coerces pagination from strings', () => {
    const filters = shirtFiltersSchema.parse({ page: '3', pageSize: '12' });
    expect(filters.page).toBe(3);
    expect(filters.pageSize).toBe(12);
  });

  it('caps the page size to protect the database', () => {
    expect(shirtFiltersSchema.safeParse({ pageSize: '500' }).success).toBe(false);
  });

  it('rejects a page below one', () => {
    expect(shirtFiltersSchema.safeParse({ page: '0' }).success).toBe(false);
  });

  it('only treats the literal string true as enabling favourites', () => {
    expect(shirtFiltersSchema.parse({ favoritesOnly: 'true' }).favoritesOnly).toBe(true);
    expect(shirtFiltersSchema.parse({ favoritesOnly: 'false' }).favoritesOnly).toBe(false);
  });
});
