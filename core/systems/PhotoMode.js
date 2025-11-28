// Photo Mode System - Freeze gameplay and capture screenshots
// Provides free camera, filters, and screenshot capabilities
class PhotoMode {
  constructor() {
    this.active = false;
    this.paused = false;
    
    // Camera state
    this.camera = {
      x: 0,
      y: 0,
      zoom: 1.0,
      rotation: 0,
      fov: 90,
      tilt: 0
    };
    
    // Original game camera reference
    this.originalCamera = null;
    
    // Configuration from GameConfig
    this.config = typeof GameConfig !== 'undefined' && GameConfig.PHOTO_MODE ? 
      GameConfig.PHOTO_MODE : {
        minZoom: 0.5,
        maxZoom: 3.0,
        fovRange: { min: 60, max: 120 },
        filters: ['none', 'bw', 'sepia', 'contrast', 'vintage', 'neon', 'pixel', 'vignette'],
        cameraSpeed: 5,
        tiltRange: { min: -45, max: 45 }
      };
    
    // Current filter
    this.currentFilter = 'none';
    this.filterIndex = 0;
    
    // HUD visibility toggles
    this.hudVisible = false;
    this.enemyHealthBarsVisible = true;
    this.particlesVisible = true;
    this.gridVisible = false;
    
    // Depth of field
    this.depthOfField = {
      enabled: false,
      focusDistance: 300,
      blurAmount: 0.5
    };
    
    // Screenshot settings
    this.screenshotResolution = 'native'; // native, 1080p, 4k
    this.screenshotGallery = [];
    
    // UI state
    this.showControls = true;
    this.selectedOption = 0;
    
    // Input state
    this.keys = {};
    
    this.loadGallery();
  }
  
  /**
   * Initialize photo mode
   * @param {Object} game - Game engine reference
   */
  init(game) {
    this.game = game;
    
    // Set up keyboard listeners for photo mode
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }
  
  /**
   * Enter photo mode
   */
  enter() {
    if (!this.game) return;
    
    this.active = true;
    this.paused = true;
    
    // Store original camera position
    if (this.game.camera) {
      this.originalCamera = {
        x: this.game.camera.x,
        y: this.game.camera.y
      };
      
      // Initialize photo camera from current position
      this.camera.x = this.game.camera.x;
      this.camera.y = this.game.camera.y;
    }
    
    // Reset camera settings
    this.camera.zoom = 1.0;
    this.camera.rotation = 0;
    this.camera.tilt = 0;
    this.camera.fov = 90;
    
    // Reset filter
    this.currentFilter = 'none';
    this.filterIndex = 0;
    
    console.log('Photo Mode: Entered');
  }
  
  /**
   * Exit photo mode
   */
  exit() {
    this.active = false;
    this.paused = false;
    
    // Restore original camera
    if (this.game && this.game.camera && this.originalCamera) {
      this.game.camera.x = this.originalCamera.x;
      this.game.camera.y = this.originalCamera.y;
    }
    
    console.log('Photo Mode: Exited');
  }
  
  /**
   * Toggle photo mode
   */
  toggle() {
    if (this.active) {
      this.exit();
    } else {
      this.enter();
    }
  }
  
  /**
   * Handle key down event
   * @param {KeyboardEvent} e - Key event
   */
  handleKeyDown(e) {
    this.keys[e.key.toLowerCase()] = true;
    this.keys[e.code] = true;
    
    if (!this.active) {
      // Toggle photo mode with P key
      if (e.key.toLowerCase() === 'p' && this.game && this.game.state === 'playing') {
        this.enter();
        e.preventDefault();
      }
      return;
    }
    
    // Photo mode controls
    switch (e.key.toLowerCase()) {
      case 'p':
      case 'escape':
        this.exit();
        e.preventDefault();
        break;
        
      case 'f':
        // Cycle filters
        this.cycleFilter(1);
        e.preventDefault();
        break;
        
      case 'g':
        // Cycle filters backward
        this.cycleFilter(-1);
        e.preventDefault();
        break;
        
      case 'h':
        // Toggle HUD
        this.hudVisible = !this.hudVisible;
        e.preventDefault();
        break;
        
      case 'r':
        // Toggle grid overlay
        this.gridVisible = !this.gridVisible;
        e.preventDefault();
        break;
        
      case 'b':
        // Toggle depth of field
        this.depthOfField.enabled = !this.depthOfField.enabled;
        e.preventDefault();
        break;
        
      case 't':
        // Toggle controls visibility
        this.showControls = !this.showControls;
        e.preventDefault();
        break;
        
      case 'f12':
      case 'enter':
        // Take screenshot
        this.takeScreenshot();
        e.preventDefault();
        break;
    }
  }
  
