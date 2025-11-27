// Story Cutscene Data - Contains all story-driven cutscene sequences
// Revenge-driven narrative centered on the protagonist

const StoryCutsceneData = {
  // Prologue - Before Level 1 (The Tragic Incident)
  prologue: {
    cutsceneId: 'prologue',
    type: 'story',
    trigger: 'game_start',
    level: 0,
    duration: 18000,
    shots: [
      {
        time: 0,
        duration: 4000,
        camera: {
          type: 'focus',
          target: 'player',
          zoom: 1.1,
          offsetY: -20,
          easing: 'ease-out'
        }
      },
      {
        time: 4000,
        duration: 5000,
        camera: {
          type: 'focus',
          target: 'player',
          zoom: 1.2,
          offsetY: -30,
          easing: 'ease-in-out'
        }
      },
      {
        time: 9000,
        duration: 4000,
        camera: {
          type: 'focus',
          target: 'player',
          zoom: 1.3,
          offsetY: -30,
          easing: 'ease-out'
        }
      },
      {
        time: 13000,
        duration: 5000,
        camera: {
          type: 'zoom_out',
          zoom: 1.0,
          easing: 'ease-in-out'
        }
      }
    ],
    dialogue: [
      {
        time: 500,
        duration: 3500,
        speaker: '???',
        text: 'The raid came without warning. They called themselves the Iron Legion.'
      },
      {
        time: 4500,
        duration: 4000,
        speaker: '???',
        text: 'My sister, Elena... she was a medic. She was trying to help the wounded when their commander gave the order.'
      },
      {
        time: 9000,
        duration: 3500,
        speaker: 'Soldier',
        text: 'They showed no mercy. The Overlord\'s forces killed everyone... including her.'
      },
      {
        time: 13000,
        duration: 4500,
        speaker: 'Soldier',
        text: 'I will hunt them down. Every lieutenant, every commander, every last one of them. They will pay for what they did.'
      }
    ],
    animations: [
      {
        time: 0,
        target: 'player',
        action: 'idle'
      }
    ],
    audio: [
      {
        time: 0,
        type: 'music',
        track: 'menu'
      },
      {
        time: 8500,
        type: 'sfx',
        sound: 'explosion',
        volume: 0.3
      }
    ],
    metadata: {
      theme: 'tragedy',
      atmosphere: 'somber',
      visualEffect: 'darkened'
    }
  },

  // Level 1 Pre-Mission Briefing
  level1_intro: {
    cutsceneId: 'level1_intro',
    type: 'story',
    trigger: 'level_start',
    level: 1,
    duration: 10000,
    shots: [
      {
        time: 0,
        duration: 4000,
        camera: {
          type: 'pan',
          startX: 100,
          endX: 400,
          zoom: 1.1,
          easing: 'ease-out'
        }
      },
      {
        time: 4000,
        duration: 6000,
        camera: {
          type: 'focus',
          target: 'player',
          zoom: 1.0,
          easing: 'linear'
        }
      }
    ],
    dialogue: [
      {
        time: 500,
        duration: 3000,
        speaker: 'Commander',
        text: 'Soldier, your training ends now. Enemy forces have been spotted nearby.'
      },
      {
        time: 4000,
        duration: 3000,
        speaker: 'Soldier',
        text: 'Good. This is where my hunt begins. They\'ll lead me to the ones responsible.'
      },
      {
        time: 7500,
        duration: 2000,
        speaker: 'Commander',
        text: 'Stay focused. Show them what you\'re made of.'
      }
    ],
    audio: [
      {
        time: 0,
        type: 'music',
        track: 'gameplay'
      }
    ],
    metadata: {
      theme: 'determination',
      atmosphere: 'preparation'
    }
  },

  // Level 1 Completion
  level1_outro: {
    cutsceneId: 'level1_outro',
    type: 'story',
    trigger: 'level_complete',
    level: 1,
    duration: 8000,
    shots: [
      {
        time: 0,
        duration: 8000,
        camera: {
          type: 'focus',
          target: 'player',
          zoom: 1.1,
          easing: 'linear'
        }
      }
    ],
    dialogue: [
      {
        time: 500,
        duration: 3000,
        speaker: 'Soldier',
        text: 'These were just scouts. The real enemy is still out there.'
      },
      {
        time: 4000,
        duration: 3500,
        speaker: 'Commander',
        text: 'Intel suggests their first outpost is ahead. The Warlord commands that sector.'
      }
    ],
    audio: [],
    metadata: {
      theme: 'progress',
      atmosphere: 'determined'
    }
  },

  // Level 2 Intro
  level2_intro: {
    cutsceneId: 'level2_intro',
    type: 'story',
    trigger: 'level_start',
    level: 2,
    duration: 8000,
    shots: [
      {
        time: 0,
        duration: 8000,
        camera: {
          type: 'pan',
          startX: 200,
          endX: 500,
          zoom: 1.0,
          easing: 'ease-in-out'
        }
      }
    ],
    dialogue: [
      {
        time: 500,
        duration: 3000,
        speaker: 'Commander',
        text: 'Enemy reinforcements incoming. Hold your position!'
      },
      {
        time: 4000,
        duration: 3500,
        speaker: 'Soldier',
        text: 'Let them come. Each one of them brings me closer to the truth.'
      }
    ],
    audio: [],
    metadata: {
      theme: 'defense',
      atmosphere: 'intense'
    }
  },

  // Level 2 Completion
  level2_outro: {
    cutsceneId: 'level2_outro',
    type: 'story',
    trigger: 'level_complete',
    level: 2,
    duration: 8000,
    shots: [
      {
        time: 0,
        duration: 8000,
        camera: {
          type: 'focus',
          target: 'player',
          zoom: 1.1,
          easing: 'linear'
        }
      }
    ],
    dialogue: [
      {
        time: 500,
        duration: 3000,
        speaker: 'Commander',
        text: 'The Warlord\'s base is just ahead. He was there that day...'
      },
      {
        time: 4000,
        duration: 3500,
        speaker: 'Soldier',
        text: 'Then he\'s my first target. He gave the order to fire on civilians.'
      }
    ],
    audio: [],
    metadata: {
      theme: 'anticipation',
      atmosphere: 'vengeful'
    }
  },

  // Level 3 - Boss Pre-Fight (The Warlord) - Enhanced from existing
  level3_boss_intro: {
    cutsceneId: 'level3_boss_intro',
    type: 'boss_intro',
    trigger: 'boss_spawn',
    level: 3,
    bossId: 0,
    bossName: 'The Warlord',
    duration: 14000,
    shots: [
      {
        time: 0,
        duration: 4000,
        camera: {
          type: 'pan',
          startX: 800,
          endX: 1500,
          zoom: 1.0,
          easing: 'ease-in-out'
        }
      },
      {
        time: 4000,
        duration: 5000,
        camera: {
          type: 'focus',
          target: 'boss',
          zoom: 1.4,
          offsetY: -30,
          easing: 'ease-out'
        }
      },
      {
        time: 9000,
        duration: 2500,
        camera: {
          type: 'focus',
          target: 'player',
          zoom: 1.3,
          easing: 'ease-in-out'
        }
      },
      {
        time: 11500,
        duration: 2500,
        camera: {
          type: 'zoom_out',
          zoom: 1.0,
          easing: 'ease-in-out'
        }
      }
    ],
    dialogue: [
      {
        time: 4500,
        duration: 3500,
        speaker: 'The Warlord',
        text: 'Another fool dares to challenge my dominion? You\'ll end up like all the rest.'
      },
      {
        time: 9000,
        duration: 2500,
        speaker: 'Soldier',
        text: 'You killed innocents. You killed my sister. Today, you die.'
      },
      {
        time: 12000,
        duration: 2000,
        speaker: 'The Warlord',
        text: 'Your sister? Ha! I\'ve killed so many, I can\'t even remember!'
      }
    ],
    animations: [
      {
        time: 500,
        target: 'boss',
        action: 'walk_in'
      },
      {
        time: 4000,
        target: 'boss',
        action: 'pose'
      },
      {
        time: 9000,
        target: 'boss',
        action: 'roar'
      }
    ],
    audio: [
      {
        time: 0,
        type: 'music',
        track: 'boss'
      },
      {
        time: 9000,
        type: 'sfx',
        sound: 'explosion',
        volume: 0.5
      }
    ],
    metadata: {
      theme: 'confrontation',
      atmosphere: 'intense',
      specialMechanic: 'Enrages at 50% HP'
    }
  },

  // Level 3 Boss Defeat
  level3_boss_defeat: {
    cutsceneId: 'level3_boss_defeat',
    type: 'story',
    trigger: 'boss_defeat',
    level: 3,
    bossId: 0,
    duration: 10000,
    shots: [
      {
        time: 0,
        duration: 10000,
        camera: {
          type: 'focus',
          target: 'player',
          zoom: 1.2,
          easing: 'linear'
        }
      }
    ],
    dialogue: [
      {
        time: 500,
        duration: 3500,
        speaker: 'Soldier',
        text: 'That\'s one down. But you weren\'t alone that day. Who ordered the attack?'
      },
      {
        time: 4500,
        duration: 3000,
        speaker: 'Commander',
        text: 'Intel from his files mentions "The Devastator" - he runs their supply lines.'
      },
      {
        time: 8000,
        duration: 2000,
        speaker: 'Soldier',
        text: 'Then he\'s next.'
      }
    ],
    audio: [
      {
        time: 0,
        type: 'music',
        track: 'gameplay'
      }
    ],
    metadata: {
      theme: 'victory',
      atmosphere: 'determined'
    }
  },

  // Level 4 Intro
  level4_intro: {
    cutsceneId: 'level4_intro',
    type: 'story',
    trigger: 'level_start',
    level: 4,
    duration: 8000,
    shots: [
      {
        time: 0,
        duration: 8000,
        camera: {
          type: 'pan',
          startX: 150,
          endX: 450,
          zoom: 1.0,
          easing: 'ease-in-out'
        }
      }
    ],
    dialogue: [
      {
        time: 500,
        duration: 3500,
        speaker: 'Commander',
        text: 'We\'re deep in enemy territory now. The Devastator\'s forces are heavily armored.'
      },
      {
        time: 4500,
        duration: 3000,
        speaker: 'Soldier',
        text: 'Armor won\'t save them. Nothing will.'
      }
    ],
    audio: [],
    metadata: {
      theme: 'infiltration',
      atmosphere: 'tense'
    }
  },

  // Level 4 Completion
  level4_outro: {
    cutsceneId: 'level4_outro',
    type: 'story',
    trigger: 'level_complete',
    level: 4,
    duration: 8000,
    shots: [
      {
        time: 0,
        duration: 8000,
        camera: {
          type: 'focus',
          target: 'player',
          zoom: 1.1,
          easing: 'linear'
        }
      }
    ],
    dialogue: [
      {
        time: 500,
        duration: 3500,
        speaker: 'Soldier',
        text: 'I found documents here. The Iron Legion has a hierarchy... four commanders.'
      },
      {
        time: 4500,
        duration: 3000,
        speaker: 'Commander',
        text: 'And the Overlord sits at the top. He ordered the attack on your village.'
      }
    ],
    audio: [],
    metadata: {
      theme: 'revelation',
      atmosphere: 'focused'
    }
  },

  // Level 5 Intro
  level5_intro: {
    cutsceneId: 'level5_intro',
    type: 'story',
    trigger: 'level_start',
    level: 5,
    duration: 8000,
    shots: [
      {
        time: 0,
        duration: 8000,
        camera: {
          type: 'pan',
          startX: 200,
          endX: 550,
          zoom: 1.0,
          easing: 'ease-in-out'
        }
      }
    ],
    dialogue: [
      {
        time: 500,
        duration: 3500,
        speaker: 'Commander',
        text: 'Enemy snipers have the high ground. This is their supply route.'
      },
      {
        time: 4500,
        duration: 3000,
        speaker: 'Soldier',
        text: 'Cut off their supplies, and we weaken The Devastator. Perfect.'
      }
    ],
    audio: [],
    metadata: {
      theme: 'tactical',
      atmosphere: 'strategic'
    }
  },

  // Level 5 Completion
  level5_outro: {
    cutsceneId: 'level5_outro',
    type: 'story',
    trigger: 'level_complete',
    level: 5,
    duration: 8000,
    shots: [
      {
        time: 0,
        duration: 8000,
        camera: {
          type: 'focus',
          target: 'player',
          zoom: 1.1,
          easing: 'linear'
        }
      }
    ],
    dialogue: [
      {
        time: 500,
        duration: 3500,
        speaker: 'Commander',
        text: 'Their supply line is crippled. The Devastator will be desperate now.'
      },
      {
        time: 4500,
        duration: 3000,
        speaker: 'Soldier',
        text: 'Desperate enemies make mistakes. Time to finish him.'
      }
    ],
    audio: [],
    metadata: {
      theme: 'advantage',
      atmosphere: 'confident'
    }
  },

  // Level 6 - Boss Pre-Fight (The Devastator)
  level6_boss_intro: {
    cutsceneId: 'level6_boss_intro',
    type: 'boss_intro',
    trigger: 'boss_spawn',
    level: 6,
    bossId: 1,
    bossName: 'The Devastator',
    duration: 14000,
    shots: [
      {
        time: 0,
        duration: 4000,
        camera: {
          type: 'pan',
          startX: 900,
          endX: 1700,
          zoom: 1.0,
          easing: 'ease-in-out'
        }
      },
      {
        time: 4000,
        duration: 5000,
        camera: {
          type: 'focus',
          target: 'boss',
          zoom: 1.4,
          offsetY: -30,
          easing: 'ease-out'
        }
      },
      {
        time: 9000,
        duration: 2500,
        camera: {
          type: 'focus',
          target: 'player',
          zoom: 1.3,
          easing: 'ease-in-out'
        }
      },
      {
        time: 11500,
        duration: 2500,
        camera: {
          type: 'zoom_out',
          zoom: 1.0,
          easing: 'ease-in-out'
        }
      }
    ],
    dialogue: [
      {
        time: 4500,
        duration: 3500,
        speaker: 'The Devastator',
        text: 'You destroyed my supplies. Do you have any idea what you\'ve done?!'
      },
      {
        time: 9000,
        duration: 2500,
        speaker: 'Soldier',
        text: 'You were there when the village burned. You helped The Warlord.'
      },
      {
        time: 12000,
        duration: 2000,
        speaker: 'The Devastator',
        text: 'I\'ll crush you with my bare hands! Reinforcements, TO ME!'
      }
    ],
    animations: [
      {
        time: 500,
        target: 'boss',
        action: 'walk_in'
      },
      {
        time: 4000,
        target: 'boss',
        action: 'pose'
      },
      {
        time: 11500,
        target: 'boss',
        action: 'summon_hint'
      }
    ],
    audio: [
      {
        time: 0,
        type: 'music',
        track: 'boss'
      },
      {
        time: 11500,
        type: 'sfx',
        sound: 'explosion',
        volume: 0.5
      }
    ],
    metadata: {
      theme: 'confrontation',
      atmosphere: 'desperate',
      specialMechanic: 'Summons minions periodically'
    }
  },

  // Level 6 Boss Defeat
  level6_boss_defeat: {
    cutsceneId: 'level6_boss_defeat',
    type: 'story',
    trigger: 'boss_defeat',
    level: 6,
    bossId: 1,
    duration: 10000,
    shots: [
      {
        time: 0,
        duration: 10000,
        camera: {
          type: 'focus',
          target: 'player',
          zoom: 1.2,
          easing: 'linear'
        }
      }
    ],
    dialogue: [
      {
        time: 500,
        duration: 3500,
        speaker: 'Soldier',
        text: 'Two commanders down. You\'re running out of lieutenants, Overlord.'
      },
      {
        time: 4500,
        duration: 3000,
        speaker: 'Commander',
        text: 'The Annihilator leads their elite forces. He protects the Overlord directly.'
      },
      {
        time: 8000,
        duration: 2000,
        speaker: 'Soldier',
        text: 'Then I\'m getting closer. Keep the intel coming.'
      }
    ],
    audio: [
      {
        time: 0,
        type: 'music',
        track: 'gameplay'
      }
    ],
    metadata: {
      theme: 'progress',
      atmosphere: 'relentless'
    }
  },

  // Level 7 Intro
  level7_intro: {
    cutsceneId: 'level7_intro',
    type: 'story',
    trigger: 'level_start',
    level: 7,
    duration: 8000,
    shots: [
      {
        time: 0,
        duration: 8000,
        camera: {
          type: 'pan',
          startX: 100,
          endX: 450,
          zoom: 1.0,
          easing: 'ease-in-out'
        }
      }
    ],
    dialogue: [
      {
        time: 500,
        duration: 3500,
        speaker: 'Commander',
        text: 'Urban warfare ahead. The enemy has fortified this district.'
      },
      {
        time: 4500,
        duration: 3000,
        speaker: 'Soldier',
        text: 'They think walls will protect them. They\'re wrong.'
      }
    ],
    audio: [],
    metadata: {
      theme: 'urban',
      atmosphere: 'gritty'
    }
  },

  // Level 7 Completion
  level7_outro: {
    cutsceneId: 'level7_outro',
    type: 'story',
    trigger: 'level_complete',
    level: 7,
    duration: 8000,
    shots: [
      {
        time: 0,
        duration: 8000,
        camera: {
          type: 'focus',
          target: 'player',
          zoom: 1.1,
          easing: 'linear'
        }
      }
    ],
    dialogue: [
      {
        time: 500,
        duration: 3500,
        speaker: 'Soldier',
        text: 'Elena used to say revenge wouldn\'t bring her peace. But this isn\'t about peace.'
      },
      {
        time: 4500,
        duration: 3000,
        speaker: 'Commander',
        text: 'Their factories are ahead. If we destroy them, the Legion can\'t recover.'
      }
    ],
    audio: [],
    metadata: {
      theme: 'reflection',
      atmosphere: 'somber'
    }
  },

  // Level 8 Intro
  level8_intro: {
    cutsceneId: 'level8_intro',
    type: 'story',
    trigger: 'level_start',
    level: 8,
    duration: 8000,
    shots: [
      {
        time: 0,
        duration: 8000,
        camera: {
          type: 'pan',
          startX: 150,
          endX: 500,
          zoom: 1.0,
          easing: 'ease-in-out'
        }
      }
    ],
    dialogue: [
      {
        time: 500,
        duration: 3500,
        speaker: 'Commander',
        text: 'The industrial complex - this is where they build their war machines.'
      },
      {
        time: 4500,
        duration: 3000,
        speaker: 'Soldier',
        text: 'Then we burn it to the ground. No more weapons, no more war.'
      }
    ],
    audio: [],
    metadata: {
      theme: 'sabotage',
      atmosphere: 'destructive'
    }
  },

  // Level 8 Completion
  level8_outro: {
    cutsceneId: 'level8_outro',
    type: 'story',
    trigger: 'level_complete',
    level: 8,
    duration: 8000,
    shots: [
      {
        time: 0,
        duration: 8000,
        camera: {
          type: 'focus',
          target: 'player',
          zoom: 1.1,
          easing: 'linear'
        }
      }
    ],
    dialogue: [
      {
        time: 500,
        duration: 3500,
        speaker: 'Commander',
        text: 'Factories destroyed. Their production is crippled permanently.'
      },
      {
        time: 4500,
        duration: 3000,
        speaker: 'Soldier',
        text: 'Now there\'s nothing between me and The Annihilator. Lead the way.'
      }
    ],
    audio: [],
    metadata: {
      theme: 'triumph',
      atmosphere: 'resolute'
    }
  },

  // Level 9 - Boss Pre-Fight (The Annihilator)
  level9_boss_intro: {
    cutsceneId: 'level9_boss_intro',
    type: 'boss_intro',
    trigger: 'boss_spawn',
    level: 9,
    bossId: 2,
    bossName: 'The Annihilator',
    duration: 14000,
    shots: [
      {
        time: 0,
        duration: 4000,
        camera: {
          type: 'pan',
          startX: 900,
          endX: 1800,
          zoom: 1.0,
          easing: 'ease-in-out'
        }
      },
      {
        time: 4000,
        duration: 5000,
        camera: {
          type: 'focus',
          target: 'boss',
          zoom: 1.4,
          offsetY: -30,
          easing: 'ease-out'
        }
      },
      {
        time: 9000,
        duration: 2500,
        camera: {
          type: 'focus',
          target: 'player',
          zoom: 1.3,
          easing: 'ease-in-out'
        }
      },
      {
        time: 11500,
        duration: 2500,
        camera: {
          type: 'zoom_out',
          zoom: 1.0,
          easing: 'ease-in-out'
        }
      }
    ],
    dialogue: [
      {
        time: 4500,
        duration: 3500,
        speaker: 'The Annihilator',
        text: 'I\'ve studied your tactics. You\'re predictable. Emotional. Weak.'
      },
      {
        time: 9000,
        duration: 2500,
        speaker: 'Soldier',
        text: 'Then you know why I\'m here. Stand aside or join the others.'
      },
      {
        time: 12000,
        duration: 2000,
        speaker: 'The Annihilator',
        text: 'My shields are impenetrable. You cannot win this fight!'
      }
    ],
    animations: [
      {
        time: 500,
        target: 'boss',
        action: 'walk_in'
      },
      {
        time: 4000,
        target: 'boss',
        action: 'pose'
      },
      {
        time: 11500,
        target: 'boss',
        action: 'shield_activate'
      }
    ],
    audio: [
      {
        time: 0,
        type: 'music',
        track: 'boss'
      },
      {
        time: 11500,
        type: 'sfx',
        sound: 'explosion',
        volume: 0.5
      }
    ],
    metadata: {
      theme: 'confrontation',
      atmosphere: 'tactical',
      specialMechanic: 'Periodic shield phases'
    }
  },

  // Level 9 Boss Defeat
  level9_boss_defeat: {
    cutsceneId: 'level9_boss_defeat',
    type: 'story',
    trigger: 'boss_defeat',
    level: 9,
    bossId: 2,
    duration: 12000,
    shots: [
      {
        time: 0,
        duration: 12000,
        camera: {
          type: 'focus',
          target: 'player',
          zoom: 1.2,
          easing: 'linear'
        }
      }
    ],
    dialogue: [
      {
        time: 500,
        duration: 3500,
        speaker: 'Soldier',
        text: 'Three commanders fallen. Only the Overlord remains.'
      },
      {
        time: 4500,
        duration: 3500,
        speaker: 'Commander',
        text: 'The Overlord\'s fortress is ahead. He\'s the one who ordered the attack on your village.'
      },
      {
        time: 8500,
        duration: 3000,
        speaker: 'Soldier',
        text: 'Elena... I\'m almost there. This ends today.'
      }
    ],
    audio: [
      {
        time: 0,
        type: 'music',
        track: 'gameplay'
      }
    ],
    metadata: {
      theme: 'determination',
      atmosphere: 'emotional'
    }
  },

  // Level 10 - Final Boss Pre-Fight (The Overlord)
  level10_boss_intro: {
    cutsceneId: 'level10_boss_intro',
    type: 'boss_intro',
    trigger: 'boss_spawn',
    level: 10,
    bossId: 3,
    bossName: 'The Overlord',
    duration: 18000,
    shots: [
      {
        time: 0,
        duration: 4000,
        camera: {
          type: 'pan',
          startX: 800,
          endX: 2000,
          zoom: 1.0,
          easing: 'ease-in-out'
        }
      },
      {
        time: 4000,
        duration: 5000,
        camera: {
          type: 'focus',
          target: 'boss',
          zoom: 1.5,
          offsetY: -40,
          easing: 'ease-out'
        }
      },
      {
        time: 9000,
        duration: 4000,
        camera: {
          type: 'focus',
          target: 'player',
          zoom: 1.3,
          easing: 'ease-in-out'
        }
      },
      {
        time: 13000,
        duration: 5000,
        camera: {
          type: 'zoom_out',
          zoom: 1.0,
          easing: 'ease-in-out'
        }
      }
    ],
    dialogue: [
      {
        time: 4500,
        duration: 4000,
        speaker: 'The Overlord',
        text: 'So you\'re the one who\'s been destroying my commanders. Impressive... for a mortal.'
      },
      {
        time: 9000,
        duration: 3500,
        speaker: 'Soldier',
        text: 'You ordered the attack on my village. You killed everyone I loved. Now you answer for it.'
      },
      {
        time: 13000,
        duration: 4500,
        speaker: 'The Overlord',
        text: 'I remember that village. They refused to bow. Just like you. And you\'ll share their fate!'
      }
    ],
    animations: [
      {
        time: 500,
        target: 'boss',
        action: 'walk_in'
      },
      {
        time: 4000,
        target: 'boss',
        action: 'pose'
      },
      {
        time: 13000,
        target: 'boss',
        action: 'power_surge'
      },
      {
        time: 16000,
        target: 'boss',
        action: 'final_pose'
      }
    ],
    audio: [
      {
        time: 0,
        type: 'music',
        track: 'boss'
      },
      {
        time: 13000,
        type: 'sfx',
        sound: 'explosion',
        volume: 0.8
      }
    ],
    metadata: {
      theme: 'final_confrontation',
      atmosphere: 'epic',
      specialMechanic: 'All mechanics combined'
    }
  },

  // Victory Ending - After Defeating The Overlord
  victory_ending: {
    cutsceneId: 'victory_ending',
    type: 'story',
    trigger: 'game_complete',
    level: 10,
    duration: 20000,
    shots: [
      {
        time: 0,
        duration: 6000,
        camera: {
          type: 'focus',
          target: 'player',
          zoom: 1.3,
          easing: 'linear'
        }
      },
      {
        time: 6000,
        duration: 6000,
        camera: {
          type: 'zoom_out',
          zoom: 0.9,
          easing: 'ease-in-out'
        }
      },
      {
        time: 12000,
        duration: 8000,
        camera: {
          type: 'static',
          zoom: 1.0
        }
      }
    ],
    dialogue: [
      {
        time: 500,
        duration: 4000,
        speaker: 'Soldier',
        text: 'It\'s over. The Overlord is dead. The Iron Legion is finished.'
      },
      {
        time: 5000,
        duration: 4000,
        speaker: 'Commander',
        text: 'You\'ve done the impossible. You avenged everyone they took from us.'
      },
      {
        time: 10000,
        duration: 4500,
        speaker: 'Soldier',
        text: 'Elena... I kept my promise. They paid for what they did. All of them.'
      },
      {
        time: 15000,
        duration: 4500,
        speaker: '???',
        text: 'And so the soldier\'s journey ended. Not in glory, but in peace. The war was over.'
      }
    ],
    audio: [
      {
        time: 0,
        type: 'music',
        track: 'victory'
      }
    ],
    metadata: {
      theme: 'resolution',
      atmosphere: 'bittersweet'
    }
  }
};

