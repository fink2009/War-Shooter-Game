// Statistics Tracking System - Comprehensive stat tracking
class StatisticsSystem {
  constructor() {
    this.stats = this.loadStats();
    this.sessionStats = this.getDefaultSessionStats();
    this.saveInterval = 5000; // 5 seconds
    this.lastSaveTime = 0;
    this.milestones = {
      kills: [100, 500, 1000, 5000, 10000],
      waves: [10, 25, 50, 100],
      playtime: [1, 5, 10, 50, 100] // hours
    };
    this.pendingMilestones = [];
  }

  /**
   * Get default stats structure
   * @returns {Object} Default stats
   */
  getDefaultStats() {
    return {
      // Combat stats
      combat: {
        totalKills: 0,
        killsByEnemyType: {
          infantry: 0,
          heavy: 0,
          sniper: 0,
          scout: 0,
          drone: 0,
          berserker: 0,
          bomber: 0,
          riot: 0,
          medic: 0,
          engineer: 0,
          flamethrower: 0,
          boss: 0
        },
        killsByWeaponType: {
          pistol: 0,
          rifle: 0,
          shotgun: 0,
          machinegun: 0,
          sniper: 0,
          grenade: 0,
          laser: 0,
          rocket: 0,
          knife: 0,
          sword: 0,
          axe: 0,
          hammer: 0,
          spear: 0
        },
        meleeKills: 0,
        rangedKills: 0,
        stealthKills: 0,
        eliteKills: 0,
        bossKills: 0,
        highestCombo: 0,
        totalShotsFired: 0,
        totalShotsHit: 0
      },
      
      // Survival stats
      survival: {
        totalDeaths: 0,
        highestWaveReached: 0,
        totalWavesSurvived: 0,
        totalDamageTaken: 0,
        totalDamageDealt: 0,
        totalHealthRestored: 0,
        timesRevived: 0
      },
      
      // Progression stats
      progression: {
        totalPlaytime: 0, // in seconds
        campaignLevelsCompleted: 0,
        campaignCompleted: false,
        totalCoinsEarned: 0,
        totalCoinsSpent: 0,
        upgradesPurchased: 0,
        weaponsUnlocked: 0,
        achievementsUnlocked: 0
      },
      
      // Efficiency stats
      efficiency: {
        favoriteWeapon: null,
        favoriteWeaponKills: 0,
        favoriteCharacter: null,
        favoriteCharacterTime: 0,
        bestTimeAttackTime: null,
        fastestBossKill: null,
        mostKillsInWave: 0,
        longestSurvivalTime: 0
      },
      
      // Challenge mode stats
      challenges: {
        timeAttack: {
          completed: false,
          totalAttempts: 0,
          goldMedals: 0,
          silverMedals: 0,
          bronzeMedals: 0,
          bestTimes: {}
        },
        bossRush: {
          completed: false,
          totalAttempts: 0,
          bestTime: null,
          bestBossTimes: {}
        },
        horde: {
          highestWave: 0,
          totalWavesCleared: 0,
          totalAttempts: 0
        },
        oneHit: {
          levelsCompleted: 0,
          totalAttempts: 0,
          bestRun: 0
        }
      },
      
      // Milestone tracking
      milestonesReached: {
        kills: [],
        waves: [],
        playtime: []
      },
      
      // Meta
      firstPlayDate: null,
      lastPlayDate: null,
      totalSessions: 0
    };
  }

  /**
   * Get default session stats
   * @returns {Object} Default session stats
   */
  getDefaultSessionStats() {
    return {
      kills: 0,
      deaths: 0,
      damageDealt: 0,
      damageTaken: 0,
      shotsFired: 0,
      shotsHit: 0,
      wavesSurvived: 0,
      coinsEarned: 0,
      playtime: 0,
      startTime: performance.now()
    };
  }

  /**
   * Start a new session
   */
  startSession() {
    this.sessionStats = this.getDefaultSessionStats();
    this.stats.totalSessions++;
    this.stats.lastPlayDate = new Date().toISOString();
    
    if (!this.stats.firstPlayDate) {
      this.stats.firstPlayDate = new Date().toISOString();
    }
  }

  /**
   * End current session
   */
  endSession() {
    // Merge session stats into total stats
    this.mergeSessionStats();
    this.saveStats();
  }

