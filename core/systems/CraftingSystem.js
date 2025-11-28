// Crafting System - Combine weapon parts to create custom weapons
// Provides part collection, crafting station, and custom weapon storage
class CraftingSystem {
  constructor() {
    // Configuration from GameConfig
    this.config = typeof GameConfig !== 'undefined' && GameConfig.CRAFTING ? 
      GameConfig.CRAFTING : {
        partRarities: {
          COMMON: { bonus: 0.05, color: '#ffffff', name: 'Common' },
          UNCOMMON: { bonus: 0.10, color: '#00ff00', name: 'Uncommon' },
          RARE: { bonus: 0.15, color: '#0088ff', name: 'Rare' },
          EPIC: { bonus: 0.25, color: '#aa00ff', name: 'Epic' },
          LEGENDARY: { bonus: 0.40, color: '#ffaa00', name: 'Legendary' }
        },
        partTypes: ['barrel', 'receiver', 'stock', 'magazine'],
        maxCustomWeapons: 5,
        specialEffects: {
          FIRE: { name: 'Fire Rounds', damage: 5, duration: 3 },
          EXPLOSIVE: { name: 'Explosive Rounds', radius: 50 },
          PIERCING: { name: 'Piercing Rounds', penetration: 2 },
          VAMPIRE: { name: 'Vampire Rounds', healPercent: 0.1 },
          LIGHTNING: { name: 'Lightning Rounds', chainTargets: 2 }
        }
      };
    
    // Inventory of collected parts
    this.inventory = {
      barrel: [],
      receiver: [],
      stock: [],
      magazine: []
    };
    
    // Custom weapons
    this.customWeapons = [];
    
    // Crafting station state
    this.stationOpen = false;
    this.selectedParts = {
      barrel: null,
      receiver: null,
      stock: null,
      magazine: null
    };
    
    // Preview weapon
    this.previewWeapon = null;
    this.customWeaponName = '';
    
    this.loadState();
  }
  
  /**
   * Initialize crafting system
   * @param {Object} game - Game engine reference
   */
  init(game) {
    this.game = game;
  }
  
  /**
   * Add a weapon part to inventory
   * @param {Object} part - Weapon part object
   */
  addPart(part) {
    if (!this.config.partTypes.includes(part.type)) {
      console.warn('Invalid part type:', part.type);
      return;
    }
    
    this.inventory[part.type].push(part);
    this.saveState();
    
    console.log('Added part:', part.name, part.rarity);
  }
  
  /**
   * Generate a random weapon part drop
   * @param {string} enemyType - Type of enemy killed
   * @returns {Object|null} Generated part or null
   */
  generatePartDrop(enemyType) {
    // Base drop chance (5% for normal, higher for elites/bosses)
    let dropChance = 0.05;
    if (enemyType === 'elite') dropChance = 0.15;
    if (enemyType === 'miniboss') dropChance = 0.30;
    if (enemyType === 'boss') dropChance = 0.80;
    
    if (Math.random() > dropChance) return null;
    
    // Random part type
    const partType = this.config.partTypes[Math.floor(Math.random() * this.config.partTypes.length)];
    
    // Random rarity (weighted)
    const rarity = this.rollRarity(enemyType);
    
    // Generate part
    const part = this.createPart(partType, rarity);
    
    return part;
  }
  
  /**
   * Roll for rarity based on enemy type
   * @param {string} enemyType - Type of enemy
   * @returns {string} Rarity
   */
  rollRarity(enemyType) {
    const roll = Math.random();
    
    // Base weights
    let weights = {
      COMMON: 0.50,
      UNCOMMON: 0.30,
      RARE: 0.15,
      EPIC: 0.04,
      LEGENDARY: 0.01
    };
    
    // Adjust for enemy type
    if (enemyType === 'elite') {
      weights = { COMMON: 0.30, UNCOMMON: 0.35, RARE: 0.25, EPIC: 0.08, LEGENDARY: 0.02 };
    } else if (enemyType === 'miniboss') {
      weights = { COMMON: 0.10, UNCOMMON: 0.30, RARE: 0.35, EPIC: 0.20, LEGENDARY: 0.05 };
    } else if (enemyType === 'boss') {
      weights = { COMMON: 0.00, UNCOMMON: 0.10, RARE: 0.40, EPIC: 0.35, LEGENDARY: 0.15 };
    }
    
    let cumulative = 0;
    for (const [rarity, weight] of Object.entries(weights)) {
      cumulative += weight;
      if (roll < cumulative) return rarity;
    }
    
    return 'COMMON';
  }
  
