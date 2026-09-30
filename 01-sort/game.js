const COLORS = ["#e85d4c", "#f4b942", "#3ecf8e", "#5b8def", "#c084fc", "#f27a64"];
const SAVE_KEY = "bani-progress-v6";
const OLD_SAVES = [
  "bani-progress-v5",
  "bani-progress-v4",
  "bani-progress-v3",
  "bani-progress-v2",
  "bani-progress-v1",
];
const SETTINGS_KEY = "bani-settings-v1";
const TOWER_FLOORS = 5;
const TOWER_ENTER = 22;
const TOWER_PASS = 1000;
const BOMB_NEED = 100;
const FLASK_PRICE = 90;
const SEAL_PRICE = 80;
const TOWER_TICK_MS = 8000;
const SEAL_HOLD_MS = 9000000;
const BOMB_HOLD_MS = 18000000;
const UNDO_PACK = 35;
const AD_COINS = 40;
const COIN_PACKS = [
  { id: "pack200", name: "Старт", uah: 200, coins: 2000, bombs: 10, fire: false },
  { id: "pack500", name: "Запас", uah: 500, coins: 5000, bombs: 30, fire: false },
  { id: "pack999", name: "Корона", uah: 999, coins: 20000, bombs: 100, fire: true },
];
const YOU = "Ты";
const RIVALS = [
  "Лера",
  "Макс",
  "Ника",
  "Тимур",
  "Соня",
  "Артём",
  "Кира",
  "Даня",
  "Мила",
  "Егор",
  "Яна",
  "Лев",
  "Алина",
  "Марк",
  "Тоня",
  "Илья",
  "Вера",
  "Глеб",
  "Оля",
];
const TOWER_NICKS = [
  "Лера", "Jake", "Minji", "Hugo", "Priya", "Diego", "Yuki", "Emre", "Amina", "Lukas",
  "Макс", "Ashley", "Joon", "Camille", "Aarav", "Lucia", "Haruto", "Elif", "Chidi", "Anna",
  "Ника", "Tyler", "Sora", "Mateo", "Kasia", "Freja", "Rafa", "Putri", "Kenji", "Noor",
  "Тимур", "Mei", "Omar", "Ines", "Boris", "Nia", "Pavel", "Sofia", "Lars", "Zara",
  "Соня", "Chen", "Fatou", "Giulia", "Hassan", "Ivy", "Jamal", "Klara", "Leo", "Mira",
  "Кира", "Niko", "Ola", "Piotr", "Quinn", "Rina", "Sami", "Tara", "Umar", "Vera",
  "Даня", "Wei", "Xavi", "Yara", "Zoltan", "Aiko", "Bruno", "Celine", "Dario", "Ewa",
  "Мила", "Farid", "Greta", "Hiro", "Ivana", "Jules", "Lina", "Musa", "Nadia", "Otto",
  "Егор", "Pia", "Rami", "Sana", "Theo", "Uma", "Viktor", "Wafa", "Yusuf", "SeoulAce",
  "BakuKing", "RioNoob", "LagosFire", "OsloBit", "noobKing", "Fox_UA", "Дракон", "БанкаПро",
  "NikaPlay",
];
const HINT_PRICE = 30;
const UNDO_PRICE = 15;
const EXTRA_PRICE = 45;
const LOCK_PRICES = [40, 70];
const KEEP_PRICE = 50;
const SKINS = [
  { id: "default", name: "Стекло", premium: false, price: 0 },
  { id: "night", name: "Ночь", premium: false, price: 0 },
  { id: "mint", name: "Мята", premium: false, price: 0 },
  { id: "rose", name: "Роза", premium: false, price: 0 },
  { id: "sand", name: "Песок", premium: false, price: 0 },
  { id: "ice", name: "Лёд", premium: false, price: 0 },
  { id: "smoke", name: "Дым", premium: false, price: 0 },
  { id: "foam", name: "Пена", premium: false, price: 0 },
  { id: "ribbed", name: "Рефлёные", premium: false, price: 0 },
  { id: "vase", name: "Вазы", premium: false, price: 0 },
  { id: "mug", name: "Кружки", premium: false, price: 0 },
  { id: "wide", name: "Широкие", premium: false, price: 0 },
  { id: "gold", name: "Золото", premium: true, price: 120 },
  { id: "honey", name: "Мёд", premium: true, price: 140 },
  { id: "ocean", name: "Океан", premium: true, price: 160 },
  { id: "ember", name: "Уголь", premium: true, price: 180 },
  { id: "lava", name: "Лава", premium: true, price: 220 },
  { id: "neon", name: "Неон", premium: true, price: 240 },
  { id: "crystal", name: "Кристалл", premium: true, price: 260 },
  { id: "ink", name: "Тушь", premium: true, price: 280 },
  { id: "aurora", name: "Сияние", premium: true, price: 320 },
  { id: "royal", name: "Корона", premium: true, price: 380 },
  { id: "void", name: "Пустота", premium: true, price: 420 },
  { id: "myth", name: "Миф", premium: true, price: 500 },
];
const CHAPTERS = [
  "Первые банки",
  "Три цвета",
  "Вкус победы",
  "Тесно",
  "Четыре в ряд",
  "Пять красок",
  "Давление",
  "Жара",
  "Шесть цветов",
  "Корона",
];

const state = {
  level: 1,
  tubes: [],
  selected: -1,
  history: [],
  busy: false,
  lock: "",
  moves: 0,
  lastCoins: 0,
  doubled: false,
  holdHudCoins: null,
  holdHudHints: null,
  chestPrizes: [],
  winBase: 0,
  winTotal: 0,
  winExtraDone: false,
  locked: 0,
  stolenEmpties: 0,
  openedExtra: 0,
  mode: "story",
  towerFloor: 0,
  levelSrc: 1,
  towerMark: "",
  towerHitBusy: false,
  packBusy: false,
};

const board = document.getElementById("board");
const fx = document.getElementById("fx");
const levelEl = document.getElementById("level");
const undoBtn = document.getElementById("undo");
const overlay = document.getElementById("overlay");
const failOverlay = document.getElementById("fail-overlay");
const winTitle = document.getElementById("win-title");
const winText = document.getElementById("win-text");
const winReward = document.getElementById("win-reward");
const winStars = document.getElementById("win-stars");
const nextBtn = document.getElementById("next");
const winDouble = document.getElementById("win-double");
const winShare = document.getElementById("win-share");
const hintBtn = document.getElementById("hint");
const chestOverlay = document.getElementById("chest-overlay");
const chestLoot = document.getElementById("chest-loot");
const fireChip = document.getElementById("chip-fire");
const chapterEl = document.getElementById("chapter");
const goalEl = document.getElementById("goal");
const trackFill = document.getElementById("track-fill");
const trackLabel = document.getElementById("track-label");
const failTitle = document.getElementById("fail-title");
const failText = document.getElementById("fail-text");
const failRisk = document.getElementById("fail-risk");
const failUndo = document.getElementById("fail-undo");
const failJar = document.getElementById("fail-jar");
const failKeep = document.getElementById("fail-keep");
const failGive = document.getElementById("fail-give");
const lockOverlay = document.getElementById("lock-overlay");
const lockText = document.getElementById("lock-text");
const lockCoins = document.getElementById("lock-coins");
const lockAd = document.getElementById("lock-ad");
const lockCharge = document.getElementById("lock-charge");
const huntEl = document.getElementById("hunt");
const hinderEl = document.getElementById("hinder");
const duelEl = document.getElementById("duel");
const duelYouFace = document.getElementById("duel-you-face");
const duelThemFace = document.getElementById("duel-them-face");
const duelName = document.getElementById("duel-name");
const duelMeta = document.getElementById("duel-meta");
const duelFloor = document.getElementById("duel-floor");
const towerPeek = document.getElementById("tower-sq");
const towerSq = document.getElementById("tower-sq");
const mapOverlay = document.getElementById("map-overlay");
const mapGrid = document.getElementById("map-grid");
const towerOverlay = document.getElementById("tower-overlay");
const towerLead = document.getElementById("tower-lead");
const towerList = document.getElementById("tower-list");
const shopOverlay = document.getElementById("shop-overlay");
const shopLead = document.getElementById("shop-lead");
const leagueOverlay = document.getElementById("league-overlay");
const leagueLead = document.getElementById("league-lead");
const leagueList = document.getElementById("league-list");
const leagueRace = document.getElementById("league-race");
const passToast = document.getElementById("pass-toast");
const hudPlace = document.getElementById("hud-place");

let hookTimer = 0;
let audioCtx = null;
const sceneGlow = document.getElementById("scene-glow");
const CHAPTER_TINTS = [
  "#c4843a",
  "#d4654a",
  "#e0b040",
  "#8a5a3a",
  "#3d8f7a",
  "#7a5cb8",
  "#c4453a",
  "#e07030",
  "#4a5aa8",
  "#d4a84a",
];

function feel(kind) {
  if (!settings.vibe) return;
  try {
    if (kind === "pour") navigator.vibrate(10);
    else if (kind === "full") navigator.vibrate([8, 24, 14]);
    else if (kind === "win") navigator.vibrate([12, 30, 18]);
    else if (kind === "fail") navigator.vibrate(28);
  } catch (e) {}
}

function tone(freq, dur, type, vol) {
  if (!settings.sound) return;
  try {
    audioCtx = audioCtx || new window.AudioContext();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.value = vol || 0.04;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.start(now);
    osc.stop(now + dur);
  } catch (e) {}
}

function paintScene() {
  const tint = CHAPTER_TINTS[chapterIndex(state.level)] || CHAPTER_TINTS[0];
  document.documentElement.style.setProperty("--scene", tint);
  document.body.classList.toggle("ember", progress.streak >= 5);
  document.body.classList.toggle("tension", almostCount(state.tubes) >= 2);
  document.body.classList.toggle("stage2", (progress.stage || 1) >= 2);
  SKINS.forEach((item) => {
    document.body.classList.toggle("skin-" + item.id, progress.skin === item.id);
  });
}

function pulseScene(hex) {
  if (!settings.juice) return;
  document.documentElement.style.setProperty("--pour", hex || "#f4b942");
  if (!sceneGlow) return;
  sceneGlow.classList.remove("pulse");
  void sceneGlow.offsetWidth;
  sceneGlow.classList.add("pulse");
  window.setTimeout(() => sceneGlow.classList.remove("pulse"), 560);
}

function flyLoot(fromBox, count) {
  const chip = document.getElementById("hud-coins");
  if (!chip || !fromBox) return;
  const to = chip.getBoundingClientRect();
  const x1 = fromBox.left + fromBox.width / 2;
  const y1 = fromBox.top + fromBox.height / 3;
  const x2 = to.left + to.width / 2;
  const y2 = to.top + to.height / 2;
  for (let i = 0; i < count; i += 1) {
    const dot = document.createElement("div");
    dot.className = "loot-fly";
    dot.style.left = x1 + (i - 2) * 8 + "px";
    dot.style.top = y1 + "px";
    dot.style.setProperty("--tx", x2 + "px");
    dot.style.setProperty("--ty", y2 + "px");
    fx.appendChild(dot);
    window.setTimeout(() => dot.remove(), 720);
  }
}

function seedMotes() {
  const root = document.getElementById("motes");
  if (!root) return;
  if (!settings.juice) {
    root.innerHTML = "";
    return;
  }
  if (root.childElementCount) return;
  for (let i = 0; i < 6; i += 1) {
    const mote = document.createElement("i");
    mote.className = "mote";
    mote.style.left = 4 + Math.random() * 92 + "%";
    mote.style.animationDuration = 9 + Math.random() * 10 + "s";
    mote.style.animationDelay = -Math.random() * 12 + "s";
    mote.style.opacity = String(0.25 + Math.random() * 0.5);
    mote.style.transform = "scale(" + (0.5 + Math.random()) + ")";
    root.appendChild(mote);
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function coinEl() {
  const el = document.createElement("img");
  el.className = "coin";
  el.src = "coin.svg?v=49";
  el.alt = "";
  el.setAttribute("aria-hidden", "true");
  return el;
}

function fillCoinLabel(el, before, amount, after) {
  if (!el) return;
  el.textContent = "";
  if (before) el.appendChild(document.createTextNode(before));
  el.appendChild(coinEl());
  if (amount != null && amount !== "") el.appendChild(document.createTextNode(String(amount)));
  if (after) el.appendChild(document.createTextNode(after));
}

function emptyProgress() {
  return {
    unlocked: 1,
    stars: Array(200).fill(0),
    coins: 0,
    streak: 0,
    hints: 1,
    undos: 1,
    skins: ["default"],
    skin: "default",
    chests: Array(10).fill(false),
    maxStreak: 0,
    weekId: "",
    weekRace: { level: 0, stars: 0, moves: 99 },
    lastPlace: 0,
    bottleCharges: 0,
    seals: {},
    towerDone: [false, false, false, false, false],
    towerScore: 0,
    towerCoins: 0,
    towerPassWeek: "",
    bestMoves: Array(200).fill(0),
    stage: 1,
    milestones: Array(10).fill(false),
    boostUntil: 0,
    boostMult: 1,
    seenIntro: false,
    seenTowerHelp: false,
    bombs: 0,
    starPool: 0,
    fireDay: "",
    towerPressDay: "",
    towerWounds: 0,
    towerHitNews: [],
    towerNpc: {},
    towerTickAt: 0,
    towerHold: {},
    fireDouble: false,
  };
}

function loadSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "");
    if (!raw || typeof raw !== "object") {
      return { sound: true, vibe: true, juice: true, hint: true };
    }
    return {
      sound: raw.sound !== false,
      vibe: raw.vibe !== false,
      juice: raw.juice !== false,
      hint: raw.hint !== false,
    };
  } catch (e) {
    return { sound: true, vibe: true, juice: true, hint: true };
  }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function applySettings() {
  document.body.classList.toggle("quiet", !settings.juice);
  seedMotes();
}

function onOff(on) {
  return on ? "Вкл" : "Выкл";
}

function paintSettings() {
  const soundVal = document.getElementById("set-sound-val");
  const vibeVal = document.getElementById("set-vibe-val");
  const juiceVal = document.getElementById("set-juice-val");
  const hintVal = document.getElementById("set-hint-val");
  const skinNameEl = document.getElementById("set-skin-name");
  const lead = document.getElementById("set-lead");
  if (soundVal) soundVal.textContent = onOff(settings.sound);
  if (vibeVal) vibeVal.textContent = onOff(settings.vibe);
  if (juiceVal) juiceVal.textContent = onOff(settings.juice);
  if (hintVal) hintVal.textContent = onOff(settings.hint);
  if (skinNameEl) skinNameEl.textContent = skinName(progress.skin);
  const setClose = document.getElementById("set-close");
  if (setClose) setClose.textContent = state.tubes.length ? "К игре" : "В меню";
  if (lead) {
    lead.textContent = settings.juice
      ? "Как тебе удобнее играть."
      : "Эффекты выключены — поле спокойнее.";
  }
  ["sound", "vibe", "juice", "hint"].forEach((key) => {
    const btn = document.getElementById("set-" + key);
    if (btn) btn.classList.toggle("off", !settings[key]);
  });
}

function toggleSetting(key) {
  settings[key] = !settings[key];
  saveSettings();
  applySettings();
  paintSettings();
  const btn = document.getElementById("set-" + key);
  if (btn) {
    btn.classList.remove("flip");
    void btn.offsetWidth;
    btn.classList.add("flip");
  }
  if (key === "sound" && settings.sound) tone(520, 0.1, "sine", 0.04);
  if (key === "vibe" && settings.vibe) feel("pour");
}

function syncScreens() {
  const mapOpen = mapOverlay && mapOverlay.classList.contains("show");
  const home = document.getElementById("boot");
  const homeOpen = home && home.classList.contains("show");
  const towerOpen = towerOverlay && towerOverlay.classList.contains("show");
  const cover = ["intro-overlay", "pass-overlay", "settings-overlay", "shop-overlay", "skins-overlay", "league-overlay"].some((id) => {
    const el = document.getElementById(id);
    return el && el.classList.contains("show");
  });
  document.body.classList.toggle("screen", cover);
  document.body.classList.toggle("map-open", !!mapOpen);
  document.body.classList.toggle("home-open", !!homeOpen && !cover && !towerOpen);
  document.body.classList.toggle("tower-open", !!towerOpen);
}

function paintMenu() {
  const towerMeta = document.getElementById("home-tower-meta");
  const towerBtn = document.getElementById("boot-tower");
  if (towerBtn) {
    const locked = !hasTowerPass();
    towerBtn.classList.toggle("locked", locked);
    towerBtn.classList.toggle("poor", locked && progress.coins < TOWER_PASS);
  }
  paintWeekClocks();
  syncDailyFire();
  paintHud();
  if (towerMeta) {
    towerMeta.hidden = !hasTowerPass();
    if (hasTowerPass()) towerMeta.textContent = "Попробуй удержать первое место";
  }
}

function openMenu() {
  closeLeague();
  closeShop();
  closePackStore();
  closeTower();
  closeMap();
  closeSettings();
  closeSkins();
  closePassGate();
  overlay.classList.remove("show");
  failOverlay.classList.remove("show");
  if (lockOverlay) lockOverlay.classList.remove("show");
  closeChapterChest();
  paintMenu();
  if (boot) boot.classList.add("show");
  syncScreens();
}

