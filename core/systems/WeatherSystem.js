/**
 * WeatherSystem - Manages dynamic weather effects
 * Supports Rain, Fog, Snow, Sandstorm, and Clear weather types
 * Each weather type affects visibility, movement, and gameplay
 */
class WeatherSystem {
  constructor() {
    this.currentWeather = 'CLEAR';
    this.targetWeather = 'CLEAR';
    this.transitionProgress = 1.0; // 1.0 = fully transitioned
    this.particles = [];
    this.puddles = [];
    this.footprints = [];
    this.fogClouds = [];
    this.lastDamageTime = 0;
    this.config = typeof GameConfig !== 'undefined' && GameConfig.WEATHER ? 
      GameConfig.WEATHER : this.getDefaultConfig();
  }

  /**
   * Get default weather configuration
   * @returns {Object} Default weather config
   */
  getDefaultConfig() {
    return {
      CLEAR: { visibilityMultiplier: 1.0, speedPenalty: 0, damage: 0 },
      RAIN: { visibilityMultiplier: 0.8, slideChance: 0.1, particleCount: 500, particleSpeed: 8 },
      FOG: { visibilityMultiplier: 0.5, stealthBonus: 0.7, cloudCount: 8, cloudDriftSpeed: 0.5 },
      SNOW: { visibilityMultiplier: 0.7, speedPenalty: 0.15, coldDamage: 1, particleCount: 300 },
      SANDSTORM: { visibilityMultiplier: 0.4, speedPenalty: 0.2, damage: 2, shakeIntensity: 2 },
      transitionDuration: 3000
    };
  }

  /**
   * Initialize the weather system
   * @param {string} initialWeather - Starting weather type
   */
  init(initialWeather = 'CLEAR') {
    this.currentWeather = initialWeather;
    this.targetWeather = initialWeather;
    this.transitionProgress = 1.0;
    this.particles = [];
    this.puddles = [];
    this.footprints = [];
    this.fogClouds = [];
    
    // Initialize fog clouds if starting with fog
    if (initialWeather === 'FOG') {
      this.initFogClouds();
    }
  }

  /**
   * Initialize fog cloud positions
   */
  initFogClouds() {
    const fogConfig = this.config.FOG;
    const cloudCount = fogConfig.cloudCount || 8;
    this.fogClouds = [];
    
    for (let i = 0; i < cloudCount; i++) {
      this.fogClouds.push({
        x: Math.random() * 3000,
        y: 100 + Math.random() * 400,
        width: 200 + Math.random() * 300,
        height: 80 + Math.random() * 120,
        alpha: 0.3 + Math.random() * 0.4,
        speed: (fogConfig.cloudDriftSpeed || 0.5) * (0.5 + Math.random())
      });
    }
  }

  /**
   * Change the weather to a new type
   * @param {string} newWeather - Target weather type
   */
  setWeather(newWeather) {
    if (this.config[newWeather] && newWeather !== this.currentWeather) {
      this.targetWeather = newWeather;
      this.transitionProgress = 0;
      
      // Initialize weather-specific elements
      if (newWeather === 'FOG') {
        this.initFogClouds();
      }
    }
  }

  /**
   * Get the current visibility multiplier (interpolated during transitions)
   * @returns {number} Visibility multiplier (0-1)
   */
  getVisibilityMultiplier() {
    const currentConfig = this.config[this.currentWeather] || this.config.CLEAR;
    const targetConfig = this.config[this.targetWeather] || this.config.CLEAR;
    
    const currentVis = currentConfig.visibilityMultiplier || 1.0;
    const targetVis = targetConfig.visibilityMultiplier || 1.0;
    
    return currentVis + (targetVis - currentVis) * this.transitionProgress;
  }

  /**
   * Get the current speed penalty (interpolated during transitions)
   * @returns {number} Speed penalty (0-1, where 0.2 means 20% slower)
   */
  getSpeedPenalty() {
    const currentConfig = this.config[this.currentWeather] || this.config.CLEAR;
    const targetConfig = this.config[this.targetWeather] || this.config.CLEAR;
    
    const currentPenalty = currentConfig.speedPenalty || 0;
    const targetPenalty = targetConfig.speedPenalty || 0;
    
    return currentPenalty + (targetPenalty - currentPenalty) * this.transitionProgress;
  }

