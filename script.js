/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   1. AUDIO  â€”  Web Audio API, sin archivos externos
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const SFX = (() => {
  let ctx = null;
  const get = () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };
  const eat = () => {
    try {
      const c = get(), t = c.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const o = c.createOscillator(), g = c.createGain();
        o.connect(g); g.connect(c.destination);
        o.type = 'square'; o.frequency.value = freq;
        const s = t + i * 0.055;
        g.gain.setValueAtTime(0, s);
        g.gain.linearRampToValueAtTime(0.14, s + 0.012);
        g.gain.exponentialRampToValueAtTime(0.001, s + 0.11);
        o.start(s); o.stop(s + 0.13);
      });
    } catch(_) {}
  };
  const die = () => {
    try {
      const c = get(), t = c.currentTime;
      [[300, 55, 0, 0.48, 'sawtooth', 0.25], [180, 45, 0.2, 0.7, 'square', 0.18]]
        .forEach(([f0, f1, delay, dur, type, vol]) => {
          const o = c.createOscillator(), g = c.createGain();
          o.connect(g); g.connect(c.destination);
          o.type = type;
          o.frequency.setValueAtTime(f0, t + delay);
          o.frequency.exponentialRampToValueAtTime(f1, t + delay + dur);
          g.gain.setValueAtTime(vol, t + delay);
          g.gain.exponentialRampToValueAtTime(0.001, t + delay + dur + 0.05);
          o.start(t + delay); o.stop(t + delay + dur + 0.1);
        });
    } catch(_) {}
  };
  const start = () => {
    try {
      const c = get(), t = c.currentTime;
      const o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = 'triangle';
      o.frequency.setValueAtTime(220, t);
      o.frequency.exponentialRampToValueAtTime(880, t + 0.18);
      g.gain.setValueAtTime(0.18, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      o.start(t); o.stop(t + 0.24);
    } catch(_) {}
  };
  return { eat, die, start };
})();


/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   2. CANVAS DRAWING FUNCTIONS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

/* Rounded rectangle path helper */
function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
}

/* Eye positions based on direction */
function eyePos(x, y, cs, dir) {
  const cx = x + cs / 2, cy = y + cs / 2;
  const fwd = cs * 0.2, side = cs * 0.215;
  const map = {
    RIGHT: [{ ex: cx + fwd, ey: cy - side }, { ex: cx + fwd, ey: cy + side }],
    LEFT:  [{ ex: cx - fwd, ey: cy - side }, { ex: cx - fwd, ey: cy + side }],
    UP:    [{ ex: cx - side, ey: cy - fwd }, { ex: cx + side, ey: cy - fwd }],
    DOWN:  [{ ex: cx - side, ey: cy + fwd }, { ex: cx + side, ey: cy + fwd }],
  };
  return map[dir] || map.RIGHT;
}

/* Connector rectangle between two adjacent segments */
function drawConnector(ctx, a, b, cs, isHead) {
  const pad = cs * 0.12;
  ctx.fillStyle = isHead ? '#0d7040' : '#14955a';
  if (a.x === b.x) {
    const jY = Math.max(a.y, b.y) * cs;
    ctx.fillRect(a.x * cs + pad, jY - pad, cs - pad * 2, pad * 2);
  } else {
    const jX = Math.max(a.x, b.x) * cs;
    ctx.fillRect(jX - pad, a.y * cs + pad, pad * 2, cs - pad * 2);
  }
}

