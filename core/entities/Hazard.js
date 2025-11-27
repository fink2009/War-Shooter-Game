/**
 * Base Hazard class for environmental hazards
 * Hazards can damage both player and enemies
 */

// Global counter for unique entity IDs
let hazardEntityIdCounter = 0;

class Hazard extends Entity {
  /**
   * Create a new hazard
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Hazard width
   * @param {number} height - Hazard height
   * @param {string} hazardType - Type of hazard
   */
  constructor(x, y, width, height, hazardType = 'generic') {
    super(x, y, width, height);
    this.type = 'hazard';
    this.hazardType = hazardType;
    
    // Damage properties
    this.damage = 10;
    this.damageInterval = 1000; // Damage tick rate in ms
    this.lastDamageTime = {};  // Track last damage time per entity
    
    // Health properties (some hazards are destructible)
    this.maxHealth = 0;
    this.health = 0;
    this.destructible = false;
    
    // State
    this.isActive = true;
    this.cooldown = 0;
    
    // Visual
    this.color = '#ff0000';
    this.warningTime = 0;
    this.showWarning = false;
  }

  /**
   * Get a unique ID for an entity (for damage tracking)
   * @param {Entity} entity - Entity to get ID for
   * @returns {string} Unique entity ID
   */
  getEntityId(entity) {
    // Use entity's existing unique ID if available, otherwise assign one
    if (!entity._hazardTrackingId) {
      entity._hazardTrackingId = entity.type + '_' + (++hazardEntityIdCounter);
    }
    return entity._hazardTrackingId;
  }

  /**
   * Check if hazard can damage an entity
   * @param {Entity} entity - Entity to check
   * @param {number} currentTime - Current game time
   * @returns {boolean} Whether damage can be applied
   */
  canDamage(entity, currentTime) {
    if (!this.isActive) return false;
    
    const entityId = this.getEntityId(entity);
    const lastDamage = this.lastDamageTime[entityId] || 0;
    
    if (currentTime - lastDamage >= this.damageInterval) {
      this.lastDamageTime[entityId] = currentTime;
      return true;
    }
    return false;
  }

  /**
   * Apply damage to an entity
   * @param {Entity} entity - Entity to damage
   * @param {number} currentTime - Current game time
   * @returns {boolean} Whether damage was applied
   */
  applyDamage(entity, currentTime) {
    if (this.canDamage(entity, currentTime)) {
      if (entity.takeDamage) {
        entity.takeDamage(this.damage, currentTime);
        return true;
      }
    }
    return false;
  }

  /**
   * Take damage (for destructible hazards)
   * @param {number} amount - Damage amount
   * @returns {boolean} Whether hazard was destroyed
   */
  takeDamage(amount) {
    if (!this.destructible) return false;
    
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.destroy();
      return true;
    }
    return false;
  }

  /**
   * Update hazard state
   * @param {number} deltaTime - Time since last update
   * @param {number} currentTime - Current game time
   */
  update(deltaTime, currentTime) {
    // Override in subclasses
  }

  /**
   * Render the hazard
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    // Override in subclasses
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  /**
   * Draw warning indicator
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawWarning(ctx) {
    if (!this.showWarning) return;
    
    const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.5;
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
    ctx.globalAlpha = 1;
  }
}


/**
 * Turret hazard - Auto-targeting stationary weapon
 */
class Turret extends Hazard {
  /**
   * Create a turret
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  constructor(x, y) {
    super(x, y, 40, 40, 'turret');
    
    // Turret stats from config
    const config = typeof GameConfig !== 'undefined' && GameConfig.HAZARDS ? 
      GameConfig.HAZARDS.TURRET : {};
    
    this.maxHealth = config.health || 50;
    this.health = this.maxHealth;
    this.destructible = true;
    this.damage = config.damage || 25;
    this.detectionRange = config.range || 400;
    this.fireRate = (config.fireRate || 1.5) * 1000; // Convert to ms
    
    this.lastFireTime = 0;
    this.target = null;
    this.rotation = 0;
    this.targetRotation = 0;
    this.rotationSpeed = 0.1;
    this.fullRotation = true; // 360° rotation
    
    this.color = '#444444';
    this.barrelLength = 25;
    this.laserSight = true;
    
    // Projectile properties
    this.projectileSpeed = 12;
    this.projectileColor = '#ff3300';
  }

  /**
   * Find nearest target (player or enemy based on turret alignment)
   * @param {PlayerCharacter} player - The player
   * @param {Array} enemies - Array of enemies
   * @returns {Entity|null} The target or null
   */
  findTarget(player, enemies) {
    let nearestTarget = null;
    let nearestDist = this.detectionRange;
    
    // Check player
    if (player && player.active) {
      const dist = this.distanceTo(player);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestTarget = player;
      }
    }
    
