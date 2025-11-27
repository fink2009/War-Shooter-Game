/**
 * ShopVendor - Merchant NPC that appears every 5 waves
 * Sells items to the player for coins
 */
class ShopVendor extends Entity {
  constructor(x, y) {
    super(x, y, 40, 60);
    this.type = 'vendor';
    this.active = true;
    this.isInteractable = true;
    this.interactionRange = 80;
    this.bobOffset = 0;
    this.bobSpeed = 0.02;
    this.showPrompt = false;
  }

  /**
   * Get shop configuration from GameConfig
   * @returns {Object} Shop configuration
   */
  getConfig() {
    return typeof GameConfig !== 'undefined' && GameConfig.SHOP ? 
      GameConfig.SHOP : {
        spawnInterval: 5,
        items: {
          healthRefill: 100,
          ammoPack: 50,
          randomPowerup: 150,
          tempUpgrade: 200,
          weaponUnlock: 500,
          reviveToken: 300
        }
      };
  }

  /**
   * Update the vendor
   * @param {number} deltaTime - Time since last update
   * @param {PlayerCharacter} player - The player
   */
  update(deltaTime, player) {
    const dt = deltaTime / 16;
    this.bobOffset += this.bobSpeed * dt;
    
    // Check if player is in interaction range
    if (player && player.active) {
      const dx = (player.x + player.width / 2) - (this.x + this.width / 2);
      const dy = (player.y + player.height / 2) - (this.y + this.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      this.showPrompt = dist < this.interactionRange;
    } else {
      this.showPrompt = false;
    }
  }

  /**
   * Check if player is in range to interact
   * @param {PlayerCharacter} player - The player
   * @returns {boolean} Whether in range
   */
  canInteract(player) {
    if (!player || !player.active) return false;
    
    const dx = (player.x + player.width / 2) - (this.x + this.width / 2);
    const dy = (player.y + player.height / 2) - (this.y + this.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    return dist < this.interactionRange;
  }

  /**
   * Get available shop items
   * @returns {Array} Array of shop items
   */
  getItems() {
    const config = this.getConfig();
    return [
      {
        id: 'healthRefill',
        name: 'Health Refill',
        description: 'Restore full health',
        cost: config.items.healthRefill,
        icon: '❤️'
      },
      {
        id: 'ammoPack',
        name: 'Ammo Pack',
        description: 'Refill all weapon ammo',
        cost: config.items.ammoPack,
        icon: '🔫'
      },
      {
        id: 'randomPowerup',
        name: 'Mystery Box',
        description: 'Random power-up',
        cost: config.items.randomPowerup,
        icon: '❓'
      },
      {
        id: 'tempUpgrade',
        name: 'Damage Boost',
        description: '+50% damage for 1 wave',
        cost: config.items.tempUpgrade,
        icon: '💥'
      },
      {
        id: 'weaponUnlock',
        name: 'Weapon Crate',
        description: 'Random weapon',
        cost: config.items.weaponUnlock,
        icon: '📦'
      },
      {
        id: 'reviveToken',
        name: 'Revive Token',
        description: 'Auto-revive once',
        cost: config.items.reviveToken,
        icon: '💫'
      }
    ];
  }

  /**
   * Purchase an item
   * @param {string} itemId - ID of item to purchase
   * @param {PlayerCharacter} player - The player
   * @param {CurrencySystem} currencySystem - Reference to currency system
   * @returns {boolean} Whether purchase was successful
   */
  purchaseItem(itemId, player, currencySystem) {
    const items = this.getItems();
    const item = items.find(i => i.id === itemId);
    
    if (!item || !currencySystem || !player) {
      return false;
    }
    
    if (!currencySystem.spend(item.cost)) {
      return false;
    }
    
    // Apply item effect
    this.applyItem(itemId, player);
    
    // Play purchase sound
    if (window.game && window.game.audioManager) {
      window.game.audioManager.playSound('purchase_success', 0.6);
    }
    
    return true;
  }

  /**
   * Apply purchased item effect
   * @param {string} itemId - ID of item
   * @param {PlayerCharacter} player - The player
   */
  applyItem(itemId, player) {
    switch (itemId) {
      case 'healthRefill':
        player.health = player.maxHealth;
        if (window.game && window.game.particleSystem) {
          window.game.particleSystem.createTextPopup(
            player.x + player.width / 2,
            player.y - 20,
            'FULL HEALTH!',
            '#00ff00'
          );
        }
        break;
        
      case 'ammoPack':
        player.rangedWeapons.forEach(weapon => {
          weapon.currentAmmo = weapon.ammoCapacity;
        });
        if (window.game && window.game.particleSystem) {
          window.game.particleSystem.createTextPopup(
            player.x + player.width / 2,
            player.y - 20,
            'AMMO FULL!',
            '#ffff00'
          );
        }
        break;
        
      case 'randomPowerup':
        const powerups = ['powerup_invincibility', 'powerup_speed', 'powerup_rapid_fire', 
                         'powerup_multi_shot', 'powerup_shield'];
        const randomPowerup = powerups[Math.floor(Math.random() * powerups.length)];
        // Create and apply pickup
        const pickup = new Pickup(player.x, player.y, randomPowerup);
        pickup.apply(player);
        break;
        
      case 'tempUpgrade':
        // Store original damages
        const originalDamages = player.rangedWeapons.map(w => w.damage);
        player.rangedWeapons.forEach(w => w.damage = Math.floor(w.damage * 1.5));
        player.hasTempDamageBoost = true;
        player.tempDamageBoostWave = window.game ? window.game.wave : 0;
        // Note: This should be cleared at wave end by game engine
        break;
        
      case 'weaponUnlock':
        const weapons = ['weapon_rifle', 'weapon_shotgun', 'weapon_machinegun', 
                        'weapon_sniper', 'weapon_grenade', 'weapon_laser'];
        const randomWeapon = weapons[Math.floor(Math.random() * weapons.length)];
        const weaponPickup = new Pickup(player.x, player.y, randomWeapon);
        if (player.rangedWeapons.length < 4) {
          weaponPickup.apply(player);
        } else {
          // Need to show swap dialog - handled by game engine
          if (window.game) {
            window.game.weaponSwapPopup = {
              weapon: weaponPickup.weapon,
              pickup: weaponPickup,
              pickupType: randomWeapon
            };
            window.game.state = 'weaponswap';
          }
        }
        break;
        
      case 'reviveToken':
        player.hasReviveToken = true;
        if (window.game && window.game.particleSystem) {
          window.game.particleSystem.createTextPopup(
            player.x + player.width / 2,
            player.y - 20,
            'REVIVE TOKEN!',
            '#ff00ff'
          );
        }
        break;
    }
  }

  /**
   * Render the vendor
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    const yOffset = Math.sin(this.bobOffset) * 2;
    const x = this.x;
    const y = this.y + yOffset;
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(x + 4, this.y + this.height, this.width - 8, 4);
    
    // Body (green robe)
    ctx.fillStyle = '#228822';
    ctx.fillRect(x + 5, y + 20, this.width - 10, this.height - 25);
    
    // Robe highlight
    ctx.fillStyle = '#33aa33';
    ctx.fillRect(x + 5, y + 20, 5, this.height - 25);
    ctx.fillRect(x + 5, y + 20, this.width - 10, 5);
    
    // Robe shadow
    ctx.fillStyle = '#116611';
    ctx.fillRect(x + this.width - 10, y + 20, 5, this.height - 25);
    ctx.fillRect(x + 5, y + this.height - 10, this.width - 10, 5);
    
    // Head
    ctx.fillStyle = '#ffcc99';
    ctx.fillRect(x + 10, y + 5, this.width - 20, 18);
    
    // Hood
    ctx.fillStyle = '#228822';
    ctx.fillRect(x + 8, y, this.width - 16, 8);
    ctx.fillRect(x + 5, y + 5, 8, 10);
    ctx.fillRect(x + this.width - 13, y + 5, 8, 10);
    
    // Face
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 14, y + 10, 3, 3); // Left eye
    ctx.fillRect(x + 23, y + 10, 3, 3); // Right eye
    ctx.fillRect(x + 16, y + 16, 8, 2); // Smile
    
    // Coin bag
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x + this.width - 8, y + 35, 10, 15);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(x + this.width - 5, y + 38, 4, 4);
    
    // Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 5, y + 20, this.width - 10, this.height - 25);
    
    // Interaction prompt
    if (this.showPrompt) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(x - 15, y - 30, 70, 25);
      
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Press [E]', x + this.width / 2, y - 15);
      ctx.fillText('SHOP', x + this.width / 2, y - 3);
      ctx.textAlign = 'left';
    }
    
    // Floating coin icon
    const coinY = y - 10 + Math.sin(this.bobOffset * 2) * 3;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(x + this.width / 2, coinY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#b8860b';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('$', x + this.width / 2, coinY + 4);
    ctx.textAlign = 'left';
  }
}

/**
 * Check if shop should spawn
 * @param {number} waveNumber - Current wave number
 * @returns {boolean} Whether to spawn shop
 */
function shouldSpawnShop(waveNumber) {
  const config = typeof GameConfig !== 'undefined' && GameConfig.SHOP ? 
    GameConfig.SHOP : { spawnInterval: 5 };
  return waveNumber > 1 && waveNumber % config.spawnInterval === 0;
}
