/* ============ Локации: зал, кухня, ванная, спальня ============ */
(function () {
  'use strict';

  const U = window.U;

  /* ---------- общие помощники ---------- */
  function wallFill(ctx, top, mid, bottom) {
    const g = ctx.createLinearGradient(0, 0, 0, 470);
    g.addColorStop(0, top);
    g.addColorStop(0.55, mid);
    g.addColorStop(1, bottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1280, 480);
  }

  function floorFill(ctx, top, c1, c2, verticals) {
    const g = ctx.createLinearGradient(0, top, 0, 720);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fillRect(0, top, 1280, 720 - top);

    ctx.save();
    let y = top, h = 16, i = 0;
    while (y < 720 && i < 22) {
      ctx.fillStyle = i % 2 ? 'rgba(0,0,0,.055)' : 'rgba(255,255,255,.035)';
      ctx.fillRect(0, y, 1280, h + 1);
      y += h;
      h *= 1.19;
      i++;
    }
    ctx.strokeStyle = 'rgba(0,0,0,.10)';
    ctx.lineWidth = 1.6;
    for (let x = -700; x <= 2000; x += verticals || 170) {
      ctx.beginPath();
      ctx.moveTo(640 + (x - 640) * 0.4, top);
      ctx.lineTo(x, 724);
      ctx.stroke();
    }
    ctx.restore();
  }

  function baseboard(ctx, y, color) {
    ctx.fillStyle = color || 'rgba(255,255,255,.28)';
    ctx.fillRect(0, y - 14, 1280, 14);
    ctx.fillStyle = 'rgba(0,0,0,.12)';
    ctx.fillRect(0, y, 1280, 5);
  }

  function rug(ctx, x, y, w, h, c1, c2, accent) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.12)';
    U.ellipse(ctx, x + w / 2, y + h / 2 + 6, w / 2, h / 2);
    ctx.fill();
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    U.rr(ctx, x, y, w, h, h / 2);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 5;
    U.rr(ctx, x + 12, y + 10, w - 24, h - 20, (h - 20) / 2);
    ctx.stroke();
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    const cx = x + w / 2;
    for (let i = 0; i < 3; i++) {
      const dx = (i - 1) * w * 0.22;
      ctx.beginPath();
      ctx.moveTo(cx + dx, y + 22);
      ctx.lineTo(cx + dx + 18, y + h / 2);
      ctx.lineTo(cx + dx, y + h - 22);
      ctx.lineTo(cx + dx - 18, y + h / 2);
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
  }

  function plant(ctx, x, y, scale, potColor) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale || 1, scale || 1);
    U.groundShadow(ctx, 0, 0, 50, 12, 0.22);
    // листья
    const leaves = [
      [-30, -150, -34, -60, 26],
      [26, -170, 30, -70, -24],
      [-6, -195, 4, -80, 10],
      [-46, -110, -50, -50, 46],
      [48, -120, 52, -54, -44],
    ];
    leaves.forEach(([lx, ly, cx, cy, rot]) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rot * Math.PI) / 180);
      const g = ctx.createLinearGradient(0, 0, lx, ly);
      g.addColorStop(0, '#4f8f5c');
      g.addColorStop(1, '#7cc47f');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(lx / 2, ly / 2, 22, 56, 0, 0, U.TAU);
      ctx.fill();
      ctx.restore();
    });
    // горшок
    const pg = ctx.createLinearGradient(-40, -60, 40, 0);
    pg.addColorStop(0, potColor || '#c9775a');
    pg.addColorStop(1, '#a95c45');
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.moveTo(-42, -60);
    ctx.lineTo(42, -60);
    ctx.lineTo(30, 0);
    ctx.lineTo(-30, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.22)';
    U.rr(ctx, -45, -66, 90, 14, 6);
    ctx.fill();
    ctx.restore();
  }

  function windowDay(ctx, x, y, w, h) {
    ctx.save();
    U.rr(ctx, x - 14, y - 14, w + 28, h + 28, 12);
    ctx.fillStyle = '#f6efe3';
    ctx.fill();
    const sky = ctx.createLinearGradient(0, y, 0, y + h);
    sky.addColorStop(0, '#8ed4f5');
    sky.addColorStop(0.6, '#bfe9fa');
    sky.addColorStop(1, '#e9f7ef');
    ctx.fillStyle = sky;
    ctx.fillRect(x, y, w, h);
    // солнце
    ctx.fillStyle = 'rgba(255,240,170,.85)';
    U.circle(ctx, x + w * 0.76, y + h * 0.24, 30);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,246,200,.35)';
    U.circle(ctx, x + w * 0.76, y + h * 0.24, 48);
    ctx.fill();
    // облака
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    [[0.22, 0.28, 1], [0.5, 0.18, 0.8], [0.3, 0.5, 0.7]].forEach(([cx, cy, s]) => {
      const cw = 54 * s, ch = 20 * s;
      U.ellipse(ctx, x + w * cx, y + h * cy, cw * 0.6, ch);
      ctx.fill();
      U.ellipse(ctx, x + w * cx - cw * 0.35, y + h * cy + 4, cw * 0.4, ch * 0.8);
      ctx.fill();
      U.ellipse(ctx, x + w * cx + cw * 0.4, y + h * cy + 3, cw * 0.45, ch * 0.85);
      ctx.fill();
    });
    // холмы
    ctx.fillStyle = '#9ed6a8';
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.quadraticCurveTo(x + w * 0.3, y + h * 0.68, x + w * 0.62, y + h * 0.84);
    ctx.quadraticCurveTo(x + w * 0.85, y + h * 0.92, x + w, y + h * 0.78);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#86c793';
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.quadraticCurveTo(x + w * 0.4, y + h * 0.86, x + w * 0.75, y + h);
    ctx.closePath();
    ctx.fill();
    // переплёт
    ctx.strokeStyle = '#f6efe3';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w / 2, y + h);
    ctx.moveTo(x, y + h * 0.5);
    ctx.lineTo(x + w, y + h * 0.5);
    ctx.stroke();
    // блик
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(x + 10, y + h);
    ctx.lineTo(x + w * 0.5, y);
    ctx.lineTo(x + w * 0.66, y);
    ctx.lineTo(x + 40, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    // подоконник
    ctx.fillStyle = '#e7dcc9';
    U.rr(ctx, x - 22, y + h + 10, w + 44, 16, 5);
    ctx.fill();
    // шторы
    const curtain = (cx, dir) => {
      ctx.save();
      const g = ctx.createLinearGradient(cx, y - 20, cx + dir * 46, y + h + 20);
      g.addColorStop(0, '#e8b48c');
      g.addColorStop(1, '#cf8f6a');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(cx, y - 26);
      ctx.lineTo(cx + dir * 54, y - 26);
      ctx.quadraticCurveTo(cx + dir * 24, y + h * 0.4, cx + dir * 60, y + h + 16);
      ctx.lineTo(cx - dir * 4, y + h + 16);
      ctx.quadraticCurveTo(cx + dir * 16, y + h * 0.45, cx, y - 26);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    curtain(x - 20, -1);
    curtain(x + w + 20, 1);
    // карниз
    ctx.fillStyle = '#8a6a52';
    U.rr(ctx, x - 40, y - 34, w + 80, 10, 5);
    ctx.fill();
  }

  function windowNight(ctx, x, y, w, h) {
    ctx.save();
    U.rr(ctx, x - 14, y - 14, w + 28, h + 28, 12);
    ctx.fillStyle = '#3c4668';
    ctx.fill();
    const sky = ctx.createLinearGradient(0, y, 0, y + h);
    sky.addColorStop(0, '#131a3a');
    sky.addColorStop(0.7, '#2a345f');
    sky.addColorStop(1, '#464f7d');
    ctx.fillStyle = sky;
    ctx.fillRect(x, y, w, h);
    // луна
    ctx.fillStyle = 'rgba(255,245,205,.95)';
    U.circle(ctx, x + w * 0.7, y + h * 0.25, 28);
    ctx.fill();
    ctx.fillStyle = '#2a345f';
    U.circle(ctx, x + w * 0.7 + 12, y + h * 0.22, 25);
    ctx.fill();
    // звёзды
    for (let i = 0; i < 18; i++) {
      const sx = x + ((i * 83) % w);
      const sy = y + ((i * 47) % (h - 20)) + 8;
      const a = 0.4 + 0.6 * Math.abs(Math.sin(i * 1.7));
      ctx.fillStyle = 'rgba(255,245,210,' + a + ')';
      U.circle(ctx, sx, sy, i % 5 === 0 ? 2 : 1.2);
      ctx.fill();
    }
    // город
    ctx.fillStyle = '#1a2340';
    const base = y + h;
    for (let i = 0; i < 9; i++) {
      const bw = w / 9 + 2;
      const bh = 24 + ((i * 13) % 38);
      ctx.fillRect(x + i * (w / 9), base - bh, bw, bh);
      ctx.fillStyle = 'rgba(255,220,130,.5)';
      for (let j = 0; j < 3; j++) {
        ctx.fillRect(x + i * (w / 9) + 5 + (j % 2) * 9, base - bh + 8 + j * 9, 3, 4);
      }
      ctx.fillStyle = '#1a2340';
    }
    // переплёт
    ctx.strokeStyle = '#3c4668';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w / 2, y + h);
    ctx.moveTo(x, y + h * 0.5);
    ctx.lineTo(x + w, y + h * 0.5);
    ctx.stroke();
    ctx.globalAlpha = 0.10;
    ctx.fillStyle = '#dfe8ff';
    ctx.beginPath();
    ctx.moveTo(x + 10, y + h);
    ctx.lineTo(x + w * 0.5, y);
    ctx.lineTo(x + w * 0.64, y);
    ctx.lineTo(x + 40, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#2d3552';
    U.rr(ctx, x - 22, y + h + 10, w + 44, 16, 5);
    ctx.fill();
    // шторы
    [[x - 20, -1], [x + w + 20, 1]].forEach(([cx, dir]) => {
      ctx.save();
      const g = ctx.createLinearGradient(cx, y - 20, cx + dir * 46, y + h + 20);
      g.addColorStop(0, '#5a5f92');
      g.addColorStop(1, '#41466e');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(cx, y - 26);
      ctx.lineTo(cx + dir * 54, y - 26);
      ctx.quadraticCurveTo(cx + dir * 24, y + h * 0.4, cx + dir * 60, y + h + 16);
      ctx.lineTo(cx - dir * 4, y + h + 16);
      ctx.quadraticCurveTo(cx + dir * 16, y + h * 0.45, cx, y - 26);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
    ctx.fillStyle = '#454c72';
    U.rr(ctx, x - 40, y - 34, w + 80, 10, 5);
    ctx.fill();
  }

  function vignette(ctx) {
    const g = ctx.createRadialGradient(640, 360, 240, 640, 360, 760);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(12,18,28,.35)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1280, 720);
  }

  function warmGlow(ctx, x, y, r, color, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, U.hexA(color, alpha));
    g.addColorStop(0.6, U.hexA(color, alpha * 0.35));
    g.addColorStop(1, U.hexA(color, 0));
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, U.TAU);
    ctx.fill();
    ctx.restore();
  }

  function dust(ctx, t, count, x0, y0, w, h) {
    ctx.save();
    for (let i = 0; i < count; i++) {
      const px = x0 + ((i * 137.5 + Math.sin(t * 0.25 + i) * 30) % w);
      const py = y0 + ((i * 83.3 + t * (6 + (i % 5)) ) % h);
      const a = 0.10 + 0.22 * Math.abs(Math.sin(t * 0.7 + i * 2));
      ctx.fillStyle = 'rgba(255,246,220,' + a + ')';
      U.circle(ctx, px, py, i % 4 === 0 ? 2 : 1.2);
      ctx.fill();
    }
    ctx.restore();
  }

  function frame(ctx, x, y, w, h, art) {
    ctx.fillStyle = '#c9a97a';
    U.rr(ctx, x, y, w, h, 4);
    ctx.fill();
    ctx.fillStyle = '#f4ead8';
    ctx.fillRect(x + 7, y + 7, w - 14, h - 14);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 9, y + 9, w - 18, h - 18);
    ctx.clip();
    art(x + 9, y + 9, w - 18, h - 18);
    ctx.restore();
  }

  /* ================= ЗАЛ ================= */
  const hall = {
    id: 'hall',
    name: 'Зал',
    emoji: '🛋️',
    wolfX: 560,
    floorY: 604,
    scale: 0.92,
    hotspots: [
      { x: 64, y: 230, w: 274, h: 210, label: 'Телевизор', action: 'tv' },
      { x: 806, y: 330, w: 360, h: 250, label: 'Диван', action: 'sofa' },
    ],

    draw(ctx, t, st) {
      wallFill(ctx, '#f5e6cf', '#efdcc2', '#e5cfb2');
      // обои в полоску
      ctx.save();
      ctx.globalAlpha = 0.16;
      for (let x = 0; x < 1280; x += 56) {
        ctx.fillStyle = x % 112 === 0 ? '#d6b98e' : '#fbf0dd';
        ctx.fillRect(x, 0, 26, 470);
      }
      ctx.restore();
      baseboard(ctx, 470, '#f7ead4');
      floorFill(ctx, 470, '#c69a6d', '#8f6540', 172);
      // мягкий свет на полу
      const fl = ctx.createLinearGradient(0, 470, 0, 640);
      fl.addColorStop(0, 'rgba(255,238,200,.22)');
      fl.addColorStop(1, 'rgba(255,238,200,0)');
      ctx.fillStyle = fl;
      ctx.fillRect(0, 470, 1280, 180);

      windowDay(ctx, 476, 96, 236, 236);

      // телевизор
      ctx.fillStyle = '#4a3a34';
      U.rr(ctx, 84, 262, 226, 142, 18);
      ctx.fill();
      ctx.fillStyle = '#20262f';
      U.rr(ctx, 94, 272, 206, 122, 12);
      ctx.fill();
      if (st.tvOn) {
        const g = ctx.createLinearGradient(94, 272, 300, 394);
        g.addColorStop(0, '#8ed4f5');
        g.addColorStop(0.5, '#b9e8c9');
        g.addColorStop(1, '#f7e2a1');
        ctx.fillStyle = g;
        U.rr(ctx, 94, 272, 206, 122, 12);
        ctx.fill();
        ctx.fillStyle = '#6bbf7d';
        ctx.beginPath();
        ctx.moveTo(94, 370);
        ctx.quadraticCurveTo(170, 330, 230, 366);
        ctx.quadraticCurveTo(270, 386, 300, 360);
        ctx.lineTo(300, 394);
        ctx.lineTo(94, 394);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.8)';
        U.circle(ctx, 258, 300, 18);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.14)';
        ctx.beginPath();
        ctx.moveTo(94, 394);
        ctx.lineTo(190, 272);
        ctx.lineTo(238, 272);
        ctx.lineTo(142, 394);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(255,255,255,.05)';
        ctx.beginPath();
        ctx.moveTo(94, 394);
        ctx.lineTo(190, 272);
        ctx.lineTo(238, 272);
        ctx.lineTo(142, 394);
        ctx.closePath();
        ctx.fill();
      }
      // подставка
      ctx.fillStyle = '#5a4740';
      U.rr(ctx, 160, 404, 74, 14, 5);
      ctx.fill();
      U.rr(ctx, 190, 418, 14, 36, 4);
      ctx.fill();
      ctx.fillStyle = '#6d5850';
      U.rr(ctx, 120, 450, 154, 12, 6);
      ctx.fill();
      // индикатор
      ctx.fillStyle = '#ff7b6b';
      U.circle(ctx, 286, 410, 3.5);
      ctx.fill();

      // картина
      frame(ctx, 796, 112, 116, 86, (x, y, w, h) => {
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#a8d7ee');
        g.addColorStop(1, '#e8f4d9');
        ctx.fillStyle = g;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#7fae7f';
        ctx.beginPath();
        ctx.moveTo(x, y + h);
        ctx.lineTo(x + w * 0.35, y + h * 0.45);
        ctx.lineTo(x + w * 0.62, y + h * 0.75);
        ctx.lineTo(x + w * 0.82, y + h * 0.5);
        ctx.lineTo(x + w, y + h);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffd166';
        U.circle(ctx, x + w * 0.78, y + h * 0.25, 9);
        ctx.fill();
      });
      frame(ctx, 934, 132, 78, 98, (x, y, w, h) => {
        ctx.fillStyle = '#f3d9c2';
        ctx.fillRect(x, y, w, h);
        // лапка
        ctx.fillStyle = '#8d9db4';
        U.ellipse(ctx, x + w / 2, y + h * 0.62, 17, 14);
        ctx.fill();
        [[-12, -8], [0, -13], [12, -8]].forEach(([dx, dy]) => {
          U.ellipse(ctx, x + w / 2 + dx, y + h * 0.62 + dy, 6, 7);
          ctx.fill();
        });
      });

      // диван
      ctx.save();
      U.groundShadow(ctx, 990, 590, 200, 26, 0.2);
      // ножки
      ctx.fillStyle = '#6b4a35';
      [830, 1120].forEach((x) => {
        U.rr(ctx, x, 552, 16, 36, 5);
        ctx.fill();
      });
      // спинка
      const sg = ctx.createLinearGradient(0, 336, 0, 540);
      sg.addColorStop(0, '#5f9086');
      sg.addColorStop(1, '#43746c');
      ctx.fillStyle = sg;
      U.rr(ctx, 812, 330, 350, 176, 30);
      ctx.fill();
      // подушки спинки
      ctx.fillStyle = '#6ba095';
      [826, 946, 1066].forEach((x, i) => {
        U.rr(ctx, x, 344, 104, 118, 22);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.09)';
        ctx.lineWidth = 3;
        U.rr(ctx, x + 6, 350, 92, 106, 18);
        ctx.stroke();
      });
      // сиденье
      const sg2 = ctx.createLinearGradient(0, 460, 0, 560);
      sg2.addColorStop(0, '#7db3a7');
      sg2.addColorStop(1, '#578c82');
      ctx.fillStyle = sg2;
      U.rr(ctx, 810, 454, 354, 104, 26);
      ctx.fill();
      // подлокотники
      ctx.fillStyle = '#50867c';
      U.rr(ctx, 798, 420, 46, 128, 22);
      ctx.fill();
      U.rr(ctx, 1132, 420, 46, 128, 22);
      ctx.fill();
      // подушки
      ctx.save();
      ctx.translate(882, 438);
      ctx.rotate(-0.16);
      ctx.fillStyle = '#e8b64f';
      U.rr(ctx, -34, -32, 68, 64, 16);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      U.rr(ctx, -26, -24, 52, 14, 7);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.translate(1092, 440);
      ctx.rotate(0.14);
      ctx.fillStyle = '#d87b6b';
      U.rr(ctx, -32, -30, 64, 60, 16);
      ctx.fill();
      ctx.restore();
      ctx.restore();

      // торшер
      ctx.fillStyle = '#6c5a46';
      U.rr(ctx, 1232, 380, 8, 210, 4);
      ctx.fill();
      U.ellipse(ctx, 1236, 592, 34, 10);
      ctx.fillStyle = '#52422f';
      ctx.fill();
      const lampG = ctx.createLinearGradient(1196, 330, 1276, 330);
      lampG.addColorStop(0, '#f5d9a0');
      lampG.addColorStop(1, '#e8bd70');
      ctx.fillStyle = lampG;
      ctx.beginPath();
      ctx.moveTo(1200, 388);
      ctx.lineTo(1272, 388);
      ctx.lineTo(1258, 320);
      ctx.lineTo(1214, 320);
      ctx.closePath();
      ctx.fill();
      if (st.lampOn !== false) warmGlow(ctx, 1236, 380, 220, '#ffcf7a', 0.35);

      // растение
      plant(ctx, 712, 592, 0.92, '#c9775a');

      // ковёр
      rug(ctx, 380, 566, 380, 108, '#cf6b62', '#a94f4d', 'rgba(255,225,170,.7)');

      // кофейный столик
      ctx.fillStyle = '#8a6244';
      U.rr(ctx, 1010, 574, 170, 12, 6);
      ctx.fill();
      [1028, 1152].forEach((x) => {
        U.rr(ctx, x, 584, 10, 26, 4);
        ctx.fill();
      });
      ctx.fillStyle = '#e9f0f6';
      U.ellipse(ctx, 1052, 566, 16, 7);
      ctx.fill();
      ctx.fillStyle = '#c96a4f';
      U.rr(ctx, 1110, 554, 42, 18, 4);
      ctx.fill();
      ctx.fillStyle = '#f3e4c4';
      ctx.fillRect(1114, 550, 34, 5);

      vignette(ctx);
      dust(ctx, t, 26, 60, 80, 1140, 500);
      warmGlow(ctx, 640, 120, 500, '#ffe3b0', 0.06);
    },
  };

  /* ================= КУХНЯ ================= */
  const kitchen = {
    id: 'kitchen',
    name: 'Кухня',
    emoji: '🍳',
    wolfX: 720,
    floorY: 604,
    scale: 0.92,
    hotspots: [
      { x: 750, y: 540, w: 120, h: 82, label: 'Покормить', action: 'feed' },
      { x: 1108, y: 214, w: 150, h: 360, label: 'Холодильник', action: 'feed' },
    ],

    draw(ctx, t, st) {
      wallFill(ctx, '#fdf3e3', '#f7e9d2', '#efdcc1');
      // плитка
      ctx.save();
      ctx.strokeStyle = 'rgba(206,170,124,.30)';
      ctx.lineWidth = 2;
      for (let x = 0; x <= 1280; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 430);
        ctx.stroke();
      }
      for (let y = 64; y <= 430; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1280, y);
        ctx.stroke();
      }
      ctx.restore();
      baseboard(ctx, 470, '#e9d3ac');
      floorFill(ctx, 470, '#e9d9c1', '#cdb392', 150);
      const kfl = ctx.createLinearGradient(0, 470, 0, 620);
      kfl.addColorStop(0, 'rgba(255,240,205,.3)');
      kfl.addColorStop(1, 'rgba(255,240,205,0)');
      ctx.fillStyle = kfl;
      ctx.fillRect(0, 470, 1280, 160);

      windowDay(ctx, 404, 74, 250, 190);

      // верхние шкафы
      const cab = (x, y, w, h, color) => {
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, color);
        g.addColorStop(1, '#6d9884');
        ctx.fillStyle = g;
        U.rr(ctx, x, y, w, h, 10);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.22)';
        ctx.lineWidth = 3;
        U.rr(ctx, x + 6, y + 6, w - 12, h - 12, 7);
        ctx.stroke();
      };
      cab(30, 66, 300, 120, '#8ab59b');
      cab(720, 66, 260, 120, '#8ab59b');
      cab(30, 198, 300, 110, '#8ab59b');
      // ручки
      ctx.fillStyle = '#d9c187';
      [172, 842].forEach((x) => U.rr(ctx, x, 168, 18, 6, 3));
      [172].forEach((x) => U.rr(ctx, x, 296, 18, 6, 3));
      [172, 842].forEach((x) => { U.rr(ctx, x, 168, 18, 6, 3); ctx.fill(); });
      U.rr(ctx, 172, 296, 18, 6, 3);
      ctx.fill();

      // вытяжка
      ctx.fillStyle = '#b9c3bf';
      U.rr(ctx, 286, 30, 130, 44, 10);
      ctx.fill();
      ctx.fillStyle = '#98a5a1';
      U.rr(ctx, 306, 66, 90, 52, 8);
      ctx.fill();

      // часы
      ctx.fillStyle = '#fff8ec';
      U.circle(ctx, 900, 236, 34);
      ctx.fill();
      ctx.strokeStyle = '#7d6a52';
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.strokeStyle = '#4b3d2c';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(900, 236);
      ctx.lineTo(900, 216);
      ctx.moveTo(900, 236);
      ctx.lineTo(915, 242);
      ctx.stroke();

      // нижние шкафы + столешница (слева)
      ctx.fillStyle = '#7fa88f';
      U.rr(ctx, 20, 352, 366, 190, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.18)';
      ctx.lineWidth = 3;
      [130, 246].forEach((x) => {
        ctx.beginPath();
        ctx.moveTo(x, 366);
        ctx.lineTo(x, 538);
        ctx.stroke();
      });
      ctx.fillStyle = '#d9c187';
      [104, 220, 334].forEach((x) => {
        U.rr(ctx, x, 402, 8, 24, 4);
        ctx.fill();
      });
      // столешница
      const cg = ctx.createLinearGradient(0, 330, 0, 356);
      cg.addColorStop(0, '#f0e3cd');
      cg.addColorStop(1, '#cbb393');
      ctx.fillStyle = cg;
      U.rr(ctx, 12, 332, 382, 22, 7);
      ctx.fill();
      // раковина
      ctx.fillStyle = '#b9c8cc';
      U.ellipse(ctx, 108, 340, 62, 18);
      ctx.fill();
      ctx.fillStyle = '#8fa2a8';
      U.ellipse(ctx, 108, 336, 52, 13);
      ctx.fill();
      ctx.strokeStyle = '#7f9096';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(166, 336);
      ctx.lineTo(166, 296);
      ctx.quadraticCurveTo(166, 280, 148, 280);
      ctx.stroke();
      // чайник
      ctx.fillStyle = '#e07b5f';
      U.rr(ctx, 280, 300, 54, 34, 12);
      ctx.fill();
      ctx.strokeStyle = '#e07b5f';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(306, 300, 17, Math.PI, 0);
      ctx.stroke();

      // плита
      ctx.fillStyle = '#7fa88f';
      U.rr(ctx, 404, 352, 230, 190, 10);
      ctx.fill();
      ctx.fillStyle = '#3b3f46';
      U.rr(ctx, 396, 330, 246, 24, 8);
      ctx.fill();
      // конфорки
      ctx.strokeStyle = 'rgba(255,255,255,.22)';
      ctx.lineWidth = 3;
      [450, 500, 574].forEach((x) => {
        U.ellipse(ctx, x, 342, 17, 6);
        ctx.stroke();
      });
      // духовка
      ctx.fillStyle = '#39434a';
      U.rr(ctx, 420, 384, 198, 128, 8);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.12)';
      U.rr(ctx, 434, 398, 170, 76, 6);
      ctx.fill();
      ctx.fillStyle = '#d9c187';
      U.rr(ctx, 500, 372, 44, 7, 3);
      ctx.fill();
      // кастрюля
      ctx.fillStyle = '#c7d2d8';
      U.rr(ctx, 560, 292, 70, 42, 10);
      ctx.fill();
      ctx.fillStyle = '#9aa8b0';
      U.ellipse(ctx, 560, 294, 35, 6);
      ctx.fill();
      // пар
      ctx.strokeStyle = 'rgba(255,255,255,.45)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 2; i++) {
        const ph = (t * 0.4 + i * 0.5) % 1;
        ctx.beginPath();
        ctx.moveTo(548 + i * 16, 286 - ph * 40);
        ctx.quadraticCurveTo(556 + i * 16, 272 - ph * 40, 548 + i * 16, 258 - ph * 40);
        ctx.stroke();
      }

      // холодильник
      U.groundShadow(ctx, 1180, 592, 92, 18, 0.2);
      const fg = ctx.createLinearGradient(1108, 214, 1258, 574);
      fg.addColorStop(0, '#f2f5f6');
      fg.addColorStop(0.6, '#dbe3e6');
      fg.addColorStop(1, '#c4d0d5');
      ctx.fillStyle = fg;
      U.rr(ctx, 1108, 214, 150, 360, 22);
      ctx.fill();
      ctx.strokeStyle = 'rgba(120,140,150,.25)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(1112, 344);
      ctx.lineTo(1254, 344);
      ctx.stroke();
      ctx.fillStyle = '#9aa9af';
      U.rr(ctx, 1122, 262, 12, 54, 6);
      ctx.fill();
      U.rr(ctx, 1122, 366, 12, 44, 6);
      ctx.fill();
      // магнитики
      ctx.fillStyle = '#e8b64f';
      U.circle(ctx, 1200, 272, 9);
      ctx.fill();
      ctx.fillStyle = '#d87b6b';
      U.rr(ctx, 1182, 300, 30, 24, 5);
      ctx.fill();
      ctx.fillStyle = '#7aa7c7';
      U.circle(ctx, 1232, 400, 7);
      ctx.fill();
      // записка
      ctx.save();
      ctx.translate(1170, 368);
      ctx.rotate(-0.08);
      ctx.fillStyle = '#fff6d8';
      U.rr(ctx, 0, 0, 50, 40, 4);
      ctx.fill();
      ctx.strokeStyle = '#d8cba8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(8, 12);
      ctx.lineTo(42, 12);
      ctx.moveTo(8, 22);
      ctx.lineTo(36, 22);
      ctx.stroke();
      ctx.restore();

      // стол
      ctx.fillStyle = '#f6ead6';
      U.rr(ctx, 840, 468, 260, 20, 8);
      ctx.fill();
      ctx.fillStyle = '#c9a878';
      [870, 1052].forEach((x) => {
        U.rr(ctx, x, 486, 14, 104, 5);
        ctx.fill();
      });
      ctx.fillStyle = '#f3e4c4';
      U.ellipse(ctx, 970, 462, 62, 14);
      ctx.fill();
      ctx.fillStyle = '#e07b5f';
      U.circle(ctx, 946, 452, 15);
      ctx.fill();
      ctx.fillStyle = '#9ccf8f';
      U.circle(ctx, 952, 448, 6);
      ctx.fill();
      ctx.fillStyle = '#f0d59c';
      U.circle(ctx, 998, 456, 12);
      ctx.fill();

      // коврик у миски
      U.ellipse(ctx, 810, 600, 86, 20);
      ctx.fillStyle = '#e8b64f';
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#d9a23d';
      U.ellipse(ctx, 810, 600, 68, 14);
      ctx.fill();

      // миска
      ctx.save();
      U.groundShadow(ctx, 810, 598, 52, 12, 0.25);
      const bowlG = ctx.createLinearGradient(0, 550, 0, 600);
      bowlG.addColorStop(0, '#6fb3d8');
      bowlG.addColorStop(1, '#3f7fa8');
      ctx.fillStyle = bowlG;
      ctx.beginPath();
      ctx.moveTo(766, 552);
      ctx.quadraticCurveTo(810, 614, 854, 552);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#dff0f8';
      U.ellipse(ctx, 810, 552, 44, 11);
      ctx.fill();
      if (st.feedBowl > 0) {
        ctx.fillStyle = '#b5764b';
        U.ellipse(ctx, 810, 552, 36, 8);
        ctx.fill();
        ctx.fillStyle = '#8a5330';
        for (let i = 0; i < 5; i++) {
          U.circle(ctx, 792 + i * 9, 549 - (i % 2) * 3, 5);
          ctx.fill();
        }
      }
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      U.ellipse(ctx, 790, 566, 10, 4, -0.4);
      ctx.fill();
      ctx.restore();

      // петрушка на подоконнике
      plant(ctx, 452, 270, 0.36, '#d3b28a');

      vignette(ctx);
      dust(ctx, t, 20, 300, 80, 900, 460);
      warmGlow(ctx, 580, 300, 420, '#ffe9bd', 0.05);
    },
  };

  /* ================= ВАННАЯ ================= */
  const bathroom = {
    id: 'bathroom',
    name: 'Ванная',
    emoji: '🚽',
    wolfX: 700,
    floorY: 604,
    scale: 0.92,
    toiletSpot: { x: 1030, y: 494 },
    hotspots: [
      { x: 940, y: 396, w: 186, h: 210, label: 'Туалет', action: 'toilet' },
      { x: 36, y: 376, w: 330, h: 210, label: 'Помыться', action: 'wash' },
      { x: 456, y: 330, w: 190, h: 250, label: 'Умыться', action: 'wash' },
    ],
    draw(ctx, t, st) {
      wallFill(ctx, '#cfe9ee', '#b7dde5', '#9ccbd6');
      // плитка
      ctx.save();
      ctx.strokeStyle = 'rgba(64,128,145,.40)';
      ctx.lineWidth = 2;
      for (let x = 0; x <= 1280; x += 62) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 470);
        ctx.stroke();
      }
      for (let y = 0; y <= 470; y += 62) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1280, y);
        ctx.stroke();
      }
      // декоративная полоса
      ctx.fillStyle = 'rgba(58,142,160,.20)';
      ctx.fillRect(0, 250, 1280, 34);
      ctx.fillStyle = 'rgba(255,255,255,.42)';
      for (let x = 10; x < 1280; x += 48) {
        U.circle(ctx, x, 267, 4);
        ctx.fill();
      }
      ctx.restore();
      baseboard(ctx, 470, '#acd3db');

      // окно маленькое
      ctx.fillStyle = '#8fbfca';
      U.rr(ctx, 834, 86, 132, 122, 10);
      ctx.fill();
      ctx.fillStyle = '#f2fbfc';
      U.rr(ctx, 840, 92, 120, 110, 8);
      ctx.fill();
      const sky = ctx.createLinearGradient(0, 92, 0, 202);
      sky.addColorStop(0, '#79c9e8');
      sky.addColorStop(1, '#d6f5f7');
      ctx.fillStyle = sky;
      ctx.fillRect(852, 104, 96, 86);
      ctx.fillStyle = '#fff';
      U.ellipse(ctx, 886, 130, 22, 9);
      ctx.fill();
      ctx.strokeStyle = '#f2fbfc';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(900, 104);
      ctx.lineTo(900, 190);
      ctx.moveTo(852, 147);
      ctx.lineTo(948, 147);
      ctx.stroke();

      // пол
      floorFill(ctx, 470, '#a8ccd3', '#6f9daa', 128);

      // ванна
      ctx.save();
      U.groundShadow(ctx, 208, 590, 176, 22, 0.2);
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      U.rr(ctx, 44, 394, 330, 152, 46);
      ctx.fill();
      const tubG = ctx.createLinearGradient(0, 400, 0, 540);
      tubG.addColorStop(0, '#ffffff');
      tubG.addColorStop(0.65, '#eef7f8');
      tubG.addColorStop(1, '#d3e6e9');
      ctx.fillStyle = tubG;
      U.rr(ctx, 52, 402, 314, 156, 44);
      ctx.fill();
      // вода
      const water = ctx.createLinearGradient(0, 424, 0, 500);
      water.addColorStop(0, '#a8e0ec');
      water.addColorStop(1, '#6fc2d8');
      ctx.fillStyle = water;
      U.rr(ctx, 68, 418, 282, 78, 30);
      ctx.fill();
      // блики воды
      ctx.strokeStyle = 'rgba(255,255,255,.5)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        const off = Math.sin(t * 1.4 + i) * 6;
        ctx.beginPath();
        ctx.moveTo(110 + i * 60 + off, 448);
        ctx.quadraticCurveTo(140 + i * 60 + off, 438, 170 + i * 60 + off, 450);
        ctx.stroke();
      }
      U.ellipse(ctx, 209, 418, 141, 7);
      ctx.fillStyle = '#fff';
      ctx.fill();
      // ножки ванны
      ctx.fillStyle = '#9fb6bb';
      [90, 320].forEach((x) => {
        U.rr(ctx, x, 552, 22, 34, 8);
        ctx.fill();
      });
      // кран
      ctx.strokeStyle = '#8fa6ab';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(330, 404);
      ctx.lineTo(330, 368);
      ctx.quadraticCurveTo(330, 352, 306, 352);
      ctx.stroke();
      // лейка душа
      ctx.fillStyle = '#9fb6bb';
      U.rr(ctx, 244, 300, 22, 66, 10);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(255, 366, 34, 12, -0.25, 0, U.TAU);
      ctx.fill();
      // уточка
      ctx.fillStyle = '#ffd85e';
      U.ellipse(ctx, 286, 410, 20, 14);
      ctx.fill();
      U.circle(ctx, 300, 400, 10);
      ctx.fill();
      ctx.fillStyle = '#e8892b';
      ctx.beginPath();
      ctx.moveTo(308, 400);
      ctx.lineTo(318, 404);
      ctx.lineTo(308, 406);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#3a3330';
      U.circle(ctx, 303, 397, 2);
      ctx.fill();
      ctx.restore();

      // полотенца
      ctx.strokeStyle = '#8a6a52';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(360, 156);
      ctx.lineTo(488, 156);
      ctx.stroke();
      ctx.fillStyle = 'rgba(40,80,90,.16)';
      U.rr(ctx, 382, 172, 96, 106, 8);
      ctx.fill();
      const tg = ctx.createLinearGradient(376, 160, 466, 270);
      tg.addColorStop(0, '#ffb4a8');
      tg.addColorStop(1, '#e27f74');
      ctx.fillStyle = tg;
      U.rr(ctx, 376, 162, 92, 104, 8);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.38)';
      ctx.fillRect(376, 190, 92, 8);
      ctx.fillStyle = 'rgba(255,255,255,.18)';
      ctx.fillRect(388, 168, 12, 92);

      // раковина
      ctx.save();
      U.groundShadow(ctx, 554, 596, 74, 15, 0.18);
      // пьедестал
      const ped = ctx.createLinearGradient(532, 450, 576, 590);
      ped.addColorStop(0, '#f4fbfc');
      ped.addColorStop(1, '#cfe3e7');
      ctx.fillStyle = ped;
      U.rr(ctx, 534, 448, 40, 146, 18);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      U.rr(ctx, 542, 456, 10, 128, 5);
      ctx.fill();
      // чаша
      const basin = ctx.createLinearGradient(0, 408, 0, 472);
      basin.addColorStop(0, '#ffffff');
      basin.addColorStop(1, '#d5e8eb');
      ctx.fillStyle = basin;
      ctx.beginPath();
      ctx.moveTo(492, 424);
      ctx.quadraticCurveTo(496, 468, 554, 470);
      ctx.quadraticCurveTo(612, 468, 616, 424);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(88,132,142,.22)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      U.ellipse(ctx, 554, 422, 64, 20);
      ctx.fill();
      ctx.fillStyle = '#cfe3e7';
      U.ellipse(ctx, 554, 424, 52, 14);
      ctx.fill();
      ctx.fillStyle = '#a9c4c8';
      U.ellipse(ctx, 554, 426, 38, 9);
      ctx.fill();
      // кран
      ctx.strokeStyle = '#9fbcc1';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(554, 416);
      ctx.lineTo(554, 382);
      ctx.quadraticCurveTo(554, 368, 535, 368);
      ctx.stroke();
      ctx.fillStyle = '#9fbcc1';
      U.circle(ctx, 533, 368, 5);
      ctx.fill();
      // мыло
      ctx.save();
      ctx.translate(588, 416);
      ctx.rotate(-0.2);
      ctx.fillStyle = '#ffb4a8';
      U.rr(ctx, -14, -7, 28, 14, 6);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      U.rr(ctx, -10, -4, 12, 5, 2);
      ctx.fill();
      ctx.restore();
      ctx.restore();

      // зеркало
      ctx.fillStyle = '#d6b37a';
      U.rr(ctx, 476, 116, 160, 178, 24);
      ctx.fill();
      ctx.fillStyle = '#b8955f';
      U.rr(ctx, 486, 126, 140, 158, 18);
      ctx.fill();
      const mir = ctx.createLinearGradient(486, 126, 626, 284);
      mir.addColorStop(0, '#dff1f5');
      mir.addColorStop(0.5, '#eef9fb');
      mir.addColorStop(1, '#c9e4e9');
      ctx.fillStyle = mir;
      U.rr(ctx, 488, 128, 136, 154, 18);
      ctx.fill();
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(510, 270);
      ctx.lineTo(586, 150);
      ctx.stroke();
      ctx.restore();

      // унитаз
      ctx.save();
      U.groundShadow(ctx, 1030, 592, 96, 18, 0.22);
      // бачок
      const tank = ctx.createLinearGradient(960, 330, 1100, 430);
      tank.addColorStop(0, '#ffffff');
      tank.addColorStop(1, '#dcecef');
      ctx.fillStyle = tank;
      U.rr(ctx, 966, 330, 128, 110, 18);
      ctx.fill();
      ctx.strokeStyle = 'rgba(88,132,142,.35)';
      ctx.lineWidth = 3;
      U.rr(ctx, 966, 330, 128, 110, 18);
      ctx.stroke();
      ctx.fillStyle = '#cfe3e7';
      U.rr(ctx, 980, 344, 100, 30, 9);
      ctx.fill();
      // кнопка
      ctx.fillStyle = '#a9c4c8';
      U.ellipse(ctx, 1030, 350, 13, 7);
      ctx.fill();
      // чаша
      const bowlG = ctx.createLinearGradient(970, 438, 1090, 570);
      bowlG.addColorStop(0, '#ffffff');
      bowlG.addColorStop(0.7, '#e6f2f4');
      bowlG.addColorStop(1, '#cfe3e7');
      ctx.fillStyle = bowlG;
      ctx.beginPath();
      ctx.moveTo(974, 438);
      ctx.quadraticCurveTo(962, 540, 994, 566);
      ctx.quadraticCurveTo(1030, 588, 1066, 566);
      ctx.quadraticCurveTo(1098, 540, 1086, 438);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(88,132,142,.32)';
      ctx.lineWidth = 3;
      ctx.stroke();
      // сиденье
      const seat = ctx.createLinearGradient(0, 424, 0, 452);
      seat.addColorStop(0, '#ffffff');
      seat.addColorStop(1, '#d8e9ec');
      ctx.fillStyle = seat;
      ctx.beginPath();
      ctx.ellipse(1030, 436, 64, 24, 0, 0, U.TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(88,132,142,.28)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#bcd6da';
      U.ellipse(ctx, 1030, 438, 46, 15);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.14)';
      U.ellipse(ctx, 1030, 440, 32, 10);
      ctx.fill();
      // база
      ctx.fillStyle = '#e2f0f2';
      U.rr(ctx, 1010, 566, 40, 32, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(88,132,142,.25)';
      ctx.lineWidth = 2;
      U.rr(ctx, 1010, 566, 40, 32, 8);
      ctx.stroke();
      ctx.restore();

      // стиральная машина
      U.groundShadow(ctx, 1214, 590, 60, 12, 0.22);
      ctx.fillStyle = '#e4f1f3';
      U.rr(ctx, 1168, 402, 92, 186, 12);
      ctx.fill();
      ctx.strokeStyle = 'rgba(88,132,142,.3)';
      ctx.lineWidth = 3;
      U.rr(ctx, 1168, 402, 92, 186, 12);
      ctx.stroke();
      ctx.fillStyle = '#cfe3e7';
      U.circle(ctx, 1214, 470, 30);
      ctx.fill();
      // тёмное стекло люка
      const glass = ctx.createRadialGradient(1208, 464, 2, 1214, 470, 24);
      glass.addColorStop(0, '#7fa9b2');
      glass.addColorStop(1, '#3f6670');
      ctx.fillStyle = glass;
      U.circle(ctx, 1214, 470, 22);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      U.circle(ctx, 1205, 462, 6);
      ctx.fill();
      ctx.fillStyle = '#b9d1d5';
      U.rr(ctx, 1180, 418, 68, 14, 6);
      ctx.fill();
      ctx.fillStyle = '#5f8a94';
      U.circle(ctx, 1230, 425, 3.5);
      ctx.fill();

      // картина с рыбкой
      frame(ctx, 982, 186, 130, 96, (x, y, w, h) => {
        const wg = ctx.createLinearGradient(x, y, x, y + h);
        wg.addColorStop(0, '#bfe9f4');
        wg.addColorStop(1, '#8ecfdc');
        ctx.fillStyle = wg;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#5fb7a8';
        U.ellipse(ctx, x + w * 0.5, y + h * 0.55, w * 0.24, h * 0.18);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + w * 0.24, y + h * 0.55);
        ctx.lineTo(x + w * 0.08, y + h * 0.4);
        ctx.lineTo(x + w * 0.08, y + h * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#2b4a4a';
        U.circle(ctx, x + w * 0.62, y + h * 0.5, 3);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.5)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(x + w * 0.5, y + h * 0.55, 8 + i * 7, 0.3, Math.PI - 0.3);
          ctx.stroke();
        }
      });

      // коврик
      rug(ctx, 780, 596, 300, 54, '#8fd0d9', '#68aebc', 'rgba(255,255,255,.55)');

      // полка с баночками
      ctx.fillStyle = '#b9d1d5';
      U.rr(ctx, 30, 150, 230, 10, 4);
      ctx.fill();
      const jars = [
        { x: 52, c: '#ffb4a8', h: 44 },
        { x: 98, c: '#a8e0b8', h: 34 },
        { x: 142, c: '#ffd85e', h: 40 },
        { x: 186, c: '#b8c8f0', h: 30 },
      ];
      jars.forEach((j) => {
        ctx.fillStyle = j.c;
        U.rr(ctx, j.x, 150 - j.h, 30, j.h, 7);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.4)';
        ctx.fillRect(j.x + 5, 150 - j.h + 6, 6, j.h - 14);
      });

      vignette(ctx);
      dust(ctx, t, 16, 200, 100, 900, 400);
      warmGlow(ctx, 552, 250, 300, '#d8f6ff', 0.06);
    },
  };

  /* ================= СПАЛЬНЯ ================= */
  const bedroom = {
    id: 'bedroom',
    name: 'Спальня',
    emoji: '🛏️',
    wolfX: 430,
    floorY: 604,
    scale: 0.92,
    sleepSpot: { x: 1006, y: 520 },
    hotspots: [
      { x: 800, y: 300, w: 400, h: 290, label: 'Кровать', action: 'sleep' },
      { x: 700, y: 396, w: 96, h: 130, label: 'Ночник', action: 'lamp' },
    ],

    draw(ctx, t, st) {
      wallFill(ctx, '#5a6694', '#4e5a88', '#3f4a74');
      // звёздные обои
      ctx.save();
      for (let i = 0; i < 46; i++) {
        const x = ((i * 137.5) % 1280);
        const y = ((i * 83.3) % 440) + 16;
        const a = 0.08 + 0.14 * Math.abs(Math.sin(i * 2.1 + t * 0.25));
        ctx.fillStyle = 'rgba(255,240,200,' + a + ')';
        U.circle(ctx, x, y, i % 7 === 0 ? 2.4 : 1.3);
        ctx.fill();
      }
      ctx.restore();
      baseboard(ctx, 470, '#4a557f');
      floorFill(ctx, 470, '#7c6a84', '#544766', 165);
      const bfl = ctx.createLinearGradient(0, 470, 0, 620);
      bfl.addColorStop(0, 'rgba(200,190,255,.12)');
      bfl.addColorStop(1, 'rgba(200,190,255,0)');
      ctx.fillStyle = bfl;
      ctx.fillRect(0, 470, 1280, 160);

      windowNight(ctx, 296, 92, 220, 216);

      // шкаф
      ctx.fillStyle = '#3e4768';
      U.rr(ctx, 24, 218, 196, 352, 10);
      ctx.fill();
      ctx.fillStyle = '#4b567d';
      U.rr(ctx, 38, 230, 82, 328, 8);
      ctx.fill();
      U.rr(ctx, 128, 230, 80, 328, 8);
      ctx.fill();
      ctx.fillStyle = '#c9a96a';
      U.rr(ctx, 110, 384, 9, 30, 4);
      ctx.fill();
      U.rr(ctx, 128, 384, 9, 30, 4);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.08)';
      U.rr(ctx, 44, 238, 70, 120, 6);
      ctx.fill();

      // пол
      // ковёр
      rug(ctx, 300, 572, 380, 96, '#8c6f9e', '#6e5582', 'rgba(240,220,255,.4)');

      // ночной столик
      ctx.fillStyle = '#6d5478';
      U.rr(ctx, 688, 456, 116, 128, 10);
      ctx.fill();
      ctx.fillStyle = '#836691';
      U.rr(ctx, 698, 470, 96, 48, 6);
      ctx.fill();
      ctx.fillStyle = '#c9a96a';
      U.circle(ctx, 746, 494, 5);
      ctx.fill();
      // ночник
      const lit = st.sleeping || st.lampOn === true;
      ctx.fillStyle = '#4a3a55';
      U.rr(ctx, 730, 428, 32, 30, 5);
      ctx.fill();
      ctx.fillStyle = lit ? '#ffe0a0' : '#8d7f9c';
      ctx.beginPath();
      ctx.moveTo(716, 430);
      ctx.lineTo(776, 430);
      ctx.lineTo(762, 386);
      ctx.lineTo(730, 386);
      ctx.closePath();
      ctx.fill();
      if (lit) warmGlow(ctx, 746, 420, 220, '#ffd68a', 0.4);

      // кровать
      ctx.save();
      U.groundShadow(ctx, 1010, 592, 236, 24, 0.25);
      // изголовье
      const hb = ctx.createLinearGradient(1150, 280, 1220, 560);
      hb.addColorStop(0, '#7a5a86');
      hb.addColorStop(1, '#5b4168');
      ctx.fillStyle = hb;
      U.rr(ctx, 1124, 292, 112, 274, 26);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.12)';
      ctx.lineWidth = 3;
      U.rr(ctx, 1136, 306, 88, 246, 20);
      ctx.stroke();
      // каркас
      ctx.fillStyle = '#5a4166';
      U.rr(ctx, 800, 452, 340, 96, 14);
      ctx.fill();
      // матрас
      const mt = ctx.createLinearGradient(0, 420, 0, 500);
      mt.addColorStop(0, '#f7f0e4');
      mt.addColorStop(1, '#e2d6c6');
      ctx.fillStyle = mt;
      U.rr(ctx, 806, 416, 340, 80, 18);
      ctx.fill();
      // простыня
      ctx.fillStyle = '#fdf8ef';
      U.rr(ctx, 816, 424, 320, 40, 12);
      ctx.fill();
      // подушка
      ctx.fillStyle = '#fffaf0';
      U.rr(ctx, 1046, 402, 82, 46, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(180,160,140,.35)';
      ctx.lineWidth = 2;
      U.rr(ctx, 1054, 410, 66, 30, 12);
      ctx.stroke();
      // одеяло (фон)
      const bl = ctx.createLinearGradient(0, 458, 0, 540);
      bl.addColorStop(0, '#9a80c4');
      bl.addColorStop(1, '#7a5fa8');
      ctx.fillStyle = bl;
      ctx.beginPath();
      ctx.moveTo(812, 466);
      ctx.quadraticCurveTo(880, 448, 960, 466);
      ctx.lineTo(1050, 466);
      ctx.lineTo(1050, 540);
      ctx.lineTo(812, 540);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.14)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(820 + i * 56, 476);
        ctx.quadraticCurveTo(846 + i * 56, 500, 820 + i * 56, 528);
        ctx.stroke();
      }
      // ножки
      ctx.fillStyle = '#4a3556';
      [826, 1102].forEach((x) => {
        U.rr(ctx, x, 544, 18, 44, 5);
        ctx.fill();
      });
      ctx.restore();

      // игрушки на полу
      ctx.fillStyle = '#e8b64f';
      U.circle(ctx, 298, 640, 17);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.4)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(298, 640, 10, 0.4, 2.2);
      ctx.stroke();
      ctx.save();
      ctx.translate(700, 646);
      ctx.rotate(0.3);
      ctx.fillStyle = '#f3ead8';
      U.bonePath(ctx, 0, 0, 1.5);
      ctx.fill();
      ctx.restore();

      // картина-облако
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#2f3a60';
      U.rr(ctx, 60, 96, 150, 90, 14);
      ctx.fill();
      ctx.fillStyle = '#f7e7b0';
      U.circle(ctx, 98, 132, 12);
      ctx.fill();
      U.circle(ctx, 128, 156, 7);
      ctx.fill();
      U.circle(ctx, 170, 120, 5);
      ctx.fill();
      ctx.restore();

      // ночной режим
      if (st.sleeping) {
        ctx.fillStyle = 'rgba(22,28,58,.42)';
        ctx.fillRect(0, 0, 1280, 720);
        warmGlow(ctx, 746, 420, 320, '#ffd68a', 0.2);
      }

      vignette(ctx);
      dust(ctx, t, 14, 200, 120, 900, 380);
    },

    drawFront(ctx, t, st, wolf) {
      if (!st.sleeping) return;
      // одеяло поверх волчонка
      const bl = ctx.createLinearGradient(0, 458, 0, 556);
      bl.addColorStop(0, '#a98fd0');
      bl.addColorStop(1, '#7f64ad');
      ctx.fillStyle = bl;
      ctx.beginPath();
      ctx.moveTo(818, 476);
      ctx.quadraticCurveTo(870, 460, 930, 474);
      ctx.quadraticCurveTo(990, 486, 1062, 470);
      ctx.lineTo(1062, 548);
      ctx.lineTo(818, 548);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.16)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(840 + i * 46, 480);
        ctx.quadraticCurveTo(860 + i * 46, 505, 840 + i * 46, 540);
        ctx.stroke();
      }
      ctx.fillStyle = '#fdf8ef';
      ctx.beginPath();
      ctx.moveTo(818, 476);
      ctx.quadraticCurveTo(870, 460, 930, 474);
      ctx.quadraticCurveTo(990, 486, 1062, 470);
      ctx.lineTo(1062, 484);
      ctx.quadraticCurveTo(990, 500, 930, 488);
      ctx.quadraticCurveTo(870, 474, 818, 490);
      ctx.closePath();
      ctx.fill();
    },
  };

  window.Rooms = [hall, kitchen, bathroom, bedroom];
})();
