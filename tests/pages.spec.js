// Every page loads cleanly and passes axe.
const { test, expect } = require('@playwright/test');
const { watch, axe } = require('./helpers');

const PAGES = ['index.html', 'cascade.html', 'cost.html', 'external.html', 'internal.html', 'inline.html'];
// The three exhibit pages are kept byte-identical to the exercise and have no h1.
const EXHIBIT = ['external.html', 'internal.html', 'inline.html'];

for (const p of PAGES) {
  test(`${p} loads without errors and passes axe`, async ({ page }) => {
    const errors = watch(page);
    const res = await page.goto(p);
    expect(res.status()).toBe(200);
    await page.waitForLoadState('load');
    expect(errors).toEqual([]);
    await axe(page, EXHIBIT.includes(p) ? ['page-has-heading-one'] : []);
  });
}

test('new pages are in the sitemap and linked from the index', async ({ page, request }) => {
  const sm = await (await request.get('sitemap.xml')).text();
  expect(sm).toContain('/cascade.html');
  expect(sm).toContain('/cost.html');
  await page.goto('index.html');
  await expect(page.locator('a[href="cascade.html"]')).toBeVisible();
  await expect(page.locator('a[href="cost.html"]')).toBeVisible();
});
