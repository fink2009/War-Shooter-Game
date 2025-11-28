// Daily Challenge System - Procedurally generated daily missions
// Provides seed-based daily challenges with rewards
class DailyChallengeSystem {
  constructor() {
    // Configuration from GameConfig
    this.config = typeof GameConfig !== 'undefined' && GameConfig.DAILY_CHALLENGES ? 
      GameConfig.DAILY_CHALLENGES : {
        resetHour: 0,
        rewards: { bronze: 500, silver: 1000, gold: 2000 },
        types: ['kill', 'survival', 'speedrun', 'skill'],
        historyDays: 7
      };
    
    // Current challenge
    this.currentChallenge = null;
    this.challengeProgress = 0;
    this.challengeComplete = false;
    this.tier = null; // bronze, silver, gold
    
    // Challenge history
    this.challengeHistory = [];
    
    // Seed for procedural generation
    this.todaySeed = 0;
    
    // Challenge templates
    this.challengeTemplates = {
      kill: [
        { name: 'Weapon Master', description: 'Eliminate {count} enemies with {weapon}', params: ['count', 'weapon'] },
        { name: 'Stealth Assassin', description: 'Get {count} stealth kills', params: ['count'] },
        { name: 'Elite Hunter', description: 'Defeat {count} elite enemies', params: ['count'] },
        { name: 'Headhunter', description: 'Get {count} headshots', params: ['count'] },
        { name: 'Melee Master', description: 'Eliminate {count} enemies with melee weapons', params: ['count'] }
      ],
      survival: [
        { name: 'Untouchable', description: 'Survive to wave {wave} without taking damage', params: ['wave'] },
        { name: 'No Medkits', description: 'Complete {level} without using health packs', params: ['level'] },
        { name: 'Fists Only', description: 'Survive {waves} waves using only melee', params: ['waves'] },
        { name: 'Last Stand', description: 'Survive for {minutes} minutes with less than 20% health', params: ['minutes'] },
        { name: 'Dodge Master', description: 'Dodge {count} attacks using roll', params: ['count'] }
      ],
      speedrun: [
        { name: 'Speed Demon', description: 'Complete {level} in under {time}', params: ['level', 'time'] },
        { name: 'Boss Blitz', description: 'Defeat {boss} in under {time}', params: ['boss', 'time'] },
        { name: 'Wave Crusher', description: 'Complete wave {wave} in under {time}', params: ['wave', 'time'] },
        { name: 'Quick Clear', description: 'Eliminate {count} enemies in {time}', params: ['count', 'time'] }
      ],
      skill: [
        { name: 'Combo King', description: 'Achieve a {count}x combo', params: ['count'] },
        { name: 'Perfect Aim', description: 'Get {accuracy}% accuracy for one wave', params: ['accuracy'] },
        { name: 'Coin Collector', description: 'Collect {count} coins in one run', params: ['count'] },
        { name: 'Parry Master', description: 'Successfully parry {count} attacks', params: ['count'] },
        { name: 'No Miss', description: 'Complete a level without missing a shot', params: [] }
      ]
    };
    
    // Weapon options for challenges
    this.weaponOptions = ['pistol', 'rifle', 'shotgun', 'sniper', 'machinegun', 'knife', 'sword'];
    
    // Level options
    this.levelOptions = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'];
    
    // Boss options
    this.bossOptions = ['The Warlord', 'The Devastator', 'The Annihilator', 'The Overlord'];
    
    this.loadState();
    this.checkForNewDay();
  }
  
  /**
   * Initialize daily challenge system
   * @param {Object} game - Game engine reference
   */
  init(game) {
    this.game = game;
    this.checkForNewDay();
  }
  
  /**
   * Generate seed for today's date
   * @returns {number}
   */
  generateTodaySeed() {
    const now = new Date();
    const utcHours = now.getUTCHours();
    
    // Adjust date if before reset hour
    if (utcHours < this.config.resetHour) {
      now.setUTCDate(now.getUTCDate() - 1);
    }
    
    // Create seed from date components
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;
    const day = now.getUTCDate();
    
    // Simple hash function for seed
    return year * 10000 + month * 100 + day;
  }
  
  /**
   * Seeded random number generator
   * @param {number} seed - Seed value
   * @returns {Function} Random function
   */
  seededRandom(seed) {
    const m = 0x80000000;
    const a = 1103515245;
    const c = 12345;
    let state = seed;
    
    return () => {
      state = (a * state + c) % m;
      return state / m;
    };
  }
  
