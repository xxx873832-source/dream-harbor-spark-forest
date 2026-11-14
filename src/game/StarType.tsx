import { useEffect, useRef, useState } from "react";
import { Crosshair, Keyboard, Pause, Play, RotateCcw, Shield, Trophy, Volume2, VolumeX } from "lucide-react";
import { AudioBus } from "./audio";
import { render, type Art } from "./draw";
import { Game, type Hud } from "./engine";
import type { Diff, Lang } from "./lexicon";

const SAVE_KEY = "xingjian-v1";

type Save = {
  best: Record<string, number>;
  lang: Lang;
  diff: Diff;
  muted: boolean;
};

const DIFFS: { id: Diff; label: string }[] = [
  { id: "easy", label: "新手" },
  { id: "normal", label: "标准" },
  { id: "expert", label: "专家" },
];

function loadSave(): Save | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<Save>;
    if (!data || typeof data !== "object" || !data.best) return null;
    return {
      best: data.best,
      lang: data.lang === "py" ? "py" : "en",
      diff: data.diff === "easy" || data.diff === "expert" ? data.diff : "normal",
      muted: Boolean(data.muted),
    };
  } catch {
    return null;
  }
}

function WordLine({ word, count }: { word: string; count: number }) {
  return (
    <p className="font-display text-xl font-bold tracking-wide break-all text-fg sm:text-3xl">
      {word.split("").map((ch, i) => (
        <span key={`${ch}-${i}`} className={i < count ? "text-primary" : i === count ? "text-accent" : "text-fg"}>
          {ch}
        </span>
      ))}
    </p>
  );
}

