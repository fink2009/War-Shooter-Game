/**
 * Base Defense Mode - Protect your objective from 20 waves of enemies
 * Features building system with barricades, turrets, mines, and more
 */
class BaseDefenseMode {
  constructor() {
    this.active = false;
    this.wave = 0;
    this.maxWaves = 20;
    this.startTime = 0;
    this.waveStartTime = 0;
    
    // Objective
    this.objectiveMaxHealth = 1000;
    this.objectiveHealth = this.objectiveMaxHealth;
    this.objectiveX = 200;
    this.objectiveY = 500;
    this.objectiveWidth = 100;
    this.objectiveHeight = 80;
    
    // Resources
    this.resources = 500;
    this.resourcesPerWave = 100;
    this.resourcesPerKill = 10;
    
    // Wave configuration
    this.waveDuration = 60000;
    this.waveBreakDuration = 30000;
    this.inWaveBreak = false;
    this.waveBreakTimer = 0;
    
    // Buildables
    this.buildables = [];
    this.selectedBuildable = null;
    this.buildMode = false;
    this.buildPreviewX = 0;
    this.buildPreviewY = 0;
    
    // Build costs and limits from config
    this.buildConfig = typeof GameConfig !== 'undefined' && GameConfig.BASE_DEFENSE ? 
      GameConfig.BASE_DEFENSE.BUILDABLES : this.getDefaultBuildConfig();
    
    // Wave scaling
    this.waveScaling = typeof GameConfig !== 'undefined' && GameConfig.BASE_DEFENSE ?
      GameConfig.BASE_DEFENSE.WAVE_SCALING : this.getDefaultWaveScaling();
    
    // Stats
    this.totalKills = 0;
    this.totalResourcesEarned = 0;
    this.buildablesPlaced = 0;
    this.waveEnemyCount = 0;
    this.waveEnemiesKilled = 0;
    
    // High score
    this.highestWave = this.loadHighestWave();
    this.bestTime = this.loadBestTime();
  }

  /**
   * Get default build configuration
   */
  getDefaultBuildConfig() {
    return {
      BARRICADE: { name: 'Barricade', cost: 50, health: 200, width: 60, height: 80, blockProjectiles: true, maxCount: 10 },
      TURRET: { name: 'Auto Turret', cost: 150, health: 100, damage: 15, fireRate: 500, range: 300, maxCount: 5 },
      MINE: { name: 'Land Mine', cost: 30, damage: 100, radius: 80, maxCount: 15 },
      HEAL_STATION: { name: 'Heal Station', cost: 200, healRate: 5, healRadius: 100, maxCount: 2 },
      AMMO_STATION: { name: 'Ammo Station', cost: 100, ammoPerSecond: 2, ammoRadius: 80, maxCount: 3 }
    };
  }

  /**
   * Get default wave scaling
   */
  getDefaultWaveScaling() {
    return {
      enemyCountBase: 5,
      enemyCountPerWave: 2,
      healthScaling: 0.05,
      damageScaling: 0.03,
      bossWaves: [5, 10, 15, 20]
    };
  }

  /**
   * Start base defense mode
   */
  start() {
    this.active = true;
    this.wave = 0;
    this.startTime = performance.now();
    this.objectiveHealth = this.objectiveMaxHealth;
    this.resources = 500;
    this.buildables = [];
    this.totalKills = 0;
    this.totalResourcesEarned = 0;
    this.buildablesPlaced = 0;
    this.inWaveBreak = true;
    this.waveBreakTimer = 0;
    
    // Start with initial break to build
    return this.getWaveConfig();
  }

  /**
   * Start the next wave
   * @returns {Object} Wave configuration
   */
  startNextWave() {
    this.wave++;
    this.waveStartTime = performance.now();
    this.inWaveBreak = false;
    this.waveEnemiesKilled = 0;
    
    // Add wave resources
    this.resources += this.resourcesPerWave;
    this.totalResourcesEarned += this.resourcesPerWave;
    
    return this.getWaveConfig();
  }

