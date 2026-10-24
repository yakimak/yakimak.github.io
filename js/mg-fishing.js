/* ============ Мини-игра 4: Рыбалка ============ */
(function () {
  'use strict';
  const U = window.U;
  const W = 960, H = 560;

  Minigames.register({
    id: 'fishing',
    title: 'Рыбалка на закате',
    emoji: '🎣',
    desc: 'Останови поплавок в зелёной зоне — и рыба твоя! Восемь забросов.',
    rate: 0.8,
    winTitle: 'Улов собран!',

    start(api) {
      const { canvas, ctx } = Minigames.canvas(api.root, W, H);
      const TOTAL = 8;
      let attempts = 0;
      let score = 0;
      let fishCaught = 0;
      let perfect = 0;
      let state = 'aim';
      let marker = 0.2;
      let dir = 1;
      let speed = 0.8;
      let zone = { s: 0.3, w: 0.22 };
      let resultT = 0;
      let hitAnim = 0;
      let missAnim = 0;
      let shake = 0;
      let dead = false;
      let lastHit = false;
      const splashes = [];
      const reeds = [];
      for (let i = 0; i < 14; i++) reeds.push({ x: 20 + i * 68 + U.rand(-18, 18), h: U.rand(40, 100), p: U.rand(0, U.TAU) });

      api.status('0');

      function newRound() {
        zone.w = U.clamp(0.24 - attempts * 0.016, 0.1, 0.24);
        zone.s = U.rand(0.08, 0.92 - zone.w);
        marker = U.rand(0.05, 0.95);
        dir = Math.random() < 0.5 ? -1 : 1;
        speed = 0.72 + attempts * 0.09;
        state = 'aim';
      }
      newRound();

      function makeSplash(x, y, n, color) {
        for (let i = 0; i < n; i++) {
          splashes.push({
            x,
            y,
            vx: U.rand(-140, 140),
            vy: U.rand(-260, -80),
            life: U.rand(0.4, 0.9),
            max: 0.9,
            r: U.rand(2, 5),
            color: color || 'rgba(220,245,255,.9)',
          });
        }
      }

      function strike() {
        if (state !== 'aim' || dead) return;
        const pos = marker;
        const inZone = pos >= zone.s && pos <= zone.s + zone.w;
        lastHit = inZone;
        if (inZone) {
          const center = zone.s + zone.w / 2;
          const isPerfect = Math.abs(pos - center) < zone.w * 0.22;
          const gain = 10 + (isPerfect ? 5 : 0);
          score += gain;
          fishCaught++;
          if (isPerfect) perfect++;
          hitAnim = 1.1;
          U.Sound.happy();
          makeSplash(560, 320, 18, 'rgba(200,240,255,.95)');
          if (isPerfect) makeSplash(560, 320, 12, 'rgba(255,225,120,.95)');
        } else {
          missAnim = 0.9;
          U.Sound.fail();
          makeSplash(560, 330, 8, 'rgba(170,210,230,.6)');
        }
        state = 'result';
        resultT = 1.15;
        api.status(String(score));
      }

      function update(dt, t) {
        attemptsData();
        if (state === 'aim') {
          marker += dir * speed * dt;
          if (marker > 1) {
            marker = 1;
            dir = -1;
          }
          if (marker < 0) {
            marker = 0;
            dir = 1;
          }
        } else {
          resultT -= dt;
          if (resultT <= 0) {
            attempts++;
            if (attempts >= TOTAL) {
              dead = true;
              stopLoop();
              api.finish(score);
              return;
            }
            newRound();
          }
        }
        hitAnim = Math.max(0, hitAnim - dt);
        missAnim = Math.max(0, missAnim - dt);
        shake = Math.max(0, shake - dt);
        for (let i = splashes.length - 1; i >= 0; i--) {
          const p = splashes[i];
          p.life -= dt;
          if (p.life <= 0) {
            splashes.splice(i, 1);
            continue;
          }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 520 * dt;
        }
      }

      function attemptsData() {
        // счётчик попыток рисуется напрямую
      }

      function drawAngler(t, success) {
        ctx.save();
        ctx.translate(150, 520);
        // хвост
        ctx.strokeStyle = '#243449';
        ctx.lineWidth = 18;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-38, -18);
        ctx.quadraticCurveTo(-86, 8, -78, -52);
        ctx.stroke();
        // тело
        ctx.fillStyle = '#2c3e56';
        U.ellipse(ctx, 0, -58, 56, 62);
        ctx.fill();
        // голова
        ctx.fillStyle = '#33475f';
        U.ellipse(ctx, 18, -128, 46, 40);
        ctx.fill();
        // ухо
        ctx.beginPath();
        ctx.moveTo(-4, -160);
        ctx.lineTo(-18, -196);
        ctx.lineTo(18, -168);
        ctx.closePath();
        ctx.fill();
        // морда
        ctx.fillStyle = '#425a76';
        U.ellipse(ctx, 48, -118, 30, 19);
        ctx.fill();
        ctx.fillStyle = '#1c2838';
        U.circle(ctx, 68, -124, 9);
        ctx.fill();
        // глаз
        ctx.fillStyle = '#ffd166';
        U.circle(ctx, 30, -138, 4);
        ctx.fill();
        // лапы
        ctx.fillStyle = '#243449';
        U.ellipse(ctx, 26, -8, 24, 12);
        ctx.fill();
        U.ellipse(ctx, -14, -6, 22, 11);
        ctx.fill();
        // удочка
        ctx.strokeStyle = '#8a6a43';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(38, -100);
        ctx.lineTo(150, -190);
        ctx.lineTo(470, -236);
        ctx.stroke();
        ctx.restore();

        // леска и поплавок (в координатах сцены)
        const bobY = 392 + Math.sin(t * 2.2) * 5 + (success ? -14 : 0);
        ctx.strokeStyle = 'rgba(230,245,255,.65)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(620, 284);
        ctx.lineTo(692, bobY - 12);
        ctx.stroke();
        // поплавок
        ctx.fillStyle = '#e94f4f';
        U.ellipse(ctx, 692, bobY - 6, 9, 12);
        ctx.fill();
        ctx.fillStyle = '#fff';
        U.ellipse(ctx, 692, bobY + 4, 8, 6);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.65)';
        U.circle(ctx, 689, bobY - 9, 2.5);
        ctx.fill();
        // круги на воде
        ctx.strokeStyle = 'rgba(220,245,255,.25)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 2; i++) {
          const rr = 14 + i * 10 + Math.sin(t * 2 + i) * 3;
          ctx.beginPath();
          ctx.ellipse(692, bobY + 6, rr, rr * 0.32, 0, 0, U.TAU);
          ctx.stroke();
        }
      }

      function drawBackground(t) {
        const sky = ctx.createLinearGradient(0, 0, 0, 360);
        sky.addColorStop(0, '#3f5d86');
        sky.addColorStop(0.5, '#c78c8f');
        sky.addColorStop(1, '#ffcf9a');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, W, 360);
        // солнце
        const sy = 268;
        ctx.fillStyle = 'rgba(255,233,170,.95)';
        U.circle(ctx, 640, sy, 58);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,220,150,.25)';
        U.circle(ctx, 640, sy, 96);
        ctx.fill();
        // облака
        ctx.fillStyle = 'rgba(255,225,210,.35)';
        [[120, 90, 1], [760, 120, 0.8], [420, 60, 0.6]].forEach(([x, y, s]) => {
          U.ellipse(ctx, x, y, 90 * s, 18 * s);
          ctx.fill();
          U.ellipse(ctx, x + 40 * s, y - 8 * s, 60 * s, 15 * s);
          ctx.fill();
        });
        // холмы
        ctx.fillStyle = '#6f6f96';
        ctx.beginPath();
        ctx.moveTo(0, 330);
        ctx.quadraticCurveTo(160, 230, 340, 320);
        ctx.quadraticCurveTo(520, 250, 720, 326);
        ctx.quadraticCurveTo(860, 280, 960, 330);
        ctx.lineTo(960, 380);
        ctx.lineTo(0, 380);
        ctx.closePath();
        ctx.fill();
        // вода
        const water = ctx.createLinearGradient(0, 330, 0, 560);
        water.addColorStop(0, '#7f9ab5');
        water.addColorStop(0.4, '#4f7295');
        water.addColorStop(1, '#2d4a68');
        ctx.fillStyle = water;
        ctx.fillRect(0, 330, W, 230);
        // отражение солнца
        ctx.save();
        ctx.globalAlpha = 0.5;
        for (let i = 0; i < 10; i++) {
          const y = 342 + i * 17;
          const w = 110 - i * 7 + Math.sin(t * 2 + i) * 16;
          ctx.fillStyle = i % 2 ? 'rgba(255,220,160,.55)' : 'rgba(255,240,200,.3)';
          U.rr(ctx, 640 - w / 2, y, w, 4, 2);
          ctx.fill();
        }
        ctx.restore();
        // блики волн
        ctx.strokeStyle = 'rgba(210,235,255,.25)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 22; i++) {
          const y = 350 + i * 9;
          const x = (i * 137 + Math.sin(t * 1.3 + i) * 40) % W;
          ctx.beginPath();
          ctx.moveTo(x, y + Math.sin(t * 2 + i) * 2);
          ctx.lineTo(x + 40 + (i % 4) * 12, y);
          ctx.stroke();
        }
        // камыши
        reeds.forEach((r) => {
          ctx.strokeStyle = '#3b5a4c';
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(r.x, 555);
          ctx.quadraticCurveTo(r.x + Math.sin(t + r.p) * 12, 555 - r.h * 0.6, r.x + Math.sin(t + r.p) * 20, 555 - r.h);
          ctx.stroke();
          ctx.fillStyle = '#6b4a35';
          U.ellipse(ctx, r.x + Math.sin(t + r.p) * 20, 552 - r.h, 6, 15);
          ctx.fill();
        });
        // кувшинки
        for (let i = 0; i < 4; i++) {
          const x = 720 + i * 58;
          const y = 420 + (i % 2) * 34;
          ctx.fillStyle = '#4c8a63';
          U.ellipse(ctx, x, y, 26, 12);
          ctx.fill();
          if (i % 2 === 0) {
            ctx.fillStyle = '#ffb3cf';
            U.circle(ctx, x + 4, y - 6, 7);
            ctx.fill();
          }
        }
        // причал
        ctx.fillStyle = '#7a5638';
        U.rr(ctx, 0, 486, 300, 18, 6);
        ctx.fill();
        ctx.fillStyle = '#5e422b';
        [30, 110, 190, 260].forEach((x) => {
          U.rr(ctx, x, 500, 14, 60, 4);
          ctx.fill();
        });
        // вода поверх причала
        ctx.fillStyle = 'rgba(45,74,104,.55)';
        U.rr(ctx, 0, 504, 300, 56, 0);
        ctx.fill();
      }

      function drawFish(t) {
        if (hitAnim <= 0) return;
        const p = 1 - hitAnim / 1.1;
        const x = 560 + Math.sin(p * Math.PI) * 60;
        const y = 330 - Math.sin(p * Math.PI) * 150;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.sin(p * Math.PI) * 0.8 - 0.3);
        ctx.fillStyle = '#ffb35c';
        U.ellipse(ctx, 0, 0, 30, 16);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-26, 0);
        ctx.lineTo(-46, -14);
        ctx.lineTo(-44, 14);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#2b2118';
        U.circle(ctx, 12, -3, 3);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.45)';
        U.ellipse(ctx, 2, -4, 12, 4);
        ctx.fill();
        ctx.restore();
      }

      function drawHud(t) {
        // счёт
        ctx.fillStyle = 'rgba(12,24,38,.5)';
        U.rr(ctx, 22, 20, 190, 58, 16);
        ctx.fill();
        ctx.fillStyle = '#ffe3b0';
        U.text(ctx, '🎣 ' + score, 42, 50, { size: 25, weight: 900, align: 'left', shadow: true });
        ctx.fillStyle = 'rgba(12,24,38,.5)';
        U.rr(ctx, W - 178, 20, 156, 58, 16);
        ctx.fill();
        ctx.fillStyle = '#e8f3ff';
        U.text(ctx, attempts + ' / ' + TOTAL, W - 158, 50, { size: 22, weight: 900, align: 'left' });
        U.text(ctx, 'забросов', W - 40, 50, { size: 12, weight: 700, color: 'rgba(220,235,250,.65)', align: 'right' });

        // шкала
        const bx = 210, by = 496, bw = 540, bh = 30;
        ctx.save();
        ctx.fillStyle = 'rgba(8,18,28,.55)';
        U.rr(ctx, bx - 8, by - 8, bw + 16, bh + 16, 14);
        ctx.fill();
        const bg = ctx.createLinearGradient(bx, 0, bx + bw, 0);
        bg.addColorStop(0, '#2c4358');
        bg.addColorStop(1, '#3d5a70');
        ctx.fillStyle = bg;
        U.rr(ctx, bx, by, bw, bh, 12);
        ctx.fill();
        // зона
        const gx = bx + zone.s * bw;
        const gw = zone.w * bw;
        const gg = ctx.createLinearGradient(gx, 0, gx + gw, 0);
        gg.addColorStop(0, '#5fd68a');
        gg.addColorStop(0.5, '#b4f07e');
        gg.addColorStop(1, '#5fd68a');
        ctx.fillStyle = gg;
        U.rr(ctx, gx, by + 2, gw, bh - 4, 8);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.85)';
        U.rr(ctx, gx + gw / 2 - 2, by - 4, 4, bh + 8, 2);
        ctx.fill();
        // маркер
        if (state === 'aim') {
          const mx = bx + marker * bw;
          ctx.fillStyle = '#fff';
          U.rr(ctx, mx - 3, by - 12, 6, bh + 24, 3);
          ctx.fill();
          ctx.fillStyle = '#ffcf6a';
          U.circle(ctx, mx, by - 16, 9);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,.75)';
          U.rr(ctx, bx, by, 0, 0, 0);
          ctx.fill();
        }
        // подписи
        U.text(ctx, state === 'aim' ? 'Жми в зелёную зону!' : lastHit ? (hitAnim > 0 ? 'Есть! 🐟' : 'Поймал!') : 'Мимо...', W / 2, 462, {
          size: 18,
          weight: 900,
          color: state === 'result' ? (lastHit ? '#b8ffd0' : '#ffb3b3') : '#dfeeff',
          shadow: true,
        });
        // индикаторы попыток
        for (let i = 0; i < TOTAL; i++) {
          ctx.fillStyle = i < attempts ? '#ffd166' : 'rgba(255,255,255,.25)';
          U.circle(ctx, W - 240 + i * 20, 460, 5);
          ctx.fill();
        }
        ctx.restore();
      }

      const stopLoop = Minigames.loop((dt) => {
        if (dead) return;
        const t = performance.now() / 1000;
        update(dt, t);
        if (dead) return;
        ctx.save();
        ctx.clearRect(0, 0, W, H);
        ctx.translate(shake > 0 ? U.rand(-4, 4) * shake : 0, 0);
        drawBackground(t);
        drawAngler(t, hitAnim > 0);
        drawFish(t);
        splashes.forEach((p) => {
          ctx.globalAlpha = U.clamp(p.life / p.max, 0, 1);
          ctx.fillStyle = p.color;
          U.circle(ctx, p.x, p.y, p.r);
          ctx.fill();
          ctx.globalAlpha = 1;
        });
        drawHud(t);
        ctx.restore();
      });

      function stop() {
        stopLoop();
      }

      Minigames.pointer(
        canvas,
        () => {
          if (state === 'aim') {
            U.Sound.tap();
            strike();
          }
        },
        api.signal
      );

      Minigames.bindKeys(
        (e) => {
          if ((e.key === ' ' || e.key === 'Enter') && state === 'aim') {
            e.preventDefault();
            strike();
          }
        },
        api.signal
      );

      return stop;
    },
  });
})();