  /**
   * Merge session stats into permanent stats
   */
  mergeSessionStats() {
    const session = this.sessionStats;
    const stats = this.stats;
    
    stats.combat.totalShotsFired += session.shotsFired;
    stats.combat.totalShotsHit += session.shotsHit;
    stats.survival.totalDamageDealt += session.damageDealt;
    stats.survival.totalDamageTaken += session.damageTaken;
    stats.survival.totalWavesSurvived += session.wavesSurvived;
    stats.progression.totalCoinsEarned += session.coinsEarned;
    stats.progression.totalPlaytime += session.playtime / 1000; // Convert to seconds
    
    // Update longest survival time
    if (session.playtime > stats.efficiency.longestSurvivalTime) {
      stats.efficiency.longestSurvivalTime = session.playtime;
    }
  }

  /**
   * Track a kill
   * @param {Object} enemy - Enemy that was killed
   * @param {Object} weapon - Weapon used
   * @param {boolean} isStealthy - Whether it was a stealth kill
   */
  trackKill(enemy, weapon, isStealthy = false) {
    const stats = this.stats;
    
    stats.combat.totalKills++;
    this.sessionStats.kills++;
    
    // Track by enemy type
    const enemyType = enemy.enemyType || 'infantry';
    if (stats.combat.killsByEnemyType[enemyType] !== undefined) {
      stats.combat.killsByEnemyType[enemyType]++;
    }
    
    // Track by weapon type
    if (weapon) {
      const weaponName = weapon.name.toLowerCase().replace(/ /g, '');
      if (stats.combat.killsByWeaponType[weaponName] !== undefined) {
        stats.combat.killsByWeaponType[weaponName]++;
      }
      
      // Update favorite weapon
      if (stats.combat.killsByWeaponType[weaponName] > stats.efficiency.favoriteWeaponKills) {
        stats.efficiency.favoriteWeapon = weapon.name;
        stats.efficiency.favoriteWeaponKills = stats.combat.killsByWeaponType[weaponName];
      }
      
      // Track melee vs ranged
      if (weapon.isMelee) {
        stats.combat.meleeKills++;
      } else {
        stats.combat.rangedKills++;
      }
    }
    
    // Track special kill types
    if (isStealthy) {
      stats.combat.stealthKills++;
    }
    if (enemy.isElite) {
      stats.combat.eliteKills++;
    }
    if (enemy.isBoss) {
      stats.combat.bossKills++;
    }
    
    // Check milestones
    this.checkMilestones('kills', stats.combat.totalKills);
    
    this.autoSave();
  }

  /**
   * Track a death
   */
  trackDeath() {
    this.stats.survival.totalDeaths++;
    this.sessionStats.deaths++;
    this.autoSave();
  }

  /**
   * Track combo
   * @param {number} combo - Current combo count
   */
  trackCombo(combo) {
    if (combo > this.stats.combat.highestCombo) {
      this.stats.combat.highestCombo = combo;
    }
  }

  /**
   * Track wave completion
   * @param {number} wave - Wave number
   * @param {number} kills - Kills in this wave
   */
  trackWaveComplete(wave, kills) {
    this.sessionStats.wavesSurvived++;
    
    if (wave > this.stats.survival.highestWaveReached) {
      this.stats.survival.highestWaveReached = wave;
    }
    
    if (kills > this.stats.efficiency.mostKillsInWave) {
      this.stats.efficiency.mostKillsInWave = kills;
    }
    
    this.checkMilestones('waves', wave);
    this.autoSave();
  }

  /**
   * Track damage dealt
   * @param {number} amount - Damage amount
   */
  trackDamageDealt(amount) {
    this.sessionStats.damageDealt += amount;
  }

  /**
   * Track damage taken
   * @param {number} amount - Damage amount
   */
  trackDamageTaken(amount) {
    this.sessionStats.damageTaken += amount;
  }

  /**
   * Track shot fired
   */
  trackShotFired() {
    this.sessionStats.shotsFired++;
  }

  /**
   * Track shot hit
   */
  trackShotHit() {
    this.sessionStats.shotsHit++;
  }

  /**
   * Track coins earned
   * @param {number} amount - Coin amount
   */
  trackCoinsEarned(amount) {
    this.sessionStats.coinsEarned += amount;
  }

  /**
   * Track coins spent
   * @param {number} amount - Coin amount
   */
  trackCoinsSpent(amount) {
    this.stats.progression.totalCoinsSpent += amount;
    this.autoSave();
  }

  /**
   * Track health restored
   * @param {number} amount - Health amount
   */
  trackHealthRestored(amount) {
    this.stats.survival.totalHealthRestored += amount;
  }

  /**
   * Track campaign completion
   */
  trackCampaignComplete() {
    this.stats.progression.campaignCompleted = true;
    this.stats.progression.campaignLevelsCompleted = 10;
    this.autoSave();
  }

  /**
   * Track character playtime
   * @param {string} character - Character type
   * @param {number} time - Time in milliseconds
   */
  trackCharacterTime(character, time) {
    if (time > this.stats.efficiency.favoriteCharacterTime) {
      this.stats.efficiency.favoriteCharacter = character;
      this.stats.efficiency.favoriteCharacterTime = time;
    }
  }