  /**
   * Check if it's a new day and generate new challenge
   */
  checkForNewDay() {
    const newSeed = this.generateTodaySeed();
    
    if (newSeed !== this.todaySeed) {
      this.todaySeed = newSeed;
      this.generateDailyChallenge();
      this.resetProgress();
    }
  }
  
  /**
   * Generate today's challenge based on seed
   */
  generateDailyChallenge() {
    const random = this.seededRandom(this.todaySeed);
    
    // Select challenge type
    const typeIndex = Math.floor(random() * this.config.types.length);
    const type = this.config.types[typeIndex];
    
    // Select template from type
    const templates = this.challengeTemplates[type];
    const templateIndex = Math.floor(random() * templates.length);
    const template = templates[templateIndex];
    
    // Generate parameters
    const params = this.generateParams(template, random, type);
    
    // Build challenge description
    let description = template.description;
    for (const [key, value] of Object.entries(params)) {
      description = description.replace(`{${key}}`, value);
    }
    
    // Generate tier thresholds
    const tiers = this.generateTiers(type, params, random);
    
    this.currentChallenge = {
      id: this.todaySeed,
      name: template.name,
      description: description,
      type: type,
      template: template,
      params: params,
      tiers: tiers,
      date: new Date().toISOString().split('T')[0]
    };
    
    console.log('Daily Challenge generated:', this.currentChallenge);
  }
  
  /**
   * Generate parameters for challenge
   * @param {Object} template - Challenge template
   * @param {Function} random - Seeded random function
   * @param {string} type - Challenge type
   * @returns {Object} Parameters
   */
  generateParams(template, random, type) {
    const params = {};
    
    for (const param of template.params) {
      switch (param) {
        case 'count':
          if (type === 'kill') {
            params.count = 20 + Math.floor(random() * 30); // 20-50
          } else if (type === 'skill') {
            params.count = 30 + Math.floor(random() * 70); // 30-100
          } else {
            params.count = 10 + Math.floor(random() * 20); // 10-30
          }
          break;
          
        case 'weapon':
          params.weapon = this.weaponOptions[Math.floor(random() * this.weaponOptions.length)];
          break;
          
        case 'wave':
          params.wave = 5 + Math.floor(random() * 10); // 5-15
          break;
          
        case 'waves':
          params.waves = 3 + Math.floor(random() * 5); // 3-8
          break;
          
        case 'level':
          params.level = this.levelOptions[Math.floor(random() * this.levelOptions.length)];
          break;
          
        case 'boss':
          params.boss = this.bossOptions[Math.floor(random() * this.bossOptions.length)];
          break;
          
        case 'time':
          params.time = (60 + Math.floor(random() * 120)) + ' seconds'; // 60-180 seconds
          break;
          
        case 'minutes':
          params.minutes = 2 + Math.floor(random() * 3); // 2-5 minutes
          break;
          
        case 'accuracy':
          params.accuracy = 70 + Math.floor(random() * 30); // 70-100%
          break;
      }
    }
    
    return params;
  }
  
  /**
   * Generate tier thresholds
   * @param {string} type - Challenge type
   * @param {Object} params - Challenge parameters
   * @param {Function} random - Seeded random function
   * @returns {Object} Tier thresholds
   */
  generateTiers(type, params, random) {
    const baseValue = params.count || params.wave || params.waves || 10;
    
    return {
      bronze: Math.floor(baseValue * 0.6),
      silver: Math.floor(baseValue * 0.8),
      gold: baseValue
    };
  }
  
