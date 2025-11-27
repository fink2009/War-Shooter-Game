/**
 * AttachmentSystem - Manages weapon attachments
 * Handles attachment purchases, equipping, and stat modifications
 */
class AttachmentSystem {
  constructor() {
    this.storageKey = 'warShooterAttachments';
    // Map of weapon name -> array of attached attachments
    this.equippedAttachments = {};
    // Array of owned but not equipped attachments
    this.inventory = [];
    this.load();
  }

  /**
   * Get attachment configuration from GameConfig
   * @returns {Object} Attachment configuration
   */
  getConfig() {
    return typeof GameConfig !== 'undefined' && GameConfig.ATTACHMENTS ? 
      GameConfig.ATTACHMENTS : {
        SCOPE: { cost: 400, rangeBonus: 0.5, zoomLevel: 1.5 },
        EXTENDED_MAG: { cost: 300, capacityBonus: 0.5 },
        SUPPRESSOR: { cost: 500, damagePenalty: 0.1, noiseReduction: 0.5 },
        LASER_SIGHT: { cost: 250, accuracyBonus: 0.15 },
        RAPID_BOLT: { cost: 350, fireRateBonus: 0.25, damagePenalty: 0.05 },
        BAYONET: { cost: 200, meleeDamage: 15 },
        SHARPENING: { cost: 300, damageBonus: 0.3 },
        LIGHTWEIGHT: { cost: 250, speedBonus: 0.2, damagePenalty: 5 },
        maxSlots: 3,
        dropChance: 0.05
      };
  }

