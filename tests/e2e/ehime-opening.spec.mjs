import { test, expect } from '@playwright/test';

test('愛媛版は地図・11灯・伝承レイヤーを持つオープニングを表示する', async ({ page }) => {
  await page.goto('/ehime.html');

  const opening = page.locator('#ehimeOpening');
  await expect(opening).toBeVisible();
  await expect(opening.getByRole('heading', { name: '愛媛ふしぎ伝承図鑑' })).toBeVisible();
  await expect(opening.locator('.ehime-opening__map')).toHaveAttribute('src', /ehime_generated_map\.png$/);
  await expect(opening.locator('.ehime-opening__light')).toHaveCount(11);
  await expect(opening.locator('.ehime-opening__figure')).toHaveCount(3);

  await opening.getByRole('button', { name: 'スキップ' }).click();
  await expect(opening).toBeHidden();
  await expect(page.locator('.ehime-hero')).toBeVisible();
});

test('Heroからオープニングを再生できる', async ({ page }) => {
  await page.goto('/ehime.html');
  await page.getByRole('button', { name: 'スキップ' }).click();
  await expect(page.locator('#ehimeOpening')).toBeHidden();

  await page.getByRole('button', { name: 'もう一度オープニングを見る' }).click();
  await expect(page.locator('#ehimeOpening')).toBeVisible();
  await expect(page.locator('.ehime-opening__title')).toContainText('愛媛ふしぎ伝承図鑑');
});

test('390px幅でもオープニングから愛媛版本体へ遷移できる', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ehime.html');

  await expect(page.locator('#ehimeOpening')).toBeVisible();
  await page.getByRole('button', { name: 'スキップ' }).click();
  await expect(page.locator('#ehimeOpening')).toBeHidden();
  await expect(page.getByRole('heading', { name: '愛媛ふしぎ伝承図鑑' }).last()).toBeVisible();
  await expect(page.getByRole('button', { name: '地図で探す' })).toBeVisible();
});
