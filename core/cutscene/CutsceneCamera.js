// Cutscene Camera Controller - 2D camera for cinematic shots
class CutsceneCamera {
  constructor(canvasWidth, canvasHeight) {
    // Canvas dimensions
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    
    // World bounds
    this.worldWidth = 3000;
    this.worldHeight = 600;
    
    // Camera position (top-left corner)
    this.x = 0;
    this.y = 0;
    
    // Target position (for smooth interpolation)
    this.targetX = 0;
    this.targetY = 0;
    
    // Zoom
    this.zoom = 1.0;
    this.targetZoom = 1.0;
    
    // Pan animation
    this.panStartX = 0;
    this.panStartY = 0;
    this.panEndX = 0;
    this.panEndY = 0;
    this.panProgress = 0;
    this.panDuration = 0;
    this.isPanning = false;
    
    // Zoom animation
    this.zoomStart = 1.0;
    this.zoomEnd = 1.0;
    this.zoomProgress = 0;
    this.zoomDuration = 0;
    this.isZooming = false;
    
    // Focus tracking
    this.focusTarget = null; // Entity to track
    this.isFocusing = false;
    this.focusOffsetX = 0;
    this.focusOffsetY = 0;
    
    // Screen shake
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    
    // Easing type for current animation
    this.easingType = 'ease-in-out';
    
    // Current shot data
    this.currentShot = null;
    this.shotElapsed = 0;
  }

  /**
   * Set canvas dimensions
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  setCanvasSize(width, height) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  /**
   * Set world bounds
   * @param {number} width - World width
   * @param {number} height - World height
   */
  setWorldBounds(width, height) {
    this.worldWidth = width;
    this.worldHeight = height;
  }

  /**
   * Reset camera to default state
   */
  reset() {
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.zoom = 1.0;
    this.targetZoom = 1.0;
    this.isPanning = false;
    this.isZooming = false;
    this.isFocusing = false;
    this.focusTarget = null;
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.currentShot = null;
    this.shotElapsed = 0;
  }

  /**
   * Execute a camera shot from cutscene data
   * @param {Object} shot - Shot configuration
   * @param {Object} boss - Boss entity reference
   * @param {Object} player - Player entity reference
   */
  executeShot(shot, boss, player) {
    this.currentShot = shot;
    this.shotElapsed = 0;
    
    const camera = shot.camera;
    if (!camera) return;
    
    // Set easing type if specified
    this.easingType = camera.easing || 'ease-in-out';
    
    switch (camera.type) {
      case 'pan':
        this.startPan(
          camera.startX,
          camera.startY || this.calculateCenterY(),
          camera.endX,
          camera.endY || this.calculateCenterY(),
          shot.duration,
          camera.zoom || 1.0
        );
        break;
        
      case 'focus':
        this.startFocus(
          camera.target === 'boss' ? boss : player,
          camera.zoom || 1.0,
          camera.offsetX || 0,
          camera.offsetY || -50
        );
        break;
        
      case 'zoom':
      case 'zoom_in':
        this.startZoom(camera.zoom || 1.5, shot.duration);
        break;
        
      case 'zoom_out':
        this.startZoom(camera.zoom || 1.0, shot.duration);
        break;
        
      case 'shake':
        this.shake(camera.intensity || 5, camera.duration || shot.duration);
        break;
        
      case 'static':
        // Static camera at position
        this.isPanning = false;
        this.isFocusing = false;
        if (camera.x !== undefined) this.x = camera.x;
        if (camera.y !== undefined) this.y = camera.y;
        if (camera.zoom !== undefined) {
          this.zoom = camera.zoom;
          this.targetZoom = camera.zoom;
        }
        break;
        
      case 'follow':
        // Follow target with smooth movement
        this.startFocus(
          camera.target === 'boss' ? boss : player,
          camera.zoom || 1.0,
          camera.offsetX || 0,
          camera.offsetY || 0
        );
        break;
        
      default:
        console.warn('CutsceneCamera: Unknown shot type:', camera.type);
    }
  }

