// Centralized Game Configuration for War Shooter
// This file contains all configurable game constants and settings

const GameConfig = {
  // Version info
  VERSION: '1.0.0',
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
      maxLevels: 10,
      description: 'Story-driven campaign with 10 levels'
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
    }
  },

  // Campaign levels
  CAMPAIGN_LEVELS: [
    { name: 'Basic Training', act: 1, isBoss: false },
    { name: 'First Contact', act: 1, isBoss: false },
    { name: 'Boss Arena: The Warlord', act: 1, isBoss: true, bossId: 0 },
    { name: 'Heavy Assault', act: 2, isBoss: false },
    { name: 'Sniper Alley', act: 2, isBoss: false },
    { name: 'Boss Arena: The Devastator', act: 2, isBoss: true, bossId: 1 },
    { name: 'Urban Warfare', act: 3, isBoss: false },
    { name: 'Industrial Complex', act: 3, isBoss: false },
    { name: 'Boss Arena: The Annihilator', act: 3, isBoss: true, bossId: 2 },
    { name: 'Final Boss: The Overlord', act: 4, isBoss: true, bossId: 3 }
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
