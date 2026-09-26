import { test } from "node:test";
import assert from "node:assert/strict";
import {
  challenges,
  buyAll,
  claimSector,
  sectors,
  worldFactor,
  abilityAvailable,
  fresh,
  gain,
  buy,
  price,
  production,
  clickPower,
  ascensionReward,
  balance,
} from "./game.ts";
test("buying requires funds and starts automatic production", () => {
  const s = fresh();
  assert.equal(buy(s, 0, 1), false);
  gain(s, 15);
  assert.equal(buy(s, 0, 1), true);
  assert.equal(s.energy, 0);
  assert.equal(production(s), units[0].rate);
  assert.equal(s.earned, 15);
});
test("bulk purchases use the geometric price curve", () => {
  const s = fresh();
  const expected = Math.ceil(
    Array.from({ length: 10 }, (_, i) => 15 * 1.15 ** i).reduce(
      (a, b) => a + b,
      0,
    ),
  );
  assert.equal(price(s, 0, 10), expected);
  gain(s, expected);
  assert.ok(buy(s, 0, 10));
  assert.equal(s.counts[0], 10);
  assert.equal(s.energy, 0);
});
test("research, worlds and stardust compound production", () => {
  const s = fresh();
  s.counts[0] = 10;
  s.upgrades = [0, 1, 2, 3, 4, 5];
  s.world = 2;
  s.shards = 10;
  const stardust = 1 + 10 * balance.stardustBonus;
  const expected =
    10 * units[0].rate * 2 * 2 * 3 * worlds[2].multiplier * stardust;
  assert.ok(Math.abs(production(s) - expected) < 1e-9);
  assert.ok(
    Math.abs(
      clickPower(s) - (15 * worlds[2].multiplier * stardust + expected * 0.05),
    ) < 1e-9,
  );
});
test("ascension reward uses earned energy, not remaining reserve", () => {
  const s = fresh();
  gain(s, 400000);
  s.energy = 0;
  assert.equal(
    ascensionReward(s),
    Math.floor(balance.stardustScale * 4 ** balance.stardustExponent),
  );
  assert.ok(ascensionReward(s) > 0);
  assert.equal(s.lifetime, 400000);
});
test("invalid income cannot corrupt game state", () => {
  const s = fresh();
  gain(s, NaN);
  gain(s, Infinity);
  gain(s, -100);
  assert.equal(s.energy, 0);
});

