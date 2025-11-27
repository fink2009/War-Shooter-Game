// Cutscene Manager - Main orchestrator for boss intro cutscenes
// State machine: idle, playing, paused, skipped
class CutsceneManager {
  constructor() {
    this.state = 'idle'; // idle, playing, paused, skipped
    this.currentCutscene = null;
    this.currentTime = 0; // Current playback time in ms
    this.startTime = 0; // When cutscene started (performance.now())
    this.pauseTime = 0; // Time when paused
    
    // Sub-systems
    this.camera = null; // CutsceneCamera instance
    this.subtitleRenderer = null; // SubtitleRenderer instance
    
    // Event callbacks
    this.onComplete = null; // Called when cutscene finishes
    this.onSkip = null; // Called when cutscene is skipped
    
    // Active elements tracking
    this.activeShot = null;
    this.activeDialogue = null;
    this.activeAnimations = [];
    this.triggeredEvents = new Set(); // Track which events have been triggered
    
    // Reference to game objects
    this.gameEngine = null;
    this.boss = null;
    this.player = null;
    
    // Skip key handling
    this.skipKeyPressed = false;
    this.skipHoldTime = 0;
    this.skipRequiredHoldTime = 500; // Hold for 500ms to skip
  }

  /**
   * Initialize the cutscene manager with game references
   * @param {GameEngine} gameEngine - Reference to the main game engine
   */
  init(gameEngine) {
    this.gameEngine = gameEngine;
    
    // Create camera and subtitle renderer if they don't exist
    if (!this.camera) {
      this.camera = new CutsceneCamera(gameEngine.canvas.width, gameEngine.canvas.height);
    }
    if (!this.subtitleRenderer) {
      this.subtitleRenderer = new SubtitleRenderer(gameEngine.canvas.width, gameEngine.canvas.height);
    }
  }

  /**
   * Load a cutscene from JSON data
   * @param {Object} cutsceneData - The cutscene configuration object
   * @param {Object} boss - Reference to the boss entity
   * @param {Object} player - Reference to the player entity
   */
  loadCutscene(cutsceneData, boss, player) {
    this.currentCutscene = cutsceneData;
    this.boss = boss;
    this.player = player;
    this.currentTime = 0;
    this.triggeredEvents.clear();
    this.activeShot = null;
    this.activeDialogue = null;
    this.activeAnimations = [];
    
    // Initialize camera with world bounds
    if (this.gameEngine) {
      this.camera.setWorldBounds(this.gameEngine.worldWidth, this.gameEngine.worldHeight);
      this.camera.setCanvasSize(this.gameEngine.canvas.width, this.gameEngine.canvas.height);
    }
    
    // Reset camera to initial state
    this.camera.reset();
    
    // Clear any existing subtitles
    this.subtitleRenderer.clear();
  }

  /**
   * Start playing the loaded cutscene
   * @param {Function} onComplete - Callback when cutscene ends normally
   * @param {Function} onSkip - Callback when cutscene is skipped
   */
  play(onComplete, onSkip) {
    if (!this.currentCutscene) {
      console.error('CutsceneManager: No cutscene loaded');
      return;
    }
    
    this.state = 'playing';
    this.startTime = performance.now();
    this.currentTime = 0;
    this.onComplete = onComplete;
    this.onSkip = onSkip;
    this.skipKeyPressed = false;
    this.skipHoldTime = 0;
    
    // Trigger initial audio cue if present
    this.processAudioCues(0);
  }