  /**
   * Create a weapon part
   * @param {string} type - Part type
   * @param {string} rarity - Part rarity
   * @returns {Object} Part object
   */
  createPart(type, rarity) {
    const rarityConfig = this.config.partRarities[rarity];
    
    // Generate stats based on part type
    const stats = this.generatePartStats(type, rarityConfig.bonus);
    
    // Check for special effect (Legendary only)
    let specialEffect = null;
    if (rarity === 'LEGENDARY') {
      const effects = Object.keys(this.config.specialEffects);
      specialEffect = effects[Math.floor(Math.random() * effects.length)];
    }
    
    return {
      id: Date.now() + Math.random(),
      type: type,
      rarity: rarity,
      name: `${rarityConfig.name} ${this.capitalizeFirst(type)}`,
      stats: stats,
      bonus: rarityConfig.bonus,
      color: rarityConfig.color,
      specialEffect: specialEffect
    };
  }
  
  /**
   * Generate stats for a part
   * @param {string} type - Part type
   * @param {number} bonus - Bonus multiplier
   * @returns {Object} Stats object
   */
  generatePartStats(type, bonus) {
    const stats = {};
    
    switch (type) {
      case 'barrel':
        stats.range = bonus;
        stats.accuracy = bonus * 0.5;
        break;
      case 'receiver':
        stats.damage = bonus;
        break;
      case 'stock':
        stats.recoil = -bonus;
        stats.handling = bonus * 0.5;
        break;
      case 'magazine':
        stats.capacity = bonus;
        stats.reloadSpeed = bonus * 0.3;
        break;
    }
    
    return stats;
  }
  
  /**
   * Open crafting station
   */
  openStation() {
    this.stationOpen = true;
    this.selectedParts = {
      barrel: null,
      receiver: null,
      stock: null,
      magazine: null
    };
    this.previewWeapon = null;
    this.customWeaponName = 'Custom Weapon';
  }
  
  /**
   * Close crafting station
   */
  closeStation() {
    this.stationOpen = false;
  }
  
  /**
   * Select a part for crafting
   * @param {string} type - Part type
   * @param {Object} part - Part object
   */
  selectPart(type, part) {
    this.selectedParts[type] = part;
    this.updatePreview();
  }
  
  /**
   * Update preview weapon based on selected parts
   */
  updatePreview() {
    // Check if all parts are selected
    const allSelected = Object.values(this.selectedParts).every(p => p !== null);
    
    if (!allSelected) {
      this.previewWeapon = null;
      return;
    }
    
    // Calculate combined stats
    const combinedStats = this.calculateCombinedStats();
    
    // Get special effect if any
    let specialEffect = null;
    for (const part of Object.values(this.selectedParts)) {
      if (part && part.specialEffect) {
        specialEffect = part.specialEffect;
        break;
      }
    }
    
    this.previewWeapon = {
      name: this.customWeaponName,
      stats: combinedStats,
      specialEffect: specialEffect,
      parts: { ...this.selectedParts }
    };
  }
  
