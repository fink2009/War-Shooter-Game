// Touch Input Manager for mobile support
// Provides virtual joystick and action buttons for touch-screen devices
class TouchInputManager {
  constructor() {
    this.enabled = false;
    this.isTouchDevice = false;
    
    // Touch configuration from GameConfig
    this.config = typeof GameConfig !== 'undefined' && GameConfig.TOUCH_CONTROLS ? 
      GameConfig.TOUCH_CONTROLS : {
        joystickRadius: 150,
        stickRadius: 50,
        buttonSize: 80,
        opacity: 0.7,
        autoAim: true,
        autoAimStrength: 0.3,
        deadzone: 0.15,
        vibrationEnabled: true
      };
    
    // Virtual joystick state (left side - movement)
    this.moveJoystick = {
      active: false,
      touchId: null,
      baseX: 0,
      baseY: 0,
      stickX: 0,
      stickY: 0,
      angle: 0,
      magnitude: 0
    };
    
    // Aim joystick state (right side - optional)
    this.aimJoystick = {
      active: false,
      touchId: null,
      baseX: 0,
      baseY: 0,
      stickX: 0,
      stickY: 0,
      angle: 0,
      magnitude: 0
    };
    
    // Action buttons state
    this.buttons = {
      fire: { pressed: false, x: 0, y: 0, size: this.config.buttonSize, touchId: null },
      dodge: { pressed: false, x: 0, y: 0, size: this.config.buttonSize * 0.8, touchId: null },
      ability: { pressed: false, x: 0, y: 0, size: this.config.buttonSize * 0.8, touchId: null },
      reload: { pressed: false, x: 0, y: 0, size: this.config.buttonSize * 0.7, touchId: null },
      weaponPrev: { pressed: false, x: 0, y: 0, size: this.config.buttonSize * 0.6, touchId: null },
      weaponNext: { pressed: false, x: 0, y: 0, size: this.config.buttonSize * 0.6, touchId: null },
      jump: { pressed: false, x: 0, y: 0, size: this.config.buttonSize * 0.9, touchId: null },
      menu: { pressed: false, x: 0, y: 0, size: this.config.buttonSize * 0.6, touchId: null }
    };
    
    // Gesture detection
    this.gestures = {
      pinchStartDistance: 0,
      pinchScale: 1,
      twoFingerSwipe: { active: false, startX: 0, startY: 0 },
      longPressTimer: null,
      longPressTriggered: false
    };
    
    // Auto-aim target
    this.autoAimTarget = null;
    
    // Canvas reference
    this.canvas = null;
    
    // Preferences
    this.preferences = {
      opacity: this.config.opacity,
      buttonScale: 1.0,
      dualStickMode: false,
      hapticFeedback: true
    };
    
    this.loadPreferences();
  }
  
