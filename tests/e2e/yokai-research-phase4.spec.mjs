import { test, expect } from '@playwright/test';

async function openYokai(page, id) {
  await page.goto('/yokai.html');
  const skipOpening = page.locator('#skipOpeningButton');
  if (await skipOpening.isVisible()) await skipOpening.click();
  await expect(page.locator('#results-count')).toContainText('/ 50 体');
  const card = page.locator(`article.yokai-card[data-yokai-id="${id}"]`);
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'くわしく見る' }).click();
}

test('Phase 4 wanyudo Research shows direct Sekien claims and source', async ({ page }) => {
  await openYokai(page, 'wanyudo');
  const research = page.locator('[data-research-overview]');
  await expect(research).toContainText('今昔画図続百鬼');
  await expect(research).toContainText('魂を失う');
  await expect(research).toContainText('此所勝母の里');
  const link = research.locator('.research-source-list a').filter({ hasText: '今昔画図続百鬼' });
  await expect(link).toHaveAttribute('href', /ndlsearch\.ndl\.go\.jp/);
});

test('Phase 4 mokumokuren Research anchors the eyes in Sekien source', async ({ page }) => {
  await openYokai(page, 'mokumokuren');
  const research = page.locator('[data-research-overview]');
  await expect(research).toContainText('障子');
  await expect(research).toContainText('多数の目');
  await expect(research.locator('.research-source-list a').filter({ hasText: '百鬼夜行拾遺' })).toHaveAttribute('href', /ndlsearch\.ndl\.go\.jp/);
});

test('Phase 4 akaname keeps abilities insufficient instead of conflating akaneburi', async ({ page }) => {
  await openYokai(page, 'akaname');
  const research = page.locator('[data-research-overview]');
  const abilities = research.locator('.research-claim-block').filter({ has: page.getByRole('heading', { name: '何をする？' }) });
  await expect(abilities).toContainText('まだ十分に確認できていません');
  await expect(abilities.locator('li')).toHaveCount(0);
  await expect(research).toContainText('垢ねぶり');
});

test('existing Phase 3 Literary remains visible after Phase 4 Research overlay', async ({ page }) => {
  await openYokai(page, 'nue');
  await page.getByRole('button', { name: 'もっと詳しく読む' }).click();
  const article = page.locator('#detailed-article-nue');
  await expect(article).toBeVisible();
  await expect(article).toContainText('古典');
});
