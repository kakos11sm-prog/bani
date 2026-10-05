const SAVE_KEY = "sklad-progress-v3";
const START_COINS = 1200;
const PALLET_PACKS = 6;
const BOX_COST = 80;
const BOX_PACK = 8;
const PACK_PAY = 150;
const DELIVERY_FEE = 40;
const DELIVERY_MS = 60000;
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
  { x: 1, b: 30, s: 0.86, lift: 30 },
  { x: 35, b: 30, s: 0.86, lift: 30 },
  { x: 69, b: 30, s: 0.86, lift: 30 },
  { x: 18, b: 2, s: 1, lift: 20 },
  { x: 52, b: 2, s: 1, lift: 20 },
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
    boxes: 0,
    orders: [],
    incoming: [],
    nextOrder: 1,
    nextPallet: 1,
    nextShip: 1,
    gifted: false,
  };
}

function loadProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || "");
    if (!raw || typeof raw !== "object") return emptyProgress();
    const base = emptyProgress();
    base.coins = Math.max(0, Number(raw.coins) || 0);
    base.room = ROOMS.some((r) => r.id === raw.room) ? raw.room : "";
    base.boxes = Math.max(0, Number(raw.boxes) || 0);
    base.nextOrder = Math.max(1, Number(raw.nextOrder) || 1);
    base.nextPallet = Math.max(1, Number(raw.nextPallet) || 1);
    base.nextShip = Math.max(1, Number(raw.nextShip) || 1);
    base.gifted = raw.gifted === true;
    base.incoming = Array.isArray(raw.incoming)
      ? raw.incoming
          .map((item) => ({
            id: Number(item.id) || 0,
            sku: SKUS.some((s) => s.id === item.sku) ? item.sku : "water",
            readyAt: Math.max(0, Number(item.readyAt) || 0),
          }))
          .filter((item) => item.id && item.readyAt)
      : [];
    base.pallets = Array.isArray(raw.pallets)
      ? raw.pallets
          .map((p) => ({
            id: Number(p.id) || 0,
            sku: SKUS.some((s) => s.id === p.sku) ? p.sku : "water",
            units: Math.max(0, Number(p.units) || 0),
          }))
          .filter((p) => p.id)
      : [];
    base.orders = Array.isArray(raw.orders)
      ? raw.orders.map((o) => normalizeOrder(o)).filter((o) => o.id && o.lines.length >= 2)
      : [];
    return base;
  } catch (e) {
    return emptyProgress();
  }
}

function saveProgress() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
}

const progress = loadProgress();
const state = { packId: 0, pickId: 0, busy: false };

