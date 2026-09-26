import "@fontsource-variable/dm-sans";
import "@fontsource-variable/manrope";
import "./style.css";
import {
  themes,
  sectors,
  sectorIndex,
  claimSector,
  buyAll,
  abilityAvailable,
  roles,
  trials,
  chooseRole,
  toggleArtifact,
  startTrial,
  finishTrial,
  automationUnlocked,
  passiveActions,
  canBuild,
  learn,
  explore,
  worldPrice,
  worldAbilities,
  worldAbility,
  units,
  research,
  worlds,
  relics,
  relicPrice,
  relicUnlocked,
  buyRelic,
  challenges,
  claimChallenge,
  recordMilestones,
  activeProduction,
  harvest as harvestEnergy,
  activateBoost,
  boostMultiplier,
  cometAvailable,
  catchComet,
  advance,
  echoReward,
  ascend,
  parseSave,
  load,
  save,
  clickPower,
  price,
  buy,
  format,
  ascensionReward,
  nextStardustAt,
  balance,
  unitOutput,
  maxAffordable,
  BUY_MAX,
  readyRewards,
  resetAll,
  production,
  type State,
} from "./game";
import { expeditionMarkup } from "./expedition";
import type { createScene } from "./scene";

const OFFLINE_CAP = 8 * 3600000;
const loaded = load();
let state: State = loaded.state,
  tab = "structures",
  quantity = 1;
const awayMs = Math.max(0, Date.now() - state.savedAt);
const offline = advance(state, state.savedAt, Date.now());
const $ = <T extends HTMLElement = HTMLElement>(s: string) =>
  document.querySelector<T>(s)!;
