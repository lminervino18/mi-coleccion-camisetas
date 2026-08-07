import { expect, test } from '@playwright/test';
import { SEED_USER, signIn, uniqueUser } from './support';

const login = (request: import('@playwright/test').APIRequestContext, password: string) =>
  request.post('/api/auth/login', {
    data: { username: SEED_USER.username, password },
    failOnStatusCode: false,
  });

test.describe('rate limiting', () => {
  // The account limiter counts failures only; a legitimate user signing in from several
  // devices must never be locked out by their own successful logins.
  test('repeated successful logins are never throttled', async ({ request }) => {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const response = await login(request, SEED_USER.password);
      expect(response.status(), `intento ${String(attempt + 1)}`).toBe(200);
    }
  });

  test('repeated failures against one account are eventually refused', async ({ request }) => {
    const statuses: number[] = [];
    for (let attempt = 0; attempt < 14; attempt += 1) {
      statuses.push((await login(request, `mal-${String(attempt)}`)).status());
    }

    expect(statuses).toContain(401);
    expect(statuses).toContain(429);
  });
});

test.describe('authorisation', () => {
  test('an anonymous request cannot list a collection', async ({ request }) => {
    const response = await request.get('/api/shirts', { failOnStatusCode: false });
    expect(response.status()).toBe(401);
  });

  test('an anonymous request cannot read a profile', async ({ request }) => {
    const response = await request.get('/api/profile', { failOnStatusCode: false });
    expect(response.status()).toBe(401);
  });

  test('a signed-in user cannot reach another account shirt', async ({ page }) => {
    await signIn(page);
    const mine = await page.request.get('/api/shirts');
    const shirtId = ((await mine.json()) as { items: { id: string }[] }).items[0]?.id ?? '';

    const other = await page.context().browser()?.newContext();
    if (other === undefined) throw new Error('Could not open a second context.');
    const otherPage = await other.newPage();

    const intruder = uniqueUser('intruso');
    await otherPage.goto('/registro');
    await otherPage.fill('input[name=username]', intruder.username);
    await otherPage.fill('input[name=email]', intruder.email);
    await otherPage.fill('input[name=password]', intruder.password);
    await otherPage.click('button[type=submit]');
    await otherPage.waitForURL('**/coleccion');

    const stolen = await otherPage.request.get(`/api/shirts/${shirtId}`, {
      failOnStatusCode: false,
    });
    expect(stolen.status()).toBe(404);

    const deleted = await otherPage.request.delete(`/api/shirts/${shirtId}`, {
      failOnStatusCode: false,
    });
    expect(deleted.status()).toBe(404);

    await other.close();
  });
});

test.describe('input validation', () => {
  test('an oversized image is refused before any upload happens', async ({ page }) => {
    await signIn(page);
    const response = await page.request.post('/api/uploads', {
      data: { contentType: 'image/jpeg', byteSize: 50 * 1024 * 1024 },
      failOnStatusCode: false,
    });

    expect(response.status()).toBe(400);
    expect(await response.text()).toContain('10 MB');
  });

  test('an unsupported file type is refused', async ({ page }) => {
    await signIn(page);
    const response = await page.request.post('/api/uploads', {
      data: { contentType: 'application/x-msdownload', byteSize: 1024 },
      failOnStatusCode: false,
    });

    expect(response.status()).toBe(400);
  });

  test('a role sent in the body cannot escalate the account', async ({ page }) => {
    await signIn(page);
    const response = await page.request.put('/api/profile', {
      data: {
        username: SEED_USER.username,
        email: 'lminervino18@example.com',
        displayName: null,
        bio: null,
        favoriteClub: null,
        country: null,
        collectingSince: null,
        role: 'ADMIN',
      },
      failOnStatusCode: false,
    });

    expect(response.status()).toBe(200);
    expect(await response.text()).not.toContain('ADMIN');
  });
});

test('security headers are present on every response', async ({ request }) => {
  const response = await request.get('/');
  const headers = response.headers();

  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
});
