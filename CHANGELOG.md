# Changelog

All notable changes to War Shooter will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0] - 2024 (Phase 5 Content Expansion)

### Added
- **10 New Campaign Levels (11-20)**
  - Level 11: Desert Outpost - Navigate the harsh desert environment
  - Level 12: Sandworm Boss - Face the burrowing desert beast
  - Level 13: Tundra Expedition - Survive the frozen wastes
  - Level 14: Frost Titan Boss - Defeat the ice-armored giant
  - Level 15: City Assault - Fight through urban warfare
  - Level 16: Rooftop Escape - Escape the city rooftops
  - Level 17: Lab Infiltration - Sneak through the research facility
  - Level 18: Reactor Survival (Mech Commander Boss) - Survive the reactor meltdown
  - Level 19: Forest Ambush - Navigate the fog-covered forest
  - Level 20: Hell Knight Boss - The ultimate final boss battle

- **6 New Biomes with Unique Visuals**
  - **Desert**: Sand dunes, cacti, sandstorms, quicksand hazards
  - **Snow**: Ice crystals, frozen trees, blizzards, thin ice
  - **Urban**: Buildings, streets, vehicles, falling debris
  - **Facility**: Labs, tech panels, machinery, electrical hazards
  - **Forest**: Dense trees, undergrowth, fog, bear traps
  - **Hell**: Lava pools, fire pillars, brimstone, red sky

- **4 New Boss Fights**
  - **Sandworm** (2000 HP): Burrows underground, emerges with slam attack, fires sand projectiles
  - **Frost Titan** (2500 HP): Ice armor damage reduction, freeze beam, summons blizzards
  - **Mech Commander** (3000+500 HP): Two-phase boss - mech with minigun/missiles, then pilot phase
  - **Hell Knight** (4000 HP): Four-phase final boss with fire sword, meteors, lava pools, inferno mode

- **Base Defense Mode**
  - Protect your objective (1000 HP) from 20 waves of enemies
  - Building system with 5 buildable types:
    - Barricade: Block enemies and projectiles
    - Auto Turret: Automatic enemy targeting
    - Land Mine: Explosive trap
    - Heal Station: Area healing for player
    - Ammo Station: Replenishes ammunition
  - Resource economy: Earn resources from kills, spend on buildings
  - Boss waves every 5 waves
  - Wave breaks for building between waves

- **Secret Content Configuration**
  - 3 secret levels (Vault, Arena, Dev Room)
  - Branching paths in levels 16 and 18
  - 20 collectible lore documents across all levels
  - Unlock requirements for secret content

- **BiomeSystem** (`core/systems/BiomeSystem.js`)
  - Visual theme management for each biome
  - Biome-specific decorative elements
  - Color interpolation for smooth transitions
  - Environmental hazard integration

### Changed
- Campaign now includes 20 levels (up from 10)
- Boss Rush mode updated to include all 8 bosses
- Updated weather system integration with biomes
- Expanded enemy variety for higher levels

### Technical
- Added `core/entities/bosses/` directory with new boss classes
- Added `core/modes/BaseDefenseMode.js` for base defense gameplay
- Updated `GameEngine.js` with biome and boss integration
- Extended configuration in `config.js` for all new content

## [1.4.0] - 2024 (Phase 4 Expansion)

### Added
- **Challenge Modes**: 4 new competitive game modes
  - **Time Attack Mode**: Complete campaign levels as fast as possible
    - Timer displayed prominently with millisecond precision
    - Medal system: Gold (<3 min), Silver (<5 min), Bronze (<8 min)
    - Ghost replay of personal best
    - Style bonuses for no damage, melee only, and high combos
    - Speedrun-friendly: skip cutscenes, instant respawn
  - **Boss Rush Mode**: Fight all 4 bosses back-to-back
    - Health refills to 50% between bosses
    - Random power-up rewards after each boss
    - Difficulty multipliers: 1x, 1.5x, 2x, 3x
    - Individual and total time tracking
    - Option to start from any unlocked boss
  - **Horde Mode**: Endless waves of increasing difficulty
    - Wave scaling: +10% enemy HP/damage per wave
    - Elite spawn rate increases (10% → 50% by wave 20)
    - Mini-boss every 5 waves, full boss every 10 waves
    - Special modifiers unlock at wave milestones
    - Shop between waves
  - **One-Hit Mode**: Extreme difficulty mode
    - Player has 1 HP (dies to any damage)
    - All weapons one-shot enemies too
    - Stealth heavily encouraged
    - Ghost mode power-up spawns more frequently
    - Unlockable rewards for completing levels

