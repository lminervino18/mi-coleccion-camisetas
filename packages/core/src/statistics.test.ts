import { beforeEach, describe, expect, it } from 'vitest';
import { collectionStatisticsSchema } from '@camisetas/contracts';
import { resetDatabase, testDb } from './test-support/database';
import { addShirt, createTestUser } from './test-support/factories';
import { calculateCollectionStatistics } from './statistics';

beforeEach(resetDatabase);

describe('calculateCollectionStatistics', () => {
  it('returns zeroed statistics for an empty collection', async () => {
    const user = await createTestUser();
    const stats = await calculateCollectionStatistics(testDb, user.id);

    expect(stats.totalShirts).toBe(0);
    expect(stats.topClubs).toEqual([]);
    expect(collectionStatisticsSchema.safeParse(stats).success).toBe(true);
  });

  it('matches the contract schema with real data', async () => {
    const user = await createTestUser();
    await addShirt(user.id);
    const stats = await calculateCollectionStatistics(testDb, user.id);

    expect(collectionStatisticsSchema.safeParse(stats).success).toBe(true);
  });

  it('counts distinct countries, clubs and leagues', async () => {
    const user = await createTestUser();
    await addShirt(user.id, { club: 'Celta de Vigo', country: 'España', league: 'La Liga' });
    await addShirt(user.id, { club: 'Boca Juniors', country: 'Argentina', league: 'Liga Pro' });
    await addShirt(user.id, { club: 'Celta de Vigo', country: 'España', league: 'La Liga' });

    const stats = await calculateCollectionStatistics(testDb, user.id);

    expect(stats.totalShirts).toBe(3);
    expect(stats.distinctCountries).toBe(2);
    expect(stats.distinctClubs).toBe(2);
    expect(stats.distinctLeagues).toBe(2);
  });

  it('never counts another user collection', async () => {
    const user = await createTestUser('duenio');
    const other = await createTestUser('otro');
    await addShirt(user.id);
    await addShirt(other.id);
    await addShirt(other.id);

    const stats = await calculateCollectionStatistics(testDb, user.id);
    expect(stats.totalShirts).toBe(1);
  });

  it('ranks clubs by frequency', async () => {
    const user = await createTestUser();
    await addShirt(user.id, { club: 'Boca Juniors' });
    await addShirt(user.id, { club: 'Boca Juniors' });
    await addShirt(user.id, { club: 'Celta de Vigo' });

    const stats = await calculateCollectionStatistics(testDb, user.id);
    expect(stats.topClubs[0]).toEqual({ label: 'Boca Juniors', count: 2 });
  });

  // The legacy stats screen computed this list and then dropped it before rendering,
  // so the players card was always empty.
  it('reports top players', async () => {
    const user = await createTestUser();
    await addShirt(user.id, { playerName: 'Riquelme' });
    await addShirt(user.id, { playerName: 'Riquelme' });
    await addShirt(user.id, { playerName: 'Aspas' });

    const stats = await calculateCollectionStatistics(testDb, user.id);
    expect(stats.topPlayers[0]).toEqual({ label: 'Riquelme', count: 2 });
  });

  it('ignores null clubs and players instead of counting them as a group', async () => {
    const user = await createTestUser();
    await addShirt(user.id, { kind: 'national', club: null, playerName: null });
    await addShirt(user.id, { club: 'Celta de Vigo', playerName: 'Aspas' });

    const stats = await calculateCollectionStatistics(testDb, user.id);

    expect(stats.topClubs).toHaveLength(1);
    expect(stats.topPlayers).toHaveLength(1);
    expect(stats.distinctClubs).toBe(1);
  });

  it('counts colours across the join table', async () => {
    const user = await createTestUser();
    await addShirt(user.id, { colors: ['red', 'white'] });
    await addShirt(user.id, { colors: ['red'] });

    const stats = await calculateCollectionStatistics(testDb, user.id);
    expect(stats.byColor.find((entry) => entry.label === 'red')?.count).toBe(2);
    expect(stats.byColor.find((entry) => entry.label === 'white')?.count).toBe(1);
  });

  it('groups seasons into decades using the starting year', async () => {
    const user = await createTestUser();
    await addShirt(user.id, { season: '1998/1999' });
    await addShirt(user.id, { season: '2016/2017' });

    const stats = await calculateCollectionStatistics(testDb, user.id);
    const labels = stats.byDecade.map((entry) => entry.label);

    expect(labels).toContain('1990s');
    expect(labels).toContain('2010s');
  });

  it('splits club and national shirts', async () => {
    const user = await createTestUser();
    await addShirt(user.id, { kind: 'club' });
    await addShirt(user.id, { kind: 'national', club: null });
    await addShirt(user.id, { kind: 'national', club: null });

    const stats = await calculateCollectionStatistics(testDb, user.id);
    expect(stats.byKind.find((entry) => entry.label === 'national')?.count).toBe(2);
    expect(stats.byKind.find((entry) => entry.label === 'club')?.count).toBe(1);
  });
});
