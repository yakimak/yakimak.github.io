/* ============ Каркас мини-игр ============ */
(function () {
  'use strict';

  const U = window.U;
  const MG = (window.Minigames = {
    list: [],
    byId: {},
    isOpen: false,
  });

  MG.register = function (def) {
    MG.list.push(def);
    MG.byId[def.id] = def;
  };

  let els = null;
  let current = null;
  let ac = null;

  function $(id) {
    return document.getElementById(id);
  }

  function cache() {
    els = {
      overlay: $('minigames'),
      menu: $('mgMenu'),
      stage: $('mgStage'),
      root: $('mgRoot'),
      status: $('mgStatus'),
      result: $('mgResult'),
      resultTitle: $('mgResultTitle'),
      resultScore: $('mgResultScore'),
      resultSub: $('mgResultSub'),
      resultReward: $('mgResultReward'),
      close: $('mgClose'),
      back: $('mgBack'),
      again: $('mgAgain'),
      toMenu: $('mgToMenu'),
    };
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function renderMenu() {
    els.menu.innerHTML = MG.list
      .map((g) => {
        const best = window.Save ? Save.best(g.id) : 0;
        return (
          '<button class="mg-card" data-id="' + g.id + '">' +
          '<div class="mg-ico">' + g.emoji + '</div>' +
          '<div class="mg-name">' + esc(g.title) + '</div>' +
          '<div class="mg-desc">' + esc(g.desc) + '</div>' +
          '<div class="mg-best">' + (best > 0 ? '🏆 Рекорд: ' + best : 'Ещё не играли') + '</div>' +
          '</button>'
        );
      })
      .join('');
  }

  function bind() {
    els.menu.addEventListener('click', (e) => {
      const card = e.target.closest('.mg-card');
      if (!card) return;
      U.Sound.click();
      MG.start(card.dataset.id);
    });

    els.close.addEventListener('click', () => MG.close());
    els.back.addEventListener('click', () => {
      U.Sound.click();
      showMenu();
    });
    els.again.addEventListener('click', () => {
      U.Sound.click();
      if (current) MG.start(current.id);
    });
    els.toMenu.addEventListener('click', () => {
      U.Sound.click();
      showMenu();
    });
    els.overlay.addEventListener('click', (e) => {
      if (e.target === els.overlay) MG.close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && MG.isOpen) MG.close();
    });
  }

  function stopCleanup() {
    if (current && current.cleanup) {
      try {
        current.cleanup();
      } catch (e) {
        console.warn(e);
      }
      current.cleanup = null;
    }
    if (ac) {
      try {
        ac.abort();
      } catch (e) {
        /* ignore */
      }
      ac = null;
    }
  }

  function showMenu() {
    stopCleanup();
    current = null;
    renderMenu();
    els.menu.classList.remove('hidden');
    els.stage.classList.add('hidden');
    els.result.classList.add('hidden');
    els.root.innerHTML = '';
    MG.isOpen = true;
  }

  MG.open = function () {
    if (!els) {
      cache();
      bind();
      els.overlay.classList.remove('hidden');
      els.overlay.setAttribute('aria-hidden', 'false');
      showMenu();
      MG.isOpen = true;
      return;
    }
    els.overlay.classList.remove('hidden');
    els.overlay.setAttribute('aria-hidden', 'false');
    showMenu();
  };

  MG.close = function () {
    stopCleanup();
    current = null;
    MG.isOpen = false;
    if (els) {
      els.overlay.classList.add('hidden');
      els.overlay.setAttribute('aria-hidden', 'true');
      els.root.innerHTML = '';
    }
  };

  MG.start = function (id) {
    const def = MG.byId[id];
    if (!def) return;
    if (!els) {
      cache();
      bind();
    }
    stopCleanup();
    els.overlay.classList.remove('hidden');
    els.overlay.setAttribute('aria-hidden', 'false');
    MG.isOpen = true;

    els.menu.classList.add('hidden');
    els.stage.classList.remove('hidden');
    els.result.classList.add('hidden');
    els.root.innerHTML = '';
    els.status.textContent = '0';

    ac = new AbortController();
    const api = {
      signal: ac.signal,
      root: els.root,
      status(text) {
        els.status.textContent = text;
      },
      finish(score) {
        finish(score);
      },
    };

    let cleanup = null;
    try {
      cleanup = def.start(api);
    } catch (err) {
      console.error('Ошибка в мини-игре ' + id, err);
      els.root.innerHTML = '<div class="mg-tip">Не удалось запустить игру. Попробуй другую.</div>';
    }

    current = { id, def, cleanup: typeof cleanup === 'function' ? cleanup : null, finished: false, api };
  };

  function finish(score) {
    if (!current || current.finished) return;
    const def = current.def;
    current.finished = true;

    const value = Math.max(0, Math.round(Number(score) || 0));
    const bestBefore = window.Save ? Save.best(def.id) : 0;
    const isBest = value > bestBefore;
    if (window.Save) Save.setBest(def.id, value);

    const rate = def.rate == null ? 0.5 : def.rate;
    const coins = U.clamp(Math.round(value * rate) + 2, 1, 35);
    const mood = 5 + Math.min(12, Math.round(value * 0.08));

    if (window.App && App.onMinigameEnd) {
      App.onMinigameEnd({ coins, mood, game: def.id, score: value, isBest });
    }

    // останавливаем игру, но оставляем данные для «Ещё раз»
    stopCleanup();

    els.resultTitle.textContent = def.winTitle || 'Игра окончена!';
    els.resultScore.textContent = value;
    els.resultSub.textContent = isBest
      ? bestBefore > 0
        ? '🏆 Новый рекорд! Было: ' + bestBefore
        : '🏆 Первый рекорд!'
      : 'Рекорд: ' + bestBefore;
    els.resultReward.textContent = '🪙 +' + coins + ' · Настроение +' + mood;
    els.result.classList.remove('hidden');
    U.Sound.coin();

    renderMenu();
  }

  /* ---------- помощники для игр ---------- */
  MG.canvas = function (root, w, h, cls) {
    const wrap = document.createElement('div');
    wrap.className = 'mg-canvas-wrap ' + (cls || '');
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    cv.style.aspectRatio = w + ' / ' + h;
    wrap.appendChild(cv);
    root.appendChild(wrap);
    return { canvas: cv, ctx: cv.getContext('2d'), wrap };
  };

  MG.loop = function (fn) {
    let raf = 0;
    let last = performance.now();
    let dead = false;
    function tick(now) {
      if (dead) return;
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      fn(dt, now / 1000);
      if (!dead) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return function stop() {
      dead = true;
      cancelAnimationFrame(raf);
    };
  };

  MG.pointer = function (canvas, handler, signal) {
    const pos = (e) => {
      const r = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - r.left) * canvas.width) / r.width,
        y: ((e.clientY - r.top) * canvas.height) / r.height,
      };
    };
    canvas.addEventListener(
      'pointerdown',
      (e) => {
        if (e.button != null && e.button !== 0) return;
        e.preventDefault();
        handler(pos(e), e);
      },
      { signal }
    );
  };

  MG.bindKeys = function (handler, signal) {
    window.addEventListener('keydown', (e) => handler(e), { signal });
  };

  MG.roundRect = U.rr;
})();