/* Single body segment â€” rounded square with scale texture */
function drawBodySeg(ctx, x, y, cs, idx) {
  const odd  = idx % 2 === 0;
  const pad  = cs * 0.1;
  const sz   = cs - pad * 2;
  const rx   = sz * 0.36;

  /* Outer dark green */
  ctx.fillStyle = odd ? '#0d7040' : '#0b633a';
  rr(ctx, x + pad, y + pad, sz, sz, rx);
  ctx.fill();

  /* Inner lighter green */
  const ip  = pad + cs * 0.09;
  const isz = cs - ip * 2;
  ctx.fillStyle = odd ? '#17a85c' : '#14985a';
  rr(ctx, x + ip, y + ip, isz, isz, rx * 0.55);
  ctx.fill();

  /* 4-dot scale texture */
  const dotR   = Math.max(0.8, cs * 0.058);
  const dotOff = isz * 0.26;
  const cx = x + cs / 2, cy = y + cs / 2;
  ctx.fillStyle = 'rgba(0,45,22,0.40)';
  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    ctx.beginPath();
    ctx.arc(cx + dx * dotOff, cy + dy * dotOff, dotR, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* Snake head â€” wider padding, eyes, tongue */
function drawHead(ctx, x, y, cs, dir) {
  const pad = cs * 0.055;
  const sz  = cs - pad * 2;
  const rx  = sz * 0.42;

  /* Head body */
  ctx.fillStyle = '#0d7040';
  rr(ctx, x + pad, y + pad, sz, sz, rx);
  ctx.fill();

  /* Subtle inner highlight */
  const ip  = pad + cs * 0.1;
  const isz = cs - ip * 2;
  ctx.fillStyle = '#17a85c';
  rr(ctx, x + ip, y + ip, isz, isz, rx * 0.65);
  ctx.fill();

  /* Eyes */
  const eyes = eyePos(x, y, cs, dir);
  const eR   = cs * 0.125;
  const pOff = { RIGHT: [eR * .3, 0], LEFT: [-eR * .3, 0], UP: [0, -eR * .3], DOWN: [0, eR * .3] };
  const [px, py] = pOff[dir] || [0, 0];

  eyes.forEach(({ ex, ey }) => {
    /* Sclera */
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(ex, ey, eR, 0, Math.PI * 2); ctx.fill();
    /* Pupil */
    ctx.fillStyle = '#0d1520';
    ctx.beginPath(); ctx.arc(ex + px, ey + py, eR * 0.52, 0, Math.PI * 2); ctx.fill();
    /* Shine dot */
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath(); ctx.arc(ex - eR * .22, ey - eR * .22, eR * .22, 0, Math.PI * 2); ctx.fill();
  });

  /* Tongue */
  drawTongue(ctx, x, y, cs, dir);
}

/* Forked tongue â€” flickers via time-based length */
function drawTongue(ctx, x, y, cs, dir) {
  const flick  = 0.5 + 0.5 * Math.sin(Date.now() * 0.0095);
  const tLen   = cs * (0.28 + 0.24 * flick);
  const fLen   = cs * 0.17;
  const fSprd  = cs * 0.12;
  const lw     = Math.max(1.2, cs * 0.065);
  const cx     = x + cs / 2, cy = y + cs / 2;

  /* Tongue origin at front edge of head */
  let tx, ty, ex, ey;
  switch (dir) {
    case 'RIGHT': tx = x + cs * 0.9; ty = cy; ex = tx + tLen; ey = ty; break;
    case 'LEFT':  tx = x + cs * 0.1; ty = cy; ex = tx - tLen; ey = ty; break;
    case 'UP':    tx = cx; ty = y + cs * 0.1; ex = tx; ey = ty - tLen; break;
    case 'DOWN':  tx = cx; ty = y + cs * 0.9; ex = tx; ey = ty + tLen; break;
    default:      tx = x + cs * 0.9; ty = cy; ex = tx + tLen; ey = ty;
  }

  /* Fork tips */
  let f1x, f1y, f2x, f2y;
  switch (dir) {
    case 'RIGHT': f1x = ex + fLen; f1y = ey - fSprd; f2x = ex + fLen; f2y = ey + fSprd; break;
    case 'LEFT':  f1x = ex - fLen; f1y = ey - fSprd; f2x = ex - fLen; f2y = ey + fSprd; break;
    case 'UP':    f1x = ex - fSprd; f1y = ey - fLen; f2x = ex + fSprd; f2y = ey - fLen; break;
    case 'DOWN':  f1x = ex - fSprd; f1y = ey + fLen; f2x = ex + fSprd; f2y = ey + fLen; break;
    default:      f1x = ex + fLen; f1y = ey - fSprd; f2x = ex + fLen; f2y = ey + fSprd;
  }

  ctx.strokeStyle = '#f76c82';
  ctx.lineWidth   = lw;
  ctx.lineCap     = 'round';

  ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(f1x, f1y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(f2x, f2y); ctx.stroke();
}

/* Apple â€” proper apple shape (not a circle/cherry) */
function drawApple(ctx, apple, cs) {
  const t     = Date.now() * 0.001;
  const pulse = 0.88 + 0.1 * (0.5 + 0.5 * Math.sin(t * 2.3));
  const cx    = apple.x * cs + cs * 0.5;
  const cy    = apple.y * cs + cs * 0.54;
  const r     = cs * 0.31 * pulse;

  ctx.save();
  ctx.translate(cx, cy);

  /* Left lobe â€” apple top-left bump */
  ctx.fillStyle = '#d42d40';
  ctx.beginPath();
  ctx.ellipse(-r * 0.32, -r * 0.72, r * 0.42, r * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  /* Right lobe */
  ctx.beginPath();
  ctx.ellipse(r * 0.32, -r * 0.72, r * 0.42, r * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  /* Main apple body â€” characteristic wider-than-tall shape */
  ctx.fillStyle = '#e8394d';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.06, r * 1.02, r * 0.96, 0, 0, Math.PI * 2);
  ctx.fill();

  /* Right-side depth shadow */
  const grd = ctx.createLinearGradient(-r, 0, r, 0);
  grd.addColorStop(0, 'rgba(255,120,100,0.0)');
  grd.addColorStop(1, 'rgba(0,0,0,0.22)');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.ellipse(0, r * 0.06, r * 1.02, r * 0.96, 0, 0, Math.PI * 2);
  ctx.fill();

  /* Shine â€” top-left gloss */
  ctx.fillStyle = 'rgba(255,255,255,0.33)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.28, -r * 0.24, r * 0.28, r * 0.36, -0.45, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  /* Stem (curved, outside translate so no scale from pulse) */
  ctx.save();
  ctx.strokeStyle = '#8b5e3c';
  ctx.lineWidth   = Math.max(1.4, cs * 0.066);
  ctx.lineCap     = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.82);
  ctx.quadraticCurveTo(cx + r * 0.32, cy - r * 1.22, cx + r * 0.4, cy - r * 1.6);
  ctx.stroke();

  /* Leaf */
  ctx.translate(cx + r * 0.12, cy - r * 1.15);
  ctx.rotate(0.58);
  ctx.fillStyle = '#3ecf70';
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.34, r * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  /* Leaf vein */
  ctx.strokeStyle = '#28b85a';
  ctx.lineWidth   = Math.max(0.4, cs * 0.025);
  ctx.beginPath();
  ctx.moveTo(-r * 0.3, 0);
  ctx.lineTo(r * 0.3, 0);
  ctx.stroke();
  ctx.restore();
}

/* â”€â”€ MAIN RENDER FRAME â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function renderFrame(canvas, state) {
  if (!canvas) return;
  const { snake, apple, dir, status } = state;

  const dpr = window.devicePixelRatio || 1;
  const W   = canvas.clientWidth;
  const H   = canvas.clientHeight;
  if (!W || !H) return;

  /* Resize backing store if needed */
  const pw = Math.round(W * dpr), ph = Math.round(H * dpr);
  if (canvas.width !== pw || canvas.height !== ph) {
    canvas.width = pw; canvas.height = ph;
  }

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); /* CSS-pixel coordinate space */

  const cs = W / 20; /* cell size */

  /* Background */
  ctx.fillStyle = '#09141f';
  ctx.fillRect(0, 0, W, H);

  /* Subtle grid */
  ctx.strokeStyle = '#0d1f2e';
  ctx.lineWidth   = 0.5;
  for (let i = 0; i <= 20; i++) {
    ctx.beginPath(); ctx.moveTo(i * cs, 0); ctx.lineTo(i * cs, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * cs); ctx.lineTo(W, i * cs); ctx.stroke();
  }

  /* Apple */
  if (apple) drawApple(ctx, apple, cs);

  if (snake.length > 0) {
    /* 1. Connectors between adjacent segments */
    for (let i = 0; i < snake.length - 1; i++) {
      drawConnector(ctx, snake[i], snake[i + 1], cs, i === 0);
    }

    /* 2. Body segments (tail â†’ neck, so head renders on top) */
    for (let i = snake.length - 1; i >= 1; i--) {
      drawBodySeg(ctx, snake[i].x * cs, snake[i].y * cs, cs, i);
    }

    /* 3. Head (always on top) */
    drawHead(ctx, snake[0].x * cs, snake[0].y * cs, cs, dir);
  }

  /* Death flash tint */
  if (status === 'dead' && state.deathTime) {
    const age = (Date.now() - state.deathTime) / 600;
    if (age < 1) {
      const alpha = 0.18 * Math.sin(age * Math.PI);
      ctx.fillStyle = `rgba(247,108,130,${alpha})`;
      ctx.fillRect(0, 0, W, H);
    }
  }
}


/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   3. GAME CONSTANTS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const GRID        = 20;
const INIT_SPEED  = 160;
const MIN_SPEED   = 68;
const SPEED_DELTA = 7;
const SCORE_PER   = 10;
const VEC  = { UP:{x:0,y:-1}, DOWN:{x:0,y:1}, LEFT:{x:-1,y:0}, RIGHT:{x:1,y:0} };
const OPP  = { UP:'DOWN', DOWN:'UP', LEFT:'RIGHT', RIGHT:'LEFT' };
const INIT_SNAKE = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];

