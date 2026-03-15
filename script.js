/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   AUDIO ENGINE  —  Web Audio API (sin archivos externos)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const SFX = (() => {
  let ctx = null;
  function ctx_() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* Come manzana — acorde ascendente alegre */
  function eat() {
    try {
      const c = ctx_(), t = c.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const o = c.createOscillator(), g = c.createGain();
        o.connect(g); g.connect(c.destination);
        o.type = 'square';
        o.frequency.value = freq;
        const s = t + i * 0.055;
        g.gain.setValueAtTime(0, s);
        g.gain.linearRampToValueAtTime(0.15, s + 0.012);
        g.gain.exponentialRampToValueAtTime(0.001, s + 0.11);
        o.start(s); o.stop(s + 0.13);
      });
    } catch(_) {}
  }

  /* Muerte — descenso cromático dramático */
  function die() {
    try {
      const c = ctx_(), t = c.currentTime;
      /* Swell 1 */
      const o1 = c.createOscillator(), g1 = c.createGain();
      o1.connect(g1); g1.connect(c.destination);
      o1.type = 'sawtooth';
      o1.frequency.setValueAtTime(300, t);
      o1.frequency.exponentialRampToValueAtTime(55, t + 0.48);
      g1.gain.setValueAtTime(0.25, t);
      g1.gain.exponentialRampToValueAtTime(0.001, t + 0.52);
      o1.start(t); o1.stop(t + 0.55);
      /* Swell 2 — desfasado */
      const o2 = c.createOscillator(), g2 = c.createGain();
      o2.connect(g2); g2.connect(c.destination);
      o2.type = 'square';
      o2.frequency.setValueAtTime(180, t + 0.2);
      o2.frequency.exponentialRampToValueAtTime(45, t + 0.7);
      g2.gain.setValueAtTime(0.18, t + 0.2);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.75);
      o2.start(t + 0.2); o2.stop(t + 0.78);
    } catch(_) {}
  }

  /* Inicio — breve power-up */
  function start() {
    try {
      const c = ctx_(), t = c.currentTime;
      const o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = 'triangle';
      o.frequency.setValueAtTime(220, t);
      o.frequency.exponentialRampToValueAtTime(880, t + 0.18);
      g.gain.setValueAtTime(0.18, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      o.start(t); o.stop(t + 0.24);
    } catch(_) {}
  }

  return { eat, die, start };
})();


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   APPLE SVG  —  dibujada a mano, bonita
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function AppleSVG() {
  return React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 32 34',
    style: { width: '82%', height: '82%', display: 'block' },
    'aria-hidden': 'true',
  },
    /* tallo */
    React.createElement('line', {
      x1: '16', y1: '8', x2: '18', y2: '3',
      stroke: '#8b5e3c', strokeWidth: '1.8', strokeLinecap: 'round',
    }),
    /* hoja */
    React.createElement('path', {
      d: 'M18 5 C21 3 24 5 22 8 C20 10 17 8 18 5 Z',
      fill: '#4ade80',
    }),
    /* sombra hoja */
    React.createElement('path', {
      d: 'M18 5 C20 4 22 6 21 8 C19.5 9 17.5 7.5 18 5 Z',
      fill: '#22c55e', opacity: '0.55',
    }),
    /* cuerpo principal */
    React.createElement('path', {
      d: 'M8 14 C6 11 6.5 7.5 10.5 7.5 C12.5 7.5 14 9 16 9 C18 9 19.5 7.5 21.5 7.5 C25.5 7.5 26 11 24 14 C22 17.5 21.5 22 20 24.5 C18.8 26.5 17.4 27.5 16 27.5 C14.6 27.5 13.2 26.5 12 24.5 C10.5 22 10 17.5 8 14 Z',
      fill: '#e8394d',
    }),
    /* mitad derecha ligeramente más oscura */
    React.createElement('path', {
      d: 'M16 9 C18 9 19.5 7.5 21.5 7.5 C25.5 7.5 26 11 24 14 C22 17.5 21.5 22 20 24.5 C18.8 26.5 17.4 27.5 16 27.5 Z',
      fill: '#d42e41', opacity: '0.55',
    }),
    /* brillo */
    React.createElement('ellipse', {
      cx: '12.5', cy: '13', rx: '2.2', ry: '3.8',
      transform: 'rotate(-22 12.5 13)',
      fill: 'rgba(255,255,255,0.30)',
    })
  );
}


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CONSTANTES DEL JUEGO
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
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
  do { p = { x: Math.floor(Math.random()*GRID), y: Math.floor(Math.random()*GRID) }; }
  while (used.has(`${p.x},${p.y}`));
  return p;
}


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   COMPONENTE PRINCIPAL
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const { useState, useEffect, useCallback, useRef } = React;

