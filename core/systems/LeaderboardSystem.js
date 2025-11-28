// Leaderboard System - Local and mode-specific leaderboards
class LeaderboardSystem {
  constructor() {
    this.maxEntries = 10;
    this.leaderboards = this.loadLeaderboards();
  }

  /**
   * Get default leaderboard structure
   * @returns {Object} Default leaderboard data
   */
  getDefaultLeaderboards() {
    return {
      // Campaign mode
      campaign: {
        overall: [],
        byLevel: {}
      },
      
      // Survival mode
      survival: {
        byWave: [],
        byScore: []
      },
      
      // Challenge modes
      timeAttack: {
        overall: [],
        byLevel: {}
      },
      bossRush: {
        overall: [],
        byBoss: {}
      },
      horde: {
        byWave: [],
        byTime: []
      },
      oneHit: {
        byLevels: [],
        byTime: []
      }
    };
  }

  /**
   * Submit a score to leaderboard
   * @param {string} mode - Game mode
   * @param {string} category - Leaderboard category
   * @param {Object} entry - Score entry data
   * @returns {Object} Result with rank and isNewRecord
   */
  submitScore(mode, category, entry) {
    // Ensure entry has required fields
    const scoreEntry = {
      name: entry.name || 'Player',
      score: entry.score || 0,
      time: entry.time || 0,
      wave: entry.wave || 0,
      level: entry.level || 0,
      character: entry.character || 'soldier',
      difficulty: entry.difficulty || 'medium',
      date: new Date().toISOString(),
      ...entry
    };
    
    // Get the appropriate leaderboard
    let leaderboard = this.getLeaderboard(mode, category);
    if (!leaderboard) {
      leaderboard = [];
    }
    
    // Add entry and sort
    leaderboard.push(scoreEntry);
    leaderboard = this.sortLeaderboard(leaderboard, mode, category);
    
    // Trim to max entries
    leaderboard = leaderboard.slice(0, this.maxEntries);
    
    // Update leaderboard
    this.setLeaderboard(mode, category, leaderboard);
    this.saveLeaderboards();
    
    // Get rank
    const rank = this.getRank(mode, category, scoreEntry);
    
    return {
      rank: rank,
      isNewRecord: rank === 1,
      isOnLeaderboard: rank <= this.maxEntries
    };
  }

  /**
   * Get leaderboard for mode and category
   * @param {string} mode - Game mode
   * @param {string} category - Category
   * @returns {Array} Leaderboard entries
   */
  getLeaderboard(mode, category) {
    // Protect against prototype pollution
    if (!this.isSafePropertyName(mode) || !this.isSafePropertyName(category)) {
      return [];
    }
    
    if (!Object.prototype.hasOwnProperty.call(this.leaderboards, mode)) {
      return [];
    }
    
    const modeBoard = this.leaderboards[mode];
    if (!modeBoard || !Object.prototype.hasOwnProperty.call(modeBoard, category)) {
      return [];
    }
    
    const result = modeBoard[category];
    return Array.isArray(result) ? result : [];
  }

  /**
   * Check if a property name is safe (not a prototype pollution vector)
   * @param {string} name - Property name to check
   * @returns {boolean} Whether the property name is safe
   */
  isSafePropertyName(name) {
    return name !== '__proto__' && 
           name !== 'constructor' && 
           name !== 'prototype' &&
           typeof name === 'string' &&
           name.length > 0;
  }

  /**
   * Set leaderboard for mode and category
   * @param {string} mode - Game mode
   * @param {string} category - Category
   * @param {Array} data - Leaderboard data
   */
  setLeaderboard(mode, category, data) {
    // Protect against prototype pollution
    if (!this.isSafePropertyName(mode)) {
      return;
    }
    
    if (!Object.prototype.hasOwnProperty.call(this.leaderboards, mode)) {
      this.leaderboards[mode] = Object.create(null);
    }
    
    // Handle nested categories - for simplicity, we don't support nested categories
    // to avoid prototype pollution risks. Use flat category names instead.
    if (!this.isSafePropertyName(category)) {
      return;
    }
    
    // Use a safe assignment pattern
    const modeBoard = this.leaderboards[mode];
    if (modeBoard && typeof modeBoard === 'object') {
      modeBoard[category] = data;
    }
  }

