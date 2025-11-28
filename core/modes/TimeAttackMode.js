// Time Attack Mode - Complete levels as fast as possible
class TimeAttackMode {
  constructor() {
    this.active = false;
    this.startTime = 0;
    this.endTime = 0;
    this.elapsedTime = 0;
    this.paused = false;
    this.pausedTime = 0;
    this.currentLevel = 1;
    this.medals = {
      gold: 180,    // 3 minutes
      silver: 300,  // 5 minutes
      bronze: 480   // 8 minutes
    };
    this.bestTimes = this.loadBestTimes();
    this.ghostData = null;
    this.recordingData = [];
    this.styleBonus = {
      noDamage: false,
      meleeOnly: false,
      comboBonus: 0
    };
  }

  /**
   * Start time attack mode for a level
   * @param {number} level - Level number to attempt
   */
  start(level) {
    this.active = true;
    this.currentLevel = level;
    this.startTime = performance.now();
    this.endTime = 0;
    this.elapsedTime = 0;
    this.paused = false;
    this.pausedTime = 0;
    this.recordingData = [];
    this.styleBonus = {
      noDamage: true,
      meleeOnly: true,
      comboBonus: 0
    };
    
    // Load ghost data for this level
    this.loadGhostData(level);
  }

  /**
   * Stop and finalize time attack attempt
   * @param {boolean} completed - Whether level was completed
   * @returns {Object} Result data including time and medal
   */
  stop(completed) {
    if (!this.active) return null;
    
    this.endTime = performance.now();
    this.elapsedTime = (this.endTime - this.startTime - this.pausedTime) / 1000;
    this.active = false;
    
    if (!completed) {
      return {
        completed: false,
        time: this.elapsedTime,
        medal: null
      };
    }
    
    const medal = this.calculateMedal(this.elapsedTime);
    const isNewBest = this.checkAndSaveBestTime(this.currentLevel, this.elapsedTime);
    
    // Save ghost data if new best
    if (isNewBest) {
      this.saveGhostData(this.currentLevel);
    }
    
    return {
      completed: true,
      time: this.elapsedTime,
      medal: medal,
      isNewBest: isNewBest,
      styleBonus: this.calculateStyleBonus()
    };
  }

  /**
   * Pause the timer
   */
  pause() {
    if (this.active && !this.paused) {
      this.paused = true;
      this.pauseStartTime = performance.now();
    }
  }

  /**
   * Resume the timer
   */
  resume() {
    if (this.active && this.paused) {
      this.paused = false;
      this.pausedTime += performance.now() - this.pauseStartTime;
    }
  }

  /**
   * Update time tracking and ghost recording
   * @param {number} deltaTime - Time since last update
   * @param {Object} playerData - Current player position/state
   */
  update(deltaTime, playerData) {
    if (!this.active || this.paused) return;
    
    this.elapsedTime = (performance.now() - this.startTime - this.pausedTime) / 1000;
    
    // Record ghost data every 100ms
    // Max 10 minutes of recording (10 min * 60 sec * 10 samples/sec = 6000 samples)
    const MAX_GHOST_SAMPLES = 6000;
    if (playerData && this.recordingData.length < MAX_GHOST_SAMPLES) {
      const lastRecord = this.recordingData[this.recordingData.length - 1];
      if (!lastRecord || this.elapsedTime - lastRecord.time >= 0.1) {
        this.recordingData.push({
          time: this.elapsedTime,
          x: playerData.x,
          y: playerData.y,
          facing: playerData.facing
        });
      }
    }
  }

  /**
   * Track when player takes damage (affects style bonus)
   */
  trackDamageTaken() {
    this.styleBonus.noDamage = false;
  }

  /**
   * Track when player uses ranged weapon (affects style bonus)
   */
  trackRangedKill() {
    this.styleBonus.meleeOnly = false;
  }

  /**
   * Track combo for style bonus
   * @param {number} comboCount - Current combo count
   */
  trackCombo(comboCount) {
    if (comboCount > this.styleBonus.comboBonus) {
      this.styleBonus.comboBonus = comboCount;
    }
  }

  /**
   * Calculate medal based on time
   * @param {number} timeSeconds - Completion time in seconds
   * @returns {string|null} Medal type or null
   */
  calculateMedal(timeSeconds) {
    if (timeSeconds <= this.medals.gold) return 'gold';
    if (timeSeconds <= this.medals.silver) return 'silver';
    if (timeSeconds <= this.medals.bronze) return 'bronze';
    return null;
  }

  /**
   * Calculate style bonus score
   * @returns {Object} Style bonus breakdown
   */
  calculateStyleBonus() {
    let bonus = 0;
    const breakdown = [];
    
    if (this.styleBonus.noDamage) {
      bonus += 1000;
      breakdown.push({ name: 'No Damage', value: 1000 });
    }
    
    if (this.styleBonus.meleeOnly) {
      bonus += 500;
      breakdown.push({ name: 'Melee Only', value: 500 });
    }
    
    if (this.styleBonus.comboBonus >= 10) {
      const comboPoints = Math.min(this.styleBonus.comboBonus * 50, 1000);
      bonus += comboPoints;
      breakdown.push({ name: `${this.styleBonus.comboBonus}x Combo`, value: comboPoints });
    }
    
    return { total: bonus, breakdown: breakdown };
  }