  /**
   * Handle key up event
   * @param {KeyboardEvent} e - Key event
   */
  handleKeyUp(e) {
    this.keys[e.key.toLowerCase()] = false;
    this.keys[e.code] = false;
  }
  
  /**
   * Update photo mode camera and controls
   * @param {number} deltaTime - Time since last frame
   */
  update(deltaTime) {
    if (!this.active) return;
    
    const speed = this.config.cameraSpeed * (deltaTime / 16);
    
    // Camera movement (WASD)
    if (this.keys['w'] || this.keys['arrowup']) {
      this.camera.y -= speed * 3;
    }
    if (this.keys['s'] || this.keys['arrowdown']) {
      this.camera.y += speed * 3;
    }
    if (this.keys['a'] || this.keys['arrowleft']) {
      this.camera.x -= speed * 3;
    }
    if (this.keys['d'] || this.keys['arrowright']) {
      this.camera.x += speed * 3;
    }
    
    // Zoom (Q/E or mouse wheel)
    if (this.keys['q']) {
      this.camera.zoom = Math.max(this.config.minZoom, this.camera.zoom - 0.02);
    }
    if (this.keys['e']) {
      this.camera.zoom = Math.min(this.config.maxZoom, this.camera.zoom + 0.02);
    }
    
    // Camera tilt (Z/X)
    if (this.keys['z']) {
      this.camera.tilt = Math.max(this.config.tiltRange.min, this.camera.tilt - 1);
    }
    if (this.keys['x']) {
      this.camera.tilt = Math.min(this.config.tiltRange.max, this.camera.tilt + 1);
    }
    
    // FOV adjustment ([/])
    if (this.keys['[']) {
      this.camera.fov = Math.max(this.config.fovRange.min, this.camera.fov - 1);
    }
    if (this.keys[']']) {
      this.camera.fov = Math.min(this.config.fovRange.max, this.camera.fov + 1);
    }
    
    // Depth of field focus distance (,/.)
    if (this.depthOfField.enabled) {
      if (this.keys[',']) {
        this.depthOfField.focusDistance = Math.max(50, this.depthOfField.focusDistance - 10);
      }
      if (this.keys['.']) {
        this.depthOfField.focusDistance = Math.min(1000, this.depthOfField.focusDistance + 10);
      }
    }
    
    // Clamp camera position
    if (this.game) {
      this.camera.x = Math.max(0, Math.min(this.game.worldWidth - this.game.canvas.width, this.camera.x));
      this.camera.y = Math.max(0, Math.min(this.game.worldHeight - this.game.canvas.height, this.camera.y));
    }
  }
  
  /**
   * Cycle through filters
   * @param {number} direction - 1 for next, -1 for previous
   */
  cycleFilter(direction) {
    const filters = this.config.filters;
    this.filterIndex = (this.filterIndex + direction + filters.length) % filters.length;
    this.currentFilter = filters[this.filterIndex];
    console.log('Photo Mode: Filter changed to', this.currentFilter);
  }
  
  /**
   * Apply camera transform for rendering
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  applyCameraTransform(ctx) {
    if (!this.active) return;
    
    ctx.save();
    
    // Apply zoom and position
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    
    ctx.translate(centerX, centerY);
    ctx.rotate((this.camera.tilt * Math.PI) / 180);
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(-centerX, -centerY);
    ctx.translate(-this.camera.x, -this.camera.y);
  }
  
  /**
   * Reset camera transform
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  resetCameraTransform(ctx) {
    if (!this.active) return;
    ctx.restore();
  }
  
  /**
   * Apply current filter to canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  applyFilter(ctx) {
    if (!this.active || this.currentFilter === 'none') return;
    
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    
    switch (this.currentFilter) {
      case 'bw':
        this.applyBlackAndWhite(ctx, width, height);
        break;
      case 'sepia':
        this.applySepia(ctx, width, height);
        break;
      case 'contrast':
        this.applyHighContrast(ctx, width, height);
        break;
      case 'vintage':
        this.applyVintage(ctx, width, height);
        break;
      case 'neon':
        this.applyNeonGlow(ctx, width, height);
        break;
      case 'pixel':
        this.applyPixelArt(ctx, width, height);
        break;
      case 'vignette':
        this.applyVignette(ctx, width, height);
        break;
    }
  }
  
  /**
   * Apply black and white filter
   */
  applyBlackAndWhite(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
    
    ctx.putImageData(imageData, 0, 0);
  }
  
