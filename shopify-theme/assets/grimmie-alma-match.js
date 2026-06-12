/*
 * Grimmie Alma Match - interactive quiz logic
 * ------------------------------------------------------------
 * Fixed quiz data (questions, scoring, archetypes) lives here.
 * Editable content (hero, how-it-works, result copy, discount,
 * bundle links, timer) is configured in the Theme Editor and
 * read from the JSON in [data-am-config] inside the section.
 *
 * Scoring categories: MAKEUP, SKINCARE, HAIRCARE.
 * Each scoring question targets one category; its answer's `points`
 * value is summed into that category only. A final `correction`
 * question applies a `delta` (-1/0/+1) to the highest-scoring
 * category, calibrating the bundle recommendation.
 * Level thresholds (per category): 0-5 BASIC, 6-8 MEDIUM, 9+ PRO.
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

  var QUESTIONS_DEFAULT = [
    {
      type: 'scoring', category: 'mk',
      heroTitle: 'Make-up',
      q: 'Quanto spesso ti trucchi?',
      answers: [
        { label: 'Mai o quasi mai', icon: 'sparkle', points: 0 },
        { label: 'Solo per occasioni speciali', icon: 'heart', points: 1 },
        { label: 'Quasi ogni giorno, con gli stessi prodotti', icon: 'brush', points: 3 },
        { label: 'Ogni giorno, anche elaborato con prodotti sempre diversi', icon: 'mirror', points: 4 }
      ]
    },
    {
      type: 'scoring', category: 'mk',
      heroTitle: 'Per le occasioni',
      q: 'Per un evento importante il make-up è…',
      answers: [
        { label: 'Lo stesso di sempre', icon: 'sparkle', points: 0 },
        { label: 'Qualcosa in più su occhi o labbra', icon: 'heart', points: 2 },
        { label: 'Una versione abbinata al mio outfit', icon: 'brush', points: 3 },
        { label: 'Un beauty look con prodotti speciali che uso nelle occasioni', icon: 'mirror', points: 5 }
      ]
    },
    {
      type: 'scoring', category: 'mk',
      heroTitle: 'Il refresh',
      q: 'Refresh prima di un appuntamento improvviso?',
      answers: [
        { label: 'Mi pettino e basta', icon: 'clock', points: 0 },
        { label: 'Retouch alle labbra + tocco di mascara', icon: 'heart', points: 1 },
        { label: 'Rinfresco fondotinta, blush, labbra', icon: 'brush', points: 4 },
        { label: 'Rifaccio il look completo', icon: 'sparkle', points: 5 }
      ]
    },
    {
      type: 'scoring', category: 'sk',
      heroTitle: 'Skincare',
      q: 'Quanto cambia la tua skincare tra mattina, sera e routine speciali?',
      answers: [
        { label: 'Uso 1–2 prodotti sempre uguali', icon: 'bottle', points: 0 },
        { label: 'Routine fissa ed essenziale', icon: 'bottle', points: 1 },
        { label: 'Routine diverse mattino/sera + maschere occasionali', icon: 'moon', points: 3 },
        { label: 'Routine personalizzate per ogni momento + weekly treatment', icon: 'sparkle', points: 4 }
      ]
    },
    {
      type: 'scoring', category: 'sk',
      heroTitle: 'Le novità',
      q: 'Quante volte acquisti skincare all’anno?',
      answers: [
        { label: 'Quasi mai', icon: 'bottle', points: 0 },
        { label: 'Quando finiscono i miei', icon: 'bottle', points: 2 },
        { label: 'Provo trend o novità ogni tanto', icon: 'sparkle', points: 3 },
        { label: 'Frequentemente, amo testare', icon: 'heart', points: 5 }
      ]
    },
    {
      type: 'scoring', category: 'sk',
      heroTitle: 'Il tuo spazio',
      q: 'Il tuo bagno o vanity è…',
      answers: [
        { label: 'Minimal, pochi prodotti', icon: 'home', points: 0 },
        { label: 'Ordinato e sobrio', icon: 'sparkle', points: 1 },
        { label: 'Pieno di flaconi e dispenser', icon: 'bottle', points: 4 },
        { label: 'Mini spa organizzata', icon: 'bath', points: 5 }
      ]
    },
    {
      type: 'scoring', category: 'hc',
      heroTitle: 'Haircare',
      q: 'Quanto dura il tuo "everything shower"?',
      answers: [
        { label: '10 minuti e sono fuori', icon: 'clock', points: 0 },
        { label: 'Una mezz’ora: shampoo, balsamo e piega veloce', icon: 'clock', points: 1 },
        { label: 'Un paio d’ore: maschera in posa, piega e finish con olio', icon: 'bath', points: 3 },
        { label: 'Un giorno intero di home spa: inizio la mattina con impacchi in posa e finisco la sera con i bigodini', icon: 'moon', points: 4 }
      ]
    },
    {
      type: 'scoring', category: 'hc',
      heroTitle: 'I tuoi tools',
      q: 'Oltre ai prodotti, cosa fa parte della tua routine capelli?',
      answers: [
        { label: 'Il phon, una spazzola e qualche elastico', icon: 'brush', points: 0 },
        { label: 'Phon, una piastra/ferro, 2-3 spazzole e qualche clip', icon: 'brush', points: 2 },
        { label: 'Phon, piastra e ferro, più spazzole, fasce e accessori', icon: 'sparkle', points: 3 },
        { label: 'Tutti i tools per fare ogni piega che voglio + accessori per ogni acconciatura', icon: 'mirror', points: 5 }
      ]
    },
    {
      type: 'scoring', category: 'hc',
      heroTitle: 'Le spazzole',
      q: 'Quante spazzole hai per i capelli?',
      answers: [
        { label: 'Una sola, sempre quella', icon: 'brush', points: 0 },
        { label: 'Due: una per la piega, una pettina', icon: 'brush', points: 1 },
        { label: '3–4, scelgo in base alla situazione', icon: 'brush', points: 4 },
        { label: 'Ne ho tantissime, per ogni situazione e styling', icon: 'sparkle', points: 5 }
      ]
    },
    {
      type: 'feedback',
      heroTitle: 'Per finire',
      q: 'Pensando alla tua routine nei prossimi mesi, vorresti…',
      answers: [
        { label: 'Vorrei fare qualche declutter e renderla più essenziale', icon: 'home', delta: -1 },
        { label: 'Mantenerla così. Ho raggiunto il mio equilibrio', icon: 'heart', delta: 0 },
        { label: 'Perfezionarla aggiungendo qualcosa ed eliminando qualcosa', icon: 'sparkle', delta: 0 },
        { label: 'Farla crescere, ho già tanti prodotti e tools nella wishlist', icon: 'bag', delta: 1 }
      ]
    }
  ];

  // key = "MAKEUP-SKINCARE-HAIRCARE" -> archetype, bundle (display + key), description
  var ARCHETYPES_DEFAULT = {
    'BASIC-BASIC-BASIC': { name: 'La ragazza acqua e sapone', bundle: '2 Classic + 1 Large', desc: 'Sei autentica, spontanea e naturalmente luminosa. Non hai bisogno di costruirti addosso un personaggio: il tuo punto di forza è proprio la semplicità con cui riesci a essere te stessa.', descMakeup: 'Il tuo make-up è essenziale, leggero e molto naturale. Non ami appesantire il viso: preferisci pochi prodotti scelti bene, quelli che ti fanno sentire fresca, ordinata e subito più a posto senza stravolgere la tua immagine.', descSkincare: 'La tua skincare è semplice, pratica e diretta. Ti interessa sentirti pulita, fresca e a tuo agio nella tua pelle, senza una routine troppo lunga o complicata. Pochi prodotti giusti, usati bene, sono tutto ciò che ti serve.', descHaircare: 'I tuoi capelli seguono la tua naturalezza. Ti piace averli puliti, ordinati e facili da gestire, senza dover dedicare troppo tempo allo styling. Cerchi praticità, leggerezza e prodotti essenziali che ti aiutino a sentirti subito in ordine.' },
    'BASIC-BASIC-MEDIUM': { name: 'Vanilla Girl', bundle: '3 Classic + 1 Large', desc: 'Hai un’eleganza morbida, delicata e rassicurante. Sei quella presenza dolce ma curata, capace di rendere tutto più bello senza mai risultare eccessiva.', descMakeup: 'Il tuo make-up è essenziale, leggero e molto naturale. Non ami appesantire il viso: preferisci pochi prodotti scelti bene, quelli che ti fanno sentire fresca, ordinata e subito più a posto senza stravolgere la tua immagine.', descSkincare: 'La tua skincare è semplice, pratica e diretta. Ti interessa sentirti pulita, fresca e a tuo agio nella tua pelle, senza una routine troppo lunga o complicata. Pochi prodotti giusti, usati bene, sono tutto ciò che ti serve.', descHaircare: 'I capelli per te sono parte importante del look. Ti piace curarli, sistemarli e avere con te i prodotti giusti per mantenerli morbidi, ordinati e coerenti con la tua immagine. Non serve una routine enorme, ma serve spazio per ciò che fa davvero la differenza.' },
    'BASIC-BASIC-PRO': { name: 'Blowout Girl', bundle: '2 Classic + 2 Large', desc: 'Hai un’energia femminile, sicura e sempre curata. Anche quando scegli la semplicità, riesci a trasmettere quella sensazione di ordine, sicurezza e attenzione ai dettagli.', descMakeup: 'Il tuo make-up è essenziale, leggero e molto naturale. Non ami appesantire il viso: preferisci pochi prodotti scelti bene, quelli che ti fanno sentire fresca, ordinata e subito più a posto senza stravolgere la tua immagine.', descSkincare: 'La tua skincare è semplice, pratica e diretta. Ti interessa sentirti pulita, fresca e a tuo agio nella tua pelle, senza una routine troppo lunga o complicata. Pochi prodotti giusti, usati bene, sono tutto ciò che ti serve.', descHaircare: 'L’haircare per te è un vero rituale. Ami prenderti cura dei capelli con prodotti, strumenti e trattamenti diversi, perché sai quanto incidono sul modo in cui ti senti. Che sia piega, styling, maschera o finish finale, i capelli hanno bisogno del loro spazio dedicato.' },
    'BASIC-MEDIUM-BASIC': { name: 'Wellness Girl', bundle: '1 Classic + 2 Large', desc: 'Cerchi equilibrio, armonia e benessere in tutto ciò che fai. Hai un modo di vivere più consapevole, che ti rende centrata, luminosa e profondamente in contatto con te stessa.', descMakeup: 'Il tuo make-up è essenziale, leggero e molto naturale. Non ami appesantire il viso: preferisci pochi prodotti scelti bene, quelli che ti fanno sentire fresca, ordinata e subito più a posto senza stravolgere la tua immagine.', descSkincare: 'La skincare per te è un momento importante della giornata. Ti piace prenderti cura della pelle con una routine più completa, fatta di prodotti che ti fanno sentire luminosa, curata e in equilibrio. Non è solo funzionalità: è anche un piccolo momento per te.', descHaircare: 'I tuoi capelli seguono la tua naturalezza. Ti piace averli puliti, ordinati e facili da gestire, senza dover dedicare troppo tempo allo styling. Cerchi praticità, leggerezza e prodotti essenziali che ti aiutino a sentirti subito in ordine.' },
    'BASIC-MEDIUM-MEDIUM': { name: 'Pilates Princess', bundle: '2 Classic + 2 Large', desc: 'Sei disciplinata, positiva e composta, ma mai rigida. Hai quella leggerezza da ragazza che si prende cura di sé con naturalezza e riesce a sembrare sempre in controllo.', descMakeup: 'Il tuo make-up è essenziale, leggero e molto naturale. Non ami appesantire il viso: preferisci pochi prodotti scelti bene, quelli che ti fanno sentire fresca, ordinata e subito più a posto senza stravolgere la tua immagine.', descSkincare: 'La skincare per te è un momento importante della giornata. Ti piace prenderti cura della pelle con una routine più completa, fatta di prodotti che ti fanno sentire luminosa, curata e in equilibrio. Non è solo funzionalità: è anche un piccolo momento per te.', descHaircare: 'I capelli per te sono parte importante del look. Ti piace curarli, sistemarli e avere con te i prodotti giusti per mantenerli morbidi, ordinati e coerenti con la tua immagine. Non serve una routine enorme, ma serve spazio per ciò che fa davvero la differenza.' },
    'BASIC-MEDIUM-PRO': { name: 'Everything Shower Girl', bundle: '1 Classic + 3 Large', desc: 'Sei romantica, sensibile e molto connessa ai tuoi piccoli momenti personali. Ti piace sentirti bene nella tua pelle e hai un modo speciale di trasformare anche le cose semplici in qualcosa di tuo.', descMakeup: 'Il tuo make-up è essenziale, leggero e molto naturale. Non ami appesantire il viso: preferisci pochi prodotti scelti bene, quelli che ti fanno sentire fresca, ordinata e subito più a posto senza stravolgere la tua immagine.', descSkincare: 'La skincare per te è un momento importante della giornata. Ti piace prenderti cura della pelle con una routine più completa, fatta di prodotti che ti fanno sentire luminosa, curata e in equilibrio. Non è solo funzionalità: è anche un piccolo momento per te.', descHaircare: 'L’haircare per te è un vero rituale. Ami prenderti cura dei capelli con prodotti, strumenti e trattamenti diversi, perché sai quanto incidono sul modo in cui ti senti. Che sia piega, styling, maschera o finish finale, i capelli hanno bisogno del loro spazio dedicato.' },
    'BASIC-PRO-BASIC': { name: 'Glass Skin Girl', bundle: '2 Classic + 2 Large', desc: 'Hai un’eleganza delicata, pulita e raffinata. Ti distingui per quella luminosità naturale che non ha bisogno di urlare per farsi notare.', descMakeup: 'Il tuo make-up è essenziale, leggero e molto naturale. Non ami appesantire il viso: preferisci pochi prodotti scelti bene, quelli che ti fanno sentire fresca, ordinata e subito più a posto senza stravolgere la tua immagine.', descSkincare: 'La skincare è uno dei tuoi rituali principali. Ami conoscere la tua pelle, scegliere prodotti specifici e costruire una routine su misura. Per te la cura del viso non è un passaggio veloce, ma una parte fondamentale del tuo modo di sentirti bene, luminosa e sicura.', descHaircare: 'I tuoi capelli seguono la tua naturalezza. Ti piace averli puliti, ordinati e facili da gestire, senza dover dedicare troppo tempo allo styling. Cerchi praticità, leggerezza e prodotti essenziali che ti aiutino a sentirti subito in ordine.' },
    'BASIC-PRO-MEDIUM': { name: 'Clean Girl', bundle: '3 Classic + 2 Large', desc: 'Sei essenziale, ordinata e sofisticata. Hai un’estetica pulita e riconoscibile, quella di chi sembra sempre fresca, composta e impeccabile senza sforzo.', descMakeup: 'Il tuo make-up è essenziale, leggero e molto naturale. Non ami appesantire il viso: preferisci pochi prodotti scelti bene, quelli che ti fanno sentire fresca, ordinata e subito più a posto senza stravolgere la tua immagine.', descSkincare: 'La skincare è uno dei tuoi rituali principali. Ami conoscere la tua pelle, scegliere prodotti specifici e costruire una routine su misura. Per te la cura del viso non è un passaggio veloce, ma una parte fondamentale del tuo modo di sentirti bene, luminosa e sicura.', descHaircare: 'I capelli per te sono parte importante del look. Ti piace curarli, sistemarli e avere con te i prodotti giusti per mantenerli morbidi, ordinati e coerenti con la tua immagine. Non serve una routine enorme, ma serve spazio per ciò che fa davvero la differenza.' },
    'BASIC-PRO-PRO': { name: 'Self-Care Girl', bundle: '2 Classic + 3 Large', desc: 'Sai dare valore a te stessa. Hai una sensibilità profonda e trasmetti l’energia di chi ha imparato che prendersi cura di sé non è vanità, ma rispetto.', descMakeup: 'Il tuo make-up è essenziale, leggero e molto naturale. Non ami appesantire il viso: preferisci pochi prodotti scelti bene, quelli che ti fanno sentire fresca, ordinata e subito più a posto senza stravolgere la tua immagine.', descSkincare: 'La skincare è uno dei tuoi rituali principali. Ami conoscere la tua pelle, scegliere prodotti specifici e costruire una routine su misura. Per te la cura del viso non è un passaggio veloce, ma una parte fondamentale del tuo modo di sentirti bene, luminosa e sicura.', descHaircare: 'L’haircare per te è un vero rituale. Ami prenderti cura dei capelli con prodotti, strumenti e trattamenti diversi, perché sai quanto incidono sul modo in cui ti senti. Che sia piega, styling, maschera o finish finale, i capelli hanno bisogno del loro spazio dedicato.' },
    'MEDIUM-BASIC-BASIC': { name: 'French Girl', bundle: '3 Classic + 1 Large', desc: 'Hai fascino naturale e un’eleganza istintiva. Non insegui la perfezione: sai che sono proprio spontaneità, carattere e piccoli dettagli imperfetti a renderti interessante.', descMakeup: 'Il make-up per te è parte della tua identità quotidiana. Ti piace avere più opzioni, alternare prodotti diversi e costruire look che ti facciano sentire curata, sicura e coerente con il tuo stile, senza necessariamente esagerare.', descSkincare: 'La tua skincare è semplice, pratica e diretta. Ti interessa sentirti pulita, fresca e a tuo agio nella tua pelle, senza una routine troppo lunga o complicata. Pochi prodotti giusti, usati bene, sono tutto ciò che ti serve.', descHaircare: 'I tuoi capelli seguono la tua naturalezza. Ti piace averli puliti, ordinati e facili da gestire, senza dover dedicare troppo tempo allo styling. Cerchi praticità, leggerezza e prodotti essenziali che ti aiutino a sentirti subito in ordine.' },
    'MEDIUM-BASIC-MEDIUM': { name: 'Off Duty Model', bundle: '4 Classic + 1 Large', desc: 'Hai uno stile rilassato ma impossibile da ignorare. Riesci a sembrare curata anche quando non vuoi apparire troppo costruita, ed è proprio questo che ti rende così cool.', descMakeup: 'Il make-up per te è parte della tua identità quotidiana. Ti piace avere più opzioni, alternare prodotti diversi e costruire look che ti facciano sentire curata, sicura e coerente con il tuo stile, senza necessariamente esagerare.', descSkincare: 'La tua skincare è semplice, pratica e diretta. Ti interessa sentirti pulita, fresca e a tuo agio nella tua pelle, senza una routine troppo lunga o complicata. Pochi prodotti giusti, usati bene, sono tutto ciò che ti serve.', descHaircare: 'I capelli per te sono parte importante del look. Ti piace curarli, sistemarli e avere con te i prodotti giusti per mantenerli morbidi, ordinati e coerenti con la tua immagine. Non serve una routine enorme, ma serve spazio per ciò che fa davvero la differenza.' },
    'MEDIUM-BASIC-PRO': { name: 'Rich Girl', bundle: '3 Classic + 2 Large', desc: 'Hai gusto, presenza e un occhio naturale per ciò che è bello. Ti piace scegliere con cura e trasmetti un’eleganza sicura, mai casuale.', descMakeup: 'Il make-up per te è parte della tua identità quotidiana. Ti piace avere più opzioni, alternare prodotti diversi e costruire look che ti facciano sentire curata, sicura e coerente con il tuo stile, senza necessariamente esagerare.', descSkincare: 'La tua skincare è semplice, pratica e diretta. Ti interessa sentirti pulita, fresca e a tuo agio nella tua pelle, senza una routine troppo lunga o complicata. Pochi prodotti giusti, usati bene, sono tutto ciò che ti serve.', descHaircare: 'L’haircare per te è un vero rituale. Ami prenderti cura dei capelli con prodotti, strumenti e trattamenti diversi, perché sai quanto incidono sul modo in cui ti senti. Che sia piega, styling, maschera o finish finale, i capelli hanno bisogno del loro spazio dedicato.' },
    'MEDIUM-MEDIUM-BASIC': { name: 'That Girl', bundle: '2 Classic + 2 Large', desc: 'Sei determinata, ordinata e piena di intenzione. Hai l’energia di chi sta costruendo la versione migliore di sé e lo fa con sicurezza, costanza e stile.', descMakeup: 'Il make-up per te è parte della tua identità quotidiana. Ti piace avere più opzioni, alternare prodotti diversi e costruire look che ti facciano sentire curata, sicura e coerente con il tuo stile, senza necessariamente esagerare.', descSkincare: 'La skincare per te è un momento importante della giornata. Ti piace prenderti cura della pelle con una routine più completa, fatta di prodotti che ti fanno sentire luminosa, curata e in equilibrio. Non è solo funzionalità: è anche un piccolo momento per te.', descHaircare: 'I tuoi capelli seguono la tua naturalezza. Ti piace averli puliti, ordinati e facili da gestire, senza dover dedicare troppo tempo allo styling. Cerchi praticità, leggerezza e prodotti essenziali che ti aiutino a sentirti subito in ordine.' },
    'MEDIUM-MEDIUM-MEDIUM': { name: 'IT Girl', bundle: '3 Classic + 2 Large', desc: 'Hai personalità da vendere. Non hai bisogno di seguire ogni tendenza: spesso sei tu a renderla interessante, semplicemente portandola nel tuo modo.', descMakeup: 'Il make-up per te è parte della tua identità quotidiana. Ti piace avere più opzioni, alternare prodotti diversi e costruire look che ti facciano sentire curata, sicura e coerente con il tuo stile, senza necessariamente esagerare.', descSkincare: 'La skincare per te è un momento importante della giornata. Ti piace prenderti cura della pelle con una routine più completa, fatta di prodotti che ti fanno sentire luminosa, curata e in equilibrio. Non è solo funzionalità: è anche un piccolo momento per te.', descHaircare: 'I capelli per te sono parte importante del look. Ti piace curarli, sistemarli e avere con te i prodotti giusti per mantenerli morbidi, ordinati e coerenti con la tua immagine. Non serve una routine enorme, ma serve spazio per ciò che fa davvero la differenza.' },
    'MEDIUM-MEDIUM-PRO': { name: 'Soft Glam Girl', bundle: '2 Classic + 3 Large', desc: 'Hai un’eleganza femminile, morbida e sofisticata. Ti piace sentirti valorizzata, ma sempre con quel tocco naturale che ti rende raffinata e mai eccessiva.', descMakeup: 'Il make-up per te è parte della tua identità quotidiana. Ti piace avere più opzioni, alternare prodotti diversi e costruire look che ti facciano sentire curata, sicura e coerente con il tuo stile, senza necessariamente esagerare.', descSkincare: 'La skincare per te è un momento importante della giornata. Ti piace prenderti cura della pelle con una routine più completa, fatta di prodotti che ti fanno sentire luminosa, curata e in equilibrio. Non è solo funzionalità: è anche un piccolo momento per te.', descHaircare: 'L’haircare per te è un vero rituale. Ami prenderti cura dei capelli con prodotti, strumenti e trattamenti diversi, perché sai quanto incidono sul modo in cui ti senti. Che sia piega, styling, maschera o finish finale, i capelli hanno bisogno del loro spazio dedicato.' },
    'MEDIUM-PRO-BASIC': { name: 'K-Girl', bundle: '3 Classic + 2 Large', desc: 'Sei curiosa, precisa e sempre attenta ai dettagli. Hai un modo delicato ma ricercato di esprimerti, e riesci a trasformare ogni scelta in qualcosa di estremamente curato.', descMakeup: 'Il make-up per te è parte della tua identità quotidiana. Ti piace avere più opzioni, alternare prodotti diversi e costruire look che ti facciano sentire curata, sicura e coerente con il tuo stile, senza necessariamente esagerare.', descSkincare: 'La skincare è uno dei tuoi rituali principali. Ami conoscere la tua pelle, scegliere prodotti specifici e costruire una routine su misura. Per te la cura del viso non è un passaggio veloce, ma una parte fondamentale del tuo modo di sentirti bene, luminosa e sicura.', descHaircare: 'I tuoi capelli seguono la tua naturalezza. Ti piace averli puliti, ordinati e facili da gestire, senza dover dedicare troppo tempo allo styling. Cerchi praticità, leggerezza e prodotti essenziali che ti aiutino a sentirti subito in ordine.' },
    'MEDIUM-PRO-MEDIUM': { name: 'Pinterest Girl', bundle: '4 Classic + 2 Large', desc: 'Hai un immaginario forte, creativo e molto personale. Vedi bellezza ovunque e riesci a costruire un’estetica che parla di te ancora prima che tu dica qualcosa.', descMakeup: 'Il make-up per te è parte della tua identità quotidiana. Ti piace avere più opzioni, alternare prodotti diversi e costruire look che ti facciano sentire curata, sicura e coerente con il tuo stile, senza necessariamente esagerare.', descSkincare: 'La skincare è uno dei tuoi rituali principali. Ami conoscere la tua pelle, scegliere prodotti specifici e costruire una routine su misura. Per te la cura del viso non è un passaggio veloce, ma una parte fondamentale del tuo modo di sentirti bene, luminosa e sicura.', descHaircare: 'I capelli per te sono parte importante del look. Ti piace curarli, sistemarli e avere con te i prodotti giusti per mantenerli morbidi, ordinati e coerenti con la tua immagine. Non serve una routine enorme, ma serve spazio per ciò che fa davvero la differenza.' },
    'MEDIUM-PRO-PRO': { name: 'Beauty Addict', bundle: '3 Classic + 3 Large', desc: 'Vivi la bellezza come una forma di espressione. Sei curiosa, appassionata e sempre pronta a scoprire qualcosa che possa raccontare meglio chi sei.', descMakeup: 'Il make-up per te è parte della tua identità quotidiana. Ti piace avere più opzioni, alternare prodotti diversi e costruire look che ti facciano sentire curata, sicura e coerente con il tuo stile, senza necessariamente esagerare.', descSkincare: 'La skincare è uno dei tuoi rituali principali. Ami conoscere la tua pelle, scegliere prodotti specifici e costruire una routine su misura. Per te la cura del viso non è un passaggio veloce, ma una parte fondamentale del tuo modo di sentirti bene, luminosa e sicura.', descHaircare: 'L’haircare per te è un vero rituale. Ami prenderti cura dei capelli con prodotti, strumenti e trattamenti diversi, perché sai quanto incidono sul modo in cui ti senti. Che sia piega, styling, maschera o finish finale, i capelli hanno bisogno del loro spazio dedicato.' },
    'PRO-BASIC-BASIC': { name: 'Makeup Lover', bundle: '2 Classic + 2 Large', desc: 'Sei creativa, espressiva e piena di carattere. Ti piace giocare con la tua immagine e usare il beauty come un modo per mostrare le diverse versioni di te.', descMakeup: 'Per te il make-up è espressione, creatività e presenza. Ami avere scelta, giocare con texture, finish e combinazioni diverse, e costruire look che raccontano il tuo mood. Il tuo beauty ha bisogno di spazio, perché il make-up non è un dettaglio: è parte del tuo modo di comunicare.', descSkincare: 'La tua skincare è semplice, pratica e diretta. Ti interessa sentirti pulita, fresca e a tuo agio nella tua pelle, senza una routine troppo lunga o complicata. Pochi prodotti giusti, usati bene, sono tutto ciò che ti serve.', descHaircare: 'I tuoi capelli seguono la tua naturalezza. Ti piace averli puliti, ordinati e facili da gestire, senza dover dedicare troppo tempo allo styling. Cerchi praticità, leggerezza e prodotti essenziali che ti aiutino a sentirti subito in ordine.' },
    'PRO-BASIC-MEDIUM': { name: 'City Girl', bundle: '3 Classic + 2 Large', desc: 'Sei indipendente, dinamica e sempre pronta a muoverti nel mondo con sicurezza. Hai un’energia urbana, veloce e brillante, ma non perdi mai il tuo stile.', descMakeup: 'Per te il make-up è espressione, creatività e presenza. Ami avere scelta, giocare con texture, finish e combinazioni diverse, e costruire look che raccontano il tuo mood. Il tuo beauty ha bisogno di spazio, perché il make-up non è un dettaglio: è parte del tuo modo di comunicare.', descSkincare: 'La tua skincare è semplice, pratica e diretta. Ti interessa sentirti pulita, fresca e a tuo agio nella tua pelle, senza una routine troppo lunga o complicata. Pochi prodotti giusti, usati bene, sono tutto ciò che ti serve.', descHaircare: 'I capelli per te sono parte importante del look. Ti piace curarli, sistemarli e avere con te i prodotti giusti per mantenerli morbidi, ordinati e coerenti con la tua immagine. Non serve una routine enorme, ma serve spazio per ciò che fa davvero la differenza.' },
    'PRO-BASIC-PRO': { name: 'Main Character', bundle: '2 Classic + 3 Large', desc: 'Hai presenza, carisma e voglia di vivere la tua vita da protagonista. Non aspetti che siano gli altri a darti spazio: sai prendertelo con naturalezza.', descMakeup: 'Per te il make-up è espressione, creatività e presenza. Ami avere scelta, giocare con texture, finish e combinazioni diverse, e costruire look che raccontano il tuo mood. Il tuo beauty ha bisogno di spazio, perché il make-up non è un dettaglio: è parte del tuo modo di comunicare.', descSkincare: 'La tua skincare è semplice, pratica e diretta. Ti interessa sentirti pulita, fresca e a tuo agio nella tua pelle, senza una routine troppo lunga o complicata. Pochi prodotti giusti, usati bene, sono tutto ciò che ti serve.', descHaircare: 'L’haircare per te è un vero rituale. Ami prenderti cura dei capelli con prodotti, strumenti e trattamenti diversi, perché sai quanto incidono sul modo in cui ti senti. Che sia piega, styling, maschera o finish finale, i capelli hanno bisogno del loro spazio dedicato.' },
    'PRO-MEDIUM-BASIC': { name: 'Dark Feminine Girl', bundle: '1 Classic + 3 Large', desc: 'Hai un fascino magnetico, intenso e difficile da ignorare. Non hai bisogno di essere rumorosa per farti notare: la tua energia parla prima di te.', descMakeup: 'Per te il make-up è espressione, creatività e presenza. Ami avere scelta, giocare con texture, finish e combinazioni diverse, e costruire look che raccontano il tuo mood. Il tuo beauty ha bisogno di spazio, perché il make-up non è un dettaglio: è parte del tuo modo di comunicare.', descSkincare: 'La skincare per te è un momento importante della giornata. Ti piace prenderti cura della pelle con una routine più completa, fatta di prodotti che ti fanno sentire luminosa, curata e in equilibrio. Non è solo funzionalità: è anche un piccolo momento per te.', descHaircare: 'I tuoi capelli seguono la tua naturalezza. Ti piace averli puliti, ordinati e facili da gestire, senza dover dedicare troppo tempo allo styling. Cerchi praticità, leggerezza e prodotti essenziali che ti aiutino a sentirti subito in ordine.' },
    'PRO-MEDIUM-MEDIUM': { name: 'Cool Girl', bundle: '2 Classic + 3 Large', desc: 'Hai quella sicurezza naturale che non si può copiare. Sei spontanea, interessante e mai forzata: il tuo stile funziona perché sembra davvero tuo.', descMakeup: 'Per te il make-up è espressione, creatività e presenza. Ami avere scelta, giocare con texture, finish e combinazioni diverse, e costruire look che raccontano il tuo mood. Il tuo beauty ha bisogno di spazio, perché il make-up non è un dettaglio: è parte del tuo modo di comunicare.', descSkincare: 'La skincare per te è un momento importante della giornata. Ti piace prenderti cura della pelle con una routine più completa, fatta di prodotti che ti fanno sentire luminosa, curata e in equilibrio. Non è solo funzionalità: è anche un piccolo momento per te.', descHaircare: 'I capelli per te sono parte importante del look. Ti piace curarli, sistemarli e avere con te i prodotti giusti per mantenerli morbidi, ordinati e coerenti con la tua immagine. Non serve una routine enorme, ma serve spazio per ciò che fa davvero la differenza.' },
    'PRO-MEDIUM-PRO': { name: 'GRWM Girl', bundle: '1 Classic + 4 Large', desc: 'Hai una personalità solare, espressiva e coinvolgente. Ti piace raccontarti, condividere il tuo mondo e far sentire gli altri parte della tua energia.', descMakeup: 'Per te il make-up è espressione, creatività e presenza. Ami avere scelta, giocare con texture, finish e combinazioni diverse, e costruire look che raccontano il tuo mood. Il tuo beauty ha bisogno di spazio, perché il make-up non è un dettaglio: è parte del tuo modo di comunicare.', descSkincare: 'La skincare per te è un momento importante della giornata. Ti piace prenderti cura della pelle con una routine più completa, fatta di prodotti che ti fanno sentire luminosa, curata e in equilibrio. Non è solo funzionalità: è anche un piccolo momento per te.', descHaircare: 'L’haircare per te è un vero rituale. Ami prenderti cura dei capelli con prodotti, strumenti e trattamenti diversi, perché sai quanto incidono sul modo in cui ti senti. Che sia piega, styling, maschera o finish finale, i capelli hanno bisogno del loro spazio dedicato.' },
    'PRO-PRO-BASIC': { name: 'Sephora Girl', bundle: '2 Classic + 3 Large', desc: 'Sei curiosa, entusiasta e sempre attratta da ciò che può farti sentire ancora più te stessa. Hai uno spirito esplorativo e vivi il beauty come un universo da scoprire.', descMakeup: 'Per te il make-up è espressione, creatività e presenza. Ami avere scelta, giocare con texture, finish e combinazioni diverse, e costruire look che raccontano il tuo mood. Il tuo beauty ha bisogno di spazio, perché il make-up non è un dettaglio: è parte del tuo modo di comunicare.', descSkincare: 'La skincare è uno dei tuoi rituali principali. Ami conoscere la tua pelle, scegliere prodotti specifici e costruire una routine su misura. Per te la cura del viso non è un passaggio veloce, ma una parte fondamentale del tuo modo di sentirti bene, luminosa e sicura.', descHaircare: 'I tuoi capelli seguono la tua naturalezza. Ti piace averli puliti, ordinati e facili da gestire, senza dover dedicare troppo tempo allo styling. Cerchi praticità, leggerezza e prodotti essenziali che ti aiutino a sentirti subito in ordine.' },
    'PRO-PRO-MEDIUM': { name: 'Beauty Influencer', bundle: '3 Classic + 3 Large', desc: 'Hai creatività, intuito e un occhio allenato per le tendenze. Riesci a trasformare ciò che ami in ispirazione, perché il tuo modo di vedere le cose è già contenuto.', descMakeup: 'Per te il make-up è espressione, creatività e presenza. Ami avere scelta, giocare con texture, finish e combinazioni diverse, e costruire look che raccontano il tuo mood. Il tuo beauty ha bisogno di spazio, perché il make-up non è un dettaglio: è parte del tuo modo di comunicare.', descSkincare: 'La skincare è uno dei tuoi rituali principali. Ami conoscere la tua pelle, scegliere prodotti specifici e costruire una routine su misura. Per te la cura del viso non è un passaggio veloce, ma una parte fondamentale del tuo modo di sentirti bene, luminosa e sicura.', descHaircare: 'I capelli per te sono parte importante del look. Ti piace curarli, sistemarli e avere con te i prodotti giusti per mantenerli morbidi, ordinati e coerenti con la tua immagine. Non serve una routine enorme, ma serve spazio per ciò che fa davvero la differenza.' },
    'PRO-PRO-PRO': { name: 'Star Girl', bundle: '2 Classic + 4 Large', desc: 'Hai un’energia luminosa, ambiziosa e impossibile da ignorare. Ti piace distinguerti, puntare in alto e lasciare il segno ovunque vai.', descMakeup: 'Per te il make-up è espressione, creatività e presenza. Ami avere scelta, giocare con texture, finish e combinazioni diverse, e costruire look che raccontano il tuo mood. Il tuo beauty ha bisogno di spazio, perché il make-up non è un dettaglio: è parte del tuo modo di comunicare.', descSkincare: 'La skincare è uno dei tuoi rituali principali. Ami conoscere la tua pelle, scegliere prodotti specifici e costruire una routine su misura. Per te la cura del viso non è un passaggio veloce, ma una parte fondamentale del tuo modo di sentirti bene, luminosa e sicura.', descHaircare: 'L’haircare per te è un vero rituale. Ami prenderti cura dei capelli con prodotti, strumenti e trattamenti diversi, perché sai quanto incidono sul modo in cui ti senti. Che sia piega, styling, maschera o finish finale, i capelli hanno bisogno del loro spazio dedicato.' }
  };

  var STORAGE_KEY = 'grimmie_alma_match_result';
  var DEADLINE_KEY = 'grimmie_alma_match_deadline';

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
      startBtns: root.querySelectorAll('[data-am-start]'),
      heroTitle: root.querySelector('[data-am-q-herotitle]'),
      progressLabel: root.querySelector('[data-am-q-progress-label]'),
      bar: root.querySelector('[data-am-q-bar]'),
      qTitle: root.querySelector('[data-am-q-title]'),
      cards: root.querySelector('[data-am-q-cards]'),
      continueBtn: root.querySelector('[data-am-q-continue]'),
      rArchetype: root.querySelector('[data-am-r-archetype]'),
      rDesc: root.querySelector('[data-am-r-desc]'),
      rWhyTexts: root.querySelectorAll('[data-am-r-why]'),
      rCombo: root.querySelector('[data-am-r-combo]'),
      rComboImageWrap: root.querySelector('[data-am-r-combo-image-wrap]'),
      rCardImageWrap: root.querySelector('[data-am-r-card-image-wrap]'),
      cta: root.querySelector('[data-am-cta]'),
      ctaRestart: root.querySelector('[data-am-cta-restart]'),
      timer: root.querySelector('[data-am-timer]'),
      discountBox: root.querySelector('[data-am-discount]'),
      priceBox: root.querySelector('[data-am-price]'),
      priceOriginal: root.querySelector('[data-am-price-original]'),
      priceNow: root.querySelector('[data-am-price-now]'),
      priceSave: root.querySelector('[data-am-price-save]'),
      expiredMsg: root.querySelector('[data-am-expired]'),
      restart: root.querySelector('[data-am-restart]'),
      loadingTitle: root.querySelector('[data-am-loading-title]')
    };

    // Read the quiz data from the section's config so merchants can edit
    // questions, answers, scores and archetypes from the theme editor.
    // Fall back to the bundled defaults when the section has no blocks.
    var questions = (config.questions && config.questions.length) ? config.questions : QUESTIONS_DEFAULT;
    var archetypes = (config.archetypes && Object.keys(config.archetypes).length) ? config.archetypes : ARCHETYPES_DEFAULT;

    function levelOf(score) {
      var proMin = parseInt(config.levelProMin, 10);
      if (isNaN(proMin)) proMin = 9;
      var medMin = parseInt(config.levelMediumMin, 10);
      if (isNaN(medMin)) medMin = 6;
      if (score >= proMin) return 'PRO';
      if (score >= medMin) return 'MEDIUM';
      return 'BASIC';
    }

    var total = questions.length;
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
      var data = questions[current];
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
      var correctionDelta = 0;
      for (var i = 0; i < total; i++) {
        var q = questions[i];
        var a = q.answers[answers[i]];
        if (!a) continue;
        if (q.type === 'feedback') {
          correctionDelta += (parseInt(a.delta, 10) || 0);
          continue;
        }
        var pts = parseInt(a.points, 10) || 0;
        var cat = (q.category || '').toLowerCase();
        if (cat === 'mk') mk += pts;
        else if (cat === 'sk') sk += pts;
        else if (cat === 'hc') hc += pts;
      }
      // Apply correction to the highest-scoring category (tie-break mk → sk → hc).
      if (correctionDelta !== 0) {
        if (mk >= sk && mk >= hc) mk += correctionDelta;
        else if (sk >= hc) sk += correctionDelta;
        else hc += correctionDelta;
      }
      var key = levelOf(mk) + '-' + levelOf(sk) + '-' + levelOf(hc);
      var arch = archetypes[key] || archetypes['BASIC-BASIC-BASIC'] || ARCHETYPES_DEFAULT['BASIC-BASIC-BASIC'];
      return {
        key: key,
        name: arch.name,
        bundle: arch.bundle,
        desc: arch.desc,
        descMakeup: arch.descMakeup || '',
        descSkincare: arch.descSkincare || '',
        descHaircare: arch.descHaircare || '',
        cardImage: arch.cardImage || '',
        mk: mk, sk: sk, hc: hc
      };
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
      // When the timer ends, swap the buy CTA for a restart-the-quiz button.
      if (els.cta) els.cta.hidden = state;
      if (els.ctaRestart) els.ctaRestart.hidden = !state;
    }

    function durationSeconds() {
      var secs = parseInt(config.timerSeconds, 10);
      if (!isNaN(secs) && secs > 0) return secs;
      var minutes = parseInt(config.timerMinutes, 10);
      if (isNaN(minutes) || minutes <= 0) return 600;
      return minutes * 60;
    }

    function startTimer() {
      if (!els.timer) return;
      setExpired(false);
      // Persist an absolute deadline so the countdown survives page reloads
      // instead of restarting from the full duration each time. A stale
      // deadline in the past must stay expired (don't reset the offer).
      var deadline = 0;
      try { deadline = parseInt(sessionStorage.getItem(DEADLINE_KEY), 10); } catch (e) {}
      if (!deadline || isNaN(deadline)) {
        deadline = Date.now() + durationSeconds() * 1000;
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

    function discountPercent() {
      var n = parseFloat(String(config.discountLabel || '').replace(/[^0-9.]/g, ''));
      return isNaN(n) ? 0 : n;
    }

    function formatMoney(cents) {
      var amount = (parseInt(cents, 10) || 0) / 100;
      try {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: config.currency || 'EUR' }).format(amount);
      } catch (e) {
        return (config.currency || 'EUR') + ' ' + amount.toFixed(2);
      }
    }

    // Show the combo's full price struck through next to the discounted price.
    function renderPrice(bundle) {
      if (!els.priceBox) return;
      var cp = parseInt(config.classicPrice, 10) || 0;
      var lp = parseInt(config.largePrice, 10) || 0;
      var counts = parseBundleCounts(bundle);
      var original = counts.classic * cp + counts.large * lp;
      if (original <= 0) { els.priceBox.hidden = true; return; }
      var discounted = Math.round(original * (100 - discountPercent()) / 100);
      var saved = original - discounted;
      if (els.priceNow) els.priceNow.textContent = formatMoney(discounted);
      if (els.priceOriginal) els.priceOriginal.textContent = formatMoney(original);
      if (els.priceSave) {
        els.priceSave.textContent = 'Risparmi ' + formatMoney(saved);
        els.priceSave.hidden = saved <= 0;
      }
      els.priceBox.hidden = false;
    }

    function renderResult(result) {
      currentBundle = result.bundle;
      if (els.rArchetype) els.rArchetype.textContent = result.name;
      if (els.rDesc) els.rDesc.textContent = result.desc;
      if (els.rCombo) els.rCombo.textContent = result.bundle;
      // Swap the combo image when a per-bundle picture is configured.
      var comboImg = (config.comboImages || {})[result.bundle];
      if (comboImg && els.rComboImageWrap) {
        els.rComboImageWrap.innerHTML = '';
        var img = document.createElement('img');
        img.src = comboImg;
        img.alt = config.comboImageAlt || result.bundle;
        img.loading = 'lazy';
        els.rComboImageWrap.appendChild(img);
      }
      // Per-archetype card image, shown below the description.
      if (els.rCardImageWrap) {
        els.rCardImageWrap.innerHTML = '';
        if (result.cardImage) {
          var cardImg = document.createElement('img');
          cardImg.src = result.cardImage;
          cardImg.alt = result.name || '';
          cardImg.loading = 'lazy';
          els.rCardImageWrap.appendChild(cardImg);
        }
      }
      // Map the three thematic descriptions onto the "why" list, in order:
      // 1 make-up, 2 skincare, 3 haircare.
      var whyTexts = [result.descMakeup, result.descSkincare, result.descHaircare];
      if (els.rWhyTexts && els.rWhyTexts.length) {
        Array.prototype.forEach.call(els.rWhyTexts, function (el, i) {
          var txt = whyTexts[i];
          if (txt) el.textContent = txt;
        });
      }
      if (els.cta) els.cta.setAttribute('href', buildCtaUrl(result.bundle));
      renderPrice(result.bundle);
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

    if (els.startBtns) Array.prototype.forEach.call(els.startBtns, function (b) { b.addEventListener('click', startQuiz); });
    if (els.continueBtn) els.continueBtn.addEventListener('click', next);
    if (els.restart) els.restart.addEventListener('click', function (e) { e.preventDefault(); restart(); });
    if (els.ctaRestart) els.ctaRestart.addEventListener('click', function (e) { e.preventDefault(); restart(); });
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