    return nearestTarget;
  }

  /**
   * Calculate distance to entity
   * @param {Entity} entity - Target entity
   * @returns {number} Distance
   */
  distanceTo(entity) {
    const dx = (entity.x + entity.width / 2) - (this.x + this.width / 2);
    const dy = (entity.y + entity.height / 2) - (this.y + this.height / 2);
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Update turret state
   * @param {number} deltaTime - Time since last update
   * @param {number} currentTime - Current game time
   * @param {PlayerCharacter} player - The player
   * @param {Array} enemies - Array of enemies
   * @returns {Projectile|null} Fired projectile or null
   */
  update(deltaTime, currentTime, player, enemies) {
    if (!this.active) return null;
    
    // Find target
    this.target = this.findTarget(player, enemies);
    
    if (this.target) {
      // Calculate target angle
      const dx = (this.target.x + this.target.width / 2) - (this.x + this.width / 2);
      const dy = (this.target.y + this.target.height / 2) - (this.y + this.height / 2);
      this.targetRotation = Math.atan2(dy, dx);
      
      // Smoothly rotate towards target
      let angleDiff = this.targetRotation - this.rotation;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      this.rotation += angleDiff * this.rotationSpeed * deltaTime / 16;
      
      // Fire at target
      if (currentTime - this.lastFireTime >= this.fireRate) {
        if (Math.abs(angleDiff) < 0.3) { // Only fire when aimed
          this.lastFireTime = currentTime;
          return this.fire();
        }
      }
    }
    
    return null;
  }

  /**
   * Fire a projectile
   * @returns {Projectile} The fired projectile
   */
  fire() {
    const barrelX = this.x + this.width / 2 + Math.cos(this.rotation) * this.barrelLength;
    const barrelY = this.y + this.height / 2 + Math.sin(this.rotation) * this.barrelLength;
    
    const dx = Math.cos(this.rotation) * this.projectileSpeed;
    const dy = Math.sin(this.rotation) * this.projectileSpeed;
    
    const proj = new Projectile(barrelX, barrelY, dx, dy, this.damage, this);
    proj.color = this.projectileColor;
    proj.isHazardProjectile = true;
    
    // Play turret fire sound
    if (window.game && window.game.audioManager) {
      window.game.audioManager.playSound('shoot', 0.4);
    }
    
    return proj;
  }

  /**
   * Render the turret
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    if (!this.active) return;
    
    // Draw laser sight if targeting
    if (this.laserSight && this.target) {
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(
        this.x + this.width / 2 + Math.cos(this.rotation) * this.barrelLength,
        this.y + this.height / 2 + Math.sin(this.rotation) * this.barrelLength
      );
      ctx.lineTo(
        this.x + this.width / 2 + Math.cos(this.rotation) * this.detectionRange,
        this.y + this.height / 2 + Math.sin(this.rotation) * this.detectionRange
      );
      ctx.stroke();
    }
    
    // Draw base
    ctx.fillStyle = '#333333';
    ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
    ctx.fillStyle = '#444444';
    ctx.fillRect(this.x + 8, this.y + 8, this.width - 16, this.height - 16);
    
    // Draw turret head (rotates)
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.rotation);
    
    // Turret body
    ctx.fillStyle = '#555555';
    ctx.fillRect(-12, -10, 24, 20);
    ctx.fillStyle = '#666666';
    ctx.fillRect(-10, -8, 20, 16);
    
    // Barrel
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, -4, this.barrelLength, 8);
    ctx.fillStyle = '#222222';
    ctx.fillRect(this.barrelLength - 5, -5, 8, 10);
    
    ctx.restore();
    
    // Health bar
    const healthPercent = this.health / this.maxHealth;
    ctx.fillStyle = '#000000';
    ctx.fillRect(this.x, this.y - 10, this.width, 5);
    ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
    ctx.fillRect(this.x, this.y - 10, this.width * healthPercent, 5);
    
    // Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
  }

  /**
   * Handle destruction
   */
  destroy() {
    super.destroy();
    
    // Create explosion effect
    if (window.game && window.game.particleSystem) {
      window.game.particleSystem.createExplosion(
        this.x + this.width / 2,
        this.y + this.height / 2,
        25,
        '#ff6600'
      );
    }
    
    // Play explosion sound
    if (window.game && window.game.audioManager) {
      window.game.audioManager.playSound('explosion', 0.6);
    }
    
    // Camera shake
    if (window.game && window.game.camera) {
      window.game.camera.shake(5, 200);
    }
  }
}


