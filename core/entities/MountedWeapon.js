/**
 * MountedWeapon - Stationary weapons that can be mounted by player
 * Supports HMG (Heavy Machine Gun), Sniper, and Rocket types
 */
class MountedWeapon extends Entity {
  /**
   * Create a new mounted weapon
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} weaponType - Type of weapon (HMG, SNIPER, ROCKET)
   */
  constructor(x, y, weaponType = 'HMG') {
    super(x, y, 40, 50);
    
    this.type = 'mounted_weapon';
    this.weaponType = weaponType;
    
    // Get config
    const mountedConfig = typeof GameConfig !== 'undefined' && GameConfig.MOUNTED_WEAPONS ?
      GameConfig.MOUNTED_WEAPONS : this.getDefaultConfig();
    const typeConfig = mountedConfig[weaponType] || mountedConfig.HMG;
    
    // Stats from config
    this.damage = typeConfig.damage || 25;
    this.fireRate = typeConfig.fireRate || 0.1;
    this.range = typeConfig.range || 500;
    this.rotationSpeed = typeConfig.rotationSpeed || 180;
    this.maxRotation = typeConfig.maxRotation || 360;
    this.overheatShots = typeConfig.overheatShots || 50;
    this.cooldownTime = typeConfig.cooldownTime || 3000;
    this.shieldHealth = typeConfig.shieldHealth || 0;
    this.maxShieldHealth = this.shieldHealth;
    this.zoomLevel = typeConfig.zoomLevel || 1.0;
    this.ammoCapacity = typeConfig.ammoCapacity || -1; // -1 = unlimited
    this.explosionRadius = typeConfig.explosionRadius || 0;
    this.vulnerableAngle = mountedConfig.vulnerableAngle || 120;
    
    // State
    this.operator = null;
    this.currentAngle = 0; // degrees, 0 = right
    this.targetAngle = 0;
    this.baseAngle = 0; // The center of the rotation arc
    this.lastFireTime = 0;
    this.heatLevel = 0;
    this.isOverheated = false;
    this.cooldownStartTime = 0;
    this.currentAmmo = this.ammoCapacity;
    this.isZooming = false;
    
    // Visual
    this.color = '#4a4a4a';
  }

  /**
   * Get default mounted weapon configuration
   * @returns {Object} Default config
   */
  getDefaultConfig() {
    return {
      HMG: {
        damage: 25,
        fireRate: 0.1,
        range: 500,
        rotationSpeed: 180,
        maxRotation: 360,
        overheatShots: 50,
        cooldownTime: 3000,
        shieldHealth: 100
      },
      SNIPER: {
        damage: 100,
        fireRate: 2,
        range: 800,
        rotationSpeed: 45,
        maxRotation: 180,
        zoomLevel: 2.0
      },
      ROCKET: {
        damage: 150,
        fireRate: 4,
        range: 600,
        rotationSpeed: 90,
        maxRotation: 270,
        ammoCapacity: 10,
        explosionRadius: 100
      },
      mountKey: 'e',
      vulnerableAngle: 120
    };
  }

  /**
   * Check if the weapon can be mounted
   * @returns {boolean} True if weapon can be mounted
   */
  canMount() {
    return this.active && !this.operator;
  }

  /**
   * Mount the weapon
   * @param {Object} entity - Entity mounting the weapon
   * @returns {boolean} True if mount was successful
   */
  mount(entity) {
    if (!this.canMount()) return false;
    
    this.operator = entity;
    entity.isMounted = true;
    entity.currentMountedWeapon = this;
    
    // Position entity at weapon
    entity.x = this.x + this.width / 2 - entity.width / 2;
    entity.y = this.y + this.height - entity.height;
    
    return true;
  }

  /**
   * Dismount from the weapon
   * @param {Object} entity - Entity dismounting
   * @returns {boolean} True if dismount was successful
   */
  dismount(entity) {
    if (this.operator !== entity) return false;
    
    this.operator = null;
    entity.isMounted = false;
    entity.currentMountedWeapon = null;
    
    // Move entity behind the weapon
    entity.x = this.x - entity.width - 10;
    
    return true;
  }

