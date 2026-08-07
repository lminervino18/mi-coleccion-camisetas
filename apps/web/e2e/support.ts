import { test, type Page } from '@playwright/test';

export const SEED_USER = { username: 'lminervino18', password: 'Hermanis123' };

export const uniqueUser = (prefix: string) => {
  const suffix = Math.random().toString(36).slice(2, 8);
  return {
    username: `${prefix}${suffix}`,
    email: `${prefix}${suffix}@example.com`,
    password: 'una-contrasena-larga',
  };
};

export const signIn = async (page: Page, user = SEED_USER) => {
  await page.goto('/');
  await page.fill('input[name=username]', user.username);
  await page.fill('input[name=password]', user.password);
  await page.click('button[type=submit]');
  await page.waitForURL('**/coleccion');
};

/**
 * Creating accounts is rate limited per address, and the behaviour does not depend on the
 * viewport, so the tests that need a fresh account only run on the desktop project.
 */
export const skipUnlessDesktop = () => {
  test.skip(test.info().project.name !== 'chromium', 'solo se verifica en escritorio');
};

export const register = async (page: Page, user: ReturnType<typeof uniqueUser>) => {
  await page.goto('/registro');
  await page.fill('input[name=username]', user.username);
  await page.fill('input[name=email]', user.email);
  await page.fill('input[name=password]', user.password);
  await page.click('button[type=submit]');
  await page.waitForURL('**/coleccion');
};
