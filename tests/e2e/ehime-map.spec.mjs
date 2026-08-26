import { test, expect } from '@playwright/test';

const LOCAL_GEOJSON = '/public/data/geo/ehime-municipalities.geojson';
const EXTERNAL_GEO_HOSTS = ['geolonia.github.io', 'nlftp.mlit.go.jp'];

function observeRuntime(page) {
  const consoleErrors = [];
  const pageErrors = [];
  const externalGeoRequests = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('request', (request) => {
    const url = new URL(request.url());
    const isExternalGeo = url.hostname !== '127.0.0.1'
      && (EXTERNAL_GEO_HOSTS.includes(url.hostname) || /\.(geo)?json$/i.test(url.pathname));
    if (isExternalGeo) externalGeoRequests.push(request.url());
  });

  return { consoleErrors, pageErrors, externalGeoRequests };
}

async function enterMap(page, query = '') {
  await page.goto(`/ehime.html${query}`);
  await page.getByRole('button', { name: 'スキップ' }).click();
  await page.getByRole('button', { name: '地図', exact: true }).click();
}

async function assertGeographicDebug(page) {
  const debug = page.locator('#ehimeMap .ehime-geo-debug');
  await expect(debug).toBeVisible({ timeout: 30_000 });
  await expect(debug).toHaveAttribute('data-phase', 'A');
  await expect(debug).toHaveAttribute('data-geojson-source', 'public/data/geo/ehime-municipalities.geojson');
  await expect(debug).toHaveAttribute('data-municipality-count', '20');
  await expect(page.locator('#ehimeMap')).toHaveAttribute('data-geographic-source', 'local-n03-2026');

  const svg = debug.locator('svg.ehime-geo-debug__svg');
  await expect(svg).toBeVisible();
  await expect(svg).toHaveAttribute('viewBox', '0 0 1000 760');
  await expect(svg).toHaveAttribute('preserveAspectRatio', 'xMidYMid meet');

  const municipalityGroups = svg.locator('.ehime-municipality-shape');
  const municipalityPaths = municipalityGroups.locator('path');
  const anchors = svg.locator('.ehime-hall-anchor');
  await expect(municipalityGroups).toHaveCount(20);
  await expect(municipalityPaths).toHaveCount(20);
  await expect(anchors).toHaveCount(20);
  await expect(page.locator('#mapLegendList .map-debug-list__item')).toHaveCount(20);

  const emptyPaths = await municipalityPaths.evaluateAll((paths) => paths.filter((path) => !(path.getAttribute('d') || '').trim()).length);
  expect(emptyPaths).toBe(0);

  const anchorState = await anchors.evaluateAll((nodes) => nodes.map((node) => ({
    code: node.dataset.municipalityCode,
    inside: node.dataset.anchorInside,
    x: Number(node.dataset.projectedX),
    y: Number(node.dataset.projectedY)
  })));
  expect(anchorState).toHaveLength(20);
  for (const anchor of anchorState) {
    expect(anchor.inside, `${anchor.code}: office anchor must be inside municipality`).toBe('true');
    expect(Number.isFinite(anchor.x), `${anchor.code}: projected x must be finite`).toBe(true);
    expect(Number.isFinite(anchor.y), `${anchor.code}: projected y must be finite`).toBe(true);
    expect(anchor.x, `${anchor.code}: projected x must stay within SVG`).toBeGreaterThanOrEqual(0);
    expect(anchor.x, `${anchor.code}: projected x must stay within SVG`).toBeLessThanOrEqual(1000);
    expect(anchor.y, `${anchor.code}: projected y must stay within SVG`).toBeGreaterThanOrEqual(0);
    expect(anchor.y, `${anchor.code}: projected y must stay within SVG`).toBeLessThanOrEqual(760);
  }

  const status = debug.locator('.ehime-geo-debug__status');
  await expect(status).toHaveAttribute('data-inside-count', '20');
  await expect(status).toContainText('20/20');

  for (const code of ['38201', '38202', '38203', '38213', '38356', '38386', '38442', '38506']) {
    await expect(svg.locator(`.ehime-municipality-shape[data-municipality-code="${code}"] path`)).toBeVisible();
    await expect(svg.locator(`.ehime-hall-anchor[data-municipality-code="${code}"]`)).toBeVisible();
  }

  return { debug, svg };
}

test('通常表示はPhase Aでも既存の生成背景地図と11伝承を維持する', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  const runtime = observeRuntime(page);
  await enterMap(page);

  await expect(page.locator('#ehimeMap .generated-map-image')).toBeVisible();
  await expect(page.locator('#ehimeMap .ehime-geo-debug')).toHaveCount(0);
  await expect(page.locator('#mapLegendList button')).toHaveCount(11);
  expect(runtime.pageErrors).toEqual([]);
  expect(runtime.consoleErrors).toEqual([]);
});

test('desktop: geoDebug=1はローカルN03とP05役場20件を共通projectionで描画する', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  const runtime = observeRuntime(page);
  const localGeoResponse = page.waitForResponse((response) => new URL(response.url()).pathname === LOCAL_GEOJSON);

  await enterMap(page, '?geoDebug=1');
  const response = await localGeoResponse;
  expect(response.ok()).toBe(true);
  expect(new URL(response.url()).hostname).toBe('127.0.0.1');
  await assertGeographicDebug(page);

  expect(runtime.externalGeoRequests).toEqual([]);
  expect(runtime.pageErrors).toEqual([]);
  expect(runtime.consoleErrors).toEqual([]);
  await page.screenshot({ path: 'test-results/ehime-geo-desktop.png', fullPage: true });
});

test('mapDebug=1 aliasでもPhase A校正マップを維持する', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  const runtime = observeRuntime(page);
  await enterMap(page, '?mapDebug=1');
  await assertGeographicDebug(page);
  expect(runtime.externalGeoRequests).toEqual([]);
  expect(runtime.pageErrors).toEqual([]);
  expect(runtime.consoleErrors).toEqual([]);
});

test('390px smartphone: 島嶼部を含む20市町がclipping・横overflowなく操作できる', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 390, height: 844 });
  const runtime = observeRuntime(page);
  await enterMap(page, '?geoDebug=1');

  const { svg } = await assertGeographicDebug(page);
  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);

  const svgBox = await svg.boundingBox();
  expect(svgBox).not.toBeNull();
  expect(svgBox.x).toBeGreaterThanOrEqual(0);
  expect(svgBox.x + svgBox.width).toBeLessThanOrEqual(390.5);

  const kamijima = page.locator('#mapLegendList [data-municipality-code="38356"]');
  await kamijima.scrollIntoViewIfNeeded();
  await kamijima.click();
  await expect(kamijima).toHaveClass(/is-debug-selected/);
  await expect(page.locator('#ehimeMap .ehime-municipality-shape[data-municipality-code="38356"]')).toHaveClass(/is-debug-selected/);
  await expect(page.locator('#ehimeMap .ehime-hall-anchor[data-municipality-code="38356"]')).toHaveClass(/is-debug-selected/);

  const touchAction = await page.locator('#ehimeMap').evaluate((element) => getComputedStyle(element).touchAction);
  expect(touchAction).not.toBe('none');
  expect(runtime.externalGeoRequests).toEqual([]);
  expect(runtime.pageErrors).toEqual([]);
  expect(runtime.consoleErrors).toEqual([]);
  await page.screenshot({ path: 'test-results/ehime-geo-smartphone-390.png', fullPage: true });
});
