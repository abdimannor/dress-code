/* Predict the winner: a quiz on top of the specificity arena.
   Each round is a setup of sources and !important flags. The visitor predicts,
   then the arena's own buttons are switched to that setup so the browser decides. */
(() => {
  'use strict';
  const root = document.getElementById('predict');
  const arena = document.getElementById('arena');
  if (!root || !arena) return;
  root.hidden = false;

  const SRC = {
    external: { label: 'External file', color: '#1d4ed8', name: 'blue' },
    internal: { label: '<style> block', color: '#be123c', name: 'red' },
    inline:   { label: 'style attribute', color: '#15803d', name: 'green' }
  };
  const R = (e, i, n, styleFirst) => ({ external: e, internal: i, inline: n, styleFirst: !!styleFirst });
  // each source: 0 off, 1 on, 2 on with !important
  const ROUNDS = [
    R(1, 1, 0), R(1, 1, 1), R(2, 1, 1), R(1, 1, 0, true), R(2, 2, 1), R(2, 2, 1, true), R(0, 1, 2), R(0, 0, 0)
  ];
  let i = 0, score = 0, pick = null;
  const $ = (s) => root.querySelector(s);

  function winner(r) {
    const order = r.styleFirst ? ['internal', 'external', 'inline'] : ['external', 'internal', 'inline'];
    const live = order.filter((k) => r[k]).map((k, pos) => ({ k, pos, imp: r[k] === 2, inline: k === 'inline' }));
    live.sort((a, b) => (b.imp - a.imp) || (b.inline - a.inline) || (b.pos - a.pos));
    return live;
  }
  function why(live) {
    if (!live.length) return 'No author CSS is switched on, so the paragraph keeps the browser default: black.';
    const w = live[0], l = live[1];
    const name = SRC[w.k].label + (w.imp ? ' with !important' : '');
    if (!l) return name + ' is the only source, so it wins unopposed.';
    if (w.imp && !l.imp) return name + ' wins: !important beats every normal declaration, even a style attribute.';
    if (w.inline && !l.inline) return name + ' wins: at equal importance, a style attribute beats any selector in a sheet.';
    return name + ' wins: same weight as ' + SRC[l.k].label + ', so the one later in the document wins.';
  }

  function show() {
    const r = ROUNDS[i];
    pick = null;
    $('#pq-progress').textContent = 'Round ' + (i + 1) + ' of ' + ROUNDS.length + ', score ' + score;
    $('#pq-setup').innerHTML = ['external', 'internal', 'inline'].map((k) =>
      '<li style="--c:' + SRC[k].color + '"' + (r[k] ? '' : ' class="is-off"') + '>' + SRC[k].label.replace(/</g, '&lt;') + ': ' + SRC[k].name +
      (r[k] === 2 ? ' <strong>!important</strong>' : '') + (r[k] ? '' : ' (off)') + '</li>').join('') +
      '<li style="--c:#fde047">Order in the head: ' + (r.styleFirst ? '&lt;style&gt; then &lt;link&gt;' : '&lt;link&gt; then &lt;style&gt;') + '</li>';
    root.querySelectorAll('[data-pick]').forEach((b) => { b.disabled = false; b.setAttribute('aria-pressed', 'false'); });
    $('#pq-reveal').disabled = true;
    $('#pq-explain').textContent = '';
    $('#pq-explain').className = 'pq-explain';
    $('#pq-next').hidden = true;
  }

  function setArena(r) {
    ['external', 'internal', 'inline'].forEach((k) => {
      const want = { on: r[k] > 0, imp: r[k] === 2 };
      ['on', 'imp'].forEach((f) => {
        const b = arena.querySelector('[data-src="' + k + '"][data-field="' + f + '"]');
        if (b && (b.getAttribute('aria-pressed') === 'true') !== want[f]) b.click();
      });
    });
    const o = arena.querySelector('[data-order]');
    if (o && (o.getAttribute('aria-pressed') === 'true') !== r.styleFirst) o.click();
  }

  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-pick]');
    if (!b || b.disabled) return;
    pick = b.dataset.pick;
    root.querySelectorAll('[data-pick]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    $('#pq-reveal').disabled = false;
  });
  $('#pq-reveal').addEventListener('click', () => {
    if (!pick) return;
    const r = ROUNDS[i];
    const live = winner(r);
    const answer = live.length ? SRC[live[0].k].name : 'black';
    const ok = pick === answer;
    if (ok) score++;
    setArena(r);
    root.querySelectorAll('[data-pick]').forEach((x) => { x.disabled = true; });
    $('#pq-reveal').disabled = true;
    const ex = $('#pq-explain');
    ex.className = 'pq-explain ' + (ok ? 'is-right' : 'is-wrong');
    ex.innerHTML = '<strong>' + (ok ? 'Right, ' + answer + '.' : 'It is ' + answer + ', not ' + pick + '.') + '</strong> ';
    ex.appendChild(document.createTextNode(why(live) + ' The arena above now shows this setup.'));
    $('#pq-progress').textContent = 'Round ' + (i + 1) + ' of ' + ROUNDS.length + ', score ' + score;
    const next = $('#pq-next');
    next.hidden = false;
    next.textContent = i === ROUNDS.length - 1 ? 'See your score' : 'Next round';
    next.focus();
  });
  $('#pq-next').addEventListener('click', () => {
    if (i < ROUNDS.length - 1) { i++; show(); $('#pq-setup').scrollIntoView({ block: 'nearest' }); return; }
    $('#pq-progress').textContent = 'Final score ' + score + ' of ' + ROUNDS.length;
    if (window.courseDone) window.courseDone();
    $('#pq-explain').className = 'pq-explain';
    $('#pq-explain').textContent = 'Order of power: !important first, then the style attribute, then whichever sheet comes last.';
    $('#pq-next').textContent = 'Play again';
    i = -1; score = 0;
    $('#pq-next').onclick = () => { $('#pq-next').onclick = null; i = 0; show(); };
  });

  /* Motion switch: off by default when the system asks for reduced motion. */
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sw = $('#pq-motion');
  sw.checked = !reduce;
  const apply = () => {
    document.documentElement.classList.toggle('motion-on', sw.checked);
    document.documentElement.classList.toggle('motion-off', !sw.checked);
  };
  sw.addEventListener('change', apply);
  apply();
  show();
})();