  /**
   * Start a pan animation
   * @param {number} startX - Starting X position
   * @param {number} startY - Starting Y position
   * @param {number} endX - Ending X position
   * @param {number} endY - Ending Y position
   * @param {number} duration - Duration in ms
   * @param {number} zoom - Zoom level during pan
   */
  startPan(startX, startY, endX, endY, duration, zoom = 1.0) {
    this.panStartX = startX - (this.canvasWidth / 2) / zoom;
    this.panStartY = startY - (this.canvasHeight / 2) / zoom;
    this.panEndX = endX - (this.canvasWidth / 2) / zoom;
    this.panEndY = endY - (this.canvasHeight / 2) / zoom;
    this.panProgress = 0;
    this.panDuration = duration;
    this.isPanning = true;
    this.isFocusing = false;
    
    // Set initial position
    this.x = this.panStartX;
    this.y = this.panStartY;
    
    // Set zoom
    this.targetZoom = zoom;
    this.zoomStart = this.zoom;
    this.zoomEnd = zoom;
    this.zoomProgress = 0;
    this.zoomDuration = duration;
    this.isZooming = true;
  }

  /**
   * Start focus tracking on an entity
   * @param {Object} target - Entity to focus on
   * @param {number} zoom - Zoom level
   * @param {number} offsetX - X offset from target center
   * @param {number} offsetY - Y offset from target center
   */
  startFocus(target, zoom = 1.0, offsetX = 0, offsetY = 0) {
    this.focusTarget = target;
    this.focusOffsetX = offsetX;
    this.focusOffsetY = offsetY;
    this.isFocusing = true;
    this.isPanning = false;
    
    // Animate zoom
    if (zoom !== this.zoom) {
      this.zoomStart = this.zoom;
      this.zoomEnd = zoom;
      this.zoomProgress = 0;
      this.zoomDuration = 500; // Default focus zoom duration
      this.isZooming = true;
    }
    this.targetZoom = zoom;
  }

  /**
   * Start a zoom animation
   * @param {number} targetZoom - Target zoom level
   * @param {number} duration - Duration in ms
   */
  startZoom(targetZoom, duration) {
    this.zoomStart = this.zoom;
    this.zoomEnd = targetZoom;
    this.zoomProgress = 0;
    this.zoomDuration = duration;
    this.isZooming = true;
    this.targetZoom = targetZoom;
  }

