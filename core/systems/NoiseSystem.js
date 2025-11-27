/**
 * NoiseSystem - Manages sound propagation for stealth mechanics
 * Handles noise generation, detection, and enemy awareness
 */
class NoiseSystem {
  constructor() {
    this.noiseEvents = [];
    this.maxNoiseEvents = 50;
    this.noiseDecayRate = 100; // ms before noise fades
  }

  /**
   * Get stealth configuration from GameConfig
   * @returns {Object} Stealth configuration
   */
  getConfig() {
    return typeof GameConfig !== 'undefined' && GameConfig.STEALTH ? 
      GameConfig.STEALTH : {
        crouchSpeedMultiplier: 0.5,
        crouchDetectionMultiplier: 0.5,
        backstabMultiplier: 3,
        backstabAngle: 120,
        backstabInstantKillThreshold: 100,
        noiseRanges: {
          gunshot: 300,
          suppressedGunshot: 150,
          explosion: 500,
          running: 100,
          melee: 50,
          crouch: 0
        },
        awarenessTransitions: {
          toSuspicious: 2,
          toAlert: 1,
          toCombat: 0.5,
          fallbackToSuspicious: 10,
          fallbackToUnaware: 5
        }
      };
  }

  /**
   * Create a noise event at a position
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} type - Type of noise (gunshot, suppressedGunshot, explosion, running, melee, crouch)
   * @param {Object} source - Entity that caused the noise
   */
  createNoise(x, y, type, source = null) {
    const config = this.getConfig();
    const range = config.noiseRanges[type] || 0;
    
    if (range <= 0) return;
    
    const noise = {
      x: x,
      y: y,
      type: type,
      range: range,
      source: source,
      timestamp: performance.now(),
      active: true
    };
    
    this.noiseEvents.push(noise);
    
    // Limit noise events
    if (this.noiseEvents.length > this.maxNoiseEvents) {
      this.noiseEvents.shift();
    }
  }

  /**
   * Create gunshot noise (checks for suppressor)
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Weapon} weapon - The weapon that fired
   * @param {Object} source - Entity that fired
   */
  createGunshotNoise(x, y, weapon, source = null) {
    const type = weapon && weapon.hasSuppressor ? 'suppressedGunshot' : 'gunshot';
    this.createNoise(x, y, type, source);
  }

  /**
   * Update noise events and propagate to enemies
   * @param {number} deltaTime - Time since last update
   * @param {Array} enemies - Array of enemy entities
   */
  update(deltaTime, enemies) {
    const currentTime = performance.now();
    
    // Process each noise event
    this.noiseEvents.forEach(noise => {
      if (!noise.active) return;
      
      // Check if noise has decayed
      if (currentTime - noise.timestamp > this.noiseDecayRate) {
        noise.active = false;
        return;
      }
      
      // Alert nearby enemies
      if (enemies) {
        enemies.forEach(enemy => {
          if (!enemy.active || enemy === noise.source) return;
          
          const dx = enemy.x + enemy.width / 2 - noise.x;
          const dy = enemy.y + enemy.height / 2 - noise.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist <= noise.range) {
            this.alertEnemy(enemy, noise);
          }
        });
      }
    });
    
