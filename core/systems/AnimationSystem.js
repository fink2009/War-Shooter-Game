// Animation System - Frame-based sprite animation support
class AnimationSystem {
  constructor() {
    this.animations = new Map();
    this.activeAnimations = [];
  }

  /**
   * Register an animation definition
   * @param {string} id - Unique animation ID
   * @param {Object} definition - Animation definition
   */
  registerAnimation(id, definition) {
    this.animations.set(id, {
      id: id,
      frames: definition.frames || [],
      frameRate: definition.frameRate || 10,
      loop: definition.loop !== false,
      onComplete: definition.onComplete || null,
      onFrame: definition.onFrame || null,
      ...definition
    });
  }

  /**
   * Create an animation instance
   * @param {string} animationId - ID of registered animation
   * @returns {SpriteAnimation} Animation instance
   */
  createInstance(animationId) {
    const definition = this.animations.get(animationId);
    if (!definition) {
      console.warn(`AnimationSystem: Animation "${animationId}" not found`);
      return null;
    }
    return new SpriteAnimation(definition);
  }

  /**
   * Update all active animations
   * @param {number} deltaTime - Time since last update
   */
  updateAll(deltaTime) {
    this.activeAnimations.forEach(anim => anim.update(deltaTime));
    // Remove completed non-looping animations
    this.activeAnimations = this.activeAnimations.filter(anim => !anim.isComplete || anim.loop);
  }

  /**
   * Get predefined player animations
   */
  getPlayerAnimations() {
    return {
      idle: {
        frames: [0, 1],
        frameRate: 2,
        loop: true
      },
      walk: {
        frames: [0, 1],
        frameRate: 8,
        loop: true
      },
      run: {
        frames: [0, 1, 2, 3],
        frameRate: 12,
        loop: true
      },
      jump: {
        frames: [0, 1],
        frameRate: 6,
        loop: false
      },
      shoot: {
        frames: [0, 1, 2],
        frameRate: 15,
        loop: false
      },
      roll: {
        frames: [0, 1, 2, 3],
        frameRate: 15,
        loop: false
      },
      death: {
        frames: [0, 1, 2, 3],
        frameRate: 8,
        loop: false
      }
    };
  }

  /**
   * Get predefined enemy animations
   */
  getEnemyAnimations() {
    return {
      idle: {
        frames: [0, 1],
        frameRate: 2,
        loop: true
      },
      walk: {
        frames: [0, 1],
        frameRate: 6,
        loop: true
      },
      shoot: {
        frames: [0, 1],
        frameRate: 12,
        loop: false
      },
      hit: {
        frames: [0, 1],
        frameRate: 10,
        loop: false
      },
      death: {
        frames: [0, 1, 2, 3],
        frameRate: 10,
        loop: false
      }
    };
  }

  /**
   * Get predefined weapon animations
   */
  getWeaponAnimations() {
    return {
      fire: {
        frames: [0, 1, 2],
        frameRate: 20,
        loop: false
      },
      reload: {
        frames: [0, 1, 2, 3],
        frameRate: 8,
        loop: false
      },
      muzzleFlash: {
        frames: [0, 1, 2],
        frameRate: 30,
        loop: false
      }
    };
  }

  /**
   * Get predefined UI animations
   */
  getUIAnimations() {
    return {
      healthPulse: {
        frames: [0, 1],
        frameRate: 4,
        loop: true
      },
      ammoFlash: {
        frames: [0, 1],
        frameRate: 6,
        loop: true
      },
      scorePopup: {
        frames: [0, 1, 2, 3, 4],
        frameRate: 10,
        loop: false
      },
      fadeIn: {
        frames: [0, 1, 2, 3, 4],
        frameRate: 15,
        loop: false
      },
      fadeOut: {
        frames: [4, 3, 2, 1, 0],
        frameRate: 15,
        loop: false
      }
    };
  }
}

/**
 * Sprite Animation - Individual animation instance
 */
