const SAVE_KEY = "sklad-progress-v4";
const SOUND_KEY = "sklad-sound-on";
const START_COINS = 1200;
const PALLET_COLS = 2;
const PALLET_DEPTH = 3;
const PALLET_LAYERS = 3;
const PALLET_PACKS = PALLET_COLS * PALLET_DEPTH * PALLET_LAYERS;
const BUILD_SPOT = 99;
const RECV_SPOT = 98;
const SHIP_COLS = 3;
const SHIP_ROWS = 3;
const SHIP_SLOTS = SHIP_COLS * SHIP_ROWS;
const WOOD_PRICE = [40, 90, 160, 260, 400, 600, 850, 1200, 1700, 2300];
const PACK_MARGIN = 20;
const DELIVERY_FEE = 40;
const DELIVERY_MS = 60000;
const RUSH_MS = 75000;
const RUSH_COOLDOWN = 120000;
const BULK_MS = 180000;
const JOB_RATE = { norm: 1.1, rush: 1.15, bulk: 1.2 };
const JOB_RATE_STEP = 0.02;
const NORM_GRADES = ["easy", "mid"];
const JOB_GRADES = ["rush", "bulk", "easy", "mid"];
const UNLOCK_PRICE = [0, 1000, 2500, 5000, 10000, 20000];
const SKUS = [
  { id: "water", name: "Вода", tag: "ВОДА", tone: "#6a7c84", liq: "#6e8792", cap: "#3e4a50", paper: "#efe6d4", ink: "#2c3438", cost: 320 },
  { id: "cola", name: "Кола", tag: "КОЛА", tone: "#5a322c", liq: "#2a1814", cap: "#6a2c26", paper: "#e4d4b8", ink: "#3a1814", cost: 480 },
  { id: "lemon", name: "Лимонад", tag: "ЛИМОН", tone: "#9a8e4a", liq: "#b4a85a", cap: "#5a6230", paper: "#efe6c8", ink: "#3a3820", cost: 450 },
  { id: "orange", name: "Апельсин", tag: "АПЕЛЬ", tone: "#a86a3a", liq: "#b87840", cap: "#6a3a20", paper: "#ead8bc", ink: "#3c2414", cost: 460 },
  { id: "grape", name: "Виноград", tag: "ВИНО", tone: "#5a4a68", liq: "#4a3a58", cap: "#3a2c48", paper: "#e6dce8", ink: "#2c2038", cost: 500 },
  { id: "cherry", name: "Вишня", tag: "ВИШНЯ", tone: "#6a3a40", liq: "#5a242c", cap: "#4a2024", paper: "#ead8d0", ink: "#3a181c", cost: 520 },
];
const ROOMS = [
  { id: "garage", name: "Гараж", slots: 5, price: 800, pic: "room-garage.jpg", inside: "inside-garage.jpg" },
  { id: "hangar", name: "Ангар", slots: 8, price: 2400, pic: "room-hangar.jpg", inside: "" },
  { id: "depot", name: "Склад", slots: 12, price: 6200, pic: "room-depot.jpg", inside: "" },
];
const GARAGE_SPOTS = [
  { x: 10, b: 28, s: 1, lift: 26 },
  { x: 30, b: 28, s: 1, lift: 26 },
  { x: 50, b: 28, s: 1, lift: 26 },
  { x: 70, b: 28, s: 1, lift: 26 },
  { x: 90, b: 28, s: 1, lift: 26 },
];

const boot = document.getElementById("boot");
const rent = document.getElementById("rent");
const floor = document.getElementById("floor");
const pack = document.getElementById("pack");
const toastEl = document.getElementById("toast");

function emptyProgress() {
  return {
    coins: 0,
    room: "",
    pallets: [],
    stack: [],
    boughtWoods: 0,
    orders: [],
    incoming: [],
    nextOrder: 1,
    nextPallet: 1,
    nextShip: 1,
    gifted: false,
    giftedPal: false,
    guide: "start",
    unlocked: ["water"],
    rushAt: 0,
    rate: 5,
  };
}

function readPal(raw, i) {
  const units = Math.max(0, Number(raw && raw.units) || 0);
  const sku = units && SKUS.some((s) => s.id === (raw && raw.sku)) ? raw.sku : "";
  return {
    id: Number(raw && raw.id) || 0,
    sku: sku,
    units: units,
    spot: raw && raw.spot != null && raw.spot !== "" ? Number(raw.spot) : i,
  };
}

function readIncoming(raw) {
  const packs = Math.max(1, Number(raw && (raw.packs || raw.left)) || PALLET_PACKS);
  const left = Math.max(0, Number(raw && raw.left != null ? raw.left : packs) || 0);
  return {
    id: Number(raw && raw.id) || 0,
    sku: SKUS.some((s) => s.id === (raw && raw.sku)) ? raw.sku : "water",
    packs: packs,
    left: left,
    readyAt: Math.max(0, Number(raw && raw.readyAt) || 0),
    seen: raw && raw.seen === true,
  };
}

function loadProgress() {
  try {
    let raw = JSON.parse(localStorage.getItem(SAVE_KEY) || "");
    let fromOld = false;
    if (!raw || typeof raw !== "object") {
      raw = JSON.parse(localStorage.getItem("sklad-progress-v3") || "");
      fromOld = !!(raw && typeof raw === "object");
    }
    if (!raw || typeof raw !== "object") return emptyProgress();
    const base = emptyProgress();
    const coins = Number(raw.coins);
    base.coins = Number.isFinite(coins) ? Math.round(coins) : 0;
    base.room = ROOMS.some((r) => r.id === raw.room) ? raw.room : "";
    base.nextOrder = Math.max(1, Number(raw.nextOrder) || 1);
    base.nextPallet = Math.max(1, Number(raw.nextPallet) || 1);
    base.nextShip = Math.max(1, Number(raw.nextShip) || 1);
    base.gifted = raw.gifted === true;
    base.giftedPal = raw.giftedPal === true;
    base.rushAt = Math.max(0, Number(raw.rushAt) || 0);
    const rate = Number(raw.rate);
    base.rate = rate >= 1 ? Math.round(rate * 10) / 10 : 5;
    base.guide = typeof raw.guide === "string" ? raw.guide : "";
    if (!base.guide) base.guide = base.room ? "done" : "start";
    base.boughtWoods = Math.max(0, Number(raw.boughtWoods) || 0);
    base.incoming = Array.isArray(raw.incoming)
      ? raw.incoming.map(readIncoming).filter((item) => item.id && item.readyAt && item.left)
      : [];
    base.pallets = Array.isArray(raw.pallets)
      ? raw.pallets.map(readPal).filter((p) => p.id)
      : [];
    base.stack = Array.isArray(raw.stack)
      ? raw.stack.map((p, i) => readPal(p, i)).filter((p) => p.id)
      : [];
    base.pallets.forEach((p, i) => {
      if (p.spot === BUILD_SPOT || p.spot === RECV_SPOT) return;
      const clash = base.pallets.some(
        (o, j) => j < i && o.spot === p.spot && o.spot !== BUILD_SPOT && o.spot !== RECV_SPOT
      );
      if (p.spot == null || p.spot < 0 || clash) p.spot = i;
    });
    if (fromOld && !base.stack.length) {
      base.stack.push({ id: base.nextPallet, sku: "", units: 0, spot: -1 });
      base.nextPallet += 1;
      base.boughtWoods = Math.max(base.boughtWoods, base.pallets.length + 1);
    }
    const woods = base.pallets.length + base.stack.length;
    if (!base.giftedPal && (woods >= 2 || (base.room && base.room !== "garage"))) {
      base.giftedPal = true;
    }
    base.orders = Array.isArray(raw.orders)
      ? raw.orders.map((o) => normalizeOrder(o)).filter((o) => o.id && o.lines.length)
      : [];
    const open = { water: true };
    if (Array.isArray(raw.unlocked)) {
      raw.unlocked.forEach((id) => {
        if (SKUS.some((s) => s.id === id)) open[id] = true;
      });
    }
    base.pallets.concat(base.stack).forEach((p) => {
      if (p.sku) open[p.sku] = true;
    });
    base.incoming.forEach((p) => {
      if (p.sku) open[p.sku] = true;
    });
    base.unlocked = SKUS.map((s) => s.id).filter((id) => open[id]);
    return base;
  } catch (e) {
    return emptyProgress();
  }
}

function saveProgress() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
}

const progress = loadProgress();
const state = { packId: 0, pickId: 0, shipId: 0, shipPalId: 0, shipGone: false, shipLoad: [], wayPeek: false, bulkId: 0, unloading: false, busy: false, drag: null, cart: { pals: [], woods: 0 }, orderTick: 0, coinHold: false };

const FIZ_NAMES = [
  "Коваль", "Мельник", "Шевченко", "Бондар", "Ткачук", "Кравчук", "Лысенко", "Романенко", "Савчук", "Пономаренко",
  "Гончар", "Марчук", "Олейник", "Данилюк", "Петренко", "Иваненко", "Сидоренко", "Юрченко", "Захарченко", "Белоус",
  "Кравец", "Павленко", "Гриценко", "Литвин", "Мороз", "Козак", "Дяченко", "Руденко", "Назаренко", "Волошин",
];
const SHOP_NAMES = [
  "Маркет «Родина»", "«Продукты 24»", "«Эконом»", "«Семья»", "«Фортуна»",
  "«На углу»", "«Доброцена»", "«Корзина»", "«Вкус»", "«Опт-Хаус»",
];

let audioCtx = null;
let soundOn = localStorage.getItem(SOUND_KEY) !== "0";
let sfxGain = null;
let musicGain = null;
let musicNext = 0;
let musicTimer = 0;
let noiseBuf = null;

function ensureAudio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  try {
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === "suspended") audioCtx.resume();
    if (!sfxGain) {
      sfxGain = audioCtx.createGain();
      sfxGain.gain.value = 0.22;
      sfxGain.connect(audioCtx.destination);
    }
    if (!musicGain) {
      musicGain = audioCtx.createGain();
      musicGain.gain.value = soundOn ? 0.1 : 0;
      musicGain.connect(audioCtx.destination);
    }
    return audioCtx;
  } catch (e) {
    return null;
  }
}

function noiseSrc(ctx, dur, t0) {
  const n = Math.max(1, Math.floor(dur * ctx.sampleRate));
  if (!noiseBuf || noiseBuf.length < n) {
    noiseBuf = ctx.createBuffer(1, Math.max(n, ctx.sampleRate), ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  src.start(t0);
  src.stop(t0 + dur);
  return src;
}

function toneAt(ctx, dest, type, freq, vol, t0, a, hold, rel) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + a);
  g.gain.exponentialRampToValueAtTime(vol * 0.65, t0 + a + hold);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + hold + rel);
  osc.connect(g);
  g.connect(dest);
  osc.start(t0);
  osc.stop(t0 + a + hold + rel + 0.02);
}

function sfx(kind) {
  if (!soundOn) return;
  const ctx = ensureAudio();
  if (!ctx || !sfxGain) return;
  const t = ctx.currentTime;
  try {
    if (kind === "tap") toneAt(ctx, sfxGain, "sine", 520, 0.07, t, 0.01, 0.02, 0.06);
    else if (kind === "grabWood") {
      const src = noiseSrc(ctx, 0.12, t);
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.setValueAtTime(380, t);
      f.frequency.exponentialRampToValueAtTime(80, t + 0.12);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.35, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      src.connect(f);
      f.connect(g);
      g.connect(sfxGain);
      toneAt(ctx, sfxGain, "sine", 170, 0.12, t, 0.01, 0.04, 0.1);
    } else if (kind === "grabPak") toneAt(ctx, sfxGain, "triangle", 680, 0.08, t, 0.005, 0.03, 0.05);
    else if (kind === "dropPak") {
      toneAt(ctx, sfxGain, "sine", 240, 0.14, t, 0.01, 0.04, 0.1);
      toneAt(ctx, sfxGain, "triangle", 420, 0.06, t + 0.03, 0.01, 0.03, 0.08);
    } else if (kind === "dropWood") {
      const src = noiseSrc(ctx, 0.16, t);
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.setValueAtTime(260, t);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      src.connect(f);
      f.connect(g);
      g.connect(sfxGain);
      toneAt(ctx, sfxGain, "sine", 130, 0.16, t, 0.01, 0.05, 0.14);
    } else if (kind === "full") {
      toneAt(ctx, sfxGain, "sine", 392, 0.08, t, 0.02, 0.08, 0.18);
      toneAt(ctx, sfxGain, "sine", 523, 0.08, t + 0.08, 0.02, 0.1, 0.22);
      toneAt(ctx, sfxGain, "sine", 659, 0.07, t + 0.16, 0.02, 0.12, 0.28);
    } else if (kind === "truck") {
      toneAt(ctx, sfxGain, "sawtooth", 92, 0.07, t, 0.04, 0.22, 0.28);
      toneAt(ctx, sfxGain, "triangle", 196, 0.08, t + 0.12, 0.02, 0.12, 0.2);
      toneAt(ctx, sfxGain, "triangle", 165, 0.07, t + 0.28, 0.02, 0.16, 0.22);
    } else if (kind === "doors") {
      [0, 0.14].forEach((off) => {
        const src = noiseSrc(ctx, 0.14, t + off);
        const f = ctx.createBiquadFilter();
        f.type = "bandpass";
        f.frequency.setValueAtTime(900 - off * 400, t + off);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.22, t + off);
        g.gain.exponentialRampToValueAtTime(0.0001, t + off + 0.14);
        src.connect(f);
        f.connect(g);
        g.connect(sfxGain);
      });
    } else if (kind === "buy") {
      toneAt(ctx, sfxGain, "triangle", 784, 0.1, t, 0.01, 0.06, 0.12);
      toneAt(ctx, sfxGain, "triangle", 1046, 0.1, t + 0.08, 0.01, 0.08, 0.16);
    } else if (kind === "coin") toneAt(ctx, sfxGain, "sine", 1200, 0.07, t, 0.005, 0.03, 0.08);
    else if (kind === "whoosh") {
      const src = noiseSrc(ctx, 0.35, t);
      const f = ctx.createBiquadFilter();
      f.type = "highpass";
      f.frequency.setValueAtTime(400, t);
      f.frequency.exponentialRampToValueAtTime(1800, t + 0.32);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.18, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      src.connect(f);
      f.connect(g);
      g.connect(sfxGain);
    } else if (kind === "done") {
      toneAt(ctx, sfxGain, "sine", 523, 0.09, t, 0.02, 0.1, 0.2);
      toneAt(ctx, sfxGain, "sine", 659, 0.09, t + 0.1, 0.02, 0.12, 0.22);
      toneAt(ctx, sfxGain, "sine", 784, 0.1, t + 0.22, 0.02, 0.16, 0.32);
    } else if (kind === "no") {
      toneAt(ctx, sfxGain, "square", 180, 0.06, t, 0.01, 0.05, 0.08);
      toneAt(ctx, sfxGain, "square", 120, 0.06, t + 0.07, 0.01, 0.08, 0.1);
    } else if (kind === "paper") {
      const src = noiseSrc(ctx, 0.18, t);
      const f = ctx.createBiquadFilter();
      f.type = "highpass";
      f.frequency.setValueAtTime(1800, t);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      src.connect(f);
      f.connect(g);
      g.connect(sfxGain);
    } else if (kind === "gift") {
      toneAt(ctx, sfxGain, "sine", 659, 0.08, t, 0.02, 0.08, 0.16);
      toneAt(ctx, sfxGain, "sine", 784, 0.08, t + 0.1, 0.02, 0.1, 0.2);
      toneAt(ctx, sfxGain, "sine", 988, 0.09, t + 0.22, 0.02, 0.14, 0.28);
    }
  } catch (e) {}
}

function scheduleMusic(t0) {
  const ctx = audioCtx;
  if (!ctx || !musicGain) return;
  const beat = 0.7;
  const bars = [
    { bass: 73.42, chord: [146.83, 174.61, 220.0] },
    { bass: 87.31, chord: [174.61, 220.0, 261.63] },
    { bass: 98.0, chord: [196.0, 246.94, 293.66] },
    { bass: 65.41, chord: [130.81, 164.81, 196.0] },
  ];
  bars.forEach((bar, i) => {
    const t = t0 + i * 4 * beat;
    bar.chord.forEach((f) => {
      toneAt(ctx, musicGain, "sine", f, 0.042, t, 0.35, 2.15, 0.7);
      toneAt(ctx, musicGain, "triangle", f * 2, 0.01, t + 0.08, 0.5, 1.8, 0.7);
    });
    [0, 2].forEach((step) => {
      toneAt(ctx, musicGain, "sine", bar.bass, 0.07, t + step * beat, 0.02, 0.22, 0.28);
    });
    [1, 3].forEach((step) => {
      toneAt(ctx, musicGain, "triangle", bar.chord[1] * 2, 0.011, t + step * beat, 0.01, 0.07, 0.12);
    });
  });
  const tune = [
    220.0, 0, 261.63, 293.66, 261.63, 220.0, 0, 174.61,
    196.0, 220.0, 261.63, 0, 293.66, 261.63, 220.0, 196.0,
    293.66, 349.23, 0, 392.0, 349.23, 293.66, 261.63, 0,
    246.94, 261.63, 220.0, 196.0, 174.61, 196.0, 220.0, 0,
  ];
  tune.forEach((f, i) => {
    if (!f) return;
    toneAt(ctx, musicGain, "triangle", f, 0.03, t0 + i * (beat / 2), 0.03, 0.18, 0.22);
  });
  musicNext = t0 + 16 * beat;
}

