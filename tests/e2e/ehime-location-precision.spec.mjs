import { test, expect } from '@playwright/test';

const EXTERNAL_GEO_HOSTS = ['geolonia.github.io', 'nlftp.mlit.go.jp'];

function observeRuntime(page) {
  const consoleErrors = [];
  const pageErrors = [];
  const externalGeoRequests = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.hostname !== '127.0.0.1' && (EXTERNAL_GEO_HOSTS.includes(url.hostname) || /\.(geo)?json$/i.test(url.pathname))) externalGeoRequests.push(request.url());
  });
  return { consoleErrors, pageErrors, externalGeoRequests };
}

async function enterMap(page, query = '') {
  await page.goto(`/ehime.html${query}`);
  await page.getByRole('button', { name: 'スキップ' }).click();
  await page.getByRole('button', { name: '地図', exact: true }).click();
}

test('desktop: 11伝承markerはPhase A common projectionとPhase B precision metadataを使う', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  const runtime = observeRuntime(page);
  await enterMap(page);

  const map = page.locator('#ehimeMap');
  await expect(map).toHaveAttribute('data-geographic-source', 'local-n03-2026');
  await expect(map).toHaveAttribute('data-legend-geography-phase', 'B');
  await expect(map).toHaveAttribute('data-legend-count', '11');
  const layer = map.locator('.generated-map-marker-layer');
  await expect(layer).toHaveAttribute('data-projection', 'phase-a-common');
  await expect(layer).toHaveAttribute('data-location-model', 'phase-b-precision');

  const markers = layer.locator('.map-marker');
  await expect(markers).toHaveCount(11);
  const state = await markers.evaluateAll((nodes) => nodes.map((node) => ({
    id: node.dataset.legendId,
    precision: node.dataset.locationPrecision,
    role: node.dataset.coordinateRole,
    source: node.dataset.projectionSource,
    x: Number(node.dataset.projectedX),
    y: Number(node.dataset.projectedY),
    left: parseFloat(node.style.left),
    top: parseFloat(node.style.top)
  })));
  expect(new Set(state.map((item) => item.id)).size).toBe(11);
  for (const item of state) {
    expect(item.precision).toBeTruthy();
    expect(item.role).toBeTruthy();
    expect(item.source).toBe('local-n03-2026');
    expect(Number.isFinite(item.x)).toBe(true);
    expect(Number.isFinite(item.y)).toBe(true);
    expect(item.left).toBeGreaterThanOrEqual(0);
    expect(item.left).toBeLessThanOrEqual(100);
    expect(item.top).toBeGreaterThanOrEqual(0);
    expect(item.top).toBeLessThanOrEqual(100);
  }
  expect(state.find((item) => item.id === 'uwakai_sea_mystery_cluster')?.precision).toBe('marine');
  expect(state.find((item) => item.id === 'iyo_basan_cluster')?.precision).toBe('broad_historical_area');
  expect(state.find((item) => item.id === 'matsuyama_tanuki_cluster')?.precision).toBe('multiple_locations');
  expect(runtime.externalGeoRequests).toEqual([]);
  expect(runtime.pageErrors).toEqual([]);
  expect(runtime.consoleErrors).toEqual([]);
  await page.screenshot({ path: 'test-results/ehime-phase-b-desktop.png', fullPage: true });
});

test('geoDebug: Phase A 20 anchorsとPhase B 11 legend anchorsを同一SVGで表示する', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  const runtime = observeRuntime(page);
  await enterMap(page, '?geoDebug=1');
  const debug = page.locator('#ehimeMap .ehime-geo-debug');
  await expect(debug).toHaveAttribute('data-phase', 'A');
  await expect(debug).toHaveAttribute('data-location-phase', 'B');
  await expect(debug).toHaveAttribute('data-municipality-count', '20');
  await expect(debug).toHaveAttribute('data-legend-count', '11');
  await expect(debug.locator('.ehime-hall-anchor')).toHaveCount(20);
  await expect(debug.locator('.ehime-legend-geo-anchor')).toHaveCount(11);
  await expect(page.locator('#mapLegendList .map-debug-list__item')).toHaveCount(20);
  await expect(page.locator('#mapLegendList .map-debug-list__legend')).toHaveCount(11);
  await expect(debug.locator('[data-legend-id="uwakai_sea_mystery_cluster"]')).toHaveAttribute('data-location-precision', 'marine');
  await expect(debug.locator('[data-legend-id="ishizuchi_tengu_cluster"]')).toHaveAttribute('data-coordinate-role', 'site_anchor');
  expect(runtime.externalGeoRequests).toEqual([]);
  expect(runtime.pageErrors).toEqual([]);
  expect(runtime.consoleErrors).toEqual([]);
});

test('390px smartphone: Phase B markerとprecision UIはoverflowせずtouch操作を維持する', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 390, height: 844 });
  const runtime = observeRuntime(page);
  await enterMap(page);
  const map = page.locator('#ehimeMap');
  await expect(map).toHaveAttribute('data-legend-geography-phase', 'B');
  await expect(map.locator('.map-marker')).toHaveCount(11);
  const overflow = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
  const boxes = await map.locator('.map-marker').evaluateAll((nodes) => nodes.map((node) => {
    const r = node.getBoundingClientRect();
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
  }));
  for (const box of boxes) {
    expect(box.right).toBeGreaterThan(0);
    expect(box.left).toBeLessThan(390);
  }
  const marine = map.locator('[data-legend-id="uwakai_sea_mystery_cluster"]');
  await expect(marine).toBeVisible();
  await marine.click();
  await expect(page.locator('#detailDialog')).toBeVisible();
  const touchAction = await map.evaluate((element) => getComputedStyle(element).touchAction);
  expect(touchAction).not.toBe('none');
  expect(runtime.externalGeoRequests).toEqual([]);
  expect(runtime.pageErrors).toEqual([]);
  expect(runtime.consoleErrors).toEqual([]);
  await page.screenshot({ path: 'test-results/ehime-phase-b-smartphone-390.png', fullPage: true });
});
