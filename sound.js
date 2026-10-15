/**
 * ============================================================================
 *  🔊 UNIVERSAL GAME SOUND FX ENGINE — Synthesizer for HTML5 Games
 * ============================================================================
 *  Supported Games: 
 *    • 🎱 3D Pool Master (8-Ball Championship, Billiards, Snooker)
 *    • 🎯 Carrom 3D & Carrom Deluxe (Tournament Board Game)
 *    • 🏒 Air Hockey, Ludo, Board Games, Arcade Games
 * 
 *  Technology: Pure Web Audio API (Zero external MP3 / WAV files required!)
 *  Features:
 *    - 100% Self-contained (Synthesized live in browser via Web Audio oscillators & filters)
 *    - Dual sound engine presets: 'pool' (resin/felt) & 'carrom' (wood/powder/rosewood)
 *    - Works completely offline with 0ms latency and zero asset 404 errors
 *    - Memory-safe, garbage-collected audio nodes
 *    - User mute preference stored in localStorage
 * 
 * ============================================================================
 *  📖 HOW TO HOST ON GITHUB & IMPORT VIA FREE CDN
 * ============================================================================
 *  1. Push this file to your GitHub repository:
 *     Example: https://github.com/USERNAME/REPO/blob/main/Blogger_game/scripts/sound.js
 * 
 *  2. Import into any HTML file or Blogger post using a free CDN:
 * 
 *     a) jsDelivr (Fastest, production CDN):
 *        <script src="https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/Blogger_game/scripts/sound.js"></script>
 * 
 *     b) Statically CDN:
 *        <script src="https://cdn.statically.io/gh/USERNAME/REPO/main/Blogger_game/scripts/sound.js"></script>
 * 
 *     c) Local project import:
 *        <script src="scripts/sound.js"></script>
 * 
 * ============================================================================
 *  🎯 CARROM SOUND API REFERENCE
 * ============================================================================
 *  sound.setTheme('carrom');       // Switch to Carrom acoustics
 * 
 *  sound.playCarromStrike(power);  // Striker flick release on wooden board (0.0 - 1.0)
 *  sound.playCarromPiece(vel);     // Wooden coin-on-coin impact ("tok" sound)
 *  sound.playCarromFrame(vel);     // Solid wooden border frame bounce
 *  sound.playCarromPocket();       // Coin dropping into woolen corner pocket net
 *  sound.playCarromSlide(dist);    // Powder gliding / sliding friction sound
 *  sound.playQueen();              // Red Queen pocketed chime
 *  sound.playQueenCover();         // Queen cover success triumphant chime
 *  sound.playPlaceStriker();       // Striker placement tap on baseline
 *  sound.playFoul();               // Striker pocketed penalty buzzer
 * 
 * ============================================================================
 *  🎱 3D POOL / BILLIARDS SOUND API REFERENCE
 * ============================================================================
 *  sound.setTheme('pool');         // Switch to Pool/Billiards acoustics (Default)
 * 
 *  sound.playStrike(power);        // Cue stick striking cue ball (0.0 - 1.0)
 *  sound.playClack(velocity);      // Hard resin ball-on-ball collision
 *  sound.playCushion(velocity);    // Rubber-and-wood cushion rail rebound
 *  sound.playPocket();             // Ball falling into drop pocket cup
 *  sound.playFoul();               // Scratch / illegal foul warning
 *  sound.playWin();                // Victory fanfare arpeggio
 *  sound.playClick();              // UI button tactile click
 * 
 * ============================================================================
 *  ⚙️ GENERAL CONTROLS
 * ============================================================================
 *  sound.ensureContext();          // Unlock audio on first user click/touch
 *  sound.toggle();                 // Toggle Mute / Unmute
 *  sound.setVolume(0.8);           // Set master volume (0.0 - 1.0)
 *  sound.onToggle(fn);             // Listen for mute state changes
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const exports = factory();
    root.SoundManager = exports.SoundManager;
    root.sound = exports.sound;
    root.GameSound = exports.sound;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  class SoundManager {
    constructor(options = {}) {
      this.ctx = null;
      this.initDone = false;
      this.masterVolume = options.volume !== undefined ? options.volume : 1.0;
      this.masterGain = null;

      // Restore user theme preference (Default: 'carrom' wood acoustics)
      let savedTheme = options.theme || 'carrom';
      try {
        const storedTheme = localStorage.getItem('spicy_games_sound_theme');
        if (storedTheme === 'pool' || storedTheme === 'carrom') savedTheme = storedTheme;
      } catch (e) {}
      this.theme = savedTheme;

      // Restore user mute preference from localStorage
      let savedState = true;
      try {
        const stored = localStorage.getItem('spicy_games_sound_enabled');
        if (stored !== null) savedState = stored === 'true';
      } catch (e) {}
      this.enabled = savedState;
      this.listeners = [];
      this.themeListeners = [];
    }

    /**
     * Switch sound acoustic theme between 'pool' and 'carrom'
     * @param {'pool'|'carrom'} themeName 
     */
    setTheme(themeName) {
      if (themeName === 'carrom' || themeName === 'pool') {
        this.theme = themeName;
        try {
          localStorage.setItem('spicy_games_sound_theme', themeName);
        } catch (e) {}
        for (const fn of this.themeListeners) {
          try { fn(this.theme); } catch (e) {}
        }
      }
      return this.theme;
    }

    /**
     * Listen for theme change events ('carrom' | 'pool')
     */
    onThemeChange(fn) {
      if (typeof fn === 'function') this.themeListeners.push(fn);
    }

    /**
     * Initialize AudioContext and Master Gain node.
     */
    init() {
      if (this.initDone && this.ctx) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
          this.masterGain.connect(this.ctx.destination);
          this.initDone = true;
        }
      } catch (e) {
        console.warn('[SoundManager] Web Audio API is not supported on this device/browser.');
      }
    }

    /**
     * Ensure audio context is running (unlock on user gesture).
     */
    ensureContext() {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    /**
     * Listen for toggle events
     */
    onToggle(fn) {
      if (typeof fn === 'function') this.listeners.push(fn);
    }

    _notify() {
      for (const fn of this.listeners) {
        try { fn(this.enabled); } catch (e) {}
      }
    }

    /**
     * Toggle Mute / Unmute
     */
    toggle() {
      this.ensureContext();
      this.enabled = !this.enabled;
      try {
        localStorage.setItem('spicy_games_sound_enabled', String(this.enabled));
      } catch (e) {}
      this._notify();
      return this.enabled;
    }

    /**
     * Set master volume (0.0 to 1.0)
     */
    setVolume(vol) {
      this.masterVolume = Math.max(0, Math.min(1, vol));
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      }
    }

    getDestination() {
      return this.masterGain || (this.ctx ? this.ctx.destination : null);
    }

    // ========================================================================
    //  🎯 DEDICATED CARROM SOUND SUITE
    // ========================================================================

    /**
     * Carrom Striker Flick:
     * Realistic finger-snap release on wooden carrom board with quick decay.
     * @param {number} power - Normalised power (0.0 - 1.0)
     */
    playCarromStrike(power = 1.0) {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;

      const p = Math.max(0.1, Math.min(1.0, power));
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Sharp finger flick attack (320Hz ramp to 80Hz)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320 * (0.8 + p * 0.5), t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);

      // Lowpass wooden resonance
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, t);
      filter.frequency.exponentialRampToValueAtTime(400, t + 0.08);

      const vol = Math.min(1.0, 0.3 + p * 0.7);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.getDestination());

      osc.start(t);
      osc.stop(t + 0.12);
    }

    /**
     * Carrom Piece Collision (Wood-on-wood "tok"):
     * Characteristic hollow wooden click of carrom pawns/coins colliding.
     * @param {number} velocity - Impact velocity
     */
    playCarromPiece(velocity = 1.0) {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = 650 + Math.random() * 300;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.04);

      const normVel = Math.min(1.0, Math.max(0.1, velocity / 14));
      gain.gain.setValueAtTime(normVel * 0.8, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.getDestination());

      osc.start(t);
      osc.stop(t + 0.05);
    }

    /**
     * Carrom Frame / Wooden Border Rebound:
     * Hard wooden frame bounce against the thick rosewood border.
     * @param {number} velocity - Speed of border collision
     */
    playCarromFrame(velocity = 1.0) {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.07);

      const normVel = Math.min(1.0, Math.max(0.1, velocity / 12));
      gain.gain.setValueAtTime(normVel * 0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.getDestination());

      osc.start(t);
      osc.stop(t + 0.08);
    }

    /**
     * Carrom Pocket Sink:
     * Coin dropping into the woven corner pocket net.
     */
    playCarromPocket() {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.15);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(this.getDestination());

      osc.start(t);
      osc.stop(t + 0.2);
    }

    /**
     * Carrom Board Powder Sliding Friction:
     * Synthesized powder gliding noise ("shhhhhk") as pieces slide on board.
     * @param {number} intensity - 0.0 to 1.0
     */
    playCarromSlide(intensity = 0.5) {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;

      const dur = 0.12;
      const t = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * dur);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);

      // Filtered white noise with random powder texture
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, t);
      filter.Q.setValueAtTime(2.5, t);

      const gain = this.ctx.createGain();
      const vol = Math.min(0.25, Math.max(0.04, intensity * 0.25));
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.getDestination());

      whiteNoise.start(t);
      whiteNoise.stop(t + dur);
    }

    /**
     * Queen Cover Chime:
     * Bright celebratory 4-note ascending chord for pocketing or covering the Queen.
     */
    playQueenCover() {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const t = this.ctx.currentTime + idx * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc.connect(gain);
        gain.connect(this.getDestination());

        osc.start(t);
        osc.stop(t + 0.4);
      });
    }

    /**
     * Striker Placement Tap:
     * Gentle wooden click when placing the striker on the baseline.
     */
    playPlaceStriker() {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.04);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

      osc.connect(gain);
      gain.connect(this.getDestination());

      osc.start(t);
      osc.stop(t + 0.045);
    }

    // ========================================================================
    //  🎱 3D POOL / BILLIARDS SPECIFIC METHODS
    // ========================================================================

    playPoolStrike(power = 1.0) {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;

      const p = Math.max(0.1, Math.min(1.0, power));
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(340 * (0.8 + p * 0.5), t);
      osc.frequency.exponentialRampToValueAtTime(75, t + 0.09);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2600, t);
      filter.frequency.exponentialRampToValueAtTime(380, t + 0.09);

      const vol = Math.min(1.0, 0.35 + p * 0.65);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.getDestination());

      osc.start(t);
      osc.stop(t + 0.13);
    }

    playPoolClack(velocity = 1.0) {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = 720 + Math.random() * 260;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(130, t + 0.045);

      const normVel = Math.min(1.0, Math.max(0.12, velocity / 12));
      gain.gain.setValueAtTime(normVel * 0.85, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.getDestination());

      osc.start(t);
      osc.stop(t + 0.05);
    }

    playPoolCushion(velocity = 1.0) {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(190, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.07);

      const normVel = Math.min(1.0, Math.max(0.1, velocity / 10));
      gain.gain.setValueAtTime(normVel * 0.55, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.getDestination());

      osc.start(t);
      osc.stop(t + 0.08);
    }

    playPoolPocket() {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(460, t);
      osc.frequency.exponentialRampToValueAtTime(160, t + 0.18);

      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.getDestination());

      osc.start(t);
      osc.stop(t + 0.22);
    }

    // ========================================================================
    //  ⚡ ADAPTIVE UNIVERSAL API (Auto-adapts between Pool and Carrom)
    // ========================================================================

    /**
     * Primary Strike (Auto-selects Carrom flick or Pool cue strike)
     */
    playStrike(power = 1.0) {
      if (this.theme === 'carrom') {
        this.playCarromStrike(power);
      } else {
        this.playPoolStrike(power);
      }
    }

    /**
     * Primary Impact Clack (Auto-selects Carrom wood or Pool resin clack)
     */
    playClack(velocity = 1.0) {
      if (this.theme === 'carrom') {
        this.playCarromPiece(velocity);
      } else {
        this.playPoolClack(velocity);
      }
    }

    /**
     * Cushion / Border Rebound
     */
    playCushion(velocity = 1.0) {
      if (this.theme === 'carrom') {
        this.playCarromFrame(velocity);
      } else {
        this.playPoolCushion(velocity);
      }
    }

    /**
     * Pocket Drop
     */
    playPocket() {
      if (this.theme === 'carrom') {
        this.playCarromPocket();
      } else {
        this.playPoolPocket();
      }
    }

    /**
     * Queen / Royal bonus chime
     */
    playQueen() {
      this.playQueenCover();
    }

    /**
     * Foul / Penalty Warning Buzzer
     */
    playFoul() {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.setValueAtTime(105, t + 0.1);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

      osc.connect(gain);
      gain.connect(this.getDestination());

      osc.start(t);
      osc.stop(t + 0.32);
    }

    /**
     * Victory Fanfare Arpeggio
     */
    playWin() {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const t = this.ctx.currentTime + idx * 0.09;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

        osc.connect(gain);
        gain.connect(this.getDestination());

        osc.start(t);
        osc.stop(t + 0.45);
      });
    }

    /**
     * UI Click Feedback
     */
    playClick() {
      if (!this.enabled) return;
      this.ensureContext();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.03);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

      osc.connect(gain);
      gain.connect(this.getDestination());

      osc.start(t);
      osc.stop(t + 0.03);
    }
  }

  // Create default singleton instance
  const sound = new SoundManager();

  return {
    SoundManager,
    sound
  };
}));
