# War Shooter - Control Scheme

Complete control reference for War Shooter.

## Keyboard Controls

### Movement Controls
| Action | Primary Key | Alternative Key | Description |
|--------|-------------|-----------------|-------------|
| Move Left | A | Left Arrow | Move character left |
| Move Right | D | Right Arrow | Move character right |
| Jump | W / Space | Up Arrow | Jump (when on ground) |
| Crouch | S | Down Arrow | Crouch to reduce hitbox |
| Dodge Roll | C | Ctrl | Invulnerable roll in facing direction |

### Combat Controls
| Action | Primary Key | Alternative Key | Description |
|--------|-------------|-----------------|-------------|
| Shoot | Left Mouse Click | - | Fire ranged weapon |
| Melee Attack | F | Right Mouse Click | Attack with melee weapon |
| Block/Parry | V (Hold) | - | Block damage (requires melee weapon) |
| Reload | R | - | Reload current weapon |
| Special Ability | E | Q | Use character special ability |

### Weapon Management
| Action | Key | Description |
|--------|-----|-------------|
| Weapon Slot 1 | 1 | Switch to first weapon |
| Weapon Slot 2 | 2 | Switch to second weapon |
| Weapon Slot 3 | 3 | Switch to third weapon |
| Weapon Slot 4 | 4 | Switch to fourth weapon |
| Open Inventory | I | Open weapon inventory |
| Switch Inventory Page | ] / Page Down | Toggle between ranged and melee |

### Phase 3 Controls
| Action | Key | Description |
|--------|-----|-------------|
| Toggle Flashlight | L | Turn flashlight on/off (night only) |
| Enter/Exit Vehicle | G | Mount or dismount vehicles |
| Mount/Dismount Weapon | X | Use stationary mounted weapons |
| Vehicle Fire | Left Click | Fire vehicle weapons when mounted |
| Use Grappling Hook | T | Fire grappling hook (when power-up active) |

### System Controls
| Action | Key | Description |
|--------|-----|-------------|
| Pause Game | ESC | Pause/unpause gameplay |
| Toggle Help | H | Show/hide control help overlay |
| Toggle Fullscreen | F11 / ` | Enter/exit fullscreen mode |
| Return to Menu | M | Return to main menu (when paused) |
| Restart | R | Restart game (game over/victory) |

## Mouse Controls

| Action | Button | Description |
|--------|--------|-------------|
| Shoot | Left Click | Fire ranged weapon |
| Melee Attack | Right Click | Attack with melee weapon |
| Menu Selection | Left Click | Select menu options |

**Note**: Shooting direction is based on the character's facing direction, not mouse position. Use A/D keys to change facing direction.

## Menu Navigation

### Main Menu
| Key | Action |
|-----|--------|
| 1 | Start Campaign Mode |
| 2 | Start Survival Mode |
| 3 | Open Settings |
| 4 | View Controls |
| 5 | View High Scores |

### Character Select
| Key | Action |
|-----|--------|
| 1 | Select Soldier |
| 2 | Select Scout |
| 3 | Select Heavy |
| 4 | Select Medic |
| ESC | Return to main menu |

### Settings Navigation
| Key | Action |
|-----|--------|
| Left/Right Arrow | Change settings page |
| Number Keys | Adjust specific settings |
| ESC | Return to previous menu |

## Combat Mechanics

### Combo System
- Kill enemies quickly to build combos
- Combo multiplier increases score bonus
- Combo resets after 3 seconds without a kill
- Maximum 10x combo multiplier

### Melee Combat
- Melee weapons have range limits
- Chain attacks for combo damage bonus (up to 3 hits)
- 25% damage bonus per combo level
- Combos reset after 1 second of no attacks

### Block/Parry System
- Hold V to block (requires melee weapon)
- Blocking reduces damage by 75%
- Stamina depletes while blocking
- Stamina regenerates when not blocking
- **Perfect Parry**: Block within 200ms of projectile impact to deflect it

### Dodge Roll
- Grants brief invulnerability
- Moves quickly in facing direction
- 800ms cooldown between rolls
- Cannot attack while rolling

## Special Abilities

Each character has a unique special ability activated with E or Q:

### Soldier - Airstrike
- Calls down bombs on all visible enemies
- Deals 40 damage per bomb
- 12 second cooldown
- Best for groups of enemies

### Scout - Sprint Boost
- Doubles movement speed
- Lasts 6 seconds
- 8 second cooldown
- Great for repositioning or escaping

### Heavy - Shield
- Grants invulnerability
- Lasts 3.5 seconds
- 16 second cooldown
- Use to tank heavy damage

### Medic - Med Pack
- Instantly restores 60 HP
- 10 second cooldown
- Combine with passive healing
- Emergency heal in tough spots

## Weapon Types

### Ranged Weapons
- **Fire Rate**: Time between shots
- **Ammo**: Limited, requires reloading
- **Range**: Projectiles travel until hitting something

### Melee Weapons
- **Attack Speed**: Time between swings
- **Range**: Maximum attack distance
- **Infinite Use**: No ammo required

### Explosive Weapons
- **Area Damage**: Hits multiple enemies
- **Blast Radius**: Size of explosion
- **Self-Damage**: Be careful at close range!

## Tips for New Players

1. **Learn the dodge roll** - Invulnerability frames save lives
2. **Use cover** - Bullets stop when hitting cover objects
3. **Watch your ammo** - Reload during safe moments
4. **Build combos** - Higher scores come from kill chains
5. **Know your ability** - Each character's special is powerful
6. **Check the minimap** - See enemies and pickups at a glance
7. **Parry practice** - Perfect parries deflect projectiles back
8. **Switch weapons** - Different situations call for different tools

## Chromebook Notes

For Chromebook users:
- All controls work with standard keyboard
- No external mouse required (use touchpad)
- F11 may be mapped to browser fullscreen - try ` (backtick/tilde) key instead
- Some keyboard shortcuts may conflict with ChromeOS - use alternatives

## Accessibility Options

Available in Settings menu:
- **Color Blind Modes**: Protanopia, Deuteranopia, Tritanopia
- **Screen Shake**: Toggle on/off
- **Screen Flash**: Toggle damage flash effects
- **Blood Effects**: Toggle gore/blood
- **Auto Reload**: Automatic reloading when empty

## Developer/Debug Controls

When dev tools are unlocked (Settings Page 4, Password: QUICKTEST):
| Key | Action |
|-----|--------|
| K | Kill all enemies instantly |
| P | Toggle invincibility (God mode) |

---

For more information, see [README.md](README.md).
