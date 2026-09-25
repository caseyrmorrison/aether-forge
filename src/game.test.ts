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
  assert.equal(s.counts.length, 12);
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
  assert.equal(units.length, 12);
  assert.equal(research.length, 18);
  assert.equal(worlds.length, 8);
});
