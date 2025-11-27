/**
 * Jeep - Fast light vehicle with mounted gun
 * Lower armor, high speed, 2 seats
 */
class Jeep extends Vehicle {
  /**
   * Create a new jeep
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  constructor(x, y) {
    super(x, y, 70, 40, 'JEEP');
    
    // Get jeep-specific config
    const vehicleConfig = typeof GameConfig !== 'undefined' && GameConfig.VEHICLES ?
      GameConfig.VEHICLES.JEEP : this.getJeepConfig();
    
    // Jeep stats
    this.mountedGunDamage = vehicleConfig.mountedGunDamage || 20;
    this.mountedGunCooldown = vehicleConfig.mountedGunCooldown || 150;
    this.seats = vehicleConfig.seats || 2;
    
    // Weapon state
    this.lastGunFire = 0;
    this.gunAngle = 0;
    this.gunRecoil = 0;
    
    // Visual
    this.color = '#5a6a4a';
    this.wheelRotation = 0;
  }

  /**
   * Get default jeep configuration
   * @returns {Object} Jeep config
   */
  getJeepConfig() {
    return {
      health: 200,
      speed: 300,
      mountedGunDamage: 20,
      armorReduction: 0.25,
      mountedGunCooldown: 150,
      seats: 2,
      fuelCapacity: 80,
      fuelConsumption: 3
    };
  }

  /**
   * Update the jeep
   * @param {number} deltaTime - Time since last update in ms
   * @param {Object} inputManager - Input manager
   * @param {number} groundLevel - Ground Y position
   * @param {number} worldWidth - World width
   */
  update(deltaTime, inputManager, groundLevel, worldWidth) {
    super.update(deltaTime, inputManager, groundLevel, worldWidth);
    
    if (this.isDestroyed) return;
    
    // Update wheel rotation
    if (Math.abs(this.dx) > 0.1) {
      this.wheelRotation += this.dx * (deltaTime / 16) * 0.2;
    }
    
    // Update gun recoil
    if (this.gunRecoil > 0) {
      this.gunRecoil *= 0.9;
      if (this.gunRecoil < 0.1) this.gunRecoil = 0;
    }
  }

  /**
   * Add a passenger to the jeep
   * @param {Object} entity - Entity to add as passenger
   * @returns {boolean} True if passenger was added
   */
  addPassenger(entity) {
    if (this.passengers.length >= this.seats - 1) {
      return false;
    }
    
    this.passengers.push(entity);
    entity.isInVehicle = true;
    entity.currentVehicle = this;
    entity.visible = false;
    
    return true;
  }

  /**
   * Fire the mounted gun
   * @param {number} currentTime - Current time in ms
   * @param {number} targetX - Target X position
   * @param {number} targetY - Target Y position
   * @returns {Object|null} Projectile if fired
   */
  fire(currentTime, targetX, targetY) {
    if (currentTime - this.lastGunFire < this.mountedGunCooldown) {
      return null;
    }
    
    this.lastGunFire = currentTime;
    
    // Calculate gun position and angle
    const gunX = this.x + this.width / 2;
    const gunY = this.y + 5;
    
    this.gunAngle = Math.atan2(targetY - gunY, targetX - gunX);
    this.gunRecoil = 5;
    
    // Create projectile
    const projectile = new Projectile(
      gunX + Math.cos(this.gunAngle) * 20,
      gunY + Math.sin(this.gunAngle) * 20,
      Math.cos(this.gunAngle) * 20,
      Math.sin(this.gunAngle) * 20,
      this.mountedGunDamage,
      null
    );
    
    projectile.color = '#ffff00';
    projectile.width = 4;
    projectile.height = 3;
    
    // Play sound
    if (window.game && window.game.audioManager) {
      window.game.audioManager.playSound('shoot_rifle', 0.4);
    }
    
    return projectile;
  }

