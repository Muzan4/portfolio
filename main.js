
const PAGE = document.body.dataset.page || 'home';
const cur  = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx + 'px';
  cur.style.top  = my + 'px';
});
(function animRing() {
  rx += (mx - rx) * 0.18;
  ry += (my - ry) * 0.18;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(animRing);
})();
const progressBar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const s = document.documentElement.scrollTop;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  if (progressBar && h > 0) progressBar.style.width = (s / h * 100) + '%';
});
const pt = document.getElementById('pt');
const PAGE_THEMES = {
  'home': { label: 'HOME', color: '#3b93f6', font: 'Orbitron' },
  'projects': { label: 'PROJECTS', color: '#00ff41', font: 'JetBrains Mono' },
  'journey': { label: 'JOURNEY', color: '#9b30ff', font: 'Anton' },
  'universe': { label: 'UNIVERSE', color: '#f4a261', font: 'Playfair Display' },
  'contact': { label: 'CONNECT', color: '#4cc9f0', font: 'Space Mono' }
};
const FILE_TO_PAGE = {
  '': 'home',
  'index.html': 'home',
  'projects.html': 'projects',
  'journey.html': 'journey',
  'universe.html': 'universe',
  'contact.html': 'contact'
};
if (document.fonts) {
  ['900 1em Orbitron', '700 1em "JetBrains Mono"', '400 1em Anton', '900 1em "Playfair Display"', '700 1em "Space Mono"'].forEach(f => {
    document.fonts.load(f);
  });
}
const fontLoaderDiv = document.createElement('div');
fontLoaderDiv.style.position = 'absolute';
fontLoaderDiv.style.opacity = '0';
fontLoaderDiv.style.pointerEvents = 'none';
fontLoaderDiv.style.width = '0';
fontLoaderDiv.style.height = '0';
fontLoaderDiv.style.overflow = 'hidden';
fontLoaderDiv.setAttribute('aria-hidden', 'true');
fontLoaderDiv.innerHTML = `
  <span style="font-family: 'Orbitron'; font-weight: 900;">HOME</span>
  <span style="font-family: 'JetBrains Mono'; font-weight: 700;">PROJECTS</span>
  <span style="font-family: 'Anton'; font-weight: 400;">JOURNEY</span>
  <span style="font-family: 'Playfair Display'; font-weight: 900;">UNIVERSE</span>
  <span style="font-family: 'Space Mono'; font-weight: 700;">CONNECT</span>
`;
document.body.appendChild(fontLoaderDiv);
if (pt) {
  const theme = PAGE_THEMES[PAGE];
  if (theme) {
    pt.style.background = theme.color;
    const label = pt.querySelector('#pt-label');
    if (label) {
      label.textContent = theme.label;
      label.style.fontFamily = `"${theme.font}", sans-serif`;
    }
  }
}
const hidePt = () => {
  if (!pt) return;
  requestAnimationFrame(() => {
    pt.style.transform = 'translateY(-100%)';
  });
};
window.addEventListener('load', hidePt);
setTimeout(hidePt, 1500);
window.addEventListener('pageshow', (e) => {
  if (!pt) return;
  if (e.persisted) {
    const theme = PAGE_THEMES[PAGE];
    if (theme) {
      pt.style.background = theme.color;
      const label = pt.querySelector('#pt-label');
      if (label) {
        label.textContent = theme.label;
        label.style.fontFamily = `"${theme.font}", sans-serif`;
      }
    }
    pt.style.transition = 'none';
    pt.style.transform = 'translateY(0%)';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      pt.style.transition = 'transform .65s cubic-bezier(0.77,0,0.175,1)';
      pt.style.transform = 'translateY(-100%)';
    }));
  }
});
document.addEventListener('click', e => {
  const link = e.target.closest('[data-nav]');
  if (!link) return;
  const href = link.getAttribute('href');
  const target = link.getAttribute('target');
  if (target === '_blank' || (href && (href.startsWith('http://') || href.startsWith('https://')))) return;
  if (!href || href === '#' || href === window.location.pathname.split('/').pop()) return;
  e.preventDefault();
  if (!pt) { window.location.href = href; return; }
  const filename = href.split('/').pop();
  const destPage = FILE_TO_PAGE[filename];
  if (destPage && PAGE_THEMES[destPage]) {
    const theme = PAGE_THEMES[destPage];
    pt.style.background = theme.color;
    const label = pt.querySelector('#pt-label');
    if (label) {
      label.textContent = theme.label;
      label.style.fontFamily = `"${theme.font}", sans-serif`;
    }
  }
  pt.style.transition = 'none';
  pt.style.transform  = 'translateY(100%)';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    pt.style.transition = 'transform .6s cubic-bezier(0.77,0,0.175,1)';
    pt.style.transform  = 'translateY(0%)';
  }));
  setTimeout(() => { window.location.href = href; }, 640);
});
const menuBtn  = document.getElementById('menu-btn');
const fullmenu = document.getElementById('fullmenu');
if (menuBtn && fullmenu) {
  menuBtn.addEventListener('click', () => {
    const open = fullmenu.classList.toggle('open');
    menuBtn.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open);
  });
  fullmenu.querySelectorAll('[data-nav]').forEach(l => {
    l.addEventListener('click', () => {
      fullmenu.classList.remove('open');
      menuBtn.classList.remove('open');
    });
  });
}
document.addEventListener('DOMContentLoaded', () => {
  if (PAGE === 'home')     initHome();
  if (PAGE === 'projects') initProjects();
  if (PAGE === 'journey')  initJourney();
  if (PAGE === 'universe') initUniverse();
  if (PAGE === 'contact')  initContact();
});
let heroAsciiInstance = null;
function initHome() {
  if (typeof THREE === 'undefined') {
    revealHomeText();
    return;
  }
  const lc = document.getElementById('logo-canvas');
  if (!lc) { revealHomeText(); return; }
  const lr = new THREE.WebGLRenderer({ canvas: lc, alpha: true, antialias: true });
  lr.setPixelRatio(window.devicePixelRatio);
  lr.setSize(180, 180);
  lr.setClearColor(0, 0);
  const ls = new THREE.Scene();
  const lc2 = new THREE.PerspectiveCamera(50, 1, .1, 100);
  lc2.position.z = 4;
  const geo   = new THREE.IcosahedronGeometry(1.2, 1);
  const edges = new THREE.EdgesGeometry(geo);
  const wm    = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0 });
  const wf    = new THREE.LineSegments(edges, wm);
  ls.add(wf);
  const sm  = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0, wireframe: true });
  const sp  = new THREE.Mesh(new THREE.SphereGeometry(.4, 16, 16), sm);
  ls.add(sp);
  let phase = 'forming', el = 0;
  (function animLogo() {
    requestAnimationFrame(animLogo);
    el += .016;
    if (phase === 'forming') {
      const p = Math.min(el / 2, 1);
      wm.opacity = p; sm.opacity = p * .5;
      wf.rotation.y = el * .6; wf.rotation.x = el * .3;
      sp.rotation.y = -el * .8;
      if (p >= 1) { phase = 'holding'; el = 0; }
    } else if (phase === 'holding') {
      wf.rotation.y += .015; wf.rotation.x += .008; sp.rotation.y -= .02;
      if (el > .8) { phase = 'fragmenting'; el = 0; revealHomeText(); }
    } else if (phase === 'fragmenting') {
      const p = Math.min(el / 1.2, 1);
      wf.rotation.y += .02;
      wf.scale.setScalar(1 + p * .5);
      wm.opacity = 1 - p; sm.opacity = .5 - p * .5;
      if (p >= 1) phase = 'idle';
    } else {
      wf.rotation.y += .005; sp.rotation.y -= .008;
    }
    lr.render(ls, lc2);
  })();
  function revealHomeText() {
    const name = document.getElementById('hero-name');
    const sub  = document.getElementById('hero-sub');
    const cta  = document.getElementById('hero-cta');
    const tiles = document.getElementById('page-tiles');
    const asciiMount = document.getElementById('ascii-text-mount');
    if (asciiMount && typeof createASCIIText === 'function' && !heroAsciiInstance) {
      heroAsciiInstance = createASCIIText(asciiMount, {
        text: 'AABID',
        enableWaves: true,
        asciiFontSize: 11,
        textFontSize: 280,
        textColor: '#eef3ff',
        planeBaseHeight: 11
      });
    }
    if (name) gsap.to(name, { opacity:1, y:0, duration:1.2, ease:'expo.out', delay:.2 });
    if (sub)  gsap.to(sub,  { opacity:1, duration:1, ease:'power2.out', delay:.8 });
    if (cta)  gsap.to(cta,  { opacity:1, y:0, duration:1, ease:'expo.out', delay:1.2 });
    if (tiles)gsap.to(tiles,{ opacity:1, duration:1, ease:'power2.out', delay:1.6 });
    setTimeout(startTypewriter, 900);
  }
  function startTypewriter() {
    const texts = ["Building Tomorrow's Solutions","Designer & Developer","Digital Architect","Innovator & Creator"];
    const el2 = document.getElementById('hero-sub');
    if (!el2) return;
    let ti = 0, ci = 0, del = false;
    function tick() {
      const cur2 = texts[ti];
      el2.textContent = del ? cur2.slice(0, ci - 1) : cur2.slice(0, ci + 1);
      del ? ci-- : ci++;
      if (!del && ci === cur2.length) { del = true; setTimeout(tick, 2200); return; }
      if (del && ci === 0) { del = false; ti = (ti + 1) % texts.length; }
      setTimeout(tick, del ? 45 : 85);
    }
    tick();
  }
}
function initProjects() {
  const lines = document.querySelectorAll('.type-line');
  let delay = 200;
  lines.forEach(line => {
    const text = line.dataset.text || line.textContent;
    line.textContent = '';
    line.style.opacity = '1';
    setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        line.textContent = text.slice(0, ++i);
        if (i >= text.length) clearInterval(interval);
      }, 22);
    }, delay);
    delay += text.length * 22 + 300;
  });
}
function initJourney() {
  if (typeof HyperspeedApp !== 'undefined') {
    if (typeof HyperspeedApp.init === 'function') {
      HyperspeedApp.init();
    } else {
      const container = document.getElementById('hyperspeed-container');
      if (container) {
        const app = new HyperspeedApp(container);
        if (app.loadAssets) app.loadAssets().then(() => app.init());
        else app.init();
      }
    }
  }
  const cards = [...document.querySelectorAll('.milestone-card')];
  const footer = document.querySelector('.journey-footer');
  const header = document.querySelector('.journey-header');
  const stage = document.querySelector('.milestone-stage');
  const warpFlash = document.querySelector('.warp-flash');
  const panelCount = cards.length + 2; 
  document.body.style.height = (panelCount * 100) + 'vh';
  const MILESTONE_OFFSET = 1; 
  let dots = [...document.querySelectorAll('.journey-dot')];
  if (dots.length === 0 && cards.length > 0) {
    const nav = document.createElement('div');
    nav.style.position = 'fixed';
    nav.style.right = '2rem';
    nav.style.top = '50%';
    nav.style.transform = 'translateY(-50%)';
    nav.style.display = 'flex';
    nav.style.flexDirection = 'column';
    nav.style.gap = '1rem';
    nav.style.zIndex = '100';
    cards.forEach((c, i) => {
      const d = document.createElement('div');
      d.className = 'journey-dot';
      d.dataset.index = i;
      d.style.width = '8px';
      d.style.height = '8px';
      d.style.borderRadius = '50%';
      d.style.background = 'rgba(255,255,255,0.2)';
      d.style.cursor = 'pointer';
      d.style.transition = 'background 0.3s';
      nav.appendChild(d);
    });
    document.body.appendChild(nav);
    dots = [...nav.querySelectorAll('.journey-dot')];
  }
  let currentPanel = 0;
  let currentMilestone = null;
  let isAnimating = false;
  let scrollTimeout;
  let pendingPanel = null;
  const progressBar = document.getElementById('scroll-progress');
  function getPanelIndex() {
    const h = window.innerHeight;
    const s = document.documentElement.scrollTop;
    return Math.round(s / h);
  }
  function scrollToMilestone(index) {
    const targetY = (index + MILESTONE_OFFSET) * window.innerHeight;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  }
  function resetCardStates() {
    cards.forEach(card => {
      card.classList.remove('is-active', 'is-entering', 'is-exiting');
      card.classList.add('is-hidden');
      card.style.zIndex = '1';
      card.style.pointerEvents = 'none';
      card.style.animation = ''; 
    });
  }
  function finishAnimation() {
    isAnimating = false;
    if (pendingPanel !== null) {
      const p = pendingPanel;
      pendingPanel = null;
      applyPanel(p, true);
    }
  }
  function startEnter(index) {
    if (index < 0 || index >= cards.length) {
      finishAnimation();
      return;
    }
    const card = cards[index];
    card.classList.remove('is-hidden', 'is-exiting');
    card.style.animation = ''; 
    void card.offsetWidth; 
    card.classList.add('is-entering');
    card.style.zIndex = '10';
    card.style.pointerEvents = 'all';
    if (stage) {
      stage.classList.remove('warping');
      void stage.offsetWidth;
      stage.classList.add('warping');
      setTimeout(() => stage.classList.remove('warping'), 180);
    }
    if (warpFlash) {
      void warpFlash.offsetWidth;
      warpFlash.classList.add('flashing');
      requestAnimationFrame(() => requestAnimationFrame(() => warpFlash.classList.remove('flashing')));
    }
    let done = false;
    const complete = () => {
      if (done) return;
      done = true;
      card.removeEventListener('animationend', onEnd);
      card.classList.remove('is-entering');
      card.classList.add('is-active');
      card.style.animation = '';
      finishAnimation();
    };
    const onEnd = e => {
      if (e.target !== card || e.animationName !== 'warp-enter') return;
      complete();
    };
    card.addEventListener('animationend', onEnd);
    setTimeout(complete, 950);
  }
  function startExit(index, thenShow = null) {
    if (index < 0 || index >= cards.length) {
      if (thenShow !== null) startEnter(thenShow);
      else finishAnimation();
      return;
    }
    const card = cards[index];
    card.classList.remove('is-active', 'is-entering');
    card.style.animation = '';
    void card.offsetWidth;
    card.classList.add('is-exiting');
    card.style.zIndex = '1';
    card.style.pointerEvents = 'none';
    if (stage) {
      setTimeout(() => {
        stage.classList.add('warping');
        setTimeout(() => stage.classList.remove('warping'), 180);
      }, 180);
    }
    if (warpFlash) {
      setTimeout(() => {
        void warpFlash.offsetWidth;
        warpFlash.classList.add('flashing');
        requestAnimationFrame(() => requestAnimationFrame(() => warpFlash.classList.remove('flashing')));
      }, 180);
    }
    if (thenShow !== null) {
      startEnter(thenShow);
    }
    let done = false;
    const complete = () => {
      if (done) return;
      done = true;
      card.removeEventListener('animationend', onEnd);
      card.classList.remove('is-exiting');
      card.classList.add('is-hidden');
      card.style.animation = '';
      if (thenShow === null) finishAnimation();
    };
    const onEnd = e => {
      if (e.target !== card || e.animationName !== 'warp-exit') return;
      complete();
    };
    card.addEventListener('animationend', onEnd);
    setTimeout(complete, 650);
  }
  function showMilestone(index) {
    if (index === currentMilestone && !isAnimating) return;
    isAnimating = true;
    const prev = currentMilestone;
    currentMilestone = index;
    dots.forEach((dot, i) => {
      dot.style.background = (i === index) ? '#9b30ff' : 'rgba(255,255,255,0.2)';
    });
    if (prev !== null) {
      startExit(prev, index);
    } else {
      resetCardStates();
      startEnter(index);
    }
  }
  function hideAllMilestones() {
    if (currentMilestone === null) {
      resetCardStates();
      return;
    }
    isAnimating = true;
    const prev = currentMilestone;
    currentMilestone = null;
    dots.forEach(dot => dot.style.background = 'rgba(255,255,255,0.2)');
    startExit(prev, null);
  }
  function applyPanel(panel, force = false) {
    if (!force && isAnimating) {
      pendingPanel = panel;
      return;
    }
    if (panel === currentPanel && !force) return;
    currentPanel = panel;
    if (typeof HyperspeedApp !== 'undefined') {
       const ev = new CustomEvent('hyperspeed:speedup');
       window.dispatchEvent(ev);
    }
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
       const ev = new CustomEvent('hyperspeed:slowdown');
       window.dispatchEvent(ev);
    }, 300);
    const progress = panelCount > 1 ? panel / (panelCount - 1) : 0;
    if (progressBar) progressBar.style.width = (progress * 100) + '%';
    const isIntro = panel === 0;
    const isOutro = panel === panelCount - 1;
    const milestoneIndex = panel - MILESTONE_OFFSET;
    if (header) {
      header.style.opacity = isIntro ? '1' : '0.15';
    }
    if (footer) {
      footer.classList.toggle('visible', isOutro);
      footer.style.pointerEvents = isOutro ? 'all' : 'none';
      if (isOutro) footer.style.opacity = '1';
      else footer.style.opacity = '0';
    }
    if (isIntro) {
      hideAllMilestones();
      return;
    }
    if (isOutro) {
      hideAllMilestones();
      return;
    }
    if (milestoneIndex >= 0 && milestoneIndex < cards.length) {
      showMilestone(milestoneIndex);
    }
  }
  function onScrollSettle() {
    const panel = Math.min(Math.max(getPanelIndex(), 0), panelCount - 1);
    applyPanel(panel);
  }
  resetCardStates();
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = Number(dot.dataset.index);
      if (!Number.isNaN(index)) scrollToMilestone(index);
    });
  });
  let scrollEndTimer;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(onScrollSettle, 40);
  }, { passive: true });
  onScrollSettle();
}
function initUniverse() {
  const cards = document.querySelectorAll('.hobby-card');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: .15 });
  cards.forEach(c => obs.observe(c));
  const uniDesc = document.querySelector('.uni-desc');
  if (uniDesc && typeof VariableProximity !== 'undefined') {
    new VariableProximity(uniDesc, {
      radius: 60,
      falloff: 'linear'
    });
  }
  const hobbyTexts = document.querySelectorAll('.hobby-text');
  if (typeof VariableProximity !== 'undefined') {
    hobbyTexts.forEach(txt => {
      new VariableProximity(txt, {
        radius: 60,
        falloff: 'linear'
      });
    });
  }
  const uniQuotes = document.querySelectorAll('.uni-quote');
  if (typeof VariableProximity !== 'undefined') {
    uniQuotes.forEach(quote => {
      new VariableProximity(quote, {
        radius: 90,
        falloff: 'linear'
      });
    });
  }
  const quoteSlides = document.querySelectorAll('.quote-slide');
  if (quoteSlides.length > 1) {
    let currentQuote = 0;
    setInterval(() => {
      const prev = quoteSlides[currentQuote];
      prev.style.opacity = '0';
      prev.style.pointerEvents = 'none';
      prev.style.transform = 'translateY(-10px)';
      prev.classList.remove('is-active');
      currentQuote = (currentQuote + 1) % quoteSlides.length;
      const next = quoteSlides[currentQuote];
      next.style.transform = 'translateY(10px)';
      setTimeout(() => {
        next.style.opacity = '1';
        next.style.pointerEvents = 'all';
        next.style.transform = 'translateY(0px)';
        next.classList.add('is-active');
      }, 50);
    }, 60000);
  }
  const emberBg = document.querySelector('.ember-bg');
  if (emberBg && typeof THREE !== 'undefined') {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 200;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    emberBg.appendChild(renderer.domElement);
    const particleCount = 150;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 400; 
      positions[i * 3 + 1] = (Math.random() - 0.5) * 400; 
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200; 
      velocities.push({
        y: Math.random() * 0.15 + 0.05,
        x: (Math.random() - 0.5) * 0.05,
        oscSpeed: Math.random() * 0.015,
        oscOffset: Math.random() * Math.PI * 2
      });
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 200, 100, 1)');
    grad.addColorStop(0.2, 'rgba(255, 100, 50, 0.8)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.PointsMaterial({
      size: 4,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.6
    });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    let time = 0;
    function animate() {
      requestAnimationFrame(animate);
      time += 1;
      const posAttr = geometry.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        let x = posAttr.getX(i);
        let y = posAttr.getY(i);
        const v = velocities[i];
        y += v.y;
        x += Math.sin(time * v.oscSpeed + v.oscOffset) * 0.3 + v.x;
        if (y > 200) {
          y = -200;
          x = (Math.random() - 0.5) * 400;
        }
        posAttr.setXY(i, x, y);
      }
      posAttr.needsUpdate = true;
      renderer.render(scene, camera);
    }
    animate();
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
}
function initContact() {
  if (typeof FaultyTerminalApp !== 'undefined' && FaultyTerminalApp.init) {
    FaultyTerminalApp.init();
  }
  const fuzzyMount = document.getElementById('fuzzy-title-mount');
  if (fuzzyMount && typeof FuzzyText !== 'undefined') {
    new FuzzyText(fuzzyMount, {
      segments: [
        { text: "LET'S BUILD", color: '#fff', newline: false },
        { text: "SOMETHING REAL.", color: '#fff', newline: true }
      ],
      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
      fontWeight: 700,
      fontFamily: 'Outfit, sans-serif',
      enableHover: true,
      baseIntensity: 0.15,
      hoverIntensity: 0.8
    });
  }
  const contactDesc = document.querySelector('.contact-desc');
  if (contactDesc && typeof VariableProximity !== 'undefined') {
    new VariableProximity(contactDesc, {
      radius: 60,
      falloff: 'linear'
    });
  }
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn     = form.querySelector('.submit-btn');
    const btnText = btn.querySelector('span');
    btnText.textContent = 'TRANSMITTING...';
    setTimeout(() => {
      btnText.textContent = 'MESSAGE_SENT';
      btn.style.borderColor = '#2ecc71';
      btn.style.color = '#2ecc71';
      form.reset();
      setTimeout(() => {
        btnText.textContent = 'TRANSMIT_MESSAGE()';
        btn.style.borderColor = '';
        btn.style.color = '';
      }, 3500);
    }, 1600);
  });
}
let matrixTimeout;
document.addEventListener('click', () => {
  const matrixBg = document.getElementById('matrix-bg');
  if (matrixBg) {
    matrixBg.classList.add('active');
    clearTimeout(matrixTimeout);
    matrixTimeout = setTimeout(() => {
      matrixBg.classList.remove('active');
    }, 2000);
  }
});
