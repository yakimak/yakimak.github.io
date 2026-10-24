/* ============ Мини-игра 2: Пузыри ============ */
(function () {
  'use strict';
  const U = window.U;
  const W = 960, H = 560;

  Minigames.register({
    id: 'bubbles',
    title: 'Охота на пузыри',
    emoji: '🫧',
    desc: 'Лопай мыльные пузыри! Золотые дают больше очков. 30 секунд веселья.',
    rate: 0.8,

    start(api) {
      const { canvas, ctx } = Minigames.canvas(api.root, W, H);
      const bubbles = [];
      const bits = [];
      const ripples = [];
      let score = 0;
      let time = 30;
      let spawnT = 0;
      let dead = false;
      let cursor = { x: W / 2, y: H / 2 };
      let flash = 0;

      const COLORS = ['#8fd7ff', '#b6a7ff', '#8fffd0', '#ffc4e1', '#ffe59a'];

      api.status('0');

      function spawn() {
        const r = U.rand(20, 46);
        bubbles.push({
          x: U.rand(60, W - 60),
          y: H + r + 20,
          r,
          speed: U.rand(45, 110) * (1 + (30 - time) / 60),
          drift: U.rand(0, U.TAU),
          driftSpeed: U.rand(0.6, 1.6),
          color: U.choice(COLORS),
          gold: Math.random() < 0.09,
          wob: U.rand(0, U.TAU),
          life: 0,
        });
      }

      function pop(b, points) {
        score += points;
        api.status(String(score));
        U.Sound.pop();
        flash = 0.12;
        for (let i = 0; i < 10; i++) {
          const a = U.rand(0, U.TAU);
          const sp = U.rand(40, 190);
          bits.push({
            x: b.x,
            y: b.y,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp,
            life: U.rand(0.25, 0.55),
            max: 0.55,
            color: b.gold ? '#ffd76a' : b.color,
            r: U.rand(2, 5),
          });
        }
        ripples.push({ x: b.x, y: b.y, r: b.r, life: 0.4, max: 0.4 });
      }

      function update(dt) {
        time -= dt;
        if (time <= 0) {
          time = 0;
          dead = true;
          stopLoop();
          api.finish(score);
          return;
        }
        spawnT -= dt;
        if (spawnT <= 0 && bubbles.length < 16) {
          spawn();
          spawnT = U.rand(0.22, 0.5);
        }
        for (let i = bubbles.length - 1; i >= 0; i--) {
          const b = bubbles[i];
          b.life += dt;
          b.y -= b.speed * dt;
          b.drift += dt * b.driftSpeed;
          b.x += Math.sin(b.drift) * 24 * dt;
          b.wob += dt * 2;
          if (b.y + b.r < -30) {
            bubbles.splice(i, 1);
          }
        }
        for (let i = bits.length - 1; i >= 0; i--) {
          const p = bits[i];
          p.life -= dt;
          if (p.life <= 0) {
            bits.splice(i, 1);
            continue;
          }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 220 * dt;
          p.vx *= 0.98;
        }
        for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i];
          r.life -= dt;
          if (r.life <= 0) ripples.splice(i, 1);
        }
        flash = Math.max(0, flash - dt);
      }

      function draw(t) {
        // фон
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#17324d');
        g.addColorStop(0.5, '#1f4f63');
        g.addColorStop(1, '#2e6b62');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        // мягкие круги
        for (let i = 0; i < 6; i++) {
          const x = (i * 220 + Math.sin(t * 0.3 + i) * 60) % (W + 200) - 100;
          const y = (i * 150 + 80) % H;
          const rg = ctx.createRadialGradient(x, y, 0, x, y, 190);
          rg.addColorStop(0, 'rgba(130,220,220,.10)');
          rg.addColorStop(1, 'rgba(130,220,220,0)');
          ctx.fillStyle = rg;
          ctx.fillRect(0, 0, W, H);
        }
        // блики воды снизу
        ctx.fillStyle = 'rgba(140,240,220,.12)';
        for (let i = 0; i < 5; i++) {
          const w = 200 + i * 80;
          U.ellipse(ctx, W / 2, H - 20 + i * 4, w, 12);
          ctx.fill();
        }

        if (flash > 0) {
          ctx.fillStyle = 'rgba(255,255,255,' + flash * 1.2 + ')';
          ctx.fillRect(0, 0, W, H);
        }

        // пузыри
        bubbles.forEach((b) => {
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate(Math.sin(b.wob) * 0.06);
          // тело
          const bg = ctx.createRadialGradient(-b.r * 0.35, -b.r * 0.4, b.r * 0.1, 0, 0, b.r);
          if (b.gold) {
            bg.addColorStop(0, 'rgba(255,250,220,.95)');
            bg.addColorStop(0.45, 'rgba(255,215,100,.55)');
            bg.addColorStop(1, 'rgba(210,150,30,.35)');
          } else {
            bg.addColorStop(0, 'rgba(255,255,255,.35)');
            bg.addColorStop(0.55, U.hexA(b.color, 0.22));
            bg.addColorStop(1, U.hexA(b.color, 0.55));
          }
          ctx.fillStyle = bg;
          U.circle(ctx, 0, 0, b.r);
          ctx.fill();
          // обводка
          ctx.strokeStyle = b.gold ? 'rgba(255,230,150,.9)' : 'rgba(255,255,255,.5)';
          ctx.lineWidth = 2;
          U.circle(ctx, 0, 0, b.r - 1);
          ctx.stroke();
          // блик
          ctx.fillStyle = 'rgba(255,255,255,.75)';
          U.ellipse(ctx, -b.r * 0.34, -b.r * 0.4, b.r * 0.24, b.r * 0.16, -0.6);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,.35)';
          U.circle(ctx, b.r * 0.35, -b.r * 0.2, b.r * 0.1);
          ctx.fill();
          if (b.gold) {
            ctx.fillStyle = 'rgba(255,255,255,.9)';
            U.sparklePath(ctx, b.r * 0.55, -b.r * 0.55, b.r * 0.35);
            ctx.fill();
          }
          ctx.restore();
        });

        ripples.forEach((r) => {
          const p = r.life / r.max;
          ctx.strokeStyle = 'rgba(255,255,255,' + p * 0.6 + ')';
          ctx.lineWidth = 2;
          U.circle(ctx, r.x, r.y, r.r * (1.4 - p * 0.4));
          ctx.stroke();
        });

        bits.forEach((p) => {
          ctx.globalAlpha = U.clamp(p.life / p.max, 0, 1);
          ctx.fillStyle = p.color;
          U.circle(ctx, p.x, p.y, p.r);
          ctx.fill();
          ctx.globalAlpha = 1;
        });

        // прицел
        ctx.strokeStyle = 'rgba(255,255,255,.35)';
        ctx.lineWidth = 2;
        U.circle(ctx, cursor.x, cursor.y, 12);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.5)';
        U.circle(ctx, cursor.x, cursor.y, 2.5);
        ctx.fill();

        // HUD
        ctx.fillStyle = 'rgba(8,22,32,.45)';
        U.rr(ctx, 22, 20, 168, 56, 16);
        ctx.fill();
        ctx.fillStyle = '#c9f6ff';
        U.text(ctx, '🫧 ' + score, 42, 49, { size: 26, weight: 900, align: 'left', shadow: true });
        ctx.fillStyle = 'rgba(8,22,32,.45)';
        U.rr(ctx, W - 186, 20, 164, 56, 16);
        ctx.fill();
        ctx.fillStyle = time < 8 ? '#ff9a9a' : '#e8f3ff';
        U.text(ctx, '⏱ ' + Math.ceil(time), W - 166, 49, { size: 24, weight: 900, align: 'left' });
        ctx.fillStyle = 'rgba(0,0,0,.25)';
        U.rr(ctx, 22, 86, 168, 7, 4);
        ctx.fill();
        ctx.fillStyle = '#8fe8d8';
        U.rr(ctx, 22, 86, Math.max(4, (168 * time) / 30), 7, 4);
        ctx.fill();
      }

      const stopLoop = Minigames.loop((dt) => {
        if (dead) return;
        update(dt);
        draw(performance.now() / 1000);
      });

      Minigames.pointer(
        canvas,
        (p) => {
          cursor = p;
          U.Sound.tap();
          // ищем ближайший пузырь под курсором
          let hit = -1;
          let best = 1e9;
          for (let i = bubbles.length - 1; i >= 0; i--) {
            const b = bubbles[i];
            const d = U.dist(p.x, p.y, b.x, b.y);
            if (d < b.r + 12 && d < best) {
              best = d;
              hit = i;
            }
          }
          if (hit >= 0) {
            const b = bubbles[hit];
            bubbles.splice(hit, 1);
            pop(b, b.gold ? 4 : 1);
          }
        },
        api.signal
      );
      canvas.addEventListener(
        'pointermove',
        (e) => {
          const r = canvas.getBoundingClientRect();
          cursor = { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
        },
        { signal: api.signal }
      );

      function stop() {
        stopLoop();
      }
      return stop;
    },
  });
})();
