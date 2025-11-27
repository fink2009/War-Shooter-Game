/**
 * MovingPlatform - A platform that moves along a path
 * Can carry players and enemies
 */
class MovingPlatform extends Platform {
  /**
   * Create a moving platform
   * @param {number} x - Starting X position
   * @param {number} y - Starting Y position
   * @param {number} width - Platform width (default 128)
   * @param {number} height - Platform height (default 32)
   * @param {Array} waypoints - Array of {x, y} waypoints
   * @param {number} speed - Movement speed (default 2)
   */
  constructor(x, y, width = 128, height = 32, waypoints = [], speed = 2) {
    super(x, y, width, height, 'solid');
    this.type = 'movingPlatform';
    
    // Movement properties
    this.startX = x;
    this.startY = y;
    this.waypoints = waypoints.length > 0 ? waypoints : [
      { x: x, y: y },
      { x: x + 200, y: y }
    ];
    this.currentWaypointIndex = 0;
    this.speed = speed;
    this.paused = false;
    this.pauseTimer = 0;
    this.pauseDuration = 500; // Pause at waypoints
    
    // Path type
    this.pathType = 'linear'; // linear, circular
    this.direction = 1; // 1 = forward, -1 = backward
    
    // Visual
    this.glowColor = '#00aaff';
    this.glowPhase = 0;
    
    // Entities currently on platform
    this.passengers = [];
  }

  /**
   * Set circular path
   * @param {number} centerX - Center X of circle
   * @param {number} centerY - Center Y of circle
   * @param {number} radius - Circle radius
   */
  setCircularPath(centerX, centerY, radius) {
    this.pathType = 'circular';
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    this.angle = 0;
  }

  /**
   * Update platform position
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    const dt = deltaTime / 16;
    const prevX = this.x;
    const prevY = this.y;
    
    // Handle pause at waypoints
    if (this.paused) {
      this.pauseTimer += deltaTime;
      if (this.pauseTimer >= this.pauseDuration) {
        this.paused = false;
        this.pauseTimer = 0;
      }
      return;
    }
    
    if (this.pathType === 'circular') {
      this.updateCircularPath(dt);
    } else {
      this.updateLinearPath(dt);
    }
    
    // Calculate movement delta
    const moveX = this.x - prevX;
    const moveY = this.y - prevY;
    
    // Move passengers with platform
    this.movePassengers(moveX, moveY);
    
    // Update visual glow
    this.glowPhase += deltaTime / 200;
  }

  /**
   * Update linear path movement
   * @param {number} dt - Delta time multiplier
   */
  updateLinearPath(dt) {
    const target = this.waypoints[this.currentWaypointIndex];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < this.speed * dt) {
      // Reached waypoint
      this.x = target.x;
      this.y = target.y;
      
      // Move to next waypoint
      this.currentWaypointIndex += this.direction;
      
      // Reverse direction at ends
      if (this.currentWaypointIndex >= this.waypoints.length) {
        this.currentWaypointIndex = this.waypoints.length - 2;
        this.direction = -1;
      } else if (this.currentWaypointIndex < 0) {
        this.currentWaypointIndex = 1;
        this.direction = 1;
      }
      
      this.paused = true;
    } else {
      // Move towards waypoint
      this.x += (dx / dist) * this.speed * dt;
      this.y += (dy / dist) * this.speed * dt;
    }
  }

  /**
   * Update circular path movement
   * @param {number} dt - Delta time multiplier
   */
  updateCircularPath(dt) {
    this.angle += this.speed * 0.01 * dt;
    if (this.angle > Math.PI * 2) {
      this.angle -= Math.PI * 2;
    }
    
    this.x = this.centerX + Math.cos(this.angle) * this.radius - this.width / 2;
    this.y = this.centerY + Math.sin(this.angle) * this.radius - this.height / 2;
  }

  /**
   * Move passengers with platform
   * @param {number} moveX - X movement
   * @param {number} moveY - Y movement
   */
  movePassengers(moveX, moveY) {
    this.passengers.forEach(passenger => {
      if (passenger.active) {
        passenger.x += moveX;
        passenger.y += moveY;
      }
    });
  }

  /**
   * Add a passenger to the platform
   * @param {Entity} entity - Entity to add
   */
  addPassenger(entity) {
    if (!this.passengers.includes(entity)) {
      this.passengers.push(entity);
    }
  }

  /**
   * Remove a passenger from the platform
   * @param {Entity} entity - Entity to remove
   */
  removePassenger(entity) {
    const index = this.passengers.indexOf(entity);
    if (index > -1) {
      this.passengers.splice(index, 1);
    }
  }

  /**
   * Render the moving platform
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    // Draw glow
    const glowAlpha = 0.3 + Math.sin(this.glowPhase) * 0.1;
    ctx.globalAlpha = glowAlpha;
    ctx.fillStyle = this.glowColor;
    ctx.fillRect(this.x - 3, this.y - 3, this.width + 6, this.height + 6);
    ctx.globalAlpha = 1;
    
    // Draw platform base
    ctx.fillStyle = '#5a6a7a';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Draw metallic surface
    const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    gradient.addColorStop(0, '#8a9aaa');
    gradient.addColorStop(0.5, '#6a7a8a');
    gradient.addColorStop(1, '#4a5a6a');
    ctx.fillStyle = gradient;
    ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
    
    // Draw directional arrows
    ctx.fillStyle = this.glowColor;
    const arrowSpacing = 20;
    for (let i = 0; i < this.width - 20; i += arrowSpacing) {
      const arrowX = this.x + 10 + i;
      const arrowY = this.y + this.height / 2;
      
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY - 4);
      ctx.lineTo(arrowX + 6, arrowY);
      ctx.lineTo(arrowX, arrowY + 4);
      ctx.closePath();
      ctx.fill();
    }
    
    // Draw edge lights
    ctx.fillStyle = this.glowColor;
    ctx.fillRect(this.x, this.y, 4, this.height);
    ctx.fillRect(this.x + this.width - 4, this.y, 4, this.height);
    
    // Draw border
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
}


/**
 * Switch - Interactive element that controls doors
 */
