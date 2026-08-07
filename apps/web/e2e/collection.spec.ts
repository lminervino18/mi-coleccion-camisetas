import { expect, test } from '@playwright/test';
import { signIn } from './support';

test.beforeEach(async ({ page }) => {
  await signIn(page);
});

test('filters survive a reload and the back button', async ({ page }) => {
  const cards = page.locator('ul a[href^="/camiseta/"]');
  const total = await cards.count();

  await page.getByRole('button', { name: 'Selección' }).click();
  await expect(page).toHaveURL(/kind=national/);
  const filtered = await cards.count();
  expect(filtered).toBeLessThan(total);

  await page.reload();
  expect(await cards.count()).toBe(filtered);

  await page.goBack();
  await expect.poll(() => cards.count()).toBe(total);
});

test('a search with no results explains itself', async ({ page }) => {
  await page.fill('input[name=search]', 'equipoquenoexiste');
  await page.press('input[name=search]', 'Enter');

  await expect(page.getByRole('heading', { name: 'Ninguna camiseta coincide' })).toBeVisible();
});

test('opening a shirt shows its own page title', async ({ page }) => {
  await page.locator('ul a[href^="/camiseta/"]').first().click();
  await page.waitForURL(/\/camiseta\/[0-9a-f-]{36}$/);
  await expect(page).toHaveTitle(/· Mi Colección de Camisetas$/);
});

test('the statistics page renders every card', async ({ page }) => {
  await page.getByRole('link', { name: 'Estadísticas' }).click();
  await page.waitForURL('**/estadisticas');

  await expect(page.getByRole('heading', { name: 'Jugadores' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Clubes', exact: true })).toBeVisible();
});

test('no page scrolls horizontally', async ({ page }) => {
  for (const path of ['/coleccion', '/estadisticas', '/perfil', '/compartir', '/camiseta/nueva']) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow, `${path} desborda horizontalmente`).toBe(false);
  }
});
