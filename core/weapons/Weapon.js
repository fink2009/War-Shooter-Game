// Base weapon class
class Weapon {
  constructor(name, damage, fireRate, ammoCapacity, reloadTime, projectileSpeed) {
    this.name = name;
    this.damage = damage;
    this.fireRate = fireRate; // ms between shots
    this.ammoCapacity = ammoCapacity;
    this.currentAmmo = ammoCapacity;
    this.reloadTime = reloadTime; // ms
    this.projectileSpeed = projectileSpeed;
    this.lastFireTime = 0;
    this.isReloading = false;
    this.reloadStartTime = 0;
  }

  canFire(currentTime) {
    return !this.isReloading && 
           this.currentAmmo > 0 && 
           currentTime - this.lastFireTime >= this.fireRate;
  }

  fire(x, y, targetX, targetY, currentTime) {
    if (!this.canFire(currentTime)) {
      return null;
    }

    this.currentAmmo--;
    this.lastFireTime = currentTime;

    // Calculate direction
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Prevent division by zero - default to shooting right if target is at gun position
    if (dist === 0) {
      return new Projectile(x, y, this.projectileSpeed, 0, this.damage, this);
    }
    
    const vx = (dx / dist) * this.projectileSpeed;
    const vy = (dy / dist) * this.projectileSpeed;

    return new Projectile(x, y, vx, vy, this.damage, this);
  }

  reload(currentTime) {
    if (!this.isReloading && this.currentAmmo < this.ammoCapacity) {
      this.isReloading = true;
      this.reloadStartTime = currentTime;
    }
  }

  update(currentTime) {
    if (this.isReloading && currentTime - this.reloadStartTime >= this.reloadTime) {
      this.currentAmmo = this.ammoCapacity;
      this.isReloading = false;
    }
  }
}

// Weapon types
class Pistol extends Weapon {
  constructor() {
    super('Pistol', 15, 300, 12, 1500, 15);
  }
}

class Rifle extends Weapon {
  constructor() {
    super('Rifle', 25, 150, 30, 2000, 20);
  }
}

class Shotgun extends Weapon {
  constructor() {
    super('Shotgun', 50, 800, 6, 2500, 12);
    this.pellets = 5;
    this.spread = 0.2;
  }

  fire(x, y, targetX, targetY, currentTime) {
    if (!this.canFire(currentTime)) {
      // If we can't fire due to no ammo, start reloading automatically
      if (!this.isReloading && this.currentAmmo === 0) {
        this.reload(currentTime);
      }
      return null;
    }

    this.currentAmmo--;
    this.lastFireTime = currentTime;

    const projectiles = [];
    const dx = targetX - x;
    const dy = targetY - y;
    const baseAngle = Math.atan2(dy, dx);

    for (let i = 0; i < this.pellets; i++) {
      const angle = baseAngle + (Math.random() - 0.5) * this.spread;
      const vx = Math.cos(angle) * this.projectileSpeed;
      const vy = Math.sin(angle) * this.projectileSpeed;
      projectiles.push(new Projectile(x, y, vx, vy, this.damage / this.pellets, this));
    }

    return projectiles;
  }
}

class MachineGun extends Weapon {
  constructor() {
    super('Machine Gun', 20, 100, 100, 3000, 18);
  }
}

class SniperRifle extends Weapon {
  constructor() {
    super('Sniper Rifle', 150, 1200, 5, 2500, 30);
  }
}

class GrenadeLauncher extends Weapon {
  constructor() {
    super('Grenade Launcher', 150, 2000, 6, 3000, 10);
    this.explosionRadius = 80;
  }
  
