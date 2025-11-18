
// Simple Synthesizer for Retro Game Audio
// Uses Web Audio API to generate sounds without external assets

class AudioController {
  private ctx: AudioContext | null = null;
  private bgmOscillators: OscillatorNode[] = [];
  private bgmGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private tempo: number = 0.15; // Seconds per note
  private noteIndex: number = 0;
  private nextNoteTime: number = 0;
  private timerID: number | null = null;

  // Simple melody: C, E, G, A, G, E, C, G (Low)
  private melody = [
    523.25, // C5
    659.25, // E5
    783.99, // G5
    880.00, // A5
    783.99, // G5
    659.25, // E5
    523.25, // C5
    392.00, // G4
  ];

  constructor() {
    // Context is initialized lazily on first interaction
  }

  private init() {
    if (!this.ctx) {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
    } else {
      if (this.isMusicPlaying) this.startMusic();
    }
    return this.isMuted;
  }

  // --- SFX ---

  public playJump() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    
    // Pitch sweep up
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(600, now + 0.1);

    // Volume envelope
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playScore() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'square';
    const now = this.ctx.currentTime;

    // Coin sound (two tones)
    osc.frequency.setValueAtTime(1046.50, now); // C6
    osc.frequency.setValueAtTime(1318.51, now + 0.1); // E6

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.setValueAtTime(0.1, now + 0.1);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.3);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playDie() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sawtooth';
    const now = this.ctx.currentTime;

    // Crash noise simulation (rapid freq drop)
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  // --- Music Loop ---

  private scheduleNote() {
    if (!this.ctx || this.isMuted || !this.isMusicPlaying) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'triangle';
    
    const freq = this.melody[this.noteIndex];
    const duration = this.tempo;
    const startTime = this.nextNoteTime;

    osc.frequency.value = freq;

    // Staccato envelope
    gain.gain.setValueAtTime(0.05, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration - 0.05);

    osc.start(startTime);
    osc.stop(startTime + duration);

    this.nextNoteTime += duration;
    this.noteIndex = (this.noteIndex + 1) % this.melody.length;
  }

  private scheduler() {
    if (!this.ctx || !this.isMusicPlaying) return;
    
    // While there are notes that will play within 0.1 seconds, schedule them
    while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
      this.scheduleNote();
    }
    
    this.timerID = window.setTimeout(() => this.scheduler(), 25);
  }

  public startMusic() {
    if (this.isMuted) return;
    this.init();
    if (this.isMusicPlaying) return;

    this.isMusicPlaying = true;
    this.noteIndex = 0;
    if (this.ctx) {
        this.nextNoteTime = this.ctx.currentTime + 0.1;
    }
    this.scheduler();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.timerID) clearTimeout(this.timerID);
  }
}

export const audioService = new AudioController();
