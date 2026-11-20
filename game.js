/* Danis mini-game: a little chef runs through the bakery street and jumps under pastry boxes to order them.
 * Every hit adds the pastry to the shared cart (window.Danis), and the shop door at the end opens the checkout.
 * All art is drawn with shapes, so there are no image files and nothing copied from another game. */
(function () {
  'use strict';
  var D = window.Danis;
  var canvas = document.getElementById('canvas'), ctx = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;
  var GROUND = 300, WORLD = 3500;
  var HINT = { fr: 'Saute sous une boîte !', en: 'Jump under a box!' };
  var DOOR = { fr: 'Entrez pour commander →', en: 'Walk in to order →' };

  // Boxes in a row, one per pastry, spaced so each needs its own run and jump.
  var boxes = [];
  function buildBoxes() {
    boxes.length = 0;
    D.products.forEach(function (p, i) { boxes.push({ p: p, x: 330 + i * 345, y: GROUND - 171, w: 50, h: 46, bump: 0, cool: 0, count: 0 }); });
    WORLD = 330 + D.products.length * 345 + 410;
  }
  buildBoxes();
  var player, keys, popups, camX, running = false, last = 0, hinted = true, doorOpened = false, raf = 0;

  function reset() {
    player = { x: 80, y: GROUND - 44, w: 30, h: 44, vx: 0, vy: 0, ground: true, face: 1, step: 0 };
    keys = { left: false, right: false, jump: false };
    popups = []; camX = 0; hinted = false; doorOpened = false;
  }
  reset();

  /* ---------- input ---------- */
  var MAP = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'jump', w: 'jump', W: 'jump', ' ': 'jump' };
  window.addEventListener('keydown', function (e) {
    if (!running || !MAP[e.key]) { return; }
    keys[MAP[e.key]] = true; e.preventDefault();
  });
  window.addEventListener('keyup', function (e) { if (MAP[e.key]) { keys[MAP[e.key]] = false; } });
  document.querySelectorAll('#pad button').forEach(function (b) {
    var k = b.getAttribute('data-key');
    function down(e) { e.preventDefault(); keys[k] = true; b.classList.add('down'); try { b.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ } }
    function up() { keys[k] = false; b.classList.remove('down'); }
    b.addEventListener('pointerdown', down);
    b.addEventListener('pointerup', up);
    b.addEventListener('pointercancel', up);
    b.addEventListener('lostpointercapture', up);
    b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  });

  /* ---------- update ---------- */
  function update(dt) {
    var p = player, SPEED = 240, GRAV = 1800, JUMP = -640;
    var dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    p.vx = dir * SPEED;
    if (dir) { p.face = dir; p.step += dt * 12; } else { p.step = 0; }
    // A jump needs a fresh press: holding the button down must not keep re-ordering the same box.
    if (keys.jump && !p.jumpHeld && p.ground) { p.vy = JUMP; p.ground = false; }
    p.jumpHeld = keys.jump;
    p.vy += GRAV * dt;
    var prevTop = p.y;
    p.x = Math.max(0, Math.min(WORLD - p.w, p.x + p.vx * dt));
    p.y += p.vy * dt;
    if (p.y >= GROUND - p.h) { p.y = GROUND - p.h; p.vy = 0; p.ground = true; }

    boxes.forEach(function (b) {
      b.bump = Math.max(0, b.bump - dt); b.cool = Math.max(0, b.cool - dt);
      var overlapX = p.x + p.w > b.x + 6 && p.x < b.x + b.w - 6;
      var bottom = b.y + b.h;
      if (overlapX && p.vy < 0 && prevTop >= bottom - 2 && p.y < bottom) {
        p.y = bottom; p.vy = 160;                       // bump the head and drop back down
        if (b.cool === 0) { hit(b); }
      }
    });

    // The shop door at the end of the street opens the checkout once.
    var atDoor = p.x > WORLD - 190;
    if (atDoor && !doorOpened) { doorOpened = true; D.openCart(); }
    if (!atDoor) { doorOpened = false; }

    popups.forEach(function (q) { q.life -= dt; q.y -= 50 * dt; });
    popups = popups.filter(function (q) { return q.life > 0; });
    camX = Math.max(0, Math.min(WORLD - W, p.x - 260));
  }

  function hit(b) {
    b.cool = 0.3; b.bump = 0.18; b.count++; hinted = true;
    D.add(b.p.id);
    popups.push({ x: b.x + b.w / 2, y: b.y - 8, text: b.p.emoji + ' +1', life: 0.9 });
  }

  /* ---------- drawing ---------- */
  function rr(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function pill(text, cx, y, size) {
    ctx.font = '700 ' + size + 'px system-ui,sans-serif'; ctx.textAlign = 'center';
    var w = ctx.measureText(text).width + 14;
    ctx.fillStyle = 'rgba(255,255,255,.92)'; rr(cx - w / 2, y - size, w, size + 8, 8); ctx.fill();
    ctx.fillStyle = '#3f1d66'; ctx.fillText(text, cx, y);
  }

  /* ---------- Dakar backdrop: original, simplified drawings of local landmarks, in parallax layers ---------- */
  var HZ = 236; // sea horizon
  function layer(par, cycle, fn) {
    var off = (camX * par) % cycle;
    for (var k = -1; k * cycle - off < W + 60; k++) { fn(k * cycle - off); }
  }
  function dome(x, y, r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, Math.PI, 0); ctx.fill(); }
  function minaret(x, base, h, w, body, cap) {
    ctx.fillStyle = body; ctx.fillRect(x - w / 2, base - h, w, h);
    ctx.fillStyle = cap; ctx.beginPath(); ctx.moveTo(x - w / 2 - 2, base - h); ctx.lineTo(x, base - h - w * 1.6); ctx.lineTo(x + w / 2 + 2, base - h); ctx.fill();
    ctx.fillStyle = body; ctx.fillRect(x - w / 2 - 2, base - h * 0.62, w + 4, 3);
  }
  function baobab(x, b, s) {
    ctx.fillStyle = '#8a6a4b';
    ctx.beginPath(); ctx.moveTo(x - 16 * s, b); ctx.quadraticCurveTo(x - 7 * s, b - 34 * s, x - 9 * s, b - 52 * s);
    ctx.lineTo(x + 9 * s, b - 52 * s); ctx.quadraticCurveTo(x + 7 * s, b - 34 * s, x + 16 * s, b); ctx.fill();
    ctx.strokeStyle = '#8a6a4b'; ctx.lineWidth = 4 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - 6 * s, b - 50 * s); ctx.lineTo(x - 22 * s, b - 66 * s); ctx.moveTo(x + 6 * s, b - 50 * s); ctx.lineTo(x + 22 * s, b - 68 * s); ctx.moveTo(x, b - 52 * s); ctx.lineTo(x, b - 72 * s); ctx.stroke();
    ctx.fillStyle = '#5f9f5f';
    [[-24, -70, 13], [-8, -78, 15], [10, -76, 14], [24, -70, 12], [0, -66, 12]].forEach(function (c) { ctx.beginPath(); ctx.arc(x + c[0] * s, b + c[1] * s, c[2] * s, 0, 6.3); ctx.fill(); });
  }
  function palm(x, b, s) {
    ctx.strokeStyle = '#9a7650'; ctx.lineWidth = 5 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, b); ctx.quadraticCurveTo(x + 10 * s, b - 45 * s, x + 4 * s, b - 86 * s); ctx.stroke();
    ctx.strokeStyle = '#4f9a5a'; ctx.lineWidth = 4 * s;
    [-70, -35, 0, 35, 70].forEach(function (a) {
      var r = a * Math.PI / 180; ctx.beginPath(); ctx.moveTo(x + 4 * s, b - 86 * s);
      ctx.quadraticCurveTo(x + 4 * s + Math.sin(r) * 22 * s, b - 86 * s - 22 * s + Math.abs(a) * 0.15 * s, x + 4 * s + Math.sin(r) * 40 * s, b - 86 * s - 4 * s + Math.abs(a) * 0.35 * s); ctx.stroke();
    });
  }
  function pirogue(x, y, col, band) {
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - 26, y - 8); ctx.quadraticCurveTo(x, y + 6, x + 26, y - 8); ctx.lineTo(x + 22, y - 3); ctx.quadraticCurveTo(x, y + 8, x - 22, y - 3); ctx.fill();
    ctx.fillStyle = band; ctx.fillRect(x - 17, y - 5, 34, 2.5);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x - 2, y - 7); ctx.lineTo(x - 2, y - 26); ctx.lineTo(x + 12, y - 7); ctx.fill();
  }
  function goree(x) { // Goree island: low ochre island with red-roofed houses
    ctx.fillStyle = '#c99a6b'; ctx.beginPath(); ctx.ellipse(x, HZ, 90, 16, 0, Math.PI, 0); ctx.fill();
    [[-55, 14], [-34, 18], [-10, 22], [14, 16], [36, 20], [58, 12]].forEach(function (h) {
      ctx.fillStyle = '#f2d7b3'; ctx.fillRect(x + h[0], HZ - h[1], 16, h[1]);
      ctx.fillStyle = '#c4533a'; ctx.beginPath(); ctx.moveTo(x + h[0] - 2, HZ - h[1]); ctx.lineTo(x + h[0] + 8, HZ - h[1] - 7); ctx.lineTo(x + h[0] + 18, HZ - h[1]); ctx.fill();
    });
  }
  function mamelles(x) { // Les Mamelles: two hills, the lighthouse on one and the African Renaissance Monument on the other
    ctx.fillStyle = '#9cc79a'; ctx.beginPath(); ctx.arc(x - 70, HZ + 30, 70, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#8bbb8b'; ctx.beginPath(); ctx.arc(x + 60, HZ + 36, 78, Math.PI, 0); ctx.fill();
    var lx = x - 70, ly = HZ - 40; // lighthouse (left hill)
    ctx.fillStyle = '#fff'; ctx.fillRect(lx - 5, ly - 38, 10, 38);
    ctx.fillStyle = '#3f1d66'; ctx.fillRect(lx - 5, ly - 24, 10, 6);
    ctx.fillStyle = '#592b89'; ctx.fillRect(lx - 7, ly - 44, 14, 6);
    ctx.fillStyle = '#f2b24a'; ctx.beginPath(); ctx.arc(lx, ly - 47, 4, 0, 6.3); ctx.fill();
    var mx = x + 60, my = HZ - 42; // African Renaissance Monument (right hill): tall bronze figure group
    ctx.save(); ctx.translate(mx, my); ctx.scale(1.45, 1.45); ctx.translate(-mx, -my);
    ctx.fillStyle = '#a8764a';
    ctx.beginPath(); ctx.moveTo(mx - 10, my); ctx.lineTo(mx - 5, my - 52); ctx.lineTo(mx + 5, my - 52); ctx.lineTo(mx + 10, my); ctx.fill();
    ctx.beginPath(); ctx.arc(mx, my - 58, 5, 0, 6.3); ctx.fill();
    ctx.strokeStyle = '#a8764a'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(mx + 3, my - 46); ctx.lineTo(mx + 26, my - 62); ctx.stroke();
    ctx.beginPath(); ctx.arc(mx + 14, my - 50, 3.5, 0, 6.3); ctx.fill();
    ctx.beginPath(); ctx.moveTo(mx - 14, my - 14); ctx.lineTo(mx - 26, my - 30); ctx.lineTo(mx - 8, my - 24); ctx.fill();
    ctx.restore();
  }
  function mosque(x, b) { // Mosquee de la Divinite (Ouakam): white mosque with two minarets on the shore
    ctx.fillStyle = '#f7f2ea'; ctx.fillRect(x - 42, b - 38, 84, 38);
    dome(x, b - 38, 24, '#e8f3f2'); ctx.fillStyle = '#40bdbd'; ctx.fillRect(x - 1.5, b - 70, 3, 10);
    minaret(x - 54, b, 78, 11, '#f7f2ea', '#40bdbd'); minaret(x + 54, b, 78, 11, '#f7f2ea', '#40bdbd');
    ctx.fillStyle = '#40bdbd';
    for (var i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(x + i * 14, b - 12, 5, Math.PI, 0); ctx.fill(); ctx.fillRect(x + i * 14 - 5, b - 12, 10, 12); }
  }

  function drawBackground() {
    var g = ctx.createLinearGradient(0, 0, 0, HZ);
    g.addColorStop(0, '#8fd8e4'); g.addColorStop(0.7, '#d9f1f1'); g.addColorStop(1, '#fff3dc');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    var sx = 640 - (camX * 0.03) % 900, sg = ctx.createRadialGradient(sx, 70, 6, sx, 70, 80); // sun with halo
    sg.addColorStop(0, 'rgba(255,225,130,1)'); sg.addColorStop(0.3, 'rgba(255,225,130,.9)'); sg.addColorStop(1, 'rgba(255,225,130,0)');
    ctx.fillStyle = sg; ctx.fillRect(sx - 90, 0, 180, 160);
    ctx.fillStyle = 'rgba(255,255,255,.85)'; // clouds
    for (var c = -1; c < 6; c++) {
      var cx = c * 300 - (camX * 0.1) % 300 + 60, cy = 44 + (c % 2) * 36;
      ctx.beginPath(); ctx.arc(cx, cy, 18, 0, 6.3); ctx.arc(cx + 22, cy + 4, 24, 0, 6.3); ctx.arc(cx + 48, cy, 16, 0, 6.3); ctx.fill();
    }
    var sea = ctx.createLinearGradient(0, HZ, 0, GROUND); sea.addColorStop(0, '#7fd3d6'); sea.addColorStop(1, '#40bdbd');
    ctx.fillStyle = sea; ctx.fillRect(0, HZ, W, GROUND - HZ + 2);
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    layer(0.3, 160, function (x0) { for (var i = 0; i < 3; i++) { ctx.fillRect(x0 + 20 + i * 50, HZ + 14 + i * 10, 22, 2); } });
    ctx.globalAlpha = 0.85; // far layer, slightly hazy: Goree and the Mamelles hills
    layer(0.18, 1500, function (x0) { goree(x0 + 260); mamelles(x0 + 980); });
    ctx.globalAlpha = 1;
    layer(0.35, 900, function (x0) { pirogue(x0 + 140, HZ + 30, '#f2b24a', '#592b89'); pirogue(x0 + 520, HZ + 44, '#e8f3f2', '#c4533a'); pirogue(x0 + 760, HZ + 26, '#c4533a', '#fff'); });
    layer(0.55, 1400, function (x0) { mosque(x0 + 640, GROUND); baobab(x0 + 1010, GROUND, 1.05); palm(x0 + 1170, GROUND, 1); baobab(x0 + 1330, GROUND, 0.85); });
  }

  function drawGround() {
    ctx.fillStyle = '#e9b88a'; ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.fillStyle = '#40bdbd'; ctx.fillRect(0, GROUND, W, 12);
    ctx.fillStyle = '#d19e6c';
    for (var x = -((camX) % 60); x < W; x += 60) { ctx.fillRect(x, GROUND + 28, 30, 6); ctx.fillRect(x + 30, GROUND + 46, 22, 6); }
  }

  function drawBox(b) {
    var x = b.x - camX, y = b.y - (b.bump > 0 ? Math.sin(b.bump / 0.18 * Math.PI) * 10 : 0);
    if (x > W + 60 || x < -120) { return; }
    ctx.fillStyle = '#c98a55'; rr(x, y, b.w, b.h, 6); ctx.fill();
    ctx.fillStyle = '#e8b887'; rr(x + 3, y + 3, b.w - 6, b.h - 6, 5); ctx.fill();
    ctx.strokeStyle = '#a56a3a'; ctx.lineWidth = 2; rr(x, y, b.w, b.h, 6); ctx.stroke();
    ctx.font = '26px serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#000';
    ctx.fillText(b.p.emoji, x + b.w / 2, y + b.h / 2 + 9);
    pill(D.pname(b.p) + ' · ' + b.p.price, x + b.w / 2, y - 12, 12);
    if (b.count) { ctx.fillStyle = '#592b89'; ctx.beginPath(); ctx.arc(x + b.w - 2, y + 2, 11, 0, 6.3); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '700 12px system-ui'; ctx.fillText(b.count, x + b.w - 2, y + 6); }
  }

  function drawShop() {
    var x = WORLD - 190 - camX;
    if (x > W + 20) { return; }
    ctx.fillStyle = '#fbe2c8'; ctx.fillRect(x - 10, GROUND - 170, 200, 170);
    ctx.fillStyle = '#592b89'; ctx.fillRect(x - 20, GROUND - 190, 220, 30);
    for (var i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#fff' : '#592b89'; ctx.fillRect(x - 20 + i * 36.6, GROUND - 160, 36.6, 14); }
    ctx.fillStyle = '#fff'; ctx.font = '800 22px system-ui'; ctx.textAlign = 'center'; ctx.fillText('DANIS', x + 90, GROUND - 168);
    ctx.fillStyle = '#7a4a2c'; rr(x + 60, GROUND - 90, 60, 90, 6); ctx.fill();
    ctx.fillStyle = '#f2b24a'; ctx.beginPath(); ctx.arc(x + 108, GROUND - 45, 4, 0, 6.3); ctx.fill();
    pill(DOOR[document.documentElement.lang] || DOOR.fr, x + 90, GROUND - 205, 13);
  }

  function drawChef() {
    var p = player, x = p.x - camX, y = p.y, f = p.face;
    var swing = Math.sin(player.step) * 6, air = !p.ground;
    ctx.save(); ctx.translate(x + p.w / 2, y);
    // legs
    ctx.fillStyle = '#2a1840';
    ctx.fillRect(-9, 34, 7, 10 + (air ? -3 : swing * 0.5)); ctx.fillRect(2, 34, 7, 10 + (air ? -3 : -swing * 0.5));
    // apron body
    ctx.fillStyle = '#592b89'; rr(-13, 16, 26, 22, 6); ctx.fill();
    ctx.fillStyle = '#fff'; rr(-8, 22, 16, 14, 4); ctx.fill();
    // arms
    ctx.fillStyle = '#f5c9a0'; ctx.fillRect(-17, 20 + (air ? -6 : 0), 5, 12); ctx.fillRect(12, 20 + (air ? -6 : 0), 5, 12);
    // head
    ctx.beginPath(); ctx.arc(0, 11, 11, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#2a1840'; ctx.beginPath(); ctx.arc(f * 4, 10, 1.8, 0, 6.3); ctx.arc(f * 4 + 1, 10, 0, 0, 6.3); ctx.fill();
    ctx.fillRect(f * 2 - 2, 15, 6, 1.5);
    // hat
    ctx.fillStyle = '#fff'; rr(-11, 0, 22, 6, 3); ctx.fill(); ctx.beginPath(); ctx.arc(-6, -2, 7, 0, 6.3); ctx.arc(6, -2, 7, 0, 6.3); ctx.arc(0, -6, 8, 0, 6.3); ctx.fill();
    ctx.restore();
  }

  function draw() {
    drawBackground(); drawGround(); drawShop(); boxes.forEach(drawBox); drawChef();
    popups.forEach(function (q) {
      ctx.globalAlpha = Math.min(1, q.life * 2); ctx.font = '700 20px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#3f1d66';
      ctx.fillText(q.text, q.x - camX, q.y); ctx.globalAlpha = 1;
    });
    if (!hinted) { pill(HINT[document.documentElement.lang] || HINT.fr, boxes[0].x - camX + 25, boxes[0].y - 46, 15); }
  }

  /* ---------- loop and hooks ---------- */
  function frame(now) {
    if (!running) { return; }
    var dt = Math.min(0.033, (now - last) / 1000); last = now;
    update(dt); draw();
    raf = requestAnimationFrame(frame);
  }
  function start() { if (running) { return; } running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); keys.left = keys.right = keys.jump = false; }

  function hud() {
    document.getElementById('hud-items').textContent = D.count();
    document.getElementById('hud-total').textContent = D.money(D.subtotal());
  }

  D.onProducts(function () { buildBoxes(); reset(); });
  D.onChange(function (face) {
    if (face === 'game') { start(); } else if (face === 'shop') { stop(); }
    hud();
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { stop(); } else if (!document.getElementById('game').hidden) { start(); }
  });
  hud();
  draw();
  if (!document.getElementById('game').hidden) { start(); }

  // Exposed for the quick self-test in the browser console.
  window.DanisGame = {
    player: function () { return player; }, boxes: boxes, hit: hit, keys: function () { return keys; },
    step: function (dt) { update(dt); draw(); }
  };
})();
