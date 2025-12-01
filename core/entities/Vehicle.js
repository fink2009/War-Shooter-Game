/**
 * Vehicle - Base class for drivable vehicles
 * Supports enter/exit, fuel system, damage, and explosive destruction
 */
class Vehicle extends Entity {
  /**
   * Create a new vehicle
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Vehicle width
   * @param {number} height - Vehicle height
   * @param {string} vehicleType - Type of vehicle (TANK, JEEP)
   */
  constructor(x, y, width, height, vehicleType = 'JEEP') {
    super(x, y, width, height);
    
    this.type = 'vehicle';
    this.vehicleType = vehicleType;
    
    // Get config
    const vehicleConfig = typeof GameConfig !== 'undefined' && GameConfig.VEHICLES ?
      GameConfig.VEHICLES : this.getDefaultConfig();
    const typeConfig = vehicleConfig[vehicleType] || vehicleConfig.JEEP;
    
    // Stats from config
    this.maxHealth = typeConfig.health || 200;
    this.health = this.maxHealth;
    this.speed = typeConfig.speed || 200;
    this.armorReduction = typeConfig.armorReduction || 0.25;
    this.fuelCapacity = typeConfig.fuelCapacity || 80;
    this.fuel = this.fuelCapacity;
    this.fuelConsumption = typeConfig.fuelConsumption || 3;
    this.seats = typeConfig.seats || 1;
    
    // State
    this.driver = null;
    this.passengers = [];
    this.facing = 1; // 1 = right, -1 = left
    this.dx = 0;
    this.dy = 0;
    this.onGround = false;
    this.gravity = 0.6;
    
    // Combat
    this.lastFireTime = 0;
    this.isDestroyed = false;
    this.explosionTriggered = false;
    
    // Visual
    this.color = '#556b2f';
    this.damageSmokeTimer = 0;
  }

  /**
   * Get default vehicle configuration
   * @returns {Object} Default config
   */
  getDefaultConfig() {
    return {
      TANK: { health: 500, speed: 100, armorReduction: 0.75, fuelCapacity: 100 },
      JEEP: { health: 200, speed: 300, armorReduction: 0.25, fuelCapacity: 80, seats: 2 },
      enterExitKey: 'y',
      explosionRadius: 150,
      explosionDamage: 100
    };
  }

  /**
   * Check if the vehicle can be entered
   * @returns {boolean} True if vehicle can be entered
   */
  canEnter() {
    return !this.isDestroyed && this.health > 0 && !this.driver;
  }

  /**
   * Enter the vehicle as driver
   * @param {Object} entity - Entity entering the vehicle
   * @returns {boolean} True if entry was successful
   */
  enter(entity) {
    if (!this.canEnter()) return false;
    
    this.driver = entity;
    entity.isInVehicle = true;
    entity.currentVehicle = this;
    
    // Hide the entity (they're inside the vehicle)
    entity.visible = false;
    
    return true;
  }

  /**
   * Exit the vehicle
   * @param {Object} entity - Entity exiting
   * @returns {boolean} True if exit was successful
   */
  exit(entity) {
    if (!entity) return false;
    
    if (this.driver === entity) {
      this.driver = null;
      entity.isInVehicle = false;
      entity.currentVehicle = null;
      entity.visible = true;
      
      // Position entity beside the vehicle
      entity.x = this.x + (this.facing > 0 ? this.width + 10 : -entity.width - 10);
      entity.y = this.y + this.height - entity.height;
      
      return true;
    }
    
    // Check passengers
    const passengerIndex = this.passengers.indexOf(entity);
    if (passengerIndex !== -1) {
      this.passengers.splice(passengerIndex, 1);
      entity.isInVehicle = false;
      entity.currentVehicle = null;
      entity.visible = true;
      entity.x = this.x + (this.facing > 0 ? this.width + 10 : -entity.width - 10);
      entity.y = this.y + this.height - entity.height;
      return true;
    }
    
    return false;
  }

