// Centralized Game Configuration for War Shooter
// This file contains all configurable game constants and settings

const GameConfig = {
  // Version info
  VERSION: '1.4.0',
  BUILD_DATE: '2024',

  // Display settings
  CANVAS_WIDTH: 1200,
  CANVAS_HEIGHT: 600,
  TARGET_FPS: 60,

  // World settings
  WORLD_WIDTH: 3000,
  WORLD_HEIGHT: 600,
  GROUND_LEVEL_OFFSET: 50, // Distance from bottom
  GRAVITY: 0.6,

  // Player settings
  PLAYER: {
    WIDTH: 30,
    HEIGHT: 50,
    SPEED: 4,
    JUMP_STRENGTH: -12,
    DEFAULT_HEALTH: 100,
    ROLL_DURATION: 400,
    ROLL_COOLDOWN: 800,
    SPAWN_PROTECTION_TIME: 1500,

    // Melee combat
    MELEE_COMBO_WINDOW: 1000,
    MELEE_COMBO_MAX: 3,
    MELEE_COMBO_BONUS: 0.25,

    // Block/Parry
    BLOCK_STAMINA: 100,
    BLOCK_DRAIN_RATE: 20,
    BLOCK_REGEN_RATE: 15,
    PARRY_WINDOW: 200,
    BLOCK_DAMAGE_REDUCTION: 0.75
  },

  // Character types
  CHARACTERS: {
    SOLDIER: {
      name: 'Soldier',
      health: 100,
      speed: 4,
      ability: 'Airstrike',
      cooldown: 12000,
      description: 'Balanced stats, Airstrike ability'
    },
    SCOUT: {
      name: 'Scout',
      health: 80,
      speed: 6,
      ability: 'Sprint Boost',
      cooldown: 8000,
      description: 'Fast movement, Sprint Boost ability'
    },
    HEAVY: {
      name: 'Heavy',
      health: 150,
      speed: 3,
      ability: 'Shield',
      cooldown: 16000,
      description: 'High HP, Shield ability'
    },
    MEDIC: {
      name: 'Medic',
      health: 90,
      speed: 4.5,
      ability: 'Med Pack',
      cooldown: 10000,
      healRate: 1,
      description: 'Passive healing, Med Pack ability'
    }
  },

  // Enemy settings
  ENEMY: {
    SPAWN_RATE: 30000, // Base spawn rate in ms

    TYPES: {
      INFANTRY: {
        name: 'Infantry',
        health: 50,
        speed: 2,
        damage: 10,
        aggroRange: 400,
        attackRange: 300,
        shootCooldown: 1000,
        color: '#ff3333',
        width: 28,
        height: 48,
        weapon: 'pistol'
      },
      HEAVY: {
        name: 'Heavy',
        health: 100,
        speed: 1.5,
        damage: 15,
        aggroRange: 400,
        attackRange: 300,
        shootCooldown: 800,
        color: '#cc0000',
        width: 32,
        height: 52,
        weapon: 'machinegun'
      },
      SNIPER: {
        name: 'Sniper',
        health: 40,
        speed: 1.8,
        damage: 25,
        aggroRange: 600,
        attackRange: 600,
        shootCooldown: 1500,
        color: '#660000',
        width: 28,
        height: 48,
        weapon: 'sniper'
      },
      SCOUT: {
        name: 'Scout',
        health: 30,
        speed: 3.5,
        damage: 8,
        aggroRange: 350,
        attackRange: 250,
        shootCooldown: 600,
        color: '#ff6666',
        width: 24,
        height: 44,
        weapon: 'pistol'
      },
      BOSS: {
        name: 'Boss',
        health: 600,
        speed: 2.2,
        damage: 25,
        aggroRange: 9999,
        attackRange: 700,
        shootCooldown: 400,
        color: '#990000',
        width: 50,
        height: 70,
        weapon: 'machinegun'
      },
      // New enemy types
      DRONE: {
        name: 'Drone',
        health: 60,
        speed: 3,
        damage: 12,
        aggroRange: 500,
        attackRange: 350,
        shootCooldown: 800,
        color: '#6666ff',
        width: 32,
        height: 24,
        weapon: 'laser',
        flying: true
      },
      BERSERKER: {
        name: 'Berserker',
        health: 70,
        speed: 5,
        damage: 35,
        aggroRange: 300,
        attackRange: 50,
        shootCooldown: 500,
        color: '#ff0066',
        width: 30,
        height: 50,
        weapon: 'melee',
        melee: true
      },
      BOMBER: {
        name: 'Bomber',
        health: 50,
        speed: 1.5,
        damage: 80,
        aggroRange: 350,
        attackRange: 80,
        shootCooldown: 0,
        color: '#ff6600',
        width: 35,
        height: 45,
        weapon: 'explosive',
        explosive: true,
        explosionRadius: 120
      },
      RIOT: {
        name: 'Riot',
        health: 80,
        speed: 2,
        damage: 15,
        aggroRange: 400,
        attackRange: 200,
        shootCooldown: 900,
        color: '#4466aa',
        width: 36,
        height: 52,
        weapon: 'pistol',
        shielded: true,
        shieldHealth: 100
      }
    }
  },

  // Difficulty multipliers
  DIFFICULTY: {
    BABY: {
      name: 'Baby',
      playerHealthMultiplier: 5.0,
      enemyCountMultiplier: 0.2,
      enemyDamageMultiplier: 0.3,
      enemyHealthMultiplier: 0.3,
      description: 'For beginners - very easy'
    },
    EASY: {
      name: 'Easy',
      playerHealthMultiplier: 2.5,
      enemyCountMultiplier: 0.4,
      enemyDamageMultiplier: 0.5,
      enemyHealthMultiplier: 0.5,
      description: 'Casual experience'
    },
    MEDIUM: {
      name: 'Medium',
      playerHealthMultiplier: 1.0,
      enemyCountMultiplier: 1.0,
      enemyDamageMultiplier: 1.0,
      enemyHealthMultiplier: 1.0,
      description: 'Standard difficulty'
    },
    EXTREME: {
      name: 'Extreme',
      playerHealthMultiplier: 0.7,
      enemyCountMultiplier: 1.5,
      enemyDamageMultiplier: 1.5,
      enemyHealthMultiplier: 1.5,
      description: 'For experts only'
    }
  },

  // Weapon configurations
  WEAPONS: {
    PISTOL: {
      name: 'Pistol',
      damage: 15,
      fireRate: 300,
      ammoCapacity: 12,
      reloadTime: 1500,
      projectileSpeed: 15,
      type: 'ranged'
    },
    RIFLE: {
      name: 'Rifle',
      damage: 25,
      fireRate: 150,
      ammoCapacity: 30,
      reloadTime: 2000,
      projectileSpeed: 20,
      type: 'ranged'
    },
    SHOTGUN: {
      name: 'Shotgun',
      damage: 50,
      fireRate: 800,
      ammoCapacity: 6,
      reloadTime: 2500,
      projectileSpeed: 12,
      pellets: 5,
      spread: 0.2,
      type: 'ranged'
    },
    MACHINEGUN: {
      name: 'Machine Gun',
      damage: 20,
      fireRate: 100,
      ammoCapacity: 100,
      reloadTime: 3000,
      projectileSpeed: 18,
      type: 'ranged'
    },
    SNIPER: {
      name: 'Sniper Rifle',
      damage: 150,
      fireRate: 1200,
      ammoCapacity: 5,
      reloadTime: 2500,
      projectileSpeed: 30,
      type: 'ranged'
    },
    GRENADE_LAUNCHER: {
      name: 'Grenade Launcher',
      damage: 150,
      fireRate: 2000,
      ammoCapacity: 6,
      reloadTime: 3000,
      projectileSpeed: 10,
      explosionRadius: 80,
      type: 'explosive'
    },
    LASER: {
      name: 'Laser Gun',
      damage: 30,
      fireRate: 80,
      ammoCapacity: 999,
      reloadTime: 2000,
      projectileSpeed: 25,
      type: 'energy'
    },
    ROCKET_LAUNCHER: {
      name: 'Rocket Launcher',
      damage: 200,
      fireRate: 2500,
      ammoCapacity: 5,
      reloadTime: 3500,
      projectileSpeed: 12,
      explosionRadius: 150,
      type: 'explosive'
    },
    MOLOTOV: {
      name: 'Molotov Cocktail',
      damage: 15,
      fireRate: 2000,
      ammoCapacity: 3,
      reloadTime: 4000,
      projectileSpeed: 8,
      fireRadius: 100,
      fireDuration: 5000,
      type: 'fire'
    },
    MINE_LAUNCHER: {
      name: 'Mine Launcher',
      damage: 100,
      fireRate: 1500,
      ammoCapacity: 5,
      reloadTime: 3000,
      projectileSpeed: 10,
      explosionRadius: 80,
      armTime: 1000,
      triggerRadius: 80,
      maxMines: 5,
      type: 'trap'
    },
    // Melee weapons
    KNIFE: {
      name: 'Knife',
      damage: 35,
      fireRate: 300,
      range: 60,
      type: 'melee'
    },
    SWORD: {
      name: 'Sword',
      damage: 60,
      fireRate: 500,
      range: 80,
      type: 'melee'
    },
    AXE: {
      name: 'Axe',
      damage: 80,
      fireRate: 700,
      range: 70,
      type: 'melee'
    },
    HAMMER: {
      name: 'Hammer',
      damage: 100,
      fireRate: 900,
      range: 75,
      type: 'melee'
    },
    SPEAR: {
      name: 'Spear',
      damage: 70,
      fireRate: 600,
      range: 100,
      type: 'melee'
    }
  },

  // Audio settings
  AUDIO: {
    MASTER_VOLUME: 1.0,
    MUSIC_VOLUME: 0.7,
    SFX_VOLUME: 0.8
  },

  // Game modes
  MODES: {
    CAMPAIGN: {
      name: 'Campaign',
      maxLevels: 20,
      description: 'Story-driven campaign with 20 levels across 9 acts'
    },
    SURVIVAL: {
      name: 'Survival',
      waveDuration: 30000,
      description: 'Endless wave-based survival mode'
    },
    MULTIPLAYER: {
      name: 'Multiplayer',
      maxPlayers: 2,
      description: 'Online co-op or versus mode'
    },
    BASE_DEFENSE: {
      name: 'Base Defense',
      maxWaves: 20,
      description: 'Protect your base from 20 waves of enemies'
    }
  },

  // Campaign levels
  CAMPAIGN_LEVELS: [
    // Act 1: Training (Levels 1-3)
    { name: 'Basic Training', act: 1, isBoss: false, biome: 'DEFAULT' },
    { name: 'First Contact', act: 1, isBoss: false, biome: 'DEFAULT' },
    { name: 'Boss Arena: The Warlord', act: 1, isBoss: true, bossId: 0, biome: 'DEFAULT' },
    // Act 2: Escalation (Levels 4-6)
    { name: 'Heavy Assault', act: 2, isBoss: false, biome: 'DEFAULT' },
    { name: 'Sniper Alley', act: 2, isBoss: false, biome: 'DEFAULT' },
    { name: 'Boss Arena: The Devastator', act: 2, isBoss: true, bossId: 1, biome: 'DEFAULT' },
    // Act 3: Urban Conflict (Levels 7-10)
    { name: 'Urban Warfare', act: 3, isBoss: false, biome: 'URBAN' },
    { name: 'Industrial Complex', act: 3, isBoss: false, biome: 'FACILITY' },
    { name: 'Boss Arena: The Annihilator', act: 3, isBoss: true, bossId: 2, biome: 'FACILITY' },
    { name: 'Final Boss: The Overlord', act: 4, isBoss: true, bossId: 3, biome: 'DEFAULT' },
    // Act 5: Desert Campaign (Levels 11-12)
    { name: 'Desert Outpost', act: 5, isBoss: false, biome: 'DESERT' },
    { name: 'Boss Arena: Sandworm', act: 5, isBoss: true, bossId: 4, biome: 'DESERT' },
    // Act 6: Frozen Wastes (Levels 13-14)
    { name: 'Tundra Expedition', act: 6, isBoss: false, biome: 'SNOW' },
    { name: 'Boss Arena: Frost Titan', act: 6, isBoss: true, bossId: 5, biome: 'SNOW' },
    // Act 7: City Assault (Levels 15-16)
    { name: 'City Assault', act: 7, isBoss: false, biome: 'URBAN', hasSecretPath: true },
    { name: 'Rooftop Escape', act: 7, isBoss: false, biome: 'URBAN' },
    // Act 8: Facility Infiltration (Levels 17-18)
    { name: 'Lab Infiltration', act: 8, isBoss: false, biome: 'FACILITY' },
    { name: 'Reactor Survival', act: 8, isBoss: true, bossId: 6, biome: 'FACILITY', hasSecretPath: true },
    // Act 9: Forest & Final Battle (Levels 19-20)
    { name: 'Forest Ambush', act: 9, isBoss: false, biome: 'FOREST' },
    { name: 'Boss Arena: Hell Knight', act: 9, isBoss: true, bossId: 7, biome: 'HELL' }
  ],

  // Boss configurations
  BOSSES: [
    {
      id: 0,
      name: 'The Warlord',
      healthMultiplier: 1.1,
      damageMultiplier: 1.0,
      speedMultiplier: 1.0,
      mechanic: 'rage',
      description: 'Gets faster and stronger below 50% HP'
    },
    {
      id: 1,
      name: 'The Devastator',
      healthMultiplier: 1.5,
      damageMultiplier: 1.1,
      speedMultiplier: 1.0,
      mechanic: 'summon',
      summonCooldown: 15000,
      description: 'Summons minions periodically'
    },
    {
      id: 2,
      name: 'The Annihilator',
      healthMultiplier: 2.0,
      damageMultiplier: 1.2,
      speedMultiplier: 1.1,
      mechanic: 'shield',
      shieldCooldown: 20000,
      description: 'Has periodic shield phases'
    },
    {
      id: 3,
      name: 'The Overlord',
      healthMultiplier: 3.5,
      damageMultiplier: 1.8,
      speedMultiplier: 1.5,
      mechanic: 'all',
      summonCooldown: 13000,
      shieldCooldown: 18000,
      description: 'Final boss with all mechanics'
    },
    {
      id: 4,
      name: 'Sandworm',
      health: 2000,
      healthMultiplier: 1.0,
      damageMultiplier: 1.3,
      speedMultiplier: 0.8,
      mechanic: 'burrow',
      burrowDuration: 3000,
      emergeDamage: 80,
      sandProjectiles: 5,
      description: 'Burrows underground, emerges with slam attack, fires sand projectiles'
    },
    {
      id: 5,
      name: 'Frost Titan',
      health: 2500,
      healthMultiplier: 1.0,
      damageMultiplier: 1.4,
      speedMultiplier: 0.7,
      mechanic: 'freeze',
      iceArmorReduction: 0.5,
      freezeBeamDuration: 2000,
      blizzardCooldown: 12000,
      description: 'Has ice armor, freeze beam attack, summons blizzards'
    },
    {
      id: 6,
      name: 'Mech Commander',
      mechHealth: 3000,
      pilotHealth: 500,
      healthMultiplier: 1.0,
      damageMultiplier: 1.5,
      speedMultiplier: 1.2,
      mechanic: 'twophase',
      minigunFireRate: 100,
      missileCooldown: 5000,
      missileCount: 4,
      description: '2-phase boss: mech phase with minigun/missiles, then pilot phase'
    },
    {
      id: 7,
      name: 'Hell Knight',
      health: 4000,
      healthMultiplier: 1.0,
      damageMultiplier: 2.0,
      speedMultiplier: 1.5,
      mechanic: 'fourphase',
      phases: [
        { name: 'Fire Sword', healthThreshold: 1.0, ability: 'firesword' },
        { name: 'Meteor Rain', healthThreshold: 0.75, ability: 'meteors' },
        { name: 'Lava Pool', healthThreshold: 0.5, ability: 'lava' },
        { name: 'Inferno', healthThreshold: 0.25, ability: 'inferno' }
      ],
      description: '4-phase final boss: fire sword, meteors, lava pools, inferno mode'
    }
  ],

  // Pickup types
  PICKUPS: {
    HEALTH: {
      name: 'Health Pack',
      value: 30,
      color: '#00ff00'
    },
    AMMO: {
      name: 'Ammo Box',
      value: 30,
      color: '#ffff00'
    },
    DAMAGE_BOOST: {
      name: 'Damage Boost',
      duration: 10000,
      multiplier: 2.0,
      color: '#ff0000'
    },
    SPEED_BOOST: {
      name: 'Speed Boost',
      duration: 8000,
      multiplier: 1.5,
      color: '#00ffff'
    },
    RAPID_FIRE: {
      name: 'Rapid Fire',
      duration: 10000,
      multiplier: 0.5,
      color: '#ff6600'
    },
    MULTI_SHOT: {
      name: 'Multi-Shot',
      duration: 15000,
      color: '#ff00ff'
    },
    INVINCIBILITY: {
      name: 'Invincibility',
      duration: 5000,
      color: '#ffffff'
    },
    SHIELD: {
      name: 'Shield',
      duration: 30000,
      shieldHealth: 50,
      color: '#00aaff'
    }
  },

  // Particle system
  PARTICLES: {
    MAX_PARTICLES: 500,
    QUALITY_SETTINGS: {
      low: 0.3,
      medium: 0.6,
      high: 1.0
    }
  },

  // Camera settings
  CAMERA: {
    SMOOTHNESS: 0.1,
    SHAKE_DECAY: 0.9
  },

  // UI settings
  UI: {
    HUD_OPACITY: 0.9,
    CROSSHAIR_STYLES: ['none', 'cross', 'dot', 'circle'],
    MINIMAP_WIDTH: 150,
    MINIMAP_HEIGHT: 80
  },

  // Tutorial steps
  TUTORIAL_STEPS: [
    { id: 'movement', name: 'Movement', description: 'Learn to move with WASD or Arrow keys' },
    { id: 'jumping', name: 'Jumping', description: 'Jump with W, Space, or Up Arrow' },
    { id: 'shooting', name: 'Shooting', description: 'Shoot with Left Click' },
    { id: 'weapon_switch', name: 'Weapon Switching', description: 'Switch weapons with 1-4 keys' },
    { id: 'cover', name: 'Using Cover', description: 'Take cover behind obstacles' },
    { id: 'ability', name: 'Special Abilities', description: 'Use E or Q for special ability' },
    { id: 'roll', name: 'Rolling/Dodging', description: 'Roll with C or Ctrl key' },
    { id: 'melee', name: 'Melee Combat', description: 'Melee attack with F or Right Click' },
    { id: 'block', name: 'Blocking', description: 'Block with V key (requires melee weapon)' },
    { id: 'pickups', name: 'Picking Up Items', description: 'Walk over items to collect them' },
    { id: 'hud', name: 'Reading HUD', description: 'Understand the heads-up display' }
  ],

  // Achievement categories
  ACHIEVEMENT_CATEGORIES: {
    COMBAT: 'combat',
    SURVIVAL: 'survival',
    CAMPAIGN: 'campaign',
    SKILL: 'skill',
    COLLECTION: 'collection'
  },

  // Scoring
  SCORING: {
    KILL_BASE: 100,
    COMBO_BONUS_PER_LEVEL: 10,
    COMBO_MAX_BONUS: 100,
    WAVE_COMPLETION_MULTIPLIER: 500,
    LEVEL_COMPLETION_MULTIPLIER: 1000,
    BOSS_KILL_BONUS: 1000,
    WEAPON_COLLECT_BONUS: 50
  },

  // Combo system
  COMBO: {
    TIMEOUT: 3000, // Time to maintain combo
    MAX_MULTIPLIER: 10
  },

  // Fullscreen settings
  FULLSCREEN: {
    KEYBOARD_SHORTCUT: 'F11',
    ALTERNATE_SHORTCUT: '`',
    MAINTAIN_ASPECT_RATIO: true
  },

  // Phase 1: Environmental Hazards Configuration
  HAZARDS: {
    TURRET: {
      health: 50,
      damage: 25,
      range: 400,
      fireRate: 1.5 // seconds between shots
    },
    BARREL: {
      damage: 50,
      radius: 100
    },
    SPIKE: {
      damage: 30,
      cycle: 2, // seconds per cycle
      warning: 0.5 // seconds of warning before activation
    },
    LASER: {
      damage: 15 // damage per second
    },
    TOXIC: {
      damage: 5, // damage per second
      slowdown: 0.3 // 30% speed reduction
    },
    LAVA: {
      damage: 40 // damage per second
    }
  },

  // Phase 1: Elite Enemy System Configuration
  ELITE: {
    healthMultiplier: 2,
    damageMultiplier: 1.5,
    speedMultiplier: 1.2,
    scoreMultiplier: 2,
    spawnChance: 0.1, // 10% chance
    startWave: 3 // Elites start spawning at wave 3
  },

  // Phase 1: Mini-Boss Configuration
  MINIBOSS: {
    healthMultiplier: 6,
    damageMultiplier: 4.5,
    spawnInterval: 3 // Every 3 waves in survival
  },

  // Phase 1: New Enemy Types Configuration
  ENEMIES: {
    MEDIC: {
      health: 80,
      healAmount: 15,
      healRate: 3, // seconds between heals
      healRange: 200
    },
    ENGINEER: {
      health: 100,
      turretHealth: 30,
      turretDamage: 10,
      maxTurrets: 2,
      deployCooldown: 8 // seconds
    },
    FLAMETHROWER: {
      health: 150,
      damage: 12, // damage per tick
      range: 150,
      arc: 90, // degrees
      duration: 5 // seconds of firing before reload
    }
  },

  // Phase 2: Upgrade System Configuration
  UPGRADES: {
    HEALTH: { max: 5, costs: [500, 1000, 1500, 2500, 4000], bonuses: [20, 40, 60, 80, 100] },
    DAMAGE: { max: 5, costs: [500, 1000, 1500, 2500, 4000], bonuses: [0.1, 0.2, 0.3, 0.45, 0.6] },
    SPEED: { max: 5, costs: [500, 1000, 1500, 2500, 4000], bonuses: [0.15, 0.3, 0.45, 0.6, 0.75] },
    RELOAD: { max: 5, costs: [500, 1000, 1500, 2500, 4000], bonuses: [0.1, 0.2, 0.3, 0.4, 0.5] },
    COOLDOWN: { max: 5, costs: [500, 1000, 1500, 2500, 4000], bonuses: [0.1, 0.2, 0.3, 0.4, 0.5] },
    ARMOR: { max: 5, costs: [500, 1000, 1500, 2500, 4000], bonuses: [0.05, 0.1, 0.15, 0.22, 0.3] }
  },

  // Phase 2: Currency System Configuration
  CURRENCY: {
    enemyDropRange: { min: 5, max: 10 },
    eliteMultiplier: 3,
    miniBossMultiplier: 8,
    bossMultiplier: 40,
    pickupRange: 50,
    waveBonus: 50,
    destructionDrop: { min: 2, max: 5 }
  },

  // Phase 2: Shop System Configuration
  SHOP: {
    spawnInterval: 5,
    items: {
      healthRefill: 100,
      ammoPack: 50,
      randomPowerup: 150,
      tempUpgrade: 200,
      weaponUnlock: 500,
      reviveToken: 300
    }
  },

  // Phase 2: Weapon Attachments Configuration
  ATTACHMENTS: {
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
  },

  // Phase 2: Stealth System Configuration
  STEALTH: {
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
  },

  // Phase 2: Enemy Formation Configuration
  FORMATIONS: {
    LINE: { spacing: 80, minMembers: 3 },
    V_SHAPE: { angle: 60, spacing: 100, minMembers: 3 },
    CIRCLE: { minMembers: 4 },
    PINCER: { angle: 180, minMembers: 4 },
    FIRING_LINE: { frontSpacing: 80, rowSpacing: 100, minMembers: 4 },
    SCATTER: { minDistance: 100, maxDistance: 200, minMembers: 2 },
    reformTime: 5
  },

  // Phase 2: Tactical AI Configuration
  TACTICAL_AI: {
    coverSeekThreshold: 0.3,
    blindFireAccuracyPenalty: 0.5,
    flankingDistance: 200,
    retreatHealthThreshold: 0.2,
    suppressionFireRate: 0.5,
    grenadeTossChance: 0.1,
    grenadeFuseTime: 3,
    coverEvaluationRadius: 300
  },

  // Phase 3: Weather System Configuration
  WEATHER: {
    CLEAR: {
      visibilityMultiplier: 1.0,
      speedPenalty: 0,
      stealthBonus: 0,
      damage: 0
    },
    RAIN: {
      visibilityMultiplier: 0.8,
      speedPenalty: 0,
      slideChance: 0.1,
      stealthBonus: 0.2,
      particleCount: 500,
      particleSpeed: 8,
      puddleFrequency: 200 // pixels between puddles
    },
    FOG: {
      visibilityMultiplier: 0.5,
      speedPenalty: 0,
      stealthBonus: 0.7,
      cloudDriftSpeed: 0.5,
      cloudCount: 8
    },
    SNOW: {
      visibilityMultiplier: 0.7,
      speedPenalty: 0.15,
      stealthBonus: 0.3,
      coldDamage: 1, // damage per 5 seconds
      footprintDuration: 5000, // ms
      particleCount: 300
    },
    SANDSTORM: {
      visibilityMultiplier: 0.4,
      speedPenalty: 0.2,
      damage: 2, // damage per second
      shakeIntensity: 2,
      particleCount: 400
    },
    transitionDuration: 3000 // ms to transition between weather states
  },

  // Phase 3: Time of Day System Configuration
  TIME_OF_DAY: {
    DAY: {
      brightness: 1.0,
      enemyVisionMultiplier: 1.0,
      stealthBonus: 0,
      tint: null
    },
    DUSK: {
      brightness: 0.7,
      enemyVisionMultiplier: 0.8,
      stealthBonus: 0.2,
      tint: { r: 255, g: 150, b: 100 },
      transitionDuration: 60000 // 60 seconds transition
    },
    NIGHT: {
      brightness: 0.4,
      enemyVisionMultiplier: 0.5,
      stealthBonus: 0.5,
      tint: { r: 50, g: 50, b: 100 }
    },
    cycleDuration: 300000 // 5 minutes per full cycle
  },

  // Phase 3: Flashlight Configuration
  FLASHLIGHT: {
    range: 200, // pixels
    coneAngle: 45, // degrees
    battery: 30, // seconds of use
    rechargeRate: 0.5, // battery per second when off
    toggleKey: 'f'
  },

  // Phase 3: Vehicle Configuration
  VEHICLES: {
    TANK: {
      health: 500,
      speed: 100, // pixels per second
      mainDamage: 100, // cannon damage
      mgDamage: 15, // machine gun damage
      armorReduction: 0.75, // 75% damage reduction
      crushDamage: 200, // damage to enemies when run over
      cannonCooldown: 2000, // ms
      mgCooldown: 100, // ms
      fuelCapacity: 100,
      fuelConsumption: 2 // per second
    },
    JEEP: {
      health: 200,
      speed: 300, // pixels per second
      mountedGunDamage: 20,
      armorReduction: 0.25, // 25% damage reduction
      seats: 2,
      mountedGunCooldown: 150, // ms
      fuelCapacity: 80,
      fuelConsumption: 3 // per second
    },
    enterExitKey: 'e',
    explosionRadius: 150,
    explosionDamage: 100
  },

  // Phase 3: Mounted Weapons Configuration
  MOUNTED_WEAPONS: {
    HMG: {
      damage: 25,
      fireRate: 0.1, // seconds between shots
      range: 500,
      rotationSpeed: 180, // degrees per second
      maxRotation: 360, // degrees
      overheatShots: 50,
      cooldownTime: 3000, // ms to cool down
      shieldHealth: 100
    },
    SNIPER: {
      damage: 100,
      fireRate: 2, // seconds between shots
      range: 800,
      rotationSpeed: 45, // degrees per second
      maxRotation: 180, // degrees arc
      zoomLevel: 2.0
    },
    ROCKET: {
      damage: 150, // explosion damage
      fireRate: 4, // seconds between shots
      range: 600,
      rotationSpeed: 90, // degrees per second
      maxRotation: 270, // degrees
      ammoCapacity: 10,
      explosionRadius: 100
    },
    mountKey: 'e',
    vulnerableAngle: 120 // degrees of vulnerability from behind
  },

  // Phase 3: New Power-Ups Configuration
  POWERUPS: {
    TIME_SLOW: {
      duration: 5000, // 5 seconds
      slowdown: 0.7, // enemies move at 70% of their speed (30% slowdown)
      color: '#9933ff' // purple
    },
    DOUBLE_JUMP: {
      duration: 15000, // 15 seconds
      color: '#66ccff' // light blue
    },
    GRAPPLING_HOOK: {
      duration: 20000, // 20 seconds
      uses: 10,
      range: 300, // pixels
      pullSpeed: 400, // pixels per second
      color: '#996633' // brown
    },
    GHOST_MODE: {
      duration: 4000, // 4 seconds
      color: '#ffffff' // white with transparency
    },
    MAGNET: {
      duration: 10000, // 10 seconds
      range: 200, // pickup collection range
      coinMultiplier: 1.5,
      color: '#ff3366' // pink/magenta
    }
  },

  // Phase 4: Challenge Modes Configuration
  CHALLENGE_MODES: {
    TIME_ATTACK: {
      medals: { gold: 180, silver: 300, bronze: 480 }, // seconds
      skipCutscenes: true,
      instantRespawn: false,
      ghostReplay: true
    },
    BOSS_RUSH: {
      healthRefillPercent: 0.5,
      difficultyMultipliers: [1.0, 1.5, 2.0, 3.0],
      totalBosses: 4,
      randomPowerUp: true
    },
    HORDE: {
      waveScaling: 0.1, // +10% per wave
      eliteRampup: { start: 0.1, max: 0.5, reachAtWave: 20 },
      miniBossInterval: 5,
      bossInterval: 10,
      shopBetweenWaves: true
    },
    ONE_HIT: {
      playerHP: 1,
      enemyHealthMultiplier: 0.01, // one-shot enemies
      ghostModeSpawnRate: 0.2,
      noCheckpoints: true,
      noRevives: true
    }
  },

  // Phase 4: Character Skins Configuration
  SKINS: {
    DEFAULT: { id: 'default', color: 'original', unlocked: true, requirement: null },
    ELITE: { id: 'elite', color: 'gold', unlocked: false, requirement: 'beatCampaign' },
    SHADOW: { id: 'shadow', color: 'purple', unlocked: false, requirement: 'stealth50' },
    CRIMSON: { id: 'crimson', color: 'red', unlocked: false, requirement: 'kills1000' },
    ARCTIC: { id: 'arctic', color: 'white', unlocked: false, requirement: 'wave20' },
    DESERT: { id: 'desert', color: 'tan', unlocked: false, requirement: 'timeAttack' },
    FOREST: { id: 'forest', color: 'green', unlocked: false, requirement: 'bossRush' },
    NEON: { id: 'neon', color: 'bright', unlocked: false, requirement: 'coins10000' }
  },

  // Phase 4: Dynamic Events Configuration
  DYNAMIC_EVENTS: {
    chance: 0.15, // 15% per wave
    cooldown: 3, // minimum waves between events
    minWave: 3, // no events before wave 3
    positiveWeight: 0.4, // 40% positive, 60% negative
    SUPPLY_DROP: { type: 'positive', duration: 60, warningTime: 10 },
    REINFORCEMENTS: { type: 'negative', multiplier: 2 },
    ALLY_SUPPORT: { type: 'positive', duration: 60, allyHP: 150, allyDamage: 15 },
    AMBUSH: { type: 'negative', enemyCount: 8, warningTime: 3 },
    MALFUNCTION: { type: 'negative', duration: 15 },
    LUCKY_STRIKE: { type: 'positive', duration: 30, kills: 10 },
    HEAVY_ASSAULT: { type: 'negative', waves: 2 },
    FOG_OF_WAR: { type: 'negative', duration: 45 }
  },

  // Phase 4: Statistics Tracking Configuration
  STATISTICS: {
    saveInterval: 5, // seconds
    milestones: {
      kills: [100, 500, 1000, 5000, 10000],
      waves: [10, 25, 50, 100],
      playtime: [1, 5, 10, 50, 100] // hours
    },
    trackingEnabled: true
  },

  // Phase 4: Leaderboard Configuration
  LEADERBOARDS: {
    maxEntries: 10,
    localStorageKey: 'gameLeaderboards',
    categories: ['survival', 'campaign', 'timeAttack', 'bossRush', 'horde', 'oneHit', 'baseDefense']
  },

  // Phase 5: Biome System Configuration
  BIOMES: {
    DEFAULT: {
      name: 'Default',
      skyTop: '#4a5f7f',
      skyMid: '#6a7f9f',
      skyBottom: '#8a9fbf',
      groundBase: '#4a4a3a',
      groundDark: '#3a3a2a',
      groundLight: '#5a5a4a',
      grassColor: '#4a5a3a',
      weather: 'CLEAR',
      hazards: []
    },
    DESERT: {
      name: 'Desert',
      skyTop: '#c4a35a',
      skyMid: '#d4b36a',
      skyBottom: '#e4c37a',
      groundBase: '#c4a060',
      groundDark: '#a48040',
      groundLight: '#d4b070',
      grassColor: '#8a7030',
      weather: 'SANDSTORM',
      ambientDamage: 1,
      elements: ['sand', 'cacti', 'dunes'],
      hazards: ['quicksand', 'heatwave']
    },
    SNOW: {
      name: 'Snow',
      skyTop: '#b0c4de',
      skyMid: '#c0d4ee',
      skyBottom: '#d0e4ff',
      groundBase: '#e8e8f0',
      groundDark: '#c8c8d0',
      groundLight: '#f8f8ff',
      grassColor: '#d0d8e0',
      weather: 'SNOW',
      speedPenalty: 0.15,
      elements: ['ice', 'frozen_trees', 'snowdrifts'],
      hazards: ['icicles', 'thin_ice', 'blizzard']
    },
    URBAN: {
      name: 'Urban',
      skyTop: '#4a5565',
      skyMid: '#6a7585',
      skyBottom: '#8a95a5',
      groundBase: '#505050',
      groundDark: '#404040',
      groundLight: '#606060',
      grassColor: '#405040',
      weather: 'CLEAR',
      elements: ['buildings', 'streets', 'vehicles', 'debris'],
      hazards: ['falling_debris', 'gas_leaks']
    },
    FACILITY: {
      name: 'Facility',
      skyTop: '#303040',
      skyMid: '#404050',
      skyBottom: '#505060',
      groundBase: '#484858',
      groundDark: '#383848',
      groundLight: '#585868',
      grassColor: '#405060',
      weather: 'CLEAR',
      isIndoor: true,
      elements: ['labs', 'tech', 'machinery', 'pipes'],
      hazards: ['electrical', 'toxic_spill', 'laser_grids']
    },
    FOREST: {
      name: 'Forest',
      skyTop: '#4a6a4a',
      skyMid: '#5a7a5a',
      skyBottom: '#6a8a6a',
      groundBase: '#3a4a2a',
      groundDark: '#2a3a1a',
      groundLight: '#4a5a3a',
      grassColor: '#3a5a2a',
      weather: 'FOG',
      elements: ['trees', 'dense_cover', 'undergrowth'],
      hazards: ['bear_traps', 'pitfalls']
    },
    HELL: {
      name: 'Hell',
      skyTop: '#4a0000',
      skyMid: '#6a1010',
      skyBottom: '#8a2020',
      groundBase: '#3a2020',
      groundDark: '#2a1010',
      groundLight: '#5a3030',
      grassColor: '#4a1010',
      weather: 'CLEAR',
      ambientDamage: 2,
      elements: ['lava', 'fire', 'brimstone', 'skulls'],
      hazards: ['lava_pools', 'fire_geysers', 'meteor_rain'],
      tint: { r: 255, g: 100, b: 50 }
    }
  },

  // Phase 5: Secret Content Configuration
  SECRET_CONTENT: {
    SECRET_LEVELS: [
      {
        id: 'vault',
        name: 'The Vault',
        unlockCondition: 'collect_all_documents_act5',
        biome: 'FACILITY',
        enemies: ['elite_guards', 'security_bots'],
        rewards: ['legendary_weapon', 'skin_gold']
      },
      {
        id: 'arena',
        name: 'Combat Arena',
        unlockCondition: 'beat_all_bosses_no_damage',
        biome: 'DEFAULT',
        mode: 'endless_waves',
        rewards: ['skin_champion', 'title_gladiator']
      },
      {
        id: 'dev_room',
        name: 'Dev Room',
        unlockCondition: 'collect_all_lore_documents',
        biome: 'FACILITY',
        features: ['developer_messages', 'debug_weapons', 'easter_eggs'],
        rewards: ['skin_dev', 'all_weapons']
      }
    ],
    BRANCHING_PATHS: {
      level16: {
        condition: 'find_hidden_keycard',
        normalExit: 17,
        secretExit: 'vault'
      },
      level18: {
        condition: 'save_scientist',
        normalExit: 19,
        secretExit: 'arena'
      }
    },
    LORE_DOCUMENTS: {
      totalCount: 20,
      locations: [
        { level: 1, id: 'lore_1', name: 'Military Briefing', x: 500, y: 400 },
        { level: 2, id: 'lore_2', name: 'Field Report Alpha', x: 800, y: 350 },
        { level: 4, id: 'lore_3', name: 'Enemy Intel', x: 600, y: 380 },
        { level: 5, id: 'lore_4', name: 'Sniper\'s Journal', x: 1200, y: 320 },
        { level: 7, id: 'lore_5', name: 'Urban Warfare Manual', x: 900, y: 400 },
        { level: 8, id: 'lore_6', name: 'Industrial Secrets', x: 1100, y: 360 },
        { level: 11, id: 'lore_7', name: 'Desert Expedition Log', x: 700, y: 380 },
        { level: 12, id: 'lore_8', name: 'Sandworm Research', x: 1000, y: 340 },
        { level: 13, id: 'lore_9', name: 'Frozen Discovery', x: 800, y: 360 },
        { level: 14, id: 'lore_10', name: 'Titan Origins', x: 1200, y: 380 },
        { level: 15, id: 'lore_11', name: 'City Under Siege', x: 600, y: 340 },
        { level: 16, id: 'lore_12', name: 'Rooftop Transmissions', x: 900, y: 300 },
        { level: 17, id: 'lore_13', name: 'Lab Notes A', x: 700, y: 380 },
        { level: 17, id: 'lore_14', name: 'Lab Notes B', x: 1100, y: 360 },
        { level: 18, id: 'lore_15', name: 'Reactor Blueprints', x: 800, y: 340 },
        { level: 18, id: 'lore_16', name: 'Emergency Protocol', x: 1300, y: 380 },
        { level: 19, id: 'lore_17', name: 'Forest Recon', x: 600, y: 360 },
        { level: 19, id: 'lore_18', name: 'Ambush Aftermath', x: 1000, y: 340 },
        { level: 20, id: 'lore_19', name: 'Hell Gate Research', x: 800, y: 380 },
        { level: 20, id: 'lore_20', name: 'Final Revelation', x: 1500, y: 300 }
      ]
    }
  },

  // Phase 5: Base Defense Mode Configuration
  BASE_DEFENSE: {
    objectiveHealth: 1000,
    maxWaves: 20,
    waveDuration: 60000,
    waveBreakDuration: 30000,
    startingResources: 500,
    resourcesPerWave: 100,
    resourcesPerKill: 10,
    BUILDABLES: {
      BARRICADE: {
        name: 'Barricade',
        cost: 50,
        health: 200,
        width: 60,
        height: 80,
        blockProjectiles: true,
        maxCount: 10
      },
      TURRET: {
        name: 'Auto Turret',
        cost: 150,
        health: 100,
        damage: 15,
        fireRate: 500,
        range: 300,
        maxCount: 5
      },
      MINE: {
        name: 'Land Mine',
        cost: 30,
        damage: 100,
        radius: 80,
        maxCount: 15
      },
      HEAL_STATION: {
        name: 'Heal Station',
        cost: 200,
        healRate: 5,
        healRadius: 100,
        maxCount: 2
      },
      AMMO_STATION: {
        name: 'Ammo Station',
        cost: 100,
        ammoPerSecond: 2,
        ammoRadius: 80,
        maxCount: 3
      }
    },
    WAVE_SCALING: {
      enemyCountBase: 5,
      enemyCountPerWave: 2,
      healthScaling: 0.05,
      damageScaling: 0.03,
      bossWaves: [5, 10, 15, 20]
    }
  }
};