/**
 * ExplosiveBarrel hazard - Explodes when damaged
 */
class ExplosiveBarrel extends Hazard {
  /**
   * Create an explosive barrel
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  constructor(x, y) {
    super(x, y, 32, 40, 'barrel');
    
    // Barrel stats from config
    const config = typeof GameConfig !== 'undefined' && GameConfig.HAZARDS ? 
      GameConfig.HAZARDS.BARREL : {};
    
    this.maxHealth = 30;
    this.health = this.maxHealth;
    this.destructible = true;
    this.damage = config.damage || 50;
    this.explosionRadius = config.radius || 100;
    
    this.aboutToExplode = false;
    this.warningTime = 0;
    this.warningDuration = 500; // Flash for 0.5s before exploding
    
    this.color = '#cc4400';
  }

  /**
   * Take damage and potentially explode
   * @param {number} amount - Damage amount
   * @returns {boolean} Whether barrel was destroyed
   */
  takeDamage(amount) {
    if (!this.active) return false;
    
    this.health -= amount;
    
    if (this.health <= 0 && !this.aboutToExplode) {
      this.aboutToExplode = true;
      this.warningTime = performance.now();
      this.showWarning = true;
    }
    
    return false; // Will explode in update
  }

  /**
   * Update barrel state
   * @param {number} deltaTime - Time since last update
   * @param {number} currentTime - Current game time
   */
  update(deltaTime, currentTime) {
    if (!this.active) return;
    
    if (this.aboutToExplode) {
      if (currentTime - this.warningTime >= this.warningDuration) {
        this.explode();
      }
    }
  }

  /**
   * Trigger explosion
   */
  explode() {
    if (!this.active) return;
    
    this.active = false;
    
    // Create explosion visual effect
    if (window.game && window.game.particleSystem) {
      window.game.particleSystem.createLargeExplosion(
        this.x + this.width / 2,
        this.y + this.height / 2
      );
    }
    
    // Play explosion sound
    if (window.game && window.game.audioManager) {
      window.game.audioManager.playSound('explosion', 0.8);
    }
    
    // Camera shake
    if (window.game && window.game.camera) {
      window.game.camera.shake(10, 400);
    }
    
    // Damage entities in radius
    if (window.game) {
      const centerX = this.x + this.width / 2;
      const centerY = this.y + this.height / 2;
      
      // Damage player
      if (window.game.player && window.game.player.active) {
        const dist = this.distanceToEntity(window.game.player);
        if (dist < this.explosionRadius) {
          const damageMultiplier = 1 - (dist / this.explosionRadius);
          const damage = Math.floor(this.damage * damageMultiplier);
          window.game.player.takeDamage(damage, performance.now());
        }
      }
      
      // Damage enemies
      window.game.enemies.forEach(enemy => {
        if (enemy.active && enemy.health > 0) {
          const dist = this.distanceToEntity(enemy);
          if (dist < this.explosionRadius) {
            const damageMultiplier = 1 - (dist / this.explosionRadius);
            const damage = Math.floor(this.damage * damageMultiplier);
            enemy.takeDamage(damage);
          }
        }
      });
      
      // Chain reaction - trigger other barrels
      if (window.game.hazardManager) {
        window.game.hazardManager.hazards.forEach(hazard => {
          if (hazard !== this && hazard.active && hazard.hazardType === 'barrel') {
            const dist = this.distanceToEntity(hazard);
            if (dist < this.explosionRadius) {
              hazard.takeDamage(100); // Force explosion
            }
          }
        });
      }
    }
    
    this.destroy();
  }

