// Story Manager - Manages narrative and story progression
class StoryManager {
  constructor() {
    this.currentMission = 0;
    this.storyProgress = {};
    this.unlockedLogs = [];
    this.dialogueQueue = [];
    this.isShowingDialogue = false;
    this.currentDialogue = null;
    this.dialogueTimer = 0;
    this.missionData = new MissionData();
  }

  /**
   * Initialize story manager
   * @param {GameEngine} gameEngine - Reference to game engine
   */
  init(gameEngine) {
    this.gameEngine = gameEngine;
    this.loadProgress();
  }

  /**
   * Get mission data for a level
   * @param {number} level - Level number (1-10)
   * @returns {Object} Mission data
   */
  getMission(level) {
    return this.missionData.getMission(level);
  }

  /**
   * Get story dialogue for a mission
   * @param {number} level - Level number
   * @param {string} trigger - Dialogue trigger (intro, mid, boss, complete)
   * @returns {Array} Dialogue array
   */
  getDialogue(level, trigger) {
    const mission = this.getMission(level);
    if (!mission || !mission.dialogue) return [];
    return mission.dialogue[trigger] || [];
  }

  /**
   * Start mission briefing
   * @param {number} level - Level number
   */
  startBriefing(level) {
    const mission = this.getMission(level);
    if (!mission) return;

    this.currentMission = level;
    this.dialogueQueue = [...(mission.dialogue.intro || [])];
    this.showNextDialogue();
  }

  /**
   * Show mission debriefing
   * @param {number} level - Level number
   * @param {Object} stats - Mission statistics
   */
  showDebriefing(level, stats) {
    const mission = this.getMission(level);
    if (!mission) return;

    // Unlock any story logs for this level
    if (mission.unlockLogs) {
      mission.unlockLogs.forEach(logId => {
        if (!this.unlockedLogs.includes(logId)) {
          this.unlockedLogs.push(logId);
        }
      });
    }

    // Mark mission as completed
    this.storyProgress[level] = {
      completed: true,
      stats: stats
    };
    this.saveProgress();
  }

  /**
   * Show next dialogue in queue
   */
  showNextDialogue() {
    if (this.dialogueQueue.length === 0) {
      this.isShowingDialogue = false;
      this.currentDialogue = null;
      return;
    }

    this.currentDialogue = this.dialogueQueue.shift();
    this.isShowingDialogue = true;
    this.dialogueTimer = 0;
  }

  /**
   * Update dialogue display
   * @param {number} deltaTime - Time since last update
   * @param {InputManager} inputManager - Input manager
   */
  update(deltaTime, inputManager) {
    if (!this.isShowingDialogue) return;

    this.dialogueTimer += deltaTime;

    // Check for skip/advance
    if (inputManager.wasKeyPressed('Space') || 
        inputManager.wasKeyPressed('Enter') ||
        inputManager.wasKeyPressed('e') ||
        this.dialogueTimer > 5000) {
      this.showNextDialogue();
    }
  }

