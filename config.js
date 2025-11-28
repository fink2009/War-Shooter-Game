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

  // Campaign levels with per-level visual profiles for dramatic variety
  CAMPAIGN_LEVELS: [
    // Act 1: Training (Levels 1-3) - Soft morning atmosphere, gentle introduction
    { 
      name: 'Basic Training', 
      act: 1, 
      isBoss: false, 
      biome: 'DEFAULT',
      visualProfile: {
        skyVariant: 'morning_hazy',
        parallaxLayers: ['distant_hills', 'radio_towers'],
        foregroundProps: ['sandbags', 'training_targets', 'crates'],
        silhouetteStyle: 'soft_rolling_hills',
        weatherOverride: 'CLEAR',
        timeOfDayOverride: 'DAY',
        groundShapeProfile: 'flat_training_range',
        platformDensity: 0.3,
        landmarkCount: 2,
        clutterDensity: 0.3,
        colorGrading: { brightness: 1.1, warmth: 0.1 }
      }
    },
    { 
      name: 'First Contact', 
      act: 1, 
      isBoss: false, 
      biome: 'DEFAULT',
      visualProfile: {
        skyVariant: 'noon_clear',
        parallaxLayers: ['distant_hills', 'destroyed_vehicles', 'smoke_plumes'],
        foregroundProps: ['sandbags', 'ammo_crates', 'barricades', 'shell_casings'],
        silhouetteStyle: 'gentle_slopes',
        weatherOverride: 'CLEAR',
        timeOfDayOverride: 'DAY',
        groundShapeProfile: 'rolling_terrain',
        platformDensity: 0.4,
        landmarkCount: 2,
        clutterDensity: 0.4,
        colorGrading: { brightness: 1.0, warmth: 0.0 }
      }
    },
    { 
      name: 'Boss Arena: The Warlord', 
      act: 1, 
      isBoss: true, 
      bossId: 0, 
      biome: 'DEFAULT',
      visualProfile: {
        skyVariant: 'stormy_dramatic',
        parallaxLayers: ['dark_mountains', 'war_banners', 'distant_explosions'],
        foregroundProps: ['skull_piles', 'war_banners', 'burning_debris', 'chains'],
        silhouetteStyle: 'jagged_peaks',
        weatherOverride: 'CLEAR',
        timeOfDayOverride: 'DUSK',
        groundShapeProfile: 'arena_pit',
        platformDensity: 0.2,
        landmarkCount: 3,
        clutterDensity: 0.5,
        colorGrading: { brightness: 0.85, warmth: -0.1, contrast: 1.2 },
        bossArenaFeatures: { dramaticLighting: true, bloodStains: true }
      }
    },
    // Act 2: Escalation (Levels 4-6) - Intensifying conflict, afternoon heat
    { 
      name: 'Heavy Assault', 
      act: 2, 
      isBoss: false, 
      biome: 'DEFAULT',
      visualProfile: {
        skyVariant: 'afternoon_haze',
        parallaxLayers: ['artillery_positions', 'tank_wrecks', 'smoke_columns'],
        foregroundProps: ['tank_traps', 'craters', 'shell_casings', 'debris_piles'],
        silhouetteStyle: 'cratered_battlefield',
        weatherOverride: 'CLEAR',
        timeOfDayOverride: 'DAY',
        groundShapeProfile: 'war_torn',
        platformDensity: 0.5,
        landmarkCount: 3,
        clutterDensity: 0.6,
        colorGrading: { brightness: 0.95, warmth: 0.15 }
      }
    },
    { 
      name: 'Sniper Alley', 
      act: 2, 
      isBoss: false, 
      biome: 'DEFAULT',
      visualProfile: {
        skyVariant: 'overcast_gray',
        parallaxLayers: ['ruined_buildings', 'sniper_nests', 'broken_walls'],
        foregroundProps: ['rubble', 'broken_windows', 'bullet_holes', 'warning_signs'],
        silhouetteStyle: 'urban_ruins',
        weatherOverride: 'FOG',
        timeOfDayOverride: 'DAY',
        groundShapeProfile: 'uneven_rubble',
        platformDensity: 0.6,
        landmarkCount: 2,
        clutterDensity: 0.7,
        colorGrading: { brightness: 0.8, warmth: -0.1 }
      }
    },
    { 
      name: 'Boss Arena: The Devastator', 
      act: 2, 
      isBoss: true, 
      bossId: 1, 
      biome: 'DEFAULT',
      visualProfile: {
        skyVariant: 'blood_red_sunset',
        parallaxLayers: ['destroyed_city', 'fire_columns', 'circling_vultures'],
        foregroundProps: ['massive_chains', 'impaled_weapons', 'burning_tanks', 'skull_totems'],
        silhouetteStyle: 'devastation_zone',
        weatherOverride: 'CLEAR',
        timeOfDayOverride: 'DUSK',
        groundShapeProfile: 'destruction_crater',
        platformDensity: 0.3,
        landmarkCount: 4,
        clutterDensity: 0.6,
        colorGrading: { brightness: 0.75, warmth: 0.3, contrast: 1.3 },
        bossArenaFeatures: { dramaticLighting: true, fireGlow: true }
      }
    },
    // Act 3: Urban Conflict (Levels 7-10) - City warfare, vertical combat
    { 
      name: 'Urban Warfare', 
      act: 3, 
      isBoss: false, 
      biome: 'URBAN',
      visualProfile: {
        skyVariant: 'smog_filled',
        parallaxLayers: ['skyscrapers', 'burning_buildings', 'helicopters'],
        foregroundProps: ['overturned_cars', 'street_barricades', 'traffic_lights', 'mailboxes'],
        silhouetteStyle: 'city_skyline',
        weatherOverride: 'CLEAR',
        timeOfDayOverride: 'DAY',
        groundShapeProfile: 'city_streets',
        platformDensity: 0.5,
        landmarkCount: 3,
        clutterDensity: 0.7,
        colorGrading: { brightness: 0.9, warmth: -0.05 }
      }
    },
    { 
      name: 'Industrial Complex', 
      act: 3, 
      isBoss: false, 
      biome: 'FACILITY',
      visualProfile: {
        skyVariant: 'industrial_pollution',
        parallaxLayers: ['factory_towers', 'smokestacks', 'cranes'],
        foregroundProps: ['pipes', 'control_panels', 'warning_signs', 'barrels'],
        silhouetteStyle: 'industrial_pipes',
        weatherOverride: 'CLEAR',
        timeOfDayOverride: 'DAY',
        groundShapeProfile: 'factory_floor',
        platformDensity: 0.6,
        landmarkCount: 2,
        clutterDensity: 0.6,
        colorGrading: { brightness: 0.85, warmth: 0.0, tint: '#334455' }
      }
    },
    { 
      name: 'Boss Arena: The Annihilator', 
      act: 3, 
      isBoss: true, 
      bossId: 2, 
      biome: 'FACILITY',
      visualProfile: {
        skyVariant: 'electric_storm',
        parallaxLayers: ['reactor_cores', 'tesla_coils', 'sparking_cables'],
        foregroundProps: ['broken_machinery', 'electricity_arcs', 'fallen_pipes', 'hazard_signs'],
        silhouetteStyle: 'mechanical_horror',
        weatherOverride: 'CLEAR',
        timeOfDayOverride: 'NIGHT',
        groundShapeProfile: 'platform_arena',
        platformDensity: 0.4,
        landmarkCount: 4,
        clutterDensity: 0.5,
        colorGrading: { brightness: 0.6, warmth: -0.2, contrast: 1.4 },
        bossArenaFeatures: { electricityEffects: true, alarmLights: true }
      }
    },
    { 
      name: 'Final Boss: The Overlord', 
      act: 4, 
      isBoss: true, 
      bossId: 3, 
      biome: 'DEFAULT',
      visualProfile: {
        skyVariant: 'apocalyptic_red',
        parallaxLayers: ['burning_world', 'falling_meteors', 'dark_citadel'],
        foregroundProps: ['throne_pillars', 'war_trophies', 'enemy_banners', 'fire_braziers'],
        silhouetteStyle: 'dark_fortress',
        weatherOverride: 'CLEAR',
        timeOfDayOverride: 'NIGHT',
        groundShapeProfile: 'throne_room',
        platformDensity: 0.4,
        landmarkCount: 5,
        clutterDensity: 0.6,
        colorGrading: { brightness: 0.5, warmth: 0.2, contrast: 1.5, saturation: 1.2 },
        bossArenaFeatures: { dramaticLighting: true, fireGlow: true, darkVignette: true }
      }
    },
    // Act 5: Desert Campaign (Levels 11-12) - Harsh sun, sand everywhere
    { 
      name: 'Desert Outpost', 
      act: 5, 
      isBoss: false, 
      biome: 'DESERT',
      visualProfile: {
        skyVariant: 'scorching_sun',
        parallaxLayers: ['sand_dunes', 'distant_oasis', 'ancient_ruins'],
        foregroundProps: ['cacti', 'sun_bleached_bones', 'desert_rocks', 'tents'],
        silhouetteStyle: 'rolling_dunes',
        weatherOverride: 'CLEAR',
        timeOfDayOverride: 'DAY',
        groundShapeProfile: 'desert_dunes',
        platformDensity: 0.3,
        landmarkCount: 2,
        clutterDensity: 0.4,
        colorGrading: { brightness: 1.15, warmth: 0.25 }
      }
    },
    { 
      name: 'Boss Arena: Sandworm', 
      act: 5, 
      isBoss: true, 
      bossId: 4, 
      biome: 'DESERT',
      visualProfile: {
        skyVariant: 'sandstorm_fury',
        parallaxLayers: ['massive_dunes', 'swirling_sand', 'buried_structures'],
        foregroundProps: ['bone_piles', 'ancient_pillars', 'sand_geysers', 'worm_tracks'],
        silhouetteStyle: 'desert_wasteland',
        weatherOverride: 'SANDSTORM',
        timeOfDayOverride: 'DUSK',
        groundShapeProfile: 'sand_arena',
        platformDensity: 0.2,
        landmarkCount: 3,
        clutterDensity: 0.4,
        colorGrading: { brightness: 0.7, warmth: 0.35, contrast: 1.2 },
        bossArenaFeatures: { sandParticles: true, heatDistortion: true }
      }
    },
    // Act 6: Frozen Wastes (Levels 13-14) - Cold, isolated, dangerous
    { 
      name: 'Tundra Expedition', 
      act: 6, 
      isBoss: false, 
      biome: 'SNOW',
      visualProfile: {
        skyVariant: 'frozen_twilight',
        parallaxLayers: ['ice_mountains', 'frozen_trees', 'aurora_borealis'],
        foregroundProps: ['ice_crystals', 'snow_banks', 'frozen_equipment', 'icicles'],
        silhouetteStyle: 'ice_peaks',
        weatherOverride: 'SNOW',
        timeOfDayOverride: 'DAY',
        groundShapeProfile: 'frozen_terrain',
        platformDensity: 0.4,
        landmarkCount: 2,
        clutterDensity: 0.3,
        colorGrading: { brightness: 1.1, warmth: -0.2, tint: '#aaddff' }
      }
    },
    { 
      name: 'Boss Arena: Frost Titan', 
      act: 6, 
      isBoss: true, 
      bossId: 5, 
      biome: 'SNOW',
      visualProfile: {
        skyVariant: 'blizzard_darkness',
        parallaxLayers: ['ice_fortress', 'frozen_statues', 'blizzard_wall'],
        foregroundProps: ['ice_pillars', 'frozen_victims', 'crystal_formations', 'frost_spires'],
        silhouetteStyle: 'ice_citadel',
        weatherOverride: 'SNOW',
        timeOfDayOverride: 'NIGHT',
        groundShapeProfile: 'ice_arena',
        platformDensity: 0.3,
        landmarkCount: 4,
        clutterDensity: 0.5,
        colorGrading: { brightness: 0.6, warmth: -0.3, contrast: 1.3, tint: '#8899cc' },
        bossArenaFeatures: { blizzardParticles: true, icyGlow: true }
      }
    },
    // Act 7: City Assault (Levels 15-16) - Night ops, rooftop action
    { 
      name: 'City Assault', 
      act: 7, 
      isBoss: false, 
      biome: 'URBAN', 
      hasSecretPath: true,
      visualProfile: {
        skyVariant: 'neon_night',
        parallaxLayers: ['night_skyline', 'neon_signs', 'police_helicopters'],
        foregroundProps: ['dumpsters', 'fire_escapes', 'streetlights', 'graffiti_walls'],
        silhouetteStyle: 'downtown_night',
        weatherOverride: 'RAIN',
        timeOfDayOverride: 'NIGHT',
        groundShapeProfile: 'wet_streets',
        platformDensity: 0.5,
        landmarkCount: 3,
        clutterDensity: 0.7,
        colorGrading: { brightness: 0.55, warmth: -0.1, tint: '#334488' }
      }
    },
    { 
      name: 'Rooftop Escape', 
      act: 7, 
      isBoss: false, 
      biome: 'URBAN',
      visualProfile: {
        skyVariant: 'dawn_breaking',
        parallaxLayers: ['rooftop_silhouettes', 'water_towers', 'distant_sunrise'],
        foregroundProps: ['ac_units', 'satellite_dishes', 'pipes', 'ventilation_ducts'],
        silhouetteStyle: 'rooftop_maze',
        weatherOverride: 'CLEAR',
        timeOfDayOverride: 'DUSK',
        groundShapeProfile: 'elevated_platforms',
        platformDensity: 0.7,
        landmarkCount: 2,
        clutterDensity: 0.6,
        colorGrading: { brightness: 0.75, warmth: 0.2 }
      }
    },
    // Act 8: Facility Infiltration (Levels 17-18) - High-tech, dangerous
    { 
      name: 'Lab Infiltration', 
      act: 8, 
      isBoss: false, 
      biome: 'FACILITY',
      visualProfile: {
        skyVariant: 'sterile_white',
        parallaxLayers: ['lab_equipment', 'specimen_tanks', 'data_screens'],
        foregroundProps: ['lab_tables', 'computer_terminals', 'test_tubes', 'biohazard_signs'],
        silhouetteStyle: 'clinical_corridors',
        weatherOverride: 'CLEAR',
        timeOfDayOverride: 'DAY',
        groundShapeProfile: 'lab_floor',
        platformDensity: 0.5,
        landmarkCount: 3,
        clutterDensity: 0.5,
        colorGrading: { brightness: 1.05, warmth: -0.15, tint: '#eeffee' }
      }
    },
    { 
      name: 'Reactor Survival', 
      act: 8, 
      isBoss: true, 
      bossId: 6, 
      biome: 'FACILITY', 
      hasSecretPath: true,
      visualProfile: {
        skyVariant: 'reactor_glow',
        parallaxLayers: ['reactor_core', 'warning_lights', 'emergency_systems'],
        foregroundProps: ['cooling_pipes', 'radiation_signs', 'control_rods', 'hazmat_gear'],
        silhouetteStyle: 'reactor_chamber',
        weatherOverride: 'CLEAR',
        timeOfDayOverride: 'NIGHT',
        groundShapeProfile: 'reactor_platform',
        platformDensity: 0.4,
        landmarkCount: 4,
        clutterDensity: 0.5,
        colorGrading: { brightness: 0.65, warmth: -0.1, contrast: 1.3, tint: '#00ff88' },
        bossArenaFeatures: { radiationGlow: true, alarmLights: true, steamVents: true }
      }
    },
    // Act 9: Forest & Final Battle (Levels 19-20) - Dark atmosphere, ultimate challenge
    { 
      name: 'Forest Ambush', 
      act: 9, 
      isBoss: false, 
      biome: 'FOREST',
      visualProfile: {
        skyVariant: 'dense_canopy',
        parallaxLayers: ['ancient_trees', 'hanging_vines', 'distant_mountains'],
        foregroundProps: ['fallen_logs', 'mushrooms', 'ferns', 'moss_rocks'],
        silhouetteStyle: 'forest_depths',
        weatherOverride: 'FOG',
        timeOfDayOverride: 'DUSK',
        groundShapeProfile: 'forest_floor',
        platformDensity: 0.6,
        landmarkCount: 2,
        clutterDensity: 0.8,
        colorGrading: { brightness: 0.7, warmth: 0.05, tint: '#446644' }
      }
    },
    { 
      name: 'Boss Arena: Hell Knight', 
      act: 9, 
      isBoss: true, 
      bossId: 7, 
      biome: 'HELL',
      visualProfile: {
        skyVariant: 'hellfire_sky',
        parallaxLayers: ['lava_falls', 'demon_statues', 'burning_souls'],
        foregroundProps: ['ritual_altars', 'demonic_runes', 'bone_thrones', 'lava_cracks'],
        silhouetteStyle: 'infernal_cathedral',
        weatherOverride: 'CLEAR',
        timeOfDayOverride: 'NIGHT',
        groundShapeProfile: 'hellscape',
        platformDensity: 0.4,
        landmarkCount: 5,
        clutterDensity: 0.7,
        colorGrading: { brightness: 0.5, warmth: 0.5, contrast: 1.5, saturation: 1.3 },
        bossArenaFeatures: { fireGlow: true, lavaParticles: true, darkVignette: true, demonicRunes: true }
      }
    }
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

  // Sky variant definitions for per-level visual variety
  SKY_VARIANTS: {
    // Act 1: Training - Soft, welcoming
    morning_hazy: {
      skyTop: '#5a6a8a', skyMid: '#7a8aaa', skyBottom: '#9aaaca',
      cloudColor: '#b0c0d0', sunGlow: true, sunPosition: 0.2
    },
    noon_clear: {
      skyTop: '#4a5f7f', skyMid: '#6a7f9f', skyBottom: '#8a9fbf',
      cloudColor: '#c0d0e0', sunGlow: false, sunPosition: 0.5
    },
    stormy_dramatic: {
      skyTop: '#2a3a4a', skyMid: '#3a4a5a', skyBottom: '#5a6a7a',
      cloudColor: '#4a5a6a', lightningFlashes: true, darkClouds: true
    },
    // Act 2: Escalation - Intense
    afternoon_haze: {
      skyTop: '#5a6070', skyMid: '#7a8090', skyBottom: '#9aa0b0',
      cloudColor: '#a0a8b0', dustHaze: true, sunPosition: 0.7
    },
    overcast_gray: {
      skyTop: '#505560', skyMid: '#606570', skyBottom: '#707580',
      cloudColor: '#606570', heavyClouds: true, noSun: true
    },
    blood_red_sunset: {
      skyTop: '#3a2020', skyMid: '#6a3030', skyBottom: '#aa4040',
      cloudColor: '#802020', sunGlow: true, sunPosition: 0.9, sunColor: '#ff4400'
    },
    // Act 3: Urban - Polluted, industrial
    smog_filled: {
      skyTop: '#4a5055', skyMid: '#6a7075', skyBottom: '#8a9095',
      cloudColor: '#707580', smogLayer: true
    },
    industrial_pollution: {
      skyTop: '#404550', skyMid: '#505560', skyBottom: '#606570',
      cloudColor: '#505560', smokeStacks: true, yellowTint: true
    },
    electric_storm: {
      skyTop: '#202040', skyMid: '#303050', skyBottom: '#404060',
      cloudColor: '#303050', lightningFlashes: true, electricBlue: true
    },
    apocalyptic_red: {
      skyTop: '#200000', skyMid: '#400010', skyBottom: '#601020',
      cloudColor: '#300010', fireGlow: true, fallingEmbers: true
    },
    // Act 5: Desert - Scorching
    scorching_sun: {
      skyTop: '#d4b46a', skyMid: '#e4c47a', skyBottom: '#f4d48a',
      cloudColor: '#e8d8a0', sunGlow: true, sunPosition: 0.5, heatHaze: true
    },
    sandstorm_fury: {
      skyTop: '#a08040', skyMid: '#b09050', skyBottom: '#c0a060',
      cloudColor: '#a08050', sandParticles: true, lowVisibility: true
    },
    // Act 6: Snow - Cold, isolated
    frozen_twilight: {
      skyTop: '#8090b0', skyMid: '#a0b0d0', skyBottom: '#c0d0f0',
      cloudColor: '#d0e0ff', auroraEffect: true, iceSparkles: true
    },
    blizzard_darkness: {
      skyTop: '#404860', skyMid: '#506080', skyBottom: '#6080a0',
      cloudColor: '#506080', heavySnow: true, windEffect: true
    },
    // Act 7: Urban Night - Noir atmosphere
    neon_night: {
      skyTop: '#101020', skyMid: '#202040', skyBottom: '#303060',
      cloudColor: '#202030', cityLights: true, neonGlow: true
    },
    dawn_breaking: {
      skyTop: '#304060', skyMid: '#506080', skyBottom: '#8090a0',
      cloudColor: '#607090', sunGlow: true, sunPosition: 0.1, sunColor: '#ffaa66'
    },
    // Act 8: Facility - Clinical, dangerous
    sterile_white: {
      skyTop: '#c0c8d0', skyMid: '#d0d8e0', skyBottom: '#e0e8f0',
      cloudColor: '#d8e0e8', fluorescent: true
    },
    reactor_glow: {
      skyTop: '#102010', skyMid: '#203020', skyBottom: '#304030',
      cloudColor: '#203020', greenGlow: true, radiationHaze: true
    },
    // Act 9: Forest & Hell - Ominous, terrifying
    dense_canopy: {
      skyTop: '#304020', skyMid: '#405030', skyBottom: '#506040',
      cloudColor: '#405030', treeShadows: true, mistLayer: true
    },
    hellfire_sky: {
      skyTop: '#200000', skyMid: '#400808', skyBottom: '#601010',
      cloudColor: '#400000', fireGlow: true, ashParticles: true, lavaGlow: true
    }
  },

  // Parallax layer definitions for background variety
  PARALLAX_LAYERS: {
    // Distance/speed: far = 0.1, mid = 0.3, close = 0.5
    // Training/Default
    distant_hills: { type: 'silhouette', speed: 0.1, color: '#3a4a5a', heightVariation: 'rolling' },
    radio_towers: { type: 'structure', speed: 0.2, color: '#2a3a4a', elements: ['tower', 'antenna'] },
    destroyed_vehicles: { type: 'debris', speed: 0.3, color: '#4a4a4a', elements: ['tank', 'truck'] },
    smoke_plumes: { type: 'effect', speed: 0.15, animated: true },
    // War/Battle
    dark_mountains: { type: 'silhouette', speed: 0.1, color: '#1a2a3a', heightVariation: 'jagged' },
    war_banners: { type: 'props', speed: 0.4, color: '#8a2020', elements: ['flag', 'banner'] },
    distant_explosions: { type: 'effect', speed: 0.1, animated: true, flicker: true },
    artillery_positions: { type: 'structure', speed: 0.2, color: '#3a3a3a', elements: ['cannon', 'bunker'] },
    tank_wrecks: { type: 'debris', speed: 0.25, color: '#4a4a3a', elements: ['tank_hull', 'turret'] },
    smoke_columns: { type: 'effect', speed: 0.15, animated: true, tall: true },
    ruined_buildings: { type: 'structure', speed: 0.2, color: '#505050', elements: ['ruin', 'wall'] },
    sniper_nests: { type: 'structure', speed: 0.25, color: '#404040', elements: ['tower', 'window'] },
    broken_walls: { type: 'debris', speed: 0.3, color: '#606060', elements: ['wall_chunk', 'rubble'] },
    destroyed_city: { type: 'silhouette', speed: 0.1, color: '#2a2a2a', heightVariation: 'urban_ruins' },
    fire_columns: { type: 'effect', speed: 0.15, animated: true, fireColor: '#ff4400' },
    circling_vultures: { type: 'effect', speed: 0.05, animated: true, flying: true },
    // Urban
    skyscrapers: { type: 'silhouette', speed: 0.1, color: '#3a4050', heightVariation: 'tall_buildings' },
    burning_buildings: { type: 'structure', speed: 0.15, color: '#4a4a4a', fireEffect: true },
    helicopters: { type: 'effect', speed: 0.08, animated: true, flying: true },
    factory_towers: { type: 'structure', speed: 0.15, color: '#404550', elements: ['tower', 'stack'] },
    smokestacks: { type: 'structure', speed: 0.2, color: '#505560', smokeEffect: true },
    cranes: { type: 'structure', speed: 0.25, color: '#606060', elements: ['crane', 'jib'] },
    reactor_cores: { type: 'structure', speed: 0.2, color: '#203030', glowEffect: true, glowColor: '#00ff88' },
    tesla_coils: { type: 'structure', speed: 0.25, color: '#304050', electricEffect: true },
    sparking_cables: { type: 'effect', speed: 0.3, animated: true, electricSparks: true },
    burning_world: { type: 'silhouette', speed: 0.05, color: '#1a0000', fireEffect: true },
    falling_meteors: { type: 'effect', speed: 0.1, animated: true, fallingParticles: true },
    dark_citadel: { type: 'structure', speed: 0.1, color: '#0a0a0a', elements: ['fortress', 'spire'] },
    // Desert
    sand_dunes: { type: 'silhouette', speed: 0.1, color: '#b09050', heightVariation: 'dunes' },
    distant_oasis: { type: 'structure', speed: 0.15, color: '#4a6a4a', elements: ['palm', 'water'] },
    ancient_ruins: { type: 'structure', speed: 0.2, color: '#a08060', elements: ['column', 'arch'] },
    massive_dunes: { type: 'silhouette', speed: 0.08, color: '#a08040', heightVariation: 'massive_dunes' },
    swirling_sand: { type: 'effect', speed: 0.2, animated: true, sandParticles: true },
    buried_structures: { type: 'structure', speed: 0.15, color: '#907050', elements: ['ruin', 'pillar'] },
    // Snow
    ice_mountains: { type: 'silhouette', speed: 0.1, color: '#8090a0', heightVariation: 'ice_peaks' },
    frozen_trees: { type: 'structure', speed: 0.2, color: '#a0b0c0', elements: ['tree', 'ice'] },
    aurora_borealis: { type: 'effect', speed: 0.02, animated: true, auroraColors: true },
    ice_fortress: { type: 'structure', speed: 0.15, color: '#90a0b0', elements: ['wall', 'tower'] },
    frozen_statues: { type: 'structure', speed: 0.2, color: '#a0b0c0', elements: ['statue', 'ice'] },
    blizzard_wall: { type: 'effect', speed: 0.1, animated: true, snowWall: true },
    // Night city
    night_skyline: { type: 'silhouette', speed: 0.1, color: '#101820', heightVariation: 'city_night' },
    neon_signs: { type: 'effect', speed: 0.2, animated: true, neonColors: true },
    police_helicopters: { type: 'effect', speed: 0.08, animated: true, searchlight: true },
    rooftop_silhouettes: { type: 'silhouette', speed: 0.15, color: '#202030', heightVariation: 'rooftops' },
    water_towers: { type: 'structure', speed: 0.25, color: '#303040', elements: ['tower', 'tank'] },
    distant_sunrise: { type: 'effect', speed: 0.05, sunriseGlow: true },
    // Facility
    lab_equipment: { type: 'structure', speed: 0.2, color: '#606880', elements: ['tank', 'monitor'] },
    specimen_tanks: { type: 'structure', speed: 0.25, color: '#506070', glowEffect: true, glowColor: '#00ff88' },
    data_screens: { type: 'effect', speed: 0.3, animated: true, screenFlicker: true },
    reactor_core: { type: 'structure', speed: 0.15, color: '#204030', glowEffect: true, glowColor: '#00ff44' },
    warning_lights: { type: 'effect', speed: 0.25, animated: true, redFlash: true },
    emergency_systems: { type: 'effect', speed: 0.3, animated: true, alarmEffect: true },
    // Forest
    ancient_trees: { type: 'silhouette', speed: 0.1, color: '#2a3a2a', heightVariation: 'tall_trees' },
    hanging_vines: { type: 'effect', speed: 0.15, animated: true, swayEffect: true },
    distant_mountains: { type: 'silhouette', speed: 0.05, color: '#3a4a3a', heightVariation: 'forest_hills' },
    // Hell
    lava_falls: { type: 'effect', speed: 0.1, animated: true, lavaFlow: true, glowColor: '#ff4400' },
    demon_statues: { type: 'structure', speed: 0.15, color: '#2a1010', elements: ['statue', 'gargoyle'] },
    burning_souls: { type: 'effect', speed: 0.08, animated: true, ghostEffect: true, color: '#ff6600' }
  },

  // Foreground prop definitions for ground-level detail
  FOREGROUND_PROPS: {
    // Training
    sandbags: { width: 40, height: 25, color: '#8a7a5a', stackable: true },
    training_targets: { width: 20, height: 50, color: '#cc6644', animated: false },
    crates: { width: 35, height: 30, color: '#7a6a4a' },
    ammo_crates: { width: 30, height: 25, color: '#4a5a3a', hasIcon: true },
    barricades: { width: 50, height: 35, color: '#6a5a4a' },
    shell_casings: { width: 15, height: 8, color: '#aa9944', scattered: true },
    // War/Battle
    tank_traps: { width: 45, height: 40, color: '#5a5a5a', metal: true },
    craters: { width: 60, height: 20, color: '#3a3a2a', inGround: true },
    debris_piles: { width: 50, height: 30, color: '#606050' },
    rubble: { width: 40, height: 20, color: '#707060', scattered: true },
    broken_windows: { width: 25, height: 35, color: '#8080a0', transparent: true },
    bullet_holes: { width: 10, height: 10, color: '#303030', scattered: true, onWalls: true },
    warning_signs: { width: 20, height: 30, color: '#ffcc00', hasText: true },
    // Boss arena
    skull_piles: { width: 35, height: 25, color: '#d0c0a0', stacked: true },
    war_banners: { width: 25, height: 60, color: '#8a2020', animated: true },
    burning_debris: { width: 40, height: 30, color: '#ff6600', fireEffect: true },
    chains: { width: 15, height: 50, color: '#606060', hanging: true },
    massive_chains: { width: 25, height: 80, color: '#505050', hanging: true },
    impaled_weapons: { width: 20, height: 45, color: '#808080', angled: true },
    burning_tanks: { width: 60, height: 40, color: '#4a4a3a', fireEffect: true },
    skull_totems: { width: 30, height: 55, color: '#a09080', stacked: true },
    throne_pillars: { width: 40, height: 100, color: '#3a3040', tall: true },
    war_trophies: { width: 35, height: 40, color: '#8a7a6a' },
    enemy_banners: { width: 30, height: 70, color: '#6a1010', animated: true },
    fire_braziers: { width: 25, height: 35, color: '#8a6a4a', fireEffect: true },
    // Urban
    overturned_cars: { width: 70, height: 35, color: '#5a5a6a', rotated: true },
    street_barricades: { width: 55, height: 40, color: '#ff8800', striped: true },
    traffic_lights: { width: 15, height: 45, color: '#404040', tall: true },
    mailboxes: { width: 20, height: 35, color: '#3344aa' },
    dumpsters: { width: 50, height: 40, color: '#446644' },
    fire_escapes: { width: 30, height: 80, color: '#505050', climbable: true },
    streetlights: { width: 15, height: 60, color: '#606060', tall: true },
    graffiti_walls: { width: 60, height: 50, color: '#707070', decorated: true },
    ac_units: { width: 35, height: 25, color: '#808080' },
    satellite_dishes: { width: 30, height: 30, color: '#909090' },
    ventilation_ducts: { width: 45, height: 25, color: '#707080' },
    // Industrial
    pipes: { width: 80, height: 20, color: '#606870', horizontal: true },
    control_panels: { width: 40, height: 50, color: '#404860', hasLights: true },
    barrels: { width: 25, height: 35, color: '#4a5a6a' },
    broken_machinery: { width: 50, height: 45, color: '#505868', broken: true },
    electricity_arcs: { width: 30, height: 40, color: '#88aaff', animated: true },
    fallen_pipes: { width: 70, height: 15, color: '#606060', rotated: true },
    hazard_signs: { width: 25, height: 25, color: '#ffaa00', hasIcon: true },
    lab_tables: { width: 55, height: 35, color: '#808890' },
    computer_terminals: { width: 35, height: 40, color: '#404050', hasScreen: true },
    test_tubes: { width: 20, height: 30, color: '#80c0a0', glowing: true },
    biohazard_signs: { width: 25, height: 25, color: '#ff6600', hasIcon: true },
    cooling_pipes: { width: 50, height: 30, color: '#506060', steamEffect: true },
    radiation_signs: { width: 25, height: 25, color: '#ffff00', hasIcon: true },
    control_rods: { width: 20, height: 60, color: '#304040', glowing: true },
    hazmat_gear: { width: 30, height: 40, color: '#ff8800' },
    // Desert
    cacti: { width: 20, height: 45, color: '#3a5a2a', prickly: true },
    sun_bleached_bones: { width: 35, height: 20, color: '#e0d8c0', scattered: true },
    desert_rocks: { width: 40, height: 25, color: '#a08060' },
    tents: { width: 50, height: 40, color: '#c0a080' },
    bone_piles: { width: 40, height: 25, color: '#d0c8b0', stacked: true },
    ancient_pillars: { width: 30, height: 70, color: '#a09070', broken: true },
    sand_geysers: { width: 25, height: 30, color: '#c0a060', animated: true },
    worm_tracks: { width: 80, height: 15, color: '#a08050', inGround: true },
    // Snow
    ice_crystals: { width: 25, height: 40, color: '#c0e0ff', transparent: true },
    snow_banks: { width: 50, height: 25, color: '#f0f4ff' },
    frozen_equipment: { width: 40, height: 35, color: '#a0b0c0', iced: true },
    icicles: { width: 15, height: 35, color: '#c0e0ff', hanging: true },
    ice_pillars: { width: 35, height: 60, color: '#a0c0e0', transparent: true },
    frozen_victims: { width: 30, height: 50, color: '#8090a0', iced: true },
    crystal_formations: { width: 40, height: 50, color: '#a0d0ff', glowing: true },
    frost_spires: { width: 25, height: 70, color: '#b0d0f0', tall: true },
    // Forest
    fallen_logs: { width: 70, height: 25, color: '#5a4030' },
    mushrooms: { width: 20, height: 25, color: '#a06040', scattered: true },
    ferns: { width: 35, height: 30, color: '#3a5a3a' },
    moss_rocks: { width: 40, height: 30, color: '#4a5a4a', mossy: true },
    // Hell
    ritual_altars: { width: 50, height: 40, color: '#3a2020', bloodStains: true },
    demonic_runes: { width: 30, height: 10, color: '#ff4400', glowing: true, inGround: true },
    bone_thrones: { width: 60, height: 70, color: '#a09080', elaborate: true },
    lava_cracks: { width: 40, height: 10, color: '#ff4400', glowing: true, inGround: true }
  },

  // Ground shape profiles for terrain variety
  GROUND_SHAPE_PROFILES: {
    flat_training_range: { slopeFrequency: 0.1, maxHeight: 20, platformChance: 0.2 },
    rolling_terrain: { slopeFrequency: 0.3, maxHeight: 40, platformChance: 0.3 },
    arena_pit: { slopeFrequency: 0.2, maxHeight: 30, depressed: true, wallsAtEdges: true },
    war_torn: { slopeFrequency: 0.5, maxHeight: 50, craterChance: 0.4, platformChance: 0.3 },
    uneven_rubble: { slopeFrequency: 0.6, maxHeight: 35, debrisClutter: true },
    destruction_crater: { slopeFrequency: 0.3, maxHeight: 60, centralPit: true },
    city_streets: { slopeFrequency: 0.2, maxHeight: 20, platformChance: 0.5, buildingPlatforms: true },
    factory_floor: { slopeFrequency: 0.1, maxHeight: 15, platformChance: 0.6, metalGrating: true },
    platform_arena: { slopeFrequency: 0.2, maxHeight: 40, platformChance: 0.7, elevated: true },
    throne_room: { slopeFrequency: 0.2, maxHeight: 50, steppedPlatforms: true, centralRaised: true },
    desert_dunes: { slopeFrequency: 0.4, maxHeight: 45, smoothCurves: true },
    sand_arena: { slopeFrequency: 0.3, maxHeight: 35, shiftingSand: true },
    frozen_terrain: { slopeFrequency: 0.3, maxHeight: 30, slippery: true, icePatches: true },
    ice_arena: { slopeFrequency: 0.2, maxHeight: 40, icePlatforms: true, frozenGround: true },
    wet_streets: { slopeFrequency: 0.2, maxHeight: 25, puddles: true, slippery: true },
    elevated_platforms: { slopeFrequency: 0.1, maxHeight: 20, platformChance: 0.8, rooftopStyle: true },
    lab_floor: { slopeFrequency: 0.1, maxHeight: 15, cleanTiles: true, platformChance: 0.4 },
    reactor_platform: { slopeFrequency: 0.2, maxHeight: 35, metalGrating: true, hazardZones: true },
    forest_floor: { slopeFrequency: 0.4, maxHeight: 35, rootObstacles: true, leafLitter: true },
    hellscape: { slopeFrequency: 0.5, maxHeight: 60, lavaPools: true, jaggedRocks: true }
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
  },

  // Phase 6: Touch Controls Configuration
  TOUCH_CONTROLS: {
    joystickRadius: 150,
    stickRadius: 50,
    buttonSize: 80,
    opacity: 0.7,
    autoAim: true,
    autoAimStrength: 0.3,
    deadzone: 0.15,
    vibrationEnabled: true
  },

  // Phase 6: Photo Mode Configuration
  PHOTO_MODE: {
    minZoom: 0.5,
    maxZoom: 3.0,
    fovRange: { min: 60, max: 120 },
    filters: ['none', 'bw', 'sepia', 'contrast', 'vintage', 'neon', 'pixel', 'vignette'],
    cameraSpeed: 5,
    tiltRange: { min: -45, max: 45 }
  },

  // Phase 6: Daily Challenges Configuration
  DAILY_CHALLENGES: {
    resetHour: 0, // UTC
    rewards: { bronze: 500, silver: 1000, gold: 2000 },
    types: ['kill', 'survival', 'speedrun', 'skill'],
    historyDays: 7
  },

  // Phase 6: Companion AI Configuration
  COMPANIONS: {
    SOLDIER: { 
      name: 'Soldier', 
      hp: 200, 
      damage: 20, 
      speed: 180,
      reviveCooldown: 60,
      color: '#4488ff',
      weapon: 'rifle'
    },
    MEDIC: { 
      name: 'Medic', 
      hp: 150, 
      damage: 10, 
      speed: 200,
      healAmount: 20, 
      healInterval: 10,
      color: '#44ff88',
      weapon: 'pistol'
    },
    HEAVY: { 
      name: 'Heavy', 
      hp: 300, 
      damage: 25, 
      speed: 120,
      color: '#ff8844',
      weapon: 'machinegun'
    },
    SCOUT: { 
      name: 'Scout', 
      hp: 100, 
      damage: 15, 
      speed: 250,
      color: '#ffff44',
      weapon: 'smg'
    }
  },

  // Phase 6: Dual Wield Configuration
  DUAL_WIELD: {
    fireRateMultiplier: 2,
    accuracyPenalty: 0.3,
    reloadSpeedPenalty: 0.5,
    eligibleWeapons: ['pistol']
  },

  // Phase 6: Crafting System Configuration
  CRAFTING: {
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
  },

  // Phase 6: Accessibility Configuration
  ACCESSIBILITY: {
    colorblindModes: ['none', 'protanopia', 'deuteranopia', 'tritanopia', 'high_contrast'],
    subtitleSizes: ['small', 'medium', 'large'],
    uiScales: [0.75, 1.0, 1.25, 1.5],
    crosshairShapes: ['cross', 'dot', 'circle', 'chevron'],
    defaultSettings: {
      subtitlesEnabled: true,
      subtitleSize: 'medium',
      subtitleBackground: 0.7,
      soundCaptions: true,
      reduceScreenShake: false,
      reduceParticles: false,
      highContrastUI: false,
      uiScale: 1.0,
      monoAudio: false,
      autoAimStrength: 0.5
    }
  },

  // Phase 6: New Weapons Configuration
  WEAPONS_PHASE6: {
    SMG: { 
      name: 'SMG',
      damage: 12, 
      fireRate: 80, 
      ammoCapacity: 40, 
      reloadTime: 1800,
      projectileSpeed: 16,
      range: 300,
      accuracy: 0.85,
      type: 'ranged'
    },
    CROSSBOW: { 
      name: 'Crossbow',
      damage: 80, 
      fireRate: 2500, 
      ammoCapacity: 1, 
      reloadTime: 1500,
      projectileSpeed: 18,
      range: 500, 
      silent: true,
      retrievable: true,
      type: 'ranged'
    },
    CHAINSAW: { 
      name: 'Chainsaw',
      damage: 30, 
      fireRate: 100,
      fuelTime: 10, 
      fuelCapacity: 100,
      range: 64,
      type: 'melee'
    },
    FREEZE_RAY: { 
      name: 'Freeze Ray',
      damage: 8,
      slowAmount: 0.1, 
      freezeThreshold: 0.5, 
      ammoCapacity: 30, 
      reloadTime: 2500,
      projectileSpeed: 20,
      range: 250,
      isBeam: true,
      type: 'energy'
    },
    LIGHTNING_GUN: { 
      name: 'Lightning Gun',
      damage: 40, 
      chainTargets: 3, 
      chainRange: 100,
      ammoCapacity: 50, 
      reloadTime: 2800,
      projectileSpeed: 25,
      range: 400,
      type: 'energy'
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
Object.freeze(GameConfig.SKY_VARIANTS);
Object.freeze(GameConfig.PARALLAX_LAYERS);
Object.freeze(GameConfig.FOREGROUND_PROPS);
Object.freeze(GameConfig.GROUND_SHAPE_PROFILES);
Object.freeze(GameConfig.SECRET_CONTENT);
Object.freeze(GameConfig.BASE_DEFENSE);
Object.freeze(GameConfig.TOUCH_CONTROLS);
Object.freeze(GameConfig.PHOTO_MODE);
Object.freeze(GameConfig.DAILY_CHALLENGES);
Object.freeze(GameConfig.COMPANIONS);
Object.freeze(GameConfig.DUAL_WIELD);
Object.freeze(GameConfig.CRAFTING);
Object.freeze(GameConfig.ACCESSIBILITY);
Object.freeze(GameConfig.WEAPONS_PHASE6);