  /**
   * Track time attack completion
   * @param {number} level - Level number
   * @param {number} time - Completion time
   * @param {string} medal - Medal earned
   */
  trackTimeAttack(level, time, medal) {
    const ta = this.stats.challenges.timeAttack;
    ta.totalAttempts++;
    
    if (!ta.bestTimes[level] || time < ta.bestTimes[level]) {
      ta.bestTimes[level] = time;
    }
    
    if (medal === 'gold') ta.goldMedals++;
    else if (medal === 'silver') ta.silverMedals++;
    else if (medal === 'bronze') ta.bronzeMedals++;
    
    if (!ta.completed && Object.keys(ta.bestTimes).length >= 10) {
      ta.completed = true;
    }
    
    this.autoSave();
  }

  /**
   * Track boss rush completion
   * @param {number} time - Total time
   * @param {Array} bossTimes - Individual boss times
   */
  trackBossRush(time, bossTimes) {
    const br = this.stats.challenges.bossRush;
    br.totalAttempts++;
    
    if (!br.bestTime || time < br.bestTime) {
      br.bestTime = time;
    }
    
    bossTimes.forEach(bt => {
      if (!br.bestBossTimes[bt.bossId] || bt.time < br.bestBossTimes[bt.bossId]) {
        br.bestBossTimes[bt.bossId] = bt.time;
      }
    });
    
    br.completed = true;
    this.autoSave();
  }

  /**
   * Track horde mode
   * @param {number} wave - Wave reached
   */
  trackHordeMode(wave) {
    const horde = this.stats.challenges.horde;
    horde.totalAttempts++;
    horde.totalWavesCleared += wave;
    
    if (wave > horde.highestWave) {
      horde.highestWave = wave;
    }
    
    this.autoSave();
  }

  /**
   * Track one-hit mode
   * @param {number} levels - Levels completed
   */
  trackOneHitMode(levels) {
    const oh = this.stats.challenges.oneHit;
    oh.totalAttempts++;
    
    if (levels > oh.levelsCompleted) {
      oh.levelsCompleted = levels;
    }
    
    if (levels > oh.bestRun) {
      oh.bestRun = levels;
    }
    
    this.autoSave();
  }

  /**
   * Check for milestone achievements
   * @param {string} type - Milestone type
   * @param {number} value - Current value
   */
  checkMilestones(type, value) {
    const milestones = this.milestones[type];
    if (!milestones) return;
    
    milestones.forEach(milestone => {
      if (value >= milestone && !this.stats.milestonesReached[type].includes(milestone)) {
        this.stats.milestonesReached[type].push(milestone);
        this.pendingMilestones.push({
          type: type,
          value: milestone,
          label: this.getMilestoneLabel(type, milestone)
        });
      }
    });
  }

  /**
   * Get milestone label
   * @param {string} type - Milestone type
   * @param {number} value - Milestone value
   * @returns {string} Milestone label
   */
  getMilestoneLabel(type, value) {
    switch (type) {
      case 'kills':
        return `${value.toLocaleString()} Kills`;
      case 'waves':
        return `Wave ${value} Reached`;
      case 'playtime':
        return `${value} Hour${value > 1 ? 's' : ''} Played`;
      default:
        return `${type}: ${value}`;
    }
  }

  /**
   * Get and clear pending milestones
   * @returns {Array} Pending milestones
   */
  getPendingMilestones() {
    const milestones = [...this.pendingMilestones];
    this.pendingMilestones = [];
    return milestones;
  }

  /**
   * Update playtime
   */
  updatePlaytime() {
    this.sessionStats.playtime = performance.now() - this.sessionStats.startTime;
    
    // Check playtime milestones (in hours)
    const totalHours = (this.stats.progression.totalPlaytime + this.sessionStats.playtime / 1000) / 3600;
    this.checkMilestones('playtime', Math.floor(totalHours));
  }

  /**
   * Calculate accuracy percentage
   * @returns {number} Accuracy percentage
   */
  getAccuracy() {
    const fired = this.stats.combat.totalShotsFired + this.sessionStats.shotsFired;
    const hit = this.stats.combat.totalShotsHit + this.sessionStats.shotsHit;
    
    if (fired === 0) return 0;
    return Math.round((hit / fired) * 100 * 10) / 10;
  }

