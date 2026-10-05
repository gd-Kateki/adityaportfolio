/* Shared progressive enhancements. Core content and links work without JavaScript. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const nav = $('#mainNav');
  const menuButton = $('.site-menu-toggle');
  const mobile = matchMedia('(max-width: 760px)');
  function closeMenu(restoreFocus = false) {
    nav?.classList.remove('menu-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    if (restoreFocus) menuButton?.focus();
  }
  if (nav && menuButton) {
    nav.classList.add('is-enhanced');
    const syncMenu = () => { menuButton.hidden = !mobile.matches; closeMenu(); };
    syncMenu(); mobile.addEventListener('change', syncMenu);
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('menu-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    $$('.site-links a').forEach(link => link.addEventListener('click', () => closeMenu()));
    document.addEventListener('click', event => { if (!nav.contains(event.target)) closeMenu(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('menu-open')) closeMenu(true);
    });
  }
  const backToTop = document.createElement('button');
  backToTop.type = 'button'; backToTop.className = 'back-to-top';
  backToTop.textContent = '↑ Back to top'; backToTop.hidden = true;
  document.body.append(backToTop);
  backToTop.addEventListener('click', () => {
    scrollTo({ top: 0, behavior: motion.matches ? 'instant' : 'smooth' });
    $('.site-logo')?.focus({ preventScroll: true });
  });
  const sectionMenu = $('.section-menu');
  const sectionLinks = $$('[data-section-link]');
  const readingSections = $$('[data-reading-section]');
  const currentLabel = $('[data-current-section]');
  sectionLinks.forEach(link => link.addEventListener('click', () => {
    sectionMenu.open = false;
    const heading = document.getElementById(link.hash.slice(1));
    heading?.classList.remove('reveal-pending');
    heading?.focus({ preventScroll: true });
  }));
  document.addEventListener('click', event => {
    if (sectionMenu && !sectionMenu.contains(event.target)) sectionMenu.open = false;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && sectionMenu?.open) {
      sectionMenu.open = false; $('summary', sectionMenu).focus();
    }
  });
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  let scheduled = false;
  function updateScroll() {
    nav?.classList.toggle('nav-compact', scrollY > 70);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
    backToTop.hidden = scrollY < 650;
    const current = readingSections.filter(section => section.getBoundingClientRect().top <= 190).at(-1);
    if (currentLabel) currentLabel.textContent = current?.textContent.trim() || 'Overview';
    sectionLinks.forEach(link => {
      if (current && link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scheduled = false;
  }
  addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  addEventListener('resize', updateScroll);
  updateScroll();
  $$('.site-links a').forEach(link => {
    const target = new URL(link.href);
    if (target.pathname === location.pathname && !target.hash) link.setAttribute('aria-current', 'page');
    if ($('.page-tools') && target.pathname.endsWith('/projects.html')) link.setAttribute('aria-current', 'true');
  });

  // Reveal only when the enhancement is available; never leave content hidden.
  if ('IntersectionObserver' in window && !motion.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('reveal-pending');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0, rootMargin: '0px 0px 24px 0px' });
    $$('.reveal').forEach(el => {
      if (el.getBoundingClientRect().top > innerHeight) el.classList.add('reveal-pending');
      observer.observe(el);
    });
    motion.addEventListener('change', () => {
      if (motion.matches) { $$('.reveal-pending').forEach(el => el.classList.remove('reveal-pending')); observer.disconnect(); }
    });
  }

  // Filters are reflected in the URL so a selected discipline is shareable.
  $$('[data-explorer]').forEach(explorer => {
    explorer.classList.add('is-ready');
    const buttons = $$('[data-filter]', explorer);
    const input = $('[data-project-search]', explorer);
    const cards = $$('.proj-card', explorer);
    const isCatalogue = Boolean(input);
    let clearButton;
    if (input) {
      const label = input.closest('label');
      const wrapper = document.createElement('div'); wrapper.className = 'search-wrap';
      label.replaceWith(wrapper); wrapper.append(label);
      clearButton = document.createElement('button'); clearButton.type = 'button';
      clearButton.className = 'search-clear'; clearButton.textContent = '×';
      clearButton.setAttribute('aria-label', 'Clear search'); wrapper.append(clearButton);
      clearButton.addEventListener('click', () => { input.value = ''; filter(); input.focus(); });
    }
    let active = 'all';
    function filter(save = true) {
      const query = input?.value.trim().toLowerCase() || '';
      if (clearButton) clearButton.hidden = !input.value;
      let count = 0;
      cards.forEach(card => {
        card.hidden = !((active === 'all' || card.dataset.discipline === active) && query.split(/\s+/).every(word => card.dataset.search.includes(word)));
        if (!card.hidden) count++;
      });
      buttons.forEach(button => {
        const selected = button.dataset.filter === active;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
      $('[data-result-count]', explorer).textContent = `${count} ${count === 1 ? 'project' : 'projects'}`;
      $('.empty-state', explorer).hidden = count > 0;
      if (save) explorer.dispatchEvent(new CustomEvent('projects:filtered', { bubbles: true }));
      if (save && isCatalogue) {
        const url = new URL(location.href);
        active === 'all' ? url.searchParams.delete('discipline') : url.searchParams.set('discipline', active);
        query ? url.searchParams.set('q', input.value.trim()) : url.searchParams.delete('q');
        history.replaceState(null, '', url);
      }
    }
    function restore() {
      const params = new URL(location.href).searchParams;
      active = ['game', 'uiux'].includes(params.get('discipline')) ? params.get('discipline') : 'all';
      if (input) input.value = params.get('q') || '';
      filter(false);
    }
    buttons.forEach(button => button.addEventListener('click', () => { active = button.dataset.filter; filter(); }));
    input?.addEventListener('input', () => filter());
    $('[data-reset-filters]', explorer).addEventListener('click', () => {
      active = 'all'; if (input) input.value = ''; filter(); (input || buttons[0]).focus();
    });
    if (isCatalogue) { restore(); addEventListener('popstate', restore); }
    else filter(false);
  });

  let toast = $('#toastNotification');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.setAttribute('role', 'status');
    document.body.append(toast);
  }
  let toastTimer;
  $$('[data-copy-email]').forEach(button => button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      await navigator.clipboard.writeText('aditya.gamedesigner0402@gmail.com');
      toast.textContent = 'Email address copied';
    } catch {
      toast.textContent = 'Please copy the email address shown below.';
    }
    clearTimeout(toastTimer);
    toast.classList.add('show-toast');
    toastTimer = setTimeout(() => toast.classList.remove('show-toast'), 3500);
    button.disabled = false;
  }));

  // Keep a readable fallback in the reserved image area if an asset cannot load.
  $$('img').forEach(img => {
    function unavailable() {
      if (img.parentElement?.classList.contains('image-unavailable')) return;
      const message = document.createElement('span'); message.className = 'image-unavailable';
      const title = document.createElement('span'); title.textContent = img.alt || 'Project image';
      const detail = document.createElement('small'); detail.textContent = 'Image unavailable. Please reload to try again.';
      title.append(detail); message.append(title); img.hidden = true; img.after(message);
      img.classList.remove('image-loading');
    }
    img.addEventListener('error', unavailable, { once: true });
    img.addEventListener('load', () => img.classList.remove('image-loading'), { once: true });
    if (img.complete) { if (!img.naturalWidth) unavailable(); }
    else img.classList.add('image-loading');
  });
  $$('.ia-wrap').forEach(diagram => {
    diagram.tabIndex = 0; diagram.setAttribute('role', 'region');
    diagram.setAttribute('aria-label', 'Information architecture diagram, scroll horizontally to explore');
    const hint = document.createElement('p'); hint.className = 'diagram-hint';
    hint.textContent = 'Scroll horizontally to explore the full diagram →'; diagram.before(hint);
  });

  // A native dialog provides keyboard containment, Escape, and an inert background.
  const images = $$('img[data-zoom]');
  if (images.length) {
    const dialog = document.createElement('dialog');
    dialog.className = 'image-dialog';
    dialog.setAttribute('aria-label', 'Project image viewer');
    dialog.innerHTML = '<button type="button" class="viewer-close" aria-label="Close image viewer">×</button><p class="viewer-status" role="status"></p><figure><img alt=""><figcaption aria-live="polite"></figcaption></figure><div class="viewer-controls"><button type="button" data-prev aria-label="Previous image">← Previous</button><span data-position></span><button type="button" data-next aria-label="Next image">Next →</button></div>';
    document.body.append(dialog);
    let current = 0, trigger, previousOverflow;
    const viewerImage = $('img', dialog), viewerStatus = $('.viewer-status', dialog);
    viewerImage.addEventListener('load', () => { viewerStatus.textContent = ''; viewerImage.hidden = false; });
    viewerImage.addEventListener('error', () => { viewerStatus.textContent = 'This image could not load. Try another image or close the viewer.'; viewerImage.hidden = true; });
    function display(index) {
      current = (index + images.length) % images.length;
      const source = images[current];
      viewerStatus.textContent = 'Loading image…'; viewerImage.hidden = false;
      $('img', dialog).src = source.currentSrc || source.src;
      $('img', dialog).alt = source.alt;
      $('figcaption', dialog).textContent = source.dataset.zoom || source.alt;
      $('[data-position]', dialog).textContent = `${current + 1} / ${images.length}`;
    }
    images.forEach((img, index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'image-zoom';
      button.setAttribute('aria-label', `Enlarge ${img.alt || 'project image'}`);
      img.replaceWith(button); button.append(img);
      button.addEventListener('click', () => {
        trigger = button; display(index); previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden'; dialog.showModal();
      });
    });
    $('.viewer-close', dialog).addEventListener('click', () => dialog.close());
    $('[data-prev]', dialog).addEventListener('click', () => display(current - 1));
    $('[data-next]', dialog).addEventListener('click', () => display(current + 1));
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault(); display(current + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => { document.body.style.overflow = previousOverflow; trigger?.focus(); });
  }
})();