// Freeze the config to prevent accidental modifications
Object.freeze(GameConfig);
Object.freeze(GameConfig.PLAYER);
Object.freeze(GameConfig.CHARACTERS);
Object.freeze(GameConfig.ENEMY);
Object.freeze(GameConfig.ENEMY.TYPES);
Object.freeze(GameConfig.DIFFICULTY);
Object.freeze(GameConfig.WEAPONS);
Object.freeze(GameConfig.AUDIO);
Object.freeze(GameConfig.MODES);
Object.freeze(GameConfig.BOSSES);
Object.freeze(GameConfig.PICKUPS);
Object.freeze(GameConfig.PARTICLES);
Object.freeze(GameConfig.CAMERA);
Object.freeze(GameConfig.UI);
Object.freeze(GameConfig.SCORING);
Object.freeze(GameConfig.COMBO);
Object.freeze(GameConfig.FULLSCREEN);
Object.freeze(GameConfig.HAZARDS);
Object.freeze(GameConfig.ELITE);
Object.freeze(GameConfig.MINIBOSS);
Object.freeze(GameConfig.ENEMIES);
Object.freeze(GameConfig.UPGRADES);
Object.freeze(GameConfig.CURRENCY);
Object.freeze(GameConfig.SHOP);
Object.freeze(GameConfig.ATTACHMENTS);
Object.freeze(GameConfig.STEALTH);
Object.freeze(GameConfig.FORMATIONS);
Object.freeze(GameConfig.TACTICAL_AI);
Object.freeze(GameConfig.WEATHER);
Object.freeze(GameConfig.TIME_OF_DAY);
Object.freeze(GameConfig.FLASHLIGHT);
Object.freeze(GameConfig.VEHICLES);
Object.freeze(GameConfig.MOUNTED_WEAPONS);
Object.freeze(GameConfig.POWERUPS);
Object.freeze(GameConfig.CHALLENGE_MODES);
Object.freeze(GameConfig.SKINS);
Object.freeze(GameConfig.DYNAMIC_EVENTS);
Object.freeze(GameConfig.STATISTICS);
Object.freeze(GameConfig.LEADERBOARDS);
Object.freeze(GameConfig.BIOMES);
Object.freeze(GameConfig.SECRET_CONTENT);
Object.freeze(GameConfig.BASE_DEFENSE);