- **Character Customization System**
  - 8 skins per character with unique colors and particle trails
    - Default: Original colors (always unlocked)
    - Elite: Gold/yellow (unlock: beat campaign)
    - Shadow: Black/purple (unlock: 50 stealth kills)
    - Crimson: Red/black (unlock: 1000 kills)
    - Arctic: White/blue (unlock: survive 20 waves)
    - Desert: Tan/brown (unlock: beat time attack)
    - Forest: Green/camo (unlock: beat boss rush)
    - Neon: Bright colors (unlock: 10,000 coins)
  - Custom player names (max 16 characters)
  - Skin unlock progress tracking
  - Unlock notification popups

- **Dynamic Events System**: 8 random mid-game events
  - **Supply Drop** (Positive): Parachute drops health/ammo/weapons
  - **Enemy Reinforcements** (Negative): Extra wave of enemies spawns
  - **Allied Support** (Positive): AI soldier assists for 60 seconds
  - **Ambush** (Negative): Enemies spawn behind player in circle formation
  - **Equipment Malfunction** (Negative): Random weapon jams for 15 seconds
  - **Lucky Strike** (Positive): Next 10 kills guaranteed power-up drops
  - **Heavy Assault** (Negative): All spawning enemies are Heavy type for 2 waves
  - **Fog of War** (Negative): Minimap disabled for 45 seconds
  - 15% chance per wave (starts wave 3), minimum 3 wave cooldown
  - Visual/audio announcements for all events

- **Statistics Tracking System**: Comprehensive stat tracking
  - Combat stats: kills by enemy/weapon type, accuracy, combos
  - Survival stats: deaths, waves survived, damage dealt/taken
  - Progression stats: playtime, coins, upgrades, achievements
  - Efficiency stats: favorite weapon/character, best times
  - Milestone counters with achievement triggers
  - Statistics menu with 4 category tabs
  - Export stats as text file

- **Leaderboard System**: Local leaderboards for all modes
  - Top 10 scores per mode/level
  - Player name, score, time, and date tracking
  - Medal indicators for top 3 positions
  - Mode-specific sorting (score, time, wave)

### Changed
- Updated main menu with Challenge Modes option
- Added Statistics menu accessible from main menu
- Extended config.js with Phase 4 configurations
- Updated GameEngine with Phase 4 system integration

## [1.3.0] - 2024 (Phase 3 Expansion)

### Added
- **Weather System**: Dynamic weather effects
  - 5 weather types: Clear, Rain, Fog, Snow, Sandstorm
  - Rain: 500 particles, 80% visibility, slippery movement, puddles
  - Fog: 50% visibility, +70% stealth bonus, drifting clouds
  - Snow: 70% visibility, -15% speed, footprints, cold damage
  - Sandstorm: 40% visibility, -20% speed, continuous damage, screen shake
  - Smooth weather transitions with configurable duration
  - Particle rendering for rain, snow, and sandstorm
  
- **Time of Day System**: Day/night cycle
  - 3 phases: Day (100% brightness), Dusk (70% brightness), Night (40% brightness)
  - Dusk features orange tint with 60-second transition
  - Night reduces enemy vision by 50% and adds stealth bonus
  - Smooth brightness and tint transitions between phases
  
- **Flashlight**: Night vision tool
  - Toggle with F key
  - 200px cone range, 45° cone angle
  - 30-second battery with recharge when off
  - Visual cone rendering with gradient lighting
  
- **Vehicles**: Drivable combat vehicles
  - **Tank**: 500 HP, 75% armor, cannon (100 dmg) + MG (15 dmg), crush damage (200)
  - **Jeep**: 200 HP, 25% armor, fast movement, mounted gun (20 dmg), 2 seats
  - Enter/exit with E key
  - Fuel system with consumption per second
  - Explosive destruction with damage radius
  - 16-bit pixel art rendering with animations
  
- **Mounted Weapons**: Stationary weapons
  - **HMG**: 25 damage, 0.1s fire rate, 500px range, 360° rotation, overheat system, shield
  - **Sniper**: 100 damage, 2s fire rate, 800px range, 180° arc, zoom capability
  - **Rocket**: 150 explosion damage, 4s fire rate, 600px range, 10 ammo, 270° rotation
  - Mount with E key, vulnerable from behind (120° arc)
  - Heat indicator for HMG, ammo counter for rocket
  
