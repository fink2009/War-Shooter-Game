/**
 * CurrencySystem - Manages in-game currency (coins)
 * Handles coin drops, collection, and persistence
 */
class CurrencySystem {
  constructor() {
    this.storageKey = 'warShooterCurrency';
    this.coins = 0;
    this.totalEarned = 0;
    this.load();
  }

  /**
   * Get currency configuration from GameConfig
   * @returns {Object} Currency configuration
   */
  getConfig() {
    return typeof GameConfig !== 'undefined' && GameConfig.CURRENCY ? 
      GameConfig.CURRENCY : {
        enemyDropRange: { min: 5, max: 10 },
        eliteMultiplier: 3,
        miniBossMultiplier: 8,
        bossMultiplier: 40,
        pickupRange: 50,
        waveBonus: 50,
        destructionDrop: { min: 2, max: 5 }
      };
  }

  /**
   * Load currency from localStorage
   */
  load() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.coins = data.coins || 0;
        this.totalEarned = data.totalEarned || 0;
      }
    } catch (e) {
      console.warn('CurrencySystem: Failed to load currency', e);
    }
  }

  /**
   * Save currency to localStorage
   */
  save() {
    try {
      const data = {
        coins: this.coins,
        totalEarned: this.totalEarned
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn('CurrencySystem: Failed to save currency', e);
    }
  }

  /**
   * Get current coin balance
   * @returns {number} Current coins
   */
  getCoins() {
    return this.coins;
  }

  /**
   * Add coins to balance
   * @param {number} amount - Amount to add
   */
  addCoins(amount) {
    if (amount > 0) {
      this.coins += amount;
      this.totalEarned += amount;
      this.save();
    }
  }

  /**
   * Spend coins from balance
   * @param {number} amount - Amount to spend
   * @returns {boolean} Whether the spend was successful
   */
  spend(amount) {
    if (amount > 0 && this.coins >= amount) {
      this.coins -= amount;
      this.save();
      return true;
    }
    return false;
  }

  /**
   * Check if player can afford an amount
   * @param {number} amount - Amount to check
   * @returns {boolean} Whether player has enough coins
   */
  canAfford(amount) {
    return this.coins >= amount;
  }

  /**
   * Calculate coin drop for an enemy
   * @param {Object} enemy - The enemy that was killed
   * @returns {number} Amount of coins to drop
   */
  calculateEnemyDrop(enemy) {
    const config = this.getConfig();
    const baseMin = config.enemyDropRange.min;
    const baseMax = config.enemyDropRange.max;
    
    // Calculate base amount
    let amount = baseMin + Math.floor(Math.random() * (baseMax - baseMin + 1));
    
    // Apply multipliers based on enemy type
    if (enemy.isBoss) {
      // Bosses drop 200-500 coins
      amount = 200 + Math.floor(Math.random() * 301);
    } else if (enemy.isMiniBoss) {
      // Mini-bosses drop 50-100 coins
      amount = 50 + Math.floor(Math.random() * 51);
    } else if (enemy.isElite) {
      // Elites drop 20-30 coins
      amount = 20 + Math.floor(Math.random() * 11);
    }
    
    return amount;
  }

  /**
   * Calculate wave completion bonus
   * @param {number} waveNumber - The wave number completed
   * @returns {number} Bonus coins
   */
  calculateWaveBonus(waveNumber) {
    const config = this.getConfig();
    return config.waveBonus * waveNumber;
  }

  /**
   * Calculate environmental destruction drop
   * @returns {number} Amount of coins to drop
   */
  calculateDestructionDrop() {
    const config = this.getConfig();
    const min = config.destructionDrop.min;
    const max = config.destructionDrop.max;
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  /**
   * Get pickup range for auto-collection
   * @returns {number} Pickup range in pixels
   */
  getPickupRange() {
    const config = this.getConfig();
    return config.pickupRange;
  }

  /**
   * Format coin amount for display
   * @param {number} amount - Amount to format
   * @returns {string} Formatted string
   */
  formatCoins(amount) {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + 'K';
    }
    return amount.toString();
  }

  /**
   * Get total coins earned across all sessions
   * @returns {number} Total earned
   */
  getTotalEarned() {
    return this.totalEarned;
  }

  /**
   * Reset currency (for debugging/testing)
   */
  reset() {
    this.coins = 0;
    this.totalEarned = 0;
    this.save();
  }

  /**
   * Give starting coins (for new players)
   * @param {number} amount - Starting amount
   */
  giveStartingCoins(amount = 100) {
    if (this.totalEarned === 0) {
      this.addCoins(amount);
    }
  }
}

