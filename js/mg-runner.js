/* ============ Мини-игра 5: Лесной забег ============ */
(function () {
  'use strict';
  const U = window.U;
  const W = 960, H = 420;
  const GROUND = 336;

  Minigames.register({
    id: 'runner',
    title: 'Лесной забег',
    emoji: '🏃',
    desc: 'Прыгай через пни и собирай ягоды. Чем дальше — тем быстрее!',
    rate: 0.2,
    winTitle: 'Забег окончен!',

    start(api) {
      const { canvas, ctx } = Minigames.canvas(api.root, W, H);
      const wolfX = 180;
      let jumpY = 0;
      let vy = 0;
      let onGround = true;
      let runPhase = 0;
      let speed = 330;
      let distance = 0;
      let berries = 0;
      let score = 0;
      let dead = false;
      let spawnTimer = 1.2;
      let elapsed = 0;
      const obstacles = [];
      const berryList = [];
      const puffs = [];
      const treesFar = [];
      const treesNear = [];
      for (let i = 0; i < 14; i++) treesFar.push({ x: i * 90, h: U.rand(60, 120), s: U.rand(0.7, 1) });
      for (let i = 0; i < 10; i++) treesNear.push({ x: i * 140, h: U.rand(100, 170), s: U.rand(0.8, 1.2) });

      api.status('0');

      function jump() {
        if (dead) return;
        if (onGround) {
          vy = -790;
          onGround = false;
          U.Sound.jump();
          for (let i = 0; i < 6; i++) {
            puffs.push({ x: wolfX + U.rand(-20, 20), y: GROUND - 4, vx: U.rand(-80, -20), vy: U.rand(-40, 10), life: 0.4, max: 0.4, r: U.rand(3, 7) });
          }
        }
      }

      function spawn() {
        const r = Math.random();
        if (r < 0.22) {
          berryList.push({ x: W + 60, y: U.rand(0, 1) < 0.5 ? GROUND - 50 : GROUND - 150, got: false, phase: U.rand(0, U.TAU) });
        } else if (r < 0.5) {
          obstacles.push({ x: W + 60, w: U.rand(40, 60), h: U.rand(40, 64), type: 'stump' });
        } else {
          obstacles.push({ x: W + 60, w: U.rand(52, 70), h: U.rand(28, 40), type: 'rock' });
        }
      }

      function hitTest(o) {
        const bx = wolfX - 26;
        const bw = 60;
        const by = GROUND - jumpY - 118;
        const bh = 112;
        return bx + bw > o.x + 4 && bx < o.x + o.w - 4 && by + bh > GROUND - o.h + 4;
      }

      function update(dt) {
        elapsed += dt;
        speed = Math.min(620, 330 + elapsed * 9);
        distance += speed * dt;
        runPhase += dt * (11 + speed / 120);
        score = Math.floor(distance / 12) + berries * 5;
        api.status(String(score));

        // физика прыжка
        if (!onGround) {
          vy += 2300 * dt;
          jumpY -= vy * dt;
          if (jumpY <= 0) {
            jumpY = 0;
            vy = 0;
            onGround = true;
          }
        }

        // спавн
        spawnTimer -= dt;
        if (spawnTimer <= 0) {
          spawn();
          spawnTimer = U.rand(0.75, 1.35) * (420 / speed);
        }

        // препятствия
        for (let i = obstacles.length - 1; i >= 0; i--) {
          const o = obstacles[i];
          o.x -= speed * dt;
          if (o.x + o.w < -40) {
            obstacles.splice(i, 1);
            continue;
          }
          if (hitTest(o)) {
            dead = true;
            U.Sound.fail();
            stopLoop();
            api.finish(score);
            return;
          }
        }

        // ягоды
        for (let i = berryList.length - 1; i >= 0; i--) {
          const b = berryList[i];
          b.x -= speed * dt;
          b.phase += dt * 3;
          if (b.x < -30) {
            berryList.splice(i, 1);
            continue;
          }
          const wy = GROUND - jumpY - 60;
          if (Math.abs(b.x - wolfX) < 44 && Math.abs(b.y - wy) < 62) {
            berryList.splice(i, 1);
            berries++;
            U.Sound.coin();
            for (let k = 0; k < 6; k++) {
              puffs.push({
                x: b.x,
                y: b.y,
                vx: U.rand(-90, 90),
                vy: U.rand(-160, -40),
                life: 0.5,
                max: 0.5,
                r: U.rand(2, 4),
                color: '#ffcf6a',
              });
            }
          }
        }

        for (let i = puffs.length - 1; i >= 0; i--) {
          const p = puffs[i];
          p.life -= dt;
          if (p.life <= 0) {
            puffs.splice(i, 1);
            continue;
          }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 300 * dt;
        }
      }

      function drawWolf(t) {
        const y = GROUND - jumpY;
        U.groundShadow(ctx, wolfX, GROUND + 2, 54 - jumpY * 0.1, 12, 0.25);
        ctx.save();
        ctx.translate(wolfX, y);
        // хвост
        ctx.strokeStyle = '#8fa2ba';
        ctx.lineWidth = 15;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-36, -72);
        ctx.quadraticCurveTo(-70, -86 + Math.sin(t * 14) * 8, -62, -110);
        ctx.stroke();
        ctx.fillStyle = '#e9f0f8';
        U.circle(ctx, -62, -110, 9);
        ctx.fill();
        // лапы
        const legPhase = runPhase;
        ctx.strokeStyle = '#7f92ab';
        ctx.lineWidth = 11;
        [-18, 8].forEach((lx, i) => {
          const swing = Math.sin(legPhase + i * Math.PI) * (onGround ? 20 : 8);
          ctx.beginPath();
          ctx.moveTo(lx, -34);
          ctx.lineTo(lx + swing, -2);
          ctx.stroke();
          ctx.fillStyle = '#dbe5f0';
          U.ellipse(ctx, lx + swing, -2, 9, 5);
          ctx.fill();
        });
        // тело
        const bodyG = ctx.createLinearGradient(-40, -110, 40, -20);
        bodyG.addColorStop(0, '#c4d2e2');
        bodyG.addColorStop(1, '#8fa2ba');
        ctx.fillStyle = bodyG;
        U.ellipse(ctx, 0, -64, 48, 38);
        ctx.fill();
        ctx.fillStyle = '#eef4fa';
        U.ellipse(ctx, 6, -52, 30, 22);
        ctx.fill();
        // голова
        ctx.save();
        ctx.translate(38, -98 + Math.sin(legPhase * 2) * 2);
        ctx.fillStyle = '#b9c8da';
        U.circle(ctx, 0, 0, 30);
        ctx.fill();
        // ухо
        ctx.fillStyle = '#9aadc4';
        ctx.beginPath();
        ctx.moveTo(-12, -22);
        ctx.lineTo(-20, -48);
        ctx.lineTo(4, -28);
        ctx.closePath();
        ctx.fill();
        // морда
        ctx.fillStyle = '#f0f5fb';
        U.ellipse(ctx, 18, 8, 22, 14);
        ctx.fill();
        ctx.fillStyle = '#344050';
        U.circle(ctx, 34, 4, 6);
        ctx.fill();
        // глаз
        ctx.fillStyle = '#fff';
        U.circle(ctx, 6, -6, 6);
        ctx.fill();
        ctx.fillStyle = '#f6b64a';
        U.circle(ctx, 8, -6, 3.4);
        ctx.fill();
        ctx.fillStyle = '#2b2118';
        U.circle(ctx, 8.6, -6, 1.8);
        ctx.fill();
        ctx.restore();
        // лапки передние
        ctx.strokeStyle = '#a2b4ca';
        ctx.lineWidth = 10;
        const sw = Math.sin(legPhase + 1) * (onGround ? 16 : 6);
        ctx.beginPath();
        ctx.moveTo(26, -54);
        ctx.lineTo(40 + sw, -26);
        ctx.stroke();
        ctx.restore();
      }

      function drawScene(t) {
        const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
        sky.addColorStop(0, '#8fd0ea');
        sky.addColorStop(0.6, '#cdeedd');
        sky.addColorStop(1, '#f4eccb');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, W, GROUND);
        // солнце
        ctx.fillStyle = 'rgba(255,244,190,.9)';
        U.circle(ctx, 800, 70, 40);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,244,190,.2)';
        U.circle(ctx, 800, 70, 70);
        ctx.fill();
        // облака
        ctx.fillStyle = 'rgba(255,255,255,.7)';
        [[120, 70, 1], [420, 50, 0.7], [650, 110, 0.55]].forEach(([x, y, s]) => {
          U.ellipse(ctx, x - ((t * 8) % 1300), y, 60 * s, 14 * s);
          ctx.fill();
          U.ellipse(ctx, x + 34 * s - ((t * 8) % 1300), y - 8 * s, 40 * s, 12 * s);
          ctx.fill();
        });
        // дальние горы
        ctx.fillStyle = '#a7c8c2';
        ctx.beginPath();
        ctx.moveTo(0, GROUND);
        ctx.lineTo(0, 250);
        ctx.lineTo(140, 170);
        ctx.lineTo(280, 260);
        ctx.lineTo(430, 160);
        ctx.lineTo(600, 258);
        ctx.lineTo(760, 186);
        ctx.lineTo(960, 258);
        ctx.lineTo(960, GROUND);
        ctx.closePath();
        ctx.fill();
        // дальний лес
        const off1 = (distance * 0.18) % 90;
        treesFar.forEach((tr) => {
          const x = ((tr.x - off1) % (W + 120) + W + 120) % (W + 120) - 60;
          ctx.fillStyle = 'rgba(74,120,106,.45)';
          ctx.beginPath();
          ctx.moveTo(x, GROUND);
          ctx.lineTo(x - 24 * tr.s, GROUND - 40 * tr.s);
          ctx.lineTo(x, GROUND - 110 * tr.s);
          ctx.lineTo(x + 24 * tr.s, GROUND - 40 * tr.s);
          ctx.closePath();
          ctx.fill();
        });
        // земля
        const gr = ctx.createLinearGradient(0, GROUND, 0, H);
        gr.addColorStop(0, '#83b36b');
        gr.addColorStop(0.15, '#6a9a58');
        gr.addColorStop(1, '#4a7141');
        ctx.fillStyle = gr;
        ctx.fillRect(0, GROUND, W, H - GROUND);
        ctx.fillStyle = 'rgba(255,255,255,.12)';
        for (let i = 0; i < 60; i++) {
          const x = ((i * 73 - distance * 0.6) % (W + 40) + W + 40) % (W + 40) - 20;
          ctx.fillRect(x, GROUND + 10 + (i % 5) * 12, 7, 2);
        }
        // ближний лес
        const off2 = (distance * 0.5) % 140;
        treesNear.forEach((tr) => {
          const x = ((tr.x - off2) % (W + 220) + W + 220) % (W + 220) - 80;
          ctx.fillStyle = '#3f6b4f';
          ctx.beginPath();
          ctx.moveTo(x, GROUND + 4);
          ctx.lineTo(x - 30 * tr.s, GROUND - 50 * tr.s);
          ctx.lineTo(x, GROUND - 130 * tr.s);
          ctx.lineTo(x + 30 * tr.s, GROUND - 50 * tr.s);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#5c4330';
          ctx.fillRect(x - 5, GROUND - 8, 10, 16);
        });
      }

      function drawObjects() {
        obstacles.forEach((o) => {
          if (o.type === 'stump') {
            ctx.fillStyle = '#7a5638';
            U.rr(ctx, o.x, GROUND - o.h, o.w, o.h, 10);
            ctx.fill();
            ctx.fillStyle = '#9c744b';
            U.ellipse(ctx, o.x + o.w / 2, GROUND - o.h, o.w / 2, 8);
            ctx.fill();
            ctx.strokeStyle = 'rgba(90,60,35,.5)';
            ctx.lineWidth = 2;
            U.ellipse(ctx, o.x + o.w / 2, GROUND - o.h, o.w / 3, 4);
            ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,.12)';
            ctx.fillRect(o.x + 6, GROUND - o.h + 12, 6, o.h - 18);
          } else {
            const g = ctx.createLinearGradient(o.x, GROUND - o.h, o.x, GROUND);
            g.addColorStop(0, '#9aa0a8');
            g.addColorStop(1, '#6f757e');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(o.x, GROUND);
            ctx.quadraticCurveTo(o.x + o.w * 0.1, GROUND - o.h, o.x + o.w * 0.5, GROUND - o.h);
            ctx.quadraticCurveTo(o.x + o.w * 0.92, GROUND - o.h * 0.8, o.x + o.w, GROUND);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,.2)';
            U.ellipse(ctx, o.x + o.w * 0.4, GROUND - o.h * 0.7, o.w * 0.16, o.h * 0.16);
            ctx.fill();
          }
        });
        berryList.forEach((b) => {
          const y = b.y + Math.sin(b.phase) * 4;
          ctx.fillStyle = '#4c8a63';
          ctx.strokeStyle = '#3d6b4d';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(b.x, y + 10);
          ctx.quadraticCurveTo(b.x + 6, y, b.x + 2, y - 12);
          ctx.stroke();
          ctx.fillStyle = '#e85d75';
          U.circle(ctx, b.x, y + 6, 9);
          ctx.fill();
          U.circle(ctx, b.x - 7, y, 7);
          ctx.fill();
          U.circle(ctx, b.x + 7, y, 7);
          ctx.fill();
          U.circle(ctx, b.x, y - 6, 6);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,.5)';
          U.circle(ctx, b.x - 3, y - 2, 2);
          ctx.fill();
        });
        puffs.forEach((p) => {
          ctx.globalAlpha = U.clamp(p.life / p.max, 0, 1);
          ctx.fillStyle = p.color || 'rgba(220,235,210,.7)';
          U.circle(ctx, p.x, p.y, p.r);
          ctx.fill();
          ctx.globalAlpha = 1;
        });
      }

      const stopLoop = Minigames.loop((dt) => {
        if (dead) return;
        const t = performance.now() / 1000;
        update(dt);
        if (dead) return;
        ctx.clearRect(0, 0, W, H);
        drawScene(t);
        drawObjects();
        drawWolf(t);
        // HUD
        ctx.fillStyle = 'rgba(20,40,30,.4)';
        U.rr(ctx, 20, 18, 200, 56, 16);
        ctx.fill();
        ctx.fillStyle = '#fff3cf';
        U.text(ctx, '🏃 ' + score, 40, 47, { size: 24, weight: 900, align: 'left', shadow: true });
        ctx.fillStyle = 'rgba(255,255,255,.85)';
        U.text(ctx, '🍓 ' + berries, 190, 47, { size: 17, weight: 800, align: 'left' });
        U.text(ctx, 'Пробел / клик — прыжок', W - 24, H - 18, {
          size: 13,
          weight: 700,
          align: 'right',
          color: 'rgba(255,255,255,.7)',
        });
      });

      Minigames.pointer(canvas, () => jump(), api.signal);
      Minigames.bindKeys(
        (e) => {
          if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'ц') {
            e.preventDefault();
            jump();
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
