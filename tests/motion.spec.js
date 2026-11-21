// Motion switch in a browser that asks for reduced motion.
const { test, expect } = require('@playwright/test');

test.use({ contextOptions: { reducedMotion: 'reduce' } });

for (const p of ['index.html', 'cascade.html', 'cost.html']) {
  test(`${p}: still by default, on after the switch, remembered after reload`, async ({ page }) => {
    await page.goto(p);
    const html = page.locator('html');
    await expect(html).not.toHaveAttribute('data-motion', 'on');
    await page.locator('.course-motion button').click();
    await expect(html).toHaveAttribute('data-motion', 'on');
    await page.reload();
    await expect(html).toHaveAttribute('data-motion', 'on');
    await page.locator('.course-motion button').click();
    await expect(html).not.toHaveAttribute('data-motion', 'on');
  });
}
