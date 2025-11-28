// Boss Rush Mode - Fight all bosses back-to-back
class BossRushMode {
  constructor() {
    this.active = false;
    this.currentBossIndex = 0;
    this.startTime = 0;
    this.totalTime = 0;
    this.bossTimes = [];
    this.healthRefillPercent = 0.5;
    this.difficultyMultiplier = 1.0;
    this.difficultyOptions = [1.0, 1.5, 2.0, 3.0];
    this.bossOrder = [0, 1, 2, 3]; // Default order (can be randomized)
    this.powerUpQueue = [];
    this.bossesDefeated = [];
    this.unlockedBosses = this.loadUnlockedBosses();
    this.bestTotalTime = this.loadBestTime();
    this.bestBossTimes = this.loadBestBossTimes();
  }

  /**
   * Start boss rush mode
   * @param {number} startBoss - Boss index to start from (0-3)
   * @param {number} difficulty - Difficulty multiplier index
   * @param {boolean} randomOrder - Whether to randomize boss order
   */
  start(startBoss = 0, difficulty = 0, randomOrder = false) {
    this.active = true;
    this.currentBossIndex = 0;
    this.startTime = performance.now();
    this.totalTime = 0;
    this.bossTimes = [];
    this.bossesDefeated = [];
    this.difficultyMultiplier = this.difficultyOptions[difficulty] || 1.0;
    
    // Set up boss order
    this.bossOrder = [0, 1, 2, 3];
    if (startBoss > 0) {
      // Start from a specific boss
      this.bossOrder = this.bossOrder.slice(startBoss);
    }
    if (randomOrder) {
      this.shuffleBossOrder();
    }
    
    // Generate random power-up queue
    this.generatePowerUpQueue();
    
    // Start first boss timer
    this.currentBossStartTime = performance.now();
  }