function pumpMusic() {
  if (!soundOn || !audioCtx || !musicGain) return;
  if (musicNext < audioCtx.currentTime + 5) {
    scheduleMusic(Math.max(audioCtx.currentTime + 0.08, musicNext || 0));
  }
}

function startMusic() {
  if (!soundOn) return;
  const ctx = ensureAudio();
  if (!ctx || !musicGain) return;
  musicGain.gain.cancelScheduledValues(ctx.currentTime);
  musicGain.gain.setValueAtTime(musicGain.gain.value || 0.0001, ctx.currentTime);
  musicGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.6);
  if (!musicTimer) {
    musicNext = 0;
    pumpMusic();
    musicTimer = window.setInterval(pumpMusic, 1500);
  }
}

function stopMusic() {
  if (musicGain && audioCtx) {
    const t = audioCtx.currentTime;
    musicGain.gain.cancelScheduledValues(t);
    musicGain.gain.setValueAtTime(musicGain.gain.value, t);
    musicGain.gain.linearRampToValueAtTime(0.0001, t + 0.25);
  }
  if (musicTimer) {
    window.clearInterval(musicTimer);
    musicTimer = 0;
  }
}

function paintSoundBtn() {
  const row = document.getElementById("set-sound");
  const label = document.getElementById("set-sound-label");
  if (row) {
    row.classList.toggle("is-off", !soundOn);
    row.setAttribute("aria-pressed", soundOn ? "true" : "false");
  }
  if (label) label.textContent = soundOn ? "Звук вкл" : "Звук выкл";
}

function openSet() {
  const pane = document.getElementById("set-pane");
  if (!pane) return;
  paintSoundBtn();
  pane.classList.add("show");
}

function closeSet() {
  const pane = document.getElementById("set-pane");
  if (pane) pane.classList.remove("show");
}

function toggleSound() {
  soundOn = !soundOn;
  localStorage.setItem(SOUND_KEY, soundOn ? "1" : "0");
  paintSoundBtn();
  if (soundOn) {
    ensureAudio();
    startMusic();
    sfx("tap");
  } else stopMusic();
}

function unlockAudio() {
  if (!soundOn) return;
  ensureAudio();
  startMusic();
}

function skuOf(id) {
  return SKUS.find((s) => s.id === id) || SKUS[0];
}

function isUnlocked(id) {
  return (progress.unlocked || []).indexOf(id) >= 0;
}

function nextLocked() {
  return SKUS.find((s) => !isUnlocked(s.id)) || null;
}

function unlockPrice(id) {
  const i = SKUS.findIndex((s) => s.id === id);
  return UNLOCK_PRICE[i] || UNLOCK_PRICE[UNLOCK_PRICE.length - 1];
}

function woodPrice(offset) {
  const i = Math.max(0, (progress.boughtWoods || 0) + (offset || 0));
  return WOOD_PRICE[Math.min(WOOD_PRICE.length - 1, i)];
}

function woodCartCost() {
  let sum = 0;
  for (let i = 0; i < state.cart.woods; i += 1) sum += woodPrice(i);
  return sum;
}

function allPals() {
  return (progress.pallets || []).concat(progress.stack || []);
}

function goodsPals() {
  return (progress.pallets || []).filter((p) => p.spot !== BUILD_SPOT);
}

function yardPals() {
  return (progress.pallets || []).filter((p) => p.spot !== BUILD_SPOT && p.spot !== RECV_SPOT);
}

function recvPal() {
  return (progress.pallets || []).find((p) => p.spot === RECV_SPOT) || null;
}

function hasGoodsPal() {
  return goodsPals().some((p) => p.units < PALLET_PACKS);
}

function emptyWoods() {
  return allPals().filter((p) => p.units < 1).length;
}

function freeSpots() {
  const room = roomOf(progress.room);
  const cap = room ? room.slots : 0;
  return Math.max(0, cap - yardPals().length);
}

function usedSpots() {
  return new Set(yardPals().map((p) => p.spot));
}

function canUnloadHere() {
  if ((progress.pallets || []).some((p) => p.spot !== BUILD_SPOT && p.units < PALLET_PACKS)) return true;
  return !recvPal() && (progress.stack || []).some((p) => p.units < 1);
}

function takeWoodToRecv() {
  const have = recvPal();
  if (have) return have;
  const list = progress.stack || [];
  let i = -1;
  for (let k = list.length - 1; k >= 0; k -= 1) {
    if (list[k].units < 1) {
      i = k;
      break;
    }
  }
  if (i < 0) return null;
  const pal = list.splice(i, 1)[0];
  pal.spot = RECV_SPOT;
  pal.sku = "";
  pal.units = 0;
  progress.pallets.push(pal);
  return pal;
}

function canParkPack(sku) {
  if ((progress.pallets || []).some((p) => canDropPackOn(p, sku))) return true;
  if (state.shipId) return false;
  return !recvPal() && (progress.stack || []).some((p) => p.units < 1);
}

function firstFreeSpot() {
  const room = roomOf(progress.room);
  const cap = room ? room.slots : 0;
  const used = usedSpots();
  for (let i = 0; i < cap; i += 1) {
    if (!used.has(i)) return i;
  }
  return -1;
}

function makeWood() {
  const pal = { id: progress.nextPallet, sku: "", units: 0, spot: -1 };
  progress.nextPallet += 1;
  return pal;
}

function markGiftStack() {
  const top = document.querySelector("#wood-stack .stack-layer.top");
  if (top) top.classList.add("gift-in");
}

function maybeGiftFirstPal() {
  if (progress.giftedPal) return false;
  if (inGuide()) return false;
  if (!progress.pallets.length) return false;
  progress.giftedPal = true;
  progress.stack.push(makeWood());
  saveProgress();
  paintHud();
  const chip = document.querySelector(".chip.wood");
  if (chip) {
    chip.classList.remove("catch");
    void chip.offsetWidth;
    chip.classList.add("catch");
  }
  toast("Первый уровень. Держи ещё поддон");
  return true;
}

function dockList() {
  const now = Date.now();
  return (progress.incoming || []).filter((item) => item.readyAt <= now && item.left > 0);
}

function roadList() {
  const now = Date.now();
  return (progress.incoming || []).filter((item) => item.readyAt > now);
}

function packCostOf(skuId) {
  const sku = skuOf(skuId);
  return (sku.cost + DELIVERY_FEE) / PALLET_PACKS;
}

function packPayOf(skuId) {
  return Math.round(packCostOf(skuId) * JOB_RATE.norm);
}

function linesCost(lines) {
  return (lines || []).reduce((sum, line) => sum + line.need * packCostOf(line.sku), 0);
}

function jobKind(order) {
  if (!order) return "norm";
  if (order.kind === "rush" || order.kind === "bulk") return order.kind;
  if (order.grade === "rush" || order.grade === "bulk") return order.grade;
  return "norm";
}

function unlockTier() {
  let t = 0;
  (progress.unlocked || []).forEach((id) => {
    const i = SKUS.findIndex((s) => s.id === id);
    if (i > t) t = i;
  });
  return Math.max(0, t);
}

function jobRateOf(kind) {
  return (JOB_RATE[kind] || JOB_RATE.norm) + unlockTier() * JOB_RATE_STEP;
}

function jobPct(kind) {
  return Math.round((jobRateOf(kind) - 1) * 100);
}

function gradeTitle(grade) {
  if (grade === "rush") return "Срочная · " + jobPct("rush") + "%";
  if (grade === "bulk") return "Опт · " + jobPct("bulk") + "%";
  return "Обычная · " + jobPct("norm") + "%";
}

function liveProgress() {
  try {
    return progress;
  } catch (e) {
    return null;
  }
}

function rateOf() {
  const n = Number(liveProgress() && liveProgress().rate);
  if (!(n >= 1)) return 5;
  return Math.max(1, Math.round(n * 10) / 10);
}

function ratingPayK() {
  const n = Math.max(1, Math.min(5, rateOf()));
  return 0.55 + 0.45 * ((n - 1) / 4);
}

function addRate(delta) {
  const next = Math.max(1, Math.round((rateOf() + delta) * 10) / 10);
  const p = liveProgress();
  if (p) p.rate = next;
  return next;
}

function wayOpen() {
  return !!(state.shipId && state.wayPeek && !state.busy);
}

function orderClient(order) {
  if (order && order.client) return order.client;
  const id = Math.max(1, Number(order && order.id) || 1);
  if (jobKind(order) === "bulk") return SHOP_NAMES[(id - 1) % SHOP_NAMES.length];
  return "ЧП «" + FIZ_NAMES[(id - 1) % FIZ_NAMES.length] + "»";
}

function jobPay(lines, kind) {
  return Math.round(linesCost(lines) * jobRateOf(kind) * ratingPayK());
}

function linesPay(lines) {
  return jobPay(lines, "norm");
}

function gradePay(lines, grade) {
  if (grade === "rush") return jobPay(lines, "rush");
  if (grade === "bulk") return jobPay(lines, "bulk");
  return jobPay(lines, "norm");
}

function readLine(line) {
  return {
    sku: SKUS.some((s) => s.id === line.sku) ? line.sku : "water",
    need: Math.max(1, Number(line.need) || 1),
    fill: Math.max(0, Number(line.fill) || 0),
  };
}

function normalizeOrder(raw) {
  const id = Number(raw && raw.id) || 0;
  let lines = [];
  if (raw && Array.isArray(raw.lines) && raw.lines.length) {
    lines = raw.lines.map(readLine);
  } else if (raw && raw.sku) {
    lines = [readLine({ sku: raw.sku, need: raw.need, fill: raw.fill })];
  }
  const need = lines.reduce((sum, line) => sum + line.need, 0);
  const kind =
    raw && (raw.kind === "rush" || raw.kind === "bulk")
      ? raw.kind
      : raw && (raw.grade === "rush" || raw.grade === "bulk")
        ? raw.grade
        : "norm";
  const grade = kind === "norm" ? (JOB_GRADES.indexOf(raw && raw.grade) >= 0 ? raw.grade : "easy") : kind;
  const row = {
    id: id,
    lines: lines,
    kind: kind,
    grade: grade,
    pay: jobPay(lines, kind),
    until: Math.max(0, Number(raw && raw.until) || 0),
    bulkN: Math.max(0, Number(raw && raw.bulkN) || 0),
    taken: Math.max(0, Number(raw && raw.taken) || 0),
    client: "",
  };
  row.client = typeof raw.client === "string" && raw.client ? raw.client : orderClient(row);
  return row;
}

function orderNeed(order) {
  return (order.lines || []).reduce((sum, line) => sum + line.need, 0);
}

function orderFill(order) {
  return (order.lines || []).reduce((sum, line) => sum + line.fill, 0);
}

function orderDone(order) {
  return (order.lines || []).every((line) => line.fill >= line.need);
}

function nextLineFor(order, sku) {
  return (order.lines || []).find((line) => line.sku === sku && line.fill < line.need);
}

function stillNeed(order, sku) {
  return !!(order.lines || []).some((line) => line.sku === sku && line.fill < line.need);
}

function syncOrderFill(order) {
  if (!order) return;
  const have = {};
  (state.shipLoad || []).forEach((id) => {
    have[id] = (have[id] || 0) + 1;
  });
  (order.lines || []).forEach((line) => {
    line.fill = Math.min(line.need, have[line.sku] || 0);
  });
}

function packCost(sku) {
  return Math.round((skuOf(sku).cost || 0) / PALLET_PACKS);
}

function judgeShip(order) {
  const needMap = {};
  (order.lines || []).forEach((line) => {
    needMap[line.sku] = (needMap[line.sku] || 0) + line.need;
  });
  const haveMap = {};
  (state.shipLoad || []).forEach((id) => {
    haveMap[id] = (haveMap[id] || 0) + 1;
  });
  let missing = 0;
  let extra = 0;
  let ok = 0;
  Object.keys(needMap).forEach((sku) => {
    const n = needMap[sku];
    const h = haveMap[sku] || 0;
    ok += Math.min(n, h);
    if (h < n) missing += n - h;
    if (h > n) extra += h - n;
  });
  Object.keys(haveMap).forEach((sku) => {
    if (!needMap[sku]) extra += haveMap[sku];
  });
  const empty = !(state.shipLoad || []).length;
  const perfect = !missing && !extra && !empty;
  const totalNeed = (order.lines || []).reduce((sum, line) => sum + line.need, 0) || 1;
  let pay = 0;
  let rateHit = 0;
  if (perfect) {
    pay = order.pay;
    rateHit = 0.06;
  } else if (empty) {
    pay = -Math.max(40, Math.round(order.pay * 0.4));
    rateHit = -0.5;
  } else {
    let waste = 0;
    Object.keys(haveMap).forEach((sku) => {
      const over = needMap[sku] ? Math.max(0, haveMap[sku] - needMap[sku]) : haveMap[sku];
      waste += over * packCost(sku);
    });
    pay = Math.round(order.pay * (ok / totalNeed)) - Math.round(waste * 0.6) - missing * 12;
    rateHit = Math.max(-0.45, -0.08 * missing - 0.06 * extra);
  }
  return { missing, extra, empty, perfect, pay, rateHit };
}

function orderTitle(order) {
  return (order.lines || []).map((line) => skuOf(line.sku).name).join(" + ");
}

function skuOnFloor(sku) {
  return allPals().some((p) => p.sku === sku && p.units > 0);
}

function orderPossible(order) {
  return (order.lines || []).every((line) => {
    if (line.fill >= line.need) return true;
    return skuOnFloor(line.sku);
  });
}

function pruneOrders() {
  const keep = (progress.orders || []).filter((order) => {
    if (!order.lines || !order.lines.length) return false;
    if (jobKind(order) === "bulk") return true;
    return order.lines.every((line) => isUnlocked(line.sku));
  });
  if (keep.length !== progress.orders.length) {
    progress.orders = keep;
    saveProgress();
  }
}

function stockHave(sku) {
  return allPals()
    .filter((p) => p.sku === sku)
    .reduce((sum, p) => sum + p.units, 0);
}

function stockFree(sku) {
  const have = allPals()
    .filter((p) => p.sku === sku)
    .reduce((sum, p) => sum + p.units, 0);
  const reserved = progress.orders.reduce((sum, order) => {
    return (
      sum +
      (order.lines || [])
        .filter((line) => line.sku === sku)
        .reduce((acc, line) => acc + (line.need - line.fill), 0)
    );
  }, 0);
  return have - reserved;
}

function packsWord(n) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return n + " пак";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return n + " пака";
  return n + " паков";
}

function bot(sku) {
  return (
    "<i class=\"bot\"><b class=\"bot-cap\"></b><b class=\"bot-n\"></b><b class=\"bot-g\"><em>" +
    (sku.tag || sku.name) +
    "</em></b></i>"
  );
}

function pakInner(sku) {
  const trio = bot(sku) + bot(sku) + bot(sku);
  return (
    "<span class=\"bots rear\">" +
    trio +
    "</span>" +
    "<span class=\"bots near\">" +
    trio +
    "</span>" +
    "<svg class=\"pak-skin\" viewBox=\"0 0 36 54\" preserveAspectRatio=\"none\" aria-hidden=\"true\">" +
    "<path class=\"pak-edge\" d=\"M1 53 L35 53 L35 24 C35 18 32.5 8 29 2 L27 0.7 L9 0.7 L7 2 C3.5 8 1 18 1 24 Z\" />" +
    "<path class=\"pak-glare\" d=\"M14 2 L18 2 L18 48 L14 48 Z\" />" +
    "</svg>" +
    "<span class=\"pak-tray\"></span>"
  );
}

function palSkin(sku) {
  return (
    "--sku:" +
    sku.tone +
    ";--liq:" +
    (sku.liq || sku.tone) +
    ";--cap:" +
    (sku.cap || sku.tone) +
    ";--paper:" +
    (sku.paper || "#efe6d4") +
    ";--ink:" +
    (sku.ink || "#2c3438")
  );
}

