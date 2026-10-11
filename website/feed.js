(() => {
  const CLIPS = [
    '13929852', '4994156', '6892735', '6948555', '6951168', '6962123', '6965116',
    '7231255', '7261920', '7599934', '7599935', '8724213', '9032413',
  ];
  const REASONS = [
    ['41:12', 'The pause before the answer'],
    ['08:47', 'A question anyone would stop for'],
    ['23:05', 'The laugh lands at 0:07'],
    ['52:31', 'Strong opinion, said once'],
    ['17:40', 'A story with a clear payoff'],
    ['33:18', 'The line people will quote'],
    ['04:56', 'Energy shifts. Hands come up.'],
    ['46:02', 'Answers what viewers keep asking'],
  ];
  const MARKS = `<svg class="marks" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path pathLength="1" d="M0 14 V0 H14" vector-effect="non-scaling-stroke"/>
      <path pathLength="1" d="M86 0 H100 V14" vector-effect="non-scaling-stroke"/>
      <path pathLength="1" d="M100 86 V100 H86" vector-effect="non-scaling-stroke"/>
      <path pathLength="1" d="M14 100 H0 V86" vector-effect="non-scaling-stroke"/>
    </svg>`;

  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let motion = !reduce;
  const sections = [...document.querySelectorAll('.short')].filter((s) => !s.parentElement.closest('.trio'));
  let active = 0;
  const onChange = []; // callbacks run when active screen or motion changes

  /* ---------- Video helpers ---------- */
  function still(v, t = 1.5) {
    const seek = () => { try { v.currentTime = Math.min(t, (v.duration || 3) - 0.2); } catch (e) {} };
    if (v.readyState >= 1) seek(); else v.addEventListener('loadedmetadata', seek, { once: true });
  }
  document.querySelectorAll('video').forEach((v) => { v.muted = true; still(v); });

  function visibleLayer(v) {
    const layer = v.closest('.layer');
    return !layer || layer.classList.contains('is-on');
  }
  window.__syncVideos = () => syncVideos();
  function syncVideos() {
    sections.forEach((s, i) => {
      s.querySelectorAll('video[data-play]').forEach((v) => {
        if (motion && i === active && visibleLayer(v) && !v.closest('.trio > .short:not(.is-sel)')) v.play().catch(() => {});
        else v.pause();
      });
    });
  }

  /* ---------- Reel walls ---------- */
  function makeWall(wall, { perCol, durBase, durStep, offset }) {
    const cols = getComputedStyle(wall).gridTemplateColumns.split(' ').length;
    for (let c = 0; c < cols; c++) {
      const col = document.createElement('div');
      col.className = 'col';
      const track = document.createElement('div');
      track.className = 'track';
      track.style.setProperty('--dur', `${durBase + (c % 3) * durStep}s`);
      track.style.animationDelay = `${-c * 9}s`;
      const ids = Array.from({ length: perCol }, (_, i) => CLIPS[(c * 3 + i * 5 + offset) % CLIPS.length]);
      [...ids, ...ids].forEach((id) => {
        const el = document.createElement('div');
        el.className = 'clip';
        el.innerHTML = `<video src="assets/video/${id}.mp4" muted loop playsinline preload="metadata"></video>${MARKS}<p class="why"><b></b><span></span></p>`;
        still(el.querySelector('video'));
        track.appendChild(el);
      });
      col.appendChild(track);
      wall.appendChild(col);
    }
  }

  function wallPicker(section, { every, hover }) {
    const wall = section.querySelector('.wall');
    const copy = section.querySelector('.wallcopy');
    const idx = sections.indexOf(section.closest('.trio') || section);
    let current = null;
    let n = idx * 3;
    let hovering = false;

    function pick(el) {
      if (current === el) return;
      unpick();
      const [tc, why] = REASONS[n++ % REASONS.length];
      el.querySelector('.why b').textContent = tc;
      el.querySelector('.why span').textContent = why;
      el.classList.add('is-picked');
      if (motion && active === idx) el.querySelector('video').play().catch(() => {});
      current = el;
    }
    function unpick() {
      if (!current) return;
      current.classList.remove('is-picked');
      current.querySelector('video').pause();
      current = null;
    }
    function candidates() {
      const s = section.getBoundingClientRect();
      const c = copy.getBoundingClientRect();
      const phone = innerWidth <= 760;
      return [...wall.querySelectorAll('.clip')].filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < s.top + 96 || r.bottom > s.bottom - 40 || r.left < s.left - 4 || r.right > s.right - 80) return false;
        if (phone) return r.bottom < c.top - 8 && r.top > s.top + 50;
        return r.left > s.left + s.width * 0.55 && r.top > s.top + 130 && r.bottom < s.bottom - 70;
      });
    }
    function tick(force) {
      if (hovering || active !== idx) return;
      if (!motion && !force) return;
      const list = candidates().filter((el) => el !== current);
      if (list.length) pick(list[Math.floor(Math.random() * list.length)]);
      else if (force && !current) setTimeout(() => tick(true), 700);
    }
    setInterval(() => tick(false), every);
    if (hover) {
      wall.addEventListener('pointerover', (e) => {
        const el = e.target.closest('.clip');
        if (!el) return;
        hovering = true;
        pick(el);
      });
      wall.addEventListener('pointerleave', () => { hovering = false; });
    }
    onChange.push(() => {
      if (active === idx) {
        if (!current) setTimeout(() => tick(true), 500);
        else if (motion) current.querySelector('video').play().catch(() => {});
        else current.querySelector('video').pause();
      } else if (current) current.querySelector('video').pause();
    });
  }

  makeWall(document.querySelector('[data-wall="hero"]'), { perCol: 4, durBase: 70, durStep: 14, offset: 0 });
  makeWall(document.querySelector('[data-wall="end"]'), { perCol: 3, durBase: 150, durStep: 30, offset: 7 });
  wallPicker(document.getElementById('top'), { every: 3200, hover: true });

  /* ---------- Karaoke captions ---------- */
  function setCaption(el, text) {
    const words = text.split(' ');
    const inner = words.map((w, i) => `<span${i === 0 ? ' class="hot"' : ''}>${w}</span>`).join(' ');
    el.innerHTML = el.classList.contains('cap--2') ? `<span class="cap__box">${inner}</span>` : inner;
  }
  setInterval(() => {
    if (!motion) return;
    sections[active].querySelectorAll('[data-caption]').forEach((el) => {
      const words = [...el.querySelectorAll('span:not(.cap__box)')];
      if (!words.length) return;
      const i = words.findIndex((w) => w.classList.contains('hot'));
      words.forEach((w) => w.classList.remove('hot'));
      words[(i + 1) % words.length].classList.add('hot');
    });
  }, 420);

  /* ---------- Rail controller ---------- */
  function rail(section, { initial, apply, interval, order }) {
    const idx = sections.indexOf(section.closest('.trio') || section);
    const buttons = [...section.querySelectorAll('.rail button[data-mode]')];
    const modes = order || buttons.map((b) => b.dataset.mode);
    const live = section.querySelector('[data-status]');
    let mode = initial;
    let pos = Math.max(0, modes.indexOf(initial));
    let touched = false;

    function set(m, fromUser) {
      const repeat = m === mode;
      mode = m;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === pressedFor(m))));
      if (live) live.setAttribute('aria-live', fromUser ? 'polite' : 'off');
      apply(m, { repeat, fromUser, wrapped: !fromUser && repeat === false && modes.indexOf(m) === 0 && started });
      syncVideos();
    }
    const pressedFor = (m) => (buttons.some((b) => b.dataset.mode === m) ? m : 'clips');
    let started = false;

    buttons.forEach((b) => b.addEventListener('click', () => {
      touched = true;
      const m = b.dataset.mode;
      set(m === 'clips' && order ? nextClip() : m, true);
    }));
    function nextClip() {
      const clips = modes.filter((m) => m.startsWith('clip'));
      const at = clips.indexOf(mode);
      return clips[(at + 1) % clips.length];
    }
    setInterval(() => {
      if (touched || !motion || active !== idx) return;
      pos = (modes.indexOf(mode) + 1) % modes.length;
      set(modes[pos], false);
    }, interval);
    set(initial, false);
    started = true;
    return { touch() { touched = true; }, get mode() { return mode; }, set };
  }

  /* Keep / skip: visual state only, no counts */
  function clipActions(section, keyFn) {
    const frame = section.querySelector('.frame');
    const keep = section.querySelector('[data-act="keep"]');
    const skip = section.querySelector('[data-act="skip"]');
    const state = {};
    function render() {
      const s = state[keyFn()] || '';
      keep.setAttribute('aria-pressed', String(s === 'keep'));
      skip.setAttribute('aria-pressed', String(s === 'skip'));
      keep.querySelector('.rail__label').textContent = s === 'keep' ? 'Kept' : 'Keep';
      frame.classList.toggle('is-skipped', s === 'skip');
    }
    [keep, skip].forEach((b) => b.addEventListener('click', () => {
      const k = keyFn();
      state[k] = state[k] === b.dataset.act ? '' : b.dataset.act;
      render();
    }));
    render();
    return render;
  }

  function setLayers(frame, name) {
    frame.querySelectorAll('[data-layer]').forEach((l) => l.classList.toggle('is-on', l.dataset.layer === name));
  }
  function redraw(el) {
    el.classList.remove('is-marked');
    void el.offsetWidth;
    el.classList.add('is-marked');
  }

  /* Screen 2: ranked results, every score shows its work */
  (() => {
    const section = document.getElementById('why');
    const frame = section.querySelector('.frame');
    const CLIPS_R = [
      {
        title: 'The Week Nobody Watched', score: 96, hook: 'Everyone asks how we grew. Here is the truth.',
        g: {
          hook: ['A-', '41:12', 'Everyone asks how we grew. Honestly? We stopped posting what we thought people wanted.', 'Opens on a question the audience already asks. No warm-up.'],
          flow: ['A', '41:19', 'We posted the stuff we argued about in the office.', 'The answer follows seven seconds later, with no detour.'],
          value: ['B+', '41:27', 'And it was messy, right? Some weeks nobody watched.', 'Admits the cost, which makes the advice believable.'],
          trend: ['A-', '41:35', 'But the ones that worked, they really worked.', 'Candid growth stories are a format viewers already seek out.'],
        },
      },
      {
        title: 'Why Our Worst Video Won', score: 92, hook: 'Our worst video beat everything we made.',
        g: {
          hook: ['A', '12:03', 'Our worst-looking video is still our most watched.', 'A contradiction in the first line makes people stay to hear why.'],
          flow: ['B+', '12:10', 'Shot on a phone, bad light, one take.', 'Short, concrete details keep the pace up.'],
          value: ['A-', '12:18', 'People trusted it because it was not trying so hard.', 'Ends on a takeaway a viewer can use today.'],
          trend: ['B', '12:24', 'Since then we film first and fix it later.', 'Matches the lo-fi, one-take style common on vertical feeds.'],
        },
      },
      {
        title: 'Stop Polishing Your Clips?!', score: 89, hook: 'Nobody wants your polished version.',
        g: {
          hook: ['B+', '27:40', 'Nobody wants the polished version of you.', 'A direct, slightly provocative opener.'],
          flow: ['A-', '27:46', 'They want the version that is still figuring it out.', 'The second line completes the thought, so the clip reads as one idea.'],
          value: ['B', '27:53', 'So post the draft. Then post the next one.', 'One clear action, though it stays general.'],
          trend: ['A-', '28:01', 'That is how we got from zero to a real audience.', 'Growth journeys travel well as shorts.'],
        },
      },
    ];
    const NAMES = { hook: 'Hook', flow: 'Flow', value: 'Value', trend: 'Trend' };
    let clip = 0;
    let grade = 'hook';
    const $ = (s) => frame.querySelector(s);
    const why = $('[data-status]');
    const renderActs = clipActions(section, () => clip);

    function renderClip() {
      const c = CLIPS_R[clip];
      setLayers(frame, null);
      frame.querySelectorAll('[data-clip]').forEach((l) => l.classList.toggle('is-on', Number(l.dataset.clip) === clip));
      $('[data-rank]').textContent = `#${clip + 1} of 3`;
      $('[data-title]').textContent = c.title;
      $('[data-score]').textContent = c.score;
      $('[data-hook]').textContent = c.hook;
      frame.querySelectorAll('[data-grade]').forEach((li) => { li.querySelector('b').textContent = c.g[li.dataset.grade][0]; });
      $('[data-next]').setAttribute('aria-label', `Next clip, ${((clip + 1) % 3) + 1} of 3`);
      renderActs();
    }
    function renderGrade() {
      const [letter, tc, line, reason] = CLIPS_R[clip].g[grade];
      frame.querySelectorAll('[data-grade]').forEach((li) => li.classList.toggle('is-on', li.dataset.grade === grade));
      why.innerHTML = `<b>${NAMES[grade]} ${letter}.</b> ${reason}`;
      $('[data-tc]').textContent = tc;
      $('[data-line]').textContent = line;
      redraw(frame);
    }
    renderClip();
    const r = rail(section, {
      initial: 'hook', interval: 4200,
      apply(m, { wrapped }) {
        grade = m;
        if (wrapped) { clip = (clip + 1) % 3; renderClip(); }
        renderGrade();
      },
    });
    $('[data-next]').addEventListener('click', () => {
      r.touch();
      clip = (clip + 1) % 3;
      renderClip();
      renderGrade();
      syncVideos();
    });
  })();

  /* Screen 3: tools */
  (() => {
    const section = document.getElementById('tools');
    const frame = section.querySelector('.frame');
    const cap = frame.querySelector('[data-caption]');
    const status = frame.querySelector('[data-status]');
    const STYLES = ['Highlight', 'Boxed', 'Lower case'];
    let style = 0;
    let fillTimer;
    const STATUS = {
      find: 'Find: the agent marks the moment and says why.',
      reframe: 'Reframe: 16:9 source, now 9:16 with the speaker kept in frame.',
      broll: 'B-roll: a cutaway matched to what is being said.',
      publish: 'Publish: scheduled to four platforms.',
      more: 'More: every tool in the OpusClip app.',
    };
    setCaption(cap, 'Nobody tells you this part');
    clipActions(section, () => 0);
    rail(section, {
      initial: 'find', interval: 3800,
      apply(m, { repeat }) {
        frame.dataset.tool = m;
        frame.classList.remove('is-filled');
        frame.classList.remove('is-marked');
        clearTimeout(fillTimer);
        setLayers(frame, m);
        if (m === 'find') redraw(frame);
        if (m === 'reframe') fillTimer = setTimeout(() => frame.classList.add('is-filled'), 700);
        if (m === 'captions') {
          if (repeat) style = (style + 1) % STYLES.length;
          cap.className = `caption cap--${style + 1}`;
          setCaption(cap, 'Nobody tells you this part');
          status.textContent = `Captions: ${STYLES[style]} style, ${style + 1} of 3. Press again for the next.`;
        } else status.textContent = STATUS[m];
      },
    });
  })();

  /* Creators: decorative profile marquees, alternating direction */
  (() => {
    const section = document.getElementById('creators');
    const idx = sections.indexOf(section.closest('.trio') || section);
    const P = [
      ['Mark Rober', '65.9M'], ['jraahpodcast', 'Watch time up 57%'], ['Dhar Mann Studios', '24.8M'], ['Logan Paul', '23.6M'],
      ['matt nappo', 'Podcast viewers up 30%'], ['Jubilee Media', '9.79M'], ['Linguamarina', '8.52M'], ['Closeted Kicks Convos', 'Watch time up 40%+'],
      ['What If', '7.9M'], ['Valuetainment', '5.3M'], ['Wake Up Warrior', 'Views up 2x'], ['Jacksfilms', '5.08M'],
      ['Grant Cardone', '4.7M'], ['Karen V. Kitt', 'Shown-in-feed up 266%'], ['Tom Bilyeu', '4.5M'], ['TwoSetViolin', '4.3M'],
      ['veteransarchives', 'Full watches from 1-3% to 12%+'], ['Jenny Hoyos', '4M'], ['Mai Pham', '3.3M'], ['RoJo Travel', 'Watch time up 50%'],
      ['Armchair Historian', '2.2M'], ['FLAGRANT', '1.5M'], ['BurstonWithComedy', 'Views now 500-1,000'], ['Jon Youshaei', '435K'],
      ['Sebastien Jefferies', '422K'], ['Scott Galloway', '192K'], ['SaaStr', '54.4K'], ['WildBrain', 'OpusClip user'],
    ];
    const AV = {
      'Armchair Historian': 'armchair-historian.webp', 'Dhar Mann Studios': 'dhar-mann-studios.png', FLAGRANT: 'flagrant.webp',
      'Grant Cardone': 'grant-cardone.webp', Jacksfilms: 'jacksfilms.avif', 'Jenny Hoyos': 'jenny-hoyos.png', 'Jon Youshaei': 'jon-youshaei.webp',
      'Jubilee Media': 'jubilee-media.avif', Linguamarina: 'linguamarina.jpg', 'Logan Paul': 'logan-paul.webp', 'Mai Pham': 'mai-pham.webp',
      'Mark Rober': 'mark-rober.avif', SaaStr: 'saastr.webp', 'Scott Galloway': 'scott-galloway.webp', 'Sebastien Jefferies': 'sebastien-jefferies.webp',
      'Tom Bilyeu': 'tom-bilyeu.avif', TwoSetViolin: 'twosetviolin.webp', Valuetainment: 'valuetainment.webp', 'What If': 'what-if.webp',
    };
    const initials = (n) => n.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || n[0].toUpperCase();
    const rows = [...section.querySelectorAll('.mq-row')];
    const per = Math.ceil(P.length / rows.length);
    rows.forEach((row, r) => {
      const track = row.querySelector('.mq-track');
      const set = P.slice(r * per, r * per + per);
      const html = set.map(([name, sub], i) => {
        const k = (r + i) % 3;
        const chip = (r + i) % 2 ? 'chip-p chip-p--paper' : 'chip-p';
        return `<div class="${chip}">${AV[name] ? `<img class="chip-p__av chip-p__av--img" src="assets/creators/${AV[name]}" alt="" decoding="async">` : `<span class="chip-p__av chip-p__av--${k}">${initials(name)}</span>`}<span class="chip-p__txt"><b>${name}</b><span>${sub}</span></span></div>`;
      }).join('');
      track.innerHTML = html + html;
      track.style.setProperty('--mq-dur', `${70 + r * 14}s`);
      row.classList.toggle('mq-row--rev', r % 2 === 1);
    });
    const sync = () => section.classList.toggle('is-running', motion && active === idx);
    onChange.push(sync);
  })();

  /* Screen 5: teams, the brand template */
  (() => {
    const section = document.getElementById('teams');
    const frame = section.querySelector('.frame');
    const title = frame.querySelector('[data-tpl-title]');
    const TITLES = { style: 'Style', brand: 'Brand', ai: 'AI', schedule: 'Calendar <span class="beta">Beta</span>' };
    rail(section, {
      initial: 'style', interval: 4200,
      apply(m) {
        frame.dataset.tool = m;
        title.innerHTML = TITLES[m];
        frame.querySelectorAll('[data-panel]').forEach((p) => { p.hidden = p.dataset.panel !== m; });
        requestAnimationFrame(() => measure());
      },
    });
    const aspects = [...frame.querySelectorAll('.aspect button')];
    const copy = section.querySelector('.short__copy');
    const measure = () => section.style.setProperty('--stage-h', `${copy.getBoundingClientRect().top - section.getBoundingClientRect().top}px`);
    addEventListener('resize', measure);
    onChange.push(measure);
    aspects.forEach((b) => b.addEventListener('click', () => {
      frame.dataset.aspect = b.dataset.aspect;
      section.dataset.aspect = b.dataset.aspect;
      measure();
      aspects.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    }));
  })();

  /* ---------- Active screen tracking ---------- */
  const progress = [...document.querySelectorAll('.progress a')];
  const footer = document.getElementById('footer'); // the end zone: footer plus the hidden wordmark
  const siteFoot = footer.querySelector('.site-foot');
  const wordmark = footer.querySelector('[data-wordmark]');
  const prevBtn = document.querySelector('[data-step="-1"]');
  const nextBtn = document.querySelector('[data-step="1"]');
  let footerIn = false;
  let eggIn = false;
  function syncNav() { prevBtn.disabled = active === 0 && !footerIn; nextBtn.disabled = footerIn; }
  function syncWordmark() { if (eggIn && motion) wordmark.play().catch(() => {}); else wordmark.pause(); }
  new IntersectionObserver(([e]) => {
    footerIn = e.isIntersecting;
    root.classList.toggle('footer-in', footerIn);
    syncNav();
  }, { threshold: 0.35 }).observe(siteFoot);
  new IntersectionObserver(([e]) => { eggIn = e.isIntersecting; syncWordmark(); }).observe(footer.querySelector('.egg__spacer'));
  new IntersectionObserver(([e]) => footer.classList.toggle('egg-on', e.isIntersecting), { threshold: 1 }).observe(footer.querySelector('.egg__end'));
  onChange.push(syncWordmark);
  // Footer height drives the snap marker that rests the page on the footer's bottom edge
  const setFootH = () => footer.style.setProperty('--foot-h', `${siteFoot.offsetHeight}px`);
  setFootH(); new ResizeObserver(setFootH).observe(siteFoot);

  /* Elastic easter egg: once scrolling input stops inside the wordmark zone, spring back to the footer's
     bottom edge. Any input (wheel, touch, keys, our own scroll aside) re-arms the timer, so trackpad
     momentum that keeps firing wheel events at the page bottom can't leave the wordmark showing. */
  (() => {
    let raf = 0, idle = 0, held = false;
    const rest = () => siteFoot.getBoundingClientRect().bottom + scrollY - innerHeight;
    function settle() {
      if (held) return;
      const target = rest(), from = scrollY, dist = from - target;
      if (dist <= 1) return;
      if (!motion) { scrollTo(0, target); return; }
      const dur = Math.min(520, 260 + dist * 0.35), t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        raf = p < 1 ? requestAnimationFrame(step) : 0;
        scrollTo(0, from - dist * (1 - Math.pow(1 - p, 3)));
      };
      raf = requestAnimationFrame(step);
    }
    function arm() { clearTimeout(idle); idle = setTimeout(settle, 90); }
    function input() { if (raf) { cancelAnimationFrame(raf); raf = 0; } arm(); }
    const peek = () => footer.classList.toggle('egg-show', scrollY > rest() + 0.5);
    addEventListener('scroll', () => { peek(); if (!raf) arm(); }, { passive: true });
    peek();
    ['wheel', 'touchmove', 'keydown'].forEach((t) => addEventListener(t, input, { passive: true }));
    addEventListener('pointerdown', () => { held = true; input(); }, { passive: true });
    addEventListener('pointerup', () => { held = false; arm(); }, { passive: true });
    addEventListener('touchend', arm, { passive: true });
  })();

  function setActive(i) {
    active = i;
    root.dataset.tone = sections[i].dataset.tone;
    progress.forEach((a, j) => (j === i ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
    syncNav();
    syncVideos();
    onChange.forEach((f) => f());
  }
  // the screen under the middle of the viewport is the active one (works for screens taller than the viewport)
  function pickActive() {
    const mid = innerHeight / 2;
    const i = sections.findIndex((s) => { const r = s.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; });
    if (i >= 0 && i !== active) setActive(i);
  }
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; pickActive(); }); } }, { passive: true });
  setActive(0);
  pickActive();

  function go(step) {
    const behavior = reduce ? 'auto' : 'smooth';
    if (step > 0 && active === sections.length - 1) { footer.querySelector('.endzone__snap').scrollIntoView({ behavior, block: 'start' }); return; }
    if (step < 0 && footerIn) { sections[sections.length - 1].scrollIntoView({ behavior, block: 'start' }); return; }
    const t = sections[Math.min(sections.length - 1, Math.max(0, active + step))];
    t.scrollIntoView({ behavior, block: 'start' });
  }
  prevBtn.addEventListener('click', () => go(-1));
  nextBtn.addEventListener('click', () => go(1));
  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest('input, textarea, select, [contenteditable]')) return;
    if (e.key === 'j') { e.preventDefault(); go(1); }
    if (e.key === 'k') { e.preventDefault(); go(-1); }
  });

  /* ---------- Motion toggle ---------- */
  const motionBtn = document.querySelector('.dock__motion');
  function renderMotion() {
    root.classList.toggle('is-still', !motion);
    motionBtn.setAttribute('aria-label', motion ? 'Pause motion' : 'Play motion');
    motionBtn.querySelector('use').setAttribute('href', motion ? '#i-pause' : '#i-play');
  }
  motionBtn.addEventListener('click', () => {
    motion = !motion;
    renderMotion();
    syncVideos();
    onChange.forEach((f) => f());
  });
  renderMotion();

  /* ---------- Link forms ---------- */
  document.querySelectorAll('.drop').forEach((form) => {
    const input = form.querySelector('input');
    const msg = form.querySelector('.drop__msg');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = input.value.trim();
      let ok = false;
      try { ok = /^https?:$/.test(new URL(value).protocol); } catch (err) { ok = false; }
      if (!value) {
        form.dataset.state = 'error';
        msg.textContent = 'Paste a link to a video first, or upload a file.';
        input.focus();
      } else if (!ok) {
        form.dataset.state = 'error';
        msg.textContent = 'That does not look like a link. Try one that starts with https://';
        input.focus();
      } else {
        form.dataset.state = 'ok';
        msg.textContent = 'Got it. Sign up free and the agent starts watching.';
      }
    });
    input.addEventListener('input', () => { if (form.dataset.state === 'error') { form.dataset.state = ''; msg.textContent = ''; } });
  });

  /* ---------- Nav: top bar, frosted pill, dropdowns, mobile sheet ---------- */
  (() => {
    const nav = document.querySelector('.nav');
    const setState = () => { nav.dataset.state = scrollY > 40 ? 'pill' : 'top'; };
    addEventListener('scroll', setState, { passive: true });
    setState();

    const dds = [...nav.querySelectorAll('.dd')];
    const btnOf = (dd) => dd.querySelector('.dd__btn');
    const close = (dd, focus) => {
      btnOf(dd).setAttribute('aria-expanded', 'false');
      dd.querySelector('.dd__panel').hidden = true;
      if (focus) btnOf(dd).focus();
    };
    const open = (dd) => {
      dds.forEach((d) => { if (d !== dd) close(d); });
      btnOf(dd).setAttribute('aria-expanded', 'true');
      dd.querySelector('.dd__panel').hidden = false;
    };
    dds.forEach((dd) => {
      const b = btnOf(dd);
      let t;
      let hoverAt = 0;
      b.addEventListener('click', () => {
        const isOpen = b.getAttribute('aria-expanded') === 'true';
        if (isOpen && Date.now() - hoverAt < 600) return;
        if (isOpen) close(dd); else open(dd);
      });
      dd.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { clearTimeout(t); if (b.getAttribute('aria-expanded') !== 'true') hoverAt = Date.now(); open(dd); } });
      dd.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') t = setTimeout(() => close(dd), 180); });
      dd.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && b.getAttribute('aria-expanded') === 'true') { e.preventDefault(); close(dd, true); }
        if (e.key === 'ArrowDown' && e.target === b) { e.preventDefault(); open(dd); dd.querySelector('.dd__panel a').focus(); }
      });
      dd.addEventListener('focusout', (e) => { if (!dd.contains(e.relatedTarget)) close(dd); });
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('.dd')) dds.forEach((d) => close(d)); });

    const burger = nav.querySelector('.nav__burger');
    const sheet = document.getElementById('mnav');
    const x = sheet.querySelector('.mnav__close');
    const openSheet = () => { sheet.hidden = false; burger.setAttribute('aria-expanded', 'true'); root.classList.add('menu-open'); x.focus(); };
    const closeSheet = () => { sheet.hidden = true; burger.setAttribute('aria-expanded', 'false'); root.classList.remove('menu-open'); burger.focus(); };
    burger.addEventListener('click', openSheet);
    x.addEventListener('click', closeSheet);
    sheet.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeSheet));
    sheet.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeSheet(); return; }
      if (e.key !== 'Tab') return;
      const f = [...sheet.querySelectorAll('a, button')];
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
  })();

  /* Footer language switch */
  (() => {
    const btn = document.querySelector('.lang__btn');
    const list = document.getElementById('lang-list');
    const set = (open, focusBtn) => {
      btn.setAttribute('aria-expanded', String(open));
      list.hidden = !open;
      if (open) list.querySelector('a').focus();
      else if (focusBtn) btn.focus();
    };
    btn.addEventListener('click', () => set(list.hidden));
    list.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); set(false, true); } });
    btn.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !list.hidden) set(false, true); });
    document.querySelector('.lang').addEventListener('focusout', (e) => { if (!e.currentTarget.contains(e.relatedTarget)) set(false); });
    document.addEventListener('click', (e) => { if (!e.target.closest('.lang')) set(false); });
  })();

  /* Testimonials: drifting result cards and the analytics lightbox */
  (() => {
    const section = document.getElementById('stories');
    const idx = sections.indexOf(section.closest('.trio') || section);
    const track = section.querySelector('.ts__track');
    const copies = [...track.children].map((li) => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.inert = true; return c; });
    copies.forEach((c) => track.appendChild(c));
    const sync = () => section.classList.toggle('is-running', motion && active === idx);
    onChange.push(sync);
    const lb = section.querySelector('.lb');
    const img = lb.querySelector('.lb__img');
    const title = lb.querySelector('.lb__title');
    let opener = null;
    track.addEventListener('click', (e) => {
      const b = e.target.closest('.tr');
      if (!b) return;
      opener = b;
      img.src = `assets/testimonials/${b.dataset.full}`;
      img.alt = `Analytics screenshot shared by ${b.dataset.name}`;
      title.textContent = `${b.dataset.name}, ${b.querySelector('.tr__metric').textContent}`;
      lb.showModal();
    });
    lb.querySelector('.lb__close').addEventListener('click', () => lb.close());
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
    lb.addEventListener('close', () => { if (opener) opener.focus(); });
  })();
})();