const setText = (el: HTMLElement, value: string) => {
  if (el.textContent !== value) el.textContent = value;
};
const setDisabled = (el: HTMLButtonElement, value: boolean) => {
  if (el.disabled !== value) el.disabled = value;
};
/** Compact human duration: 45s, 3m 20s, 2h 5m, 3d 4h. */
function duration(seconds: number) {
  if (!Number.isFinite(seconds)) return "a long while";
  const s = Math.max(1, Math.ceil(seconds));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
  if (s < 86400)
    return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
  return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`;
}
const eta = (cost: number, rate: number) =>
  rate > 0 ? `in ${duration((cost - state.energy) / rate)}` : "keep harvesting";
const pct = (stardust: number) =>
  format(Math.round(stardust * balance.stardustBonus * 100)) + "%";

$("#app").innerHTML = `
<header class="topbar"><a class="brand" href="./" aria-label="Aether Forge home"><span class="brand-icon">✧</span><span>AETHER<span class="brand-light">FORGE</span><small>AN IDLE ODYSSEY</small></span></a><div class="sector"><span class="live-dot"></span> SOLO EXPEDITION <span class="divider">/</span> <span id="sector-name">THE CRADLE</span></div><div class="top-actions"><span id="save-status">✓ Progress saved</span><button id="sound" class="icon-button" aria-label="Toggle sound" title="Toggle sound">♫</button><button id="settings" class="icon-button" aria-label="Settings" title="Settings">⚙</button></div></header>
<div class="mobile-hud"><span class="hud-energy">✧ <strong id="hud-energy">0</strong></span><span class="hud-rate"><strong id="hud-rate">0</strong> / sec</span><button id="hud-harvest" aria-label="Harvest aether">✧ Harvest</button></div>
<main><section class="world-panel"><div class="world-top"><span class="eyebrow">YOUR LITTLE CORNER OF THE UNIVERSE</span><span class="world-badge">◈ <span id="world-number">WORLD 01</span></span></div><div class="world-heading"><h1 id="world-name"></h1><p id="world-description"></p></div><div class="scene-container"><div class="scene-halo"></div><canvas id="world-canvas" tabindex="0" role="button" aria-label="Harvest aether from the crystal. Press Enter or Space."></canvas><div class="scene-caption"><span class="live-dot"></span> <span id="world-type"></span><span class="coordinates">07.24° N &nbsp; 38.91° E</span></div><div class="floating-label"><span>✧</span> <span>CORE STATUS<small id="core-status">Resonating</small></span></div><div id="particles"></div></div><div id="base-status" class="base-status"></div><div class="harvest-area"><span class="eyebrow">A SMALL TOUCH. AN INFINITE POSSIBILITY.</span><button id="harvest"><span>✧</span> Harvest aether <span id="click-value">+1</span></button><div class="harvest-hint"><span class="hint-keys">Click the crystal or press <kbd>Space</kbd> · <kbd>O</kbd> overdrive · <kbd>C</kbd> comet · <kbd>W</kbd> world power</span><span class="hint-touch">Tap the crystal or the button to harvest</span></div></div><div class="active-systems"><button id="overdrive" class="ability-button"><span>⚡ Core overdrive</span><small id="boost-status"></small><div class="progress-track"><div id="charge-progress"></div></div></button><button id="comet" class="ability-button comet-button"><span>✦ Comet scanner</span><small id="comet-status"></small></button></div><button id="world-ability" class="ability-button world-ability"><span id="ability-name"></span><small id="ability-status"></small></button><div class="mechanic-panel"><p id="mechanic-detail"></p><strong id="mechanic-value"></strong></div><div id="run-banner" class="run-banner"></div><div class="journey-card"><div class="journey-icon">⌁</div><div class="journey-content"><div class="journey-title"><span id="goal-title"></span><span id="goal-percent"></span></div><div class="progress-track"><div id="goal-progress"></div></div><p id="goal-description"></p></div><span class="journey-arrow">↗</span></div><footer class="world-footer"><span>✦ &nbsp; THE UNIVERSE STARTS WITH YOU.</span><span>v5.0 <span class="live-dot"></span></span></footer></section>
<section class="control-panel"><div class="resource-card"><div class="resource-label"><span>✧ &nbsp; AETHER RESERVE</span><span class="pill">LIVE</span></div><div class="energy-number" id="energy">0</div><div class="resource-bottom"><span><i class="live-dot"></i><strong id="rate">0</strong> / second</span><span id="multiplier">1× world bonus</span></div><svg class="sparkline" viewBox="0 0 500 45" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="fade" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#8de0b7" stop-opacity=".12"/><stop offset="1" stop-color="#8de0b7" stop-opacity="0"/></linearGradient></defs><path d="M0 40L40 37L70 40L105 31L145 34L180 23L210 27L245 18L270 24L300 13L340 18L370 8L410 12L450 3L480 8L500 0V45H0Z" fill="url(#fade)"/><path d="M0 40L40 37L70 40L105 31L145 34L180 23L210 27L245 18L270 24L300 13L340 18L370 8L410 12L450 3L480 8L500 0" fill="none" stroke="#7aba9b" stroke-opacity=".4" stroke-width="1.4"/></svg></div><nav class="tabs" aria-label="Upgrade categories"><button data-tab="structures" class="active">Structures <span id="structure-count">0</span></button><button data-tab="research">Research <span id="research-count">0/${research.length}</span></button><button data-tab="worlds">Worlds <span id="world-count">1/${worlds.length}</span></button><button data-tab="legacy">Legacy <span id="legacy-ready">∞</span></button><button data-tab="expedition">Expedition <span>✦</span></button></nav><div class="legacy-wallet"><span>◈ <strong id="echoes">0</strong> Echoes <small>Permanent currency</small></span><span id="legacy-power"></span></div><div class="section-heading"><div><h2 id="section-title">Build your constellation</h2><p id="section-description">Little by little, extraordinary things happen.</p></div><div class="quantity" aria-label="Purchase quantity"><button data-qty="1" class="active">×1</button><button data-qty="10">×10</button><button data-qty="100">×100</button><button data-qty="max">Max</button></div></div><div id="bulk-controls"><button id="buy-all" class="bulk-button"></button><small id="bulk-hint"></small></div><div id="items"></div><div class="ascend-card"><span class="ascend-icon">✺</span><div><h3>A new beginning awaits</h3><p id="ascend-description">Reach 100K aether to unlock Ascension.</p></div><button id="ascend" aria-label="Ascend">↗</button></div><div class="stats-strip"><span><strong id="total-structures">0</strong> structures built</span><span><strong id="total-earned">0</strong> lifetime aether</span></div></section></main><div id="toast" role="status" aria-live="polite"></div><dialog id="dialog"><div id="dialog-content"></div><button id="close-dialog" class="dialog-close" aria-label="Close dialog">×</button></dialog>`;

/** Elements refreshed on every tick, looked up once. */
const ui = {
  energy: $("#energy"),
  rate: $("#rate"),
  hudEnergy: $("#hud-energy"),
  hudRate: $("#hud-rate"),
  clickValue: $("#click-value"),
  multiplier: $("#multiplier"),
  worldName: $("#world-name"),
  worldDescription: $("#world-description"),
  worldType: $("#world-type"),
  worldNumber: $("#world-number"),
  totalStructures: $("#total-structures"),
  totalEarned: $("#total-earned"),
  structureCount: $("#structure-count"),
  researchCount: $("#research-count"),
  worldCount: $("#world-count"),
  sound: $<HTMLButtonElement>("#sound"),
  harvest: $<HTMLButtonElement>("#harvest"),
  hudHarvest: $<HTMLButtonElement>("#hud-harvest"),
  canvas: $<HTMLCanvasElement>("#world-canvas"),
  abilityName: $("#ability-name"),
  abilityStatus: $("#ability-status"),
  ability: $<HTMLButtonElement>("#world-ability"),
  mechanicDetail: $("#mechanic-detail"),
  mechanicValue: $("#mechanic-value"),
  sectorName: $("#sector-name"),
  baseStatus: $("#base-status"),
  runBanner: $("#run-banner"),
  echoes: $("#echoes"),
  legacyReady: $("#legacy-ready"),
  legacyPower: $("#legacy-power"),
  boostStatus: $("#boost-status"),
  chargeProgress: $("#charge-progress"),
  overdrive: $<HTMLButtonElement>("#overdrive"),
  comet: $<HTMLButtonElement>("#comet"),
  cometStatus: $("#comet-status"),
  coreStatus: $("#core-status"),
  goalTitle: $("#goal-title"),
  goalPercent: $("#goal-percent"),
  goalProgress: $("#goal-progress"),
  goalDescription: $("#goal-description"),
  ascend: $<HTMLButtonElement>("#ascend"),
  ascendDescription: $("#ascend-description"),
  items: $("#items"),
  toast: $("#toast"),
  tabs: [...document.querySelectorAll<HTMLButtonElement>("[data-tab]")],
};

let toastTimer: ReturnType<typeof setTimeout>,
  pinnedUntil = 0;
const queuedToasts: string[] = [];
/** Show a message. Longer (important) messages are never replaced; others queue behind them. */
function toast(message: string, ms = 4000) {
  if (Date.now() < pinnedUntil) {
    if (queuedToasts.length < 3) queuedToasts.push(message);
    return;
  }
  ui.toast.textContent = message;
  ui.toast.classList.add("visible");
  pinnedUntil = ms > 4000 ? Date.now() + ms : 0;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    ui.toast.classList.remove("visible");
    pinnedUntil = 0;
    const next = queuedToasts.shift();
    if (next) setTimeout(() => toast(next), 300);
  }, ms);
}

// The 3D scene is loaded after the interface so the game is playable immediately.
let scene: ReturnType<typeof createScene> | undefined;
function sceneFallback() {
  const container = $(".scene-container");
  if (container.classList.contains("fallback")) return;
  container.classList.add("fallback");
  container.insertAdjacentHTML(
    "beforeend",
    '<div class="fallback-crystal">✧</div>',
  );
  toast("3D is unavailable in this browser. All game features still work.");
}
import("./scene")
  .then(({ createScene }) => {
    scene = createScene(ui.canvas);
    scene.setWorld(worlds[state.world].color, state.world);
    applyTheme();
  })
  .catch(sceneFallback);

let audio: AudioContext | undefined;
function tone(pitch = 440) {
  if (!state.sound) return;
  try {
    audio ??= new AudioContext();
    void audio.resume();
    const oscillator = audio.createOscillator(),
      volume = audio.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
      pitch + Math.random() * 200,
      audio.currentTime,
    );
    volume.gain.setValueAtTime(0.055, audio.currentTime);
    volume.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.35);
    oscillator.connect(volume);
    volume.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.35);
  } catch {
    /* Audio is optional. */
  }
}