function closeMenu() {
  if (boot) boot.classList.remove("show");
  syncScreens();
}

function openSettings() {
  closeLeague();
  closeShop();
  closePackStore();
  closeTower();
  closeMap();
  closeSkins();
  closeMenu();
  paintSettings();
  const el = document.getElementById("settings-overlay");
  if (el) el.classList.add("show");
  syncScreens();
}

function closeSettings() {
  const el = document.getElementById("settings-overlay");
  if (el) el.classList.remove("show");
  syncScreens();
}

function firstLocked(stars, max) {
  const cap = Math.max(1, max || 100);
  const list = stars || [];
  for (let n = 1; n <= cap; n += 1) {
    if (!(list[n - 1] > 0)) return n;
  }
  return cap;
}

function loadProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || "");
    const base = emptyProgress();
    if (!raw || typeof raw !== "object") return base;
    base.unlocked = Math.max(1, Number(raw.unlocked) || 1);
    base.coins = Math.max(0, Number(raw.coins) || 0);
    base.streak = Math.max(0, Number(raw.streak) || 0);
    base.hints = Math.max(0, Number(raw.hints) || 0);
    base.undos = raw.undos == null ? 1 : Math.max(0, Number(raw.undos) || 0);
    base.skin = SKINS.some((item) => item.id === raw.skin) ? raw.skin : "default";
    base.skins = Array.isArray(raw.skins) && raw.skins.length ? raw.skins.slice() : ["default"];
    base.skins = base.skins.filter((id) => SKINS.some((item) => item.id === id));
    if (base.skins.indexOf("default") === -1) base.skins.unshift("default");
    if (Array.isArray(raw.chests)) {
      raw.chests.forEach((value, i) => {
        if (i < base.chests.length) base.chests[i] = !!value;
      });
    }
    if (Array.isArray(raw.stars)) {
      raw.stars.forEach((value, i) => {
        if (i < base.stars.length) base.stars[i] = Math.max(0, Math.min(3, Number(value) || 0));
      });
    }
    base.maxStreak = Math.max(0, Number(raw.maxStreak) || 0, base.streak);
    base.weekId = typeof raw.weekId === "string" ? raw.weekId : "";
    if (raw.weekRace && typeof raw.weekRace === "object") {
      base.weekRace = {
        level: Math.max(0, Number(raw.weekRace.level) || 0),
        stars: Math.max(0, Math.min(3, Number(raw.weekRace.stars) || 0)),
        moves: Math.max(0, Number(raw.weekRace.moves) || 99),
      };
    }
    base.lastPlace = Math.max(0, Number(raw.lastPlace) || 0);
    base.bottleCharges = Math.max(0, Number(raw.bottleCharges) || 0);
    base.seals = raw.seals && typeof raw.seals === "object" ? raw.seals : {};
    if (Array.isArray(raw.towerDone)) {
      base.towerDone = [false, false, false, false, false];
      raw.towerDone.forEach((value, i) => {
        if (i < 5) base.towerDone[i] = !!value;
      });
    }
    base.towerScore = Math.max(0, Number(raw.towerScore) || 0);
    base.towerCoins = 0;
    const oldTowerCash = Math.max(0, Number(raw.towerCoins) || 0);
    if (oldTowerCash) {
      base.coins += oldTowerCash;
      try {
        raw.coins = base.coins;
        raw.towerCoins = 0;
        localStorage.setItem(SAVE_KEY, JSON.stringify(raw));
      } catch (e) {}
    }
    base.towerPassWeek = typeof raw.towerPassWeek === "string" ? raw.towerPassWeek : "";
    base.bestMoves = Array(200).fill(0);
    if (Array.isArray(raw.bestMoves)) {
      raw.bestMoves.forEach((value, i) => {
        if (i < base.bestMoves.length) base.bestMoves[i] = Math.max(0, Number(value) || 0);
      });
    }
    base.stage = Math.max(1, Number(raw.stage) || 1);
    base.milestones = Array(10).fill(false);
    if (Array.isArray(raw.milestones)) {
      raw.milestones.forEach((value, i) => {
        if (i < 10) base.milestones[i] = !!value;
      });
    }
    base.boostUntil = Math.max(0, Number(raw.boostUntil) || 0);
    base.boostMult = Math.max(1, Number(raw.boostMult) || 1);
    if (raw.seenIntro === true || raw.seenIntro === false) base.seenIntro = raw.seenIntro;
    else base.seenIntro = true;
    base.seenTowerHelp = raw.seenTowerHelp === true;
    base.bombs = Math.max(0, Number(raw.bombs) || 0);
    base.starPool = Math.max(0, Number(raw.starPool) || 0);
    base.fireDay = typeof raw.fireDay === "string" ? raw.fireDay : "";
    base.towerPressDay = typeof raw.towerPressDay === "string" ? raw.towerPressDay : "";
    base.towerWounds = Math.max(0, Number(raw.towerWounds) || 0);
    base.towerHitNews = Array.isArray(raw.towerHitNews) ? raw.towerHitNews.map(String) : [];
    base.towerNpc = {};
    if (raw.towerNpc && typeof raw.towerNpc === "object") {
      Object.keys(raw.towerNpc).forEach((name) => {
        const n = Number(raw.towerNpc[name]);
        if (n === n) base.towerNpc[name] = Math.max(0, n);
      });
    }
    base.towerTickAt = Math.max(0, Number(raw.towerTickAt) || 0);
    base.towerHold = {};
    if (raw.towerHold && typeof raw.towerHold === "object") {
      Object.keys(raw.towerHold).forEach((name) => {
        const hold = raw.towerHold[name];
        if (!hold || typeof hold !== "object") return;
        base.towerHold[name] = {
          freezeUntil: Math.max(0, Number(hold.freezeUntil) || 0),
          slowUntil: Math.max(0, Number(hold.slowUntil) || 0),
          slow: Math.max(0, Number(hold.slow) || 0),
        };
      });
    }
    base.fireDouble = raw.fireDouble === true;
    if (raw.bombs == null && raw.starPool == null && Array.isArray(raw.stars)) {
      const earned = raw.stars.reduce((sum, n) => sum + Math.max(0, Number(n) || 0), 0);
      base.bombs = Math.floor(earned / BOMB_NEED);
      base.starPool = earned % BOMB_NEED;
    }
    if (Array.isArray(raw.stars) && raw.stars.length < 200) {
      while (base.stars.length < 200) base.stars.push(0);
    }
    if ((base.stage || 1) >= 2) {
      const first = base.stars.slice(0, 100);
      const second = base.stars.slice(100, 200);
      const firstDone = first.filter((s) => s > 0).length === 100;
      const secondProg = second.filter((s) => s > 0).length;
      if (firstDone && secondProg) {
        for (let i = 0; i < 100; i += 1) base.stars[i] = second[i] || 0;
        for (let i = 100; i < base.stars.length; i += 1) base.stars[i] = 0;
      } else if (firstDone && base.unlocked > 100) {
        for (let i = 0; i < 100; i += 1) base.stars[i] = 0;
        base.milestones = Array(10).fill(false);
      }
    }
    base.unlocked = firstLocked(base.stars, 100);
    return base;
  } catch (e) {
    return emptyProgress();
  }
}

function saveProgress() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
}

function wipeSaves() {
  [SAVE_KEY].concat(OLD_SAVES).forEach((key) => localStorage.removeItem(key));
}

function resetProgress() {
  const fresh = emptyProgress();
  Object.keys(progress).forEach((key) => {
    delete progress[key];
  });
  Object.assign(progress, fresh);
  wipeSaves();
  saveProgress();
  state.level = 1;
  state.tubes = [];
  state.selected = -1;
  state.history = [];
  state.moves = 0;
  state.mode = "story";
  state.lock = "";
  state.busy = false;
  openMenu();
  paintHud();
  showPassToast("Прогресс сброшен");
  openIntro();
}

const progress = loadProgress();
const settings = loadSettings();

function jarCap() {
  return 4;
}

function storyLevelCount() {
  return 100;
}

function storySourceLevel(level, stage) {
  const shift = Math.max(0, (stage || 1) - 1) * 18;
  const src = level + shift;
  if (src <= LEVELS.length) return src;
  return 81 + ((src - 101) % 20);
}

function syncUnlocked() {
  progress.unlocked = firstLocked(progress.stars, storyLevelCount());
  return progress.unlocked;
}

function cloneLevel(n) {
  return LEVELS[(n - 1) % LEVELS.length].map((tube) => tube.slice());
}

function hardenByStage(tubes, stage) {
  const extra = Math.min(2, Math.max(0, (stage || 1) - 1));
  return extra ? stealEmpties(tubes, extra).tubes : tubes;
}

function packedLevel(n, stage) {
  const src = storySourceLevel(n, stage);
  return { tubes: hardenByStage(cloneLevel(src), stage), src: src };
}

function packedTower(n, stage) {
  return { tubes: hardenByStage(cloneLevel(n), stage), src: n };
}

function stageClears() {
  return progress.stars.slice(0, 100).filter((s) => s > 0).length;
}

function beginNextHundred() {
  for (let i = 0; i < 100; i += 1) {
    progress.stars[i] = 0;
    if (progress.bestMoves) progress.bestMoves[i] = 0;
  }
  progress.milestones = Array(10).fill(false);
  progress.unlocked = 1;
  saveProgress();
  showPassToast("Сотня " + (progress.stage || 1) + ". Уже теснее.");
}

const MILESTONES = [
  { at: 10, kind: "hints", n: 7, text: "7 подсказок" },
  { at: 20, kind: "skin", id: "ribbed", text: "Скин «Рефлёные колбы»" },
  { at: 30, kind: "coins", n: 80, text: "+80 монет" },
  { at: 40, kind: "boost", mult: 2, hours: 24, text: "×2 монет на 24 часа" },
  { at: 50, kind: "skin", id: "vase", text: "Скин «Вазы»" },
  { at: 60, kind: "coins", n: 120, text: "+120 монет" },
  { at: 70, kind: "hints", n: 10, text: "10 подсказок" },
  { at: 80, kind: "skin", id: "mug", text: "Скин «Кружки»" },
  { at: 90, kind: "boost", mult: 10, hours: 2, text: "×10 монет на 2 часа" },
  { at: 100, kind: "stage", text: "Новая сотня: те же 100, уже сложнее" },
];

function claimMilestones() {
  const n = stageClears();
  const got = [];
  MILESTONES.forEach((item, i) => {
    if (n < item.at || progress.milestones[i]) return;
    progress.milestones[i] = true;
    if (item.kind === "hints") progress.hints += item.n;
    let coinGot = item.n || 0;
    if (item.kind === "coins") coinGot = gain(item.n);
    if (item.kind === "skin" && progress.skins.indexOf(item.id) === -1) {
      progress.skins.push(item.id);
      progress.skin = item.id;
    }
    if (item.kind === "boost") {
      progress.boostMult = item.mult;
      progress.boostUntil = Date.now() + item.hours * 3600 * 1000;
    }
    if (item.kind === "stage") {
      progress.stage = (progress.stage || 1) + 1;
      if (progress.skins.indexOf("wide") === -1) progress.skins.push("wide");
      progress.skin = "wide";
    }
    got.push({
      kind: item.kind,
      n: item.kind === "coins" ? coinGot : item.n || 0,
      mult: item.mult || 0,
      hours: item.hours || 0,
      id: item.id || "",
      text: item.kind === "coins" ? "+" + coinGot + " монет" : item.text,
    });
  });
  return got;
}

function cash() {
  return progress.coins;
}

function spend(n) {
  if (progress.coins < n) return false;
  progress.coins -= n;
  return true;
}

function dayStamp() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Kyiv",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function prevStamp(id) {
  const parts = String(id || "").split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => !n)) return "";
  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] - 1)).toISOString().slice(0, 10);
}

function fireMult() {
  const base = 1 + 0.1 * Math.max(0, progress.streak || 0);
  return progress.fireDouble ? base * 2 : base;
}

function boostMultNow() {
  if (progress.boostUntil && Date.now() < progress.boostUntil) {
    return progress.boostMult || 1;
  }
  return 1;
}

function payoutMult() {
  return fireMult() * boostMultNow();
}

function pressureSteal() {
  const fire = fireMult();
  const boost = boostMultNow();
  let n = 0;
  if (fire >= 1.4) n += 1;
  if (fire >= 2) n += 1;
  if (boost >= 2) n += 1;
  if (boost >= 10) n += 1;
  return n;
}

function stealEmpties(tubes, n) {
  const next = tubes.map((tube) => tube.slice());
  let left = n;
  for (let i = next.length - 1; i >= 0 && left > 0; i -= 1) {
    if (!next[i].length) {
      next.splice(i, 1);
      left -= 1;
    }
  }
  return { tubes: next, stolen: n - left };
}

function scaledPrice(base) {
  return Math.max(base, Math.round(base * fireMult()));
}

function hintPrice() {
  return scaledPrice(HINT_PRICE);
}

function undoPrice() {
  return scaledPrice(UNDO_PRICE);
}

function keepPrice() {
  return scaledPrice(KEEP_PRICE);
}

function flaskPrice() {
  return scaledPrice(FLASK_PRICE);
}

function undoPackPrice() {
  return scaledPrice(UNDO_PACK);
}

function syncDailyFire() {
  const today = dayStamp();
  if (progress.fireDay === today) return;
  if (!progress.fireDay) {
    progress.streak = Math.max(1, progress.streak || 0);
  } else if (progress.fireDay === prevStamp(today)) {
    progress.streak = (progress.streak || 0) + 1;
  } else {
    progress.streak = 1;
  }
  progress.fireDay = today;
  saveProgress();
}

function addStarsToBomb(delta) {
  if (delta <= 0) return 0;
  progress.starPool = (progress.starPool || 0) + delta;
  let made = 0;
  while (progress.starPool >= BOMB_NEED) {
    progress.starPool -= BOMB_NEED;
    progress.bombs = (progress.bombs || 0) + 1;
    made += 1;
  }
  return made;
}

function gain(n, skipFire) {
  let add = n;
  if (state.mode !== "tower" && !skipFire) {
    add = Math.round(n * fireMult());
    add = Math.round(add * boostMultNow());
  }
  progress.coins += add;
  return add;
}

function clone(tubes) {
  return tubes.map((tube) => tube.slice());
}

function topColor(tube) {
  return tube.length ? tube[tube.length - 1] : null;
}

function canPour(from, to) {
  if (!from.length || to.length >= jarCap()) return false;
  const color = topColor(from);
  return !to.length || topColor(to) === color;
}

function pourAmount(from, to) {
  const color = topColor(from);
  let count = 0;
  for (let i = from.length - 1; i >= 0 && from[i] === color && to.length + count < jarCap(); i -= 1) {
    count += 1;
  }
  return count;
}

function pour(from, to) {
  const color = topColor(from);
  while (from.length && topColor(from) === color && to.length < jarCap()) {
    to.push(from.pop());
  }
}

function isSolved(tubes) {
  return tubes.every(
    (tube) =>
      tube.length === 0 || (tube.length === jarCap() && tube.every((color) => color === tube[0]))
  );
}

function isFullJar(tube) {
  return tube.length === jarCap() && tube.every((color) => color === tube[0]);
}

function isAlmostJar(tube) {
  return tube.length === jarCap() - 1 && tube.length > 0 && tube.every((color) => color === tube[0]);
}

function hasLegalMove(tubes) {
  for (let a = 0; a < tubes.length; a += 1) {
    for (let b = 0; b < tubes.length; b += 1) {
      if (a !== b && canPour(tubes[a], tubes[b])) return true;
    }
  }
  return false;
}

function firstMove(tubes) {
  for (let a = 0; a < tubes.length; a += 1) {
    for (let b = 0; b < tubes.length; b += 1) {
      if (a !== b && canPour(tubes[a], tubes[b])) return { a: a, b: b };
    }
  }
  return null;
}

function almostCount(tubes) {
  return tubes.filter(isAlmostJar).length;
}

function jarEl(index) {
  return board.children[index];
}

function chapterIndex(level) {
  return Math.min(CHAPTERS.length - 1, Math.floor((level - 1) / 10));
}

function chapterPos(level) {
  return ((level - 1) % 10) + 1;
}

function totalStars() {
  return progress.stars.reduce((sum, value) => sum + value, 0);
}

function starCount() {
  const src = state.levelSrc || state.level;
  let par = LEVEL_PARS[src - 1] || 8;
  par = Math.max(5, Math.round(par * (1 - 0.08 * Math.max(0, (progress.stage || 1) - 1))));
  if (state.moves <= par + 1) return 3;
  if (state.moves <= par + 4) return 2;
  return 1;
}

function skinName(id) {
  const found = SKINS.find((item) => item.id === id);
  return found ? found.name : "Стекло";
}

function ownsSkin(id) {
  return progress.skins.indexOf(id) !== -1;
}

function nextFreeSkin() {
  return SKINS.find((item) => !item.premium && item.id !== "default" && !ownsSkin(item.id));
}