function palWood(name) {
  return (
    "<div class=\"pal-wood\">" +
    "<div class=\"pal-boards\"><i></i><i></i><i></i><i></i><i></i></div>" +
    "<div class=\"pal-stringers\"><i></i><i></i><i></i></div>" +
    "<div class=\"pal-base\"><i></i><i></i><i></i></div>" +
    (name
      ? "<div class=\"pal-plate\"><i></i><i></i><b>" + name + "</b></div>"
      : "") +
    "</div>"
  );
}

function palMarkup(sku, packs) {
  const n = Math.max(0, Math.min(PALLET_PACKS, Number(packs) || 0));
  if (!sku || !n) {
    return "<div class=\"pal-live empty-wood\">" + palWood("") + "</div>";
  }
  let load = "";
  for (let layer = 0; layer < PALLET_LAYERS; layer += 1) {
    for (let depth = 0; depth < PALLET_DEPTH; depth += 1) {
      const base = layer * PALLET_COLS * PALLET_DEPTH + depth * PALLET_COLS;
      const shown = base < n;
      load +=
        "<span class=\"pak-layer lift-" +
        layer +
        " depth-" +
        depth +
        (shown ? "" : " vacant") +
        "\">";
      for (let col = 0; col < PALLET_COLS; col += 1) {
        const slot = base + col;
        if (slot < n) {
          load += "<span class=\"pak\">" + pakInner(sku) + "</span>";
        } else {
          load += "<span class=\"pak empty\"></span>";
        }
      }
      load += "</span>";
    }
  }
  const banner =
    n >= PALLET_PACKS
      ? "<b class=\"pal-banner\" aria-hidden=\"true\"><span>" + sku.name + "</span></b>"
      : "";
  return (
    "<div class=\"pal-live sku-" +
    sku.id +
    "\" style=\"" +
    palSkin(sku) +
    "\">" +
    "<div class=\"pal-load\">" +
    load +
    banner +
    "</div>" +
    palWood(sku.name) +
    "</div>"
  );
}

function mixPalMarkup(skuIds) {
  const list = (skuIds || []).slice(0, SHIP_SLOTS);
  const start = SHIP_SLOTS - list.length;
  let load = "";
  for (let row = 0; row < SHIP_ROWS; row += 1) {
    load += "<span class=\"pak-layer depth-" + row + "\">";
    for (let col = 0; col < SHIP_COLS; col += 1) {
      const slot = row * SHIP_COLS + col;
      const sku = slot >= start ? skuOf(list[slot - start]) : null;
      load += sku
        ? "<span class=\"pak\" data-sku=\"" +
          sku.id +
          "\" data-i=\"" +
          (slot - start) +
          "\" style=\"" +
          palSkin(sku) +
          "\">" +
          pakInner(sku) +
          "</span>"
        : "<span class=\"pak empty\"></span>";
    }
    load += "</span>";
  }
  return (
    "<div class=\"pal-live ship-pal\">" +
    "<div class=\"pal-load\">" +
    load +
    "</div>" +
    palWood("Сборка") +
    "</div>"
  );
}

function palSpots() {
  const room = roomOf(progress.room);
  const n = room ? room.slots : 5;
  if (progress.room === "garage") return GARAGE_SPOTS;
  const spots = [];
  const cols = n <= 4 ? 2 : 3;
  for (let i = 0; i < n; i += 1) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    spots.push({
      x: 16 + col * (68 / Math.max(1, cols - 1)),
      b: 6 + (Math.floor((n - 1) / cols) - row) * 22,
      s: row === 0 ? 0.86 : 1,
    });
  }
  return spots;
}

