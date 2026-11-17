import {
  POWER_WORDS,
  conflicts,
  pickEntry,
  type Diff,
  type Entry,
  type Lang,
  type Mode,
  type Power,
} from "./lexicon";

export type Kind = "scout" | "raider" | "brute" | "boss";
export type Phase = "menu" | "play" | "pause" | "over";
export type Sub = "intro" | "combat" | "clear";

export type GameEvent =
  | { type: "tick" }
  | { type: "wrong"; hard: boolean }
  | { type: "kill"; kind: Kind; power: Power | null }
  | { type: "hurt" }
  | { type: "wave" }
  | { type: "clear" }
  | { type: "over" };

export type Enemy = {
  id: number;
  kind: Kind;
  x: number;
  y: number;
  speed: number;
  wobble: number;
  word: string;
  hanzi: string | null;
  power: Power | null;
  hp: number;
  maxHp: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
};

type Shot = { sx: number; sy: number; tx: number; ty: number; p: number; color: string };
type Floater = { x: number; y: number; text: string; life: number; max: number; color: string };
type Star = { x: number; y: number; z: number; s: number };

export type Hud = {
  phase: Phase;
  sub: Sub;
  score: number;
  combo: number;
  maxCombo: number;
  hull: number;
  maxHull: number;
  wave: number;
  bossWave: boolean;
  accuracy: number;
  wpm: number;
  buffer: string;
  focusWord: string;
  focusHanzi: string | null;
  matchCount: number;
  slow: boolean;
  best: number;
  isRecord: boolean;
  lang: Lang;
  diff: Diff;
  mode: Mode;
};

const MAX_HULL = 5;

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function lenRange(diff: Diff, wave: number, boss: boolean): [number, number] {
  if (boss) {
    const n = diff === "easy" ? 6 + Math.floor(wave / 5) : diff === "normal" ? 7 + Math.floor(wave / 5) : 8 + Math.floor(wave / 5);
    return [n, n + 3];
  }
  const grow = Math.floor((wave - 1) / 3);
  if (diff === "easy") return [3, Math.min(6, 4 + grow)];
  if (diff === "normal") return [3, Math.min(9, 5 + grow)];
  return [4, Math.min(12, 7 + grow)];
}

export class Game {
  phase: Phase = "menu";
  sub: Sub = "intro";
  lang: Lang = "en";
  diff: Diff = "normal";
  mode: Mode = "word";
  score = 0;
  combo = 0;
  maxCombo = 0;
  hull = 3;
  wave = 1;
  buffer = "";
  best = 0;
  prevBest = 0;
  isRecord = false;
  correct = 0;
  wrong = 0;
  playTime = 0;
  time = 0;
  shake = 0;
  flash = 0;
  errorT = 0;
  slowT = 0;
  muzzle = 0;
  hitstop = 0;
  introT = 0;
  clearT = 0;
  inset = 0;
  playerX = 0.5;
  spawned = 0;
  quota = 4;
  bossSpawned = false;
  spawnTimer = 0.4;
  exhaust = 0;
  enemies: Enemy[] = [];
  particles: Particle[] = [];
  shots: Shot[] = [];
  floaters: Floater[] = [];
  stars: Star[] = [];
  events: GameEvent[] = [];
  private nextId = 1;

