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
