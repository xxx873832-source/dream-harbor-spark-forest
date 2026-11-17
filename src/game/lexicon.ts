export type Lang = "en" | "py";
export type Diff = "easy" | "normal" | "expert";
export type Mode = "word" | "letter";
export type Power = "shield" | "slow" | "nova";

export type Entry = { word: string; display: string; hanzi: string | null };

const EN = [
  "ion", "ray", "sun", "arc", "jet", "pod", "ace", "sky", "gas", "orb", "rim", "bay",
  "void", "warp", "moon", "ship", "beam", "star", "dust", "hull", "dock", "fuel", "coil",
  "flux", "lens", "echo", "bolt", "glow", "rift", "dune", "halo", "wing", "sail", "core",
  "node", "mine", "apex", "gyro", "wake",
  "comet", "laser", "pulse", "drone", "flare", "orbit", "solar", "craft", "relay", "radar",
  "miner", "scout", "ranger", "hunter", "meteor", "photon", "plasma", "rocket", "vector",
  "nebula", "galaxy", "cosmic", "engine", "capsule", "station", "freighter", "asteroid",
  "pulsar", "quasar", "horizon", "thruster", "module", "beacon", "sentry", "corsair",
  "constellation", "hyperdrive", "lightspeed", "wormhole", "starbase", "celestial",
  "ioncannon", "starforge", "voidwalker", "eventide", "triton", "orion",
];

const PY: [string, string][] = [
  ["月", "yue"], ["云", "yun"], ["火", "huo"], ["炮", "pao"], ["门", "men"], ["盾", "dun"],
  ["猎", "lie"], ["队", "dui"], ["锁", "suo"], ["雷", "lei"], ["星", "xing"], ["舰", "jian"],
  ["战", "zhan"], ["航", "hang"], ["电", "dian"], ["能", "neng"], ["空", "kong"], ["源", "yuan"],
  ["光", "guang"], ["曲速", "qusu"], ["雷达", "leida"], ["银河", "yinhe"], ["机库", "jiku"],
  ["导弹", "daodan"], ["卫星", "weixing"], ["流星", "liuxing"], ["彗星", "huixing"],
  ["星球", "xingqiu"], ["星云", "xingyun"], ["轨道", "guidao"], ["引擎", "yinqing"],
  ["脉冲", "maichong"], ["光子", "guangzi"], ["飞船", "feichuan"], ["僚机", "liaoji"],
  ["巡航", "xunhang"], ["拦截", "lanjie"], ["扫描", "saomiao"], ["信标", "xinbiao"],
  ["坐标", "zuobiao"], ["跃迁", "yueqian"], ["舰桥", "jianqiao"], ["炮塔", "paota"],
  ["能源", "nengyuan"], ["驾驶", "jiashi"], ["星际", "xingji"], ["日冕", "rimian"],
  ["星门", "xingmen"], ["编队", "biandui"], ["突击", "tuji"], ["预警", "yujing"],
  ["齐射", "qishe"], ["穿甲", "chuanjia"], ["能量", "nengliang"], ["冷却", "lengque"],
  ["过载", "guozai"], ["母舰", "mujian"], ["护卫", "huwei"], ["驱逐", "quzhu"],
  ["旗舰", "qijian"], ["悬停", "xuanting"], ["俯冲", "fuchong"], ["规避", "guibi"],
  ["火控", "huokong"], ["瞄准", "miaozhun"], ["尾焰", "weiyan"], ["变轨", "biangui"],
  ["虫洞", "chongdong"], ["奇点", "qidian"], ["时空", "shikong"], ["光谱", "guangpu"],
  ["射电", "shedian"], ["量子", "liangzi"], ["星风", "xingfeng"], ["喷流", "penliu"],
  ["星团", "xingtuan"], ["耀斑", "yaoban"], ["红移", "hongyi"], ["蓝移", "lanyi"],
  ["引力", "yinli"], ["空间", "kongjian"], ["舰队", "jiandui"], ["太空", "taikong"],
  ["行星", "xingxing"], ["黑洞", "heidong"], ["陨石", "yunshi"], ["光年", "guangnian"],
  ["曲率", "qulv"], ["反应堆", "fanyingdui"], ["空间站", "kongjianzhan"],
  ["小行星", "xiaoxingxing"], ["中子星", "zhongzixing"], ["白矮星", "baiaixing"],
  ["红巨星", "hongjuxing"], ["超新星", "chaoxinxing"], ["暗物质", "anwuzhi"],
];

const BOSSES_EN = [
  "andromeda", "supernova", "darkmatter", "lightspeed", "wormhole", "starforge",
  "eventhorizon", "celestial", "ionstorm", "voidheart", "orionbelt", "quarkstar",
];

const BOSSES_PY: [string, string][] = [
  ["猎户座", "liehuzuo"], ["仙女座", "xiannvzuo"], ["曲速引擎", "qusuyinqing"],
  ["超光速", "chaoguangsu"], ["暗物质海", "anwuzhihai"], ["脉冲星", "maichongxing"],
  ["银河中心", "yinhezhongxin"], ["事件视界", "shijianshijie"], ["航天母舰", "hangtianmujian"],
];

function enEntry(word: string): Entry {
  return { word, display: word.toUpperCase(), hanzi: null };
}

function pyEntry(hanzi: string, word: string): Entry {
  return { word, display: word, hanzi };
}

export const WORDS: Record<Lang, Entry[]> = {
  en: EN.filter((w) => /^[a-z]+$/.test(w)).map(enEntry),
  py: PY.filter(([, w]) => /^[a-z]+$/.test(w)).map(([h, w]) => pyEntry(h, w)),
};

export const BOSSES: Record<Lang, Entry[]> = {
  en: BOSSES_EN.map(enEntry),
  py: BOSSES_PY.map(([h, w]) => pyEntry(h, w)),
};

export const POWER_WORDS: Record<Lang, Record<Power, Entry>> = {
  en: {
    shield: enEntry("shield"),
    slow: enEntry("slow"),
    nova: enEntry("nova"),
  },
  py: {
    shield: pyEntry("护盾", "hudun"),
    slow: pyEntry("缓速", "huansu"),
    nova: pyEntry("新星", "xinxing"),
  },
};

export const POWER_HINT: Record<Power, string> = {
  shield: "回复船体",
  slow: "减缓全场",
  nova: "清空杂舰",
};

export function conflicts(word: string, alive: string[]): boolean {
  return alive.some((a) => a === word || a.startsWith(word) || word.startsWith(a));
}

export function pickEntry(
  lang: Lang,
  minLen: number,
  maxLen: number,
  alive: string[],
  boss: boolean,
): Entry {
  const pool = boss ? BOSSES[lang] : WORDS[lang];
  const inBand = (e: Entry, slack: number) =>
    e.word.length >= minLen && e.word.length <= maxLen + slack && !conflicts(e.word, alive);
  let cands = pool.filter((e) => inBand(e, 0));
  if (!cands.length) cands = pool.filter((e) => inBand(e, 4));
  if (!cands.length) cands = pool.filter((e) => !conflicts(e.word, alive));
  if (!cands.length) cands = pool;
  return cands[Math.floor(Math.random() * cands.length)]!;
}