  fire(x, y, targetX, targetY, currentTime) {
    if (!this.canFire(currentTime)) {
      return null;
    }

    this.currentAmmo--;
    this.lastFireTime = currentTime;

    // Calculate direction
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Prevent division by zero
    let vx, vy;
    if (dist === 0) {
      vx = this.projectileSpeed;
      vy = 0;
    } else {
      vx = (dx / dist) * this.projectileSpeed;
      vy = (dy / dist) * this.projectileSpeed;
    }

    const projectile = new Projectile(x, y, vx, vy, this.damage, this);
    projectile.isExplosive = true;
    projectile.explosionRadius = this.explosionRadius;
    projectile.color = '#ffaa00';
    projectile.width = 10;
    projectile.height = 10;
    return projectile;
  }
}

class LaserGun extends Weapon {
  constructor() {
    super('Laser Gun', 30, 80, 999, 2000, 25);
  }
  
  fire(x, y, targetX, targetY, currentTime) {
    if (!this.canFire(currentTime)) {
      return null;
    }

    this.currentAmmo--;
    this.lastFireTime = currentTime;

    // Calculate direction
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Prevent division by zero
    let vx, vy;
    if (dist === 0) {
      vx = this.projectileSpeed;
      vy = 0;
    } else {
      vx = (dx / dist) * this.projectileSpeed;
      vy = (dy / dist) * this.projectileSpeed;
    }

    const projectile = new Projectile(x, y, vx, vy, this.damage, this);
    projectile.color = '#00ffff';
    projectile.width = 12;
    projectile.height = 2;
    return projectile;
  }
}

// Melee Weapon Base Class
class MeleeWeapon extends Weapon {
  constructor(name, damage, fireRate, meleeRange) {
    super(name, damage, fireRate, 999, 0, 20); // Infinite ammo, no reload, fast projectile speed
    this.isMelee = true;
    this.meleeRange = meleeRange;
  }
  
  canFire(currentTime) {
    // Melee weapons don't need ammo check
    return currentTime - this.lastFireTime >= this.fireRate;
  }
  
  fire(x, y, targetX, targetY, currentTime) {
    if (!this.canFire(currentTime)) {
      return null;
    }

    // Calculate direction
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Check if target is within melee range
    if (dist > this.meleeRange) {
      return null; // Target out of range, no attack
    }
    
    // Only set cooldown if we're actually attacking
    this.lastFireTime = currentTime;
    
    let vx, vy;
    if (dist === 0) {
      vx = this.projectileSpeed;
      vy = 0;
    } else {
      vx = (dx / dist) * this.projectileSpeed;
      vy = (dy / dist) * this.projectileSpeed;
    }

    const projectile = new Projectile(x, y, vx, vy, this.damage, this);
    projectile.color = this.getColor();
    projectile.width = this.getWidth();
    projectile.height = this.getHeight();
    projectile.lifetime = this.meleeRange / this.projectileSpeed * 16; // Short lifetime for melee
    return projectile;
  }
  
  // Subclasses should override these for visual customization
  getColor() {
    return '#cccccc';
  }
  
  getWidth() {
    return 8;
  }
  
  getHeight() {
    return 4;
  }
}

// Melee Weapons
class Knife extends MeleeWeapon {
  constructor() {
    super('Knife', 35, 300, 60);
  }
  
  getColor() {
    return '#cccccc';
  }
  
  getWidth() {
    return 8;
  }
  
  getHeight() {
    return 4;
  }
}

class Sword extends MeleeWeapon {
  constructor() {
    super('Sword', 60, 500, 80);
  }
  
  getColor() {
    return '#aaaaff';
  }
  
  getWidth() {
    return 12;
  }
  
  getHeight() {
    return 6;
  }
}

class Axe extends MeleeWeapon {
  constructor() {
    super('Axe', 80, 700, 70);
  }
  
  getColor() {
    return '#884400';
  }
  
  getWidth() {
    return 14;
  }
  
  getHeight() {
    return 8;
  }
}

class Hammer extends MeleeWeapon {
  constructor() {
    super('Hammer', 100, 900, 75);
  }
  
  getColor() {
    return '#666666';
  }
  
  getWidth() {
    return 16;
  }
  
  getHeight() {
    return 10;
  }
}

class Spear extends MeleeWeapon {
  constructor() {
    super('Spear', 70, 600, 100); // Longer range than other melee
  }
  
