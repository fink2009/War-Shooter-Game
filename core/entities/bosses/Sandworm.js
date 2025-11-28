/**
 * Sandworm Boss - Desert biome boss
 * HP: 2000
 * Abilities: Burrow underground, emerge slam attack, sand projectiles
 */
class Sandworm extends Entity {
  constructor(x, y) {
    super(x, y, 120, 80);
    
    this.type = 'enemy';
    this.enemyType = 'boss';
    this.isBoss = true;
    this.bossId = 4;
    this.bossName = 'Sandworm';
    
    // Stats
    this.maxHealth = 2000;
    this.health = this.maxHealth;
    this.damage = 40;
    this.speed = 1.5;
    
    // AI State
    this.aiState = 'surface';
    this.target = null;
    this.facing = -1;
    this.aggroRange = 9999;
    this.attackRange = 400;
    
    // Burrow mechanics
    this.isBurrowed = false;
    this.burrowTimer = 0;
    this.burrowDuration = 3000;
    this.burrowCooldown = 8000;
    this.lastBurrowTime = 0;
    this.emergePosition = null;
    this.emergeDamage = 80;
    this.emergeDamageRadius = 150;
    
    // Sand projectile attack
    this.sandProjectiles = 5;
    this.projectileCooldown = 2000;
    this.lastProjectileTime = 0;
    this.projectileSpeed = 8;
    this.projectileDamage = 25;
    
    // Visual
    this.color = '#c4a060';
    this.segmentCount = 5;
    this.segmentOffsets = [];
    this.animationTime = 0;
    
    // Movement
    this.dx = 0;
    this.dy = 0;
    this.gravity = 0;
    
    // Initialize segment offsets for undulating animation
    for (let i = 0; i < this.segmentCount; i++) {
      this.segmentOffsets.push({ x: 0, y: 0 });
    }
  }

  /**
   * Update the Sandworm boss
   * @param {number} deltaTime - Time since last update
   * @param {Object} player - Player entity
   * @param {Array} enemies - Array to add spawned entities
   * @param {Array} projectiles - Array to add projectiles
   */
  update(deltaTime, player, enemies, projectiles) {
    if (!this.active || this.health <= 0) return;
    
    this.animationTime += deltaTime;
    this.target = player;
    
    // Update facing direction
    if (player && player.active && !this.isBurrowed) {
      this.facing = player.x > this.x ? 1 : -1;
    }
    
    // State machine
    switch (this.aiState) {
      case 'surface':
        this.updateSurfaceState(deltaTime, player, projectiles);
        break;
      case 'burrowing':
        this.updateBurrowingState(deltaTime);
        break;
      case 'underground':
        this.updateUndergroundState(deltaTime, player);
        break;
      case 'emerging':
        this.updateEmergingState(deltaTime, player, projectiles);
        break;
    }
    
    // Update segment animation
    this.updateSegments(deltaTime);
    
    // Apply movement
    if (!this.isBurrowed) {
      this.x += this.dx;
    }
    
    // Clamp to world bounds
    this.x = Math.max(0, Math.min(this.x, 2800));
  }

  /**
   * Update surface state behavior
   */
  updateSurfaceState(deltaTime, player, projectiles) {
    const currentTime = performance.now();
    
    // Check if should burrow
    if (currentTime - this.lastBurrowTime > this.burrowCooldown) {
      if (Math.random() < 0.01) { // 1% chance per frame to start burrowing
        this.startBurrowing();
        return;
      }
    }
    
    // Move towards player
    if (player && player.active) {
      const distX = player.x - this.x;
      
      if (Math.abs(distX) > this.attackRange) {
        this.dx = Math.sign(distX) * this.speed;
      } else {
        this.dx = 0;
        
        // Fire sand projectiles when in range
        if (currentTime - this.lastProjectileTime > this.projectileCooldown) {
          this.fireSandProjectiles(player, projectiles);
          this.lastProjectileTime = currentTime;
        }
      }
    }
  }

