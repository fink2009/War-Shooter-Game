/**
 * UpgradeSystem - Manages permanent player upgrades that persist between sessions
 * Provides Health, Damage, Speed, Reload, Cooldown, and Armor upgrades
 */
class UpgradeSystem {
  constructor() {
    this.storageKey = 'warShooterUpgrades';
    this.upgradeLevels = {
      health: 0,
      damage: 0,
      speed: 0,
      reload: 0,
      cooldown: 0,
      armor: 0
    };
    this.totalSpent = 0;
    this.load();
  }

  /**
   * Get upgrade configuration from GameConfig
   * @returns {Object} Upgrade configuration
   */
  getConfig() {
    return typeof GameConfig !== 'undefined' && GameConfig.UPGRADES ? 
      GameConfig.UPGRADES : {
        HEALTH: { max: 5, costs: [500, 1000, 1500, 2500, 4000], bonuses: [20, 40, 60, 80, 100] },
        DAMAGE: { max: 5, costs: [500, 1000, 1500, 2500, 4000], bonuses: [0.1, 0.2, 0.3, 0.45, 0.6] },
        SPEED: { max: 5, costs: [500, 1000, 1500, 2500, 4000], bonuses: [0.15, 0.3, 0.45, 0.6, 0.75] },
        RELOAD: { max: 5, costs: [500, 1000, 1500, 2500, 4000], bonuses: [0.1, 0.2, 0.3, 0.4, 0.5] },
        COOLDOWN: { max: 5, costs: [500, 1000, 1500, 2500, 4000], bonuses: [0.1, 0.2, 0.3, 0.4, 0.5] },
        ARMOR: { max: 5, costs: [500, 1000, 1500, 2500, 4000], bonuses: [0.05, 0.1, 0.15, 0.22, 0.3] }
      };
  }