  /**
   * Take damage (reduced by armor)
   * @param {number} amount - Damage amount
   * @returns {boolean} True if vehicle was destroyed
   */
  takeDamage(amount) {
    if (this.isDestroyed) return false;
    
    // Apply armor reduction
    const actualDamage = amount * (1 - this.armorReduction);
    this.health -= actualDamage;
    
    if (this.health <= 0) {
      this.health = 0;
      this.destroy();
      return true;
    }
    
    return false;
  }

  /**
   * Consume fuel
   * @param {number} deltaTime - Time since last update in ms
   * @returns {boolean} True if fuel is available
   */
  consumeFuel(deltaTime) {
    if (this.fuel <= 0) return false;
    
    const consumption = this.fuelConsumption * (deltaTime / 1000);
    this.fuel = Math.max(0, this.fuel - consumption);
    
    return this.fuel > 0;
  }

  /**
   * Refuel the vehicle
   * @param {number} amount - Amount of fuel to add
   */
  refuel(amount) {
    this.fuel = Math.min(this.fuelCapacity, this.fuel + amount);
  }

  /**
   * Repair the vehicle
   * @param {number} amount - Amount of health to restore
   */
  repair(amount) {
    if (!this.isDestroyed) {
      this.health = Math.min(this.maxHealth, this.health + amount);
    }
  }

  /**
   * Update the vehicle
   * @param {number} deltaTime - Time since last update in ms
   * @param {Object} inputManager - Input manager for controls
   * @param {number} groundLevel - Ground Y position
   * @param {number} worldWidth - World width for bounds
   */
  update(deltaTime, inputManager, groundLevel, worldWidth) {
    if (this.isDestroyed) return;
    
    const dt = deltaTime / 16;
    
    // Handle driver controls
    if (this.driver && inputManager) {
      this.handleControls(deltaTime, inputManager);
    } else {
      // Decelerate when no driver
      this.dx *= 0.95;
    }
    
    // Apply movement
    this.x += this.dx * dt;
    
    // Clamp to world bounds
    if (worldWidth) {
      this.x = Math.max(0, Math.min(worldWidth - this.width, this.x));
    }
    
    // Apply gravity
    this.dy += this.gravity * dt;
    this.y += this.dy * dt;
    
    // Ground collision
    if (groundLevel && this.y + this.height >= groundLevel) {
      this.y = groundLevel - this.height;
      this.dy = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }
    
    // Damage smoke effect timer
    if (this.health < this.maxHealth * 0.5) {
      this.damageSmokeTimer += deltaTime;
    }
    
    // Move driver and passengers with vehicle
    if (this.driver) {
      this.driver.x = this.x + this.width / 2 - this.driver.width / 2;
      this.driver.y = this.y;
    }
  }

  /**
   * Handle driver controls
   * @param {number} deltaTime - Time since last update in ms
   * @param {Object} inputManager - Input manager
   */
  handleControls(deltaTime, inputManager) {
    // Check fuel
    if (this.fuel <= 0) {
      this.dx *= 0.95;
      return;
    }
    
    // Movement
    const moveSpeed = this.speed / 60; // Convert to pixels per frame
    
    if (inputManager.isKeyPressed('ArrowLeft') || inputManager.isKeyPressed('a')) {
      this.dx = -moveSpeed;
      this.facing = -1;
      this.consumeFuel(deltaTime);
    } else if (inputManager.isKeyPressed('ArrowRight') || inputManager.isKeyPressed('d')) {
      this.dx = moveSpeed;
      this.facing = 1;
      this.consumeFuel(deltaTime);
    } else {
      this.dx *= 0.9; // Decelerate
    }
  }

  /**
   * Fire the vehicle's weapon (override in subclasses)
   * @param {number} currentTime - Current time in ms
   * @param {number} targetX - Target X position
   * @param {number} targetY - Target Y position
   * @returns {Object|null} Projectile if fired, null otherwise
   */
  fire(currentTime, targetX, targetY) {
    // Override in subclasses
    return null;
  }