  /**
   * Start burrowing underground
   */
  startBurrowing() {
    this.aiState = 'burrowing';
    this.burrowTimer = 0;
    this.isBurrowed = false;
  }

  /**
   * Update burrowing animation state
   */
  updateBurrowingState(deltaTime) {
    this.burrowTimer += deltaTime;
    
    // Sink into ground
    if (this.burrowTimer >= 1000) {
      this.isBurrowed = true;
      this.aiState = 'underground';
      this.burrowTimer = 0;
    }
  }

  /**
   * Update underground movement state
   */
  updateUndergroundState(deltaTime, player) {
    this.burrowTimer += deltaTime;
    
    // Move underground towards player
    if (player && player.active) {
      const targetX = player.x;
      const distX = targetX - this.x;
      this.x += Math.sign(distX) * this.speed * 3; // Faster underground
    }
    
    // Emerge after duration
    if (this.burrowTimer >= this.burrowDuration) {
      this.startEmerging();
    }
  }

  /**
   * Start emerging from underground
   */
  startEmerging() {
    this.aiState = 'emerging';
    this.burrowTimer = 0;
    this.emergePosition = { x: this.x, y: this.y };
  }

  /**
   * Update emerging state
   */
  updateEmergingState(deltaTime, player, projectiles) {
    this.burrowTimer += deltaTime;
    
    if (this.burrowTimer >= 500) {
      this.isBurrowed = false;
      this.aiState = 'surface';
      this.lastBurrowTime = performance.now();
      
      // Deal emerge damage to nearby player
      if (player && player.active) {
        const dist = Math.abs(player.x - this.x);
        if (dist < this.emergeDamageRadius) {
          player.takeDamage(this.emergeDamage);
        }
      }
      
      // Spray sand projectiles on emergence
      this.fireSandProjectiles(player, projectiles);
    }
  }

