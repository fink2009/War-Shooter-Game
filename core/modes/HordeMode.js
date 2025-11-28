// Horde Mode - Endless waves of increasing difficulty
class HordeMode {
  constructor() {
    this.active = false;
    this.wave = 0;
    this.startTime = 0;
    this.waveStartTime = 0;
    this.waveScaling = 0.1; // +10% per wave
    this.eliteRampup = {
      start: 0.1,   // 10% at wave 1
      max: 0.5,     // 50% max
      reachAtWave: 20
    };
    this.miniBossInterval = 5;
    this.bossInterval = 10;
    this.shopBetweenWaves = true;
    this.highestWave = this.loadHighestWave();
    this.waveTimes = [];
    this.modifiers = [];
    this.activeModifiers = [];
    this.waveEnemyCount = 0;
    this.waveEnemiesKilled = 0;
    this.totalKills = 0;
  }

  /**
   * Start horde mode
   */
  start() {
    this.active = true;
    this.wave = 0;
    this.startTime = performance.now();
    this.waveTimes = [];
    this.activeModifiers = [];
    this.totalKills = 0;
    
    // Initialize wave modifiers that can be unlocked
    this.initializeModifiers();
    
    // Start first wave
    this.startNextWave();
  }

  /**
   * Initialize available modifiers
   */
  initializeModifiers() {
    this.modifiers = [
      { id: 'double_coins', name: 'Double Coins', unlockWave: 5, active: false },
      { id: 'extra_drops', name: 'Extra Drops', unlockWave: 10, active: false },
      { id: 'slow_enemies', name: 'Slow Enemies', unlockWave: 15, active: false },
      { id: 'fast_reload', name: 'Fast Reload', unlockWave: 20, active: false },
      { id: 'vampire', name: 'Vampiric Hits', unlockWave: 25, active: false },
      { id: 'explosive_kills', name: 'Explosive Kills', unlockWave: 30, active: false }
    ];
  }

  /**
   * Start the next wave
   * @returns {Object} Wave configuration
   */
  startNextWave() {
    this.wave++;
    this.waveStartTime = performance.now();
    this.waveEnemiesKilled = 0;
    
    // Check for modifier unlocks
    this.checkModifierUnlocks();
    
    // Calculate wave parameters
    const waveConfig = this.calculateWaveConfig();
    
    this.waveEnemyCount = waveConfig.totalEnemies;
    
    return waveConfig;
  }

  /**
   * Calculate wave configuration based on current wave
   * @returns {Object} Wave configuration
   */
  calculateWaveConfig() {
    const scaling = 1 + (this.wave * this.waveScaling);
    const eliteChance = this.calculateEliteChance();
    
    // Base enemy count increases with waves
    const baseEnemyCount = 5 + Math.floor(this.wave * 1.5);
    
    // Determine enemy types based on wave
    const enemyTypes = this.getEnemyTypesForWave();
    
    // Check for mini-boss
    const hasMiniBoss = this.wave >= 5 && (this.wave % this.miniBossInterval === 0);
    
    // Check for boss
    const hasBoss = this.wave >= 10 && (this.wave % this.bossInterval === 0);
    
    // Calculate enemy distribution
    const enemies = [];
    for (let i = 0; i < baseEnemyCount; i++) {
      const isElite = Math.random() < eliteChance;
      const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      enemies.push({
        type: type,
        isElite: isElite,
        healthMultiplier: scaling,
        damageMultiplier: scaling
      });
    }
    
    // Add mini-boss if applicable
    if (hasMiniBoss && !hasBoss) {
      const miniBossTypes = ['heavy', 'berserker', 'flamethrower'];
      enemies.push({
        type: miniBossTypes[Math.floor(Math.random() * miniBossTypes.length)],
        isMiniBoss: true,
        healthMultiplier: scaling * 3,
        damageMultiplier: scaling * 2
      });
    }
    
    // Add boss if applicable
    if (hasBoss) {
      const bossId = Math.floor((this.wave / this.bossInterval - 1) % 4);
      enemies.push({
        type: 'boss',
        bossId: bossId,
        healthMultiplier: scaling * 2,
        damageMultiplier: scaling * 1.5
      });
    }
    
    return {
      wave: this.wave,
      enemies: enemies,
      totalEnemies: enemies.length,
      scaling: scaling,
      eliteChance: eliteChance,
      hasMiniBoss: hasMiniBoss,
      hasBoss: hasBoss,
      showShop: this.shopBetweenWaves && this.wave > 1 && !hasBoss,
      modifiers: this.activeModifiers.map(m => m.id)
    };
  }

