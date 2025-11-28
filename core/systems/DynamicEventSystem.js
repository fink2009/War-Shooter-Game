// Dynamic Events System - Random mid-game events
class DynamicEventSystem {
  constructor() {
    this.active = false;
    this.currentEvent = null;
    this.eventTimer = 0;
    this.cooldownTimer = 0;
    this.cooldownWaves = 3; // Minimum waves between events
    this.wavesSinceEvent = 0;
    this.eventChance = 0.15; // 15% chance per wave
    this.eventLog = [];
    this.allies = [];
    this.supplyDrops = [];
    this.disabledWeapon = null;
    this.luckyStrikeActive = false;
    this.luckyStrikeKills = 0;
    this.fogOfWarActive = false;
    this.heavyAssaultWaves = 0;
  }

  /**
   * Initialize event definitions
   * @returns {Object} Event type definitions
   */
  getEventTypes() {
    return {
      SUPPLY_DROP: {
        id: 'supply_drop',
        name: 'Supply Drop',
        type: 'positive',
        duration: 60,
        description: 'Parachute drops health, ammo, and power-ups',
        announcement: 'Supply drop incoming!',
        icon: '📦'
      },
      REINFORCEMENTS: {
        id: 'reinforcements',
        name: 'Enemy Reinforcements',
        type: 'negative',
        duration: 0,
        description: 'Extra wave of enemies spawns',
        announcement: 'Enemy reinforcements detected!',
        icon: '⚠️'
      },
      ALLY_SUPPORT: {
        id: 'ally_support',
        name: 'Allied Support',
        type: 'positive',
        duration: 60,
        description: 'Friendly AI soldier assists for 60 seconds',
        announcement: 'Ally support arriving!',
        icon: '🛡️'
      },
      AMBUSH: {
        id: 'ambush',
        name: 'Ambush',
        type: 'negative',
        duration: 0,
        description: 'Enemies spawn behind player',
        announcement: 'Ambush!',
        icon: '💀'
      },
      MALFUNCTION: {
        id: 'malfunction',
        name: 'Equipment Malfunction',
        type: 'negative',
        duration: 15,
        description: 'Random weapon jams for 15 seconds',
        announcement: 'Weapon malfunction!',
        icon: '🔧'
      },
      LUCKY_STRIKE: {
        id: 'lucky_strike',
        name: 'Lucky Strike',
        type: 'positive',
        duration: 30,
        description: 'Next 10 kills drop power-ups',
        announcement: 'Lucky strike active!',
        icon: '⭐'
      },
      HEAVY_ASSAULT: {
        id: 'heavy_assault',
        name: 'Heavy Assault',
        type: 'negative',
        duration: 0,
        description: 'All spawning enemies are Heavy type for 2 waves',
        announcement: 'Heavy assault incoming!',
        icon: '🔴'
      },
      FOG_OF_WAR: {
        id: 'fog_of_war',
        name: 'Fog of War',
        type: 'negative',
        duration: 45,
        description: 'Minimap and HUD visibility reduced',
        announcement: 'Communications disrupted!',
        icon: '🌫️'
      }
    };
  }

  /**
   * Start the event system
   */
  start() {
    this.active = true;
    this.currentEvent = null;
    this.eventTimer = 0;
    this.cooldownTimer = 0;
    this.wavesSinceEvent = 0;
    this.eventLog = [];
    this.allies = [];
    this.supplyDrops = [];
  }

  /**
   * Stop the event system
   */
  stop() {
    this.active = false;
    this.clearCurrentEvent();
  }

