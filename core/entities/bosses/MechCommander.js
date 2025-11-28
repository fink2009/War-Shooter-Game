/**
 * Mech Commander Boss - Facility biome boss
 * Phase 1: Mech (3000 HP) - Minigun, missiles
 * Phase 2: Pilot (500 HP) - Fast, pistol
 */
class MechCommander extends Entity {
  constructor(x, y) {
    super(x, y, 100, 140);
    
    this.type = 'enemy';
    this.enemyType = 'boss';
    this.isBoss = true;
    this.bossId = 6;
    this.bossName = 'Mech Commander';
    
    // Phase management
    this.phase = 1; // 1 = Mech, 2 = Pilot
    
    // Mech stats (Phase 1)
    this.mechMaxHealth = 3000;
    this.mechHealth = this.mechMaxHealth;
    
    // Pilot stats (Phase 2)
    this.pilotMaxHealth = 500;
    this.pilotHealth = this.pilotMaxHealth;
    
    // Current stats
    this.maxHealth = this.mechMaxHealth;
    this.health = this.mechHealth;
    this.damage = 45;
    this.speed = 1.5;
    
    // AI State
    this.aiState = 'combat';
    this.target = null;
    this.facing = -1;
    this.aggroRange = 9999;
    this.attackRange = 500;
    
    // Minigun (Phase 1)
    this.minigunActive = false;
    this.minigunDuration = 3000;
    this.minigunCooldown = 5000;
    this.minigunFireRate = 100; // ms between shots
    this.minigunDamage = 12;
    this.minigunTimer = 0;
    this.lastMinigunTime = 0;
    this.lastMinigunShotTime = 0;
    this.minigunAngle = 0;
    this.minigunSpinup = 0;
    
    // Missiles (Phase 1)
    this.missileCooldown = 8000;
    this.missileCount = 4;
    this.missileDamage = 50;
    this.missileSpeed = 6;
    this.lastMissileTime = 0;
    
    // Pilot (Phase 2)
    this.pilotSpeed = 4;
    this.pilotShootCooldown = 400;
    this.pilotDamage = 20;
    this.lastPilotShotTime = 0;
    this.pilotDodgeCooldown = 2000;
    this.lastDodgeTime = 0;
    
    // Visual
    this.mechColor = '#4a5a6a';
    this.pilotColor = '#6a7a8a';
    this.animationTime = 0;
    this.legPhase = 0;
    this.ejecting = false;
    this.ejectTimer = 0;
    
    // Movement
    this.dx = 0;
    this.dy = 0;
    this.gravity = 0.6;
    this.onGround = true;
  }

  /**
   * Update the Mech Commander boss
   * @param {number} deltaTime - Time since last update
   * @param {Object} player - Player entity
   * @param {Array} enemies - Array to add spawned entities
   * @param {Array} projectiles - Array to add projectiles
   */
  update(deltaTime, player, enemies, projectiles) {
    if (!this.active || this.health <= 0) return;
    
    const currentTime = performance.now();
    this.animationTime += deltaTime;
    this.target = player;
    
    // Handle ejection sequence
    if (this.ejecting) {
      this.updateEjection(deltaTime);
      return;
    }
    
    // Update facing direction
    if (player && player.active) {
      this.facing = player.x > this.x ? 1 : -1;
    }
    
    if (this.phase === 1) {
      this.updateMechPhase(deltaTime, currentTime, player, projectiles);
    } else {
      this.updatePilotPhase(deltaTime, currentTime, player, projectiles);
    }
    
    // Apply gravity
    if (!this.onGround) {
      this.dy += this.gravity;
    }
    
    this.x += this.dx;
    this.y += this.dy;
    
    // Clamp to world bounds
    this.x = Math.max(0, Math.min(this.x, 2800));
  }

