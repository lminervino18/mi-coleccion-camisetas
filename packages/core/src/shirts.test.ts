import { beforeEach, describe, expect, it } from 'vitest';
import { shirtFiltersSchema } from '@camisetas/contracts';
import { schema } from '@camisetas/db';
import { resetDatabase, testDb } from './test-support/database';
import {
  addShirt,
  createPendingUpload,
  createTestUser,
  shirtInput,
} from './test-support/factories';
import {
  createShirt,
  deleteShirt,
  getCollectionFacets,
  getShirt,
  listShirts,
  toggleFavorite,
  updateShirt,
} from './shirts';

const filters = (overrides: Record<string, unknown> = {}) => shirtFiltersSchema.parse(overrides);

beforeEach(resetDatabase);

describe('createShirt', () => {
  it('stores the shirt with its colours', async () => {
    const user = await createTestUser();
    const shirt = await addShirt(user.id, { colors: ['lightBlue', 'white'] });

    expect(shirt.club).toBe('Celta de Vigo');
    expect(new Set(shirt.colors)).toEqual(new Set(['lightBlue', 'white']));
  });

  it('marks the claimed upload as confirmed', async () => {
    const user = await createTestUser();
    await addShirt(user.id);

    const [upload] = await testDb.select().from(schema.imageUploads);
    expect(upload?.status).toBe('confirmed');
  });

  it('refuses to reuse an upload already attached to another shirt', async () => {
    const user = await createTestUser();
    const imageUploadId = await createPendingUpload(user.id);

    await createShirt(testDb, user.id, { ...shirtInput(), imageUploadId });

    await expect(
      createShirt(testDb, user.id, { ...shirtInput(), imageUploadId }),
    ).rejects.toMatchObject({ code: 'conflict' });
  });

  it('refuses an upload belonging to another user', async () => {
    const owner = await createTestUser('duenio');
    const intruder = await createTestUser('intruso');
    const imageUploadId = await createPendingUpload(owner.id);

    await expect(
      createShirt(testDb, intruder.id, { ...shirtInput(), imageUploadId }),
    ).rejects.toMatchObject({ code: 'conflict' });
  });

  it('refuses an upload whose bytes were never received', async () => {
    const user = await createTestUser();
    const [row] = await testDb
      .insert(schema.imageUploads)
      .values({
        userId: user.id,
        objectKey: `uploads/${user.id}/sin-bytes.jpg`,
        contentType: 'image/jpeg',
        byteSize: 1024,
      })
      .returning({ id: schema.imageUploads.id });

    await expect(
      createShirt(testDb, user.id, { ...shirtInput(), imageUploadId: row?.id ?? '' }),
    ).rejects.toMatchObject({ code: 'conflict' });
  });

  it('leaves no shirt behind when the upload cannot be claimed', async () => {
    const user = await createTestUser();
    await expect(
      createShirt(testDb, user.id, {
        ...shirtInput(),
        imageUploadId: '11111111-1111-4111-8111-111111111111',
      }),
    ).rejects.toMatchObject({ code: 'conflict' });

    expect(await testDb.select().from(schema.shirts)).toHaveLength(0);
  });
});

describe('listShirts', () => {
  it('only returns shirts owned by the requesting user', async () => {
    const owner = await createTestUser('duenio');
    const other = await createTestUser('otro');
    await addShirt(owner.id);
    await addShirt(other.id, { club: 'Boca Juniors' });

    const page = await listShirts(testDb, owner.id, filters());

    expect(page.totalItems).toBe(1);
    expect(page.items[0]?.club).toBe('Celta de Vigo');
  });

  it('filters by size', async () => {
    const user = await createTestUser();
    await addShirt(user.id, { size: 'S' });
    await addShirt(user.id, { size: 'XL' });

    const page = await listShirts(testDb, user.id, filters({ size: 'XL' }));
    expect(page.items.map((shirt) => shirt.size)).toEqual(['XL']);
  });

  it('filters by colour through the join table', async () => {
    const user = await createTestUser();
    await addShirt(user.id, { colors: ['red'] });
    await addShirt(user.id, { colors: ['green', 'white'] });

    const page = await listShirts(testDb, user.id, filters({ color: 'green' }));
    expect(page.totalItems).toBe(1);
    expect(page.items[0]?.colors).toContain('green');
  });

  it('searches across club, country and player', async () => {
    const user = await createTestUser();
    await addShirt(user.id, { club: 'Boca Juniors', playerName: 'Riquelme' });
    await addShirt(user.id, { club: 'Celta de Vigo', playerName: 'Aspas' });

    expect((await listShirts(testDb, user.id, filters({ search: 'riquelme' }))).totalItems).toBe(1);
    expect((await listShirts(testDb, user.id, filters({ search: 'vigo' }))).totalItems).toBe(1);
  });

  it('returns favourites only when asked', async () => {
    const user = await createTestUser();
    await addShirt(user.id, { isFavorite: true, club: 'Boca Juniors' });
    await addShirt(user.id, { isFavorite: false });

    const page = await listShirts(testDb, user.id, filters({ favoritesOnly: 'true' }));
    expect(page.items.map((shirt) => shirt.club)).toEqual(['Boca Juniors']);
  });

  it('sorts sizes by garment order rather than alphabetically', async () => {
    const user = await createTestUser();
    for (const size of ['XL', 'S', 'M'] as const) await addShirt(user.id, { size });

    const page = await listShirts(testDb, user.id, filters({ sort: 'size', direction: 'asc' }));
    expect(page.items.map((shirt) => shirt.size)).toEqual(['S', 'M', 'XL']);
  });

  it('paginates and reports totals', async () => {
    const user = await createTestUser();
    for (let index = 0; index < 5; index += 1) await addShirt(user.id);

    const page = await listShirts(testDb, user.id, filters({ page: '2', pageSize: '2' }));

    expect(page.items).toHaveLength(2);
    expect(page.totalItems).toBe(5);
    expect(page.totalPages).toBe(3);
  });

  it('combines filters instead of replacing them', async () => {
    const user = await createTestUser();
    await addShirt(user.id, { size: 'L', kind: 'club' });
    await addShirt(user.id, { size: 'L', kind: 'national', club: null });
    await addShirt(user.id, { size: 'S', kind: 'national', club: null });

    const page = await listShirts(testDb, user.id, filters({ size: 'L', kind: 'national' }));
    expect(page.totalItems).toBe(1);
  });
});

