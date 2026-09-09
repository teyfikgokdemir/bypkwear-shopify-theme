(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealSelector = [
    '.bypk-showcase__header',
    '.bypk-card',
    '.bypk-film__content > *',
    '.bypk-story__eyebrow',
    '.bypk-story__body > *',
    '.bypk-footer__intro > *',
    '.bypk-footer__nav',
    '.bypk-footer__bottom',
    'body.template-product .product-details > *'
  ].join(',');

  let observer;

  const reveal = (root = document) => {
    const elements = [...root.querySelectorAll(revealSelector)].filter((element) => !element.dataset.pkwReveal);
    elements.forEach((element, index) => {
      element.dataset.pkwReveal = 'true';
      element.style.setProperty('--pkw-delay', `${Math.min(index % 4, 3) * 70}ms`);
      if (reducedMotion.matches) return;
      element.classList.add('pkw-reveal-ready');
      observer.observe(element);
    });
  };

  const updateScroll = () => {
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    const progress = distance > 0 ? Math.min((window.scrollY / distance) * 100, 100) : 0;
    document.documentElement.style.setProperty('--pkw-scroll', `${progress}%`);
    document.body.classList.toggle('pkw-scrolled', window.scrollY > 24);
    const scrollTopButton = document.querySelector('.pkw-floating-action--top');
    if (scrollTopButton) scrollTopButton.hidden = window.scrollY < 500;
  };

  const scrollTopButton = document.querySelector('.pkw-floating-action--top');
  scrollTopButton?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  });

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('pkw-in-view');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  reveal();
  updateScroll();
  window.addEventListener('scroll', updateScroll, { passive: true });
  document.addEventListener('shopify:section:load', (event) => reveal(event.target));
})();