  /**
   * Render dialogue box
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  render(ctx) {
    if (!this.isShowingDialogue || !this.currentDialogue) return;

    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    // Dialogue box
    const boxWidth = 800;
    const boxHeight = 150;
    const boxX = (width - boxWidth) / 2;
    const boxY = height - boxHeight - 30;

    // Background
    ctx.fillStyle = 'rgba(0, 20, 40, 0.95)';
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

    // Border
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    // Portrait area
    const portraitSize = 100;
    ctx.fillStyle = 'rgba(0, 40, 60, 0.8)';
    ctx.fillRect(boxX + 15, boxY + 15, portraitSize, portraitSize);
    ctx.strokeStyle = '#00aaff';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX + 15, boxY + 15, portraitSize, portraitSize);

    // Character name
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    const speaker = this.currentDialogue.speaker || 'UNKNOWN';
    ctx.fillText(speaker.toUpperCase(), boxX + 130, boxY + 30);

    // Dialogue text
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    const text = this.currentDialogue.text || '';
    this.wrapText(ctx, text, boxX + 130, boxY + 55, boxWidth - 160, 20);

    // Continue prompt
    const blink = Math.floor(Date.now() / 500) % 2 === 0;
    if (blink) {
      ctx.fillStyle = '#888888';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Press SPACE to continue...', width / 2, boxY + boxHeight - 15);
    }

    ctx.textAlign = 'left';
  }

  /**
   * Wrap text to fit within width
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {string} text - Text to wrap
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} maxWidth - Maximum width
   * @param {number} lineHeight - Line height
   */
  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    words.forEach(word => {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, x, currentY);
        line = word + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    });
    
    ctx.fillText(line, x, currentY);
  }

  /**
   * Get unlocked story logs
   * @returns {Array} Unlocked log IDs
   */
  getUnlockedLogs() {
    return this.unlockedLogs;
  }

  /**
   * Get story log content
   * @param {string} logId - Log ID
   * @returns {Object} Log content
   */
  getLogContent(logId) {
    return this.missionData.getLog(logId);
  }

  /**
   * Save story progress
   */
  saveProgress() {
    try {
      localStorage.setItem('warShooterStory', JSON.stringify({
        progress: this.storyProgress,
        logs: this.unlockedLogs
      }));
    } catch (e) {
      console.warn('Could not save story progress:', e);
    }
  }

  /**
   * Load story progress
   */
  loadProgress() {
    try {
      const saved = localStorage.getItem('warShooterStory');
      if (saved) {
        const data = JSON.parse(saved);
        this.storyProgress = data.progress || {};
        this.unlockedLogs = data.logs || [];
      }
    } catch (e) {
      console.warn('Could not load story progress:', e);
    }
  }

  /**
   * Reset story progress
   */
  resetProgress() {
    this.storyProgress = {};
    this.unlockedLogs = [];
    this.saveProgress();
  }
}

/**
 * Mission Data - Contains all mission information and story content
 */
class MissionData {
  constructor() {
    this.missions = this.getMissions();
    this.logs = this.getLogs();
  }

  /**
   * Get mission by level
   * @param {number} level - Level number (1-10)
   * @returns {Object} Mission data
   */
  getMission(level) {
    return this.missions[level - 1] || null;
  }

  /**
   * Get story log by ID
   * @param {string} logId - Log ID
   * @returns {Object} Log content
   */
  getLog(logId) {
    return this.logs[logId] || null;
  }

