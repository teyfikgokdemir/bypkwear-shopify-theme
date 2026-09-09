(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealSelector = [
    '.bypk-showcase__header',
    '.bypk-card',
    '.bypk-film__content > *',
    '.bypk-campaign__content > *',
    '.bypk-campaign__tile',
    '.bypk-story__eyebrow',
    '.bypk-story__body > *',
    '.bypk-footer__intro > *',
    '.bypk-footer__nav',
    '.bypk-footer__bottom',
    'body.template-product .product-details > *'
  ].join(',');

  let observer;
  let scrollTarget;
  let scrollStopTimer;

  const squeezeQuery = window.matchMedia('(min-width: 990px)');
  const getScrollContainer = () => {
    if (squeezeQuery.matches) {
      return document.querySelector('.page-wrapper') || document.scrollingElement || document.documentElement;
    }
    return document.scrollingElement || document.documentElement;
  };

  const getScrollEventTarget = () => {
    if (squeezeQuery.matches) return document.querySelector('.page-wrapper') || document;
    return document;
  };

  const getScrollTop = () => getScrollContainer().scrollTop || window.scrollY || 0;

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

  const updateScroll = (isMoving = false) => {
    const container = getScrollContainer();
    const scrollTop = getScrollTop();
    const viewportHeight = container === document.scrollingElement || container === document.documentElement ? window.innerHeight : container.clientHeight;
    const distance = Math.max(0, container.scrollHeight - viewportHeight);
    const progress = distance > 0 ? Math.min((scrollTop / distance) * 100, 100) : 0;
    document.documentElement.style.setProperty('--pkw-scroll', `${progress}%`);
    document.body.classList.toggle('pkw-scrolled', scrollTop > 24);
    const scrollTopButton = document.querySelector('.pkw-floating-action--top');
    if (!scrollTopButton) return;

    const shouldShow = isMoving && scrollTop > 420;
    scrollTopButton.hidden = false;
    scrollTopButton.classList.toggle('is-visible', shouldShow);
    if (!shouldShow) {
      window.setTimeout(() => {
        if (!scrollTopButton.classList.contains('is-visible')) scrollTopButton.hidden = true;
      }, 260);
    }
  };

  const handleScroll = () => {
    updateScroll(true);
    window.clearTimeout(scrollStopTimer);
    scrollStopTimer = window.setTimeout(() => updateScroll(false), 620);
  };

  const bindScroll = () => {
    const nextTarget = getScrollEventTarget();
    if (scrollTarget === nextTarget) return;
    scrollTarget?.removeEventListener('scroll', handleScroll);
    scrollTarget = nextTarget;
    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
  };

  const scrollTopButton = document.querySelector('.pkw-floating-action--top');
  scrollTopButton?.addEventListener('click', () => {
    getScrollContainer().scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  });

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('pkw-in-view');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  reveal();
  bindScroll();
  updateScroll();
  squeezeQuery.addEventListener('change', () => {
    bindScroll();
    updateScroll();
  });
  document.addEventListener('shopify:section:load', (event) => reveal(event.target));
})();
