const { expect } = require('@playwright/test');
const AXE = require.resolve('axe-core/axe.min.js');

// Collect console errors and failed requests for one page.
function watch(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', (r) => { if (r.url().startsWith('http://127.0.0.1')) errors.push('failed ' + r.url()); });
  return errors;
}

async function axe(page, disable = []) {
  await page.addScriptTag({ path: AXE });
  const result = await page.evaluate(async (off) => {
    const rules = Object.fromEntries(off.map((id) => [id, { enabled: false }]));
    return window.axe.run(document, { rules });
  }, disable);
  const summary = result.violations.map((v) => v.id + ': ' + v.nodes.map((n) => n.target.join(' ')).join(', '));
  expect(summary).toEqual([]);
}

module.exports = { watch, axe };