  /**
   * Update mech phase behavior
   */
  updateMechPhase(deltaTime, currentTime, player, projectiles) {
    this.legPhase += deltaTime * 0.005;
    
    // Movement
    if (player && player.active && !this.minigunActive) {
      const distX = Math.abs(player.x - this.x);
      
      if (distX > this.attackRange) {
        this.dx = Math.sign(player.x - this.x) * this.speed;
      } else if (distX < 200) {
        this.dx = -Math.sign(player.x - this.x) * this.speed * 0.5;
      } else {
        this.dx = 0;
      }
    } else if (this.minigunActive) {
      this.dx = 0;
    }
    
    // Minigun attack
    if (this.minigunActive) {
      this.minigunTimer += deltaTime;
      this.minigunSpinup = Math.min(1, this.minigunSpinup + deltaTime / 500);
      
      // Fire minigun
      if (this.minigunSpinup >= 1 && currentTime - this.lastMinigunShotTime > this.minigunFireRate) {
        this.fireMinigun(player, projectiles);
        this.lastMinigunShotTime = currentTime;
      }
      
      // Update aim
      if (player && player.active) {
        this.minigunAngle = Math.atan2(
          player.y + player.height / 2 - (this.y + 40),
          player.x + player.width / 2 - (this.x + this.width / 2)
        );
      }
      
      if (this.minigunTimer >= this.minigunDuration) {
        this.minigunActive = false;
        this.minigunTimer = 0;
        this.minigunSpinup = 0;
      }
    } else if (currentTime - this.lastMinigunTime > this.minigunCooldown) {
      if (player && player.active && Math.abs(player.x - this.x) < this.attackRange) {
        this.minigunActive = true;
        this.lastMinigunTime = currentTime;
      }
    }
    
    // Missile attack
    if (!this.minigunActive && currentTime - this.lastMissileTime > this.missileCooldown) {
      if (player && player.active && Math.random() < 0.02) {
        this.fireMissiles(player, projectiles);
        this.lastMissileTime = currentTime;
      }
    }
  }

  /**
   * Fire minigun
   */
  fireMinigun(player, projectiles) {
    if (!projectiles) return;
    
    const spread = (Math.random() - 0.5) * 0.2;
    const angle = this.minigunAngle + spread;
    
    const projectile = {
      x: this.x + this.width / 2 + Math.cos(this.minigunAngle) * 40,
      y: this.y + 40 + Math.sin(this.minigunAngle) * 40,
      width: 6,
      height: 6,
      dx: Math.cos(angle) * 15,
      dy: Math.sin(angle) * 15,
      damage: this.minigunDamage,
      owner: this,
      active: true,
      type: 'bullet',
      color: '#ffaa00',
      lifetime: 2000,
      createdAt: performance.now(),
      
      update: function(deltaTime) {
        this.x += this.dx * (deltaTime / 16);
        this.y += this.dy * (deltaTime / 16);
        if (performance.now() - this.createdAt > this.lifetime) {
          this.active = false;
        }
      },
      
      render: function(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      },
      
      collidesWith: function(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
      },
      
      destroy: function() { this.active = false; },
      getBounds: function() {
        return { left: this.x, right: this.x + this.width, top: this.y, bottom: this.y + this.height };
      }
    };
    
    projectiles.push(projectile);
  }

