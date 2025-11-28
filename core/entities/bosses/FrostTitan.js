/**
 * Frost Titan Boss - Snow biome boss
 * HP: 2500
 * Abilities: Ice armor damage reduction, freeze beam, blizzard summon
 */
class FrostTitan extends Entity {
  constructor(x, y) {
    super(x, y, 80, 120);
    
    this.type = 'enemy';
    this.enemyType = 'boss';
    this.isBoss = true;
    this.bossId = 5;
    this.bossName = 'Frost Titan';
    
    // Stats
    this.maxHealth = 2500;
    this.health = this.maxHealth;
    this.damage = 35;
    this.speed = 1.2;
    
    // AI State
    this.aiState = 'patrol';
    this.target = null;
    this.facing = -1;
    this.aggroRange = 9999;
    this.attackRange = 350;
    
    // Ice Armor
    this.iceArmorActive = true;
    this.iceArmorReduction = 0.5; // 50% damage reduction
    this.iceArmorHealth = 500;
    this.iceArmorMaxHealth = 500;
    this.iceArmorRegenCooldown = 15000;
    this.lastArmorBreakTime = 0;
    
    // Freeze Beam
    this.freezeBeamActive = false;
    this.freezeBeamDuration = 2000;
    this.freezeBeamCooldown = 6000;
    this.freezeBeamDamage = 15; // Per tick
    this.freezeBeamTimer = 0;
    this.lastFreezeBeamTime = 0;
    this.freezeBeamAngle = 0;
    
    // Blizzard
    this.blizzardActive = false;
    this.blizzardDuration = 5000;
    this.blizzardCooldown = 12000;
    this.blizzardDamage = 8; // Per second
    this.blizzardRadius = 300;
    this.blizzardTimer = 0;
    this.lastBlizzardTime = 0;
    this.blizzardParticles = [];
    
    // Visual
    this.color = '#88ccff';
    this.animationTime = 0;
    
    // Movement
    this.dx = 0;
    this.dy = 0;
    this.gravity = 0.6;
    this.onGround = true;
  }

  /**
   * Update the Frost Titan boss
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
    
    // Update facing direction
    if (player && player.active) {
      this.facing = player.x > this.x ? 1 : -1;
    }
    
    // Ice armor regeneration
    this.updateIceArmor(currentTime);
    
    // Attack cooldowns and state management
    this.updateAttacks(deltaTime, currentTime, player, projectiles);
    
    // Update blizzard
    if (this.blizzardActive) {
      this.updateBlizzard(deltaTime, player);
    }
    
    // Movement
    if (!this.freezeBeamActive) {
      this.updateMovement(deltaTime, player);
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
   * Update ice armor regeneration
   */
  updateIceArmor(currentTime) {
    if (!this.iceArmorActive && currentTime - this.lastArmorBreakTime > this.iceArmorRegenCooldown) {
      this.iceArmorActive = true;
      this.iceArmorHealth = this.iceArmorMaxHealth;
    }
  }

  /**
   * Update attack patterns
   */
  updateAttacks(deltaTime, currentTime, player, projectiles) {
    // Freeze beam attack
    if (this.freezeBeamActive) {
      this.freezeBeamTimer += deltaTime;
      
      if (player && player.active) {
        this.freezeBeamAngle = Math.atan2(
          player.y + player.height / 2 - (this.y + this.height / 2),
          player.x + player.width / 2 - (this.x + this.width / 2)
        );
        
        // Check if player is in freeze beam
        if (this.isPlayerInFreezeBeam(player)) {
          player.takeDamage(this.freezeBeamDamage * (deltaTime / 1000));
          // Apply slow effect
          if (!player.frozenSlowActive) {
            player.frozenSlowActive = true;
            player.speed *= 0.5;
          }
        }
      }
      
      if (this.freezeBeamTimer >= this.freezeBeamDuration) {
        this.freezeBeamActive = false;
        this.freezeBeamTimer = 0;
        // Remove slow effect
        if (player && player.frozenSlowActive) {
          player.speed *= 2;
          player.frozenSlowActive = false;
        }
      }
    } else if (currentTime - this.lastFreezeBeamTime > this.freezeBeamCooldown) {
      if (player && player.active) {
        const dist = Math.abs(player.x - this.x);
        if (dist < this.attackRange && Math.random() < 0.02) {
          this.startFreezeBeam();
          this.lastFreezeBeamTime = currentTime;
        }
      }
    }
    
    // Blizzard attack
    if (!this.blizzardActive && currentTime - this.lastBlizzardTime > this.blizzardCooldown) {
      if (this.health < this.maxHealth * 0.7 && Math.random() < 0.01) {
        this.startBlizzard();
        this.lastBlizzardTime = currentTime;
      }
    }
  }

