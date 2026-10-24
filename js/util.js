/* ============ Утилиты и звук ============ */
(function () {
  'use strict';

  const U = (window.U = {});
  U.TAU = Math.PI * 2;
  U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.rand = (a, b) => a + Math.random() * (b - a);
  U.randInt = (a, b) => Math.floor(U.rand(a, b + 1));
  U.choice = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.chance = (p) => Math.random() < p;
  U.easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  U.easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  U.easeOutBack = (t) => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2);
  U.dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

  U.rr = function (ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
    else {
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
  };

  U.circle = function (ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.01, r), 0, U.TAU);
  };

  U.ellipse = function (ctx, x, y, rx, ry, rot) {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot || 0, 0, U.TAU);
  };

  // мягкая тень под объектом
  U.groundShadow = function (ctx, x, y, rx, ry, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
    g.addColorStop(0, 'rgba(0,0,0,' + (alpha == null ? 0.32 : alpha) + ')');
    g.addColorStop(0.65, 'rgba(0,0,0,' + (alpha == null ? 0.16 : alpha * 0.5) + ')');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, ry / Math.max(rx, ry));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(rx, ry), 0, U.TAU);
    ctx.fill();
    ctx.restore();
  };

  U.heartPath = function (ctx, x, y, size, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    const s = size / 16;
    ctx.beginPath();
    ctx.moveTo(0, 5 * s);
    ctx.bezierCurveTo(-11 * s, -4 * s, -7 * s, -13 * s, 0, -7 * s);
    ctx.bezierCurveTo(7 * s, -13 * s, 11 * s, -4 * s, 0, 5 * s);
    ctx.closePath();
    ctx.restore();
  };

  U.starPath = function (ctx, x, y, outer, inner, points, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    const n = points || 5;
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 ? inner : outer;
      const a = (i / (n * 2)) * U.TAU - Math.PI / 2;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.restore();
  };

  // четырёхлучевая искра
  U.sparklePath = function (ctx, x, y, r) {
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.quadraticCurveTo(x + r * 0.18, y - r * 0.18, x + r, y);
    ctx.quadraticCurveTo(x + r * 0.18, y + r * 0.18, x, y + r);
    ctx.quadraticCurveTo(x - r * 0.18, y + r * 0.18, x - r, y);
    ctx.quadraticCurveTo(x - r * 0.18, y - r * 0.18, x, y - r);
    ctx.closePath();
  };

  U.bonePath = function (ctx, x, y, s, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot || 0);
    ctx.scale(s, s);
    ctx.beginPath();
    const shaft = 12;
    const half = 5;
    const knob = 6.5;
    ctx.moveTo(-shaft, -half);
    ctx.lineTo(shaft, -half);
    ctx.lineTo(shaft, half);
    ctx.lineTo(-shaft, half);
    ctx.closePath();
    ctx.moveTo(-shaft + knob, -half);
    ctx.arc(-shaft, -half, knob, 0, U.TAU);
    ctx.moveTo(shaft + knob, -half);
    ctx.arc(shaft, -half, knob, 0, U.TAU);
    ctx.moveTo(-shaft + knob, half);
    ctx.arc(-shaft, half, knob, 0, U.TAU);
    ctx.moveTo(shaft + knob, half);
    ctx.arc(shaft, half, knob, 0, U.TAU);
    ctx.restore();
  };

  U.text = function (ctx, text, x, y, opts) {
    opts = opts || {};
    ctx.save();
    ctx.font = (opts.weight || 700) + ' ' + (opts.size || 16) + 'px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = opts.align || 'center';
    ctx.textBaseline = opts.baseline || 'middle';
    if (opts.shadow) {
      ctx.fillStyle = 'rgba(0,0,0,' + (opts.shadowAlpha || 0.28) + ')';
      ctx.fillText(text, x + (opts.shadowX || 0), y + (opts.shadowY || 2));
    }
    ctx.fillStyle = opts.color || '#fff';
    ctx.fillText(text, x, y);
    ctx.restore();
  };

  U.fmtScore = function (n) {
    return String(Math.max(0, Math.round(n)));
  };

  U.hit = function (px, py, x, y, w, h) {
    return px >= x && px <= x + w && py >= y && py <= y + h;
  };

  U.hexA = function (hex, a) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  };

  /* ---------------- Звук ---------------- */
  const Sound = (U.Sound = {
    ctx: null,
    master: null,
    muted: false,

    init() {
      if (this.ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try {
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.5;
        this.master.connect(this.ctx.destination);
      } catch (e) {
        this.ctx = null;
      }
    },

    unlock() {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    },

    setMuted(m) {
      this.muted = !!m;
      if (this.master) this.master.gain.value = m ? 0 : 0.5;
    },

    tone(freq, dur, type, vol, slideTo, delay) {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const t0 = this.ctx.currentTime + (delay || 0);
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(Math.max(30, freq), t0);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(Math.max(0.001, vol == null ? 0.1 : vol), t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g);
      g.connect(this.master);
      o.start(t0);
      o.stop(t0 + dur + 0.03);
    },

    noise(dur, vol, delay, freq) {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const t0 = this.ctx.currentTime + (delay || 0);
      const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const f = this.ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = freq || 1200;
      f.Q.value = 0.8;
      const g = this.ctx.createGain();
      g.gain.value = vol == null ? 0.1 : vol;
      src.connect(f);
      f.connect(g);
      g.connect(this.master);
      src.start(t0);
    },

    click() {
      this.tone(560, 0.05, 'triangle', 0.07, 780);
    },
    tap() {
      this.tone(330, 0.06, 'sine', 0.09, 420);
    },
    pop() {
      this.tone(740, 0.08, 'sine', 0.11, 1500);
      this.noise(0.05, 0.03, 0, 2600);
    },
    coin() {
      this.tone(1050, 0.07, 'sine', 0.09);
      this.tone(1560, 0.12, 'sine', 0.08, null, 0.06);
    },
    happy() {
      [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.14, 'sine', 0.075, null, i * 0.075));
    },
    yum() {
      this.tone(300, 0.09, 'triangle', 0.08, 220);
      this.tone(360, 0.09, 'triangle', 0.08, 270, 0.12);
      this.tone(420, 0.12, 'triangle', 0.07, 300, 0.24);
    },
    drink() {
      this.tone(220, 0.22, 'sine', 0.06, 140);
    },
    fail() {
      this.tone(280, 0.16, 'square', 0.05, 150);
      this.tone(190, 0.22, 'square', 0.04, 110, 0.12);
    },
    splash() {
      this.noise(0.4, 0.12, 0, 900);
      this.noise(0.3, 0.06, 0.08, 1800);
    },
    snore() {
      this.tone(110, 0.5, 'sine', 0.035, 150);
      this.tone(130, 0.55, 'sine', 0.03, 95, 0.7);
    },
    whoosh() {
      this.noise(0.22, 0.05, 0, 700);
    },
    jump() {
      this.tone(300, 0.12, 'sine', 0.07, 600);
    },
    buzz() {
      this.tone(140, 0.2, 'sawtooth', 0.04, 90);
    },

    // «голос» волчонка: смешная речь из коротких тонов
    voice(seed) {
      if (this.muted) return;
      const base = 190 + (seed % 7) * 12;
      const n = 3 + (seed % 3);
      for (let i = 0; i < n; i++) {
        const f = base * (1 + (i % 2 ? 0.22 : 0));
        this.tone(f, 0.09, 'sawtooth', 0.028, f * 0.82, i * 0.1);
        this.tone(f * 2.02, 0.07, 'sine', 0.022, f * 1.7, i * 0.1);
      }
    },

    bark() {
      this.tone(420, 0.09, 'sawtooth', 0.06, 180);
      this.tone(320, 0.12, 'triangle', 0.05, 140, 0.05);
    },
  });
})();
