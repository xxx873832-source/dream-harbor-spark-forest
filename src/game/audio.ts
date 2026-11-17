import type { GameEvent } from "./engine";

export type MusicScene = "calm" | "play" | "boss";

const BPM = 98;
const STEP = 60 / BPM / 4;
const LOOP = 64;

const BASS = [
  110, 0, 110, 0, 110, 0, 82.41, 0, 110, 0, 110, 0, 82.41, 0, 110, 0, 87.31, 0, 87.31, 0, 130.81, 0, 87.31, 0,
  87.31, 0, 98, 0, 110, 0, 87.31, 0, 130.81, 0, 130.81, 0, 164.81, 0, 130.81, 0, 98, 0, 98, 0, 130.81, 0, 98, 0, 98,
  0, 98, 0, 146.83, 0, 98, 0, 110, 0, 98, 0, 82.41, 0, 98, 0,
];

const LEAD = [
  329.63, 0, 0, 0, 523.25, 0, 440, 0, 392, 0, 0, 0, 329.63, 0, 0, 0, 293.66, 0, 329.63, 0, 349.23, 0, 0, 0, 329.63,
  0, 293.66, 0, 261.63, 0, 0, 0, 440, 0, 0, 0, 392, 0, 329.63, 0, 293.66, 0, 329.63, 0, 392, 0, 0, 0, 329.63, 0,
  293.66, 0, 261.63, 0, 0, 0, 293.66, 0, 329.63, 0, 440, 0, 0, 0,
];

const ARP = [523.25, 659.25, 783.99, 659.25, 587.33, 523.25, 440, 392];

const CHORDS = [
  [220, 261.63, 329.63],
  [174.61, 220, 261.63],
  [261.63, 329.63, 392],
  [196, 246.94, 293.66],
];

export class AudioBus {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextNote = 0;
  private step = 0;
  private scene: MusicScene = "calm";
  muted = false;
  music = true;
  private failed = false;

  unlock() {
    if (this.failed) return;
    try {
      if (!this.ctx) {
        const ctx = new AudioContext();
        const master = ctx.createGain();
        master.gain.value = this.muted ? 0 : 0.5;
        master.connect(ctx.destination);
        const musicGain = ctx.createGain();
        musicGain.gain.value = 0;
        musicGain.connect(master);
        const sfxGain = ctx.createGain();
        sfxGain.gain.value = 0.9;
        sfxGain.connect(master);
        this.ctx = ctx;
        this.master = master;
        this.musicGain = musicGain;
        this.sfxGain = sfxGain;
        this.applyLevel();
        this.arm();
      }
      if (this.ctx.state === "suspended") void this.ctx.resume();
      if (this.nextNote < this.ctx.currentTime) this.nextNote = this.ctx.currentTime + 0.06;
    } catch {
      this.failed = true;
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.ramp(this.master, muted ? 0 : 0.5);
  }

  setMusic(on: boolean) {
    this.music = on;
    this.applyLevel();
  }

  setScene(scene: MusicScene) {
    if (this.scene === scene) return;
    this.scene = scene;
    this.applyLevel();
  }

  status() {
    return { music: this.music, muted: this.muted, scene: this.scene, state: this.ctx?.state ?? "off" };
  }

  resume() {
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") void this.ctx.resume();
    if (this.nextNote < this.ctx.currentTime) this.nextNote = this.ctx.currentTime + 0.06;
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

  private applyLevel() {
    const level = !this.music ? 0 : this.scene === "boss" ? 0.78 : this.scene === "play" ? 0.62 : 0.4;
    this.ramp(this.musicGain, level);
  }

  private ramp(node: GainNode | null, value: number) {
    if (!node || !this.ctx) return;
    node.gain.setTargetAtTime(Math.max(0.0001, value), this.ctx.currentTime, 0.08);
    if (value === 0) node.gain.setTargetAtTime(0, this.ctx.currentTime + 0.2, 0.05);
  }

  private arm() {
    if (this.timer || !this.ctx) return;
    this.nextNote = this.ctx.currentTime + 0.08;
    this.timer = setInterval(() => this.schedule(), 25);
  }

  private schedule() {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== "running") return;
    if (this.nextNote < ctx.currentTime - 0.2) this.nextNote = ctx.currentTime + 0.05;
    const horizon = ctx.currentTime + 0.16;
    while (this.nextNote < horizon) {
      if (this.music && !this.muted) this.playStep(this.step, this.nextNote);
      this.nextNote += STEP;
      this.step = (this.step + 1) % LOOP;
    }
  }

  private playStep(step: number, time: number) {
    const calm = this.scene === "calm";
    const bass = BASS[step] ?? 0;
    if (bass) {
      this.musicTone(time, bass, STEP * 1.7, "sawtooth", calm ? 0.06 : 0.09, 460);
      this.musicTone(time, bass / 2, STEP * 1.7, "sine", 0.07, 180);
    }
    if (step % 16 === 0) {
      const chord = CHORDS[(step / 16) % CHORDS.length] ?? CHORDS[0];
      for (const freq of chord) this.musicTone(time, freq, STEP * 14.5, "sine", calm ? 0.028 : 0.02, 880);
    }
    const arp = ARP[(step >> 1) % ARP.length] ?? 440;
    if (step % 2 === 1) this.musicTone(time, arp, STEP * 1.3, "sine", calm ? 0.03 : 0.022, 1500);
    if (calm) return;
    const lead = LEAD[step] ?? 0;
    if (lead) this.musicTone(time, lead, STEP * 1.55, "triangle", this.scene === "boss" ? 0.07 : 0.048, 1900);
    if (step % 16 === 0 || step % 16 === 8) this.kick(time);
    if (step % 2 === 1) this.hat(time, this.scene === "boss" ? 0.045 : 0.028);
    if (this.scene === "boss" && step % 8 === 4) this.musicTone(time, 880, 0.07, "square", 0.028, 2400);
  }

  private musicTone(time: number, freq: number, dur: number, type: OscillatorType, vol: number, cutoff: number) {
    const ctx = this.ctx;
    const dest = this.musicGain;
    if (!ctx || !dest || freq <= 0) return;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(cutoff, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(vol, time + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + Math.max(0.05, dur));
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + dur + 0.03);
  }

  private kick(time: number) {
    const ctx = this.ctx;
    const dest = this.musicGain;
    if (!ctx || !dest) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(46, time + 0.12);
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.18);
  }

  private hat(time: number, vol: number) {
    const ctx = this.ctx;
    const dest = this.musicGain;
    if (!ctx || !dest) return;
    if (!this.noiseBuf) {
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.2), ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      this.noiseBuf = buf;
    }
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 7000;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    src.start(time);
    src.stop(time + 0.05);
  }

  private blip(freq: number, dur: number, type: OscillatorType, vol: number) {
    const ctx = this.ctx;
    const dest = this.sfxGain;
    if (!ctx || !dest) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.02);
  }

  private sweep(from: number, to: number, dur: number, vol: number) {
    const ctx = this.ctx;
    const dest = this.sfxGain;
    if (!ctx || !dest) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(from, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), ctx.currentTime + dur);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.02);
  }

  private chord(freqs: number[], dur: number) {
    for (const freq of freqs) this.blip(freq, dur, "triangle", 0.035);
  }

  private noise(dur: number, vol: number) {
    const ctx = this.ctx;
    const dest = this.sfxGain;
    if (!ctx || !dest) return;
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
    gain.connect(dest);
    src.start();
  }
}
