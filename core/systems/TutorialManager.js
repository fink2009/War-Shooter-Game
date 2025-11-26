// Tutorial System - Interactive tutorial for new players
class TutorialManager {
  constructor() {
    this.isActive = false;
    this.currentStep = 0;
    this.steps = this.getTutorialSteps();
    this.overlay = null;
    this.gameEngine = null;
    
    // Step completion tracking
    this.stepCompleted = false;
    this.stepProgress = 0;
    this.stepRequirement = 0;
    
    // Timer for auto-advancement
    this.stepTimer = 0;
    
    // Dummy targets for practice
    this.dummyTargets = [];
    
    // Input tracking
    this.inputsDetected = {};
  }

  /**
   * Get all tutorial steps
   */
  getTutorialSteps() {
    return [
      {
        id: 'welcome',
        name: 'Welcome',
        instruction: 'Welcome to War Shooter! Press SPACE or ENTER to continue.',
        completionType: 'keypress',
        keys: ['Space', 'Enter'],
        highlight: null,
        duration: 0,
        spawnDummies: false
      },
      {
        id: 'movement',
        name: 'Movement',
        instruction: 'Use A and D (or Arrow Keys) to move left and right.',
        completionType: 'movement',
        requirement: 200, // Move 200 pixels total
        highlight: null,
        duration: 0,
        spawnDummies: false
      },
      {
        id: 'jumping',
        name: 'Jumping',
        instruction: 'Press W, SPACE, or UP ARROW to jump. Jump 3 times to continue.',
        completionType: 'action',
        action: 'jump',
        requirement: 3,
        highlight: null,
        duration: 0,
        spawnDummies: false
      },
      {
        id: 'shooting',
        name: 'Shooting',
        instruction: 'Click LEFT MOUSE BUTTON to shoot. Hit 5 targets to continue.',
        completionType: 'action',
        action: 'shoot',
        requirement: 5,
        highlight: null,
        duration: 0,
        spawnDummies: true,
        dummyCount: 5
      },
      {
        id: 'weapon_switch',
        name: 'Weapon Switching',
        instruction: 'Press 1, 2, 3, or 4 to switch weapons. Try switching 3 times.',
        completionType: 'action',
        action: 'weapon_switch',
        requirement: 3,
        highlight: 'weapon_slots',
        duration: 0,
        spawnDummies: false
      },
      {
        id: 'reload',
        name: 'Reloading',
        instruction: 'Press R to reload your weapon. Reload once to continue.',
        completionType: 'action',
        action: 'reload',
        requirement: 1,
        highlight: 'ammo_display',
        duration: 0,
        spawnDummies: false
      },
      {
        id: 'ability',
        name: 'Special Ability',
        instruction: 'Press E or Q to use your special ability. Use it once to continue.',
        completionType: 'action',
        action: 'ability',
        requirement: 1,
        highlight: 'ability_bar',
        duration: 0,
        spawnDummies: false
      },
      {
        id: 'roll',
        name: 'Dodge Roll',
        instruction: 'Press C or CTRL to dodge roll. You are invincible during the roll! Roll 3 times.',
        completionType: 'action',
        action: 'roll',
        requirement: 3,
        highlight: null,
        duration: 0,
        spawnDummies: false
      },
      {
        id: 'melee',
        name: 'Melee Combat',
        instruction: 'Press F or RIGHT CLICK for melee attack. Hit 3 targets to continue.',
        completionType: 'action',
        action: 'melee',
        requirement: 3,
        highlight: null,
        duration: 0,
        spawnDummies: true,
        dummyCount: 3
      },
      {
        id: 'hud',
        name: 'HUD Elements',
        instruction: 'The HUD shows: Health (top-left), Ammo (bottom-right), Minimap (top-right). Press H for help. Press SPACE to continue.',
        completionType: 'keypress',
        keys: ['Space', 'Enter'],
        highlight: 'hud',
        duration: 0,
        spawnDummies: false
      },
      {
        id: 'complete',
        name: 'Tutorial Complete',
        instruction: 'Great job! You are ready for battle. Press ENTER to start playing!',
        completionType: 'keypress',
        keys: ['Enter', 'Space'],
        highlight: null,
        duration: 0,
        spawnDummies: false
      }
    ];
  }

  /**
   * Initialize the tutorial
   * @param {GameEngine} gameEngine - Reference to the game engine
   */
  init(gameEngine) {
    this.gameEngine = gameEngine;
    this.reset();
  }