  /**
   * Take damage (shield protects front, vulnerable from behind)
   * @param {number} amount - Damage amount
   * @param {number} sourceAngle - Angle of the damage source (in degrees)
   * @returns {boolean} True if operator was hit
   */
  takeDamage(amount, sourceAngle = null) {
    // Check if damage is from the vulnerable angle (behind)
    if (sourceAngle !== null) {
      const angleDiff = Math.abs(this.normalizeAngle(sourceAngle - this.currentAngle - 180));
      const isFromBehind = angleDiff <= this.vulnerableAngle / 2;
      
      if (!isFromBehind && this.shieldHealth > 0) {
        // Shield absorbs damage
        this.shieldHealth = Math.max(0, this.shieldHealth - amount);
        return false;
      }
    }
    
    // Damage goes to operator
    if (this.operator) {
      this.operator.takeDamage(amount);
      return true;
    }
    
    return false;
  }

  /**
   * Normalize angle to -180 to 180 range
   * @param {number} angle - Angle in degrees
   * @returns {number} Normalized angle
   */
  normalizeAngle(angle) {
    while (angle > 180) angle -= 360;
    while (angle < -180) angle += 360;
    return angle;
  }

  /**
   * Aim at a target
   * @param {number} targetX - Target X position
   * @param {number} targetY - Target Y position
   */
  aim(targetX, targetY) {
    const weaponX = this.x + this.width / 2;
    const weaponY = this.y + 10;
    
    const dx = targetX - weaponX;
    const dy = targetY - weaponY;
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    // Clamp to rotation limits
    const minAngle = this.baseAngle - this.maxRotation / 2;
    const maxAngle = this.baseAngle + this.maxRotation / 2;
    angle = Math.max(minAngle, Math.min(maxAngle, angle));
    
    this.targetAngle = angle;
  }

  /**
   * Fire the weapon
   * @param {number} currentTime - Current time in ms
   * @returns {Object|null} Projectile if fired
   */
  fire(currentTime) {
    // Check cooldowns
    const fireRateMs = this.fireRate * 1000;
    if (currentTime - this.lastFireTime < fireRateMs) {
      return null;
    }
    
    // Check overheat
    if (this.isOverheated) {
      if (currentTime - this.cooldownStartTime >= this.cooldownTime) {
        this.isOverheated = false;
        this.heatLevel = 0;
      } else {
        return null;
      }
    }
    
    // Check ammo
    if (this.ammoCapacity > 0 && this.currentAmmo <= 0) {
      return null;
    }
    
    this.lastFireTime = currentTime;
    
    // Consume ammo if limited
    if (this.ammoCapacity > 0) {
      this.currentAmmo--;
    }
    
    // Increase heat (for HMG)
    if (this.overheatShots > 0) {
      this.heatLevel++;
      if (this.heatLevel >= this.overheatShots) {
        this.isOverheated = true;
        this.cooldownStartTime = currentTime;
      }
    }
    
    // Create projectile
    const weaponX = this.x + this.width / 2;
    const weaponY = this.y + 10;
    const angleRad = this.currentAngle * Math.PI / 180;
    
    const projectile = new Projectile(
      weaponX + Math.cos(angleRad) * 30,
      weaponY + Math.sin(angleRad) * 30,
      Math.cos(angleRad) * 20,
      Math.sin(angleRad) * 20,
      this.damage,
      null
    );
    
    // Configure projectile based on weapon type
    switch (this.weaponType) {
      case 'HMG':
        projectile.color = '#ffff00';
        projectile.width = 4;
        projectile.height = 3;
        break;
      case 'SNIPER':
        projectile.color = '#00ffff';
        projectile.width = 6;
        projectile.height = 2;
        // Sniper has penetration
        projectile.penetrating = true;
        break;
      case 'ROCKET':
        projectile.color = '#ff6600';
        projectile.width = 8;
        projectile.height = 6;
        projectile.isExplosive = true;
        projectile.explosionRadius = this.explosionRadius;
        break;
    }
    
    // Play appropriate sound
    if (window.game && window.game.audioManager) {
      switch (this.weaponType) {
        case 'HMG':
          window.game.audioManager.playSound('shoot_machinegun', 0.4);
          break;
        case 'SNIPER':
          window.game.audioManager.playSound('shoot_sniper', 0.6);
          break;
        case 'ROCKET':
          window.game.audioManager.playSound('explosion', 0.5);
          break;
      }
    }
    
    return projectile;
  }

