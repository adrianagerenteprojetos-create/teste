/* ==========================================================================
   DERILA ERGO — Landing Page
   Vanilla JavaScript, no external dependencies
   ========================================================================== */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Popup spacing guard ----------
     Prevents popups from appearing back-to-back. ---------- */
  var lastPopupShownAt = 0;
  var MIN_POPUP_GAP_MS = 20000;

  function canShowPopupNow(retryCallback) {
    var now = Date.now();
    var elapsed = now - lastPopupShownAt;
    if (lastPopupShownAt && elapsed < MIN_POPUP_GAP_MS) {
      window.setTimeout(retryCallback, MIN_POPUP_GAP_MS - elapsed);
      return false;
    }
    lastPopupShownAt = now;
    return true;
  }

  /* ---------- 1. MOBILE NAV ---------- */
  function initMobileNav() {
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('mobileNav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  /* ---------- 2. SMOOTH SCROLL WITH HEADER OFFSET ---------- */
  function initSmoothScroll() {
    var header = document.querySelector('.masthead');
    var headerHeight = header ? header.offsetHeight : 0;

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (!targetId || targetId.length < 2) return;
        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 12;
        window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
    });
  }

  /* ---------- 3. FAQ ACCORDION ---------- */
  function initAccordion() {
    var triggers = document.querySelectorAll('.faq-trigger');

    triggers.forEach(function (trigger) {
      var answer = document.getElementById(trigger.getAttribute('aria-controls'));
      if (!answer) return;

      trigger.addEventListener('click', function () {
        var isOpen = trigger.getAttribute('aria-expanded') === 'true';

        // Classic accordion: close every other open item first
        triggers.forEach(function (other) {
          if (other !== trigger) {
            other.setAttribute('aria-expanded', 'false');
            var otherAnswer = document.getElementById(other.getAttribute('aria-controls'));
            if (otherAnswer) otherAnswer.style.maxHeight = null;
          }
        });

        trigger.setAttribute('aria-expanded', String(!isOpen));
        answer.style.maxHeight = isOpen ? null : answer.scrollHeight + 'px';
      });
    });
  }

  /* ---------- 4. SCROLL PROGRESS BAR ---------- */
  function initScrollProgress() {
    var bar = document.getElementById('scrollProgressBar');
    if (!bar) return;

    function update() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = percent + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---------- 5. REVEAL ON SCROLL ---------- */
  function initRevealOnScroll() {
    var targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- 6. STICKY PROMO BAR ---------- */
  function initPromoBar() {
    var bar = document.getElementById('promoBar');
    var hero = document.querySelector('.hero');
    if (!bar || !hero) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        bar.classList.toggle('visible', !entry.isIntersecting);
      });
    }, { threshold: 0 });

    observer.observe(hero);
  }

  /* ---------- 7. EXIT-INTENT MODAL ---------- */
  function initExitModal() {
    var overlay = document.getElementById('exitModalOverlay');
    var closeBtn = document.getElementById('exitModalClose');
    if (!overlay || !closeBtn) return;

    var shown = false;

    function show() {
      if (shown) return;
      if (!canShowPopupNow(show)) return;
      shown = true;
      overlay.hidden = false;
    }

    function hide() {
      overlay.hidden = true;
    }

    document.addEventListener('mouseout', function (e) {
      if (!e.relatedTarget && e.clientY <= 0) show();
    });

    closeBtn.addEventListener('click', hide);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) hide();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !overlay.hidden) hide();
    });
  }

  /* ---------- INIT ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initSmoothScroll();
    initAccordion();
    initScrollProgress();
    initRevealOnScroll();
    initPromoBar();
    initExitModal();
  });
})();
