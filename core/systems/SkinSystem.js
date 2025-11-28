// Skin System - Character customization with unlockable skins
class SkinSystem {
  constructor() {
    this.skins = this.initializeSkins();
    this.unlockedSkins = this.loadUnlockedSkins();
    this.equippedSkins = this.loadEquippedSkins();
    this.playerNames = this.loadPlayerNames();
    this.unlockProgress = this.loadUnlockProgress();
    this.recentUnlocks = [];
  }

  /**
   * Initialize all available skins
   * @returns {Object} Skin definitions
   */
  initializeSkins() {
    return {
      DEFAULT: {
        id: 'default',
        name: 'Default',
        description: 'Original character colors',
        colors: {
          primary: '#4a5a4a',
          secondary: '#3a4a3a',
          accent: '#5a6a5a',
          skin: '#ddb892'
        },
        particleTrail: null,
        requirement: null, // Always unlocked
        unlocked: true
      },
      ELITE: {
        id: 'elite',
        name: 'Elite',
        description: 'Gold and yellow colors',
        colors: {
          primary: '#ffd700',
          secondary: '#b8860b',
          accent: '#daa520',
          skin: '#ddb892'
        },
        particleTrail: { color: '#ffd700', size: 3, rate: 0.3 },
        requirement: { type: 'campaign', description: 'Beat the campaign', check: 'beatCampaign' },
        unlocked: false
      },
      SHADOW: {
        id: 'shadow',
        name: 'Shadow',
        description: 'Black and purple colors',
        colors: {
          primary: '#1a1a2e',
          secondary: '#16213e',
          accent: '#6b21a8',
          skin: '#a78bfa'
        },
        particleTrail: { color: '#6b21a8', size: 4, rate: 0.4 },
        requirement: { type: 'stealth', target: 50, description: 'Get 50 stealth kills', check: 'stealthKills' },
        unlocked: false
      },
      CRIMSON: {
        id: 'crimson',
        name: 'Crimson',
        description: 'Red and black colors',
        colors: {
          primary: '#8b0000',
          secondary: '#4a0000',
          accent: '#ff0000',
          skin: '#ddb892'
        },
        particleTrail: { color: '#ff0000', size: 3, rate: 0.35 },
        requirement: { type: 'kills', target: 1000, description: 'Get 1000 total kills', check: 'totalKills' },
        unlocked: false
      },
      ARCTIC: {
        id: 'arctic',
        name: 'Arctic',
        description: 'White and blue colors',
        colors: {
          primary: '#e0f2f1',
          secondary: '#b2dfdb',
          accent: '#00bcd4',
          skin: '#eceff1'
        },
        particleTrail: { color: '#00bcd4', size: 2, rate: 0.5 },
        requirement: { type: 'horde', target: 20, description: 'Survive 20 waves in Horde Mode', check: 'hordeWave' },
        unlocked: false
      },
      DESERT: {
        id: 'desert',
        name: 'Desert',
        description: 'Tan and brown colors',
        colors: {
          primary: '#d2b48c',
          secondary: '#a0522d',
          accent: '#8b4513',
          skin: '#ddb892'
        },
        particleTrail: { color: '#d2b48c', size: 2, rate: 0.25 },
        requirement: { type: 'timeAttack', description: 'Beat Time Attack mode', check: 'timeAttack' },
        unlocked: false
      },
      FOREST: {
        id: 'forest',
        name: 'Forest',
        description: 'Green camo colors',
        colors: {
          primary: '#228b22',
          secondary: '#006400',
          accent: '#32cd32',
          skin: '#ddb892'
        },
        particleTrail: { color: '#228b22', size: 2, rate: 0.3 },
        requirement: { type: 'bossRush', description: 'Beat Boss Rush mode', check: 'bossRush' },
        unlocked: false
      },
      NEON: {
        id: 'neon',
        name: 'Neon',
        description: 'Bright glowing colors',
        colors: {
          primary: '#ff00ff',
          secondary: '#00ffff',
          accent: '#ffff00',
          skin: '#ff69b4'
        },
        particleTrail: { color: '#ff00ff', size: 4, rate: 0.6, glow: true },
        requirement: { type: 'coins', target: 10000, description: 'Collect 10,000 total coins', check: 'totalCoins' },
        unlocked: false
      }
    };
  }

