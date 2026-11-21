// The cascade explainer: model and browser agree, and !important reverses layers.
const { test, expect } = require('@playwright/test');
const { axe } = require('./helpers');

const row = (page, text) => page.locator('#ex-decls tr', { has: page.locator(`button[aria-label*="${text}"]`) });
const check = (page) => page.locator('#ex-check');

test('inline style wins by default and the browser agrees', async ({ page }) => {
  await page.goto('cascade.html');
  await expect(page.locator('#ex-verdict')).toContainText('style attribute');
  await expect(check(page)).toHaveAttribute('data-agree', 'true');
  await expect(check(page)).toContainText('rgb(194, 65, 12)');
  await expect(page.locator('#ex-steps li')).toHaveCount(6);
  await expect(row(page, '#lead')).toContainText('Lost at Element-attached styles');
  await axe(page);
});

test('!important reverses layer order, and important inline still wins', async ({ page }) => {
  await page.goto('cascade.html');
  await row(page, '@layer theme').getByRole('button', { name: /^!important:/ }).click();
  await expect(page.locator('#ex-verdict')).toContainText('@layer theme');
  await row(page, '@layer reset').getByRole('button', { name: /^!important:/ }).click();
  await expect(page.locator('#ex-verdict')).toContainText('@layer reset');
  await expect(row(page, '@layer theme')).toContainText('earlier layer wins');
  await expect(check(page)).toHaveAttribute('data-agree', 'true');
  await expect(check(page)).toContainText('rgb(51, 65, 85)');
  await row(page, 'style attribute').getByRole('button', { name: /^!important:/ }).click();
  await expect(page.locator('#ex-verdict')).toContainText('style attribute');
  await expect(check(page)).toContainText('rgb(194, 65, 12)');
});

test('specificity and order decide among unlayered rules', async ({ page }) => {
  await page.goto('cascade.html');
  await row(page, 'style attribute').getByRole('button', { name: /^On:/ }).click();
  await expect(page.locator('#ex-verdict')).toContainText('#lead');
  await row(page, 'unlayered #lead').getByRole('button', { name: /^On:/ }).click();
  await expect(page.locator('#ex-verdict')).toContainText('p.note');
  await expect(check(page)).toHaveAttribute('data-agree', 'true');
});

test('user agent origin wins when no author rule applies; user row is simulated', async ({ page }) => {
  await page.goto('cascade.html');
  await page.selectOption('#ex-scene', 'link');
  await expect(page.locator('#ex-verdict')).toContainText('@layer theme');
  for (const t of ['@layer base', '@layer theme']) await row(page, t).getByRole('button', { name: /^On:/ }).click();
  await expect(page.locator('#ex-verdict')).toContainText('browser default');
  await row(page, 'user style').getByRole('button', { name: /^On:/ }).click();
  await expect(page.locator('#ex-verdict')).toContainText('user style');
  await expect(check(page)).toContainText('only simulated');
  await row(page, 'user style').getByRole('button', { name: /^!important:/ }).click();
  await row(page, '@layer base').getByRole('button', { name: /^On:/ }).click();
  await row(page, '@layer base').getByRole('button', { name: /^!important:/ }).click();
  await expect(page.locator('#ex-verdict')).toContainText('user style');
  await expect(row(page, '@layer base')).toContainText('important user beats important author');
});

test('heading font-size follows the layer order', async ({ page }) => {
  await page.goto('cascade.html');
  await page.selectOption('#ex-scene', 'heading');
  await expect(check(page)).toContainText('30px');
  await expect(check(page)).toHaveAttribute('data-agree', 'true');
});
