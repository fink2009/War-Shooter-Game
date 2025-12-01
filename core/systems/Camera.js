// Side-scrolling camera system with enhanced game feel
class Camera {
  constructor(width, height, worldWidth, worldHeight) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.following = null;
    this.deadzone = { x: 200, y: 100 };
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    
    // Enhanced camera settings
    this.targetX = 0;
    this.targetY = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.lookAheadAmount = 100; // Pixels to look ahead when moving
    this.lookAheadSpeed = 0.02; // How fast to apply look-ahead
    this.currentLookAhead = 0;
    
    // Screen shake variations
    this.shakeType = 'random'; // 'random', 'horizontal', 'vertical', 'directional'
    this.shakeDirection = 0;
    this.shakeDecay = 0.9;
    
    // Zoom settings (for dramatic moments)
    this.zoom = 1.0;
    this.targetZoom = 1.0;
    this.zoomSpeed = 0.05;
    this.minZoom = 0.8;
    this.maxZoom = 1.5;
    
    // Trauma-based shake (accumulates for bigger hits)
    this.trauma = 0;
    this.maxTrauma = 1.0;
    this.traumaDecay = 1.5; // Per second
  }

  follow(entity) {
    this.following = entity;
  }
  
  /**
   * Standard screen shake
   * @param {number} intensity - Shake intensity (pixels)
   * @param {number} duration - Shake duration (ms)
   * @param {string} type - Shake type: 'random', 'horizontal', 'vertical', 'directional'
   * @param {number} direction - Direction angle for 'directional' type
   */
  shake(intensity = 5, duration = 200, type = 'random', direction = 0) {
    if (window.game && !window.game.screenShake) return;
    
    // Accumulate shake if already shaking
    if (this.shakeDuration > 0) {
      this.shakeIntensity = Math.min(this.shakeIntensity + intensity * 0.5, 20);
      this.shakeDuration = Math.max(this.shakeDuration, duration);
    } else {
      this.shakeIntensity = Math.min(intensity, 20);
      this.shakeDuration = duration;
    }
    
    this.shakeType = type;
    this.shakeDirection = direction;
  }

  /**
   * Add trauma for natural shake buildup
   * @param {number} amount - Trauma amount (0-1)
   */
  addTrauma(amount) {
    if (window.game && !window.game.screenShake) return;
    this.trauma = Math.min(this.trauma + amount, this.maxTrauma);
  }

  /**
   * Smooth zoom transition
   * @param {number} target - Target zoom level
   * @param {number} speed - Zoom speed (optional)
   */
  setZoom(target, speed = 0.05) {
    this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, target));
    this.zoomSpeed = speed;
  }

  /**
   * Instant zoom (for boss reveals, etc.)
   * @param {number} zoom - Zoom level
   */
  setZoomInstant(zoom) {
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
    this.targetZoom = this.zoom;
  }

  update(deltaTime = 16) {
    // Don't update camera if game is not in playing state
    if (window.game && window.game.state !== 'playing' && window.game.state !== 'leveltransition') {
      return;
    }
    
    const dt = deltaTime / 1000; // Convert to seconds
    
    if (this.following) {
      // Get smoothness from game settings
      const smoothness = window.game ? window.game.cameraSmoothness : 0.1;
      
      // Calculate base target position
      const entityCenterX = this.following.x + this.following.width / 2;
      const entityCenterY = this.following.y + this.following.height / 2;
      
      // Apply look-ahead based on player velocity/facing
      let lookAhead = 0;
      if (this.following.dx) {
        const targetLookAhead = Math.sign(this.following.dx) * this.lookAheadAmount;
        this.currentLookAhead += (targetLookAhead - this.currentLookAhead) * this.lookAheadSpeed;
        lookAhead = this.currentLookAhead;
      } else if (this.following.facing) {
        const targetLookAhead = this.following.facing * this.lookAheadAmount * 0.5;
        this.currentLookAhead += (targetLookAhead - this.currentLookAhead) * this.lookAheadSpeed * 0.5;
        lookAhead = this.currentLookAhead;
      } else {
        this.currentLookAhead *= 0.95; // Decay look-ahead when stationary
        lookAhead = this.currentLookAhead;
      }
      
      // Target position with look-ahead
      this.targetX = entityCenterX - this.width / 2 + lookAhead;
      this.targetY = entityCenterY - this.height / 2;

      // Smooth camera movement with improved lerp
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      
      // Apply smoothness (higher = faster tracking)
      this.x += dx * smoothness;
      this.y += dy * smoothness;

      // Clamp camera to world bounds (accounting for zoom)
      const effectiveWidth = this.width / this.zoom;
      const effectiveHeight = this.height / this.zoom;
      this.x = Math.max(0, Math.min(this.worldWidth - effectiveWidth, this.x));
      this.y = Math.max(0, Math.min(this.worldHeight - effectiveHeight, this.y));
    }
    
    // Update zoom smoothly
    if (this.zoom !== this.targetZoom) {
      const zoomDiff = this.targetZoom - this.zoom;
      this.zoom += zoomDiff * this.zoomSpeed;
      
      // Snap when close
      if (Math.abs(zoomDiff) < 0.01) {
        this.zoom = this.targetZoom;
      }
    }
    
    // Update screen shake (standard)
    if (this.shakeDuration > 0) {
      this.updateShake(deltaTime);
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }
    
    // Update trauma-based shake
    if (this.trauma > 0) {
      this.updateTraumaShake(deltaTime);
    }
  }

  /**
   * Update standard screen shake
   */
  updateShake(deltaTime) {
    const intensity = this.shakeIntensity * (this.shakeDuration / 200); // Decay over time
    
    switch (this.shakeType) {
      case 'horizontal':
        this.shakeX = (Math.random() - 0.5) * intensity * 2;
        this.shakeY = (Math.random() - 0.5) * intensity * 0.3;
        break;
      case 'vertical':
        this.shakeX = (Math.random() - 0.5) * intensity * 0.3;
        this.shakeY = (Math.random() - 0.5) * intensity * 2;
        break;
      case 'directional':
        const angle = this.shakeDirection + (Math.random() - 0.5) * 0.5;
        this.shakeX = Math.cos(angle) * intensity * (Math.random() * 0.5 + 0.5);
        this.shakeY = Math.sin(angle) * intensity * (Math.random() * 0.5 + 0.5);
        break;
      default: // random
        this.shakeX = (Math.random() - 0.5) * intensity;
        this.shakeY = (Math.random() - 0.5) * intensity;
    }
    
    this.shakeDuration -= deltaTime;
    
    if (this.shakeDuration <= 0) {
      this.shakeDuration = 0;
      this.shakeX = 0;
      this.shakeY = 0;
    }
  }

  /**
   * Update trauma-based shake (more natural accumulating shake)
   */
  updateTraumaShake(deltaTime) {
    const dt = deltaTime / 1000;
    
    // Calculate shake from trauma (squared for more punch)
    const shake = this.trauma * this.trauma;
    const maxOffset = 15; // Maximum shake offset in pixels
    
    // Perlin-like noise approximation using sin
    const time = Date.now() / 1000;
    const noiseX = Math.sin(time * 20) * Math.cos(time * 15);
    const noiseY = Math.cos(time * 18) * Math.sin(time * 22);
    
    // Add trauma shake to existing shake
    this.shakeX += noiseX * shake * maxOffset;
    this.shakeY += noiseY * shake * maxOffset;
    
    // Decay trauma
    this.trauma = Math.max(0, this.trauma - this.traumaDecay * dt);
  }

  apply(ctx) {
    ctx.save();
    
    // Apply zoom from center
    if (this.zoom !== 1.0) {
      ctx.translate(this.width / 2, this.height / 2);
      ctx.scale(this.zoom, this.zoom);
      ctx.translate(-this.width / 2, -this.height / 2);
    }
    
    ctx.translate(-this.x + this.shakeX, -this.y + this.shakeY);
  }

  reset(ctx) {
    ctx.restore();
  }

  worldToScreen(worldX, worldY) {
    return {
      x: (worldX - this.x + this.shakeX) * this.zoom,
      y: (worldY - this.y + this.shakeY) * this.zoom
    };
  }

  screenToWorld(screenX, screenY) {
    return {
      x: (screenX / this.zoom) + this.x - this.shakeX,
      y: (screenY / this.zoom) + this.y - this.shakeY
    };
  }

  /**
   * Get current zoom level
   * @returns {number} Current zoom
   */
  getZoom() {
    return this.zoom;
  }

  /**
   * Reset camera to default state
   */
  resetState() {
    this.zoom = 1.0;
    this.targetZoom = 1.0;
    this.trauma = 0;
    this.shakeDuration = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.currentLookAhead = 0;
  }
}
