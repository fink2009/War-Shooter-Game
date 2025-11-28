/**
 * TimeOfDaySystem - Manages day/night cycle and flashlight
 * Supports Day, Dusk, and Night phases with smooth transitions
 * Includes flashlight mechanic with battery management
 */
class TimeOfDaySystem {
  constructor() {
    this.currentPhase = 'DAY';
    this.targetPhase = 'DAY';
    this.transitionProgress = 1.0;
    this.cycleTime = 0; // Current time in the day/night cycle
    this.flashlightOn = false;
    this.flashlightBattery = 30; // seconds
    this.flashlightMaxBattery = 30;
    this.flashlightAngle = 0; // Direction the flashlight is pointing
    this.config = typeof GameConfig !== 'undefined' && GameConfig.TIME_OF_DAY ? 
      GameConfig.TIME_OF_DAY : this.getDefaultConfig();
    this.flashlightConfig = typeof GameConfig !== 'undefined' && GameConfig.FLASHLIGHT ?
      GameConfig.FLASHLIGHT : this.getDefaultFlashlightConfig();
  }

  /**
   * Get default time of day configuration
   * @returns {Object} Default config
   */
  getDefaultConfig() {
    return {
      DAY: { brightness: 1.0, enemyVisionMultiplier: 1.0, stealthBonus: 0, tint: null },
      DUSK: { brightness: 0.7, enemyVisionMultiplier: 0.8, stealthBonus: 0.2, tint: { r: 255, g: 150, b: 100 }, transitionDuration: 60000 },
      NIGHT: { brightness: 0.4, enemyVisionMultiplier: 0.5, stealthBonus: 0.5, tint: { r: 50, g: 50, b: 100 } },
      cycleDuration: 300000 // 5 minutes
    };
  }

  /**
   * Get default flashlight configuration
   * @returns {Object} Default flashlight config
   */
  getDefaultFlashlightConfig() {
    return {
      range: 200,
      coneAngle: 45,
      battery: 30,
      rechargeRate: 0.5,
      toggleKey: 'f'
    };
  }

  /**
   * Initialize the time of day system
   * @param {string} initialPhase - Starting phase (DAY, DUSK, NIGHT)
   */
  init(initialPhase = 'DAY') {
    this.currentPhase = initialPhase;
    this.targetPhase = initialPhase;
    this.transitionProgress = 1.0;
    this.cycleTime = 0;
    this.flashlightBattery = this.flashlightConfig.battery || 30;
    this.flashlightMaxBattery = this.flashlightBattery;
    this.flashlightOn = false;
  }

  /**
   * Manually set the time of day phase
   * @param {string} phase - Target phase (DAY, DUSK, NIGHT)
   */
  setPhase(phase) {
    if (this.config[phase] && phase !== this.currentPhase) {
      this.targetPhase = phase;
      this.transitionProgress = 0;
    }
  }

  /**
   * Get the current brightness level (interpolated during transitions)
   * @returns {number} Brightness level (0-1)
   */
  getBrightness() {
    const currentConfig = this.config[this.currentPhase] || this.config.DAY;
    const targetConfig = this.config[this.targetPhase] || this.config.DAY;
    
    const currentBrightness = currentConfig.brightness || 1.0;
    const targetBrightness = targetConfig.brightness || 1.0;
    
    return currentBrightness + (targetBrightness - currentBrightness) * this.transitionProgress;
  }

  /**
   * Get the current enemy vision multiplier
   * @returns {number} Vision multiplier for enemies (lower = reduced vision)
   */
  getEnemyVisionMultiplier() {
    const currentConfig = this.config[this.currentPhase] || this.config.DAY;
    const targetConfig = this.config[this.targetPhase] || this.config.DAY;
    
    const currentVision = currentConfig.enemyVisionMultiplier || 1.0;
    const targetVision = targetConfig.enemyVisionMultiplier || 1.0;
    
    return currentVision + (targetVision - currentVision) * this.transitionProgress;
  }

  /**
   * Get the current stealth bonus from time of day
   * @returns {number} Stealth bonus multiplier
   */
  getStealthBonus() {
    const currentConfig = this.config[this.currentPhase] || this.config.DAY;
    const targetConfig = this.config[this.targetPhase] || this.config.DAY;
    
    const currentBonus = currentConfig.stealthBonus || 0;
    const targetBonus = targetConfig.stealthBonus || 0;
    
    return currentBonus + (targetBonus - currentBonus) * this.transitionProgress;
  }