  /**
   * Calculate distance to entity
   * @param {Entity} entity - Target entity
   * @returns {number} Distance
   */
  distanceToEntity(entity) {
    const dx = (entity.x + entity.width / 2) - (this.x + this.width / 2);
    const dy = (entity.y + entity.height / 2) - (this.y + this.height / 2);
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Render the barrel
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    if (!this.active) return;
    
    // Flash warning
    if (this.aboutToExplode) {
      const flashOn = Math.floor((performance.now() - this.warningTime) / 100) % 2 === 0;
      if (flashOn) {
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
        ctx.globalAlpha = 1;
      }
    }
    
    // Draw barrel body
    ctx.fillStyle = this.aboutToExplode ? '#ff4400' : '#cc4400';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Barrel bands
    ctx.fillStyle = '#222222';
    ctx.fillRect(this.x, this.y + 5, this.width, 4);
    ctx.fillRect(this.x, this.y + this.height - 9, this.width, 4);
    
    // Hazard symbol
    ctx.fillStyle = '#ffff00';
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    
    // Draw warning triangle
    ctx.beginPath();
    ctx.moveTo(cx, cy - 8);
    ctx.lineTo(cx - 7, cy + 5);
    ctx.lineTo(cx + 7, cy + 5);
    ctx.closePath();
    ctx.fill();
    
    // Exclamation mark
    ctx.fillStyle = '#000000';
    ctx.fillRect(cx - 1, cy - 4, 2, 5);
    ctx.fillRect(cx - 1, cy + 3, 2, 2);
    
    // Highlights
    ctx.fillStyle = '#dd5500';
    ctx.fillRect(this.x, this.y, 4, this.height);
    
    // Shadow
    ctx.fillStyle = '#aa3300';
    ctx.fillRect(this.x + this.width - 4, this.y, 4, this.height);
    
    // Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
}


/**
 * SpikeTrap hazard - Floor-based cyclic hazard
 */
class SpikeTrap extends Hazard {
  /**
   * Create a spike trap
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  constructor(x, y) {
    super(x, y, 64, 16, 'spike');
    
    // Spike stats from config
    const config = typeof GameConfig !== 'undefined' && GameConfig.HAZARDS ? 
      GameConfig.HAZARDS.SPIKE : {};
    
    this.damage = config.damage || 30;
    this.cycleTime = (config.cycle || 2) * 1000;
    this.warningDuration = (config.warning || 0.5) * 1000;
    
    this.destructible = false;
    this.damageInterval = 500; // Damage every 0.5s when active
    
    // State
    this.state = 'down'; // down, warning, up
    this.stateTimer = 0;
    this.spikeHeight = 0;
    this.maxSpikeHeight = 20;
    
    this.color = '#555555';
  }

  /**
   * Update spike trap state
   * @param {number} deltaTime - Time since last update
   * @param {number} currentTime - Current game time
   */
  update(deltaTime, currentTime) {
    this.stateTimer += deltaTime;
    
    const downTime = this.cycleTime * 0.4;
    const upTime = this.cycleTime * 0.4;
    
    switch (this.state) {
      case 'down':
        this.spikeHeight = 0;
        this.isActive = false;
        if (this.stateTimer >= downTime) {
          this.state = 'warning';
          this.stateTimer = 0;
          this.showWarning = true;
        }
        break;
        
      case 'warning':
        this.spikeHeight = Math.sin(this.stateTimer / 50) * 3;
        if (this.stateTimer >= this.warningDuration) {
          this.state = 'up';
          this.stateTimer = 0;
          this.showWarning = false;
          this.isActive = true;
          
          // Play activation sound
          if (window.game && window.game.audioManager) {
            window.game.audioManager.playSound('projectile_impact', 0.5);
          }
        }
        break;
        
      case 'up':
        this.spikeHeight = this.maxSpikeHeight;
        if (this.stateTimer >= upTime) {
          this.state = 'down';
          this.stateTimer = 0;
        }
        break;
    }
  }

