(function() {
  const DEFAULT_EFFECT_OPTIONS = {
    onSpeedUp: () => {},
    onSlowDown: () => {},
    distortion: 'turbulentDistortion',
    length: 400,
    roadWidth: 10,
    islandWidth: 2,
    lanesPerRoad: 4,
    fov: 90,
    fovSpeedUp: 150,
    speedUp: 2,
    carLightsFade: 0.4,
    totalSideLightSticks: 20,
    lightPairsPerRoadWay: 40,
    shoulderLinesWidthPercentage: 0.05,
    brokenLinesWidthPercentage: 0.1,
    brokenLinesLengthPercentage: 0.5,
    lightStickWidth: [0.12, 0.5],
    lightStickHeight: [1.3, 1.7],
    movingAwaySpeed: [60, 80],
    movingCloserSpeed: [-120, -160],
    carLightsLength: [400 * 0.03, 400 * 0.2],
    carLightsRadius: [0.05, 0.14],
    carWidthPercentage: [0.3, 0.5],
    carShiftX: [-0.8, 0.8],
    carFloorSeparation: [0, 5],
    colors: {
      roadColor: 0x080808,
      islandColor: 0x0a0a0a,
      background: 0x000000,
      shoulderLines: 0xffffff,
      brokenLines: 0xffffff,
      leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
      rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
      sticks: 0x03b3c3
    }
  };
  const mountainUniforms = { uFreq: { value: new THREE.Vector3(3, 6, 10) }, uAmp: { value: new THREE.Vector3(30, 30, 20) } };
  const xyUniforms = { uFreq: { value: new THREE.Vector2(5, 2) }, uAmp: { value: new THREE.Vector2(25, 15) } };
  const LongRaceUniforms = { uFreq: { value: new THREE.Vector2(2, 3) }, uAmp: { value: new THREE.Vector2(35, 10) } };
  const turbulentUniforms = { uFreq: { value: new THREE.Vector4(4, 8, 8, 1) }, uAmp: { value: new THREE.Vector4(25, 5, 10, 10) } };
  const deepUniforms = { uFreq: { value: new THREE.Vector2(4, 8) }, uAmp: { value: new THREE.Vector2(10, 20) }, uPowY: { value: new THREE.Vector2(20, 2) } };
  let nsin = val => Math.sin(val) * 0.5 + 0.5;
  const distortions = {
    turbulentDistortion: {
      uniforms: turbulentUniforms,
      getDistortion: `
        uniform vec4 uFreq;
        uniform vec4 uAmp;
        float nsin(float val){ return sin(val) * 0.5 + 0.5; }
        #define PI 3.14159265358979
        float getDistortionX(float progress){
          return (cos(PI * progress * uFreq.r + uTime) * uAmp.r + pow(cos(PI * progress * uFreq.g + uTime * (uFreq.g / uFreq.r)), 2. ) * uAmp.g);
        }
        float getDistortionY(float progress){
          return (-nsin(PI * progress * uFreq.b + uTime) * uAmp.b + -pow(nsin(PI * progress * uFreq.a + uTime / (uFreq.b / uFreq.a)), 5.) * uAmp.a);
        }
        vec3 getDistortion(float progress){
          return vec3(getDistortionX(progress) - getDistortionX(0.0125), getDistortionY(progress) - getDistortionY(0.0125), 0.);
        }
      `,
      getJS: (progress, time) => {
        const uFreq = turbulentUniforms.uFreq.value;
        const uAmp = turbulentUniforms.uAmp.value;
        const getX = p => Math.cos(Math.PI * p * uFreq.x + time) * uAmp.x + Math.pow(Math.cos(Math.PI * p * uFreq.y + time * (uFreq.y / uFreq.x)), 2) * uAmp.y;
        const getY = p => -nsin(Math.PI * p * uFreq.z + time) * uAmp.z - Math.pow(nsin(Math.PI * p * uFreq.w + time / (uFreq.z / uFreq.w)), 5) * uAmp.w;
        let distortion = new THREE.Vector3(getX(progress) - getX(progress + 0.007), getY(progress) - getY(progress + 0.007), 0);
        return distortion.multiply(new THREE.Vector3(-2, -5, 0)).add(new THREE.Vector3(0, 0, -10));
      }
    }
  };
  const random = base => Array.isArray(base) ? Math.random() * (base[1] - base[0]) + base[0] : Math.random() * base;
  const pickRandom = arr => Array.isArray(arr) ? arr[Math.floor(Math.random() * arr.length)] : arr;
  function lerp(current, target, speed = 0.1, limit = 0.001) {
    let change = (target - current) * speed;
    return Math.abs(change) < limit ? target - current : change;
  }
  const carLightsFragment = `
    #define USE_FOG;
    ${THREE.ShaderChunk['fog_pars_fragment']}
    varying vec3 vColor;
    varying vec2 vUv; 
    uniform vec2 uFade;
    void main() {
      vec3 color = vec3(vColor);
      float alpha = smoothstep(uFade.x, uFade.y, vUv.x);
      gl_FragColor = vec4(color, alpha);
      if (gl_FragColor.a < 0.0001) discard;
      ${THREE.ShaderChunk['fog_fragment']}
    }
  `;
  const carLightsVertex = `
    #define USE_FOG;
    ${THREE.ShaderChunk['fog_pars_vertex']}
    attribute vec3 aOffset;
    attribute vec3 aMetrics;
    attribute vec3 aColor;
    uniform float uTravelLength;
    uniform float uTime;
    varying vec2 vUv; 
    varying vec3 vColor; 
    #include <getDistortion_vertex>
    void main() {
      vec3 transformed = position.xyz;
      float radius = aMetrics.r;
      float myLength = aMetrics.g;
      float speed = aMetrics.b;
      transformed.xy *= radius;
      transformed.z *= myLength;
      transformed.z += myLength - mod(uTime * speed + aOffset.z, uTravelLength);
      transformed.xy += aOffset.xy;
      float progress = abs(transformed.z / uTravelLength);
      transformed.xyz += getDistortion(progress);
      vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
      gl_Position = projectionMatrix * mvPosition;
      vUv = uv;
      vColor = aColor;
      ${THREE.ShaderChunk['fog_vertex']}
    }
  `;
  class CarLights {
    constructor(webgl, options, colors, speed, fade) {
      this.webgl = webgl;
      this.options = options;
      this.colors = colors;
      this.speed = speed;
      this.fade = fade;
    }
    init() {
      const options = this.options;
      let curve = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1));
      let geometry = new THREE.TubeGeometry(curve, 40, 1, 8, false);
      let instanced = new THREE.InstancedBufferGeometry().copy(geometry);
      instanced.instanceCount = options.lightPairsPerRoadWay * 2;
      let laneWidth = options.roadWidth / options.lanesPerRoad;
      let aOffset = [], aMetrics = [], aColor = [];
      let colors = Array.isArray(this.colors) ? this.colors.map(c => new THREE.Color(c)) : new THREE.Color(this.colors);
      for (let i = 0; i < options.lightPairsPerRoadWay; i++) {
        let radius = random(options.carLightsRadius);
        let length = random(options.carLightsLength);
        let speed = random(this.speed);
        let carLane = i % options.lanesPerRoad;
        let laneX = carLane * laneWidth - options.roadWidth / 2 + laneWidth / 2;
        let carWidth = random(options.carWidthPercentage) * laneWidth;
        let carShiftX = random(options.carShiftX) * laneWidth;
        laneX += carShiftX;
        let offsetY = random(options.carFloorSeparation) + radius * 1.3;
        let offsetZ = -random(options.length);
        aOffset.push(laneX - carWidth / 2, offsetY, offsetZ);
        aOffset.push(laneX + carWidth / 2, offsetY, offsetZ);
        aMetrics.push(radius, length, speed, radius, length, speed);
        let color = pickRandom(colors);
        aColor.push(color.r, color.g, color.b, color.r, color.g, color.b);
      }
      instanced.setAttribute('aOffset', new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 3, false));
      instanced.setAttribute('aMetrics', new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 3, false));
      instanced.setAttribute('aColor', new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false));
      let material = new THREE.ShaderMaterial({
        fragmentShader: carLightsFragment,
        vertexShader: carLightsVertex,
        transparent: true,
        uniforms: Object.assign({ uTime: { value: 0 }, uTravelLength: { value: options.length }, uFade: { value: this.fade } }, this.webgl.fogUniforms, options.distortion.uniforms)
      });
      material.onBeforeCompile = shader => { shader.vertexShader = shader.vertexShader.replace('#include <getDistortion_vertex>', options.distortion.getDistortion); };
      let mesh = new THREE.Mesh(instanced, material);
      mesh.frustumCulled = false;
      this.webgl.scene.add(mesh);
      this.mesh = mesh;
    }
    update(time) { this.mesh.material.uniforms.uTime.value = time; }
  }
  const sideSticksVertex = `
    #define USE_FOG;
    ${THREE.ShaderChunk['fog_pars_vertex']}
    attribute float aOffset;
    attribute vec3 aColor;
    attribute vec2 aMetrics;
    uniform float uTravelLength;
    uniform float uTime;
    varying vec3 vColor;
    mat4 rotationY( in float angle ) {
      return mat4(cos(angle),0,sin(angle),0, 0,1.0,0,0, -sin(angle),0,cos(angle),0, 0,0,0,1);
    }
    #include <getDistortion_vertex>
    void main(){
      vec3 transformed = position.xyz;
      float width = aMetrics.x;
      float height = aMetrics.y;
      transformed.xy *= vec2(width, height);
      float time = mod(uTime * 60. * 2. + aOffset, uTravelLength);
      transformed = (rotationY(3.14/2.) * vec4(transformed,1.)).xyz;
      transformed.z += - uTravelLength + time;
      float progress = abs(transformed.z / uTravelLength);
      transformed.xyz += getDistortion(progress);
      transformed.y += height / 2.;
      transformed.x += -width / 2.;
      vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
      gl_Position = projectionMatrix * mvPosition;
      vColor = aColor;
      ${THREE.ShaderChunk['fog_vertex']}
    }
  `;
  const sideSticksFragment = `
    #define USE_FOG;
    ${THREE.ShaderChunk['fog_pars_fragment']}
    varying vec3 vColor;
    void main(){
      gl_FragColor = vec4(vec3(vColor),1.);
      ${THREE.ShaderChunk['fog_fragment']}
    }
  `;
  class LightsSticks {
    constructor(webgl, options) { this.webgl = webgl; this.options = options; }
    init() {
      const options = this.options;
      const geometry = new THREE.PlaneGeometry(1, 1);
      let instanced = new THREE.InstancedBufferGeometry().copy(geometry);
      instanced.instanceCount = options.totalSideLightSticks;
      let stickoffset = options.length / (options.totalSideLightSticks - 1);
      const aOffset = [], aColor = [], aMetrics = [];
      let colors = Array.isArray(options.colors.sticks) ? options.colors.sticks.map(c => new THREE.Color(c)) : new THREE.Color(options.colors.sticks);
      for (let i = 0; i < options.totalSideLightSticks; i++) {
        let width = random(options.lightStickWidth);
        let height = random(options.lightStickHeight);
        aOffset.push((i - 1) * stickoffset * 2 + stickoffset * Math.random());
        let color = pickRandom(colors);
        aColor.push(color.r, color.g, color.b);
        aMetrics.push(width, height);
      }
      instanced.setAttribute('aOffset', new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 1, false));
      instanced.setAttribute('aColor', new THREE.InstancedBufferAttribute(new Float32Array(aColor), 3, false));
      instanced.setAttribute('aMetrics', new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 2, false));
      const material = new THREE.ShaderMaterial({
        fragmentShader: sideSticksFragment,
        vertexShader: sideSticksVertex,
        side: THREE.DoubleSide,
        uniforms: Object.assign({ uTravelLength: { value: options.length }, uTime: { value: 0 } }, this.webgl.fogUniforms, options.distortion.uniforms)
      });
      material.onBeforeCompile = shader => { shader.vertexShader = shader.vertexShader.replace('#include <getDistortion_vertex>', options.distortion.getDistortion); };
      const mesh = new THREE.Mesh(instanced, material);
      mesh.frustumCulled = false;
      this.webgl.scene.add(mesh);
      this.mesh = mesh;
    }
    update(time) { this.mesh.material.uniforms.uTime.value = time; }
  }
  const roadBaseFragment = `
    #define USE_FOG;
    varying vec2 vUv; 
    uniform vec3 uColor;
    uniform float uTime;
    #include <roadMarkings_vars>
    ${THREE.ShaderChunk['fog_pars_fragment']}
    void main() {
      vec2 uv = vUv;
      vec3 color = vec3(uColor);
      #include <roadMarkings_fragment>
      gl_FragColor = vec4(color, 1.);
      ${THREE.ShaderChunk['fog_fragment']}
    }
  `;
  const islandFragment = roadBaseFragment.replace('#include <roadMarkings_fragment>', '').replace('#include <roadMarkings_vars>', '');
  const roadMarkings_vars = `
    uniform float uLanes;
    uniform vec3 uBrokenLinesColor;
    uniform vec3 uShoulderLinesColor;
    uniform float uShoulderLinesWidthPercentage;
    uniform float uBrokenLinesWidthPercentage;
    uniform float uBrokenLinesLengthPercentage;
  `;
  const roadMarkings_fragment = `
    uv.y = mod(uv.y + uTime * 0.05, 1.);
    float laneWidth = 1.0 / uLanes;
    float brokenLineWidth = laneWidth * uBrokenLinesWidthPercentage;
    float laneEmptySpace = 1. - uBrokenLinesLengthPercentage;
    float brokenLines = step(1.0 - brokenLineWidth, fract(uv.x * uLanes)) * step(laneEmptySpace, fract(uv.y * 10.0));
    float leftBorder = 1.0 - step(brokenLineWidth, uv.x);
    float rightBorder = step(1.0 - brokenLineWidth, uv.x);
    float borders = max(leftBorder, rightBorder);
    brokenLines = brokenLines * (1.0 - borders);
    color = mix(color, uBrokenLinesColor, brokenLines);
    color = mix(color, uShoulderLinesColor, borders);
  `;
  const roadFragment = roadBaseFragment.replace('#include <roadMarkings_fragment>', roadMarkings_fragment).replace('#include <roadMarkings_vars>', roadMarkings_vars);
  const roadVertex = `
    #define USE_FOG;
    uniform float uTime;
    ${THREE.ShaderChunk['fog_pars_vertex']}
    uniform float uTravelLength;
    varying vec2 vUv; 
    #include <getDistortion_vertex>
    void main() {
      vec3 transformed = position.xyz;
      vec3 distortion = getDistortion((transformed.y + uTravelLength / 2.) / uTravelLength);
      transformed.x += distortion.x;
      transformed.z += distortion.y;
      transformed.y += -1. * distortion.z;  
      vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
      gl_Position = projectionMatrix * mvPosition;
      vUv = uv;
      ${THREE.ShaderChunk['fog_vertex']}
    }
  `;
  class Road {
    constructor(webgl, options) { this.webgl = webgl; this.options = options; this.uTime = { value: 0 }; }
    createPlane(side, width, isRoad) {
      const options = this.options;
      const geometry = new THREE.PlaneGeometry(isRoad ? options.roadWidth : options.islandWidth, options.length, 20, 100);
      let uniforms = { uTravelLength: { value: options.length }, uColor: { value: new THREE.Color(isRoad ? options.colors.roadColor : options.colors.islandColor) }, uTime: this.uTime };
      if (isRoad) {
        uniforms = Object.assign(uniforms, {
          uLanes: { value: options.lanesPerRoad },
          uBrokenLinesColor: { value: new THREE.Color(options.colors.brokenLines) },
          uShoulderLinesColor: { value: new THREE.Color(options.colors.shoulderLines) },
          uShoulderLinesWidthPercentage: { value: options.shoulderLinesWidthPercentage },
          uBrokenLinesLengthPercentage: { value: options.brokenLinesLengthPercentage },
          uBrokenLinesWidthPercentage: { value: options.brokenLinesWidthPercentage }
        });
      }
      const material = new THREE.ShaderMaterial({
        fragmentShader: isRoad ? roadFragment : islandFragment,
        vertexShader: roadVertex,
        side: THREE.DoubleSide,
        uniforms: Object.assign(uniforms, this.webgl.fogUniforms, options.distortion.uniforms)
      });
      material.onBeforeCompile = shader => { shader.vertexShader = shader.vertexShader.replace('#include <getDistortion_vertex>', options.distortion.getDistortion); };
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.z = -options.length / 2;
      mesh.position.x += (this.options.islandWidth / 2 + options.roadWidth / 2) * side;
      this.webgl.scene.add(mesh);
      return mesh;
    }
    init() {
      this.leftRoadWay = this.createPlane(-1, this.options.roadWidth, true);
      this.rightRoadWay = this.createPlane(1, this.options.roadWidth, true);
      this.island = this.createPlane(0, this.options.islandWidth, false);
    }
    update(time) { this.uTime.value = time; }
  }
  class HyperspeedApp {
    constructor(container, options = {}) {
      this.options = { ...DEFAULT_EFFECT_OPTIONS, ...options, colors: { ...DEFAULT_EFFECT_OPTIONS.colors, ...options.colors } };
      this.options.distortion = distortions[this.options.distortion];
      this.container = container;
      const initW = window.innerWidth;
      const initH = window.innerHeight;
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(initW, initH);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.domElement.style.position = 'fixed';
      this.renderer.domElement.style.top = '0';
      this.renderer.domElement.style.left = '0';
      this.renderer.domElement.style.width = '100vw';
      this.renderer.domElement.style.height = '100vh';
      this.renderer.domElement.style.zIndex = '-1';
      container.appendChild(this.renderer.domElement);
      this.camera = new THREE.PerspectiveCamera(this.options.fov, initW / initH, 0.1, 10000);
      this.camera.position.z = -5;
      this.camera.position.y = 8;
      this.camera.position.x = 0;
      this.scene = new THREE.Scene();
      let fog = new THREE.Fog(this.options.colors.background, this.options.length * 0.2, this.options.length * 500);
      this.scene.fog = fog;
      this.fogUniforms = { fogColor: { value: fog.color }, fogNear: { value: fog.near }, fogFar: { value: fog.far } };
      this.clock = new THREE.Clock();
      this.road = new Road(this, this.options);
      this.leftCarLights = new CarLights(this, this.options, this.options.colors.leftCars, this.options.movingAwaySpeed, new THREE.Vector2(0, 1 - this.options.carLightsFade));
      this.rightCarLights = new CarLights(this, this.options, this.options.colors.rightCars, this.options.movingCloserSpeed, new THREE.Vector2(1, 0 + this.options.carLightsFade));
      this.leftSticks = new LightsSticks(this, this.options);
      this.fovTarget = this.options.fov;
      this.speedUpTarget = 0;
      this.speedUp = 0;
      this.timeOffset = 0;
      if (typeof THREE.EffectComposer !== 'undefined' && typeof THREE.UnrealBloomPass !== 'undefined') {
        this.composer = new THREE.EffectComposer(this.renderer);
        this.renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);
        this.bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(initW, initH), 1.5, 0.4, 0.85);
        this.bloomPass.threshold = 0.25;
        this.bloomPass.strength = 0.6;
        this.bloomPass.radius = 0.3;
        this.composer.addPass(this.bloomPass);
      }
      this.tick = this.tick.bind(this);
      window.addEventListener('scroll', () => {
        if(this.options.onSpeedUp) this.options.onSpeedUp();
        this.fovTarget = this.options.fovSpeedUp;
        this.speedUpTarget = this.options.speedUp;
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
          if(this.options.onSlowDown) this.options.onSlowDown();
          this.fovTarget = this.options.fov;
          this.speedUpTarget = 0;
        }, 150);
      }, { passive: true });
      window.addEventListener('resize', () => {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        if (this.composer) this.composer.setSize(window.innerWidth, window.innerHeight);
      });
    }
    init() {
      this.road.init();
      this.leftCarLights.init();
      this.leftCarLights.mesh.position.setX(-this.options.roadWidth / 2 - this.options.islandWidth / 2);
      this.rightCarLights.init();
      this.rightCarLights.mesh.position.setX(this.options.roadWidth / 2 + this.options.islandWidth / 2);
      this.leftSticks.init();
      this.leftSticks.mesh.position.setX(-(this.options.roadWidth + this.options.islandWidth / 2));
      this.tick();
    }
    update(delta) {
      let lerpPercentage = Math.exp(-(-60 * Math.log2(1 - 0.1)) * delta);
      this.speedUp += lerp(this.speedUp, this.speedUpTarget, lerpPercentage, 0.00001);
      this.timeOffset += this.speedUp * delta;
      let time = this.clock.elapsedTime + this.timeOffset;
      this.rightCarLights.update(time);
      this.leftCarLights.update(time);
      this.leftSticks.update(time);
      this.road.update(time);
      let updateCamera = false;
      let fovChange = lerp(this.camera.fov, this.fovTarget, lerpPercentage);
      if (fovChange !== 0) {
        this.camera.fov += fovChange * delta * 6;
        updateCamera = true;
      }
      if (this.options.distortion.getJS) {
        const distortion = this.options.distortion.getJS(0.025, time);
        this.camera.lookAt(new THREE.Vector3(
          this.camera.position.x + distortion.x,
          this.camera.position.y + distortion.y,
          this.camera.position.z + distortion.z
        ));
        updateCamera = true;
      }
      if (updateCamera) this.camera.updateProjectionMatrix();
    }
    tick() {
      const delta = this.clock.getDelta();
      this.update(delta);
      if (this.composer) {
        this.composer.render(delta);
      } else {
        this.renderer.render(this.scene, this.camera);
      }
      requestAnimationFrame(this.tick);
    }
  }
  window.HyperspeedApp = {
    init: function() {
      const container = document.getElementById('hyperspeed-container');
      if (!container) return;
      container.innerHTML = '';
      const isJourney = window.location.pathname.includes('journey');
      const opts = {
        distortion: 'turbulentDistortion',
        speedUp: 3,
        fovSpeedUp: 140,
        colors: {
          roadColor: 0x000000,
          islandColor: 0x000000,
          background: 0x000000,
          shoulderLines: 0xa200ff, 
          brokenLines: 0x000000, 
          leftCars: isJourney ? [0xff006e, 0x8338ec, 0xffbe0b] : [0x00ff41, 0x00ff41, 0x008f11],
          rightCars: isJourney ? [0x3a86ff, 0x00b4d8, 0x90e0ef] : [0x00ff41, 0x00ff41, 0x008f11],
          sticks: isJourney ? 0xff006e : 0x00ff41
        }
      };
      const app = new HyperspeedApp(container, opts);
      app.init();
    }
  };
})();