  /**
   * Fire homing missiles
   */
  fireMissiles(player, projectiles) {
    if (!projectiles || !player) return;
    
    for (let i = 0; i < this.missileCount; i++) {
      const angle = -Math.PI / 2 + (i - (this.missileCount - 1) / 2) * 0.3;
      
      const missile = {
        x: this.x + this.width / 2,
        y: this.y + 20,
        width: 10,
        height: 20,
        dx: Math.cos(angle) * 3,
        dy: Math.sin(angle) * 3,
        damage: this.missileDamage,
        owner: this,
        active: true,
        type: 'missile',
        color: '#ff4400',
        lifetime: 5000,
        createdAt: performance.now(),
        target: player,
        homingStrength: 0.02,
        speed: this.missileSpeed,
        
        update: function(deltaTime) {
          // Homing behavior
          if (this.target && this.target.active) {
            const targetX = this.target.x + this.target.width / 2;
            const targetY = this.target.y + this.target.height / 2;
            const angle = Math.atan2(targetY - this.y, targetX - this.x);
            const currentAngle = Math.atan2(this.dy, this.dx);
            const angleDiff = angle - currentAngle;
            const adjustedAngle = currentAngle + angleDiff * this.homingStrength;
            
            this.dx = Math.cos(adjustedAngle) * this.speed;
            this.dy = Math.sin(adjustedAngle) * this.speed;
          }
          
          this.x += this.dx * (deltaTime / 16);
          this.y += this.dy * (deltaTime / 16);
          
          if (performance.now() - this.createdAt > this.lifetime) {
            this.active = false;
          }
        },
        
        render: function(ctx) {
          ctx.save();
          const angle = Math.atan2(this.dy, this.dx);
          ctx.translate(this.x, this.y);
          ctx.rotate(angle + Math.PI / 2);
          
          // Missile body
          ctx.fillStyle = '#666666';
          ctx.fillRect(-5, -10, 10, 20);
          
          // Nose cone
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.moveTo(0, -15);
          ctx.lineTo(-5, -10);
          ctx.lineTo(5, -10);
          ctx.closePath();
          ctx.fill();
          
          // Fins
          ctx.fillStyle = '#444444';
          ctx.beginPath();
          ctx.moveTo(-8, 10);
          ctx.lineTo(-5, 5);
          ctx.lineTo(-5, 10);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(8, 10);
          ctx.lineTo(5, 5);
          ctx.lineTo(5, 10);
          ctx.closePath();
          ctx.fill();
          
          // Exhaust
          ctx.fillStyle = '#ffaa00';
          ctx.fillRect(-3, 10, 6, 5 + Math.random() * 5);
          
          ctx.restore();
        },
        
        collidesWith: function(other) {
          return this.x - 5 < other.x + other.width &&
                 this.x + 5 > other.x &&
                 this.y - 10 < other.y + other.height &&
                 this.y + 10 > other.y;
        },
        
        destroy: function() { this.active = false; },
        getBounds: function() {
          return { left: this.x - 5, right: this.x + 5, top: this.y - 10, bottom: this.y + 10 };
        }
      };
      
      projectiles.push(missile);
    }
  }

  /**
   * Update pilot phase behavior
   */
  updatePilotPhase(deltaTime, currentTime, player, projectiles) {
    if (!player || !player.active) return;
    
    const distX = Math.abs(player.x - this.x);
    
    // Fast movement
    if (distX > 250) {
      this.dx = Math.sign(player.x - this.x) * this.pilotSpeed;
    } else if (distX < 150) {
      this.dx = -Math.sign(player.x - this.x) * this.pilotSpeed;
    } else {
      this.dx = 0;
    }
    
    // Dodge roll
    if (currentTime - this.lastDodgeTime > this.pilotDodgeCooldown && Math.random() < 0.01) {
      this.dx = -Math.sign(player.x - this.x) * 10;
      this.lastDodgeTime = currentTime;
    }
    
    // Shoot
    if (currentTime - this.lastPilotShotTime > this.pilotShootCooldown) {
      this.firePilotShot(player, projectiles);
      this.lastPilotShotTime = currentTime;
    }
  }

  /**
   * Fire pilot shot
   */
  firePilotShot(player, projectiles) {
    if (!projectiles || !player) return;
    
    const angle = Math.atan2(
      player.y + player.height / 2 - (this.y + this.height / 2),
      player.x + player.width / 2 - (this.x + this.width / 2)
    );
    
    const projectile = {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
      width: 8,
      height: 8,
      dx: Math.cos(angle) * 12,
      dy: Math.sin(angle) * 12,
      damage: this.pilotDamage,
      owner: this,
      active: true,
      type: 'bullet',
      color: '#ff6600',
      lifetime: 2000,
      createdAt: performance.now(),
      
      update: function(deltaTime) {
        this.x += this.dx * (deltaTime / 16);
        this.y += this.dy * (deltaTime / 16);
        if (performance.now() - this.createdAt > this.lifetime) {
          this.active = false;
        }
      },
      
      render: function(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      },
      
      collidesWith: function(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
      },
      
      destroy: function() { this.active = false; },
      getBounds: function() {
        return { left: this.x, right: this.x + this.width, top: this.y, bottom: this.y + this.height };
      }
    };
    
    projectiles.push(projectile);
  }

  /**
   * Update ejection sequence
   */
  updateEjection(deltaTime) {
    this.ejectTimer += deltaTime;
    
    if (this.ejectTimer >= 1500) {
      // Transition to pilot phase
      this.phase = 2;
      this.ejecting = false;
      this.ejectTimer = 0;
      
      // Update dimensions for pilot
      this.width = 30;
      this.height = 50;
      this.y = this.y + 90; // Adjust position
      
      // Update stats
      this.maxHealth = this.pilotMaxHealth;
      this.health = this.pilotHealth;
      this.speed = this.pilotSpeed;
      this.bossName = 'Commander';
    }
  }

