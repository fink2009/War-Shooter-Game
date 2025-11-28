// One-Hit Mode - Extreme difficulty with one-shot kills
class OneHitMode {
  constructor() {
    this.active = false;
    this.startTime = 0;
    this.levelsCompleted = 0;
    this.currentLevel = 1;
    this.totalKills = 0;
    this.ghostModeSpawnRate = 0.2; // 20% spawn rate for ghost mode power-ups
    this.rewards = this.loadRewards();
    this.bestRun = this.loadBestRun();
    this.deathPosition = null;
  }

  /**
   * Start one-hit mode
   * @param {number} startLevel - Level to start from (1-10)
   */
  start(startLevel = 1) {
    this.active = true;
    this.currentLevel = startLevel;
    this.levelsCompleted = 0;
    this.startTime = performance.now();
    this.totalKills = 0;
    this.deathPosition = null;
  }

  /**
   * Apply one-hit mode rules to player
   * @param {Object} player - Player entity
   */
  applyToPlayer(player) {
    if (!this.active) return;
    
    // Player has 1 HP
    player.maxHealth = 1;
    player.health = 1;
    
    // Disable all healing
    player.canHeal = false;
    
    // Mark as one-hit mode for other systems
    player.oneHitMode = true;
  }

  /**
   * Apply one-hit mode rules to enemy
   * @param {Object} enemy - Enemy entity
   */
  applyToEnemy(enemy) {
    if (!this.active) return;
    
    // Enemies also die in one hit (very low health)
    enemy.maxHealth = 1;
    enemy.health = 1;
    
    // Mark as one-hit mode
    enemy.oneHitMode = true;
  }

  /**
   * Check if pickup should spawn ghost mode
   * @returns {boolean} Whether to spawn ghost mode power-up
   */
  shouldSpawnGhostMode() {
    if (!this.active) return false;
    return Math.random() < this.ghostModeSpawnRate;
  }

  /**
   * Override pickup type for one-hit mode
   * @param {string} originalType - Original pickup type
   * @returns {string} Modified pickup type
   */
  modifyPickupType(originalType) {
    if (!this.active) return originalType;
    
    // Replace health pickups with ghost mode
    if (originalType === 'health' || originalType === 'healing') {
      if (this.shouldSpawnGhostMode()) {
        return 'powerup_ghost_mode';
      }
      return 'ammo'; // Convert health to ammo
    }
    
    // Increase ghost mode spawn rate
    if (this.shouldSpawnGhostMode()) {
      return 'powerup_ghost_mode';
    }
    
    return originalType;
  }

  /**
   * Called when level is completed
   * @returns {Object} Level completion data
   */
  levelCompleted() {
    this.levelsCompleted++;
    const levelTime = (performance.now() - this.startTime) / 1000;
    
    // Unlock reward for this level
    this.unlockReward(this.currentLevel);
    
    // Check if this is a new best
    const isNewBest = this.levelsCompleted > (this.bestRun.levels || 0);
    if (isNewBest) {
      this.bestRun = {
        levels: this.levelsCompleted,
        kills: this.totalKills,
        time: levelTime
      };
      this.saveBestRun();
    }
    
    // Move to next level
    const hasNextLevel = this.currentLevel < 10;
    this.currentLevel++;
    
    return {
      levelComplete: true,
      levelsCompleted: this.levelsCompleted,
      time: levelTime,
      isNewBest: isNewBest,
      hasNextLevel: hasNextLevel,
      unlockedReward: this.getRewardForLevel(this.currentLevel - 1)
    };
  }

  /**
   * Called when player dies
   * @param {Object} position - Death position
   * @returns {Object} Death result data
   */
  playerDied(position) {
    this.active = false;
    this.deathPosition = position;
    const totalTime = (performance.now() - this.startTime) / 1000;
    
    // Check if this is a new best
    const isNewBest = this.levelsCompleted > (this.bestRun.levels || 0);
    if (isNewBest) {
      this.bestRun = {
        levels: this.levelsCompleted,
        kills: this.totalKills,
        time: totalTime
      };
      this.saveBestRun();
    }
    
    return {
      gameOver: true,
      levelsCompleted: this.levelsCompleted,
      currentLevel: this.currentLevel,
      totalKills: this.totalKills,
      totalTime: totalTime,
      isNewBest: isNewBest,
      deathPosition: this.deathPosition
    };
  }