  /**
   * Start freeze beam attack
   */
  startFreezeBeam() {
    this.freezeBeamActive = true;
    this.freezeBeamTimer = 0;
  }

  /**
   * Check if player is in freeze beam
   */
  isPlayerInFreezeBeam(player) {
    const beamStartX = this.x + this.width / 2;
    const beamStartY = this.y + this.height / 3;
    const beamLength = 400;
    
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    
    // Check if player is within beam cone (30 degree width)
    const angleToPlayer = Math.atan2(playerCenterY - beamStartY, playerCenterX - beamStartX);
    const angleDiff = Math.abs(angleToPlayer - this.freezeBeamAngle);
    
    const distToPlayer = Math.sqrt(
      Math.pow(playerCenterX - beamStartX, 2) + 
      Math.pow(playerCenterY - beamStartY, 2)
    );
    
    return angleDiff < Math.PI / 12 && distToPlayer < beamLength;
  }

  /**
   * Start blizzard attack
   */
  startBlizzard() {
    this.blizzardActive = true;
    this.blizzardTimer = 0;
    this.blizzardParticles = [];
    
    // Generate blizzard particles
    for (let i = 0; i < 100; i++) {
      this.blizzardParticles.push({
        x: this.x + Math.random() * this.blizzardRadius * 2 - this.blizzardRadius,
        y: this.y - 100 + Math.random() * 100,
        dx: -3 + Math.random() * 2,
        dy: 2 + Math.random() * 3,
        size: 2 + Math.random() * 3
      });
    }
  }

  /**
   * Update blizzard effect
   */
  updateBlizzard(deltaTime, player) {
    this.blizzardTimer += deltaTime;
    
    // Update particles
    this.blizzardParticles.forEach(p => {
      p.x += p.dx * (deltaTime / 16);
      p.y += p.dy * (deltaTime / 16);
      
      // Reset particles that go out of range
      if (p.y > this.y + 200 || Math.abs(p.x - this.x) > this.blizzardRadius) {
        p.x = this.x + Math.random() * this.blizzardRadius * 2 - this.blizzardRadius;
        p.y = this.y - 100;
      }
    });
    
    // Damage player if in blizzard
    if (player && player.active) {
      const dist = Math.sqrt(
        Math.pow(player.x - this.x, 2) + 
        Math.pow(player.y - this.y, 2)
      );
      
      if (dist < this.blizzardRadius) {
        player.takeDamage(this.blizzardDamage * (deltaTime / 1000));
      }
    }
    
    // End blizzard
    if (this.blizzardTimer >= this.blizzardDuration) {
      this.blizzardActive = false;
      this.blizzardParticles = [];
    }
  }

  /**
   * Update movement
   */
  updateMovement(deltaTime, player) {
    if (!player || !player.active) {
      this.dx = 0;
      return;
    }
    
    const distX = player.x - this.x;
    
    if (Math.abs(distX) > 150) {
      this.dx = Math.sign(distX) * this.speed;
    } else {
      this.dx = 0;
    }
  }

  /**
   * Take damage with ice armor consideration
   * @param {number} amount - Damage amount
   * @returns {boolean} True if killed
   */
  takeDamage(amount) {
    // Ice armor absorbs damage
    if (this.iceArmorActive) {
      const reducedDamage = amount * (1 - this.iceArmorReduction);
      const armorDamage = amount * this.iceArmorReduction;
      
      this.iceArmorHealth -= armorDamage;
      
      if (this.iceArmorHealth <= 0) {
        this.iceArmorActive = false;
        this.lastArmorBreakTime = performance.now();
      }
      
      amount = reducedDamage;
    }
    
    this.health -= amount;
    
    if (this.health <= 0) {
      this.health = 0;
      this.destroy();
      return true;
    }
    
    return false;
  }

