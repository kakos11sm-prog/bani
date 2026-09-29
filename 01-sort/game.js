const COLORS = ["#e85d4c", "#f4b942", "#3ecf8e", "#5b8def", "#c084fc", "#f27a64"];
const CAP = 4;
const SAVE_KEY = "bani-progress-v5";
const SETTINGS_KEY = "bani-settings-v1";
const TOWER_FLOORS = 5;
const TOWER_ENTER = 22;
const FLASK_PRICE = 90;
const SEAL_PRICE = 80;
const UNDO_PACK = 35;
const AD_COINS = 40;
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
  locked: 0,
  openedExtra: 0,
  mode: "story",
  towerFloor: 0,
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
    dot.style.background = "#f4b942";
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

function emptyProgress() {
  return {
    unlocked: 1,
    stars: Array(LEVELS.length).fill(0),
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
    bestMoves: Array(typeof LEVELS !== "undefined" ? LEVELS.length : 100).fill(0),
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
  const cover = ["boot", "map-overlay", "tower-overlay", "settings-overlay", "shop-overlay", "skins-overlay", "league-overlay"].some((id) => {
    const el = document.getElementById(id);
    return el && el.classList.contains("show");
  });
  document.body.classList.toggle("screen", cover);
}

function paintMenu() {
  const playMeta = document.getElementById("home-play-meta");
  const towerMeta = document.getElementById("home-tower-meta");
  if (playMeta) {
    playMeta.textContent =
      "Ур. " +
      progress.unlocked +
      " · ★ " +
      totalStars() +
      " · ● " +
      progress.coins +
      (state.mode !== "tower" && state.tubes.length ? " · партия ждёт" : "");
  }
  if (towerMeta) {
    const me = huntTarget(towerTable()).me;
    towerMeta.textContent =
      "● " +
      (progress.towerCoins || 0) +
      " · очки " +
      (progress.towerScore || 0) +
      (me ? " · #" + me.place : "") +
      " · до понедельника";
  }
}

function openMenu() {
  closeLeague();
  closeShop();
  closeTower();
  closeMap();
  closeSettings();
  closeSkins();
  overlay.classList.remove("show");
  failOverlay.classList.remove("show");
  if (lockOverlay) lockOverlay.classList.remove("show");
  if (chestOverlay) chestOverlay.classList.remove("show");
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

function loadProgress() {
  try {
    const raw = JSON.parse(
      localStorage.getItem(SAVE_KEY) ||
        localStorage.getItem("bani-progress-v4") ||
        localStorage.getItem("bani-progress-v3") ||
        localStorage.getItem("bani-progress-v2") ||
        localStorage.getItem("bani-progress-v1") ||
        ""
    );
    const base = emptyProgress();
    if (!raw || typeof raw !== "object") return base;
    base.unlocked = Math.min(LEVELS.length, Math.max(1, Number(raw.unlocked) || 1));
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
    base.towerCoins = Math.max(0, Number(raw.towerCoins) || 0);
    base.bestMoves = Array(LEVELS.length).fill(0);
    if (Array.isArray(raw.bestMoves)) {
      raw.bestMoves.forEach((value, i) => {
        if (i < base.bestMoves.length) base.bestMoves[i] = Math.max(0, Number(value) || 0);
      });
    }
    return base;
  } catch (e) {
    return emptyProgress();
  }
}

function saveProgress() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
}

const progress = loadProgress();
const settings = loadSettings();

function cash() {
  return state.mode === "tower" ? progress.towerCoins || 0 : progress.coins;
}

function spend(n) {
  if (state.mode === "tower") {
    if ((progress.towerCoins || 0) < n) return false;
    progress.towerCoins -= n;
    return true;
  }
  if (progress.coins < n) return false;
  progress.coins -= n;
  return true;
}

function gain(n) {
  if (state.mode === "tower") progress.towerCoins = (progress.towerCoins || 0) + n;
  else progress.coins += n;
}

function clone(tubes) {
  return tubes.map((tube) => tube.slice());
}

function topColor(tube) {
  return tube.length ? tube[tube.length - 1] : null;
}

function canPour(from, to) {
  if (!from.length || to.length >= CAP) return false;
  const color = topColor(from);
  return !to.length || topColor(to) === color;
}

function pourAmount(from, to) {
  const color = topColor(from);
  let count = 0;
  for (let i = from.length - 1; i >= 0 && from[i] === color && to.length + count < CAP; i -= 1) {
    count += 1;
  }
  return count;
}

function pour(from, to) {
  const color = topColor(from);
  while (from.length && topColor(from) === color && to.length < CAP) {
    to.push(from.pop());
  }
}

function isSolved(tubes) {
  return tubes.every(
    (tube) =>
      tube.length === 0 || (tube.length === CAP && tube.every((color) => color === tube[0]))
  );
}

function isFullJar(tube) {
  return tube.length === CAP && tube.every((color) => color === tube[0]);
}

function isAlmostJar(tube) {
  return tube.length === CAP - 1 && tube.length > 0 && tube.every((color) => color === tube[0]);
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
  const par = LEVEL_PARS[state.level - 1] || 8;
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
  if (item.premium) return "●" + item.price;
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
    showPassToast("Нужно ●" + item.price);
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
      " / 12. Монет ●" +
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
      "</b><small>" +
      skinMark(item) +
      "</small>";
    grid.appendChild(card);
  });
}