function randomApple(snake) {
  const used = new Set(snake.map(s => `${s.x},${s.y}`));
  let p;
  do { p = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }; }
  while (used.has(`${p.x},${p.y}`));
  return p;
}


/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   4. REACT COMPONENT
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const { useState, useEffect, useCallback, useRef } = React;

function SnakeGame() {
  const canvasRef = useRef(null);

  /* ALL mutable game state in a ref â€” shared by setInterval & rAF without stale closures */
  const gs = useRef({
    status: 'idle', snake: INIT_SNAKE.map(p => ({...p})),
    apple: randomApple(INIT_SNAKE),
    dir: 'RIGHT', nextDir: 'RIGHT',
    score: 0, apples: 0, speed: INIT_SPEED,
    deathTime: null,
  });

  /* React state â€” only drives re-renders of the UI overlay (score, screen) */
  const [view,  setView]  = useState(gs.current);
  const [best,  setBest]  = useState(0);
  const [flash, setFlash] = useState(false);

  const timerRef = useRef(null);
  const rafRef   = useRef(null);

  const sync = () => setView({ ...gs.current });

  /* â”€â”€ rAF render loop (60fps, always running) â”€â”€ */
  const loop = useCallback(() => {
    renderFrame(canvasRef.current, gs.current);
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loop]);

  /* â”€â”€ Game tick (setInterval at game speed) â”€â”€ */
  const tick = useCallback(() => {
    const s = gs.current;
    if (s.status !== 'playing') return;

    s.dir = s.nextDir;
    const v  = VEC[s.dir];
    const nh = { x: s.snake[0].x + v.x, y: s.snake[0].y + v.y };

    /* Wall collision */
    if (nh.x < 0 || nh.x >= GRID || nh.y < 0 || nh.y >= GRID) {
      s.status = 'dead'; s.deathTime = Date.now();
      clearInterval(timerRef.current);
      setBest(b => Math.max(b, s.score));
      SFX.die(); sync(); return;
    }

    /* Self collision (skip tail â€” it will move) */
    if (s.snake.slice(0, -1).some(seg => seg.x === nh.x && seg.y === nh.y)) {
      s.status = 'dead'; s.deathTime = Date.now();
      clearInterval(timerRef.current);
      setBest(b => Math.max(b, s.score));
      SFX.die(); sync(); return;
    }

    const ate = nh.x === s.apple.x && nh.y === s.apple.y;
    s.snake = ate ? [nh, ...s.snake] : [nh, ...s.snake.slice(0, -1)];

    if (ate) {
      s.score  += SCORE_PER;
      s.apples += 1;
      s.apple   = randomApple(s.snake);
      SFX.eat();
      setFlash(true);
      setTimeout(() => setFlash(false), 220);
      const ns = Math.max(MIN_SPEED, s.speed - SPEED_DELTA);
      if (ns !== s.speed) {
        s.speed = ns;
        clearInterval(timerRef.current);
        timerRef.current = setInterval(tick, ns);
      }
    }
    sync();
  }, []);

  /* â”€â”€ Start / Restart â”€â”€ */
  const startGame = useCallback(() => {
    clearInterval(timerRef.current);
    const snake = INIT_SNAKE.map(p => ({...p}));
    gs.current = {
      status: 'playing', snake, apple: randomApple(snake),
      dir: 'RIGHT', nextDir: 'RIGHT',
      score: 0, apples: 0, speed: INIT_SPEED, deathTime: null,
    };
    SFX.start(); sync();
    timerRef.current = setInterval(tick, INIT_SPEED);
  }, [tick]);

  const exitGame = useCallback(() => {
    clearInterval(timerRef.current);
    gs.current.status = 'idle'; sync();
  }, []);

  /* â”€â”€ Direction â”€â”€ */
  const turn = useCallback((dir) => {
    const s = gs.current;
    if (s.status !== 'playing') return;
    if (OPP[s.dir] !== dir) s.nextDir = dir;
  }, []);

  /* â”€â”€ Keyboard â”€â”€ */
  useEffect(() => {
    const MAP = {
      ArrowUp:'UP', w:'UP', W:'UP',
      ArrowDown:'DOWN', s:'DOWN', S:'DOWN',
      ArrowLeft:'LEFT', a:'LEFT', A:'LEFT',
      ArrowRight:'RIGHT', d:'RIGHT', D:'RIGHT',
    };
    const fn = e => {
      const d = MAP[e.key]; if (!d) return;
      if (e.key.startsWith('Arrow')) e.preventDefault();
      turn(d);
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [turn]);

  /* â”€â”€ Swipe â”€â”€ */
  useEffect(() => {
    let sx = null, sy = null;
    const ts = e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; };
    const te = e => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
      turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'RIGHT' : 'LEFT') : (dy > 0 ? 'DOWN' : 'UP'));
      sx = sy = null;
    };
    window.addEventListener('touchstart', ts, { passive: true });
    window.addEventListener('touchend', te);
    return () => {
      window.removeEventListener('touchstart', ts);
      window.removeEventListener('touchend', te);
    };
  }, [turn]);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    cancelAnimationFrame(rafRef.current);
  }, []);

  /* â”€â”€ D-PAD BUTTON â”€â”€ */
  function DBtn({ dir, label }) {
    const btnRef = useRef(null);
    const press  = useCallback(e => {
      e.preventDefault(); e.stopPropagation();
      turn(dir);
      const el = btnRef.current;
      if (el) {
        el.classList.add('active');
        setTimeout(() => el && el.classList.remove('active'), 140);
      }
    }, [dir]);
    return React.createElement('button', {
      ref: btnRef, className: 'dbtn', tabIndex: -1,
      onPointerDown: press,
      onMouseDown:   e => e.preventDefault(),
      onTouchStart:  e => e.preventDefault(),
      onContextMenu: e => e.preventDefault(),
    }, label);
  }

  /* â”€â”€ Derived UI values â”€â”€ */
  const { status, score, apples, speed } = view;
  const speedPct = Math.round(((INIT_SPEED - speed) / (INIT_SPEED - MIN_SPEED)) * 100);

  /* â”€â”€ Overlay â”€â”€ */
  const overlay = status !== 'playing'
    ? React.createElement('div', { className: 'overlay' },
        status === 'dead'
          ? React.createElement('div', { className: 'modal' },
              React.createElement('div', { className: 'modal-ico', style:{color:'#f76c82'} }, '\u2716'),
              React.createElement('div', { className: 'modal-ttl' }, 'GAME OVER'),
              React.createElement('div', { className: 'modal-sub' }, `SCORE: ${score}    MANZANAS: ${apples}`),
              React.createElement('div', { className: 'btns' },
                React.createElement('button', { className: 'btn-g', onClick: startGame }, '\u25B6 JUGAR DE NUEVO'),
                React.createElement('button', { className: 'btn-e', onClick: exitGame  }, 'SALIR')
              )
            )
          : React.createElement('div', { className: 'modal' },
              React.createElement('div', { className: 'modal-ico', style:{color:'#33d998',fontSize:'28px'} }, '\u25C6'),
              React.createElement('div', { className: 'modal-ttl' }, 'SNAKE'),
              React.createElement('div', { className: 'modal-hint' }, 'FLECHAS  O  W A S D\n\nDESLIZA EN MOVIL\n\nO USA EL D-PAD \u2193'),
              React.createElement('button', { className: 'btn-g', onClick: startGame }, '\u25B6 INICIAR JUEGO')
            )
      )
    : null;

  /* â”€â”€ JSX (createElement) â”€â”€ */
  return React.createElement('div', { className: 'root' },

    /* Header */
    React.createElement('div', { className: 'header' },
      React.createElement('span', { className: 'title' }, 'SNAKE'),
      React.createElement('div', { className: 'hud' },
        React.createElement('div', { className: 'hud-box' },
          React.createElement('span', { className: 'hud-lbl' }, 'SCORE'),
          React.createElement('span', { className: `hud-num${flash ? ' flash' : ''}` }, score)
        ),
        React.createElement('div', { className: 'hud-box' },
          React.createElement('span', { className: 'hud-lbl' }, 'APPLES'),
          React.createElement('span', { className: 'hud-num' }, apples)
        ),
        React.createElement('div', { className: 'hud-box' },
          React.createElement('span', { className: 'hud-lbl' }, 'BEST'),
          React.createElement('span', { className: 'hud-num' }, best)
        )
      )
    ),

    /* Speed bar */
    React.createElement('div', { className: 'speed-row' },
      React.createElement('span', { className: 'speed-lbl' }, 'VEL'),
      React.createElement('div', { className: 'speed-bar' },
        React.createElement('div', { className: 'speed-fill', style:{ width: `${speedPct}%` } })
      )
    ),

    /* Board â€” canvas fills the wrapper */
    React.createElement('div', { className: 'board-wrap' },
      React.createElement('canvas', { ref: canvasRef }),
      overlay
    ),

    /* D-Pad */
    React.createElement('div', { className: 'dpad' },
      React.createElement('div', { className: 'dpad-row' },
        React.createElement(DBtn, { dir: 'UP',    label: '\u25B2' })
      ),
      React.createElement('div', { className: 'dpad-row' },
        React.createElement(DBtn, { dir: 'LEFT',  label: '\u25C0' }),
        React.createElement('div', { className: 'dgap' }),
        React.createElement(DBtn, { dir: 'RIGHT', label: '\u25B6' })
      ),
      React.createElement('div', { className: 'dpad-row' },
        React.createElement(DBtn, { dir: 'DOWN',  label: '\u25BC' })
      )
    ),

    React.createElement('div', { className: 'foot' }, 'TECLADO \u00B7 SWIPE \u00B7 D-PAD')
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(SnakeGame));
