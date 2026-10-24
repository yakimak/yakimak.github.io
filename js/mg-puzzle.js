/* ============ Мини-игра 8: Пазл с Тимкой ============ */
(function () {
  'use strict';
  const U = window.U;

  Minigames.register({
    id: 'puzzle',
    title: 'Пазл с Тимкой',
    emoji: '🧩',
    desc: 'Передвигай кусочки и собери портрет волчонка. Подсказка — рядом!',
    rate: 0.5,
    winTitle: 'Пазл собран!',

    start(api) {
      const S = 480;
      const src = document.createElement('canvas');
      src.width = S;
      src.height = S;
      const c = src.getContext('2d');

      // картинка пазла
      const g = c.createLinearGradient(0, 0, S, S);
      g.addColorStop(0, '#2b2350');
      g.addColorStop(0.5, '#503a78');
      g.addColorStop(1, '#8a5b8f');
      c.fillStyle = g;
      c.fillRect(0, 0, S, S);
      // звёзды
      for (let i = 0; i < 50; i++) {
        const x = (i * 137.3) % S;
        const y = (i * 83.7) % S;
        c.fillStyle = 'rgba(255,240,190,' + (0.2 + 0.65 * Math.abs(Math.sin(i * 1.7))) + ')';
        U.circle(c, x, y, i % 7 === 0 ? 2.4 : 1.3);
        c.fill();
      }
      // луна
      c.fillStyle = 'rgba(255,242,190,.9)';
      U.circle(c, 390, 88, 40);
      c.fill();
      c.fillStyle = '#503a78';
      U.circle(c, 375, 76, 30);
      c.fill();
      // сердце
      c.fillStyle = 'rgba(255,140,170,.85)';
      U.heartPath(c, 100, 90, 28, -0.2);
      c.fill();
      // волк
      c.save();
      c.translate(240, 258);
      c.scale(1.35, 1.35);
      // уши
      [-1, 1].forEach((side) => {
        c.save();
        c.translate(side * 48, -54);
        c.rotate(side * 0.08);
        c.fillStyle = '#b9c8da';
        c.beginPath();
        c.moveTo(-27, 12);
        c.quadraticCurveTo(-44, -44, -8, -76);
        c.quadraticCurveTo(26, -38, 27, 10);
        c.closePath();
        c.fill();
        c.fillStyle = '#eaa9b7';
        c.beginPath();
        c.moveTo(-14, 4);
        c.quadraticCurveTo(-24, -34, -5, -55);
        c.quadraticCurveTo(13, -30, 14, 2);
        c.closePath();
        c.fill();
        c.restore();
      });
      // голова
      const hg = c.createLinearGradient(-70, -90, 60, 60);
      hg.addColorStop(0, '#cbd7e5');
      hg.addColorStop(0.55, '#a8b9ce');
      hg.addColorStop(1, '#93a6bf');
      c.fillStyle = hg;
      U.ellipse(c, 0, -4, 86, 78);
      c.fill();
      // щёки
      c.fillStyle = '#a2b4ca';
      [-1, 1].forEach((side) => {
        c.beginPath();
        c.moveTo(side * 78, -18);
        c.lineTo(side * 100, -2);
        c.lineTo(side * 80, 10);
        c.lineTo(side * 98, 26);
        c.lineTo(side * 72, 34);
        c.lineTo(side * 64, 6);
        c.closePath();
        c.fill();
      });
      // морда
      c.fillStyle = '#f2f7fc';
      U.ellipse(c, 0, 30, 49, 36);
      c.fill();
      // глаза
      [-1, 1].forEach((side) => {
        c.fillStyle = '#fff';
        U.ellipse(c, side * 35, -18, 21, 23);
        c.fill();
        c.fillStyle = '#f6b64a';
        U.circle(c, side * 35, -18, 11);
        c.fill();
        c.fillStyle = '#2b2118';
        U.circle(c, side * 35, -17, 5.5);
        c.fill();
        c.fillStyle = '#fff';
        U.circle(c, side * 35 - 4, -22, 3.4);
        c.fill();
        c.strokeStyle = 'rgba(58,72,92,.45)';
        c.lineWidth = 2.5;
        U.ellipse(c, side * 35, -18, 21, 23);
        c.stroke();
      });
      // нос и улыбка
      c.fillStyle = '#344050';
      c.beginPath();
      c.moveTo(-13, 8);
      c.quadraticCurveTo(-14, 2, -7, 1);
      c.lineTo(7, 1);
      c.quadraticCurveTo(14, 2, 13, 8);
      c.quadraticCurveTo(9, 18, 0, 20);
      c.quadraticCurveTo(-9, 18, -13, 8);
      c.closePath();
      c.fill();
      c.strokeStyle = 'rgba(60,72,92,.7)';
      c.lineWidth = 3.4;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(0, 20);
      c.lineTo(0, 27);
      c.moveTo(-15, 32);
      c.quadraticCurveTo(-7, 41, 0, 34);
      c.quadraticCurveTo(7, 41, 15, 32);
      c.stroke();
      // румянец
      c.fillStyle = 'rgba(244,143,162,.4)';
      U.ellipse(c, -54, 24, 16, 9);
      c.fill();
      U.ellipse(c, 54, 24, 16, 9);
      c.fill();
      c.restore();
      // подпись
      c.save();
      c.font = '900 40px "Segoe UI", system-ui, sans-serif';
      c.textAlign = 'center';
      c.fillStyle = 'rgba(255,240,200,.95)';
      c.shadowColor = 'rgba(30,20,50,.6)';
      c.shadowBlur = 12;
      c.fillText('ТИМКА', 240, 440);
      c.restore();
      // рамка
      c.strokeStyle = 'rgba(255,255,255,.25)';
      c.lineWidth = 6;
      c.strokeRect(12, 12, S - 24, S - 24);

      const url = src.toDataURL('image/png');

      const wrap = document.createElement('div');
      wrap.className = 'puzzle-wrap';
      wrap.innerHTML =
        '<div class="puzzle-board"></div>' +
        '<div class="puzzle-side">' +
        '<img class="puzzle-ref" alt="Подсказка" src="' + url + '">' +
        '<div class="puzzle-info">Ходы: <b id="pzMoves">0</b> · Время: <b id="pzTime">0</b>с</div>' +
        '<button class="btn" id="pzShuffle">Перемешать заново</button>' +
        '<div class="puzzle-info">Нажми на кусочек рядом с пустым местом, чтобы передвинуть его.</div>' +
        '</div>';
      api.root.appendChild(wrap);

      const board = wrap.querySelector('.puzzle-board');
      const elMoves = wrap.querySelector('#pzMoves');
      const elTime = wrap.querySelector('#pzTime');
      let tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      let moves = 0;
      let started = performance.now();
      let dead = false;
      let done = false;
      let lock = false;

      api.status('0 ходов');

      function solved() {
        return tiles.every((v, i) => v === i);
      }

      function render() {
        board.innerHTML = '';
        tiles.forEach((v, i) => {
          const div = document.createElement('div');
          if (v === 8) {
            div.className = 'pz-tile empty';
          } else {
            const col = v % 3;
            const row = Math.floor(v / 3);
            div.className = 'pz-tile';
            div.style.backgroundImage = 'url(' + url + ')';
            div.style.backgroundSize = '300% 300%';
            div.style.backgroundPosition = col * 50 + '% ' + row * 50 + '%';
            div.dataset.i = String(i);
          }
          board.appendChild(div);
        });
      }

      function shuffle() {
        tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        for (let k = 0; k < 120; k++) {
          const blank = tiles.indexOf(8);
          const bx = blank % 3;
          const by = Math.floor(blank / 3);
          const options = [];
          if (bx > 0) options.push(blank - 1);
          if (bx < 2) options.push(blank + 1);
          if (by > 0) options.push(blank - 3);
          if (by < 2) options.push(blank + 3);
          const pick = U.choice(options);
          tiles[blank] = tiles[pick];
          tiles[pick] = 8;
        }
        if (solved()) shuffle();
        moves = 0;
        done = false;
        lock = false;
        started = performance.now();
        elMoves.textContent = '0';
        api.status('0 ходов');
        render();
      }

      function finishGame() {
        if (done) return;
        done = true;
        const sec = (performance.now() - started) / 1000;
        const score = Math.max(25, Math.round(300 - moves * 4 - sec * 1.5));
        api.finish(score);
      }

      board.addEventListener(
        'click',
        (e) => {
          if (dead || done || lock) return;
          const t = e.target.closest('.pz-tile');
          if (!t || t.classList.contains('empty')) return;
          const i = Number(t.dataset.i);
          const blank = tiles.indexOf(8);
          const ix = i % 3, iy = Math.floor(i / 3);
          const bx = blank % 3, by = Math.floor(blank / 3);
          const adjacent = Math.abs(ix - bx) + Math.abs(iy - by) === 1;
          if (!adjacent) return;
          tiles[blank] = tiles[i];
          tiles[i] = 8;
          moves++;
          elMoves.textContent = String(moves);
          api.status(moves + ' ходов');
          U.Sound.tap();
          render();
          if (solved()) {
            lock = true;
            U.Sound.happy();
            setTimeout(() => {
              if (!dead) finishGame();
            }, 420);
          }
        },
        { signal: api.signal }
      );

      wrap.querySelector('#pzShuffle').addEventListener(
        'click',
        () => {
          if (dead) return;
          U.Sound.click();
          shuffle();
        },
        { signal: api.signal }
      );

      const timer = setInterval(() => {
        if (dead || done) return;
        elTime.textContent = String(Math.floor((performance.now() - started) / 1000));
      }, 500);

      shuffle();

      function stop() {
        dead = true;
        clearInterval(timer);
      }
      return stop;
    },
  });
})();
