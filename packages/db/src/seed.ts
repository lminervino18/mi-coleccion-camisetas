import { hash } from '@node-rs/argon2';
import { createDatabase } from './index';
import * as schema from './schema';

const connectionString = process.env['DATABASE_URL'];
if (connectionString === undefined) throw new Error('DATABASE_URL is required to seed.');

if (process.env['NODE_ENV'] === 'production') {
  throw new Error('Refusing to seed a production database.');
}

const SHIRTS = [
  [
    'club',
    'Celta de Vigo',
    'La Liga',
    'España',
    '2016/2017',
    'home',
    'L',
    'Iago Aspas',
    10,
    ['lightBlue', 'white'],
  ],
  [
    'club',
    'Boca Juniors',
    'Liga Profesional',
    'Argentina',
    '2007/2008',
    'away',
    'M',
    'Riquelme',
    10,
    ['yellow', 'navy'],
  ],
  [
    'club',
    'Borussia Dortmund',
    'Bundesliga',
    'Alemania',
    '2000/2001',
    'home',
    'L',
    'Haaland',
    9,
    ['yellow', 'black'],
  ],
  [
    'national',
    null,
    null,
    'Argentina',
    '1986',
    'home',
    'M',
    'Maradona',
    10,
    ['lightBlue', 'white'],
  ],
  ['national', null, null, 'Brasil', '2002', 'home', 'L', 'Ronaldo', 9, ['yellow', 'green']],
  [
    'club',
    'Lamadrid',
    'Primera C',
    'Argentina',
    '2001/2002',
    'home',
    'XL',
    null,
    null,
    ['navy', 'red'],
  ],
  ['club', 'Escocia', null, 'Escocia', '2023', 'home', 'M', null, null, ['navy']],
  ['national', null, null, 'Italia', '1994', 'away', 'S', 'Baggio', 10, ['blue', 'white']],
] as const;

const db = createDatabase(connectionString);

const [user] = await db
  .insert(schema.users)
  .values({
    username: 'coleccionista',
    email: 'coleccionista@example.com',
    passwordHash: await hash('una-contrasena-larga', {
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    }),
    displayName: 'Coleccionista',
  })
  .returning({ id: schema.users.id });

if (user === undefined) throw new Error('Could not create the seed user.');

for (const [
  kind,
  club,
  league,
  country,
  season,
  kit,
  size,
  playerName,
  squadNumber,
  colors,
] of SHIRTS) {
  const [upload] = await db
    .insert(schema.imageUploads)
    .values({
      userId: user.id,
      objectKey: `shirts/${user.id}/seed-${season.replace('/', '-')}-${country}`,
      contentType: 'image/webp',
      byteSize: 1024,
      width: 800,
      height: 1000,
      status: 'confirmed',
    })
    .returning({ objectKey: schema.imageUploads.objectKey });

  if (upload === undefined) continue;

  const [shirt] = await db
    .insert(schema.shirts)
    .values({
      userId: user.id,
      kind,
      club,
      league,
      country,
      season,
      kit,
      size,
      playerName,
      squadNumber,
      imageKey: upload.objectKey,
      imageWidth: 800,
      imageHeight: 1000,
    })
    .returning({ id: schema.shirts.id });

  if (shirt === undefined) continue;
  await db.insert(schema.shirtColors).values(colors.map((color) => ({ shirtId: shirt.id, color })));
}

console.warn(`Seeded ${String(SHIRTS.length)} shirts for "coleccionista".`);
process.exit(0);
