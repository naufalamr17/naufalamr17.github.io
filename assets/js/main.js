(() => {
  document.documentElement.classList.add('js');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.getElementById('year').textContent = new Date().getFullYear();

  const menu = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('navigation');
  const header = document.querySelector('.site-header');
  let lastScrollY = window.scrollY;
  const closeMenu = () => {
    navigation.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
  };
  menu.addEventListener('click', () => {
    const open = navigation.classList.toggle('is-open');
    menu.setAttribute('aria-expanded', String(open));
    if (open) header.classList.remove('is-hidden');
  });
  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
      closeMenu();
      menu.focus();
    }
  });
  const syncHeader = () => {
    const scrollY = window.scrollY;
    header.classList.toggle('is-scrolled', scrollY > 20);
    if (scrollY <= 20 || scrollY < lastScrollY || navigation.classList.contains('is-open')) header.classList.remove('is-hidden');
    else if (scrollY > 120) header.classList.add('is-hidden');
    lastScrollY = scrollY;
  };
  window.addEventListener('scroll', syncHeader, { passive:true });
  syncHeader();

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.remove('pending');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(element => {
      element.classList.add('pending');
      observer.observe(element);
    });
  }

  const filters = document.querySelector('.filters');
  const cards = [...document.querySelectorAll('.project-card')];
  filters.hidden = false;
  let activeFilter = 'all';
  filters.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button || button.dataset.filter === activeFilter) return;
    activeFilter = button.dataset.filter;
    filters.querySelectorAll('button').forEach(item => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    let visibleIndex = 0;
    cards.forEach(card => {
      const visible = activeFilter === 'all' || card.dataset.category === activeFilter;
      card.hidden = !visible;
      card.classList.remove('tab-enter');
      if (visible) {
        card.classList.remove('pending');
        card.style.animationDelay = `${visibleIndex++ * 55}ms`;
        void card.offsetWidth;
        card.classList.add('tab-enter');
      }
    });
    document.getElementById('filter-status').textContent = cards.filter(card => !card.hidden).length + ' projects shown.';
  });

  const dialog = document.getElementById('preview-dialog');
  document.querySelectorAll('[data-preview]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || typeof dialog.showModal !== 'function') return;
      event.preventDefault();
      document.getElementById('preview-title').textContent = link.dataset.title;
      document.getElementById('preview-caption').textContent = link.dataset.caption;
      const image = document.getElementById('preview-image');
      image.src = link.href;
      image.alt = link.querySelector('img').alt;
      dialog.showModal();
    });
  });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });

  const canvas = document.getElementById('particle-field');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const motionButton = document.getElementById('motion-toggle');
  let width = 0;
  let height = 0;
  let frame = 0;
  let visible = true;
  let paused = false;
  let time = 0;
  let lastTick = 0;

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const narrow = width < 760;
    const centerX = width * (narrow ? .9 : .79);
    const centerY = height * .48;
    const radius = Math.min(width * .34, height * .55);
    for (let ring = 0; ring < 42; ring++) {
      for (let step = 0; step < 95; step++) {
        const angle = step / 95 * Math.PI * 2;
        const phase = time * .18;
        const ripple = Math.sin(angle * 3 + ring * .07 + phase) * .12;
        const spread = .35 + ring / 55;
        const x = Math.cos(angle) * radius * spread;
        const y = Math.sin(angle) * radius * spread * .54;
        const wave = Math.sin(angle * 2 + ring * .1 + phase) * radius * .15;
        const px = centerX + x * .82 - y * .45;
        const py = centerY + x * .35 + y + wave + ripple * radius;
        const opacity = .14 + (Math.cos(angle + ring * .05) + 1) * .2;
        ctx.fillStyle = ring % 11 === 0 && step % 4 === 0 ? 'rgba(117,139,32,' + opacity + ')' : 'rgba(45,53,39,' + opacity + ')';
        const size = ring % 7 === 0 ? 1.6 : 1;
        ctx.fillRect(px, py, size, size);
      }
    }
  }
  function tick(now) {
    frame = 0;
    if (now - lastTick > 32) {
      time += .032;
      draw();
      lastTick = now;
    }
    if (!paused && !reducedMotion.matches && visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function syncMotion() {
    cancelAnimationFrame(frame);
    frame = 0;
    motionButton.hidden = reducedMotion.matches;
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.textContent = paused ? 'Play motion' : 'Pause motion';
    draw();
    if (!paused && !reducedMotion.matches && visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }
  motionButton.addEventListener('click', () => { paused = !paused; syncMotion(); });
  reducedMotion.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);
  window.addEventListener('resize', resize, { passive: true });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncMotion(); }).observe(canvas);
  }
  resize();
  syncMotion();
})();
