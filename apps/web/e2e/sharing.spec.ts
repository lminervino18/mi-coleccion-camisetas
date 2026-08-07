import { expect, test } from '@playwright/test';
import { signIn } from './support';

const createShareLink = async (page: import('@playwright/test').Page) => {
  await page.goto('/compartir');
  await page.getByRole('button', { name: 'Generar enlace' }).click();
  const field = page.getByLabel('Enlace para compartir');
  await expect(field).toBeVisible();
  return field.inputValue();
};

test('a share link opens without an account and carries social preview tags', async ({
  page,
  context,
}) => {
  await signIn(page);
  const url = await createShareLink(page);

  const anonymous = await context.browser()?.newContext();
  if (anonymous === undefined) throw new Error('Could not open an anonymous context.');
  const visitor = await anonymous.newPage();

  await visitor.goto(url);
  await expect(visitor.getByRole('heading', { level: 1 })).toContainText('La colección de');

  const ogTitle = await visitor.locator('meta[property="og:title"]').getAttribute('content');
  const ogImage = await visitor.locator('meta[property="og:image"]').getAttribute('content');
  expect(ogTitle).toContain('La colección de');
  expect(ogImage).toMatch(/^https?:\/\//);

  await anonymous.close();
});

test('a revoked link stops working immediately', async ({ page, context }) => {
  await signIn(page);
  const url = await createShareLink(page);

  await page.reload();
  const listedLinks = page.locator('section:has-text("Enlaces activos") li');
  for (let remaining = await listedLinks.count(); remaining > 0; remaining -= 1) {
    await page.getByRole('button', { name: 'Revocar' }).first().click();
    await page.getByRole('button', { name: 'Revocar', exact: true }).last().click();
    await expect.poll(() => listedLinks.count()).toBe(remaining - 1);
  }
  await expect(page.getByText('Todavía no generaste ninguno.')).toBeVisible();

  const anonymous = await context.browser()?.newContext();
  if (anonymous === undefined) throw new Error('Could not open an anonymous context.');
  const visitor = await anonymous.newPage();

  await visitor.goto(url);
  await expect(visitor.getByRole('heading', { level: 1 })).toContainText('ya no está disponible');

  await anonymous.close();
});

test('an invented token shows the unavailable page, not an empty collection', async ({ page }) => {
  await page.goto('/c/token-que-no-existe');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('ya no está disponible');
});

test('the public view never exposes the owner email', async ({ page, context }) => {
  await signIn(page);
  const url = await createShareLink(page);

  const anonymous = await context.browser()?.newContext();
  if (anonymous === undefined) throw new Error('Could not open an anonymous context.');
  const visitor = await anonymous.newPage();

  await visitor.goto(url);
  const html = await visitor.content();
  expect(html).not.toContain('@example.com');

  await anonymous.close();
});