  /**
   * Get formatted playtime
   * @returns {string} Formatted playtime string
   */
  getFormattedPlaytime() {
    const totalSeconds = this.stats.progression.totalPlaytime + (this.sessionStats.playtime / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    return `${hours}h ${minutes}m`;
  }

  /**
   * Get stats summary for display
   * @returns {Object} Stats summary
   */
  getStatsSummary() {
    return {
      combat: {
        totalKills: this.stats.combat.totalKills,
        highestCombo: this.stats.combat.highestCombo,
        accuracy: this.getAccuracy(),
        stealthKills: this.stats.combat.stealthKills,
        bossKills: this.stats.combat.bossKills
      },
      survival: {
        totalDeaths: this.stats.survival.totalDeaths,
        highestWave: this.stats.survival.highestWaveReached,
        damageDealt: this.stats.survival.totalDamageDealt,
        damageTaken: this.stats.survival.totalDamageTaken
      },
      progression: {
        playtime: this.getFormattedPlaytime(),
        coinsEarned: this.stats.progression.totalCoinsEarned,
        campaignCompleted: this.stats.progression.campaignCompleted
      },
      efficiency: {
        favoriteWeapon: this.stats.efficiency.favoriteWeapon,
        favoriteCharacter: this.stats.efficiency.favoriteCharacter,
        mostKillsInWave: this.stats.efficiency.mostKillsInWave
      }
    };
  }

  /**
   * Export stats as text
   * @returns {string} Stats as text
   */
  exportStats() {
    const summary = this.getStatsSummary();
    const lines = [
      '=== WAR SHOOTER STATISTICS ===',
      '',
      '--- COMBAT ---',
      `Total Kills: ${summary.combat.totalKills}`,
      `Highest Combo: ${summary.combat.highestCombo}x`,
      `Accuracy: ${summary.combat.accuracy}%`,
      `Stealth Kills: ${summary.combat.stealthKills}`,
      `Boss Kills: ${summary.combat.bossKills}`,
      '',
      '--- SURVIVAL ---',
      `Total Deaths: ${summary.survival.totalDeaths}`,
      `Highest Wave: ${summary.survival.highestWave}`,
      `Damage Dealt: ${summary.survival.damageDealt}`,
      `Damage Taken: ${summary.survival.damageTaken}`,
      '',
      '--- PROGRESSION ---',
      `Total Playtime: ${summary.progression.playtime}`,
      `Coins Earned: ${summary.progression.coinsEarned}`,
      `Campaign Completed: ${summary.progression.campaignCompleted ? 'Yes' : 'No'}`,
      '',
      '--- EFFICIENCY ---',
      `Favorite Weapon: ${summary.efficiency.favoriteWeapon || 'N/A'}`,
      `Favorite Character: ${summary.efficiency.favoriteCharacter || 'N/A'}`,
      `Most Kills in Wave: ${summary.efficiency.mostKillsInWave}`,
      '',
      `Generated: ${new Date().toISOString()}`
    ];
    
    return lines.join('\n');
  }

  /**
   * Reset all stats
   * @returns {boolean} Whether reset was successful
   */
  resetStats() {
    try {
      this.stats = this.getDefaultStats();
      this.sessionStats = this.getDefaultSessionStats();
      this.saveStats();
      return true;
    } catch (e) {
      console.error('Failed to reset stats:', e);
      return false;
    }
  }

  /**
   * Auto-save stats if interval has passed
   */
  autoSave() {
    const now = performance.now();
    if (now - this.lastSaveTime >= this.saveInterval) {
      this.updatePlaytime();
      this.mergeSessionStats();
      this.saveStats();
      this.lastSaveTime = now;
      
      // Reset session for ongoing tracking
      this.sessionStats = this.getDefaultSessionStats();
    }
  }

  /**
   * Load stats from storage
   * @returns {Object} Loaded stats
   */
  loadStats() {
    try {
      const stored = localStorage.getItem('gameStatistics');
      if (stored) {
        const loaded = JSON.parse(stored);
        // Merge with defaults to handle new stat fields
        return this.mergeWithDefaults(loaded);
      }
    } catch (e) {
      console.warn('Could not load statistics:', e);
    }
    return this.getDefaultStats();
  }

  /**
   * Merge loaded stats with defaults
   * @param {Object} loaded - Loaded stats
   * @returns {Object} Merged stats
   */
  mergeWithDefaults(loaded) {
    const defaults = this.getDefaultStats();
    
    // Deep merge
    const merge = (target, source) => {
      Object.keys(target).forEach(key => {
        if (source[key] === undefined) {
          // Keep default
        } else if (typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
          merge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      });
      return target;
    };
    
    return merge(defaults, loaded);
  }

  /**
   * Save stats to storage
   */
  saveStats() {
    try {
      localStorage.setItem('gameStatistics', JSON.stringify(this.stats));
    } catch (e) {
      console.warn('Could not save statistics:', e);
    }
  }
}