describe('getCollectionFacets', () => {
  it('lists distinct leagues and countries in alphabetical order', async () => {
    const user = await createTestUser();
    await addShirt(user.id, { league: 'La Liga', country: 'España' });
    await addShirt(user.id, { league: 'Bundesliga', country: 'Alemania' });
    await addShirt(user.id, { league: 'La Liga', country: 'España' });

    const facets = await getCollectionFacets(testDb, user.id);

    expect(facets.leagues).toEqual(['Bundesliga', 'La Liga']);
    expect(facets.countries).toEqual(['Alemania', 'España']);
  });

  it('omits null leagues rather than listing an empty option', async () => {
    const user = await createTestUser();
    await addShirt(user.id, { kind: 'national', club: null, league: null, country: 'Brasil' });

    const facets = await getCollectionFacets(testDb, user.id);
    expect(facets.leagues).toEqual([]);
    expect(facets.countries).toEqual(['Brasil']);
  });

  it('never leaks values from another collection', async () => {
    const user = await createTestUser('duenio');
    const other = await createTestUser('otro');
    await addShirt(user.id, { league: 'La Liga', country: 'España' });
    await addShirt(other.id, { league: 'Serie A', country: 'Italia' });

    const facets = await getCollectionFacets(testDb, user.id);
    expect(facets.leagues).toEqual(['La Liga']);
    expect(facets.countries).toEqual(['España']);
  });
});

describe('getShirt', () => {
  it('refuses to return another user shirt', async () => {
    const owner = await createTestUser('duenio');
    const intruder = await createTestUser('intruso');
    const shirt = await addShirt(owner.id);

    await expect(getShirt(testDb, intruder.id, shirt.id)).rejects.toMatchObject({
      code: 'not_found',
    });
  });
});

describe('updateShirt', () => {
  it('replaces the colour set', async () => {
    const user = await createTestUser();
    const shirt = await addShirt(user.id, { colors: ['red', 'white'] });

    const updated = await updateShirt(testDb, user.id, shirt.id, {
      ...shirtInput({ colors: ['black'] }),
      imageUploadId: null,
    });

    expect(updated.colors).toEqual(['black']);
    const stored = await testDb.select().from(schema.shirtColors);
    expect(stored).toHaveLength(1);
  });

  it('keeps the existing image when no new upload is provided', async () => {
    const user = await createTestUser();
    const shirt = await addShirt(user.id);

    const updated = await updateShirt(testDb, user.id, shirt.id, {
      ...shirtInput({ club: 'Otro club' }),
      imageUploadId: null,
    });

    expect(updated.imageKey).toBe(shirt.imageKey);
  });

  it('refuses to update a shirt owned by someone else', async () => {
    const owner = await createTestUser('duenio');
    const intruder = await createTestUser('intruso');
    const shirt = await addShirt(owner.id);

    await expect(
      updateShirt(testDb, intruder.id, shirt.id, {
        ...shirtInput({ club: 'Robado' }),
        imageUploadId: null,
      }),
    ).rejects.toMatchObject({ code: 'not_found' });
  });
});

describe('deleteShirt', () => {
  it('removes the shirt and its colours', async () => {
    const user = await createTestUser();
    const shirt = await addShirt(user.id, { colors: ['red', 'white'] });

    const imageKey = await deleteShirt(testDb, user.id, shirt.id);

    expect(imageKey).toBe(shirt.imageKey);
    expect(await testDb.select().from(schema.shirts)).toHaveLength(0);
    expect(await testDb.select().from(schema.shirtColors)).toHaveLength(0);
  });

  it('refuses to delete another user shirt', async () => {
    const owner = await createTestUser('duenio');
    const intruder = await createTestUser('intruso');
    const shirt = await addShirt(owner.id);

    await expect(deleteShirt(testDb, intruder.id, shirt.id)).rejects.toMatchObject({
      code: 'not_found',
    });
    expect(await testDb.select().from(schema.shirts)).toHaveLength(1);
  });
});

describe('toggleFavorite', () => {
  it('flips the flag and returns the new value', async () => {
    const user = await createTestUser();
    const shirt = await addShirt(user.id, { isFavorite: false });

    expect(await toggleFavorite(testDb, user.id, shirt.id)).toBe(true);
    expect(await toggleFavorite(testDb, user.id, shirt.id)).toBe(false);
  });

  it('refuses a shirt owned by someone else', async () => {
    const owner = await createTestUser('duenio');
    const intruder = await createTestUser('intruso');
    const shirt = await addShirt(owner.id);

    await expect(toggleFavorite(testDb, intruder.id, shirt.id)).rejects.toMatchObject({
      code: 'not_found',
    });
  });
});
