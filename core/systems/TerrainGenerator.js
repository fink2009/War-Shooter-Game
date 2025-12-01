/**
 * TerrainGenerator - Enhanced procedural terrain generation system
 * Generates varied landscapes with slopes, platforms, cover positions, and landmarks
 * Supports per-level visual profiles for dramatic variety between levels
 */
class TerrainGenerator {
  constructor() {
    this.groundLevel = 550;
    this.worldWidth = 3000;
    this.seed = Date.now();
    
    // Terrain generation settings
    this.settings = {
      platformMinWidth: 80,
      platformMaxWidth: 160,
      platformMinHeight: 20,
      platformMaxHeight: 32,
      slopeMinWidth: 100,
      slopeMaxWidth: 200,
      coverMinSpacing: 150,
      coverMaxSpacing: 350,
      elevationVariance: 40,
      craterChance: 0.15,
      landmarkSpacing: 600
    };
    
    // Generated terrain elements
    this.platforms = [];
    this.slopes = [];
    this.covers = [];
    this.elevationMap = [];
    this.landmarks = [];
  }

  /**
   * Initialize terrain generator with level configuration
   * @param {number} groundLevel - Base ground Y position
   * @param {number} worldWidth - Width of the world
   * @param {Object} levelConfig - Level configuration from GameConfig
   */
  init(groundLevel, worldWidth, levelConfig = null) {
    this.groundLevel = groundLevel;
    this.worldWidth = worldWidth;
    this.levelConfig = levelConfig;
    
    // Apply level-specific settings from visual profile
    if (levelConfig && levelConfig.visualProfile) {
      this.applyVisualProfile(levelConfig.visualProfile);
    }
    
    // Generate elevation map for the level
    this.generateElevationMap();
  }

  /**
   * Apply visual profile settings to terrain generation
   * @param {Object} profile - Visual profile from level config
   */
  applyVisualProfile(profile) {
    const groundProfile = profile.groundShapeProfile || 'flat_training_range';
    const profileSettings = this.getGroundProfileSettings(groundProfile);
    
    // Merge profile settings with defaults
    Object.assign(this.settings, profileSettings);
    
    // Set platform and clutter density
    this.settings.platformDensity = profile.platformDensity || 0.3;
    this.settings.clutterDensity = profile.clutterDensity || 0.3;
  }

  /**
   * Get terrain settings based on ground shape profile
   * @param {string} profileKey - Ground shape profile key
   * @returns {Object} Settings for this profile
   */
  getGroundProfileSettings(profileKey) {
    const profiles = {
      flat_training_range: {
        slopeFrequency: 0.1,
        maxElevation: 20,
        platformChance: 0.2,
        craterChance: 0,
        coverDensity: 0.3
      },
      rolling_terrain: {
        slopeFrequency: 0.3,
        maxElevation: 40,
        platformChance: 0.3,
        craterChance: 0.1,
        coverDensity: 0.4
      },
      arena_pit: {
        slopeFrequency: 0.2,
        maxElevation: 30,
        platformChance: 0.2,
        craterChance: 0,
        coverDensity: 0.5,
        depressedCenter: true
      },
      war_torn: {
        slopeFrequency: 0.5,
        maxElevation: 50,
        platformChance: 0.3,
        craterChance: 0.4,
        coverDensity: 0.6,
        debrisHeavy: true
      },
      uneven_rubble: {
        slopeFrequency: 0.6,
        maxElevation: 35,
        platformChance: 0.4,
        craterChance: 0.3,
        coverDensity: 0.7
      },
      city_streets: {
        slopeFrequency: 0.2,
        maxElevation: 20,
        platformChance: 0.5,
        craterChance: 0.05,
        coverDensity: 0.7,
        buildingPlatforms: true
      },
      factory_floor: {
        slopeFrequency: 0.1,
        maxElevation: 15,
        platformChance: 0.6,
        craterChance: 0,
        coverDensity: 0.6,
        metalGrating: true
      },
      platform_arena: {
        slopeFrequency: 0.2,
        maxElevation: 40,
        platformChance: 0.7,
        craterChance: 0.1,
        coverDensity: 0.5,
        elevated: true
      },
      desert_dunes: {
        slopeFrequency: 0.4,
        maxElevation: 45,
        platformChance: 0.2,
        craterChance: 0.05,
        coverDensity: 0.3,
        smoothCurves: true
      },
      frozen_terrain: {
        slopeFrequency: 0.3,
        maxElevation: 30,
        platformChance: 0.4,
        craterChance: 0.1,
        coverDensity: 0.3,
        icePatches: true
      },
      elevated_platforms: {
        slopeFrequency: 0.1,
        maxElevation: 20,
        platformChance: 0.8,
        craterChance: 0,
        coverDensity: 0.6,
        rooftopStyle: true
      },
      forest_floor: {
        slopeFrequency: 0.4,
        maxElevation: 35,
        platformChance: 0.5,
        craterChance: 0.1,
        coverDensity: 0.8,
        rootObstacles: true
      },
      hellscape: {
        slopeFrequency: 0.5,
        maxElevation: 60,
        platformChance: 0.4,
        craterChance: 0.3,
        coverDensity: 0.7,
        jaggedRocks: true,
        lavaPools: true
      }
    };

    return profiles[profileKey] || profiles.flat_training_range;
  }

