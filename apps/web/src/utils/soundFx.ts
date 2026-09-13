// Sci-Fi Web Audio API Synthesizer (Zero external dependencies, 100% offline, zero latency)

class SoundFXEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Helper to create saturation/distortion curve for explosive crunch
  private makeDistortionCurve(amount = 25): Float32Array {
    const k = typeof amount === 'number' ? amount : 25;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  // Realistic Cinematic Bomb Blast / Explosion ('BOOM!')
  public playBombBlast(): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(1.0, now);
      masterGain.connect(ctx.destination);

      // --- 1. DETONATION CRACK & SHOCKWAVE TRANSIENT (Instant high-pressure crack) ---
      const crackBufferSize = Math.floor(ctx.sampleRate * 0.08);
      const crackBuffer = ctx.createBuffer(1, crackBufferSize, ctx.sampleRate);
      const crackData = crackBuffer.getChannelData(0);
      for (let i = 0; i < crackBufferSize; i++) {
        crackData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.015));
      }
      const crackSource = ctx.createBufferSource();
      crackSource.buffer = crackBuffer;

      const crackFilter = ctx.createBiquadFilter();
      crackFilter.type = 'highpass';
      crackFilter.frequency.setValueAtTime(800, now);

      const crackGain = ctx.createGain();
      crackGain.gain.setValueAtTime(0.9, now);
      crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      crackSource.connect(crackFilter);
      crackFilter.connect(crackGain);
      crackGain.connect(masterGain);
      crackSource.start(now);
      crackSource.stop(now + 0.08);

      // --- 2. MASSIVE LOW-END SHOCKWAVE DETONATION (Sub-bass drop + distortion crunch) ---
      const subOsc = ctx.createOscillator();
      const subSaw = ctx.createOscillator();
      const subMixGain = ctx.createGain();
      const subDistortion = ctx.createWaveShaper();
      const subFilter = ctx.createBiquadFilter();
      const subGain = ctx.createGain();

      subDistortion.curve = this.makeDistortionCurve(35) as any;
      subDistortion.oversample = '4x';

      // Pitch sweep: massive initial drop from 240Hz down to 32Hz
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(260, now);
      subOsc.frequency.exponentialRampToValueAtTime(55, now + 0.12);
      subOsc.frequency.exponentialRampToValueAtTime(25, now + 1.8);

      subSaw.type = 'sawtooth';
      subSaw.frequency.setValueAtTime(190, now);
      subSaw.frequency.exponentialRampToValueAtTime(45, now + 0.18);
      subSaw.frequency.exponentialRampToValueAtTime(22, now + 1.6);

      // Filter sub frequencies
      subFilter.type = 'lowpass';
      subFilter.frequency.setValueAtTime(450, now);
      subFilter.frequency.exponentialRampToValueAtTime(80, now + 0.8);
      subFilter.Q.setValueAtTime(4.0, now);

      subGain.gain.setValueAtTime(1.0, now);
      subGain.gain.setValueAtTime(0.95, now + 0.05);
      subGain.gain.exponentialRampToValueAtTime(0.3, now + 0.6);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

      subOsc.connect(subMixGain);
      subSaw.connect(subMixGain);
      subMixGain.connect(subDistortion);
      subDistortion.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(masterGain);

      subOsc.start(now);
      subSaw.start(now);
      subOsc.stop(now + 2.2);
      subSaw.stop(now + 2.2);

      // --- 3. ROARING FIREBALL & DEBRIS BLAST CLOUD (Expanding gas noise roar) ---
      const blastBufferSize = Math.floor(ctx.sampleRate * 2.4);
      const blastBuffer = ctx.createBuffer(1, blastBufferSize, ctx.sampleRate);
      const blastData = blastBuffer.getChannelData(0);
      for (let i = 0; i < blastBufferSize; i++) {
        blastData[i] = Math.random() * 2 - 1;
      }
      const blastSource = ctx.createBufferSource();
      blastSource.buffer = blastBuffer;

      const blastLowpass = ctx.createBiquadFilter();
      blastLowpass.type = 'lowpass';
      blastLowpass.frequency.setValueAtTime(2800, now);
      blastLowpass.frequency.exponentialRampToValueAtTime(320, now + 0.35);
      blastLowpass.frequency.exponentialRampToValueAtTime(75, now + 2.0);
      blastLowpass.Q.setValueAtTime(2.5, now);

      const blastBandpass = ctx.createBiquadFilter();
      blastBandpass.type = 'bandpass';
      blastBandpass.frequency.setValueAtTime(500, now);
      blastBandpass.frequency.exponentialRampToValueAtTime(110, now + 1.2);
      blastBandpass.Q.setValueAtTime(1.8, now);

      const blastGain = ctx.createGain();
      blastGain.gain.setValueAtTime(0.85, now);
      blastGain.gain.exponentialRampToValueAtTime(0.45, now + 0.3);
      blastGain.gain.exponentialRampToValueAtTime(0.15, now + 1.1);
      blastGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

      blastSource.connect(blastLowpass);
      blastLowpass.connect(blastBandpass);
      blastBandpass.connect(blastGain);
      blastGain.connect(masterGain);

      blastSource.start(now);
      blastSource.stop(now + 2.4);

      // --- 4. DEEP INFRASOUND AFTERSHOCK RUMBLE (Distanced environmental reverb) ---
      const rumbleOsc = ctx.createOscillator();
      const rumbleGain = ctx.createGain();
      rumbleOsc.type = 'triangle';
      rumbleOsc.frequency.setValueAtTime(48, now + 0.05);
      rumbleOsc.frequency.exponentialRampToValueAtTime(20, now + 2.2);

      rumbleGain.gain.setValueAtTime(0.001, now);
      rumbleGain.gain.linearRampToValueAtTime(0.5, now + 0.08);
      rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 2.3);

      rumbleOsc.connect(rumbleGain);
      rumbleGain.connect(masterGain);

      rumbleOsc.start(now + 0.05);
      rumbleOsc.stop(now + 2.3);
    } catch {
      // AudioContext ignored if browser blocks autoplay
    }
  }

  // Alias for backwards compatibility
  public playWarpBlast(): void {
    this.playBombBlast();
  }

  // Futuristic UI Hover / Click Blip
  public playUiClick(): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Ignore
    }
  }

  // Chime for fact generation / roll
  public playFactChime(): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        gain.gain.setValueAtTime(0.15, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.3);
      });
    } catch {
      // Ignore
    }
  }
}

export const soundFx = new SoundFXEngine();