// Build lookup indices for O(1) access
const CutsceneByIdIndex = {};
const CutsceneByTriggerIndex = {};

// Initialize indices
(function buildIndices() {
  for (const key in StoryCutsceneData) {
    const cutscene = StoryCutsceneData[key];
    
    // Index by cutsceneId
    CutsceneByIdIndex[cutscene.cutsceneId] = cutscene;
    
    // Index by trigger + level + bossId
    const trigger = cutscene.trigger;
    const level = cutscene.level;
    const bossId = cutscene.bossId !== undefined ? cutscene.bossId : 'none';
    
    if (!CutsceneByTriggerIndex[trigger]) {
      CutsceneByTriggerIndex[trigger] = {};
    }
    if (!CutsceneByTriggerIndex[trigger][level]) {
      CutsceneByTriggerIndex[trigger][level] = {};
    }
    CutsceneByTriggerIndex[trigger][level][bossId] = cutscene;
  }
})();

// Helper function to get cutscene by trigger and level (O(1) lookup)
function getStoryCutscene(trigger, level, bossId = null) {
  const triggerIndex = CutsceneByTriggerIndex[trigger];
  if (!triggerIndex) return null;
  
  const levelIndex = triggerIndex[level];
  if (!levelIndex) return null;
  
  // Try to find by bossId first, then fall back to 'none'
  if (bossId !== null && levelIndex[bossId]) {
    return levelIndex[bossId];
  }
  return levelIndex['none'] || null;
}

// Helper function to get cutscene by ID (O(1) lookup)
function getStoryCutsceneById(cutsceneId) {
  return CutsceneByIdIndex[cutsceneId] || null;
}

// Make data accessible globally
window.StoryCutsceneData = StoryCutsceneData;
window.getStoryCutscene = getStoryCutscene;
window.getStoryCutsceneById = getStoryCutsceneById;
