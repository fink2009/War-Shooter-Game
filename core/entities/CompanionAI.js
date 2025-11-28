// Companion AI System - AI teammates that assist the player
// Provides follower pathfinding, combat AI, and special abilities
class CompanionAI extends Entity {
  constructor(x, y, companionType = 'SOLDIER') {
    super(x, y, 28, 48);
    
    this.type = 'companion';
    this.companionType = companionType;
    
    // Get config from GameConfig
    this.config = typeof GameConfig !== 'undefined' && GameConfig.COMPANIONS && GameConfig.COMPANIONS[companionType] ? 
      GameConfig.COMPANIONS[companionType] : {
        name: 'Soldier',
        hp: 200,
        damage: 20,
        speed: 180,
        reviveCooldown: 60,
        color: '#4488ff',
        weapon: 'rifle'
      };
    
    // Stats
    this.name = this.config.name;
    this.maxHealth = this.config.hp;
    this.health = this.maxHealth;
    this.damage = this.config.damage;
    this.speed = this.config.speed / 60; // Convert to per-frame speed
    this.color = this.config.color;
    
    // State
    this.state = 'follow'; // follow, stay, attack, revive, dead
    this.target = null;
    this.owner = null; // Player reference
    
    // Movement
    this.dx = 0;
    this.dy = 0;
    this.onGround = false;
    this.facing = 1;
    
    // Combat
    this.attackCooldown = 0;
    this.attackRate = 1000; // ms between attacks
    this.attackRange = 300;
    this.aggroRange = 400;
    
    // Special abilities
    this.specialCooldown = 0;
    this.specialActive = false;
    
    // Revive system (Soldier only)
    this.canRevive = companionType === 'SOLDIER';
    this.reviveCooldown = 0;
    this.reviveCooldownMax = (this.config.reviveCooldown || 60) * 1000;
    
    // Healing system (Medic only)
    this.healCooldown = 0;
    this.healAmount = this.config.healAmount || 0;
    this.healInterval = (this.config.healInterval || 10) * 1000;
    this.shieldProvided = 0;
    
    // Scout abilities
    this.markDuration = 5000;
    this.markedEnemies = [];
    
    // XP and leveling
    this.xp = 0;
    this.level = 1;
    this.xpToNextLevel = 100;
    
    // Follow behavior
    this.followDistance = 80;
    this.followOffset = { x: -50, y: 0 };
    
    // Pathfinding
    this.targetPosition = { x: x, y: y };
    this.stuckTimer = 0;
    this.lastPosition = { x: x, y: y };
    
    // Animation
    this.animationFrame = 0;
    this.animationTimer = 0;
    
    // Particles for abilities
    this.particles = [];
  }
  
  /**
   * Set the owner (player) reference
   * @param {Object} player - Player entity
   */
  setOwner(player) {
    this.owner = player;
  }
  
  /**
   * Update companion
   * @param {number} deltaTime - Time since last frame
   * @param {Array} enemies - Array of enemies
   * @param {number} groundLevel - Ground Y position
   */
  update(deltaTime, enemies, groundLevel) {
    if (!this.active || this.state === 'dead') return;
    
    // Update cooldowns
    this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);
    this.specialCooldown = Math.max(0, this.specialCooldown - deltaTime);
    this.reviveCooldown = Math.max(0, this.reviveCooldown - deltaTime);
    this.healCooldown = Math.max(0, this.healCooldown - deltaTime);
    
    // Update animation
    this.animationTimer += deltaTime;
    if (this.animationTimer > 100) {
      this.animationFrame = (this.animationFrame + 1) % 4;
      this.animationTimer = 0;
    }
    
    // State machine
    switch (this.state) {
      case 'follow':
        this.updateFollow(deltaTime);
        this.lookForTargets(enemies);
        break;
      case 'stay':
        this.lookForTargets(enemies);
        break;
      case 'attack':
        this.updateAttack(deltaTime, enemies);
        break;
      case 'revive':
        this.updateRevive(deltaTime);
        break;
    }
    
    // Apply movement
    this.x += this.dx;
    this.y += this.dy;
    
    // Apply gravity
    if (!this.onGround) {
      this.dy += 0.4;
    }
    
    // Ground collision
    if (this.y + this.height > groundLevel) {
      this.y = groundLevel - this.height;
      this.dy = 0;
      this.onGround = true;
    }
    
