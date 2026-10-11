/* Trio selection: hover previews, click or focus pins, arrows move between phones. */
(() => {
  const trio = document.querySelector('.trio');
  if (!trio) return;
  const items = [...trio.querySelectorAll(':scope > .short')];
  let pinned = 1, timer;
  function select(i) {
    items.forEach((s, k) => {
      s.classList.toggle('is-sel', k === i);
      s.querySelector('.short__stage').setAttribute('aria-current', k === i ? 'true' : 'false');
    });
    if (window.__syncVideos) window.__syncVideos();
  }
  items.forEach((s, i) => {
    const stage = s.querySelector('.short__stage');
    stage.tabIndex = 0;
    stage.setAttribute('aria-label', `Show: ${s.querySelector('.headline').textContent}`);
    s.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(timer); timer = setTimeout(() => select(i), 120);
    });
    stage.addEventListener('click', () => { pinned = i; select(i); });
    stage.addEventListener('focus', () => { pinned = i; select(i); });
    stage.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const n = (i + (e.key === 'ArrowRight' ? 1 : items.length - 1)) % items.length;
      items[n].querySelector('.short__stage').focus();
    });
  });
  trio.addEventListener('pointerleave', () => { clearTimeout(timer); timer = setTimeout(() => select(pinned), 200); });
  select(pinned);
})();
