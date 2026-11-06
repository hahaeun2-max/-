/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Web Audio API synthesized sound generator for Baekdadam Pop-up Web Game.
 * Zero external audio assets needed; works 100% offline and in all mobile browsers.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmInterval: number | null = null;
  private isBgmPlaying: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBGM();
    } else {
      this.playBGM();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Serene traditional Korean pentatonic melody (궁, 상, 각, 치, 우)
   * Played with gentle sine/triangle bell and plucked tones.
   */
  public playBGM() {
    if (this.isMuted || this.isBgmPlaying) return;
    this.initCtx();
    if (!this.ctx) return;

    this.isBgmPlaying = true;

    // Korean pentatonic notes (C4, D4, F4, G4, A4, C5, D5)
    const melody = [
      { note: 261.63, dur: 0.6 }, // C4 (궁)
      { note: 293.66, dur: 0.4 }, // D4 (상)
      { note: 349.23, dur: 0.8 }, // F4 (각)
      { note: 392.00, dur: 0.6 }, // G4 (치)
      { note: 440.00, dur: 0.9 }, // A4 (우)
      { note: 523.25, dur: 0.7 }, // C5
      { note: 440.00, dur: 0.5 }, // A4
      { note: 392.00, dur: 0.8 }, // G4
      { note: 349.23, dur: 0.6 }, // F4
      { note: 293.66, dur: 0.5 }, // D4
      { note: 261.63, dur: 1.2 }, // C4
    ];

    let step = 0;
    const playNext = () => {
      if (!this.isBgmPlaying || this.isMuted || !this.ctx) return;
      const cur = melody[step % melody.length];
      step++;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(cur.note, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.05, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + cur.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + cur.dur + 0.1);

      this.bgmInterval = window.setTimeout(playNext, cur.dur * 1000 + 150);
    };

    playNext();
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearTimeout(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  /**
   * Sound effects for game events
   */
  public playSfx(type: 'peel' | 'perfect' | 'great' | 'drop' | 'stir' | 'pour' | 'complete' | 'tap') {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    switch (type) {
      case 'tap': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }

      case 'peel': {
        // White noise burst + high sine tear sound
        const bufferSize = this.ctx.sampleRate * 0.12;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.3 * Math.exp(-i / (bufferSize * 0.3));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1200;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
        break;
      }

      case 'perfect': {
        // Bright bell chord
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.04);
          gain.gain.setValueAtTime(0.09, now + i * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 0.6);
          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(now + i * 0.04);
          osc.stop(now + i * 0.04 + 0.65);
        });
        break;
      }

      case 'great': {
        [440.00, 554.37, 659.25].forEach((freq, i) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.05);
          gain.gain.setValueAtTime(0.08, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.5);
          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.55);
        });
        break;
      }

      case 'drop': {
        // Water droplet plop
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
      }

      case 'pour': {
        // Gentle bubbling trickle
        for (let i = 0; i < 3; i++) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600 + Math.random() * 300, now + i * 0.08);
          gain.gain.setValueAtTime(0.04, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.1);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.1);
        }
        break;
      }

      case 'stir': {
        // Swirling whoosh
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }

      case 'complete': {
        // Celebration pentatonic arpeggio
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
        notes.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          gain.gain.setValueAtTime(0.08, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.8);
          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.85);
        });
        break;
      }
    }
  }
}

export const soundEngine = new SoundEngine();
