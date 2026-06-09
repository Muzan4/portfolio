class FuzzyText {
  constructor(container, options = {}) {
    this.container = container;
    
    // Default options mapped from React props
    this.fontSize = options.fontSize || 'clamp(2rem, 4vw, 3.5rem)';
    this.fontWeight = options.fontWeight || 700;
    this.fontFamily = options.fontFamily || 'Outfit, sans-serif';
    this.color = options.color || '#fff';
    this.enableHover = options.enableHover !== undefined ? options.enableHover : true;
    this.baseIntensity = options.baseIntensity !== undefined ? options.baseIntensity : 0.05;
    this.hoverIntensity = options.hoverIntensity !== undefined ? options.hoverIntensity : 0.3;
    this.fuzzRange = options.fuzzRange !== undefined ? options.fuzzRange : 15;
    this.fps = options.fps || 60;
    this.direction = options.direction || 'horizontal';
    
    // Custom options for our specific multi-line/multi-color title
    this.segments = options.segments || [{ text: 'HELLO WORLD', color: this.color, newline: false }];
    this.lineHeightMultiplier = options.lineHeight || 1.1;

    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'block';
    this.canvas.style.maxWidth = '100%';
    this.container.appendChild(this.canvas);
    
    this.ctx = this.canvas.getContext('2d');
    
    this.isCancelled = false;
    this.animationFrameId = null;
    
    this.isHovering = false;
    this.currentIntensity = this.baseIntensity;
    this.targetIntensity = this.baseIntensity;
    this.lastFrameTime = 0;
    
    this.init();
  }

  async init() {
    const fontString = `${this.fontWeight} ${this.fontSize} ${this.fontFamily}`;
    
    try {
      await document.fonts.load(fontString);
    } catch (e) {
      await document.fonts.ready;
    }
    if (this.isCancelled) return;

    // Resolve clamp/relative font size to pixel size for canvas
    const temp = document.createElement('span');
    temp.style.fontFamily = this.fontFamily;
    temp.style.fontWeight = this.fontWeight;
    temp.style.fontSize = this.fontSize;
    temp.style.visibility = 'hidden';
    temp.style.position = 'absolute';
    temp.innerText = 'A';
    document.body.appendChild(temp);
    const computedSize = window.getComputedStyle(temp).fontSize;
    this.numericFontSize = parseFloat(computedSize);
    document.body.removeChild(temp);

    this.offscreen = document.createElement('canvas');
    this.offCtx = this.offscreen.getContext('2d');

    const resolvedFont = `${this.fontWeight} ${this.numericFontSize}px ${this.fontFamily}`;
    this.offCtx.font = resolvedFont;
    this.offCtx.textBaseline = 'top';

    // Calculate layout
    let maxWidth = 0;
    let currentX = 0;
    let currentY = 0;
    let lineHeights = [];
    
    // First pass: measure text
    this.segments.forEach(seg => {
      this.offCtx.font = resolvedFont;
      if (seg.newline && currentX > 0) {
        maxWidth = Math.max(maxWidth, currentX);
        currentX = 0;
        currentY += this.numericFontSize * this.lineHeightMultiplier;
      }
      let metrics = this.offCtx.measureText(seg.text);
      seg.x = currentX;
      seg.y = currentY;
      seg.width = metrics.width;
      currentX += metrics.width;
    });
    maxWidth = Math.max(maxWidth, currentX);
    const totalHeight = currentY + (this.numericFontSize * this.lineHeightMultiplier);

    const extraBuffer = this.fuzzRange * 2;
    this.offscreenWidth = Math.ceil(maxWidth + extraBuffer);
    this.offscreenHeight = Math.ceil(totalHeight + extraBuffer);

    this.offscreen.width = this.offscreenWidth;
    this.offscreen.height = this.offscreenHeight;
    this.offCtx.font = resolvedFont;
    this.offCtx.textBaseline = 'top';

    // Draw text to offscreen canvas
    this.segments.forEach(seg => {
      this.offCtx.fillStyle = seg.color || this.color;
      this.offCtx.fillText(seg.text, seg.x + this.fuzzRange, seg.y + this.fuzzRange);
    });

    this.canvas.width = this.offscreenWidth;
    this.canvas.height = this.offscreenHeight;
    
    // Setup interactions
    this.setupInteractions();

    this.run = this.run.bind(this);
    this.animationFrameId = requestAnimationFrame(this.run);
  }

  setupInteractions() {
    if (!this.enableHover) return;

    this.handleMouseMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Simple bounding box hit test
      if (x >= 0 && x <= this.canvas.width && y >= 0 && y <= this.canvas.height) {
        this.isHovering = true;
      } else {
        this.isHovering = false;
      }
    };

    this.handleMouseLeave = () => {
      this.isHovering = false;
    };

    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave);
  }

  run(timestamp) {
    if (this.isCancelled) return;

    const frameDuration = 1000 / this.fps;
    if (timestamp - this.lastFrameTime < frameDuration) {
      this.animationFrameId = requestAnimationFrame(this.run);
      return;
    }
    this.lastFrameTime = timestamp;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.targetIntensity = this.isHovering ? this.hoverIntensity : this.baseIntensity;
    
    // Smooth transition
    this.currentIntensity += (this.targetIntensity - this.currentIntensity) * 0.1;

    // Draw with horizontal displacement
    for (let j = 0; j < this.offscreenHeight; j++) {
      const dx = Math.floor(this.currentIntensity * (Math.random() - 0.5) * this.fuzzRange);
      this.ctx.drawImage(
        this.offscreen, 
        0, j, this.offscreenWidth, 1, 
        dx, j, this.offscreenWidth, 1
      );
    }

    this.animationFrameId = requestAnimationFrame(this.run);
  }

  destroy() {
    this.isCancelled = true;
    cancelAnimationFrame(this.animationFrameId);
    if (this.enableHover) {
      this.canvas.removeEventListener('mousemove', this.handleMouseMove);
      this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
    }
    this.canvas.remove();
  }
}

window.FuzzyText = FuzzyText;