  /**
   * Get current stealth bonus from weather
   * @returns {number} Stealth bonus multiplier
   */
  getStealthBonus() {
    const currentConfig = this.config[this.currentWeather] || this.config.CLEAR;
    const targetConfig = this.config[this.targetWeather] || this.config.CLEAR;
    
    const currentBonus = currentConfig.stealthBonus || 0;
    const targetBonus = targetConfig.stealthBonus || 0;
    
    return currentBonus + (targetBonus - currentBonus) * this.transitionProgress;
  }

  /**
   * Check if player should slide (rain effect)
   * @returns {boolean} True if player should slide
   */
  shouldSlide() {
    if (this.currentWeather !== 'RAIN' || this.transitionProgress < 1.0) {
      return false;
    }
    const rainConfig = this.config.RAIN;
    return Math.random() < (rainConfig.slideChance || 0.1);
  }

  /**
   * Add a footprint in snow
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} facing - Direction facing (1 or -1)
   */
  addFootprint(x, y, facing) {
    if (this.currentWeather !== 'SNOW') return;
    
    const snowConfig = this.config.SNOW;
    this.footprints.push({
      x: x,
      y: y,
      facing: facing,
      createdAt: performance.now(),
      duration: snowConfig.footprintDuration || 5000
    });
  }

  /**
   * Update the weather system
   * @param {number} deltaTime - Time since last update in ms
   * @param {number} worldWidth - Width of the game world
   * @param {Object} player - Player entity for applying effects
   * @param {Object} camera - Camera for shake effects
   */
  update(deltaTime, worldWidth, player, camera) {
    const dt = deltaTime / 16; // Normalize to ~60fps
    
    // Update transition progress
    if (this.transitionProgress < 1.0) {
      const transitionSpeed = deltaTime / (this.config.transitionDuration || 3000);
      this.transitionProgress = Math.min(1.0, this.transitionProgress + transitionSpeed);
      
      if (this.transitionProgress >= 1.0) {
        this.currentWeather = this.targetWeather;
      }
    }
    
    // Update particles based on weather
    this.updateParticles(deltaTime, worldWidth);
    
    // Update fog clouds
    if (this.currentWeather === 'FOG' || this.targetWeather === 'FOG') {
      this.updateFogClouds(deltaTime, worldWidth);
    }
    
    // Update footprints (remove expired ones)
    const now = performance.now();
    this.footprints = this.footprints.filter(fp => now - fp.createdAt < fp.duration);
    
    // Apply weather damage (sandstorm, cold)
    if (player && player.active) {
      this.applyWeatherDamage(deltaTime, player);
    }
    
    // Apply camera shake for sandstorm
    if (this.currentWeather === 'SANDSTORM' && camera) {
      const sandConfig = this.config.SANDSTORM;
      const shakeIntensity = (sandConfig.shakeIntensity || 2) * this.transitionProgress;
      if (shakeIntensity > 0) {
        camera.shake(shakeIntensity, 100);
      }
    }
  }

  /**
   * Update weather particles (rain, snow, sandstorm)
   * @param {number} deltaTime - Time since last update
   * @param {number} worldWidth - Width of the game world
   */
  updateParticles(deltaTime, worldWidth) {
    const weather = this.transitionProgress >= 1.0 ? this.currentWeather : this.targetWeather;
    const weatherConfig = this.config[weather];
    
    // Create new particles
    if (weather === 'RAIN' || weather === 'SNOW' || weather === 'SANDSTORM') {
      const targetCount = weatherConfig.particleCount || 300;
      const spawnRate = Math.ceil(targetCount / 60); // Spawn rate per frame
      
      while (this.particles.length < targetCount) {
        this.particles.push(this.createParticle(weather, worldWidth));
      }
    }
    
    // Update existing particles
    this.particles = this.particles.filter(particle => {
      particle.x += particle.dx * (deltaTime / 16);
      particle.y += particle.dy * (deltaTime / 16);
      particle.lifetime -= deltaTime;
      
      // Remove particles that are off-screen or expired
      return particle.lifetime > 0 && particle.y < 700;
    });
    
    // Clear particles if weather is clear
    if (weather === 'CLEAR' || weather === 'FOG') {
      this.particles = this.particles.filter(p => p.lifetime > 0);
    }
  }

