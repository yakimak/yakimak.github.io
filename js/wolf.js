/* ============ Волчонок Тимка — рисованный персонаж ============ */
(function () {
  'use strict';

  const U = window.U;

  const COL = {
    fur: '#9aaec6',
    furTop: '#c6d4e4',
    furDark: '#7d90a9',
    furShade: '#6f829b',
    belly: '#f0f5fb',
    bellyShade: '#dbe5f0',
    outline: 'rgba(48,61,80,.30)',
    earInner: '#eaa9b7',
    earInnerDark: '#d3879a',
    nose: '#344050',
    iris: '#f6b64a',
    irisDark: '#d98a24',
    pupil: '#2b2118',
    mouth: '#6d3446',
    tongue: '#f28fa0',
    blush: 'rgba(244,143,162,.42)',
  };

  class Wolf {
    constructor() {
      this.t = 0;
      this.x = 0;
      this.targetX = 0;
      this.scale = 1;
      this.pose = 'idle';
      this.poseT = 0;
      this.blink = 0;
      this.blinkTimer = 2.4;
      this.mouth = 0;
      this.mouthTarget = 0;
      this.talkT = 0;
      this.petT = 0;
      this.walkAmt = 0;
      this.walkPhase = 0;
      this.dir = 1;
      this.lookX = 0;
      this.lookY = 0;
      this.earTwitch = 0;
      this.earTimer = 3;
      this.sleeping = false;
      this.chew = 0;
      this.stats = { hunger: 80, energy: 80, hygiene: 88, bladder: 90, mood: 85 };
      this.smudges = [
        { x: -34, y: -248, r: 8 },
        { x: 30, y: -180, r: 11 },
        { x: -52, y: -120, r: 6 },
        { x: 58, y: -300, r: 7 },
      ];
      this.wave = 0;
    }

    setPose(p, dur) {
      this.pose = p;
      this.poseT = 0;
      this.poseDur = dur || 0;
    }

    speak(sec) {
      this.talkT = Math.max(this.talkT, sec || 2.2);
    }

    pet() {
      this.petT = 1.1;
    }

    wag() {
      this.tailBoost = 1.6;
    }

    update(dt, stats, pointer) {
      this.t += dt;
      this.poseT += dt;
      this.stats = stats;

      // перемещение к цели
      const dx = this.targetX - this.x;
      if (Math.abs(dx) > 1.2) {
        const sp = 420 * dt;
        this.x += Math.sign(dx) * Math.min(Math.abs(dx), sp);
        this.dir = dx > 0 ? 1 : -1;
        this.walkAmt = Math.min(1, this.walkAmt + dt * 6);
        this.walkPhase += dt * 11;
      } else {
        this.x = this.targetX;
        this.walkAmt = Math.max(0, this.walkAmt - dt * 6);
        this.walkPhase += dt * 2 * this.walkAmt;
      }

      // моргание
      this.blinkTimer -= dt;
      if (this.blinkTimer <= 0) {
        this.blink = 1;
        this.blinkTimer = U.rand(2.2, 4.8);
      }
      if (this.blink > 0) this.blink = Math.max(0, this.blink - dt * 6);

      // уши
      this.earTimer -= dt;
      if (this.earTimer <= 0) {
        this.earTwitch = 1;
        this.earTimer = U.rand(2.5, 6);
      }
      if (this.earTwitch > 0) this.earTwitch = Math.max(0, this.earTwitch - dt * 4);

      // рот / речь
      this.talkT = Math.max(0, this.talkT - dt);
      if (this.talkT > 0) {
        this.mouthTarget = 0.35 + Math.abs(Math.sin(this.t * 13)) * 0.65;
      } else if (this.pose === 'eat') {
        this.mouthTarget = 0.25 + Math.abs(Math.sin(this.t * 9)) * 0.5;
      } else if (this.petT > 0.2) {
        this.mouthTarget = 0.35;
      } else {
        this.mouthTarget = 0;
      }
      this.mouth += (this.mouthTarget - this.mouth) * Math.min(1, dt * 14);

      this.petT = Math.max(0, this.petT - dt * 0.9);
      this.tailBoost = Math.max(0, (this.tailBoost || 0) - dt);
      if (this.chew > 0) this.chew = Math.max(0, this.chew - dt);

      // взгляд за курсором
      if (pointer && !this.sleeping) {
        const px = (pointer.x - (pointer.ax || 0)) / 500;
        const py = (pointer.y - (pointer.ay || 0)) / 420;
        this.lookX += (U.clamp(px, -1, 1) - this.lookX) * Math.min(1, dt * 5);
        this.lookY += (U.clamp(py, -1, 1) - this.lookY) * Math.min(1, dt * 5);
      } else {
        this.lookX += (0 - this.lookX) * Math.min(1, dt * 3);
        this.lookY += (0 - this.lookY) * Math.min(1, dt * 3);
      }

      if (this.sleeping) {
        this.mouthTarget = 0;
        this.mouth *= 0.9;
      }
    }

    /* ============ основная отрисовка ============ */
    draw(ctx, ax, ay, scale) {
      ctx.save();
      ctx.translate(ax, ay);
      const s = scale || 1;
      ctx.scale(s, s);
      if (this.sleeping) this._drawSleeping(ctx);
      else if (this.pose === 'toilet') this._drawSitting(ctx);
      else this._drawStanding(ctx);
      ctx.restore();
    }

    _colors() {
      const st = this.stats;
      const dirty = st.hygiene < 45;
      return dirty ? { tint: true } : { tint: false };
    }

    /* ---------- стоя ---------- */
    _drawStanding(ctx) {
      const t = this.t;
      const st = this.stats;
      const mood = st.mood;
      const sad = mood < 34;
      const sleepy = st.energy < 22;
      const hungry = st.hunger < 22;
      const dirty = st.hygiene < 32;
      const urgent = st.bladder < 22;
      const happy = this.petT > 0.15 || mood > 82;

      const walkBob = -Math.abs(Math.sin(this.walkPhase)) * 7 * this.walkAmt;
      const breathe = Math.sin(t * 2.1) * 2.5;
      const bounce = (this.pose === 'happy' ? Math.abs(Math.sin(t * 8)) * 12 : 0) + (this.petT > 0 ? Math.sin(t * 18) * 2.5 * this.petT : 0);
      const bodyY = breathe + walkBob + bounce;
      const tilt = Math.sin(t * 1.4) * 0.012 + (sad ? 0.02 : 0);

      // тень
      U.groundShadow(ctx, 0, 2, 124 - walkBob * 0.8, 26, 0.34);

      this._drawTail(ctx, bodyY, mood, sad);

      // лапы
      this._drawLegs(ctx, walkBob);

      ctx.save();
      ctx.translate(0, bodyY);
      ctx.rotate(tilt * 0.35 + (this.pose === 'eat' ? 0.14 : 0));

      this._drawBody(ctx, sad, dirty);
      this._drawArms(ctx, happy, sad);

      // голова
      const eat = this.pose === 'eat';
      const headBob = Math.sin(t * 2.1 + 0.5) * 3 - (hungry ? 4 : 0) + (this.petT > 0 ? Math.sin(t * 20) * 2 * this.petT : 0);
      const headTilt = Math.sin(t * 1.1) * 0.02 + this.lookX * 0.05 + (sad ? 0.06 : 0) + (eat ? 0.26 : 0);
      ctx.save();
      ctx.translate((eat ? 28 : 0) + this.lookX * 4, (eat ? -264 : -302) + headBob);
      ctx.rotate(headTilt);
      this._drawHead(ctx, {
        sad, sleepy, hungry, dirty, happy, urgent,
        blink: this.blink,
        mouth: this.mouth,
        lookX: this.lookX,
        lookY: this.lookY,
        earTwitch: this.earTwitch,
        blush: happy || mood > 70,
      });
      ctx.restore();

      ctx.restore();

      if (dirty) this._drawSmudges(ctx, bodyY);
    }

    _drawTail(ctx, bodyY, mood, sad) {
      const t = this.t;
      const wagSpeed = 2 + mood / 26 + (this.tailBoost || 0) * 4;
      const wag = Math.sin(t * wagSpeed) * (sad ? 4 : 13 + mood / 12);
      ctx.save();
      ctx.translate(-52, -152 + bodyY * 0.6);
      ctx.rotate(0.1 + wag * 0.005);
      const g = ctx.createLinearGradient(0, 0, -104, 90);
      g.addColorStop(0, '#93a6bf');
      g.addColorStop(1, '#c3d1e2');
      ctx.strokeStyle = g;
      ctx.lineWidth = 36;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.bezierCurveTo(-64, -12, -100, 18, -104, 88);
      ctx.stroke();
      // кончик
      ctx.fillStyle = '#e9f0f8';
      U.circle(ctx, -104, 88, 18);
      ctx.fill();
      ctx.restore();
    }

    _drawLegs(ctx, walkBob) {
      const swing = Math.sin(this.walkPhase) * 9 * this.walkAmt;
      const legs = [
        { x: -52, off: swing },
        { x: 18, off: -swing },
      ];
      legs.forEach((L) => {
        const g = ctx.createLinearGradient(L.x, -100, L.x + 34, 0);
        g.addColorStop(0, '#8b9eb7');
        g.addColorStop(1, '#b6c4d6');
        ctx.fillStyle = g;
        U.rr(ctx, L.x, -92 + L.off * 0.35, 36, 92, 16);
        ctx.fill();
        // лапа
        ctx.fillStyle = '#dbe5f0';
        U.ellipse(ctx, L.x + 18, -7 + L.off * 0.35, 24, 13);
        ctx.fill();
        ctx.strokeStyle = 'rgba(80,100,125,.28)';
        ctx.lineWidth = 2.5;
        [-7, 0, 7].forEach((dx) => {
          ctx.beginPath();
          ctx.moveTo(L.x + 18 + dx, -16 + L.off * 0.35);
          ctx.lineTo(L.x + 18 + dx, -8 + L.off * 0.35);
          ctx.stroke();
        });
      });
    }

    _drawBody(ctx, sad, dirty) {
      // хвостовая часть / бедро
      const g = ctx.createLinearGradient(-80, -285, 70, -70);
      g.addColorStop(0, '#c4d2e2');
      g.addColorStop(0.45, '#a2b4ca');
      g.addColorStop(1, '#8497b0');
      ctx.fillStyle = g;
      U.ellipse(ctx, 0, -176, 88, 106);
      ctx.fill();

      // живот
      const bg = ctx.createLinearGradient(0, -250, 0, -60);
      bg.addColorStop(0, '#f6f9fd');
      bg.addColorStop(1, '#d8e3ef');
      ctx.fillStyle = bg;
      U.ellipse(ctx, 0, -152, 59, 84);
      ctx.fill();

      // пушистая грудка
      ctx.fillStyle = '#f2f7fc';
      const fluff = [
        [-30, -252, 26, 24],
        [0, -262, 30, 26],
        [30, -252, 26, 24],
        [0, -232, 24, 18],
      ];
      fluff.forEach(([x, y, rx, ry]) => {
        U.ellipse(ctx, x, y, rx, ry);
        ctx.fill();
      });

      // лёгкая тень на боку
      ctx.fillStyle = 'rgba(90,110,140,.10)';
      U.ellipse(ctx, -42, -140, 30, 62);
      ctx.fill();
    }

    _drawArms(ctx, happy, sad) {
      const t = this.t;
      [-1, 1].forEach((side) => {
        ctx.save();
        const sx = side * 86;
        const sy = -230;
        ctx.translate(sx, sy);
        let ang = side * 0.15;
        if (happy && side === 1) ang = -2.35 + Math.sin(t * 14) * 0.25;
        else if (this.pose === 'wash') ang = -2.6 + Math.sin(t * 10) * 0.2;
        else if (this.pose === 'eat') ang = -0.75;
        else ang += Math.sin(t * 2.1 + side) * 0.05;
        ctx.rotate(ang);
        const g = ctx.createLinearGradient(0, 0, 0, 96);
        g.addColorStop(0, '#a9bacd');
        g.addColorStop(1, '#c9d6e4');
        ctx.fillStyle = g;
        U.rr(ctx, -18, -6, 36, 96, 18);
        ctx.fill();
        ctx.fillStyle = '#e4ecf5';
        U.ellipse(ctx, 0, 92, 22, 18);
        ctx.fill();
        ctx.strokeStyle = 'rgba(90,110,135,.28)';
        ctx.lineWidth = 2;
        [-7, 1, 9].forEach((dx) => {
          ctx.beginPath();
          ctx.moveTo(dx, 84);
          ctx.lineTo(dx, 95);
          ctx.stroke();
        });
        ctx.restore();
      });
    }

    _drawHead(ctx, o) {
      const t = this.t;
      const droop = o.sad ? 0.16 : 0;
      const earTw = o.earTwitch * 0.12;

      // уши
      [-1, 1].forEach((side) => {
        ctx.save();
        ctx.translate(side * 48, -54);
        ctx.rotate(side * (0.05 + droop * 1.4 + (side === 1 ? earTw : 0)));
        const g = ctx.createLinearGradient(0, -70, 0, 20);
        g.addColorStop(0, '#bdcbdb');
        g.addColorStop(1, '#8fa2ba');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(-27, 12);
        ctx.quadraticCurveTo(-44, -44, -8, -76);
        ctx.quadraticCurveTo(26, -38, 27, 10);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(48,61,80,.22)';
        ctx.lineWidth = 3;
        ctx.stroke();
        // внутренняя часть
        ctx.fillStyle = o.sad ? '#cf9aa6' : '#eaa9b7';
        ctx.beginPath();
        ctx.moveTo(-14, 4);
        ctx.quadraticCurveTo(-24, -34, -5, -55);
        ctx.quadraticCurveTo(13, -30, 14, 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // форма головы
      const hg = ctx.createLinearGradient(-70, -90, 60, 60);
      hg.addColorStop(0, '#cbd7e5');
      hg.addColorStop(0.5, '#a8b9ce');
      hg.addColorStop(1, '#93a6bf');
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.ellipse(0, -4, 86, 78, 0, 0, U.TAU);
      ctx.fill();

      // пушистые щёки
      ctx.fillStyle = '#a2b4ca';
      [-1, 1].forEach((side) => {
        ctx.beginPath();
        ctx.moveTo(side * 78, -18);
        ctx.lineTo(side * 100, -2);
        ctx.lineTo(side * 80, 10);
        ctx.lineTo(side * 98, 26);
        ctx.lineTo(side * 72, 34);
        ctx.lineTo(side * 64, 6);
        ctx.closePath();
        ctx.fill();
      });

      // чёлка / хохолок
      ctx.fillStyle = '#b9c8da';
      ctx.beginPath();
      ctx.moveTo(-22, -78);
      ctx.quadraticCurveTo(-12, -100, 2, -80);
      ctx.quadraticCurveTo(12, -102, 24, -78);
      ctx.quadraticCurveTo(6, -70, -22, -78);
      ctx.fill();

      // тёмная маска вокруг глаз
      ctx.fillStyle = 'rgba(120,138,160,.18)';
      U.ellipse(ctx, 0, -22, 62, 42);
      ctx.fill();

      // морда
      const mg = ctx.createLinearGradient(0, 6, 0, 64);
      mg.addColorStop(0, '#fbfdff');
      mg.addColorStop(1, '#dfe8f2');
      ctx.fillStyle = mg;
      U.ellipse(ctx, 0, 30, 49, 36);
      ctx.fill();

      // глаза
      this._drawEyes(ctx, o);

      // нос
      ctx.fillStyle = COL.nose;
      ctx.beginPath();
      ctx.moveTo(-13, 8);
      ctx.quadraticCurveTo(-14, 2, -7, 1);
      ctx.lineTo(7, 1);
      ctx.quadraticCurveTo(14, 2, 13, 8);
      ctx.quadraticCurveTo(9, 18, 0, 20);
      ctx.quadraticCurveTo(-9, 18, -13, 8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.45)';
      U.ellipse(ctx, -4, 6, 3.4, 2.4);
      ctx.fill();

      // рот
      this._drawMouth(ctx, o);

      // брови
      if (!o.happy) {
        ctx.strokeStyle = 'rgba(64,78,98,.65)';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        [-1, 1].forEach((side) => {
          ctx.save();
          ctx.translate(side * 36, -50);
          ctx.rotate(side * (o.sad ? 0.28 : o.hungry ? 0.18 : -0.06));
          ctx.beginPath();
          ctx.moveTo(-13, 0);
          ctx.quadraticCurveTo(0, -5, 13, 0);
          ctx.stroke();
          ctx.restore();
        });
      }

      // румянец
      if (o.blush) {
        ctx.fillStyle = COL.blush;
        U.ellipse(ctx, -54, 24, 16, 9);
        ctx.fill();
        U.ellipse(ctx, 54, 24, 16, 9);
        ctx.fill();
      }

      // усы-точки
      ctx.fillStyle = 'rgba(110,125,145,.5)';
      [-1, 1].forEach((side) => {
        for (let i = 0; i < 3; i++) {
          U.circle(ctx, side * (22 + i * 3), 32 + (i - 1) * 7, 1.7);
          ctx.fill();
        }
      });

      // тревога «надо в туалет»
      if (o.urgent) {
        ctx.save();
        ctx.translate(76, -92);
        ctx.rotate(Math.sin(t * 8) * 0.15);
        ctx.fillStyle = '#ff6b73';
        ctx.font = '900 34px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('!', 0, 0);
        ctx.restore();
      }
    }

    _drawEyes(ctx, o) {
      const eY = -18;
      const eX = 35;
      const blink = o.blink || 0;
      const open = 1 - Math.min(1, blink);
      const happyClose = o.happy && this.petT > 0.25;
      const washClose = this.pose === 'wash';
      const sleepy = o.sleepy;

      [-1, 1].forEach((side) => {
        ctx.save();
        ctx.translate(side * eX, eY);
        if (side === 1) {
          // лёгкая асимметрия не нужна — просто оставляем
        }

        if (happyClose || washClose) {
          ctx.strokeStyle = '#42506a';
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.arc(0, 4, 15, Math.PI * 1.15, Math.PI * 1.85);
          ctx.stroke();
          ctx.restore();
          return;
        }

        // белок
        ctx.fillStyle = '#ffffff';
        U.ellipse(ctx, 0, 0, 21, 23);
        ctx.fill();

        // зрачок + радужка
        const lx = this.lookX * 5;
        const ly = this.lookY * 4;
        ctx.save();
        U.ellipse(ctx, 0, 0, 21, 23);
        ctx.clip();
        const ig = ctx.createRadialGradient(lx - 2, ly - 3, 1, lx, ly, 13);
        ig.addColorStop(0, '#ffd97a');
        ig.addColorStop(0.6, COL.iris);
        ig.addColorStop(1, COL.irisDark);
        ctx.fillStyle = ig;
        U.circle(ctx, lx, ly, 12.5);
        ctx.fill();
        ctx.fillStyle = COL.pupil;
        U.circle(ctx, lx, ly + 1, 7.6);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.9)';
        U.circle(ctx, lx - 4.5, ly - 5, 3.6);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.55)';
        U.circle(ctx, lx + 4, ly + 4, 1.8);
        ctx.fill();

        // веко для сна
        const lid = Math.max(sleepy ? 0.42 : 0, 1 - open);
        if (lid > 0.02) {
          ctx.fillStyle = '#b3c2d4';
          ctx.fillRect(-24, -26, 48, 30 + 22 * lid);
          ctx.strokeStyle = 'rgba(60,75,95,.55)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-21, -24 + 48 * lid);
          ctx.quadraticCurveTo(0, -19 + 48 * lid, 21, -24 + 48 * lid);
          ctx.stroke();
        }
        ctx.restore();

        // контур глаза
        ctx.strokeStyle = 'rgba(58,72,92,.55)';
        ctx.lineWidth = 3;
        U.ellipse(ctx, 0, 0, 21, 23);
        ctx.stroke();

        ctx.restore();
      });

      // блик-перевязка (очки) — очень лёгкая линия между глаз
      ctx.strokeStyle = 'rgba(90,108,130,.18)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-13, -30);
      ctx.quadraticCurveTo(0, -36, 13, -30);
      ctx.stroke();
    }

    _drawMouth(ctx, o) {
      const m = this.mouth;
      const sad = o.sad;
      ctx.strokeStyle = 'rgba(60,72,92,.72)';
      ctx.lineWidth = 3.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 19);
      if (m < 0.08) {
        if (sad) {
          ctx.moveTo(-16, 40);
          ctx.quadraticCurveTo(0, 32, 16, 40);
        } else {
          ctx.moveTo(-15, 32);
          ctx.quadraticCurveTo(-7, 40, 0, 33);
          ctx.quadraticCurveTo(7, 40, 15, 32);
        }
        ctx.stroke();
      } else {
        // открытый рот
        const open = 5 + m * 17;
        ctx.save();
        ctx.fillStyle = COL.mouth;
        ctx.beginPath();
        ctx.moveTo(-16, 32);
        ctx.quadraticCurveTo(0, 30, 16, 32);
        ctx.quadraticCurveTo(10, 32 + open, 0, 33 + open);
        ctx.quadraticCurveTo(-10, 32 + open, -16, 32);
        ctx.closePath();
        ctx.fill();
        // язык
        ctx.fillStyle = COL.tongue;
        U.ellipse(ctx, 0, 33 + open * 0.62, 8, 4 + m * 4);
        ctx.fill();
        ctx.restore();
        ctx.beginPath();
        ctx.moveTo(0, 19);
        ctx.lineTo(0, 26);
        ctx.stroke();
      }
    }

    _drawSmudges(ctx, bodyY) {
      const st = this.stats;
      const a = U.clamp((45 - st.hygiene) / 45, 0, 0.55);
      if (a <= 0) return;
      ctx.save();
      ctx.translate(0, bodyY);
      ctx.fillStyle = 'rgba(94,77,58,' + a + ')';
      this.smudges.forEach((s) => {
        U.ellipse(ctx, s.x, s.y, s.r, s.r * 0.72);
        ctx.fill();
      });
      // запашок
      ctx.strokeStyle = 'rgba(140,190,120,' + a * 0.8 + ')';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      for (let i = 0; i < 2; i++) {
        const ph = (this.t * 1.2 + i * 0.8) % 1;
        ctx.beginPath();
        ctx.moveTo(70 + i * 12, -330 - ph * 40);
        ctx.quadraticCurveTo(80 + i * 12, -350 - ph * 40, 70 + i * 12, -370 - ph * 40);
        ctx.stroke();
      }
      ctx.restore();
    }

    /* ---------- сидит (туалет) ---------- */
    _drawSitting(ctx) {
      const t = this.t;
      const st = this.stats;
      U.groundShadow(ctx, 0, -2, 110, 24, 0.3);

      // хвост сбоку
      ctx.save();
      ctx.translate(-60, -120);
      ctx.rotate(-0.5 + Math.sin(t * 2.3) * 0.08);
      ctx.strokeStyle = '#93a6bf';
      ctx.lineWidth = 30;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-50, 20, -76, -30);
      ctx.stroke();
      ctx.fillStyle = '#e9f0f8';
      U.circle(ctx, -76, -30, 15);
      ctx.fill();
      ctx.restore();

      // тело
      const g = ctx.createLinearGradient(-70, -230, 60, -60);
      g.addColorStop(0, '#c4d2e2');
      g.addColorStop(0.5, '#a2b4ca');
      g.addColorStop(1, '#8497b0');
      ctx.fillStyle = g;
      U.ellipse(ctx, 0, -150, 82, 92);
      ctx.fill();
      ctx.fillStyle = '#e9f0f8';
      U.ellipse(ctx, 0, -128, 54, 66);
      ctx.fill();

      // лапы свешены
      [-1, 1].forEach((side) => {
        ctx.save();
        ctx.translate(side * 38, -96);
        ctx.rotate(side * 0.05);
        const lg = ctx.createLinearGradient(0, 0, 0, 90);
        lg.addColorStop(0, '#8fa2ba');
        lg.addColorStop(1, '#b6c4d6');
        ctx.fillStyle = lg;
        U.rr(ctx, -16, 0, 32, 88, 15);
        ctx.fill();
        ctx.fillStyle = '#dbe5f0';
        U.ellipse(ctx, 0, 86, 19, 12);
        ctx.fill();
        ctx.restore();
      });

      // руки на коленях
      [-1, 1].forEach((side) => {
        ctx.save();
        ctx.translate(side * 66, -206);
        ctx.rotate(side * 0.55);
        ctx.fillStyle = '#a9bacd';
        U.rr(ctx, -15, 0, 30, 66, 15);
        ctx.fill();
        ctx.fillStyle = '#e4ecf5';
        U.ellipse(ctx, 0, 64, 16, 13);
        ctx.fill();
        ctx.restore();
      });

      // голова
      ctx.save();
      ctx.translate(0, -276 + Math.sin(t * 2) * 2);
      ctx.rotate(Math.sin(t * 1.3) * 0.02);
      this._drawHead(ctx, {
        sad: false,
        sleepy: false,
        hungry: st.hunger < 22,
        dirty: false,
        happy: true,
        urgent: false,
        blink: this.blink,
        mouth: Math.max(this.mouth, 0.12),
        earTwitch: this.earTwitch,
        blush: true,
      });
      ctx.restore();
    }

    /* ---------- спит ---------- */
    _drawSleeping(ctx) {
      const t = this.t;
      const breath = Math.sin(t * 1.5) * 3;
      U.groundShadow(ctx, 10, 4, 168, 30, 0.3);

      // свернувшийся хвост
      ctx.strokeStyle = '#93a6bf';
      ctx.lineWidth = 34;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-120, -52);
      ctx.quadraticCurveTo(-168, -80, -150, -122);
      ctx.quadraticCurveTo(-132, -152, -92, -140);
      ctx.stroke();
      ctx.fillStyle = '#e9f0f8';
      U.circle(ctx, -94, -140, 17);
      ctx.fill();

      // тело лежит
      const g = ctx.createLinearGradient(-120, -180, 100, -20);
      g.addColorStop(0, '#c4d2e2');
      g.addColorStop(0.5, '#a2b4ca');
      g.addColorStop(1, '#8497b0');
      ctx.fillStyle = g;
      U.ellipse(ctx, -18, -82 + breath * 0.4, 140, 70 + breath * 0.8);
      ctx.fill();

      // светлый живот
      ctx.fillStyle = '#e9f0f8';
      U.ellipse(ctx, 10, -70 + breath * 0.4, 96, 44 + breath * 0.6);
      ctx.fill();

      // задняя лапка
      ctx.fillStyle = '#9cadc4';
      U.ellipse(ctx, 68, -58, 46, 30);
      ctx.fill();

      // передние лапки под головой
      ctx.fillStyle = '#dbe5f0';
      U.ellipse(ctx, 118, -32, 44, 17, -0.08);
      ctx.fill();
      U.ellipse(ctx, 86, -26, 36, 15, 0.05);
      ctx.fill();

      // голова на лапах
      ctx.save();
      ctx.translate(112, -104 + breath * 0.8);
      ctx.rotate(0.07);
      ctx.scale(0.92, 0.92);
      // уши (опущены)
      [-1, 1].forEach((side) => {
        ctx.save();
        ctx.translate(side * 46, -56);
        ctx.rotate(side * 0.28);
        ctx.fillStyle = '#aebfd2';
        ctx.beginPath();
        ctx.moveTo(-27, 12);
        ctx.quadraticCurveTo(-44, -44, -8, -76);
        ctx.quadraticCurveTo(26, -38, 27, 10);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#e0a3b1';
        ctx.beginPath();
        ctx.moveTo(-14, 4);
        ctx.quadraticCurveTo(-24, -34, -5, -55);
        ctx.quadraticCurveTo(13, -30, 14, 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });
      const hg = ctx.createLinearGradient(-70, -90, 60, 60);
      hg.addColorStop(0, '#cbd7e5');
      hg.addColorStop(0.55, '#a8b9ce');
      hg.addColorStop(1, '#93a6bf');
      ctx.fillStyle = hg;
      U.ellipse(ctx, 0, -4, 86, 78);
      ctx.fill();
      // щёки
      ctx.fillStyle = '#a2b4ca';
      [-1, 1].forEach((side) => {
        ctx.beginPath();
        ctx.moveTo(side * 78, -18);
        ctx.lineTo(side * 98, -2);
        ctx.lineTo(side * 80, 10);
        ctx.lineTo(side * 96, 26);
        ctx.lineTo(side * 72, 34);
        ctx.lineTo(side * 64, 6);
        ctx.closePath();
        ctx.fill();
      });
      // морда
      ctx.fillStyle = '#f5f9fd';
      U.ellipse(ctx, 0, 30, 48, 35);
      ctx.fill();
      // закрытые глаза
      [-1, 1].forEach((side) => {
        ctx.strokeStyle = '#46556e';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(side * 35, -12, 15, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();
      });
      // нос
      ctx.fillStyle = COL.nose;
      ctx.beginPath();
      ctx.moveTo(-12, 8);
      ctx.quadraticCurveTo(-6, 1, 0, 1);
      ctx.quadraticCurveTo(6, 1, 12, 8);
      ctx.quadraticCurveTo(6, 18, 0, 18);
      ctx.quadraticCurveTo(-6, 18, -12, 8);
      ctx.fill();
      // ротик
      ctx.strokeStyle = 'rgba(60,72,92,.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-9, 28);
      ctx.quadraticCurveTo(0, 33, 9, 28);
      ctx.stroke();
      // румянец
      ctx.fillStyle = 'rgba(244,143,162,.3)';
      U.ellipse(ctx, -52, 24, 14, 8);
      ctx.fill();
      U.ellipse(ctx, 52, 24, 14, 8);
      ctx.fill();
      ctx.restore();
    }
  }

  window.Wolf = Wolf;
})();
