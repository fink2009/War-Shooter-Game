// Save/Load System using localStorage
class SaveSystem {
  constructor() {
    this.saveKey = 'warShooterSaveData';
    this.maxSlots = 3;
    this.autoSaveEnabled = true;
    this.version = '1.0.0';
  }

  /**
   * Get the current save data structure
   * @returns {Object} Default save data structure
   */
  getDefaultSaveData() {
    return {
      version: this.version,
      lastModified: new Date().toISOString(),
      slots: {
        0: null,
        1: null,
        2: null
      },
      settings: this.getDefaultSettings(),
      globalStats: this.getDefaultGlobalStats()
    };
  }

  /**
   * Get default game settings
   * @returns {Object} Default settings object
   */
  getDefaultSettings() {
    return {
      // Audio settings
      masterVolume: 1.0,
      musicVolume: 0.7,
      sfxVolume: 0.8,
      audioEnabled: true,

      // Display settings
      fullscreen: false,
      screenShake: true,
      particleQuality: 'high',
      showFPS: false,
      hudOpacity: 0.9,
      crosshairStyle: 'none',

      // Gameplay settings
      difficulty: 'medium',
      autoReload: true,
      mouseAiming: false,
      cameraSmoothness: 0.1,

      // Accessibility settings
      colorBlindMode: 'none',
      bloodEffects: true,
      screenFlash: true,

      // Additional tweaks
      enemyAggression: 1.0,
      bulletSpeed: 1.0,
      explosionSize: 1.0
    };
  }

  /**
   * Get default global stats
   * @returns {Object} Default global stats object
   */
  getDefaultGlobalStats() {
    return {
      totalPlayTime: 0,
      totalKills: 0,
      totalDeaths: 0,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      highestScore: 0,
      highestWave: 0,
      highestLevel: 0,
      bossesDefeated: 0,
      weaponsCollected: 0,
      gamesPlayed: 0,
      campaignCompletions: 0
    };
  }

  /**
   * Get default save slot data
   * @returns {Object} Default slot data structure
   */
  getDefaultSlotData() {
    return {
      name: 'New Game',
      createdAt: new Date().toISOString(),
      lastPlayed: new Date().toISOString(),
      playTime: 0,

      // Campaign progress
      campaign: {
        currentLevel: 1,
        completedLevels: [],
        highestLevel: 1,
        difficulty: 'medium',
        selectedCharacter: 'soldier'
      },

      // Survival progress
      survival: {
        highestWave: 0,
        highScore: 0
      },

      // Unlocks
      unlocks: {
        weapons: ['pistol'],
        characters: ['soldier'],
        achievements: []
      },

      // Statistics
      stats: {
        kills: 0,
        deaths: 0,
        damageDealt: 0,
        damageTaken: 0,
        shotsFired: 0,
        shotsHit: 0,
        maxCombo: 0,
        bossesKilled: 0
      },

      // Tutorial completion
      tutorial: {
        completed: false,
        stepsCompleted: []
      }
    };
  }

  /**
   * Load all save data from localStorage
   * @returns {Object} The loaded save data or default data
   */
  loadAllData() {
    try {
      const stored = localStorage.getItem(this.saveKey);
      if (stored) {
        const data = JSON.parse(stored);
        // Validate and migrate data if needed
        return this.validateAndMigrate(data);
      }
    } catch (e) {
      console.error('SaveSystem: Error loading save data:', e);
    }
    return this.getDefaultSaveData();
  }

  /**
   * Save all data to localStorage
   * @param {Object} data - The save data to store
   * @returns {boolean} Whether the save was successful
   */
  saveAllData(data) {
    try {
      data.lastModified = new Date().toISOString();
      const serialized = JSON.stringify(data);
      localStorage.setItem(this.saveKey, serialized);
      return true;
    } catch (e) {
      console.error('SaveSystem: Error saving data:', e);
      return false;
    }
  }

  /**
   * Validate and migrate save data to current version
   * @param {Object} data - The loaded save data
   * @returns {Object} Validated and migrated save data
   */
  validateAndMigrate(data) {
    // Ensure all required fields exist
    const defaults = this.getDefaultSaveData();

    // Merge settings with defaults to handle new settings
    if (data.settings) {
      data.settings = { ...defaults.settings, ...data.settings };
    } else {
      data.settings = defaults.settings;
    }

    // Merge global stats with defaults
    if (data.globalStats) {
      data.globalStats = { ...defaults.globalStats, ...data.globalStats };
    } else {
      data.globalStats = defaults.globalStats;
    }

    // Ensure slots exist
    if (!data.slots) {
      data.slots = defaults.slots;
    }

    return data;
  }