- **New Power-Ups**: 5 new power-up types
  - **Time Slow**: 5s duration, enemies move at 70% speed (purple)
  - **Double Jump**: 15s duration, mid-air jump ability (light blue)
  - **Grappling Hook**: 20s/10 uses, 300px range (brown)
  - **Ghost Mode**: 4s duration, pass through enemies/bullets (white)
  - **Magnet**: 10s duration, 200px auto-collect, 1.5x coin multiplier (pink)
  - Unique 16-bit icons for each power-up

### Changed
- Updated GameEngine with Phase 3 system integration
- Extended config.js with WEATHER, TIME_OF_DAY, FLASHLIGHT, VEHICLES, MOUNTED_WEAPONS, POWERUPS sections
- Added vehicle and mounted weapon rendering in game loop
- Weather effects render as overlay after world rendering
- Time of day overlay renders after camera reset for full-screen effect

## [1.2.0] - 2024 (Phase 2 Expansion)

### Added
- **Upgrade System**: Permanent character upgrades
  - 6 upgrade categories: Health, Damage, Speed, Reload, Cooldown, Armor
  - 5 levels each with increasing costs and bonuses
  - Skill tree UI with progress bars and icons
  - Reset button with 50% refund
  - Accessible from main menu and between waves (U key)
  
- **Currency System**: In-game economy
  - Coin drops from all enemies (scaled by type)
  - Wave completion bonuses (50 × wave number)
  - Auto-pickup within 50px range
  - Persistent coin counter in HUD
  - Sparkle effects on pickup
  
- **Shop System**: Vendor NPC every 5 waves
  - Health Refill (100 coins)
  - Ammo Pack (50 coins)
  - Mystery Box / Random Power-up (150 coins)
  - Damage Boost (200 coins, 1 wave)
  - Weapon Crate (500 coins)
  - Revive Token (300 coins)
  
- **Weapon Attachments**: Customization system
  - 3 attachment slots per weapon
  - Ranged: Scope, Extended Mag, Suppressor, Laser Sight, Rapid Bolt, Bayonet
  - Melee: Sharpening Stone, Lightweight Grip
  - Stat preview before/after
  - Drop from elite enemies (5% chance)
  
- **Stealth System**: Tactical combat options
  - Crouch (CTRL/S): 50% speed, 50% detection range
  - Backstab: 3x damage from behind, instant kill under 100 HP
  - Noise propagation system
  - Enemy awareness states (Unaware, Suspicious, Alert, Combat)
  - Visual indicators (colored outlines, exclamation marks)
  
- **Formation System**: Coordinated enemy groups
  - 6 formation types: Line, V-Shape, Circle, Pincer, Firing Line, Scatter
  - Leader designation (strongest enemy)
  - Formation breaks if leader dies, reforms after 5 seconds
  
- **Tactical AI Foundation**: Enhanced enemy behaviors
  - Cover seeking when health < 30%
  - Flanking coordination
  - Retreat and regroup
  - Investigation of noise sources
  
- **Phase 2 UI Components**:
  - UpgradeMenu with skill tree layout
  - ShopMenu for vendor interaction
  - AttachmentMenu for weapon customization
  - Coin counter in HUD (top-right)

### Changed
- Updated PlayerCharacter with armor reduction, revive token support
- Enhanced EnemyUnit with awareness states and formation roles
- Extended SaveSystem with Phase 2 stats tracking
- Added Phase 2 config sections (UPGRADES, CURRENCY, SHOP, ATTACHMENTS, STEALTH, FORMATIONS, TACTICAL_AI)

## [1.1.0] - 2024 (Phase 1 Expansion)

### Added
- **Environmental Hazards System**: 6 new hazard types
  - **Turrets**: Auto-targeting stationary weapons with 400px range, 50 HP, laser sight
  - **Explosive Barrels**: 100px explosion radius, chain reaction, warning glow
  - **Spike Traps**: Floor hazards with 2-second cycle, 30 damage, visual warning
  - **Laser Grids**: Continuous beams with static/moving/pulsing patterns
  - **Toxic Zones**: Poison areas with 5 DPS and 30% movement slow
  - **Lava Zones**: High-damage fire areas with 40 DPS
  
- **Elite Enemy System**: Enhanced enemy variants
  - 2x health, 1.5x damage, 1.2x movement speed
  - Golden aura and crown indicator
  - 10% spawn chance starting wave 3
  - Guaranteed power-up drop on death
  - 2x score value
  
- **Mini-Boss System**: Mid-level challenge encounters
  - Spawn every 3 waves (starting wave 6)
  - 6x health, 4.5x damage multipliers
  - Red/purple color scheme with aura
  - Special abilities based on enemy type
  - Warning notification and dramatic spawn
  
