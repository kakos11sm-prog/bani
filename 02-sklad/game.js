const SAVE_KEY = "sklad-progress-v4";
const START_COINS = 1200;
const PALLET_COLS = 2;
const PALLET_DEPTH = 3;
const PALLET_LAYERS = 3;
const PALLET_PACKS = PALLET_COLS * PALLET_DEPTH * PALLET_LAYERS;
const BUILD_SPOT = 99;
const SHIP_COLS = 3;
const SHIP_ROWS = 3;
const SHIP_SLOTS = SHIP_COLS * SHIP_ROWS;
const WOOD_PRICE = [40, 90, 160, 260, 400, 600, 850, 1200, 1700, 2300];
const PACK_MARGIN = 20;
const DELIVERY_FEE = 40;
const DELIVERY_MS = 60000;
const JOB_GRADES = ["easy", "mid", "hard", "wild"];
const GRADE_NAME = {
  easy: "Лёгкая",
  mid: "Средняя",
  hard: "Тяжёлая",
  wild: "Нереальная",
};
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
    coins: START_COINS,
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
    base.coins = Math.max(0, Number(raw.coins) || 0);
    base.room = ROOMS.some((r) => r.id === raw.room) ? raw.room : "";
    base.nextOrder = Math.max(1, Number(raw.nextOrder) || 1);
    base.nextPallet = Math.max(1, Number(raw.nextPallet) || 1);
    base.nextShip = Math.max(1, Number(raw.nextShip) || 1);
    base.gifted = raw.gifted === true;
    base.giftedPal = raw.giftedPal === true;
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
      if (p.spot === BUILD_SPOT) return;
      const clash = base.pallets.some((o, j) => j < i && o.spot === p.spot && o.spot !== BUILD_SPOT);
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
const state = { packId: 0, pickId: 0, shipId: 0, shipPalId: 0, unloading: false, busy: false, drag: null, cart: { pals: [], woods: 0 } };

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

function emptyWoods() {
  return allPals().filter((p) => p.units < 1).length;
}

function freeSpots() {
  const room = roomOf(progress.room);
  const cap = room ? room.slots : 0;
  return Math.max(0, cap - goodsPals().length);
}

