/** Tiny WebAudio ticks. No audio files, no network, no autoplay before a tap. */

let context: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!context) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      context = new Ctor();
    }
    if (context.state === 'suspended') void context.resume();
    return context;
  } catch {
    return null;
  }
}

function tone(frequency: number, duration: number, type: OscillatorType, gain: number, delay = 0) {
  const ctx = audio();
  if (!ctx) return;
  try {
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(gain, start + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(amp).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  } catch {
    // Sound is decoration; never let it break a run.
  }
}

export function playTick(): void {
  tone(880, 0.07, 'sine', 0.06);
  tone(1320, 0.06, 'sine', 0.03, 0.03);
}

export function playMiss(): void {
  tone(150, 0.14, 'square', 0.04);
}

export function playPing(): void {
  tone(520, 0.12, 'sine', 0.05);
  tone(780, 0.16, 'sine', 0.04, 0.08);
}

export function playWin(): void {
  [523, 659, 784, 1047].forEach((note, index) => {
    tone(note, 0.16, 'triangle', 0.05, index * 0.09);
  });
}

const MUTE_KEY = 'wc:muted';

export function isMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean): void {
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    // Private mode: mute state just won't persist.
  }
}
