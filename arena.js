/* Specificity arena: one <p>, coloured by an external file, a <style> block
   and a style attribute. The frame is rebuilt on every toggle so the browser
   resolves the cascade; the ranked explanation is computed beside it. */
(() => {
  'use strict';
  const arena = document.getElementById('arena');
  if (!arena) return;
  arena.hidden = false;
  const frame = arena.querySelector('#arena-frame');
  const rank = arena.querySelector('.ar-rank');
  const verdict = arena.querySelector('.ar-verdict');
  const base = new URL('.', location.href).href;

  const SRC = {
    external: { label: 'External', where: '<link href="arena.css">', color: '#1d4ed8', name: 'blue' },
    internal: { label: 'Internal', where: '<style> in the head', color: '#be123c', name: 'red' },
    inline:   { label: 'Inline',   where: 'style="" on the <p>', color: '#15803d', name: 'green' }
  };
  const st = { external: { on: true, imp: false }, internal: { on: true, imp: false }, inline: { on: true, imp: false }, styleFirst: false };

  function build() {
    const imp = (k) => st[k].imp ? ' !important' : '';
    const link = st.external.on ? (st.external.imp
      ? '<link rel="stylesheet" href="arena-important.css">'
      : '<link rel="stylesheet" href="arena.css">') : '';
    const style = st.internal.on ? '<style>p { color: #be123c' + imp('internal') + '; }</style>' : '';
    const head = st.styleFirst ? style + link : link + style;
    const attr = st.inline.on ? ' style="color: #15803d' + imp('inline') + ';"' : '';
    return '<!DOCTYPE html><html><head><base href="' + base + '"><meta name="robots" content="noindex">' + head +
      '<style>html,body{margin:0;height:100%}body{display:grid;place-items:center;background:#fff;font:900 clamp(2.5rem,9vw,5.5rem)/1 system-ui,sans-serif;letter-spacing:-.04em}p{margin:0;transition:color .2s}</style>' +
      '</head><body><p' + attr + '>Välkommen!</p></body></html>';
  }

  // Ranking: !important first; then inline over sheets; then later in the document.
  function ranked() {
    const order = st.styleFirst ? ['internal', 'external', 'inline'] : ['external', 'internal', 'inline'];
    const live = order.filter((k) => st[k].on).map((k, i) => ({ k, pos: i, imp: st[k].imp, inline: k === 'inline' }));
    return live.sort((a, b) => (b.imp - a.imp) || (b.inline - a.inline) || (b.pos - a.pos));
  }
  function reason(w, l) {
    if (w.imp && !l.imp) return '!important beats any normal declaration';
    if (w.inline && !l.inline) return 'a style attribute beats any selector in a sheet';
    return 'same weight, so the one later in the document wins';
  }

  function render() {
    frame.srcdoc = build();
    const r = ranked();
    rank.innerHTML = r.length ? r.map((x, i) => {
      const s = SRC[x.k];
      const why = i === 0 ? (r[1] ? 'Wins: ' + reason(x, r[1]) + '.' : 'Wins unopposed.') : 'Loses to ' + SRC[r[i - 1].k].label.toLowerCase() + ': ' + reason(r[i - 1], x) + '.';
      return '<li class="' + (i === 0 ? 'is-win' : '') + '" style="--c:' + s.color + '"><span class="ar-place">' + (i + 1) + '</span>' +
        '<span><strong>' + s.label + (x.imp ? ' !important' : '') + '</strong> <code></code><br><small>' + why + '</small></span></li>';
    }).join('') : '<li class="is-none"><span class="ar-place">0</span><span>No author CSS at all: the paragraph falls back to the default black.</span></li>';
    rank.querySelectorAll('code').forEach((c, i) => { c.textContent = SRC[r[i].k].where; });
    frame.onload = () => {
      const p = frame.contentDocument && frame.contentDocument.querySelector('p');
      const got = p ? frame.contentWindow.getComputedStyle(p).color : '?';
      const exp = r[0] ? SRC[r[0].k].name : 'black';
      verdict.innerHTML = 'Browser says <code>' + got + '</code>, the ranking says <strong>' + exp + '</strong>.';
      arena.style.setProperty('--win', r[0] ? SRC[r[0].k].color : '#1e293b');
    };
  }

  arena.querySelectorAll('[data-src]').forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.src, f = b.dataset.field;
    st[k][f] = !st[k][f];
    b.setAttribute('aria-pressed', String(st[k][f]));
    render();
  }));
  arena.querySelector('[data-order]').addEventListener('click', (e) => {
    st.styleFirst = !st.styleFirst;
    e.currentTarget.setAttribute('aria-pressed', String(st.styleFirst));
    render();
  });
  render();
})();
