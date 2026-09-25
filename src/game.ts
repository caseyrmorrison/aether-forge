export const units = [
  {
    name: "Orbiting drone",
    detail: "A tireless companion. A little more possibility.",
    base: 15,
    rate: 0.8,
    icon: "◇",
  },
  {
    name: "Crystal extractor",
    detail: "Turn the planet’s hidden veins into pure energy.",
    base: 100,
    rate: 5,
    icon: "♢",
  },
  {
    name: "Solar array",
    detail: "Catch the light between distant stars.",
    base: 650,
    rate: 28,
    icon: "▦",
  },
  {
    name: "Aether refinery",
    detail: "Distill raw starlight into something extraordinary.",
    base: 4000,
    rate: 150,
    icon: "⬡",
  },
  {
    name: "Orbital foundry",
    detail: "An entire industry, suspended in the void.",
    base: 24000,
    rate: 800,
    icon: "◎",
  },
  {
    name: "Stellar engine",
    detail: "Put the heart of a star to work.",
    base: 150000,
    rate: 4500,
    icon: "✺",
  },
  {
    name: "Lunar greenhouse",
    detail: "Grow living aether in orbital gardens.",
    base: 1e6,
    rate: 25000,
    icon: "❋",
  },
  {
    name: "Gravity loom",
    detail: "Weave space-time into a renewable resource.",
    base: 8e6,
    rate: 150000,
    icon: "⌘",
  },
  {
    name: "Nebula harvester",
    detail: "Gather the dreams of unborn stars.",
    base: 7e7,
    rate: 1e6,
    icon: "✥",
  },
  {
    name: "Singularity reactor",
    detail: "A captive black hole. A limitless appetite.",
    base: 7e8,
    rate: 8e6,
    icon: "◉",
  },
  {
    name: "Reality synthesizer",
    detail: "Rewrite the rules of matter itself.",
    base: 8e9,
    rate: 7e7,
    icon: "⬢",
  },
  {
    name: "Genesis ark",
    detail: "Build the seed of another universe.",
    base: 1e11,
    rate: 7e8,
    icon: "✵",
  },
];
export const research = [
  {
    name: "Resonant touch",
    detail: "Your manual harvests are 3× stronger.",
    cost: 120,
    kind: "click",
  },
  {
    name: "Quantum efficiency",
    detail: "All structures produce 2× more energy.",
    cost: 850,
    kind: "production",
  },
  {
    name: "Harmonic resonance",
    detail: "Manual harvests gain 5% of your production.",
    cost: 2500,
    kind: "synergy",
  },
  {
    name: "Stellar alignment",
    detail: "All structures produce another 2× energy.",
    cost: 12000,
    kind: "production",
  },
  {
    name: "Deep-core resonance",
    detail: "Manual harvests become 5× stronger.",
    cost: 60000,
    kind: "click",
  },
  {
    name: "Zero-point energy",
    detail: "All structures produce another 3× energy.",
    cost: 300000,
    kind: "production",
  },
  {
    name: "Drone intelligence",
    detail: "Orbiting drones produce 10× more.",
    cost: 8e5,
    kind: "drones",
  },
  {
    name: "Living circuitry",
    detail: "All production increases 2×.",
    cost: 3e6,
    kind: "production",
  },
  {
    name: "Pulse capacitors",
    detail: "Overdrive lasts 10 seconds longer.",
    cost: 1e7,
    kind: "duration",
  },
  {
    name: "Comet cartography",
    detail: "Comet rewards become 2× stronger.",
    cost: 3e7,
    kind: "comet",
  },
  {
    name: "Gravitational touch",
    detail: "Manual harvests become 10× stronger.",
    cost: 1e8,
    kind: "click",
  },
  {
    name: "Nebula harmonics",
    detail: "All production increases 3×.",
    cost: 4e8,
    kind: "production",
  },
  {
    name: "Industry of stars",
    detail: "Structures 7–12 produce 3× more.",
    cost: 2e9,
    kind: "industry",
  },
  {
    name: "Perfect resonance",
    detail: "Manual harvests gain another 10% of production.",
    cost: 1e10,
    kind: "synergy",
  },
  {
    name: "Event horizon",
    detail: "Overdrive increases from 3× to 5×.",
    cost: 6e10,
    kind: "overdrive",
  },
  {
    name: "Multiverse exchange",
    detail: "All production increases 4×.",
    cost: 4e11,
    kind: "production",
  },
  {
    name: "Eternal combustion",
    detail: "Each manual harvest charges Overdrive twice as fast.",
    cost: 3e12,
    kind: "charge",
  },
  {
    name: "The final theorem",
    detail: "All production increases 5×. Unlock a legendary relic.",
    cost: 3e13,
    kind: "production",
  },
];
export const worlds = [
  {
    name: "Verdant Prime",
    type: "CRYSTALLINE WORLD",
    cost: 0,
    multiplier: 1,
    color: 0x69ebcb,
    description: "Somewhere in the quiet, something extraordinary is growing.",
  },
  {
    name: "Ember Reach",
    type: "VOLCANIC WORLD",
    cost: 15000,
    multiplier: 2,
    color: 0xffa16a,
    description: "From ancient fire, a new beginning takes shape.",
  },
  {
    name: "Violet Expanse",
    type: "NEBULA WORLD",
    cost: 160000,
    multiplier: 4,
    color: 0xba97ff,
    description: "At the edge of the known, possibility becomes infinite.",
  },
  {
    name: "Celestial Heart",
    type: "TRANSCENDENT WORLD",
    cost: 1800000,
    multiplier: 8,
    color: 0x9ddfff,
    description: "Every distant light was leading you here.",
  },
  {
    name: "Tidal Sanctuary",
    type: "OCEAN WORLD",
    cost: 3e7,
    multiplier: 16,
    color: 0x4dcaf2,
    description: "An ocean of stars, waiting for the tide to turn.",
  },
  {
    name: "Golden Elysium",
    type: "SOLAR WORLD",
    cost: 8e8,
    multiplier: 32,
    color: 0xffd36e,
    description: "In the light of twin suns, nothing stays ordinary.",
  },
  {
    name: "Obsidian Rift",
    type: "SINGULARITY WORLD",
    cost: 4e10,
    multiplier: 64,
    color: 0xff79ae,
    description: "Beyond the event horizon, the universe holds its breath.",
  },
  {
    name: "Genesis Beyond",
    type: "ORIGIN WORLD",
    cost: 4e12,
    multiplier: 128,
    color: 0xebdeff,
    description:
      "This is not the end of the universe. It is the beginning of yours.",
  },
];
export type State = {
  energy: number;
  earned: number;
  lifetime: number;
  clicks: number;
  counts: number[];
  upgrades: number[];
  world: number;
  shards: number;
  ascensions: number;
  savedAt: number;
  sound: boolean;
  echoes: number;
  relics: number[];
  claimed: number[];
  bestWorld: number;
  bestResearch: number;
  bestStructures: number;
  totalClicks: number;
  comets: number;
  charge: number;
  boostUntil: number;
  nextComet: number;
};
export const relics = [
  {
    name: "Seed of industry",
    detail: "Start each new expedition with 5 drones per rank.",
    cost: 2,
    max: 3,
    gate: 1,
    requirement: "Complete your first ascension",
  },
  {
    name: "Prismatic heart",
    detail: "+25% production per rank, forever.",
    cost: 3,
    max: 5,
    gate: 1,
    requirement: "Complete your first ascension",
  },
  {
    name: "Founder’s touch",
    detail: "Manual harvests gain +100% power per rank.",
    cost: 3,
    max: 3,
    gate: 2,
    requirement: "Perform 500 lifetime manual harvests",
  },
  {
    name: "Architect’s seal",
    detail: "Structures cost 10% less per rank.",
    cost: 6,
    max: 3,
    gate: 3,
    requirement: "Reach Tidal Sanctuary (world 5)",
  },
  {
    name: "Comet compass",
    detail: "+50% comet rewards per rank.",
    cost: 8,
    max: 3,
    gate: 4,
    requirement: "Catch 25 comets",
  },
  {
    name: "Eternal capacitor",
    detail: "Overdrive lasts 5 extra seconds per rank.",
    cost: 10,
    max: 3,
    gate: 5,
    requirement: "Build 200 structures in one expedition",
  },
  {
    name: "Scholar’s memory",
    detail: "Start new expeditions with the first 3 research upgrades.",
    cost: 20,
    max: 1,
    gate: 6,
    requirement: "Learn 12 research upgrades in one expedition",
  },
  {
    name: "Genesis covenant",
    detail: "Double production and earn +50% ascension Echoes.",
    cost: 40,
    max: 1,
    gate: 7,
    requirement: "Reach Genesis Beyond AND learn all 18 research upgrades",
  },
];
export const fresh = (): State => ({
  energy: 0,
  earned: 0,
  lifetime: 0,
  clicks: 0,
  counts: units.map(() => 0),
  upgrades: [],
  world: 0,
  shards: 0,
  ascensions: 0,
  savedAt: Date.now(),
  sound: false,
  echoes: 0,
  relics: relics.map(() => 0),
  claimed: [],
  bestWorld: 0,
  bestResearch: 0,
  bestStructures: 0,
  totalClicks: 0,
  comets: 0,
  charge: 0,
  boostUntil: 0,
  nextComet: Date.now() + 45000,
});
export function recordMilestones(s: State) {
  s.bestWorld = Math.max(s.bestWorld, s.world);
  s.bestResearch = Math.max(s.bestResearch, s.upgrades.length);
  s.bestStructures = Math.max(
    s.bestStructures,
    s.counts.reduce((a, b) => a + b, 0),
  );
}
export function relicUnlocked(s: State, i: number) {
  switch (relics[i]?.gate) {
    case 1:
      return s.ascensions >= 1;
    case 2:
      return s.totalClicks >= 500;
    case 3:
      return s.bestWorld >= 4;
    case 4:
      return s.comets >= 25;
    case 5:
      return s.bestStructures >= 200;
    case 6:
      return s.bestResearch >= 12;
    case 7:
      return s.bestWorld >= 7 && s.bestResearch >= 18;
    default:
      return false;
  }
}
export const relicPrice = (s: State, i: number) =>
  relics[i].cost * 2 ** s.relics[i];