  /**
   * Update challenge progress
   * @param {string} eventType - Type of event (kill, survive, etc.)
   * @param {Object} eventData - Event data
   */
  updateProgress(eventType, eventData = {}) {
    if (!this.currentChallenge || this.challengeComplete) return;
    
    let progressMade = false;
    
    switch (this.currentChallenge.type) {
      case 'kill':
        if (eventType === 'enemy_killed') {
          // Check weapon match if required
          if (this.currentChallenge.params.weapon) {
            if (eventData.weapon && eventData.weapon.toLowerCase().includes(this.currentChallenge.params.weapon)) {
              this.challengeProgress++;
              progressMade = true;
            }
          } else if (this.currentChallenge.template.name === 'Stealth Assassin') {
            if (eventData.stealth) {
              this.challengeProgress++;
              progressMade = true;
            }
          } else if (this.currentChallenge.template.name === 'Elite Hunter') {
            if (eventData.isElite) {
              this.challengeProgress++;
              progressMade = true;
            }
          } else if (this.currentChallenge.template.name === 'Melee Master') {
            if (eventData.isMelee) {
              this.challengeProgress++;
              progressMade = true;
            }
          } else {
            this.challengeProgress++;
            progressMade = true;
          }
        }
        break;
        
      case 'survival':
        if (eventType === 'wave_complete') {
          if (this.currentChallenge.template.name === 'Untouchable') {
            if (eventData.damageTaken === 0) {
              this.challengeProgress = eventData.wave;
              progressMade = true;
            }
          } else if (this.currentChallenge.template.name === 'Fists Only') {
            if (eventData.meleeOnly) {
              this.challengeProgress++;
              progressMade = true;
            }
          }
        } else if (eventType === 'dodge') {
          if (this.currentChallenge.template.name === 'Dodge Master') {
            this.challengeProgress++;
            progressMade = true;
          }
        }
        break;
        
      case 'speedrun':
        if (eventType === 'level_complete' || eventType === 'boss_defeated') {
          // Check time against requirement
          const timeStr = this.currentChallenge.params.time;
          const requiredSeconds = parseInt(timeStr);
          if (eventData.timeSeconds && eventData.timeSeconds < requiredSeconds) {
            this.challengeProgress = 1;
            progressMade = true;
          }
        }
        break;
        
      case 'skill':
        if (eventType === 'combo') {
          if (this.currentChallenge.template.name === 'Combo King') {
            if (eventData.combo > this.challengeProgress) {
              this.challengeProgress = eventData.combo;
              progressMade = true;
            }
          }
        } else if (eventType === 'wave_complete') {
          if (this.currentChallenge.template.name === 'Perfect Aim') {
            if (eventData.accuracy >= this.currentChallenge.params.accuracy) {
              this.challengeProgress = 1;
              progressMade = true;
            }
          }
        } else if (eventType === 'coin_collected') {
          if (this.currentChallenge.template.name === 'Coin Collector') {
            this.challengeProgress += eventData.amount || 1;
            progressMade = true;
          }
        } else if (eventType === 'parry') {
          if (this.currentChallenge.template.name === 'Parry Master') {
            this.challengeProgress++;
            progressMade = true;
          }
        }
        break;
    }
    
    if (progressMade) {
      this.checkCompletion();
      this.saveState();
    }
  }
  
  /**
   * Check if challenge is complete and determine tier
   */
  checkCompletion() {
    if (!this.currentChallenge) return;
    
    const tiers = this.currentChallenge.tiers;
    
    if (this.challengeProgress >= tiers.gold) {
      this.tier = 'gold';
      this.challengeComplete = true;
    } else if (this.challengeProgress >= tiers.silver) {
      this.tier = 'silver';
    } else if (this.challengeProgress >= tiers.bronze) {
      this.tier = 'bronze';
    }
    
    if (this.challengeComplete && !this.rewardClaimed) {
      this.onChallengeComplete();
    }
  }
  
  /**
   * Called when challenge is complete
   */
  onChallengeComplete() {
    console.log(`Daily Challenge Complete! Tier: ${this.tier}`);
    
    // Add to history
    this.addToHistory();
  }
  
  /**
   * Claim reward for completed challenge
   * @returns {number} Reward amount in coins
   */
  claimReward() {
    if (!this.challengeComplete || this.rewardClaimed) return 0;
    
    const reward = this.config.rewards[this.tier];
    this.rewardClaimed = true;
    this.saveState();
    
    console.log(`Claimed ${reward} coins for ${this.tier} tier!`);
    return reward;
  }
  
  /**
   * Add completed challenge to history
   */
  addToHistory() {
    this.challengeHistory.push({
      ...this.currentChallenge,
      completedAt: new Date().toISOString(),
      tier: this.tier,
      progress: this.challengeProgress
    });
    
    // Keep only last N days
    while (this.challengeHistory.length > this.config.historyDays) {
      this.challengeHistory.shift();
    }
  }
  
  /**
   * Get current challenge
   * @returns {Object|null}
   */
  getCurrentChallenge() {
    this.checkForNewDay();
    return this.currentChallenge;
  }
  
  /**
   * Get challenge progress
   * @returns {Object}
   */
  getProgress() {
    if (!this.currentChallenge) return { current: 0, target: 0, percent: 0 };
    
    const target = this.currentChallenge.tiers.gold;
    return {
      current: this.challengeProgress,
      target: target,
      percent: Math.min(100, (this.challengeProgress / target) * 100),
      tier: this.tier,
      complete: this.challengeComplete,
      rewardClaimed: this.rewardClaimed
    };
  }
  
  /**
   * Get challenge history
   * @returns {Array}
   */
  getHistory() {
    return this.challengeHistory;
  }
  