  getColor() {
    return '#996633';
  }
  
  getWidth() {
    return 20;
  }
  
  getHeight() {
    return 4;
  }
}

// ==========================================
// NEW AREA DAMAGE WEAPONS
// ==========================================

/**
 * Rocket Launcher - High damage, large explosion radius
 */
class RocketLauncher extends Weapon {
  constructor() {
    super('Rocket Launcher', 200, 2500, 5, 3500, 12);
    this.explosionRadius = 150;
  }
  
  fire(x, y, targetX, targetY, currentTime) {
    if (!this.canFire(currentTime)) {
      return null;
    }

    this.currentAmmo--;
    this.lastFireTime = currentTime;

    // Calculate direction
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    let vx, vy;
    if (dist === 0) {
      vx = this.projectileSpeed;
      vy = 0;
    } else {
      vx = (dx / dist) * this.projectileSpeed;
      vy = (dy / dist) * this.projectileSpeed;
    }

    const projectile = new Projectile(x, y, vx, vy, this.damage, this);
    projectile.isExplosive = true;
    projectile.explosionRadius = this.explosionRadius;
    projectile.color = '#ff6600';
    projectile.width = 14;
    projectile.height = 8;
    projectile.isRocket = true;
    return projectile;
  }
}

/**
 * Molotov Cocktail - Thrown weapon with arc trajectory
 * Creates fire area on impact that deals damage over time
 */
class MolotovCocktail extends Weapon {
  constructor() {
    super('Molotov', 15, 2000, 3, 4000, 8);
    this.fireRadius = 100;
    this.fireDuration = 5000;
    this.isThrown = true;
  }
  
  fire(x, y, targetX, targetY, currentTime) {
    if (!this.canFire(currentTime)) {
      return null;
    }

    this.currentAmmo--;
    this.lastFireTime = currentTime;

    // Calculate direction with arc trajectory
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    let vx, vy;
    if (dist === 0) {
      vx = this.projectileSpeed;
      vy = -5; // Arc upward
    } else {
      vx = (dx / dist) * this.projectileSpeed;
      // Add upward arc based on distance
      vy = -Math.abs(this.projectileSpeed * 0.8);
    }

    const projectile = new Projectile(x, y, vx, vy, this.damage, this);
    projectile.isFireWeapon = true;
    projectile.fireRadius = this.fireRadius;
    projectile.fireDuration = this.fireDuration;
    projectile.affectedByGravity = true;
    projectile.color = '#ff4400';
    projectile.width = 10;
    projectile.height = 16;
    projectile.isMolotov = true;
    return projectile;
  }
}

/**
 * Mine Launcher - Deploys proximity mines
 * Mines arm after delay and explode when enemies are nearby
 */
class MineLauncher extends Weapon {
  constructor() {
    super('Mine Launcher', 100, 1500, 5, 3000, 10);
    this.explosionRadius = 80;
    this.armTime = 1000;
    this.triggerRadius = 80;
    this.maxMines = 5;
  }
  
  fire(x, y, targetX, targetY, currentTime) {
    if (!this.canFire(currentTime)) {
      return null;
    }

    this.currentAmmo--;
    this.lastFireTime = currentTime;

    // Calculate direction - mines travel slower
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    let vx, vy;
    if (dist === 0) {
      vx = this.projectileSpeed;
      vy = 0;
    } else {
      vx = (dx / dist) * this.projectileSpeed;
      vy = (dy / dist) * this.projectileSpeed;
    }

    const projectile = new Projectile(x, y, vx, vy, this.damage, this);
    projectile.isMine = true;
    projectile.armTime = this.armTime;
    projectile.deployTime = currentTime;
    projectile.triggerRadius = this.triggerRadius;
    projectile.explosionRadius = this.explosionRadius;
    projectile.isExplosive = true;
    projectile.affectedByGravity = true;
    projectile.color = '#888888';
    projectile.width = 12;
    projectile.height = 12;
    return projectile;
  }
}