let lastHarvest = 0;
function harvest() {
  // Humans top out well below 25 taps a second; this caps key-repeat and macro spam.
  const now = performance.now();
  if (now - lastHarvest < 40) return;
  lastHarvest = now;
  const amount = harvestEnergy(state);
  if (amount <= 0) return;
  scene?.pulse();
  tone();
  const p = document.createElement("span");
  p.className = "harvest-particle";
  p.textContent = "+" + format(amount);
  p.style.left = `${43 + Math.random() * 14}%`;
  $("#particles").append(p);
  setTimeout(() => p.remove(), 1100);
  update();
}
ui.harvest.addEventListener("click", harvest);
ui.hudHarvest.addEventListener("click", harvest);
ui.canvas.addEventListener("click", harvest);
ui.canvas.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (!e.repeat) harvest();
  }
});
document.addEventListener("keydown", (e) => {
  const target = e.target as HTMLElement;
  if (
    dialog.open ||
    e.ctrlKey ||
    e.metaKey ||
    e.altKey ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  )
    return;
  if (e.code === "Space") {
    // Buttons only keep focus when reached by keyboard (see the click handler
    // below), so Space keeps its native meaning there and harvests elsewhere.
    if (target instanceof HTMLButtonElement) return;
    e.preventDefault();
    if (!e.repeat) harvest();
    return;
  }
  if (e.repeat) return;
  const key = e.key.toLowerCase();
  if (key === "o") ui.overdrive.click();
  if (key === "c") ui.comet.click();
  if (key === "w") ui.ability.click();
});

// A mouse or touch click leaves focus on the button, so a later Space press would
// click it again (buying another structure, or reopening a dialog whose opener gets
// focus back when it closes). Drop that focus during capture, before the button's
// own handler runs. Keyboard activation reports detail 0 and keeps focus.
document.addEventListener(
  "click",
  (e) => {
    const button = (e.target as Element).closest?.("button");
    if (e.detail > 0 && button && button === document.activeElement)
      button.blur();
  },
  true,
);

/* ---------- Lists ---------- */

let rows: {
  price: HTMLElement[];
  label: HTMLElement[];
  owned: HTMLElement[];
  rate: HTMLElement[];
  buttons: HTMLButtonElement[];
} = { price: [], label: [], owned: [], rate: [], buttons: [] };
let listSignature = "";

/**
 * Structures reveal two tiers past the best one owned, plus any tier whose first unit
 * this run's earnings could have paid for. Both only grow within a run, so spending
 * never hides a structure again.
 */
function visibleStructures() {
  let owned = -1;
  state.counts.forEach((n, i) => {
    if (n > 0) owned = i;
  });
  let count = Math.max(2, owned + 3);
  units.forEach((_, i) => {
    if (price(state, i) <= state.earned) count = Math.max(count, i + 1);
  });
  return Math.min(units.length, count);
}
/** Research shows the next five discoveries first, then everything already learned. */
function visibleResearch() {
  const all = research.map((_, i) => i);
  const learned = all.filter((i) => state.upgrades.includes(i));
  const upcoming = all.filter((i) => !state.upgrades.includes(i)).slice(0, 5);
  return [...upcoming, ...learned];
}
function currentSignature() {
  if (tab === "structures") return `s${visibleStructures()}`;
  if (tab === "research") return `r${visibleResearch().join(",")}`;
  return tab;
}
const hidden = (count: number, what: string) =>
  count > 0
    ? `<div class="item locked-item" aria-hidden="true"><span class="item-icon">?</span><span class="item-content"><span class="item-title">${count} more ${what}</span><span class="item-description">Keep growing to reveal what lies beyond.</span></span></div>`
    : "";

