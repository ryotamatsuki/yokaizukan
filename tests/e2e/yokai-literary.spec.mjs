import { test, expect } from '@playwright/test';

async function openYokai(page, name) {
  await page.goto('/index.html');
  await expect(page.locator('#results-count')).toContainText('/ 50 体');
  const card = page.locator('.yokai-card').filter({ hasText: name }).first();
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'くわしく見る' }).click();
  await expect(page.locator('#detail-title')).toContainText(name);
}

test('national card -> detail -> literary article -> Research -> source link', async ({ page }) => {
  await openYokai(page, '塗壁');

  const description = page.locator('.detail-section').filter({ has: page.getByRole('heading', { name: 'どんな妖怪？' }) });
  await expect(description).toContainText('福岡県遠賀郡');
  await expect(description).toContainText('夜道');

  await page.getByRole('button', { name: 'もっと詳しく読む' }).click();
  const article = page.locator('#detailed-article-nurikabe');
  await expect(article).toBeVisible();
  await expect(article).toContainText('夜道が、壁のようになる');
  await expect(article).toContainText('壱岐');

  const research = page.locator('[data-research-overview]');
  await expect(research.getByRole('heading', { name: '地域と出典で読む' })).toBeVisible();
  const sourceLink = research.locator('.research-source-list a').first();
  await expect(sourceLink).toBeVisible();
  await expect(sourceLink).toHaveAttribute('href', /nichibun\.ac\.jp/);
});

test('insufficient countermeasure stays explicit instead of inventing a weakness', async ({ page }) => {
  await openYokai(page, '座敷童子');

  const research = page.locator('[data-research-overview]');
  const weakness = research.locator('.research-claim-block').filter({ has: page.getByRole('heading', { name: '弱点・対処の伝承' }) });
  await expect(weakness).toContainText('固有の対処法を確認できていません');
  await expect(weakness.locator('li')).toHaveCount(0);
});

test('APP interpretation is displayed as editorial interpretation, not folklore fact', async ({ page }) => {
  await openYokai(page, '猫又');

  const research = page.locator('[data-research-overview]');
  const editorial = research.locator('.research-editorial-note');
  await expect(editorial).toBeVisible();
  await expect(editorial).toContainText('図鑑編集部の読み方');
  await expect(editorial).toContainText('図鑑編集部の解説');
});

test.describe('mobile national literary flow', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('literary article and Research remain reachable on mobile', async ({ page }) => {
    await openYokai(page, '塗壁');
    await page.getByRole('button', { name: 'もっと詳しく読む' }).click();
    await expect(page.locator('#detailed-article-nurikabe')).toBeVisible();
    const research = page.locator('[data-research-overview]');
    await expect(research).toBeVisible();
    await expect(research.locator('.research-source-list a').first()).toBeVisible();
  });
});
