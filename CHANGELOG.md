# Changelog

All notable changes to War Shooter will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