function skinMark(item) {
  if (progress.skin === item.id) return "надет";
  if (ownsSkin(item.id)) return "твой";
  if (item.premium) return String(item.price);
  return "сундук";
}

function wearSkin(id) {
  if (!ownsSkin(id)) return false;
  progress.skin = id;
  saveProgress();
  paintHud();
  paintScene();
  paintSettings();
  paintSkins();
  if (state.tubes.length) render(false);
  return true;
}

function buySkin(id) {
  const item = SKINS.find((row) => row.id === id);
  if (!item) return;
  if (ownsSkin(id)) {
    wearSkin(id);
    showPassToast("Надел «" + item.name + "»");
    return;
  }
  if (!item.premium) {
    showPassToast("«" + item.name + "» падает из сундука главы");
    return;
  }
  if (progress.coins < item.price) {
    showPassToast("Нужно " + item.price + " монет");
    return;
  }
  progress.coins -= item.price;
  progress.skins.push(id);
  progress.skin = id;
  saveProgress();
  paintHud();
  paintScene();
  paintSettings();
  paintMenu();
  paintShop();
  paintSkins();
  if (state.tubes.length) render(false);
  showPassToast("Купил «" + item.name + "»");
  feel("full");
  tone(620, 0.12, "triangle", 0.04);
}

function paintSkins() {
  const grid = document.getElementById("skin-grid");
  const lead = document.getElementById("skins-lead");
  if (!grid) return;
  const owned = progress.skins.filter((id) => SKINS.some((item) => item.id === id)).length;
  const premiumOwned = SKINS.filter((item) => item.premium && ownsSkin(item.id)).length;
  if (lead) {
    lead.textContent =
      "У тебя " +
      owned +
      " / 20. Премиум " +
      premiumOwned +
      " / 12. Монет " +
      progress.coins +
      ".";
  }
  grid.innerHTML = "";
  SKINS.forEach((item, i) => {
    const card = document.createElement("button");
    card.type = "button";
    card.dataset.id = item.id;
    card.className =
      "skin-card" +
      (ownsSkin(item.id) ? " owned" : " locked") +
      (progress.skin === item.id ? " on" : "") +
      (item.premium ? " premium" : "");
    card.style.animationDelay = i * 18 + "ms";
    card.innerHTML =
      "<span class=\"skin-mini jar skin-" +
      item.id +
      " settled\"><span class=\"layer\" style=\"background:#e85d4c\"></span><span class=\"layer\" style=\"background:#f4b942\"></span><span class=\"layer\" style=\"background:#3ecf8e\"></span></span><b>" +
      item.name +
      "</b><small class=\"with-coin\">" +
      (item.premium && !ownsSkin(item.id) ? "<img class=\"coin\" src=\"coin.svg?v=49\" alt=\"\" />" : "") +
      skinMark(item) +
      "</small>";
    grid.appendChild(card);
  });
}

function openSkins() {
  closeLeague();
  closeShop();
  closePackStore();
  closeTower();
  closeSettings();
  closeMenu();
  paintSkins();
  const el = document.getElementById("skins-overlay");
  if (el) el.classList.add("show");
  syncScreens();
}

function closeSkins() {
  const el = document.getElementById("skins-overlay");
  if (el) el.classList.remove("show");
  syncScreens();
}

function hashStr(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function weekId() {
  const now = new Date();
  const date = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return date.getUTCFullYear() + "-W" + String(week).padStart(2, "0");
}

function daysToMonday() {
  const now = new Date();
  const day = now.getDay() || 7;
  return day === 1 ? 7 : 8 - day;
}

function nextMonday() {
  const now = new Date();
  const add = daysToMonday();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + add, 0, 0, 0, 0);
}

function weekLeftText() {
  let ms = Math.max(0, nextMonday().getTime() - Date.now());
  const d = Math.floor(ms / 86400000);
  ms -= d * 86400000;
  const h = Math.floor(ms / 3600000);
  ms -= h * 3600000;
  const m = Math.floor(ms / 60000);
  if (d > 0) return d + "д " + h + "ч";
  if (h > 0) return h + "ч " + m + "м";
  return m + " мин";
}

function paintWeekClocks() {
  const left = weekLeftText();
  const home = document.getElementById("home-tower-clock");
  if (home) home.textContent = left + " до приза";
  const top = document.getElementById("tower-clock");
  if (top) top.textContent = left;
}

function syncWeek() {
  const id = weekId();
  if (progress.weekId === id) return;
  progress.weekId = id;
  progress.weekRace = { level: 0, stars: 0, moves: 99 };
  progress.lastPlace = 0;
  progress.seals = {};
  progress.towerDone = [false, false, false, false, false];
  progress.towerScore = 0;
  progress.towerPressDay = "";
  progress.towerWounds = 0;
  progress.towerHitNews = [];
  progress.towerNpc = {};
  progress.towerTickAt = 0;
  progress.towerHold = {};
  saveProgress();
}

function hinderLocks() {
  return hashStr(weekId() + ":hinder") % 3;
}

function faceOf(name, you) {
  if (you) return { name: YOU, letter: "Я", color: "#f4b942", you: true };
  return {
    name: name,
    letter: name.charAt(0),
    color: COLORS[hashStr(name) % COLORS.length],
    you: false,
  };
}

function paintFace(el, name, you) {
  if (!el) return;
  const face = faceOf(name, you);
  el.textContent = face.letter;
  el.style.background = face.color;
}

function towerKeepers() {
  const table = leagueTable();
  const names = RIVALS.slice().sort((a, b) => hashStr(weekId() + a) - hashStr(weekId() + b));
  const picked = names.slice(0, TOWER_FLOORS);
  picked.sort((a, b) => rivalScore(a) - rivalScore(b));
  return picked.map((name, floor) => {
    const row = table.find((item) => item.name === name);
    return {
      floor: floor,
      name: name,
      score: row ? row.score : rivalScore(name),
      place: row ? row.place : 0,
      seals: Number(progress.seals[name]) || 0,
    };
  });
}

function towerKeeper(floor) {
  return towerKeepers()[floor] || towerKeepers()[0];
}

function towerBandPools() {
  const rows = LEVELS.map((_, i) => ({ n: i + 1, par: LEVEL_PARS[i] || 0 }));
  rows.sort((a, b) => a.par - b.par || a.n - b.n);
  const midFrom = Math.floor(rows.length * 0.35);
  const hardFrom = Math.floor(rows.length * 0.72);
  return {
    mid: rows.slice(midFrom, hardFrom).map((row) => row.n),
    hard: rows.slice(hardFrom).map((row) => row.n),
  };
}

function rollTowerLevel() {
  const bands = towerBandPools();
  const mid = Math.random() < 0.1 && bands.mid.length;
  const pool = mid ? bands.mid : bands.hard.length ? bands.hard : bands.mid;
  if (!pool.length) return LEVELS.length;
  return pool[Math.floor(Math.random() * pool.length)];
}

function towerLockCount(floor) {
  return Math.min(3, 2 + Math.floor(floor / 2));
}

function towerEnterPrice(floor) {
  return TOWER_ENTER + Math.max(0, floor) * 18;
}

function nextTowerFloor() {
  const i = progress.towerDone.findIndex((done) => !done);
  return i < 0 ? 0 : i;
}

function raceLevel() {
  const cap = Math.min(Math.max(progress.unlocked, 1), 40);
  return 1 + (hashStr(weekId() + ":race") % cap);
}

function raceBonus() {
  const race = progress.weekRace;
  if (!race || race.level !== raceLevel() || !race.stars) return 0;
  const par = LEVEL_PARS[race.level - 1] || 8;
  return race.stars * 14 + Math.max(0, par + 6 - race.moves);
}

function playerScore() {
  const chests = progress.chests.filter(Boolean).length;
  return (
    totalStars() * 8 +
    progress.unlocked * 6 +
    chests * 18 +
    (progress.maxStreak || 0) * 4 +
    raceBonus()
  );
}

function rivalScore(name) {
  const seals = Number(progress.seals[name]) || 0;
  return Math.max(8, 24 + (hashStr(weekId() + "|" + name) % 168) - seals * 24);
}

function leagueTable() {
  const rows = RIVALS.map((name) => ({ name: name, score: rivalScore(name), you: false }));
  rows.push({ name: YOU, score: playerScore(), you: true });
  rows.sort((a, b) => b.score - a.score || (a.you ? -1 : b.you ? 1 : 0));
  return rows.map((row, i) => {
    row.place = i + 1;
    return row;
  });
}

function weekDayNum() {
  const parts = dayStamp().split("-").map(Number);
  const wd = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0)).getUTCDay();
  return wd === 0 ? 7 : wd;
}

function nickPersona(name) {
  const h = hashStr(weekId() + ":who:" + name);
  const h2 = hashStr(weekId() + ":who2:" + name);
  return {
    pace: 1 + (h % 3),
    surge: 1 + (h2 % 7),
    skip: h % 64,
    quit: h % 17 === 0 ? 3 + (h2 % 4) : 0,
    late: h % 21 === 0 ? 2 + (h2 % 3) : 0,
    ghost: h % 29 === 0,
  };
}

function npcOnBoard(name, at) {
  const life = nickPersona(name);
  const day = weekDayNum();
  if (life.late && day < life.late) return false;
  if (life.ghost && day >= 3 && hashStr(weekId() + ":ghost:" + name) % 2) return false;
  if (life.quit && day >= life.quit) return false;
  return true;
}

function holdOf(name) {
  if (!progress.towerHold) progress.towerHold = {};
  return progress.towerHold[name] || {};
}

function isFrozen(name, at) {
  return (holdOf(name).freezeUntil || 0) > (at || Date.now());
}

function isSlowed(name, at) {
  return (holdOf(name).slowUntil || 0) > (at || Date.now());
}

function holdClass(name, you) {
  if (you || !name) return "";
  if (isFrozen(name)) return " frozen";
  if (isSlowed(name)) return " slowed";
  return "";
}

function rivalTowerScoreSeed(name) {
  const life = nickPersona(name);
  if (!npcOnBoard(name)) return null;
  let score = 1 + (hashStr(weekId() + ":seed:" + name) % 3);
  const last = weekDayNum();
  for (let d = life.late || 1; d <= last; d += 1) {
    const skipped = (life.skip >> (d - 1)) & 1;
    if (skipped && d !== life.surge && hashStr(weekId() + name + ":skip" + d) % 3) continue;
    let add = life.pace + (hashStr(weekId() + name + ":d" + d) % 3);
    if (d === life.surge) add = add * 2 + 5;
    if (d >= 6) add += 2;
    score += add;
  }
  return Math.max(0, score);
}

function seedTowerNpc() {
  if (!progress.towerNpc) progress.towerNpc = {};
  TOWER_NICKS.forEach((name) => {
    if (progress.towerNpc[name] != null) return;
    if (!npcOnBoard(name)) return;
    const seed = rivalTowerScoreSeed(name);
    if (seed != null) progress.towerNpc[name] = seed;
  });
  if (!progress.towerTickAt) progress.towerTickAt = Date.now();
}

function npcTickGain(name, tickIndex, at) {
  if (!npcOnBoard(name, at)) return 0;
  if (isFrozen(name, at)) return 0;
  const life = nickPersona(name);
  const h = hashStr(weekId() + ":live:" + name + ":" + tickIndex);
  let gate = 12 - life.pace;
  if (life.surge && tickIndex % (36 + life.surge * 8) < 4) gate = 4;
  if (isSlowed(name, at)) gate += 7 + (holdOf(name).slow || 1) * 4;
  if (h % Math.max(3, gate) !== 0) return 0;
  return 1 + (h % 19 === 0 ? 1 : 0);
}

let towerSaveAt = 0;
let lastTowerScores = {};
let towerLiveTimer = 0;

function maybeSaveTowerLive() {
  if (Date.now() - towerSaveAt < 20000) return;
  towerSaveAt = Date.now();
  saveProgress();
}

function tickTowerLive() {
  syncWeek();
  seedTowerNpc();
  const now = Date.now();
  let t = progress.towerTickAt || now;
  if (t > now) t = now;
  const maxSteps = 2000;
  if (now - t > TOWER_TICK_MS * maxSteps) t = now - TOWER_TICK_MS * maxSteps;
  let moved = false;
  let steps = 0;
  while (t + TOWER_TICK_MS <= now && steps < maxSteps) {
    t += TOWER_TICK_MS;
    steps += 1;
    const idx = Math.floor(t / TOWER_TICK_MS);
    TOWER_NICKS.forEach((name) => {
      const add = npcTickGain(name, idx, t);
      if (!add) return;
      progress.towerNpc[name] = (Number(progress.towerNpc[name]) || 0) + add;
      moved = true;
    });
  }
  progress.towerTickAt = t;
  if (steps) maybeSaveTowerLive();
  return moved;
}

function rivalTowerScore(name) {
  if (!npcOnBoard(name)) return null;
  seedTowerNpc();
  if (progress.towerNpc[name] == null) {
    const seed = rivalTowerScoreSeed(name);
    if (seed == null) return null;
    progress.towerNpc[name] = seed;
  }
  return progress.towerNpc[name];
}

function towerTable() {
  tickTowerLive();
  const rows = [];
  TOWER_NICKS.forEach((name) => {
    const score = rivalTowerScore(name);
    if (score == null) return;
    rows.push({ name: name, score: score, you: false });
  });
  rows.push({ name: YOU, score: progress.towerScore || 0, you: true });
  rows.sort((a, b) => b.score - a.score || (a.you ? -1 : b.you ? 1 : 0));
  return rows.map((row, i) => {
    row.place = i + 1;
    return row;
  });
}

function markedTower() {
  const table = towerTable();
  if (state.towerMark) {
    const hit = table.find((row) => row.name === state.towerMark && !row.you);
    if (hit) return hit;
  }
  return huntTarget(table).next;
}

function visibleTowerRows(table) {
  const me = table.find((row) => row.you);
  const keep = {};
  table.slice(0, 3).forEach((row) => {
    keep[row.name] = row;
  });
  if (me) {
    table
      .filter((row) => Math.abs(row.place - me.place) <= 7)
      .forEach((row) => {
        keep[row.name] = row;
      });
  }
  if (state.towerMark) {
    const mark = table.find((row) => row.name === state.towerMark);
    if (mark) keep[mark.name] = mark;
  }
  return Object.keys(keep)
    .map((name) => keep[name])
    .sort((a, b) => a.place - b.place);
}

function syncTowerPressure() {
  tickTowerLive();
}

function armTowerLive() {
  window.clearInterval(towerLiveTimer);
  towerLiveTimer = window.setInterval(() => {
    if (!towerOverlay || !towerOverlay.classList.contains("show")) return;
    const moved = tickTowerLive();
    if (moved && !towerTipOpen() && !state.towerHitBusy) paintTower(true);
  }, 3500);
}

function stopTowerLive() {
  const was = towerLiveTimer;
  window.clearInterval(towerLiveTimer);
  towerLiveTimer = 0;
  if (was) saveProgress();
}

function huntTarget(table) {
  const me = table.find((row) => row.you);
  if (!me) return { me: null, next: null };
  return { me: me, next: table.find((row) => row.place === me.place - 1) || null };
}

function showPassToast(text) {
  if (!passToast) return;
  passToast.textContent = text;
  passToast.classList.add("show");
  window.setTimeout(() => passToast.classList.remove("show"), 2200);
}

function paintLeague() {
  const table = leagueTable();
  const { me } = huntTarget(table);
  const days = daysToMonday();
  leagueLead.textContent =
    "Ещё " +
    days +
    (days === 1 ? " день" : days < 5 ? " дня" : " дней") +
    " до новой сетки. Соперники недели, не живой чат.";
  const around = table.filter((row) => Math.abs(row.place - me.place) <= 3);
  leagueList.innerHTML = "";
  around.forEach((row, i) => {
    const el = document.createElement("div");
    const face = faceOf(row.name, row.you);
    el.className = "league-row" + (row.you ? " you" : "");
    el.style.animationDelay = i * 40 + "ms";
    el.innerHTML =
      "<span class=\"place\">" +
      row.place +
      "</span><span class=\"face\" style=\"background:" +
      face.color +
      "\">" +
      face.letter +
      "</span><span class=\"name\">" +
      row.name +
      "</span><span class=\"score\">" +
      row.score +
      "</span>";
    leagueList.appendChild(el);
  });
  const race = raceLevel();
  const done = progress.weekRace.level === race && progress.weekRace.stars;
  leagueRace.textContent = done
    ? "Забег ур. " + race + " · " + progress.weekRace.stars + "★ / " + progress.weekRace.moves
    : "Забег недели · уровень " + race;
  paintHunt();
}

function paintHunt() {
  const { me, next } = huntTarget(towerTable());
  if (hudPlace && me) hudPlace.textContent = String(me.place);
  if (huntEl) {
    if (state.mode === "tower") {
      huntEl.textContent =
        "Башня · очки " +
        (progress.towerScore || 0) +
        " · #" +
        (me ? me.place : "—") +
        ". Закрой банки, открывай свои ходы за монеты.";
    } else {
      huntEl.textContent = "";
    }
  }
  if (hinderEl) {
    const hz = hinderLocks();
    hinderEl.textContent =
      state.mode === "tower"
        ? "Он закрыл тебе ходы. Свои открываешь за монеты, чужие — печатью."
        : hz && state.level > 5
          ? "Помеха недели: закрыто " + hz + (hz === 1 ? " колба." : " колбы.")
          : "";
  }
}