function usedSpots() {
  return new Set(goodsPals().map((p) => p.spot));
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

function packPayOf(skuId) {
  const sku = skuOf(skuId);
  return Math.round((sku.cost + DELIVERY_FEE) / PALLET_PACKS) + PACK_MARGIN;
}

function linesPay(lines) {
  return (lines || []).reduce((sum, line) => sum + line.need * packPayOf(line.sku), 0);
}

function gradePay(lines, grade) {
  const base = linesPay(lines);
  if (grade === "hard") return Math.round(base * 1.2);
  if (grade === "wild") return Math.round(base * 1.45);
  return base;
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
  return {
    id: id,
    lines: lines,
    grade: JOB_GRADES.indexOf(raw && raw.grade) >= 0 ? raw.grade : "",
    pay: Math.max(1, gradePay(lines, raw && raw.grade)),
  };
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
    if (order.grade === "wild") return true;
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
  return (
    "<div class=\"pal-live sku-" +
    sku.id +
    "\" style=\"" +
    palSkin(sku) +
    "\">" +
    "<div class=\"pal-load\">" +
    load +
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
        ? "<span class=\"pak\" style=\"" + palSkin(sku) + "\">" + pakInner(sku) + "</span>"
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
  if (!el) return;
  el.classList.remove("shake");
  void el.offsetWidth;
  el.classList.add("shake");
}

function paintHud() {
  document.getElementById("hud-coins").textContent = String(progress.coins);
  const woods = document.getElementById("hud-woods");
  if (woods) woods.textContent = String(emptyWoods());
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
  const order = currentOrder();
  return !!(order && pal && pal.id !== state.shipPalId && pal.units > 0 && stillNeed(order, pal.sku));
}

function canDropPackOn(pal, sku) {
  if (!pal) return false;
  if (state.shipId) {
    const order = currentOrder();
    if (!order || !stillNeed(order, sku)) return false;
    return pal.id === state.shipPalId;
  }
  if (pal.spot === BUILD_SPOT) return false;
  return pal.units < PALLET_PACKS && (!pal.units || pal.sku === sku);
}

function palStandHtml(pal) {
  if (state.shipId && pal && pal.id === state.shipPalId) {
    const order = currentOrder();
    return "<i class=\"pal-shade\" aria-hidden=\"true\"></i>" + mixPalMarkup(shipPacks(order));
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
    if (e.target.closest(".pak") && !e.target.closest(".pak.empty")) {
      startPackDrag(e, pal.id, "floor");
      return;
    }
    if (state.shipId && pal.units > 0 && pal.spot !== BUILD_SPOT) {
      if (canTakePal(pal)) startPackDrag(e, pal.id, "floor");
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
      const stand = document.createElement("div");
      stand.className =
        "pal-stand" +
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
  paintStack();
  paintDock();
  syncYardPan();
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

function syncJobsTab() {
  const tab = document.getElementById("jobs-tab");
  if (!tab) return;
  const wait = !!(dockList().length && !state.unloading && floor.classList.contains("show") && !state.shipId);
  tab.textContent = wait ? "Разгрузить" : "Заявки";
  tab.classList.toggle("can-unload", wait);
}

function startUnload() {
  if (!dockList().length) return;
  if (!progress.pallets.filter((p) => p.spot !== BUILD_SPOT).some((p) => p.units < PALLET_PACKS)) {
    toast(emptyWoods() ? "Сначала поставь поддон со стопки" : "Нужен свободный поддон");
  }
  state.unloading = true;
  paintDock();
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
  const order = currentOrder();
  const go = document.getElementById("ship-go");
  if (!order) {
    sheet.classList.remove("show", "ready", "big", "fly");
    if (go) go.hidden = true;
    return;
  }
  if (fresh) {
    sheet.classList.remove("show", "ready", "big", "fly");
    void sheet.offsetWidth;
  }
  sheet.classList.add("show");
  document.getElementById("way-id").textContent = "#" + order.id;
  document.getElementById("way-pay").textContent = "+" + order.pay;
  const host = document.getElementById("way-lines");
  host.innerHTML = "";
  (order.lines || []).forEach((line) => {
    const sku = skuOf(line.sku);
    const row = document.createElement("li");
    const done = line.fill >= line.need;
    row.className = done ? "ok" : "";
    row.innerHTML =
      "<b>" +
      sku.name +
      "</b><span>" +
      line.fill +
      "/" +
      line.need +
      "</span><i class=\"tick\">" +
      (done ? "✓" : "") +
      "</i>";
    host.appendChild(row);
  });
  const ready = orderDone(order) && !state.busy;
  sheet.classList.toggle("ready", ready);
  if (go) go.hidden = !ready;
}

function paintLoad() {}

function paintJobs() {
  const host = document.getElementById("jobs");
  host.innerHTML = "";
  if (!progress.orders.length) {
    const empty = document.createElement("div");
    empty.className = "job";
    empty.innerHTML = "<b>Заявок нет</b><small>Сними товар с машины на поддон</small>";
    host.appendChild(empty);
    return;
  }
  const list = progress.orders.slice().sort((a, b) => {
    return JOB_GRADES.indexOf(a.grade) - JOB_GRADES.indexOf(b.grade);
  });
  list.forEach((order, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "job" + (order.grade ? " " + order.grade : "");
    btn.style.animationDelay = i * 60 + "ms";
    const mix = (order.lines || [])
      .map((line) => line.need + "× " + skuOf(line.sku).name)
      .join(" · ");
    const shop = (order.lines || []).some((line) => stockHave(line.sku) < line.need - line.fill);
    btn.innerHTML =
      "<em>" +
      (GRADE_NAME[order.grade] || "Заявка") +
      "</em><b>#" +
      order.id +
      " · " +
      mix +
      "</b><small>+" +
      order.pay +
      (shop ? " · докупить" : "") +
      "</small>";
    btn.addEventListener("click", () => {
      closeJobs();
      startShip(order.id);
    });
    host.appendChild(btn);
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
    btn.innerHTML =
      "<div class=\"shop-stand\">" +
      palMarkup(sku, PALLET_PACKS) +
      "</div><span class=\"good-meta\"><b>" +
      sku.name +
      "</b><em>" +
      (locked ? "Открыть · " + unlockPrice(sku.id) : sku.cost) +
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
    const em = btn.querySelector(".good-meta em");
    if (em) em.textContent = locked ? "Открыть · " + unlockPrice(sku.id) : String(sku.cost);
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
  if (inGuide() && pals.length) {
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
      toast("Машина приехала. Жми «Разгрузить»");
    });
    if (document.getElementById("ship-pane").classList.contains("show")) paintShipList();
    if (floor.classList.contains("show")) {
      paintDock();
      paintStack();
    }
    if (inGuide() && (progress.guide === "wait" || progress.guide === "wood")) {
      showGuide("place");
    }
  }
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
  if (!floorPals()) return;
  const used = new Set();
  const shipId = state.shipId;
  progress.orders.forEach((order) => {
    if (JOB_GRADES.indexOf(order.grade) < 0) return;
    used.add(order.grade);
    if (order.id === shipId || !orderIdle(order)) return;
    const lines = linesForGrade(order.grade, order.id);
    if (!lines || !lines.length) return;
    order.lines = lines;
    order.pay = gradePay(lines, order.grade);
  });
  progress.orders.forEach((order) => {
    if (JOB_GRADES.indexOf(order.grade) >= 0) return;
    const n = orderNeed(order);
    let grade = n <= 1 ? "easy" : n <= 3 ? "mid" : n <= 6 ? "hard" : "wild";
    if (used.has(grade)) grade = JOB_GRADES.find((g) => !used.has(g)) || "";
    if (grade) {
      order.grade = grade;
      order.pay = gradePay(order.lines, grade);
      used.add(grade);
    }
  });
  JOB_GRADES.forEach((grade) => {
    if (used.has(grade)) return;
    const lines = linesForGrade(grade);
    if (!lines || !lines.length) return;
    progress.orders.push({
      id: progress.nextOrder,
      grade: grade,
      lines: lines,
      pay: gradePay(lines, grade),
    });
    progress.nextOrder += 1;
    used.add(grade);
  });
  saveProgress();
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
  if (state.shipId) {
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
  if (state.busy) return;
  const order = progress.orders.find((o) => o.id === id);
  if (!order) return;
  closeShop();
  closeJobs();
  closeShip();
  state.shipId = id;
  state.shipPalId = 0;
  const build = progress.pallets.find((p) => p.spot === BUILD_SPOT && p.units < 1);
  if (build) state.shipPalId = build.id;
  document.body.classList.add("shipping");
  document.body.classList.remove("loading", "gone");
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
    toast("Клади паки вниз, на сборку");
  }
}

function endShip() {
  hideGhost();
  state.shipId = 0;
  state.shipPalId = 0;
  state.drag = null;
  document.body.classList.remove("shipping", "loading", "gone");
  const bay = document.getElementById("load-bay");
  if (bay) bay.classList.remove("show", "into-truck", "away");
  const sheet = document.getElementById("waybill");
  if (sheet) sheet.classList.remove("show", "ready", "big", "fly");
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

function moveGhost(x, y) {
  const ghost = document.getElementById("drag-ghost");
  if (!ghost) return;
  ghost.style.left = x + "px";
  ghost.style.top = y + "px";
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
  const build = document.getElementById("build-spot");
  if (build && build.classList.contains("has-pal")) {
    const box = build.getBoundingClientRect();
    const p = 32;
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
  if (skin) ghost.setAttribute("style", skin);
  ghost.innerHTML = html;
  moveGhost(x, y);
}

function startWoodDrag(e, palId, from) {
  if (state.busy || state.drag) return;
  const pal = findPal(palId);
  if (!pal) return;
  if (state.shipId && pal.id === state.shipPalId && pal.units > 0) {
    shake(e.currentTarget);
    toast("Сначала отгрузи товар");
    return;
  }
  if (state.shipId && pal.units > 0 && pal.spot !== BUILD_SPOT) return;
  e.preventDefault();
  const yard = document.getElementById("inside");
  if (yard) yard.classList.add("is-drag");
  state.drag = { kind: "wood", pal: pal, palId: pal.id, from: from, held: true };
  if (from === "stack") {
    progress.stack = progress.stack.filter((p) => p.id !== pal.id);
  } else {
    progress.pallets = progress.pallets.filter((p) => p.id !== pal.id);
    if (state.shipPalId === pal.id && pal.units > 0) state.shipPalId = 0;
  }
  beginGhost(palStandHtml(pal), e.clientX, e.clientY);
  paintSlots();
  window.addEventListener("pointermove", onDragMove);
  window.addEventListener("pointerup", onDragEnd);
}

function startPackDrag(e, id, from) {
  if (state.busy || state.drag) return;
  if (from === "dock") {
    const item = (progress.incoming || []).find((row) => row.id === id && row.left > 0);
    if (!item) return;
    if (!progress.pallets.some((p) => canDropPackOn(p, item.sku))) {
      shake(e.currentTarget);
      toast(freeSpots() && emptyWoods() ? "Сначала поставь поддон" : "Нужен свободный поддон");
      return;
    }
    e.preventDefault();
    if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId);
    item.left -= 1;
    state.drag = { kind: "pack", from: "dock", dockId: item.id, sku: item.sku, held: true };
    beginGhost("<span class=\"pak\">" + pakInner(skuOf(item.sku)) + "</span>", e.clientX, e.clientY, palSkin(skuOf(item.sku)));
    if (e.currentTarget.parentNode) e.currentTarget.remove();
  } else {
    const pal = progress.pallets.find((p) => p.id === id);
    if (!pal || pal.units < 1) return;
    if (state.shipId && !canTakePal(pal)) {
      shake(e.currentTarget);
      toast("Этот пак в заявку не нужен");
      return;
    }
    if (!state.shipId) {
      startWoodDrag(e, pal.id, "floor");
      return;
    }
    e.preventDefault();
    if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId);
    pal.units -= 1;
    const sku = pal.sku;
    if (pal.units < 1) pal.sku = "";
    state.drag = { kind: "pack", from: "floor", palId: pal.id, sku: sku, held: true };
    beginGhost("<span class=\"pak\">" + pakInner(skuOf(sku)) + "</span>", e.clientX, e.clientY, palSkin(skuOf(sku)));
    const stand = e.currentTarget.closest(".pal-stand") || e.currentTarget;
    stand.innerHTML = palStandHtml(pal);
  }
  const yard = document.getElementById("inside");
  if (yard) yard.classList.add("is-drag");
  window.addEventListener("pointermove", onDragMove);
  window.addEventListener("pointerup", onDragEnd);
}

function restoreHeld(drag) {
  if (!drag || !drag.held) return;
  if (drag.kind === "wood") {
    const pal = drag.pal;
    if (pal) {
      pal.spot = -1;
      progress.stack.push(pal);
    }
  } else if (drag.from === "dock") {
    const item = (progress.incoming || []).find((row) => row.id === drag.dockId);
    if (item) item.left += 1;
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
  moveGhost(e.clientX, e.clientY);
  document.querySelectorAll(".pal-spot, .wood-stack, .pal-stand, .build-spot").forEach((el) => el.classList.remove("hot"));
  const stack = hitEl(e.clientX, e.clientY, ".wood-stack", 16);
  const spot = hitEl(e.clientX, e.clientY, ".pal-spot", 24);
  const build = hitEl(e.clientX, e.clientY, ".build-spot", 24);
  if (state.drag.kind === "wood") {
    if (stack) stack.classList.add("hot");
    else if (build && !build.classList.contains("has-pal")) build.classList.add("hot");
    else if (spot && !spot.classList.contains("has-pal")) spot.classList.add("hot");
  } else {
    const pal = palFromPoint(e.clientX, e.clientY);
    const stand = pal && document.querySelector('.pal-stand[data-id="' + pal.id + '"]');
    if (pal && stand && canDropPackOn(pal, state.drag.sku)) {
      stand.classList.add("hot");
      const cell = stand.closest(".pal-spot") || stand.closest(".build-spot");
      if (cell) cell.classList.add("hot");
    }
  }
}

function placePalOnSpot(pal, spot) {
  pal.spot = spot;
  progress.pallets.push(pal);
}

async function onDragEnd(e) {
  window.removeEventListener("pointermove", onDragMove);
  window.removeEventListener("pointerup", onDragEnd);
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
    const stackHit = hitEl(x, y, ".wood-stack", 16);
    const buildEl = hitEl(x, y, ".build-spot:not(.has-pal)", 24);
    const spotEl = hitEl(x, y, ".pal-spot:not(.has-pal)", 24);
    if (pal && !stackHit && buildEl) {
      pal.spot = BUILD_SPOT;
      progress.pallets.push(pal);
      if (state.shipId && pal.units < 1) state.shipPalId = pal.id;
    } else if (pal && !stackHit && spotEl) {
      pal.spot = Number(spotEl.dataset.spot);
      progress.pallets.push(pal);
    } else if (pal) {
      pal.spot = -1;
      progress.stack.push(pal);
    }
    drag.held = false;
    hideGhost();
    saveProgress();
    paintHud();
    const placed = pal && !stackHit && (buildEl || spotEl);
    const gift = placed ? maybeGiftFirstPal() : false;
    paintSlots();
    if (gift) markGiftStack();
    if (placed) {
      const stand = document.querySelector('.pal-stand[data-id="' + pal.id + '"]');
      if (stand) stand.classList.add("drop-in");
    }
    return;
  }
  const pal = palFromPoint(x, y);
  if (!pal || !canDropPackOn(pal, drag.sku)) {
    restoreHeld(drag);
    hideGhost();
    paintSlots();
    return;
  }
  hideGhost();
  await dropPackOn(pal, drag);
}

async function dropPackOn(pal, drag) {
  if (state.shipId) {
    const order = currentOrder();
    const line = nextLineFor(order, drag.sku);
    if (!order || !line) {
      restoreHeld(drag);
      paintSlots();
      toast("Этот пак в заявку не нужен");
      return;
    }
    if (!state.shipPalId) state.shipPalId = pal.id;
    if (pal.id !== state.shipPalId) {
      restoreHeld(drag);
      paintSlots();
      return;
    }
    drag.held = false;
    line.fill += 1;
    pal.units += 1;
    pal.sku = pal.sku || drag.sku;
    saveProgress();
    paintSlots();
    paintWaybill();
    if (orderDone(order)) toast("Собрано. Можно отгрузить");
    return;
  }
  drag.held = false;
  pal.units += 1;
  pal.sku = pal.sku || drag.sku;
  progress.incoming = (progress.incoming || []).filter((item) => item.left > 0);
  saveProgress();
  paintHud();
  paintSlots();
  maybeOrders();
  paintJobs();
  if (pal.units >= PALLET_PACKS) toast("Поддон полный. Можешь убрать на стопку");
  if (progress.guide === "place" && drag.from === "dock") playGuideGift();
}

async function finishShip(order) {
  if (state.busy || !order) return;
  state.busy = true;
  const go = document.getElementById("ship-go");
  if (go) go.hidden = true;
  const sheet = document.getElementById("waybill");
  if (sheet) sheet.classList.remove("ready");
  document.body.classList.add("loading");
  await wait(720);
  const stand = document.querySelector(".pal-stand.ship-now");
  if (stand) stand.classList.add("into-truck");
  await wait(620);
  const ship = progress.pallets.find((p) => p.id === state.shipPalId);
  if (ship) {
    ship.units = 0;
    ship.sku = "";
  }
  if (sheet) sheet.classList.add("big");
  await wait(420);
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
  if (sheet) {
    sheet.classList.remove("big");
    sheet.classList.add("fly");
  }
  document.body.classList.add("gone");
  await wait(580);
  endShip();
  paintSlots();
  maybeOrders();
  paintJobs();
  toast("Товар уехал. Поддон положи на стопку");
  state.busy = false;
  if (progress.guide === "jobs") {
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
    sel: ".chip.coin i",
    side: "below",
    wobble: ".chip.coin",
  },
  garage: {
    text: "Для начала тебе достаточно купить гараж",
    sel: '#rooms .room[data-room="garage"]',
    side: "below",
  },
  shop: {
    text: "Нужно приобрести товар для его продажи",
    sel: "#shop-btn",
    side: "below",
  },
  water: {
    text: "Сначала купить можно только воду",
    sel: '.good[data-sku="water"]',
    side: "below",
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
  },
  wait: {
    text: "Машина едет минуту. Смотри таймер справа",
    sel: "#truck",
    side: "below",
  },
  place: {
    text: "Поставь поддон со стопки, разгрузи машину и сложи паки на него",
    sel: "#wood-stack",
    side: "right",
  },
  jobs: {
    text: "Зайди в заявки. Собери заказ на нижний поддон и отправь машину",
    sel: "#jobs-tab",
    side: "above",
  },
};

function hideGuide() {
  const box = document.getElementById("guide");
  if (box) {
    box.hidden = true;
    box.classList.remove("show");
  }
  document.querySelectorAll(".guide-on").forEach((el) => el.classList.remove("guide-on", "wobble"));
}

function layoutGuide(sel, side) {
  const target = document.querySelector(sel);
  const card = document.getElementById("guide-card");
  const arrow = card && card.querySelector(".guide-arrow");
  if (!target || !card) return false;
  const r = target.getBoundingClientRect();
  if (r.width < 4 || r.height < 4) return false;
  target.classList.add("guide-on");
  const w = Math.min(240, window.innerWidth - 16);
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
    top = r.bottom + 16;
    left = cx - w / 2;
    card.dataset.side = "up";
  }
  left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
  top = Math.max(8, Math.min(top, window.innerHeight - h - 8));
  card.style.left = left + "px";
  card.style.top = top + "px";
  if (arrow) {
    arrow.style.left = "";
    arrow.style.right = "";
    arrow.style.top = "";
    arrow.style.bottom = "";
    arrow.style.margin = "0";
    if (card.dataset.side === "up" || card.dataset.side === "down") {
      const ax = Math.max(18, Math.min(cx - left, w - 18));
      arrow.style.left = ax + "px";
      arrow.style.marginLeft = "-10px";
      if (card.dataset.side === "up") arrow.style.top = "-18px";
      else arrow.style.bottom = "-18px";
    } else {
      const ay = Math.max(18, Math.min(cy - top, h - 18));
      arrow.style.top = ay + "px";
      arrow.style.marginTop = "-10px";
      if (card.dataset.side === "left") arrow.style.left = "-18px";
      else arrow.style.right = "-18px";
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
  box.hidden = false;
  box.classList.add("show");
  if (spec.wobble) {
    const wob = document.querySelector(spec.wobble);
    if (wob) wob.classList.add("wobble");
  }
  const place = () => {
    if (!layoutGuide(spec.sel, spec.side)) {
      window.setTimeout(place, 60);
    }
  };
  window.requestAnimationFrame(() => window.requestAnimationFrame(place));
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
  if (step === "water") {
    showGuide("unlock");
    return;
  }
  if (step === "unlock") {
    showGuide("wood");
    return;
  }
  if (step === "jobs") {
    progress.guide = "done";
    saveProgress();
  }
  hideGuide();
}

function playGuideGift() {
  if (progress.giftedPal) return;
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
    showGuide("jobs");
  }, 720);
}

function goPlay() {
  paintHud();
  if (!progress.gifted) giftStart();
  if (progress.guide !== "done" && !progress.room) {
    showGuide("coins");
    return;
  }
  if (!progress.room) {
    paintRooms();
    showScreen(rent);
    return;
  }
  openFloor();
}

function goBack() {
  if (state.busy) return;
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

document.getElementById("boot-play").addEventListener("click", goPlay);
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
  if (order && orderDone(order)) finishShip(order);
});
document.getElementById("shop").addEventListener("click", (e) => {
  if (e.target.id === "shop") closeShop();
});
document.getElementById("jobs-tab").addEventListener("click", () => {
  if (dockList().length && !state.unloading && !state.shipId) startUnload();
  else openJobs();
});
document.getElementById("jobs-close").addEventListener("click", closeJobs);
document.getElementById("jobs-pane").addEventListener("click", (e) => {
  if (e.target.id === "jobs-pane") closeJobs();
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
showScreen(boot);