  /**
   * Get the current tint color (interpolated during transitions)
   * @returns {Object|null} RGB tint object or null for no tint
   */
  getTint() {
    const currentConfig = this.config[this.currentPhase] || this.config.DAY;
    const targetConfig = this.config[this.targetPhase] || this.config.DAY;
    
    const currentTint = currentConfig.tint;
    const targetTint = targetConfig.tint;
    
    // If neither phase has a tint, return null
    if (!currentTint && !targetTint) return null;
    
    // Default tint for interpolation
    const defaultTint = { r: 255, g: 255, b: 255 };
    const from = currentTint || defaultTint;
    const to = targetTint || defaultTint;
    
    return {
      r: Math.round(from.r + (to.r - from.r) * this.transitionProgress),
      g: Math.round(from.g + (to.g - from.g) * this.transitionProgress),
      b: Math.round(from.b + (to.b - from.b) * this.transitionProgress)
    };
  }

  /**
   * Toggle the flashlight on/off
   */
  toggleFlashlight() {
    // Can only turn on if we have battery
    if (!this.flashlightOn && this.flashlightBattery <= 0) {
      return false;
    }
    this.flashlightOn = !this.flashlightOn;
    return true;
  }

  /**
   * Check if flashlight is currently on
   * @returns {boolean} True if flashlight is on
   */
  isFlashlightOn() {
    return this.flashlightOn && this.flashlightBattery > 0;
  }

  /**
   * Get flashlight battery percentage
   * @returns {number} Battery percentage (0-1)
   */
  getFlashlightBatteryPercent() {
    return this.flashlightBattery / this.flashlightMaxBattery;
  }

  /**
   * Update the time of day system
   * @param {number} deltaTime - Time since last update in ms
   * @param {Object} player - Player entity for flashlight direction
   * @param {boolean} autoCycle - Whether to automatically cycle through phases
   */
  update(deltaTime, player, autoCycle = false) {
    // Update transition progress
    if (this.transitionProgress < 1.0) {
      const phaseConfig = this.config[this.targetPhase];
      const transitionDuration = phaseConfig.transitionDuration || 60000;
      const transitionSpeed = deltaTime / transitionDuration;
      this.transitionProgress = Math.min(1.0, this.transitionProgress + transitionSpeed);
      
      if (this.transitionProgress >= 1.0) {
        this.currentPhase = this.targetPhase;
      }
    }
    
    // Auto-cycle through day phases
    if (autoCycle && this.transitionProgress >= 1.0) {
      const cycleDuration = this.config.cycleDuration || 300000;
      this.cycleTime += deltaTime;
      
      // Determine phase based on cycle time
      const cyclePosition = (this.cycleTime % cycleDuration) / cycleDuration;
      
      if (cyclePosition < 0.4) {
        // Day phase (40% of cycle)
        if (this.currentPhase !== 'DAY') {
          this.setPhase('DAY');
        }
      } else if (cyclePosition < 0.5) {
        // Dusk transition (10% of cycle)
        if (this.currentPhase !== 'DUSK') {
          this.setPhase('DUSK');
        }
      } else if (cyclePosition < 0.9) {
        // Night phase (40% of cycle)
        if (this.currentPhase !== 'NIGHT') {
          this.setPhase('NIGHT');
        }
      } else {
        // Dawn transition back to day (10% of cycle)
        if (this.currentPhase !== 'DAY') {
          this.setPhase('DAY');
        }
      }
    }
    
    // Update flashlight
    this.updateFlashlight(deltaTime, player);
  }

  /**
   * Update flashlight state and battery
   * @param {number} deltaTime - Time since last update in ms
   * @param {Object} player - Player entity for flashlight direction
   */
  updateFlashlight(deltaTime, player) {
    const dt = deltaTime / 1000; // Convert to seconds
    
    if (this.flashlightOn) {
      // Drain battery
      this.flashlightBattery = Math.max(0, this.flashlightBattery - dt);
      
      // Turn off if battery depleted
      if (this.flashlightBattery <= 0) {
        this.flashlightOn = false;
      }
      
      // Update flashlight angle based on player facing
      if (player) {
        this.flashlightAngle = player.facing > 0 ? 0 : Math.PI;
      }
    } else {
      // Recharge battery when off
      const rechargeRate = this.flashlightConfig.rechargeRate || 0.5;
      this.flashlightBattery = Math.min(
        this.flashlightMaxBattery,
        this.flashlightBattery + rechargeRate * dt
      );
    }
  }

