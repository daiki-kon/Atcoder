(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const els = {
    hud: document.getElementById("hud"),
    score: document.getElementById("score"),
    combo: document.getElementById("combo"),
    best: document.getElementById("best"),
    title: document.getElementById("title"),
    how: document.getElementById("how"),
    over: document.getElementById("over"),
    paused: document.getElementById("paused"),
    finalScore: document.getElementById("finalScore"),
    finalBestLine: document.getElementById("finalBestLine"),
    startBtn: document.getElementById("startBtn"),
    howBtn: document.getElementById("howBtn"),
    howClose: document.getElementById("howClose"),
    retryBtn: document.getElementById("retryBtn"),
    homeBtn: document.getElementById("homeBtn"),
  };

  const BEST_KEY = "lumen-moth-best";
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

  let W = 0;
  let H = 0;
  let dpr = 1;
  let mode = "title"; // title | playing | paused | over
  let lastT = 0;
  let best = Number(localStorage.getItem(BEST_KEY) || 0);
  els.best.textContent = String(best);

  const pointer = { x: 0, y: 0, active: false };
  const moth = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    flap: 0,
    trail: [],
  };

  let score = 0;
  let combo = 1;
  let comboTimer = 0;
  let elapsed = 0;
  let wind = { x: 0, y: 0, pulse: 0 };
  let shake = 0;
  let stars = [];
  let lanterns = [];
  let flames = [];
  let pollen = [];
  let sparks = [];
  let gusts = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (mode === "title" || mode === "over") seedDecor();
  }

  function seedDecor() {
    stars = Array.from({ length: 90 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: rand(0.4, 1.8),
      tw: Math.random() * Math.PI * 2,
      s: rand(0.4, 1.4),
    }));
    lanterns = Array.from({ length: 5 }, (_, i) => makeLantern(i / 5));
  }

  function makeLantern(bias = Math.random()) {
    const x = rand(W * 0.08, W * 0.92);
    return {
      x,
      y: rand(H * 0.18, H * 0.72),
      sway: rand(0, Math.PI * 2),
      swayAmp: rand(8, 18),
      r: rand(18, 28),
      glow: rand(70, 120),
      bias,
      phase: rand(0, Math.PI * 2),
    };
  }

  function makeFlame(near) {
    const baseX = near ? near.x + rand(-40, 40) : rand(40, W - 40);
    const baseY = near ? near.y + rand(50, 110) : rand(H * 0.25, H * 0.85);
    return {
      x: baseX,
      y: baseY,
      r: rand(10, 16),
      life: rand(6, 14),
      age: 0,
      wobble: rand(0, Math.PI * 2),
    };
  }

  function makePollen(lantern) {
    const ang = rand(0, Math.PI * 2);
    const rad = rand(30, lantern.glow * 0.85);
    return {
      x: lantern.x + Math.cos(ang) * rad,
      y: lantern.y + Math.sin(ang) * rad,
      r: rand(3.5, 5.5),
      pulse: rand(0, Math.PI * 2),
      value: 10,
    };
  }

  function resetGame() {
    score = 0;
    combo = 1;
    comboTimer = 0;
    elapsed = 0;
    shake = 0;
    wind = { x: 0, y: 0, pulse: 0 };
    moth.x = W * 0.5;
    moth.y = H * 0.65;
    moth.vx = 0;
    moth.vy = 0;
    moth.angle = -Math.PI / 2;
    moth.flap = 0;
    moth.trail = [];
    pointer.x = moth.x;
    pointer.y = moth.y - 40;
    pointer.active = true;
    seedDecor();
    flames = [];
    pollen = [];
    sparks = [];
    gusts = [];
    for (const L of lanterns) {
      for (let i = 0; i < 3; i++) pollen.push(makePollen(L));
    }
    updateHud();
  }

  function updateHud() {
    els.score.textContent = String(Math.floor(score));
    els.combo.textContent = `×${combo}`;
    els.best.textContent = String(best);
  }

  function setMode(next) {
    mode = next;
    els.title.hidden = next !== "title";
    els.how.hidden = true;
    els.over.hidden = next !== "over";
    els.hud.hidden = next !== "playing" && next !== "paused";
    els.paused.hidden = next !== "paused";
  }

  function startGame() {
    resetGame();
    setMode("playing");
    lastT = performance.now();
  }

  function endGame() {
    if (score > best) {
      best = Math.floor(score);
      localStorage.setItem(BEST_KEY, String(best));
    }
    els.finalScore.textContent = String(Math.floor(score));
    els.finalBestLine.textContent =
      Math.floor(score) >= best ? "新記録！" : `BEST ${best}`;
    updateHud();
    setMode("over");
  }

  function spawnBurst(x, y, color, n = 12) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2);
      const sp = rand(40, 160);
      sparks.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: rand(0.35, 0.8),
        age: 0,
        color,
        r: rand(1.2, 2.8),
      });
    }
  }

  function update(dt) {
    elapsed += dt;
    moth.flap += dt * 14;

    // progressive difficulty
    const diff = 1 + elapsed / 45;

    // wind gusts
    wind.pulse -= dt;
    if (wind.pulse <= 0) {
      wind.pulse = rand(3.5, 7.5) / Math.sqrt(diff);
      const ang = rand(0, Math.PI * 2);
      const force = rand(70, 140) * Math.min(diff, 2.2);
      wind.x = Math.cos(ang) * force;
      wind.y = Math.sin(ang) * force * 0.55;
      gusts.push({
        x: moth.x - wind.x * 0.2,
        y: moth.y - wind.y * 0.2,
        life: 0.9,
        age: 0,
        ang: Math.atan2(wind.y, wind.x),
      });
    }
    wind.x *= Math.pow(0.22, dt);
    wind.y *= Math.pow(0.22, dt);

    // moth steering
    const tx = pointer.x;
    const ty = pointer.y;
    const dx = tx - moth.x;
    const dy = ty - moth.y;
    const pull = 8.5;
    moth.vx += dx * pull * dt + wind.x * dt;
    moth.vy += dy * pull * dt + wind.y * dt;
    moth.vx *= Math.pow(0.08, dt);
    moth.vy *= Math.pow(0.08, dt);
    moth.x += moth.vx * dt;
    moth.y += moth.vy * dt;
    moth.x = clamp(moth.x, 16, W - 16);
    moth.y = clamp(moth.y, 16, H - 16);
    moth.angle = Math.atan2(moth.vy, moth.vx || 0.001);

    moth.trail.unshift({ x: moth.x, y: moth.y, a: 1 });
    if (moth.trail.length > 18) moth.trail.pop();
    for (let i = 0; i < moth.trail.length; i++) moth.trail[i].a *= 0.9;

    // lantern sway + pollen refresh
    for (const L of lanterns) {
      L.sway += dt * (0.7 + L.bias);
      L.drawX = L.x + Math.sin(L.sway) * L.swayAmp;
      L.drawY = L.y + Math.cos(L.sway * 0.7 + L.phase) * 6;
    }

    // keep pollen density
    while (pollen.length < 8 + Math.floor(diff * 2)) {
      const L = lanterns[(Math.random() * lanterns.length) | 0];
      pollen.push(makePollen(L));
    }

    // spawn flames (gentler early game)
    const flameRate = elapsed < 4 ? 0.08 : 0.22 + diff * 0.18;
    if (Math.random() < dt * flameRate && flames.length < 3 + Math.floor(diff)) {
      const L = lanterns[(Math.random() * lanterns.length) | 0];
      flames.push(makeFlame({ x: L.drawX ?? L.x, y: L.drawY ?? L.y }));
    }

    // combo decay
    comboTimer -= dt;
    if (comboTimer <= 0 && combo > 1) {
      combo = Math.max(1, combo - 1);
      comboTimer = 1.2;
      updateHud();
    }

    // lantern light combo
    let inLight = false;
    for (const L of lanterns) {
      const lx = L.drawX ?? L.x;
      const ly = L.drawY ?? L.y;
      if (dist(moth.x, moth.y, lx, ly) < L.glow * 0.55) {
        inLight = true;
        break;
      }
    }
    if (inLight) {
      comboTimer = Math.max(comboTimer, 1.6);
    }

    // collect pollen
    for (let i = pollen.length - 1; i >= 0; i--) {
      const p = pollen[i];
      p.pulse += dt * 4;
      if (dist(moth.x, moth.y, p.x, p.y) < 16 + p.r) {
        const gain = p.value * combo;
        score += gain;
        if (inLight) {
          combo = Math.min(8, combo + 1);
          comboTimer = 2.2;
        } else {
          comboTimer = Math.max(comboTimer, 1.2);
        }
        spawnBurst(p.x, p.y, "rgba(240,180,70,0.95)", 10);
        pollen.splice(i, 1);
        updateHud();
      }
    }

    // flames
    for (let i = flames.length - 1; i >= 0; i--) {
      const f = flames[i];
      f.age += dt;
      f.wobble += dt * 8;
      f.x += Math.sin(f.wobble) * 12 * dt;
      f.y -= 18 * dt;
      if (f.age > f.life) {
        flames.splice(i, 1);
        continue;
      }
      if (elapsed > 1.2 && dist(moth.x, moth.y, f.x, f.y) < f.r + 8) {
        spawnBurst(moth.x, moth.y, "rgba(255,120,60,0.95)", 22);
        shake = 0.45;
        endGame();
        return;
      }
    }

    // sparks / gusts
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.age += dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vx *= 0.96;
      s.vy *= 0.96;
      if (s.age >= s.life) sparks.splice(i, 1);
    }
    for (let i = gusts.length - 1; i >= 0; i--) {
      gusts[i].age += dt;
      if (gusts[i].age >= gusts[i].life) gusts.splice(i, 1);
    }

    if (shake > 0) shake = Math.max(0, shake - dt);

    // soft score drip while flying
    score += dt * (1.5 + combo * 0.4);
    if (Math.floor(score) % 5 === 0) updateHud();
  }

  function drawBackground(t) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#071018");
    g.addColorStop(0.55, "#0d1c2a");
    g.addColorStop(1, "#12261f");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // distant hills
    ctx.fillStyle = "rgba(12, 28, 34, 0.9)";
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 24) {
      const y = H * 0.78 + Math.sin(x * 0.01 + t * 0.15) * 18 + Math.sin(x * 0.03) * 10;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();

    for (const s of stars) {
      const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.s + s.tw));
      ctx.fillStyle = `rgba(232,223,200,${a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawLantern(L, t) {
    const x = L.drawX ?? L.x;
    const y = L.drawY ?? L.y;
    const glow = ctx.createRadialGradient(x, y, 4, x, y, L.glow);
    glow.addColorStop(0, "rgba(255, 200, 90, 0.35)");
    glow.addColorStop(0.45, "rgba(232, 162, 58, 0.12)");
    glow.addColorStop(1, "rgba(232, 162, 58, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, L.glow, 0, Math.PI * 2);
    ctx.fill();

    // cord
    ctx.strokeStyle = "rgba(158,183,178,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y - L.r - 28);
    ctx.lineTo(x, y - L.r);
    ctx.stroke();

    // body
    const body = ctx.createLinearGradient(x, y - L.r, x, y + L.r);
    body.addColorStop(0, "#f3c56a");
    body.addColorStop(0.5, "#d7892e");
    body.addColorStop(1, "#9b5318");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(x - L.r * 0.7, y - L.r);
    ctx.lineTo(x + L.r * 0.7, y - L.r);
    ctx.lineTo(x + L.r * 0.85, y + L.r);
    ctx.lineTo(x - L.r * 0.85, y + L.r);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = `rgba(255,240,180,${0.45 + 0.25 * Math.sin(t * 3 + L.phase)})`;
    ctx.beginPath();
    ctx.ellipse(x, y, L.r * 0.35, L.r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawFlame(f) {
    const flicker = 0.85 + 0.15 * Math.sin(f.wobble * 2);
    const outer = ctx.createRadialGradient(f.x, f.y, 1, f.x, f.y, f.r * 3);
    outer.addColorStop(0, "rgba(255,120,40,0.35)");
    outer.addColorStop(1, "rgba(255,80,40,0)");
    ctx.fillStyle = outer;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.r * 3, 0, Math.PI * 2);
    ctx.fill();

    const rg = ctx.createRadialGradient(f.x, f.y, 1, f.x, f.y, f.r * 2.2);
    rg.addColorStop(0, "rgba(255,245,200,0.98)");
    rg.addColorStop(0.3, "rgba(255,150,55,0.9)");
    rg.addColorStop(0.7, "rgba(255,70,35,0.55)");
    rg.addColorStop(1, "rgba(255,40,20,0)");
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.ellipse(f.x, f.y, f.r * 0.75 * flicker, f.r * 1.45 * flicker, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPollen(p) {
    const pulse = 1 + 0.12 * Math.sin(p.pulse);
    ctx.fillStyle = "rgba(255, 214, 120, 0.9)";
    ctx.shadowColor = "rgba(255, 190, 80, 0.8)";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function drawMoth() {
    for (let i = moth.trail.length - 1; i >= 0; i--) {
      const tr = moth.trail[i];
      ctx.fillStyle = `rgba(232, 223, 200, ${0.08 * tr.a})`;
      ctx.beginPath();
      ctx.arc(tr.x, tr.y, 3 + i * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.translate(moth.x, moth.y);
    ctx.rotate(moth.angle);
    const flap = Math.sin(moth.flap) * 0.55;

    // wings
    ctx.fillStyle = "rgba(214, 232, 220, 0.55)";
    ctx.beginPath();
    ctx.ellipse(-2, -6, 10, 16, -0.6 + flap, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-2, 6, 10, 16, 0.6 - flap, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(158, 200, 180, 0.35)";
    ctx.beginPath();
    ctx.ellipse(-4, -8, 5, 9, -0.5 + flap, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-4, 8, 5, 9, 0.5 - flap, 0, Math.PI * 2);
    ctx.fill();

    // body
    ctx.fillStyle = "#e8dfc8";
    ctx.beginPath();
    ctx.ellipse(2, 0, 7, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f5e9c8";
    ctx.beginPath();
    ctx.arc(8, 0, 2.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // soft aura
    const aura = ctx.createRadialGradient(moth.x, moth.y, 2, moth.x, moth.y, 28);
    aura.addColorStop(0, "rgba(232,223,200,0.25)");
    aura.addColorStop(1, "rgba(232,223,200,0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(moth.x, moth.y, 28, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawFx() {
    for (const s of sparks) {
      const a = 1 - s.age / s.life;
      ctx.fillStyle = s.color.replace(/[\d.]+\)$/g, `${a})`);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const g of gusts) {
      const a = 1 - g.age / g.life;
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(g.ang);
      ctx.strokeStyle = `rgba(158,183,178,${0.35 * a})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(-30, -12 + i * 12);
        ctx.bezierCurveTo(0, -20 + i * 12, 20, -4 + i * 12, 50, -10 + i * 12);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawPointer() {
    if (mode !== "playing") return;
    ctx.strokeStyle = "rgba(232,162,58,0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(pointer.x, pointer.y, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pointer.x - 12, pointer.y);
    ctx.lineTo(pointer.x + 12, pointer.y);
    ctx.moveTo(pointer.x, pointer.y - 12);
    ctx.lineTo(pointer.x, pointer.y + 12);
    ctx.stroke();
  }

  function render(t) {
    const sx = shake > 0 ? rand(-5, 5) * shake : 0;
    const sy = shake > 0 ? rand(-5, 5) * shake : 0;
    ctx.save();
    ctx.translate(sx, sy);

    drawBackground(t * 0.001);
    for (const L of lanterns) drawLantern(L, t * 0.001);
    for (const p of pollen) drawPollen(p);
    for (const f of flames) drawFlame(f);
    drawFx();
    if (mode === "playing" || mode === "paused" || mode === "over") drawMoth();
    drawPointer();

    ctx.restore();
  }

  function frame(t) {
    const dt = Math.min(0.033, (t - lastT) / 1000 || 0.016);
    lastT = t;
    if (mode === "playing") update(dt);
    else if (mode === "title" || mode === "over") {
      // gentle ambient sway on title
      for (const L of lanterns) {
        L.sway += dt * 0.6;
        L.drawX = L.x + Math.sin(L.sway) * L.swayAmp;
        L.drawY = L.y + Math.cos(L.sway * 0.7 + L.phase) * 6;
      }
      for (const s of sparks) {
        s.age += dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
      }
    }
    render(t);
    requestAnimationFrame(frame);
  }

  function setPointer(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = clamp(clientX - rect.left, 0, W);
    pointer.y = clamp(clientY - rect.top, 0, H);
    pointer.active = true;
  }

  window.addEventListener("resize", resize);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", resize);
  }
  window.addEventListener("mousemove", (e) => setPointer(e.clientX, e.clientY));
  window.addEventListener(
    "touchmove",
    (e) => {
      if (!e.touches[0]) return;
      if (mode === "playing" || mode === "paused") e.preventDefault();
      setPointer(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: false }
  );
  window.addEventListener(
    "touchstart",
    (e) => {
      if (!e.touches[0]) return;
      // Keep button taps working; block scroll only while flying
      if (!e.target.closest("button") && (mode === "playing" || mode === "paused")) {
        e.preventDefault();
      }
      setPointer(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: false }
  );

  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      if (mode === "playing") setMode("paused");
      else if (mode === "paused") {
        setMode("playing");
        lastT = performance.now();
      } else if (mode === "title" || mode === "over") startGame();
    }
  });

  els.startBtn.addEventListener("click", startGame);
  els.retryBtn.addEventListener("click", startGame);
  els.homeBtn.addEventListener("click", () => {
    seedDecor();
    setMode("title");
  });
  els.howBtn.addEventListener("click", () => {
    els.how.hidden = false;
    els.title.hidden = true;
  });
  els.howClose.addEventListener("click", () => {
    els.how.hidden = true;
    els.title.hidden = false;
  });

  resize();
  setMode("title");
  requestAnimationFrame((t) => {
    lastT = t;
    requestAnimationFrame(frame);
  });
})();