  /**
   * Render the spike trap
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    // Draw base
    ctx.fillStyle = '#444444';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Warning glow
    if (this.showWarning) {
      const pulse = Math.sin(Date.now() / 50) * 0.3 + 0.5;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#ff4400';
      ctx.fillRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
      ctx.globalAlpha = 1;
    }
    
    // Draw spikes
    if (this.spikeHeight > 0) {
      ctx.fillStyle = '#888888';
      const spikeCount = 8;
      const spikeWidth = this.width / spikeCount;
      
      for (let i = 0; i < spikeCount; i++) {
        const spikeX = this.x + i * spikeWidth + spikeWidth / 2;
        const spikeBase = this.y;
        
        ctx.beginPath();
        ctx.moveTo(spikeX - 3, spikeBase);
        ctx.lineTo(spikeX, spikeBase - this.spikeHeight);
        ctx.lineTo(spikeX + 3, spikeBase);
        ctx.closePath();
        ctx.fill();
        
        // Spike highlight
        ctx.fillStyle = '#aaaaaa';
        ctx.beginPath();
        ctx.moveTo(spikeX - 2, spikeBase);
        ctx.lineTo(spikeX, spikeBase - this.spikeHeight + 2);
        ctx.lineTo(spikeX, spikeBase);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#888888';
      }
    }
    
    // Base metal details
    ctx.fillStyle = '#333333';
    ctx.fillRect(this.x, this.y + this.height - 4, this.width, 4);
    
    // Border
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
}


/**
 * LaserGrid hazard - Continuous energy beam
 */
class LaserGrid extends Hazard {
  /**
   * Create a laser grid
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} length - Laser length
   * @param {boolean} horizontal - Whether laser is horizontal
   */
  constructor(x, y, length = 100, horizontal = true) {
    const width = horizontal ? length : 8;
    const height = horizontal ? 8 : length;
    super(x, y, width, height, 'laser');
    
    // Laser stats from config
    const config = typeof GameConfig !== 'undefined' && GameConfig.HAZARDS ? 
      GameConfig.HAZARDS.LASER : {};
    
    this.damage = config.damage || 15;
    this.damageInterval = 100; // Damage 10 times per second
    
    this.destructible = false;
    this.horizontal = horizontal;
    this.length = length;
    
    // Pattern
    this.pattern = 'static'; // static, moving, pulsing
    this.patternTimer = 0;
    this.patternCycle = 3000;
    this.originalX = x;
    this.originalY = y;
    this.moveRange = 100;
    
    this.color = '#ff0000';
    this.glowColor = '#ff6666';
  }

  /**
   * Set laser pattern
   * @param {string} pattern - Pattern type
   */
  setPattern(pattern) {
    this.pattern = pattern;
  }

  /**
   * Update laser state
   * @param {number} deltaTime - Time since last update
   * @param {number} currentTime - Current game time
   */
  update(deltaTime, currentTime) {
    this.patternTimer += deltaTime;
    
    switch (this.pattern) {
      case 'moving':
        const progress = (this.patternTimer % this.patternCycle) / this.patternCycle;
        const offset = Math.sin(progress * Math.PI * 2) * this.moveRange;
        if (this.horizontal) {
          this.y = this.originalY + offset;
        } else {
          this.x = this.originalX + offset;
        }
        break;
        
      case 'pulsing':
        const pulseProgress = (this.patternTimer % this.patternCycle) / this.patternCycle;
        this.isActive = pulseProgress < 0.7; // Active 70% of the time
        break;
        
      default:
        this.isActive = true;
    }
  }