class SpriteAnimation {
  constructor(definition) {
    this.id = definition.id || 'unnamed';
    this.frames = definition.frames || [0];
    this.frameRate = definition.frameRate || 10;
    this.loop = definition.loop !== false;
    this.onComplete = definition.onComplete || null;
    this.onFrame = definition.onFrame || null;
    
    // State
    this.currentFrame = 0;
    this.frameIndex = 0;
    this.frameTimer = 0;
    this.frameDuration = 1000 / this.frameRate;
    this.isPlaying = false;
    this.isComplete = false;
    this.isPaused = false;
    
    // Blending
    this.blendTarget = null;
    this.blendProgress = 0;
    this.blendDuration = 0;
  }

  /**
   * Play the animation from the beginning
   */
  play() {
    this.isPlaying = true;
    this.isComplete = false;
    this.isPaused = false;
    this.frameIndex = 0;
    this.frameTimer = 0;
    this.currentFrame = this.frames[0];
  }

  /**
   * Stop the animation
   */
  stop() {
    this.isPlaying = false;
    this.frameIndex = 0;
    this.frameTimer = 0;
    this.currentFrame = this.frames[0];
  }

  /**
   * Pause the animation
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * Resume the animation
   */
  resume() {
    this.isPaused = false;
  }

  /**
   * Update the animation
   * @param {number} deltaTime - Time since last update in ms
   */
  update(deltaTime) {
    if (!this.isPlaying || this.isPaused || this.isComplete) return;
    
    // Handle blending
    if (this.blendTarget) {
      this.blendProgress += deltaTime / this.blendDuration;
      if (this.blendProgress >= 1) {
        // Blend complete
        this.frames = this.blendTarget.frames;
        this.frameRate = this.blendTarget.frameRate;
        this.loop = this.blendTarget.loop;
        this.frameDuration = 1000 / this.frameRate;
        this.blendTarget = null;
        this.blendProgress = 0;
      }
    }
    
    this.frameTimer += deltaTime;
    
    if (this.frameTimer >= this.frameDuration) {
      this.frameTimer -= this.frameDuration;
      this.frameIndex++;
      
      // Fire frame callback
      if (this.onFrame) {
        this.onFrame(this.frameIndex, this.currentFrame);
      }
      
      if (this.frameIndex >= this.frames.length) {
        if (this.loop) {
          this.frameIndex = 0;
        } else {
          this.isComplete = true;
          this.isPlaying = false;
          if (this.onComplete) {
            this.onComplete();
          }
          return;
        }
      }
      
      this.currentFrame = this.frames[this.frameIndex];
    }
  }

  /**
   * Get the current frame index
   * @returns {number} Current frame
   */
  getFrame() {
    return this.currentFrame;
  }

  /**
   * Get animation progress (0-1)
   * @returns {number} Progress
   */
  getProgress() {
    return this.frameIndex / this.frames.length;
  }

  /**
   * Blend to another animation
   * @param {SpriteAnimation} targetAnim - Target animation
   * @param {number} duration - Blend duration in ms
   */
  blendTo(targetAnim, duration = 200) {
    this.blendTarget = targetAnim;
    this.blendProgress = 0;
    this.blendDuration = duration;
  }

  /**
   * Set frame rate
   * @param {number} fps - Frames per second
   */
  setFrameRate(fps) {
    this.frameRate = fps;
    this.frameDuration = 1000 / fps;
  }

  /**
   * Reset to first frame
   */
  reset() {
    this.frameIndex = 0;
    this.frameTimer = 0;
    this.currentFrame = this.frames[0];
    this.isComplete = false;
  }
}

/**
 * Entity Animator - Manages animations for a game entity
 */
class EntityAnimator {
  constructor(entity) {
    this.entity = entity;
    this.animations = new Map();
    this.currentAnimation = null;
    this.currentAnimationId = null;
    this.defaultAnimation = null;
  }

  /**
   * Add an animation
   * @param {string} id - Animation ID
   * @param {SpriteAnimation} animation - Animation instance
   */
  addAnimation(id, animation) {
    this.animations.set(id, animation);
  }

  /**
   * Set the default animation
   * @param {string} id - Animation ID
   */
  setDefault(id) {
    this.defaultAnimation = id;
    if (!this.currentAnimation) {
      this.play(id);
    }
  }