/**
 * CoinPickup - Collectible coin entity
 * Auto-collected when player is within range
 */
class CoinPickup extends Entity {
  constructor(x, y, value = 5) {
    super(x, y, 16, 16);
    this.type = 'coin';
    this.value = value;
    this.bobOffset = Math.random() * Math.PI * 2;
    this.bobSpeed = 0.08;
    this.sparkleTimer = 0;
    this.magnetRange = 50;
    this.magnetSpeed = 8;
    this.beingCollected = false;
    this.collectTarget = null;
    this.lifetime = 30000; // 30 seconds before despawn
    this.spawnTime = performance.now();
  }

  /**
   * Update coin pickup
   * @param {number} deltaTime - Time since last update
   * @param {PlayerCharacter} player - The player
   * @param {CurrencySystem} currencySystem - Reference to currency system
   */
  update(deltaTime, player, currencySystem) {
    const dt = deltaTime / 16;
    
    // Bob animation
    this.bobOffset += this.bobSpeed * dt;
    
    // Sparkle effect timer
    this.sparkleTimer += deltaTime;
    
    // Check lifetime
    if (performance.now() - this.spawnTime > this.lifetime) {
      this.destroy();
      return;
    }
    
    // Magnet towards player if close enough
    if (player && player.active) {
      const dx = (player.x + player.width / 2) - (this.x + this.width / 2);
      const dy = (player.y + player.height / 2) - (this.y + this.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Get pickup range from currency system
      const pickupRange = currencySystem ? currencySystem.getPickupRange() : this.magnetRange;
      
      if (dist < pickupRange) {
        this.beingCollected = true;
        this.collectTarget = player;
      }
      
      // Move towards player if being collected
      if (this.beingCollected && this.collectTarget) {
        const speed = this.magnetSpeed * dt;
        if (dist > 5) {
          this.x += (dx / dist) * speed;
          this.y += (dy / dist) * speed;
        }
        
        // Collect when touching player
        if (dist < 20 && currencySystem) {
          this.collect(currencySystem);
        }
      }
    }
  }

  /**
   * Collect the coin
   * @param {CurrencySystem} currencySystem - Reference to currency system
   */
  collect(currencySystem) {
    if (!this.active) return;
    
    currencySystem.addCoins(this.value);
    
    // Play sound effect
    if (window.game && window.game.audioManager) {
      window.game.audioManager.playSound('coin_pickup', 0.5);
    }
    
    // Create particle effect
    if (window.game && window.game.particleSystem) {
      window.game.particleSystem.createTextPopup(
        this.x + this.width / 2,
        this.y - 10,
        `+${this.value}`,
        '#ffd700'
      );
      
      // Sparkle particles
      for (let i = 0; i < 5; i++) {
        window.game.particleSystem.createExplosion(
          this.x + this.width / 2,
          this.y + this.height / 2,
          3,
          '#ffd700'
        );
      }
    }
    
    this.destroy();
  }

  /**
   * Render the coin
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    const yOffset = Math.sin(this.bobOffset) * 3;
    const x = this.x;
    const y = this.y + yOffset;
    
    // Coin glow
    const glowAlpha = 0.3 + Math.sin(this.bobOffset * 2) * 0.15;
    ctx.globalAlpha = glowAlpha;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(x + this.width / 2, y + this.height / 2, this.width, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = 1;
    
    // Coin body (16-bit style)
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(x + 2, y + 2, this.width - 4, this.height - 4);
    
    // Coin highlight
    ctx.fillStyle = '#ffec8b';
    ctx.fillRect(x + 2, y + 2, this.width - 4, 3);
    ctx.fillRect(x + 2, y + 2, 3, this.height - 4);
    
    // Coin shadow
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(x + this.width - 5, y + 2, 3, this.height - 4);
    ctx.fillRect(x + 2, y + this.height - 5, this.width - 4, 3);
    
    // Coin symbol (dollar sign or star)
    ctx.fillStyle = '#b8860b';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', x + this.width / 2, y + this.height / 2);
    
    // Sparkle effect
    if (Math.floor(this.sparkleTimer / 500) % 2 === 0) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 3, y + 3, 2, 2);
    }
    
    // Border
    ctx.strokeStyle = '#8b6914';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 2, y + 2, this.width - 4, this.height - 4);
    
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }
}
