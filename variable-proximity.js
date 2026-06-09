class VariableProximity {
  constructor(element, options = {}) {
    this.element = element;
    
    this.fromSettings = this.parseSettings(options.fromFontVariationSettings || "'wght' 400, 'opsz' 9");
    this.toSettings = this.parseSettings(options.toFontVariationSettings || "'wght' 1000, 'opsz' 40");
    this.radius = options.radius || 100;
    this.falloff = options.falloff || 'linear';
    
    this.mousePosition = { x: null, y: null };
    this.lastPosition = { x: null, y: null };
    this.letterElements = [];
    this.animationFrameId = null;
    
    this.init();
  }

  parseSettings(settingsStr) {
    const settings = new Map();
    settingsStr.split(',').forEach(s => {
      const parts = s.trim().split(' ');
      if (parts.length >= 2) {
        const name = parts[0].replace(/['"]/g, '');
        const value = parseFloat(parts[1]);
        settings.set(name, value);
      }
    });
    return settings;
  }

  getInterpolatedSettings(distance) {
    let falloffValue = 0;
    const norm = Math.min(Math.max(1 - distance / this.radius, 0), 1);
    
    switch (this.falloff) {
      case 'exponential':
        falloffValue = norm ** 2;
        break;
      case 'gaussian':
        falloffValue = Math.exp(-((distance / (this.radius / 2)) ** 2) / 2);
        break;
      case 'linear':
      default:
        falloffValue = norm;
    }

    const newSettings = [];
    this.fromSettings.forEach((fromValue, axis) => {
      const toValue = this.toSettings.has(axis) ? this.toSettings.get(axis) : fromValue;
      const interpolatedValue = fromValue + (toValue - fromValue) * falloffValue;
      newSettings.push(`'${axis}' ${interpolatedValue}`);
    });

    return newSettings.join(', ');
  }

  init() {
    const text = this.element.textContent.trim().replace(/\s+/g, ' ');
    this.element.textContent = '';
    
    // Set parent to the boldest setting temporarily so we can measure the max width
    const toSettingsStr = Array.from(this.toSettings.entries())
      .map(([axis, val]) => `'${axis}' ${val}`).join(', ');
    const fromSettingsStr = Array.from(this.fromSettings.entries())
      .map(([axis, val]) => `'${axis}' ${val}`).join(', ');
      
    this.element.style.fontVariationSettings = toSettingsStr;

    const words = text.split(' ');
    
    words.forEach((word, wordIndex) => {
      const wordSpan = document.createElement('span');
      wordSpan.style.display = 'inline-block';
      wordSpan.style.whiteSpace = 'nowrap';
      
      const letters = word.split('');
      letters.forEach(letter => {
        const letterSpan = document.createElement('span');
        letterSpan.textContent = letter;
        letterSpan.style.display = 'inline-block';
        letterSpan.style.fontVariationSettings = toSettingsStr;
        letterSpan.style.transition = 'font-variation-settings 0.1s ease-out';
        wordSpan.appendChild(letterSpan);
        this.letterElements.push(letterSpan);
      });

      this.element.appendChild(wordSpan);

      if (wordIndex < words.length - 1) {
        this.element.appendChild(document.createTextNode(' '));
      }
    });

    // Force layout and measure the max width of each letter
    this.letterElements.forEach(span => {
      const rect = span.getBoundingClientRect();
      span.style.width = rect.width + 'px';
      span.style.textAlign = 'center';
    });

    // Reset back to FROM settings
    this.element.style.fontVariationSettings = fromSettingsStr;
    this.letterElements.forEach(span => {
      span.style.fontVariationSettings = fromSettingsStr;
    });

    this.handleMouseMove = (e) => {
      this.mousePosition = { x: e.clientX, y: e.clientY };
    };
    
    this.handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        this.mousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('touchmove', this.handleTouchMove);

    this.run = this.run.bind(this);
    this.animationFrameId = requestAnimationFrame(this.run);
  }

  run() {
    if (this.mousePosition.x !== null && this.mousePosition.y !== null) {
      if (this.mousePosition.x !== this.lastPosition.x || this.mousePosition.y !== this.lastPosition.y) {
        this.lastPosition = { ...this.mousePosition };
        
        this.letterElements.forEach(letterSpan => {
          const rect = letterSpan.getBoundingClientRect();
          const letterCenterX = rect.left + rect.width / 2;
          const letterCenterY = rect.top + rect.height / 2;

          const distance = Math.sqrt(
            Math.pow(this.mousePosition.x - letterCenterX, 2) + 
            Math.pow(this.mousePosition.y - letterCenterY, 2)
          );

          if (distance >= this.radius) {
            letterSpan.style.fontVariationSettings = Array.from(this.fromSettings.entries())
              .map(([axis, val]) => `'${axis}' ${val}`).join(', ');
          } else {
            letterSpan.style.fontVariationSettings = this.getInterpolatedSettings(distance);
          }
        });
      }
    }
    
    this.animationFrameId = requestAnimationFrame(this.run);
  }

  destroy() {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('touchmove', this.handleTouchMove);
  }
}

window.VariableProximity = VariableProximity;