  /**
   * Load upgrade levels from localStorage
   */
  load() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.upgradeLevels = data.levels || this.upgradeLevels;
        this.totalSpent = data.totalSpent || 0;
      }
    } catch (e) {
      console.warn('UpgradeSystem: Failed to load upgrades', e);
    }
  }

  /**
   * Save upgrade levels to localStorage
   */
  save() {
    try {
      const data = {
        levels: this.upgradeLevels,
        totalSpent: this.totalSpent
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn('UpgradeSystem: Failed to save upgrades', e);
    }
  }

  /**
   * Get current level of an upgrade
   * @param {string} upgradeType - Type of upgrade (health, damage, speed, reload, cooldown, armor)
   * @returns {number} Current level (0-5)
   */
  getLevel(upgradeType) {
    return this.upgradeLevels[upgradeType.toLowerCase()] || 0;
  }

  /**
   * Get maximum level for an upgrade type
   * @param {string} upgradeType - Type of upgrade
   * @returns {number} Maximum level
   */
  getMaxLevel(upgradeType) {
    const config = this.getConfig();
    const key = upgradeType.toUpperCase();
    return config[key] ? config[key].max : 5;
  }

  /**
   * Get cost for next level of an upgrade
   * @param {string} upgradeType - Type of upgrade
   * @returns {number} Cost in coins, or -1 if maxed
   */
  getNextCost(upgradeType) {
    const config = this.getConfig();
    const key = upgradeType.toUpperCase();
    const currentLevel = this.getLevel(upgradeType);
    
    if (!config[key] || currentLevel >= config[key].max) {
      return -1;
    }
    
    return config[key].costs[currentLevel];
  }

  /**
   * Get current bonus value for an upgrade
   * @param {string} upgradeType - Type of upgrade
   * @returns {number} Current bonus value (0 if not upgraded)
   */
  getBonus(upgradeType) {
    const config = this.getConfig();
    const key = upgradeType.toUpperCase();
    const currentLevel = this.getLevel(upgradeType);
    
    if (!config[key] || currentLevel === 0) {
      return 0;
    }
    
    return config[key].bonuses[currentLevel - 1];
  }

  /**
   * Get bonus value for a specific level
   * @param {string} upgradeType - Type of upgrade
   * @param {number} level - Level to check
   * @returns {number} Bonus value at that level
   */
  getBonusAtLevel(upgradeType, level) {
    const config = this.getConfig();
    const key = upgradeType.toUpperCase();
    
    if (!config[key] || level <= 0 || level > config[key].max) {
      return 0;
    }
    
    return config[key].bonuses[level - 1];
  }

  /**
   * Check if an upgrade can be purchased
   * @param {string} upgradeType - Type of upgrade
   * @param {number} playerCoins - Player's current coin balance
   * @returns {boolean} Whether the upgrade can be purchased
   */
  canPurchase(upgradeType, playerCoins) {
    const cost = this.getNextCost(upgradeType);
    return cost > 0 && playerCoins >= cost;
  }

  /**
   * Purchase an upgrade
   * @param {string} upgradeType - Type of upgrade
   * @param {Object} currencySystem - Reference to currency system
   * @returns {boolean} Whether purchase was successful
   */
  purchase(upgradeType, currencySystem) {
    const cost = this.getNextCost(upgradeType);
    
    if (cost <= 0 || !currencySystem || !currencySystem.spend(cost)) {
      return false;
    }
    
    this.upgradeLevels[upgradeType.toLowerCase()]++;
    this.totalSpent += cost;
    this.save();
    
    return true;
  }

  /**
   * Reset all upgrades and refund 50% of total spent
   * @param {Object} currencySystem - Reference to currency system
   * @returns {number} Amount refunded
   */
  reset(currencySystem) {
    const refund = Math.floor(this.totalSpent * 0.5);
    
    // Reset all levels
    Object.keys(this.upgradeLevels).forEach(key => {
      this.upgradeLevels[key] = 0;
    });
    this.totalSpent = 0;
    
    // Add refund to currency
    if (currencySystem && refund > 0) {
      currencySystem.addCoins(refund);
    }
    
    this.save();
    return refund;
  }

  /**
   * Apply upgrade bonuses to a player character
   * @param {PlayerCharacter} player - The player to apply bonuses to
   */
  applyToPlayer(player) {
    if (!player) return;

    // Health bonus - adds flat HP
    const healthBonus = this.getBonus('health');
    if (healthBonus > 0) {
      player.maxHealth += healthBonus;
      player.health = Math.min(player.health + healthBonus, player.maxHealth);
    }

    // Store base values for upgrade reference
    player.baseSpeed = player.baseSpeed || player.speed;
    player.baseAbilityCooldown = player.baseAbilityCooldown || player.specialAbilityCooldown;

    // Speed bonus - percentage increase
    const speedBonus = this.getBonus('speed');
    if (speedBonus > 0) {
      player.speed = player.baseSpeed * (1 + speedBonus);
    }

    // Cooldown bonus - percentage reduction
    const cooldownBonus = this.getBonus('cooldown');
    if (cooldownBonus > 0) {
      player.specialAbilityCooldown = player.baseAbilityCooldown * (1 - cooldownBonus);
    }

    // Store armor reduction for damage calculation
    player.armorReduction = this.getBonus('armor');
    
    // Store damage bonus for weapon calculation
    player.damageBonus = this.getBonus('damage');
    
    // Store reload bonus for weapon reload time calculation
    player.reloadBonus = this.getBonus('reload');
  }

  /**
   * Get damage multiplier from upgrades
   * @returns {number} Damage multiplier (1.0 + bonus)
   */
  getDamageMultiplier() {
    return 1.0 + this.getBonus('damage');
  }

  /**
   * Get reload time multiplier from upgrades
   * @returns {number} Reload multiplier (1.0 - bonus, so lower is faster)
   */
  getReloadMultiplier() {
    return 1.0 - this.getBonus('reload');
  }

  /**
   * Get armor damage reduction from upgrades
   * @returns {number} Damage reduction percentage (0.0 to 0.3)
   */
  getArmorReduction() {
    return this.getBonus('armor');
  }

  /**
   * Get upgrade display info for UI
   * @returns {Array} Array of upgrade info objects
   */
  getUpgradeInfo() {
    const types = ['health', 'damage', 'speed', 'reload', 'cooldown', 'armor'];
    const icons = ['❤️', '💥', '⚡', '🔄', '⏱️', '🛡️'];
    const descriptions = [
      'Max Health',
      'Damage Bonus',
      'Movement Speed',
      'Reload Speed',
      'Ability Cooldown',
      'Damage Reduction'
    ];
    const formatters = [
      (v) => `+${v} HP`,
      (v) => `+${Math.round(v * 100)}%`,
      (v) => `+${Math.round(v * 100)}%`,
      (v) => `-${Math.round(v * 100)}%`,
      (v) => `-${Math.round(v * 100)}%`,
      (v) => `${Math.round(v * 100)}%`
    ];

    return types.map((type, i) => ({
      type: type,
      icon: icons[i],
      name: descriptions[i],
      level: this.getLevel(type),
      maxLevel: this.getMaxLevel(type),
      currentBonus: this.getBonus(type),
      nextBonus: this.getBonusAtLevel(type, this.getLevel(type) + 1),
      cost: this.getNextCost(type),
      formatBonus: formatters[i]
    }));
  }

  /**
   * Get total coins spent on upgrades
   * @returns {number} Total spent
   */
  getTotalSpent() {
    return this.totalSpent;
  }
}
