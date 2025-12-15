// A singleton class to manage procedural audio without external assets
export class AudioEngine {
  ctx: AudioContext | null = null;
  droneOsc: OscillatorNode | null = null;
  droneGain: GainNode | null = null;
  lfo: OscillatorNode | null = null;
  masterGain: GainNode | null = null;
  
  isInitialized = false;

  init() {
    if (this.isInitialized) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    this.isInitialized = true;
  }

  startDrone() {
    if (!this.ctx || !this.masterGain) return;

    // Deep low drone
    this.droneOsc = this.ctx.createOscillator();
    this.droneOsc.type = 'sawtooth';
    this.droneOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // A1

    // Filter for the drone to make it "dark"
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, this.ctx.currentTime);

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0, this.ctx.currentTime);

    // LFO for "breathing" unease
    this.lfo = this.ctx.createOscillator();
    this.lfo.frequency.value = 0.1; // Slow pulse
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 20; // Modulate filter frequency

    this.lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    
    this.droneOsc.connect(filter);
    filter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    this.droneOsc.start();
    this.lfo.start();
    
    // Fade in
    this.droneGain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 3);
  }

  setDroneIntensity(intensity: number) {
    if (this.droneGain && this.ctx && this.droneOsc) {
      // Modulate volume and pitch slightly based on "red infection" intensity
      const vol = 0.1 + (intensity * 0.2);
      this.droneGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.5);
      
      const freq = 55 + (intensity * 10); // Slight pitch bend up creates tension
      this.droneOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.5);
    }
  }

  triggerBell() {
    if (!this.ctx || !this.masterGain) return;
    
    // Create a metallic bell grain
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    // Random high pitch
    const freq = 800 + Math.random() * 1200;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 2.5);
  }

  stopAll() {
    if (this.ctx) {
      this.droneOsc?.stop();
      this.lfo?.stop();
      this.isInitialized = false;
    }
  }
}

export const audioManager = new AudioEngine();