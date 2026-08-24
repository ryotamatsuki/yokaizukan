import { test, expect } from '@playwright/test';

const CLOSURE_IDS = [
  'wanyudo', 'mokumokuren', 'kodama', 'yamanba', 'gashadokuro', 'akaname',
  'karakasa-kozo', 'chochin-obake', 'nuppeppo', 'shiro_uneri',
  'fumikuruma_yohi', 'kaichigo', 'enenra', 'ame_onna'
];

async function gotoCatalog(page) {
  await page.goto('/yokai.html');
  const skipOpening = page.locator('#skipOpeningButton');
  if (await skipOpening.isVisible()) await skipOpening.click();
  await expect(page.locator('#results-count')).toContainText('/ 50 体');
}

async function openYokai(page, id) {
  await gotoCatalog(page);
  const card = page.locator(`article.yokai-card[data-yokai-id="${id}"]`);
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'くわしく見る' }).click();
  await expect(page.locator('#detail-modal')).toBeVisible();
}

async function openArticle(page, id) {
  await openYokai(page, id);
  await page.getByRole('button', { name: 'もっと詳しく読む' }).click();
  const article = page.locator(`#detailed-article-${id}`);
  await expect(article).toBeVisible();
  return article;
}

test('all 14 closure targets expose a final article', async ({ page }) => {
  await gotoCatalog(page);
  for (const id of CLOSURE_IDS) {
    const card = page.locator(`article.yokai-card[data-yokai-id="${id}"]`);
    await expect(card).toBeVisible();
    await card.getByRole('button', { name: 'くわしく見る' }).click();
    await page.getByRole('button', { name: 'もっと詳しく読む' }).click();
    await expect(page.locator(`#detailed-article-${id}`)).toBeVisible();
    await page.locator('[data-close-detail]').first().click();
  }
});

test('A closure wanyudo uses Phase 4 evidence and keeps Research source links', async ({ page }) => {
  const article = await openArticle(page, 'wanyudo');
  await expect(article).toContainText('今昔画図続百鬼');
  await expect(article).toContainText('此所勝母の里');
  await expect(article).not.toContainText('子どもをさらう');

  const research = page.locator('[data-research-overview]');
  await expect(research).toContainText('魂を失う');
  await expect(research.locator('.research-source-list a').filter({ hasText: '今昔画図続百鬼' })).toHaveAttribute('href', /ndlsearch\.ndl\.go\.jp/);
});

test('B closure gashadokuro keeps image and naming history separate', async ({ page }) => {
  const article = await openArticle(page, 'gashadokuro');
  await expect(article).toContainText('巨大な骸骨');
  await expect(article).toContainText('名前は別々');
  await expect(article).toContainText('1966年');
  await expect(article).not.toContainText('戦乱の死者への想像');
  await expect(article).not.toContainText('夜の野原で骨が鳴る');
});

test('B closure akaname does not turn akaneburi into a cleaning moral', async ({ page }) => {
  const article = await openArticle(page, 'akaname');
  await expect(article).toContainText('垢嘗');
  await expect(article).toContainText('垢ねぶり');
  await expect(article).toContainText('同じ妖怪だ');
  await expect(article).not.toContainText('掃除を促す生活の戒め');
  await expect(article).not.toContainText('毎日の手入れ');
});

test('C closure karakasa remains short and does not revive the legacy origin story', async ({ page }) => {
  const article = await openArticle(page, 'karakasa-kozo');
  await expect(article.locator(':scope > p')).toHaveCount(5); // subtitle/source-note plus 3 body paragraphs
  await expect(article).toContainText('個別資料が見つかるまでは');
  await expect(article).not.toContainText('ものを大切にする生活倫理');
  await expect(article).not.toContainText('忘れられたものの反撃');

  const research = page.locator('[data-research-overview]');
  const abilities = research.locator('.research-claim-block').filter({ has: page.getByRole('heading', { name: '何をする？' }) });
  await expect(abilities.locator('li')).toHaveCount(0);
});

test('Research failure still uses closure article and never falls back to legacy references', async ({ page }) => {
  await page.route('**/public/data/yokai_research*.json', (route) => route.abort());
  const article = await openArticle(page, 'karakasa-kozo');
  await expect(article).toContainText('個別資料が見つかるまでは');
  await expect(article).not.toContainText('ものを大切にする生活倫理');
  await expect(article).toContainText('研究データを読み込めなかったため');
  await expect(article.locator('a')).toHaveCount(0);
  await expect(page.locator('[data-research-overview]')).toHaveCount(0);
});

test('Phase 1, 2 and 3 articles remain unchanged after closure', async ({ page }) => {
  const p1 = await openArticle(page, 'nurikabe');
  await expect(p1).toContainText('夜道');
  await page.locator('[data-close-detail]').first().click();

  const p2 = await openArticle(page, 'azuki-arai');
  await expect(p2).toContainText('小豆を研ぐ');
  await page.locator('[data-close-detail]').first().click();

  const p3 = await openArticle(page, 'nue');
  await expect(p3).toContainText('古典');
});

test('390px mobile can read closure article and follow Research source', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const article = await openArticle(page, 'mokumokuren');
  await expect(article).toContainText('破れ障子');
  const research = page.locator('[data-research-overview]');
  await expect(research).toBeVisible();
  await expect(research.locator('.research-source-list a').first()).toHaveAttribute('href', /^https:\/\//);
});
