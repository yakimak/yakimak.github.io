/* ============ Сохранение и состояние ============ */
(function () {
  'use strict';

  const KEY = 'wolf_timka_save_v1';

  const defaults = () => ({
    version: 1,
    name: 'Тимка',
    coins: 30,
    stats: { hunger: 82, energy: 80, hygiene: 90, bladder: 95, mood: 88 },
    lastTick: Date.now(),
    sleeping: false,
    best: {},
    muted: false,
    totalPets: 0,
    totalGames: 0,
    trips: 0,
  });

  const clampStats = (s) => {
    const keys = ['hunger', 'energy', 'hygiene', 'bladder', 'mood'];
    keys.forEach((k) => {
      s[k] = Math.max(0, Math.min(100, Number(s[k]) || 0));
    });
    return s;
  };

  const Save = (window.Save = {
    state: null,

    load() {
      let saved = null;
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) saved = JSON.parse(raw);
      } catch (e) {
        saved = null;
      }
      const def = defaults();
      const st = Object.assign({}, def, saved || {});
      st.stats = Object.assign({}, def.stats, (saved && saved.stats) || {});
      st.best = Object.assign({}, (saved && saved.best) || {});
      st.name = typeof st.name === 'string' && st.name.trim() ? st.name.slice(0, 16) : def.name;
      st.coins = Math.max(0, Math.floor(Number(st.coins) || 0));
      st.totalPets = Math.max(0, Number(st.totalPets) || 0);
      st.totalGames = Math.max(0, Number(st.totalGames) || 0);
      st.trips = Math.max(0, Number(st.trips) || 0);
      st.sleeping = !!st.sleeping;
      clampStats(st.stats);
      this.state = st;
      return st;
    },

    save() {
      if (!this.state) return;
      try {
        this.state.lastTick = Date.now();
        localStorage.setItem(KEY, JSON.stringify(this.state));
      } catch (e) {
        /* ignore */
      }
    },

    reset() {
      try {
        localStorage.removeItem(KEY);
      } catch (e) {
        /* ignore */
      }
      this.state = defaults();
      return this.state;
    },

    best(id) {
      return (this.state && this.state.best[id]) || 0;
    },

    setBest(id, score) {
      if (!this.state) return false;
      if (!this.state.best[id] || score > this.state.best[id]) {
        this.state.best[id] = Math.round(score);
        this.save();
        return true;
      }
      return false;
    },
  });
})();
