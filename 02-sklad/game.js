const SAVE_KEY = "sklad-progress-v3";
const START_COINS = 1200;
const PALLET_PACKS = 6;
const BOX_COST = 80;
const BOX_PACK = 8;
const PACK_PAY = 150;
const SKUS = [
  { id: "water", name: "Вода", tone: "#4aa3d9", liq: "#8ec8e8", cost: 320 },
  { id: "cola", name: "Кола", tone: "#c43a2a", liq: "#3d1a12", cost: 480 },
  { id: "lemon", name: "Лимонад", tone: "#d4c04a", liq: "#e8dc6a", cost: 450 },
  { id: "orange", name: "Апельсин", tone: "#e07a3a", liq: "#f0a040", cost: 460 },
  { id: "grape", name: "Виноград", tone: "#7b4aa8", liq: "#5a2888", cost: 500 },
  { id: "cherry", name: "Вишня", tone: "#c43a4a", liq: "#8a1020", cost: 520 },
];
const ROOMS = [
  { id: "garage", name: "Гараж", slots: 5, price: 800, pic: "room-garage.jpg", inside: "inside-garage.jpg" },
  { id: "hangar", name: "Ангар", slots: 8, price: 2400, pic: "room-hangar.jpg", inside: "" },
  { id: "depot", name: "Склад", slots: 12, price: 6200, pic: "room-depot.jpg", inside: "" },
];
const GARAGE_SPOTS = [
  { x: 6, y: 20 },
  { x: 38, y: 8 },
  { x: 70, y: 20 },
  { x: 16, y: 58 },
  { x: 54, y: 58 },
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
    nextOrder: 1,
    nextPallet: 1,
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
    base.gifted = raw.gifted === true;
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
      ? raw.orders
          .map((o) => ({
            id: Number(o.id) || 0,
            sku: SKUS.some((s) => s.id === o.sku) ? o.sku : "water",
            need: Math.max(1, Number(o.need) || 1),
            fill: Math.max(0, Number(o.fill) || 0),
            pay: Math.max(1, Number(o.pay) || PACK_PAY),
          }))
          .filter((o) => o.id)
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

function packsWord(n) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return n + " пак";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return n + " пака";
  return n + " паков";
}

function bak() {
  return "<span class=\"bak\"><i class=\"cap\"></i><i class=\"neck\"></i><i class=\"body\"></i></span>";
}

function pakInner() {
  return (
    "<span class=\"pak-row back\">" +
    bak() +
    bak() +
    bak() +
    "</span>" +
    "<span class=\"pak-row front\">" +
    bak() +
    bak() +
    bak() +
    "</span>" +
    "<span class=\"pak-film\"></span>" +
    "<span class=\"pak-tray\"></span>"
  );
}