export function buyRelic(s: State, i: number) {
  if (
    !relics[i] ||
    !relicUnlocked(s, i) ||
    s.relics[i] >= relics[i].max ||
    s.echoes < relicPrice(s, i)
  )
    return false;
  s.echoes -= relicPrice(s, i);
  s.relics[i]++;
  return true;
}
export const challenges = [
  {
    name: "Hands of the maker",
    detail: "Perform 500 lifetime manual harvests.",
    reward: 3,
    value: (s: State) => s.totalClicks,
    target: 500,
  },
  {
    name: "A constellation of industry",
    detail: "Build 200 structures in one expedition.",
    reward: 6,
    value: (s: State) => s.bestStructures,
    target: 200,
  },
  {
    name: "Beyond the familiar",
    detail: "Reach Tidal Sanctuary, the fifth world.",
    reward: 8,
    value: (s: State) => s.bestWorld + 1,
    target: 5,
  },
  {
    name: "Chasing the impossible",
    detail: "Catch 25 comets across your expeditions.",
    reward: 10,
    value: (s: State) => s.comets,
    target: 25,
  },
  {
    name: "A mind without limits",
    detail: "Learn 12 research upgrades in one expedition.",
    reward: 12,
    value: (s: State) => s.bestResearch,
    target: 12,
  },
  {
    name: "At the origin of everything",
    detail: "Reach Genesis Beyond, the eighth world.",
    reward: 25,
    value: (s: State) => s.bestWorld + 1,
    target: 8,
  },
  {
    name: "The final theorem",
    detail: "Learn all 18 research upgrades in one expedition.",
    reward: 25,
    value: (s: State) => s.bestResearch,
    target: 18,
  },
];
export function claimChallenge(s: State, i: number) {
  const c = challenges[i];
  if (!c || s.claimed.includes(i) || c.value(s) < c.target) return false;
  s.claimed.push(i);
  s.echoes += c.reward;
  return true;
}
export const production = (s: State) =>
  units.reduce(
    (n, u, i) =>
      n +
      u.rate *
        s.counts[i] *
        (i === 0 && s.upgrades.includes(6) ? 10 : 1) *
        (i >= 6 && s.upgrades.includes(12) ? 3 : 1),
    0,
  ) *
  [
    [1, 2],
    [3, 2],
    [5, 3],
    [7, 2],
    [11, 3],
    [15, 4],
    [17, 5],
  ].reduce((m, [i, b]) => m * (s.upgrades.includes(i) ? b : 1), 1) *
  worlds[s.world].multiplier *
  (1 + s.shards * 0.15) *
  (1 + s.relics[1] * 0.25) *
  (s.relics[7] ? 2 : 1);
