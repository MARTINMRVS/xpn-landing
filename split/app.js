/* ==========================================================================
   SPLIT — interactions
   - Metallic lattice canvas (cursor luminance + click pulse)
   - Scroll reveals
   - Stem demo play states
   ========================================================================== */

(function lattice() {
  const canvas = document.getElementById('lattice');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0, h = 0;
  let dots = [];
  const pulses = [];
  const mouse = { x: -9999, y: -9999, inside: false };

  const GRID = 38; // px between dots
  const RADIUS = 1.5;
  const HOVER_RADIUS = 180;

  function resize() {
    const parent = canvas.parentElement;
    w = parent.offsetWidth;
    h = parent.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildDots();
  }

  function buildDots() {
    dots = [];
    const cols = Math.ceil(w / GRID) + 2;
    const rows = Math.ceil(h / GRID) + 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * GRID + (r % 2 ? GRID/2 : 0);
        const y = r * GRID;
        dots.push({
          ox: x,
          oy: y,
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 0.4,
          driftAmp: 1.2 + Math.random() * 1.6,
        });
      }
    }
  }

  function onMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.inside = true;
  }
  function onLeave() { mouse.inside = false; mouse.x = -9999; mouse.y = -9999; }
  function onClick(e) {
    const rect = canvas.getBoundingClientRect();
    pulses.push({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      r: 0,
      life: 1,
    });
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const t = now / 1000;

    ctx.clearRect(0, 0, w, h);

    // Pulses
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.r += dt * 380;
      p.life -= dt * 0.7;
      if (p.life <= 0) { pulses.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(232, 232, 232, ${p.life * 0.4})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      // Subtle breathing drift
      const dx = Math.sin(t * d.speed + d.phase) * d.driftAmp;
      const dy = Math.cos(t * d.speed * 0.85 + d.phase) * d.driftAmp;
      const x = d.ox + dx;
      const y = d.oy + dy;

      // Base brightness modulated by sine wave (metallic breathing)
      let bright = 0.18 + 0.12 * (0.5 + 0.5 * Math.sin(t * 0.5 + d.phase));

      // Cursor luminance
      if (mouse.inside) {
        const mx = x - mouse.x;
        const my = y - mouse.y;
        const dist = Math.sqrt(mx*mx + my*my);
        if (dist < HOVER_RADIUS) {
          const k = 1 - dist / HOVER_RADIUS;
          bright += k * 0.85;
        }
      }

      // Pulse luminance
      for (const p of pulses) {
        const mx = x - p.x;
        const my = y - p.y;
        const dist = Math.sqrt(mx*mx + my*my);
        const band = Math.abs(dist - p.r);
        if (band < 30) {
          bright += (1 - band / 30) * p.life * 0.9;
        }
      }

      bright = Math.min(bright, 1);
      const radius = RADIUS + (bright - 0.3) * 1.4;

      // Outer glow for bright dots
      if (bright > 0.55) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, radius * 6);
        g.addColorStop(0, `rgba(232, 232, 232, ${(bright - 0.5) * 0.35})`);
        g.addColorStop(1, 'rgba(232, 232, 232, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, radius * 6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = `rgba(${200 + bright * 40}, ${200 + bright * 40}, ${210 + bright * 30}, ${bright})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.6, radius), 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseleave', onLeave);
  window.addEventListener('click', onClick);
  requestAnimationFrame(frame);
})();

/* ==========================================================================
   Scroll reveal
   ========================================================================== */
(function reveal() {
  const els = document.querySelectorAll('.reveal, .bench-row, .stem-row, .eco-node');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  els.forEach(el => io.observe(el));
})();

/* ==========================================================================
   Animated waveform — build random bars
   ========================================================================== */
(function waveforms() {
  function buildBars(host, count, opts={}) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const b = document.createElement('span');
      b.className = 'wbar';
      const seed = Math.random();
      const h = opts.tall
        ? 25 + Math.pow(seed, 1.5) * 75
        : 15 + Math.pow(seed, 1.4) * 85;
      b.style.height = h + '%';
      b.style.animationDuration = (1.8 + Math.random() * 1.4) + 's';
      b.style.animationDelay = (-Math.random() * 2.4) + 's';
      frag.appendChild(b);
    }
    host.appendChild(frag);
  }
  document.querySelectorAll('[data-waveform]').forEach(el => {
    const count = parseInt(el.dataset.waveform, 10) || 60;
    buildBars(el, count, { tall: el.classList.contains('demo-source-wave') });
  });
})();

/* ==========================================================================
   Stem play state toggle (visual only)
   ========================================================================== */
(function stemPlay() {
  document.querySelectorAll('.stem-row .play').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const row = btn.closest('.stem-row');
      const playing = row.classList.toggle('playing');
      btn.textContent = playing ? '❚❚' : '▶';
    });
  });
})();
