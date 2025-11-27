// AI Behavior states
const AIState = {
  PATROL: 'patrol',
  CHASE: 'chase',
  ATTACK: 'attack',
  HIDE: 'hide',
  FLANK: 'flank',
  RETREAT: 'retreat'
};

// Phase 2: Awareness states for stealth system
const AwarenessState = {
  UNAWARE: 'unaware',      // White - Normal patrol, can be backstabbed
  SUSPICIOUS: 'suspicious', // Yellow - Investigating, 150% detection range
  ALERT: 'alert',          // Orange - Saw player/heard gunshot, 200% detection range
  COMBAT: 'combat'         // Red - Actively engaging, infinite detection
};

// Base Enemy class with advanced AI
class EnemyUnit extends Entity {
  constructor(x, y, enemyType = 'infantry') {
    super(x, y, 28, 48);
    
    this.type = 'enemy';
    this.enemyType = enemyType;
    
    // Stats
    this.maxHealth = 50;
    this.health = this.maxHealth;
    this.speed = 2;
    this.damage = 10;
    
    // AI
    this.aiState = AIState.PATROL;
    this.aggroRange = 400;
    this.attackRange = 300;
    this.retreatThreshold = 0.3;
    this.target = null;
    this.lastStateChange = 0;
    this.stateTimer = 0;
    
    // Phase 2: Stealth Awareness
    this.awarenessState = AwarenessState.UNAWARE;
    this.awarenessLevel = 0; // 0-1, fills up towards next state
    this.lastNoiseLocation = null;
    this.investigateTimer = 0;
    this.awarenessDecayTimer = 0;
    this.canBeBackstabbed = true;
    
    // Phase 2: Formation
    this.formationId = null;
    this.formationRole = null;
    this.formationTarget = null;
    this.formationDx = 0;
    this.formationDy = 0;
    
    // Phase 2: Tactical AI
    this.coverTarget = null;
    this.isInCover = false;
    this.isFlanking = false;
    this.isRetreating = false;
    this.isSuppressing = false;
    this.grenadeTimer = 0;
    this.lastGrenadeTime = 0;
    
    // Movement
    this.dx = 0;
    this.dy = 0;
    this.gravity = 0.6;
    this.facing = -1;
    this.patrolDirection = -1;
    this.patrolMin = x - 100;
    this.patrolMax = x + 100;
    
    // Combat
    this.weapon = new Pistol();
    this.lastShotTime = 0;
    this.shootCooldown = 1000;
    
    // Visual
    this.color = '#ff3333';
    
    this.applyEnemyType();
  }

  applyEnemyType() {
    switch (this.enemyType) {
      case 'infantry':
        this.maxHealth = 50;
        this.speed = 2;
        this.weapon = new Pistol();
        break;
      case 'heavy':
        this.maxHealth = 100;
        this.speed = 1.5;
        this.weapon = new MachineGun();
        this.color = '#cc0000';
        this.width = 32;
        this.height = 52;
        break;
      case 'sniper':
        this.maxHealth = 40;
        this.speed = 1.8;
        this.weapon = new SniperRifle();
        this.attackRange = 600;
        this.color = '#660000';
        break;
      case 'scout':
        this.maxHealth = 30;
        this.speed = 3.5;
        this.weapon = new Pistol();
        this.color = '#ff6666';
        this.width = 24;
        this.height = 44;
        break;
      case 'boss':
        this.maxHealth = 600;
        this.speed = 2.2;
        this.damage = 25;
        this.weapon = new MachineGun();
        this.attackRange = 700;
        this.color = '#990000';
        this.width = 50;
        this.height = 70;
        this.aggroRange = 9999;
        this.shootCooldown = 400;
        this.isBoss = true;
        break;
      
      // New enemy types
      case 'drone':
        this.maxHealth = 60;
        this.speed = 3;
        this.damage = 12;
        this.weapon = new LaserGun();
        this.aggroRange = 500;
        this.attackRange = 350;
        this.shootCooldown = 800;
        this.color = '#6666ff';
        this.width = 32;
        this.height = 24;
        this.isFlying = true;
        this.flyHeight = 80; // Hovers above ground
        this.hoverOffset = 0; // For bobbing animation
        break;
        
      case 'berserker':
        this.maxHealth = 70;
        this.speed = 5;
        this.damage = 35;
        this.weapon = new Knife(); // Melee weapon
        this.aggroRange = 300;
        this.attackRange = 50; // Very close range
        this.shootCooldown = 500;
        this.color = '#ff0066';
        this.width = 30;
        this.height = 50;
        this.isMelee = true;
        break;
        
      case 'bomber':
        this.maxHealth = 50;
        this.speed = 1.5;
        this.damage = 80;
        this.weapon = null; // No weapon - explodes instead
        this.aggroRange = 350;
        this.attackRange = 80; // Explosion trigger range
        this.shootCooldown = 0;
        this.color = '#ff6600';
        this.width = 35;
        this.height = 45;
        this.isExplosive = true;
        this.explosionRadius = 120;
        this.flashTimer = 0;
        this.aboutToExplode = false;
        this.explodeDelay = 1500; // Flash for 1.5 seconds before exploding
        break;
        
      case 'riot':
        this.maxHealth = 80;
        this.speed = 2;
        this.damage = 15;
        this.weapon = new Pistol();
        this.aggroRange = 400;
        this.attackRange = 200;
        this.shootCooldown = 900;
        this.color = '#4466aa';
        this.width = 36;
        this.height = 52;
        this.hasShield = true;
        this.shieldHealth = 100;
        this.shieldMaxHealth = 100;
        this.shieldActive = true;
        break;
        
      // Phase 1 new enemy types
      case 'medic':
        // Medic stats from config
        const medicConfig = typeof GameConfig !== 'undefined' && GameConfig.ENEMIES ? 
          GameConfig.ENEMIES.MEDIC : {};
        this.maxHealth = medicConfig.health || 80;
        this.speed = 1.8;
        this.damage = 8;
        this.weapon = new Pistol();
        this.aggroRange = 350;
        this.attackRange = 250;
        this.shootCooldown = 1200;
        this.color = '#44aa44';
        this.width = 28;
        this.height = 48;
        this.isMedic = true;
        this.healAmount = medicConfig.healAmount || 15;
        this.healRate = (medicConfig.healRate || 3) * 1000; // Convert to ms
        this.healRange = medicConfig.healRange || 200;
        this.lastHealTime = 0;
        this.currentHealTarget = null;
        break;
        
      case 'engineer':
        // Engineer stats from config
        const engineerConfig = typeof GameConfig !== 'undefined' && GameConfig.ENEMIES ? 
          GameConfig.ENEMIES.ENGINEER : {};
        this.maxHealth = engineerConfig.health || 100;
        this.speed = 1.5;
        this.damage = 12;
        this.weapon = new Pistol();
        this.aggroRange = 400;
        this.attackRange = 300;
        this.shootCooldown = 1000;
        this.color = '#4477aa';
        this.width = 30;
        this.height = 50;
        this.isEngineer = true;
        this.turretHealth = engineerConfig.turretHealth || 30;
        this.turretDamage = engineerConfig.turretDamage || 10;
        this.maxTurrets = engineerConfig.maxTurrets || 2;
        this.deployCooldown = (engineerConfig.deployCooldown || 8) * 1000;
        this.lastDeployTime = 0;
        this.deployedTurrets = [];
        break;
        
      case 'flamethrower':
        // Flamethrower stats from config
        const flameConfig = typeof GameConfig !== 'undefined' && GameConfig.ENEMIES ? 
          GameConfig.ENEMIES.FLAMETHROWER : {};
        this.maxHealth = flameConfig.health || 150;
        this.speed = 1.2;
        this.damage = flameConfig.damage || 12;
        this.weapon = null; // Uses flamethrower attack
        this.aggroRange = 250;
        this.attackRange = flameConfig.range || 150;
        this.flameArc = (flameConfig.arc || 90) * Math.PI / 180; // Convert to radians
        this.flameDuration = (flameConfig.duration || 5) * 1000;
        this.flameReloadTime = 3000;
        this.shootCooldown = 100; // Rapid fire
        this.color = '#dd5500';
        this.width = 34;
        this.height = 54;
        this.isFlamethrower = true;
        this.isFiring = false;
        this.firingTime = 0;
        this.reloadingTime = 0;
        this.isReloading = false;
        this.flameParticles = [];
        this.immuneToFire = true;
        break;
    }
    this.health = this.maxHealth;
  }

