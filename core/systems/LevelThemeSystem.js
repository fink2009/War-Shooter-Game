/**
 * LevelThemeSystem - Manages per-level visual themes
 * Merges biome configuration with level-specific visual profiles
 * Provides unified theme object for rendering sky, ground, parallax, and props
 */
class LevelThemeSystem {
  constructor() {
    this.currentTheme = null;
    this.currentLevelIndex = -1;
    this.parallaxElements = [];
    this.foregroundProps = [];
    this.landmarks = [];
    this.animationTime = 0;
  }

  /**
   * Initialize the theme system for a specific level
   * @param {number} levelIndex - 0-based level index
   */
  init(levelIndex) {
    this.currentLevelIndex = levelIndex;
    this.currentTheme = this.getLevelTheme(levelIndex);
    this.generateParallaxElements();
    this.generateForegroundProps();
    this.generateLandmarks();
    this.animationTime = 0;
  }

  /**
   * Get the merged theme for a specific level
   * @param {number} levelIndex - 0-based level index
   * @returns {Object} Complete theme object for rendering
   */
  getLevelTheme(levelIndex) {
    // Get level configuration
    const levels = GameConfig.CAMPAIGN_LEVELS;
    if (levelIndex < 0 || levelIndex >= levels.length) {
      return this.getDefaultTheme();
    }

    const levelConfig = levels[levelIndex];
    const biomeKey = levelConfig.biome || 'DEFAULT';
    const biome = GameConfig.BIOMES[biomeKey] || GameConfig.BIOMES.DEFAULT;
    const visualProfile = levelConfig.visualProfile || {};

    // Get sky variant colors
    const skyVariant = this.getSkyVariant(visualProfile.skyVariant);

    // Merge biome with visual profile
    const theme = {
      // Level info
      levelIndex: levelIndex,
      levelName: levelConfig.name,
      act: levelConfig.act,
      isBoss: levelConfig.isBoss || false,
      biomeKey: biomeKey,

      // Sky colors (from sky variant or biome)
      skyTop: skyVariant?.skyTop || biome.skyTop,
      skyMid: skyVariant?.skyMid || biome.skyMid,
      skyBottom: skyVariant?.skyBottom || biome.skyBottom,
      skyVariant: visualProfile.skyVariant || 'default',
      skyEffects: this.getSkyEffects(skyVariant),

      // Ground colors (from biome)
      groundBase: biome.groundBase,
      groundDark: biome.groundDark,
      groundLight: biome.groundLight,
      grassColor: biome.grassColor,

      // Visual profile properties
      parallaxLayers: visualProfile.parallaxLayers || [],
      foregroundProps: visualProfile.foregroundProps || [],
      silhouetteStyle: visualProfile.silhouetteStyle || 'default',
      groundShapeProfile: visualProfile.groundShapeProfile || 'flat_training_range',
      platformDensity: visualProfile.platformDensity || 0.3,
      landmarkCount: visualProfile.landmarkCount || 1,
      clutterDensity: visualProfile.clutterDensity || 0.3,

      // Color grading
      colorGrading: visualProfile.colorGrading || { brightness: 1.0, warmth: 0 },

      // Weather and time overrides
      weatherOverride: visualProfile.weatherOverride || null,
      timeOfDayOverride: visualProfile.timeOfDayOverride || null,

      // Boss arena features
      bossArenaFeatures: visualProfile.bossArenaFeatures || {},

      // Biome properties
      biomeElements: biome.elements || [],
      biomeHazards: biome.hazards || [],
      biomeTint: biome.tint || null,
      isIndoor: biome.isIndoor || false
    };

    return theme;
  }

  /**
   * Get sky variant configuration
   * @param {string} variantKey - Sky variant key
   * @returns {Object|null} Sky variant config or null
   */
  getSkyVariant(variantKey) {
    if (!variantKey || !GameConfig.SKY_VARIANTS) {
      return null;
    }
    return GameConfig.SKY_VARIANTS[variantKey] || null;
  }

  /**
   * Get sky effects based on variant
   * @param {Object} skyVariant - Sky variant config
   * @returns {Object} Sky effects configuration
   */
  getSkyEffects(skyVariant) {
    if (!skyVariant) {
      return { sunGlow: false, clouds: true };
    }

    return {
      sunGlow: skyVariant.sunGlow || false,
      sunPosition: skyVariant.sunPosition || 0.5,
      sunColor: skyVariant.sunColor || '#ffff88',
      cloudColor: skyVariant.cloudColor || '#a0b0c0',
      lightningFlashes: skyVariant.lightningFlashes || false,
      darkClouds: skyVariant.darkClouds || false,
      heavyClouds: skyVariant.heavyClouds || false,
      dustHaze: skyVariant.dustHaze || false,
      smogLayer: skyVariant.smogLayer || false,
      fireGlow: skyVariant.fireGlow || false,
      fallingEmbers: skyVariant.fallingEmbers || false,
      heatHaze: skyVariant.heatHaze || false,
      auroraEffect: skyVariant.auroraEffect || false,
      neonGlow: skyVariant.neonGlow || false,
      electricBlue: skyVariant.electricBlue || false
    };
  }

