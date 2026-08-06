import { describe, expect, it } from 'vitest';
import { createShirtSchema, seasonSchema, shirtTitle } from './shirt';

describe('seasonSchema', () => {
  it.each(['2023', '2016/2017', '1999/2000'])('accepts %s', (season) => {
    expect(seasonSchema.parse(season)).toBe(season);
  });

  it.each(['2016/2018', '2016/2016', '2017/2016'])('rejects non-consecutive %s', (season) => {
    expect(seasonSchema.safeParse(season).success).toBe(false);
  });

  it.each(['16/17', '2016-2017', 'temporada', '', '20166'])('rejects malformed %s', (season) => {
    expect(seasonSchema.safeParse(season).success).toBe(false);
  });

  it('rejects years before 1900', () => {
    expect(seasonSchema.safeParse('1899').success).toBe(false);
  });

  it('trims surrounding whitespace', () => {
    expect(seasonSchema.parse('  2023  ')).toBe('2023');
  });
});

const validShirt = {
  kind: 'club' as const,
  club: 'Celta de Vigo',
  league: 'La Liga',
  country: 'España',
  season: '2016/2017',
  kit: 'home' as const,
  size: 'L' as const,
  playerName: 'Iago Aspas',
  squadNumber: 10,
  colors: ['lightBlue' as const],
  notes: null,
  isFavorite: false,
  imageUploadId: '3f1a9d2e-5b7c-4a1e-9d3f-2c8b6a4e1f70',
};

describe('createShirtSchema', () => {
  it('accepts a complete club shirt', () => {
    expect(createShirtSchema.parse(validShirt).club).toBe('Celta de Vigo');
  });

  it('requires a club when the shirt is a club shirt', () => {
    const result = createShirtSchema.safeParse({ ...validShirt, club: null });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['club']);
    }
  });

  it('allows a national shirt without a club', () => {
    const result = createShirtSchema.safeParse({ ...validShirt, kind: 'national', club: null });
    expect(result.success).toBe(true);
  });

  it('normalises empty optional strings to null', () => {
    expect(createShirtSchema.parse({ ...validShirt, kind: 'national', league: '   ' }).league).toBe(
      null,
    );
  });

  it('requires at least one colour', () => {
    expect(createShirtSchema.safeParse({ ...validShirt, colors: [] }).success).toBe(false);
  });

  it('rejects squad numbers outside 0-99', () => {
    expect(createShirtSchema.safeParse({ ...validShirt, squadNumber: 100 }).success).toBe(false);
    expect(createShirtSchema.safeParse({ ...validShirt, squadNumber: -1 }).success).toBe(false);
  });

  it('rejects an upload id that is not a uuid', () => {
    expect(createShirtSchema.safeParse({ ...validShirt, imageUploadId: 'nope' }).success).toBe(
      false,
    );
  });

  it('rejects unknown colours', () => {
    expect(createShirtSchema.safeParse({ ...validShirt, colors: ['turquesa'] }).success).toBe(false);
  });
});

describe('shirtTitle', () => {
  it('uses the club for club shirts', () => {
    expect(
      shirtTitle({ kind: 'club', club: 'Boca Juniors', country: 'Argentina', season: '2007/2008' }),
    ).toBe('Boca Juniors 2007/2008');
  });

  it('uses the country for national shirts', () => {
    expect(shirtTitle({ kind: 'national', club: null, country: 'Italia', season: '1994' })).toBe(
      'Italia 1994',
    );
  });

  it('falls back to the country when a club shirt has no club', () => {
    expect(shirtTitle({ kind: 'club', club: null, country: 'Brasil', season: '2002' })).toBe(
      'Brasil 2002',
    );
  });
});
