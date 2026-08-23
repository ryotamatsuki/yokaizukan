import { test, expect } from '@playwright/test';

async function openYokai(page, id) {
  await page.goto('/yokai.html');
  const skipOpening = page.locator('#skipOpeningButton');
  if (await skipOpening.isVisible()) await skipOpening.click();
  await expect(page.locator('#results-count')).toContainText('/ 50 体');
  const card = page.locator(`article.yokai-card[data-yokai-id="${id}"]`);
  await expect(card).toBeVisible();
  const title = (await card.locator('h3').textContent())?.trim() || '';
  await card.getByRole('button', { name: 'くわしく見る' }).click();
  await expect(page.locator('#detail-title')).toContainText(title);
}

async function openArticle(page, id) {
  await page.getByRole('button', { name: 'もっと詳しく読む' }).click();
  const article = page.locator(`#detailed-article-${id}`);
  await expect(article).toBeVisible();
  return article;
}

test('Phase 3 card -> literary article -> Research -> source link', async ({ page }) => {
  await openYokai(page, 'rokurokubi');
  const article = await openArticle(page, 'rokurokubi');
  await expect(article).toContainText('大阪・茨木');
  await expect(article).toContainText('娘の首が伸びる');

  const research = page.locator('[data-research-overview]');
  await expect(research.getByRole('heading', { name: '地域と出典で読む' })).toBeVisible();
  const source = research.locator('.research-source-list a').first();
  await expect(source).toBeVisible();
  await expect(source).toHaveAttribute('href', /nichibun\.ac\.jp/);
});

test('百鬼夜行 remains a collective emaki motif, not an individual yokai ability set', async ({ page }) => {
  await openYokai(page, 'hyakki-yagyo');
  const article = await openArticle(page, 'hyakki-yagyo');
  await expect(article).toContainText('一体の妖怪ではありません');
  await expect(article).toContainText('江戸中期写本');
  await expect(article).toContainText('列');
  await expect(article).not.toContainText(/百鬼夜行.{0,15}(能力|攻撃|弱点)/);

  const research = page.locator('[data-research-overview]');
  const ability = research.locator('.research-claim-block').filter({ has: page.getByRole('heading', { name: '何をする？' }) });
  const countermeasure = research.locator('.research-claim-block').filter({ has: page.getByRole('heading', { name: '弱点・対処の伝承' }) });
  await expect(ability.locator('li')).toHaveCount(0);
  await expect(countermeasure.locator('li')).toHaveCount(0);
});

test('鵺 keeps classical-description differences and excludes modern abilities', async ({ page }) => {
  await openYokai(page, 'nue');
  const article = await openArticle(page, 'nue');
  await expect(article).toContainText('古典');
  await expect(article).toContainText('猿');
  await expect(article).toContainText('虎');
  await expect(article).toContainText('狸');
  await expect(article).toContainText('蛇');
  await expect(article).toContainText('源頼政');
  await expect(article).not.toContainText(/毒|雷|炎を吐|変身能力|飛行能力/);
});

test('琴古主 stays tied to Sekien publication/iconography and reaches NDL source', async ({ page }) => {
  await openYokai(page, 'koto_furunushi');
  const article = await openArticle(page, 'koto_furunushi');
  await expect(article).toContainText('鳥山石燕');
  await expect(article).toContainText('箏');
  await expect(article).toContainText('切れた弦');
  await expect(article).toContainText('出版図像');
  await expect(article).not.toContainText(/百年使|必ず妖怪|村で語ら/);

  const research = page.locator('[data-research-overview]');
  await expect(research.locator('.research-source-list a').first()).toHaveAttribute('href', /ndl\.go\.jp/);
});

test('Phase 1 literary overlay remains unchanged after Phase 3', async ({ page }) => {
  await openYokai(page, 'nurikabe');
  const article = await openArticle(page, 'nurikabe');
  await expect(article).toContainText('夜道が、壁のようになる');
  await expect(article).toContainText('壱岐');
});

test('Phase 2 literary overlay remains unchanged after Phase 3', async ({ page }) => {
  await openYokai(page, 'azuki-arai');
  const article = await openArticle(page, 'azuki-arai');
  await expect(article).toContainText('雨の晩');
  await expect(article).toContainText('松山市伊台');
});

test.describe('Phase 3 mobile flow', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('Phase 3 article -> Research -> source remains reachable at 390px', async ({ page }) => {
    await openYokai(page, 'rokurokubi');
    const article = await openArticle(page, 'rokurokubi');
    await expect(article).toContainText('大阪・茨木');
    const research = page.locator('[data-research-overview]');
    await expect(research).toBeVisible();
    const source = research.locator('.research-source-list a').first();
    await expect(source).toBeVisible();
    await expect(source).toHaveAttribute('href', /nichibun\.ac\.jp/);
  });
});