function roomOf(id) {
  return ROOMS.find((r) => r.id === id) || null;
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function closeShop() {
  const pane = document.getElementById("shop");
  if (pane) pane.classList.remove("show");
}

function closeJobs() {
  const pane = document.getElementById("jobs-pane");
  if (pane) pane.classList.remove("show");
}

function closeShip() {
  const pane = document.getElementById("ship-pane");
  if (pane) pane.classList.remove("show");
}

function showScreen(el) {
  closeShop();
  closeJobs();
  closeShip();
  [boot, rent, floor, pack].forEach((node) => node.classList.toggle("show", node === el));
  document.body.classList.toggle("home", el === boot);
  document.body.classList.toggle("on-floor", el === floor);
  if (el !== floor) {
    document.body.classList.remove("in-garage", "in-hangar", "in-depot");
    endShip();
  }
  if (typeof paintTruck === "function") paintTruck();
  if (el === boot) paintBoot();
}

function toast(text) {
  toastEl.textContent = text;
  toastEl.classList.remove("show");
  void toastEl.offsetWidth;
  toastEl.classList.add("show");
  window.setTimeout(() => toastEl.classList.remove("show"), 2200);
}

function shake(el) {
  sfx("no");
  if (!el) return;
  el.classList.remove("shake");
  void el.offsetWidth;
  el.classList.add("shake");
}

function paintHud() {
  const coins = document.getElementById("hud-coins");
  if (coins) coins.textContent = String(state.coinHold ? 0 : progress.coins);
  const coinChip = document.querySelector(".chip.coin");
  if (coinChip) coinChip.classList.toggle("debt", progress.coins < 0);
  const woods = document.getElementById("hud-woods");
  if (woods) woods.textContent = String(emptyWoods());
  const rateEl = document.getElementById("hud-rate");
  if (rateEl) rateEl.textContent = rateOf().toFixed(1);
  const rateChip = document.getElementById("hud-rate-chip");
  if (rateChip) {
    rateChip.classList.toggle("low", rateOf() < 2.5);
    rateChip.classList.toggle("ok", rateOf() >= 4 && rateOf() <= 5);
    rateChip.classList.toggle("hot", rateOf() > 5);
  }
}

function stockOf(sku) {
  return stockHave(sku);
}

function freeSlots() {
  return freeSpots();
}

function fmtEta(ms) {
  const sec = Math.max(0, Math.ceil(ms / 1000));
  const min = Math.floor(sec / 60);
  const rest = sec % 60;
  return min + ":" + String(rest).padStart(2, "0");
}

function seedDust() {
  const host = document.getElementById("dust");
  if (!host || host.childNodes.length) return;
  for (let i = 0; i < 12; i += 1) {
    const bit = document.createElement("i");
    bit.style.left = 8 + Math.random() * 84 + "%";
    bit.style.bottom = Math.random() * 30 + "%";
    bit.style.animationDelay = Math.random() * 6 + "s";
    host.appendChild(bit);
  }
}

function giftStart() {
  if (progress.gifted) return;
  progress.gifted = true;
  progress.coins = START_COINS;
  saveProgress();
  paintHud();
  const chip = document.querySelector(".chip.coin");
  if (chip) chip.classList.add("catch");
  if (!inGuide()) toast("На старт " + START_COINS);
}

function paintRooms() {
  const host = document.getElementById("rooms");
  host.innerHTML = "";
  ROOMS.forEach((room, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    const can = progress.coins >= room.price;
    btn.dataset.room = room.id;
    btn.className = "room" + (can ? " ready" : " poor");
    btn.style.animationDelay = i * 70 + "ms";
    btn.innerHTML =
      "<img src=\"" +
      room.pic +
      "?v=3\" alt=\"\" />" +
      "<span class=\"room-meta\"><b>" +
      room.name +
      "</b><em>" +
      room.price +
      "</em></span>";
    btn.addEventListener("click", () => rentRoom(room.id, btn));
    host.appendChild(btn);
  });
}

async function rentRoom(id, btn) {
  if (state.busy) return;
  const room = roomOf(id);
  if (!room) return;
  if (progress.room === id) {
    openFloor();
    return;
  }
  if (progress.coins < room.price) {
    shake(btn);
    toast("Не хватает на «" + room.name + "»");
    return;
  }
  state.busy = true;
  progress.coins -= room.price;
  progress.room = id;
  saveProgress();
  paintHud();
  btn.classList.add("bought");
  sfx("buy");
  await playBuyRoom(room);
  state.busy = false;
  openFloor();
  if (progress.guide === "garage" || progress.guide === "coins") {
    window.setTimeout(() => showGuide("shop"), 80);
  } else {
    toast(room.name + " твой. Купи поддон — без него товар не принять.");
  }
}

async function playBuyRoom(room) {
  const fx = document.getElementById("buy-fx");
  const pic = document.getElementById("buy-fx-pic");
  if (!fx || !pic) {
    await wait(280);
    return;
  }
  pic.src = room.pic + "?v=3";
  fx.classList.remove("stamp", "open");
  fx.classList.add("show");
  await wait(80);
  fx.classList.add("stamp");
  await wait(560);
  fx.classList.add("open");
  await wait(780);
  fx.classList.remove("show", "stamp", "open");
}

function currentOrder() {
  return progress.orders.find((o) => o.id === state.shipId) || null;
}

function shipPacks(order) {
  const packs = [];
  (order.lines || []).forEach((line) => {
    for (let i = 0; i < line.fill; i += 1) packs.push(line.sku);
  });
  return packs;
}

function canTakePal(pal) {
  return !!(state.shipId && !wayOpen() && pal && pal.id !== state.shipPalId && pal.units > 0);
}

function canDropPackOn(pal, sku) {
  if (!pal) return false;
  if (state.shipId) {
    if (pal.id === state.shipPalId) return (state.shipLoad || []).length < SHIP_SLOTS;
    return pal.units < PALLET_PACKS && (!pal.units || pal.sku === sku);
  }
  if (pal.spot === BUILD_SPOT) return false;
  return pal.units < PALLET_PACKS && (!pal.units || pal.sku === sku);
}

function palStandHtml(pal) {
  if (state.shipGone && pal && pal.id === state.shipPalId) {
    return "<i class=\"pal-shade\" aria-hidden=\"true\"></i>" + palMarkup(null, 0);
  }
  if (state.shipId && pal && pal.id === state.shipPalId) {
    return "<i class=\"pal-shade\" aria-hidden=\"true\"></i>" + mixPalMarkup(state.shipLoad);
  }
  const sku = pal && pal.units && pal.sku ? skuOf(pal.sku) : null;
  return "<i class=\"pal-shade\" aria-hidden=\"true\"></i>" + palMarkup(sku, pal ? pal.units : 0);
}

function shadePals() {
  const stage = document.getElementById("inside-stage");
  const stands = document.querySelectorAll("#slots .pal-stand");
  if (!stage || !stands.length) return;
  const box = stage.getBoundingClientRect();
  const mid = box.left + box.width / 2;
  const span = Math.max(140, box.width / 2);
  stands.forEach((stand) => {
    const r = stand.getBoundingClientRect();
    const k = Math.max(-1, Math.min(1, (r.left + r.width / 2 - mid) / span));
    const sc = Number(stand.style.getPropertyValue("--sc")) || 1;
    const dim = Math.min(1, Math.abs(k) * 0.92 + (sc < 1 ? (1 - sc) * 1.5 : 0));
    stand.style.setProperty("--cast-x", (k * 28).toFixed(1) + "px");
    stand.style.setProperty("--cast-y", (8 + Math.abs(k) * 8).toFixed(1) + "px");
    stand.style.setProperty("--dim", dim.toFixed(3));
    stand.style.setProperty("--shade-l", (0.1 + Math.max(0, -k) * 0.4).toFixed(3));
    stand.style.setProperty("--shade-r", (0.1 + Math.max(0, k) * 0.4).toFixed(3));
  });
}

function syncYardPan() {
  const inside = document.getElementById("inside");
  const stage = document.getElementById("inside-stage");
  const host = document.getElementById("slots");
  if (!inside || !stage || !host) return;
  const keep = inside.scrollLeft;
  if (progress.room !== "garage") {
    inside.classList.remove("can-pan");
    stage.style.width = "";
    inside.scrollLeft = 0;
    shadePals();
    return;
  }
  const n = host.children.length;
  const need = 32 + n * 108 + Math.max(0, n - 1) * 12;
  const view = inside.clientWidth;
  if (!view) {
    shadePals();
    return;
  }
  if (need > view + 8) {
    stage.style.width = need + "px";
    inside.classList.add("can-pan");
    inside.scrollLeft = keep;
  } else {
    stage.style.width = "";
    inside.classList.remove("can-pan");
    inside.scrollLeft = 0;
  }
  shadePals();
}

function bindStand(stand, pal) {
  stand.addEventListener("pointerdown", (e) => {
    if (state.bulkId) {
      if (bulkPalOk(pal)) startWoodDrag(e, pal.id, "floor");
      return;
    }
    if (e.target.closest(".pak") && !e.target.closest(".pak.empty")) {
      startPackDrag(e, pal.id, "floor");
      return;
    }
    startWoodDrag(e, pal.id, "floor");
  });
}

function paintSlots() {
  const host = document.getElementById("slots");
  host.innerHTML = "";
  const spots = palSpots();
  spots.forEach((spot, i) => {
    const cell = document.createElement("div");
    cell.className = "pal-spot";
    cell.dataset.spot = String(i);
    if (progress.room !== "garage") {
      cell.style.left = spot.x + "%";
      cell.style.bottom = "calc(" + (spot.b ?? 6) + "% + " + ((spot.lift || 0) + 15) + "px)";
    }
    cell.style.setProperty("--sc", String(spot.s || 1));
    const pal = progress.pallets.find((p) => p.spot === i);
    if (pal) {
      const take = state.shipId && canTakePal(pal);
      const bulkOk = bulkPalOk(pal);
      const stand = document.createElement("div");
      stand.className =
        "pal-stand" +
        (bulkOk ? " bulk-ok" : "") +
        (state.shipId ? (take ? " can-take" : " no-take") : "");
      stand.dataset.id = String(pal.id);
      stand.innerHTML = palStandHtml(pal);
      bindStand(stand, pal);
      cell.classList.add("has-pal");
      cell.appendChild(stand);
    }
    host.appendChild(cell);
  });
  paintBuild();
  paintRecv();
  paintStack();
  paintDock();
  syncYardPan();
  paintGuideDrops();
}

function paintBuild() {
  const host = document.getElementById("build-spot");
  if (!host) return;
  host.innerHTML = "";
  const pal = progress.pallets.find((p) => p.spot === BUILD_SPOT);
  host.classList.toggle("has-pal", !!pal);
  host.classList.toggle("ship-on", !!state.shipId);
  const mark = document.createElement("em");
  mark.textContent = "Сборка";
  if (!pal) {
    host.appendChild(mark);
    return;
  }
  const take = state.shipId && canTakePal(pal);
  const ship = !!(state.shipId && pal.id === state.shipPalId);
  const stand = document.createElement("div");
  stand.className =
    "pal-stand" +
    (ship ? " ship-now" : "") +
    (state.shipId ? (take ? " can-take" : pal.units < 1 || ship ? " can-drop" : " no-take") : "");
  stand.dataset.id = String(pal.id);
  stand.innerHTML = palStandHtml(pal);
  bindStand(stand, pal);
  host.appendChild(stand);
  host.appendChild(mark);
}

function paintRecv() {
  const host = document.getElementById("recv-spot");
  if (!host) return;
  host.innerHTML = "";
  const pal = progress.pallets.find((p) => p.spot === RECV_SPOT);
  host.classList.toggle("has-pal", !!pal);
  const mark = document.createElement("em");
  mark.textContent = "Приёмка";
  if (!pal) {
    host.appendChild(mark);
    return;
  }
  const take = state.shipId && canTakePal(pal);
  const bulkOk = bulkPalOk(pal);
  const stand = document.createElement("div");
  stand.className =
    "pal-stand" +
    (bulkOk ? " bulk-ok" : "") +
    (state.shipId ? (take ? " can-take" : " no-take") : "");
  stand.dataset.id = String(pal.id);
  stand.innerHTML = palStandHtml(pal);
  bindStand(stand, pal);
  host.appendChild(stand);
  host.appendChild(mark);
}

function paintStack() {
  const host = document.getElementById("wood-stack");
  if (!host) return;
  const list = progress.stack || [];
  host.innerHTML = "";
  host.classList.toggle("empty", !list.length);
  host.classList.toggle("can-drop", true);
  const show = list.slice(-4);
  show.forEach((pal, i) => {
    const layer = document.createElement("div");
    layer.className = "stack-layer" + (i === show.length - 1 ? " top" : "");
    layer.style.setProperty("--i", String(i));
    layer.innerHTML = palStandHtml(pal);
    host.appendChild(layer);
  });
  const title = document.createElement("b");
  title.textContent = "Стопка";
  host.appendChild(title);
  const mark = document.createElement("em");
  mark.textContent = list.length ? "×" + list.length : "пусто";
  host.appendChild(mark);
  if (list.length) {
    host.onpointerdown = (e) => {
      const top = list[list.length - 1];
      startWoodDrag(e, top.id, "stack");
    };
  } else {
    host.onpointerdown = null;
  }
}

function currentRush() {
  return (progress.orders || []).find((o) => jobKind(o) === "rush") || null;
}

function hideWayPeek() {
  state.wayPeek = false;
  const sheet = document.getElementById("waybill");
  if (sheet && !sheet.classList.contains("big") && !sheet.classList.contains("fly")) {
    sheet.classList.remove("show");
  }
  document.body.classList.remove("way-peek");
  syncJobsTab();
  if (progress.guide === "build" || progress.guide === "jobs") {
    window.setTimeout(() => showGuide("build"), 80);
  }
}

function showWayPeek() {
  if (!state.shipId && !state.bulkId) return;
  state.wayPeek = true;
  document.body.classList.add("way-peek");
  paintWaybill();
  syncJobsTab();
}

function syncJobsTab() {
  const tab = document.getElementById("jobs-tab");
  const label = document.getElementById("jobs-tab-label");
  const rushEl = document.getElementById("jobs-rush");
  if (!tab) return;
  if (state.shipId && !state.busy) {
    if (label) label.textContent = state.wayPeek ? "Собрать" : "Накладная";
    tab.classList.toggle("can-unload", false);
    tab.classList.toggle("has-rush", false);
    if (rushEl) rushEl.textContent = "";
    return;
  }
  const wait = !!(dockList().length && !state.unloading && floor.classList.contains("show") && !state.shipId && !state.bulkId);
  if (label) label.textContent = wait ? "Принять" : "Заявки";
  tab.classList.toggle("can-unload", wait);
  const rush = currentRush();
  const left = rush && rush.until ? rush.until - Date.now() : 0;
  const show = !!(rush && left > 0 && !inGuide() && !state.shipId && !state.bulkId);
  tab.classList.toggle("has-rush", show);
  if (rushEl) rushEl.textContent = show ? "срочно " + fmtEta(left) : "";
}

function startUnload() {
  if (!dockList().length) return;
  if (!canUnloadHere()) {
    toast(emptyWoods() ? "Сначала поставь поддон со стопки" : "Нужен свободный поддон");
  }
  sfx("doors");
  state.unloading = true;
  paintDock();
  if (inGuide() && (progress.guide === "unload" || progress.guide === "place")) {
    window.setTimeout(() => showGuide("pack"), 220);
  }
}

function paintDock() {
  const dock = document.getElementById("dock");
  const hold = document.getElementById("dock-hold");
  if (!dock || !hold) return;
  const list = dockList();
  const onFloor = floor.classList.contains("show");
  if (!list.length || !onFloor) {
    state.unloading = false;
    document.body.classList.remove("unloading");
    const goOff = document.getElementById("dock-go");
    if (goOff) goOff.hidden = true;
    if (dock.classList.contains("show")) {
      dock.classList.remove("open");
      dock.classList.add("away");
      window.setTimeout(() => {
        if (dockList().length) return;
        dock.hidden = true;
        dock.classList.remove("show", "away");
        syncJobsTab();
      }, 560);
    } else {
      dock.hidden = true;
      dock.classList.remove("show", "open", "away");
    }
    syncJobsTab();
    return;
  }
  dock.hidden = false;
  dock.classList.remove("away");
  if (!dock.classList.contains("show")) {
    void dock.offsetWidth;
    dock.classList.add("show");
  }
  dock.classList.toggle("open", state.unloading);
  document.body.classList.toggle("unloading", state.unloading);
  const go = document.getElementById("dock-go");
  if (go) go.hidden = state.unloading;
  syncJobsTab();
  if (!state.unloading) {
    hold.innerHTML = "";
    return;
  }
  if (state.drag && state.drag.from === "dock") return;
  const item = list[0];
  const keep = hold.querySelector(".dock-pak");
  if (keep && keep.dataset.id === String(item.id) && keep.dataset.left === String(item.left)) return;
  hold.innerHTML = "";
  const sku = skuOf(item.sku);
  const pak = document.createElement("button");
  pak.type = "button";
  pak.className = "dock-pak peek";
  pak.dataset.id = String(item.id);
  pak.dataset.left = String(item.left);
  pak.setAttribute("style", palSkin(sku));
  pak.innerHTML = "<span class=\"pak\">" + pakInner(sku) + "</span>";
  pak.addEventListener("pointerdown", (e) => startPackDrag(e, item.id, "dock"));
  pak.addEventListener("animationend", () => pak.classList.remove("peek"));
  hold.appendChild(pak);
}

function paintWaybill(fresh) {
  const sheet = document.getElementById("waybill");
  if (!sheet) return;
  const bulk = currentBulk();
  const order = currentOrder() || bulk;
  const go = document.getElementById("ship-go");
  if (!order) {
    sheet.classList.remove("show", "ready", "big", "fly", "rush");
    const giftOff = document.getElementById("way-gift");
    if (giftOff) giftOff.hidden = true;
    if (go) go.hidden = true;
    return;
  }
  if (fresh) {
    sheet.classList.remove("show", "ready", "big", "fly");
    void sheet.offsetWidth;
  }
  const peek = jobKind(order) === "bulk" || state.wayPeek || sheet.classList.contains("big") || sheet.classList.contains("fly");
  sheet.classList.toggle("show", peek);
  sheet.classList.toggle("rush", jobKind(order) === "rush");
  document.getElementById("way-id").textContent = "#" + order.id;
  const from = document.getElementById("way-from");
  if (from) from.textContent = orderClient(order);
  document.getElementById("way-pay").textContent = (order.pay >= 0 ? "+" : "") + order.pay;
  const gift = document.getElementById("way-gift");
  if (gift) {
    const rush = jobKind(order) === "rush";
    gift.hidden = !rush;
    if (rush) gift.innerHTML = "<b>+1</b>" + jobPalPic();
  }
  const host = document.getElementById("way-lines");
  host.innerHTML = "";
  if (jobKind(order) === "bulk") {
    const sku = skuOf(bulkSkuOf(order));
    const row = document.createElement("li");
    const done = (order.taken || 0) >= order.bulkN;
    row.className = done ? "ok" : "";
    const left = order.until ? order.until - Date.now() : 0;
    row.innerHTML =
      "<b>" +
      sku.name +
      "</b><span>" +
      (order.taken || 0) +
      "/" +
      order.bulkN +
      " подд.</span><i class=\"tick\">" +
      (done ? "✓" : left > 0 ? fmtEta(left) : "") +
      "</i>";
    host.appendChild(row);
    sheet.classList.toggle("ready", false);
    if (go) go.hidden = true;
    const giftOff = document.getElementById("way-gift");
    if (giftOff) giftOff.hidden = true;
    const hideBulk = document.getElementById("way-hide");
    if (hideBulk) hideBulk.hidden = true;
    return;
  }
  const rushLeft =
    jobKind(order) === "rush" && order.until ? order.until - Date.now() : 0;
  (order.lines || []).forEach((line, i) => {
    const sku = skuOf(line.sku);
    const row = document.createElement("li");
    const done = line.fill >= line.need;
    row.className = done ? "ok" : "";
    const mark = done ? "✓" : i === 0 && rushLeft > 0 ? fmtEta(rushLeft) : i === 0 && rushLeft < 0 && order.until ? "0:00" : "";
    row.innerHTML =
      "<b>" +
      sku.name +
      "</b><span>" +
      line.fill +
      "/" +
      line.need +
      "</span><i class=\"tick\">" +
      mark +
      "</i>";
    host.appendChild(row);
  });
  sheet.classList.toggle("ready", orderDone(order) && !state.busy && extraShip() < 1);
  if (go) go.hidden = !!(state.bulkId || state.busy);
  const hide = document.getElementById("way-hide");
  if (hide) hide.hidden = !!(state.bulkId || state.busy);
}

function extraShip() {
  const order = currentOrder();
  if (!order) return 0;
  const need = {};
  (order.lines || []).forEach((line) => {
    need[line.sku] = (need[line.sku] || 0) + line.need;
  });
  let extra = 0;
  const have = {};
  (state.shipLoad || []).forEach((id) => {
    have[id] = (have[id] || 0) + 1;
  });
  Object.keys(have).forEach((sku) => {
    extra += Math.max(0, have[sku] - (need[sku] || 0));
  });
  return extra;
}

function paintLoad() {}

function paintJobsLead() {
  const lead = document.querySelector("#jobs-pane .lead");
  if (!lead) return;
  lead.textContent =
    "Глянь накладную, закрой и собирай сам. Ошибка бьёт рейтинг и деньги. С рейтингом падают заявки и процент. Сейчас " +
    rateOf().toFixed(1) +
    " ★ · обычная " +
    jobPct("norm") +
    "% · срочная " +
    jobPct("rush") +
    "% · опт " +
    jobPct("bulk") +
    "%.";
}

function paintJobs() {
  paintJobsLead();
  const host = document.getElementById("jobs");
  host.innerHTML = "";
  if (!progress.orders.length) {
    const empty = document.createElement("div");
    empty.className = "job empty";
    empty.innerHTML = "<b class=\"job-mix\">Заявок нет</b><small class=\"job-note\">Сними товар с машины на поддон</small>";
    host.appendChild(empty);
    syncJobsTab();
    return;
  }
  const list = progress.orders.slice().sort((a, b) => {
    return JOB_GRADES.indexOf(a.grade) - JOB_GRADES.indexOf(b.grade);
  });
  list.forEach((order, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.id = String(order.id);
    btn.className = "job " + (order.grade || jobKind(order));
    btn.style.animationDelay = i * 60 + "ms";
    const kind = jobKind(order);
    const clock =
      kind === "rush" && order.until
        ? "<span class=\"job-clock\">" + fmtEta(Math.max(0, order.until - Date.now())) + "</span>"
        : "";
    btn.innerHTML =
      "<em class=\"job-kind\">" +
      (gradeTitle(order.grade) || "Заявка") +
      "</em>" +
      clock +
      "<span class=\"job-client\">" +
      orderClient(order) +
      "</span>" +
      "<b class=\"job-mix\">" +
      jobMixHtml(order) +
      "</b>" +
      jobPalHtml(order) +
      "<strong class=\"job-pay\">+" +
      order.pay +
      "</strong>";
    btn.addEventListener("click", () => {
      closeJobs();
      if (kind === "bulk") startBulk(order.id);
      else startShip(order.id);
    });
    host.appendChild(btn);
  });
  syncJobsTab();
}

function jobMixHtml(order) {
  if (jobKind(order) === "bulk") {
    return "<span class=\"job-sku\">" + order.bulkN + " полных · " + skuOf(bulkSkuOf(order)).name + "</span>";
  }
  return (order.lines || [])
    .map((line) => "<span class=\"job-sku\">" + line.need + "× " + skuOf(line.sku).name + "</span>")
    .join("");
}

function jobPalPic() {
  return "<span class=\"job-pal-pic\" aria-hidden=\"true\"><i></i><i></i><i></i></span>";
}

function jobPalHtml(order) {
  const kind = jobKind(order);
  if (kind === "rush") {
    return "<small class=\"job-pal plus\"><b>+1</b>" + jobPalPic() + "</small>";
  }
  if (kind === "bulk") {
    const n = Math.max(2, Math.min(4, order.bulkN || 2));
    return "<small class=\"job-pal minus\"><b>−" + n + "</b>" + jobPalPic() + "</small>";
  }
  const shop = (order.lines || []).some((line) => stockHave(line.sku) < line.need - line.fill);
  if (shop) return "<small class=\"job-note\">Часть нужно докупить</small>";
  return "";
}

function jobNote(order) {
  const kind = jobKind(order);
  if (kind === "rush") {
    const left = (order.until || 0) - Date.now();
    return left > 0 ? fmtEta(left) : "сгорела";
  }
  if (kind === "bulk") {
    if (order.until && state.bulkId === order.id) {
      const left = order.until - Date.now();
      return left > 0 ? fmtEta(left) : "время";
    }
    return "";
  }
  return "";
}

function syncJobClocks() {
  document.querySelectorAll("#jobs .job[data-id]").forEach((btn) => {
    const order = progress.orders.find((o) => o.id === Number(btn.dataset.id));
    if (!order) return;
    const clock = btn.querySelector(".job-clock");
    if (clock) clock.textContent = jobNote(order) || "0:00";
  });
  syncJobsTab();
  if (state.bulkId || state.shipId) syncWaybillClocks();
}

function syncWaybillClocks() {
  const order = currentOrder() || currentBulk();
  const host = document.getElementById("way-lines");
  if (!order || !host) return;
  const rows = host.querySelectorAll("li");
  if (jobKind(order) === "bulk") {
    const row = rows[0];
    if (!row) return;
    const done = (order.taken || 0) >= order.bulkN;
    const left = order.until ? order.until - Date.now() : 0;
    const span = row.querySelector("span");
    const tick = row.querySelector(".tick");
    if (span) span.textContent = (order.taken || 0) + "/" + order.bulkN + " подд.";
    if (tick) tick.textContent = done ? "✓" : left > 0 ? fmtEta(left) : "";
    row.classList.toggle("ok", done);
    return;
  }
  const rushLeft = jobKind(order) === "rush" && order.until ? order.until - Date.now() : 0;
  (order.lines || []).forEach((line, i) => {
    const row = rows[i];
    if (!row) return;
    const done = line.fill >= line.need;
    const span = row.querySelector("span");
    const tick = row.querySelector(".tick");
    if (span) span.textContent = line.fill + "/" + line.need;
    if (tick) {
      tick.textContent =
        done ? "✓" : i === 0 && rushLeft > 0 ? fmtEta(rushLeft) : i === 0 && order.until && rushLeft <= 0 ? "0:00" : "";
    }
    row.classList.toggle("ok", done);
  });
}

function applyInside() {
  const room = roomOf(progress.room);
  document.body.classList.toggle("in-garage", progress.room === "garage");
  document.body.classList.toggle("in-hangar", progress.room === "hangar");
  document.body.classList.toggle("in-depot", progress.room === "depot");
  const pic = document.getElementById("inside-pic");
  if (!pic) return;
  pic.style.backgroundImage = room && room.inside ? "url(\"" + room.inside + "?v=3\")" : "";
}

function cartCountSku(id) {
  return state.cart.pals.filter((sku) => sku === id).length;
}

function cartTotal() {
  const pals = state.cart.pals.reduce((sum, id) => sum + skuOf(id).cost + DELIVERY_FEE, 0);
  return pals + woodCartCost();
}

function canAddPal(sku) {
  return (
    !!progress.room &&
    isUnlocked(sku.id) &&
    progress.coins >= cartTotal() + sku.cost + DELIVERY_FEE
  );
}

function canAddWood() {
  return !!progress.room && progress.coins >= cartTotal() + woodPrice(state.cart.woods);
}

function tryUnlock(id, btn) {
  const sku = skuOf(id);
  const next = nextLocked();
  if (isUnlocked(id)) return false;
  if (!next || next.id !== id) {
    shake(btn);
    toast(next ? "Сначала открой «" + next.name + "»" : "Уже всё открыто");
    return true;
  }
  const price = unlockPrice(id);
  if (progress.coins < price) {
    shake(btn);
    toast("Не хватает монет");
    return true;
  }
  progress.coins -= price;
  progress.unlocked.push(id);
  saveProgress();
  paintHud();
  paintShop();
  maybeOrders();
  paintJobs();
  toast("Открыт товар «" + sku.name + "»");
  return true;
}

function setQty(btn, n) {
  let qty = btn.querySelector(".qty");
  if (n) {
    if (!qty) {
      qty = document.createElement("i");
      qty.className = "qty";
      btn.appendChild(qty);
    }
    qty.textContent = String(n);
  } else if (qty) {
    qty.remove();
  }
}

function paintShop() {
  const host = document.getElementById("goods");
  if (!host) return;
  host.innerHTML = "";
  SKUS.forEach((sku) => {
    const n = cartCountSku(sku.id);
    const locked = !isUnlocked(sku.id);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.sku = sku.id;
    btn.className =
      "good" +
      (locked ? " locked" : "") +
      (n ? " ready" : locked || canAddPal(sku) ? "" : " poor");
    btn.innerHTML = locked
      ? "<div class=\"shop-stand\">" +
        palMarkup(sku, PALLET_PACKS) +
        "<span class=\"lock-mark\" aria-hidden=\"true\"></span>" +
        "</div><span class=\"unlock-pay\">открыть за " +
        unlockPrice(sku.id) +
        "</span><span class=\"good-meta\"><b>" +
        sku.name +
        "</b></span>"
      : "<div class=\"shop-stand\">" +
        palMarkup(sku, PALLET_PACKS) +
        "</div><span class=\"good-meta\"><b>" +
        sku.name +
        "</b><em>" +
        sku.cost +
        "</em></span>";
    if (n) setQty(btn, n);
    btn.addEventListener("click", () => {
      if (locked) tryUnlock(sku.id, btn);
      else addPalToCart(sku.id, btn);
    });
    host.appendChild(btn);
  });
  const wood = document.createElement("button");
  wood.type = "button";
  wood.dataset.sku = "woods";
  wood.className =
    "good woods" + (state.cart.woods ? " ready" : canAddWood() ? "" : " poor");
  wood.innerHTML =
    "<div class=\"wood-draw\">" +
    palWood("") +
    "</div><span><b>Поддон</b><small>без него не принять и не отгрузить</small></span><em>" +
    woodPrice(state.cart.woods) +
    "</em>";
  if (state.cart.woods) setQty(wood, state.cart.woods);
  wood.addEventListener("click", () => addWoodToCart(wood));
  host.appendChild(wood);
  paintCart();
}

function syncShop() {
  const host = document.getElementById("goods");
  if (!host || !host.children.length) {
    paintShop();
    return;
  }
  SKUS.forEach((sku) => {
    const btn = host.querySelector('.good[data-sku="' + sku.id + '"]');
    if (!btn) return;
    const n = cartCountSku(sku.id);
    const locked = !isUnlocked(sku.id);
    btn.className =
      "good" +
      (locked ? " locked" : "") +
      (n ? " ready" : locked || canAddPal(sku) ? "" : " poor");
    const pay = btn.querySelector(".unlock-pay");
    if (pay) pay.textContent = "открыть за " + unlockPrice(sku.id);
    const em = btn.querySelector(".good-meta em");
    if (em && !locked) em.textContent = String(sku.cost);
    setQty(btn, n);
  });
  const wood = host.querySelector('.good[data-sku="woods"]');
  if (wood) {
    wood.className = "good woods" + (state.cart.woods ? " ready" : canAddWood() ? "" : " poor");
    const em = wood.querySelector("em");
    if (em) em.textContent = String(woodPrice(state.cart.woods));
    setQty(wood, state.cart.woods);
  }
  paintCart();
}

function fillCartLine(row, title, sum) {
  row.innerHTML =
    "<b>" + title + "</b><small>нажми чтобы убрать</small><em>" + sum + "</em>";
}

function cartCount() {
  return state.cart.pals.length + state.cart.woods;
}

function paintCartBar() {
  const label = document.getElementById("cart-label");
  const sum = document.getElementById("cart-sum");
  const n = cartCount();
  if (label) label.textContent = n ? "Корзина · " + n : "Корзина";
  if (sum) sum.textContent = String(cartTotal());
}

function paintCart() {
  const host = document.getElementById("cart-lines");
  const buy = document.getElementById("cart-buy");
  if (!host || !buy) return;
  paintCartBar();
  const counts = {};
  state.cart.pals.forEach((id) => {
    counts[id] = (counts[id] || 0) + 1;
  });
  const ids = Object.keys(counts);
  if (!ids.length && !state.cart.woods) {
    host.innerHTML = "<p class=\"cart-empty\">Корзина пустая. Нажми товар.</p>";
    const fee = document.getElementById("cart-fee");
    if (fee) {
      fee.hidden = true;
      fee.innerHTML = "";
    }
    buy.disabled = true;
    buy.textContent = "Купить";
    return;
  }
  const empty = host.querySelector(".cart-empty");
  if (empty) empty.remove();
  const keep = new Set(ids.concat(state.cart.woods ? ["woods"] : []));
  host.querySelectorAll(".cart-line").forEach((row) => {
    if (!keep.has(row.dataset.sku)) row.remove();
  });
  ids.forEach((id) => {
    const sku = skuOf(id);
    const n = counts[id];
    let row = host.querySelector('.cart-line[data-sku="' + id + '"]');
    if (!row) {
      row = document.createElement("button");
      row.type = "button";
      row.className = "cart-line";
      row.dataset.sku = id;
      row.addEventListener("click", () => dropPalFromCart(id));
      host.appendChild(row);
    }
    fillCartLine(row, sku.name + " ×" + n, sku.cost * n);
  });
  if (state.cart.woods) {
    let row = host.querySelector('.cart-line[data-sku="woods"]');
    if (!row) {
      row = document.createElement("button");
      row.type = "button";
      row.className = "cart-line";
      row.dataset.sku = "woods";
      row.addEventListener("click", dropWoodFromCart);
      host.appendChild(row);
    }
    fillCartLine(row, "Поддоны ×" + state.cart.woods, woodCartCost());
  }
  const fee = document.getElementById("cart-fee");
  if (fee) {
    const pals = state.cart.pals.length;
    if (pals) {
      fee.hidden = false;
      fee.innerHTML =
        "<span>Доставка ×" + pals + "</span><em>" + DELIVERY_FEE * pals + "</em>";
    } else {
      fee.hidden = true;
      fee.innerHTML = "";
    }
  }
  buy.disabled = false;
  buy.textContent = "Купить · " + cartTotal();
}

function addPalToCart(skuId, btn) {
  if (tryUnlock(skuId, btn)) return;
  if (!progress.room) {
    closeShop();
    showScreen(rent);
    return;
  }
  state.cart.pals.push(skuId);
  syncShop();
  if (progress.guide === "water" && skuId === "water") {
    window.setTimeout(() => showGuide("unlock"), 80);
  }
}

function addWoodToCart(btn) {
  if (!progress.room) {
    closeShop();
    showScreen(rent);
    return;
  }
  if (!canAddWood()) {
    shake(btn);
    toast("Не хватает на поддон");
    return;
  }
  state.cart.woods += 1;
  syncShop();
  if (progress.guide === "wood") {
    const cart = document.getElementById("cart");
    if (cart) cart.classList.add("open");
    window.setTimeout(() => showGuide("buy"), 80);
  }
}

function dropPalFromCart(skuId) {
  const i = state.cart.pals.lastIndexOf(skuId);
  if (i >= 0) state.cart.pals.splice(i, 1);
  syncShop();
}

function dropWoodFromCart() {
  if (state.cart.woods > 0) state.cart.woods -= 1;
  syncShop();
}

function checkout(btn) {
  const pals = state.cart.pals.slice();
  const woods = state.cart.woods;
  if (!pals.length && !woods) {
    shake(btn);
    toast("Корзина пустая");
    return;
  }
  if (!progress.room) {
    closeShop();
    showScreen(rent);
    return;
  }
  const total = cartTotal();
  if (progress.coins < total) {
    shake(btn);
    toast("Не хватает денег");
    return;
  }
  if (pals.length && !emptyWoods() && !woods) {
    shake(btn);
    toast("Сначала купи поддон. Без него товар не снять");
    return;
  }
  progress.coins -= total;
  sfx("buy");
  for (let i = 0; i < woods; i += 1) {
    progress.stack.push(makeWood());
    progress.boughtWoods += 1;
  }
  pals.forEach((skuId) => {
    progress.incoming.push({
      id: progress.nextShip,
      sku: skuId,
      packs: PALLET_PACKS,
      left: PALLET_PACKS,
      readyAt: Date.now() + DELIVERY_MS,
    });
    progress.nextShip += 1;
  });
  state.cart.pals = [];
  state.cart.woods = 0;
  document.getElementById("cart").classList.remove("open");
  saveProgress();
  paintHud();
  maybeOrders();
  paintJobs();
  syncShop();
  paintSlots();
  paintTruck();
  document.querySelector(".chip.coin").classList.add("catch");
  const woodChip = document.querySelector(".chip.wood");
  if (woods && woodChip) woodChip.classList.add("catch");
  if (woods && pals.length) toast("Поддоны на стопке. Товар едет минуту.");
  else if (pals.length) toast("Заказал. Машина справа через минуту.");
  else toast("Поддон на стопке слева. Ставь его на место.");
  if (inGuide() && (progress.guide === "buy" || pals.length)) {
    closeShop();
    window.setTimeout(() => showGuide("wait"), 280);
  }
}

function openShop() {
  closeJobs();
  closeShip();
  if (document.querySelector("#goods .good")) syncShop();
  else paintShop();
  document.getElementById("shop").classList.add("show");
  if (progress.guide === "shop") window.setTimeout(() => showGuide("water"), 80);
  else if (progress.guide === "water" || progress.guide === "unlock" || progress.guide === "wood") {
    window.setTimeout(() => showGuide(progress.guide), 80);
  }
}

function openJobs() {
  closeShop();
  paintJobs();
  document.getElementById("jobs-pane").classList.add("show");
  if (progress.guide === "jobs") hideGuide();
}

function nearestReady() {
  const list = roadList();
  if (!list.length) return 0;
  return Math.min.apply(null, list.map((item) => item.readyAt));
}

function paintTruck() {
  const btn = document.getElementById("truck");
  if (!btn) return;
  const road = roadList();
  const on = road.length > 0 && floor.classList.contains("show");
  btn.classList.toggle("show", on);
  if (on) document.getElementById("truck-eta").textContent = fmtEta(nearestReady() - Date.now());
  refreshShipTimes();
  if (floor.classList.contains("show")) paintDock();
}

function paintShipList() {
  const host = document.getElementById("ship-list");
  if (!host) return;
  host.innerHTML = "";
  const list = (progress.incoming || []).slice().sort((a, b) => a.readyAt - b.readyAt);
  if (!list.length) {
    host.innerHTML = "<p class=\"lead\">Сейчас ничего не едет.</p>";
    return;
  }
  list.forEach((item) => {
    const sku = skuOf(item.sku);
    const row = document.createElement("div");
    row.className = "ship-row";
    row.dataset.id = String(item.id);
    row.innerHTML =
      "<b>" +
      sku.name +
      "</b><small>" +
      packsWord(item.left || PALLET_PACKS) +
      "</small><em>" +
      fmtEta(item.readyAt - Date.now()) +
      "</em>";
    host.appendChild(row);
  });
}

function refreshShipTimes() {
  const pane = document.getElementById("ship-pane");
  if (!pane || !pane.classList.contains("show")) return;
  document.querySelectorAll(".ship-row").forEach((row) => {
    const id = Number(row.dataset.id);
    const item = (progress.incoming || []).find((entry) => entry.id === id);
    const eta = row.querySelector("em");
    if (!item || !eta) return;
    eta.textContent = fmtEta(item.readyAt - Date.now());
  });
}

function openShip() {
  if (!(progress.incoming || []).length) return;
  closeShop();
  closeJobs();
  paintShipList();
  document.getElementById("ship-pane").classList.add("show");
}

function settleIncoming() {
  const now = Date.now();
  const fresh = (progress.incoming || []).filter((item) => {
    return item.readyAt <= now && item.left > 0 && !item.seen;
  });
  fresh.forEach((item) => {
    item.seen = true;
  });
  if (fresh.length) saveProgress();
  return fresh;
}

function tickShip() {
  const arrived = settleIncoming();
  paintTruck();
  if (arrived.length) {
    arrived.forEach((item) => {
      toast("Машина приехала. Жми «Принять»");
    });
    sfx("truck");
    if (document.getElementById("ship-pane").classList.contains("show")) paintShipList();
    if (floor.classList.contains("show")) {
      paintDock();
      paintStack();
    }
    if (inGuide() && (progress.guide === "wait" || progress.guide === "wood" || progress.guide === "place")) {
      showGuide(hasGoodsPal() ? "unload" : "place");
    }
  }
  expireOrders();
  let added = false;
  if (!inGuide() && floorPals()) {
    added = !!spawnRushJob() || added;
    added = !!spawnBulkJob() || added;
  }
  if (added) {
    saveProgress();
    paintJobs();
  }
  syncJobClocks();
}

function floorPals() {
  return allPals().filter((p) => p.units > 0).length;
}

function boughtPals() {
  return floorPals() + (progress.incoming || []).reduce((sum, item) => sum + (item.left > 0 ? 1 : 0), 0);
}

function gradeNeed(grade, pals) {
  const n = Math.max(1, pals);
  if (grade === "easy") return Math.min(SHIP_SLOTS, 3 * Math.min(3, 1 + Math.floor((n - 1) / 3)));
  if (grade === "mid") return Math.min(SHIP_SLOTS, 3 * Math.min(6, 2 + Math.floor(n / 2)));
  if (grade === "hard") return Math.min(SHIP_SLOTS, Math.max(6, 3 + n));
  return Math.min(SHIP_SLOTS, Math.max(6, 6 + n));
}

function orderIdle(order) {
  return (order.lines || []).every((line) => !line.fill);
}

function capNeed(lines, max) {
  const out = [];
  let left = max;
  (lines || []).forEach((line) => {
    if (left < 1) return;
    const need = Math.max(1, Math.min(line.need, left));
    out.push({ sku: line.sku, need, fill: 0 });
    left -= need;
  });
  return out;
}

function onFloor() {
  return SKUS.map((s) => ({ sku: s.id, have: stockHave(s.id) })).filter((row) => row.have > 0);
}

function offFloor() {
  return SKUS.map((s) => s.id).filter((id) => stockHave(id) < 1);
}

function rotateList(list, shift) {
  if (!list.length) return list.slice();
  const i = ((shift % list.length) + list.length) % list.length;
  return list.slice(i).concat(list.slice(0, i));
}

function mergeLines(lines) {
  const map = {};
  (lines || []).forEach((line) => {
    if (!map[line.sku]) map[line.sku] = { sku: line.sku, need: 0, fill: 0 };
    map[line.sku].need += line.need;
  });
  return Object.keys(map).map((key) => map[key]);
}

function linesFrom(picks, total) {
  if (!picks.length || total < 1) return [];
  const n = Math.min(picks.length, total);
  const pick = picks.slice(0, n);
  const need = pick.map(() => 1);
  let left = total - n;
  let i = pick.length - 1;
  while (left > 0) {
    need[i] += 1;
    left -= 1;
    i = i <= 0 ? pick.length - 1 : i - 1;
  }
  return pick.map((row, idx) => ({ sku: row.sku, need: need[idx], fill: 0 }));
}

function linesForGrade(grade, shift) {
  const have = rotateList(
    onFloor().filter((row) => isUnlocked(row.sku)),
    shift == null ? progress.nextOrder : shift
  );
  const pals = boughtPals();
  const want = gradeNeed(grade, pals);
  const locked = SKUS.map((s) => s.id).filter((id) => !isUnlocked(id));
  if (grade !== "wild" && !have.length) return null;
  if (grade === "easy") {
    return [{ sku: have[0].sku, need: Math.min(want, have[0].have), fill: 0 }];
  }
  if (grade === "mid" || grade === "hard") {
    const pool = have.reduce((sum, row) => sum + row.have, 0);
    const cap = Math.min(want, pool);
    if (cap < 1) return null;
    const kinds =
      grade === "hard"
        ? Math.min(have.length, cap >= 6 ? 3 : 2)
        : Math.min(have.length, have.length >= 2 && cap >= 2 ? 2 : 1);
    return linesFrom(have.slice(0, kinds), cap);
  }
  const extra = 2 + Math.floor(pals / 4);
  const missing = offFloor().filter((id) => isUnlocked(id));
  const shopSku = locked[0] || (missing.length ? missing[(shift == null ? progress.nextOrder : shift) % missing.length] : "");
  const stockWant = Math.max(1, want - extra);
  const pool = have.reduce((sum, row) => sum + row.have, 0);
  const base = have.length
    ? linesFrom(
        have.slice(0, Math.min(have.length, stockWant >= 4 ? 2 : 1)),
        Math.min(stockWant, Math.max(1, pool))
      )
    : [];
  if (shopSku) {
    base.push({ sku: shopSku, need: extra, fill: 0 });
    return capNeed(mergeLines(base), SHIP_SLOTS);
  }
  if (!have.length) return null;
  base.push({ sku: have[0].sku, need: extra, fill: 0 });
  return capNeed(mergeLines(base), SHIP_SLOTS);
}

function maybeOrders() {
  pruneOrders();
  if (inGuide()) {
    ensureGuideJob();
    saveProgress();
    return;
  }
  if (!floorPals()) {
    saveProgress();
    return;
  }
  const used = new Set();
  const shipId = state.shipId;
  progress.orders = (progress.orders || []).filter((order) => {
    const kind = jobKind(order);
    if (kind === "rush" || kind === "bulk") return true;
    if (NORM_GRADES.indexOf(order.grade) < 0) return false;
    if (order.grade === "mid" && rateOf() < 2.5 && order.id !== shipId && orderIdle(order)) return false;
    used.add(order.grade);
    return true;
  });
  progress.orders.forEach((order) => {
    if (jobKind(order) !== "norm") return;
    if (order.id === shipId || !orderIdle(order)) return;
    const lines = linesForGrade(order.grade, order.id);
    if (!lines || !lines.length) return;
    order.lines = lines;
    order.kind = "norm";
    order.pay = jobPay(lines, "norm");
  });
  NORM_GRADES.forEach((grade) => {
    if (used.has(grade)) return;
    if (grade === "mid" && rateOf() < 2.5) return;
    const lines = linesForGrade(grade);
    if (!lines || !lines.length) return;
    progress.orders.push({
      id: progress.nextOrder,
      kind: "norm",
      grade: grade,
      lines: lines,
      pay: jobPay(lines, "norm"),
      until: 0,
      bulkN: 0,
      taken: 0,
      client: orderClient({ id: progress.nextOrder, kind: "norm", grade: grade }),
    });
    progress.nextOrder += 1;
    used.add(grade);
  });
  spawnRushJob();
  spawnBulkJob();
  progress.orders.forEach((order) => {
    if (jobKind(order) === "bulk" && !order.taken && state.bulkId !== order.id) {
      const sku = pickBulkSku();
      const n = Math.max(2, order.bulkN || pickBulkN());
      if (sku && (!order.lines[0] || order.lines[0].sku !== sku)) {
        order.lines = [{ sku: sku, need: n * PALLET_PACKS, fill: 0 }];
        order.bulkN = n;
      }
    }
    order.pay = Math.max(1, jobPay(order.lines, jobKind(order)));
  });
  saveProgress();
}

function ensureGuideJob() {
  if (progress.orders.some((o) => jobKind(o) === "norm")) return;
  const lines = linesForGrade("easy");
  if (!lines || !lines.length) return;
  progress.orders.push({
    id: progress.nextOrder,
    kind: "norm",
    grade: "easy",
    lines: lines,
    pay: jobPay(lines, "norm"),
    until: 0,
    bulkN: 0,
    taken: 0,
    client: orderClient({ id: progress.nextOrder, kind: "norm", grade: "easy" }),
  });
  progress.nextOrder += 1;
}

function spawnRushJob() {
  if (progress.orders.some((o) => jobKind(o) === "rush")) return false;
  if (rateOf() < 3.5) return false;
  if (!(progress.rushAt || 0)) {
    progress.rushAt = Date.now();
    return true;
  }
  if (Date.now() < progress.rushAt + RUSH_COOLDOWN) return false;
  const lines = linesForGrade("easy");
  if (!lines || !lines.length) return false;
  progress.orders.push({
    id: progress.nextOrder,
    kind: "rush",
    grade: "rush",
    lines: lines,
    pay: jobPay(lines, "rush"),
    until: Date.now() + RUSH_MS,
    bulkN: 0,
    taken: 0,
    client: orderClient({ id: progress.nextOrder, kind: "rush", grade: "rush" }),
  });
  progress.nextOrder += 1;
  return true;
}

function giftRushPal() {
  sfx("gift");
  progress.stack.push(makeWood());
  saveProgress();
  paintHud();
  paintSlots();
  markGiftStack();
  const chip = document.querySelector(".chip.wood");
  if (chip) {
    chip.classList.remove("catch");
    void chip.offsetWidth;
    chip.classList.add("catch");
  }
}

async function flyRushPalGift() {
  const from = document.getElementById("way-gift") || document.getElementById("waybill");
  const stack = document.getElementById("wood-stack");
  const fly = document.createElement("div");
  fly.className = "rush-gift";
  fly.innerHTML = "<em>+1</em>" + palMarkup(null, 0);
  document.body.appendChild(fly);
  const start = from ? from.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight * 0.35, width: 80, height: 40 };
  fly.style.left = start.left + start.width / 2 + "px";
  fly.style.top = start.top + start.height / 2 + "px";
  fly.style.transform = "scale(0.28)";
  if (from) from.style.opacity = "0";
  await wait(40);
  fly.classList.add("drop");
  fly.style.left = window.innerWidth / 2 + "px";
  fly.style.top = window.innerHeight * 0.42 + "px";
  fly.style.transform = "scale(1)";
  await wait(820);
  const to = stack ? stack.getBoundingClientRect() : { left: 40, top: window.innerHeight - 80, width: 80 };
  fly.classList.remove("drop");
  fly.classList.add("to-stack");
  fly.style.left = to.left + to.width / 2 + "px";
  fly.style.top = to.top + 22 + "px";
  fly.style.transform = "scale(0.38)";
  await wait(660);
  fly.remove();
  giftRushPal();
}

