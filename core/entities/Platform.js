// Platform entity for multi-floor level design with enhanced variety
class Platform extends Entity {
  constructor(x, y, width, height, type = 'solid') {
    super(x, y, width, height);
    this.type = 'platform';
    this.platformType = type; // solid, passthrough, moving, crumbling, bounce
    this.color = '#4a4a3a';
    
    // Moving platform properties
    this.isMoving = type === 'moving';
    this.moveSpeed = 1.5;
    this.moveDirection = 1;
    this.moveRange = 200;
    this.startX = x;
    this.startY = y;
    this.moveAxis = 'horizontal'; // horizontal, vertical
    
    // Crumbling platform properties
    this.isCrumbling = type === 'crumbling';
    this.crumbleTimer = 0;
    this.crumbleDelay = 500; // ms before crumbling starts
    this.crumbleDuration = 1500; // ms to fully crumble
    this.isTriggered = false;
    this.crumbleProgress = 0;
    this.respawnTimer = 0;
    this.respawnDelay = 5000; // ms before respawning
    
    // Bounce platform properties
    this.isBounce = type === 'bounce';
    this.bounceForce = -18; // Strong upward velocity
    this.bounceAnimation = 0;
    
    // Visual variety
    this.variant = Math.floor(Math.random() * 3);
    this.damaged = Math.random() < 0.3;
  }

  /**
   * Trigger crumbling for crumbling platforms
   */
  triggerCrumble() {
    if (this.isCrumbling && !this.isTriggered && this.active) {
      this.isTriggered = true;
      this.crumbleTimer = performance.now();
    }
  }

  /**
   * Apply bounce effect to an entity
   * @param {Entity} entity - Entity to bounce
   */
  applyBounce(entity) {
    if (this.isBounce && entity && entity.dy >= 0) {
      entity.dy = this.bounceForce;
      entity.onGround = false;
      this.bounceAnimation = 1;
      
      // Play bounce sound
      if (window.game && window.game.audioManager) {
        window.game.audioManager.playSound('jump', 0.5);
      }
      
      // Create bounce particles
      if (window.game && window.game.particleSystem) {
        for (let i = 0; i < 8; i++) {
          const angle = Math.PI + (Math.random() - 0.5) * 0.8;
          const speed = 4 + Math.random() * 3;
          const dx = Math.cos(angle) * speed;
          const dy = Math.sin(angle) * speed;
          const particle = new Particle(
            entity.x + entity.width / 2,
            this.y,
            dx, dy,
            '#00ff88',
            300
          );
          particle.size = 3;
          window.game.particleSystem.particles.push(particle);
        }
      }
    }
  }

  update(deltaTime) {
    const dt = deltaTime / 16;
    const currentTime = performance.now();
    
    // Update moving platform
    if (this.isMoving && this.active) {
      if (this.moveAxis === 'horizontal') {
        this.x += this.moveSpeed * this.moveDirection * dt;
        
        if (this.x > this.startX + this.moveRange || this.x < this.startX - this.moveRange) {
          this.moveDirection *= -1;
        }
      } else {
        this.y += this.moveSpeed * this.moveDirection * dt;
        
        if (this.y > this.startY + this.moveRange || this.y < this.startY - this.moveRange) {
          this.moveDirection *= -1;
        }
      }
    }
    
    // Update crumbling platform
    if (this.isCrumbling && this.isTriggered && this.active) {
      const elapsed = currentTime - this.crumbleTimer;
      
      if (elapsed > this.crumbleDelay) {
        this.crumbleProgress = Math.min(1, (elapsed - this.crumbleDelay) / this.crumbleDuration);
        
        // Create falling debris particles
        if (window.game && window.game.particleSystem && Math.random() < this.crumbleProgress * 0.3) {
          window.game.particleSystem.createDebris(
            this.x + Math.random() * this.width,
            this.y + this.height,
            2
          );
        }
        
        if (this.crumbleProgress >= 1) {
          this.active = false;
          this.respawnTimer = currentTime;
        }
      }
    }
    
    // Handle respawning
    if (!this.active && this.isCrumbling && this.respawnTimer > 0) {
      if (currentTime - this.respawnTimer > this.respawnDelay) {
        this.active = true;
        this.isTriggered = false;
        this.crumbleProgress = 0;
        this.respawnTimer = 0;
      }
    }
    
    // Update bounce animation
    if (this.bounceAnimation > 0) {
      this.bounceAnimation = Math.max(0, this.bounceAnimation - 0.1);
    }
  }