import {
  units,
  research,
  worlds,
  relics,
  parseSave,
  advance,
  activateBoost,
  harvest,
  catchComet,
  echoReward,
  ascend,
  buyRelic,
  claimChallenge,
  recordMilestones,
  relicUnlocked,
} from "./game.ts";
test("original saves migrate without losing structures or currency", () => {
  const old: any = {
    ...fresh(),
    energy: 1234,
    counts: [8, 2, 1, 0, 0, 0],
    world: 2,
    upgrades: [0, 1],
  };
  for (const key of [
    "echoes",
    "relics",
    "claimed",
    "totalClicks",
    "bestWorld",
    "bestResearch",
    "bestStructures",
    "comets",
    "charge",
    "boostUntil",
    "nextComet",
  ])
    delete old[key];
  const s = parseSave(old)!;
  assert.ok(s);
  assert.equal(s.energy, 1234);
  assert.deepEqual(s.counts.slice(0, 6), old.counts);
  assert.equal(s.counts.length, 16);
  assert.equal(s.bestWorld, 2);
  assert.equal(s.relics.length, relics.length);
});
test("invalid imports reject without inventing a fresh save", () => {
  assert.equal(parseSave({ ...fresh(), charge: 101 }), null);
  assert.equal(parseSave({ ...fresh(), relics: [99] }), null);
  assert.equal(parseSave({ ...fresh(), counts: [-1, 0, 0, 0, 0, 0] }), null);
  assert.equal(parseSave({ ...fresh(), upgrades: [1, 1] }), null);
});
test("overdrive requires manual charge and cannot stack", () => {
  const s = fresh();
  for (let i = 0; i < 50; i++) harvest(s, 1000);
  assert.equal(s.charge, 100);
  assert.ok(activateBoost(s, 1000));
  assert.equal(s.charge, 0);
  assert.equal(activateBoost(s, 1000), false);
  assert.equal(harvest(s, 2000), 3);
  assert.equal(s.charge, 0);
});
test("income integration counts boost expiration exactly and caps offline time", () => {
  const s = fresh();
  s.counts[0] = 10;
  s.boostUntil = 21000;
  const rate = production(s);
  assert.ok(Math.abs(advance(s, 1000, 31000) - rate * (20 * 3 + 10)) < 1e-9);
  s.boostUntil = 0;
  assert.ok(
    Math.abs(advance(s, 31000, 31000 + 12 * 3600000) - rate * 8 * 3600) < 1e-6,
  );
});
test("comets cannot be claimed early, expired, or twice", () => {
  const s = fresh();
  s.nextComet = 1000;
  assert.equal(catchComet(s, 999), 0);
  assert.equal(catchComet(s, 16000), 0);
  assert.equal(catchComet(s, 1000), 25);
  assert.equal(s.comets, 1);
  assert.equal(s.charge, 20);
  assert.equal(catchComet(s, 1000), 0);
});
test("relics require their milestone and Echoes, spending never reduces stardust", () => {
  const s = fresh();
  s.echoes = 100;
  s.shards = 5;
  assert.equal(buyRelic(s, 0), false);
  s.ascensions = 1;
  assert.ok(buyRelic(s, 0));
  assert.equal(s.echoes, 98);
  assert.equal(s.shards, 5);
  assert.ok(buyRelic(s, 0));
  assert.ok(buyRelic(s, 0));
  assert.equal(buyRelic(s, 0), false);
  assert.equal(s.echoes, 86);
});
test("challenges award Echoes once and survive ascension", () => {
  const s = fresh();
  assert.equal(claimChallenge(s, 0), false);
  s.totalClicks = 500;
  assert.ok(claimChallenge(s, 0));
  assert.equal(s.echoes, 3);
  assert.equal(claimChallenge(s, 0), false);
  s.earned = 100000;
  const next = ascend(s);
  assert.equal(next.echoes, 3);
  assert.equal(claimChallenge(next, 0), false);
});
test("deeper expeditions reward more Echoes and legacy affects next run", () => {
  const s = fresh();
  s.earned = 999999;
  assert.equal(echoReward(s), 0);
  s.earned = 1e6;
  assert.equal(echoReward(s), 1);
  s.earned = 1e8;
  s.world = 4;
  assert.equal(echoReward(s), 5);
  s.relics[0] = 2;
  s.relics[6] = 1;
  s.energy = 1000;
  s.counts[1] = 50;
  s.upgrades = [0, 1, 2, 3, 4, 5];
  const next = ascend(s);
  assert.equal(next.echoes, 5);
  assert.equal(next.energy, 0);
  assert.equal(next.counts[0], 10);
  assert.equal(next.counts[1], 0);
  assert.deepEqual(next.upgrades, [0, 1, 2]);
  assert.equal(next.world, 0);
  assert.equal(next.bestWorld, 4);
  assert.equal(next.ascensions, 1);
  assert.equal(next.relics[6], 1);
});
test("legendary relic needs both final world and complete research", () => {
  const s = fresh();
  s.world = 7;
  recordMilestones(s);
  assert.equal(relicUnlocked(s, 7), false);
  s.upgrades = research.map((_, i) => i);
  recordMilestones(s);
  assert.equal(relicUnlocked(s, 7), true);
});
test("all expansion content contributes finite meaningful progression", () => {
  const s = fresh();
  s.counts = units.map(() => 10);
  s.upgrades = research.map((_, i) => i);
  s.world = worlds.length - 1;
  assert.ok(Number.isFinite(production(s)));
  assert.ok(production(s) > 1e12);
  assert.equal(units.length, 16);
  assert.equal(research.length, 26);
  assert.equal(worlds.length, 12);
});