  /**
   * Get wave configuration
   * @returns {Object} Wave configuration
   */
  getWaveConfig() {
    const scaling = this.waveScaling;
    const baseCount = scaling.enemyCountBase + (this.wave * scaling.enemyCountPerWave);
    const healthMult = 1 + (this.wave * scaling.healthScaling);
    const damageMult = 1 + (this.wave * scaling.damageScaling);
    
    // Determine enemy types based on wave
    const enemyTypes = this.getEnemyTypesForWave();
    
    // Check for boss wave
    const isBossWave = scaling.bossWaves.includes(this.wave);
    
    // Generate enemy list
    const enemies = [];
    for (let i = 0; i < baseCount; i++) {
      const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      enemies.push({
        type: type,
        healthMultiplier: healthMult,
        damageMultiplier: damageMult,
        spawnDelay: i * 500 // Stagger spawns
      });
    }
    
    // Add boss if applicable
    if (isBossWave) {
      enemies.push({
        type: 'boss',
        bossId: Math.floor(this.wave / 5) - 1,
        healthMultiplier: healthMult * 2,
        damageMultiplier: damageMult * 1.5,
        spawnDelay: 5000
      });
    }
    
    this.waveEnemyCount = enemies.length;
    
    return {
      wave: this.wave,
      enemies: enemies,
      totalEnemies: enemies.length,
      isBossWave: isBossWave,
      healthMultiplier: healthMult,
      damageMultiplier: damageMult
    };
  }

  /**
   * Get enemy types for current wave
   * @returns {Array} Array of enemy type strings
   */
  getEnemyTypesForWave() {
    const types = ['infantry', 'scout'];
    
    if (this.wave >= 2) types.push('heavy');
    if (this.wave >= 3) types.push('sniper');
    if (this.wave >= 4) types.push('medic');
    if (this.wave >= 5) types.push('drone');
    if (this.wave >= 7) types.push('engineer');
    if (this.wave >= 8) types.push('berserker');
    if (this.wave >= 10) types.push('bomber');
    if (this.wave >= 12) types.push('flamethrower');
    if (this.wave >= 15) types.push('riot');
    
    return types;
  }

  /**
   * Update base defense mode
   * @param {number} deltaTime - Time since last update
   * @param {Object} player - Player entity
   * @param {Array} enemies - Array of enemies
   */
  update(deltaTime, player, enemies) {
    if (!this.active) return;
    
    // Update wave break timer
    if (this.inWaveBreak) {
      this.waveBreakTimer += deltaTime;
      
      if (this.waveBreakTimer >= this.waveBreakDuration) {
        this.waveBreakTimer = 0;
        return { startWave: true };
      }
    }
    
    // Update buildables
    this.updateBuildables(deltaTime, player, enemies);
    
    // Check objective damage from enemies
    if (enemies) {
      enemies.forEach(enemy => {
        if (enemy.active && this.isNearObjective(enemy)) {
          this.damageObjective(enemy.damage * (deltaTime / 1000));
        }
      });
    }
    
    // Check for game over
    if (this.objectiveHealth <= 0) {
      return { gameOver: true, result: this.end() };
    }
    
    return null;
  }

  /**
   * Check if entity is near objective
   */
  isNearObjective(entity) {
    return entity.x < this.objectiveX + this.objectiveWidth + 50 &&
           entity.x + entity.width > this.objectiveX - 50 &&
           entity.y < this.objectiveY + this.objectiveHeight &&
           entity.y + entity.height > this.objectiveY;
  }

  /**
   * Damage the objective
   * @param {number} amount - Damage amount
   */
  damageObjective(amount) {
    this.objectiveHealth = Math.max(0, this.objectiveHealth - amount);
  }

  /**
   * Update all buildables
   */
  updateBuildables(deltaTime, player, enemies) {
    this.buildables.forEach(buildable => {
      if (!buildable.active) return;
      
      switch (buildable.type) {
        case 'TURRET':
          this.updateTurret(buildable, deltaTime, enemies);
          break;
        case 'HEAL_STATION':
          this.updateHealStation(buildable, deltaTime, player);
          break;
        case 'AMMO_STATION':
          this.updateAmmoStation(buildable, deltaTime, player);
          break;
        case 'MINE':
          this.updateMine(buildable, enemies);
          break;
      }
    });
    
    // Remove destroyed buildables
    this.buildables = this.buildables.filter(b => b.active);
  }

