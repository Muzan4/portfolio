class FaultyTerminalApp {
  static init() {
    const container = document.getElementById('faulty-terminal-container');
    if (!container) return;
    const tintColor = '#4cc9f0';
    let h = tintColor.replace('#', '').trim();
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const num = parseInt(h, 16);
    const tintRgb = new THREE.Vector3(((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.offsetWidth, container.offsetHeight);
    this.renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    this.camera.position.z = 1;
    const geometry = new THREE.PlaneGeometry(2, 2);
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;
    const fragmentShader = `
      precision mediump float;
      varying vec2 vUv;
      uniform float iTime;
      uniform vec3  iResolution;
      uniform float uScale;
      uniform vec2  uGridMul;
      uniform float uDigitSize;
      uniform float uScanlineIntensity;
      uniform float uGlitchAmount;
      uniform float uFlickerAmount;
      uniform float uNoiseAmp;
      uniform float uChromaticAberration;
      uniform float uDither;
      uniform float uCurvature;
      uniform vec3  uTint;
      uniform vec2  uMouse;
      uniform float uMouseStrength;
      uniform float uUseMouse;
      uniform float uPageLoadProgress;
      uniform float uUsePageLoadAnimation;
      uniform float uBrightness;
      float time;
      float hash21(vec2 p){
        p = fract(p * 234.56);
        p += dot(p, p + 34.56);
        return fract(p.x * p.y);
      }
      float noise(vec2 p) {
        return sin(p.x * 10.0) * sin(p.y * (3.0 + sin(time * 0.090909))) + 0.2; 
      }
      mat2 rotate(float angle) {
        float c = cos(angle);
        float s = sin(angle);
        return mat2(c, -s, s, c);
      }
      float fbm(vec2 p) {
        p *= 1.1;
        float f = 0.0;
        float amp = 0.5 * uNoiseAmp;
        mat2 modify0 = rotate(time * 0.02);
        f += amp * noise(p);
        p = modify0 * p * 2.0;
        amp *= 0.454545;
        mat2 modify1 = rotate(time * 0.02);
        f += amp * noise(p);
        p = modify1 * p * 2.0;
        amp *= 0.454545;
        mat2 modify2 = rotate(time * 0.08);
        f += amp * noise(p);
        return f;
      }
      float pattern(vec2 p, out vec2 q, out vec2 r) {
        vec2 offset1 = vec2(1.0);
        vec2 offset0 = vec2(0.0);
        mat2 rot01 = rotate(0.1 * time);
        mat2 rot1 = rotate(0.1);
        q = vec2(fbm(p + offset1), fbm(rot01 * p + offset1));
        r = vec2(fbm(rot1 * q + offset0), fbm(q + offset0));
        return fbm(p + r);
      }
      float digit(vec2 p){
          vec2 grid = uGridMul * 15.0;
          vec2 s = floor(p * grid) / grid;
          p = p * grid;
          vec2 q, r;
          float intensity = pattern(s * 0.1, q, r) * 1.3 - 0.03;
          if(uUseMouse > 0.5){
              vec2 mouseWorld = uMouse * uScale;
              float distToMouse = distance(s, mouseWorld);
              float mouseInfluence = exp(-distToMouse * 20.0) * uMouseStrength * 10.0;
              intensity += mouseInfluence;
              float ripple = sin(distToMouse * 20.0 - iTime * 5.0) * 0.1 * mouseInfluence;
              intensity += ripple;
          }
          if(uUsePageLoadAnimation > 0.5){
              float cellRandom = fract(sin(dot(s, vec2(12.9898, 78.233))) * 43758.5453);
              float cellDelay = cellRandom * 0.8;
              float cellProgress = clamp((uPageLoadProgress - cellDelay) / 0.2, 0.0, 1.0);
              float fadeAlpha = smoothstep(0.0, 1.0, cellProgress);
              intensity *= fadeAlpha;
          }
          p = fract(p);
          p *= uDigitSize;
          float px5 = p.x * 5.0;
          float py5 = (1.0 - p.y) * 5.0;
          float x = fract(px5);
          float y = fract(py5);
          float i = floor(py5) - 2.0;
          float j = floor(px5) - 2.0;
          float n = i * i + j * j;
          float f = n * 0.0625;
          float isOn = step(0.1, intensity - f);
          float brightness = isOn * (0.2 + y * 0.8) * (0.75 + x * 0.25);
          return step(0.0, p.x) * step(p.x, 1.0) * step(0.0, p.y) * step(p.y, 1.0) * brightness;
      }
      float onOff(float a, float b, float c) {
        return step(c, sin(iTime + a * cos(iTime * b))) * uFlickerAmount;
      }
      float displace(vec2 look) {
          float y = look.y - mod(iTime * 0.25, 1.0);
          float window = 1.0 / (1.0 + 50.0 * y * y);
          return sin(look.y * 20.0 + iTime) * 0.0125 * onOff(4.0, 2.0, 0.8) * (1.0 + cos(iTime * 60.0)) * window;
      }
      vec3 getColor(vec2 p){
          float bar = 1.0;
          bar *= uScanlineIntensity;
          float displacement = displace(p);
          p.x += displacement;
          if (uGlitchAmount != 1.0) {
            float extra = displacement * (uGlitchAmount - 1.0);
            p.x += extra;
          }
          float middle = digit(p);
          const float off = 0.002;
          float sum = digit(p + vec2(-off, -off)) + digit(p + vec2(0.0, -off)) + digit(p + vec2(off, -off)) +
                      digit(p + vec2(-off, 0.0)) + digit(p + vec2(0.0, 0.0)) + digit(p + vec2(off, 0.0)) +
                      digit(p + vec2(-off, off)) + digit(p + vec2(0.0, off)) + digit(p + vec2(off, off));
          vec3 baseColor = vec3(0.9) * middle + sum * 0.1 * vec3(1.0) * bar;
          return baseColor;
      }
      vec2 barrel(vec2 uv){
        vec2 c = uv * 2.0 - 1.0;
        float r2 = dot(c, c);
        c *= 1.0 + uCurvature * r2;
        return c * 0.5 + 0.5;
      }
      void main() {
          time = iTime * 0.333333;
          vec2 uv = vUv;
          if(uCurvature != 0.0){
            uv = barrel(uv);
          }
          vec2 p = uv * uScale;
          vec3 col = getColor(p);
          if(uChromaticAberration != 0.0){
            vec2 ca = vec2(uChromaticAberration) / iResolution.xy;
            col.r = getColor(p + ca).r;
            col.b = getColor(p - ca).b;
          }
          col *= uTint;
          col *= uBrightness;
          if(uDither > 0.0){
            float rnd = hash21(gl_FragCoord.xy);
            col += (rnd - 0.5) * (uDither * 0.003922);
          }
          gl_FragColor = vec4(col, 1.0);
      }
    `;
    this.uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3(container.offsetWidth, container.offsetHeight, container.offsetWidth / container.offsetHeight) },
      uScale: { value: 1.0 }, 
      uGridMul: { value: new THREE.Vector2(8, 4) },
      uDigitSize: { value: 1.2 },
      uScanlineIntensity: { value: 0.5 },
      uGlitchAmount: { value: 0 }, 
      uFlickerAmount: { value: 1 },
      uNoiseAmp: { value: 1 },
      uChromaticAberration: { value: 0 },
      uDither: { value: 0 },
      uCurvature: { value: 0 },
      uTint: { value: tintRgb },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uMouseStrength: { value: 0.5 },
      uUseMouse: { value: 1 },
      uPageLoadProgress: { value: 1 },
      uUsePageLoadAnimation: { value: 0 },
      uBrightness: { value: 0.75 }
    };
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      transparent: true
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
    this.targetMouse = { x: 0.5, y: 0.5 };
    this.currentMouse = { x: 0.5, y: 0.5 };
    this.onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      this.targetMouse.x = x;
      this.targetMouse.y = y;
    };
    window.addEventListener('mousemove', this.onMouseMove);
    this.onResize = () => {
      if (!container) return;
      this.renderer.setSize(container.offsetWidth, container.offsetHeight);
      this.uniforms.iResolution.value.set(
        container.offsetWidth,
        container.offsetHeight,
        container.offsetWidth / container.offsetHeight
      );
    };
    window.addEventListener('resize', this.onResize);
    this.clock = new THREE.Clock();
    this.animate = this.animate.bind(this);
    this.animate();
  }
  static animate() {
    this.rafId = requestAnimationFrame(this.animate);
    const elapsed = this.clock.getElapsedTime() * 1.0; 
    this.uniforms.iTime.value = elapsed;
    this.currentMouse.x += (this.targetMouse.x - this.currentMouse.x) * 0.08;
    this.currentMouse.y += (this.targetMouse.y - this.currentMouse.y) * 0.08;
    this.uniforms.uMouse.value.set(this.currentMouse.x, this.currentMouse.y);
    this.renderer.render(this.scene, this.camera);
  }
}
window.FaultyTerminalApp = FaultyTerminalApp;
