/**
 * UpgradeMenu - UI overlay for viewing and purchasing upgrades
 * Skill tree layout with icons, progress bars, and upgrade buttons
 */
class UpgradeMenu {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.visible = false;
    this.selectedUpgrade = 0;
    this.upgradeSystem = null;
    this.currencySystem = null;
  }

  /**
   * Initialize with systems
   * @param {UpgradeSystem} upgradeSystem - Reference to upgrade system
   * @param {CurrencySystem} currencySystem - Reference to currency system
   */
  init(upgradeSystem, currencySystem) {
    this.upgradeSystem = upgradeSystem;
    this.currencySystem = currencySystem;
  }

  /**
   * Show the menu
   */
  show() {
    this.visible = true;
    this.selectedUpgrade = 0;
  }

  /**
   * Hide the menu
   */
  hide() {
    this.visible = false;
  }

  /**
   * Toggle menu visibility
   */
  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Handle input
   * @param {InputManager} inputManager - Input manager
   * @returns {boolean} Whether input was handled
   */
  handleInput(inputManager) {
    if (!this.visible) return false;
    
    // Navigation
    if (inputManager.wasKeyPressed('ArrowUp') || inputManager.wasKeyPressed('w') || inputManager.wasKeyPressed('W')) {
      this.selectedUpgrade = Math.max(0, this.selectedUpgrade - 1);
      return true;
    }
    if (inputManager.wasKeyPressed('ArrowDown') || inputManager.wasKeyPressed('s') || inputManager.wasKeyPressed('S')) {
      this.selectedUpgrade = Math.min(5, this.selectedUpgrade + 1);
      return true;
    }
    
    // Purchase
    if (inputManager.wasKeyPressed('Enter') || inputManager.wasKeyPressed(' ')) {
      this.purchaseSelected();
      return true;
    }
    
    // Reset
    if (inputManager.wasKeyPressed('r') || inputManager.wasKeyPressed('R')) {
      if (this.upgradeSystem && this.currencySystem) {
        const refund = this.upgradeSystem.reset(this.currencySystem);
        if (window.game && window.game.audioManager) {
          window.game.audioManager.playSound('upgrade_reset', 0.5);
        }
      }
      return true;
    }
    
    // Close
    if (inputManager.wasKeyPressed('Escape') || inputManager.wasKeyPressed('u') || inputManager.wasKeyPressed('U')) {
      this.hide();
      return true;
    }
    
    return false;
  }

  /**
   * Purchase currently selected upgrade
   */
  purchaseSelected() {
    if (!this.upgradeSystem || !this.currencySystem) return;
    
    const upgrades = this.upgradeSystem.getUpgradeInfo();
    const selected = upgrades[this.selectedUpgrade];
    
    if (selected && this.upgradeSystem.canPurchase(selected.type, this.currencySystem.getCoins())) {
      if (this.upgradeSystem.purchase(selected.type, this.currencySystem)) {
        // Play success sound
        if (window.game && window.game.audioManager) {
          window.game.audioManager.playSound('upgrade_purchase', 0.6);
        }
        
        // Apply to player if in game
        if (window.game && window.game.player) {
          this.upgradeSystem.applyToPlayer(window.game.player);
        }
      }
    } else {
      // Play fail sound
      if (window.game && window.game.audioManager) {
        window.game.audioManager.playSound('purchase_fail', 0.4);
      }
    }
  }

  /**
   * Render the menu
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    if (!this.visible) return;
    
    ctx.save();
    
    // Background overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Panel
    const panelWidth = 700;
    const panelHeight = 500;
    const panelX = (this.width - panelWidth) / 2;
    const panelY = (this.height - panelHeight) / 2;
    
    // Panel background
    ctx.fillStyle = '#1a2a3a';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    
    // Panel border
    ctx.strokeStyle = '#4a6a8a';
    ctx.lineWidth = 4;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    // Inner border
    ctx.strokeStyle = '#2a4a6a';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX + 5, panelY + 5, panelWidth - 10, panelHeight - 10);
    
    // Title
    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('UPGRADES', this.width / 2, panelY + 45);
    
    // Coin display
    if (this.currencySystem) {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`💰 ${this.currencySystem.formatCoins(this.currencySystem.getCoins())}`, this.width / 2, panelY + 75);
    }
    
    // Upgrade list
    if (this.upgradeSystem) {
      const upgrades = this.upgradeSystem.getUpgradeInfo();
      const startY = panelY + 110;
      const spacing = 60;
      
      upgrades.forEach((upgrade, index) => {
        const y = startY + index * spacing;
        const isSelected = index === this.selectedUpgrade;
        const canAfford = this.currencySystem && upgrade.cost > 0 && 
                         this.currencySystem.canAfford(upgrade.cost);
        const isMaxed = upgrade.level >= upgrade.maxLevel;
        
        // Selection highlight
        if (isSelected) {
          ctx.fillStyle = 'rgba(0, 255, 0, 0.15)';
          ctx.fillRect(panelX + 20, y - 15, panelWidth - 40, 50);
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 2;
          ctx.strokeRect(panelX + 20, y - 15, panelWidth - 40, 50);
        }
        
        // Icon
        ctx.font = '24px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(upgrade.icon, panelX + 40, y + 10);
        
        // Name
        ctx.fillStyle = isSelected ? '#00ffff' : '#ffffff';
        ctx.font = 'bold 18px monospace';
        ctx.fillText(upgrade.name, panelX + 80, y + 5);
        
        // Level indicator
        ctx.fillStyle = '#888888';
        ctx.font = '14px monospace';
        ctx.fillText(`Level ${upgrade.level}/${upgrade.maxLevel}`, panelX + 80, y + 25);
        
        // Progress bar
        const barX = panelX + 280;
        const barY = y - 5;
        const barWidth = 150;
        const barHeight = 12;
        
        ctx.fillStyle = '#333333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        const fillWidth = (upgrade.level / upgrade.maxLevel) * barWidth;
        ctx.fillStyle = isMaxed ? '#00ff00' : '#ffaa00';
        ctx.fillRect(barX, barY, fillWidth, barHeight);
        
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Level pips
        for (let i = 1; i < upgrade.maxLevel; i++) {
          const pipX = barX + (barWidth / upgrade.maxLevel) * i;
          ctx.strokeStyle = '#444444';
          ctx.beginPath();
          ctx.moveTo(pipX, barY);
          ctx.lineTo(pipX, barY + barHeight);
          ctx.stroke();
        }
        
        // Current bonus
        ctx.fillStyle = '#00ff00';
        ctx.font = '12px monospace';
        const bonusText = upgrade.currentBonus > 0 ? upgrade.formatBonus(upgrade.currentBonus) : '-';
        ctx.fillText(bonusText, barX, y + 25);
        
        // Next bonus (if not maxed)
        if (!isMaxed && upgrade.nextBonus) {
          ctx.fillStyle = '#ffff00';
          ctx.fillText(`→ ${upgrade.formatBonus(upgrade.nextBonus)}`, barX + 70, y + 25);
        }
        
        // Cost / Status
        ctx.textAlign = 'right';
        if (isMaxed) {
          ctx.fillStyle = '#00ff00';
          ctx.font = 'bold 16px monospace';
          ctx.fillText('MAXED', panelX + panelWidth - 40, y + 10);
        } else {
          ctx.fillStyle = canAfford ? '#ffd700' : '#ff4444';
          ctx.font = 'bold 16px monospace';
          ctx.fillText(`${upgrade.cost}`, panelX + panelWidth - 40, y + 10);
          ctx.fillStyle = '#888888';
          ctx.font = '12px monospace';
          ctx.fillText('coins', panelX + panelWidth - 40, y + 25);
        }
        
        ctx.textAlign = 'left';
      });
    }
    
    // Instructions
    ctx.fillStyle = '#888888';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('↑↓ Navigate | ENTER Purchase | R Reset (50% refund) | ESC Close', 
                 this.width / 2, panelY + panelHeight - 20);
    
    ctx.restore();
  }
}

/**
 * ShopMenu - UI overlay for shop interface
 */