  /**
   * Play an animation
   * @param {string} id - Animation ID
   * @param {boolean} force - Force restart if already playing
   */
  play(id, force = false) {
    if (this.currentAnimationId === id && !force) return;
    
    const animation = this.animations.get(id);
    if (!animation) {
      console.warn(`EntityAnimator: Animation "${id}" not found`);
      return;
    }
    
    this.currentAnimation = animation;
    this.currentAnimationId = id;
    this.currentAnimation.play();
  }

  /**
   * Blend to an animation
   * @param {string} id - Animation ID
   * @param {number} duration - Blend duration
   */
  blendTo(id, duration = 200) {
    const animation = this.animations.get(id);
    if (!animation || !this.currentAnimation) return;
    
    this.currentAnimation.blendTo(animation, duration);
    this.currentAnimationId = id;
  }

  /**
   * Update the animator
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    if (this.currentAnimation) {
      this.currentAnimation.update(deltaTime);
      
      // Return to default when animation completes
      if (this.currentAnimation.isComplete && this.defaultAnimation) {
        this.play(this.defaultAnimation);
      }
    }
  }

  /**
   * Get current frame
   * @returns {number} Current frame
   */
  getFrame() {
    return this.currentAnimation ? this.currentAnimation.getFrame() : 0;
  }

  /**
   * Get current animation ID
   * @returns {string} Current animation ID
   */
  getCurrentId() {
    return this.currentAnimationId;
  }

  /**
   * Check if an animation is playing
   * @param {string} id - Animation ID
   * @returns {boolean} Is playing
   */
  isPlaying(id) {
    return this.currentAnimationId === id && this.currentAnimation && this.currentAnimation.isPlaying;
  }
}

/**
 * Animation Presets - Common animation effects
 */
const AnimationPresets = {
  /**
   * Create a flash effect (for damage)
   */
  createFlash(duration = 300, color = '#ff0000') {
    return {
      type: 'flash',
      duration: duration,
      color: color,
      timer: 0,
      active: true,
      update(deltaTime) {
        this.timer += deltaTime;
        if (this.timer >= this.duration) {
          this.active = false;
        }
      },
      render(ctx, entity) {
        if (!this.active) return;
        const flashOn = Math.floor(this.timer / 50) % 2 === 0;
        if (flashOn) {
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = this.color;
          ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
          ctx.globalAlpha = 1;
        }
      }
    };
  },

  /**
   * Create a scale pulse effect
   */
  createPulse(duration = 500, scale = 1.2) {
    return {
      type: 'pulse',
      duration: duration,
      scale: scale,
      timer: 0,
      active: true,
      update(deltaTime) {
        this.timer += deltaTime;
        if (this.timer >= this.duration) {
          this.active = false;
        }
      },
      getScale() {
        const progress = this.timer / this.duration;
        return 1 + (this.scale - 1) * Math.sin(progress * Math.PI);
      }
    };
  },

  /**
   * Create a fade effect
   */
  createFade(duration = 500, fadeIn = true) {
    return {
      type: 'fade',
      duration: duration,
      fadeIn: fadeIn,
      timer: 0,
      active: true,
      update(deltaTime) {
        this.timer += deltaTime;
        if (this.timer >= this.duration) {
          this.active = false;
        }
      },
      getAlpha() {
        const progress = this.timer / this.duration;
        return this.fadeIn ? progress : (1 - progress);
      }
    };
  },

  /**
   * Create a shake effect
   */
  createShake(duration = 200, intensity = 5) {
    return {
      type: 'shake',
      duration: duration,
      intensity: intensity,
      timer: 0,
      active: true,
      update(deltaTime) {
        this.timer += deltaTime;
        if (this.timer >= this.duration) {
          this.active = false;
        }
      },
      getOffset() {
        if (!this.active) return { x: 0, y: 0 };
        const decay = 1 - (this.timer / this.duration);
        return {
          x: (Math.random() - 0.5) * this.intensity * decay * 2,
          y: (Math.random() - 0.5) * this.intensity * decay * 2
        };
      }
    };
  }
};