  /**
   * Take damage
   * @param {number} amount - Damage amount
   * @returns {boolean} True if killed
   */
  takeDamage(amount) {
    if (this.ejecting) return false;
    
    if (this.phase === 1) {
      this.mechHealth -= amount;
      this.health = this.mechHealth;
      
      if (this.mechHealth <= 0) {
        // Start ejection sequence
        this.ejecting = true;
        this.ejectTimer = 0;
        this.minigunActive = false;
      }
    } else {
      this.pilotHealth -= amount;
      this.health = this.pilotHealth;
      
      if (this.pilotHealth <= 0) {
        this.health = 0;
        this.destroy();
        return true;
      }
    }
    
    return false;
  }

  /**
   * Render the Mech Commander
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    if (!this.active) return;
    
    ctx.save();
    
    if (this.phase === 1) {
      this.renderMech(ctx);
    } else {
      this.renderPilot(ctx);
    }
    
    // Health bar
    const barWidth = this.phase === 1 ? 120 : 60;
    const barHeight = 8;
    const barX = this.x + (this.width - barWidth) / 2;
    const barY = this.y - 30;
    
    ctx.fillStyle = '#330000';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    ctx.fillStyle = this.phase === 1 ? '#ff6600' : '#ff3333';
    ctx.fillRect(barX, barY, barWidth * (this.health / this.maxHealth), barHeight);
    
    ctx.strokeStyle = '#660000';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    // Phase indicator
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Phase ${this.phase}`, this.x + this.width / 2, barY - 15);
    
    // Boss name
    ctx.font = 'bold 14px monospace';
    ctx.fillText(this.bossName, this.x + this.width / 2, barY - 5);
    
    ctx.restore();
  }

  /**
   * Render mech phase
   */
  renderMech(ctx) {
    const legOffset = Math.sin(this.legPhase) * 5;
    
    // Ejection effect
    if (this.ejecting) {
      ctx.globalAlpha = 1 - (this.ejectTimer / 1500) * 0.5;
    }
    
    // Legs
    ctx.fillStyle = '#3a4a5a';
    ctx.fillRect(this.x + 15, this.y + 100 + legOffset, 25, 40);
    ctx.fillRect(this.x + 60, this.y + 100 - legOffset, 25, 40);
    
    // Feet
    ctx.fillStyle = '#2a3a4a';
    ctx.fillRect(this.x + 10, this.y + 135 + legOffset, 35, 8);
    ctx.fillRect(this.x + 55, this.y + 135 - legOffset, 35, 8);
    
    // Body
    ctx.fillStyle = this.mechColor;
    ctx.fillRect(this.x + 10, this.y + 40, 80, 65);
    
    // Cockpit
    ctx.fillStyle = '#88aacc';
    ctx.fillRect(this.x + 30, this.y + 50, 40, 25);
    ctx.fillStyle = '#aaccee';
    ctx.fillRect(this.x + 35, this.y + 55, 30, 15);
    
    // Arms
    ctx.fillStyle = '#4a5a6a';
    const armOffset = this.minigunActive ? Math.sin(this.animationTime / 50) * 2 : 0;
    ctx.fillRect(this.x - 15, this.y + 45 + armOffset, 20, 50);
    ctx.fillRect(this.x + 95, this.y + 45 - armOffset, 20, 50);
    
    // Minigun (left arm)
    ctx.fillStyle = '#333333';
    if (this.facing > 0) {
      ctx.save();
      ctx.translate(this.x + 105, this.y + 60);
      ctx.rotate(this.minigunAngle);
      
      // Barrels
      for (let i = 0; i < 6; i++) {
        const barrelAngle = (i / 6) * Math.PI * 2 + (this.minigunSpinup * this.animationTime / 30);
        const bx = Math.cos(barrelAngle) * 5;
        const by = Math.sin(barrelAngle) * 5;
        ctx.fillRect(0 + bx, -2 + by, 30, 4);
      }
      
      // Barrel housing
      ctx.fillStyle = '#444444';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    } else {
      ctx.save();
      ctx.translate(this.x - 5, this.y + 60);
      ctx.rotate(this.minigunAngle);
      
      for (let i = 0; i < 6; i++) {
        const barrelAngle = (i / 6) * Math.PI * 2 + (this.minigunSpinup * this.animationTime / 30);
        const bx = Math.cos(barrelAngle) * 5;
        const by = Math.sin(barrelAngle) * 5;
        ctx.fillRect(-30 + bx, -2 + by, 30, 4);
      }
      
      ctx.fillStyle = '#444444';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
    
    // Missile pods (shoulders)
    ctx.fillStyle = '#555555';
    ctx.fillRect(this.x + 5, this.y + 35, 25, 15);
    ctx.fillRect(this.x + 70, this.y + 35, 25, 15);
    
    // Missile holes
    ctx.fillStyle = '#333333';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(this.x + 12 + i * 6, this.y + 42, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x + 77 + i * 6, this.y + 42, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Head
    ctx.fillStyle = '#5a6a7a';
    ctx.fillRect(this.x + 35, this.y + 20, 30, 25);
    
    // Visor
    ctx.fillStyle = '#ff4400';
    const visorGlow = Math.sin(this.animationTime / 200) * 0.2 + 0.8;
    ctx.globalAlpha = visorGlow;
    ctx.fillRect(this.x + 40, this.y + 28, 20, 8);
    ctx.globalAlpha = 1;
    
    // Antenna
    ctx.fillStyle = '#333333';
    ctx.fillRect(this.x + 48, this.y + 10, 4, 12);
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(this.x + 50, this.y + 8, 3, 0, Math.PI * 2);
    ctx.fill();
    
    if (this.ejecting) {
      ctx.globalAlpha = 1;
      // Explosion effects
      ctx.fillStyle = '#ff6600';
      for (let i = 0; i < 5; i++) {
        const ex = this.x + Math.random() * this.width;
        const ey = this.y + Math.random() * this.height;
        ctx.beginPath();
        ctx.arc(ex, ey, 10 + Math.random() * 10, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /**
   * Render pilot phase
   */
  renderPilot(ctx) {
    // Body
    ctx.fillStyle = this.pilotColor;
    ctx.fillRect(this.x + 5, this.y + 20, 20, 25);
    
    // Head
    ctx.fillStyle = '#d4a574';
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + 12, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Helmet
    ctx.fillStyle = '#4a5a6a';
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + 10, 11, Math.PI, Math.PI * 2);
    ctx.fill();
    
    // Legs
    ctx.fillStyle = '#3a4a5a';
    ctx.fillRect(this.x + 5, this.y + 45, 8, 20);
    ctx.fillRect(this.x + 17, this.y + 45, 8, 20);
    
    // Arm with gun
    ctx.fillStyle = this.pilotColor;
    const armX = this.facing > 0 ? this.x + 20 : this.x - 5;
    ctx.fillRect(armX, this.y + 25, 15, 8);
    
    // Gun
    ctx.fillStyle = '#333333';
    ctx.fillRect(armX + (this.facing > 0 ? 10 : -5), this.y + 26, 10, 6);
  }

  /**
   * Apply difficulty multiplier
   * @param {number} multiplier - Difficulty multiplier
   */
  applyDifficulty(multiplier) {
    this.mechMaxHealth = Math.floor(this.mechMaxHealth * multiplier);
    this.mechHealth = this.mechMaxHealth;
    this.pilotMaxHealth = Math.floor(this.pilotMaxHealth * multiplier);
    this.pilotHealth = this.pilotMaxHealth;
    this.maxHealth = this.mechMaxHealth;
    this.health = this.mechHealth;
    this.damage = Math.floor(this.damage * multiplier);
    this.minigunDamage = Math.floor(this.minigunDamage * multiplier);
    this.missileDamage = Math.floor(this.missileDamage * multiplier);
    this.pilotDamage = Math.floor(this.pilotDamage * multiplier);
  }

  /**
   * Destroy the Mech Commander
   */
  destroy() {
    this.active = false;
  }

  /**
   * Get bounding box
   */
  getBounds() {
    return {
      left: this.x,
      right: this.x + this.width,
      top: this.y,
      bottom: this.y + this.height
    };
  }

  /**
   * Collision check
   */
  collidesWith(other) {
    if (this.ejecting) return false;
    
    return this.x < other.x + other.width &&
           this.x + this.width > other.x &&
           this.y < other.y + other.height &&
           this.y + this.height > other.y;
  }
}