  /**
   * Render the laser
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    if (!this.isActive && this.pattern === 'pulsing') {
      // Draw dim laser when inactive
      ctx.globalAlpha = 0.3;
    }
    
    // Draw emitter
    ctx.fillStyle = '#333333';
    if (this.horizontal) {
      ctx.fillRect(this.x - 8, this.y - 4, 10, 16);
      ctx.fillRect(this.x + this.width - 2, this.y - 4, 10, 16);
    } else {
      ctx.fillRect(this.x - 4, this.y - 8, 16, 10);
      ctx.fillRect(this.x - 4, this.y + this.height - 2, 16, 10);
    }
    
    // Draw outer glow
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = this.glowColor;
    ctx.fillRect(this.x - 4, this.y - 4, this.width + 8, this.height + 8);
    
    // Draw middle glow
    ctx.globalAlpha = 0.6;
    ctx.fillRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
    
    // Draw beam core
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Draw bright center
    ctx.fillStyle = '#ffffff';
    if (this.horizontal) {
      ctx.fillRect(this.x, this.y + 2, this.width, 4);
    } else {
      ctx.fillRect(this.x + 2, this.y, 4, this.height);
    }
    
    ctx.globalAlpha = 1;
  }
}


/**
 * ToxicZone hazard - Poison area with slowdown
 */
class ToxicZone extends Hazard {
  /**
   * Create a toxic zone
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Zone width
   * @param {number} height - Zone height
   */
  constructor(x, y, width = 100, height = 20) {
    super(x, y, width, height, 'toxic');
    
    // Toxic stats from config
    const config = typeof GameConfig !== 'undefined' && GameConfig.HAZARDS ? 
      GameConfig.HAZARDS.TOXIC : {};
    
    this.damage = config.damage || 5;
    this.slowdown = config.slowdown || 0.3; // 30% speed reduction
    this.damageInterval = 1000; // Damage every second
    
    this.destructible = false;
    
    // Visual
    this.bubbleTimer = 0;
    this.bubbles = [];
    this.color = '#44aa44';
  }

  /**
   * Apply effects to entity in zone
   * @param {Entity} entity - Entity in zone
   * @param {number} currentTime - Current game time
   */
  applyEffects(entity, currentTime) {
    // Apply damage
    this.applyDamage(entity, currentTime);
    
    // Apply slowdown (temporary)
    if (entity.speed && !entity.toxicSlowed) {
      entity.originalSpeed = entity.speed;
      entity.speed *= (1 - this.slowdown);
      entity.toxicSlowed = true;
    }
  }

  /**
   * Remove effects from entity
   * @param {Entity} entity - Entity leaving zone
   */
  removeEffects(entity) {
    if (entity.toxicSlowed && entity.originalSpeed) {
      entity.speed = entity.originalSpeed;
      entity.toxicSlowed = false;
      entity.originalSpeed = undefined;
    }
  }

  /**
   * Update toxic zone
   * @param {number} deltaTime - Time since last update
   * @param {number} currentTime - Current game time
   */
  update(deltaTime, currentTime) {
    // Update bubble animation
    this.bubbleTimer += deltaTime;
    
    // Spawn bubbles
    if (Math.random() < 0.1) {
      this.bubbles.push({
        x: this.x + Math.random() * this.width,
        y: this.y,
        size: 2 + Math.random() * 4,
        speed: 0.5 + Math.random() * 0.5,
        alpha: 1
      });
    }
    
    // Update bubbles
    this.bubbles = this.bubbles.filter(b => {
      b.y -= b.speed * deltaTime / 16;
      b.alpha -= 0.02 * deltaTime / 16;
      return b.alpha > 0 && b.y > this.y - 30;
    });
  }

