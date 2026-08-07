import { expect, test } from '@playwright/test';
import { signIn } from './support';

/**
 * Snapshots only run on the desktop project: the value is catching unintended style changes, and
 * three sets of baselines per screen would triple the maintenance for the same signal.
 */
test.beforeEach(() => {
  test.skip(test.info().project.name !== 'chromium', 'las referencias son de escritorio');
});

const stableOptions = {
  // The mosaic drifts and the shirt photographs differ per seed run, so both are hidden.
  mask: [] as never[],
  animations: 'disabled' as const,
  // Tight on purpose: at 2% a full brand-colour change slipped through unnoticed.
  maxDiffPixelRatio: 0.001,
};

test.describe('anonymous screens', () => {
  for (const [name, path] of [
    ['inicio', '/'],
    ['registro', '/registro'],
    ['recuperar', '/recuperar'],
    ['no-encontrado', '/ruta-inexistente'],
    ['enlace-vencido', '/c/token-invalido'],
  ] as const) {
    test(`${name} looks unchanged`, async ({ page }) => {
      await page.goto(path);
      await page.addStyleTag({
        content: '.mosaic-column { animation: none !important; visibility: hidden !important; }',
      });
      await expect(page).toHaveScreenshot(`${name}.png`, stableOptions);
    });
  }
});

test.describe('signed-in screens', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  for (const [name, path] of [
    ['estadisticas', '/estadisticas'],
    ['perfil', '/perfil'],
    ['compartir', '/compartir'],
    ['camiseta-nueva', '/camiseta/nueva'],
  ] as const) {
    test(`${name} looks unchanged`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveScreenshot(`${name}.png`, stableOptions);
    });
  }
});