function pickBulkSku() {
  const unlocked = SKUS.map((s) => s.id).filter((id) => isUnlocked(id)).reverse();
  const full = {};
  const any = {};
  goodsPals().forEach((p) => {
    if (!p.sku) return;
    if (p.units >= PALLET_PACKS) full[p.sku] = (full[p.sku] || 0) + 1;
    if (p.units > 0) any[p.sku] = true;
  });
  for (let i = 0; i < unlocked.length; i += 1) {
    if (full[unlocked[i]]) return unlocked[i];
  }
  for (let i = 0; i < unlocked.length; i += 1) {
    if (any[unlocked[i]]) return unlocked[i];
  }
  return unlocked[0] || "water";
}

function pickBulkN() {
  const room = roomOf(progress.room);
  const cap = room ? room.slots : 5;
  const max = Math.max(2, Math.min(4, cap - 1));
  const min = 2;
  return min + Math.floor(Math.random() * (max - min + 1));
}

function spawnBulkJob() {
  if (progress.orders.some((o) => jobKind(o) === "bulk")) return false;
  if (rateOf() < 3.2) return false;
  const sku = pickBulkSku();
  if (!sku) return false;
  const n = pickBulkN();
  const lines = [{ sku: sku, need: n * PALLET_PACKS, fill: 0 }];
  progress.orders.push({
    id: progress.nextOrder,
    kind: "bulk",
    grade: "bulk",
    lines: lines,
    pay: jobPay(lines, "bulk"),
    until: 0,
    bulkN: n,
    taken: 0,
    client: orderClient({ id: progress.nextOrder, kind: "bulk", grade: "bulk" }),
  });
  progress.nextOrder += 1;
  return true;
}