function paintDuel() {
  if (duelEl) duelEl.hidden = true;
}

function paintMap() {
  if (!mapGrid) return;
  const lead = document.getElementById("map-lead");
  const cont = document.getElementById("map-continue");
  const stop = state.mode === "story" && state.tubes.length ? state.level : progress.unlocked;
  if (lead) {
    lead.textContent =
      (progress.stage || 1) > 1
        ? "Сотня " + progress.stage + ". Те же 100, уже злее."
        : "Собирай монеты и звёзды для главного сундука в башне тут";
  }
  if (cont) cont.textContent = "Начать";
  syncUnlocked();
  const last = Math.min(storyLevelCount(), progress.unlocked + (progress.unlocked < storyLevelCount() ? 1 : 0));
  mapGrid.innerHTML = "";
  for (let n = 1; n <= last; n += 1) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.level = String(n);
    const stars = progress.stars[n - 1] || 0;
    const now = n === stop;
    const lock = n > progress.unlocked;
    btn.className = "map-cell" + (stars ? " done" : "") + (now ? " now" : "") + (lock ? " lock" : "");
    btn.style.animationDelay = ((n - 1) % 10) * 18 + "ms";
    if (lock) {
      btn.textContent = "🔒";
    } else {
      btn.innerHTML = "<b>" + n + "</b><small>" + (stars ? "★".repeat(stars) : "") + "</small>";
    }
    mapGrid.appendChild(btn);
  }
}

function openMap() {
  closeMenu();
  closeTower();
  closeLeague();
  closeShop();
  closePackStore();
  closeSettings();
  closeSkins();
  paintMap();
  if (mapOverlay) mapOverlay.classList.add("show");
  syncScreens();
}

function closeMap() {
  if (mapOverlay) mapOverlay.classList.remove("show");
  syncScreens();
}

function pickLevel(n) {
  syncUnlocked();
  if (n > progress.unlocked) {
    showPassToast("Сначала пройди уровень " + progress.unlocked);
    return;
  }
  closeMap();
  startLevel(n);
}

function continueLevel() {
  if (state.mode === "story" && state.tubes.length) {
    closeMap();
    return;
  }
  pickLevel(progress.unlocked);
}

const HIT_BOMB =
  "<svg class=\"hit-draw\" viewBox=\"0 0 32 32\" aria-hidden=\"true\">" +
  "<path fill=\"#2b2b32\" stroke=\"#121214\" stroke-width=\"1.4\" d=\"M8.6 18.6c0-5.1 3.5-8.9 7.4-8.9s7.4 3.8 7.4 8.9-3.5 9.1-7.4 9.1-7.4-4-7.4-9.1z\"/>" +
  "<path fill=\"#3c3c46\" d=\"M12.2 16.2c1-3 2.8-4.8 4.3-4.8 0 0-1.3 2.8.6 5.8-2 .2-4-.3-4.9-1z\" opacity=\".55\"/>" +
  "<path fill=\"none\" stroke=\"#c4843a\" stroke-width=\"1.8\" stroke-linecap=\"round\" d=\"M19.1 11c2.1-3.1 5.3-4.5 7.1-3.3\"/>" +
  "<path fill=\"#f4b942\" d=\"M26.1 5.7c1.4.2 2.3 1.6 1.5 3-1.1.4-2.5-.6-2.7-1.8-.1-.6.3-1.2 1.2-1.2z\"/>" +
  "<circle cx=\"27.3\" cy=\"7.2\" r=\"1.1\" fill=\"#fff3b0\"/>" +
  "</svg>";

const HIT_SEAL =
  "<svg class=\"hit-draw\" viewBox=\"0 0 32 32\" aria-hidden=\"true\">" +
  "<path fill=\"#6ec8e8\" stroke=\"#2a6a80\" stroke-width=\"1.3\" d=\"M11 7.2h10l.6 1.6h1.8v2.1l-1.2.7v12.2c0 2.1-1.8 3.6-3.8 3.6h-4.8c-2 0-3.8-1.5-3.8-3.6V11.6L9 10.9V8.8h1.4L11 7.2z\"/>" +
  "<path fill=\"#9adcf0\" d=\"M12.2 11.4h7.6v11.2c0 1.1-.8 1.8-1.8 1.8h-4c-1 0-1.8-.7-1.8-1.8z\"/>" +
  "<path fill=\"#e8f7fc\" opacity=\".55\" d=\"M13 12.2h2.2v9.2h-2.2z\"/>" +
  "<path fill=\"none\" stroke=\"#e85d4c\" stroke-width=\"2.6\" stroke-linecap=\"round\" d=\"M8.4 8.2 23.6 24.2\"/>" +
  "<path fill=\"none\" stroke=\"#e85d4c\" stroke-width=\"2.6\" stroke-linecap=\"round\" d=\"M23.6 8.2 8.4 24.2\"/>" +
  "</svg>";

function hitIcons(name, you) {
  if (you) return "<span class=\"hits\"></span>";
  const bombOff = progress.bombs > 0 ? "" : " dim";
  const sealOff = progress.coins >= SEAL_PRICE ? "" : " dim";
  return (
    "<span class=\"hits\">" +
    "<button class=\"hit bomb" +
    bombOff +
    "\" type=\"button\" data-hit=\"bomb\" data-name=\"" +
    name +
    "\" aria-label=\"Бомба\">" +
    HIT_BOMB +
    "</button>" +
    "<button class=\"hit seal" +
    sealOff +
    "\" type=\"button\" data-hit=\"seal\" data-name=\"" +
    name +
    "\" aria-label=\"Печать\">" +
    HIT_SEAL +
    "</button>" +
    "</span>"
  );
}

function holdBadge(name, you) {
  if (you || !name) return "";
  if (isFrozen(name)) {
    return "<span class=\"hold-badge dead\" aria-hidden=\"true\"><span class=\"mini-flask\"><i></i><i></i></span></span>";
  }
  if (isSlowed(name)) {
    return "<span class=\"hold-badge crack\" aria-hidden=\"true\"><span class=\"mini-flask crack\"><i></i><i></i></span></span>";
  }
  return "";
}

function towerCardOf(name) {
  const nodes = document.querySelectorAll("#tower-overlay [data-name]");
  for (let i = 0; i < nodes.length; i += 1) {
    if (nodes[i].getAttribute("data-name") === name) {
      return nodes[i].closest(".league-row, .podium-slot");
    }
  }
  return null;
}

function towerHitHost() {
  const el = document.getElementById("tower-hit-fx");
  if (el) el.innerHTML = "";
  return el;
}

