/* Danis prototype: shop face, shared cart, checkout and language. The game (game.js) uses the same cart through
 * window.Danis, so an order made by playing and one made from the catalog are identical.
 * STUB spots: saving the order and notifying the shop. In production the server stores the order, messages the
 * owner (email and WhatsApp) and creates the Wave / Orange Money / card payment link. */
(function () {
  'use strict';

  var CONFIG = { deliveryFee: 1000, shopContact: 'shop@danis.example' };

  // Placeholder catalog: names, prices (FCFA) and colours to be replaced with the shop's own.
  var PRODUCTS = [
    { id: 'croissant', emoji: '🥐', color: '#fde7c2', price: 700,   fr: 'Croissant',          en: 'Croissant',        dfr: 'Pur beurre, feuilleté et doré.',          den: 'Butter, flaky and golden.' },
    { id: 'beignet',   emoji: '🍩', color: '#fdd9e2', price: 600,   fr: 'Beignet glacé',      en: 'Glazed doughnut',  dfr: 'Moelleux, glaçage au choix.',             den: 'Soft, glaze of your choice.' },
    { id: 'cupcake',   emoji: '🧁', color: '#e9defa', price: 1500,  fr: 'Cupcake',            en: 'Cupcake',          dfr: 'Vanille ou chocolat, crème légère.',      den: 'Vanilla or chocolate, light cream.' },
    { id: 'part',      emoji: '🍰', color: '#ffe0d6', price: 2500,  fr: 'Part de gâteau',     en: 'Slice of cake',    dfr: 'Fraise, chocolat ou citron.',             den: 'Strawberry, chocolate or lemon.' },
    { id: 'cookie',    emoji: '🍪', color: '#f3e0c8', price: 500,   fr: 'Cookie',             en: 'Cookie',           dfr: 'Pépites de chocolat, cœur tendre.',       den: 'Chocolate chips, soft centre.' },
    { id: 'tarte',     emoji: '🥧', color: '#fbe8b8', price: 3000,  fr: 'Tarte aux fruits',   en: 'Fruit tart',       dfr: 'Fruits de saison sur crème pâtissière.',  den: 'Seasonal fruit on custard.' },
    { id: 'flan',      emoji: '🍮', color: '#fff0c4', price: 1200,  fr: 'Flan pâtissier',     en: 'Custard flan',     dfr: 'Crème vanille sur pâte croustillante.',   den: 'Vanilla custard on crisp pastry.' },
    { id: 'gateau',    emoji: '🎂', color: '#fcd5e5', price: 15000, fr: "Gâteau d'anniversaire", en: 'Birthday cake', dfr: 'Sur commande, 8 à 10 parts.',             den: 'Made to order, 8 to 10 slices.' }
  ];

  var TEXT = {
    fr: {
      face_shop: 'Boutique', face_game: 'Jeu 🎮',
      hero_eyebrow: 'Pâtisserie artisanale · Sénégal',
      hero_title: 'Des douceurs faites maison, pour toutes vos occasions.',
      hero_lead: 'Viennoiseries, gâteaux et tartes préparés chaque jour. Commandez en ligne, ou prenez les commandes en main avec notre mini-jeu.',
      cta_order: 'Commander', cta_play: 'Commander en jouant 🎮',
      cat_title: 'Notre catalogue', cat_sub: 'Prix en FCFA. Photos et prix à remplacer par les vôtres.',
      add: 'Ajouter', ph_photo: 'Photo à venir',
      cook_title: 'La pâtissière', cook_sub: 'Textes à remplacer par le vrai parcours.',
      cook_story: "Passionnée de pâtisserie depuis l'enfance, Dani prépare chaque recette avec des ingrédients choisis avec soin et un savoir-faire transmis en famille.",
      cred_train_t: 'Formation', cred_train_d: 'Diplôme de pâtisserie (établissement et année à indiquer)',
      cred_exp_t: 'Expérience', cred_exp_d: 'X années en boulangerie-pâtisserie, hôtels et événements',
      cred_cert_t: 'Certifications', cred_cert_d: 'Hygiène et sécurité alimentaire (à confirmer)',
      cred_spec_t: 'Spécialités', cred_spec_d: "Gâteaux d'anniversaire, mariages, viennoiseries",
      ct_title: 'Contact et horaires', ct_addr: 'Adresse de la pâtisserie, Dakar, Sénégal', ct_hours: 'Lundi–samedi 8h–19h, dimanche 8h–13h',
      game_help: 'Courez et sautez sous les boîtes pour les ouvrir : chaque coup ajoute une pâtisserie à votre commande.',
      hud_items: 'articles', game_order: 'Voir ma commande', btn_jump: 'SAUT',
      game_keys: 'Clavier : flèches ou A/D pour bouger, espace pour sauter.', game_back: '← Retour à la boutique',
      cart_title: 'Ma commande', cart_empty: 'Votre panier est vide.',
      f_name: 'Nom', f_phone: 'Téléphone (WhatsApp)', f_addr: 'Adresse de livraison', f_date: 'Pour quand ?', f_note: 'Message (facultatif)',
      mode_pickup: 'Retrait en boutique', mode_delivery: 'Livraison',
      pay_title: 'Paiement', pay_card: 'Carte bancaire', pay_cash: 'Espèces',
      hint_online: function (a) { return 'Après validation par la pâtisserie, vous recevez un lien de paiement de ' + a + '.'; },
      hint_cash: 'Vous payez en espèces au retrait ou à la livraison.',
      t_sub: 'Sous-total', t_delivery: 'Livraison', t_total: 'Total', free: 'Offert',
      cta_send: 'Envoyer ma commande',
      err_empty: 'Votre panier est vide.', err_name: 'Indiquez votre nom.', err_phone: 'Indiquez un numéro de téléphone valide.',
      err_addr: 'Indiquez l\'adresse de livraison.',
      done_title: 'Commande envoyée ✔',
      done_text: function (ref) { return 'Référence ' + ref + '. La pâtisserie confirme votre commande par WhatsApp.'; },
      done_msg: 'Message reçu par la pâtisserie (aperçu du prototype)', done_close: 'Fermer',
      foot_proto: 'Prototype',
      payName: { wave: 'Wave', om: 'Orange Money', card: 'Carte bancaire', cash: 'Espèces' },
      modeName: { pickup: 'Retrait en boutique', delivery: 'Livraison' },
      plus1: '+1'
    },
    en: {
      face_shop: 'Shop', face_game: 'Game 🎮',
      hero_eyebrow: 'Handmade pastry · Senegal',
      hero_title: 'Homemade treats for every occasion.',
      hero_lead: 'Pastries, cakes and tarts baked every day. Order online, or take the orders into your own hands with our mini-game.',
      cta_order: 'Order', cta_play: 'Order by playing 🎮',
      cat_title: 'Our catalogue', cat_sub: 'Prices in FCFA. Photos and prices to be replaced with yours.',
      add: 'Add', ph_photo: 'Photo coming soon',
      cook_title: 'The pastry chef', cook_sub: 'Texts to be replaced with the real background.',
      cook_story: 'Passionate about pastry since childhood, Dani makes every recipe with carefully chosen ingredients and know-how handed down in the family.',
      cred_train_t: 'Training', cred_train_d: 'Pastry diploma (school and year to add)',
      cred_exp_t: 'Experience', cred_exp_d: 'X years in bakery and pastry, hotels and events',
      cred_cert_t: 'Certifications', cred_cert_d: 'Food hygiene and safety (to be confirmed)',
      cred_spec_t: 'Specialities', cred_spec_d: 'Birthday cakes, weddings, viennoiseries',
      ct_title: 'Contact and opening hours', ct_addr: 'Pastry shop address, Dakar, Senegal', ct_hours: 'Monday–Saturday 8am–7pm, Sunday 8am–1pm',
      game_help: 'Run and jump under the boxes to open them: every hit adds a pastry to your order.',
      hud_items: 'items', game_order: 'See my order', btn_jump: 'JUMP',
      game_keys: 'Keyboard: arrow keys or A/D to move, space to jump.', game_back: '← Back to the shop',
      cart_title: 'My order', cart_empty: 'Your basket is empty.',
      f_name: 'Name', f_phone: 'Phone (WhatsApp)', f_addr: 'Delivery address', f_date: 'For when?', f_note: 'Message (optional)',
      mode_pickup: 'Pick up in shop', mode_delivery: 'Delivery',
      pay_title: 'Payment', pay_card: 'Bank card', pay_cash: 'Cash',
      hint_online: function (a) { return 'Once the shop approves, you receive a payment link for ' + a + '.'; },
      hint_cash: 'You pay in cash at pickup or on delivery.',
      t_sub: 'Subtotal', t_delivery: 'Delivery', t_total: 'Total', free: 'Free',
      cta_send: 'Send my order',
      err_empty: 'Your basket is empty.', err_name: 'Enter your name.', err_phone: 'Enter a valid phone number.',
      err_addr: 'Enter the delivery address.',
      done_title: 'Order sent ✔',
      done_text: function (ref) { return 'Reference ' + ref + '. The shop confirms your order by WhatsApp.'; },
      done_msg: 'Message received by the shop (prototype preview)', done_close: 'Close',
      foot_proto: 'Prototype',
      payName: { wave: 'Wave', om: 'Orange Money', card: 'Bank card', cash: 'Cash' },
      modeName: { pickup: 'Pick up in shop', delivery: 'Delivery' },
      plus1: '+1'
    }
  };

  var $ = function (id) { return document.getElementById(id); };
  var lang = 'fr';
  try { lang = localStorage.getItem('danis.lang') || 'fr'; } catch (e) { /* storage blocked */ }
  var t = function (k) { return TEXT[lang][k]; };
  var cart = {};
  try { cart = JSON.parse(localStorage.getItem('danis.cart') || '{}'); } catch (e) { cart = {}; }
  var listeners = [];

  function money(n) { return n.toLocaleString('fr-FR').replace(/ | /g, ' ') + ' FCFA'; }
  function product(id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; }
  function pname(p) { return lang === 'fr' ? p.fr : p.en; }

  /* ---------- cart ---------- */
  function persist() { try { localStorage.setItem('danis.cart', JSON.stringify(cart)); } catch (e) { /* ignore */ } }
  function count() { return Object.keys(cart).reduce(function (n, id) { return n + cart[id]; }, 0); }
  function subtotal() { return Object.keys(cart).reduce(function (s, id) { return s + cart[id] * product(id).price; }, 0); }
  function change(id, delta) {
    var q = (cart[id] || 0) + delta;
    if (q <= 0) { delete cart[id]; } else { cart[id] = Math.min(q, 99); }
    persist(); renderCart(); listeners.forEach(function (fn) { fn(); });
  }

  function renderCart() {
    $('cart-count').textContent = count();
    var ids = Object.keys(cart), ul = $('lines');
    ul.innerHTML = '';
    ids.forEach(function (id) {
      var p = product(id), li = document.createElement('li');
      li.innerHTML = '<span class="e">' + p.emoji + '</span><span class="n">' + pname(p) + '<small>' + money(p.price) + '</small></span>' +
        '<span class="qty"><button type="button" aria-label="-">−</button><b>' + cart[id] + '</b><button type="button" aria-label="+">+</button></span>';
      var b = li.querySelectorAll('button');
      b[0].addEventListener('click', function () { change(id, -1); });
      b[1].addEventListener('click', function () { change(id, 1); });
      ul.appendChild(li);
    });
    $('cart-empty').hidden = ids.length > 0 || !$('done').hidden;
    $('checkout').hidden = ids.length === 0;
    renderTotals();
  }

  function deliveryFee() { return document.querySelector('input[name="mode"]:checked').value === 'delivery' ? CONFIG.deliveryFee : 0; }
  function renderTotals() {
    var sub = subtotal(), del = count() ? deliveryFee() : 0;
    $('t-sub').textContent = money(sub);
    $('t-del').textContent = del ? money(del) : (count() ? t('free') : '—');
    $('t-total').textContent = money(sub + del);
    var pay = document.querySelector('input[name="pay"]:checked').value;
    $('pay-hint').textContent = pay === 'cash' ? t('hint_cash') : t('hint_online')(money(sub + del));
  }

  /* ---------- drawer ---------- */
  function openCart() {
    $('done').hidden = true;
    $('drawer').classList.add('open'); $('drawer').setAttribute('aria-hidden', 'false'); $('scrim').hidden = false;
    renderCart();
  }
  function closeCart() {
    $('drawer').classList.remove('open'); $('drawer').setAttribute('aria-hidden', 'true'); $('scrim').hidden = true;
  }

  /* ---------- checkout ---------- */
  function fail(msg) { var e = $('error'); e.textContent = msg; e.hidden = false; }
  function submit(ev) {
    ev.preventDefault();
    $('error').hidden = true;
    var name = $('name').value.trim(), phone = $('phone').value.trim();
    var mode = document.querySelector('input[name="mode"]:checked').value;
    if (!count()) { return fail(t('err_empty')); }
    if (!name) { return fail(t('err_name')); }
    if (phone.replace(/\D/g, '').length < 8) { return fail(t('err_phone')); }
    if (mode === 'delivery' && !$('addr').value.trim()) { return fail(t('err_addr')); }

    var sub = subtotal(), del = deliveryFee();
    var order = {
      id: 'DN-' + Date.now().toString(36).toUpperCase().slice(-6), name: name, phone: phone, mode: mode,
      addr: $('addr').value.trim(), when: $('when').value, note: $('note').value.trim(),
      pay: document.querySelector('input[name="pay"]:checked').value, items: JSON.parse(JSON.stringify(cart)),
      subtotal: sub, delivery: del, total: sub + del, status: 'pending', created: new Date().toISOString()
    };

    // STUB: store the order and notify the shop (see the note at the top of this file).
    try {
      var all = JSON.parse(localStorage.getItem('danis.orders') || '[]'); all.push(order);
      localStorage.setItem('danis.orders', JSON.stringify(all));
    } catch (e) { /* ignore */ }

    var lines = Object.keys(order.items).map(function (id) { var p = product(id); return ' - ' + order.items[id] + ' x ' + p.fr + ' (' + money(p.price) + ')'; });
    $('done-msg').textContent = 'To: ' + CONFIG.shopContact + '\nNew order ' + order.id + '\n\n' + lines.join('\n') + '\n\nTotal: ' + money(order.total) +
      '\n' + TEXT.fr.modeName[mode] + (order.addr ? ': ' + order.addr : '') + (order.when ? '\nFor: ' + order.when : '') +
      '\nClient: ' + name + ' ' + phone + '\nPayment: ' + TEXT.fr.payName[order.pay] + (order.note ? '\nMessage: ' + order.note : '') +
      '\n\n[Confirm]  [Refuse]   (links in the real version)';
    $('done-text').textContent = t('done_text')(order.id);
    cart = {}; persist(); listeners.forEach(function (fn) { fn(); });
    $('checkout').hidden = true; $('lines').innerHTML = ''; $('cart-empty').hidden = true; $('done').hidden = false;
    $('cart-count').textContent = '0'; $('checkout').reset();
  }

  /* ---------- catalog and text ---------- */
  function renderGrid() {
    var g = $('grid'); g.innerHTML = '';
    PRODUCTS.forEach(function (p) {
      var el = document.createElement('article'); el.className = 'item';
      el.innerHTML = '<div class="pic" style="background:' + p.color + '">' + p.emoji + '</div><div class="body"><h3>' + pname(p) + '</h3><p>' +
        (lang === 'fr' ? p.dfr : p.den) + '</p><div class="row"><span class="price">' + money(p.price) + '</span><button class="add" type="button">+ ' + t('add') + '</button></div></div>';
      el.querySelector('.add').addEventListener('click', function () { change(p.id, 1); });
      g.appendChild(el);
    });
  }

  function applyText() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n'));
      if (typeof v === 'string') { el.textContent = v; }
    });
    $('lang').textContent = lang === 'fr' ? 'EN' : 'FR';
    $('year').textContent = new Date().getFullYear();
    renderGrid(); renderCart();
  }

  /* ---------- faces ---------- */
  function showFace(face) {
    $('shop').hidden = face !== 'shop'; $('game').hidden = face !== 'game';
    $('tab-shop').classList.toggle('on', face === 'shop'); $('tab-game').classList.toggle('on', face === 'game');
    $('tab-shop').setAttribute('aria-selected', face === 'shop'); $('tab-game').setAttribute('aria-selected', face === 'game');
    window.scrollTo(0, 0);
    try { history.replaceState(null, '', face === 'game' ? '#game' : '#'); } catch (e) { /* ignore */ }
    listeners.forEach(function (fn) { fn(face); });
  }

  /* ---------- wiring ---------- */
  $('lang').addEventListener('click', function () {
    lang = lang === 'fr' ? 'en' : 'fr';
    try { localStorage.setItem('danis.lang', lang); } catch (e) { /* ignore */ }
    applyText(); listeners.forEach(function (fn) { fn(); });
  });
  document.querySelectorAll('.face').forEach(function (b) { b.addEventListener('click', function () { showFace(b.getAttribute('data-face')); }); });
  document.querySelectorAll('[data-go-game]').forEach(function (b) { b.addEventListener('click', function () { showFace('game'); }); });
  document.querySelectorAll('[data-go-shop]').forEach(function (b) { b.addEventListener('click', function () { showFace('shop'); }); });
  $('logo').addEventListener('click', function (e) { e.preventDefault(); showFace('shop'); });
  $('open-cart').addEventListener('click', openCart);
  $('game-order').addEventListener('click', openCart);
  $('close-cart').addEventListener('click', closeCart);
  $('scrim').addEventListener('click', closeCart);
  $('done-close').addEventListener('click', closeCart);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeCart(); } });
  document.querySelectorAll('input[name="mode"]').forEach(function (r) {
    r.addEventListener('change', function () { $('addr-field').hidden = r.value !== 'delivery' || !r.checked; renderTotals(); });
  });
  document.querySelectorAll('input[name="pay"]').forEach(function (r) { r.addEventListener('change', renderTotals); });
  $('when').min = new Date().toISOString().slice(0, 10);
  $('checkout').addEventListener('submit', submit);

  window.Danis = {
    products: PRODUCTS, add: function (id) { change(id, 1); }, count: count, subtotal: subtotal, money: money,
    openCart: openCart, text: t, pname: pname, onChange: function (fn) { listeners.push(fn); }
  };

  applyText();
  if (location.hash === '#game') { showFace('game'); }
})();
