/**
 * FormationSystem - Manages enemy group formations
 * Coordinates enemy movement in tactical patterns
 */
class FormationSystem {
  constructor() {
    this.formations = [];
    this.nextFormationId = 1;
  }

  /**
   * Get formation configuration from GameConfig
   * @returns {Object} Formation configuration
   */
  getConfig() {
    return typeof GameConfig !== 'undefined' && GameConfig.FORMATIONS ? 
      GameConfig.FORMATIONS : {
        LINE: { spacing: 80, minMembers: 3 },
        V_SHAPE: { angle: 60, spacing: 100, minMembers: 3 },
        CIRCLE: { minMembers: 4 },
        PINCER: { angle: 180, minMembers: 4 },
        FIRING_LINE: { frontSpacing: 80, rowSpacing: 100, minMembers: 4 },
        SCATTER: { minDistance: 100, maxDistance: 200, minMembers: 2 },
        reformTime: 5
      };
  }

  /**
   * Create a new formation with enemies
   * @param {Array} enemies - Array of enemy entities
   * @param {string} type - Formation type (LINE, V_SHAPE, CIRCLE, PINCER, FIRING_LINE, SCATTER)
   * @param {Object} target - Target position or entity
   * @returns {Object|null} Formation object or null if not enough enemies
   */
  createFormation(enemies, type, target) {
    const config = this.getConfig();
    const formationConfig = config[type];
    
    if (!formationConfig || enemies.length < formationConfig.minMembers) {
      return null;
    }
    
    // Find strongest enemy to be leader
    let leader = enemies[0];
    enemies.forEach(enemy => {
      if (enemy.maxHealth > leader.maxHealth) {
        leader = enemy;
      }
    });
    
    const formation = {
      id: this.nextFormationId++,
      type: type,
      leader: leader,
      members: enemies,
      target: target,
      active: true,
      formTime: performance.now(),
      lastUpdateTime: performance.now()
    };
    
    // Assign formation roles to enemies
    enemies.forEach((enemy, index) => {
      enemy.formationId = formation.id;
      enemy.formationRole = enemy === leader ? 'leader' : 'follower';
      enemy.formationIndex = index;
    });
    
    this.formations.push(formation);
    
    // Calculate initial positions
    this.calculatePositions(formation);
    
    return formation;
  }