function SnakeGame() {
  /* Estado de juego en ref para evitar closures stale en setInterval */
  const gs = useRef({
    status: 'idle', snake: INIT_SNAKE, apple: randomApple(INIT_SNAKE),
    dir: 'RIGHT', nextDir: 'RIGHT', score: 0, apples: 0, speed: INIT_SPEED,
  });

  const [view,  setView]  = useState(gs.current);
  const [best,  setBest]  = useState(0);
  const [flash, setFlash] = useState(false);
  const timerRef = useRef(null);

  const sync = () => setView({ ...gs.current });

  /* ── TICK ── */
  const tick = useCallback(() => {
    const s = gs.current;
    if (s.status !== 'playing') return;
    s.dir = s.nextDir;
    const v  = VEC[s.dir];
    const hd = s.snake[0];
    const nh = { x: hd.x + v.x, y: hd.y + v.y };

    if (nh.x < 0 || nh.x >= GRID || nh.y < 0 || nh.y >= GRID) {
      s.status = 'dead'; clearInterval(timerRef.current);
      setBest(b => Math.max(b, s.score)); SFX.die(); sync(); return;
    }
    if (s.snake.slice(0, -1).some(sg => sg.x === nh.x && sg.y === nh.y)) {
      s.status = 'dead'; clearInterval(timerRef.current);
      setBest(b => Math.max(b, s.score)); SFX.die(); sync(); return;
    }

    const ate = nh.x === s.apple.x && nh.y === s.apple.y;
    s.snake = ate ? [nh, ...s.snake] : [nh, ...s.snake.slice(0, -1)];

    if (ate) {
      s.score += SCORE_PER; s.apples += 1;
      s.apple = randomApple(s.snake);
      SFX.eat();
      setFlash(true); setTimeout(() => setFlash(false), 220);
      const ns = Math.max(MIN_SPEED, s.speed - SPEED_DELTA);
      if (ns !== s.speed) {
        s.speed = ns;
        clearInterval(timerRef.current);
        timerRef.current = setInterval(tick, ns);
      }
    }
    sync();
  }, []);

  /* ── START / RESTART ── */
  const startGame = useCallback(() => {
    clearInterval(timerRef.current);
    const snake = INIT_SNAKE.map(p => ({ ...p }));
    gs.current = { status: 'playing', snake, apple: randomApple(snake),
      dir: 'RIGHT', nextDir: 'RIGHT', score: 0, apples: 0, speed: INIT_SPEED };
    SFX.start(); sync();
    timerRef.current = setInterval(tick, INIT_SPEED);
  }, [tick]);

  const exitGame = useCallback(() => {
    clearInterval(timerRef.current);
    gs.current.status = 'idle'; sync();
  }, []);

  /* ── DIRECCIÓN ── */
  const turn = useCallback((dir) => {
    const s = gs.current;
    if (s.status !== 'playing') return;
    if (OPP[s.dir] !== dir) s.nextDir = dir;
  }, []);

  /* ── TECLADO ── */
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

  /* ── SWIPE TÁCTIL ── */
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

  useEffect(() => () => clearInterval(timerRef.current), []);

  /* ── RENDER ── */
  const { snake, apple, status, score, apples, speed } = view;
  const headKey  = snake[0] ? `${snake[0].x},${snake[0].y}` : '';
  const neckKey  = snake[1] ? `${snake[1].x},${snake[1].y}` : '';
  const bodyKeys = new Set(snake.slice(2).map(s => `${s.x},${s.y}`));
  const appleKey = `${apple.x},${apple.y}`;
  const speedPct = Math.round(((INIT_SPEED - speed) / (INIT_SPEED - MIN_SPEED)) * 100);

  /* 400 celdas */
  const cells = [];
  for (let i = 0; i < GRID * GRID; i++) {
    const x = i % GRID, y = Math.floor(i / GRID), k = `${x},${y}`;
    let cls = 'c', child = null;
    if      (k === headKey)   cls += ' hd';
    else if (k === neckKey)   cls += ' nk';
    else if (bodyKeys.has(k)) cls += ' bd';
    else if (k === appleKey)  { cls += ' ap'; child = React.createElement(AppleSVG); }
    cells.push(React.createElement('div', { key: k, className: cls }, child));
  }

  /* ── D-PAD BUTTON — control de puntero unificado y confiable ── */
  function DBtn({ dir, label }) {
    const btnRef = useRef(null);

    /* onPointerDown cubre mouse, touch Y stylus en un solo evento.
       preventDefault() evita el "ghost click" que duplica disparos en móvil
       y evita que el botón robe el foco del teclado. */
    const press = useCallback((e) => {
      e.preventDefault();
      e.stopPropagation();
      turn(dir);
      const el = btnRef.current;
      if (el) {
        el.classList.add('active');
        setTimeout(() => el && el.classList.remove('active'), 140);
      }
    }, [dir]);

    return React.createElement('button', {
      ref: btnRef,
      className: 'dbtn',
      tabIndex: -1,             /* no roba foco del teclado */
      onPointerDown: press,
      onMouseDown: e => e.preventDefault(),    /* bloquea doble disparo */
      onTouchStart: e => e.preventDefault(),   /* bloquea doble disparo */
      onContextMenu: e => e.preventDefault(),  /* evita menú contextual en móvil con hold */
    }, label);
  }

  /* Overlay */
  let overlay = null;
  if (status !== 'playing') {
    overlay = React.createElement('div', { className: 'overlay' },
      status === 'dead'
        ? React.createElement('div', { className: 'modal' },
            React.createElement('div', { className: 'modal-ico', style: { color: '#f76c82' } }, '✖'),
            React.createElement('div', { className: 'modal-ttl' }, 'GAME OVER'),
            React.createElement('div', { className: 'modal-sub' },
              `SCORE: ${score}    MANZANAS: ${apples}`),
            React.createElement('div', { className: 'btns' },
              React.createElement('button', { className: 'btn-g', onClick: startGame }, '▶ JUGAR DE NUEVO'),
              React.createElement('button', { className: 'btn-e', onClick: exitGame  }, 'SALIR')
            )
          )
        : React.createElement('div', { className: 'modal' },
            React.createElement('div', { className: 'modal-ico', style: { color: '#33d998', fontSize: '28px' } }, '◆'),
            React.createElement('div', { className: 'modal-ttl' }, 'SNAKE'),
            React.createElement('div', { className: 'modal-hint' },
              'FLECHAS O  W A S D\n\nDESLIZA EN MÓVIL\n\nO USA EL D-PAD ↓'),
            React.createElement('button', { className: 'btn-g', onClick: startGame }, '▶ INICIAR JUEGO')
          )
    );
  }

  return React.createElement('div', { className: 'root' },
    /* Cabecera */
    React.createElement('div', { className: 'header' },
      React.createElement('span', { className: 'title' }, 'SNAKE'),
      React.createElement('div', { className: 'hud' },
        React.createElement('div', { className: 'hud-box' },
          React.createElement('span', { className: 'hud-lbl' }, 'SCORE'),
          React.createElement('span', { className: `hud-num${flash ? ' score-flash' : ''}` }, score)
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
    /* Barra velocidad */
    React.createElement('div', { className: 'speed-row' },
      React.createElement('span', { className: 'speed-lbl' }, 'VEL'),
      React.createElement('div', { className: 'speed-bar' },
        React.createElement('div', { className: 'speed-fill', style: { width: `${speedPct}%` } })
      )
    ),
    /* Tablero */
    React.createElement('div', { className: 'board-wrap' },
      React.createElement('div', { className: 'board' }, cells),
      overlay
    ),
    /* D-Pad */
    React.createElement('div', { className: 'dpad' },
      React.createElement('div', { className: 'dpad-row' },
        React.createElement(DBtn, { dir: 'UP',    label: '▲' })
      ),
      React.createElement('div', { className: 'dpad-row' },
        React.createElement(DBtn, { dir: 'LEFT',  label: '◀' }),
        React.createElement('div', { className: 'dgap' }),
        React.createElement(DBtn, { dir: 'RIGHT', label: '▶' })
      ),
      React.createElement('div', { className: 'dpad-row' },
        React.createElement(DBtn, { dir: 'DOWN',  label: '▼' })
      )
    ),
    React.createElement('div', { className: 'foot' }, 'TECLADO · SWIPE · D-PAD')
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(SnakeGame));
