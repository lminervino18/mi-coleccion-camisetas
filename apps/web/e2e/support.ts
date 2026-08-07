import type { Page } from '@playwright/test';

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

export const register = async (page: Page, user: ReturnType<typeof uniqueUser>) => {
  await page.goto('/registro');
  await page.fill('input[name=username]', user.username);
  await page.fill('input[name=email]', user.email);
  await page.fill('input[name=password]', user.password);
  await page.click('button[type=submit]');
  await page.waitForURL('**/coleccion');
};
