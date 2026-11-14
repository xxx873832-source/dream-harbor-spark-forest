import type { GameEvent } from "./engine";

export class AudioBus {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  muted = false;
  music = true;
  private failed = false;

  unlock() {
    if (this.failed) return;
    try {
      if (!this.ctx) {
        const ctx = new AudioContext();
        const master = ctx.createGain();
        master.gain.value = this.muted ? 0 : 0.42;
        master.connect(ctx.destination);
        const musicGain = ctx.createGain();
        musicGain.gain.value = this.music ? 0.16 : 0;
        musicGain.connect(master);
        this.ctx = ctx;
        this.master = master;
        this.musicGain = musicGain;
        this.startPad(ctx, musicGain);
      }
      if (this.ctx.state === "suspended") void this.ctx.resume();
    } catch {
      this.failed = true;
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : 0.42;
  }

  setMusic(on: boolean) {
    this.music = on;
    if (this.musicGain) this.musicGain.gain.value = on ? 0.16 : 0;
  }

  resume() {
    if (this.ctx?.state === "suspended") void this.ctx.resume();
  }

  handle(events: GameEvent[]) {
    if (!this.ctx || this.muted) return;
    for (const event of events) {
      if (event.type === "tick") this.blip(880, 0.045, "square", 0.045);
      else if (event.type === "wrong") this.blip(event.hard ? 110 : 180, 0.07, "sawtooth", event.hard ? 0.05 : 0.03);
      else if (event.type === "kill") {
        this.noise(event.kind === "boss" ? 0.28 : 0.16, event.kind === "boss" ? 0.22 : 0.12);
        this.sweep(event.kind === "boss" ? 520 : 360, 90, 0.18, 0.05);
        if (event.power) this.chord([523, 659, 784], 0.18);
      } else if (event.type === "hurt") {
        this.noise(0.22, 0.16);
        this.blip(70, 0.16, "sawtooth", 0.06);
      } else if (event.type === "wave") this.chord([392, 494, 587], 0.22);
      else if (event.type === "clear") this.chord([494, 659, 784], 0.16);
      else if (event.type === "over") this.sweep(320, 60, 0.4, 0.06);
    }
  }

  private startPad(ctx: AudioContext, dest: GainNode) {
    for (const freq of [98, 146.8, 196]) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.value = 0.05;
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
    }
  }

  private blip(freq: number, dur: number, type: OscillatorType, vol: number) {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(master);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.02);
  }

  private sweep(from: number, to: number, dur: number, vol: number) {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(from, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), ctx.currentTime + dur);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(master);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.02);
  }

  private chord(freqs: number[], dur: number) {
    for (const freq of freqs) this.blip(freq, dur, "triangle", 0.035);
  }

  private noise(dur: number, vol: number) {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const n = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buffer = ctx.createBuffer(1, n, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1200;
    const gain = ctx.createGain();
    gain.gain.value = vol;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start();
  }
}