  /**
   * Check if time is a new best and save if so
   * @param {number} level - Level number
   * @param {number} time - Completion time
   * @returns {boolean} Whether this is a new best
   */
  checkAndSaveBestTime(level, time) {
    const currentBest = this.bestTimes[level];
    if (!currentBest || time < currentBest) {
      this.bestTimes[level] = time;
      this.saveBestTimes();
      return true;
    }
    return false;
  }

  /**
   * Load best times from localStorage
   * @returns {Object} Best times by level
   */
  loadBestTimes() {
    try {
      const stored = localStorage.getItem('timeAttackBestTimes');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load time attack best times:', e);
    }
    return {};
  }

  /**
   * Save best times to localStorage
   */
  saveBestTimes() {
    try {
      localStorage.setItem('timeAttackBestTimes', JSON.stringify(this.bestTimes));
    } catch (e) {
      console.warn('Could not save time attack best times:', e);
    }
  }

  /**
   * Load ghost replay data for a level
   * @param {number} level - Level number
   */
  loadGhostData(level) {
    try {
      const stored = localStorage.getItem(`timeAttackGhost_${level}`);
      if (stored) {
        this.ghostData = JSON.parse(stored);
      } else {
        this.ghostData = null;
      }
    } catch (e) {
      console.warn('Could not load ghost data:', e);
      this.ghostData = null;
    }
  }

  /**
   * Save ghost replay data for a level
   * @param {number} level - Level number
   */
  saveGhostData(level) {
    try {
      localStorage.setItem(`timeAttackGhost_${level}`, JSON.stringify(this.recordingData));
    } catch (e) {
      console.warn('Could not save ghost data:', e);
    }
  }

  /**
   * Get ghost position at a given time
   * @param {number} time - Time in seconds
   * @returns {Object|null} Ghost position data or null
   */
  getGhostPosition(time) {
    if (!this.ghostData || this.ghostData.length === 0) return null;
    
    // Find the closest recorded position
    for (let i = 0; i < this.ghostData.length; i++) {
      if (this.ghostData[i].time >= time) {
        return this.ghostData[i];
      }
    }
    return this.ghostData[this.ghostData.length - 1];
  }

  /**
   * Get best time for a level
   * @param {number} level - Level number
   * @returns {number|null} Best time or null
   */
  getBestTime(level) {
    return this.bestTimes[level] || null;
  }

  /**
   * Get all level times with medals
   * @returns {Array} Array of level time data
   */
  getAllLevelData() {
    const data = [];
    for (let i = 1; i <= 10; i++) {
      const time = this.bestTimes[i];
      data.push({
        level: i,
        time: time || null,
        medal: time ? this.calculateMedal(time) : null
      });
    }
    return data;
  }

  /**
   * Format time for display
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string
   */
  formatTime(seconds) {
    if (seconds === null || seconds === undefined) return '--:--:---';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}`;
  }

  /**
   * Render time attack HUD elements
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} canvasWidth - Canvas width
   */
  render(ctx, canvasWidth) {
    if (!this.active) return;
    
    ctx.save();
    
    // Timer display (top center)
    const timerX = canvasWidth / 2;
    const timerY = 30;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(timerX - 100, timerY - 20, 200, 40);
    ctx.strokeStyle = '#ffaa00';
    ctx.lineWidth = 2;
    ctx.strokeRect(timerX - 100, timerY - 20, 200, 40);
    
    // Timer text
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.formatTime(this.elapsedTime), timerX, timerY + 8);
    
    // Best time indicator
    const bestTime = this.getBestTime(this.currentLevel);
    if (bestTime) {
      ctx.fillStyle = '#888888';
      ctx.font = '12px monospace';
      ctx.fillText(`BEST: ${this.formatTime(bestTime)}`, timerX, timerY + 28);
      
      // Ahead/behind indicator
      const diff = this.elapsedTime - bestTime;
      if (diff < 0) {
        ctx.fillStyle = '#00ff00';
        ctx.fillText(`-${this.formatTime(Math.abs(diff))}`, timerX + 80, timerY + 8);
      } else {
        ctx.fillStyle = '#ff0000';
        ctx.fillText(`+${this.formatTime(diff)}`, timerX + 80, timerY + 8);
      }
    }
    
    // Medal targets
    ctx.fillStyle = '#888888';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('🥇 <3:00  🥈 <5:00  🥉 <8:00', timerX - 95, timerY - 25);
    
    ctx.restore();
  }

  /**
   * Render ghost player
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} camera - Camera for position offset
   */
  renderGhost(ctx, camera) {
    if (!this.active || !this.ghostData) return;
    
    const ghostPos = this.getGhostPosition(this.elapsedTime);
    if (!ghostPos) return;
    
    ctx.save();
    ctx.globalAlpha = 0.4;
    
    // Draw ghost player silhouette
    const screenX = ghostPos.x - camera.x;
    const screenY = ghostPos.y;
    
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(screenX, screenY, 30, 50);
    
    // Ghost label
    ctx.fillStyle = '#00ffff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GHOST', screenX + 15, screenY - 5);
    
    ctx.restore();
  }
}