  /**
   * Start the tutorial
   */
  start() {
    if (!this.gameEngine) {
      console.error('TutorialManager: GameEngine not initialized');
      return;
    }

    this.isActive = true;
    this.currentStep = 0;
    this.stepCompleted = false;
    this.stepProgress = 0;
    this.inputsDetected = {};
    
    // Create a safe environment for tutorial
    this.setupTutorialEnvironment();
    
    // Start with first step
    this.startStep(0);
  }

  /**
   * Stop the tutorial
   */
  stop() {
    this.isActive = false;
    this.clearDummyTargets();
    
    if (this.gameEngine) {
      this.gameEngine.state = 'menu';
      this.gameEngine.menuState = 'main';
    }
  }

  /**
   * Skip the tutorial and go to main menu
   */
  skip() {
    this.stop();
  }

  /**
   * Reset tutorial state
   */
  reset() {
    this.currentStep = 0;
    this.stepCompleted = false;
    this.stepProgress = 0;
    this.stepTimer = 0;
    this.inputsDetected = {};
    this.clearDummyTargets();
  }

  /**
   * Setup the tutorial environment
   */
  setupTutorialEnvironment() {
    if (!this.gameEngine) return;

    // Clear existing entities
    this.gameEngine.enemies = [];
    this.gameEngine.projectiles = [];
    this.gameEngine.pickups = [];
    
    // Create player if not exists
    if (!this.gameEngine.player) {
      this.gameEngine.player = new PlayerCharacter(
        100,
        this.gameEngine.groundLevel - 50,
        'soldier'
      );
    }
    
    // Reset player state
    this.gameEngine.player.health = this.gameEngine.player.maxHealth;
    this.gameEngine.player.x = 100;
    this.gameEngine.player.y = this.gameEngine.groundLevel - 50;
    
    // Set game state
    this.gameEngine.state = 'playing';
    this.gameEngine.menuState = 'tutorial';
  }

  /**
   * Start a specific tutorial step
   * @param {number} stepIndex - The step index to start
   */
  startStep(stepIndex) {
    if (stepIndex >= this.steps.length) {
      this.completeTutorial();
      return;
    }

    this.currentStep = stepIndex;
    this.stepCompleted = false;
    this.stepProgress = 0;
    this.stepTimer = 0;
    
    const step = this.steps[stepIndex];
    this.stepRequirement = step.requirement || 1;
    
    // Spawn dummy targets if needed
    if (step.spawnDummies) {
      this.spawnDummyTargets(step.dummyCount || 3);
    } else {
      this.clearDummyTargets();
    }
    
    console.log(`Tutorial: Starting step "${step.name}"`);
  }

  /**
   * Advance to the next step
   */
  nextStep() {
    this.startStep(this.currentStep + 1);
  }

  /**
   * Spawn dummy targets for practice
   * @param {number} count - Number of targets to spawn
   */
  spawnDummyTargets(count) {
    this.clearDummyTargets();
    
    if (!this.gameEngine) return;
    
    for (let i = 0; i < count; i++) {
      const x = 300 + (i * 150);
      const y = this.gameEngine.groundLevel - 48;
      
      const dummy = new EnemyUnit(x, y, 'infantry');
      dummy.maxHealth = 1; // One-hit kills
      dummy.health = 1;
      dummy.speed = 0; // Stationary
      dummy.aiState = 'patrol';
      dummy.isDummy = true;
      
      this.dummyTargets.push(dummy);
      this.gameEngine.enemies.push(dummy);
      this.gameEngine.collisionSystem.add(dummy);
    }
  }

  /**
   * Clear dummy targets
   */
  clearDummyTargets() {
    if (!this.gameEngine) return;
    
    // Remove dummies from game
    this.dummyTargets.forEach(dummy => {
      dummy.destroy();
      const index = this.gameEngine.enemies.indexOf(dummy);
      if (index > -1) {
        this.gameEngine.enemies.splice(index, 1);
      }
    });
    
    this.dummyTargets = [];
  }