  /**
   * Render the Frost Titan
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    if (!this.active) return;
    
    ctx.save();
    
    // Blizzard effect
    if (this.blizzardActive) {
      ctx.fillStyle = 'rgba(200, 220, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.blizzardRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Blizzard particles
      ctx.fillStyle = '#ffffff';
      this.blizzardParticles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    
    // Body
    ctx.fillStyle = this.color;
    
    // Legs
    const legWidth = 20;
    const legHeight = 40;
    ctx.fillRect(this.x + 10, this.y + this.height - legHeight, legWidth, legHeight);
    ctx.fillRect(this.x + this.width - 30, this.y + this.height - legHeight, legWidth, legHeight);
    
    // Torso
    ctx.fillRect(this.x + 5, this.y + 40, this.width - 10, this.height - 80);
    
    // Arms
    const armPhase = Math.sin(this.animationTime / 300) * 5;
    ctx.fillRect(this.x - 15, this.y + 50 + armPhase, 20, 50);
    ctx.fillRect(this.x + this.width - 5, this.y + 50 - armPhase, 20, 50);
    
    // Head
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + 25, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#0044ff';
    const eyeGlow = Math.sin(this.animationTime / 200) * 0.3 + 0.7;
    ctx.globalAlpha = eyeGlow;
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2 - 10, this.y + 20, 5, 0, Math.PI * 2);
    ctx.arc(this.x + this.width / 2 + 10, this.y + 20, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Ice crown/horns
    ctx.fillStyle = '#aaddff';
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2 - 25, this.y + 15);
    ctx.lineTo(this.x + this.width / 2 - 15, this.y - 15);
    ctx.lineTo(this.x + this.width / 2 - 5, this.y + 5);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2 + 25, this.y + 15);
    ctx.lineTo(this.x + this.width / 2 + 15, this.y - 15);
    ctx.lineTo(this.x + this.width / 2 + 5, this.y + 5);
    ctx.fill();
    
    // Ice armor effect
    if (this.iceArmorActive) {
      ctx.strokeStyle = 'rgba(150, 200, 255, 0.8)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.rect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
      ctx.stroke();
      
      // Armor health indicator
      const armorPercent = this.iceArmorHealth / this.iceArmorMaxHealth;
      ctx.fillStyle = `rgba(150, 200, 255, ${0.3 * armorPercent})`;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    // Freeze beam
    if (this.freezeBeamActive) {
      const beamStartX = this.x + this.width / 2;
      const beamStartY = this.y + this.height / 3;
      const beamLength = 400;
      
      ctx.strokeStyle = '#00ccff';
      ctx.lineWidth = 15;
      ctx.globalAlpha = 0.6 + Math.sin(this.animationTime / 50) * 0.2;
      ctx.beginPath();
      ctx.moveTo(beamStartX, beamStartY);
      ctx.lineTo(
        beamStartX + Math.cos(this.freezeBeamAngle) * beamLength,
        beamStartY + Math.sin(this.freezeBeamAngle) * beamLength
      );
      ctx.stroke();
      
      // Inner beam
      ctx.strokeStyle = '#88eeff';
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    
    // Health bar
    const barWidth = this.width + 20;
    const barHeight = 8;
    const barX = this.x - 10;
    const barY = this.y - 30;
    
    ctx.fillStyle = '#330000';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    ctx.fillStyle = '#00aaff';
    ctx.fillRect(barX, barY, barWidth * (this.health / this.maxHealth), barHeight);
    
    // Ice armor bar
    if (this.iceArmorActive) {
      ctx.fillStyle = '#88ccff';
      ctx.fillRect(barX, barY + barHeight + 2, barWidth * (this.iceArmorHealth / this.iceArmorMaxHealth), 4);
    }
    
    ctx.strokeStyle = '#004466';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    // Boss name
    ctx.fillStyle = '#88ccff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
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
    this.freezeBeamDamage = Math.floor(this.freezeBeamDamage * multiplier);
    this.blizzardDamage = Math.floor(this.blizzardDamage * multiplier);
    this.iceArmorMaxHealth = Math.floor(this.iceArmorMaxHealth * multiplier);
    this.iceArmorHealth = this.iceArmorMaxHealth;
  }

  /**
   * Destroy the Frost Titan
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
    return this.x < other.x + other.width &&
           this.x + this.width > other.x &&
           this.y < other.y + other.height &&
           this.y + this.height > other.y;
  }
}
