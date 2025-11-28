# War Shooter

A browser-based 16-bit arcade side-scrolling shooter game built with vanilla JavaScript and HTML5 Canvas. Features pixel-art style graphics, multiple game modes, and comprehensive gameplay systems.

![War Shooter](https://img.shields.io/badge/version-1.4.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Chromebook-orange.svg)

## 🎮 Features

### Game Modes
- **Campaign Mode**: 10-level story-driven campaign with 4 unique boss battles
- **Survival Mode**: Endless wave-based survival with increasing difficulty
- **Challenge Modes** (NEW in v1.4):
  - **Time Attack**: Speedrun levels for medals (Gold <3min, Silver <5min, Bronze <8min)
  - **Boss Rush**: Fight all 4 bosses back-to-back with health refills
  - **Horde Mode**: Endless waves with scaling difficulty and modifiers
  - **One-Hit Mode**: Extreme difficulty - one shot kills all
- **Multiplayer Mode**: WebRTC-based peer-to-peer co-op and versus modes (Coming Soon)

### Characters
| Character | Health | Speed | Special Ability | Description |
|-----------|--------|-------|-----------------|-------------|
| Soldier | 100 | Normal | Airstrike | Balanced all-rounder |
| Scout | 80 | Fast | Sprint Boost | High mobility fighter |
| Heavy | 150 | Slow | Shield | Tank class with damage resistance |
| Medic | 90 | Normal | Med Pack | Passive healing + emergency heal |

### Weapons

#### Ranged Weapons
- **Pistol**: Starting weapon, reliable and quick
- **Rifle**: High fire rate, good damage
- **Shotgun**: Devastating at close range
- **Machine Gun**: Spray and pray with 100 rounds
- **Sniper Rifle**: One-shot potential from distance
- **Grenade Launcher**: Explosive area damage
- **Laser Gun**: Unlimited ammo energy weapon
- **Rocket Launcher**: Massive explosion radius
- **Molotov Cocktail**: Fire-based area denial
- **Mine Launcher**: Tactical trap deployment

#### Melee Weapons
- **Knife**: Quick attacks, short range
- **Sword**: Balanced damage and speed
- **Axe**: High damage, slower swing
- **Hammer**: Maximum damage, slowest
- **Spear**: Longest reach of all melee

### Enemy Types
- **Infantry**: Standard enemy, balanced stats
- **Heavy**: High health, uses machine gun
- **Sniper**: Long range, deadly accuracy
- **Scout**: Fast-moving flanker
- **Drone**: Flying enemy, aerial attacks
- **Berserker**: Melee rusher, high damage
- **Bomber**: Explodes on contact or death
- **Riot**: Front-facing shield defense
- **Medic**: Heals nearby allies every 3 seconds (NEW)
- **Engineer**: Deploys mini-turrets for defense (NEW)
- **Flamethrower**: Continuous fire cone attack (NEW)
- **Boss**: Unique mechanics per encounter

### Elite & Mini-Boss System (NEW)
- **Elite Enemies**: 10% spawn chance (wave 3+), 2x health, 1.5x damage, golden aura, guaranteed power-up drop
- **Mini-Bosses**: Spawn every 3 waves (wave 6+), 6x health, special abilities, epic weapon drops

### Environmental Hazards (NEW)
- **Turrets**: Auto-targeting stationary weapons (400px range)
- **Explosive Barrels**: Chain-reaction explosions (100px radius)
- **Spike Traps**: Floor hazards with warning cycles
- **Laser Grids**: Static, moving, or pulsing beam patterns
- **Toxic Zones**: Poison damage with movement slow
- **Lava Zones**: High fire damage areas

### Boss Encounters
1. **The Warlord** (Level 3): Rage mode below 50% HP
2. **The Devastator** (Level 6): Summons minion reinforcements
3. **The Annihilator** (Level 9): Periodic invulnerable shield phases
4. **The Overlord** (Level 10): All mechanics combined - final challenge

### Power-ups
- Health Pack: Restore health
- Ammo Box: Refill ammunition
- Damage Boost: Double damage temporarily
- Speed Boost: Increased movement speed
- Rapid Fire: Faster shooting
- Multi-Shot: Three projectiles per shot
- Invincibility: Brief invulnerability
- Shield: Absorbs damage

### Phase 2 Features (NEW)

#### Permanent Upgrade System
Spend coins to permanently improve your character:
- **Health**: +20/40/60/80/100 HP
- **Damage**: +10/20/30/45/60% damage
- **Speed**: +15/30/45/60/75% movement
- **Reload**: -10/20/30/40/50% reload time
- **Cooldown**: -10/20/30/40/50% ability cooldown
- **Armor**: 5/10/15/22/30% damage reduction

#### Currency System
- Collect coins from defeated enemies
- Normal enemies: 5-10 coins
- Elite enemies: 20-30 coins
- Mini-bosses: 50-100 coins
- Bosses: 200-500 coins
- Wave bonus: 50 × wave number

#### Shop System
A merchant appears every 5 waves with items for sale:
- Health Refill: 100 coins
- Ammo Pack: 50 coins
- Mystery Box: 150 coins (random power-up)
- Damage Boost: 200 coins (1 wave)
- Weapon Crate: 500 coins
- Revive Token: 300 coins

#### Weapon Attachments
Customize weapons with attachments (3 slots per weapon):
- **Scope**: +50% range, 1.5x zoom
- **Extended Mag**: +50% ammo capacity
- **Suppressor**: Silent shots, -10% damage
- **Laser Sight**: +15% accuracy
- **Rapid Bolt**: +25% fire rate
- **Bayonet**: +15 melee damage
- **Sharpening Stone**: +30% melee damage
- **Lightweight Grip**: +20% swing speed

#### Stealth System
- **Crouch**: Hold CTRL for 50% speed, 50% detection
- **Backstab**: 3x damage from behind (instant kill under 100 HP)
- **Enemy Awareness States**:
  - White (Unaware): Can be backstabbed
  - Yellow (Suspicious): Investigating
  - Orange (Alert): Searching for player
  - Red (Combat): Active engagement

#### Enemy Formation System
Enemies coordinate in tactical formations:
- Line: Horizontal advance
- V-Shape: Point leads with flankers
- Circle: Surrounds player
- Pincer: Two-pronged attack
- Firing Line: Melee front, ranged back
- Scatter: Chaotic random positions

### Phase 3 Features (NEW)

#### Weather System
Dynamic weather that affects gameplay:
- **Clear**: Default, no effects
- **Rain**: 80% visibility, slippery movement, puddles
- **Fog**: 50% visibility, +70% stealth bonus, drifting clouds
- **Snow**: 70% visibility, -15% speed, footprints, cold damage
- **Sandstorm**: 40% visibility, -20% speed, continuous damage, screen shake

#### Time of Day
Day/night cycle with gameplay impact:
- **Day**: 100% brightness, normal gameplay
- **Dusk**: 70% brightness, orange tint, 60s transition
- **Night**: 40% brightness, enemies have 50% vision, stealth bonus
- **Flashlight**: Toggle with F key, 200px cone, 30s battery

#### Vehicles
Drivable combat vehicles:
- **Tank**: 500 HP, cannon (100 dmg) + MG, crushes enemies, 75% armor
- **Jeep**: 200 HP, fast movement, mounted gun, 2 seats, 25% armor
- Enter/exit with E key, fuel system, explosive destruction

#### Mounted Weapons
Stationary weapons to mount:
- **HMG**: 25 damage, rapid fire, 360° rotation, overheat system, shield
- **Sniper**: 100 damage, 2s between shots, 800px range, zoom, 180° arc
- **Rocket**: 150 explosion damage, 4s reload, 10 ammo, 270° rotation

#### New Power-Ups
Five additional power-ups:
- **Time Slow**: 5s duration, enemies move at 70% speed (purple)
- **Double Jump**: 15s duration, mid-air jump ability (light blue)
- **Grappling Hook**: 20s/10 uses, 300px range, swing physics (brown)
- **Ghost Mode**: 4s duration, pass through enemies/bullets (white)
- **Magnet**: 10s duration, 200px auto-collect, 1.5x coins (pink)

### Phase 4 Features (NEW)

#### Challenge Modes
Four new competitive game modes:
- **Time Attack**: Complete levels as fast as possible
  - Medals: Gold (<3 min), Silver (<5 min), Bronze (<8 min)
  - Ghost replay of personal best
  - Style bonuses for no damage, melee only, high combos
- **Boss Rush**: Fight all 4 bosses back-to-back
  - Health refills to 50% between bosses
  - Random power-up rewards
  - Difficulty multipliers: 1x, 1.5x, 2x, 3x
- **Horde Mode**: Endless waves with increasing difficulty
  - Wave scaling: +10% per wave
  - Mini-boss every 5 waves, boss every 10 waves
  - Special modifiers unlock at milestones
- **One-Hit Mode**: Extreme difficulty
  - Player has 1 HP
  - All enemies also die in one hit
  - Stealth gameplay encouraged

#### Character Customization
- 8 skins per character with unlock requirements
  - Default, Elite (gold), Shadow (purple), Crimson (red)
  - Arctic (white), Desert (tan), Forest (green), Neon (bright)
- Custom player names (max 16 characters)
- Skin-specific particle trails

#### Dynamic Events
Random mid-game events that change gameplay:
- Supply Drop: Health/ammo/weapon drops
- Enemy Reinforcements: Extra enemies spawn
- Allied Support: AI soldier assists for 60s
- Ambush: Enemies spawn behind player
- Equipment Malfunction: Random weapon jams
- Lucky Strike: Guaranteed power-up drops
- Heavy Assault: All enemies are Heavy type
- Fog of War: Minimap disabled

#### Statistics & Leaderboards
- Comprehensive stat tracking across all modes
- Combat, survival, progression, and efficiency stats
- Local leaderboards for all modes
- Statistics menu with 4 category tabs

## 🎯 How to Play

### Controls

See [CONTROLS.md](CONTROLS.md) for detailed control information.

#### Movement
- **WASD / Arrow Keys**: Move left/right and jump
- **Space**: Jump
- **S / Down Arrow**: Crouch
- **C / Ctrl**: Dodge Roll (invulnerable)

#### Combat
- **Left Click**: Shoot (ranged weapon)
- **Right Click / F**: Melee attack
- **V**: Block/Parry (with melee weapon equipped)
- **R**: Reload
- **E / Q**: Special Ability
- **1-4**: Switch weapons

#### System
- **ESC**: Pause menu
- **I**: Inventory
- **U**: Upgrade menu (NEW)
- **E**: Interact with shop vendor (NEW)
- **H**: Help overlay
- **F / F11**: Toggle fullscreen
- **M**: Return to main menu

### Objectives

**Campaign Mode**:
- Progress through 10 levels
- Defeat all enemies in each level
- Boss battles every 3 levels
- Complete the final boss to win

**Survival Mode**:
- Survive as many waves as possible
- Waves increase in difficulty
- Score points for kills and combos
- Boss every 5 waves

### Tips
- Use cover objects to block enemy fire
- Chain kills quickly for combo bonuses
- Parry timing: Block just before a projectile hits for a perfect parry
- Each character's ability can turn the tide of battle
- Check the minimap for enemy and item positions
- New enemy types require different strategies

## 🚀 Getting Started

### Requirements
- Modern web browser (Chrome, Firefox, Edge, Safari)
- JavaScript enabled
- No server required - runs entirely client-side

### Installation

1. Clone the repository:
```bash
git clone https://github.com/fink2009/War-Shooter-Game.git
```

2. Open `index.html` in a web browser:
```bash
# Or use a local server
python -m http.server 8000
# Then open http://localhost:8000 in your browser
```

### Chromebook Compatibility
This game is designed to work on Chromebooks:
- No plugins or extensions required
- Works in Chrome browser
- Touch controls support (optional)
- Optimized for lower-end hardware

## 🔧 Configuration

The game can be configured via `config.js`. Key settings include:

```javascript
// Display
CANVAS_WIDTH: 1200
CANVAS_HEIGHT: 600

// Gameplay
PLAYER.SPEED: 4
PLAYER.JUMP_STRENGTH: -12
PLAYER.DEFAULT_HEALTH: 100

// Audio
AUDIO.MASTER_VOLUME: 1.0
AUDIO.MUSIC_VOLUME: 0.7
AUDIO.SFX_VOLUME: 0.8
```

See `config.js` for full configuration options.

## 💾 Save System

The game uses localStorage for saving:
- 3 save slots available
- Auto-save after each level/wave
- Manual save from pause menu
- Export/import saves as JSON backup
- Settings saved separately

## 🏗️ Project Structure

```
War-Shooter-Game/
├── index.html          # Main HTML entry point
├── main.js             # Game initialization
├── style.css           # Styles
├── config.js           # Game configuration
├── README.md           # This file
├── CONTROLS.md         # Control scheme details
├── CHANGELOG.md        # Version history
└── core/
    ├── entities/       # Game entities
    │   ├── Entity.js
    │   ├── PlayerCharacter.js
    │   ├── EnemyUnit.js
    │   ├── Projectile.js
    │   ├── Pickup.js
    │   ├── Cover.js
    │   ├── Platform.js
    │   └── Slope.js
    ├── managers/       # Game managers
    │   ├── GameEngine.js
    │   ├── InputManager.js
    │   └── AssetManager.js
    ├── systems/        # Game systems
    │   ├── SaveSystem.js
    │   ├── Camera.js
    │   ├── CollisionSystem.js
    │   ├── ParticleSystem.js
    │   ├── AchievementSystem.js
    │   ├── AudioManager.js
    │   └── HighScoreSystem.js
    ├── weapons/        # Weapon definitions
    │   └── Weapon.js
    ├── ui/             # UI components
    │   └── GameUI.js
    └── cutscene/       # Cutscene system
        ├── CutsceneCamera.js
        ├── CutsceneManager.js
        ├── SubtitleRenderer.js
        └── data/       # Cutscene data files
```

## 🎨 Art Style

The game features a 16-bit arcade aesthetic:
- Pixel-art inspired character sprites
- Retro color palettes
- CRT-style scanline effects (optional)
- Particle-based explosions and effects
- Classic arcade UI design

## 🔊 Audio

- Dynamic music that changes based on game state
- Synthesized sound effects
- Volume controls for music and SFX separately
- Mute toggle available

## 🎖️ Achievements

Unlock achievements for:
- Combat milestones (kills, combos)
- Survival records (waves survived)
- Campaign completion
- Skill-based challenges
- Collection goals

## 🛠️ Development

### Tech Stack
- Pure JavaScript (ES6+)
- HTML5 Canvas for rendering
- Web Audio API for sound
- localStorage for persistence
- WebRTC for multiplayer (planned)

### Adding New Content

#### Adding a New Weapon
1. Define weapon stats in `config.js` under `WEAPONS`
2. Create a new class extending `Weapon` in `Weapon.js`
3. Add to pickup pool if desired

#### Adding a New Enemy
1. Define enemy stats in `config.js` under `ENEMY.TYPES`
2. Add case to `EnemyUnit.applyEnemyType()`
3. Add unique render logic if needed

### Running Tests
```bash
# Open in browser with developer console
# Use window.game for debug access
```

### Debug Mode
In the settings menu, page 4 allows access to dev tools with password `QUICKTEST`:
- Press `K` during gameplay to kill all enemies

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Credits

- Game Design & Development: The War Shooter Team
- Inspired by classic arcade shooters like Metal Slug, Contra, and Gunstar Heroes
- Built with vanilla JavaScript and HTML5 Canvas

## 📞 Support

For issues, suggestions, or contributions:
- Open an issue on GitHub
- Submit a pull request
- Contact the development team

---

**Enjoy the game! 🎮**
