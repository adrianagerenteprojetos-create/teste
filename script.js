/* ==========================================================================
   AUDIFORT — Landing Page
   JavaScript vanilla, sem dependências externas
   ========================================================================== */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. MENU MOBILE (off-canvas) ---------- */
  function initMobileNav() {
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('mobileNav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    // Fecha o menu ao clicar em um link
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  /* ---------- 2. ROLAGEM SUAVE COM OFFSET DO CABEÇALHO ---------- */
  function initSmoothScroll() {
    var header = document.querySelector('.masthead');
    var headerHeight = header ? header.offsetHeight : 0;

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId.length < 2) return;
        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 12;
        window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
    });
  }

  /* ---------- 3. ACCORDION DE FAQ ---------- */
  function initAccordion() {
    var triggers = document.querySelectorAll('.faq-trigger');

    triggers.forEach(function (trigger) {
      var answer = document.getElementById(trigger.getAttribute('aria-controls'));
      if (!answer) return;

      trigger.addEventListener('click', function () {
        var isOpen = trigger.getAttribute('aria-expanded') === 'true';

        // Fecha os outros itens abertos (accordion de item único)
        triggers.forEach(function (other) {
          if (other !== trigger) {
            other.setAttribute('aria-expanded', 'false');
            var otherAnswer = document.getElementById(other.getAttribute('aria-controls'));
            if (otherAnswer) otherAnswer.style.maxHeight = null;
          }
        });

        trigger.setAttribute('aria-expanded', String(!isOpen));
        answer.style.maxHeight = isOpen ? null : answer.scrollHeight + 'px';

        // FAQ interaction tracking — only fires on open, not on close.
        if (!isOpen && typeof gtag === 'function') {
          gtag('event', 'faq_interaction', {
            faq_question: trigger.textContent.trim(),
            faq_id: answer.id
          });
        }
      });
    });
  }

  /* ---------- 4. AUTOAVALIAÇÃO (self-check) ---------- */
  function initSelfCheck() {
    var options = document.querySelectorAll('.sc-opt');
    var result = document.getElementById('scResult');
    if (!options.length || !result) return;

    options.forEach(function (opt) {
      opt.addEventListener('click', function () {
        var q = this.getAttribute('data-q');
        document.querySelectorAll('.sc-opt[data-q="' + q + '"]').forEach(function (sibling) {
          sibling.classList.remove('selected');
        });
        this.classList.add('selected');

        var answered = new Set();
        document.querySelectorAll('.sc-opt.selected').forEach(function (s) {
          answered.add(s.getAttribute('data-q'));
        });
        if (answered.size === 3) {
          result.classList.add('show');
        }
      });
    });
  }

  /* ---------- 5. REVELAÇÃO SUAVE AO ROLAR (IntersectionObserver) ---------- */
  function initScrollReveal() {
    var revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- 6. BARRA DE CTA FIXA (mobile) ---------- */
  function initStickyCta() {
    var stickyCta = document.getElementById('stickyCta');
    var hero = document.querySelector('.hero');
    if (!stickyCta || !hero) return;

    var heroBottom = hero.offsetTop + hero.offsetHeight;
    var ticking = false;

    function updateVisibility() {
      var shouldShow = window.pageYOffset > heroBottom;
      stickyCta.classList.toggle('visible', shouldShow);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    }, { passive: true });

    updateVisibility();
  }

  /* ---------- 7. BOTÃO FLUTUANTE (desktop) ---------- */
  function initFloatingCta() {
    var floatingCta = document.getElementById('floatingCta');
    var hero = document.querySelector('.hero');
    if (!floatingCta || !hero) return;

    var heroBottom = hero.offsetTop + hero.offsetHeight;
    var ticking = false;

    function updateVisibility() {
      var shouldShow = window.pageYOffset > heroBottom;
      floatingCta.classList.toggle('visible', shouldShow);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    }, { passive: true });

    updateVisibility();
  }

  /* ---------- 8. EXIT-INTENT MODAL ---------- */
  function initExitIntent() {
    var overlay = document.getElementById('exitModalOverlay');
    var closeBtn = document.getElementById('exitModalClose');
    if (!overlay || !closeBtn) return;

    var STORAGE_KEY = 'audifortExitShown';
    var shown = false;

    try {
      shown = sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) {
      shown = false;
    }

    function showModal() {
      if (shown) return;
      shown = true;
      overlay.hidden = false;
      try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (e) { /* no-op */ }
    }

    function hideModal() {
      overlay.hidden = true;
    }

    // Desktop: dispara quando o cursor sai pela borda superior da janela
    document.addEventListener('mouseout', function (e) {
      if (!e.relatedTarget && !e.toElement && e.clientY <= 0) {
        showModal();
      }
    });

    // Mobile fallback: dispara após rolagem significativa e tempo mínimo na página
    var scrolledDeep = false;
    window.addEventListener('scroll', function () {
      var scrollPercent = (window.pageYOffset) / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPercent > 0.85) scrolledDeep = true;
    }, { passive: true });

    setTimeout(function () {
      window.addEventListener('scroll', function onScrollUp() {
        // Se o usuário rolar para cima perto do topo depois de ter ido fundo na página, mostramos o modal
        if (scrolledDeep && window.pageYOffset < 200) {
          showModal();
        }
      }, { passive: true });
    }, 15000);

    closeBtn.addEventListener('click', hideModal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) hideModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !overlay.hidden) hideModal();
    });
  }

  /* ---------- 9. RASTREAMENTO DE CLIQUES NO LINK DE AFILIADO ----------
     Envia um evento de conversão do Google Ads e um evento do GA4 sempre
     que alguém clica em qualquer link para o checkout oficial. Sem isso,
     o Smart Bidding do Google Ads não tem sinal de conversão para otimizar
     e a campanha não pode escalar com segurança.
     Substitua 'AW-XXXXXXXXXX/REPLACE_WITH_CONVERSION_LABEL' pelo ID real
     obtido em Google Ads > Ferramentas > Conversões. ---------- */
  function initOutboundTracking() {
    var affiliateLinks = document.querySelectorAll('a[href*="hop.clickbank.net"]');
    if (!affiliateLinks.length) return;

    affiliateLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        if (typeof gtag === 'function') {
          gtag('event', 'select_promotion', {
            promotion_name: 'audifort_offer_click',
            link_id: link.id || link.className || 'unlabeled'
          });
          gtag('event', 'conversion', {
            send_to: 'AW-XXXXXXXXXX/REPLACE_WITH_CONVERSION_LABEL'
          });
        }
      });
    });
  }

  /* ---------- 10. PROFUNDIDADE DE ROLAGEM (scroll depth) ----------
     Envia um evento GA4 a cada marco de 25/50/75/100% da página.
     Cada marco dispara uma única vez por carregamento de página. ---------- */
  function initScrollDepthTracking() {
    var thresholds = [25, 50, 75, 100];
    var fired = {};

    function checkDepth() {
      var scrollTop = window.pageYOffset;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      var percent = Math.round((scrollTop / docHeight) * 100);

      thresholds.forEach(function (t) {
        if (percent >= t && !fired[t]) {
          fired[t] = true;
          if (typeof gtag === 'function') {
            gtag('event', 'scroll_depth', { percent_scrolled: t });
          }
        }
      });
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          checkDepth();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    checkDepth();
  }

  /* ---------- 11. TEMPO NA PÁGINA (engagement milestones) ----------
     Marcos de 30s / 60s / 180s enquanto a aba está visível, para medir
     engajamento além do "engaged session" padrão do GA4. ---------- */
  function initTimeOnPageTracking() {
    var milestones = [30, 60, 180];
    var elapsed = 0;

    var interval = setInterval(function () {
      if (document.visibilityState !== 'visible') return;
      elapsed += 1;

      if (milestones.indexOf(elapsed) !== -1 && typeof gtag === 'function') {
        gtag('event', 'time_on_page', { seconds: elapsed });
      }
      if (elapsed >= milestones[milestones.length - 1]) {
        clearInterval(interval);
      }
    }, 1000);
  }

  /* ---------- 12. PASSTHROUGH DE GCLID PARA O CLICKBANK ----------
     Google Ads sozinho não sabe se um clique no link de afiliado virou
     venda — essa confirmação acontece no domínio do ClickBank. Para
     fechar esse ciclo com dados reais (em vez de só medir "cliques no
     link"), anexamos o gclid da URL de chegada como parâmetro "tid" no
     hoplink. Isso só funciona de ponta a ponta se o vendedor do produto
     no ClickBank tiver o TID passthrough habilitado e um processo de
     importação de conversões offline configurado no Google Ads — sem
     isso, o gtag('event','conversion', ...) em initOutboundTracking
     continua sendo a melhor proxy disponível (clique, não venda confirmada). ---------- */
  function initGclidPassthrough() {
    var params = new URLSearchParams(window.location.search);
    var gclid = params.get('gclid');
    if (!gclid) return;

    try { sessionStorage.setItem('audifortGclid', gclid); } catch (e) { /* no-op */ }

    document.querySelectorAll('a[href*="hop.clickbank.net"]').forEach(function (link) {
      var url = new URL(link.href);
      url.searchParams.set('tid', gclid);
      link.href = url.toString();
    });
  }

  /* ---------- INICIALIZAÇÃO ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initSmoothScroll();
    initAccordion();
    initSelfCheck();
    initScrollReveal();
    initStickyCta();
    initFloatingCta();
    initExitIntent();
    initGclidPassthrough();
    initOutboundTracking();
    initScrollDepthTracking();
    initTimeOnPageTracking();
  });
})();
