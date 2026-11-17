import { POWER_HINT, type Power } from "./lexicon";
import type { Enemy, Game, Kind } from "./engine";

export type Art = Partial<Record<Kind | "player" | "nebula", HTMLImageElement>>;

const FONT = "Oxanium, 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'WenQuanYi Zen Hei', sans-serif";

const KIND_COLOR: Record<Kind, string> = {
  scout: "#ff6b5a",
  raider: "#c084fc",
  brute: "#ffb347",
  boss: "#ff4d8d",
};

function ready(img?: HTMLImageElement) {
  return !!img && img.complete && img.naturalWidth > 0;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function spriteBox(kind: Kind | "player", img: HTMLImageElement | undefined, cw: number, ch: number) {
  const ratio = kind === "player" ? 0.16 : kind === "scout" ? 0.11 : kind === "raider" ? 0.13 : kind === "brute" ? 0.15 : 0.24;
  let h = ch * ratio;
  let w = ready(img) ? h * (img!.width / img!.height) : h * 0.72;
  const maxW = cw * (kind === "boss" ? 0.58 : kind === "player" ? 0.32 : 0.3);
  if (w > maxW) {
    w = maxW;
    h = ready(img) ? w * (img!.height / img!.width) : w * 1.2;
  }
  return { w, h };
}

function drawShip(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | undefined,
  kind: Kind | "player",
  x: number,
  y: number,
  cw: number,
  ch: number,
  rot: number,
) {
  const box = spriteBox(kind, img, cw, ch);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  if (ready(img)) {
    ctx.drawImage(img!, -box.w / 2, -box.h / 2, box.w, box.h);
  } else {
    ctx.fillStyle = kind === "player" ? "#3ee0ff" : KIND_COLOR[kind as Kind];
    ctx.beginPath();
    ctx.moveTo(0, -box.h / 2);
    ctx.lineTo(box.w / 2, box.h / 2);
    ctx.lineTo(0, box.h * 0.28);
    ctx.lineTo(-box.w / 2, box.h / 2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  return box;
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  x: number,
  y: number,
  spriteH: number,
  cw: number,
  ch: number,
  progress: number,
  focused: boolean,
  error: boolean,
) {
  const letters = (enemy.hanzi ? enemy.word : enemy.word.toUpperCase()).split("");
  const single = letters.length === 1;
  let gap = single ? 42 : Math.min(26, Math.max(15, cw * 0.02));
  let total = letters.length * gap;
  const maxTotal = cw * 0.86;
  if (total > maxTotal) {
    gap = maxTotal / letters.length;
    total = maxTotal;
  }
  const hanzi = enemy.hanzi;
  const hint = enemy.power ? POWER_HINT[enemy.power as Power] : "";
  const size = single ? Math.max(28, cw * 0.045) : Math.max(13, gap * 0.92);
  const hanziSize = Math.max(15, size * 1.05);
  const hintSize = 11;
  const pips = enemy.maxHp > 1;
  const plateH = size + 16 + (hanzi ? hanziSize + 4 : 0) + (hint ? hintSize + 4 : 0) + (pips ? 12 : 0);
  const plateW = Math.max(total + 22, hanzi ? hanzi.length * hanziSize + 22 : 0, hint.length * hintSize + 18);
  let left = x - plateW / 2;
  left = Math.max(8, Math.min(cw - plateW - 8, left));
  const above = y - spriteH / 2 - plateH - 8;
  const top = above > 8 ? above : y + spriteH / 2 + 8;
  const color = enemy.power ? "#ffb347" : focused ? "#3ee0ff" : KIND_COLOR[enemy.kind];

  ctx.save();
  roundRect(ctx, left, top, plateW, plateH, 10);
  ctx.fillStyle = "rgba(7,11,22,0.78)";
  ctx.fill();
  ctx.lineWidth = focused ? 2 : 1;
  ctx.strokeStyle = error && focused ? "#ff4d8d" : color;
  ctx.stroke();

  let cursor = top + 8;
  if (hanzi) {
    ctx.font = `700 ${hanziSize}px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#e7f3ff";
    ctx.fillText(hanzi, left + plateW / 2, cursor);
    cursor += hanziSize + 2;
  }
  ctx.font = `700 ${size}px ${FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  const start = left + plateW / 2 - total / 2 + gap / 2;
  letters.forEach((ch, i) => {
    ctx.fillStyle = i < progress ? "#3ee0ff" : i === progress && progress > 0 ? "#ffb347" : "#e7f3ff";
    ctx.fillText(ch, start + i * gap, cursor);
  });
  if (hint) {
    ctx.font = `600 ${hintSize}px ${FONT}`;
    ctx.fillStyle = "#ffb347";
    ctx.fillText(hint, left + plateW / 2, cursor + size + 3);
  }
  if (pips) {
    const pipY = top + plateH - 10;
    const pipGap = 10;
    const pipStart = left + plateW / 2 - ((enemy.maxHp - 1) * pipGap) / 2;
    for (let i = 0; i < enemy.maxHp; i++) {
      ctx.beginPath();
      ctx.arc(pipStart + i * pipGap, pipY, 3, 0, Math.PI * 2);
      ctx.fillStyle = i < enemy.hp ? "#ffb347" : "rgba(231,243,255,0.25)";
      ctx.fill();
    }
  }
  ctx.restore();
  return { top, plateH, plateW };
}

export function render(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number,
  game: Game,
  art: Art,
  reduced: boolean,
) {
  ctx.clearRect(0, 0, cw, ch);
  ctx.save();
  if (!reduced && game.shake > 0.01) {
    const mag = game.shake * game.shake * 16;
    ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
  }

  const bg = ctx.createLinearGradient(0, 0, 0, ch);
  bg.addColorStop(0, "#050814");
  bg.addColorStop(1, "#10203a");
  ctx.fillStyle = bg;
  ctx.fillRect(-30, -30, cw + 60, ch + 60);

  const nebula = art.nebula;
  if (ready(nebula)) {
    const scale = Math.max(cw / nebula!.width, ch / nebula!.height);
    const dw = nebula!.width * scale;
    const dh = nebula!.height * scale;
    const ox = (cw - dw) / 2 + Math.sin(game.time * 0.05) * 16;
    const oy = (ch - dh) / 2 + Math.cos(game.time * 0.04) * 10;
    ctx.globalAlpha = 0.62;
    ctx.drawImage(nebula!, ox, oy, dw, dh);
    ctx.globalAlpha = 1;
  }

  for (const star of game.stars) {
    const alpha = 0.25 + star.z * 0.75;
    ctx.fillStyle = `rgba(231,243,255,${alpha})`;
    ctx.fillRect(star.x * cw, star.y * ch, star.s, star.s);
  }

  const py = game.playerY() * ch;
  const kill = game.killY();
  let nearest = 0;
  for (const enemy of game.enemies) nearest = Math.max(nearest, enemy.y / Math.max(0.2, kill));
  if (nearest > 0.68) {
    const danger = ctx.createLinearGradient(0, ch * 0.55, 0, ch);
    danger.addColorStop(0, "rgba(255,77,141,0)");
    danger.addColorStop(1, `rgba(255,77,141,${(nearest - 0.68) * 0.55})`);
    ctx.fillStyle = danger;
    ctx.fillRect(0, 0, cw, ch);
  }
  if (game.slowT > 0) {
    ctx.fillStyle = "rgba(62,224,255,0.06)";
    ctx.fillRect(0, 0, cw, ch);
  }

  const ordered = [...game.enemies].sort((a, b) => a.y - b.y);
  const focus = game.focus();
  for (const enemy of ordered) {
    const x = enemy.x * cw;
    const y = enemy.y * ch;
    const progress = game.progressOf(enemy);
    const focused = focus?.id === enemy.id;
    if (enemy.power || focused) {
      ctx.save();
      ctx.globalAlpha = enemy.power ? 0.35 : 0.22;
      const glow = ctx.createRadialGradient(x, y, 4, x, y, ch * 0.08);
      glow.addColorStop(0, enemy.power ? "#ffb347" : "#3ee0ff");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, ch * 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    const box = drawShip(ctx, art[enemy.kind], enemy.kind, x, y, cw, ch, Math.PI);
    if (focused || progress > 0) {
      ctx.save();
      ctx.strokeStyle = focused ? "#3ee0ff" : "rgba(62,224,255,0.45)";
      ctx.lineWidth = focused ? 2 : 1;
      ctx.setLineDash([7, 7]);
      ctx.lineDashOffset = -game.time * 24;
      ctx.strokeRect(x - box.w / 2 - 8, y - box.h / 2 - 8, box.w + 16, box.h + 16);
      ctx.restore();
    }
    drawLabel(ctx, enemy, x, y, box.h, cw, ch, progress, focused, game.errorT > 0);
  }

  for (const shot of game.shots) {
    const t0 = Math.max(0, shot.p - 0.14);
    const x1 = lerp(shot.sx, shot.tx, t0) * cw;
    const y1 = lerp(shot.sy, shot.ty, t0) * ch;
    const x2 = lerp(shot.sx, shot.tx, Math.min(1, shot.p)) * cw;
    const y2 = lerp(shot.sy, shot.ty, Math.min(1, shot.p)) * ch;
    ctx.save();
    ctx.strokeStyle = shot.color;
    ctx.globalAlpha = 0.95;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  const px = game.playerX * cw;
  const bob = reduced ? 0 : Math.sin(game.time * 2.2) * 3;
  if (game.muzzle > 0) {
    ctx.save();
    ctx.globalAlpha = game.muzzle / 0.08;
    ctx.fillStyle = "#e7f3ff";
    ctx.beginPath();
    ctx.arc(px, py + bob - ch * 0.07, 8 + (1 - game.muzzle / 0.08) * 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  drawShip(ctx, art.player, "player", px, py + bob, cw, ch, 0);

  for (const p of game.particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x * cw, p.y * ch, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.font = `700 18px ${FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const floater of game.floaters) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, floater.life / floater.max);
    ctx.fillStyle = floater.color;
    ctx.fillText(floater.text, floater.x * cw, floater.y * ch);
    ctx.restore();
  }

  const vignette = ctx.createRadialGradient(cw / 2, ch / 2, ch * 0.25, cw / 2, ch / 2, ch * 0.72);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.48)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, cw, ch);

  if (game.flash > 0) {
    ctx.fillStyle = `rgba(255,77,141,${game.flash * 0.28})`;
    ctx.fillRect(0, 0, cw, ch);
  }
  if (game.phase === "pause" || game.phase === "over") {
    ctx.fillStyle = "rgba(5,8,16,0.45)";
    ctx.fillRect(0, 0, cw, ch);
  }
  ctx.restore();
}