  /**
   * Check unlock requirements and unlock skins
   * @param {Object} stats - Current player statistics
   * @returns {Array} Array of newly unlocked skins
   */
  checkUnlocks(stats) {
    const newUnlocks = [];
    
    Object.entries(this.skins).forEach(([key, skin]) => {
      if (skin.unlocked || this.unlockedSkins.includes(skin.id)) {
        return;
      }
      
      let unlocked = false;
      const req = skin.requirement;
      
      if (!req) {
        unlocked = true;
      } else {
        switch (req.check) {
          case 'beatCampaign':
            unlocked = stats.campaignCompleted || false;
            break;
          case 'stealthKills':
            unlocked = (stats.stealthKills || 0) >= req.target;
            // Update progress
            this.updateProgress(skin.id, stats.stealthKills || 0, req.target);
            break;
          case 'totalKills':
            unlocked = (stats.totalKills || 0) >= req.target;
            this.updateProgress(skin.id, stats.totalKills || 0, req.target);
            break;
          case 'hordeWave':
            unlocked = (stats.highestHordeWave || 0) >= req.target;
            this.updateProgress(skin.id, stats.highestHordeWave || 0, req.target);
            break;
          case 'timeAttack':
            unlocked = stats.timeAttackCompleted || false;
            break;
          case 'bossRush':
            unlocked = stats.bossRushCompleted || false;
            break;
          case 'totalCoins':
            unlocked = (stats.totalCoinsEarned || 0) >= req.target;
            this.updateProgress(skin.id, stats.totalCoinsEarned || 0, req.target);
            break;
        }
      }
      
      if (unlocked) {
        this.unlockSkin(skin.id);
        newUnlocks.push(skin);
        this.recentUnlocks.push(skin);
      }
    });
    
    return newUnlocks;
  }

  /**
   * Update unlock progress for a skin
   * @param {string} skinId - Skin ID
   * @param {number} current - Current value
   * @param {number} target - Target value
   */
  updateProgress(skinId, current, target) {
    this.unlockProgress[skinId] = {
      current: Math.min(current, target),
      target: target,
      percent: Math.min(100, Math.floor((current / target) * 100))
    };
    this.saveUnlockProgress();
  }

  /**
   * Unlock a skin
   * @param {string} skinId - Skin ID to unlock
   */
  unlockSkin(skinId) {
    if (!this.unlockedSkins.includes(skinId)) {
      this.unlockedSkins.push(skinId);
      this.saveUnlockedSkins();
    }
  }

  /**
   * Check if a skin is unlocked
   * @param {string} skinId - Skin ID
   * @returns {boolean} Whether skin is unlocked
   */
  isSkinUnlocked(skinId) {
    if (skinId === 'default') return true;
    return this.unlockedSkins.includes(skinId);
  }

  /**
   * Equip a skin for a character
   * @param {string} character - Character type
   * @param {string} skinId - Skin ID to equip
   * @returns {boolean} Whether equip was successful
   */
  equipSkin(character, skinId) {
    if (!this.isSkinUnlocked(skinId)) {
      return false;
    }
    
    this.equippedSkins[character] = skinId;
    this.saveEquippedSkins();
    return true;
  }

  /**
   * Get equipped skin for a character
   * @param {string} character - Character type
   * @returns {Object} Skin data
   */
  getEquippedSkin(character) {
    const skinId = this.equippedSkins[character] || 'default';
    return this.getSkinById(skinId);
  }

  /**
   * Get skin by ID
   * @param {string} skinId - Skin ID
   * @returns {Object} Skin data
   */
  getSkinById(skinId) {
    for (const skin of Object.values(this.skins)) {
      if (skin.id === skinId) {
        return skin;
      }
    }
    return this.skins.DEFAULT;
  }

  /**
   * Get all skins with unlock status
   * @returns {Array} Array of skin data with unlock info
   */
  getAllSkins() {
    return Object.values(this.skins).map(skin => ({
      ...skin,
      unlocked: this.isSkinUnlocked(skin.id),
      progress: this.unlockProgress[skin.id] || null
    }));
  }

  /**
   * Set player name for a character
   * @param {string} character - Character type
   * @param {string} name - Player name (max 16 chars)
   * @returns {boolean} Whether name was set successfully
   */
  setPlayerName(character, name) {
    // Validate name
    if (!name || name.length > 16) {
      return false;
    }
    
    // Basic profanity filter
    const filtered = this.filterProfanity(name);
    
    this.playerNames[character] = filtered;
    this.savePlayerNames();
    return true;
  }

  /**
   * Get player name for a character
   * @param {string} character - Character type
   * @returns {string} Player name or default
   */
  getPlayerName(character) {
    return this.playerNames[character] || character.toUpperCase();
  }