  /**
   * Trigger screen shake effect
   * @param {number} intensity - Shake intensity in pixels
   * @param {number} duration - Duration in ms
   */
  shake(intensity, duration) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }

  /**
   * Calculate Y position to center vertically
   * @returns {number} Center Y position
   */
  calculateCenterY() {
    return this.worldHeight / 2;
  }

  /**
   * Apply easing function
   * @param {number} t - Progress (0-1)
   * @param {string} type - Easing type
   * @returns {number} Eased value (0-1)
   */
  ease(t, type = this.easingType) {
    switch (type) {
      case 'linear':
        return t;
        
      case 'ease-in':
        return t * t;
        
      case 'ease-out':
        return 1 - (1 - t) * (1 - t);
        
      case 'ease-in-out':
        return t < 0.5 
          ? 2 * t * t 
          : 1 - Math.pow(-2 * t + 2, 2) / 2;
        
      case 'ease-in-cubic':
        return t * t * t;
        
      case 'ease-out-cubic':
        return 1 - Math.pow(1 - t, 3);
        
      case 'ease-in-out-cubic':
        return t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2;
        
      case 'bounce':
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
          return n1 * t * t;
        } else if (t < 2 / d1) {
          return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
          return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
          return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
        
      default:
        return t;
    }
  }

  /**
   * Update camera state
   * @param {number} deltaTime - Time since last frame in ms
   * @param {Object} boss - Boss entity reference
   * @param {Object} player - Player entity reference
   */
  update(deltaTime, boss, player) {
    this.shotElapsed += deltaTime;
    
    // Update pan animation
    if (this.isPanning && this.panDuration > 0) {
      this.panProgress += deltaTime / this.panDuration;
      
      if (this.panProgress >= 1) {
        this.panProgress = 1;
        this.isPanning = false;
      }
      
      const easedProgress = this.ease(this.panProgress);
      this.x = this.panStartX + (this.panEndX - this.panStartX) * easedProgress;
      this.y = this.panStartY + (this.panEndY - this.panStartY) * easedProgress;
    }
    
    // Update focus tracking
    if (this.isFocusing && this.focusTarget) {
      const targetCenterX = this.focusTarget.x + (this.focusTarget.width || 50) / 2;
      const targetCenterY = this.focusTarget.y + (this.focusTarget.height || 70) / 2;
      
      const desiredX = targetCenterX + this.focusOffsetX - (this.canvasWidth / 2) / this.zoom;
      const desiredY = targetCenterY + this.focusOffsetY - (this.canvasHeight / 2) / this.zoom;
      
      // Smooth follow
      const smoothing = 0.08;
      this.x += (desiredX - this.x) * smoothing;
      this.y += (desiredY - this.y) * smoothing;
    }
    
    // Update zoom animation
    if (this.isZooming && this.zoomDuration > 0) {
      this.zoomProgress += deltaTime / this.zoomDuration;
      
      if (this.zoomProgress >= 1) {
        this.zoomProgress = 1;
        this.isZooming = false;
      }
      
      const easedProgress = this.ease(this.zoomProgress);
      this.zoom = this.zoomStart + (this.zoomEnd - this.zoomStart) * easedProgress;
    }
    
    // Update screen shake
    if (this.shakeDuration > 0) {
      this.shakeX = (Math.random() - 0.5) * 2 * this.shakeIntensity;
      this.shakeY = (Math.random() - 0.5) * 2 * this.shakeIntensity;
      this.shakeDuration -= deltaTime;
      
      // Decay intensity
      this.shakeIntensity *= 0.95;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
      this.shakeIntensity = 0;
    }
    
    // Clamp camera position to world bounds
    this.clampToWorld();
  }

  /**
   * Clamp camera position within world bounds
   */
  clampToWorld() {
    const viewWidth = this.canvasWidth / this.zoom;
    const viewHeight = this.canvasHeight / this.zoom;
    
    this.x = Math.max(0, Math.min(this.worldWidth - viewWidth, this.x));
    this.y = Math.max(0, Math.min(this.worldHeight - viewHeight, this.y));
  }

  /**
   * Apply camera transform to rendering context
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  apply(ctx) {
    ctx.save();
    
    // Apply shake offset
    const finalX = this.x + this.shakeX;
    const finalY = this.y + this.shakeY;
    
    // Apply zoom (scale around canvas center)
    if (this.zoom !== 1.0) {
      ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
      ctx.scale(this.zoom, this.zoom);
      ctx.translate(-this.canvasWidth / 2, -this.canvasHeight / 2);
    }
    
    // Apply camera translation
    ctx.translate(-finalX, -finalY);
  }

  /**
   * Reset transform on rendering context
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  resetTransform(ctx) {
    ctx.restore();
  }

  /**
   * Get current camera transform data
   * @returns {Object} Transform data
   */
  getTransform() {
    return {
      x: this.x + this.shakeX,
      y: this.y + this.shakeY,
      zoom: this.zoom,
      shakeX: this.shakeX,
      shakeY: this.shakeY
    };
  }

  /**
   * Convert world coordinates to screen coordinates
   * @param {number} worldX - World X position
   * @param {number} worldY - World Y position
   * @returns {Object} Screen coordinates
   */
  worldToScreen(worldX, worldY) {
    return {
      x: (worldX - this.x - this.shakeX) * this.zoom,
      y: (worldY - this.y - this.shakeY) * this.zoom
    };
  }

  /**
   * Convert screen coordinates to world coordinates
   * @param {number} screenX - Screen X position
   * @param {number} screenY - Screen Y position
   * @returns {Object} World coordinates
   */
  screenToWorld(screenX, screenY) {
    return {
      x: screenX / this.zoom + this.x + this.shakeX,
      y: screenY / this.zoom + this.y + this.shakeY
    };
  }
}