function palMarkup(sku, packs) {
  const n = Math.max(0, Math.min(PALLET_PACKS, Number(packs) || 0));
  let load = "";
  for (let i = 0; i < n; i += 1) {
    load += "<span class=\"pak\">" + pakInner() + "</span>";
  }
  return (
    "<div class=\"pal-live sku-" +
    sku.id +
    "\" style=\"--sku:" +
    sku.tone +
    ";--liq:" +
    (sku.liq || sku.tone) +
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
      y: 10 + row * 28,
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

function showScreen(el) {
  closeShop();
  [boot, rent, floor, pack].forEach((node) => node.classList.toggle("show", node === el));
  document.body.classList.toggle("home", el === boot);
  document.body.classList.toggle("on-floor", el === floor);
  if (el !== floor) {
    document.body.classList.remove("in-garage", "in-hangar", "in-depot");
  }
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
  return room ? Math.max(0, room.slots - progress.pallets.length) : 0;
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
    const spot = spots[i] || spots[spots.length - 1] || { x: 40, y: 40 };
    const stand = document.createElement("div");
    stand.className = "pal-stand";
    stand.style.left = spot.x + "%";
    stand.style.top = spot.y + "%";
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
    empty.innerHTML = "<b>Заявок нет</b><small>Открой магазин сбоку</small>";
    host.appendChild(empty);
    return;
  }
  progress.orders.forEach((order, i) => {
    const sku = skuOf(order.sku);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "job";
    btn.style.animationDelay = i * 60 + "ms";
    btn.innerHTML =
      "<b>#" +
      order.id +
      " · " +
      sku.name +
      " · " +
      packsWord(order.need) +
      "</b><small>+" +
      order.pay +
      "</small>";
    btn.addEventListener("click", () => openPack(order.id));
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
    const can = !!progress.room && progress.coins >= sku.cost && freeSlots() > 0;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "good" + (can ? " ready" : " poor");
    btn.style.animationDelay = i * 40 + "ms";
    btn.innerHTML =
      palMarkup(sku, PALLET_PACKS) +
      "<span><b>" +
      sku.name +
      "</b><small>поддон · " +
      packsWord(PALLET_PACKS) +
      "</small></span><em>" +
      sku.cost +
      "</em>";
    btn.addEventListener("click", () => buyGood(sku.id, btn));
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
  paintShop();
  document.getElementById("shop").classList.add("show");
}

function maybeOrders() {
  if (!progress.pallets.some((p) => p.units > 0)) return;
  while (progress.orders.length < 2) {
    const ripe = progress.pallets.filter((p) => p.units >= 2);
    const src = ripe[0] || progress.pallets.find((p) => p.units > 0);
    if (!src) break;
    const reserved = progress.orders
      .filter((o) => o.sku === src.sku)
      .reduce((sum, o) => sum + (o.need - o.fill), 0);
    const left = src.units - reserved;
    if (left < 1) break;
    const need = Math.max(1, Math.min(left, 1 + (progress.nextOrder % 2)));
    progress.orders.push({
      id: progress.nextOrder,
      sku: src.sku,
      need: need,
      fill: 0,
      pay: need * PACK_PAY,
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
}

function buyGood(skuId, btn) {
  const sku = skuOf(skuId);
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
  if (progress.coins < sku.cost) {
    shake(btn);
    toast("Не хватает на «" + sku.name + "»");
    return;
  }
  progress.coins -= sku.cost;
  progress.pallets.push({ id: progress.nextPallet, sku: sku.id, units: PALLET_PACKS });
  progress.nextPallet += 1;
  saveProgress();
  paintHud();
  paintSlots();
  paintShop();
  maybeOrders();
  paintJobs();
  const last = document.querySelector(".floor-pals .pal-stand:last-child");
  if (last) last.classList.add("drop-in");
  document.querySelector(".chip.coin").classList.add("catch");
  toast("Поддон с паками «" + sku.name + "» на полу");
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
  const own = progress.pallets.find((p) => p.sku === order.sku && p.units > 0);
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
  const sku = skuOf(order.sku);
  document.getElementById("pack-id").textContent = "#" + order.id;
  document.getElementById("pack-title").textContent = sku.name + " · " + packsWord(order.need);
  document.getElementById("pack-pay").textContent = "+" + order.pay;
  const crate = document.getElementById("crate");
  crate.innerHTML = "";
  for (let i = 0; i < order.need; i += 1) {
    const cell = document.createElement("i");
    cell.className = "cell" + (i < order.fill ? " on" : "");
    cell.style.setProperty("--sku", sku.tone);
    cell.style.setProperty("--liq", sku.liq || sku.tone);
    if (i < order.fill) cell.innerHTML = "<span class=\"pak\">" + pakInner() + "</span>";
    crate.appendChild(cell);
  }
  const hint = document.getElementById("pack-hint");
  if (order.fill >= order.need) hint.textContent = "Собрано. Сейчас уедет.";
  else if (!progress.boxes) hint.textContent = "Коробки — в магазине сбоку";
  else hint.textContent = "Клади пак с поддона в заявку";
  const picks = document.getElementById("picks");
  picks.innerHTML = "";
  progress.pallets.forEach((pal) => {
    const s = skuOf(pal.sku);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      "pick" +
      (state.pickId === pal.id ? " on" : "") +
      (pal.sku !== order.sku || !pal.units ? " dim" : "");
    btn.innerHTML = palMarkup(s, pal.units) + "<b>" + s.name + "</b><small>" + packsWord(pal.units) + "</small>";
    btn.addEventListener("click", () => {
      if (pal.sku !== order.sku || !pal.units) {
        shake(btn);
        toast("Этот поддон не подходит");
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
  if (order.fill >= order.need) return;
  if (pal.sku !== order.sku || pal.units < 1) {
    shake(document.getElementById("picks"));
    toast("На поддоне нет паков");
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
  order.fill += 1;
  if (!pal.units) {
    progress.pallets = progress.pallets.filter((p) => p.id !== pal.id);
    if (state.pickId === pal.id) state.pickId = 0;
  }
  saveProgress();
  paintHud();
  paintSlots();
  paintPack();
  if (order.fill >= order.need) {
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
document.getElementById("pack-close").addEventListener("click", openFloor);

seedDust();
paintHud();
showScreen(boot);
