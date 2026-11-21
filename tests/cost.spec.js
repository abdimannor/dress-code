// Measuring the three exhibit pages with the Performance API.
const { test, expect } = require('@playwright/test');
const { axe } = require('./helpers');

test('measures each page and reports the external stylesheet', async ({ page }) => {
  await page.goto('cost.html');
  await page.locator('#m-run').click();
  await expect(page.locator('#m-status')).toContainText('Run 1 done', { timeout: 15000 });
  const cards = page.locator('.m-card');
  await expect(cards).toHaveCount(3);
  const ext = page.locator('.m-card[data-page="external.html"]');
  await expect(ext).toContainText('1 (style.css)');
  await expect(ext).toContainText('blocking');
  await expect(page.locator('.m-card[data-page="internal.html"]')).toContainText('inside the HTML');
  await expect(page.locator('.m-card[data-page="inline.html"]')).toContainText('inside the HTML');
  await page.locator('#m-run').click();
  await expect(page.locator('#m-status')).toContainText('Run 2 done', { timeout: 15000 });
  await axe(page);
});
