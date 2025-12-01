// Particle system for explosions and effects
class Particle {
  constructor(x, y, dx, dy, color, lifetime) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.color = color;
    this.lifetime = lifetime;
    this.maxLifetime = lifetime;
    this.size = 3;
    this.active = true;
  }

  update(deltaTime) {
    // Special handling for bombs
    if (this.isBomb) {
      this.dy += this.gravity * deltaTime / 16;
      this.y += this.dy * deltaTime / 16;
      this.rotation += this.rotationSpeed * deltaTime / 16;
      
      // Check if bomb hit target
      if (this.y >= this.targetY) {
        this.active = false;
        // Trigger explosion when bomb hits
        if (window.game && window.game.particleSystem) {
          window.game.particleSystem.createLargeExplosion(this.x, this.targetY);
        }
      }
      return;
    }
    
    this.x += this.dx * deltaTime / 16;
    this.y += this.dy * deltaTime / 16;
    this.dy += 0.2; // gravity
    this.lifetime -= deltaTime;
    
    if (this.lifetime <= 0) {
      this.active = false;
    }
  }

  render(ctx) {
    // Special rendering for bombs
    if (this.isBomb) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      
      // Draw bomb body
      ctx.fillStyle = '#333333';
      ctx.fillRect(-8, -10, 16, 20);
      
      // Draw bomb fins
      ctx.fillStyle = '#555555';
      ctx.fillRect(-12, -10, 4, 8);
      ctx.fillRect(8, -10, 4, 8);
      ctx.fillRect(-12, 2, 4, 8);
      ctx.fillRect(8, 2, 4, 8);
      
      // Draw bomb tip (nose)
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.moveTo(-8, 10);
      ctx.lineTo(0, 18);
      ctx.lineTo(8, 10);
      ctx.closePath();
      ctx.fill();
      
      // Draw warning stripes
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(-8, -6, 16, 3);
      ctx.fillRect(-8, 3, 16, 3);
      
      ctx.restore();
      return;
    }
    
    const alpha = this.lifetime / this.maxLifetime;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.globalAlpha = 1;
  }
}

class ParticleSystem {
  // Effect thresholds and constants
  static MIN_COMBO_EFFECT_THRESHOLD = 3;
  static MAX_COMBO_PARTICLES = 30;
  
  constructor() {
    this.particles = [];
    this.textPopups = [];
  }

