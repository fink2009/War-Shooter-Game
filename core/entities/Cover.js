// Cover/Obstacle entity - blocks projectiles with enhanced variety
class Cover extends Entity {
  constructor(x, y, width, height, type = 'crate') {
    super(x, y, width, height);
    this.type = 'cover';
    this.coverType = type;
    this.health = 100; // Cover can be destroyed
    this.maxHealth = 100;
    this.indestructible = false;
    
    // Visual variety
    this.variant = Math.floor(Math.random() * 3);
    this.rotation = (Math.random() - 0.5) * 0.1; // Slight rotation for debris
    
    // Destruction feedback
    this.hitFlash = 0;
    this.shakeOffset = 0;
    
    // Cover type-specific settings
    this.applyTypeSettings();
  }

  /**
   * Apply settings based on cover type
   */
  applyTypeSettings() {
    const settings = {
      crate: { health: 100, indestructible: false },
      sandbag: { health: 150, indestructible: false },
      barrier: { health: 200, indestructible: false },
      debris: { health: 80, indestructible: false },
      barrel: { health: 50, indestructible: false, explosive: true },
      concrete: { health: 300, indestructible: true },
      dumpster: { health: 180, indestructible: false },
      machinery: { health: 250, indestructible: true },
      pipe: { health: 120, indestructible: false },
      rubble: { health: 60, indestructible: false }
    };
    
    const config = settings[this.coverType] || settings.crate;
    this.maxHealth = config.health;
    this.health = this.maxHealth;
    this.indestructible = config.indestructible;
    this.explosive = config.explosive || false;
  }

  takeDamage(amount) {
    if (this.indestructible) return false;
    
    this.health -= amount;
    this.hitFlash = 1;
    this.shakeOffset = (Math.random() - 0.5) * 4;
    
    // Create hit particles
    if (window.game && window.game.particleSystem) {
      window.game.particleSystem.createHitEffect(
        this.x + this.width / 2,
        this.y + this.height / 2,
        amount,
        'bullet'
      );
    }
    
    if (this.health <= 0) {
      this.health = 0;
      this.destroy();
      return true; // Cover destroyed
    }
    return false; // Cover damaged but not destroyed
  }

  destroy() {
    // Create destruction effect
    if (window.game && window.game.particleSystem) {
      // Large debris explosion
      window.game.particleSystem.createDebris(
        this.x + this.width / 2,
        this.y + this.height / 2,
        12
      );
      
      // Explosion effect for barrels
      if (this.explosive) {
        window.game.particleSystem.createLargeExplosion(
          this.x + this.width / 2,
          this.y + this.height / 2
        );
        
        // Damage nearby enemies
        if (window.game && window.game.enemies) {
          const explosionRadius = 100;
          const explosionDamage = 50;
          
          window.game.enemies.forEach(enemy => {
            if (enemy.active) {
              const dx = (enemy.x + enemy.width / 2) - (this.x + this.width / 2);
              const dy = (enemy.y + enemy.height / 2) - (this.y + this.height / 2);
              const dist = Math.sqrt(dx * dx + dy * dy);
              
              if (dist < explosionRadius) {
                const damageMultiplier = 1 - (dist / explosionRadius);
                enemy.takeDamage(Math.floor(explosionDamage * damageMultiplier));
              }
            }
          });
        }
        
        // Screen shake
        if (window.game && window.game.camera) {
          window.game.camera.shake(8, 300);
        }
      } else {
        // Normal destruction shake
        if (window.game && window.game.camera) {
          window.game.camera.shake(3, 150);
        }
      }
    }
    
    this.active = false;
  }

  update(deltaTime) {
    // Update hit flash
    if (this.hitFlash > 0) {
      this.hitFlash = Math.max(0, this.hitFlash - deltaTime / 100);
    }
    
    // Decay shake offset
    if (Math.abs(this.shakeOffset) > 0.1) {
      this.shakeOffset *= 0.9;
    } else {
      this.shakeOffset = 0;
    }
  }