function currentBulk() {
  return progress.orders.find((o) => o.id === state.bulkId) || null;
}

function bulkSkuOf(order) {
  return order && order.lines && order.lines[0] ? order.lines[0].sku : "";
}

function bulkPalOk(pal) {
  const order = currentBulk();
  if (!order || !pal) return false;
  return pal.spot !== BUILD_SPOT && pal.units >= PALLET_PACKS && pal.sku === bulkSkuOf(order);
}

function openFloor() {
  const room = roomOf(progress.room);
  document.getElementById("yard-name").textContent = room ? room.name : "Склад";
  applyInside();
  maybeOrders();
  paintHud();
  paintJobs();
  paintShop();
  showScreen(floor);
  const gift = maybeGiftFirstPal();
  paintSlots();
  if (gift) markGiftStack();
  if (state.shipId || state.bulkId) {
    paintWaybill();
    paintLoad();
  }
  paintTruck();
}

function clearCart() {
  state.cart.pals = [];
  state.cart.woods = 0;
}

function resetProgress() {
  if (!window.confirm("Сбросить весь прогресс?")) return;
  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem("sklad-progress-v1");
  localStorage.removeItem("sklad-progress-v2");
  localStorage.removeItem("sklad-progress-v3");
  const fresh = emptyProgress();
  Object.keys(progress).forEach((key) => {
    delete progress[key];
  });
  Object.assign(progress, fresh);
  clearCart();
  saveProgress();
  paintHud();
  showScreen(boot);
  toast("Начинаешь заново");
}

function startShip(id) {
  if (state.busy || state.bulkId) return;
  const order = progress.orders.find((o) => o.id === id);
  if (!order) return;
  if (jobKind(order) === "bulk") {
    startBulk(id);
    return;
  }
  if (jobKind(order) === "rush" && order.until && Date.now() > order.until) {
    toast("Срочная уже сгорела");
    expireOrders();
    return;
  }
  closeShop();
  closeJobs();
  closeShip();
  state.shipId = id;
  state.shipPalId = 0;
  state.shipLoad = [];
  state.wayPeek = true;
  const build = progress.pallets.find((p) => p.spot === BUILD_SPOT && p.units < 1);
  if (build) state.shipPalId = build.id;
  document.body.classList.add("shipping", "way-peek");
  document.body.classList.remove("loading", "gone");
  sfx("paper");
  paintWaybill(true);
  paintSlots();
  if (!state.shipPalId && (progress.stack || []).some((p) => p.units < 1)) {
    toast("Поставь поддон вниз, на сборку");
  } else if (!state.shipPalId && !emptyWoods()) {
    toast("Купи поддон. Без него не отгрузить");
  } else if (!state.shipPalId) {
    toast("Поставь поддон вниз, на сборку");
  } else if ((order.lines || []).some((line) => !isUnlocked(line.sku))) {
    toast("Этот вид ещё закрыт. Открой его в магазине");
  } else if ((order.lines || []).some((line) => stockHave(line.sku) < line.need - line.fill)) {
    toast("Часть паков нужно докупить в магазине");
  } else {
    toast(jobKind(order) === "rush" ? "Глянь накладную и собирай. Срочная ждёт" : "Глянь накладную, закрой и собирай сам");
  }
  if (progress.guide === "jobs") window.setTimeout(() => showGuide("build"), 120);
}

function startBulk(id) {
  if (state.busy || state.shipId || state.bulkId) return;
  const order = progress.orders.find((o) => o.id === id);
  if (!order || jobKind(order) !== "bulk") return;
  closeShop();
  closeJobs();
  closeShip();
  state.bulkId = id;
  if (!order.until) order.until = Date.now() + BULK_MS;
  order.taken = order.taken || 0;
  saveProgress();
  document.body.classList.add("bulk-ship", "shipping", "loading");
  document.body.classList.remove("gone");
  sfx("paper");
  paintWaybill(true);
  paintSlots();
  toast("Перетащи полные поддоны в машину. Заберёт с деревом");
}

function endBulk() {
  hideGhost();
  state.bulkId = 0;
  state.drag = null;
  document.body.classList.remove("bulk-ship", "shipping", "loading", "gone");
  const sheet = document.getElementById("waybill");
  if (sheet) {
    sheet.classList.remove("show", "ready", "big", "fly", "rush");
    const gift = document.getElementById("way-gift");
    if (gift) {
      gift.hidden = true;
      gift.style.opacity = "";
    }
  }
  const go = document.getElementById("ship-go");
  if (go) go.hidden = true;
  syncJobsTab();
}

async function takeBulkPal(pal) {
  const order = currentBulk();
  if (!order || !pal || !bulkPalOk(pal)) return false;
  progress.pallets = progress.pallets.filter((p) => p.id !== pal.id);
  order.taken = (order.taken || 0) + 1;
  saveProgress();
  paintHud();
  paintSlots();
  paintWaybill();
  if (order.taken >= order.bulkN) {
    await finishBulk(order);
  } else {
    toast("Забрал " + order.taken + " из " + order.bulkN);
  }
  return true;
}

async function finishBulk(order) {
  if (state.busy || !order) return;
  state.busy = true;
  document.body.classList.add("gone");
  flyCoins(document.getElementById("way-pay"), document.querySelector(".chip.coin"), 9);
  await wait(780);
  progress.coins += order.pay;
  progress.orders = progress.orders.filter((o) => o.id !== order.id);
  saveProgress();
  paintHud();
  const chip = document.querySelector(".chip.coin");
  if (chip) {
    chip.classList.remove("catch");
    void chip.offsetWidth;
    chip.classList.add("catch");
  }
  await wait(480);
  endBulk();
  paintSlots();
  maybeOrders();
  paintJobs();
  toast("Опт забрал " + order.bulkN + " поддонов");
  state.busy = false;
}

function expireOrders() {
  const now = Date.now();
  let lost = "";
  progress.orders = (progress.orders || []).filter((order) => {
    const kind = jobKind(order);
    if (kind === "rush" && order.until && now > order.until) {
      if (state.shipId === order.id) endShip();
      progress.rushAt = now;
      lost = "rush";
      return false;
    }
    if (kind === "bulk" && order.until && now > order.until) {
      if (state.bulkId === order.id) endBulk();
      lost = "bulk";
      return false;
    }
    return true;
  });
  if (lost) {
    if (lost === "bulk") addRate(-0.2);
    saveProgress();
    paintHud();
    paintJobs();
    paintWaybill();
    if (lost === "rush") toast("Срочная сгорела");
    else toast("Опт ушёл. Рейтинг " + rateOf().toFixed(1));
  }
}

function endShip() {
  hideGhost();
  state.shipId = 0;
  state.shipPalId = 0;
  state.shipGone = false;
  state.shipLoad = [];
  state.wayPeek = false;
  state.drag = null;
  document.body.classList.remove("shipping", "loading", "gone", "way-peek");
  const bay = document.getElementById("load-bay");
  if (bay) bay.classList.remove("show", "into-truck", "away");
  const sheet = document.getElementById("waybill");
  if (sheet) {
    sheet.classList.remove("show", "ready", "big", "fly", "rush");
    const gift = document.getElementById("way-gift");
    if (gift) {
      gift.hidden = true;
      gift.style.opacity = "";
    }
  }
  const go = document.getElementById("ship-go");
  if (go) go.hidden = true;
  syncJobsTab();
}

function hideGhost() {
  const ghost = document.getElementById("drag-ghost");
  if (!ghost) return;
  ghost.hidden = true;
  ghost.classList.remove("is-pal");
  ghost.innerHTML = "";
  ghost.style.transition = "";
  ghost.removeAttribute("style");
}

function palGrabFrom(e) {
  const stand = e.currentTarget && e.currentTarget.closest ? e.currentTarget.closest(".pal-stand") : null;
  const layer =
    !stand && e.currentTarget && e.currentTarget.querySelector
      ? e.currentTarget.querySelector(".stack-layer.top")
      : null;
  const el = stand || layer || e.currentTarget;
  if (!el || !el.getBoundingClientRect) {
    return { startX: e.clientX, startY: e.clientY, left: e.clientX - 54, top: e.clientY - 90 };
  }
  const box = el.getBoundingClientRect();
  return {
    startX: e.clientX,
    startY: e.clientY,
    left: box.left,
    top: box.top,
  };
}

function moveGhost(x, y) {
  const ghost = document.getElementById("drag-ghost");
  if (!ghost) return;
  const grab = state.drag && state.drag.grab;
  if (grab && grab.alignX != null) {
    ghost.style.left = grab.alignX + (x - grab.startX) + "px";
    ghost.style.top = grab.alignY + (y - grab.startY) + "px";
    return;
  }
  const ox = ghost.classList.contains("is-pal") ? 54 : 17;
  const oy = ghost.classList.contains("is-pal") ? 28 : 40;
  ghost.style.left = x - ox + "px";
  ghost.style.top = y - oy + "px";
}

function findPal(id) {
  return progress.pallets.find((p) => p.id === id) || (progress.stack || []).find((p) => p.id === id) || null;
}

function hitEl(x, y, sel, pad) {
  const p = pad || 0;
  const list = document.querySelectorAll(sel);
  for (let i = 0; i < list.length; i += 1) {
    const box = list[i].getBoundingClientRect();
    if (x >= box.left - p && x <= box.right + p && y >= box.top - p && y <= box.bottom + p) return list[i];
  }
  return null;
}

function palFromPoint(x, y) {
  const p = 32;
  const recv = document.getElementById("recv-spot");
  if (recv && recv.classList.contains("has-pal")) {
    const box = recv.getBoundingClientRect();
    if (x >= box.left - p && x <= box.right + p && y >= box.top - p && y <= box.bottom + p) {
      const pal = progress.pallets.find((row) => row.spot === RECV_SPOT);
      if (pal) return pal;
    }
  }
  const build = document.getElementById("build-spot");
  if (build && build.classList.contains("has-pal")) {
    const box = build.getBoundingClientRect();
    if (x >= box.left - p && x <= box.right + p && y >= box.top - p && y <= box.bottom + p) {
      const pal = progress.pallets.find((row) => row.spot === BUILD_SPOT);
      if (pal) return pal;
    }
  }
  const spot = hitEl(x, y, ".pal-spot.has-pal", 32);
  const stand = (spot && spot.querySelector(".pal-stand")) || hitEl(x, y, "#slots .pal-stand", 32);
  if (!stand) return null;
  return progress.pallets.find((p) => p.id === Number(stand.dataset.id)) || null;
}

function beginGhost(html, x, y, skin) {
  const ghost = document.getElementById("drag-ghost");
  ghost.hidden = false;
  ghost.classList.toggle("is-pal", html.indexOf("pal-live") >= 0);
  ghost.removeAttribute("style");
  if (skin) ghost.setAttribute("style", skin);
  ghost.innerHTML = html;
  const grab = state.drag && state.drag.grab;
  if (grab && grab.startX != null) {
    ghost.style.left = "0px";
    ghost.style.top = "0px";
    const box = ghost.getBoundingClientRect();
    grab.alignX = grab.left - box.left;
    grab.alignY = grab.top - box.top;
  }
  moveGhost(x, y);
}