  /**
   * Get default theme when no level is specified
   * @returns {Object} Default theme
   */
  getDefaultTheme() {
    const biome = GameConfig.BIOMES.DEFAULT;
    return {
      levelIndex: -1,
      levelName: 'Default',
      act: 0,
      isBoss: false,
      biomeKey: 'DEFAULT',
      skyTop: biome.skyTop,
      skyMid: biome.skyMid,
      skyBottom: biome.skyBottom,
      skyVariant: 'default',
      skyEffects: { sunGlow: false, clouds: true },
      groundBase: biome.groundBase,
      groundDark: biome.groundDark,
      groundLight: biome.groundLight,
      grassColor: biome.grassColor,
      parallaxLayers: [],
      foregroundProps: [],
      silhouetteStyle: 'default',
      groundShapeProfile: 'flat_training_range',
      platformDensity: 0.3,
      landmarkCount: 1,
      clutterDensity: 0.3,
      colorGrading: { brightness: 1.0, warmth: 0 },
      weatherOverride: null,
      timeOfDayOverride: null,
      bossArenaFeatures: {},
      biomeElements: [],
      biomeHazards: [],
      biomeTint: null,
      isIndoor: false
    };
  }

  /**
   * Get environment settings (weather, time of day) for current level
   * @returns {Object} Environment settings
   */
  getLevelEnvironmentSettings() {
    if (!this.currentTheme) {
      return {
        weather: 'CLEAR',
        timeOfDay: 'DAY'
      };
    }

    const biome = GameConfig.BIOMES[this.currentTheme.biomeKey] || GameConfig.BIOMES.DEFAULT;
    const weatherKey = this.currentTheme.weatherOverride || biome.weather || 'CLEAR';
    const timeKey = this.currentTheme.timeOfDayOverride || 'DAY';

    return {
      biome: biome,
      weather: weatherKey,
      timeOfDay: timeKey,
      weatherConfig: GameConfig.WEATHER ? GameConfig.WEATHER[weatherKey] : null,
      timeOfDayConfig: GameConfig.TIME_OF_DAY ? GameConfig.TIME_OF_DAY[timeKey] : null
    };
  }

  /**
   * Generate parallax background elements based on theme
   */
  generateParallaxElements() {
    this.parallaxElements = [];
    if (!this.currentTheme || !GameConfig.PARALLAX_LAYERS) return;

    const worldWidth = GameConfig.WORLD_WIDTH || 3000;

    this.currentTheme.parallaxLayers.forEach((layerKey, layerIndex) => {
      const layerConfig = GameConfig.PARALLAX_LAYERS[layerKey];
      if (!layerConfig) return;

      // Generate multiple instances of this layer across the world
      const spacing = 150 + Math.random() * 100;
      const count = Math.ceil(worldWidth / spacing) + 2;

      for (let i = 0; i < count; i++) {
        this.parallaxElements.push({
          layerKey: layerKey,
          config: layerConfig,
          x: i * spacing + (Math.random() - 0.5) * 50,
          y: 0, // Will be set during render based on ground level
          scale: 0.8 + Math.random() * 0.4,
          variant: Math.floor(Math.random() * 3),
          speed: layerConfig.speed || 0.1,
          animationOffset: Math.random() * Math.PI * 2
        });
      }
    });

    // Sort by speed (slowest/furthest first)
    this.parallaxElements.sort((a, b) => a.speed - b.speed);
  }

  /**
   * Generate foreground prop elements based on theme
   */
  generateForegroundProps() {
    this.foregroundProps = [];
    if (!this.currentTheme || !GameConfig.FOREGROUND_PROPS) return;

    const worldWidth = GameConfig.WORLD_WIDTH || 3000;
    const clutterDensity = this.currentTheme.clutterDensity || 0.3;
    const propCount = Math.floor(clutterDensity * 30);

    const propKeys = this.currentTheme.foregroundProps;
    if (!propKeys || propKeys.length === 0) return;

    for (let i = 0; i < propCount; i++) {
      const propKey = propKeys[Math.floor(Math.random() * propKeys.length)];
      const propConfig = GameConfig.FOREGROUND_PROPS[propKey];
      if (!propConfig) continue;

      this.foregroundProps.push({
        propKey: propKey,
        config: propConfig,
        x: 100 + Math.random() * (worldWidth - 200),
        y: 0, // Will be set during render based on ground level
        scale: 0.9 + Math.random() * 0.2,
        variant: Math.floor(Math.random() * 3),
        animationOffset: Math.random() * Math.PI * 2
      });
    }

    // Sort by x position
    this.foregroundProps.sort((a, b) => a.x - b.x);
  }

  /**
   * Generate landmark elements based on theme
   */
  generateLandmarks() {
    this.landmarks = [];
    if (!this.currentTheme) return;

    const worldWidth = GameConfig.WORLD_WIDTH || 3000;
    const landmarkCount = this.currentTheme.landmarkCount || 1;
    const silhouetteStyle = this.currentTheme.silhouetteStyle || 'default';

    // Generate landmark positions spread across the level
    for (let i = 0; i < landmarkCount; i++) {
      const segmentWidth = worldWidth / (landmarkCount + 1);
      const x = segmentWidth * (i + 1) + (Math.random() - 0.5) * segmentWidth * 0.5;

      this.landmarks.push({
        x: x,
        y: 0,
        type: this.getLandmarkType(silhouetteStyle, i),
        scale: 1.0 + Math.random() * 0.3,
        variant: i % 3
      });
    }
  }

