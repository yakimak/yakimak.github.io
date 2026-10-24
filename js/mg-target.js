/* ============ Мини-игра 9: Воздушный тир ============ */
(function () {
  'use strict';
  const U = window.U;
  const W = 960, H = 560;

  Minigames.register({
    id: 'target',
    title: 'Воздушный тир',
    emoji: '🎈',
    desc: 'Лопай шарики кликами. Попадания подряд дают множитель очков!',
    rate: 0.75,

    start(api) {
      const { canvas, ctx } = Minigames.canvas(api.root, W, H);
      const balloons = [];
      const bits = [];
      const COLORS = ['#ff7b95', '#ffb35c', '#ffe27a', '#8fe0b0', '#8fc8ff', '#c9a4ff'];
      let score = 0;
      let time = 30;
      let spawnT = 0.2;
      let combo = 0;
      let comboT = 0;
      let cursor = { x: W / 2, y: H / 2 };
      let dead = false;
      let flash = 0;
      let misses = 0;

      api.status('0');

      function spawn() {
        const fromLeft = Math.random() < 0.5;
        const r = U.rand(24, 40);
        balloons.push({
          x: fromLeft ? -r - 20 : W + r + 20,
          y: U.rand(120, H - 130),
          r,
          vx: (fromLeft ? 1 : -1) * U.rand(45, 115),
          phase: U.rand(0, U.TAU),
          bob: U.rand(10, 26),
          color: U.choice(COLORS),
          gold: Math.random() < 0.11,
          scale: 0,
        });
      }

      function popBalloon(b) {
        ballonScore(b);
        for (let i = 0; i < 14; i++) {
          const a = U.rand(0, U.TAU);
          const sp = U.rand(60, 260);
          bits.push({
            x: b.x,
            y: b.y,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp,
            life: U.rand(0.3, 0.7),
            max: 0.7,
            color: b.gold ? '#ffe27a' : b.color,
            r: U.rand(2, 5),
          });
        }
        U.Sound.pop();
        flash = 0.08;
      }

      function ballonScore(b) {
        combo++;
        comboT = 2.4;
        const mult = Math.min(3, 1 + Math.floor(combo / 4));
        const gain = (b.gold ? 5 : 1) * mult;
        score += gain;
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
        if (spawnT <= 0 && balloons.length < 11) {
          spawn();
          spawnT = U.rand(0.28, 0.6);
        }
        for (let i = balloons.length - 1; i >= 0; i--) {
          const b = balloons[i];
          b.phase += dt * 1.4;
          b.scale = Math.min(1, b.scale + dt * 4);
          b.x += b.vx * dt;
          if (b.x < -120 || b.x > W + 120) balloons.splice(i, 1);
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
          p.vy += 380 * dt;
        }
        comboT = Math.max(0, comboT - dt);
        if (comboT <= 0) combo = 0;
        flash = Math.max(0, flash - dt);
      }

      function drawBackground(t) {
        const sky = ctx.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0, '#31456b');
        sky.addColorStop(0.35, '#7079a8');
        sky.addColorStop(0.65, '#e7a0a0');
        sky.addColorStop(1, '#ffd9a0');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, W, H);
        // солнце
        ctx.fillStyle = 'rgba(255,235,170,.75)';
        U.circle(ctx, 760, 180, 70);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,220,150,.18)';
        U.circle(ctx, 760, 180, 120);
        ctx.fill();
        // дальние горы
        ctx.fillStyle = 'rgba(80,95,130,.55)';
        ctx.beginPath();
        ctx.moveTo(0, 380);
        ctx.lineTo(140, 280);
        ctx.lineTo(280, 380);
        ctx.lineTo(430, 300);
        ctx.lineTo(600, 380);
        ctx.lineTo(760, 290);
        ctx.lineTo(960, 380);
        ctx.lineTo(960, 420);
        ctx.lineTo(0, 420);
        ctx.closePath();
        ctx.fill();
        // поляна
        const g = ctx.createLinearGradient(0, 380, 0, H);
        g.addColorStop(0, '#6f9e64');
        g.addColorStop(1, '#3e6b47');
        ctx.fillStyle = g;
        ctx.fillRect(0, 390, W, H - 390);
        ctx.fillStyle = 'rgba(255,255,255,.10)';
        for (let i = 0; i < 70; i++) {
          const x = (i * 131) % W;
          const y = 410 + ((i * 53) % 140);
          U.circle(ctx, x, y, 2);
          ctx.fill();
        }
        // гирлянда
        const colors = ['#ff7b95', '#ffd166', '#8fc8ff', '#8fe0b0'];
        ctx.strokeStyle = 'rgba(255,255,255,.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 40);
        ctx.quadraticCurveTo(W / 2, 110, W, 40);
        ctx.stroke();
        for (let i = 0; i <= 12; i++) {
          const p = i / 12;
          const x = p * W;
          const y = 40 + Math.sin(p * Math.PI) * 55;
          ctx.fillStyle = colors[i % colors.length];
          ctx.beginPath();
          ctx.moveTo(x - 12, y);
          ctx.lineTo(x + 12, y);
          ctx.lineTo(x, y + 26);
          ctx.closePath();
          ctx.fill();
        }
        // деревья по краям
        [[60, 1.2], [900, 1.0], [150, 0.7]].forEach(([x, s]) => {
          ctx.fillStyle = '#3b6b4c';
          ctx.beginPath();
          ctx.moveTo(x, 430);
          ctx.lineTo(x - 70 * s, 430);
          ctx.lineTo(x, 260 * s + 130);
          ctx.lineTo(x + 70 * s, 430);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#5b4230';
          ctx.fillRect(x - 8, 420, 16, 40);
        });
      }

      function drawBalloon(b, t) {
        const y = b.y + Math.sin(b.phase) * b.bob;
        ctx.save();
        ctx.translate(b.x, y);
        ctx.scale(b.scale, b.scale);
        // нитка
        ctx.strokeStyle = 'rgba(255,255,255,.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, b.r);
        ctx.quadraticCurveTo(6, b.r + 40, 0, b.r + 78);
        ctx.stroke();
        // шар
        const g = ctx.createRadialGradient(-b.r * 0.35, -b.r * 0.4, b.r * 0.1, 0, 0, b.r);
        if (b.gold) {
          g.addColorStop(0, '#fff7cc');
          g.addColorStop(0.5, '#ffd84f');
          g.addColorStop(1, '#d39a1e');
        } else {
          g.addColorStop(0, '#ffffff');
          g.addColorStop(0.25, b.color);
          g.addColorStop(1, b.color);
        }
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(0, 0, b.r * 0.86, b.r, 0, 0, U.TAU);
        ctx.fill();
        // узелок
        ctx.fillStyle = b.gold ? '#c99a2a' : b.color;
        ctx.beginPath();
        ctx.moveTo(-6, b.r - 2);
        ctx.lineTo(6, b.r - 2);
        ctx.lineTo(0, b.r + 8);
        ctx.closePath();
        ctx.fill();
        // блик
        ctx.fillStyle = 'rgba(255,255,255,.7)';
        U.ellipse(ctx, -b.r * 0.3, -b.r * 0.35, b.r * 0.2, b.r * 0.28, -0.4);
        ctx.fill();
        if (b.gold) {
          ctx.fillStyle = 'rgba(255,255,255,.9)';
          U.sparklePath(ctx, b.r * 0.5, -b.r * 0.5, b.r * 0.32);
          ctx.fill();
        }
        ctx.restore();
      }

      const stopLoop = Minigames.loop((dt) => {
        if (dead) return;
        const t = performance.now() / 1000;
        update(dt);
        if (dead) return;
        ctx.clearRect(0, 0, W, H);
        drawBackground(t);
        balloons.forEach((b) => drawBalloon(b, t));
        bits.forEach((p) => {
          ctx.globalAlpha = U.clamp(p.life / p.max, 0, 1);
          ctx.fillStyle = p.color;
          U.circle(ctx, p.x, p.y, p.r);
          ctx.fill();
          ctx.globalAlpha = 1;
        });
        if (flash > 0) {
          ctx.fillStyle = 'rgba(255,255,255,' + flash + ')';
          ctx.fillRect(0, 0, W, H);
        }

        // прицел
        ctx.strokeStyle = 'rgba(255,255,255,.65)';
        ctx.lineWidth = 2;
        U.circle(ctx, cursor.x, cursor.y, 16);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cursor.x - 24, cursor.y);
        ctx.lineTo(cursor.x - 8, cursor.y);
        ctx.moveTo(cursor.x + 8, cursor.y);
        ctx.lineTo(cursor.x + 24, cursor.y);
        ctx.moveTo(cursor.x, cursor.y - 24);
        ctx.lineTo(cursor.x, cursor.y - 8);
        ctx.moveTo(cursor.x, cursor.y + 8);
        ctx.lineTo(cursor.x, cursor.y + 24);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.8)';
        U.circle(ctx, cursor.x, cursor.y, 2);

        // HUD
        ctx.fillStyle = 'rgba(24,26,45,.45)';
        U.rr(ctx, 20, 18, 168, 56, 16);
        ctx.fill();
        ctx.fillStyle = '#ffe3b0';
        U.text(ctx, '🎈 ' + score, 40, 47, { size: 25, weight: 900, align: 'left', shadow: true });
        ctx.fillStyle = 'rgba(24,26,45,.45)';
        U.rr(ctx, W - 184, 18, 164, 56, 16);
        ctx.fill();
        ctx.fillStyle = time < 8 ? '#ff9a9a' : '#eaf3ff';
        U.text(ctx, '⏱ ' + Math.ceil(time), W - 164, 47, { size: 24, weight: 900, align: 'left' });
        ctx.fillStyle = 'rgba(0,0,0,.22)';
        U.rr(ctx, 20, 84, 168, 7, 4);
        ctx.fill();
        ctx.fillStyle = '#ff9d8a';
        U.rr(ctx, 20, 84, Math.max(3, (168 * time) / 30), 7, 4);
        ctx.fill();
        if (combo >= 2) {
          const mult = Math.min(3, 1 + Math.floor(combo / 4));
          ctx.fillStyle = 'rgba(24,26,45,.45)';
          U.rr(ctx, W / 2 - 86, 18, 172, 46, 14);
          ctx.fill();
          U.text(ctx, 'серия ' + combo + (mult > 1 ? '  ×' + mult : ''), W / 2, 41, {
            size: 17,
            weight: 900,
            color: mult > 1 ? '#ffe27a' : '#dff0ff',
          });
        }
      });

      Minigames.pointer(
        canvas,
        (p) => {
          cursor = p;
          U.Sound.tap();
          let hit = -1;
          for (let i = balloons.length - 1; i >= 0; i--) {
            const b = balloons[i];
            const y = b.y + Math.sin(b.phase) * b.bob;
            if (U.dist(p.x, p.y, b.x, y) < b.r + 6) {
              hit = i;
              break;
            }
          }
          if (hit >= 0) {
            const b = balloons[hit];
            balloons.splice(hit, 1);
            popBalloon(b);
          } else {
            combo = 0;
            misses++;
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