  /**
   * Save game progress to a specific slot
   * @param {number} slotIndex - The slot index (0-2)
   * @param {Object} gameData - The game data to save
   * @returns {boolean} Whether the save was successful
   */
  saveToSlot(slotIndex, gameData) {
    if (slotIndex < 0 || slotIndex >= this.maxSlots) {
      console.error('SaveSystem: Invalid slot index:', slotIndex);
      return false;
    }

    const allData = this.loadAllData();
    const slotData = allData.slots[slotIndex] || this.getDefaultSlotData();

    // Update slot data with new game data
    slotData.lastPlayed = new Date().toISOString();
    slotData.playTime = gameData.playTime || slotData.playTime;
    slotData.name = gameData.name || slotData.name;

    // Update campaign progress
    if (gameData.campaign) {
      slotData.campaign = { ...slotData.campaign, ...gameData.campaign };
      if (gameData.campaign.currentLevel > slotData.campaign.highestLevel) {
        slotData.campaign.highestLevel = gameData.campaign.currentLevel;
      }
    }

    // Update survival progress
    if (gameData.survival) {
      slotData.survival = { ...slotData.survival, ...gameData.survival };
      if (gameData.survival.currentWave > slotData.survival.highestWave) {
        slotData.survival.highestWave = gameData.survival.currentWave;
      }
      if (gameData.survival.score > slotData.survival.highScore) {
        slotData.survival.highScore = gameData.survival.score;
      }
    }

    // Update unlocks (merge arrays, avoiding duplicates)
    if (gameData.unlocks) {
      if (gameData.unlocks.weapons) {
        slotData.unlocks.weapons = [...new Set([...slotData.unlocks.weapons, ...gameData.unlocks.weapons])];
      }
      if (gameData.unlocks.characters) {
        slotData.unlocks.characters = [...new Set([...slotData.unlocks.characters, ...gameData.unlocks.characters])];
      }
      if (gameData.unlocks.achievements) {
        slotData.unlocks.achievements = [...new Set([...slotData.unlocks.achievements, ...gameData.unlocks.achievements])];
      }
    }

    // Update statistics
    if (gameData.stats) {
      Object.keys(gameData.stats).forEach(key => {
        if (typeof gameData.stats[key] === 'number') {
          slotData.stats[key] = (slotData.stats[key] || 0) + gameData.stats[key];
        }
      });
    }

    // Update tutorial progress
    if (gameData.tutorial) {
      slotData.tutorial = { ...slotData.tutorial, ...gameData.tutorial };
    }

    allData.slots[slotIndex] = slotData;

    // Update global stats
    this.updateGlobalStats(allData, gameData);

    return this.saveAllData(allData);
  }

  /**
   * Load game progress from a specific slot
   * @param {number} slotIndex - The slot index (0-2)
   * @returns {Object|null} The slot data or null if empty
   */
  loadFromSlot(slotIndex) {
    if (slotIndex < 0 || slotIndex >= this.maxSlots) {
      console.error('SaveSystem: Invalid slot index:', slotIndex);
      return null;
    }

    const allData = this.loadAllData();
    return allData.slots[slotIndex];
  }

  /**
   * Delete a save slot
   * @param {number} slotIndex - The slot index (0-2)
   * @returns {boolean} Whether the deletion was successful
   */
  deleteSlot(slotIndex) {
    if (slotIndex < 0 || slotIndex >= this.maxSlots) {
      console.error('SaveSystem: Invalid slot index:', slotIndex);
      return false;
    }

    const allData = this.loadAllData();
    allData.slots[slotIndex] = null;
    return this.saveAllData(allData);
  }

  /**
   * Get all save slots info for UI display
   * @returns {Array} Array of slot info objects
   */
  getSlotsInfo() {
    const allData = this.loadAllData();
    const slotsInfo = [];

    for (let i = 0; i < this.maxSlots; i++) {
      const slot = allData.slots[i];
      if (slot) {
        slotsInfo.push({
          index: i,
          isEmpty: false,
          name: slot.name,
          lastPlayed: slot.lastPlayed,
          playTime: slot.playTime,
          campaignLevel: slot.campaign.highestLevel,
          survivalWave: slot.survival.highestWave,
          character: slot.campaign.selectedCharacter
        });
      } else {
        slotsInfo.push({
          index: i,
          isEmpty: true,
          name: 'Empty Slot'
        });
      }
    }

    return slotsInfo;
  }

