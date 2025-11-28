/**
 * BiomeSystem - Manages biome-specific visual themes and environmental effects
 * Supports Desert, Snow, Urban, Facility, Forest, Hell, and Default biomes
 * Each biome has unique visual elements, hazards, and weather effects
 */
class BiomeSystem {
  constructor() {
    this.currentBiome = 'DEFAULT';
    this.transitionProgress = 1.0;
    this.targetBiome = 'DEFAULT';
    this.biomeElements = [];
    this.config = typeof GameConfig !== 'undefined' && GameConfig.BIOMES ? 
      GameConfig.BIOMES : this.getDefaultConfig();
    this.transitionDuration = 2000;
  }

  /**
   * Get default biome configuration
   * @returns {Object} Default biome config
   */
  getDefaultConfig() {
    return {
      DEFAULT: {
        name: 'Default',
        skyTop: '#4a5f7f',
        skyMid: '#6a7f9f',
        skyBottom: '#8a9fbf',
        groundBase: '#4a4a3a',
        groundDark: '#3a3a2a',
        groundLight: '#5a5a4a',
        grassColor: '#4a5a3a',
        weather: 'CLEAR',
        hazards: []
      }
    };
  }

  /**
   * Initialize the biome system
   * @param {string} initialBiome - Starting biome type
   */
  init(initialBiome = 'DEFAULT') {
    this.currentBiome = initialBiome;
    this.targetBiome = initialBiome;
    this.transitionProgress = 1.0;
    this.biomeElements = [];
    this.generateBiomeElements(initialBiome);
  }

  /**
   * Set the current biome
   * @param {string} biome - Biome type to set
   * @param {boolean} immediate - If true, skip transition
   */
  setBiome(biome, immediate = false) {
    if (!this.config[biome]) {
      console.warn(`Biome ${biome} not found, using DEFAULT`);
      biome = 'DEFAULT';
    }
    
    if (immediate) {
      this.currentBiome = biome;
      this.targetBiome = biome;
      this.transitionProgress = 1.0;
      this.generateBiomeElements(biome);
    } else if (biome !== this.currentBiome) {
      this.targetBiome = biome;
      this.transitionProgress = 0;
    }
  }

  /**
   * Get current biome configuration
   * @returns {Object} Current biome config
   */
  getCurrentBiomeConfig() {
    return this.config[this.currentBiome] || this.config.DEFAULT;
  }

  /**
   * Get recommended weather for current biome
   * @returns {string} Weather type
   */
  getRecommendedWeather() {
    const config = this.getCurrentBiomeConfig();
    return config.weather || 'CLEAR';
  }

  /**
   * Get speed penalty for current biome
   * @returns {number} Speed penalty multiplier
   */
  getSpeedPenalty() {
    const config = this.getCurrentBiomeConfig();
    return config.speedPenalty || 0;
  }

  /**
   * Get ambient damage for current biome
   * @returns {number} Ambient damage per second
   */
  getAmbientDamage() {
    const config = this.getCurrentBiomeConfig();
    return config.ambientDamage || 0;
  }

  /**
   * Check if current biome is indoor
   * @returns {boolean} True if indoor biome
   */
  isIndoor() {
    const config = this.getCurrentBiomeConfig();
    return config.isIndoor || false;
  }

  /**
   * Generate decorative elements for the biome
   * @param {string} biome - Biome type
   */
  generateBiomeElements(biome) {
    this.biomeElements = [];
    const config = this.config[biome];
    
    if (!config || !config.elements) return;
    
    // Generate elements based on biome type
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 3000;
      const elementType = config.elements[Math.floor(Math.random() * config.elements.length)];
      
      this.biomeElements.push({
        x: x,
        y: 0, // Will be calculated during render
        type: elementType,
        scale: 0.8 + Math.random() * 0.4,
        variant: Math.floor(Math.random() * 3)
      });
    }
    