function startWoodDrag(e, palId, from) {
  if (state.busy || state.drag) return;
  const pal = findPal(palId);
  if (!pal) return;
  if (state.shipId && pal.id === state.shipPalId && (pal.units > 0 || (state.shipLoad || []).length)) {
    shake(e.currentTarget);
    toast("Сначала отгрузи товар");
    return;
  }
  if (state.shipId && pal.units > 0 && pal.spot !== BUILD_SPOT && !state.bulkId) return;
  const grab = palGrabFrom(e);
  const yard = document.getElementById("inside");
  if (yard) yard.classList.add("is-drag");
  state.drag = { kind: "wood", pal: pal, palId: pal.id, from: from, fromSpot: pal.spot, held: true, grab: grab };
  if (from === "stack") {
    progress.stack = progress.stack.filter((p) => p.id !== pal.id);
    if (progress.guide === "place") hideGuide();
  } else {
    progress.pallets = progress.pallets.filter((p) => p.id !== pal.id);
    if (state.shipPalId === pal.id && pal.units > 0) state.shipPalId = 0;
  }
  bindDrag(e);
  beginGhost(palStandHtml(pal), e.clientX, e.clientY);
  paintSlots();
  sfx("grabWood");
}

function startPackDrag(e, id, from) {
  if (state.busy || state.drag) return;
  if (from !== "dock" && wayOpen()) {
    shake(e.currentTarget);
    toast("Сначала закрой накладную");
    return;
  }
  if (from === "dock") {
    const item = (progress.incoming || []).find((row) => row.id === id && row.left > 0);
    if (!item) return;
    if (!canParkPack(item.sku)) {
      shake(e.currentTarget);
      toast(emptyWoods() ? "Сначала поставь поддон" : "Нужен свободный поддон");
      return;
    }
    if (e.currentTarget.parentNode) e.currentTarget.remove();
    item.left -= 1;
    state.drag = { kind: "pack", from: "dock", dockId: item.id, sku: item.sku, held: true };
    beginGhost("<span class=\"pak\">" + pakInner(skuOf(item.sku)) + "</span>", e.clientX, e.clientY, palSkin(skuOf(item.sku)));
  } else {
    const pal = progress.pallets.find((p) => p.id === id);
    if (!pal) return;
    if (state.shipId && pal.id === state.shipPalId) {
      const sku = takeShipPack(e);
      if (!sku) return;
      syncOrderFill(currentOrder());
      state.drag = { kind: "pack", from: "ship", palId: pal.id, sku: sku, held: true };
      beginGhost("<span class=\"pak\">" + pakInner(skuOf(sku)) + "</span>", e.clientX, e.clientY, palSkin(skuOf(sku)));
      const stand = e.currentTarget.closest(".pal-stand") || e.currentTarget;
      stand.innerHTML = palStandHtml(pal);
    } else {
      if (pal.units < 1) return;
      if (state.shipId && !canTakePal(pal)) {
        shake(e.currentTarget);
        return;
      }
      pal.units -= 1;
      const sku = pal.sku;
      if (pal.units < 1) pal.sku = "";
      state.drag = { kind: "pack", from: "floor", palId: pal.id, sku: sku, held: true };
      beginGhost("<span class=\"pak\">" + pakInner(skuOf(sku)) + "</span>", e.clientX, e.clientY, palSkin(skuOf(sku)));
      const stand = e.currentTarget.closest(".pal-stand") || e.currentTarget;
      stand.innerHTML = palStandHtml(pal);
    }
  }
  const yard = document.getElementById("inside");
  if (yard) yard.classList.add("is-drag");
  bindDrag(e);
  sfx("grabPak");
}

const DRAG_LISTEN = { capture: true, passive: false };

function bindDrag(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (e && e.pointerId != null) {
    try {
      document.body.setPointerCapture(e.pointerId);
    } catch (_) {}
  }
  window.addEventListener("pointermove", onDragMove, DRAG_LISTEN);
  window.addEventListener("pointerup", onDragEnd, DRAG_LISTEN);
  window.addEventListener("pointercancel", onDragEnd, DRAG_LISTEN);
}

function unbindDrag(e) {
  window.removeEventListener("pointermove", onDragMove, DRAG_LISTEN);
  window.removeEventListener("pointerup", onDragEnd, DRAG_LISTEN);
  window.removeEventListener("pointercancel", onDragEnd, DRAG_LISTEN);
  if (e && e.pointerId != null) {
    try {
      document.body.releasePointerCapture(e.pointerId);
    } catch (_) {}
  }
}

function takeShipPack(e) {
  const pak = e && e.target && e.target.closest ? e.target.closest(".pak") : null;
  if (!pak || pak.classList.contains("empty")) return "";
  const i = Number(pak.dataset.i);
  if (i >= 0 && i < (state.shipLoad || []).length) return state.shipLoad.splice(i, 1)[0];
  const sku = pak.dataset.sku;
  const idx = (state.shipLoad || []).lastIndexOf(sku);
  if (idx < 0) return "";
  return state.shipLoad.splice(idx, 1)[0];
}

function restoreHeld(drag) {
  if (!drag || !drag.held) return;
  if (drag.kind === "wood") {
    restoreWoodPal(drag);
    return;
  } else if (drag.from === "dock") {
    const item = (progress.incoming || []).find((row) => row.id === drag.dockId);
    if (item) item.left += 1;
  } else if (drag.from === "ship") {
    state.shipLoad.push(drag.sku);
    syncOrderFill(currentOrder());
  } else if (drag.from === "floor") {
    const pal = progress.pallets.find((p) => p.id === drag.palId);
    if (pal) {
      pal.units += 1;
      pal.sku = pal.sku || drag.sku;
    }
  }
  drag.held = false;
}

function onDragMove(e) {
  if (!state.drag) return;
  if (e && e.preventDefault) e.preventDefault();
  moveGhost(e.clientX, e.clientY);
  document.querySelectorAll(".pal-spot, .wood-stack, .pal-stand, .build-spot, .recv-spot, .out-truck").forEach((el) => el.classList.remove("hot"));
  const stack = hitEl(e.clientX, e.clientY, ".wood-stack", 16);
  const spot = hitEl(e.clientX, e.clientY, ".pal-spot", 24);
  const build = hitEl(e.clientX, e.clientY, ".build-spot", 24);
  const recv = hitEl(e.clientX, e.clientY, ".recv-spot", 24);
  if (state.drag.kind === "wood") {
    if (state.bulkId) {
      const truck = hitEl(e.clientX, e.clientY, "#out-truck", 36);
      if (truck) truck.classList.add("hot");
      return;
    }
    const loaded = !!(state.drag.pal && state.drag.pal.units > 0);
    if (stack && !loaded) stack.classList.add("hot");
    else if (recv && !recv.classList.contains("has-pal") && !(state.shipId && build && !build.classList.contains("has-pal"))) recv.classList.add("hot");
    else if (build && !build.classList.contains("has-pal")) build.classList.add("hot");
    else if (spot && !spot.classList.contains("has-pal")) spot.classList.add("hot");
  } else {
    if (
      recv &&
      !recv.classList.contains("has-pal") &&
      state.drag.from === "dock" &&
      !state.shipId &&
      (progress.stack || []).some((p) => p.units < 1)
    ) {
      recv.classList.add("hot");
    } else {
      const pal = palFromPoint(e.clientX, e.clientY);
      const stand = pal && document.querySelector('.pal-stand[data-id="' + pal.id + '"]');
      if (pal && stand && canDropPackOn(pal, state.drag.sku)) {
        stand.classList.add("hot");
        const cell = stand.closest(".pal-spot") || stand.closest(".build-spot") || stand.closest(".recv-spot");
        if (cell) cell.classList.add("hot");
      }
    }
  }
}

function placePalOnSpot(pal, spot) {
  pal.spot = spot;
  progress.pallets.push(pal);
}

function restoreWoodPal(drag) {
  const pal = drag && drag.pal;
  if (!pal) return;
  if (drag.fromSpot != null && drag.fromSpot >= 0) {
    pal.spot = drag.fromSpot;
    progress.pallets.push(pal);
  } else {
    pal.spot = -1;
    progress.stack.push(pal);
  }
  drag.held = false;
}

async function flyGhostIntoTruck() {
  const ghost = document.getElementById("drag-ghost");
  const truck = document.getElementById("out-truck");
  if (!ghost || ghost.hidden || !truck) {
    hideGhost();
    return;
  }
  const box = truck.getBoundingClientRect();
  ghost.style.transition = "left 0.32s ease, top 0.32s ease, opacity 0.32s ease";
  ghost.style.left = box.left + box.width * 0.32 + "px";
  ghost.style.top = box.top + box.height * 0.48 + "px";
  ghost.style.opacity = "0";
  sfx("whoosh");
  await wait(340);
  hideGhost();
}

async function onDragEnd(e) {
  unbindDrag(e);
  const yard = document.getElementById("inside");
  if (yard) yard.classList.remove("is-drag");
  document.querySelectorAll(".hot").forEach((el) => el.classList.remove("hot"));
  const drag = state.drag;
  state.drag = null;
  if (!drag) {
    hideGhost();
    return;
  }
  const x = e.clientX;
  const y = e.clientY;
  if (drag.kind === "wood") {
    const pal = drag.pal;
    if (state.bulkId && pal) {
      const truck = hitEl(x, y, "#out-truck", 36);
      if (truck && bulkPalOk(pal)) {
        drag.held = false;
        await flyGhostIntoTruck();
        await takeBulkPal(pal);
        return;
      }
      restoreWoodPal(drag);
      hideGhost();
      saveProgress();
      paintSlots();
      if (truck) toast("Нужен полный поддон этого товара");
      return;
    }
    const stackHit = hitEl(x, y, ".wood-stack", 16);
    const buildEl = hitEl(x, y, ".build-spot:not(.has-pal)", 24);
    const recvEl = hitEl(x, y, ".recv-spot:not(.has-pal)", 24);
    const spotEl = hitEl(x, y, ".pal-spot:not(.has-pal)", 24);
    if (pal && !stackHit && recvEl && !(state.shipId && buildEl)) {
      pal.spot = RECV_SPOT;
      progress.pallets.push(pal);
    } else if (pal && !stackHit && buildEl) {
      pal.spot = BUILD_SPOT;
      progress.pallets.push(pal);
      if (state.shipId && pal.units < 1) state.shipPalId = pal.id;
    } else if (pal && !stackHit && spotEl) {
      pal.spot = Number(spotEl.dataset.spot);
      progress.pallets.push(pal);
    } else if (pal && pal.units > 0) {
      restoreWoodPal(drag);
      if (stackHit) toast("На стопку только пустой поддон");
    } else if (pal) {
      pal.spot = -1;
      progress.stack.push(pal);
    }
    drag.held = false;
    hideGhost();
    saveProgress();
    paintHud();
    const placed = pal && !stackHit && (buildEl || recvEl || spotEl);
    const gift = placed ? maybeGiftFirstPal() : false;
    paintSlots();
    if (gift) markGiftStack();
    if (placed) {
      sfx("dropWood");
      const stand = document.querySelector('.pal-stand[data-id="' + pal.id + '"]');
      if (stand) stand.classList.add("drop-in");
    } else if (pal && pal.units < 1) {
      sfx("dropWood");
    }
    if (inGuide() && progress.guide === "place") {
      if (placed && spotEl) window.setTimeout(() => showGuide(dockList().length ? "unload" : "wait"), 80);
      else showGuide("place");
    }
    return;
  }
  let pal = palFromPoint(x, y);
  if (!pal && drag.from === "dock" && !state.shipId && hitEl(x, y, ".recv-spot:not(.has-pal)", 28)) {
    pal = takeWoodToRecv();
  }
  if (!pal || !canDropPackOn(pal, drag.sku)) {
    restoreHeld(drag);
    hideGhost();
    paintSlots();
    sfx("no");
    if (state.shipId) {
      if (pal && pal.id === state.shipPalId) toast("Сборка уже полная");
      else if (drag.from === "floor") toast("Клади на нижний поддон");
    } else if (pal && drag.from === "floor") toast("Сюда только такой же товар");
    return;
  }
  hideGhost();
  await dropPackOn(pal, drag);
}

async function dropPackOn(pal, drag) {
  if (state.shipId && pal.id === state.shipPalId) {
    const order = currentOrder();
    if (!order) {
      restoreHeld(drag);
      paintSlots();
      return;
    }
    if (!state.shipPalId) state.shipPalId = pal.id;
    drag.held = false;
    state.shipLoad.push(drag.sku);
    syncOrderFill(order);
    saveProgress();
    paintSlots();
    paintWaybill();
    sfx("dropPak");
    if (orderDone(order) && extraShip() < 1) sfx("full");
    if ((progress.guide === "build" || progress.guide === "jobs") && (state.shipLoad || []).length === 1) {
      window.setTimeout(() => showGuide("send"), 80);
    }
    return;
  }
  drag.held = false;
  pal.units += 1;
  pal.sku = pal.sku || drag.sku;
  sfx("dropPak");
  if (pal.units >= PALLET_PACKS) sfx("full");
  progress.incoming = (progress.incoming || []).filter((item) => item.left > 0);
  saveProgress();
  paintHud();
  paintSlots();
  if (pal.spot === RECV_SPOT && pal.units === 1) {
    const stand = document.querySelector('.pal-stand[data-id="' + pal.id + '"]');
    if (stand) stand.classList.add("drop-in");
  }
  maybeOrders();
  paintJobs();
  if ((progress.guide === "pack" || progress.guide === "place" || progress.guide === "unload") && drag.from === "dock") {
    if (!progress.giftedPal) playGuideGift();
    if (!dockList().length) {
      const wait = document.querySelector(".guide-gift") ? 780 : 160;
      window.setTimeout(() => {
        if (dockList().length) return;
        if (progress.guide === "pack" || progress.guide === "place" || progress.guide === "unload") {
          showGuide("jobs");
        }
      }, wait);
    }
  }
}

async function finishShip(order) {
  if (state.busy || !order) return;
  const rush = jobKind(order) === "rush";
  const verdict = judgeShip(order);
  state.busy = true;
  const go = document.getElementById("ship-go");
  if (go) go.hidden = true;
  const sheet = document.getElementById("waybill");
  if (sheet) {
    sheet.classList.remove("ready");
    sheet.classList.add("show");
  }
  const payEl = document.getElementById("way-pay");
  if (payEl) payEl.textContent = (verdict.pay >= 0 ? "+" : "") + verdict.pay;
  const giftOff = document.getElementById("way-gift");
  if (giftOff) giftOff.hidden = !(rush && verdict.perfect);
  document.body.classList.add("loading");
  document.body.classList.remove("way-peek");
  await wait(720);
  const stand = document.querySelector(".pal-stand.ship-now");
  const load = stand && stand.querySelector(".pal-load");
  if (load) load.classList.add("into-truck");
  sfx("whoosh");
  await wait(620);
  const ship = progress.pallets.find((p) => p.id === state.shipPalId);
  if (ship) {
    ship.units = 0;
    ship.sku = "";
  }
  state.shipGone = true;
  if (sheet) sheet.classList.add("big");
  await wait(420);
  if (verdict.pay > 0) {
    flyCoins(document.getElementById("way-pay"), document.querySelector(".chip.coin"), 9);
    await wait(780);
  } else {
    const chipBad = document.querySelector(".chip.coin");
    if (chipBad) shake(chipBad);
    sfx("no");
    await wait(520);
  }
  progress.coins += verdict.pay;
  addRate(verdict.rateHit);
  progress.orders = progress.orders.filter((o) => o.id !== order.id);
  if (rush) progress.rushAt = Date.now();
  saveProgress();
  paintHud();
  const chip = document.querySelector(".chip.coin");
  if (chip && verdict.pay > 0) {
    chip.classList.remove("catch");
    void chip.offsetWidth;
    chip.classList.add("catch");
  }
  if (sheet) {
    sheet.classList.remove("big", "ready");
    void sheet.offsetWidth;
    sheet.classList.add("show", "fly");
  }
  document.body.classList.add("gone");
  if (rush && verdict.perfect) await flyRushPalGift();
  else await wait(580);
  endShip();
  paintSlots();
  maybeOrders();
  paintJobs();
  sfx(verdict.perfect ? "done" : "no");
  const rateTxt = rateOf().toFixed(1);
  if (verdict.perfect) toast(rush ? "Чисто. Пустой поддон в подарок. Рейтинг " + rateTxt : "Чисто. Рейтинг " + rateTxt);
  else if (verdict.empty) toast("Пустая машина. Штраф. Рейтинг " + rateTxt);
  else toast("Ошибка в сборке. Рейтинг " + rateTxt);
  state.busy = false;
  if (progress.guide === "send" || progress.guide === "build" || progress.guide === "jobs") {
    progress.guide = "done";
    saveProgress();
    hideGuide();
  }
}