const rowKeys = ["buy", "research", "world", "relic", "challenge", "sector"];
function renderItems(resetScroll = false) {
  const list = ui.items;
  const savedScroll = resetScroll ? 0 : list.scrollTop;
  // Only keyboard users keep focus inside the list (pointer clicks release it).
  const focused = document.activeElement as HTMLElement | null;
  const focusKey =
    focused && list.contains(focused)
      ? rowKeys.find((k) => focused.dataset[k] !== undefined)
      : undefined;
  const focusValue = focusKey ? focused!.dataset[focusKey] : undefined;
  listSignature = currentSignature();
  $(".quantity").style.visibility = tab === "structures" ? "visible" : "hidden";
  const headings: Record<string, [string, string]> = {
    structures: [
      "Build your constellation",
      "Little by little, extraordinary things happen.",
    ],
    research: [
      "Discover the extraordinary",
      "Every discovery opens a new possibility.",
    ],
    worlds: [
      "Beyond the familiar",
      "Each new world multiplies all your production.",
    ],
    legacy: [
      "The things you carry forward",
      "Earn Echoes. Unlock relics. Shape your next expedition.",
    ],
    expedition: [
      "Chart your own path",
      "Specialize, automate, and take on a different kind of run.",
    ],
  };
  setText($("#section-title"), headings[tab][0]);
  setText($("#section-description"), headings[tab][1]);
  $("#bulk-controls").hidden = !["structures", "research", "legacy"].includes(
    tab,
  );
  setText(
    $("#buy-all"),
    tab === "legacy" ? "Claim all rewards" : "Buy all affordable",
  );
  updateBulkHint();
  rows = { price: [], label: [], owned: [], rate: [], buttons: [] };
  if (tab === "structures") {
    const shown = visibleStructures();
    list.innerHTML =
      units
        .slice(0, shown)
        .map(
          (u, i) =>
            `<button class="item" data-buy="${i}"><span class="item-icon icon-${i % 6}">${u.icon}</span><span class="item-content"><span class="item-title">${u.name}<span class="owned"></span></span><span class="item-description">${u.detail}</span><span class="item-rate"></span></span><span class="item-price"><span class="price-value"></span><small></small></span></button>`,
        )
        .join("") + hidden(units.length - shown, "structures to discover");
  }
  if (tab === "research") {
    const shown = visibleResearch();
    list.innerHTML =
      shown
        .map((i) => {
          const r = research[i];
          return `<button class="item" data-research="${i}"><span class="item-icon icon-${i % 6}">${["⌁", "⚛", "◈", "✧", "⬡", "∞"][i % 6]}</span><span class="item-content"><span class="item-title">${r.name}</span><span class="item-description">${r.detail}</span><span class="item-rate">PERMANENT THIS EXPEDITION</span></span><span class="item-price"><span class="price-value"></span><small></small></span></button>`;
        })
        .join("") +
      hidden(research.length - shown.length, "discoveries beyond the horizon");
  }
  if (tab === "worlds")
    list.innerHTML = worlds
      .map(
        (w, i) =>
          `${i % 3 === 0 ? `<div class="sector-card"><span class="eyebrow">SECTOR ${Math.floor(i / 3) + 1}</span><h3>${sectors[Math.floor(i / 3)].name}</h3><p>${sectors[Math.floor(i / 3)].bonus}</p><button class="ability-button" data-sector="${Math.floor(i / 3)}"></button></div>` : ""}<button class="item world-item" data-world="${i}"><span class="item-icon icon-${i % 6}">◎</span><span class="item-content"><span class="item-title">${w.name}</span><span class="item-description">${w.type.toLowerCase()} · ${worldAbilities[i].name.toLowerCase()}</span><span class="item-rate">${w.multiplier}× all production & harvests</span></span><span class="item-price"><span class="price-value"></span><small></small></span></button>`,
      )
      .join("");
  if (tab === "legacy")
    list.innerHTML =
      `<div class="legacy-explainer"><strong>A legacy beyond stardust</strong><p>Ascend with at least 1M earned aether to gain Echoes. Every tenfold increase and each world beyond world 3 earns more. One-time challenges also grant Echoes. Stardust stays a separate, automatic bonus.</p><p>Relics survive every reset. Starter drones and remembered research take effect on your next ascension; other relics apply immediately.</p></div><h3 class="list-heading">PERMANENT RELICS</h3>` +
      relics
        .map(
          (r, i) =>
            `<button class="item relic-item" data-relic="${i}"><span class="item-icon icon-${i % 6}">◈</span><span class="item-content"><span class="item-title">${r.name}<span class="owned" id="relic-rank-${i}"></span></span><span class="item-description">${r.detail}</span><span class="item-rate" id="relic-gate-${i}"></span></span><span class="item-price" id="relic-price-${i}"></span></button>`,
        )
        .join("") +
      `<h3 class="list-heading">ONE-TIME CHALLENGES</h3>` +
      challenges
        .map(
          (c, i) =>
            `<button class="item challenge-item" data-challenge="${i}"><span class="item-icon">✧</span><span class="item-content"><span class="item-title">${c.name}</span><span class="item-description">${c.detail}</span><span class="item-rate" id="challenge-progress-${i}"></span></span><span class="item-price" id="challenge-reward-${i}"></span></button>`,
        )
        .join("");
  if (tab === "expedition") list.innerHTML = expeditionMarkup(state);
  if (tab === "structures" || tab === "research" || tab === "worlds") {
    list.querySelectorAll<HTMLButtonElement>("button.item").forEach((b) => {
      rows.buttons.push(b);
      rows.price.push(b.querySelector<HTMLElement>(".price-value")!);
      rows.label.push(b.querySelector<HTMLElement>(".item-price small")!);
      rows.owned.push(b.querySelector<HTMLElement>(".owned") ?? b);
      rows.rate.push(b.querySelector<HTMLElement>(".item-rate")!);
    });
  }
  list.scrollTop = savedScroll;
  update();
  if (focusKey) {
    const same = list.querySelector<HTMLButtonElement>(
      `[data-${focusKey}="${focusValue}"]`,
    );
    (same && !same.disabled
      ? same
      : list.querySelector<HTMLButtonElement>("button:not(:disabled)")
    )?.focus({ preventScroll: true });
  }
}
function updateBulkHint() {
  setText(
    $("#bulk-hint"),
    tab === "structures"
      ? quantity === BUY_MAX
        ? "The largest affordable batch of each type, most expensive first."
        : `One ×${quantity} batch per type, in list order.`
      : tab === "research"
        ? "Learn each affordable discovery in list order."
        : "Collect eligible challenges and sector rewards. Relics remain your choice.",
  );
}
function batchFor(i: number) {
  return quantity === BUY_MAX ? Math.max(1, maxAffordable(state, i)) : quantity;
}

ui.items.addEventListener("click", (e) => {
  const button = (e.target as HTMLElement).closest<HTMLButtonElement>("button");
  if (!button) return;
  if (
    button.dataset.sector !== undefined &&
    claimSector(state, Number(button.dataset.sector))
  ) {
    tone(620);
    toast("Sector milestone claimed. Echoes secured.");
  }
  if (button.dataset.buy !== undefined) {
    const i = Number(button.dataset.buy);
    if (buy(state, i, batchFor(i))) {
      tone();
      scene?.pulse();
      if (state.counts.reduce((a, b) => a + b, 0) === 1)
        toast(
          "Your first drone is online. The aether flows even while you’re away.",
        );
    }
  }
  if (button.dataset.research !== undefined) {
    const i = Number(button.dataset.research),
      r = research[i];
    if (learn(state, i)) {
      tone(560);
      toast(r.name + " discovered.");
      scene?.burst();
    }
  }
  if (button.dataset.world !== undefined) {
    const i = Number(button.dataset.world);
    if (explore(state, i)) {
      scene?.setWorld(worlds[i].color, i);
      tone(660);
      toast(
        `Welcome to ${worlds[i].name}. New power: ${worldAbilities[i].name}.`,
      );
      renderItems();
    }
  }
  if (button.dataset.relic !== undefined) {
    const i = Number(button.dataset.relic);
    if (buyRelic(state, i)) {
      tone(620);
      toast(relics[i].name + " upgraded. Your legacy grows.");
    }
  }
  if (button.dataset.challenge !== undefined) {
    const i = Number(button.dataset.challenge);
    if (claimChallenge(state, i)) {
      tone(620);
      toast("Challenge complete. +" + challenges[i].reward + " Echoes.");
    }
  }
  if (
    button.dataset.role !== undefined &&
    chooseRole(state, Number(button.dataset.role))
  ) {
    renderItems();
    toast("Specialization selected for this expedition.");
  }
  if (
    button.dataset.artifact !== undefined &&
    toggleArtifact(state, Number(button.dataset.artifact))
  )
    renderItems();
  if (button.dataset.trial !== undefined) {
    const i = Number(button.dataset.trial);
    confirmRunReset(
      `Begin ${trials[i].name}?`,
      "This resets your current expedition without granting ascension rewards. Permanent currencies, relics, and records are kept. Trial power restrictions apply.",
      () => startTrial(state, i),
    );
  }
  if (button.id === "finish-trial") {
    const next = finishTrial(state);
    if (next !== state) {
      replaceRun(next);
      toast("Trial completed! Your permanent rewards are unlocked.");
    }
  }
  if (button.id === "abandon-trial")
    confirmRunReset(
      "Abandon this trial?",
      "Start a fresh normal expedition. No trial reward will be granted. Your permanent progress is kept.",
      () => finishTrial(state, true),
    );
  recordMilestones(state);
  update();
  persist();
});
ui.tabs.forEach((b) =>
  b.addEventListener("click", () => {
    tab = b.dataset.tab!;
    ui.tabs.forEach((x) => x.classList.toggle("active", x === b));
    renderItems(true);
  }),
);
document.querySelectorAll<HTMLButtonElement>("[data-qty]").forEach((b) =>
  b.addEventListener("click", () => {
    quantity = b.dataset.qty === "max" ? BUY_MAX : Number(b.dataset.qty);
    updateBulkHint();
    document
      .querySelectorAll("[data-qty]")
      .forEach((x) => x.classList.toggle("active", x === b));
    update();
  }),
);

