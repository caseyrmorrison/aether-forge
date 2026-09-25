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
  type State,
} from "./game";
import { expeditionMarkup } from "./expedition";
import { createScene } from "./scene";
let state: State = load(),
  tab = "structures",
  quantity = 1;
const offline = advance(state, state.savedAt, Date.now());
const $ = <T extends HTMLElement = HTMLElement>(s: string) =>
  document.querySelector<T>(s)!;
$("#app").innerHTML = `
<header class="topbar"><a class="brand" href="./" aria-label="Aether Forge home"><span class="brand-icon">✧</span><span>AETHER<span class="brand-light">FORGE</span><small>AN IDLE ODYSSEY</small></span></a><div class="sector"><span class="live-dot"></span> SOLO EXPEDITION <span class="divider">/</span> <span id="sector-name">THE CRADLE</span></div><div class="top-actions"><span id="save-status">✓ Progress saved</span><button id="sound" class="icon-button" aria-label="Toggle sound" title="Toggle sound">♫</button><button id="settings" class="icon-button" aria-label="Settings" title="Settings">⚙</button></div></header>
<main><section class="world-panel"><div class="world-top"><span class="eyebrow">YOUR LITTLE CORNER OF THE UNIVERSE</span><span class="world-badge">◈ <span id="world-number">WORLD 01</span></span></div><div class="world-heading"><h1 id="world-name"></h1><p id="world-description"></p></div><div class="scene-container"><div class="scene-halo"></div><canvas id="world-canvas" tabindex="0" role="button" aria-label="Harvest aether from the crystal. Press Enter or Space."></canvas><div class="scene-caption"><span class="live-dot"></span> <span id="world-type"></span><span class="coordinates">07.24° N &nbsp; 38.91° E</span></div><div class="floating-label"><span>✧</span> <span>CORE STATUS<small>Resonating</small></span></div><div id="particles"></div></div><div id="base-status" class="base-status"></div><div class="harvest-area"><span class="eyebrow">A SMALL TOUCH. AN INFINITE POSSIBILITY.</span><button id="harvest"><span>✧</span> Harvest aether <span id="click-value">+1</span></button><div class="harvest-hint">Click the crystal or press <kbd>Space</kbd> to harvest</div></div><div class="active-systems"><button id="overdrive" class="ability-button"><span>⚡ Core overdrive</span><small id="boost-status"></small><div class="progress-track"><div id="charge-progress"></div></div></button><button id="comet" class="ability-button comet-button"><span>✦ Comet scanner</span><small id="comet-status"></small></button></div><button id="world-ability" class="ability-button world-ability"><span id="ability-name"></span><small id="ability-status"></small></button><div class="mechanic-panel"><p id="mechanic-detail"></p><strong id="mechanic-value"></strong></div><div id="run-banner" class="run-banner"></div><div class="journey-card"><div class="journey-icon">⌁</div><div class="journey-content"><div class="journey-title"><span id="goal-title"></span><span id="goal-percent"></span></div><div class="progress-track"><div id="goal-progress"></div></div><p id="goal-description"></p></div><span class="journey-arrow">↗</span></div><footer class="world-footer"><span>✦ &nbsp; THE UNIVERSE STARTS WITH YOU.</span><span>v4.0 <span class="live-dot"></span></span></footer></section>
<section class="control-panel"><div class="resource-card"><div class="resource-label"><span>✧ &nbsp; AETHER RESERVE</span><span class="pill">LIVE</span></div><div class="energy-number" id="energy">0</div><div class="resource-bottom"><span><i class="live-dot"></i><strong id="rate">0</strong> / second</span><span id="multiplier">1× world bonus</span></div><svg class="sparkline" viewBox="0 0 500 45" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="fade" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#8de0b7" stop-opacity=".12"/><stop offset="1" stop-color="#8de0b7" stop-opacity="0"/></linearGradient></defs><path d="M0 40L40 37L70 40L105 31L145 34L180 23L210 27L245 18L270 24L300 13L340 18L370 8L410 12L450 3L480 8L500 0V45H0Z" fill="url(#fade)"/><path d="M0 40L40 37L70 40L105 31L145 34L180 23L210 27L245 18L270 24L300 13L340 18L370 8L410 12L450 3L480 8L500 0" fill="none" stroke="#7aba9b" stroke-opacity=".4" stroke-width="1.4"/></svg></div><nav class="tabs" aria-label="Upgrade categories"><button data-tab="structures" class="active">Structures <span>${units.length}</span></button><button data-tab="research">Research <span id="research-count">0/${research.length}</span></button><button data-tab="worlds">Worlds <span>${worlds.length}</span></button><button data-tab="legacy">Legacy <span id="legacy-ready">∞</span></button><button data-tab="expedition">Expedition <span>✦</span></button></nav><div class="legacy-wallet"><span>◈ <strong id="echoes">0</strong> Echoes <small>Permanent currency</small></span><span id="legacy-power"></span></div><div class="section-heading"><div><h2 id="section-title">Build your constellation</h2><p id="section-description">Little by little, extraordinary things happen.</p></div><div class="quantity" aria-label="Purchase quantity"><button data-qty="1" class="active">×1</button><button data-qty="10">×10</button><button data-qty="100">×100</button></div></div><div id="bulk-controls"><button id="buy-all" class="ability-button"></button><small id="bulk-hint"></small></div><div id="items"></div><div class="ascend-card"><span class="ascend-icon">✺</span><div><h3>A new beginning awaits</h3><p id="ascend-description">Reach 100K aether to unlock Ascension.</p></div><button id="ascend" aria-label="Ascend">↗</button></div><div class="stats-strip"><span><strong id="total-structures">0</strong> structures built</span><span><strong id="total-earned">0</strong> lifetime aether</span></div></section></main><div id="toast" role="status"></div><dialog id="dialog"><div id="dialog-content"></div><button id="close-dialog" class="dialog-close" aria-label="Close dialog">×</button></dialog>`;
let toastTimer: ReturnType<typeof setTimeout>;
let scene: ReturnType<typeof createScene> | undefined;
try {
  scene = createScene($("#world-canvas"));
} catch {
  $(".scene-container").classList.add("fallback");
  $(".scene-container").insertAdjacentHTML(
    "beforeend",
    '<div class="fallback-crystal">✧</div>',
  );
  toast("3D is unavailable in this browser. All game features still work.");
}
let audio: AudioContext | undefined;
function tone() {
  if (!state.sound) return;
  try {
    audio ??= new AudioContext();
    void audio.resume();
    const oscillator = audio.createOscillator(),
      volume = audio.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
      440 + Math.random() * 200,
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
function toast(message: string) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 4000);
}
function harvest() {
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
$("#harvest").addEventListener("click", harvest);
$("#world-canvas").addEventListener("click", harvest);
$("#world-canvas").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    harvest();
  }
});
document.addEventListener("keydown", (e) => {
  if (
    e.code === "Space" &&
    !e.repeat &&
    !$("#dialog").hasAttribute("open") &&
    !(e.target instanceof HTMLButtonElement) &&
    !(e.target instanceof HTMLInputElement)
  ) {
    e.preventDefault();
    harvest();
  }
});
function renderItems(resetScroll = false) {
  const list = $("#items");
  const savedScroll = resetScroll ? 0 : list.scrollTop;
  $(".quantity").style.visibility = tab === "structures" ? "visible" : "hidden";
  $("#section-title").textContent =
    tab === "structures"
      ? "Build your constellation"
      : tab === "research"
        ? "Discover the extraordinary"
        : tab === "legacy"
          ? "The things you carry forward"
          : tab === "expedition"
            ? "Chart your own path"
            : "Beyond the familiar";
  $("#section-description").textContent =
    tab === "structures"
      ? "Little by little, extraordinary things happen."
      : tab === "research"
        ? "Every discovery opens a new possibility."
        : tab === "legacy"
          ? "Earn Echoes. Unlock relics. Shape your next expedition."
          : tab === "expedition"
            ? "Specialize, automate, and take on a different kind of run."
            : "Each new world multiplies all your production.";
  $("#bulk-controls").hidden = !["structures", "research", "legacy"].includes(
    tab,
  );
  $("#buy-all").textContent =
    tab === "legacy" ? "Claim all rewards" : "Buy all affordable";
  $("#bulk-hint").textContent =
    tab === "structures"
      ? `One ×${quantity} batch per type, in list order.`
      : tab === "research"
        ? "Learn each affordable discovery in list order."
        : "Collect eligible challenges and sector rewards. Relics remain your choice.";
  if (tab === "structures")
    list.innerHTML = units
      .map(
        (u, i) =>
          `<button class="item" data-buy="${i}"><span class="item-icon icon-${i % 6}">${u.icon}</span><span class="item-content"><span class="item-title">${u.name}<span class="owned" id="owned-${i}">${state.counts[i]}</span></span><span class="item-description">${u.detail}</span><span class="item-rate">+${format(u.rate)} base aether / sec</span></span><span class="item-price" id="price-${i}"></span></button>`,
      )
      .join("");
  if (tab === "research")
    list.innerHTML = research
      .map(
        (r, i) =>
          `<button class="item" data-research="${i}"><span class="item-icon icon-${i % 6}">${["⌁", "⚛", "◈", "✧", "⬡", "∞"][i % 6]}</span><span class="item-content"><span class="item-title">${r.name}</span><span class="item-description">${r.detail}</span><span class="item-rate">PERMANENT THIS EXPEDITION</span></span><span class="item-price" id="research-price-${i}">${state.upgrades.includes(i) ? "✓ Learned" : "✧ " + format(r.cost)}</span></button>`,
      )
      .join("");
  if (tab === "worlds")
    list.innerHTML = worlds
      .map(
        (w, i) =>
          `${i % 3 === 0 ? `<div class="sector-card"><span class="eyebrow">SECTOR ${Math.floor(i / 3) + 1}</span><h3>${sectors[Math.floor(i / 3)].name}</h3><p>${sectors[Math.floor(i / 3)].bonus}</p><button class="ability-button" data-sector="${Math.floor(i / 3)}"></button></div>` : ""}<button class="item world-item" data-world="${i}"><span class="item-icon icon-${i % 6}">◎</span><span class="item-content"><span class="item-title">${w.name}</span><span class="item-description">${w.type.toLowerCase()}</span><span class="item-rate">${w.multiplier}× all production & harvests</span></span><span class="item-price">${i === state.world ? "● Exploring" : i < state.world ? "✓ Discovered" : "✧ " + format(worldPrice(state, i))}</span></button>`,
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
  list.scrollTop = savedScroll;
  update();
}
$("#items").addEventListener("click", (e) => {
  const button = (e.target as HTMLElement).closest<HTMLButtonElement>("button");
  if (!button) return;
  if (
    button.dataset.sector !== undefined &&
    claimSector(state, Number(button.dataset.sector))
  ) {
    toast("Sector milestone claimed. Echoes secured.");
    persist();
    update();
  }
  if (button.dataset.buy !== undefined) {
    const i = Number(button.dataset.buy);
    if (buy(state, i, quantity)) {
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
      toast(r.name + " discovered.");
      scene?.burst();
    }
  }
  if (button.dataset.world !== undefined) {
    const i = Number(button.dataset.world);
    if (explore(state, i)) {
      scene?.setWorld(worlds[i].color, i);
      toast(
        "Welcome to " + worlds[i].name + ". Your world bonus has increased.",
      );
      renderItems();
    }
  }
  if (button.dataset.relic !== undefined) {
    const i = Number(button.dataset.relic);
    if (buyRelic(state, i)) {
      tone();
      toast(relics[i].name + " upgraded. Your legacy grows.");
    }
  }
  if (button.dataset.challenge !== undefined) {
    const i = Number(button.dataset.challenge);
    if (claimChallenge(state, i)) {
      tone();
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
document.querySelectorAll<HTMLButtonElement>("[data-tab]").forEach((b) =>
  b.addEventListener("click", () => {
    tab = b.dataset.tab!;
    document
      .querySelectorAll("[data-tab]")
      .forEach((x) => x.classList.toggle("active", x === b));
    renderItems(true);
  }),
);
document.querySelectorAll<HTMLButtonElement>("[data-qty]").forEach((b) =>
  b.addEventListener("click", () => {
    quantity = Number(b.dataset.qty);
    $("#bulk-hint").textContent =
      `One ×${quantity} batch per type, in list order.`;
    document
      .querySelectorAll("[data-qty]")
      .forEach((x) => x.classList.toggle("active", x === b));
    update();
  }),
);
function update() {
  recordMilestones(state);
  const rate = activeProduction(state);
  $("#energy").textContent = format(state.energy);
  $("#rate").textContent = format(rate);
  $("#click-value").textContent =
    "+" +
    format(
      clickPower(state) *
        (Date.now() < state.boostUntil ? boostMultiplier(state) : 1),
    );
  $("#multiplier").textContent =
    worlds[state.world].multiplier + "× world bonus";
  $("#world-name").textContent = worlds[state.world].name;
  $("#world-description").textContent = worlds[state.world].description;
  $("#world-type").textContent = worlds[state.world].type;
  $("#world-number").textContent =
    "WORLD " + String(state.world + 1).padStart(2, "0");
  $("#total-structures").textContent = format(
    state.counts.reduce((a, b) => a + b, 0),
  );
  $("#total-earned").textContent = format(state.lifetime);
  $("#research-count").textContent =
    state.upgrades.length + "/" + research.length;
  $("#sound").classList.toggle("enabled", state.sound);
  $("#sound").setAttribute("aria-pressed", String(state.sound));
  if (tab === "structures")
    units.forEach((_, i) => {
      const cost = price(state, i, quantity);
      $(`#price-${i}`).innerHTML =
        "✧ " +
        format(cost) +
        `<small>BUILD ${quantity > 1 ? "×" + quantity : "+"}</small>`;
      $(`#owned-${i}`).textContent = String(state.counts[i]);
      $<HTMLButtonElement>(`[data-buy="${i}"]`).disabled =
        state.energy < cost || !canBuild(state, i);
    });
  if (tab === "research")
    research.forEach((r, i) => {
      $<HTMLButtonElement>(`[data-research="${i}"]`).disabled =
        state.upgrades.includes(i) ||
        state.energy < r.cost ||
        state.trial === 2;
      $(`#research-price-${i}`).textContent = state.upgrades.includes(i)
        ? "✓ Learned"
        : "✧ " + format(r.cost);
    });
  if (tab === "worlds")
    worlds.forEach((w, i) => {
      $<HTMLButtonElement>(`[data-world="${i}"]`).disabled =
        i !== state.world + 1 || state.energy < worldPrice(state, i);
    });
  const now = Date.now(),
    boosting = now < state.boostUntil;
  $<HTMLButtonElement>("#harvest").disabled = state.trial === 0;
  $("#world-canvas").setAttribute("aria-disabled", String(state.trial === 0));
  const ability = worldAbilities[state.world];
  $("#ability-name").textContent = "✺ " + ability.name;
  $("#ability-status").textContent =
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
              : "Build your world resource to activate";
  $<HTMLButtonElement>("#world-ability").disabled = !abilityAvailable(
    state,
    now,
  );
  $("#mechanic-detail").textContent = ability.detail;
  $("#mechanic-value").textContent = [6, 7].includes(state.world)
    ? `${ability.meter}: ${state.worldStacks} / 10 · resets on travel`
    : state.world === 9
      ? `Next harvest: ${state.clicks % 2 ? "2× mirrored" : "normal"}`
      : [3, 11].includes(state.world)
        ? `${state.counts.filter((n) => n > 0).length} distinct structure types online`
        : `${ability.meter}: ${Math.floor(state.worldMeter)} / 100 · needs 10 to activate`;
  $("#sector-name").textContent =
    sectors[sectorIndex(state)].name.toUpperCase();
  const total = state.counts.reduce((a, b) => a + b, 0);
  $("#base-status").textContent =
    `${total >= 500 ? "Orbital metropolis" : total >= 100 ? "Orbital city" : total > 0 ? "Orbital outpost" : "Your orbital base awaits"} · ${state.counts.filter((n) => n > 0).length} / 16 docks · ${format(total)} structures`;
  if (tab === "worlds")
    sectors.forEach((sector, i) => {
      const button = $<HTMLButtonElement>(`[data-sector="${i}"]`);
      button.disabled =
        state.sectorClaims.includes(i) || state.bestWorld < sector.end;
      button.textContent = state.sectorClaims.includes(i)
        ? "✓ Sector reward claimed"
        : state.bestWorld >= sector.end
          ? `Claim ${sector.reward} Echoes`
          : `Reach world ${sector.end + 1} · ${sector.reward} Echoes`;
    });
  $("#run-banner").textContent =
    (state.role >= 0
      ? roles[state.role].name
      : "Choose a specialization in Expedition") +
    (state.trial >= 0
      ? " · TRIAL: " + trials[state.trial].name
      : " · Normal expedition");
  scene?.setActivity(state.counts, boosting, cometAvailable(state));
  if (tab === "expedition" && state.trial >= 0) {
    $(`#trial-progress-${state.trial}`).textContent =
      format(state.earned) + " / " + format(trials[state.trial].target);
    $<HTMLButtonElement>("#finish-trial").disabled =
      state.earned < trials[state.trial].target;
  }
  $("#echoes").textContent = format(state.echoes);
  const readyChallenges = challenges.filter(
    (c, i) => !state.claimed.includes(i) && c.value(state) >= c.target,
  ).length;
  $("#legacy-ready").textContent = readyChallenges
    ? `${readyChallenges} ready`
    : "∞";
  $("#legacy-power").textContent =
    `${state.shards} stardust · ${state.relics.reduce((a, b) => a + b, 0)} relic ranks`;
  $("#boost-status").textContent = boosting
    ? `${boostMultiplier(state)}× power · ${Math.ceil((state.boostUntil - now) / 1000)}s remaining`
    : `${Math.floor(state.charge)} / 100 charge · Harvest to recharge`;
  $("#charge-progress").style.width = (boosting ? 100 : state.charge) + "%";
  $<HTMLButtonElement>("#overdrive").disabled = boosting || state.charge < 100;
  $("#overdrive").classList.toggle("ready", state.charge >= 100 && !boosting);
  const cometReady = cometAvailable(state);
  $<HTMLButtonElement>("#comet").disabled = !cometReady;
  $("#comet").classList.toggle("ready", cometReady);
  $("#comet-status").textContent = cometReady
    ? `Catch now! Leaves in ${Math.ceil((state.nextComet + 15000 - now) / 1000)}s`
    : `Next signal in ${Math.max(0, Math.ceil((state.nextComet - now) / 1000))}s · +20 charge`;
  if (tab === "legacy") {
    relics.forEach((r, i) => {
      const unlocked = relicUnlocked(state, i),
        maxed = state.relics[i] >= r.max;
      $(`#relic-rank-${i}`).textContent = `${state.relics[i]} / ${r.max}`;
      $(`#relic-gate-${i}`).textContent = unlocked
        ? "UNLOCKED · PERSISTS THROUGH ASCENSION"
        : "LOCKED · " + r.requirement;
      $(`#relic-price-${i}`).textContent = maxed
        ? "✓ Mastered"
        : "◈ " + relicPrice(state, i);
      $<HTMLButtonElement>(`[data-relic="${i}"]`).disabled =
        !unlocked || maxed || state.echoes < relicPrice(state, i);
    });
    challenges.forEach((c, i) => {
      const done = state.claimed.includes(i),
        ready = c.value(state) >= c.target;
      $(`#challenge-progress-${i}`).textContent =
        `${format(Math.min(c.value(state), c.target))} / ${format(c.target)}`;
      $(`#challenge-reward-${i}`).textContent = done
        ? "✓ Claimed"
        : ready
          ? `Claim ${c.reward} ◈`
          : `${c.reward} ◈`;
      $<HTMLButtonElement>(`[data-challenge="${i}"]`).disabled = done || !ready;
    });
  }
  const goals = [
    {
      at: 15,
      title: "A companion for the journey",
      text: "Harvest 15 aether to build your first orbiting drone.",
    },
    {
      at: 100,
      title: "Below the surface",
      text: "Earn 100 aether and start extracting crystal.",
    },
    {
      at: 850,
      title: "A brighter kind of future",
      text: "Earn 850 aether to discover quantum efficiency.",
    },
    {
      at: 15000,
      title: "The horizon is calling",
      text: "Save 15K aether to explore Ember Reach in Worlds.",
    },
    {
      at: 100000,
      title: "More than a single lifetime",
      text: "Earn 100K aether this expedition to unlock Ascension.",
    },
    {
      at: 1800000,
      title: "Find the celestial heart",
      text: "Reach Celestial Heart, then push into four uncharted worlds.",
    },
  ];
  goals.push(
    {
      at: 3e7,
      title: "The endless tide",
      text: "Explore Tidal Sanctuary to unlock the Architect’s seal.",
    },
    {
      at: 4e10,
      title: "Into the singularity",
      text: "Reach Obsidian Rift and master the late-game research.",
    },
    {
      at: 4e12,
      title: "Beyond the beginning",
      text: "Reach Genesis Beyond for a 25 Echo challenge reward.",
    },
    {
      at: 3e13,
      title: "A legacy worth earning",
      text: "Learn 18 research upgrades and unlock the Genesis covenant.",
    },
  );
  const goal = goals.find((g) => state.earned < g.at) ?? {
    at: state.earned,
    title: "An infinite possibility",
    text: "Ascend, grow your permanent bonus, and start a new odyssey.",
  };
  const percent = Math.min(100, (state.earned / goal.at) * 100);
  $("#goal-title").textContent = goal.title;
  $("#goal-percent").textContent = Math.floor(percent) + "%";
  $("#goal-progress").style.width = percent + "%";
  $("#goal-description").textContent = goal.text;
  const reward = ascensionReward(state);
  $<HTMLButtonElement>("#ascend").disabled = state.trial >= 0;
  $("#ascend-description").textContent =
    state.trial >= 0
      ? "Finish or abandon your trial in Expedition."
      : reward > 0
        ? `Ascend: +${format(reward)} stardust · +${echoReward(state)} Echoes`
        : state.shards > 0
          ? `${state.shards} stardust · +${state.shards * 15}% permanent bonus`
          : "Reach 100K aether to unlock Ascension.";
}
function persist() {
  const ok = save(state);
  $("#save-status").textContent = ok
    ? "✓ Progress saved"
    : "⚠ Save unavailable";
}
const dialog = $<HTMLDialogElement>("#dialog");
$("#close-dialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});
$("#sound").addEventListener("click", () => {
  state.sound = !state.sound;
  tone();
  update();
  persist();
});
$("#ascend").addEventListener("click", () => {
  const reward = ascensionReward(state);
  $("#dialog-content").innerHTML =
    `<span class="modal-symbol">✺</span><h2>A new beginning</h2><p>Let your constellation become stardust. Reset your aether, structures, research, and worlds in exchange for a permanent bonus to every future expedition.</p><div class="modal-stat">${reward} <small>stardust · +${reward * 15}% power</small></div><div class="echo-reward">◈ +${echoReward(state)} Echoes</div><p>Echoes buy permanent relics in Legacy. Earn at least 1M aether in a run to receive Echoes; push farther for more.</p><p>You keep all relics, Echoes, challenge claims, and lifetime records. Unclaimed challenge progress is preserved. Starter relics apply to the new run.</p><button id="confirm-ascend" class="primary" ${reward === 0 ? "disabled" : ""}>${reward === 0 ? "Earn 100K aether to ascend" : "Begin again ✧"}</button>`;
  dialog.showModal();
  $("#confirm-ascend").addEventListener("click", () => {
    if (reward < 1) return;
    state = ascend(state);
    previous = Date.now();
    scene?.setWorld(worlds[0].color);
    dialog.close();
    tab = "legacy";
    document
      .querySelectorAll<HTMLElement>("[data-tab]")
      .forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
    renderItems();
    persist();
    toast("A new odyssey begins. Your stardust makes you stronger.");
  });
});
$("#settings").addEventListener("click", () => {
  $("#dialog-content").innerHTML =
    `<span class="eyebrow">EXPEDITION SETTINGS</span><h2>Make yourself at home.</h2><p>Your progress saves automatically on this device. Your structures keep producing for up to 8 hours while you’re away.</p><div class="settings-stat"><span>Manual harvests</span><strong>${format(state.clicks)}</strong></div><div class="settings-stat"><span>Ascensions</span><strong>${state.ascensions}</strong></div><label class="theme-label">Visual theme<select id="theme">${themes.map((t) => `<option value="${t.id}" ${state.theme === t.id ? "selected" : ""}>${t.name}</option>`).join("")}</select></label><button id="export" class="primary">Export save backup ↓</button><label class="import-label">Import save backup ↑<input id="import" type="file" accept="application/json,.json"/></label><p class="small-print">Single player. No accounts, ads, or purchases. Just you and a universe of possibility.</p>`;
  dialog.showModal();
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
    link.download = "aether-forge-save.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  $("#import").addEventListener("change", async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const imported = parseSave(data);
      if (!imported) throw Error();
      state = imported;
      applyTheme();
      state.savedAt = Date.now();
      previous = Date.now();
      scene?.setWorld(worlds[state.world].color, state.world);
      renderItems();
      persist();
      dialog.close();
      toast("Your expedition has been restored.");
    } catch {
      toast("That save could not be imported. Please choose a valid backup.");
    }
  });
});
$("#overdrive").addEventListener("click", () => {
  if (activateBoost(state)) {
    scene?.pulse();
    tone();
    toast("Core overdrive! Production and harvests are amplified.");
    persist();
    update();
  }
});
$("#comet").addEventListener("click", () => {
  const reward = catchComet(state);
  if (reward) {
    scene?.burst();
    tone();
    toast("Comet captured! +" + format(reward) + " aether and +20 charge.");
    persist();
    update();
  }
});
$("#world-ability").addEventListener("click", () => {
  if (worldAbility(state)) {
    scene?.burst();
    tone();
    update();
    persist();
  }
});
$("#items").addEventListener("change", (e) => {
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
  previous = Date.now();
  scene?.setWorld(worlds[state.world].color, state.world);
  renderItems();
  persist();
}
function confirmRunReset(
  title: string,
  description: string,
  action: () => State,
) {
  $("#dialog-content").innerHTML =
    `<h2>${title}</h2><p>${description}</p><button class="primary" id="confirm-run">Confirm and begin</button>`;
  dialog.showModal();
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
      ? `${count} ${tab === "legacy" ? "rewards claimed" : tab === "research" ? "discoveries learned" : "structures built"}.`
      : "Nothing affordable or ready yet.",
  );
  if (count) scene?.burst();
  update();
  persist();
});
scene?.setWorld(worlds[state.world].color, state.world);
applyTheme();
renderItems();
let previous = Date.now();
setInterval(() => {
  const now = Date.now();
  advance(state, previous, now);
  previous = now;
  if (!document.hidden) passiveActions(state, now);
  update();
}, 100);
setInterval(persist, 10000);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) persist();
});
window.addEventListener("pagehide", persist);
if (offline > 1)
  toast(
    `Welcome back. Your constellation gathered ${format(offline)} aether while you were away.`,
  );