  /**
   * Generate elevation map for varied ground height across the level
   */
  generateElevationMap() {
    this.elevationMap = [];
    const segments = Math.ceil(this.worldWidth / 50);
    const maxElev = this.settings.maxElevation || 40;
    const frequency = this.settings.slopeFrequency || 0.3;
    
    // Use seeded pseudo-random for consistency
    let prevElev = 0;
    
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * this.worldWidth;
      
      // Multi-octave noise for natural-looking terrain
      let elevation = 0;
      elevation += Math.sin(x * 0.003 * frequency) * maxElev * 0.5;
      elevation += Math.sin(x * 0.007 * frequency + 1.5) * maxElev * 0.3;
      elevation += Math.sin(x * 0.015 * frequency + 3.0) * maxElev * 0.2;
      
      // Smooth transitions
      elevation = prevElev * 0.3 + elevation * 0.7;
      prevElev = elevation;
      
      // Apply arena pit depression in center if configured
      if (this.settings.depressedCenter) {
        const centerDist = Math.abs(x - this.worldWidth / 2) / (this.worldWidth / 2);
        const depression = Math.pow(1 - centerDist, 2) * 30;
        elevation -= depression;
      }
      
      this.elevationMap.push({
        x: x,
        y: elevation
      });
    }
  }

  /**
   * Get ground elevation at a specific X position
   * @param {number} x - X position
   * @returns {number} Ground elevation offset (negative = higher ground)
   */
  getElevationAt(x) {
    if (this.elevationMap.length < 2) return 0;
    
    // Find the two closest elevation points
    for (let i = 0; i < this.elevationMap.length - 1; i++) {
      const p1 = this.elevationMap[i];
      const p2 = this.elevationMap[i + 1];
      
      if (x >= p1.x && x <= p2.x) {
        // Linear interpolation between points
        const t = (x - p1.x) / (p2.x - p1.x);
        return p1.y * (1 - t) + p2.y * t;
      }
    }
    
    return 0;
  }

  /**
   * Generate all terrain elements for the level
   * @returns {Object} Generated terrain { platforms, slopes, covers }
   */
  generateTerrain() {
    this.platforms = [];
    this.slopes = [];
    this.covers = [];
    
    // Generate terrain based on settings
    this.generateSlopes();
    this.generatePlatforms();
    this.generateCoverPositions();
    
    return {
      platforms: this.platforms,
      slopes: this.slopes,
      covers: this.covers
    };
  }

  /**
   * Generate slopes for natural terrain variation
   */
  generateSlopes() {
    const slopeChance = this.settings.slopeFrequency || 0.3;
    const spacing = 300 / slopeChance;
    
    for (let x = 200; x < this.worldWidth - 300; x += spacing) {
      if (Math.random() < slopeChance) {
        const width = this.settings.slopeMinWidth + 
          Math.random() * (this.settings.slopeMaxWidth - this.settings.slopeMinWidth);
        const height = 30 + Math.random() * 40;
        const direction = Math.random() < 0.5 ? 'up' : 'down';
        
        // Get elevation at this position
        const elevation = this.getElevationAt(x);
        const y = this.groundLevel - height + elevation;
        
        this.slopes.push({
          x: x + Math.random() * 100,
          y: y,
          width: width,
          height: height,
          direction: direction
        });
        
        x += width; // Skip ahead to avoid overlapping slopes
      }
    }
  }

  /**
   * Generate platforms for vertical gameplay
   */
  generatePlatforms() {
    const platformDensity = this.settings.platformDensity || 0.3;
    const platformChance = this.settings.platformChance || 0.3;
    const count = Math.floor(this.worldWidth / 400 * platformDensity);
    
    for (let i = 0; i < count; i++) {
      if (Math.random() > platformChance) continue;
      
      const x = 150 + (i / count) * (this.worldWidth - 300) + (Math.random() - 0.5) * 200;
      const width = this.settings.platformMinWidth + 
        Math.random() * (this.settings.platformMaxWidth - this.settings.platformMinWidth);
      const height = this.settings.platformMinHeight + 
        Math.random() * (this.settings.platformMaxHeight - this.settings.platformMinHeight);
      
      // Vary platform height based on index and randomness
      const baseHeight = 80 + (i % 3) * 50 + Math.random() * 40;
      const y = this.groundLevel - baseHeight;
      
      // Determine platform type
      const type = this.getPlatformType(i);
      
      this.platforms.push({
        x: x,
        y: y,
        width: width,
        height: height,
        type: type
      });
    }
  }

  /**
   * Get platform type based on level settings
   * @param {number} index - Platform index
   * @returns {string} Platform type (solid, passthrough, moving, crumbling, bounce)
   */
  getPlatformType(index) {
    // Most platforms are solid or passthrough
    const rand = Math.random();
    
    if (rand < 0.6) return 'solid';
    if (rand < 0.85) return 'passthrough';
    if (rand < 0.92) return 'moving';
    if (rand < 0.97) return 'crumbling';
    return 'bounce';
  }

  /**
   * Generate strategic cover positions
   */
  generateCoverPositions() {
    const coverDensity = this.settings.coverDensity || 0.4;
    const baseSpacing = this.settings.coverMinSpacing;
    const maxSpacing = this.settings.coverMaxSpacing;
    
    let x = 100;
    
    while (x < this.worldWidth - 100) {
      // Random spacing between covers
      const spacing = baseSpacing + Math.random() * (maxSpacing - baseSpacing);
      x += spacing;
      
      if (x >= this.worldWidth - 100) break;
      
      // Skip some positions for variety
      if (Math.random() > coverDensity) {
        x += spacing * 0.5;
        continue;
      }
      
      // Determine cover type based on level theme
      const coverType = this.getCoverType();
      const elevation = this.getElevationAt(x);
      
      // Cover dimensions based on type
      const dimensions = this.getCoverDimensions(coverType);
      
      this.covers.push({
        x: x,
        y: this.groundLevel - dimensions.height + elevation,
        width: dimensions.width,
        height: dimensions.height,
        type: coverType,
        health: dimensions.health,
        destructible: dimensions.destructible
      });
    }
  }

  /**
   * Get cover type based on level settings and randomness
   * @returns {string} Cover type
   */
  getCoverType() {
    const types = ['crate', 'sandbag', 'barrier', 'debris', 'barrel'];
    
    // Weight based on level profile
    if (this.settings.debrisHeavy) {
      types.push('debris', 'debris', 'rubble');
    }
    if (this.settings.buildingPlatforms) {
      types.push('concrete', 'dumpster');
    }
    if (this.settings.metalGrating) {
      types.push('machinery', 'pipe');
    }
    
    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * Get dimensions for a cover type
   * @param {string} type - Cover type
   * @returns {Object} { width, height, health, destructible }
   */
  getCoverDimensions(type) {
    const dimensions = {
      crate: { width: 40, height: 40, health: 100, destructible: true },
      sandbag: { width: 60, height: 30, health: 150, destructible: true },
      barrier: { width: 80, height: 50, health: 200, destructible: true },
      debris: { width: 50, height: 35, health: 80, destructible: true },
      barrel: { width: 30, height: 45, health: 50, destructible: true },
      concrete: { width: 70, height: 55, health: 300, destructible: false },
      dumpster: { width: 65, height: 50, health: 180, destructible: true },
      machinery: { width: 80, height: 60, health: 250, destructible: false },
      pipe: { width: 100, height: 30, health: 120, destructible: true },
      rubble: { width: 55, height: 30, health: 60, destructible: true }
    };
    
    return dimensions[type] || dimensions.crate;
  }

  /**
   * Generate chokepoint positions for strategic gameplay
   * @returns {Array} Array of chokepoint positions
   */
  generateChokepoints() {
    const chokepoints = [];
    const spacing = this.worldWidth / 4;
    
    for (let i = 1; i < 4; i++) {
      const x = spacing * i + (Math.random() - 0.5) * 100;
      
      chokepoints.push({
        x: x,
        type: Math.random() < 0.5 ? 'narrow' : 'elevated',
        width: 80 + Math.random() * 40
      });
    }
    
    return chokepoints;
  }

  /**
   * Generate flanking route positions
   * @returns {Array} Array of flanking positions
   */
  generateFlankingRoutes() {
    const routes = [];
    const count = 2 + Math.floor(Math.random() * 2);
    
    for (let i = 0; i < count; i++) {
      const x = 300 + (i / count) * (this.worldWidth - 600);
      const y = this.groundLevel - 150 - Math.random() * 100;
      
      routes.push({
        x: x,
        y: y,
        width: 100 + Math.random() * 80,
        connectedTo: Math.random() < 0.5 ? 'platform' : 'slope'
      });
    }
    
    return routes;
  }

  /**
   * Get recommended jump pad positions based on terrain
   * @returns {Array} Array of jump pad positions
   */
  getJumpPadPositions() {
    const positions = [];
    const count = Math.floor(this.settings.platformDensity * 3) + 1;
    
    for (let i = 0; i < count; i++) {
      const x = 200 + (i / count) * (this.worldWidth - 400);
      const elevation = this.getElevationAt(x);
      
      positions.push({
        x: x,
        y: this.groundLevel - 16 + elevation,
        strength: 280 + Math.random() * 70 // Jump strength
      });
    }
    
    return positions;
  }

  /**
   * Clear all generated terrain
   */
  clear() {
    this.platforms = [];
    this.slopes = [];
    this.covers = [];
    this.elevationMap = [];
    this.landmarks = [];
  }
}
