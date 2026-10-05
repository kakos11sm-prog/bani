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
      ? raw.orders.map((o) => normalizeOrder(o)).filter((o) => o.id && o.lines.length)
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
const state = { packId: 0, pickId: 0, shipId: 0, busy: false, drag: null, cart: { pals: [], boxes: 0 } };

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

function skuOnFloor(sku) {
  return progress.pallets.some((p) => p.sku === sku && p.units > 0);
}

function orderPossible(order) {
  return (order.lines || []).every((line) => {
    if (line.fill >= line.need) return true;
    return skuOnFloor(line.sku);
  });
}

function pruneOrders() {
  const keep = (progress.orders || []).filter(orderPossible);
  if (keep.length !== progress.orders.length) {
    progress.orders = keep;
    saveProgress();
  }
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

function palWood() {
  return (
    "<div class=\"pal-wood\">" +
    "<div class=\"pal-boards\"><i></i><i></i><i></i><i></i><i></i></div>" +
    "<div class=\"pal-stringers\"><i></i><i></i><i></i></div>" +
    "<div class=\"pal-base\"><i></i><i></i><i></i></div>" +
    "</div>"
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
    "\" style=\"" +
    palSkin(sku) +
    "\">" +
    "<div class=\"pal-load\">" +
    load +
    "</div>" +
    palWood() +
    "</div>"
  );
}

function mixPalMarkup(skuIds) {
  const list = (skuIds || []).slice(0, PALLET_PACKS);
  const start = PALLET_PACKS - list.length;
  let load = "";
  for (let row = 0; row < 3; row += 1) {
    const vacant = row * 2 + 1 < start;
    load += "<span class=\"pak-layer" + (vacant ? " vacant" : "") + "\">";
    for (let col = 0; col < 2; col += 1) {
      const slot = row * 2 + col;
      const sku = slot >= start ? skuOf(list[slot - start]) : null;
      load += sku
        ? "<span class=\"pak\" style=\"" + palSkin(sku) + "\">" + pakInner(sku) + "</span>"
        : "<span class=\"pak empty\"></span>";
    }
    load += "</span>";
  }
  return (
    "<div class=\"pal-live\">" +
    "<div class=\"pal-load\">" +
    load +
    "</div>" +
    palWood() +
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
  return !!(order && pal && pal.units > 0 && stillNeed(order, pal.sku));
}

function paintSlots() {
  const host = document.getElementById("slots");
  host.innerHTML = "";
  const spots = palSpots();
  progress.pallets.forEach((pal, i) => {
    const sku = skuOf(pal.sku);
    const spot = spots[i] || spots[spots.length - 1] || { x: 40, b: 6, s: 1 };
    const stand = document.createElement("div");
    const take = state.shipId && canTakePal(pal);
    stand.className = "pal-stand" + (state.shipId ? (take ? " can-take" : " no-take") : "");
    stand.dataset.id = String(pal.id);
    if (progress.room !== "garage") {
      stand.style.left = spot.x + "%";
      stand.style.bottom = "calc(" + (spot.b ?? 6) + "% + " + (spot.lift || 0) + "px)";
    }
    stand.style.setProperty("--sc", String(spot.s || 1));
    stand.innerHTML = palMarkup(sku, pal.units) + "<em>" + sku.name + "</em>";
    if (state.shipId) {
      stand.addEventListener("pointerdown", (e) => startDrag(e, pal.id));
    }
    host.appendChild(stand);
  });
}

function paintWaybill() {
  const sheet = document.getElementById("waybill");
  if (!sheet) return;
  const order = currentOrder();
  if (!order) {
    sheet.classList.remove("show");
    return;
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
}

function paintLoad() {
  const bay = document.getElementById("load-bay");
  const host = document.getElementById("load-pal");
  if (!bay || !host) return;
  const order = currentOrder();
  if (!order) {
    bay.classList.remove("show");
    host.innerHTML = "";
    return;
  }
  bay.classList.add("show");
  host.innerHTML = mixPalMarkup(shipPacks(order));
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
  return pals + state.cart.boxes * BOX_COST;
}

function canAddPal(sku) {
  return (
    !!progress.room &&
    state.cart.pals.length < freeSlots() &&
    progress.coins >= cartTotal() + sku.cost + DELIVERY_FEE
  );
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
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.sku = sku.id;
    btn.className = "good" + (n ? " ready" : canAddPal(sku) ? "" : " poor");
    btn.innerHTML =
      "<div class=\"shop-stand\">" +
      palMarkup(sku, PALLET_PACKS) +
      "</div><span class=\"good-meta\"><b>" +
      sku.name +
      "</b><em>" +
      sku.cost +
      "</em></span>";
    if (n) setQty(btn, n);
    btn.addEventListener("click", () => addPalToCart(sku.id, btn));
    host.appendChild(btn);
  });
  const box = document.createElement("button");
  box.type = "button";
  box.dataset.sku = "boxes";
  box.className =
    "good boxes" + (state.cart.boxes ? " ready" : progress.coins >= cartTotal() + BOX_COST ? "" : " poor");
  box.innerHTML =
    "<div class=\"box-draw\"><i></i><i></i><i></i></div><span><b>Коробки</b><small>" +
    BOX_PACK +
    " шт в пачке</small></span><em>" +
    BOX_COST +
    "</em>";
  if (state.cart.boxes) setQty(box, state.cart.boxes);
  box.addEventListener("click", () => addBoxToCart(box));
  host.appendChild(box);
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
    btn.className = "good" + (n ? " ready" : canAddPal(sku) ? "" : " poor");
    setQty(btn, n);
  });
  const box = host.querySelector('.good[data-sku="boxes"]');
  if (box) {
    box.className =
      "good boxes" + (state.cart.boxes ? " ready" : progress.coins >= cartTotal() + BOX_COST ? "" : " poor");
    setQty(box, state.cart.boxes);
  }
  paintCart();
}

