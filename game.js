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
  var boxes = D.products.map(function (p, i) {
    return { p: p, x: 330 + i * 345, y: GROUND - 171, w: 50, h: 46, bump: 0, cool: 0, count: 0 };
  });
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
    ctx.fillStyle = '#5a3322'; ctx.fillText(text, cx, y);
  }

  function drawBackground() {
    var g = ctx.createLinearGradient(0, 0, 0, GROUND);
    g.addColorStop(0, '#9fdcff'); g.addColorStop(1, '#fff1e0');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // hills (slow) and clouds (slower)
    ctx.fillStyle = '#ffd9e3';
    for (var i = -1; i < 6; i++) {
      var hx = i * 380 - (camX * 0.35) % 380;
      ctx.beginPath(); ctx.arc(hx + 190, GROUND + 40, 190, Math.PI, 0); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    for (var c = -1; c < 6; c++) {
      var cx = c * 300 - (camX * 0.15) % 300 + 60, cy = 50 + (c % 2) * 40;
      ctx.beginPath(); ctx.arc(cx, cy, 20, 0, 6.3); ctx.arc(cx + 24, cy + 4, 26, 0, 6.3); ctx.arc(cx + 52, cy, 18, 0, 6.3); ctx.fill();
    }
  }

  function drawGround() {
    ctx.fillStyle = '#e9b88a'; ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.fillStyle = '#7ccf8a'; ctx.fillRect(0, GROUND, W, 12);
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
    if (b.count) { ctx.fillStyle = '#e8577a'; ctx.beginPath(); ctx.arc(x + b.w - 2, y + 2, 11, 0, 6.3); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '700 12px system-ui'; ctx.fillText(b.count, x + b.w - 2, y + 6); }
  }

  function drawShop() {
    var x = WORLD - 190 - camX;
    if (x > W + 20) { return; }
    ctx.fillStyle = '#fbe2c8'; ctx.fillRect(x - 10, GROUND - 170, 200, 170);
    ctx.fillStyle = '#e8577a'; ctx.fillRect(x - 20, GROUND - 190, 220, 30);
    for (var i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#fff' : '#e8577a'; ctx.fillRect(x - 20 + i * 36.6, GROUND - 160, 36.6, 14); }
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
    ctx.fillStyle = '#3b2418';
    ctx.fillRect(-9, 34, 7, 10 + (air ? -3 : swing * 0.5)); ctx.fillRect(2, 34, 7, 10 + (air ? -3 : -swing * 0.5));
    // apron body
    ctx.fillStyle = '#e8577a'; rr(-13, 16, 26, 22, 6); ctx.fill();
    ctx.fillStyle = '#fff'; rr(-8, 22, 16, 14, 4); ctx.fill();
    // arms
    ctx.fillStyle = '#f5c9a0'; ctx.fillRect(-17, 20 + (air ? -6 : 0), 5, 12); ctx.fillRect(12, 20 + (air ? -6 : 0), 5, 12);
    // head
    ctx.beginPath(); ctx.arc(0, 11, 11, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#3b2418'; ctx.beginPath(); ctx.arc(f * 4, 10, 1.8, 0, 6.3); ctx.arc(f * 4 + 1, 10, 0, 0, 6.3); ctx.fill();
    ctx.fillRect(f * 2 - 2, 15, 6, 1.5);
    // hat
    ctx.fillStyle = '#fff'; rr(-11, 0, 22, 6, 3); ctx.fill(); ctx.beginPath(); ctx.arc(-6, -2, 7, 0, 6.3); ctx.arc(6, -2, 7, 0, 6.3); ctx.arc(0, -6, 8, 0, 6.3); ctx.fill();
    ctx.restore();
  }

  function draw() {
    drawBackground(); drawGround(); drawShop(); boxes.forEach(drawBox); drawChef();
    popups.forEach(function (q) {
      ctx.globalAlpha = Math.min(1, q.life * 2); ctx.font = '700 20px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#5a3322';
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