  /**
   * Track enemy kill
   */
  enemyKilled() {
    this.totalKills++;
  }

  /**
   * Get reward for completing a level
   * @param {number} level - Level number
   * @returns {Object|null} Reward data or null
   */
  getRewardForLevel(level) {
    const rewards = {
      1: { type: 'skin', id: 'shadow', name: 'Shadow Skin (unlock progress)' },
      2: { type: 'title', id: 'survivor', name: 'Title: Survivor' },
      3: { type: 'weapon', id: 'golden_knife', name: 'Golden Knife' },
      4: { type: 'title', id: 'untouchable', name: 'Title: Untouchable' },
      5: { type: 'skin', id: 'crimson', name: 'Crimson Skin (unlock progress)' },
      6: { type: 'weapon', id: 'death_scythe', name: 'Death Scythe' },
      7: { type: 'title', id: 'legend', name: 'Title: Legend' },
      8: { type: 'effect', id: 'death_trail', name: 'Death Trail Effect' },
      9: { type: 'title', id: 'immortal', name: 'Title: Immortal' },
      10: { type: 'skin', id: 'reaper', name: 'Reaper Skin' }
    };
    
    return rewards[level] || null;
  }

  /**
   * Unlock reward for level
   * @param {number} level - Level number
   */
  unlockReward(level) {
    if (!this.rewards.includes(level)) {
      this.rewards.push(level);
      this.saveRewards();
    }
  }

  /**
   * Check if reward is unlocked
   * @param {number} level - Level number
   * @returns {boolean} Whether reward is unlocked
   */
  isRewardUnlocked(level) {
    return this.rewards.includes(level);
  }

  /**
   * Load unlocked rewards
   * @returns {Array} Array of unlocked level numbers
   */
  loadRewards() {
    try {
      const stored = localStorage.getItem('oneHitModeRewards');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load one-hit mode rewards:', e);
    }
    return [];
  }

  /**
   * Save unlocked rewards
   */
  saveRewards() {
    try {
      localStorage.setItem('oneHitModeRewards', JSON.stringify(this.rewards));
    } catch (e) {
      console.warn('Could not save one-hit mode rewards:', e);
    }
  }

  /**
   * Load best run data
   * @returns {Object} Best run data
   */
  loadBestRun() {
    try {
      const stored = localStorage.getItem('oneHitModeBestRun');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load one-hit mode best run:', e);
    }
    return { levels: 0, kills: 0, time: 0 };
  }

  /**
   * Save best run data
   */
  saveBestRun() {
    try {
      localStorage.setItem('oneHitModeBestRun', JSON.stringify(this.bestRun));
    } catch (e) {
      console.warn('Could not save one-hit mode best run:', e);
    }
  }

  /**
   * Get current progress
   * @returns {Object} Progress data
   */
  getProgress() {
    return {
      currentLevel: this.currentLevel,
      levelsCompleted: this.levelsCompleted,
      totalKills: this.totalKills,
      bestRun: this.bestRun,
      unlockedRewards: this.rewards.length
    };
  }

  /**
   * Render one-hit mode HUD elements
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} canvasWidth - Canvas width
   */
  render(ctx, canvasWidth) {
    if (!this.active) return;
    
    ctx.save();
    
    // Warning banner
    const bannerX = canvasWidth / 2;
    const bannerY = 25;
    
    ctx.fillStyle = 'rgba(100, 0, 0, 0.9)';
    ctx.fillRect(bannerX - 120, bannerY - 18, 240, 36);
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 3;
    ctx.strokeRect(bannerX - 120, bannerY - 18, 240, 36);
    
    // Flashing effect
    const flash = Math.sin(performance.now() / 200) > 0;
    ctx.fillStyle = flash ? '#ff0000' : '#ff6600';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('☠️ ONE-HIT MODE ☠️', bannerX, bannerY + 7);
    
    // Level progress (bottom of banner)
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.fillText(`Level ${this.currentLevel}/10 | Kills: ${this.totalKills}`, bannerX, bannerY + 28);
    
    // Best run indicator
    if (this.bestRun.levels > 0) {
      ctx.fillStyle = '#888888';
      ctx.font = '10px monospace';
      ctx.fillText(`Best: ${this.bestRun.levels} levels`, bannerX, bannerY - 22);
    }
    
    ctx.restore();
  }

