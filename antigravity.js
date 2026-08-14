
(function Antigravity(container, opts) {
  const CFG = Object.assign({
    count:           390,
    magnetRadius:    5,        
    ringRadius:      7,        
    waveSpeed:       0.3,
    waveAmplitude:   1,
    particleSize:    1.5,
    lerpSpeed:       0.08,
    color:           '#3b93f6',
    autoAnimate:     false,    
    particleVariance: 1,
    rotationSpeed:   0.2,
    depthFactor:     1,
    pulseSpeed:      3,
    particleShape:   'sphere', 
    fieldStrength:   10,
  }, opts);
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, cx = 0, cy = 0;
  function resize() {
    const r = container.getBoundingClientRect();
    W = canvas.width  = r.width  || window.innerWidth;
    H = canvas.height = r.height || window.innerHeight;
    cx = W / 2;
    cy = H / 2;
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    return [
      parseInt(h.slice(0,2), 16),
      parseInt(h.slice(2,4), 16),
      parseInt(h.slice(4,6), 16),
    ];
  }
  const [rC, gC, bC] = hexToRgb(CFG.color);
  const UNIT = 42; 
  function makeParticle(i, total) {
    const angle  = (i / total) * Math.PI * 2;
    const spread = CFG.particleVariance * UNIT * 0.5;
    const ox = cx + Math.cos(angle) * CFG.ringRadius * UNIT + (Math.random() - 0.5) * spread;
    const oy = cy + Math.sin(angle) * CFG.ringRadius * UNIT + (Math.random() - 0.5) * spread;
    const depth = 0.4 + Math.random() * 0.6 * CFG.depthFactor;
    const phase = Math.random() * Math.PI * 2;
    return {
      x: ox + (Math.random() - 0.5) * W * 0.8, 
      y: oy + (Math.random() - 0.5) * H * 0.8,
      vx: 0,
      vy: 0,
      ox, oy,           
      angle,
      phase,
      depth,
      size: CFG.particleSize * (0.6 + Math.random() * 0.8) * depth,
    };
  }
  let particles = [];
  function initParticles() {
    particles = Array.from({ length: CFG.count }, (_, i) => makeParticle(i, CFG.count));
  }
  initParticles();
  window.addEventListener('resize', () => { resize(); initParticles(); });
  let mouseX = cx, mouseY = cy;
  let smMouseX = cx, smMouseY = cy;
  let mouseInCanvas = false;
  container.addEventListener('mouseenter', () => { mouseInCanvas = true; });
  container.addEventListener('mouseleave', () => { mouseInCanvas = false; });
  container.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouseX = e.clientX - r.left;
    mouseY = e.clientY - r.top;
  });
  document.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouseX = e.clientX - r.left;
    mouseY = e.clientY - r.top;
  });
  let ringAngle = 0;
  let time = 0;
  let raf;
  function tick() {
    raf = requestAnimationFrame(tick);
    time += 0.016;
    smMouseX += (mouseX - smMouseX) * CFG.lerpSpeed;
    smMouseY += (mouseY - smMouseY) * CFG.lerpSpeed;
    ringAngle += CFG.rotationSpeed * 0.016;
    const inflR = CFG.magnetRadius * 30;
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      const rotatedAngle = p.angle + ringAngle;
      const waveOffset   = Math.sin(time * CFG.waveSpeed + p.phase) * CFG.waveAmplitude * UNIT * 0.3;
      const targetX = cx + Math.cos(rotatedAngle) * (CFG.ringRadius * UNIT + waveOffset);
      const targetY = cy + Math.sin(rotatedAngle) * (CFG.ringRadius * UNIT + waveOffset);
      const springK = 0.04 + CFG.lerpSpeed * 0.5;
      p.vx += (targetX - p.x) * springK;
      p.vy += (targetY - p.y) * springK;
      const dx   = p.x - smMouseX;
      const dy   = p.y - smMouseY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
      if (dist < inflR) {
        const norm  = dist / inflR;          
        const force = (1 - norm) * CFG.fieldStrength * 0.8;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }
      const pulse = 1 + Math.sin(time * CFG.pulseSpeed + p.phase) * 0.06;
      p.x  += p.vx;
      p.y  += p.vy;
      p.vx *= 0.88;
      p.vy *= 0.88;
      const alpha    = p.depth * (0.55 + 0.45 * Math.sin(time * CFG.pulseSpeed * 0.5 + p.phase));
      const drawSize = p.size * pulse;
      if (CFG.particleShape === 'sphere') {
        const grd = ctx.createRadialGradient(
          p.x - drawSize * 0.3, p.y - drawSize * 0.3, 0,
          p.x, p.y, drawSize * 1.8
        );
        grd.addColorStop(0,   `rgba(255,255,255,${alpha * 0.9})`);
        grd.addColorStop(0.3, `rgba(${rC},${gC},${bC},${alpha})`);
        grd.addColorStop(1,   `rgba(${rC},${gC},${bC},0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, drawSize * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, drawSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rC},${gC},${bC},${alpha})`;
        ctx.fill();
      }
    });
  }
  tick();
  return {
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.remove();
    }
  };
})(
  document.getElementById('antigravity-mount'),
  {
    count:            390,
    magnetRadius:     5,
    ringRadius:       7,
    waveSpeed:        0.3,
    waveAmplitude:    1,
    particleSize:     1.5,
    lerpSpeed:        0.08,
    color:            '#3b93f6',
    autoAnimate:      false,
    particleVariance: 1,
    rotationSpeed:    0.2,
    depthFactor:      1,
    pulseSpeed:       3,
    particleShape:    'sphere',
    fieldStrength:    10,
  }
);
