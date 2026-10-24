/* ============ Мини-игра 10: Повтори за Тимкой ============ */
(function () {
  'use strict';
  const U = window.U;
  const TONES = [392, 494, 587, 784];

  Minigames.register({
    id: 'simon',
    title: 'Повтори за Тимкой',
    emoji: '🎵',
    desc: 'Смотри, какие лапки светятся, и повторяй мелодию. Сколько раундов осилишь?',
    rate: 0.6,
    winTitle: 'Мелодия окончена!',

    start(api) {
      const wrap = document.createElement('div');
      wrap.className = 'simon-wrap';
      wrap.innerHTML =
        '<div class="simon-msg" id="simonMsg">Приготовься…</div>' +
        '<div class="simon-grid">' +
        '<button class="simon-pad p0" data-p="0">🐾</button>' +
        '<button class="simon-pad p1" data-p="1">🌰</button>' +
        '<button class="simon-pad p2" data-p="2">🍄</button>' +
        '<button class="simon-pad p3" data-p="3">💧</button>' +
        '</div>' +
        '<div class="mg-tip">Нажимай лапки в том же порядке. С каждым раундом мелодия длиннее!</div>';
      api.root.appendChild(wrap);

      const pads = Array.from(wrap.querySelectorAll('.simon-pad'));
      const msg = wrap.querySelector('#simonMsg');
      const seq = [];
      let round = 0;
      let cleared = 0;
      let phase = 'idle';
      let inputIdx = 0;
      let dead = false;
      const timers = [];

      api.status('Раунд 0');

      function later(fn, ms) {
        const id = setTimeout(() => {
          if (!dead) fn();
        }, ms);
        timers.push(id);
        return id;
      }

      function flash(p, weak) {
        const pad = pads[p];
        pad.classList.add('lit');
        if (!weak) U.Sound.tone(TONES[p], 0.2, 'sine', 0.09);
        later(() => pad.classList.remove('lit'), 260);
      }

      function nextRound() {
        round++;
        inputIdx = 0;
        seq.push(U.randInt(0, 3));
        api.status('Раунд ' + round);
        msg.textContent = 'Раунд ' + round + ' — смотри…';
        phase = 'show';
        let i = 0;
        const playStep = () => {
          if (dead) return;
          if (i >= seq.length) {
            phase = 'input';
            msg.textContent = 'Твой ход! Повтори 👆';
            return;
          }
          flash(seq[i], false);
          i++;
          later(playStep, 470);
        };
        later(playStep, 600);
      }

      wrap.querySelector('.simon-grid').addEventListener(
        'click',
        (e) => {
          const pad = e.target.closest('.simon-pad');
          if (!pad || dead) return;
          if (phase !== 'input') {
            U.Sound.tap();
            return;
          }
          const p = Number(pad.dataset.p);
          flash(p, false);
          if (seq[inputIdx] === p) {
            inputIdx++;
            if (inputIdx >= seq.length) {
              phase = 'idle';
              cleared = round;
              U.Sound.happy();
              msg.textContent = 'Верно! 🎉';
              later(nextRound, 900);
            }
          } else {
            phase = 'idle';
            U.Sound.fail();
            msg.textContent = 'Ой, не та лапка… 🙈';
            later(() => {
              if (dead) return;
              dead = true;
              api.finish(cleared);
            }, 800);
          }
        },
        { signal: api.signal }
      );

      later(nextRound, 700);

      function stop() {
        dead = true;
        timers.forEach((id) => clearTimeout(id));
        pads.forEach((p) => p.classList.remove('lit'));
      }
      return stop;
    },
  });
})();