  /**
   * Get landmark type based on silhouette style
   * @param {string} silhouetteStyle - Silhouette style key
   * @param {number} index - Landmark index
   * @returns {string} Landmark type
   */
  getLandmarkType(silhouetteStyle, index) {
    const landmarkTypes = {
      'soft_rolling_hills': ['radio_tower', 'water_tower', 'tree_cluster'],
      'gentle_slopes': ['crashed_helicopter', 'bunker', 'watchtower'],
      'jagged_peaks': ['dark_fortress', 'skull_monument', 'war_banner_pole'],
      'cratered_battlefield': ['destroyed_tank', 'artillery_piece', 'bombed_building'],
      'urban_ruins': ['collapsed_building', 'bridge_ruin', 'crane'],
      'devastation_zone': ['burning_tank', 'crashed_plane', 'giant_crater'],
      'city_skyline': ['skyscraper_ruin', 'billboard', 'overpass'],
      'industrial_pipes': ['cooling_tower', 'factory_chimney', 'crane'],
      'mechanical_horror': ['giant_robot', 'tesla_tower', 'reactor_dome'],
      'dark_fortress': ['dark_citadel', 'throne', 'war_monument'],
      'rolling_dunes': ['oasis', 'ancient_ruin', 'camel_caravan'],
      'desert_wasteland': ['giant_skull', 'buried_ship', 'sandstone_arch'],
      'ice_peaks': ['ice_bridge', 'frozen_waterfall', 'ice_cave'],
      'ice_citadel': ['frost_throne', 'ice_monument', 'frozen_giant'],
      'downtown_night': ['neon_sign', 'water_tower', 'rooftop_garden'],
      'rooftop_maze': ['ac_cluster', 'satellite_array', 'helipad'],
      'clinical_corridors': ['specimen_tank', 'server_rack', 'containment_unit'],
      'reactor_chamber': ['reactor_core', 'control_tower', 'coolant_tanks'],
      'forest_depths': ['ancient_tree', 'stone_circle', 'waterfall'],
      'infernal_cathedral': ['demon_statue', 'lava_fountain', 'bone_altar']
    };

    const types = landmarkTypes[silhouetteStyle] || ['generic_structure'];
    return types[index % types.length];
  }

  /**
   * Update animation time
   * @param {number} deltaTime - Time since last update in ms
   */
  update(deltaTime) {
    this.animationTime += deltaTime;
  }

  /**
   * Render the themed sky
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} worldWidth - World width
   * @param {number} groundLevel - Ground Y position
   * @param {Object} camera - Camera object
   */
  renderSky(ctx, worldWidth, groundLevel, camera) {
    if (!this.currentTheme) return;

    const cameraX = camera ? camera.x : 0;
    const theme = this.currentTheme;
    const effects = theme.skyEffects;

    // Apply color grading
    const grading = theme.colorGrading;

    // Draw gradient bands
    const bandHeight = Math.floor(groundLevel / 3);

    // Apply warmth tint to colors
    const adjustColor = (hex, warmth) => {
      if (!warmth) return hex;
      const rgb = this.hexToRgb(hex);
      rgb.r = Math.min(255, Math.max(0, rgb.r + warmth * 30));
      rgb.b = Math.min(255, Math.max(0, rgb.b - warmth * 20));
      return this.rgbToHex(rgb.r, rgb.g, rgb.b);
    };

    const skyTop = adjustColor(theme.skyTop, grading.warmth);
    const skyMid = adjustColor(theme.skyMid, grading.warmth);
    const skyBottom = adjustColor(theme.skyBottom, grading.warmth);

    ctx.fillStyle = skyTop;
    ctx.fillRect(0, 0, worldWidth, bandHeight);
    ctx.fillStyle = skyMid;
    ctx.fillRect(0, bandHeight, worldWidth, bandHeight);
    ctx.fillStyle = skyBottom;
    ctx.fillRect(0, bandHeight * 2, worldWidth, groundLevel - bandHeight * 2);

    // Add dithering between bands for 16-bit feel
    this.renderSkyDithering(ctx, skyMid, skyBottom, bandHeight, worldWidth);

    // Render sky effects
    this.renderSkyEffects(ctx, worldWidth, groundLevel, cameraX, effects);

    // Render clouds
    this.renderClouds(ctx, worldWidth, cameraX, effects);
  }

  /**
   * Render dithering between sky bands
   */
  renderSkyDithering(ctx, skyMid, skyBottom, bandHeight, worldWidth) {
    ctx.fillStyle = skyMid;
    for (let x = 0; x < worldWidth; x += 4) {
      for (let y = bandHeight - 8; y < bandHeight + 8; y += 4) {
        if ((x + y) % 8 === 0) {
          ctx.fillRect(x, y, 2, 2);
        }
      }
    }
    ctx.fillStyle = skyBottom;
    for (let x = 0; x < worldWidth; x += 4) {
      for (let y = bandHeight * 2 - 8; y < bandHeight * 2 + 8; y += 4) {
        if ((x + y) % 8 === 0) {
          ctx.fillRect(x, y, 2, 2);
        }
      }
    }
  }

