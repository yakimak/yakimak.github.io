/* ============ Мини-игра 3: Найди пару ============ */
(function () {
  'use strict';
  const U = window.U;
  const SYMBOLS = ['🦴', '🐾', '🌲', '🍄', '🐟', '🦋', '🍯', '⭐'];

  Minigames.register({
    id: 'memory',
    title: 'Найди пару',
    emoji: '🃏',
    desc: 'Открывай карточки и находи одинаковые пары. Чем меньше ходов, тем больше очков.',
    rate: 0.55,
    winTitle: 'Все пары найдены!',

    start(api) {
      const pairs = SYMBOLS.slice();
      const deck = pairs.concat(pairs).sort(() => Math.random() - 0.5);

      const wrap = document.createElement('div');
      wrap.className = 'game-wrap';
      wrap.innerHTML =
        '<div class="mem-hud"><span>Пары: <b id="mgPairs">0</b>/8</span><span>Ходы: <b id="mgMoves">0</b></span><span>Время: <b id="mgTime">0</b>с</span></div>' +
        '<div class="mem-grid"></div>' +
        '<div class="mg-tip">Нажимай на карточки — они переворачиваются. Найди все 8 пар!</div>';
      api.root.appendChild(wrap);

      const grid = wrap.querySelector('.mem-grid');
      const elPairs = wrap.querySelector('#mgPairs');
      const elMoves = wrap.querySelector('#mgMoves');
      const elTime = wrap.querySelector('#mgTime');

      deck.forEach((sym, i) => {
        const card = document.createElement('button');
        card.className = 'mem-card';
        card.dataset.i = String(i);
        card.dataset.sym = sym;
        card.innerHTML = '<div class="face back"></div><div class="face front">' + sym + '</div>';
        card.setAttribute('aria-label', 'Карточка');
        grid.appendChild(card);
      });

      let first = null;
      let lock = false;
      let matches = 0;
      let moves = 0;
      let started = performance.now();
      let dead = false;
      let done = false;
      const timers = [];

      api.status('Пары: 0/8');

      function later(fn, ms) {
        const id = setTimeout(() => {
          if (!dead) fn();
        }, ms);
        timers.push(id);
        return id;
      }

      const timer = setInterval(() => {
        if (dead) return;
        elTime.textContent = String(Math.floor((performance.now() - started) / 1000));
      }, 400);

      function finishGame() {
        if (done) return;
        done = true;
        const sec = (performance.now() - started) / 1000;
        const score = 80 + Math.max(0, 100 - moves * 4) + Math.max(0, 50 - Math.round(sec / 2));
        api.finish(score);
      }

      function onClick(e) {
        const card = e.target.closest('.mem-card');
        if (!card || lock || dead || card.classList.contains('flip') || card.classList.contains('done')) return;
        card.classList.add('flip');
        U.Sound.tap();

        if (!first) {
          first = card;
          return;
        }

        moves++;
        elMoves.textContent = String(moves);

        if (first.dataset.sym === card.dataset.sym) {
          const a = first;
          const b = card;
          first = null;
          a.classList.add('done');
          b.classList.add('done');
          matches++;
          elPairs.textContent = String(matches);
          api.status('Пары: ' + matches + '/8');
          U.Sound.coin();
          if (matches === 8) later(finishGame, 500);
        } else {
          lock = true;
          U.Sound.fail();
          const a = first;
          first = null;
          later(() => {
            a.classList.remove('flip');
            card.classList.remove('flip');
            lock = false;
          }, 750);
        }
      }

      grid.addEventListener('click', onClick, { signal: api.signal });

      function stop() {
        dead = true;
        clearInterval(timer);
        timers.forEach((id) => clearTimeout(id));
      }
      return stop;
    },
  });
})();