class ShopMenu {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.visible = false;
    this.selectedItem = 0;
    this.vendor = null;
    this.currencySystem = null;
    this.player = null;
  }

  /**
   * Initialize with systems
   * @param {CurrencySystem} currencySystem - Reference to currency system
   */
  init(currencySystem) {
    this.currencySystem = currencySystem;
  }

  /**
   * Open shop with vendor
   * @param {ShopVendor} vendor - The vendor
   * @param {PlayerCharacter} player - The player
   */
  open(vendor, player) {
    this.vendor = vendor;
    this.player = player;
    this.visible = true;
    this.selectedItem = 0;
  }

  /**
   * Close the shop
   */
  close() {
    this.visible = false;
    this.vendor = null;
  }

  /**
   * Handle input
   * @param {InputManager} inputManager - Input manager
   * @returns {boolean} Whether input was handled
   */
  handleInput(inputManager) {
    if (!this.visible || !this.vendor) return false;
    
    const items = this.vendor.getItems();
    
    // Navigation
    if (inputManager.wasKeyPressed('ArrowUp') || inputManager.wasKeyPressed('w') || inputManager.wasKeyPressed('W')) {
      this.selectedItem = Math.max(0, this.selectedItem - 1);
      return true;
    }
    if (inputManager.wasKeyPressed('ArrowDown') || inputManager.wasKeyPressed('s') || inputManager.wasKeyPressed('S')) {
      this.selectedItem = Math.min(items.length - 1, this.selectedItem + 1);
      return true;
    }
    
    // Purchase
    if (inputManager.wasKeyPressed('Enter') || inputManager.wasKeyPressed(' ')) {
      const item = items[this.selectedItem];
      if (item && this.vendor.purchaseItem(item.id, this.player, this.currencySystem)) {
        // Success handled by vendor
      } else {
        // Play fail sound
        if (window.game && window.game.audioManager) {
          window.game.audioManager.playSound('purchase_fail', 0.4);
        }
      }
      return true;
    }
    
    // Close
    if (inputManager.wasKeyPressed('Escape') || inputManager.wasKeyPressed('e') || inputManager.wasKeyPressed('E')) {
      this.close();
      return true;
    }
    
    return false;
  }

  /**
   * Render the shop menu
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    if (!this.visible || !this.vendor) return;
    
    ctx.save();
    
    // Background overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Panel
    const panelWidth = 500;
    const panelHeight = 450;
    const panelX = (this.width - panelWidth) / 2;
    const panelY = (this.height - panelHeight) / 2;
    
    // Panel background
    ctx.fillStyle = '#1a2a3a';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    
    // Panel border
    ctx.strokeStyle = '#4a8a4a';
    ctx.lineWidth = 4;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    // Inner border
    ctx.strokeStyle = '#2a6a2a';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX + 5, panelY + 5, panelWidth - 10, panelHeight - 10);
    
    // Title
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🛒 SHOP', this.width / 2, panelY + 45);
    
    // Coin display
    if (this.currencySystem) {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`💰 ${this.currencySystem.formatCoins(this.currencySystem.getCoins())}`, this.width / 2, panelY + 75);
    }
    
    // Item grid
    const items = this.vendor.getItems();
    const startY = panelY + 100;
    const spacing = 50;
    
    items.forEach((item, index) => {
      const y = startY + index * spacing;
      const isSelected = index === this.selectedItem;
      const canAfford = this.currencySystem && this.currencySystem.canAfford(item.cost);
      
      // Selection highlight
      if (isSelected) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.15)';
        ctx.fillRect(panelX + 20, y - 10, panelWidth - 40, 40);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX + 20, y - 10, panelWidth - 40, 40);
      }
      
      // Icon
      ctx.font = '24px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(item.icon, panelX + 40, y + 10);
      
      // Name
      ctx.fillStyle = isSelected ? '#00ffff' : '#ffffff';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(item.name, panelX + 80, y + 5);
      
      // Description
      ctx.fillStyle = '#888888';
      ctx.font = '12px monospace';
      ctx.fillText(item.description, panelX + 80, y + 22);
      
      // Cost
      ctx.textAlign = 'right';
      ctx.fillStyle = canAfford ? '#ffd700' : '#ff4444';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`${item.cost}`, panelX + panelWidth - 40, y + 12);
      ctx.textAlign = 'left';
    });
    
    // Instructions
    ctx.fillStyle = '#888888';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('↑↓ Navigate | ENTER Purchase | ESC Close', 
                 this.width / 2, panelY + panelHeight - 20);
    
    ctx.restore();
  }
}

/**
 * AttachmentMenu - UI overlay for weapon customization
 */