function skuOf(id) {
  return SKUS.find((s) => s.id === id) || SKUS[0];
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
    pay: Math.max(1, Number(raw && raw.pay) || need * PACK_PAY),
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

function stockFree(sku) {
  const have = progress.pallets
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

function bak(sku) {
  return (
    "<span class=\"bak\"><i class=\"cap\"></i><i class=\"neck\"></i><i class=\"body\"><b class=\"tag\">" +
    (sku.tag || sku.name) +
    "</b></i></span>"
  );
}

function pakInner(sku) {
  return (
    "<span class=\"pak-row back\">" +
    bak(sku) +
    bak(sku) +
    bak(sku) +
    "</span>" +
    "<span class=\"pak-row front\">" +
    bak(sku) +
    bak(sku) +
    bak(sku) +
    "</span>" +
    "<span class=\"pak-film\"></span>" +
    "<span class=\"pak-tray\"></span>"
  );
}

function palMarkup(sku, packs) {
  const n = Math.max(0, Math.min(PALLET_PACKS, Number(packs) || 0));
  const cols = 2;
  const rows = PALLET_PACKS / cols;
  let load = "";
  for (let row = 0; row < rows; row += 1) {
    const vacant = row * cols + 1 < PALLET_PACKS - n;
    load += "<span class=\"pak-layer" + (vacant ? " vacant" : "") + "\">";
    for (let col = 0; col < cols; col += 1) {
      const slot = row * cols + col;
      if (slot >= PALLET_PACKS - n) {
        load += "<span class=\"pak\">" + pakInner(sku) + "</span>";
      } else {
        load += "<span class=\"pak empty\"></span>";
      }
    }
    load += "</span>";
  }
  return (
    "<div class=\"pal-live sku-" +
    sku.id +
    "\" style=\"--sku:" +
    sku.tone +
    ";--liq:" +
    (sku.liq || sku.tone) +
    ";--cap:" +
    (sku.cap || sku.tone) +
    ";--paper:" +
    (sku.paper || "#efe6d4") +
    ";--ink:" +
    (sku.ink || "#2c3438") +
    "\">" +
    "<div class=\"pal-load\">" +
    load +
    "</div>" +
    "<div class=\"pal-wood\">" +
    "<div class=\"pal-boards\"><i></i><i></i><i></i><i></i><i></i></div>" +
    "<div class=\"pal-stringers\"><i></i><i></i><i></i></div>" +
    "<div class=\"pal-base\"><i></i><i></i><i></i></div>" +
    "</div></div>"
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
      x: 8 + col * (80 / Math.max(1, cols - 1)),
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
  }
  if (typeof paintTruck === "function") paintTruck();
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
  document.getElementById("hud-boxes").textContent = String(progress.boxes);
}

function stockOf(sku) {
  return progress.pallets
    .filter((p) => p.sku === sku)
    .reduce((sum, p) => sum + p.units, 0);
}

function freeSlots() {
  const room = roomOf(progress.room);
  const booked = progress.pallets.length + (progress.incoming || []).length;
  return room ? Math.max(0, room.slots - booked) : 0;
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
  if (!progress.boxes) progress.boxes = BOX_PACK;
  saveProgress();
  paintHud();
  const chip = document.querySelector(".chip.coin");
  if (chip) chip.classList.add("catch");
  toast("На старт " + START_COINS);
}

function paintRooms() {
  const host = document.getElementById("rooms");
  host.innerHTML = "";
  ROOMS.forEach((room, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    const can = progress.coins >= room.price;
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
  toast(room.name + " твой. Товар — в магазине сбоку.");
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

function paintSlots() {
  const host = document.getElementById("slots");
  host.innerHTML = "";
  const spots = palSpots();
  progress.pallets.forEach((pal, i) => {
    const sku = skuOf(pal.sku);
    const spot = spots[i] || spots[spots.length - 1] || { x: 40, b: 6, s: 1 };
    const stand = document.createElement("div");
    stand.className = "pal-stand";
    stand.style.left = spot.x + "%";
    stand.style.bottom = "calc(" + (spot.b ?? 6) + "% + " + (spot.lift || 0) + "px)";
    stand.style.setProperty("--sc", String(spot.s || 1));
    stand.innerHTML = palMarkup(sku, pal.units) + "<em>" + sku.name + "</em>";
    host.appendChild(stand);
  });
}

function paintJobs() {
  const host = document.getElementById("jobs");
  host.innerHTML = "";
  if (!progress.orders.length) {
    const empty = document.createElement("div");
    empty.className = "job";
    empty.innerHTML = "<b>Заявок нет</b><small>Сначала дождись доставку</small>";
    host.appendChild(empty);
    return;
  }
  progress.orders.forEach((order, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "job";
    btn.style.animationDelay = i * 60 + "ms";
    btn.innerHTML =
      "<b>#" +
      order.id +
      " · " +
      orderTitle(order) +
      "</b><small>+" +
      order.pay +
      "</small>";
    btn.addEventListener("click", () => {
      closeJobs();
      openPack(order.id);
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

function paintShop() {
  const host = document.getElementById("goods");
  if (!host) return;
  host.innerHTML = "";
  SKUS.forEach((sku, i) => {
    const total = sku.cost + DELIVERY_FEE;
    const can = !!progress.room && progress.coins >= total && freeSlots() > 0;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "good" + (can ? " ready" : " poor");
    btn.style.animationDelay = i * 40 + "ms";
    btn.innerHTML =
      palMarkup(sku, PALLET_PACKS) +
      "<span><b>" +
      sku.name +
      "</b><small>едет 1 мин · доставка " +
      DELIVERY_FEE +
      "</small></span><em>" +
      total +
      "</em>";
    btn.addEventListener("click", () => orderGood(sku.id, btn));
    host.appendChild(btn);
  });
  const canBox = progress.coins >= BOX_COST;
  const box = document.createElement("button");
  box.type = "button";
  box.className = "good boxes" + (canBox ? " ready" : " poor");
  box.innerHTML =
    "<div class=\"box-draw\"><i></i><i></i><i></i></div><span><b>Коробки</b><small>" +
    BOX_PACK +
    " шт в пачке</small></span><em>" +
    BOX_COST +
    "</em>";
  box.addEventListener("click", () => buyBoxes(box));
  host.appendChild(box);
}

function openShop() {
  closeJobs();
  paintShop();
  document.getElementById("shop").classList.add("show");
}

function openJobs() {
  closeShop();
  paintJobs();
  document.getElementById("jobs-pane").classList.add("show");
}

function nearestReady() {
  const list = progress.incoming || [];
  if (!list.length) return 0;
  return Math.min.apply(null, list.map((item) => item.readyAt));
}

function paintTruck() {
  const btn = document.getElementById("truck");
  if (!btn) return;
  const list = progress.incoming || [];
  const on = list.length > 0 && floor.classList.contains("show");
  btn.classList.toggle("show", on);
  if (!on) {
    closeShip();
    return;
  }
  document.getElementById("truck-eta").textContent = fmtEta(nearestReady() - Date.now());
  refreshShipTimes();
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
      "</b><small>поддон · " +
      packsWord(PALLET_PACKS) +
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
  const due = (progress.incoming || []).filter((item) => item.readyAt <= now);
  if (!due.length) return [];
  const arrived = [];
  progress.incoming = (progress.incoming || []).filter((item) => item.readyAt > now);
  due.forEach((item) => {
    const room = roomOf(progress.room);
    const cap = room ? room.slots : 0;
    if (progress.pallets.length >= cap) {
      progress.incoming.push({
        id: item.id,
        sku: item.sku,
        readyAt: now + 5000,
      });
      return;
    }
    progress.pallets.push({
      id: progress.nextPallet,
      sku: item.sku,
      units: PALLET_PACKS,
    });
    progress.nextPallet += 1;
    arrived.push(item);
  });
  if (arrived.length || due.length) saveProgress();
  return arrived;
}

function tickShip() {
  const arrived = settleIncoming();
  paintTruck();
  if (!arrived.length) return;
  arrived.forEach((item) => {
    toast("Приехал поддон «" + skuOf(item.sku).name + "»");
  });
  if (document.getElementById("ship-pane").classList.contains("show")) {
    paintShipList();
  }
  if (floor.classList.contains("show")) {
    paintHud();
    paintSlots();
    maybeOrders();
    paintJobs();
    paintShop();
    const stands = document.querySelectorAll(".floor-pals .pal-stand");
    arrived.forEach((_, i) => {
      const stand = stands[stands.length - arrived.length + i];
      if (stand) stand.classList.add("drop-in");
    });
  }
}

function mixLines() {
  const inStock = SKUS.map((s) => s.id).filter((id) => stockFree(id) >= 1);
  if (!inStock.length) return null;
  const lines = [];
  if (inStock.length >= 2) {
    const first = inStock[progress.nextOrder % inStock.length];
    const second = inStock[(progress.nextOrder + 1) % inStock.length];
    if (first === second) return null;
    lines.push({ sku: first, need: 1, fill: 0 });
    lines.push({ sku: second, need: 1, fill: 0 });
    if (inStock.length >= 3 && progress.nextOrder % 3 === 0) {
      const third = inStock[(progress.nextOrder + 2) % inStock.length];
      if (third !== first && third !== second) {
        lines.push({ sku: third, need: 1, fill: 0 });
      }
    }
    return lines;
  }
  const extra = SKUS.find((s) => s.id !== inStock[0]);
  if (!extra) return null;
  lines.push({ sku: inStock[0], need: 1, fill: 0 });
  lines.push({ sku: extra.id, need: 1, fill: 0 });
  return lines;
}

function maybeOrders() {
  if (!progress.pallets.some((p) => p.units > 0)) return;
  while (progress.orders.length < 2) {
    const lines = mixLines();
    if (!lines || lines.length < 2) break;
    progress.orders.push({
      id: progress.nextOrder,
      lines: lines,
      pay: lines.reduce((sum, line) => sum + line.need * PACK_PAY, 0),
    });
    progress.nextOrder += 1;
  }
  saveProgress();
}

function openFloor() {
  const room = roomOf(progress.room);
  document.getElementById("yard-name").textContent = room ? room.name : "Склад";
  applyInside();
  maybeOrders();
  paintHud();
  paintSlots();
  paintJobs();
  paintShop();
  showScreen(floor);
  paintTruck();
}

function orderGood(skuId, btn) {
  const sku = skuOf(skuId);
  const total = sku.cost + DELIVERY_FEE;
  if (!progress.room) {
    closeShop();
    showScreen(rent);
    return;
  }
  if (!freeSlots()) {
    shake(btn);
    const room = roomOf(progress.room);
    toast("В гараже только " + (room ? room.slots : 5) + " поддонов");
    return;
  }
  if (progress.coins < total) {
    shake(btn);
    toast("Не хватает на товар и доставку");
    return;
  }
  progress.coins -= total;
  progress.incoming.push({
    id: progress.nextShip,
    sku: sku.id,
    readyAt: Date.now() + DELIVERY_MS,
  });
  progress.nextShip += 1;
  saveProgress();
  paintHud();
  paintShop();
  paintTruck();
  document.querySelector(".chip.coin").classList.add("catch");
  toast("Заказал «" + sku.name + "». Едет минуту.");
}

function resetProgress() {
  if (!window.confirm("Сбросить весь прогресс?")) return;
  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem("sklad-progress-v1");
  localStorage.removeItem("sklad-progress-v2");
  const fresh = emptyProgress();
  Object.keys(progress).forEach((key) => {
    delete progress[key];
  });
  Object.assign(progress, fresh);
  saveProgress();
  paintHud();
  showScreen(boot);
  toast("Начинаешь заново");
}

function buyBoxes(btn) {
  if (progress.coins < BOX_COST) {
    shake(btn);
    toast("Не хватает на коробки");
    return;
  }
  progress.coins -= BOX_COST;
  progress.boxes += BOX_PACK;
  saveProgress();
  paintHud();
  paintShop();
  document.querySelector(".chip.box").classList.add("catch");
  toast("+" + BOX_PACK + " коробок");
}

function openPack(id) {
  const order = progress.orders.find((o) => o.id === id);
  if (!order) return;
  state.packId = id;
  const own = progress.pallets.find((p) => stillNeed(order, p.sku) && p.units > 0);
  state.pickId = own ? own.id : 0;
  paintPack();
  showScreen(pack);
}

function paintPack() {
  const order = progress.orders.find((o) => o.id === state.packId);
  if (!order) {
    openFloor();
    return;
  }
  document.getElementById("pack-id").textContent = "#" + order.id;
  document.getElementById("pack-title").textContent = orderTitle(order);
  document.getElementById("pack-pay").textContent = "+" + order.pay;
  const crate = document.getElementById("crate");
  crate.innerHTML = "";
  (order.lines || []).forEach((line) => {
    const sku = skuOf(line.sku);
    for (let i = 0; i < line.need; i += 1) {
      const cell = document.createElement("i");
      cell.className = "cell" + (i < line.fill ? " on" : "");
      cell.style.setProperty("--sku", sku.tone);
      cell.style.setProperty("--liq", sku.liq || sku.tone);
      cell.style.setProperty("--cap", sku.cap || sku.tone);
      cell.style.setProperty("--paper", sku.paper || "#efe6d4");
      cell.style.setProperty("--ink", sku.ink || "#2c3438");
      if (i < line.fill) cell.innerHTML = "<span class=\"pak\">" + pakInner(sku) + "</span>";
      crate.appendChild(cell);
    }
  });
  const hint = document.getElementById("pack-hint");
  if (orderDone(order)) hint.textContent = "Собрано. Сейчас уедет.";
  else if (!progress.boxes) hint.textContent = "Коробки — в магазине сбоку";
  else hint.textContent = "Клади разные паки в заявку";
  const picks = document.getElementById("picks");
  picks.innerHTML = "";
  progress.pallets.forEach((pal) => {
    const s = skuOf(pal.sku);
    const fit = stillNeed(order, pal.sku) && pal.units > 0;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pick" + (state.pickId === pal.id ? " on" : "") + (fit ? "" : " dim");
    btn.innerHTML = palMarkup(s, pal.units) + "<b>" + s.name + "</b><small>" + packsWord(pal.units) + "</small>";
    btn.addEventListener("click", () => {
      if (!fit) {
        shake(btn);
        toast("Этот пак в заявку не нужен");
        return;
      }
      state.pickId = pal.id;
      putOne();
    });
    picks.appendChild(btn);
  });
}

async function putOne() {
  if (state.busy) return;
  const order = progress.orders.find((o) => o.id === state.packId);
  const pal = progress.pallets.find((p) => p.id === state.pickId);
  if (!order || !pal) return;
  if (orderDone(order)) return;
  const line = nextLineFor(order, pal.sku);
  if (!line || pal.units < 1) {
    shake(document.getElementById("picks"));
    toast("Этот пак в заявку не нужен");
    return;
  }
  if (!progress.boxes) {
    shake(document.getElementById("pack"));
    toast("Нужны коробки");
    return;
  }
  state.busy = true;
  pal.units -= 1;
  progress.boxes -= 1;
  line.fill += 1;
  if (!pal.units) {
    progress.pallets = progress.pallets.filter((p) => p.id !== pal.id);
    if (state.pickId === pal.id) state.pickId = 0;
  }
  saveProgress();
  paintHud();
  paintSlots();
  paintPack();
  if (orderDone(order)) {
    await wait(380);
    progress.coins += order.pay;
    progress.orders = progress.orders.filter((o) => o.id !== order.id);
    saveProgress();
    paintHud();
    document.querySelector(".chip.coin").classList.add("catch");
    toast("Заявка #" + order.id + " ушла. +" + order.pay);
    await wait(420);
    state.busy = false;
    openFloor();
    return;
  }
  state.busy = false;
}

function goPlay() {
  paintHud();
  if (!progress.gifted) giftStart();
  if (!progress.room) {
    paintRooms();
    showScreen(rent);
    return;
  }
  openFloor();
}

function goBack() {
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
document.getElementById("boot-reset").addEventListener("click", resetProgress);
document.getElementById("rent-back").addEventListener("click", () => showScreen(boot));
document.getElementById("btn-back").addEventListener("click", goBack);
document.getElementById("shop-tab").addEventListener("click", openShop);
document.getElementById("shop-close").addEventListener("click", closeShop);
document.getElementById("shop").addEventListener("click", (e) => {
  if (e.target.id === "shop") closeShop();
});
document.getElementById("jobs-tab").addEventListener("click", openJobs);
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
window.setInterval(tickShip, 250);

seedDust();
paintHud();
showScreen(boot);