  /**
   * Render sky effects (sun, glow, etc.)
   */
  renderSkyEffects(ctx, worldWidth, groundLevel, cameraX, effects) {
    // Sun glow
    if (effects.sunGlow) {
      const sunX = worldWidth * effects.sunPosition - cameraX * 0.05;
      const sunY = 80;
      const gradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 120);
      gradient.addColorStop(0, effects.sunColor || '#ffff88');
      gradient.addColorStop(0.3, 'rgba(255, 220, 150, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(sunX - 150, sunY - 100, 300, 200);
    }

    // Fire glow (for hell/apocalyptic themes)
    if (effects.fireGlow) {
      ctx.save();
      ctx.globalAlpha = 0.3 + Math.sin(this.animationTime / 200) * 0.1;
      const gradient = ctx.createLinearGradient(0, groundLevel, 0, 0);
      gradient.addColorStop(0, 'rgba(255, 100, 0, 0.4)');
      gradient.addColorStop(0.5, 'rgba(255, 50, 0, 0.1)');
      gradient.addColorStop(1, 'rgba(100, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, worldWidth, groundLevel);
      ctx.restore();
    }

    // Lightning flashes
    if (effects.lightningFlashes && Math.random() < 0.002) {
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = effects.electricBlue ? '#4488ff' : '#ffffff';
      ctx.fillRect(0, 0, worldWidth, groundLevel);
      ctx.restore();
    }

    // Heat haze effect
    if (effects.heatHaze) {
      // Subtle wavy distortion would need shader; approximate with overlay
      ctx.save();
      ctx.globalAlpha = 0.05 + Math.sin(this.animationTime / 300) * 0.02;
      ctx.fillStyle = '#ffeecc';
      ctx.fillRect(0, groundLevel - 100, worldWidth, 100);
      ctx.restore();
    }

    // Aurora effect
    if (effects.auroraEffect) {
      this.renderAurora(ctx, worldWidth, cameraX);
    }

    // Neon glow (city night)
    if (effects.neonGlow) {
      ctx.save();
      ctx.globalAlpha = 0.15 + Math.sin(this.animationTime / 500) * 0.05;
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(0, groundLevel - 150, worldWidth, 50);
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(0, groundLevel - 100, worldWidth, 50);
      ctx.restore();
    }
  }

  /**
   * Render aurora borealis effect
   */
  renderAurora(ctx, worldWidth, cameraX) {
    ctx.save();
    const time = this.animationTime / 1000;
    
    for (let i = 0; i < 5; i++) {
      const waveOffset = Math.sin(time * 0.3 + i) * 30;
      const y = 50 + i * 20 + waveOffset;
      const alpha = 0.1 + Math.sin(time + i) * 0.05;
      
      ctx.globalAlpha = alpha;
      const hue = (120 + i * 30 + time * 10) % 360;
      ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
      
      ctx.beginPath();
      ctx.moveTo(-cameraX * 0.02, y);
      for (let x = 0; x < worldWidth; x += 50) {
        const waveY = y + Math.sin((x + time * 50) / 100) * 15;
        ctx.lineTo(x - cameraX * 0.02, waveY);
      }
      ctx.lineTo(worldWidth - cameraX * 0.02, y + 30);
      ctx.lineTo(-cameraX * 0.02, y + 30);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Render clouds
   */
  renderClouds(ctx, worldWidth, cameraX, effects) {
    const cloudColor = effects.cloudColor || '#9fb0cf';
    const darkClouds = effects.darkClouds || effects.heavyClouds;
    
    ctx.fillStyle = darkClouds ? '#4a5a6a' : cloudColor;
    
    for (let i = 0; i < 8; i++) {
      const cloudX = (i * 400 - cameraX * 0.1) % worldWidth;
      const cloudY = 50 + (i % 3) * 40;
      
      // Pixelated cloud shape
      ctx.fillRect(cloudX, cloudY, 48, 8);
      ctx.fillRect(cloudX + 8, cloudY - 8, 32, 8);
      ctx.fillRect(cloudX + 16, cloudY - 16, 16, 8);
      ctx.fillRect(cloudX - 8, cloudY + 8, 64, 8);
    }
  }

  /**
   * Render parallax mountain/building silhouettes
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} worldWidth - World width
   * @param {number} groundLevel - Ground Y position
   * @param {Object} camera - Camera object
   */
  renderParallaxLayers(ctx, worldWidth, groundLevel, camera) {
    const cameraX = camera ? camera.x : 0;

    this.parallaxElements.forEach(element => {
      const screenX = element.x - cameraX * element.speed;
      
      // Skip if off-screen
      if (screenX < -200 || screenX > ctx.canvas.width + 200) return;

      this.renderParallaxElement(ctx, element, screenX, groundLevel);
    });
  }

  /**
   * Render a single parallax element
   */
  renderParallaxElement(ctx, element, screenX, groundLevel) {
    const config = element.config;
    const scale = element.scale;
    const baseY = groundLevel - 40;

    ctx.save();

    switch (config.type) {
      case 'silhouette':
        this.renderSilhouette(ctx, screenX, baseY, config, scale, element.variant);
        break;
      case 'structure':
        this.renderStructure(ctx, screenX, baseY, config, scale, element.variant);
        break;
      case 'debris':
        this.renderDebris(ctx, screenX, baseY, config, scale);
        break;
      case 'effect':
        this.renderEffect(ctx, screenX, baseY, config, scale, element.animationOffset);
        break;
      case 'props':
        this.renderProps(ctx, screenX, baseY, config, scale, element.variant);
        break;
    }

    ctx.restore();
  }

  /**
   * Render silhouette element (mountains, buildings, etc.)
   */
  renderSilhouette(ctx, x, baseY, config, scale, variant) {
    ctx.fillStyle = config.color || '#2a3a4a';
    
    const heightVariation = config.heightVariation || 'rolling';
    const peakHeight = 60 + variant * 20;
    
    // Draw based on height variation type
    switch (heightVariation) {
      case 'jagged':
        this.drawJaggedPeaks(ctx, x, baseY, peakHeight * scale);
        break;
      case 'tall_buildings':
      case 'urban_ruins':
      case 'city_night':
        this.drawBuildingSilhouette(ctx, x, baseY, peakHeight * scale * 1.5, variant);
        break;
      case 'dunes':
      case 'massive_dunes':
        this.drawDuneSilhouette(ctx, x, baseY, peakHeight * scale);
        break;
      case 'ice_peaks':
        this.drawIcePeaks(ctx, x, baseY, peakHeight * scale);
        break;
      case 'tall_trees':
      case 'forest_hills':
        this.drawTreeSilhouette(ctx, x, baseY, peakHeight * scale);
        break;
      default:
        this.drawRollingHills(ctx, x, baseY, peakHeight * scale);
    }
  }

  /**
   * Draw rolling hills silhouette
   */
  drawRollingHills(ctx, x, baseY, height) {
    ctx.beginPath();
    ctx.moveTo(x - 50, baseY);
    ctx.quadraticCurveTo(x, baseY - height, x + 50, baseY);
    ctx.fill();
  }

  /**
   * Draw jagged peaks silhouette
   */
  drawJaggedPeaks(ctx, x, baseY, height) {
    ctx.beginPath();
    ctx.moveTo(x - 40, baseY);
    ctx.lineTo(x - 20, baseY - height * 0.6);
    ctx.lineTo(x, baseY - height);
    ctx.lineTo(x + 15, baseY - height * 0.7);
    ctx.lineTo(x + 40, baseY);
    ctx.fill();
  }

  /**
   * Draw building silhouette
   */
  drawBuildingSilhouette(ctx, x, baseY, height, variant) {
    const width = 40 + variant * 10;
    ctx.fillRect(x, baseY - height, width, height);
    
    // Add windows
    ctx.fillStyle = '#1a1a2a';
    for (let wy = 0; wy < height - 10; wy += 15) {
      for (let wx = 5; wx < width - 5; wx += 10) {
        if (Math.random() > 0.3) {
          ctx.fillRect(x + wx, baseY - height + wy + 5, 6, 8);
        }
      }
    }
  }

  /**
   * Draw dune silhouette
   */
  drawDuneSilhouette(ctx, x, baseY, height) {
    ctx.beginPath();
    ctx.moveTo(x - 60, baseY);
    ctx.quadraticCurveTo(x - 20, baseY - height, x + 20, baseY - height * 0.3);
    ctx.quadraticCurveTo(x + 60, baseY - height * 0.5, x + 80, baseY);
    ctx.fill();
  }

  /**
   * Draw ice peak silhouette
   */
  drawIcePeaks(ctx, x, baseY, height) {
    ctx.beginPath();
    ctx.moveTo(x - 30, baseY);
    ctx.lineTo(x - 10, baseY - height * 0.8);
    ctx.lineTo(x + 5, baseY - height);
    ctx.lineTo(x + 20, baseY - height * 0.7);
    ctx.lineTo(x + 40, baseY);
    ctx.fill();
    
    // Add ice highlight
    ctx.fillStyle = 'rgba(200, 220, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(x, baseY - height * 0.9);
    ctx.lineTo(x + 5, baseY - height);
    ctx.lineTo(x + 10, baseY - height * 0.85);
    ctx.fill();
  }

  /**
   * Draw tree silhouette
   */
  drawTreeSilhouette(ctx, x, baseY, height) {
    // Trunk
    ctx.fillRect(x, baseY - height * 0.4, 8, height * 0.4);
    
    // Foliage
    ctx.beginPath();
    ctx.arc(x + 4, baseY - height * 0.6, 25, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Render structure element
   */
  renderStructure(ctx, x, baseY, config, scale, variant) {
    ctx.fillStyle = config.color || '#3a4a5a';
    
    const elements = config.elements || ['structure'];
    const element = elements[variant % elements.length];
    
    switch (element) {
      case 'tower':
      case 'antenna':
      case 'radio_tower':
        this.drawTower(ctx, x, baseY, 80 * scale);
        break;
      case 'bunker':
        this.drawBunker(ctx, x, baseY, 40 * scale);
        break;
      case 'stack':
      case 'chimney':
        this.drawChimney(ctx, x, baseY, 70 * scale, config.smokeEffect);
        break;
      case 'crane':
        this.drawCrane(ctx, x, baseY, 100 * scale);
        break;
      default:
        ctx.fillRect(x, baseY - 50 * scale, 30 * scale, 50 * scale);
    }

    // Add glow effect if specified
    if (config.glowEffect) {
      ctx.save();
      ctx.globalAlpha = 0.3 + Math.sin(this.animationTime / 300) * 0.1;
      ctx.fillStyle = config.glowColor || '#00ff88';
      ctx.beginPath();
      ctx.arc(x + 15, baseY - 30 * scale, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * Draw tower structure
   */
  drawTower(ctx, x, baseY, height) {
    // Main tower
    ctx.fillRect(x, baseY - height, 8, height);
    // Cross beams
    ctx.fillRect(x - 10, baseY - height * 0.3, 28, 4);
    ctx.fillRect(x - 15, baseY - height * 0.6, 38, 4);
    // Antenna
    ctx.fillRect(x + 2, baseY - height - 15, 4, 15);
  }

  /**
   * Draw bunker structure
   */
  drawBunker(ctx, x, baseY, height) {
    ctx.fillRect(x, baseY - height, 50, height);
    ctx.fillStyle = '#2a3a4a';
    ctx.fillRect(x + 15, baseY - height + 10, 20, 15);
  }

  /**
   * Draw chimney/smokestack
   */
  drawChimney(ctx, x, baseY, height, hasSmokeEffect) {
    ctx.fillRect(x, baseY - height, 20, height);
    ctx.fillRect(x - 5, baseY - height, 30, 10);
    
    if (hasSmokeEffect) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#808080';
      const smokeY = baseY - height - 20 - Math.sin(this.animationTime / 200) * 10;
      ctx.beginPath();
      ctx.arc(x + 10, smokeY, 15, 0, Math.PI * 2);
      ctx.arc(x + 20, smokeY - 15, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * Draw crane structure
   */
  drawCrane(ctx, x, baseY, height) {
    // Tower
    ctx.fillRect(x, baseY - height, 12, height);
    // Arm
    ctx.fillRect(x - 40, baseY - height + 5, 100, 6);
    // Cable
    ctx.fillRect(x + 50, baseY - height + 5, 2, 40);
  }

  /**
   * Render debris element
   */
  renderDebris(ctx, x, baseY, config, scale) {
    ctx.fillStyle = config.color || '#4a4a4a';
    
    // Draw scattered debris
    ctx.fillRect(x, baseY - 15 * scale, 40 * scale, 15 * scale);
    ctx.fillRect(x + 10 * scale, baseY - 25 * scale, 25 * scale, 10 * scale);
    ctx.fillRect(x - 5 * scale, baseY - 10 * scale, 15 * scale, 10 * scale);
  }

  /**
   * Render effect element (smoke, fire, etc.)
   */
  renderEffect(ctx, x, baseY, config, scale, animOffset) {
    ctx.save();
    
    if (config.animated) {
      const time = this.animationTime / 1000 + animOffset;
      
      if (config.fireColor) {
        // Fire effect
        ctx.globalAlpha = 0.6 + Math.sin(time * 5) * 0.2;
        ctx.fillStyle = config.fireColor;
        const flicker = Math.sin(time * 10) * 5;
        ctx.beginPath();
        ctx.moveTo(x, baseY);
        ctx.lineTo(x + 10, baseY - 40 - flicker);
        ctx.lineTo(x + 20, baseY);
        ctx.fill();
      } else if (config.flying) {
        // Flying object (helicopter, bird, etc.)
        const flyY = baseY - 150 + Math.sin(time) * 20;
        const flyX = x + Math.cos(time * 0.5) * 50;
        ctx.fillStyle = '#404040';
        ctx.fillRect(flyX, flyY, 30 * scale, 10 * scale);
        
        if (config.searchlight) {
          ctx.globalAlpha = 0.2;
          ctx.fillStyle = '#ffff88';
          ctx.beginPath();
          ctx.moveTo(flyX + 15, flyY + 10);
          ctx.lineTo(flyX - 20, baseY);
          ctx.lineTo(flyX + 50, baseY);
          ctx.closePath();
          ctx.fill();
        }
      } else {
        // Generic smoke effect
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#606060';
        const smokeY = baseY - 30 - time * 10 % 50;
        ctx.beginPath();
        ctx.arc(x, smokeY, 15 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    ctx.restore();
  }

  /**
   * Render props element
   */
  renderProps(ctx, x, baseY, config, scale, variant) {
    ctx.fillStyle = config.color || '#5a5a5a';
    
    const elements = config.elements || ['prop'];
    const element = elements[variant % elements.length];
    
    if (element === 'flag' || element === 'banner') {
      // Animated flag
      const wave = Math.sin(this.animationTime / 200) * 5;
      ctx.fillRect(x, baseY - 60 * scale, 3, 60 * scale);
      ctx.fillRect(x + 3, baseY - 60 * scale + wave, 25 * scale, 15 * scale);
    } else {
      ctx.fillRect(x, baseY - 30 * scale, 20 * scale, 30 * scale);
    }
  }

  /**
   * Render foreground props
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} groundLevel - Ground Y position
   * @param {Object} camera - Camera object
   */
  renderForegroundProps(ctx, groundLevel, camera) {
    const cameraX = camera ? camera.x : 0;

    this.foregroundProps.forEach(prop => {
      const screenX = prop.x - cameraX;
      
      // Skip if off-screen
      if (screenX < -100 || screenX > ctx.canvas.width + 100) return;

      this.renderProp(ctx, prop, screenX, groundLevel);
    });
  }

  /**
   * Render a single foreground prop
   */
  renderProp(ctx, prop, screenX, groundLevel) {
    const config = prop.config;
    const scale = prop.scale;
    const width = (config.width || 30) * scale;
    const height = (config.height || 30) * scale;
    const baseY = groundLevel - height;

    ctx.save();
    ctx.fillStyle = config.color || '#5a5a5a';

    // Handle special prop rendering
    if (config.fireEffect) {
      // Draw with fire
      ctx.fillRect(screenX, baseY, width, height);
      ctx.fillStyle = '#ff6600';
      ctx.globalAlpha = 0.6 + Math.sin(this.animationTime / 100) * 0.2;
      const flicker = Math.sin(this.animationTime / 50) * 3;
      ctx.beginPath();
      ctx.moveTo(screenX + width * 0.3, baseY);
      ctx.lineTo(screenX + width * 0.5, baseY - 20 - flicker);
      ctx.lineTo(screenX + width * 0.7, baseY);
      ctx.fill();
    } else if (config.glowing) {
      // Draw with glow
      ctx.globalAlpha = 0.4 + Math.sin(this.animationTime / 300) * 0.2;
      ctx.fillStyle = '#00ff88';
      ctx.beginPath();
      ctx.arc(screenX + width / 2, baseY + height / 2, width, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = config.color;
      ctx.fillRect(screenX, baseY, width, height);
    } else if (config.hanging) {
      // Draw hanging element
      ctx.fillRect(screenX, baseY - height, width * 0.3, height);
    } else if (config.inGround) {
      // Draw element partially in ground
      ctx.fillRect(screenX, groundLevel - height * 0.3, width, height * 0.3);
    } else if (config.animated) {
      // Draw animated element
      const sway = Math.sin(this.animationTime / 300 + prop.animationOffset) * 3;
      ctx.translate(screenX + width / 2, groundLevel);
      ctx.rotate(sway * Math.PI / 180);
      ctx.fillRect(-width / 2, -height, width, height);
    } else {
      // Default rendering
      ctx.fillRect(screenX, baseY, width, height);
    }

    ctx.restore();
  }

  /**
   * Render landmarks
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} groundLevel - Ground Y position
   * @param {Object} camera - Camera object
   */
  renderLandmarks(ctx, groundLevel, camera) {
    const cameraX = camera ? camera.x : 0;

    this.landmarks.forEach(landmark => {
      const screenX = landmark.x - cameraX * 0.4; // Medium parallax
      
      // Skip if off-screen
      if (screenX < -200 || screenX > ctx.canvas.width + 200) return;

      this.renderLandmark(ctx, landmark, screenX, groundLevel);
    });
  }

  /**
   * Render a single landmark
   */
  renderLandmark(ctx, landmark, screenX, groundLevel) {
    const scale = landmark.scale;
    const baseY = groundLevel;

    ctx.save();
    ctx.fillStyle = '#2a3a4a';

    switch (landmark.type) {
      case 'radio_tower':
      case 'watchtower':
        this.drawTower(ctx, screenX, baseY, 120 * scale);
        break;
      case 'destroyed_tank':
      case 'crashed_helicopter':
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(screenX, baseY - 40 * scale, 80 * scale, 40 * scale);
        ctx.fillRect(screenX + 20, baseY - 60 * scale, 40 * scale, 20 * scale);
        break;
      case 'dark_fortress':
      case 'dark_citadel':
        ctx.fillStyle = '#1a1a2a';
        ctx.fillRect(screenX, baseY - 150 * scale, 100 * scale, 150 * scale);
        ctx.fillRect(screenX - 20, baseY - 180 * scale, 40 * scale, 180 * scale);
        ctx.fillRect(screenX + 80, baseY - 180 * scale, 40 * scale, 180 * scale);
        break;
      case 'ancient_tree':
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(screenX, baseY - 100 * scale, 25 * scale, 100 * scale);
        ctx.fillStyle = '#2a4a2a';
        ctx.beginPath();
        ctx.arc(screenX + 12, baseY - 130 * scale, 50 * scale, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'demon_statue':
        ctx.fillStyle = '#3a1a1a';
        ctx.fillRect(screenX, baseY - 100 * scale, 60 * scale, 100 * scale);
        ctx.fillRect(screenX + 10, baseY - 130 * scale, 40 * scale, 30 * scale);
        // Glowing eyes
        ctx.fillStyle = '#ff4400';
        ctx.globalAlpha = 0.5 + Math.sin(this.animationTime / 200) * 0.3;
        ctx.fillRect(screenX + 18, baseY - 120 * scale, 8, 8);
        ctx.fillRect(screenX + 34, baseY - 120 * scale, 8, 8);
        break;
      default:
        ctx.fillRect(screenX, baseY - 80 * scale, 60 * scale, 80 * scale);
    }

    ctx.restore();
  }

  /**
   * Render themed ground
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} worldWidth - World width
   * @param {number} worldHeight - World height
   * @param {number} groundLevel - Ground Y position
   */
  renderGround(ctx, worldWidth, worldHeight, groundLevel) {
    if (!this.currentTheme) return;

    const theme = this.currentTheme;
    const grading = theme.colorGrading;

    // Apply warmth tint
    const adjustColor = (hex, warmth) => {
      if (!warmth) return hex;
      const rgb = this.hexToRgb(hex);
      rgb.r = Math.min(255, Math.max(0, rgb.r + warmth * 20));
      rgb.b = Math.min(255, Math.max(0, rgb.b - warmth * 15));
      return this.rgbToHex(rgb.r, rgb.g, rgb.b);
    };

    const groundBase = adjustColor(theme.groundBase, grading.warmth);
    const groundDark = adjustColor(theme.groundDark, grading.warmth);
    const groundLight = adjustColor(theme.groundLight, grading.warmth);
    const grassColor = adjustColor(theme.grassColor, grading.warmth);

    // Base ground
    ctx.fillStyle = groundBase;
    ctx.fillRect(0, groundLevel, worldWidth, worldHeight - groundLevel);

    // Ground tile pattern (16-bit style)
    ctx.fillStyle = groundDark;
    for (let x = 0; x < worldWidth; x += 32) {
      for (let y = groundLevel + 8; y < worldHeight; y += 16) {
        const offset = (Math.floor(y / 16) % 2) * 16;
        ctx.fillRect(x + offset, y, 28, 2);
        ctx.fillRect(x + offset, y, 2, 14);
      }
    }

    // Ground highlights
    ctx.fillStyle = groundLight;
    for (let x = 0; x < worldWidth; x += 32) {
      for (let y = groundLevel + 8; y < worldHeight; y += 16) {
        const offset = (Math.floor(y / 16) % 2) * 16;
        if ((x + y) % 64 === 0) {
          ctx.fillRect(x + offset + 2, y + 2, 4, 4);
        }
      }
    }

    // Top ground detail line
    ctx.fillStyle = groundLight;
    ctx.fillRect(0, groundLevel, worldWidth, 2);

    // Grass/vegetation based on biome
    this.renderGroundVegetation(ctx, worldWidth, groundLevel, grassColor, groundDark);
  }

  /**
   * Render ground vegetation
   */
  renderGroundVegetation(ctx, worldWidth, groundLevel, grassColor, groundDark) {
    const grassDark = this.darkenColor(grassColor, 0.2);

    for (let x = 0; x < worldWidth; x += 8) {
      const grassHeight = 4 + (Math.sin(x * 0.1) * 2);
      const useGrass = Math.sin(x * 0.3) > -0.5;

      if (useGrass) {
        ctx.fillStyle = grassColor;
        ctx.fillRect(x, groundLevel - grassHeight, 3, grassHeight);
        ctx.fillRect(x + 1, groundLevel - grassHeight - 2, 1, 2);

        ctx.fillStyle = grassDark;
        ctx.fillRect(x + 2, groundLevel - grassHeight, 1, grassHeight);
      } else {
        ctx.fillStyle = groundDark;
        ctx.fillRect(x, groundLevel - 2, 4, 2);
      }
    }
  }

  /**
   * Apply color grading overlay
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  applyColorGrading(ctx) {
    if (!this.currentTheme) return;

    const grading = this.currentTheme.colorGrading;
    const features = this.currentTheme.bossArenaFeatures;

    // Apply brightness adjustment
    if (grading.brightness && grading.brightness !== 1.0) {
      ctx.save();
      if (grading.brightness < 1.0) {
        ctx.globalAlpha = 1 - grading.brightness;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
      ctx.restore();
    }

    // Apply tint if specified
    if (grading.tint) {
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = grading.tint;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    }

    // Boss arena dark vignette
    if (features.darkVignette) {
      this.renderVignette(ctx);
    }
  }

  /**
   * Render vignette effect
   */
  renderVignette(ctx) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.max(width, height) * 0.7;

    const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // Helper methods

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  darkenColor(hex, amount) {
    const rgb = this.hexToRgb(hex);
    return this.rgbToHex(
      rgb.r * (1 - amount),
      rgb.g * (1 - amount),
      rgb.b * (1 - amount)
    );
  }

  /**
   * Get current theme
   * @returns {Object} Current theme
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Clear the system
   */
  clear() {
    this.currentTheme = null;
    this.currentLevelIndex = -1;
    this.parallaxElements = [];
    this.foregroundProps = [];
    this.landmarks = [];
    this.animationTime = 0;
  }
}