    // Clean up inactive noise events
    this.noiseEvents = this.noiseEvents.filter(n => n.active);
  }

  /**
   * Alert an enemy to a noise
   * @param {Object} enemy - The enemy to alert
   * @param {Object} noise - The noise event
   */
  alertEnemy(enemy, noise) {
    if (!enemy.awarenessState) {
      enemy.awarenessState = 'unaware';
      enemy.awarenessLevel = 0;
    }
    
    // Don't alert if already in combat
    if (enemy.awarenessState === 'combat') return;
    
    // Calculate alert level based on noise type and distance
    const dx = enemy.x + enemy.width / 2 - noise.x;
    const dy = enemy.y + enemy.height / 2 - noise.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const proximity = 1 - (dist / noise.range);
    
    // Different noise types cause different alert levels
    let alertIncrease = 0;
    switch (noise.type) {
      case 'explosion':
        alertIncrease = 1.0 * proximity;
        enemy.awarenessState = 'alert';
        break;
      case 'gunshot':
        alertIncrease = 0.8 * proximity;
        if (enemy.awarenessState === 'unaware') {
          enemy.awarenessState = 'alert';
        }
        break;
      case 'suppressedGunshot':
        alertIncrease = 0.3 * proximity;
        if (enemy.awarenessState === 'unaware' && proximity > 0.5) {
          enemy.awarenessState = 'suspicious';
        }
        break;
      case 'running':
        alertIncrease = 0.4 * proximity;
        if (enemy.awarenessState === 'unaware') {
          enemy.awarenessState = 'suspicious';
        }
        break;
      case 'melee':
        alertIncrease = 0.5 * proximity;
        if (enemy.awarenessState === 'unaware') {
          enemy.awarenessState = 'suspicious';
        }
        break;
    }
    
    enemy.awarenessLevel = Math.min(1.0, (enemy.awarenessLevel || 0) + alertIncrease);
    
    // Store the noise source location for investigation
    if (noise.source) {
      enemy.lastNoiseLocation = { x: noise.x, y: noise.y };
      enemy.investigateTimer = 5000; // 5 seconds to investigate
    }
  }

  /**
   * Check if a position is within hearing range of any enemy
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} radius - Noise radius
   * @param {Array} enemies - Array of enemies
   * @returns {Array} Enemies that can hear
   */
  getEnemiesInRange(x, y, radius, enemies) {
    if (!enemies) return [];
    
    return enemies.filter(enemy => {
      if (!enemy.active) return false;
      
      const dx = enemy.x + enemy.width / 2 - x;
      const dy = enemy.y + enemy.height / 2 - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      return dist <= radius;
    });
  }

  /**
   * Calculate detection range modifier for stealth
   * @param {Object} player - The player entity
   * @returns {number} Detection range multiplier
   */
  getDetectionModifier(player) {
    if (!player) return 1.0;
    
    const config = this.getConfig();
    let modifier = 1.0;
    
    // Crouching reduces detection
    if (player.isCrouching) {
      modifier *= config.crouchDetectionMultiplier;
    }
    
    return modifier;
  }

  /**
   * Check if attack qualifies as a backstab
   * @param {Object} attacker - The attacking entity
   * @param {Object} target - The target entity
   * @returns {boolean} Whether this is a backstab
   */
  isBackstab(attacker, target) {
    if (!attacker || !target) return false;
    
    const config = this.getConfig();
    
    // Target must be unaware
    if (target.awarenessState && target.awarenessState !== 'unaware') {
      return false;
    }
    
    // Calculate angle between attacker and target's facing direction
    const dx = attacker.x - target.x;
    const targetFacing = target.facing || 1;
    
    // Attack is from behind if attacker is opposite to target's facing direction
    const isFromBehind = (targetFacing > 0 && dx < 0) || (targetFacing < 0 && dx > 0);
    
    return isFromBehind;
  }

  /**
   * Calculate backstab damage
   * @param {number} baseDamage - Base damage amount
   * @param {Object} target - The target entity
   * @returns {Object} { damage, isInstantKill }
   */
  calculateBackstabDamage(baseDamage, target) {
    const config = this.getConfig();
    const multipliedDamage = Math.floor(baseDamage * config.backstabMultiplier);
    
    // Check for instant kill on low HP enemies
    const isInstantKill = target.health <= config.backstabInstantKillThreshold;
    
    return {
      damage: isInstantKill ? target.maxHealth : multipliedDamage,
      isInstantKill: isInstantKill
    };
  }

  /**
   * Clear all noise events
   */
  clear() {
    this.noiseEvents = [];
  }

  /**
   * Render noise visualizations (for debugging)
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderDebug(ctx) {
    const currentTime = performance.now();
    
    this.noiseEvents.forEach(noise => {
      if (!noise.active) return;
      
      const age = currentTime - noise.timestamp;
      const alpha = Math.max(0, 1 - (age / this.noiseDecayRate));
      
      ctx.globalAlpha = alpha * 0.3;
      ctx.strokeStyle = this.getNoiseColor(noise.type);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(noise.x, noise.y, noise.range, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.globalAlpha = alpha * 0.1;
      ctx.fillStyle = this.getNoiseColor(noise.type);
      ctx.fill();
    });
    
    ctx.globalAlpha = 1;
  }

  /**
   * Get color for noise type visualization
   * @param {string} type - Noise type
   * @returns {string} Color
   */
  getNoiseColor(type) {
    switch (type) {
      case 'explosion': return '#ff0000';
      case 'gunshot': return '#ff6600';
      case 'suppressedGunshot': return '#ffaa00';
      case 'running': return '#00ff00';
      case 'melee': return '#00ffff';
      default: return '#ffffff';
    }
  }
}

/**
 * AwarenessState - Enum for enemy awareness states
 */
const AwarenessState = {
  UNAWARE: 'unaware',      // White - Normal patrol, can be backstabbed
  SUSPICIOUS: 'suspicious', // Yellow - Investigating, 150% detection range
  ALERT: 'alert',          // Orange - Saw player/heard gunshot, 200% detection range
  COMBAT: 'combat'         // Red - Actively engaging, infinite detection
};

/**
 * Get awareness state color
 * @param {string} state - Awareness state
 * @returns {string} Color for the state
 */
function getAwarenessColor(state) {
  switch (state) {
    case AwarenessState.UNAWARE: return '#ffffff';
    case AwarenessState.SUSPICIOUS: return '#ffff00';
    case AwarenessState.ALERT: return '#ff8800';
    case AwarenessState.COMBAT: return '#ff0000';
    default: return '#ffffff';
  }
}

/**
 * Get awareness detection multiplier
 * @param {string} state - Awareness state
 * @returns {number} Detection range multiplier
 */
function getAwarenessDetectionMultiplier(state) {
  switch (state) {
    case AwarenessState.UNAWARE: return 1.0;
    case AwarenessState.SUSPICIOUS: return 1.5;
    case AwarenessState.ALERT: return 2.0;
    case AwarenessState.COMBAT: return Infinity;
    default: return 1.0;
  }
}