  createExplosion(x, y, count = 20, color = '#ff6600') {
    // Adjust particle count based on quality setting
    const quality = window.game ? window.game.particleQuality : 'high';
    if (quality === 'low') count = Math.floor(count * 0.3);
    else if (quality === 'medium') count = Math.floor(count * 0.6);
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      const lifetime = Math.random() * 500 + 500;
      
      this.particles.push(new Particle(x, y, dx, dy, color, lifetime));
    }
  }

  createSmoke(x, y, count = 10) {
    // Adjust particle count based on quality setting
    const quality = window.game ? window.game.particleQuality : 'high';
    if (quality === 'low') count = Math.floor(count * 0.3);
    else if (quality === 'medium') count = Math.floor(count * 0.6);
    
    for (let i = 0; i < count; i++) {
      const dx = (Math.random() - 0.5) * 2;
      const dy = -Math.random() * 2 - 1;
      const lifetime = Math.random() * 1000 + 1000;
      const gray = Math.floor(Math.random() * 100 + 100);
      const color = `rgb(${gray}, ${gray}, ${gray})`;
      
      this.particles.push(new Particle(x, y, dx, dy, color, lifetime));
    }
  }
  
  createTextPopup(x, y, text, color = '#ffff00') {
    this.textPopups.push({
      x: x,
      y: y,
      text: text,
      color: color,
      lifetime: 1000,
      maxLifetime: 1000,
      dy: -1,
      active: true
    });
  }
  
  createMeleeSlash(x, y, direction) {
    // Create a quick slash effect for melee attacks
    const slashParticles = 8;
    const angleOffset = direction > 0 ? 0 : Math.PI; // Face left or right
    
    for (let i = 0; i < slashParticles; i++) {
      const angle = angleOffset + (Math.PI / 4) * (i / slashParticles - 0.5);
      const speed = 8 + Math.random() * 4;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      const lifetime = 150 + Math.random() * 100;
      
      const particle = new Particle(x, y, dx, dy, '#ffffff', lifetime);
      particle.size = 4 + Math.random() * 3;
      this.particles.push(particle);
    }
  }
  
  createBombDrop(x, y, targetY, delay = 0) {
    // Create a bomb that drops from top of screen
    setTimeout(() => {
      const bomb = new Particle(x, y, 0, 0, '#333333', 10000); // Long lifetime
      bomb.isBomb = true;
      bomb.targetY = targetY;
      bomb.dy = 0;
      bomb.gravity = 0.5;
      bomb.rotation = 0;
      bomb.rotationSpeed = 0.2;
      this.particles.push(bomb);
    }, delay);
  }
  
  createLargeExplosion(x, y) {
    // Create a large explosion for airstrike bombs
    const explosionSize = window.game ? window.game.explosionSize : 1.0;
    const baseCount = 40;
    const count = Math.floor(baseCount * explosionSize);
    
    // Central bright flash
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = Math.random() * 8 + 5;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      const lifetime = Math.random() * 600 + 600;
      
      // Multi-colored explosion (orange, red, yellow)
      const colors = ['#ff4400', '#ff8800', '#ffaa00', '#ffff00', '#ff0000'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const particle = new Particle(x, y, dx, dy, color, lifetime);
      particle.size = Math.random() * 5 + 3;
      this.particles.push(particle);
    }
    
    // Add smoke
    this.createSmoke(x, y, 20);
    
    // Add shockwave effect
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const speed = 12;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      const particle = new Particle(x, y, dx, dy, '#ffffff', 300);
      particle.size = 6;
      this.particles.push(particle);
    }
  }

  /**
   * Create a visual effect for double jump
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  createDoubleJumpEffect(x, y) {
    // Create particles in a downward semicircle
    for (let i = 0; i < 10; i++) {
      const angle = Math.PI * (i / 9); // Spread from 0 to PI (downward semicircle)
      const speed = 3 + Math.random() * 3;
      const dx = Math.cos(angle) * speed - speed / 2;
      const dy = Math.abs(Math.sin(angle)) * speed;
      const particle = new Particle(x, y, dx, dy, '#66ccff', 300 + Math.random() * 200);
      particle.size = 3 + Math.random() * 2;
      this.particles.push(particle);
    }
    
    // Add some sparkle particles
    for (let i = 0; i < 5; i++) {
      const dx = (Math.random() - 0.5) * 6;
      const dy = Math.random() * 2;
      const particle = new Particle(x, y, dx, dy, '#ffffff', 200);
      particle.size = 2;
      this.particles.push(particle);
    }
  }

  update(deltaTime) {
    this.particles = this.particles.filter(p => {
      p.update(deltaTime);
      return p.active;
    });
    
    this.textPopups = this.textPopups.filter(t => {
      t.y += t.dy * deltaTime / 16;
      t.lifetime -= deltaTime;
      if (t.lifetime <= 0) {
        t.active = false;
      }
      return t.active;
    });
  }

  render(ctx) {
    this.particles.forEach(p => p.render(ctx));
    
    this.textPopups.forEach(t => {
      const alpha = t.lifetime / t.maxLifetime;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = t.color;
      ctx.font = 'bold 16px monospace';
      ctx.fillText(t.text, t.x, t.y);
      ctx.globalAlpha = 1;
    });
  }

  clear() {
    this.particles = [];
    this.textPopups = [];
  }

  // ========== ENHANCED GAME FEEL EFFECTS ==========

  /**
   * Create enhanced hit feedback effect with screen flash and particles
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} damage - Damage dealt (affects intensity)
   * @param {string} hitType - Type of hit ('bullet', 'melee', 'explosive', 'critical')
   */
  createHitEffect(x, y, damage = 10, hitType = 'bullet') {
    const quality = window.game ? window.game.particleQuality : 'high';
    let count = Math.ceil(damage / 5);
    
    if (quality === 'low') count = Math.floor(count * 0.3);
    else if (quality === 'medium') count = Math.floor(count * 0.6);
    
    count = Math.max(3, Math.min(count, 25));
    
    // Different colors based on hit type
    const colors = {
      bullet: ['#ff4400', '#ff6600', '#ff8800', '#ffaa00'],
      melee: ['#ffaa00', '#ffcc00', '#ffffff', '#ffff88'],
      explosive: ['#ff2200', '#ff4400', '#ff6600', '#ffff00'],
      critical: ['#ff0000', '#ff4444', '#ffffff', '#ffff00']
    };
    
    const colorSet = colors[hitType] || colors.bullet;
    
    // Create burst of particles
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 5 + (damage / 20);
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      const lifetime = 200 + Math.random() * 300;
      const color = colorSet[Math.floor(Math.random() * colorSet.length)];
      
      const particle = new Particle(x, y, dx, dy, color, lifetime);
      particle.size = 2 + Math.random() * 3;
      this.particles.push(particle);
    }
    
    // Add impact sparks for melee and critical hits
    if (hitType === 'melee' || hitType === 'critical') {
      for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 6 + Math.random() * 4;
        const dx = Math.cos(angle) * speed;
        const dy = Math.sin(angle) * speed - 2;
        const particle = new Particle(x, y, dx, dy, '#ffffff', 150);
        particle.size = 1 + Math.random() * 2;
        this.particles.push(particle);
      }
    }
  }

  /**
   * Create satisfying enemy death effect
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} enemyType - Type of enemy for effect variation
   * @param {boolean} isElite - Whether enemy was elite
   */
  createDeathEffect(x, y, enemyType = 'infantry', isElite = false) {
    const quality = window.game ? window.game.particleQuality : 'high';
    let baseCount = 20;
    
    // More particles for larger enemies
    if (enemyType === 'heavy' || enemyType === 'boss') baseCount = 35;
    else if (enemyType === 'scout') baseCount = 15;
    
    if (isElite) baseCount = Math.floor(baseCount * 1.5);
    
    if (quality === 'low') baseCount = Math.floor(baseCount * 0.3);
    else if (quality === 'medium') baseCount = Math.floor(baseCount * 0.6);
    
    // Death burst
    const colors = isElite 
      ? ['#ffdd00', '#ffaa00', '#ff8800', '#ffffff'] 
      : ['#ff3300', '#ff5500', '#ff7700', '#333333'];
    
    for (let i = 0; i < baseCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 6;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed - 2;
      const lifetime = 400 + Math.random() * 400;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const particle = new Particle(x, y, dx, dy, color, lifetime);
      particle.size = 3 + Math.random() * 4;
      this.particles.push(particle);
    }
    
    // Add smoke cloud
    this.createSmoke(x, y, Math.floor(baseCount / 3));
    
    // Add debris for larger enemies
    if (enemyType === 'heavy' || enemyType === 'boss') {
      this.createDebris(x, y, 8);
    }
  }

  /**
   * Create debris particles (for destruction effects)
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} count - Number of debris particles
   */
  createDebris(x, y, count = 5) {
    const quality = window.game ? window.game.particleQuality : 'high';
    if (quality === 'low') count = Math.floor(count * 0.3);
    else if (quality === 'medium') count = Math.floor(count * 0.6);
    
    const debrisColors = ['#4a4a4a', '#5a5a5a', '#3a3a3a', '#6a5a4a'];
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed - 3; // Initial upward boost
      const lifetime = 600 + Math.random() * 600;
      const color = debrisColors[Math.floor(Math.random() * debrisColors.length)];
      
      const particle = new Particle(x, y, dx, dy, color, lifetime);
      particle.size = 4 + Math.random() * 4;
      this.particles.push(particle);
    }
  }

  /**
   * Create muzzle flash effect
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} direction - Direction (-1 left, 1 right)
   * @param {string} weaponType - Type of weapon for effect variation
   */
  createMuzzleFlash(x, y, direction = 1, weaponType = 'pistol') {
    const quality = window.game ? window.game.particleQuality : 'high';
    if (quality === 'low') return; // Skip for low quality
    
    const flashColors = ['#ffff88', '#ffff00', '#ffaa00', '#ff8800'];
    
    // Weapon-specific flash settings
    const settings = {
      pistol: { count: 4, spread: 0.3, speed: 8 },
      rifle: { count: 6, spread: 0.2, speed: 10 },
      shotgun: { count: 10, spread: 0.8, speed: 6 },
      machinegun: { count: 5, spread: 0.25, speed: 12 },
      sniper: { count: 8, spread: 0.1, speed: 15 }
    };
    
    const config = settings[weaponType] || settings.pistol;
    let count = config.count;
    if (quality === 'medium') count = Math.floor(count * 0.6);
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() - 0.5) * config.spread;
      const speed = config.speed + Math.random() * 4;
      const dx = Math.cos(angle) * speed * direction;
      const dy = Math.sin(angle) * speed;
      const lifetime = 50 + Math.random() * 80;
      const color = flashColors[Math.floor(Math.random() * flashColors.length)];
      
      const particle = new Particle(x, y, dx, dy, color, lifetime);
      particle.size = 2 + Math.random() * 3;
      this.particles.push(particle);
    }
  }

  /**
   * Create power-up collection effect
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} powerupType - Type of power-up
   */
  createPowerupEffect(x, y, powerupType = 'health') {
    const quality = window.game ? window.game.particleQuality : 'high';
    let count = 15;
    if (quality === 'low') count = 5;
    else if (quality === 'medium') count = 10;
    
    // Color based on power-up type
    const colorMap = {
      health: '#00ff00',
      ammo: '#ffff00',
      damage_boost: '#ff0000',
      speed: '#00ffff',
      rapid_fire: '#ff6600',
      multi_shot: '#ff00ff',
      invincibility: '#ffffff',
      shield: '#00aaff'
    };
    
    const baseColor = colorMap[powerupType] || '#ffffff';
    
    // Create spiral rising particles
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 4; // 2 full rotations
      const radius = 5 + (i / count) * 20;
      const dx = Math.cos(angle) * 2;
      const dy = -3 - (i / count) * 3; // Rising
      const lifetime = 300 + Math.random() * 200;
      
      const particle = new Particle(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, dx, dy, baseColor, lifetime);
      particle.size = 3 + Math.random() * 2;
      this.particles.push(particle);
    }
    
    // Add sparkle burst
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const speed = 5;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      const particle = new Particle(x, y, dx, dy, '#ffffff', 200);
      particle.size = 2;
      this.particles.push(particle);
    }
  }

  /**
   * Create landing dust effect
   * @param {number} x - X position
   * @param {number} y - Ground Y position
   * @param {number} velocity - Landing velocity (affects intensity)
   */
  createLandingDust(x, y, velocity = 5) {
    const quality = window.game ? window.game.particleQuality : 'high';
    if (quality === 'low' && velocity < 10) return;
    
    let count = Math.min(Math.floor(velocity / 2), 10);
    if (quality === 'low') count = Math.floor(count * 0.3);
    else if (quality === 'medium') count = Math.floor(count * 0.6);
    
    const dustColors = ['#8a7a6a', '#9a8a7a', '#7a6a5a', '#a09080'];
    
    for (let i = 0; i < count; i++) {
      const direction = (i % 2 === 0) ? 1 : -1;
      const dx = direction * (1 + Math.random() * 3);
      const dy = -0.5 - Math.random() * 2;
      const lifetime = 300 + Math.random() * 200;
      const color = dustColors[Math.floor(Math.random() * dustColors.length)];
      
      const particle = new Particle(x + (Math.random() - 0.5) * 20, y, dx, dy, color, lifetime);
      particle.size = 3 + Math.random() * 3;
      this.particles.push(particle);
    }
  }

  /**
   * Create combo milestone effect (visual celebration for high combos)
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} comboLevel - Current combo level
   */
  createComboEffect(x, y, comboLevel) {
    if (comboLevel < ParticleSystem.MIN_COMBO_EFFECT_THRESHOLD) return;
    
    const quality = window.game ? window.game.particleQuality : 'high';
    if (quality === 'low') return;
    
    let count = Math.min(comboLevel * 3, ParticleSystem.MAX_COMBO_PARTICLES);
    if (quality === 'medium') count = Math.floor(count * 0.6);
    
    // Rainbow colors for high combos
    const colors = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#00ffff', '#0088ff', '#8800ff'];
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 4 + Math.random() * 4;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed - 2;
      const lifetime = 400 + Math.random() * 300;
      const color = colors[i % colors.length];
      
      const particle = new Particle(x, y, dx, dy, color, lifetime);
      particle.size = 3 + Math.random() * 2;
      this.particles.push(particle);
    }
    
    // Show combo text
    this.createTextPopup(x, y - 30, `${comboLevel}x COMBO!`, '#ffff00');
  }

  /**
   * Create parry/block success effect
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {boolean} isPerfectParry - Whether it was a perfect parry
   */
  createParryEffect(x, y, isPerfectParry = false) {
    const quality = window.game ? window.game.particleQuality : 'high';
    
    let count = isPerfectParry ? 15 : 8;
    if (quality === 'low') count = Math.floor(count * 0.3);
    else if (quality === 'medium') count = Math.floor(count * 0.6);
    
    const color = isPerfectParry ? '#ffff00' : '#00aaff';
    
    // Create circular burst
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = isPerfectParry ? 8 : 5;
      const dx = Math.cos(angle) * speed;
      const dy = Math.sin(angle) * speed;
      const lifetime = 200 + Math.random() * 150;
      
      const particle = new Particle(x, y, dx, dy, color, lifetime);
      particle.size = isPerfectParry ? 4 : 3;
      this.particles.push(particle);
    }
    
    // Add sparkles for perfect parry
    if (isPerfectParry) {
      for (let i = 0; i < 8; i++) {
        const dx = (Math.random() - 0.5) * 6;
        const dy = (Math.random() - 0.5) * 6;
        const particle = new Particle(x, y, dx, dy, '#ffffff', 150);
        particle.size = 2;
        this.particles.push(particle);
      }
    }
  }

  /**
   * Create environmental dust/debris particles
   * @param {number} x - X position
   * @param {number} y - Y position  
   * @param {string} type - Type of environment ('dust', 'sparks', 'embers', 'snow', 'sand')
   */
  createEnvironmentalEffect(x, y, type = 'dust') {
    const quality = window.game ? window.game.particleQuality : 'high';
    if (quality === 'low') return;
    
    let count = 5;
    if (quality === 'medium') count = 3;
    
    const configs = {
      dust: { colors: ['#8a7a6a', '#7a6a5a'], dx: 0.5, dy: -0.3, lifetime: 400 },
      sparks: { colors: ['#ffaa00', '#ff8800', '#ffff00'], dx: 2, dy: -3, lifetime: 300 },
      embers: { colors: ['#ff4400', '#ff6600', '#ff8800'], dx: 1, dy: -2, lifetime: 500 },
      snow: { colors: ['#ffffff', '#e8e8f0'], dx: 0.2, dy: 1, lifetime: 600 },
      sand: { colors: ['#c0a060', '#b09050'], dx: 1.5, dy: -0.5, lifetime: 350 }
    };
    
    const config = configs[type] || configs.dust;
    
    for (let i = 0; i < count; i++) {
      const dx = (Math.random() - 0.5) * config.dx * 4;
      const dy = config.dy + (Math.random() - 0.5) * 2;
      const color = config.colors[Math.floor(Math.random() * config.colors.length)];
      const lifetime = config.lifetime + Math.random() * 200;
      
      const particle = new Particle(x + (Math.random() - 0.5) * 30, y, dx, dy, color, lifetime);
      particle.size = 2 + Math.random() * 2;
      this.particles.push(particle);
    }
  }

  /**
   * Create roll/dodge trail effect
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} direction - Direction (-1 left, 1 right)
   */
  createRollTrail(x, y, direction = 1) {
    const quality = window.game ? window.game.particleQuality : 'high';
    if (quality === 'low') return;
    
    let count = 4;
    if (quality === 'medium') count = 2;
    
    for (let i = 0; i < count; i++) {
      const dx = -direction * (1 + Math.random() * 2);
      const dy = (Math.random() - 0.5) * 2;
      const color = '#8888aa';
      const lifetime = 150 + Math.random() * 100;
      
      const particle = new Particle(x, y + Math.random() * 20, dx, dy, color, lifetime);
      particle.size = 3 + Math.random() * 2;
      this.particles.push(particle);
    }
  }
}