function flyCoins(fromEl, toEl, n) {
  if (!fromEl || !toEl) return;
  const a = fromEl.getBoundingClientRect();
  const b = toEl.getBoundingClientRect();
  const x0 = a.left + a.width / 2;
  const y0 = a.top + a.height / 2;
  const dx = b.left + b.width / 2 - x0;
  const dy = b.top + b.height / 2 - y0;
  for (let i = 0; i < n; i += 1) {
    const bit = document.createElement("i");
    bit.className = "coin-fly";
    bit.style.left = x0 + "px";
    bit.style.top = y0 + "px";
    bit.style.setProperty("--dx", dx + "px");
    bit.style.setProperty("--dy", dy + "px");
    bit.style.animationDelay = i * 55 + "ms";
    document.body.appendChild(bit);
    window.setTimeout(() => sfx("coin"), i * 55);
    window.setTimeout(() => bit.remove(), 880 + i * 55);
  }
}

function paintBoot() {
  const btn = document.getElementById("boot-play");
  if (!btn) return;
  btn.textContent = progress.guide === "done" || progress.room ? "Играть" : "Начать";
}

function inGuide() {
  return !!(progress.guide && progress.guide !== "done");
}

const GUIDE = {
  coins: {
    text: "Твой начальный капитал в этой сфере",
    sel: ".chip.coin",
    side: "below",
    wobble: ".chip.coin",
  },
  garage: {
    text: "У тебя денег хватит для старта только на гараж",
    sel: '#rooms .room[data-room="garage"]',
    side: "below",
  },
  shop: {
    text: "Нужно приобрести товар для его продажи",
    sel: "#shop-btn",
    side: "below",
    wobble: "#shop-btn",
    tap: true,
  },
  water: {
    text: "Сначала купить можно только воду",
    sel: '.good[data-sku="water"]',
    side: "below",
    tap: true,
  },
  unlock: {
    text: "Остальное сначала разблокируй — иначе не купить",
    sel: ".good.locked",
    side: "below",
  },
  wood: {
    text: "Без поддона товар некуда класть. Купи поддон",
    sel: ".good.woods",
    side: "above",
    wobble: ".good.woods",
    tap: true,
  },
  buy: {
    text: "Нажми «Купить», чтобы заказать",
    sel: "#cart-buy",
    side: "above",
    wobble: "#cart-buy",
    tap: true,
  },
  wait: {
    text: "Доставка занимает время",
    sel: "#truck",
    side: "below",
    wobble: "#truck",
  },
  place: {
    text: "Перетяни поддон со стопки",
    sel: "#wood-stack",
    side: "above",
    wobble: "#wood-stack",
  },
  unload: {
    text: "Разгрузи машину",
    sel: "#jobs-tab",
    side: "left",
    wobble: "#jobs-tab",
  },
  pack: {
    text: "Сложи паки на поддон",
    sel: ".dock-pak",
    side: "left",
    wobble: ".dock-pak",
  },
  jobs: {
    text: "Зайди в заявки",
    sel: "#jobs-tab",
    side: "left",
    wobble: "#jobs-tab",
  },
  build: {
    text: "Собери заказ на нижний поддон",
    sel: "#build-spot",
    side: "above",
    wobble: "#build-spot",
  },
  send: {
    text: "Если собрал — отгрузи",
    sel: "#ship-go",
    side: "below",
    wobble: "#ship-go",
  },
};

function hideGuide() {
  state.coinHold = false;
  const box = document.getElementById("guide");
  const card = document.getElementById("guide-card");
  const pay = document.getElementById("guide-pay");
  const ok = document.getElementById("guide-ok");
  if (box) {
    box.hidden = true;
    box.classList.remove("show");
  }
  if (card) card.classList.remove("hero", "settle", "still");
  if (pay) pay.hidden = true;
  if (ok) ok.hidden = false;
  document.querySelectorAll(".guide-on, .wobble").forEach((el) => el.classList.remove("guide-on", "wobble"));
  paintGuideDrops();
}

function paintGuideDrops() {
  document.body.classList.toggle("guide-place", progress.guide === "place");
  document.body.classList.toggle("guide-build", progress.guide === "build");
}

function layoutGuide(sel, side) {
  const target = document.querySelector(sel) || (sel === ".dock-pak" ? document.getElementById("dock") : null);
  const card = document.getElementById("guide-card");
  const arrow = card && card.querySelector(".guide-arrow");
  if (!target || !card) return false;
  const r = target.getBoundingClientRect();
  if (r.width < 4 || r.height < 4) return false;
  target.classList.add("guide-on");
  const pinCoin = sel === ".chip.coin";
  const w = Math.min(pinCoin ? 188 : 240, window.innerWidth - 16);
  card.classList.toggle("still", pinCoin);
  if (pinCoin) card.style.transform = "none";
  card.style.width = w + "px";
  const h = card.offsetHeight || 130;
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  let top;
  let left;
  if (side === "above") {
    top = r.top - h - 18;
    left = cx - w / 2;
    card.dataset.side = "down";
  } else if (side === "right") {
    top = cy - h / 2;
    left = r.right + 16;
    card.dataset.side = "left";
  } else if (side === "left") {
    top = cy - h / 2;
    left = r.left - w - 16;
    card.dataset.side = "right";
  } else {
    top = r.bottom + (pinCoin ? 36 : 26);
    left = pinCoin ? r.left - 8 : cx - w / 2;
    card.dataset.side = "up";
  }
  left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
  top = Math.max(8, Math.min(top, window.innerHeight - h - 8));
  card.style.left = left + "px";
  card.style.top = top + "px";
  const spot = document.getElementById("guide-spot");
  if (spot) {
    const hole = target.closest(".chip, .room, .good, .shop-btn, .jobs-tab, .wood-stack, .truck, .in-dock, .dock-pak, .build-spot, .recv-spot, .waybill, .ship-go, .cart-buy, .menu-btn, .back") || target;
    const hr = hole.getBoundingClientRect();
    const pad = 8;
    spot.style.left = hr.left - pad + "px";
    spot.style.top = hr.top - pad + "px";
    spot.style.width = hr.width + pad * 2 + "px";
    spot.style.height = hr.height + pad * 2 + "px";
  }
  if (arrow) {
    arrow.style.left = "";
    arrow.style.right = "";
    arrow.style.top = "";
    arrow.style.bottom = "";
    arrow.style.margin = "0";
    if (card.dataset.side === "up" || card.dataset.side === "down") {
      const ax = Math.max(18, Math.min(cx - left, w - 18));
      arrow.style.left = ax + "px";
      arrow.style.marginLeft = "-11px";
      if (card.dataset.side === "up") arrow.style.top = "-20px";
      else arrow.style.bottom = "-20px";
    } else {
      const ay = Math.max(18, Math.min(cy - top, h - 18));
      arrow.style.top = ay + "px";
      arrow.style.marginTop = "-11px";
      if (card.dataset.side === "left") arrow.style.left = "-20px";
      else arrow.style.right = "-20px";
    }
  }
  return true;
}

function showGuide(step) {
  const spec = GUIDE[step];
  const box = document.getElementById("guide");
  const text = document.getElementById("guide-text");
  if (!spec || !box || !text) return;
  progress.guide = step;
  saveProgress();
  hideGuide();
  text.textContent = spec.text;
  if (step === "coins") {
    playCoinsIntro();
    return;
  }
  const ok = document.getElementById("guide-ok");
  if (ok) ok.hidden = !!spec.tap;
  const wait = scrollGuideTarget(spec.sel);
  const reveal = () => {
    if (progress.guide !== step) return;
    box.hidden = false;
    box.classList.add("show");
    if (spec.wobble) {
      const wob = document.querySelector(spec.wobble);
      if (wob) wob.classList.add("wobble");
    }
    followGuide(spec.sel, spec.side, wait ? 520 : 420);
  };
  if (wait) window.setTimeout(reveal, wait);
  else reveal();
}

async function playCoinsIntro() {
  const spec = GUIDE.coins;
  const box = document.getElementById("guide");
  const card = document.getElementById("guide-card");
  const text = document.getElementById("guide-text");
  const pay = document.getElementById("guide-pay");
  const payN = document.getElementById("guide-pay-n");
  const ok = document.getElementById("guide-ok");
  const spot = document.getElementById("guide-spot");
  if (!spec || !box || !card || !text) return;
  text.textContent = spec.text;
  box.hidden = false;
  box.classList.add("show");
  const flyIn = !progress.gifted || progress.coins < START_COINS;
  if (flyIn) {
    state.coinHold = true;
    paintHud();
    if (ok) ok.hidden = true;
    if (pay) {
      pay.hidden = false;
      if (payN) payN.textContent = "+" + START_COINS;
    }
    card.classList.add("hero");
    card.dataset.side = "up";
    const w = Math.min(window.innerWidth * 0.92, 380);
    card.style.width = w + "px";
    card.style.left = "50%";
    card.style.top = "50%";
    card.style.transform = "translate(-50%, -50%)";
    if (spot) {
      spot.style.left = "50%";
      spot.style.top = "42%";
      spot.style.width = "2px";
      spot.style.height = "2px";
    }
    sfx("paper");
    await wait(780);
    if (progress.guide !== "coins") return;
    flyCoins(pay || card, document.querySelector(".chip.coin"), 9);
    await wait(820);
    if (progress.guide !== "coins") return;
    state.coinHold = false;
    progress.gifted = true;
    progress.coins = START_COINS;
    saveProgress();
    paintHud();
    const chip = document.querySelector(".chip.coin");
    if (chip) {
      chip.classList.remove("catch");
      void chip.offsetWidth;
      chip.classList.add("catch");
    }
    card.classList.add("settle", "still");
    card.classList.remove("hero");
    if (pay) pay.hidden = true;
    if (ok) ok.hidden = false;
    window.setTimeout(() => card.classList.remove("settle"), 480);
    await wait(40);
    if (progress.guide !== "coins") return;
  }
  if (spec.wobble) {
    const wob = document.querySelector(spec.wobble);
    if (wob) wob.classList.add("wobble");
  }
  layoutGuide(spec.sel, spec.side);
  followGuide(spec.sel, spec.side, flyIn ? 900 : 420);
}

function scrollGuideTarget(sel) {
  const target = document.querySelector(sel);
  const box = target && target.closest("#goods");
  if (!target || !box) return 0;
  const tr = target.getBoundingClientRect();
  const br = box.getBoundingClientRect();
  const pad = 14;
  let next = box.scrollTop;
  if (tr.bottom > br.bottom - pad) next += tr.bottom - (br.bottom - pad);
  if (tr.top < br.top + pad) next -= br.top + pad - tr.top;
  next = Math.max(0, Math.min(next, box.scrollHeight - box.clientHeight));
  if (Math.abs(next - box.scrollTop) < 4) return 0;
  box.scrollTo({ top: next, behavior: "smooth" });
  return 480;
}

function followGuide(sel, side, ms) {
  const until = performance.now() + (ms || 80);
  const tick = (now) => {
    const box = document.getElementById("guide");
    if (!box || box.hidden) return;
    layoutGuide(sel, side);
    if (now < until) window.requestAnimationFrame(tick);
  };
  window.requestAnimationFrame(tick);
}

function onGuideOk() {
  const step = progress.guide;
  if (step === "coins") {
    hideGuide();
    paintRooms();
    showScreen(rent);
    window.setTimeout(() => showGuide("garage"), 80);
    return;
  }
  if (step === "unlock") {
    showGuide("wood");
    return;
  }
  hideGuide();
}

function playGuideGift() {
  if (progress.giftedPal) return;
  sfx("gift");
  progress.giftedPal = true;
  progress.stack.push(makeWood());
  saveProgress();
  paintHud();
  paintSlots();
  const stack = document.getElementById("wood-stack");
  const fly = document.createElement("div");
  fly.className = "guide-gift";
  fly.innerHTML = palMarkup(null, 0);
  document.body.appendChild(fly);
  const mid = document.body.getBoundingClientRect();
  fly.style.left = mid.width / 2 + "px";
  fly.style.top = mid.height * 0.38 + "px";
  const to = stack ? stack.getBoundingClientRect() : { left: 40, top: mid.height - 80, width: 80 };
  window.requestAnimationFrame(() => {
    fly.classList.add("fly");
    fly.style.left = to.left + to.width / 2 + "px";
    fly.style.top = to.top + 24 + "px";
  });
  window.setTimeout(() => {
    fly.remove();
    markGiftStack();
    const chip = document.querySelector(".chip.wood");
    if (chip) {
      chip.classList.remove("catch");
      void chip.offsetWidth;
      chip.classList.add("catch");
    }
  }, 720);
}

function goPlay() {
  unlockAudio();
  if (progress.guide !== "done" && !progress.room) {
    paintHud();
    showGuide("coins");
    return;
  }
  if (!progress.gifted) giftStart();
  else paintHud();
  if (!progress.room) {
    paintRooms();
    showScreen(rent);
    return;
  }
  openFloor();
}

function goBack() {
  if (state.busy) return;
  if (document.getElementById("set-pane") && document.getElementById("set-pane").classList.contains("show")) {
    closeSet();
    return;
  }
  if (document.getElementById("shop").classList.contains("show")) {
    closeShop();
    return;
  }
  if (document.getElementById("ship-pane").classList.contains("show")) {
    closeShip();
    return;
  }
  if (document.getElementById("jobs-pane").classList.contains("show")) {
    closeJobs();
    return;
  }
  if (state.shipId) {
    endShip();
    paintSlots();
    return;
  }
  if (pack.classList.contains("show")) {
    openFloor();
    return;
  }
  if (floor.classList.contains("show") || rent.classList.contains("show")) {
    showScreen(boot);
    return;
  }
}

document.getElementById("btn-menu").addEventListener("click", () => {
  const pane = document.getElementById("set-pane");
  if (pane && pane.classList.contains("show")) closeSet();
  else openSet();
});
document.getElementById("set-sound").addEventListener("click", toggleSound);
document.getElementById("set-close").addEventListener("click", closeSet);
document.getElementById("set-pane").addEventListener("click", (e) => {
  if (e.target.id === "set-pane") closeSet();
});
document.getElementById("boot-play").addEventListener("click", goPlay);
window.addEventListener(
  "pointerdown",
  () => {
    unlockAudio();
  },
  { once: true, capture: true }
);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (audioCtx && audioCtx.state === "running") audioCtx.suspend();
  } else if (soundOn) {
    ensureAudio();
    startMusic();
  }
});
document.getElementById("guide-ok").addEventListener("click", onGuideOk);
window.addEventListener("resize", () => {
  if (!document.getElementById("guide") || document.getElementById("guide").hidden) return;
  const spec = GUIDE[progress.guide];
  if (spec) layoutGuide(spec.sel, spec.side);
});
document.getElementById("boot-reset").addEventListener("click", resetProgress);
document.getElementById("rent-back").addEventListener("click", () => showScreen(boot));
document.getElementById("btn-back").addEventListener("click", goBack);
document.getElementById("shop-btn").addEventListener("click", () => {
  const pane = document.getElementById("shop");
  if (pane.classList.contains("show")) closeShop();
  else openShop();
});
document.getElementById("shop-close").addEventListener("click", closeShop);
document.getElementById("cart-toggle").addEventListener("click", () => {
  document.getElementById("cart").classList.toggle("open");
});
document.getElementById("cart-buy").addEventListener("click", (e) => checkout(e.currentTarget));
document.getElementById("ship-go").addEventListener("click", () => {
  const order = currentOrder();
  if (order) finishShip(order);
});
const wayHide = document.getElementById("way-hide");
if (wayHide) wayHide.addEventListener("click", hideWayPeek);
document.getElementById("shop").addEventListener("click", (e) => {
  if (e.target.id === "shop") closeShop();
});
document.getElementById("jobs-tab").addEventListener("click", () => {
  if (state.bulkId) return;
  if (state.shipId && !state.busy) {
    if (state.wayPeek) hideWayPeek();
    else showWayPeek();
    return;
  }
  if (dockList().length && !state.unloading && !state.shipId) startUnload();
  else openJobs();
});
const dockGo = document.getElementById("dock-go");
if (dockGo) dockGo.addEventListener("click", startUnload);
document.getElementById("jobs-close").addEventListener("click", () => {
  closeJobs();
  if (progress.guide === "jobs" && !state.shipId) window.setTimeout(() => showGuide("jobs"), 80);
});
document.getElementById("jobs-pane").addEventListener("click", (e) => {
  if (e.target.id !== "jobs-pane") return;
  closeJobs();
  if (progress.guide === "jobs" && !state.shipId) window.setTimeout(() => showGuide("jobs"), 80);
});
document.getElementById("pack-close").addEventListener("click", openFloor);
document.getElementById("truck").addEventListener("click", openShip);
document.getElementById("ship-close").addEventListener("click", closeShip);
document.getElementById("ship-pane").addEventListener("click", (e) => {
  if (e.target.id === "ship-pane") closeShip();
});
const yard = document.getElementById("inside");
if (yard) yard.addEventListener("scroll", shadePals, { passive: true });
window.addEventListener("resize", syncYardPan);
window.setInterval(tickShip, 250);

seedDust();
paintHud();
paintSoundBtn();
showScreen(boot);