  /**
   * Calculate target positions for formation members
   * @param {Object} formation - The formation object
   */
  calculatePositions(formation) {
    const config = this.getConfig();
    const formationConfig = config[formation.type];
    
    if (!formation.leader || !formation.leader.active) {
      this.disbandFormation(formation.id);
      return;
    }
    
    const leaderX = formation.leader.x;
    const leaderY = formation.leader.y;
    
    // Get target position (player position if target is an entity)
    let targetX = formation.target?.x || leaderX + 200;
    let targetY = formation.target?.y || leaderY;
    if (formation.target && formation.target.width) {
      targetX += formation.target.width / 2;
      targetY += formation.target.height / 2;
    }
    
    // Calculate facing angle towards target
    const dx = targetX - leaderX;
    const dy = targetY - leaderY;
    const facingAngle = Math.atan2(dy, dx);
    
    formation.members.forEach((enemy, index) => {
      if (!enemy.active) return;
      
      let offsetX = 0;
      let offsetY = 0;
      
      switch (formation.type) {
        case 'LINE':
          // Horizontal line perpendicular to target direction
          offsetX = (index - formation.members.length / 2) * formationConfig.spacing;
          offsetY = 0;
          // Rotate offset based on facing angle
          const lineAngle = facingAngle + Math.PI / 2;
          const rotX = offsetX * Math.cos(lineAngle) - offsetY * Math.sin(lineAngle);
          const rotY = offsetX * Math.sin(lineAngle) + offsetY * Math.cos(lineAngle);
          offsetX = rotX;
          offsetY = rotY;
          break;
          
        case 'V_SHAPE':
          if (index === 0) {
            // Leader at point
            offsetX = 0;
            offsetY = 0;
          } else {
            // Followers form V behind leader
            const side = index % 2 === 1 ? -1 : 1;
            const row = Math.ceil(index / 2);
            const vAngle = (formationConfig.angle / 2) * (Math.PI / 180);
            offsetX = -row * formationConfig.spacing * Math.cos(vAngle);
            offsetY = side * row * formationConfig.spacing * Math.sin(vAngle);
          }
          break;
          
        case 'CIRCLE':
          // Circle around target
          const circleAngle = (index / formation.members.length) * Math.PI * 2;
          const radius = 150;
          offsetX = Math.cos(circleAngle) * radius - (leaderX - targetX);
          offsetY = Math.sin(circleAngle) * radius - (leaderY - targetY);
          break;
          
        case 'PINCER':
          // Two-pronged attack from sides
          if (index < formation.members.length / 2) {
            // Left flank
            offsetX = -200;
            offsetY = (index - formation.members.length / 4) * 100;
          } else {
            // Right flank
            offsetX = 200;
            offsetY = (index - formation.members.length * 3 / 4) * 100;
          }
          break;
          
        case 'FIRING_LINE':
          // Front row for melee, back row for ranged
          const isFrontRow = enemy.isMelee || index < formation.members.length / 2;
          if (isFrontRow) {
            const frontIndex = index % Math.ceil(formation.members.length / 2);
            offsetX = 0;
            offsetY = (frontIndex - formation.members.length / 4) * formationConfig.frontSpacing;
          } else {
            const backIndex = index - Math.ceil(formation.members.length / 2);
            offsetX = -formationConfig.rowSpacing;
            offsetY = (backIndex - formation.members.length / 4) * formationConfig.frontSpacing;
          }
          break;
          
        case 'SCATTER':
          // Random positions within range
          if (!enemy.scatterOffset) {
            const angle = Math.random() * Math.PI * 2;
            const distance = formationConfig.minDistance + 
              Math.random() * (formationConfig.maxDistance - formationConfig.minDistance);
            enemy.scatterOffset = {
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance
            };
          }
          offsetX = enemy.scatterOffset.x;
          offsetY = enemy.scatterOffset.y;
          break;
      }
      
      // Store target position for this enemy
      enemy.formationTarget = {
        x: leaderX + offsetX,
        y: leaderY + offsetY
      };
    });
  }

  /**
   * Update all formations
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    const currentTime = performance.now();
    const config = this.getConfig();
    
    this.formations.forEach(formation => {
      if (!formation.active) return;
      
      // Check if leader is still alive
      if (!formation.leader || !formation.leader.active) {
        // Leader died - formation breaks
        this.disbandFormation(formation.id);
        
        // Try to reform after delay
        setTimeout(() => {
          const remainingMembers = formation.members.filter(m => m.active);
          if (remainingMembers.length >= 2) {
            this.createFormation(remainingMembers, formation.type, formation.target);
          }
        }, config.reformTime * 1000);
        
        return;
      }
      
      // Update positions periodically
      if (currentTime - formation.lastUpdateTime > 500) {
        this.calculatePositions(formation);
        formation.lastUpdateTime = currentTime;
      }
      
      // Move members towards their formation positions
      formation.members.forEach(enemy => {
        if (!enemy.active || !enemy.formationTarget) return;
        
        const dx = enemy.formationTarget.x - enemy.x;
        const dy = enemy.formationTarget.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Only adjust if far from position
        if (dist > 20) {
          // Store formation movement intent
          enemy.formationDx = (dx / dist) * 0.5;
          enemy.formationDy = (dy / dist) * 0.5;
        } else {
          enemy.formationDx = 0;
          enemy.formationDy = 0;
        }
      });
      
      // Clean up inactive members
      formation.members = formation.members.filter(m => m.active);
      
      // Disband if too few members
      if (formation.members.length < 2) {
        this.disbandFormation(formation.id);
      }
    });
    
    // Clean up inactive formations
    this.formations = this.formations.filter(f => f.active);
  }

  /**
   * Disband a formation
   * @param {number} formationId - ID of formation to disband
   */
  disbandFormation(formationId) {
    const formation = this.formations.find(f => f.id === formationId);
    if (!formation) return;
    
    formation.active = false;
    
    // Clear formation data from members
    formation.members.forEach(enemy => {
      if (enemy.active) {
        enemy.formationId = null;
        enemy.formationRole = null;
        enemy.formationTarget = null;
        enemy.formationDx = 0;
        enemy.formationDy = 0;
        enemy.scatterOffset = null;
      }
    });
  }

