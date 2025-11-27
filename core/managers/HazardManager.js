/**
 * HazardManager - Manages all environmental hazards in the game
 * Coordinates hazard spawning, updates, and collision detection
 */
class HazardManager {
  /**
   * Create a new HazardManager
   */
  constructor() {
    this.hazards = [];
    this.hazardProjectiles = [];
  }

  /**
   * Clear all hazards
   */
  clear() {
    this.hazards = [];
    this.hazardProjectiles = [];
  }

  /**
   * Add a hazard to the manager
   * @param {Hazard} hazard - The hazard to add
   */
  addHazard(hazard) {
    this.hazards.push(hazard);
  }

  /**
   * Remove a hazard from the manager
   * @param {Hazard} hazard - The hazard to remove
   */
  removeHazard(hazard) {
    const index = this.hazards.indexOf(hazard);
    if (index > -1) {
      this.hazards.splice(index, 1);
    }
  }

  /**
   * Spawn hazards for a level
   * @param {string} mode - Game mode (campaign/survival)
   * @param {number} level - Current level number
   * @param {number} wave - Current wave (for survival)
   * @param {number} groundLevel - Ground Y position
   * @param {number} worldWidth - World width
   */
  spawnHazards(mode, level, wave, groundLevel, worldWidth) {
    this.clear();
    
    // Determine hazard density based on difficulty and level
    let hazardDensity = 0.3; // Base density
    
    if (mode === 'campaign') {
      hazardDensity = 0.2 + (level * 0.05); // Increase with level
      this.spawnCampaignHazards(level, groundLevel, worldWidth);
    } else if (mode === 'survival') {
      hazardDensity = 0.1 + (wave * 0.02); // Increase with wave
      this.spawnSurvivalHazards(wave, groundLevel, worldWidth);
    }
  }