  /**
   * Called when a new wave starts
   * @param {number} wave - Current wave number
   * @param {Object} gameEngine - Game engine reference
   * @returns {Object|null} Event data if triggered
   */
  onWaveStart(wave, gameEngine) {
    if (!this.active) return null;
    
    // No events in first 3 waves
    if (wave <= 3) return null;
    
    this.wavesSinceEvent++;
    
    // Check cooldown
    if (this.wavesSinceEvent < this.cooldownWaves) {
      return null;
    }
    
    // Heavy assault continues for 2 waves
    if (this.heavyAssaultWaves > 0) {
      this.heavyAssaultWaves--;
    }
    
    // Random event chance
    if (Math.random() < this.eventChance) {
      return this.triggerRandomEvent(gameEngine);
    }
    
    return null;
  }

  /**
   * Trigger a random event
   * @param {Object} gameEngine - Game engine reference
   * @returns {Object} Event data
   */
  triggerRandomEvent(gameEngine) {
    const eventTypes = this.getEventTypes();
    const eventKeys = Object.keys(eventTypes);
    
    // Weighted selection (60% negative, 40% positive)
    const negativeEvents = eventKeys.filter(k => eventTypes[k].type === 'negative');
    const positiveEvents = eventKeys.filter(k => eventTypes[k].type === 'positive');
    
    let selectedKey;
    if (Math.random() < 0.6) {
      selectedKey = negativeEvents[Math.floor(Math.random() * negativeEvents.length)];
    } else {
      selectedKey = positiveEvents[Math.floor(Math.random() * positiveEvents.length)];
    }
    
    return this.triggerEvent(selectedKey, gameEngine);
  }

  /**
   * Trigger a specific event
   * @param {string} eventKey - Event key
   * @param {Object} gameEngine - Game engine reference
   * @returns {Object} Event data
   */
  triggerEvent(eventKey, gameEngine) {
    const eventTypes = this.getEventTypes();
    const eventType = eventTypes[eventKey];
    
    if (!eventType) return null;
    
    // Clear any conflicting events
    this.handleEventConflicts(eventKey);
    
    this.currentEvent = {
      ...eventType,
      startTime: performance.now(),
      endTime: eventType.duration > 0 ? performance.now() + eventType.duration * 1000 : null
    };
    
    this.wavesSinceEvent = 0;
    this.eventLog.push({
      event: eventType,
      time: performance.now(),
      wave: gameEngine.wave
    });
    
    // Execute event effect
    this.executeEvent(eventKey, gameEngine);
    
    return this.currentEvent;
  }

  /**
   * Handle conflicting events
   * @param {string} newEventKey - New event being triggered
   */
  handleEventConflicts(newEventKey) {
    // Fog of war conflicts with supply drop
    if (newEventKey === 'SUPPLY_DROP' && this.fogOfWarActive) {
      this.fogOfWarActive = false;
    }
    if (newEventKey === 'FOG_OF_WAR' && this.currentEvent && this.currentEvent.id === 'supply_drop') {
      return; // Don't trigger fog during supply drop
    }
  }

  /**
   * Execute event effect
   * @param {string} eventKey - Event key
   * @param {Object} gameEngine - Game engine reference
   */
  executeEvent(eventKey, gameEngine) {
    switch (eventKey) {
      case 'SUPPLY_DROP':
        this.spawnSupplyDrop(gameEngine);
        break;
      case 'REINFORCEMENTS':
        this.spawnReinforcements(gameEngine);
        break;
      case 'ALLY_SUPPORT':
        this.spawnAlly(gameEngine);
        break;
      case 'AMBUSH':
        this.executeAmbush(gameEngine);
        break;
      case 'MALFUNCTION':
        this.causeMalfunction(gameEngine);
        break;
      case 'LUCKY_STRIKE':
        this.activateLuckyStrike();
        break;
      case 'HEAVY_ASSAULT':
        this.startHeavyAssault();
        break;
      case 'FOG_OF_WAR':
        this.activateFogOfWar();
        break;
    }
  }