  /**
   * Update the tutorial state
   * @param {number} deltaTime - Time since last update
   * @param {InputManager} inputManager - Input manager reference
   */
  update(deltaTime, inputManager) {
    if (!this.isActive) return;
    
    const step = this.steps[this.currentStep];
    if (!step) return;
    
    this.stepTimer += deltaTime;
    
    // Check for skip
    if (inputManager.wasKeyPressed('Escape')) {
      this.skip();
      return;
    }
    
    // Check step completion based on type
    switch (step.completionType) {
      case 'keypress':
        if (step.keys) {
          for (const key of step.keys) {
            if (inputManager.wasKeyPressed(key)) {
              this.stepCompleted = true;
              break;
            }
          }
        }
        break;
        
      case 'movement':
        // Track movement distance (handled externally)
        if (this.stepProgress >= step.requirement) {
          this.stepCompleted = true;
        }
        break;
        
      case 'action':
        // Check if requirement met
        if (this.stepProgress >= step.requirement) {
          this.stepCompleted = true;
        }
        break;
        
      case 'timer':
        if (this.stepTimer >= step.duration) {
          this.stepCompleted = true;
        }
        break;
    }
    
    // Auto-advance when step is complete
    if (this.stepCompleted) {
      // Small delay before advancing
      if (this.stepTimer > 500) {
        this.nextStep();
      }
    }
  }

  /**
   * Record an action for step progress
   * @param {string} action - The action type
   */
  recordAction(action) {
    if (!this.isActive) return;
    
    const step = this.steps[this.currentStep];
    if (!step) return;
    
    if (step.completionType === 'action' && step.action === action) {
      this.stepProgress++;
    }
  }

  /**
   * Record movement for movement step
   * @param {number} distance - Distance moved
   */
  recordMovement(distance) {
    if (!this.isActive) return;
    
    const step = this.steps[this.currentStep];
    if (!step) return;
    
    if (step.completionType === 'movement') {
      this.stepProgress += distance;
    }
  }

  /**
   * Record a kill for shooting/melee steps
   */
  recordKill() {
    if (!this.isActive) return;
    
    const step = this.steps[this.currentStep];
    if (!step) return;
    
    if (step.action === 'shoot' || step.action === 'melee') {
      this.stepProgress++;
    }
  }

  /**
   * Complete the tutorial
   */
  completeTutorial() {
    this.isActive = false;
    this.clearDummyTargets();
    
    // Save tutorial completion
    if (this.gameEngine && this.gameEngine.saveSystem) {
      this.gameEngine.saveSystem.completeTutorial(0);
    }
    
    // Start the game
    if (this.gameEngine) {
      this.gameEngine.startGame('campaign', 'soldier');
    }
    
    console.log('Tutorial: Completed!');
  }

  /**
   * Get current step info
   */
  getCurrentStep() {
    return this.steps[this.currentStep] || null;
  }

  /**
   * Get progress percentage for current step
   */
  getStepProgressPercent() {
    if (this.stepRequirement === 0) return 1;
    return Math.min(1, this.stepProgress / this.stepRequirement);
  }

  /**
   * Render tutorial overlay
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    if (!this.isActive) return;
    
    const step = this.getCurrentStep();
    if (!step) return;
    
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    // Dim the screen slightly
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, width, height);
    
    // Tutorial panel
    const panelWidth = 700;
    const panelHeight = 120;
    const panelX = (width - panelWidth) / 2;
    const panelY = height - panelHeight - 80;
    
    // Panel background
    ctx.fillStyle = 'rgba(20, 40, 60, 0.9)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    
    // Panel border
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    // Step name
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`TUTORIAL: ${step.name.toUpperCase()}`, width / 2, panelY + 30);
    
    // Instruction
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    ctx.fillText(step.instruction, width / 2, panelY + 60);
    
    // Progress bar (if applicable)
    if (step.requirement && step.requirement > 1) {
      const barWidth = 400;
      const barHeight = 15;
      const barX = (width - barWidth) / 2;
      const barY = panelY + 80;
      
      // Background
      ctx.fillStyle = '#333333';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // Fill
      const progress = this.getStepProgressPercent();
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(barX, barY, barWidth * progress, barHeight);
      
      // Border
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(barX, barY, barWidth, barHeight);
      
      // Progress text
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px monospace';
      ctx.fillText(`${this.stepProgress}/${step.requirement}`, width / 2, barY + 12);
    }
    
    // Skip hint
    ctx.fillStyle = '#666666';
    ctx.font = '12px monospace';
    ctx.fillText('Press ESC to skip tutorial', width / 2, panelY + panelHeight - 10);
    
    // Step indicator
    ctx.fillStyle = '#00ff00';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Step ${this.currentStep + 1}/${this.steps.length}`, panelX + 15, panelY + 20);
    
    ctx.textAlign = 'left';
  }
}
