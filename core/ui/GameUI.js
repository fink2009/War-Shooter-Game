// Game UI and HUD
class GameUI {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
  }

  drawHUD(ctx, player, gameState) {
    ctx.save();
    
    // HUD Background (military style)
    ctx.fillStyle = 'rgba(26, 32, 38, 0.9)';
    ctx.fillRect(0, 0, this.width, 50);
    ctx.fillRect(0, this.height - 50, this.width, 50);
    
    // Add military-style border
    ctx.strokeStyle = '#4a6741';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, this.width - 4, 46);
    ctx.strokeRect(2, this.height - 48, this.width - 4, 46);
    
    // Health
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('HEALTH', 10, 20);
    
    const healthBarWidth = 200;
    const healthBarHeight = 20;
    const healthPercent = player.health / player.maxHealth;
    
    ctx.fillStyle = '#660000';
    ctx.fillRect(10, 25, healthBarWidth, healthBarHeight);
    
    // Health color based on percentage
    if (healthPercent > 0.6) {
      ctx.fillStyle = '#00ff00';
    } else if (healthPercent > 0.3) {
      ctx.fillStyle = '#ffff00';
    } else {
      ctx.fillStyle = '#ff0000';
    }
    ctx.fillRect(10, 25, healthBarWidth * healthPercent, healthBarHeight);
    
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 25, healthBarWidth, healthBarHeight);
    
    ctx.fillStyle = '#00ff00';
    ctx.fillText(`${Math.ceil(player.health)}/${player.maxHealth}`, 220, 40);
    
    // Weapon info
    const weapon = player.getCurrentWeapon();
    ctx.fillStyle = '#00ff00';
    ctx.fillText('WEAPON', 10, this.height - 35);
    ctx.fillStyle = '#ffff00';
    ctx.fillText(weapon.name.toUpperCase(), 10, this.height - 15);
    
    // Ammo
    ctx.fillStyle = '#00ff00';
    ctx.fillText('AMMO', this.width - 150, this.height - 35);
    if (weapon.isReloading) {
      ctx.fillStyle = '#ff0000';
      ctx.fillText('RELOADING...', this.width - 150, this.height - 15);
    } else {
      ctx.fillStyle = weapon.currentAmmo === 0 ? '#ff0000' : '#ffff00';
      ctx.fillText(`${weapon.currentAmmo}/${weapon.ammoCapacity}`, this.width - 150, this.height - 15);
    }
    
    // Score
    ctx.fillStyle = '#00ff00';
    ctx.fillText(`SCORE: ${gameState.score}`, this.width - 150, 20);
    ctx.fillStyle = '#ffff00';
    ctx.fillText(`KILLS: ${gameState.kills}`, this.width - 150, 40);
    
    // Wave info (for survival mode)
    if (gameState.mode === 'survival') {
      ctx.fillStyle = '#00ff00';
      ctx.fillText(`WAVE: ${gameState.wave}`, this.width / 2 - 50, 20);
      ctx.fillStyle = '#ffff00';
      ctx.fillText(`ENEMIES: ${gameState.enemiesRemaining}`, this.width / 2 - 50, 40);
    }
    
    // Difficulty indicator
    if (window.game && window.game.difficulty) {
      ctx.fillStyle = '#888';
      ctx.font = '12px monospace';
      ctx.fillText(`[${window.game.difficulty.toUpperCase()}]`, this.width / 2 - 30, this.height - 10);
    }
    
    ctx.restore();
  }

  drawMenu(ctx, menuState) {
    ctx.save();
    
    // Semi-transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Title
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WAR SHOOTER', this.width / 2, 100);
    
    ctx.font = '24px monospace';
    
    if (menuState === 'main') {
      const options = [
        'Press 1 - CAMPAIGN',
        'Press 2 - SURVIVAL',
        'Press 3 - SETTINGS',
        'Press 4 - CONTROLS'
      ];
      
      ctx.fillStyle = '#00ff00';
      options.forEach((option, i) => {
        ctx.fillText(option, this.width / 2, 200 + i * 50);
      });
    } else if (menuState === 'character') {
      ctx.fillStyle = '#00ff00';
      ctx.fillText('SELECT CHARACTER', this.width / 2, 150);
      
      const characters = [
        '1 - SOLDIER (Balanced)',
        '2 - SCOUT (Fast, Low HP)',
        '3 - HEAVY (Slow, High HP)',
        '4 - MEDIC (Healing)'
      ];
      
      ctx.fillStyle = '#00ff00';
      characters.forEach((char, i) => {
        ctx.fillText(char, this.width / 2, 220 + i * 40);
      });
      
      ctx.fillStyle = '#888';
      ctx.font = '16px monospace';
      ctx.fillText('Press ESC to go back', this.width / 2, this.height - 50);
    } else if (menuState === 'settings') {
      ctx.fillStyle = '#00ff00';
      ctx.fillText('SETTINGS', this.width / 2, 150);
      
      ctx.fillStyle = '#00ff00';
      ctx.font = '20px monospace';
      ctx.fillText('DIFFICULTY:', this.width / 2, 220);
      
      // Difficulty options with current selection highlighted
      const difficulties = [
        { key: '1', name: 'EASY', value: 'easy' },
        { key: '2', name: 'MEDIUM', value: 'medium' },
        { key: '3', name: 'EXTREME', value: 'extreme' }
      ];
      
      difficulties.forEach((diff, i) => {
        const isSelected = window.game && window.game.difficulty === diff.value;
        ctx.fillStyle = isSelected ? '#ffff00' : '#00ff00';
        ctx.fillText(`${diff.key} - ${diff.name}${isSelected ? ' [SELECTED]' : ''}`, 
                    this.width / 2, 260 + i * 35);
      });
      
      ctx.fillStyle = '#00ff00';
      ctx.fillText('AUDIO:', this.width / 2, 400);
      const audioStatus = window.game && window.game.audioEnabled ? 'ON' : 'OFF';
      ctx.fillText(`4 - Toggle Audio [${audioStatus}]`, this.width / 2, 440);
      
      ctx.fillStyle = '#888';
      ctx.font = '16px monospace';
      ctx.fillText('Press ESC to go back', this.width / 2, this.height - 50);
    } else if (menuState === 'controls') {
      ctx.fillStyle = '#00ff00';
      ctx.fillText('CONTROLS', this.width / 2, 100);
      
      ctx.font = '18px monospace';
      ctx.textAlign = 'left';
      
      const controls = [
        'MOVEMENT:',
        '  A/D or Arrow Keys - Move Left/Right',
        '  W/Space - Jump',
        '  S - Crouch',
        '  Shift - Roll/Dodge',
        '',
        'COMBAT:',
        '  Mouse - Aim',
        '  Left Click - Shoot',
        '  R - Reload',
        '  1/2/3/4 - Switch Weapons',
        '',
        'GAME:',
        '  ESC - Pause/Menu',
        '  M - Return to Main Menu'
      ];
      
      const startX = 250;
      let startY = 150;
      
      controls.forEach((line, i) => {
        if (line === '') {
          startY += 10;
        } else if (line.endsWith(':')) {
          ctx.fillStyle = '#ffff00';
          ctx.fillText(line, startX, startY);
          startY += 30;
        } else {
          ctx.fillStyle = '#00ff00';
          ctx.fillText(line, startX, startY);
          startY += 25;
        }
      });
      
      ctx.textAlign = 'center';
      ctx.fillStyle = '#888';
      ctx.font = '16px monospace';
      ctx.fillText('Press ESC to go back', this.width / 2, this.height - 50);
    } else if (menuState === 'paused') {
      ctx.fillStyle = '#00ff00';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', this.width / 2, 200);
      ctx.fillText('Press ESC to Resume', this.width / 2, 250);
      ctx.fillText('Press M for Main Menu', this.width / 2, 290);
    } else if (menuState === 'gameover') {
      ctx.fillStyle = '#ff0000';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', this.width / 2, 200);
      ctx.fillStyle = '#fff';
      ctx.fillText(`Final Score: ${this.lastScore || 0}`, this.width / 2, 250);
      ctx.fillText('Press R to Restart', this.width / 2, 290);
      ctx.fillText('Press M for Main Menu', this.width / 2, 330);
    } else if (menuState === 'victory') {
      ctx.fillStyle = '#00ff00';
      ctx.textAlign = 'center';
      ctx.fillText('VICTORY!', this.width / 2, 200);
      ctx.fillStyle = '#fff';
      ctx.fillText(`Final Score: ${this.lastScore || 0}`, this.width / 2, 250);
      ctx.fillText('Press R to Restart', this.width / 2, 290);
      ctx.fillText('Press M for Main Menu', this.width / 2, 330);
    }
    
    ctx.textAlign = 'left';
    ctx.restore();
  }

  drawLoadingScreen(ctx, progress) {
    ctx.save();
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.width, this.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LOADING...', this.width / 2, this.height / 2 - 30);
    
    // Progress bar
    const barWidth = 400;
    const barHeight = 30;
    const barX = (this.width - barWidth) / 2;
    const barY = this.height / 2;
    
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(barX, barY, barWidth * progress, barHeight);
    
    ctx.fillStyle = '#fff';
    ctx.fillText(`${Math.floor(progress * 100)}%`, this.width / 2, this.height / 2 + 60);
    
    ctx.textAlign = 'left';
    ctx.restore();
  }

  setLastScore(score) {
    this.lastScore = score;
  }
}
