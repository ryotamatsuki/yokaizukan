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

test('Phase 2 Batch B keeps Ishigaki mermaid story out of Western standard imagery', async ({ page }) => {
  await openYokai(page, 'ningyo');
  await page.getByRole('button', { name: 'もっと詳しく読む' }).click();
  const article = page.locator('#detailed-article-ningyo');
  await expect(article).toBeVisible();
  await expect(article).toContainText('石垣島');
  await expect(article).toContainText('津波');
  await expect(article).toContainText('若狭');
  await expect(article).not.toContainText(/美しい女性|マーメイド|人魚姫|歌声/);

  const research = page.locator('[data-research-overview]');
  await expect(research).toBeVisible();
  await expect(research.locator('.research-source-list a').first()).toHaveAttribute('href', /nichibun\.ac\.jp/);
});

test('Phase 2 Batch C keeps tofu-kozo as a publishing-culture yokai', async ({ page }) => {
  await openYokai(page, 'tofu-kozo');
  await page.getByRole('button', { name: 'もっと詳しく読む' }).click();
  const article = page.locator('#detailed-article-tofu-kozo');
  await expect(article).toBeVisible();
  await expect(article).toContainText('1779年');
  await expect(article).toContainText('黄表紙');
  await expect(article).toContainText('出版文化');
  await expect(article).toContainText('お盆を持ち歩く');
  await expect(article).not.toContainText(/村で昔から|地域伝承の怪物/);

  const research = page.locator('[data-research-overview]');
  await expect(research).toBeVisible();
  await expect(research.locator('.research-source-list a').first()).toHaveAttribute('href', /ndl\.go\.jp/);
});

test('Phase 2 Batch C keeps daidarabotchi regional stories separate', async ({ page }) => {
  await openYokai(page, 'daidarabotchi');
  await page.getByRole('button', { name: 'もっと詳しく読む' }).click();
  const article = page.locator('#detailed-article-daidarabotchi');
  await expect(article).toBeVisible();
  await expect(article).toContainText('群馬県太田市');
  await expect(article).toContainText('赤城山');
  await expect(article).toContainText('足跡が池');
  await expect(article).toContainText('静岡県御殿場市');
  await expect(article).toContainText('矢倉岳');
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

  test('Phase 1 literary article and Research remain reachable on mobile', async ({ page }) => {
    await openYokai(page, 'nurikabe');
    await page.getByRole('button', { name: 'もっと詳しく読む' }).click();
    await expect(page.locator('#detailed-article-nurikabe')).toBeVisible();
    const research = page.locator('[data-research-overview]');
    await expect(research).toBeVisible();
    await expect(research.locator('.research-source-list a').first()).toBeVisible();
  });

  test('Phase 2 literary article -> Research -> source link works at 390px', async ({ page }) => {
    await openYokai(page, 'betobeto_san');
    await page.getByRole('button', { name: 'もっと詳しく読む' }).click();
    const article = page.locator('#detailed-article-betobeto_san');
    await expect(article).toBeVisible();
    await expect(article).toContainText('ビタビタ');
    await expect(article).toContainText('先へおこし');
    const research = page.locator('[data-research-overview]');
    await expect(research).toBeVisible();
    await expect(research.locator('.research-source-list a').first()).toBeVisible();
    await expect(research.locator('.research-source-list a').first()).toHaveAttribute('href', /nichibun\.ac\.jp/);
  });
});