  constructor() {
    this.stars = Array.from({ length: 140 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),
      s: 0.4 + Math.random() * 1.6,
    }));
  }

  configure(opts: { lang: Lang; diff: Diff; mode: Mode; best: number }) {
    this.lang = opts.lang;
    this.diff = opts.diff;
    this.mode = opts.mode;
    this.best = opts.best;
    this.prevBest = opts.best;
  }

  playerY() {
    return Math.max(0.46, 0.84 - this.inset);
  }

  killY() {
    return this.playerY() - 0.04;
  }

  start() {
    this.phase = "play";
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.hull = 3;
    this.wave = 1;
    this.buffer = "";
    this.correct = 0;
    this.wrong = 0;
    this.playTime = 0;
    this.isRecord = false;
    this.slowT = 0;
    this.flash = 0;
    this.enemies = [];
    this.shots = [];
    this.floaters = [];
    this.best = this.prevBest;
    this.beginWave();
    this.sub = "intro";
    this.introT = 0.9;
    this.events.push({ type: "wave" });
  }

  pause() {
    if (this.phase === "play") this.phase = "pause";
  }

  resume() {
    if (this.phase === "pause") this.phase = "play";
  }

  toMenu() {
    this.phase = "menu";
    this.enemies = [];
    this.buffer = "";
    this.shots = [];
  }

  hud(): Hud {
    const focus = this.focus();
    const matches = this.matches();
    const total = this.correct + this.wrong;
    return {
      phase: this.phase,
      sub: this.sub,
      score: this.score,
      combo: this.combo,
      maxCombo: this.maxCombo,
      hull: this.hull,
      maxHull: MAX_HULL,
      wave: this.wave,
      bossWave: this.wave % 5 === 0,
      accuracy: total ? Math.round((this.correct / total) * 100) : 100,
      wpm: this.playTime < 0.5 ? 0 : Math.round(this.correct / 5 / (this.playTime / 60)),
      buffer: this.buffer,
      focusWord: focus ? (focus.hanzi ? focus.word : focus.word.toUpperCase()) : "",
      focusHanzi: focus?.hanzi ?? null,
      matchCount: matches.length,
      slow: this.slowT > 0,
      best: Math.max(this.best, this.prevBest),
      isRecord: this.isRecord,
      lang: this.lang,
      diff: this.diff,
      mode: this.mode,
    };
  }

  snapshot() {
    return {
      phase: this.phase,
      sub: this.sub,
      score: this.score,
      hull: this.hull,
      wave: this.wave,
      buffer: this.buffer,
      combo: this.combo,
      enemies: this.enemies.map((e) => ({ word: e.word, y: +e.y.toFixed(3), kind: e.kind, hanzi: e.hanzi })),
    };
  }

  pullEvents() {
    const ev = this.events;
    this.events = [];
    return ev;
  }

  type(ch: string) {
    if (this.phase !== "play" || this.sub !== "combat") return;
    if (!/^[a-z]$/.test(ch)) return;
    if (this.mode === "letter") {
      this.typeLetter(ch);
      return;
    }
    const next = this.buffer + ch;
    const aliveWords = this.enemies;
    const exact = aliveWords.filter((e) => e.word === next);
    if (exact.length) {
      this.correct += 1;
      this.buffer = "";
      this.destroy(this.closest(exact));
      this.events.push({ type: "tick" });
      return;
    }
    const prefs = aliveWords.filter((e) => e.word.startsWith(next));
    if (prefs.length) {
      this.correct += 1;
      this.buffer = next;
      const target = this.closest(prefs);
      this.fire(target);
      this.muzzle = 0.07;
      this.events.push({ type: "tick" });
      return;
    }
    this.miss(this.buffer.length > 0);
  }

  backspace() {
    if (this.phase !== "play" || this.sub !== "combat" || this.mode === "letter") return;
    this.buffer = this.buffer.slice(0, -1);
  }

  private typeLetter(ch: string) {
    const hits = this.enemies.filter((enemy) => enemy.word === ch);
    if (!hits.length) {
      this.miss(true);
      return;
    }
    this.correct += 1;
    const target = this.closest(hits);
    target.hp -= 1;
    this.muzzle = 0.07;
    this.events.push({ type: "tick" });
    if (target.hp > 0) {
      this.fire(target);
      this.burst(target.x, target.y, 8, "#ffb347");
      this.shake = Math.min(1, this.shake + 0.12);
      this.floaters.push({
        x: target.x,
        y: target.y - 0.04,
        text: `${target.hp}`,
        life: 0.45,
        max: 0.45,
        color: "#ffb347",
      });
      return;
    }
    this.destroy(target);
  }

  private miss(hard: boolean) {
    this.wrong += 1;
    if (hard) {
      const prev = this.combo;
      this.combo = 0;
      this.shake = Math.min(1, this.shake + 0.22);
      this.errorT = 0.16;
      if (prev >= 3) {
        this.floaters.push({
          x: this.playerX,
          y: this.playerY() - 0.06,
          text: "连击中断",
          life: 0.7,
          max: 0.7,
          color: "#ff4d8d",
        });
      }
    }
    this.events.push({ type: "wrong", hard });
  }

  focus(): Enemy | null {
    const list = this.matches();
    if (!list.length) return null;
    return this.closest(list);
  }

  progressOf(enemy: Enemy) {
    if (this.buffer && enemy.word.startsWith(this.buffer)) return this.buffer.length;
    return 0;
  }

  update(dt: number) {
    const step = Math.min(dt, 0.05);
    this.time += step;
    this.shake = Math.max(0, this.shake - step * 1.5);
    this.flash = Math.max(0, this.flash - step * 1.7);
    this.errorT = Math.max(0, this.errorT - step);
    this.muzzle = Math.max(0, this.muzzle - step);
    if (this.slowT > 0) this.slowT = Math.max(0, this.slowT - step);

    const starSpeed = this.phase === "play" ? 1 : 0.45;
    for (const star of this.stars) {
      star.y += (0.012 + star.z * 0.05) * starSpeed * step;
      if (star.y > 1) {
        star.y = 0;
        star.x = Math.random();
      }
    }
    this.updateFx(step);

    if (this.phase === "menu") {
      const tx = 0.5 + Math.sin(this.time * 0.35) * 0.1;
      this.playerX += (tx - this.playerX) * Math.min(1, step * 2);
      this.exhaustStep(step);
      return;
    }
    if (this.phase === "pause" || this.phase === "over") return;

    this.playTime += step;
    const focus = this.focus();
    const tx = focus ? focus.x : 0.5;
    this.playerX += (tx - this.playerX) * Math.min(1, step * 3.6);
    this.exhaustStep(step);

    if (this.hitstop > 0) {
      this.hitstop -= step;
      return;
    }

    if (this.sub === "intro") {
      this.introT -= step;
      if (this.introT <= 0) this.sub = "combat";
      return;
    }
    if (this.sub === "clear") {
      this.clearT -= step;
      if (this.clearT <= 0) {
        this.wave += 1;
        this.beginWave();
        this.sub = "intro";
        this.introT = 0.85;
        this.events.push({ type: "wave" });
      }
      return;
    }

    this.spawnTimer -= step;
    const cap = this.maxAlive();
    if (this.spawned < this.quota && this.enemies.length < cap && this.spawnTimer <= 0) {
      this.spawn();
      this.spawnTimer = this.interval();
    }

    const slow = this.slowT > 0 ? 0.42 : 1;
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i]!;
      enemy.y += enemy.speed * slow * step;
      enemy.x += Math.sin(this.time * 0.85 + enemy.wobble) * 0.035 * step;
      enemy.x = clamp(enemy.x, 0.1, 0.9);
      if (enemy.y >= this.killY()) {
        this.enemies.splice(i, 1);
        this.hullHit(enemy.kind === "boss" ? 2 : 1);
      }
    }
    this.separate();
    if (this.buffer && !this.enemies.some((e) => e.word.startsWith(this.buffer))) this.buffer = "";
    this.maybeClear();
  }

  private matches() {
    if (!this.buffer) return [];
    return this.enemies.filter((e) => e.word.startsWith(this.buffer));
  }

  private closest(list: Enemy[]) {
    return list.reduce((a, b) => (b.y > a.y ? b : a));
  }

  private beginWave() {
    this.spawned = 0;
    this.bossSpawned = false;
    this.buffer = "";
    this.quota =
      this.mode === "letter"
        ? this.wave % 5 === 0
          ? 6 + Math.floor(this.wave / 5)
          : 8 + this.wave
        : this.wave % 5 === 0
          ? 3 + Math.floor(this.wave / 5)
          : 3 + this.wave;
    this.spawnTimer = 0.28;
  }

  private maxAlive() {
    if (this.mode === "letter") {
      const base = this.diff === "easy" ? 4 : this.diff === "normal" ? 5 : 7;
      return Math.min(8, base + Math.floor((this.wave - 1) / 3));
    }
    const base = this.diff === "easy" ? 2 : this.diff === "normal" ? 3 : 4;
    return Math.min(7, base + Math.floor((this.wave - 1) / 2));
  }

  private interval() {
    const m = this.diff === "easy" ? 1.18 : this.diff === "normal" ? 1 : 0.84;
    if (this.mode === "letter") return Math.max(0.48, (1.25 - this.wave * 0.045) * m);
    return Math.max(0.7, (2.2 - this.wave * 0.07) * m);
  }

  private speedFor(kind: Kind) {
    const diffMul = this.diff === "easy" ? 0.78 : this.diff === "normal" ? 1 : 1.18;
    let speed = (0.04 + (this.wave - 1) * 0.0042) * diffMul;
    if (this.mode === "letter") speed *= 1.15;
    if (kind === "scout") speed *= 1.08;
    if (kind === "raider") speed *= 0.94;
    if (kind === "brute") speed *= 0.8;
    if (kind === "boss") speed *= 0.58;
    const cap = kind === "boss" ? 0.85 / 16 : 0.85 / 6.2;
    return Math.min(speed, cap);
  }

  private nextKind(): Kind {
    if (this.wave % 5 === 0 && !this.bossSpawned && this.spawned >= 1) {
      this.bossSpawned = true;
      return "boss";
    }
    const roll = Math.random();
    if (this.wave >= 4 && roll < 0.2) return "brute";
    if (this.wave >= 2 && roll < 0.55) return "raider";
    return "scout";
  }

  private spawn() {
    const kind = this.nextKind();
    const alive = this.enemies.map((e) => e.word);
    let entry: Entry;
    let power: Power | null = null;
    if (this.mode === "letter") {
      entry = { word: this.pickLetter(alive), display: "", hanzi: null };
      const powerFree = !this.enemies.some((e) => e.power);
      if (kind !== "boss" && this.wave >= 2 && powerFree && Math.random() < 0.14) {
        const options: Power[] = ["shield", "slow", "nova"];
        power = options[Math.floor(Math.random() * options.length)]!;
      }
    } else {
      let [minL, maxL] = lenRange(this.diff, this.wave, kind === "boss");
      if (kind === "brute") {
        minL += 1;
        maxL += 1;
      }
      if (kind === "scout") maxL = Math.max(minL, maxL - 1);
      entry = pickEntry(this.lang, minL, maxL, alive, kind === "boss");
      const powerFree = !this.enemies.some((e) => e.power);
      if (kind !== "boss" && this.wave >= 2 && powerFree && Math.random() < 0.16) {
        const options: Power[] = ["shield", "slow", "nova"];
        const choice = options[Math.floor(Math.random() * options.length)]!;
        const word = POWER_WORDS[this.lang][choice];
        if (!conflicts(word.word, alive)) {
          entry = word;
          power = choice;
        }
      }
    }
    const hp = this.mode === "letter" && kind === "boss" ? Math.min(5, 2 + Math.floor(this.wave / 5)) : 1;
    let x = 0.2 + Math.random() * 0.6;
    for (let n = 0; n < 8; n++) {
      const tryX = 0.14 + Math.random() * 0.72;
      if (this.enemies.every((e) => Math.abs(e.x - tryX) > 0.12 || Math.abs(e.y) > 0.2)) {
        x = tryX;
        break;
      }
    }
    this.enemies.push({
      id: this.nextId++,
      kind,
      x,
      y: -0.04,
      speed: this.speedFor(kind),
      wobble: Math.random() * Math.PI * 2,
      word: entry.word,
      hanzi: entry.hanzi,
      power,
      hp,
      maxHp: hp,
    });
    this.spawned += 1;
  }

  private pickLetter(alive: string[]) {
    const used = new Set(alive);
    const free = "abcdefghijklmnopqrstuvwxyz".split("").filter((ch) => !used.has(ch));
    const pool = free.length ? free : "abcdefghijklmnopqrstuvwxyz".split("");
    return pool[Math.floor(Math.random() * pool.length)]!;
  }

  private separate() {
    const list = this.enemies;
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i]!;
        const b = list[j]!;
        const dx = b.x - a.x;
        if (Math.abs(dx) < 0.1 && Math.abs(b.y - a.y) < 0.09) {
          const push = (0.1 - Math.abs(dx)) * 0.35;
          const sign = Math.sign(dx || (i % 2 ? 1 : -1));
          a.x = clamp(a.x - sign * push, 0.1, 0.9);
          b.x = clamp(b.x + sign * push, 0.1, 0.9);
        }
      }
    }
  }

  private fire(target: Enemy) {
    this.shots.push({
      sx: this.playerX,
      sy: this.playerY() - 0.03,
      tx: target.x,
      ty: target.y,
      p: 0,
      color: target.power ? "#ffb347" : "#3ee0ff",
    });
  }

  private destroy(enemy: Enemy) {
    this.combo += 1;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    const mult = 1 + (this.combo - 1) * 0.14;
    const diffM = this.diff === "easy" ? 0.85 : this.diff === "normal" ? 1 : 1.35;
    const base = this.mode === "letter" ? 42 : enemy.word.length * 22;
    let pts = Math.round(base * mult * diffM);
    if (enemy.kind === "boss") pts = Math.round(pts * 2.6);
    if (enemy.power) pts = Math.round(pts * 1.2);
    this.score += pts;
    this.floaters.push({
      x: enemy.x,
      y: enemy.y,
      text: `+${pts}`,
      life: 0.75,
      max: 0.75,
      color: "#ffb347",
    });
    this.burst(enemy.x, enemy.y, enemy.kind === "boss" ? 28 : 16, enemy.power ? "#ffb347" : "#3ee0ff");
    this.fire(enemy);
    this.muzzle = 0.08;
    this.shake = Math.min(1, this.shake + (enemy.kind === "boss" ? 0.7 : 0.3));
    this.hitstop = enemy.kind === "boss" ? 0.07 : 0.04;

    if (enemy.power === "shield") {
      if (this.hull < MAX_HULL) this.hull += 1;
      else this.score += 150;
    } else if (enemy.power === "slow") {
      this.slowT = 5.5;
    } else if (enemy.power === "nova") {
      const victims = this.enemies.filter((o) => o.kind !== "boss" && o.id !== enemy.id);
      for (const other of victims) {
        this.score += 40;
        this.burst(other.x, other.y, 10, "#ffb347");
        this.floaters.push({ x: other.x, y: other.y, text: "+40", life: 0.6, max: 0.6, color: "#ffb347" });
      }
      this.enemies = this.enemies.filter((o) => o.kind === "boss" && o.id !== enemy.id);
      this.events.push({ type: "kill", kind: enemy.kind, power: enemy.power });
      this.maybeClear();
      return;
    }

    this.enemies = this.enemies.filter((o) => o.id !== enemy.id);
    this.events.push({ type: "kill", kind: enemy.kind, power: enemy.power });
    this.maybeClear();
  }

  private maybeClear() {
    if (this.phase !== "play" || this.sub !== "combat" || this.hull <= 0) return;
    if (this.spawned >= this.quota && this.enemies.length === 0) {
      this.sub = "clear";
      this.clearT = 1.05;
      this.buffer = "";
      this.events.push({ type: "clear" });
    }
  }

  private hullHit(dmg: number) {
    if (this.phase !== "play") return;
    this.hull = Math.max(0, this.hull - dmg);
    this.combo = 0;
    this.buffer = "";
    this.shake = Math.min(1, this.shake + 0.85);
    this.flash = 1;
    this.hitstop = 0.09;
    this.burst(this.playerX, this.playerY(), 18, "#ff4d8d");
    this.events.push({ type: "hurt" });
    if (this.hull <= 0) {
      this.phase = "over";
      this.isRecord = this.score > this.prevBest && this.score > 0;
      if (this.isRecord) this.best = this.score;
      this.events.push({ type: "over" });
    }
  }

  private burst(x: number, y: number, count: number, color: string) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 0.08 + Math.random() * 0.28;
      const life = 0.28 + Math.random() * 0.35;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life,
        max: life,
        size: 1.5 + Math.random() * 3.2,
        color,
      });
    }
    if (this.particles.length > 420) this.particles.splice(0, this.particles.length - 420);
  }

  private exhaustStep(step: number) {
    this.exhaust -= step;
    if (this.exhaust > 0) return;
    this.exhaust = 0.04;
    const life = 0.28;
    this.particles.push({
      x: this.playerX + (Math.random() - 0.5) * 0.012,
      y: this.playerY() + 0.045,
      vx: (Math.random() - 0.5) * 0.02,
      vy: 0.08 + Math.random() * 0.06,
      life,
      max: life,
      size: 2 + Math.random() * 2,
      color: Math.random() > 0.4 ? "#ffb347" : "#3ee0ff",
    });
  }

  private updateFx(step: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]!;
      p.life -= step;
      p.x += p.vx * step;
      p.y += p.vy * step;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.floaters.length - 1; i >= 0; i--) {
      const f = this.floaters[i]!;
      f.life -= step;
      f.y -= 0.05 * step;
      if (f.life <= 0) this.floaters.splice(i, 1);
    }
    for (let i = this.shots.length - 1; i >= 0; i--) {
      const s = this.shots[i]!;
      s.p += step * 3.4;
      if (s.p >= 1) {
        this.burst(s.tx, s.ty, 5, s.color);
        this.shots.splice(i, 1);
      }
    }
  }
}