import {
  chooseRole,
  startTrial,
  finishTrial,
  learn,
  explore,
  automate,
  toggleArtifact,
  worldAbility,
  worldPrice,
  passiveActions,
} from "./game.ts";
test("x100 uses the geometric price and purchases exactly 100", () => {
  const s = fresh();
  s.energy = price(s, 0, 100);
  assert.ok(buy(s, 0, 100));
  assert.equal(s.counts[0], 100);
  assert.equal(s.energy, 0);
  assert.equal(buy(s, 0, 101), false);
});
test("v2 saves retain owned relics and extend new arrays", () => {
  const old = {
    ...fresh(),
    counts: Array(12).fill(8),
    relics: [1, 2, 0, 0, 1, 0, 0, 1],
    echoes: 17,
  };
  const s = parseSave(old)!;
  assert.ok(s);
  assert.deepEqual(s.relics.slice(0, 8), old.relics);
  assert.equal(s.relics.length, 14);
  assert.deepEqual(s.counts.slice(12), [0, 0, 0, 0]);
  assert.equal(s.echoes, 17);
});
test("specializations are exclusive per run and reset after ascension", () => {
  const s = fresh();
  s.counts[0] = 10;
  assert.ok(chooseRole(s, 0));
  assert.ok(Math.abs(production(s) - 10 * units[0].rate * 1.5) < 1e-9);
  assert.equal(price(s, 1), 85);
  assert.equal(chooseRole(s, 2), false);
  s.earned = 1e6;
  assert.equal(ascend(s).role, -1);
  const e = fresh();
  chooseRole(e, 1);
  assert.equal(worldPrice(e, 1), Math.ceil(worlds[1].cost * 0.7));
});
test("silent trial suspends inherited powers and blocks every manual harvest", () => {
  const s = fresh();
  s.ascensions = 1;
  s.shards = 10000;
  s.relics = relics.map((r) => r.max);
  s.echoes = 300;
  const t = startTrial(s, 0);
  assert.equal(t.counts[0], 1);
  assert.equal(t.counts[5], 0);
  assert.equal(production(t), units[0].rate);
  assert.equal(harvest(t), 0);
  assert.equal(t.clicks, 0);
  assert.equal(t.energy, 0);
  assert.equal(t.echoes, 300);
  assert.equal(ascend(t), t);
});
test("three pillars blocks a fourth type, including automation", () => {
  const s = fresh();
  s.ascensions = 1;
  const t = startTrial(s, 1);
  t.energy = 1e15;
  buy(t, 0, 1);
  buy(t, 1, 1);
  buy(t, 2, 1);
  assert.equal(buy(t, 3, 1), false);
  assert.ok(buy(t, 1, 100));
  t.autoEnabled = true;
  automate(t, 1000);
  assert.equal(t.counts.filter((n) => n > 0).length, 3);
});
test("unwritten sky blocks research, trial finish pays once and preserves legacy", () => {
  const s = fresh();
  s.ascensions = 1;
  s.echoes = 7;
  const t = startTrial(s, 2);
  t.energy = 1e9;
  assert.equal(learn(t, 0), false);
  assert.equal(finishTrial(t), t);
  t.earned = 1e7;
  const n = finishTrial(t);
  assert.equal(n.echoes, 57);
  assert.deepEqual(n.completedTrials, [2]);
  assert.equal(n.trial, -1);
  const repeat = startTrial(n, 2);
  repeat.earned = 1e7;
  assert.equal(finishTrial(repeat).echoes, 57);
});
test("abandoning trials grants neither rewards nor ascension currency", () => {
  const s = fresh();
  s.ascensions = 1;
  const t = startTrial(s, 0);
  t.earned = 1e12;
  const n = finishTrial(t, true);
  assert.equal(n.echoes, 0);
  assert.equal(n.shards, 0);
  assert.deepEqual(n.completedTrials, []);
});
test("automation respects its unlock, per-tick budget, cadence, and pause", () => {
  const s = fresh();
  s.energy = 10000;
  s.autoEnabled = true;
  assert.equal(automate(s, 1000), 0);
  s.ascensions = 1;
  s.autoBudget = 10;
  assert.ok(automate(s, 1000) > 0);
  assert.ok(s.energy >= 9000);
  const balance = s.energy;
  assert.equal(automate(s, 1500), 0);
  assert.equal(s.energy, balance);
  s.autoEnabled = false;
  assert.equal(automate(s, 3000), 0);
});
test("artifact slots enforce unlocks and the three-slot cap", () => {
  const s = fresh();
  assert.equal(toggleArtifact(s, 4), false);
  s.bestWorld = 3;
  s.comets = 10;
  s.completedTrials = [0, 1, 2];
  assert.ok(toggleArtifact(s, 0));
  assert.ok(toggleArtifact(s, 1));
  assert.ok(toggleArtifact(s, 2));
  assert.equal(toggleArtifact(s, 3), false);
  assert.ok(toggleArtifact(s, 1));
  assert.ok(toggleArtifact(s, 4));
  assert.equal(s.artifacts.length, 3);
});
test("world ability cooldown carries across world purchases", () => {
  const s = fresh();
  s.worldMeter = 100;
  assert.ok(worldAbility(s, 1000));
  assert.equal(worldAbility(s, 1001), false);
  s.energy = 1e8;
  explore(s, 1);
  assert.equal(worldAbility(s, 2000), false);
  s.worldMeter = 100;
  assert.ok(worldAbility(s, 91000));
});
test("cosmic magnet catches only once and is suspended in trials", () => {
  const s = fresh();
  s.relics[11] = 1;
  s.nextComet = 1000;
  passiveActions(s, 1000);
  assert.equal(s.comets, 1);
  passiveActions(s, 1001);
  assert.equal(s.comets, 1);
  s.trial = 0;
  s.nextComet = 2000;
  passiveActions(s, 2000);
  assert.equal(s.comets, 1);
});
test("invalid expedition settings are rejected by save parser", () => {
  assert.equal(parseSave({ ...fresh(), role: 9 }), null);
  assert.equal(parseSave({ ...fresh(), trial: 3 }), null);
  assert.equal(parseSave({ ...fresh(), artifacts: [0, 1, 2, 3] }), null);
  assert.equal(parseSave({ ...fresh(), autoBudget: 100 }), null);
});