  /**
   * Spawn a supply drop
   * @param {Object} gameEngine - Game engine reference
   */
  spawnSupplyDrop(gameEngine) {
    const dropX = gameEngine.player.x + 200 + Math.random() * 400;
    const dropY = -50; // Start above screen
    
    const supplyDrop = {
      x: dropX,
      y: dropY,
      targetY: gameEngine.groundLevel - 50,
      width: 40,
      height: 40,
      fallSpeed: 2,
      landed: false,
      collected: false,
      contents: [
        { type: 'health', value: 50 },
        { type: 'ammo', value: 50 },
        { type: 'powerup', value: this.getRandomPowerUp() }
      ]
    };
    
    this.supplyDrops.push(supplyDrop);
  }

  /**
   * Get random power-up type
   * @returns {string} Power-up type
   */
  getRandomPowerUp() {
    const powerUps = [
      'powerup_damage_boost',
      'powerup_speed',
      'powerup_rapid_fire',
      'powerup_multi_shot',
      'powerup_shield',
      'powerup_invincibility'
    ];
    return powerUps[Math.floor(Math.random() * powerUps.length)];
  }

  /**
   * Spawn enemy reinforcements
   * @param {Object} gameEngine - Game engine reference
   */
  spawnReinforcements(gameEngine) {
    const reinforcementCount = Math.min(10, 5 + Math.floor(gameEngine.wave / 3));
    const types = ['infantry', 'scout', 'heavy'];
    
    for (let i = 0; i < reinforcementCount; i++) {
      const x = gameEngine.player.x + 600 + Math.random() * 800;
      const type = types[Math.floor(Math.random() * types.length)];
      
      const enemy = new EnemyUnit(x, gameEngine.groundLevel - 48, type);
      gameEngine.enemies.push(enemy);
      gameEngine.collisionSystem.add(enemy);
      gameEngine.enemiesRemaining++;
    }
  }

  /**
   * Spawn allied soldier
   * @param {Object} gameEngine - Game engine reference
   */
  spawnAlly(gameEngine) {
    const ally = {
      x: gameEngine.player.x - 100,
      y: gameEngine.groundLevel - 50,
      width: 30,
      height: 50,
      health: 150,
      maxHealth: 150,
      damage: 15,
      attackCooldown: 0,
      attackRate: 800,
      range: 300,
      active: true,
      lifespan: 60000, // 60 seconds
      spawnTime: performance.now()
    };
    
    this.allies.push(ally);
  }

  /**
   * Execute ambush event
   * @param {Object} gameEngine - Game engine reference
   */
  executeAmbush(gameEngine) {
    const ambushCount = 8;
    const playerX = gameEngine.player.x;
    const playerY = gameEngine.player.y;
    
    // Spawn enemies in circle around player
    for (let i = 0; i < ambushCount; i++) {
      const angle = (i / ambushCount) * Math.PI * 2;
      const distance = 150 + Math.random() * 50;
      const x = playerX + Math.cos(angle) * distance;
      const y = Math.max(100, Math.min(playerY, gameEngine.groundLevel - 48));
      
      const enemy = new EnemyUnit(x, y, 'scout');
      gameEngine.enemies.push(enemy);
      gameEngine.collisionSystem.add(enemy);
      gameEngine.enemiesRemaining++;
    }
  }

  /**
   * Cause weapon malfunction
   * @param {Object} gameEngine - Game engine reference
   */
  causeMalfunction(gameEngine) {
    if (!gameEngine.player || !gameEngine.player.rangedWeapons) return;
    
    const weapons = gameEngine.player.rangedWeapons;
    if (weapons.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * weapons.length);
    this.disabledWeapon = weapons[randomIndex];
    this.disabledWeapon.jammed = true;
  }

  /**
   * Activate lucky strike
   */
  activateLuckyStrike() {
    this.luckyStrikeActive = true;
    this.luckyStrikeKills = 0;
  }

  /**
   * Start heavy assault
   */
  startHeavyAssault() {
    this.heavyAssaultWaves = 2;
  }

  /**
   * Activate fog of war
   */
  activateFogOfWar() {
    this.fogOfWarActive = true;
  }