  /**
   * Spawn hazards for campaign mode
   * @param {number} level - Current level
   * @param {number} groundLevel - Ground Y position
   * @param {number} worldWidth - World width
   */
  spawnCampaignHazards(level, groundLevel, worldWidth) {
    // Level-specific hazard configurations
    const hazardConfigs = [
      // Level 1: Basic Training - No hazards (tutorial)
      [],
      
      // Level 2: First Contact - Introduce barrels
      [
        { type: 'barrel', x: 600, y: groundLevel - 40 },
        { type: 'barrel', x: 1200, y: groundLevel - 40 },
      ],
      
      // Level 3: Boss Arena - Turrets and barrels
      [
        { type: 'turret', x: 300, y: groundLevel - 80 },
        { type: 'turret', x: 1700, y: groundLevel - 80 },
        { type: 'barrel', x: 800, y: groundLevel - 40 },
        { type: 'barrel', x: 1200, y: groundLevel - 40 },
      ],
      
      // Level 4: Heavy Assault - Spike traps
      [
        { type: 'spike', x: 400, y: groundLevel - 16 },
        { type: 'spike', x: 800, y: groundLevel - 16 },
        { type: 'spike', x: 1200, y: groundLevel - 16 },
        { type: 'barrel', x: 600, y: groundLevel - 40 },
        { type: 'barrel', x: 1000, y: groundLevel - 40 },
      ],
      
      // Level 5: Sniper Alley - Turrets and lasers
      [
        { type: 'turret', x: 400, y: groundLevel - 200 },
        { type: 'turret', x: 1000, y: groundLevel - 250 },
        { type: 'laser', x: 300, y: groundLevel - 100, length: 150, horizontal: true },
        { type: 'laser', x: 900, y: groundLevel - 150, length: 150, horizontal: true, pattern: 'pulsing' },
      ],
      
      // Level 6: Boss Arena - Mixed hazards
      [
        { type: 'turret', x: 200, y: groundLevel - 150 },
        { type: 'turret', x: 1800, y: groundLevel - 150 },
        { type: 'barrel', x: 500, y: groundLevel - 40 },
        { type: 'barrel', x: 900, y: groundLevel - 40 },
        { type: 'barrel', x: 1300, y: groundLevel - 40 },
        { type: 'spike', x: 600, y: groundLevel - 16 },
        { type: 'spike', x: 1400, y: groundLevel - 16 },
      ],
      
      // Level 7: Urban Warfare - Toxic and lava zones
      [
        { type: 'toxic', x: 350, y: groundLevel - 20, width: 120 },
        { type: 'toxic', x: 900, y: groundLevel - 20, width: 100 },
        { type: 'lava', x: 600, y: groundLevel - 20, width: 80 },
        { type: 'barrel', x: 750, y: groundLevel - 40 },
        { type: 'barrel', x: 1100, y: groundLevel - 40 },
        { type: 'turret', x: 500, y: groundLevel - 180 },
      ],
      
      // Level 8: Industrial Complex - Complex hazard mix
      [
        { type: 'spike', x: 300, y: groundLevel - 16 },
        { type: 'spike', x: 700, y: groundLevel - 16 },
        { type: 'spike', x: 1100, y: groundLevel - 16 },
        { type: 'laser', x: 450, y: groundLevel - 200, length: 200, horizontal: true, pattern: 'moving' },
        { type: 'laser', x: 850, y: groundLevel - 250, length: 250, horizontal: true, pattern: 'pulsing' },
        { type: 'turret', x: 600, y: groundLevel - 300 },
        { type: 'turret', x: 1200, y: groundLevel - 280 },
        { type: 'toxic', x: 1300, y: groundLevel - 20, width: 150 },
      ],
      
      // Level 9: Elite Commander Boss - Defensive hazards
      [
        { type: 'turret', x: 250, y: groundLevel - 200 },
        { type: 'turret', x: 1750, y: groundLevel - 200 },
        { type: 'turret', x: 1000, y: groundLevel - 350 },
        { type: 'barrel', x: 400, y: groundLevel - 40 },
        { type: 'barrel', x: 700, y: groundLevel - 40 },
        { type: 'barrel', x: 1300, y: groundLevel - 40 },
        { type: 'barrel', x: 1600, y: groundLevel - 40 },
        { type: 'laser', x: 500, y: groundLevel - 150, length: 300, horizontal: true, pattern: 'pulsing' },
        { type: 'laser', x: 1200, y: groundLevel - 150, length: 300, horizontal: true, pattern: 'pulsing' },
      ],
      
      // Level 10: Final Boss - Maximum hazards
      [
        { type: 'turret', x: 200, y: groundLevel - 150 },
        { type: 'turret', x: 1800, y: groundLevel - 150 },
        { type: 'turret', x: 500, y: groundLevel - 300 },
        { type: 'turret', x: 1500, y: groundLevel - 300 },
        { type: 'barrel', x: 350, y: groundLevel - 40 },
        { type: 'barrel', x: 650, y: groundLevel - 40 },
        { type: 'barrel', x: 1050, y: groundLevel - 40 },
        { type: 'barrel', x: 1350, y: groundLevel - 40 },
        { type: 'barrel', x: 1650, y: groundLevel - 40 },
        { type: 'spike', x: 400, y: groundLevel - 16 },
        { type: 'spike', x: 800, y: groundLevel - 16 },
        { type: 'spike', x: 1200, y: groundLevel - 16 },
        { type: 'spike', x: 1600, y: groundLevel - 16 },
        { type: 'lava', x: 550, y: groundLevel - 20, width: 100 },
        { type: 'lava', x: 1450, y: groundLevel - 20, width: 100 },
        { type: 'laser', x: 700, y: groundLevel - 250, length: 400, horizontal: true, pattern: 'pulsing' },
      ],
    ];
    
    // Get config for current level (0-indexed)
    const levelIndex = Math.min(level - 1, hazardConfigs.length - 1);
    const config = hazardConfigs[levelIndex] || [];
    
    // Spawn hazards based on config
    config.forEach(hazardData => {
      this.spawnHazardFromConfig(hazardData, groundLevel);
    });
  }

