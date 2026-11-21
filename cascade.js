/* Cascade explainer: every declaration that applies to one element and one
   property, sorted through the Cascade 5 steps (w3.org/TR/css-cascade-5/#cascade-sort).
   Author declarations are applied for real in a frame, so the browser checks the model. */
(() => {
  'use strict';
  const root = document.getElementById('explainer');
  if (!root) return;

  const LAYERS = ['reset', 'base', 'theme']; // @layer reset, base, theme;
  const ORIGIN = { ua: 'user agent', user: 'user', author: 'author' };
  // Origin and importance, Cascade 5 section 6.1 (transitions and animations are not in play here).
  function originRank(d) {
    if (d.imp) return { ua: 7, user: 6, author: 5 }[d.origin];
    return { author: 3, user: 2, ua: 1 }[d.origin];
  }
  function layerRank(d) {
    if (d.origin !== 'author' || d.inline) return 0;
    const i = d.layer ? LAYERS.indexOf(d.layer) : LAYERS.length; // unlayered = implicit final layer
    return d.imp ? -i : i;
  }

  const SCENES = {
    lead: {
      label: '<p id="lead" class="note"> · color', tag: 'p', prop: 'color',
      decls: [
        { origin: 'author', layer: 'reset', sel: 'p', spec: [0, 0, 1], value: '#334155' },
        { origin: 'author', layer: 'theme', sel: '.note', spec: [0, 1, 0], value: '#7c3aed' },
        { origin: 'author', sel: 'p.note', spec: [0, 1, 1], value: '#0f766e' },
        { origin: 'author', sel: '#lead', spec: [1, 0, 0], value: '#1d4ed8' },
        { origin: 'author', sel: 'p', spec: [0, 0, 1], value: '#be123c' },
        { origin: 'author', inline: true, sel: 'style=""', spec: null, value: '#c2410c' },
        { origin: 'user', sel: 'p', spec: [0, 0, 1], value: '#000000', on: false }
      ]
    },
    link: {
      label: '<a href="#"> · color', tag: 'a', prop: 'color',
      decls: [
        { origin: 'ua', sel: 'link rule in the default stylesheet', spec: null, value: null },
        { origin: 'author', layer: 'base', sel: 'a', spec: [0, 0, 1], value: '#0f766e' },
        { origin: 'author', layer: 'theme', sel: 'main a', spec: [0, 0, 2], value: '#7c3aed' },
        { origin: 'user', sel: 'a', spec: [0, 0, 1], value: '#000000', on: false }
      ]
    },
    heading: {
      label: '<h2> · font-size', tag: 'h2', prop: 'font-size',
      decls: [
        { origin: 'ua', sel: 'h2 rule in the default stylesheet', spec: null, value: null },
        { origin: 'author', layer: 'reset', sel: 'h2', spec: [0, 0, 1], value: '16px' },
        { origin: 'author', layer: 'theme', sel: 'h2', spec: [0, 0, 1], value: '30px' },
        { origin: 'user', sel: 'h2', spec: [0, 0, 1], value: '40px', on: false }
      ]
    }
  };
  for (const s of Object.values(SCENES)) s.decls.forEach((d, i) => { d.order = i; d.on = d.on !== false; d.imp = false; });

  const pick = root.querySelector('#ex-scene');
  const table = root.querySelector('#ex-decls');
  const steps = root.querySelector('#ex-steps');
  const verdict = root.querySelector('#ex-verdict');
  const check = root.querySelector('#ex-check');
  const frame = root.querySelector('#ex-frame');
  let scene = SCENES.lead;

  const specText = (d) => d.inline ? 'n/a (attached)' : d.origin === 'ua' ? 'n/a' : '(' + d.spec.join(',') + ')';
  const where = (d) => d.origin === 'ua' ? 'browser default' : d.origin === 'user' ? 'user style (simulated)'
    : d.inline ? 'style attribute' : d.layer ? '@layer ' + d.layer : 'unlayered';

  const STEPS = [
    { name: 'Origin and importance', key: originRank },
    { name: 'Context', key: () => 0 },
    { name: 'Element-attached styles', key: (d) => (d.inline ? 1 : 0) },
    { name: 'Layers', key: layerRank },
    { name: 'Specificity', key: (d) => (d.spec ? d.spec[0] * 1e4 + d.spec[1] * 100 + d.spec[2] : 0) },
    { name: 'Order of appearance', key: (d) => d.order }
  ];

  function why(step, w, l) {
    const imp = (d) => (d.imp ? 'important ' : 'normal ') + ORIGIN[d.origin];
    switch (step) {
      case 0: return 'Origin and importance: ' + imp(w) + ' beats ' + imp(l) + '.';
      case 2: return 'Element-attached styles: the style attribute beats every selector with the same origin and importance.';
      case 3: {
        const n = (d) => (d.layer ? 'layer ' + d.layer : 'unlayered styles (the implicit last layer)');
        return w.imp ? 'Layers: both are !important, so the earlier layer wins: ' + n(w) + ' comes before ' + n(l) + '.'
          : 'Layers: for normal declarations the later layer wins: ' + n(w) + ' comes after ' + n(l) + '.';
      }
      case 4: return 'Specificity: ' + specText(w) + ' beats ' + specText(l) + '.';
      default: return 'Order of appearance: everything else ties, and the winner comes later in the document.';
    }
  }

  function authorCss() {
    const by = (f) => scene.decls.filter((d) => d.on && d.origin === 'author' && !d.inline && f(d));
    const rule = (d) => d.sel + ' { ' + scene.prop + ': ' + d.value + (d.imp ? ' !important' : '') + '; }';
    let css = '@layer ' + LAYERS.join(', ') + ';\n';
    // Written in declaration order, wrapping layered rules in their layer block.
    for (const d of by(() => true)) css += (d.layer ? '@layer ' + d.layer + ' { ' + rule(d) + ' }' : rule(d)) + '\n';
    return css;
  }
  function demoDoc() {
    const inl = scene.decls.find((d) => d.inline && d.on);
    const attr = inl ? ' style="' + scene.prop + ': ' + inl.value + (inl.imp ? ' !important' : '') + '"' : '';
    const body = { p: '<p id="lead" class="note"' + attr + '>Välkommen!</p>', a: '<a href="#"' + attr + '>Läs mer</a>', h2: '<h2' + attr + '>Idag</h2>' }[scene.tag];
    return '<!DOCTYPE html><html lang="sv"><head><meta name="robots" content="noindex"><style>body{margin:0;padding:1rem;font:1rem system-ui,sans-serif;background:#fff}</style>' +
      '<style id="author">' + authorCss() + '</style></head><body><main>' + body + '<span id="probe"></span></main></body></html>';
  }

  function render() {
    const live = scene.decls.filter((d) => d.on);
    const sorted = live.slice().sort((a, b) => {
      for (const s of STEPS) { const k = s.key(b) - s.key(a); if (k) return k; }
      return 0;
    });
    const win = sorted[0];

    // Step by step: who is still in the running after each step.
    steps.textContent = '';
    let pool = live.slice();
    STEPS.forEach((s, i) => {
      const best = Math.max(...pool.map(s.key));
      const out = pool.filter((d) => s.key(d) !== best);
      pool = pool.filter((d) => s.key(d) === best);
      const li = document.createElement('li');
      li.className = out.length ? 'is-cut' : 'is-tie';
      const h = document.createElement('strong'); h.textContent = (i + 1) + '. ' + s.name;
      const p = document.createElement('span');
      p.textContent = out.length ? out.length + ' out, ' + pool.length + ' left'
        : (i === 1 ? 'all from the same document, no shadow DOM: no decision' : 'no decision, ' + pool.length + ' left');
      li.append(h, p);
      steps.append(li);
    });

    table.textContent = '';
    sorted.concat(scene.decls.filter((d) => !d.on)).forEach((d, rank) => {
      const tr = document.createElement('tr');
      if (d === win) tr.className = 'is-win'; else if (!d.on) tr.className = 'is-off';
      const lostAt = d.on && d !== win ? STEPS.findIndex((s) => s.key(d) !== s.key(win)) : -1;
      const val = d.value || '(read from this browser)';
      const cells = [d.on ? String(rank + 1) : '·', ORIGIN[d.origin], where(d), d.sel, specText(d)];
      cells.forEach((c) => { const td = document.createElement('td'); td.textContent = c; tr.append(td); });
      const tdv = document.createElement('td');
      const sw = document.createElement('span'); sw.className = 'ex-swatch';
      if (d.value && scene.prop === 'color') sw.style.background = d.value;
      tdv.append(sw, document.createTextNode(val + (d.imp ? ' !important' : '')));
      tr.append(tdv);
      const tdc = document.createElement('td');
      if (d.origin !== 'ua') {
        for (const f of ['on', 'imp']) {
          const b = document.createElement('button');
          b.type = 'button';
          b.textContent = f === 'on' ? 'On' : '!important';
          b.setAttribute('aria-pressed', String(d[f]));
          b.setAttribute('aria-label', (f === 'on' ? 'On: ' : '!important: ') + where(d) + ' ' + d.sel);
          b.addEventListener('click', () => { d[f] = !d[f]; render(); });
          tdc.append(b);
        }
      } else tdc.textContent = 'fixed';
      tr.append(tdc);
      const tdr = document.createElement('td');
      tdr.textContent = !d.on ? 'Switched off.' : d === win ? 'Winner.' : 'Lost at ' + why(lostAt, win, d);
      tr.append(tdr);
      table.append(tr);
    });

    verdict.textContent = win ? 'Winner: ' + win.sel + ' (' + where(win) + ')' + (win.value ? ', ' + scene.prop + ': ' + win.value : '') + '.' : '';
    frame.srcdoc = demoDoc();
  }

  // The browser's verdict: compare the computed value in the frame with the model.
  frame.addEventListener('load', () => {
    const doc = frame.contentDocument;
    if (!doc || !doc.body) return;
    const el = doc.querySelector(scene.tag === 'p' ? '#lead' : scene.tag);
    const probe = doc.getElementById('probe');
    const got = getComputedStyle(el).getPropertyValue(scene.prop);
    const live = scene.decls.filter((d) => d.on && d.origin !== 'user');
    const sorted = live.slice().sort((a, b) => { for (const s of STEPS) { const k = s.key(b) - s.key(a); if (k) return k; } return 0; });
    const w = sorted[0];
    let expect = got;
    if (w && w.value) {
      const p = doc.createElement(scene.tag); p.style.setProperty(scene.prop, w.value);
      probe.after(p); expect = getComputedStyle(p).getPropertyValue(scene.prop); p.remove();
    }
    const user = scene.decls.some((d) => d.on && d.origin === 'user');
    const agree = got === expect;
    check.dataset.agree = String(agree);
    check.textContent = 'Browser check: the frame computes ' + scene.prop + ': ' + got + '. ' +
      (agree ? 'That matches the model' : 'That does NOT match the model (' + expect + ')') +
      (user ? ' for author and browser styles; a page cannot add user styles, so the user row is only simulated.' : '.');
  });

  for (const [k, s] of Object.entries(SCENES)) {
    const o = document.createElement('option'); o.value = k; o.textContent = s.label; pick.append(o);
  }
  pick.addEventListener('change', () => { scene = SCENES[pick.value]; render(); });
  root.hidden = false;
  render();
})();