export const boostMultiplier = (s: State) => (s.upgrades.includes(14) ? 5 : 3);
export const activeProduction = (s: State, now = Date.now()) =>
  production(s) * (now < s.boostUntil ? boostMultiplier(s) : 1);
export const clickPower = (s: State) =>
  ((s.upgrades.includes(0) ? 3 : 1) *
    (s.upgrades.includes(4) ? 5 : 1) *
    (s.upgrades.includes(10) ? 10 : 1) *
    worlds[s.world].multiplier *
    (1 + s.shards * 0.15) +
    production(s) *
      ((s.upgrades.includes(2) ? 0.05 : 0) +
        (s.upgrades.includes(13) ? 0.1 : 0))) *
  (1 + s.relics[2]);
export const price = (s: State, i: number, qty = 1) =>
  Math.ceil(
    ((units[i].base * 1.15 ** s.counts[i] * (1.15 ** qty - 1)) / 0.15) *
      (1 - s.relics[3] * 0.1),
  );
export function gain(s: State, n: number) {
  if (Number.isFinite(n) && n > 0 && Number.isFinite(s.lifetime + n)) {
    s.energy += n;
    s.earned += n;
    s.lifetime += n;
  }
}
export function buy(s: State, i: number, qty: number) {
  if (!units[i] || !Number.isInteger(qty) || qty < 1 || qty > 100) return false;
  const cost = price(s, i, qty);
  if (!Number.isFinite(cost) || s.energy < cost) return false;
  s.energy -= cost;
  s.counts[i] += qty;
  recordMilestones(s);
  return true;
}
export function harvest(s: State, now = Date.now()) {
  const n = clickPower(s) * (now < s.boostUntil ? boostMultiplier(s) : 1);
  gain(s, n);
  s.clicks++;
  s.totalClicks++;
  if (now >= s.boostUntil)
    s.charge = Math.min(100, s.charge + (s.upgrades.includes(16) ? 4 : 2));
  return n;
}
export function activateBoost(s: State, now = Date.now()) {
  if (s.charge < 100 || s.boostUntil > now) return false;
  s.charge = 0;
  s.boostUntil =
    now + (20 + (s.upgrades.includes(8) ? 10 : 0) + s.relics[5] * 5) * 1000;
  return true;
}
export const cometAvailable = (s: State, now = Date.now()) =>
  now >= s.nextComet && now < s.nextComet + 15000;