class Switch extends Entity {
  /**
   * Create a switch
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Door} linkedDoor - Door controlled by this switch
   */
  constructor(x, y, linkedDoor = null) {
    super(x, y, 24, 32);
    this.type = 'switch';
    
    this.isOn = false;
    this.linkedDoor = linkedDoor;
    this.toggleCooldown = 500; // ms
    this.lastToggleTime = 0;
    
    // Animation
    this.leverAngle = 0; // -45 to 45 degrees
    this.animating = false;
  }

  /**
   * Link this switch to a door
   * @param {Door} door - Door to control
   */
  linkDoor(door) {
    this.linkedDoor = door;
  }

  /**
   * Toggle the switch state
   * @param {number} currentTime - Current game time
   * @returns {boolean} Whether toggle was successful
   */
  toggle(currentTime) {
    if (currentTime - this.lastToggleTime < this.toggleCooldown) {
      return false;
    }
    
    this.lastToggleTime = currentTime;
    this.isOn = !this.isOn;
    this.animating = true;
    
    // Toggle linked door
    if (this.linkedDoor) {
      this.linkedDoor.toggle();
    }
    
    // Play sound
    if (window.game && window.game.audioManager) {
      window.game.audioManager.playSound('menu_select', 0.5);
    }
    
    return true;
  }