  /**
   * Update event system
   * @param {number} deltaTime - Time since last update
   * @param {Object} gameEngine - Game engine reference
   */
  update(deltaTime, gameEngine) {
    if (!this.active) return;
    
    const currentTime = performance.now();
    
    // Update current event timer
    if (this.currentEvent && this.currentEvent.endTime) {
      if (currentTime >= this.currentEvent.endTime) {
        this.clearCurrentEvent();
      }
    }
    
    // Update supply drops
    this.updateSupplyDrops(gameEngine);
    
    // Update allies
    this.updateAllies(deltaTime, gameEngine, currentTime);
    
    // Update lucky strike
    if (this.luckyStrikeActive && this.luckyStrikeKills >= 10) {
      this.luckyStrikeActive = false;
    }
    
    // Update fog of war timer
    if (this.fogOfWarActive && this.currentEvent && 
        this.currentEvent.id === 'fog_of_war' && 
        currentTime >= this.currentEvent.endTime) {
      this.fogOfWarActive = false;
    }
  }

  /**
   * Update supply drops
   * @param {Object} gameEngine - Game engine reference
   */
  updateSupplyDrops(gameEngine) {
    this.supplyDrops.forEach(drop => {
      if (!drop.landed) {
        drop.y += drop.fallSpeed;
        if (drop.y >= drop.targetY) {
          drop.y = drop.targetY;
          drop.landed = true;
        }
      }
      
      // Check player collection
      if (drop.landed && !drop.collected && gameEngine.player) {
        const dx = (drop.x + drop.width / 2) - (gameEngine.player.x + gameEngine.player.width / 2);
        const dy = (drop.y + drop.height / 2) - (gameEngine.player.y + gameEngine.player.height / 2);
        const distSquared = dx * dx + dy * dy;
        
        if (distSquared < 2500) { // 50 * 50 = 2500
          this.collectSupplyDrop(drop, gameEngine);
        }
      }
    });
    
    // Clean up collected drops
    this.supplyDrops = this.supplyDrops.filter(d => !d.collected);
  }

  /**
   * Collect supply drop contents
   * @param {Object} drop - Supply drop object
   * @param {Object} gameEngine - Game engine reference
   */
  collectSupplyDrop(drop, gameEngine) {
    drop.collected = true;
    
    drop.contents.forEach(item => {
      if (item.type === 'health') {
        gameEngine.player.heal(item.value);
      } else if (item.type === 'ammo') {
        const weapon = gameEngine.player.getCurrentWeapon();
        if (weapon && !weapon.isMelee) {
          weapon.currentAmmo = Math.min(weapon.currentAmmo + item.value, weapon.ammoCapacity);
        }
      } else if (item.type === 'powerup') {
        const pickup = new Pickup(drop.x, drop.y, item.value);
        pickup.apply(gameEngine.player);
      }
    });
    
    // Play collection effect
    gameEngine.particleSystem.createExplosion(
      drop.x + drop.width / 2,
      drop.y + drop.height / 2,
      15,
      '#00ff00'
    );
    gameEngine.audioManager.playSound('pickup_powerup', 0.7);
  }

  /**
   * Update allied soldiers
   * @param {number} deltaTime - Time since last update
   * @param {Object} gameEngine - Game engine reference
   * @param {number} currentTime - Current timestamp
   */
  updateAllies(deltaTime, gameEngine, currentTime) {
    this.allies.forEach(ally => {
      if (!ally.active) return;
      
      // Check lifespan
      if (currentTime - ally.spawnTime >= ally.lifespan) {
        ally.active = false;
        return;
      }
      
      // Follow player loosely
      const targetX = gameEngine.player.x - 80;
      if (Math.abs(ally.x - targetX) > 50) {
        ally.x += (targetX - ally.x) * 0.02;
      }
      ally.y = gameEngine.groundLevel - ally.height;
      
      // Attack nearest enemy
      ally.attackCooldown -= deltaTime;
      if (ally.attackCooldown <= 0) {
        const target = this.findNearestEnemy(ally, gameEngine.enemies);
        if (target) {
          this.allyAttack(ally, target, gameEngine);
          ally.attackCooldown = ally.attackRate;
        }
      }
    });
    
    // Clean up inactive allies
    this.allies = this.allies.filter(a => a.active);
  }