test("buy all buys one selected batch per affordable type and honors trials", () => {
  const s = fresh();
  s.energy = price(s, 0, 100);
  assert.equal(buyAll(s, "structures", 100), 100);
  assert.equal(s.counts[0], 100);
  assert.equal(s.energy, 0);
  s.energy = 1e30;
  s.trial = 1;
  buyAll(s, "structures");
  assert.equal(s.counts.filter((n) => n > 0).length, 3);
  s.trial = 2;
  assert.equal(buyAll(s, "research"), 0);
});
test("sector rewards are one-time and themes survive resets", () => {
  const s = fresh();
  s.bestWorld = 11;
  s.claimed = challenges.map((_, i) => i);
  s.theme = "nebula";
  assert.ok(claimSector(s, 0));
  assert.equal(claimSector(s, 0), false);
  assert.equal(buyAll(s, "legacy"), 3);
  assert.equal(
    s.echoes,
    sectors.reduce((n, sector) => n + sector.reward, 0),
  );
  s.earned = 1e6;
  const next = ascend(s);
  assert.equal(next.theme, "nebula");
  assert.deepEqual(next.sectorClaims, [0, 1, 2, 3]);
  assert.equal(parseSave({ ...next, worldMeter: 101 }), null);
  assert.equal(parseSave({ ...next, theme: "invalid" }), null);
});
test("world mechanics consume resources and enforce sacrifice and seeding limits", () => {
  const s = fresh();
  assert.equal(abilityAvailable(s, 1000), false);
  for (let i = 0; i < 10; i++) harvest(s, 1000);
  assert.equal(s.worldMeter, 10);
  assert.ok(worldAbility(s, 1000));
  assert.equal(s.worldMeter, 0);
  s.world = 6;
  s.worldReady = 0;
  assert.equal(worldAbility(s, 1000), false);
  s.counts[0] = 2;
  assert.ok(worldAbility(s, 1000));
  assert.equal(s.counts[0], 1);
  assert.equal(worldFactor(s), 1.25);
  s.world = 7;
  s.worldReady = 0;
  s.worldStacks = 0;
  s.energy = 1000;
  assert.ok(worldAbility(s, 1000));
  assert.equal(s.energy, 900);
  assert.equal(worldFactor(s), 1.5);
  s.worldStacks = 10;
  assert.equal(abilityAvailable(s, 1e9), false);
});
test("silence income integrates equally across offline and foreground intervals", () => {
  const a = fresh();
  a.world = 10;
  a.counts[0] = 1;
  a.worldMeter = 70;
  a.boostUntil = 15000;
  const b = structuredClone(a);
  advance(a, 0, 60000);
  for (let t = 0; t < 60000; t += 1000) advance(b, t, t + 1000);
  assert.ok(Math.abs(a.energy - b.energy) < 1e-6);
  assert.equal(a.worldMeter, 100);
  harvest(a);
  assert.equal(a.worldMeter, 0);
});

