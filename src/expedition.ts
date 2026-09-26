import {
  roles,
  trials,
  artifacts,
  automationUnlocked,
  format,
  type State,
} from "./game";
export function expeditionMarkup(s: State) {
  return (
    `<div class="legacy-explainer"><strong>Choose how this expedition unfolds</strong><p>Pick one specialization per run. Ascending or starting a trial lets you choose again. Equip up to three artifacts; their bonuses apply in normal expeditions.</p></div><h3 class="list-heading">SPECIALIZATION · ${s.role < 0 ? "CHOOSE ONE" : roles[s.role].name.toUpperCase()}</h3>` +
    roles
      .map(
        (r, i) =>
          `<button class="item" data-role="${i}" ${s.role >= 0 ? "disabled" : ""}><span class="item-icon">${["⚙", "✦", "ϟ"][i]}</span><span class="item-content"><span class="item-title">${r.name}</span><span class="item-description">${r.detail}</span></span><span class="item-price">${s.role === i ? "✓ Active" : "Choose"}</span></button>`,
      )
      .join("") +
    `<h3 class="list-heading">AUTOMATION</h3><div class="legacy-explainer"><strong>${automationUnlocked(s) ? "Orbital logistics online" : "Unlock with your first ascension"}</strong><p>While the game is visible, buy up to 10 structures each second. The budget caps spending from the balance at the start of each tick. No offline purchases.</p><label class="setting-row">Auto-buy structures<input id="auto-enabled" type="checkbox" ${s.autoEnabled ? "checked" : ""} ${automationUnlocked(s) ? "" : "disabled"}></label><label class="setting-row">Priority<select id="auto-policy"><option value="efficient" ${s.autoPolicy === "efficient" ? "selected" : ""}>Best output per cost</option><option value="cheapest" ${s.autoPolicy === "cheapest" ? "selected" : ""}>Cheapest first</option></select></label><label class="setting-row">Spend at most per tick<select id="auto-budget">${[10, 25, 50].map((n) => `<option value="${n}" ${s.autoBudget === n ? "selected" : ""}>${n}% of reserve</option>`).join("")}</select></label></div><h3 class="list-heading">ARTIFACT LOADOUT · ${s.artifacts.length}/3</h3>` +
    artifacts
      .map(
        (a, i) =>
          `<button class="item" data-artifact="${i}" ${!a.unlocked(s) || (!s.artifacts.includes(i) && s.artifacts.length >= 3) ? "disabled" : ""}><span class="item-icon">◈</span><span class="item-content"><span class="item-title">${a.name}</span><span class="item-description">${a.detail}</span><span class="item-rate">${a.unlocked(s) ? "DISCOVERED" : a.gate}</span></span><span class="item-price">${s.artifacts.includes(i) ? "✓ Equipped" : "Equip"}</span></button>`,
      )
      .join("") +
    `<h3 class="list-heading">CHALLENGE EXPEDITIONS</h3><div class="legacy-explainer"><p>Starting a trial resets this expedition without ascension rewards. Stardust power, relic effects, artifacts, and starter gifts are suspended; specializations remain available. Your permanent inventory is safe. Completing or abandoning returns you to a fresh normal run. Rewards can be claimed once per trial.</p></div>` +
    trials
      .map(
        (t, i) =>
          `<div class="trial-card"><strong>${t.name} ${s.completedTrials.includes(i) ? "✓" : ""}</strong><p>${t.detail}</p><p>${t.reward} Echoes + artifact discovery + legendary relic unlock</p><p id="trial-progress-${i}">${s.trial === i ? format(s.earned) + " / " + format(t.target) : ""}</p><button class="primary" data-trial="${i}" ${s.ascensions < 1 || s.trial >= 0 ? "disabled" : ""}>${s.ascensions < 1 ? "Ascend once to unlock" : "Begin trial"}</button>${s.trial === i ? `<button class="primary" id="finish-trial" ${s.earned < t.target ? "disabled" : ""}>Complete trial</button><button class="secondary" id="abandon-trial">Abandon and restart</button>` : ""}</div>`,
      )
      .join("")
  );
}
