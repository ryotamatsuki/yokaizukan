import { test, expect } from '@playwright/test';

async function dismissOpening(page) {
  const skip = page.getByRole('button', { name: 'スキップ' });
  if (await skip.isVisible()) {
    await skip.click();
    await expect(page.locator('#ehimeOpening')).toBeHidden();
  }
}

async function assertResearchPanel(page) {
  const panel = page.locator('.ehime-research-v2');
  await expect(panel).toBeVisible();
  await expect(panel).not.toHaveAttribute('open', '');
  await panel.locator('summary').click();
  await expect(panel).toHaveAttribute('open', '');
  await expect(panel.getByText('資料から言えること')).toBeVisible();
  const sourceLink = panel.getByRole('link', { name: '資料を見る' }).first();
  await expect(sourceLink).toBeVisible();
  await expect(sourceLink).toHaveAttribute('href', /^https:\/\//);
}

test('図鑑カードから詳細を開き、資料パネルと出典リンクを表示できる', async ({ page }) => {
  await page.goto('/ehime.html');
  await dismissOpening(page);
  const detailButton = page.locator('[data-open-detail]').first();
  await expect(detailButton).toBeVisible();
  await detailButton.click();
  await expect(page.locator('#detailContent')).toBeVisible();
  await assertResearchPanel(page);
});

test('地図マーカーから開いても同じResearch経路が動く', async ({ page }) => {
  await page.goto('/ehime.html');
  await dismissOpening(page);
  await page.locator('[data-target-view="map"]').first().click();
  const marker = page.locator('#ehimeMap .map-marker').first();
  await expect(marker).toBeVisible();
  await marker.click();
  await expect(page.locator('#detailContent')).toBeVisible();
  await assertResearchPanel(page);
});