  /**
   * Get available enemy types for current wave
   * @returns {Array} Array of enemy type strings
   */
  getEnemyTypesForWave() {
    const types = ['infantry', 'scout'];
    
    if (this.wave >= 3) types.push('heavy');
    if (this.wave >= 5) types.push('sniper');
    if (this.wave >= 7) types.push('medic');
    if (this.wave >= 8) types.push('drone');
    if (this.wave >= 10) types.push('engineer', 'berserker');
    if (this.wave >= 12) types.push('bomber');
    if (this.wave >= 15) types.push('flamethrower', 'riot');
    
    return types;
  }

  /**
   * Calculate elite spawn chance for current wave
   * @returns {number} Elite spawn chance (0-1)
   */
  calculateEliteChance() {
    if (this.wave < 3) return 0;
    
    const progress = Math.min(1, (this.wave - 3) / (this.eliteRampup.reachAtWave - 3));
    return this.eliteRampup.start + (this.eliteRampup.max - this.eliteRampup.start) * progress;
  }

  /**
   * Check and apply modifier unlocks
   */
  checkModifierUnlocks() {
    this.modifiers.forEach(modifier => {
      if (!modifier.active && this.wave >= modifier.unlockWave) {
        modifier.active = true;
        this.activeModifiers.push(modifier);
      }
    });
  }

