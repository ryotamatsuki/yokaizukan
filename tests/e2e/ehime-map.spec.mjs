import { test, expect } from '@playwright/test';

test('通常表示はPhase Aでも既存の生成背景地図を維持する', async ({ page }) => {
  await page.goto('/ehime.html');
  await page.getByRole('button', { name: 'スキップ' }).click();
  await page.getByRole('button', { name: '地図', exact: true }).click();

  await expect(page.locator('#ehimeMap .generated-map-image')).toBeVisible();
  await expect(page.locator('#ehimeMap .ehime-geo-debug')).toHaveCount(0);
  await expect(page.locator('#mapLegendList button')).toHaveCount(11);
});

test('mapDebug=1で20市町を同一投影したPhase A校正マップを表示する', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/ehime.html?mapDebug=1');
  await page.getByRole('button', { name: 'スキップ' }).click();
  await page.getByRole('button', { name: '地図', exact: true }).click();

  const debug = page.locator('#ehimeMap .ehime-geo-debug');
  await expect(debug).toBeVisible({ timeout: 30_000 });
  await expect(debug).toHaveAttribute('data-phase', 'A');

  const svg = debug.locator('svg.ehime-geo-debug__svg');
  await expect(svg).toHaveAttribute('viewBox', '0 0 1000 760');
  await expect(svg).toHaveAttribute('preserveAspectRatio', 'xMidYMid meet');
  await expect(svg.locator('.ehime-municipality-shape')).toHaveCount(20);
  await expect(svg.locator('.ehime-hall-anchor')).toHaveCount(20);
  await expect(page.locator('#mapLegendList .map-debug-list__item')).toHaveCount(20);

  const status = debug.locator('.ehime-geo-debug__status');
  await expect(status).toHaveAttribute('data-inside-count', '20', { timeout: 30_000 });
  await expect(status).toContainText('20/20');
});

test('390px幅でもPhase A校正マップと20市町リストを操作できる', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ehime.html?mapDebug=1');
  await page.getByRole('button', { name: 'スキップ' }).click();
  await page.getByRole('button', { name: '地図', exact: true }).click();

  const map = page.locator('#ehimeMap');
  await expect(map.locator('.ehime-geo-debug__svg')).toBeVisible({ timeout: 30_000 });
  const list = page.locator('#mapLegendList .map-debug-list__item');
  await expect(list).toHaveCount(20);

  const matsuyama = page.locator('#mapLegendList [data-municipality-code="38201"]');
  await matsuyama.click();
  await expect(matsuyama).toHaveClass(/is-debug-selected/);
  await expect(map.locator('.ehime-municipality-shape[data-municipality-code="38201"]')).toHaveClass(/is-debug-selected/);
  await expect(map.locator('.ehime-hall-anchor[data-municipality-code="38201"]')).toHaveClass(/is-debug-selected/);
});