function Keypad({ onKey }: { onKey: (code: string) => void }) {
  const rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
  return (
    <div className="pointer-events-auto border-t border-border bg-bg/90 px-2 pt-2 pb-3 backdrop-blur-md">
      {rows.map((row) => (
        <div key={row} className="mb-1 flex justify-center gap-1">
          {row.split("").map((ch) => (
            <button
              key={ch}
              type="button"
              className="h-11 min-w-0 flex-1 rounded-md border border-border bg-surface font-display text-sm font-bold text-fg uppercase"
              onPointerDown={(event) => {
                event.preventDefault();
                onKey(ch);
              }}
            >
              {ch}
            </button>
          ))}
          {row.startsWith("z") ? (
            <button
              type="button"
              className="h-11 min-w-12 flex-1 rounded-md border border-border bg-surface px-2 text-sm text-muted"
              onPointerDown={(event) => {
                event.preventDefault();
                onKey("backspace");
              }}
            >
              退格
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function StarType() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<HTMLDivElement>(null);
  const [game] = useState(() => new Game());
  const audioRef = useRef<AudioBus | null>(null);
  if (!audioRef.current) audioRef.current = new AudioBus();
  const artRef = useRef<Art>({});
  const [hud, setHud] = useState<Hud>(() => game.hud());
  const [lang, setLang] = useState<Lang>("en");
  const [diff, setDiff] = useState<Diff>("normal");
  const [bestMap, setBestMap] = useState<Record<string, number>>({});
  const [muted, setMuted] = useState(false);
  const [touch, setTouch] = useState(false);
  const langRef = useRef(lang);
  const diffRef = useRef(diff);
  const bestRef = useRef(bestMap);
  const mutedRef = useRef(muted);
  langRef.current = lang;
  diffRef.current = diff;
  bestRef.current = bestMap;
  mutedRef.current = muted;

  function persist(next?: Partial<Save>) {
    const save: Save = {
      best: next?.best ?? bestRef.current,
      lang: next?.lang ?? langRef.current,
      diff: next?.diff ?? diffRef.current,
      muted: next?.muted ?? mutedRef.current,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  }

  function flush() {
    const audio = audioRef.current;
    const events = game.pullEvents();
    audio?.handle(events);
    const next = game.hud();
    if (events.some((event) => event.type === "over")) {
      const key = `${game.lang}:${game.diff}`;
      const merged = { ...bestRef.current, [key]: Math.max(bestRef.current[key] ?? 0, game.score) };
      bestRef.current = merged;
      setBestMap(merged);
      persist({ best: merged });
    }
    setHud(next);
  }

  function begin() {
    audioRef.current?.unlock();
    const key = `${langRef.current}:${diffRef.current}`;
    game.configure({
      lang: langRef.current,
      diff: diffRef.current,
      best: bestRef.current[key] ?? 0,
    });
    game.start();
    flush();
  }

  useEffect(() => {
    const saved = loadSave();
    if (saved) {
      setLang(saved.lang);
      setDiff(saved.diff);
      setBestMap(saved.best);
      setMuted(saved.muted);
      audioRef.current?.setMuted(saved.muted);
      bestRef.current = saved.best;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    const syncTouch = () => setTouch(coarse.matches || window.innerWidth < 760);
    syncTouch();
    coarse.addEventListener("change", syncTouch);
    window.addEventListener("resize", syncTouch);

    const art = artRef.current;
    for (const name of ["player", "scout", "raider", "brute", "boss", "nebula"] as const) {
      const img = new Image();
      img.src = name === "nebula" ? "/game/nebula.jpg" : `/game/${name}.png`;
      art[name] = img;
    }

    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const canvas = canvasRef.current;
      const wrap = wrapRef.current;
      if (canvas && wrap) {
        const cssW = wrap.clientWidth;
        const cssH = wrap.clientHeight;
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const bw = Math.max(1, Math.floor(cssW * dpr));
        const bh = Math.max(1, Math.floor(cssH * dpr));
        if (canvas.width !== bw || canvas.height !== bh) {
          canvas.width = bw;
          canvas.height = bh;
        }
        const padH = padRef.current?.offsetHeight ?? 0;
        game.inset = cssH > 0 ? padH / cssH : 0;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          const dt = Math.min(0.05, (now - last) / 1000);
          last = now;
          game.update(dt);
          render(ctx, cssW, cssH, game, art, reduce.matches);
          const events = game.pullEvents();
          if (events.length) {
            audioRef.current?.handle(events);
            if (events.some((event) => event.type === "over")) {
              const key = `${game.lang}:${game.diff}`;
              const merged = { ...bestRef.current, [key]: Math.max(bestRef.current[key] ?? 0, game.score) };
              bestRef.current = merged;
              setBestMap(merged);
              persist({ best: merged });
            }
          }
          const next = game.hud();
          setHud((prev) => {
            if (
              prev.phase === next.phase &&
              prev.sub === next.sub &&
              prev.score === next.score &&
              prev.combo === next.combo &&
              prev.hull === next.hull &&
              prev.wave === next.wave &&
              prev.buffer === next.buffer &&
              prev.focusWord === next.focusWord &&
              prev.matchCount === next.matchCount &&
              prev.wpm === next.wpm &&
              prev.accuracy === next.accuracy &&
              prev.slow === next.slow &&
              prev.isRecord === next.isRecord &&
              prev.best === next.best
            ) {
              return prev;
            }
            return next;
          });
        }
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.target instanceof HTMLElement && event.target.closest("button")) {
        if (event.code === "Enter" || event.code === "Space") return;
      }
      if (event.code === "Space") event.preventDefault();
      const phase = game.phase;
      if (event.code === "Escape") {
        if (phase === "play") game.pause();
        else if (phase === "pause") game.resume();
        flush();
        return;
      }
      if (event.code === "Enter") {
        event.preventDefault();
        if (phase === "menu" || phase === "over") begin();
        else if (phase === "pause") {
          game.resume();
          flush();
        }
        return;
      }
      if (phase !== "play") return;
      if (event.code === "Backspace") {
        event.preventDefault();
        game.backspace();
        flush();
        return;
      }
      if (event.repeat) return;
      const match = /^Key([A-Z])$/.exec(event.code);
      if (!match) return;
      event.preventDefault();
      game.type(match[1]!.toLowerCase());
      flush();
    };
    window.addEventListener("keydown", onKey);
    const onVis = () => {
      if (document.visibilityState === "visible") audioRef.current?.resume();
    };
    document.addEventListener("visibilitychange", onVis);

    const api = {
      press: (ch: string) => {
        game.type(ch.toLowerCase());
        flush();
      },
      backspace: () => {
        game.backspace();
        flush();
      },
      snapshot: () => game.snapshot(),
    };
    (window as unknown as { __star?: typeof api }).__star = api;

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", syncTouch);
      coarse.removeEventListener("change", syncTouch);
      document.removeEventListener("visibilitychange", onVis);
    };
    // Game loop owns the mutable session; menu choices are read through refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game]);

  const best = bestMap[`${lang}:${diff}`] ?? 0;
  const showPad = touch && (hud.phase === "play" || hud.phase === "pause");

  function toggleMute() {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    audioRef.current?.setMuted(next);
    persist({ muted: next });
  }

  return (
    <div ref={wrapRef} className="relative h-dvh w-full overflow-hidden bg-bg text-fg">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 flex flex-col">
        <header className="bg-gradient-to-b from-bg/85 to-transparent px-4 pt-4 pb-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs tracking-widest text-muted">分数</p>
              <p className="font-display text-2xl font-bold tabular-nums sm:text-3xl">{hud.score}</p>
              {hud.combo > 1 && hud.phase === "play" ? (
                <p className="font-display text-sm text-accent">连击 ×{hud.combo}</p>
              ) : (
                <p className="text-xs text-muted">最佳 {Math.max(best, hud.best)}</p>
              )}
            </div>
            <div className="min-w-0 flex-1 text-center">
              {hud.phase === "play" || hud.phase === "pause" ? (
                <>
                  <p className="text-xs tracking-widest text-muted">第 {hud.wave} 波{hud.bossWave ? " · 旗舰" : ""}</p>
                  {hud.focusWord ? (
                    <>
                      {hud.focusHanzi ? <p className="text-sm text-fg">{hud.focusHanzi}</p> : null}
                      <WordLine word={hud.focusWord} count={hud.buffer.length} />
                      {hud.matchCount > 1 ? (
                        <p className="text-xs text-muted">还有 {hud.matchCount - 1} 个候选，继续输入以区分</p>
                      ) : null}
                    </>
                  ) : (
                    <p className="pt-2 text-sm text-muted">输入字母，锁定敌舰</p>
                  )}
                  {hud.slow ? <p className="text-xs text-primary">缓速生效</p> : null}
                </>
              ) : (
                <p className="pt-2 font-display text-sm tracking-widest text-primary">STARTYPE</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="pointer-events-auto flex gap-2">
                <button
                  type="button"
                  className="grid h-11 w-11 place-items-center rounded-full border border-border bg-surface/80 text-fg"
                  onClick={toggleMute}
                  aria-label={muted ? "打开声音" : "关闭声音"}
                >
                  {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
                </button>
                {hud.phase === "play" ? (
                  <button
                    type="button"
                    className="grid h-11 w-11 place-items-center rounded-full border border-border bg-surface/80 text-fg"
                    onClick={() => {
                      game.pause();
                      flush();
                    }}
                    aria-label="暂停"
                  >
                    <Pause className="size-5" />
                  </button>
                ) : null}
              </div>
              <div className="flex gap-1" aria-label="船体">
                {Array.from({ length: hud.maxHull }, (_, i) => (
                  <span
                    key={i}
                    className={i < hud.hull ? "h-2 w-4 rounded-full bg-primary" : "h-2 w-4 rounded-full bg-border"}
                  />
                ))}
              </div>
              {hud.phase === "play" || hud.phase === "over" ? (
                <p className="text-xs text-muted tabular-nums">
                  {hud.accuracy}% · {hud.wpm} 字/分
                </p>
              ) : null}
            </div>
          </div>
        </header>

        <div className="relative flex-1">
          {hud.phase === "play" && hud.sub === "intro" ? (
            <div className="absolute inset-x-0 top-2 flex justify-center">
              <div className="text-center">
                <p className="font-display text-4xl font-bold sm:text-5xl">第 {hud.wave} 波</p>
                <p className="text-muted">{hud.bossWave ? "旗舰进入战场" : "击毁全部来舰"}</p>
              </div>
            </div>
          ) : null}
          {hud.phase === "play" && hud.sub === "clear" ? (
            <div className="absolute inset-x-0 top-2 flex justify-center">
              <p className="font-display text-3xl font-bold text-primary">波次清除</p>
            </div>
          ) : null}

          {hud.phase === "menu" ? (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-border bg-surface/90 p-6 shadow-2xl backdrop-blur-md">
                <p className="text-xs tracking-widest text-primary">键盘太空战</p>
                <h1 className="font-display text-5xl font-bold leading-none">星键歼灭</h1>
                <p className="mt-3 text-sm leading-6 text-muted">
                  敌舰顶着单词俯冲。敲对字母锁定，打完整个词就把它打下来。
                </p>
                <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-bg p-1">
                  {(
                    [
                      ["en", "英语"],
                      ["py", "拼音"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      className={
                        lang === id
                          ? "h-11 rounded-lg bg-primary font-medium text-on-primary"
                          : "h-11 rounded-lg text-muted"
                      }
                      onClick={() => {
                        setLang(id);
                        langRef.current = id;
                        persist({ lang: id });
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 rounded-xl bg-bg p-1">
                  {DIFFS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={
                        diff === item.id
                          ? "h-11 rounded-lg bg-primary text-sm font-medium text-on-primary"
                          : "h-11 rounded-lg text-sm text-muted"
                      }
                      onClick={() => {
                        setDiff(item.id);
                        diffRef.current = item.id;
                        persist({ diff: item.id });
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p className="mt-3 flex items-center gap-2 text-sm text-muted">
                  <Trophy className="size-4 text-accent" />
                  {best > 0 ? `最佳 ${best}` : "尚无纪录"}
                </p>
                <button
                  type="button"
                  className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-display text-lg font-bold text-on-primary"
                  onClick={begin}
                >
                  <Play className="size-5" />
                  出击
                </button>
                <ul className="mt-5 space-y-2 text-sm text-muted">
                  <li className="flex items-center gap-2">
                    <Keyboard className="size-4 shrink-0 text-primary" />
                    直接按键盘字母，拼音模式不用声调
                  </li>
                  <li className="flex items-center gap-2">
                    <Crosshair className="size-4 shrink-0 text-primary" />
                    退格删字，Esc 暂停。撞上座舰会掉船体
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="size-4 shrink-0 text-accent" />
                    金色词会给护盾、缓速或清场
                  </li>
                </ul>
              </div>
            </div>
          ) : null}

          {hud.phase === "pause" ? (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-border bg-surface/90 p-6 text-center backdrop-blur-md">
                <h2 className="font-display text-3xl font-bold">已暂停</h2>
                <p className="mt-2 text-sm text-muted">第 {hud.wave} 波 · {hud.score} 分</p>
                <button
                  type="button"
                  className="mt-5 h-12 w-full rounded-xl bg-primary font-display text-lg font-bold text-on-primary"
                  onClick={() => {
                    game.resume();
                    flush();
                  }}
                >
                  继续
                </button>
                <button
                  type="button"
                  className="mt-2 h-11 w-full rounded-xl border border-border text-muted"
                  onClick={() => {
                    game.toMenu();
                    flush();
                  }}
                >
                  返回标题
                </button>
              </div>
            </div>
          ) : null}

          {hud.phase === "over" ? (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-border bg-surface/92 p-6 text-center backdrop-blur-md">
                <p className="text-xs tracking-widest text-danger">座舰坠毁</p>
                <h2 className="font-display text-4xl font-bold">{hud.score}</h2>
                {hud.isRecord ? <p className="text-sm text-accent">新纪录</p> : <p className="text-sm text-muted">最佳 {hud.best}</p>}
                <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded-lg bg-bg p-2">
                    <dt className="text-xs text-muted">波次</dt>
                    <dd className="font-display text-lg">{hud.wave}</dd>
                  </div>
                  <div className="rounded-lg bg-bg p-2">
                    <dt className="text-xs text-muted">连击</dt>
                    <dd className="font-display text-lg">{hud.maxCombo}</dd>
                  </div>
                  <div className="rounded-lg bg-bg p-2">
                    <dt className="text-xs text-muted">准确</dt>
                    <dd className="font-display text-lg">{hud.accuracy}%</dd>
                  </div>
                </dl>
                <p className="mt-3 text-sm text-muted">手速 {hud.wpm} 字/分</p>
                <button
                  type="button"
                  className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-display text-lg font-bold text-on-primary"
                  onClick={begin}
                >
                  <RotateCcw className="size-5" />
                  再来一局
                </button>
                <button
                  type="button"
                  className="mt-2 h-11 w-full rounded-xl border border-border text-muted"
                  onClick={() => {
                    game.toMenu();
                    flush();
                  }}
                >
                  返回标题
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {showPad ? (
          <div ref={padRef} className="pointer-events-auto">
            <Keypad
              onKey={(code) => {
                audioRef.current?.unlock();
                if (code === "backspace") game.backspace();
                else game.type(code);
                flush();
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
