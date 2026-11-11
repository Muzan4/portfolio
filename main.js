
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
  pt.style.transform = 'translateY(-100%)';
};
hidePt();
window.addEventListener('load', hidePt);
document.addEventListener('DOMContentLoaded', hidePt);
setTimeout(hidePt, 50);
setTimeout(hidePt, 250);
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

  if (typeof TiltedCard !== 'undefined') {
    TiltedCard.attachAll('.proj-card', {
      rotateAmplitude: 14,
      scaleOnHover: 1.04,
      perspective: 900,
      radius: 14,
      smoothness: 0.6,
      glare: 0.55,
      glareColor: '#00ff41',
      shadow: 0.5,
      parallax: 1.2
    });
  }
}
function initJourney() {
  /* Boot hyperspeed background */
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

  /* DOM refs */
  const cards     = [...document.querySelectorAll('.milestone-card')];
  const footer    = document.querySelector('.journey-footer');
  const header    = document.querySelector('.journey-header');
  const stage     = document.querySelector('.milestone-stage');
  const warpFlash = document.querySelector('.warp-flash');

  const panelCount       = cards.length + 2;
  const MILESTONE_OFFSET = 1;
  document.body.style.height = (panelCount * 100) + 'vh';

  /* Build dot-nav */
  let dots = [...document.querySelectorAll('.journey-dot')];
  if (dots.length === 0 && cards.length > 0) {
    const nav = document.createElement('div');
    nav.className = 'journey-dot-nav';
    Object.assign(nav.style, {
      position: 'fixed', right: '2rem', top: '50%',
      transform: 'translateY(-50%)', display: 'flex',
      flexDirection: 'column', gap: '1rem', zIndex: '100'
    });
    cards.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'journey-dot';
      d.dataset.index = i;
      Object.assign(d.style, {
        width: '8px', height: '8px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.2)', cursor: 'pointer',
        transition: 'background 0.3s, transform 0.3s, box-shadow 0.3s'
      });
      nav.appendChild(d);
    });
    document.body.appendChild(nav);
    dots = [...nav.querySelectorAll('.journey-dot')];
  }

  /* State */
  let currentPanel     = 0;
  let currentMilestone = null;
  let isAnimating      = false;
  let pendingPanel     = null;
  const activeAnims    = new Map();
  const progressBar    = document.getElementById('scroll-progress');

  /* Utilities */
  function getPanelIndex() {
    return Math.round(document.documentElement.scrollTop / window.innerHeight);
  }
  function scrollToMilestone(index) {
    window.scrollTo({ top: (index + MILESTONE_OFFSET) * window.innerHeight, behavior: 'smooth' });
  }

  function cancelAnim(card) {
    const a = activeAnims.get(card);
    if (a) { try { a.cancel(); } catch(e) {} activeAnims.delete(card); }
  }

  function parkCard(card) {
    cancelAnim(card);
    card.classList.remove('is-active', 'is-entering', 'is-exiting');
    card.classList.add('is-hidden');
    card.style.pointerEvents = 'none';
    card.style.zIndex = '1';
  }

  function resetCardStates() { cards.forEach(parkCard); }

  /* Warp flash — driven by WAAPI so no jank from class toggles */
  function flashWarp(delayMs) {
    if (!warpFlash) return;
    setTimeout(() => {
      const a = warpFlash.animate([
        { opacity: 0 },
        { opacity: 1,   offset: 0.08 },
        { opacity: 0.55, offset: 0.3  },
        { opacity: 0 }
      ], { duration: 460, easing: 'ease-out' });
    }, delayMs || 0);
  }

  /* Header soft-dim / restore using WAAPI */
  function animateHeader(toActive) {
    if (!header) return;
    const kf = toActive
      ? [{ opacity: 0.12, transform: 'scale(0.84) translateY(-16px)', filter: 'blur(4px)' }]
      : [{ opacity: 1,    transform: 'scale(1) translateY(0px)',       filter: 'blur(0px)' }];
    header.animate(kf, { duration: 680, easing: 'cubic-bezier(0.16,1,0.3,1)', fill: 'forwards' });
  }

  /* Dot updates */
  function updateDots(index) {
    dots.forEach((d, i) => {
      const on = i === index;
      d.style.background = on ? '#9b30ff' : 'rgba(255,255,255,0.18)';
      d.style.transform  = on ? 'scale(1.3)' : 'scale(1)';
      d.style.boxShadow  = on ? '0 0 14px rgba(155,48,255,0.9)' : 'none';
    });
  }

  /* ENTER: warp in from behind, physics spring */
  function animateEnter(card, onDone) {
    cancelAnim(card);
    card.classList.remove('is-hidden', 'is-exiting', 'is-active');
    card.style.pointerEvents = 'none';
    card.style.zIndex = '10';

    if (stage) {
      stage.classList.add('warping');
      setTimeout(() => stage.classList.remove('warping'), 220);
    }
    flashWarp(0);

    const anim = card.animate([
      {
        offset: 0,
        opacity: 0,
        transform: 'translate(-50%,-50%) translateZ(-2200px) scale(0.52)',
        filter: 'blur(32px) brightness(5) saturate(2.5)'
      },
      {
        offset: 0.28,
        opacity: 0.7,
        transform: 'translate(-50%,-50%) translateZ(-520px) scale(0.86)',
        filter: 'blur(8px) brightness(2.2) saturate(1.5)'
      },
      {
        offset: 0.70,
        opacity: 1,
        transform: 'translate(-50%,-50%) translateZ(-45px) scale(0.99)',
        filter: 'blur(0.4px) brightness(1.1)'
      },
      {
        offset: 1,
        opacity: 1,
        transform: 'translate(-50%,-50%) translateZ(0px) scale(1)',
        filter: 'blur(0px) brightness(1)'
      }
    ], {
      duration: 860,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      fill: 'forwards'
    });

    activeAnims.set(card, anim);
    anim.onfinish = () => {
      activeAnims.delete(card);
      card.classList.add('is-active');
      card.style.pointerEvents = 'all';
      onDone && onDone();
    };
    anim.oncancel = () => activeAnims.delete(card);
  }

  /* EXIT: warp out toward camera */
  function animateExit(card, onDone) {
    cancelAnim(card);
    card.classList.remove('is-active', 'is-entering');
    card.style.pointerEvents = 'none';
    card.style.zIndex = '1';

    flashWarp(140);

    const anim = card.animate([
      {
        offset: 0,
        opacity: 1,
        transform: 'translate(-50%,-50%) translateZ(0px) scale(1)',
        filter: 'blur(0px) brightness(1)'
      },
      {
        offset: 0.26,
        opacity: 0.9,
        transform: 'translate(-50%,-50%) translateZ(200px) scale(1.05)',
        filter: 'blur(1px) brightness(1.6)'
      },
      {
        offset: 0.62,
        opacity: 0.25,
        transform: 'translate(-50%,-50%) translateZ(680px) scale(1.18)',
        filter: 'blur(14px) brightness(3.5) saturate(0.4)'
      },
      {
        offset: 1,
        opacity: 0,
        transform: 'translate(-50%,-50%) translateZ(1300px) scale(1.38)',
        filter: 'blur(42px) brightness(6)'
      }
    ], {
      duration: 520,
      easing: 'cubic-bezier(0.6, 0, 0.9, 0.55)',
      fill: 'forwards'
    });

    activeAnims.set(card, anim);
    anim.onfinish = () => {
      activeAnims.delete(card);
      card.classList.add('is-hidden');
      onDone && onDone();
    };
    anim.oncancel = () => activeAnims.delete(card);
  }

  /* Finish animation + flush pending */
  function finishAnimation() {
    isAnimating = false;
    if (pendingPanel !== null) {
      const p = pendingPanel;
      pendingPanel = null;
      applyPanel(p, true);
    }
  }

  /* Milestone orchestrator */
  function showMilestone(index) {
    if (index === currentMilestone && !isAnimating) return;
    const prev = currentMilestone;
    currentMilestone = index;
    isAnimating = true;
    updateDots(index);
    animateHeader(true);

    if (prev !== null && prev !== index) {
      animateExit(cards[prev], () => {
        animateEnter(cards[index], finishAnimation);
      });
    } else {
      resetCardStates();
      animateEnter(cards[index], finishAnimation);
    }
  }

  function hideAllMilestones() {
    animateHeader(false);
    if (currentMilestone === null) {
      resetCardStates();
      return;
    }
    isAnimating = true;
    const prev = currentMilestone;
    currentMilestone = null;
    updateDots(-1);
    animateExit(cards[prev], finishAnimation);
  }

  /* Panel controller */
  function applyPanel(panel, force) {
    if (!force && isAnimating) { pendingPanel = panel; return; }
    if (panel === currentPanel && !force) return;
    currentPanel = panel;

    window.dispatchEvent(new CustomEvent('hyperspeed:speedup'));
    clearTimeout(applyPanel._t);
    applyPanel._t = setTimeout(() => window.dispatchEvent(new CustomEvent('hyperspeed:slowdown')), 340);

    const progress = panelCount > 1 ? panel / (panelCount - 1) : 0;
    if (progressBar) progressBar.style.width = (progress * 100) + '%';

    const isIntro        = panel === 0;
    const isOutro        = panel === panelCount - 1;
    const milestoneIndex = panel - MILESTONE_OFFSET;

    if (footer) {
      footer.classList.toggle('visible', isOutro);
      footer.style.pointerEvents = isOutro ? 'all' : 'none';
    }

    if (isIntro || isOutro) { hideAllMilestones(); return; }

    if (milestoneIndex >= 0 && milestoneIndex < cards.length) {
      showMilestone(milestoneIndex);
    }
  }

  /* Init */
  resetCardStates();
  animateHeader(false);

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = Number(dot.dataset.index);
      if (!Number.isNaN(index)) scrollToMilestone(index);
    });
  });

  let scrollEndTimer;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(() => {
      const panel = Math.min(Math.max(getPanelIndex(), 0), panelCount - 1);
      applyPanel(panel);
    }, 60);
  }, { passive: true });

  const panel0 = Math.min(Math.max(getPanelIndex(), 0), panelCount - 1);
  applyPanel(panel0);
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

  const portraitMount = document.getElementById('halftone-portrait');
  if (portraitMount && typeof HalftoneReveal !== 'undefined') {
    const portraitSrc = (typeof window !== 'undefined' && window.USER_PORTRAIT_DATA_URL) ? window.USER_PORTRAIT_DATA_URL : 'photostudio_1794388220407.png';
    new HalftoneReveal(portraitMount, {
      src: portraitSrc,
      mode: 'mono',
      shape: 'dot',
      cellSize: 5,
      angle: 45,
      inkColor: '#f4f1ea',
      paperColor: '#0f0800',
      revealRadius: 165,
      dotScale: 0.95,
      brightness: 0.02,
      roughness: 0.45,
      accentColor: '#1b3a55',
      softness: 0.45,
      linger: 1.2,
      wander: false,
      clickBurst: false,
      intro: false,
      fit: 'contain'
    });
  }
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
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn     = form.querySelector('.submit-btn');
    const btnText = btn.querySelector('span');

    const nameInput    = form.querySelector('#name');
    const emailInput   = form.querySelector('#email');
    const subjectInput = form.querySelector('#subject');
    const messageInput = form.querySelector('#message');

    const name    = nameInput ? nameInput.value.trim() : '';
    const email   = emailInput ? emailInput.value.trim() : '';
    const subject = subjectInput ? subjectInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';

    if (!name || !email || !message) {
      const origText = btnText.textContent;
      btnText.textContent = 'FILL_REQUIRED_FIELDS';
      btn.style.borderColor = '#ff4d4d';
      btn.style.color = '#ff4d4d';
      setTimeout(() => {
        btnText.textContent = origText;
        btn.style.borderColor = '';
        btn.style.color = '';
      }, 2500);
      return;
    }

    btn.disabled = true;
    btnText.textContent = 'TRANSMITTING...';

    try {
      const response = await fetch('https://formsubmit.co/ajax/aabidzaidi@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          email: email,
          _subject: subject ? `[Portfolio Contact] ${subject}` : 'New Message from Portfolio',
          message: message,
          _captcha: 'false',
          _template: 'table'
        })
      });

      const result = await response.json().catch(() => ({}));
      if (response.ok && (result.success === 'true' || result.success === true || result.message)) {
        btnText.textContent = 'MESSAGE_SENT ✓';
        btn.style.borderColor = '#2ecc71';
        btn.style.color = '#2ecc71';
        form.reset();
      } else {
        throw new Error(result.message || 'Submission error');
      }
    } catch (err) {
      console.error('Contact submit error:', err);
      btnText.textContent = 'TRANSMISSION_FAILED';
      btn.style.borderColor = '#ff4d4d';
      btn.style.color = '#ff4d4d';
    } finally {
      setTimeout(() => {
        btnText.textContent = 'TRANSMIT_MESSAGE()';
        btn.style.borderColor = '';
        btn.style.color = '';
        btn.disabled = false;
      }, 3500);
    }
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