  /**
   * Get time until next challenge
   * @returns {Object} { hours, minutes, seconds }
   */
  getTimeUntilReset() {
    const now = new Date();
    const resetHour = this.config.resetHour;
    
    // Calculate next reset time
    const nextReset = new Date(now);
    nextReset.setUTCHours(resetHour, 0, 0, 0);
    
    if (now >= nextReset) {
      nextReset.setUTCDate(nextReset.getUTCDate() + 1);
    }
    
    const diff = nextReset - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  }
  
  /**
   * Reset progress for new day
   */
  resetProgress() {
    this.challengeProgress = 0;
    this.challengeComplete = false;
    this.tier = null;
    this.rewardClaimed = false;
  }
  
  /**
   * Save state to localStorage
   */
  saveState() {
    try {
      const state = {
        todaySeed: this.todaySeed,
        currentChallenge: this.currentChallenge,
        challengeProgress: this.challengeProgress,
        challengeComplete: this.challengeComplete,
        tier: this.tier,
        rewardClaimed: this.rewardClaimed,
        challengeHistory: this.challengeHistory
      };
      localStorage.setItem('dailyChallengeState', JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save daily challenge state:', e);
    }
  }
  
  /**
   * Load state from localStorage
   */
  loadState() {
    try {
      const saved = localStorage.getItem('dailyChallengeState');
      if (saved) {
        const state = JSON.parse(saved);
        this.todaySeed = state.todaySeed || 0;
        this.currentChallenge = state.currentChallenge;
        this.challengeProgress = state.challengeProgress || 0;
        this.challengeComplete = state.challengeComplete || false;
        this.tier = state.tier;
        this.rewardClaimed = state.rewardClaimed || false;
        this.challengeHistory = state.challengeHistory || [];
      }
    } catch (e) {
      console.warn('Failed to load daily challenge state:', e);
    }
  }
  
  /**
   * Render daily challenge UI widget
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  render(ctx, x, y) {
    if (!this.currentChallenge) return;
    
    const width = 300;
    const height = 100;
    
    ctx.save();
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(x, y, width, height);
    
    // Border color based on tier
    const borderColors = {
      bronze: '#cd7f32',
      silver: '#c0c0c0',
      gold: '#ffd700',
      null: '#666666'
    };
    ctx.strokeStyle = borderColors[this.tier] || '#666666';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Title
    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('📅 DAILY CHALLENGE', x + 10, y + 20);
    
    // Challenge name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(this.currentChallenge.name, x + 10, y + 40);
    
    // Description
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '11px monospace';
    const desc = this.currentChallenge.description;
    if (desc.length > 40) {
      ctx.fillText(desc.substring(0, 40) + '...', x + 10, y + 55);
    } else {
      ctx.fillText(desc, x + 10, y + 55);
    }
    
    // Progress bar
    const progress = this.getProgress();
    const barX = x + 10;
    const barY = y + 70;
    const barWidth = width - 20;
    const barHeight = 12;
    
    // Background
    ctx.fillStyle = '#333333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Progress fill
    const fillWidth = (progress.percent / 100) * barWidth;
    ctx.fillStyle = this.challengeComplete ? '#00ff00' : '#4488ff';
    ctx.fillRect(barX, barY, fillWidth, barHeight);
    
    // Tier markers
    const tiers = this.currentChallenge.tiers;
    const target = tiers.gold;
    
    ctx.fillStyle = '#cd7f32';
    ctx.fillRect(barX + (tiers.bronze / target) * barWidth - 1, barY, 2, barHeight);
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(barX + (tiers.silver / target) * barWidth - 1, barY, 2, barHeight);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(barX + barWidth - 2, barY, 2, barHeight);
    
    // Progress text
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${progress.current} / ${progress.target}`, barX + barWidth / 2, barY + 10);
    
    // Reward claimed indicator
    if (this.challengeComplete) {
      ctx.textAlign = 'right';
      if (this.rewardClaimed) {
        ctx.fillStyle = '#888888';
        ctx.fillText('✓ Claimed', x + width - 10, y + 20);
      } else {
        ctx.fillStyle = '#00ff00';
        ctx.fillText('🎁 Claim!', x + width - 10, y + 20);
      }
    }
    
    // Time until reset
    const timeLeft = this.getTimeUntilReset();
    ctx.textAlign = 'right';
    ctx.fillStyle = '#888888';
    ctx.font = '10px monospace';
    ctx.fillText(
      `Resets in ${timeLeft.hours}h ${timeLeft.minutes}m`,
      x + width - 10,
      y + height - 5
    );
    
    ctx.restore();
  }
}
