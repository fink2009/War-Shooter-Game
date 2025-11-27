/**
 * Tank - Heavy armored vehicle with cannon and machine gun
 * High armor, slow speed, can crush enemies
 */
class Tank extends Vehicle {
  /**
   * Create a new tank
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  constructor(x, y) {
    super(x, y, 100, 50, 'TANK');
    
    // Get tank-specific config
    const vehicleConfig = typeof GameConfig !== 'undefined' && GameConfig.VEHICLES ?
      GameConfig.VEHICLES.TANK : this.getTankConfig();
    
    // Tank stats
    this.mainDamage = vehicleConfig.mainDamage || 100;
    this.mgDamage = vehicleConfig.mgDamage || 15;
    this.crushDamage = vehicleConfig.crushDamage || 200;
    this.cannonCooldown = vehicleConfig.cannonCooldown || 2000;
    this.mgCooldown = vehicleConfig.mgCooldown || 100;
    
    // Weapon state
    this.lastCannonFire = 0;
    this.lastMGFire = 0;
    this.turretAngle = 0;
    this.targetTurretAngle = 0;
    this.turretRotationSpeed = 60; // degrees per second
    
    // Visual
    this.color = '#4a5a3a';
    this.turretColor = '#3a4a2a';
    this.trackOffset = 0;
  }

  /**
   * Get default tank configuration
   * @returns {Object} Tank config
   */
  getTankConfig() {
    return {
      health: 500,
      speed: 100,
      mainDamage: 100,
      mgDamage: 15,
      armorReduction: 0.75,
      crushDamage: 200,
      cannonCooldown: 2000,
      mgCooldown: 100,
      fuelCapacity: 100,
      fuelConsumption: 2
    };
  }

  /**
   * Update the tank
   * @param {number} deltaTime - Time since last update in ms
   * @param {Object} inputManager - Input manager
   * @param {number} groundLevel - Ground Y position
   * @param {number} worldWidth - World width
   * @param {Array} enemies - Array of enemies to check for crushing
   */
  update(deltaTime, inputManager, groundLevel, worldWidth, enemies) {
    super.update(deltaTime, inputManager, groundLevel, worldWidth);
    
    if (this.isDestroyed) return;
    
    // Update track animation
    if (Math.abs(this.dx) > 0.1) {
      this.trackOffset += this.dx * (deltaTime / 16) * 0.5;
    }
    
    // Rotate turret towards target angle
    const angleDiff = this.targetTurretAngle - this.turretAngle;
    const maxRotation = this.turretRotationSpeed * (deltaTime / 1000);
    
    if (Math.abs(angleDiff) > maxRotation) {
      this.turretAngle += Math.sign(angleDiff) * maxRotation;
    } else {
      this.turretAngle = this.targetTurretAngle;
    }
    
    // Check for crush damage to enemies
    if (enemies && Math.abs(this.dx) > 1) {
      this.checkCrush(enemies);
    }
  }

  /**
   * Check and apply crush damage to enemies
   * @param {Array} enemies - Array of enemies
   */
  checkCrush(enemies) {
    enemies.forEach(enemy => {
      if (enemy.active && this.collidesWith(enemy)) {
        enemy.takeDamage(this.crushDamage);
        
        // Create particles for crush effect
        if (window.game && window.game.particleSystem) {
          window.game.particleSystem.createExplosion(
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height / 2,
            10,
            '#ff0000'
          );
        }
      }
    });
  }

  /**
   * Aim the turret at a target
   * @param {number} targetX - Target X position
   * @param {number} targetY - Target Y position
   */
  aimTurret(targetX, targetY) {
    const turretX = this.x + this.width / 2;
    const turretY = this.y + 15;
    
    this.targetTurretAngle = Math.atan2(targetY - turretY, targetX - turretX) * 180 / Math.PI;
  }

  /**
   * Fire the main cannon
   * @param {number} currentTime - Current time in ms
   * @param {number} targetX - Target X position
   * @param {number} targetY - Target Y position
   * @returns {Object|null} Projectile if fired
   */
  fireCannon(currentTime, targetX, targetY) {
    if (currentTime - this.lastCannonFire < this.cannonCooldown) {
      return null;
    }
    
    this.lastCannonFire = currentTime;
    this.aimTurret(targetX, targetY);
    
    const turretX = this.x + this.width / 2;
    const turretY = this.y + 15;
    const angle = this.turretAngle * Math.PI / 180;
    
    // Create cannon projectile
    const projectile = new Projectile(
      turretX + Math.cos(angle) * 50,
      turretY + Math.sin(angle) * 50,
      Math.cos(angle) * 15,
      Math.sin(angle) * 15,
      this.mainDamage,
      null
    );
    
    projectile.isExplosive = true;
    projectile.explosionRadius = 60;
    projectile.color = '#ffaa00';
    projectile.width = 8;
    projectile.height = 8;
    
    // Play sound
    if (window.game && window.game.audioManager) {
      window.game.audioManager.playSound('explosion', 0.6);
    }
    
    return projectile;
  }