  /**
   * Get all missions data
   */
  getMissions() {
    return [
      // ACT 1: The Invasion
      {
        id: 1,
        name: 'First Blood',
        act: 1,
        actName: 'The Invasion',
        description: 'Basic training interrupted by enemy attack. Survive the ambush.',
        objectives: [
          'Eliminate all enemies',
          'Survive the initial assault'
        ],
        isBoss: false,
        enemyTypes: ['infantry', 'scout'],
        enemyCount: 8,
        dialogue: {
          intro: [
            { speaker: 'Commander', text: 'Soldier, your training has been cut short. We\'re under attack!' },
            { speaker: 'Commander', text: 'Enemy forces have breached the perimeter. This is no drill.' },
            { speaker: 'Soldier', text: 'Understood, sir. I\'m ready to fight.' }
          ],
          complete: [
            { speaker: 'Commander', text: 'Good work, soldier. But this is just the beginning.' },
            { speaker: 'Commander', text: 'Intel suggests a much larger force is on the way.' }
          ]
        },
        unlockLogs: ['log_invasion_01']
      },
      {
        id: 2,
        name: 'Defensive Position',
        act: 1,
        actName: 'The Invasion',
        description: 'Hold the line against waves of enemy forces.',
        objectives: [
          'Defend the position',
          'Survive 3 enemy waves'
        ],
        isBoss: false,
        enemyTypes: ['infantry', 'scout', 'heavy'],
        enemyCount: 15,
        dialogue: {
          intro: [
            { speaker: 'Commander', text: 'We\'ve set up a defensive position. You need to hold the line.' },
            { speaker: 'Commander', text: 'Reinforcements are on the way, but it\'ll take time.' },
            { speaker: 'Soldier', text: 'I\'ll buy them as much time as I need.' }
          ],
          complete: [
            { speaker: 'Commander', text: 'You\'re a natural born fighter. The enemy is regrouping.' },
            { speaker: 'Commander', text: 'We\'ve identified their commander. The Warlord.' }
          ]
        },
        unlockLogs: ['log_invasion_02']
      },
      {
        id: 3,
        name: 'The Warlord',
        act: 1,
        actName: 'The Invasion',
        description: 'Face the first enemy commander in deadly combat.',
        objectives: [
          'Defeat The Warlord'
        ],
        isBoss: true,
        bossId: 0,
        bossName: 'The Warlord',
        enemyTypes: ['infantry', 'scout'],
        dialogue: {
          intro: [
            { speaker: 'Commander', text: 'The Warlord commands this assault force. Take him out!' },
            { speaker: 'The Warlord', text: 'So, they send a single soldier against me? Pathetic!' },
            { speaker: 'Soldier', text: 'I\'ve handled worse odds before.' }
          ],
          boss: [
            { speaker: 'The Warlord', text: 'You dare challenge me? I\'ll crush you!' }
          ],
          complete: [
            { speaker: 'Commander', text: 'Incredible! You\'ve defeated The Warlord!' },
            { speaker: 'Commander', text: 'But the enemy has more commanders. This war is far from over.' }
          ]
        },
        unlockLogs: ['log_warlord']
      },
      
      // ACT 2: Counter-Offensive
      {
        id: 4,
        name: 'Behind Enemy Lines',
        act: 2,
        actName: 'Counter-Offensive',
        description: 'Infiltrate enemy territory and gather intelligence.',
        objectives: [
          'Clear the enemy outpost',
          'Avoid raising alarm (optional)'
        ],
        isBoss: false,
        enemyTypes: ['sniper', 'scout', 'infantry'],
        enemyCount: 12,
        dialogue: {
          intro: [
            { speaker: 'Commander', text: 'Time to take the fight to them. You\'re going in deep.' },
            { speaker: 'Commander', text: 'We need intel on their main force. Stay quiet if you can.' },
            { speaker: 'Soldier', text: 'Stealth isn\'t my strong suit, but I\'ll manage.' }
          ],
          complete: [
            { speaker: 'Commander', text: 'Intel retrieved. Their supply lines are vulnerable.' },
            { speaker: 'Commander', text: 'We\'re planning a convoy assault. Get ready.' }
          ]
        },
        unlockLogs: ['log_counter_01']
      },
      {
        id: 5,
        name: 'Supply Run',
        act: 2,
        actName: 'Counter-Offensive',
        description: 'Intercept and destroy enemy supply convoy.',
        objectives: [
          'Destroy all enemy forces',
          'Secure the supplies'
        ],
        isBoss: false,
        enemyTypes: ['heavy', 'infantry', 'scout'],
        enemyCount: 18,
        dialogue: {
          intro: [
            { speaker: 'Commander', text: 'Enemy convoy approaching. Heavy resistance expected.' },
            { speaker: 'Commander', text: 'Cut off their supplies and we cripple their offensive.' },
            { speaker: 'Soldier', text: 'Consider it done.' }
          ],
          complete: [
            { speaker: 'Commander', text: 'Supply line severed. Their heavy units will be starved.' },
            { speaker: 'Commander', text: 'We\'ve tracked their logistics commander. The Devastator.' }
          ]
        },
        unlockLogs: ['log_counter_02']
      },
      {
        id: 6,
        name: 'The Devastator',
        act: 2,
        actName: 'Counter-Offensive',
        description: 'Confront the heavy assault commander.',
        objectives: [
          'Defeat The Devastator'
        ],
        isBoss: true,
        bossId: 1,
        bossName: 'The Devastator',
        enemyTypes: ['heavy', 'infantry'],
        dialogue: {
          intro: [
            { speaker: 'Commander', text: 'The Devastator leads their armored division. Heavy firepower ahead.' },
            { speaker: 'The Devastator', text: 'You destroyed my supplies. Now I\'ll destroy you!' },
            { speaker: 'Soldier', text: 'Bring it on, tin can.' }
          ],
          boss: [
            { speaker: 'The Devastator', text: 'My reinforcements will overwhelm you!' }
          ],
          complete: [
            { speaker: 'Commander', text: 'The Devastator is down! Their heavy units are in disarray.' },
            { speaker: 'Commander', text: 'Push into their core territory. End this war.' }
          ]
        },
        unlockLogs: ['log_devastator']
      },
      
      // ACT 3: Final Push
      {
        id: 7,
        name: 'Urban Warfare',
        act: 3,
        actName: 'Final Push',
        description: 'Street-to-street combat in the enemy capital.',
        objectives: [
          'Clear the streets',
          'Reach the industrial zone'
        ],
        isBoss: false,
        enemyTypes: ['sniper', 'heavy', 'infantry', 'scout'],
        enemyCount: 20,
        dialogue: {
          intro: [
            { speaker: 'Commander', text: 'We\'re in their capital now. Urban combat is brutal.' },
            { speaker: 'Commander', text: 'Watch for snipers in the buildings. Use cover.' },
            { speaker: 'Soldier', text: 'I\'ve come too far to fall now.' }
          ],
          complete: [
            { speaker: 'Commander', text: 'Street by street, we\'re winning. The factories are next.' },
            { speaker: 'Commander', text: 'Destroy their production and they can\'t replace losses.' }
          ]
        },
        unlockLogs: ['log_final_01']
      },
      {
        id: 8,
        name: 'Industrial Sabotage',
        act: 3,
        actName: 'Final Push',
        description: 'Destroy enemy war factories.',
        objectives: [
          'Eliminate factory guards',
          'Set charges (automatic after clear)'
        ],
        isBoss: false,
        enemyTypes: ['heavy', 'infantry', 'drone'],
        enemyCount: 22,
        dialogue: {
          intro: [
            { speaker: 'Commander', text: 'These factories produce their war machines. Shut them down!' },
            { speaker: 'Commander', text: 'Expect automated defenses. Those drones are nasty.' },
            { speaker: 'Soldier', text: 'Time to break some things.' }
          ],
          complete: [
            { speaker: 'Commander', text: 'Factories destroyed! Their production is crippled.' },
            { speaker: 'Commander', text: 'Only their elite commander remains. The Annihilator.' }
          ]
        },
        unlockLogs: ['log_final_02']
      },
      {
        id: 9,
        name: 'The Annihilator',
        act: 3,
        actName: 'Final Push',
        description: 'Battle the elite tactician.',
        objectives: [
          'Defeat The Annihilator'
        ],
        isBoss: true,
        bossId: 2,
        bossName: 'The Annihilator',
        enemyTypes: ['sniper', 'heavy'],
        dialogue: {
          intro: [
            { speaker: 'Commander', text: 'The Annihilator is their best strategist. Expect tricky tactics.' },
            { speaker: 'The Annihilator', text: 'Impressive. You\'ve made it this far. It ends here.' },
            { speaker: 'Soldier', text: 'Your tactics won\'t save you.' }
          ],
          boss: [
            { speaker: 'The Annihilator', text: 'My shield is impenetrable! Wait for an opening!' }
          ],
          complete: [
            { speaker: 'Commander', text: 'The Annihilator has fallen! Only their supreme leader remains.' },
            { speaker: 'Commander', text: 'The Overlord awaits. This is the final battle.' }
          ]
        },
        unlockLogs: ['log_annihilator']
      },
      
      // ACT 4: Endgame
      {
        id: 10,
        name: 'The Overlord',
        act: 4,
        actName: 'Endgame',
        description: 'The final confrontation with the enemy supreme leader.',
        objectives: [
          'Defeat The Overlord',
          'End the war'
        ],
        isBoss: true,
        bossId: 3,
        bossName: 'The Overlord',
        enemyTypes: ['infantry', 'heavy', 'sniper', 'scout'],
        dialogue: {
          intro: [
            { speaker: 'Commander', text: 'This is it. The Overlord commands all enemy forces.' },
            { speaker: 'Commander', text: 'Defeat him, and the war ends. Fail, and we lose everything.' },
            { speaker: 'The Overlord', text: 'So, the infamous soldier arrives. You\'ve been a thorn in my side.' },
            { speaker: 'Soldier', text: 'I\'m about to become a lot worse than a thorn.' },
            { speaker: 'The Overlord', text: 'You face the combined might of all my fallen commanders. PREPARE TO DIE!' }
          ],
          boss: [
            { speaker: 'The Overlord', text: 'I will crush you with overwhelming power!' }
          ],
          complete: [
            { speaker: 'Commander', text: 'YOU DID IT! The Overlord is defeated!' },
            { speaker: 'Commander', text: 'The war is over. You\'ve saved us all.' },
            { speaker: 'Soldier', text: 'Just doing my job, sir.' },
            { speaker: 'Commander', text: 'You\'re a hero. The world will remember this day.' }
          ]
        },
        unlockLogs: ['log_overlord', 'log_victory']
      }
    ];
  }