  /**
   * Spawn hazards for survival mode
   * @param {number} wave - Current wave
   * @param {number} groundLevel - Ground Y position
   * @param {number} worldWidth - World width
   */
  spawnSurvivalHazards(wave, groundLevel, worldWidth) {
    // Clear spawn area near player
    const safeZoneStart = 0;
    const safeZoneEnd = 300;
    
    // Determine which hazard types are available based on wave
    const availableHazards = ['barrel'];
    
    if (wave >= 2) availableHazards.push('spike');
    if (wave >= 4) availableHazards.push('turret');
    if (wave >= 5) availableHazards.push('toxic');
    if (wave >= 6) availableHazards.push('laser');
    if (wave >= 8) availableHazards.push('lava');
    
    // Calculate number of hazards
    const hazardCount = Math.min(3 + Math.floor(wave / 2), 12);
    
    // Spawn random hazards
    for (let i = 0; i < hazardCount; i++) {
      const type = availableHazards[Math.floor(Math.random() * availableHazards.length)];
      let x = safeZoneEnd + 100 + Math.random() * (worldWidth - safeZoneEnd - 200);
      
      // Ensure minimum spacing
      let validPosition = false;
      let attempts = 0;
      while (!validPosition && attempts < 10) {
        validPosition = true;
        for (const hazard of this.hazards) {
          if (Math.abs(hazard.x - x) < 100) {
            validPosition = false;
            x = safeZoneEnd + 100 + Math.random() * (worldWidth - safeZoneEnd - 200);
            break;
          }
        }
        attempts++;
      }
      
      const hazardData = { type, x, y: groundLevel };
      
      // Add random patterns for lasers
      if (type === 'laser') {
        hazardData.y = groundLevel - 50 - Math.random() * 150;
        hazardData.length = 100 + Math.random() * 150;
        hazardData.horizontal = true;
        hazardData.pattern = ['static', 'pulsing', 'moving'][Math.floor(Math.random() * 3)];
      } else if (type === 'toxic' || type === 'lava') {
        hazardData.y = groundLevel - 20;
        hazardData.width = 80 + Math.random() * 80;
      } else if (type === 'spike') {
        hazardData.y = groundLevel - 16;
      } else if (type === 'turret') {
        hazardData.y = groundLevel - 60 - Math.random() * 100;
      } else if (type === 'barrel') {
        hazardData.y = groundLevel - 40;
      }
      
      this.spawnHazardFromConfig(hazardData, groundLevel);
    }
  }

  /**
   * Spawn a hazard from configuration data
   * @param {Object} config - Hazard configuration
   * @param {number} groundLevel - Ground Y position
   */
  spawnHazardFromConfig(config, groundLevel) {
    let hazard;
    
    switch (config.type) {
      case 'turret':
        hazard = new Turret(config.x, config.y);
        break;
        
      case 'barrel':
        hazard = new ExplosiveBarrel(config.x, config.y);
        break;
        
      case 'spike':
        hazard = new SpikeTrap(config.x, config.y);
        break;
        
      case 'laser':
        hazard = new LaserGrid(
          config.x, 
          config.y, 
          config.length || 100, 
          config.horizontal !== false
        );
        if (config.pattern) {
          hazard.setPattern(config.pattern);
        }
        break;
        
      case 'toxic':
        hazard = new ToxicZone(config.x, config.y, config.width || 100, config.height || 20);
        break;
        
      case 'lava':
        hazard = new LavaZone(config.x, config.y, config.width || 100, config.height || 20);
        break;
        
      default:
        console.warn('Unknown hazard type:', config.type);
        return;
    }
    
    this.addHazard(hazard);
  }

  /**
   * Update all hazards
   * @param {number} deltaTime - Time since last update
   * @param {number} currentTime - Current game time
   * @param {PlayerCharacter} player - The player
   * @param {Array} enemies - Array of enemies
   */
  update(deltaTime, currentTime, player, enemies) {
    // Update hazards and collect projectiles
    this.hazards = this.hazards.filter(hazard => {
      if (!hazard.active) return false;
      
      // Update hazard
      if (hazard.hazardType === 'turret') {
        const projectile = hazard.update(deltaTime, currentTime, player, enemies);
        if (projectile) {
          this.hazardProjectiles.push(projectile);
        }
      } else {
        hazard.update(deltaTime, currentTime);
      }
      
      return hazard.active;
    });
    
    // Update hazard projectiles
    this.hazardProjectiles = this.hazardProjectiles.filter(proj => {
      if (!proj.active) return false;
      proj.update(deltaTime);
      return proj.active;
    });
    
    // Check collisions with player and enemies
    this.checkCollisions(currentTime, player, enemies);
  }