  /**
   * Fire sand projectiles in a spread pattern
   */
  fireSandProjectiles(player, projectiles) {
    if (!projectiles) return;
    
    const baseAngle = player && player.active ? 
      Math.atan2(player.y - this.y, player.x - this.x) : 
      this.facing > 0 ? 0 : Math.PI;
    
    const spreadAngle = Math.PI / 4; // 45 degree spread
    
    for (let i = 0; i < this.sandProjectiles; i++) {
      const angle = baseAngle + (i - (this.sandProjectiles - 1) / 2) * (spreadAngle / this.sandProjectiles);
      
      const projectile = {
        x: this.x + this.width / 2,
        y: this.y + this.height / 2,
        width: 12,
        height: 12,
        dx: Math.cos(angle) * this.projectileSpeed,
        dy: Math.sin(angle) * this.projectileSpeed,
        damage: this.projectileDamage,
        owner: this,
        active: true,
        type: 'sand',
        color: '#c4a060',
        lifetime: 3000,
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
          ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
          ctx.fill();
          // Sand particle trail
          ctx.fillStyle = 'rgba(196, 160, 96, 0.5)';
          ctx.beginPath();
          ctx.arc(this.x - this.dx, this.y - this.dy, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        },
        
        collidesWith: function(other) {
          return this.x < other.x + other.width &&
                 this.x + this.width > other.x &&
                 this.y < other.y + other.height &&
                 this.y + this.height > other.y;
        },
        
        destroy: function() {
          this.active = false;
        },
        
        getBounds: function() {
          return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
          };
        }
      };
      
      projectiles.push(projectile);
    }
  }

  /**
   * Update segment animation
   */
  updateSegments(deltaTime) {
    for (let i = 0; i < this.segmentCount; i++) {
      const phase = (this.animationTime / 200) + i * 0.5;
      this.segmentOffsets[i].y = Math.sin(phase) * 5;
      this.segmentOffsets[i].x = Math.cos(phase * 0.7) * 3;
    }
  }

  /**
   * Take damage
   * @param {number} amount - Damage amount
   * @returns {boolean} True if killed
   */
  takeDamage(amount) {
    if (this.isBurrowed) {
      amount *= 0.5; // 50% damage reduction when burrowed
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
   * Render the Sandworm
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    if (!this.active) return;
    
    ctx.save();
    
    // Calculate vertical offset for burrowing animation
    let yOffset = 0;
    if (this.aiState === 'burrowing') {
      yOffset = (this.burrowTimer / 1000) * 60;
    } else if (this.aiState === 'emerging') {
      yOffset = 60 - (this.burrowTimer / 500) * 60;
    } else if (this.isBurrowed) {
      yOffset = 60;
    }
    
    // Underground indicator
    if (this.isBurrowed) {
      ctx.fillStyle = 'rgba(196, 160, 96, 0.5)';
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height, 40 + Math.sin(this.animationTime / 200) * 10, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Only render body if not fully underground
    if (yOffset < 60) {
      // Clip to hide parts underground
      ctx.beginPath();
      ctx.rect(0, 0, ctx.canvas.width * 2, this.y + this.height - 10);
      ctx.clip();
      
      // Render segments
      const segmentWidth = this.width / this.segmentCount;
      
      for (let i = this.segmentCount - 1; i >= 0; i--) {
        const segX = this.x + i * segmentWidth + this.segmentOffsets[i].x;
        const segY = this.y + this.segmentOffsets[i].y + yOffset;
        const segHeight = this.height * (1 - i * 0.1);
        
        // Segment body
        ctx.fillStyle = i === 0 ? '#d4b070' : '#c4a060';
        ctx.fillRect(segX, segY, segmentWidth + 2, segHeight);
        
        // Segment detail
        ctx.fillStyle = '#a48040';
        ctx.fillRect(segX + 2, segY + segHeight * 0.3, segmentWidth - 4, 4);
      }
      
      // Head (first segment)
      const headX = this.x + (this.facing > 0 ? this.width - 30 : 0);
      const headY = this.y + this.segmentOffsets[0].y + yOffset;
      
      // Eyes
      ctx.fillStyle = '#ff4400';
      const eyeX1 = headX + (this.facing > 0 ? 15 : 10);
      const eyeX2 = headX + (this.facing > 0 ? 25 : 20);
      ctx.beginPath();
      ctx.arc(eyeX1, headY + 15, 6, 0, Math.PI * 2);
      ctx.arc(eyeX2, headY + 15, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Mandibles
      ctx.fillStyle = '#8a6030';
      ctx.beginPath();
      if (this.facing > 0) {
        ctx.moveTo(headX + 30, headY + 25);
        ctx.lineTo(headX + 45, headY + 35);
        ctx.lineTo(headX + 30, headY + 40);
        ctx.moveTo(headX + 30, headY + 45);
        ctx.lineTo(headX + 45, headY + 50);
        ctx.lineTo(headX + 30, headY + 55);
      } else {
        ctx.moveTo(headX, headY + 25);
        ctx.lineTo(headX - 15, headY + 35);
        ctx.lineTo(headX, headY + 40);
        ctx.moveTo(headX, headY + 45);
        ctx.lineTo(headX - 15, headY + 50);
        ctx.lineTo(headX, headY + 55);
      }
      ctx.fill();
    }
    
    // Health bar
    const barWidth = this.width;
    const barHeight = 8;
    const barY = this.y - 20;
    
    ctx.fillStyle = '#330000';
    ctx.fillRect(this.x, barY, barWidth, barHeight);
    
    ctx.fillStyle = '#ff3333';
    ctx.fillRect(this.x, barY, barWidth * (this.health / this.maxHealth), barHeight);
    
    ctx.strokeStyle = '#660000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, barY, barWidth, barHeight);
    
    // Boss name
    ctx.fillStyle = '#ffcc00';
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
    this.emergeDamage = Math.floor(this.emergeDamage * multiplier);
    this.projectileDamage = Math.floor(this.projectileDamage * multiplier);
  }

  /**
   * Destroy the Sandworm
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
    if (this.isBurrowed) return false;
    
    return this.x < other.x + other.width &&
           this.x + this.width > other.x &&
           this.y < other.y + other.height &&
           this.y + this.height > other.y;
  }
}
