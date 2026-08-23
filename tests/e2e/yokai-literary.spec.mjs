import { test, expect } from '@playwright/test';

async function openYokai(page, id) {
  await page.goto('/yokai.html');
  const skipOpening = page.locator('#skipOpeningButton');
  if (await skipOpening.isVisible()) {
    await skipOpening.click();
  }
  await expect(page.locator('#results-count')).toContainText('/ 50 体');
  const card = page.locator(`article.yokai-card[data-yokai-id="${id}"]`);
  await expect(card).toBeVisible();
  const title = (await card.locator('h3').textContent())?.trim() || '';
  await card.getByRole('button', { name: 'くわしく見る' }).click();
  await expect(page.locator('#detail-title')).toContainText(title);
}

test('national card -> detail -> literary article -> Research -> source link', async ({ page }) => {
  await openYokai(page, 'nurikabe');

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

test('Phase 2 Batch A card -> literary article -> Research -> source link', async ({ page }) => {
  await openYokai(page, 'azuki-arai');
  const description = page.locator('.detail-section').filter({ has: page.getByRole('heading', { name: 'どんな妖怪？' }) });
  await expect(description).toContainText('西条市丹原町');
  await expect(description).toContainText('小豆を研ぐような音');

  await page.getByRole('button', { name: 'もっと詳しく読む' }).click();
  const article = page.locator('#detailed-article-azuki-arai');
  await expect(article).toBeVisible();
  await expect(article).toContainText('雨の晩');
  await expect(article).toContainText('松山市伊台');

  const research = page.locator('[data-research-overview]');
  await expect(research.getByRole('heading', { name: '地域と出典で読む' })).toBeVisible();
  const sourceLink = research.locator('.research-source-list a').first();
  await expect(sourceLink).toBeVisible();
  await expect(sourceLink).toHaveAttribute('href', /nichibun\.ac\.jp/);
});

test('Phase 2 Batch A keeps betobeto-san Memory Hook grounded in sound and response', async ({ page }) => {
  await openYokai(page, 'betobeto_san');
  await page.getByRole('button', { name: 'もっと詳しく読む' }).click();
  const article = page.locator('#detailed-article-betobeto_san');
  await expect(article).toBeVisible();
  await expect(article).toContainText('ビタビタ');
  await expect(article).toContainText('先へおこし');
  await expect(article).toContainText('道をよけ');
});

test('insufficient countermeasure stays explicit instead of inventing a weakness', async ({ page }) => {
  await openYokai(page, 'zashiki-warashi');

  const research = page.locator('[data-research-overview]');
  const weakness = research.locator('.research-claim-block').filter({ has: page.getByRole('heading', { name: '弱点・対処の伝承' }) });
  await expect(weakness).toContainText('固有の対処法を確認できていません');
  await expect(weakness.locator('li')).toHaveCount(0);
});

test('APP interpretation is displayed as editorial interpretation, not folklore fact', async ({ page }) => {
  await openYokai(page, 'nekomata');

  const research = page.locator('[data-research-overview]');
  const editorial = research.locator('.research-editorial-note');
  await expect(editorial).toBeVisible();
  await expect(editorial).toContainText('図鑑編集部の読み方');
  await expect(editorial).toContainText('図鑑編集部の解説');
});

test.describe('mobile national literary flow', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('literary article and Research remain reachable on mobile', async ({ page }) => {
    await openYokai(page, 'nurikabe');
    await page.getByRole('button', { name: 'もっと詳しく読む' }).click();
    await expect(page.locator('#detailed-article-nurikabe')).toBeVisible();
    const research = page.locator('[data-research-overview]');
    await expect(research).toBeVisible();
    await expect(research.locator('.research-source-list a').first()).toBeVisible();
  });
});
