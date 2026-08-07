import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { signIn } from './support';

/** The level the project targets; anything below it is reported as a violation. */
const STANDARD = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/** Includes the offending selector so a failure points straight at the element. */
const scan = async (page: Page) => {
  const result = await new AxeBuilder({ page }).withTags(STANDARD).analyze();

  return result.violations.flatMap((violation) =>
    violation.nodes.map(
      (node) =>
        `${violation.id} (${violation.impact ?? 'sin impacto'}) en ${node.target.join(' ')} :: ${node.any[0]?.message ?? violation.help}`,
    ),
  );
};

test.describe('anonymous pages', () => {
  for (const [name, path] of [
    ['inicio', '/'],
    ['registro', '/registro'],
    ['recuperar contraseña', '/recuperar'],
    ['página no encontrada', '/ruta-inexistente'],
    ['enlace vencido', '/c/token-invalido'],
  ] as const) {
    test(`${name} has no accessibility violations`, async ({ page }) => {
      await page.goto(path);
      expect(await scan(page)).toEqual([]);
    });
  }
});

test.describe('signed-in pages', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  for (const [name, path] of [
    ['colección', '/coleccion'],
    ['estadísticas', '/estadisticas'],
    ['perfil', '/perfil'],
    ['compartir', '/compartir'],
    ['alta de camiseta', '/camiseta/nueva'],
  ] as const) {
    test(`${name} has no accessibility violations`, async ({ page }) => {
      await page.goto(path);
      expect(await scan(page)).toEqual([]);
    });
  }

  test('the delete dialog is reachable and labelled', async ({ page }) => {
    await page.goto('/coleccion');
    await page.locator('ul a[href^="/camiseta/"]').first().click();
    await page.waitForURL(/\/camiseta\/[0-9a-f-]{36}$/);

    await page.getByRole('button', { name: 'Eliminar' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    expect(await scan(page)).toEqual([]);
  });
});

test('the collection is operable with the keyboard alone', async ({ page }) => {
  await signIn(page);
  await page.goto('/coleccion');

  await page.keyboard.press('Tab');
  const firstStop = await page.evaluate(() => document.activeElement?.textContent?.trim());
  expect(firstStop).toContain('Saltar al contenido');

  // Every shirt must be reachable without a pointer; the legacy grid used mouse-only handlers.
  const reachable = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('ul a[href^="/camiseta/"]'));
    return cards.every((card) => (card as HTMLElement).tabIndex >= 0);
  });
  expect(reachable).toBe(true);
});