  /**
   * Initialize touch input manager
   * @param {HTMLCanvasElement} canvas - Game canvas element
   */
  init(canvas) {
    this.canvas = canvas;
    this.detectTouchDevice();
    
    if (this.isTouchDevice) {
      this.enabled = true;
      this.setupEventListeners();
      this.positionButtons();
    }
    
    // Also listen for device orientation changes
    window.addEventListener('resize', () => this.positionButtons());
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.positionButtons(), 100);
    });
  }
  
  /**
   * Detect if device supports touch
   */
  detectTouchDevice() {
    this.isTouchDevice = ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      (navigator.msMaxTouchPoints > 0);
      
    // Also check for mobile user agent as fallback
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    if (mobileRegex.test(navigator.userAgent)) {
      this.isTouchDevice = true;
    }
  }
  
  /**
   * Set up touch event listeners
   */
  setupEventListeners() {
    if (!this.canvas) return;
    
    // Touch events
    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
    this.canvas.addEventListener('touchcancel', (e) => this.handleTouchEnd(e), { passive: false });
    
    // Prevent default touch behaviors that interfere with game
    document.body.addEventListener('touchmove', (e) => {
      if (e.target === this.canvas) {
        e.preventDefault();
      }
    }, { passive: false });
  }
  
  /**
   * Position buttons based on screen size and orientation
   */
  positionButtons() {
    if (!this.canvas) return;
    
    const w = this.canvas.width;
    const h = this.canvas.height;
    const btnSize = this.config.buttonSize * this.preferences.buttonScale;
    const padding = 20;
    
    // Left side - movement joystick area
    this.moveJoystick.baseX = this.config.joystickRadius + padding;
    this.moveJoystick.baseY = h - this.config.joystickRadius - padding;
    
    // Right side - buttons
    // Fire button (large, bottom-right)
    this.buttons.fire.x = w - btnSize - padding;
    this.buttons.fire.y = h - btnSize - padding;
    this.buttons.fire.size = btnSize;
    
    // Jump button (above fire)
    this.buttons.jump.x = w - btnSize * 2 - padding * 2;
    this.buttons.jump.y = h - btnSize - padding;
    this.buttons.jump.size = btnSize * 0.9;
    
    // Dodge button (above fire)
    this.buttons.dodge.x = w - btnSize - padding;
    this.buttons.dodge.y = h - btnSize * 2 - padding * 2;
    this.buttons.dodge.size = btnSize * 0.8;
    
    // Ability button (top-right area)
    this.buttons.ability.x = w - btnSize * 2 - padding * 2;
    this.buttons.ability.y = h - btnSize * 2 - padding * 2;
    this.buttons.ability.size = btnSize * 0.8;
    
    // Reload button (middle right)
    this.buttons.reload.x = w - btnSize * 0.8 - padding;
    this.buttons.reload.y = h / 2;
    this.buttons.reload.size = btnSize * 0.7;
    
    // Weapon switch buttons (left edge, middle)
    this.buttons.weaponPrev.x = padding;
    this.buttons.weaponPrev.y = h / 2 - btnSize * 0.4;
    this.buttons.weaponPrev.size = btnSize * 0.6;
    
    this.buttons.weaponNext.x = padding;
    this.buttons.weaponNext.y = h / 2 + btnSize * 0.4;
    this.buttons.weaponNext.size = btnSize * 0.6;
    
    // Menu button (top right)
    this.buttons.menu.x = w - btnSize * 0.6 - padding;
    this.buttons.menu.y = padding;
    this.buttons.menu.size = btnSize * 0.6;
    
    // Right side - aim joystick (if dual stick mode)
    if (this.preferences.dualStickMode) {
      this.aimJoystick.baseX = w - this.config.joystickRadius - padding;
      this.aimJoystick.baseY = h - this.config.joystickRadius - padding;
    }
  }
  
  /**
   * Handle touch start event
   * @param {TouchEvent} e - Touch event
   */
  handleTouchStart(e) {
    e.preventDefault();
    
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    for (const touch of e.changedTouches) {
      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;
      
      // Check buttons first
      let buttonPressed = false;
      for (const [key, button] of Object.entries(this.buttons)) {
        if (this.isPointInButton(x, y, button)) {
          button.pressed = true;
          button.touchId = touch.identifier;
          buttonPressed = true;
          this.triggerHapticFeedback('light');
          break;
        }
      }
      
      if (buttonPressed) continue;
      
      // Check joysticks
      const isLeftSide = x < this.canvas.width / 2;
      
      if (isLeftSide && !this.moveJoystick.active) {
        // Movement joystick
        this.moveJoystick.active = true;
        this.moveJoystick.touchId = touch.identifier;
        this.moveJoystick.baseX = x;
        this.moveJoystick.baseY = y;
        this.moveJoystick.stickX = x;
        this.moveJoystick.stickY = y;
      } else if (!isLeftSide && this.preferences.dualStickMode && !this.aimJoystick.active) {
        // Aim joystick (dual stick mode)
        this.aimJoystick.active = true;
        this.aimJoystick.touchId = touch.identifier;
        this.aimJoystick.baseX = x;
        this.aimJoystick.baseY = y;
        this.aimJoystick.stickX = x;
        this.aimJoystick.stickY = y;
      }
    }
    
    // Check for gestures (pinch, two-finger swipe)
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      this.gestures.pinchStartDistance = Math.sqrt(dx * dx + dy * dy);
      this.gestures.twoFingerSwipe.active = true;
      this.gestures.twoFingerSwipe.startX = (touch1.clientX + touch2.clientX) / 2;
      this.gestures.twoFingerSwipe.startY = (touch1.clientY + touch2.clientY) / 2;
    }
    
    // Long press detection
    if (e.touches.length === 1) {
      this.gestures.longPressTriggered = false;
      this.gestures.longPressTimer = setTimeout(() => {
        this.gestures.longPressTriggered = true;
        this.onLongPress(e.touches[0]);
      }, 500);
    }
  }
  
  /**
   * Handle touch move event
   * @param {TouchEvent} e - Touch event
   */
  handleTouchMove(e) {
    e.preventDefault();
    
    // Cancel long press on move
    if (this.gestures.longPressTimer) {
      clearTimeout(this.gestures.longPressTimer);
      this.gestures.longPressTimer = null;
    }
    
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    for (const touch of e.changedTouches) {
      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;
      
      // Update movement joystick
      if (this.moveJoystick.active && this.moveJoystick.touchId === touch.identifier) {
        this.updateJoystick(this.moveJoystick, x, y);
      }
      
      // Update aim joystick
      if (this.aimJoystick.active && this.aimJoystick.touchId === touch.identifier) {
        this.updateJoystick(this.aimJoystick, x, y);
      }
    }
    
    // Handle pinch gesture
    if (e.touches.length === 2 && this.gestures.pinchStartDistance > 0) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      this.gestures.pinchScale = distance / this.gestures.pinchStartDistance;
    }
  }
  
  /**
   * Handle touch end event
   * @param {TouchEvent} e - Touch event
   */
  handleTouchEnd(e) {
    e.preventDefault();
    
    // Cancel long press
    if (this.gestures.longPressTimer) {
      clearTimeout(this.gestures.longPressTimer);
      this.gestures.longPressTimer = null;
    }
    
    for (const touch of e.changedTouches) {
      // Release buttons
      for (const button of Object.values(this.buttons)) {
        if (button.touchId === touch.identifier) {
          button.pressed = false;
          button.touchId = null;
        }
      }
      
      // Release joysticks
      if (this.moveJoystick.touchId === touch.identifier) {
        this.moveJoystick.active = false;
        this.moveJoystick.touchId = null;
        this.moveJoystick.stickX = this.moveJoystick.baseX;
        this.moveJoystick.stickY = this.moveJoystick.baseY;
        this.moveJoystick.magnitude = 0;
      }
      
      if (this.aimJoystick.touchId === touch.identifier) {
        this.aimJoystick.active = false;
        this.aimJoystick.touchId = null;
        this.aimJoystick.stickX = this.aimJoystick.baseX;
        this.aimJoystick.stickY = this.aimJoystick.baseY;
        this.aimJoystick.magnitude = 0;
      }
    }
    
    // Reset gestures if no more touches
    if (e.touches.length < 2) {
      this.gestures.pinchStartDistance = 0;
      this.gestures.pinchScale = 1;
      this.gestures.twoFingerSwipe.active = false;
    }
  }
  
  /**
   * Update joystick position and calculate angle/magnitude
   * @param {Object} joystick - Joystick object
   * @param {number} x - Touch X position
   * @param {number} y - Touch Y position
   */
  updateJoystick(joystick, x, y) {
    const dx = x - joystick.baseX;
    const dy = y - joystick.baseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = this.config.joystickRadius;
    
    if (distance > maxDistance) {
      // Clamp to max radius
      const ratio = maxDistance / distance;
      joystick.stickX = joystick.baseX + dx * ratio;
      joystick.stickY = joystick.baseY + dy * ratio;
    } else {
      joystick.stickX = x;
      joystick.stickY = y;
    }
    
    // Calculate magnitude (0-1)
    joystick.magnitude = Math.min(distance / maxDistance, 1);
    
    // Apply deadzone
    if (joystick.magnitude < this.config.deadzone) {
      joystick.magnitude = 0;
    } else {
      // Remap magnitude to account for deadzone
      joystick.magnitude = (joystick.magnitude - this.config.deadzone) / (1 - this.config.deadzone);
    }
    
    // Calculate angle
    joystick.angle = Math.atan2(dy, dx);
  }
  
  /**
   * Check if point is inside a button
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Object} button - Button object
   * @returns {boolean}
   */
  isPointInButton(x, y, button) {
    const dx = x - button.x;
    const dy = y - button.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= button.size / 2;
  }
  
  /**
   * Handle long press gesture
   * @param {Touch} touch - Touch object
   */
  onLongPress(touch) {
    this.triggerHapticFeedback('medium');
    // Long press can be used for interact action
  }
  
  /**
   * Trigger haptic feedback if supported
   * @param {string} intensity - 'light', 'medium', 'heavy'
   */
  triggerHapticFeedback(intensity) {
    if (!this.preferences.hapticFeedback) return;
    if (!this.config.vibrationEnabled) return;
    
    if ('vibrate' in navigator) {
      const durations = { light: 10, medium: 25, heavy: 50 };
      navigator.vibrate(durations[intensity] || 10);
    }
  }
  
  /**
   * Get movement input from joystick
   * @returns {Object} { x, y, magnitude }
   */
  getMovementInput() {
    if (!this.enabled || !this.moveJoystick.active) {
      return { x: 0, y: 0, magnitude: 0 };
    }
    
    return {
      x: Math.cos(this.moveJoystick.angle) * this.moveJoystick.magnitude,
      y: Math.sin(this.moveJoystick.angle) * this.moveJoystick.magnitude,
      magnitude: this.moveJoystick.magnitude
    };
  }
  
  /**
   * Get aim input from joystick or auto-aim
   * @param {Array} enemies - Array of enemy entities for auto-aim
   * @param {Object} player - Player entity for auto-aim reference
   * @returns {Object} { x, y, angle, usingAutoAim }
   */
  getAimInput(enemies, player) {
    if (!this.enabled) {
      return { x: 0, y: 0, angle: 0, usingAutoAim: false };
    }
    
    // Dual stick mode
    if (this.preferences.dualStickMode && this.aimJoystick.active) {
      return {
        x: Math.cos(this.aimJoystick.angle),
        y: Math.sin(this.aimJoystick.angle),
        angle: this.aimJoystick.angle,
        usingAutoAim: false
      };
    }
    
    // Auto-aim mode
    if (this.config.autoAim && enemies && player) {
      const target = this.findAutoAimTarget(enemies, player);
      if (target) {
        const dx = target.x + target.width / 2 - (player.x + player.width / 2);
        const dy = target.y + target.height / 2 - (player.y + player.height / 2);
        const angle = Math.atan2(dy, dx);
        return {
          x: Math.cos(angle),
          y: Math.sin(angle),
          angle: angle,
          usingAutoAim: true,
          target: target
        };
      }
    }
    
    // Default: aim in movement direction
    if (this.moveJoystick.active && this.moveJoystick.magnitude > 0.3) {
      return {
        x: Math.cos(this.moveJoystick.angle),
        y: Math.sin(this.moveJoystick.angle),
        angle: this.moveJoystick.angle,
        usingAutoAim: false
      };
    }
    
    return { x: 1, y: 0, angle: 0, usingAutoAim: false };
  }
  
  /**
   * Find closest enemy for auto-aim
   * @param {Array} enemies - Array of enemy entities
   * @param {Object} player - Player entity
   * @returns {Object|null} Target enemy or null
   */
  findAutoAimTarget(enemies, player) {
    if (!enemies || !player) return null;
    
    let closestEnemy = null;
    let closestDistance = Infinity;
    const maxAutoAimRange = 400;
    
    for (const enemy of enemies) {
      if (!enemy.active || enemy.health <= 0) continue;
      
      const dx = enemy.x + enemy.width / 2 - (player.x + player.width / 2);
      const dy = enemy.y + enemy.height / 2 - (player.y + player.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Only consider enemies in front of player (based on facing)
      const inFront = (player.facing > 0 && dx > 0) || (player.facing < 0 && dx < 0);
      
      if (distance < closestDistance && distance < maxAutoAimRange && inFront) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    }
    
    // Apply sticky targeting - prefer current target if still valid
    if (this.autoAimTarget && this.autoAimTarget.active && this.autoAimTarget.health > 0) {
      const currentDx = this.autoAimTarget.x - player.x;
      const currentDy = this.autoAimTarget.y - player.y;
      const currentDistance = Math.sqrt(currentDx * currentDx + currentDy * currentDy);
      
      // Stick to current target unless new target is significantly closer
      if (currentDistance < maxAutoAimRange && (!closestEnemy || closestDistance > currentDistance * 0.7)) {
        return this.autoAimTarget;
      }
    }
    
    this.autoAimTarget = closestEnemy;
    return closestEnemy;
  }
  
  /**
   * Check if a button is pressed
   * @param {string} buttonName - Button name
   * @returns {boolean}
   */
  isButtonPressed(buttonName) {
    return this.enabled && this.buttons[buttonName] && this.buttons[buttonName].pressed;
  }
  
  /**
   * Get pinch scale for zoom
   * @returns {number}
   */
  getPinchScale() {
    return this.gestures.pinchScale;
  }
  
  /**
   * Check if long press was triggered
   * @returns {boolean}
   */
  wasLongPressTriggered() {
    const triggered = this.gestures.longPressTriggered;
    this.gestures.longPressTriggered = false;
    return triggered;
  }
  
  /**
   * Render touch controls
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    if (!this.enabled) return;
    
    ctx.save();
    ctx.globalAlpha = this.preferences.opacity;
    
    // Draw movement joystick
    this.renderJoystick(ctx, this.moveJoystick, true);
    
    // Draw aim joystick (if dual stick mode)
    if (this.preferences.dualStickMode) {
      this.renderJoystick(ctx, this.aimJoystick, false);
    }
    
    // Draw buttons
    this.renderButton(ctx, this.buttons.fire, '🔥', '#ff4444');
    this.renderButton(ctx, this.buttons.jump, '⬆️', '#44ff44');
    this.renderButton(ctx, this.buttons.dodge, '💨', '#44aaff');
    this.renderButton(ctx, this.buttons.ability, '⚡', '#ffaa00');
    this.renderButton(ctx, this.buttons.reload, 'R', '#888888');
    this.renderButton(ctx, this.buttons.weaponPrev, '◀', '#666666');
    this.renderButton(ctx, this.buttons.weaponNext, '▶', '#666666');
    this.renderButton(ctx, this.buttons.menu, '☰', '#444444');
    
    ctx.restore();
  }
  
  /**
   * Render a joystick
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} joystick - Joystick object
   * @param {boolean} isMovement - Whether this is the movement joystick
   */
  renderJoystick(ctx, joystick, isMovement) {
    const baseColor = isMovement ? '#3388ff' : '#ff8833';
    const stickColor = isMovement ? '#66aaff' : '#ffaa66';
    
    // Draw base circle
    ctx.beginPath();
    ctx.arc(joystick.baseX, joystick.baseY, this.config.joystickRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw direction indicators
    if (joystick.active) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const innerR = this.config.joystickRadius * 0.3;
        const outerR = this.config.joystickRadius * 0.5;
        ctx.beginPath();
        ctx.moveTo(
          joystick.baseX + Math.cos(angle) * innerR,
          joystick.baseY + Math.sin(angle) * innerR
        );
        ctx.lineTo(
          joystick.baseX + Math.cos(angle) * outerR,
          joystick.baseY + Math.sin(angle) * outerR
        );
        ctx.stroke();
      }
    }
    
    // Draw stick
    const stickX = joystick.active ? joystick.stickX : joystick.baseX;
    const stickY = joystick.active ? joystick.stickY : joystick.baseY;
    
    // Glow effect when active
    if (joystick.active) {
      ctx.beginPath();
      ctx.arc(stickX, stickY, this.config.stickRadius + 10, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(
        stickX, stickY, 0,
        stickX, stickY, this.config.stickRadius + 10
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    
    ctx.beginPath();
    ctx.arc(stickX, stickY, this.config.stickRadius, 0, Math.PI * 2);
    ctx.fillStyle = stickColor;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  /**
   * Render an action button
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} button - Button object
   * @param {string} icon - Button icon/text
   * @param {string} color - Button color
   */
  renderButton(ctx, button, icon, color) {
    const radius = button.size / 2;
    
    // Draw button background
    ctx.beginPath();
    ctx.arc(button.x, button.y, radius, 0, Math.PI * 2);
    
    if (button.pressed) {
      ctx.fillStyle = color;
    } else {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    }
    ctx.fill();
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw icon
    ctx.fillStyle = button.pressed ? '#000000' : '#ffffff';
    ctx.font = `${radius}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, button.x, button.y);
  }
  
  /**
   * Load preferences from localStorage
   */
  loadPreferences() {
    try {
      const saved = localStorage.getItem('touchControlPreferences');
      if (saved) {
        const prefs = JSON.parse(saved);
        this.preferences = { ...this.preferences, ...prefs };
      }
    } catch (e) {
      console.warn('Failed to load touch control preferences:', e);
    }
  }
  
  /**
   * Save preferences to localStorage
   */
  savePreferences() {
    try {
      localStorage.setItem('touchControlPreferences', JSON.stringify(this.preferences));
    } catch (e) {
      console.warn('Failed to save touch control preferences:', e);
    }
  }
  
  /**
   * Set button opacity
   * @param {number} opacity - Opacity value (0-1)
   */
  setOpacity(opacity) {
    this.preferences.opacity = Math.max(0.5, Math.min(1, opacity));
    this.savePreferences();
  }
  
  /**
   * Set button scale
   * @param {number} scale - Scale value (0.5-2)
   */
  setButtonScale(scale) {
    this.preferences.buttonScale = Math.max(0.5, Math.min(2, scale));
    this.positionButtons();
    this.savePreferences();
  }
  
  /**
   * Toggle dual stick mode
   * @param {boolean} enabled - Whether to enable dual stick mode
   */
  setDualStickMode(enabled) {
    this.preferences.dualStickMode = enabled;
    this.positionButtons();
    this.savePreferences();
  }
  
  /**
   * Toggle haptic feedback
   * @param {boolean} enabled - Whether to enable haptic feedback
   */
  setHapticFeedback(enabled) {
    this.preferences.hapticFeedback = enabled;
    this.savePreferences();
  }
  
  /**
   * Enable/disable touch controls
   * @param {boolean} enabled - Whether to enable touch controls
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }
  
  /**
   * Check if touch controls are enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled && this.isTouchDevice;
  }
}