  /**
   * Render the jeep
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    if (!this.active && !this.isDestroyed) return;
    
    ctx.save();
    
    if (this.isDestroyed) {
      this.renderWreckage(ctx);
      ctx.restore();
      return;
    }
    
    // Flip based on facing
    if (this.facing < 0) {
      ctx.translate(this.x + this.width, 0);
      ctx.scale(-1, 1);
      ctx.translate(-this.x, 0);
    }
    
    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(this.x + 5, this.y + this.height, this.width - 10, 4);
    
    // Draw wheels
    this.renderWheels(ctx);
    
    // Draw body
    this.renderBody(ctx);
    
    // Draw mounted gun
    this.renderMountedGun(ctx);
    
    // Draw windshield/cab
    this.renderCab(ctx);
    
    ctx.restore();
    
    // Draw health and fuel bars (not flipped)
    ctx.save();
    this.renderHealthBar(ctx);
    this.renderFuelBar(ctx);
    ctx.restore();
    
    // Draw damage smoke
    if (this.health < this.maxHealth * 0.5) {
      ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
      const smokeOffset = Math.sin(this.damageSmokeTimer / 150) * 3;
      ctx.beginPath();
      ctx.arc(this.x + 15 + smokeOffset, this.y - 5, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Render jeep wheels
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderWheels(ctx) {
    const wheelRadius = 8;
    const wheelY = this.y + this.height - wheelRadius;
    
    // Front wheel
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(this.x + 15, wheelY, wheelRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Back wheel
    ctx.beginPath();
    ctx.arc(this.x + this.width - 15, wheelY, wheelRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Wheel spokes
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 4; i++) {
      const angle = this.wheelRotation + (i * Math.PI / 2);
      
      // Front wheel spokes
      ctx.beginPath();
      ctx.moveTo(this.x + 15, wheelY);
      ctx.lineTo(
        this.x + 15 + Math.cos(angle) * (wheelRadius - 2),
        wheelY + Math.sin(angle) * (wheelRadius - 2)
      );
      ctx.stroke();
      
      // Back wheel spokes
      ctx.beginPath();
      ctx.moveTo(this.x + this.width - 15, wheelY);
      ctx.lineTo(
        this.x + this.width - 15 + Math.cos(angle) * (wheelRadius - 2),
        wheelY + Math.sin(angle) * (wheelRadius - 2)
      );
      ctx.stroke();
    }
    
    // Wheel centers
    ctx.fillStyle = '#444444';
    ctx.beginPath();
    ctx.arc(this.x + 15, wheelY, 3, 0, Math.PI * 2);
    ctx.arc(this.x + this.width - 15, wheelY, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Render jeep body
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderBody(ctx) {
    // Main body
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x + 5, this.y + 15, this.width - 10, this.height - 23);
    
    // Hood
    ctx.fillStyle = '#4a5a3a';
    ctx.fillRect(this.x + 5, this.y + 18, 25, 12);
    
    // Hood highlight
    ctx.fillStyle = '#6a7a5a';
    ctx.fillRect(this.x + 5, this.y + 18, 25, 3);
    
    // Grille (front)
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(this.x + 2, this.y + 20, 5, 10);
    
    // Grille details
    ctx.fillStyle = '#1a1a1a';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(this.x + 3, this.y + 21 + i * 3, 3, 1);
    }
    
    // Headlight
    ctx.fillStyle = '#ffff99';
    ctx.beginPath();
    ctx.arc(this.x + 5, this.y + 23, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Rear section
    ctx.fillStyle = '#4a5a3a';
    ctx.fillRect(this.x + this.width - 25, this.y + 18, 20, 14);
    
    // Taillight
    ctx.fillStyle = '#ff3333';
    ctx.fillRect(this.x + this.width - 6, this.y + 22, 3, 4);
    
    // Undercarriage
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(this.x + 10, this.y + this.height - 10, this.width - 20, 3);
  }

  /**
   * Render mounted gun
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderMountedGun(ctx) {
    const gunX = this.x + this.width / 2;
    const gunY = this.y + 8;
    
    // Gun mount
    ctx.fillStyle = '#333333';
    ctx.fillRect(gunX - 5, gunY, 10, 10);
    
    // Gun barrel with recoil
    ctx.save();
    ctx.translate(gunX, gunY + 5);
    
    // Apply facing direction to gun angle for rendering
    let renderAngle = this.gunAngle;
    if (this.facing < 0) {
      renderAngle = Math.PI - this.gunAngle;
    }
    ctx.rotate(renderAngle);
    
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(-this.gunRecoil, -3, 25 - this.gunRecoil, 6);
    
    // Barrel tip
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(20 - this.gunRecoil, -4, 5, 8);
    
    // Barrel highlight
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(-this.gunRecoil, -3, 25 - this.gunRecoil, 2);
    
    ctx.restore();
    
    // Gun shield
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(gunX - 8, gunY - 3, 16, 5);
  }

  /**
   * Render cab/windshield area
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderCab(ctx) {
    // Windshield frame
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(this.x + 28, this.y + 12, 3, 12);
    ctx.fillRect(this.x + 45, this.y + 12, 3, 12);
    ctx.fillRect(this.x + 28, this.y + 10, 20, 3);
    
    // Windshield glass
    ctx.fillStyle = 'rgba(100, 150, 200, 0.5)';
    ctx.fillRect(this.x + 31, this.y + 13, 14, 9);
    
    // Windshield reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(this.x + 32, this.y + 14, 3, 7);
    
    // Roll bar
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(this.x + 48, this.y + 5, 3, 20);
    
    // Seat (visible through open side)
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(this.x + 35, this.y + 22, 12, 8);
  }

  /**
   * Render destroyed jeep wreckage
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderWreckage(ctx) {
    // Burned body
    ctx.fillStyle = '#222222';
    ctx.fillRect(this.x + 5, this.y + 20, this.width - 10, this.height - 25);
    
    // Damaged wheels (flat)
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(this.x + 15, this.y + this.height - 5, 8, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(this.x + this.width - 15, this.y + this.height - 5, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Broken windshield
    ctx.fillStyle = '#333333';
    ctx.fillRect(this.x + 28, this.y + 15, 20, 8);
    
    // Fire effect
    const fireIntensity = Math.sin(Date.now() / 100) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255, 100, 0, ${fireIntensity * 0.5})`;
    ctx.beginPath();
    ctx.arc(this.x + 15, this.y + 15, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Smoke
    ctx.fillStyle = 'rgba(50, 50, 50, 0.4)';
    const smokeOffset = Math.sin(Date.now() / 200) * 8;
    ctx.beginPath();
    ctx.arc(this.x + 15 + smokeOffset, this.y, 15, 0, Math.PI * 2);
    ctx.fill();
  }
}