  /**
   * Update turret behavior
   */
  updateTurret(turret, deltaTime, enemies) {
    if (!enemies || enemies.length === 0) return;
    
    turret.cooldownTimer -= deltaTime;
    
    // Find nearest enemy in range
    let nearestEnemy = null;
    let nearestDist = turret.range;
    
    enemies.forEach(enemy => {
      if (!enemy.active || enemy.health <= 0) return;
      
      const dist = Math.sqrt(
        Math.pow(enemy.x - turret.x, 2) + 
        Math.pow(enemy.y - turret.y, 2)
      );
      
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestEnemy = enemy;
      }
    });
    
    // Aim and fire
    if (nearestEnemy && turret.cooldownTimer <= 0) {
      turret.angle = Math.atan2(
        nearestEnemy.y - turret.y,
        nearestEnemy.x - turret.x
      );
      
      // Deal damage
      nearestEnemy.takeDamage(turret.damage);
      turret.cooldownTimer = turret.fireRate;
      turret.lastFireTime = performance.now();
    }
  }

  /**
   * Update heal station
   */
  updateHealStation(station, deltaTime, player) {
    if (!player || !player.active) return;
    
    const dist = Math.sqrt(
      Math.pow(player.x - station.x, 2) + 
      Math.pow(player.y - station.y, 2)
    );
    
    if (dist < station.healRadius) {
      const healAmount = station.healRate * (deltaTime / 1000);
      player.heal(healAmount);
    }
  }

  /**
   * Update ammo station
   */
  updateAmmoStation(station, deltaTime, player) {
    if (!player || !player.active) return;
    
    const dist = Math.sqrt(
      Math.pow(player.x - station.x, 2) + 
      Math.pow(player.y - station.y, 2)
    );
    
    if (dist < station.ammoRadius && player.getCurrentWeapon()) {
      const ammoAmount = Math.floor(station.ammoPerSecond * (deltaTime / 1000));
      if (ammoAmount > 0) {
        player.getCurrentWeapon().addAmmo(ammoAmount);
      }
    }
  }

  /**
   * Update mine
   */
  updateMine(mine, enemies) {
    if (!enemies) return;
    
    enemies.forEach(enemy => {
      if (!enemy.active || enemy.health <= 0) return;
      
      const dist = Math.sqrt(
        Math.pow(enemy.x - mine.x, 2) + 
        Math.pow(enemy.y - mine.y, 2)
      );
      
      if (dist < mine.triggerRadius) {
        // Explode
        enemies.forEach(e => {
          if (!e.active) return;
          const explosionDist = Math.sqrt(
            Math.pow(e.x - mine.x, 2) + 
            Math.pow(e.y - mine.y, 2)
          );
          
          if (explosionDist < mine.radius) {
            e.takeDamage(mine.damage * (1 - explosionDist / mine.radius));
          }
        });
        
        mine.active = false;
      }
    });
  }

  /**
   * Try to place a buildable
   * @param {string} buildableType - Type of buildable
   * @param {number} x - X position
   * @param {number} y - Y position
   * @returns {boolean} True if placed successfully
   */
  placeBuildable(buildableType, x, y) {
    const config = this.buildConfig[buildableType];
    if (!config) return false;
    
    // Check cost
    if (this.resources < config.cost) return false;
    
    // Check max count
    const currentCount = this.buildables.filter(b => b.type === buildableType && b.active).length;
    if (currentCount >= config.maxCount) return false;
    
    // Check placement validity (not on objective, not overlapping)
    if (this.isInvalidPlacement(x, y, config)) return false;
    
    // Deduct cost
    this.resources -= config.cost;
    
    // Create buildable
    const buildable = {
      type: buildableType,
      x: x,
      y: y,
      width: config.width || 40,
      height: config.height || 40,
      health: config.health || 100,
      maxHealth: config.health || 100,
      active: true,
      ...config,
      cooldownTimer: 0
    };
    
    // Type-specific initialization
    if (buildableType === 'TURRET') {
      buildable.angle = 0;
      buildable.lastFireTime = 0;
    }
    if (buildableType === 'MINE') {
      buildable.triggerRadius = 40;
    }
    
    this.buildables.push(buildable);
    this.buildablesPlaced++;
    
    return true;
  }

  /**
   * Check if placement is invalid
   */
  isInvalidPlacement(x, y, config) {
    const width = config.width || 40;
    const height = config.height || 40;
    
    // Check objective overlap
    if (x < this.objectiveX + this.objectiveWidth + 20 &&
        x + width > this.objectiveX - 20 &&
        y < this.objectiveY + this.objectiveHeight + 20 &&
        y + height > this.objectiveY - 20) {
      return true;
    }
    
    // Check existing buildable overlap
    for (const buildable of this.buildables) {
      if (!buildable.active) continue;
      
      if (x < buildable.x + buildable.width + 10 &&
          x + width > buildable.x - 10 &&
          y < buildable.y + buildable.height + 10 &&
          y + height > buildable.y - 10) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Called when an enemy is killed
   * @returns {Object|null} Wave completion data if wave is complete
   */
  enemyKilled() {
    this.waveEnemiesKilled++;
    this.totalKills++;
    
    // Add resources
    this.resources += this.resourcesPerKill;
    this.totalResourcesEarned += this.resourcesPerKill;
    
    // Check wave completion
    if (this.waveEnemiesKilled >= this.waveEnemyCount) {
      return this.completeWave();
    }
    
    return null;
  }

  /**
   * Complete current wave
   * @returns {Object} Wave completion data
   */
  completeWave() {
    const waveTime = (performance.now() - this.waveStartTime) / 1000;
    
    // Check for victory
    if (this.wave >= this.maxWaves) {
      return {
        waveComplete: true,
        wave: this.wave,
        waveTime: waveTime,
        victory: true,
        result: this.complete()
      };
    }
    
    // Start wave break
    this.inWaveBreak = true;
    this.waveBreakTimer = 0;
    
    // Check for new record
    const isNewRecord = this.wave > this.highestWave;
    if (isNewRecord) {
      this.highestWave = this.wave;
      this.saveHighestWave();
    }
    
    return {
      waveComplete: true,
      wave: this.wave,
      waveTime: waveTime,
      isNewRecord: isNewRecord,
      inWaveBreak: true,
      breakDuration: this.waveBreakDuration
    };
  }

  /**
   * Complete base defense mode (victory)
   * @returns {Object} Final results
   */
  complete() {
    this.active = false;
    const totalTime = (performance.now() - this.startTime) / 1000;
    
    // Check for best time
    const isNewBest = !this.bestTime || totalTime < this.bestTime;
    if (isNewBest) {
      this.bestTime = totalTime;
      this.saveBestTime();
    }
    
    return {
      victory: true,
      totalTime: totalTime,
      totalKills: this.totalKills,
      wavesCompleted: this.wave,
      objectiveHealthRemaining: this.objectiveHealth,
      totalResourcesEarned: this.totalResourcesEarned,
      buildablesPlaced: this.buildablesPlaced,
      isNewBest: isNewBest
    };
  }

  /**
   * End base defense mode (defeat)
   * @returns {Object} Final results
   */
  end() {
    this.active = false;
    const totalTime = (performance.now() - this.startTime) / 1000;
    
    // Check for new wave record
    const isNewRecord = this.wave > this.highestWave;
    if (isNewRecord) {
      this.highestWave = this.wave;
      this.saveHighestWave();
    }
    
    return {
      victory: false,
      totalTime: totalTime,
      totalKills: this.totalKills,
      wavesCompleted: this.wave,
      totalResourcesEarned: this.totalResourcesEarned,
      buildablesPlaced: this.buildablesPlaced,
      isNewRecord: isNewRecord
    };
  }

  /**
   * Get current progress
   * @returns {Object} Progress data
   */
  getProgress() {
    return {
      wave: this.wave,
      maxWaves: this.maxWaves,
      objectiveHealth: this.objectiveHealth,
      objectiveMaxHealth: this.objectiveMaxHealth,
      resources: this.resources,
      enemiesKilled: this.waveEnemiesKilled,
      enemiesTotal: this.waveEnemyCount,
      inWaveBreak: this.inWaveBreak,
      breakTimeRemaining: this.inWaveBreak ? 
        (this.waveBreakDuration - this.waveBreakTimer) / 1000 : 0,
      highestWave: this.highestWave
    };
  }

  /**
   * Load highest wave from storage
   */
  loadHighestWave() {
    try {
      const stored = localStorage.getItem('baseDefenseHighestWave');
      if (stored) return parseInt(stored, 10);
    } catch (e) {
      console.warn('Could not load highest wave:', e);
    }
    return 0;
  }

  /**
   * Save highest wave
   */
  saveHighestWave() {
    try {
      localStorage.setItem('baseDefenseHighestWave', this.highestWave.toString());
    } catch (e) {
      console.warn('Could not save highest wave:', e);
    }
  }

  /**
   * Load best time from storage
   */
  loadBestTime() {
    try {
      const stored = localStorage.getItem('baseDefenseBestTime');
      if (stored) return parseFloat(stored);
    } catch (e) {
      console.warn('Could not load best time:', e);
    }
    return null;
  }

  /**
   * Save best time
   */
  saveBestTime() {
    try {
      localStorage.setItem('baseDefenseBestTime', this.bestTime.toString());
    } catch (e) {
      console.warn('Could not save best time:', e);
    }
  }

  /**
   * Toggle build mode
   * @param {string} buildableType - Type to build, or null to cancel
   */
  toggleBuildMode(buildableType) {
    if (buildableType && this.buildConfig[buildableType]) {
      this.buildMode = true;
      this.selectedBuildable = buildableType;
    } else {
      this.buildMode = false;
      this.selectedBuildable = null;
    }
  }

  /**
   * Update build preview position
   */
  updateBuildPreview(x, y) {
    this.buildPreviewX = x;
    this.buildPreviewY = y;
  }

  /**
   * Render base defense mode HUD
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} canvasWidth - Canvas width
   */
  render(ctx, canvasWidth) {
    if (!this.active) return;
    
    ctx.save();
    
    // Wave info (top left)
    const headerX = 10;
    const headerY = 20;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(headerX, headerY - 15, 220, 85);
    ctx.strokeStyle = '#00aaff';
    ctx.lineWidth = 2;
    ctx.strokeRect(headerX, headerY - 15, 220, 85);
    
    // Wave number
    ctx.fillStyle = '#00aaff';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`WAVE ${this.wave}/${this.maxWaves}`, headerX + 10, headerY + 5);
    
    // Progress bar
    const progressWidth = 200;
    const progressHeight = 8;
    const progress = this.waveEnemyCount > 0 ? this.waveEnemiesKilled / this.waveEnemyCount : 0;
    
    ctx.fillStyle = '#003366';
    ctx.fillRect(headerX + 10, headerY + 15, progressWidth, progressHeight);
    ctx.fillStyle = '#00aaff';
    ctx.fillRect(headerX + 10, headerY + 15, progressWidth * progress, progressHeight);
    ctx.strokeStyle = '#00aaff';
    ctx.lineWidth = 1;
    ctx.strokeRect(headerX + 10, headerY + 15, progressWidth, progressHeight);
    
    // Resources
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`💰 ${this.resources}`, headerX + 10, headerY + 45);
    
    // Kill count
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.fillText(`Kills: ${this.totalKills}`, headerX + 120, headerY + 45);
    
    // Wave break indicator
    if (this.inWaveBreak) {
      const breakTimeLeft = Math.ceil((this.waveBreakDuration - this.waveBreakTimer) / 1000);
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`BUILD TIME: ${breakTimeLeft}s`, headerX + 10, headerY + 62);
    }
    
    // Objective health (top center)
    this.renderObjectiveHealth(ctx, canvasWidth);
    
    // Build menu (if in wave break)
    if (this.inWaveBreak) {
      this.renderBuildMenu(ctx, canvasWidth);
    }
    
    ctx.restore();
  }

  /**
   * Render objective health bar
   */
  renderObjectiveHealth(ctx, canvasWidth) {
    const barWidth = 200;
    const barHeight = 20;
    const barX = (canvasWidth - barWidth) / 2;
    const barY = 20;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(barX - 10, barY - 10, barWidth + 20, barHeight + 25);
    
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('OBJECTIVE', canvasWidth / 2, barY);
    
    ctx.fillStyle = '#660000';
    ctx.fillRect(barX, barY + 5, barWidth, barHeight);
    
    const healthPercent = this.objectiveHealth / this.objectiveMaxHealth;
    const healthColor = healthPercent > 0.5 ? '#00ff00' : 
                        healthPercent > 0.25 ? '#ffff00' : '#ff0000';
    ctx.fillStyle = healthColor;
    ctx.fillRect(barX, barY + 5, barWidth * healthPercent, barHeight);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY + 5, barWidth, barHeight);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`${Math.floor(this.objectiveHealth)}/${this.objectiveMaxHealth}`, canvasWidth / 2, barY + 20);
  }

  /**
   * Render build menu
   */
  renderBuildMenu(ctx, canvasWidth) {
    const menuX = canvasWidth - 200;
    const menuY = 100;
    const itemHeight = 35;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(menuX - 10, menuY - 30, 190, Object.keys(this.buildConfig).length * itemHeight + 50);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.strokeRect(menuX - 10, menuY - 30, 190, Object.keys(this.buildConfig).length * itemHeight + 50);
    
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('BUILD MENU (1-5)', menuX, menuY - 10);
    
    let i = 0;
    for (const [type, config] of Object.entries(this.buildConfig)) {
      const y = menuY + 15 + i * itemHeight;
      const currentCount = this.buildables.filter(b => b.type === type && b.active).length;
      const canAfford = this.resources >= config.cost;
      const atMax = currentCount >= config.maxCount;
      
      // Background
      if (this.selectedBuildable === type) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.fillRect(menuX - 5, y - 12, 180, itemHeight - 5);
      }
      
      // Text
      ctx.fillStyle = canAfford && !atMax ? '#ffffff' : '#666666';
      ctx.font = '12px monospace';
      ctx.fillText(`${i + 1}. ${config.name}`, menuX, y);
      
      ctx.fillStyle = canAfford ? '#ffd700' : '#ff4444';
      ctx.font = '10px monospace';
      ctx.fillText(`$${config.cost} (${currentCount}/${config.maxCount})`, menuX + 100, y);
      
      i++;
    }
  }

  /**
   * Render buildables in the game world
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderBuildables(ctx) {
    // Render objective
    ctx.fillStyle = '#3366aa';
    ctx.fillRect(this.objectiveX, this.objectiveY, this.objectiveWidth, this.objectiveHeight);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(this.objectiveX, this.objectiveY, this.objectiveWidth, this.objectiveHeight);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BASE', this.objectiveX + this.objectiveWidth / 2, this.objectiveY + this.objectiveHeight / 2 + 5);
    
    // Render buildables
    this.buildables.forEach(buildable => {
      if (!buildable.active) return;
      
      switch (buildable.type) {
        case 'BARRICADE':
          ctx.fillStyle = '#8b4513';
          ctx.fillRect(buildable.x, buildable.y, buildable.width, buildable.height);
          ctx.strokeStyle = '#5a3010';
          ctx.lineWidth = 2;
          ctx.strokeRect(buildable.x, buildable.y, buildable.width, buildable.height);
          break;
          
        case 'TURRET':
          ctx.fillStyle = '#444444';
          ctx.fillRect(buildable.x, buildable.y + 20, 40, 20);
          ctx.save();
          ctx.translate(buildable.x + 20, buildable.y + 20);
          ctx.rotate(buildable.angle);
          ctx.fillStyle = '#666666';
          ctx.fillRect(-5, -25, 10, 30);
          ctx.restore();
          break;
          
        case 'MINE':
          ctx.fillStyle = '#333333';
          ctx.beginPath();
          ctx.arc(buildable.x, buildable.y, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ff0000';
          ctx.beginPath();
          ctx.arc(buildable.x, buildable.y, 5, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'HEAL_STATION':
          ctx.fillStyle = '#00aa00';
          ctx.fillRect(buildable.x - 20, buildable.y - 20, 40, 40);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(buildable.x - 3, buildable.y - 15, 6, 30);
          ctx.fillRect(buildable.x - 15, buildable.y - 3, 30, 6);
          // Range indicator
          ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
          ctx.beginPath();
          ctx.arc(buildable.x, buildable.y, buildable.healRadius, 0, Math.PI * 2);
          ctx.stroke();
          break;
          
        case 'AMMO_STATION':
          ctx.fillStyle = '#aaaa00';
          ctx.fillRect(buildable.x - 15, buildable.y - 15, 30, 30);
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 16px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('A', buildable.x, buildable.y + 5);
          break;
      }
    });
    
    // Render build preview
    if (this.buildMode && this.selectedBuildable) {
      const config = this.buildConfig[this.selectedBuildable];
      const isValid = !this.isInvalidPlacement(this.buildPreviewX, this.buildPreviewY, config);
      
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = isValid ? '#00ff00' : '#ff0000';
      ctx.fillRect(
        this.buildPreviewX, 
        this.buildPreviewY, 
        config.width || 40, 
        config.height || 40
      );
      ctx.globalAlpha = 1;
    }
  }
}