    // Clamp position
    this.x = Math.max(0, this.x);
    
    // Update facing direction
    if (this.dx > 0.1) this.facing = 1;
    if (this.dx < -0.1) this.facing = -1;
    
    // Companion-specific abilities
    this.updateAbilities(deltaTime);
    
    // Check if stuck
    this.checkIfStuck(deltaTime);
    
    // Update particles
    this.updateParticles(deltaTime);
    
    // Clear marked enemies that expired
    this.markedEnemies = this.markedEnemies.filter(m => Date.now() - m.time < this.markDuration);
  }
  
  /**
   * Update follow behavior
   * @param {number} deltaTime - Time since last frame
   */
  updateFollow(deltaTime) {
    if (!this.owner) return;
    
    // Calculate target position (behind player)
    const targetX = this.owner.x + this.followOffset.x * this.owner.facing;
    const targetY = this.owner.y;
    
    // Calculate distance
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Move towards target if too far
    if (distance > this.followDistance) {
      const moveSpeed = this.speed * (deltaTime / 16);
      this.dx = (dx / distance) * moveSpeed;
      
      // Jump if target is above
      if (dy < -50 && this.onGround) {
        this.dy = -10;
        this.onGround = false;
      }
    } else {
      // Slow down when close
      this.dx *= 0.8;
    }
  }
  
  /**
   * Look for targets to attack
   * @param {Array} enemies - Array of enemies
   */
  lookForTargets(enemies) {
    if (!enemies) return;
    
    // Find closest enemy in aggro range
    let closestEnemy = null;
    let closestDistance = this.aggroRange;
    
    for (const enemy of enemies) {
      if (!enemy.active || enemy.health <= 0) continue;
      
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    }
    
    if (closestEnemy) {
      this.target = closestEnemy;
      this.state = 'attack';
    }
  }
  
  /**
   * Update attack behavior
   * @param {number} deltaTime - Time since last frame
   * @param {Array} enemies - Array of enemies
   */
  updateAttack(deltaTime, enemies) {
    // Check if target is still valid
    if (!this.target || !this.target.active || this.target.health <= 0) {
      this.target = null;
      this.state = 'follow';
      return;
    }
    
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Face target
    this.facing = dx > 0 ? 1 : -1;
    
    // Move into attack range
    if (distance > this.attackRange * 0.8) {
      const moveSpeed = this.speed * (deltaTime / 16);
      this.dx = (dx / distance) * moveSpeed;
    } else {
      this.dx *= 0.8;
    }
    
    // Attack when in range and cooldown is ready
    if (distance <= this.attackRange && this.attackCooldown <= 0) {
      this.attack();
    }
    
    // Return to follow if target is too far
    if (distance > this.aggroRange * 1.5) {
      this.target = null;
      this.state = 'follow';
    }
  }
  
  /**
   * Perform attack
   */
  attack() {
    if (!this.target) return;
    
    // Deal damage to target
    const killed = this.target.takeDamage(this.damage);
    
    // Reset cooldown
    this.attackCooldown = this.attackRate;
    
    // Gain XP on kill
    if (killed) {
      this.gainXP(10);
    }
    
    // Create attack particle effect
    this.createAttackEffect();
  }
  
  /**
   * Update revive behavior
   * @param {number} deltaTime - Time since last frame
   */
  updateRevive(deltaTime) {
    if (!this.owner) {
      this.state = 'follow';
      return;
    }
    
    // Move to owner if needed
    const dx = this.owner.x - this.x;
    const dy = this.owner.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 50) {
      const moveSpeed = this.speed * 1.5 * (deltaTime / 16);
      this.dx = (dx / distance) * moveSpeed;
    } else {
      // Perform revive
      if (this.owner.health <= 0 && this.reviveCooldown <= 0) {
        this.performRevive();
      }
      this.state = 'follow';
    }
  }
  
  /**
   * Perform revive on player
   */
  performRevive() {
    if (!this.owner || !this.canRevive) return;
    
    this.owner.health = Math.floor(this.owner.maxHealth * 0.3);
    this.owner.active = true;
    this.reviveCooldown = this.reviveCooldownMax;
    
    // Create revive effect
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: this.owner.x + this.owner.width / 2,
        y: this.owner.y + this.owner.height / 2,
        dx: (Math.random() - 0.5) * 3,
        dy: -Math.random() * 3,
        life: 1,
        color: '#00ff00'
      });
    }
    
    console.log('Companion revived player!');
  }
  
  /**
   * Update companion-specific abilities
   * @param {number} deltaTime - Time since last frame
   */
  updateAbilities(deltaTime) {
    switch (this.companionType) {
      case 'MEDIC':
        this.updateMedicAbilities(deltaTime);
        break;
      case 'SCOUT':
        this.updateScoutAbilities(deltaTime);
        break;
      case 'HEAVY':
        this.updateHeavyAbilities(deltaTime);
        break;
    }
  }
  
  /**
   * Update medic healing abilities
   * @param {number} deltaTime - Time since last frame
   */
  updateMedicAbilities(deltaTime) {
    if (!this.owner) return;
    
    // Heal player periodically
    if (this.healCooldown <= 0 && this.owner.health < this.owner.maxHealth) {
      this.owner.heal(this.healAmount);
      this.healCooldown = this.healInterval;
      
      // Create heal effect
      for (let i = 0; i < 5; i++) {
        this.particles.push({
          x: this.owner.x + this.owner.width / 2,
          y: this.owner.y,
          dx: (Math.random() - 0.5) * 2,
          dy: -Math.random() * 2,
          life: 1,
          color: '#00ff88'
        });
      }
    }
  }
  
  /**
   * Update scout marking abilities
   * @param {number} deltaTime - Time since last frame
   */
  updateScoutAbilities(deltaTime) {
    // Scout automatically marks enemies in range
    // Marked enemies appear on minimap (handled by game)
  }
  
  /**
   * Update heavy abilities (draw enemy fire)
   * @param {number} deltaTime - Time since last frame
   */
  updateHeavyAbilities(deltaTime) {
    // Heavy has increased aggro and takes hits for player
    // This is passive and handled through the AI target selection
  }
  
  /**
   * Mark an enemy (Scout ability)
   * @param {Object} enemy - Enemy to mark
   */
  markEnemy(enemy) {
    if (!enemy) return;
    
    this.markedEnemies.push({
      enemy: enemy,
      time: Date.now()
    });
  }
  
  /**
   * Check if companion is stuck
   * @param {number} deltaTime - Time since last frame
   */
  checkIfStuck(deltaTime) {
    const dx = this.x - this.lastPosition.x;
    const dy = this.y - this.lastPosition.y;
    const moved = Math.sqrt(dx * dx + dy * dy);
    
    if (moved < 1 && this.state === 'follow') {
      this.stuckTimer += deltaTime;
      
      if (this.stuckTimer > 2000) {
        // Jump to try to unstick
        if (this.onGround) {
          this.dy = -8;
          this.onGround = false;
        }
        this.stuckTimer = 0;
      }
    } else {
      this.stuckTimer = 0;
    }
    
    this.lastPosition.x = this.x;
    this.lastPosition.y = this.y;
  }
  
  /**
   * Take damage
   * @param {number} amount - Damage amount
   * @returns {boolean} Whether companion was killed
   */
  takeDamage(amount) {
    this.health -= amount;
    
    if (this.health <= 0) {
      this.health = 0;
      
      // Heavy companions leave instead of dying
      if (this.companionType === 'HEAVY') {
        this.retreat();
        return false;
      }
      
      this.state = 'dead';
      this.active = false;
      return true;
    }
    
    return false;
  }
  
  /**
   * Heavy companion retreats when low health
   */
  retreat() {
    // Heavy leaves the battle instead of dying
    this.active = false;
    console.log('Heavy companion retreated!');
  }
  
  /**
   * Set companion command
   * @param {string} command - 'follow', 'stay', or 'attack'
   */
  setCommand(command) {
    if (command === 'attack' && this.target) {
      this.state = 'attack';
    } else if (command === 'stay') {
      this.state = 'stay';
      this.dx = 0;
    } else {
      this.state = 'follow';
    }
  }
  
  /**
   * Gain XP
   * @param {number} amount - XP amount
   */
  gainXP(amount) {
    this.xp += amount;
    
    if (this.xp >= this.xpToNextLevel) {
      this.levelUp();
    }
  }
  
  /**
   * Level up companion
   */
  levelUp() {
    this.level++;
    this.xp -= this.xpToNextLevel;
    this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
    
    // Improve stats
    this.maxHealth += 20;
    this.health = this.maxHealth;
    this.damage += 3;
    
    console.log(`Companion leveled up to ${this.level}!`);
  }
  
  /**
   * Create attack effect particles
   */
  createAttackEffect() {
    const targetX = this.target ? this.target.x + this.target.width / 2 : this.x + this.facing * 50;
    const targetY = this.target ? this.target.y + this.target.height / 2 : this.y;
    
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: targetX,
        y: targetY,
        dx: (Math.random() - 0.5) * 4,
        dy: (Math.random() - 0.5) * 4,
        life: 0.5,
        color: '#ffff00'
      });
    }
  }
  
  /**
   * Update particles
   * @param {number} deltaTime - Time since last frame
   */
  updateParticles(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.dx;
      p.y += p.dy;
      p.life -= deltaTime / 1000;
      
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  /**
   * Render companion
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    if (!this.active) return;
    
    ctx.save();
    
    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(this.x + this.width / 2, this.y + this.height, this.width / 2, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw body
    ctx.fillStyle = this.color;
    
    // Body sway animation
    const sway = Math.sin(this.animationFrame * Math.PI / 2) * 2;
    
    // Flip based on facing
    ctx.translate(this.x + this.width / 2, this.y);
    ctx.scale(this.facing, 1);
    ctx.translate(-this.width / 2, 0);
    
    // Body
    ctx.fillRect(5, 15, 18, 25);
    
    // Head
    ctx.fillRect(7, 5, 14, 12);
    
    // Helmet/Hat based on type
    ctx.fillStyle = this.getAccentColor();
    ctx.fillRect(5, 2, 18, 5);
    
    // Visor
    ctx.fillStyle = '#000000';
    ctx.fillRect(9, 8, 10, 4);
    
    // Legs (animated)
    ctx.fillStyle = this.color;
    if (Math.abs(this.dx) > 0.5) {
      ctx.fillRect(7 + sway, 40, 5, 10);
      ctx.fillRect(16 - sway, 40, 5, 10);
    } else {
      ctx.fillRect(7, 40, 5, 10);
      ctx.fillRect(16, 40, 5, 10);
    }
    
    // Weapon
    ctx.fillStyle = '#666666';
    ctx.fillRect(20, 20, 15, 4);
    
    ctx.restore();
    
    // Draw health bar
    this.renderHealthBar(ctx);
    
    // Draw particles
    this.renderParticles(ctx);
    
    // Draw type indicator
    this.renderTypeIndicator(ctx);
  }
  
  /**
   * Get accent color based on companion type
   * @returns {string}
   */
  getAccentColor() {
    switch (this.companionType) {
      case 'SOLDIER': return '#2266aa';
      case 'MEDIC': return '#22aa66';
      case 'HEAVY': return '#aa6622';
      case 'SCOUT': return '#aaaa22';
      default: return '#666666';
    }
  }
  
  /**
   * Render health bar
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderHealthBar(ctx) {
    const barWidth = 30;
    const barHeight = 4;
    const x = this.x + (this.width - barWidth) / 2;
    const y = this.y - 8;
    
    // Background
    ctx.fillStyle = '#333333';
    ctx.fillRect(x, y, barWidth, barHeight);
    
    // Health
    const healthPercent = this.health / this.maxHealth;
    ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
    ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
    
    // Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, barWidth, barHeight);
  }
  
  /**
   * Render particles
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderParticles(ctx) {
    for (const p of this.particles) {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    }
    ctx.globalAlpha = 1;
  }
  
  /**
   * Render type indicator icon
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderTypeIndicator(ctx) {
    const iconX = this.x + this.width / 2;
    const iconY = this.y - 15;
    
    ctx.fillStyle = this.getAccentColor();
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    
    let icon = '👤';
    switch (this.companionType) {
      case 'SOLDIER': icon = '🎖️'; break;
      case 'MEDIC': icon = '➕'; break;
      case 'HEAVY': icon = '🛡️'; break;
      case 'SCOUT': icon = '👁️'; break;
    }
    
    ctx.fillText(icon, iconX, iconY);
  }
}

// Companion Manager - Handles companion spawning and management
class CompanionManager {
  constructor() {
    this.activeCompanion = null;
    this.unlockedCompanions = ['SOLDIER']; // Start with Soldier unlocked
    this.commandMenuVisible = false;
  }
  
  /**
   * Initialize companion manager
   * @param {Object} game - Game engine reference
   */
  init(game) {
    this.game = game;
    this.loadState();
  }
  
  /**
   * Spawn a companion
   * @param {string} companionType - Type of companion
   * @param {Object} player - Player reference
   * @param {number} groundLevel - Ground Y position
   * @returns {CompanionAI}
   */
  spawnCompanion(companionType, player, groundLevel) {
    if (!this.unlockedCompanions.includes(companionType)) {
      console.warn('Companion not unlocked:', companionType);
      return null;
    }
    
    // Remove existing companion
    if (this.activeCompanion) {
      this.activeCompanion.active = false;
    }
    
    const x = player.x - 50;
    const y = groundLevel - 50;
    
    this.activeCompanion = new CompanionAI(x, y, companionType);
    this.activeCompanion.setOwner(player);
    
    console.log('Spawned companion:', companionType);
    return this.activeCompanion;
  }
  
  /**
   * Dismiss current companion
   */
  dismissCompanion() {
    if (this.activeCompanion) {
      this.activeCompanion.active = false;
      this.activeCompanion = null;
    }
  }
  
  /**
   * Get active companion
   * @returns {CompanionAI|null}
   */
  getActiveCompanion() {
    return this.activeCompanion;
  }
  
  /**
   * Unlock a companion type
   * @param {string} companionType - Type to unlock
   */
  unlockCompanion(companionType) {
    if (!this.unlockedCompanions.includes(companionType)) {
      this.unlockedCompanions.push(companionType);
      this.saveState();
      console.log('Unlocked companion:', companionType);
    }
  }
  
  /**
   * Check if companion is unlocked
   * @param {string} companionType - Type to check
   * @returns {boolean}
   */
  isUnlocked(companionType) {
    return this.unlockedCompanions.includes(companionType);
  }
  
  /**
   * Issue command to companion
   * @param {string} command - Command to issue
   */
  issueCommand(command) {
    if (this.activeCompanion) {
      this.activeCompanion.setCommand(command);
    }
  }
  
  /**
   * Toggle command menu
   */
  toggleCommandMenu() {
    this.commandMenuVisible = !this.commandMenuVisible;
  }
  
  /**
   * Update companion
   * @param {number} deltaTime - Time since last frame
   * @param {Array} enemies - Array of enemies
   * @param {number} groundLevel - Ground Y position
   */
  update(deltaTime, enemies, groundLevel) {
    if (this.activeCompanion && this.activeCompanion.active) {
      this.activeCompanion.update(deltaTime, enemies, groundLevel);
    }
  }
  
  /**
   * Render companion and UI
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    if (this.activeCompanion && this.activeCompanion.active) {
      this.activeCompanion.render(ctx);
    }
    
    if (this.commandMenuVisible) {
      this.renderCommandMenu(ctx);
    }
  }
  
  /**
   * Render command wheel
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderCommandMenu(ctx) {
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const radius = 80;
    
    ctx.save();
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Commands
    const commands = [
      { name: 'Follow', key: '1', angle: -Math.PI / 2 },
      { name: 'Stay', key: '2', angle: Math.PI / 6 },
      { name: 'Attack', key: '3', angle: Math.PI * 5 / 6 }
    ];
    
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    
    for (const cmd of commands) {
      const x = centerX + Math.cos(cmd.angle) * radius;
      const y = centerY + Math.sin(cmd.angle) * radius;
      
      // Button
      ctx.fillStyle = '#444444';
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#888888';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(cmd.name, x, y - 5);
      ctx.fillStyle = '#ffff00';
      ctx.font = '10px monospace';
      ctx.fillText(`[${cmd.key}]`, x, y + 12);
      ctx.font = 'bold 14px monospace';
    }
    
    // Center - current command
    ctx.fillStyle = '#666666';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    const currentCommand = this.activeCompanion ? this.activeCompanion.state : 'None';
    ctx.fillText(currentCommand.toUpperCase(), centerX, centerY + 4);
    
    ctx.restore();
  }
  
  /**
   * Save state to localStorage
   */
  saveState() {
    try {
      localStorage.setItem('companionUnlocks', JSON.stringify(this.unlockedCompanions));
    } catch (e) {
      console.warn('Failed to save companion state:', e);
    }
  }
  
  /**
   * Load state from localStorage
   */
  loadState() {
    try {
      const saved = localStorage.getItem('companionUnlocks');
      if (saved) {
        this.unlockedCompanions = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load companion state:', e);
    }
  }
}
