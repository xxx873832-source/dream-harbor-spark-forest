import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Shield, c as Pause, d as Crosshair, l as Music, n as Volume2, o as RotateCcw, r as Trophy, s as Play, t as VolumeX, u as Keyboard } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Bz3ErBZN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STEP = 60 / 98 / 4;
var LOOP = 64;
var BASS = [
	110,
	0,
	110,
	0,
	110,
	0,
	82.41,
	0,
	110,
	0,
	110,
	0,
	82.41,
	0,
	110,
	0,
	87.31,
	0,
	87.31,
	0,
	130.81,
	0,
	87.31,
	0,
	87.31,
	0,
	98,
	0,
	110,
	0,
	87.31,
	0,
	130.81,
	0,
	130.81,
	0,
	164.81,
	0,
	130.81,
	0,
	98,
	0,
	98,
	0,
	130.81,
	0,
	98,
	0,
	98,
	0,
	98,
	0,
	146.83,
	0,
	98,
	0,
	110,
	0,
	98,
	0,
	82.41,
	0,
	98,
	0
];
var LEAD = [
	329.63,
	0,
	0,
	0,
	523.25,
	0,
	440,
	0,
	392,
	0,
	0,
	0,
	329.63,
	0,
	0,
	0,
	293.66,
	0,
	329.63,
	0,
	349.23,
	0,
	0,
	0,
	329.63,
	0,
	293.66,
	0,
	261.63,
	0,
	0,
	0,
	440,
	0,
	0,
	0,
	392,
	0,
	329.63,
	0,
	293.66,
	0,
	329.63,
	0,
	392,
	0,
	0,
	0,
	329.63,
	0,
	293.66,
	0,
	261.63,
	0,
	0,
	0,
	293.66,
	0,
	329.63,
	0,
	440,
	0,
	0,
	0
];
var ARP = [
	523.25,
	659.25,
	783.99,
	659.25,
	587.33,
	523.25,
	440,
	392
];
var CHORDS = [
	[
		220,
		261.63,
		329.63
	],
	[
		174.61,
		220,
		261.63
	],
	[
		261.63,
		329.63,
		392
	],
	[
		196,
		246.94,
		293.66
	]
];
var AudioBus = class {
	ctx = null;
	master = null;
	musicGain = null;
	sfxGain = null;
	noiseBuf = null;
	timer = null;
	nextNote = 0;
	step = 0;
	scene = "calm";
	muted = false;
	music = true;
	failed = false;
	unlock() {
		if (this.failed) return;
		try {
			if (!this.ctx) {
				const ctx = new AudioContext();
				const master = ctx.createGain();
				master.gain.value = this.muted ? 0 : .5;
				master.connect(ctx.destination);
				const musicGain = ctx.createGain();
				musicGain.gain.value = 0;
				musicGain.connect(master);
				const sfxGain = ctx.createGain();
				sfxGain.gain.value = .9;
				sfxGain.connect(master);
				this.ctx = ctx;
				this.master = master;
				this.musicGain = musicGain;
				this.sfxGain = sfxGain;
				this.applyLevel();
				this.arm();
			}
			if (this.ctx.state === "suspended") this.ctx.resume();
			if (this.nextNote < this.ctx.currentTime) this.nextNote = this.ctx.currentTime + .06;
		} catch {
			this.failed = true;
		}
	}
	setMuted(muted) {
		this.muted = muted;
		this.ramp(this.master, muted ? 0 : .5);
	}
	setMusic(on) {
		this.music = on;
		this.applyLevel();
	}
	setScene(scene) {
		if (this.scene === scene) return;
		this.scene = scene;
		this.applyLevel();
	}
	status() {
		return {
			music: this.music,
			muted: this.muted,
			scene: this.scene,
			state: this.ctx?.state ?? "off"
		};
	}
	resume() {
		if (!this.ctx) return;
		if (this.ctx.state === "suspended") this.ctx.resume();
		if (this.nextNote < this.ctx.currentTime) this.nextNote = this.ctx.currentTime + .06;
	}
	handle(events) {
		if (!this.ctx || this.muted) return;
		for (const event of events) if (event.type === "tick") this.blip(880, .045, "square", .045);
		else if (event.type === "wrong") this.blip(event.hard ? 110 : 180, .07, "sawtooth", event.hard ? .05 : .03);
		else if (event.type === "kill") {
			this.noise(event.kind === "boss" ? .28 : .16, event.kind === "boss" ? .22 : .12);
			this.sweep(event.kind === "boss" ? 520 : 360, 90, .18, .05);
			if (event.power) this.chord([
				523,
				659,
				784
			], .18);
		} else if (event.type === "hurt") {
			this.noise(.22, .16);
			this.blip(70, .16, "sawtooth", .06);
		} else if (event.type === "wave") this.chord([
			392,
			494,
			587
		], .22);
		else if (event.type === "clear") this.chord([
			494,
			659,
			784
		], .16);
		else if (event.type === "over") this.sweep(320, 60, .4, .06);
	}
	applyLevel() {
		const level = !this.music ? 0 : this.scene === "boss" ? .78 : this.scene === "play" ? .62 : .4;
		this.ramp(this.musicGain, level);
	}
	ramp(node, value) {
		if (!node || !this.ctx) return;
		node.gain.setTargetAtTime(Math.max(1e-4, value), this.ctx.currentTime, .08);
		if (value === 0) node.gain.setTargetAtTime(0, this.ctx.currentTime + .2, .05);
	}
	arm() {
		if (this.timer || !this.ctx) return;
		this.nextNote = this.ctx.currentTime + .08;
		this.timer = setInterval(() => this.schedule(), 25);
	}
	schedule() {
		const ctx = this.ctx;
		if (!ctx || ctx.state !== "running") return;
		if (this.nextNote < ctx.currentTime - .2) this.nextNote = ctx.currentTime + .05;
		const horizon = ctx.currentTime + .16;
		while (this.nextNote < horizon) {
			if (this.music && !this.muted) this.playStep(this.step, this.nextNote);
			this.nextNote += STEP;
			this.step = (this.step + 1) % LOOP;
		}
	}
	playStep(step, time) {
		const calm = this.scene === "calm";
		const bass = BASS[step] ?? 0;
		if (bass) {
			this.musicTone(time, bass, STEP * 1.7, "sawtooth", calm ? .06 : .09, 460);
			this.musicTone(time, bass / 2, STEP * 1.7, "sine", .07, 180);
		}
		if (step % 16 === 0) {
			const chord = CHORDS[step / 16 % CHORDS.length] ?? CHORDS[0];
			for (const freq of chord) this.musicTone(time, freq, STEP * 14.5, "sine", calm ? .028 : .02, 880);
		}
		const arp = ARP[(step >> 1) % ARP.length] ?? 440;
		if (step % 2 === 1) this.musicTone(time, arp, STEP * 1.3, "sine", calm ? .03 : .022, 1500);
		if (calm) return;
		const lead = LEAD[step] ?? 0;
		if (lead) this.musicTone(time, lead, STEP * 1.55, "triangle", this.scene === "boss" ? .07 : .048, 1900);
		if (step % 16 === 0 || step % 16 === 8) this.kick(time);
		if (step % 2 === 1) this.hat(time, this.scene === "boss" ? .045 : .028);
		if (this.scene === "boss" && step % 8 === 4) this.musicTone(time, 880, .07, "square", .028, 2400);
	}
	musicTone(time, freq, dur, type, vol, cutoff) {
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
		gain.gain.setValueAtTime(1e-4, time);
		gain.gain.exponentialRampToValueAtTime(vol, time + .018);
		gain.gain.exponentialRampToValueAtTime(1e-4, time + Math.max(.05, dur));
		osc.connect(filter);
		filter.connect(gain);
		gain.connect(dest);
		osc.start(time);
		osc.stop(time + dur + .03);
	}
	kick(time) {
		const ctx = this.ctx;
		const dest = this.musicGain;
		if (!ctx || !dest) return;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = "sine";
		osc.frequency.setValueAtTime(150, time);
		osc.frequency.exponentialRampToValueAtTime(46, time + .12);
		gain.gain.setValueAtTime(.2, time);
		gain.gain.exponentialRampToValueAtTime(1e-4, time + .16);
		osc.connect(gain);
		gain.connect(dest);
		osc.start(time);
		osc.stop(time + .18);
	}
	hat(time, vol) {
		const ctx = this.ctx;
		const dest = this.musicGain;
		if (!ctx || !dest) return;
		if (!this.noiseBuf) {
			const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * .2), ctx.sampleRate);
			const data = buf.getChannelData(0);
			for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
			this.noiseBuf = buf;
		}
		const src = ctx.createBufferSource();
		src.buffer = this.noiseBuf;
		const filter = ctx.createBiquadFilter();
		filter.type = "highpass";
		filter.frequency.value = 7e3;
		const gain = ctx.createGain();
		gain.gain.setValueAtTime(vol, time);
		gain.gain.exponentialRampToValueAtTime(1e-4, time + .04);
		src.connect(filter);
		filter.connect(gain);
		gain.connect(dest);
		src.start(time);
		src.stop(time + .05);
	}
	blip(freq, dur, type, vol) {
		const ctx = this.ctx;
		const dest = this.sfxGain;
		if (!ctx || !dest) return;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = type;
		osc.frequency.value = freq;
		gain.gain.setValueAtTime(vol, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(1e-4, ctx.currentTime + dur);
		osc.connect(gain);
		gain.connect(dest);
		osc.start();
		osc.stop(ctx.currentTime + dur + .02);
	}
	sweep(from, to, dur, vol) {
		const ctx = this.ctx;
		const dest = this.sfxGain;
		if (!ctx || !dest) return;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = "sawtooth";
		osc.frequency.setValueAtTime(from, ctx.currentTime);
		osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), ctx.currentTime + dur);
		gain.gain.setValueAtTime(vol, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(1e-4, ctx.currentTime + dur);
		osc.connect(gain);
		gain.connect(dest);
		osc.start();
		osc.stop(ctx.currentTime + dur + .02);
	}
	chord(freqs, dur) {
		for (const freq of freqs) this.blip(freq, dur, "triangle", .035);
	}
	noise(dur, vol) {
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
};
var EN = [
	"ion",
	"ray",
	"sun",
	"arc",
	"jet",
	"pod",
	"ace",
	"sky",
	"gas",
	"orb",
	"rim",
	"bay",
	"void",
	"warp",
	"moon",
	"ship",
	"beam",
	"star",
	"dust",
	"hull",
	"dock",
	"fuel",
	"coil",
	"flux",
	"lens",
	"echo",
	"bolt",
	"glow",
	"rift",
	"dune",
	"halo",
	"wing",
	"sail",
	"core",
	"node",
	"mine",
	"apex",
	"gyro",
	"wake",
	"comet",
	"laser",
	"pulse",
	"drone",
	"flare",
	"orbit",
	"solar",
	"craft",
	"relay",
	"radar",
	"miner",
	"scout",
	"ranger",
	"hunter",
	"meteor",
	"photon",
	"plasma",
	"rocket",
	"vector",
	"nebula",
	"galaxy",
	"cosmic",
	"engine",
	"capsule",
	"station",
	"freighter",
	"asteroid",
	"pulsar",
	"quasar",
	"horizon",
	"thruster",
	"module",
	"beacon",
	"sentry",
	"corsair",
	"constellation",
	"hyperdrive",
	"lightspeed",
	"wormhole",
	"starbase",
	"celestial",
	"ioncannon",
	"starforge",
	"voidwalker",
	"eventide",
	"triton",
	"orion"
];
var PY = [
	["月", "yue"],
	["云", "yun"],
	["火", "huo"],
	["炮", "pao"],
	["门", "men"],
	["盾", "dun"],
	["猎", "lie"],
	["队", "dui"],
	["锁", "suo"],
	["雷", "lei"],
	["星", "xing"],
	["舰", "jian"],
	["战", "zhan"],
	["航", "hang"],
	["电", "dian"],
	["能", "neng"],
	["空", "kong"],
	["源", "yuan"],
	["光", "guang"],
	["曲速", "qusu"],
	["雷达", "leida"],
	["银河", "yinhe"],
	["机库", "jiku"],
	["导弹", "daodan"],
	["卫星", "weixing"],
	["流星", "liuxing"],
	["彗星", "huixing"],
	["星球", "xingqiu"],
	["星云", "xingyun"],
	["轨道", "guidao"],
	["引擎", "yinqing"],
	["脉冲", "maichong"],
	["光子", "guangzi"],
	["飞船", "feichuan"],
	["僚机", "liaoji"],
	["巡航", "xunhang"],
	["拦截", "lanjie"],
	["扫描", "saomiao"],
	["信标", "xinbiao"],
	["坐标", "zuobiao"],
	["跃迁", "yueqian"],
	["舰桥", "jianqiao"],
	["炮塔", "paota"],
	["能源", "nengyuan"],
	["驾驶", "jiashi"],
	["星际", "xingji"],
	["日冕", "rimian"],
	["星门", "xingmen"],
	["编队", "biandui"],
	["突击", "tuji"],
	["预警", "yujing"],
	["齐射", "qishe"],
	["穿甲", "chuanjia"],
	["能量", "nengliang"],
	["冷却", "lengque"],
	["过载", "guozai"],
	["母舰", "mujian"],
	["护卫", "huwei"],
	["驱逐", "quzhu"],
	["旗舰", "qijian"],
	["悬停", "xuanting"],
	["俯冲", "fuchong"],
	["规避", "guibi"],
	["火控", "huokong"],
	["瞄准", "miaozhun"],
	["尾焰", "weiyan"],
	["变轨", "biangui"],
	["虫洞", "chongdong"],
	["奇点", "qidian"],
	["时空", "shikong"],
	["光谱", "guangpu"],
	["射电", "shedian"],
	["量子", "liangzi"],
	["星风", "xingfeng"],
	["喷流", "penliu"],
	["星团", "xingtuan"],
	["耀斑", "yaoban"],
	["红移", "hongyi"],
	["蓝移", "lanyi"],
	["引力", "yinli"],
	["空间", "kongjian"],
	["舰队", "jiandui"],
	["太空", "taikong"],
	["行星", "xingxing"],
	["黑洞", "heidong"],
	["陨石", "yunshi"],
	["光年", "guangnian"],
	["曲率", "qulv"],
	["反应堆", "fanyingdui"],
	["空间站", "kongjianzhan"],
	["小行星", "xiaoxingxing"],
	["中子星", "zhongzixing"],
	["白矮星", "baiaixing"],
	["红巨星", "hongjuxing"],
	["超新星", "chaoxinxing"],
	["暗物质", "anwuzhi"]
];
var BOSSES_EN = [
	"andromeda",
	"supernova",
	"darkmatter",
	"lightspeed",
	"wormhole",
	"starforge",
	"eventhorizon",
	"celestial",
	"ionstorm",
	"voidheart",
	"orionbelt",
	"quarkstar"
];
var BOSSES_PY = [
	["猎户座", "liehuzuo"],
	["仙女座", "xiannvzuo"],
	["曲速引擎", "qusuyinqing"],
	["超光速", "chaoguangsu"],
	["暗物质海", "anwuzhihai"],
	["脉冲星", "maichongxing"],
	["银河中心", "yinhezhongxin"],
	["事件视界", "shijianshijie"],
	["航天母舰", "hangtianmujian"]
];
function enEntry(word) {
	return {
		word,
		display: word.toUpperCase(),
		hanzi: null
	};
}
function pyEntry(hanzi, word) {
	return {
		word,
		display: word,
		hanzi
	};
}
var WORDS = {
	en: EN.filter((w) => /^[a-z]+$/.test(w)).map(enEntry),
	py: PY.filter(([, w]) => /^[a-z]+$/.test(w)).map(([h, w]) => pyEntry(h, w))
};
var BOSSES = {
	en: BOSSES_EN.map(enEntry),
	py: BOSSES_PY.map(([h, w]) => pyEntry(h, w))
};
var POWER_WORDS = {
	en: {
		shield: enEntry("shield"),
		slow: enEntry("slow"),
		nova: enEntry("nova")
	},
	py: {
		shield: pyEntry("护盾", "hudun"),
		slow: pyEntry("缓速", "huansu"),
		nova: pyEntry("新星", "xinxing")
	}
};
var POWER_HINT = {
	shield: "回复船体",
	slow: "减缓全场",
	nova: "清空杂舰"
};
function conflicts(word, alive) {
	return alive.some((a) => a === word || a.startsWith(word) || word.startsWith(a));
}
function pickEntry(lang, minLen, maxLen, alive, boss) {
	const pool = boss ? BOSSES[lang] : WORDS[lang];
	const inBand = (e, slack) => e.word.length >= minLen && e.word.length <= maxLen + slack && !conflicts(e.word, alive);
	let cands = pool.filter((e) => inBand(e, 0));
	if (!cands.length) cands = pool.filter((e) => inBand(e, 4));
	if (!cands.length) cands = pool.filter((e) => !conflicts(e.word, alive));
	if (!cands.length) cands = pool;
	return cands[Math.floor(Math.random() * cands.length)];
}
var FONT = "Oxanium, 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'WenQuanYi Zen Hei', sans-serif";
var KIND_COLOR = {
	scout: "#ff6b5a",
	raider: "#c084fc",
	brute: "#ffb347",
	boss: "#ff4d8d"
};
function ready(img) {
	return !!img && img.complete && img.naturalWidth > 0;
}
function lerp(a, b, t) {
	return a + (b - a) * t;
}
function roundRect(ctx, x, y, w, h, r) {
	const rr = Math.min(r, w / 2, h / 2);
	ctx.beginPath();
	ctx.moveTo(x + rr, y);
	ctx.arcTo(x + w, y, x + w, y + h, rr);
	ctx.arcTo(x + w, y + h, x, y + h, rr);
	ctx.arcTo(x, y + h, x, y, rr);
	ctx.arcTo(x, y, x + w, y, rr);
	ctx.closePath();
}
function spriteBox(kind, img, cw, ch) {
	let h = ch * (kind === "player" ? .16 : kind === "scout" ? .11 : kind === "raider" ? .13 : kind === "brute" ? .15 : .24);
	let w = ready(img) ? h * (img.width / img.height) : h * .72;
	const maxW = cw * (kind === "boss" ? .58 : kind === "player" ? .32 : .3);
	if (w > maxW) {
		w = maxW;
		h = ready(img) ? w * (img.height / img.width) : w * 1.2;
	}
	return {
		w,
		h
	};
}
function drawShip(ctx, img, kind, x, y, cw, ch, rot) {
	const box = spriteBox(kind, img, cw, ch);
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(rot);
	if (ready(img)) ctx.drawImage(img, -box.w / 2, -box.h / 2, box.w, box.h);
	else {
		ctx.fillStyle = kind === "player" ? "#3ee0ff" : KIND_COLOR[kind];
		ctx.beginPath();
		ctx.moveTo(0, -box.h / 2);
		ctx.lineTo(box.w / 2, box.h / 2);
		ctx.lineTo(0, box.h * .28);
		ctx.lineTo(-box.w / 2, box.h / 2);
		ctx.closePath();
		ctx.fill();
	}
	ctx.restore();
	return box;
}
function drawLabel(ctx, enemy, x, y, spriteH, cw, ch, progress, focused, error) {
	const letters = (enemy.hanzi ? enemy.word : enemy.word.toUpperCase()).split("");
	const single = letters.length === 1;
	let gap = single ? 42 : Math.min(26, Math.max(15, cw * .02));
	let total = letters.length * gap;
	const maxTotal = cw * .86;
	if (total > maxTotal) {
		gap = maxTotal / letters.length;
		total = maxTotal;
	}
	const hanzi = enemy.hanzi;
	const hint = enemy.power ? POWER_HINT[enemy.power] : "";
	const size = single ? Math.max(28, cw * .045) : Math.max(13, gap * .92);
	const hanziSize = Math.max(15, size * 1.05);
	const hintSize = 11;
	const pips = enemy.maxHp > 1;
	const plateH = size + 16 + (hanzi ? hanziSize + 4 : 0) + (hint ? 15 : 0) + (pips ? 12 : 0);
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
		const pipStart = left + plateW / 2 - (enemy.maxHp - 1) * pipGap / 2;
		for (let i = 0; i < enemy.maxHp; i++) {
			ctx.beginPath();
			ctx.arc(pipStart + i * pipGap, pipY, 3, 0, Math.PI * 2);
			ctx.fillStyle = i < enemy.hp ? "#ffb347" : "rgba(231,243,255,0.25)";
			ctx.fill();
		}
	}
	ctx.restore();
	return {
		top,
		plateH,
		plateW
	};
}
function render(ctx, cw, ch, game, art, reduced) {
	ctx.clearRect(0, 0, cw, ch);
	ctx.save();
	if (!reduced && game.shake > .01) {
		const mag = game.shake * game.shake * 16;
		ctx.translate((Math.random() - .5) * mag, (Math.random() - .5) * mag);
	}
	const bg = ctx.createLinearGradient(0, 0, 0, ch);
	bg.addColorStop(0, "#050814");
	bg.addColorStop(1, "#10203a");
	ctx.fillStyle = bg;
	ctx.fillRect(-30, -30, cw + 60, ch + 60);
	const nebula = art.nebula;
	if (ready(nebula)) {
		const scale = Math.max(cw / nebula.width, ch / nebula.height);
		const dw = nebula.width * scale;
		const dh = nebula.height * scale;
		const ox = (cw - dw) / 2 + Math.sin(game.time * .05) * 16;
		const oy = (ch - dh) / 2 + Math.cos(game.time * .04) * 10;
		ctx.globalAlpha = .62;
		ctx.drawImage(nebula, ox, oy, dw, dh);
		ctx.globalAlpha = 1;
	}
	for (const star of game.stars) {
		ctx.fillStyle = `rgba(231,243,255,${.25 + star.z * .75})`;
		ctx.fillRect(star.x * cw, star.y * ch, star.s, star.s);
	}
	const py = game.playerY() * ch;
	const kill = game.killY();
	let nearest = 0;
	for (const enemy of game.enemies) nearest = Math.max(nearest, enemy.y / Math.max(.2, kill));
	if (nearest > .68) {
		const danger = ctx.createLinearGradient(0, ch * .55, 0, ch);
		danger.addColorStop(0, "rgba(255,77,141,0)");
		danger.addColorStop(1, `rgba(255,77,141,${(nearest - .68) * .55})`);
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
			ctx.globalAlpha = enemy.power ? .35 : .22;
			const glow = ctx.createRadialGradient(x, y, 4, x, y, ch * .08);
			glow.addColorStop(0, enemy.power ? "#ffb347" : "#3ee0ff");
			glow.addColorStop(1, "rgba(0,0,0,0)");
			ctx.fillStyle = glow;
			ctx.beginPath();
			ctx.arc(x, y, ch * .08, 0, Math.PI * 2);
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
		const t0 = Math.max(0, shot.p - .14);
		const x1 = lerp(shot.sx, shot.tx, t0) * cw;
		const y1 = lerp(shot.sy, shot.ty, t0) * ch;
		const x2 = lerp(shot.sx, shot.tx, Math.min(1, shot.p)) * cw;
		const y2 = lerp(shot.sy, shot.ty, Math.min(1, shot.p)) * ch;
		ctx.save();
		ctx.strokeStyle = shot.color;
		ctx.globalAlpha = .95;
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
		ctx.globalAlpha = game.muzzle / .08;
		ctx.fillStyle = "#e7f3ff";
		ctx.beginPath();
		ctx.arc(px, py + bob - ch * .07, 8 + (1 - game.muzzle / .08) * 10, 0, Math.PI * 2);
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
	const vignette = ctx.createRadialGradient(cw / 2, ch / 2, ch * .25, cw / 2, ch / 2, ch * .72);
	vignette.addColorStop(0, "rgba(0,0,0,0)");
	vignette.addColorStop(1, "rgba(0,0,0,0.48)");
	ctx.fillStyle = vignette;
	ctx.fillRect(0, 0, cw, ch);
	if (game.flash > 0) {
		ctx.fillStyle = `rgba(255,77,141,${game.flash * .28})`;
		ctx.fillRect(0, 0, cw, ch);
	}
	if (game.phase === "pause" || game.phase === "over") {
		ctx.fillStyle = "rgba(5,8,16,0.45)";
		ctx.fillRect(0, 0, cw, ch);
	}
	ctx.restore();
}
var MAX_HULL = 5;
function clamp(n, a, b) {
	return Math.max(a, Math.min(b, n));
}
function lenRange(diff, wave, boss) {
	if (boss) {
		const n = diff === "easy" ? 6 + Math.floor(wave / 5) : diff === "normal" ? 7 + Math.floor(wave / 5) : 8 + Math.floor(wave / 5);
		return [n, n + 3];
	}
	const grow = Math.floor((wave - 1) / 3);
	if (diff === "easy") return [3, Math.min(6, 4 + grow)];
	if (diff === "normal") return [3, Math.min(9, 5 + grow)];
	return [4, Math.min(12, 7 + grow)];
}
var Game = class {
	phase = "menu";
	sub = "intro";
	lang = "en";
	diff = "normal";
	mode = "word";
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
	playerX = .5;
	spawned = 0;
	quota = 4;
	bossSpawned = false;
	spawnTimer = .4;
	exhaust = 0;
	enemies = [];
	particles = [];
	shots = [];
	floaters = [];
	stars = [];
	events = [];
	nextId = 1;
	constructor() {
		this.stars = Array.from({ length: 140 }, () => ({
			x: Math.random(),
			y: Math.random(),
			z: Math.random(),
			s: .4 + Math.random() * 1.6
		}));
	}
	configure(opts) {
		this.lang = opts.lang;
		this.diff = opts.diff;
		this.mode = opts.mode;
		this.best = opts.best;
		this.prevBest = opts.best;
	}
	playerY() {
		return Math.max(.46, .84 - this.inset);
	}
	killY() {
		return this.playerY() - .04;
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
		this.introT = .9;
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
	hud() {
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
			accuracy: total ? Math.round(this.correct / total * 100) : 100,
			wpm: this.playTime < .5 ? 0 : Math.round(this.correct / 5 / (this.playTime / 60)),
			buffer: this.buffer,
			focusWord: focus ? focus.hanzi ? focus.word : focus.word.toUpperCase() : "",
			focusHanzi: focus?.hanzi ?? null,
			matchCount: matches.length,
			slow: this.slowT > 0,
			best: Math.max(this.best, this.prevBest),
			isRecord: this.isRecord,
			lang: this.lang,
			diff: this.diff,
			mode: this.mode
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
			enemies: this.enemies.map((e) => ({
				word: e.word,
				y: +e.y.toFixed(3),
				kind: e.kind,
				hanzi: e.hanzi
			}))
		};
	}
	pullEvents() {
		const ev = this.events;
		this.events = [];
		return ev;
	}
	type(ch) {
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
			this.muzzle = .07;
			this.events.push({ type: "tick" });
			return;
		}
		this.miss(this.buffer.length > 0);
	}
	backspace() {
		if (this.phase !== "play" || this.sub !== "combat" || this.mode === "letter") return;
		this.buffer = this.buffer.slice(0, -1);
	}
	typeLetter(ch) {
		const hits = this.enemies.filter((enemy) => enemy.word === ch);
		if (!hits.length) {
			this.miss(true);
			return;
		}
		this.correct += 1;
		const target = this.closest(hits);
		target.hp -= 1;
		this.muzzle = .07;
		this.events.push({ type: "tick" });
		if (target.hp > 0) {
			this.fire(target);
			this.burst(target.x, target.y, 8, "#ffb347");
			this.shake = Math.min(1, this.shake + .12);
			this.floaters.push({
				x: target.x,
				y: target.y - .04,
				text: `${target.hp}`,
				life: .45,
				max: .45,
				color: "#ffb347"
			});
			return;
		}
		this.destroy(target);
	}
	miss(hard) {
		this.wrong += 1;
		if (hard) {
			const prev = this.combo;
			this.combo = 0;
			this.shake = Math.min(1, this.shake + .22);
			this.errorT = .16;
			if (prev >= 3) this.floaters.push({
				x: this.playerX,
				y: this.playerY() - .06,
				text: "连击中断",
				life: .7,
				max: .7,
				color: "#ff4d8d"
			});
		}
		this.events.push({
			type: "wrong",
			hard
		});
	}
	focus() {
		const list = this.matches();
		if (!list.length) return null;
		return this.closest(list);
	}
	progressOf(enemy) {
		if (this.buffer && enemy.word.startsWith(this.buffer)) return this.buffer.length;
		return 0;
	}
	update(dt) {
		const step = Math.min(dt, .05);
		this.time += step;
		this.shake = Math.max(0, this.shake - step * 1.5);
		this.flash = Math.max(0, this.flash - step * 1.7);
		this.errorT = Math.max(0, this.errorT - step);
		this.muzzle = Math.max(0, this.muzzle - step);
		if (this.slowT > 0) this.slowT = Math.max(0, this.slowT - step);
		const starSpeed = this.phase === "play" ? 1 : .45;
		for (const star of this.stars) {
			star.y += (.012 + star.z * .05) * starSpeed * step;
			if (star.y > 1) {
				star.y = 0;
				star.x = Math.random();
			}
		}
		this.updateFx(step);
		if (this.phase === "menu") {
			const tx = .5 + Math.sin(this.time * .35) * .1;
			this.playerX += (tx - this.playerX) * Math.min(1, step * 2);
			this.exhaustStep(step);
			return;
		}
		if (this.phase === "pause" || this.phase === "over") return;
		this.playTime += step;
		const focus = this.focus();
		const tx = focus ? focus.x : .5;
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
				this.introT = .85;
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
		const slow = this.slowT > 0 ? .42 : 1;
		for (let i = this.enemies.length - 1; i >= 0; i--) {
			const enemy = this.enemies[i];
			enemy.y += enemy.speed * slow * step;
			enemy.x += Math.sin(this.time * .85 + enemy.wobble) * .035 * step;
			enemy.x = clamp(enemy.x, .1, .9);
			if (enemy.y >= this.killY()) {
				this.enemies.splice(i, 1);
				this.hullHit(enemy.kind === "boss" ? 2 : 1);
			}
		}
		this.separate();
		if (this.buffer && !this.enemies.some((e) => e.word.startsWith(this.buffer))) this.buffer = "";
		this.maybeClear();
	}
	matches() {
		if (!this.buffer) return [];
		return this.enemies.filter((e) => e.word.startsWith(this.buffer));
	}
	closest(list) {
		return list.reduce((a, b) => b.y > a.y ? b : a);
	}
	beginWave() {
		this.spawned = 0;
		this.bossSpawned = false;
		this.buffer = "";
		this.quota = this.mode === "letter" ? this.wave % 5 === 0 ? 6 + Math.floor(this.wave / 5) : 8 + this.wave : this.wave % 5 === 0 ? 3 + Math.floor(this.wave / 5) : 3 + this.wave;
		this.spawnTimer = .28;
	}
	maxAlive() {
		if (this.mode === "letter") {
			const base = this.diff === "easy" ? 4 : this.diff === "normal" ? 5 : 7;
			return Math.min(8, base + Math.floor((this.wave - 1) / 3));
		}
		const base = this.diff === "easy" ? 2 : this.diff === "normal" ? 3 : 4;
		return Math.min(7, base + Math.floor((this.wave - 1) / 2));
	}
	interval() {
		const m = this.diff === "easy" ? 1.18 : this.diff === "normal" ? 1 : .84;
		if (this.mode === "letter") return Math.max(.48, (1.25 - this.wave * .045) * m);
		return Math.max(.7, (2.2 - this.wave * .07) * m);
	}
	speedFor(kind) {
		const diffMul = this.diff === "easy" ? .78 : this.diff === "normal" ? 1 : 1.18;
		let speed = (.04 + (this.wave - 1) * .0042) * diffMul;
		if (this.mode === "letter") speed *= 1.15;
		if (kind === "scout") speed *= 1.08;
		if (kind === "raider") speed *= .94;
		if (kind === "brute") speed *= .8;
		if (kind === "boss") speed *= .58;
		return Math.min(speed, kind === "boss" ? .85 / 16 : .85 / 6.2);
	}
	nextKind() {
		if (this.wave % 5 === 0 && !this.bossSpawned && this.spawned >= 1) {
			this.bossSpawned = true;
			return "boss";
		}
		const roll = Math.random();
		if (this.wave >= 4 && roll < .2) return "brute";
		if (this.wave >= 2 && roll < .55) return "raider";
		return "scout";
	}
	spawn() {
		const kind = this.nextKind();
		const alive = this.enemies.map((e) => e.word);
		let entry;
		let power = null;
		if (this.mode === "letter") {
			entry = {
				word: this.pickLetter(alive),
				display: "",
				hanzi: null
			};
			const powerFree = !this.enemies.some((e) => e.power);
			if (kind !== "boss" && this.wave >= 2 && powerFree && Math.random() < .14) {
				const options = [
					"shield",
					"slow",
					"nova"
				];
				power = options[Math.floor(Math.random() * options.length)];
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
			if (kind !== "boss" && this.wave >= 2 && powerFree && Math.random() < .16) {
				const options = [
					"shield",
					"slow",
					"nova"
				];
				const choice = options[Math.floor(Math.random() * options.length)];
				const word = POWER_WORDS[this.lang][choice];
				if (!conflicts(word.word, alive)) {
					entry = word;
					power = choice;
				}
			}
		}
		const hp = this.mode === "letter" && kind === "boss" ? Math.min(5, 2 + Math.floor(this.wave / 5)) : 1;
		let x = .2 + Math.random() * .6;
		for (let n = 0; n < 8; n++) {
			const tryX = .14 + Math.random() * .72;
			if (this.enemies.every((e) => Math.abs(e.x - tryX) > .12 || Math.abs(e.y) > .2)) {
				x = tryX;
				break;
			}
		}
		this.enemies.push({
			id: this.nextId++,
			kind,
			x,
			y: -.04,
			speed: this.speedFor(kind),
			wobble: Math.random() * Math.PI * 2,
			word: entry.word,
			hanzi: entry.hanzi,
			power,
			hp,
			maxHp: hp
		});
		this.spawned += 1;
	}
	pickLetter(alive) {
		const used = new Set(alive);
		const free = "abcdefghijklmnopqrstuvwxyz".split("").filter((ch) => !used.has(ch));
		const pool = free.length ? free : "abcdefghijklmnopqrstuvwxyz".split("");
		return pool[Math.floor(Math.random() * pool.length)];
	}
	separate() {
		const list = this.enemies;
		for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
			const a = list[i];
			const b = list[j];
			const dx = b.x - a.x;
			if (Math.abs(dx) < .1 && Math.abs(b.y - a.y) < .09) {
				const push = (.1 - Math.abs(dx)) * .35;
				const sign = Math.sign(dx || (i % 2 ? 1 : -1));
				a.x = clamp(a.x - sign * push, .1, .9);
				b.x = clamp(b.x + sign * push, .1, .9);
			}
		}
	}
	fire(target) {
		this.shots.push({
			sx: this.playerX,
			sy: this.playerY() - .03,
			tx: target.x,
			ty: target.y,
			p: 0,
			color: target.power ? "#ffb347" : "#3ee0ff"
		});
	}
	destroy(enemy) {
		this.combo += 1;
		this.maxCombo = Math.max(this.maxCombo, this.combo);
		const mult = 1 + (this.combo - 1) * .14;
		const diffM = this.diff === "easy" ? .85 : this.diff === "normal" ? 1 : 1.35;
		const base = this.mode === "letter" ? 42 : enemy.word.length * 22;
		let pts = Math.round(base * mult * diffM);
		if (enemy.kind === "boss") pts = Math.round(pts * 2.6);
		if (enemy.power) pts = Math.round(pts * 1.2);
		this.score += pts;
		this.floaters.push({
			x: enemy.x,
			y: enemy.y,
			text: `+${pts}`,
			life: .75,
			max: .75,
			color: "#ffb347"
		});
		this.burst(enemy.x, enemy.y, enemy.kind === "boss" ? 28 : 16, enemy.power ? "#ffb347" : "#3ee0ff");
		this.fire(enemy);
		this.muzzle = .08;
		this.shake = Math.min(1, this.shake + (enemy.kind === "boss" ? .7 : .3));
		this.hitstop = enemy.kind === "boss" ? .07 : .04;
		if (enemy.power === "shield") {
			if (this.hull < MAX_HULL) this.hull += 1;
			else this.score += 150;
		} else if (enemy.power === "slow") this.slowT = 5.5;
		else if (enemy.power === "nova") {
			const victims = this.enemies.filter((o) => o.kind !== "boss" && o.id !== enemy.id);
			for (const other of victims) {
				this.score += 40;
				this.burst(other.x, other.y, 10, "#ffb347");
				this.floaters.push({
					x: other.x,
					y: other.y,
					text: "+40",
					life: .6,
					max: .6,
					color: "#ffb347"
				});
			}
			this.enemies = this.enemies.filter((o) => o.kind === "boss" && o.id !== enemy.id);
			this.events.push({
				type: "kill",
				kind: enemy.kind,
				power: enemy.power
			});
			this.maybeClear();
			return;
		}
		this.enemies = this.enemies.filter((o) => o.id !== enemy.id);
		this.events.push({
			type: "kill",
			kind: enemy.kind,
			power: enemy.power
		});
		this.maybeClear();
	}
	maybeClear() {
		if (this.phase !== "play" || this.sub !== "combat" || this.hull <= 0) return;
		if (this.spawned >= this.quota && this.enemies.length === 0) {
			this.sub = "clear";
			this.clearT = 1.05;
			this.buffer = "";
			this.events.push({ type: "clear" });
		}
	}
	hullHit(dmg) {
		if (this.phase !== "play") return;
		this.hull = Math.max(0, this.hull - dmg);
		this.combo = 0;
		this.buffer = "";
		this.shake = Math.min(1, this.shake + .85);
		this.flash = 1;
		this.hitstop = .09;
		this.burst(this.playerX, this.playerY(), 18, "#ff4d8d");
		this.events.push({ type: "hurt" });
		if (this.hull <= 0) {
			this.phase = "over";
			this.isRecord = this.score > this.prevBest && this.score > 0;
			if (this.isRecord) this.best = this.score;
			this.events.push({ type: "over" });
		}
	}
	burst(x, y, count, color) {
		for (let i = 0; i < count; i++) {
			const a = Math.random() * Math.PI * 2;
			const s = .08 + Math.random() * .28;
			const life = .28 + Math.random() * .35;
			this.particles.push({
				x,
				y,
				vx: Math.cos(a) * s,
				vy: Math.sin(a) * s,
				life,
				max: life,
				size: 1.5 + Math.random() * 3.2,
				color
			});
		}
		if (this.particles.length > 420) this.particles.splice(0, this.particles.length - 420);
	}
	exhaustStep(step) {
		this.exhaust -= step;
		if (this.exhaust > 0) return;
		this.exhaust = .04;
		const life = .28;
		this.particles.push({
			x: this.playerX + (Math.random() - .5) * .012,
			y: this.playerY() + .045,
			vx: (Math.random() - .5) * .02,
			vy: .08 + Math.random() * .06,
			life,
			max: life,
			size: 2 + Math.random() * 2,
			color: Math.random() > .4 ? "#ffb347" : "#3ee0ff"
		});
	}
	updateFx(step) {
		for (let i = this.particles.length - 1; i >= 0; i--) {
			const p = this.particles[i];
			p.life -= step;
			p.x += p.vx * step;
			p.y += p.vy * step;
			if (p.life <= 0) this.particles.splice(i, 1);
		}
		for (let i = this.floaters.length - 1; i >= 0; i--) {
			const f = this.floaters[i];
			f.life -= step;
			f.y -= .05 * step;
			if (f.life <= 0) this.floaters.splice(i, 1);
		}
		for (let i = this.shots.length - 1; i >= 0; i--) {
			const s = this.shots[i];
			s.p += step * 3.4;
			if (s.p >= 1) {
				this.burst(s.tx, s.ty, 5, s.color);
				this.shots.splice(i, 1);
			}
		}
	}
};
var SAVE_KEY = "xingjian-v1";
var DIFFS = [
	{
		id: "easy",
		label: "新手"
	},
	{
		id: "normal",
		label: "标准"
	},
	{
		id: "expert",
		label: "专家"
	}
];
function bestKey(mode, lang, diff) {
	return mode === "letter" ? `letter:${diff}` : `${lang}:${diff}`;
}
function loadSave() {
	try {
		const raw = localStorage.getItem(SAVE_KEY);
		if (!raw) return null;
		const data = JSON.parse(raw);
		if (!data || typeof data !== "object" || !data.best) return null;
		return {
			best: data.best,
			lang: data.lang === "py" ? "py" : "en",
			diff: data.diff === "easy" || data.diff === "expert" ? data.diff : "normal",
			mode: data.mode === "letter" ? "letter" : "word",
			muted: Boolean(data.muted),
			music: data.music !== false
		};
	} catch {
		return null;
	}
}
function WordLine({ word, count }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "font-display text-xl font-bold tracking-wide break-all text-fg sm:text-3xl",
		children: word.split("").map((ch, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: i < count ? "text-primary" : i === count ? "text-accent" : "text-fg",
			children: ch
		}, `${ch}-${i}`))
	});
}
function Keypad({ onKey, letter }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-auto border-t border-border bg-bg/90 px-2 pt-2 pb-3 backdrop-blur-md",
		children: [
			"qwertyuiop",
			"asdfghjkl",
			"zxcvbnm"
		].map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-1 flex justify-center gap-1",
			children: [row.split("").map((ch) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "h-11 min-w-0 flex-1 rounded-md border border-border bg-surface font-display text-sm font-bold text-fg uppercase",
				onPointerDown: (event) => {
					event.preventDefault();
					onKey(ch);
				},
				children: ch
			}, ch)), row.startsWith("z") && !letter ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "h-11 min-w-12 flex-1 rounded-md border border-border bg-surface px-2 text-sm text-muted",
				onPointerDown: (event) => {
					event.preventDefault();
					onKey("backspace");
				},
				children: "退格"
			}) : null]
		}, row))
	});
}
function StarType() {
	const wrapRef = (0, import_react.useRef)(null);
	const canvasRef = (0, import_react.useRef)(null);
	const padRef = (0, import_react.useRef)(null);
	const [game] = (0, import_react.useState)(() => new Game());
	const audioRef = (0, import_react.useRef)(null);
	if (!audioRef.current) audioRef.current = new AudioBus();
	const artRef = (0, import_react.useRef)({});
	const [hud, setHud] = (0, import_react.useState)(() => game.hud());
	const [lang, setLang] = (0, import_react.useState)("en");
	const [diff, setDiff] = (0, import_react.useState)("normal");
	const [mode, setMode] = (0, import_react.useState)("word");
	const [bestMap, setBestMap] = (0, import_react.useState)({});
	const [muted, setMuted] = (0, import_react.useState)(false);
	const [musicOn, setMusicOn] = (0, import_react.useState)(true);
	const [touch, setTouch] = (0, import_react.useState)(false);
	const langRef = (0, import_react.useRef)(lang);
	const diffRef = (0, import_react.useRef)(diff);
	const modeRef = (0, import_react.useRef)(mode);
	const bestRef = (0, import_react.useRef)(bestMap);
	const mutedRef = (0, import_react.useRef)(muted);
	const musicRef = (0, import_react.useRef)(musicOn);
	langRef.current = lang;
	diffRef.current = diff;
	modeRef.current = mode;
	bestRef.current = bestMap;
	mutedRef.current = muted;
	musicRef.current = musicOn;
	function persist(next) {
		const save = {
			best: next?.best ?? bestRef.current,
			lang: next?.lang ?? langRef.current,
			diff: next?.diff ?? diffRef.current,
			mode: next?.mode ?? modeRef.current,
			muted: next?.muted ?? mutedRef.current,
			music: next?.music ?? musicRef.current
		};
		localStorage.setItem(SAVE_KEY, JSON.stringify(save));
	}
	function flush() {
		const audio = audioRef.current;
		const events = game.pullEvents();
		audio?.handle(events);
		const next = game.hud();
		if (events.some((event) => event.type === "over")) {
			const key = bestKey(game.mode, game.lang, game.diff);
			const merged = {
				...bestRef.current,
				[key]: Math.max(bestRef.current[key] ?? 0, game.score)
			};
			bestRef.current = merged;
			setBestMap(merged);
			persist({ best: merged });
		}
		setHud(next);
	}
	function begin() {
		audioRef.current?.unlock();
		const key = bestKey(modeRef.current, langRef.current, diffRef.current);
		game.configure({
			lang: langRef.current,
			diff: diffRef.current,
			mode: modeRef.current,
			best: bestRef.current[key] ?? 0
		});
		game.start();
		flush();
	}
	(0, import_react.useEffect)(() => {
		const saved = loadSave();
		if (saved) {
			setLang(saved.lang);
			setDiff(saved.diff);
			setMode(saved.mode);
			setBestMap(saved.best);
			setMuted(saved.muted);
			setMusicOn(saved.music);
			audioRef.current?.setMuted(saved.muted);
			audioRef.current?.setMusic(saved.music);
			bestRef.current = saved.best;
		}
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
		const coarse = window.matchMedia("(pointer: coarse)");
		const syncTouch = () => setTouch(coarse.matches || window.innerWidth < 760);
		syncTouch();
		coarse.addEventListener("change", syncTouch);
		window.addEventListener("resize", syncTouch);
		const art = artRef.current;
		for (const name of [
			"player",
			"scout",
			"raider",
			"brute",
			"boss",
			"nebula"
		]) {
			const img = new Image();
			img.src = name === "nebula" ? "/game/nebula.jpg" : `/game/${name}.png`;
			art[name] = img;
		}
		let frame = 0;
		let last = performance.now();
		const loop = (now) => {
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
					const dt = Math.min(.05, (now - last) / 1e3);
					last = now;
					game.update(dt);
					const scene = game.phase === "play" && game.wave % 5 === 0 ? "boss" : game.phase === "play" ? "play" : "calm";
					audioRef.current?.setScene(scene);
					render(ctx, cssW, cssH, game, art, reduce.matches);
					const events = game.pullEvents();
					if (events.length) {
						audioRef.current?.handle(events);
						if (events.some((event) => event.type === "over")) {
							const key = bestKey(game.mode, game.lang, game.diff);
							const merged = {
								...bestRef.current,
								[key]: Math.max(bestRef.current[key] ?? 0, game.score)
							};
							bestRef.current = merged;
							setBestMap(merged);
							persist({ best: merged });
						}
					}
					const next = game.hud();
					setHud((prev) => {
						if (prev.phase === next.phase && prev.sub === next.sub && prev.score === next.score && prev.combo === next.combo && prev.hull === next.hull && prev.wave === next.wave && prev.buffer === next.buffer && prev.focusWord === next.focusWord && prev.matchCount === next.matchCount && prev.wpm === next.wpm && prev.accuracy === next.accuracy && prev.slow === next.slow && prev.isRecord === next.isRecord && prev.best === next.best) return prev;
						return next;
					});
				}
			}
			frame = requestAnimationFrame(loop);
		};
		frame = requestAnimationFrame(loop);
		const onKey = (event) => {
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
			game.type(match[1].toLowerCase());
			flush();
		};
		window.addEventListener("keydown", onKey);
		const onVis = () => {
			if (document.visibilityState === "visible") audioRef.current?.resume();
		};
		document.addEventListener("visibilitychange", onVis);
		window.__star = {
			press: (ch) => {
				game.type(ch.toLowerCase());
				flush();
			},
			backspace: () => {
				game.backspace();
				flush();
			},
			snapshot: () => game.snapshot(),
			audio: () => audioRef.current?.status() ?? null
		};
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("keydown", onKey);
			window.removeEventListener("resize", syncTouch);
			coarse.removeEventListener("change", syncTouch);
			document.removeEventListener("visibilitychange", onVis);
		};
	}, [game]);
	const best = bestMap[bestKey(mode, lang, diff)] ?? 0;
	const showPad = touch && (hud.phase === "play" || hud.phase === "pause");
	function toggleMusic() {
		const next = !musicRef.current;
		musicRef.current = next;
		setMusicOn(next);
		audioRef.current?.unlock();
		audioRef.current?.setMusic(next);
		persist({ music: next });
	}
	function toggleMute() {
		const next = !mutedRef.current;
		mutedRef.current = next;
		setMuted(next);
		audioRef.current?.setMuted(next);
		persist({ muted: next });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: wrapRef,
		className: "relative h-dvh w-full overflow-hidden bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
			ref: canvasRef,
			className: "absolute inset-0 h-full w-full touch-none",
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-none absolute inset-0 flex flex-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
					className: "bg-gradient-to-b from-bg/85 to-transparent px-4 pt-4 pb-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs tracking-widest text-muted",
									children: "分数"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-2xl font-bold tabular-nums sm:text-3xl",
									children: hud.score
								}),
								hud.combo > 1 && hud.phase === "play" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-display text-sm text-accent",
									children: ["连击 ×", hud.combo]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted",
									children: ["最佳 ", Math.max(best, hud.best)]
								})
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "min-w-0 flex-1 text-center",
								children: hud.phase === "play" || hud.phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs tracking-widest text-muted",
										children: [
											"第 ",
											hud.wave,
											" 波",
											hud.bossWave ? " · 旗舰" : ""
										]
									}),
									hud.focusWord ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										hud.focusHanzi ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-fg",
											children: hud.focusHanzi
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WordLine, {
											word: hud.focusWord,
											count: hud.buffer.length
										}),
										hud.matchCount > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted",
											children: [
												"还有 ",
												hud.matchCount - 1,
												" 个候选，继续输入以区分"
											]
										}) : null
									] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "pt-2 text-sm text-muted",
										children: hud.mode === "letter" ? hud.bossWave ? "连打旗舰上的同一个字母" : "按下舰上的字母" : "输入字母，锁定敌舰"
									}),
									hud.slow ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-primary",
										children: "缓速生效"
									}) : null
								] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "pt-2 font-display text-sm tracking-widest text-primary",
									children: "STARTYPE"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col items-end gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "pointer-events-auto flex gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: musicOn ? "grid h-11 w-11 place-items-center rounded-full border border-border bg-surface/80 text-primary" : "grid h-11 w-11 place-items-center rounded-full border border-border bg-surface/80 text-muted",
												onClick: toggleMusic,
												"aria-label": musicOn ? "关闭背景音乐" : "打开背景音乐",
												"aria-pressed": musicOn,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music, { className: "size-5" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "grid h-11 w-11 place-items-center rounded-full border border-border bg-surface/80 text-fg",
												onClick: toggleMute,
												"aria-label": muted ? "打开声音" : "关闭声音",
												children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-5" })
											}),
											hud.phase === "play" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "grid h-11 w-11 place-items-center rounded-full border border-border bg-surface/80 text-fg",
												onClick: () => {
													game.pause();
													flush();
												},
												"aria-label": "暂停",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-5" })
											}) : null
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex gap-1",
										"aria-label": "船体",
										children: Array.from({ length: hud.maxHull }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: i < hud.hull ? "h-2 w-4 rounded-full bg-primary" : "h-2 w-4 rounded-full bg-border" }, i))
									}),
									hud.phase === "play" || hud.phase === "over" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted tabular-nums",
										children: [
											hud.accuracy,
											"% · ",
											hud.wpm,
											" 字/分"
										]
									}) : null
								]
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1",
					children: [
						hud.phase === "play" && hud.sub === "intro" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-x-0 top-2 flex justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-display text-4xl font-bold sm:text-5xl",
									children: [
										"第 ",
										hud.wave,
										" 波"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted",
									children: hud.bossWave ? "旗舰进入战场" : "击毁全部来舰"
								})]
							})
						}) : null,
						hud.phase === "play" && hud.sub === "clear" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-x-0 top-2 flex justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-3xl font-bold text-primary",
								children: "波次清除"
							})
						}) : null,
						hud.phase === "menu" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 flex items-center justify-center p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pointer-events-auto max-h-full w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-surface/90 p-6 shadow-2xl backdrop-blur-md",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs tracking-widest text-primary",
										children: "键盘太空战"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "font-display text-5xl font-bold leading-none",
										children: "星键歼灭"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-sm leading-6 text-muted",
										children: mode === "letter" ? "每艘敌舰只有一个字母。按中就击落，同屏不会重复。旗舰要连打同一个字母。" : "敌舰顶着单词俯冲。敲对字母锁定，打完整个词就把它打下来。"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-5 grid grid-cols-2 gap-2 rounded-xl bg-bg p-1",
										children: [["word", "单词"], ["letter", "单字母"]].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: mode === id ? "h-11 rounded-lg bg-primary font-medium text-on-primary" : "h-11 rounded-lg text-muted",
											onClick: () => {
												setMode(id);
												modeRef.current = id;
												persist({ mode: id });
											},
											children: label
										}, id))
									}),
									mode === "word" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2 grid grid-cols-2 gap-2 rounded-xl bg-bg p-1",
										children: [["en", "英语"], ["py", "拼音"]].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: lang === id ? "h-11 rounded-lg bg-primary font-medium text-on-primary" : "h-11 rounded-lg text-muted",
											onClick: () => {
												setLang(id);
												langRef.current = id;
												persist({ lang: id });
											},
											children: label
										}, id))
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2 grid grid-cols-3 gap-2 rounded-xl bg-bg p-1",
										children: DIFFS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: diff === item.id ? "h-11 rounded-lg bg-primary text-sm font-medium text-on-primary" : "h-11 rounded-lg text-sm text-muted",
											onClick: () => {
												setDiff(item.id);
												diffRef.current = item.id;
												persist({ diff: item.id });
											},
											children: item.label
										}, item.id))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 flex items-center gap-2 text-sm text-muted",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "size-4 text-accent" }), best > 0 ? `最佳 ${best}` : "尚无纪录"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-display text-lg font-bold text-on-primary",
										onClick: begin,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-5" }), "出击"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
										className: "mt-5 space-y-2 text-sm text-muted",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keyboard, { className: "size-4 shrink-0 text-primary" }), mode === "letter" ? "看准字母再按，按错会打断连击" : "直接按键盘字母，拼音模式不用声调"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crosshair, { className: "size-4 shrink-0 text-primary" }), mode === "letter" ? "Esc 暂停。敌舰撞上座舰会掉船体" : "退格删字，Esc 暂停。撞上座舰会掉船体"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-4 shrink-0 text-accent" }), mode === "letter" ? "金色字母会给护盾、缓速或清场" : "金色词会给护盾、缓速或清场"]
											})
										]
									})
								]
							})
						}) : null,
						hud.phase === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 flex items-center justify-center p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pointer-events-auto w-full max-w-sm rounded-2xl border border-border bg-surface/90 p-6 text-center backdrop-blur-md",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-display text-3xl font-bold",
										children: "已暂停"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-sm text-muted",
										children: [
											"第 ",
											hud.wave,
											" 波 · ",
											hud.score,
											" 分"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "mt-5 h-12 w-full rounded-xl bg-primary font-display text-lg font-bold text-on-primary",
										onClick: () => {
											game.resume();
											flush();
										},
										children: "继续"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "mt-2 h-11 w-full rounded-xl border border-border text-muted",
										onClick: () => {
											game.toMenu();
											flush();
										},
										children: "返回标题"
									})
								]
							})
						}) : null,
						hud.phase === "over" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 flex items-center justify-center p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pointer-events-auto w-full max-w-sm rounded-2xl border border-border bg-surface/92 p-6 text-center backdrop-blur-md",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs tracking-widest text-danger",
										children: "座舰坠毁"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-display text-4xl font-bold",
										children: hud.score
									}),
									hud.isRecord ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-accent",
										children: "新纪录"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm text-muted",
										children: ["最佳 ", hud.best]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
										className: "mt-4 grid grid-cols-3 gap-2 text-sm",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "rounded-lg bg-bg p-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
													className: "text-xs text-muted",
													children: "波次"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
													className: "font-display text-lg",
													children: hud.wave
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "rounded-lg bg-bg p-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
													className: "text-xs text-muted",
													children: "连击"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
													className: "font-display text-lg",
													children: hud.maxCombo
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "rounded-lg bg-bg p-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
													className: "text-xs text-muted",
													children: "准确"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
													className: "font-display text-lg",
													children: [hud.accuracy, "%"]
												})]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 text-sm text-muted",
										children: [
											"手速 ",
											hud.wpm,
											" 字/分"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-display text-lg font-bold text-on-primary",
										onClick: begin,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-5" }), "再来一局"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "mt-2 h-11 w-full rounded-xl border border-border text-muted",
										onClick: () => {
											game.toMenu();
											flush();
										},
										children: "返回标题"
									})
								]
							})
						}) : null
					]
				}),
				showPad ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					ref: padRef,
					className: "pointer-events-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keypad, {
						letter: hud.mode === "letter",
						onKey: (code) => {
							audioRef.current?.unlock();
							if (code === "backspace") game.backspace();
							else game.type(code);
							flush();
						}
					})
				}) : null
			]
		})]
	});
}
var SplitComponent = StarType;
//#endregion
export { SplitComponent as component };
