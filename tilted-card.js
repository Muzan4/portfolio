/**
 * TiltedCard — Pure JavaScript implementation
 * Adapted from React Bits (https://reactbits.dev)
 */

(function (global) {
  'use strict';

  const FLIP_THRESHOLD = 6;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const parseColor = value => {
    const text = String(value || '').trim();
    const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);
    if (hex) {
      const full = hex[1].length === 3 ? hex[1].replace(/./g, digit => digit + digit) : hex[1];
      return [0, 2, 4].map(index => parseInt(full.slice(index, index + 2), 16));
    }
    const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(text);
    if (rgb) return [rgb[1], rgb[2], rgb[3]].map(channel => clamp(Math.round(parseFloat(channel)), 0, 255));
    return null;
  };

  const toLength = value => (typeof value === 'number' ? `${value}px` : value);

  const smoother = t => {
    const x = clamp(t, 0, 1);
    return x * x * x * (x * (x * 6 - 15) + 10);
  };

  const step = (state, key, target, omega, zeta, dt) => {
    const velocity = `v${key}`;
    const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
    const h = dt / steps;
    for (let index = 0; index < steps; index++) {
      state[velocity] += (omega * omega * (target - state[key]) - 2 * zeta * omega * state[velocity]) * h;
      state[key] += state[velocity] * h;
    }
    const settled = Math.abs(target - state[key]) < 0.001 && Math.abs(state[velocity]) < 0.01;
    if (settled) {
      state[key] = target;
      state[velocity] = 0;
    }
    return !settled;
  };

  class TiltedCard {
    constructor(element, options = {}) {
      if (!element) return;
      this.figure = element;
      this.options = Object.assign({
        rotateAmplitude: 14,
        scaleOnHover: 1.04,
        perspective: 900,
        radius: 14,
        smoothness: 0.6,
        glare: 0.55,
        glareColor: '#00ff41',
        shadow: 0.5,
        parallax: 1.2,
        axis: 'both',
        reverse: false,
        trackWindow: false,
        floating: false,
        gyroscope: true,
        intro: true,
        introDelay: 0,
        flipOnClick: false
      }, options);

      this.initDOM();
      this.initEvents();
    }

    initDOM() {
      const figure = this.figure;
      figure.classList.add('tilted-card');
      figure.style.perspective = toLength(this.options.perspective);

      // Wrap existing children inside shadow & body if not already structured
      if (!figure.querySelector('.tilted-card__body')) {
        const rawChildren = Array.from(figure.childNodes);

        const shadow = document.createElement('div');
        shadow.className = 'tilted-card__shadow';
        shadow.setAttribute('aria-hidden', 'true');

        const body = document.createElement('div');
        body.className = 'tilted-card__body';

        const face = document.createElement('div');
        face.className = 'tilted-card__face tilted-card__front';

        rawChildren.forEach(child => face.appendChild(child));

        const glare = document.createElement('span');
        glare.className = 'tilted-card__glare';
        glare.setAttribute('aria-hidden', 'true');

        const rim = document.createElement('span');
        rim.className = 'tilted-card__rim';
        rim.setAttribute('aria-hidden', 'true');

        const edge = document.createElement('span');
        edge.className = 'tilted-card__edge';
        edge.setAttribute('aria-hidden', 'true');

        face.appendChild(glare);
        face.appendChild(rim);
        face.appendChild(edge);

        body.appendChild(face);
        figure.appendChild(shadow);
        figure.appendChild(body);
      }

      this.shadow = figure.querySelector('.tilted-card__shadow');
      this.body = figure.querySelector('.tilted-card__body');

      const corner = toLength(this.options.radius);
      const glareRgb = (parseColor(this.options.glareColor) || [0, 255, 65]).join(', ');

      if (this.shadow) {
        this.shadow.style.borderRadius = corner;
      }
      if (this.body) {
        this.body.style.setProperty('--tc-radius', corner);
        this.body.style.setProperty('--tc-glare-rgb', glareRgb);
      }
    }

    initEvents() {
      const figure = this.figure;
      const body = this.body;
      const shadow = this.shadow;
      if (!figure || !body) return;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

      const state = {
        rx: 0,
        vrx: 0,
        ry: 0,
        vry: 0,
        lift: 0,
        vlift: 0,
        ty: 0,
        vty: 0,
        flip: 0,
        vflip: 0,
        press: 0,
        vpress: 0,
        tip: 0,
        vtip: 0,
        shown: 0,
        vshown: 0,
        tx: 0,
        tyy: 0
      };

      const pointer = { nx: 0, ny: 0, x: 0, y: 0, inside: false, mouse: false, seen: false, vx: 0, last: 0 };
      const press = { active: false, x: 0, y: 0, moved: false };
      const tilt = { gamma: 0, beta: 0, baseGamma: 0, baseBeta: 0, calibrated: false, live: false, asked: false };

      let opacity = 1;
      let entered = true;
      let introAt = -1;
      let time = Math.random() * 10;
      let focused = false;
      let raf = 0;
      let last = 0;
      let visible = true;

      const s = this.options;
      const amplitude = clamp(s.rotateAmplitude, 0, 60);

      const frame = now => {
        raf = 0;
        const dt = clamp((now - last) / 1000 || 0, 0, 0.05);
        last = Math.max(last, now);
        time += dt;
        let busy = false;

        const effectiveAmp = amplitude * (reduced ? 0.3 : 1);
        const hovering = pointer.inside && pointer.mouse;
        const touching = press.active && !pointer.mouse;
        const following = hovering || touching || (s.trackWindow && pointer.seen && !coarse);

        let inputX = 0;
        let inputY = 0;
        if (following) {
          inputX = pointer.nx;
          inputY = pointer.ny;
        } else if (tilt.live && s.gyroscope) {
          inputX = clamp((tilt.gamma - tilt.baseGamma) / 22, -1, 1);
          inputY = clamp((tilt.beta - tilt.baseBeta) / 22, -1, 1);
          tilt.baseGamma += (tilt.gamma - tilt.baseGamma) * (1 - Math.exp(-dt / 4));
          tilt.baseBeta += (tilt.beta - tilt.baseBeta) * (1 - Math.exp(-dt / 4));
          busy = true;
        } else if (s.floating && !reduced && visible) {
          inputX = 0.32 * Math.sin(time * 0.62) + 0.12 * Math.sin(time * 1.31 + 0.7);
          inputY = 0.26 * Math.sin(time * 0.83 + 1.9) + 0.1 * Math.sin(time * 1.57);
          busy = true;
        }

        if (s.axis === 'horizontal') inputY = 0;
        if (s.axis === 'vertical') inputX = 0;
        const sign = s.reverse ? -1 : 1;

        const omega = 20 * Math.pow(0.2, s.smoothness);
        const zeta = 1 - 0.3 * s.smoothness;
        const lifted = hovering || touching || focused ? 1 : 0;

        if (!entered && introAt >= 0 && now >= introAt) entered = true;
        const settle = entered || !s.intro || reduced;

        busy = step(state, 'rx', settle ? -inputY * effectiveAmp * sign : state.rx, omega, zeta, dt) || busy;
        busy = step(state, 'ry', settle ? inputX * effectiveAmp * sign : state.ry, omega, zeta, dt) || busy;
        busy =
          step(
            state,
            'ty',
            settle ? (s.floating && !following && !reduced ? -4 * Math.sin(time * 0.9) : 0) : state.ty,
            omega * 0.8,
            0.9,
            dt
          ) || busy;
        busy = step(state, 'lift', lifted, omega, Math.max(zeta, 0.85), dt) || busy;
        busy = step(state, 'press', press.active && !press.moved ? 1 : 0, 26, 0.8, dt) || busy;

        const active = lifted > 0 || state.lift > 0.01;
        if (active !== figure.hasAttribute('data-active')) figure.toggleAttribute('data-active', active);

        const scale = 1 + (s.scaleOnHover - 1) * state.lift - 0.015 * state.press;
        const rx = state.rx;
        const ry = state.ry;
        const radiansX = (rx * Math.PI) / 180;
        const radiansY = (ry * Math.PI) / 180;

        body.style.transform = `translate3d(0, ${state.ty.toFixed(2)}px, 0) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) scale(${scale.toFixed(4)})`;

        body.style.setProperty('--tc-px', (Math.sin(radiansY) * s.parallax).toFixed(4));
        body.style.setProperty('--tc-py', (-Math.sin(radiansX) * s.parallax).toFixed(4));

        const reach = Math.max(effectiveAmp, 1);
        body.style.setProperty('--tc-gx', `${(50 + (ry / reach) * 46).toFixed(2)}%`);
        body.style.setProperty('--tc-gy', `${(50 - (rx / reach) * 46).toFixed(2)}%`);

        const energy = Math.min(1, Math.hypot(rx, ry) / reach);
        body.style.setProperty(
          '--tc-glare',
          (s.glare * Math.max(state.lift, energy)).toFixed(3)
        );

        if (shadow) {
          const strength = s.shadow;
          const offsetX = -Math.sin(radiansY) * 22;
          const offsetY = 12 + 16 * state.lift + Math.sin(radiansX) * 18 - state.ty * 0.6;
          const spread = scale * (0.86 + 0.04 * state.lift);
          shadow.style.transform = `translate3d(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px, 0) scale(${spread.toFixed(4)})`;
          shadow.style.opacity = (strength * (0.4 + 0.6 * state.lift)).toFixed(3);
        }

        if ((busy || (!settle && s.intro)) && visible) raf = requestAnimationFrame(frame);
      };

      const wake = () => {
        if (raf || !visible) return;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      };

      const locate = (event, area) => {
        const rect = area.getBoundingClientRect();
        return {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          width: Math.max(1, rect.width),
          height: Math.max(1, rect.height)
        };
      };

      const track = event => {
        const spot = locate(event, figure);
        const now = performance.now();
        const elapsed = Math.max(8, now - (pointer.last || now - 16)) / 1000;
        const dx = spot.x - pointer.x;
        pointer.vx += (dx / elapsed - pointer.vx) * 0.5;
        pointer.last = now;
        pointer.x = spot.x;
        pointer.y = spot.y;
        pointer.nx = clamp((spot.x - spot.width / 2) / (spot.width / 2), -1, 1);
        pointer.ny = clamp((spot.y - spot.height / 2) / (spot.height / 2), -1, 1);
      };

      const onEnter = event => {
        if (event.pointerType === 'touch') return;
        pointer.inside = true;
        pointer.mouse = event.pointerType === 'mouse' || event.pointerType === 'pen';
        const spot = locate(event, figure);
        pointer.x = spot.x;
        pointer.y = spot.y;
        pointer.vx = 0;
        track(event);
        wake();
      };

      const onMove = event => {
        if (event.pointerType === 'touch') return;
        pointer.mouse = event.pointerType === 'mouse' || event.pointerType === 'pen';
        if (!pointer.inside && pointer.mouse) {
          pointer.inside = true;
          const spot = locate(event, figure);
          pointer.x = spot.x;
          pointer.y = spot.y;
          pointer.vx = 0;
        }
        track(event);
        if (press.active && Math.hypot(event.clientX - press.x, event.clientY - press.y) > FLIP_THRESHOLD) {
          press.moved = true;
        }
        wake();
      };

      const onLeave = () => {
        pointer.inside = false;
        pointer.vx = 0;
        wake();
      };

      const onDown = event => {
        if (event.pointerType === 'touch') return;
        press.active = true;
        press.moved = false;
        press.x = event.clientX;
        press.y = event.clientY;
        pointer.mouse = event.pointerType === 'mouse' || event.pointerType === 'pen';
        if (!pointer.mouse) {
          pointer.inside = true;
          track(event);
        }
        wake();
      };

      const onUp = () => {
        if (!press.active) return;
        press.active = false;
        wake();
      };

      const onCancel = () => {
        press.active = false;
        press.moved = true;
        pointer.inside = false;
        wake();
      };

      const onFocus = () => {
        focused = figure.matches(':focus-visible');
        wake();
      };

      const onBlur = () => {
        focused = false;
        wake();
      };

      figure.addEventListener('pointerenter', onEnter);
      figure.addEventListener('pointermove', onMove);
      figure.addEventListener('pointerleave', onLeave);
      figure.addEventListener('pointerdown', onDown);
      figure.addEventListener('focus', onFocus);
      figure.addEventListener('blur', onBlur);
      window.addEventListener('pointerup', onUp, { passive: true });
      window.addEventListener('pointercancel', onCancel, { passive: true });

      const observer = new IntersectionObserver(entries => {
        visible = entries.some(entry => entry.isIntersecting);
        if (visible && !entered && introAt < 0) introAt = performance.now() + s.introDelay;
        wake();
      });
      observer.observe(figure);

      wake();
    }

    static attachAll(selector = '.proj-card', options = {}) {
      const elements = document.querySelectorAll(selector);
      return Array.from(elements).map(el => new TiltedCard(el, options));
    }
  }

  global.TiltedCard = TiltedCard;
})(typeof window !== 'undefined' ? window : this);
