/* ============ Волчонок Тимка — основной цикл игры ============ */
(function () {
  'use strict';

  const U = window.U;
  const Sound = U.Sound;
  const LW = 1280;
  const LH = 720;

  const state = Save.load();
  const app = (window.App = { state, roomId: 'hall' });

  /* ---------- константы ---------- */
  const DECAY = {
    hunger: 100 / (13 * 60),
    energy: 100 / (17 * 60),
    hygiene: 100 / (34 * 60),
    bladder: 100 / (10 * 60),
  };

  const STAT_DEFS = [
    { key: 'hunger', label: 'Сытость', icon: '🍗', c1: '#ffb84d', c2: '#ff8a4d' },
    { key: 'energy', label: 'Энергия', icon: '⚡', c1: '#5ab8ff', c2: '#8f7bff' },
    { key: 'hygiene', label: 'Чистота', icon: '🫧', c1: '#59e0cf', c2: '#5ab8ff' },
    { key: 'bladder', label: 'Туалет', icon: '🚽', c1: '#b18bff', c2: '#7c6cf0' },
    { key: 'mood', label: 'Настроение', icon: '❤️', c1: '#ff8fb1', c2: '#ff5f76' },
  ];

  const FOODS = [
    { id: 'porridge', name: 'Каша', emoji: '🥣', cost: 0, hunger: 28, mood: 4, hygiene: 0, text: '+28 сытости' },
    { id: 'meat', name: 'Мясо', emoji: '🍖', cost: 6, hunger: 44, mood: 10, hygiene: 0, text: '+44 сытости' },
    { id: 'cake', name: 'Пирожное', emoji: '🍰', cost: 9, hunger: 16, mood: 22, hygiene: -8, text: '+22 настроения' },
    { id: 'apple', name: 'Яблоко', emoji: '🍎', cost: 3, hunger: 14, mood: 6, hygiene: 6, text: '+14 сытости' },
  ];

  const PHRASES = {
    hello: ['Привет! Я волчонок Тимка 🐺', 'О, привет! Погладишь меня?', 'Я тебя ждал!'],
    idle: [
      'Пойдём поиграем? 🎮',
      'Я самый пушистый волк на свете!',
      'Аууу! Это я так пою.',
      'Мне скучно без тебя.',
      'Хочешь, покажу фокус?',
      'У меня очень красивый хвост, да?',
      'Какой хороший день!',
      'Может, перекусим?',
      'Я охраняю этот дом. Гав!',
      'Ты мой лучший друг ❤️',
    ],
    hungry: ['Я голоден... 🍗', 'Мой животик поёт серенады.', 'Может, перекусим?', 'Каша... мясо... ммм...'],
    sleepy: ['Я уже зеваю... 😴', 'Глазки слипаются.', 'Пора в кроватку.', 'Энергия на нуле...'],
    dirty: ['Я немного чумазый.', 'Пора помыться, да?', 'Я как будто в земле извалялся.'],
    toilet: ['Мне нужно в туалет! 🚽', 'Скорее, а то не дотерплю!', 'Пусти меня в ванную!'],
    happy: ['Я так счастлив! ❤️', 'Ты лучший друг!', 'Аууу! От счастья!', 'Как же хорошо!'],
    pet: ['Мурр... то есть, гав!', 'Ещё разок!', 'Как приятно!', 'Я растаял от нежности.'],
    sleep: ['Спокойной ночи...', 'Сладких снов...', 'Я немного вздремну.'],
    wake: ['Я выспался! ☀️', 'Доброе утро!', 'Ого, сколько дел!'],
    eat: ['Ням-ням!', 'Вкуснотища!', 'Ещё добавки?', 'Спасибо за угощение!'],
    toiletDone: ['Фух! Как хорошо!', 'Облегчение!', 'Теперь можно и поиграть.'],
    wash: ['Буль-буль!', 'Какая пена!', 'Я теперь блестящий!'],
    play: ['Ура, игра!', 'Давай побьём рекорд!', 'Играем?'],
    refuse: ['Я уже сыт!', 'Ещё кусочек? Ну ладно... нет.', 'Больше не влезет.'],
    love: ['Я тебя люблю!', 'Ты самый заботливый.'],
  };

  /* ---------- элементы ---------- */
  const $ = (id) => document.getElementById(id);
  const canvas = $('scene');
  const ctx = canvas.getContext('2d');
  const stage = $('stage');
  const statsEl = $('stats');
  const roomsEl = $('rooms');
  const actionBar = $('actionBar');
  const foodPanel = $('foodPanel');
  const toastsEl = $('toasts');
  const roomNameEl = $('roomName');
  const roomEmojiEl = $('roomEmoji');
  const coinsEl = $('coins');
  const coinValueEl = $('coinValue');
  const soundBtn = $('soundBtn');

  const view = { w: 0, h: 0, dpr: 1, scale: 1, ox: 0, oy: 0 };
  const wolf = new Wolf();
  wolf.stats = state.stats;
  wolf.sleeping = state.sleeping;

  app.wolf = wolf;
  app.particles = [];
  app.roomIndex = 0;
  app.room = Rooms[0];
  app.roomId = app.room.id;
  wolf.x = 0;
  wolf.targetX = 0;
  wolf.stats = state.stats;
  wolf.sleeping = false;
  state.sleeping = false;

  const ui = { statRefs: {}, roomRefs: {}, hudT: 0, saveT: 0, idleT: U.rand(14, 24), zzzT: 0, waterT: 0 };
  const warned = { hunger: false, energy: false, hygiene: false, bladder: false };

  let pointer = { x: LW / 2, y: LH / 2 };
  let lastPointerMove = 0;
  let lastPet = 0;
  let lastTalk = 0;
  let hoverHotspot = null;
  let bubble = null;
  let activity = null;
  let sleepPending = false;
  let sleepT = 0;
  let transition = null;
  let tvOn = false;
  let lampOn = true;
  let feedBowl = 0;

  /* ---------- звук / монеты ---------- */
  Sound.setMuted(!!state.muted);
  soundBtn.textContent = state.muted ? '🔇' : '🔊';

  function bumpCoins() {
    coinsEl.classList.remove('bump');
    void coinsEl.offsetWidth;
    coinsEl.classList.add('bump');
  }

  function addCoins(n) {
    state.coins = Math.max(0, state.coins + n);
    coinValueEl.textContent = state.coins;
    if (n !== 0) bumpCoins();
  }

  function spendCoins(n) {
    if (state.coins < n) return false;
    state.coins -= n;
    coinValueEl.textContent = state.coins;
    return true;
  }

  app.onMinigameEnd = function (info) {
    addCoins(info.coins);
    state.stats.mood = U.clamp(state.stats.mood + info.mood, 0, 100);
    state.stats.energy = Math.max(0, state.stats.energy - 2);
    state.totalGames++;
    toast('🪙 +' + info.coins + ' монет', 'gold');
    toast('❤️ Настроение +' + info.mood, 'good');
    Save.save();
    updateHud(true);
  };

  /* ---------- тосты ---------- */
  function toast(text, kind, ms) {
    const el = document.createElement('div');
    el.className = 'toast ' + (kind || '');
    el.textContent = text;
    toastsEl.appendChild(el);
    setTimeout(() => {
      el.classList.add('hide');
      setTimeout(() => el.remove(), 320);
    }, ms || 2600);
  }

  /* ---------- речь ---------- */
  function say(text, dur) {
    bubble = {
      text,
      born: performance.now(),
      until: performance.now() + (dur || 3.2) * 1000,
    };
    wolf.speak(dur || 3.2);
    let seed = 0;
    for (let i = 0; i < text.length; i++) seed += text.charCodeAt(i);
    Sound.voice(seed + (wolf.t * 10 | 0));
  }

  function pickPhrase(pool) {
    return U.choice(pool);
  }

  function contextualPhrase() {
    const s = state.stats;
    if (s.bladder < 22) return pickPhrase(PHRASES.toilet);
    if (s.hunger < 24) return pickPhrase(PHRASES.hungry);
    if (s.energy < 22) return pickPhrase(PHRASES.sleepy);
    if (s.hygiene < 30) return pickPhrase(PHRASES.dirty);
    if (s.mood > 78) return pickPhrase(PHRASES.happy);
    return pickPhrase(PHRASES.idle);
  }

  /* ---------- частицы ---------- */
  function addParticle(o) {
    app.particles.push(
      Object.assign(
        { type: 'heart', x: 0, y: 0, vx: 0, vy: 0, grav: 0, life: 1, max: 1, size: 10, color: '#ff8fb1', rot: 0, vr: 0, text: '' },
        o
      )
    );
  }

  function hearts(n, x, y, spread) {
    for (let i = 0; i < n; i++) {
      addParticle({
        type: 'heart',
        x: x + U.rand(-spread, spread),
        y: y + U.rand(-12, 12),
        vx: U.rand(-40, 40),
        vy: U.rand(-140, -70),
        grav: 40,
        life: U.rand(0.8, 1.4),
        max: 1.4,
        size: U.rand(10, 20),
        color: U.choice(['#ff8fb1', '#ff6b8b', '#ffb3c8', '#ffd166']),
        rot: U.rand(-0.4, 0.4),
        vr: U.rand(-1, 1),
      });
    }
  }

  function stars(n, x, y, spread) {
    for (let i = 0; i < n; i++) {
      addParticle({
        type: 'star',
        x: x + U.rand(-spread, spread),
        y: y + U.rand(-spread, spread),
        vx: U.rand(-60, 60),
        vy: U.rand(-120, -30),
        grav: 60,
        life: U.rand(0.5, 1),
        max: 1,
        size: U.rand(7, 14),
        color: U.choice(['#ffe27a', '#fff3c4', '#ffd166']),
        vr: U.rand(-3, 3),
      });
    }
  }

  function crumbs(n, x, y) {
    for (let i = 0; i < n; i++) {
      addParticle({
        type: 'crumb',
        x: x + U.rand(-18, 18),
        y: y + U.rand(-10, 10),
        vx: U.rand(-80, 80),
        vy: U.rand(-120, -20),
        grav: 500,
        life: U.rand(0.4, 0.9),
        max: 0.9,
        size: U.rand(2, 5),
        color: U.choice(['#b5764b', '#8a5330', '#e0a565']),
      });
    }
  }

  function bubbles(n, x, y) {
    for (let i = 0; i < n; i++) {
      addParticle({
        type: 'bubble',
        x: x + U.rand(-60, 60),
        y: y + U.rand(-40, 60),
        vx: U.rand(-30, 30),
        vy: U.rand(-110, -40),
        grav: -20,
        life: U.rand(0.8, 1.6),
        max: 1.6,
        size: U.rand(4, 12),
        color: 'rgba(200,245,255,.8)',
      });
    }
  }

  function zzz(x, y) {
    addParticle({
      type: 'zzz',
      x: x + U.rand(-10, 20),
      y,
      vx: U.rand(6, 22),
      vy: U.rand(-45, -25),
      grav: 0,
      life: 2.6,
      max: 2.6,
      size: U.rand(14, 24),
      color: 'rgba(210,225,255,.9)',
      text: 'Z',
    });
  }

  function waterDrop(n, x, y) {
    for (let i = 0; i < n; i++) {
      addParticle({
        type: 'water',
        x: x + U.rand(-70, 70),
        y: y + U.rand(-150, 20),
        vx: U.rand(-30, 30),
        vy: U.rand(120, 300),
        grav: 500,
        life: U.rand(0.4, 0.9),
        max: 0.9,
        size: U.rand(3, 7),
        color: 'rgba(150,225,255,.9)',
      });
    }
  }

  /* ---------- позиция волка ---------- */
  function wolfPos() {
    const room = app.room;
    let x = room.wolfX + wolf.x;
    let y = room.floorY;
    if (wolf.sleeping && room.sleepSpot) y = room.sleepSpot.y;
    else if (wolf.pose === 'toilet' && room.toiletSpot) y = room.toiletSpot.y;
    return { x, y };
  }

  /* ---------- анимации и действия ---------- */
  function busy() {
    return !!activity || sleepPending || transition;
  }

  app.pet = function () {
    if (wolf.sleeping) {
      say('М-м-м... я сплю. Нажми «Разбудить», если что.', 2.4);
      return;
    }
    if (sleepPending) return;
    const now = performance.now();
    if (now - lastPet < 260) return;
    lastPet = now;
    state.totalPets++;
    state.stats.mood = U.clamp(state.stats.mood + 1.6, 0, 100);
    wolf.pet();
    wolf.wag();
    const p = wolfPos();
    hearts(4, p.x + U.rand(-30, 30), p.y - 370, 40);
    Sound.bark();
    if (Math.random() < 0.22) say(pickPhrase(PHRASES.pet), 2.2);
    if (state.totalPets === 25) toast('🐾 25 поглаживаний! Тимка обожает тебя', 'good');
  };

  function talk() {
    if (wolf.sleeping) {
      say('Тс-с-с... я сплю.', 2);
      return;
    }
    const now = performance.now();
    if (now - lastTalk < 600) return;
    lastTalk = now;
    say(wolfSlotsNear() ? 'Сначала сходим в туалет, а? 🚽' : contextualPhrase(), 3.2);
  }

  function wolfSlotsNear() {
    return state.stats.bladder < 22;
  }

  function openGames() {
    if (sleepPending) return;
    Sound.click();
    Minigames.open();
  }

  function openFood() {
    if (activity || sleepPending) return;
    Sound.click();
    renderFoodPanel();
    foodPanel.classList.remove('hidden');
  }

  function closeFood() {
    foodPanel.classList.add('hidden');
  }

  function renderFoodPanel() {
    foodPanel.innerHTML =
      '<button class="close-food" data-close-food="1" aria-label="Закрыть">✕</button>' +
      FOODS.map((f) => {
        const disabled = state.coins < f.cost ? ' disabled' : '';
        const cost = f.cost === 0 ? 'Бесплатно' : '🪙 ' + f.cost;
        return (
          '<button class="food-item" data-food="' + f.id + '"' + disabled + '>' +
          '<span class="f-emo">' + f.emoji + '</span>' +
          '<span class="f-name">' + f.name + '</span>' +
          '<span class="f-cost">' + cost + '</span>' +
          '<span class="f-stat">' + f.text + '</span>' +
          '</button>'
        );
      }).join('');
  }

  function eat(food) {
    if (activity || sleepPending) return;
    if (state.stats.hunger > 94) {
      say(pickPhrase(PHRASES.refuse), 2.4);
      U.Sound.fail();
      return;
    }
    if (food.cost > 0 && !spendCoins(food.cost)) {
      toast('Не хватает монеток', 'bad');
      return;
    }
    closeFood();
    activity = { type: 'eat', t: 0, dur: 2.9, food };
    wolf.setPose('eat');
    wolf.lookX = 0.9;
    wolf.lookY = 0.5;
    feedBowl = 1;
    state.stats.hunger = U.clamp(state.stats.hunger + food.hunger, 0, 100);
    state.stats.mood = U.clamp(state.stats.mood + food.mood, 0, 100);
    if (food.hygiene) state.stats.hygiene = U.clamp(state.stats.hygiene + food.hygiene, 0, 100);
    U.Sound.yum();
    say(pickPhrase(PHRASES.eat), 2.2);
    setActions();
    updateHud(true);
  }

  function useToilet() {
    if (activity || sleepPending) return;
    if (app.room.id !== 'bathroom') {
      switchRoom('bathroom');
      return;
    }
    activity = { type: 'toilet', t: 0, dur: 3.6 };
    wolf.x = app.room.toiletSpot.x - app.room.wolfX;
    wolf.targetX = wolf.x;
    wolf.setPose('toilet');
    wolf.lookX = 0;
    say('Секундочку... 🚽', 2);
    Sound.tap();
    setActions();
  }

  function wash() {
    if (activity || sleepPending) return;
    if (app.room.id !== 'bathroom') {
      switchRoom('bathroom');
      return;
    }
    activity = { type: 'wash', t: 0, dur: 3.8 };
    wolf.setPose('wash');
    U.Sound.splash();
    say(pickPhrase(PHRASES.wash), 2.4);
    setActions();
  }

  function putToSleep() {
    if (activity || sleepPending || wolf.sleeping) return;
    if (app.room.id !== 'bedroom') {
      switchRoom('bedroom');
      return;
    }
    sleepPending = true;
    sleepT = 0;
    wolf.targetX = app.room.sleepSpot.x - app.room.wolfX;
    say('Иду в кроватку...', 1.6);
    Sound.tap();
    setActions();
  }

  function wakeUp(silent) {
    if (!wolf.sleeping) return;
    wolf.sleeping = false;
    state.sleeping = false;
    wolf.setPose('idle');
    wolf.x = 0;
    wolf.targetX = 0;
    if (!silent) {
      say(pickPhrase(PHRASES.wake), 2.4);
      Sound.happy();
      const p = wolfPos();
      hearts(3, p.x, p.y - 300, 40);
    }
    setActions();
    updateHud(true);
  }

  function toggleTv() {
    tvOn = !tvOn;
    if (tvOn) {
      U.Sound.happy();
      toast('📺 В зале стало веселее', 'good', 1800);
      say('О, мультики!', 2);
    } else {
      U.Sound.click();
    }
  }

  function completeActivity() {
    const a = activity;
    activity = null;
    const p = wolfPos();
    wolf.setPose('idle');
    feedBowl = 0;
    if (!a) return;
    if (a.type === 'eat') {
      state.stats.mood = U.clamp(state.stats.mood + 3, 0, 100);
      say(pickPhrase(PHRASES.eat), 2);
      hearts(2, p.x, p.y - 300, 30);
    } else if (a.type === 'toilet') {
      state.stats.bladder = 100;
      state.stats.hygiene = U.clamp(state.stats.hygiene - 5, 0, 100);
      state.stats.mood = U.clamp(state.stats.mood + 8, 0, 100);
      state.trips++;
      U.Sound.happy();
      say(pickPhrase(PHRASES.toiletDone), 2.4);
      stars(6, p.x, p.y - 250, 50);
      wolf.x = 0;
      wolf.targetX = 0;
    } else if (a.type === 'wash') {
      state.stats.hygiene = U.clamp(state.stats.hygiene + 48, 0, 100);
      state.stats.mood = U.clamp(state.stats.mood + 5, 0, 100);
      U.Sound.happy();
      say(pickPhrase(PHRASES.wash), 2.2);
      stars(5, p.x, p.y - 280, 60);
    }
    setActions();
    updateHud(true);
    Save.save();
  }

  /* ---------- смена комнат ---------- */
  function switchRoom(id) {
    if (app.roomId === id) return;
    if (sleepPending || activity) {
      toast('Секундочку, Тимка занят', '', 1600);
      return;
    }
    if (wolf.sleeping) wakeUp(true);
    const idx = Rooms.findIndex((r) => r.id === id);
    if (idx < 0) return;
    if (transition) return;
    const dir = idx > app.roomIndex ? 1 : -1;
    transition = { t: 0, dur: 0.62, nextIndex: idx, dir, switched: false };
    U.Sound.whoosh();
    closeFood();
  }

  function applyRoom(index, dir) {
    app.roomIndex = index;
    app.room = Rooms[index];
    app.roomId = app.room.id;
    roomNameEl.textContent = app.room.name;
    roomEmojiEl.textContent = app.room.emoji;
    // появление сбоку
    wolf.x = dir * -560;
    wolf.targetX = 0;
    wolf.walkPhase = 0;
    wolf.walkAmt = 1;
    ui.roomRefs = ui.roomRefs || {};
    Array.from(roomsEl.children).forEach((b) => b.classList.toggle('active', b.dataset.room === app.roomId));
    setActions();
    renderRoomsDots();
  }

  function updateTransition(dt) {
    if (!transition) return;
    transition.t += dt;
    if (transition.t > 0.22 && !transition.switched) {
      transition.switched = true;
      applyRoom(transition.nextIndex, transition.dir);
    }
    if (transition.t >= transition.dur) {
      transition = null;
      setActions();
    }
  }

  function transitionAlpha() {
    if (!transition) return 0;
    const t = transition.t;
    if (t < 0.22) return t / 0.22;
    return Math.max(0, 1 - (t - 0.22) / 0.4);
  }

  /* ---------- кнопки действий ---------- */
  const ACTIONS = {
    pet: { label: 'Погладить', emoji: '🐾', cls: 'pink', fn: () => app.pet() },
    talk: { label: 'Поговорить', emoji: '💬', cls: 'dark', fn: talk },
    tv: { label: 'Телевизор', emoji: '📺', cls: 'dark', fn: toggleTv },
    games: { label: 'Мини-игры', emoji: '🎮', cls: 'green', fn: openGames },
    feed: { label: 'Покормить', emoji: '🍗', cls: '', fn: openFood },
    toilet: { label: 'В туалет', emoji: '🚽', cls: '', fn: useToilet },
    wash: { label: 'Помыться', emoji: '🫧', cls: '', fn: wash },
    sleep: { label: 'Уложить спать', emoji: '😴', cls: 'dark', fn: putToSleep },
    wake: { label: 'Разбудить', emoji: '☀️', cls: '', fn: () => wakeUp(false) },
  };

  function actionList() {
    if (wolf.sleeping) return ['wake', 'games'];
    if (app.room.id === 'hall') return ['pet', 'talk', 'tv', 'games'];
    if (app.room.id === 'kitchen') return ['feed', 'pet', 'games'];
    if (app.room.id === 'bathroom') return ['toilet', 'wash', 'pet', 'games'];
    if (app.room.id === 'bedroom') return ['sleep', 'pet', 'games'];
    return ['pet', 'games'];
  }

  function setActions() {
    const dis = !!activity || sleepPending || !!transition;
    actionBar.innerHTML = actionList()
      .map((id) => {
        const a = ACTIONS[id];
        if (!a) return '';
        const cls = a.cls ? ' ' + a.cls : '';
        const disAttr = dis || (id === 'sleep' && sleepPending) ? ' disabled' : '';
        const pulse = id === 'games' && !dis ? ' pulse' : '';
        return (
          '<button class="action-btn' + cls + pulse + '" data-act="' + id + '"' + disAttr + '>' +
          '<span class="emo">' + a.emoji + '</span>' + a.label +
          '</button>'
        );
      })
      .join('');
  }

  actionBar.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const a = ACTIONS[btn.dataset.act];
    if (!a) return;
    Sound.unlock();
    Sound.click();
    a.fn();
    updateHud(true);
  });

  foodPanel.addEventListener('click', (e) => {
    if (e.target.closest('[data-close-food]')) {
      closeFood();
      Sound.click();
      return;
    }
    const b = e.target.closest('[data-food]');
    if (!b) return;
    const food = FOODS.find((f) => f.id === b.dataset.food);
    if (food) {
      Sound.unlock();
      eat(food);
    }
  });

  document.addEventListener('click', (e) => {
    if (foodPanel.classList.contains('hidden')) return;
    if (e.target.closest('#foodPanel') || e.target.closest('[data-act="feed"]')) return;
    closeFood();
  });

  /* ---------- комнаты / HUD ---------- */
  function renderRooms() {
    roomsEl.innerHTML = Rooms.map(
      (r) =>
        '<button class="room-btn" data-room="' + r.id + '">' +
        '<span class="r-ico">' + r.emoji + '</span>' +
        '<span class="r-name">' + r.name + '</span>' +
        '<span class="dot hidden"></span>' +
        '</button>'
    ).join('');
    Array.from(roomsEl.children).forEach((b) => {
      ui.roomRefs[b.dataset.room] = b;
      b.classList.toggle('active', b.dataset.room === app.roomId);
    });
    roomsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-room]');
      if (!btn) return;
      Sound.unlock();
      Sound.click();
      switchRoom(btn.dataset.room);
    });
    renderRoomsDots();
  }

  function renderRoomsDots() {
    const s = state.stats;
    const map = {
      kitchen: s.hunger < 24,
      bathroom: s.bladder < 24 || s.hygiene < 24,
      bedroom: s.energy < 22,
    };
    Object.keys(map).forEach((id) => {
      const ref = ui.roomRefs[id];
      if (!ref) return;
      const dot = ref.querySelector('.dot');
      if (dot) dot.classList.toggle('hidden', !map[id]);
    });
  }

  function buildStats() {
    statsEl.innerHTML = STAT_DEFS.map(
      (d) =>
        '<div class="stat" data-key="' + d.key + '">' +
        '<span class="ico">' + d.icon + '</span>' +
        '<div class="body">' +
        '<div class="row"><span class="lbl">' + d.label + '</span><span class="val">0%</span></div>' +
        '<div class="bar"><i style="--c1:' + d.c1 + ';--c2:' + d.c2 + '"></i></div>' +
        '</div></div>'
    ).join('');
    STAT_DEFS.forEach((d) => {
      const el = statsEl.querySelector('[data-key="' + d.key + '"]');
      ui.statRefs[d.key] = { el, bar: el.querySelector('i'), val: el.querySelector('.val') };
    });
  }

  function updateHud(force) {
    const s = state.stats;
    STAT_DEFS.forEach((d) => {
      const ref = ui.statRefs[d.key];
      if (!ref) return;
      const v = U.clamp(Math.round(s[d.key]), 0, 100);
      ref.bar.style.width = v + '%';
      ref.val.textContent = v + '%';
      ref.el.classList.toggle('warn', v < (d.key === 'mood' ? 28 : 22));
    });
    coinValueEl.textContent = state.coins;
    renderRoomsDots();
    if (force) {
      const p = wolfPos();
      if (p) {
        /* позиция обновляется в цикле */
      }
    }
  }

  function checkWarnings() {
    const s = state.stats;
    const checks = [
      { k: 'hunger', v: s.hunger, txt: '🍗 Тимка проголодался! Загляни на кухню', bad: true },
      { k: 'energy', v: s.energy, txt: '😴 Тимка засыпает на ходу. Пора в спальню', bad: true },
      { k: 'hygiene', v: s.hygiene, txt: '🫧 Тимка испачкался. Надо помыться', bad: true },
      { k: 'bladder', v: s.bladder, txt: '🚽 Тимке срочно нужен туалет!', bad: true },
    ];
    checks.forEach((c) => {
      if (c.v < 22 && !warned[c.k]) {
        warned[c.k] = true;
        toast(c.txt, 'bad', 3000);
        if (!wolf.sleeping) say(c.k === 'bladder' ? pickPhrase(PHRASES.toilet) : c.k === 'hunger' ? pickPhrase(PHRASES.hungry) : c.k === 'energy' ? pickPhrase(PHRASES.sleepy) : pickPhrase(PHRASES.dirty), 2.6);
      } else if (c.v > 40) {
        warned[c.k] = false;
      }
    });
  }

  /* ---------- статистика ---------- */
  function tickStats(dt) {
    const s = state.stats;
    if (wolf.sleeping) {
      s.energy = U.clamp(s.energy + dt * 7.2, 0, 100);
      s.hunger = U.clamp(s.hunger - DECAY.hunger * dt * 0.35, 0, 100);
      s.hygiene = U.clamp(s.hygiene - DECAY.hygiene * dt * 0.4, 0, 100);
      s.bladder = U.clamp(s.bladder - DECAY.bladder * dt * 0.3, 0, 100);
    } else {
      s.hunger = U.clamp(s.hunger - DECAY.hunger * dt, 0, 100);
      s.energy = U.clamp(s.energy - DECAY.energy * dt, 0, 100);
      s.hygiene = U.clamp(s.hygiene - DECAY.hygiene * dt, 0, 100);
      s.bladder = U.clamp(s.bladder - DECAY.bladder * dt, 0, 100);
    }

    if (s.bladder <= 0) {
      s.hygiene = U.clamp(s.hygiene - dt * 0.22, 0, 100);
    }

    let target = (s.hunger + s.energy + s.hygiene + s.bladder) / 4;
    if (s.bladder < 20) target -= 22;
    if (s.hunger < 20) target -= 14;
    if (s.energy < 15) target -= 12;
    if (s.hygiene < 20) target -= 10;
    if (wolf.sleeping) target += 20;
    target = U.clamp(target, 0, 100);
    s.mood = U.clamp(s.mood + (target - s.mood) * Math.min(0.5, dt * 0.05), 0, 100);

    // обновляем показатели волка
    wolf.stats = s;
  }

  app.applyOffline = function () {
    const now = Date.now();
    const last = Number(state.lastTick) || now;
    let sec = (now - last) / 1000;
    if (sec < 20) return 0;
    sec = Math.min(sec, 30 * 60);
    const s = state.stats;
    if (state.sleeping) {
      s.energy = U.clamp(s.energy + 40, 0, 100);
      s.hunger = U.clamp(s.hunger - DECAY.hunger * sec * 0.3, 0, 100);
    } else {
      s.hunger = U.clamp(s.hunger - DECAY.hunger * sec, 0, 100);
      s.energy = U.clamp(s.energy - DECAY.energy * sec, 0, 100);
      s.hygiene = U.clamp(s.hygiene - DECAY.hygiene * sec, 0, 100);
      s.bladder = U.clamp(s.bladder - DECAY.bladder * sec, 0, 100);
    }
    let target = (s.hunger + s.energy + s.hygiene + s.bladder) / 4;
    if (s.bladder < 20) target -= 22;
    if (s.hunger < 20) target -= 14;
    s.mood = U.clamp(s.mood + (target - s.mood) * 0.4, 0, 100);
    state.lastTick = now;
    return sec;
  };

  /* ---------- ввод ---------- */
  function toLogical(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    const x = ((clientX - r.left) * view.w) / r.width;
    const y = ((clientY - r.top) * view.h) / r.height;
    return {
      x: (x - view.ox) / view.scale,
      y: (y - view.oy) / view.scale,
    };
  }

  function wolfHit(p) {
    const w = wolfPos();
    const s = app.room.scale;
    if (wolf.sleeping) {
      return p.x > w.x - 190 * s && p.x < w.x + 220 * s && p.y > w.y - 250 * s && p.y < w.y + 20;
    }
    return p.x > w.x - 140 * s && p.x < w.x + 140 * s && p.y > w.y - 500 * s && p.y < w.y + 10;
  }

  function hotspotAt(p) {
    const hs = app.room.hotspots || [];
    for (let i = 0; i < hs.length; i++) {
      const h = hs[i];
      if (p.x >= h.x && p.x <= h.x + h.w && p.y >= h.y && p.y <= h.y + h.h) return h;
    }
    return null;
  }

  function handleHotspot(action) {
    if (action === 'tv') toggleTv();
    else if (action === 'feed') openFood();
    else if (action === 'toilet') useToilet();
    else if (action === 'wash') wash();
    else if (action === 'sleep') {
      if (wolf.sleeping) wakeUp(false);
      else putToSleep();
    } else if (action === 'lamp') {
      lampOn = !lampOn;
      Sound.click();
      toast(lampOn ? '💡 Ночник включён' : '🌙 Ночник выключен', '', 1500);
    } else if (action === 'sofa') {
      if (wolf.sleeping) return;
      say('Диван — моё любимое место!', 2.2);
      hearts(2, wolfPos().x, wolfPos().y - 300, 30);
    }
  }

  canvas.addEventListener('pointermove', (e) => {
    const p = toLogical(e.clientX, e.clientY);
    pointer = p;
    lastPointerMove = performance.now();
    const h = hotspotAt(p);
    hoverHotspot = h;
    const overWolf = wolfHit(p);
    canvas.style.cursor = h || overWolf ? 'pointer' : 'default';
  });

  canvas.addEventListener('pointerleave', () => {
    hoverHotspot = null;
    canvas.style.cursor = 'default';
  });

  canvas.addEventListener('pointerdown', (e) => {
    if (e.button != null && e.button !== 0) return;
    Sound.unlock();
    const p = toLogical(e.clientX, e.clientY);
    pointer = p;
    lastPointerMove = performance.now();
    if (wolfHit(p)) {
      app.pet();
      return;
    }
    const h = hotspotAt(p);
    if (h) {
      Sound.click();
      handleHotspot(h.action);
      return;
    }
    // клик по пустой комнате — волк смотрит и машет
    wolf.lookX = U.clamp((p.x - wolfPos().x) / 300, -1, 1);
  });

  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  document.addEventListener('keydown', (e) => {
    if (Minigames.isOpen) return;
    if (e.key === '1') switchRoom('hall');
    else if (e.key === '2') switchRoom('kitchen');
    else if (e.key === '3') switchRoom('bathroom');
    else if (e.key === '4') switchRoom('bedroom');
    else if (e.key.toLowerCase() === 'p' || e.key.toLowerCase() === 'з') app.pet();
    else if (e.key.toLowerCase() === 'g' || e.key.toLowerCase() === 'п') openGames();
    else if (e.key === 'Escape') closeFood();
  });

  /* ---------- кнопки HUD ---------- */
  soundBtn.addEventListener('click', () => {
    state.muted = !state.muted;
    Sound.setMuted(state.muted);
    soundBtn.textContent = state.muted ? '🔇' : '🔊';
    soundBtn.classList.toggle('off', state.muted);
    Save.save();
    if (!state.muted) Sound.pop();
  });

  $('helpBtn').addEventListener('click', () => {
    Sound.click();
    $('help').classList.remove('hidden');
  });
  $('helpClose').addEventListener('click', () => $('help').classList.add('hidden'));
  $('helpOk').addEventListener('click', () => $('help').classList.add('hidden'));
  $('help').addEventListener('click', (e) => {
    if (e.target === $('help')) $('help').classList.add('hidden');
  });

  $('resetBtn').addEventListener('click', () => {
    if (confirm('Начать заново? Весь прогресс Тимки будет удалён.')) {
      Save.reset();
      location.reload();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') $('help').classList.add('hidden');
  });

  $('petName').addEventListener('click', () => {
    const name = prompt('Как зовут волчонка?', state.name);
    if (name && name.trim()) {
      state.name = name.trim().slice(0, 16);
      $('petName').textContent = state.name;
      document.title = state.name + ' — мой говорящий волк';
      Save.save();
      say('Меня зовут ' + state.name + '!', 2.4);
    }
  });

  /* ---------- сцена ---------- */
  function resize() {
    const r = stage.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    view.w = r.width;
    view.h = r.height;
    view.dpr = dpr;
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    canvas.style.width = r.width + 'px';
    canvas.style.height = r.height + 'px';
    const s = Math.min(r.width / LW, r.height / LH);
    view.scale = s;
    view.ox = (r.width - LW * s) / 2;
    view.oy = (r.height - LH * s) / 2;
  }

  if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
  window.addEventListener('resize', resize);

  function roomState() {
    return {
      sleeping: wolf.sleeping,
      tvOn,
      feedBowl,
      lampOn,
    };
  }

  function drawParticles(ctx) {
    app.particles.forEach((p) => {
      const a = U.clamp(p.life / p.max, 0, 1);
      ctx.save();
      ctx.globalAlpha = a;
      if (p.type === 'heart') {
        ctx.fillStyle = p.color;
        U.heartPath(ctx, p.x, p.y, p.size, p.rot);
        ctx.fill();
      } else if (p.type === 'star') {
        ctx.fillStyle = p.color;
        U.starPath(ctx, p.x, p.y, p.size, p.size * 0.42, 5, p.rot);
        ctx.fill();
      } else if (p.type === 'zzz') {
        ctx.fillStyle = p.color;
        ctx.font = '900 ' + p.size + 'px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.text, p.x, p.y);
      } else if (p.type === 'bubble') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        U.circle(ctx, p.x, p.y, p.size);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.35)';
        U.circle(ctx, p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.25);
        ctx.fill();
      } else if (p.type === 'water') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size * 0.7, p.size, 0, 0, U.TAU);
        ctx.fill();
      } else if (p.type === 'coin') {
        ctx.fillStyle = '#ffd166';
        U.circle(ctx, p.x, p.y, p.size);
        ctx.fill();
        ctx.fillStyle = '#e0a52a';
        U.circle(ctx, p.x, p.y, p.size * 0.6);
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        U.circle(ctx, p.x, p.y, p.size);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  function drawBubble(ctx) {
    if (!bubble) return;
    const now = performance.now();
    if (now > bubble.until) {
      bubble = null;
      return;
    }
    const p = wolfPos();
    const s = app.room.scale;
    let headTop;
    if (wolf.sleeping) headTop = p.y - 230 * s;
    else if (wolf.pose === 'toilet') headTop = p.y - 300 * s;
    else if (wolf.pose === 'eat') headTop = p.y - 445 * s;
    else headTop = p.y - 480 * s;
    let x = p.x + (wolf.sleeping ? 60 : 0);
    let y = headTop - 10;
    if (y < 90) y = 90;
    if (x < 190) x = 190;
    if (x > LW - 190) x = LW - 190;

    const maxTextW = 300;
    ctx.save();
    ctx.font = '700 17px "Segoe UI", system-ui, sans-serif';
    const words = bubble.text.split(' ');
    const lines = [];
    let line = '';
    for (let i = 0; i < words.length; i++) {
      const test = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width > maxTextW && line) {
        lines.push(line);
        line = words[i];
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    const lineH = 23;
    let width = 0;
    lines.forEach((l) => {
      width = Math.max(width, ctx.measureText(l).width);
    });
    width += 40;
    const height = lines.length * lineH + 24;
    let bx = x - width / 2;
    bx = U.clamp(bx, 16, LW - width - 16);
    const by = Math.max(16, y - height - 16);
    const pop = U.clamp((now - bubble.born) / 160, 0, 1);
    const sc = 0.8 + 0.2 * U.easeOutBack(pop);
    ctx.translate(x, by + height);
    ctx.scale(sc, sc);
    ctx.translate(-x, -(by + height));

    ctx.shadowColor = 'rgba(20,30,45,.25)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = 'rgba(255,252,245,.97)';
    U.rr(ctx, bx, by, width, height, 18);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    // хвостик
    const tx = U.clamp(x, bx + 26, bx + width - 26);
    ctx.fillStyle = 'rgba(255,252,245,.97)';
    ctx.beginPath();
    ctx.moveTo(tx - 12, by + height - 2);
    ctx.lineTo(x, by + height + 15);
    ctx.lineTo(tx + 12, by + height - 2);
    ctx.closePath();
    ctx.fill();
    // текст
    ctx.fillStyle = '#2c3444';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    lines.forEach((l, i) => {
      ctx.fillText(l, bx + 20, by + 20 + i * lineH);
    });
    // маленькая лапка
    ctx.fillStyle = '#ffb64d';
    ctx.beginPath();
    ctx.arc(bx + 10, by + 8, 8, 0, U.TAU);
    ctx.fill();
    ctx.restore();
  }

  function drawHover(ctx) {
    if (!hoverHotspot) return;
    const h = hoverHotspot;
    const x = h.x + h.w / 2;
    const y = h.y - 12;
    ctx.save();
    ctx.font = '700 14px "Segoe UI", system-ui, sans-serif';
    const w = ctx.measureText(h.label).width + 26;
    ctx.fillStyle = 'rgba(12,20,30,.78)';
    U.rr(ctx, x - w / 2, y - 30, w, 26, 13);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#eaf3ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(h.label, x, y - 16);
    ctx.restore();
  }

  function draw() {
    const dpr = view.dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, view.w, view.h);
    // фон вокруг сцены
    const bg = ctx.createLinearGradient(0, 0, 0, view.h);
    bg.addColorStop(0, '#0c131c');
    bg.addColorStop(1, '#080d13');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, view.w, view.h);

    ctx.save();
    ctx.translate(view.ox, view.oy);
    ctx.scale(view.scale, view.scale);
    ctx.beginPath();
    ctx.rect(0, 0, LW, LH);
    ctx.clip();

    const t = performance.now() / 1000;
    const st = roomState();
    app.room.draw(ctx, t, st);

    const pos = wolfPos();
    const sleeping = wolf.sleeping;
    wolf.draw(ctx, pos.x, pos.y, app.room.scale * (sleeping ? 1.02 : 1));

    if (activity && activity.type === 'eat') {
      // кусочек у морды
      const p = wolfPos();
      const bob = Math.sin(performance.now() / 95) * 2;
      ctx.save();
      ctx.translate(p.x + 24, p.y - 229 + bob);
      ctx.rotate(0.35);
      ctx.fillStyle = activity.food.emoji === '🍰' ? '#ffd1dc' : activity.food.emoji === '🍖' ? '#c47b46' : '#e8c27a';
      U.rr(ctx, -10, -8, 20, 16, 7);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      U.circle(ctx, -3, -3, 3);
      ctx.fill();
      ctx.fillStyle = 'rgba(120,70,30,.35)';
      U.circle(ctx, 3, 2, 2);
      ctx.fill();
      ctx.restore();
    }

    if (app.room.drawFront) app.room.drawFront(ctx, t, st, wolf);

    drawParticles(ctx);

    if (app.room.id === 'kitchen' && activity && activity.type === 'eat') {
      // крошки у морды
    }

    drawBubble(ctx);
    drawHover(ctx);

    // переход между комнатами
    const ta = transitionAlpha();
    if (ta > 0) {
      ctx.fillStyle = 'rgba(8,13,20,' + ta + ')';
      ctx.fillRect(0, 0, LW, LH);
    }

    // мягкая рамка
    const vg = ctx.createRadialGradient(640, 340, 300, 640, 360, 760);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(8,12,18,.28)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, LW, LH);

    ctx.restore();
  }

  /* ---------- обновление ---------- */
  function update(dt) {
    const t = performance.now() / 1000;

    // переход
    updateTransition(dt);

    // ходьба/сон
    if (sleepPending) {
      sleepT += dt;
      if (sleepT > 1.5) {
        sleepPending = false;
        wolf.sleeping = true;
        state.sleeping = true;
        wolf.x = app.room.sleepSpot.x - app.room.wolfX;
        wolf.targetX = wolf.x;
        wolf.setPose('idle');
        Sound.happy();
        say(pickPhrase(PHRASES.sleep), 2.8);
        const p = wolfPos();
        hearts(3, p.x, p.y - 180, 50);
        setActions();
        updateHud(true);
      }
    }

    // активность
    if (activity) {
      activity.t += dt;
      if (activity.type === 'eat') {
        wolf.lookX = 0.9;
        wolf.lookY = 0.6;
        if (Math.random() < dt * 16) {
          const p = wolfPos();
          crumbs(1, p.x + 26, p.y - 232, 9);
        }
      } else if (activity.type === 'wash') {
        if (Math.random() < dt * 22) {
          const p = wolfPos();
          bubbles(2, p.x, p.y - 250);
        }
        if (Math.random() < dt * 14) {
          const p = wolfPos();
          waterDrop(1, p.x, p.y - 380);
        }
        wolf.lookX = 0;
        wolf.lookY = 0;
      } else if (activity.type === 'toilet') {
        if (Math.random() < dt * 3) {
          const p = wolfPos();
          stars(1, p.x, p.y - 360, 30);
        }
      }
      if (activity.t >= activity.dur) completeActivity();
    }

    // волк
    const p = wolfPos();
    const pointerWorld = {
      x: pointer.x,
      y: pointer.y,
      ax: p.x,
      ay: p.y - 300,
    };
    if (activity && activity.type === 'eat') {
      wolf.lookX = 0.9;
    }
    wolf.update(dt, state.stats, performance.now() - lastPointerMove < 2500 ? pointerWorld : null);
    if (activity && activity.type === 'eat') {
      wolf.lookX = 0.9;
      wolf.lookY = 0.6;
    }
    if (activity && activity.type === 'wash') {
      wolf.lookX = 0;
    }

    // статистика
    tickStats(dt);
    checkWarnings();

    // частицы
    for (let i = app.particles.length - 1; i >= 0; i--) {
      const pt = app.particles[i];
      pt.life -= dt;
      if (pt.life <= 0) {
        app.particles.splice(i, 1);
        continue;
      }
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += pt.grav * dt;
      pt.rot += pt.vr * dt;
      if (pt.type === 'zzz') pt.vx += Math.sin(t * 2 + i) * 6 * dt;
    }

    // zzz и вода во сне
    if (wolf.sleeping) {
      ui.zzzT -= dt;
      if (ui.zzzT <= 0) {
        ui.zzzT = U.rand(1.2, 2);
        const wp = wolfPos();
        zzz(wp.x + 80, wp.y - 210);
      }
    }

    // пузырь
    if (bubble && performance.now() > bubble.until) bubble = null;

    // случайная болтовня
    if (!wolf.sleeping && !activity && !Minigames.isOpen) {
      ui.idleT -= dt;
      if (ui.idleT <= 0) {
        ui.idleT = U.rand(18, 32);
        if (!bubble) say(contextualPhrase(), 3.4);
      }
    }

    // сохранение/UI
    ui.hudT -= dt;
    if (ui.hudT <= 0) {
      ui.hudT = 0.15;
      updateHud();
    }
    ui.saveT += dt;
    if (ui.saveT > 4) {
      ui.saveT = 0;
      Save.save();
    }
  }

  /* ---------- главный цикл ---------- */
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    try {
      update(dt);
      draw();
    } catch (err) {
      console.error(err);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- запуск ---------- */
  function boot() {
    resize();
    buildStats();
    renderRooms();
    updateHud(true);
    setActions();
    $('petName').textContent = state.name;
    coinValueEl.textContent = state.coins;
    soundBtn.classList.toggle('off', !!state.muted);
    if (state.name) document.title = state.name + ' — мой говорящий волк';

    const offline = app.applyOffline();
    if (offline > 60) {
      toast('Тимка скучал без тебя!', 'good', 2800);
    }

    // стартовое приветствие
    setTimeout(() => {
      if (!bubble) say(U.choice(PHRASES.hello), 3.4);
    }, 900);

    updateHud(true);
    requestAnimationFrame(frame);
    Save.save();
  }

  // список игр обновляем при открытии
  const origOpen = Minigames.open;
  Minigames.open = function () {
    origOpen.call(Minigames);
    Sound.pop();
  };

  app.openGames = openGames;
  app.switchRoom = switchRoom;
  app.say = say;
  app.hearts = hearts;
  app.toast = toast;
  app.wakeUp = wakeUp;
  app.step = function (dt) {
    update(dt);
    draw();
  };

  boot();
})();