import {
  BUY_MAX,
  MAX_BATCH,
  SAVE_KEY,
  catchComet as catchCometV5,
  explore as exploreV5,
  format,
  load,
  maxAffordable,
  nextStardustAt,
  readyRewards,
  resetAll,
  save,
  unitOutput,
  worldAbility as worldAbilityV5,
} from "./game.ts";

/** Run `body` with an in-memory localStorage, restoring the real global afterwards. */
function withStorage(body: (store: Map<string, string>) => void) {
  const store = new Map<string, string>();
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, String(v)),
      removeItem: (k: string) => void store.delete(k),
    },
  });
  try {
    body(store);
  } finally {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else delete (globalThis as { localStorage?: unknown }).localStorage;
  }
}

test("solar ignition's fractional charge survives a save round trip (save-wipe regression)", () => {
  const s = fresh();
  s.world = 5;
  s.worldMeter = 37.774;
  assert.ok(worldAbilityV5(s, 1000));
  assert.ok(!Number.isInteger(s.charge));
  const loaded = parseSave(JSON.parse(JSON.stringify(s)));
  assert.ok(
    loaded,
    "a legitimately fractional charge must not invalidate the save",
  );
  assert.equal(loaded.charge, s.charge);
});

test("an unreadable save is backed up and never silently discarded", () => {
  withStorage((store) => {
    store.set(SAVE_KEY, "{not json");
    const broken = load();
    assert.ok(broken.backupKey);
    assert.equal(store.get(broken.backupKey!), "{not json");
    assert.equal(broken.state.energy, 0);

    store.clear();
    const s = fresh();
    s.energy = 1234;
    assert.ok(save(s));
    const ok = load();
    assert.equal(ok.backupKey, undefined);
    assert.equal(ok.state.energy, 1234);

    store.clear();
    assert.equal(
      load().backupKey,
      undefined,
      "a first visit is not a corrupt save",
    );
  });
});

test("max purchases buy exactly the largest affordable batch", () => {
  const s = fresh();
  s.energy = 1e6;
  const n = maxAffordable(s, 0);
  assert.ok(n > 1);
  assert.ok(price(s, 0, n) <= s.energy);
  assert.ok(price(s, 0, n + 1) > s.energy);
  assert.ok(buy(s, 0, n));
  assert.equal(maxAffordable(fresh(), 0), 0);
  assert.equal(buy(fresh(), 0, MAX_BATCH + 1), false);
  const t = fresh();
  t.energy = 1e9;
  const top = units.findLastIndex((u) => u.base <= 1e9);
  const bought = buyAll(t, "structures", BUY_MAX);
  assert.ok(bought > 0);
  assert.ok(
    t.counts[top] > 0,
    "the most expensive affordable tier is bought first",
  );
  assert.ok(
    t.energy >= 0 && t.energy < price(t, 0),
    "drones soak up the remainder",
  );
});

test("per-unit output sums to total production", () => {
  const s = fresh();
  s.counts = units.map((_, i) => i + 3);
  s.upgrades = research.map((_, i) => i);
  s.world = 7;
  s.role = 0;
  const sum = units.reduce((n, _, i) => n + unitOutput(s, i) * s.counts[i], 0);
  assert.ok(Math.abs(sum / production(s) - 1) < 1e-12);
});