  /**
   * Render death screen
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @param {Object} deathData - Death result data
   */
  renderDeathScreen(ctx, canvasWidth, canvasHeight, deathData) {
    ctx.save();
    
    ctx.fillStyle = 'rgba(50, 0, 0, 0.95)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    ctx.textAlign = 'center';
    
    // Death message
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 48px monospace';
    ctx.fillText('DEATH', canvasWidth / 2, 120);
    
    // Subtitle
    ctx.fillStyle = '#ff6666';
    ctx.font = '20px monospace';
    ctx.fillText('One hit was all it took...', canvasWidth / 2, 160);
    
    // Stats
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px monospace';
    ctx.fillText(`Level Reached: ${deathData.currentLevel}`, canvasWidth / 2, 230);
    ctx.fillText(`Levels Completed: ${deathData.levelsCompleted}`, canvasWidth / 2, 270);
    ctx.fillText(`Total Kills: ${deathData.totalKills}`, canvasWidth / 2, 310);
    
    const mins = Math.floor(deathData.totalTime / 60);
    const secs = Math.floor(deathData.totalTime % 60);
    ctx.fillText(`Survival Time: ${mins}:${secs.toString().padStart(2, '0')}`, canvasWidth / 2, 350);
    
    // New best indicator
    if (deathData.isNewBest) {
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 28px monospace';
      ctx.fillText('🏆 NEW PERSONAL BEST! 🏆', canvasWidth / 2, 410);
    }
    
    // Unlocked rewards
    if (deathData.levelsCompleted > 0) {
      ctx.fillStyle = '#00ff00';
      ctx.font = '16px monospace';
      ctx.fillText(`Rewards Unlocked: ${deathData.levelsCompleted}`, canvasWidth / 2, 460);
    }
    
    // Options
    ctx.fillStyle = '#888888';
    ctx.font = '18px monospace';
    ctx.fillText('Press R to Retry | M for Menu', canvasWidth / 2, 530);
    
    ctx.restore();
  }

  /**
   * Render level complete screen
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} canvasWidth - Canvas width
   * @param {number} canvasHeight - Canvas height
   * @param {Object} levelData - Level completion data
   */
  renderLevelComplete(ctx, canvasWidth, canvasHeight, levelData) {
    ctx.save();
    
    ctx.fillStyle = 'rgba(0, 50, 0, 0.95)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    ctx.textAlign = 'center';
    
    // Success message
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('LEVEL SURVIVED!', canvasWidth / 2, 120);
    
    // Congratulatory subtitle
    ctx.fillStyle = '#88ff88';
    ctx.font = '18px monospace';
    ctx.fillText('You defied death... for now.', canvasWidth / 2, 160);
    
    // Progress
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px monospace';
    ctx.fillText(`Levels Completed: ${levelData.levelsCompleted}/10`, canvasWidth / 2, 220);
    
    // Reward unlocked
    if (levelData.unlockedReward) {
      ctx.fillStyle = '#ffaa00';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('REWARD UNLOCKED!', canvasWidth / 2, 280);
      ctx.fillStyle = '#ffffff';
      ctx.font = '18px monospace';
      ctx.fillText(levelData.unlockedReward.name, canvasWidth / 2, 310);
    }
    
    // New best indicator
    if (levelData.isNewBest) {
      ctx.fillStyle = '#00ffff';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('NEW RECORD!', canvasWidth / 2, 370);
    }
    
    // Next level warning
    if (levelData.hasNextLevel) {
      ctx.fillStyle = '#ff6600';
      ctx.font = '16px monospace';
      ctx.fillText(`Next: Level ${this.currentLevel}`, canvasWidth / 2, 430);
      ctx.fillStyle = '#888888';
      ctx.fillText('The enemies are getting stronger...', canvasWidth / 2, 455);
      
      ctx.fillStyle = '#00ff00';
      ctx.font = '20px monospace';
      ctx.fillText('Press SPACE to continue', canvasWidth / 2, 520);
    } else {
      // All levels complete!
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 28px monospace';
      ctx.fillText('🏆 ALL LEVELS COMPLETE! 🏆', canvasWidth / 2, 430);
      ctx.fillStyle = '#ffffff';
      ctx.font = '18px monospace';
      ctx.fillText('You have conquered One-Hit Mode!', canvasWidth / 2, 470);
      
      ctx.fillStyle = '#00ff00';
      ctx.font = '20px monospace';
      ctx.fillText('Press M for Menu', canvasWidth / 2, 520);
    }
    
    ctx.restore();
  }
}