  /**
   * Sort leaderboard based on mode/category
   * @param {Array} leaderboard - Leaderboard to sort
   * @param {string} mode - Game mode
   * @param {string} category - Category
   * @returns {Array} Sorted leaderboard
   */
  sortLeaderboard(leaderboard, mode, category) {
    // Determine sort criteria based on mode/category
    let sortBy = 'score';
    let ascending = false;
    
    if (mode === 'timeAttack' || mode === 'bossRush') {
      sortBy = 'time';
      ascending = true; // Lower time is better
    } else if (mode === 'horde') {
      if (category === 'byWave') {
        sortBy = 'wave';
        ascending = false; // Higher wave is better
      } else {
        sortBy = 'time';
        ascending = false; // Longer survival is better
      }
    } else if (mode === 'oneHit') {
      if (category === 'byLevels') {
        sortBy = 'level';
        ascending = false; // More levels is better
      }
    } else if (category === 'byWave' || category === 'byLevels') {
      sortBy = 'wave';
      ascending = false;
    }
    
    return leaderboard.sort((a, b) => {
      if (ascending) {
        return (a[sortBy] || 0) - (b[sortBy] || 0);
      }
      return (b[sortBy] || 0) - (a[sortBy] || 0);
    });
  }

  /**
   * Get rank for an entry
   * @param {string} mode - Game mode
   * @param {string} category - Category
   * @param {Object} entry - Entry to find
   * @returns {number} Rank (1-based)
   */
  getRank(mode, category, entry) {
    const leaderboard = this.getLeaderboard(mode, category);
    
    for (let i = 0; i < leaderboard.length; i++) {
      if (leaderboard[i].date === entry.date) {
        return i + 1;
      }
    }
    
    return -1;
  }

  /**
   * Check if score qualifies for leaderboard
   * @param {string} mode - Game mode
   * @param {string} category - Category
   * @param {Object} entry - Entry to check
   * @returns {boolean} Whether score qualifies
   */
  qualifiesForLeaderboard(mode, category, entry) {
    const leaderboard = this.getLeaderboard(mode, category);
    
    if (leaderboard.length < this.maxEntries) {
      return true;
    }
    
    // Get comparison value
    let sortBy = 'score';
    let ascending = false;
    
    if (mode === 'timeAttack' || mode === 'bossRush') {
      sortBy = 'time';
      ascending = true;
    } else if (mode === 'horde' && category === 'byWave') {
      sortBy = 'wave';
    } else if (mode === 'oneHit' && category === 'byLevels') {
      sortBy = 'level';
    }
    
    const lastEntry = leaderboard[leaderboard.length - 1];
    const entryValue = entry[sortBy] || 0;
    const lastValue = lastEntry[sortBy] || 0;
    
    if (ascending) {
      return entryValue < lastValue;
    }
    return entryValue > lastValue;
  }

  /**
   * Get top scores for display
   * @param {string} mode - Game mode
   * @param {string} category - Category
   * @param {number} count - Number of entries
   * @returns {Array} Top entries
   */
  getTopScores(mode, category, count = 10) {
    const leaderboard = this.getLeaderboard(mode, category);
    return leaderboard.slice(0, count);
  }

  /**
   * Get player's best score
   * @param {string} mode - Game mode
   * @param {string} category - Category
   * @param {string} playerName - Player name
   * @returns {Object|null} Best entry or null
   */
  getPlayerBest(mode, category, playerName) {
    const leaderboard = this.getLeaderboard(mode, category);
    return leaderboard.find(e => e.name === playerName) || null;
  }

  /**
   * Clear a specific leaderboard
   * @param {string} mode - Game mode
   * @param {string} category - Category (optional)
   */
  clearLeaderboard(mode, category = null) {
    if (category) {
      this.setLeaderboard(mode, category, []);
    } else if (this.leaderboards[mode]) {
      this.leaderboards[mode] = this.getDefaultLeaderboards()[mode] || {};
    }
    this.saveLeaderboards();
  }

  /**
   * Clear all leaderboards
   */
  clearAllLeaderboards() {
    this.leaderboards = this.getDefaultLeaderboards();
    this.saveLeaderboards();
  }

  /**
   * Load leaderboards from storage
   * @returns {Object} Leaderboard data
   */
  loadLeaderboards() {
    try {
      const stored = localStorage.getItem('gameLeaderboards');
      if (stored) {
        const loaded = JSON.parse(stored);
        return this.mergeWithDefaults(loaded);
      }
    } catch (e) {
      console.warn('Could not load leaderboards:', e);
    }
    return this.getDefaultLeaderboards();
  }

  /**
   * Merge loaded data with defaults
   * @param {Object} loaded - Loaded data
   * @returns {Object} Merged data
   */
  mergeWithDefaults(loaded) {
    const defaults = this.getDefaultLeaderboards();
    return { ...defaults, ...loaded };
  }