  /**
   * Create a new weather particle
   * @param {string} weather - Current weather type
   * @param {number} worldWidth - Width of the game world
   * @returns {Object} New particle object
   */
  createParticle(weather, worldWidth) {
    const baseParticle = {
      x: Math.random() * worldWidth,
      y: -10,
      lifetime: 3000 + Math.random() * 2000
    };
    
    switch (weather) {
      case 'RAIN':
        const rainConfig = this.config.RAIN;
        return {
          ...baseParticle,
          dx: -2 + Math.random() * 2,
          dy: (rainConfig.particleSpeed || 8) + Math.random() * 4,
          size: 2,
          color: '#6688aa'
        };
        
      case 'SNOW':
        return {
          ...baseParticle,
          dx: -1 + Math.random() * 2,
          dy: 1 + Math.random() * 2,
          size: 2 + Math.random() * 3,
          color: '#ffffff',
          wobble: Math.random() * Math.PI * 2
        };
        
      case 'SANDSTORM':
        return {
          ...baseParticle,
          x: Math.random() * worldWidth,
          y: Math.random() * 600,
          dx: 4 + Math.random() * 4,
          dy: -1 + Math.random() * 2,
          size: 2 + Math.random() * 2,
          color: '#c4a35a'
        };
        
      default:
        return baseParticle;
    }
  }

  /**
   * Update fog cloud positions
   * @param {number} deltaTime - Time since last update
   * @param {number} worldWidth - Width of the game world
   */
  updateFogClouds(deltaTime, worldWidth) {
    this.fogClouds.forEach(cloud => {
      cloud.x += cloud.speed * (deltaTime / 16);
      
      // Wrap around
      if (cloud.x > worldWidth + cloud.width) {
        cloud.x = -cloud.width;
      }
    });
  }

  /**
   * Apply weather damage to player
   * @param {number} deltaTime - Time since last update
   * @param {Object} player - Player entity
   */
  applyWeatherDamage(deltaTime, player) {
    const now = performance.now();
    
    // Sandstorm continuous damage
    if (this.currentWeather === 'SANDSTORM') {
      const sandConfig = this.config.SANDSTORM;
      const damagePerSecond = sandConfig.damage || 2;
      
      // Apply damage every second
      if (now - this.lastDamageTime >= 1000) {
        player.takeDamage(damagePerSecond);
        this.lastDamageTime = now;
      }
    }
    
    // Snow cold damage (every 5 seconds)
    if (this.currentWeather === 'SNOW') {
      const snowConfig = this.config.SNOW;
      const coldDamage = snowConfig.coldDamage || 1;
      
      if (now - this.lastDamageTime >= 5000) {
        player.takeDamage(coldDamage);
        this.lastDamageTime = now;
      }
    }
  }

  /**
   * Render weather effects
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} camera - Camera for viewport offset
   */
  render(ctx, camera) {
    const cameraX = camera ? camera.x : 0;
    const cameraY = camera ? camera.y : 0;
    
    // Render visibility overlay
    this.renderVisibilityOverlay(ctx);
    
    // Render weather-specific effects
    switch (this.currentWeather) {
      case 'RAIN':
        this.renderRain(ctx, cameraX, cameraY);
        this.renderPuddles(ctx, cameraX);
        break;
      case 'FOG':
        this.renderFog(ctx, cameraX, cameraY);
        break;
      case 'SNOW':
        this.renderSnow(ctx, cameraX, cameraY);
        this.renderFootprints(ctx, cameraX);
        break;
      case 'SANDSTORM':
        this.renderSandstorm(ctx, cameraX, cameraY);
        break;
    }
  }

  /**
   * Render visibility overlay based on weather
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderVisibilityOverlay(ctx) {
    const visibility = this.getVisibilityMultiplier();
    
    if (visibility < 1.0) {
      ctx.save();
      ctx.globalAlpha = 1 - visibility;
      
      // Weather-specific overlay colors
      switch (this.currentWeather) {
        case 'RAIN':
          ctx.fillStyle = 'rgba(50, 60, 80, 0.3)';
          break;
        case 'FOG':
          ctx.fillStyle = 'rgba(180, 180, 190, 0.6)';
          break;
        case 'SNOW':
          ctx.fillStyle = 'rgba(200, 210, 220, 0.3)';
          break;
        case 'SANDSTORM':
          ctx.fillStyle = 'rgba(180, 150, 100, 0.5)';
          break;
        default:
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      }
      
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    }
  }

  /**
   * Render rain particles
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} cameraX - Camera X offset
   * @param {number} cameraY - Camera Y offset
   */
  renderRain(ctx, cameraX, cameraY) {
    ctx.save();
    ctx.strokeStyle = '#6688aa';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6 * this.transitionProgress;
    
    this.particles.forEach(particle => {
      const screenX = particle.x - cameraX;
      const screenY = particle.y - cameraY;
      
      // Only render particles on screen
      if (screenX >= -10 && screenX <= ctx.canvas.width + 10 &&
          screenY >= -10 && screenY <= ctx.canvas.height + 10) {
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(screenX + particle.dx * 2, screenY + particle.dy * 2);
        ctx.stroke();
      }
    });
    
    ctx.restore();
  }

