import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  gain,
  buy,
  price,
  production,
  clickPower,
  ascensionReward,
} from "./game.ts";
test("buying requires funds and starts automatic production", () => {
  const s = fresh();
  assert.equal(buy(s, 0, 1), false);
  gain(s, 15);
  assert.equal(buy(s, 0, 1), true);
  assert.equal(s.energy, 0);
  assert.equal(production(s), 0.8);
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
  assert.equal(production(s), 960);
  assert.equal(clickPower(s), 198);
});
test("ascension reward uses earned energy, not remaining reserve", () => {
  const s = fresh();
  gain(s, 400000);
  s.energy = 0;
  assert.equal(ascensionReward(s), 2);
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
  assert.equal(advance(s, 1000, 31000), 8 * (20 * 3 + 10));
  s.boostUntil = 0;
  assert.equal(advance(s, 31000, 31000 + 12 * 3600000), 8 * 8 * 3600);
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
  assert.equal(production(s), 16);
  assert.equal(price(s, 1), 85);
  assert.equal(chooseRole(s, 2), false);
  s.earned = 1e6;
  assert.equal(ascend(s).role, -1);
  const e = fresh();
  chooseRole(e, 1);
  assert.equal(worldPrice(e, 1), 10500);
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
  assert.equal(production(t), 0.8);
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
  assert.ok(worldAbility(s, 1000));
  assert.equal(worldAbility(s, 1001), false);
  s.energy = 1e8;
  explore(s, 1);
  assert.equal(worldAbility(s, 2000), false);
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