function hitAnchor(name, btn) {
  const card = towerCardOf(name);
  if (card && card.scrollIntoView) card.scrollIntoView({ block: "nearest", inline: "nearest" });
  const node = card || btn || document.getElementById("tower-overlay");
  const r = node ? node.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
  const onScreen = r.height && r.bottom > 70 && r.top < window.innerHeight - 24;
  if (!onScreen && btn) {
    const br = btn.getBoundingClientRect();
    return { card: card, x: br.left + br.width / 2, y: br.top + br.height / 2 };
  }
  return { card: card, x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

async function playSealAnim(name, btn) {
  if (!settings.juice) return;
  await wait(30);
  const host = towerHitHost();
  if (!host) return;
  const at = hitAnchor(name, btn);
  if (at.card) {
    at.card.classList.add("hit-punch");
    window.setTimeout(() => at.card.classList.remove("hit-punch"), 900);
  }
  const scene = document.createElement("div");
  scene.className = "hit-scene seal-scene";
  scene.style.left = at.x + "px";
  scene.style.top = at.y + "px";
  scene.innerHTML =
    "<div class=\"hit-mini-jar\">" +
    "<i class=\"c1\"></i><i class=\"c2\"></i><i class=\"c3\"></i>" +
    "<span class=\"hit-frost\"></span>" +
    "<span class=\"hit-lock\"></span>" +
    "<span class=\"hit-cross\"></span>" +
    "</div>";
  host.appendChild(scene);
  feel("full");
  tone(420, 0.1, "sine", 0.04);
  await wait(280);
  scene.classList.add("slam");
  feel("fail");
  tone(180, 0.16, "sawtooth", 0.04);
  tone(140, 0.2, "triangle", 0.03);
  await wait(820);
  host.innerHTML = "";
}

async function playBombAnim(name, btn) {
  if (!settings.juice) return;
  await wait(30);
  const host = towerHitHost();
  if (!host) return;
  const at = hitAnchor(name, btn);
  const from = document.getElementById("chip-bomb") || btn;
  const fr = from ? from.getBoundingClientRect() : { left: at.x, top: 80, width: 36, height: 36 };
  const x1 = fr.left + fr.width / 2;
  const y1 = fr.top + fr.height / 2;
  const fly = document.createElement("div");
  fly.className = "hit-bomb-fly";
  fly.style.left = x1 + "px";
  fly.style.top = y1 + "px";
  fly.style.setProperty("--dx", at.x - x1 + "px");
  fly.style.setProperty("--dy", at.y - y1 + "px");
  fly.innerHTML = HIT_BOMB;
  host.appendChild(fly);
  if (from) from.classList.add("throw");
  tone(260, 0.1, "sine", 0.035);
  await wait(420);
  fly.remove();
  if (from) from.classList.remove("throw");
  if (at.card) {
    at.card.classList.add("hit-boom");
    window.setTimeout(() => at.card.classList.remove("hit-boom"), 900);
  }
  const scene = document.createElement("div");
  scene.className = "hit-scene bomb-scene boom";
  scene.style.left = at.x + "px";
  scene.style.top = at.y + "px";
  scene.innerHTML =
    "<div class=\"hit-flash\"></div>" +
    "<div class=\"hit-mini-jar crack-now\">" +
    "<i class=\"c1\"></i><i class=\"c2\"></i><i class=\"c3\"></i>" +
    "<span class=\"hit-crack\"></span>" +
    "</div>";
  host.appendChild(scene);
  spawnBurst({ left: at.x - 20, top: at.y - 36, width: 40, height: 40 }, "#e85d4c");
  spawnBurst({ left: at.x - 20, top: at.y - 20, width: 40, height: 40 }, "#f4b942");
  feel("win");
  tone(140, 0.18, "sawtooth", 0.045);
  tone(90, 0.22, "triangle", 0.03);
  await wait(780);
  host.innerHTML = "";
}

function huntRow(name) {
  if (name) {
    return towerTable().find((row) => row.name === name && !row.you) || null;
  }
  return markedTower();
}

function paintTower(live) {
  syncTowerPressure();
  const table = towerTable();
  const me = table.find((row) => row.you);
  paintWeekClocks();
  paintTowerPodium(table, live);
  const scoreEl = document.getElementById("tower-score");
  if (scoreEl) {
    scoreEl.textContent =
      "Твои очки: " + (progress.towerScore || 0) + (me ? " · #" + me.place : "");
  }
  if (towerList) {
    const keepScroll = live ? towerList.scrollTop : 0;
    towerList.innerHTML = "";
    const shown = visibleTowerRows(table).filter((row) => row.place > 3);
    let lastPlace = 0;
    shown.forEach((row, i) => {
      if (lastPlace && row.place > lastPlace + 1) {
        const gap = document.createElement("div");
        gap.className = "tower-gap";
        gap.textContent = "…";
        towerList.appendChild(gap);
      }
      lastPlace = row.place;
      const el = document.createElement("div");
      const face = faceOf(row.name, row.you);
      const rose = lastTowerScores[row.name] != null && row.score > lastTowerScores[row.name];
      el.className =
        "league-row" +
        (row.you ? " you" : " pick") +
        (state.towerMark === row.name ? " mark" : "") +
        holdClass(row.name, row.you) +
        (rose ? " rise" : "");
      if (!live) el.style.animationDelay = Math.min(i, 24) * 18 + "ms";
      else el.style.animation = "none";
      el.innerHTML =
        "<span class=\"place\">" +
        row.place +
        "</span><span class=\"face\" style=\"background:" +
        face.color +
        "\">" +
        face.letter +
        "</span><span class=\"name\">" +
        row.name +
        "</span><span class=\"score" +
        (rose ? " rise" : "") +
        "\">" +
        row.score +
        "</span>" +
        holdBadge(row.name, row.you) +
        hitIcons(row.name, row.you);
      if (!row.you) {
        el.addEventListener("click", (event) => {
          if (event.target.closest(".hit")) return;
          state.towerMark = row.name;
          paintTower();
        });
      }
      towerList.appendChild(el);
    });
    if (live) towerList.scrollTop = keepScroll;
    else {
      const youEl = towerList.querySelector(".you");
      if (youEl && youEl.scrollIntoView && !towerTipOpen()) youEl.scrollIntoView({ block: "nearest" });
    }
  }
  table.forEach((row) => {
    lastTowerScores[row.name] = row.score;
  });
  paintDuel();
}

function paintShop() {
  fillCoinLabel(document.getElementById("shop-flask"), "", flaskPrice(), "");
  fillCoinLabel(document.getElementById("shop-seal"), "", SEAL_PRICE, "");
  fillCoinLabel(document.getElementById("shop-undo"), "", undoPackPrice(), "");
  fillCoinLabel(document.getElementById("shop-ad-meta"), "+", AD_COINS, " за просмотр");
  if (shopLead) {
    shopLead.textContent = "";
    shopLead.appendChild(document.createTextNode("У тебя "));
    shopLead.appendChild(coinEl());
    shopLead.appendChild(
      document.createTextNode(" " + progress.coins + " и " + progress.bottleCharges + " запасных колб.")
    );
  }
}

function hasTowerPass() {
  return progress.towerPassWeek === weekId();
}

function paintPassGate() {
  const have = document.getElementById("pass-have");
  const miss = document.getElementById("pass-miss");
  const buy = document.getElementById("pass-buy");
  const shop = document.getElementById("pass-shop");
  const short = Math.max(0, TOWER_PASS - progress.coins);
  fillCoinLabel(have, "", progress.coins, "");
  if (miss) {
    miss.hidden = false;
    miss.textContent = short
      ? "Не хватает " + short + " монет"
      : "Монет хватает — можно войти";
    miss.classList.toggle("ok", !short);
  }
  if (buy) {
    buy.hidden = false;
    buy.classList.toggle("dim", short > 0);
    buy.classList.toggle("lock-ready", short <= 0);
    fillCoinLabel(buy, "Купить пропуск ", TOWER_PASS, "");
  }
  if (shop) shop.hidden = true;
}

function openPassGate() {
  closeLeague();
  closeShop();
  closePackStore();
  closeTower();
  closeSkins();
  closeMap();
  closeMenu();
  paintPassGate();
  const el = document.getElementById("pass-overlay");
  if (el) el.classList.add("show");
  syncScreens();
}

function closePassGate() {
  const el = document.getElementById("pass-overlay");
  if (el) el.classList.remove("show");
  syncScreens();
}

const INTRO_STEPS = [
  {
    ico: "💣",
    title: "Звёзды",
    text: "Собирай звёзды, чтобы получить бомбу. Каждые 100 звёзд наполняют ёмкость — в башне бомбой можно разорвать колбу противнику.",
  },
  {
    ico: "🔥",
    title: "Огонёк",
    text: "Это буст к заработку. Заходи каждый день — не потеряй буст. Каждый день огонёк +1. С выигрыша монет: умножение на 0,1 × число огоньков.",
  },
  {
    ico: "💰",
    title: "Монеты и подсказка",
    text: "Монетки — на покупки. Лампочка — подсказка хода. Это и так видно в шапке.",
  },
];

let introStep = 0;

function paintIntro() {
  const step = INTRO_STEPS[introStep] || INTRO_STEPS[0];
  const ico = document.getElementById("intro-ico");
  const title = document.getElementById("intro-title");
  const text = document.getElementById("intro-text");
  const next = document.getElementById("intro-next");
  const dots = document.getElementById("intro-dots");
  if (ico) {
    ico.textContent = step.ico;
    ico.classList.remove("pop");
    void ico.offsetWidth;
    ico.classList.add("pop");
  }
  if (title) title.textContent = step.title;
  if (text) text.textContent = step.text;
  if (next) next.textContent = introStep >= INTRO_STEPS.length - 1 ? "Понятно" : "Дальше";
  if (dots) {
    dots.innerHTML = INTRO_STEPS.map((_, i) => "<i class=\"" + (i === introStep ? "on" : "") + "\"></i>").join("");
  }
}

function openIntro() {
  introStep = 0;
  paintIntro();
  const el = document.getElementById("intro-overlay");
  if (el) el.classList.add("show");
  syncScreens();
}

function closeIntro() {
  progress.seenIntro = true;
  saveProgress();
  const el = document.getElementById("intro-overlay");
  if (el) el.classList.remove("show");
  syncScreens();
}

function stepIntro() {
  if (introStep >= INTRO_STEPS.length - 1) {
    closeIntro();
    return;
  }
  introStep += 1;
  paintIntro();
}

function buyTowerPass() {
  const buy = document.getElementById("pass-buy");
  if (progress.coins < TOWER_PASS) {
    if (buy) shake(buy);
    showPassToast("Нужно 1000 монет. Играй уровни — копи.");
    feel("fail");
    return;
  }
  progress.coins -= TOWER_PASS;
  progress.towerPassWeek = weekId();
  saveProgress();
  paintHud();
  paintMenu();
  feel("win");
  tone(523, 0.12, "sine", 0.04);
  tone(659, 0.16, "triangle", 0.035);
  closePassGate();
  openTower();
  showPassToast("Пропуск на неделю твой. Можно соревноваться.");
}

function tryEnterTower() {
  if (hasTowerPass()) {
    openTower();
    return;
  }
  openPassGate();
}

function paintTowerPodium(table, live) {
  const host = document.getElementById("tower-podium");
  if (!host) return;
  host.innerHTML = "";
  const medals = ["", "золото", "серебро", "бронза"];
  [2, 1, 3].forEach((place) => {
    const row = table.find((item) => item.place === place);
    const slot = document.createElement("div");
    const rose = row && lastTowerScores[row.name] != null && row.score > lastTowerScores[row.name];
    slot.className =
      "podium-slot p" +
      place +
      (row && row.you ? " you" : "") +
      (row ? holdClass(row.name, row.you) : "") +
      (rose ? " rise" : "");
    if (row && !row.you) {
      slot.classList.add("pick");
      if (state.towerMark === row.name) slot.classList.add("mark");
      slot.addEventListener("click", (event) => {
        if (event.target.closest(".hit")) return;
        state.towerMark = row.name;
        paintTower();
      });
    }
    if (live) slot.style.animation = "none";
    const face = faceOf(row ? row.name : "—", !!(row && row.you));
    slot.innerHTML =
      "<span class=\"podium-face\" style=\"background:" +
      face.color +
      "\">" +
      face.letter +
      "</span><b>" +
      (row ? row.name : "—") +
      "</b><small class=\"" +
      (rose ? "rise" : "") +
      "\">" +
      (row ? row.score : "0") +
      "</small>" +
      holdBadge(row ? row.name : "", !row || row.you) +
      hitIcons(row ? row.name : "", !row || row.you) +
      "<em>" +
      place +
      "</em><i>" +
      medals[place] +
      "</i>";
    host.appendChild(slot);
  });
}

function openTower() {
  closeLeague();
  closeShop();
  closePackStore();
  closeSkins();
  closeMap();
  closeMenu();
  syncTowerPressure();
  paintTower();
  towerOverlay.classList.add("show");
  syncScreens();
  armTowerLive();
  window.setTimeout(() => startTowerTip(), 80);
}

function closeTower() {
  hideTowerTip(false);
  stopTowerLive();
  towerOverlay.classList.remove("show");
  syncScreens();
}

let towerTipStep = 0;

function towerTipOpen() {
  const tip = document.getElementById("tower-tip");
  return !!(tip && tip.classList.contains("show"));
}

function hideTowerTip(done) {
  const tip = document.getElementById("tower-tip");
  if (tip) tip.classList.remove("show");
  document.querySelectorAll(".hit.tip-hot").forEach((el) => el.classList.remove("tip-hot"));
  if (done && !progress.seenTowerHelp) {
    progress.seenTowerHelp = true;
    saveProgress();
  }
}

function startTowerTip() {
  if (progress.seenTowerHelp || !towerOverlay.classList.contains("show")) return;
  towerTipStep = 0;
  paintTowerTip();
}

function paintTowerTip() {
  const kind = towerTipStep === 0 ? "bomb" : "seal";
  const host = document.querySelector("#tower-overlay .hit." + kind);
  if (!host) {
    hideTowerTip(true);
    return;
  }
  const row = host.closest(".league-row, .podium-slot");
  if (row && row.scrollIntoView) row.scrollIntoView({ block: "nearest" });
  window.requestAnimationFrame(() => placeTowerTip(host, kind));
}

function placeTowerTip(host, kind) {
  const tip = document.getElementById("tower-tip");
  const spot = document.getElementById("tower-tip-spot");
  const arrow = document.getElementById("tower-tip-arrow");
  const card = document.getElementById("tower-tip-card");
  const text = document.getElementById("tower-tip-text");
  const next = document.getElementById("tower-tip-next");
  if (!tip || !spot || !arrow || !card || !text || !next) return;
  document.querySelectorAll(".hit.tip-hot").forEach((el) => el.classList.remove("tip-hot"));
  host.classList.add("tip-hot");
  text.textContent =
    kind === "bomb"
      ? "Бомба усложняет ему уровень. Он набирает очки медленнее. Бомбы копятся из звёзд."
      : "Печать закрывает банку. Он застывает — очки не растут. Платишь монетами.";
  next.textContent = kind === "bomb" ? "Дальше" : "Понятно";
  const r = host.getBoundingClientRect();
  const pad = 6;
  spot.style.left = r.left - pad + "px";
  spot.style.top = r.top - pad + "px";
  spot.style.width = r.width + pad * 2 + "px";
  spot.style.height = r.height + pad * 2 + "px";
  const midX = r.left + r.width / 2;
  const below = window.innerHeight - r.bottom > 176;
  arrow.className = "tower-tip-arrow " + (below ? "up" : "down");
  arrow.style.left = midX + "px";
  arrow.style.top = (below ? r.bottom + 8 : r.top - 22) + "px";
  card.style.left = "50%";
  card.style.transform = "translateX(-50%)";
  if (below) {
    card.style.top = r.bottom + 36 + "px";
    card.style.bottom = "auto";
  } else {
    card.style.top = "auto";
    card.style.bottom = window.innerHeight - r.top + 28 + "px";
  }
  tip.classList.add("show");
}

function stepTowerTip() {
  if (towerTipStep >= 1) {
    hideTowerTip(true);
    return;
  }
  towerTipStep += 1;
  paintTowerTip();
}

function onTowerTipMove() {
  if (!towerTipOpen()) return;
  const kind = towerTipStep === 0 ? "bomb" : "seal";
  const host = document.querySelector("#tower-overlay .hit." + kind);
  if (host) placeTowerTip(host, kind);
}

function openShop() {
  closeLeague();
  closePackStore();
  closeTower();
  closeSkins();
  closeMap();
  paintShop();
  shopOverlay.classList.add("show");
  syncScreens();
}

function closeShop() {
  shopOverlay.classList.remove("show");
  syncScreens();
}

function packLootText(pack) {
  return (
    pack.coins +
    " монет · " +
    pack.bombs +
    " бомб" +
    (pack.fire ? " · огонёк ×2" : "")
  );
}

let packAdIndex = 0;
let packAdTimer = 0;

function paintPackAd() {
  const el = document.getElementById("pack-ad");
  if (!el) return;
  const pack = COIN_PACKS[packAdIndex % COIN_PACKS.length];
  const price = document.getElementById("pack-ad-price");
  const ico = document.getElementById("pack-ad-ico");
  if (price) price.textContent = pack.uah + "₴";
  if (ico) ico.textContent = pack.fire ? "🔥" : pack.bombs >= 30 ? "💣" : "💰";
  el.setAttribute("aria-label", "Набор «" + pack.name + "» · " + pack.uah + " грн");
  el.classList.remove("flip");
  void el.offsetWidth;
  el.classList.add("flip");
  el.dataset.pack = pack.id;
}

function armPackAd() {
  paintPackAd();
  window.clearInterval(packAdTimer);
  packAdTimer = window.setInterval(() => {
    packAdIndex += 1;
    paintPackAd();
  }, 5200);
}

function paintPackStore() {
  const grid = document.getElementById("pack-grid");
  if (!grid) return;
  grid.innerHTML = "";
  COIN_PACKS.forEach((pack) => {
    const card = document.createElement("button");
    card.className = "pack-offer" + (pack.fire ? " fat" : "");
    card.type = "button";
    card.setAttribute("data-pack", pack.id);
    card.innerHTML =
      (pack.fire ? "<i>жирный</i>" : "") +
      "<b>" +
      pack.name +
      "</b>" +
      "<span class=\"pack-loot\">" +
      "<em>+" +
      pack.coins +
      " монет</em>" +
      "<em>" +
      pack.bombs +
      " бомб</em>" +
      (pack.fire ? "<em>огонёк ×2 навсегда</em>" : "") +
      "</span>" +
      "<strong>" +
      pack.uah +
      " грн</strong>";
    grid.appendChild(card);
  });
}

function openPackStore() {
  closeLeague();
  closeShop();
  closeSkins();
  closeSettings();
  const onTower = towerOverlay && towerOverlay.classList.contains("show");
  if (!onTower) {
    closeTower();
    closeMap();
    if (boot && !state.tubes.length) boot.classList.add("show");
  }
  paintPackStore();
  const el = document.getElementById("pack-overlay");
  if (el) el.classList.add("show");
  syncScreens();
}

function closePackStore() {
  const el = document.getElementById("pack-overlay");
  if (el) el.classList.remove("show");
  syncScreens();
}

async function buyCoinPack(id) {
  const pack = COIN_PACKS.find((item) => item.id === id);
  if (!pack || state.packBusy) return;
  state.packBusy = true;
  const coinsFrom = progress.coins;
  const bombsFrom = progress.bombs || 0;
  progress.coins += pack.coins;
  progress.bombs = bombsFrom + pack.bombs;
  if (pack.fire) progress.fireDouble = true;
  saveProgress();
  feel("win");
  tone(392, 0.1, "sine", 0.04);
  tone(523, 0.14, "sine", 0.045);
  tone(659, 0.2, "triangle", 0.035);
  const coinHud = document.getElementById("hud-coins");
  const bombHud = document.getElementById("hud-bombs");
  if (coinHud && coinHud.parentElement) coinHud.parentElement.classList.add("catch");
  if (fireChip && pack.fire) fireChip.classList.add("hot2");
  try {
    await Promise.all([
      countUp(coinHud, coinsFrom, progress.coins, 900),
      countUp(bombHud, bombsFrom, progress.bombs, 720),
    ]);
    paintHud();
    paintMenu();
    showPassToast("Набор «" + pack.name + "» твой. В Play Market это будет " + pack.uah + " грн.");
  } finally {
    state.packBusy = false;
  }
}

function playTowerFloor() {
  if (towerTipOpen()) return false;
  closeTower();
  closeMap();
  const heat = Math.min(4, Math.floor((progress.towerScore || 0) / 4));
  startLevel(rollTowerLevel(), { tower: true, floor: heat });
  showPassToast("Башня · отдельные очки до понедельника");
  return true;
}

async function sealHunt(name, btn) {
  if (towerTipOpen() || state.towerHitBusy) return;
  const mark = huntRow(name);
  if (!mark || mark.you) {
    showPassToast("Жми печать на игроке.");
    return;
  }
  if (progress.coins < SEAL_PRICE) {
    if (btn) shake(btn);
    shake(document.getElementById("shop-seal"));
    showPassToast("Печать — за монеты.");
    feel("fail");
    return;
  }
  state.towerHitBusy = true;
  progress.coins -= SEAL_PRICE;
  if (!progress.towerHold) progress.towerHold = {};
  const hold = progress.towerHold[mark.name] || {};
  hold.freezeUntil = Math.max(hold.freezeUntil || 0, Date.now()) + SEAL_HOLD_MS;
  progress.towerHold[mark.name] = hold;
  saveProgress();
  paintHud();
  paintLeague();
  paintShop();
  try {
    await playSealAnim(mark.name, btn);
    showPassToast(mark.name + " застыл. Одна банка больше не работает.");
    paintTower();
  } finally {
    state.towerHitBusy = false;
  }
}

async function bombHunt(name, btn) {
  if (towerTipOpen() || state.towerHitBusy) return;
  const mark = huntRow(name);
  if (!mark || mark.you) {
    showPassToast("Жми бомбу на игроке.");
    return;
  }
  if (!(progress.bombs > 0)) {
    if (btn) shake(btn);
    showPassToast("Собери звёзды, чтобы получить бомбу.");
    feel("fail");
    return;
  }
  state.towerHitBusy = true;
  progress.bombs -= 1;
  if (!progress.towerHold) progress.towerHold = {};
  const hold = progress.towerHold[mark.name] || {};
  hold.slowUntil = Math.max(hold.slowUntil || 0, Date.now()) + BOMB_HOLD_MS;
  hold.slow = (hold.slow || 0) + 1;
  progress.towerHold[mark.name] = hold;
  saveProgress();
  paintHud();
  try {
    await playBombAnim(mark.name, btn);
    showPassToast(mark.name + " тормозит. Уровень сложнее — очки капают реже.");
    paintTower();
  } finally {
    state.towerHitBusy = false;
  }
}

function buyFlask() {
  if (progress.coins < flaskPrice()) {
    shake(document.getElementById("shop-flask"));
    return;
  }
  progress.coins -= flaskPrice();
  progress.bottleCharges += 1;
  saveProgress();
  paintHud();
  paintShop();
  showPassToast("Запасная колба +1");
}

function buyUndoPack() {
  if (progress.coins < undoPackPrice()) {
    shake(document.getElementById("shop-undo"));
    return;
  }
  progress.coins -= undoPackPrice();
  progress.undos += 2;
  saveProgress();
  paintHud();
  paintShop();
}

async function buyAdCoins() {
  const btn = document.getElementById("shop-ad");
  if (state.busy) return;
  state.busy = true;
  if (btn) btn.textContent = "Ролик…";
  await wait(1100);
  progress.coins += AD_COINS;
  saveProgress();
  paintHud();
  paintShop();
  if (btn) btn.textContent = "Смотреть";
  state.busy = false;
  showPassToast("+" + AD_COINS + " монет");
}

function openLeague() {
  closeShop();
  closePackStore();
  closeTower();
  closeSkins();
  paintLeague();
  leagueOverlay.classList.add("show");
  syncScreens();
}

function closeLeague() {
  leagueOverlay.classList.remove("show");
  syncScreens();
}

function clearHook() {
  window.clearTimeout(hookTimer);
  Array.prototype.forEach.call(board.children, (el) => el.classList.remove("hook-pulse"));
}

function armHook() {
  clearHook();
  if (!settings.hint) return;
  if (state.level > 3 || state.moves || state.lock) return;
  hookTimer = window.setTimeout(() => {
    if (state.moves || state.lock || state.busy) return;
    const move = firstMove(state.tubes);
    const el = move && jarEl(move.a);
    if (el) el.classList.add("hook-pulse");
  }, 1200);
}

function paintHud() {
  document.getElementById("hud-streak").textContent = String(progress.streak);
  const fireX2 = document.getElementById("hud-fire-x2");
  if (fireX2) fireX2.hidden = !progress.fireDouble;
  if (fireChip) fireChip.classList.toggle("hot2", !!progress.fireDouble);
  const onHome = document.getElementById("boot") && document.getElementById("boot").classList.contains("show");
  const starHud = document.getElementById("hud-stars");
  const bombHud = document.getElementById("hud-bombs");
  if (starHud) starHud.textContent = (progress.starPool || 0) + "/" + BOMB_NEED;
  if (bombHud) bombHud.textContent = String(progress.bombs || 0);
  const coinShown =
    state.holdHudCoins != null ? state.holdHudCoins : onHome ? progress.coins : cash();
  document.getElementById("hud-coins").textContent = String(coinShown);
  document.getElementById("hud-hints").textContent = String(
    state.holdHudHints != null ? state.holdHudHints : progress.hints
  );
  if (progress.hints) hintBtn.textContent = "Подсказка";
  else fillCoinLabel(hintBtn, "Подсказка ", hintPrice(), "");
  if (progress.undos) undoBtn.textContent = "Отмена";
  else fillCoinLabel(undoBtn, "Отмена ", undoPrice(), "");
  if (progress.undos) failUndo.textContent = "Отменить ход";
  else fillCoinLabel(failUndo, "Отменить ход ", undoPrice(), "");
  if (state.locked) fillCoinLabel(failJar, "Открыть банку ", nextLockPrice(), "");
  else failJar.textContent = "Банки открыты";
  failJar.hidden = !state.locked;
  failJar.disabled = !state.locked;
  fillCoinLabel(lockCoins, "Открыть ", nextLockPrice(), "");
  if (lockCharge) {
    lockCharge.hidden = !progress.bottleCharges;
    lockCharge.textContent = "Своя колба · " + progress.bottleCharges;
  }
  fillCoinLabel(failKeep, "Заново, серия " + progress.streak + " ", keepPrice(), "");
  document.getElementById("skin").textContent = "Скин: " + skinName(progress.skin);
  const me = huntTarget(towerTable()).me;
  if (hudPlace && me) hudPlace.textContent = String(me.place);
  const leagueChip = document.getElementById("chip-league");
  if (leagueChip) leagueChip.hidden = state.mode !== "tower";
  const towerHome = document.getElementById("boot-tower");
  if (towerHome) {
    const locked = !hasTowerPass();
    towerHome.classList.toggle("locked", locked);
    towerHome.classList.toggle("poor", locked && progress.coins < TOWER_PASS);
  }
}

function paintMission() {
  if (chapterEl) chapterEl.hidden = true;
  if (goalEl) goalEl.hidden = true;
  if (state.mode === "tower") {
    const { me } = huntTarget(towerTable());
    levelEl.textContent = String(progress.towerScore || 0);
    trackFill.style.width = me ? Math.max(8, (21 - me.place) * 5) + "%" : "50%";
    trackLabel.textContent = me ? "#" + me.place + " · очки до понедельника" : "Очки башни";
    paintScene();
    paintHunt();
    paintDuel();
    return;
  }
  if (duelEl) duelEl.hidden = true;
  levelEl.textContent = String(state.level);
  const done = stageClears();
  trackFill.style.width = Math.min(100, done) + "%";
  trackLabel.textContent = done + " / 100";
  const chest = document.getElementById("track-chest");
  if (chest) chest.classList.toggle("hot", done >= 90);
  paintScene();
  paintHunt();
  paintDuel();
}

function hideFail() {
  state.lock = "";
  failOverlay.classList.remove("show");
  if (lockOverlay) lockOverlay.classList.remove("show");
  board.classList.remove("stuck");
  document.body.classList.remove("dim");
}

function lockCountFor(level) {
  const stage = progress.stage || 1;
  if (level <= 8 && stage === 1) return 0;
  let n = level <= 30 ? 1 : 2;
  if (stage > 1 && level <= 8) n = Math.min(2, stage - 1);
  n += hinderLocks();
  n += Math.min(2, stage - 1);
  return Math.min(4, n);
}

function nextLockPrice() {
  return scaledPrice(LOCK_PRICES[Math.min(state.openedExtra, LOCK_PRICES.length - 1)]);
}

function closeLockShop() {
  if (lockOverlay) lockOverlay.classList.remove("show");
  if (state.lock === "shop") state.lock = "";
}

function openLockShop() {
  if (!state.locked) return;
  if (lockText) {
    lockText.textContent = state.stolenEmpties
      ? "Уровень тесный. Без колбы некуда лить."
      : state.locked === 1
        ? "Последняя закрытая. Откроешь — появится пустое место."
        : "Ещё " + state.locked + " закрытых. Сначала одну.";
  }
  fillCoinLabel(lockCoins, "Открыть ", nextLockPrice(), "");
  if (lockCharge) {
    lockCharge.hidden = !progress.bottleCharges;
    lockCharge.textContent = "Своя колба · " + progress.bottleCharges;
  }
  const poor = progress.coins < nextLockPrice() && !progress.bottleCharges;
  if (lockCoins) lockCoins.classList.toggle("primary", !poor);
  if (lockAd) lockAd.classList.toggle("primary", poor);
  if (state.mode === "tower") {
    lockText.textContent =
      (lockText.textContent || "") + " Это он закрыл тебе ход. Откроешь — можно лить дальше.";
  } else if (hinderLocks() && state.level > 5) {
    lockText.textContent =
      (lockText.textContent || "") + " Часть замков — помеха башни на эту неделю.";
  }
  if (state.lock !== "fail") state.lock = "shop";
  lockOverlay.classList.add("show");
}

function startLevel(level, opts) {
  if (state.busy) return;
  opts = opts || {};
  const tower = !!opts.tower;
  syncUnlocked();
  const want = Math.max(1, level);
  const n = tower
    ? Math.min(LEVELS.length, want)
    : Math.min(progress.unlocked, want);
  const stage = progress.stage || 1;
  const pack = tower ? packedTower(n, stage) : packedLevel(n, stage);
  let packed = pack.tubes;
  let stolen = 0;
  if (!tower && (n > 8 || stage > 1)) {
    const pulled = stealEmpties(packed, pressureSteal());
    packed = pulled.tubes;
    stolen = pulled.stolen;
  }
  state.level = n;
  state.levelSrc = pack.src;
  state.mode = tower ? "tower" : "story";
  state.towerFloor = tower ? opts.floor || 0 : 0;
  state.tubes = packed;
  state.selected = -1;
  state.history = [];
  state.moves = 0;
  state.doubled = false;
  state.stolenEmpties = stolen;
  state.locked = tower
    ? Math.min(4, towerLockCount(opts.floor || 0) + Math.min(2, progress.towerWounds || 0))
    : Math.min(4, lockCountFor(n) + stolen);
  if (tower && progress.towerWounds) {
    progress.towerWounds = Math.max(0, progress.towerWounds - 1);
    saveProgress();
  }
  state.openedExtra = 0;
  hideFail();
  overlay.classList.remove("show");
  paintHud();
  paintMission();
  render(true);
  armHook();
  if (!tower && stolen && !packed.some((tube) => !tube.length)) {
    showPassToast("Пустых нет. Колба или ролик.");
  }
}

function markJars() {
  state.tubes.forEach((tube, index) => {
    const el = jarEl(index);
    if (!el) return;
    el.classList.toggle("sealed", isFullJar(tube));
    el.classList.toggle("almost", !isFullJar(tube) && isAlmostJar(tube));
  });
}

function selectJar(index) {
  state.selected = index;
  Array.prototype.forEach.call(board.children, (el, i) => {
    if (el.classList.contains("locked")) return;
    el.classList.toggle("selected", i === index);
  });
}

function render(enter) {
  board.innerHTML = "";
  state.tubes.forEach((tube, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.i = String(index);
    btn.className =
      "jar skin-" +
      progress.skin +
      (enter ? "" : " settled") +
      (state.selected === index ? " selected" : "");
    if (enter) btn.style.animationDelay = index * 45 + "ms";
    btn.setAttribute("aria-label", "банка " + (index + 1));
    tube.forEach((color) => {
      const layer = document.createElement("span");
      layer.className = "layer";
      layer.style.background = COLORS[color];
      btn.appendChild(layer);
    });
    board.appendChild(btn);
  });
  for (let i = 0; i < state.locked; i += 1) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "jar locked skin-" + progress.skin + (enter ? "" : " settled");
    if (enter) btn.style.animationDelay = (state.tubes.length + i) * 45 + "ms";
    btn.setAttribute("aria-label", "закрытая банка");
    const frost = document.createElement("span");
    frost.className = "lock-frost";
    const mark = document.createElement("span");
    mark.className = "lock-mark";
    const tag = document.createElement("span");
    tag.className = "lock-tag";
    fillCoinLabel(tag, "", nextLockPrice(), "");
    btn.appendChild(frost);
    btn.appendChild(mark);
    btn.appendChild(tag);
    board.appendChild(btn);
  }
  undoBtn.disabled = state.history.length === 0 || state.busy || state.lock === "fail";
  markJars();
}

function spawnBlob(fromBox, toBox, color) {
  if (!settings.juice) return;
  const blob = document.createElement("div");
  blob.className = "blob";
  blob.style.background = color;
  blob.style.setProperty("--x1", fromBox.left + fromBox.width / 2 + "px");
  blob.style.setProperty("--y1", fromBox.top + 18 + "px");
  blob.style.setProperty("--x2", toBox.left + toBox.width / 2 + "px");
  blob.style.setProperty("--y2", toBox.top + 28 + "px");
  fx.appendChild(blob);
  window.setTimeout(() => blob.remove(), 340);
}

function spawnSplash(box, color) {
  if (!settings.juice) return;
  const splash = document.createElement("div");
  splash.className = "splash";
  splash.style.background = color;
  splash.style.left = box.left + box.width / 2 + "px";
  splash.style.top = box.top + 26 + "px";
  fx.appendChild(splash);
  window.setTimeout(() => splash.remove(), 300);
}

function spawnBurst(box, color) {
  if (!settings.juice) return;
  const x = box.left + box.width / 2;
  const y = box.top + 36;
  const ring = document.createElement("div");
  ring.className = "ring";
  ring.style.left = x + "px";
  ring.style.top = y + "px";
  fx.appendChild(ring);
  window.setTimeout(() => ring.remove(), 520);
  for (let i = 0; i < 8; i += 1) {
    const spark = document.createElement("div");
    const ang = (i / 8) * Math.PI * 2;
    spark.className = "spark";
    spark.style.background = color;
    spark.style.left = x + "px";
    spark.style.top = y + "px";
    spark.style.setProperty("--dx", Math.cos(ang) * 42 + "px");
    spark.style.setProperty("--dy", Math.sin(ang) * 36 + "px");
    fx.appendChild(spark);
    window.setTimeout(() => spark.remove(), 480);
  }
}

function shake(index) {
  const el = typeof index === "number" ? jarEl(index) : index;
  if (!el) return;
  el.classList.remove("shake");
  void el.offsetWidth;
  el.classList.add("shake");
  window.setTimeout(() => el.classList.remove("shake"), 380);
}

async function animatePour(fromIdx, toIdx, color, count) {
  const fromEl = jarEl(fromIdx);
  const toEl = jarEl(toIdx);
  const fromBox = fromEl.getBoundingClientRect();
  const toBox = toEl.getBoundingClientRect();
  fromEl.classList.remove("selected");
  fromEl.classList.add(toBox.left >= fromBox.left ? "pour-right" : "pour-left");
  const hex = COLORS[color];
  for (let i = 0; i < count; i += 1) {
    const leaving = fromEl.lastElementChild;
    if (leaving) {
      leaving.classList.add("pour-out");
      await wait(70);
      leaving.remove();
    }
    spawnBlob(fromEl.getBoundingClientRect(), toEl.getBoundingClientRect(), hex);
    await wait(90);
    const incoming = document.createElement("span");
    incoming.className = "layer pour-in";
    incoming.style.background = hex;
    toEl.appendChild(incoming);
    spawnSplash(toEl.getBoundingClientRect(), hex);
    await wait(70);
  }
  fromEl.classList.remove("pour-left", "pour-right");
}

function celebrateJar(index, color) {
  const el = jarEl(index);
  if (!el) return;
  el.classList.remove("full-pop");
  void el.offsetWidth;
  el.classList.add("full-pop", "sealed");
  const hex = COLORS[color] || COLORS[1];
  spawnBurst(el.getBoundingClientRect(), hex);
  pulseScene(hex);
  feel("full");
  tone(520, 0.12, "triangle", 0.05);
  tone(780, 0.16, "sine", 0.03);
}

function rollChest(chapter) {
  const items = [];
  const coins = 36 + chapter * 8 + Math.min(progress.streak, 10) * 2;
  items.push({ kind: "coins", n: coins, text: coins + " монет — на отмену и подсказку" });
  const hints = 1 + (chapter >= 2 ? 1 : 0);
  items.push({
    kind: "hints",
    n: hints,
    text: hints + (hints === 1 ? " подсказка" : " подсказки") + " — подсветят ход",
  });
  items.push({ kind: "undos", n: 1, text: "1 отмена — шаг назад, серия жива" });
  const locked = nextFreeSkin();
  if (locked) {
    items.push({ kind: "skin", id: locked.id, text: "Скин «" + locked.name + "» — вид банок" });
  } else {
    items.push({ kind: "coins", n: 18, text: "+18 монет: простые скины уже твои, премиум — в каталоге" });
  }
  return items;
}

function takeLoot(items) {
  items.forEach((item) => {
    if (item.kind === "coins") progress.coins += item.n;
    if (item.kind === "hints") progress.hints += item.n;
    if (item.kind === "undos") progress.undos += item.n;
    if (item.kind === "skin" && progress.skins.indexOf(item.id) === -1) {
      progress.skins.push(item.id);
      progress.skin = item.id;
    }
  });
}

function applyWinRewards(stars) {
  if (state.mode === "tower") {
    progress.maxStreak = Math.max(progress.maxStreak || 0, progress.streak);
    const points = 1;
    progress.towerScore = (progress.towerScore || 0) + points;
    const coins = 8 + stars * 4;
    gain(coins);
    saveProgress();
    return { coins: coins, firstClear: false, chapterDone: false, chapter: 0, tower: true, points: points };
  }
  const i = state.level - 1;
  const better = stars > progress.stars[i];
  const firstClear = progress.stars[i] === 0;
  const before = progress.stars[i] || 0;
  progress.stars[i] = Math.max(progress.stars[i], stars);
  const bombsMade = addStarsToBomb(progress.stars[i] - before);
  if (!progress.bestMoves) progress.bestMoves = Array(200).fill(0);
  if (!progress.bestMoves[i] || state.moves < progress.bestMoves[i]) {
    progress.bestMoves[i] = state.moves;
  }
  progress.maxStreak = Math.max(progress.maxStreak || 0, progress.streak);
  if (state.level === raceLevel()) {
    const race = progress.weekRace;
    const raceBetter =
      !race.stars ||
      stars > race.stars ||
      (stars === race.stars && state.moves < race.moves);
    if (raceBetter) progress.weekRace = { level: state.level, stars: stars, moves: state.moves };
  }
  let raw = 6 + stars * 8;
  if (better) raw += 10;
  if (stars === 3 && (progress.stage || 1) >= 2) progress.hints += 1;
  const full = Math.round(raw * payoutMult());
  progress.coins += full;
  const prizes = firstClear ? claimMilestones() : [];
  syncUnlocked();
  saveProgress();
  return {
    coins: full,
    raw: raw,
    full: full,
    firstClear,
    chapterDone: false,
    chapter: 0,
    prizes: prizes,
    bombsMade: bombsMade,
  };
}

function shareLine() {
  return (
    "Глава «" +
    CHAPTERS[chapterIndex(state.level)] +
    "» · уровень " +
    state.level +
    " · серия " +
    progress.streak +
    " · лига #" +
    (huntTarget(towerTable()).me || {}).place
  );
}

function drawShareCard() {
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#1a1410";
  ctx.fillRect(0, 0, 720, 900);
  ctx.fillStyle = "#2a2118";
  ctx.fillRect(48, 80, 624, 740);
  ctx.fillStyle = "#f4b942";
  ctx.font = "700 28px Segoe UI, sans-serif";
  ctx.fillText("Глава", 88, 180);
  ctx.fillStyle = "#f6efe4";
  ctx.font = "800 52px Segoe UI, sans-serif";
  ctx.fillText(CHAPTERS[chapterIndex(state.level)], 88, 250);
  ctx.fillStyle = "#c4b29a";
  ctx.font = "600 32px Segoe UI, sans-serif";
  ctx.fillText("Уровень " + state.level, 88, 340);
  ctx.fillStyle = "#ff8a4a";
  ctx.font = "800 64px Segoe UI, sans-serif";
  ctx.fillText("Серия " + progress.streak, 88, 460);
  ctx.fillStyle = "#f4b942";
  ctx.font = "700 36px Segoe UI, sans-serif";
  ctx.fillText("★ " + totalStars(), 88, 560);
  const place = (huntTarget(leagueTable()).me || {}).place;
  ctx.fillStyle = "#f4b942";
  ctx.font = "800 40px Segoe UI, sans-serif";
  ctx.fillText("Лига #" + place, 88, 640);
  ctx.fillStyle = "#c4b29a";
  ctx.font = "600 24px Segoe UI, sans-serif";
  ctx.fillText("Сам собрал. Без подсказки на скрине.", 88, 740);
  return canvas;
}

async function shareProgress() {
  const line = shareLine();
  const canvas = drawShareCard();
  try {
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    const file = new File([blob], "bani.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: line, text: line });
      return;
    }
    if (navigator.share) {
      await navigator.share({ title: line, text: line });
      return;
    }
  } catch (e) {
    if (e && e.name === "AbortError") return;
  }
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "bani.png";
  link.click();
}

function countUp(el, from, to, ms) {
  if (!el) return Promise.resolve();
  if (document.body.classList.contains("quiet") || from === to) {
    el.textContent = String(to);
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(from + (to - from) * eased));
      if (t < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
}

function burstWinConfetti() {
  burstConfetti("win-fx");
}

function burstConfetti(hostId) {
  const host = document.getElementById(hostId);
  if (!host || document.body.classList.contains("quiet")) return;
  host.innerHTML = "";
  const colors = ["#e85d4c", "#f4b942", "#3ecf8e", "#5b8def", "#c084fc", "#fff6c4"];
  for (let i = 0; i < 52; i += 1) {
    const bit = document.createElement("i");
    bit.className = "confetti-bit";
    bit.style.setProperty("--dx", (Math.random() * 160 - 80).toFixed(1) + "px");
    bit.style.setProperty("--dy", (Math.random() * -220 - 40).toFixed(1) + "px");
    bit.style.setProperty("--spin", (Math.random() * 720 - 360).toFixed(0) + "deg");
    bit.style.background = colors[i % colors.length];
    bit.style.left = 50 + (Math.random() * 24 - 12) + "%";
    bit.style.animationDelay = (Math.random() * 0.12).toFixed(2) + "s";
    host.appendChild(bit);
  }
  window.setTimeout(() => {
    host.innerHTML = "";
  }, 1400);
}

function hintWord(n) {
  const m = n % 100;
  if (m >= 11 && m <= 14) return "подсказок";
  const d = n % 10;
  if (d === 1) return "подсказка";
  if (d >= 2 && d <= 4) return "подсказки";
  return "подсказок";
}

function prizeHero(prizes) {
  const order = ["hints", "coins", "boost", "skin", "stage", "undos"];
  for (let i = 0; i < order.length; i += 1) {
    const hit = prizes.find((item) => item.kind === order[i]);
    if (hit) return hit;
  }
  return prizes[0];
}

function prizeFace(item) {
  if (!item) return { num: "Приз", word: "сундук", glyph: "✨", bits: 6 };
  if (item.kind === "hints") {
    return { num: "+" + item.n, word: hintWord(item.n), glyph: "💡", bits: item.n };
  }
  if (item.kind === "coins") {
    return { num: "+" + item.n, word: "монет", glyph: "coin", bits: 7 };
  }
  if (item.kind === "boost") {
    return { num: "×" + item.mult, word: "на " + item.hours + " ч", glyph: "🔥", bits: 5 };
  }
  if (item.kind === "skin") {
    const name = (item.text || "").replace(/^Скин «?/, "").replace(/»?.*$/, "");
    return { num: "Скин", word: name || "банок", glyph: "✨", bits: 6 };
  }
  if (item.kind === "stage") {
    return { num: "+100", word: "уровней", glyph: "★", bits: 6 };
  }
  if (item.kind === "undos") {
    return { num: "+" + item.n, word: item.n === 1 ? "отмена" : "отмен", glyph: "↩", bits: item.n || 1 };
  }
  return { num: "Приз", word: item.text || "сундук", glyph: "✨", bits: 6 };
}

function fillChestBits(face) {
  const host = document.getElementById("chest-bulbs");
  if (!host) return;
  host.innerHTML = "";
  const n = Math.max(1, face.bits || 6);
  for (let i = 0; i < n; i += 1) {
    if (face.glyph === "coin") {
      const pic = document.createElement("img");
      pic.className = "chest-bulb chest-bit-coin";
      pic.src = "coin.svg?v=49";
      pic.alt = "";
      host.appendChild(pic);
    } else {
      const bit = document.createElement("span");
      bit.className = "chest-bulb";
      bit.textContent = face.glyph;
      host.appendChild(bit);
    }
  }
}

function chestHudDest(kind) {
  if (kind === "hints" || kind === "undos") {
    return document.getElementById("chip-hints") || document.getElementById("hud-hints");
  }
  if (kind === "coins") {
    return document.querySelector(".chip.coin-chip") || document.getElementById("hud-coins");
  }
  if (kind === "boost") return document.getElementById("chip-fire");
  return document.getElementById("chip-bomb") || document.getElementById("hud-stars");
}

function openChapterChest(prizes) {
  state.chestPrizes = prizes.slice();
  const hintN = prizes
    .filter((item) => item.kind === "hints")
    .reduce((sum, item) => sum + (item.n || 0), 0);
  if (hintN) state.holdHudHints = Math.max(0, progress.hints - hintN);
  paintHud();
  chestLoot.innerHTML = "";
  const hero = prizeHero(prizes);
  const face = prizeFace(hero);
  const prizeEl = document.getElementById("chest-prize");
  const prizeNum = document.getElementById("chest-prize-num");
  const prizeWord = document.getElementById("chest-prize-word");
  if (prizeEl) prizeEl.hidden = false;
  if (prizeNum) prizeNum.textContent = face.num;
  if (prizeWord) prizeWord.textContent = face.word;
  fillChestBits(face);
  prizes.forEach((item, i) => {
    if (hero && item === hero) return;
    const row = document.createElement("b");
    row.textContent = item.text;
    row.style.animationDelay = i * 90 + "ms";
    chestLoot.appendChild(row);
  });
  const chestLead = document.getElementById("chest-lead");
  if (chestLead) chestLead.textContent = "Приз за " + stageClears() + " уровней.";
  const claimBtn = document.getElementById("chest-ok");
  if (claimBtn) {
    claimBtn.disabled = false;
    claimBtn.textContent = "Забрать";
  }
  state.chestBusy = false;
  document.body.classList.add("chest-open");
  chestOverlay.classList.add("show");
  burstConfetti("chest-fx");
  feel("win");
  tone(392, 0.1, "sine", 0.04);
  tone(523, 0.14, "sine", 0.045);
  tone(784, 0.22, "triangle", 0.04);
}

function closeChapterChest(keepHold) {
  if (chestOverlay) chestOverlay.classList.remove("show");
  document.body.classList.remove("chest-open");
  const fxHost = document.getElementById("chest-fx");
  if (fxHost) fxHost.innerHTML = "";
  state.chestPrizes = [];
  if (!keepHold) {
    state.holdHudHints = null;
    paintHud();
  }
}

function flyChestBitsToHud(kind, count, onLand) {
  const dest = chestHudDest(kind);
  const bits = document.querySelectorAll("#chest-bulbs .chest-bulb");
  const fallback = document.getElementById("chest-prize") || document.getElementById("chest-box");
  const n = Math.max(1, count || bits.length || 6);
  if (!dest) return Promise.resolve();
  if (document.body.classList.contains("quiet")) return Promise.resolve();
  const to = dest.getBoundingClientRect();
  return Promise.all(
    Array.from({ length: n }, (_, i) => {
      const src = bits[i] || bits[bits.length - 1] || fallback;
      const from = src ? src.getBoundingClientRect() : to;
      const coin = kind === "coins";
      const ghost = document.createElement(coin ? "img" : "span");
      ghost.className = coin ? "fly-coin" : "fly-hint";
      if (coin) {
        ghost.src = "coin.svg?v=49";
        ghost.alt = "";
      } else if (kind === "hints") ghost.textContent = "💡";
      else if (kind === "boost") ghost.textContent = "🔥";
      else if (kind === "undos") ghost.textContent = "↩";
      else if (kind === "stage") ghost.textContent = "★";
      else ghost.textContent = "✨";
      ghost.style.left = from.left + from.width / 2 - 14 + "px";
      ghost.style.top = from.top + "px";
      document.body.appendChild(ghost);
      window.setTimeout(() => {
        if (bits[i]) bits[i].style.opacity = "0";
        ghost.style.left = to.left + to.width / 2 - 12 + "px";
        ghost.style.top = to.top + to.height / 2 - 12 + "px";
        ghost.style.transform = "scale(0.35) rotate(-20deg)";
        ghost.style.opacity = "0.2";
      }, 20 + i * 70);
      return new Promise((resolve) => {
        window.setTimeout(() => {
          ghost.remove();
          if (onLand) onLand(i);
          dest.classList.add("catch");
          window.setTimeout(() => dest.classList.remove("catch"), 280);
          tone(640 + i * 40, 0.08, "sine", 0.03);
          resolve();
        }, 560 + i * 70);
      });
    })
  );
}

async function claimChapterChest() {
  if (state.chestBusy || !chestOverlay || !chestOverlay.classList.contains("show")) return;
  state.chestBusy = true;
  const claimBtn = document.getElementById("chest-ok");
  if (claimBtn) claimBtn.disabled = true;
  const prizes = state.chestPrizes || [];
  const hintN =
    state.holdHudHints != null ? Math.max(0, progress.hints - state.holdHudHints) : 0;
  const coinN = prizes
    .filter((item) => item.kind === "coins")
    .reduce((sum, item) => sum + (item.n || 0), 0);
  const hero = prizeHero(prizes);
  if (hintN) {
    let shown = state.holdHudHints;
    await flyChestBitsToHud("hints", hintN, () => {
      shown += 1;
      const hud = document.getElementById("hud-hints");
      if (hud) hud.textContent = String(shown);
    });
  } else if (coinN) {
    const start = state.holdHudCoins != null ? state.holdHudCoins : progress.coins - coinN;
    let shown = start;
    await flyChestBitsToHud("coins", 7, () => {
      shown = Math.min(start + coinN, shown + Math.ceil(coinN / 7));
      if (state.holdHudCoins != null) state.holdHudCoins = shown;
      const hud = document.getElementById("hud-coins");
      if (hud) hud.textContent = String(shown);
    });
    if (state.holdHudCoins != null) state.holdHudCoins = start + coinN;
  } else if (hero) {
    await flyChestBitsToHud(hero.kind, prizeFace(hero).bits);
  }
  const nextHundred = prizes.some((item) => item.kind === "stage");
  state.holdHudHints = null;
  paintHud();
  closeChapterChest(true);
  if (nextHundred) beginNextHundred();
  state.chestBusy = false;
  if (claimBtn) {
    claimBtn.disabled = false;
    claimBtn.textContent = "Забрать";
  }
}

function settleWinExtra() {
  state.winExtraDone = true;
}

async function playFireBoost() {
  const src = document.getElementById("chip-fire");
  const cash = document.getElementById("win-cash");
  if (!src || !cash) return;
  document.querySelectorAll(".win-fire-pop").forEach((el) => el.remove());
  const from = src.getBoundingClientRect();
  const pop = document.createElement("div");
  pop.className = "win-fire-pop";
  pop.innerHTML = "<span>🔥</span><em>×" + payoutMult().toFixed(1) + "</em>";
  pop.style.left = from.left + "px";
  pop.style.top = from.top + "px";
  pop.style.transform = "scale(0.45)";
  pop.style.opacity = "1";
  document.body.appendChild(pop);
  await wait(40);
  pop.style.left = window.innerWidth / 2 - 70 + "px";
  pop.style.top = window.innerHeight * 0.36 + "px";
  pop.style.transform = "scale(1.85)";
  await wait(720);
  const to = cash.getBoundingClientRect();
  pop.style.left = to.left + to.width / 2 - 36 + "px";
  pop.style.top = to.top - 8 + "px";
  pop.style.transform = "scale(0.2)";
  pop.style.opacity = "0";
  await wait(400);
  pop.remove();
}

function flyWinCoinsToHud() {
  const src = document.getElementById("win-cash");
  const dest = document.querySelector(".chip.coin-chip") || document.getElementById("hud-coins");
  if (!src || !dest) return Promise.resolve();
  if (document.body.classList.contains("quiet")) return Promise.resolve();
  const from = src.getBoundingClientRect();
  const to = dest.getBoundingClientRect();
  const n = 7;
  const pic = dest.querySelector("img");
  for (let i = 0; i < n; i += 1) {
    const ghost = document.createElement("img");
    ghost.className = "fly-coin";
    ghost.src = pic ? pic.src : "coin.svg?v=49";
    ghost.alt = "";
    ghost.style.left = from.left + from.width / 2 - 12 + (i - 3) * 6 + "px";
    ghost.style.top = from.top + "px";
    document.body.appendChild(ghost);
    window.setTimeout(() => {
      ghost.style.left = to.left + to.width / 2 - 10 + "px";
      ghost.style.top = to.top + to.height / 2 - 10 + "px";
      ghost.style.transform = "scale(0.4)";
      ghost.style.opacity = "0.2";
    }, 20 + i * 55);
    window.setTimeout(() => ghost.remove(), 620 + i * 55);
  }
  return wait(700);
}

async function showWin() {
  Array.prototype.forEach.call(board.children, (el, i) => {
    window.setTimeout(() => el.classList.add("won"), i * 50);
  });
  const stars = starCount();
  const beforeHud = cash();
  const reward = applyWinRewards(stars);
  const after = huntTarget(leagueTable());
  if (after.me) progress.lastPlace = after.me.place;
  saveProgress();
  state.lastStars = stars;
  state.holdHudCoins = beforeHud;
  state.winBase = reward.tower ? reward.coins : reward.raw || reward.coins;
  state.winMult = reward.tower ? 1 : payoutMult();
  state.winTotal = reward.coins;
  state.winExtraDone = true;
  state.lastCoins = reward.coins;
  state.doubled = false;
  document.body.classList.add("celebrate");
  window.setTimeout(() => document.body.classList.remove("celebrate"), 900);
  feel("win");
  tone(392, 0.1, "sine", 0.04);
  tone(523, 0.14, "sine", 0.045);
  tone(659, 0.2, "triangle", 0.035);
  winDouble.disabled = true;
  nextBtn.disabled = true;
  winDouble.textContent = "Ролик — удвоить";
  paintHud();
  const last = state.level >= storyLevelCount();
  winTitle.textContent = reward.tower
    ? "Башня"
    : last
      ? "Корона твоя"
      : "Есть!";
  if (reward.tower) {
    const { me, next } = huntTarget(towerTable());
    winText.textContent = next
      ? "Плюс 1 балл. Ты #" +
        (me ? me.place : "—") +
        ". До " +
        next.name +
        " ещё " +
        (next.score - me.score) +
        "."
      : "Плюс 1 балл. Ты первый на неделе. Сундук твой, если удержишь.";
  } else {
    winText.textContent = last
      ? "Этап закрыт."
      : stageClears() + " / 100 до сундука.";
    if (reward.bombsMade) winText.textContent += " Бомба готова!";
  }
  const cashNum = document.getElementById("win-cash-num");
  if (cashNum) cashNum.textContent = "0";
  if (winReward) winReward.hidden = true;
  Array.prototype.forEach.call(winStars.children, (el) => el.classList.remove("on"));
  overlay.classList.add("show");
  burstWinConfetti();
  for (let i = 0; i < stars; i += 1) {
    await wait(140);
    winStars.children[i].classList.add("on");
  }
  await wait(280);
  await countUp(cashNum, 0, state.winBase, 720);
  if (!reward.tower && state.winMult > 1 && !document.body.classList.contains("quiet")) {
    await playFireBoost();
    settleWinExtra();
    await countUp(cashNum, state.winBase, state.winTotal, 640);
  } else if (!reward.tower) {
    settleWinExtra();
    if (cashNum) cashNum.textContent = String(state.winTotal);
  }
  state.lastCoins = state.winTotal;
  winDouble.disabled = false;
  nextBtn.disabled = false;
  nextBtn.textContent = reward.tower
    ? progress.towerDone.every(Boolean)
      ? "В историю"
      : "Ещё бой"
    : last
      ? "С первого"
      : reward.chapterDone
        ? "Новая глава"
        : "Следующий";
  if (reward.prizes && reward.prizes.length) openChapterChest(reward.prizes);
}

async function doubleReward() {
  if (state.doubled || !state.lastCoins || state.busy) return;
  state.busy = true;
  winDouble.disabled = true;
  winDouble.textContent = "Ролик…";
  await wait(1100);
  const from = state.lastCoins;
  progress.coins += from;
  state.lastCoins = from * 2;
  state.winTotal = state.lastCoins;
  state.doubled = true;
  saveProgress();
  const cashNum = document.getElementById("win-cash-num");
  await countUp(cashNum, from, state.lastCoins, 700);
  winDouble.textContent = "Удвоено";
  state.busy = false;
}

function showFail() {
  const almost = almostCount(state.tubes);
  state.lock = "fail";
  failTitle.textContent = almost ? "Почти" : "Тупик";
  failText.textContent = almost
    ? "Ещё одна банка — и цвет закрылся бы. Ты сам долил до края."
    : "Хода нет. Сам собрал ловушку — это и есть «ещё чуть-чуть».";
  failRisk.textContent =
    "Огонёк не сгорает здесь. Он растёт, если заходишь каждый день.";
  failUndo.hidden = state.history.length === 0;
  failKeep.hidden = true;
  failJar.hidden = !state.locked;
  paintHud();
  board.classList.add("stuck");
  document.body.classList.add("dim");
  failOverlay.classList.add("show");
  undoBtn.disabled = true;
  feel("fail");
  tone(140, 0.22, "sawtooth", 0.03);
}

function payUndo() {
  if (progress.undos > 0) {
    progress.undos -= 1;
    saveProgress();
    return true;
  }
  if (!spend(undoPrice())) return false;
  saveProgress();
  return true;
}

function doUndo() {
  if (state.busy || !state.history.length) return false;
  if (!payUndo()) {
    shake(undoBtn);
    shake(failUndo);
    return false;
  }
  const prev = state.history.pop();
  state.tubes = prev;
  state.selected = -1;
  if (state.moves > 0) state.moves -= 1;
  hideFail();
  overlay.classList.remove("show");
  paintHud();
  render(false);
  paintScene();
  return true;
}

function addExtraJar() {
  if (!state.locked) return;
  openLockShop();
}

async function watchAd() {
  if (lockAd) {
    lockAd.disabled = true;
    lockAd.textContent = "Ролик…";
  }
  await wait(1100);
  if (lockAd) {
    lockAd.disabled = false;
    lockAd.textContent = "Ролик — открыть";
  }
}

async function unlockJar(pay) {
  if (state.busy || !state.locked) return;
  const price = nextLockPrice();
  if (pay === "charge") {
    if (!progress.bottleCharges) {
      shake(lockCharge);
      return;
    }
    progress.bottleCharges -= 1;
    saveProgress();
  } else if (pay === "coins") {
    if (!spend(price)) {
      shake(lockCoins);
      shake(failJar);
      return;
    }
    saveProgress();
  } else {
    state.busy = true;
    await watchAd();
    state.busy = false;
  }
  state.locked -= 1;
  if (state.stolenEmpties) state.stolenEmpties -= 1;
  state.openedExtra += 1;
  state.tubes.push([]);
  hideFail();
  closeLockShop();
  paintHud();
  render(false);
  paintScene();
  const extra = board.children[state.tubes.length - 1];
  if (extra) {
    extra.classList.remove("settled");
    extra.classList.add("arrive", "unlocked");
  }
  pulseScene("#f4b942");
  feel("full");
  tone(480, 0.1, "triangle", 0.045);
  tone(640, 0.14, "sine", 0.03);
}

function replayCurrent() {
  if (state.mode === "tower") {
    startLevel(state.level, { tower: true, floor: state.towerFloor });
    return;
  }
  startLevel(state.level);
}

function giveUp() {
  replayCurrent();
}

function flyWinStarsToHud() {
  const dest = document.getElementById("chip-bomb") || document.getElementById("hud-stars");
  if (!dest || !winStars) return Promise.resolve();
  const earned = Array.prototype.filter.call(winStars.children, (el) => el.classList.contains("on"));
  if (!earned.length) return Promise.resolve();
  if (document.body.classList.contains("quiet")) return Promise.resolve();
  const to = dest.getBoundingClientRect();
  return Promise.all(
    earned.map((el, i) => {
      const from = el.getBoundingClientRect();
      const ghost = document.createElement("span");
      ghost.className = "fly-star";
      ghost.textContent = "★";
      ghost.style.left = from.left + "px";
      ghost.style.top = from.top + "px";
      document.body.appendChild(ghost);
      window.setTimeout(() => {
        ghost.style.left = to.left + to.width / 2 - 10 + "px";
        ghost.style.top = to.top + to.height / 2 - 14 + "px";
        ghost.style.transform = "scale(0.35)";
        ghost.style.opacity = "0.15";
      }, 20 + i * 70);
      return new Promise((resolve) => {
        window.setTimeout(() => {
          ghost.remove();
          dest.parentElement && dest.parentElement.classList.add("catch");
          window.setTimeout(() => dest.parentElement && dest.parentElement.classList.remove("catch"), 280);
          resolve();
        }, 580 + i * 70);
      });
    })
  );
}

function keepStreakRestart() {
  if (!spend(keepPrice())) {
    shake(failKeep);
    return;
  }
  saveProgress();
  paintHud();
  replayCurrent();
}

function keyOf(tubes) {
  return tubes.map((tube) => tube.join("")).join("/");
}

function hintMove(tubes) {
  if (isSolved(tubes)) return null;
  const start = clone(tubes);
  const queue = [start];
  const seen = new Map([[keyOf(start), null]]);
  for (let i = 0; i < queue.length && i < 80000; i += 1) {
    const cur = queue[i];
    for (let a = 0; a < cur.length; a += 1) {
      for (let b = 0; b < cur.length; b += 1) {
        if (a === b || !canPour(cur[a], cur[b])) continue;
        const next = clone(cur);
        pour(next[a], next[b]);
        const k = keyOf(next);
        if (seen.has(k)) continue;
        seen.set(k, { prev: keyOf(cur), a: a, b: b });
        if (isSolved(next)) {
          let step = seen.get(k);
          while (step && seen.get(step.prev)) step = seen.get(step.prev);
          return step;
        }
        queue.push(next);
      }
    }
  }
  return firstMove(tubes);
}

function useHint() {
  if (state.busy || state.lock) return;
  if (!hasLegalMove(state.tubes)) {
    showFail();
    return;
  }
  if (!progress.hints) {
    if (!spend(hintPrice())) {
      shake(0);
      return;
    }
    progress.hints += 1;
  }
  const move = hintMove(state.tubes);
  if (!move) return;
  progress.hints -= 1;
  saveProgress();
  paintHud();
  const fromEl = jarEl(move.a);
  const toEl = jarEl(move.b);
  if (fromEl) fromEl.classList.add("hint-from");
  if (toEl) toEl.classList.add("hint-to");
  window.setTimeout(() => {
    if (fromEl) fromEl.classList.remove("hint-from");
    if (toEl) toEl.classList.remove("hint-to");
  }, 1600);
}

function breakStreak() {
  if (!progress.streak) return;
  progress.streak = 0;
  saveProgress();
  fireChip.classList.remove("burned");
  void fireChip.offsetWidth;
  fireChip.classList.add("burned");
  paintHud();
}

function cycleSkin() {
  openSkins();
}

async function onTap(index) {
  if (state.busy || state.lock) return;
  clearHook();
  if (state.selected < 0) {
    if (!state.tubes[index].length) {
      shake(index);
      return;
    }
    selectJar(index);
    return;
  }
  if (state.selected === index) {
    selectJar(-1);
    return;
  }
  const fromIdx = state.selected;
  const from = state.tubes[fromIdx];
  const to = state.tubes[index];
  if (!canPour(from, to)) {
    shake(index);
    selectJar(state.tubes[index].length ? index : -1);
    return;
  }
  const color = topColor(from);
  const count = pourAmount(from, to);
  const willFill = to.length + count === jarCap() && (to.length === 0 || to.every((c) => c === color));
  state.history.push(clone(state.tubes));
  state.busy = true;
  undoBtn.disabled = true;
  state.selected = -1;
  jarEl(fromIdx).classList.remove("selected");
  pulseScene(COLORS[color]);
  feel("pour");
  tone(220 + color * 40, 0.08, "sine", 0.035);
  await animatePour(fromIdx, index, color, count);
  pour(from, to);
  state.moves += 1;
  state.busy = false;
  undoBtn.disabled = state.history.length === 0;
  markJars();
  paintScene();
  if (willFill && isFullJar(state.tubes[index])) celebrateJar(index, color);
  if (isSolved(state.tubes)) {
    showWin();
    return;
  }
  if (!hasLegalMove(state.tubes)) {
    await wait(180);
    showFail();
  }
}

document.getElementById("restart").addEventListener("click", () => {
  if (state.busy) return;
  giveUp();
});
board.addEventListener("click", (event) => {
  const btn = event.target.closest(".jar");
  if (!btn || !board.contains(btn)) return;
  if (btn.classList.contains("locked")) {
    openLockShop();
    return;
  }
  const index = Number(btn.dataset.i);
  if (index === index) onTap(index);
});
hintBtn.addEventListener("click", useHint);
document.getElementById("skin").addEventListener("click", cycleSkin);
document.getElementById("chest-ok").addEventListener("click", () => {
  claimChapterChest();
});
undoBtn.addEventListener("click", () => {
  if (state.lock) return;
  doUndo();
});
failUndo.addEventListener("click", () => doUndo());
failJar.addEventListener("click", () => addExtraJar());
lockCoins.addEventListener("click", () => unlockJar("coins"));
if (lockCharge) lockCharge.addEventListener("click", () => unlockJar("charge"));
lockAd.addEventListener("click", () => unlockJar("ad"));
document.getElementById("lock-close").addEventListener("click", () => closeLockShop());
failKeep.addEventListener("click", () => keepStreakRestart());
failGive.addEventListener("click", () => giveUp());
winDouble.addEventListener("click", () => doubleReward());
winShare.addEventListener("click", () => shareProgress());
document.getElementById("chip-league").addEventListener("click", () => tryEnterTower());
const chipShop = document.getElementById("chip-shop") || document.getElementById("fly-shop");
if (chipShop) chipShop.addEventListener("click", () => openShop());
document.getElementById("league-close").addEventListener("click", () => {
  closeLeague();
  backToMenuIfIdle();
});
document.getElementById("league-tower").addEventListener("click", () => tryEnterTower());
document.getElementById("league-shop").addEventListener("click", () => openShop());
leagueRace.addEventListener("click", () => {
  closeLeague();
  startLevel(raceLevel());
});
document.getElementById("tower-play").addEventListener("click", () => playTowerFloor());
if (towerOverlay) {
  towerOverlay.addEventListener("click", (event) => {
    const btn = event.target.closest(".hit");
    if (!btn || !towerOverlay.contains(btn)) return;
    const who = btn.getAttribute("data-name");
    if (btn.getAttribute("data-hit") === "bomb") bombHunt(who, btn);
    else sealHunt(who, btn);
  });
}
const introNext = document.getElementById("intro-next");
if (introNext) introNext.addEventListener("click", () => stepIntro());
const towerBack = document.getElementById("tower-back");
if (towerBack) {
  towerBack.addEventListener("click", () => {
    closeTower();
    backToMenuIfIdle();
  });
}
const towerTipNext = document.getElementById("tower-tip-next");
if (towerTipNext) towerTipNext.addEventListener("click", () => stepTowerTip());
window.addEventListener("resize", onTowerTipMove);
if (towerList) towerList.addEventListener("scroll", onTowerTipMove);
if (towerSq) towerSq.addEventListener("click", () => tryEnterTower());
if (mapGrid) {
  mapGrid.addEventListener("click", (event) => {
    const btn = event.target.closest(".map-cell");
    if (!btn || btn.classList.contains("lock")) {
      if (btn && btn.classList.contains("lock")) {
        shake(btn);
        showPassToast("Сначала пройди уровень " + progress.unlocked);
      }
      return;
    }
    pickLevel(Number(btn.dataset.level));
  });
}
const mapContinue = document.getElementById("map-continue");
if (mapContinue) mapContinue.addEventListener("click", () => continueLevel());
document.getElementById("shop-flask").addEventListener("click", () => buyFlask());
const shopSkins = document.getElementById("shop-skins");
if (shopSkins) shopSkins.addEventListener("click", () => openSkins());
document.getElementById("shop-seal").addEventListener("click", () => sealHunt());
document.getElementById("shop-undo").addEventListener("click", () => buyUndoPack());
document.getElementById("shop-ad").addEventListener("click", () => buyAdCoins());
const shopPacks = document.getElementById("shop-packs");
if (shopPacks) shopPacks.addEventListener("click", () => openPackStore());
const packAd = document.getElementById("pack-ad");
if (packAd) packAd.addEventListener("click", () => openPackStore());
const packGrid = document.getElementById("pack-grid");
if (packGrid) {
  packGrid.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-pack]");
    if (btn) buyCoinPack(btn.getAttribute("data-pack"));
  });
}
const packClose = document.getElementById("pack-close");
if (packClose) {
  packClose.addEventListener("click", () => {
    closePackStore();
    if (towerOverlay && towerOverlay.classList.contains("show")) return;
    backToMenuIfIdle();
  });
}
document.getElementById("shop-close").addEventListener("click", () => {
  closeShop();
  backToMenuIfIdle();
});
nextBtn.addEventListener("click", async () => {
  if (overlay.classList.contains("show")) {
    nextBtn.disabled = true;
    settleWinExtra();
    document.querySelectorAll(".win-fire-pop").forEach((el) => el.remove());
    await flyWinStarsToHud();
    await flyWinCoinsToHud();
    overlay.classList.remove("show");
    state.holdHudCoins = null;
    paintHud();
    nextBtn.disabled = false;
  }
  if (state.mode === "tower") {
    playTowerFloor();
    return;
  }
  syncUnlocked();
  if (state.level >= storyLevelCount()) {
    openMap();
    return;
  }
  startLevel(Math.min(progress.unlocked, state.level + 1));
});