  /**
   * Update global statistics
   * @param {Object} allData - The full save data
   * @param {Object} gameData - The new game data
   */
  updateGlobalStats(allData, gameData) {
    const stats = allData.globalStats;

    if (gameData.playTime) {
      stats.totalPlayTime += gameData.playTime;
    }
    if (gameData.stats) {
      if (gameData.stats.kills) stats.totalKills += gameData.stats.kills;
      if (gameData.stats.deaths) stats.totalDeaths += gameData.stats.deaths;
      if (gameData.stats.damageDealt) stats.totalDamageDealt += gameData.stats.damageDealt;
      if (gameData.stats.damageTaken) stats.totalDamageTaken += gameData.stats.damageTaken;
      if (gameData.stats.bossesKilled) stats.bossesDefeated += gameData.stats.bossesKilled;
    }
    if (gameData.score && gameData.score > stats.highestScore) {
      stats.highestScore = gameData.score;
    }
    if (gameData.survival && gameData.survival.currentWave > stats.highestWave) {
      stats.highestWave = gameData.survival.currentWave;
    }
    if (gameData.campaign && gameData.campaign.currentLevel > stats.highestLevel) {
      stats.highestLevel = gameData.campaign.currentLevel;
    }

    stats.gamesPlayed++;
  }

  /**
   * Save game settings
   * @param {Object} settings - The settings to save
   * @returns {boolean} Whether the save was successful
   */
  saveSettings(settings) {
    const allData = this.loadAllData();
    allData.settings = { ...allData.settings, ...settings };
    return this.saveAllData(allData);
  }

  /**
   * Load game settings
   * @returns {Object} The saved settings or defaults
   */
  loadSettings() {
    const allData = this.loadAllData();
    return allData.settings;
  }

  /**
   * Export save data as JSON string
   * @returns {string} JSON string of all save data
   */
  exportData() {
    const allData = this.loadAllData();
    return JSON.stringify(allData, null, 2);
  }