  /**
   * Apply sepia filter
   */
  applySepia(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
      data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
      data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    }
    
    ctx.putImageData(imageData, 0, 0);
  }
  
  /**
   * Apply high contrast filter
   */
  applyHighContrast(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const factor = 1.5;
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
      data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
      data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
    }
    
    ctx.putImageData(imageData, 0, 0);
  }
  
  /**
   * Apply vintage filter (warm tones + grain)
   */
  applyVintage(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      // Add warm tint
      data[i] = Math.min(255, data[i] * 1.1);
      data[i + 1] = Math.min(255, data[i + 1] * 0.95);
      data[i + 2] = Math.max(0, data[i + 2] * 0.85);
      
      // Add grain
      const noise = (Math.random() - 0.5) * 30;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Apply slight vignette
    this.applyVignette(ctx, width, height, 0.3);
  }
  
  /**
   * Apply neon glow filter
   */
  applyNeonGlow(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Boost saturation and brightness for neon effect
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const delta = max - min;
      
      if (delta > 50) {
        // Boost the dominant color
        if (r === max) data[i] = Math.min(255, r * 1.3);
        if (g === max) data[i + 1] = Math.min(255, g * 1.3);
        if (b === max) data[i + 2] = Math.min(255, b * 1.3);
        
        // Reduce other colors for more contrast
        if (r !== max) data[i] = Math.max(0, r * 0.7);
        if (g !== max) data[i + 1] = Math.max(0, g * 0.7);
        if (b !== max) data[i + 2] = Math.max(0, b * 0.7);
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }
  
  /**
   * Apply pixel art enhancement filter
   */
  applyPixelArt(ctx, width, height) {
    const pixelSize = 4;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Scale down
    tempCtx.drawImage(ctx.canvas, 0, 0, width / pixelSize, height / pixelSize);
    
    // Scale back up with nearest neighbor
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(tempCanvas, 0, 0, width / pixelSize, height / pixelSize, 0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
  }
  
  /**
   * Apply vignette overlay
   */
  applyVignette(ctx, width, height, intensity = 0.6) {
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, height * 0.3,
      width / 2, height / 2, height * 0.8
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  
  /**
   * Render grid overlay (rule of thirds)
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderGrid(ctx) {
    if (!this.gridVisible) return;
    
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    ctx.beginPath();
    ctx.moveTo(width / 3, 0);
    ctx.lineTo(width / 3, height);
    ctx.moveTo((width * 2) / 3, 0);
    ctx.lineTo((width * 2) / 3, height);
    
    // Horizontal lines
    ctx.moveTo(0, height / 3);
    ctx.lineTo(width, height / 3);
    ctx.moveTo(0, (height * 2) / 3);
    ctx.lineTo(width, (height * 2) / 3);
    
    ctx.stroke();
    ctx.restore();
  }
  
  /**
   * Render photo mode UI
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderUI(ctx) {
    if (!this.active) return;
    
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    // Render grid overlay
    this.renderGrid(ctx);
    
    // Photo mode indicator
    ctx.save();
    
    // Top bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, width, 40);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('📸 PHOTO MODE', 10, 26);
    
    // Current filter
    ctx.textAlign = 'center';
    ctx.fillText(`Filter: ${this.currentFilter.toUpperCase()}`, width / 2, 26);
    
    // Zoom level
    ctx.textAlign = 'right';
    ctx.fillText(`Zoom: ${this.camera.zoom.toFixed(1)}x`, width - 10, 26);
    
    // Controls help (if visible)
    if (this.showControls) {
      const controlsY = height - 180;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(10, controlsY, 280, 170);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      
      const controls = [
        'WASD / Arrows - Move Camera',
        'Q / E - Zoom Out / In',
        'Z / X - Tilt Camera',
        '[ / ] - Adjust FOV',
        'F / G - Cycle Filters',
        'H - Toggle HUD',
        'R - Toggle Grid',
        'B - Toggle Depth of Field',
        'Enter / F12 - Take Screenshot',
        'P / ESC - Exit Photo Mode',
        'T - Toggle This Help'
      ];
      
      controls.forEach((control, i) => {
        ctx.fillText(control, 20, controlsY + 20 + i * 14);
      });
    }
    
    // Camera info
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(width - 160, 50, 150, 100);
    
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    
    const info = [
      `FOV: ${this.camera.fov}°`,
      `Tilt: ${this.camera.tilt}°`,
      `DOF: ${this.depthOfField.enabled ? 'ON' : 'OFF'}`,
      `Grid: ${this.gridVisible ? 'ON' : 'OFF'}`,
      `HUD: ${this.hudVisible ? 'ON' : 'OFF'}`
    ];
    
    info.forEach((line, i) => {
      ctx.fillText(line, width - 150, 68 + i * 18);
    });
    
    ctx.restore();
  }
  
  /**
   * Take a screenshot
   */
  takeScreenshot() {
    if (!this.game || !this.game.canvas) return;
    
    try {
      let canvas = this.game.canvas;
      
      // Handle different resolutions
      if (this.screenshotResolution !== 'native') {
        canvas = this.createScaledCanvas();
      }
      
      // Generate filename with timestamp
      const now = new Date();
      const timestamp = now.toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .slice(0, 19);
      const filename = `WarShooter_${timestamp}.png`;
      
      // Create download link
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
      
      // Add to gallery
      this.addToGallery(dataUrl, filename);
      
      // Flash effect
      this.flashScreen();
      
      console.log('Photo Mode: Screenshot saved as', filename);
    } catch (error) {
      console.error('Photo Mode: Failed to take screenshot', error);
    }
  }
  
  /**
   * Create scaled canvas for higher resolution screenshots
   * @returns {HTMLCanvasElement}
   */
  createScaledCanvas() {
    const scale = this.screenshotResolution === '4k' ? 2 : 1.5;
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = this.game.canvas.width * scale;
    scaledCanvas.height = this.game.canvas.height * scale;
    
    const scaledCtx = scaledCanvas.getContext('2d');
    scaledCtx.scale(scale, scale);
    scaledCtx.drawImage(this.game.canvas, 0, 0);
    
    return scaledCanvas;
  }
  
  /**
   * Flash screen effect when taking screenshot
   */
  flashScreen() {
    if (!this.game || !this.game.canvas) return;
    
    const ctx = this.game.ctx;
    
    // White flash
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
    ctx.restore();
    
    // Fade out quickly
    setTimeout(() => {
      // Flash will be overwritten by next render frame
    }, 50);
  }
  
  /**
   * Add screenshot to gallery
   * @param {string} dataUrl - Screenshot data URL
   * @param {string} filename - Screenshot filename
   */
  addToGallery(dataUrl, filename) {
    this.screenshotGallery.push({
      dataUrl: dataUrl,
      filename: filename,
      timestamp: Date.now()
    });
    
    // Keep only last 20 screenshots
    if (this.screenshotGallery.length > 20) {
      this.screenshotGallery.shift();
    }
    
    this.saveGallery();
  }
  
  /**
   * Load gallery from localStorage
   */
  loadGallery() {
    try {
      const saved = localStorage.getItem('photoModeGallery');
      if (saved) {
        this.screenshotGallery = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load photo gallery:', e);
      this.screenshotGallery = [];
    }
  }
  
  /**
   * Save gallery to localStorage
   */
  saveGallery() {
    try {
      // Only save metadata, not full data URLs (too large)
      const metadata = this.screenshotGallery.map(item => ({
        filename: item.filename,
        timestamp: item.timestamp
      }));
      localStorage.setItem('photoModeGalleryMeta', JSON.stringify(metadata));
    } catch (e) {
      console.warn('Failed to save photo gallery:', e);
    }
  }
  
  /**
   * Get gallery screenshots
   * @returns {Array}
   */
  getGallery() {
    return this.screenshotGallery;
  }
  
  /**
   * Clear gallery
   */
  clearGallery() {
    this.screenshotGallery = [];
    this.saveGallery();
  }
  
  /**
   * Set screenshot resolution
   * @param {string} resolution - 'native', '1080p', or '4k'
   */
  setResolution(resolution) {
    if (['native', '1080p', '4k'].includes(resolution)) {
      this.screenshotResolution = resolution;
    }
  }
  
  /**
   * Check if photo mode is active
   * @returns {boolean}
   */
  isActive() {
    return this.active;
  }
  
  /**
   * Check if game should be paused
   * @returns {boolean}
   */
  isPaused() {
    return this.paused;
  }
  
  /**
   * Should render HUD elements
   * @returns {boolean}
   */
  shouldRenderHUD() {
    return !this.active || this.hudVisible;
  }
  
  /**
   * Should render enemy health bars
   * @returns {boolean}
   */
  shouldRenderEnemyHealthBars() {
    return !this.active || this.enemyHealthBarsVisible;
  }
  
  /**
   * Should render particles
   * @returns {boolean}
   */
  shouldRenderParticles() {
    return !this.active || this.particlesVisible;
  }
}