  /**
   * Basic profanity filter
   * Note: This is a minimal filter for the game. For production use,
   * consider using a more comprehensive filtering library.
   * @param {string} text - Text to filter
   * @returns {string} Filtered text
   */
  filterProfanity(text) {
    // Basic filter - replace common inappropriate words
    // This is intentionally minimal for a game context
    const badWords = ['damn', 'hell', 'crap'];
    let filtered = text;
    
    badWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      filtered = filtered.replace(regex, '*'.repeat(word.length));
    });
    
    return filtered;
  }

  /**
   * Get name color based on equipped skin
   * @param {string} character - Character type
   * @returns {string} Color hex code
   */
  getNameColor(character) {
    const skin = this.getEquippedSkin(character);
    return skin.colors.accent || '#ffffff';
  }

  /**
   * Apply skin colors to player entity
   * @param {Object} player - Player entity
   * @param {string} character - Character type
   */
  applySkinToPlayer(player, character) {
    const skin = this.getEquippedSkin(character);
    
    player.skinColors = skin.colors;
    player.particleTrail = skin.particleTrail;
    player.displayName = this.getPlayerName(character);
    player.nameColor = this.getNameColor(character);
  }

  /**
   * Render particle trail for player
   * @param {Object} particleSystem - Particle system reference
   * @param {Object} player - Player entity
   * @param {number} deltaTime - Time since last frame
   */
  renderParticleTrail(particleSystem, player, deltaTime) {
    if (!player.particleTrail) return;
    
    const trail = player.particleTrail;
    
    // Check spawn rate
    if (Math.random() > trail.rate) return;
    
    // Create particle
    const x = player.x + player.width / 2 + (Math.random() - 0.5) * 10;
    const y = player.y + player.height - 5;
    
    particleSystem.particles.push({
      x: x,
      y: y,
      dx: (Math.random() - 0.5) * 2,
      dy: Math.random() * 2 + 1,
      life: 30,
      maxLife: 30,
      size: trail.size,
      color: trail.color,
      glow: trail.glow || false
    });
  }

  /**
   * Clear recent unlocks (after showing notifications)
   */
  clearRecentUnlocks() {
    this.recentUnlocks = [];
  }

  /**
   * Load unlocked skins from storage
   * @returns {Array} Array of unlocked skin IDs
   */
  loadUnlockedSkins() {
    try {
      const stored = localStorage.getItem('unlockedSkins');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load unlocked skins:', e);
    }
    return ['default'];
  }

  /**
   * Save unlocked skins
   */
  saveUnlockedSkins() {
    try {
      localStorage.setItem('unlockedSkins', JSON.stringify(this.unlockedSkins));
    } catch (e) {
      console.warn('Could not save unlocked skins:', e);
    }
  }

  /**
   * Load equipped skins from storage
   * @returns {Object} Equipped skins by character
   */
  loadEquippedSkins() {
    try {
      const stored = localStorage.getItem('equippedSkins');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load equipped skins:', e);
    }
    return {
      soldier: 'default',
      scout: 'default',
      heavy: 'default',
      medic: 'default'
    };
  }

  /**
   * Save equipped skins
   */
  saveEquippedSkins() {
    try {
      localStorage.setItem('equippedSkins', JSON.stringify(this.equippedSkins));
    } catch (e) {
      console.warn('Could not save equipped skins:', e);
    }
  }

  /**
   * Load player names from storage
   * @returns {Object} Player names by character
   */
  loadPlayerNames() {
    try {
      const stored = localStorage.getItem('playerNames');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load player names:', e);
    }
    return {};
  }

  /**
   * Save player names
   */
  savePlayerNames() {
    try {
      localStorage.setItem('playerNames', JSON.stringify(this.playerNames));
    } catch (e) {
      console.warn('Could not save player names:', e);
    }
  }

  /**
   * Load unlock progress from storage
   * @returns {Object} Progress data by skin ID
   */
  loadUnlockProgress() {
    try {
      const stored = localStorage.getItem('skinUnlockProgress');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load skin unlock progress:', e);
    }
    return {};
  }

  /**
   * Save unlock progress
   */
  saveUnlockProgress() {
    try {
      localStorage.setItem('skinUnlockProgress', JSON.stringify(this.unlockProgress));
    } catch (e) {
      console.warn('Could not save skin unlock progress:', e);
    }
  }

  /**
   * Render skin unlock notification
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} canvasWidth - Canvas width
   */
  renderUnlockNotification(ctx, canvasWidth) {
    if (this.recentUnlocks.length === 0) return;
    
    const skin = this.recentUnlocks[0];
    
    ctx.save();
    
    // Notification box
    const boxWidth = 300;
    const boxHeight = 80;
    const boxX = canvasWidth - boxWidth - 20;
    const boxY = 150;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    ctx.strokeStyle = skin.colors.accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    
    // Title
    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SKIN UNLOCKED!', boxX + boxWidth / 2, boxY + 25);
    
    // Skin name
    ctx.fillStyle = skin.colors.accent;
    ctx.font = 'bold 20px monospace';
    ctx.fillText(skin.name, boxX + boxWidth / 2, boxY + 55);
    
    ctx.restore();
  }
}
