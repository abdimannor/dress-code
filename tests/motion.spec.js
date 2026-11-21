// Motion is on by default, even when the system asks for reduced motion; the button turns it off.
const { test, expect } = require('@playwright/test');

test.use({ contextOptions: { reducedMotion: 'reduce' } });

for (const p of ['index.html', 'cascade.html', 'cost.html']) {
  test(`${p}: moving by default, off after the button, remembered after reload`, async ({ page }) => {
    await page.goto(p);
    const html = page.locator('html');
    const btn = page.locator('.course-motion');
    await expect(html).toHaveAttribute('data-motion', 'on');
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
    await expect(btn).toHaveAccessibleName('Pause motion');
    await btn.click();
    await expect(html).toHaveAttribute('data-motion', 'off');
    await expect(btn).toHaveAccessibleName('Play motion');
    await page.reload();
    await expect(html).toHaveAttribute('data-motion', 'off');
    await expect(btn).toHaveAttribute('aria-pressed', 'false');
    await btn.click();
    await expect(html).toHaveAttribute('data-motion', 'on');
  });
}

test('the front page entrance runs by default under reduced motion', async ({ page }) => {
  await page.goto('index.html');
  const name = await page.locator('h1').evaluate((el) => getComputedStyle(el).animationName);
  expect(name).toBe('rise');
});