  /**
   * Render the toxic zone
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    // Draw base pool
    ctx.fillStyle = '#225522';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Draw toxic liquid
    const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    gradient.addColorStop(0, '#66cc66');
    gradient.addColorStop(0.5, '#44aa44');
    gradient.addColorStop(1, '#338833');
    ctx.fillStyle = gradient;
    ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
    
    // Draw surface highlights
    ctx.fillStyle = 'rgba(150, 255, 150, 0.3)';
    for (let i = 0; i < 5; i++) {
      const highlightX = this.x + 10 + i * (this.width / 5);
      const highlightY = this.y + 3 + Math.sin(Date.now() / 200 + i) * 2;
      ctx.fillRect(highlightX, highlightY, 15, 3);
    }
    
    // Draw bubbles
    ctx.fillStyle = '#88ff88';
    this.bubbles.forEach(b => {
      ctx.globalAlpha = b.alpha;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    
    // Border
    ctx.strokeStyle = '#113311';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
}


/**
 * LavaZone hazard - High-damage fire area
 */
class LavaZone extends Hazard {
  /**
   * Create a lava zone
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Zone width
   * @param {number} height - Zone height
   */
  constructor(x, y, width = 100, height = 20) {
    super(x, y, width, height, 'lava');
    
    // Lava stats from config
    const config = typeof GameConfig !== 'undefined' && GameConfig.HAZARDS ? 
      GameConfig.HAZARDS.LAVA : {};
    
    this.damage = config.damage || 40;
    this.damageInterval = 500; // Damage twice per second
    
    this.destructible = false;
    
    // Visual
    this.waveTimer = 0;
    this.particles = [];
    this.color = '#ff6600';
  }

  /**
   * Update lava zone
   * @param {number} deltaTime - Time since last update
   * @param {number} currentTime - Current game time
   */
  update(deltaTime, currentTime) {
    this.waveTimer += deltaTime;
    
    // Spawn fire particles
    if (Math.random() < 0.15) {
      this.particles.push({
        x: this.x + Math.random() * this.width,
        y: this.y,
        size: 3 + Math.random() * 5,
        speedY: -1 - Math.random() * 2,
        speedX: (Math.random() - 0.5) * 0.5,
        alpha: 1,
        color: Math.random() > 0.5 ? '#ff4400' : '#ffaa00'
      });
    }
    
    // Update particles
    this.particles = this.particles.filter(p => {
      p.y += p.speedY * deltaTime / 16;
      p.x += p.speedX * deltaTime / 16;
      p.size *= 0.98;
      p.alpha -= 0.03 * deltaTime / 16;
      return p.alpha > 0 && p.size > 0.5;
    });
  }

  /**
   * Render the lava zone
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    // Draw heat distortion glow
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#ff2200';
    ctx.fillRect(this.x - 10, this.y - 20, this.width + 20, this.height + 20);
    ctx.globalAlpha = 1;
    
    // Draw base
    ctx.fillStyle = '#331100';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Draw lava with animated waves
    const waveOffset = Math.sin(this.waveTimer / 200) * 3;
    
    ctx.fillStyle = '#cc3300';
    ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
    
    // Draw surface
    const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    gradient.addColorStop(0, '#ff6600');
    gradient.addColorStop(0.3, '#ff4400');
    gradient.addColorStop(0.6, '#cc3300');
    gradient.addColorStop(1, '#aa2200');
    ctx.fillStyle = gradient;
    ctx.fillRect(this.x + 3, this.y + 3, this.width - 6, this.height - 6);
    
    // Draw bright spots
    ctx.fillStyle = '#ffaa00';
    for (let i = 0; i < 4; i++) {
      const spotX = this.x + 10 + i * (this.width / 4) + Math.sin(this.waveTimer / 300 + i * 2) * 5;
      const spotY = this.y + 4 + Math.cos(this.waveTimer / 200 + i) * 2;
      ctx.fillRect(spotX, spotY, 12, 4);
    }
    
    // Draw white hot spots
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 3; i++) {
      const spotX = this.x + 20 + i * (this.width / 3) + Math.cos(this.waveTimer / 250 + i * 3) * 3;
      const spotY = this.y + 5;
      ctx.fillRect(spotX, spotY, 4, 2);
    }
    
    // Draw fire particles
    this.particles.forEach(p => {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    });
    ctx.globalAlpha = 1;
    
    // Border
    ctx.strokeStyle = '#221100';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
}
