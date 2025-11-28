/**
 * Hell Knight Boss - Hell biome final boss
 * HP: 4000
 * 4-Phase final boss:
 * Phase 1 (100-75%): Fire Sword attacks
 * Phase 2 (75-50%): Meteor Rain
 * Phase 3 (50-25%): Lava Pools
 * Phase 4 (25-0%): Inferno Mode (all abilities)
 */
class HellKnight extends Entity {
  constructor(x, y) {
    super(x, y, 90, 130);
    
    this.type = 'enemy';
    this.enemyType = 'boss';
    this.isBoss = true;
    this.isFinalBoss = true;
    this.bossId = 7;
    this.bossName = 'Hell Knight';
    
    // Stats
    this.maxHealth = 4000;
    this.health = this.maxHealth;
    this.damage = 60;
    this.speed = 2.0;
    
    // Phase management
    this.currentPhase = 1;
    this.phaseThresholds = [1.0, 0.75, 0.5, 0.25];
    this.phaseNames = ['Fire Sword', 'Meteor Rain', 'Lava Pool', 'Inferno'];
    
    // AI State
    this.aiState = 'combat';
    this.target = null;
    this.facing = -1;
    this.aggroRange = 9999;
    this.attackRange = 200;
    
    // Fire Sword (Phase 1+)
    this.swordSwinging = false;
    this.swordSwingDuration = 600;
    this.swordSwingCooldown = 1500;
    this.swordSwingTimer = 0;
    this.lastSwordSwingTime = 0;
    this.swordDamage = 80;
    this.swordRange = 120;
    this.swordAngle = 0;
    
    // Meteor Rain (Phase 2+)
    this.meteorActive = false;
    this.meteorDuration = 4000;
    this.meteorCooldown = 10000;
    this.meteorTimer = 0;
    this.lastMeteorTime = 0;
    this.meteorDamage = 60;
    this.meteors = [];
    
    // Lava Pools (Phase 3+)
    this.lavaPoolCooldown = 8000;
    this.lastLavaPoolTime = 0;
    this.lavaPoolDamage = 20; // Per second
    this.lavaPoolDuration = 10000;
    this.lavaPools = [];
    
    // Inferno Mode (Phase 4)
    this.infernoActive = false;
    this.infernoDamageMultiplier = 1.5;
    this.infernoSpeedMultiplier = 1.3;
    this.infernoAura = false;
    this.infernoAuraDamage = 5; // Per second when close
    this.infernoAuraRadius = 150;
    
    // Visual
    this.color = '#8a2020';
    this.animationTime = 0;
    this.fireParticles = [];
    
    // Movement
    this.dx = 0;
    this.dy = 0;
    this.gravity = 0.6;
    this.onGround = true;
    
    // Initialize fire particles
    this.initFireParticles();
  }