  /**
   * Find nearest enemy to ally
   * @param {Object} ally - Allied soldier
   * @param {Array} enemies - Array of enemies
   * @returns {Object|null} Nearest enemy or null
   */
  findNearestEnemy(ally, enemies) {
    let nearest = null;
    let nearestDist = ally.range;
    
    enemies.forEach(enemy => {
      if (!enemy.active || enemy.health <= 0) return;
      
      const dx = enemy.x - ally.x;
      const dy = enemy.y - ally.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = enemy;
      }
    });
    
    return nearest;
  }

  /**
   * Ally attacks target
   * @param {Object} ally - Allied soldier
   * @param {Object} target - Target enemy
   * @param {Object} gameEngine - Game engine reference
   */
  allyAttack(ally, target, gameEngine) {
    // Create projectile
    const proj = new Projectile(
      ally.x + ally.width / 2,
      ally.y + ally.height / 2,
      Math.sign(target.x - ally.x) * 15,
      0,
      ally.damage
    );
    proj.owner = ally;
    proj.isAllyProjectile = true;
    gameEngine.projectiles.push(proj);
    
    // Play sound
    gameEngine.audioManager.playSound('shoot_rifle', 0.3);
  }

  /**
   * Called when player kills an enemy (for lucky strike)
   * @returns {boolean} Whether to drop power-up
   */
  onEnemyKill() {
    if (this.luckyStrikeActive) {
      this.luckyStrikeKills++;
      return true; // Drop power-up
    }
    return false;
  }

  /**
   * Check if heavy assault is active
   * @returns {boolean} Whether heavy assault affects spawns
   */
  isHeavyAssaultActive() {
    return this.heavyAssaultWaves > 0;
  }

  /**
   * Get enemy type for heavy assault
   * @param {string} originalType - Original enemy type
   * @returns {string} Modified enemy type
   */
  getHeavyAssaultType(originalType) {
    if (this.isHeavyAssaultActive()) {
      return 'heavy';
    }
    return originalType;
  }

  /**
   * Check if weapon is jammed
   * @param {Object} weapon - Weapon to check
   * @returns {boolean} Whether weapon is jammed
   */
  isWeaponJammed(weapon) {
    return weapon === this.disabledWeapon && weapon.jammed;
  }

  /**
   * Clear current event effects
   */
  clearCurrentEvent() {
    if (!this.currentEvent) return;
    
    // Clear malfunction
    if (this.disabledWeapon) {
      this.disabledWeapon.jammed = false;
      this.disabledWeapon = null;
    }
    
    this.currentEvent = null;
  }

  /**
   * Render event HUD elements
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   */
  render(ctx, canvasWidth, canvasHeight) {
    if (!this.active) return;
    
    // Render current event banner
    if (this.currentEvent) {
      this.renderEventBanner(ctx, canvasWidth);
    }
    
    // Render supply drops
    this.renderSupplyDrops(ctx);
    
    // Render allies
    this.renderAllies(ctx);
    
    // Render fog of war overlay
    if (this.fogOfWarActive) {
      this.renderFogOfWar(ctx, canvasWidth, canvasHeight);
    }
    
    // Render lucky strike indicator
    if (this.luckyStrikeActive) {
      this.renderLuckyStrike(ctx, canvasWidth);
    }
  }

  /**
   * Render event announcement banner
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} canvasWidth - Canvas width
   */
  renderEventBanner(ctx, canvasWidth) {
    const event = this.currentEvent;
    const elapsed = performance.now() - event.startTime;
    
    // Fade out after 3 seconds
    if (elapsed > 3000) return;
    
    const alpha = elapsed < 2500 ? 1 : 1 - (elapsed - 2500) / 500;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    
    const bannerY = 100;
    const bannerWidth = 400;
    const bannerHeight = 50;
    const bannerX = (canvasWidth - bannerWidth) / 2;
    
    // Background
    ctx.fillStyle = event.type === 'positive' ? 'rgba(0, 80, 0, 0.9)' : 'rgba(80, 0, 0, 0.9)';
    ctx.fillRect(bannerX, bannerY, bannerWidth, bannerHeight);
    ctx.strokeStyle = event.type === 'positive' ? '#00ff00' : '#ff0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(bannerX, bannerY, bannerWidth, bannerHeight);
    
    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${event.icon} ${event.announcement}`, canvasWidth / 2, bannerY + 33);
    
    ctx.restore();
  }

  /**
   * Render supply drops
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderSupplyDrops(ctx) {
    this.supplyDrops.forEach(drop => {
      ctx.save();
      
      // Parachute if not landed
      if (!drop.landed) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(drop.x + drop.width / 2, drop.y - 20, 25, Math.PI, 0);
        ctx.fill();
        
        // Parachute lines
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(drop.x + drop.width / 2 - 25, drop.y - 20);
        ctx.lineTo(drop.x + drop.width / 2, drop.y);
        ctx.moveTo(drop.x + drop.width / 2 + 25, drop.y - 20);
        ctx.lineTo(drop.x + drop.width / 2, drop.y);
        ctx.stroke();
      }
      
      // Crate
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(drop.x, drop.y, drop.width, drop.height);
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 2;
      ctx.strokeRect(drop.x, drop.y, drop.width, drop.height);
      
      // Cross marking
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(drop.x + 10, drop.y + drop.height / 2);
      ctx.lineTo(drop.x + drop.width - 10, drop.y + drop.height / 2);
      ctx.moveTo(drop.x + drop.width / 2, drop.y + 10);
      ctx.lineTo(drop.x + drop.width / 2, drop.y + drop.height - 10);
      ctx.stroke();
      
      ctx.restore();
    });
  }

  /**
   * Render allied soldiers
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderAllies(ctx) {
    this.allies.forEach(ally => {
      if (!ally.active) return;
      
      ctx.save();
      
      // Body
      ctx.fillStyle = '#00aa00';
      ctx.fillRect(ally.x, ally.y, ally.width, ally.height);
      
      // Helmet
      ctx.fillStyle = '#006600';
      ctx.fillRect(ally.x, ally.y, ally.width, 10);
      
      // Ally indicator
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ALLY', ally.x + ally.width / 2, ally.y - 5);
      
      // Health bar
      const healthPercent = ally.health / ally.maxHealth;
      ctx.fillStyle = '#330000';
      ctx.fillRect(ally.x, ally.y - 12, ally.width, 5);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(ally.x, ally.y - 12, ally.width * healthPercent, 5);
      
      ctx.restore();
    });
  }

  /**
   * Render fog of war overlay
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   */
  renderFogOfWar(ctx, canvasWidth, canvasHeight) {
    ctx.save();
    
    // Fog overlay on edges
    const gradient = ctx.createRadialGradient(
      canvasWidth / 2, canvasHeight / 2, 100,
      canvasWidth / 2, canvasHeight / 2, 400
    );
    gradient.addColorStop(0, 'rgba(50, 50, 50, 0)');
    gradient.addColorStop(1, 'rgba(50, 50, 50, 0.7)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // "Communications disrupted" text
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚠️ COMMUNICATIONS DISRUPTED', canvasWidth / 2, 160);
    
    ctx.restore();
  }

  /**
   * Render lucky strike indicator
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} canvasWidth - Canvas width
   */
  renderLuckyStrike(ctx, canvasWidth) {
    ctx.save();
    
    ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`⭐ LUCKY STRIKE: ${10 - this.luckyStrikeKills} kills remaining`, canvasWidth / 2, 180);
    
    ctx.restore();
  }
}