export function catchComet(s: State, now = Date.now()) {
  if (!cometAvailable(s, now)) return 0;
  const n =
    Math.max(25, production(s) * 30, clickPower(s) * 20) *
    (s.upgrades.includes(9) ? 2 : 1) *
    (1 + s.relics[4] * 0.5);
  gain(s, n);
  s.comets++;
  s.charge = Math.min(100, s.charge + 20);
  s.nextComet = now + 60000;
  return n;
}
// Integrate only the actual boosted interval, including across browser suspension.
export function advance(s: State, from: number, to: number) {
  const end = Math.max(from, to),
    start = Math.max(from, end - 8 * 3600000);
  const boosted = Math.max(0, Math.min(end, s.boostUntil) - start);
  const earned =
    (production(s) * (end - start + (boostMultiplier(s) - 1) * boosted)) / 1000;
  gain(s, earned);
  if (end >= s.nextComet + 15000) s.nextComet = end + 45000;
  return earned;
}
export const ascensionReward = (s: State) =>
  Math.floor(Math.sqrt(s.earned / 100000));
export const echoReward = (s: State) =>
  s.earned < 1e6
    ? 0
    : Math.floor(
        (Math.floor(Math.log10(s.earned / 1e6)) +
          1 +
          Math.max(0, s.world - 2)) *
          (s.relics[7] ? 1.5 : 1),
      );