  /**
   * Pause the cutscene
   */
  pause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.pauseTime = performance.now();
    }
  }

  /**
   * Resume from pause
   */
  resume() {
    if (this.state === 'paused') {
      this.state = 'playing';
      // Adjust start time to account for pause duration
      const pauseDuration = performance.now() - this.pauseTime;
      this.startTime += pauseDuration;
    }
  }

  /**
   * Skip the cutscene immediately
   */
  skip() {
    if (this.state !== 'playing' && this.state !== 'paused') return;
    
    this.state = 'skipped';
    
    // Clean up
    this.subtitleRenderer.clear();
    this.camera.reset();
    
    // Reset cutscene data BEFORE callback to allow chaining cutscenes
    this.currentCutscene = null;
    this.state = 'idle';
    
    // Store callback reference before clearing
    const callback = this.onSkip;
    this.onComplete = null;
    this.onSkip = null;
    
    // Callback (may start a new cutscene)
    if (callback) {
      callback();
    }
  }

  /**
   * Handle skip key input (ESC or SPACE)
   * @param {Object} inputManager - The game's input manager
   * @param {number} deltaTime - Time since last frame in ms
   */
  handleSkipInput(inputManager, deltaTime) {
    if (this.state !== 'playing' && this.state !== 'paused') return;
    
    // Check for single key press (wasKeyPressed) for immediate skip
    const skipPressedOnce = inputManager.wasKeyPressed('Escape') || inputManager.wasKeyPressed('Space') || inputManager.wasKeyPressed(' ');
    
    if (skipPressedOnce) {
      // Immediate skip on single key press
      this.skip();
      return;
    }
    
    // Also support hold-to-skip for those who prefer it
    const skipHeld = inputManager.isKeyPressed('Escape') || inputManager.isKeyPressed('Space') || inputManager.isKeyPressed(' ');
    
    if (skipHeld) {
      if (this.skipKeyPressed) {
        this.skipHoldTime += deltaTime;
        if (this.skipHoldTime >= this.skipRequiredHoldTime) {
          this.skip();
        }
      } else {
        this.skipKeyPressed = true;
        this.skipHoldTime = 0;
      }
    } else {
      this.skipKeyPressed = false;
      this.skipHoldTime = 0;
    }
  }

  /**
   * Get skip progress (0-1) for UI display
   * @returns {number} Progress from 0 to 1
   */
  getSkipProgress() {
    if (!this.skipKeyPressed) return 0;
    return Math.min(this.skipHoldTime / this.skipRequiredHoldTime, 1);
  }

  /**
   * Update the cutscene (called every frame)
   * @param {number} deltaTime - Time since last frame in ms
   */
  update(deltaTime) {
    if (this.state !== 'playing') return;
    
    // Update current time based on real time elapsed
    this.currentTime = performance.now() - this.startTime;
    
    // Check if cutscene has ended
    if (this.currentCutscene && this.currentTime >= this.currentCutscene.duration) {
      this.complete();
      return;
    }
    
    // Process timeline events
    this.processShots(this.currentTime);
    this.processDialogue(this.currentTime);
    this.processAnimations(this.currentTime);
    this.processAudioCues(this.currentTime);
    
    // Update camera
    this.camera.update(deltaTime, this.boss, this.player);
    
    // Update subtitle renderer
    this.subtitleRenderer.update(deltaTime);
  }

  /**
   * Process camera shots based on current time
   * @param {number} time - Current playback time in ms
   */
  processShots(time) {
    if (!this.currentCutscene || !this.currentCutscene.shots) return;
    
    // Find active shot
    let activeShot = null;
    for (const shot of this.currentCutscene.shots) {
      if (time >= shot.time && time < shot.time + shot.duration) {
        activeShot = shot;
        break;
      }
    }
    
    // Update camera if shot changed
    if (activeShot && activeShot !== this.activeShot) {
      this.activeShot = activeShot;
      this.camera.executeShot(activeShot, this.boss, this.player);
    }
  }

  /**
   * Process dialogue based on current time
   * @param {number} time - Current playback time in ms
   */
  processDialogue(time) {
    if (!this.currentCutscene || !this.currentCutscene.dialogue) return;
    
    // Find active dialogue
    let activeDialogue = null;
    for (const dialogue of this.currentCutscene.dialogue) {
      if (time >= dialogue.time && time < dialogue.time + dialogue.duration) {
        activeDialogue = dialogue;
        break;
      }
    }
    
    // Update subtitle renderer if dialogue changed
    if (activeDialogue !== this.activeDialogue) {
      this.activeDialogue = activeDialogue;
      if (activeDialogue) {
        this.subtitleRenderer.showDialogue(activeDialogue.speaker, activeDialogue.text, activeDialogue.duration);
      } else {
        this.subtitleRenderer.clear();
      }
    }
  }

  /**
   * Process animation triggers based on current time
   * @param {number} time - Current playback time in ms
   */
  processAnimations(time) {
    if (!this.currentCutscene || !this.currentCutscene.animations) return;
    
    for (const anim of this.currentCutscene.animations) {
      const eventKey = `anim_${anim.time}_${anim.action}`;
      if (time >= anim.time && !this.triggeredEvents.has(eventKey)) {
        this.triggeredEvents.add(eventKey);
        this.triggerAnimation(anim);
      }
    }
  }

  /**
   * Trigger an animation on a target entity
   * @param {Object} anim - Animation definition
   */
  triggerAnimation(anim) {
    const target = anim.target === 'boss' ? this.boss : this.player;
    if (!target) return;
    
    // Apply animation state to entity
    switch (anim.action) {
      case 'walk_in':
        // Boss walks into position
        if (target.cutsceneState !== undefined) {
          target.cutsceneState = 'walking';
        }
        break;
      case 'roar':
        // Boss roar animation
        if (this.gameEngine && this.gameEngine.camera) {
          this.gameEngine.camera.shake(8, 400);
        }
        break;
      case 'pose':
        // Boss strike a pose
        if (target.cutsceneState !== undefined) {
          target.cutsceneState = 'posing';
        }
        break;
      case 'shield_activate':
        // Visual shield activation
        if (target.shieldActive !== undefined) {
          target.shieldActive = true;
        }
        break;
      case 'summon_hint':
        // Show summon ability hint
        break;
      case 'power_surge':
        // Epic power effect
        if (this.gameEngine && this.gameEngine.camera) {
          this.gameEngine.camera.shake(12, 600);
        }
        break;
      case 'final_pose':
        // Final boss dramatic pose
        if (target.cutsceneState !== undefined) {
          target.cutsceneState = 'final_pose';
        }
        break;
      default:
        // Generic animation trigger
        break;
    }
  }

  /**
   * Process audio cues based on current time
   * @param {number} time - Current playback time in ms
   */
  processAudioCues(time) {
    if (!this.currentCutscene || !this.currentCutscene.audio) return;
    if (!this.gameEngine || !this.gameEngine.audioManager) return;
    
    for (const audio of this.currentCutscene.audio) {
      const eventKey = `audio_${audio.time}_${audio.type}_${audio.track || audio.sound}`;
      if (time >= audio.time && !this.triggeredEvents.has(eventKey)) {
        this.triggeredEvents.add(eventKey);
        
        switch (audio.type) {
          case 'music':
            this.gameEngine.audioManager.playMusic(audio.track);
            break;
          case 'sfx':
            this.gameEngine.audioManager.playSound(audio.sound, audio.volume || 0.7);
            break;
          case 'vo':
            // Voice-over placeholder - would play voice file
            break;
        }
      }
    }
  }

  /**
   * Complete the cutscene normally
   */
  complete() {
    this.state = 'idle';
    
    // Clean up
    this.subtitleRenderer.clear();
    this.camera.reset();
    
    // Reset cutscene data BEFORE callback to allow chaining cutscenes
    // (callback may load a new cutscene, so we must reset first)
    this.currentCutscene = null;
    
    // Store callback reference before clearing
    const callback = this.onComplete;
    this.onComplete = null;
    this.onSkip = null;
    
    // Callback (may start a new cutscene)
    if (callback) {
      callback();
    }
  }

  /**
   * Render the cutscene elements
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  render(ctx) {
    if (this.state !== 'playing' && this.state !== 'paused') return;
    
    // Render subtitles
    this.subtitleRenderer.render(ctx);
    
    // Render skip prompt
    this.renderSkipPrompt(ctx);
    
    // Render cinematic bars (letterbox)
    this.renderCinematicBars(ctx);
  }

  /**
   * Render skip prompt UI
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  renderSkipPrompt(ctx) {
    ctx.save();
    
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    
    // Skip prompt text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '14px monospace';
    ctx.textAlign = 'right';
    
    if (this.skipKeyPressed && this.skipHoldTime > 0) {
      // Show progress bar
      const progress = this.getSkipProgress();
      const barWidth = 100;
      const barHeight = 8;
      const barX = canvasWidth - 120;
      const barY = 55;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(barX, barY, barWidth * progress, barHeight);
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barWidth, barHeight);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('Skipping...', canvasWidth - 20, 50);
    } else {
      ctx.fillText('Press ESC or SPACE to skip', canvasWidth - 20, 50);
    }
    
    ctx.restore();
  }

  /**
   * Render cinematic letterbox bars
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  renderCinematicBars(ctx) {
    ctx.save();
    
    const barHeight = 50;
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    
    // Top bar
    ctx.fillRect(0, 0, canvasWidth, barHeight);
    
    // Bottom bar
    ctx.fillRect(0, canvasHeight - barHeight, canvasWidth, barHeight);
    
    ctx.restore();
  }

  /**
   * Check if a cutscene is currently active
   * @returns {boolean} True if cutscene is playing or paused
   */
  isActive() {
    return this.state === 'playing' || this.state === 'paused';
  }

  /**
   * Get the camera transform for rendering
   * @returns {Object} Camera transform data
   */
  getCameraTransform() {
    return this.camera.getTransform();
  }

  /**
   * Apply camera transform to context
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  applyCameraTransform(ctx) {
    this.camera.apply(ctx);
  }

  /**
   * Reset camera transform on context
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  resetCameraTransform(ctx) {
    this.camera.resetTransform(ctx);
  }

  /**
   * Get the current state of the cutscene manager
   * @returns {string} Current state
   */
  getState() {
    return this.state;
  }

  /**
   * Get the current playback progress (0-1)
   * @returns {number} Progress from 0 to 1
   */
  getProgress() {
    if (!this.currentCutscene) return 0;
    return Math.min(this.currentTime / this.currentCutscene.duration, 1);
  }
}