  /**
   * Initialize fire particle effects
   */
  initFireParticles() {
    for (let i = 0; i < 20; i++) {
      this.fireParticles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        dx: (Math.random() - 0.5) * 2,
        dy: -1 - Math.random() * 2,
        size: 3 + Math.random() * 5,
        life: Math.random()
      });
    }
  }

  /**
   * Update the Hell Knight boss
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
    
    // Update phase based on health
    this.updatePhase();
    
    // Update facing direction
    if (player && player.active) {
      this.facing = player.x > this.x ? 1 : -1;
    }
    
    // Update fire particles
    this.updateFireParticles(deltaTime);
    
    // Update attacks based on phase
    this.updateAttacks(deltaTime, currentTime, player, projectiles);
    
    // Update meteors
    this.updateMeteors(deltaTime, player);
    
    // Update lava pools
    this.updateLavaPools(deltaTime, player);
    
    // Inferno aura damage
    if (this.infernoAura && player && player.active) {
      const dist = Math.sqrt(
        Math.pow(player.x - this.x, 2) + 
        Math.pow(player.y - this.y, 2)
      );
      if (dist < this.infernoAuraRadius) {
        player.takeDamage(this.infernoAuraDamage * (deltaTime / 1000));
      }
    }
    
    // Movement
    this.updateMovement(deltaTime, player);
    
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
   * Update phase based on current health
   */
  updatePhase() {
    const healthPercent = this.health / this.maxHealth;
    
    let newPhase = 1;
    if (healthPercent <= 0.25) {
      newPhase = 4;
    } else if (healthPercent <= 0.5) {
      newPhase = 3;
    } else if (healthPercent <= 0.75) {
      newPhase = 2;
    }
    
    if (newPhase !== this.currentPhase) {
      this.onPhaseChange(newPhase);
      this.currentPhase = newPhase;
    }
  }

  /**
   * Handle phase transition
   */
  onPhaseChange(newPhase) {
    // Phase transition effects
    if (newPhase === 4) {
      // Inferno mode activation
      this.infernoActive = true;
      this.infernoAura = true;
      this.speed *= this.infernoSpeedMultiplier;
      this.damage *= this.infernoDamageMultiplier;
      this.swordDamage *= this.infernoDamageMultiplier;
    }
  }

  /**
   * Update fire particles
   */
  updateFireParticles(deltaTime) {
    this.fireParticles.forEach(p => {
      p.x += p.dx * (deltaTime / 16);
      p.y += p.dy * (deltaTime / 16);
      p.life -= deltaTime / 1000;
      
      if (p.life <= 0) {
        p.x = Math.random() * this.width;
        p.y = this.height;
        p.life = 0.5 + Math.random() * 0.5;
        p.size = 3 + Math.random() * 5;
        
        if (this.infernoActive) {
          p.size *= 1.5;
        }
      }
    });
  }

  /**
   * Update attack patterns
   */
  updateAttacks(deltaTime, currentTime, player, projectiles) {
    // Sword swing
    if (this.swordSwinging) {
      this.swordSwingTimer += deltaTime;
      this.swordAngle = (this.swordSwingTimer / this.swordSwingDuration) * Math.PI;
      
      // Check sword hit
      if (player && player.active && this.swordSwingTimer > 200 && this.swordSwingTimer < 400) {
        if (this.isPlayerInSwordRange(player)) {
          player.takeDamage(this.swordDamage);
        }
      }
      
      if (this.swordSwingTimer >= this.swordSwingDuration) {
        this.swordSwinging = false;
        this.swordSwingTimer = 0;
      }
    } else if (currentTime - this.lastSwordSwingTime > this.swordSwingCooldown) {
      if (player && player.active) {
        const dist = Math.abs(player.x - this.x);
        if (dist < this.attackRange) {
          this.startSwordSwing();
          this.lastSwordSwingTime = currentTime;
        }
      }
    }
    
    // Meteor rain (Phase 2+)
    if (this.currentPhase >= 2) {
      if (this.meteorActive) {
        this.meteorTimer += deltaTime;
        
        // Spawn meteors
        if (Math.random() < 0.05) {
          this.spawnMeteor(player);
        }
        
        if (this.meteorTimer >= this.meteorDuration) {
          this.meteorActive = false;
          this.meteorTimer = 0;
        }
      } else if (currentTime - this.lastMeteorTime > this.meteorCooldown) {
        if (Math.random() < 0.02 || this.currentPhase >= 4) {
          this.startMeteorRain();
          this.lastMeteorTime = currentTime;
        }
      }
    }
    
    // Lava pools (Phase 3+)
    if (this.currentPhase >= 3) {
      if (currentTime - this.lastLavaPoolTime > this.lavaPoolCooldown) {
        if (Math.random() < 0.02 || this.currentPhase >= 4) {
          this.spawnLavaPool(player);
          this.lastLavaPoolTime = currentTime;
        }
      }
    }
  }

  /**
   * Start sword swing attack
   */
  startSwordSwing() {
    this.swordSwinging = true;
    this.swordSwingTimer = 0;
    this.swordAngle = 0;
  }

  /**
   * Check if player is in sword range
   */
  isPlayerInSwordRange(player) {
    const swordTipX = this.x + this.width / 2 + Math.cos(this.swordAngle - Math.PI / 2) * this.swordRange * this.facing;
    const swordTipY = this.y + 40 + Math.sin(this.swordAngle - Math.PI / 2) * this.swordRange;
    
    return Math.abs(swordTipX - (player.x + player.width / 2)) < 60 &&
           Math.abs(swordTipY - (player.y + player.height / 2)) < 60;
  }

  /**
   * Start meteor rain attack
   */
  startMeteorRain() {
    this.meteorActive = true;
    this.meteorTimer = 0;
  }

  /**
   * Spawn a meteor
   */
  spawnMeteor(player) {
    const targetX = player && player.active ? 
      player.x + (Math.random() - 0.5) * 200 : 
      this.x + (Math.random() - 0.5) * 400;
    
    this.meteors.push({
      x: targetX,
      y: -50,
      targetX: targetX,
      targetY: 550, // Ground level
      speed: 8,
      damage: this.meteorDamage,
      size: 20 + Math.random() * 15,
      active: true,
      warning: true,
      warningTime: 1000,
      createdAt: performance.now()
    });
  }

  /**
   * Update meteors
   */
  updateMeteors(deltaTime, player) {
    this.meteors = this.meteors.filter(meteor => {
      if (!meteor.active) return false;
      
      const age = performance.now() - meteor.createdAt;
      
      if (meteor.warning && age < meteor.warningTime) {
        // Still in warning phase
        return true;
      }
      
      meteor.warning = false;
      meteor.y += meteor.speed * (deltaTime / 16);
      
      // Check ground collision
      if (meteor.y >= meteor.targetY) {
        // Impact damage
        if (player && player.active) {
          const dist = Math.abs(player.x - meteor.x);
          if (dist < meteor.size * 2) {
            player.takeDamage(meteor.damage);
          }
        }
        return false;
      }
      
      return true;
    });
  }

  /**
   * Spawn a lava pool
   */
  spawnLavaPool(player) {
    const poolX = player && player.active ? 
      player.x + (Math.random() - 0.5) * 100 : 
      this.x;
    
    this.lavaPools.push({
      x: poolX,
      y: 540, // Ground level
      width: 80 + Math.random() * 40,
      height: 20,
      damage: this.lavaPoolDamage,
      active: true,
      createdAt: performance.now(),
      duration: this.lavaPoolDuration
    });
  }

  /**
   * Update lava pools
   */
  updateLavaPools(deltaTime, player) {
    const currentTime = performance.now();
    
    this.lavaPools = this.lavaPools.filter(pool => {
      if (!pool.active) return false;
      
      const age = currentTime - pool.createdAt;
      if (age >= pool.duration) {
        return false;
      }
      
      // Damage player if standing in pool
      if (player && player.active) {
        if (player.x + player.width > pool.x &&
            player.x < pool.x + pool.width &&
            player.y + player.height > pool.y) {
          player.takeDamage(pool.damage * (deltaTime / 1000));
        }
      }
      
      return true;
    });
  }

  /**
   * Update movement
   */
  updateMovement(deltaTime, player) {
    if (!player || !player.active || this.swordSwinging) {
      this.dx = 0;
      return;
    }
    
    const distX = Math.abs(player.x - this.x);
    
    if (distX > this.attackRange) {
      this.dx = Math.sign(player.x - this.x) * this.speed;
    } else if (distX < 80) {
      this.dx = -Math.sign(player.x - this.x) * this.speed * 0.5;
    } else {
      this.dx = 0;
    }
  }

  /**
   * Take damage
   * @param {number} amount - Damage amount
   * @returns {boolean} True if killed
   */
  takeDamage(amount) {
    this.health -= amount;
    
    if (this.health <= 0) {
      this.health = 0;
      this.destroy();
      return true;
    }
    
    return false;
  }

  /**
   * Render the Hell Knight
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    if (!this.active) return;
    
    ctx.save();
    
    // Lava pools
    this.lavaPools.forEach(pool => {
      const age = performance.now() - pool.createdAt;
      const alpha = Math.min(1, age / 500) * (1 - age / pool.duration);
      
      ctx.fillStyle = `rgba(255, 100, 0, ${0.8 * alpha})`;
      ctx.beginPath();
      ctx.ellipse(pool.x + pool.width / 2, pool.y, pool.width / 2, pool.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Bubbles
      ctx.fillStyle = `rgba(255, 200, 0, ${0.6 * alpha})`;
      for (let i = 0; i < 3; i++) {
        const bx = pool.x + Math.random() * pool.width;
        const by = pool.y - Math.random() * 10;
        ctx.beginPath();
        ctx.arc(bx, by, 3 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    // Meteor warnings and meteors
    this.meteors.forEach(meteor => {
      if (meteor.warning) {
        // Warning indicator
        ctx.strokeStyle = '#ff4400';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(meteor.targetX, 0);
        ctx.lineTo(meteor.targetX, meteor.targetY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Warning circle
        const warningPulse = Math.sin(performance.now() / 100) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 68, 0, ${0.3 * warningPulse})`;
        ctx.beginPath();
        ctx.arc(meteor.targetX, meteor.targetY, meteor.size * 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Meteor
        ctx.fillStyle = '#ff4400';
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, meteor.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Trail
        ctx.fillStyle = 'rgba(255, 150, 0, 0.5)';
        for (let i = 1; i <= 3; i++) {
          ctx.beginPath();
          ctx.arc(meteor.x, meteor.y - i * 15, meteor.size * (1 - i * 0.2), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
    
    // Inferno aura
    if (this.infernoAura) {
      const pulse = Math.sin(this.animationTime / 100) * 0.2 + 0.3;
      ctx.fillStyle = `rgba(255, 100, 0, ${pulse})`;
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.infernoAuraRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Fire particles
    this.fireParticles.forEach(p => {
      const alpha = p.life;
      ctx.fillStyle = this.infernoActive ? 
        `rgba(255, ${150 + Math.random() * 100}, 0, ${alpha})` :
        `rgba(255, ${100 + Math.random() * 50}, 0, ${alpha})`;
      ctx.beginPath();
      ctx.arc(this.x + p.x, this.y + p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Body
    ctx.fillStyle = this.color;
    
    // Legs
    const legPhase = Math.sin(this.animationTime / 200) * 5;
    ctx.fillRect(this.x + 15, this.y + 90 + legPhase, 25, 40);
    ctx.fillRect(this.x + 50, this.y + 90 - legPhase, 25, 40);
    
    // Torso
    ctx.fillRect(this.x + 10, this.y + 40, 70, 55);
    
    // Shoulders (armor)
    ctx.fillStyle = '#5a2020';
    ctx.fillRect(this.x, this.y + 35, 25, 20);
    ctx.fillRect(this.x + 65, this.y + 35, 25, 20);
    
    // Spikes on shoulders
    ctx.fillStyle = '#3a1010';
    ctx.beginPath();
    ctx.moveTo(this.x - 5, this.y + 45);
    ctx.lineTo(this.x - 15, this.y + 25);
    ctx.lineTo(this.x + 5, this.y + 40);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(this.x + 95, this.y + 45);
    ctx.lineTo(this.x + 105, this.y + 25);
    ctx.lineTo(this.x + 85, this.y + 40);
    ctx.fill();
    
    // Head
    ctx.fillStyle = '#6a1515';
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + 25, 22, 0, Math.PI * 2);
    ctx.fill();
    
    // Horns
    ctx.fillStyle = '#4a1010';
    ctx.beginPath();
    ctx.moveTo(this.x + 25, this.y + 15);
    ctx.lineTo(this.x + 10, this.y - 25);
    ctx.lineTo(this.x + 35, this.y + 10);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(this.x + 65, this.y + 15);
    ctx.lineTo(this.x + 80, this.y - 25);
    ctx.lineTo(this.x + 55, this.y + 10);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#ffaa00';
    const eyeGlow = Math.sin(this.animationTime / 150) * 0.3 + 0.7;
    ctx.globalAlpha = eyeGlow;
    ctx.beginPath();
    ctx.arc(this.x + 35, this.y + 22, 5, 0, Math.PI * 2);
    ctx.arc(this.x + 55, this.y + 22, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Fire sword
    const swordArmX = this.facing > 0 ? this.x + 75 : this.x - 10;
    const swordBaseY = this.y + 45;
    
    // Arm
    ctx.fillStyle = this.color;
    ctx.fillRect(swordArmX, swordBaseY, 20, 45);
    
    // Sword
    ctx.save();
    ctx.translate(swordArmX + 10, swordBaseY + 20);
    
    if (this.swordSwinging) {
      ctx.rotate((this.swordAngle - Math.PI / 2) * this.facing);
    } else {
      ctx.rotate(-Math.PI / 6 * this.facing);
    }
    
    // Blade
    const bladeGlow = Math.sin(this.animationTime / 100) * 0.2 + 0.8;
    ctx.fillStyle = `rgba(255, ${100 * bladeGlow}, 0, ${bladeGlow})`;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-8, -80);
    ctx.lineTo(0, -90);
    ctx.lineTo(8, -80);
    ctx.closePath();
    ctx.fill();
    
    // Flame effect on blade
    ctx.fillStyle = `rgba(255, ${200 * bladeGlow}, 50, 0.6)`;
    for (let i = 0; i < 5; i++) {
      const fx = (Math.random() - 0.5) * 10;
      const fy = -20 - Math.random() * 60;
      const fs = 3 + Math.random() * 5;
      ctx.beginPath();
      ctx.arc(fx, fy, fs, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Handle
    ctx.fillStyle = '#4a2020';
    ctx.fillRect(-5, 0, 10, 20);
    
    ctx.restore();
    
    // Phase indicator
    const phaseColors = ['#ff6600', '#ff4400', '#ff2200', '#ff0000'];
    
    // Health bar
    const barWidth = 120;
    const barHeight = 10;
    const barX = this.x + (this.width - barWidth) / 2;
    const barY = this.y - 40;
    
    ctx.fillStyle = '#330000';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Health with phase colors
    const healthPercent = this.health / this.maxHealth;
    ctx.fillStyle = phaseColors[this.currentPhase - 1];
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    
    // Phase markers
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    for (let i = 1; i < 4; i++) {
      const markerX = barX + barWidth * this.phaseThresholds[i];
      ctx.beginPath();
      ctx.moveTo(markerX, barY);
      ctx.lineTo(markerX, barY + barHeight);
      ctx.stroke();
    }
    
    ctx.strokeStyle = '#660000';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    // Phase name
    ctx.fillStyle = phaseColors[this.currentPhase - 1];
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Phase ${this.currentPhase}: ${this.phaseNames[this.currentPhase - 1]}`, this.x + this.width / 2, barY - 20);
    
    // Boss name
    ctx.fillStyle = '#ff4400';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(this.bossName, this.x + this.width / 2, barY - 5);
    
    ctx.restore();
  }

  /**
   * Apply difficulty multiplier
   * @param {number} multiplier - Difficulty multiplier
   */
  applyDifficulty(multiplier) {
    this.maxHealth = Math.floor(this.maxHealth * multiplier);
    this.health = this.maxHealth;
    this.damage = Math.floor(this.damage * multiplier);
    this.swordDamage = Math.floor(this.swordDamage * multiplier);
    this.meteorDamage = Math.floor(this.meteorDamage * multiplier);
    this.lavaPoolDamage = Math.floor(this.lavaPoolDamage * multiplier);
    this.infernoAuraDamage = Math.floor(this.infernoAuraDamage * multiplier);
  }

  /**
   * Destroy the Hell Knight
   */
  destroy() {
    this.active = false;
    this.lavaPools = [];
    this.meteors = [];
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
    return this.x < other.x + other.width &&
           this.x + this.width > other.x &&
           this.y < other.y + other.height &&
           this.y + this.height > other.y;
  }
}