  /**
   * Update switch animation
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    if (this.animating) {
      const targetAngle = this.isOn ? 45 : -45;
      const diff = targetAngle - this.leverAngle;
      
      if (Math.abs(diff) < 2) {
        this.leverAngle = targetAngle;
        this.animating = false;
      } else {
        this.leverAngle += diff * 0.2 * deltaTime / 16;
      }
    }
  }

  /**
   * Render the switch
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    // Draw base
    ctx.fillStyle = '#444444';
    ctx.fillRect(this.x, this.y + 16, this.width, 16);
    
    // Draw base plate
    ctx.fillStyle = '#666666';
    ctx.fillRect(this.x + 2, this.y + 18, this.width - 4, 12);
    
    // Draw lever
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + 20);
    ctx.rotate(this.leverAngle * Math.PI / 180);
    
    // Lever arm
    ctx.fillStyle = '#888888';
    ctx.fillRect(-3, -18, 6, 18);
    
    // Lever handle
    ctx.fillStyle = this.isOn ? '#44ff44' : '#ff4444';
    ctx.beginPath();
    ctx.arc(0, -20, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
    
    // Draw indicator light
    ctx.fillStyle = this.isOn ? '#44ff44' : '#ff4444';
    ctx.fillRect(this.x + this.width / 2 - 3, this.y + 28, 6, 4);
    
    // Draw line to linked door
    if (this.linkedDoor && this.linkedDoor.active) {
      ctx.strokeStyle = this.isOn ? 'rgba(68, 255, 68, 0.3)' : 'rgba(255, 68, 68, 0.2)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(this.x + this.width / 2, this.y + this.height);
      ctx.lineTo(
        this.linkedDoor.x + this.linkedDoor.width / 2,
        this.linkedDoor.y + this.linkedDoor.height / 2
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Draw border
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y + 16, this.width, 16);
  }
}


/**
 * Door - Blocking element controlled by switches
 */
class Door extends Entity {
  /**
   * Create a door
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Door width (default 20)
   * @param {number} height - Door height (default 80)
   */
  constructor(x, y, width = 20, height = 80) {
    super(x, y, width, height);
    this.type = 'door';
    
    this.isOpen = false;
    this.openProgress = 0; // 0 = closed, 1 = open
    this.openSpeed = 0.05;
    
    // Visual
    this.color = '#666666';
    this.frameColor = '#444444';
  }

  /**
   * Toggle door open/close state
   */
  toggle() {
    this.isOpen = !this.isOpen;
  }

  /**
   * Update door animation
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    const targetProgress = this.isOpen ? 1 : 0;
    const diff = targetProgress - this.openProgress;
    
    if (Math.abs(diff) > 0.01) {
      this.openProgress += diff * this.openSpeed * deltaTime / 16;
    } else {
      this.openProgress = targetProgress;
    }
  }

  /**
   * Get collision bounds (shrinks when opening)
   * @returns {Object} Bounds object
   */
  getBounds() {
    // When fully open, door has no collision
    if (this.openProgress >= 0.95) {
      return {
        left: this.x,
        right: this.x,
        top: this.y,
        bottom: this.y
      };
    }
    
    const openHeight = this.height * this.openProgress;
    return {
      left: this.x,
      right: this.x + this.width,
      top: this.y + openHeight,
      bottom: this.y + this.height
    };
  }

  /**
   * Render the door
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    // Draw door frame
    ctx.fillStyle = this.frameColor;
    ctx.fillRect(this.x - 4, this.y - 4, this.width + 8, 8);
    ctx.fillRect(this.x - 4, this.y, 4, this.height);
    ctx.fillRect(this.x + this.width, this.y, 4, this.height);
    
    // Draw door (slides up)
    const openOffset = this.height * this.openProgress;
    const doorHeight = this.height - openOffset;
    
    if (doorHeight > 0) {
      // Door body
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y + openOffset, this.width, doorHeight);
      
      // Door panels
      ctx.fillStyle = '#555555';
      const panelHeight = doorHeight / 3;
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(
          this.x + 3,
          this.y + openOffset + i * panelHeight + 3,
          this.width - 6,
          panelHeight - 6
        );
      }
      
      // Door highlight
      ctx.fillStyle = '#777777';
      ctx.fillRect(this.x, this.y + openOffset, 3, doorHeight);
      
      // Door shadow
      ctx.fillStyle = '#444444';
      ctx.fillRect(this.x + this.width - 3, this.y + openOffset, 3, doorHeight);
      
      // Border
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1;
      ctx.strokeRect(this.x, this.y + openOffset, this.width, doorHeight);
    }
    
    // Draw open indicator (gap at top when opening)
    if (openOffset > 0) {
      ctx.fillStyle = '#222222';
      ctx.fillRect(this.x, this.y, this.width, Math.min(openOffset, 10));
    }
  }
}


/**
 * JumpPad - Launches entities upward
 */
class JumpPad extends Entity {
  /**
   * Create a jump pad
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} boostStrength - Vertical boost (default 300)
   */
  constructor(x, y, boostStrength = 300) {
    super(x, y, 48, 16);
    this.type = 'jumpPad';
    
    this.boostStrength = boostStrength;
    this.cooldown = 500; // ms
    this.lastActivationTime = 0;
    this.isReady = true;
    
    // Animation
    this.compressionAmount = 0;
    this.glowPhase = 0;
  }

