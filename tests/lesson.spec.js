// The front page: course bar, the original exercise in a frame, the quiz.
const { test, expect } = require('@playwright/test');
const { axe } = require('./helpers');

test('course bar marks this lesson and carries no text pill', async ({ page }) => {
  await page.goto('index.html');
  const current = page.locator('.course-bar a[aria-current="page"]');
  await expect(current).toContainText('Dress Code');
  await expect(page.locator('.course-bar')).not.toContainText('Rörelse');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(['rgb(246, 247, 251)', 'rgb(14, 18, 32)']).toContain(bg);
});

test('the original exercise is framed and the switch swaps the file', async ({ page }) => {
  await page.goto('index.html');
  const frame = page.frameLocator('#orig-frame');
  await expect(frame.locator('p').first()).toHaveText('Välkommen!');
  await page.getByRole('button', { name: 'Inline' }).click();
  await expect(page.locator('#orig-frame')).toHaveAttribute('src', 'inline.html');
  await expect(page.locator('#orig-url')).toHaveText('dress-code/inline.html');
  await expect(frame.locator('p[style]').first()).toHaveText('Välkommen!');
});

test('a quiz round can be predicted and revealed', async ({ page }) => {
  await page.goto('index.html');
  await expect(page.locator('#pq-progress')).toContainText('Round 1 of 8');
  await page.locator('[data-pick="red"]').click();
  await page.locator('#pq-reveal').click();
  await expect(page.locator('#pq-explain')).toContainText('Right, red.');
  await expect(page.locator('#pq-next')).toBeVisible();
});

test('dark scheme passes axe', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('index.html');
  await axe(page);
});