  render(ctx) {
    if (!this.active) return;
    
    ctx.save();
    
    // Apply shake offset
    if (this.shakeOffset !== 0) {
      ctx.translate(this.shakeOffset, 0);
    }
    
    // Apply hit flash
    if (this.hitFlash > 0) {
      ctx.globalAlpha = 1 - this.hitFlash * 0.3;
    }
    
    // Render based on cover type
    switch (this.coverType) {
      case 'sandbag':
        this.renderSandbag(ctx);
        break;
      case 'barrier':
        this.renderBarrier(ctx);
        break;
      case 'debris':
      case 'rubble':
        this.renderDebris(ctx);
        break;
      case 'barrel':
        this.renderBarrel(ctx);
        break;
      case 'concrete':
        this.renderConcrete(ctx);
        break;
      case 'machinery':
        this.renderMachinery(ctx);
        break;
      default:
        this.renderCrate(ctx);
    }
    
    ctx.restore();
  }

  /**
   * Render crate-style cover
   */
  renderCrate(ctx) {
    const healthPercent = this.health / this.maxHealth;
    
    // Base crate colors (16-bit wood texture)
    let crateBase = '#8b6a3a';
    let crateDark = '#6b4a1a';
    let crateLight = '#ab8a5a';
    let crateMid = '#7b5a2a';
    
    // Darker when damaged
    if (healthPercent < 0.5) {
      crateBase = '#7b5a2a';
      crateDark = '#5b3a0a';
      crateLight = '#9b7a4a';
      crateMid = '#6b4a1a';
    }
    
    // Main crate body
    ctx.fillStyle = crateBase;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // 16-bit wood grain texture (horizontal lines)
    ctx.fillStyle = crateMid;
    for (let i = 0; i < this.height; i += 6) {
      ctx.fillRect(this.x, this.y + i, this.width, 2);
    }
    
    // Vertical planks
    ctx.fillStyle = crateDark;
    for (let i = 0; i < this.width; i += 10) {
      ctx.fillRect(this.x + i, this.y, 2, this.height);
    }
    
    // Highlights (16-bit shading)
    ctx.fillStyle = crateLight;
    ctx.fillRect(this.x, this.y, this.width, 3);
    ctx.fillRect(this.x, this.y, 3, this.height);
    
    // Shadows (16-bit shading)
    ctx.fillStyle = crateDark;
    ctx.fillRect(this.x + this.width - 3, this.y, 3, this.height);
    ctx.fillRect(this.x, this.y + this.height - 3, this.width, 3);
    
    // Metal bands/straps (16-bit style)
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(this.x, this.y + this.height / 3, this.width, 3);
    ctx.fillRect(this.x, this.y + (this.height * 2 / 3), this.width, 3);
    
    // Metal highlights
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(this.x, this.y + this.height / 3, this.width, 1);
    ctx.fillRect(this.x, this.y + (this.height * 2 / 3), this.width, 1);
    
    // Corner brackets
    this.renderCornerBrackets(ctx);
    
    // Border outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    // Damage cracks
    this.renderDamage(ctx, healthPercent);
  }

  /**
   * Render sandbag-style cover
   */
  renderSandbag(ctx) {
    const healthPercent = this.health / this.maxHealth;
    
    const bagBase = '#8a7a5a';
    const bagDark = '#6a5a3a';
    const bagLight = '#aa9a7a';
    
    // Draw stacked sandbags
    const bagHeight = this.height / 2;
    
    for (let row = 0; row < 2; row++) {
      const y = this.y + row * bagHeight;
      const offset = row % 2 === 0 ? 0 : this.width * 0.2;
      
      // Main bag
      ctx.fillStyle = bagBase;
      ctx.fillRect(this.x + offset * 0.5, y, this.width * 0.8, bagHeight - 2);
      
      // Bag folds
      ctx.fillStyle = bagDark;
      ctx.fillRect(this.x + offset * 0.5, y + bagHeight / 2, this.width * 0.8, 2);
      
      // Bag highlight
      ctx.fillStyle = bagLight;
      ctx.fillRect(this.x + offset * 0.5, y + 2, this.width * 0.8, 3);
    }
    
    // Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    this.renderDamage(ctx, healthPercent);
  }