/* ---------- Per-tick refresh ---------- */

const goals = [
  {
    at: units[0].base,
    title: "A companion for the journey",
    text: `Harvest ${format(units[0].base)} aether to build your first orbiting drone.`,
  },
  {
    at: units[1].base,
    title: "Below the surface",
    text: `Earn ${format(units[1].base)} aether and start extracting crystal.`,
  },
  {
    at: research[1].cost,
    title: "A brighter kind of future",
    text: `Earn ${format(research[1].cost)} aether to discover ${research[1].name.toLowerCase()}.`,
  },
  {
    at: worlds[1].cost,
    title: "The horizon is calling",
    text: `Save ${format(worlds[1].cost)} aether to explore ${worlds[1].name} in Worlds.`,
  },
  {
    at: balance.stardustBase,
    title: "More than a single lifetime",
    text: `Earn ${format(balance.stardustBase)} aether this expedition to unlock Ascension.`,
  },
  {
    at: worlds[2].cost,
    title: "At the edge of the known",
    text: `Reach ${worlds[2].name} and catch comets to fill its nebula.`,
  },
  {
    at: worlds[3].cost,
    title: "Find the celestial heart",
    text: `Reach ${worlds[3].name}, then push into uncharted worlds.`,
  },
  {
    at: worlds[4].cost,
    title: "The endless tide",
    text: `Explore ${worlds[4].name} to unlock the Architect’s seal.`,
  },
  {
    at: worlds[6].cost,
    title: "Into the singularity",
    text: `Reach ${worlds[6].name} and master the late-game research.`,
  },
  {
    at: worlds[7].cost,
    title: "Beyond the beginning",
    text: `Reach ${worlds[7].name} for a 25 Echo challenge reward.`,
  },
  {
    at: worlds[11].cost,
    title: "There was never an edge",
    text: `Reach ${worlds[11].name}, the final world.`,
  },
].sort((a, b) => a.at - b.at);

