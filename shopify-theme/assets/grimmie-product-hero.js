/*
 * Grimmie product hero
 * - Image lightbox (zoom, prev/next, keyboard)
 * - Dynamic checkout ("Acquista ora")
 * - Classic / Large / Duo option switching WITHOUT a page refresh, using the
 *   Shopify Section Rendering API. Falls back to normal navigation if anything
 *   fails or JS is unavailable (option links keep their real href).
 *
 * The three options are separate products sharing the same product template,
 * so fetching `<product-url>?section_id=<this section id>` returns this hero
 * rendered for the selected product (price, images, form, active state, etc.).
 */
(function () {
  'use strict';
  if (window.__gphProductHeroInit) return;
  window.__gphProductHeroInit = true;

  var ROOT_SEL = '[data-gph-root]';

  /* ---------------- per-section binding (lightbox + buy) ---------------- */
  function bindSection(root) {
    if (!root || root.__gphBound) return;
    root.__gphBound = true;

    /* Lightbox */
    var zoom = root.querySelector('[data-gph-zoom]');
    var lb = root.querySelector('[data-gph-lightbox]');
    if (zoom && lb) {
      var lbImg = lb.querySelector('img');
      var closeBtn = lb.querySelector('[data-gph-lb-close]');
      var prevBtn = lb.querySelector('[data-gph-prev]');
      var nextBtn = lb.querySelector('[data-gph-next]');
      var radios = root.querySelectorAll('[data-gph-sel]');
      var slides = root.querySelectorAll('[data-gph-slide]');
      var count = slides.length;
      var index = 0;

      var activeIndex = function () {
        for (var i = 0; i < radios.length; i++) { if (radios[i].checked) return i; }
        return 0;
      };
      var show = function (i) {
        if (count === 0) return;
        index = (i % count + count) % count;
        var img = slides[index] ? slides[index].querySelector('img') : null;
        if (img && lbImg) { lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt || ''; }
        if (radios[index]) radios[index].checked = true;
      };
      var openLb = function () {
        show(activeIndex());
        lb.classList.add('is-open');
        lb.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      };
      var closeLb = function () {
        lb.classList.remove('is-open');
        lb.setAttribute('aria-hidden', 'true');
        if (lbImg) lbImg.removeAttribute('src');
        document.body.style.overflow = '';
      };
      if (count < 2) {
        if (prevBtn) prevBtn.hidden = true;
        if (nextBtn) nextBtn.hidden = true;
      }
      zoom.addEventListener('click', openLb);
      lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
      if (closeBtn) closeBtn.addEventListener('click', closeLb);
      if (prevBtn) prevBtn.addEventListener('click', function () { show(index - 1); });
      if (nextBtn) nextBtn.addEventListener('click', function () { show(index + 1); });
      document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('is-open')) return;
        if (e.key === 'Escape') closeLb();
        else if (e.key === 'ArrowLeft') show(index - 1);
        else if (e.key === 'ArrowRight') show(index + 1);
      });
    }

    /* Dynamic checkout ("Acquista ora") */
    var buy = root.querySelector('[data-gph-buy]');
    var form = root.querySelector('form');
    var cartUrl = root.getAttribute('data-cart-url') || '/cart';
    if (buy && form) {
      buy.addEventListener('click', function () {
        if (buy.getAttribute('aria-busy') === 'true') return;
        buy.setAttribute('aria-busy', 'true');
        var data = new FormData(form);
        fetch('/cart/add.js', { method: 'POST', headers: { 'Accept': 'application/json' }, body: data })
          .then(function (r) { if (!r.ok) { throw new Error('add failed'); } return r.json(); })
          .then(function () { window.location.href = cartUrl + '/checkout'; })
          .catch(function () { buy.removeAttribute('aria-busy'); form.submit(); });
      });
    }
  }

  /* ---------------- AJAX option switching ---------------- */
  function currentRoot() { return document.querySelector(ROOT_SEL); }

  function swap(url, doPush, focusActive) {
    var root = currentRoot();
    if (!root) { window.location.href = url; return; }
    var sid = root.getAttribute('data-sid');
    var wrapper = document.getElementById('shopify-section-' + sid);
    if (!sid || !wrapper) { window.location.href = url; return; }

    wrapper.style.transition = 'opacity 0.15s ease';
    wrapper.style.opacity = '0.55';
    wrapper.style.pointerEvents = 'none';

    var sep = url.indexOf('?') > -1 ? '&' : '?';
    fetch(url + sep + 'section_id=' + encodeURIComponent(sid), {
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
      .then(function (r) { if (!r.ok) throw new Error('bad response'); return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var incoming = doc.getElementById('shopify-section-' + sid);
        wrapper.innerHTML = incoming ? incoming.innerHTML : html;
        wrapper.style.opacity = '';
        wrapper.style.pointerEvents = '';

        var newRoot = currentRoot();
        bindSection(newRoot);

        if (doPush) {
          try { history.pushState({ gphUrl: url }, '', url); } catch (e) {}
        }
        if (newRoot) {
          var t = newRoot.getAttribute('aria-label');
          if (t) { try { document.title = t; } catch (e) {} }
          if (focusActive) {
            var act = newRoot.querySelector('[data-gph-option][aria-current="true"]');
            if (act) { try { act.focus({ preventScroll: true }); } catch (e) { act.focus(); } }
          }
        }
      })
      .catch(function () { window.location.href = url; });
  }

  /* Delegated click on the Classic / Large / Duo option links.
     Delegation on document survives the section swap. */
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('[data-gph-option]') : null;
    if (!a) return;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var href = a.getAttribute('href');
    if (!href || href === '#') return;
    e.preventDefault();
    if (a.getAttribute('aria-current') === 'true') return; // already selected
    swap(href, true, true);
  });

  /* Back / forward buttons */
  window.addEventListener('popstate', function () {
    swap(window.location.pathname + window.location.search, false, false);
  });

  /* Init */
  function init() {
    try {
      history.replaceState({ gphUrl: window.location.pathname + window.location.search }, '', window.location.href);
    } catch (e) {}
    bindSection(currentRoot());
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