- **New Enemy Types**: 3 new specialized enemies
  - **Medic**: 80 HP, heals allies 15 HP every 3s within 200px, green cross symbol
  - **Engineer**: 100 HP, deploys up to 2 mini-turrets (30 HP, 10 damage)
  - **Flamethrower**: 150 HP, fire cone attack 150px range, 90° arc, immune to fire
  
- **Interactive Elements**: New level mechanics
  - **Moving Platforms**: Horizontal/vertical/circular paths, carries entities
  - **Destructible Cover**: Barriers with health that can be destroyed
  - **Switches & Doors**: Toggle switches control door states
  - **Jump Pads**: Launch entities 300px upward with 0.5s cooldown
  
- **HazardManager**: Centralized hazard coordination system
- **Config Updates**: New HAZARDS, ELITE, MINIBOSS, and ENEMIES config sections

### Changed
- Enhanced enemy spawn system with new enemy types at higher waves
- Updated rendering pipeline to include hazards and interactive elements
- Improved collision detection for new element types

## [1.0.0] - 2024

### Added
- **Save/Load System**: Comprehensive save system with 3 slots
  - Auto-save after level/wave completion
  - Manual save/load from pause menu
  - Export/import save data as JSON for backup
  - Save file validation and error handling
  - Settings persistence across sessions
  
- **Fullscreen Mode**: Toggle fullscreen with F11 or F key
  - Proper canvas scaling with aspect ratio maintenance
  - Cross-browser compatibility (Chrome, Edge, Firefox)
  - Fullscreen preference saved
  
- **New Enemy Types**: 4 new enemies with unique behaviors
  - **Drone**: Flying enemy that ignores terrain, hovers and strafes
  - **Berserker**: Fast melee rusher with high contact damage
  - **Bomber**: Explodes on contact or death with large radius
  - **Riot**: Front-facing shield blocks projectiles
  
- **Area Damage Weapons**: 3 new explosive weapons
  - **Rocket Launcher**: High damage, large explosion radius
  - **Molotov Cocktail**: Fire-based area denial weapon
  - **Mine Launcher**: Deploys proximity mines
  
- **Tutorial System**: Interactive tutorial for new players
  - Step-by-step missions teaching all game mechanics
  - Practice scenarios with dummy targets
  - Can be skipped or replayed from menu
  - Progress tracking
  
- **Story Campaign**: Enhanced campaign with narrative
  - Mission briefings before each level
  - Character dialogue and cutscenes
  - Mission objectives display
  - Debriefing screens with stats
  - Story logs and codex entries
  
- **Animation System**: Smooth sprite animations
  - State-based animations (idle, walk, run, jump, shoot, die)
  - Animation blending and transitions
  - Configurable frame rates
  - Animation events and callbacks
  
- **WebRTC Multiplayer**: Peer-to-peer multiplayer
  - Co-op Campaign mode
  - VS Deathmatch mode
  - Survival Co-op mode
  - Simple room code system
  - Lag compensation
  
- **Code Quality Improvements**
  - Comprehensive README.md documentation
  - Centralized config.js for game settings
  - CONTROLS.md with detailed control scheme
  - JSDoc comments for major functions
  
### Changed
- Improved camera smoothness settings
- Enhanced particle system performance
- Better collision detection
- Optimized rendering pipeline

### Fixed
- Jump bug on slopes
- Combo system timing issues
- Audio playback on mobile devices
- Memory leaks in particle system

## [0.9.0] - 2024 (Initial Release)

### Added
- Core game engine with HTML5 Canvas
- Campaign mode with 10 levels
- Survival mode with endless waves
- 4 playable characters (Soldier, Scout, Heavy, Medic)
- 4 boss encounters with unique mechanics
- Basic weapon system (Pistol, Rifle, Shotgun, Machine Gun, Sniper, Grenade Launcher, Laser)
- Melee combat with 5 weapons (Knife, Sword, Axe, Hammer, Spear)
- Block/Parry system
- Dodge roll mechanic
- Combo scoring system
- Achievement system
- High score tracking
- Cutscene system for boss introductions
- 16-bit arcade art style
- Particle effects system
- Audio system with music and SFX
- Minimap
- HUD with health, ammo, abilities
- Settings menu with difficulty options
- Platform and slope terrain
- Cover system
- Power-ups and pickups

---

## Version Numbering

- **Major**: Significant feature additions or breaking changes
- **Minor**: New features, improvements
- **Patch**: Bug fixes, small improvements

## Future Plans

- [ ] Touch controls for mobile devices
- [ ] More enemy variety
- [ ] Additional weapon types
- [ ] More campaign levels
- [ ] Leaderboards
- [ ] Steam/itch.io release