test("large numbers keep readable suffixes and never round up to 1000", () => {
  assert.equal(format(999), "999");
  assert.equal(format(999.6), "1.00K");
  assert.equal(format(999_950), "1.00M");
  assert.equal(format(2.5e28), "25.0Oc");
  assert.equal(format(1e36), "1.00e36");
  assert.equal(format(Infinity), "∞");
});

test("ready rewards count both challenges and sector milestones", () => {
  const s = fresh();
  assert.equal(readyRewards(s), 0);
  s.totalClicks = 500;
  s.bestWorld = 2;
  assert.equal(readyRewards(s), 2);
  buyAll(s, "legacy");
  assert.equal(readyRewards(s), 0);
});

test("a full reset erases progress but keeps presentation preferences", () => {
  const s = fresh();
  s.echoes = 50;
  s.shards = 9;
  s.relics[1] = 2;
  s.theme = "solar";
  s.sound = true;
  const r = resetAll(s);
  assert.equal(r.echoes, 0);
  assert.equal(r.shards, 0);
  assert.equal(r.relics[1], 0);
  assert.equal(r.theme, "solar");
  assert.equal(r.sound, true);
});

test("next stardust threshold is the earned amount that raises the reward", () => {
  const s = fresh();
  s.earned = 5e6;
  const at = nextStardustAt(s);
  assert.ok(at > s.earned);
  const t = fresh();
  t.earned = at * 1.0001;
  assert.equal(ascensionReward(t), ascensionReward(s) + 1);
});

/**
 * Greedy simulated player: harvests, buys the best output per cost, learns research,
 * travels, catches comets, and uses overdrive and world powers. Returns the minute
 * each world was first reached. Guards the pacing against runaway compounding.
 */
function simulateRun(minutes: number, clicksPerSecond = 3, start = fresh()) {
  let s = start;
  s.nextComet = 45000;
  const reached: number[] = [0];
  const marginal = (i: number) => {
    const base = production(s);
    s.counts[i]++;
    const next = production(s);
    s.counts[i]--;
    return next - base;
  };
  for (let t = 0; t < minutes * 60000; t += 1000) {
    for (let c = 0; c < clicksPerSecond; c++) harvest(s, t);
    advance(s, t, t + 1000);
    catchCometV5(s, t + 1000);
    activateBoost(s, t + 1000);
    if (s.role < 0) chooseRole(s, 0);
    if (abilityAvailable(s, t + 1000) && s.worldMeter >= 60)
      worldAbilityV5(s, t + 1000);
    if (t % 5000 === 0) {
      while (exploreV5(s, s.world + 1)) reached[s.world] = t / 60000;
      buyAll(s, "research");
      for (let k = 0; k < 200; k++) {
        let best = -1,
          score = 0;
        units.forEach((_, i) => {
          const p = price(s, i);
          if (p <= s.energy && marginal(i) / p > score) {
            score = marginal(i) / p;
            best = i;
          }
        });
        if (best < 0 || !buy(s, best, 1)) break;
      }
    }
  }
  return { reached, state: s };
}

test("pacing: a fresh expedition is a climb, not a sprint", () => {
  const { reached, state } = simulateRun(60);
  const firstAscension = fresh();
  assert.ok(
    reached[1] !== undefined,
    "an active player reaches world 2 within an hour",
  );
  assert.ok(
    reached[1] >= 4,
    `world 2 took ${reached[1]} minutes; expected at least 4`,
  );
  assert.equal(
    reached[4],
    undefined,
    "world 5 should need prestige, not one hour",
  );
  assert.ok(
    state.earned >= balance.stardustBase,
    "the first ascension unlocks in the first hour",
  );
  assert.ok(
    ascensionReward(state) < 20,
    "one early run cannot mint a huge prestige bonus",
  );
  assert.equal(firstAscension.shards, 0);
});

test("pacing: prestige accelerates the next run without skipping the whole game", () => {
  const start = fresh();
  start.ascensions = 1;
  start.shards = 30;
  const { reached } = simulateRun(45, 3, start);
  assert.ok(reached[2] !== undefined, "stardust makes the early worlds quick");
  assert.equal(
    reached[7],
    undefined,
    "30 stardust must not carry a run to world 8",
  );
});