  /**
   * Shuffle boss order randomly
   */
  shuffleBossOrder() {
    for (let i = this.bossOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.bossOrder[i], this.bossOrder[j]] = [this.bossOrder[j], this.bossOrder[i]];
    }
  }

  /**
   * Generate random power-ups for between boss fights
   */
  generatePowerUpQueue() {
    const powerUps = [
      'powerup_damage_boost',
      'powerup_speed',
      'powerup_rapid_fire',
      'powerup_multi_shot',
      'powerup_shield',
      'powerup_invincibility',
      'powerup_time_slow'
    ];
    
    this.powerUpQueue = [];
    for (let i = 0; i < this.bossOrder.length - 1; i++) {
      const randomPowerUp = powerUps[Math.floor(Math.random() * powerUps.length)];
      this.powerUpQueue.push(randomPowerUp);
    }
  }

  /**
   * Called when a boss is defeated
   * @param {number} bossId - The boss that was defeated
   * @returns {Object} Result data for this boss
   */
  bossDefeated(bossId) {
    const bossTime = (performance.now() - this.currentBossStartTime) / 1000;
    
    this.bossTimes.push({
      bossId: bossId,
      time: bossTime,
      order: this.currentBossIndex + 1
    });
    
    this.bossesDefeated.push(bossId);
    
    // Check for personal best on this boss
    const isNewBest = this.checkBossBestTime(bossId, bossTime);
    
    // Get power-up for this transition (if not last boss)
    const powerUp = this.powerUpQueue[this.currentBossIndex] || null;
    
    this.currentBossIndex++;
    
    // Check if all bosses defeated
    if (this.currentBossIndex >= this.bossOrder.length) {
      return this.complete();
    }
    
    // Prepare for next boss
    this.currentBossStartTime = performance.now();
    
    return {
      completed: false,
      bossTime: bossTime,
      isNewBest: isNewBest,
      nextBossId: this.bossOrder[this.currentBossIndex],
      powerUp: powerUp,
      healthRefill: this.healthRefillPercent
    };
  }

  /**
   * Complete boss rush mode
   * @returns {Object} Final results
   */
  complete() {
    this.active = false;
    this.totalTime = (performance.now() - this.startTime) / 1000;
    
    const isNewBest = this.checkAndSaveBestTime(this.totalTime);
    
    // Unlock all bosses that were defeated
    this.bossesDefeated.forEach(bossId => {
      this.unlockBoss(bossId);
    });
    
    return {
      completed: true,
      totalTime: this.totalTime,
      bossTimes: this.bossTimes,
      isNewBest: isNewBest,
      difficultyMultiplier: this.difficultyMultiplier
    };
  }

  /**
   * Get current boss ID
   * @returns {number} Current boss ID
   */
  getCurrentBossId() {
    if (!this.active || this.currentBossIndex >= this.bossOrder.length) {
      return null;
    }
    return this.bossOrder[this.currentBossIndex];
  }

  /**
   * Get progress through boss rush
   * @returns {Object} Progress data
   */
  getProgress() {
    return {
      current: this.currentBossIndex + 1,
      total: this.bossOrder.length,
      bossesDefeated: this.bossesDefeated.length
    };
  }

  /**
   * Apply difficulty multiplier to boss stats
   * @param {Object} boss - Boss entity
   */
  applyDifficultyToBoss(boss) {
    if (!this.active) return;
    
    boss.maxHealth = Math.floor(boss.maxHealth * this.difficultyMultiplier);
    boss.health = boss.maxHealth;
    boss.damage = Math.floor(boss.damage * (1 + (this.difficultyMultiplier - 1) * 0.5));
  }

  /**
   * Check and save best boss time
   * @param {number} bossId - Boss ID
   * @param {number} time - Completion time
   * @returns {boolean} Whether this is a new best
   */
  checkBossBestTime(bossId, time) {
    if (!this.bestBossTimes[bossId] || time < this.bestBossTimes[bossId]) {
      this.bestBossTimes[bossId] = time;
      this.saveBestBossTimes();
      return true;
    }
    return false;
  }

  /**
   * Check and save best total time
   * @param {number} time - Total completion time
   * @returns {boolean} Whether this is a new best
   */
  checkAndSaveBestTime(time) {
    if (!this.bestTotalTime || time < this.bestTotalTime) {
      this.bestTotalTime = time;
      this.saveBestTime();
      return true;
    }
    return false;
  }

  /**
   * Load unlocked bosses from storage
   * @returns {Array} Array of unlocked boss IDs
   */
  loadUnlockedBosses() {
    try {
      const stored = localStorage.getItem('bossRushUnlocked');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load unlocked bosses:', e);
    }
    return [0]; // First boss always unlocked
  }

  /**
   * Unlock a boss for selection
   * @param {number} bossId - Boss ID to unlock
   */
  unlockBoss(bossId) {
    if (!this.unlockedBosses.includes(bossId)) {
      this.unlockedBosses.push(bossId);
      this.saveUnlockedBosses();
    }
  }

  /**
   * Save unlocked bosses
   */
  saveUnlockedBosses() {
    try {
      localStorage.setItem('bossRushUnlocked', JSON.stringify(this.unlockedBosses));
    } catch (e) {
      console.warn('Could not save unlocked bosses:', e);
    }
  }

  /**
   * Load best total time
   * @returns {number|null} Best time or null
   */
  loadBestTime() {
    try {
      const stored = localStorage.getItem('bossRushBestTime');
      if (stored) {
        return parseFloat(stored);
      }
    } catch (e) {
      console.warn('Could not load boss rush best time:', e);
    }
    return null;
  }

  /**
   * Save best total time
   */
  saveBestTime() {
    try {
      localStorage.setItem('bossRushBestTime', this.bestTotalTime.toString());
    } catch (e) {
      console.warn('Could not save boss rush best time:', e);
    }
  }

  /**
   * Load best boss times
   * @returns {Object} Best times by boss ID
   */
  loadBestBossTimes() {
    try {
      const stored = localStorage.getItem('bossRushBestBossTimes');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load boss best times:', e);
    }
    return {};
  }

  /**
   * Save best boss times
   */
  saveBestBossTimes() {
    try {
      localStorage.setItem('bossRushBestBossTimes', JSON.stringify(this.bestBossTimes));
    } catch (e) {
      console.warn('Could not save boss best times:', e);
    }
  }

  /**
   * Get boss name by ID
   * @param {number} bossId - Boss ID
   * @returns {string} Boss name
   */
  getBossName(bossId) {
    const names = ['The Warlord', 'The Devastator', 'The Annihilator', 'The Overlord'];
    return names[bossId] || 'Unknown Boss';
  }

  /**
   * Format time for display
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time
   */
  formatTime(seconds) {
    if (seconds === null || seconds === undefined) return '--:--';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }

  /**
   * Render boss rush HUD elements
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} canvasWidth - Canvas width
   */
  render(ctx, canvasWidth) {
    if (!this.active) return;
    
    ctx.save();
    
    const elapsed = (performance.now() - this.startTime) / 1000;
    const bossElapsed = (performance.now() - this.currentBossStartTime) / 1000;
    
    // Boss rush header
    const headerY = 20;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, headerY - 15, 250, 60);
    ctx.strokeStyle = '#ff6600';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, headerY - 15, 250, 60);
    
    // Mode title
    ctx.fillStyle = '#ff6600';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('BOSS RUSH', 20, headerY);
    
    // Progress
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.fillText(`Boss ${this.currentBossIndex + 1}/${this.bossOrder.length}`, 130, headerY);
    
    // Current boss timer
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(this.formatTime(bossElapsed), 20, headerY + 25);
    
    // Total time
    ctx.fillStyle = '#888888';
    ctx.font = '12px monospace';
    ctx.fillText(`Total: ${this.formatTime(elapsed)}`, 130, headerY + 25);
    
    // Difficulty indicator
    if (this.difficultyMultiplier > 1.0) {
      ctx.fillStyle = '#ff0000';
      ctx.fillText(`${this.difficultyMultiplier}x`, 220, headerY);
    }
    
    ctx.restore();
  }

  /**
   * Render transition screen between bosses
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @param {Object} transitionData - Data about the transition
   */
  renderTransition(ctx, canvasWidth, canvasHeight, transitionData) {
    ctx.save();
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    ctx.textAlign = 'center';
    
    // Boss defeated message
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 32px monospace';
    ctx.fillText('BOSS DEFEATED!', canvasWidth / 2, 150);
    
    // Time for this boss
    ctx.fillStyle = '#ffff00';
    ctx.font = '24px monospace';
    ctx.fillText(`Time: ${this.formatTime(transitionData.bossTime)}`, canvasWidth / 2, 200);
    
    if (transitionData.isNewBest) {
      ctx.fillStyle = '#00ffff';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('NEW PERSONAL BEST!', canvasWidth / 2, 235);
    }
    
    // Health refill
    ctx.fillStyle = '#00ff00';
    ctx.font = '18px monospace';
    ctx.fillText(`Health restored to ${Math.floor(this.healthRefillPercent * 100)}%`, canvasWidth / 2, 290);
    
    // Power-up reward
    if (transitionData.powerUp) {
      ctx.fillStyle = '#ff00ff';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('POWER-UP AWARDED!', canvasWidth / 2, 340);
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px monospace';
      const powerUpName = transitionData.powerUp.replace('powerup_', '').replace('_', ' ').toUpperCase();
      ctx.fillText(powerUpName, canvasWidth / 2, 370);
    }
    
    // Next boss preview
    if (transitionData.nextBossId !== null && transitionData.nextBossId !== undefined) {
      ctx.fillStyle = '#ff6600';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('NEXT: ' + this.getBossName(transitionData.nextBossId), canvasWidth / 2, 450);
    }
    
    ctx.fillStyle = '#888888';
    ctx.font = '16px monospace';
    ctx.fillText('Press SPACE to continue', canvasWidth / 2, 520);
    
    ctx.restore();
  }
}
