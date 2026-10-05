/* Motion enhances an already visible, usable page; it never delays navigation. */
(() => {
  'use strict';
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Set();
  const byElement = new WeakMap();
  function enter(element, delay = 0, distance = 12) {
    if (preference.matches || !element.animate) return;
    byElement.get(element)?.cancel();
    const animation = element.animate([
      { opacity: 0, translate: `0 ${distance}px` },
      { opacity: 1, translate: '0 0' }
    ], { duration: 380, delay, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
    byElement.set(element, animation); running.add(animation);
    animation.finished.catch(() => {}).finally(() => running.delete(animation));
  }
  const intro = document.querySelector('.hero-content, .page-intro, .proj-hero-meta');
  if (intro && !location.hash) [...intro.children].forEach((element,index) => enter(element, Math.min(index * 45, 180), 10));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.filter(entry => entry.isIntersecting).forEach((entry,index) => {
        enter(entry.target, Math.min(index * 55, 165)); observer.unobserve(entry.target);
      });
    }, { threshold: .08 });
    document.querySelectorAll('.proj-card, .overview-inner, .page-next-step').forEach(element => observer.observe(element));
    preference.addEventListener('change', () => { if (preference.matches) observer.disconnect(); });
  }
  document.addEventListener('projects:filtered', event => {
    event.target.querySelectorAll('.proj-card:not([hidden])').forEach((card,index) => enter(card, Math.min(index * 35, 140), 8));
  });
  preference.addEventListener('change', () => {
    if (preference.matches) { running.forEach(animation => animation.cancel()); running.clear(); }
  });
  addEventListener('pagehide', () => { running.forEach(animation => animation.cancel()); running.clear(); });
})();