  /**
   * Toggle zoom (for sniper)
   */
  toggleZoom() {
    if (this.weaponType === 'SNIPER') {
      this.isZooming = !this.isZooming;
    }
  }

  /**
   * Update the mounted weapon
   * @param {number} deltaTime - Time since last update in ms
   * @param {number} currentTime - Current time in ms
   */
  update(deltaTime, currentTime) {
    // Rotate towards target angle
    const angleDiff = this.targetAngle - this.currentAngle;
    const maxRotation = this.rotationSpeed * (deltaTime / 1000);
    
    if (Math.abs(angleDiff) > maxRotation) {
      this.currentAngle += Math.sign(angleDiff) * maxRotation;
    } else {
      this.currentAngle = this.targetAngle;
    }
    
    // Cool down heat over time (if not overheated)
    if (!this.isOverheated && this.heatLevel > 0) {
      this.heatLevel = Math.max(0, this.heatLevel - deltaTime / 100);
    }
    
    // Regenerate shield
    if (this.shieldHealth < this.maxShieldHealth) {
      this.shieldHealth = Math.min(this.maxShieldHealth, this.shieldHealth + deltaTime / 100);
    }
    
    // Keep operator positioned at weapon
    if (this.operator) {
      this.operator.x = this.x + this.width / 2 - this.operator.width / 2;
      this.operator.y = this.y + this.height - this.operator.height;
    }
  }