function fillCartLine(row, title, sum) {
  row.innerHTML =
    "<b>" + title + "</b><small>нажми чтобы убрать</small><em>" + sum + "</em>";
}

function cartCount() {
  return state.cart.pals.length + state.cart.boxes;
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
  if (!ids.length && !state.cart.boxes) {
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
  const keep = new Set(ids.concat(state.cart.boxes ? ["boxes"] : []));
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
  if (state.cart.boxes) {
    let row = host.querySelector('.cart-line[data-sku="boxes"]');
    if (!row) {
      row = document.createElement("button");
      row.type = "button";
      row.className = "cart-line";
      row.dataset.sku = "boxes";
      row.addEventListener("click", dropBoxFromCart);
      host.appendChild(row);
    }
    fillCartLine(row, "Коробки ×" + state.cart.boxes, BOX_COST * state.cart.boxes);
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
  if (!progress.room) {
    closeShop();
    showScreen(rent);
    return;
  }
  if (state.cart.pals.length >= freeSlots()) {
    shake(btn);
    toast("В гараже нет места");
    return;
  }
  state.cart.pals.push(skuId);
  syncShop();
}

function addBoxToCart() {
  state.cart.boxes += 1;
  syncShop();
}

function dropPalFromCart(skuId) {
  const i = state.cart.pals.lastIndexOf(skuId);
  if (i >= 0) state.cart.pals.splice(i, 1);
  syncShop();
}

function dropBoxFromCart() {
  if (state.cart.boxes > 0) state.cart.boxes -= 1;
  syncShop();
}

function checkout(btn) {
  const pals = state.cart.pals.slice();
  const boxes = state.cart.boxes;
  if (!pals.length && !boxes) {
    shake(btn);
    toast("Корзина пустая");
    return;
  }
  if (!progress.room) {
    closeShop();
    showScreen(rent);
    return;
  }
  if (pals.length > freeSlots()) {
    shake(btn);
    toast("В гараже нет места");
    return;
  }
  const total = cartTotal();
  if (progress.coins < total) {
    shake(btn);
    toast("Не хватает денег");
    return;
  }
  progress.coins -= total;
  pals.forEach((skuId) => {
    progress.incoming.push({
      id: progress.nextShip,
      sku: skuId,
      readyAt: Date.now() + DELIVERY_MS,
    });
    progress.nextShip += 1;
  });
  if (boxes) progress.boxes += boxes * BOX_PACK;
  state.cart.pals = [];
  state.cart.boxes = 0;
  document.getElementById("cart").classList.remove("open");
  saveProgress();
  paintHud();
  syncShop();
  paintTruck();
  document.querySelector(".chip.coin").classList.add("catch");
  if (boxes) document.querySelector(".chip.box").classList.add("catch");
  if (pals.length) toast("Заказал. Едет минуту.");
  else toast("+" + boxes * BOX_PACK + " коробок");
}

function openShop() {
  closeJobs();
  closeShip();
  if (document.querySelector("#goods .good")) syncShop();
  else paintShop();
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
    syncShop();
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
  if (inStock.length === 1) {
    const need = Math.max(1, Math.min(stockFree(inStock[0]), 1 + (progress.nextOrder % 2)));
    return [{ sku: inStock[0], need: need, fill: 0 }];
  }
  const first = inStock[progress.nextOrder % inStock.length];
  const second = inStock[(progress.nextOrder + 1) % inStock.length];
  if (first === second) return [{ sku: first, need: 1, fill: 0 }];
  const lines = [
    { sku: first, need: 1, fill: 0 },
    { sku: second, need: 1, fill: 0 },
  ];
  if (inStock.length >= 3 && progress.nextOrder % 3 === 0) {
    const third = inStock[(progress.nextOrder + 2) % inStock.length];
    if (third !== first && third !== second) {
      lines.push({ sku: third, need: 1, fill: 0 });
    }
  }
  return lines;
}

function maybeOrders() {
  pruneOrders();
  if (!progress.pallets.some((p) => p.units > 0)) return;
  while (progress.orders.length < 2) {
    const lines = mixLines();
    if (!lines || !lines.length) break;
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
  if (state.shipId) {
    paintWaybill();
    paintLoad();
  }
  paintTruck();
}

function clearCart() {
  state.cart.pals = [];
  state.cart.boxes = 0;
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
  document.body.classList.add("shipping");
  document.body.classList.remove("loading", "gone");
  const bay = document.getElementById("load-bay");
  if (bay) bay.classList.remove("into-truck", "away");
  paintWaybill();
  paintLoad();
  paintSlots();
}

function endShip() {
  hideGhost();
  state.shipId = 0;
  state.drag = null;
  document.body.classList.remove("shipping", "loading", "gone");
  const bay = document.getElementById("load-bay");
  if (bay) bay.classList.remove("show", "into-truck", "away");
  const sheet = document.getElementById("waybill");
  if (sheet) sheet.classList.remove("show");
}

function hideGhost() {
  const ghost = document.getElementById("drag-ghost");
  if (!ghost) return;
  ghost.hidden = true;
  ghost.innerHTML = "";
  ghost.style.transition = "";
}

function moveGhost(x, y) {
  const ghost = document.getElementById("drag-ghost");
  if (!ghost) return;
  ghost.style.left = x + "px";
  ghost.style.top = y + "px";
}

function overLoad(x, y) {
  const load = document.getElementById("load-pal");
  if (!load) return false;
  const box = load.getBoundingClientRect();
  return x >= box.left - 12 && x <= box.right + 12 && y >= box.top - 12 && y <= box.bottom + 12;
}

function startDrag(e, palId) {
  if (state.busy || state.drag) return;
  const pal = progress.pallets.find((p) => p.id === palId);
  if (!canTakePal(pal)) {
    shake(e.currentTarget);
    toast("Этот пак в заявку не нужен");
    return;
  }
  e.preventDefault();
  if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId);
  const sku = skuOf(pal.sku);
  state.drag = { palId: pal.id, sku: pal.sku };
  const ghost = document.getElementById("drag-ghost");
  ghost.hidden = false;
  ghost.style.cssText = palSkin(sku);
  ghost.innerHTML = "<span class=\"pak\">" + pakInner(sku) + "</span>";
  moveGhost(e.clientX, e.clientY);
  window.addEventListener("pointermove", onDragMove);
  window.addEventListener("pointerup", onDragEnd);
}

function onDragMove(e) {
  if (!state.drag) return;
  moveGhost(e.clientX, e.clientY);
  document.getElementById("load-bay").classList.toggle("hot", overLoad(e.clientX, e.clientY));
}

async function onDragEnd(e) {
  window.removeEventListener("pointermove", onDragMove);
  window.removeEventListener("pointerup", onDragEnd);
  const drag = state.drag;
  state.drag = null;
  const bay = document.getElementById("load-bay");
  if (bay) bay.classList.remove("hot");
  if (!drag) {
    hideGhost();
    return;
  }
  if (!overLoad(e.clientX, e.clientY)) {
    hideGhost();
    return;
  }
  const ghost = document.getElementById("drag-ghost");
  const dest = document.getElementById("load-pal").getBoundingClientRect();
  ghost.style.transition = "left 0.22s ease, top 0.22s ease";
  moveGhost(dest.left + dest.width / 2, dest.top + dest.height / 2);
  await wait(220);
  hideGhost();
  await takePack(drag.palId);
}

async function takePack(palId) {
  if (state.busy) return;
  const order = currentOrder();
  const pal = progress.pallets.find((p) => p.id === palId);
  if (!order || !pal) return;
  const line = nextLineFor(order, pal.sku);
  if (!line || pal.units < 1) {
    toast("Этот пак в заявку не нужен");
    return;
  }
  pal.units -= 1;
  line.fill += 1;
  if (!pal.units) progress.pallets = progress.pallets.filter((p) => p.id !== pal.id);
  saveProgress();
  paintHud();
  paintSlots();
  paintWaybill();
  paintLoad();
  if (orderDone(order)) await finishShip(order);
}

async function finishShip(order) {
  state.busy = true;
  document.body.classList.add("loading");
  await wait(420);
  const bay = document.getElementById("load-bay");
  if (bay) bay.classList.add("into-truck");
  await wait(620);
  document.body.classList.add("gone");
  if (bay) bay.classList.add("away");
  await wait(520);
  progress.coins += order.pay;
  progress.orders = progress.orders.filter((o) => o.id !== order.id);
  endShip();
  saveProgress();
  paintHud();
  paintSlots();
  maybeOrders();
  paintJobs();
  document.querySelector(".chip.coin").classList.add("catch");
  toast("Заявка #" + order.id + " ушла. +" + order.pay);
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