let lastTitle = "";
function update() {
  recordMilestones(state);
  if (currentSignature() !== listSignature) renderItems();
  const now = Date.now(),
    boosting = now < state.boostUntil,
    rate = activeProduction(state, now),
    total = state.counts.reduce((a, b) => a + b, 0);
  const energyText = format(state.energy);
  setText(ui.energy, energyText);
  setText(ui.hudEnergy, energyText);
  setText(ui.rate, format(rate));
  setText(ui.hudRate, format(rate));
  const title = `${energyText} aether · Aether Forge`;
  if (title !== lastTitle) document.title = lastTitle = title;
  setText(
    ui.clickValue,
    "+" + format(clickPower(state) * (boosting ? boostMultiplier(state) : 1)),
  );
  setText(ui.multiplier, worlds[state.world].multiplier + "× world bonus");
  setText(ui.worldName, worlds[state.world].name);
  setText(ui.worldDescription, worlds[state.world].description);
  setText(ui.worldType, worlds[state.world].type);
  setText(ui.worldNumber, "WORLD " + String(state.world + 1).padStart(2, "0"));
  setText(ui.totalStructures, format(total));
  setText(ui.totalEarned, format(state.lifetime));
  setText(ui.structureCount, format(total));
  setText(ui.researchCount, state.upgrades.length + "/" + research.length);
  setText(ui.worldCount, `${state.world + 1}/${worlds.length}`);
  ui.sound.classList.toggle("enabled", state.sound);
  ui.sound.setAttribute("aria-pressed", String(state.sound));

  const baseRate = production(state);
  if (tab === "structures")
    rows.buttons.forEach((button, i) => {
      const qty = batchFor(i),
        cost = price(state, i, qty),
        each = unitOutput(state, i),
        share = baseRate > 0 ? (each * state.counts[i]) / baseRate : 0,
        affordable = state.energy >= cost && canBuild(state, i);
      setText(rows.price[i], "✧ " + format(cost));
      setText(
        rows.label[i],
        !canBuild(state, i)
          ? "TRIAL LOCKED"
          : affordable
            ? `BUILD ${qty > 1 ? "×" + qty : "+"}`
            : eta(cost, baseRate),
      );
      setText(rows.owned[i], String(state.counts[i]));
      setText(
        rows.rate[i],
        `+${format(each)}/s each` +
          (state.counts[i]
            ? ` · ${format(each * state.counts[i])}/s total · ${Math.round(share * 100)}%`
            : ""),
      );
      setDisabled(button, !affordable);
    });
  if (tab === "research")
    rows.buttons.forEach((button, row) => {
      const i = Number(button.dataset.research),
        r = research[i],
        learned = state.upgrades.includes(i);
      setDisabled(
        button,
        learned || state.energy < r.cost || state.trial === 2,
      );
      button.classList.toggle("learned", learned);
      setText(rows.price[row], learned ? "✓ Learned" : "✧ " + format(r.cost));
      setText(
        rows.label[row],
        learned
          ? ""
          : state.trial === 2
            ? "TRIAL LOCKED"
            : state.energy >= r.cost
              ? "LEARN"
              : eta(r.cost, baseRate),
      );
    });
  if (tab === "worlds") {
    rows.buttons.forEach((button, i) => {
      const cost = worldPrice(state, i);
      setDisabled(button, i !== state.world + 1 || state.energy < cost);
      setText(
        rows.price[i],
        i === state.world
          ? "● Exploring"
          : i < state.world
            ? "✓ Discovered"
            : "✧ " + format(cost),
      );
      setText(
        rows.label[i],
        i === state.world + 1
          ? state.energy >= cost
            ? "TRAVEL"
            : eta(cost, baseRate)
          : i > state.world + 1
            ? "UNCHARTED"
            : "",
      );
    });
    sectors.forEach((sector, i) => {
      const button = ui.items.querySelector<HTMLButtonElement>(
        `[data-sector="${i}"]`,
      )!;
      setDisabled(
        button,
        state.sectorClaims.includes(i) || state.bestWorld < sector.end,
      );
      setText(
        button,
        state.sectorClaims.includes(i)
          ? "✓ Sector reward claimed"
          : state.bestWorld >= sector.end
            ? `Claim ${sector.reward} Echoes`
            : `Reach world ${sector.end + 1} · ${sector.reward} Echoes`,
      );
    });
  }
  setDisabled(ui.harvest, state.trial === 0);
  setDisabled(ui.hudHarvest, state.trial === 0);
  ui.canvas.setAttribute("aria-disabled", String(state.trial === 0));
  const ability = worldAbilities[state.world];
  setText(ui.abilityName, "✺ " + ability.name);
  setText(
    ui.abilityStatus,
    now < state.worldReady
      ? `Recharging · ${Math.ceil((state.worldReady - now) / 1000)}s`
      : abilityAvailable(state, now)
        ? "Activate · 90s cooldown"
        : state.worldStacks >= 10 && [6, 7].includes(state.world)
          ? "Maximum stacks reached"
          : state.world === 6
            ? "Requires a structure to sacrifice"
            : state.world === 7
              ? "Requires 1,000 aether in reserve"
              : "Build your world resource to activate",
  );
  setDisabled(ui.ability, !abilityAvailable(state, now));
  ui.ability.classList.toggle("ready", abilityAvailable(state, now));
  setText(ui.mechanicDetail, ability.detail);
  setText(
    ui.mechanicValue,
    [6, 7].includes(state.world)
      ? `${ability.meter}: ${state.worldStacks} / 10 · resets on travel`
      : state.world === 9
        ? `Next harvest: ${state.clicks % 2 ? "2× mirrored" : "normal"}`
        : [3, 11].includes(state.world)
          ? `${state.counts.filter((n) => n > 0).length} distinct structure types online`
          : `${ability.meter}: ${Math.floor(state.worldMeter)} / 100 · needs 10 to activate`,
  );
  setText(ui.sectorName, sectors[sectorIndex(state)].name.toUpperCase());
  setText(
    ui.baseStatus,
    `${total >= 500 ? "Orbital metropolis" : total >= 100 ? "Orbital city" : total > 0 ? "Orbital outpost" : "Your orbital base awaits"} · ${state.counts.filter((n) => n > 0).length} / 16 docks · ${format(total)} structure${total === 1 ? "" : "s"}`,
  );
  setText(
    ui.runBanner,
    (state.role >= 0
      ? roles[state.role].name
      : "Choose a specialization in Expedition") +
      (state.trial >= 0
        ? " · TRIAL: " + trials[state.trial].name
        : " · Normal expedition"),
  );
  scene?.setActivity(state.counts, boosting, cometAvailable(state, now));
  if (tab === "expedition" && state.trial >= 0) {
    setText(
      $(`#trial-progress-${state.trial}`),
      format(state.earned) + " / " + format(trials[state.trial].target),
    );
    setDisabled(
      $<HTMLButtonElement>("#finish-trial"),
      state.earned < trials[state.trial].target,
    );
  }
  setText(ui.echoes, format(state.echoes));
  const ready = readyRewards(state);
  setText(ui.legacyReady, ready ? `${ready} ready` : "∞");
  setText(
    ui.legacyPower,
    `${format(state.shards)} stardust (${state.trial >= 0 ? "suspended in trial" : "+" + pct(state.shards)}) · ${state.relics.reduce((a, b) => a + b, 0)} relic ranks`,
  );
  // Tab dots point at something worth doing on another tab.
  const news: Record<string, boolean> = {
    research:
      state.trial !== 2 &&
      research.some(
        (r, i) => !state.upgrades.includes(i) && state.energy >= r.cost,
      ),
    worlds:
      (state.world + 1 < worlds.length &&
        state.energy >= worldPrice(state, state.world + 1)) ||
      sectors.some(
        (x, i) => !state.sectorClaims.includes(i) && state.bestWorld >= x.end,
      ),
    legacy:
      ready > 0 ||
      relics.some(
        (r, i) =>
          relicUnlocked(state, i) &&
          state.relics[i] < r.max &&
          state.echoes >= relicPrice(state, i),
      ),
    expedition: state.role < 0 && total > 0,
  };
  ui.tabs.forEach((b) =>
    b.classList.toggle(
      "has-news",
      tab !== b.dataset.tab && !!news[b.dataset.tab!],
    ),
  );
  setText(
    ui.boostStatus,
    boosting
      ? `${boostMultiplier(state)}× power · ${Math.ceil((state.boostUntil - now) / 1000)}s remaining`
      : `${Math.floor(state.charge)} / 100 charge · Harvest to recharge`,
  );
  ui.chargeProgress.style.width = (boosting ? 100 : state.charge) + "%";
  setDisabled(ui.overdrive, boosting || state.charge < 100);
  ui.overdrive.classList.toggle("ready", state.charge >= 100 && !boosting);
  setText(
    ui.coreStatus,
    boosting
      ? "Overdrive"
      : cometAvailable(state, now)
        ? "Comet overhead"
        : "Resonating",
  );
  const cometReady = cometAvailable(state, now);
  setDisabled(ui.comet, !cometReady);
  ui.comet.classList.toggle("ready", cometReady);
  setText(
    ui.cometStatus,
    cometReady
      ? `Catch now! Leaves in ${Math.ceil((state.nextComet + 15000 - now) / 1000)}s`
      : `Next signal in ${Math.max(0, Math.ceil((state.nextComet - now) / 1000))}s · +20 charge`,
  );
  if (tab === "legacy") {
    relics.forEach((r, i) => {
      const unlocked = relicUnlocked(state, i),
        maxed = state.relics[i] >= r.max;
      setText($(`#relic-rank-${i}`), `${state.relics[i]} / ${r.max}`);
      setText(
        $(`#relic-gate-${i}`),
        unlocked
          ? "UNLOCKED · PERSISTS THROUGH ASCENSION"
          : "LOCKED · " + r.requirement,
      );
      setText(
        $(`#relic-price-${i}`),
        maxed ? "✓ Mastered" : "◈ " + relicPrice(state, i),
      );
      setDisabled(
        $<HTMLButtonElement>(`[data-relic="${i}"]`),
        !unlocked || maxed || state.echoes < relicPrice(state, i),
      );
    });
    challenges.forEach((c, i) => {
      const done = state.claimed.includes(i),
        ok = c.value(state) >= c.target;
      setText(
        $(`#challenge-progress-${i}`),
        `${format(Math.min(c.value(state), c.target))} / ${format(c.target)}`,
      );
      setText(
        $(`#challenge-reward-${i}`),
        done ? "✓ Claimed" : ok ? `Claim ${c.reward} ◈` : `${c.reward} ◈`,
      );
      setDisabled($<HTMLButtonElement>(`[data-challenge="${i}"]`), done || !ok);
    });
  }
  const goal = goals.find((g) => state.earned < g.at) ?? {
    at: state.earned,
    title: "An infinite possibility",
    text: "Ascend, grow your permanent bonus, and start a new odyssey.",
  };
  const percent = Math.min(100, (state.earned / goal.at) * 100);
  setText(ui.goalTitle, goal.title);
  setText(ui.goalPercent, Math.floor(percent) + "%");
  ui.goalProgress.style.width = percent + "%";
  setText(ui.goalDescription, goal.text);
  const reward = ascensionReward(state);
  setDisabled(ui.ascend, state.trial >= 0);
  ui.ascend.classList.toggle("ready", state.trial < 0 && reward > 0);
  setText(
    ui.ascendDescription,
    state.trial >= 0
      ? "Finish or abandon your trial in Expedition."
      : reward > 0
        ? `Ascend: +${format(reward)} stardust (+${pct(reward)}) · +${echoReward(state)} Echoes · next stardust at ${format(nextStardustAt(state))} earned`
        : state.shards > 0
          ? `${format(state.shards)} stardust · +${pct(state.shards)} permanent bonus · ascend again at ${format(balance.stardustBase)} earned`
          : `Reach ${format(balance.stardustBase)} aether this expedition to unlock Ascension.`,
  );
}