  /**
   * Render barrier-style cover
   */
  renderBarrier(ctx) {
    const healthPercent = this.health / this.maxHealth;
    
    const barrierBase = '#5a5a5a';
    const barrierDark = '#3a3a3a';
    const barrierLight = '#7a7a7a';
    
    // Main barrier body
    ctx.fillStyle = barrierBase;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Concrete texture
    ctx.fillStyle = barrierDark;
    for (let i = 0; i < 5; i++) {
      const rx = this.x + Math.random() * this.width;
      const ry = this.y + Math.random() * this.height;
      ctx.fillRect(rx, ry, 3 + Math.random() * 4, 3 + Math.random() * 4);
    }
    
    // Top highlight
    ctx.fillStyle = barrierLight;
    ctx.fillRect(this.x, this.y, this.width, 4);
    
    // Bottom shadow
    ctx.fillStyle = barrierDark;
    ctx.fillRect(this.x, this.y + this.height - 4, this.width, 4);
    
    // Warning stripe
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(this.x, this.y + this.height * 0.4, this.width, 6);
    ctx.fillStyle = '#000000';
    for (let i = 0; i < this.width; i += 12) {
      ctx.fillRect(this.x + i, this.y + this.height * 0.4, 6, 6);
    }
    
    // Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    this.renderDamage(ctx, healthPercent);
  }

  /**
   * Render debris-style cover
   */
  renderDebris(ctx) {
    const debrisColors = ['#5a5a5a', '#4a4a4a', '#6a5a4a', '#5a4a3a'];
    
    // Random debris shapes
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.rotation);
    
    // Main debris chunk
    ctx.fillStyle = debrisColors[this.variant];
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    // Irregular edges
    ctx.fillStyle = debrisColors[(this.variant + 1) % debrisColors.length];
    ctx.fillRect(-this.width / 2 + 5, -this.height / 2 + 5, this.width * 0.6, this.height * 0.4);
    ctx.fillRect(-this.width / 4, this.height * 0.1, this.width * 0.5, this.height * 0.3);
    
    ctx.restore();
    
    // Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }

  /**
   * Render barrel-style cover (explosive)
   */
  renderBarrel(ctx) {
    const healthPercent = this.health / this.maxHealth;
    
    const barrelBase = '#4a4a4a';
    const barrelDark = '#2a2a2a';
    const barrelRed = '#aa2222';
    
    // Main barrel body
    ctx.fillStyle = barrelBase;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Barrel bands
    ctx.fillStyle = barrelDark;
    ctx.fillRect(this.x, this.y + 5, this.width, 4);
    ctx.fillRect(this.x, this.y + this.height - 9, this.width, 4);
    
    // Warning symbol
    ctx.fillStyle = barrelRed;
    ctx.fillRect(this.x + this.width * 0.3, this.y + this.height * 0.3, this.width * 0.4, this.height * 0.4);
    
    // Flame symbol
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.moveTo(this.x + this.width * 0.5, this.y + this.height * 0.35);
    ctx.lineTo(this.x + this.width * 0.35, this.y + this.height * 0.6);
    ctx.lineTo(this.x + this.width * 0.65, this.y + this.height * 0.6);
    ctx.closePath();
    ctx.fill();
    
    // Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    // Pulse warning if low health
    if (healthPercent < 0.3) {
      ctx.save();
      ctx.globalAlpha = 0.3 + Math.sin(performance.now() / 100) * 0.2;
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.restore();
    }
    
    this.renderDamage(ctx, healthPercent);
  }