  /**
   * Fire the machine gun
   * @param {number} currentTime - Current time in ms
   * @param {number} targetX - Target X position
   * @param {number} targetY - Target Y position
   * @returns {Object|null} Projectile if fired
   */
  fireMG(currentTime, targetX, targetY) {
    if (currentTime - this.lastMGFire < this.mgCooldown) {
      return null;
    }
    
    this.lastMGFire = currentTime;
    
    // MG fires forward based on tank facing
    const mgX = this.x + (this.facing > 0 ? this.width : 0);
    const mgY = this.y + 25;
    
    const projectile = new Projectile(
      mgX,
      mgY,
      this.facing * 18,
      (Math.random() - 0.5) * 2,
      this.mgDamage,
      null
    );
    
    projectile.color = '#ffff00';
    projectile.width = 4;
    projectile.height = 2;
    
    // Play sound
    if (window.game && window.game.audioManager) {
      window.game.audioManager.playSound('shoot_rifle', 0.3);
    }
    
    return projectile;
  }

  /**
   * Fire the vehicle's weapon
   * @param {number} currentTime - Current time in ms
   * @param {number} targetX - Target X position
   * @param {number} targetY - Target Y position
   * @returns {Object|null} Projectile if fired
   */
  fire(currentTime, targetX, targetY) {
    // Default to cannon fire
    return this.fireCannon(currentTime, targetX, targetY);
  }

  /**
   * Render the tank
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
    
    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(this.x + 5, this.y + this.height, this.width - 10, 8);
    
    // Draw tracks
    this.renderTracks(ctx);
    
    // Draw tank body
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x + 5, this.y + 15, this.width - 10, this.height - 20);
    
    // Body highlights
    ctx.fillStyle = '#5a6a4a';
    ctx.fillRect(this.x + 5, this.y + 15, this.width - 10, 5);
    
    // Body shadows
    ctx.fillStyle = '#3a4a2a';
    ctx.fillRect(this.x + 5, this.y + this.height - 10, this.width - 10, 5);
    
    // Draw turret
    this.renderTurret(ctx);
    
    // Draw damage smoke
    if (this.health < this.maxHealth * 0.5) {
      ctx.fillStyle = 'rgba(50, 50, 50, 0.6)';
      const smokeOffset = Math.sin(this.damageSmokeTimer / 150) * 5;
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2 + smokeOffset, this.y - 5, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw health and fuel bars
    this.renderHealthBar(ctx);
    this.renderFuelBar(ctx);
    
    ctx.restore();
  }

  /**
   * Render tank tracks
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderTracks(ctx) {
    // Left track
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(this.x, this.y + this.height - 15, 15, 15);
    ctx.fillRect(this.x, this.y + 25, 15, this.height - 40);
    
    // Right track
    ctx.fillRect(this.x + this.width - 15, this.y + this.height - 15, 15, 15);
    ctx.fillRect(this.x + this.width - 15, this.y + 25, 15, this.height - 40);
    
    // Track details (tread pattern)
    ctx.fillStyle = '#1a1a1a';
    const trackSegments = 6;
    const segmentHeight = (this.height - 30) / trackSegments;
    
    for (let i = 0; i < trackSegments; i++) {
      const yOffset = (this.trackOffset + i * segmentHeight) % (this.height - 30);
      ctx.fillRect(this.x + 2, this.y + 25 + yOffset, 11, 2);
      ctx.fillRect(this.x + this.width - 13, this.y + 25 + yOffset, 11, 2);
    }
    
    // Wheels (visible on sides)
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.arc(this.x + 7, this.y + 30, 5, 0, Math.PI * 2);
    ctx.arc(this.x + 7, this.y + this.height - 8, 5, 0, Math.PI * 2);
    ctx.arc(this.x + this.width - 7, this.y + 30, 5, 0, Math.PI * 2);
    ctx.arc(this.x + this.width - 7, this.y + this.height - 8, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Render tank turret
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderTurret(ctx) {
    const turretX = this.x + this.width / 2;
    const turretY = this.y + 20;
    
    ctx.save();
    ctx.translate(turretX, turretY);
    ctx.rotate(this.turretAngle * Math.PI / 180);
    
    // Turret base (circular)
    ctx.fillStyle = this.turretColor;
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // Turret highlight
    ctx.fillStyle = '#4a5a3a';
    ctx.beginPath();
    ctx.arc(0, -3, 15, Math.PI, 0);
    ctx.fill();
    
    // Cannon barrel
    ctx.fillStyle = '#2a3a1a';
    ctx.fillRect(10, -4, 45, 8);
    
    // Cannon barrel detail
    ctx.fillStyle = '#1a2a0a';
    ctx.fillRect(50, -5, 5, 10);
    
    // Cannon barrel highlight
    ctx.fillStyle = '#3a4a2a';
    ctx.fillRect(10, -4, 45, 2);
    
    ctx.restore();
    
    // Cupola (commander's hatch)
    ctx.fillStyle = '#3a4a2a';
    ctx.beginPath();
    ctx.arc(turretX - 5, turretY - 5, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Render destroyed tank wreckage
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderWreckage(ctx) {
    // Burned hull
    ctx.fillStyle = '#222222';
    ctx.fillRect(this.x + 5, this.y + 20, this.width - 10, this.height - 20);
    
    // Damaged tracks
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(this.x, this.y + this.height - 10, 15, 10);
    ctx.fillRect(this.x + this.width - 15, this.y + this.height - 10, 15, 10);
    
    // Broken turret (tilted)
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + 15);
    ctx.rotate(0.3);
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(5, -3, 30, 6);
    ctx.restore();
    
    // Fire effect
    const fireIntensity = Math.sin(Date.now() / 100) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255, 100, 0, ${fireIntensity * 0.6})`;
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + 10, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Smoke
    ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
    const smokeOffset = Math.sin(Date.now() / 200) * 10;
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2 + smokeOffset, this.y - 10, 20, 0, Math.PI * 2);
    ctx.fill();
  }
}