  /**
   * Make this enemy an elite variant
   * Elite enemies have enhanced stats and visual effects
   */
  makeElite() {
    // Don't make bosses or drones elite
    if (this.isBoss || this.enemyType === 'drone') return;
    
    const config = typeof GameConfig !== 'undefined' && GameConfig.ELITE ? 
      GameConfig.ELITE : {};
    
    this.isElite = true;
    
    // Apply stat multipliers
    const healthMult = config.healthMultiplier || 2;
    const damageMult = config.damageMultiplier || 1.5;
    const speedMult = config.speedMultiplier || 1.2;
    
    this.maxHealth = Math.floor(this.maxHealth * healthMult);
    this.health = this.maxHealth;
    this.damage = Math.floor(this.damage * damageMult);
    this.speed *= speedMult;
    
    // Elite score value is doubled
    this.scoreMultiplier = config.scoreMultiplier || 2;
    
    // Elite drops guaranteed power-up
    this.guaranteedDrop = true;
  }

  /**
   * Make this enemy a mini-boss
   * Mini-bosses have significantly enhanced stats and special abilities
   */
  makeMiniBoss() {
    // Don't make actual bosses into mini-bosses
    if (this.isBoss) return;
    
    const config = typeof GameConfig !== 'undefined' && GameConfig.MINIBOSS ? 
      GameConfig.MINIBOSS : {};
    
    this.isMiniBoss = true;
    this.isElite = true; // Mini-bosses are also elite
    
    // Apply stat multipliers (more powerful than elite)
    const healthMult = config.healthMultiplier || 6;
    const damageMult = config.damageMultiplier || 4.5;
    
    this.maxHealth = Math.floor(this.maxHealth * healthMult);
    this.health = this.maxHealth;
    this.damage = Math.floor(this.damage * damageMult);
    this.speed *= 1.3;
    
    // Make them larger
    this.width = Math.floor(this.width * 1.3);
    this.height = Math.floor(this.height * 1.3);
    
    // Mini-boss score value
    this.scoreMultiplier = 5;
    this.guaranteedDrop = true;
    
    // Add special abilities based on enemy type
    this.addMiniBossAbilities();
  }

  /**
   * Add special abilities for mini-boss variant
   */
  addMiniBossAbilities() {
    switch (this.enemyType) {
      case 'heavy':
        // Shield ability, charge attack
        this.hasShieldAbility = true;
        this.shieldCooldown = 10000;
        this.lastShieldTime = 0;
        this.hasChargeAttack = true;
        this.chargeCooldown = 8000;
        this.lastChargeTime = 0;
        break;
        
      case 'berserker':
        // Enrage mode, leap attack
        this.hasEnrage = true;
        this.enrageCooldown = 12000;
        this.lastEnrageTime = 0;
        this.hasLeapAttack = true;
        this.leapCooldown = 6000;
        this.lastLeapTime = 0;
        break;
        
      case 'sniper':
        // Explosive shots, repositioning
        this.hasExplosiveShots = true;
        this.explosiveRadius = 60;
        this.hasReposition = true;
        this.repositionCooldown = 5000;
        this.lastRepositionTime = 0;
        break;
        
      case 'bomber':
        // Drops mine field, bigger suicide explosion
        this.hasMineField = true;
        this.mineCooldown = 7000;
        this.lastMineTime = 0;
        this.explosionRadius *= 2;
        this.damage *= 1.5;
        break;
    }
  }

  applyDifficulty(multiplier) {
    this.maxHealth = Math.floor(this.maxHealth * multiplier);
    this.health = this.maxHealth;
    this.speed *= multiplier;
    this.damage = Math.floor(this.damage * multiplier);
  }

  takeDamage(amount, attackDirection = 0) {
    // Bosses with shield active are invulnerable
    if (this.invulnerable && this.shieldActive) {
      return false;
    }
    
    // Riot shield blocks frontal attacks
    if (this.enemyType === 'riot' && this.shieldActive && this.shieldHealth > 0) {
      // Check if attack is from the front (based on enemy facing direction)
      const attackFromFront = (attackDirection === 0) || (attackDirection * this.facing >= 0);
      
      if (attackFromFront) {
        // Shield absorbs damage
        this.shieldHealth -= amount;
        if (this.shieldHealth <= 0) {
          this.shieldActive = false;
          this.shieldHealth = 0;
        }
        return false; // Enemy didn't take damage
      }
    }
    
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.destroy();
      return true;
    }
    
