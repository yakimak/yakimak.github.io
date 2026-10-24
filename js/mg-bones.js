/* ============ Мини-игра 1: Костяная лихорадка ============ */
(function () {
  'use strict';
  const U = window.U;
  const W = 960, H = 560;

  Minigames.register({
    id: 'bones',
    title: 'Костяная лихорадка',
    emoji: '🦴',
    desc: 'Лови кости в корзинку и не дай бомбам испортить веселье. 40 секунд!',
    rate: 0.9,

    start(api) {
      const { canvas, ctx } = Minigames.canvas(api.root, W, H);
      const basket = { x: W / 2, tx: W / 2, w: 150 };
      const items = [];
      const sparks = [];
      let score = 0;
      let time = 40;
      let spawn = 0;
      let shake = 0;
      let dead = false;
      let combo = 0;
      let comboT = 0;
      let trees = [];
      for (let i = 0; i < 9; i++) {
        trees.push({ x: 60 + i * 115 + U.rand(-25, 25), s: U.rand(0.6, 1.15) });
      }

      api.status('0');

      function spawnItem() {
        const r = Math.random();
        let type = 'bone';
        if (r > 0.78) type = 'bomb';
        else if (r > 0.72) type = 'gold';
        items.push({
          x: U.rand(70, W - 70),
          y: -40,
          vy: U.rand(190, 260) + (40 - time) * 3,
          type,
          rot: U.rand(0, U.TAU),
          spin: U.rand(-3, 3),
          sway: U.rand(0, U.TAU),
        });
      }

      function popSpark(x, y, color, n) {
        for (let i = 0; i < (n || 6); i++) {
          const a = U.rand(0, U.TAU);
          const sp = U.rand(60, 220);
          sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, life: U.rand(0.4, 0.8), max: 0.8, color });
        }
      }

      function drawBackground(t) {
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#2a3c5e');
        g.addColorStop(0.45, '#4b6b7e');
        g.addColorStop(1, '#2c4438');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        // луна
        ctx.fillStyle = 'rgba(255,245,200,.9)';
        U.circle(ctx, 790, 90, 34);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,245,200,.12)';
        U.circle(ctx, 790, 90, 70);
        ctx.fill();
        // звёзды
        for (let i = 0; i < 40; i++) {
          const a = 0.2 + 0.6 * Math.abs(Math.sin(i * 2.3 + t * 0.6));
          ctx.fillStyle = 'rgba(255,255,230,' + a + ')';
          U.circle(ctx, (i * 149) % W, (i * 67) % 260 + 10, i % 6 === 0 ? 2 : 1.1);
          ctx.fill();
        }
        // деревья
        trees.forEach((tr) => {
          ctx.save();
          ctx.translate(tr.x, H - 96);
          ctx.scale(tr.s, tr.s);
          ctx.fillStyle = '#20362f';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-34, -70);
          ctx.lineTo(-16, -68);
          ctx.lineTo(-44, -128);
          ctx.lineTo(-8, -120);
          ctx.lineTo(0, -170);
          ctx.lineTo(8, -120);
          ctx.lineTo(44, -128);
          ctx.lineTo(16, -68);
          ctx.lineTo(34, -70);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#2a453b';
          ctx.fillRect(-6, -10, 12, 30);
          ctx.restore();
        });
        // земля
        const gg = ctx.createLinearGradient(0, H - 100, 0, H);
        gg.addColorStop(0, '#31513f');
        gg.addColorStop(1, '#1d3327');
        ctx.fillStyle = gg;
        ctx.fillRect(0, H - 98, W, 98);
        // трава
        ctx.strokeStyle = 'rgba(120,190,130,.35)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 40; i++) {
          const x = (i * 97) % W;
          ctx.beginPath();
          ctx.moveTo(x, H - 90);
          ctx.lineTo(x + 5, H - 108);
          ctx.stroke();
        }
        // светлячки
        for (let i = 0; i < 12; i++) {
          const x = (i * 163 + Math.sin(t + i) * 26) % W;
          const y = 260 + ((i * 71 + t * 12) % 190);
          const a = 0.25 + 0.5 * Math.abs(Math.sin(t * 2 + i));
          ctx.fillStyle = 'rgba(255,235,130,' + a + ')';
          U.circle(ctx, x, y, 3);
          ctx.fill();
        }
      }

      function drawBasket() {
        const bx = basket.x;
        U.groundShadow(ctx, bx, H - 54, 88, 14, 0.3);
        // ручка
        ctx.strokeStyle = '#8a6039';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(bx, H - 92, 54, Math.PI * 1.12, Math.PI * 1.88);
        ctx.stroke();
        // корзина
        const g = ctx.createLinearGradient(0, H - 100, 0, H - 40);
        g.addColorStop(0, '#c98a4b');
        g.addColorStop(1, '#8f5a2f');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(bx - 78, H - 96);
        ctx.quadraticCurveTo(bx, H - 26, bx + 78, H - 96);
        ctx.closePath();
        ctx.fill();
        // плетение
        ctx.strokeStyle = 'rgba(70,42,20,.4)';
        ctx.lineWidth = 3;
        for (let i = 1; i < 4; i++) {
          const y = H - 96 + i * 17;
          ctx.beginPath();
          ctx.moveTo(bx - 62, y - 4);
          ctx.quadraticCurveTo(bx, y + 22, bx + 62, y - 4);
          ctx.stroke();
        }
        ctx.strokeStyle = 'rgba(70,42,20,.35)';
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.moveTo(bx + i * 22, H - 92);
          ctx.lineTo(bx + i * 26, H - 46);
          ctx.stroke();
        }
        // обод
        ctx.fillStyle = '#e0a565';
        U.rr(ctx, bx - 82, H - 104, 164, 14, 7);
        ctx.fill();
      }

      function update(dt) {
        time -= dt;
        if (time <= 0) {
          time = 0;
          return finishGame();
        }
        basket.tx = U.clamp(basket.tx, 90, W - 90);
        basket.x += (basket.tx - basket.x) * Math.min(1, dt * 12);

        spawn -= dt;
        if (spawn <= 0) {
          spawnItem();
          spawn = U.rand(0.34, 0.62) * (0.75 + time / 100);
        }

        comboT = Math.max(0, comboT - dt);
        if (comboT <= 0) combo = 0;

        for (let i = items.length - 1; i >= 0; i--) {
          const it = items[i];
          it.y += it.vy * dt;
          it.rot += it.spin * dt;
          it.sway += dt * 2;
          it.x += Math.sin(it.sway) * 22 * dt;
          if (it.y > H - 108 && it.y < H - 30 && Math.abs(it.x - basket.x) < 88) {
            items.splice(i, 1);
            if (it.type === 'bomb') {
              score = Math.max(0, score - 2);
              combo = 0;
              shake = 0.35;
              U.Sound.fail();
              popSpark(it.x, it.y, '#ff7b5c', 14);
            } else {
              const gain = it.type === 'gold' ? 3 : 1;
              score += gain;
              combo++;
              comboT = 2.2;
              if (combo >= 5) {
                score += 1;
                popSpark(it.x, it.y - 20, '#ffe27a', 5);
              }
              U.Sound.pop();
              popSpark(it.x, it.y, it.type === 'gold' ? '#ffd54f' : '#f2e6c9', 8);
            }
            api.status(String(score));
          } else if (it.y > H + 40) {
            items.splice(i, 1);
          }
        }

        for (let i = sparks.length - 1; i >= 0; i--) {
          const p = sparks[i];
          p.life -= dt;
          if (p.life <= 0) {
            sparks.splice(i, 1);
            continue;
          }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 420 * dt;
        }
        shake = Math.max(0, shake - dt);
      }

      function draw() {
        ctx.save();
        ctx.clearRect(0, 0, W, H);
        if (shake > 0) ctx.translate(U.rand(-6, 6) * shake, U.rand(-4, 4) * shake);
        const t = performance.now() / 1000;
        drawBackground(t);

        items.forEach((it) => {
          ctx.save();
          ctx.translate(it.x, it.y);
          ctx.rotate(it.rot);
          if (it.type === 'bomb') {
            ctx.fillStyle = '#2b2f3a';
            U.circle(ctx, 0, 0, 24);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,.22)';
            U.circle(ctx, -8, -8, 7);
            ctx.fill();
            ctx.strokeStyle = '#8b6a3c';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(10, -20);
            ctx.quadraticCurveTo(22, -34, 12, -42);
            ctx.stroke();
            ctx.fillStyle = Math.sin(t * 30) > 0 ? '#ffd54f' : '#ff7043';
            U.circle(ctx, 12, -44, 6);
            ctx.fill();
          } else {
            const c = it.type === 'gold' ? '#ffd76a' : '#f2e6c9';
            ctx.fillStyle = c;
            U.bonePath(ctx, 0, 0, 1.7);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,.45)';
            U.ellipse(ctx, -8, -6, 9, 3, -0.3);
            ctx.fill();
            if (it.type === 'gold') {
              ctx.fillStyle = 'rgba(255,255,255,.6)';
              U.sparklePath(ctx, 20, -18, 8);
              ctx.fill();
            }
          }
          ctx.restore();
        });

        sparks.forEach((p) => {
          ctx.globalAlpha = U.clamp(p.life / p.max, 0, 1);
          ctx.fillStyle = p.color;
          U.circle(ctx, p.x, p.y, 4);
          ctx.fill();
          ctx.globalAlpha = 1;
        });

        drawBasket();

        // HUD
        ctx.save();
        ctx.fillStyle = 'rgba(10,18,28,.5)';
        U.rr(ctx, 22, 22, 150, 54, 16);
        ctx.fill();
        ctx.fillStyle = '#ffe6ae';
        U.text(ctx, '🦴 ' + score, 42, 50, { size: 26, weight: 900, align: 'left', shadow: true });
        ctx.fillStyle = 'rgba(10,18,28,.5)';
        U.rr(ctx, W - 182, 22, 160, 54, 16);
        ctx.fill();
        ctx.fillStyle = time < 10 ? '#ff9a9a' : '#e8f3ff';
        U.text(ctx, '⏱ ' + Math.ceil(time), W - 162, 50, { size: 24, weight: 900, align: 'left' });
        // таймер
        ctx.fillStyle = 'rgba(0,0,0,.28)';
        U.rr(ctx, 22, 86, 150, 8, 4);
        ctx.fill();
        ctx.fillStyle = time < 10 ? '#ff7b7b' : '#ffd166';
        U.rr(ctx, 22, 86, Math.max(4, (150 * time) / 40), 8, 4);
        ctx.fill();
        if (combo >= 3) {
          U.text(ctx, 'x' + Math.min(6, combo) + ' комбо!', W / 2, 44, {
            size: 20,
            weight: 900,
            color: '#ffe27a',
            shadow: true,
          });
        }
        ctx.restore();
        ctx.restore();
      }

      function finishGame() {
        if (dead) return;
        dead = true;
        stop();
        api.finish(score);
      }

      const stopLoop = Minigames.loop((dt) => {
        if (dead) return;
        update(dt);
        draw();
      });

      function onMove(p) {
        basket.tx = p.x;
      }
      Minigames.pointer(canvas, (p) => onMove(p), api.signal);
      canvas.addEventListener(
        'pointermove',
        (e) => {
          const r = canvas.getBoundingClientRect();
          onMove({ x: ((e.clientX - r.left) * W) / r.width });
        },
        { signal: api.signal }
      );

      Minigames.bindKeys(
        (e) => {
          if (e.key === 'ArrowLeft') basket.tx = U.clamp(basket.tx - 70, 90, W - 90);
          if (e.key === 'ArrowRight') basket.tx = U.clamp(basket.tx + 70, 90, W - 90);
          if (e.key === ' ') {
            e.preventDefault();
          }
        },
        api.signal
      );

      function stop() {
        stopLoop();
      }
      return stop;
    },
  });
})();