  /**
   * Calculate combined stats from selected parts
   * @returns {Object} Combined stats
   */
  calculateCombinedStats() {
    const baseStats = {
      damage: 25,
      range: 300,
      accuracy: 0.9,
      capacity: 20,
      reloadSpeed: 2000,
      fireRate: 200
    };
    
    const combinedStats = { ...baseStats };
    
    for (const part of Object.values(this.selectedParts)) {
      if (!part || !part.stats) continue;
      
      for (const [stat, value] of Object.entries(part.stats)) {
        if (stat in combinedStats) {
          // Apply as percentage modifier
          combinedStats[stat] *= (1 + value);
        }
      }
    }
    
    // Round values
    combinedStats.damage = Math.round(combinedStats.damage);
    combinedStats.range = Math.round(combinedStats.range);
    combinedStats.accuracy = Math.round(combinedStats.accuracy * 100) / 100;
    combinedStats.capacity = Math.round(combinedStats.capacity);
    combinedStats.reloadSpeed = Math.round(combinedStats.reloadSpeed);
    combinedStats.fireRate = Math.round(combinedStats.fireRate);
    
    return combinedStats;
  }
  
  /**
   * Set custom weapon name
   * @param {string} name - Weapon name
   */
  setWeaponName(name) {
    this.customWeaponName = name.substring(0, 20); // Max 20 characters
    if (this.previewWeapon) {
      this.previewWeapon.name = this.customWeaponName;
    }
  }
  
  /**
   * Craft the weapon with selected parts
   * @returns {Object|null} Crafted weapon or null if failed
   */
  craftWeapon() {
    if (!this.previewWeapon) return null;
    
    if (this.customWeapons.length >= this.config.maxCustomWeapons) {
      console.warn('Max custom weapons reached');
      return null;
    }
    
    // Create weapon object
    const weapon = {
      id: Date.now(),
      name: this.previewWeapon.name,
      stats: this.previewWeapon.stats,
      specialEffect: this.previewWeapon.specialEffect,
      parts: { ...this.previewWeapon.parts },
      shareCode: this.generateShareCode()
    };
    
    // Remove parts from inventory
    for (const [type, part] of Object.entries(this.selectedParts)) {
      const index = this.inventory[type].findIndex(p => p.id === part.id);
      if (index !== -1) {
        this.inventory[type].splice(index, 1);
      }
    }
    
    // Add to custom weapons
    this.customWeapons.push(weapon);
    
    // Reset selection
    this.selectedParts = {
      barrel: null,
      receiver: null,
      stock: null,
      magazine: null
    };
    this.previewWeapon = null;
    
    this.saveState();
    
    console.log('Crafted weapon:', weapon.name);
    return weapon;
  }
  
  /**
   * Delete a custom weapon
   * @param {number} weaponId - Weapon ID
   */
  deleteWeapon(weaponId) {
    const index = this.customWeapons.findIndex(w => w.id === weaponId);
    if (index !== -1) {
      this.customWeapons.splice(index, 1);
      this.saveState();
    }
  }
  