export function ascend(s: State): State {
  if (ascensionReward(s) < 1) return s;
  recordMilestones(s);
  const next = {
    ...fresh(),
    shards: s.shards + ascensionReward(s),
    echoes: s.echoes + echoReward(s),
    relics: [...s.relics],
    claimed: [...s.claimed],
    bestWorld: s.bestWorld,
    bestResearch: s.bestResearch,
    bestStructures: s.bestStructures,
    totalClicks: s.totalClicks,
    comets: s.comets,
    lifetime: s.lifetime,
    ascensions: s.ascensions + 1,
    sound: s.sound,
  };
  next.counts[0] = next.relics[0] * 5;
  if (next.relics[6]) next.upgrades = [0, 1, 2];
  recordMilestones(next);
  return next;
}
// Accept the original six-structure save without discarding the player's progress.
export function parseSave(value: unknown): State | null {
  if (!value || typeof value !== "object") return null;
  const s = value as Record<string, unknown>;
  const numbers = [
    "energy",
    "earned",
    "lifetime",
    "clicks",
    "shards",
    "ascensions",
    "savedAt",
  ];
  if (
    numbers.some(
      (k) =>
        typeof s[k] !== "number" || !Number.isFinite(s[k]) || Number(s[k]) < 0,
    )
  )
    return null;
  const integer = (n: unknown) => Number.isSafeInteger(n) && Number(n) >= 0;
  const ids = (v: unknown, max: number) =>
    Array.isArray(v) &&
    v.every((n) => integer(n) && Number(n) < max) &&
    new Set(v).size === v.length;
  if (
    !Array.isArray(s.counts) ||
    ![6, units.length].includes(s.counts.length) ||
    !s.counts.every(integer) ||
    !ids(s.upgrades, research.length) ||
    !integer(s.world) ||
    Number(s.world) >= worlds.length
  )
    return null;
  for (const k of [
    "echoes",
    "bestWorld",
    "bestResearch",
    "bestStructures",
    "totalClicks",
    "comets",
    "charge",
    "boostUntil",
    "nextComet",
  ])
    if (s[k] !== undefined && !integer(s[k])) return null;
  if (
    s.relics !== undefined &&
    (!Array.isArray(s.relics) ||
      s.relics.length !== relics.length ||
      !s.relics.every((n, i) => integer(n) && n <= relics[i].max))
  )
    return null;
  if (s.claimed !== undefined && !ids(s.claimed, challenges.length))
    return null;
  const result = {
    ...fresh(),
    ...s,
    counts: [...s.counts, ...Array(units.length - s.counts.length).fill(0)],
    upgrades: [...(s.upgrades as number[])],
    sound: s.sound === true,
  } as State;
  if (
    result.bestWorld >= worlds.length ||
    result.bestResearch > research.length ||
    result.charge > 100
  )
    return null;
  result.totalClicks = Math.max(result.totalClicks, result.clicks);
  recordMilestones(result);
  return result;
}
export function load(): State {
  try {
    return (
      parseSave(
        JSON.parse(localStorage.getItem("aether-forge-v1") ?? "null"),
      ) ?? fresh()
    );
  } catch {
    return fresh();
  }
}
export function save(s: State) {
  s.savedAt = Date.now();
  try {
    localStorage.setItem("aether-forge-v1", JSON.stringify(s));
    return true;
  } catch {
    return false;
  }
}
export function format(n: number) {
  if (n < 1000)
    return n.toLocaleString("en-US", { maximumFractionDigits: n < 10 ? 1 : 0 });
  const suffix = ["K", "M", "B", "T", "Qa", "Qi"];
  let i = -1;
  while (n >= 1000 && i < suffix.length - 1) {
    n /= 1000;
    i++;
  }
  return n.toFixed(n < 10 ? 2 : n < 100 ? 1 : 0) + suffix[i];
}