  /**
   * Get all story logs
   */
  getLogs() {
    return {
      'log_invasion_01': {
        title: 'The Day It Started',
        date: 'Day 1',
        content: 'Enemy forces appeared without warning. Our early warning systems failed to detect their approach. How they achieved such tactical surprise remains a mystery. Initial casualties were severe, but we\'re regrouping.'
      },
      'log_invasion_02': {
        title: 'Defensive Analysis',
        date: 'Day 3',
        content: 'The enemy attacks in coordinated waves. Their command structure is hierarchical - taking out leaders disrupts unit cohesion significantly. We\'ve identified their field commander as "The Warlord".'
      },
      'log_warlord': {
        title: 'The Warlord Defeated',
        date: 'Day 5',
        content: 'The Warlord is down. Analysis of his tactics shows a reliance on aggressive, rage-fueled combat when cornered. Future enemy commanders may share similar psychological profiles. Recommend exploiting emotional weaknesses.'
      },
      'log_counter_01': {
        title: 'Enemy Territory Intel',
        date: 'Day 8',
        content: 'Deep reconnaissance reveals their supply lines are their weakness. Their heavy units require constant resupply to maintain combat effectiveness. Cut the supplies, weaken the army.'
      },
      'log_counter_02': {
        title: 'Logistics Victory',
        date: 'Day 12',
        content: 'Supply convoy destroyed. Enemy heavy units are operating on reduced capacity. Their logistics commander, "The Devastator", has been spotted leading remaining supply operations personally.'
      },
      'log_devastator': {
        title: 'The Devastator Analyzed',
        date: 'Day 15',
        content: 'The Devastator compensated for supply issues by summoning reinforcements directly. His personal combat suit is heavily armored. Brute force approach validated - continuous pressure overwhelms his defenses.'
      },
      'log_final_01': {
        title: 'Urban Combat Report',
        date: 'Day 20',
        content: 'Urban combat is testing our limits. Enemy snipers use elevated positions effectively. Recommend aggressive pushes rather than prolonged engagements. Speed saves lives in city fighting.'
      },
      'log_final_02': {
        title: 'Factory Sabotage Success',
        date: 'Day 23',
        content: 'War factories destroyed. Enemy drone production has halted. Without these automated units, they\'ll rely purely on infantry - a significant tactical disadvantage for them.'
      },
      'log_annihilator': {
        title: 'The Annihilator\'s Shield',
        date: 'Day 25',
        content: 'The Annihilator employed a regenerating shield system. Key learning: shields have cooldown periods. Sustained pressure during shield downtime is the optimal strategy.'
      },
      'log_overlord': {
        title: 'The Final Battle',
        date: 'Day 30',
        content: 'The Overlord combined all three combat abilities: rage enhancement, reinforcement summoning, and shield generation. Defeating him required mastery of all tactics learned throughout the campaign.'
      },
      'log_victory': {
        title: 'Victory Report',
        date: 'Day 30',
        content: 'The war is over. The Overlord is defeated, and enemy forces are surrendering across all fronts. Casualties were high, but humanity prevails. The soldier who led the charge from the front will be remembered as a legend.'
      }
    };
  }
}
