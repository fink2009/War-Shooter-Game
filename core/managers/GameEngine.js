// Main Game Manager - orchestrates all game systems
class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Game Engine initialized with comprehensive improvements
    
    // Game state
    this.state = 'loading'; // loading, menu, character_select, playing, paused, gameover, victory, inventory, cutscene
    this.mode = 'campaign'; // campaign, survival, multiplayer
    this.menuState = 'main';
    this.showInventory = false;
    this.inventoryPage = 0; // 0 = ranged weapons, 1 = melee weapons
    
    // Settings
    this.difficulty = 'medium'; // baby, easy, medium, extreme
    this.audioEnabled = true;
    this.musicVolume = 0.7;
    
    // Systems
    this.inputManager = new InputManager();
    this.assetManager = new AssetManager();
    this.collisionSystem = new CollisionSystem();
    this.particleSystem = new ParticleSystem();
    this.achievementSystem = new AchievementSystem();
    this.audioManager = new AudioManager();
    this.highScoreSystem = new HighScoreSystem();
    this.saveSystem = new SaveSystem();
    this.tutorialManager = new TutorialManager();
    this.animationSystem = new AnimationSystem();
    this.storyManager = new StoryManager();
    this.multiplayerManager = new MultiplayerManager();
    this.ui = new GameUI(canvas);
    
    // Phase 1: Hazard Manager
    this.hazardManager = new HazardManager();
    
    // Phase 2: Progression & Stealth Systems
    this.upgradeSystem = new UpgradeSystem();
    this.currencySystem = new CurrencySystem();
    this.attachmentSystem = new AttachmentSystem();
    this.noiseSystem = new NoiseSystem();
    this.formationSystem = new FormationSystem();
    
    // Phase 3: Weather, Time of Day, Vehicles & Mounted Weapons
    this.weatherSystem = new WeatherSystem();
    this.timeOfDaySystem = new TimeOfDaySystem();
    this.vehicles = [];
    this.mountedWeapons = [];
    
    // Phase 4: Challenge Modes & Systems
    this.timeAttackMode = new TimeAttackMode();
    this.bossRushMode = new BossRushMode();
    this.hordeMode = new HordeMode();
    this.oneHitMode = new OneHitMode();
    this.skinSystem = new SkinSystem();
    this.dynamicEventSystem = new DynamicEventSystem();
    this.statisticsSystem = new StatisticsSystem();
    this.leaderboardSystem = new LeaderboardSystem();
    
    // Phase 5: Content Expansion Systems
    this.biomeSystem = new BiomeSystem();
    this.baseDefenseMode = new BaseDefenseMode();
    this.levelThemeSystem = new LevelThemeSystem();
    
    // Phase 2: UI Menus
    this.upgradeMenu = new UpgradeMenu(canvas);
    this.shopMenu = new ShopMenu(canvas);
    this.attachmentMenu = new AttachmentMenu(canvas);
    
    // Phase 2: Coin pickups and shop vendor
    this.coinPickups = [];
    this.shopVendor = null;
    
    // Fullscreen state
    this.isFullscreen = false;
    this.originalCanvasWidth = canvas.width;
    this.originalCanvasHeight = canvas.height;
    
    // Cutscene system
    this.cutsceneManager = new CutsceneManager();
    this.cutsceneData = {}; // Loaded cutscene data files
    this.pendingCutscene = null; // Cutscene to play when boss spawns
    
    // Phase 3: Flashlight system
    const flashlightConfig = typeof GameConfig !== 'undefined' && GameConfig.FLASHLIGHT ? 
      GameConfig.FLASHLIGHT : { range: 200, coneAngle: 45, battery: 30, rechargeRate: 0.5 };
    this.flashlightOn = false;
    this.flashlightBattery = flashlightConfig.battery;
    this.flashlightMaxBattery = flashlightConfig.battery;
    this.flashlightRange = flashlightConfig.range;
    this.flashlightConeAngle = flashlightConfig.coneAngle * Math.PI / 180;
    this.flashlightRechargeRate = flashlightConfig.rechargeRate;
    
    // World settings
    this.worldWidth = 3000;
    this.worldHeight = canvas.height;
    this.groundLevel = canvas.height - 50;
    this.camera = new Camera(canvas.width, canvas.height, this.worldWidth, this.worldHeight);
    
    // Level terrain (platforms, slopes, etc.)
    this.platforms = [];
    this.slopes = [];
    
    // Phase 1: Interactive Elements
    this.movingPlatforms = [];
    this.switches = [];
    this.doors = [];
    this.jumpPads = [];
    
    // Game objects
    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];
    this.covers = [];
    
    // Game stats
    this.score = 0;
    this.kills = 0;
    this.wave = 1;
    this.currentLevel = 1; // Campaign level
    this.maxLevel = 20; // Total campaign levels including boss arenas (Phase 5 expansion)
    this.enemiesRemaining = 0;
    this.waveTimer = 0;
    this.waveDuration = 30000; // 30 seconds per wave
    this.combo = 0;
    this.comboTimer = 0;
    this.comboTimeout = 3000; // 3 seconds to maintain combo
    this.maxCombo = 0;
    this.totalDamageTaken = 0;
    this.totalDamageDealt = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.playTime = 0;
    this.bossesKilled = 0;
    this.weaponsCollected = 0;
    this.damageTakenThisWave = 0;
    
    // Weapon swap system
    this.weaponSwapPopup = null; // {weapon: Weapon, pickup: Pickup}
    
    // Timing
    this.lastTime = 0;
    this.currentTime = 0;
    this.fps = 60;
    this.fpsFrames = [];
    this.fpsUpdateTime = 0;
    
    // Additional settings (core settings already declared above)
    this.masterVolume = 1.0;
    this.sfxVolume = 0.8;
    this.selectedCharacter = 'soldier';
    this.screenShake = true;
    this.particleQuality = 'high'; // low, medium, high
    this.showFPS = false;
    this.showHelp = false; // Toggle help overlay
    this.cameraSmoothness = 0.1; // 0.05 = smooth, 0.3 = snappy
    this.crosshairStyle = 'none'; // cross, dot, circle, none - set to none since shooting is direction-based
    this.hudOpacity = 0.9;
    this.colorBlindMode = 'none'; // none, protanopia, deuteranopia, tritanopia
    this.autoReload = true;
    this.mouseAiming = false; // Toggle between mouse tracking (true) and directional (false) aiming
    this.bloodEffects = true; // Toggle blood/gore effects
    this.enemyAggression = 1.0; // Enemy behavior multiplier
    this.bulletSpeed = 1.0; // Projectile speed multiplier
    this.explosionSize = 1.0; // Explosion visual size multiplier
    this.screenFlash = true; // Flash on damage/events
    this.settingsPage = 0; // For multi-page settings menu
    
    // Dev tool settings
    this.devToolPassword = 'QUICKTEST'; // Password to unlock dev tools
    this.devToolUnlocked = false; // Whether dev tools are unlocked
    this.devToolPasswordInput = ''; // Current password input
    this.devInvincibilityEnabled = false; // Dev tool: permanent invincibility
    
    this.init();
  }

  async init() {
    try {
      // Load saved settings
      this.loadSavedSettings();
      
      // Load assets (placeholder - would load actual sprites/sounds)
      // await this.assetManager.loadImage('player', 'assets/sprites/player.png');
      // await this.assetManager.loadSound('shoot', 'assets/sounds/shoot.wav');
      
      // Load cutscene data
      await this.loadCutsceneData();
      
      // Initialize cutscene manager
      this.cutsceneManager.init(this);
      
      // Initialize tutorial system
      this.tutorialManager.init(this);
      
      // Initialize story system
      this.storyManager.init(this);
      
      // Phase 2: Initialize progression menus
      this.upgradeMenu.init(this.upgradeSystem, this.currencySystem);
      this.shopMenu.init(this.currencySystem);
      this.attachmentMenu.init(this.attachmentSystem, this.currencySystem);
      
      // Give starting coins to new players
      this.currencySystem.giveStartingCoins(100);
      
      // Set up fullscreen event listeners
      this.setupFullscreenListeners();
      
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.state = 'menu';
      
      // Set up event listener to start menu music on first user interaction
      const startMenuMusic = () => {
        this.audioManager.playMusic('menu');
        document.removeEventListener('click', startMenuMusic);
        document.removeEventListener('keydown', startMenuMusic);
      };
      document.addEventListener('click', startMenuMusic);
      document.addEventListener('keydown', startMenuMusic);
      
      this.start();
    } catch (error) {
      console.error('Initialization error:', error);
      // Show error message to user
      this.state = 'error';
    }
  }
  
  async loadCutsceneData() {
    // Load all boss cutscene data files
    const cutsceneFiles = [
      { id: 0, file: 'core/cutscene/data/the_warlord_intro.json' },
      { id: 1, file: 'core/cutscene/data/the_devastator_intro.json' },
      { id: 2, file: 'core/cutscene/data/the_annihilator_intro.json' },
      { id: 3, file: 'core/cutscene/data/the_overlord_intro.json' }
    ];
    
    for (const cutscene of cutsceneFiles) {
      try {
        const response = await fetch(cutscene.file);
        if (response.ok) {
          const data = await response.json();
          this.cutsceneData[cutscene.id] = data;
        }
      } catch (error) {
        console.warn(`Failed to load cutscene: ${cutscene.file}`, error);
      }
    }
  }

  /**
   * Load saved settings from SaveSystem
   */
  loadSavedSettings() {
    try {
      const settings = this.saveSystem.loadSettings();
      this.saveSystem.applySettings(this, settings);
      console.log('Settings loaded successfully');
    } catch (error) {
      console.warn('Could not load saved settings:', error);
    }
  }

  /**
   * Save current settings to SaveSystem
   */
  saveCurrentSettings() {
    const settings = {
      masterVolume: this.masterVolume,
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      audioEnabled: this.audioEnabled,
      fullscreen: this.isFullscreen,
      screenShake: this.screenShake,
      particleQuality: this.particleQuality,
      showFPS: this.showFPS,
      hudOpacity: this.hudOpacity,
      crosshairStyle: this.crosshairStyle,
      difficulty: this.difficulty,
      autoReload: this.autoReload,
      mouseAiming: this.mouseAiming,
      cameraSmoothness: this.cameraSmoothness,
      colorBlindMode: this.colorBlindMode,
      bloodEffects: this.bloodEffects,
      screenFlash: this.screenFlash,
      enemyAggression: this.enemyAggression,
      bulletSpeed: this.bulletSpeed,
      explosionSize: this.explosionSize
    };
    this.saveSystem.saveSettings(settings);
  }

  /**
   * Set up fullscreen event listeners
   */
  setupFullscreenListeners() {
    // Handle fullscreen change events
    document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
    document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
    document.addEventListener('mozfullscreenchange', () => this.handleFullscreenChange());
    document.addEventListener('MSFullscreenChange', () => this.handleFullscreenChange());
  }

  /**
   * Handle fullscreen change event
   */
  handleFullscreenChange() {
    const isNowFullscreen = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
    
    this.isFullscreen = isNowFullscreen;
    
    if (isNowFullscreen) {
      this.scaleCanvasToFullscreen();
    } else {
      this.restoreCanvasSize();
    }
  }

  /**
   * Toggle fullscreen mode
   */
  toggleFullscreen() {
    if (!this.isFullscreen) {
      this.enterFullscreen();
    } else {
      this.exitFullscreen();
    }
  }

  /**
   * Enter fullscreen mode
   */
  enterFullscreen() {
    const elem = document.documentElement;
    
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  }

  /**
   * Exit fullscreen mode
   */
  exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }

  /**
   * Scale canvas to fill the screen while maintaining aspect ratio
   */
  scaleCanvasToFullscreen() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const aspectRatio = this.originalCanvasWidth / this.originalCanvasHeight;
    
    let newWidth, newHeight;
    
    if (screenWidth / screenHeight > aspectRatio) {
      // Screen is wider than canvas aspect ratio
      newHeight = screenHeight;
      newWidth = screenHeight * aspectRatio;
    } else {
      // Screen is taller than canvas aspect ratio
      newWidth = screenWidth;
      newHeight = screenWidth / aspectRatio;
    }
    
    this.canvas.style.width = `${newWidth}px`;
    this.canvas.style.height = `${newHeight}px`;
    this.canvas.style.position = 'fixed';
    this.canvas.style.left = `${(screenWidth - newWidth) / 2}px`;
    this.canvas.style.top = `${(screenHeight - newHeight) / 2}px`;
  }

  /**
   * Restore canvas to original size
   */
  restoreCanvasSize() {
    this.canvas.style.width = '';
    this.canvas.style.height = '';
    this.canvas.style.position = '';
    this.canvas.style.left = '';
    this.canvas.style.top = '';
  }

  /**
   * Auto-save game progress
   * @param {number} slotIndex - The save slot to use
   */
  autoSave(slotIndex = 0) {
    if (this.state === 'playing' || this.state === 'levelcomplete') {
      this.saveSystem.autoSave(this, slotIndex);
    }
  }

  start() {
    this.lastTime = performance.now();
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  startGame(mode, character) {
    this.mode = mode;
    this.selectedCharacter = character;
    this.menuState = null; // Reset menu state to ensure game renders properly
    
    // Reset game state
    this.score = 0;
    this.kills = 0;
    this.wave = 1;
    this.currentLevel = 1;
    this.waveTimer = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.maxCombo = 0;
    this.totalDamageTaken = 0;
    this.totalDamageDealt = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.playTime = 0;
    this.bossesKilled = 0;
    this.weaponsCollected = 0;
    this.damageTakenThisWave = 0;
    this.gameStartTime = performance.now();
    
    // Story transition state for walking animation
    this.levelTransitionActive = false;
    this.levelTransitionProgress = 0;
    this.pendingLevelTransition = false;
    
    // Create player with difficulty modifiers
    this.player = new PlayerCharacter(100, this.groundLevel - 50, character);
    
    // Apply skin system customization to player
    if (this.skinSystem) {
      this.skinSystem.applySkinToPlayer(this.player, character);
    }
    
    // Start statistics tracking session
    if (this.statisticsSystem) {
      this.statisticsSystem.startSession();
    }
    
    // Apply difficulty modifiers to player
    if (this.difficulty === 'baby') {
      this.player.maxHealth = Math.floor(this.player.maxHealth * 5); // Very high health for baby mode
      this.player.health = this.player.maxHealth;
    } else if (this.difficulty === 'easy') {
      this.player.maxHealth = Math.floor(this.player.maxHealth * 2.5);
      this.player.health = this.player.maxHealth;
    } else if (this.difficulty === 'extreme') {
      this.player.maxHealth = Math.floor(this.player.maxHealth * 0.7);
      this.player.health = this.player.maxHealth;
    }
    
    // Add spawn protection to prevent instant death
    this.player.invulnerable = true;
    setTimeout(() => {
      if (this.player && this.player.active) {
        this.player.invulnerable = false;
      }
    }, 1500); // 1.5 seconds of spawn protection
    
    // Phase 2: Apply permanent upgrades to player
    if (this.upgradeSystem) {
      this.upgradeSystem.applyToPlayer(this.player);
    }
    
    this.camera.follow(this.player);
    
    // Clear arrays
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];
    this.covers = [];
    this.collisionSystem.clear();
    this.particleSystem.clear();
    
    // Phase 1: Clear hazards and interactive elements
    this.hazardManager.clear();
    this.movingPlatforms = [];
    this.switches = [];
    this.doors = [];
    this.jumpPads = [];
    
    // Phase 2: Clear coins and shop vendor
    this.coinPickups = [];
    this.shopVendor = null;
    this.noiseSystem.clear();
    this.formationSystem.clear();
    
    // Phase 3: Initialize weather and time systems
    this.weatherSystem.init('CLEAR');
    this.timeOfDaySystem.init('DAY');
    this.vehicles = [];
    this.mountedWeapons = [];
    
    // Phase 5: Initialize biome system based on current level
    const levelIndex = Math.min(this.currentLevel - 1, GameConfig.CAMPAIGN_LEVELS.length - 1);
    const levelConfig = levelIndex >= 0 ? GameConfig.CAMPAIGN_LEVELS[levelIndex] : null;
    const biome = levelConfig && levelConfig.biome ? levelConfig.biome : 'DEFAULT';
    if (this.biomeSystem) {
      this.biomeSystem.init(biome);
    }
    
    // Initialize level theme system for per-level visual variety
    if (this.levelThemeSystem) {
      this.levelThemeSystem.init(levelIndex);
      
      // Get environment settings from level theme
      const envSettings = this.levelThemeSystem.getLevelEnvironmentSettings();
      
      // Set weather based on level visual profile (overrides biome default)
      if (this.weatherSystem && envSettings.weather) {
        this.weatherSystem.setWeather(envSettings.weather);
      }
      
      // Set time of day based on level visual profile
      if (this.timeOfDaySystem && envSettings.timeOfDay) {
        this.timeOfDaySystem.setPhase(envSettings.timeOfDay);
      }
    } else {
      // Fallback: Set weather based on biome
      if (this.biomeSystem && this.weatherSystem) {
        const recommendedWeather = this.biomeSystem.getRecommendedWeather();
        if (recommendedWeather !== 'CLEAR') {
          this.weatherSystem.setWeather(recommendedWeather);
        }
      }
    }
    
    // Spawn cover objects
    this.spawnCovers();
    
    // Spawn level terrain (platforms, slopes)
    this.spawnLevelTerrain();
    
    // Phase 1: Spawn hazards
    this.hazardManager.spawnHazards(mode, this.currentLevel, this.wave, this.groundLevel, this.worldWidth);
    
    // Phase 3: Spawn vehicles
    this.spawnVehicles(mode, this.currentLevel);
    
    // Phase 3: Spawn mounted weapons
    this.spawnMountedWeapons(mode, this.currentLevel);
    
    // Phase 3: Spawn interactive elements
    this.spawnInteractiveElements(mode, this.currentLevel);
    
    // For campaign mode, check if we should play prologue cutscene
    if (mode === 'campaign' && this.currentLevel === 1) {
      // Play prologue cutscene before Level 1
      this.playStoryCutscene('prologue', () => {
        // After prologue, play level 1 intro
        this.playStoryCutscene('level1_intro', () => {
          // Then start gameplay
          this.spawnCampaignEnemies();
          this.spawnPickups();
          this.addStarterKnife();
          this.state = 'playing';
          this.audioManager.stopMusic();
          this.audioManager.playMusic('gameplay');
        });
      });
      return; // Exit early, cutscene will handle rest
    }
    
    // Spawn initial enemies based on game mode
    if (mode === 'survival') {
      this.spawnWave();
      // Start dynamic event system for survival mode
      this.dynamicEventSystem.start();
    } else if (mode === 'campaign') {
      this.spawnCampaignEnemies();
      // Start story briefing for campaign levels
      if (this.storyManager && this.currentLevel > 1) {
        this.storyManager.startBriefing(this.currentLevel);
      }
    } else if (mode === 'timeattack') {
      // Time Attack Mode: Start the timer and spawn campaign enemies
      this.timeAttackMode.start(this.currentLevel);
      this.spawnCampaignEnemies();
    } else if (mode === 'bossrush') {
      // Boss Rush Mode: Start boss rush and spawn first boss
      this.bossRushMode.start(0, 0, false);
      this.spawnBossRushBoss();
    } else if (mode === 'horde') {
      // Horde Mode: Start endless wave mode
      this.hordeMode.start();
      this.spawnHordeWave();
      // Start dynamic event system for horde mode too
      this.dynamicEventSystem.start();
    } else if (mode === 'onehit') {
      // One-Hit Mode: Apply one-hit rules and spawn campaign enemies
      this.oneHitMode.start(1);
      this.oneHitMode.applyToPlayer(this.player);
      this.spawnCampaignEnemies();
      // Apply one-hit mode to all enemies
      this.enemies.forEach(enemy => this.oneHitMode.applyToEnemy(enemy));
    } else if (mode === 'basedefense') {
      // Base Defense Mode: Protect your objective from 20 waves
      this.baseDefenseMode.start();
      this.spawnBaseDefenseWave();
      // Start dynamic event system for base defense mode
      this.dynamicEventSystem.start();
    }
    
    // Add some pickups
    this.spawnPickups();
    
    // Add a starter knife pickup near the player
    this.addStarterKnife();
    
    // Set game state and music after spawning (in case a cutscene started)
    // Only set to playing if not in cutscene (e.g., if starting on a boss level)
    if (this.state !== 'cutscene') {
      this.state = 'playing';
      this.audioManager.stopMusic();
      this.audioManager.playMusic('gameplay');
    }
  }
  
  /**
   * Spawn boss for Boss Rush mode
   */
  spawnBossRushBoss() {
    const bossId = this.bossRushMode.getCurrentBossId();
    if (bossId === null) return;
    
    const bossX = this.player.x + 800;
    const boss = new EnemyUnit(bossX, this.groundLevel - 70, 'boss');
    
    // Apply boss rush difficulty
    this.bossRushMode.applyDifficultyToBoss(boss);
    
    // Set boss properties
    boss.isBoss = true;
    boss.bossId = bossId;
    boss.bossName = this.bossRushMode.getBossName(bossId);
    
    // Apply standard boss enhancements
    boss.maxHealth *= 9;
    boss.health = boss.maxHealth;
    boss.damage *= 3;
    boss.speed *= 1.8;
    boss.shootCooldown *= 0.4;
    boss.aggroRange = 9999;
    boss.attackRange = 1000;
    
    this.enemies.push(boss);
    this.collisionSystem.add(boss);
    this.enemiesRemaining = 1;
    
    // Start boss cutscene
    this.startBossCutscene(boss);
  }
  
  /**
   * Spawn wave for Horde mode
   */
  spawnHordeWave() {
    const waveConfig = this.hordeMode.startNextWave();
    
    waveConfig.enemies.forEach((enemyData, index) => {
      const x = this.player.x + 400 + index * 150 + Math.random() * 100;
      
      let enemy;
      if (enemyData.type === 'boss') {
        enemy = new EnemyUnit(x, this.groundLevel - 70, 'boss');
        enemy.isBoss = true;
        enemy.bossId = enemyData.bossId;
        enemy.bossName = this.getBossName(enemyData.bossId);
      } else {
        enemy = new EnemyUnit(x, this.groundLevel - 48, enemyData.type);
      }
      
      // Apply horde mode scaling
      enemy.maxHealth = Math.floor(enemy.maxHealth * enemyData.healthMultiplier);
      enemy.health = enemy.maxHealth;
      enemy.damage = Math.floor(enemy.damage * enemyData.damageMultiplier);
      
      // Apply elite status
      if (enemyData.isElite) {
        enemy.makeElite();
      }
      
      // Apply mini-boss status
      if (enemyData.isMiniBoss) {
        enemy.makeMiniBoss();
      }
      
      this.enemies.push(enemy);
      this.collisionSystem.add(enemy);
    });
    
    this.enemiesRemaining = this.enemies.length;
    
    // Apply horde mode modifiers
    this.hordeMode.applyModifiers(this);
  }
  
  /**
   * Spawn wave for Base Defense mode
   */
  spawnBaseDefenseWave() {
    const waveConfig = this.baseDefenseMode.getWaveConfig();
    const enemyTypes = ['infantry', 'scout', 'heavy', 'sniper', 'berserker'];
    
    // Calculate enemy count based on wave
    const baseCount = waveConfig.enemyCountBase || 5;
    const perWave = waveConfig.enemyCountPerWave || 2;
    const wave = this.baseDefenseMode.wave;
    const enemyCount = baseCount + (wave * perWave);
    
    // Spawn enemies from the right side
    for (let i = 0; i < enemyCount; i++) {
      const x = this.worldWidth - 100 - Math.random() * 300;
      const typeIndex = Math.floor(Math.random() * Math.min(1 + Math.floor(wave / 2), enemyTypes.length));
      const enemyType = enemyTypes[typeIndex];
      
      const enemy = new EnemyUnit(x, this.groundLevel - 48, enemyType);
      
      // Apply wave scaling
      const healthScale = 1 + ((wave - 1) * (waveConfig.healthScaling || 0.05));
      const damageScale = 1 + ((wave - 1) * (waveConfig.damageScaling || 0.03));
      
      enemy.maxHealth = Math.floor(enemy.maxHealth * healthScale);
      enemy.health = enemy.maxHealth;
      enemy.damage = Math.floor(enemy.damage * damageScale);
      
      // Add elite enemies in later waves
      if (wave >= 5 && Math.random() < 0.15) {
        enemy.makeElite();
      }
      
      this.enemies.push(enemy);
      this.collisionSystem.add(enemy);
    }
    
    // Spawn boss on boss waves
    const bossWaves = waveConfig.bossWaves || [5, 10, 15, 20];
    if (bossWaves.includes(wave)) {
      const bossX = this.worldWidth - 200;
      const boss = new EnemyUnit(bossX, this.groundLevel - 70, 'boss');
      boss.isBoss = true;
      boss.bossId = bossWaves.indexOf(wave);
      boss.bossName = this.getBossName(boss.bossId);
      
      // Scale boss health
      boss.maxHealth = Math.floor(boss.maxHealth * 6);
      boss.health = boss.maxHealth;
      
      this.enemies.push(boss);
      this.collisionSystem.add(boss);
    }
    
    this.enemiesRemaining = this.enemies.length;
    this.baseDefenseMode.waveEnemyCount = this.enemies.length;
  }
  
  /**
   * Add starter knife pickup near player spawn
   */
  addStarterKnife() {
    const starterKnife = new Pickup(200, this.groundLevel - 50, 'weapon_knife');
    this.pickups.push(starterKnife);
    this.collisionSystem.add(starterKnife);
  }
  
  /**
   * Spawn vehicles for a level
   * @param {string} mode - Game mode
   * @param {number} level - Current level
   */
  spawnVehicles(mode, level) {
    // Preserve the player's current vehicle if they're in one
    const playerVehicle = this.player && this.player.isInVehicle ? this.player.currentVehicle : null;
    this.vehicles = [];
    
    // Re-add player's vehicle to the array if they're still using it
    if (playerVehicle && !playerVehicle.isDestroyed) {
      this.vehicles.push(playerVehicle);
    }
    
    // Vehicles spawn in campaign mode starting from level 3
    if (mode === 'campaign' && level >= 3) {
      // Spawn a Jeep on some levels
      if (level % 2 === 0) {
        const jeep = new Jeep(500 + Math.random() * 400, this.groundLevel - 40);
        this.vehicles.push(jeep);
      }
      
      // Spawn a Tank on boss levels and late levels
      if (level >= 6 || level % 3 === 0) {
        const tank = new Tank(800 + Math.random() * 600, this.groundLevel - 50);
        this.vehicles.push(tank);
      }
    }
    
    // Survival mode gets vehicles every 5 waves
    if (mode === 'survival' && this.wave >= 5 && this.wave % 5 === 0) {
      const jeep = new Jeep(this.player.x + 300, this.groundLevel - 40);
      this.vehicles.push(jeep);
    }
  }
  
  /**
   * Spawn mounted weapons for a level
   * @param {string} mode - Game mode
   * @param {number} level - Current level
   */
  spawnMountedWeapons(mode, level) {
    // Preserve the player's current mounted weapon if they're mounted
    const playerMountedWeapon = this.player && this.player.isMounted ? this.player.currentMountedWeapon : null;
    this.mountedWeapons = [];
    
    // Re-add player's mounted weapon to the array if they're still using it
    if (playerMountedWeapon && playerMountedWeapon.active) {
      this.mountedWeapons.push(playerMountedWeapon);
    }
    
    // Mounted weapons in campaign mode
    if (mode === 'campaign') {
      // HMG placement on certain levels
      if (level >= 2) {
        const hmg = new MountedWeapon(600 + Math.random() * 200, this.groundLevel - 50, 'HMG');
        this.mountedWeapons.push(hmg);
      }
      
      // Sniper position on sniper-themed levels
      if (level === 5 || level === 8) {
        const sniper = new MountedWeapon(900 + Math.random() * 300, this.groundLevel - 250, 'SNIPER');
        this.mountedWeapons.push(sniper);
      }
      
      // Rocket launcher on boss levels
      if (level === 3 || level === 6 || level === 9 || level === 10) {
        const rocket = new MountedWeapon(400 + Math.random() * 200, this.groundLevel - 50, 'ROCKET');
        this.mountedWeapons.push(rocket);
      }
    }
    
    // Survival mode mounted weapons
    if (mode === 'survival' && this.wave >= 3 && this.wave % 3 === 0) {
      const hmg = new MountedWeapon(this.player.x + 200, this.groundLevel - 50, 'HMG');
      this.mountedWeapons.push(hmg);
    }
  }
  
  /**
   * Spawn interactive elements for a level
   * @param {string} mode - Game mode
   * @param {number} level - Current level
   */
  spawnInteractiveElements(mode, level) {
    this.movingPlatforms = [];
    this.switches = [];
    this.doors = [];
    this.jumpPads = [];
    
    if (mode === 'campaign') {
      // Level-specific interactive elements
      if (level >= 4) {
        // Jump pads for vertical gameplay
        const jumpPad1 = new JumpPad(350, this.groundLevel - 16, 300);
        this.jumpPads.push(jumpPad1);
        
        if (level >= 6) {
          const jumpPad2 = new JumpPad(750, this.groundLevel - 16, 350);
          this.jumpPads.push(jumpPad2);
        }
      }
      
      // Moving platforms on levels with verticality
      if (level >= 5) {
        const movingPlatform = new MovingPlatform(
          500, this.groundLevel - 150, 128, 24,
          [
            { x: 500, y: this.groundLevel - 150 },
            { x: 800, y: this.groundLevel - 150 },
            { x: 800, y: this.groundLevel - 250 },
            { x: 500, y: this.groundLevel - 250 }
          ],
          2
        );
        this.movingPlatforms.push(movingPlatform);
      }
      
      // Door and switch puzzle on later levels
      if (level >= 7) {
        const door = new Door(1200, this.groundLevel - 80, 20, 80);
        const switchObj = new Switch(400, this.groundLevel - 32, door);
        door.isOpen = false;
        
        this.doors.push(door);
        this.switches.push(switchObj);
      }
    }
  }
  
  /**
   * Toggle flashlight on/off
   */
  toggleFlashlight() {
    if (this.flashlightBattery > 0 || this.flashlightOn) {
      this.flashlightOn = !this.flashlightOn;
      this.audioManager.playSound('pickup_weapon', 0.3);
    }
  }
  
  /**
   * Update flashlight battery
   * @param {number} deltaTime - Time since last update
   */
  updateFlashlight(deltaTime) {
    const dt = deltaTime / 1000; // Convert to seconds
    
    if (this.flashlightOn) {
      this.flashlightBattery -= dt;
      if (this.flashlightBattery <= 0) {
        this.flashlightBattery = 0;
        this.flashlightOn = false;
      }
    } else {
      // Recharge when off
      this.flashlightBattery = Math.min(
        this.flashlightMaxBattery,
        this.flashlightBattery + this.flashlightRechargeRate * dt
      );
    }
  }
  
  /**
   * Render flashlight effect
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderFlashlight(ctx) {
    if (!this.flashlightOn || !this.player || !this.player.active) return;
    
    const playerCenterX = this.player.x + this.player.width / 2;
    const playerCenterY = this.player.y + this.player.height / 2;
    
    // Get facing direction
    const facingRight = this.player.facing === 1;
    const angle = facingRight ? 0 : Math.PI;
    
    ctx.save();
    
    // Create flashlight cone
    const gradient = ctx.createRadialGradient(
      playerCenterX, playerCenterY, 0,
      playerCenterX, playerCenterY, this.flashlightRange
    );
    gradient.addColorStop(0, 'rgba(255, 255, 200, 0.4)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 200, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
    
    ctx.beginPath();
    ctx.moveTo(playerCenterX, playerCenterY);
    ctx.arc(
      playerCenterX, playerCenterY,
      this.flashlightRange,
      angle - this.flashlightConeAngle / 2,
      angle + this.flashlightConeAngle / 2
    );
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.restore();
  }
  
  /**
   * Render ghost replay in Time Attack mode
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderTimeAttackGhost(ctx) {
    if (!this.timeAttackMode || !this.timeAttackMode.active) return;
    
    const ghostPos = this.timeAttackMode.getGhostPosition(this.timeAttackMode.elapsedTime);
    if (!ghostPos || !this.player) return;
    
    ctx.save();
    ctx.globalAlpha = 0.4;
    
    // Draw ghost player silhouette
    const playerWidth = this.player.width;
    const playerHeight = this.player.height;
    
    ctx.fillStyle = '#88aaff';
    ctx.fillRect(ghostPos.x, ghostPos.y, playerWidth, playerHeight);
    
    // Draw ghost outline
    ctx.strokeStyle = '#4488ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(ghostPos.x, ghostPos.y, playerWidth, playerHeight);
    
    // Draw "GHOST" label
    ctx.fillStyle = '#4488ff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BEST', ghostPos.x + playerWidth / 2, ghostPos.y - 5);
    
    ctx.restore();
  }
  
  /**
   * Play a story cutscene by ID
   * @param {string} cutsceneId - ID of the cutscene to play
   * @param {Function} onComplete - Callback when cutscene ends
   */
  playStoryCutscene(cutsceneId, onComplete) {
    // Get cutscene data from StoryCutsceneData
    if (typeof window.getStoryCutsceneById !== 'function') {
      console.warn('StoryCutsceneData not loaded');
      if (onComplete) onComplete();
      return;
    }
    
    const cutsceneData = window.getStoryCutsceneById(cutsceneId);
    if (!cutsceneData) {
      console.warn('Cutscene not found:', cutsceneId);
      if (onComplete) onComplete();
      return;
    }
    
    // Load the cutscene
    this.cutsceneManager.loadCutscene(cutsceneData, null, this.player);
    
    // Change game state to cutscene
    this.state = 'cutscene';
    
    // Create wrapper callbacks that ensure state is properly managed after cutscene ends
    const wrappedCallback = () => {
      // After the callback executes, check if we're still in cutscene state
      // but the cutscene manager is idle (meaning no new cutscene was started)
      const stateBeforeCallback = this.state;
      
      if (onComplete) onComplete();
      
      // If the callback didn't start a new cutscene, ensure we exit cutscene state
      if (this.state === 'cutscene' && !this.cutsceneManager.isActive()) {
        // Reset to playing state as a safe default
        // (callbacks should set specific states if needed)
        this.state = 'playing';
      }
    };
    
    // Start playing the cutscene
    this.cutsceneManager.play(
      // On complete callback
      wrappedCallback,
      // On skip callback
      wrappedCallback
    );
  }
  
  /**
   * Play a level intro cutscene
   * @param {number} level - Level number
   * @param {Function} onComplete - Callback when cutscene ends
   */
  playLevelIntroCutscene(level, onComplete) {
    const cutsceneId = `level${level}_intro`;
    this.playStoryCutscene(cutsceneId, onComplete);
  }
  
  /**
   * Play a level outro cutscene (after level completion)
   * @param {number} level - Level number
   * @param {Function} onComplete - Callback when cutscene ends
   */
  playLevelOutroCutscene(level, onComplete) {
    const cutsceneId = `level${level}_outro`;
    this.playStoryCutscene(cutsceneId, onComplete);
  }
  
  // Level transition constants
  static TRANSITION_OFFSCREEN_BUFFER = 100; // Pixels past screen edge
  static TRANSITION_WALK_SPEED = 3; // Pixels per frame
  static TRANSITION_DURATION = 2000; // Milliseconds

  /**
   * Start the walking off-screen level transition animation
   * @param {Function} onComplete - Callback when animation completes
   */
  startLevelTransition(onComplete) {
    this.levelTransitionActive = true;
    this.levelTransitionProgress = 0;
    this.levelTransitionCallback = onComplete;
    this.levelTransitionStartX = this.player.x;
    this.levelTransitionTargetX = this.canvas.width + this.camera.x + GameEngine.TRANSITION_OFFSCREEN_BUFFER;
    this.player.invulnerable = true; // Make player invulnerable during transition
  }
  
  /**
   * Update level transition animation
   * @param {number} deltaTime - Time since last frame
   */
  updateLevelTransition(deltaTime) {
    if (!this.levelTransitionActive) return;
    
    this.levelTransitionProgress += deltaTime;
    
    // Move player to the right
    if (this.player && this.player.active) {
      this.player.x += GameEngine.TRANSITION_WALK_SPEED;
      this.player.facing = 1; // Face right
      this.player.dx = GameEngine.TRANSITION_WALK_SPEED; // Simulate walking animation
    }
    
    // Check if transition is complete
    if (this.levelTransitionProgress >= GameEngine.TRANSITION_DURATION || 
        (this.player && this.player.x > this.levelTransitionTargetX)) {
      this.levelTransitionActive = false;
      this.levelTransitionProgress = 0;
      
      // Reset player position for next level
      if (this.player) {
        this.player.x = 100;
        this.player.dx = 0;
      }
      
      // Call completion callback
      if (this.levelTransitionCallback) {
        this.levelTransitionCallback();
        this.levelTransitionCallback = null;
      }
    }
  }

  spawnWave() {
    let enemyCount = 5 + this.wave * 2;
    let difficultyMultiplier = 1.0;
    
    // Apply difficulty modifiers
    if (this.difficulty === 'baby') {
      enemyCount = Math.max(1, Math.floor(enemyCount * 0.2)); // Very few enemies
      difficultyMultiplier = 0.3; // Very weak enemies
    } else if (this.difficulty === 'easy') {
      enemyCount = Math.floor(enemyCount * 0.4);
      difficultyMultiplier = 0.5;
    } else if (this.difficulty === 'extreme') {
      enemyCount = Math.floor(enemyCount * 1.5);
      difficultyMultiplier = 1.5;
    }
    
    this.enemiesRemaining = enemyCount;
    
    // Determine enemy type distribution based on wave
    let types = ['infantry', 'infantry', 'scout']; // Early waves
    if (this.wave >= 3) {
      types.push('heavy');
    }
    if (this.wave >= 5) {
      types.push('sniper');
    }
    if (this.wave >= 7) {
      types.push('heavy', 'sniper'); // More elite units
    }
    // Phase 1: Add new enemy types at higher waves
    if (this.wave >= 4) {
      types.push('medic');
    }
    if (this.wave >= 6) {
      types.push('engineer');
    }
    if (this.wave >= 8) {
      types.push('flamethrower');
    }
    
    // Phase 1: Get elite spawn config
    const eliteConfig = typeof GameConfig !== 'undefined' && GameConfig.ELITE ? 
      GameConfig.ELITE : { spawnChance: 0.1, startWave: 3 };
    
    for (let i = 0; i < enemyCount; i++) {
      const x = this.player.x + 400 + Math.random() * 1000;
      const type = types[Math.floor(Math.random() * types.length)];
      
      const enemy = new EnemyUnit(x, this.groundLevel - 48, type);
      enemy.applyDifficulty(difficultyMultiplier);
      
      // Phase 1: Elite enemy spawn chance
      if (this.wave >= eliteConfig.startWave && Math.random() < eliteConfig.spawnChance) {
        enemy.makeElite();
        
        // Show elite spawn notification
        this.particleSystem.createTextPopup(
          enemy.x + enemy.width / 2,
          enemy.y - 30,
          'ELITE!',
          '#ffdd00'
        );
      }
      
      this.enemies.push(enemy);
      this.collisionSystem.add(enemy);
    }
    
    // Phase 1: Spawn mini-boss every 3 waves (starting wave 6)
    const miniBossConfig = typeof GameConfig !== 'undefined' && GameConfig.MINIBOSS ? 
      GameConfig.MINIBOSS : { spawnInterval: 3 };
    
    if (this.wave >= 6 && this.wave % miniBossConfig.spawnInterval === 0) {
      const miniBossX = this.player.x + 600;
      const miniBossTypes = ['heavy', 'berserker', 'sniper', 'bomber'];
      const miniBossType = miniBossTypes[Math.floor(Math.random() * miniBossTypes.length)];
      
      const miniBoss = new EnemyUnit(miniBossX, this.groundLevel - 60, miniBossType);
      miniBoss.applyDifficulty(difficultyMultiplier);
      miniBoss.makeMiniBoss();
      
      this.enemies.push(miniBoss);
      this.collisionSystem.add(miniBoss);
      this.enemiesRemaining++;
      
      // Show mini-boss warning
      this.particleSystem.createTextPopup(
        this.canvas.width / 2,
        100,
        'MINI-BOSS APPROACHING!',
        '#ff00ff'
      );
      
      // Camera shake and sound for dramatic effect
      this.camera.shake(8, 500);
      this.audioManager.playSound('ability_airstrike', 0.6);
    }
    
    // Spawn boss every 5 waves
    if (this.wave % 5 === 0 && this.wave > 0) {
      const bossX = this.player.x + 800;
      const boss = new EnemyUnit(bossX, this.groundLevel - 70, 'boss');
      boss.applyDifficulty(difficultyMultiplier);
      this.enemies.push(boss);
      this.collisionSystem.add(boss);
      this.enemiesRemaining++;
    }
  }

  spawnCampaignEnemies() {
    // Define campaign levels with increasing difficulty and variety
    const levels = [
      // Level 1: Basic Training - Infantry only
      {
        name: 'Basic Training',
        enemies: [
          { type: 'infantry', count: 3, spacing: 300 },
          { type: 'scout', count: 2, spacing: 400 }
        ]
      },
      // Level 2: First Contact - Mixed units
      {
        name: 'First Contact',
        enemies: [
          { type: 'infantry', count: 4, spacing: 250 },
          { type: 'heavy', count: 2, spacing: 500 },
          { type: 'scout', count: 3, spacing: 350 }
        ]
      },
      // Level 3: Boss Arena - First Boss
      {
        name: 'Boss Arena: The Warlord',
        enemies: [
          { type: 'boss', count: 1, spacing: 0, position: 1500, bossId: 0 }
        ],
        isBossLevel: true
      },
      // Level 4: Heavy Assault - Many heavy units
      {
        name: 'Heavy Assault',
        enemies: [
          { type: 'heavy', count: 3, spacing: 400 },
          { type: 'infantry', count: 5, spacing: 250 },
          { type: 'sniper', count: 2, spacing: 600 }
        ]
      },
      // Level 5: Sniper Alley - Long range combat
      {
        name: 'Sniper Alley',
        enemies: [
          { type: 'sniper', count: 4, spacing: 500 },
          { type: 'scout', count: 4, spacing: 300 },
          { type: 'heavy', count: 2, spacing: 600 }
        ]
      },
      // Level 6: Boss Arena - Elite Commander
      {
        name: 'Boss Arena: The Devastator',
        enemies: [
          { type: 'boss', count: 1, spacing: 0, position: 1800, bossId: 1 }
        ],
        isBossLevel: true
      },
      // Level 7: Urban Warfare - City ruins with multi-tier combat
      {
        name: 'Urban Warfare',
        enemies: [
          { type: 'infantry', count: 5, spacing: 280 },
          { type: 'heavy', count: 3, spacing: 450 },
          { type: 'sniper', count: 4, spacing: 550 },
          { type: 'scout', count: 4, spacing: 320 }
        ]
      },
      // Level 8: Industrial Complex - Factory with moving platforms feel
      {
        name: 'Industrial Complex',
        enemies: [
          { type: 'infantry', count: 6, spacing: 300 },
          { type: 'heavy', count: 4, spacing: 420 },
          { type: 'sniper', count: 3, spacing: 600 },
          { type: 'scout', count: 5, spacing: 340 }
        ]
      },
      // Level 9: Elite Commander Boss - Toughest boss before final
      {
        name: 'Boss Arena: The Annihilator',
        enemies: [
          { type: 'boss', count: 1, spacing: 0, position: 1900, bossId: 2 }
        ],
        isBossLevel: true
      },
      // Level 10: Final Stand - Maximum difficulty ultimate level
      {
        name: 'Final Boss: The Overlord',
        enemies: [
          { type: 'boss', count: 1, spacing: 0, position: 2200, bossId: 3 }
        ],
        isBossLevel: true
      },
      // Phase 5: Level 11 - Desert Outpost
      {
        name: 'Desert Outpost',
        biome: 'DESERT',
        enemies: [
          { type: 'infantry', count: 6, spacing: 300 },
          { type: 'heavy', count: 3, spacing: 450 },
          { type: 'sniper', count: 4, spacing: 550 },
          { type: 'scout', count: 5, spacing: 280 }
        ]
      },
      // Phase 5: Level 12 - Sandworm Boss
      {
        name: 'Boss Arena: Sandworm',
        biome: 'DESERT',
        enemies: [
          { type: 'phase5boss', count: 1, spacing: 0, position: 1800, bossId: 4, bossClass: 'Sandworm' }
        ],
        isBossLevel: true
      },
      // Phase 5: Level 13 - Tundra Expedition
      {
        name: 'Tundra Expedition',
        biome: 'SNOW',
        enemies: [
          { type: 'infantry', count: 5, spacing: 320 },
          { type: 'heavy', count: 4, spacing: 420 },
          { type: 'sniper', count: 5, spacing: 500 },
          { type: 'scout', count: 4, spacing: 350 }
        ]
      },
      // Phase 5: Level 14 - Frost Titan Boss
      {
        name: 'Boss Arena: Frost Titan',
        biome: 'SNOW',
        enemies: [
          { type: 'phase5boss', count: 1, spacing: 0, position: 1900, bossId: 5, bossClass: 'FrostTitan' }
        ],
        isBossLevel: true
      },
      // Phase 5: Level 15 - City Assault
      {
        name: 'City Assault',
        biome: 'URBAN',
        enemies: [
          { type: 'infantry', count: 7, spacing: 280 },
          { type: 'heavy', count: 4, spacing: 400 },
          { type: 'sniper', count: 5, spacing: 480 },
          { type: 'scout', count: 6, spacing: 320 }
        ]
      },
      // Phase 5: Level 16 - Rooftop Escape
      {
        name: 'Rooftop Escape',
        biome: 'URBAN',
        enemies: [
          { type: 'infantry', count: 6, spacing: 300 },
          { type: 'heavy', count: 3, spacing: 450 },
          { type: 'sniper', count: 6, spacing: 420 },
          { type: 'scout', count: 5, spacing: 340 }
        ]
      },
      // Phase 5: Level 17 - Lab Infiltration
      {
        name: 'Lab Infiltration',
        biome: 'FACILITY',
        enemies: [
          { type: 'infantry', count: 6, spacing: 320 },
          { type: 'heavy', count: 5, spacing: 400 },
          { type: 'sniper', count: 4, spacing: 500 },
          { type: 'engineer', count: 3, spacing: 380 },
          { type: 'scout', count: 5, spacing: 300 }
        ]
      },
      // Phase 5: Level 18 - Reactor Survival (Mech Commander Boss)
      {
        name: 'Reactor Survival',
        biome: 'FACILITY',
        enemies: [
          { type: 'phase5boss', count: 1, spacing: 0, position: 2000, bossId: 6, bossClass: 'MechCommander' }
        ],
        isBossLevel: true
      },
      // Phase 5: Level 19 - Forest Ambush
      {
        name: 'Forest Ambush',
        biome: 'FOREST',
        enemies: [
          { type: 'infantry', count: 8, spacing: 280 },
          { type: 'heavy', count: 5, spacing: 380 },
          { type: 'sniper', count: 6, spacing: 450 },
          { type: 'berserker', count: 3, spacing: 400 },
          { type: 'scout', count: 6, spacing: 300 }
        ]
      },
      // Phase 5: Level 20 - Hell Knight Final Boss
      {
        name: 'Boss Arena: Hell Knight',
        biome: 'HELL',
        enemies: [
          { type: 'phase5boss', count: 1, spacing: 0, position: 2200, bossId: 7, bossClass: 'HellKnight' }
        ],
        isBossLevel: true
      }
    ];
    
    // Get current level config (clamped to available levels)
    const levelIndex = Math.min(this.currentLevel - 1, levels.length - 1);
    const levelConfig = levels[levelIndex];
    
    // Apply difficulty modifiers
    let difficultyMultiplier = 1.0;
    let countMultiplier = 1.0;
    
    if (this.difficulty === 'baby') {
      countMultiplier = 0.4; // 60% fewer enemies
      difficultyMultiplier = 0.3;
    } else if (this.difficulty === 'easy') {
      countMultiplier = 0.6; // 40% fewer enemies
      difficultyMultiplier = 0.5;
    } else if (this.difficulty === 'extreme') {
      countMultiplier = 1.3; // 30% more enemies
      difficultyMultiplier = 1.5;
    }
    
    // Spawn enemies based on level config
    let xOffset = 500;
    levelConfig.enemies.forEach(enemyGroup => {
      const adjustedCount = Math.max(1, Math.floor(enemyGroup.count * countMultiplier));
      
      for (let i = 0; i < adjustedCount; i++) {
        const x = enemyGroup.position !== undefined ? 
          enemyGroup.position : 
          xOffset + i * enemyGroup.spacing + Math.random() * 100;
        
        let enemy;
        
        // Phase 5: Handle new boss types
        if (enemyGroup.type === 'phase5boss') {
          const bossY = this.groundLevel - 100;
          
          switch (enemyGroup.bossClass) {
            case 'Sandworm':
              enemy = new Sandworm(x, bossY);
              break;
            case 'FrostTitan':
              enemy = new FrostTitan(x, bossY);
              break;
            case 'MechCommander':
              enemy = new MechCommander(x, bossY);
              break;
            case 'HellKnight':
              enemy = new HellKnight(x, bossY);
              break;
            default:
              enemy = new EnemyUnit(x, this.groundLevel - 70, 'boss');
          }
          
          enemy.applyDifficulty(difficultyMultiplier);
          enemy.isBoss = true;
          enemy.bossId = enemyGroup.bossId;
          
          this.enemies.push(enemy);
          this.collisionSystem.add(enemy);
        } else {
          // Standard enemy spawning
          enemy = new EnemyUnit(x, this.groundLevel - (enemyGroup.type === 'boss' ? 70 : 48), enemyGroup.type);
          enemy.applyDifficulty(difficultyMultiplier);
        
          // Apply boss-specific enhancements and mechanics
          if (enemyGroup.type === 'boss') {
            const bossId = enemyGroup.bossId !== undefined ? enemyGroup.bossId : 0;
            
            // Base boss enhancements - Challenging but beatable
            enemy.maxHealth *= 9; // 9x base health (reduced from 12x for slight ease)
            enemy.health = enemy.maxHealth;
            enemy.damage *= 3; // 3x more damage (reduced from 4x for slight ease)
            enemy.speed *= 1.8; // 1.8x faster (reduced from 2.2x for slight ease)
            enemy.shootCooldown *= 0.4; // Shoots 2.5x faster (reduced from 0.3x for slight ease)
            enemy.aggroRange = 9999; // Infinite aggro - always targets player
            enemy.attackRange = 1000; // Very long attack range
            enemy.isBoss = true;
            enemy.bossId = bossId;
            enemy.bossName = this.getBossName(bossId);
            
            // Boss-specific unique mechanics
            switch (bossId) {
              case 0: // The Warlord - First boss (Level 3)
                enemy.bossName = 'The Warlord';
                enemy.maxHealth *= 1.1; // 10% more health (reduced from 1.2x for slight ease)
                enemy.specialMechanic = 'rage'; // Gets faster and stronger below 50% HP
                break;
              case 1: // The Devastator - Second boss (Level 6)
                enemy.bossName = 'The Devastator';
                enemy.maxHealth *= 1.5; // 50% more health (reduced from 1.8x for slight ease)
                enemy.damage *= 1.1; // 10% more damage (reduced from 1.2x for slight ease)
                enemy.specialMechanic = 'summon'; // Can summon minions
                enemy.summonCooldown = 15000; // Summon every 15 seconds (slower from 12s for slight ease)
                enemy.lastSummonTime = 0;
                break;
              case 2: // The Annihilator - Third boss (Level 9)
                enemy.bossName = 'The Annihilator';
                enemy.maxHealth *= 2.0; // 2.0x health (reduced from 2.5x for slight ease)
                enemy.damage *= 1.2; // 20% more damage (reduced from 1.4x for slight ease)
                enemy.speed *= 1.1; // 10% faster (reduced from 1.2x for slight ease)
                enemy.specialMechanic = 'shield'; // Periodic shield phases
                enemy.shieldCooldown = 20000; // Slower shield cycling (from 18s for slight ease)
                enemy.lastShieldTime = 0;
                enemy.shieldActive = false;
                break;
              case 3: // The Overlord - FINAL BOSS (Level 10) - EXTREME POWER
                enemy.bossName = 'The Overlord';
                enemy.maxHealth *= 3.5; // 3.5x health - MASSIVE (reduced from 5.0x for slight ease)
                enemy.damage *= 1.8; // 1.8x damage - DEVASTATING (reduced from 2.5x for slight ease)
                enemy.speed *= 1.5; // 1.5x speed - RELENTLESS (reduced from 1.8x for slight ease)
                enemy.shootCooldown *= 0.6; // Shoots 1.67x faster than other bosses (reduced from 0.5x for slight ease)
                enemy.specialMechanic = 'all'; // All mechanics combined
                enemy.isFinalBoss = true;
                enemy.summonCooldown = 13000; // Summons every 13 seconds (slower from 10s for slight ease)
                enemy.lastSummonTime = 0;
                enemy.shieldCooldown = 18000; // Shield every 18 seconds (slower from 15s for slight ease)
                enemy.lastShieldTime = 0;
                enemy.shieldActive = false;
                break;
            }
            
            enemy.health = enemy.maxHealth;
          }
          
          this.enemies.push(enemy);
          this.collisionSystem.add(enemy);
        }
      }
      
      if (enemyGroup.position === undefined) {
        xOffset += adjustedCount * enemyGroup.spacing + 200;
      }
    });
    
    this.enemiesRemaining = this.enemies.length;
    this.currentLevelName = levelConfig.name;
    this.isBossLevel = levelConfig.isBossLevel || false;
    
    // Trigger cutscene for boss levels
    if (levelConfig.isBossLevel && this.mode === 'campaign') {
      // Find the boss that was just spawned
      const boss = this.enemies.find(e => e.isBoss);
      if (boss) {
        this.startBossCutscene(boss);
      }
    }
  }
  
  /**
   * Start a boss intro cutscene
   * @param {Object} boss - The boss entity
   */
  startBossCutscene(boss) {
    // Try to get story cutscene data first
    let cutsceneData = null;
    
    // Check if StoryCutsceneData is available
    if (typeof window.getStoryCutscene === 'function') {
      cutsceneData = window.getStoryCutscene('boss_spawn', this.currentLevel, boss.bossId);
    }
    
    // Fallback to old JSON cutscene data if story cutscene not found
    if (!cutsceneData && this.cutsceneData[boss.bossId]) {
      cutsceneData = this.cutsceneData[boss.bossId];
    }
    
    if (!cutsceneData) {
      console.warn('No cutscene data found for boss:', boss.bossId);
      return;
    }
    
    // Load the cutscene
    this.cutsceneManager.loadCutscene(cutsceneData, boss, this.player);
    
    // Change game state to cutscene
    this.state = 'cutscene';
    
    // Start playing the cutscene
    this.cutsceneManager.play(
      // On complete callback
      () => {
        this.endBossCutscene();
      },
      // On skip callback
      () => {
        this.endBossCutscene();
      }
    );
  }
  
  /**
   * End the boss cutscene and return to gameplay
   */
  endBossCutscene() {
    this.state = 'playing';
    
    // Start boss music for the battle
    this.audioManager.playMusic('boss');
    
    // Give player brief invulnerability after cutscene
    if (this.player && this.player.active) {
      this.player.invulnerable = true;
      setTimeout(() => {
        if (this.player && this.player.active) {
          this.player.invulnerable = false;
        }
      }, 1000);
    }
  }
  
  getBossName(bossId) {
    const bossNames = [
      'The Warlord',
      'The Devastator',
      'The Annihilator',
      'The Overlord',
      'Sandworm',         // Phase 5: Level 12
      'Frost Titan',      // Phase 5: Level 14
      'Mech Commander',   // Phase 5: Level 18
      'Hell Knight'       // Phase 5: Level 20
    ];
    return bossNames[bossId] || 'Unknown Boss';
  }

  spawnPickups() {
    // Separate melee and ranged weapon pickups for weighted spawning
    const commonPickups = ['health', 'ammo', 'weapon_rifle', 'weapon_shotgun'];
    const meleeWeapons = ['weapon_knife', 'weapon_sword', 'weapon_axe', 'weapon_hammer', 'weapon_spear'];
    
    for (let i = 0; i < 5; i++) {
      const x = 300 + i * 400 + Math.random() * 100;
      let y = this.groundLevel - 30;
      
      // Check if there's a platform at this position and spawn on it
      let spawnedOnPlatform = false;
      for (const platform of this.platforms) {
        if (x >= platform.x && x <= platform.x + platform.width) {
          y = platform.y - 30;
          spawnedOnPlatform = true;
          break;
        }
      }
      
      // 70% chance for common pickups, 30% chance for melee weapons
      let type;
      if (Math.random() < 0.7) {
        type = commonPickups[Math.floor(Math.random() * commonPickups.length)];
      } else {
        type = meleeWeapons[Math.floor(Math.random() * meleeWeapons.length)];
      }
      
      const pickup = new Pickup(x, y, type);
      this.pickups.push(pickup);
      this.collisionSystem.add(pickup);
    }
  }

  spawnCovers() {
    // Spawn cover objects strategically based on current level
    const coverConfigs = this.getLevelCoverConfig();
    
    coverConfigs.forEach(coverData => {
      const cover = new Cover(
        coverData.x, 
        coverData.y !== undefined ? coverData.y : this.groundLevel - coverData.size,
        coverData.size, 
        coverData.size, 
        coverData.type || 'crate'
      );
      this.covers.push(cover);
      this.collisionSystem.add(cover);
    });
  }
  
  getLevelCoverConfig() {
    // Strategic cover placement for each level
    const coverConfigs = [
      // Level 1: Basic Training - Simple cover for learning
      [
        { x: 350, size: 30 },
        { x: 700, size: 30 },
        { x: 1050, size: 30 },
        { x: 1400, size: 30 },
        { x: 1750, size: 30 },
      ],
      
      // Level 2: First Contact - More scattered for tactical play
      [
        { x: 300, size: 30 },
        { x: 550, size: 35 },
        { x: 850, size: 30 },
        { x: 1150, size: 35 },
        { x: 1450, size: 30 },
        { x: 1750, size: 30 },
      ],
      
      // Level 3: Boss Arena - Strategic positions around arena
      [
        { x: 450, size: 40 },
        { x: 700, size: 35 },
        { x: 1000, size: 40 },
        { x: 1300, size: 35 },
        { x: 1550, size: 40 },
      ],
      
      // Level 4: Heavy Assault - More cover for heavy combat
      [
        { x: 250, size: 35 },
        { x: 500, size: 40 },
        { x: 750, size: 35 },
        { x: 1000, size: 40 },
        { x: 1250, size: 35 },
        { x: 1500, size: 40 },
        { x: 1750, size: 35 },
      ],
      
      // Level 5: Sniper Alley - Scattered cover, more focus on platforms
      [
        { x: 280, size: 30 },
        { x: 550, size: 35 },
        { x: 800, size: 30 },
        { x: 1100, size: 35 },
        { x: 1350, size: 30 },
        { x: 1650, size: 30 },
      ],
      
      // Level 6: Boss Arena - Heavy cover for intense boss fight
      [
        { x: 400, size: 45 },
        { x: 650, size: 40 },
        { x: 950, size: 45 },
        { x: 1250, size: 40 },
        { x: 1500, size: 45 },
      ],
      
      // Level 7: Urban Warfare - Rubble and debris as cover
      [
        { x: 200, size: 40 },
        { x: 450, size: 35 },
        { x: 700, size: 45 },
        { x: 950, size: 40 },
        { x: 1200, size: 35 },
        { x: 1450, size: 40 },
        { x: 1700, size: 35 },
      ],
      
      // Level 8: Industrial Complex - Machinery as cover
      [
        { x: 300, size: 40 },
        { x: 580, size: 45 },
        { x: 850, size: 40 },
        { x: 1120, size: 45 },
        { x: 1400, size: 40 },
        { x: 1670, size: 40 },
      ],
      
      // Level 9: Elite Commander Boss - Dense cover for survival
      [
        { x: 350, size: 45 },
        { x: 600, size: 40 },
        { x: 900, size: 50 },
        { x: 1200, size: 40 },
        { x: 1450, size: 45 },
        { x: 1700, size: 40 },
      ],
      
      // Level 10: Final Stand - Maximum cover for final battle
      [
        { x: 250, size: 40 },
        { x: 450, size: 45 },
        { x: 650, size: 40 },
        { x: 850, size: 50 },
        { x: 1050, size: 45 },
        { x: 1250, size: 40 },
        { x: 1450, size: 45 },
        { x: 1650, size: 40 },
        { x: 1850, size: 40 },
      ],
    ];
    
    const levelIndex = Math.min(this.currentLevel - 1, coverConfigs.length - 1);
    return coverConfigs[levelIndex] || coverConfigs[0];
  }
  
  spawnLevelTerrain() {
    // Clear existing terrain
    this.platforms = [];
    this.slopes = [];
    
    // Create terrain based on current level
    const terrainConfig = this.getLevelTerrainConfig();
    
    // Spawn platforms
    if (terrainConfig.platforms) {
      terrainConfig.platforms.forEach(pData => {
        const platform = new Platform(pData.x, pData.y, pData.width, pData.height, pData.type || 'solid');
        this.platforms.push(platform);
      });
    }
    
    // Spawn slopes
    if (terrainConfig.slopes) {
      terrainConfig.slopes.forEach(sData => {
        const slope = new Slope(sData.x, sData.y, sData.width, sData.height, sData.direction);
        this.slopes.push(slope);
      });
    }
  }
  
  getLevelTerrainConfig() {
    // Define unique terrain for each level (Gunstar Heroes / Contra style)
    // Improved for better flow, cohesion, and strategic gameplay
    const terrainConfigs = [
      // Level 1: Basic Training - Very gentle introduction with clear progression
      {
        platforms: [
          // Starting area - low, wide platform for easy landing
          { x: 400, y: this.groundLevel - 70, width: 250, height: 20, type: 'passthrough' },
          // Step 2: Slightly higher, encouraging first jump
          { x: 750, y: this.groundLevel - 100, width: 240, height: 20, type: 'passthrough' },
          // Step 3: Introducing vertical movement
          { x: 1100, y: this.groundLevel - 90, width: 230, height: 20, type: 'passthrough' },
          // End platform - easy to reach
          { x: 1450, y: this.groundLevel - 80, width: 250, height: 20, type: 'passthrough' },
        ],
        slopes: [
          // Very gentle introductory slope - teaches slope mechanics
          { x: 200, y: this.groundLevel - 50, width: 180, height: 50, direction: 'up' },
          // Connecting slope to show how slopes work
          { x: 650, y: this.groundLevel - 70, width: 100, height: 30, direction: 'up' },
        ]
      },
      
      // Level 2: First Contact - Clear progression with intuitive platform placement
      {
        platforms: [
          // Lower tier - clear stepping stones
          { x: 350, y: this.groundLevel - 90, width: 230, height: 20, type: 'passthrough' },
          { x: 680, y: this.groundLevel - 110, width: 220, height: 20, type: 'passthrough' },
          // Mid tier - natural progression upward
          { x: 1000, y: this.groundLevel - 150, width: 240, height: 20, type: 'passthrough' },
          { x: 1340, y: this.groundLevel - 140, width: 230, height: 20, type: 'passthrough' },
          // Upper platform - clear goal
          { x: 1670, y: this.groundLevel - 180, width: 250, height: 20, type: 'passthrough' },
        ],
        slopes: [
          // Entry slope - gentle introduction
          { x: 150, y: this.groundLevel - 60, width: 180, height: 60, direction: 'up' },
          // Clear connecting slopes showing the path forward
          { x: 580, y: this.groundLevel - 90, width: 100, height: 20, direction: 'up' },
          { x: 900, y: this.groundLevel - 110, width: 100, height: 40, direction: 'up' },
          { x: 1240, y: this.groundLevel - 150, width: 100, height: 10, direction: 'down' },
          // Exit slope - back to ground for next section
          { x: 1920, y: this.groundLevel - 100, width: 120, height: 100, direction: 'down' },
        ]
      },
      
      // Level 3: Boss Arena - Symmetrical multi-tier arena with strategic positions
      {
        platforms: [
          // Ground level side platforms (solid for cover)
          { x: 250, y: this.groundLevel - 120, width: 280, height: 30, type: 'solid' },
          { x: 1470, y: this.groundLevel - 120, width: 280, height: 30, type: 'solid' },
          // Mid-level platforms (solid, creates layered arena feel)
          { x: 400, y: this.groundLevel - 200, width: 260, height: 30, type: 'solid' },
          { x: 1340, y: this.groundLevel - 200, width: 260, height: 30, type: 'solid' },
          // Center high ground (passthrough, allows tactical positioning)
          { x: 750, y: this.groundLevel - 260, width: 500, height: 25, type: 'passthrough' },
          // Small side perches for dodge opportunities
          { x: 150, y: this.groundLevel - 180, width: 100, height: 20, type: 'passthrough' },
          { x: 1750, y: this.groundLevel - 180, width: 100, height: 20, type: 'passthrough' },
        ],
        slopes: [
          // Slopes to access side platforms
          { x: 100, y: this.groundLevel - 120, width: 150, height: 120, direction: 'up' },
          { x: 1750, y: this.groundLevel - 120, width: 150, height: 120, direction: 'down' },
        ]
      },
      
      // Level 4: Heavy Assault - Industrial zone with conveyor-like platforms
      {
        platforms: [
          // Lower industrial walkways
          { x: 280, y: this.groundLevel - 110, width: 240, height: 20, type: 'passthrough' },
          { x: 650, y: this.groundLevel - 130, width: 200, height: 20, type: 'passthrough' },
          { x: 970, y: this.groundLevel - 110, width: 240, height: 20, type: 'passthrough' },
          { x: 1340, y: this.groundLevel - 130, width: 200, height: 20, type: 'passthrough' },
          // Upper industrial level
          { x: 400, y: this.groundLevel - 200, width: 280, height: 20, type: 'passthrough' },
          { x: 800, y: this.groundLevel - 240, width: 300, height: 20, type: 'passthrough' },
          { x: 1220, y: this.groundLevel - 200, width: 280, height: 20, type: 'passthrough' },
          // High observation deck
          { x: 850, y: this.groundLevel - 320, width: 300, height: 20, type: 'passthrough' },
        ],
        slopes: [
          // Entry ramps
          { x: 150, y: this.groundLevel - 80, width: 130, height: 80, direction: 'up' },
          // Connecting slopes between levels
          { x: 520, y: this.groundLevel - 110, width: 130, height: 90, direction: 'up' },
          { x: 850, y: this.groundLevel - 130, width: 120, height: 110, direction: 'up' },
          { x: 1210, y: this.groundLevel - 110, width: 130, height: 90, direction: 'up' },
          { x: 680, y: this.groundLevel - 200, width: 120, height: 40, direction: 'up' },
          { x: 1100, y: this.groundLevel - 240, width: 120, height: 40, direction: 'down' },
        ]
      },
      
      // Level 5: Sniper Alley - Verticality with sniper positions and cover
      {
        platforms: [
          // Ground level cover platforms (staggered)
          { x: 300, y: this.groundLevel - 100, width: 160, height: 20, type: 'passthrough' },
          { x: 600, y: this.groundLevel - 100, width: 160, height: 20, type: 'passthrough' },
          { x: 900, y: this.groundLevel - 100, width: 160, height: 20, type: 'passthrough' },
          { x: 1200, y: this.groundLevel - 100, width: 160, height: 20, type: 'passthrough' },
          // Mid-level sniper positions
          { x: 400, y: this.groundLevel - 180, width: 200, height: 20, type: 'passthrough' },
          { x: 800, y: this.groundLevel - 210, width: 220, height: 20, type: 'passthrough' },
          { x: 1200, y: this.groundLevel - 180, width: 200, height: 20, type: 'passthrough' },
          // High ground sniper nests
          { x: 250, y: this.groundLevel - 280, width: 240, height: 20, type: 'passthrough' },
          { x: 650, y: this.groundLevel - 320, width: 300, height: 20, type: 'passthrough' },
          { x: 1110, y: this.groundLevel - 280, width: 240, height: 20, type: 'passthrough' },
          // Ultra-high vantage point
          { x: 700, y: this.groundLevel - 400, width: 300, height: 20, type: 'passthrough' },
        ],
        slopes: [
          // Access slopes to different tiers
          { x: 150, y: this.groundLevel - 140, width: 150, height: 140, direction: 'up' },
          { x: 460, y: this.groundLevel - 100, width: 140, height: 80, direction: 'up' },
          { x: 600, y: this.groundLevel - 180, width: 150, height: 100, direction: 'up' },
          { x: 1020, y: this.groundLevel - 210, width: 180, height: 70, direction: 'down' },
          { x: 1400, y: this.groundLevel - 180, width: 160, height: 100, direction: 'down' },
        ]
      },
      
      // Level 6: Boss Arena - Epic large-scale arena with multiple tiers
      {
        platforms: [
          // Ground tier (solid platforms for cover and movement)
          { x: 200, y: this.groundLevel - 130, width: 300, height: 30, type: 'solid' },
          { x: 1500, y: this.groundLevel - 130, width: 300, height: 30, type: 'solid' },
          // Mid-level strategic positions (solid)
          { x: 350, y: this.groundLevel - 210, width: 280, height: 30, type: 'solid' },
          { x: 800, y: this.groundLevel - 250, width: 400, height: 30, type: 'solid' },
          { x: 1370, y: this.groundLevel - 210, width: 280, height: 30, type: 'solid' },
          // Upper tactical platforms (passthrough for flexibility)
          { x: 500, y: this.groundLevel - 320, width: 280, height: 25, type: 'passthrough' },
          { x: 1220, y: this.groundLevel - 320, width: 280, height: 25, type: 'passthrough' },
          // Central high ground (for dramatic boss battles)
          { x: 780, y: this.groundLevel - 380, width: 440, height: 25, type: 'passthrough' },
          // Side observation points
          { x: 100, y: this.groundLevel - 180, width: 120, height: 20, type: 'passthrough' },
          { x: 1780, y: this.groundLevel - 180, width: 120, height: 20, type: 'passthrough' },
        ],
        slopes: [
          // Entry slopes to ground platforms
          { x: 80, y: this.groundLevel - 130, width: 120, height: 130, direction: 'up' },
          { x: 1800, y: this.groundLevel - 130, width: 120, height: 130, direction: 'down' },
          // Connecting slopes between tiers
          { x: 500, y: this.groundLevel - 130, width: 150, height: 80, direction: 'up' },
          { x: 1350, y: this.groundLevel - 130, width: 150, height: 80, direction: 'up' },
          { x: 630, y: this.groundLevel - 210, width: 170, height: 110, direction: 'up' },
        ]
      },
      
      // Level 7: Urban Warfare - Ruined city with integrated debris and buildings
      {
        platforms: [
          // Destroyed building floors (staggered for ruins feel)
          { x: 250, y: this.groundLevel - 120, width: 180, height: 20, type: 'passthrough' },
          { x: 520, y: this.groundLevel - 160, width: 200, height: 25, type: 'solid' },
          { x: 820, y: this.groundLevel - 140, width: 180, height: 20, type: 'passthrough' },
          { x: 1080, y: this.groundLevel - 180, width: 220, height: 25, type: 'solid' },
          { x: 1400, y: this.groundLevel - 130, width: 200, height: 20, type: 'passthrough' },
          // Upper floors of damaged buildings
          { x: 300, y: this.groundLevel - 220, width: 240, height: 20, type: 'passthrough' },
          { x: 650, y: this.groundLevel - 260, width: 260, height: 20, type: 'passthrough' },
          { x: 1000, y: this.groundLevel - 280, width: 280, height: 20, type: 'passthrough' },
          { x: 1390, y: this.groundLevel - 240, width: 240, height: 20, type: 'passthrough' },
          // Rooftop access
          { x: 700, y: this.groundLevel - 360, width: 320, height: 20, type: 'passthrough' },
        ],
        slopes: [
          // Rubble slopes (natural debris feel)
          { x: 150, y: this.groundLevel - 80, width: 100, height: 80, direction: 'up' },
          { x: 430, y: this.groundLevel - 120, width: 90, height: 40, direction: 'up' },
          { x: 720, y: this.groundLevel - 160, width: 100, height: 20, direction: 'down' },
          { x: 1000, y: this.groundLevel - 140, width: 80, height: 40, direction: 'up' },
          { x: 1300, y: this.groundLevel - 180, width: 100, height: 50, direction: 'down' },
          { x: 540, y: this.groundLevel - 220, width: 110, height: 60, direction: 'up' },
          { x: 910, y: this.groundLevel - 260, width: 90, height: 40, direction: 'up' },
        ]
      },
      
      // Level 8: Industrial Complex - Layered factory with machinery feel
      {
        platforms: [
          // Ground level machinery platforms (solid, like machines)
          { x: 200, y: this.groundLevel - 130, width: 240, height: 25, type: 'solid' },
          { x: 550, y: this.groundLevel - 140, width: 220, height: 25, type: 'solid' },
          { x: 880, y: this.groundLevel - 130, width: 240, height: 25, type: 'solid' },
          { x: 1230, y: this.groundLevel - 140, width: 220, height: 25, type: 'solid' },
          { x: 1560, y: this.groundLevel - 130, width: 240, height: 25, type: 'solid' },
          // Mid-level catwalks
          { x: 280, y: this.groundLevel - 220, width: 280, height: 20, type: 'passthrough' },
          { x: 650, y: this.groundLevel - 250, width: 260, height: 20, type: 'passthrough' },
          { x: 1000, y: this.groundLevel - 240, width: 280, height: 20, type: 'passthrough' },
          { x: 1370, y: this.groundLevel - 220, width: 280, height: 20, type: 'passthrough' },
          // Upper maintenance walkways
          { x: 350, y: this.groundLevel - 330, width: 320, height: 20, type: 'passthrough' },
          { x: 800, y: this.groundLevel - 360, width: 380, height: 20, type: 'passthrough' },
          { x: 1280, y: this.groundLevel - 330, width: 320, height: 20, type: 'passthrough' },
          // Control room level (highest)
          { x: 750, y: this.groundLevel - 440, width: 500, height: 20, type: 'passthrough' },
        ],
        slopes: [
          // Conveyor belt style slopes
          { x: 140, y: this.groundLevel - 90, width: 60, height: 90, direction: 'up' },
          { x: 440, y: this.groundLevel - 130, width: 110, height: 90, direction: 'up' },
          { x: 770, y: this.groundLevel - 140, width: 110, height: 80, direction: 'down' },
          { x: 1120, y: this.groundLevel - 130, width: 110, height: 110, direction: 'up' },
          { x: 1450, y: this.groundLevel - 140, width: 110, height: 80, direction: 'down' },
          // Access to catwalks
          { x: 560, y: this.groundLevel - 220, width: 90, height: 110, direction: 'up' },
          { x: 910, y: this.groundLevel - 250, width: 90, height: 110, direction: 'down' },
          { x: 1280, y: this.groundLevel - 240, width: 90, height: 90, direction: 'down' },
        ]
      },
      
      // Level 9: Elite Commander Boss - Intimidating arena with tactical depth
      {
        platforms: [
          // Ground tier - wide platforms for mobility
          { x: 230, y: this.groundLevel - 150, width: 320, height: 30, type: 'solid' },
          { x: 1450, y: this.groundLevel - 150, width: 320, height: 30, type: 'solid' },
          // Mid-tier defensive positions
          { x: 400, y: this.groundLevel - 230, width: 300, height: 30, type: 'solid' },
          { x: 850, y: this.groundLevel - 270, width: 400, height: 30, type: 'solid' },
          { x: 1300, y: this.groundLevel - 230, width: 300, height: 30, type: 'solid' },
          // Upper tactical advantages
          { x: 520, y: this.groundLevel - 340, width: 300, height: 25, type: 'passthrough' },
          { x: 1180, y: this.groundLevel - 340, width: 300, height: 25, type: 'passthrough' },
          // Central commanding position
          { x: 820, y: this.groundLevel - 420, width: 460, height: 25, type: 'passthrough' },
          // Side flanking positions
          { x: 120, y: this.groundLevel - 200, width: 130, height: 20, type: 'passthrough' },
          { x: 1750, y: this.groundLevel - 200, width: 130, height: 20, type: 'passthrough' },
        ],
        slopes: [
          // Major access slopes
          { x: 80, y: this.groundLevel - 150, width: 150, height: 150, direction: 'up' },
          { x: 1770, y: this.groundLevel - 150, width: 150, height: 150, direction: 'down' },
          // Mid-tier connections
          { x: 550, y: this.groundLevel - 150, width: 150, height: 80, direction: 'up' },
          { x: 1300, y: this.groundLevel - 150, width: 150, height: 80, direction: 'up' },
          { x: 700, y: this.groundLevel - 230, width: 150, height: 110, direction: 'up' },
          { x: 1150, y: this.groundLevel - 270, width: 150, height: 70, direction: 'down' },
        ]
      },
      
      // Level 10: Final Stand - Epic finale with maximum terrain complexity
      {
        platforms: [
          // Ground level - multiple short platforms (chaotic battlefield feel)
          { x: 200, y: this.groundLevel - 120, width: 200, height: 20, type: 'passthrough' },
          { x: 480, y: this.groundLevel - 140, width: 180, height: 20, type: 'passthrough' },
          { x: 740, y: this.groundLevel - 130, width: 200, height: 20, type: 'passthrough' },
          { x: 1020, y: this.groundLevel - 150, width: 180, height: 20, type: 'passthrough' },
          { x: 1280, y: this.groundLevel - 130, width: 200, height: 20, type: 'passthrough' },
          { x: 1560, y: this.groundLevel - 140, width: 180, height: 20, type: 'passthrough' },
          // Mid-level fortifications (solid for defensive play)
          { x: 320, y: this.groundLevel - 220, width: 260, height: 25, type: 'solid' },
          { x: 700, y: this.groundLevel - 260, width: 300, height: 25, type: 'solid' },
          { x: 1120, y: this.groundLevel - 240, width: 280, height: 25, type: 'solid' },
          { x: 1520, y: this.groundLevel - 220, width: 260, height: 25, type: 'solid' },
          // Upper battlefield layer
          { x: 400, y: this.groundLevel - 330, width: 300, height: 20, type: 'passthrough' },
          { x: 820, y: this.groundLevel - 360, width: 360, height: 20, type: 'passthrough' },
          { x: 1300, y: this.groundLevel - 330, width: 300, height: 20, type: 'passthrough' },
          // Elite vantage points (highest tier)
          { x: 500, y: this.groundLevel - 440, width: 280, height: 20, type: 'passthrough' },
          { x: 1220, y: this.groundLevel - 440, width: 280, height: 20, type: 'passthrough' },
          // Ultimate high ground (final stand position)
          { x: 780, y: this.groundLevel - 520, width: 440, height: 20, type: 'passthrough' },
        ],
        slopes: [
          // Entry slopes (both sides)
          { x: 100, y: this.groundLevel - 90, width: 100, height: 90, direction: 'up' },
          { x: 1800, y: this.groundLevel - 90, width: 100, height: 90, direction: 'down' },
          // Connecting slopes to mid-level
          { x: 400, y: this.groundLevel - 140, width: 80, height: 80, direction: 'up' },
          { x: 660, y: this.groundLevel - 150, width: 80, height: 110, direction: 'up' },
          { x: 940, y: this.groundLevel - 130, width: 80, height: 130, direction: 'up' },
          { x: 1200, y: this.groundLevel - 150, width: 80, height: 90, direction: 'up' },
          { x: 1480, y: this.groundLevel - 140, width: 80, height: 80, direction: 'up' },
          // Upper tier access slopes
          { x: 580, y: this.groundLevel - 220, width: 120, height: 110, direction: 'up' },
          { x: 1000, y: this.groundLevel - 260, width: 120, height: 100, direction: 'down' },
          { x: 1400, y: this.groundLevel - 240, width: 120, height: 90, direction: 'up' },
          // Elite tier slopes
          { x: 700, y: this.groundLevel - 330, width: 120, height: 110, direction: 'up' },
          { x: 1180, y: this.groundLevel - 360, width: 120, height: 80, direction: 'down' },
        ]
      }
    ];
    
    const levelIndex = Math.min(this.currentLevel - 1, terrainConfigs.length - 1);
    return terrainConfigs[levelIndex];
  }

  handleInput() {
    // Global fullscreen toggle (works in any state)
    // Changed from 'F' to Backquote (`) to avoid conflict with melee attack
    if (this.inputManager.wasKeyPressed('`') || this.inputManager.wasKeyPressed('Backquote') || 
        this.inputManager.wasKeyPressed('F11')) {
      this.toggleFullscreen();
      // Don't return - let other handlers process too
    }
    
    // Handle cutscene state first - disable all other input during cutscene
    if (this.state === 'cutscene') {
      // Only allow skip input during cutscene
      const deltaTime = this.currentTime - this.lastTime || 16;
      this.cutsceneManager.handleSkipInput(this.inputManager, deltaTime);
      return; // Block all other input during cutscene
    }
    
    if (this.state === 'character_select' || this.menuState === 'character') {
      if (this.inputManager.wasKeyPressed('1')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.startGame(this.mode, 'soldier');
      } else if (this.inputManager.wasKeyPressed('2')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.startGame(this.mode, 'scout');
      } else if (this.inputManager.wasKeyPressed('3')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.startGame(this.mode, 'heavy');
      } else if (this.inputManager.wasKeyPressed('4')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.startGame(this.mode, 'medic');
      } else if (this.inputManager.wasKeyPressed('Escape')) {
        this.audioManager.playSound('menu_navigate', 0.3);
        this.menuState = 'main';
        this.audioManager.playMusic('menu');
      }
    } else if (this.menuState === 'settings') {
      // Page navigation
      if (this.inputManager.wasKeyPressed('ArrowLeft')) {
        this.audioManager.playSound('menu_navigate', 0.3);
        this.settingsPage = Math.max(0, this.settingsPage - 1);
      } else if (this.inputManager.wasKeyPressed('ArrowRight')) {
        this.audioManager.playSound('menu_navigate', 0.3);
        this.settingsPage = Math.min(3, this.settingsPage + 1);
      }
      
      // Page 0: Difficulty & Audio
      if (this.settingsPage === 0) {
        if (this.inputManager.wasKeyPressed('1')) {
          this.difficulty = 'baby';
        } else if (this.inputManager.wasKeyPressed('2')) {
          this.difficulty = 'easy';
        } else if (this.inputManager.wasKeyPressed('3')) {
          this.difficulty = 'medium';
        } else if (this.inputManager.wasKeyPressed('4')) {
          this.difficulty = 'extreme';
        } else if (this.inputManager.wasKeyPressed('5')) {
          this.audioEnabled = !this.audioEnabled;
          this.audioManager.setEnabled(this.audioEnabled);
          this.audioManager.playSound('menu_navigate', 0.3);
        } else if (this.inputManager.wasKeyPressed('6')) {
          this.masterVolume = Math.max(0, this.masterVolume - 0.1);
          this.audioManager.setMasterVolume(this.masterVolume);
          this.audioManager.playSound('menu_navigate', 0.3);
        } else if (this.inputManager.wasKeyPressed('7')) {
          this.masterVolume = Math.min(1, this.masterVolume + 0.1);
          this.audioManager.setMasterVolume(this.masterVolume);
          this.audioManager.playSound('menu_navigate', 0.3);
        } else if (this.inputManager.wasKeyPressed('8')) {
          this.sfxVolume = Math.max(0, this.sfxVolume - 0.1);
          this.audioManager.setSFXVolume(this.sfxVolume);
          this.audioManager.playSound('menu_navigate', 0.3);
        } else if (this.inputManager.wasKeyPressed('9')) {
          this.sfxVolume = Math.min(1, this.sfxVolume + 0.1);
          this.audioManager.setSFXVolume(this.sfxVolume);
          this.audioManager.playSound('menu_navigate', 0.3);
        } else if (this.inputManager.wasKeyPressed('0')) {
          this.musicVolume = Math.max(0, this.musicVolume - 0.1);
          this.audioManager.setMusicVolume(this.musicVolume);
        } else if (this.inputManager.wasKeyPressed('-')) {
          this.musicVolume = Math.min(1, this.musicVolume + 0.1);
          this.audioManager.setMusicVolume(this.musicVolume);
        }
      }
      // Page 1: Graphics & Display
      else if (this.settingsPage === 1) {
        if (this.inputManager.wasKeyPressed('1')) {
          this.screenShake = !this.screenShake;
        } else if (this.inputManager.wasKeyPressed('2')) {
          const qualities = ['low', 'medium', 'high'];
          const idx = qualities.indexOf(this.particleQuality);
          this.particleQuality = qualities[(idx + 1) % qualities.length];
        } else if (this.inputManager.wasKeyPressed('3')) {
          this.showFPS = !this.showFPS;
        } else if (this.inputManager.wasKeyPressed('4')) {
          this.cameraSmoothness = Math.max(0.05, this.cameraSmoothness - 0.05);
        } else if (this.inputManager.wasKeyPressed('5')) {
          this.cameraSmoothness = Math.min(0.3, this.cameraSmoothness + 0.05);
        } else if (this.inputManager.wasKeyPressed('6')) {
          const styles = ['cross', 'dot', 'circle', 'none'];
          const idx = styles.indexOf(this.crosshairStyle);
          this.crosshairStyle = styles[(idx + 1) % styles.length];
        } else if (this.inputManager.wasKeyPressed('7')) {
          this.hudOpacity = Math.max(0.3, this.hudOpacity - 0.1);
        } else if (this.inputManager.wasKeyPressed('8')) {
          this.hudOpacity = Math.min(1, this.hudOpacity + 0.1);
        }
      }
      // Page 2: Gameplay & Accessibility
      else if (this.settingsPage === 2) {
        if (this.inputManager.wasKeyPressed('1')) {
          this.autoReload = !this.autoReload;
        } else if (this.inputManager.wasKeyPressed('2')) {
          this.mouseAiming = !this.mouseAiming;
          this.audioManager.playSound('menu_navigate', 0.3);
        } else if (this.inputManager.wasKeyPressed('3')) {
          const modes = ['none', 'protanopia', 'deuteranopia', 'tritanopia'];
          const idx = modes.indexOf(this.colorBlindMode);
          this.colorBlindMode = modes[(idx + 1) % modes.length];
        } else if (this.inputManager.wasKeyPressed('4')) {
          this.bloodEffects = !this.bloodEffects;
        } else if (this.inputManager.wasKeyPressed('5')) {
          this.screenFlash = !this.screenFlash;
        } else if (this.inputManager.wasKeyPressed('6')) {
          this.enemyAggression = Math.max(0.5, this.enemyAggression - 0.1);
        } else if (this.inputManager.wasKeyPressed('7')) {
          this.enemyAggression = Math.min(2.0, this.enemyAggression + 0.1);
        } else if (this.inputManager.wasKeyPressed('8')) {
          this.bulletSpeed = Math.max(0.5, this.bulletSpeed - 0.1);
        } else if (this.inputManager.wasKeyPressed('9')) {
          this.bulletSpeed = Math.min(2.0, this.bulletSpeed + 0.1);
        } else if (this.inputManager.wasKeyPressed('0')) {
          this.explosionSize = Math.max(0.5, this.explosionSize - 0.1);
        } else if (this.inputManager.wasKeyPressed('-')) {
          this.explosionSize = Math.min(2.0, this.explosionSize + 0.1);
        }
      }
      // Page 3: Dev Tools (Password Protected)
      else if (this.settingsPage === 3) {
        // Handle password input
        const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        
        // Check for any character key press
        for (const char of allowedChars) {
          if (this.inputManager.wasKeyPressed(char)) {
            if (this.devToolPasswordInput.length < 20) {
              this.devToolPasswordInput += char.toUpperCase();
              this.audioManager.playSound('menu_navigate', 0.2);
            }
            break;
          }
        }
        
        // Backspace to delete last character
        if (this.inputManager.wasKeyPressed('Backspace')) {
          if (this.devToolPasswordInput.length > 0) {
            this.devToolPasswordInput = this.devToolPasswordInput.slice(0, -1);
            this.audioManager.playSound('menu_navigate', 0.2);
          }
        }
        
        // Enter to submit password
        if (this.inputManager.wasKeyPressed('Enter')) {
          if (this.devToolPasswordInput === this.devToolPassword) {
            this.devToolUnlocked = true;
            this.audioManager.playSound('pickup_powerup', 0.7);
            this.devToolPasswordInput = '';
          } else if (this.devToolPasswordInput.length > 0) {
            // Wrong password
            this.audioManager.playSound('player_hit', 0.5);
            this.devToolPasswordInput = '';
          }
        }
      }
      
      if (this.inputManager.wasKeyPressed('Escape')) {
        this.audioManager.playSound('menu_navigate', 0.3);
        // Return to pause menu if paused, otherwise main menu
        if (this.state === 'paused') {
          this.menuState = 'paused';
        } else {
          this.menuState = 'main';
        }
      }
    } else if (this.menuState === 'controls') {
      if (this.inputManager.wasKeyPressed('Escape')) {
        this.audioManager.playSound('menu_navigate', 0.3);
        // Return to pause menu if paused, otherwise main menu
        if (this.state === 'paused') {
          this.menuState = 'paused';
        } else {
          this.menuState = 'main';
        }
      }
    } else if (this.menuState === 'highscores') {
      if (this.inputManager.wasKeyPressed('Escape')) {
        this.audioManager.playSound('menu_navigate', 0.3);
        // Return to pause menu if paused, otherwise main menu
        if (this.state === 'paused') {
          this.menuState = 'paused';
        } else {
          this.menuState = 'main';
        }
      }
    } else if (this.menuState === 'challenge') {
      if (this.inputManager.wasKeyPressed('Escape')) {
        this.audioManager.playSound('menu_navigate', 0.3);
        this.menuState = 'main';
      } else if (this.inputManager.wasKeyPressed('1')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.menuState = 'character';
        this.mode = 'timeattack';
      } else if (this.inputManager.wasKeyPressed('2')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.menuState = 'character';
        this.mode = 'bossrush';
      } else if (this.inputManager.wasKeyPressed('3')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.menuState = 'character';
        this.mode = 'horde';
      } else if (this.inputManager.wasKeyPressed('4')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.menuState = 'character';
        this.mode = 'onehit';
      } else if (this.inputManager.wasKeyPressed('5')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.menuState = 'character';
        this.mode = 'basedefense';
      }
    } else if (this.menuState === 'statistics') {
      // Page navigation for statistics
      if (this.inputManager.wasKeyPressed('ArrowLeft')) {
        this.audioManager.playSound('menu_navigate', 0.3);
        this.statisticsPage = Math.max(0, (this.statisticsPage || 0) - 1);
      } else if (this.inputManager.wasKeyPressed('ArrowRight')) {
        this.audioManager.playSound('menu_navigate', 0.3);
        this.statisticsPage = Math.min(3, (this.statisticsPage || 0) + 1);
      } else if (this.inputManager.wasKeyPressed('Escape')) {
        this.audioManager.playSound('menu_navigate', 0.3);
        this.menuState = 'main';
      }
    } else if (this.menuState === 'skins') {
      // Handle skins menu
      if (this.inputManager.wasKeyPressed('Escape')) {
        this.audioManager.playSound('menu_back', 0.5);
        this.menuState = 'main';
      }
    } else if (this.state === 'menu') {
      if (this.inputManager.wasKeyPressed('1')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.menuState = 'character';
        this.mode = 'campaign';
      } else if (this.inputManager.wasKeyPressed('2')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.menuState = 'character';
        this.mode = 'survival';
      } else if (this.inputManager.wasKeyPressed('3')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.menuState = 'challenge';
      } else if (this.inputManager.wasKeyPressed('4')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.menuState = 'settings';
      } else if (this.inputManager.wasKeyPressed('5')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.menuState = 'controls';
      } else if (this.inputManager.wasKeyPressed('6')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.menuState = 'statistics';
        this.statisticsPage = 0;
      } else if (this.inputManager.wasKeyPressed('7')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.menuState = 'highscores';
      } else if (this.inputManager.wasKeyPressed('8')) {
        this.audioManager.playSound('menu_select', 0.5);
        // Start tutorial
        if (this.tutorialManager) {
          this.tutorialManager.start();
        }
      } else if (this.inputManager.wasKeyPressed('9')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.menuState = 'skins';
      }
    } else if (this.state === 'playing') {
      // Player controls
      if (this.player && this.player.active) {
        // Shooting (ranged weapons - left click)
        if (this.inputManager.isMouseButtonPressed(0)) {
          let targetX, targetY;
          
          if (this.mouseAiming) {
            // Mouse tracking aiming: shoot towards mouse cursor position
            const mousePos = this.inputManager.getMousePosition();
            // Convert screen mouse position to world coordinates
            targetX = mousePos.x + this.camera.x;
            targetY = mousePos.y + this.camera.y;
          } else {
            // Directional aiming: shoot in the direction the player is facing
            const shootDistance = 1000; // Distance to shoot in facing direction
            targetX = this.player.x + this.player.width / 2 + (this.player.facing * shootDistance);
            targetY = this.player.y + this.player.height / 2;
          }
          
          const result = this.player.shoot(targetX, targetY, this.currentTime, false);
          
          if (result) {
            // Play weapon-specific sound
            const weapon = this.player.getCurrentWeapon();
            let soundName = 'shoot';
            
            if (weapon.name === 'Pistol') soundName = 'shoot_pistol';
            else if (weapon.name === 'Rifle') soundName = 'shoot_rifle';
            else if (weapon.name === 'Shotgun') soundName = 'shoot_shotgun';
            else if (weapon.name === 'Machine Gun') soundName = 'shoot_machinegun';
            else if (weapon.name === 'Sniper Rifle') soundName = 'shoot_sniper';
            else if (weapon.name === 'Grenade Launcher') soundName = 'shoot_grenade';
            else if (weapon.name === 'Laser Gun') soundName = 'shoot_laser';
            else if (weapon.isMelee) soundName = 'shoot_melee';
            
            this.audioManager.playSound(soundName, 0.5);
            
            // Track shots fired
            if (Array.isArray(result)) {
              this.shotsFired += result.length;
              result.forEach(p => {
                this.projectiles.push(p);
                this.collisionSystem.add(p);
              });
            } else {
              this.shotsFired++;
              // Track shot in statistics system
              if (this.statisticsSystem) {
                this.statisticsSystem.trackShotFired();
              }
              this.projectiles.push(result);
              this.collisionSystem.add(result);
            }
          }
        }
        
        // Melee Attack (melee weapons - right click or F key)
        if (this.inputManager.isMouseButtonPressed(2) || this.inputManager.isKeyPressed('f') || this.inputManager.isKeyPressed('F')) {
          // Only attack if a melee weapon is equipped
          const meleeWeapon = this.player.getCurrentMeleeWeapon();
          
          if (meleeWeapon) {
            // For melee attacks, try to auto-target nearest enemy in range, otherwise attack in facing direction
            let meleeTargetX, meleeTargetY;
            const weaponRange = meleeWeapon.meleeRange;
            
            // Find nearest enemy within melee range
            let nearestEnemy = null;
            let nearestDist = weaponRange;
            this.enemies.forEach(enemy => {
              if (enemy.active && enemy.health > 0) {
                const dx = (enemy.x + enemy.width / 2) - (this.player.x + this.player.width / 2);
                const dy = (enemy.y + enemy.height / 2) - (this.player.y + this.player.height / 2);
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                // Check if enemy is in front of player and within range
                if (dist < nearestDist && Math.sign(dx) === this.player.facing) {
                  nearestEnemy = enemy;
                  nearestDist = dist;
                }
              }
            });
            
            if (nearestEnemy) {
              // Target the nearest enemy
              meleeTargetX = nearestEnemy.x + nearestEnemy.width / 2;
              meleeTargetY = nearestEnemy.y + nearestEnemy.height / 2;
            } else {
              // No enemy in range, attack in facing direction at weapon's max range
              meleeTargetX = this.player.x + this.player.width / 2 + (this.player.facing * weaponRange * 0.8);
              meleeTargetY = this.player.y + this.player.height / 2;
            }
            
            const result = this.player.shoot(meleeTargetX, meleeTargetY, this.currentTime, true);
            
            if (result) {
              // Create melee slash visual effect - only when melee weapon is equipped
              const slashX = this.player.x + this.player.width / 2 + (this.player.facing * 30);
              const slashY = this.player.y + this.player.height / 2;
              this.particleSystem.createMeleeSlash(slashX, slashY, this.player.facing);
              
              // Play melee sound
              this.audioManager.playSound('melee', 0.6);
              
              // Track shots fired
              if (Array.isArray(result)) {
                this.shotsFired += result.length;
                result.forEach(p => {
                  this.projectiles.push(p);
                  this.collisionSystem.add(p);
                });
              } else {
                this.shotsFired++;
                this.projectiles.push(result);
                this.collisionSystem.add(result);
              }
            }
          }
        }
        
        // Reload
        if (this.inputManager.isKeyPressed('r') || this.inputManager.isKeyPressed('R')) {
          const weapon = this.player.getCurrentWeapon();
          if (!weapon.isReloading && weapon.currentAmmo < weapon.ammoCapacity) {
            this.player.reload(this.currentTime);
            this.audioManager.playSound('reload', 0.4);
          }
        }
        
        // Auto-reload when out of ammo
        if (this.autoReload && this.player.getCurrentWeapon().currentAmmo === 0 && 
            !this.player.getCurrentWeapon().isReloading) {
          this.player.reload(this.currentTime);
          this.audioManager.playSound('reload', 0.4);
        }
        
        // Ground jump: allow holding the key (isKeyPressed)
        if (this.player.onGround && (
              this.inputManager.isKeyPressed('ArrowUp') ||
              this.inputManager.isKeyPressed('w') ||
              this.inputManager.isKeyPressed(' ')
            )) {
          this.player.dy = this.player.jumpStrength;
          this.player.onGround = false;
        }
        // Double jump: only on fresh key press (wasKeyPressed)
        else if (!this.player.onGround &&
                 this.player.hasDoubleJump &&
                 this.player.doubleJumpAvailable &&
                 (this.inputManager.wasKeyPressed('ArrowUp') ||
                  this.inputManager.wasKeyPressed('w') ||
                  this.inputManager.wasKeyPressed(' '))) {
          // Perform double jump
          this.player.performDoubleJump();
          this.audioManager.playSound('menu_select', 0.4);
          // Create visual effect
          this.particleSystem.createDoubleJumpEffect(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height
          );
        }
        
        // Grappling Hook (T key when power-up is active, uses different key to avoid conflict with God Mode)
        if (this.inputManager.wasKeyPressed('t') && this.player.hasGrapplingHook && this.player.grapplingHookUses > 0) {
          // Grapple towards mouse position or in facing direction
          let targetX, targetY;
          if (this.mouseAiming) {
            const mousePos = this.inputManager.getMousePosition();
            targetX = mousePos.x + this.camera.x;
            targetY = mousePos.y + this.camera.y;
          } else {
            targetX = this.player.x + this.player.facing * this.player.grapplingHookRange;
            targetY = this.player.y - 100; // Aim slightly upward
          }
          
          if (this.player.useGrapplingHook(targetX, targetY)) {
            this.audioManager.playSound('dash', 0.5); // Use dash sound for grapple
          }
        }
        
        // Block/Parry (Hold V key - only with melee weapon)
        if (this.inputManager.isKeyPressed('v') || this.inputManager.isKeyPressed('V')) {
          this.player.startBlocking(this.currentTime);
        } else {
          this.player.stopBlocking();
        }
        
        // Slide/Roll (changed from Shift to C key for better accessibility)
        if (this.inputManager.isKeyPressed('c') || this.inputManager.isKeyPressed('C') || this.inputManager.isKeyPressed('Control')) {
          this.player.roll(this.currentTime);
        }
        
        // Crouch/Stealth (S key when not moving or Ctrl key)
        if ((this.inputManager.isKeyPressed('s') || this.inputManager.isKeyPressed('S')) &&
            !this.inputManager.isKeyPressed('a') && !this.inputManager.isKeyPressed('d') &&
            !this.inputManager.isKeyPressed('ArrowLeft') && !this.inputManager.isKeyPressed('ArrowRight')) {
          this.player.crouch();
        } else {
          this.player.stand();
        }
        
        // Flashlight toggle (L key) - for night phases
        if (this.inputManager.wasKeyPressed('l') || this.inputManager.wasKeyPressed('L')) {
          this.toggleFlashlight();
        }
        
        // Special Ability (E key or Q key)
        if (this.inputManager.wasKeyPressed('e') || this.inputManager.wasKeyPressed('E') ||
            this.inputManager.wasKeyPressed('q') || this.inputManager.wasKeyPressed('Q')) {
          const result = this.player.useSpecialAbility(this.currentTime, this);
          if (result) {
            // Play ability-specific sound
            let abilitySound = 'ability';
            if (result === 'airstrike') {
              abilitySound = 'ability_airstrike';
              this.camera.shake(10, 500);
            } else if (result === 'sprint') {
              abilitySound = 'ability_sprint';
            } else if (result === 'shield') {
              abilitySound = 'ability_shield';
            } else if (result === 'medpack') {
              abilitySound = 'ability_medpack';
            }
            this.audioManager.playSound(abilitySound, 0.8);
          }
        }
        
        // Weapon switching
        const oldWeaponIndex = this.player.currentRangedWeaponIndex;
        if (this.inputManager.isKeyPressed('1')) {
          this.player.switchWeapon(0);
        } else if (this.inputManager.isKeyPressed('2')) {
          this.player.switchWeapon(1);
        } else if (this.inputManager.isKeyPressed('3')) {
          this.player.switchWeapon(2);
        } else if (this.inputManager.isKeyPressed('4')) {
          this.player.switchWeapon(3);
        }
        
        // Play weapon switch sound if weapon changed
        if (oldWeaponIndex !== this.player.currentRangedWeaponIndex) {
          this.audioManager.playSound('weapon_switch', 0.3);
        }
        
        // Phase 3: Vehicle enter/exit (Y key)
        if (this.inputManager.wasKeyPressed('y') || this.inputManager.wasKeyPressed('Y')) {
          // Check if player is in a vehicle
          if (this.player.isInVehicle && this.player.currentVehicle) {
            // Exit vehicle
            this.player.currentVehicle.exit(this.player);
            this.audioManager.playSound('menu_select', 0.4);
          } else {
            // Check for nearby vehicle to enter
            for (const vehicle of this.vehicles) {
              if (vehicle.active && !vehicle.isDestroyed && vehicle.canEnter()) {
                if (vehicle.isInRange(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, 60)) {
                  vehicle.enter(this.player);
                  this.audioManager.playSound('menu_select', 0.4);
                  this.particleSystem.createTextPopup(
                    this.player.x + this.player.width / 2,
                    this.player.y - 30,
                    'ENTERED VEHICLE',
                    '#00ff00'
                  );
                  break;
                }
              }
            }
          }
        }
        
        // Phase 3: Mounted weapon mount/dismount (X key - changed to avoid conflict with block)
        if (this.inputManager.wasKeyPressed('x') || this.inputManager.wasKeyPressed('X')) {
          // Check if player is mounted
          if (this.player.isMounted && this.player.currentMountedWeapon) {
            // Dismount
            this.player.currentMountedWeapon.dismount(this.player);
            this.audioManager.playSound('menu_select', 0.4);
          } else if (!this.player.isInVehicle) {
            // Check for nearby mounted weapon
            for (const mw of this.mountedWeapons) {
              if (mw.active && mw.canMount()) {
                if (mw.isInRange(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, 60)) {
                  mw.mount(this.player);
                  this.audioManager.playSound('menu_select', 0.4);
                  this.particleSystem.createTextPopup(
                    this.player.x + this.player.width / 2,
                    this.player.y - 30,
                    'MOUNTED ' + mw.weaponType,
                    '#00ff00'
                  );
                  break;
                }
              }
            }
          }
        }
        
        // Phase 3: Vehicle/Mounted weapon firing
        if (this.player.isInVehicle && this.player.currentVehicle) {
          if (this.inputManager.isMouseButtonPressed(0)) {
            const mousePos = this.inputManager.getMousePosition();
            const targetX = mousePos.x + this.camera.x;
            const targetY = mousePos.y + this.camera.y;
            const projectile = this.player.currentVehicle.fire(this.currentTime, targetX, targetY);
            if (projectile) {
              this.projectiles.push(projectile);
              this.collisionSystem.add(projectile);
            }
          }
        } else if (this.player.isMounted && this.player.currentMountedWeapon) {
          // Aim mounted weapon
          const mousePos = this.inputManager.getMousePosition();
          const targetX = mousePos.x + this.camera.x;
          const targetY = mousePos.y + this.camera.y;
          this.player.currentMountedWeapon.aim(targetX, targetY);
          
          if (this.inputManager.isMouseButtonPressed(0)) {
            const projectile = this.player.currentMountedWeapon.fire(this.currentTime);
            if (projectile) {
              projectile.owner = this.player.currentMountedWeapon;
              this.projectiles.push(projectile);
              this.collisionSystem.add(projectile);
            }
          }
        }
      }
      
      // Toggle help overlay (H key)
      if (this.inputManager.wasKeyPressed('h') || this.inputManager.wasKeyPressed('H')) {
        this.showHelp = !this.showHelp;
      }
      
      // Dev Tool: Instant Kill All Enemies (K key)
      if (this.devToolUnlocked && (this.inputManager.wasKeyPressed('k') || this.inputManager.wasKeyPressed('K'))) {
        this.devToolInstantKillAll();
      }
      
      // Dev Tool: Toggle Invincibility (G key for God mode)
      if (this.devToolUnlocked && (this.inputManager.wasKeyPressed('g') || this.inputManager.wasKeyPressed('G'))) {
        this.devToolToggleInvincibility();
      }
      
      // Toggle inventory (I key)
      if (this.inputManager.wasKeyPressed('i') || this.inputManager.wasKeyPressed('I')) {
        this.showInventory = !this.showInventory;
        if (this.showInventory) {
          this.inventoryPage = 0; // Reset to first page when opening
        }
      }
      
      // Phase 2: Handle Phase 2 menus when open (check BEFORE toggle logic)
      if (this.upgradeMenu.visible) {
        this.upgradeMenu.handleInput(this.inputManager);
      } else if (this.shopMenu.visible) {
        this.shopMenu.handleInput(this.inputManager);
      } else if (this.attachmentMenu.visible) {
        this.attachmentMenu.handleInput(this.inputManager);
      } else {
        // Phase 2: Toggle upgrade menu (U key) - only when no menu is open
        if (this.inputManager.wasKeyPressed('u') || this.inputManager.wasKeyPressed('U')) {
          this.upgradeMenu.show();
        }
      }
      
      // Phase 2: Interact with shop vendor (E key)
      if (this.inputManager.wasKeyPressed('e') || this.inputManager.wasKeyPressed('E')) {
        if (this.shopVendor && this.shopVendor.canInteract(this.player)) {
          if (!this.shopMenu.visible) {
            this.shopMenu.open(this.shopVendor, this.player);
          }
        }
      }
      
      // Handle inventory when open
      if (this.showInventory) {
        // Switch inventory pages with ] or Page Down (changed from Tab to avoid browser issues)
        if (this.inputManager.wasKeyPressed(']') || this.inputManager.wasKeyPressed('PageDown')) {
          this.inventoryPage = (this.inventoryPage + 1) % 2;
          this.audioManager.playSound('menu_navigate', 0.3);
        }
        
        // Select weapon based on inventory page
        if (this.inventoryPage === 0) {
          // Ranged weapons page
          if (this.inputManager.wasKeyPressed('1')) {
            this.player.switchWeapon(0);
          } else if (this.inputManager.wasKeyPressed('2')) {
            this.player.switchWeapon(1);
          } else if (this.inputManager.wasKeyPressed('3')) {
            this.player.switchWeapon(2);
          } else if (this.inputManager.wasKeyPressed('4')) {
            this.player.switchWeapon(3);
          }
        } else if (this.inventoryPage === 1) {
          // Melee weapons page
          if (this.inputManager.wasKeyPressed('1')) {
            this.player.switchMeleeWeapon(0);
          } else if (this.inputManager.wasKeyPressed('2')) {
            this.player.switchMeleeWeapon(1);
          } else if (this.inputManager.wasKeyPressed('3')) {
            this.player.switchMeleeWeapon(2);
          } else if (this.inputManager.wasKeyPressed('4')) {
            this.player.switchMeleeWeapon(3);
          }
        }
      }
      
      // Pause
      if (this.inputManager.wasKeyPressed('Escape')) {
        if (this.showInventory) {
          this.showInventory = false; // Close inventory first
        } else {
          this.state = 'paused';
          this.menuState = 'paused';
        }
      }
    } else if (this.state === 'weaponswap') {
      // Weapon swap popup handling
      if (this.inputManager.wasKeyPressed('y') || this.inputManager.wasKeyPressed('Y') || this.inputManager.wasKeyPressed('1')) {
        // YES - Choose which weapon to swap
        this.state = 'weaponswapselect';
      } else if (this.inputManager.wasKeyPressed('n') || this.inputManager.wasKeyPressed('N') || this.inputManager.wasKeyPressed('2') || this.inputManager.wasKeyPressed('Escape')) {
        // NO - Delete the weapon pickup
        if (this.weaponSwapPopup && this.weaponSwapPopup.pickup) {
          this.weaponSwapPopup.pickup.destroy();
        }
        this.weaponSwapPopup = null;
        this.state = 'playing';
      }
    } else if (this.state === 'weaponswapselect') {
      // Choose which weapon slot to replace
      if (this.inputManager.wasKeyPressed('1')) {
        this.swapWeapon(0);
      } else if (this.inputManager.wasKeyPressed('2')) {
        this.swapWeapon(1);
      } else if (this.inputManager.wasKeyPressed('3')) {
        this.swapWeapon(2);
      } else if (this.inputManager.wasKeyPressed('4')) {
        this.swapWeapon(3);
      } else if (this.inputManager.wasKeyPressed('Escape')) {
        // Cancel swap
        this.weaponSwapPopup = null;
        this.state = 'playing';
      }
    } else if (this.state === 'paused') {
      if (this.inputManager.wasKeyPressed('Escape')) {
        this.audioManager.playSound('menu_navigate', 0.3);
        this.state = 'playing';
      } else if (this.inputManager.wasKeyPressed('s') || this.inputManager.wasKeyPressed('S')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.menuState = 'settings';
        this.settingsPage = 0; // Reset to first settings page
      } else if (this.inputManager.wasKeyPressed('m') || this.inputManager.wasKeyPressed('M')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.state = 'menu';
        this.menuState = 'main';
        this.audioManager.stopMusic();
        this.audioManager.playMusic('menu');
      } else if (this.inputManager.wasKeyPressed('r') || this.inputManager.wasKeyPressed('R')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.startGame(this.mode, this.selectedCharacter);
      }
    } else if (this.state === 'gameover' || this.state === 'victory') {
      if (this.inputManager.wasKeyPressed('r') || this.inputManager.wasKeyPressed('R')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.startGame(this.mode, this.selectedCharacter);
      } else if (this.inputManager.wasKeyPressed('m') || this.inputManager.wasKeyPressed('M')) {
        this.audioManager.playSound('menu_select', 0.5);
        this.state = 'menu';
        this.menuState = 'main';
        this.audioManager.stopMusic();
        this.audioManager.playMusic('menu');
      }
    }
  }

  update(deltaTime) {
    // Handle cutscene state
    if (this.state === 'cutscene') {
      this.cutsceneManager.update(deltaTime);
      
      // Safety check: if cutscene manager is idle but game state is still 'cutscene',
      // it means a callback didn't properly transition the state - fix it
      if (!this.cutsceneManager.isActive() && this.state === 'cutscene') {
        console.warn('Cutscene ended but state was not properly transitioned, resetting to playing');
        this.state = 'playing';
      }
      return;
    }
    
    // Handle level transition animation state
    if (this.state === 'leveltransition') {
      this.updateLevelTransition(deltaTime);
      // Still update camera to follow player during transition
      if (this.player && this.player.active) {
        this.camera.update();
      }
      return;
    }
    
    if (this.state !== 'playing') return;
    
    // Update player
    if (this.player && this.player.active) {
      this.player.update(deltaTime, this.inputManager, this.groundLevel, this.currentTime, this.worldWidth);
    } else if (this.player && !this.player.active) {
      // Player died - save high score and capture final play time
      const accuracy = this.shotsFired > 0 ? 
        ((this.shotsHit / this.shotsFired) * 100).toFixed(1) : 0;
      
      // Capture final play time
      this.finalPlayTime = this.currentTime - this.gameStartTime;
      
      if (this.highScoreSystem.isHighScore(this.score)) {
        this.highScoreSystem.addScore(this.score, this.selectedCharacter, this.difficulty, this.mode, {
          kills: this.kills,
          wave: this.wave,
          accuracy: accuracy
        });
      }
      
      // Play game over music
      this.audioManager.stopMusic();
      this.audioManager.playMusic('gameover');
      
      // Track death in statistics system
      if (this.statisticsSystem) {
        this.statisticsSystem.trackDeath();
        this.statisticsSystem.endSession();
      }
      
      // Submit score to leaderboard
      if (this.leaderboardSystem) {
        this.leaderboardSystem.submitScore(this.mode, 'byScore', {
          name: this.player.displayName || 'Player',
          score: this.score,
          wave: this.wave,
          level: this.currentLevel,
          character: this.player.characterType,
          difficulty: this.difficulty
        });
      }
      
      this.state = 'gameover';
      this.menuState = 'gameover';
      this.ui.setLastScore(this.score);
      return;
    }
    
    // Calculate time slow multiplier
    let timeSlowMultiplier = 1.0;
    if (this.player && this.player.hasTimeSlow) {
      timeSlowMultiplier = 0.5; // Enemies move at 50% speed during time slow
    }
    
    // Update enemies
    // Phase 5 bosses start at bossId 4 (Sandworm=4, FrostTitan=5, MechCommander=6, HellKnight=7)
    const PHASE_5_BOSS_START_ID = 4;
    
    this.enemies.forEach(enemy => {
      // Phase 5: Handle new boss types with different update signatures
      if (enemy.bossId >= PHASE_5_BOSS_START_ID && enemy.isBoss) {
        // Phase 5 bosses (Sandworm, FrostTitan, MechCommander, HellKnight)
        // They have update(deltaTime, player, enemies, projectiles) signature
        enemy.update(deltaTime, this.player, this.enemies, this.projectiles);
      } else {
        // enemy.update now returns projectiles from AI (especially for bosses)
        const aiProjectiles = enemy.update(deltaTime, this.player, this.groundLevel, this.currentTime, this.worldWidth);
        
        // Enemy shooting - bosses shoot via their AI, non-bosses need explicit attack call
        let result = null;
        if (!enemy.isBoss) {
          // Non-boss enemies still use the old attack pattern
          result = enemy.attack(this.player, this.currentTime);
        } else {
          // Boss projectiles come from their AI update
          result = aiProjectiles;
        }
        
        if (result) {
          if (Array.isArray(result)) {
            result.forEach(p => {
              this.projectiles.push(p);
              this.collisionSystem.add(p);
            });
          } else {
            this.projectiles.push(result);
            this.collisionSystem.add(result);
          }
        }
      }
    });
    
    // Update enemy projectiles with time slow
    this.projectiles.forEach(p => {
      if (p.isEnemyProjectile && this.player && this.player.hasTimeSlow) {
        p.update(deltaTime * timeSlowMultiplier);
      } else {
        p.update(deltaTime);
      }
    });
    
    // Update pickups
    this.pickups.forEach(p => p.update(deltaTime));
    
    // Phase 1: Update hazards
    this.hazardManager.update(deltaTime, this.currentTime, this.player, this.enemies);
    
    // Add hazard projectiles to main projectiles array
    this.hazardManager.hazardProjectiles.forEach(proj => {
      if (!this.projectiles.includes(proj)) {
        this.projectiles.push(proj);
      }
    });
    
    // Phase 1: Update interactive elements
    this.movingPlatforms.forEach(p => p.update(deltaTime));
    this.switches.forEach(s => s.update(deltaTime));
    this.doors.forEach(d => d.update(deltaTime));
    this.jumpPads.forEach(j => j.update(deltaTime));
    
    // Phase 2: Update coin pickups
    this.coinPickups.forEach(coin => {
      coin.update(deltaTime, this.player, this.currencySystem);
    });
    this.coinPickups = this.coinPickups.filter(c => c.active);
    
    // Phase 2: Update shop vendor
    if (this.shopVendor) {
      this.shopVendor.update(deltaTime, this.player);
    }
    
    // Phase 2: Update noise and formation systems
    this.noiseSystem.update(deltaTime, this.enemies);
    this.formationSystem.update(deltaTime);
    
    // Auto-assign formations to groups of enemies periodically (every 5 seconds)
    if (this.player && this.player.active && this.enemies.length >= 3) {
      if (!this.lastFormationCheck || this.currentTime - this.lastFormationCheck > 5000) {
        this.formationSystem.autoAssignFormations(this.enemies, this.player);
        this.lastFormationCheck = this.currentTime;
      }
    }
    
    // Phase 3: Update weather system
    if (this.weatherSystem) {
      this.weatherSystem.update(deltaTime, this.worldWidth, this.player, this.camera);
      
      // Apply weather speed penalty to player
      if (this.player && this.player.active) {
        const speedPenalty = this.weatherSystem.getSpeedPenalty();
        if (speedPenalty > 0 && !this.player.weatherSpeedApplied) {
          this.player.baseSpeed = this.player.baseSpeed * (1 - speedPenalty);
          this.player.weatherSpeedApplied = true;
        }
      }
    }
    
    // Phase 5: Update biome system
    if (this.biomeSystem) {
      this.biomeSystem.update(deltaTime, this.player);
    }
    
    // Update level theme system (for animations)
    if (this.levelThemeSystem) {
      this.levelThemeSystem.update(deltaTime);
    }
    
    // Phase 3: Update time of day system
    if (this.timeOfDaySystem) {
      this.timeOfDaySystem.update(deltaTime, this.player, false);
      
      // Apply enemy vision multiplier from time of day
      const visionMultiplier = this.timeOfDaySystem.getEnemyVisionMultiplier();
      this.enemies.forEach(enemy => {
        if (enemy.active) {
          enemy.timeOfDayVisionMultiplier = visionMultiplier;
        }
      });
    }
    
    // Phase 3: Update flashlight battery
    this.updateFlashlight(deltaTime);
    
    // Phase 3: Update vehicles
    this.vehicles.forEach(vehicle => {
      if (vehicle.active) {
        vehicle.update(deltaTime, this.inputManager, this.groundLevel, this.worldWidth, this.enemies);
      }
    });
    this.vehicles = this.vehicles.filter(v => v.active || v.isDestroyed);
    
    // Phase 3: Update mounted weapons
    this.mountedWeapons.forEach(weapon => {
      if (weapon.active) {
        weapon.update(deltaTime, this.currentTime);
      }
    });
    
    // Phase 3: Update dynamic event system
    if (this.dynamicEventSystem && this.dynamicEventSystem.active) {
      this.dynamicEventSystem.update(deltaTime, this);
    }
    
    // Update tutorial system
    if (this.tutorialManager && this.tutorialManager.isActive) {
      this.tutorialManager.update(deltaTime, this.inputManager);
    }
    
    // Update story manager dialogue system (campaign mode)
    if (this.mode === 'campaign' && this.storyManager && this.storyManager.isShowingDialogue) {
      this.storyManager.update(deltaTime, this.inputManager);
    }
    
    // Update particles
    this.particleSystem.update(deltaTime);
    
    // Update combo timer
    if (this.combo > 0 && this.currentTime - this.comboTimer > this.comboTimeout) {
      this.combo = 0;
    }
    
    // Check achievements
    this.achievementSystem.update(this);
    
    // Check skin unlocks based on statistics
    if (this.skinSystem && this.statisticsSystem) {
      const stats = this.statisticsSystem.getStatsSummary();
      if (stats) {
        const newUnlocks = this.skinSystem.checkUnlocks({
          campaignCompleted: stats.progression.campaignCompleted,
          stealthKills: stats.combat.stealthKills,
          totalKills: stats.combat.totalKills,
          highestHordeWave: stats.survival.highestWave,
          timeAttackCompleted: this.timeAttackMode && this.timeAttackMode.completed,
          bossRushCompleted: this.bossRushMode && this.bossRushMode.completed,
          totalCoinsEarned: stats.progression.coinsEarned
        });
        // Show unlock notifications for any newly unlocked skins
        if (newUnlocks && newUnlocks.length > 0) {
          newUnlocks.forEach(skin => {
            this.particleSystem.createTextPopup(
              this.player.x + this.player.width / 2,
              this.player.y - 80,
              `SKIN UNLOCKED: ${skin.name}!`,
              skin.colors.accent
            );
          });
        }
      }
    }
    
    // Render particle trail for skin effects
    if (this.skinSystem && this.player && this.player.active) {
      this.skinSystem.renderParticleTrail(this.particleSystem, this.player, deltaTime);
    }
    
    // Update camera
    this.camera.update();
    
    // Handle collisions
    this.handleCollisions();
    
    // Clean up inactive entities
    this.enemies = this.enemies.filter(e => e.active && e.health > 0);
    this.projectiles = this.projectiles.filter(p => p.active);
    this.pickups = this.pickups.filter(p => p.active);
    this.covers = this.covers.filter(c => c.active);
    this.platforms = this.platforms.filter(p => p.active);
    this.slopes = this.slopes.filter(s => s.active);
    
    // Also remove from collision system
    this.collisionSystem.entities = this.collisionSystem.entities.filter(e => e.active);
    
    // Check wave/level completion
    this.enemiesRemaining = this.enemies.filter(e => e.active && e.health > 0).length;
    
    if (this.mode === 'survival') {
      if (this.enemiesRemaining === 0) {
        // Wave clear bonus
        const waveBonus = this.wave * 500;
        this.score += waveBonus;
        
        // Phase 2: Currency wave bonus
        if (this.currencySystem) {
          const coinBonus = this.currencySystem.calculateWaveBonus(this.wave);
          this.currencySystem.addCoins(coinBonus);
          
          // Track coins earned in statistics
          if (this.statisticsSystem) {
            this.statisticsSystem.trackCoinsEarned(coinBonus);
          }
          
          this.particleSystem.createTextPopup(
            this.player.x + this.player.width / 2,
            this.player.y - 50,
            `+${coinBonus} COINS`,
            '#ffd700'
          );
        }
        
        // Play wave complete sound
        this.audioManager.playSound('pickup_powerup', 0.7);
        
        // Reset wave damage tracking
        this.damageTakenThisWave = 0;
        
        // Auto-save after wave completion
        this.autoSave(0);
        
        // Track wave completion in statistics
        if (this.statisticsSystem) {
          this.statisticsSystem.trackWaveComplete(this.wave, this.kills);
        }
        
        this.wave++;
        
        // Phase 3: Trigger dynamic events on wave start
        if (this.dynamicEventSystem) {
          const event = this.dynamicEventSystem.onWaveStart(this.wave, this);
          if (event) {
            // Event was triggered - show notification
            this.particleSystem.createTextPopup(
              this.player.x + this.player.width / 2,
              this.player.y - 70,
              event.announcement,
              event.type === 'positive' ? '#00ff00' : '#ff4444'
            );
          }
        }
        
        this.spawnWave();
        this.spawnPickups();
        this.spawnCovers(); // Respawn covers for new wave
        
        // Phase 1: Spawn new hazards for new wave
        this.hazardManager.spawnHazards(this.mode, this.currentLevel, this.wave, this.groundLevel, this.worldWidth);
        
        // Phase 3: Spawn vehicles periodically
        this.spawnVehicles(this.mode, this.currentLevel);
        
        // Phase 3: Spawn mounted weapons periodically
        this.spawnMountedWeapons(this.mode, this.currentLevel);
        
        // Phase 2: Spawn shop vendor every 5 waves
        if (shouldSpawnShop(this.wave)) {
          const shopSpawnOffset = { x: 100, y: 60 }; // Offset from player position
          this.shopVendor = new ShopVendor(
            this.player.x + shopSpawnOffset.x, 
            this.groundLevel - shopSpawnOffset.y
          );
          this.particleSystem.createTextPopup(
            this.shopVendor.x + this.shopVendor.width / 2,
            this.shopVendor.y - 40,
            'SHOP OPEN!',
            '#00ff00'
          );
        } else {
          this.shopVendor = null;
        }
        
        // Add spawn protection when starting new wave
        if (this.player && this.player.active) {
          this.player.invulnerable = true;
          setTimeout(() => {
            if (this.player && this.player.active) {
              this.player.invulnerable = false;
            }
          }, 1500); // 1.5 seconds of spawn protection
        }
      }
    } else if (this.mode === 'campaign') {
      if (this.enemiesRemaining === 0 && !this.levelTransitionActive && !this.pendingLevelTransition) {
        // Level complete - mark as pending to prevent re-triggering
        this.pendingLevelTransition = true;
        
        // Capture boss info before enemies array is modified
        const bossEnemy = this.enemies.find(e => e.isBoss);
        const wasBossLevel = this.isBossLevel;
        const defeatedBossId = bossEnemy ? bossEnemy.bossId : undefined;
        
        // Award level completion bonus
        const levelBonus = this.currentLevel * 1000;
        this.score += levelBonus;
        
        // Play level complete sound
        this.audioManager.playSound('pickup_powerup', 0.8);
        
        // Show level complete message briefly
        this.state = 'levelcomplete';
        this.menuState = 'levelcomplete';
        
        // Auto-save progress
        this.autoSave(0);
        
        const completedLevel = this.currentLevel;
        
        // Start level transition sequence after brief delay
        setTimeout(() => {
          if (this.state === 'levelcomplete' || this.pendingLevelTransition) {
            // Play level outro cutscene first
            this.playLevelOutroCutscene(completedLevel, () => {
              // If boss was defeated, check for boss defeat cutscene
              if (wasBossLevel && defeatedBossId !== undefined) {
                this.playStoryCutscene(`level${completedLevel}_boss_defeat`, () => {
                  this.startWalkingTransition(completedLevel);
                });
              } else {
                this.startWalkingTransition(completedLevel);
              }
            });
          }
        }, 2000);
      }
    } else if (this.mode === 'timeattack') {
      // Update Time Attack mode timer
      if (this.timeAttackMode.active) {
        this.timeAttackMode.update(deltaTime, {
          x: this.player.x,
          y: this.player.y,
          facing: this.player.facing
        });
      }
      
      // Check level completion
      if (this.enemiesRemaining === 0 && this.timeAttackMode.active) {
        const result = this.timeAttackMode.stop(true);
        
        // Show time attack result
        this.particleSystem.createTextPopup(
          this.player.x + this.player.width / 2,
          this.player.y - 50,
          result.medal ? `${result.medal.toUpperCase()} MEDAL!` : 'LEVEL COMPLETE!',
          result.medal === 'gold' ? '#ffd700' : result.medal === 'silver' ? '#c0c0c0' : '#cd7f32'
        );
        
        // Add score bonus
        this.score += Math.floor(1000 - result.time * 10);
        
        // Progress to next level
        if (this.currentLevel < this.maxLevel) {
          this.currentLevel++;
          this.setupTimeAttackLevel();
        } else {
          this.showVictoryScreen();
        }
      }
    } else if (this.mode === 'bossrush') {
      // Check boss defeated
      if (this.enemiesRemaining === 0 && this.bossRushMode.active) {
        const boss = this.enemies.find(e => e.isBoss);
        const bossId = boss ? boss.bossId : this.bossRushMode.getCurrentBossId();
        const result = this.bossRushMode.bossDefeated(bossId);
        
        if (result.completed) {
          // All bosses defeated
          this.score += Math.floor(10000 - result.totalTime * 10);
          this.showVictoryScreen();
        } else {
          // Spawn next boss after delay
          this.particleSystem.createTextPopup(
            this.player.x + this.player.width / 2,
            this.player.y - 50,
            'BOSS DEFEATED!',
            '#00ff00'
          );
          
          // Heal player
          this.player.heal(Math.floor(this.player.maxHealth * result.healthRefill));
          
          // Spawn power-up if awarded
          if (result.powerUp) {
            const pickup = new Pickup(this.player.x + 100, this.groundLevel - 30, result.powerUp);
            this.pickups.push(pickup);
            this.collisionSystem.add(pickup);
          }
          
          // Spawn next boss after delay
          setTimeout(() => {
            if (this.state === 'playing' && this.bossRushMode.active) {
              this.enemies = [];
              this.spawnBossRushBoss();
            }
          }, 2000);
        }
      }
    } else if (this.mode === 'horde') {
      // Check wave completion
      if (this.enemiesRemaining === 0 && this.hordeMode.active) {
        const result = this.hordeMode.enemyKilled();
        
        if (result && result.waveComplete) {
          // Wave complete
          this.score += this.hordeMode.wave * 500;
          
          this.particleSystem.createTextPopup(
            this.player.x + this.player.width / 2,
            this.player.y - 50,
            `WAVE ${result.wave} COMPLETE!`,
            '#ff00ff'
          );
          
          // Heal player between waves
          this.player.heal(30);
          
          // Spawn next wave after delay
          setTimeout(() => {
            if (this.state === 'playing' && this.hordeMode.active) {
              this.enemies = [];
              this.spawnHordeWave();
              this.spawnPickups();
            }
          }, 2000);
        }
      }
    } else if (this.mode === 'onehit') {
      // Check level completion
      if (this.enemiesRemaining === 0 && this.oneHitMode.active) {
        const result = this.oneHitMode.levelCompleted();
        
        this.score += 2000; // Bonus for surviving one-hit mode level
        
        if (result.hasNextLevel) {
          // Progress to next level
          this.currentLevel++;
          
          this.particleSystem.createTextPopup(
            this.player.x + this.player.width / 2,
            this.player.y - 50,
            'LEVEL SURVIVED!',
            '#00ff00'
          );
          
          // Setup next level after delay
          setTimeout(() => {
            if (this.state === 'playing' && this.oneHitMode.active) {
              this.enemies = [];
              this.spawnCampaignEnemies();
              this.spawnPickups();
              // Apply one-hit mode to new enemies
              this.enemies.forEach(enemy => this.oneHitMode.applyToEnemy(enemy));
            }
          }, 2000);
        } else {
          // All levels complete
          this.showVictoryScreen();
        }
      }
    } else if (this.mode === 'basedefense') {
      // Base Defense Mode: Check wave completion and objective status
      if (this.baseDefenseMode.active) {
        // Check if objective is destroyed
        if (this.baseDefenseMode.objectiveHealth <= 0) {
          this.baseDefenseMode.end('defeat');
          this.showGameOverScreen();
          return;
        }
        
        // Check wave completion
        if (this.enemiesRemaining === 0 && !this.baseDefenseMode.inWaveBreak) {
          const wave = this.baseDefenseMode.wave;
          
          // Award score for wave completion
          this.score += wave * 300;
          this.baseDefenseMode.resources += this.baseDefenseMode.resourcesPerWave;
          
          this.particleSystem.createTextPopup(
            this.player.x + this.player.width / 2,
            this.player.y - 50,
            `WAVE ${wave} COMPLETE!`,
            '#00ff00'
          );
          
          // Check if all waves completed
          if (wave >= this.baseDefenseMode.maxWaves) {
            this.baseDefenseMode.complete();
            this.showVictoryScreen();
            return;
          }
          
          // Start wave break for building
          this.baseDefenseMode.inWaveBreak = true;
          this.baseDefenseMode.waveBreakTimer = 0;
          
          // Heal player between waves
          this.player.heal(30);
          
          // Spawn next wave after delay
          setTimeout(() => {
            if (this.state === 'playing' && this.baseDefenseMode.active) {
              this.baseDefenseMode.startNextWave();
              this.enemies = [];
              this.spawnBaseDefenseWave();
              this.spawnPickups();
            }
          }, this.baseDefenseMode.waveBreakDuration);
        }
      }
    }
  }
  
  /**
   * Set up the next time attack level
   */
  setupTimeAttackLevel() {
    // Clear old level entities
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];
    this.covers = [];
    this.platforms = [];
    this.slopes = [];
    
    // Clear collision system
    if (this.collisionSystem && typeof this.collisionSystem.clear === 'function') {
      this.collisionSystem.clear();
    }
    
    // Reset player position
    this.player.x = 100;
    this.player.y = this.groundLevel - 50;
    
    // Spawn terrain
    this.spawnCovers();
    this.spawnLevelTerrain();
    
    // Spawn enemies
    this.spawnCampaignEnemies();
    this.spawnPickups();
    
    // Start time attack timer
    this.timeAttackMode.start(this.currentLevel);
    
    // Heal player
    this.player.heal(30);
    
    // Add spawn protection
    this.player.invulnerable = true;
    setTimeout(() => {
      if (this.player && this.player.active) {
        this.player.invulnerable = false;
      }
    }, 1500);
  }
  
  /**
   * Start walking transition and proceed to next level
   * @param {number} completedLevel - The level that was just completed
   */
  startWalkingTransition(completedLevel) {
    // Check if more levels remain
    if (completedLevel < this.maxLevel) {
      // Start walking off-screen animation
      this.state = 'leveltransition';
      this.startLevelTransition(() => {
        // After walking off, advance to next level
        this.currentLevel = completedLevel + 1;
        this.pendingLevelTransition = false;
        this.setupNextLevel();
      });
    } else {
      // All levels complete - play victory ending cutscene
      this.playStoryCutscene('victory_ending', () => {
        this.showVictoryScreen();
      });
    }
  }
  
  /**
   * Set up the next level (called after walking transition)
   */
  setupNextLevel() {
    // Clear old level entities
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];
    this.covers = [];
    this.platforms = [];
    this.slopes = [];
    
    // Reset player position
    this.player.x = 100;
    this.player.y = this.groundLevel - 50;
    
    // Initialize level theme system for the new level
    const levelIndex = this.currentLevel - 1;
    if (this.levelThemeSystem) {
      this.levelThemeSystem.init(levelIndex);
      
      // Get environment settings from level theme
      const envSettings = this.levelThemeSystem.getLevelEnvironmentSettings();
      
      // Update weather based on level visual profile
      if (this.weatherSystem && envSettings.weather) {
        this.weatherSystem.setWeather(envSettings.weather);
      }
      
      // Update time of day based on level visual profile
      if (this.timeOfDaySystem && envSettings.timeOfDay) {
        this.timeOfDaySystem.setPhase(envSettings.timeOfDay);
      }
      
      // Update biome system
      if (this.biomeSystem && envSettings.biome) {
        this.biomeSystem.setBiome(envSettings.biome.name === 'Default' ? 'DEFAULT' : 
          Object.keys(GameConfig.BIOMES).find(key => 
            GameConfig.BIOMES[key].name === envSettings.biome.name) || 'DEFAULT');
      }
    }
    
    // Spawn terrain first
    this.spawnCovers();
    this.spawnLevelTerrain();
    
    // Play level intro cutscene
    this.playLevelIntroCutscene(this.currentLevel, () => {
      // After cutscene, spawn enemies and start gameplay
      this.spawnCampaignEnemies();
      this.spawnPickups();
      
      // Only set state to playing if a boss cutscene didn't start
      if (this.state !== 'cutscene') {
        this.state = 'playing';
        this.menuState = null;
        
        // Switch music for boss levels
        if (this.isBossLevel) {
          this.audioManager.playMusic('boss');
        } else {
          this.audioManager.playMusic('gameplay');
        }
      }
      
      // Heal player between levels
      this.player.heal(30);
      
      // Add spawn protection when starting new level
      this.player.invulnerable = true;
      setTimeout(() => {
        if (this.player && this.player.active) {
          this.player.invulnerable = false;
        }
      }, 1500);
    });
  }
  
  /**
   * Show victory screen after final cutscene
   */
  showVictoryScreen() {
    this.finalPlayTime = this.currentTime - this.gameStartTime;
    this.state = 'victory';
    this.menuState = 'victory';
    this.ui.setLastScore(this.score);
    this.pendingLevelTransition = false;
    
    // Track campaign completion for skin unlocks
    if (this.mode === 'campaign' && this.statisticsSystem) {
      this.statisticsSystem.trackCampaignComplete();
    }
    
    // Auto-save final progress
    this.autoSave(0);
    
    // Play victory music
    this.audioManager.stopMusic();
    this.audioManager.playMusic('victory');
  }

  swapWeapon(slotIndex) {
    if (this.weaponSwapPopup && this.player && slotIndex >= 0 && slotIndex < this.player.rangedWeapons.length) {
      // Replace ranged weapon in selected slot
      this.player.rangedWeapons[slotIndex] = this.weaponSwapPopup.weapon;
      
      // Destroy the pickup
      this.weaponSwapPopup.pickup.destroy();
      
      // Track weapon collection
      this.weaponsCollected++;
      this.score += 50;
      
      // Clear popup
      this.weaponSwapPopup = null;
      this.state = 'playing';
    }
  }

  // Dev tool: Instant kill all enemies
  devToolInstantKillAll() {
    if (!this.devToolUnlocked) return;
    
    let killCount = 0;
    this.enemies.forEach(enemy => {
      if (enemy.active && enemy.health > 0) {
        enemy.health = 0;
        enemy.destroy();
        killCount++;
        
        // Create explosion effect
        this.particleSystem.createExplosion(
          enemy.x + enemy.width / 2,
          enemy.y + enemy.height / 2
        );
      }
    });
    
    // Update kills and score
    this.kills += killCount;
    this.score += killCount * 100;
    
    // Play sound effect
    this.audioManager.playSound('explosion', 0.8);
    
    // Show notification
    if (this.particleSystem && killCount > 0) {
      this.particleSystem.createTextPopup(
        this.player.x + this.player.width / 2,
        this.player.y - 50,
        `DEV: ${killCount} ENEMIES ELIMINATED`,
        '#ffff00'
      );
    }
    
    // Screen shake for dramatic effect
    this.camera.shake(10, 500);
  }

  // Dev tool: Toggle invincibility (God mode)
  devToolToggleInvincibility() {
    if (!this.devToolUnlocked) return;
    
    this.devInvincibilityEnabled = !this.devInvincibilityEnabled;
    
    // Play sound effect
    if (this.devInvincibilityEnabled) {
      this.audioManager.playSound('pickup_powerup', 0.7);
    } else {
      this.audioManager.playSound('menu_navigate', 0.5);
    }
    
    // Show notification
    if (this.particleSystem && this.player && this.player.active) {
      const message = this.devInvincibilityEnabled ? 'DEV: GOD MODE ENABLED' : 'DEV: GOD MODE DISABLED';
      const color = this.devInvincibilityEnabled ? '#00ffff' : '#ff6600';
      this.particleSystem.createTextPopup(
        this.player.x + this.player.width / 2,
        this.player.y - 50,
        message,
        color
      );
    }
  }

  handleCollisions() {
    // Player vs Cover - make covers solid
    if (this.player && this.player.active) {
      this.covers.forEach(cover => {
        if (cover.active && this.player.collidesWith(cover)) {
          // Calculate overlap and push player out
          const playerBounds = this.player.getBounds();
          const coverBounds = cover.getBounds();
          
          // Calculate overlaps on each side
          const overlapLeft = playerBounds.right - coverBounds.left;
          const overlapRight = coverBounds.right - playerBounds.left;
          const overlapTop = playerBounds.bottom - coverBounds.top;
          const overlapBottom = coverBounds.bottom - playerBounds.top;
          
          // Find minimum overlap (the side with least penetration)
          const minOverlapX = Math.min(overlapLeft, overlapRight);
          const minOverlapY = Math.min(overlapTop, overlapBottom);
          
          // Push player out on the axis with least overlap
          if (minOverlapX < minOverlapY) {
            // Push horizontally
            if (overlapLeft < overlapRight) {
              this.player.x = coverBounds.left - this.player.width;
            } else {
              this.player.x = coverBounds.right;
            }
            this.player.dx = 0;
          } else {
            // Push vertically
            if (overlapTop < overlapBottom) {
              this.player.y = coverBounds.top - this.player.height;
              this.player.dy = 0;
              this.player.onGround = true;
            } else {
              this.player.y = coverBounds.bottom;
              this.player.dy = 0;
            }
          }
        }
      });
      
      // Player vs Platforms
      this.platforms.forEach(platform => {
        if (platform.active) {
          const playerBounds = this.player.getBounds();
          const platformBounds = platform.getBounds();
          
          // Check if player is falling onto platform from above
          if (this.player.dy >= 0 && 
              playerBounds.bottom <= platformBounds.top + 10 &&
              playerBounds.bottom >= platformBounds.top - 5 &&
              playerBounds.right > platformBounds.left + 5 &&
              playerBounds.left < platformBounds.right - 5) {
            // Land on platform
            this.player.y = platformBounds.top - this.player.height;
            this.player.dy = 0;
            this.player.onGround = true;
          }
          
          // For solid platforms, also block horizontal and upward movement
          if (platform.platformType === 'solid' && this.player.collidesWith(platform)) {
            const overlapLeft = playerBounds.right - platformBounds.left;
            const overlapRight = platformBounds.right - playerBounds.left;
            const overlapTop = playerBounds.bottom - platformBounds.top;
            const overlapBottom = platformBounds.bottom - playerBounds.top;
            
            const minOverlapX = Math.min(overlapLeft, overlapRight);
            const minOverlapY = Math.min(overlapTop, overlapBottom);
            
            // Only apply horizontal collision if not landing from above
            if (minOverlapX < minOverlapY && overlapTop > 10) {
              // Push horizontally
              if (overlapLeft < overlapRight) {
                this.player.x = platformBounds.left - this.player.width;
              } else {
                this.player.x = platformBounds.right;
              }
              this.player.dx = 0;
            } else if (this.player.dy < 0 && overlapBottom < 15) {
              // Bonk head on solid platform from below
              this.player.y = platformBounds.bottom;
              this.player.dy = 0;
            }
          }
        }
      });
      
      // Player vs Slopes
      this.slopes.forEach(slope => {
        if (slope.active) {
          const playerCenterX = this.player.x + this.player.width / 2;
          const playerBottom = this.player.y + this.player.height;
          
          const slopeY = slope.getYAtX(playerCenterX);
          
          // Improved slope collision detection to fix jump bug
          if (slopeY !== null && playerBottom >= slopeY - 5 && playerBottom <= slopeY + 15) {
            // Player is on or near the slope
            // Only snap to slope if player is falling or moving downward
            if (this.player.dy >= 0) {
              this.player.y = slopeY - this.player.height;
              this.player.dy = 0;
              this.player.onGround = true;
            }
          }
        }
      });
    }
    
    // Player vs Pickups
    this.pickups.forEach(pickup => {
      if (pickup.active && this.player && this.player.active && this.player.collidesWith(pickup)) {
        // Check if pickup is temporarily ignored (player said NO to weapon swap)
        if (pickup.ignoredUntil && this.currentTime < pickup.ignoredUntil) {
          return; // Skip this pickup temporarily
        }
        
        // Handle weapon pickups with swap popup
        if (pickup.pickupType && pickup.pickupType.startsWith('weapon_')) {
          // Melee weapons auto-equip (only one melee slot)
          if (pickup.weapon && pickup.weapon.isMelee) {
            this.weaponsCollected++;
            pickup.apply(this.player);
            this.score += 50;
            this.audioManager.playSound('pickup_weapon', 0.6);
            this.particleSystem.createTextPopup(pickup.x, pickup.y - 10, `+${pickup.weapon.name}`, '#ffaa00');
          }
          // Check if player already has 4 ranged weapons (max capacity)
          else if (this.player.rangedWeapons.length >= 4) {
            // Show weapon swap popup
            this.weaponSwapPopup = {
              weapon: pickup.weapon,
              pickup: pickup,
              pickupType: pickup.pickupType
            };
            this.state = 'weaponswap';
            return; // Don't apply pickup yet
          } else {
            // Auto-add if not at max capacity
            this.weaponsCollected++;
            pickup.apply(this.player);
            this.score += 50;
            this.audioManager.playSound('pickup_weapon', 0.6);
            this.particleSystem.createTextPopup(pickup.x, pickup.y - 10, `+${pickup.weapon.name}`, '#00ff00');
          }
        } else if (pickup.pickupType === 'health' || pickup.pickupType === 'healing') {
          // Health pickups
          pickup.apply(this.player);
          this.score += 50;
          this.audioManager.playSound('pickup_health', 0.6);
          this.particleSystem.createTextPopup(pickup.x, pickup.y - 10, '+HEALTH', '#00ff00');
        } else if (pickup.pickupType === 'ammo') {
          // Ammo pickups
          pickup.apply(this.player);
          this.score += 50;
          this.audioManager.playSound('pickup_ammo', 0.6);
          this.particleSystem.createTextPopup(pickup.x, pickup.y - 10, '+AMMO', '#ffff00');
        } else if (pickup.pickupType && pickup.pickupType.startsWith('powerup_')) {
          // Power-up pickups
          pickup.apply(this.player);
          this.score += 50;
          this.audioManager.playSound('pickup_powerup', 0.7);
          const powerupName = pickup.pickupType.replace('powerup_', '').toUpperCase();
          this.particleSystem.createTextPopup(pickup.x, pickup.y - 10, `+${powerupName}`, '#ff00ff');
        } else {
          // Generic pickups
          pickup.apply(this.player);
          this.score += 50;
          this.audioManager.playSound('pickup', 0.6);
        }
      }
    });
    
    // Projectiles vs Enemies/Player
    this.projectiles.forEach(proj => {
      if (!proj.active) return;
      
      // Player projectiles hitting enemies (both ranged and melee weapons)
      if (proj.owner instanceof Weapon && (proj.owner === this.player.getCurrentWeapon() || proj.owner === this.player.getCurrentMeleeWeapon())) {
        this.enemies.forEach(enemy => {
          if (enemy.active && proj.active && proj.collidesWith(enemy)) {
            const killed = enemy.takeDamage(proj.damage);
            proj.destroy();
            
            // Show damage number
            this.particleSystem.createTextPopup(
              enemy.x + enemy.width / 2, 
              enemy.y, 
              `-${Math.floor(proj.damage)}`,
              proj.owner && proj.owner.isMelee ? '#ffaa00' : '#ff4444'
            );
            
            // Play hit sound - explosive projectiles get explosion sound
            if (proj.isExplosive) {
              this.audioManager.playSound('explosion', 0.6);
            } else if (proj.owner && proj.owner.isMelee) {
              this.audioManager.playSound('melee_hit', 0.5);
            } else {
              this.audioManager.playSound('enemy_hit', 0.3);
            }
            
            // Track hits and damage
            this.shotsHit++;
            this.totalDamageDealt += proj.damage;
            
            // Track damage in statistics system
            if (this.statisticsSystem) {
              this.statisticsSystem.trackDamageDealt(proj.damage);
              this.statisticsSystem.trackShotHit();
            }
            
            if (killed) {
              this.kills++;
              
              // Track kill in statistics system
              if (this.statisticsSystem) {
                const weapon = this.player.getCurrentWeapon();
                this.statisticsSystem.trackKill(enemy, weapon, false);
              }
              
              // Play kill sound
              this.audioManager.playSound('enemy_killed', 0.6);
              
              // Combo system
              this.combo++;
              if (this.combo > this.maxCombo) this.maxCombo = this.combo;
              this.comboTimer = this.currentTime;
              const comboBonus = Math.min(this.combo, 10) * 10; // Max 100 bonus points at 10x combo
              const totalPoints = 100 + comboBonus;
              this.score += totalPoints;
              
              // Track boss kills
              if (enemy.enemyType === 'boss') {
                this.bossesKilled++;
              }
              
              this.particleSystem.createExplosion(
                enemy.x + enemy.width / 2,
                enemy.y + enemy.height / 2
              );
              
              // Play small explosion on enemy death
              this.audioManager.playSound('explosion', 0.3);
              
              // Screen shake on enemy kill
              this.camera.shake(3, 150);
              
              // Phase 1: Apply elite/mini-boss score multiplier
              let scoreMultiplier = 1;
              let extraPopupText = '';
              if (enemy.isMiniBoss) {
                scoreMultiplier = enemy.scoreMultiplier || 5;
                extraPopupText = ' MINI-BOSS!';
              } else if (enemy.isElite) {
                scoreMultiplier = enemy.scoreMultiplier || 2;
                extraPopupText = ' ELITE!';
              }
              const finalPoints = totalPoints * scoreMultiplier;
              this.score += (finalPoints - totalPoints); // Add extra points (base already added)
              
              // Show score popup
              let popupText = `+${finalPoints}`;
              let popupColor = '#ffff00';
              if (this.combo > 1) {
                popupText += ` (${this.combo}x)`;
                popupColor = '#ff6600';
              }
              if (extraPopupText) {
                popupText += extraPopupText;
                popupColor = enemy.isMiniBoss ? '#ff00ff' : '#ffdd00';
              }
              this.particleSystem.createTextPopup(
                enemy.x + enemy.width / 2,
                enemy.y - 20,
                popupText,
                popupColor
              );
              
              // Always spawn pickup when enemy is killed
              // Common drops (60% chance) - basic resources and power-ups
              let pickupTypes = ['health', 'ammo', 'healing', 'damage_boost', 'powerup_speed', 'powerup_rapid_fire'];
              
              // Uncommon power-up drops (25% chance)
              if (Math.random() < 0.25) {
                pickupTypes = ['powerup_multi_shot', 'powerup_invincibility', 'powerup_shield', 'damage_boost'];
              }
              
              // Phase 1: Guaranteed power-up for elite enemies
              if (enemy.guaranteedDrop || enemy.isElite) {
                pickupTypes = ['powerup_multi_shot', 'powerup_invincibility', 'powerup_shield', 'damage_boost', 'powerup_rapid_fire'];
              }
              
              // Rare weapon drops for elite enemies (20% chance)
              if ((enemy.enemyType === 'heavy' || enemy.enemyType === 'sniper') && Math.random() < 0.2) {
                const weaponDrops = ['weapon_rifle', 'weapon_shotgun', 'weapon_machinegun', 'weapon_sniper'];
                pickupTypes = weaponDrops;
              }
              
              // Phase 1: Mini-boss guaranteed epic weapon
              if (enemy.isMiniBoss) {
                const epicWeapons = ['weapon_grenade', 'weapon_laser', 'weapon_machinegun', 'weapon_sniper'];
                pickupTypes = epicWeapons;
              }
              
              // Epic weapon drops for bosses (guaranteed)
              if (enemy.enemyType === 'boss') {
                const epicWeapons = ['weapon_grenade', 'weapon_laser', 'weapon_machinegun'];
                pickupTypes = epicWeapons;
              }
              
              const type = pickupTypes[Math.floor(Math.random() * pickupTypes.length)];
              const pickup = new Pickup(enemy.x, enemy.y, type);
              this.pickups.push(pickup);
              this.collisionSystem.add(pickup);
              
              // Phase 2: Spawn coin pickup
              if (this.currencySystem) {
                const coinValue = this.currencySystem.calculateEnemyDrop(enemy);
                const coin = new CoinPickup(
                  enemy.x + enemy.width / 2 + (Math.random() - 0.5) * 30,
                  enemy.y + enemy.height / 2,
                  coinValue
                );
                this.coinPickups.push(coin);
              }
              
              // Phase 2: Check for attachment drop
              if (this.attachmentSystem) {
                const attachmentDrop = this.attachmentSystem.checkDrop(enemy);
                if (attachmentDrop) {
                  this.attachmentSystem.addToInventory(attachmentDrop);
                  this.particleSystem.createTextPopup(
                    enemy.x + enemy.width / 2,
                    enemy.y - 40,
                    'ATTACHMENT!',
                    '#ff00ff'
                  );
                }
              }
            }
          }
        });
      }
      
      // Enemy projectiles hitting player
      else {
        if (this.player.active && proj.collidesWith(this.player)) {
          const damaged = this.player.takeDamage(proj.damage, this.currentTime);
          
          if (damaged === 'parry') {
            // Perfect parry! Deflect projectile
            proj.dx *= -1;
            proj.dy *= -1;
            proj.owner = this.player; // Now it belongs to player
            this.audioManager.playSound('melee_hit', 0.8);
            this.particleSystem.createTextPopup(
              this.player.x + this.player.width / 2,
              this.player.y - 20,
              'PARRY!',
              '#ffaa00'
            );
            this.camera.shake(3, 100);
          } else if (damaged) {
            const actualDamage = this.player.isBlocking ? Math.floor(proj.damage * 0.25) : proj.damage;
            this.totalDamageTaken += actualDamage;
            this.damageTakenThisWave += actualDamage;
            
            // Track damage taken in statistics
            if (this.statisticsSystem) {
              this.statisticsSystem.trackDamageTaken(actualDamage);
            }
            
            if (this.player.isBlocking) {
              // Blocked hit
              this.audioManager.playSound('player_hit', 0.3);
              this.particleSystem.createTextPopup(
                this.player.x + this.player.width / 2,
                this.player.y - 20,
                'BLOCKED',
                '#00ffff'
              );
            } else {
              // Normal hit
              this.audioManager.playSound('player_hit', 0.5);
            }
            
            proj.destroy();
            this.particleSystem.createExplosion(
              this.player.x + this.player.width / 2,
              this.player.y + this.player.height / 2,
              10,
              '#ff0000'
            );
            // Screen shake when player takes damage (less if blocking)
            this.camera.shake(this.player.isBlocking ? 2 : 5, 200);
          }
        }
      }
    });
    
    // Projectiles vs Cover - bullets stop when hitting cover
    this.projectiles.forEach(proj => {
      if (!proj.active) return;
      
      this.covers.forEach(cover => {
        if (cover.active && proj.collidesWith(cover)) {
          // Destroy projectile when it hits cover
          proj.destroy();
          
          // Play impact sound
          this.audioManager.playSound('projectile_impact', 0.2);
          
          // Damage cover slightly
          const destroyed = cover.takeDamage(proj.damage * 0.1); // Cover takes 10% of bullet damage
          
          // Create small impact effect
          this.particleSystem.createExplosion(
            proj.x,
            proj.y,
            5,
            '#654321'
          );
          
          // If cover is destroyed, create debris
          if (destroyed) {
            this.audioManager.playSound('cover_destroy', 0.5);
            this.particleSystem.createExplosion(
              cover.x + cover.width / 2,
              cover.y + cover.height / 2,
              15,
              '#654321'
            );
          }
        }
      });
      
      // Phase 1: Projectiles hitting hazards (destructible ones)
      this.hazardManager.handleProjectileHit(proj);
    });
    
    // Phase 1: Handle jump pad collisions
    this.jumpPads.forEach(jumpPad => {
      if (!jumpPad.active) return;
      
      // Check player collision
      if (this.player && this.player.active && this.player.collidesWith(jumpPad)) {
        jumpPad.activate(this.player, this.currentTime);
      }
      
      // Check enemy collisions
      this.enemies.forEach(enemy => {
        if (enemy.active && enemy.collidesWith(jumpPad)) {
          jumpPad.activate(enemy, this.currentTime);
        }
      });
    });
    
    // Phase 1: Handle switch interactions (player pressing E near switch)
    if (this.player && this.player.active) {
      this.switches.forEach(switchObj => {
        if (!switchObj.active) return;
        
        // Check if player is near switch and pressing interaction key
        const dist = Math.sqrt(
          Math.pow((this.player.x + this.player.width / 2) - (switchObj.x + switchObj.width / 2), 2) +
          Math.pow((this.player.y + this.player.height / 2) - (switchObj.y + switchObj.height / 2), 2)
        );
        
        if (dist < 50 && (this.inputManager.wasKeyPressed('e') || this.inputManager.wasKeyPressed('E'))) {
          switchObj.toggle(this.currentTime);
        }
      });
    }
    
    // Phase 1: Handle door collisions (block movement when closed)
    this.doors.forEach(door => {
      if (!door.active || door.openProgress >= 0.95) return;
      
      // Block player
      if (this.player && this.player.active && this.player.collidesWith(door)) {
        const doorBounds = door.getBounds();
        const playerBounds = this.player.getBounds();
        
        // Push player out
        if (playerBounds.right > doorBounds.left && playerBounds.left < doorBounds.right) {
          if (this.player.dx > 0) {
            this.player.x = doorBounds.left - this.player.width;
          } else if (this.player.dx < 0) {
            this.player.x = doorBounds.right;
          }
          this.player.dx = 0;
        }
      }
      
      // Block enemies
      this.enemies.forEach(enemy => {
        if (enemy.active && enemy.collidesWith(door)) {
          const doorBounds = door.getBounds();
          if (enemy.dx > 0) {
            enemy.x = doorBounds.left - enemy.width;
          } else if (enemy.dx < 0) {
            enemy.x = doorBounds.right;
          }
          enemy.dx = 0;
        }
      });
    });
    
    // Phase 1: Handle moving platform collisions
    this.movingPlatforms.forEach(platform => {
      if (!platform.active) return;
      
      // Check player
      if (this.player && this.player.active) {
        const playerBounds = this.player.getBounds();
        const platformBounds = platform.getBounds();
        
        // Check if player is landing on platform
        if (this.player.dy >= 0 &&
            playerBounds.bottom >= platformBounds.top - 5 &&
            playerBounds.bottom <= platformBounds.top + 15 &&
            playerBounds.right > platformBounds.left + 5 &&
            playerBounds.left < platformBounds.right - 5) {
          this.player.y = platformBounds.top - this.player.height;
          this.player.dy = 0;
          this.player.onGround = true;
          platform.addPassenger(this.player);
        } else {
          platform.removePassenger(this.player);
        }
      }
      
      // Check enemies
      this.enemies.forEach(enemy => {
        if (!enemy.active || enemy.isFlying) return;
        
        const enemyBounds = enemy.getBounds();
        const platformBounds = platform.getBounds();
        
        if (enemy.dy >= 0 &&
            enemyBounds.bottom >= platformBounds.top - 5 &&
            enemyBounds.bottom <= platformBounds.top + 15 &&
            enemyBounds.right > platformBounds.left + 5 &&
            enemyBounds.left < platformBounds.right - 5) {
          enemy.y = platformBounds.top - enemy.height;
          enemy.dy = 0;
          platform.addPassenger(enemy);
        } else {
          platform.removePassenger(enemy);
        }
      });
    });
  }

  render() {
    // Clear canvas with military theme
    this.ctx.fillStyle = '#2d3748'; // Dark military gray-blue
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (this.state === 'loading') {
      this.ui.drawLoadingScreen(this.ctx, 1.0);
      return;
    }
    
    // Render cutscene state
    if (this.state === 'cutscene') {
      this.renderCutscene();
      return;
    }
    
    // Render level transition (player walking off-screen)
    if (this.state === 'leveltransition') {
      this.renderLevelTransition();
      return;
    }
    
    if (this.state === 'menu' || this.state === 'paused' || this.state === 'gameover' || this.state === 'victory' || this.state === 'levelcomplete' || this.menuState === 'character' || this.menuState === 'settings' || this.menuState === 'controls' || this.menuState === 'skins') {
      // Draw game in background if paused or level complete
      if (this.state === 'paused' || this.state === 'levelcomplete') {
        this.renderGame();
      }
      
      this.ui.drawMenu(this.ctx, this.menuState || this.state);
      return;
    }
    
    if (this.state === 'weaponswap' || this.state === 'weaponswapselect') {
      // Draw game in background
      this.renderGame();
      
      // Draw HUD
      this.ui.drawHUD(this.ctx, this.player, {
        score: this.score,
        kills: this.kills,
        wave: this.wave,
        enemiesRemaining: this.enemiesRemaining,
        mode: this.mode,
        combo: this.combo
      });
      
      // Draw weapon swap popup
      if (this.state === 'weaponswap') {
        this.ui.drawWeaponSwapPopup(this.ctx, this.weaponSwapPopup, this.player);
      } else if (this.state === 'weaponswapselect') {
        this.ui.drawWeaponSwapSelect(this.ctx, this.weaponSwapPopup, this.player);
      }
      return;
    }
    
    if (this.state === 'playing') {
      this.renderGame();
      
      // Draw HUD
      this.ui.drawHUD(this.ctx, this.player, {
        score: this.score,
        kills: this.kills,
        wave: this.wave,
        enemiesRemaining: this.enemiesRemaining,
        mode: this.mode,
        combo: this.combo
      });
      
      // Draw challenge mode HUD elements
      if (this.mode === 'timeattack' && this.timeAttackMode.active) {
        this.timeAttackMode.render(this.ctx, this.canvas.width);
      } else if (this.mode === 'bossrush' && this.bossRushMode.active) {
        this.bossRushMode.render(this.ctx, this.canvas.width);
      } else if (this.mode === 'horde' && this.hordeMode.active) {
        this.hordeMode.render(this.ctx, this.canvas.width);
      } else if (this.mode === 'onehit' && this.oneHitMode.active) {
        this.oneHitMode.render(this.ctx, this.canvas.width);
      }
      
      // Draw achievement notifications (without camera transform)
      this.achievementSystem.render(this.ctx, 10, 60);
      
      // Draw inventory if open
      if (this.showInventory) {
        this.ui.drawInventory(this.ctx, this.player, this.inventoryPage);
      }
      
      // Phase 2: Draw upgrade menu if open
      if (this.upgradeMenu.visible) {
        this.upgradeMenu.render(this.ctx);
      }
      
      // Phase 2: Draw shop menu if open
      if (this.shopMenu.visible) {
        this.shopMenu.render(this.ctx);
      }
      
      // Phase 2: Draw attachment menu if open
      if (this.attachmentMenu.visible) {
        this.attachmentMenu.render(this.ctx);
      }
      
      // Phase 2: Draw coin counter in HUD
      if (this.currencySystem) {
        this.drawCoinCounter(this.ctx);
      }
      
      // Phase 3: Draw dynamic event system HUD
      if (this.dynamicEventSystem && this.dynamicEventSystem.active) {
        this.dynamicEventSystem.render(this.ctx, this.canvas.width, this.canvas.height);
      }
      
      // Draw tutorial overlay when active
      if (this.tutorialManager && this.tutorialManager.isActive) {
        this.tutorialManager.render(this.ctx);
      }
      
      // Draw story dialogue in campaign mode
      if (this.mode === 'campaign' && this.storyManager && this.storyManager.isShowingDialogue) {
        this.storyManager.render(this.ctx);
      }
    }
  }
  
  /**
   * Draw coin counter in HUD
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawCoinCounter(ctx) {
    const coins = this.currencySystem.getCoins();
    const x = this.canvas.width - 120;
    const y = 20;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x - 10, y - 5, 110, 30);
    
    // Coin icon
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(x + 10, y + 10, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#b8860b';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('$', x + 10, y + 14);
    
    // Coin amount
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(this.currencySystem.formatCoins(coins), x + 28, y + 17);
  }

  renderGame() {
    // Apply camera transform
    this.camera.apply(this.ctx);
    
    // === LEVEL THEME RENDERING (replaces basic 16-bit backgrounds when available) ===
    if (this.levelThemeSystem && this.levelThemeSystem.getCurrentTheme()) {
      // Use the new level theme system for rich, varied visuals
      this.levelThemeSystem.renderSky(this.ctx, this.worldWidth, this.groundLevel, this.camera);
      this.levelThemeSystem.renderParallaxLayers(this.ctx, this.worldWidth, this.groundLevel, this.camera);
      this.levelThemeSystem.renderLandmarks(this.ctx, this.groundLevel, this.camera);
      this.levelThemeSystem.renderGround(this.ctx, this.worldWidth, this.worldHeight, this.groundLevel);
      this.levelThemeSystem.renderForegroundProps(this.ctx, this.groundLevel, this.camera);
    } else {
      // Fallback to original 16-bit rendering
      this.draw16BitSky();
      this.draw16BitMountains();
      this.draw16BitBuildings();
      this.draw16BitGround();
    }
    
    // Phase 5: Draw biome-specific elements (on top of level theme)
    if (this.biomeSystem) {
      this.biomeSystem.render(this.ctx, this.camera, this.groundLevel);
    }
    
    // Draw slopes first (part of terrain)
    this.slopes.forEach(s => s.render(this.ctx));
    
    // Draw platforms
    this.platforms.forEach(p => p.render(this.ctx));
    
    // Phase 1: Draw interactive elements
    this.movingPlatforms.forEach(p => p.render(this.ctx));
    this.doors.forEach(d => d.render(this.ctx));
    this.switches.forEach(s => s.render(this.ctx));
    this.jumpPads.forEach(j => j.render(this.ctx));
    
    // Draw cover objects (now as entities)
    this.covers.forEach(c => c.render(this.ctx));
    
    // Phase 1: Draw hazards
    this.hazardManager.render(this.ctx);
    
    // Phase 3: Draw vehicles
    this.vehicles.forEach(v => v.render(this.ctx));
    
    // Phase 3: Draw mounted weapons
    this.mountedWeapons.forEach(mw => mw.render(this.ctx));
    
    // Draw pickups
    this.pickups.forEach(p => p.render(this.ctx));
    
    // Phase 2: Draw coin pickups
    this.coinPickups.forEach(coin => coin.render(this.ctx));
    
    // Phase 2: Draw shop vendor
    if (this.shopVendor && this.shopVendor.active) {
      this.shopVendor.render(this.ctx);
    }
    
    // Draw player
    if (this.player && this.player.active) {
      this.player.render(this.ctx);
    }
    
    // Phase 4: Draw ghost replay in Time Attack mode
    if (this.mode === 'timeattack' && this.timeAttackMode && this.timeAttackMode.active) {
      this.renderTimeAttackGhost(this.ctx);
    }
    
    // Draw enemies
    this.enemies.forEach(e => e.render(this.ctx));
    
    // Draw projectiles
    this.projectiles.forEach(p => p.render(this.ctx));
    
    // Draw particles
    this.particleSystem.render(this.ctx);
    
    // Phase 3: Draw weather effects (over everything)
    if (this.weatherSystem) {
      this.weatherSystem.render(this.ctx, this.camera);
    }
    
    // Reset camera transform
    this.camera.reset(this.ctx);
    
    // Phase 3: Draw time of day overlay (after camera reset, affects whole screen)
    if (this.timeOfDaySystem) {
      this.timeOfDaySystem.render(this.ctx, this.player, this.camera);
    }
    
    // Apply level theme color grading (vignette, tint, brightness)
    if (this.levelThemeSystem && this.levelThemeSystem.getCurrentTheme()) {
      this.levelThemeSystem.applyColorGrading(this.ctx);
    }
  }
  
  renderCutscene() {
    // Apply cutscene camera transform
    this.cutsceneManager.applyCameraTransform(this.ctx);
    
    // Use level theme system if available
    if (this.levelThemeSystem && this.levelThemeSystem.getCurrentTheme()) {
      this.levelThemeSystem.renderSky(this.ctx, this.worldWidth, this.groundLevel, this.camera);
      this.levelThemeSystem.renderParallaxLayers(this.ctx, this.worldWidth, this.groundLevel, this.camera);
      this.levelThemeSystem.renderLandmarks(this.ctx, this.groundLevel, this.camera);
      this.levelThemeSystem.renderGround(this.ctx, this.worldWidth, this.worldHeight, this.groundLevel);
    } else {
      this.draw16BitSky();
      this.draw16BitMountains();
      this.draw16BitBuildings();
      this.draw16BitGround();
    }
    
    // Draw terrain
    this.slopes.forEach(s => s.render(this.ctx));
    this.platforms.forEach(p => p.render(this.ctx));
    this.covers.forEach(c => c.render(this.ctx));
    
    // Draw player (dimmed during cutscene)
    if (this.player && this.player.active) {
      this.ctx.globalAlpha = 0.7;
      this.player.render(this.ctx);
      this.ctx.globalAlpha = 1.0;
    }
    
    // Draw enemies (bosses featured prominently)
    this.enemies.forEach(e => e.render(this.ctx));
    
    // Reset camera transform
    this.cutsceneManager.resetCameraTransform(this.ctx);
    
    // Draw cutscene UI elements (subtitles, skip prompt, letterbox)
    this.cutsceneManager.render(this.ctx);
  }
  
  /**
   * Render the level transition (player walking off-screen)
   */
  renderLevelTransition() {
    // Apply camera transform
    this.camera.apply(this.ctx);
    
    // Use level theme system if available
    if (this.levelThemeSystem && this.levelThemeSystem.getCurrentTheme()) {
      this.levelThemeSystem.renderSky(this.ctx, this.worldWidth, this.groundLevel, this.camera);
      this.levelThemeSystem.renderParallaxLayers(this.ctx, this.worldWidth, this.groundLevel, this.camera);
      this.levelThemeSystem.renderLandmarks(this.ctx, this.groundLevel, this.camera);
      this.levelThemeSystem.renderGround(this.ctx, this.worldWidth, this.worldHeight, this.groundLevel);
    } else {
      this.draw16BitSky();
      this.draw16BitMountains();
      this.draw16BitBuildings();
      this.draw16BitGround();
    }
    
    // Draw terrain
    this.slopes.forEach(s => s.render(this.ctx));
    this.platforms.forEach(p => p.render(this.ctx));
    this.covers.forEach(c => c.render(this.ctx));
    
    // Draw pickups
    this.pickups.forEach(p => p.render(this.ctx));
    
    // Draw player (walking animation)
    if (this.player && this.player.active) {
      this.player.render(this.ctx);
    }
    
    // Reset camera transform
    this.camera.reset(this.ctx);
    
    // Draw transition UI overlay
    this.renderLevelTransitionUI();
  }
  
  /**
   * Render level transition UI elements
   */
  renderLevelTransitionUI() {
    this.ctx.save();
    
    // Cinematic letterbox bars
    const barHeight = 50;
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    this.ctx.fillRect(0, 0, this.canvas.width, barHeight);
    this.ctx.fillRect(0, this.canvas.height - barHeight, this.canvas.width, barHeight);
    
    // "Continuing..." text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 24px monospace';
    this.ctx.textAlign = 'center';
    
    // Pulsing animation for text
    const pulse = Math.sin(Date.now() / 300) * 0.2 + 0.8;
    this.ctx.globalAlpha = pulse;
    
    this.ctx.fillText(`LEVEL ${this.currentLevel} COMPLETE`, this.canvas.width / 2, this.canvas.height / 2 - 50);
    
    this.ctx.font = '18px monospace';
    this.ctx.fillStyle = '#ffaa00';
    
    // Show next level info (array is 0-indexed, currentLevel is 1-indexed)
    if (this.currentLevel < this.maxLevel) {
      const nextLevelIndex = this.currentLevel; // Next level index (0-indexed for current level + 1)
      const nextLevelName = GameConfig.CAMPAIGN_LEVELS[nextLevelIndex]?.name || `Level ${this.currentLevel + 1}`;
      this.ctx.fillText(`Proceeding to: ${nextLevelName}`, this.canvas.width / 2, this.canvas.height / 2);
    }
    
    this.ctx.globalAlpha = 1.0;
    this.ctx.restore();
  }
  
  // 16-bit arcade style sky with dithered gradient
  draw16BitSky() {
    // Base sky colors - classic 16-bit palette
    const skyTop = '#4a5f7f';
    const skyMid = '#6a7f9f';
    const skyBottom = '#8a9fbf';
    
    // Draw gradient bands
    const bandHeight = Math.floor(this.groundLevel / 3);
    this.ctx.fillStyle = skyTop;
    this.ctx.fillRect(0, 0, this.worldWidth, bandHeight);
    this.ctx.fillStyle = skyMid;
    this.ctx.fillRect(0, bandHeight, this.worldWidth, bandHeight);
    this.ctx.fillStyle = skyBottom;
    this.ctx.fillRect(0, bandHeight * 2, this.worldWidth, this.groundLevel - bandHeight * 2);
    
    // Add dithering pattern between bands for 16-bit feel
    this.ctx.fillStyle = skyMid;
    for (let x = 0; x < this.worldWidth; x += 4) {
      for (let y = bandHeight - 8; y < bandHeight + 8; y += 4) {
        if ((x + y) % 8 === 0) {
          this.ctx.fillRect(x, y, 2, 2);
        }
      }
    }
    this.ctx.fillStyle = skyBottom;
    for (let x = 0; x < this.worldWidth; x += 4) {
      for (let y = bandHeight * 2 - 8; y < bandHeight * 2 + 8; y += 4) {
        if ((x + y) % 8 === 0) {
          this.ctx.fillRect(x, y, 2, 2);
        }
      }
    }
    
    // Add clouds (16-bit pixel style)
    const cameraOffset = this.camera.x * 0.1; // Slow parallax
    this.ctx.fillStyle = '#9fb0cf';
    for (let i = 0; i < 8; i++) {
      const cloudX = (i * 400 - cameraOffset) % this.worldWidth;
      const cloudY = 50 + (i % 3) * 40;
      // Pixelated cloud shape
      this.ctx.fillRect(cloudX, cloudY, 48, 8);
      this.ctx.fillRect(cloudX + 8, cloudY - 8, 32, 8);
      this.ctx.fillRect(cloudX + 16, cloudY - 16, 16, 8);
      this.ctx.fillRect(cloudX - 8, cloudY + 8, 64, 8);
    }
  }
  
  // 16-bit arcade style distant mountains
  draw16BitMountains() {
    const cameraOffset = this.camera.x * 0.15; // Parallax effect
    
    // Mountain colors - darker for distance
    const mountainDark = '#2d3d4d';
    const mountainMid = '#3d4d5d';
    const mountainLight = '#4d5d6d';
    
    // Draw multiple mountain layers
    for (let layer = 0; layer < 2; layer++) {
      const baseY = this.groundLevel - 80 - layer * 20;
      const color = layer === 0 ? mountainDark : mountainMid;
      this.ctx.fillStyle = color;
      
      for (let i = 0; i < this.worldWidth / 200; i++) {
        const x = (i * 200 - cameraOffset * (1 + layer * 0.5)) % this.worldWidth;
        const peakHeight = 60 + Math.sin(i * 1.5) * 20;
        
        // Draw pixelated mountain peak
        for (let h = 0; h < peakHeight; h += 4) {
          const width = (peakHeight - h) * 1.5;
          this.ctx.fillRect(x - width / 2, baseY - h, width, 4);
        }
        
        // Add highlights on peaks
        if (layer === 1) {
          this.ctx.fillStyle = mountainLight;
          for (let h = peakHeight - 12; h < peakHeight; h += 4) {
            const width = (peakHeight - h) * 0.7;
            this.ctx.fillRect(x - width / 2, baseY - h, Math.max(4, width / 2), 4);
          }
          this.ctx.fillStyle = color;
        }
      }
    }
  }
  
  // 16-bit arcade style buildings/structures
  draw16BitBuildings() {
    const cameraOffset = this.camera.x * 0.3; // Mid-range parallax
    
    // Building colors
    const buildingBase = '#3a4a3a';
    const buildingDark = '#2a3a2a';
    const buildingWindow = '#5a6a5a';
    const buildingLight = '#4a5a4a';
    
    this.ctx.fillStyle = buildingBase;
    
    for (let i = 0; i < this.worldWidth / 150; i++) {
      const x = (i * 150 - cameraOffset) % this.worldWidth;
      const baseY = this.groundLevel - 40;
      const buildingHeight = 80 + (i % 4) * 20;
      const buildingWidth = 60 + (i % 3) * 20;
      
      // Main building structure
      this.ctx.fillStyle = buildingBase;
      this.ctx.fillRect(x, baseY - buildingHeight, buildingWidth, buildingHeight);
      
      // Building shadow/depth
      this.ctx.fillStyle = buildingDark;
      this.ctx.fillRect(x + buildingWidth - 8, baseY - buildingHeight, 8, buildingHeight);
      
      // Windows (16-bit style grid)
      this.ctx.fillStyle = buildingWindow;
      for (let wy = 0; wy < buildingHeight - 20; wy += 16) {
        for (let wx = 8; wx < buildingWidth - 16; wx += 12) {
          this.ctx.fillRect(x + wx, baseY - buildingHeight + wy + 10, 6, 8);
        }
      }
      
      // Building top detail
      this.ctx.fillStyle = buildingLight;
      this.ctx.fillRect(x, baseY - buildingHeight, buildingWidth, 4);
    }
  }
  
  // 16-bit arcade style ground with detailed tiles
  draw16BitGround() {
    const groundBase = '#4a4a3a';
    const groundDark = '#3a3a2a';
    const groundLight = '#5a5a4a';
    const grassGreen = '#4a5a3a';
    const grassDark = '#3a4a2a';
    
    // Base ground
    this.ctx.fillStyle = groundBase;
    this.ctx.fillRect(0, this.groundLevel, this.worldWidth, this.worldHeight - this.groundLevel);
    
    // Ground tile pattern (16-bit style)
    this.ctx.fillStyle = groundDark;
    for (let x = 0; x < this.worldWidth; x += 32) {
      for (let y = this.groundLevel + 8; y < this.worldHeight; y += 16) {
        // Create brick/tile pattern
        const offset = (Math.floor(y / 16) % 2) * 16;
        this.ctx.fillRect(x + offset, y, 28, 2);
        this.ctx.fillRect(x + offset, y, 2, 14);
      }
    }
    
    // Ground highlights
    this.ctx.fillStyle = groundLight;
    for (let x = 0; x < this.worldWidth; x += 32) {
      for (let y = this.groundLevel + 8; y < this.worldHeight; y += 16) {
        const offset = (Math.floor(y / 16) % 2) * 16;
        if ((x + y) % 64 === 0) {
          this.ctx.fillRect(x + offset + 2, y + 2, 4, 4);
        }
      }
    }
    
    // Top ground detail line
    this.ctx.fillStyle = groundLight;
    this.ctx.fillRect(0, this.groundLevel, this.worldWidth, 2);
    
    // Grass/vegetation on ground edge (pixel style)
    for (let x = 0; x < this.worldWidth; x += 8) {
      const grassHeight = 4 + (Math.sin(x * 0.1) * 2);
      const useGrass = Math.sin(x * 0.3) > -0.5;
      
      if (useGrass) {
        this.ctx.fillStyle = grassGreen;
        // Grass blade
        this.ctx.fillRect(x, this.groundLevel - grassHeight, 3, grassHeight);
        this.ctx.fillRect(x + 1, this.groundLevel - grassHeight - 2, 1, 2);
        
        // Grass shadow
        this.ctx.fillStyle = grassDark;
        this.ctx.fillRect(x + 2, this.groundLevel - grassHeight, 1, grassHeight);
      } else {
        // Small rocks/debris
        this.ctx.fillStyle = groundDark;
        this.ctx.fillRect(x, this.groundLevel - 2, 4, 2);
      }
    }
  }

  gameLoop(timestamp) {
    try {
      const deltaTime = timestamp - this.lastTime;
      this.lastTime = timestamp;
      this.currentTime = timestamp;
      
      // Calculate FPS
      if (deltaTime > 0) {
        this.fpsFrames.push(1000 / deltaTime);
        if (this.fpsFrames.length > 60) this.fpsFrames.shift();
        if (timestamp - this.fpsUpdateTime > 500) {
          this.fps = Math.round(this.fpsFrames.reduce((a, b) => a + b, 0) / this.fpsFrames.length);
          this.fpsUpdateTime = timestamp;
        }
      }
      
      // Handle input
      this.handleInput();
      
      // Update game
      this.update(deltaTime);
      
      // Render game
      this.render();
      
      // Clear pressed keys for next frame
      this.inputManager.clearPressedKeys();
    } catch (error) {
      console.error('Game loop error:', error);
      // Continue running even if there's an error
    }
    
    // Continue loop
    requestAnimationFrame((time) => this.gameLoop(time));
  }
}