  /**
   * Load attachments from localStorage
   */
  load() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.equippedAttachments = data.equipped || {};
        this.inventory = data.inventory || [];
      }
    } catch (e) {
      console.warn('AttachmentSystem: Failed to load attachments', e);
    }
  }

  /**
   * Save attachments to localStorage
   */
  save() {
    try {
      const data = {
        equipped: this.equippedAttachments,
        inventory: this.inventory
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn('AttachmentSystem: Failed to save attachments', e);
    }
  }

  /**
   * Get all available attachment types
   * @returns {Array} Array of attachment type info
   */
  getAttachmentTypes() {
    const config = this.getConfig();
    const ranged = [
      { id: 'SCOPE', name: 'Scope', description: '+50% range, 1.5x zoom when aiming', isRanged: true },
      { id: 'EXTENDED_MAG', name: 'Extended Magazine', description: '+50% ammo capacity', isRanged: true },
      { id: 'SUPPRESSOR', name: 'Suppressor', description: 'Silent shots, -10% damage', isRanged: true },
      { id: 'LASER_SIGHT', name: 'Laser Sight', description: '+15% accuracy, red laser beam', isRanged: true },
      { id: 'RAPID_BOLT', name: 'Rapid Bolt', description: '+25% fire rate, -5% damage', isRanged: true },
      { id: 'BAYONET', name: 'Bayonet', description: 'Melee attack on gun, +15 damage', isRanged: true }
    ];
    
    const melee = [
      { id: 'SHARPENING', name: 'Sharpening Stone', description: '+30% damage, blood drip effect', isMelee: true },
      { id: 'LIGHTWEIGHT', name: 'Lightweight Grip', description: '+20% swing speed, -5 damage', isMelee: true }
    ];

    return [...ranged, ...melee].map(att => ({
      ...att,
      cost: config[att.id]?.cost || 0,
      config: config[att.id]
    }));
  }

  /**
   * Get maximum attachment slots per weapon
   * @returns {number} Max slots
   */
  getMaxSlots() {
    return this.getConfig().maxSlots || 3;
  }

  /**
   * Check if an attachment type is compatible with a weapon
   * @param {string} attachmentId - Attachment type ID
   * @param {Weapon} weapon - The weapon to check
   * @returns {boolean} Whether compatible
   */
  isCompatible(attachmentId, weapon) {
    const attachTypes = this.getAttachmentTypes();
    const attachment = attachTypes.find(a => a.id === attachmentId);
    
    if (!attachment) return false;
    
    if (weapon.isMelee) {
      return attachment.isMelee === true;
    } else {
      return attachment.isRanged === true;
    }
  }

  /**
   * Get attachments equipped on a weapon
   * @param {string} weaponName - Name of the weapon
   * @returns {Array} Array of attachment IDs
   */
  getEquippedAttachments(weaponName) {
    return this.equippedAttachments[weaponName] || [];
  }

  /**
   * Get number of slots used on a weapon
   * @param {string} weaponName - Name of the weapon
   * @returns {number} Slots used
   */
  getSlotsUsed(weaponName) {
    return this.getEquippedAttachments(weaponName).length;
  }

  /**
   * Check if a weapon has available slots
   * @param {string} weaponName - Name of the weapon
   * @returns {boolean} Whether slots are available
   */
  hasAvailableSlots(weaponName) {
    return this.getSlotsUsed(weaponName) < this.getMaxSlots();
  }

  /**
   * Check if player owns an attachment
   * @param {string} attachmentId - Attachment type ID
   * @returns {boolean} Whether owned
   */
  ownsAttachment(attachmentId) {
    return this.inventory.includes(attachmentId) ||
      Object.values(this.equippedAttachments).some(arr => arr.includes(attachmentId));
  }

  /**
   * Purchase an attachment
   * @param {string} attachmentId - Attachment type ID
   * @param {CurrencySystem} currencySystem - Reference to currency system
   * @returns {boolean} Whether purchase was successful
   */
  purchase(attachmentId, currencySystem) {
    const config = this.getConfig();
    const attachmentConfig = config[attachmentId];
    
    if (!attachmentConfig || !currencySystem) {
      return false;
    }
    
    const cost = attachmentConfig.cost;
    if (!currencySystem.spend(cost)) {
      return false;
    }
    
    this.inventory.push(attachmentId);
    this.save();
    
    return true;
  }

  /**
   * Equip an attachment to a weapon
   * @param {string} attachmentId - Attachment type ID
   * @param {string} weaponName - Name of the weapon
   * @param {Weapon} weapon - The actual weapon object
   * @returns {boolean} Whether equip was successful
   */
  equip(attachmentId, weaponName, weapon) {
    // Check if owned in inventory
    const inventoryIndex = this.inventory.indexOf(attachmentId);
    if (inventoryIndex === -1) {
      return false;
    }
    
    // Check compatibility
    if (!this.isCompatible(attachmentId, weapon)) {
      return false;
    }
    
    // Check if slots available
    if (!this.hasAvailableSlots(weaponName)) {
      return false;
    }
    
    // Check if already equipped on this weapon
    const equipped = this.getEquippedAttachments(weaponName);
    if (equipped.includes(attachmentId)) {
      return false;
    }
    
    // Remove from inventory and add to equipped
    this.inventory.splice(inventoryIndex, 1);
    
    if (!this.equippedAttachments[weaponName]) {
      this.equippedAttachments[weaponName] = [];
    }
    this.equippedAttachments[weaponName].push(attachmentId);
    
    // Apply attachment stats to weapon
    this.applyAttachment(attachmentId, weapon);
    
    this.save();
    return true;
  }

  /**
   * Unequip an attachment from a weapon
   * @param {string} attachmentId - Attachment type ID
   * @param {string} weaponName - Name of the weapon
   * @param {Weapon} weapon - The actual weapon object
   * @returns {boolean} Whether unequip was successful
   */
  unequip(attachmentId, weaponName, weapon) {
    const equipped = this.getEquippedAttachments(weaponName);
    const index = equipped.indexOf(attachmentId);
    
    if (index === -1) {
      return false;
    }
    
    // Remove from equipped and add back to inventory
    this.equippedAttachments[weaponName].splice(index, 1);
    this.inventory.push(attachmentId);
    
    // Remove attachment stats from weapon
    this.removeAttachment(attachmentId, weapon);
    
    this.save();
    return true;
  }

  /**
   * Apply attachment stats to a weapon
   * @param {string} attachmentId - Attachment type ID
   * @param {Weapon} weapon - The weapon to modify
   */
  applyAttachment(attachmentId, weapon) {
    const config = this.getConfig()[attachmentId];
    if (!config || !weapon) return;

    // Store original values if not already stored
    weapon.originalStats = weapon.originalStats || {
      damage: weapon.damage,
      ammoCapacity: weapon.ammoCapacity,
      fireRate: weapon.fireRate,
      projectileSpeed: weapon.projectileSpeed
    };

    switch (attachmentId) {
      case 'SCOPE':
        weapon.hasScope = true;
        weapon.zoomLevel = config.zoomLevel;
        weapon.projectileSpeed *= (1 + config.rangeBonus);
        break;
        
      case 'EXTENDED_MAG':
        weapon.ammoCapacity = Math.floor(weapon.ammoCapacity * (1 + config.capacityBonus));
        weapon.currentAmmo = weapon.ammoCapacity;
        break;
        
      case 'SUPPRESSOR':
        weapon.hasSuppressor = true;
        weapon.noiseReduction = config.noiseReduction;
        weapon.damage = Math.floor(weapon.damage * (1 - config.damagePenalty));
        break;
        
      case 'LASER_SIGHT':
        weapon.hasLaserSight = true;
        weapon.accuracyBonus = config.accuracyBonus;
        break;
        
      case 'RAPID_BOLT':
        weapon.fireRate = Math.floor(weapon.fireRate * (1 - config.fireRateBonus));
        weapon.damage = Math.floor(weapon.damage * (1 - config.damagePenalty));
        break;
        
      case 'BAYONET':
        weapon.hasBayonet = true;
        weapon.bayonetDamage = config.meleeDamage;
        break;
        
      case 'SHARPENING':
        weapon.hasSharpening = true;
        weapon.damage = Math.floor(weapon.damage * (1 + config.damageBonus));
        break;
        
      case 'LIGHTWEIGHT':
        weapon.hasLightweight = true;
        weapon.fireRate = Math.floor(weapon.fireRate * (1 - config.speedBonus));
        weapon.damage = Math.max(1, weapon.damage - config.damagePenalty);
        break;
    }

    // Mark weapon as having attachments
    weapon.attachedMods = weapon.attachedMods || [];
    if (!weapon.attachedMods.includes(attachmentId)) {
      weapon.attachedMods.push(attachmentId);
    }
  }

  /**
   * Remove attachment stats from a weapon
   * @param {string} attachmentId - Attachment type ID
   * @param {Weapon} weapon - The weapon to modify
   */
  removeAttachment(attachmentId, weapon) {
    if (!weapon || !weapon.originalStats) return;

    const config = this.getConfig()[attachmentId];
    if (!config) return;

    // Reset to original values based on attachment type
    switch (attachmentId) {
      case 'SCOPE':
        weapon.hasScope = false;
        weapon.zoomLevel = 1;
        weapon.projectileSpeed = weapon.originalStats.projectileSpeed;
        break;
        
      case 'EXTENDED_MAG':
        weapon.ammoCapacity = weapon.originalStats.ammoCapacity;
        break;
        
      case 'SUPPRESSOR':
        weapon.hasSuppressor = false;
        weapon.noiseReduction = 0;
        weapon.damage = weapon.originalStats.damage;
        break;
        
      case 'LASER_SIGHT':
        weapon.hasLaserSight = false;
        weapon.accuracyBonus = 0;
        break;
        
      case 'RAPID_BOLT':
        weapon.fireRate = weapon.originalStats.fireRate;
        weapon.damage = weapon.originalStats.damage;
        break;
        
      case 'BAYONET':
        weapon.hasBayonet = false;
        weapon.bayonetDamage = 0;
        break;
        
      case 'SHARPENING':
        weapon.hasSharpening = false;
        weapon.damage = weapon.originalStats.damage;
        break;
        
      case 'LIGHTWEIGHT':
        weapon.hasLightweight = false;
        weapon.fireRate = weapon.originalStats.fireRate;
        weapon.damage = weapon.originalStats.damage;
        break;
    }

    // Remove from attached mods list
    if (weapon.attachedMods) {
      const index = weapon.attachedMods.indexOf(attachmentId);
      if (index > -1) {
        weapon.attachedMods.splice(index, 1);
      }
    }
  }

  /**
   * Apply all equipped attachments to a weapon
   * @param {string} weaponName - Name of the weapon
   * @param {Weapon} weapon - The weapon object
   */
  applyAllAttachments(weaponName, weapon) {
    const equipped = this.getEquippedAttachments(weaponName);
    equipped.forEach(attachmentId => {
      this.applyAttachment(attachmentId, weapon);
    });
  }

  /**
   * Check if enemy should drop an attachment
   * @param {Object} enemy - The defeated enemy
   * @returns {string|null} Attachment ID to drop, or null
   */
  checkDrop(enemy) {
    const config = this.getConfig();
    const dropChance = config.dropChance || 0.05;
    
    // Only elites have a chance to drop attachments
    if (!enemy.isElite && !enemy.isMiniBoss && !enemy.isBoss) {
      return null;
    }
    
    // Higher chance for bosses and mini-bosses
    let actualChance = dropChance;
    if (enemy.isBoss) {
      actualChance = 0.5;
    } else if (enemy.isMiniBoss) {
      actualChance = 0.25;
    }
    
    if (Math.random() > actualChance) {
      return null;
    }
    
    // Random attachment type
    const types = this.getAttachmentTypes();
    const attachment = types[Math.floor(Math.random() * types.length)];
    return attachment.id;
  }

  /**
   * Add attachment to inventory (from drop)
   * @param {string} attachmentId - Attachment type ID
   */
  addToInventory(attachmentId) {
    this.inventory.push(attachmentId);
    this.save();
  }

  /**
   * Get inventory attachments
   * @returns {Array} Array of attachment IDs in inventory
   */
  getInventory() {
    return [...this.inventory];
  }

  /**
   * Get stat preview comparing before/after attachment
   * @param {string} attachmentId - Attachment type ID
   * @param {Weapon} weapon - The weapon
   * @returns {Object} Preview stats
   */
  getStatPreview(attachmentId, weapon) {
    const config = this.getConfig()[attachmentId];
    if (!config || !weapon) return null;

    const preview = {
      damage: { before: weapon.damage, after: weapon.damage },
      fireRate: { before: weapon.fireRate, after: weapon.fireRate },
      ammoCapacity: { before: weapon.ammoCapacity, after: weapon.ammoCapacity },
      range: { before: weapon.projectileSpeed, after: weapon.projectileSpeed }
    };

    switch (attachmentId) {
      case 'SCOPE':
        preview.range.after = Math.floor(weapon.projectileSpeed * (1 + config.rangeBonus));
        break;
      case 'EXTENDED_MAG':
        preview.ammoCapacity.after = Math.floor(weapon.ammoCapacity * (1 + config.capacityBonus));
        break;
      case 'SUPPRESSOR':
        preview.damage.after = Math.floor(weapon.damage * (1 - config.damagePenalty));
        break;
      case 'RAPID_BOLT':
        preview.fireRate.after = Math.floor(weapon.fireRate * (1 - config.fireRateBonus));
        preview.damage.after = Math.floor(weapon.damage * (1 - config.damagePenalty));
        break;
      case 'SHARPENING':
        preview.damage.after = Math.floor(weapon.damage * (1 + config.damageBonus));
        break;
      case 'LIGHTWEIGHT':
        preview.fireRate.after = Math.floor(weapon.fireRate * (1 - config.speedBonus));
        preview.damage.after = Math.max(1, weapon.damage - config.damagePenalty);
        break;
    }

    return preview;
  }

  /**
   * Reset all attachments (for debugging/testing)
   */
  reset() {
    this.equippedAttachments = {};
    this.inventory = [];
    this.save();
  }
}
