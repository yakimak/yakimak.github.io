/* ============ Мини-игра 6: Крот-шалун ============ */
(function () {
  'use strict';
  const U = window.U;
  const W = 900, H = 560;

  Minigames.register({
    id: 'whack',
    title: 'Крот-шалун',
    emoji: '🔨',
    desc: 'Стучи по кротам! Золотой крот даёт больше очков, а бомбу лучше не трогать.',
    rate: 0.7,

    start(api) {
      const { canvas, ctx } = Minigames.canvas(api.root, W, H);
      const holes = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          holes.push({
            x: 180 + c * 270,
            y: 208 + r * 138,
            phase: 'hidden',
            p: 0,
            stay: 0,
            type: 'mole',
            hit: false,
            wob: U.rand(0, U.TAU),
            stars: 0,
          });
        }
      }
      const particles = [];
      const floats = [];
      let score = 0;
      let time = 30;
      let spawnT = 0.5;
      let dead = false;
      let shake = 0;
      let combo = 0;

      api.status('0');

      function spawn() {
        const free = holes.filter((h) => h.phase === 'hidden');
        if (!free.length) return;
        const h = U.choice(free);
        const r = Math.random();
        h.type = r < 0.16 ? 'gold' : r < 0.38 ? 'bomb' : 'mole';
        h.phase = 'rise';
        h.p = 0;
        h.hit = false;
        h.stay = U.rand(0.65, 1.15) - Math.min(0.35, (30 - time) * 0.02);
      }

      function addFloat(x, y, text, color) {
        floats.push({ x, y, text, color, life: 0.9, max: 0.9 });
      }

      function burst(x, y, color, n) {
        for (let i = 0; i < n; i++) {
          const a = U.rand(0, U.TAU);
          const sp = U.rand(60, 240);
          particles.push({
            x,
            y,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp - 40,
            life: U.rand(0.3, 0.7),
            max: 0.7,
            color,
            r: U.rand(2, 5),
          });
        }
      }

      function whack(h) {
        if (h.phase === 'hidden' || h.phase === 'down' || h.p < 0.35 || h.hit) return;
        h.hit = true;
        h.phase = 'down';
        h.stars = 1;
        if (h.type === 'bomb') {
          score = Math.max(0, score - 3);
          combo = 0;
          shake = 0.4;
          U.Sound.fail();
          burst(h.x, h.y - 60, '#ff7b5c', 14);
          addFloat(h.x, h.y - 110, '-3', '#ff9a9a');
        } else {
          const gain = h.type === 'gold' ? 3 : 1;
          score += gain;
          combo++;
          if (combo >= 4) score += 1;
          U.Sound.pop();
          burst(h.x, h.y - 60, h.type === 'gold' ? '#ffd54f' : '#d9b38c', 10);
          addFloat(h.x, h.y - 110, '+' + gain, h.type === 'gold' ? '#ffe27a' : '#c8f7d8');
        }
        api.status(String(score));
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
        if (spawnT <= 0) {
          spawn();
          spawnT = U.rand(0.45, 0.8) * (0.7 + time / 60);
        }
        holes.forEach((h) => {
          h.wob += dt * 3;
          if (h.phase === 'rise') {
            h.p += dt * 4.5;
            if (h.p >= 1) {
              h.p = 1;
              h.phase = 'wait';
            }
          } else if (h.phase === 'wait') {
            h.stay -= dt;
            if (h.stay <= 0) h.phase = 'down';
          } else if (h.phase === 'down') {
            h.p -= dt * 5;
            if (h.p <= 0) {
              h.p = 0;
              h.phase = 'hidden';
              h.hit = false;
            }
          }
          if (h.stars > 0) h.stars = Math.max(0, h.stars - dt * 2);
        });
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life -= dt;
          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 500 * dt;
        }
        for (let i = floats.length - 1; i >= 0; i--) {
          const f = floats[i];
          f.life -= dt;
          f.y -= 45 * dt;
          if (f.life <= 0) floats.splice(i, 1);
        }
        shake = Math.max(0, shake - dt);
      }

      function drawMole(h, t) {
        const y = h.y + 70 - h.p * 104;
        ctx.save();
        ctx.translate(h.x, y);
        // тело
        if (h.type === 'bomb') {
          ctx.fillStyle = '#333a46';
          U.circle(ctx, 0, 0, 46);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,.18)';
          U.circle(ctx, -14, -16, 12);
          ctx.fill();
          // фитиль
          ctx.strokeStyle = '#a07744';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(0, -44);
          ctx.quadraticCurveTo(18, -66, 6, -80);
          ctx.stroke();
          ctx.fillStyle = Math.sin(t * 30) > 0 ? '#ffd54f' : '#ff7043';
          U.circle(ctx, 6, -82, 7);
          ctx.fill();
          // злой взгляд
          ctx.strokeStyle = '#ffb3b3';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(-24, -10);
          ctx.lineTo(-6, -2);
          ctx.moveTo(24, -10);
          ctx.lineTo(6, -2);
          ctx.stroke();
          ctx.fillStyle = '#ff7b6b';
          U.ellipse(ctx, 0, 14, 12, 6);
          ctx.fill();
        } else {
          const gold = h.type === 'gold';
          // лапки
          ctx.fillStyle = gold ? '#e8b64f' : '#8f6647';
          U.ellipse(ctx, -34, 26, 15, 11);
          ctx.fill();
          U.ellipse(ctx, 34, 26, 15, 11);
          ctx.fill();
          // тело
          const g = ctx.createLinearGradient(0, -56, 0, 40);
          g.addColorStop(0, gold ? '#ffe08a' : '#b98a63');
          g.addColorStop(1, gold ? '#d9a134' : '#8f6647');
          ctx.fillStyle = g;
          U.ellipse(ctx, 0, -6, 46, 52);
          ctx.fill();
          // живот
          ctx.fillStyle = gold ? '#fff2c6' : '#e0c3a4';
          U.ellipse(ctx, 0, 10, 26, 30);
          ctx.fill();
          // глаза
          const blink = Math.sin(h.wob * 0.8) > 0.96;
          ctx.strokeStyle = '#4a3524';
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          if (blink) {
            ctx.beginPath();
            ctx.moveTo(-24, -16);
            ctx.lineTo(-8, -16);
            ctx.moveTo(8, -16);
            ctx.lineTo(24, -16);
            ctx.stroke();
          } else {
            ctx.fillStyle = '#fff';
            U.circle(ctx, -16, -16, 9);
            ctx.fill();
            U.circle(ctx, 16, -16, 9);
            ctx.fill();
            ctx.fillStyle = '#2b2118';
            U.circle(ctx, -14, -15, 4.5);
            ctx.fill();
            U.circle(ctx, 18, -15, 4.5);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,.9)';
            U.circle(ctx, -16, -18, 1.8);
            ctx.fill();
            U.circle(ctx, 16, -18, 1.8);
            ctx.fill();
          }
          // нос
          ctx.fillStyle = '#e78a92';
          U.circle(ctx, 0, -2, 6);
          ctx.fill();
          // усы
          ctx.strokeStyle = 'rgba(90,60,40,.5)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-12, 2);
          ctx.lineTo(-34, -2);
          ctx.moveTo(12, 2);
          ctx.lineTo(34, -2);
          ctx.stroke();
          // зубы при ударе
          if (h.hit) {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(-10, 12);
            ctx.lineTo(-2, 18);
            ctx.lineTo(6, 12);
            ctx.closePath();
            ctx.fill();
          }
        }
        ctx.restore();
        // звёзды
        if (h.stars > 0) {
          ctx.save();
          ctx.globalAlpha = h.stars;
          for (let i = 0; i < 4; i++) {
            const a = t * 4 + (i * Math.PI) / 2;
            ctx.fillStyle = '#ffe27a';
            U.starPath(ctx, h.x + Math.cos(a) * 46, y - 40 + Math.sin(a) * 18, 9, 4, 5, a);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      function draw(t) {
        // фон
        const sky = ctx.createLinearGradient(0, 0, 0, 320);
        sky.addColorStop(0, '#9fd9ef');
        sky.addColorStop(1, '#e7f4d7');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, W, 320);
        ctx.fillStyle = 'rgba(255,244,190,.9)';
        U.circle(ctx, 790, 60, 34);
        ctx.fill();
        // холмы
        ctx.fillStyle = '#b6d99a';
        ctx.beginPath();
        ctx.moveTo(0, 300);
        ctx.quadraticCurveTo(200, 220, 430, 296);
        ctx.quadraticCurveTo(660, 240, 900, 300);
        ctx.lineTo(900, 340);
        ctx.lineTo(0, 340);
        ctx.closePath();
        ctx.fill();
        // поле
        const gr = ctx.createLinearGradient(0, 300, 0, H);
        gr.addColorStop(0, '#7ab760');
        gr.addColorStop(0.5, '#5f9e4d');
        gr.addColorStop(1, '#437a39');
        ctx.fillStyle = gr;
        ctx.fillRect(0, 300, W, H - 300);
        // травинки
        ctx.strokeStyle = 'rgba(210,240,170,.25)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 70; i++) {
          const x = (i * 131) % W;
          const y = 330 + ((i * 57) % 210);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 4, y - 8);
          ctx.stroke();
        }
        // забор
        ctx.save();
        ctx.globalAlpha = 0.45;
        for (let i = 0; i < 12; i++) {
          const x = i * 82;
          ctx.fillStyle = '#d8c39a';
          U.rr(ctx, x, 250, 12, 90, 4);
          ctx.fill();
        }
        ctx.fillStyle = '#c6ac7e';
        U.rr(ctx, 0, 268, W, 8, 4);
        ctx.fill();
        U.rr(ctx, 0, 312, W, 8, 4);
        ctx.fill();
        ctx.restore();

        // норы
        holes.forEach((h) => {
          ctx.fillStyle = 'rgba(30,50,25,.25)';
          U.ellipse(ctx, h.x, h.y + 12, 78, 24);
          ctx.fill();
          ctx.fillStyle = '#3d2a1d';
          U.ellipse(ctx, h.x, h.y, 72, 26);
          ctx.fill();
          ctx.fillStyle = '#241811';
          U.ellipse(ctx, h.x, h.y + 2, 58, 18);
          ctx.fill();
          ctx.fillStyle = '#6b8f52';
          U.ellipse(ctx, h.x, h.y - 20, 76, 16);
          ctx.fill();
          ctx.fillStyle = '#4f7439';
          U.ellipse(ctx, h.x, h.y - 24, 76, 12);
          ctx.fill();
        });

        // кроты (обрезаем по линии норы)
        holes.forEach((h) => {
          if (h.p <= 0.001) return;
          ctx.save();
          ctx.beginPath();
          ctx.rect(h.x - 100, 0, 200, h.y + 8);
          ctx.clip();
          drawMole(h, t);
          ctx.restore();
          // передний край норы
          ctx.strokeStyle = '#4b3423';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.ellipse(h.x, h.y, 70, 24, 0, 0, Math.PI);
          ctx.stroke();
        });

        particles.forEach((p) => {
          ctx.globalAlpha = U.clamp(p.life / p.max, 0, 1);
          ctx.fillStyle = p.color;
          U.circle(ctx, p.x, p.y, p.r);
          ctx.fill();
          ctx.globalAlpha = 1;
        });

        floats.forEach((f) => {
          ctx.globalAlpha = U.clamp(f.life / f.max, 0, 1);
          U.text(ctx, f.text, f.x, f.y, { size: 22, weight: 900, color: f.color, shadow: true });
          ctx.globalAlpha = 1;
        });

        // HUD
        ctx.fillStyle = 'rgba(15,30,20,.45)';
        U.rr(ctx, 20, 18, 168, 56, 16);
        ctx.fill();
        ctx.fillStyle = '#fff3cf';
        U.text(ctx, '🔨 ' + score, 40, 47, { size: 25, weight: 900, align: 'left', shadow: true });
        ctx.fillStyle = 'rgba(15,30,20,.45)';
        U.rr(ctx, W - 184, 18, 164, 56, 16);
        ctx.fill();
        ctx.fillStyle = time < 8 ? '#ff9a9a' : '#eaf7ea';
        U.text(ctx, '⏱ ' + Math.ceil(time), W - 164, 47, { size: 24, weight: 900, align: 'left' });
        ctx.fillStyle = 'rgba(0,0,0,.22)';
        U.rr(ctx, 20, 84, 168, 7, 4);
        ctx.fill();
        ctx.fillStyle = '#ffd166';
        U.rr(ctx, 20, 84, Math.max(3, (168 * time) / 30), 7, 4);
        ctx.fill();

        // молоток в углу
        ctx.save();
        ctx.translate(846, 136);
        ctx.rotate(-0.5 + Math.sin(t * 2) * 0.06);
        ctx.fillStyle = '#8a6039';
        U.rr(ctx, -6, -16, 12, 58, 5);
        ctx.fill();
        ctx.fillStyle = '#c2543f';
        U.rr(ctx, -30, -30, 60, 28, 8);
        ctx.fill();
        ctx.restore();
      }

      const stopLoop = Minigames.loop((dt) => {
        if (dead) return;
        update(dt);
        if (dead) return;
        ctx.save();
        ctx.clearRect(0, 0, W, H);
        if (shake > 0) ctx.translate(U.rand(-7, 7) * shake, U.rand(-5, 5) * shake);
        draw(performance.now() / 1000);
        ctx.restore();
      });

      Minigames.pointer(
        canvas,
        (p) => {
          let best = null;
          let bestD = 1e9;
          holes.forEach((h) => {
            if (h.phase === 'hidden' || h.p < 0.35) return;
            const d = U.dist(p.x, p.y, h.x, h.y - 50);
            if (d < 85 && d < bestD) {
              bestD = d;
              best = h;
            }
          });
          if (best) whack(best);
          else U.Sound.tap();
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