class AttachmentMenu {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.visible = false;
    this.selectedTab = 0; // 0 = weapon, 1 = inventory
    this.selectedWeapon = 0;
    this.selectedAttachment = 0;
    this.attachmentSystem = null;
    this.currencySystem = null;
    this.player = null;
  }

  /**
   * Initialize with systems
   * @param {AttachmentSystem} attachmentSystem - Reference to attachment system
   * @param {CurrencySystem} currencySystem - Reference to currency system
   */
  init(attachmentSystem, currencySystem) {
    this.attachmentSystem = attachmentSystem;
    this.currencySystem = currencySystem;
  }

  /**
   * Open the menu
   * @param {PlayerCharacter} player - The player
   */
  open(player) {
    this.player = player;
    this.visible = true;
    this.selectedTab = 0;
    this.selectedWeapon = 0;
    this.selectedAttachment = 0;
  }

  /**
   * Close the menu
   */
  close() {
    this.visible = false;
  }

  /**
   * Handle input
   * @param {InputManager} inputManager - Input manager
   * @returns {boolean} Whether input was handled
   */
  handleInput(inputManager) {
    if (!this.visible) return false;
    
    // Tab switching
    if (inputManager.wasKeyPressed('Tab') || inputManager.wasKeyPressed(']')) {
      this.selectedTab = (this.selectedTab + 1) % 2;
      this.selectedAttachment = 0;
      return true;
    }
    
    // Navigation
    if (inputManager.wasKeyPressed('ArrowLeft') || inputManager.wasKeyPressed('a') || inputManager.wasKeyPressed('A')) {
      if (this.selectedTab === 0) {
        const weapons = this.getWeapons();
        this.selectedWeapon = Math.max(0, this.selectedWeapon - 1);
      }
      return true;
    }
    if (inputManager.wasKeyPressed('ArrowRight') || inputManager.wasKeyPressed('d') || inputManager.wasKeyPressed('D')) {
      if (this.selectedTab === 0) {
        const weapons = this.getWeapons();
        this.selectedWeapon = Math.min(weapons.length - 1, this.selectedWeapon + 1);
      }
      return true;
    }
    if (inputManager.wasKeyPressed('ArrowUp') || inputManager.wasKeyPressed('w') || inputManager.wasKeyPressed('W')) {
      this.selectedAttachment = Math.max(0, this.selectedAttachment - 1);
      return true;
    }
    if (inputManager.wasKeyPressed('ArrowDown') || inputManager.wasKeyPressed('s') || inputManager.wasKeyPressed('S')) {
      const weapon = this.getSelectedWeapon();
      const maxAttachments = this.selectedTab === 0 ? 
        (weapon ? this.attachmentSystem.getEquippedAttachments(weapon.name).length : 0) :
        this.attachmentSystem.getInventory().length;
      this.selectedAttachment = Math.min(Math.max(0, maxAttachments - 1), this.selectedAttachment + 1);
      return true;
    }
    
    // Equip/Unequip
    if (inputManager.wasKeyPressed('Enter') || inputManager.wasKeyPressed(' ')) {
      this.handleAction();
      return true;
    }
    
    // Close
    if (inputManager.wasKeyPressed('Escape')) {
      this.close();
      return true;
    }
    
    return false;
  }

  /**
   * Get player's weapons
   * @returns {Array} Array of weapons
   */
  getWeapons() {
    if (!this.player) return [];
    const weapons = [...this.player.rangedWeapons];
    if (this.player.meleeWeapons) {
      weapons.push(...this.player.meleeWeapons);
    }
    return weapons;
  }

  /**
   * Get currently selected weapon
   * @returns {Weapon|null} Selected weapon
   */
  getSelectedWeapon() {
    const weapons = this.getWeapons();
    return weapons[this.selectedWeapon] || null;
  }

  /**
   * Handle equip/unequip action
   */
  handleAction() {
    if (!this.attachmentSystem) return;
    
    const weapon = this.getSelectedWeapon();
    if (!weapon) return;
    
    if (this.selectedTab === 0) {
      // Unequip selected attachment
      const equipped = this.attachmentSystem.getEquippedAttachments(weapon.name);
      if (equipped[this.selectedAttachment]) {
        this.attachmentSystem.unequip(equipped[this.selectedAttachment], weapon.name, weapon);
        if (window.game && window.game.audioManager) {
          window.game.audioManager.playSound('attachment_remove', 0.5);
        }
      }
    } else {
      // Equip from inventory
      const inventory = this.attachmentSystem.getInventory();
      if (inventory[this.selectedAttachment]) {
        if (this.attachmentSystem.equip(inventory[this.selectedAttachment], weapon.name, weapon)) {
          if (window.game && window.game.audioManager) {
            window.game.audioManager.playSound('attachment_equip', 0.5);
          }
        }
      }
    }
  }

  /**
   * Render the menu
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    if (!this.visible) return;
    
    ctx.save();
    
    // Background overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Panel
    const panelWidth = 700;
    const panelHeight = 500;
    const panelX = (this.width - panelWidth) / 2;
    const panelY = (this.height - panelHeight) / 2;
    
    // Panel background
    ctx.fillStyle = '#1a2a3a';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    
    // Panel border
    ctx.strokeStyle = '#6a4a8a';
    ctx.lineWidth = 4;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    // Title
    ctx.fillStyle = '#ff00ff';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WEAPON ATTACHMENTS', this.width / 2, panelY + 35);
    
    // Tab bar
    const tabY = panelY + 60;
    const tabWidth = 150;
    const tabs = ['Equipped', 'Inventory'];
    
    tabs.forEach((tab, i) => {
      const tabX = panelX + 150 + i * (tabWidth + 20);
      const isActive = i === this.selectedTab;
      
      ctx.fillStyle = isActive ? '#6a4a8a' : '#2a2a3a';
      ctx.fillRect(tabX, tabY, tabWidth, 30);
      ctx.strokeStyle = isActive ? '#aa6aca' : '#4a4a6a';
      ctx.lineWidth = 2;
      ctx.strokeRect(tabX, tabY, tabWidth, 30);
      
      ctx.fillStyle = isActive ? '#ffffff' : '#888888';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(tab, tabX + tabWidth / 2, tabY + 20);
    });
    
    // Weapon selector (for equipped tab)
    if (this.selectedTab === 0) {
      const weapons = this.getWeapons();
      const weaponY = tabY + 50;
      
      ctx.fillStyle = '#888888';
      ctx.font = '14px monospace';
      ctx.fillText('← → Select Weapon', this.width / 2, weaponY);
      
      if (weapons.length > 0) {
        const weapon = weapons[this.selectedWeapon];
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 18px monospace';
        ctx.fillText(weapon.name.toUpperCase(), this.width / 2, weaponY + 25);
        
        // Slots indicator
        const slotsUsed = this.attachmentSystem ? 
          this.attachmentSystem.getSlotsUsed(weapon.name) : 0;
        const maxSlots = this.attachmentSystem ? 
          this.attachmentSystem.getMaxSlots() : 3;
        ctx.fillStyle = '#888888';
        ctx.font = '12px monospace';
        ctx.fillText(`Slots: ${slotsUsed}/${maxSlots}`, this.width / 2, weaponY + 45);
        
        // Equipped attachments
        const equipped = this.attachmentSystem ? 
          this.attachmentSystem.getEquippedAttachments(weapon.name) : [];
        const attachmentTypes = this.attachmentSystem ? 
          this.attachmentSystem.getAttachmentTypes() : [];
        
        const listY = weaponY + 70;
        if (equipped.length === 0) {
          ctx.fillStyle = '#666666';
          ctx.fillText('No attachments equipped', this.width / 2, listY);
        } else {
          equipped.forEach((attId, i) => {
            const att = attachmentTypes.find(a => a.id === attId);
            const y = listY + i * 35;
            const isSelected = i === this.selectedAttachment;
            
            if (isSelected) {
              ctx.fillStyle = 'rgba(255, 0, 255, 0.2)';
              ctx.fillRect(panelX + 100, y - 12, panelWidth - 200, 30);
            }
            
            ctx.textAlign = 'left';
            ctx.fillStyle = isSelected ? '#ff00ff' : '#ffffff';
            ctx.font = 'bold 14px monospace';
            ctx.fillText(att ? att.name : attId, panelX + 120, y + 5);
            
            ctx.fillStyle = '#888888';
            ctx.font = '11px monospace';
            ctx.fillText(att ? att.description : '', panelX + 120, y + 18);
            
            ctx.textAlign = 'center';
          });
        }
      }
    } else {
      // Inventory tab
      const inventory = this.attachmentSystem ? 
        this.attachmentSystem.getInventory() : [];
      const attachmentTypes = this.attachmentSystem ? 
        this.attachmentSystem.getAttachmentTypes() : [];
      
      const listY = tabY + 60;
      if (inventory.length === 0) {
        ctx.fillStyle = '#666666';
        ctx.font = '14px monospace';
        ctx.fillText('No attachments in inventory', this.width / 2, listY + 30);
        ctx.fillText('Purchase from shop or find from enemies', this.width / 2, listY + 55);
      } else {
        inventory.forEach((attId, i) => {
          const att = attachmentTypes.find(a => a.id === attId);
          const y = listY + i * 35;
          const isSelected = i === this.selectedAttachment;
          
          if (isSelected) {
            ctx.fillStyle = 'rgba(255, 0, 255, 0.2)';
            ctx.fillRect(panelX + 50, y - 12, panelWidth - 100, 30);
          }
          
          ctx.textAlign = 'left';
          ctx.fillStyle = isSelected ? '#ff00ff' : '#ffffff';
          ctx.font = 'bold 14px monospace';
          ctx.fillText(att ? att.name : attId, panelX + 70, y + 5);
          
          ctx.fillStyle = '#888888';
          ctx.font = '11px monospace';
          ctx.fillText(att ? att.description : '', panelX + 70, y + 18);
          
          if (att && att.isMelee) {
            ctx.fillStyle = '#ffaa00';
            ctx.textAlign = 'right';
            ctx.fillText('[MELEE]', panelX + panelWidth - 70, y + 5);
          } else if (att && att.isRanged) {
            ctx.fillStyle = '#00aaff';
            ctx.textAlign = 'right';
            ctx.fillText('[RANGED]', panelX + panelWidth - 70, y + 5);
          }
          
          ctx.textAlign = 'center';
        });
      }
    }
    
    // Instructions
    ctx.fillStyle = '#888888';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TAB Switch | ↑↓ Select | ENTER Equip/Unequip | ESC Close', 
                 this.width / 2, panelY + panelHeight - 15);
    
    ctx.restore();
  }
}