  /**
   * Render puddles on the ground
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} cameraX - Camera X offset
   */
  renderPuddles(ctx, cameraX) {
    const rainConfig = this.config.RAIN;
    const puddleFrequency = rainConfig.puddleFrequency || 200;
    
    ctx.save();
    ctx.fillStyle = 'rgba(70, 100, 130, 0.4)';
    ctx.globalAlpha = this.transitionProgress;
    
    // Generate consistent puddle positions
    for (let x = 0; x < 3000; x += puddleFrequency) {
      const screenX = x - cameraX;
      if (screenX >= -50 && screenX <= ctx.canvas.width + 50) {
        const puddleWidth = 30 + (x % 50);
        const puddleHeight = 4 + (x % 3);
        ctx.fillRect(screenX, 550 - (x % 10), puddleWidth, puddleHeight);
      }
    }
    
    ctx.restore();
  }

  /**
   * Render fog clouds
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} cameraX - Camera X offset
   * @param {number} cameraY - Camera Y offset
   */
  renderFog(ctx, cameraX, cameraY) {
    ctx.save();
    
    this.fogClouds.forEach(cloud => {
      const screenX = cloud.x - cameraX;
      const screenY = cloud.y - cameraY;
      
      if (screenX >= -cloud.width && screenX <= ctx.canvas.width + cloud.width) {
        const gradient = ctx.createRadialGradient(
          screenX + cloud.width / 2, screenY + cloud.height / 2, 0,
          screenX + cloud.width / 2, screenY + cloud.height / 2, cloud.width / 2
        );
        gradient.addColorStop(0, `rgba(180, 180, 190, ${cloud.alpha * this.transitionProgress})`);
        gradient.addColorStop(1, 'rgba(180, 180, 190, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(screenX, screenY, cloud.width, cloud.height);
      }
    });
    
    ctx.restore();
  }

  /**
   * Render snow particles
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} cameraX - Camera X offset
   * @param {number} cameraY - Camera Y offset
   */
  renderSnow(ctx, cameraX, cameraY) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.8 * this.transitionProgress;
    
    this.particles.forEach(particle => {
      const screenX = particle.x - cameraX;
      const screenY = particle.y - cameraY;
      
      // Add wobble effect
      const wobbleX = Math.sin(particle.wobble + performance.now() / 500) * 2;
      
      if (screenX >= -10 && screenX <= ctx.canvas.width + 10 &&
          screenY >= -10 && screenY <= ctx.canvas.height + 10) {
        ctx.beginPath();
        ctx.arc(screenX + wobbleX, screenY, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    ctx.restore();
  }

  /**
   * Render footprints in snow
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} cameraX - Camera X offset
   */
  renderFootprints(ctx, cameraX) {
    ctx.save();
    
    const now = performance.now();
    this.footprints.forEach(fp => {
      const screenX = fp.x - cameraX;
      const age = now - fp.createdAt;
      const alpha = 0.5 * (1 - age / fp.duration);
      
      if (screenX >= -20 && screenX <= ctx.canvas.width + 20) {
        ctx.fillStyle = `rgba(150, 150, 160, ${alpha})`;
        ctx.fillRect(screenX, 545, 8, 4);
        ctx.fillRect(screenX + 12 * fp.facing, 545, 8, 4);
      }
    });
    
    ctx.restore();
  }

  /**
   * Render sandstorm particles
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} cameraX - Camera X offset
   * @param {number} cameraY - Camera Y offset
   */
  renderSandstorm(ctx, cameraX, cameraY) {
    ctx.save();
    ctx.globalAlpha = 0.7 * this.transitionProgress;
    
    this.particles.forEach(particle => {
      const screenX = particle.x - cameraX;
      const screenY = particle.y - cameraY;
      
      if (screenX >= -10 && screenX <= ctx.canvas.width + 10 &&
          screenY >= -10 && screenY <= ctx.canvas.height + 10) {
        ctx.fillStyle = particle.color;
        ctx.fillRect(screenX, screenY, particle.size, particle.size);
      }
    });
    
    ctx.restore();
  }

  /**
   * Clear all weather effects
   */
  clear() {
    this.particles = [];
    this.puddles = [];
    this.footprints = [];
    this.fogClouds = [];
  }
}
