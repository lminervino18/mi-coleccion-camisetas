import { randomUUID } from 'node:crypto';
import { hash } from '@node-rs/argon2';
import { createDatabase } from './index';
import * as schema from './schema';
import { storeSeedImage } from './seed-images';

const connectionString = process.env['DATABASE_URL'];
if (connectionString === undefined) throw new Error('DATABASE_URL is required to seed.');

if (process.env['NODE_ENV'] === 'production') {
  throw new Error('Refusing to seed a production database.');
}

const ACCOUNT = {
  username: 'lminervino18',
  email: 'lminervino18@example.com',
  password: 'Hermanis123',
  displayName: 'Lorenzo',
  favoriteClub: 'Boca Juniors',
  country: 'Argentina',
  collectingSince: 2012,
  bio: 'Colecciono camisetas desde chico. Cada una tiene su historia.',
};

type SeedShirt = {
  kind: 'club' | 'national';
  club: string | null;
  league: string | null;
  country: string;
  season: string;
  kit: 'home' | 'away' | 'third' | 'goalkeeper' | 'special';
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  playerName: string | null;
  squadNumber: number | null;
  colors: readonly (typeof schema.shirtColorEnum.enumValues)[number][];
  isFavorite: boolean;
  /** Search term used to find a freely licensed photograph on Wikimedia Commons. */
  photoQuery: string;
  fallbackColors: readonly string[];
};

const SHIRTS: readonly SeedShirt[] = [
  {
    kind: 'national',
    club: null,
    league: null,
    country: 'Argentina',
    season: '1986',
    kit: 'home',
    size: 'M',
    playerName: 'Maradona',
    squadNumber: 10,
    colors: ['lightBlue', 'white'],
    isFavorite: true,
    photoQuery: 'Argentina national football team jersey',
    fallbackColors: ['#7cb5e3', '#f5f5f5'],
  },
  {
    kind: 'club',
    club: 'Boca Juniors',
    league: 'Liga Profesional',
    country: 'Argentina',
    season: '2007/2008',
    kit: 'home',
    size: 'M',
    playerName: 'Riquelme',
    squadNumber: 10,
    colors: ['navy', 'yellow'],
    isFavorite: true,
    photoQuery: 'Boca Juniors jersey',
    fallbackColors: ['#1a237e', '#fbc02d'],
  },
  {
    kind: 'club',
    club: 'River Plate',
    league: 'Liga Profesional',
    country: 'Argentina',
    season: '2018',
    kit: 'home',
    size: 'L',
    playerName: null,
    squadNumber: null,
    colors: ['white', 'red'],
    isFavorite: false,
    photoQuery: 'River Plate jersey',
    fallbackColors: ['#f5f5f5', '#d32f2f'],
  },
  {
    kind: 'national',
    club: null,
    league: null,
    country: 'Brasil',
    season: '2002',
    kit: 'home',
    size: 'L',
    playerName: 'Ronaldo',
    squadNumber: 9,
    colors: ['yellow', 'green'],
    isFavorite: false,
    photoQuery: 'Brazil national football team shirt',
    fallbackColors: ['#fbc02d', '#2e7d32'],
  },
  {
    kind: 'club',
    club: 'Celta de Vigo',
    league: 'La Liga',
    country: 'España',
    season: '2016/2017',
    kit: 'home',
    size: 'L',
    playerName: 'Iago Aspas',
    squadNumber: 10,
    colors: ['lightBlue', 'white'],
    isFavorite: false,
    photoQuery: 'Celta de Vigo shirt',
    fallbackColors: ['#7cb5e3', '#f5f5f5'],
  },
  {
    kind: 'club',
    club: 'Borussia Dortmund',
    league: 'Bundesliga',
    country: 'Alemania',
    season: '2012/2013',
    kit: 'home',
    size: 'L',
    playerName: 'Lewandowski',
    squadNumber: 9,
    colors: ['yellow', 'black'],
    isFavorite: false,
    photoQuery: 'Borussia Dortmund jersey',
    fallbackColors: ['#fbc02d', '#1a1a1a'],
  },
  {
    kind: 'national',
    club: null,
    league: null,
    country: 'Italia',
    season: '1994',
    kit: 'away',
    size: 'S',
    playerName: 'Baggio',
    squadNumber: 10,
    colors: ['blue', 'white'],
    isFavorite: false,
    photoQuery: 'Italy national football team shirt',
    fallbackColors: ['#1976d2', '#f5f5f5'],
  },
  {
    kind: 'club',
    club: 'Ajax',
    league: 'Eredivisie',
    country: 'Países Bajos',
    season: '1995',
    kit: 'home',
    size: 'M',
    playerName: null,
    squadNumber: null,
    colors: ['white', 'red'],
    isFavorite: false,
    photoQuery: 'Ajax Amsterdam jersey',
    fallbackColors: ['#f5f5f5', '#d32f2f'],
  },
  {
    kind: 'club',
    club: 'Lamadrid',
    league: 'Primera C',
    country: 'Argentina',
    season: '2001/2002',
    kit: 'home',
    size: 'XL',
    playerName: null,
    squadNumber: null,
    colors: ['navy', 'red'],
    isFavorite: false,
    photoQuery: 'amateur football shirt collection',
    fallbackColors: ['#1a237e', '#d32f2f'],
  },
  {
    kind: 'national',
    club: null,
    league: null,
    country: 'Escocia',
    season: '2023',
    kit: 'home',
    size: 'M',
    playerName: null,
    squadNumber: null,
    colors: ['navy'],
    isFavorite: false,
    photoQuery: 'Scotland national football team shirt',
    fallbackColors: ['#1a237e', '#101840'],
  },
];

const db = createDatabase(connectionString);

const [user] = await db
  .insert(schema.users)
  .values({
    username: ACCOUNT.username,
    email: ACCOUNT.email,
    passwordHash: await hash(ACCOUNT.password, {
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    }),
    displayName: ACCOUNT.displayName,
    bio: ACCOUNT.bio,
    favoriteClub: ACCOUNT.favoriteClub,
    country: ACCOUNT.country,
    collectingSince: ACCOUNT.collectingSince,
  })
  .returning({ id: schema.users.id });

if (user === undefined) throw new Error('Could not create the seed user.');

let stored = 0;

for (const shirt of SHIRTS) {
  const objectKey = `shirts/${user.id}/${randomUUID()}`;
  const image = await storeSeedImage(objectKey, shirt.photoQuery, shirt.fallbackColors);

  const [row] = await db
    .insert(schema.shirts)
    .values({
      userId: user.id,
      kind: shirt.kind,
      club: shirt.club,
      league: shirt.league,
      country: shirt.country,
      season: shirt.season,
      kit: shirt.kit,
      size: shirt.size,
      playerName: shirt.playerName,
      squadNumber: shirt.squadNumber,
      notes: image.attribution,
      isFavorite: shirt.isFavorite,
      imageKey: objectKey,
      imageWidth: image.width,
      imageHeight: image.height,
    })
    .returning({ id: schema.shirts.id });

  if (row === undefined) continue;

  await db
    .insert(schema.shirtColors)
    .values(shirt.colors.map((color) => ({ shirtId: row.id, color })));

  stored += 1;
  console.warn(`  ${String(stored)}/${String(SHIRTS.length)} ${shirt.club ?? shirt.country}`);
}

console.warn(`\nSeeded ${String(stored)} shirts for "${ACCOUNT.username}".`);
console.warn(`Sign in with ${ACCOUNT.username} / ${ACCOUNT.password}`);
process.exit(0);
