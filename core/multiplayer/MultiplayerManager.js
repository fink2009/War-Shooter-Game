// Multiplayer Manager - WebRTC-based peer-to-peer multiplayer
class MultiplayerManager {
  constructor() {
    this.isHost = false;
    this.isConnected = false;
    this.roomCode = null;
    this.localPlayerId = null;
    this.remotePlayers = new Map();
    
    // Connection state
    this.connectionState = 'disconnected'; // disconnected, connecting, connected
    this.peerConnection = null;
    this.dataChannel = null;
    
    // Game state
    this.gameMode = 'coop'; // coop, versus, survival
    this.syncRate = 60; // ms between sync updates
    this.lastSyncTime = 0;
    
    // Network stats
    this.latency = 0;
    this.lastPingTime = 0;
    this.pingInterval = null;
    
    // Message handlers
    this.messageHandlers = new Map();
    this.setupMessageHandlers();
    
    // STUN servers for NAT traversal
    this.iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ];
  }

  /**
   * Generate a random 6-digit room code
   * @returns {string} Room code
   */
  generateRoomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Setup message handlers for different message types
   */
  setupMessageHandlers() {
    // Player state sync
    this.messageHandlers.set('playerState', (data) => this.handlePlayerState(data));
    
    // Enemy sync
    this.messageHandlers.set('enemyState', (data) => this.handleEnemyState(data));
    
    // Projectile sync
    this.messageHandlers.set('projectile', (data) => this.handleProjectile(data));
    
    // Game events
    this.messageHandlers.set('gameEvent', (data) => this.handleGameEvent(data));
    
    // Ping/pong for latency
    this.messageHandlers.set('ping', (data) => this.handlePing(data));
    this.messageHandlers.set('pong', (data) => this.handlePong(data));
    
    // Chat messages
    this.messageHandlers.set('chat', (data) => this.handleChat(data));
    
    // Ready state
    this.messageHandlers.set('ready', (data) => this.handleReady(data));
    
    // Game start
    this.messageHandlers.set('gameStart', (data) => this.handleGameStart(data));
  }

  /**
   * Create a new room as host
   * @returns {Promise<string>} Room code
   */
  async createRoom() {
    this.isHost = true;
    this.roomCode = this.generateRoomCode();
    this.localPlayerId = 'host';
    this.connectionState = 'waiting';
    
    // Create peer connection
    await this.setupPeerConnection();
    
    // Create data channel
    this.dataChannel = this.peerConnection.createDataChannel('game', {
      ordered: false, // Allow out-of-order for lower latency
      maxRetransmits: 0 // Unreliable for real-time data
    });
    
    this.setupDataChannelHandlers();
    
    // Create offer
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    
    // Debug info available through getConnectionInfo() method
    
    return this.roomCode;
  }

  /**
   * Join an existing room
   * @param {string} roomCode - Room code to join
   * @param {Object} hostOffer - Host's WebRTC offer (as JSON)
   * @returns {Promise<void>}
   */
  async joinRoom(roomCode, hostOffer) {
    this.isHost = false;
    this.roomCode = roomCode;
    this.localPlayerId = 'client';
    this.connectionState = 'connecting';
    
    // Create peer connection
    await this.setupPeerConnection();
    
    // Handle incoming data channel
    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannelHandlers();
    };
    
    // Set remote description (host's offer)
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(hostOffer));
    
    // Create answer
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    
    // Answer available through peerConnection.localDescription
  }

  /**
   * Complete connection with answer (for host)
   * @param {Object} clientAnswer - Client's WebRTC answer
   */
  async acceptAnswer(clientAnswer) {
    if (!this.isHost) return;
    
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(clientAnswer));
    this.connectionState = 'establishing';
  }

  /**
   * Setup WebRTC peer connection
   */
  async setupPeerConnection() {
    this.peerConnection = new RTCPeerConnection({
      iceServers: this.iceServers
    });
    
    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Store ICE candidate for signaling (would be sent via signaling server in production)
        this.lastIceCandidate = event.candidate;
      }
    };
    
    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection.connectionState === 'connected') {
        this.connectionState = 'connected';
        this.isConnected = true;
        this.startPingLoop();
      } else if (this.peerConnection.connectionState === 'disconnected' || 
                 this.peerConnection.connectionState === 'failed') {
        this.handleDisconnect();
      }
    };
    
    // Handle ICE connection state
    this.peerConnection.oniceconnectionstatechange = () => {
      // Connection state tracked through connectionState property
    };
  }

  /**
   * Setup data channel event handlers
   */
  setupDataChannelHandlers() {
    this.dataChannel.onopen = () => {
      this.connectionState = 'connected';
      this.isConnected = true;
    };
    
    this.dataChannel.onclose = () => {
      this.handleDisconnect();
    };
    
    this.dataChannel.onerror = () => {
      // Error handling - consider retry logic
      this.handleDisconnect();
    };
    
    this.dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (e) {
        // Silently ignore malformed messages
      }
    };
  }

  /**
   * Handle incoming message
   * @param {Object} message - Message object
   */
  handleMessage(message) {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message.data);
    } else {
      console.warn('Unknown message type:', message.type);
    }
  }

  /**
   * Send message to peer
   * @param {string} type - Message type
   * @param {Object} data - Message data
   */
  send(type, data) {
    if (!this.isConnected || !this.dataChannel) return;
    
    try {
      this.dataChannel.send(JSON.stringify({ type, data }));
    } catch (e) {
      console.error('Failed to send message:', e);
    }
  }

  /**
   * Handle player state update
   * @param {Object} data - Player state data
   */
  handlePlayerState(data) {
    // Update remote player position and state
    const playerId = data.id;
    let remotePlayer = this.remotePlayers.get(playerId);
    
    if (!remotePlayer) {
      // Create new remote player
      remotePlayer = {
        id: playerId,
        x: data.x,
        y: data.y,
        health: data.health,
        facing: data.facing,
        state: data.state
      };
      this.remotePlayers.set(playerId, remotePlayer);
    } else {
      // Update existing player
      remotePlayer.x = data.x;
      remotePlayer.y = data.y;
      remotePlayer.health = data.health;
      remotePlayer.facing = data.facing;
      remotePlayer.state = data.state;
    }
  }

  /**
   * Handle enemy state update (host authoritative)
   * @param {Object} data - Enemy state data
   */
  handleEnemyState(data) {
    if (this.isHost) return; // Host doesn't receive enemy updates
    
    // Update local enemy states from host
    if (window.game) {
      // Find matching enemy and update
      const enemy = window.game.enemies.find(e => e.id === data.id);
      if (enemy) {
        enemy.x = data.x;
        enemy.y = data.y;
        enemy.health = data.health;
        enemy.aiState = data.aiState;
      }
    }
  }

  /**
   * Handle projectile creation
   * @param {Object} data - Projectile data
   */
  handleProjectile(data) {
    if (window.game) {
      const projectile = new Projectile(
        data.x, data.y,
        data.dx, data.dy,
        data.damage,
        null
      );
      projectile.isRemote = true;
      projectile.ownerId = data.ownerId;
      window.game.projectiles.push(projectile);
    }
  }

  /**
   * Handle game events (kills, pickups, etc.)
   * @param {Object} data - Event data
   */
  handleGameEvent(data) {
    switch (data.event) {
      case 'kill':
        // Remote player got a kill
        if (window.game && this.gameMode === 'coop') {
          window.game.score += 100;
          window.game.kills++;
        }
        break;
        
      case 'pickup':
        // Remote player picked up item
        if (window.game) {
          const pickup = window.game.pickups.find(p => p.id === data.pickupId);
          if (pickup) {
            pickup.destroy();
          }
        }
        break;
        
      case 'playerDeath':
        // Remote player died
        const remotePlayer = this.remotePlayers.get(data.playerId);
        if (remotePlayer) {
          remotePlayer.health = 0;
          remotePlayer.state = 'dead';
        }
        break;
        
      case 'revive':
        // Player revived
        const revivedPlayer = this.remotePlayers.get(data.playerId);
        if (revivedPlayer) {
          revivedPlayer.health = data.health;
          revivedPlayer.state = 'alive';
        }
        break;
    }
  }

  /**
   * Handle ping message
   * @param {Object} data - Ping data
   */
  handlePing(data) {
    this.send('pong', { timestamp: data.timestamp });
  }

  /**
   * Handle pong message
   * @param {Object} data - Pong data
   */
  handlePong(data) {
    this.latency = Date.now() - data.timestamp;
  }

  /**
   * Handle chat message
   * @param {Object} data - Chat data
   */
  handleChat(data) {
    // Store chat message for UI display
    if (!this.chatMessages) {
      this.chatMessages = [];
    }
    this.chatMessages.push({
      sender: data.sender,
      message: data.message,
      timestamp: Date.now()
    });
    // Keep only last 50 messages
    if (this.chatMessages.length > 50) {
      this.chatMessages.shift();
    }
  }

  /**
   * Handle ready state
   * @param {Object} data - Ready data
   */
  handleReady(data) {
    const player = this.remotePlayers.get(data.playerId);
    if (player) {
      player.ready = data.ready;
    }
    // Check if all players ready
    this.checkAllReady();
  }

  /**
   * Handle game start
   * @param {Object} data - Game start data
   */
  handleGameStart(data) {
    if (window.game) {
      window.game.startMultiplayerGame(data.mode, data.character);
    }
  }

  /**
   * Check if all players are ready
   */
  checkAllReady() {
    // Implementation for lobby ready check
  }

  /**
   * Send player state update
   * @param {Object} player - Local player
   */
  syncPlayerState(player) {
    if (!this.isConnected) return;
    
    const now = Date.now();
    if (now - this.lastSyncTime < this.syncRate) return;
    this.lastSyncTime = now;
    
    this.send('playerState', {
      id: this.localPlayerId,
      x: player.x,
      y: player.y,
      health: player.health,
      facing: player.facing,
      state: player.state
    });
  }

  /**
   * Send enemy states (host only)
   * @param {Array} enemies - Enemies array
   */
  syncEnemyStates(enemies) {
    if (!this.isHost || !this.isConnected) return;
    
    enemies.forEach((enemy, index) => {
      if (enemy.active) {
        this.send('enemyState', {
          id: index,
          x: enemy.x,
          y: enemy.y,
          health: enemy.health,
          aiState: enemy.aiState
        });
      }
    });
  }

  /**
   * Send projectile creation
   * @param {Object} projectile - Projectile
   */
  syncProjectile(projectile) {
    if (!this.isConnected) return;
    
    this.send('projectile', {
      x: projectile.x,
      y: projectile.y,
      dx: projectile.dx,
      dy: projectile.dy,
      damage: projectile.damage,
      ownerId: this.localPlayerId
    });
  }

  /**
   * Send game event
   * @param {string} event - Event type
   * @param {Object} data - Event data
   */
  sendGameEvent(event, data = {}) {
    if (!this.isConnected) return;
    
    this.send('gameEvent', { event, ...data });
  }

  /**
   * Send chat message
   * @param {string} message - Chat message
   */
  sendChat(message) {
    if (!this.isConnected) return;
    
    this.send('chat', {
      sender: this.localPlayerId,
      message: message
    });
  }

  /**
   * Set ready state
   * @param {boolean} ready - Ready state
   */
  setReady(ready) {
    if (!this.isConnected) return;
    
    this.send('ready', {
      playerId: this.localPlayerId,
      ready: ready
    });
  }

  /**
   * Start ping loop for latency measurement
   */
  startPingLoop() {
    this.pingInterval = setInterval(() => {
      this.send('ping', { timestamp: Date.now() });
    }, 1000);
  }

  /**
   * Handle disconnection
   */
  handleDisconnect() {
    this.isConnected = false;
    this.connectionState = 'disconnected';
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    // Attempt reconnection
    this.attemptReconnect();
  }

  /**
   * Attempt to reconnect
   */
  attemptReconnect() {
    // Simple reconnection logic - could implement exponential backoff
    this.reconnectAttempts = (this.reconnectAttempts || 0) + 1;
    if (this.reconnectAttempts < 3) {
      // In a real implementation, this would retry the connection
      this.connectionState = 'reconnecting';
    }
  }

  /**
   * Disconnect and cleanup
   */
  disconnect() {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    this.isConnected = false;
    this.connectionState = 'disconnected';
    this.remotePlayers.clear();
  }

  /**
   * Get connection info for UI
   * @returns {Object} Connection info
   */
  getConnectionInfo() {
    return {
      isHost: this.isHost,
      isConnected: this.isConnected,
      roomCode: this.roomCode,
      latency: this.latency,
      playerCount: this.remotePlayers.size + 1,
      connectionState: this.connectionState
    };
  }

  /**
   * Update multiplayer state
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    if (!this.isConnected) return;
    
    // Sync local player state
    if (window.game && window.game.player) {
      this.syncPlayerState(window.game.player);
    }
    
    // Host syncs enemy states
    if (this.isHost && window.game && window.game.enemies) {
      this.syncEnemyStates(window.game.enemies);
    }
  }

  /**
   * Render remote players
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderRemotePlayers(ctx) {
    this.remotePlayers.forEach((player, id) => {
      if (player.state === 'dead') return;
      
      // Draw remote player (simplified)
      ctx.fillStyle = 'rgba(0, 200, 255, 0.8)';
      ctx.fillRect(player.x, player.y, 30, 50);
      
      // Health bar
      const healthPercent = player.health / 100;
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(player.x, player.y - 10, 30 * healthPercent, 5);
      
      // Player label
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.fillText(id.toUpperCase(), player.x, player.y - 15);
    });
  }

  /**
   * Render connection status
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  renderConnectionStatus(ctx) {
    const x = 10;
    const y = 100;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y, 150, 60);
    
    // Status text
    ctx.fillStyle = this.isConnected ? '#00ff00' : '#ff0000';
    ctx.font = '12px monospace';
    ctx.fillText(`Status: ${this.connectionState}`, x + 5, y + 15);
    ctx.fillText(`Latency: ${this.latency}ms`, x + 5, y + 30);
    ctx.fillText(`Players: ${this.remotePlayers.size + 1}`, x + 5, y + 45);
    
    if (this.roomCode) {
      ctx.fillText(`Room: ${this.roomCode}`, x + 5, y + 55);
    }
  }
}