    // Sort by x position for consistent rendering
    this.biomeElements.sort((a, b) => a.x - b.x);
  }

  /**
   * Update the biome system
   * @param {number} deltaTime - Time since last update
   * @param {Object} player - Player entity for applying effects
   */
  update(deltaTime, player) {
    // Update transition progress
    if (this.transitionProgress < 1.0) {
      const transitionSpeed = deltaTime / this.transitionDuration;
      this.transitionProgress = Math.min(1.0, this.transitionProgress + transitionSpeed);
      
      if (this.transitionProgress >= 1.0) {
        this.currentBiome = this.targetBiome;
        this.generateBiomeElements(this.currentBiome);
      }
    }

    // Apply ambient damage
    if (player && player.active) {
      const damage = this.getAmbientDamage();
      if (damage > 0) {
        // Apply damage every second
        if (!this.lastDamageTime) this.lastDamageTime = 0;
        this.lastDamageTime += deltaTime;
        
        if (this.lastDamageTime >= 1000) {
          player.takeDamage(damage);
          this.lastDamageTime = 0;
        }
      }
    }

    // Apply speed penalty
    if (player && player.active) {
      const penalty = this.getSpeedPenalty();
      if (penalty > 0 && !player.biomeSpeedApplied) {
        player.speed *= (1 - penalty);
        player.biomeSpeedApplied = true;
        player.originalSpeed = player.speed / (1 - penalty);
      }
    }
  }

  /**
   * Interpolate between two colors
   * @param {string} color1 - First color (hex)
   * @param {string} color2 - Second color (hex)
   * @param {number} progress - Interpolation progress (0-1)
   * @returns {string} Interpolated color (hex)
   */
  lerpColor(color1, color2, progress) {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);
    
    const r = Math.round(c1.r + (c2.r - c1.r) * progress);
    const g = Math.round(c1.g + (c2.g - c1.g) * progress);
    const b = Math.round(c1.b + (c2.b - c1.b) * progress);
    
    return this.rgbToHex(r, g, b);
  }

  /**
   * Convert hex color to RGB
   * @param {string} hex - Hex color
   * @returns {Object} RGB values
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  /**
   * Convert RGB to hex color
   * @param {number} r - Red value
   * @param {number} g - Green value
   * @param {number} b - Blue value
   * @returns {string} Hex color
   */
  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = Math.max(0, Math.min(255, x)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  /**
   * Get interpolated sky colors for rendering
   * @returns {Object} Sky color values
   */
  getSkyColors() {
    const currentConfig = this.config[this.currentBiome] || this.config.DEFAULT;
    const targetConfig = this.config[this.targetBiome] || this.config.DEFAULT;
    
    if (this.transitionProgress >= 1.0) {
      return {
        top: currentConfig.skyTop,
        mid: currentConfig.skyMid,
        bottom: currentConfig.skyBottom
      };
    }
    
    return {
      top: this.lerpColor(currentConfig.skyTop, targetConfig.skyTop, this.transitionProgress),
      mid: this.lerpColor(currentConfig.skyMid, targetConfig.skyMid, this.transitionProgress),
      bottom: this.lerpColor(currentConfig.skyBottom, targetConfig.skyBottom, this.transitionProgress)
    };
  }

  /**
   * Get interpolated ground colors for rendering
   * @returns {Object} Ground color values
   */
  getGroundColors() {
    const currentConfig = this.config[this.currentBiome] || this.config.DEFAULT;
    const targetConfig = this.config[this.targetBiome] || this.config.DEFAULT;
    
    if (this.transitionProgress >= 1.0) {
      return {
        base: currentConfig.groundBase,
        dark: currentConfig.groundDark,
        light: currentConfig.groundLight,
        grass: currentConfig.grassColor
      };
    }
    
    return {
      base: this.lerpColor(currentConfig.groundBase, targetConfig.groundBase, this.transitionProgress),
      dark: this.lerpColor(currentConfig.groundDark, targetConfig.groundDark, this.transitionProgress),
      light: this.lerpColor(currentConfig.groundLight, targetConfig.groundLight, this.transitionProgress),
      grass: this.lerpColor(currentConfig.grassColor, targetConfig.grassColor, this.transitionProgress)
    };
  }

  /**
   * Get biome tint for overlay effect
   * @returns {Object|null} Tint color with RGB values or null
   */
  getBiomeTint() {
    const config = this.getCurrentBiomeConfig();
    return config.tint || null;
  }

  /**
   * Render biome-specific background elements
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} camera - Camera for viewport offset
   * @param {number} groundLevel - Ground Y position
   */
  render(ctx, camera, groundLevel) {
    const cameraX = camera ? camera.x : 0;
    const biomeConfig = this.getCurrentBiomeConfig();
    
    // Render biome-specific decorative elements
    this.biomeElements.forEach(element => {
      const screenX = element.x - cameraX * 0.7; // Parallax effect
      
      // Skip if off-screen
      if (screenX < -100 || screenX > ctx.canvas.width + 100) return;
      
      this.renderBiomeElement(ctx, element, screenX, groundLevel, biomeConfig);
    });

    // Render biome tint overlay if present
    const tint = this.getBiomeTint();
    if (tint) {
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = `rgb(${tint.r}, ${tint.g}, ${tint.b})`;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    }
  }

  /**
   * Render a single biome element
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} element - Element data
   * @param {number} screenX - Screen X position
   * @param {number} groundLevel - Ground Y position
   * @param {Object} biomeConfig - Current biome configuration
   */
  renderBiomeElement(ctx, element, screenX, groundLevel, biomeConfig) {
    ctx.save();
    
    const scale = element.scale;
    const variant = element.variant;
    
    switch (element.type) {
      case 'sand':
        this.renderSandDune(ctx, screenX, groundLevel, scale);
        break;
      case 'cacti':
        this.renderCactus(ctx, screenX, groundLevel, scale, variant);
        break;
      case 'dunes':
        this.renderSandDune(ctx, screenX, groundLevel, scale * 1.5);
        break;
      case 'ice':
        this.renderIceCrystal(ctx, screenX, groundLevel, scale, variant);
        break;
      case 'frozen_trees':
        this.renderFrozenTree(ctx, screenX, groundLevel, scale);
        break;
      case 'snowdrifts':
        this.renderSnowdrift(ctx, screenX, groundLevel, scale);
        break;
      case 'buildings':
        this.renderBuilding(ctx, screenX, groundLevel, scale, variant);
        break;
      case 'vehicles':
        this.renderVehicleDebris(ctx, screenX, groundLevel, scale);
        break;
      case 'debris':
        this.renderDebris(ctx, screenX, groundLevel, scale);
        break;
      case 'labs':
        this.renderLabEquipment(ctx, screenX, groundLevel, scale, variant);
        break;
      case 'tech':
        this.renderTechPanel(ctx, screenX, groundLevel, scale);
        break;
      case 'machinery':
        this.renderMachinery(ctx, screenX, groundLevel, scale);
        break;
      case 'trees':
        this.renderTree(ctx, screenX, groundLevel, scale, variant);
        break;
      case 'dense_cover':
        this.renderBush(ctx, screenX, groundLevel, scale);
        break;
      case 'undergrowth':
        this.renderUndergrowth(ctx, screenX, groundLevel, scale);
        break;
      case 'lava':
        this.renderLavaPool(ctx, screenX, groundLevel, scale);
        break;
      case 'fire':
        this.renderFirePillar(ctx, screenX, groundLevel, scale);
        break;
      case 'brimstone':
        this.renderBrimstone(ctx, screenX, groundLevel, scale);
        break;
      case 'skulls':
        this.renderSkull(ctx, screenX, groundLevel, scale);
        break;
    }
    
    ctx.restore();
  }

  // Biome element rendering methods

  renderSandDune(ctx, x, groundLevel, scale) {
    const height = 30 * scale;
    const width = 80 * scale;
    ctx.fillStyle = '#d4b070';
    ctx.beginPath();
    ctx.moveTo(x, groundLevel);
    ctx.quadraticCurveTo(x + width / 2, groundLevel - height, x + width, groundLevel);
    ctx.fill();
  }

  renderCactus(ctx, x, groundLevel, scale, variant) {
    const height = 40 + variant * 15;
    ctx.fillStyle = '#2a5a2a';
    // Main trunk
    ctx.fillRect(x, groundLevel - height * scale, 8 * scale, height * scale);
    // Arms
    if (variant > 0) {
      ctx.fillRect(x - 12 * scale, groundLevel - height * scale * 0.7, 12 * scale, 6 * scale);
      ctx.fillRect(x - 12 * scale, groundLevel - height * scale * 0.7, 6 * scale, 15 * scale);
    }
    if (variant > 1) {
      ctx.fillRect(x + 8 * scale, groundLevel - height * scale * 0.5, 12 * scale, 6 * scale);
      ctx.fillRect(x + 14 * scale, groundLevel - height * scale * 0.5, 6 * scale, 12 * scale);
    }
  }

  renderIceCrystal(ctx, x, groundLevel, scale, variant) {
    const height = 25 + variant * 10;
    ctx.fillStyle = '#aaddff';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(x, groundLevel);
    ctx.lineTo(x + 8 * scale, groundLevel - height * scale);
    ctx.lineTo(x + 16 * scale, groundLevel);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.5;
    ctx.fillRect(x + 6 * scale, groundLevel - height * scale * 0.8, 4 * scale, height * scale * 0.3);
  }

  renderFrozenTree(ctx, x, groundLevel, scale) {
    // Trunk
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(x, groundLevel - 60 * scale, 10 * scale, 60 * scale);
    // Frozen branches
    ctx.fillStyle = '#8ac4e8';
    ctx.beginPath();
    ctx.moveTo(x + 5 * scale, groundLevel - 60 * scale);
    ctx.lineTo(x - 20 * scale, groundLevel - 45 * scale);
    ctx.lineTo(x - 25 * scale, groundLevel - 40 * scale);
    ctx.lineTo(x + 5 * scale, groundLevel - 50 * scale);
    ctx.lineTo(x + 30 * scale, groundLevel - 40 * scale);
    ctx.lineTo(x + 25 * scale, groundLevel - 45 * scale);
    ctx.closePath();
    ctx.fill();
  }

  renderSnowdrift(ctx, x, groundLevel, scale) {
    ctx.fillStyle = '#f0f4ff';
    ctx.beginPath();
    ctx.moveTo(x, groundLevel);
    ctx.quadraticCurveTo(x + 30 * scale, groundLevel - 15 * scale, x + 60 * scale, groundLevel);
    ctx.fill();
  }

  renderBuilding(ctx, x, groundLevel, scale, variant) {
    const height = 80 + variant * 30;
    const width = 50 * scale;
    // Building body
    ctx.fillStyle = '#505560';
    ctx.fillRect(x, groundLevel - height * scale, width, height * scale);
    // Windows
    ctx.fillStyle = '#303540';
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 3; col++) {
        ctx.fillRect(
          x + 8 + col * 14 * scale,
          groundLevel - height * scale + 10 + row * 20 * scale,
          8 * scale,
          12 * scale
        );
      }
    }
  }

  renderVehicleDebris(ctx, x, groundLevel, scale) {
    ctx.fillStyle = '#404550';
    ctx.fillRect(x, groundLevel - 15 * scale, 40 * scale, 15 * scale);
    ctx.fillStyle = '#303540';
    ctx.fillRect(x + 5 * scale, groundLevel - 20 * scale, 30 * scale, 10 * scale);
    // Wheels
    ctx.fillStyle = '#202020';
    ctx.beginPath();
    ctx.arc(x + 10 * scale, groundLevel, 8 * scale, 0, Math.PI * 2);
    ctx.arc(x + 30 * scale, groundLevel, 8 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  renderDebris(ctx, x, groundLevel, scale) {
    ctx.fillStyle = '#606570';
    ctx.fillRect(x, groundLevel - 8 * scale, 20 * scale, 8 * scale);
    ctx.fillRect(x + 5 * scale, groundLevel - 12 * scale, 10 * scale, 4 * scale);
  }

  renderLabEquipment(ctx, x, groundLevel, scale, variant) {
    // Console base
    ctx.fillStyle = '#404860';
    ctx.fillRect(x, groundLevel - 40 * scale, 30 * scale, 40 * scale);
    // Screen
    ctx.fillStyle = variant % 2 === 0 ? '#00ff88' : '#0088ff';
    ctx.globalAlpha = 0.7;
    ctx.fillRect(x + 4 * scale, groundLevel - 36 * scale, 22 * scale, 16 * scale);
    ctx.globalAlpha = 1;
  }

  renderTechPanel(ctx, x, groundLevel, scale) {
    ctx.fillStyle = '#505870';
    ctx.fillRect(x, groundLevel - 50 * scale, 20 * scale, 50 * scale);
    // Lights
    ctx.fillStyle = '#ff4400';
    ctx.fillRect(x + 5 * scale, groundLevel - 45 * scale, 4 * scale, 4 * scale);
    ctx.fillStyle = '#00ff44';
    ctx.fillRect(x + 11 * scale, groundLevel - 45 * scale, 4 * scale, 4 * scale);
  }

  renderMachinery(ctx, x, groundLevel, scale) {
    ctx.fillStyle = '#606880';
    ctx.fillRect(x, groundLevel - 35 * scale, 45 * scale, 35 * scale);
    // Pipes
    ctx.fillStyle = '#707890';
    ctx.fillRect(x + 10 * scale, groundLevel - 45 * scale, 8 * scale, 15 * scale);
    ctx.fillRect(x + 30 * scale, groundLevel - 40 * scale, 6 * scale, 10 * scale);
  }

  renderTree(ctx, x, groundLevel, scale, variant) {
    // Trunk
    ctx.fillStyle = '#4a3520';
    ctx.fillRect(x, groundLevel - 70 * scale, 12 * scale, 70 * scale);
    // Foliage
    ctx.fillStyle = '#2a5a2a';
    ctx.beginPath();
    ctx.arc(x + 6 * scale, groundLevel - 80 * scale, 25 * scale, 0, Math.PI * 2);
    ctx.fill();
    if (variant > 0) {
      ctx.beginPath();
      ctx.arc(x - 10 * scale, groundLevel - 65 * scale, 18 * scale, 0, Math.PI * 2);
      ctx.arc(x + 20 * scale, groundLevel - 70 * scale, 20 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderBush(ctx, x, groundLevel, scale) {
    ctx.fillStyle = '#3a6a3a';
    ctx.beginPath();
    ctx.arc(x, groundLevel - 10 * scale, 15 * scale, 0, Math.PI * 2);
    ctx.arc(x + 15 * scale, groundLevel - 8 * scale, 12 * scale, 0, Math.PI * 2);
    ctx.arc(x + 8 * scale, groundLevel - 15 * scale, 10 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  renderUndergrowth(ctx, x, groundLevel, scale) {
    ctx.fillStyle = '#4a7a4a';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(x + i * 4 * scale, groundLevel - (8 + Math.random() * 8) * scale, 2 * scale, (8 + Math.random() * 8) * scale);
    }
  }

  renderLavaPool(ctx, x, groundLevel, scale) {
    const time = Date.now() / 1000;
    const glow = Math.sin(time * 2) * 0.2 + 0.8;
    
    ctx.fillStyle = `rgba(255, ${100 * glow}, 0, ${0.8 * glow})`;
    ctx.beginPath();
    ctx.ellipse(x + 20 * scale, groundLevel, 25 * scale, 8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Glow effect
    ctx.fillStyle = `rgba(255, ${150 * glow}, 50, 0.3)`;
    ctx.beginPath();
    ctx.ellipse(x + 20 * scale, groundLevel - 5, 35 * scale, 15 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  renderFirePillar(ctx, x, groundLevel, scale) {
    const time = Date.now() / 100;
    const flicker = Math.sin(time) * 5;
    
    // Fire
    ctx.fillStyle = '#ff4400';
    ctx.beginPath();
    ctx.moveTo(x, groundLevel);
    ctx.lineTo(x + 8 * scale, groundLevel - (40 + flicker) * scale);
    ctx.lineTo(x + 16 * scale, groundLevel);
    ctx.fill();
    
    // Inner flame
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.moveTo(x + 4 * scale, groundLevel);
    ctx.lineTo(x + 8 * scale, groundLevel - (25 + flicker * 0.5) * scale);
    ctx.lineTo(x + 12 * scale, groundLevel);
    ctx.fill();
  }

  renderBrimstone(ctx, x, groundLevel, scale) {
    ctx.fillStyle = '#4a2020';
    ctx.beginPath();
    ctx.moveTo(x, groundLevel);
    ctx.lineTo(x + 10 * scale, groundLevel - 25 * scale);
    ctx.lineTo(x + 20 * scale, groundLevel);
    ctx.fill();
    ctx.fillStyle = '#6a3030';
    ctx.fillRect(x + 5 * scale, groundLevel - 20 * scale, 4 * scale, 4 * scale);
  }

  renderSkull(ctx, x, groundLevel, scale) {
    ctx.fillStyle = '#d0c0b0';
    // Skull
    ctx.beginPath();
    ctx.arc(x + 8 * scale, groundLevel - 10 * scale, 8 * scale, 0, Math.PI * 2);
    ctx.fill();
    // Eye sockets
    ctx.fillStyle = '#2a1010';
    ctx.beginPath();
    ctx.arc(x + 5 * scale, groundLevel - 12 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.arc(x + 11 * scale, groundLevel - 12 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Clear all biome elements
   */
  clear() {
    this.biomeElements = [];
    this.currentBiome = 'DEFAULT';
    this.targetBiome = 'DEFAULT';
    this.transitionProgress = 1.0;
  }
}