  /**
   * Get formation for an enemy
   * @param {Object} enemy - Enemy entity
   * @returns {Object|null} Formation or null
   */
  getFormation(enemy) {
    if (!enemy.formationId) return null;
    return this.formations.find(f => f.id === enemy.formationId);
  }

  /**
   * Choose appropriate formation type based on enemies
   * @param {Array} enemies - Array of enemies
   * @param {Object} player - Player entity
   * @returns {string} Recommended formation type
   */
  recommendFormationType(enemies, player) {
    if (enemies.length < 2) return null;
    
    // Count enemy types
    const hasRanged = enemies.some(e => !e.isMelee);
    const hasMelee = enemies.some(e => e.isMelee);
    const hasBerserkers = enemies.some(e => e.enemyType === 'berserker');
    const hasScouts = enemies.some(e => e.enemyType === 'scout');
    
    // Choose based on composition
    if (hasBerserkers) {
      return 'SCATTER';
    }
    
    if (hasScouts && enemies.length >= 4) {
      return 'PINCER';
    }
    
    if (hasRanged && hasMelee && enemies.length >= 4) {
      return 'FIRING_LINE';
    }
    
    if (enemies.length >= 4) {
      return 'CIRCLE';
    }
    
    if (enemies.length >= 3) {
      return 'V_SHAPE';
    }
    
    return 'LINE';
  }

  /**
   * Automatically assign formations to groups of enemies
   * @param {Array} enemies - All enemies
   * @param {Object} player - Player entity
   */
  autoAssignFormations(enemies, player) {
    // Get enemies without formations
    const unassigned = enemies.filter(e => e.active && !e.formationId);
    
    if (unassigned.length < 2) return;
    
    // Group nearby enemies
    const groups = [];
    const assigned = new Set();
    
    unassigned.forEach(enemy => {
      if (assigned.has(enemy)) return;
      
      const group = [enemy];
      assigned.add(enemy);
      
      // Find nearby enemies
      unassigned.forEach(other => {
        if (assigned.has(other)) return;
        
        const dx = other.x - enemy.x;
        const dy = other.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 300) {
          group.push(other);
          assigned.add(other);
        }
      });
      
      if (group.length >= 2) {
        groups.push(group);
      }
    });
    
    // Create formations for groups
    groups.forEach(group => {
      const type = this.recommendFormationType(group, player);
      if (type) {
        this.createFormation(group, type, player);
      }
    });
  }

  /**
   * Clear all formations
   */
  clear() {
    this.formations.forEach(f => this.disbandFormation(f.id));
    this.formations = [];
  }

  /**
   * Render formation debug visualization
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderDebug(ctx) {
    this.formations.forEach(formation => {
      if (!formation.active) return;
      
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      
      // Draw lines connecting members
      formation.members.forEach(enemy => {
        if (!enemy.active || enemy === formation.leader) return;
        
        ctx.beginPath();
        ctx.moveTo(
          formation.leader.x + formation.leader.width / 2,
          formation.leader.y + formation.leader.height / 2
        );
        ctx.lineTo(
          enemy.x + enemy.width / 2,
          enemy.y + enemy.height / 2
        );
        ctx.stroke();
        
        // Draw target position
        if (enemy.formationTarget) {
          ctx.strokeStyle = '#ffff00';
          ctx.beginPath();
          ctx.arc(enemy.formationTarget.x, enemy.formationTarget.y, 10, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
      
      // Mark leader
      if (formation.leader.active) {
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(
          formation.leader.x + formation.leader.width / 2,
          formation.leader.y - 10,
          5,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    });
    
    ctx.globalAlpha = 1;
  }
}