  /**
   * Render concrete-style cover (indestructible)
   */
  renderConcrete(ctx) {
    const concreteBase = '#6a6a6a';
    const concreteDark = '#4a4a4a';
    const concreteLight = '#8a8a8a';
    
    // Main concrete body
    ctx.fillStyle = concreteBase;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Concrete texture
    ctx.fillStyle = concreteDark;
    for (let i = 0; i < 8; i++) {
      const rx = this.x + Math.random() * this.width;
      const ry = this.y + Math.random() * this.height;
      ctx.fillRect(rx, ry, 2 + Math.random() * 3, 2 + Math.random() * 3);
    }
    
    // Rebar exposed
    ctx.fillStyle = '#8a4a2a';
    ctx.fillRect(this.x + this.width * 0.2, this.y, 3, 8);
    ctx.fillRect(this.x + this.width * 0.7, this.y + this.height - 8, 3, 8);
    
    // Top/bottom highlights
    ctx.fillStyle = concreteLight;
    ctx.fillRect(this.x, this.y, this.width, 3);
    ctx.fillStyle = concreteDark;
    ctx.fillRect(this.x, this.y + this.height - 3, this.width, 3);
    
    // Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }

  /**
   * Render machinery-style cover (indestructible)
   */
  renderMachinery(ctx) {
    const machineBase = '#5a5a6a';
    const machineDark = '#3a3a4a';
    const machineLight = '#7a7a8a';
    const machineAccent = '#4a8a4a';
    
    // Main body
    ctx.fillStyle = machineBase;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Panel lines
    ctx.fillStyle = machineDark;
    ctx.fillRect(this.x + this.width * 0.3, this.y, 2, this.height);
    ctx.fillRect(this.x + this.width * 0.7, this.y, 2, this.height);
    ctx.fillRect(this.x, this.y + this.height * 0.5, this.width, 2);
    
    // Control panel
    ctx.fillStyle = machineLight;
    ctx.fillRect(this.x + 5, this.y + 5, this.width * 0.2, this.height * 0.3);
    
    // Status lights
    ctx.fillStyle = machineAccent;
    ctx.fillRect(this.x + 8, this.y + 8, 4, 4);
    ctx.fillStyle = '#aa4a4a';
    ctx.fillRect(this.x + 8, this.y + 15, 4, 4);
    
    // Vents
    ctx.fillStyle = machineDark;
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(this.x + this.width * 0.4, this.y + 10 + i * 8, this.width * 0.2, 3);
    }
    
    // Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }

  /**
   * Render corner brackets
   */
  renderCornerBrackets(ctx) {
    ctx.fillStyle = '#2a2a2a';
    // Top-left
    ctx.fillRect(this.x, this.y, 5, 2);
    ctx.fillRect(this.x, this.y, 2, 5);
    // Top-right
    ctx.fillRect(this.x + this.width - 5, this.y, 5, 2);
    ctx.fillRect(this.x + this.width - 2, this.y, 2, 5);
    // Bottom-left
    ctx.fillRect(this.x, this.y + this.height - 2, 5, 2);
    ctx.fillRect(this.x, this.y + this.height - 5, 2, 5);
    // Bottom-right
    ctx.fillRect(this.x + this.width - 5, this.y + this.height - 2, 5, 2);
    ctx.fillRect(this.x + this.width - 2, this.y + this.height - 5, 2, 5);
  }

  /**
   * Render damage effects
   */
  renderDamage(ctx, healthPercent) {
    // Show damage cracks if damaged
    if (healthPercent < 0.7) {
      ctx.strokeStyle = '#2a1a0a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Crack pattern 1
      ctx.moveTo(this.x + 5, this.y);
      ctx.lineTo(this.x + 8, this.y + 10);
      ctx.lineTo(this.x + 6, this.y + 20);
      ctx.stroke();
      
      // Crack pattern 2
      ctx.beginPath();
      ctx.moveTo(this.x + this.width - 5, this.y + 5);
      ctx.lineTo(this.x + this.width - 8, this.y + 15);
      ctx.lineTo(this.x + this.width - 6, this.y + 25);
      ctx.stroke();
    }
    
    // Show severe damage
    if (healthPercent < 0.3) {
      ctx.fillStyle = '#1a0a0a';
      ctx.fillRect(this.x + 10, this.y + 8, 6, 6);
      ctx.fillRect(this.x + this.width - 14, this.y + 15, 5, 5);
      ctx.fillRect(this.x + 8, this.y + this.height - 12, 7, 4);
    }
  }
}