  /**
   * Generate a 6-digit share code
   * @returns {string} Share code
   */
  generateShareCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }
  
  /**
   * Import weapon from share code
   * @param {string} code - Share code
   * @returns {Object|null} Imported weapon or null
   */
  importWeapon(code) {
    // In a full implementation, this would fetch from a server
    // For now, we'll just validate the code format
    if (!/^[A-Z0-9]{6}$/.test(code)) {
      console.warn('Invalid share code');
      return null;
    }
    
    // Placeholder - would need server implementation
    console.log('Share code import not implemented:', code);
    return null;
  }
  
  /**
   * Get inventory count by rarity
   * @returns {Object} Counts by rarity
   */
  getInventorySummary() {
    const summary = {};
    
    for (const rarity of Object.keys(this.config.partRarities)) {
      summary[rarity] = 0;
    }
    
    for (const parts of Object.values(this.inventory)) {
      for (const part of parts) {
        summary[part.rarity] = (summary[part.rarity] || 0) + 1;
      }
    }
    
    return summary;
  }
  
  /**
   * Get parts by type
   * @param {string} type - Part type
   * @returns {Array} Parts of that type
   */
  getPartsByType(type) {
    return this.inventory[type] || [];
  }
  
  /**
   * Get custom weapons
   * @returns {Array} Custom weapons
   */
  getCustomWeapons() {
    return this.customWeapons;
  }
  
  /**
   * Capitalize first letter
   * @param {string} str - String to capitalize
   * @returns {string}
   */
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  /**
   * Render crafting station UI
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    if (!this.stationOpen) return;
    
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    ctx.save();
    
    // Background overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, width, height);
    
    // Title
    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚙️ WEAPON CRAFTING STATION', width / 2, 40);
    
    // Close button
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(width - 50, 10, 40, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('X', width - 30, 32);
    
    // Parts selection area
    this.renderPartsSelection(ctx, 50, 70, 300, height - 150);
    
    // Preview area
    this.renderPreview(ctx, 370, 70, 260, 200);
    
    // Custom weapons area
    this.renderCustomWeapons(ctx, 370, 290, 260, height - 370);
    
    // Craft button
    if (this.previewWeapon) {
      ctx.fillStyle = '#00aa00';
      ctx.fillRect(width / 2 - 60, height - 60, 120, 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CRAFT', width / 2, height - 35);
    }
    
    ctx.restore();
  }
  
  /**
   * Render parts selection
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} w - Width
   * @param {number} h - Height
   */
  renderPartsSelection(ctx, x, y, w, h) {
    ctx.fillStyle = 'rgba(40, 40, 40, 0.9)';
    ctx.fillRect(x, y, w, h);
    
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('PARTS INVENTORY', x + 10, y + 20);
    
    const partTypes = this.config.partTypes;
    const sectionHeight = (h - 40) / partTypes.length;
    
    partTypes.forEach((type, index) => {
      const sectionY = y + 35 + index * sectionHeight;
      
      // Section header
      ctx.fillStyle = '#888888';
      ctx.font = '12px monospace';
      ctx.fillText(type.toUpperCase(), x + 10, sectionY);
      
      // Parts in this category
      const parts = this.inventory[type];
      const maxDisplay = Math.min(4, parts.length);
      
      for (let i = 0; i < maxDisplay; i++) {
        const part = parts[i];
        const partX = x + 10 + i * 65;
        const partY = sectionY + 10;
        
        // Part box
        const isSelected = this.selectedParts[type] && this.selectedParts[type].id === part.id;
        ctx.fillStyle = isSelected ? '#444466' : '#333333';
        ctx.fillRect(partX, partY, 60, 50);
        
        ctx.strokeStyle = part.color;
        ctx.lineWidth = isSelected ? 3 : 1;
        ctx.strokeRect(partX, partY, 60, 50);
        
        // Part name (abbreviated)
        ctx.fillStyle = part.color;
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(part.rarity.substring(0, 3), partX + 30, partY + 20);
        
        // Part icon
        ctx.font = '16px Arial';
        ctx.fillText(this.getPartIcon(type), partX + 30, partY + 42);
      }
      
      // Show count if more parts
      if (parts.length > maxDisplay) {
        ctx.fillStyle = '#888888';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`+${parts.length - maxDisplay} more`, x + 10 + maxDisplay * 65, sectionY + 35);
      }
    });
  }
  
  /**
   * Render weapon preview
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} w - Width
   * @param {number} h - Height
   */
  renderPreview(ctx, x, y, w, h) {
    ctx.fillStyle = 'rgba(40, 40, 60, 0.9)';
    ctx.fillRect(x, y, w, h);
    
    ctx.strokeStyle = '#6666aa';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    
    ctx.fillStyle = '#aaaaff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('PREVIEW', x + 10, y + 20);
    
    if (!this.previewWeapon) {
      ctx.fillStyle = '#666666';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Select all 4 parts', x + w / 2, y + h / 2);
      ctx.fillText('to preview weapon', x + w / 2, y + h / 2 + 15);
      return;
    }
    
    // Weapon name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(this.previewWeapon.name, x + 10, y + 45);
    
    // Stats
    const stats = this.previewWeapon.stats;
    ctx.font = '11px monospace';
    ctx.fillStyle = '#aaaaaa';
    
    let statY = y + 65;
    const statLines = [
      `Damage: ${stats.damage}`,
      `Range: ${stats.range}`,
      `Accuracy: ${Math.round(stats.accuracy * 100)}%`,
      `Capacity: ${stats.capacity}`,
      `Fire Rate: ${stats.fireRate}ms`
    ];
    
    for (const line of statLines) {
      ctx.fillText(line, x + 10, statY);
      statY += 14;
    }
    
    // Special effect
    if (this.previewWeapon.specialEffect) {
      const effect = this.config.specialEffects[this.previewWeapon.specialEffect];
      ctx.fillStyle = '#ffaa00';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`✨ ${effect.name}`, x + 10, statY + 10);
    }
  }
  
  /**
   * Render custom weapons list
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} w - Width
   * @param {number} h - Height
   */
  renderCustomWeapons(ctx, x, y, w, h) {
    ctx.fillStyle = 'rgba(60, 40, 40, 0.9)';
    ctx.fillRect(x, y, w, h);
    
    ctx.strokeStyle = '#aa6666';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    
    ctx.fillStyle = '#ffaaaa';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`CUSTOM WEAPONS (${this.customWeapons.length}/${this.config.maxCustomWeapons})`, x + 10, y + 20);
    
    if (this.customWeapons.length === 0) {
      ctx.fillStyle = '#666666';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('No custom weapons yet', x + w / 2, y + h / 2);
      return;
    }
    
    // List custom weapons
    ctx.textAlign = 'left';
    let weaponY = y + 40;
    
    for (const weapon of this.customWeapons) {
      // Weapon box
      ctx.fillStyle = '#333333';
      ctx.fillRect(x + 10, weaponY, w - 20, 40);
      
      // Name
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px monospace';
      ctx.fillText(weapon.name, x + 15, weaponY + 15);
      
      // Stats summary
      ctx.fillStyle = '#888888';
      ctx.font = '10px monospace';
      ctx.fillText(`DMG: ${weapon.stats.damage} | RNG: ${weapon.stats.range}`, x + 15, weaponY + 30);
      
      // Share code
      ctx.fillStyle = '#ffaa00';
      ctx.textAlign = 'right';
      ctx.fillText(weapon.shareCode, x + w - 15, weaponY + 15);
      ctx.textAlign = 'left';
      
      weaponY += 50;
    }
  }
  
  /**
   * Get icon for part type
   * @param {string} type - Part type
   * @returns {string} Icon
   */
  getPartIcon(type) {
    switch (type) {
      case 'barrel': return '🔫';
      case 'receiver': return '⚙️';
      case 'stock': return '🪵';
      case 'magazine': return '📦';
      default: return '❓';
    }
  }
  
  /**
   * Handle click on crafting UI
   * @param {number} x - Click X
   * @param {number} y - Click Y
   */
  handleClick(x, y) {
    if (!this.stationOpen) return;
    
    const canvas = this.game ? this.game.canvas : { width: 640, height: 480 };
    
    // Check close button
    if (x > canvas.width - 50 && x < canvas.width - 10 && y > 10 && y < 40) {
      this.closeStation();
      return;
    }
    
    // Check craft button
    if (this.previewWeapon) {
      if (x > canvas.width / 2 - 60 && x < canvas.width / 2 + 60 &&
          y > canvas.height - 60 && y < canvas.height - 20) {
        this.craftWeapon();
        return;
      }
    }
    
    // Check parts selection (simplified - would need proper hit detection)
    // This would be expanded with proper UI interaction
  }
  
  /**
   * Save state to localStorage
   */
  saveState() {
    try {
      const state = {
        inventory: this.inventory,
        customWeapons: this.customWeapons
      };
      localStorage.setItem('craftingSystemState', JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save crafting state:', e);
    }
  }
  
  /**
   * Load state from localStorage
   */
  loadState() {
    try {
      const saved = localStorage.getItem('craftingSystemState');
      if (saved) {
        const state = JSON.parse(saved);
        this.inventory = state.inventory || this.inventory;
        this.customWeapons = state.customWeapons || [];
      }
    } catch (e) {
      console.warn('Failed to load crafting state:', e);
    }
  }
}