/* ---------- Persistence, dialogs, abilities ---------- */

let savingPaused = !!loaded.unreadable && !loaded.backupKey;
function persist() {
  if (savingPaused) {
    setText($("#save-status"), "⚠ Autosave paused");
    return;
  }
  const ok = save(state);
  setText($("#save-status"), ok ? "✓ Progress saved" : "⚠ Save unavailable");
}
const dialog = $<HTMLDialogElement>("#dialog");
/** Fill and show the shared dialog, starting focus on × so a stray Space never confirms. */
function openDialog(html: string) {
  $("#dialog-content").innerHTML = html;
  if (!dialog.open) dialog.showModal();
  $("#close-dialog").focus();
}
$("#close-dialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});
// Focus left inside a closed dialog would swallow Space; hand it back to the page.
// (A keyboard user's opener regains focus and is left alone.)
dialog.addEventListener("close", () => {
  if (dialog.contains(document.activeElement))
    (document.activeElement as HTMLElement).blur();
});
ui.sound.addEventListener("click", () => {
  state.sound = !state.sound;
  tone();
  update();
  persist();
});
ui.ascend.addEventListener("click", () => {
  const reward = ascensionReward(state);
  openDialog(
    `<span class="modal-symbol">✺</span><h2>A new beginning</h2><p>Let your constellation become stardust. Reset your aether, structures, research, and worlds in exchange for a permanent bonus to every future expedition.</p><div class="modal-stat">${format(reward)} <small>stardust · +${pct(reward)} power</small></div><div class="echo-reward">◈ +${echoReward(state)} Echoes</div><p>Each stardust adds ${Math.round(balance.stardustBonus * 100)}% to production and harvests, forever. Pushing further in a run earns more: the next stardust arrives at ${format(nextStardustAt(state))} earned. Echoes need at least 1M aether in a run.</p><p>You keep all relics, Echoes, challenge claims, and lifetime records. Starter relics apply to the new run.</p><button id="confirm-ascend" class="primary" ${reward === 0 ? "disabled" : ""}>${reward === 0 ? `Earn ${format(balance.stardustBase)} aether to ascend` : "Begin again ✧"}</button>`,
  );
  $("#confirm-ascend").addEventListener("click", () => {
    if (ascensionReward(state) < 1) return;
    state = ascend(state);
    previous = Date.now();
    scene?.setWorld(worlds[0].color);
    dialog.close();
    tab = "legacy";
    ui.tabs.forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
    renderItems(true);
    persist();
    tone(700);
    toast("A new odyssey begins. Your stardust makes you stronger.");
  });
});
$("#settings").addEventListener("click", () => {
  const stat = (label: string, value: string) =>
    `<div class="settings-stat"><span>${label}</span><strong>${value}</strong></div>`;
  openDialog(
    `<span class="eyebrow">EXPEDITION SETTINGS</span><h2>Make yourself at home.</h2><p>Your progress saves automatically on this device. Your structures keep producing for up to 8 hours while you’re away.</p><div class="settings-grid">${stat("Lifetime aether", format(state.lifetime))}${stat("Manual harvests", format(state.totalClicks))}${stat("Comets caught", format(state.comets))}${stat("Furthest world", worlds[state.bestWorld].name)}${stat("Ascensions", format(state.ascensions))}${stat("Stardust", `${format(state.shards)} (+${pct(state.shards)})`)}${stat("Trials completed", `${state.completedTrials.length} / ${trials.length}`)}${stat("Relic ranks", String(state.relics.reduce((a, b) => a + b, 0)))}</div><label class="theme-label">Visual theme<select id="theme">${themes.map((t) => `<option value="${t.id}" ${state.theme === t.id ? "selected" : ""}>${t.name}</option>`).join("")}</select></label><button id="export" class="primary">Export save backup ↓</button><label class="import-label">Import save backup ↑<input id="import" type="file" accept="application/json,.json"/></label><details class="danger-zone"><summary>Danger zone</summary><p>Erase every expedition, relic, and record on this device. Export a backup first if you might want it back.</p><button id="reset-all" class="danger">Erase all progress…</button></details><p class="small-print">Single player. No accounts, ads, or purchases. Just you and a universe of possibility.</p>`,
  );
  $("#theme").addEventListener("change", (e) => {
    state.theme = (e.target as HTMLSelectElement).value;
    applyTheme();
    persist();
  });
  $("#export").addEventListener("click", () => {
    persist();
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(state)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `aether-forge-save-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  $("#import").addEventListener("change", async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      const imported = parseSave(JSON.parse(await file.text()));
      if (!imported) throw Error();
      imported.savedAt = Date.now();
      replaceRun(imported);
      applyTheme();
      dialog.close();
      toast("Your expedition has been restored.");
    } catch {
      toast("That save could not be imported. Please choose a valid backup.");
    }
  });
  $("#reset-all").addEventListener("click", () =>
    confirmRunReset(
      "Erase all progress?",
      "Every structure, world, stardust, Echo, relic, trial, and record on this device will be permanently deleted. This cannot be undone.",
      () => {
        tab = "structures";
        ui.tabs.forEach((b) =>
          b.classList.toggle("active", b.dataset.tab === tab),
        );
        return resetAll(state);
      },
      "Erase everything",
      true,
    ),
  );
});
ui.overdrive.addEventListener("click", () => {
  if (activateBoost(state)) {
    scene?.pulse();
    tone(330);
    toast("Core overdrive! Production and harvests are amplified.");
    persist();
    update();
  }
});
ui.comet.addEventListener("click", () => {
  const reward = catchComet(state);
  if (reward) {
    scene?.burst();
    tone(780);
    toast("Comet captured! +" + format(reward) + " aether and +20 charge.");
    persist();
    update();
  }
});
ui.ability.addEventListener("click", () => {
  const before = state.energy;
  if (worldAbility(state)) {
    scene?.burst();
    tone(500);
    const gained = state.energy - before;
    toast(
      gained > 0
        ? `${worldAbilities[state.world].name}: +${format(gained)} aether.`
        : `${worldAbilities[state.world].name} activated.`,
    );
    update();
    persist();
  }
});
ui.items.addEventListener("change", (e) => {
  const target = e.target as HTMLInputElement;
  if (target.id === "auto-enabled" && automationUnlocked(state))
    state.autoEnabled = target.checked;
  if (
    target.id === "auto-policy" &&
    ["efficient", "cheapest"].includes(target.value)
  )
    state.autoPolicy = target.value;
  if (
    target.id === "auto-budget" &&
    [10, 25, 50].includes(Number(target.value))
  )
    state.autoBudget = Number(target.value);
  persist();
});
function replaceRun(next: State) {
  state = next;
  savingPaused = false;
  previous = Date.now();
  announcedComet = state.nextComet;
  scene?.setWorld(worlds[state.world].color, state.world);
  renderItems(true);
  persist();
}
function confirmRunReset(
  title: string,
  description: string,
  action: () => State,
  confirmLabel = "Confirm and begin",
  destructive = false,
) {
  openDialog(
    `<h2>${title}</h2><p>${description}</p><button class="${destructive ? "danger" : "primary"}" id="confirm-run">${confirmLabel}</button><button class="secondary" id="cancel-run">Cancel</button>`,
  );
  $("#cancel-run").addEventListener("click", () => dialog.close());
  $("#confirm-run").addEventListener("click", () => {
    const next = action();
    dialog.close();
    if (next !== state) replaceRun(next);
  });
}
function applyTheme() {
  const theme = themes.find((t) => t.id === state.theme) || themes[0];
  document.documentElement.dataset.theme = theme.id;
  scene?.setTheme(theme.color);
}
$("#buy-all").addEventListener("click", () => {
  if (tab !== "structures" && tab !== "research" && tab !== "legacy") return;
  const count = buyAll(state, tab, quantity);
  toast(
    count
      ? `${format(count)} ${tab === "legacy" ? "rewards claimed" : tab === "research" ? "discoveries learned" : "structures built"}.`
      : "Nothing affordable or ready yet.",
  );
  if (count) {
    scene?.burst();
    tone(560);
  }
  update();
  persist();
});

applyTheme();
renderItems();
let previous = Date.now(),
  announcedComet = state.nextComet;
setInterval(() => {
  const now = Date.now();
  advance(state, previous, now);
  previous = now;
  if (!document.hidden) passiveActions(state, now);
  // Announce each comet once; the Cosmic magnet relic catches them silently.
  if (cometAvailable(state, now) && announcedComet !== state.nextComet) {
    announcedComet = state.nextComet;
    toast("✦ A comet is passing! Catch it within 15 seconds (press C).");
  }
  update();
}, 100);
setInterval(persist, 10000);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) persist();
});
window.addEventListener("pagehide", persist);
if (loaded.backupKey)
  toast(
    "Your previous save could not be read, so a fresh expedition began. The old data was kept in browser storage as a backup.",
    12000,
  );
else if (savingPaused)
  toast(
    "Your save could not be read or backed up, so autosave is paused to protect it. Import a backup or erase progress in Settings to continue saving.",
    15000,
  );
else if (offline > 1)
  toast(
    `Welcome back! In ${duration(Math.min(awayMs, OFFLINE_CAP) / 1000)} away, your constellation gathered ${format(offline)} aether${awayMs > OFFLINE_CAP ? " (offline gains cap at 8 hours)" : ""}.`,
  );