  /**
   * Import save data from JSON string
   * @param {string} jsonString - The JSON string to import
   * @returns {boolean} Whether the import was successful
   */
  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      // Validate the imported data
      if (!data.version || !data.slots) {
        console.error('SaveSystem: Invalid import data format');
        return false;
      }
      // Migrate and validate
      const validData = this.validateAndMigrate(data);
      return this.saveAllData(validData);
    } catch (e) {
      console.error('SaveSystem: Error importing data:', e);
      return false;
    }
  }

  /**
   * Auto-save current game state
   * @param {Object} gameEngine - Reference to the game engine
   * @param {number} slotIndex - The slot to auto-save to
   * @returns {boolean} Whether the auto-save was successful
   */
  autoSave(gameEngine, slotIndex = 0) {
    if (!this.autoSaveEnabled || !gameEngine) {
      return false;
    }

    const gameData = this.extractGameData(gameEngine);
    const success = this.saveToSlot(slotIndex, gameData);

    if (success) {
      console.log('SaveSystem: Auto-save successful');
    }

    return success;
  }

  /**
   * Extract game data from the game engine for saving
   * @param {Object} gameEngine - Reference to the game engine
   * @returns {Object} Extracted game data
   */
  extractGameData(gameEngine) {
    return {
      name: `${gameEngine.mode} - ${gameEngine.selectedCharacter}`,
      playTime: (gameEngine.currentTime || 0) - (gameEngine.gameStartTime || 0),
      score: gameEngine.score || 0,

      campaign: gameEngine.mode === 'campaign' ? {
        currentLevel: gameEngine.currentLevel || 1,
        completedLevels: Array.from({ length: (gameEngine.currentLevel || 1) - 1 }, (_, i) => i + 1),
        difficulty: gameEngine.difficulty || 'medium',
        selectedCharacter: gameEngine.selectedCharacter || 'soldier'
      } : null,

      survival: gameEngine.mode === 'survival' ? {
        currentWave: gameEngine.wave || 1,
        score: gameEngine.score || 0
      } : null,

      unlocks: {
        weapons: gameEngine.player && gameEngine.player.rangedWeapons ? 
          gameEngine.player.rangedWeapons.map(w => w.name.toLowerCase().replace(' ', '_')) : ['pistol'],
        characters: [gameEngine.selectedCharacter || 'soldier']
      },

      stats: {
        kills: gameEngine.kills || 0,
        deaths: gameEngine.player && !gameEngine.player.active ? 1 : 0,
        damageDealt: gameEngine.totalDamageDealt || 0,
        damageTaken: gameEngine.totalDamageTaken || 0,
        shotsFired: gameEngine.shotsFired || 0,
        shotsHit: gameEngine.shotsHit || 0,
        maxCombo: gameEngine.maxCombo || 0,
        bossesKilled: gameEngine.bossesKilled || 0
      }
    };
  }

  /**
   * Apply loaded game data to the game engine
   * @param {Object} gameEngine - Reference to the game engine
   * @param {Object} slotData - The slot data to apply
   */
  applyToGame(gameEngine, slotData) {
    if (!gameEngine || !slotData) {
      return;
    }

    // Apply settings
    const settings = this.loadSettings();
    this.applySettings(gameEngine, settings);

    // Apply campaign progress if applicable
    if (slotData.campaign) {
      gameEngine.currentLevel = slotData.campaign.highestLevel;
      gameEngine.difficulty = slotData.campaign.difficulty;
      gameEngine.selectedCharacter = slotData.campaign.selectedCharacter;
    }
  }

  /**
   * Apply settings to the game engine
   * @param {Object} gameEngine - Reference to the game engine
   * @param {Object} settings - The settings to apply
   */
  applySettings(gameEngine, settings) {
    if (!gameEngine || !settings) {
      return;
    }

    // Audio settings
    gameEngine.masterVolume = settings.masterVolume;
    gameEngine.musicVolume = settings.musicVolume;
    gameEngine.sfxVolume = settings.sfxVolume;
    gameEngine.audioEnabled = settings.audioEnabled;

    if (gameEngine.audioManager) {
      gameEngine.audioManager.setMasterVolume(settings.masterVolume);
      gameEngine.audioManager.setMusicVolume(settings.musicVolume);
      gameEngine.audioManager.setSFXVolume(settings.sfxVolume);
      gameEngine.audioManager.setEnabled(settings.audioEnabled);
    }

    // Display settings
    gameEngine.screenShake = settings.screenShake;
    gameEngine.particleQuality = settings.particleQuality;
    gameEngine.showFPS = settings.showFPS;
    gameEngine.hudOpacity = settings.hudOpacity;
    gameEngine.crosshairStyle = settings.crosshairStyle;

    // Gameplay settings
    gameEngine.difficulty = settings.difficulty;
    gameEngine.autoReload = settings.autoReload;
    gameEngine.mouseAiming = settings.mouseAiming;
    gameEngine.cameraSmoothness = settings.cameraSmoothness;

    // Accessibility settings
    gameEngine.colorBlindMode = settings.colorBlindMode;
    gameEngine.bloodEffects = settings.bloodEffects;
    gameEngine.screenFlash = settings.screenFlash;

    // Additional tweaks
    gameEngine.enemyAggression = settings.enemyAggression;
    gameEngine.bulletSpeed = settings.bulletSpeed;
    gameEngine.explosionSize = settings.explosionSize;
  }

  /**
   * Clear all save data (use with caution)
   * @returns {boolean} Whether the clear was successful
   */
  clearAllData() {
    try {
      localStorage.removeItem(this.saveKey);
      return true;
    } catch (e) {
      console.error('SaveSystem: Error clearing data:', e);
      return false;
    }
  }

  /**
   * Get global statistics
   * @returns {Object} Global statistics object
   */
  getGlobalStats() {
    const allData = this.loadAllData();
    return allData.globalStats;
  }

  /**
   * Check if tutorial has been completed
   * @param {number} slotIndex - The slot index to check
   * @returns {boolean} Whether the tutorial is completed
   */
  isTutorialCompleted(slotIndex = 0) {
    const slotData = this.loadFromSlot(slotIndex);
    return slotData && slotData.tutorial && slotData.tutorial.completed;
  }

  /**
   * Mark tutorial as completed
   * @param {number} slotIndex - The slot index
   * @returns {boolean} Whether the save was successful
   */
  completeTutorial(slotIndex = 0) {
    const allData = this.loadAllData();
    if (!allData.slots[slotIndex]) {
      allData.slots[slotIndex] = this.getDefaultSlotData();
    }
    allData.slots[slotIndex].tutorial.completed = true;
    return this.saveAllData(allData);
  }
}