  /**
   * Activate the jump pad for an entity
   * @param {Entity} entity - Entity to launch
   * @param {number} currentTime - Current game time
   * @returns {boolean} Whether activation was successful
   */
  activate(entity, currentTime) {
    if (!this.isReady || currentTime - this.lastActivationTime < this.cooldown) {
      return false;
    }
    
    this.lastActivationTime = currentTime;
    this.isReady = false;
    this.compressionAmount = 1;
    
    // Apply vertical boost
    if (entity.dy !== undefined) {
      entity.dy = -this.boostStrength / 20; // Normalize to game units
    }
    if (entity.onGround !== undefined) {
      entity.onGround = false;
    }
    
    // Play sound
    if (window.game && window.game.audioManager) {
      window.game.audioManager.playSound('jump', 0.6);
    }
    
    // Create launch particles
    if (window.game && window.game.particleSystem) {
      window.game.particleSystem.createExplosion(
        this.x + this.width / 2,
        this.y,
        15,
        '#00ffff'
      );
    }
    
    // Reset ready state after cooldown
    setTimeout(() => {
      this.isReady = true;
    }, this.cooldown);
    
    return true;
  }

  /**
   * Update jump pad animation
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    // Update compression animation
    if (this.compressionAmount > 0) {
      this.compressionAmount -= 0.1 * deltaTime / 16;
      if (this.compressionAmount < 0) {
        this.compressionAmount = 0;
      }
    }
    
    // Update glow
    this.glowPhase += deltaTime / 150;
  }

  /**
   * Render the jump pad
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    const compression = this.compressionAmount * 5;
    
    // Draw glow when ready
    if (this.isReady) {
      const glowAlpha = 0.3 + Math.sin(this.glowPhase) * 0.15;
      ctx.globalAlpha = glowAlpha;
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(this.x - 4, this.y - 4 + compression, this.width + 8, this.height + 8);
      ctx.globalAlpha = 1;
    }
    
    // Draw base
    ctx.fillStyle = '#333333';
    ctx.fillRect(this.x, this.y + compression, this.width, this.height);
    
    // Draw pad surface
    const padColor = this.isReady ? '#00aaff' : '#666666';
    ctx.fillStyle = padColor;
    ctx.fillRect(this.x + 2, this.y + 2 + compression, this.width - 4, this.height - 4);
    
    // Draw arrows
    ctx.fillStyle = this.isReady ? '#ffffff' : '#888888';
    const arrowCount = 3;
    const arrowWidth = 8;
    const spacing = (this.width - arrowCount * arrowWidth) / (arrowCount + 1);
    
    for (let i = 0; i < arrowCount; i++) {
      const arrowX = this.x + spacing * (i + 1) + arrowWidth * i + arrowWidth / 2;
      const arrowY = this.y + this.height / 2 + compression;
      
      ctx.beginPath();
      ctx.moveTo(arrowX - 4, arrowY + 3);
      ctx.lineTo(arrowX, arrowY - 4);
      ctx.lineTo(arrowX + 4, arrowY + 3);
      ctx.closePath();
      ctx.fill();
    }
    
    // Draw border
    ctx.strokeStyle = this.isReady ? '#00ffff' : '#444444';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y + compression, this.width, this.height);
    
    // Draw corner lights
    if (this.isReady) {
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(this.x, this.y + compression, 4, 4);
      ctx.fillRect(this.x + this.width - 4, this.y + compression, 4, 4);
    }
  }
}
