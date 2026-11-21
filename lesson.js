/* The original exercise in a browser frame: switch between the three files. */
(() => {
  'use strict';
  const frame = document.getElementById('orig-frame');
  const url = document.getElementById('orig-url');
  if (!frame) return;
  const buttons = document.querySelectorAll('[data-file]');
  buttons.forEach((b) => b.addEventListener('click', () => {
    const file = b.dataset.file;
    buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    frame.classList.remove('is-swapping');
    void frame.offsetWidth;
    frame.classList.add('is-swapping');
    frame.src = file;
    frame.title = 'The original exercise: ' + file;
    url.textContent = 'dress-code/' + file;
  }));
})();