function openSkins() {
  closeLeague();
  closeShop();
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

function syncWeek() {
  const id = weekId();
  if (progress.weekId === id) return;
  progress.weekId = id;
  progress.weekRace = { level: 0, stars: 0, moves: 99 };
  progress.lastPlace = 0;
  progress.seals = {};
  progress.towerDone = [false, false, false, false, false];
  progress.towerScore = 0;
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

function towerHardPool() {
  const pool = [];
  for (let i = 0; i < LEVELS.length; i += 1) {
    const n = i + 1;
    const par = LEVEL_PARS[i] || 0;
    if (n >= 28 && par >= 10) pool.push(n);
  }
  if (pool.length < 10) {
    for (let n = Math.max(1, LEVELS.length - 29); n <= LEVELS.length; n += 1) {
      if (pool.indexOf(n) === -1) pool.push(n);
    }
  }
  pool.sort((a, b) => (LEVEL_PARS[a - 1] || 0) - (LEVEL_PARS[b - 1] || 0) || a - b);
  return pool;
}

function towerLevels() {
  const pool = towerHardPool();
  const picks = [];
  const used = {};
  for (let floor = 0; floor < TOWER_FLOORS; floor += 1) {
    const lo = Math.floor((pool.length * floor) / TOWER_FLOORS);
    const hi = Math.max(lo + 1, Math.floor((pool.length * (floor + 1)) / TOWER_FLOORS));
    let band = pool.slice(lo, hi);
    if (floor === TOWER_FLOORS - 1) band = pool.slice(Math.max(0, pool.length - 14));
    if (!band.length) band = pool.slice(-5);
    let n = band[hashStr(weekId() + ":tw" + floor) % band.length];
    let guard = 0;
    while (used[n] && guard < pool.length) {
      n = pool[(pool.indexOf(n) + 1) % pool.length];
      guard += 1;
    }
    used[n] = true;
    picks.push(n);
  }
  return picks;
}

function towerLevel(floor) {
  return towerLevels()[Math.max(0, Math.min(TOWER_FLOORS - 1, floor))] || LEVELS.length;
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

function rivalTowerScore(name) {
  const seals = Number(progress.seals[name]) || 0;
  return Math.max(0, 16 + (hashStr(weekId() + ":tw:" + name) % 96) - seals * 18);
}

function towerTable() {
  const rows = RIVALS.map((name) => ({ name: name, score: rivalTowerScore(name), you: false }));
  rows.push({ name: YOU, score: progress.towerScore || 0, you: true });
  rows.sort((a, b) => b.score - a.score || (a.you ? -1 : b.you ? 1 : 0));
  return rows.map((row, i) => {
    row.place = i + 1;
    return row;
  });
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
        ". Закрой банки, открывай свои ходы за ●.";
    } else {
      huntEl.textContent = "";
    }
  }
  if (hinderEl) {
    const hz = hinderLocks();
    hinderEl.textContent =
      state.mode === "tower"
        ? "Он закрыл тебе ходы. Свои открываешь за ●, чужие — печатью."
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
  if (lead) {
    lead.textContent =
      "Звёзды и ходы за уровень. Сейчас открыт " + progress.unlocked + ". Башня сюда не заходит.";
  }
  if (cont) cont.textContent = "Продолжить · " + progress.unlocked;
  const last = Math.min(LEVELS.length, Math.max(progress.unlocked + 4, 10));
  mapGrid.innerHTML = "";
  for (let n = 1; n <= last; n += 1) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.level = String(n);
    const stars = progress.stars[n - 1] || 0;
    const moves = (progress.bestMoves && progress.bestMoves[n - 1]) || 0;
    const now = n === progress.unlocked;
    const lock = n > progress.unlocked;
    btn.className = "map-cell" + (stars ? " done" : "") + (now ? " now" : "") + (lock ? " lock" : "");
    btn.style.animationDelay = ((n - 1) % 10) * 18 + "ms";
    if (lock) {
      btn.textContent = "🔒";
    } else {
      btn.innerHTML =
        "<b>" +
        n +
        "</b><small>" +
        (stars ? stars + "★" : "ещё нет") +
        (moves ? " · " + moves : "") +
        "</small>";
    }
    mapGrid.appendChild(btn);
  }
}

function openMap() {
  closeMenu();
  closeTower();
  closeLeague();
  closeShop();
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
  if (n > progress.unlocked) {
    showPassToast("Сначала пройди " + progress.unlocked);
    return;
  }
  closeMap();
  startLevel(n);
}

function paintTower() {
  const table = towerTable();
  const { me, next } = huntTarget(table);
  const days = daysToMonday();
  if (towerLead) {
    towerLead.textContent = next
      ? "Очки башни сбрасываются через " +
        days +
        (days === 1 ? " день" : days < 5 ? " дня" : " дней") +
        ". Обогни " +
        next.name +
        " — лучший сундук недели."
      : "Ты первый. Держи место до понедельника — лучший сундук твой.";
  }
  const scoreEl = document.getElementById("tower-score");
  if (scoreEl) {
    scoreEl.textContent =
      "Твои очки: " + (progress.towerScore || 0) + (me ? " · #" + me.place : "");
  }
  const sealBtn = document.getElementById("tower-seal");
  if (sealBtn) {
    sealBtn.textContent = next ? "Запечатать ход " + next.name : "Некого печатать";
  }
  if (towerList) {
    towerList.innerHTML = "";
    table.slice(0, 8).forEach((row, i) => {
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
      towerList.appendChild(el);
    });
  }
  paintDuel();
}

function paintShop() {
  if (shopLead) {
    shopLead.textContent =
      "У тебя " +
      progress.coins +
      " ● и " +
      progress.bottleCharges +
      " запасных колб. Игра мешает — магазин отвечает.";
  }
}

function openTower() {
  closeLeague();
  closeShop();
  closeSkins();
  closeMap();
  paintTower();
  towerOverlay.classList.add("show");
  syncScreens();
}

function closeTower() {
  towerOverlay.classList.remove("show");
  syncScreens();
}

function openShop() {
  closeLeague();
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

function playTowerFloor() {
  closeTower();
  closeMap();
  const heat = Math.min(4, Math.floor((progress.towerScore || 0) / 50));
  startLevel(towerLevel(heat), { tower: true, floor: heat });
  showPassToast("Башня · отдельные очки до понедельника");
  return true;
}

function sealHunt() {
  const next = huntTarget(towerTable()).next;
  if (!next || next.you) {
    showPassToast("Некого печатать — ты первый.");
    return;
  }
  if ((progress.towerCoins || 0) < SEAL_PRICE) {
    shake(document.getElementById("shop-seal"));
    shake(document.getElementById("tower-seal"));
    showPassToast("Печать — за монеты башни.");
    return;
  }
  progress.towerCoins -= SEAL_PRICE;
  progress.seals[next.name] = (Number(progress.seals[next.name]) || 0) + 1;
  saveProgress();
  paintHud();
  paintLeague();
  paintShop();
  showPassToast("Запечатал ход " + next.name);
  paintTower();
  tone(180, 0.16, "sawtooth", 0.035);
}

function buyFlask() {
  if (progress.coins < FLASK_PRICE) {
    shake(document.getElementById("shop-flask"));
    return;
  }
  progress.coins -= FLASK_PRICE;
  progress.bottleCharges += 1;
  saveProgress();
  paintHud();
  paintShop();
  showPassToast("Запасная колба +1");
}

function buyUndoPack() {
  if (progress.coins < UNDO_PACK) {
    shake(document.getElementById("shop-undo"));
    return;
  }
  progress.coins -= UNDO_PACK;
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
  showPassToast("+" + AD_COINS + " ●");
}

function openLeague() {
  closeShop();
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
  document.getElementById("hud-stars").textContent = String(totalStars());
  document.getElementById("hud-streak").textContent = String(progress.streak);
  document.getElementById("hud-coins").textContent = String(cash());
  document.getElementById("hud-hints").textContent = String(progress.hints);
  hintBtn.textContent = progress.hints ? "Подсказка" : "Подсказка ●" + HINT_PRICE;
  undoBtn.textContent = progress.undos ? "Отмена" : "Отмена ●" + UNDO_PRICE;
  failUndo.textContent = progress.undos ? "Отменить ход" : "Отменить ход ●" + UNDO_PRICE;
  failJar.textContent = state.locked ? "Открыть банку ●" + nextLockPrice() : "Банки открыты";
  failJar.hidden = !state.locked;
  failJar.disabled = !state.locked;
  if (lockCoins) lockCoins.textContent = "Открыть ●" + nextLockPrice();
  if (lockCharge) {
    lockCharge.hidden = !progress.bottleCharges;
    lockCharge.textContent = "Своя колба · " + progress.bottleCharges;
  }
  failKeep.textContent = "Заново, серия " + progress.streak + " ●" + KEEP_PRICE;
  document.getElementById("skin").textContent = "Скин: " + skinName(progress.skin);
  const me = huntTarget(towerTable()).me;
  if (hudPlace && me) hudPlace.textContent = String(me.place);
  const leagueChip = document.getElementById("chip-league");
  if (leagueChip) leagueChip.hidden = state.mode !== "tower";
}

function paintMission() {
  const ch = chapterIndex(state.level);
  const pos = chapterPos(state.level);
  const left = 11 - pos;
  if (state.mode === "tower") {
    const { me } = huntTarget(towerTable());
    chapterEl.textContent = "Башня недели";
    levelEl.textContent = String(progress.towerScore || 0);
    trackFill.style.width = me ? Math.max(8, (21 - me.place) * 5) + "%" : "50%";
    trackLabel.textContent = me ? "#" + me.place + " · очки сбросятся в понедельник" : "Очки башни";
    goalEl.textContent = "Свои монеты башни. Открой ход или запечатай чужой и набери очки недели.";
    paintScene();
    paintHunt();
    paintDuel();
    return;
  }
  if (duelEl) duelEl.hidden = true;
  chapterEl.textContent = CHAPTERS[ch];
  levelEl.textContent = String(state.level);
  trackFill.style.width = pos * 10 + "%";
  trackLabel.textContent =
    pos === 10
      ? "Последний уровень — в сундуке монеты, ходы, отмены или скин"
      : pos + " / 10 до сундука главы";
  const needThree = progress.stars[state.level - 1] < 3;
  if (pos === 10) {
    goalEl.textContent =
      "Добей главу «" + CHAPTERS[ch] + "». В сундуке монеты, подсказки, отмены и скин.";
  } else if (left <= 3) {
    goalEl.textContent =
      "Ещё " + left + " — и глава «" + CHAPTERS[ch] + "» твоя. Этот уровень нельзя бросать.";
  } else if (needThree) {
    goalEl.textContent = "Собери банки коротко. Три звезды — если почти без лишних переливов.";
  } else {
    goalEl.textContent =
      "Серия " + progress.streak + " даёт больше монет. Сдаться — и огоньки сгорят.";
  }
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
  if (level <= 5) return 0;
  let n = level <= 30 ? 1 : 2;
  n += hinderLocks();
  return Math.min(3, n);
}

function nextLockPrice() {
  return LOCK_PRICES[Math.min(state.openedExtra, LOCK_PRICES.length - 1)];
}

function closeLockShop() {
  if (lockOverlay) lockOverlay.classList.remove("show");
  if (state.lock === "shop") state.lock = "";
}

function openLockShop() {
  if (!state.locked) return;
  if (lockText) {
    lockText.textContent =
      state.locked === 1
        ? "Последняя закрытая. Откроешь — появится пустое место."
        : "Ещё " + state.locked + " закрытых. Сначала одну.";
  }
  if (lockCoins) lockCoins.textContent = "Открыть ●" + nextLockPrice();
  if (lockCharge) {
    lockCharge.hidden = !progress.bottleCharges;
    lockCharge.textContent = "Своя колба · " + progress.bottleCharges;
  }
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
  const n = tower
    ? Math.min(LEVELS.length, Math.max(1, level))
    : Math.min(progress.unlocked, Math.max(1, level));
  const packed = LEVELS[n - 1];
  state.level = n;
  state.mode = tower ? "tower" : "story";
  state.towerFloor = tower ? opts.floor || 0 : 0;
  state.tubes = packed.map((tube) => tube.slice());
  state.selected = -1;
  state.history = [];
  state.moves = 0;
  state.doubled = false;
  state.locked = tower ? towerLockCount(opts.floor || 0) : lockCountFor(n);
  state.openedExtra = 0;
  hideFail();
  overlay.classList.remove("show");
  paintHud();
  paintMission();
  render(true);
  armHook();
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
    tag.textContent = "●" + nextLockPrice();
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
    progress.streak += 1;
    progress.maxStreak = Math.max(progress.maxStreak || 0, progress.streak);
    const points = 16 + stars * 8 + Math.max(0, 10 - Math.floor(state.moves / 4));
    progress.towerScore = (progress.towerScore || 0) + points;
    const coins = 8 + stars * 4;
    if (progress.streak > 0 && progress.streak % 5 === 0) progress.hints += 1;
    gain(coins);
    saveProgress();
    return { coins: coins, firstClear: false, chapterDone: false, chapter: 0, tower: true, points: points };
  }
  const i = state.level - 1;
  const better = stars > progress.stars[i];
  const firstClear = progress.stars[i] === 0;
  const ch = chapterIndex(state.level);
  const chapterDone = chapterPos(state.level) === 10 && firstClear && !progress.chests[ch];
  progress.stars[i] = Math.max(progress.stars[i], stars);
  if (!progress.bestMoves) progress.bestMoves = Array(LEVELS.length).fill(0);
  if (!progress.bestMoves[i] || state.moves < progress.bestMoves[i]) {
    progress.bestMoves[i] = state.moves;
  }
  if (state.level >= progress.unlocked && state.level < LEVELS.length) {
    progress.unlocked = state.level + 1;
  }
  progress.streak += 1;
  progress.maxStreak = Math.max(progress.maxStreak || 0, progress.streak);
  if (state.level === raceLevel()) {
    const race = progress.weekRace;
    const better =
      !race.stars ||
      stars > race.stars ||
      (stars === race.stars && state.moves < race.moves);
    if (better) progress.weekRace = { level: state.level, stars: stars, moves: state.moves };
  }
  let coins = 6 + stars * 8 + Math.min(progress.streak, 10) * 2;
  if (better) coins += 10;
  if (progress.streak > 0 && progress.streak % 5 === 0) progress.hints += 1;
  progress.coins += coins;
  saveProgress();
  return { coins, firstClear, chapterDone, chapter: ch };
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

async function showWin() {
  Array.prototype.forEach.call(board.children, (el, i) => {
    window.setTimeout(() => el.classList.add("won"), i * 50);
  });
  const stars = starCount();
  const before = huntTarget(leagueTable());
  const reward = applyWinRewards(stars);
  const after = huntTarget(leagueTable());
  if (after.me) progress.lastPlace = after.me.place;
  saveProgress();
  if (before.me && after.me && after.me.place < before.me.place) {
    const name = before.next ? before.next.name : "";
    showPassToast(name ? "Обогнал " + name + " · #" + after.me.place : "Лига ↑ #" + after.me.place);
    tone(700, 0.12, "triangle", 0.04);
  }
  document.body.classList.add("celebrate");
  window.setTimeout(() => document.body.classList.remove("celebrate"), 900);
  flyLoot(board.getBoundingClientRect(), 6);
  feel("win");
  tone(392, 0.1, "sine", 0.04);
  tone(523, 0.14, "sine", 0.045);
  tone(659, 0.2, "triangle", 0.035);
  state.lastCoins = reward.coins;
  state.doubled = false;
  winDouble.disabled = false;
  winDouble.textContent = "Ролик — удвоить";
  paintHud();
  await wait(420);
  const last = state.level >= LEVELS.length;
  const nextChapter = CHAPTERS[Math.min(CHAPTERS.length - 1, chapterIndex(state.level) + 1)];
  winTitle.textContent = reward.tower
    ? "Башня"
    : last
      ? "Корона твоя"
      : reward.chapterDone
        ? "Глава закрыта"
        : "Есть!";
  const leftInChapter = 10 - chapterPos(state.level);
  if (reward.tower) {
    const { me, next } = huntTarget(towerTable());
    winText.textContent = next
      ? "+" +
        reward.points +
        " очков башни. Ты #" +
        (me ? me.place : "—") +
        ". До " +
        next.name +
        " ещё " +
        (next.score - me.score) +
        "."
      : "+" + reward.points + " очков. Ты первый на неделе. Сундук твой, если удержишь.";
  } else {
    winText.textContent = last
      ? "Все 100. Серия " + progress.streak + "."
      : reward.chapterDone
        ? "Сундук главы забран. Дальше — «" + nextChapter + "»."
        : leftInChapter
          ? "Ещё " + leftInChapter + " до сундука «" + CHAPTERS[chapterIndex(state.level)] + "»."
          : "Глава уже была твоя. Можно выбить 3 звезды.";
    if (before.me && after.me && after.me.place < before.me.place && before.next) {
      winText.textContent += " Обогнал " + before.next.name + ".";
    }
  }
  winReward.textContent =
    "+" +
    reward.coins +
    " ●  (серия +" +
    Math.min(progress.streak, 10) * 2 +
    ")   серия " +
    progress.streak;
  Array.prototype.forEach.call(winStars.children, (el) => el.classList.remove("on"));
  overlay.classList.add("show");
  for (let i = 0; i < stars; i += 1) {
    await wait(160);
    winStars.children[i].classList.add("on");
  }
  nextBtn.textContent = reward.tower
    ? progress.towerDone.every(Boolean)
      ? "В историю"
      : "Ещё бой"
    : last
      ? "С первого"
      : reward.chapterDone
        ? "Новая глава"
        : "Следующий";
  if (reward.chapterDone) {
    const loot = rollChest(reward.chapter);
    takeLoot(loot);
    progress.chests[reward.chapter] = true;
    saveProgress();
    paintHud();
    chestLoot.innerHTML = "";
    loot.forEach((item, i) => {
      const row = document.createElement("b");
      row.textContent = item.text;
      row.style.animationDelay = i * 90 + "ms";
      chestLoot.appendChild(row);
    });
    chestOverlay.classList.add("show");
  }
}

async function doubleReward() {
  if (state.doubled || !state.lastCoins || state.busy) return;
  state.busy = true;
  winDouble.disabled = true;
  winDouble.textContent = "Ролик…";
  await wait(1100);
  progress.coins += state.lastCoins;
  state.doubled = true;
  saveProgress();
  paintHud();
  winReward.textContent = "+" + state.lastCoins * 2 + " ●  удвоено   серия " + progress.streak;
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
  failRisk.textContent = progress.streak
    ? "Серия " + progress.streak + " сгорит, если сдаться."
    : "Серии нет. Можно сдаться без потери огня.";
  failUndo.hidden = state.history.length === 0;
  failKeep.hidden = progress.streak < 1;
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
  if (!spend(UNDO_PRICE)) return false;
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
  breakStreak();
  replayCurrent();
}

function keepStreakRestart() {
  if (!spend(KEEP_PRICE)) {
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
    if (!spend(HINT_PRICE)) {
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
  const willFill = to.length + count === CAP && (to.length === 0 || to.every((c) => c === color));
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
  chestOverlay.classList.remove("show");
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
document.getElementById("chip-league").addEventListener("click", () => openTower());
const chipShop = document.getElementById("chip-shop") || document.getElementById("fly-shop");
if (chipShop) chipShop.addEventListener("click", () => openShop());
document.getElementById("league-close").addEventListener("click", () => {
  closeLeague();
  backToMenuIfIdle();
});
document.getElementById("league-tower").addEventListener("click", () => openTower());
document.getElementById("league-shop").addEventListener("click", () => openShop());
leagueRace.addEventListener("click", () => {
  closeLeague();
  startLevel(raceLevel());
});
document.getElementById("tower-play").addEventListener("click", () => playTowerFloor());
document.getElementById("tower-seal").addEventListener("click", () => sealHunt());
document.getElementById("tower-close").addEventListener("click", () => {
  closeTower();
  backToMenuIfIdle();
});
if (towerSq) towerSq.addEventListener("click", () => openTower());
if (mapGrid) {
  mapGrid.addEventListener("click", (event) => {
    const btn = event.target.closest(".map-cell");
    if (!btn || btn.classList.contains("lock")) {
      if (btn && btn.classList.contains("lock")) shake(btn);
      return;
    }
    pickLevel(Number(btn.dataset.level));
  });
}
const mapContinue = document.getElementById("map-continue");
if (mapContinue) mapContinue.addEventListener("click", () => pickLevel(progress.unlocked));
const mapBack = document.getElementById("map-back");
if (mapBack) mapBack.addEventListener("click", () => {
  closeMap();
  openMenu();
});
document.getElementById("shop-flask").addEventListener("click", () => buyFlask());
const shopSkins = document.getElementById("shop-skins");
if (shopSkins) shopSkins.addEventListener("click", () => openSkins());
document.getElementById("shop-seal").addEventListener("click", () => sealHunt());
document.getElementById("shop-undo").addEventListener("click", () => buyUndoPack());
document.getElementById("shop-ad").addEventListener("click", () => buyAdCoins());
document.getElementById("shop-close").addEventListener("click", () => {
  closeShop();
  backToMenuIfIdle();
});
nextBtn.addEventListener("click", () => {
  if (state.mode === "tower") {
    playTowerFloor();
    return;
  }
  if (state.level >= LEVELS.length) {
    startLevel(1);
    return;
  }
  startLevel(Math.min(progress.unlocked, state.level + 1));
});

seedMotes();
syncWeek();
applySettings();

const skipBoot = /[?&](stuck|locks|win)=/.test(location.search);
const boot = document.getElementById("boot");
const bootPlay = document.getElementById("boot-play");

function launchGame(where) {
  closeSettings();
  closeMenu();
  if (where === "tower") {
    openTower();
    return;
  }
  if (where === "league") {
    openTower();
    return;
  }
  if (where === "shop") {
    openShop();
    return;
  }
  if (state.mode === "story" && state.tubes.length) return;
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
paintMenu();
syncScreens();

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
  winReward.textContent = "+24 ●   серия " + progress.streak;
  winDouble.disabled = false;
  winDouble.textContent = "Ролик — удвоить";
  overlay.classList.add("show");
  paintHud();
}
