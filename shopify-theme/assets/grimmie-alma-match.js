/*
 * Grimmie Alma Match - interactive quiz logic
 * ------------------------------------------------------------
 * Fixed quiz data (questions, scoring, archetypes) lives here.
 * Editable content (hero, how-it-works, result copy, discount,
 * bundle links, timer) is configured in the Theme Editor and
 * read from the JSON in [data-am-config] inside the section.
 *
 * Scoring categories: MAKEUP, SKINCARE, HAIRCARE.
 * Level thresholds: 0-5 BASIC, 6-11 MEDIUM, 12+ PRO.
 * ------------------------------------------------------------
 */
(function () {
  'use strict';

  var ICONS = {
    bag: '<svg viewBox="0 0 24 24"><path d="M5 8 h14 l-1 12 h-12 z"/><path d="M8 8 V6 a4 4 0 0 1 8 0 V8"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24"><path d="M12 3 L13.5 9 L19 10.5 L13.5 12 L12 18 L10.5 12 L5 10.5 L10.5 9 Z"/></svg>',
    mirror: '<svg viewBox="0 0 24 24"><circle cx="12" cy="10" r="6"/><path d="M12 16 V21 M9 21 H15"/></svg>',
    suitcase: '<svg viewBox="0 0 24 24"><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M9 8 V6 a1 1 0 0 1 1 -1 h4 a1 1 0 0 1 1 1 V8"/><path d="M10 12 V16 M14 12 V16"/></svg>',
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 8 V12 L15 14"/></svg>',
    bottle: '<svg viewBox="0 0 24 24"><path d="M10 3 h4 v3 h-4 z"/><path d="M9 6 h6 v13 a2 2 0 0 1 -2 2 h-2 a2 2 0 0 1 -2 -2 z"/><path d="M9 12 h6"/></svg>',
    brush: '<svg viewBox="0 0 24 24"><path d="M8 14 L16 6 a2 2 0 0 1 3 3 L11 17 z"/><path d="M8 14 l-3 5 l5 -3"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20 C 7 16 4 13 4 9 a 3.5 3.5 0 0 1 7 -1 a 3.5 3.5 0 0 1 7 1 c 0 4 -3 7 -8 11 Z"/></svg>',
    plane: '<svg viewBox="0 0 24 24"><path d="M3 14 L21 7 L17 13 L11 15 L8 21 L6 15 Z"/></svg>',
    moon: '<svg viewBox="0 0 24 24"><path d="M20 14 A 8 8 0 1 1 10 4 a 6 6 0 0 0 10 10 Z"/></svg>',
    home: '<svg viewBox="0 0 24 24"><path d="M4 11 L12 4 L20 11"/><path d="M6 10 V20 H18 V10"/></svg>',
    bath: '<svg viewBox="0 0 24 24"><path d="M4 12 h16 v3 a4 4 0 0 1 -4 4 h-8 a4 4 0 0 1 -4 -4 z"/><path d="M7 12 V6 a2 2 0 0 1 2 -2 a2 2 0 0 1 2 2"/><path d="M6 19 l-1 2 M18 19 l1 2"/></svg>'
  };

  var QUESTIONS = [
    {
      heroTitle: 'Iniziamo da te',
      q: 'La tua borsa di solito è…',
      answers: [
        { label: 'Super essenziale', icon: 'bag', mk: 0, sk: 0, hc: 0 },
        { label: 'Ordinata ma piena di mini cose', icon: 'sparkle', mk: 0, sk: 1, hc: 0 },
        { label: 'Una mini beauty station', icon: 'mirror', mk: 2, sk: 0, hc: 0 },
        { label: 'Praticamente un kit di sopravvivenza', icon: 'suitcase', mk: 1, sk: 1, hc: 1 }
      ]
    },
    {
      heroTitle: 'Il tuo ritmo',
      q: 'Quanto tempo impieghi per prepararti?',
      answers: [
        { label: '10 minuti e sono pronta', icon: 'clock', mk: 0, sk: 0, hc: 0 },
        { label: 'Dipende dalla giornata', icon: 'clock', mk: 1, sk: 0, hc: 0 },
        { label: 'Ho una vera routine', icon: 'bottle', mk: 0, sk: 2, hc: 0 },
        { label: 'Prepararmi è parte del mood', icon: 'sparkle', mk: 1, sk: 1, hc: 1 }
      ]
    },
    {
      heroTitle: 'Il tuo mood',
      q: 'Quale aesthetic ti rappresenta di più?',
      answers: [
        { label: 'Clean girl', icon: 'bottle', mk: 0, sk: 2, hc: 0 },
        { label: 'Soft glam', icon: 'brush', mk: 2, sk: 0, hc: 0 },
        { label: 'Off duty model', icon: 'mirror', mk: 1, sk: 0, hc: 1 },
        { label: 'Pinterest / self-care core', icon: 'heart', mk: 0, sk: 2, hc: 1 }
      ]
    },
    {
      heroTitle: 'Quando parti',
      q: 'Quando prepari la valigia…',
      answers: [
        { label: 'Porto solo il necessario', icon: 'suitcase', mk: 0, sk: 0, hc: 0 },
        { label: 'Organizzo tutto in pouch separate', icon: 'bag', mk: 1, sk: 1, hc: 0 },
        { label: 'Porto prodotti per ogni situazione', icon: 'plane', mk: 1, sk: 0, hc: 1 },
        { label: 'La beauty bag pesa più dei vestiti', icon: 'suitcase', mk: 1, sk: 0, hc: 2 }
      ]
    },
    {
      heroTitle: 'Il tuo momento',
      q: 'Il momento beauty che ami di più?',
      answers: [
        { label: 'Fare veloce e uscire', icon: 'clock', mk: 0, sk: 0, hc: 0 },
        { label: 'La skincare serale', icon: 'moon', mk: 0, sk: 2, hc: 0 },
        { label: 'Fare la piega', icon: 'brush', mk: 0, sk: 0, hc: 2 },
        { label: 'Il get ready completo', icon: 'sparkle', mk: 2, sk: 0, hc: 1 }
      ]
    },
    {
      heroTitle: 'Le tue ispirazioni',
      q: 'Cosa trovi più spesso nei tuoi salvataggi?',
      answers: [
        { label: 'Capsule wardrobe', icon: 'home', mk: 0, sk: 0, hc: 0 },
        { label: 'Routine skincare', icon: 'bottle', mk: 0, sk: 2, hc: 0 },
        { label: 'Tutorial make-up', icon: 'brush', mk: 2, sk: 0, hc: 0 },
        { label: 'GRWM e hair tutorials', icon: 'mirror', mk: 1, sk: 0, hc: 2 }
      ]
    },
    {
      heroTitle: 'Il tuo stile',
      q: 'Quale frase ti descrive meglio?',
      answers: [
        { label: 'Less but better', icon: 'sparkle', mk: 0, sk: 0, hc: 0 },
        { label: 'Ho bisogno delle mie routine', icon: 'bottle', mk: 0, sk: 1, hc: 0 },
        { label: 'Mi preparo anche per uscire 5 minuti', icon: 'mirror', mk: 2, sk: 0, hc: 0 },
        { label: 'Trasformo tutto in un rituale', icon: 'heart', mk: 1, sk: 1, hc: 1 }
      ]
    },
    {
      heroTitle: 'La sera',
      q: 'Prima di dormire…',
      answers: [
        { label: 'Mi strucco e basta', icon: 'moon', mk: 0, sk: 0, hc: 0 },
        { label: 'Ho la mia skincare completa', icon: 'bottle', mk: 0, sk: 2, hc: 0 },
        { label: 'Uso anche prodotti capelli', icon: 'brush', mk: 0, sk: 0, hc: 2 },
        { label: 'Riordino tutto per il giorno dopo', icon: 'bag', mk: 1, sk: 1, hc: 0 }
      ]
    },
    {
      heroTitle: 'Il tuo spazio',
      q: 'Il tuo bagno ideale sembra…',
      answers: [
        { label: 'Minimal e pulito', icon: 'home', mk: 0, sk: 0, hc: 0 },
        { label: 'Aesthetic e ordinato', icon: 'sparkle', mk: 0, sk: 1, hc: 0 },
        { label: 'Pieno di prodotti beauty', icon: 'mirror', mk: 2, sk: 0, hc: 0 },
        { label: 'Una mini spa', icon: 'bath', mk: 0, sk: 2, hc: 1 }
      ]
    },
    {
      heroTitle: 'Ci siamo quasi',
      q: 'Quale contenuto guarderesti subito?',
      answers: [
        { label: 'Morning routine minimal', icon: 'clock', mk: 0, sk: 0, hc: 0 },
        { label: 'Sunday reset vlog', icon: 'moon', mk: 0, sk: 2, hc: 0 },
        { label: 'Full glam transformation', icon: 'brush', mk: 2, sk: 0, hc: 0 },
        { label: 'Haircare / everything shower routine', icon: 'bath', mk: 0, sk: 1, hc: 2 }
      ]
    }
  ];

  // key = "MAKEUP-SKINCARE-HAIRCARE" -> archetype, bundle (display + key), description
  var ARCHETYPES = {
    'BASIC-BASIC-BASIC':   { name: 'La ragazza acqua e sapone', bundle: '2 Classic + 1 Large', desc: 'La bellezza che non ha bisogno di troppo: naturale, autentica e senza sforzo. Pochi gesti, scelti bene, per sentirti sempre te stessa.' },
    'BASIC-BASIC-MEDIUM':  { name: 'Clean Girl', bundle: '3 Classic + 1 Large', desc: 'Ami la semplicità che parla di cura, equilibrio e dettagli scelti con intenzione. Ogni cosa ha il suo posto, ogni gesto ha il suo ritmo.' },
    'BASIC-BASIC-PRO':     { name: 'Blowout Energy', bundle: '2 Classic + 2 Large', desc: 'I capelli sono la tua firma: piega perfetta, movimento e luce. La tua routine ruota attorno a styling impeccabile e prodotti giusti.' },
    'BASIC-MEDIUM-BASIC':  { name: 'Wellness Era', bundle: '1 Classic + 2 Large', desc: 'Il benessere prima di tutto: skincare lenta, momenti per te e spazi ordinati. La cura come piccolo rituale quotidiano.' },
    'BASIC-MEDIUM-MEDIUM': { name: 'Sunday Reset', bundle: '2 Classic + 2 Large', desc: 'Vivi di piccoli reset che rimettono tutto in ordine. Skincare e capelli curati, per ripartire ogni settimana con leggerezza.' },
    'BASIC-MEDIUM-PRO':    { name: 'Everything Shower Energy', bundle: '1 Classic + 3 Large', desc: 'Il tuo momento preferito è la doccia che diventa rituale. Capelli, corpo e cura in un’unica routine rigenerante.' },
    'BASIC-PRO-BASIC':     { name: 'Soft Life', bundle: '2 Classic + 2 Large', desc: 'Scegli la dolcezza in ogni dettaglio: skincare ricca, ritmi morbidi e una bellezza che si prende il suo tempo.' },
    'BASIC-PRO-MEDIUM':    { name: 'Pinterest Core', bundle: '3 Classic + 2 Large', desc: 'La tua routine è un mood: ordinata, estetica e ispirata. Skincare curata e dettagli che sembrano usciti da una board.' },
    'BASIC-PRO-PRO':       { name: 'Self Care Club', bundle: '2 Classic + 3 Large', desc: 'La cura di sé è la tua priorità: skincare completa e capelli coccolati. Ogni gesto è un atto d’amore per te stessa.' },
    'MEDIUM-BASIC-BASIC':  { name: 'Vanilla Energy', bundle: '3 Classic + 1 Large', desc: 'Calda, semplice e sempre curata: un make-up essenziale che ti somiglia. Comfort e bellezza in equilibrio perfetto.' },
    'MEDIUM-BASIC-MEDIUM': { name: 'Off Duty Model', bundle: '4 Classic + 1 Large', desc: 'Effortless ma impeccabile: make-up giusto e capelli al naturale. La bellezza che sembra spontanea ma è studiata.' },
    'MEDIUM-BASIC-PRO':    { name: 'Rich Girl Energy', bundle: '3 Classic + 2 Large', desc: 'Dettagli curati e allure discreta: make-up presente e capelli sempre perfetti. Eleganza che non grida, ma si nota.' },
    'MEDIUM-MEDIUM-BASIC': { name: 'That Girl', bundle: '2 Classic + 2 Large', desc: 'Organizzata, motivata e sempre sul pezzo: make-up e skincare in equilibrio. La routine che ti fa sentire la migliore versione di te.' },
    'MEDIUM-MEDIUM-MEDIUM':{ name: 'Pilates Princess', bundle: '3 Classic + 2 Large', desc: 'Equilibrio tra movimento e bellezza: make-up fresco, skincare e capelli curati. Una routine attiva, elegante e bilanciata.' },
    'MEDIUM-MEDIUM-PRO':   { name: 'Weekend Escape', bundle: '2 Classic + 3 Large', desc: 'Sempre pronta a partire: make-up versatile e capelli curati per ogni meta. La bellezza che ti segue ovunque.' },
    'MEDIUM-PRO-BASIC':    { name: 'Glazed Skin Era', bundle: '3 Classic + 2 Large', desc: 'Pelle luminosa e make-up che la esalta: la tua ossessione è il glow. Skincare ricca e dettagli che fanno brillare.' },
    'MEDIUM-PRO-MEDIUM':   { name: 'IT Girl', bundle: '4 Classic + 2 Large', desc: 'Sei tu a dettare il mood: make-up curato, skincare completa e stile. Una presenza che si fa ricordare, sempre.' },
    'MEDIUM-PRO-PRO':      { name: 'Beauty Addict', bundle: '3 Classic + 3 Large', desc: 'Ami la bellezza in ogni sua forma: make-up, skincare e capelli al massimo. Una routine completa per chi non rinuncia a nulla.' },
    'PRO-BASIC-BASIC':     { name: 'Soft Glam', bundle: '2 Classic + 2 Large', desc: 'Il glamour nella sua versione morbida: make-up curato e luminoso. Sofisticata senza eccessi, sempre al punto giusto.' },
    'PRO-BASIC-MEDIUM':    { name: 'Airport Look', bundle: '3 Classic + 2 Large', desc: 'Glam anche in viaggio: make-up impeccabile e capelli curati ovunque. La bellezza che non conosce fuso orario.' },
    'PRO-BASIC-PRO':       { name: 'Main Character Energy', bundle: '2 Classic + 3 Large', desc: 'Sei la protagonista della tua storia: make-up deciso e capelli da scena. Una routine che ti mette sempre al centro.' },
    'PRO-MEDIUM-BASIC':    { name: 'Matcha Girl', bundle: '1 Classic + 3 Large', desc: 'Make-up curato e ritmi morbidi: bellezza e benessere in armonia. Una routine calda, lenta e piena di stile.' },
    'PRO-MEDIUM-MEDIUM':   { name: 'City Girl Era', bundle: '2 Classic + 3 Large', desc: 'Ritmo veloce e stile sempre on point: make-up curato e capelli pronti. La bellezza che tiene il passo con la città.' },
    'PRO-MEDIUM-PRO':      { name: 'GRWM Core', bundle: '1 Classic + 4 Large', desc: 'Prepararti è il tuo momento preferito: make-up completo e capelli protagonisti. Ogni get ready è un piccolo spettacolo.' },
    'PRO-PRO-BASIC':       { name: 'Beauty Collector', bundle: '2 Classic + 3 Large', desc: 'Collezioni prodotti come piccoli tesori: make-up e skincare al completo. La bellezza è la tua passione più curata.' },
    'PRO-PRO-MEDIUM':      { name: 'Content Creator Energy', bundle: '3 Classic + 3 Large', desc: 'Sempre pronta a brillare davanti alla camera: make-up, skincare e capelli perfetti. Una routine completa per chi crea ed ispira.' },
    'PRO-PRO-PRO':         { name: 'Ultimate Beauty Energy', bundle: '2 Classic + 4 Large', desc: 'La tua routine non ha limiti: make-up, skincare e capelli al massimo livello. La bellezza totale, organizzata con eleganza.' }
  };

  var STORAGE_KEY = 'grimmie_alma_match_result';
  var DEADLINE_KEY = 'grimmie_alma_match_deadline';

  function levelOf(score) {
    if (score >= 12) return 'PRO';
    if (score >= 6) return 'MEDIUM';
    return 'BASIC';
  }

  function safeEvent(name, detail) {
    try { window.dispatchEvent(new CustomEvent(name, { detail: detail || {} })); } catch (e) {}
  }

  function init(root) {
    if (!root || root.dataset.amInit === '1') return;
    root.dataset.amInit = '1';

    var config = {};
    var cfgEl = root.querySelector('[data-am-config]');
    if (cfgEl) { try { config = JSON.parse(cfgEl.textContent); } catch (e) { config = {}; } }

    var screens = {
      intro: root.querySelector('[data-am-intro]'),
      quiz: root.querySelector('[data-am-quiz]'),
      loading: root.querySelector('[data-am-loading]'),
      result: root.querySelector('[data-am-result]')
    };

    var els = {
      startBtn: root.querySelector('[data-am-start]'),
      heroTitle: root.querySelector('[data-am-q-herotitle]'),
      progressLabel: root.querySelector('[data-am-q-progress-label]'),
      bar: root.querySelector('[data-am-q-bar]'),
      qTitle: root.querySelector('[data-am-q-title]'),
      cards: root.querySelector('[data-am-q-cards]'),
      continueBtn: root.querySelector('[data-am-q-continue]'),
      rArchetype: root.querySelector('[data-am-r-archetype]'),
      rDesc: root.querySelector('[data-am-r-desc]'),
      rCombo: root.querySelector('[data-am-r-combo]'),
      cta: root.querySelector('[data-am-cta]'),
      timer: root.querySelector('[data-am-timer]'),
      discountBox: root.querySelector('[data-am-discount]'),
      expiredMsg: root.querySelector('[data-am-expired]'),
      restart: root.querySelector('[data-am-restart]'),
      loadingTitle: root.querySelector('[data-am-loading-title]')
    };

    var total = QUESTIONS.length;
    var answers = new Array(total).fill(-1);
    var current = 0;
    var timerId = null;
    var currentBundle = '';
    var expired = false;
    // Scoped BEM prefix, e.g. "grimmie-am-<sectionId>" (matches the section CSS).
    var prefix = (root.classList && root.classList[0]) || 'grimmie-am';

    function show(name) {
      Object.keys(screens).forEach(function (k) {
        if (screens[k]) screens[k].hidden = (k !== name);
      });
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
    }

    function renderQuestion() {
      var data = QUESTIONS[current];
      if (els.heroTitle) els.heroTitle.textContent = data.heroTitle;
      if (els.progressLabel) els.progressLabel.textContent = 'DOMANDA ' + (current + 1) + ' DI ' + total;
      if (els.bar) els.bar.style.width = ((current + 1) / total * 100) + '%';
      if (els.qTitle) els.qTitle.textContent = data.q;

      els.cards.innerHTML = '';
      data.answers.forEach(function (ans, i) {
        var card = document.createElement('button');
        card.type = 'button';
        card.className = prefix + '__card';
        card.setAttribute('role', 'radio');
        card.setAttribute('aria-checked', answers[current] === i ? 'true' : 'false');
        if (answers[current] === i) card.classList.add('is-selected');
        card.innerHTML =
          '<span class="' + prefix + '__card-icon" aria-hidden="true">' + (ICONS[ans.icon] || ICONS.sparkle) + '</span>' +
          '<span class="' + prefix + '__card-label">' + ans.label + '</span>' +
          '<span class="' + prefix + '__card-radio" aria-hidden="true"></span>';
        card.addEventListener('click', function () {
          answers[current] = i;
          Array.prototype.forEach.call(els.cards.children, function (c, ci) {
            c.classList.toggle('is-selected', ci === i);
            c.setAttribute('aria-checked', ci === i ? 'true' : 'false');
          });
          els.continueBtn.disabled = false;
          safeEvent('alma_match_question_answered', { question: current + 1, answer: i });
        });
        els.cards.appendChild(card);
      });

      els.continueBtn.disabled = answers[current] < 0;
      els.continueBtn.textContent = (current === total - 1) ? 'VEDI IL RISULTATO' : 'CONTINUA';
    }

    function startQuiz() {
      current = 0;
      answers = new Array(total).fill(-1);
      show('quiz');
      renderQuestion();
      safeEvent('alma_match_started', {});
    }

    function next() {
      if (answers[current] < 0) return;
      if (current < total - 1) {
        current += 1;
        renderQuestion();
      } else {
        finish();
      }
    }

    function compute() {
      var mk = 0, sk = 0, hc = 0;
      for (var i = 0; i < total; i++) {
        var a = QUESTIONS[i].answers[answers[i]];
        if (!a) continue;
        mk += a.mk; sk += a.sk; hc += a.hc;
      }
      var key = levelOf(mk) + '-' + levelOf(sk) + '-' + levelOf(hc);
      var arch = ARCHETYPES[key] || ARCHETYPES['BASIC-BASIC-BASIC'];
      return { key: key, name: arch.name, bundle: arch.bundle, desc: arch.desc, mk: mk, sk: sk, hc: hc };
    }

    function variantNumericId(val) {
      if (val == null) return '';
      var m = /(\d+)\s*$/.exec(String(val));
      return m ? m[1] : '';
    }

    function parseBundleCounts(bundle) {
      var b = String(bundle || '');
      var mc = b.match(/(\d+)\s*Classic/i);
      var ml = b.match(/(\d+)\s*Large/i);
      return {
        classic: mc ? parseInt(mc[1], 10) : 0,
        large: ml ? parseInt(ml[1], 10) : 0
      };
    }

    function bundleItems(bundle) {
      var classicId = variantNumericId(config.classicVariantId);
      var largeId = variantNumericId(config.largeVariantId);
      var counts = parseBundleCounts(bundle);
      var items = [];
      if (classicId && counts.classic > 0) items.push({ id: classicId, quantity: counts.classic });
      if (largeId && counts.large > 0) items.push({ id: largeId, quantity: counts.large });
      return items;
    }

    function bundleDiscountCode(bundle) {
      var discounts = config.bundleDiscounts || {};
      return ((discounts[bundle] || config.discountCode) || '').trim();
    }

    // Fallback href (no-JS): a Shopify cart permalink that adds the combo.
    function buildCtaUrl(bundle) {
      var items = bundleItems(bundle);
      var code = bundleDiscountCode(bundle);
      if (items.length) {
        var parts = [];
        for (var i = 0; i < items.length; i++) { parts.push(items[i].id + ':' + items[i].quantity); }
        var permalink = '/cart/' + parts.join(',');
        if (code) permalink += '?discount=' + encodeURIComponent(code);
        return permalink;
      }
      var links = config.bundleLinks || {};
      var link = links[bundle] || config.fallbackLink || '/collections/all';
      if (code) {
        return '/discount/' + encodeURIComponent(code) + '?redirect=' + encodeURIComponent(link);
      }
      return link;
    }

    // On click: add the combo via the Cart API, then land on the cart page
    // (applying the discount code first when one is set).
    function goToBundleCart(e, bundle) {
      var items = bundleItems(bundle);
      if (!items.length) return; // no base products configured: let the href fallback navigate
      if (e && e.preventDefault) e.preventDefault();
      var code = bundleDiscountCode(bundle);
      var dest = code ? ('/discount/' + encodeURIComponent(code) + '?redirect=' + encodeURIComponent('/cart')) : '/cart';
      var go = function () { window.location.href = dest; };
      try {
        fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ items: items })
        }).then(go, go);
      } catch (err) { go(); }
    }

    // Lock the offer once the countdown reaches zero: disable the CTA so the
    // discount is no longer auto-applied, and reveal the "expired" message.
    function setExpired(state) {
      expired = state;
      if (els.discountBox) els.discountBox.classList.toggle('is-expired', state);
      if (els.expiredMsg) els.expiredMsg.hidden = !state;
      if (els.cta) {
        els.cta.classList.toggle('is-disabled', state);
        if (state) els.cta.setAttribute('aria-disabled', 'true');
        else els.cta.removeAttribute('aria-disabled');
      }
    }

    function startTimer() {
      if (!els.timer) return;
      setExpired(false);
      var minutes = parseInt(config.timerMinutes, 10);
      if (isNaN(minutes) || minutes <= 0) minutes = 10;
      // Persist an absolute deadline so the countdown survives page reloads
      // instead of restarting from the full duration each time.
      var deadline = 0;
      try { deadline = parseInt(sessionStorage.getItem(DEADLINE_KEY), 10); } catch (e) {}
      if (!deadline || isNaN(deadline) || deadline <= Date.now()) {
        deadline = Date.now() + minutes * 60 * 1000;
        try { sessionStorage.setItem(DEADLINE_KEY, String(deadline)); } catch (e) {}
      }
      if (timerId) clearInterval(timerId);
      function paint() {
        var remaining = Math.max(0, Math.round((deadline - Date.now()) / 1000));
        var m = Math.floor(remaining / 60);
        var s = remaining % 60;
        els.timer.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
        return remaining;
      }
      if (paint() <= 0) { setExpired(true); return; }
      timerId = setInterval(function () {
        if (paint() <= 0) { clearInterval(timerId); setExpired(true); }
      }, 1000);
    }

    function renderResult(result) {
      currentBundle = result.bundle;
      if (els.rArchetype) els.rArchetype.textContent = result.name;
      if (els.rDesc) els.rDesc.textContent = result.desc;
      if (els.rCombo) els.rCombo.textContent = result.bundle;
      if (els.cta) els.cta.setAttribute('href', buildCtaUrl(result.bundle));
      show('result');
      startTimer();
      safeEvent('alma_match_result_viewed', result);
    }

    function finish() {
      var result = compute();
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
        sessionStorage.removeItem(DEADLINE_KEY); // fresh completion starts a new countdown
      } catch (e) {}
      safeEvent('alma_match_completed', result);
      show('loading');
      var t1 = (els.loadingTitle && els.loadingTitle.getAttribute('data-step1')) || 'Stiamo creando la tua combo Alma…';
      var t2 = (els.loadingTitle && els.loadingTitle.getAttribute('data-step2')) || 'Abbiamo trovato il tuo profilo.';
      if (els.loadingTitle) els.loadingTitle.textContent = t1;
      setTimeout(function () { if (els.loadingTitle) els.loadingTitle.textContent = t2; }, 1300);
      setTimeout(function () { renderResult(result); }, 2100);
    }

    function restart() {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(DEADLINE_KEY);
      } catch (e) {}
      if (timerId) clearInterval(timerId);
      show('intro');
    }

    if (els.startBtn) els.startBtn.addEventListener('click', startQuiz);
    if (els.continueBtn) els.continueBtn.addEventListener('click', next);
    if (els.restart) els.restart.addEventListener('click', function (e) { e.preventDefault(); restart(); });
    if (els.cta) els.cta.addEventListener('click', function (e) {
      if (expired) { if (e && e.preventDefault) e.preventDefault(); return; }
      safeEvent('alma_match_cta_clicked', { bundle: currentBundle });
      goToBundleCart(e, currentBundle);
    });

    // Restore a previous result within the same session (skipped in Theme Editor).
    var designMode = window.Shopify && window.Shopify.designMode;
    if (!designMode) {
      try {
        var saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) { renderResult(JSON.parse(saved)); return; }
      } catch (e) {}
    }
    show('intro');
  }

  function boot() {
    document.querySelectorAll('[data-am-root]').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  document.addEventListener('shopify:section:load', function (e) {
    var root = e.target.querySelector ? e.target.querySelector('[data-am-root]') : null;
    if (root) init(root);
  });
})();