  /**
   * Destroy the vehicle with explosion
   */
  destroy() {
    this.isDestroyed = true;
    this.active = false;
    
    // Eject driver and passengers
    if (this.driver) {
      this.exit(this.driver);
      // Damage the driver
      this.driver.takeDamage(30);
    }
    
    this.passengers.forEach(passenger => {
      this.exit(passenger);
      passenger.takeDamage(30);
    });
  }

  /**
   * Get explosion parameters for when vehicle is destroyed
   * @returns {Object} Explosion parameters
   */
  getExplosionParams() {
    const vehicleConfig = typeof GameConfig !== 'undefined' && GameConfig.VEHICLES ?
      GameConfig.VEHICLES : this.getDefaultConfig();
    
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
      radius: vehicleConfig.explosionRadius || 150,
      damage: vehicleConfig.explosionDamage || 100
    };
  }

  /**
   * Render the vehicle
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    if (!this.active && !this.isDestroyed) return;
    
    ctx.save();
    
    // Draw destroyed vehicle as wreckage
    if (this.isDestroyed) {
      this.renderWreckage(ctx);
      ctx.restore();
      return;
    }
    
    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(this.x + 5, this.y + this.height, this.width - 10, 5);
    
    // Draw vehicle body (basic rectangle - override in subclasses for detail)
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Draw damage smoke
    if (this.health < this.maxHealth * 0.5 && Math.sin(this.damageSmokeTimer / 200) > 0) {
      ctx.fillStyle = 'rgba(50, 50, 50, 0.6)';
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y - 10, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw health bar
    this.renderHealthBar(ctx);
    
    // Draw fuel indicator
    this.renderFuelBar(ctx);
    
    // Draw interaction prompt when no driver
    if (!this.driver) {
      this.renderInteractionPrompt(ctx);
    }
    
    ctx.restore();
  }

  /**
   * Render destroyed vehicle wreckage
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderWreckage(ctx) {
    ctx.fillStyle = '#333333';
    ctx.fillRect(this.x, this.y + this.height * 0.3, this.width, this.height * 0.7);
    
    // Fire/smoke effect
    ctx.fillStyle = 'rgba(255, 100, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y, 15, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Render health bar above vehicle
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderHealthBar(ctx) {
    const barWidth = this.width;
    const barHeight = 6;
    const barY = this.y - 15;
    const healthPercent = this.health / this.maxHealth;
    
    // Background
    ctx.fillStyle = '#333333';
    ctx.fillRect(this.x, barY, barWidth, barHeight);
    
    // Health fill
    if (healthPercent > 0.6) {
      ctx.fillStyle = '#00ff00';
    } else if (healthPercent > 0.3) {
      ctx.fillStyle = '#ffff00';
    } else {
      ctx.fillStyle = '#ff0000';
    }
    ctx.fillRect(this.x, barY, barWidth * healthPercent, barHeight);
    
    // Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, barY, barWidth, barHeight);
  }

  /**
   * Render fuel bar below health bar
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderFuelBar(ctx) {
    const barWidth = this.width;
    const barHeight = 4;
    const barY = this.y - 8;
    const fuelPercent = this.fuel / this.fuelCapacity;
    
    // Background
    ctx.fillStyle = '#333333';
    ctx.fillRect(this.x, barY, barWidth, barHeight);
    
    // Fuel fill
    ctx.fillStyle = '#00aaff';
    ctx.fillRect(this.x, barY, barWidth * fuelPercent, barHeight);
  }

  /**
   * Render interaction prompt when vehicle can be entered
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderInteractionPrompt(ctx) {
    const vehicleConfig = typeof GameConfig !== 'undefined' && GameConfig.VEHICLES ?
      GameConfig.VEHICLES : this.getDefaultConfig();
    const key = vehicleConfig.enterExitKey || 'y';
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(this.x + this.width / 2 - 40, this.y - 40, 80, 18);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`[${key.toUpperCase()}] Enter`, this.x + this.width / 2, this.y - 27);
  }

  /**
   * Check if a point is near the vehicle for enter/exit
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} range - Interaction range
   * @returns {boolean} True if point is in range
   */
  isInRange(x, y, range = 50) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    return Math.sqrt(dx * dx + dy * dy) <= range;
  }
}