  /**
   * Check collisions between hazards and entities
   * @param {number} currentTime - Current game time
   * @param {PlayerCharacter} player - The player
   * @param {Array} enemies - Array of enemies
   */
  checkCollisions(currentTime, player, enemies) {
    // Check each hazard
    this.hazards.forEach(hazard => {
      if (!hazard.active || !hazard.isActive) return;
      
      // Skip non-damaging hazards
      if (hazard.hazardType === 'barrel' && !hazard.aboutToExplode) return;
      
      // Check player collision
      if (player && player.active && !player.invulnerable) {
        if (this.checkEntityCollision(hazard, player)) {
          if (hazard.hazardType === 'toxic') {
            hazard.applyEffects(player, currentTime);
          } else if (hazard.hazardType !== 'turret') {
            hazard.applyDamage(player, currentTime);
          }
        } else if (hazard.hazardType === 'toxic') {
          hazard.removeEffects(player);
        }
      }
      
      // Check enemy collisions (for hazards that can damage enemies)
      if (hazard.hazardType !== 'turret') {
        enemies.forEach(enemy => {
          if (enemy.active && enemy.health > 0) {
            if (this.checkEntityCollision(hazard, enemy)) {
              if (hazard.hazardType === 'toxic') {
                hazard.applyEffects(enemy, currentTime);
              } else {
                hazard.applyDamage(enemy, currentTime);
              }
            } else if (hazard.hazardType === 'toxic') {
              hazard.removeEffects(enemy);
            }
          }
        });
      }
    });
    
    // Check hazard projectiles
    this.hazardProjectiles.forEach(proj => {
      if (!proj.active) return;
      
      // Check player collision
      if (player && player.active && !player.invulnerable) {
        if (proj.collidesWith(player)) {
          player.takeDamage(proj.damage, currentTime);
          proj.destroy();
          
          // Create hit effect
          if (window.game && window.game.particleSystem) {
            window.game.particleSystem.createExplosion(
              player.x + player.width / 2,
              player.y + player.height / 2,
              10,
              '#ff0000'
            );
          }
        }
      }
    });
  }

  /**
   * Check if entity collides with hazard
   * @param {Hazard} hazard - The hazard
   * @param {Entity} entity - The entity
   * @returns {boolean} Whether collision occurred
   */
  checkEntityCollision(hazard, entity) {
    return hazard.collidesWith(entity);
  }

  /**
   * Handle projectile hitting a hazard
   * @param {Projectile} projectile - The projectile
   */
  handleProjectileHit(projectile) {
    this.hazards.forEach(hazard => {
      if (hazard.destructible && hazard.active && projectile.collidesWith(hazard)) {
        hazard.takeDamage(projectile.damage);
        projectile.destroy();
      }
    });
  }

  /**
   * Render all hazards
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    // Render hazards
    this.hazards.forEach(hazard => {
      if (hazard.active) {
        hazard.render(ctx);
      }
    });
    
    // Render hazard projectiles
    this.hazardProjectiles.forEach(proj => {
      if (proj.active) {
        proj.render(ctx);
      }
    });
  }

  /**
   * Get hazards for minimap display
   * @returns {Array} Array of hazard positions and types
   */
  getMinimapData() {
    return this.hazards.filter(h => h.active).map(h => ({
      x: h.x + h.width / 2,
      y: h.y + h.height / 2,
      type: h.hazardType,
      color: this.getHazardColor(h.hazardType)
    }));
  }

  /**
   * Get color for hazard type
   * @param {string} type - Hazard type
   * @returns {string} Color code
   */
  getHazardColor(type) {
    switch (type) {
      case 'turret': return '#666666';
      case 'barrel': return '#ff6600';
      case 'spike': return '#888888';
      case 'laser': return '#ff0000';
      case 'toxic': return '#44ff44';
      case 'lava': return '#ff4400';
      default: return '#ffff00';
    }
  }
}
