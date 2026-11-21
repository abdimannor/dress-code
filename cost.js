/* Loads the three exhibit pages in hidden frames and reports what the browser
   measured: Navigation and Resource Timing plus Paint Timing. Nothing is estimated. */
(() => {
  'use strict';
  const root = document.getElementById('measure');
  if (!root) return;
  const btn = root.querySelector('#m-run');
  const status = root.querySelector('#m-status');
  const cards = root.querySelector('#m-cards');
  const frames = root.querySelector('#m-frames');
  const PAGES = [
    { file: 'external.html', name: 'External CSS' },
    { file: 'internal.html', name: 'Internal CSS' },
    { file: 'inline.html', name: 'Inline CSS' }
  ];
  let run = 0;
  const bytes = (n) => (typeof n === 'number' ? n.toLocaleString('en') + ' B' : 'not reported');
  const ms = (n) => (typeof n === 'number' ? Math.round(n) + ' ms' : 'not reported');

  function load(file) {
    return new Promise((resolve) => {
      const f = document.createElement('iframe');
      f.title = 'Measured page: ' + file;
      f.addEventListener('load', () => {
        // Give paint entries a moment to be queued after load.
        setTimeout(() => resolve(f), 300);
      }, { once: true });
      f.src = file;
      frames.append(f);
    });
  }

  function read(f) {
    const perf = f.contentWindow.performance;
    const nav = perf.getEntriesByType('navigation')[0] || {};
    const css = perf.getEntriesByType('resource').find((r) => /\/style\.css(\?|$)/.test(r.name));
    const paint = Object.fromEntries(perf.getEntriesByType('paint').map((p) => [p.name, p.startTime]));
    return { nav, css, paint };
  }

  function card(page, m) {
    const c = document.createElement('article');
    c.className = 'm-card is-fresh';
    const h = document.createElement('h3'); h.textContent = page.name + ' · run ' + run;
    const dl = document.createElement('dl');
    const rows = [
      ['HTML bytes', bytes(m.nav.encodedBodySize)],
      ['HTML transferred', bytes(m.nav.transferSize)],
      ['CSS requests', m.css ? '1 (style.css)' : '0'],
      ['CSS bytes', m.css ? bytes(m.css.encodedBodySize) : 'inside the HTML'],
      ['CSS transferred', m.css ? bytes(m.css.transferSize) + (m.css.transferSize === 0 ? ' (from cache)' : '') : 'n/a'],
      ['CSS fetch time', m.css ? ms(m.css.duration) : 'n/a'],
      ['Render-blocking', m.css ? (m.css.renderBlockingStatus || 'not reported') : 'n/a'],
      ['First paint', ms(m.paint['first-paint'])],
      ['First contentful paint', ms(m.paint['first-contentful-paint'])]
    ];
    for (const [k, v] of rows) {
      const dt = document.createElement('dt'); dt.textContent = k;
      const dd = document.createElement('dd'); dd.textContent = v;
      dl.append(dt, dd);
    }
    c.append(h, dl);
    c.dataset.page = page.file;
    return c;
  }

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    run += 1;
    status.textContent = 'Measuring run ' + run + '…';
    frames.textContent = '';
    cards.textContent = '';
    for (const page of PAGES) {
      // One page at a time so they do not compete for the network.
      const f = await load(page.file);
      cards.append(card(page, read(f)));
    }
    status.textContent = 'Run ' + run + ' done. Press again to see the cached case.';
    btn.disabled = false;
    setTimeout(() => cards.querySelectorAll('.is-fresh').forEach((c) => c.classList.remove('is-fresh')), 400);
  });
  root.hidden = false;
})();