seedMotes();
syncWeek();
applySettings();
armPackAd();

const skipBoot = /[?&](stuck|locks|win)=/.test(location.search);
const boot = document.getElementById("boot");
const bootPlay = document.getElementById("boot-play");

function launchGame(where) {
  closeSettings();
  closeMenu();
  if (where === "tower") {
    tryEnterTower();
    return;
  }
  if (where === "league") {
    tryEnterTower();
    return;
  }
  if (where === "shop") {
    openPackStore();
    return;
  }
  openMap();
}

function backToMenuIfIdle() {
  if (!state.tubes.length) openMenu();
}

if (bootPlay) bootPlay.addEventListener("click", () => launchGame("play"));
const bootLeague = document.getElementById("boot-league");
if (bootLeague) bootLeague.addEventListener("click", () => launchGame("league"));
const bootTower = document.getElementById("boot-tower");
if (bootTower) bootTower.addEventListener("click", () => launchGame("tower"));
const bootShop = document.getElementById("boot-shop");
if (bootShop) bootShop.addEventListener("click", () => launchGame("shop"));
const bootSkins = document.getElementById("boot-skins");
if (bootSkins) bootSkins.addEventListener("click", () => openSkins());
const bootSettings = document.getElementById("boot-settings");
if (bootSettings) bootSettings.addEventListener("click", () => openSettings());
const chipMenu = document.getElementById("chip-menu");
if (chipMenu) chipMenu.addEventListener("click", () => openMenu());
const btnSettings = document.getElementById("btn-settings");
if (btnSettings) btnSettings.addEventListener("click", () => openSettings());
const burger = document.getElementById("btn-burger");
const fly = document.getElementById("menu-fly");
function closeFly() {
  if (!fly) return;
  fly.hidden = true;
  if (burger) {
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  }
}
function toggleFly(event) {
  if (event) event.stopPropagation();
  if (!fly) return;
  const open = fly.hidden;
  fly.hidden = !open;
  if (burger) {
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  }
}
if (burger) burger.addEventListener("click", toggleFly);
if (fly) {
  const flyMenu = document.getElementById("fly-menu");
  const flySettings = document.getElementById("fly-settings");
  const flySkins = document.getElementById("fly-skins");
  if (flyMenu) {
    flyMenu.addEventListener("click", () => {
      closeFly();
      openMenu();
    });
  }
  if (flySettings) {
    flySettings.addEventListener("click", () => {
      closeFly();
      openSettings();
    });
  }
  if (flySkins) {
    flySkins.addEventListener("click", () => {
      closeFly();
      openSkins();
    });
  }
  const flyShop = document.getElementById("fly-shop");
  if (flyShop) {
    flyShop.addEventListener("click", () => closeFly());
  }
}
document.addEventListener("click", (event) => {
  if (!fly || fly.hidden) return;
  if (fly.contains(event.target) || (burger && burger.contains(event.target))) return;
  closeFly();
});
document.getElementById("set-sound").addEventListener("click", () => toggleSetting("sound"));
document.getElementById("set-vibe").addEventListener("click", () => toggleSetting("vibe"));
document.getElementById("set-juice").addEventListener("click", () => toggleSetting("juice"));
document.getElementById("set-hint").addEventListener("click", () => toggleSetting("hint"));
document.getElementById("set-skin").addEventListener("click", () => openSkins());
const skinGrid = document.getElementById("skin-grid");
if (skinGrid) {
  skinGrid.addEventListener("click", (event) => {
    const card = event.target.closest(".skin-card");
    if (!card) return;
    buySkin(card.dataset.id);
  });
}
const skinsClose = document.getElementById("skins-close");
if (skinsClose) {
  skinsClose.addEventListener("click", () => {
    closeSkins();
    backToMenuIfIdle();
  });
}
document.getElementById("set-play").addEventListener("click", () => launchGame("play"));
document.getElementById("set-close").addEventListener("click", () => {
  closeSettings();
  if (!state.tubes.length) openMenu();
});
const setReset = document.getElementById("set-reset");
const setResetVal = document.getElementById("set-reset-val");
let resetArmed = false;
if (setReset) {
  setReset.addEventListener("click", () => {
    if (!resetArmed) {
      resetArmed = true;
      if (setResetVal) setResetVal.textContent = "Точно?";
      window.setTimeout(() => {
        resetArmed = false;
        if (setResetVal) setResetVal.textContent = "Стереть";
      }, 3500);
      return;
    }
    resetArmed = false;
    if (setResetVal) setResetVal.textContent = "Стереть";
    resetProgress();
  });
}
const passBuy = document.getElementById("pass-buy");
if (passBuy) passBuy.addEventListener("click", () => buyTowerPass());
const passBack = document.getElementById("pass-back");
if (passBack) passBack.addEventListener("click", () => {
  closePassGate();
  openMenu();
});
const passShop = document.getElementById("pass-shop");
if (passShop) {
  passShop.addEventListener("click", () => {
    closePassGate();
    openShop();
  });
}
paintMenu();
paintShop();
syncScreens();
if (!progress.seenIntro && !skipBoot) openIntro();
window.setInterval(paintWeekClocks, 30000);

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("./sw.js").catch(function () {});
}