  /**
   * Check if a position is illuminated by the flashlight
   * @param {number} x - X position to check
   * @param {number} y - Y position to check
   * @param {Object} player - Player entity
   * @returns {boolean} True if position is illuminated
   */
  isIlluminated(x, y, player) {
    if (!this.isFlashlightOn() || !player) return false;
    
    const playerX = player.x + player.width / 2;
    const playerY = player.y + player.height / 2;
    
    // Calculate distance
    const dx = x - playerX;
    const dy = y - playerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check range
    const range = this.flashlightConfig.range || 200;
    if (distance > range) return false;
    
    // Check cone angle
    const angle = Math.atan2(dy, dx);
    const coneAngle = (this.flashlightConfig.coneAngle || 45) * Math.PI / 180 / 2;
    const angleDiff = Math.abs(this.normalizeAngle(angle - this.flashlightAngle));
    
    return angleDiff <= coneAngle;
  }

  /**
   * Normalize an angle to -PI to PI range
   * @param {number} angle - Angle in radians
   * @returns {number} Normalized angle
   */
  normalizeAngle(angle) {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
  }

  /**
   * Render time of day effects
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} player - Player entity for flashlight rendering
   * @param {Object} camera - Camera for viewport offset
   */
  render(ctx, player, camera) {
    const cameraX = camera ? camera.x : 0;
    const cameraY = camera ? camera.y : 0;
    
    // Render darkness/brightness overlay
    this.renderBrightnessOverlay(ctx);
    
    // Render tint overlay
    this.renderTintOverlay(ctx);
    
    // Render flashlight cone
    if (this.isFlashlightOn() && player) {
      this.renderFlashlight(ctx, player, cameraX, cameraY);
    }
  }

  /**
   * Render the brightness overlay
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderBrightnessOverlay(ctx) {
    const brightness = this.getBrightness();
    
    if (brightness < 1.0) {
      ctx.save();
      ctx.globalAlpha = 1 - brightness;
      ctx.fillStyle = 'rgba(0, 0, 20, 1)';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    }
  }

  /**
   * Render the color tint overlay
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderTintOverlay(ctx) {
    const tint = this.getTint();
    
    if (tint && (tint.r !== 255 || tint.g !== 255 || tint.b !== 255)) {
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = `rgb(${tint.r}, ${tint.g}, ${tint.b})`;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    }
  }

  /**
   * Render the flashlight cone and light effect
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} player - Player entity
   * @param {number} cameraX - Camera X offset
   * @param {number} cameraY - Camera Y offset
   */
  renderFlashlight(ctx, player, cameraX, cameraY) {
    const playerX = player.x + player.width / 2 - cameraX;
    const playerY = player.y + player.height / 2 - cameraY;
    const range = this.flashlightConfig.range || 200;
    const coneAngle = (this.flashlightConfig.coneAngle || 45) * Math.PI / 180;
    
    ctx.save();
    
    // Create flashlight cone gradient
    const gradient = ctx.createRadialGradient(playerX, playerY, 0, playerX, playerY, range);
    gradient.addColorStop(0, 'rgba(255, 255, 200, 0.4)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 150, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
    
    // Draw cone shape
    ctx.beginPath();
    ctx.moveTo(playerX, playerY);
    ctx.arc(
      playerX, playerY, range,
      this.flashlightAngle - coneAngle / 2,
      this.flashlightAngle + coneAngle / 2
    );
    ctx.closePath();
    
    ctx.fillStyle = gradient;
    ctx.globalCompositeOperation = 'lighter';
    ctx.fill();
    
    // Add a subtle glow at the flashlight source
    ctx.beginPath();
    ctx.arc(playerX, playerY, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 200, 0.6)';
    ctx.fill();
    
    ctx.restore();
  }

  /**
   * Render the flashlight battery indicator in the HUD
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  renderBatteryIndicator(ctx, x, y) {
    const batteryPercent = this.getFlashlightBatteryPercent();
    const width = 50;
    const height = 15;
    
    ctx.save();
    
    // Battery outline
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Battery tip
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + width, y + 4, 4, 7);
    
    // Battery fill
    if (batteryPercent > 0.5) {
      ctx.fillStyle = '#00ff00';
    } else if (batteryPercent > 0.2) {
      ctx.fillStyle = '#ffff00';
    } else {
      ctx.fillStyle = '#ff0000';
    }
    ctx.fillRect(x + 2, y + 2, (width - 4) * batteryPercent, height - 4);
    
    // Flashlight icon
    ctx.fillStyle = this.flashlightOn ? '#ffff00' : '#888888';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('🔦', x - 20, y + 12);
    
    ctx.restore();
  }

  /**
   * Reset the time of day system
   */
  reset() {
    this.currentPhase = 'DAY';
    this.targetPhase = 'DAY';
    this.transitionProgress = 1.0;
    this.cycleTime = 0;
    this.flashlightOn = false;
    this.flashlightBattery = this.flashlightMaxBattery;
  }
}