  render(ctx) {
    if (!this.active) return;
    
    // === 16-BIT ARCADE PLATFORM STYLE ===
    
    // Platform colors (metallic/industrial look)
    let platformBase = '#5a5a4a';
    let platformDark = '#3a3a2a';
    let platformLight = '#7a7a6a';
    let metalAccent = '#8a8a7a';
    
    // Adjust colors based on platform type
    if (this.isBounce) {
      platformBase = '#3a6a4a';
      platformDark = '#2a4a3a';
      platformLight = '#5a8a6a';
      metalAccent = '#00ff88';
    } else if (this.isCrumbling) {
      // Darken as it crumbles
      const fade = 1 - this.crumbleProgress * 0.5;
      platformBase = this.adjustBrightness('#5a4a3a', fade);
      platformDark = this.adjustBrightness('#3a2a1a', fade);
      platformLight = this.adjustBrightness('#7a6a5a', fade);
    } else if (this.isMoving) {
      platformBase = '#4a5a6a';
      platformDark = '#3a4a5a';
      platformLight = '#6a7a8a';
      metalAccent = '#00aaff';
    }
    
    ctx.save();
    
    // Apply crumble shake
    if (this.isCrumbling && this.isTriggered && this.crumbleProgress > 0) {
      const shake = Math.sin(performance.now() / 20) * this.crumbleProgress * 3;
      ctx.translate(shake, 0);
      ctx.globalAlpha = 1 - this.crumbleProgress * 0.3;
    }
    
    // Apply bounce compression
    if (this.bounceAnimation > 0) {
      const scaleY = 1 - this.bounceAnimation * 0.3;
      const scaleX = 1 + this.bounceAnimation * 0.1;
      ctx.translate(this.x + this.width / 2, this.y + this.height);
      ctx.scale(scaleX, scaleY);
      ctx.translate(-(this.x + this.width / 2), -(this.y + this.height));
    }
    
    // Main platform body
    ctx.fillStyle = platformBase;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Top highlight (16-bit shading)
    ctx.fillStyle = platformLight;
    ctx.fillRect(this.x, this.y, this.width, 4);
    
    // Bottom shadow
    ctx.fillStyle = platformDark;
    ctx.fillRect(this.x, this.y + this.height - 4, this.width, 4);
    
    // Side shadows
    ctx.fillRect(this.x, this.y, 3, this.height);
    ctx.fillRect(this.x + this.width - 3, this.y, 3, this.height);
    
    // Metal rivets/bolts (16-bit detail)
    ctx.fillStyle = metalAccent;
    for (let i = 0; i < this.width; i += 30) {
      // Top rivets
      ctx.fillRect(this.x + i + 5, this.y + 2, 3, 3);
      // Bottom rivets
      ctx.fillRect(this.x + i + 5, this.y + this.height - 5, 3, 3);
    }
    
    // Grid pattern (16-bit texture)
    ctx.fillStyle = platformDark;
    for (let i = 0; i < this.width; i += 20) {
      ctx.fillRect(this.x + i, this.y + 6, 1, this.height - 12);
    }
    
    // Damage details for damaged platforms
    if (this.damaged && !this.isCrumbling) {
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(this.x + 10 + this.variant * 15, this.y + 5, 8, 4);
      ctx.fillRect(this.x + this.width - 25 + this.variant * 5, this.y + 8, 6, 5);
    }
    
    // Border outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    // Visual indicator for passthrough platforms
    if (this.platformType === 'passthrough') {
      ctx.fillStyle = '#00ff00';
      ctx.globalAlpha = 0.3;
      ctx.fillRect(this.x, this.y, this.width, 2);
      ctx.globalAlpha = 1;
    }
    
    // Moving platform indicator
    if (this.isMoving) {
      ctx.fillStyle = metalAccent;
      ctx.globalAlpha = 0.5 + Math.sin(performance.now() / 300) * 0.3;
      const arrowX = this.x + this.width / 2 - 10;
      const arrowY = this.y + this.height / 2 - 4;
      
      // Direction arrows
      if (this.moveAxis === 'horizontal') {
        ctx.fillRect(arrowX, arrowY, 20, 3);
        ctx.fillRect(arrowX + 2, arrowY - 2, 5, 7);
        ctx.fillRect(arrowX + 13, arrowY - 2, 5, 7);
      } else {
        ctx.fillRect(arrowX + 8, arrowY - 5, 3, 15);
      }
      ctx.globalAlpha = 1;
    }
    
    // Bounce platform glow
    if (this.isBounce) {
      ctx.fillStyle = '#00ff88';
      ctx.globalAlpha = 0.3 + Math.sin(performance.now() / 200) * 0.2 + this.bounceAnimation * 0.3;
      ctx.fillRect(this.x, this.y - 2, this.width, 4);
      ctx.globalAlpha = 1;
    }
    
    ctx.restore();
  }

  /**
   * Adjust color brightness
   * @param {string} hex - Hex color
   * @param {number} factor - Brightness factor (0-1)
   * @returns {string} Adjusted hex color
   */
  adjustBrightness(hex, factor) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    const newR = Math.min(255, Math.floor(r * factor));
    const newG = Math.min(255, Math.floor(g * factor));
    const newB = Math.min(255, Math.floor(b * factor));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }
}