if (skipBoot) {
  if (boot) boot.classList.remove("show");
  syncScreens();
  startLevel(progress.unlocked);
} else if (!boot) {
  startLevel(progress.unlocked);
}

if (/[?&]locks=1/.test(location.search)) {
  progress.unlocked = Math.max(progress.unlocked, 6);
  startLevel(6);
}

if (/[?&]stuck=1/.test(location.search)) {
  progress.streak = Math.max(progress.streak, 4);
  progress.coins = Math.max(progress.coins, 80);
  progress.undos = Math.max(progress.undos, 1);
  state.history = [clone(state.tubes)];
  state.tubes = [
    [0, 0, 0, 1],
    [1, 1, 1, 0],
    [2, 2, 2, 2],
    [3, 3, 3, 3],
  ];
  state.moves = 4;
  paintHud();
  render(false);
  showFail();
}

if (/[?&]win=1/.test(location.search)) {
  state.lastCoins = 24;
  state.doubled = false;
  progress.streak = Math.max(progress.streak, 3);
  winTitle.textContent = "Есть!";
  winText.textContent = "Ещё 9 до сундука «Первые банки».";
  fillCoinLabel(winReward, "+", 24, "   серия " + progress.streak);
  winDouble.disabled = false;
  winDouble.textContent = "Ролик — удвоить";
  overlay.classList.add("show");
  paintHud();
}
