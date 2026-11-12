(() => {
  document.documentElement.classList.add('js');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.getElementById('year').textContent = new Date().getFullYear();
  let characterIndex = 0;
  document.querySelectorAll('.title-line').forEach(line => {
    const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) {
      if (!walker.currentNode.parentElement.closest('.pixel-spark')) textNodes.push(walker.currentNode);
    }
    textNodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      for (const letter of node.textContent) {
        const span = document.createElement('span');
        span.className = 'title-char';
        span.textContent = letter;
        span.style.setProperty('--char-index', characterIndex++);
        fragment.append(span);
      }
      node.replaceWith(fragment);
    });
  });

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

  const serviceTabs = [...document.querySelectorAll('[data-service]')];
  const servicePanels = [...document.querySelectorAll('.service-panel')];
  const selectService = tab => {
    serviceTabs.forEach(button => {
      const selected = button === tab;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    servicePanels.forEach(panel => {
      panel.hidden = panel.id !== tab.getAttribute('aria-controls');
      panel.classList.remove('panel-enter');
      if (!panel.hidden) {
        void panel.offsetWidth;
        panel.classList.add('panel-enter');
      }
    });
  };
  document.querySelector('.service-tabs').hidden = false;
  selectService(serviceTabs[0]);
  serviceTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectService(tab));
    tab.addEventListener('keydown', event => {
      let next = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % serviceTabs.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + serviceTabs.length) % serviceTabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = serviceTabs.length - 1;
      else return;
      event.preventDefault();
      selectService(serviceTabs[next]);
      serviceTabs[next].focus();
    });
  });

  const snakeDialog = document.getElementById('snake-dialog');
  const snakeTrigger = document.getElementById('snake-trigger');
  const snakeBoard = document.getElementById('snake-board');
  const snakeContext = snakeBoard.getContext('2d');
  if (snakeContext && typeof snakeDialog.showModal === 'function') {
    const cells = 15;
    const cellSize = snakeBoard.width / cells;
    const status = document.getElementById('snake-status');
    let snake = [];
    let apple = { x: 0, y: 0 };
    let direction = { x: 1, y: 0 };
    let nextDirection = direction;
    let score = 0;
    let snakeTimer = 0;
    let ready = false;

    const placeApple = () => {
      do apple = { x: Math.floor(Math.random() * cells), y: Math.floor(Math.random() * cells) };
      while (snake.some(part => part.x === apple.x && part.y === apple.y));
    };
    const drawSnake = () => {
      snakeContext.fillStyle = '#21172f';
      snakeContext.fillRect(0, 0, snakeBoard.width, snakeBoard.height);
      snakeContext.fillStyle = '#f758b7';
      snake.forEach(part => snakeContext.fillRect(part.x * cellSize + 2, part.y * cellSize + 2, cellSize - 4, cellSize - 4));
      snakeContext.fillStyle = '#d9f37c';
      snakeContext.fillRect(apple.x * cellSize + 5, apple.y * cellSize + 5, cellSize - 10, cellSize - 10);
    };
    const updateStatus = message => { status.textContent = message || `Score: ${score} · Use arrow keys or the controls.`; };
    const stopSnake = message => {
      clearInterval(snakeTimer);
      snakeTimer = 0;
      ready = false;
      updateStatus(message);
    };
    const moveSnake = () => {
      direction = nextDirection;
      const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
      const hitWall = head.x < 0 || head.x >= cells || head.y < 0 || head.y >= cells;
      const hitSnake = snake.some(part => part.x === head.x && part.y === head.y);
      if (hitWall || hitSnake) return stopSnake(`Game over · Score: ${score}. Press Restart to play again.`);
      snake.unshift(head);
      if (head.x === apple.x && head.y === apple.y) {
        score += 1;
        placeApple();
      } else snake.pop();
      drawSnake();
      updateStatus();
    };
    const startSnake = () => {
      clearInterval(snakeTimer);
      snake = [{ x: 8, y: 7 }, { x: 7, y: 7 }, { x: 6, y: 7 }];
      direction = { x: 1, y: 0 };
      nextDirection = direction;
      score = 0;
      placeApple();
      drawSnake();
      snakeTimer = 0;
      ready = true;
      updateStatus('Ready · Choose a direction to start.');
    };
    const setDirection = name => {
      const candidate = { up:{ x:0, y:-1 }, down:{ x:0, y:1 }, left:{ x:-1, y:0 }, right:{ x:1, y:0 } }[name];
      if (!candidate || (candidate.x === -direction.x && candidate.y === -direction.y)) return;
      nextDirection = candidate;
      if (ready) {
        ready = false;
        updateStatus();
        snakeTimer = window.setInterval(moveSnake, 240);
      }
    };
    snakeTrigger.addEventListener('click', () => {
      snakeDialog.showModal();
      startSnake();
    });
    document.getElementById('snake-restart').addEventListener('click', startSnake);
    document.getElementById('snake-close').addEventListener('click', () => snakeDialog.close());
    document.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click', () => setDirection(button.dataset.direction)));
    document.addEventListener('keydown', event => {
      if (!snakeDialog.open) return;
      const keys = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right' };
      if (!keys[event.key]) return;
      event.preventDefault();
      setDirection(keys[event.key]);
    });
    snakeDialog.addEventListener('close', () => {
      stopSnake();
      snakeTrigger.focus();
    });
  }

  const canvas = document.getElementById('particle-field');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const motionButton = document.getElementById('motion-toggle');
  const hero = document.querySelector('.hero');
  let width = 0;
  let height = 0;
  let frame = 0;
  let visible = true;
  let paused = false;
  let time = 0;
  let lastTick = 0;
  let scrollFrame = 0;

  function updateScrollMotion() {
    scrollFrame = 0;
    const progress = window.scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
    document.documentElement.style.setProperty('--reading-progress', progress);
    const moving = !paused && !reducedMotion.matches;
    const heroProgress = moving ? Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / hero.offsetHeight)) : 0;
    hero.style.setProperty('--hero-drift', `${heroProgress * 30}px`);
    cards.forEach(card => {
      const shift = moving ? Math.max(-12, Math.min(12, (innerHeight * .55 - card.getBoundingClientRect().top) * .035)) : 0;
      card.style.setProperty('--image-shift', `${shift}px`);
    });
  }
  function scheduleScrollMotion() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollMotion);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const narrow = width < 760;
    const count = narrow ? 250 : 1000;
    for (let i = 0; i < count; i++) {
      const x = (i * 137.508) % width;
      const y = (i * 91.37) % height + Math.sin(time * .2 + i) * 3;
      const distance = Math.hypot((x - width * .5) / (width * .55), (y - height * .4) / (height * .6));
      ctx.globalAlpha = Math.max(0, 1 - distance) * (.2 + Math.sin(time * .3 + i) * .08);
      ctx.fillStyle = i % 3 === 0 ? '#f9b4dd' : '#b18ad1';
      const size = i % 23 === 0 ? 3 : 1;
      ctx.fillRect(Math.round(x), Math.round(y), size, size);
    }
    ctx.globalAlpha = 1;
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
    document.documentElement.classList.toggle('motion-paused', paused || document.hidden);
    hero.classList.toggle('scene-paused', !visible);
    updateScrollMotion();
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
  window.addEventListener('resize', scheduleScrollMotion, { passive:true });
  window.addEventListener('scroll', scheduleScrollMotion, { passive:true });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncMotion(); }).observe(canvas);
  }
  resize();
  syncMotion();
})();
