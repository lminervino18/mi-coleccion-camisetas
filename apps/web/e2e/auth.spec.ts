import { expect, test } from '@playwright/test';
import { register, signIn, skipUnlessDesktop, uniqueUser, SEED_USER } from './support';

test('a visitor can register and lands on their collection', async ({ page }) => {
  skipUnlessDesktop();
  await register(page, uniqueUser('nuevo'));
  await expect(page).toHaveTitle(/Mi colección/);
});

test('an existing user can sign in and out', async ({ page }) => {
  await signIn(page);
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await page.waitForURL('/');
  await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
});

// The legacy login issued a token without ever comparing the password.
test('a wrong password is rejected', async ({ page }) => {
  await page.goto('/');
  await page.fill('input[name=username]', SEED_USER.username);
  await page.fill('input[name=password]', 'contrasena-incorrecta');
  await page.click('button[type=submit]');

  await expect(page.getByRole('alert').first()).toContainText('Usuario o contraseña incorrectos');
  await expect(page).toHaveURL('/');
});

test('the session cookie is not readable from JavaScript', async ({ page }) => {
  await signIn(page);
  const visible = await page.evaluate(() => document.cookie);
  expect(visible).not.toContain('camisetas_session');
});

test('a protected route redirects an anonymous visitor', async ({ page }) => {
  await page.goto('/coleccion');
  await expect(page).toHaveURL('/');
});

test('an unknown route shows the not found page', async ({ page }) => {
  await page.goto('/ruta-que-no-existe');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('No encontramos');
});

// Reuses the seeded name instead of registering a throwaway first: creating accounts is
// rate limited, and the suite runs across three viewports.
test('registering with a taken username reports the field', async ({ page }) => {
  skipUnlessDesktop();
  const fresh = uniqueUser('duplicado');

  await page.goto('/registro');
  await page.fill('input[name=username]', SEED_USER.username);
  await page.fill('input[name=email]', fresh.email);
  await page.fill('input[name=password]', fresh.password);
  await page.click('button[type=submit]');

  await expect(page.getByText('Ese nombre de usuario ya está en uso.')).toBeVisible();
});

test('the submit button locks while the request is in flight', async ({ page }) => {
  skipUnlessDesktop();
  const user = uniqueUser('doble');

  await page.route('**/api/auth/register', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await route.continue();
  });

  await page.goto('/registro');
  await page.fill('input[name=username]', user.username);
  await page.fill('input[name=email]', user.email);
  await page.fill('input[name=password]', user.password);

  const submit = page.getByRole('button', { name: 'Creando cuenta…' });
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(submit).toBeDisabled();
});