    // React to damage - Bosses don't retreat
    if (this.isBoss) {
      this.aiState = AIState.CHASE;
    } else if (this.health < this.maxHealth * this.retreatThreshold) {
      this.aiState = AIState.RETREAT;
    } else {
      this.aiState = AIState.CHASE;
    }
    return false;
  }

  updateAI(player, currentTime, deltaTime) {
    if (!player || !player.active) return null;
    
    const distToPlayer = this.distanceTo(player);
    this.target = player;
    
    // State machine
    this.stateTimer += deltaTime;
    
    // Special AI for new enemy types
    if (this.enemyType === 'drone') {
      return this.updateDroneAI(player, distToPlayer, currentTime, deltaTime);
    }
    
    if (this.enemyType === 'berserker') {
      return this.updateBerserkerAI(player, distToPlayer, currentTime, deltaTime);
    }
    
    if (this.enemyType === 'bomber') {
      return this.updateBomberAI(player, distToPlayer, currentTime, deltaTime);
    }
    
    if (this.enemyType === 'riot') {
      return this.updateRiotAI(player, distToPlayer, currentTime, deltaTime);
    }
    
    // Phase 1 new enemy types
    if (this.enemyType === 'medic') {
      return this.updateMedicAI(player, distToPlayer, currentTime, deltaTime);
    }
    
    if (this.enemyType === 'engineer') {
      return this.updateEngineerAI(player, distToPlayer, currentTime, deltaTime);
    }
    
    if (this.enemyType === 'flamethrower') {
      return this.updateFlamethrowerAI(player, distToPlayer, currentTime, deltaTime);
    }
    
    // Bosses have hyper-aggressive AI - always chase and attack regardless of distance
    if (this.isBoss) {
      // Bosses always attack - no distance checks
      this.changeState(AIState.ATTACK, currentTime);
      // Return projectiles from attack for bosses
      return this.attack(player, currentTime);
    }
    
    switch (this.aiState) {
      case AIState.PATROL:
        this.patrol();
        if (distToPlayer < this.aggroRange) {
          this.changeState(AIState.CHASE, currentTime);
        }
        break;
        
      case AIState.CHASE:
        this.chase(player);
        if (distToPlayer < this.attackRange) {
          this.changeState(AIState.ATTACK, currentTime);
        } else if (distToPlayer > this.aggroRange * 1.5) {
          this.changeState(AIState.PATROL, currentTime);
        }
        // Randomly decide to flank
        if (this.stateTimer > 3000 && Math.random() < 0.3) {
          this.changeState(AIState.FLANK, currentTime);
        }
        break;
        
      case AIState.ATTACK:
        const attackResult = this.attack(player, currentTime);
        if (distToPlayer > this.attackRange * 1.2) {
          this.changeState(AIState.CHASE, currentTime);
        }
        // Randomly decide to hide
        if (this.stateTimer > 2000 && Math.random() < 0.2) {
          this.changeState(AIState.HIDE, currentTime);
        }
        return attackResult;
        
      case AIState.FLANK:
        this.flank(player);
        if (this.stateTimer > 4000 || distToPlayer < this.attackRange) {
          this.changeState(AIState.ATTACK, currentTime);
        }
        break;
        
      case AIState.HIDE:
        this.hide(player);
        if (this.stateTimer > 2000) {
          this.changeState(AIState.ATTACK, currentTime);
        }
        break;
        
      case AIState.RETREAT:
        this.retreat(player);
        if (distToPlayer > this.aggroRange) {
          this.changeState(AIState.PATROL, currentTime);
        }
        break;
    }
    
    return null; // No projectiles for other states
  }

  changeState(newState, currentTime) {
    this.aiState = newState;
    this.lastStateChange = currentTime;
    this.stateTimer = 0;
  }

  patrol() {
    this.dx = this.patrolDirection * this.speed * 0.5;
    
    if (this.x <= this.patrolMin) {
      this.patrolDirection = 1;
      this.facing = 1;
    } else if (this.x >= this.patrolMax) {
      this.patrolDirection = -1;
      this.facing = -1;
    }
  }

  chase(player) {
    // Bosses chase with full aggressive speed
    const chaseSpeed = this.isBoss ? this.speed : this.speed;
    
    if (this.x < player.x) {
      this.dx = chaseSpeed;
      this.facing = 1;
    } else {
      this.dx = -chaseSpeed;
      this.facing = -1;
    }
  }

  attack(player, currentTime) {
    // Bosses continue moving while attacking - relentless pursuit
    if (this.isBoss) {
      const distToPlayer = Math.abs(player.x - this.x);
      // Keep chasing aggressively regardless of distance
      if (this.x < player.x) {
        this.dx = this.speed * 0.8; // Move at 80% speed while attacking
        this.facing = 1;
      } else {
        this.dx = -this.speed * 0.8;
        this.facing = -1;
      }
    } else {
      // Normal enemies stop moving and shoot
      this.dx = 0;
      this.facing = player.x > this.x ? 1 : -1;
    }
    
    // Always shoot when cooldown is ready
    if (currentTime - this.lastShotTime > this.shootCooldown) {
      this.lastShotTime = currentTime;
      return this.shoot(player.x + player.width / 2, player.y + player.height / 2, currentTime);
    }
    return null;
  }

  flank(player) {
    // Try to move perpendicular to player
    const angle = Math.atan2(player.y - this.y, player.x - this.x);
    const flankAngle = angle + Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1);
    this.dx = Math.cos(flankAngle) * this.speed * 1.2;
    this.facing = this.dx > 0 ? 1 : -1;
  }

  hide(player) {
    // Move away from player slowly
    if (this.x < player.x) {
      this.dx = -this.speed * 0.5;
      this.facing = -1;
    } else {
      this.dx = this.speed * 0.5;
      this.facing = 1;
    }
  }

  retreat(player) {
    // Move away from player quickly
    if (this.x < player.x) {
      this.dx = -this.speed * 1.5;
      this.facing = -1;
    } else {
      this.dx = this.speed * 1.5;
      this.facing = 1;
    }
  }

  shoot(targetX, targetY, currentTime) {
    const gunX = this.x + this.width / 2 + (this.facing * 10);
    const gunY = this.y + this.height / 2;
    return this.weapon.fire(gunX, gunY, targetX, targetY, currentTime);
  }

  distanceTo(entity) {
    const dx = (entity.x + entity.width / 2) - (this.x + this.width / 2);
    const dy = (entity.y + entity.height / 2) - (this.y + this.height / 2);
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Drone AI - Flying enemy that hovers and strafes
   */
  updateDroneAI(player, distToPlayer, currentTime, deltaTime) {
    // Update hover bobbing
    this.hoverOffset = Math.sin(currentTime / 300) * 10;
    
    if (distToPlayer < this.aggroRange) {
      // Strafe around player
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      const strafeAngle = angle + Math.PI / 2 + Math.sin(currentTime / 1000) * 0.5;
      
      this.dx = Math.cos(strafeAngle) * this.speed * 0.8;
      this.facing = player.x > this.x ? 1 : -1;
      
      // Attack when in range
      if (distToPlayer < this.attackRange && currentTime - this.lastShotTime > this.shootCooldown) {
        this.lastShotTime = currentTime;
        return this.shoot(player.x + player.width / 2, player.y + player.height / 2, currentTime);
      }
    } else {
      // Patrol in the air
      this.patrol();
    }
    
    return null;
  }

  /**
   * Berserker AI - Rushes player for melee attack
   */
  updateBerserkerAI(player, distToPlayer, currentTime, deltaTime) {
    // Always chase player aggressively
    const rushSpeed = this.speed * 1.2;
    
    if (this.x < player.x) {
      this.dx = rushSpeed;
      this.facing = 1;
    } else {
      this.dx = -rushSpeed;
      this.facing = -1;
    }
    
    // Melee attack when in range
    if (distToPlayer < this.attackRange) {
      if (currentTime - this.lastShotTime > this.shootCooldown) {
        this.lastShotTime = currentTime;
        // Create melee projectile
        const meleeX = this.x + this.width / 2 + (this.facing * 20);
        const meleeY = this.y + this.height / 2;
        return this.weapon.fire(meleeX, meleeY, player.x + player.width / 2, player.y + player.height / 2, currentTime);
      }
    }
    
    return null;
  }

  /**
   * Bomber AI - Slowly approaches and explodes
   */
  updateBomberAI(player, distToPlayer, currentTime, deltaTime) {
    // Check if about to explode
    if (this.aboutToExplode) {
      this.flashTimer += deltaTime;
      this.dx = 0; // Stop moving
      
      if (this.flashTimer >= this.explodeDelay) {
        // Explode!
        this.explode(currentTime);
      }
      return null;
    }
    
    // Move toward player
    if (distToPlayer < this.aggroRange) {
      if (this.x < player.x) {
        this.dx = this.speed;
        this.facing = 1;
      } else {
        this.dx = -this.speed;
        this.facing = -1;
      }
      
      // Trigger explosion when close enough
      if (distToPlayer < this.attackRange) {
        this.aboutToExplode = true;
        this.flashTimer = 0;
      }
    } else {
      this.patrol();
    }
    
    return null;
  }

  /**
   * Riot AI - Uses shield to block frontal attacks
   */
  updateRiotAI(player, distToPlayer, currentTime, deltaTime) {
    // Always face the player to keep shield up
    this.facing = player.x > this.x ? 1 : -1;
    
    if (distToPlayer < this.aggroRange) {
      // Advance slowly
      if (distToPlayer > this.attackRange) {
        this.dx = this.facing * this.speed * 0.6;
      } else {
        // In attack range, strafe and shoot
        this.dx = Math.sin(currentTime / 500) * this.speed * 0.3;
        
        if (currentTime - this.lastShotTime > this.shootCooldown) {
          this.lastShotTime = currentTime;
          return this.shoot(player.x + player.width / 2, player.y + player.height / 2, currentTime);
        }
      }
    } else {
      this.patrol();
    }
    
    return null;
  }

  /**
   * Medic AI - Heals nearby allies and stays back from combat
   */
  updateMedicAI(player, distToPlayer, currentTime, deltaTime) {
    // Medics prioritize healing nearby allies
    this.updateHealingBehavior(currentTime);
    
    // Face the player
    this.facing = player.x > this.x ? 1 : -1;
    
    // Stay back from combat
    if (distToPlayer < this.aggroRange) {
      if (distToPlayer < 200) {
        // Too close, retreat
        this.dx = -this.facing * this.speed;
      } else if (distToPlayer > this.attackRange) {
        // Close in slowly
        this.dx = this.facing * this.speed * 0.5;
      } else {
        // In optimal range, strafe
        this.dx = Math.sin(currentTime / 800) * this.speed * 0.4;
        
        // Shoot occasionally
        if (currentTime - this.lastShotTime > this.shootCooldown) {
          this.lastShotTime = currentTime;
          return this.shoot(player.x + player.width / 2, player.y + player.height / 2, currentTime);
        }
      }
    } else {
      this.patrol();
    }
    
    return null;
  }

  /**
   * Update healing behavior for medic
   * @param {number} currentTime - Current game time
   */
  updateHealingBehavior(currentTime) {
    // Check if it's time to heal
    if (currentTime - this.lastHealTime < this.healRate) return;
    
    // Find nearby allies that need healing
    if (window.game && window.game.enemies) {
      let bestTarget = null;
      let lowestHealthPercent = 1;
      
      window.game.enemies.forEach(ally => {
        if (ally === this || !ally.active || ally.health <= 0) return;
        
        const dist = this.distanceTo(ally);
        if (dist <= this.healRange) {
          const healthPercent = ally.health / ally.maxHealth;
          if (healthPercent < lowestHealthPercent && healthPercent < 0.9) {
            lowestHealthPercent = healthPercent;
            bestTarget = ally;
          }
        }
      });
      
      if (bestTarget) {
        this.currentHealTarget = bestTarget;
        this.lastHealTime = currentTime;
        
        // Heal the target
        bestTarget.health = Math.min(bestTarget.maxHealth, bestTarget.health + this.healAmount);
        
        // Create heal visual effect
        if (window.game && window.game.particleSystem) {
          window.game.particleSystem.createTextPopup(
            bestTarget.x + bestTarget.width / 2,
            bestTarget.y - 10,
            `+${this.healAmount}`,
            '#44ff44'
          );
          
          // Create heal beam particles
          const startX = this.x + this.width / 2;
          const startY = this.y + this.height / 2;
          const endX = bestTarget.x + bestTarget.width / 2;
          const endY = bestTarget.y + bestTarget.height / 2;
          
          for (let i = 0; i < 5; i++) {
            const t = i / 4;
            const px = startX + (endX - startX) * t;
            const py = startY + (endY - startY) * t;
            window.game.particleSystem.createExplosion(px, py, 3, '#44ff44');
          }
        }
        
        // Play heal sound
        if (window.game && window.game.audioManager) {
          window.game.audioManager.playSound('pickup_health', 0.4);
        }
      } else {
        this.currentHealTarget = null;
      }
    }
  }

  /**
   * Engineer AI - Deploys turrets and runs away from player
   */
  updateEngineerAI(player, distToPlayer, currentTime, deltaTime) {
    // Clean up destroyed turrets
    if (this.deployedTurrets) {
      this.deployedTurrets = this.deployedTurrets.filter(t => t.active);
    }
    
    // Face player
    this.facing = player.x > this.x ? 1 : -1;
    
    // Deploy turrets when in range
    if (distToPlayer < this.aggroRange) {
      // Try to deploy turret
      if (currentTime - this.lastDeployTime >= this.deployCooldown) {
        if (this.deployedTurrets.length < this.maxTurrets) {
          this.deployTurret(currentTime);
        }
      }
      
      // Run away if player is close
      if (distToPlayer < 200) {
        this.dx = -this.facing * this.speed * 1.5;
      } else if (distToPlayer < this.attackRange) {
        // Strafe and shoot
        this.dx = Math.sin(currentTime / 600) * this.speed * 0.5;
        
        if (currentTime - this.lastShotTime > this.shootCooldown) {
          this.lastShotTime = currentTime;
          return this.shoot(player.x + player.width / 2, player.y + player.height / 2, currentTime);
        }
      } else {
        // Approach cautiously
        this.dx = this.facing * this.speed * 0.4;
      }
    } else {
      this.patrol();
    }
    
    return null;
  }

  /**
   * Deploy a mini-turret
   * @param {number} currentTime - Current game time
   */
  deployTurret(currentTime) {
    if (!window.game) return;
    
    this.lastDeployTime = currentTime;
    
    // Deploy turret at random position nearby
    const offsetX = (Math.random() - 0.5) * 150;
    const turretX = this.x + offsetX;
    const turretY = window.game.groundLevel - 30;
    
    // Create mini-turret (using hazard system if available)
    if (window.game.hazardManager) {
      const turret = new Turret(turretX, turretY);
      turret.maxHealth = this.turretHealth;
      turret.health = this.turretHealth;
      turret.damage = this.turretDamage;
      turret.detectionRange = 150;
      turret.fireRate = 1000;
      turret.isEngineerTurret = true;
      
      window.game.hazardManager.addHazard(turret);
      this.deployedTurrets.push(turret);
      
      // Play deploy sound
      if (window.game.audioManager) {
        window.game.audioManager.playSound('projectile_impact', 0.5);
      }
      
      // Visual effect
      if (window.game.particleSystem) {
        window.game.particleSystem.createExplosion(turretX, turretY, 10, '#4477aa');
      }
    }
  }

  /**
   * Flamethrower AI - Approaches and fires continuous flame cone
   */
  updateFlamethrowerAI(player, distToPlayer, currentTime, deltaTime) {
    // Face player
    this.facing = player.x > this.x ? 1 : -1;
    
    // Handle reload
    if (this.isReloading) {
      this.reloadingTime += deltaTime;
      this.isFiring = false;
      if (this.reloadingTime >= this.flameReloadTime) {
        this.isReloading = false;
        this.reloadingTime = 0;
        this.firingTime = 0;
      }
      this.dx = 0;
      return null;
    }
    
    if (distToPlayer < this.aggroRange) {
      // Approach player to get in range
      if (distToPlayer > this.attackRange * 0.8) {
        this.dx = this.facing * this.speed;
        this.isFiring = false;
      } else {
        // In range - fire!
        this.dx = this.facing * this.speed * 0.3; // Slow movement while firing
        this.isFiring = true;
        
        // Track firing time
        this.firingTime += deltaTime;
        if (this.firingTime >= this.flameDuration) {
          // Need to reload
          this.isReloading = true;
          this.isFiring = false;
        }
        
        // Apply flame damage
        if (currentTime - this.lastShotTime > this.shootCooldown) {
          this.lastShotTime = currentTime;
          this.applyFlameDamage(player, currentTime);
        }
        
        // Update flame particles
        this.updateFlameParticles(deltaTime);
      }
    } else {
      this.isFiring = false;
      this.patrol();
    }
    
    return null;
  }

  /**
   * Apply flamethrower damage in cone area
   * @param {PlayerCharacter} player - The player
   * @param {number} currentTime - Current game time
   */
  applyFlameDamage(player, currentTime) {
    if (!player || !player.active) return;
    
    const myX = this.x + this.width / 2;
    const myY = this.y + this.height / 2;
    const playerX = player.x + player.width / 2;
    const playerY = player.y + player.height / 2;
    
    // Check if player is in cone
    const dist = this.distanceTo(player);
    if (dist > this.attackRange) return;
    
    // Check angle
    const dx = playerX - myX;
    const dy = playerY - myY;
    const angle = Math.atan2(dy, dx);
    const facingAngle = this.facing > 0 ? 0 : Math.PI;
    let angleDiff = Math.abs(angle - facingAngle);
    if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
    
    if (angleDiff <= this.flameArc / 2) {
      // Player is in flame cone
      if (!player.invulnerable) {
        player.takeDamage(this.damage, currentTime);
        
        // Fire damage visual
        if (window.game && window.game.particleSystem) {
          window.game.particleSystem.createExplosion(
            playerX, playerY, 5, '#ff4400'
          );
        }
      }
    }
  }

  /**
   * Update flame particle effects
   * @param {number} deltaTime - Time since last update
   */
  updateFlameParticles(deltaTime) {
    if (!this.isFiring || !window.game) return;
    
    const startX = this.x + this.width / 2 + (this.facing * 15);
    const startY = this.y + this.height / 2;
    
    // Create flame particles
    if (Math.random() < 0.8) {
      const angle = (this.facing > 0 ? 0 : Math.PI) + (Math.random() - 0.5) * this.flameArc;
      const speed = 5 + Math.random() * 5;
      const endX = startX + Math.cos(angle) * this.attackRange * 0.8;
      const endY = startY + Math.sin(angle) * this.attackRange * 0.3;
      
      // Create particle trail
      if (window.game.particleSystem) {
        for (let i = 0; i < 3; i++) {
          const t = i / 3;
          const px = startX + (endX - startX) * t + (Math.random() - 0.5) * 10;
          const py = startY + (endY - startY) * t + (Math.random() - 0.5) * 10;
          const colors = ['#ff4400', '#ff6600', '#ffaa00', '#ffff00'];
          const color = colors[Math.floor(Math.random() * colors.length)];
          window.game.particleSystem.createExplosion(px, py, 2, color);
        }
      }
    }
  }

  /**
   * Bomber explosion - Deals damage to nearby entities
   */
  explode(currentTime) {
    // Mark as destroyed
    this.health = 0;
    this.destroy();
    
    // Create explosion effect via game engine
    if (window.game) {
      // Create explosion particles
      window.game.particleSystem.createExplosion(
        this.x + this.width / 2,
        this.y + this.height / 2,
        30,
        '#ff6600'
      );
      
      // Play explosion sound
      window.game.audioManager.playSound('explosion', 0.8);
      
      // Camera shake
      window.game.camera.shake(10, 400);
      
      // Damage player if in range
      const distToPlayer = this.distanceTo(window.game.player);
      if (distToPlayer < this.explosionRadius && window.game.player.active) {
        // Damage falls off with distance
        const damageMultiplier = 1 - (distToPlayer / this.explosionRadius);
        const damage = Math.floor(this.damage * damageMultiplier);
        window.game.player.takeDamage(damage, currentTime);
      }
    }
  }

  update(deltaTime, player, groundLevel, currentTime, worldWidth = 3000) {
    const dt = deltaTime / 16;
    
    // Update weapon (if exists)
    if (this.weapon) {
      this.weapon.update(currentTime);
      
      // Automatic reload for enemies when out of ammo
      if (this.weapon.currentAmmo === 0 && !this.weapon.isReloading) {
        this.weapon.reload(currentTime);
      }
    }
    
    // Boss-specific mechanics
    if (this.isBoss && player) {
      this.updateBossMechanics(currentTime, player, deltaTime);
    }
    
    // Ensure patrol bounds respect world boundaries
    if (this.patrolMin < 0) this.patrolMin = 0;
    if (this.patrolMax > worldWidth) this.patrolMax = worldWidth;
    
    // AI decision making - capture projectiles
    const aiProjectiles = this.updateAI(player, currentTime, deltaTime);
    
    // Apply movement
    this.x += this.dx * dt;
    
    // Keep enemy within world bounds
    if (this.x < 0) {
      this.x = 0;
      this.dx = 0;
      this.patrolDirection = 1;
      this.facing = 1;
    } else if (this.x + this.width > worldWidth) {
      this.x = worldWidth - this.width;
      this.dx = 0;
      this.patrolDirection = -1;
      this.facing = -1;
    }
    
    // Apply gravity (except for flying enemies)
    if (this.isFlying) {
      // Flying enemies hover at a specific height
      const targetY = groundLevel - this.height - this.flyHeight + (this.hoverOffset || 0);
      this.y += (targetY - this.y) * 0.05 * dt;
      this.dy = 0;
    } else {
      this.dy += this.gravity * dt;
      this.y += this.dy * dt;
      
      // Ground collision
      if (this.y + this.height >= groundLevel) {
        this.y = groundLevel - this.height;
        this.dy = 0;
      }
    }
    
    // Return projectiles from AI
    return aiProjectiles;
  }
  
  updateBossMechanics(currentTime, player, deltaTime) {
    const healthPercent = this.health / this.maxHealth;
    
    // Rage mechanic (The Warlord & The Overlord) - REDUCED SLIGHTLY
    if (this.specialMechanic === 'rage' || this.specialMechanic === 'all') {
      if (healthPercent < 0.5 && !this.enraged) {
        this.enraged = true;
        this.speed *= 1.6; // 1.6x speed boost (reduced from 2.0x for slight ease)
        this.shootCooldown *= 0.55; // Shoots 1.8x faster (reduced from 0.4x for slight ease)
        this.damage = Math.floor(this.damage * 1.6); // 1.6x damage (reduced from 2.0x for slight ease)
      }
    }
    
    // Summon mechanic (The Devastator & The Overlord)
    if ((this.specialMechanic === 'summon' || this.specialMechanic === 'all') && window.game) {
      if (currentTime - this.lastSummonTime > this.summonCooldown) {
        this.lastSummonTime = currentTime;
        // Summon 2 minions near the boss
        for (let i = 0; i < 2; i++) {
          const offsetX = (i === 0 ? -150 : 150);
          const minion = new EnemyUnit(
            this.x + offsetX,
            this.y,
            'scout' // Fast minions
          );
          minion.maxHealth = 30;
          minion.health = 30;
          window.game.enemies.push(minion);
          window.game.collisionSystem.add(minion);
          window.game.enemiesRemaining++;
        }
      }
    }
    
    // Shield mechanic (The Annihilator & The Overlord)
    if ((this.specialMechanic === 'shield' || this.specialMechanic === 'all') && window.game) {
      if (currentTime - this.lastShieldTime > this.shieldCooldown) {
        this.lastShieldTime = currentTime;
        this.shieldActive = true;
        this.invulnerable = true;
        // Shield lasts 3 seconds
        setTimeout(() => {
          if (this.active) {
            this.shieldActive = false;
            this.invulnerable = false;
          }
        }, 3000);
      }
    }
  }

  render(ctx) {
    // Draw elite/mini-boss aura first (behind enemy)
    if (this.isElite || this.isMiniBoss) {
      this.drawEliteAura(ctx);
    }
    
    // Draw shadow (16-bit style)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(this.x + 2, this.y + this.height, this.width - 4, 4);
    
    // 16-bit arcade enemy colors based on type
    let bodyColor, bodyLight, bodyDark, helmetColor, helmetLight, armorColor;
    switch (this.enemyType) {
      case 'infantry':
        bodyColor = '#8b5a2a'; // Brown
        bodyLight = '#9b6a3a';
        bodyDark = '#7b4a1a';
        helmetColor = '#6b3a10';
        helmetLight = '#7b4a20';
        armorColor = '#5b2a00';
        break;
      case 'heavy':
        bodyColor = '#5a5a5a'; // Dark gray
        bodyLight = '#6a6a6a';
        bodyDark = '#4a4a4a';
        helmetColor = '#3a3a3a';
        helmetLight = '#4a4a4a';
        armorColor = '#2a2a2a';
        break;
      case 'sniper':
        bodyColor = '#3d5a3d'; // Dark green
        bodyLight = '#4d6a4d';
        bodyDark = '#2d4a2d';
        helmetColor = '#2d4a2d';
        helmetLight = '#3d5a3d';
        armorColor = '#1d3a1d';
        break;
      case 'scout':
        bodyColor = '#9b6a3a'; // Light brown
        bodyLight = '#ab7a4a';
        bodyDark = '#8b5a2a';
        helmetColor = '#7b4a20';
        helmetLight = '#8b5a30';
        armorColor = '#6b3a10';
        break;
      case 'boss':
        bodyColor = '#8a0a0a'; // Blood red
        bodyLight = '#aa2a2a';
        bodyDark = '#5a0000';
        helmetColor = '#3a0000';
        helmetLight = '#5a0a0a';
        armorColor = '#2a0000';
        break;
      // New enemy type colors
      case 'drone':
        bodyColor = '#4466aa'; // Blue
        bodyLight = '#5577bb';
        bodyDark = '#335599';
        helmetColor = '#223388';
        helmetLight = '#4466aa';
        armorColor = '#112277';
        break;
      case 'berserker':
        bodyColor = '#aa2244'; // Red-pink
        bodyLight = '#cc3355';
        bodyDark = '#881133';
        helmetColor = '#660022';
        helmetLight = '#aa2244';
        armorColor = '#440011';
        break;
      case 'bomber':
        bodyColor = '#cc6622'; // Orange
        bodyLight = '#dd7733';
        bodyDark = '#aa5511';
        helmetColor = '#884400';
        helmetLight = '#cc6622';
        armorColor = '#663300';
        break;
      case 'riot':
        bodyColor = '#4a6688'; // Steel blue
        bodyLight = '#5a7799';
        bodyDark = '#3a5577';
        helmetColor = '#2a4466';
        helmetLight = '#4a6688';
        armorColor = '#1a3355';
        break;
      // Phase 1 new enemy type colors
      case 'medic':
        bodyColor = '#44aa44'; // Green
        bodyLight = '#55bb55';
        bodyDark = '#339933';
        helmetColor = '#228822';
        helmetLight = '#44aa44';
        armorColor = '#116611';
        break;
      case 'engineer':
        bodyColor = '#4477aa'; // Blue-gray
        bodyLight = '#5588bb';
        bodyDark = '#336699';
        helmetColor = '#225588';
        helmetLight = '#4477aa';
        armorColor = '#114477';
        break;
      case 'flamethrower':
        bodyColor = '#dd5500'; // Orange-red
        bodyLight = '#ee6611';
        bodyDark = '#bb4400';
        helmetColor = '#993300';
        helmetLight = '#dd5500';
        armorColor = '#772200';
        break;
      default:
        bodyColor = '#8b5a2a';
        bodyLight = '#9b6a3a';
        bodyDark = '#7b4a1a';
        helmetColor = '#6b3a10';
        helmetLight = '#7b4a20';
        armorColor = '#5b2a00';
    }
    
    // Elite/Mini-boss golden tint
    if (this.isElite && !this.isMiniBoss) {
      // Apply golden tint to colors
      bodyColor = this.applyGoldenTint(bodyColor);
      bodyLight = this.applyGoldenTint(bodyLight);
      bodyDark = this.applyGoldenTint(bodyDark);
    }
    
    // Mini-boss red/purple tint
    if (this.isMiniBoss) {
      bodyColor = this.applyMiniBossTint(bodyColor);
      bodyLight = this.applyMiniBossTint(bodyLight);
      bodyDark = this.applyMiniBossTint(bodyDark);
    }
    
    // Scale for boss - make them more imposing
    const scale = this.enemyType === 'boss' ? 1.6 : 1.0;
    const offsetY = this.enemyType === 'boss' ? -15 : 0;
    
    // Special render for drone (different shape)
    if (this.enemyType === 'drone') {
      this.renderDrone(ctx, bodyColor, bodyLight, bodyDark);
      return;
    }
    
    // Special render for bomber (shows flash when about to explode)
    if (this.enemyType === 'bomber' && this.aboutToExplode) {
      const flashOn = Math.floor(this.flashTimer / 100) % 2 === 0;
      if (flashOn) {
        bodyColor = '#ff0000';
        bodyLight = '#ff4444';
        bodyDark = '#cc0000';
      }
    }
    
    // Boss intimidation aura
    if (this.enemyType === 'boss') {
      const pulseIntensity = this.isFinalBoss ? 0.4 : 0.3;
      ctx.globalAlpha = pulseIntensity + Math.sin(Date.now() / 200) * 0.15;
      ctx.fillStyle = this.isFinalBoss ? '#ff00ff' : '#ff0000'; // Purple for final boss
      ctx.fillRect(this.x - 10, this.y - 10, this.width + 20, this.height + 20);
      
      // Extra intimidation for final boss
      if (this.isFinalBoss) {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - 15, this.y - 15, this.width + 30, this.height + 30);
      }
      ctx.globalAlpha = 1;
      
      // Shield visual effect
      if (this.shieldActive) {
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 4;
        ctx.strokeRect(this.x - 12, this.y - 12, this.width + 24, this.height + 24);
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(this.x - 12, this.y - 12, this.width + 24, this.height + 24);
        ctx.globalAlpha = 1;
      }
    }
    
    // === 16-BIT ENEMY SPRITE ===
    
    // Main body
    ctx.fillStyle = bodyColor;
    const bodyWidth = Math.floor((this.width - 16) * scale);
    const bodyHeight = Math.floor((this.height - 28) * scale);
    ctx.fillRect(this.x + 8, this.y + 18 + offsetY, bodyWidth, bodyHeight);
    
    // Body shadows (16-bit shading)
    ctx.fillStyle = bodyDark;
    ctx.fillRect(this.x + 8, this.y + 18 + offsetY, 4, bodyHeight);
    ctx.fillRect(this.x + 8, this.y + bodyHeight + 14 + offsetY, bodyWidth, 4);
    
    // Body highlights
    ctx.fillStyle = bodyLight;
    ctx.fillRect(this.x + bodyWidth + 4, this.y + 18 + offsetY, 4, bodyHeight);
    ctx.fillRect(this.x + 8, this.y + 18 + offsetY, bodyWidth, 4);
    
    // Helmet/Head (16-bit detailed)
    const headWidth = Math.floor((this.width - 12) * scale);
    ctx.fillStyle = helmetColor;
    ctx.fillRect(this.x + 6, this.y + 4 + offsetY, headWidth, Math.floor(16 * scale));
    
    // Helmet shadow
    ctx.fillStyle = bodyDark;
    ctx.fillRect(this.x + 6, this.y + 4 + offsetY, 4, Math.floor(16 * scale));
    
    // Visor/Face (16-bit menacing style)
    ctx.fillStyle = '#2a1a1a';
    ctx.fillRect(this.x + 10, this.y + 10 + offsetY, headWidth - 8, 6);
    
    // Visor glow (enemy red eyes)
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(this.x + 12, this.y + 12 + offsetY, 3, 2);
    ctx.fillRect(this.x + headWidth - 8, this.y + 12 + offsetY, 3, 2);
    
    // Armor plates/chest detail
    ctx.fillStyle = armorColor;
    ctx.fillRect(this.x + 10, this.y + 22 + offsetY, bodyWidth - 4, Math.floor(8 * scale));
    if (this.enemyType === 'heavy' || this.enemyType === 'boss') {
      ctx.fillRect(this.x + 12, this.y + 32 + offsetY, bodyWidth - 8, Math.floor(6 * scale));
    }
    
    // Boss-specific menacing armor spikes
    if (this.enemyType === 'boss') {
      ctx.fillStyle = '#aa0000';
      // Shoulder spikes
      for (let i = 0; i < 3; i++) {
        const spikeX = this.x + 8 + i * 6;
        const spikeY = this.y + 20 + offsetY;
        ctx.fillRect(spikeX, spikeY - 6, 4, 6);
        ctx.fillRect(spikeX + 1, spikeY - 8, 2, 2);
      }
      for (let i = 0; i < 3; i++) {
        const spikeX = this.x + this.width - 20 + i * 6;
        const spikeY = this.y + 20 + offsetY;
        ctx.fillRect(spikeX, spikeY - 6, 4, 6);
        ctx.fillRect(spikeX + 1, spikeY - 8, 2, 2);
      }
      
      // Chest emblem (skull-like)
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(this.x + bodyWidth / 2 - 4, this.y + 28 + offsetY, 8, 6);
      ctx.fillStyle = '#000000';
      ctx.fillRect(this.x + bodyWidth / 2 - 2, this.y + 29 + offsetY, 2, 2);
      ctx.fillRect(this.x + bodyWidth / 2 + 2, this.y + 29 + offsetY, 2, 2);
    }
    
    // Belt/waist detail
    ctx.fillStyle = '#1a1a0a';
    ctx.fillRect(this.x + 10, this.y + Math.floor(38 * scale) + offsetY, bodyWidth - 4, 3);
    
    // Legs (16-bit pixel style)
    const legWidth = Math.floor(7 * scale);
    
    // Left leg
    ctx.fillStyle = bodyDark;
    ctx.fillRect(this.x + 8, this.y + this.height - 12, legWidth, 12);
    ctx.fillStyle = bodyColor;
    ctx.fillRect(this.x + 8, this.y + this.height - 12, legWidth - 2, 12);
    
    // Right leg
    ctx.fillStyle = bodyDark;
    ctx.fillRect(this.x + this.width - 8 - legWidth, this.y + this.height - 12, legWidth, 12);
    ctx.fillStyle = bodyColor;
    ctx.fillRect(this.x + this.width - 8 - legWidth, this.y + this.height - 12, legWidth - 2, 12);
    
    // Boots
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(this.x + 7, this.y + this.height - 5, legWidth + 1, 5);
    ctx.fillRect(this.x + this.width - 8 - legWidth, this.y + this.height - 5, legWidth + 1, 5);
    
    // === WEAPON (16-bit enemy weapon) ===
    const weaponX = this.x + this.width / 2 + (this.facing * 10);
    const weaponY = this.y + this.height / 2;
    
    // Weapon body
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(weaponX, weaponY - 3, 14 * this.facing, 6);
    
    // Weapon highlights
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(weaponX, weaponY - 3, 14 * this.facing, 2);
    
    // Weapon barrel
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(weaponX + (10 * this.facing), weaponY - 2, 4 * this.facing, 4);
    
    // Character outline for visibility (16-bit style)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x + 6, this.y + 4 + offsetY, this.width - 12, this.height - 4);
    
    // Riot shield visual
    if (this.enemyType === 'riot' && this.shieldActive && this.shieldHealth > 0) {
      const shieldX = this.x + (this.facing > 0 ? this.width - 5 : -10);
      const shieldY = this.y + 10;
      const shieldWidth = 8;
      const shieldHeight = this.height - 20;
      
      // Shield body
      ctx.fillStyle = '#6688aa';
      ctx.fillRect(shieldX, shieldY, shieldWidth, shieldHeight);
      
      // Shield border
      ctx.strokeStyle = '#88aacc';
      ctx.lineWidth = 2;
      ctx.strokeRect(shieldX, shieldY, shieldWidth, shieldHeight);
      
      // Shield health indicator
      const shieldPercent = this.shieldHealth / this.shieldMaxHealth;
      ctx.fillStyle = '#aaccff';
      ctx.fillRect(shieldX + 1, shieldY + 2, shieldWidth - 2, (shieldHeight - 4) * shieldPercent);
    }
    
    // === HEALTH BAR (16-bit arcade style) ===
    const barWidth = this.width;
    const barHeight = 4;
    const healthPercent = this.health / this.maxHealth;
    
    // Health bar background
    ctx.fillStyle = '#000000';
    ctx.fillRect(this.x - 1, this.y - 10, barWidth + 2, barHeight + 2);
    
    // Health bar empty
    ctx.fillStyle = '#660000';
    ctx.fillRect(this.x, this.y - 9, barWidth, barHeight);
    
    // Health bar fill (enemy red theme)
    ctx.fillStyle = '#ff3333';
    ctx.fillRect(this.x, this.y - 9, barWidth * healthPercent, barHeight);
    
    // Health bar highlight
    ctx.fillStyle = 'rgba(255, 100, 100, 0.4)';
    ctx.fillRect(this.x, this.y - 9, barWidth * healthPercent, 1);
    
    // Shield health bar for Riot (below main health bar)
    if (this.enemyType === 'riot' && this.shieldMaxHealth > 0) {
      const shieldPercent = this.shieldHealth / this.shieldMaxHealth;
      ctx.fillStyle = '#000033';
      ctx.fillRect(this.x, this.y - 5, barWidth, 3);
      ctx.fillStyle = this.shieldActive ? '#4488ff' : '#224466';
      ctx.fillRect(this.x, this.y - 5, barWidth * shieldPercent, 3);
    }
    
    // Draw AI state indicator (16-bit retro style)
    ctx.fillStyle = '#ffff00';
    ctx.font = '8px monospace';
    ctx.fillText(this.aiState.substring(0, 3).toUpperCase(), this.x, this.y - 13);
    
    // Phase 2: Draw awareness state indicator
    this.drawAwarenessIndicator(ctx);
  }
  
  /**
   * Draw awareness state indicator above enemy
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawAwarenessIndicator(ctx) {
    if (!this.awarenessState || this.awarenessState === 'unaware') return;
    
    let color = '#ffffff';
    let symbol = '';
    
    switch (this.awarenessState) {
      case 'suspicious':
        color = '#ffff00';
        symbol = '?';
        break;
      case 'alert':
        color = '#ff8800';
        symbol = '!';
        break;
      case 'combat':
        color = '#ff0000';
        symbol = '!!';
        break;
    }
    
    // Draw colored outline on enemy
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
    
    // Draw exclamation/question mark
    if (symbol) {
      ctx.fillStyle = color;
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(symbol, this.x + this.width / 2, this.y - 18);
      ctx.textAlign = 'left';
    }
    
    // Draw awareness level meter
    if (this.awarenessLevel > 0 && this.awarenessLevel < 1) {
      const meterWidth = this.width;
      const meterHeight = 3;
      const meterY = this.y - 16;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(this.x, meterY, meterWidth, meterHeight);
      ctx.fillStyle = color;
      ctx.fillRect(this.x, meterY, meterWidth * this.awarenessLevel, meterHeight);
    }
  }

  /**
   * Render drone enemy (unique flying shape)
   */
  renderDrone(ctx, bodyColor, bodyLight, bodyDark) {
    // Shadow on ground (lower)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(this.x + 4, this.y + this.height + this.flyHeight - 20, this.width - 8, 6);
    
    // Drone body (oval-ish shape)
    ctx.fillStyle = bodyColor;
    ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8);
    
    // Body highlights
    ctx.fillStyle = bodyLight;
    ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, 4);
    ctx.fillRect(this.x + 4, this.y + 4, 4, this.height - 8);
    
    // Body shadows
    ctx.fillStyle = bodyDark;
    ctx.fillRect(this.x + 4, this.y + this.height - 8, this.width - 8, 4);
    ctx.fillRect(this.x + this.width - 8, this.y + 4, 4, this.height - 8);
    
    // Cockpit/eye
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(this.x + 10, this.y + 8, 12, 6);
    ctx.fillStyle = '#ff6666';
    ctx.fillRect(this.x + 11, this.y + 9, 4, 2);
    
    // Rotors (animated based on time)
    const rotorPhase = Date.now() / 50 % 8;
    ctx.fillStyle = '#333333';
    
    // Left rotor
    if (rotorPhase < 4) {
      ctx.fillRect(this.x - 4, this.y + 2, 10, 3);
    } else {
      ctx.fillRect(this.x - 2, this.y + 2, 6, 3);
    }
    
    // Right rotor
    if (rotorPhase < 4) {
      ctx.fillRect(this.x + this.width - 6, this.y + 2, 10, 3);
    } else {
      ctx.fillRect(this.x + this.width - 4, this.y + 2, 6, 3);
    }
    
    // Weapon pod
    ctx.fillStyle = '#222222';
    ctx.fillRect(this.x + this.width / 2 - 3, this.y + this.height - 6, 6, 8);
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(this.x + this.width / 2 - 1, this.y + this.height, 2, 4);
    
    // Outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8);
    
    // Health bar
    const barWidth = this.width;
    const barHeight = 4;
    const healthPercent = this.health / this.maxHealth;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(this.x - 1, this.y - 10, barWidth + 2, barHeight + 2);
    ctx.fillStyle = '#660000';
    ctx.fillRect(this.x, this.y - 9, barWidth, barHeight);
    ctx.fillStyle = '#ff3333';
    ctx.fillRect(this.x, this.y - 9, barWidth * healthPercent, barHeight);
    
    // AI state
    ctx.fillStyle = '#ffff00';
    ctx.font = '8px monospace';
    ctx.fillText('DRN', this.x, this.y - 13);
  }

  /**
   * Draw elite/mini-boss aura effect
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawEliteAura(ctx) {
    const pulsePhase = Date.now() / 200;
    const pulseSize = 3 + Math.sin(pulsePhase) * 2;
    
    if (this.isMiniBoss) {
      // Mini-boss red/purple aura
      ctx.globalAlpha = 0.3 + Math.sin(pulsePhase) * 0.1;
      ctx.fillStyle = '#aa00aa';
      ctx.fillRect(
        this.x - pulseSize - 3,
        this.y - pulseSize - 3,
        this.width + pulseSize * 2 + 6,
        this.height + pulseSize * 2 + 6
      );
      ctx.fillStyle = '#ff0066';
      ctx.fillRect(
        this.x - pulseSize,
        this.y - pulseSize,
        this.width + pulseSize * 2,
        this.height + pulseSize * 2
      );
    } else if (this.isElite) {
      // Elite golden aura
      ctx.globalAlpha = 0.25 + Math.sin(pulsePhase) * 0.1;
      ctx.fillStyle = '#ffdd00';
      ctx.fillRect(
        this.x - pulseSize,
        this.y - pulseSize,
        this.width + pulseSize * 2,
        this.height + pulseSize * 2
      );
    }
    ctx.globalAlpha = 1;
    
    // Draw crown icon for elite/mini-boss
    this.drawEliteIndicator(ctx);
  }

  /**
   * Draw elite crown indicator above enemy
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawEliteIndicator(ctx) {
    const crownX = this.x + this.width / 2;
    const crownY = this.y - 20;
    
    if (this.isMiniBoss) {
      // Larger crown for mini-boss
      ctx.fillStyle = '#ff00ff';
      // Crown base
      ctx.fillRect(crownX - 8, crownY + 4, 16, 4);
      // Crown points
      ctx.fillRect(crownX - 8, crownY, 4, 4);
      ctx.fillRect(crownX - 2, crownY - 3, 4, 7);
      ctx.fillRect(crownX + 4, crownY, 4, 4);
      // Gem
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(crownX - 1, crownY - 2, 2, 2);
    } else if (this.isElite) {
      // Small crown for elite
      ctx.fillStyle = '#ffdd00';
      // Crown base
      ctx.fillRect(crownX - 5, crownY + 3, 10, 3);
      // Crown points
      ctx.fillRect(crownX - 5, crownY, 3, 3);
      ctx.fillRect(crownX - 1, crownY - 2, 2, 5);
      ctx.fillRect(crownX + 2, crownY, 3, 3);
    }
  }

  /**
   * Apply golden tint to a color (for elite enemies)
   * @param {string} color - Original color
   * @returns {string} Tinted color
   */
  applyGoldenTint(color) {
    // Parse the color
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Apply golden tint (increase red and green, decrease blue)
    const newR = Math.min(255, Math.floor(r * 1.2 + 30));
    const newG = Math.min(255, Math.floor(g * 1.1 + 20));
    const newB = Math.max(0, Math.floor(b * 0.6));
    
    return '#' + ((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, '0');
  }

  /**
   * Apply red/purple tint to a color (for mini-bosses)
   * @param {string} color - Original color
   * @returns {string} Tinted color
   */
  applyMiniBossTint(color) {
    // Parse the color
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Apply red/purple tint
    const newR = Math.min(255, Math.floor(r * 1.3 + 40));
    const newG = Math.max(0, Math.floor(g * 0.5));
    const newB = Math.min(255, Math.floor(b * 0.8 + 30));
    
    return '#' + ((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, '0');
  }

  /**
   * Render the medic enemy with green cross
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {string} bodyColor - Body color
   * @param {string} bodyLight - Light shade
   * @param {string} bodyDark - Dark shade
   */
  renderMedic(ctx, bodyColor, bodyLight, bodyDark) {
    // Draw green cross symbol on chest
    const crossX = this.x + this.width / 2;
    const crossY = this.y + 25;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(crossX - 1, crossY - 4, 2, 8);
    ctx.fillRect(crossX - 4, crossY - 1, 8, 2);
    
    // Draw heal beam if healing
    if (this.currentHealTarget && this.currentHealTarget.active) {
      ctx.strokeStyle = '#44ff44';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2);
      ctx.lineTo(
        this.currentHealTarget.x + this.currentHealTarget.width / 2,
        this.currentHealTarget.y + this.currentHealTarget.height / 2
      );
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  /**
   * Render the engineer enemy with wrench
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderEngineer(ctx) {
    // Draw wrench icon on belt
    const wrenchX = this.x + this.width / 2 - 3;
    const wrenchY = this.y + 38;
    
    ctx.fillStyle = '#888888';
    ctx.fillRect(wrenchX, wrenchY, 6, 2);
    ctx.fillRect(wrenchX - 1, wrenchY - 2, 2, 2);
    ctx.fillRect(wrenchX + 5, wrenchY - 2, 2, 2);
  }

  /**
   * Render the flamethrower enemy with flame effect
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderFlamethrower(ctx) {
    // Draw fuel tank on back
    const tankX = this.x + (this.facing > 0 ? 2 : this.width - 10);
    const tankY = this.y + 20;
    
    ctx.fillStyle = '#663300';
    ctx.fillRect(tankX, tankY, 8, 20);
    ctx.fillStyle = '#884400';
    ctx.fillRect(tankX + 1, tankY + 1, 6, 18);
    
    // Draw flamethrower nozzle
    if (this.isFiring) {
      const nozzleX = this.x + this.width / 2 + (this.facing * 20);
      const nozzleY = this.y + this.height / 2;
      
      // Draw flame cone
      ctx.globalAlpha = 0.7;
      const gradient = ctx.createRadialGradient(
        nozzleX, nozzleY, 5,
        nozzleX + this.facing * 60, nozzleY, 80
      );
      gradient.addColorStop(0, '#ffff00');
      gradient.addColorStop(0.3, '#ff6600');
      gradient.addColorStop(0.7, '#ff3300');
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(nozzleX, nozzleY - 10);
      ctx.lineTo(nozzleX + this.facing * this.attackRange * 0.8, nozzleY - 40);
      ctx.lineTo(nozzleX + this.facing * this.attackRange * 0.8, nozzleY + 40);
      ctx.lineTo(nozzleX, nozzleY + 10);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    
    // Draw reload indicator
    if (this.isReloading) {
      const reloadProgress = this.reloadingTime / this.flameReloadTime;
      ctx.fillStyle = '#333333';
      ctx.fillRect(this.x, this.y - 18, this.width, 4);
      ctx.fillStyle = '#ff6600';
      ctx.fillRect(this.x, this.y - 18, this.width * reloadProgress, 4);
    }
  }
}