  /**
   * Save leaderboards to storage
   */
  saveLeaderboards() {
    try {
      localStorage.setItem('gameLeaderboards', JSON.stringify(this.leaderboards));
    } catch (e) {
      console.warn('Could not save leaderboards:', e);
    }
  }

  /**
   * Format time for display
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time
   */
  formatTime(seconds) {
    if (seconds === null || seconds === undefined) return '--:--';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }

  /**
   * Format date for display
   * @param {string} isoDate - ISO date string
   * @returns {string} Formatted date
   */
  formatDate(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleDateString();
  }

  /**
   * Render leaderboard to canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {string} mode - Game mode
   * @param {string} category - Category
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width
   * @param {string} playerName - Current player name (to highlight)
   */
  render(ctx, mode, category, x, y, width, playerName = null) {
    const leaderboard = this.getTopScores(mode, category);
    const rowHeight = 25;
    
    ctx.save();
    
    // Header
    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.getModeTitle(mode, category), x + width / 2, y);
    
    // Column headers
    ctx.fillStyle = '#888888';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('RANK', x + 10, y + 25);
    ctx.fillText('NAME', x + 60, y + 25);
    ctx.fillText(this.getValueHeader(mode), x + 180, y + 25);
    ctx.fillText('DATE', x + 280, y + 25);
    
    // Separator line
    ctx.strokeStyle = '#444444';
    ctx.beginPath();
    ctx.moveTo(x, y + 35);
    ctx.lineTo(x + width, y + 35);
    ctx.stroke();
    
    if (leaderboard.length === 0) {
      ctx.fillStyle = '#666666';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('No entries yet', x + width / 2, y + 70);
    } else {
      // Entries
      leaderboard.forEach((entry, index) => {
        const rowY = y + 50 + index * rowHeight;
        const isPlayer = entry.name === playerName;
        
        // Highlight player's entry
        if (isPlayer) {
          ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
          ctx.fillRect(x, rowY - 15, width, rowHeight);
        }
        
        // Rank medal
        ctx.textAlign = 'left';
        if (index === 0) {
          ctx.fillStyle = '#ffd700';
          ctx.fillText('🥇', x + 10, rowY);
        } else if (index === 1) {
          ctx.fillStyle = '#c0c0c0';
          ctx.fillText('🥈', x + 10, rowY);
        } else if (index === 2) {
          ctx.fillStyle = '#cd7f32';
          ctx.fillText('🥉', x + 10, rowY);
        } else {
          ctx.fillStyle = '#888888';
          ctx.font = '14px monospace';
          ctx.fillText(`${index + 1}.`, x + 10, rowY);
        }
        
        // Name
        ctx.fillStyle = isPlayer ? '#00ff00' : '#ffffff';
        ctx.font = '14px monospace';
        ctx.fillText(entry.name.substring(0, 12), x + 60, rowY);
        
        // Value
        ctx.fillStyle = '#ffff00';
        ctx.fillText(this.getDisplayValue(mode, category, entry), x + 180, rowY);
        
        // Date
        ctx.fillStyle = '#666666';
        ctx.font = '12px monospace';
        ctx.fillText(this.formatDate(entry.date), x + 280, rowY);
      });
    }
    
    ctx.restore();
  }

  /**
   * Get mode title for display
   * @param {string} mode - Game mode
   * @param {string} category - Category
   * @returns {string} Title
   */
  getModeTitle(mode, category) {
    const titles = {
      campaign: 'CAMPAIGN',
      survival: 'SURVIVAL MODE',
      timeAttack: 'TIME ATTACK',
      bossRush: 'BOSS RUSH',
      horde: 'HORDE MODE',
      oneHit: 'ONE-HIT MODE'
    };
    
    return titles[mode] || mode.toUpperCase();
  }

  /**
   * Get value header based on mode
   * @param {string} mode - Game mode
   * @returns {string} Header text
   */
  getValueHeader(mode) {
    switch (mode) {
      case 'timeAttack':
      case 'bossRush':
        return 'TIME';
      case 'horde':
        return 'WAVE';
      case 'oneHit':
        return 'LEVELS';
      default:
        return 'SCORE';
    }
  }

  /**
   * Get display value for entry
   * @param {string} mode - Game mode
   * @param {string} category - Category
   * @param {Object} entry - Entry data
   * @returns {string} Formatted value
   */
  getDisplayValue(mode, category, entry) {
    switch (mode) {
      case 'timeAttack':
      case 'bossRush':
        return this.formatTime(entry.time);
      case 'horde':
        if (category === 'byWave') {
          return `Wave ${entry.wave}`;
        }
        return this.formatTime(entry.time);
      case 'oneHit':
        return `${entry.level}/10`;
      default:
        return entry.score.toLocaleString();
    }
  }
}