  /**
   * Render the mounted weapon
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    if (!this.active) return;
    
    ctx.save();
    
    // Draw base/tripod
    this.renderBase(ctx);
    
    // Draw shield (if applicable)
    if (this.maxShieldHealth > 0) {
      this.renderShield(ctx);
    }
    
    // Draw weapon
    this.renderWeapon(ctx);
    
    // Draw heat indicator for HMG
    if (this.weaponType === 'HMG') {
      this.renderHeatIndicator(ctx);
    }
    
    // Draw ammo indicator for rocket launcher
    if (this.ammoCapacity > 0) {
      this.renderAmmoIndicator(ctx);
    }
    
    // Draw interaction prompt
    if (!this.operator) {
      this.renderInteractionPrompt(ctx);
    }
    
    ctx.restore();
  }

  /**
   * Render weapon base/tripod
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderBase(ctx) {
    // Tripod legs
    ctx.fillStyle = '#2a2a2a';
    
    // Left leg
    ctx.beginPath();
    ctx.moveTo(this.x + 10, this.y + this.height);
    ctx.lineTo(this.x - 5, this.y + this.height + 10);
    ctx.lineTo(this.x + 5, this.y + this.height);
    ctx.fill();
    
    // Right leg
    ctx.beginPath();
    ctx.moveTo(this.x + this.width - 10, this.y + this.height);
    ctx.lineTo(this.x + this.width + 5, this.y + this.height + 10);
    ctx.lineTo(this.x + this.width - 5, this.y + this.height);
    ctx.fill();
    
    // Center leg
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2 - 5, this.y + this.height);
    ctx.lineTo(this.x + this.width / 2, this.y + this.height + 15);
    ctx.lineTo(this.x + this.width / 2 + 5, this.y + this.height);
    ctx.fill();
    
    // Mount platform
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(this.x + 5, this.y + this.height - 10, this.width - 10, 10);
  }

  /**
   * Render shield (for HMG)
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderShield(ctx) {
    const shieldPercent = this.shieldHealth / this.maxShieldHealth;
    const shieldAlpha = 0.3 + shieldPercent * 0.4;
    
    // Shield plate
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + 20);
    ctx.rotate(this.currentAngle * Math.PI / 180);
    
    ctx.fillStyle = `rgba(100, 100, 120, ${shieldAlpha})`;
    ctx.fillRect(-25, -15, 50, 30);
    
    // Shield border
    ctx.strokeStyle = shieldPercent > 0.3 ? '#6688aa' : '#aa4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(-25, -15, 50, 30);
    
    ctx.restore();
  }

  /**
   * Render the weapon
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderWeapon(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + 20);
    ctx.rotate(this.currentAngle * Math.PI / 180);
    
    switch (this.weaponType) {
      case 'HMG':
        this.renderHMG(ctx);
        break;
      case 'SNIPER':
        this.renderSniper(ctx);
        break;
      case 'ROCKET':
        this.renderRocket(ctx);
        break;
    }
    
    ctx.restore();
  }

  /**
   * Render HMG weapon model
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderHMG(ctx) {
    // Main body
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(-10, -6, 50, 12);
    
    // Barrel
    ctx.fillStyle = '#333333';
    ctx.fillRect(35, -4, 20, 8);
    
    // Barrel tip
    ctx.fillStyle = '#222222';
    ctx.fillRect(50, -5, 8, 10);
    
    // Ammo belt
    ctx.fillStyle = '#8a6a3a';
    ctx.fillRect(-15, 0, 10, 15);
    
    // Handle
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(-5, 6, 15, 8);
    
    // Heat glow when overheated
    if (this.isOverheated) {
      ctx.fillStyle = 'rgba(255, 100, 0, 0.5)';
      ctx.fillRect(35, -6, 25, 12);
    }
  }

  /**
   * Render Sniper weapon model
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderSniper(ctx) {
    // Main body
    ctx.fillStyle = '#3a4a3a';
    ctx.fillRect(-15, -4, 60, 8);
    
    // Barrel
    ctx.fillStyle = '#2a3a2a';
    ctx.fillRect(40, -3, 25, 6);
    
    // Scope
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(5, -10, 25, 6);
    ctx.fillStyle = this.isZooming ? '#00ffff' : '#333333';
    ctx.beginPath();
    ctx.arc(28, -7, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Stock
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(-25, -3, 12, 8);
    
    // Bipod
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(35, 4, 2, 10);
    ctx.fillRect(45, 4, 2, 10);
  }

  /**
   * Render Rocket launcher weapon model
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderRocket(ctx) {
    // Main tube
    ctx.fillStyle = '#4a5a4a';
    ctx.fillRect(-10, -8, 55, 16);
    
    // Front opening
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(42, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    
    // Rear section
    ctx.fillStyle = '#3a4a3a';
    ctx.fillRect(-20, -6, 12, 12);
    
    // Sight
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(10, -12, 15, 4);
    
    // Handle
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(-5, 8, 20, 6);
  }

  /**
   * Render heat indicator
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderHeatIndicator(ctx) {
    const barWidth = 30;
    const barHeight = 4;
    const barX = this.x + this.width / 2 - barWidth / 2;
    const barY = this.y - 20;
    const heatPercent = this.heatLevel / this.overheatShots;
    
    // Background
    ctx.fillStyle = '#333333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Heat fill
    if (this.isOverheated) {
      ctx.fillStyle = '#ff0000';
    } else if (heatPercent > 0.7) {
      ctx.fillStyle = '#ff6600';
    } else {
      ctx.fillStyle = '#ffaa00';
    }
    ctx.fillRect(barX, barY, barWidth * heatPercent, barHeight);
    
    // Label
    if (this.isOverheated) {
      ctx.fillStyle = '#ff0000';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('OVERHEAT', this.x + this.width / 2, barY - 3);
    }
  }

  /**
   * Render ammo indicator
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderAmmoIndicator(ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.currentAmmo}/${this.ammoCapacity}`, this.x + this.width / 2, this.y - 25);
  }

  /**
   * Render interaction prompt
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderInteractionPrompt(ctx) {
    const mountedConfig = typeof GameConfig !== 'undefined' && GameConfig.MOUNTED_WEAPONS ?
      GameConfig.MOUNTED_WEAPONS : this.getDefaultConfig();
    const key = mountedConfig.mountKey || 'e';
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(this.x - 5, this.y - 40, this.width + 10, 18);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`[${key.toUpperCase()}] Mount`, this.x + this.width / 2, this.y - 27);
  }

  /**
   * Check if a point is near the weapon for mounting
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
