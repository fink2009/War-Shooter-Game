// Subtitle Renderer - Displays dialogue and character names during cutscenes
class SubtitleRenderer {
  constructor(canvasWidth, canvasHeight) {
    // Canvas dimensions
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    
    // Current dialogue state
    this.speaker = '';
    this.text = '';
    this.duration = 0;
    this.elapsed = 0;
    this.isActive = false;
    
    // Animation state
    this.opacity = 0;
    this.fadeInDuration = 200; // ms
    this.fadeOutDuration = 300; // ms
    this.state = 'idle'; // idle, fading_in, visible, fading_out
    
    // Text reveal (typewriter effect)
    this.revealedChars = 0;
    this.charsPerSecond = 60;
    this.useTypewriter = true;
    
    // Styling
    this.speakerFont = 'bold 18px monospace';
    this.textFont = '20px monospace';
    this.speakerColor = '#ffaa00';
    this.textColor = '#ffffff';
    this.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    this.padding = 20;
    this.lineHeight = 30;
    this.maxWidth = 800;
    this.bottomMargin = 80;
    
    // Word wrap cache
    this.wrappedLines = [];
    
    // Cursor blink state
    this.cursorBlinkTime = 0;
    this.cursorVisible = true;
    
    // Reusable canvas for text measurement
    this.measureCanvas = document.createElement('canvas');
    this.measureCtx = this.measureCanvas.getContext('2d');
  }
  }

  /**
   * Show a dialogue line
   * @param {string} speaker - Character name
   * @param {string} text - Dialogue text
   * @param {number} duration - Duration to show in ms
   */
  showDialogue(speaker, text, duration) {
    this.speaker = speaker;
    this.text = text;
    this.duration = duration;
    this.elapsed = 0;
    this.isActive = true;
    this.state = 'fading_in';
    this.opacity = 0;
    this.revealedChars = 0;
    
    // Pre-calculate wrapped lines
    this.wrappedLines = this.wrapText(text);
  }

  /**
   * Clear current dialogue
   */
  clear() {
    if (this.state === 'visible' || this.state === 'fading_in') {
      this.state = 'fading_out';
    } else {
      this.isActive = false;
      this.state = 'idle';
      this.opacity = 0;
      this.speaker = '';
      this.text = '';
      this.wrappedLines = [];
    }
  }

  /**
   * Force immediate clear without fade
   */
  forceClear() {
    this.isActive = false;
    this.state = 'idle';
    this.opacity = 0;
    this.speaker = '';
    this.text = '';
    this.wrappedLines = [];
    this.elapsed = 0;
    this.revealedChars = 0;
  }

  /**
   * Word wrap text to fit within max width
   * @param {string} text - Text to wrap
   * @returns {string[]} Array of lines
   */
  wrapText(text) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    // Use cached canvas context for measuring
    this.measureCtx.font = this.textFont;
    
    for (const word of words) {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      const metrics = this.measureCtx.measureText(testLine);
      
      if (metrics.width > this.maxWidth - this.padding * 2) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Word itself is too long, force break
          lines.push(word);
          currentLine = '';
        }
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }

  /**
   * Update subtitle state
   * @param {number} deltaTime - Time since last frame in ms
   */
  update(deltaTime) {
    if (!this.isActive) return;
    
    this.elapsed += deltaTime;
    
    // Update cursor blink timer
    this.cursorBlinkTime += deltaTime;
    if (this.cursorBlinkTime >= 500) {
      this.cursorVisible = !this.cursorVisible;
      this.cursorBlinkTime = 0;
    }
    
    // Update state machine
    switch (this.state) {
      case 'fading_in':
        this.opacity = Math.min(1, this.elapsed / this.fadeInDuration);
        if (this.elapsed >= this.fadeInDuration) {
          this.state = 'visible';
          this.elapsed = 0;
        }
        break;
        
      case 'visible':
        this.opacity = 1;
        
        // Update typewriter effect
        if (this.useTypewriter) {
          const targetChars = Math.floor(this.elapsed / 1000 * this.charsPerSecond);
          this.revealedChars = Math.min(targetChars, this.text.length);
        } else {
          this.revealedChars = this.text.length;
        }
        
        // Check if duration exceeded
        if (this.elapsed >= this.duration - this.fadeOutDuration) {
          this.state = 'fading_out';
          this.elapsed = 0;
        }
        break;
        
      case 'fading_out':
        this.opacity = Math.max(0, 1 - (this.elapsed / this.fadeOutDuration));
        if (this.elapsed >= this.fadeOutDuration) {
          this.isActive = false;
          this.state = 'idle';
          this.speaker = '';
          this.text = '';
          this.wrappedLines = [];
        }
        break;
    }
  }

  /**
   * Render subtitles to canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  render(ctx) {
    if (!this.isActive || this.opacity <= 0) return;
    
    ctx.save();
    ctx.globalAlpha = this.opacity;
    
    // Calculate dimensions
    const boxHeight = this.calculateBoxHeight();
    const boxY = this.canvasHeight - this.bottomMargin - boxHeight;
    const boxX = (this.canvasWidth - this.maxWidth) / 2;
    
    // Draw background box
    this.drawBackground(ctx, boxX, boxY, this.maxWidth, boxHeight);
    
    // Draw speaker name
    this.drawSpeaker(ctx, boxX + this.padding, boxY + this.padding + 18);
    
    // Draw dialogue text
    this.drawText(ctx, boxX + this.padding, boxY + this.padding + 18 + this.lineHeight);
    
    ctx.restore();
  }

  /**
   * Calculate the height of the subtitle box
   * @returns {number} Box height in pixels
   */
  calculateBoxHeight() {
    const speakerHeight = this.speaker ? this.lineHeight : 0;
    const textHeight = this.wrappedLines.length * this.lineHeight;
    return this.padding * 2 + speakerHeight + textHeight;
  }

  /**
   * Draw the subtitle background
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Box width
   * @param {number} height - Box height
   */
  drawBackground(ctx, x, y, width, height) {
    // Main background
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(x, y, width, height);
    
    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Inner glow effect
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 2, y + 2, width - 4, height - 4);
  }

  /**
   * Draw the speaker name
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  drawSpeaker(ctx, x, y) {
    if (!this.speaker) return;
    
    ctx.font = this.speakerFont;
    ctx.fillStyle = this.speakerColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // Draw with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.fillText(this.speaker + ':', x, y);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  /**
   * Draw the dialogue text
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  drawText(ctx, x, y) {
    ctx.font = this.textFont;
    ctx.fillStyle = this.textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // Draw with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    // Get revealed text
    let revealedText = this.text.substring(0, this.revealedChars);
    
    // Draw each line
    let charCount = 0;
    for (let i = 0; i < this.wrappedLines.length; i++) {
      const line = this.wrappedLines[i];
      const lineStart = charCount;
      const lineEnd = charCount + line.length;
      
      // Calculate how much of this line to show
      if (this.revealedChars >= lineEnd) {
        // Show full line
        ctx.fillText(line, x, y + i * this.lineHeight);
      } else if (this.revealedChars > lineStart) {
        // Show partial line
        const charsToShow = this.revealedChars - lineStart;
        ctx.fillText(line.substring(0, charsToShow), x, y + i * this.lineHeight);
        
        // Draw cursor using cached blink state
        const partialWidth = ctx.measureText(line.substring(0, charsToShow)).width;
        if (this.cursorVisible) {
          ctx.fillStyle = this.speakerColor;
          ctx.fillText('_', x + partialWidth, y + i * this.lineHeight);
          ctx.fillStyle = this.textColor;
        }
      }
      
      // Account for space between words
      charCount = lineEnd + 1;
    }
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  /**
   * Set the typewriter effect speed
   * @param {number} charsPerSecond - Characters revealed per second
   */
  setTypewriterSpeed(charsPerSecond) {
    this.charsPerSecond = charsPerSecond;
  }

  /**
   * Enable or disable typewriter effect
   * @param {boolean} enabled - Whether to use typewriter effect
   */
  setTypewriterEnabled(enabled) {
    this.useTypewriter = enabled;
  }

  /**
   * Set subtitle styling
   * @param {Object} style - Style configuration
   */
  setStyle(style) {
    if (style.speakerFont) this.speakerFont = style.speakerFont;
    if (style.textFont) this.textFont = style.textFont;
    if (style.speakerColor) this.speakerColor = style.speakerColor;
    if (style.textColor) this.textColor = style.textColor;
    if (style.backgroundColor) this.backgroundColor = style.backgroundColor;
    if (style.padding) this.padding = style.padding;
    if (style.lineHeight) this.lineHeight = style.lineHeight;
    if (style.maxWidth) this.maxWidth = style.maxWidth;
    if (style.bottomMargin) this.bottomMargin = style.bottomMargin;
  }

  /**
   * Check if subtitles are currently showing
   * @returns {boolean} True if active
   */
  isShowing() {
    return this.isActive;
  }

  /**
   * Get current subtitle state
   * @returns {string} Current state
   */
  getState() {
    return this.state;
  }
}