  /**
   * Called when an enemy is killed
   * @returns {Object|null} Wave completion data if wave is complete
   */
  enemyKilled() {
    this.waveEnemiesKilled++;
    this.totalKills++;
    
    // Check if wave is complete
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
    
    this.waveTimes.push({
      wave: this.wave,
      time: waveTime,
      kills: this.waveEnemiesKilled
    });
    
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
      nextWaveConfig: null // Will be set when startNextWave is called
    };
  }

  /**
   * End horde mode (player death)
   * @returns {Object} Final results
   */
  end() {
    this.active = false;
    const totalTime = (performance.now() - this.startTime) / 1000;
    
    return {
      finalWave: this.wave,
      totalTime: totalTime,
      totalKills: this.totalKills,
      waveTimes: this.waveTimes,
      isNewRecord: this.wave > this.loadHighestWave()
    };
  }

  /**
   * Get current wave progress
   * @returns {Object} Progress data
   */
  getProgress() {
    return {
      wave: this.wave,
      enemiesKilled: this.waveEnemiesKilled,
      enemiesTotal: this.waveEnemyCount,
      highestWave: this.highestWave
    };
  }

  /**
   * Load highest wave from storage
   * @returns {number} Highest wave reached
   */
  loadHighestWave() {
    try {
      const stored = localStorage.getItem('hordeModeHighestWave');
      if (stored) {
        return parseInt(stored, 10);
      }
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
      localStorage.setItem('hordeModeHighestWave', this.highestWave.toString());
    } catch (e) {
      console.warn('Could not save highest wave:', e);
    }
  }

  /**
   * Apply active modifiers to game
   * @param {Object} gameEngine - Game engine reference
   */
  applyModifiers(gameEngine) {
    if (!this.active) return;
    
    this.activeModifiers.forEach(modifier => {
      switch (modifier.id) {
        case 'double_coins':
          // Applied in currency system
          break;
        case 'extra_drops':
          // Applied in drop system
          break;
        case 'slow_enemies':
          if (gameEngine.enemies) {
            gameEngine.enemies.forEach(e => {
              if (!e.modifierApplied) {
                e.speed *= 0.8;
                e.modifierApplied = true;
              }
            });
          }
          break;
        case 'fast_reload':
          if (gameEngine.player && !gameEngine.player.hordeReloadModifier) {
            gameEngine.player.reloadSpeedMultiplier = 0.7;
            gameEngine.player.hordeReloadModifier = true;
          }
          break;
        case 'vampire':
          // Applied in damage handler
          break;
        case 'explosive_kills':
          // Applied in kill handler
          break;
      }
    });
  }

  /**
   * Check if a modifier is active
   * @param {string} modifierId - Modifier ID to check
   * @returns {boolean} Whether modifier is active
   */
  hasModifier(modifierId) {
    return this.activeModifiers.some(m => m.id === modifierId);
  }

  /**
   * Render horde mode HUD elements
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} canvasWidth - Canvas width
   */
  render(ctx, canvasWidth) {
    if (!this.active) return;
    
    ctx.save();
    
    // Wave counter (top left)
    const headerX = 10;
    const headerY = 20;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(headerX, headerY - 15, 200, 70);
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(headerX, headerY - 15, 200, 70);
    
    // Wave number
    ctx.fillStyle = '#ff00ff';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`WAVE ${this.wave}`, headerX + 10, headerY + 5);
    
    // Progress bar
    const progressWidth = 180;
    const progressHeight = 10;
    const progress = this.waveEnemyCount > 0 ? this.waveEnemiesKilled / this.waveEnemyCount : 0;
    
    ctx.fillStyle = '#330033';
    ctx.fillRect(headerX + 10, headerY + 20, progressWidth, progressHeight);
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(headerX + 10, headerY + 20, progressWidth * progress, progressHeight);
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(headerX + 10, headerY + 20, progressWidth, progressHeight);
    
    // Kill count
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.fillText(`${this.waveEnemiesKilled}/${this.waveEnemyCount} enemies`, headerX + 10, headerY + 45);
    
    // Personal best
    if (this.highestWave > 0) {
      ctx.fillStyle = '#888888';
      ctx.fillText(`Best: Wave ${this.highestWave}`, headerX + 120, headerY + 45);
    }
    
    // Active modifiers
    if (this.activeModifiers.length > 0) {
      ctx.fillStyle = '#ffaa00';
      ctx.font = '10px monospace';
      let modY = headerY + 60;
      this.activeModifiers.slice(0, 3).forEach(mod => {
        ctx.fillText(`✓ ${mod.name}`, headerX + 10, modY);
        modY += 12;
      });
    }
    
    ctx.restore();
  }

  /**
   * Render wave complete screen
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @param {Object} waveData - Wave completion data
   */
  renderWaveComplete(ctx, canvasWidth, canvasHeight, waveData) {
    ctx.save();
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    ctx.textAlign = 'center';
    
    // Wave complete
    ctx.fillStyle = '#ff00ff';
    ctx.font = 'bold 36px monospace';
    ctx.fillText(`WAVE ${waveData.wave} COMPLETE!`, canvasWidth / 2, 150);
    
    // Time
    ctx.fillStyle = '#ffff00';
    ctx.font = '24px monospace';
    const mins = Math.floor(waveData.waveTime / 60);
    const secs = Math.floor(waveData.waveTime % 60);
    ctx.fillText(`Time: ${mins}:${secs.toString().padStart(2, '0')}`, canvasWidth / 2, 200);
    
    // New record
    if (waveData.isNewRecord) {
      ctx.fillStyle = '#00ffff';
      ctx.font = 'bold 28px monospace';
      ctx.fillText('NEW RECORD!', canvasWidth / 2, 260);
    }
    
    // Newly unlocked modifiers
    const newMods = this.modifiers.filter(m => m.unlockWave === this.wave + 1);
    if (newMods.length > 0) {
      ctx.fillStyle = '#ffaa00';
      ctx.font = '18px monospace';
      ctx.fillText('Modifier Unlocked:', canvasWidth / 2, 320);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(newMods[0].name, canvasWidth / 2, 350);
    }
    
    // Next wave preview
    ctx.fillStyle = '#888888';
    ctx.font = '16px monospace';
    ctx.fillText(`Next: Wave ${this.wave + 1}`, canvasWidth / 2, 420);
    
    // Scaling info
    const nextScaling = 1 + ((this.wave + 1) * this.waveScaling);
    ctx.fillText(`Enemy scaling: ${Math.floor(nextScaling * 100)}%`, canvasWidth / 2, 450);
    
    ctx.fillStyle = '#00ff00';
    ctx.font = '20px monospace';
    ctx.fillText('Press SPACE to continue', canvasWidth / 2, 520);
    
    ctx.restore();
  }
}
