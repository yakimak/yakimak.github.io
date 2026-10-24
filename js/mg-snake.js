/* ============ Мини-игра 7: Змейка-волчонок ============ */
(function () {
  'use strict';
  const U = window.U;
  const CELL = 30, COLS = 30, ROWS = 18;
  const W = CELL * COLS, H = CELL * ROWS;

  Minigames.register({
    id: 'snake',
    title: 'Змейка-волчонок',
    emoji: '🐍',
    desc: 'Собирай ягоды и не кусай себя за хвост. Стрелки, свайпы или кнопки.',
    rate: 1.3,
    winTitle: 'Забег змейки окончен!',

    start(api) {
      const wrap = document.createElement('div');
      wrap.className = 'game-wrap';
      const cv = document.createElement('canvas');
      cv.width = W;
      cv.height = H;
      cv.style.maxHeight = 'calc(100% - 116px)';
      wrap.appendChild(cv);
      const pad = document.createElement('div');
      pad.className = 'dpad';
      pad.innerHTML =
        '<button class="up" data-d="up">▲</button>' +
        '<button class="left" data-d="left">◀</button>' +
        '<button class="down" data-d="down">▼</button>' +
        '<button class="right" data-d="right">▶</button>';
      wrap.appendChild(pad);
      api.root.appendChild(wrap);
      const ctx = cv.getContext('2d');

      let snake = [{ x: 12, y: 9 }, { x: 11, y: 9 }, { x: 10, y: 9 }];
      let dir = { x: 1, y: 0 };
      let queue = [];
      let food = { x: 20, y: 9, type: 'berry' };
      let score = 0;
      let stepT = 0;
      let step = 0.17;
      let dead = false;
      let grow = false;
      let eatFx = 0;
      let shake = 0;
      const particles = [];

      api.status('0');

      function placeFood() {
        let tries = 0;
        while (tries++ < 300) {
          const f = { x: U.randInt(0, COLS - 1), y: U.randInt(0, ROWS - 1), type: Math.random() < 0.14 ? 'gold' : 'berry' };
          if (!snake.some((s) => s.x === f.x && s.y === f.y)) {
            food = f;
            return;
          }
        }
      }

      function setDir(nx, ny) {
        const last = queue.length ? queue[queue.length - 1] : dir;
        if (last.x === -nx && last.y === -ny) return;
        if (last.x === nx && last.y === ny) return;
        if (queue.length < 2) queue.push({ x: nx, y: ny });
      }

      function gameOver() {
        if (dead) return;
        dead = true;
        U.Sound.fail();
        stopLoop();
        api.finish(score);
      }

      function tick() {
        if (queue.length) dir = queue.shift();
        const head = snake[0];
        const nx = head.x + dir.x;
        const ny = head.y + dir.y;
        if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) return gameOver();
        const bodyToCheck = grow ? snake : snake.slice(0, snake.length - 1);
        if (bodyToCheck.some((s) => s.x === nx && s.y === ny)) return gameOver();

        snake.unshift({ x: nx, y: ny });
        if (nx === food.x && ny === food.y) {
          score += food.type === 'gold' ? 3 : 1;
          grow = true;
          eatFx = 1;
          shake = 0.12;
          U.Sound.coin();
          for (let i = 0; i < 10; i++) {
            const a = U.rand(0, U.TAU);
            particles.push({
              x: nx * CELL + CELL / 2,
              y: ny * CELL + CELL / 2,
              vx: Math.cos(a) * U.rand(30, 150),
              vy: Math.sin(a) * U.rand(30, 150),
              life: U.rand(0.25, 0.6),
              max: 0.6,
              color: food.type === 'gold' ? '#ffd54f' : '#ff7b95',
              r: U.rand(2, 5),
            });
          }
          placeFood();
          step = Math.max(0.085, step - 0.004);
          api.status(String(score));
        }
        if (grow) grow = false;
        else snake.pop();
      }

      function drawHead(cx, cy, t) {
        ctx.save();
        ctx.translate(cx, cy);
        const ang = Math.atan2(dir.y, dir.x);
        ctx.rotate(ang + Math.PI / 2);
        // уши
        ctx.fillStyle = '#8fa2ba';
        [-1, 1].forEach((side) => {
          ctx.beginPath();
          ctx.moveTo(side * 8, -11);
          ctx.lineTo(side * 15, -22);
          ctx.lineTo(side * 18, -6);
          ctx.closePath();
          ctx.fill();
        });
        // голова
        const g = ctx.createLinearGradient(0, -14, 0, 14);
        g.addColorStop(0, '#c6d4e4');
        g.addColorStop(1, '#93a6bf');
        ctx.fillStyle = g;
        U.circle(ctx, 0, 0, 14);
        ctx.fill();
        // морда
        ctx.fillStyle = '#eef4fa';
        U.ellipse(ctx, 0, 8, 9, 6);
        ctx.fill();
        ctx.fillStyle = '#344050';
        U.circle(ctx, 0, 10, 3.4);
        ctx.fill();
        // глаза
        ctx.fillStyle = '#fff';
        U.circle(ctx, -5, -3, 4.6);
        ctx.fill();
        U.circle(ctx, 5, -3, 4.6);
        ctx.fill();
        ctx.fillStyle = '#f6b64a';
        U.circle(ctx, -5, -3, 2.4);
        ctx.fill();
        U.circle(ctx, 5, -3, 2.4);
        ctx.fill();
        ctx.fillStyle = '#2b2118';
        U.circle(ctx, -5, -2.5, 1.2);
        ctx.fill();
        U.circle(ctx, 5, -2.5, 1.2);
        ctx.fill();
        ctx.restore();
      }

      function drawBoard(t) {
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#1c3a2c');
        g.addColorStop(1, '#122a20');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        // сетка
        ctx.strokeStyle = 'rgba(150,220,170,.06)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= COLS; x++) {
          ctx.beginPath();
          ctx.moveTo(x * CELL, 0);
          ctx.lineTo(x * CELL, H);
          ctx.stroke();
        }
        for (let y = 0; y <= ROWS; y++) {
          ctx.beginPath();
          ctx.moveTo(0, y * CELL);
          ctx.lineTo(W, y * CELL);
          ctx.stroke();
        }
        // декоративные листья
        ctx.fillStyle = 'rgba(120,200,140,.07)';
        for (let i = 0; i < 14; i++) {
          const x = (i * 191) % W;
          const y = (i * 127) % H;
          U.ellipse(ctx, x, y, 22, 9, (i % 3) * 0.7);
          ctx.fill();
        }
      }

      function drawFood(t) {
        const cx = food.x * CELL + CELL / 2;
        const cy = food.y * CELL + CELL / 2 + Math.sin(t * 3) * 2;
        ctx.save();
        ctx.translate(cx, cy);
        const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 26);
        glow.addColorStop(0, food.type === 'gold' ? 'rgba(255,220,120,.5)' : 'rgba(255,140,160,.4)');
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        U.circle(ctx, 0, 0, 26);
        ctx.fill();
        if (food.type === 'gold') {
          ctx.fillStyle = '#ffd76a';
          U.starPath(ctx, 0, 0, 12, 5, 5, Math.sin(t) * 0.2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,.8)';
          U.circle(ctx, -3, -4, 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#e85d75';
          U.circle(ctx, 0, 2, 8);
          ctx.fill();
          U.circle(ctx, -6, -4, 6);
          ctx.fill();
          U.circle(ctx, 6, -4, 6);
          ctx.fill();
          U.circle(ctx, 0, -9, 5);
          ctx.fill();
          ctx.fillStyle = '#4c8a63';
          ctx.beginPath();
          ctx.ellipse(4, -13, 5, 3, -0.5, 0, U.TAU);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,.6)';
          U.circle(ctx, -2, -2, 1.6);
          ctx.fill();
        }
        ctx.restore();
      }

      function drawSnake(t) {
        for (let i = snake.length - 1; i >= 0; i--) {
          const s = snake[i];
          const cx = s.x * CELL + CELL / 2;
          const cy = s.y * CELL + CELL / 2;
          const k = i / Math.max(1, snake.length);
          if (i === 0) {
            drawHead(cx, cy, t);
          } else {
            const g = ctx.createRadialGradient(cx - 4, cy - 4, 1, cx, cy, 14);
            g.addColorStop(0, '#c2d1e3');
            g.addColorStop(1, i % 2 ? '#8ea1ba' : '#9bafc7');
            ctx.fillStyle = g;
            U.circle(ctx, cx, cy, 12.5 - k * 2.5);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,.35)';
            U.circle(ctx, cx - 3, cy - 3, 2.4);
            ctx.fill();
          }
        }
      }

      const stopLoop = Minigames.loop((dt) => {
        if (dead) return;
        const t = performance.now() / 1000;
        stepT += dt;
        while (stepT >= step && !dead) {
          stepT -= step;
          tick();
        }
        if (dead) return;
        if (eatFx > 0) eatFx = Math.max(0, eatFx - dt * 3);
        if (shake > 0) shake = Math.max(0, shake - dt);
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life -= dt;
          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= 0.96;
          p.vy *= 0.96;
        }

        ctx.save();
        ctx.clearRect(0, 0, W, H);
        if (shake > 0) ctx.translate(U.rand(-3, 3) * shake * 10, U.rand(-3, 3) * shake * 10);
        drawBoard(t);
        drawFood(t);
        drawSnake(t);
        particles.forEach((p) => {
          ctx.globalAlpha = U.clamp(p.life / p.max, 0, 1);
          ctx.fillStyle = p.color;
          U.circle(ctx, p.x, p.y, p.r);
          ctx.fill();
          ctx.globalAlpha = 1;
        });
        // HUD
        ctx.fillStyle = 'rgba(8,20,14,.55)';
        U.rr(ctx, 12, 12, 140, 40, 12);
        ctx.fill();
        ctx.fillStyle = '#ffe1a6';
        U.text(ctx, '🍓 ' + score, 28, 33, { size: 19, weight: 900, align: 'left' });
        ctx.fillStyle = 'rgba(255,255,255,.5)';
        U.text(ctx, 'длина: ' + snake.length, W - 18, 32, { size: 13, weight: 700, align: 'right' });
        ctx.restore();
      });

      pad.addEventListener(
        'click',
        (e) => {
          const b = e.target.closest('button');
          if (!b) return;
          const d = b.dataset.d;
          if (d === 'up') setDir(0, -1);
          if (d === 'down') setDir(0, 1);
          if (d === 'left') setDir(-1, 0);
          if (d === 'right') setDir(1, 0);
          U.Sound.tap();
        },
        { signal: api.signal }
      );

      Minigames.bindKeys(
        (e) => {
          const k = e.key.toLowerCase();
          if (k === 'arrowup' || k === 'w' || k === 'ц') {
            e.preventDefault();
            setDir(0, -1);
          } else if (k === 'arrowdown' || k === 's' || k === 'ы') {
            e.preventDefault();
            setDir(0, 1);
          } else if (k === 'arrowleft' || k === 'a' || k === 'ф') {
            e.preventDefault();
            setDir(-1, 0);
          } else if (k === 'arrowright' || k === 'd' || k === 'в') {
            e.preventDefault();
            setDir(1, 0);
          }
        },
        api.signal
      );

      // свайпы
      let startPt = null;
      cv.addEventListener(
        'pointerdown',
        (e) => {
          const r = cv.getBoundingClientRect();
          startPt = { x: e.clientX, y: e.clientY };
          cv.setPointerCapture(e.pointerId);
        },
        { signal: api.signal }
      );
      cv.addEventListener(
        'pointerup',
        (e) => {
          if (!startPt) return;
          const dx = e.clientX - startPt.x;
          const dy = e.clientY - startPt.y;
          startPt = null;
          if (Math.hypot(dx, dy) < 22) return;
          if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0);
          else setDir(0, dy > 0 ? 1 : -1);
        },
        { signal: api.signal }
      );

      placeFood();

      function stop() {
        stopLoop();
      }
      return stop;
    },
  });
})();
